import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
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

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - Adopt X" }] }),
  component: Dashboard,
});

const sectorBars = [
  { name: "Fintech", value: 72, color: "#4D9DFF" },
  { name: "Healthcare", value: 48, color: "#2DD4BF" },
  { name: "Insurance", value: 32, color: "#F5A524" },
  { name: "Legal", value: 21, color: "#8B5CF6" },
] as const;

const roleBars = [
  { name: "Investment intelligence infrastructure", value: 68, color: "#4D9DFF", short: "Inv. Intel" },
  { name: "Clinical workflow support", value: 42, color: "#2DD4BF", short: "Clinical" },
  { name: "Claims automation", value: 28, color: "#F5A524", short: "Claims" },
  { name: "Compliance review automation", value: 22, color: "#8B5CF6", short: "Compliance" },
] as const;

const dealTypes = [
  { name: "Acquisition", value: 78, color: "#4D9DFF" },
  { name: "Strategic Partnership", value: 46, color: "#2DD4BF" },
  { name: "Strategic Investment", value: 34, color: "#F5A524" },
  { name: "Product Launch / Off-Thesis", value: 15, color: "#8B5CF6" },
] as const;

const geoBars = [
  { name: "South Africa / Australia", value: 43, pct: 32, color: "#4D9DFF" },
  { name: "UK", value: 36, pct: 27, color: "#2DD4BF" },
  { name: "US", value: 33, pct: 24, color: "#F5A524" },
  { name: "Australia", value: 18, pct: 13, color: "#8B5CF6" },
  { name: "Other", value: 8, pct: 6, color: "#6F7D88" },
] as const;

const candidatesOverTime = [30, 34, 38, 45, 48, 55, 62];
const priorCandidates = [25, 28, 30, 32, 34, 36, 38];

const briefsBars = [12, 14, 13, 16, 17, 18, 20];
const priorBriefs = [8, 10, 11, 12, 13, 14, 16];
const days = ["Jul 10", "Jul 11", "Jul 12", "Jul 13", "Jul 14", "Jul 15", "Jul 16"];

const queueHealth = [
  { label: "Pending Review", value: 14, delta: 2, color: "#F5A524" },
  { label: "Brief Queued", value: 6, delta: 0, color: "#4D9DFF" },
  { label: "Brief Ready", value: 5, delta: 1, color: "#8EEA45" },
  { label: "Brief Failed", value: 2, delta: -1, color: "#FF4D45" },
  { label: "Rejected", value: 2, delta: 0, color: "#6F7D88" },
] as const;

const operationalScanRuns = [
  { id: "scan_002", status: "Completed", when: "Today, 08:32 AM" },
  { id: "scan_001", status: "Completed", when: "Yesterday, 08:15 AM" },
  { id: "scan_003", status: "Running", when: "Started 09:01 AM" },
  { id: "scan_000", status: "Failed", when: "Jul 13, 04:26 PM" },
] as const;

const operationalBriefRuns = [
  { id: "brief_001", status: "Completed", when: "Today, 08:45 AM" },
  { id: "brief_002", status: "Queued", when: "Today, 08:46 AM" },
  { id: "brief_003", status: "Running", when: "Started 09:02 AM" },
  { id: "brief_000", status: "Failed", when: "Jul 13, 04:50 PM" },
] as const;

const queueAging = [
  { label: "0-24h", value: 12, pct: 46, color: "#8EEA45" },
  { label: "24-72h", value: 9, pct: 34, color: "#F5A524" },
  { label: "72h+", value: 5, pct: 19, color: "#FF4D45" },
] as const;

const auditEvents = [
  {
    who: "JS",
    action: "Edited AI Role",
    target: "Purple Group / Telescope AI / Fintech",
    when: "Today, 09:42 AM",
  },
  {
    who: "MP",
    action: "Approved Candidate",
    target: "HealthBridge / CareScribe AI",
    when: "Today, 09:13 AM",
  },
  {
    who: "JS",
    action: "Replaced Off-Thesis",
    target: "Payflow Systems / Vector Marketing",
    when: "Jul 13, 06:51 PM",
  },
] as const;

