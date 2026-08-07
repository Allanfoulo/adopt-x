import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useState, type ReactNode } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Lightbulb,
  MoreHorizontal,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { AppShell, Panel, PanelHeader, ToolbarButton, statusStyles } from "@/components/app-shell";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - Adopt X" }] }),
  component: Dashboard,
});

type DashboardInsights = FunctionReturnType<typeof api.dashboard.getInsights>;

type BarDatum = {
  name: string;
  value: number;
  color: string;
  short?: string;
};

type GeoDatum = {
  name: string;
  value: number;
  pct: number;
  color: string;
};

type DashboardRange = "all" | "last7";

const chartColors = ["#4D9DFF", "#2DD4BF", "#F5A524", "#8B5CF6", "#6F7D88"];

const statusColors: Record<string, string> = {
  "Needs Review": "#F5A524",
  "Pending Review": "#F5A524",
  "Brief Queued": "#4D9DFF",
  "Brief Ready": "#8EEA45",
  "Brief Failed": "#FF4D45",
  Rejected: "#6F7D88",
  Approved: "#7FA8FF",
};

function buildDashboardView(insights: DashboardInsights | undefined) {
  if (!insights) {
    return {
      isLoading: true,
      kpis: { totalCandidates: "-", approvedBriefs: "-", pendingReview: "-", briefReady: "-", averageSourceConfidence: "-", averageThesisFit: "-", deltas: { totalCandidates: null, approvedBriefs: null, pendingReview: null, briefReady: null, averageSourceConfidence: null, averageThesisFit: null } },
      sectorBars: [], roleBars: [], dealTypes: [], dealTypeTotal: 0, geoBars: [],
      candidatesOverTime: [], priorCandidates: [], candidateTrendLabels: [],
      briefsBars: [], priorBriefs: [], briefTrendLabels: [], insights: [], queueHealth: [],
      operationalScanRuns: [], operationalBriefRuns: [], queueAging: [], auditEvents: [],
      periodLabel: "Loading",
      forwardRate: null,
    };
  }

  const sectorBars = toBars(insights.distributions.sectors);
  const roleBars = toBars(insights.distributions.aiRoles).map((item) => ({
    ...item,
    short: abbreviate(item.name),
  }));
  const dealTypes = toBars(insights.distributions.dealTypes);
  const geoBars = insights.distributions.geographies.map((item, index) => ({
    name: item.label,
    value: item.value,
    pct: item.percentage,
    color: chartColors[index % chartColors.length],
  }));
  const candidateTrend = normalizeTrend(insights.trends.candidates, insights.trends.previousCandidates);
  const briefTrend = normalizeTrend(insights.trends.approvedBriefs, insights.trends.previousApprovedBriefs);

  return {
    isLoading: false,
    kpis: {
      totalCandidates: String(insights.kpis.totalCandidates),
      approvedBriefs: String(insights.kpis.approvedBriefs),
      pendingReview: String(insights.kpis.pendingReview),
      briefReady: String(insights.kpis.briefReady),
      averageSourceConfidence: String(insights.kpis.averageSourceConfidence),
      averageThesisFit: String(insights.kpis.averageThesisFit),
      deltas: insights.kpis.deltas,
    },
    sectorBars,
    roleBars,
    dealTypes,
    dealTypeTotal: Math.max(
      1,
      insights.distributions.dealTypes.reduce((sum, item) => sum + item.value, 0),
    ),
    geoBars,
    candidatesOverTime: candidateTrend.values,
    priorCandidates: candidateTrend.prior,
    candidateTrendLabels: candidateTrend.labels,
    briefsBars: briefTrend.values,
    priorBriefs: briefTrend.prior,
    briefTrendLabels: briefTrend.labels,
    insights: insights.insights,
    queueHealth: insights.queueHealth
      .filter((item) => item.label !== "Approved")
      .map((item) => ({
        label: item.label === "Needs Review" ? "Pending Review" : item.label,
        value: item.value,
        delta: item.delta,
        color: statusColors[item.label] ?? "#7FA8FF",
      })),
    operationalScanRuns: insights.operationalRuns.scans,
    operationalBriefRuns: insights.operationalRuns.briefs,
    queueAging: insights.queueAging.map((item, index) => {
      const total = Math.max(1, insights.queueAging.reduce((sum, row) => sum + row.value, 0));
      return {
        ...item,
        pct: Math.round((item.value / total) * 100),
        color: ["#8EEA45", "#F5A524", "#FF4D45"][index] ?? "#6F7D88",
      };
    }),
    auditEvents: insights.auditEvents.map((event) => ({
      who: event.action
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      action: event.action,
      target: event.target,
      when: event.when,
    })),
    periodLabel: "Selected period",
    forwardRate: candidatesForwardRate(insights.queueHealth),
  };
}

