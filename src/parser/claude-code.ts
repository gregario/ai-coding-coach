import { readFile } from "node:fs/promises";
import type {
  ParsedSession,
  ConversationTurn,
  ToolUse,
  SessionMetadata,
} from "./types.js";

interface RawMessage {
  type: string;
  parentUuid?: string;
  isSidechain?: boolean;
  uuid?: string;
  timestamp?: string;
  sessionId?: string;
  cwd?: string;
  message?: {
    role?: string;
    content?: string | ContentBlock[];
    model?: string;
  };
}

interface ContentBlock {
  type: string;
  text?: string;
  thinking?: string;
  name?: string;
  input?: Record<string, unknown>;
}

export async function parseTranscript(filePath: string): Promise<ParsedSession> {
  const raw = await readFile(filePath, "utf-8");
  return parseTranscriptContent(raw);
}

export function parseTranscriptContent(content: string): ParsedSession {
  const lines = content.trim().split("\n");
  const messages: RawMessage[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      messages.push(JSON.parse(line));
    } catch {
      // skip malformed lines
    }
  }

  const conversationMessages = messages.filter(
    (m) =>
      (m.type === "user" || m.type === "assistant") && !m.isSidechain
  );

  const turns: ConversationTurn[] = [];

  for (const msg of conversationMessages) {
    const turn = extractTurn(msg);
    if (turn) turns.push(turn);
  }

  const metadata = extractMetadata(messages, turns);

  return { metadata, turns };
}

function extractTurn(msg: RawMessage): ConversationTurn | null {
  const role = msg.type === "user" ? "human" : "assistant";
  const content = msg.message?.content;

  if (!content) return null;

  if (typeof content === "string") {
    return {
      role: role as "human" | "assistant",
      text: content,
      toolUses: [],
      timestamp: msg.timestamp || "",
    };
  }

  let text = "";
  let thinking = "";
  const toolUses: ToolUse[] = [];

  for (const block of content) {
    switch (block.type) {
      case "text":
        text += (block.text || "") + "\n";
        break;
      case "thinking":
        thinking += (block.thinking || "") + "\n";
        break;
      case "tool_use":
        toolUses.push({
          name: block.name || "unknown",
          input: block.input,
        });
        break;
    }
  }

  text = text.trim();
  thinking = thinking.trim();

  if (!text && !thinking && toolUses.length === 0) return null;

  return {
    role: role as "human" | "assistant",
    text,
    thinking: thinking || undefined,
    toolUses,
    timestamp: msg.timestamp || "",
  };
}

function extractMetadata(
  messages: RawMessage[],
  turns: ConversationTurn[]
): SessionMetadata {
  const firstMsg = messages.find((m) => m.sessionId);
  const timestamps = messages
    .map((m) => m.timestamp)
    .filter(Boolean) as string[];

  const sessionId = firstMsg?.sessionId || "unknown";
  const startTime = timestamps[0] || "";
  const endTime = timestamps[timestamps.length - 1] || "";
  const cwd = messages.find((m) => m.cwd)?.cwd || "";
  const model = messages.find(
    (m) => m.type === "assistant" && m.message?.model
  )?.message?.model;

  const totalToolUses = turns.reduce((sum, t) => sum + t.toolUses.length, 0);

  return {
    sessionId,
    startTime,
    endTime,
    cwd,
    model,
    totalTurns: turns.length,
    totalToolUses,
  };
}
