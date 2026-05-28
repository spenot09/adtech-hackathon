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

The scenario should show a visible bidding war among running shoe brands. The user mentioned Adidas and New Balance, but also said Nike should win. Treat this as requiring Nike to be included as a bidder unless clarified otherwise.

Key behavior to preserve:

- Adidas, New Balance, and Nike can compete for the placement.
- The bid decision should be explainable, not just highest-bid-wins.
- Nike should win the scenario.
- New Balance should avoid an unsupported performance claim about marathon/time improvement, which becomes a reason it does not win.
- The UI should make the winning reason and rejected/losing reasons visible in the live feed or decision log.

## Solution

Fold this scenario into the Phase 2 live bidding simulation and Phase 4 demo polish:

- Add a fixed opportunity with the 4-minute-kilometer prompt.
- Add brand profiles/bidder configurations for Adidas, New Balance, and Nike.
- Make bid scoring include claim safety / substantiation so a brand can lose when its generated ad copy would overclaim.
- Ensure Nike's sponsored response wins with a safer, more credible running-training/shoe message.
- Keep New Balance's non-winning reason explicit: it declined or was blocked from claiming a marathon/time outcome.
