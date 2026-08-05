import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import {
  AppShell,
  CompanyMark,
  Panel,
  PanelHeader,
  PrimaryButton,
  StatusBadge,
  ToolbarButton,
  statusStyles,
} from "@/components/app-shell";
import { useToast } from "@/components/app-toast";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Overview - Adopt X" }] }),
  component: Overview,
});

type OverviewSummary = FunctionReturnType<typeof api.overview.getSummary>;

type QueueSummaryItem = {
  label: string;
  value: number;
  color: string;
};

type TopRunCard = {
  title: string;
  status: string;
  timestamp: string;
  cta: string;
};

type SectorDistributionItem = {
  label: string;
  value: number;
  color: string;
  width: string;
};

type NeedsAttentionRow = {
  id: string;
  company: string;
  target: string;
  logoLetter: string;
  logoColor: string;
  issue: string;
  status: string;
  age: string;
};

type RecentApprovalRow = {
  id: string;
  company: string;
  target: string;
  logoLetter: string;
  logoColor: string;
  approvedBy: string;
  time: string;
};

type RecentQueueActivityRow = {
  time: string;
  company: string;
  target: string;
  sector: string;
  dealType: string;
  status: "Pending Review" | "Brief Queued" | "Brief Ready" | "Rejected" | "Approved";
  assignedTo: string;
};

type OperationalRunRow = {
  id: string;
  type: string;
  status: "Completed" | "Failed" | "Running" | string;
  started: string;
  duration: string;
};

type AuditTrailEntry = {
  actor: string;
  initials: string;
  action: string;
  target: string;
  detail: string;
  when: string;
  system?: boolean;
};

const statusColors: Record<string, string> = {
  "Pending Review": "#F5A524",
  "Needs Review": "#F5A524",
  "Brief Queued": "#FFD248",
  "Brief Ready": "#8EEA45",
  Rejected: "#FF5E4A",
  Approved: "#7FA8FF",
  "Brief Failed": "#FF5E4A",
};

const sectorColors = ["#63D7D8", "#BB73FF", "#F5C243", "#B7F137", "#7FA8FF"];

const fallbackQueueSummary: QueueSummaryItem[] = [
  { label: "Pending Review", value: 14, color: "#F5A524" },
  { label: "Brief Queued", value: 6, color: "#FFD248" },
  { label: "Brief Ready", value: 5, color: "#8EEA45" },
  { label: "Rejected", value: 2, color: "#FF5E4A" },
  { label: "Approved", value: 18, color: "#7FA8FF" },
] as const;

const fallbackTopRunCards: TopRunCard[] = [
  {
    title: "Latest Scan",
    status: "Completed",
    timestamp: "Today, 08:32 AM",
    cta: "View Scans",
  },
  {
    title: "Latest Brief Generation",
    status: "Brief Ready",
    timestamp: "Today, 09:05 AM",
    cta: "View Briefs",
  },
] as const;

const fallbackSectorDistribution: SectorDistributionItem[] = [
  { label: "Fintech", value: 16, color: "#63D7D8", width: "78%" },
  { label: "Healthcare", value: 13, color: "#BB73FF", width: "72%" },
  { label: "Insurance", value: 9, color: "#F5C243", width: "58%" },
  { label: "Legal", value: 7, color: "#B7F137", width: "44%" },
] as const;

const fallbackNeedsAttentionRows: NeedsAttentionRow[] = [
  {
    id: "na_001",
    company: "HealthPlus",
    target: "ScribeMed",
    logoLetter: "H",
    logoColor: "#8A4BFF",
    issue: "Missing source confidence on 3 key claims",
    status: "Needs Review",
    age: "2h",
  },
  {
    id: "na_002",
    company: "OptiClaim",
    target: "OptInsure AI",
    logoLetter: "O",
    logoColor: "#3E65FF",
    issue: "Conflicting evidence in claims accuracy",
    status: "Needs Review",
    age: "4h",
  },
  {
    id: "na_003",
    company: "LexGrid",
    target: "RegAICore",
    logoLetter: "L",
    logoColor: "#7C8B98",
    issue: "Low source confidence (Avg: 54%)",
    status: "Needs Review",
    age: "6h",
  },
  {
    id: "na_004",
    company: "PayFlow",
    target: "RiskEdge AI",
    logoLetter: "S",
    logoColor: "#F5F7FA",
    issue: "Thin source coverage for fraud dataset",
    status: "Needs Review",
    age: "9h",
  },
  {
    id: "na_005",
    company: "MediAxis",
    target: "ClinPilot AI",
    logoLetter: "M",
    logoColor: "#D9D2C6",
    issue: "Human edit on extracted fact",
    status: "Human Edited",
    age: "11h",
  },
] as const;

