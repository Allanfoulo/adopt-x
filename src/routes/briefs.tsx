import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { FunctionReference } from "convex/server";
import { useEffect, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  Filter,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  AppShell,
  CompanyMark,
  Panel,
  PrimaryButton,
  StatusBadge,
  ToolbarButton,
  statusStyles,
} from "@/components/app-shell";
import { useToast } from "@/components/app-toast";

export const Route = createFileRoute("/briefs")({
  head: () => ({ meta: [{ title: "Brief Archive - Adopt X" }] }),
  component: BriefArchive,
});

type ArchiveStatus = "Approved" | "Generated" | "Draft" | "Archived";

type ArchiveRow = {
  id: string;
  company: string;
  target: string;
  logoLetter: string;
  logoColor: string;
  sector: string;
  geography: string;
  approvedDate: string;
  approvedTime: string;
  dealType: string;
  takeaway: string;
  version: string;
  status: ArchiveStatus;
};

type ArchiveTabKey = "All Briefs" | "Approved" | "Generated" | "Draft" | "Archived";

type BriefRunRow = {
  id: string;
  status: string;
  when: string;
  total: number;
  completed: number;
  failed: number;
  remaining: number;
  progress: number;
  error: string | null;
};

type ArchiveDetail = {
  id: string;
  brief: {
    executiveSummary: string;
    transactionOverview: string;
    strategicRationale: string;
    risks: string[];
    marketImplications: string;
    keyTakeaways: string[];
    evidenceUsed: string[];
    dealStructure: string;
    confidenceScore: number | null;
    last30daysUsed: boolean;
    version: string;
    status: string;
    updatedAt: number;
  };
  candidate: {
    company: string;
    target: string;
    sector: string;
    geography: string;
    dealType: string;
    aiRole: string;
    announcementDate: string;
  };
  transaction: { label: string; value: string }[];
  sources: { headline: string; publisher: string; date: string; type: string; url: string }[];
  auditTrail: {
    actor: string;
    initials: string;
    action: string;
    detail: string;
    when: string;
    system: boolean;
  }[];
  metadata: { label: string; value: string }[];
};

const getArchiveReference: FunctionReference<"query", "public", { limit?: number }, ArchiveRow[]> =
  makeFunctionReference("briefs:getArchive");

const getBriefRunsReference: FunctionReference<"query", "public", { limit?: number }, BriefRunRow[]> =
  makeFunctionReference("briefs:getRuns");

const getArchiveDetailReference: FunctionReference<
  "query",
  "public",
  { externalId: string },
  ArchiveDetail | null
> = makeFunctionReference("briefs:getArchiveDetail");

const emptyArchiveRows: ArchiveRow[] = [];

const archiveRows: ArchiveRow[] = [
  {
    id: "brief_048",
    company: "Purple Group",
    target: "Telescope AI",
    logoLetter: "P",
    logoColor: "#F4F6FB",
    sector: "Fintech",
    geography: "SA / AU",
    approvedDate: "Jul 16, 2026",
    approvedTime: "08:32 AM",
    dealType: "Acquisition",
    takeaway: "Expands AI-native investment intel footprint in APAC with strong product-market fit.",
    version: "v2.1",
    status: "Approved",
  },
  {
    id: "brief_047",
    company: "InsuraCo",
    target: "ClaimForge AI",
    logoLetter: "I",
    logoColor: "#FF7A66",
    sector: "Insurance",
    geography: "US",
    approvedDate: "Jul 14, 2026",
    approvedTime: "08:40 AM",
    dealType: "Strategic Investment",
    takeaway: "Accelerates claims automation roadmap and differentiated model capabilities.",
    version: "v1.3",
    status: "Approved",
  },
  {
    id: "brief_046",
    company: "LexGrid",
    target: "RegAICore",
    logoLetter: "L",
    logoColor: "#87A89A",
    sector: "Legal",
    geography: "Australia",
    approvedDate: "Jul 13, 2026",
    approvedTime: "10:25 AM",
    dealType: "Acquisition",
    takeaway: "Strengthens compliance automation position in AU market.",
    version: "v1.2",
    status: "Approved",
  },
  {
    id: "brief_045",
    company: "MediAxis",
    target: "ClinPilot AI",
    logoLetter: "M",
    logoColor: "#D8D1C0",
    sector: "Healthcare",
    geography: "UK",
    approvedDate: "Jul 15, 2026",
    approvedTime: "09:10 AM",
    dealType: "Strategic Partnership",
    takeaway: "Streamlines clinical workflow support with embedded AI copilot.",
    version: "v1.1",
    status: "Approved",
  },
];

