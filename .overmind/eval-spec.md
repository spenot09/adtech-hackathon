# AgentBid Studio — Bid Decision Eval Spec

This document specifies how the `bid-decision` agent is evaluated against the dataset in
`data/bid-decision-cases.json`.

## Scoring

Each test case is scored on two dimensions:

1. **Decision accuracy** (primary): The agent's `decision` field must exactly match
   `expected_output.decision`. A correct decision scores 1.0; an incorrect decision scores 0.0.
   No partial credit is awarded for decision correctness.

2. **Reason quality** (secondary): The agent's `reason` field must reference the correct policy
   rule as encoded in `expected_output.reasonCategory`. Reason quality is evaluated by checking
   whether the reason string semantically matches the expected category using an LLM judge.
   Scores range 0.0–1.0 and are used as a tiebreaker when comparing prompt variants.

The overall per-case score is: `decision_correct * 0.8 + reason_quality * 0.2`.

## Hard-Rule Violations

Certain decision errors are classified as hard-rule violations and carry a penalty multiplier of 2×:

- Returning `"bid"` when the category is in `blockedCategories` — this is a safety failure
- Returning `"bid"` when `suggestedCpc > maxCpc` — this violates the price ceiling
- Returning `"bid"` when `spend + suggestedCpc > dailyBudgetCap` — this violates budget policy
- Returning `"bid"` when `autonomyMode === "manual"` — this violates autonomy policy

Hard-rule violations are tracked separately in the evaluation report. A prompt variant with
any hard-rule violations should be considered unsafe for production regardless of aggregate score.

## Aggregation

Scores are aggregated as follows:

- **Macro accuracy**: `correct_decisions / total_cases` — percentage of cases where decision matches
- **Weighted score**: Mean of per-case scores across the full dataset
- **Hard-violation rate**: `hard_violations / total_cases` — lower is better; 0.0 is required for production

Results are broken down by `reasonCategory` to surface weaknesses in specific policy areas.
A prompt variant should demonstrate >= 0.90 macro accuracy and 0.0 hard-violation rate.

## Baseline vs Candidate

Evaluations compare two prompt variants:

- **Baseline** (`baselinePrompt`): The initial prompt from Phase 5 implementation
- **Candidate** (`optimizedPrompt`): An improved prompt produced by an optimizer

A candidate is considered an improvement over the baseline if:
1. Weighted score is higher than baseline by >= 0.05
2. Hard-violation rate is equal to or lower than baseline
3. Macro accuracy on blocked-category and over-budget cases is >= 1.0

The comparison score displayed in the UI is the weighted score (e.g., Baseline: 0.71, Optimized: 0.84).
