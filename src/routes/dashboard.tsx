import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, PanelHeader, ToolbarButton, statusStyles } from "@/components/app-shell";
import {
  Users, CheckCircle2, Clock, ShieldCheck, Target, Calendar, ChevronDown,
  Download, Activity, MoreHorizontal, ArrowUp, ArrowDown, Lightbulb,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Adopt X" }] }),
  component: Dashboard,
});

const sectorBars = [
  { name: "Fintech", value: 72, color: "#4D9DFF" },
  { name: "Healthcare", value: 48, color: "#2DD4BF" },
  { name: "Insurance", value: 32, color: "#F5A524" },
  { name: "Legal", value: 21, color: "#8B5CF6" },
];

const roleBars = [
  { name: "Investment intelligence infra", value: 68, color: "#4D9DFF", short: "Inv. Intel" },
  { name: "Clinical workflow support",      value: 42, color: "#2DD4BF", short: "Clinical" },
  { name: "Claims automation",              value: 28, color: "#F5A524", short: "Claims" },
  { name: "Compliance review automation",   value: 22, color: "#8B5CF6", short: "Compliance" },
];

const dealTypes = [
  { name: "Acquisition",          value: 78, color: "#4D9DFF" },
  { name: "Strategic Partnership", value: 46, color: "#2DD4BF" },
  { name: "Strategic Investment", value: 34, color: "#F5A524" },
  { name: "Product Launch / Off-Thesis", value: 15, color: "#8B5CF6" },
];

const geoBars = [
  { name: "South Africa / Australia", value: 43, pct: 32, color: "#4D9DFF" },
  { name: "UK",                       value: 36, pct: 27, color: "#2DD4BF" },
  { name: "US",                       value: 33, pct: 24, color: "#F5A524" },
  { name: "Australia",                value: 18, pct: 13, color: "#8B5CF6" },
  { name: "Other",                    value: 8,  pct: 6,  color: "#6F7D88" },
];

const candidatesOverTime = [30, 34, 38, 45, 48, 55, 62]; // this period
const priorCandidates      = [25, 28, 30, 32, 34, 36, 38];

const briefsBars = [12, 14, 13, 16, 17, 18, 20];
const priorBriefs = [8, 10, 11, 12, 13, 14, 16];
const days = ["Jul 10","Jul 11","Jul 12","Jul 13","Jul 14","Jul 15","Jul 16"];

