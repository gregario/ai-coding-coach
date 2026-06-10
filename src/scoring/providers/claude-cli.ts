import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { ParsedSession } from "../../parser/types.js";
import type { SessionScore } from "../rubric.js";
import { SCORING_PROMPT } from "../rubric.js";
import type { LLMProvider } from "./types.js";
import { buildUserMessage, validateAndBuildScore } from "./shared.js";

const execAsync = promisify(exec);

export class ClaudeCliProvider implements LLMProvider {
  name = "Claude Code CLI";

  async available(): Promise<boolean> {
    try {
      await execAsync("which claude");
      return true;
    } catch {
      return false;
    }
  }

  async score(session: ParsedSession): Promise<SessionScore> {
    const userMessage = buildUserMessage(session);

    const prompt = `${SCORING_PROMPT}

${userMessage}

IMPORTANT: Respond with ONLY a valid JSON object matching this exact structure, no markdown fencing, no explanation:
{
  "overallScore": <number 1-10>,
  "yeggeLevel": <number 1-8>,
  "axes": [{"axis": "<key>", "score": <1-10>, "confidence": "high|medium|low", "suggestion": "<text>", "evidence": "<text>"}],
  "summary": "<text>",
  "topSuggestions": ["<text>", "<text>", "<text>"]
}`;

    const { stdout } = await execAsync(
      `echo ${escapeForShell(prompt)} | claude -p --output-format text`,
      { maxBuffer: 1024 * 1024, timeout: 120_000 }
    );

    const json = extractJson(stdout);
    if (!json) {
      throw new Error(
        "Claude CLI did not return valid JSON. Raw output:\n" +
          stdout.slice(0, 500)
      );
    }

    return validateAndBuildScore(json);
  }
}

function escapeForShell(str: string): string {
  return `'${str.replace(/'/g, "'\\''")}'`;
}

function extractJson(text: string): unknown | null {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // try to find JSON object in the text
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  return null;
}