const fallbackRecentApprovals: RecentApprovalRow[] = [
  {
    id: "ap_001",
    company: "MediAxis",
    target: "Healthcare",
    logoLetter: "M",
    logoColor: "#D9D2C6",
    approvedBy: "Maya Patel",
    time: "Jul 15, 09:10 AM",
  },
  {
    id: "ap_002",
    company: "InsuraCo",
    target: "Insurance",
    logoLetter: "I",
    logoColor: "#FF7A66",
    approvedBy: "Jordan Smith",
    time: "Jul 14, 04:18 PM",
  },
  {
    id: "ap_003",
    company: "SureShield",
    target: "Insurance",
    logoLetter: "U",
    logoColor: "#E9E2D7",
    approvedBy: "Maya Patel",
    time: "Jul 14, 11:32 AM",
  },
  {
    id: "ap_004",
    company: "ClauseBase",
    target: "Legal",
    logoLetter: "C",
    logoColor: "#B9BCC3",
    approvedBy: "Jordan Smith",
    time: "Jul 13, 05:47 PM",
  },
  {
    id: "ap_005",
    company: "FinSight",
    target: "Fintech",
    logoLetter: "F",
    logoColor: "#5DD7D4",
    approvedBy: "Maya Patel",
    time: "Jul 13, 10:21 AM",
  },
] as const;

const fallbackRecentQueueActivity: RecentQueueActivityRow[] = [
  {
    time: "10 min ago",
    company: "HealthPlus",
    target: "ScribeMed",
    sector: "Healthcare",
    dealType: "Acquisition",
    status: "Brief Ready",
    assignedTo: "Maya Patel",
  },
  {
    time: "25 min ago",
    company: "LexGrid",
    target: "RegAICore",
    sector: "Legal",
    dealType: "Strategic Partnership",
    status: "Brief Queued",
    assignedTo: "Jordan Smith",
  },
  {
    time: "45 min ago",
    company: "OptiClaim",
    target: "OptInsure AI",
    sector: "Insurance",
    dealType: "Investment",
    status: "Pending Review",
    assignedTo: "Maya Patel",
  },
  {
    time: "1 hr ago",
    company: "PayFlow",
    target: "RiskEdge AI",
    sector: "Fintech",
    dealType: "Strategic Partnership",
    status: "Rejected",
    assignedTo: "Jordan Smith",
  },
  {
    time: "1 hr ago",
    company: "FinSight",
    target: "FinSight AI",
    sector: "Fintech",
    dealType: "Acquisition",
    status: "Approved",
    assignedTo: "Maya Patel",
  },
] as const;

const fallbackOperationalRuns: OperationalRunRow[] = [
  {
    id: "scan_001",
    type: "Full Scan",
    status: "Completed",
    started: "08:32 AM",
    duration: "00:18:42",
  },
  {
    id: "brief_092",
    type: "Brief Gen",
    status: "Completed",
    started: "09:05 AM",
    duration: "00:07:31",
  },
  {
    id: "scan_000",
    type: "Full Scan",
    status: "Completed",
    started: "Yesterday",
    duration: "00:21:14",
  },
  {
    id: "scan_099",
    type: "Delta Scan",
    status: "Failed",
    started: "Jul 14",
    duration: "00:04:52",
  },
  {
    id: "brief_091",
    type: "Brief Gen",
    status: "Completed",
    started: "Jul 14",
    duration: "00:06:08",
  },
];

const operationalActivity = [
  { label: "45 candidates synced", meta: "scan_001", when: "09:12 AM" },
  { label: "18 briefs generated", meta: "brief_092", when: "09:05 AM" },
  { label: "Source confidence recalculated", meta: "delta_014", when: "08:58 AM" },
  { label: "Approval queue refreshed", meta: "queue_007", when: "08:44 AM" },
] as const;

