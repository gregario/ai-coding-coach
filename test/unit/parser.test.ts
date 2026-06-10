import { describe, it, expect } from "vitest";
import { parseTranscriptContent } from "../../src/parser/claude-code.js";

const makeMessage = (overrides: Record<string, unknown>) =>
  JSON.stringify({
    parentUuid: null,
    isSidechain: false,
    uuid: "test-uuid",
    timestamp: "2026-06-10T17:00:00.000Z",
    sessionId: "test-session",
    cwd: "/test/project",
    ...overrides,
  });

describe("parseTranscriptContent", () => {
  it("extracts user text messages", () => {
    const content = [
      makeMessage({
        type: "user",
        message: { role: "user", content: "Hello, can you help me?" },
      }),
    ].join("\n");

    const result = parseTranscriptContent(content);
    expect(result.turns).toHaveLength(1);
    expect(result.turns[0].role).toBe("human");
    expect(result.turns[0].text).toBe("Hello, can you help me?");
  });

  it("extracts assistant messages with thinking blocks", () => {
    const content = [
      makeMessage({
        type: "assistant",
        message: {
          role: "assistant",
          model: "claude-sonnet-4-6-20250514",
          content: [
            { type: "thinking", thinking: "Let me think about this..." },
            { type: "text", text: "Here is my answer." },
          ],
        },
      }),
    ].join("\n");

    const result = parseTranscriptContent(content);
    expect(result.turns).toHaveLength(1);
    expect(result.turns[0].role).toBe("assistant");
    expect(result.turns[0].text).toBe("Here is my answer.");
    expect(result.turns[0].thinking).toBe("Let me think about this...");
  });

  it("extracts tool uses from assistant messages", () => {
    const content = [
      makeMessage({
        type: "assistant",
        message: {
          role: "assistant",
          content: [
            { type: "text", text: "I'll read that file." },
            {
              type: "tool_use",
              name: "Read",
              input: { file_path: "/src/index.ts" },
            },
          ],
        },
      }),
    ].join("\n");

    const result = parseTranscriptContent(content);
    expect(result.turns[0].toolUses).toHaveLength(1);
    expect(result.turns[0].toolUses[0].name).toBe("Read");
  });

  it("filters out sidechain messages", () => {
    const content = [
      makeMessage({
        type: "user",
        message: { role: "user", content: "Main conversation" },
      }),
      makeMessage({
        type: "assistant",
        isSidechain: true,
        message: {
          role: "assistant",
          content: [{ type: "text", text: "Sidechain exploration" }],
        },
      }),
    ].join("\n");

    const result = parseTranscriptContent(content);
    expect(result.turns).toHaveLength(1);
    expect(result.turns[0].text).toBe("Main conversation");
  });

  it("skips non-conversation message types", () => {
    const content = [
      makeMessage({ type: "mode", mode: "normal" }),
      makeMessage({ type: "permission-mode", permissionMode: "default" }),
      makeMessage({ type: "last-prompt", leafUuid: "abc" }),
      makeMessage({
        type: "user",
        message: { role: "user", content: "Actual message" },
      }),
    ].join("\n");

    const result = parseTranscriptContent(content);
    expect(result.turns).toHaveLength(1);
  });

  it("extracts session metadata", () => {
    const content = [
      makeMessage({
        type: "user",
        timestamp: "2026-06-10T17:00:00.000Z",
        message: { role: "user", content: "Start" },
      }),
      makeMessage({
        type: "assistant",
        timestamp: "2026-06-10T17:05:00.000Z",
        message: {
          role: "assistant",
          model: "claude-sonnet-4-6-20250514",
          content: [
            { type: "text", text: "Response" },
            { type: "tool_use", name: "Bash", input: { command: "ls" } },
          ],
        },
      }),
    ].join("\n");

    const result = parseTranscriptContent(content);
    expect(result.metadata.sessionId).toBe("test-session");
    expect(result.metadata.startTime).toBe("2026-06-10T17:00:00.000Z");
    expect(result.metadata.endTime).toBe("2026-06-10T17:05:00.000Z");
    expect(result.metadata.model).toBe("claude-sonnet-4-6-20250514");
    expect(result.metadata.totalTurns).toBe(2);
    expect(result.metadata.totalToolUses).toBe(1);
  });

  it("handles malformed JSONL lines gracefully", () => {
    const content = [
      "not valid json",
      makeMessage({
        type: "user",
        message: { role: "user", content: "Valid message" },
      }),
      "{incomplete",
    ].join("\n");

    const result = parseTranscriptContent(content);
    expect(result.turns).toHaveLength(1);
    expect(result.turns[0].text).toBe("Valid message");
  });

  it("handles empty content gracefully", () => {
    const content = makeMessage({
      type: "assistant",
      message: { role: "assistant", content: [] },
    });

    const result = parseTranscriptContent(content);
    expect(result.turns).toHaveLength(0);
  });
});
