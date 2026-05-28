import type { Agent, Decision } from "@/lib/types/agent";
import { sampleOpportunity } from "@/lib/simulation/opportunities";
import { scoreRelevance } from "@/lib/simulation/relevance";
import { decideBid } from "@/agent/decideBid";
import { pickAd } from "@/lib/simulation/ad-templates";
import { simulationStore } from "@/lib/simulation/store";

type SimulationOptions = {
  agents: Agent[];
};

let timerId: ReturnType<typeof setTimeout> | null = null;

/**
 * N-agent simulation engine. Ticks every 0.8–1.8s.
 * Calls decideBid() per tick per agent (LLM-backed, falls back to rule-based),
 * simulates 75% win rate on bids, attaches templated Ad synchronously on wins,
 * stops when all agents are out of budget or stopped.
 */
export function runSimulation({ agents }: SimulationOptions) {
  async function tick() {
    // Check stop conditions
    const currentAgents = simulationStore.agents;
    const hasActiveAgents = currentAgents.some((a) => a.status === "active");
    if (!hasActiveAgents) return;

    const anyWithBudget = currentAgents.some(
      (a) => a.status === "active" && a.spend < a.dailyBudgetCap
    );
    if (!anyWithBudget) {
      simulationStore.stop();
      return;
    }

    const opp = sampleOpportunity();
    const decisionsByAgent: Record<string, Decision> = {};

    const activeAgents = currentAgents.filter(
      (a) => a.status === "active" && a.spend < a.dailyBudgetCap
    );

    await Promise.all(
      activeAgents.map(async (agent) => {
        const relevance = scoreRelevance(agent, opp);
        const result = await decideBid(opp, agent, {
          promptVariant: simulationStore.promptVariant ?? "optimized",
        });

        const decision: Decision = {
          agentId: agent.id,
          opportunityId: opp.id,
          relevance,
          action: result.decision,
          bidAmount: result.bidAmount ?? undefined,
          reason: result.reason,
        };

        if (decision.action === "bid") {
          // Simulate 75% win rate
          const won = Math.random() < 0.75;
          decision.won = won;
          if (won) {
            decision.ad = pickAd(agent, opp);
          }
        }

        decisionsByAgent[agent.id] = decision;
      })
    );

    simulationStore.applyDecisions(opp, decisionsByAgent);
    simulationStore.emit();

    // Schedule next tick with random interval 800-1800ms
    const delay = 800 + Math.floor(Math.random() * 1000);
    timerId = setTimeout(() => tick().catch((err) => console.error("tick failed", err)), delay);
  }

  // Start the first tick
  const initialDelay = 800 + Math.floor(Math.random() * 1000);
  timerId = setTimeout(() => tick().catch((err) => console.error("tick failed", err)), initialDelay);
}

/** Convenience wrapper: sets agents active and starts the engine using the default store. */
export function startEngine() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
  simulationStore.start();
  runSimulation({ agents: simulationStore.agents });
}

/** Convenience wrapper: stops all agents and clears the timer. */
export function stopEngine() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
  simulationStore.stop();
}
