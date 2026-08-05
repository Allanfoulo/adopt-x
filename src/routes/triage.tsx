import { createFileRoute, Link } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { FunctionReference } from "convex/server";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import {
  AppShell,
  CompanyMark,
  Panel,
  PanelHeader,
  PrimaryButton,
  ScoreBar,
  StatusBadge,
  ToolbarButton,
  statusStyles,
} from "@/components/app-shell";
import { useToast } from "@/components/app-toast";

export const Route = createFileRoute("/triage")({
  head: () => ({ meta: [{ title: "Triage Queue - Adopt X" }] }),
  component: Triage,
});

type QueueStatus =
  | "Brief Ready"
  | "Needs Review"
  | "Approved"
  | "Brief Queued"
  | "Rejected"
  | "Brief Failed"
  | "New"
  | "Normalized"
  | "Scored";

type TriageRow = {
  id: string;
  company: string;
  target: string;
  sector: string;
  geography: string;
  dealType: string;
  aiRole: string;
  confidence: number;
  thesisFit: number;
  sourceConfidence: number;
  published: string;
  status: QueueStatus;
  logoColor: string;
  logoLetter: string;
};

type TriageTab = {
  key: "All" | QueueStatus;
  label: string;
  count: number;
};

type SummaryRunCardData = {
  label: string;
  status: string;
  time: string;
  cta: string;
};

type QueueSummaryItem = {
  label: string;
  value: number;
  color: string;
};

type RunRow = {
  id: string;
  status: string;
  when: string;
};

