"use client";

import { Ban, CircleDollarSign, Gauge, Scale, ShieldAlert, ShieldCheck } from "lucide-react";
import { FIXTURE_AGENTS } from "@/lib/simulation/fixtures";
import type { PolicyRule } from "@/lib/types/agent";

const policyIcons: Record<string, React.ElementType> = {
  blocked_category: Ban,
  max_cpc_per_ad: CircleDollarSign,
  max_daily_spend: Gauge,
  min_relevance: Scale,
  escalate_threshold: ShieldAlert,
};

export function PoliciesPanel() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-1">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <ShieldCheck size={16} />
          Policies
        </div>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Bidding policies</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Rules each agent must satisfy before placing a bid. Every decision in the
          simulation is checked against these constraints in real time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {FIXTURE_AGENTS.map((agent) => (
          <section
            key={agent.id}
            className="rounded-xl border border-line bg-white shadow-soft overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-5 py-4 border-b border-line"
              style={{ borderLeftWidth: 4, borderLeftColor: agent.brand.color }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {agent.brand.name}
                </p>
                <h2 className="text-base font-semibold text-ink">{agent.name}</h2>
              </div>
            </div>

            <div className="divide-y divide-line">
              {agent.policies.map((policy) => (
                <PolicyRow key={policy.id} policy={policy} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-line bg-white shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="text-base font-semibold text-ink">How policies are enforced</h2>
          <p className="mt-1 text-sm text-slate-500">
            Each bid opportunity is evaluated against all policies before a decision is made.
          </p>
        </div>
        <div className="px-5 py-4">
          <ol className="grid gap-3">
            {[
              { step: "1", label: "Blocked categories checked first", detail: "Any opportunity in a blocked category is immediately blocked — no bid is placed." },
              { step: "2", label: "Max CPC validated", detail: "If the suggested CPC exceeds the agent's limit, the bid is skipped." },
              { step: "3", label: "Daily budget ceiling", detail: "If placing the bid would push total daily spend over cap, the bid is skipped." },
              { step: "4", label: "Relevance threshold", detail: "Opportunities below 15% relevance are skipped to avoid wasted spend." },
              { step: "5", label: "Escalation gate", detail: "High-value bids near max CPC in assisted/manual mode are routed for human review instead of auto-firing." },
            ].map(({ step, label, detail }) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs leading-5 text-slate-500">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function PolicyRow({ policy }: { policy: PolicyRule }) {
  const Icon = policyIcons[policy.id] ?? ShieldCheck;
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-line bg-panel text-signal">
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{policy.name}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{policy.description}</p>
      </div>
      <span className="flex-shrink-0 rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-mono font-semibold text-ink">
        {policy.displayValue}
      </span>
    </div>
  );
}
