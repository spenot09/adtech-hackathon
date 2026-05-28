import type { Agent } from "@/lib/types/agent";

export const FIXTURE_AGENTS: Agent[] = [
  {
    id: "nike",
    name: "Nike Performance Bidder",
    brand: {
      name: "Nike",
      color: "#111111",
      voice: "Bold, athletic, motivational — Just Do It energy",
      designGuidelines:
        "Black/white, clean sans, speed and motion",
      keywords: [
        "run",
        "athletic",
        "sport",
        "performance",
        "marathon",
        "training",
        "workout",
        "gym",
        "race",
        "sprint",
      ],
    },
    goal: "Win athletic and running-focused placements",
    dailyBudgetCap: 600,
    maxCpc: 5.50,
    autonomyMode: "autonomous",
    targetIntents: ["fitness", "running", "shopping", "travel-booking"],
    blockedCategories: ["medical", "gambling", "politics"],
    status: "paused",
    spend: 0,
  },
  {
    id: "nb",
    name: "New Balance Bidder",
    brand: {
      name: "New Balance",
      color: "#CF3A2C",
      voice: "Authentic, crafted, heritage street style",
      designGuidelines:
        "Red/grey, heritage feel, craftsmanship cues",
      keywords: [
        "shoes",
        "sneakers",
        "street",
        "casual",
        "walking",
        "style",
        "comfort",
        "everyday",
        "fashion",
      ],
    },
    goal: "Win street-style and casual footwear placements",
    dailyBudgetCap: 400,
    maxCpc: 4.00,
    autonomyMode: "autonomous",
    targetIntents: ["shopping", "fitness", "running", "general-question"],
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
