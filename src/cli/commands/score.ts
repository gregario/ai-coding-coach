import { readFileSync } from "node:fs";
import { parseTranscriptContent } from "../../parser/claude-code.js";
import { scoreSession } from "../../scoring/engine.js";
import { openDb, saveScore } from "../../db/store.js";
import { getMostRecent } from "../discover.js";
import type { ProviderName } from "../../scoring/providers/resolve.js";

interface ScoreOpts {
  provider?: string;
  path?: string;
  project?: string;
  db?: string;
}

export async function scoreCommand(opts: ScoreOpts) {
  let transcriptPath: string;

  if (opts.path) {
    transcriptPath = opts.path;
  } else {
    const recent = getMostRecent(undefined, opts.project);
    if (!recent) {
      console.error("No transcripts found. Use --path to specify one.");
      process.exit(1);
    }
    transcriptPath = recent.path;
    console.error(`Found transcript: ${recent.sessionId} (${recent.project})`);
  }

  const raw = readFileSync(transcriptPath, "utf-8");
  const session = parseTranscriptContent(raw);

  console.error(
    `Parsed ${session.turns.length} turns, ${session.metadata.totalToolUses} tool uses`
  );

  const { score, providerUsed } = await scoreSession(session, {
    provider: opts.provider as ProviderName | undefined,
  });

  const db = openDb(opts.db);
  const id = saveScore(
    db,
    score,
    session.metadata.sessionId,
    providerUsed,
    transcriptPath
  );
  db.close();

  printScore(score, id);
}

function printScore(score: any, id: number) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  AI CODING COACH — Session Score #${id}`);
  console.log(`${"═".repeat(60)}\n`);

  console.log(`  Overall: ${score.overallScore}/10    Yegge Level: L${score.yeggeLevel}\n`);

  console.log("  Axes:");
  for (const axis of score.axes) {
    const bar = "█".repeat(axis.score) + "░".repeat(10 - axis.score);
    const conf = axis.confidence === "high" ? "" : ` (${axis.confidence})`;
    console.log(`    ${bar} ${axis.score}/10  ${axis.axis}${conf}`);
  }

  console.log(`\n  Summary: ${score.summary}\n`);

  if (score.topSuggestions?.length) {
    console.log("  Top suggestions:");
    for (const s of score.topSuggestions) {
      console.log(`    → ${s}`);
    }
  }

  console.log(`\n${"═".repeat(60)}\n`);
}
