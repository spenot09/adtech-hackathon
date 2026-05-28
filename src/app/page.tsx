"use client";

import { useState } from "react";
import {
  Activity,
  Bot,
  Gauge,
  LayoutDashboard,
  Plus,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { AgentDashboard } from "@/components/AgentDashboard";
import { AgentForm } from "@/components/AgentForm";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PoliciesPanel } from "@/components/PoliciesPanel";
import WalkthroughPanel from "@/components/live-feed/WalkthroughPanel";
import { useAgentStore } from "@/lib/agentStore";
import type { AgentConfig } from "@/lib/types";

type ActiveTab = "Agents" | "Simulation" | "Policies" | "Analytics";

const navItems = [
  { label: "Agents", icon: Bot },
  { label: "Policies", icon: ShieldCheck },
  { label: "Simulation", icon: RadioTower },
  { label: "Analytics", icon: Gauge },
] satisfies Array<{ label: ActiveTab; icon: typeof Bot }>;

const tabCopy: Record<
  ActiveTab,
  { eyebrow: string; title: string; description: string }
> = {
  Agents: {
    eyebrow: "Dashboard",
    title: "Configured agents",
    description:
      "Create AI bidding agents with campaign goals, budget ceilings, autonomy mode, target intents, and blocked categories.",
  },
  Simulation: {
    eyebrow: "Simulation",
    title: "Live bidding demo",
    description:
      "Nike and New Balance compete across three scripted scenarios: watch agents bid, block, and escalate in real time.",
  },
  Policies: {
    eyebrow: "Policies",
    title: "Bidding policies",
    description:
      "Rules each agent must satisfy before placing a bid, including budget, max CPC, relevance, blocked categories, and escalation gates.",
  },
  Analytics: {
    eyebrow: "Analytics",
    title: "Running Performance Campaign Analytics",
    description:
      "Compare Nike and New Balance spend, revenue, ROAS, pacing, and safety impact for the 4-minute kilometer demo.",
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Agents");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
  const { agents, addAgent, updateAgent, totalBudget, averageMaxCpc } = useAgentStore();
  const copy = tabCopy[activeTab];

  function openCreateAgent() {
    setEditingAgent(null);
    setFormOpen(true);
  }

  function openEditAgent(agent: AgentConfig) {
    setEditingAgent(agent);
    setFormOpen(true);
  }

  function closeAgentForm() {
    setFormOpen(false);
    setEditingAgent(null);
  }

  return (
    <main className="min-h-screen text-ink">
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[248px_1fr]">
        <aside className="min-w-0 border-b border-line bg-white px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Cortex</p>
              <p className="text-xs text-slate-500">Buy-side agents</p>
            </div>
          </div>

          <nav className="mt-6 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                    item.label === activeTab
                      ? "bg-ink text-white"
                      : "text-slate-600 hover:bg-panel hover:text-ink"
                  }`}
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  type="button"
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>

        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <LayoutDashboard size={16} />
                {copy.eyebrow}
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                {copy.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {copy.description}
              </p>
            </div>

            {activeTab === "Agents" ? (
              <button
                className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={openCreateAgent}
                type="button"
              >
                <Plus size={17} />
                Create agent
              </button>
            ) : null}
          </header>

          <div className="mt-6">
            {activeTab === "Agents" ? (
              <AgentDashboard
                agents={agents}
                averageMaxCpc={averageMaxCpc}
                onEditAgent={openEditAgent}
                totalBudget={totalBudget}
              />
            ) : null}
            {activeTab === "Simulation" ? <WalkthroughPanel /> : null}
            {activeTab === "Policies" ? <PoliciesPanel /> : null}
            {activeTab === "Analytics" ? <AnalyticsDashboard /> : null}
          </div>
        </section>
      </div>

      <AgentForm
        agent={editingAgent}
        onClose={closeAgentForm}
        onCreate={addAgent}
        onUpdate={updateAgent}
        open={formOpen}
      />
    </main>
  );
}
