# ai-coding-coach

Score your AI coding sessions. Get better at prompting. Waste fewer credits.

---

**You're using AI coding tools every day, but are you getting better at it?**

`ai-coding-coach` reads your Claude Code transcripts, scores your interaction quality across 8 dimensions, and tells you the single most impactful thing to change. It's like a linter for your AI workflow — fast, local, opinionated.

```bash
npx ai-coding-coach score
```

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

## How it works

1. Reads your most recent Claude Code transcript (a `.jsonl` file on your machine)
2. Sanitizes secrets, then sends the conversation to an LLM with a structured rubric
3. Returns scores, evidence citations, and one actionable suggestion per axis
4. Stores results locally in SQLite for trend tracking over time

**Privacy:** Your transcripts are sent to whichever LLM provider you configure (Anthropic API, AWS Bedrock, or Claude Code CLI). Nothing is sent to any other service. No telemetry. No analytics. The scoring database stays on your machine at `~/.ai-coding-coach/scores.db`.

## Install

Requires Node.js 20+.

```bash
npm install -g ai-coding-coach
```

Or run without installing:

```bash
npx ai-coding-coach score
```

## Usage

```bash
# Score your most recent session
ai-coding-coach score

# Score a specific transcript
ai-coding-coach score --path ~/.claude/projects/my-project/abc123.jsonl

# Filter by project name
ai-coding-coach score --project my-project

# View score history
ai-coding-coach history

# Open the interactive dashboard
ai-coding-coach dashboard
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

1. **Task Decomposition** — Do you break work into steps?
2. **Context Discipline** — Do you scope context appropriately?
3. **Verification Behaviour** — Do you define pass/fail criteria?
4. **Evidence-Seeking** — Do you demand proof?
5. **Plan-Before-Code** — Do you plan before implementing?
6. **Trust Calibration** — Do you critically review AI output?
7. **Session Hygiene** — Do you manage context window effectively?
8. **Yegge Level** — Where are you on the AI adoption ladder? (Based on Steve Yegge's 8-level framework, from L1 non-user to L8 orchestrator)

Each score comes with a confidence level, evidence citation, and actionable suggestion.

## Claude Code integration

If you use Claude Code, you can score sessions without leaving your terminal:

```bash
mkdir -p ~/.claude/skills/coach
cp $(npm root -g)/ai-coding-coach/skill/coach.md ~/.claude/skills/coach/SKILL.md
```

Then type `/coach` in any Claude Code session to score your last session inline.

## Current state

This is v0.1 — early and opinionated. Known limitations:

- Only supports Claude Code transcripts (`.jsonl` format). Copilot/Cursor support is not yet implemented.
- Scoring uses an LLM, so results have natural variance (~0.5-1.0 points between runs on the same transcript).
- The rubric is calibrated for one developer's workflow. Your axes may need different weights.
- Dashboard is functional but minimal.

Issues and PRs welcome: [github.com/gregario/ai-coding-coach/issues](https://github.com/gregario/ai-coding-coach/issues)

## For contributors: eval harness

If you're working on the scoring rubric, the eval harness validates stability:

```bash
ai-coding-coach eval --provider bedrock --runs 3
```

Pass criteria: score std dev < 1.5 per axis across 3 runs of the same transcript, and no axis consistently hitting floor (1) or ceiling (10). See `DESIGN.md` for rubric architecture.

## License

GNU Affero General Public License v3.0 (AGPLv3) with commercial exemption option.

Open source projects are free to use under AGPLv3. Organizations requiring proprietary use can obtain a commercial license exemption. See `LICENSE` for details.
