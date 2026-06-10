import type { ParsedSession } from "../../parser/types.js";
import type { SessionScore } from "../rubric.js";
import { SCORING_PROMPT } from "../rubric.js";
import type { LLMProvider } from "./types.js";
import { buildUserMessage, SCORE_SCHEMA, validateAndBuildScore } from "./shared.js";

export class BedrockProvider implements LLMProvider {
  name = "AWS Bedrock";
  private model: string;
  private region: string;

  constructor(options?: { model?: string; region?: string }) {
    this.model = options?.model || "us.anthropic.claude-sonnet-4-6";
    this.region = options?.region || process.env.AWS_REGION || "us-west-2";
  }

  async available(): Promise<boolean> {
    try {
      const { fromNodeProviderChain } = await import(
        "@aws-sdk/credential-providers"
      );
      const provider = fromNodeProviderChain();
      const creds = await provider();
      return !!(creds.accessKeyId && creds.secretAccessKey);
    } catch {
      return false;
    }
  }

  async score(session: ParsedSession): Promise<SessionScore> {
    const { BedrockRuntimeClient, InvokeModelCommand } = await import(
      "@aws-sdk/client-bedrock-runtime"
    );

    const client = new BedrockRuntimeClient({ region: this.region });

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
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

    const command = new InvokeModelCommand({
      modelId: this.model,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(body),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const toolUseBlock = responseBody.content?.find(
      (b: { type: string }) => b.type === "tool_use"
    );
    if (!toolUseBlock) {
      throw new Error("Bedrock did not return structured output");
    }

    return validateAndBuildScore(toolUseBlock.input);
  }
}
