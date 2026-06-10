import type { Hono } from "hono";
import type Database from "better-sqlite3";
import { SCORING_AXES } from "../scoring/rubric.js";

export function registerApi(app: Hono, db: Database.Database) {
  app.get("/api/latest", (c) => {
    const row = db
      .prepare("SELECT * FROM scores ORDER BY scored_at DESC LIMIT 1")
      .get() as any;
    if (!row) return c.json({ session: null });
    return c.json({ session: rowToSession(row) });
  });

  app.get("/api/sessions", (c) => {
    const limit = parseInt(c.req.query("limit") ?? "50", 10);
    const offset = parseInt(c.req.query("offset") ?? "0", 10);
    const rows = db
      .prepare("SELECT * FROM scores ORDER BY scored_at DESC LIMIT ? OFFSET ?")
      .all(limit, offset) as any[];
    const total = (
      db.prepare("SELECT COUNT(*) as count FROM scores").get() as any
    ).count;
    return c.json({
      sessions: rows.map(rowToSession),
      total,
      limit,
      offset,
    });
  });

  app.get("/api/session/:id", (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const row = db.prepare("SELECT * FROM scores WHERE id = ?").get(id) as any;
    if (!row) return c.json({ error: "Not found" }, 404);

    const prev = db
      .prepare("SELECT * FROM scores WHERE scored_at < ? ORDER BY scored_at DESC LIMIT 1")
      .get(row.scored_at) as any;

    return c.json({
      session: rowToSession(row),
      previous: prev ? rowToSession(prev) : null,
    });
  });

  app.get("/api/axes", (c) => {
    return c.json({
      axes: SCORING_AXES.filter((a) => a.key !== "yegge_level").map((a) => ({
        key: a.key,
        name: a.name,
        description: a.description,
        antiPattern: a.antiPattern,
        signals: a.signals,
      })),
    });
  });

  app.get("/api/axis/:key", (c) => {
    const key = c.req.param("key");
    const axisMeta = SCORING_AXES.find((a) => a.key === key);
    if (!axisMeta) return c.json({ error: "Unknown axis" }, 404);

    const rows = db
      .prepare("SELECT id, scored_at, axes_json FROM scores ORDER BY scored_at ASC")
      .all() as any[];

    const trend = rows.map((row) => {
      const axes = JSON.parse(row.axes_json);
      const axis = axes.find((a: any) => a.axis === key);
      return {
        sessionId: row.id,
        date: row.scored_at,
        score: axis?.score ?? null,
        suggestion: axis?.suggestion ?? null,
        evidence: axis?.evidence ?? null,
        confidence: axis?.confidence ?? null,
      };
    });

    return c.json({
      axis: {
        key: axisMeta.key,
        name: axisMeta.name,
        description: axisMeta.description,
        antiPattern: axisMeta.antiPattern,
        signals: axisMeta.signals,
      },
      trend,
    });
  });

  app.get("/api/stats", (c) => {
    const stats = db
      .prepare(
        `SELECT COUNT(*) as total, AVG(overall_score) as avg,
         MAX(overall_score) as best, MIN(scored_at) as firstSession,
         MAX(scored_at) as lastSession FROM scores`
      )
      .get() as any;
    return c.json({
      total: stats.total,
      avg: stats.avg ? Math.round(stats.avg * 10) / 10 : null,
      best: stats.best,
      firstSession: stats.firstSession,
      lastSession: stats.lastSession,
    });
  });
}

function rowToSession(r: any) {
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
