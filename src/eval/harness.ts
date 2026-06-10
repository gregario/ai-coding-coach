import { readFile } from "node:fs/promises";
import { parseTranscript } from "../parser/claude-code.js";
import { scoreSession } from "../scoring/engine.js";
import type { ScoringOptions } from "../scoring/engine.js";
import type { SessionScore } from "../scoring/rubric.js";
import { SCORING_AXES } from "../scoring/rubric.js";
import pLimit from "p-limit";

export interface EvalRun {
  transcriptPath: string;
  runIndex: number;
  score: SessionScore;
  durationMs: number;
  error?: string;
}

export interface TranscriptResult {
  path: string;
  runs: EvalRun[];
  axisStats: Map<string, AxisStats>;
  overallStats: AxisStats;
}

export interface AxisStats {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;
}

export interface EvalReport {
  results: TranscriptResult[];
  aggregateStability: Map<string, AxisStats>;
  passesStabilityThreshold: boolean;
  floorCeilingProblems: string[];
  totalCost: { runs: number; transcripts: number };
  durationMs: number;
}

export interface HarnessOptions {
  transcriptPaths: string[];
  runsPerTranscript?: number;
  concurrency?: number;
  scoringOptions?: ScoringOptions;
  stabilityThreshold?: number;
}

function computeStats(values: number[]): AxisStats {
  if (values.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0, range: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { mean, stdDev, min, max, range: max - min };
}

export { computeStats };

export async function runEvalHarness(options: HarnessOptions): Promise<EvalReport> {
  const {
    transcriptPaths,
    runsPerTranscript = 3,
    concurrency = 3,
    scoringOptions = {},
    stabilityThreshold = 1.5,
  } = options;

  const startTime = Date.now();
  const limit = pLimit(concurrency);
  const results: TranscriptResult[] = [];

  for (const path of transcriptPaths) {
    const runs: EvalRun[] = [];

    const tasks = Array.from({ length: runsPerTranscript }, (_, runIndex) =>
      limit(async () => {
        const runStart = Date.now();
        try {
          const session = await parseTranscript(path);
          const { score } = await scoreSession(session, scoringOptions);
          runs.push({
            transcriptPath: path,
            runIndex,
            score,
            durationMs: Date.now() - runStart,
          });
        } catch (e) {
          runs.push({
            transcriptPath: path,
            runIndex,
            score: null as unknown as SessionScore,
            durationMs: Date.now() - runStart,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      })
    );

    await Promise.all(tasks);

    const successfulRuns = runs.filter((r) => !r.error);
    const axisStats = new Map<string, AxisStats>();

    for (const axis of SCORING_AXES) {
      const scores = successfulRuns.map(
        (r) => r.score.axes.find((a) => a.axis === axis.key)?.score ?? 0
      );
      axisStats.set(axis.key, computeStats(scores));
    }

    const overallScores = successfulRuns.map((r) => r.score.overallScore);
    const overallStats = computeStats(overallScores);

    results.push({ path, runs, axisStats, overallStats });

    const shortName = path.split("/").pop()?.slice(0, 8) || path;
    console.error(
      `  [${results.length}/${transcriptPaths.length}] ${shortName}... ` +
        `overall=${overallStats.mean.toFixed(1)}±${overallStats.stdDev.toFixed(2)} ` +
        `(${successfulRuns.length}/${runsPerTranscript} runs ok)`
    );
  }

  const aggregateStability = new Map<string, AxisStats>();
  for (const axis of SCORING_AXES) {
    const allStdDevs = results
      .map((r) => r.axisStats.get(axis.key)?.stdDev ?? 0)
      .filter((sd) => sd > 0);
    aggregateStability.set(axis.key, computeStats(allStdDevs));
  }

  const floorCeilingProblems: string[] = [];
  for (const axis of SCORING_AXES) {
    const allMeans = results.map((r) => r.axisStats.get(axis.key)?.mean ?? 5);
    const axisMean = allMeans.reduce((a, b) => a + b, 0) / allMeans.length;
    if (axisMean <= 1.5) {
      floorCeilingProblems.push(`${axis.key}: floor problem (mean ${axisMean.toFixed(1)} across all transcripts)`);
    }
    if (axisMean >= 9.5) {
      floorCeilingProblems.push(`${axis.key}: ceiling problem (mean ${axisMean.toFixed(1)} across all transcripts)`);
    }
  }

  const CLASSIFICATION_AXES = new Set(["yegge_level"]);
  const scorableAxes = SCORING_AXES.filter((a) => !CLASSIFICATION_AXES.has(a.key));
  const maxStdDevPerAxis = scorableAxes.map((axis) => {
    const stdDevs = results.map((r) => r.axisStats.get(axis.key)?.stdDev ?? 0);
    return Math.max(...stdDevs);
  });
  const passesStabilityThreshold = maxStdDevPerAxis.every((sd) => sd < stabilityThreshold);

  return {
    results,
    aggregateStability,
    passesStabilityThreshold,
    floorCeilingProblems,
    totalCost: {
      runs: results.reduce((sum, r) => sum + r.runs.length, 0),
      transcripts: results.length,
    },
    durationMs: Date.now() - startTime,
  };
}

export function formatReport(report: EvalReport): string {
  const lines: string[] = [];

  lines.push("# Eval Harness Report");
  lines.push("");
  lines.push(`Transcripts: ${report.totalCost.transcripts}`);
  lines.push(`Total runs: ${report.totalCost.runs}`);
  lines.push(`Duration: ${(report.durationMs / 1000).toFixed(1)}s`);
  lines.push(`Stability threshold: passed=${report.passesStabilityThreshold}`);
  lines.push("");

  if (report.floorCeilingProblems.length > 0) {
    lines.push("## Floor/Ceiling Problems");
    for (const problem of report.floorCeilingProblems) {
      lines.push(`  ⚠️  ${problem}`);
    }
    lines.push("");
  }

  lines.push("## Per-Axis Stability (max std dev across transcripts)");
  lines.push("");
  lines.push("| Axis | Max StdDev | Mean of Means | Status |");
  lines.push("|------|-----------|---------------|--------|");

  const CLASSIFICATION_AXES = new Set(["yegge_level"]);
  for (const axis of SCORING_AXES) {
    const stdDevs = report.results.map((r) => r.axisStats.get(axis.key)?.stdDev ?? 0);
    const maxSd = Math.max(...stdDevs);
    const means = report.results.map((r) => r.axisStats.get(axis.key)?.mean ?? 0);
    const meanOfMeans = means.reduce((a, b) => a + b, 0) / means.length;
    const isClassification = CLASSIFICATION_AXES.has(axis.key);
    const status = isClassification ? "ℹ️" : maxSd < 1.5 ? "✅" : "❌";
    lines.push(
      `| ${axis.name} | ${maxSd.toFixed(2)} | ${meanOfMeans.toFixed(1)} | ${status} |`
    );
  }

  lines.push("");
  lines.push("## Per-Transcript Summary");
  lines.push("");
  lines.push("| Transcript | Overall | StdDev | Yegge |");
  lines.push("|-----------|---------|--------|-------|");

  for (const result of report.results) {
    const shortName = result.path.split("/").pop()?.slice(0, 12) || "";
    const successRuns = result.runs.filter((r) => !r.error);
    const yegges = successRuns.map((r) => r.score.yeggeLevel);
    const yMean = yegges.length > 0 ? yegges.reduce((a, b) => a + b, 0) / yegges.length : 0;
    lines.push(
      `| ${shortName}... | ${result.overallStats.mean.toFixed(1)} | ${result.overallStats.stdDev.toFixed(2)} | L${yMean.toFixed(0)} |`
    );
  }

  return lines.join("\n");
}