const fallbackAuditTrail: AuditTrailEntry[] = [
  {
    actor: "Maya Patel",
    initials: "MP",
    action: "approved candidate",
    target: "MediAxis / ClinPilot AI (dc_002)",
    detail: "",
    when: "10 min ago",
  },
  {
    actor: "Jordan Smith",
    initials: "JS",
    action: "edited Deal Type",
    target: "LexGrid / RegAICore (dc_004)",
    detail: "",
    when: "22 min ago",
  },
  {
    actor: "System",
    initials: "SX",
    action: "scan_001 completed",
    target: "45 candidates created",
    detail: "",
    when: "Today, 08:32 AM",
    system: true,
  },
  {
    actor: "Maya Patel",
    initials: "MP",
    action: "rejected candidate",
    target: "SparkPrompt (dc_005)",
    detail: '"Low adoption signal"',
    when: "1 hr ago",
  },
  {
    actor: "System",
    initials: "SX",
    action: "brief_092 completed",
    target: "18 briefs generated",
    detail: "",
    when: "Today, 09:05 AM",
    system: true,
  },
];

function Overview() {
  const { loading, updateToast, info, error } = useToast();
  const [runsTab, setRunsTab] = useState<"Runs" | "Activity">("Runs");
  const startScanAction = useAction(api.scans.start);
  const summary = useQuery(api.overview.getSummary, {});
  const view = buildOverviewView(summary);

  const startScan = async () => {
    const toastId = loading({
      title: "Scan started",
      description: "Windmill is collecting verified public deal sources. The queue will update when ingestion finishes.",
      action: { label: "Dismiss", emphasis: "secondary" },
    });

    try {
      const result = await startScanAction({});
      updateToast(toastId, {
        tone: "info",
        title: "Scan queued",
        description: result.jobId
          ? `Windmill job ${result.jobId} is collecting sources now.`
          : "Windmill accepted the scan and is collecting sources now.",
        action: { label: "View scan" },
        duration: 5200,
        dismissible: true,
      });
    } catch (err) {
      updateToast(toastId, {
        tone: "error",
        title: "Scan could not start",
        description: err instanceof Error ? err.message : "Windmill could not be reached.",
        duration: 9000,
        dismissible: true,
      });
    }
  };

  const handleRunClick = (status: string, id: string) => {
    if (status === "Failed") {
      error({
        title: `${id} failed`,
        description: "This run stopped during cross-source verification and needs analyst review.",
        action: { label: "View logs" },
      });
      return;
    }

    info({
      title: `${id} selected`,
      description: "Run details are available in the operational queue and audit trail.",
      action: { label: "Open details", emphasis: "secondary" },
    });
  };

  return (
    <AppShell
      title="Overview"
      subtitle="Operational summary and recent activity across Adopt X"
      actions={<OverviewHeaderActions onStartScan={startScan} />}
    >
      <div className="space-y-5">
        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.72fr)_minmax(0,0.76fr)_minmax(0,1.42fr)]">
          <QueueSummaryCard items={view.queueSummary} />
          {view.topRunCards.map((card) => (
            <OverviewRunStatusCard key={card.title} {...card} />
          ))}
          <SectorDistributionCard items={view.sectorDistribution} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.48fr)] 2xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <NeedsAttentionTable rows={view.needsAttentionRows} />
              <RecentApprovalsTable rows={view.recentApprovals} />
            </div>
            <RecentQueueActivityTable rows={view.recentQueueActivity} />
          </div>

          <div className="space-y-4">
            <OperationalRunsPanel
              activeTab={runsTab}
              onTabChange={setRunsTab}
              onRunClick={handleRunClick}
              rows={view.operationalRuns}
            />
            <OverviewAuditTrailPanel entries={view.auditTrail} />
          </div>
        </section>

        <OverviewFooterBar refreshLabel={view.refreshLabel} />
      </div>
    </AppShell>
  );
}

