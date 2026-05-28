---
created: 2026-05-28 20:08
title: Demo running shoe bidding scenario
area: planning
files:
  - .planning/ROADMAP.md
  - .planning/REQUIREMENTS.md
---

## Problem

The demo should include a concrete competitive bidding scenario for the user prompt: "How can I get closer to my goal of a 4 minute kilometer?"

The scenario should show a visible bidding war among running shoe brands. Nike and New Balance should compete, with Nike winning.

Key behavior to preserve:

- Nike and New Balance can compete for the placement.
- The bid decision should be explainable, not just highest-bid-wins.
- Nike should win the scenario.
- New Balance should avoid an unsupported performance claim about marathon/time improvement, which becomes a reason it does not win.
- The UI should make the winning reason and rejected/losing reasons visible in the live feed or decision log.

## Solution

Fold this scenario into the Phase 2 live bidding simulation and Phase 4 demo polish:

- Add a fixed opportunity with the 4-minute-kilometer prompt.
- Add brand profiles/bidder configurations for Nike and New Balance.
- Make bid scoring include claim safety / substantiation so a brand can lose when its generated ad copy would overclaim.
- Ensure Nike's sponsored response wins with a safer, more credible running-training/shoe message.
- Keep New Balance's non-winning reason explicit: it declined or was blocked from claiming a marathon/time outcome.
