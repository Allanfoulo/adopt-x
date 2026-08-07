import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { FunctionReference } from "convex/server";
import type { ReactNode } from "react";
import { ArrowLeft, Download, ExternalLink, Share2 } from "lucide-react";
import { AppShell, CompanyMark, Panel, StatusBadge, ToolbarButton } from "@/components/app-shell";
import { useToast } from "@/components/app-toast";
import { buildBriefPdf, slugify } from "@/lib/brief-pdf";
import type { ArchiveDetail, ArchiveRow, BriefOpportunity, BriefPoint } from "@/lib/brief-types";

export const Route = createFileRoute("/briefs/$externalId")({
  head: () => ({ meta: [{ title: "Brief Detail - Adopt X" }] }),
  component: BriefReader,
});

const getArchiveDetailReference: FunctionReference<
  "query",
  "public",
  { externalId: string },
  ArchiveDetail | null
> = makeFunctionReference("briefs:getArchiveDetail");

const sections = [
  "Executive Summary",
  "Transaction Overview",
  "Capability Purchased",
  "Build vs Buy",
  "Strategic Rationale",
  "What Changed",
  "Value Drivers",
  "Synergy Map",
  "Risks & Mitigations",
  "Market Signal",
  "Follow the Money",
  "Second-Order Effects",
  "Market Implications",
  "Key Takeaways",
  "Startup Opportunities",
  "Product Ideas",
  "Investment Thesis",
  "Sources & Inputs",
  "Revision History",
] as const;