function buildOverviewView(summary: OverviewSummary | undefined) {
  if (!summary) {
    return {
      queueSummary: fallbackQueueSummary,
      topRunCards: fallbackTopRunCards,
      sectorDistribution: fallbackSectorDistribution,
      needsAttentionRows: fallbackNeedsAttentionRows,
      recentApprovals: fallbackRecentApprovals,
      recentQueueActivity: fallbackRecentQueueActivity,
      operationalRuns: fallbackOperationalRuns,
      auditTrail: fallbackAuditTrail,
      refreshLabel: "Today, 09:12 AM",
    };
  }

  const maxSectorValue = Math.max(...summary.sectorDistribution.map((item) => item.value), 1);

  return {
    queueSummary: summary.queueCounts
      .filter((item) => item.label !== "Brief Failed")
      .map((item) => ({
        label: item.label === "Needs Review" ? "Pending Review" : item.label,
        value: item.value,
        color: statusColors[item.label] ?? "#7FA8FF",
      })),
    topRunCards: [
      {
        title: "Latest Scan",
        status: summary.latestScan?.status ?? "Empty",
        timestamp: summary.latestScan?.timestamp ?? "No scan yet",
        cta: "View Scans",
      },
      {
        title: "Latest Brief Generation",
        status: summary.latestBriefGeneration?.status ?? "Empty",
        timestamp: summary.latestBriefGeneration?.timestamp ?? "No brief run yet",
        cta: "View Briefs",
      },
    ],
    sectorDistribution: summary.sectorDistribution.slice(0, 4).map((item, index) => ({
      label: item.label,
      value: item.value,
      color: sectorColors[index % sectorColors.length],
      width: `${Math.max(16, Math.round((item.value / maxSectorValue) * 100))}%`,
    })),
    needsAttentionRows: summary.needsAttention.map((row) => ({
      id: row.id,
      company: row.company,
      target: row.target,
      logoLetter: row.company.charAt(0),
      logoColor: logoColorFor(row.company),
      issue: row.issue,
      status: row.status,
      age: row.age,
    })),
    recentApprovals: summary.recentApprovals.map((row) => ({
      id: row.id,
      company: row.company,
      target: row.target,
      logoLetter: row.company.charAt(0),
      logoColor: logoColorFor(row.company),
      approvedBy: row.approvedBy,
      time: row.time,
    })),
    recentQueueActivity: summary.recentQueueActivity.map((row) => ({
      ...row,
      status: normalizeQueueStatus(row.status),
    })),
    operationalRuns: summary.operationalRuns,
    auditTrail: summary.auditTrail.map((entry) => ({
      actor: entry.actor,
      initials: entry.initials,
      action: entry.action,
      target: entry.detail,
      detail: "",
      when: entry.when,
      system: entry.actor === "System",
    })),
    refreshLabel: summary.refresh.label,
  };
}

function normalizeQueueStatus(status: string): RecentQueueActivityRow["status"] {
  if (status === "Needs Review") {
    return "Pending Review";
  }
  if (
    status === "Brief Queued" ||
    status === "Brief Ready" ||
    status === "Rejected" ||
    status === "Approved"
  ) {
    return status;
  }
  return "Pending Review";
}

function OverviewHeaderActions({ onStartScan }: { onStartScan: () => void | Promise<void> }) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto lg:gap-3">
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          placeholder="Search company, target, or keyword..."
          className="h-10 w-[292px] rounded-lg border border-hairline bg-surface-1 pl-9 pr-14 text-[12px] placeholder:text-text-muted focus:border-lime/50 focus:outline-none xl:w-[320px]"
        />
        <kbd className="mono absolute right-2 top-1/2 -translate-y-1/2 rounded border border-hairline px-1.5 py-0.5 text-[9.5px] text-text-muted">
          Cmd+K
        </kbd>
      </div>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-surface-1 sm:hidden"
        aria-label="Search"
      >
        <Search className="h-4 w-4 text-text-secondary" />
      </button>
      <ToolbarButton icon={Filter}>Filters</ToolbarButton>
      <PrimaryButton icon={Plus} onClick={onStartScan}>
        New Scan
      </PrimaryButton>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-surface-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        aria-label="More actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}

