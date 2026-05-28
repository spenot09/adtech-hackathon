"use client";

import type { Opportunity, Decision, Agent } from "@/lib/types/agent";
import AdCard from "@/components/live-feed/AdCard";

type Props = {
  opportunity: Opportunity;
  decisions: Record<string, Decision>;
  agents: Agent[];
};

const intentColors: Record<string, string> = {
  thirst: "bg-blue-900/60 text-blue-300 border-blue-700",
  refreshment: "bg-cyan-900/60 text-cyan-300 border-cyan-700",
  summer: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  "travel-booking": "bg-purple-900/60 text-purple-300 border-purple-700",
  food: "bg-orange-900/60 text-orange-300 border-orange-700",
  fitness: "bg-green-900/60 text-green-300 border-green-700",
  running: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  shopping: "bg-pink-900/60 text-pink-300 border-pink-700",
  "finance-advice": "bg-teal-900/60 text-teal-300 border-teal-700",
  medical: "bg-red-900/60 text-red-300 border-red-700",
  "general-question": "bg-gray-800 text-gray-400 border-gray-600",
};

const actionConfig = {
  bid: { label: "BID", class: "bg-blue-600 text-white" },
  skip: { label: "SKIP", class: "bg-gray-700 text-gray-300" },
  block: { label: "BLOCK", class: "bg-red-700 text-white" },
  review: { label: "REVIEW", class: "bg-amber-600 text-white" },
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function OpportunityCard({
  opportunity,
  decisions,
  agents,
}: Props) {
  const intentClass =
    intentColors[opportunity.intent] ?? "bg-gray-800 text-gray-400 border-gray-600";

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-sm">
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 font-mono">
          {formatTime(opportunity.timestamp)}
        </span>
        <span
          className={`px-2 py-0.5 text-xs rounded-full border font-medium ${intentClass}`}
        >
          {opportunity.intent}
        </span>
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400 border border-gray-600">
          {opportunity.category}
        </span>
        <span className="ml-auto text-xs text-gray-500 font-mono">
          CPC ${opportunity.suggestedCpc.toFixed(2)}
        </span>
      </div>

      {/* Query */}
      <p className="italic text-gray-300 text-sm mb-3 leading-relaxed">
        &ldquo;{opportunity.query}&rdquo;
      </p>

      {/* Two-column decision strip */}
      <div className="grid grid-cols-2 gap-3">
        {agents.map((agent) => {
          const decision = decisions[agent.id];
          if (!decision) return null;
          const actionCfg = actionConfig[decision.action];

          return (
            <div key={agent.id} className="space-y-2">
              {/* Agent header */}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: agent.brand.color }}
                />
                <span className="text-xs font-medium text-gray-300 truncate">
                  {agent.name}
                </span>
              </div>

              {/* Action badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded ${actionCfg.class}`}
                >
                  {actionCfg.label}
                </span>
                {decision.bidAmount !== undefined && (
                  <span className="text-xs font-mono text-white">
                    ${decision.bidAmount.toFixed(2)}
                  </span>
                )}
                {decision.won !== undefined && (
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      decision.won
                        ? "bg-green-900/60 text-green-300"
                        : "bg-red-900/60 text-red-400"
                    }`}
                  >
                    {decision.won ? "WON" : "LOST"}
                  </span>
                )}
              </div>

              {/* Relevance bar */}
              <div className="space-y-0.5">
                <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${decision.relevance.score * 100}%`,
                      backgroundColor: agent.brand.color,
                    }}
                  />
                </div>
                <p className="text-gray-500 text-xs">
                  {(decision.relevance.score * 100).toFixed(0)}% relevant
                </p>
              </div>

              {/* Reason */}
              <p className="text-xs text-gray-400 leading-snug">
                {decision.reason}
              </p>

              {/* Ad card on win */}
              {decision.ad && (
                <div className="mt-2">
                  <AdCard ad={decision.ad} brand={agent.brand} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
