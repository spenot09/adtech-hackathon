import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  analyticsCampaigns,
  analyticsTotals,
  combinedAverageCpc,
  combinedRemainingBudget,
  combinedRoas,
  revenueSegments,
} from "@/lib/analyticsData";
import type { AnalyticsCampaign, RevenueSegment } from "@/lib/types";

const chartHeight = 260;
const chartWidth = 880;
const chartPadding = 42;

export function AnalyticsDashboard() {
  return (
    <div className="grid min-w-0 gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <BarChart3 size={16} />
            Comparison mode
            <span className="rounded-full border border-line bg-white px-2 py-0.5 text-xs text-slate-500">
              Adidas vs New Balance
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <CalendarDays size={16} />
            Last 14 days
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        <KpiCard label="Total Spend" value={formatCurrency(analyticsTotals.spend)} />
        <KpiCard label="Revenue" value={formatCurrency(analyticsTotals.revenue)} positive />
        <KpiCard label="ROAS" value={`${formatNumber(combinedRoas, 1)}x`} positive />
        <KpiCard label="Avg CPC" value={formatCurrency(combinedAverageCpc)} />
        <KpiCard label="Conversions" value={formatInteger(analyticsTotals.conversions)} positive />
        <KpiCard
          label="Budget Remaining"
          value={formatCurrency(combinedRemainingBudget)}
        />
        <KpiCard
          label="Skipped Unsafe"
          value={formatInteger(analyticsTotals.skippedUnsafePrompts)}
          warning
        />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 rounded-md border border-line bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">
                Spend and Revenue Over Time
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Static seeded 14-day view until Phase 2 emits live analytics events.
              </p>
            </div>
            <Legend />
          </div>
          <SpendRevenueChart campaigns={analyticsCampaigns} />
        </div>

        <div className="grid gap-5">
          <BudgetPacing campaigns={analyticsCampaigns} />
          <SafetyGuardrails campaigns={analyticsCampaigns} />
        </div>
      </section>

      <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <CampaignPerformance campaigns={analyticsCampaigns} />
        <RevenueBreakdown segments={revenueSegments} />
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  positive = false,
  warning = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={`rounded-md border p-2 ${
            warning
              ? "border-amber-200 bg-amber-50 text-caution"
              : positive
                ? "border-teal-100 bg-teal-50 text-signal"
                : "border-line bg-panel text-slate-600"
          }`}
        >
          {warning ? <ShieldCheck size={16} /> : <TrendingUp size={16} />}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-normal text-ink">{value}</p>
      <p className="mt-1 text-xs text-slate-500">Combined campaign total</p>
    </div>
  );
}

