import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, PanelHeader, StatusBadge, CompanyMark, statusStyles } from "@/components/app-shell";
import {
  CheckCircle2, Clock, AlertTriangle, XCircle, ArrowUp, ArrowDown, ChevronDown, ChevronRight,
  ChevronLeft, MoreHorizontal, Activity, FileText, Users, X, RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/briefs")({
  head: () => ({ meta: [{ title: "Brief Archive — Adopt X" }] }),
  component: BriefArchive,
});

const briefs = [
  { id: 1, company: "Purple Group", target: "Telescope AI", logoColor: "#8B5CF6", logoLetter: "P",
    sector: "Technology", sectorSub: "AI Infrastructure", geo: "Australia", geoSub: "APAC",
    dealType: "Acquisition", approved: "Jul 16, 2025", approvedTime: "08:32 AM", version: "v1.2", status: "Approved",
    takeaway: "AI capability acquired as core infrastructure", selected: true },
  { id: 2, company: "InsuraCo", target: "ClaimForge AI", logoColor: "#4D9DFF", logoLetter: "I",
    sector: "Insurance", sectorSub: "Claims Automation", geo: "US", geoSub: "North America",
    dealType: "Strategic Investment", approved: "Jul 16, 2025", approvedTime: "08:18 AM", version: "v1.1", status: "Approved",
    takeaway: "Claims automation investment deepens workflow advantage" },
  { id: 3, company: "LexGrid", target: "RegAICore", logoColor: "#F5A524", logoLetter: "L",
    sector: "Legal", sectorSub: "RegTech", geo: "Australia", geoSub: "APAC",
    dealType: "Acquisition", approved: "Jul 15, 2025", approvedTime: "04:29 PM", version: "v1.0", status: "Approved",
    takeaway: "Regulatory AI capability strengthens compliance moat" },
  { id: 4, company: "MediAxis", target: "ClinPilot AI", logoColor: "#2DD4BF", logoLetter: "M",
    sector: "Healthcare", sectorSub: "Clinical Workflow", geo: "UK", geoSub: "EMEA",
    dealType: "Strategic Partnership", approved: "Jul 15, 2025", approvedTime: "02:14 PM", version: "v1.0", status: "Approved",
    takeaway: "Clinical workflow partnership strengthens regulated deployment angle" },
  { id: 5, company: "SparkPrompt", target: "—", logoColor: "#FF4D45", logoLetter: "S",
    sector: "Marketing", sectorSub: "MarTech", geo: "US", geoSub: "North America",
    dealType: "Product License", approved: "Jul 14, 2025", approvedTime: "11:08 AM", version: "v1.0", status: "Approved",
    takeaway: "AI content optimization license expands product suite" },
  { id: 6, company: "HealthBridge", target: "CareScribe AI", logoColor: "#8EEA45", logoLetter: "H",
    sector: "Healthcare", sectorSub: "Ambient Clinical", geo: "Canada", geoSub: "North America",
    dealType: "Strategic Partnership", approved: "Jul 14, 2025", approvedTime: "09:51 AM", version: "v1.1", status: "Approved",
    takeaway: "Ambient documentation partnership reduces provider burnout risk" },
  { id: 7, company: "PayFlow Systems", target: "FraudSense AI", logoColor: "#8B5CF6", logoLetter: "P",
    sector: "Fintech", sectorSub: "Fraud Detection", geo: "Singapore", geoSub: "APAC",
    dealType: "Strategic Investment", approved: "Jul 13, 2025", approvedTime: "07:43 PM", version: "v1.0", status: "Approved",
    takeaway: "Fraud detection investment reinforces risk platform" },
  { id: 8, company: "DataWeave", target: "VectorDB AI", logoColor: "#4D9DFF", logoLetter: "D",
    sector: "Enterprise", sectorSub: "Data Infrastructure", geo: "Germany", geoSub: "EMEA",
    dealType: "Acquisition", approved: "Jul 13, 2025", approvedTime: "06:12 PM", version: "v1.0", status: "Approved",
    takeaway: "Vector database acquisition accelerates AI data layer" },
];

