import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runEvalHarness, formatReport } from "../../eval/harness.js";
import { saveBaseline, buildBaselineFromRuns } from "../../eval/baseline.js";
import type { Baseline } from "../../eval/baseline.js";
import type { ProviderName } from "../../scoring/providers/resolve.js";
import { SCORING_AXES } from "../../scoring/rubric.js";

interface EvalArgs {
  provider?: string;
  manifest?: string;
  runs?: string;
  concurrency?: string;
  "save-baseline"?: boolean;
  "baseline-path"?: string;
}

export async function evalCommand(args: EvalArgs) {
  const manifestPath = args.manifest || resolve(process.cwd(), "eval-manifest.json");
  const runsPerTranscript = parseInt(args.runs || "3", 10);
  const concurrency = parseInt(args.concurrency || "3", 10);
  const provider = args.provider as ProviderName | undefined;

  let transcriptPaths: string[];
  try {
    const raw = await readFile(manifestPath, "utf-8");
    transcriptPaths = JSON.parse(raw) as string[];
  } catch {
    console.error(`Could not read manifest at ${manifestPath}`);
    console.error("Create eval-manifest.json with an array of transcript file paths.");
    process.exit(1);
  }

  console.error(`Eval harness starting:`);
  console.error(`  Transcripts: ${transcriptPaths.length}`);
  console.error(`  Runs/transcript: ${runsPerTranscript}`);
  console.error(`  Concurrency: ${concurrency}`);
  console.error(`  Provider: ${provider || "auto-detect"}`);
  console.error("");

  const report = await runEvalHarness({
    transcriptPaths,
    runsPerTranscript,
    concurrency,
    scoringOptions: provider ? { provider } : {},
    stabilityThreshold: 1.5,
  });

  console.log(formatReport(report));

  if (report.passesStabilityThreshold) {
    console.error("\n✅ All axes pass stability threshold (std dev < 1.5)");
  } else {
    console.error("\n❌ Some axes exceed stability threshold (std dev >= 1.5)");
  }

  if (args["save-baseline"]) {
    const baselinePath = args["baseline-path"] || resolve(process.cwd(), "eval-baseline.json");
    const baseline: Baseline = { version: "1.0.0", entries: [] };

    for (const result of report.results) {
      const successRuns = result.runs.filter((r) => !r.error);
      if (successRuns.length === 0) continue;

      const overalls = successRuns.map((r) => r.score.overallScore);
      const yegges = successRuns.map((r) => r.score.yeggeLevel);
      const axisScores = new Map<string, number[]>();

      for (const axis of SCORING_AXES) {
        axisScores.set(
          axis.key,
          successRuns.map((r) => r.score.axes.find((a) => a.axis === axis.key)?.score ?? 5)
        );
      }

      baseline.entries.push(buildBaselineFromRuns(result.path, overalls, yegges, axisScores));
    }

    await saveBaseline(baselinePath, baseline);
    console.error(`\nBaseline saved to ${baselinePath}`);
  }

  process.exit(report.passesStabilityThreshold ? 0 : 1);
}
