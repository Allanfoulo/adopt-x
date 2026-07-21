import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
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

const archiveTabs = [
  { key: "All Briefs", label: "All Briefs", count: 48 },
  { key: "Approved", label: "Approved", count: 18 },
  { key: "Generated", label: "Generated", count: 26 },
  { key: "Draft", label: "Draft", count: 4 },
  { key: "Archived", label: "Archived", count: 7 },
] as const;

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
  const [activeTab, setActiveTab] = useState<(typeof archiveTabs)[number]["key"]>("All Briefs");
  const [selectedBriefId, setSelectedBriefId] = useState(archiveRows[0].id);
  const [activeSection, setActiveSection] = useState("Executive Summary");

  const selectedBrief =
    archiveRows.find((row) => row.id === selectedBriefId) ?? archiveRows[0];

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
            <BriefArchiveTabs activeTab={activeTab} onChange={setActiveTab} />
            <BriefArchiveFilters />
            <BriefArchiveTable
              rows={archiveRows}
              selectedBriefId={selectedBriefId}
              onSelect={setSelectedBriefId}
            />
            <BriefArchiveTableFooter />
          </Panel>

          <SelectedBriefWorkspace
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            selectedBrief={selectedBrief}
            onDownload={handleDownload}
            onShare={handleShare}
            onViewSources={handleSourceView}
          />
        </div>

        <div className="space-y-4">
          <RecentBriefRunsPanel />
          <BriefArchiveAuditTrailPanel />
          <BriefMetadataPanel />
        </div>
      </div>
    </AppShell>
  );
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
  activeTab,
  onChange,
}: {
  activeTab: (typeof archiveTabs)[number]["key"];
  onChange: (tab: (typeof archiveTabs)[number]["key"]) => void;
}) {
  return (
    <div className="border-b border-hairline-soft px-4 pt-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-5">
        {archiveTabs.map((tab) => {
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

function BriefArchiveTableFooter() {
  return (
    <div className="border-t border-hairline-soft px-4 py-3 sm:px-5">
      <div className="grid gap-3 text-[10.5px] text-text-secondary lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div>
          Showing <span className="mono text-text-primary">1 to 4</span> of{" "}
          <span className="mono text-text-primary">48</span> results
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
  onDownload,
  onShare,
  onViewSources,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  selectedBrief: ArchiveRow;
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
                  Approved {selectedBrief.approvedDate}, {selectedBrief.approvedTime} by Maya Patel
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
        />
        <BriefWorkspaceSummaryPane />
        <BriefWorkspaceDetailPane onViewSources={onViewSources} />
      </div>
    </Panel>
  );
}

function BriefWorkspaceSectionNav({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  return (
    <div className="border-b border-hairline-soft p-3 xl:border-b-0 xl:border-r xl:p-2.5">
      <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
        {sectionNav.map((section) => {
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

function BriefWorkspaceSummaryPane() {
  return (
    <div className="border-b border-hairline-soft p-4 sm:p-5 xl:border-b-0 xl:border-r">
      <div className="space-y-5">
        <div>
          <p className="max-w-[66ch] text-[12px] leading-6 text-text-secondary">
            Purple Group's proposed acquisition of Telescope AI strengthens its AI-native investment
            intelligence capabilities across the APAC region. Telescope AI's proprietary analytics
            platform, deep domain datasets, and strong enterprise traction position Purple Group to
            accelerate product innovation, expand addressable market, and deliver higher-value
            insights to institutional clients.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {summarySignals.map((item) => (
            <div
              key={item.title}
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
                  <item.icon className="h-3.5 w-3.5 text-lime" />
                </div>
                <div className="text-[11px] font-medium text-text-primary">{item.title}</div>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-text-secondary">{item.copy}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-hairline-soft bg-surface-2/35 px-3 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-lime/45 bg-lime/[0.10]">
              <span className="mono text-[16px] text-lime">92</span>
            </div>
            <div>
              <div className="text-[12px] font-medium text-text-primary">Confidence Score</div>
              <div className="mt-1 text-[10.5px] text-text-secondary">
                High confidence in analysis
              </div>
            </div>
          </div>
          <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/6">
            <div className="h-full w-[92%] rounded-full bg-lime" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefWorkspaceDetailPane({
  onViewSources,
}: {
  onViewSources: () => void;
}) {
  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="rounded-lg border border-hairline-soft bg-surface-2/35 px-4 py-4">
        <div className="text-[12px] font-medium text-text-primary">Transaction Overview</div>
        <div className="mt-4 space-y-2.5">
          {transactionOverview.map((item) => (
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
          {sourceSnapshot.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-[10.5px]">
              <span className="flex min-w-0 items-center gap-2 text-text-primary">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                <span className="truncate">{item.label}</span>
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
          View all 14 sources
        </button>
      </div>
    </div>
  );
}

function RecentBriefRunsPanel() {
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
        {recentBriefRuns.map((run) => (
          <div key={`${run.company}-${run.version}`} className="flex items-start gap-3">
            <CompanyMark
              letter={run.company.charAt(0)}
              color={run.company.startsWith("Insura") ? "#FF7A66" : run.company.startsWith("Lex") ? "#87A89A" : run.company.startsWith("Medi") ? "#D8D1C0" : "#F4F6FB"}
              size={24}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] text-text-primary">{run.company}</div>
              <div className="mt-1 flex items-center gap-2 text-[10px]">
                <span className="mono text-text-secondary">{run.version}</span>
                <span style={{ color: getRunTone(run.status).color }}>{run.status}</span>
              </div>
            </div>
            <div className="mono shrink-0 text-[10px] text-text-secondary">{run.when}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function BriefArchiveAuditTrailPanel() {
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
        {auditTrail.map((entry) => (
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

function BriefMetadataPanel() {
  return (
    <Panel>
      <div className="border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="text-[12px] font-semibold tracking-tight text-text-primary">
          Brief Metadata
        </div>
      </div>
      <div className="space-y-3 px-4 py-4 sm:px-5">
        {briefMetadata.map((item) => (
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
