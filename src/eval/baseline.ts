import { readFile, writeFile } from "node:fs/promises";

export interface BaselineEntry {
  transcriptPath: string;
  expectedOverall: { min: number; max: number };
  expectedYegge: { min: number; max: number };
  axisRanges: Record<string, { min: number; max: number }>;
  lastUpdated: string;
}

export interface Baseline {
  version: string;
  entries: BaselineEntry[];
}

export async function loadBaseline(path: string): Promise<Baseline> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as Baseline;
}

export async function saveBaseline(path: string, baseline: Baseline): Promise<void> {
  await writeFile(path, JSON.stringify(baseline, null, 2) + "\n", "utf-8");
}

export function buildBaselineFromRuns(
  transcriptPath: string,
  overallScores: number[],
  yegges: number[],
  axisScores: Map<string, number[]>
): BaselineEntry {
  const pad = 0.5;
  return {
    transcriptPath,
    expectedOverall: {
      min: Math.min(...overallScores) - pad,
      max: Math.max(...overallScores) + pad,
    },
    expectedYegge: {
      min: Math.min(...yegges),
      max: Math.max(...yegges),
    },
    axisRanges: Object.fromEntries(
      [...axisScores.entries()].map(([key, scores]) => [
        key,
        { min: Math.min(...scores) - pad, max: Math.max(...scores) + pad },
      ])
    ),
    lastUpdated: new Date().toISOString(),
  };
}

export function checkAgainstBaseline(
  entry: BaselineEntry,
  overallScore: number,
  yegge: number,
  axes: Record<string, number>
): { pass: boolean; violations: string[] } {
  const violations: string[] = [];

  if (overallScore < entry.expectedOverall.min || overallScore > entry.expectedOverall.max) {
    violations.push(
      `overall ${overallScore} outside [${entry.expectedOverall.min}, ${entry.expectedOverall.max}]`
    );
  }

  if (yegge < entry.expectedYegge.min || yegge > entry.expectedYegge.max) {
    violations.push(
      `yegge L${yegge} outside [L${entry.expectedYegge.min}, L${entry.expectedYegge.max}]`
    );
  }

  for (const [axis, range] of Object.entries(entry.axisRanges)) {
    const score = axes[axis];
    if (score !== undefined && (score < range.min || score > range.max)) {
      violations.push(`${axis} ${score} outside [${range.min}, ${range.max}]`);
    }
  }

  return { pass: violations.length === 0, violations };
}
