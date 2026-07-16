import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Panel, PanelHeader, StatusBadge, CompanyMark, ScoreBar, statusStyles } from "@/components/app-shell";
import { candidates, scanRuns, briefRuns, auditEvents } from "@/lib/demo-data";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, MoreHorizontal, Search, RotateCcw, Activity, Users, Info } from "lucide-react";

export const Route = createFileRoute("/triage")({
  head: () => ({ meta: [{ title: "Triage Queue — Adopt X" }] }),
  component: Triage,
});

const filters = [
  { label: "Sector",       value: "All" },
  { label: "Geography",    value: "All" },
  { label: "Deal Type",    value: "All" },
  { label: "Status",       value: "All" },
  { label: "Source Class", value: "All" },
];

function Triage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <AppShell title="Triage Queue" subtitle="Primary analyst working surface">
      {/* Run context strip */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        <MetricChip label="Latest scan" value="Completed" tone="success" />
        <MetricChip label="Last scan" value="Today, 08:32 AM" mono />
        <MetricChip label="Latest brief run" value="Running" tone="warning" />
        <MetricChip label="Pending review" value="14" mono strong />
        <MetricChip label="Brief queued" value="6" mono strong />
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-9 space-y-5">
          {/* Filters */}
          <Panel>
            <div className="px-5 py-4 grid grid-cols-6 gap-3">
              {filters.map(f => (
                <div key={f.label}>
                  <div className="text-[10.5px] mono uppercase tracking-wider text-text-muted mb-1.5">{f.label}</div>
                  <button className="w-full h-9 px-3 rounded-md bg-surface-2 border border-hairline text-[12.5px] flex items-center justify-between hover:border-hairline-soft">
                    {f.value}
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                </div>
              ))}
              <div>
                <div className="text-[10.5px] mono uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1">Search <Info className="w-3 h-3" /></div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input placeholder="Search queue..." className="w-full h-9 pl-8 pr-2 rounded-md bg-surface-2 border border-hairline text-[12.5px] placeholder:text-text-muted focus:outline-none focus:border-lime/50" />
                </div>
              </div>
            </div>
            <div className="px-5 pb-3 flex items-center justify-between border-t border-hairline-soft pt-3">
              <div className="flex items-center gap-2 text-[11.5px] text-text-muted">
                <RotateCcw className="w-3 h-3" /> Filters auto-persist per session
              </div>
              <button className="text-[12px] text-text-secondary hover:text-lime">Clear all</button>
            </div>
          </Panel>

          {/* Table */}
          <Panel className="overflow-hidden">
            {selected.size > 0 && (
              <div className="px-5 py-3 border-b border-hairline flex items-center justify-between"
                   style={{ background: "linear-gradient(180deg, rgba(183,241,55,0.10), rgba(183,241,55,0.02))" }}>
                <div className="text-[12.5px]"><span className="mono font-semibold text-lime">{selected.size}</span> selected</div>
                <div className="flex items-center gap-2">
                  <BulkBtn>Approve</BulkBtn>
                  <BulkBtn>Reject</BulkBtn>
                  <BulkBtn accent>Queue Brief</BulkBtn>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-text-muted mono text-[10.5px] uppercase tracking-[0.10em] bg-surface-2/40">
                    <th className="w-10 pl-5 py-3">
                      <input type="checkbox" className="accent-lime" onChange={(e) => setSelected(e.target.checked ? new Set(candidates.map(c => c.id)) : new Set())} />
                    </th>
                    {["Company","Target","Sector","Geography","Deal Type","AI Role","Confidence","Thesis-Fit","Source Conf.","Published","Status",""].map(h => (
                      <th key={h} className="text-left font-normal py-3 pr-3">
                        <span className="inline-flex items-center gap-1">{h}{h && !["","Status"].includes(h) && <ChevronsUpDown className="w-3 h-3 opacity-50" />}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => {
                    const isSel = selected.has(c.id);
                    return (
                      <tr key={c.id} onClick={() => toggle(c.id)}
                          className={`border-t border-hairline-soft cursor-pointer transition-colors ${isSel ? "bg-lime/[0.04]" : "hover:bg-surface-hover/40"}`}
                          style={isSel ? { boxShadow: "inset 3px 0 0 #B7F137" } : undefined}>
                        <td className="pl-5 py-3">
                          <input type="checkbox" checked={isSel} readOnly className="accent-lime" />
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <CompanyMark letter={c.logoLetter} color={c.logoColor} size={26} />
                            <span className="font-medium">{c.company}</span>
                          </div>
                        </td>
                        <td className="pr-3">{c.target}</td>
                        <td className="pr-3 text-text-secondary">{c.sector}</td>
                        <td className="pr-3 text-text-secondary text-[11.5px]">{c.geography}</td>
                        <td className="pr-3 text-text-secondary">{c.dealType}</td>
                        <td className="pr-3 text-text-secondary max-w-[180px]"><div className="truncate">{c.aiRole}</div></td>
                        <td className="pr-3 min-w-[90px]"><ScoreBar value={c.confidence} /></td>
                        <td className="pr-3 min-w-[90px]"><ScoreBar value={c.thesisFit} /></td>
                        <td className="pr-3 min-w-[90px]"><ScoreBar value={c.sourceConfidence} /></td>
                        <td className="pr-3 mono text-[11.5px] text-text-secondary whitespace-nowrap">{c.published}</td>
                        <td className="pr-3"><StatusBadge status={c.status} size="xs" /></td>
                        <td className="pr-5">
                          <Link to="/candidate" onClick={(e) => e.stopPropagation()}>
                            <ChevronRight className="w-4 h-4 text-text-muted hover:text-lime" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-hairline flex items-center justify-between text-[12px] text-text-secondary">
              <div>Showing <span className="mono">1–8</span> of <span className="mono">27</span> candidates</div>
              <div className="flex items-center gap-1">
                <PageBtn><ChevronLeft className="w-3.5 h-3.5" /></PageBtn>
                <PageBtn active>1</PageBtn>
                <PageBtn>2</PageBtn>
                <PageBtn>3</PageBtn>
                <PageBtn>4</PageBtn>
                <PageBtn><ChevronRight className="w-3.5 h-3.5" /></PageBtn>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right rail */}
        <div className="col-span-3 space-y-5">
          <Panel>
            <PanelHeader title="Operational Runs" icon={Activity} />
            <div className="px-5 pb-5 space-y-4">
              <div>
                <div className="text-[11px] mono uppercase tracking-[0.14em] text-text-muted mb-2">Scan Runs</div>
                <div className="space-y-1.5">{scanRuns.map(r => <MiniRun key={r.id} {...r} />)}</div>
              </div>
              <div className="border-t border-hairline-soft pt-4">
                <div className="text-[11px] mono uppercase tracking-[0.14em] text-text-muted mb-2">Brief Runs</div>
                <div className="space-y-1.5">{briefRuns.map(r => <MiniRun key={r.id} {...r} />)}</div>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Audit Trail" icon={Users} action={<span className="mono text-[11px]">All ▾</span>} />
            <div className="px-5 pb-5 space-y-3">
              {auditEvents.map((e, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mono text-[9.5px] font-semibold shrink-0"
                       style={{ background: "rgba(77,157,255,0.15)", color: "#4D9DFF", border: "1px solid rgba(77,157,255,0.35)" }}>
                    {e.who}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium leading-tight">{e.action}</div>
                    <div className="text-[10.5px] text-text-muted mono truncate">{e.target}</div>
                    <div className="text-[10px] text-text-muted mono mt-0.5">{e.when}</div>
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

function MetricChip({ label, value, mono, tone, strong }: any) {
  const c = tone === "success" ? "#8EEA45" : tone === "warning" ? "#F5A524" : "#F5F7FA";
  return (
    <div className="panel px-4 py-3">
      <div className="text-[10.5px] mono uppercase tracking-wider text-text-muted mb-1">{label}</div>
      <div className={`${mono ? "mono" : ""} ${strong ? "text-[20px]" : "text-[14px]"} font-semibold`} style={{ color: c }}>
        {value}
      </div>
    </div>
  );
}

function BulkBtn({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <button className={`h-8 px-3 rounded-md text-[12px] font-medium border transition-colors ${
      accent
        ? "text-primary-foreground"
        : "bg-surface-2 border-hairline text-text-primary hover:bg-surface-hover"
    }`}
      style={accent ? { background: "#B7F137", borderColor: "rgba(183,241,55,0.6)" } : undefined}>
      {children}
    </button>
  );
}

function PageBtn({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={`min-w-[28px] h-7 px-2 rounded text-[12px] mono flex items-center justify-center transition-colors ${
      active ? "bg-lime/10 text-lime border border-lime/40" : "hover:bg-surface-hover text-text-secondary"
    }`}>{children}</button>
  );
}

function MiniRun({ id, status, when }: { id: string; status: string; when: string }) {
  const s = statusStyles[status] ?? statusStyles["Empty"];
  const Icon = s.icon;
  return (
    <div className="flex items-center gap-2 text-[11.5px]">
      <Icon className={`w-3.5 h-3.5 shrink-0 ${status === "Running" ? "animate-spin" : ""}`} style={{ color: s.color }} />
      <span className="mono flex-1">{id}</span>
      <span className="text-[10.5px]" style={{ color: s.color }}>{status}</span>
      <span className="mono text-[10px] text-text-muted whitespace-nowrap">{when.split(",").pop()?.trim() ?? when}</span>
    </div>
  );
}
