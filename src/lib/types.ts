export type AutonomyMode = "manual" | "assisted" | "autonomous";

export type AgentStatus = "active" | "paused" | "needs_review";

export type AgentConfig = {
  id: string;
  agentName: string;
  brandName: string;
  goal: string;
  dailyBudget: number;
  maxCpc: number;
  autonomyMode: AutonomyMode;
  targetIntents: string[];
  blockedCategories: string[];
  status: AgentStatus;
  createdAt: string;
};

export type AgentFormValues = {
  agentName: string;
  brandName: string;
  goal: string;
  dailyBudget: string;
  maxCpc: string;
  autonomyMode: AutonomyMode;
  targetIntents: string;
  blockedCategories: string;
};

export type AnalyticsSeriesPoint = {
  date: string;
  spend: number;
  revenue: number;
};

export type AnalyticsCampaign = {
  id: string;
  brand: "Nike" | "New Balance";
  campaignName: string;
  accent: "charcoal" | "red";
  budgetCap: number;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  bidsWon: number;
  averageCpc: number;
  maxCpcGuardrail: number;
  skippedUnsafePrompts: number;
  blockedCategoriesCount: number;
  unsupportedClaimsPrevented: number;
  unsafeSpendAvoided: number;
  series: AnalyticsSeriesPoint[];
};

export type RevenueSegment = {
  segment: string;
  leadingCampaign: string;
  clicks: number;
  spend: number;
  revenue: number;
};