const briefSections = [
  { title: "Executive Summary", open: true, body: "Purple Group has acquired Telescope AI, an AI infrastructure platform that provides scalable model orchestration and observability for enterprise workloads. The acquisition strengthens Purple Group's AI platform foundations and accelerates enterprise adoption." },
  { title: "Transaction Overview", open: true, body: "Type: Acquisition · Announced: Jul 15, 2025 · Geography: Australia · Consideration: Undisclosed · Stake: 100%" },
  { title: "Strategic Rationale", open: true, body: "AI capability acquired as core infrastructure to expand platform depth, improve retention, and enable cross-sell into existing enterprise base." },
  { title: "Risks & Mitigations", open: true, body: "Talent retention risk post-acquisition; integration complexity across enterprise environments. Mitigated by key talent retention plan and phased integration roadmap." },
  { title: "Market Implications", open: true, body: "Signals continued consolidation in AI infrastructure. Increases competitive pressure on mid-market orchestration and observability vendors." },
  { title: "Key Takeaways", open: true, list: [
    "Strengthens Purple Group's AI platform foundation",
    "Accelerates enterprise AI deployment & observability",
    "Enhances cross-sell and wallet share potential",
  ] },
];

function BriefArchive() {
  return (
    <AppShell title="Brief Archive" subtitle="Approved AI adoption briefs downstream of human review and quality assurance">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <MetricCard icon={CheckCircle2} tone="success" value="342" label="Approved" sub="Last 30 days" delta={+18} />
        <MetricCard icon={Clock}        tone="info"    value="58"  label="Brief Ready" sub="Last 30 days" delta={+12} />
        <MetricCard icon={ArrowDown}    tone="warning" value="21"  label="Queued" sub="Last 30 days" delta={-8} />
        <MetricCard icon={XCircle}      tone="danger"  value="9"   label="Failed" sub="Last 30 days" delta={-3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="col-span-full lg:col-span-8 space-y-5">
          {/* Filters */}
          <Panel>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {["Sector","Geography","Deal Type","Status","Version"].map(f => (
                <div key={f}>
                  <div className="text-[10.5px] mono uppercase tracking-wider text-text-muted mb-1.5">{f}</div>
                  <button className="w-full h-9 px-3 rounded-md bg-surface-2 border border-hairline text-[12.5px] flex items-center justify-between">
                    {f === "Status" ? "Approved" : "All"} <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                </div>
              ))}
              <div className="flex items-end">
                <button className="text-[12px] text-text-secondary hover:text-lime">Clear all</button>
              </div>
            </div>
          </Panel>

          {/* Briefs table */}
          <Panel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-text-muted mono text-[10.5px] uppercase tracking-[0.10em] bg-surface-2/40">
                    <th className="w-10 pl-5 py-3"></th>
                    <th className="text-left font-normal py-3">Company / Target</th>
                    <th className="text-left font-normal py-3">Sector</th>
                    <th className="text-left font-normal py-3">Geography</th>
                    <th className="text-left font-normal py-3">Deal Type</th>
                    <th className="text-left font-normal py-3">Approved</th>
                    <th className="text-left font-normal py-3">Version</th>
                    <th className="text-left font-normal py-3 pr-5">Key Takeaway</th>
                  </tr>
                </thead>
                <tbody>
                  {briefs.map(b => (
                    <tr key={b.id}
                        className={`border-t border-hairline-soft cursor-pointer ${b.selected ? "bg-lime/[0.04]" : "hover:bg-surface-hover/30"}`}
                        style={b.selected ? { boxShadow: "inset 3px 0 0 #B7F137" } : undefined}>
                      <td className="pl-5 py-3">
                        <input type="checkbox" defaultChecked={b.selected} className="accent-lime" />
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <CompanyMark letter={b.logoLetter} color={b.logoColor} size={26} />
                          <div className="leading-tight">
                            <div className="font-medium">{b.company}</div>
                            <div className="text-[11px] text-text-muted">{b.target}</div>
                          </div>
                        </div>
                      </td>
                      <td className="pr-3">
                        <div className="leading-tight">
                          <div>{b.sector}</div>
                          <div className="text-[10.5px] text-text-muted">{b.sectorSub}</div>
                        </div>
                      </td>
                      <td className="pr-3">
                        <div className="leading-tight">
                          <div>{b.geo}</div>
                          <div className="text-[10.5px] text-text-muted">{b.geoSub}</div>
                        </div>
                      </td>
                      <td className="pr-3 text-text-secondary">{b.dealType}</td>
                      <td className="pr-3">
                        <div className="leading-tight mono text-[11.5px]">
                          <div>{b.approved}</div>
                          <div className="text-[10.5px] text-text-muted">{b.approvedTime}</div>
                        </div>
                      </td>
                      <td className="pr-3">
                        <div className="leading-tight">
                          <span className="mono">{b.version}</span>
                          <div><StatusBadge status="Approved" size="xs" /></div>
                        </div>
                      </td>
                      <td className="pr-5 text-text-secondary max-w-[220px]">
                        <div className="truncate">{b.takeaway}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-hairline flex items-center justify-between text-[12px] text-text-secondary">
              <div>Showing <span className="mono">1–8</span> of <span className="mono">342</span> briefs</div>
              <div className="flex items-center gap-1">
                <PageBtn><ChevronLeft className="w-3.5 h-3.5" /></PageBtn>
                <PageBtn active>1</PageBtn>
                <PageBtn>2</PageBtn>
                <PageBtn>3</PageBtn>
                <span className="mono text-text-muted px-1">…</span>
                <PageBtn>43</PageBtn>
                <PageBtn><ChevronRight className="w-3.5 h-3.5" /></PageBtn>
              </div>
            </div>
          </Panel>

          {/* Brief preview */}
          <Panel>
            <div className="px-5 py-4 border-b border-hairline-soft flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CompanyMark letter="P" color="#8B5CF6" size={32} />
                <div>
                  <div className="font-semibold text-[14px]">Purple Group / Telescope AI</div>
                  <div className="text-[11px] text-text-muted mono">v1.2 · Approved Jul 16, 2025 08:32 AM · Acquisition · Analyst: Maya Patel</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="Approved" size="sm" />
                <button className="w-8 h-8 rounded-md border border-hairline flex items-center justify-center hover:bg-surface-hover"><X className="w-4 h-4 text-text-muted" /></button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {briefSections.map(s => (
                <div key={s.title} className="rounded-lg border border-hairline-soft bg-surface-2/40">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-hairline-soft">
                    <div className="flex items-center gap-2 text-[13px] font-semibold">
                      <FileText className="w-3.5 h-3.5 text-text-secondary" />
                      {s.title}
                    </div>
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </div>
                  <div className="px-4 py-3 text-[12.5px] leading-relaxed text-text-secondary">
                    {s.list ? (
                      <ul className="space-y-1.5">
                        {s.list.map((t, i) => (
                          <li key={i} className="flex items-start gap-2"><span className="text-lime mt-1">●</span><span className="text-text-primary">{t}</span></li>
                        ))}
                      </ul>
                    ) : s.body}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right rail */}
        <div className="col-span-full md:col-span-6 lg:col-span-4 space-y-5">
          <Panel>
            <PanelHeader title="Recent Brief Runs" icon={Activity} action={<RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:text-lime" />} />
            <div className="px-5 pb-5 space-y-2">
              {[
                { co: "Purple Group / Telescope AI",  when: "Today, 08:32 AM", tone: "success" },
                { co: "InsuraCo / ClaimForge AI",     when: "Today, 08:18 AM", tone: "success" },
                { co: "LexGrid / RegAICore",          when: "Yesterday, 04:29 PM", tone: "success" },
                { co: "MediAxis / ClinPilot AI",      when: "Yesterday, 02:14 PM", tone: "success" },
                { co: "SparkPrompt / —",              when: "Today, 09:05 AM", tone: "warning" },
                { co: "UnknownCo / Signal AI",        when: "Today, 08:41 AM", tone: "danger" },
              ].map((r, i) => {
                const c = r.tone === "success" ? "#8EEA45" : r.tone === "warning" ? "#F5A524" : "#FF4D45";
                const Icon = r.tone === "success" ? CheckCircle2 : r.tone === "warning" ? Clock : XCircle;
                return (
                  <div key={i} className="flex items-center gap-2.5 text-[12px]">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: c }} />
                    <span className="flex-1 truncate">{r.co}</span>
                    <span className="mono text-[10.5px] text-text-muted whitespace-nowrap">{r.when}</span>
                  </div>
                );
              })}
              <button className="pt-2 text-[11.5px] text-text-secondary hover:text-lime">View all runs →</button>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Revision History" icon={RefreshCw} />
            <div className="px-5 pb-5 space-y-3">
              {[
                { v: "v1.2", tag: "Current", who: "Maya Patel", when: "Jul 16, 2025 08:32 AM", note: "Updated market implications and added integration risk mitigation.", active: true },
                { v: "v1.1", tag: null, who: "Daniel Kim", when: "Jul 15, 2025 01:04 PM", note: "Expanded strategic rationale and competitive landscape.", },
                { v: "v1.0", tag: null, who: "Maya Patel", when: "Jul 15, 2025 10:22 AM", note: "Initial approved brief.", },
              ].map(v => (
                <div key={v.v} className={`p-3 rounded-md border ${v.active ? "border-lime/40 bg-lime/[0.04]" : "border-hairline-soft bg-surface-2/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono text-[12px] font-semibold">{v.v}</span>
                    {v.tag && <span className="text-[10px] px-1.5 py-0.5 rounded mono uppercase" style={{ background: "rgba(183,241,55,0.15)", color: "#B7F137", border: "1px solid rgba(183,241,55,0.35)" }}>{v.tag}</span>}
                    <StatusBadge status="Approved" size="xs" />
                    <span className="ml-auto text-[10.5px] mono text-text-muted">{v.when}</span>
                  </div>
                  <div className="text-[11.5px] text-text-secondary">{v.note}</div>
                  <div className="mt-1 text-[10.5px] text-text-muted">by {v.who}</div>
                </div>
              ))}
              <button className="pt-1 text-[11.5px] text-text-secondary hover:text-lime">View full history →</button>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Audit Trail" icon={Users} action={<span className="text-[11px] mono text-text-secondary hover:text-lime cursor-pointer">Export Log</span>} />
            <div className="px-5 pb-5 text-[12px] text-text-secondary">
              All actions are logged with time, user, and change details.
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ icon: Icon, tone, value, label, sub, delta }: any) {
  const c = tone === "success" ? "#8EEA45" : tone === "info" ? "#4D9DFF" : tone === "warning" ? "#F5A524" : "#FF4D45";
  const positive = delta > 0;
  return (
    <div className="panel px-5 py-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: `${c}22`, border: `1px solid ${c}44` }}>
          <Icon className="w-4 h-4" style={{ color: c }} />
        </div>
        <div className={`inline-flex items-center gap-0.5 mono text-[11px] px-1.5 py-0.5 rounded`}
             style={{ color: positive ? "#8EEA45" : "#FF4D45", background: positive ? "rgba(142,234,69,0.10)" : "rgba(255,77,69,0.10)" }}>
          {positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(delta)}%
        </div>
      </div>
      <div className="mono text-[28px] font-semibold leading-none">{value}</div>
      <div className="text-[13px] font-medium mt-2">{label}</div>
      <div className="text-[10.5px] text-text-muted mono uppercase tracking-wider">{sub}</div>
    </div>
  );
}

function PageBtn({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={`min-w-[28px] h-7 px-2 rounded text-[12px] mono flex items-center justify-center transition-colors ${
      active ? "bg-lime/10 text-lime border border-lime/40" : "hover:bg-surface-hover text-text-secondary"
    }`}>{children}</button>
  );
}
