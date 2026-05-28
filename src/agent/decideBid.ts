import type { Opportunity, Agent } from "@/lib/types/agent";
import { baselinePrompt, optimizedPrompt } from "@/agent/prompts";

export { baselinePrompt } from "@/agent/prompts";

export type BidDecision = {
  decision: "bid" | "skip" | "block" | "review";
  bidAmount: number | null;
  reason: string;
};

// Lazy module-level OpenAI client — only instantiated when API key is present
let _client: import("openai").OpenAI | null = null;

async function getClient(): Promise<import("openai").OpenAI | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!_client) {
    const { OpenAI } = await import("openai");
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/**
 * LLM-backed bid decision function.
 *
 * Falls back to rule-based decide() when OPENAI_API_KEY is not set.
 * Post-LLM safety guardrails override the model output to enforce hard policy rules.
 */
export async function decideBid(
  opportunity: Opportunity,
  agentConfig: Agent,
  opts?: { promptVariant?: "baseline" | "optimized" }
): Promise<BidDecision> {
  const variant = opts?.promptVariant ?? "optimized";

  const client = await getClient();

  // Fallback to rule-based engine when no API key configured
  if (!client) {
    const { decide } = await import("@/lib/simulation/decide");
    const { scoreRelevance } = await import("@/lib/simulation/relevance");
    const relevance = scoreRelevance(agentConfig, opportunity);
    const decision = decide(agentConfig, opportunity, relevance);
    return {
      decision: decision.action,
      bidAmount: decision.bidAmount ?? null,
      reason: decision.reason,
    };
  }

  const systemPrompt = variant === "baseline" ? baselinePrompt : optimizedPrompt;

  const userPayload = {
    opportunity,
    agentConfig: {
      maxCpc: agentConfig.maxCpc,
      dailyBudgetCap: agentConfig.dailyBudgetCap,
      spend: agentConfig.spend,
      autonomyMode: agentConfig.autonomyMode,
      targetIntents: agentConfig.targetIntents,
      blockedCategories: agentConfig.blockedCategories,
      brand: {
        name: agentConfig.brand.name,
        keywords: agentConfig.brand.keywords,
      },
      goal: agentConfig.goal,
    },
  };

  let result: BidDecision;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as {
      decision?: string;
      bidAmount?: number | null;
      reason?: string;
    };

    const validDecisions = ["bid", "skip", "block", "review"] as const;
    const decision = validDecisions.includes(parsed.decision as (typeof validDecisions)[number])
      ? (parsed.decision as BidDecision["decision"])
      : "review";

    result = {
      decision,
      bidAmount: typeof parsed.bidAmount === "number" ? parsed.bidAmount : null,
      reason: typeof parsed.reason === "string" ? parsed.reason : "No reason provided.",
    };
  } catch {
    result = {
      decision: "review",
      bidAmount: null,
      reason: "LLM output unparseable — escalating.",
    };
  }

  // ---- Post-LLM safety guardrails (these override the model) ----

  // Guardrail 1: Blocked category → force "block"
  if (agentConfig.blockedCategories.includes(opportunity.category)) {
    return {
      decision: "block",
      bidAmount: null,
      reason: `Category "${opportunity.category}" is in the blocked categories list.`,
    };
  }

  // Guardrail 2: bidAmount > maxCpc → clamp
  if (result.bidAmount !== null && result.bidAmount > agentConfig.maxCpc) {
    result.bidAmount = agentConfig.maxCpc;
  }

  // Guardrail 3: spend + bidAmount > dailyBudgetCap → force "skip"
  const effectiveBid = result.bidAmount ?? opportunity.suggestedCpc;
  if (agentConfig.spend + effectiveBid > agentConfig.dailyBudgetCap) {
    return {
      decision: "skip",
      bidAmount: null,
      reason: "Bid would exceed daily budget cap.",
    };
  }

  // Guardrail 4: manual mode + bid → force "review"
  if (agentConfig.autonomyMode === "manual" && result.decision === "bid") {
    return {
      decision: "review",
      bidAmount: null,
      reason: "Manual autonomy mode requires human approval for all bids.",
    };
  }

  return result;
}
