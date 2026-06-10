# ai-coding-coach

Score your AI coding sessions. Reduce spend by coaching the habits that waste credits.

## What it does

Reads your Claude Code transcripts and scores your interaction quality across 8 axes using an LLM-as-judge rubric. Tracks improvement over time. Surfaces the single biggest thing you can change to get more value from AI coding tools.

## Install

```bash
git clone https://github.com/gregario/ai-coding-coach.git
cd ai-coding-coach
npm install
```

## Usage

```bash
# Score your most recent session
npx tsx src/cli/index.ts score

# Score a specific transcript
npx tsx src/cli/index.ts score --path ~/.claude/projects/my-project/abc123.jsonl

# View history
npx tsx src/cli/index.ts history

# Open the dashboard
npx tsx src/cli/index.ts dashboard

# Run eval harness (rubric stability testing)
npx tsx src/cli/index.ts eval --provider bedrock
```

## Provider setup

The scoring engine needs an LLM. Pick one:

| Provider | Setup | Cost |
|----------|-------|------|
| Anthropic API | `export ANTHROPIC_API_KEY=sk-ant-...` | ~$0.05/score |
| AWS Bedrock | `aws configure` | ~$0.03/score |
| Claude Code CLI | Install Claude Code (free with Max) | $0 |

Auto-detection tries them in that order. Override with `--provider <name>`.

## Scoring rubric

8 axes, scored 1-10:

1. **Task Decomposition** - Do you break work into steps?
2. **Context Discipline** - Do you scope context appropriately?
3. **Verification Behaviour** - Do you define pass/fail criteria?
4. **Evidence-Seeking** - Do you demand proof?
5. **Plan-Before-Code** - Do you plan before implementing?
6. **Trust Calibration** - Do you critically review AI output?
7. **Session Hygiene** - Do you manage context window effectively?
8. **Yegge Level** - Where are you on the AI adoption ladder (L1-L8)?

Each score comes with a confidence level, evidence citation, and actionable suggestion.

## Example output

```
Session Score: 7.8/10 (L6 - AI-first)

 Task Decomposition    ████████░░  8/10  high
 Context Discipline    ███████░░░  7/10  high
 Verification          ████████░░  8/10  high
 Evidence-Seeking      ████████░░  8/10  medium
 Plan-Before-Code      ███████░░░  7/10  medium
 Trust Calibration     █████████░  9/10  high
 Session Hygiene       ███████░░░  7/10  high
 Yegge Level           ██████░░░░  L6    high

Top suggestion: Define acceptance criteria before implementation.
When you say "add X", also say "it passes when Y".
```

## Eval harness

Validates rubric stability across transcripts:

```bash
# Create eval-manifest.json with paths to 20 transcripts
npx tsx src/cli/index.ts eval --provider bedrock --runs 3

# Save baseline for regression detection
npx tsx src/cli/index.ts eval --provider bedrock --save-baseline
```

Pass criteria:
- Score std dev < 1.5 per axis across 3 runs of same transcript
- No axis consistently scores 1 or 10 (floor/ceiling problem)

## License

MIT
