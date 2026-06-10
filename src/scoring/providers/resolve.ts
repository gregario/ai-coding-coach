import type { LLMProvider, ProviderDetectionResult } from "./types.js";
import { AnthropicProvider } from "./anthropic.js";
import { BedrockProvider } from "./bedrock.js";
import { ClaudeCliProvider } from "./claude-cli.js";

export type ProviderName = "anthropic" | "bedrock" | "claude-cli";

const DETECTION_ORDER: Array<{
  name: ProviderName;
  factory: () => LLMProvider;
  reason: string;
}> = [
  {
    name: "anthropic",
    factory: () => new AnthropicProvider(),
    reason: "ANTHROPIC_API_KEY found in environment",
  },
  {
    name: "bedrock",
    factory: () => new BedrockProvider(),
    reason: "AWS credentials detected",
  },
  {
    name: "claude-cli",
    factory: () => new ClaudeCliProvider(),
    reason: "Claude Code CLI found on PATH (uses your existing subscription)",
  },
];

export async function resolveProvider(
  explicit?: ProviderName
): Promise<ProviderDetectionResult> {
  if (explicit) {
    const entry = DETECTION_ORDER.find((e) => e.name === explicit);
    if (!entry) {
      throw new Error(
        `Unknown provider "${explicit}". Available: ${DETECTION_ORDER.map((e) => e.name).join(", ")}`
      );
    }
    const provider = entry.factory();
    const isAvailable = await provider.available();
    if (!isAvailable) {
      throw new Error(
        `Provider "${explicit}" is not available. ${getSetupHint(explicit)}`
      );
    }
    return { provider, reason: `${entry.reason} (explicitly selected)` };
  }

  for (const entry of DETECTION_ORDER) {
    const provider = entry.factory();
    if (await provider.available()) {
      return { provider, reason: entry.reason };
    }
  }

  throw new Error(
    `No LLM provider available. Set up one of the following:

1. Direct API key (fastest):
   export ANTHROPIC_API_KEY=sk-ant-...

2. AWS Bedrock (enterprise):
   Configure AWS credentials (aws configure or env vars)

3. Claude Code CLI (free with Max subscription):
   Install Claude Code: https://docs.anthropic.com/en/docs/claude-code

Run with --provider <name> to use a specific provider.`
  );
}

function getSetupHint(name: ProviderName): string {
  switch (name) {
    case "anthropic":
      return "Set ANTHROPIC_API_KEY in your environment.";
    case "bedrock":
      return "Configure AWS credentials (aws configure, env vars, or IAM role).";
    case "claude-cli":
      return "Install Claude Code CLI: https://docs.anthropic.com/en/docs/claude-code";
  }
}
