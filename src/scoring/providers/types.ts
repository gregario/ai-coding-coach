import type { ParsedSession } from "../../parser/types.js";
import type { SessionScore } from "../rubric.js";

export interface LLMProvider {
  name: string;
  available(): Promise<boolean>;
  score(session: ParsedSession): Promise<SessionScore>;
}

export interface ProviderDetectionResult {
  provider: LLMProvider;
  reason: string;
}