function Dashboard() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Adoption patterns and pipeline insights across regulated sectors"
      actions={
        <>
          <ToolbarButton icon={Calendar}>Jul 10 – Jul 16, 2025</ToolbarButton>
          <span className="text-[12px] text-text-muted">vs</span>
          <ToolbarButton icon={Calendar}>Jul 3 – Jul 9, 2025</ToolbarButton>
          <ToolbarButton>Filters</ToolbarButton>
          <button className="h-10 px-4 inline-flex items-center gap-2 rounded-lg font-medium text-[13px] text-primary-foreground"
            style={{ background: "linear-gradient(180deg, #C9FF54, #B7F137)", border: "1px solid rgba(183,241,55,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 24px rgba(183,241,55,0.20)" }}>
            <Download className="w-4 h-4" strokeWidth={2.5} /> Export
          </button>
        </>
      }
    >
      {/* KPI row */}
      <div className="grid grid-cols-6 gap-3 mb-5">
        <KPI icon={Users}        label="Total Candidates"    value="127" delta={+19} tone="info" />
        <KPI icon={CheckCircle2} label="Approved Briefs"     value="24"  delta={+26} tone="success" />
        <KPI icon={Clock}        label="Pending Review"      value="14"  delta={-7}  tone="warning" />
        <KPI icon={Target}       label="Brief Ready"         value="5"   delta={+25} tone="info" />
        <KPI icon={ShieldCheck}  label="Avg. Source Conf."   value="78"  delta={+6}  tone="info" unit="pts" />
        <KPI icon={Target}       label="Avg. Thesis-Fit"     value="83"  delta={+4}  tone="success" unit="pts" />
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Left/main charts */}
        <div className="col-span-9 space-y-5">
          <div className="grid grid-cols-3 gap-5">
            <ChartPanel title="Adoption by Sector" footer="Fintech leads in adoption volume, driven by acquisitions.">
              <BarChart data={sectorBars} labels={sectorBars.map(s => s.name)} />
            </ChartPanel>

            <ChartPanel title="Counts by Deal Type" footer="Acquisitions represent nearly half of all adoption events.">
              <DonutLegend data={dealTypes} total={173} />
            </ChartPanel>

            <ChartPanel title="Geography Breakdown" footer="Activity concentrated in SA/AU, UK, and US markets.">
              <HBarChart data={geoBars} />
            </ChartPanel>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <ChartPanel title="AI Role Distribution" footer="Investment intelligence and clinical workflow lead AI role adoption.">
              <BarChart data={roleBars} labels={roleBars.map(r => r.short)} />
            </ChartPanel>

            <ChartPanel title="Candidates Over Time"
              footer={<span><span className="text-lime mono">+19%</span> more candidates vs prior 7 days.</span>}
              legend={<Legend items={[
                { color: "#4D9DFF", label: "This Period" },
                { color: "#4D9DFF", label: "Prior Period", dashed: true },
              ]} />}>
              <LineChart current={candidatesOverTime} prior={priorCandidates} labels={days} color="#4D9DFF" />
            </ChartPanel>

            <ChartPanel title="Approved Briefs Over Time"
              footer={<span><span className="text-lime mono">+26%</span> more approved briefs vs prior 7 days.</span>}
              legend={<Legend items={[
                { color: "#8EEA45", label: "This Period" },
                { color: "#8EEA45", label: "Prior Period", dashed: true },
              ]} />}>
              <BarComparison current={briefsBars} prior={priorBriefs} labels={days} color="#8EEA45" />
            </ChartPanel>
          </div>

          {/* Insights row */}
          <div className="grid grid-cols-2 gap-5">
            <Panel>
              <PanelHeader title="Key Insights" icon={Lightbulb} />
              <div className="px-5 pb-5 grid grid-cols-3 gap-4">
                {[
                  "Fintech acquisitions show the highest thesis-fit (avg. 88), outperforming other sectors. Review high-scoring fintech acquisitions in the queue.",
                  "Healthcare partnerships have the lowest source confidence (avg. 72) and highest manual review rate. Allocate more analyst time for healthcare.",
                  "Insurance has the fastest brief turnaround (avg. 18h from scan to brief ready). Leverage this benchmark to improve other sectors.",
                ].map((t, i) => (
                  <div key={i}>
                    <div className="w-6 h-6 rounded-full mono text-[11px] font-semibold flex items-center justify-center mb-2"
                         style={{ background: "rgba(77,157,255,0.15)", color: "#4D9DFF", border: "1px solid rgba(77,157,255,0.35)" }}>
                      {i + 1}
                    </div>
                    <div className="text-[12px] leading-relaxed text-text-secondary">{t}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Queue Health Summary" icon={Activity} />
              <div className="px-5 pb-5">
                <div className="grid grid-cols-5 gap-3 mt-1">
                  {[
                    { label: "Pending Review", value: 14, delta: +2, color: "#F5A524" },
                    { label: "Brief Queued",   value: 6,  delta: 0,  color: "#4D9DFF" },
                    { label: "Brief Ready",    value: 5,  delta: +1, color: "#8EEA45" },
                    { label: "Brief Failed",   value: 2,  delta: -1, color: "#FF4D45" },
                    { label: "Rejected",       value: 2,  delta: 0,  color: "#6F7D88" },
                  ].map(q => (
                    <div key={q.label} className="rounded-md p-2.5 border border-hairline-soft bg-surface-2/40">
                      <div className="text-[11px]" style={{ color: q.color }}>{q.label}</div>
                      <div className="mono text-[20px] font-semibold mt-1">{q.value}</div>
                      <div className="text-[10px] mono text-text-muted mt-0.5">
                        {q.delta > 0 ? `↑${q.delta}` : q.delta < 0 ? `↓${Math.abs(q.delta)}` : "—"} vs prior 7d
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[12px] text-text-secondary">
                  Queue remains healthy. <span className="text-lime mono">71%</span> of items moved forward in the last 7 days.
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Right rail */}
        <div className="col-span-3 space-y-5">
          <Panel>
            <PanelHeader title="Operational Overview" icon={Activity} action={<MoreHorizontal className="w-4 h-4" />} />
            <div className="px-5 pb-5 space-y-4">
              <div>
                <div className="text-[11px] mono uppercase tracking-[0.14em] text-text-muted mb-2">Scan Runs</div>
                {[
                  { id: "scan_002", status: "Completed", when: "Today, 08:32 AM" },
                  { id: "scan_001", status: "Completed", when: "Yesterday, 08:15 AM" },
                  { id: "scan_003", status: "Running",   when: "Started 09:01 AM" },
                  { id: "scan_000", status: "Failed",    when: "Jul 13, 04:26 PM" },
                ].map(r => <RunLine key={r.id} {...r} />)}
              </div>
              <div className="border-t border-hairline-soft pt-4">
                <div className="text-[11px] mono uppercase tracking-[0.14em] text-text-muted mb-2">Brief Runs</div>
                {[
                  { id: "brief_001", status: "Completed", when: "Today, 08:45 AM" },
                  { id: "brief_002", status: "Queued",    when: "Today, 08:46 AM" },
                  { id: "brief_003", status: "Running",   when: "Started 09:02 AM" },
                  { id: "brief_000", status: "Failed",    when: "Jul 13, 04:50 PM" },
                ].map(r => <RunLine key={r.id} {...r} />)}
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Queue Aging" action={<span className="text-[11px] mono">As of now ▾</span>} />
            <div className="px-5 pb-5 space-y-3">
              {[
                { label: "0–24h",  value: 12, pct: 46, color: "#8EEA45" },
                { label: "24–72h", value: 9,  pct: 34, color: "#F5A524" },
                { label: "72h+",   value: 5,  pct: 19, color: "#FF4D45" },
              ].map(a => (
                <div key={a.label}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span>{a.label}</span>
                    <span className="mono"><span style={{ color: a.color }}>{a.value}</span> <span className="text-text-muted">({a.pct}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between text-[11.5px]">
                <span className="text-text-muted">Oldest item: <span className="mono text-danger">3d 6h</span></span>
                <button className="text-text-secondary hover:text-lime">Review oldest →</button>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Audit & Review Activity" action={<span className="text-[11px] mono">All Time ▾</span>} />
            <div className="px-5 pb-5 space-y-3">
              {[
                { who: "JS", action: "Edited AI Role",       target: "Purple Group / Telescope AI / Fintech", when: "Today, 09:42 AM" },
                { who: "MP", action: "Approved Candidate",   target: "HealthBridge / CareScribe AI",         when: "Today, 09:13 AM" },
                { who: "JS", action: "Replaced Off-Thesis",  target: "Payflow Systems / Vector Marketing",   when: "Jul 13, 06:51 PM" },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mono text-[9.5px] font-semibold shrink-0"
                       style={{ background: "rgba(77,157,255,0.15)", color: "#4D9DFF", border: "1px solid rgba(77,157,255,0.35)" }}>
                    {e.who}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium">{e.action}</div>
                    <div className="text-[10.5px] text-text-muted mono truncate">{e.target}</div>
                    <div className="text-[10px] text-text-muted mono">{e.when}</div>
                  </div>
                </div>
              ))}
              <button className="text-[11.5px] text-text-secondary hover:text-lime">View full audit log →</button>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function KPI({ icon: Icon, label, value, delta, tone, unit }: any) {
  const c = tone === "success" ? "#8EEA45" : tone === "warning" ? "#F5A524" : "#4D9DFF";
  const positive = delta > 0;
  return (
    <div className="panel px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${c}22`, border: `1px solid ${c}44` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: c }} />
        </div>
        <div className="text-[11.5px] text-text-secondary">{label}</div>
      </div>
      <div className="mono text-[26px] font-semibold leading-none">{value}{unit && <span className="text-[13px] text-text-muted ml-1">{unit}</span>}</div>
      <div className={`text-[10.5px] mono mt-2 inline-flex items-center gap-0.5`} style={{ color: positive ? "#8EEA45" : "#FF4D45" }}>
        {positive ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
        {Math.abs(delta)}% <span className="text-text-muted ml-1">vs prior 7 days</span>
      </div>
    </div>
  );
}

function ChartPanel({ title, children, footer, legend }: { title: string; children: React.ReactNode; footer?: React.ReactNode; legend?: React.ReactNode }) {
  return (
    <Panel>
      <div className="px-5 py-4 border-b border-hairline-soft flex items-start justify-between">
        <div>
          <div className="text-[13.5px] font-semibold">{title}</div>
          {legend && <div className="mt-1">{legend}</div>}
        </div>
        <button className="text-[11px] mono text-text-secondary flex items-center gap-1">All Time <ChevronDown className="w-3 h-3" /></button>
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="px-5 pb-4 text-[11.5px] text-text-secondary border-t border-hairline-soft pt-3">{footer}</div>}
    </Panel>
  );
}

function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="flex items-center gap-3 text-[10.5px] text-text-muted">
      {items.map((i, k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className={`w-3 h-0.5 ${i.dashed ? "border-t border-dashed" : ""}`} style={{ background: i.dashed ? "transparent" : i.color, borderColor: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function BarChart({ data, labels }: { data: { value: number; color: string }[]; labels: string[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="h-[160px] flex items-end gap-3 px-2">
      {data.map((d, i) => {
        const h = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="text-[11px] mono font-semibold">{d.value}</div>
            <div className="w-full rounded-t-md relative overflow-hidden" style={{ height: `${h}%`, minHeight: 8, background: `linear-gradient(180deg, ${d.color}, ${d.color}66)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15)` }} />
            <div className="text-[10.5px] text-text-muted text-center leading-tight">{labels[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

function DonutLegend({ data, total }: { data: { name: string; value: number; color: string }[]; total: number }) {
  const r = 46, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[130px] h-[130px] shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
          {data.map((s, i) => {
            const len = (s.value / total) * c;
            const dasharray = `${len} ${c - len}`;
            const dashoffset = -offset;
            offset += len;
            return <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={dasharray} strokeDashoffset={dashoffset} />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
          <div className="mono text-[22px] font-semibold">{total}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Total</div>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {data.map(s => (
          <div key={s.name} className="flex items-center gap-2 text-[11.5px]">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="flex-1 text-text-secondary truncate">{s.name}</span>
            <span className="mono">{s.value}</span>
            <span className="mono text-[10.5px] text-text-muted w-9 text-right">({Math.round((s.value/total)*100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBarChart({ data }: { data: { name: string; value: number; pct: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-2 h-[160px] flex flex-col justify-center">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3 text-[11.5px]">
          <div className="w-28 text-text-secondary truncate">{d.name}</div>
          <div className="flex-1 h-3.5 rounded bg-white/5 overflow-hidden relative">
            <div className="h-full rounded" style={{ width: `${(d.value/max)*100}%`, background: `linear-gradient(90deg, ${d.color}, ${d.color}99)` }} />
          </div>
          <div className="mono tabular-nums w-16 text-right">{d.value} <span className="text-text-muted">({d.pct}%)</span></div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ current, prior, labels, color }: { current: number[]; prior: number[]; labels: string[]; color: string }) {
  const W = 260, H = 130, P = 12;
  const all = [...current, ...prior];
  const max = Math.max(...all) * 1.1, min = Math.min(...all) * 0.7;
  const scaleX = (i: number) => P + (i * (W - 2*P)) / (current.length - 1);
  const scaleY = (v: number) => H - P - ((v - min) / (max - min)) * (H - 2*P);
  const path = (arr: number[]) => arr.map((v, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(v)}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]">
        <path d={path(prior)} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55" />
        <path d={path(current)} fill="none" stroke={color} strokeWidth="2" />
        {current.map((v, i) => <circle key={i} cx={scaleX(i)} cy={scaleY(v)} r="2.5" fill={color} />)}
      </svg>
      <div className="flex justify-between text-[10px] mono text-text-muted px-1 mt-1">
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function BarComparison({ current, prior, labels, color }: { current: number[]; prior: number[]; labels: string[]; color: string }) {
  const max = Math.max(...current, ...prior) * 1.1;
  return (
    <div>
      <div className="h-[130px] flex items-end gap-2">
        {current.map((v, i) => (
          <div key={i} className="flex-1 flex items-end gap-0.5">
            <div className="flex-1 rounded-t" style={{ height: `${(prior[i]/max)*100}%`, background: `${color}33`, border: `1px dashed ${color}66`, borderBottom: "none" }} />
            <div className="flex-1 rounded-t" style={{ height: `${(v/max)*100}%`, background: `linear-gradient(180deg, ${color}, ${color}66)` }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] mono text-text-muted mt-1">
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function RunLine({ id, status, when }: { id: string; status: string; when: string }) {
  const s = statusStyles[status] ?? statusStyles["Empty"];
  const Icon = s.icon;
  return (
    <div className="flex items-center gap-2 text-[11.5px] py-1">
      <Icon className={`w-3.5 h-3.5 shrink-0 ${status === "Running" ? "animate-spin" : ""}`} style={{ color: s.color }} />
      <span className="mono flex-1">{id}</span>
      <span className="text-[10.5px]" style={{ color: s.color }}>{status}</span>
      <span className="mono text-[10px] text-text-muted whitespace-nowrap">{when.split(",").pop()?.trim() ?? when}</span>
    </div>
  );
}
