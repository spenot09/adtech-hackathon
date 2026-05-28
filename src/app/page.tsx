"use client";

import { useState } from "react";
import {
  Activity,
  Bot,
  Gauge,
  LayoutDashboard,
  Plus,
  RadioTower,
  Shield,
} from "lucide-react";
import { AgentDashboard } from "@/components/AgentDashboard";
import { AgentForm } from "@/components/AgentForm";
import { useAgentStore } from "@/lib/agentStore";

const navItems = [
  { label: "Agents", icon: Bot, active: true },
  { label: "Simulation", icon: RadioTower, active: false },
  { label: "Safety", icon: Shield, active: false },
  { label: "Analytics", icon: Gauge, active: false },
];

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const { agents, addAgent, totalBudget, averageMaxCpc } = useAgentStore();

  return (
    <main className="min-h-screen text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-line bg-white px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">AgentBid Studio</p>
              <p className="text-xs text-slate-500">Buy-side agents</p>
            </div>
          </div>

          <nav className="mt-6 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                    item.active
                      ? "bg-ink text-white"
                      : "text-slate-600 hover:bg-panel hover:text-ink"
                  }`}
                  key={item.label}
                  type="button"
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-md border border-line bg-panel p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Phase 1
            </p>
            <p className="mt-2 text-sm font-medium text-ink">Agent Studio Shell</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Configure bounded bidding agents before live inventory is connected.
            </p>
          </div>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <LayoutDashboard size={16} />
                Dashboard
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                Agent control plane
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create AI bidding agents with campaign goals, budget ceilings, autonomy
                mode, target intents, and blocked categories.
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={() => setFormOpen(true)}
              type="button"
            >
              <Plus size={17} />
              Create agent
            </button>
          </header>

          <div className="mt-6">
            <AgentDashboard
              agents={agents}
              averageMaxCpc={averageMaxCpc}
              totalBudget={totalBudget}
            />
          </div>
        </section>
      </div>

      <AgentForm
        onClose={() => setFormOpen(false)}
        onCreate={addAgent}
        open={formOpen}
      />
    </main>
  );
}