type OperationalActivity = {
  id: string;
  label: string;
  meta: string;
  when: string;
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

type TriageQueue = {
  tabs: { label: string; value: number }[];
  rows: (Omit<TriageRow, "logoColor" | "logoLetter" | "status"> & {
    status: string;
    candidateId: string;
  })[];
  summaryCards: SummaryRunCardData[];
  queueSummary: { label: string; value: number }[];
  operationalRuns: {
    runs: { scans: RunRow[]; briefs: RunRow[] };
    activity: OperationalActivity[];
  };
  auditTrail: AuditTrailEntry[];
  pagination: { showingStart: number; showingEnd: number; total: number };
};

const getTriageQueue: FunctionReference<"query", "public", { limit?: number }, TriageQueue> =
  makeFunctionReference("triage:getQueue");

const startScanReference: FunctionReference<"action", "public", {}, { jobId: string | null }> =
  makeFunctionReference("scans:start");

type ReviewCandidatesResult = {
  updated: number;
  skipped: number;
};

const reviewCandidates: FunctionReference<
  "mutation",
  "public",
  { externalIds: string[]; action: "approve" | "reject"; reason?: string },
  ReviewCandidatesResult
> = makeFunctionReference("candidate:reviewCandidates");

const fallbackTabCounts: TriageTab[] = [
  { key: "All", label: "All", count: 45 },
  { key: "Needs Review", label: "Pending Review", count: 14 },
  { key: "Brief Queued", label: "Brief Queued", count: 6 },
  { key: "Brief Ready", label: "Brief Ready", count: 5 },
  { key: "Approved", label: "Approved", count: 18 },
  { key: "Rejected", label: "Rejected", count: 2 },
];

const fallbackTriageRows: TriageRow[] = [
  {
    id: "dc_001",
    company: "Purple Group",
    target: "Telescope AI",
    sector: "Fintech",
    geography: "SA / AU",
    dealType: "Acquisition",
    aiRole: "Investment intelligence infrastructure",
    confidence: 92,
    thesisFit: 94,
    sourceConfidence: 95,
    published: "Jul 16, 2026",
    status: "Brief Ready",
    logoColor: "#F5F7FA",
    logoLetter: "P",
  },
  {
    id: "dc_002",
    company: "MediAxis",
    target: "ClinPilot AI",
    sector: "Healthcare",
    geography: "UK",
    dealType: "Strategic Partnership",
    aiRole: "Clinical workflow support",
    confidence: 81,
    thesisFit: 86,
    sourceConfidence: 88,
    published: "Jul 15, 2026",
    status: "Needs Review",
    logoColor: "#D8D1C0",
    logoLetter: "M",
  },
  {
    id: "dc_003",
    company: "InsuraCo",
    target: "ClaimForge AI",
    sector: "Insurance",
    geography: "US",
    dealType: "Strategic Investment",
    aiRole: "Claims automation",
    confidence: 79,
    thesisFit: 83,
    sourceConfidence: 84,
    published: "Jul 14, 2026",
    status: "Approved",
    logoColor: "#FF7A66",
    logoLetter: "I",
  },
  {
    id: "dc_004",
    company: "LexGrid",
    target: "RegAICore",
    sector: "Legal",
    geography: "Australia",
    dealType: "Acquisition",
    aiRole: "Compliance review automation",
    confidence: 77,
    thesisFit: 85,
    sourceConfidence: 82,
    published: "Jul 13, 2026",
    status: "Brief Queued",
    logoColor: "#88A89B",
    logoLetter: "L",
  },
  {
    id: "dc_005",
    company: "SparkPrompt",
    target: "N/A",
    sector: "Marketing Software",
    geography: "US",
    dealType: "Product Launch",
    aiRole: "Generic marketing copilot",
    confidence: 41,
    thesisFit: 22,
    sourceConfidence: 60,
    published: "Jul 12, 2026",
    status: "Rejected",
    logoColor: "#F5F7FA",
    logoLetter: "S",
  },
  {
    id: "dc_006",
    company: "HealthPlus",
    target: "ScribeMed",
    sector: "Healthcare",
    geography: "US",
    dealType: "Acquisition",
    aiRole: "Medical documentation automation",
    confidence: 71,
    thesisFit: 75,
    sourceConfidence: 76,
    published: "Jul 11, 2026",
    status: "Needs Review",
    logoColor: "#9A60E6",
    logoLetter: "H",
  },
  {
    id: "dc_007",
    company: "PayFlow",
    target: "RiskEdge AI",
    sector: "Fintech",
    geography: "US",
    dealType: "Strategic Partnership",
    aiRole: "Fraud detection and risk scoring",
    confidence: 74,
    thesisFit: 80,
    sourceConfidence: 78,
    published: "Jul 11, 2026",
    status: "Needs Review",
    logoColor: "#F5F7FA",
    logoLetter: "S",
  },
  {
    id: "dc_008",
    company: "SureShield",
    target: "UnderwriteAI",
    sector: "Insurance",
    geography: "UK",
    dealType: "Strategic Investment",
    aiRole: "Underwriting decision support",
    confidence: 68,
    thesisFit: 72,
    sourceConfidence: 72,
    published: "Jul 10, 2026",
    status: "Approved",
    logoColor: "#E9E2D7",
    logoLetter: "U",
  },
  {
    id: "dc_009",
    company: "ClauseBase",
    target: "LexNLP",
    sector: "Legal",
    geography: "US",
    dealType: "Strategic Partnership",
    aiRole: "Legal research automation",
    confidence: 66,
    thesisFit: 70,
    sourceConfidence: 70,
    published: "Jul 9, 2026",
    status: "Needs Review",
    logoColor: "#B9BCC3",
    logoLetter: "C",
  },
];

const desktopFilters = [
  "All Sectors",
  "All Geos",
  "All Deal Types",
  "All Statuses",
  "All Source Classes",
];

const fallbackSummaryCards: SummaryRunCardData[] = [
  {
    label: "Latest Scan",
    status: "Completed",
    time: "Today, 08:32 AM",
    cta: "View scans",
  },
  {
    label: "Latest Brief Run",
    status: "Running",
    time: "Started 08:40 AM",
    cta: "View runs",
  },
];

const fallbackQueueSummary: QueueSummaryItem[] = [
  { label: "Pending Review", value: 14, color: "#F5A524" },
  { label: "Brief Queued", value: 6, color: "#FFD248" },
  { label: "Brief Ready", value: 5, color: "#8EEA45" },
  { label: "Rejected", value: 2, color: "#FF5E4A" },
  { label: "Approved", value: 18, color: "#7FA8FF" },
];

const fallbackOperationalRuns: {
  runs: { scans: RunRow[]; briefs: RunRow[] };
  activity: OperationalActivity[];
} = {
  runs: {
    scans: [
      { id: "scan_001", status: "Completed", when: "08:32 AM" },
      { id: "scan_000", status: "Completed", when: "Yesterday" },
      { id: "scan_099", status: "Failed", when: "Jul 14" },
    ],
    briefs: [
      { id: "br_045", status: "Running", when: "08:40 AM" },
      { id: "br_044", status: "Completed", when: "Jul 16" },
      { id: "br_043", status: "Failed", when: "Jul 16" },
      { id: "br_042", status: "Completed", when: "Jul 15" },
    ],
  },
  activity: [
    { id: "evt_012", label: "Candidate synced", meta: "scan_001", when: "09:12 AM" },
    { id: "evt_011", label: "Publisher check passed", meta: "dc_002", when: "08:58 AM" },
    { id: "evt_010", label: "Brief run queued", meta: "br_045", when: "08:40 AM" },
  ],
};

const fallbackAuditTrail: AuditTrailEntry[] = [
  {
    actor: "Maya Patel",
    initials: "MP",
    action: "edited AI Role",
    target: "MediAxis / ClinPilot AI (dc_002)",
    detail: '"Clinical workflow support"',
    when: "10 min ago",
  },
  {
    actor: "Maya Patel",
    initials: "MP",
    action: "approved candidate",
    target: "InsuraCo / ClaimForge AI (dc_003)",
    detail: '"High confidence, clean provenance"',
    when: "25 min ago",
  },
  {
    actor: "Jordan Smith",
    initials: "JS",
    action: "edited Deal Type",
    target: "LexGrid / RegAICore (dc_004)",
    detail: '"Partnership" -> "Acquisition"',
    when: "35 min ago",
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
    action: "scan_001 completed",
    target: "45 candidates created",
    detail: "Today, 08:32 AM",
    when: "Today, 08:32 AM",
    system: true,
  },
];

const queueSummaryColors: Record<string, string> = {
  "Needs Review": "#F5A524",
  "Brief Queued": "#FFD248",
  "Brief Ready": "#8EEA45",
  Rejected: "#FF5E4A",
  Approved: "#7FA8FF",
  "Brief Failed": "#FF5E4A",
};

function buildTriageView(queue: TriageQueue | undefined) {
  if (!queue || queue.rows.length === 0) {
    return {
      tabs: fallbackTabCounts,
      rows: fallbackTriageRows,
      summaryCards: fallbackSummaryCards,
      queueSummary: fallbackQueueSummary,
      operationalRuns: fallbackOperationalRuns,
      auditTrail: fallbackAuditTrail,
      pagination: { showingStart: 1, showingEnd: 10, total: 45 },
    };
  }

  const queueSummary = queue.queueSummary.map((item) => ({
    label: displayQueueLabel(item.label),
    value: item.value,
    color: queueSummaryColors[item.label] ?? "#A9B4BE",
  }));
  const total = queueSummary.reduce((sum, item) => sum + item.value, 0);
  const tabs: TriageTab[] = [
    { key: "All", label: "All", count: total },
    ...queue.queueSummary
      .filter((item) => ["Needs Review", "Brief Queued", "Brief Ready", "Approved", "Rejected"].includes(item.label))
      .map((item) => ({
        key: item.label as QueueStatus,
        label: displayQueueLabel(item.label),
        count: item.value,
      })),
  ];

  return {
    tabs,
    rows: queue.rows.map((row) => ({
      id: row.id,
      company: row.company,
      target: row.target,
      sector: row.sector,
      geography: row.geography,
      dealType: row.dealType,
      aiRole: row.aiRole,
      confidence: row.confidence,
      thesisFit: row.thesisFit,
      sourceConfidence: row.sourceConfidence,
      published: row.published,
      status: row.status as QueueStatus,
      logoColor: logoColorFor(row.company),
      logoLetter: row.company.charAt(0).toUpperCase(),
    })),
    summaryCards: queue.summaryCards,
    queueSummary,
    operationalRuns: queue.operationalRuns,
    auditTrail: queue.auditTrail,
    pagination: queue.pagination,
  };
}

function displayQueueLabel(label: string) {
  return label === "Needs Review" ? "Pending Review" : label;
}

function logoColorFor(name: string) {
  const colors = ["#D9D2C6", "#FF7A66", "#87A89A", "#F4F6FB", "#5DD7D4", "#8A4BFF"];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function Triage() {
  const { success, warning, error, info, loading, updateToast } = useToast();
  const queue = useQuery(getTriageQueue, {});
  const reviewSelectedCandidates = useMutation(reviewCandidates);
  const startScanAction = useAction(startScanReference);
  const view = buildTriageView(queue);
  const [activeTab, setActiveTab] = useState<TriageTab["key"]>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set(["dc_002", "dc_004"]));
  const [focusedRowId, setFocusedRowId] = useState("dc_002");
  const [railTab, setRailTab] = useState<"Runs" | "Activity">("Runs");
  const [isReviewing, setIsReviewing] = useState(false);

  const visibleRows = useMemo(() => {
    if (activeTab === "All") return view.rows;
    return view.rows.filter((row) => row.status === activeTab);
  }, [activeTab, view.rows]);

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((row) => selected.has(row.id));

  const selectedCount = selected.size;

  const toggleRow = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        visibleRows.forEach((row) => next.delete(row.id));
      } else {
        visibleRows.forEach((row) => next.add(row.id));
      }
      return next;
    });
  };

  const withSelectionGuard = (callback: () => void) => {
    if (selectedCount === 0) {
      warning({
        title: "No candidates selected",
        description: "Select at least one candidate row before running a queue action.",
      });
      return;
    }

    callback();
  };

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

  const approveSelected = () =>
    withSelectionGuard(() => {
      void runBulkReviewAction("approve");
    });

  const rejectSelected = () =>
    withSelectionGuard(() => {
      void runBulkReviewAction("reject");
    });

  const runBulkReviewAction = async (action: "approve" | "reject") => {
    if (isReviewing) {
      return;
    }

    const selectedIds = [...selected];
    setIsReviewing(true);
    try {
      const result = await reviewSelectedCandidates({
        externalIds: selectedIds,
        action,
        reason:
          action === "approve"
            ? "Approved from triage queue bulk action."
            : "Rejected from triage queue bulk action.",
      });
      if (result.updated === 0) {
        warning({
          title: "No candidates updated",
          description: "The selected rows could not be found in the current data set.",
        });
        return;
      }

      setSelected(new Set());
      const skippedLabel =
        result.skipped > 0 ? ` ${result.skipped} selected demo row${result.skipped === 1 ? " was" : "s were"} skipped.` : "";
      if (action === "approve") {
        success({
          title: `${result.updated} candidate${result.updated === 1 ? "" : "s"} approved`,
          description: `Moved into the approved lane.${skippedLabel}`,
          action: { label: "Undo", emphasis: "secondary" },
        });
      } else {
        warning({
          title: `${result.updated} candidate${result.updated === 1 ? "" : "s"} rejected`,
          description: `Removed from the active thesis-fit queue.${skippedLabel}`,
          action: { label: "Review reasons", emphasis: "secondary" },
        });
      }
    } catch (err) {
      error({
        title: "Bulk review failed",
        description: err instanceof Error ? err.message : "Unable to update selected candidates.",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const queueBriefs = () =>
    withSelectionGuard(() => {
      const toastId = loading({
        title: `Queueing ${selectedCount} brief${selectedCount === 1 ? "" : "s"}`,
        description: "Preparing approved candidates for synthesis and provenance packaging.",
      });

      window.setTimeout(() => {
        updateToast(toastId, {
          tone: "info",
          title: "Brief generation queued",
          description: `${selectedCount} candidate${selectedCount === 1 ? "" : "s"} added to br_045 for analyst review.`,
          action: { label: "Open run" },
          duration: 5200,
          dismissible: true,
        });
      }, 1200);
    });

  const handleRunClick = (id: string, status: string) => {
    if (status === "Failed") {
      error({
        title: `${id} failed`,
        description: "Cross-source ingest timed out during publisher reputation validation.",
        action: { label: "View logs" },
      });
      return;
    }

    info({
      title: `${id} selected`,
      description:
        status === "Running"
          ? "This run is still processing and will post results into the queue automatically."
          : "This run completed successfully and remains available for audit review.",
      action: { label: "Open details", emphasis: "secondary" },
    });
  };

  return (
    <AppShell
      title="Triage Queue"
      subtitle="Review and action AI adoption deal candidates"
      actions={<TriageHeaderActions onStartScan={startScan} />}
    >
      <div className="space-y-5">
        <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.9fr)]">
          {view.summaryCards.map((card) => (
            <SummaryRunCard key={card.label} {...card} />
          ))}
          <QueueSummaryCard items={view.queueSummary} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_288px] 2xl:grid-cols-[minmax(0,1fr)_304px]">
          <Panel className="overflow-hidden">
            <div className="border-b border-hairline-soft px-4 pt-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-5">
                {view.tabs.map((tab) => {
                  const isActive = tab.key === activeTab;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`border-b pb-3 text-[11px] transition-colors ${
                        isActive
                          ? "border-lime text-text-primary"
                          : "border-transparent text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span className="font-medium">{tab.label}</span>
                      <span className="mono ml-1.5 text-text-muted">({tab.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-b border-hairline-soft px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <SearchField />
                {desktopFilters.map((label) => (
                  <FilterButton key={label} label={label} />
                ))}
                <FilterButton label="More" compact />
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-md border border-hairline bg-surface-1 px-4 text-[10.5px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="border-b border-hairline-soft px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary"
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded border ${
                        selectedCount > 0 ? "border-lime bg-lime/15" : "border-hairline"
                      } flex items-center justify-center`}
                    >
                      {selectedCount > 0 && <Check className="h-2.5 w-2.5 text-lime" />}
                    </span>
                    <span className="mono">{selectedCount}</span> selected
                  </button>
                  <BulkActionButton label="Approve" accent="success" onClick={approveSelected} />
                  <BulkActionButton label="Reject" accent="danger" onClick={rejectSelected} />
                  <BulkActionButton label="Queue Brief" accent="lime" onClick={queueBriefs} />
                  <BulkActionButton label="More" chevron emphasis="neutral" />
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  Sort: <span className="text-text-primary">Published Date</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1140px] w-full text-left text-[10.5px] text-text-secondary">
                <thead className="mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
                  <tr>
                    <th className="w-11 px-4 py-3 sm:px-5">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        className="accent-lime"
                        aria-label="Select all visible candidates"
                      />
                    </th>
                    <th className="py-3 pr-3 font-normal">Company / Target</th>
                    <th className="py-3 pr-3 font-normal">Sector</th>
                    <th className="py-3 pr-3 font-normal">Geography</th>
                    <th className="py-3 pr-3 font-normal">Deal Type</th>
                    <th className="py-3 pr-3 font-normal">AI Role</th>
                    <th className="py-3 pr-3 font-normal">
                      <ScoreHeader label="Conf." />
                    </th>
                    <th className="py-3 pr-3 font-normal">
                      <ScoreHeader label="Thesis Fit" />
                    </th>
                    <th className="py-3 pr-3 font-normal">
                      <ScoreHeader label="Source Conf." />
                    </th>
                    <th className="py-3 pr-3 font-normal">Published</th>
                    <th className="py-3 pr-3 font-normal">Status</th>
                    <th className="w-10 py-3 pr-4 font-normal sm:pr-5" />
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => {
                    const isSelected = selected.has(row.id);
                    const isFocused = row.id === focusedRowId;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setFocusedRowId(row.id)}
                        className={`border-t border-hairline-soft align-top transition-colors ${
                          isSelected ? "bg-lime/[0.03]" : "hover:bg-surface-hover/30"
                        } ${isFocused ? "shadow-[inset_0_0_0_1px_rgba(183,241,55,0.35)]" : ""}`}
                      >
                        <td className="px-4 py-3 sm:px-5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            className="accent-lime"
                            aria-label={`Select ${row.company}`}
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-start gap-3">
                            <CompanyMark
                              letter={row.logoLetter}
                              color={row.logoColor}
                              size={24}
                            />
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold leading-tight text-text-primary">
                                {row.company}
                              </div>
                              <div className="mt-0.5 text-[10px] leading-tight text-text-secondary">
                                {row.target}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <SectorChip sector={row.sector} />
                        </td>
                        <td className="py-3 pr-3 text-[10px] text-text-primary">{row.geography}</td>
                        <td className="py-3 pr-3 text-[10px] text-text-primary">{row.dealType}</td>
                        <td className="py-3 pr-3">
                          <div className="max-w-[220px] text-[10px] leading-relaxed text-text-primary">
                            {row.aiRole}
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <ScoreBar value={row.confidence} />
                        </td>
                        <td className="py-3 pr-3">
                          <ScoreBar value={row.thesisFit} />
                        </td>
                        <td className="py-3 pr-3">
                          <ScoreBar value={row.sourceConfidence} />
                        </td>
                        <td className="py-3 pr-3">
                          <span className="text-[10px] text-text-primary">{row.published}</span>
                        </td>
                        <td className="py-3 pr-3">
                          <StatusBadge status={row.status} size="xs" />
                        </td>
                        <td className="py-3 pr-4 sm:pr-5">
                          <Link
                            to="/candidate"
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-text-muted transition-colors hover:border-hairline hover:bg-surface-2 hover:text-text-primary"
                            aria-label={`Open ${row.company}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-hairline-soft px-4 py-3 sm:px-5">
              <div className="grid gap-3 text-[10.5px] text-text-secondary lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                <div>
                  Showing{" "}
                  <span className="mono text-text-primary">
                    {view.pagination.showingStart} to {view.pagination.showingEnd}
                  </span>{" "}
                  of <span className="mono text-text-primary">{view.pagination.total}</span>{" "}
                  results
                </div>
                <div className="flex items-center justify-start gap-1 lg:justify-center">
                  <PageButton>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </PageButton>
                  <PageButton active>1</PageButton>
                  <PageButton>2</PageButton>
                  <PageButton>3</PageButton>
                  <PageButton>4</PageButton>
                  <PageButton>5</PageButton>
                  <PageButton>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </PageButton>
                </div>
                <div className="flex items-center justify-start gap-2 lg:justify-end">
                  <span>Rows per page</span>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary"
                  >
                    <span className="mono">10</span>
                    <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <div className="border-b border-hairline-soft px-4 pb-3 pt-4 sm:px-5">
                <div className="text-[12px] font-semibold tracking-tight text-text-primary">
                  Operational Panel
                </div>
                <div className="mt-3 flex items-center gap-5 text-[10.5px] text-text-secondary">
                  {(["Runs", "Activity"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setRailTab(tab)}
                      className={`border-b pb-2 transition-colors ${
                        railTab === tab
                          ? "border-lime text-text-primary"
                          : "border-transparent hover:text-text-primary"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {railTab === "Runs" ? (
                <div className="space-y-5 px-4 py-4 sm:px-5">
                  <RunSection
                    title="Scan Runs"
                    rows={view.operationalRuns.runs.scans}
                    onRowClick={handleRunClick}
                  />
                  <RunSection
                    title="Brief Runs"
                    rows={view.operationalRuns.runs.briefs}
                    onRowClick={handleRunClick}
                  />
                </div>
              ) : (
                <div className="space-y-3 px-4 py-4 sm:px-5">
                  {view.operationalRuns.activity.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-hairline-soft bg-surface-2/40 px-3 py-2.5"
                    >
                      <div className="text-[10.5px] font-medium text-text-primary">
                        {event.label}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3 text-[9.5px] text-text-muted">
                        <span className="mono">{event.meta}</span>
                        <span className="mono">{event.when}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <PanelHeader
                title="Audit Trail"
                action={<span className="text-[10.5px] hover:text-lime cursor-pointer">View all</span>}
              />
              <div className="px-4 pb-4 sm:px-5">
                <div className="space-y-0">
                  {view.auditTrail.map((entry, index) => (
                    <AuditItem
                      key={`${entry.actor}-${entry.when}`}
                      entry={entry}
                      isLast={index === view.auditTrail.length - 1}
                    />
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function TriageHeaderActions({ onStartScan }: { onStartScan: () => void | Promise<void> }) {
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
    </div>
  );
}

function SummaryRunCard({
  label,
  status,
  time,
  cta,
}: {
  label: string;
  status: string;
  time: string;
  cta: string;
}) {
  const style = statusStyles[status] ?? statusStyles.Empty;
  const Icon = style.icon;

  return (
    <Panel className="px-4 py-4 sm:px-5">
      <div className="text-[10px] text-text-secondary">{label}</div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: style.color }}>
            <Icon className={`h-3.5 w-3.5 ${status === "Running" ? "animate-spin" : ""}`} />
            {status}
          </div>
          <div className="mt-2 text-[11px] text-text-secondary">{time}</div>
        </div>
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

function QueueSummaryCard({ items }: { items: QueueSummaryItem[] }) {
  return (
    <Panel className="px-4 py-4 sm:px-5">
      <div className="text-[10px] text-text-secondary">Queue Summary</div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
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

function SearchField() {
  return (
    <div className="relative min-w-[220px] flex-1 xl:max-w-[170px]">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
      <input
        placeholder="Search table..."
        className="h-9 w-full rounded-md border border-hairline bg-surface-1 pl-9 pr-3 text-[10.5px] placeholder:text-text-muted focus:border-lime/50 focus:outline-none"
      />
    </div>
  );
}

function FilterButton({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center justify-between rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary transition-colors hover:bg-surface-hover ${
        compact ? "min-w-[78px]" : "min-w-[108px]"
      }`}
    >
      <span className="truncate">{label}</span>
      <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 text-text-muted" />
    </button>
  );
}

function BulkActionButton({
  label,
  accent = "neutral",
  chevron = false,
  emphasis = "filled",
  onClick,
}: {
  label: string;
  accent?: "neutral" | "lime" | "success" | "danger";
  chevron?: boolean;
  emphasis?: "filled" | "neutral";
  onClick?: () => void;
}) {
  const palette =
    accent === "lime"
      ? "border-lime/40 bg-lime/[0.10] text-lime hover:bg-lime/[0.16]"
      : accent === "success"
        ? "border-success/35 bg-success/[0.08] text-success hover:bg-success/[0.15]"
        : accent === "danger"
          ? "border-danger/35 bg-danger/[0.08] text-danger hover:bg-danger/[0.15]"
          : emphasis === "neutral"
            ? "border-hairline bg-surface-1 text-text-primary hover:bg-surface-hover"
            : "border-hairline bg-surface-1 text-text-primary hover:bg-surface-hover";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[10.5px] font-medium transition-colors ${palette}`}
    >
      {label}
      {chevron && <ChevronDown className="h-3.5 w-3.5" />}
    </button>
  );
}

function ScoreHeader({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Info className="h-3 w-3 opacity-70" />
    </span>
  );
}

function SectorChip({ sector }: { sector: string }) {
  const palette =
    sector === "Fintech"
      ? { color: "#8AA4FF", bg: "rgba(77,157,255,0.14)", border: "rgba(77,157,255,0.26)" }
      : sector === "Healthcare"
        ? { color: "#C6A4FF", bg: "rgba(139,92,246,0.14)", border: "rgba(139,92,246,0.26)" }
        : sector === "Insurance"
          ? { color: "#F5A524", bg: "rgba(245,165,36,0.14)", border: "rgba(245,165,36,0.26)" }
          : sector === "Legal"
            ? { color: "#2DD4BF", bg: "rgba(45,212,191,0.14)", border: "rgba(45,212,191,0.26)" }
            : { color: "#A9B4BE", bg: "rgba(169,180,190,0.10)", border: "rgba(169,180,190,0.22)" };

  return (
    <span
      className="inline-flex rounded-md border px-2 py-1 text-[9.5px] leading-none"
      style={{ color: palette.color, background: palette.bg, borderColor: palette.border }}
    >
      {sector}
    </span>
  );
}

function PageButton({
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

function RunSection({
  title,
  rows,
  onRowClick,
}: {
  title: string;
  rows: readonly { id: string; status: string; when: string }[];
  onRowClick: (id: string, status: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-medium text-text-primary">{title}</div>
        <button type="button" className="text-[10px] text-info hover:text-lime">
          View all
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const style = statusStyles[row.status] ?? statusStyles.Empty;
          const Icon = style.icon;

          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onRowClick(row.id, row.status)}
              className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-surface-hover/35"
            >
              <span className="mono min-w-0 flex-1 truncate text-[10.5px] text-text-secondary">
                {row.id}
              </span>
              <span
                className="inline-flex min-w-[74px] items-center gap-1 text-[10px]"
                style={{ color: style.color }}
              >
                <Icon className={`h-3.5 w-3.5 ${row.status === "Running" ? "animate-spin" : ""}`} />
                {row.status}
              </span>
              <span className="mono shrink-0 text-[10px] text-text-muted">{row.when}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AuditItem({
  entry,
  isLast,
}: {
  entry: AuditTrailEntry;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-4">
      <div className="relative flex w-8 shrink-0 justify-center">
        {!isLast && (
          <span className="absolute top-8 bottom-0 w-px bg-hairline-soft" aria-hidden="true" />
        )}
        <div
          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-semibold ${
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
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10.5px] font-semibold text-text-primary">{entry.actor}</span>{" "}
            <span className="text-[10.5px] text-text-secondary">{entry.action}</span>
          </div>
          <span className="mono whitespace-nowrap text-[9.5px] text-text-muted">{entry.when}</span>
        </div>
        <div className="mt-1 text-[10px] text-text-secondary">{entry.target}</div>
        <div className="mt-1 text-[10px] text-text-muted">{entry.detail}</div>
      </div>
    </div>
  );
}
