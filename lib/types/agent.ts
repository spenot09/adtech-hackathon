// Shared types for AgentBid Studio — consumed by Phase 1 and Phase 2

export type AutonomyMode = "manual" | "assisted" | "autonomous";

export type Intent =
  | "thirst"
  | "refreshment"
  | "summer"
  | "travel-booking"
  | "food"
  | "fitness"
  | "running"
  | "shopping"
  | "finance-advice"
  | "medical"
  | "general-question";

export type Brand = {
  name: string;
  color: string; // hex, e.g. "#F40009"
  voice: string; // 1-line tone description
  designGuidelines: string; // 1-2 lines on visual style
  keywords: string[];
};

export type Agent = {
  id: string;
  name: string;
  brand: Brand;
  goal: string;
  dailyBudgetCap: number;
  maxCpc: number;
  autonomyMode: AutonomyMode;
  targetIntents: Intent[];
  blockedCategories: string[];
  status: "paused" | "active" | "stopped";
  spend: number;
};

export type Opportunity = {
  id: string;
  timestamp: number;
  query: string;
  intent: Intent;
  category: string;
  suggestedCpc: number;
};

export type RelevanceScore = {
  matchedKeywords: string[];
  intentMatched: boolean;
  score: number;
};

export type ImageStyle = {
  background: string; // CSS gradient or solid color
  iconEmoji: string;
  accentShape: "circle" | "diamond" | "wave" | "burst";
  motionHint?: "pulse" | "float" | "shimmer";
};

export type Ad = {
  headline: string;
  body: string;
  cta: string;
  imageStyle: ImageStyle;
  source: "template" | "fallback";
};

export type Decision = {
  agentId: string;
  opportunityId: string;
  action: "bid" | "skip" | "block" | "review";
  bidAmount?: number;
  reason: string;
  relevance: RelevanceScore;
  won?: boolean;
  ad?: Ad;
};
