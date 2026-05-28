import type { Agent, Opportunity, PolicyCheck, PolicyRule } from "@/lib/types/agent";

export function buildAgentPolicies(agent: Agent): PolicyRule[] {
  return [
    {
      id: "blocked_category",
      name: "Blocked categories",
      description: "Never bid on ad slots in these content categories.",
      displayValue: agent.blockedCategories.join(", "),
    },
    {
      id: "max_cpc_per_ad",
      name: "Max CPC per ad",
      description: "Maximum cost-per-click allowed for any single placement.",
      displayValue: `$${agent.maxCpc.toFixed(2)}`,
    },
    {
      id: "max_daily_spend",
      name: "Daily budget cap",
      description: "Total spend must not exceed this amount within a 24-hour window.",
      displayValue: `$${agent.dailyBudgetCap.toFixed(0)}`,
    },
    {
      id: "min_relevance",
      name: "Min relevance score",
      description: "Skip bids where the opportunity relevance falls below 15%.",
      displayValue: "15%",
    },
    {
      id: "escalate_threshold",
      name: "Escalation threshold",
      description: "Escalate to human review when bid is ≥90% of max CPC and relevance is ≥70%.",
      displayValue: "90% of max CPC + 70% relevance",
    },
  ];
}

export function runPolicyChecks(
  agent: Agent,
  opp: Opportunity,
  relevanceScore: number
): PolicyCheck[] {
  const blockedHit = agent.blockedCategories.includes(opp.category);
  const cpcExceeds = opp.suggestedCpc > agent.maxCpc;
  const budgetExceeds = agent.spend + opp.suggestedCpc > agent.dailyBudgetCap;
  const lowRelevance = relevanceScore < 0.15;
  const shouldEscalate =
    relevanceScore >= 0.7 &&
    opp.suggestedCpc >= agent.maxCpc * 0.9 &&
    agent.autonomyMode !== "autonomous";

  return [
    {
      ruleId: "blocked_category",
      ruleName: "Blocked categories",
      passed: !blockedHit,
      detail: blockedHit
        ? `"${opp.category}" matches blocked list`
        : `"${opp.category}" is not blocked`,
    },
    {
      ruleId: "max_cpc_per_ad",
      ruleName: "Max CPC per ad",
      passed: !cpcExceeds,
      detail: `$${opp.suggestedCpc.toFixed(2)} vs $${agent.maxCpc.toFixed(2)} limit`,
    },
    {
      ruleId: "max_daily_spend",
      ruleName: "Daily budget cap",
      passed: !budgetExceeds,
      detail: `$${(agent.spend + opp.suggestedCpc).toFixed(2)} projected vs $${agent.dailyBudgetCap.toFixed(0)} cap`,
    },
    {
      ruleId: "min_relevance",
      ruleName: "Min relevance (15%)",
      passed: !lowRelevance,
      detail: `${(relevanceScore * 100).toFixed(0)}% relevance`,
    },
    {
      ruleId: "escalate_threshold",
      ruleName: "Escalation check",
      passed: !shouldEscalate,
      detail: shouldEscalate
        ? "High-value near max CPC — flagged for human review"
        : "Within autonomous range",
    },
  ];
}
