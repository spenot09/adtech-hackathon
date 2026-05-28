import type { Agent } from "@/lib/types/agent";

export const FIXTURE_AGENTS: Agent[] = [
  {
    id: "coke",
    name: "Coca-Cola Bidder",
    brand: {
      name: "Coca-Cola",
      color: "#F40009",
      voice:
        "Iconic, joyful, refreshment-first; classic American optimism.",
      designGuidelines:
        "Bold red, white serif wordmark feel, condensation/ice cues, energetic.",
      keywords: [
        "cold",
        "drink",
        "hot",
        "summer",
        "ice",
        "refresh",
        "thirsty",
        "beach",
        "vacation",
      ],
    },
    goal: "Win refreshment and thirst-driven placements",
    dailyBudgetCap: 500,
    maxCpc: 4.5,
    autonomyMode: "autonomous",
    targetIntents: ["thirst", "refreshment", "summer", "travel-booking", "food"],
    blockedCategories: ["medical", "gambling", "politics"],
    status: "paused",
    spend: 0,
  },
  {
    id: "stride",
    name: "Stride Athletic Bidder",
    brand: {
      name: "Stride Athletic",
      color: "#1E3A8A",
      voice: "Driven, performance-oriented, encouraging.",
      designGuidelines:
        "Deep navy, clean sans, motion lines, athletic energy.",
      keywords: [
        "shoes",
        "run",
        "athletic",
        "fitness",
        "marathon",
        "comfortable",
        "walking",
      ],
    },
    goal: "Win fitness and running-shoe placements",
    dailyBudgetCap: 500,
    maxCpc: 4.0,
    autonomyMode: "autonomous",
    targetIntents: ["fitness", "running", "shopping", "travel-booking"],
    blockedCategories: ["medical", "gambling", "politics"],
    status: "paused",
    spend: 0,
  },
];

/** Returns a deep clone of FIXTURE_AGENTS — use for reset so original is never mutated. */
export function cloneFixtureAgents(): Agent[] {
  return FIXTURE_AGENTS.map((agent) => ({
    ...agent,
    brand: { ...agent.brand, keywords: [...agent.brand.keywords] },
    targetIntents: [...agent.targetIntents],
    blockedCategories: [...agent.blockedCategories],
  }));
}
