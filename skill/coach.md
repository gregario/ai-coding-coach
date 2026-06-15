---
name: coach
version: 1.0.0
description: Score your last AI coding session and get coaching feedback. Zero-setup, reads your most recent Claude Code transcript.
allowed-tools:
  - Bash
  - Read
triggers:
  - coach me
  - score my session
  - how did I do
  - coaching feedback
  - session score
  - rate my session
---

## When to invoke this skill

Scores your most recent Claude Code session transcript using the AI Coding Coach rubric (8 axes + Yegge level). Provides actionable coaching suggestions. Use when asked to "coach me", "score my session", "how did I do", "rate my session", or "session score".

## How it works

1. Finds the most recent Claude Code transcript in `~/.claude/projects/`
2. Parses the JSONL, sanitizes secrets, scores the HUMAN's interaction quality via LLM
3. Stores the result in `~/.ai-coding-coach/scores.db` for trend tracking
4. Prints an 8-axis breakdown with specific, actionable suggestions

## Instructions

Run the following command to score the most recent session. If the user specifies a project, pass `--project <substring>`. If they want to score a specific file, pass `--path <file>`.

Default (most recent transcript, auto-detect provider):
```bash
npx ai-coding-coach score
```

With project filter:
```bash
npx ai-coding-coach score --project <substring>
```

With a specific transcript file:
```bash
npx ai-coding-coach score --path <file>
```

After scoring, show the user the output directly. Do NOT summarize or rephrase the coaching suggestions — they are already concise and specific.

If the user asks for history or trends:
```bash
npx ai-coding-coach history
```

If the user asks for a visual dashboard:
```bash
npx ai-coding-coach dashboard
```

## Provider selection

The tool auto-detects the best available provider:
1. `ANTHROPIC_API_KEY` set -> uses Anthropic API directly
2. AWS credentials available -> uses Bedrock (Sonnet 4.6, ~$0.03-0.10 per score)
3. `claude` on PATH -> uses Claude CLI (free for Max subscribers)

To force a specific provider: `--provider anthropic|bedrock|claude-cli`

## Notes

- The tool scores the HUMAN's behaviour, not the AI's quality
- Scoring the current session scores THIS conversation — the one you're in right now
- Each score costs ~$0.03-0.10 via Bedrock or is free via Claude CLI
- Results accumulate in SQLite for trend tracking across sessions
