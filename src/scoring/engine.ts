import type { ParsedSession } from "../parser/types.js";
import type { SessionScore } from "./rubric.js";
import { resolveProvider } from "./providers/resolve.js";
import type { ProviderName } from "./providers/resolve.js";

export interface ScoringOptions {
  provider?: ProviderName;
}

export async function scoreSession(
  session: ParsedSession,
  options: ScoringOptions = {}
): Promise<{ score: SessionScore; providerUsed: string }> {
  const { provider, reason } = await resolveProvider(options.provider);

  console.error(`Scoring via ${provider.name} (${reason})`);

  const score = await provider.score(session);

  return { score, providerUsed: provider.name };
}