function candidatesForwardRate(queueHealth: readonly { label: string; value: number }[]) {
  const total = queueHealth.reduce((sum, item) => sum + item.value, 0);
  if (!total) return 0;
  const moved = queueHealth
    .filter((item) => ["Approved", "Brief Ready", "Brief Queued"].includes(item.label))
    .reduce((sum, item) => sum + item.value, 0);
  return Math.round((moved / total) * 100);
}

function toBars(rows: readonly { label: string; value: number }[]): BarDatum[] {
  return rows.map((item, index) => ({
    name: item.label,
    value: item.value,
    color: chartColors[index % chartColors.length],
    short: abbreviate(item.label),
  }));
}

function normalizeTrend(
  rows: readonly { label: string; value: number }[],
  priorRows: readonly { label: string; value: number }[],
) {
  const labels = [...new Set([...rows.map((item) => item.label), ...priorRows.map((item) => item.label)])];
  const currentByLabel = new Map(rows.map((item) => [item.label, item.value]));
  const priorByLabel = new Map(priorRows.map((item) => [item.label, item.value]));
  const values = labels.map((label) => currentByLabel.get(label) ?? 0);
  return {
    values,
    prior: labels.map((label) => priorByLabel.get(label) ?? 0),
    labels,
  };
}

function abbreviate(value: string) {
  const words = value.split(" ").filter(Boolean);
  if (words.length <= 2) {
    return value;
  }
  return words
    .slice(0, 2)
    .map((word) => word.replace(/[^A-Za-z]/g, "").slice(0, 4))
    .join(" ");
}

