import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Loader2,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Lock,
  Circle,
  Info,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { ToastViewport } from "@/components/app-toast";
import overviewIcon from "../../docs/assets/dashboard-icons/overview.svg";
import triageQueueIcon from "../../docs/assets/dashboard-icons/triage-queue.svg";
import candidateDetailIcon from "../../docs/assets/dashboard-icons/candidate-detail.svg";
import briefArchiveIcon from "../../docs/assets/dashboard-icons/brief-archive.svg";
import dashboardIcon from "../../docs/assets/dashboard-icons/dashboard.svg";
import settingsIcon from "../../docs/assets/dashboard-icons/settings.svg";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "adoptx.desktop.sidebarCollapsed";

const nav = [
  { to: "/", label: "Overview", iconSrc: overviewIcon },
  { to: "/triage", label: "Triage Queue", iconSrc: triageQueueIcon },
  { to: "/candidate", label: "Candidate Detail", iconSrc: candidateDetailIcon },
  { to: "/briefs", label: "Brief Archive", iconSrc: briefArchiveIcon },
  { to: "/dashboard", label: "Dashboard", iconSrc: dashboardIcon },
  { to: "/settings", label: "Settings", iconSrc: settingsIcon },
] as const;

const quickFilters = [
  { label: "Pending Review", count: 14, color: "#F5A524" },
  { label: "Brief Queued", count: 6, color: "#4D9DFF" },
  { label: "Brief Ready", count: 5, color: "#8EEA45" },
  { label: "Brief Failed", count: 2, color: "#FF4D45" },
  { label: "Rejected", count: 2, color: "#6F7D88" },
];

