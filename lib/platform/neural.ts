/**
 * AuraFlow — Platform Neural Integration
 *
 * This file is now a thin wrapper around @codeswayam/neural/platform.
 * All AI logic lives in the SDK — this file is responsible only for
 * providing the app-scoped singleton and re-exporting for backward compatibility.
 *
 * Before: 216 lines of duplicated client management, persona prompts, retry logic
 * After:  14 lines — createPlatformNeural() handles everything
 *
 * Zero changes required in:
 *   - lib/domain/webhook/webhook-processor.service.ts
 *   - lib/neural.ts
 *   - Any server action importing from @/lib/platform/neural
 */

import {
  createPlatformNeural,
  buildPersonaPrompt,
  registerPersona,
} from "@codeswayam/neural/platform";
import type { ChatOptions, PlatformChatResult, PersonaType } from "@codeswayam/neural/platform";

// ── Singleton adapter for the "auraflow" app ─────────────────────────────────
const neural = createPlatformNeural({ app: "auraflow" });

// ── Backward-compatible exports ───────────────────────────────────────────────
// All existing code that imports PlatformNeuralService, buildPersonaPrompt,
// or type imports from this file will continue to work without changes.

export const PlatformNeuralService = neural;
export { buildPersonaPrompt, registerPersona };
export type { ChatOptions, PlatformChatResult, PersonaType };

// getNeuralClient() was used in some server actions — preserved for compat
export function getNeuralClient() {
  return neural.raw;
}

export default neural;
