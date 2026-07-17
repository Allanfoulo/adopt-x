import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Panel, PanelHeader, StatusBadge, CompanyMark, statusStyles } from "@/components/app-shell";
import { candidates, sectors, scanRuns, briefRuns, auditEvents, queueCounts } from "@/lib/demo-data";
import {
  CheckCircle2, Clock, AlertTriangle, XCircle, ArrowUpRight, Activity, Loader2,
  ChevronRight, MoreHorizontal, Zap, Users, Layers, Radio, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Overview — Adopt X" }] }),
  component: Overview,
});

const runContext = [
  { label: "Latest scan",       value: "Completed",     mono: false, tone: "success" },
  { label: "Last scan",         value: "Today, 08:32 AM", mono: true },
  { label: "Latest brief run",  value: "Running",       mono: false, tone: "warning" },
  { label: "Candidates",        value: "27",            mono: true },
  { label: "Sectors",           value: "4",             mono: true },
  { label: "Analysts",          value: "8",             mono: true },
];

function Overview() {
  return (
    <AppShell title="Overview" subtitle="Human-reviewed AI adoption deal intelligence">
      {/* Run context strip */}
      <Panel className="mb-5">
        <div className="px-5 pt-3 pb-2 text-[10.5px] mono uppercase tracking-[0.16em] text-text-muted">Current Run Context</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-hairline-soft">
          {runContext.map((r, i) => (
            <div key={r.label} className={`px-5 py-3.5 ${i < 5 ? "border-r border-hairline-soft" : ""}`}>
              <div className="text-[11px] text-text-muted mb-1">{r.label}</div>
              <div className={`text-[15px] font-semibold flex items-center gap-2 ${r.mono ? "mono" : ""}`}
                   style={r.tone === "success" ? { color: "#8EEA45" } : r.tone === "warning" ? { color: "#F5A524" } : undefined}>
                {r.tone === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {r.tone === "warning" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {r.value}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Queue by status */}
        <div className="col-span-full lg:col-span-8">
          <Panel>
            <PanelHeader title="Queue by Status" icon={Layers} action={<Link to="/triage" className="hover:text-text-primary flex items-center gap-1">View queue <ArrowRight className="w-3 h-3" /></Link>} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-5 pb-5">
              <QueueCountCard label="Pending Review" value={queueCounts["Pending Review"]} sub="High priority" tone="warning" icon={Clock} />
              <QueueCountCard label="Brief Queued"   value={queueCounts["Brief Queued"]}   sub="In progress"  tone="info"    icon={Layers} />
              <QueueCountCard label="Brief Ready"    value={queueCounts["Brief Ready"]}    sub="Ready to publish" tone="success" icon={CheckCircle2} />
              <QueueCountCard label="Rejected"       value={queueCounts["Rejected"]}       sub="Closed"       tone="danger"  icon={XCircle} />
            </div>
          </Panel>
        </div>

        {/* Latest scan status */}
        <div className="col-span-full sm:col-span-6 lg:col-span-2">
          <Panel className="h-full">
            <PanelHeader title="Latest Scan" />
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="mono text-[13px] font-semibold">scan_002</span>
                <span className="text-[11px] text-text-muted">· Completed</span>
              </div>
              <div className="text-[11px] text-text-muted mb-3">Today, 08:32 AM</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                <div className="rounded-md border border-hairline-soft p-2.5">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mono">Candidates</div>
                  <div className="mono text-[18px] font-semibold text-text-primary">27</div>
                </div>
                <div className="rounded-md border border-hairline-soft p-2.5">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mono">Errors</div>
                  <div className="mono text-[18px] font-semibold text-success">0</div>
                </div>
              </div>
              <button className="mt-3 text-[11.5px] text-text-secondary hover:text-lime flex items-center gap-1">View scan runs <ArrowUpRight className="w-3 h-3" /></button>
            </div>
          </Panel>
        </div>

        {/* Latest brief generation */}
        <div className="col-span-full sm:col-span-6 lg:col-span-2">
          <Panel className="h-full">
            <PanelHeader title="Latest Brief Run" action={<MoreHorizontal className="w-4 h-4" />} />
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="w-4 h-4 text-warning animate-spin" />
                <span className="mono text-[13px] font-semibold">brief_run_003</span>
              </div>
              <div className="text-[11px] text-text-muted mb-3">Started 09:01 AM</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                <MiniStat label="Running" value="1" color="#F5A524" />
                <MiniStat label="Failed"  value="1" color="#FF4D45" />
                <MiniStat label="Done"    value="5" color="#8EEA45" />
              </div>
              <button className="mt-3 text-[11.5px] text-text-secondary hover:text-lime flex items-center gap-1">View brief runs <ArrowUpRight className="w-3 h-3" /></button>
            </div>
          </Panel>
        </div>

        {/* Candidates by sector */}
        <div className="col-span-full md:col-span-6 lg:col-span-4">
          <Panel>
            <PanelHeader title="Candidates by Sector" icon={Radio} />
            <div className="px-5 pb-5 flex items-center gap-5">
              <div className="relative w-[130px] h-[130px] shrink-0">
                <DonutChart segments={sectors.map(s => ({ value: s.pct, color: s.color }))} />
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
                  <div className="mono text-[22px] font-semibold">27</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider">Total</div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {sectors.map(s => (
                  <div key={s.name} className="flex items-center gap-2 text-[12.5px]">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 text-text-secondary">{s.name}</span>
                    <span className="mono tabular-nums">{s.count}</span>
                    <span className="mono text-[11px] text-text-muted w-8 text-right">{s.pct}%</span>
                  </div>
                ))}
                <button className="pt-2 text-[11.5px] text-text-secondary hover:text-lime flex items-center gap-1">View sector breakdown <ArrowUpRight className="w-3 h-3" /></button>
              </div>
            </div>
          </Panel>
        </div>

        {/* Needs attention */}
        <div className="col-span-full lg:col-span-5">
          <Panel>
            <PanelHeader title="Needs Attention" icon={AlertTriangle} />
            <div className="px-3 pb-3 space-y-1">
              <AttentionRow icon={AlertTriangle} tone="warning"
                title="MediAxis / ClinPilot AI" chip="Healthcare" status="Needs Review" />
              <AttentionRow icon={XCircle} tone="danger"
                title="brief_000 failed for LexGrid / RegAICore" chip="Legal" status="Brief Failed" />
              <AttentionRow icon={AlertTriangle} tone="warning"
                title="Purple Group / Telescope AI" chip="Fintech" status="Missing evidence" />
              <AttentionRow icon={Clock} tone="info"
                title="5 candidates in pending queue > 2 days" chip="Aging" status="" />
            </div>
            <div className="px-5 py-3 border-t border-hairline-soft">
              <Link to="/triage" className="text-[11.5px] text-text-secondary hover:text-lime flex items-center gap-1">
                View triage queue <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </Panel>
        </div>

        {/* Operational runs */}
        <div className="col-span-full sm:col-span-6 lg:col-span-3 row-span-2">
          <Panel className="h-full">
            <PanelHeader title="Operational Runs" icon={Activity} action={<MoreHorizontal className="w-4 h-4" />} />
            <div className="px-5 pb-5 space-y-4">
              <div>
                <div className="text-[11px] mono uppercase tracking-[0.14em] text-text-muted mb-2">Scan Runs</div>
                <div className="space-y-1.5">
                  {scanRuns.map(r => <RunRow key={r.id} {...r} />)}
                </div>
                <button className="mt-2 text-[11.5px] text-text-secondary hover:text-lime flex items-center gap-1">
                  View all scan runs <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="border-t border-hairline-soft pt-4">
                <div className="text-[11px] mono uppercase tracking-[0.14em] text-text-muted mb-2">Brief Runs</div>
                <div className="space-y-1.5">
                  {briefRuns.map(r => <RunRow key={r.id} {...r} />)}
                </div>
                <button className="mt-2 text-[11.5px] text-text-secondary hover:text-lime flex items-center gap-1">
                  View all brief runs <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </Panel>
        </div>

        {/* Recent queue activity */}
        <div className="col-span-full lg:col-span-9">
          <Panel>
            <PanelHeader title="Recent Queue Activity" icon={Zap} />
            <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead>
                <tr className="text-text-muted mono text-[10.5px] uppercase tracking-[0.12em]">
                  <th className="text-left font-normal px-5 pb-2">Company</th>
                  <th className="text-left font-normal pb-2">Target</th>
                  <th className="text-left font-normal pb-2">Sector</th>
                  <th className="text-left font-normal pb-2">Deal Type</th>
                  <th className="text-left font-normal pb-2">Status</th>
                  <th className="text-left font-normal pb-2">Queue Time</th>
                  <th className="text-left font-normal pb-2">Analyst</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 5).map((c, i) => (
                  <tr key={c.id} className="border-t border-hairline-soft hover:bg-surface-hover/40 transition-colors">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <CompanyMark letter={c.logoLetter} color={c.logoColor} size={24} />
                        <span className="font-medium">{c.company}</span>
                      </div>
                    </td>
                    <td className="text-text-secondary">{c.target}</td>
                    <td className="text-text-secondary">{c.sector}</td>
                    <td className="text-text-secondary">{c.dealType}</td>
                    <td><StatusBadge status={c.status} size="xs" /></td>
                    <td className="mono text-[11.5px] text-text-secondary">{["Today, 08:20 AM","Today, 08:18 AM","Today, 07:59 AM","Today, 07:45 AM","Yesterday, 06:12 PM"][i]}</td>
                    <td className="text-text-secondary">{["Maya Patel","Aisha Rahman","Jordan Smith","Maya Patel","Aisha Rahman"][i]}</td>
                    <td className="pr-5"><MoreHorizontal className="w-4 h-4 text-text-muted" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-hairline-soft">
              <Link to="/triage" className="text-[11.5px] text-text-secondary hover:text-lime flex items-center gap-1">
                Open full queue <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </Panel>
        </div>

        {/* Audit Trail */}
        <div className="col-span-full lg:col-span-9">
          <Panel>
            <PanelHeader title="Audit Trail" icon={Users} action={<span className="mono text-[11px]">All Events ▾</span>} />
            <div className="px-5 pb-4 space-y-3">
              {auditEvents.map((e, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-hairline-soft last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center mono text-[10px] font-semibold shrink-0"
                       style={{ background: "rgba(77,157,255,0.15)", color: "#4D9DFF", border: "1px solid rgba(77,157,255,0.35)" }}>
                    {e.who}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{e.action}</div>
                    <div className="text-[11.5px] text-text-muted mono">{e.target}</div>
                  </div>
                  <div className="mono text-[11px] text-text-muted whitespace-nowrap">{e.when}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function QueueCountCard({ label, value, sub, tone, icon: Icon }: any) {
  const c = tone === "warning" ? "#F5A524" : tone === "info" ? "#4D9DFF" : tone === "success" ? "#8EEA45" : "#FF4D45";
  return (
    <div className="rounded-lg p-4 border border-hairline-soft" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06)), #101B23" }}>
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: `${c}22`, border: `1px solid ${c}44` }}>
          <Icon className="w-4 h-4" style={{ color: c }} />
        </div>
      </div>
      <div className="text-[12px] text-text-secondary mb-1">{label}</div>
      <div className="mono text-[28px] font-semibold leading-none text-text-primary">{value}</div>
      <div className="text-[10.5px] text-text-muted mt-2 mono uppercase tracking-wider">{sub}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="mono text-[18px] font-semibold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}

function AttentionRow({ icon: Icon, tone, title, chip, status }: any) {
  const c = tone === "warning" ? "#F5A524" : tone === "danger" ? "#FF4D45" : "#4D9DFF";
  return (
    <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-md hover:bg-surface-hover/50 cursor-pointer group">
      <Icon className="w-4 h-4 shrink-0" style={{ color: c }} />
      <div className="flex-1 min-w-0 text-[13px] truncate">{title}</div>
      {chip && <span className="text-[10.5px] px-1.5 py-0.5 rounded border border-hairline-soft text-text-muted mono">{chip}</span>}
      {status && <StatusBadge status={status} size="xs" />}
      <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100" />
    </div>
  );
}

function RunRow({ id, status, when }: { id: string; status: string; when: string }) {
  const s = statusStyles[status] ?? statusStyles["Empty"];
  const Icon = s.icon;
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Icon className={`w-3.5 h-3.5 shrink-0 ${status === "Running" ? "animate-spin" : ""}`} style={{ color: s.color }} />
      <span className="mono flex-1">{id}</span>
      <span className="text-text-muted" style={{ color: s.color }}>{status}</span>
      <span className="mono text-[10.5px] text-text-muted whitespace-nowrap">{when}</span>
    </div>
  );
}

function DonutChart({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((a, b) => a + b.value, 0);
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const dasharray = `${len} ${c - len}`;
        const dashoffset = -offset;
        offset += len;
        return (
          <circle key={i} cx="65" cy="65" r={r} fill="none" stroke={s.color} strokeWidth="16"
            strokeDasharray={dasharray} strokeDashoffset={dashoffset} strokeLinecap="butt" />
        );
      })}
    </svg>
  );
}