function logoColorFor(name: string) {
  const colors = ["#D9D2C6", "#FF7A66", "#87A89A", "#F4F6FB", "#5DD7D4", "#8A4BFF"];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function QueueSummaryCard({ items }: { items: QueueSummaryItem[] }) {
  return (
    <Panel className="px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2">
        <div className="text-[10px] text-text-secondary">Queue Summary</div>
        <Info className="h-3.5 w-3.5 text-text-muted" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mono text-[20px] leading-none" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="mt-2 text-[10px] text-text-secondary">{item.label}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function OverviewRunStatusCard({
  title,
  status,
  timestamp,
  cta,
}: {
  title: string;
  status: string;
  timestamp: string;
  cta: string;
}) {
  const style = statusStyles[status] ?? statusStyles.Empty;
  const Icon = style.icon;

  return (
    <Panel className="px-4 py-4 sm:px-5">
      <div className="text-[10px] text-text-secondary">{title}</div>
      <div className="mt-4 flex items-center gap-2 text-[11px] font-medium" style={{ color: style.color }}>
        <Icon className={`h-3.5 w-3.5 ${status === "Running" ? "animate-spin" : ""}`} />
        {status === "Brief Ready" ? "Ready" : status}
      </div>
      <div className="mt-3 text-[11px] text-text-secondary">{timestamp}</div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary transition-colors hover:bg-surface-hover"
        >
          {cta}
        </button>
      </div>
    </Panel>
  );
}

function SectorDistributionCard({ items }: { items: SectorDistributionItem[] }) {
  return (
    <Panel className="px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2">
        <div className="text-[10px] text-text-secondary">Sector Distribution</div>
        <Info className="h-3.5 w-3.5 text-text-muted" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="h-[3px] overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full"
                style={{ width: item.width, background: item.color }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[10.5px]">
              <span className="text-text-secondary">{item.label}</span>
              <span className="mono text-text-primary">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NeedsAttentionTable({ rows }: { rows: NeedsAttentionRow[] }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Needs Attention <span className="text-text-secondary">({rows.length})</span>
        </div>
        <button type="button" className="text-[10.5px] text-info hover:text-lime">
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[520px] w-full text-left text-[10.5px] text-text-secondary">
          <thead className="border-b border-hairline-soft text-[9px] text-text-muted">
            <tr>
              <th className="px-4 py-3 font-normal sm:px-5">Company / Target</th>
              <th className="py-3 pr-4 font-normal">Issue</th>
              <th className="py-3 pr-4 font-normal">Status</th>
              <th className="py-3 pr-4 font-normal">Age</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-hairline-soft">
                <td className="px-4 py-3 sm:px-5">
                  <div className="flex items-start gap-3">
                    <CompanyMark letter={row.logoLetter} color={row.logoColor} size={24} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold leading-tight text-text-primary">
                        {row.company}
                      </div>
                      <div className="mt-0.5 text-[10px] text-text-secondary">{row.target}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="max-w-[190px] text-[10px] leading-relaxed text-text-primary">
                    {row.issue}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {row.status === "Human Edited" ? (
                    <HumanEditedBadge />
                  ) : (
                    <StatusBadge status={row.status} size="xs" />
                  )}
                </td>
                <td className="py-3 pr-4 text-[10px] text-text-secondary">{row.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CompactFooter
        summary="Showing 1 to 5 of 7"
        pages={["1", "2"]}
        align="center"
      />
    </Panel>
  );
}

function RecentApprovalsTable({ rows }: { rows: RecentApprovalRow[] }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Recent Approvals
        </div>
        <button type="button" className="text-[10.5px] text-info hover:text-lime">
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[500px] w-full text-left text-[10.5px] text-text-secondary">
          <thead className="border-b border-hairline-soft text-[9px] text-text-muted">
            <tr>
              <th className="px-4 py-3 font-normal sm:px-5">Company / Target</th>
              <th className="py-3 pr-4 font-normal">Status</th>
              <th className="py-3 pr-4 font-normal">Approved By</th>
              <th className="py-3 pr-4 font-normal">Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-hairline-soft">
                <td className="px-4 py-3 sm:px-5">
                  <div className="flex items-start gap-3">
                    <CompanyMark letter={row.logoLetter} color={row.logoColor} size={24} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold leading-tight text-text-primary">
                        {row.company}
                      </div>
                      <div className="mt-0.5 text-[10px] text-text-secondary">{row.target}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status="Approved" size="xs" />
                </td>
                <td className="py-3 pr-4 text-[10px] text-text-primary">{row.approvedBy}</td>
                <td className="py-3 pr-4 text-[10px] text-text-secondary">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CompactFooter
        summary="Showing 1 to 5 of 18"
        pages={["1", "2", "3", "4"]}
        align="center"
      />
    </Panel>
  );
}

function RecentQueueActivityTable({ rows }: { rows: RecentQueueActivityRow[] }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Recent Queue Activity
        </div>
        <button type="button" className="text-[10.5px] text-info hover:text-lime">
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-[10.5px] text-text-secondary">
          <thead className="border-b border-hairline-soft text-[9px] text-text-muted">
            <tr>
              <th className="px-4 py-3 font-normal sm:px-5">Time</th>
              <th className="py-3 pr-4 font-normal">Company / Target</th>
              <th className="py-3 pr-4 font-normal">Sector</th>
              <th className="py-3 pr-4 font-normal">Deal Type</th>
              <th className="py-3 pr-4 font-normal">Status</th>
              <th className="py-3 pr-4 font-normal">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.company}-${row.time}`} className="border-t border-hairline-soft">
                <td className="px-4 py-3 text-[10px] text-text-secondary sm:px-5">{row.time}</td>
                <td className="py-3 pr-4">
                  <div className="text-[10px] text-text-primary">
                    <span className="font-semibold">{row.company}</span>
                    <span className="text-text-secondary"> / {row.target}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[10px] text-text-secondary">{row.sector}</td>
                <td className="py-3 pr-4 text-[10px] text-text-secondary">{row.dealType}</td>
                <td className="py-3 pr-4">
                  <QueueStatusPill status={row.status} />
                </td>
                <td className="py-3 pr-4 text-[10px] text-text-primary">{row.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CompactFooter
        summary="Showing 1 to 5 of 20"
        pages={["1", "2", "3", "4"]}
        align="center"
      />
    </Panel>
  );
}

function OperationalRunsPanel({
  activeTab,
  onTabChange,
  onRunClick,
  rows,
}: {
  activeTab: "Runs" | "Activity";
  onTabChange: (tab: "Runs" | "Activity") => void;
  onRunClick: (status: string, id: string) => void;
  rows: OperationalRunRow[];
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Operational Runs
        </div>
        <button type="button" className="text-[10.5px] text-info hover:text-lime">
          View all
        </button>
      </div>

      <div className="border-b border-hairline-soft px-4 pt-2 sm:px-5">
        <div className="flex items-center gap-5">
          {(["Runs", "Activity"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`border-b pb-3 text-[10.5px] transition-colors ${
                activeTab === tab
                  ? "border-lime text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Runs" ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-[390px] w-full text-left text-[10px] text-text-secondary">
              <thead className="border-b border-hairline-soft text-[9px] text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-normal sm:px-5">Run ID</th>
                  <th className="py-3 pr-4 font-normal">Type</th>
                  <th className="py-3 pr-4 font-normal">Status</th>
                  <th className="py-3 pr-4 font-normal">Started</th>
                  <th className="py-3 pr-4 font-normal">Duration</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const style = statusStyles[row.status] ?? statusStyles.Empty;
                  const Icon = style.icon;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onRunClick(row.status, row.id)}
                      className="border-t border-hairline-soft cursor-pointer transition-colors hover:bg-surface-hover/30"
                    >
                      <td className="mono px-4 py-4 text-text-primary sm:px-5">{row.id}</td>
                      <td className="py-4 pr-4">{row.type}</td>
                      <td className="py-4 pr-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px]"
                          style={{ color: style.color }}
                        >
                          <Icon className={`h-3.5 w-3.5 ${row.status === "Running" ? "animate-spin" : ""}`} />
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-text-primary">{row.started}</td>
                      <td className="mono py-4 pr-4 text-text-secondary">{row.duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <CompactFooter
            summary="Showing 1 to 5 of 12"
            pages={["1", "2", "3"]}
            align="center"
          />
        </>
      ) : (
        <div className="space-y-3 px-4 py-4 sm:px-5">
          {operationalActivity.map((item) => (
            <div
              key={`${item.label}-${item.when}`}
              className="rounded-lg border border-hairline-soft bg-surface-2/40 px-3 py-2.5"
            >
              <div className="text-[10.5px] font-medium text-text-primary">{item.label}</div>
              <div className="mt-1 flex items-center justify-between gap-3 text-[9.5px] text-text-muted">
                <span className="mono">{item.meta}</span>
                <span className="mono">{item.when}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function OverviewAuditTrailPanel({ entries }: { entries: AuditTrailEntry[] }) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Audit Trail <span className="text-text-secondary">(Recent)</span>
        </div>
        <button type="button" className="text-[10.5px] text-info hover:text-lime">
          View all
        </button>
      </div>
      <div className="space-y-4 px-4 py-4 sm:px-5">
        {entries.map((entry) => (
          <div key={`${entry.actor}-${entry.when}`} className="flex items-start gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                entry.system ? "text-lime" : "text-primary-foreground"
              }`}
              style={
                entry.system
                  ? {
                      background: "rgba(183,241,55,0.10)",
                      borderColor: "rgba(183,241,55,0.35)",
                    }
                  : {
                      background: "linear-gradient(135deg, #4D9DFF, #2DD4BF)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }
              }
            >
              {entry.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] text-text-primary">
                <span className="font-semibold">{entry.actor}</span>{" "}
                <span className="text-text-secondary">{entry.action}</span>
              </div>
              <div className="mt-1 text-[10px] text-text-secondary">{entry.target}</div>
              {entry.detail ? (
                <div className="mt-1 text-[10px] text-text-muted">{entry.detail}</div>
              ) : null}
            </div>
            <div className="mono whitespace-nowrap text-[9.5px] text-text-muted">{entry.when}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function OverviewFooterBar({ refreshLabel }: { refreshLabel: string }) {
  return (
    <Panel className="px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-3 text-[10.5px] text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span>
            Last data refresh: <span className="text-text-primary">{refreshLabel}</span>
          </span>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-text-muted transition-colors hover:border-hairline hover:bg-surface-hover hover:text-text-primary"
            aria-label="Refresh overview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>All times shown in UTC</span>
          <Info className="h-3.5 w-3.5 text-text-muted" />
        </div>
      </div>
    </Panel>
  );
}

function CompactFooter({
  summary,
  pages,
  align,
}: {
  summary: string;
  pages: string[];
  align: "center" | "right";
}) {
  return (
    <div className="border-t border-hairline-soft px-4 py-3 sm:px-5">
      <div
        className={`flex flex-col gap-3 text-[10.5px] text-text-secondary sm:flex-row sm:items-center ${
          align === "right" ? "sm:justify-between" : "sm:justify-between"
        }`}
      >
        <div>{summary}</div>
        <div className="flex items-center gap-1">
          <FooterPageButton>
            <ChevronLeft className="h-3.5 w-3.5" />
          </FooterPageButton>
          {pages.map((page, index) => (
            <FooterPageButton key={page} active={index === 0}>
              {page}
            </FooterPageButton>
          ))}
          <FooterPageButton>
            <ChevronRight className="h-3.5 w-3.5" />
          </FooterPageButton>
        </div>
      </div>
    </div>
  );
}

function FooterPageButton({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-md px-2 text-[10.5px] mono transition-colors ${
        active
          ? "border border-lime/40 bg-lime/[0.10] text-lime"
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function HumanEditedBadge() {
  return (
    <span
      className="inline-flex h-5 items-center gap-1 rounded px-1.5 text-[9px] font-medium"
      style={{
        color: "#B7F137",
        background: "rgba(183,241,55,0.10)",
        border: "1px solid rgba(183,241,55,0.30)",
      }}
    >
      <CheckCircle2 className="h-3 w-3" /> Human Edited
    </span>
  );
}

function QueueStatusPill({
  status,
}: {
  status: "Brief Ready" | "Brief Queued" | "Pending Review" | "Rejected" | "Approved";
}) {
  const color =
    status === "Brief Ready"
      ? "#8EEA45"
      : status === "Brief Queued"
        ? "#F5C243"
        : status === "Pending Review"
          ? "#F5A524"
          : status === "Rejected"
            ? "#FF5E4A"
            : "#7FA8FF";

  return (
    <span className="inline-flex items-center gap-2 text-[10px]" style={{ color }}>
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}
