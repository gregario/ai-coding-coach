import { describe, it, expect } from "vitest";
import { computeStats } from "../../src/eval/harness.js";
import {
  buildBaselineFromRuns,
  checkAgainstBaseline,
} from "../../src/eval/baseline.js";

describe("computeStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeStats([]);
    expect(stats.mean).toBe(0);
    expect(stats.stdDev).toBe(0);
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(0);
  });

  it("handles single value", () => {
    const stats = computeStats([7]);
    expect(stats.mean).toBe(7);
    expect(stats.stdDev).toBe(0);
    expect(stats.min).toBe(7);
    expect(stats.max).toBe(7);
    expect(stats.range).toBe(0);
  });

  it("computes correct stats for known values", () => {
    const stats = computeStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(stats.mean).toBe(5);
    expect(stats.stdDev).toBeCloseTo(2, 0);
    expect(stats.min).toBe(2);
    expect(stats.max).toBe(9);
    expect(stats.range).toBe(7);
  });

  it("computes low std dev for stable scores", () => {
    const stats = computeStats([7, 7, 7, 8, 7]);
    expect(stats.stdDev).toBeLessThan(0.5);
  });

  it("computes high std dev for unstable scores", () => {
    const stats = computeStats([1, 10, 1, 10, 1]);
    expect(stats.stdDev).toBeGreaterThan(4);
  });
});

describe("buildBaselineFromRuns", () => {
  it("builds a baseline entry with correct ranges", () => {
    const axisScores = new Map<string, number[]>();
    axisScores.set("task_decomposition", [7, 8, 7]);
    axisScores.set("context_discipline", [5, 6, 5]);

    const entry = buildBaselineFromRuns(
      "/path/to/transcript.jsonl",
      [7.5, 8.0, 7.8],
      [5, 6, 5],
      axisScores
    );

    expect(entry.transcriptPath).toBe("/path/to/transcript.jsonl");
    expect(entry.expectedOverall.min).toBe(7);
    expect(entry.expectedOverall.max).toBe(8.5);
    expect(entry.expectedYegge.min).toBe(5);
    expect(entry.expectedYegge.max).toBe(6);
    expect(entry.axisRanges.task_decomposition.min).toBe(6.5);
    expect(entry.axisRanges.task_decomposition.max).toBe(8.5);
  });
});

describe("checkAgainstBaseline", () => {
  const entry = {
    transcriptPath: "/test.jsonl",
    expectedOverall: { min: 6, max: 9 },
    expectedYegge: { min: 4, max: 6 },
    axisRanges: {
      task_decomposition: { min: 5, max: 8 },
      context_discipline: { min: 4, max: 7 },
    },
    lastUpdated: "2026-06-10T00:00:00Z",
  };

  it("passes when all scores within range", () => {
    const result = checkAgainstBaseline(entry, 7.5, 5, {
      task_decomposition: 6,
      context_discipline: 5,
    });
    expect(result.pass).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("fails when overall score out of range", () => {
    const result = checkAgainstBaseline(entry, 10, 5, {
      task_decomposition: 6,
      context_discipline: 5,
    });
    expect(result.pass).toBe(false);
    expect(result.violations[0]).toContain("overall");
  });

  it("fails when yegge level out of range", () => {
    const result = checkAgainstBaseline(entry, 7, 8, {
      task_decomposition: 6,
      context_discipline: 5,
    });
    expect(result.pass).toBe(false);
    expect(result.violations[0]).toContain("yegge");
  });

  it("fails when axis score out of range", () => {
    const result = checkAgainstBaseline(entry, 7, 5, {
      task_decomposition: 10,
      context_discipline: 5,
    });
    expect(result.pass).toBe(false);
    expect(result.violations[0]).toContain("task_decomposition");
  });

  it("reports multiple violations", () => {
    const result = checkAgainstBaseline(entry, 1, 1, {
      task_decomposition: 1,
      context_discipline: 1,
    });
    expect(result.pass).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(3);
  });
});
