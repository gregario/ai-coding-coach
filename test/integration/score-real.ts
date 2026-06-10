import { parseTranscript } from "../../src/parser/claude-code.js";
import { scoreSession } from "../../src/scoring/engine.js";

const TRANSCRIPT =
  "/Users/gregario/.claude/projects/-Users-gregario-Projects-ClaudeCode-personal-ai-agent-ecosystem/1c62e789-f4f1-4b1d-9238-d5cffe15ea52.jsonl";

async function main() {
  console.log("Parsing transcript...");
  const session = await parseTranscript(TRANSCRIPT);
  console.log(
    `Parsed: ${session.metadata.totalTurns} turns, ${session.metadata.totalToolUses} tool uses\n`
  );

  console.log("Scoring session (auto-detecting provider)...\n");
  const { score, providerUsed } = await scoreSession(session);

  console.log(`\n=== SESSION SCORE (via ${providerUsed}) ===`);
  console.log(`Overall: ${score.overallScore}/10`);
  console.log(`Yegge Level: L${score.yeggeLevel}`);
  console.log(`Rubric: v${score.rubricVersion}`);
  console.log(`\nAxes:`);
  for (const axis of score.axes) {
    console.log(
      `  ${axis.axis}: ${axis.score}/10 [${axis.confidence}]`
    );
    console.log(`    ${axis.suggestion}`);
  }
  console.log(`\nSummary: ${score.summary}`);
  console.log(`\nTop suggestions:`);
  for (const s of score.topSuggestions) {
    console.log(`  - ${s}`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