function SpendRevenueChart({ campaigns }: { campaigns: AnalyticsCampaign[] }) {
  const allValues = campaigns.flatMap((campaign) =>
    campaign.series.flatMap((point) => [point.spend, point.revenue]),
  );
  const maxValue = Math.max(...allValues);
  const yMax = Math.ceil(maxValue / 1000) * 1000;
  const plotWidth = chartWidth - chartPadding * 2;
  const plotHeight = chartHeight - chartPadding * 2;

  function pathFor(
    campaign: AnalyticsCampaign,
    key: "spend" | "revenue",
    scale = 1,
  ) {
    return campaign.series
      .map((point, index) => {
        const x =
          chartPadding + (index / (campaign.series.length - 1)) * plotWidth;
        const y =
          chartPadding + plotHeight - (point[key] / yMax) * plotHeight * scale;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }

  const ticks = [0, yMax / 2, yMax];

  return (
    <div className="mt-5 overflow-x-auto">
      <svg
        aria-label="Spend and revenue chart"
        className="min-w-[760px]"
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        <rect fill="#fff" height={chartHeight} width={chartWidth} />
        {ticks.map((tick) => {
          const y = chartPadding + plotHeight - (tick / yMax) * plotHeight;
          return (
            <g key={tick}>
              <line
                stroke="#dfe5e1"
                strokeDasharray="4 4"
                x1={chartPadding}
                x2={chartWidth - chartPadding}
                y1={y}
                y2={y}
              />
              <text fill="#64748b" fontSize="12" x={0} y={y + 4}>
                {formatCurrency(tick)}
              </text>
            </g>
          );
        })}
        {campaigns.map((campaign) => (
          <g key={campaign.id}>
            <path
              d={pathFor(campaign, "revenue", 0.78)}
              fill="none"
              stroke={campaign.accent === "charcoal" ? "#111827" : "#dc2626"}
              strokeDasharray="6 5"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path
              d={pathFor(campaign, "spend")}
              fill="none"
              stroke={campaign.accent === "charcoal" ? "#2563eb" : "#ef4444"}
              strokeLinecap="round"
              strokeWidth="3"
            />
          </g>
        ))}
        {campaigns[0].series.map((point, index) => {
          const x = chartPadding + (index / (campaigns[0].series.length - 1)) * plotWidth;
          if (index % 3 !== 0 && index !== campaigns[0].series.length - 1) {
            return null;
          }
          return (
            <text
              fill="#64748b"
              fontSize="12"
              key={point.date}
              textAnchor="middle"
              x={x}
              y={chartHeight - 8}
            >
              {point.date}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
      <LegendItem color="#2563eb" label="Adidas spend" />
      <LegendItem color="#111827" dashed label="Adidas revenue" />
      <LegendItem color="#ef4444" label="New Balance spend" />
      <LegendItem color="#dc2626" dashed label="New Balance revenue" />
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-0.5 w-5"
        style={{
          background: dashed
            ? `repeating-linear-gradient(90deg, ${color}, ${color} 5px, transparent 5px, transparent 9px)`
            : color,
        }}
      />
      {label}
    </span>
  );
}

function BudgetPacing({ campaigns }: { campaigns: AnalyticsCampaign[] }) {
  return (
    <div className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Budget Pacing</h2>
        <WalletCards className="text-signal" size={18} />
      </div>
      <div className="mt-4 grid gap-4">
        {campaigns.map((campaign) => {
          const usedPercent = (campaign.spend / campaign.budgetCap) * 100;
          return (
            <div key={campaign.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{campaign.brand}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatCurrency(campaign.budgetCap - campaign.spend)} remaining
                  </p>
                </div>
                <span className="rounded-full border border-teal-100 bg-teal-50 px-2 py-1 text-xs font-semibold text-signal">
                  On track
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-panel">
                <div
                  className={`h-2 rounded-full ${
                    campaign.accent === "charcoal" ? "bg-ink" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(usedPercent, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {formatNumber(usedPercent, 0)}% of {formatCurrency(campaign.budgetCap)} used
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SafetyGuardrails({ campaigns }: { campaigns: AnalyticsCampaign[] }) {
  const maxCpc = Math.max(...campaigns.map((campaign) => campaign.maxCpcGuardrail));
  return (
    <div className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Safety Guardrails</h2>
        <ShieldCheck className="text-signal" size={18} />
      </div>
      <div className="mt-4 divide-y divide-line rounded-md border border-line">
        <GuardrailRow
          label="Max CPC guardrail"
          sublabel={`${formatCurrency(maxCpc)} highest campaign limit`}
          value={`${formatCurrency(combinedAverageCpc)} avg`}
          tone="teal"
        />
        <GuardrailRow
          label="Skipped unsafe prompts"
          sublabel="Analytics only, no prompt feed"
          value={formatInteger(analyticsTotals.skippedUnsafePrompts)}
          tone="amber"
        />
        <GuardrailRow
          label="Unsupported claims prevented"
          sublabel="Performance claims filtered"
          value={formatInteger(analyticsTotals.unsupportedClaimsPrevented)}
          tone="blue"
        />
        <GuardrailRow
          label="Unsafe spend avoided"
          sublabel={`${analyticsTotals.blockedCategoriesCount} blocked category triggers`}
          value={formatCurrency(analyticsTotals.unsafeSpendAvoided)}
          tone="teal"
        />
      </div>
    </div>
  );
}

function GuardrailRow({
  label,
  sublabel,
  value,
  tone,
}: {
  label: string;
  sublabel: string;
  value: string;
  tone: "teal" | "amber" | "blue";
}) {
  const toneClass =
    tone === "teal"
      ? "text-signal"
      : tone === "amber"
        ? "text-caution"
        : "text-blue-600";
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
      </div>
      <p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function CampaignPerformance({ campaigns }: { campaigns: AnalyticsCampaign[] }) {
  return (
    <TableShell title="Campaign Performance">
      <thead>
        <tr>
          {[
            "Campaign",
            "Impr.",
            "Bids won",
            "Clicks",
            "CTR",
            "Spend",
            "Revenue",
            "ROAS",
            "Conv.",
            "CPA",
          ].map((header) => (
            <th className="table-head" key={header}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {campaigns.map((campaign) => (
          <tr className="border-t border-line" key={campaign.id}>
            <td className="table-cell min-w-[220px]">
              <div className="font-semibold text-ink">{campaign.campaignName}</div>
              <div className="mt-1 text-xs text-slate-500">{campaign.brand}</div>
            </td>
            <td className="table-cell">{formatInteger(campaign.impressions)}</td>
            <td className="table-cell">{formatInteger(campaign.bidsWon)}</td>
            <td className="table-cell">{formatInteger(campaign.clicks)}</td>
            <td className="table-cell">{formatPercent(campaign.clicks / campaign.impressions)}</td>
            <td className="table-cell">{formatCurrency(campaign.spend)}</td>
            <td className="table-cell">{formatCurrency(campaign.revenue)}</td>
            <td className="table-cell font-semibold text-signal">
              {formatNumber(campaign.revenue / campaign.spend, 1)}x
            </td>
            <td className="table-cell">{formatInteger(campaign.conversions)}</td>
            <td className="table-cell">
              {formatCurrency(campaign.spend / campaign.conversions)}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function RevenueBreakdown({ segments }: { segments: RevenueSegment[] }) {
  return (
    <TableShell title="Revenue Breakdown">
      <thead>
        <tr>
          {["Segment", "Leading campaign", "Clicks", "Spend", "Revenue", "ROAS"].map(
            (header) => (
              <th className="table-head" key={header}>
                {header}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {segments.map((segment) => (
          <tr className="border-t border-line" key={segment.segment}>
            <td className="table-cell font-semibold text-ink">{segment.segment}</td>
            <td className="table-cell min-w-[210px]">{segment.leadingCampaign}</td>
            <td className="table-cell">{formatInteger(segment.clicks)}</td>
            <td className="table-cell">{formatCurrency(segment.spend)}</td>
            <td className="table-cell">{formatCurrency(segment.revenue)}</td>
            <td className="table-cell font-semibold text-signal">
              {formatNumber(segment.revenue / segment.spend, 1)}x
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function TableShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <CheckCircle2 className="text-slate-400" size={16} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, digits: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
