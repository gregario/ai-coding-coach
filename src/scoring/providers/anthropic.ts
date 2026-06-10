import Anthropic from "@anthropic-ai/sdk";
import type { ParsedSession } from "../../parser/types.js";
import type { SessionScore } from "../rubric.js";
import { SCORING_PROMPT } from "../rubric.js";
import type { LLMProvider } from "./types.js";
import { buildUserMessage, SCORE_SCHEMA, validateAndBuildScore } from "./shared.js";

export class AnthropicProvider implements LLMProvider {
  name = "Anthropic API";
  private model: string;

  constructor(model?: string) {
    this.model = model || "claude-sonnet-4-6-20250514";
  }

  async available(): Promise<boolean> {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async score(session: ParsedSession): Promise<SessionScore> {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: SCORING_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(session) }],
      tools: [
        {
          name: "submit_score",
          description: "Submit the session score",
          input_schema: SCORE_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: "submit_score" },
    });

    const toolUseBlock = response.content.find((b) => b.type === "tool_use");
    if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
      throw new Error("Anthropic API did not return structured output");
    }

    return validateAndBuildScore(toolUseBlock.input);
  }
}
