import type { Opportunity, Decision } from "@/lib/types/agent";
import { AD_TEMPLATES } from "@/lib/simulation/ad-templates";

export type DemoScenario = {
  id: string;
  label: string;
  opportunity: Opportunity;
  decisions: { nike: Decision; nb: Decision };
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "athletic",
    label: "Athletic Context",
    opportunity: {
      id: "demo-opp-1",
      timestamp: Date.now(),
      query: "What's the best shoe for running a marathon in under 4 hours?",
      intent: "running",
      category: "footwear",
      suggestedCpc: 3.50,
    },
    decisions: {
      nike: {
        agentId: "nike",
        opportunityId: "demo-opp-1",
        action: "bid",
        bidAmount: 5.28,
        reason:
          "96% relevance — bidding $5.28. Running performance is core territory.",
        relevance: {
          matchedKeywords: ["run", "marathon"],
          intentMatched: true,
          score: 0.96,
        },
        won: true,
        ad: AD_TEMPLATES["nike"]!["running"]!,
      },
      nb: {
        agentId: "nb",
        opportunityId: "demo-opp-1",
        action: "bid",
        bidAmount: 2.80,
        reason: "70% relevance — bidding $2.80. Running shoes are in range.",
        relevance: {
          matchedKeywords: ["shoes"],
          intentMatched: false,
          score: 0.70,
        },
        won: false,
      },
    },
  },
  {
    id: "street-style",
    label: "Street Style Context",
    opportunity: {
      id: "demo-opp-2",
      timestamp: Date.now(),
      query:
        "Looking for classic sneakers that go with anything — everyday street style",
      intent: "shopping",
      category: "footwear",
      suggestedCpc: 2.80,
    },
    decisions: {
      nb: {
        agentId: "nb",
        opportunityId: "demo-opp-2",
        action: "bid",
        bidAmount: 3.88,
        reason:
          "97% relevance — bidding $3.88. Street and casual footwear is our core.",
        relevance: {
          matchedKeywords: ["sneakers", "street", "casual", "style", "everyday"],
          intentMatched: true,
          score: 0.97,
        },
        won: true,
        ad: AD_TEMPLATES["nb"]!["shopping"]!,
      },
      nike: {
        agentId: "nike",
        opportunityId: "demo-opp-2",
        action: "bid",
        bidAmount: 2.48,
        reason:
          "45% relevance — bidding $2.48. Footwear adjacency but not performance territory.",
        relevance: {
          matchedKeywords: ["shoes"],
          intentMatched: true,
          score: 0.45,
        },
        won: false,
      },
    },
  },
  {
    id: "irrelevant",
    label: "Irrelevant Context",
    opportunity: {
      id: "demo-opp-3",
      timestamp: Date.now(),
      query: "Can you recommend a good accountant for small business taxes?",
      intent: "finance-advice",
      category: "finance",
      suggestedCpc: 2.20,
    },
    decisions: {
      nike: {
        agentId: "nike",
        opportunityId: "demo-opp-3",
        action: "skip",
        reason: "Low relevance: Nike keywords don't match finance-advice.",
        relevance: {
          matchedKeywords: [],
          intentMatched: false,
          score: 0.04,
        },
        won: false,
      },
      nb: {
        agentId: "nb",
        opportunityId: "demo-opp-3",
        action: "skip",
        reason: "Low relevance: New Balance keywords don't match finance-advice.",
        relevance: {
          matchedKeywords: [],
          intentMatched: false,
          score: 0.03,
        },
        won: false,
      },
    },
  },
];
