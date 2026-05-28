import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";
import type { Opportunity, Agent } from "@/lib/types/agent";
import { baselinePrompt, optimizedPrompt } from "@/agent/prompts";

export { baselinePrompt } from "@/agent/prompts";

export type BidDecision = {
  decision: "bid" | "skip" | "block" | "review";
  bidAmount: number | null;
  reason: string;
};

let _client: import("@anthropic-ai/sdk").Anthropic | null = null;

async function getClient(): Promise<import("@anthropic-ai/sdk").Anthropic | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 256;

export async function decideBid(
  opportunity: Opportunity,
  agentConfig: Agent,
  opts?: { promptVariant?: "baseline" | "optimized" }
): Promise<BidDecision> {
  const variant = opts?.promptVariant ?? "optimized";
  const client = await getClient();

  // No API key — fall back to deterministic rule-based engine
  if (!client) {
    const { decide } = await import("@/lib/simulation/decide");
    const { scoreRelevance } = await import("@/lib/simulation/relevance");
    const relevance = scoreRelevance(agentConfig, opportunity);
    const d = decide(agentConfig, opportunity, relevance);
    return { decision: d.action, bidAmount: d.bidAmount ?? null, reason: d.reason };
  }

  const systemPrompt = variant === "baseline" ? baselinePrompt : optimizedPrompt;
  const userContent = JSON.stringify({
    opportunity,
    agentConfig: {
      maxCpc: agentConfig.maxCpc,
      dailyBudgetCap: agentConfig.dailyBudgetCap,
      spend: agentConfig.spend,
      autonomyMode: agentConfig.autonomyMode,
      targetIntents: agentConfig.targetIntents,
      blockedCategories: agentConfig.blockedCategories,
      brand: { name: agentConfig.brand.name, keywords: agentConfig.brand.keywords },
      goal: agentConfig.goal,
    },
  });

  const tracer = trace.getTracer("agentbid-studio");

  const result = await tracer.startActiveSpan(
    "anthropic.chat",
    {
      kind: SpanKind.CLIENT,
      attributes: {
        // GenAI semantic conventions — same keys Overmind parses from OpenAI spans
        "gen_ai.system": "anthropic",
        "llm.request.type": "chat",
        "gen_ai.request.model": MODEL,
        "gen_ai.request.max_tokens": MAX_TOKENS,
        // Prompt messages
        "gen_ai.prompt.0.role": "system",
        "gen_ai.prompt.0.content": systemPrompt,
        "gen_ai.prompt.1.role": "user",
        "gen_ai.prompt.1.content": userContent,
        // Traceloop workflow context
        "traceloop.workflow.name": "bid-decision",
        "traceloop.entity.name": `decideBid/${agentConfig.brand.name}`,
        // AgentBid-specific context
        "bid.agent_id": agentConfig.id,
        "bid.opportunity_id": opportunity.id,
        "bid.intent": opportunity.intent,
        "bid.category": opportunity.category,
        "bid.suggested_cpc": opportunity.suggestedCpc,
        "bid.prompt_variant": variant,
      },
    },
    async (span) => {
      try {
        const response = await client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }],
        });

        const raw =
          response.content[0]?.type === "text" ? response.content[0].text : "";

        // Strip optional code fences Claude sometimes wraps JSON in
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch
          ? (JSON.parse(jsonMatch[0]) as {
              decision?: string;
              bidAmount?: number | null;
              reason?: string;
            })
          : {};

        const validDecisions = ["bid", "skip", "block", "review"] as const;
        const decision = validDecisions.includes(
          parsed.decision as (typeof validDecisions)[number]
        )
          ? (parsed.decision as BidDecision["decision"])
          : "review";

        const out: BidDecision = {
          decision,
          bidAmount: typeof parsed.bidAmount === "number" ? parsed.bidAmount : null,
          reason: typeof parsed.reason === "string" ? parsed.reason : "No reason provided.",
        };

        // Response attributes — same convention as OpenAI instrumentation
        span.setAttributes({
          "gen_ai.response.model": response.model,
          "gen_ai.usage.prompt_tokens": response.usage.input_tokens,
          "gen_ai.usage.completion_tokens": response.usage.output_tokens,
          "llm.usage.total_tokens": response.usage.input_tokens + response.usage.output_tokens,
          "gen_ai.completion.0.role": "assistant",
          "gen_ai.completion.0.content": raw,
          "gen_ai.completion.0.finish_reason": response.stop_reason ?? "end_turn",
          "bid.decision": out.decision,
          "bid.bid_amount": out.bidAmount ?? -1,
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return out;
      } catch (err) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
        return {
          decision: "review" as const,
          bidAmount: null,
          reason: "LLM call failed — escalating for human review.",
        };
      } finally {
        span.end();
      }
    }
  );

  // ---- Post-LLM safety guardrails (hard overrides) ----

  if (agentConfig.blockedCategories.includes(opportunity.category)) {
    return { decision: "block", bidAmount: null, reason: `Category "${opportunity.category}" is blocked.` };
  }

  if (result.bidAmount !== null && result.bidAmount > agentConfig.maxCpc) {
    result.bidAmount = agentConfig.maxCpc;
  }

  const effectiveBid = result.bidAmount ?? opportunity.suggestedCpc;
  if (agentConfig.spend + effectiveBid > agentConfig.dailyBudgetCap) {
    return { decision: "skip", bidAmount: null, reason: "Bid would exceed daily budget cap." };
  }

  if (agentConfig.autonomyMode === "manual" && result.decision === "bid") {
    return { decision: "review", bidAmount: null, reason: "Manual autonomy mode requires human approval for all bids." };
  }

  return result;
}
