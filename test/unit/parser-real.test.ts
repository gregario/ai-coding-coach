import { describe, it, expect } from "vitest";
import { parseTranscript } from "../../src/parser/claude-code.js";
import { existsSync } from "node:fs";

const REAL_TRANSCRIPT =
  "/Users/gregario/.claude/projects/-Users-gregario-Projects-ClaudeCode-personal-ai-agent-ecosystem/1c62e789-f4f1-4b1d-9238-d5cffe15ea52.jsonl";

describe("parseTranscript (real file)", () => {
  it.skipIf(!existsSync(REAL_TRANSCRIPT))(
    "parses a real Claude Code transcript",
    async () => {
      const session = await parseTranscript(REAL_TRANSCRIPT);

      expect(session.metadata.sessionId).toBe(
        "1c62e789-f4f1-4b1d-9238-d5cffe15ea52"
      );
      expect(session.metadata.totalTurns).toBeGreaterThan(0);
      expect(session.turns.length).toBeGreaterThan(0);

      const humanTurns = session.turns.filter((t) => t.role === "human");
      const assistantTurns = session.turns.filter((t) => t.role === "assistant");
      expect(humanTurns.length).toBeGreaterThan(0);
      expect(assistantTurns.length).toBeGreaterThan(0);

      const withTools = session.turns.filter((t) => t.toolUses.length > 0);
      expect(withTools.length).toBeGreaterThanOrEqual(0);
    }
  );
});