function Dashboard() {
  const [range, setRange] = useState<DashboardRange>("all");
  const insights = useQuery(api.dashboard.getInsights, getDashboardRangeArgs(range));
  const view = { ...buildDashboardView(insights), periodLabel: formatRangeLabel(range) };

  return (
    <AppShell
      title="Dashboard"
      subtitle="Adoption patterns and pipeline insights across regulated sectors"
      actions={<DashboardHeaderActions range={range} onRangeChange={setRange} />}
    >
      <div className="space-y-5">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <KPI icon={Users} label="Total Candidates" value={view.kpis.totalCandidates} delta={view.kpis.deltas.totalCandidates} tone="info" />
          <KPI icon={CheckCircle2} label="Approved Briefs" value={view.kpis.approvedBriefs} delta={view.kpis.deltas.approvedBriefs} tone="success" />
          <KPI icon={Clock} label="Pending Review" value={view.kpis.pendingReview} delta={view.kpis.deltas.pendingReview} tone="warning" />
          <KPI icon={Target} label="Brief Ready" value={view.kpis.briefReady} delta={view.kpis.deltas.briefReady} tone="info" />
          <KPI
            icon={ShieldCheck}
            label="Avg. Source Conf."
            value={view.kpis.averageSourceConfidence}
            delta={view.kpis.deltas.averageSourceConfidence}
            tone="info"
            unit="pts"
          />
          <KPI
            icon={Target}
            label="Avg. Thesis-Fit"
            value={view.kpis.averageThesisFit}
            delta={view.kpis.deltas.averageThesisFit}
            tone="success"
            unit="pts"
          />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="col-span-full space-y-5 lg:col-span-9">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <ChartPanel
                title="Adoption by Sector"
                periodLabel={view.periodLabel}
                footer={view.sectorBars[0] ? `${view.sectorBars[0].name} leads adoption volume in this period.` : "No sector data in this period."}
              >
                <BarChart data={view.sectorBars} labels={view.sectorBars.map((item) => item.short ?? item.name)} />
              </ChartPanel>

              <ChartPanel
                title="Counts by Deal Type"
                periodLabel={view.periodLabel}
                footer={view.dealTypes[0] ? `${view.dealTypes[0].name} is the most common deal type in this period.` : "No deal type data in this period."}
              >
                <DonutLegend data={view.dealTypes} total={view.dealTypeTotal} />
              </ChartPanel>

              <ChartPanel
                title="Geography Breakdown"
                periodLabel={view.periodLabel}
                footer={view.geoBars[0] ? `${view.geoBars[0].name} is the leading geography in this period.` : "No geography data in this period."}
              >
                <HBarChart data={view.geoBars} />
              </ChartPanel>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <ChartPanel
                title="AI Role Distribution"
                periodLabel={view.periodLabel}
                footer={view.roleBars[0] ? `${view.roleBars[0].name} leads AI-role adoption in this period.` : "No AI role data in this period."}
              >
                <BarChart data={view.roleBars} labels={view.roleBars.map((item) => item.short ?? item.name)} />
              </ChartPanel>

              <ChartPanel
                title="Candidates Over Time"
                periodLabel={view.periodLabel}
                footer={
                  <span>
                    <span className="mono text-lime">{formatDelta(view.kpis.deltas.totalCandidates)}</span> candidates vs prior period.
                  </span>
                }
                legend={
                  <Legend
                    items={[
                      { color: "#4D9DFF", label: "This Period" },
                      { color: "#4D9DFF", label: "Prior Period", dashed: true },
                    ]}
                  />
                }
              >
                <LineChart
                  current={view.candidatesOverTime}
                  prior={view.priorCandidates}
                  labels={view.candidateTrendLabels}
                  color="#4D9DFF"
                />
              </ChartPanel>

              <ChartPanel
                title="Approved Briefs Over Time"
                periodLabel={view.periodLabel}
                footer={
                  <span>
                    <span className="mono text-lime">{formatDelta(view.kpis.deltas.approvedBriefs)}</span> approved briefs vs prior period.
                  </span>
                }
                legend={
                  <Legend
                    items={[
                      { color: "#8EEA45", label: "This Period" },
                      { color: "#8EEA45", label: "Prior Period", dashed: true },
                    ]}
                  />
                }
              >
                <BarComparison
                  current={view.briefsBars}
                  prior={view.priorBriefs}
                  labels={view.briefTrendLabels}
                  color="#8EEA45"
                />
              </ChartPanel>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Panel>
                <PanelHeader title="Key Insights" icon={Lightbulb} />
                <div className="grid grid-cols-1 gap-4 px-4 pb-4 sm:px-5 sm:pb-5 md:grid-cols-2 lg:grid-cols-3">
                  {view.insights.map((copy, index) => (
                    <div key={index}>
                      <div
                        className="mb-2 flex h-6 w-6 items-center justify-center rounded-full mono text-[10.5px] font-semibold"
                        style={{
                          background: "rgba(77,157,255,0.15)",
                          color: "#4D9DFF",
                          border: "1px solid rgba(77,157,255,0.35)",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="text-[11px] leading-relaxed text-text-secondary">{copy}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <PanelHeader title="Queue Health Summary" icon={Activity} />
                <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                  <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {view.queueHealth.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-md border border-hairline-soft bg-surface-2/40 p-2.5"
                      >
                        <div className="text-[10.5px]" style={{ color: item.color }}>
                          {item.label}
                        </div>
                        <div className="mono mt-1 text-[18px] font-semibold">{item.value}</div>
                        <div className="mono mt-0.5 text-[9.5px] text-text-muted">
                          {item.delta > 0
                            ? `up ${item.delta}`
                            : item.delta < 0
                              ? `down ${Math.abs(item.delta)}`
                              : "flat"}{" "}
                          vs prior 7d
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-[11px] text-text-secondary">
                    {view.forwardRate === null ? "Loading live queue health..." : <><span className="mono text-lime">{view.forwardRate}%</span> of items moved forward in the selected period.</>}
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="col-span-full space-y-5 lg:col-span-3">
            <Panel>
              <PanelHeader
                title="Operational Overview"
                icon={Activity}
                action={<MoreHorizontal className="h-4 w-4" />}
              />
              <div className="space-y-4 px-4 pb-4 sm:px-5 sm:pb-5">
                <div>
                  <div className="mono mb-2 text-[10.5px] uppercase tracking-[0.14em] text-text-muted">
                    Scan Runs
                  </div>
                  {view.operationalScanRuns.map((run) => (
                    <RunLine key={run.id} {...run} />
                  ))}
                </div>
                <div className="border-t border-hairline-soft pt-4">
                  <div className="mono mb-2 text-[10.5px] uppercase tracking-[0.14em] text-text-muted">
                    Brief Runs
                  </div>
                  {view.operationalBriefRuns.map((run) => (
                    <RunLine key={run.id} {...run} />
                  ))}
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Queue Aging"
                action={<span className="mono text-[10.5px]">{view.periodLabel}</span>}
              />
              <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
                {view.queueAging.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-[11px]">
                      <span>{item.label}</span>
                      <span className="mono text-right">
                        <span style={{ color: item.color }}>{item.value}</span>{" "}
                        <span className="text-text-muted">({item.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Audit & Review Activity"
                action={<span className="mono text-[10.5px]">{view.periodLabel}</span>}
              />
              <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
                {view.auditEvents.map((event) => (
                  <div key={`${event.who}-${event.when}`} className="flex items-start gap-2.5">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mono text-[9px] font-semibold"
                      style={{
                        background: "rgba(77,157,255,0.15)",
                        color: "#4D9DFF",
                        border: "1px solid rgba(77,157,255,0.35)",
                      }}
                    >
                      {event.who}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium">{event.action}</div>
                      <div className="truncate text-[10px] text-text-muted mono">
                        {event.target}
                      </div>
                      <div className="mono text-[9.5px] text-text-muted">{event.when}</div>
                    </div>
                  </div>
                ))}
                {view.auditEvents.length === 0 ? <div className="text-[11px] text-text-muted">No audit activity in this period.</div> : null}
                <button type="button" className="text-[10.5px] text-text-secondary hover:text-lime">
                  View full audit log
                </button>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function getDashboardRangeArgs(range: DashboardRange) {
  if (range === "all") return {};
  const endAt = Date.now() + 1;
  const startAt = endAt - 7 * 24 * 60 * 60 * 1000;
  return {
    startAt,
    endAt,
    compareStartAt: startAt - 7 * 24 * 60 * 60 * 1000,
    compareEndAt: startAt,
  };
}

function formatRangeLabel(range: DashboardRange) {
  if (range === "all") return "All Time";
  return "Last 7 Days";
}

function formatDelta(value: number | null) {
  return value === null ? "No comparison" : `${value > 0 ? "+" : ""}${value}%`;
}

function DashboardHeaderActions({
  range,
  onRangeChange,
}: {
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
}) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto lg:gap-3">
      <ToolbarButton icon={Calendar} onClick={() => onRangeChange(range === "all" ? "last7" : "all")}>
        {formatRangeLabel(range)}
      </ToolbarButton>
      <span className="hidden text-[11px] text-text-muted sm:inline">vs</span>
      <ToolbarButton icon={Calendar} onClick={() => onRangeChange("all")}>
        {range === "last7" ? "Previous 7 Days" : "Comparison unavailable"}
      </ToolbarButton>
      <ToolbarButton>Filters</ToolbarButton>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[12px] font-medium text-primary-foreground whitespace-nowrap"
        style={{
          background: "linear-gradient(180deg, #C9FF54, #B7F137)",
          border: "1px solid rgba(183,241,55,0.6)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 24px rgba(183,241,55,0.20)",
        }}
      >
        <Download className="h-4 w-4" strokeWidth={2.5} />
        Export
      </button>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  delta,
  tone,
  unit,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  delta: number | null;
  tone: "success" | "warning" | "info";
  unit?: string;
}) {
  const color = tone === "success" ? "#8EEA45" : tone === "warning" ? "#F5A524" : "#4D9DFF";
  const positive = (delta ?? 0) > 0;

  return (
    <div className="panel min-h-[112px] px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <div className="text-[10.5px] text-text-secondary">{label}</div>
      </div>
      <div className="mono text-[24px] font-semibold leading-none">
        {value}
        {unit ? <span className="ml-1 text-[12px] text-text-muted">{unit}</span> : null}
      </div>
      {delta === null ? <div className="mono mt-2 text-[10px] text-text-muted">No comparison period</div> : <div
        className="mono mt-2 inline-flex flex-wrap items-center gap-0.5 text-[10px]"
        style={{ color: positive ? "#8EEA45" : "#FF4D45" }}
      >
        {positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
        {Math.abs(delta)}%
        <span className="ml-1 text-text-muted">vs prior period</span>
      </div>}
    </div>
  );
}

function ChartPanel({
  title,
  children,
  footer,
  legend,
  periodLabel,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  legend?: ReactNode;
  periodLabel: string;
}) {
  return (
    <Panel className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-hairline-soft px-4 py-4 sm:px-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold">{title}</div>
          {legend ? <div className="mt-1">{legend}</div> : null}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 self-start text-[10.5px] mono text-text-secondary"
        >
          {periodLabel}
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="px-4 py-4 sm:px-5">{children}</div>
      {footer ? (
        <div className="border-t border-hairline-soft px-4 pb-4 pt-3 text-[10.5px] text-text-secondary sm:px-5">
          {footer}
        </div>
      ) : null}
    </Panel>
  );
}

function Legend({
  items,
}: {
  items: { color: string; label: string; dashed?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-muted">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className={`h-0.5 w-3 ${item.dashed ? "border-t border-dashed" : ""}`}
            style={{
              background: item.dashed ? "transparent" : item.color,
              borderColor: item.color,
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ChartEmpty() {
  return <div className="flex h-[170px] items-center justify-center rounded-md border border-dashed border-hairline-soft px-4 text-center text-[11px] text-text-muted">No live data in this period.</div>;
}

function BarChart({
  data,
  labels,
}: {
  data: readonly { value: number; color: string }[];
  labels: readonly string[];
}) {
  if (data.length === 0) return <ChartEmpty />;
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="flex h-[170px] min-w-[320px] items-end gap-2 px-1 sm:gap-3 sm:px-2">
      {data.map((item, index) => {
        const height = (item.value / max) * 100;

        return (
          <div key={labels[index]} className="flex min-w-[44px] flex-1 flex-col items-center gap-2">
            <div className="mono text-[10px] font-semibold sm:text-[10.5px]">{item.value}</div>
            <div
              className="relative w-full overflow-hidden rounded-t-md"
              style={{
                height: `${height}%`,
                minHeight: 8,
                background: `linear-gradient(180deg, ${item.color}, ${item.color}66)`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            />
            <div className="max-w-[78px] break-words text-center text-[9px] leading-tight text-text-muted sm:text-[10px]">
              {labels[index]}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function DonutLegend({
  data,
  total,
}: {
  data: readonly { name: string; value: number; color: string }[];
  total: number;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-[130px] w-[130px] shrink-0 sm:mx-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="14"
          />
          {data.map((item) => {
            const length = (item.value / total) * circumference;
            const dasharray = `${length} ${circumference - length}`;
            const dashoffset = -offset;
            offset += length;

            return (
              <circle
                key={item.name}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="14"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
          <div className="mono text-[20px] font-semibold">{total}</div>
          <div className="text-[9.5px] uppercase tracking-wider text-text-muted">Total</div>
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        {data.map((item) => (
          <div key={item.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-x-2 text-[10.5px]">
            <span
              className="mt-[0.35rem] h-2 w-2 rounded-full"
              style={{ background: item.color }}
            />
            <span className="min-w-0 break-words leading-5 text-text-secondary">
              {item.name}
            </span>
            <span className="mono shrink-0 whitespace-nowrap text-right">{item.value}</span>
            <span className="mono w-9 shrink-0 whitespace-nowrap text-right text-[10px] text-text-muted">
              ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBarChart({
  data,
}: {
  data: readonly { name: string; value: number; pct: number; color: string }[];
}) {
  if (data.length === 0) return <ChartEmpty />;
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="flex h-[170px] flex-col justify-center space-y-2">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-[10.5px] sm:gap-3">
          <div className="w-24 break-words leading-tight text-text-secondary sm:w-32">{item.name}</div>
          <div className="relative h-3.5 flex-1 overflow-hidden rounded bg-white/5">
            <div
              className="h-full rounded"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
              }}
            />
          </div>
          <div className="mono w-14 shrink-0 text-right tabular-nums sm:w-16">
            {item.value} <span className="text-text-muted">({item.pct}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LineChart({
  current,
  prior,
  labels,
  color,
}: {
  current: number[];
  prior: number[];
  labels: string[];
  color: string;
}) {
  if (current.length === 0) return <ChartEmpty />;
  const width = 260;
  const height = 130;
  const padding = 12;
  const allValues = [...current, ...prior];
  const max = Math.max(1, ...allValues) * 1.1;
  const min = Math.min(0, ...allValues) * 0.7;
  const valueRange = Math.max(1, max - min);
  const xSteps = Math.max(1, current.length - 1);
  const scaleX = (index: number) => padding + (index * (width - 2 * padding)) / xSteps;
  const scaleY = (value: number) =>
    height - padding - ((value - min) / valueRange) * (height - 2 * padding);
  const makePath = (values: number[]) =>
    values
      .map((value, index) => `${index === 0 ? "M" : "L"} ${scaleX(index)} ${scaleY(value)}`)
      .join(" ");

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="min-w-[280px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[150px] w-full">
          <path
            d={makePath(prior)}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.55"
          />
          <path d={makePath(current)} fill="none" stroke={color} strokeWidth="2" />
          {current.map((value, index) => (
            <circle key={labels[index]} cx={scaleX(index)} cy={scaleY(value)} r="2.5" fill={color} />
          ))}
        </svg>
        <div
          className="mt-1 grid text-[9.5px] mono text-text-muted"
          style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
        >
          {labels.map((label, index) => (
            <span
              key={label}
              className={`text-center ${index % 2 === 1 ? "hidden sm:inline" : ""}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarComparison({
  current,
  prior,
  labels,
  color,
}: {
  current: number[];
  prior: number[];
  labels: string[];
  color: string;
}) {
  if (current.length === 0) return <ChartEmpty />;
  const max = Math.max(1, ...current, ...prior) * 1.1;

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="min-w-[280px]">
        <div className="flex h-[130px] items-end gap-2">
          {current.map((value, index) => (
            <div key={labels[index]} className="flex flex-1 items-end gap-0.5">
              <div
                className="flex-1 rounded-t border border-b-0"
                style={{
                  height: `${(prior[index] / max) * 100}%`,
                  background: `${color}33`,
                  borderStyle: "dashed",
                  borderColor: `${color}66`,
                }}
              />
              <div
                className="flex-1 rounded-t"
                style={{
                  height: `${(value / max) * 100}%`,
                  background: `linear-gradient(180deg, ${color}, ${color}66)`,
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="mt-1 grid text-[9.5px] mono text-text-muted"
          style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
        >
          {labels.map((label, index) => (
            <span
              key={label}
              className={`text-center ${index % 2 === 1 ? "hidden sm:inline" : ""}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RunLine({
  id,
  status,
  when,
}: {
  id: string;
  status: string;
  when: string;
}) {
  const style = statusStyles[status] ?? statusStyles.Empty;
  const Icon = style.icon;
  const condensedWhen = when.includes(",") ? when.split(",").pop()?.trim() ?? when : when;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1 text-[10.5px] sm:flex-nowrap">
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${status === "Running" ? "animate-spin" : ""}`}
        style={{ color: style.color }}
      />
      <span className="mono min-w-0 flex-1">{id}</span>
      <span className="shrink-0 text-[10px]" style={{ color: style.color }}>
        {status}
      </span>
      <span className="mono basis-full pl-5 text-[9.5px] text-text-muted sm:basis-auto sm:pl-0">
        {condensedWhen}
      </span>
    </div>
  );
}
