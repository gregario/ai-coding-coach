import Database from "better-sqlite3";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import type { SessionScore } from "../scoring/rubric.js";

export interface StoredScore {
  id: number;
  sessionId: string;
  scoredAt: string;
  provider: string;
  rubricVersion: string;
  overallScore: number;
  yeggeLevel: number;
  summary: string;
  axes: SessionScore["axes"];
  topSuggestions: string[];
  transcriptPath: string | null;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  scored_at TEXT NOT NULL DEFAULT (datetime('now')),
  provider TEXT NOT NULL,
  rubric_version TEXT NOT NULL,
  overall_score REAL NOT NULL,
  yegge_level INTEGER NOT NULL,
  summary TEXT NOT NULL,
  axes_json TEXT NOT NULL,
  top_suggestions_json TEXT NOT NULL,
  transcript_path TEXT
);

CREATE INDEX IF NOT EXISTS idx_scores_session_id ON scores(session_id);
CREATE INDEX IF NOT EXISTS idx_scores_scored_at ON scores(scored_at);
`;

export function defaultDbPath(): string {
  const dir = join(homedir(), ".ai-coding-coach");
  mkdirSync(dir, { recursive: true });
  return join(dir, "scores.db");
}

export function openDb(path?: string): Database.Database {
  const db = new Database(path ?? defaultDbPath());
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  return db;
}

export function saveScore(
  db: Database.Database,
  score: SessionScore,
  sessionId: string,
  provider: string,
  transcriptPath?: string
): number {
  const stmt = db.prepare(`
    INSERT INTO scores (session_id, provider, rubric_version, overall_score, yegge_level, summary, axes_json, top_suggestions_json, transcript_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    sessionId,
    provider,
    score.rubricVersion,
    score.overallScore,
    score.yeggeLevel,
    score.summary,
    JSON.stringify(score.axes),
    JSON.stringify(score.topSuggestions),
    transcriptPath ?? null
  );
  return Number(result.lastInsertRowid);
}

export function getHistory(
  db: Database.Database,
  limit = 50
): StoredScore[] {
  const rows = db
    .prepare(
      `SELECT * FROM scores ORDER BY scored_at DESC LIMIT ?`
    )
    .all(limit) as any[];

  return rows.map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    scoredAt: r.scored_at,
    provider: r.provider,
    rubricVersion: r.rubric_version,
    overallScore: r.overall_score,
    yeggeLevel: r.yegge_level,
    summary: r.summary,
    axes: JSON.parse(r.axes_json),
    topSuggestions: JSON.parse(r.top_suggestions_json),
    transcriptPath: r.transcript_path,
  }));
}

export function getScoreById(
  db: Database.Database,
  id: number
): StoredScore | null {
  const r = db.prepare(`SELECT * FROM scores WHERE id = ?`).get(id) as any;
  if (!r) return null;
  return {
    id: r.id,
    sessionId: r.session_id,
    scoredAt: r.scored_at,
    provider: r.provider,
    rubricVersion: r.rubric_version,
    overallScore: r.overall_score,
    yeggeLevel: r.yegge_level,
    summary: r.summary,
    axes: JSON.parse(r.axes_json),
    topSuggestions: JSON.parse(r.top_suggestions_json),
    transcriptPath: r.transcript_path,
  };
}
