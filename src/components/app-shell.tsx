import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutGrid, ListFilter, FileText, Archive, BarChart3, Settings,
  ChevronDown, Loader2, Search, Filter, ArrowUpDown, Plus,
  CheckCircle2, AlertTriangle, Clock, XCircle, Lock, Circle, Info,
  Menu, X,
} from "lucide-react";

const nav = [
  { to: "/",           label: "Overview",        icon: LayoutGrid },
  { to: "/triage",     label: "Triage Queue",    icon: ListFilter },
  { to: "/candidate",  label: "Candidate Detail",icon: FileText },
  { to: "/briefs",     label: "Brief Archive",   icon: Archive },
  { to: "/dashboard",  label: "Dashboard",       icon: BarChart3 },
  { to: "/settings",   label: "Settings",        icon: Settings },
] as const;

const quickFilters = [
  { label: "Pending Review", count: 14, color: "#F5A524" },
  { label: "Brief Queued",   count: 6,  color: "#4D9DFF" },
  { label: "Brief Ready",    count: 5,  color: "#8EEA45" },
  { label: "Brief Failed",   count: 2,  color: "#FF4D45" },
  { label: "Rejected",       count: 2,  color: "#6F7D88" },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="h-[68px] lg:h-[76px] px-5 flex items-center gap-3 border-b border-hairline-soft shrink-0">
        <div className="relative w-9 h-9 rounded-md flex items-center justify-center shrink-0"
             style={{ background: "linear-gradient(135deg, rgba(183,241,55,0.20), rgba(45,212,191,0.15))", border: "1px solid rgba(183,241,55,0.35)" }}>
          <div className="w-4 h-4 rotate-45 border-2 border-lime rounded-[2px]" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="font-display text-[17px] font-semibold tracking-tight truncate">Adopt X</div>
          <div className="mono text-[10px] text-text-muted uppercase tracking-[0.14em] truncate">v0.9 · analyst</div>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link key={to} to={to} onClick={onNavigate}
              className={`flex items-center gap-3 px-3 h-10 rounded-lg text-[13.5px] transition-colors group
                ${active
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"}`}
              style={active ? {
                background: "linear-gradient(180deg, rgba(183,241,55,0.12), rgba(183,241,55,0.03)), #101B23",
                border: "1px solid rgba(183,241,55,0.35)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(183,241,55,0.08)",
              } : undefined}
            >
              <Icon className={`w-4 h-4 ${active ? "text-lime" : ""}`} strokeWidth={active ? 2.25 : 1.75} />
              <span className={active ? "font-medium" : ""}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Quick Filters</div>
          <Filter className="w-3.5 h-3.5 text-text-muted" />
        </div>
        <div className="space-y-1.5">
          {quickFilters.map((f) => (
            <button key={f.label}
              className="w-full flex items-center justify-between px-2.5 h-8 rounded-md text-[12.5px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: f.color }} />
                <span className="truncate">{f.label}</span>
              </span>
              <span className="mono text-[11px] text-text-muted tabular-nums shrink-0">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-3 space-y-3">
        <div className="rounded-lg px-3 py-2.5 flex items-center gap-3 border border-hairline-soft bg-surface-1/60">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold text-primary-foreground shrink-0"
               style={{ background: "linear-gradient(135deg, #B7F137, #8EEA45)" }}>
            MP
          </div>
          <div className="leading-tight flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">Maya Patel</div>
            <div className="text-[11px] text-text-muted">Senior Analyst</div>
          </div>
          <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
        </div>
        <div className="flex items-center gap-2 px-2 text-[11px] text-text-muted">
          <span className="relative flex w-2 h-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="truncate">All Systems Operational · <span className="mono">08:32</span></span>
        </div>
      </div>
    </>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  showStateStrip = true,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showStateStrip?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[248px] shrink-0 border-r border-hairline flex-col" style={{ background: "var(--sidebar-bg)" }}>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="relative w-[280px] max-w-[85vw] flex flex-col border-r border-hairline shadow-2xl" style={{ background: "var(--sidebar-bg)" }}>
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-3 w-8 h-8 rounded-md bg-surface-1 border border-hairline flex items-center justify-center hover:bg-surface-hover z-10"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="min-h-[68px] lg:h-[76px] px-4 sm:px-6 lg:px-8 border-b border-hairline flex items-center justify-between gap-3 lg:gap-6 flex-wrap py-3 lg:py-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden w-9 h-9 shrink-0 rounded-md bg-surface-1 border border-hairline flex items-center justify-center hover:bg-surface-hover"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4 text-text-secondary" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-[20px] sm:text-[22px] lg:text-[26px] font-semibold leading-tight tracking-tight truncate">{title}</h1>
              {subtitle && (
                <p className="text-[12px] lg:text-[12.5px] text-text-secondary mt-0.5 flex items-center gap-1.5 truncate">
                  <span className="truncate">{subtitle}</span> <Info className="w-3 h-3 text-text-muted shrink-0" />
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-2.5 flex-wrap w-full sm:w-auto">
            {actions ?? (
              <>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input placeholder="Search candidates..." className="pl-9 pr-14 h-10 w-[200px] lg:w-[260px] rounded-lg bg-surface-1 border border-hairline text-[13px] placeholder:text-text-muted focus:outline-none focus:border-lime/50" />
                  <kbd className="absolute right-2 top-1/2 -translate-y-1/2 mono text-[10px] text-text-muted border border-hairline px-1.5 py-0.5 rounded">⌘K</kbd>
                </div>
                <button className="sm:hidden w-10 h-10 rounded-lg bg-surface-1 border border-hairline flex items-center justify-center" aria-label="Search">
                  <Search className="w-4 h-4 text-text-secondary" />
                </button>
                <ToolbarButton icon={Filter}>Filters</ToolbarButton>
                <ToolbarButton icon={ArrowUpDown}>Sort</ToolbarButton>
                <PrimaryButton icon={Plus}>New Scan</PrimaryButton>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 min-w-0 overflow-auto">
          <div className="p-4 sm:p-5 lg:p-6">{children}</div>
        </div>

        {showStateStrip && <StateStrip />}
      </main>
    </div>
  );
}

export function ToolbarButton({ icon: Icon, children, onClick }: { icon?: any; children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="h-10 px-3 lg:px-3.5 inline-flex items-center gap-2 rounded-lg bg-surface-1 border border-hairline text-[13px] text-text-primary hover:bg-surface-hover hover:border-hairline-soft transition-colors whitespace-nowrap">
      {Icon && <Icon className="w-3.5 h-3.5 text-text-secondary" />}
      {children}
    </button>
  );
}

export function PrimaryButton({ icon: Icon, children, onClick }: { icon?: any; children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="h-10 pl-3.5 pr-4 inline-flex items-center gap-2 rounded-lg font-medium text-[13px] text-primary-foreground transition-colors whitespace-nowrap"
      style={{
        background: "linear-gradient(180deg, #C9FF54, #B7F137)",
        border: "1px solid rgba(183,241,55,0.6)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 24px rgba(183,241,55,0.20)",
      }}>
      {Icon && <Icon className="w-4 h-4" strokeWidth={2.5} />}
      {children}
      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
    </button>
  );
}

// ------- Status system -------
type StatusStyle = { color: string; bg: string; border: string; icon: any };
export const statusStyles: Record<string, StatusStyle> = {
  "Brief Ready":     { color: "#8EEA45", bg: "rgba(142,234,69,0.10)", border: "rgba(142,234,69,0.32)", icon: CheckCircle2 },
  "Approved":        { color: "#8EEA45", bg: "rgba(142,234,69,0.10)", border: "rgba(142,234,69,0.32)", icon: CheckCircle2 },
  "Needs Review":    { color: "#F5A524", bg: "rgba(245,165,36,0.10)", border: "rgba(245,165,36,0.32)", icon: AlertTriangle },
  "Brief Queued":    { color: "#4D9DFF", bg: "rgba(77,157,255,0.10)", border: "rgba(77,157,255,0.32)", icon: Clock },
  "Queued":          { color: "#4D9DFF", bg: "rgba(77,157,255,0.10)", border: "rgba(77,157,255,0.32)", icon: Clock },
  "Rejected":        { color: "#FF4D45", bg: "rgba(255,77,69,0.10)",  border: "rgba(255,77,69,0.32)",  icon: XCircle },
  "Brief Failed":    { color: "#FF4D45", bg: "rgba(255,77,69,0.10)",  border: "rgba(255,77,69,0.32)",  icon: XCircle },
  "Failed":          { color: "#FF4D45", bg: "rgba(255,77,69,0.10)",  border: "rgba(255,77,69,0.32)",  icon: XCircle },
  "Running":         { color: "#F5A524", bg: "rgba(245,165,36,0.10)", border: "rgba(245,165,36,0.32)", icon: Loader2 },
  "Completed":       { color: "#8EEA45", bg: "rgba(142,234,69,0.10)", border: "rgba(142,234,69,0.32)", icon: CheckCircle2 },
  "Permission Restricted": { color: "#6F7D88", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.28)", icon: Lock },
  "Loading":         { color: "#4D9DFF", bg: "rgba(77,157,255,0.10)", border: "rgba(77,157,255,0.32)", icon: Loader2 },
  "Empty":           { color: "#6F7D88", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.20)", icon: Circle },
};

export function StatusBadge({ status, size = "sm" }: { status: string; size?: "xs" | "sm" | "md" }) {
  const s = statusStyles[status] ?? statusStyles["Empty"];
  const Icon = s.icon;
  const sizing = size === "xs" ? "h-5 px-1.5 text-[10.5px]" : size === "md" ? "h-7 px-2.5 text-[12.5px]" : "h-6 px-2 text-[11.5px]";
  const iconSize = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap ${sizing}`}
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      <Icon className={`${iconSize} ${status === "Running" || status === "Loading" ? "animate-spin" : ""}`} />
      {status}
    </span>
  );
}

// ------- State strip -------
const stateItems = [
  { label: "Loading",              sub: "System is processing",       tone: "info",    icon: Loader2 },
  { label: "Empty Queue",          sub: "No candidates match filters", tone: "muted",   icon: Circle },
  { label: "Failed Scan",          sub: "Check logs for details",     tone: "danger",  icon: AlertTriangle },
  { label: "Needs Review",         sub: "Analyst review required",    tone: "warning", icon: AlertTriangle },
  { label: "Brief Queued",         sub: "Generation in progress",     tone: "info",    icon: Clock },
  { label: "Brief Ready",          sub: "Ready for review",           tone: "success", icon: CheckCircle2 },
  { label: "Brief Failed",         sub: "Generation failed",          tone: "danger",  icon: XCircle },
  { label: "Permission Restricted",sub: "Elevated role required",     tone: "muted",   icon: Lock },
];

const toneColor: Record<string, string> = {
  info: "#4D9DFF", success: "#8EEA45", warning: "#F5A524", danger: "#FF4D45", muted: "#6F7D88",
};

function StateStrip() {
  return (
    <div className="border-t border-hairline bg-surface-1/60 px-4 sm:px-6 py-3 flex items-stretch gap-2 overflow-x-auto">
      {stateItems.map((s) => {
        const Icon = s.icon;
        const c = toneColor[s.tone];
        return (
          <div key={s.label} className="flex items-start gap-2.5 px-3 py-1.5 rounded-md min-w-[190px] shrink-0 border border-hairline-soft bg-surface-1/50">
            <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: c }} strokeWidth={2} />
            <div className="leading-tight">
              <div className="text-[12px] font-medium" style={{ color: c }}>{s.label}</div>
              <div className="text-[10.5px] text-text-muted">{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ------- Panels -------
export function Panel({ children, className = "", active = false, danger = false }:
  { children: ReactNode; className?: string; active?: boolean; danger?: boolean }) {
  const cls = active ? "panel-active" : danger ? "panel-danger" : "panel";
  return <div className={`${cls} ${className}`}>{children}</div>;
}

export function PanelHeader({ title, action, icon: Icon }: { title: string; action?: ReactNode; icon?: any }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-text-secondary shrink-0" />}
        <div className="text-[13.5px] font-semibold tracking-tight truncate">{title}</div>
      </div>
      {action && <div className="text-[12px] text-text-secondary shrink-0">{action}</div>}
    </div>
  );
}

export function CompanyMark({ letter, color, size = 32 }: { letter: string; color: string; size?: number }) {
  return (
    <div className="rounded-md flex items-center justify-center font-semibold shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${color}44, ${color}22)`,
        border: `1px solid ${color}66`,
        color,
        fontSize: size * 0.42,
      }}>
      {letter}
    </div>
  );
}

export function ScoreBar({ value, colorHint }: { value: number; colorHint?: "good" | "warn" | "bad" }) {
  const auto = value >= 80 ? "#8EEA45" : value >= 60 ? "#B7F137" : value >= 40 ? "#F5A524" : "#FF4D45";
  const color = colorHint === "good" ? "#8EEA45" : colorHint === "warn" ? "#F5A524" : colorHint === "bad" ? "#FF4D45" : auto;
  return (
    <div className="flex items-center gap-2 min-w-[56px]">
      <span className="mono text-[12px] tabular-nums" style={{ color }}>{value}</span>
      <div className="h-[3px] flex-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
