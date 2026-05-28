"use client";

import { useSyncExternalStore } from "react";
import type { Agent, Opportunity, Decision } from "@/lib/types/agent";
import { cloneFixtureAgents } from "@/lib/simulation/fixtures";

export type SimulationEvent = {
  opportunity: Opportunity;
  decisions: Record<string, Decision>;
};

type SimulationStore = {
  agents: Agent[];
  events: SimulationEvent[];
  promptVariant: "baseline" | "optimized";
  listeners: Set<() => void>;
  subscribe: (fn: () => void) => () => void;
  emit: () => void;
  start: () => void;
  stop: () => void;
  reset: () => void;
  applyDecisions: (
    opp: Opportunity,
    decisionsByAgent: Record<string, Decision>
  ) => void;
  setAgentStatus: (status: "paused" | "active" | "stopped") => void;
  setPromptVariant: (v: "baseline" | "optimized") => void;
  getSnapshot: () => { agents: Agent[]; events: SimulationEvent[]; promptVariant: "baseline" | "optimized" };
};

const MAX_EVENTS = 50;

function createStore(): SimulationStore {
  const store: SimulationStore = {
    agents: cloneFixtureAgents(),
    events: [],
    promptVariant: "optimized",
    listeners: new Set(),

    subscribe(fn) {
      store.listeners.add(fn);
      return () => store.listeners.delete(fn);
    },

    emit() {
      store.listeners.forEach((fn) => fn());
    },

    start() {
      store.setAgentStatus("active");
      store.emit();
    },

    stop() {
      store.setAgentStatus("stopped");
      store.emit();
    },

    reset() {
      store.agents = cloneFixtureAgents();
      store.events = [];
      store.emit();
    },

    applyDecisions(opp, decisionsByAgent) {
      for (const [agentId, decision] of Object.entries(decisionsByAgent)) {
        if (decision.action === "bid" && decision.won) {
          const agent = store.agents.find((a) => a.id === agentId);
          if (agent && decision.bidAmount !== undefined) {
            agent.spend = Number((agent.spend + decision.bidAmount).toFixed(2));
          }
        }
      }

      store.events = [
        { opportunity: opp, decisions: decisionsByAgent },
        ...store.events,
      ].slice(0, MAX_EVENTS);
    },

    setAgentStatus(status) {
      store.agents = store.agents.map((a) => ({ ...a, status }));
    },

    setPromptVariant(v) {
      store.promptVariant = v;
      store.emit();
    },

    getSnapshot() {
      return { agents: store.agents, events: store.events, promptVariant: store.promptVariant };
    },
  };

  return store;
}

// Module-level singleton — shared across all consumers in the same client bundle
export const simulationStore = createStore();

// React hook for consuming the store in client components
let snapshot = simulationStore.getSnapshot();

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return { agents: [] as Agent[], events: [] as SimulationEvent[], promptVariant: "optimized" as const };
}

export function useSimulation() {
  const data = useSyncExternalStore(
    (fn) => {
      return simulationStore.subscribe(() => {
        snapshot = simulationStore.getSnapshot();
        fn();
      });
    },
    getSnapshot,
    getServerSnapshot
  );

  return {
    agents: data.agents,
    events: data.events,
    promptVariant: data.promptVariant,
    start: simulationStore.start.bind(simulationStore),
    stop: simulationStore.stop.bind(simulationStore),
    reset: simulationStore.reset.bind(simulationStore),
    setPromptVariant: simulationStore.setPromptVariant.bind(simulationStore),
  };
}
