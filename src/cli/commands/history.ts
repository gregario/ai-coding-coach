import { openDb, getHistory } from "../../db/store.js";

interface HistoryOpts {
  limit?: string;
  db?: string;
}

export async function historyCommand(opts: HistoryOpts) {
  const limit = opts.limit ? parseInt(opts.limit, 10) : 20;
  const db = openDb(opts.db);
  const scores = getHistory(db, limit);
  db.close();

  if (scores.length === 0) {
    console.log("No scores yet. Run `ai-coding-coach score` to score a session.");
    return;
  }

  const header = `${"#".padEnd(4)} ${"Date".padEnd(12)} ${"Score".padEnd(7)} ${"Yegge".padEnd(6)} ${"Provider".padEnd(12)} Session`;
  console.log(header);
  console.log("─".repeat(header.length));

  for (const s of scores) {
    const date = s.scoredAt.slice(0, 10);
    const row = `${String(s.id).padEnd(4)} ${date.padEnd(12)} ${String(s.overallScore + "/10").padEnd(7)} ${("L" + s.yeggeLevel).padEnd(6)} ${s.provider.padEnd(12)} ${s.sessionId.slice(0, 8)}`;
    console.log(row);
  }

  console.log(`\n${scores.length} sessions scored. Average: ${(scores.reduce((a, s) => a + s.overallScore, 0) / scores.length).toFixed(1)}/10`);
}
