#!/usr/bin/env node
import { parseArgs } from "node:util";
import { scoreCommand } from "./commands/score.js";
import { historyCommand } from "./commands/history.js";
import { dashboardCommand } from "./commands/dashboard.js";
import { evalCommand } from "./commands/eval.js";

const USAGE = `
ai-coding-coach — Score your AI coding sessions

Commands:
  score       Score the most recent transcript (or a specific one)
  history     Show score history
  dashboard   Open the interactive dashboard (starts a local server)
  eval        Run eval harness (batch-score transcripts for rubric stability)

Options:
  --provider <name>    Force provider: anthropic | bedrock | claude-cli
  --path <file>        Score a specific transcript file
  --project <filter>   Filter transcripts by project name substring
  --limit <n>          Number of history entries (default: 20)
  --db <path>          Custom database path
  --port <n>           Dashboard port (default: 2847)
  --stop               Stop a running dashboard server
  --manifest <path>    Eval manifest file (default: ./eval-manifest.json)
  --runs <n>           Runs per transcript for eval (default: 3)
  --concurrency <n>    Parallel scoring calls (default: 3)
  --save-baseline      Save baseline from eval results
  --baseline-path <p>  Custom baseline file path
  --help               Show this help

Examples:
  ai-coding-coach score
  ai-coding-coach score --path ~/.claude/projects/my-project/abc123.jsonl
  ai-coding-coach history --limit 10
  ai-coding-coach dashboard
  ai-coding-coach dashboard --stop
`.trim();

function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      provider: { type: "string" },
      path: { type: "string" },
      project: { type: "string" },
      limit: { type: "string" },
      db: { type: "string" },
      port: { type: "string" },
      stop: { type: "boolean" },
      manifest: { type: "string" },
      runs: { type: "string" },
      concurrency: { type: "string" },
      "save-baseline": { type: "boolean" },
      "baseline-path": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help || positionals.length === 0) {
    console.log(USAGE);
    process.exit(0);
  }

  const command = positionals[0];

  switch (command) {
    case "score":
      return scoreCommand(values);
    case "history":
      return historyCommand(values);
    case "dashboard":
      return dashboardCommand(values);
    case "eval":
      return evalCommand(values);
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main();