function SidebarContent({
  pathname,
  onNavigate,
  collapsed = false,
  showCollapseToggle = false,
  onToggleCollapse,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  showCollapseToggle?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <>
      <div
        className={`border-b border-hairline-soft shrink-0 ${
          collapsed
            ? "h-[92px] px-3 py-3 flex flex-col items-center justify-center gap-2"
            : "h-[68px] lg:h-[76px] px-5 flex items-center gap-3"
        }`}
      >
        <img
          src="/adoptx_logo_transparent_4x.svg"
          alt="Adopt X"
          className={`shrink-0 object-contain ${collapsed ? "h-9 w-9" : "h-10 w-10"}`}
        />
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <div className="font-display text-[17px] font-semibold tracking-tight truncate">
              Adopt X
            </div>
            <div className="mono text-[10px] text-text-muted uppercase tracking-[0.14em] truncate">
              v0.9 / analyst
            </div>
          </div>
        )}
        {showCollapseToggle && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className={`rounded-lg border border-hairline bg-surface-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary ${
              collapsed
                ? "flex h-8 w-8 items-center justify-center"
                : "ml-auto flex h-9 w-9 items-center justify-center shrink-0"
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav className={collapsed ? "px-2 py-4 space-y-2" : "px-3 py-4 space-y-1"}>
        {nav.map(({ to, label, iconSrc }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              aria-label={label}
              title={collapsed ? label : undefined}
              className={`group flex items-center rounded-lg text-[13.5px] transition-colors ${
                collapsed ? "mx-auto h-10 w-10 justify-center" : "h-10 gap-3 px-3"
              } ${
                active
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(180deg, rgba(183,241,55,0.12), rgba(183,241,55,0.03)), #101B23",
                      border: "1px solid rgba(183,241,55,0.35)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(183,241,55,0.08)",
                    }
                  : undefined
              }
            >
              <img
                src={iconSrc}
                alt=""
                aria-hidden="true"
                className={`shrink-0 object-contain transition-opacity ${
                  collapsed ? "h-5 w-5" : "h-4 w-4"
                } ${active ? "opacity-100" : "opacity-70 group-hover:opacity-90"}`}
              />
              {!collapsed && <span className={active ? "font-medium" : ""}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-5 mt-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
              Quick Filters
            </div>
            <Filter className="h-3.5 w-3.5 text-text-muted" />
          </div>
          <div className="space-y-1.5">
            {quickFilters.map((f) => (
              <button
                key={f.label}
                className="flex h-8 w-full items-center justify-between rounded-md px-2.5 text-[12.5px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: f.color }}
                  />
                  <span className="truncate">{f.label}</span>
                </span>
                <span className="mono shrink-0 text-[11px] tabular-nums text-text-muted">
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="mt-auto space-y-3 p-3">
          <div className="flex items-center gap-3 rounded-lg border border-hairline-soft bg-surface-1/60 px-3 py-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, #B7F137, #8EEA45)" }}
            >
              MP
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-medium">Maya Patel</div>
              <div className="text-[11px] text-text-muted">Senior Analyst</div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
          </div>
          <div className="flex items-center gap-2 px-2 text-[11px] text-text-muted">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="truncate">
              All Systems Operational - <span className="mono">08:32</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasLoadedSidebarPreference, setHasLoadedSidebarPreference] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true");
    } catch {
      setSidebarCollapsed(false);
    } finally {
      setHasLoadedSidebarPreference(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSidebarPreference || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY,
        String(sidebarCollapsed),
      );
    } catch {
      // Ignore storage failures and keep the current in-memory UI state.
    }
  }, [hasLoadedSidebarPreference, sidebarCollapsed]);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((value) => !value);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex lg:h-screen lg:overflow-hidden">
      <aside
        className={`hidden lg:flex h-screen shrink-0 overflow-hidden border-r border-hairline flex-col transition-[width] duration-200 ease-out ${
          sidebarCollapsed ? "w-[76px]" : "w-[248px]"
        }`}
        style={{ background: "var(--sidebar-bg)" }}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={sidebarCollapsed}
          showCollapseToggle
          onToggleCollapse={toggleSidebarCollapsed}
        />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="relative flex w-[280px] max-w-[85vw] flex-col border-r border-hairline shadow-2xl"
            style={{ background: "var(--sidebar-bg)" }}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-surface-1 hover:bg-surface-hover"
              aria-label="Close menu"
            >
              <X className="h-4 w-4 text-text-secondary" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <main className="relative flex min-w-0 flex-1 flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden">
        <header className="flex min-h-[68px] items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-6 lg:h-[76px] lg:gap-6 lg:px-8 lg:py-0 flex-wrap">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-1 hover:bg-surface-hover lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 text-text-secondary" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-[18px] font-semibold leading-tight tracking-tight sm:text-[20px] lg:text-[24px]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-text-secondary lg:text-[11.5px]">
                  <span className="truncate">{subtitle}</span>
                  <Info className="h-3 w-3 shrink-0 text-text-muted" />
                </p>
              )}
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto lg:gap-2.5">
            {actions ?? (
              <>
                <div className="relative hidden sm:block">
                  <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <input
                    placeholder="Search candidates..."
                    className="h-10 w-[200px] rounded-lg border border-hairline bg-surface-1 pl-9 pr-14 text-[12px] placeholder:text-text-muted focus:border-lime/50 focus:outline-none lg:w-[260px]"
                  />
                  <kbd className="mono absolute top-1/2 right-2 -translate-y-1/2 rounded border border-hairline px-1.5 py-0.5 text-[9.5px] text-text-muted">
                    Cmd+K
                  </kbd>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-surface-1 sm:hidden"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-text-secondary" />
                </button>
                <ToolbarButton icon={Filter}>Filters</ToolbarButton>
                <ToolbarButton icon={ArrowUpDown}>Sort</ToolbarButton>
                <PrimaryButton icon={Plus}>New Scan</PrimaryButton>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 min-w-0 overflow-auto lg:min-h-0">
          <div className="p-4 sm:p-5 lg:p-6">{children}</div>
        </div>
        <ToastViewport />
      </main>
    </div>
  );
}

export function ToolbarButton({
  icon: Icon,
  children,
  onClick,
}: {
  icon?: any;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline bg-surface-1 px-3 text-[12px] text-text-primary whitespace-nowrap transition-colors hover:border-hairline-soft hover:bg-surface-hover lg:px-3.5"
    >
      {Icon && <Icon className="h-3.5 w-3.5 text-text-secondary" />}
      {children}
    </button>
  );
}

export function PrimaryButton({
  icon: Icon,
  children,
  onClick,
}: {
  icon?: any;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-lg pl-3.5 pr-4 text-[12px] font-medium text-primary-foreground whitespace-nowrap transition-colors"
      style={{
        background: "linear-gradient(180deg, #C9FF54, #B7F137)",
        border: "1px solid rgba(183,241,55,0.6)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 24px rgba(183,241,55,0.20)",
      }}
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={2.5} />}
      {children}
      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
    </button>
  );
}

type StatusStyle = { color: string; bg: string; border: string; icon: any };

