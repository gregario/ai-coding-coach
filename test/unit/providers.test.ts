import { describe, it, expect } from "vitest";
import { AnthropicProvider } from "../../src/scoring/providers/anthropic.js";
import { BedrockProvider } from "../../src/scoring/providers/bedrock.js";
import { ClaudeCliProvider } from "../../src/scoring/providers/claude-cli.js";

describe("AnthropicProvider", () => {
  it("reports available when ANTHROPIC_API_KEY is set", async () => {
    const original = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";
    const provider = new AnthropicProvider();
    expect(await provider.available()).toBe(true);
    if (original) process.env.ANTHROPIC_API_KEY = original;
    else delete process.env.ANTHROPIC_API_KEY;
  });

  it("reports unavailable when ANTHROPIC_API_KEY is not set", async () => {
    const original = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const provider = new AnthropicProvider();
    expect(await provider.available()).toBe(false);
    if (original) process.env.ANTHROPIC_API_KEY = original;
  });

  it("has correct name", () => {
    const provider = new AnthropicProvider();
    expect(provider.name).toBe("Anthropic API");
  });
});

describe("BedrockProvider", () => {
  it("has correct name", () => {
    const provider = new BedrockProvider();
    expect(provider.name).toBe("AWS Bedrock");
  });
});

describe("ClaudeCliProvider", () => {
  it("has correct name", () => {
    const provider = new ClaudeCliProvider();
    expect(provider.name).toBe("Claude Code CLI");
  });

  it("checks for claude on PATH", async () => {
    const provider = new ClaudeCliProvider();
    const available = await provider.available();
    expect(typeof available).toBe("boolean");
  });
});
