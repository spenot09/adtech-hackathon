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
