import type { Agent, Opportunity, Ad, Intent } from "@/lib/types/agent";

/** Curated (brand × intent) ad template library. Every entry has source: "template". */
export const AD_TEMPLATES: Record<string, Partial<Record<Intent, Ad>>> = {
  coke: {
    thirst: {
      headline: "Ice-cold Coke. Right now.",
      body: "Crack one open. Nothing else hits the same on a hot day.",
      cta: "Find a fridge near you",
      imageStyle: {
        background: "linear-gradient(135deg, #F40009 0%, #8B0000 100%)",
        iconEmoji: "🥤",
        accentShape: "burst",
        motionHint: "pulse",
      },
      source: "template",
    },
    refreshment: {
      headline: "Refreshment, uncapped.",
      body: "Real sugar, real fizz, real refreshment. Open happiness.",
      cta: "Grab a bottle",
      imageStyle: {
        background:
          "radial-gradient(circle at 30% 30%, #FF1F2C 0%, #B00007 100%)",
        iconEmoji: "🧊",
        accentShape: "circle",
        motionHint: "shimmer",
      },
      source: "template",
    },
    summer: {
      headline: "Tastes like summer.",
      body: "Beach days, BBQs, balcony nights. Coke makes the moment.",
      cta: "Pack a cooler",
      imageStyle: {
        background: "linear-gradient(180deg, #F40009 0%, #FFD200 100%)",
        iconEmoji: "🏖️",
        accentShape: "wave",
        motionHint: "float",
      },
      source: "template",
    },
    "travel-booking": {
      headline: "Wherever you're headed.",
      body: "There's always a Coke waiting on the other side.",
      cta: "Plan your trip",
      imageStyle: {
        background: "linear-gradient(120deg, #F40009 0%, #1E3A8A 120%)",
        iconEmoji: "✈️",
        accentShape: "diamond",
      },
      source: "template",
    },
    food: {
      headline: "Better with Coke.",
      body: "Burgers, tacos, pizza — every bite tastes better with a cold Coca-Cola.",
      cta: "Order a 6-pack",
      imageStyle: {
        background: "linear-gradient(135deg, #F40009 0%, #2C0000 100%)",
        iconEmoji: "🍔",
        accentShape: "burst",
      },
      source: "template",
    },
  },
  stride: {
    fitness: {
      headline: "Built for the next mile.",
      body: "Stride Athletic — cushion where you need it, lockdown where it counts.",
      cta: "Shop fitness",
      imageStyle: {
        background: "linear-gradient(135deg, #1E3A8A 0%, #0B1437 100%)",
        iconEmoji: "💪",
        accentShape: "diamond",
        motionHint: "pulse",
      },
      source: "template",
    },
    running: {
      headline: "Run further. Recover faster.",
      body: "Marathon-tested foam. Engineered for runners who don't quit.",
      cta: "Find your fit",
      imageStyle: {
        background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
        iconEmoji: "🏃",
        accentShape: "wave",
        motionHint: "float",
      },
      source: "template",
    },
    shopping: {
      headline: "Athletic, all-day.",
      body: "Stride Athletic. Performance you can wear anywhere.",
      cta: "Browse shoes",
      imageStyle: {
        background: "linear-gradient(120deg, #1E3A8A 0%, #475569 100%)",
        iconEmoji: "👟",
        accentShape: "circle",
      },
      source: "template",
    },
    "travel-booking": {
      headline: "Pack lighter. Walk further.",
      body: "Trip-ready shoes that go from boarding gate to boardwalk.",
      cta: "Travel-ready styles",
      imageStyle: {
        background: "linear-gradient(120deg, #1E3A8A 0%, #F40009 120%)",
        iconEmoji: "🧳",
        accentShape: "diamond",
      },
      source: "template",
    },
  },
};

/**
 * Synchronously picks a curated (brand × intent) ad template.
 * Returns a fallback derived from brand voice if no template exists for this intent.
 * No async, no API call.
 */
export function pickAd(agent: Agent, opportunity: Opportunity): Ad {
  const brandTemplates = AD_TEMPLATES[agent.id];
  const template = brandTemplates?.[opportunity.intent];

  if (template) {
    return template;
  }

  // Fallback: brand-derived ad when no specific template exists for this intent
  return {
    headline: `${agent.brand.name} — for your ${opportunity.intent}`,
    body: `A ${agent.brand.voice.split(",")[0].toLowerCase()} pick for "${opportunity.query.slice(0, 60)}".`,
    cta: "Learn more",
    imageStyle: {
      background: `linear-gradient(135deg, ${agent.brand.color} 0%, #000 100%)`,
      iconEmoji: "✨",
      accentShape: "circle",
    },
    source: "fallback",
  };
}
