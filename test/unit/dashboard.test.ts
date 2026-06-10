import { describe, it, expect } from "vitest";
import { openDb, saveScore, getHistory } from "../../src/db/store.js";
import type { SessionScore } from "../../src/scoring/rubric.js";

function makeScore(overall: number): SessionScore {
  return {
    rubricVersion: "0.1.0",
    overallScore: overall,
    yeggeLevel: 4,
    summary: "Test summary",
    topSuggestions: ["Suggestion 1", "Suggestion 2"],
    axes: [
      { axis: "task_decomposition", score: overall, confidence: "high", suggestion: "s", evidence: "e" },
      { axis: "context_discipline", score: overall, confidence: "high", suggestion: "s", evidence: "e" },
      { axis: "verification_behaviour", score: 5, confidence: "high", suggestion: "s", evidence: "e" },
      { axis: "evidence_seeking", score: 6, confidence: "medium", suggestion: "s", evidence: "e" },
      { axis: "plan_before_code", score: 7, confidence: "medium", suggestion: "s", evidence: "e" },
      { axis: "trust_calibration", score: 7, confidence: "medium", suggestion: "s", evidence: "e" },
      { axis: "session_hygiene", score: 8, confidence: "high", suggestion: "s", evidence: "e" },
      { axis: "yegge_level", score: 4, confidence: "high", suggestion: "s", evidence: "e" },
    ],
  };
}

describe("dashboard HTML generation", () => {
  it("getHistory provides data sufficient for dashboard rendering", () => {
    const db = openDb(":memory:");
    saveScore(db, makeScore(6), "s1", "bedrock");
    saveScore(db, makeScore(8), "s2", "anthropic");

    const scores = getHistory(db, 50);
    db.close();

    expect(scores.length).toBe(2);
    expect(scores[0].axes).toHaveLength(8);
    expect(scores[0].topSuggestions).toHaveLength(2);
    expect(scores[0].scoredAt).toBeTruthy();
  });
});
