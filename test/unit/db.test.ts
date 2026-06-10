import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { openDb, saveScore, getHistory, getScoreById } from "../../src/db/store.js";
import type Database from "better-sqlite3";
import type { SessionScore } from "../../src/scoring/rubric.js";

function makeScore(overrides?: Partial<SessionScore>): SessionScore {
  return {
    rubricVersion: "0.1.0",
    overallScore: 7,
    yeggeLevel: 4,
    summary: "Good session with room for verification improvement",
    topSuggestions: ["Add test assertions", "Define success criteria upfront"],
    axes: [
      { axis: "task_decomposition", score: 8, confidence: "high", suggestion: "Keep it up", evidence: "Step-by-step breakdown observed" },
      { axis: "context_discipline", score: 7, confidence: "high", suggestion: "Trim context slightly", evidence: "Mostly targeted" },
      { axis: "verification_behaviour", score: 4, confidence: "high", suggestion: "Verify outputs", evidence: "No tests run" },
      { axis: "evidence_seeking", score: 6, confidence: "medium", suggestion: "Ask for proof", evidence: "Accepted some claims" },
      { axis: "plan_before_code", score: 8, confidence: "medium", suggestion: "Plan documented", evidence: "Design discussed" },
      { axis: "trust_calibration", score: 7, confidence: "medium", suggestion: "Good pushback", evidence: "Questioned 2 suggestions" },
      { axis: "session_hygiene", score: 8, confidence: "high", suggestion: "Clean sessions", evidence: "Fresh context used" },
      { axis: "yegge_level", score: 4, confidence: "high", suggestion: "Move to L5", evidence: "Systematic but not directing" },
    ],
    ...overrides,
  };
}

describe("db/store", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = openDb(":memory:");
  });

  afterEach(() => {
    db.close();
  });

  it("creates schema on open", () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];
    expect(tables.map((t) => t.name)).toContain("scores");
  });

  it("saves and retrieves a score", () => {
    const score = makeScore();
    const id = saveScore(db, score, "session-abc", "bedrock", "/path/to/file.jsonl");
    expect(id).toBe(1);

    const retrieved = getScoreById(db, id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.sessionId).toBe("session-abc");
    expect(retrieved!.provider).toBe("bedrock");
    expect(retrieved!.overallScore).toBe(7);
    expect(retrieved!.yeggeLevel).toBe(4);
    expect(retrieved!.axes).toHaveLength(8);
    expect(retrieved!.topSuggestions).toEqual(["Add test assertions", "Define success criteria upfront"]);
    expect(retrieved!.transcriptPath).toBe("/path/to/file.jsonl");
  });

  it("saves without transcript path", () => {
    const score = makeScore();
    const id = saveScore(db, score, "session-xyz", "anthropic");
    const retrieved = getScoreById(db, id);
    expect(retrieved!.transcriptPath).toBeNull();
  });

  it("getHistory returns scores in reverse chronological order", () => {
    saveScore(db, makeScore({ overallScore: 5 }), "s1", "bedrock");
    saveScore(db, makeScore({ overallScore: 7 }), "s2", "anthropic");
    saveScore(db, makeScore({ overallScore: 9 }), "s3", "claude-cli");

    const history = getHistory(db);
    expect(history).toHaveLength(3);
    expect(history[0].overallScore).toBe(9);
    expect(history[1].overallScore).toBe(7);
    expect(history[2].overallScore).toBe(5);
  });

  it("getHistory respects limit", () => {
    for (let i = 0; i < 10; i++) {
      saveScore(db, makeScore({ overallScore: i }), `s${i}`, "bedrock");
    }
    const history = getHistory(db, 3);
    expect(history).toHaveLength(3);
  });

  it("getScoreById returns null for non-existent id", () => {
    expect(getScoreById(db, 999)).toBeNull();
  });

  it("preserves axis confidence values", () => {
    const score = makeScore();
    const id = saveScore(db, score, "s1", "bedrock");
    const retrieved = getScoreById(db, id);
    const medium = retrieved!.axes.find((a) => a.confidence === "medium");
    expect(medium).toBeDefined();
  });
});
