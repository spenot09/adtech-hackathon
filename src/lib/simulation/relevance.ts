import type { Agent, Opportunity, RelevanceScore } from "@/lib/types/agent";

/**
 * Deterministic keyword + intent relevance scoring.
 * No randomness — same agent + opportunity always produces the same score.
 */
export function scoreRelevance(
  agent: Agent,
  opp: Opportunity
): RelevanceScore {
  const queryTokens = opp.query
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);

  const normalizedKeywords = agent.brand.keywords.map((k) => k.toLowerCase());

  const matchedKeywords = normalizedKeywords.filter((kw) =>
    queryTokens.includes(kw)
  );

  const intentMatched = agent.targetIntents.includes(opp.intent);

  // Scoring: keyword overlap ratio boosted by intent match
  const raw = matchedKeywords.length / agent.brand.keywords.length;
  const intentWeight = intentMatched ? 1.0 : 0.3;
  const score = Math.min(1, raw * intentWeight * 2);

  return {
    matchedKeywords,
    intentMatched,
    score,
  };
}