function Dashboard() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Adoption patterns and pipeline insights across regulated sectors"
      actions={<DashboardHeaderActions />}
    >
      <div className="space-y-5">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <KPI icon={Users} label="Total Candidates" value="127" delta={19} tone="info" />
          <KPI icon={CheckCircle2} label="Approved Briefs" value="24" delta={26} tone="success" />
          <KPI icon={Clock} label="Pending Review" value="14" delta={-7} tone="warning" />
          <KPI icon={Target} label="Brief Ready" value="5" delta={25} tone="info" />
          <KPI
            icon={ShieldCheck}
            label="Avg. Source Conf."
            value="78"
            delta={6}
            tone="info"
            unit="pts"
          />
          <KPI
            icon={Target}
            label="Avg. Thesis-Fit"
            value="83"
            delta={4}
            tone="success"
            unit="pts"
          />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="col-span-full space-y-5 lg:col-span-9">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <ChartPanel
                title="Adoption by Sector"
                footer="Fintech leads in adoption volume, driven by acquisitions."
              >
                <BarChart data={sectorBars} labels={sectorBars.map((item) => item.name)} />
              </ChartPanel>

              <ChartPanel
                title="Counts by Deal Type"
                footer="Acquisitions represent nearly half of all adoption events."
              >
                <DonutLegend data={dealTypes} total={173} />
              </ChartPanel>

              <ChartPanel
                title="Geography Breakdown"
                footer="Activity concentrated in SA/AU, UK, and US markets."
              >
                <HBarChart data={geoBars} />
              </ChartPanel>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <ChartPanel
                title="AI Role Distribution"
                footer="Investment intelligence and clinical workflow lead AI role adoption."
              >
                <BarChart data={roleBars} labels={roleBars.map((item) => item.short)} />
              </ChartPanel>

              <ChartPanel
                title="Candidates Over Time"
                footer={
                  <span>
                    <span className="mono text-lime">+19%</span> more candidates vs prior 7 days.
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
                  current={candidatesOverTime}
                  prior={priorCandidates}
                  labels={days}
                  color="#4D9DFF"
                />
              </ChartPanel>

              <ChartPanel
                title="Approved Briefs Over Time"
                footer={
                  <span>
                    <span className="mono text-lime">+26%</span> more approved briefs vs prior
                    7 days.
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
                  current={briefsBars}
                  prior={priorBriefs}
                  labels={days}
                  color="#8EEA45"
                />
              </ChartPanel>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Panel>
                <PanelHeader title="Key Insights" icon={Lightbulb} />
                <div className="grid grid-cols-1 gap-4 px-4 pb-4 sm:px-5 sm:pb-5 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    "Fintech acquisitions show the highest thesis-fit (avg. 88), outperforming other sectors. Review high-scoring fintech acquisitions in the queue.",
                    "Healthcare partnerships have the lowest source confidence (avg. 72) and highest manual review rate. Allocate more analyst time for healthcare.",
                    "Insurance has the fastest brief turnaround (avg. 18h from scan to brief ready). Leverage this benchmark to improve other sectors.",
                  ].map((copy, index) => (
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
                    {queueHealth.map((item) => (
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
                    Queue remains healthy. <span className="mono text-lime">71%</span> of items
                    moved forward in the last 7 days.
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
                  {operationalScanRuns.map((run) => (
                    <RunLine key={run.id} {...run} />
                  ))}
                </div>
                <div className="border-t border-hairline-soft pt-4">
                  <div className="mono mb-2 text-[10.5px] uppercase tracking-[0.14em] text-text-muted">
                    Brief Runs
                  </div>
                  {operationalBriefRuns.map((run) => (
                    <RunLine key={run.id} {...run} />
                  ))}
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Queue Aging"
                action={<span className="mono text-[10.5px]">As of now</span>}
              />
              <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
                {queueAging.map((item) => (
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
                <div className="flex flex-col gap-2 pt-2 text-[10.5px] sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-text-muted">
                    Oldest item: <span className="mono text-danger">3d 6h</span>
                  </span>
                  <button type="button" className="text-left text-text-secondary hover:text-lime">
                    Review oldest
                  </button>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Audit & Review Activity"
                action={<span className="mono text-[10.5px]">All Time</span>}
              />
              <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
                {auditEvents.map((event) => (
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

function DashboardHeaderActions() {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto lg:gap-3">
      <ToolbarButton icon={Calendar}>Jul 10 - Jul 16, 2025</ToolbarButton>
      <span className="hidden text-[11px] text-text-muted sm:inline">vs</span>
      <ToolbarButton icon={Calendar}>Jul 3 - Jul 9, 2025</ToolbarButton>
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
  delta: number;
  tone: "success" | "warning" | "info";
  unit?: string;
}) {
  const color = tone === "success" ? "#8EEA45" : tone === "warning" ? "#F5A524" : "#4D9DFF";
  const positive = delta > 0;

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
      <div
        className="mono mt-2 inline-flex flex-wrap items-center gap-0.5 text-[10px]"
        style={{ color: positive ? "#8EEA45" : "#FF4D45" }}
      >
        {positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
        {Math.abs(delta)}%
        <span className="ml-1 text-text-muted">vs prior 7 days</span>
      </div>
    </div>
  );
}

function ChartPanel({
  title,
  children,
  footer,
  legend,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  legend?: ReactNode;
}) {
  return (
    <Panel>
      <div className="flex flex-col gap-2 border-b border-hairline-soft px-4 py-4 sm:px-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold">{title}</div>
          {legend ? <div className="mt-1">{legend}</div> : null}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 self-start text-[10.5px] mono text-text-secondary"
        >
          All Time
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

function BarChart({
  data,
  labels,
}: {
  data: readonly { value: number; color: string }[];
  labels: readonly string[];
}) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <div className="flex h-[170px] items-end gap-2 px-1 sm:gap-3 sm:px-2">
      {data.map((item, index) => {
        const height = (item.value / max) * 100;

        return (
          <div key={labels[index]} className="flex flex-1 flex-col items-center gap-2">
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
            <div className="text-center text-[9px] leading-tight text-text-muted sm:text-[10px]">
              {labels[index]}
            </div>
          </div>
        );
      })}
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
  const max = Math.max(...data.map((item) => item.value));

  return (
    <div className="flex h-[170px] flex-col justify-center space-y-2">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-[10.5px] sm:gap-3">
          <div className="w-20 truncate text-text-secondary sm:w-28">{item.name}</div>
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
  const width = 260;
  const height = 130;
  const padding = 12;
  const allValues = [...current, ...prior];
  const max = Math.max(...allValues) * 1.1;
  const min = Math.min(...allValues) * 0.7;
  const scaleX = (index: number) => padding + (index * (width - 2 * padding)) / (current.length - 1);
  const scaleY = (value: number) =>
    height - padding - ((value - min) / (max - min)) * (height - 2 * padding);
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
        <div className="mt-1 grid grid-cols-7 text-[9.5px] mono text-text-muted">
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
  const max = Math.max(...current, ...prior) * 1.1;

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
        <div className="mt-1 grid grid-cols-7 text-[9.5px] mono text-text-muted">
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
