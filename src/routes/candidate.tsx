import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Panel, PanelHeader, StatusBadge, CompanyMark, ToolbarButton } from "@/components/app-shell";
import {
  ArrowLeft, Edit3, Check, X, MoreHorizontal, ExternalLink, Plus, Bot, User,
  ShieldCheck, FileText, Info, Sparkles, Users, Tag,
} from "lucide-react";

export const Route = createFileRoute("/candidate")({
  head: () => ({ meta: [{ title: "Candidate Detail — Adopt X" }] }),
  component: CandidateDetail,
});

const sources = [
  { n: 1, headline: "MediAxis and ClinPilot AI partner to accelerate clinical workflow automation", publisher: "Healthcare IT News", date: "Jul 15, 2025", type: "News Article" },
  { n: 2, headline: "MediAxis teams up with ClinPilot AI for AI-powered triage solutions",         publisher: "Fierce Healthcare",   date: "Jul 15, 2025", type: "News Article" },
  { n: 3, headline: "MediAxis & ClinPilot AI Announce Strategic Partnership",                     publisher: "Company Press Release", date: "Jul 15, 2025", type: "Press Release" },
  { n: 4, headline: "Partnership to enhance clinical triage efficiency across UK healthcare systems", publisher: "HSJ (Health Service Journal)", date: "Jul 14, 2025", type: "News Article" },
];

const facts: { label: string; value: string; source: "ai" | "human" }[] = [
  { label: "Company",           value: "MediAxis",                     source: "ai" },
  { label: "Target",            value: "ClinPilot AI",                 source: "ai" },
  { label: "Sector",            value: "Healthcare",                   source: "ai" },
  { label: "Geography",         value: "UK",                           source: "ai" },
  { label: "Deal Type",         value: "Strategic Partnership",        source: "human" },
  { label: "AI Role",           value: "Clinical workflow support",    source: "human" },
  { label: "Announcement Date", value: "Jul 15, 2025",                 source: "ai" },
  { label: "Source Class",      value: "News / Press",                 source: "ai" },
];

const attrs = [
  { label: "Sector",     value: "Healthcare",             source: "human" },
  { label: "Deal Type",  value: "Strategic Partnership",  source: "human" },
  { label: "AI Role",    value: "Clinical workflow support", source: "human" },
];

const scores = [
  { label: "Confidence Score",   value: 81, source: "ai", helper: "How confident we are in the accuracy of the extracted facts." },
  { label: "Thesis-Fit Score",   value: 86, source: "ai", helper: "How well this candidate aligns with our adoption thesis." },
  { label: "Source Confidence",  value: 88, source: "ai", helper: "Quality and reliability of the sources supporting this candidate." },
];

