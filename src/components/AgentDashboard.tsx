import { Bot, CheckCircle2, CircleDollarSign, Pencil, ShieldCheck } from "lucide-react";
import type { AgentConfig, AgentStatus, AutonomyMode } from "@/lib/types";

type AgentDashboardProps = {
  agents: AgentConfig[];
  totalBudget: number;
  averageMaxCpc: number;
  onEditAgent: (agent: AgentConfig) => void;
};

const statusLabels: Record<AgentStatus, string> = {
  active: "Active",
  paused: "Paused",
  needs_review: "Needs review",
};

const autonomyLabels: Record<AutonomyMode, string> = {
  manual: "Manual",
  assisted: "Assisted",
  autonomous: "Autonomous",
};

export function AgentDashboard({
  agents,
  totalBudget,
  averageMaxCpc,
  onEditAgent,
}: AgentDashboardProps) {
  return (
    <div className="grid gap-5">
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={<Bot size={18} />}
          label="Configured agents"
          value={agents.length.toString()}
        />
        <MetricCard
          icon={<CircleDollarSign size={18} />}
          label="Daily budget cap"
          value={formatCurrency(totalBudget)}
        />
        <MetricCard
          icon={<ShieldCheck size={18} />}
          label="Average max CPC"
          value={formatCurrency(averageMaxCpc)}
        />
      </section>

      <section className="rounded-md border border-line bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Agent control room</h2>
            <p className="mt-1 text-sm text-slate-500">
              Campaign agents are paused until live bidding is added in Phase 2.
            </p>
          </div>
          <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-slate-600">
            Session state
          </span>
        </div>

        {agents.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-ink">No agents configured</p>
            <p className="mt-1 text-sm text-slate-500">
              Create one bidding agent to start the demo flow.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {agents.map((agent) => (
              <article
                className="grid gap-4 px-5 py-4 transition hover:bg-panel/70 lg:grid-cols-[1.4fr_0.9fr_0.9fr]"
                key={agent.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-ink">
                      {agent.agentName}
                    </h3>
                    <Badge tone="neutral">{statusLabels[agent.status]}</Badge>
                    <Badge tone="teal">{autonomyLabels[agent.autonomyMode]}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {agent.brandName}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {agent.goal}
                  </p>
                  <button
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-panel hover:text-ink"
                    onClick={() => onEditAgent(agent)}
                    type="button"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Readout label="Budget" value={formatCurrency(agent.dailyBudget)} />
                  <Readout label="Max CPC" value={formatCurrency(agent.maxCpc)} />
                </div>

                <div className="grid gap-3">
                  <ChipGroup label="Target intents" values={agent.targetIntents} />
                  <ChipGroup label="Blocked" values={agent.blockedCategories} warning />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="rounded-md border border-line bg-panel p-2 text-signal">{icon}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-normal text-ink">{value}</p>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

function ChipGroup({
  label,
  values,
  warning = false,
}: {
  label: string;
  values: string[];
  warning?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <span
            className={`rounded-full border px-2 py-1 text-xs font-medium ${
              warning
                ? "border-amber-200 bg-amber-50 text-caution"
                : "border-teal-100 bg-teal-50 text-signal"
            }`}
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "teal";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
        tone === "teal"
          ? "border-teal-100 bg-teal-50 text-signal"
          : "border-line bg-panel text-slate-600"
      }`}
    >
      {tone === "neutral" ? <CheckCircle2 size={12} /> : null}
      {children}
    </span>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
