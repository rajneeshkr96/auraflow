export interface MatchableAutomation {
  id: string;
  name: string;
  triggers: { type: "DM" | "COMMENT" }[];
  keywords: { word: string }[];
  listener: any;
  posts?: { postid: string }[];
}

export class AutomationMatcher {
  /**
   * Matches an inbound event against active user automations.
   * Priority rule:
   *   1. Post ID filter match (for comments)
   *   2. Longest matching keyword match
   *   3. Fallback to universal automation (no keywords)
   */
  static match(
    automations: MatchableAutomation[],
    triggerType: "DM" | "COMMENT",
    text: string,
    mediaId?: string
  ): MatchableAutomation | null {
    let bestMatch: MatchableAutomation | null = null;
    let longestKeywordLength = 0;
    let universalFallback: MatchableAutomation | null = null;

    const lowerText = text.toLowerCase();

    for (const auto of automations) {
      // Must match trigger type
      const hasTrigger = auto.triggers.some((t) => t.type === triggerType);
      if (!hasTrigger) continue;

      // For comments, if specific posts are attached, must match mediaId
      if (triggerType === "COMMENT" && auto.posts && auto.posts.length > 0) {
        const matchesPost = auto.posts.some((p) => p.postid === mediaId);
        if (!matchesPost) continue;
      }

      // Keyword matching
      if (auto.keywords && auto.keywords.length > 0) {
        const matchedKeyword = auto.keywords
          .filter((k) => lowerText.includes(k.word.toLowerCase()))
          .sort((a, b) => b.word.length - a.word.length)[0];

        if (matchedKeyword && matchedKeyword.word.length > longestKeywordLength) {
          bestMatch = auto;
          longestKeywordLength = matchedKeyword.word.length;
        }
      } else {
        // Universal automation (fires when no keywords specified)
        if (!universalFallback) {
          universalFallback = auto;
        }
      }
    }

    return bestMatch || universalFallback;
  }
}