function CandidateDetail() {
  const actions = (
    <>
      <ToolbarButton icon={Edit3}>Edit Mode</ToolbarButton>
      <ToolbarButton icon={X}>Cancel</ToolbarButton>
      <button className="h-10 px-4 rounded-lg bg-surface-1 border border-hairline text-[13px] text-text-muted cursor-not-allowed">Save Changes</button>
      <button className="h-10 px-4 inline-flex items-center gap-2 rounded-lg font-medium text-[13px] text-primary-foreground"
        style={{ background: "linear-gradient(180deg, #C9FF54, #B7F137)", border: "1px solid rgba(183,241,55,0.6)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 24px rgba(183,241,55,0.20)" }}>
        <Check className="w-4 h-4" strokeWidth={2.5} /> Approve
      </button>
      <button className="h-10 px-4 inline-flex items-center gap-2 rounded-lg text-[13px] font-medium"
        style={{ background: "rgba(255,77,69,0.10)", border: "1px solid rgba(255,77,69,0.40)", color: "#FF4D45" }}>
        <X className="w-4 h-4" strokeWidth={2.5} /> Reject
      </button>
      <button className="w-10 h-10 rounded-lg bg-surface-1 border border-hairline flex items-center justify-center hover:bg-surface-hover">
        <MoreHorizontal className="w-4 h-4 text-text-secondary" />
      </button>
    </>
  );

  return (
    <AppShell
      title="Candidate Detail"
      subtitle={undefined}
      actions={actions}
    >
      <div className="mb-4">
        <Link to="/triage" className="inline-flex items-center gap-1.5 text-[12.5px] text-text-secondary hover:text-lime">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Triage Queue
        </Link>
      </div>

      {/* Headline */}
      <Panel className="mb-5">
        <div className="p-6">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-text-muted mb-3">Candidate Headline · dc_002</div>
          <div className="flex items-start gap-4 flex-wrap">
            <h2 className="font-display text-[28px] leading-tight font-semibold flex-1 min-w-[400px]">
              MediAxis partners with ClinPilot AI to streamline triage workflows
            </h2>
            <StatusBadge status="Needs Review" size="md" />
          </div>
          <div className="grid grid-cols-6 gap-6 mt-6 pt-5 border-t border-hairline-soft">
            <HeadlineField label="Company" mark={<CompanyMark letter="M" color="#2DD4BF" size={22} />} value="MediAxis" />
            <HeadlineField label="Target"  mark={<CompanyMark letter="C" color="#4D9DFF" size={22} />} value="ClinPilot AI" />
            <HeadlineField label="Sector"   value="Healthcare" />
            <HeadlineField label="Geography" value="UK" />
            <HeadlineField label="Deal Type" value="Strategic Partnership" />
            <HeadlineField label="Published" value="Jul 15, 2025" mono />
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-12 gap-5">
        {/* LEFT / MIDDLE */}
        <div className="col-span-8 space-y-5">
          {/* Source Provenance */}
          <Panel>
            <div className="px-5 py-4 flex items-center justify-between border-b border-hairline-soft">
              <div className="flex items-center gap-2">
                <span className="mono text-[11px] text-text-muted">1.</span>
                <span className="text-[13.5px] font-semibold tracking-wide uppercase">Source Provenance</span>
              </div>
              <button className="text-[11.5px] text-text-secondary hover:text-lime inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Source</button>
            </div>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-text-muted mono text-[10px] uppercase tracking-[0.10em]">
                  <th className="text-left font-normal px-5 py-2 w-6">#</th>
                  <th className="text-left font-normal py-2">Headline</th>
                  <th className="text-left font-normal py-2">Publisher</th>
                  <th className="text-left font-normal py-2">Published</th>
                  <th className="text-left font-normal py-2">Source Type</th>
                  <th className="text-left font-normal py-2 pr-5">URL</th>
                </tr>
              </thead>
              <tbody>
                {sources.map(s => (
                  <tr key={s.n} className="border-t border-hairline-soft hover:bg-surface-hover/30">
                    <td className="px-5 py-3 mono text-text-muted">{s.n}</td>
                    <td className="py-3 pr-4 max-w-[300px]"><div className="truncate">{s.headline}</div></td>
                    <td className="py-3 pr-4 text-text-secondary">{s.publisher}</td>
                    <td className="py-3 pr-4 mono text-[11.5px] text-text-secondary">{s.date}</td>
                    <td className="py-3 pr-4">
                      <span className="text-[10.5px] px-1.5 py-0.5 rounded border border-hairline-soft text-text-secondary">{s.type}</span>
                    </td>
                    <td className="py-3 pr-5"><ExternalLink className="w-3.5 h-3.5 text-text-muted hover:text-lime cursor-pointer" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {/* Extracted Facts */}
          <Panel>
            <div className="px-5 py-4 flex items-center justify-between border-b border-hairline-soft">
              <div className="flex items-center gap-2">
                <span className="mono text-[11px] text-text-muted">2.</span>
                <span className="text-[13.5px] font-semibold tracking-wide uppercase">Extracted Facts</span>
              </div>
              <button className="text-[11.5px] text-text-secondary hover:text-lime inline-flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit Facts</button>
            </div>
            <div className="divide-y divide-hairline-soft">
              {facts.map(f => (
                <div key={f.label} className="grid grid-cols-[160px_1fr_auto] items-center px-5 py-2.5 text-[13px]">
                  <div className="text-text-muted">{f.label}</div>
                  <div className="font-medium">{f.value}</div>
                  <SourceChip source={f.source} />
                </div>
              ))}
            </div>
          </Panel>

          {/* AI Relevance Summary */}
          <Panel>
            <div className="px-5 py-4 flex items-center justify-between border-b border-hairline-soft">
              <div className="flex items-center gap-2">
                <span className="mono text-[11px] text-text-muted">3.</span>
                <span className="text-[13.5px] font-semibold tracking-wide uppercase">AI Relevance Summary</span>
                <SourceChip source="ai" />
              </div>
            </div>
            <div className="p-5 text-[13px] leading-relaxed text-text-secondary">
              <p className="mb-4">
                This partnership aligns strongly with our thesis on AI-driven clinical workflow automation.
                ClinPilot AI provides AI-powered triage and decision support capabilities that integrate
                with MediAxis' clinical systems, aiming to reduce clinician workload and improve patient
                throughput in UK healthcare settings.
              </p>
              <div className="text-[12px] mono uppercase tracking-wider text-text-muted mb-2">Key Reasons</div>
              <ul className="space-y-2">
                {[
                  "Direct application of AI to clinical workflow and triage processes",
                  "Partnership expands reach within the UK healthcare market",
                  "Addresses measurable outcomes: efficiency, accuracy, and clinician productivity",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#8EEA45" }} />
                    <span className="text-text-primary">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          {/* Attributes & Scores */}
          <Panel>
            <div className="px-5 py-4 flex items-center justify-between border-b border-hairline-soft">
              <div className="flex items-center gap-2">
                <span className="mono text-[11px] text-text-muted">4.</span>
                <span className="text-[13.5px] font-semibold tracking-wide uppercase">Attributes & Scores</span>
                <span className="text-[11px] text-text-muted italic">(editable)</span>
              </div>
              <button className="text-[11.5px] text-text-secondary hover:text-lime inline-flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
            </div>
            <div className="p-5 space-y-3">
              {attrs.map(a => (
                <div key={a.label} className="grid grid-cols-[120px_1fr_auto] items-center gap-3">
                  <div className="text-[12.5px] text-text-muted">{a.label}</div>
                  <button className="h-9 px-3 rounded-md bg-surface-2 border border-hairline text-[13px] text-left flex items-center justify-between hover:border-hairline-soft">
                    {a.value}
                    <MoreHorizontal className="w-3.5 h-3.5 text-text-muted rotate-90" />
                  </button>
                  <SourceChip source={a.source as any} />
                </div>
              ))}
              <div className="pt-3 mt-2 border-t border-hairline-soft space-y-3">
                {scores.map(s => (
                  <div key={s.label} className="grid grid-cols-[160px_auto_1fr] items-center gap-3">
                    <div className="text-[12.5px] text-text-muted">{s.label}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mono text-[12px] font-semibold"
                           style={{ background: s.value >= 80 ? "rgba(142,234,69,0.15)" : "rgba(245,165,36,0.15)",
                                    border: `1px solid ${s.value >= 80 ? "rgba(142,234,69,0.4)" : "rgba(245,165,36,0.4)"}`,
                                    color: s.value >= 80 ? "#8EEA45" : "#F5A524" }}>
                        {s.value}
                      </div>
                      <SourceChip source={s.source as any} />
                    </div>
                    <div className="text-[11.5px] text-text-muted">{s.helper}</div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Notes & Tags */}
          <div className="grid grid-cols-2 gap-5">
            <Panel>
              <div className="px-5 py-4 flex items-center justify-between border-b border-hairline-soft">
                <div className="flex items-center gap-2">
                  <span className="mono text-[11px] text-text-muted">5.</span>
                  <span className="text-[13.5px] font-semibold tracking-wide uppercase">Analyst Notes</span>
                </div>
                <span className="mono text-[10.5px] text-text-muted">0 / 2000</span>
              </div>
              <div className="p-5">
                <textarea placeholder="Add your notes here..." rows={4}
                  className="w-full bg-surface-2 border border-hairline rounded-md p-3 text-[13px] placeholder:text-text-muted resize-none focus:outline-none focus:border-lime/40" />
                <div className="mt-3 text-[11px] text-text-muted flex items-center gap-1.5"><Info className="w-3 h-3" /> These notes are internal and will not be shared externally.</div>
              </div>
            </Panel>
            <Panel>
              <div className="px-5 py-4 flex items-center justify-between border-b border-hairline-soft">
                <div className="flex items-center gap-2">
                  <span className="mono text-[11px] text-text-muted">6.</span>
                  <span className="text-[13.5px] font-semibold tracking-wide uppercase">Internal Tags</span>
                </div>
                <button className="text-[11.5px] text-text-secondary hover:text-lime inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Tag</button>
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                {["UK Market", "Clinical Workflow", "AI Triage", "EHR Integration"].map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-surface-2 border border-hairline text-[12px]">
                    <Tag className="w-3 h-3 text-text-muted" />
                    {t}
                    <X className="w-3 h-3 text-text-muted hover:text-danger cursor-pointer" />
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-5">
          <Panel>
            <PanelHeader title="Review State" action={<Edit3 className="w-3.5 h-3.5 cursor-pointer hover:text-lime" />} />
            <div className="px-5 pb-5 space-y-3 text-[13px]">
              <Row label="Overall Status" value={<StatusBadge status="Needs Review" size="xs" />} />
              <Row label="Assigned To"    value={<span className="font-medium">Maya Patel</span>} />
              <Row label="Assigned On"    value={<span className="mono text-[12px]">Jul 15, 2025 · 09:10 AM</span>} />
              <Row label="SLA"            value={<span className="mono text-[12px] text-warning">Due in 2d 14h</span>} />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Provenance Validation" icon={ShieldCheck} />
            <div className="px-5 pb-5 space-y-2.5 text-[12.5px]">
              <ValidRow label="Sources Verified" value={<span className="mono">4 / 4</span>} good />
              <ValidRow label="Publisher Reputation" value="High" good />
              <ValidRow label="Duplication Check" value="No issues" good />
              <ValidRow label="Conflicting Info" value="None detected" good />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Score Explanations" icon={Info} />
            <div className="px-5 pb-5 space-y-4 text-[12.5px]">
              {scores.map(s => (
                <div key={s.label}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{s.label}</span>
                    <span className="mono text-text-muted">({s.value})</span>
                  </div>
                  <div className="text-[11.5px] text-text-secondary leading-relaxed">{s.helper}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="px-5 py-4 flex items-center justify-between border-b border-hairline-soft">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-[13px] font-semibold tracking-wide uppercase">Social / Community</span>
              </div>
              <span className="text-[10.5px] mono px-1.5 py-0.5 rounded border border-hairline-soft text-text-muted">Secondary Signal</span>
            </div>
            <div className="p-5 space-y-3 text-[12px] text-text-secondary">
              <div className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-text-muted mt-0.5" />
                <div>No social enrichment available.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-text-muted mt-0.5" />
                <div className="text-[11.5px] leading-relaxed">Social and community data are not primary intake paths and are not required for review.</div>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Audit Trail" icon={FileText} />
            <div className="px-5 pb-5 space-y-3 text-[12px]">
              <AuditItem who="JS" action="Edited AI Role" when="Today, 09:42 AM" />
              <AuditItem who="MP" action="Reviewed sources"  when="Today, 09:15 AM" />
              <AuditItem who="AI" action="Draft classification generated" when="Jul 15, 09:10 AM" agent />
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function HeadlineField({ label, value, mark, mono }: any) {
  return (
    <div>
      <div className="text-[10.5px] mono uppercase tracking-wider text-text-muted mb-1.5">{label}</div>
      <div className={`flex items-center gap-2 ${mono ? "mono" : ""} text-[14px] font-medium`}>
        {mark}{value}
      </div>
    </div>
  );
}

function SourceChip({ source }: { source: "ai" | "human" }) {
  if (source === "human") {
    return <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10.5px] font-medium"
      style={{ color: "#F5A524", background: "rgba(245,165,36,0.10)", border: "1px solid rgba(245,165,36,0.30)" }}>
      <User className="w-3 h-3" /> Human edited
    </span>;
  }
  return <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10.5px] font-medium"
    style={{ color: "#8EEA45", background: "rgba(142,234,69,0.10)", border: "1px solid rgba(142,234,69,0.30)" }}>
    <Bot className="w-3 h-3" /> AI draft
  </span>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ValidRow({ label, value, good }: { label: string; value: React.ReactNode; good?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2">
        <Check className="w-3.5 h-3.5" style={{ color: good ? "#8EEA45" : "#F5A524" }} />
        {label}
      </span>
      <span className="text-text-secondary mono text-[11.5px]">{value}</span>
    </div>
  );
}

function AuditItem({ who, action, when, agent }: { who: string; action: string; when: string; agent?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded-full flex items-center justify-center mono text-[9.5px] font-semibold shrink-0"
        style={agent
          ? { background: "rgba(142,234,69,0.15)", color: "#8EEA45", border: "1px solid rgba(142,234,69,0.35)" }
          : { background: "rgba(77,157,255,0.15)", color: "#4D9DFF", border: "1px solid rgba(77,157,255,0.35)" }}>
        {who}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium">{action}</div>
        <div className="text-[10.5px] text-text-muted mono">{when}</div>
      </div>
    </div>
  );
}
