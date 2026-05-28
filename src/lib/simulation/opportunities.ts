import type { Opportunity, Intent } from "@/lib/types/agent";

type OpportunityTemplate = {
  query: string;
  intent: Intent;
  category: string;
  suggestedCpc: number;
};

export const OPPORTUNITY_TEMPLATES: OpportunityTemplate[] = [
  // Clear Coke winners (thirst / refreshment / summer)
  {
    query: "I'm dying for a cold drink on a hot summer day — what should I grab?",
    intent: "thirst",
    category: "beverage",
    suggestedCpc: 3.5,
  },
  {
    query: "What's the most refreshing thing to grab at the beach right now?",
    intent: "refreshment",
    category: "beverage",
    suggestedCpc: 3.0,
  },
  {
    query: "Best ice-cold soda for a backyard BBQ with friends?",
    intent: "food",
    category: "beverage",
    suggestedCpc: 2.8,
  },
  {
    query: "It's 95 degrees and I need something cold and refreshing ASAP",
    intent: "thirst",
    category: "beverage",
    suggestedCpc: 4.0,
  },
  {
    query: "What drinks should I stock in my cooler for a summer road trip?",
    intent: "summer",
    category: "beverage",
    suggestedCpc: 2.5,
  },
  // Clear Stride winners (fitness / running / shopping)
  {
    query: "Looking for comfortable running shoes for a first marathon — any recommendations?",
    intent: "running",
    category: "footwear",
    suggestedCpc: 3.8,
  },
  {
    query: "What athletic shoes are best for long walks around the city?",
    intent: "fitness",
    category: "footwear",
    suggestedCpc: 3.2,
  },
  {
    query: "I need new shoes to start running — what should I buy?",
    intent: "shopping",
    category: "footwear",
    suggestedCpc: 3.5,
  },
  {
    query: "Best trail running shoes under $150 for beginners?",
    intent: "running",
    category: "footwear",
    suggestedCpc: 4.0,
  },
  // Shared moderate interest — travel-booking
  {
    query: "Planning a summer vacation to the beach — where should I go and what should I pack?",
    intent: "travel-booking",
    category: "travel",
    suggestedCpc: 5.5,
  },
  // Medical block (both agents should block)
  {
    query: "What's the best over-the-counter medication for a summer cold?",
    intent: "medical",
    category: "medical",
    suggestedCpc: 4.5,
  },
  // Gambling block
  {
    query: "Best sports betting strategies for this weekend's games?",
    intent: "general-question",
    category: "gambling",
    suggestedCpc: 6.0,
  },
  // General-question — both skip (low relevance)
  {
    query: "Can you help me write a cover letter for a software engineering job?",
    intent: "general-question",
    category: "general",
    suggestedCpc: 1.5,
  },
  // Finance — both skip
  {
    query: "Should I invest in index funds or ETFs for my retirement account?",
    intent: "finance-advice",
    category: "finance",
    suggestedCpc: 5.0,
  },
  // General shopping — Stride might pick up slightly
  {
    query: "What are the best gifts for a fitness enthusiast?",
    intent: "shopping",
    category: "shopping",
    suggestedCpc: 2.2,
  },
];

/** Samples a random opportunity template, stamps a unique id and current timestamp. */
export function sampleOpportunity(): Opportunity {
  const template =
    OPPORTUNITY_TEMPLATES[
      Math.floor(Math.random() * OPPORTUNITY_TEMPLATES.length)
    ];
  return {
    ...template,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
}
