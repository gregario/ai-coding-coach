export interface ToolUse {
  name: string;
  input?: Record<string, unknown>;
}

export interface ConversationTurn {
  role: "human" | "assistant";
  text: string;
  thinking?: string;
  toolUses: ToolUse[];
  timestamp: string;
}

export interface SessionMetadata {
  sessionId: string;
  startTime: string;
  endTime: string;
  cwd: string;
  model?: string;
  totalTurns: number;
  totalToolUses: number;
}

export interface ParsedSession {
  metadata: SessionMetadata;
  turns: ConversationTurn[];
}
