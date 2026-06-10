import { describe, it, expect } from "vitest";
import { sanitize, sanitizeSession } from "../../src/sanitize/strip-secrets.js";

describe("sanitize", () => {
  it("strips AWS access keys", () => {
    const input = "My key is AKIAIOSFODNN7EXAMPLE";
    const result = sanitize(input);
    expect(result.text).not.toContain("AKIAIOSFODNN7EXAMPLE");
    expect(result.text).toContain("[REDACTED]");
    expect(result.strippedCount).toBe(1);
  });

  it("strips Anthropic API keys", () => {
    const input = 'export ANTHROPIC_API_KEY="sk-ant-api03-abc123def456ghi789"';
    const result = sanitize(input);
    expect(result.text).not.toContain("sk-ant-api03-abc123def456ghi789");
    expect(result.strippedCount).toBeGreaterThan(0);
  });

  it("strips OpenAI API keys", () => {
    const input = "api_key = sk-proj-abcdefghijklmnopqrstuvwxyz123456";
    const result = sanitize(input);
    expect(result.text).not.toContain(
      "sk-proj-abcdefghijklmnopqrstuvwxyz123456"
    );
    expect(result.strippedCount).toBeGreaterThan(0);
  });

  it("strips GitHub tokens", () => {
    const input = "token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkl";
    const result = sanitize(input);
    expect(result.text).not.toContain(
      "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkl"
    );
    expect(result.strippedCount).toBeGreaterThan(0);
  });

  it("strips private key blocks", () => {
    const input = `Here is a key:
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWep4PAtGoRBj
-----END RSA PRIVATE KEY-----
And more text`;
    const result = sanitize(input);
    expect(result.text).not.toContain("MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn");
    expect(result.strippedCount).toBe(1);
  });

  it("strips Bearer tokens", () => {
    const input = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI";
    const result = sanitize(input);
    expect(result.text).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(result.strippedCount).toBe(1);
  });

  it("strips connection strings", () => {
    const input = 'DATABASE_URL="postgres://user:pass@host:5432/db"';
    const result = sanitize(input);
    expect(result.text).not.toContain("postgres://user:pass@host:5432/db");
    expect(result.strippedCount).toBeGreaterThan(0);
  });

  it("strips Slack tokens", () => {
    const input = "SLACK_TOKEN=xoxb-123456789-987654321-AbCdEfGhIj";
    const result = sanitize(input);
    expect(result.text).not.toContain("xoxb-123456789-987654321-AbCdEfGhIj");
    expect(result.strippedCount).toBeGreaterThan(0);
  });

  it("preserves non-secret text", () => {
    const input =
      "This is normal code: const x = 42; function hello() { return 'world'; }";
    const result = sanitize(input);
    expect(result.text).toBe(input);
    expect(result.strippedCount).toBe(0);
  });

  it("handles multiple secrets in one text", () => {
    const input = `AKIAIOSFODNN7EXAMPLE
sk-ant-api03-longkeyhere12345678
ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkl`;
    const result = sanitize(input);
    expect(result.strippedCount).toBe(3);
  });

  it("returns high confidence when secrets are found and stripped", () => {
    const input = "key = AKIAIOSFODNN7EXAMPLE";
    const result = sanitize(input);
    expect(result.confidence).toBe("high");
  });

  it("returns medium confidence for code without env-like content", () => {
    const input = "import { foo } from './bar'; const x = foo();";
    const result = sanitize(input);
    expect(result.confidence).toBe("medium");
  });

  it("returns low confidence for code with env references but no detected secrets", () => {
    const input =
      "import { config } from './config'; // reads from .env credentials";
    const result = sanitize(input);
    expect(result.confidence).toBe("low");
    expect(result.warnings).toHaveLength(1);
  });

  it("returns high confidence for non-code text", () => {
    const input = "Please help me write a function that adds two numbers";
    const result = sanitize(input);
    expect(result.confidence).toBe("high");
    expect(result.strippedCount).toBe(0);
  });
});

describe("sanitizeSession", () => {
  it("sanitizes multiple turns", () => {
    const turns = [
      { text: "My key is AKIAIOSFODNN7EXAMPLE" },
      { text: "Normal text here" },
      { text: "token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkl" },
    ];

    const result = sanitizeSession(turns);
    expect(result.totalStripped).toBe(2);
    expect(result.sanitizedTexts[0]).toContain("[REDACTED]");
    expect(result.sanitizedTexts[1]).toBe("Normal text here");
  });

  it("includes thinking content in sanitization", () => {
    const turns = [
      {
        text: "Let me check",
        thinking: "The key is AKIAIOSFODNN7EXAMPLE",
      },
    ];

    const result = sanitizeSession(turns);
    expect(result.totalStripped).toBe(1);
    expect(result.sanitizedTexts[0]).not.toContain("AKIAIOSFODNN7EXAMPLE");
  });
});
