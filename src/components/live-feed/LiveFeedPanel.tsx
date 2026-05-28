"use client";

import { useSimulation } from "@/lib/simulation/store";
import { startEngine, stopEngine } from "@/lib/simulation/engine";
import AgentRunnerBar from "@/components/live-feed/AgentRunnerBar";
import OpportunityCard from "@/components/live-feed/OpportunityCard";
import { simulationStore } from "@/lib/simulation/store";

export default function LiveFeedPanel() {
  const { agents, events } = useSimulation();

  const isRunning = agents.some((a) => a.status === "active");

  function handleStart() {
    startEngine();
  }

  function handleStop() {
    stopEngine();
  }

  function handleReset() {
    stopEngine();
    simulationStore.reset();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Control bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500 text-white"
        >
          Start All
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-red-700 hover:bg-red-600 text-white"
        >
          Stop All
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-gray-700 hover:bg-gray-600 text-white"
        >
          Reset
        </button>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-sm text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Per-agent runner bars */}
      <div className="flex gap-3 flex-wrap">
        {agents.map((agent) => (
          <AgentRunnerBar key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Feed */}
      <div
        className="flex flex-col gap-3 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 260px)" }}
      >
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 p-10 text-center text-gray-500 text-sm">
            Press <span className="font-semibold text-gray-300">Start</span> to
            begin the live bidding stream — Coke and Stride will compete on
            every opportunity.
          </div>
        ) : (
          events.map((event) => (
            <OpportunityCard
              key={event.opportunity.id}
              opportunity={event.opportunity}
              decisions={event.decisions}
              agents={agents}
            />
          ))
        )}
      </div>
    </div>
  );
}
