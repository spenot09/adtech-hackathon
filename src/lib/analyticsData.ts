import type { AnalyticsCampaign, RevenueSegment } from "./types";

export const analyticsCampaigns: AnalyticsCampaign[] = [
  {
    id: "nike-alphafly-3",
    brand: "Nike",
    campaignName: "Nike - Alphafly 3",
    accent: "charcoal",
    budgetCap: 6400,
    spend: 4820,
    revenue: 22340,
    impressions: 18420,
    clicks: 1684,
    conversions: 214,
    bidsWon: 183,
    averageCpc: 2.86,
    maxCpcGuardrail: 3.75,
    skippedUnsafePrompts: 24,
    blockedCategoriesCount: 4,
    unsupportedClaimsPrevented: 9,
    unsafeSpendAvoided: 820,
    series: [
      { date: "May 12", spend: 210, revenue: 780 },
      { date: "May 13", spend: 320, revenue: 1220 },
      { date: "May 14", spend: 380, revenue: 1680 },
      { date: "May 15", spend: 300, revenue: 1360 },
      { date: "May 16", spend: 280, revenue: 1480 },
      { date: "May 17", spend: 340, revenue: 1540 },
      { date: "May 18", spend: 360, revenue: 1780 },
      { date: "May 19", spend: 420, revenue: 2100 },
      { date: "May 20", spend: 510, revenue: 2460 },
      { date: "May 21", spend: 610, revenue: 3180 },
      { date: "May 22", spend: 470, revenue: 2280 },
      { date: "May 23", spend: 310, revenue: 1640 },
      { date: "May 24", spend: 330, revenue: 1810 },
      { date: "May 25", spend: 380, revenue: 2070 },
    ],
  },
  {
    id: "new-balance-530",
    brand: "New Balance",
    campaignName: "New Balance - 530",
    accent: "red",
    budgetCap: 5200,
    spend: 3360,
    revenue: 17280,
    impressions: 15680,
    clicks: 1426,
    conversions: 196,
    bidsWon: 146,
    averageCpc: 2.36,
    maxCpcGuardrail: 3.25,
    skippedUnsafePrompts: 19,
    blockedCategoriesCount: 3,
    unsupportedClaimsPrevented: 7,
    unsafeSpendAvoided: 640,
    series: [
      { date: "May 12", spend: 160, revenue: 720 },
      { date: "May 13", spend: 220, revenue: 980 },
      { date: "May 14", spend: 250, revenue: 1260 },
      { date: "May 15", spend: 240, revenue: 1180 },
      { date: "May 16", spend: 230, revenue: 1320 },
      { date: "May 17", spend: 260, revenue: 1380 },
      { date: "May 18", spend: 250, revenue: 1460 },
      { date: "May 19", spend: 270, revenue: 1620 },
      { date: "May 20", spend: 300, revenue: 1740 },
      { date: "May 21", spend: 310, revenue: 1820 },
      { date: "May 22", spend: 290, revenue: 1680 },
      { date: "May 23", spend: 250, revenue: 1500 },
      { date: "May 24", spend: 260, revenue: 1590 },
      { date: "May 25", spend: 270, revenue: 1630 },
    ],
  },
];

export const revenueSegments: RevenueSegment[] = [
  {
    segment: "Running shoes",
    leadingCampaign: "Nike - Alphafly 3",
    clicks: 1264,
    spend: 2860,
    revenue: 15180,
  },
  {
    segment: "Speed training",
    leadingCampaign: "Nike - Alphafly 3",
    clicks: 842,
    spend: 2140,
    revenue: 10920,
  },
  {
    segment: "Recovery / comfort",
    leadingCampaign: "New Balance - 530",
    clicks: 768,
    spend: 1420,
    revenue: 8230,
  },
  {
    segment: "Marathon gear",
    leadingCampaign: "Nike - Alphafly 3",
    clicks: 612,
    spend: 1680,
    revenue: 7840,
  },
  {
    segment: "Brand comparison",
    leadingCampaign: "New Balance - 530",
    clicks: 476,
    spend: 1080,
    revenue: 5450,
  },
];

export const analyticsTotals = analyticsCampaigns.reduce(
  (totals, campaign) => {
    totals.budgetCap += campaign.budgetCap;
    totals.spend += campaign.spend;
    totals.revenue += campaign.revenue;
    totals.impressions += campaign.impressions;
    totals.clicks += campaign.clicks;
    totals.conversions += campaign.conversions;
    totals.bidsWon += campaign.bidsWon;
    totals.skippedUnsafePrompts += campaign.skippedUnsafePrompts;
    totals.blockedCategoriesCount += campaign.blockedCategoriesCount;
    totals.unsupportedClaimsPrevented += campaign.unsupportedClaimsPrevented;
    totals.unsafeSpendAvoided += campaign.unsafeSpendAvoided;
    return totals;
  },
  {
    budgetCap: 0,
    spend: 0,
    revenue: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    bidsWon: 0,
    skippedUnsafePrompts: 0,
    blockedCategoriesCount: 0,
    unsupportedClaimsPrevented: 0,
    unsafeSpendAvoided: 0,
  },
);

export const combinedAverageCpc = analyticsTotals.spend / analyticsTotals.clicks;
export const combinedRoas = analyticsTotals.revenue / analyticsTotals.spend;
export const combinedRemainingBudget =
  analyticsTotals.budgetCap - analyticsTotals.spend;
