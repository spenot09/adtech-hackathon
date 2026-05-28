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
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useAgentStore } from "@/lib/agentStore";
import type { AgentConfig } from "@/lib/types";

type ActiveTab = "Agents" | "Simulation" | "Safety" | "Analytics";

const navItems = [
  { label: "Agents", icon: Bot },
  { label: "Simulation", icon: RadioTower },
  { label: "Safety", icon: Shield },
  { label: "Analytics", icon: Gauge },
 ] satisfies Array<{ label: ActiveTab; icon: typeof Bot }>;

const tabCopy: Record<
  ActiveTab,
  { eyebrow: string; title: string; description: string; phase: string; phaseBody: string }
> = {
  Agents: {
    eyebrow: "Dashboard",
    title: "Agent control plane",
    description:
      "Create AI bidding agents with campaign goals, budget ceilings, autonomy mode, target intents, and blocked categories.",
    phase: "Phase 1",
    phaseBody: "Configure bounded bidding agents before live inventory is connected.",
  },
  Simulation: {
    eyebrow: "Simulation",
    title: "Live bidding simulation",
    description:
      "Phase 2 will add the live opportunity stream, agent decisions, and generated sponsored responses.",
    phase: "Phase 2",
    phaseBody: "Owned separately; this tab is a placeholder until the stream lands.",
  },
  Safety: {
    eyebrow: "Safety",
    title: "Safety controls",
    description:
      "Safety enforcement appears as analytics evidence in Phase 3 and operational controls in later phases.",
    phase: "Phase 3",
    phaseBody: "Guardrail analytics are available from the Analytics tab.",
  },
  Analytics: {
    eyebrow: "Analytics",
    title: "Running Performance Campaign Analytics",
    description:
      "Compare Adidas and New Balance spend, revenue, ROAS, pacing, and safety impact for the 4-minute kilometer demo.",
    phase: "Phase 3",
    phaseBody: "Seeded analytics are used until Phase 2 emits live campaign events.",
  },
};

function PlaceholderPanel({ tab }: { tab: ActiveTab }) {
  return (
    <div className="rounded-md border border-line bg-white px-5 py-10 text-center shadow-soft">
      <p className="text-sm font-semibold text-ink">{tabCopy[tab].title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {tabCopy[tab].description}
      </p>
    </div>
  );
}

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("Agents");
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

          <div className="mt-6 rounded-md border border-line bg-panel p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {copy.phase}
            </p>
            <p className="mt-2 text-sm font-medium text-ink">{copy.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {copy.phaseBody}
            </p>
          </div>
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
            {activeTab === "Analytics" ? <AnalyticsDashboard /> : null}
            {activeTab === "Simulation" || activeTab === "Safety" ? (
              <PlaceholderPanel tab={activeTab} />
            ) : null}
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
