import { describe, it, expect } from "vitest";
import { parseTranscriptContent } from "../../src/parser/claude-code.js";
import { sanitize } from "../../src/sanitize/strip-secrets.js";
import type { ParsedSession } from "../../src/parser/types.js";

function formatTranscriptForScoring(session: ParsedSession): string {
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

describe("scoring transcript formatting", () => {
  it("formats a session for the scoring prompt", () => {
    const content = [
      JSON.stringify({
        type: "user",
        isSidechain: false,
        timestamp: "2026-06-10T17:00:00.000Z",
        sessionId: "abc-123",
        cwd: "/project",
        message: { role: "user", content: "Fix the login bug" },
      }),
      JSON.stringify({
        type: "assistant",
        isSidechain: false,
        timestamp: "2026-06-10T17:01:00.000Z",
        sessionId: "abc-123",
        cwd: "/project",
        message: {
          role: "assistant",
          model: "claude-sonnet-4-6-20250514",
          content: [
            { type: "thinking", thinking: "I need to check auth.ts" },
            { type: "text", text: "I'll look at the auth module." },
            { type: "tool_use", name: "Read", input: { file_path: "/src/auth.ts" } },
          ],
        },
      }),
    ].join("\n");

    const session = parseTranscriptContent(content);
    const formatted = formatTranscriptForScoring(session);

    expect(formatted).toContain("[HUMAN] Fix the login bug");
    expect(formatted).toContain("[ASSISTANT] I'll look at the auth module.");
    expect(formatted).toContain("[THINKING] I need to check auth.ts");
    expect(formatted).toContain("[TOOLS USED] Read");
    expect(formatted).toContain("Session: abc-123");
    expect(formatted).toContain("Total turns: 2");
    expect(formatted).toContain("Total tool uses: 1");
  });

  it("sanitizes secrets in formatted output", () => {
    const content = [
      JSON.stringify({
        type: "user",
        isSidechain: false,
        timestamp: "2026-06-10T17:00:00.000Z",
        sessionId: "abc-123",
        cwd: "/project",
        message: {
          role: "user",
          content: "My key is AKIAIOSFODNN7EXAMPLE please use it",
        },
      }),
    ].join("\n");

    const session = parseTranscriptContent(content);
    const formatted = formatTranscriptForScoring(session);

    expect(formatted).not.toContain("AKIAIOSFODNN7EXAMPLE");
    expect(formatted).toContain("[REDACTED]");
  });
});
