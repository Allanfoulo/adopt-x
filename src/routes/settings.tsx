import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Panel, PanelHeader } from "@/components/app-shell";
import {
  CheckCircle2, Users, Shield, Lock, ArrowRight, ChevronDown, Info,
  Radio, Twitter, Youtube, MessageSquare, Newspaper, Building2, FileText, Rss,
  Calendar, RefreshCw, Zap, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Adopt X" }] }),
  component: Settings,
});

const structuredSources = [
  { name: "Exchange Announcements", desc: "ASX, Nasdaq, NYSE, LSE company announcements", icon: Building2, on: true },
  { name: "IR Pages",                desc: "Company investor relations and filings pages",   icon: FileText,  on: true },
  { name: "PR Wires",                desc: "BusinessWire, PR Newswire, GlobeNewswire",       icon: Radio,     on: true },
  { name: "Sector Press",            desc: "Sector-focused media and specialist publications", icon: Newspaper, on: true },
  { name: "Business Press",          desc: "Financial Times, WSJ, Bloomberg, The Economist", icon: Newspaper, on: true },
];

const secondarySources = [
  { name: "Reddit (r/investing, r/stocks)", desc: "Community discussions and due diligence", icon: MessageSquare, on: false },
  { name: "X (Twitter) Lists",              desc: "Curated lists and analyst commentary",     icon: Twitter,       on: false },
  { name: "Substack / Blogs",               desc: "Independent research and newsletters",     icon: Rss,           on: false },
  { name: "YouTube Transcripts",            desc: "Earnings calls, interviews, long-form content", icon: Youtube,   on: false },
];