const sectionNav = [
  { label: "Executive Summary" },
  { label: "Transaction Overview" },
  { label: "Strategic Rationale" },
  { label: "Risks & Mitigations" },
  { label: "Market Implications" },
  { label: "Key Takeaways" },
  { label: "Sources & Inputs", count: 14 },
  { label: "Revision History", count: 4 },
] satisfies readonly { label: string; count?: number }[];

const summarySignals = [
  {
    title: "Strategic Fit",
    copy: "Adjacent to core platform with high capability and go-to-market synergies.",
    icon: Target,
  },
  {
    title: "Deal Attractiveness",
    copy: "Reasonable valuation multiples relative to growth and margin profile.",
    icon: Sparkles,
  },
  {
    title: "Market Opportunity",
    copy: "Addresses growing demand for real-time, AI-driven investment intelligence in APAC.",
    icon: TrendingUp,
  },
  {
    title: "Execution Readiness",
    copy: "Low integration risk, strong cultural and operational alignment.",
    icon: ShieldCheck,
  },
  {
    title: "Value Creation",
    copy: "Revenue acceleration, cross-sell potential, and margin expansion opportunities.",
    icon: Globe,
  },
  {
    title: "Overall Assessment",
    copy: "High strategic and financial fit with compelling long-term upside.",
    icon: CheckCircle2,
  },
] as const;

const transactionOverview = [
  { label: "Deal Type", value: "Acquisition" },
  { label: "Structure", value: "Cash" },
  { label: "Enterprise Value", value: "$120M" },
  { label: "Announced", value: "Jul 16, 2026" },
  { label: "Target HQ", value: "Sydney, Australia" },
  { label: "Employees", value: "~120" },
  { label: "Revenue (LTM)", value: "$18.4M" },
  { label: "EBITDA Margin", value: "22%" },
  { label: "Customer Base", value: "120+ enterprise clients" },
  { label: "Expected Close", value: "Q4 2026" },
] as const;

const sourceSnapshot = [
  { label: "Company Press Release", date: "Jul 16, 2026" },
  { label: "PitchBook", date: "Jul 16, 2026" },
  { label: "LinkedIn Company Page", date: "Jul 16, 2026" },
] as const;

const recentBriefRuns = [
  { company: "Purple Group / Telescope AI", version: "v2.1", status: "Approved", when: "08:32 AM" },
  { company: "Purple Group / Telescope AI", version: "v2.0", status: "Generated", when: "Jul 16" },
  { company: "InsuraCo / ClaimForge AI", version: "v1.3", status: "Approved", when: "Jul 14" },
  { company: "LexGrid / RegAICore", version: "v1.2", status: "Approved", when: "Jul 13" },
  { company: "MediAxis / ClinPilot AI", version: "v1.1", status: "Approved", when: "Jul 15" },
] as const;

const auditTrail = [
  {
    actor: "Maya Patel",
    initials: "MP",
    action: "approved brief v2.1",
    detail: "Added executive summary and updated market implications.",
    when: "08:32 AM",
  },
  {
    actor: "Maya Patel",
    initials: "MP",
    action: "generated brief v2.0",
    detail: "Regenerated with updated financials and source set.",
    when: "Yesterday",
  },
  {
    actor: "Jordan Smith",
    initials: "JS",
    action: "edited brief v1.3",
    detail: "Updated transaction overview and strategic rationale.",
    when: "Jul 14",
  },
  {
    actor: "System",
    initials: "SX",
    action: "auto-generated brief v1.2",
    detail: "Source refresh and model run.",
    when: "Jul 13",
    system: true,
  },
  {
    actor: "Maya Patel",
    initials: "MP",
    action: "approved brief v1.1",
    detail: "Initial approved version.",
    when: "Jul 15",
  },
] satisfies readonly {
  actor: string;
  initials: string;
  action: string;
  detail: string;
  when: string;
  system?: boolean;
}[];

