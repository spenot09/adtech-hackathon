import type { GeneratedAd } from "@/lib/types/agent";

export const PREGENERATED_ADS: Record<string, GeneratedAd> = {
  // Scenario 1: Athletic — Nike wins
  athletic: {
    headline: "Own every mile.",
    body: "Nike marathon performance — engineered for runners who refuse to slow down.",
    cta: "Shop runners",
    imageUrl: "/ads/nike-athletic.png",
    source: "generated",
  },
  // Scenario 2: Street style — New Balance wins
  "street-style": {
    headline: "Streets were always the point.",
    body: "New Balance — crafted for the everyday mile, worn for everything else.",
    cta: "Find your pair",
    imageUrl: "/ads/nb-street.png",
    source: "generated",
  },
};