function Settings() {
  const [toast, setToast] = useState(true);

  return (
    <AppShell
      title="Settings"
      subtitle="Configure how Adopt X scans, enriches, and generates investment intelligence"
      actions={
        toast ? (
          <div className="flex items-center gap-3 px-4 h-11 rounded-lg"
               style={{ background: "linear-gradient(180deg, rgba(142,234,69,0.10), rgba(142,234,69,0.03))", border: "1px solid rgba(142,234,69,0.35)" }}>
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-[13px] font-medium">Settings saved</span>
            <button className="text-[12px] text-text-secondary hover:text-lime">Undo</button>
            <button onClick={() => setToast(false)} className="text-text-muted hover:text-text-primary ml-1">×</button>
          </div>
        ) : (
          <span className="text-[12px] text-text-muted">Future integration will connect to Convex canonical records and Mastra-backed HTTP routes.</span>
        )
      }
      showStateStrip={false}
    >
      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Source Toggles */}
        <Panel>
          <div className="px-5 py-4 border-b border-hairline-soft">
            <div className="text-[13.5px] font-semibold tracking-tight">Source Toggles</div>
            <div className="text-[11.5px] text-text-muted mt-0.5">Enable or disable data sources for scanning and enrichment.</div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="text-[11px] mono uppercase tracking-wider text-text-muted mb-3">Structured public sources (default)</div>
              <div className="space-y-1.5">{structuredSources.map(s => <SourceToggle key={s.name} {...s} />)}</div>
            </div>
            <div className="pt-4 border-t border-hairline-soft">
              <div className="text-[11px] mono uppercase tracking-wider text-text-muted mb-3">Secondary / community research (optional)</div>
              <div className="space-y-1.5">{secondarySources.map(s => <SourceToggle key={s.name} {...s} />)}</div>
            </div>
          </div>
        </Panel>

        {/* Runtime Config */}
        <Panel>
          <div className="px-5 py-4 border-b border-hairline-soft">
            <div className="text-[13.5px] font-semibold tracking-tight">Runtime Config</div>
            <div className="text-[11.5px] text-text-muted mt-0.5">Default runtime behavior for scans and generation.</div>
          </div>
          <div className="p-5 space-y-4">
            <ConfigRow label="Canonical record sync (Convex)" future>
              <SelectField value="Planned" />
            </ConfigRow>
            <ConfigRow label="Realtime updates" future>
              <SelectField value="Planned" />
            </ConfigRow>
            <ConfigRow label="Dedupe similarity threshold" help>
              <InputField value="0.82" hint="0.00 (strict) → 1.00 (loose)" />
            </ConfigRow>
            <ConfigRow label="Scoring threshold (Brief Ready)" help>
              <InputField value="75" hint="0 – 100" />
            </ConfigRow>
            <ConfigRow label="Brief generation default">
              <SelectField value="Standard" hint="Standard balances speed and depth" />
            </ConfigRow>
            <ConfigRow label="Event retention (days)">
              <InputField value="90" hint="Applies to scans, briefs, and audit logs" />
            </ConfigRow>

            <div className="pt-4 border-t border-hairline-soft space-y-3">
              <div className="text-[13.5px] font-semibold">Enrichment Controls</div>
              <div className="text-[11.5px] text-text-muted -mt-2">Control post-approval enrichment and validation.</div>
              <ToggleRow label="last30days enrichment after approval" on />
              <ToggleRow label="Market context enrichment" on />
              <ConfigRow label="Source diversity minimum" help>
                <SelectField value="3 sources" />
              </ConfigRow>
              <ConfigRow label="Provenance validation rules">
                <SelectField value="Strict" hint="Require verifiable source and publish date" />
              </ConfigRow>
            </div>
          </div>
        </Panel>

        {/* Scan Cadence + Permissions */}
        <div className="space-y-5">
          <Panel>
            <div className="px-5 py-4 border-b border-hairline-soft">
              <div className="text-[13.5px] font-semibold tracking-tight">Scan Cadence Controls</div>
              <div className="text-[11.5px] text-text-muted mt-0.5">Control how and when Adopt X scans for new intelligence.</div>
            </div>
            <div className="p-5 space-y-2.5">
              <CadenceOption icon={RefreshCw} title="Hourly" desc="Run incremental scans every hour" />
              <CadenceOption icon={Calendar} title="Daily" desc="Run full scans once per day" selected current />
              <CadenceOption icon={Zap} title="Manual trigger only" desc="Run scans only when triggered" />

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-hairline-soft mt-3">
                <div>
                  <div className="text-[10.5px] mono uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Next scheduled scan</div>
                  <div className="text-[13px] mono font-semibold text-lime">Today, 09:00 AM</div>
                </div>
                <div>
                  <div className="text-[10.5px] mono uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Last scan run</div>
                  <div className="text-[13px] mono font-semibold">Today, 08:32 AM <span className="text-success text-[11px]">Completed</span></div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="px-5 py-4 border-b border-hairline-soft">
              <div className="text-[13.5px] font-semibold tracking-tight">Permissions</div>
              <div className="text-[11.5px] text-text-muted mt-0.5">Role-based access and actions.</div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <RoleCard icon={Users} title="Analyst" desc="Review, approve, and generate briefs." role="Default Role"
                perms={["View all candidates", "Generate briefs", "Approve / Reject", "Add notes"]} />
              <RoleCard icon={Shield} title="Admin" desc="Manage settings and system controls." role="Elevated Role" elevated
                perms={["All analyst permissions", "Manage settings", "Manage sources", "Manage permissions"]} />
            </div>
            <div className="mx-5 mb-5 flex items-center gap-3 p-3 rounded-md"
                 style={{ background: "rgba(255,77,69,0.08)", border: "1px solid rgba(255,77,69,0.28)" }}>
              <Lock className="w-4 h-4 text-danger" />
              <div className="flex-1 text-[12px]">
                <div className="text-danger font-medium">Permission restricted</div>
                <div className="text-text-muted text-[11.5px]">Only Admins can manage sources.</div>
              </div>
              <button className="h-8 px-3 rounded-md bg-surface-2 border border-hairline text-[12px] hover:bg-surface-hover">Request Access</button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Human Review Gate */}
      <Panel className="mb-5">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                 style={{ background: "rgba(142,234,69,0.15)", border: "1px solid rgba(142,234,69,0.35)" }}>
              <ShieldCheck className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold">Human Review Gate</div>
              <div className="text-[12px] text-text-secondary">No brief becomes final without analyst approval.</div>
            </div>
            <div className="text-[11.5px] text-text-secondary max-w-[280px] p-3 rounded-md border border-hairline-soft bg-surface-2/50">
              All final briefs require explicit analyst approval. This gate cannot be disabled.
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 items-stretch">
            {[
              { icon: Radio,       title: "Scan & Ingest", desc: "Sources scanned and data ingested" },
              { icon: Zap,         title: "Enrich & Score", desc: "Signals extracted and scored" },
              { icon: Users,       title: "Analyst Review", desc: "Human review required", accent: true },
              { icon: CheckCircle2,title: "Approve / Reject", desc: "Only approved briefs become final" },
            ].map((step, i, arr) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex items-center gap-2">
                  <div className={`flex-1 p-3 rounded-lg border ${step.accent ? "border-lime/40 bg-lime/[0.06]" : "border-hairline-soft bg-surface-2/40"}`}>
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" style={{ color: step.accent ? "#B7F137" : "#A9B4BE" }} />
                      <div className="text-[12.5px] font-semibold">{step.title}</div>
                    </div>
                    <div className="text-[11px] text-text-muted mt-1.5 leading-tight">{step.desc}</div>
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      <div className="flex items-center justify-between px-1 text-[11.5px] text-text-muted">
        <div>
          <span className="text-text-secondary">Integration note:</span> Convex will power canonical records, event history, and dedupe.
          <span className="text-text-secondary"> Mastra-backed HTTP routes</span> will power realtime updates and scan orchestration.
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] mono px-1.5 py-0.5 rounded border border-hairline-soft text-text-muted">Planned</span>
          <button className="text-text-secondary hover:text-lime">Learn more →</button>
        </div>
      </div>
    </AppShell>
  );
}