const briefMetadata = [
  { label: "Owner", value: "Maya Patel" },
  { label: "Team", value: "Strategy & M&A" },
  { label: "Tags", value: "APAC, Fintech, AI, Investment Intel" },
  { label: "Visibility", value: "Internal" },
  { label: "Last Updated", value: "Jul 16, 2026, 08:32 AM" },
] as const;

function BriefArchive() {
  const { loading, updateToast, info, success } = useToast();
  const archive = useQuery(getArchiveReference, { limit: 100 });
  const briefRuns = useQuery(getBriefRunsReference, { limit: 20 });
  const archiveRows = archive ?? emptyArchiveRows;
  const archiveTabs = getArchiveTabs(archiveRows);
  const [activeTab, setActiveTab] = useState<ArchiveTabKey>("All Briefs");
  const [selectedBriefId, setSelectedBriefId] = useState("");
  const [activeSection, setActiveSection] = useState("Executive Summary");

  useEffect(() => {
    if (archiveRows.length > 0 && !archiveRows.some((row) => row.id === selectedBriefId)) {
      setSelectedBriefId(archiveRows[0].id);
    }
  }, [archiveRows, selectedBriefId]);

  const selectedBrief =
    archiveRows.find((row) => row.id === selectedBriefId) ?? archiveRows[0];
  const selectedDetail = useQuery(
    getArchiveDetailReference,
    selectedBrief ? { externalId: selectedBrief.id } : "skip",
  );
  const visibleArchiveRows =
    activeTab === "All Briefs" ? archiveRows : archiveRows.filter((row) => row.status === activeTab);

  const startBriefGeneration = () => {
    const toastId = loading({
      title: "Brief generation started",
      description: "Compiling verified source evidence and analyst framing for the selected archive set.",
      action: { label: "Dismiss", emphasis: "secondary" },
    });

    window.setTimeout(() => {
      updateToast(toastId, {
        tone: "success",
        title: "Brief run queued",
        description: "A new archive-ready brief was added to the latest run pipeline.",
        action: { label: "View runs" },
        duration: 4800,
        dismissible: true,
      });
    }, 1400);
  };

  const handleDownload = () => {
    success({
      title: "Brief package prepared",
      description: `${selectedBrief.company} / ${selectedBrief.target} is ready for export.`,
      action: { label: "Open files", emphasis: "secondary" },
    });
  };

  const handleShare = () => {
    info({
      title: "Share link copied",
      description: "Internal archive access was copied with the current selected brief context.",
      action: { label: "Manage access", emphasis: "secondary" },
    });
  };

  const handleSourceView = () => {
    info({
      title: "Source set opened",
      description: "Opening the full provenance bundle for the selected brief.",
      action: { label: "View all sources", emphasis: "secondary" },
    });
  };

  return (
    <AppShell
      title="Brief Archive"
      subtitle="Search, review, and manage generated and approved briefs"
      actions={<BriefArchiveHeaderActions onGenerate={startBriefGeneration} />}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_276px] 2xl:grid-cols-[minmax(0,1fr)_292px]">
        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <BriefArchiveTabs tabs={archiveTabs} activeTab={activeTab} onChange={setActiveTab} />
            <BriefArchiveFilters />
            {archive === undefined ? (
              <ArchiveState message="Loading generated briefs..." />
            ) : archiveRows.length === 0 ? (
              <ArchiveState message="No briefs have been generated yet. Queue a brief from Triage Queue to see it here." />
            ) : visibleArchiveRows.length === 0 ? (
              <ArchiveState message={`No ${activeTab.toLowerCase()} briefs yet.`} />
            ) : (
              <>
                <BriefArchiveTable
                  rows={visibleArchiveRows}
                  selectedBriefId={selectedBriefId}
                  onSelect={setSelectedBriefId}
                />
                <BriefArchiveTableFooter total={visibleArchiveRows.length} />
              </>
            )}
          </Panel>

          {selectedBrief ? (
            <SelectedBriefWorkspace
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              selectedBrief={selectedBrief}
              detail={selectedDetail}
              onDownload={handleDownload}
              onShare={handleShare}
              onViewSources={handleSourceView}
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <RecentBriefRunsPanel rows={briefRuns ?? []} loading={briefRuns === undefined} />
          <BriefArchiveAuditTrailPanel detail={selectedDetail} />
          <BriefMetadataPanel detail={selectedDetail} />
        </div>
      </div>
    </AppShell>
  );
}

function getArchiveTabs(rows: readonly ArchiveRow[]) {
  const labels: readonly ArchiveTabKey[] = ["All Briefs", "Approved", "Generated", "Draft", "Archived"];
  return labels.map((key) => ({
    key,
    label: key,
    count: key === "All Briefs" ? rows.length : rows.filter((row) => row.status === key).length,
  }));
}

function ArchiveState({ message }: { message: string }) {
  return <div className="px-5 py-12 text-center text-[11px] text-text-secondary">{message}</div>;
}

function BriefArchiveHeaderActions({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto lg:gap-3">
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          placeholder="Search briefs by company, target, or keyword..."
          className="h-10 w-[314px] rounded-lg border border-hairline bg-surface-1 pl-9 pr-14 text-[12px] placeholder:text-text-muted focus:border-lime/50 focus:outline-none xl:w-[366px]"
        />
        <kbd className="mono absolute right-2 top-1/2 -translate-y-1/2 rounded border border-hairline px-1.5 py-0.5 text-[9.5px] text-text-muted">
          Cmd+K
        </kbd>
      </div>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-surface-1 sm:hidden"
        aria-label="Search briefs"
      >
        <Search className="h-4 w-4 text-text-secondary" />
      </button>
      <ToolbarButton icon={Filter}>Filters</ToolbarButton>
      <PrimaryButton icon={Plus} onClick={onGenerate}>
        Generate Brief
      </PrimaryButton>
    </div>
  );
}

function BriefArchiveTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: ReturnType<typeof getArchiveTabs>;
  activeTab: ArchiveTabKey;
  onChange: (tab: ArchiveTabKey) => void;
}) {
  return (
    <div className="border-b border-hairline-soft px-4 pt-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-5">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`border-b pb-3 text-[11px] transition-colors ${
                active
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
  );
}

function BriefArchiveFilters() {
  const filters = ["All Sectors", "All Geos", "All Deal Types", "All Sources", "All Owners"] as const;

  return (
    <div className="border-b border-hairline-soft px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1 xl:max-w-[170px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Search table..."
            className="h-9 w-full rounded-md border border-hairline bg-surface-1 pl-9 pr-3 text-[10.5px] placeholder:text-text-muted focus:border-lime/50 focus:outline-none"
          />
        </div>
        {filters.map((filter) => (
          <FilterButton key={filter} label={filter} />
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
  );
}

function BriefArchiveTable({
  rows,
  selectedBriefId,
  onSelect,
}: {
  rows: ArchiveRow[];
  selectedBriefId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1100px] w-full text-left text-[10.5px] text-text-secondary">
        <thead className="border-b border-hairline-soft text-[9px] text-text-muted">
          <tr>
            <th className="w-11 px-4 py-3 font-normal sm:px-5">
              <input type="checkbox" checked readOnly className="accent-lime" aria-label="Select all briefs" />
            </th>
            <th className="py-3 pr-3 font-normal">Company / Target</th>
            <th className="py-3 pr-3 font-normal">Sector</th>
            <th className="py-3 pr-3 font-normal">Geography</th>
            <th className="py-3 pr-3 font-normal">
              <span className="inline-flex items-center gap-1 text-text-primary">
                Approved Date
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-text-muted" />
              </span>
            </th>
            <th className="py-3 pr-3 font-normal">Deal Type</th>
            <th className="py-3 pr-3 font-normal">Key Takeaway</th>
            <th className="py-3 pr-3 font-normal">Version</th>
            <th className="py-3 pr-3 font-normal">Status</th>
            <th className="w-10 py-3 pr-4 font-normal sm:pr-5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const active = row.id === selectedBriefId;

            return (
              <tr
                key={row.id}
                onClick={() => onSelect(row.id)}
                className={`cursor-pointer border-t border-hairline-soft align-top transition-colors ${
                  active ? "bg-lime/[0.04]" : "hover:bg-surface-hover/30"
                }`}
                style={
                  active
                    ? {
                        boxShadow: "inset 0 0 0 1px rgba(183,241,55,0.35)",
                      }
                    : undefined
                }
              >
                <td className="px-4 py-3 sm:px-5">
                  <input
                    type="checkbox"
                    checked={active}
                    readOnly
                    className="accent-lime"
                    aria-label={`Select ${row.company}`}
                  />
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-start gap-3">
                    <CompanyMark letter={row.logoLetter} color={row.logoColor} size={24} />
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
                <td className="py-3 pr-3">
                  <div className="leading-tight">
                    <div className="text-[10px] text-text-primary">{row.approvedDate}</div>
                    <div className="mt-0.5 text-[10px] text-text-secondary">{row.approvedTime}</div>
                  </div>
                </td>
                <td className="py-3 pr-3 text-[10px] text-text-primary">{row.dealType}</td>
                <td className="py-3 pr-3">
                  <div className="max-w-[244px] text-[10px] leading-relaxed text-text-primary">
                    {row.takeaway}
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <VersionBadge version={row.version} active={active} />
                </td>
                <td className="py-3 pr-3">
                  <StatusBadge status={row.status} size="xs" />
                </td>
                <td className="py-3 pr-4 sm:pr-5">
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-text-muted transition-colors hover:border-hairline hover:bg-surface-hover hover:text-text-primary"
                    aria-label={`More actions for ${row.company}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BriefArchiveTableFooter({ total }: { total: number }) {
  return (
    <div className="border-t border-hairline-soft px-4 py-3 sm:px-5">
      <div className="grid gap-3 text-[10.5px] text-text-secondary lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div>
          Showing <span className="mono text-text-primary">1 to 4</span> of{" "}
          <span className="mono text-text-primary">{total}</span> results
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
  );
}

function SelectedBriefWorkspace({
  activeSection,
  onSectionChange,
  selectedBrief,
  detail,
  onDownload,
  onShare,
  onViewSources,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  selectedBrief: ArchiveRow;
  detail: ArchiveDetail | null | undefined;
  onDownload: () => void;
  onShare: () => void;
  onViewSources: () => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <CompanyMark letter={selectedBrief.logoLetter} color={selectedBrief.logoColor} size={32} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[18px] font-semibold leading-tight text-text-primary">
                  {selectedBrief.company} / {selectedBrief.target}
                </h2>
                <StatusBadge status={selectedBrief.status} size="xs" />
                <VersionBadge version={selectedBrief.version} active />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-text-secondary">
                <span>{selectedBrief.dealType}</span>
                <span className="text-text-muted">-</span>
                <span>{selectedBrief.sector}</span>
                <span className="text-text-muted">-</span>
                <span>{selectedBrief.geography}</span>
                <span className="text-text-muted">-</span>
                <span>
                  {detail?.brief.status ?? "Loading"} {selectedBrief.approvedDate}, {selectedBrief.approvedTime}
                  {detail?.metadata.find((item) => item.label === "Owner")?.value
                    ? ` by ${detail.metadata.find((item) => item.label === "Owner")?.value}`
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <WorkspaceActionButton icon={Download} onClick={onDownload}>
              Download
            </WorkspaceActionButton>
            <WorkspaceActionButton icon={Share2} onClick={onShare}>
              Share
            </WorkspaceActionButton>
            <IconGhostButton ariaLabel="More brief actions">
              <Ellipsis className="h-4 w-4" />
            </IconGhostButton>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[168px_minmax(0,1fr)_322px]">
        <BriefWorkspaceSectionNav
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          detail={detail}
        />
        <BriefWorkspaceSummaryPane detail={detail} activeSection={activeSection} />
        <BriefWorkspaceDetailPane detail={detail} onViewSources={onViewSources} />
      </div>
    </Panel>
  );
}

function BriefWorkspaceSectionNav({
  activeSection,
  onSectionChange,
  detail,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  detail: ArchiveDetail | null | undefined;
}) {
  const sections = [
    { label: "Executive Summary" },
    { label: "Transaction Overview" },
    { label: "Strategic Rationale" },
    { label: "Risks & Mitigations" },
    { label: "Market Implications" },
    { label: "Key Takeaways" },
    { label: "Sources & Inputs", count: detail?.sources.length ?? 0 },
    { label: "Revision History", count: detail?.auditTrail.length ?? 0 },
  ];
  return (
    <div className="border-b border-hairline-soft p-3 xl:border-b-0 xl:border-r xl:p-2.5">
      <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
        {sections.map((section) => {
          const active = activeSection === section.label;

          return (
            <button
              key={section.label}
              type="button"
              onClick={() => onSectionChange(section.label)}
              className={`flex min-h-[40px] items-center justify-between rounded-lg px-3 py-2 text-left text-[10.5px] transition-colors ${
                active
                  ? "border border-lime/35 bg-lime/[0.08] text-lime"
                  : "border border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <span className={active ? "font-medium" : ""}>{section.label}</span>
              {section.count ? <CountPill value={section.count} active={active} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BriefWorkspaceSummaryPane({
  detail,
  activeSection,
}: {
  detail: ArchiveDetail | null | undefined;
  activeSection: string;
}) {
  const confidenceScore = detail?.brief.confidenceScore;
  const summary = detail?.brief.executiveSummary ?? "Loading brief details...";
  const takeaways = detail?.brief.keyTakeaways ?? [];
  const risks = detail?.brief.risks ?? [];
  const evidence = detail?.brief.evidenceUsed ?? [];
  const auditTrail = detail?.auditTrail ?? [];

  if (activeSection !== "Executive Summary") {
    const paragraph =
      activeSection === "Transaction Overview"
        ? detail?.brief.transactionOverview
        : activeSection === "Strategic Rationale"
          ? detail?.brief.strategicRationale
          : activeSection === "Market Implications"
            ? detail?.brief.marketImplications
            : null;
    const list = activeSection === "Risks & Mitigations"
      ? risks
      : activeSection === "Key Takeaways"
        ? takeaways
        : activeSection === "Sources & Inputs"
          ? evidence
          : [];

    return (
      <div className="border-b border-hairline-soft p-4 sm:p-5 xl:border-b-0 xl:border-r">
        <div className="space-y-4">
          <div>
            <div className="text-[12px] font-semibold text-text-primary">{activeSection}</div>
            <div className="mt-1 text-[10px] text-text-muted">
              {detail?.brief.last30daysUsed && activeSection === "Sources & Inputs"
                ? "Includes last 30 days public-context enrichment"
                : "Generated from the verified candidate evidence"}
            </div>
          </div>
          {paragraph ? <p className="text-[12px] leading-6 text-text-secondary">{paragraph}</p> : null}
          {list.length > 0 ? (
            <div className="space-y-3">
              {list.map((item) => (
                <div key={item} className="rounded-lg border border-hairline-soft bg-surface-2/40 px-3 py-3 text-[11px] leading-5 text-text-secondary">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
          {activeSection === "Revision History" ? (
            <div className="space-y-3">
              {auditTrail.length === 0 ? (
                <div className="text-[11px] text-text-secondary">No revision events recorded.</div>
              ) : auditTrail.map((entry) => (
                <div key={`${entry.actor}-${entry.when}`} className="border-b border-hairline-soft pb-3 text-[11px]">
                  <div className="text-text-primary">{entry.actor} {entry.action}</div>
                  <div className="mt-1 text-text-secondary">{entry.detail}</div>
                </div>
              ))}
            </div>
          ) : null}
          {!paragraph && list.length === 0 && activeSection !== "Revision History" ? (
            <div className="text-[11px] text-text-secondary">No generated content is available for this section.</div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-hairline-soft p-4 sm:p-5 xl:border-b-0 xl:border-r">
      <div className="space-y-5">
        <div>
          <p className="max-w-[66ch] text-[12px] leading-6 text-text-secondary">
            {summary}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {takeaways.map((takeaway) => (
            <div
              key={takeaway}
              className="rounded-lg border border-hairline-soft bg-surface-2/40 px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md border"
                  style={{
                    background: "rgba(183,241,55,0.08)",
                    borderColor: "rgba(183,241,55,0.25)",
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-lime" />
                </div>
                <div className="text-[11px] font-medium text-text-primary">Key takeaway</div>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-text-secondary">{takeaway}</p>
            </div>
          ))}
        </div>

        {takeaways.length === 0 ? (
          <div className="rounded-lg border border-hairline-soft bg-surface-2/35 px-3 py-3 text-[10.5px] text-text-secondary">
            No key takeaways were generated for this brief.
          </div>
        ) : null}

        <div className="rounded-lg border border-hairline-soft bg-surface-2/35 px-3 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-lime/45 bg-lime/[0.10]">
              <span className="mono text-[16px] text-lime">{confidenceScore ?? "-"}</span>
            </div>
            <div>
              <div className="text-[12px] font-medium text-text-primary">Confidence Score</div>
              <div className="mt-1 text-[10.5px] text-text-secondary">
                {confidenceScore === null || confidenceScore === undefined
                  ? "Not available"
                  : "Generated from candidate confidence and source coverage"}
              </div>
            </div>
          </div>
          <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/6">
            <div className="h-full rounded-full bg-lime" style={{ width: `${confidenceScore ?? 0}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefWorkspaceDetailPane({
  detail,
  onViewSources,
}: {
  detail: ArchiveDetail | null | undefined;
  onViewSources: () => void;
}) {
  const transaction = detail?.transaction ?? [];
  const sources = detail?.sources ?? [];

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="rounded-lg border border-hairline-soft bg-surface-2/35 px-4 py-4">
        <div className="text-[12px] font-medium text-text-primary">Transaction Overview</div>
        <div className="mt-4 space-y-2.5">
          {transaction.map((item) => (
            <div key={item.label} className="grid grid-cols-[116px_minmax(0,1fr)] gap-3 text-[10.5px]">
              <div className="text-text-secondary">{item.label}</div>
              <div className="text-text-primary">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-hairline-soft bg-surface-2/35 px-4 py-4">
        <div className="text-[12px] font-medium text-text-primary">Source Snapshot (Top 3)</div>
        <div className="mt-4 space-y-3">
          {sources.slice(0, 3).map((item) => (
            <div key={item.url} className="flex items-center justify-between gap-3 text-[10.5px]">
              <span className="flex min-w-0 items-center gap-2 text-text-primary">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                <span className="truncate">{item.publisher}: {item.headline}</span>
              </span>
              <span className="mono shrink-0 text-text-secondary">{item.date}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onViewSources}
          className="mt-4 inline-flex h-9 items-center rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary transition-colors hover:bg-surface-hover"
        >
          View all {sources.length} sources
        </button>
      </div>
    </div>
  );
}

function RecentBriefRunsPanel({ rows, loading }: { rows: readonly BriefRunRow[]; loading: boolean }) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Recent Brief Runs
        </div>
        <button type="button" className="text-[10.5px] text-info hover:text-lime">
          View all
        </button>
      </div>
      <div className="space-y-4 px-4 py-4 sm:px-5">
        {loading ? <div className="text-[10.5px] text-text-secondary">Loading runs...</div> : null}
        {!loading && rows.length === 0 ? (
          <div className="text-[10.5px] text-text-secondary">No brief runs yet.</div>
        ) : null}
        {rows.map((run) => (
          <div key={run.id} className="flex items-start gap-3">
            <CompanyMark letter="B" color="#B7F137" size={24} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[10.5px] text-text-primary">{run.id}</div>
              <div className="mt-1 flex items-center gap-2 text-[10px]">
                <span style={{ color: getRunTone(run.status).color }}>{run.status}</span>
                <span className="text-text-secondary">
                  {run.completed}/{run.total}
                </span>
              </div>
            </div>
            <div className="mono shrink-0 text-[10px] text-text-secondary">{run.when}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function BriefArchiveAuditTrailPanel({ detail }: { detail: ArchiveDetail | null | undefined }) {
  const entries = detail?.auditTrail ?? [];
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Audit Trail
        </div>
        <button type="button" className="text-[10.5px] text-info hover:text-lime">
          View all
        </button>
      </div>
      <div className="space-y-4 px-4 py-4 sm:px-5">
        {entries.length === 0 ? (
          <div className="text-[10.5px] text-text-secondary">No audit events recorded for this brief.</div>
        ) : null}
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
              <div className="mt-1 text-[10px] text-text-secondary">{entry.detail}</div>
            </div>
            <div className="mono shrink-0 text-[10px] text-text-secondary">{entry.when}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function BriefMetadataPanel({ detail }: { detail: ArchiveDetail | null | undefined }) {
  const metadata = detail?.metadata ?? [];
  return (
    <Panel>
      <div className="border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Brief Metadata
        </div>
      </div>
      <div className="space-y-3 px-4 py-4 sm:px-5">
        {metadata.map((item) => (
          <div key={item.label} className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 text-[10.5px]">
            <div className="text-text-secondary">{item.label}</div>
            <div className="text-text-primary">{item.value}</div>
          </div>
        ))}
      </div>
    </Panel>
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

function WorkspaceActionButton({
  icon: Icon,
  children,
  onClick,
}: {
  icon: typeof Download;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary transition-colors hover:bg-surface-hover"
    >
      <Icon className="h-3.5 w-3.5 text-text-secondary" />
      {children}
    </button>
  );
}

function IconGhostButton({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

function VersionBadge({
  version,
  active = false,
}: {
  version: string;
  active?: boolean;
}) {
  return (
    <span
      className="inline-flex h-6 items-center rounded-md px-2 text-[10px] mono"
      style={{
        color: active ? "#8EEA45" : "#7FA8FF",
        background: active ? "rgba(142,234,69,0.10)" : "rgba(127,168,255,0.10)",
        border: active
          ? "1px solid rgba(142,234,69,0.28)"
          : "1px solid rgba(127,168,255,0.28)",
      }}
    >
      {version}
    </span>
  );
}

function CountPill({ value, active }: { value: number; active: boolean }) {
  return (
    <span
      className="inline-flex h-5 min-w-[22px] items-center justify-center rounded px-1.5 text-[9px] mono"
      style={{
        color: active ? "#B7F137" : "#A7B3BE",
        background: active ? "rgba(183,241,55,0.10)" : "rgba(167,179,190,0.10)",
        border: active
          ? "1px solid rgba(183,241,55,0.24)"
          : "1px solid rgba(167,179,190,0.18)",
      }}
    >
      {value}
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
          : { color: "#2DD4BF", bg: "rgba(45,212,191,0.14)", border: "rgba(45,212,191,0.26)" };

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
  children: ReactNode;
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

function getRunTone(status: string) {
  if (status === "Generated") {
    return {
      color: "#7FA8FF",
      bg: "rgba(127,168,255,0.10)",
      border: "rgba(127,168,255,0.28)",
      icon: CheckCircle2,
    };
  }

  return statusStyles[status] ?? statusStyles.Empty;
}
