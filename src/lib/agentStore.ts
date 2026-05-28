"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentConfig, AgentFormValues } from "./types";

const STORAGE_KEY = "agentbid-studio.agents";

export const seededAgents: AgentConfig[] = [
  {
    id: "seed-nike-alphafly-3",
    agentName: "Nike Alphafly 3 Performance Buyer",
    brandName: "Nike",
    goal:
      "Win high-intent running shoe and marathon-training prompts with sponsored answers for Nike Alphafly 3, while avoiding unsupported performance claims and unsafe health advice.",
    dailyBudget: 6400,
    maxCpc: 3.75,
    autonomyMode: "assisted",
    targetIntents: [
      "running-shoes",
      "marathon-training",
      "race-day-gear",
      "shoe-comparison",
      "performance-footwear",
    ],
    blockedCategories: [
      "medical-advice",
      "injury-treatment",
      "unsupported-performance-claims",
      "counterfeit-products",
      "adult",
    ],
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

export function agentToFormValues(agent: AgentConfig): AgentFormValues {
  return {
    agentName: agent.agentName,
    brandName: agent.brandName,
    goal: agent.goal,
    dailyBudget: String(agent.dailyBudget),
    maxCpc: String(agent.maxCpc),
    autonomyMode: agent.autonomyMode,
    targetIntents: agent.targetIntents.join(", "),
    blockedCategories: agent.blockedCategories.join(", "),
  };
}

export function updateAgentFromForm(
  agent: AgentConfig,
  values: AgentFormValues,
): AgentConfig {
  return {
    ...agent,
    agentName: values.agentName.trim(),
    brandName: values.brandName.trim(),
    goal: values.goal.trim(),
    dailyBudget: Number(values.dailyBudget),
    maxCpc: Number(values.maxCpc),
    autonomyMode: values.autonomyMode,
    targetIntents: parseTokens(values.targetIntents),
    blockedCategories: parseTokens(values.blockedCategories),
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
      updateAgent: (updatedAgent: AgentConfig) => {
        setAgents((current) =>
          current.map((agent) =>
            agent.id === updatedAgent.id ? updatedAgent : agent,
          ),
        );
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
