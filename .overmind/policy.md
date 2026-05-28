# AgentBid Studio — Bid Decision Policy

This document defines the policy rules that govern the `bid-decision` agent.
Rules are evaluated in priority order. Higher-priority rules take precedence over lower-priority ones.

## Blocked Categories

The agent maintains a list of `blockedCategories` for each brand configuration.
Any opportunity whose `category` field matches a value in this list must result in a `"block"` decision,
regardless of pricing, budget, relevance, or autonomy mode.

This is a hard safety rule with no exceptions. Common blocked categories include: `medical`, `gambling`,
`politics`, `adult`, `weapons`, and `hate-speech`. The list is brand-configurable and must be respected
at all times — even when the opportunity is highly relevant and priced below the CPC ceiling.

## Max CPC Ceiling

Each agent configuration includes a `maxCpc` (maximum cost per click) value in USD.
If the opportunity's `suggestedCpc` exceeds this ceiling, the agent must return a `"skip"` decision.

This prevents overspending on individual placements. The check is applied after blocked-category
screening but before budget checks, so a blocked category takes priority over a CPC violation.
The agent must never bid at a price above `maxCpc`, and must not clamp a bid to `maxCpc` and proceed
if the suggested price was over the ceiling — the correct action is to skip.

## Daily Budget Cap

Each agent has a `dailyBudgetCap` representing the total spend limit for the day.
The agent tracks cumulative spend in the `spend` field. If `spend + suggestedCpc > dailyBudgetCap`,
the agent must return a `"skip"` decision.

This prevents the agent from exceeding its daily spend allocation. The check uses `suggestedCpc` as
a conservative proxy for the actual bid amount. When in doubt, skip to protect the budget.

## Autonomy Mode

The agent supports three autonomy modes that control how independently it acts:

- **manual**: The agent must return `"review"` for any potential bid. A human must approve every
  spend decision before money is committed. Use this for high-stakes campaigns or brand-new setups.

- **assisted**: The agent bids autonomously on clear safe opportunities but escalates ambiguous or
  high-value placements to a human for review. See the Ambiguous High-Value section for the specific
  escalation trigger. This is the recommended mode for most campaigns.

- **autonomous**: The agent bids freely within all other policy rules (blocked categories, CPC ceiling,
  budget cap). No human review is required. Use this only for well-established campaigns with high
  confidence in the targeting and budget settings.

## Target Intent Match

Each agent specifies a list of `targetIntents` representing the conversation contexts most relevant
to the brand. If the opportunity's `intent` is in `targetIntents`, this is a strong signal to bid.
If the intent is not in `targetIntents` and keyword relevance is also low (score < 0.15),
the agent should return `"skip"` due to low relevance.

Intent matching is a positive signal, not a hard gate. An opportunity with a matched intent
and good keyword overlap should result in a `"bid"` or `"review"` (depending on autonomy mode),
while an unmatched intent with poor keyword overlap should result in a `"skip"`.

## Ambiguous High-Value

When all of the following conditions are true simultaneously:
1. `suggestedCpc >= maxCpc * 0.9` (bid is within 10% of the CPC ceiling)
2. The opportunity's intent is in `targetIntents` (high relevance)
3. `autonomyMode === "assisted"`

...the agent must return `"review"` to escalate the decision to a human.

This rule exists because high-value bids near the CPC ceiling carry disproportionate spend risk.
Even when a bid is technically allowed by all other rules, a near-ceiling bid in assisted mode
warrants human judgment before committing. In autonomous mode, the agent may proceed with the bid.
