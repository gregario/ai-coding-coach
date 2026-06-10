export interface SanitizeResult {
  text: string;
  strippedCount: number;
  confidence: "high" | "medium" | "low";
  warnings: string[];
}

const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/g },
  { name: "AWS Secret Key", pattern: /(?<=(?:secret|aws).{0,20})[A-Za-z0-9/+=]{40}/gi },
  { name: "Anthropic API Key", pattern: /sk-ant-[a-zA-Z0-9-]{20,}/g },
  { name: "OpenAI API Key", pattern: /sk-[a-zA-Z0-9]{20,}/g },
  { name: "Generic API Key", pattern: /(?<=(?:api[_-]?key|apikey|token|secret|password|passwd|pwd)\s*[=:]\s*["']?)[^\s"']{8,}/gi },
  { name: "Bearer Token", pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g },
  { name: "Private Key Block", pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA )?PRIVATE KEY-----/g },
  { name: "GitHub Token", pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g },
  { name: "Slack Token", pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { name: "Generic Hex Secret", pattern: /(?<=(?:secret|token|key|password)\s*[=:]\s*["']?)[0-9a-f]{32,}/gi },
  { name: "Connection String", pattern: /(?:mongodb|postgres|mysql|redis):\/\/[^\s"']+/gi },
  { name: "Env Var Assignment", pattern: /(?<=(?:export\s+)?(?:DATABASE_URL|REDIS_URL|SECRET_KEY|API_SECRET|PRIVATE_KEY|AUTH_TOKEN)\s*=\s*["']?)[^\s"'\n]+/gi },
];

const REDACTION = "[REDACTED]";

export function sanitize(text: string): SanitizeResult {
  let result = text;
  let strippedCount = 0;
  const warnings: string[] = [];

  for (const { name, pattern } of SECRET_PATTERNS) {
    const fresh = new RegExp(pattern.source, pattern.flags);
    const matches = result.match(fresh);
    if (matches) {
      strippedCount += matches.length;
      result = result.replace(fresh, REDACTION);
    }
  }

  const confidence = assessConfidence(text, strippedCount);

  if (confidence === "low") {
    warnings.push(
      "Transcript contains code but no secrets were detected. Sanitization is best-effort; review before sharing."
    );
  }

  return { text: result, strippedCount, confidence, warnings };
}

function assessConfidence(
  originalText: string,
  strippedCount: number
): "high" | "medium" | "low" {
  const codeIndicators = [
    /\bimport\s+\{/,
    /\bimport\s+\w+\s+from/,
    /\bconst\s+\w+\s*=/,
    /\blet\s+\w+\s*=/,
    /\bfunction\s+\w+\s*\(/,
    /\bclass\s+\w+/,
    /\bexport\s+(default|const|function|class)/,
    /=>\s*\{/,
  ];
  const hasCode = codeIndicators.some((p) => p.test(originalText));

  const hasEnvLikeContent =
    originalText.includes(".env") ||
    originalText.includes("credentials") ||
    originalText.includes("config");

  if (strippedCount > 0) return "high";
  if (!hasCode) return "high";
  if (hasCode && !hasEnvLikeContent) return "medium";
  return "low";
}

export function sanitizeSession(
  turns: Array<{ text: string; thinking?: string }>
): {
  sanitizedTexts: string[];
  totalStripped: number;
  confidence: "high" | "medium" | "low";
  warnings: string[];
} {
  let totalStripped = 0;
  let worstConfidence: "high" | "medium" | "low" = "high";
  const allWarnings: string[] = [];
  const sanitizedTexts: string[] = [];

  for (const turn of turns) {
    const combined = [turn.text, turn.thinking].filter(Boolean).join("\n");
    const result = sanitize(combined);
    sanitizedTexts.push(result.text);
    totalStripped += result.strippedCount;
    allWarnings.push(...result.warnings);

    if (
      result.confidence === "low" ||
      (result.confidence === "medium" && worstConfidence === "high")
    ) {
      worstConfidence = result.confidence;
    }
  }

  return {
    sanitizedTexts,
    totalStripped: totalStripped,
    confidence: worstConfidence,
    warnings: [...new Set(allWarnings)],
  };
}
