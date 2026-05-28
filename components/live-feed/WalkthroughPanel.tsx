"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_SCENARIOS } from "@/lib/simulation/demo-scenarios";
import { FIXTURE_AGENTS } from "@/lib/simulation/fixtures";
import AdCard from "@/components/live-feed/AdCard";

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

export default function WalkthroughPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealedDecisions, setRevealedDecisions] = useState(0);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [opportunityVisible, setOpportunityVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const scenario = DEMO_SCENARIOS[activeIndex]!;
  const isLastScenario = activeIndex === DEMO_SCENARIOS.length - 1;
  const bothRevealed = revealedDecisions >= 2;

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  // Reveal sequence triggered on activeIndex change
  useEffect(() => {
    setRevealedDecisions(0);
    setOpportunityVisible(false);
    setAutoAdvancing(false);
    clearTimer();

    // Fade in opportunity after one tick
    const t0 = setTimeout(() => setOpportunityVisible(true), 50);

    // Reveal first decision after 800ms
    const t1 = setTimeout(() => {
      setRevealedDecisions(1);
    }, 800);

    // Reveal second decision after 1600ms
    const t2 = setTimeout(() => {
      setRevealedDecisions(2);
    }, 1600);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeIndex]);

  // Auto-advance timer starts when both decisions are revealed (not on last scenario)
  useEffect(() => {
    if (!bothRevealed || isLastScenario) return;

    setAutoAdvancing(true);

    timerRef.current = setTimeout(() => {
      advance();
    }, 3000);

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bothRevealed, isLastScenario]);

  function advance() {
    clearTimer();
    setAutoAdvancing(false);
    if (activeIndex < DEMO_SCENARIOS.length - 1) {
      setActiveIndex((i) => i + 1);
    }
  }

  function jumpTo(index: number) {
    clearTimer();
    setAutoAdvancing(false);
    setActiveIndex(index);
  }

  function restart() {
    clearTimer();
    setAutoAdvancing(false);
    setActiveIndex(0);
  }

  const agentIds = ["nike", "nb"] as const;

  return (
    <div className="w-full">
      {/* Scenario pill buttons */}
      <div className="flex gap-2 flex-wrap">
        {DEMO_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => jumpTo(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === activeIndex
                ? "bg-white text-gray-900"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {/* Scenario card */}
      <div
        className={`rounded-xl border border-gray-700 bg-gray-900 p-5 mt-4 transition-opacity duration-300 ${
          opportunityVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top row: badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
              intentColors[scenario.opportunity.intent] ??
              "bg-gray-800 text-gray-400 border-gray-600"
            }`}
          >
            {scenario.opportunity.intent}
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400 border border-gray-600">
            {scenario.opportunity.category}
          </span>
          <span className="ml-auto text-xs text-gray-500 font-mono">
            CPC ${scenario.opportunity.suggestedCpc.toFixed(2)}
          </span>
        </div>

        {/* Query */}
        <p className="italic text-gray-300 text-sm mt-2 mb-4 leading-relaxed">
          &ldquo;{scenario.opportunity.query}&rdquo;
        </p>

        {/* Two-column decisions grid */}
        <div className="grid grid-cols-2 gap-4">
          {agentIds.map((agentId, colIndex) => {
            const agent = FIXTURE_AGENTS.find((a) => a.id === agentId);
            const decision =
              scenario.decisions[agentId as keyof typeof scenario.decisions];
            const isVisible = revealedDecisions > colIndex;
            const actionCfg = actionConfig[decision.action];

            return (
              <div
                key={agentId}
                className={`space-y-2 transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                {/* Agent header */}
                {agent && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: agent.brand.color }}
                    />
                    <span className="text-xs font-medium text-gray-300 truncate">
                      {agent.name}
                    </span>
                  </div>
                )}

                {/* Action badge + bid + won/lost */}
                <div className="flex items-center gap-2 flex-wrap">
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
                        backgroundColor: agent?.brand.color ?? "#888",
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

                {/* Ad card if won */}
                {decision.ad && agent && (
                  <div className="mt-2">
                    <AdCard ad={decision.ad} brand={agent.brand} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-advance progress bar */}
      <div className="h-0.5 bg-gray-700 rounded mt-4 overflow-hidden">
        <div
          ref={progressRef}
          className="h-full bg-white rounded"
          style={{
            width: autoAdvancing ? "0%" : "100%",
            transition: autoAdvancing ? "width 3s linear" : "none",
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs text-gray-600">
          Scenario {activeIndex + 1} of {DEMO_SCENARIOS.length}
        </span>
        <div className="flex gap-2">
          {isLastScenario && bothRevealed ? (
            <button
              onClick={restart}
              className="px-4 py-1.5 rounded-lg bg-gray-700 text-gray-200 text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              Restart
            </button>
          ) : (
            <button
              onClick={advance}
              disabled={isLastScenario && bothRevealed}
              className="px-4 py-1.5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-40"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