function BriefReader() {
  const { externalId } = Route.useParams();
  const detail = useQuery(getArchiveDetailReference, { externalId });
  const { info, success } = useToast();

  if (detail === undefined) {
    return <AppShell title="Brief Reader" subtitle="Loading the selected brief"><ReaderState message="Loading the live brief..." /></AppShell>;
  }

  if (!detail) {
    return <AppShell title="Brief Reader" subtitle="The selected brief could not be found"><ReaderState message="This brief is no longer available in the archive." /></AppShell>;
  }

  const selectedBrief = toArchiveRow(detail);
  const download = async () => {
    try {
      const bytes = await buildBriefPdf(detail, selectedBrief);
      const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugify(detail.candidate.company)}-${slugify(detail.candidate.target)}-brief.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      success({ title: "Brief PDF downloaded", description: "The full analysis framework was exported." });
    } catch (error) {
      info({ title: "Could not create PDF", description: error instanceof Error ? error.message : "The brief export failed." });
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      success({ title: "Brief link copied", description: "The dedicated reader link is ready to share." });
    } catch {
      info({ title: "Share link ready", description: url });
    }
  };

  return (
    <AppShell title="Brief Reader" subtitle="Detailed adoption intelligence and transaction analysis">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/briefs" className="inline-flex items-center gap-2 text-[11px] text-text-secondary hover:text-text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Brief Archive
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarButton icon={Download} onClick={download}>Download</ToolbarButton>
            <ToolbarButton icon={Share2} onClick={share}>Share</ToolbarButton>
          </div>
        </div>

        <Panel className="overflow-hidden">
          <div className="border-b border-hairline-soft px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <CompanyMark letter={selectedBrief.logoLetter} color={selectedBrief.logoColor} size={36} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[18px] font-semibold text-text-primary">{selectedBrief.company} / {selectedBrief.target}</h1>
                    <StatusBadge status={selectedBrief.status} size="xs" />
                    <span className="mono rounded border border-lime/25 bg-lime/[0.08] px-2 py-1 text-[10px] text-lime">{selectedBrief.version}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-text-secondary">
                    <span>{detail.candidate.dealType}</span><span className="text-text-muted">-</span>
                    <span>{detail.candidate.sector}</span><span className="text-text-muted">-</span>
                    <span>{detail.candidate.geography}</span><span className="text-text-muted">-</span>
                    <span>{detail.brief.status} {detail.candidate.announcementDate}</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-[10px] text-text-muted">Updated {new Date(detail.brief.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="overflow-x-auto border-b border-hairline-soft p-3 xl:hidden">
            <div className="flex min-w-max gap-2">
              {sections.map((section) => <a key={section} href={`#${sectionId(section)}`} className="rounded-md border border-hairline px-3 py-2 text-[10px] text-text-secondary hover:border-lime/40 hover:text-text-primary">{section}</a>)}
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[190px_minmax(0,1fr)_292px]">
            <aside className="hidden border-r border-hairline-soft p-3 xl:block">
              <div className="sticky top-4 space-y-1">
                <div className="px-3 pb-2 text-[9px] uppercase tracking-[0.18em] text-text-muted">In this brief</div>
                {sections.map((section) => <a key={section} href={`#${sectionId(section)}`} className="block rounded-md px-3 py-2 text-[10px] leading-4 text-text-secondary hover:bg-surface-hover hover:text-text-primary">{section}</a>)}
              </div>
            </aside>
            <main className="min-w-0 border-b border-hairline-soft px-4 py-5 sm:px-6 xl:border-b-0 xl:border-r">
              <BriefReaderContent detail={detail} />
            </main>
            <aside className="space-y-4 p-4 sm:p-5 xl:sticky xl:top-4 xl:self-start">
              <ReaderFacts title="Transaction Overview" items={detail.transaction} />
              <div className="rounded-lg border border-hairline-soft bg-surface-2/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] font-medium text-text-primary">Sources (All Cited)</div>
                  <span className="mono text-[10px] text-text-muted">{detail.sources.length}</span>
                </div>
                <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {detail.sources.length ? detail.sources.map((source) => (
                    <a key={`${source.publisher}-${source.headline}`} href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-[10px] text-text-secondary hover:text-text-primary">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                      <span className="min-w-0 flex-1">
                        <span className="block">{source.publisher}: {source.headline}</span>
                        <span className="mt-0.5 block text-[9px] text-text-muted">{source.date} · {source.type}</span>
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-text-muted" />
                    </a>
                  )) : <ReaderEmpty reason="No cited source records are available for this brief." />}
                </div>
              </div>
            </aside>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function BriefReaderContent({ detail }: { detail: ArchiveDetail }) {
  const analysis = detail.brief.analysis;
  return (
    <div className="space-y-10">
      <ReaderSection id="Executive Summary" title="Executive Summary" subtitle="Generated from verified candidate evidence"><p>{detail.brief.executiveSummary}</p></ReaderSection>
      <ReaderSection id="Transaction Overview" title="Transaction Overview" subtitle="What is known about the transaction"><p>{detail.brief.transactionOverview}</p></ReaderSection>
      <ReaderSection id="Capability Purchased" title="Capability Purchased"><ReaderBullets items={analysis?.capabilityPurchased} emptyReason="No capability could be identified because the available source does not confirm a purchased or transferred AI capability." /></ReaderSection>
      <ReaderSection id="Build vs Buy" title="Build vs Buy"><p>{analysis?.buildVsBuy ?? fallback()}</p></ReaderSection>
      <ReaderSection id="Strategic Rationale" title="Strategic Rationale"><p>{detail.brief.strategicRationale}</p><ReaderPoints items={analysis?.strategicRationalePoints} /></ReaderSection>
      <ReaderSection id="What Changed" title="What Changed"><p>{analysis?.marketChange ?? fallback()}</p></ReaderSection>
      <ReaderSection id="Value Drivers" title="Value Drivers"><ReaderBullets items={analysis?.valueDrivers} emptyReason="No defensible value drivers were identified because the evidence does not establish a confirmed transaction outcome or measurable benefit." /></ReaderSection>
      <ReaderSection id="Synergy Map" title="Synergy Map"><div className="grid gap-3 md:grid-cols-3">{analysis?.synergyMap?.length ? analysis.synergyMap.map((item) => <ReaderCard key={item.category} title={item.category} detail={item.items.join(" ")} />) : <ReaderEmpty reason="No synergy map was generated because the available evidence does not identify a confirmed transaction, target capability, or integration plan from which revenue, cost, or strategic synergies could be established." />}</div></ReaderSection>
      <ReaderSection id="Risks & Mitigations" title="Risks & Mitigations"><div className="space-y-3">{analysis?.riskAnalysis?.length ? analysis.riskAnalysis.map((item) => <ReaderCard key={`${item.category}-${item.title}`} title={`${item.category}: ${item.title}`} detail={`${item.detail} Mitigation: ${item.mitigation}`} />) : <ReaderEmpty reason="No transaction-specific risks or mitigations could be established because the available evidence does not confirm a deal structure, target, or execution plan." />}</div></ReaderSection>
      <ReaderSection id="Market Signal" title="Market Signal"><p>{analysis?.marketSignal ?? fallback()}</p></ReaderSection>
      <ReaderSection id="Follow the Money" title="Follow the Money"><ReaderPoints items={analysis?.followTheMoney} emptyReason="No follow-the-money analysis was generated because the available evidence does not disclose transaction value, funding flows, ownership changes, or financial commitments." /></ReaderSection>
      <ReaderSection id="Second-Order Effects" title="Second-Order Effects"><ReaderPoints items={(analysis?.secondOrderEffects ?? []).map((item) => ({ title: item.question, detail: item.answer }))} emptyReason="No second-order effects were generated because the available evidence does not establish a confirmed transaction or operational change to trace beyond the immediate event." /></ReaderSection>
      <ReaderSection id="Market Implications" title="Market Implications"><p>{detail.brief.marketImplications}</p></ReaderSection>
      <ReaderSection id="Key Takeaways" title="Key Takeaways"><ReaderBullets items={detail.brief.keyTakeaways} /></ReaderSection>
      <ReaderSection id="Startup Opportunities" title="Startup Opportunities"><ReaderOpportunities items={analysis?.startupOpportunities} emptyReason="No defensible startup opportunity was identified from the available evidence; the source does not establish a validated market gap or unmet need." /></ReaderSection>
      <ReaderSection id="Product Ideas" title="Product Ideas"><ReaderOpportunities items={analysis?.productIdeas} emptyReason="No defensible product idea was identified from the available evidence; the source does not establish a specific workflow problem or buyer demand." /></ReaderSection>
      <ReaderSection id="Investment Thesis" title="Investment Thesis"><p>{analysis?.investmentThesis ?? fallback()}</p></ReaderSection>
      <ReaderSection id="Sources & Inputs" title="Sources & Inputs" subtitle="Public sources used to corroborate the brief"><ReaderSourceList detail={detail} /></ReaderSection>
      <ReaderSection id="Revision History" title="Revision History"><div className="space-y-3">{detail.auditTrail.length ? detail.auditTrail.map((entry, index) => <ReaderCard key={`${entry.when}-${index}`} title={`${entry.actor} ${entry.action}`} detail={`${entry.detail} (${entry.when})`} />) : <p>No revision events recorded.</p>}</div></ReaderSection>
    </div>
  );
}

function ReaderSection({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: ReactNode }) {
  return <section id={sectionId(id)} className="scroll-mt-6 border-b border-hairline-soft pb-8 last:border-b-0"><h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>{subtitle ? <div className="mt-1 text-[10px] text-text-muted">{subtitle}</div> : null}<div className="mt-4 space-y-4 text-[12px] leading-6 text-text-secondary">{children}</div></section>;
}

function ReaderBullets({ items, emptyReason }: { items?: string[]; emptyReason?: string }) { return items?.length ? <ul className="space-y-2">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" /><span>{item}</span></li>)}</ul> : <ReaderEmpty reason={emptyReason ?? fallback()} />; }
function ReaderPoints({ items, emptyReason }: { items?: BriefPoint[]; emptyReason?: string }) { return items?.length ? <div className="grid gap-3 md:grid-cols-2">{items.map((item, index) => <ReaderCard key={`${item.title}-${index}`} title={item.title} detail={item.detail} />)}</div> : <ReaderEmpty reason={emptyReason ?? fallback()} />; }
function ReaderOpportunities({ items, emptyReason }: { items?: BriefOpportunity[]; emptyReason?: string }) { return items?.length ? <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <ReaderCard key={item.title} title={`${item.title} (${item.confidence} confidence)`} detail={item.detail} />)}</div> : <ReaderEmpty reason={emptyReason ?? fallback()} />; }
function ReaderCard({ title, detail }: { title: string; detail: string }) { return <div className="rounded-lg border border-hairline-soft bg-surface-2/35 p-3"><div className="font-medium text-text-primary">{title}</div><div className="mt-1 text-[11px] leading-5 text-text-secondary">{detail}</div></div>; }
function ReaderEmpty({ reason }: { reason: string }) { return <div className="rounded-lg border border-dashed border-hairline bg-surface-2/25 px-3 py-3 text-[11px] leading-5 text-text-secondary">{reason}</div>; }
function ReaderSourceList({ detail }: { detail: ArchiveDetail }) {
  if (!detail.sources.length && !detail.brief.evidenceUsed.length) {
    return <ReaderEmpty reason="No cited source records are available to corroborate this brief." />;
  }

  return (
    <div className="space-y-4">
      {detail.sources.length ? detail.sources.map((source) => (
        <a key={`${source.publisher}-${source.headline}-${source.url}`} href={source.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-hairline-soft bg-surface-2/35 p-3 transition-colors hover:border-lime/35 hover:bg-surface-hover">
          <div className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-text-primary">{source.headline}</div>
              <div className="mt-1 text-[10px] text-text-secondary">{source.publisher} · {source.date} · {source.type}</div>
              <div className="mt-2 break-all text-[10px] leading-5 text-lime/80">{source.url}</div>
            </div>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
          </div>
        </a>
      )) : null}
      {detail.brief.evidenceUsed.length ? (
        <div className="rounded-lg border border-hairline-soft bg-surface-2/25 p-3">
          <div className="text-[11px] font-medium text-text-primary">Evidence notes used in the analysis</div>
          <ReaderBullets items={detail.brief.evidenceUsed} />
        </div>
      ) : null}
    </div>
  );
}
function ReaderFacts({ title, items }: { title: string; items: { label: string; value: string }[] }) { return <div className="rounded-lg border border-hairline-soft bg-surface-2/35 p-4"><div className="text-[12px] font-medium text-text-primary">{title}</div><div className="mt-4 space-y-2.5">{items.map((item) => <div key={item.label} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 text-[10.5px]"><div className="text-text-secondary">{item.label}</div><div className="text-text-primary">{item.value}</div></div>)}</div></div>; }
function ReaderState({ message }: { message: string }) { return <div className="rounded-lg border border-hairline-soft bg-surface-2/35 p-12 text-center text-[12px] text-text-secondary">{message}</div>; }
function fallback() { return "No defensible conclusion identified from the available evidence."; }
function sectionId(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
function toArchiveRow(detail: ArchiveDetail): ArchiveRow { return { id: detail.id, company: detail.candidate.company, target: detail.candidate.target, logoLetter: detail.candidate.company.charAt(0).toUpperCase() || "A", logoColor: "#26C6B9", sector: detail.candidate.sector, geography: detail.candidate.geography, approvedDate: detail.candidate.announcementDate, approvedTime: "", dealType: detail.candidate.dealType, takeaway: detail.brief.keyTakeaways[0] ?? "", version: detail.brief.version, status: detail.brief.status === "Approved" ? "Approved" : "Generated" }; }
