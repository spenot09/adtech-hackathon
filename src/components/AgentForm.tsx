"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import type { AgentConfig, AgentFormValues, AutonomyMode } from "@/lib/types";
import {
  agentToFormValues,
  createAgentFromForm,
  updateAgentFromForm,
} from "@/lib/agentStore";

const initialValues: AgentFormValues = {
  agentName: "",
  brandName: "",
  goal: "",
  dailyBudget: "1000",
  maxCpc: "4.50",
  autonomyMode: "assisted",
  targetIntents: "travel-booking, hotel-search",
  blockedCategories: "medical, debt-relief, adult",
};

const autonomyOptions: Array<{
  value: AutonomyMode;
  label: string;
  detail: string;
}> = [
  {
    value: "manual",
    label: "Manual",
    detail: "All bids wait for human approval.",
  },
  {
    value: "assisted",
    label: "Assisted",
    detail: "Low-risk bids can run, risky ones escalate.",
  },
  {
    value: "autonomous",
    label: "Autonomous",
    detail: "Bids run within budget and policy bounds.",
  },
];

type AgentFormProps = {
  agent?: AgentConfig | null;
  open: boolean;
  onClose: () => void;
  onCreate: (agent: AgentConfig) => void;
  onUpdate: (agent: AgentConfig) => void;
};

export function AgentForm({
  agent,
  open,
  onClose,
  onCreate,
  onUpdate,
}: AgentFormProps) {
  const [values, setValues] = useState<AgentFormValues>(initialValues);
  const [error, setError] = useState("");
  const isEditing = Boolean(agent);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(agent ? agentToFormValues(agent) : initialValues);
    setError("");
  }, [agent, open]);

  if (!open) {
    return null;
  }

  function updateField<K extends keyof AgentFormValues>(
    field: K,
    value: AgentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.agentName.trim() || !values.brandName.trim() || !values.goal.trim()) {
      setError("Name, brand, and goal are required.");
      return;
    }

    if (Number(values.dailyBudget) <= 0 || Number(values.maxCpc) <= 0) {
      setError("Budget and max CPC must be positive numbers.");
      return;
    }

    if (agent) {
      onUpdate(updateAgentFromForm(agent, values));
    } else {
      onCreate(createAgentFromForm(values));
    }

    setValues(initialValues);
    setError("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-ink/20 backdrop-blur-[2px]">
      <button
        aria-label="Dismiss panel"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <aside className="relative flex h-full w-full max-w-[520px] flex-col border-l border-line bg-white shadow-soft">
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">
              {isEditing ? "Edit bidding agent" : "New bidding agent"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">
              {isEditing ? "Update campaign guardrails" : "Create campaign guardrails"}
            </h2>
          </div>
          <button
            aria-label="Close"
            className="rounded-md border border-line p-2 text-slate-500 transition hover:bg-panel hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto px-6 py-5" onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Field label="Agent / campaign name">
              <input
                className="field"
                onChange={(event) => updateField("agentName", event.target.value)}
                placeholder="Lisbon Weekend Buyer"
                value={values.agentName}
              />
            </Field>

            <Field label="Brand">
              <input
                className="field"
                onChange={(event) => updateField("brandName", event.target.value)}
                placeholder="Northstar Travel"
                value={values.brandName}
              />
            </Field>

            <Field label="Campaign goal">
              <textarea
                className="field min-h-[92px] resize-none"
                onChange={(event) => updateField("goal", event.target.value)}
                placeholder="Win high-intent travel planning prompts with safe sponsored answers."
                value={values.goal}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Daily budget cap">
                <input
                  className="field"
                  min="1"
                  onChange={(event) => updateField("dailyBudget", event.target.value)}
                  type="number"
                  value={values.dailyBudget}
                />
              </Field>

              <Field label="Max CPC">
                <input
                  className="field"
                  min="0.01"
                  onChange={(event) => updateField("maxCpc", event.target.value)}
                  step="0.01"
                  type="number"
                  value={values.maxCpc}
                />
              </Field>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink">Autonomy mode</legend>
              <div className="grid gap-2">
                {autonomyOptions.map((option) => (
                  <label
                    className={`cursor-pointer rounded-md border p-3 transition ${
                      values.autonomyMode === option.value
                        ? "border-signal bg-teal-50"
                        : "border-line bg-white hover:bg-panel"
                    }`}
                    key={option.value}
                  >
                    <input
                      checked={values.autonomyMode === option.value}
                      className="sr-only"
                      name="autonomyMode"
                      onChange={() => updateField("autonomyMode", option.value)}
                      type="radio"
                    />
                    <span className="block text-sm font-semibold text-ink">{option.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{option.detail}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Target intents">
              <input
                className="field"
                onChange={(event) => updateField("targetIntents", event.target.value)}
                placeholder="travel-booking, hotel-search"
                value={values.targetIntents}
              />
            </Field>

            <Field label="Blocked categories">
              <input
                className="field"
                onChange={(event) => updateField("blockedCategories", event.target.value)}
                placeholder="medical, debt-relief, adult"
                value={values.blockedCategories}
              />
            </Field>
          </div>

          {error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 border-t border-line bg-white py-4">
            <button
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-panel hover:text-ink"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              {isEditing ? <Check size={16} /> : <Plus size={16} />}
              {isEditing ? "Save changes" : "Create agent"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
