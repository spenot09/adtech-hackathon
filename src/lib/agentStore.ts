"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentConfig, AgentFormValues } from "./types";

const STORAGE_KEY = "agentbid-studio.agents";

export const seededAgents: AgentConfig[] = [
  {
    id: "seed-northstar-travel",
    agentName: "Lisbon Weekend Buyer",
    brandName: "Northstar Travel",
    goal: "Win high-intent travel planning prompts for boutique hotel and flight packages.",
    dailyBudget: 1250,
    maxCpc: 4.75,
    autonomyMode: "assisted",
    targetIntents: ["travel-booking", "hotel-search", "flight-comparison"],
    blockedCategories: ["medical", "debt-relief", "adult"],
    status: "paused",
    createdAt: new Date("2026-05-28T18:00:00.000Z").toISOString(),
  },
];

function parseTokens(value: string) {
  return value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

function readStoredAgents() {
  if (typeof window === "undefined") {
    return seededAgents;
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return seededAgents;
    }

    const parsed = JSON.parse(stored) as AgentConfig[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seededAgents;
  } catch {
    return seededAgents;
  }
}

export function createAgentFromForm(values: AgentFormValues): AgentConfig {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `agent-${Date.now()}`,
    agentName: values.agentName.trim(),
    brandName: values.brandName.trim(),
    goal: values.goal.trim(),
    dailyBudget: Number(values.dailyBudget),
    maxCpc: Number(values.maxCpc),
    autonomyMode: values.autonomyMode,
    targetIntents: parseTokens(values.targetIntents),
    blockedCategories: parseTokens(values.blockedCategories),
    status: "paused",
    createdAt: new Date().toISOString(),
  };
}

export function useAgentStore() {
  const [agents, setAgents] = useState<AgentConfig[]>(seededAgents);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAgents(readStoredAgents());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  }, [agents, loaded]);

  return useMemo(
    () => ({
      agents,
      addAgent: (agent: AgentConfig) => {
        setAgents((current) => [agent, ...current]);
      },
      totalBudget: agents.reduce((sum, agent) => sum + agent.dailyBudget, 0),
      averageMaxCpc:
        agents.length === 0
          ? 0
          : agents.reduce((sum, agent) => sum + agent.maxCpc, 0) / agents.length,
    }),
    [agents],
  );
}
