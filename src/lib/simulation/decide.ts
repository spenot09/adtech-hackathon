import type { Agent, Opportunity, RelevanceScore, Decision } from "@/lib/types/agent";
import { runPolicyChecks } from "@/lib/simulation/policies";

/**
 * Rule-based decision logic. Evaluates in priority order and returns the first matching action.
 * Does NOT determine `won` — the engine handles win/loss simulation.
 */
export function decide(
  agent: Agent,
  opp: Opportunity,
  relevance: RelevanceScore
): Decision {
  const policyChecks = runPolicyChecks(agent, opp, relevance.score);
  const base = {
    agentId: agent.id,
    opportunityId: opp.id,
    relevance,
    policyChecks,
  };

  // Rule 1: Blocked category
  if (agent.blockedCategories.includes(opp.category)) {
    return {
      ...base,
      action: "block",
      reason: `Category ${opp.category} is in your block list.`,
    };
  }

  // Rule 2: Suggested CPC exceeds agent max CPC
  if (opp.suggestedCpc > agent.maxCpc) {
    return {
      ...base,
      action: "skip",
      reason: `Suggested CPC $${opp.suggestedCpc.toFixed(2)} exceeds your max CPC $${agent.maxCpc.toFixed(2)}.`,
    };
  }

  // Rule 3: Would exceed daily budget cap
  if (agent.spend + opp.suggestedCpc > agent.dailyBudgetCap) {
    return {
      ...base,
      action: "skip",
      reason: "Would exceed daily budget cap.",
    };
  }

  // Rule 4: Low relevance
  if (relevance.score < 0.15) {
    return {
      ...base,
      action: "skip",
      reason: `Low relevance: ${agent.brand.name} keywords don't match ${opp.intent}.`,
    };
  }

  // Rule 5: High-value, high-relevance bid near max CPC — escalate for non-autonomous agents
  if (
    relevance.score >= 0.7 &&
    opp.suggestedCpc >= agent.maxCpc * 0.9 &&
    agent.autonomyMode !== "autonomous"
  ) {
    return {
      ...base,
      action: "review",
      reason:
        "High-value high-relevance bid near max CPC — escalating per autonomy policy.",
    };
  }

  // Rule 6: Bid
  const bidAmount = Number(
    (agent.maxCpc * (0.4 + 0.6 * relevance.score)).toFixed(2)
  );
  return {
    ...base,
    action: "bid",
    bidAmount,
    reason: `Relevance ${(relevance.score * 100).toFixed(0)}% — bidding $${bidAmount}.`,
  };
}
