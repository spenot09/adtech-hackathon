import type { Agent, Opportunity, Ad, Intent } from "@/lib/types/agent";

/** Curated (brand × intent) ad template library. Every entry has source: "template". */
export const AD_TEMPLATES: Record<string, Partial<Record<Intent, Ad>>> = {
  nike: {
    running: {
      headline: "Run further. Win more.",
      body: "Nike performance running shoes — engineered for marathon pace.",
      cta: "Shop running",
      imageStyle: {
        background: "linear-gradient(135deg, #111 0%, #333 100%)",
        iconEmoji: "🏃",
        accentShape: "wave",
        motionHint: "float",
      },
      source: "template",
    },
    fitness: {
      headline: "Train harder.",
      body: "Nike training gear built for athletes who don't quit.",
      cta: "Shop training",
      imageStyle: {
        background: "linear-gradient(135deg, #111 0%, #555 100%)",
        iconEmoji: "💪",
        accentShape: "burst",
        motionHint: "pulse",
      },
      source: "template",
    },
  },
  nb: {
    shopping: {
      headline: "Style that lasts.",
      body: "New Balance — crafted for the streets, built for every day.",
      cta: "Shop sneakers",
      imageStyle: {
        background: "linear-gradient(135deg, #CF3A2C 0%, #8B1A10 100%)",
        iconEmoji: "👟",
        accentShape: "circle",
        motionHint: "shimmer",
      },
      source: "template",
    },
    fitness: {
      headline: "Comfort where it counts.",
      body: "New Balance — performance meets heritage.",
      cta: "Find your fit",
      imageStyle: {
        background: "linear-gradient(135deg, #CF3A2C 0%, #444 100%)",
        iconEmoji: "🏅",
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
