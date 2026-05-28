import type { Agent } from "@/lib/types/agent";

export const FIXTURE_AGENTS: Agent[] = [
  {
    id: "nike",
    name: "Nike Performance Bidder",
    brand: {
      name: "Nike",
      color: "#111111",
      voice: "Bold, athletic, motivational — Just Do It energy",
      designGuidelines: "Black/white, clean sans, speed and motion",
      keywords: [
        "run", "athletic", "sport", "performance", "marathon",
        "training", "workout", "gym", "race", "sprint",
      ],
    },
    goal: "Win athletic and running-focused placements",
    dailyBudgetCap: 600,
    maxCpc: 5.50,
    autonomyMode: "autonomous",
    targetIntents: ["fitness", "running", "shopping", "travel-booking"],
    blockedCategories: ["medical-advice", "counterfeit-products"],
    status: "paused",
    spend: 0,
    policies: [
      {
        id: "blocked_category",
        name: "Blocked categories",
        description: "Never bid on ad slots in these content categories.",
        displayValue: "medical-advice, counterfeit-products",
      },
      {
        id: "max_cpc_per_ad",
        name: "Max CPC per ad",
        description: "Maximum cost-per-click allowed for any single placement.",
        displayValue: "$5.50",
      },
      {
        id: "max_daily_spend",
        name: "Daily budget cap",
        description: "Total spend must not exceed this amount within a 24-hour window.",
        displayValue: "$600",
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
    ],
  },
  {
    id: "nb",
    name: "New Balance Bidder",
    brand: {
      name: "New Balance",
      color: "#CF3A2C",
      voice: "Authentic, crafted, heritage street style",
      designGuidelines: "Red/grey, heritage feel, craftsmanship cues",
      keywords: [
        "shoes", "sneakers", "street", "casual", "walking",
        "style", "comfort", "everyday", "fashion",
      ],
    },
    goal: "Win street-style and casual footwear placements",
    dailyBudgetCap: 400,
    maxCpc: 4.00,
    autonomyMode: "autonomous",
    targetIntents: ["shopping", "fitness", "running", "general-question"],
    blockedCategories: ["medical-advice", "counterfeit-products"],
    status: "paused",
    spend: 0,
    policies: [
      {
        id: "blocked_category",
        name: "Blocked categories",
        description: "Never bid on ad slots in these content categories.",
        displayValue: "medical-advice, counterfeit-products",
      },
      {
        id: "max_cpc_per_ad",
        name: "Max CPC per ad",
        description: "Maximum cost-per-click allowed for any single placement.",
        displayValue: "$4.00",
      },
      {
        id: "max_daily_spend",
        name: "Daily budget cap",
        description: "Total spend must not exceed this amount within a 24-hour window.",
        displayValue: "$400",
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
    ],
  },
];

/** Returns a deep clone of FIXTURE_AGENTS — use for reset so original is never mutated. */
export function cloneFixtureAgents(): Agent[] {
  return FIXTURE_AGENTS.map((agent) => ({
    ...agent,
    brand: { ...agent.brand, keywords: [...agent.brand.keywords] },
    targetIntents: [...agent.targetIntents],
    blockedCategories: [...agent.blockedCategories],
    policies: agent.policies.map((p) => ({ ...p })),
  }));
}
