import type { ParsedSession } from "../../parser/types.js";
import type { SessionScore, AxisScore } from "../rubric.js";
import { RUBRIC_VERSION, SCORING_AXES } from "../rubric.js";
import { sanitize } from "../../sanitize/strip-secrets.js";

export function formatTranscriptForScoring(session: ParsedSession): string {
  const parts: string[] = [];

  parts.push(
    `Session: ${session.metadata.sessionId}`,
    `Duration: ${session.metadata.startTime} to ${session.metadata.endTime}`,
    `Model: ${session.metadata.model || "unknown"}`,
    `Total turns: ${session.metadata.totalTurns}`,
    `Total tool uses: ${session.metadata.totalToolUses}`,
    ""
  );

  for (const turn of session.turns) {
    const prefix = turn.role === "human" ? "[HUMAN]" : "[ASSISTANT]";
    const sanitized = sanitize(turn.text);

    parts.push(`${prefix} ${sanitized.text}`);

    if (turn.thinking) {
      const sanitizedThinking = sanitize(turn.thinking);
      parts.push(`[THINKING] ${sanitizedThinking.text}`);
    }

    if (turn.toolUses.length > 0) {
      const toolNames = turn.toolUses.map((t) => t.name).join(", ");
      parts.push(`[TOOLS USED] ${toolNames}`);
    }

    parts.push("");
  }

  return parts.join("\n");
}

export function buildUserMessage(session: ParsedSession): string {
  const transcript = formatTranscriptForScoring(session);
  return `Score the following AI coding session transcript. The human's messages are marked [HUMAN] and the AI's responses are marked [ASSISTANT]. Tool uses are listed where relevant.

<transcript>
${transcript}
</transcript>

Analyze the HUMAN's interaction quality and return your scoring as JSON.`;
}

export const SCORE_SCHEMA = {
  type: "object" as const,
  properties: {
    overallScore: { type: "number" as const, minimum: 1, maximum: 10 },
    yeggeLevel: { type: "number" as const, minimum: 1, maximum: 8 },
    axes: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          axis: { type: "string" as const },
          score: { type: "number" as const, minimum: 1, maximum: 10 },
          confidence: {
            type: "string" as const,
            enum: ["high", "medium", "low"],
          },
          suggestion: { type: "string" as const },
          evidence: { type: "string" as const },
        },
        required: ["axis", "score", "confidence", "suggestion", "evidence"],
      },
    },
    summary: { type: "string" as const },
    topSuggestions: {
      type: "array" as const,
      items: { type: "string" as const },
      maxItems: 3,
    },
  },
  required: ["overallScore", "yeggeLevel", "axes", "summary", "topSuggestions"],
};

export function validateAndBuildScore(raw: unknown): SessionScore {
  const data = raw as Record<string, unknown>;

  if (
    typeof data.overallScore !== "number" ||
    typeof data.yeggeLevel !== "number" ||
    !Array.isArray(data.axes) ||
    typeof data.summary !== "string" ||
    !Array.isArray(data.topSuggestions)
  ) {
    throw new Error(
      "Invalid scoring response structure. Expected overallScore, yeggeLevel, axes, summary, topSuggestions."
    );
  }

  const axes = data.axes as AxisScore[];
  const yeggeAxis = axes.find((a) => a.axis === "yegge_level");
  if (yeggeAxis && yeggeAxis.score >= 1 && yeggeAxis.score <= 8) {
    yeggeAxis.score = Math.round((yeggeAxis.score / 8) * 10 * 10) / 10;
  }

  return {
    rubricVersion: RUBRIC_VERSION,
    overallScore: data.overallScore as number,
    yeggeLevel: data.yeggeLevel as number,
    axes,
    summary: data.summary as string,
    topSuggestions: data.topSuggestions as string[],
  };
}