export const statusStyles: Record<string, StatusStyle> = {
  "Brief Ready": {
    color: "#8EEA45",
    bg: "rgba(142,234,69,0.10)",
    border: "rgba(142,234,69,0.32)",
    icon: CheckCircle2,
  },
  Approved: {
    color: "#8EEA45",
    bg: "rgba(142,234,69,0.10)",
    border: "rgba(142,234,69,0.32)",
    icon: CheckCircle2,
  },
  "Needs Review": {
    color: "#F5A524",
    bg: "rgba(245,165,36,0.10)",
    border: "rgba(245,165,36,0.32)",
    icon: AlertTriangle,
  },
  "Brief Queued": {
    color: "#4D9DFF",
    bg: "rgba(77,157,255,0.10)",
    border: "rgba(77,157,255,0.32)",
    icon: Clock,
  },
  Queued: {
    color: "#4D9DFF",
    bg: "rgba(77,157,255,0.10)",
    border: "rgba(77,157,255,0.32)",
    icon: Clock,
  },
  Rejected: {
    color: "#FF4D45",
    bg: "rgba(255,77,69,0.10)",
    border: "rgba(255,77,69,0.32)",
    icon: XCircle,
  },
  "Brief Failed": {
    color: "#FF4D45",
    bg: "rgba(255,77,69,0.10)",
    border: "rgba(255,77,69,0.32)",
    icon: XCircle,
  },
  Failed: {
    color: "#FF4D45",
    bg: "rgba(255,77,69,0.10)",
    border: "rgba(255,77,69,0.32)",
    icon: XCircle,
  },
  Running: {
    color: "#F5A524",
    bg: "rgba(245,165,36,0.10)",
    border: "rgba(245,165,36,0.32)",
    icon: Loader2,
  },
  Completed: {
    color: "#8EEA45",
    bg: "rgba(142,234,69,0.10)",
    border: "rgba(142,234,69,0.32)",
    icon: CheckCircle2,
  },
  "Permission Restricted": {
    color: "#6F7D88",
    bg: "rgba(148,163,184,0.10)",
    border: "rgba(148,163,184,0.28)",
    icon: Lock,
  },
  Loading: {
    color: "#4D9DFF",
    bg: "rgba(77,157,255,0.10)",
    border: "rgba(77,157,255,0.32)",
    icon: Loader2,
  },
  Empty: {
    color: "#6F7D88",
    bg: "rgba(148,163,184,0.10)",
    border: "rgba(148,163,184,0.20)",
    icon: Circle,
  },
};

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "xs" | "sm" | "md";
}) {
  const s = statusStyles[status] ?? statusStyles.Empty;
  const Icon = s.icon;
  const sizing =
    size === "xs"
      ? "h-5 px-1.5 text-[9.5px]"
      : size === "md"
        ? "h-7 px-2.5 text-[11.5px]"
        : "h-6 px-2 text-[10.5px]";
  const iconSize = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap ${sizing}`}
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      <Icon
        className={`${iconSize} ${
          status === "Running" || status === "Loading" ? "animate-spin" : ""
        }`}
      />
      {status}
    </span>
  );
}

export function Panel({
  children,
  className = "",
  active = false,
  danger = false,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
  danger?: boolean;
}) {
  const cls = active ? "panel-active" : danger ? "panel-danger" : "panel";
  return <div className={`${cls} ${className}`}>{children}</div>;
}

export function PanelHeader({
  title,
  action,
  icon: Icon,
}: {
  title: string;
  action?: ReactNode;
  icon?: any;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-text-secondary" />}
        <div className="truncate text-[12.5px] font-semibold tracking-tight">{title}</div>
      </div>
      {action && <div className="shrink-0 text-[11px] text-text-secondary">{action}</div>}
    </div>
  );
}

export function CompanyMark({
  letter,
  color,
  size = 32,
}: {
  letter: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-md font-semibold"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}44, ${color}22)`,
        border: `1px solid ${color}66`,
        color,
        fontSize: size * 0.42,
      }}
    >
      {letter}
    </div>
  );
}

export function ScoreBar({
  value,
  colorHint,
}: {
  value: number;
  colorHint?: "good" | "warn" | "bad";
}) {
  const auto =
    value >= 80 ? "#8EEA45" : value >= 60 ? "#B7F137" : value >= 40 ? "#F5A524" : "#FF4D45";
  const color =
    colorHint === "good"
      ? "#8EEA45"
      : colorHint === "warn"
        ? "#F5A524"
        : colorHint === "bad"
          ? "#FF4D45"
          : auto;

  return (
    <div className="flex min-w-[56px] items-center gap-2">
      <span className="mono text-[11px] tabular-nums" style={{ color }}>
        {value}
      </span>
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