function SourceToggle({ name, desc, icon: Icon, on }: any) {
  const [enabled, setEnabled] = useState(on);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-md hover:bg-surface-hover/40">
      <div className="w-8 h-8 rounded-md flex items-center justify-center bg-surface-2 border border-hairline-soft shrink-0">
        <Icon className="w-4 h-4 text-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">{name}</div>
        <div className="text-[11px] text-text-muted truncate">{desc}</div>
      </div>
      <button onClick={() => setEnabled(!enabled)}
        className="relative w-10 h-5 rounded-full transition-colors shrink-0"
        style={{ background: enabled ? "#B7F137" : "rgba(148,163,184,0.20)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow"
              style={{ left: enabled ? "calc(100% - 18px)" : "2px" }} />
      </button>
    </div>
  );
}

function ConfigRow({ label, children, future, help }: any) {
  return (
    <div className="grid grid-cols-2 gap-3 items-start">
      <div className="pt-2">
        <div className="text-[12.5px] flex items-center gap-1.5">
          {label}
          {help && <Info className="w-3 h-3 text-text-muted" />}
          {future && <span className="text-[9.5px] mono px-1.5 py-0.5 rounded" style={{ background: "rgba(77,157,255,0.10)", color: "#4D9DFF", border: "1px solid rgba(77,157,255,0.30)" }}>Future</span>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SelectField({ value, hint }: { value: string; hint?: string }) {
  return (
    <div>
      <button className="w-full h-9 px-3 rounded-md bg-surface-2 border border-hairline text-[12.5px] flex items-center justify-between hover:border-hairline-soft">
        {value} <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
      </button>
      {hint && <div className="text-[10.5px] text-text-muted mt-1">{hint}</div>}
    </div>
  );
}

function InputField({ value, hint }: { value: string; hint?: string }) {
  return (
    <div>
      <input defaultValue={value} className="w-full h-9 px-3 rounded-md bg-surface-2 border border-hairline text-[12.5px] mono focus:outline-none focus:border-lime/50" />
      {hint && <div className="text-[10.5px] text-text-muted mt-1">{hint}</div>}
    </div>
  );
}

function ToggleRow({ label, on }: { label: string; on?: boolean }) {
  const [enabled, setEnabled] = useState(!!on);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12.5px]">{label}</span>
      <button onClick={() => setEnabled(!enabled)}
        className="relative w-10 h-5 rounded-full transition-colors"
        style={{ background: enabled ? "#B7F137" : "rgba(148,163,184,0.20)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: enabled ? "calc(100% - 18px)" : "2px" }} />
      </button>
    </div>
  );
}

function CadenceOption({ icon: Icon, title, desc, selected, current }: any) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
      selected ? "border-lime/40 bg-lime/[0.06]" : "border-hairline-soft bg-surface-2/40 hover:bg-surface-hover/40"
    }`}>
      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${selected ? "border-lime" : "border-hairline"}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-lime m-[2px]" />}
      </div>
      <Icon className="w-4 h-4 text-text-secondary mt-0.5" />
      <div className="flex-1">
        <div className="text-[13px] font-medium flex items-center gap-2">
          {title}
          {current && <span className="text-[9.5px] mono px-1.5 py-0.5 rounded" style={{ background: "rgba(183,241,55,0.15)", color: "#B7F137", border: "1px solid rgba(183,241,55,0.35)" }}>Current</span>}
        </div>
        <div className="text-[11px] text-text-muted">{desc}</div>
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, title, desc, role, elevated, perms }: any) {
  const c = elevated ? "#8B5CF6" : "#4D9DFF";
  return (
    <div className="rounded-lg border border-hairline-soft bg-surface-2/40 p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: `${c}22`, border: `1px solid ${c}44` }}>
          <Icon className="w-4 h-4" style={{ color: c }} />
        </div>
        <div>
          <div className="text-[13px] font-semibold">{title}</div>
          <div className="text-[10px] mono uppercase tracking-wider text-text-muted">{role}</div>
        </div>
      </div>
      <div className="text-[11.5px] text-text-muted mb-3">{desc}</div>
      <ul className="space-y-1 text-[11.5px]">
        {perms.map((p: string) => (
          <li key={p} className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-success" /> {p}</li>
        ))}
      </ul>
    </div>
  );
}
