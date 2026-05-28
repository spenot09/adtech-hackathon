"use client";

import type { Agent } from "@/lib/types/agent";

type Props = {
  agent: Agent;
};

const statusConfig = {
  paused: {
    label: "Paused",
    class: "bg-gray-700 text-gray-300",
    dotClass: "",
  },
  active: {
    label: "Active",
    class: "bg-green-900/60 text-green-300",
    dotClass: "animate-pulse bg-green-400",
  },
  stopped: {
    label: "Stopped",
    class: "bg-red-900/60 text-red-300",
    dotClass: "bg-red-400",
  },
};

export default function AgentRunnerBar({ agent }: Props) {
  const cfg = statusConfig[agent.status];
  const spentPct = Math.min(
    100,
    (agent.spend / agent.dailyBudgetCap) * 100
  );
  const remaining = Math.max(0, agent.dailyBudgetCap - agent.spend);

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 flex-1 min-w-0">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        {/* Brand color swatch */}
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: agent.brand.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {agent.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{agent.brand.name}</p>
        </div>
        {/* Status badge */}
        <span
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}
        >
          {cfg.dotClass && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`}
            />
          )}
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${spentPct}%`,
              backgroundColor: agent.brand.color,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>${agent.spend.toFixed(2)} spent</span>
          <span>${remaining.toFixed(2)} remaining</span>
        </div>
      </div>
    </div>
  );
}
