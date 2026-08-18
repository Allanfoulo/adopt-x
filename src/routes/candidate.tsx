import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { FunctionReference } from "convex/server";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell, Panel, StatusBadge, ToolbarButton } from "@/components/app-shell";
import { useToast } from "@/components/app-toast";
import type { PreReviewAssessment } from "@/lib/brief-types";
import {
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit3,
  ExternalLink,
  FileText,
  Info,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  ThumbsUp,
  User,
  Users,
  X,
} from "lucide-react";

export const Route = createFileRoute("/candidate")({
  head: () => ({ meta: [{ title: "Candidate Detail - Adopt X" }] }),
  validateSearch: z.object({ externalId: z.string().optional() }),
  component: CandidateDetail,
});

type HeroField = {
  label: string;
  value: string;
  tone?: "teal" | "blue";
  mark?: string;
};

type SourceRow = {
  n: number;
  externalId?: string;
  headline: string;
  publisher: string;
  date: string;
  type: string;
  tone: string;
  url?: string;
  corroborationEvidence?: {
    externalId: string;
    title: string;
    url: string;
    description: string;
    markdown: string;
  }[];
};

type FactRow = {
  label: string;
  value: string;
  source: "ai" | "human";
};

type ScoreRow = {
  label: string;
  value: number;
  helper: string;
  source: "ai" | "human" | "rubric";
};

type ValidationRow = {
  label: string;
  value: string;
};

type ScoreExplanation = {
  title: string;
  body: string;
  components: { label: string; points: number; rationale: string }[];
};

type AuditTrailEntry = {
  name: string;
  action: string;
  detail: string;
  when: string;
  initials: string;
  tone: "human" | "system";
};

type CandidateDetailData = {
  candidate: {
    id: string;
    company: string;
    target: string;
    headline: string;
    status: string;
  };
  heroFields: HeroField[];
  facts: FactRow[];
  sources: SourceRow[];
  scoreRows: ScoreRow[];
  validationRows: ValidationRow[];
  scoreExplanations: ScoreExplanation[];
  auditTrail: AuditTrailEntry[];
  reviewState: {
    status: string;
    assignedTo: string;
    assignedOn: string;
    sla: string;
  };
  summary: {
    text: string;
    reasons: string[];
  };
  preReviewAssessment: PreReviewAssessment | null;
  tags: string[];
};

const getCandidateDetail: FunctionReference<
  "query",
  "public",
  { externalId?: string },
  CandidateDetailData | null
> = makeFunctionReference("candidate:getDetail");

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

type UpdateFactsResult = { updated: boolean; changedFields: string[] };

const updateCandidateFacts: FunctionReference<
  "mutation",
  "public",
  {
    externalId: string;
    changes: { field: string; value: string }[];
    note?: string;
  },
  UpdateFactsResult
> = makeFunctionReference("candidate:updateFacts");

const heroFields = [
  { label: "Company", value: "MediAxis", tone: "teal", mark: "M" },
  { label: "Target", value: "ClinPilot AI", tone: "blue", mark: "C" },
  { label: "Sector", value: "Healthcare" },
  { label: "Geography", value: "UK" },
  { label: "Deal Type", value: "Strategic Partnership" },
  { label: "AI Role", value: "Clinical workflow support" },
  { label: "Published", value: "Jul 15, 2025" },
] satisfies readonly HeroField[];

const sources = [
  {
    n: 1,
    headline: "MediAxis and ClinPilot AI partner to accelerate clinical workflow automation",
    publisher: "Healthcare IT News",
    date: "Jul 15, 2025",
    type: "News Article",
    tone: "blue",
  },
  {
    n: 2,
    headline: "MediAxis teams up with ClinPilot AI for AI-powered triage solutions",
    publisher: "Fierce Healthcare",
    date: "Jul 15, 2025",
    type: "News Article",
    tone: "blue",
  },
  {
    n: 3,
    headline: "MediAxis & ClinPilot AI Announce Strategic Partnership",
    publisher: "Company Press Release",
    date: "Jul 15, 2025",
    type: "Press Release",
    tone: "purple",
  },
  {
    n: 4,
    headline: "Partnership to enhance clinical triage efficiency across UK healthcare systems",
    publisher: "HSJ (Health Service Journal)",
    date: "Jul 14, 2025",
    type: "News Article",
    tone: "blue",
  },
] as const;

const facts: { label: string; value: string; source: "ai" | "human" }[] = [
  { label: "Company", value: "MediAxis", source: "ai" },
  { label: "Target", value: "ClinPilot AI", source: "ai" },
  { label: "Sector", value: "Healthcare", source: "ai" },
  { label: "Geography", value: "UK", source: "ai" },
  { label: "Deal Type", value: "Strategic Partnership", source: "human" },
  { label: "AI Role", value: "Clinical workflow support", source: "human" },
  { label: "Announcement Date", value: "Jul 15, 2025", source: "ai" },
  { label: "Source Class", value: "News / Press", source: "ai" },
];

const scoreRows = [
  {
    label: "Confidence Score",
    value: 86,
    helper: "High confidence in the accuracy of the extracted facts.",
    source: "human" as const,
  },
  {
    label: "Thesis-Fit Score",
    value: 88,
    helper: "Strong fit with our AI-driven workflow thesis.",
    source: "human" as const,
  },
  {
    label: "Source Confidence",
    value: 92,
    helper: "High-quality, relevant, and independent sources.",
    source: "ai" as const,
  },
];

const validationRows = [
  { label: "Sources Verified", value: "4 / 4" },
  { label: "Publisher Reputation", value: "High" },
  { label: "Duplication Check", value: "No issues" },
  { label: "Conflicting Info", value: "None detected" },
];

const scoreExplanations = [
  {
    title: "Confidence Score (86)",
    body: "Based on source quality, recency, and consistency across multiple high-signal sources.",
    components: [],
  },
  {
    title: "Thesis-Fit Score (88)",
    body: "Strong alignment with our thesis on AI-enabled clinical workflow automation.",
    components: [],
  },
  {
    title: "Source Confidence (92)",
    body: "High-quality, relevant, and independent sources with consistent details.",
    components: [],
  },
];

const auditTrail = [
  {
    name: "Maya Patel",
    action: "edited AI Role",
    detail: "Clinical workflow support",
    when: "10 min ago",
    initials: "MP",
    tone: "human",
  },
  {
    name: "Maya Patel",
    action: "approved candidate",
    detail: "InsuraCo / ClaimForge AI (dc:003)",
    when: "25 min ago",
    initials: "MP",
    tone: "human",
  },
  {
    name: "Jordan Smith",
    action: "edited Deal Type",
    detail: 'Strategic Partnership, "Strategic Partnership"',
    when: "35 min ago",
    initials: "JS",
    tone: "human",
  },
  {
    name: "System",
    action: "scan_001 completed",
    detail: "45 candidates created",
    when: "Today, 08:32 AM",
    initials: "AI",
    tone: "system",
  },
];

const tagGroups = [
  "UK Market",
  "Clinical Workflow",
  "AI Triage",
  "EHR Integration",
  "Decision Support",
  "Partnership",
  "Press Release",
];

function CandidateDetail() {
  const { success, error, warning } = useToast();
  const { externalId } = useSearch({ from: "/candidate" });
  const detail = useQuery(getCandidateDetail, { externalId });
  const reviewCandidate = useMutation(reviewCandidates);
  const saveCandidateFacts = useMutation(updateCandidateFacts);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftFacts, setDraftFacts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (detail && !isEditing) {
      setDraftFacts(Object.fromEntries(detail.facts.map((fact) => [fact.label, fact.value])));
    }
  }, [detail, isEditing]);

  if (detail === undefined) {
    return (
      <AppShell title="Candidate Detail">
        <Panel className="p-6 text-sm text-text-secondary">Loading live candidate data...</Panel>
      </AppShell>
    );
  }

  if (detail === null) {
    return (
      <AppShell title="Candidate Detail">
        <Panel className="p-6 text-sm text-text-secondary">
          No live candidates are available yet. Run a scan to populate the review queue.
        </Panel>
      </AppShell>
    );
  }

  const view = detail;
  const visibleFacts = view.facts.map((fact) => ({
    ...fact,
    value: isEditing ? (draftFacts[fact.label] ?? fact.value) : fact.value,
  }));
  const changedFacts = view.facts
    .filter(
      (fact) =>
        isEditing && draftFacts[fact.label] !== undefined && draftFacts[fact.label] !== fact.value,
    )
    .map((fact) => ({ field: fact.label, value: draftFacts[fact.label] }));
  const isDirty = changedFacts.length > 0;

  const beginEditing = () => {
    setDraftFacts(Object.fromEntries(view.facts.map((fact) => [fact.label, fact.value])));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftFacts(Object.fromEntries(view.facts.map((fact) => [fact.label, fact.value])));
    setIsEditing(false);
  };

  const saveFacts = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      const result = await saveCandidateFacts({
        externalId: view.candidate.id,
        changes: changedFacts,
      });
      if (result.updated) {
        success({
          title: "Facts saved",
          description: `${result.changedFields.length} fact${result.changedFields.length === 1 ? "" : "s"} updated and added to the audit trail.`,
        });
      }
      setIsEditing(false);
    } catch (err) {
      error({
        title: "Could not save facts",
        description: err instanceof Error ? err.message : "Unable to persist candidate facts.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const runReviewAction = async (action: "approve" | "reject") => {
    if (isReviewing) {
      return;
    }

    setIsReviewing(true);
    try {
      const result = await reviewCandidate({
        externalIds: [view.candidate.id],
        action,
        reason:
          action === "approve"
            ? "Approved from candidate detail review."
            : "Rejected from candidate detail review.",
      });
      if (result.updated === 0) {
        warning({
          title: "No candidate updated",
          description: "The selected candidate could not be found in the current data set.",
        });
        return;
      }

      success({
        title: action === "approve" ? "Candidate approved" : "Candidate rejected",
        description:
          action === "approve"
            ? `${view.candidate.company} moved into the approved lane.`
            : `${view.candidate.company} was removed from the active review lane.`,
      });
    } catch (err) {
      error({
        title: "Review action failed",
        description: err instanceof Error ? err.message : "Unable to update candidate status.",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const actions = (
    <>
      <ToolbarButton icon={Edit3} onClick={isEditing ? cancelEditing : beginEditing}>
        {isEditing ? "Editing" : "Edit Mode"}
      </ToolbarButton>
      <ToolbarButton icon={X} onClick={cancelEditing}>
        Cancel
      </ToolbarButton>
      <button
        type="button"
        onClick={() => void saveFacts()}
        disabled={!isEditing || !isDirty || isSaving}
        className={`h-10 rounded-lg border border-hairline bg-surface-1 px-4 text-[12px] text-text-muted ${
          isEditing && isDirty && !isSaving
            ? "text-text-primary hover:bg-surface-hover"
            : "cursor-not-allowed opacity-50"
        }`}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
      <button
        type="button"
        onClick={() => void runReviewAction("approve")}
        disabled={isReviewing}
        className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[12px] font-medium text-primary-foreground"
        style={{
          background: "linear-gradient(180deg, #C9FF54, #B7F137)",
          border: "1px solid rgba(183,241,55,0.6)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 24px rgba(183,241,55,0.20)",
        }}
      >
        <ThumbsUp className="h-4 w-4" strokeWidth={2.25} /> Approve
      </button>
      <button
        type="button"
        onClick={() => void runReviewAction("reject")}
        disabled={isReviewing}
        className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[12px] font-medium"
        style={{
          background: "rgba(255,77,69,0.10)",
          border: "1px solid rgba(255,77,69,0.40)",
          color: "#FF4D45",
        }}
      >
        <X className="h-4 w-4" strokeWidth={2.25} /> Reject
      </button>
      <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-surface-1 hover:bg-surface-hover">
        <MoreHorizontal className="h-4 w-4 text-text-secondary" />
      </button>
    </>
  );

  return (
    <AppShell title="Candidate Detail" actions={actions}>
      <div className="space-y-5">
        <Link
          to="/triage"
          className="inline-flex items-center gap-1.5 text-[10.5px] text-text-secondary transition-colors hover:text-lime"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Triage Queue
        </Link>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_292px]">
          <CandidateHeroCard candidate={view.candidate} fields={view.heroFields} />
          <ReviewStateCard reviewState={view.reviewState} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_292px]">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_.95fr]">
              <SourceProvenanceCard sources={view.sources} />
              <ExtractedFactsCard
                facts={visibleFacts}
                editing={isEditing}
                onEdit={beginEditing}
                onChange={(field, value) =>
                  setDraftFacts((current) => ({ ...current, [field]: value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[.9fr_1.1fr]">
              <AiSummaryCard summary={view.summary} />
              <AttributesScoresCard facts={view.facts} scoreRows={view.scoreRows} />
            </div>

            <PreReviewAssessmentCard assessment={view.preReviewAssessment} />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[.9fr_1.1fr]">
              <AnalystNotesCard />
              <InternalTagsCard tags={view.tags} />
            </div>
          </div>

          <div className="space-y-5">
            <ProvenanceValidationCard rows={view.validationRows} />
            <ScoreExplanationsCard items={view.scoreExplanations} />
            <AuditTrailCard entries={view.auditTrail} />
            <SocialCommunityCard />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CandidateHeroCard({
  candidate,
  fields,
}: {
  candidate: CandidateDetailData["candidate"];
  fields: HeroField[];
}) {
  return (
    <Panel>
      <div className="p-5 lg:p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
            Candidate Headline
          </div>
          <Info className="h-3.5 w-3.5 text-text-muted" />
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <h2 className="min-w-0 flex-1 font-display text-[22px] font-semibold leading-tight tracking-tight lg:text-[24px]">
            {candidate.headline}
          </h2>
          <StatusBadge status={candidate.status} size="md" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-y-4 border-t border-hairline-soft pt-5 sm:grid-cols-3 xl:grid-cols-7 xl:gap-y-0">
          {fields.map((field, index) => (
            <div
              key={field.label}
              className={`min-w-0 pr-4 xl:px-4 ${index === 0 ? "xl:pl-0" : ""} ${
                index < fields.length - 1 ? "xl:border-r xl:border-hairline-soft" : ""
              }`}
            >
              <div className="mb-1.5 text-[9px] uppercase tracking-[0.12em] text-text-muted">
                {field.label}
              </div>
              <div className="flex items-start gap-2 text-[11.5px] font-medium text-text-primary">
                {field.mark ? <MiniMark tone={field.tone ?? "blue"} mark={field.mark} /> : null}
                <span className="leading-snug">{field.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ReviewStateCard({ reviewState }: { reviewState: CandidateDetailData["reviewState"] }) {
  return (
    <Panel className="h-full">
      <div className="p-5">
        <div className="mb-5 flex items-center gap-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
            Review State
          </div>
          <Info className="h-3.5 w-3.5 text-text-muted" />
        </div>
        <div className="space-y-4 text-[11.5px]">
          <ReviewRow
            label="Overall Status"
            value={<StatusBadge status={reviewState.status} size="xs" />}
          />
          <ReviewRow
            label="Assigned To"
            value={<span className="font-medium text-text-primary">{reviewState.assignedTo}</span>}
          />
          <ReviewRow
            label="Assigned On"
            value={<span className="text-text-primary">{reviewState.assignedOn}</span>}
          />
          <ReviewRow
            label="SLA"
            value={<span className="text-text-primary">{reviewState.sla}</span>}
          />
        </div>
      </div>
    </Panel>
  );
}

function SourceProvenanceCard({ sources }: { sources: SourceRow[] }) {
  return (
    <Panel>
      <SectionHeader number="1." title="Source Provenance" />
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-[10.5px]">
          <thead>
            <tr className="text-left text-[9px] uppercase tracking-[0.12em] text-text-muted">
              <th className="px-4 py-2 font-normal">#</th>
              <th className="py-2 pr-4 font-normal">Headline</th>
              <th className="py-2 pr-4 font-normal">Publisher</th>
              <th className="py-2 pr-4 font-normal">Published Date</th>
              <th className="py-2 pr-4 font-normal">Source Type</th>
              <th className="py-2 pr-4 font-normal">URL</th>
            </tr>
          </thead>
          <tbody>
            {sources.flatMap((source) => [
              <tr
                key={`source-${source.n}`}
                className="border-t border-hairline-soft align-top text-[10.5px]"
              >
                <td className="px-4 py-3 text-text-muted">{source.n}</td>
                <td className="py-3 pr-4 leading-relaxed text-text-primary">
                  <div className="max-w-[280px]">{source.headline}</div>
                </td>
                <td className="py-3 pr-4 text-text-secondary">{source.publisher}</td>
                <td className="py-3 pr-4 text-text-secondary">{source.date}</td>
                <td className="py-3 pr-4">
                  <TypeChip tone={source.tone} label={source.type} />
                </td>
                <td className="py-3 pr-4">
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted transition-colors hover:text-lime"
                      aria-label={`Open source: ${source.headline}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5" />
                  )}
                </td>
              </tr>,
              ...(source.corroborationEvidence ?? []).map((evidence) => (
                <tr
                  key={evidence.externalId}
                  className="border-t border-hairline-soft/60 bg-surface-2/20 align-top text-[10px]"
                >
                  <td className="px-4 py-2 text-text-muted">-&gt;</td>
                  <td className="py-2 pr-4 leading-relaxed text-text-secondary">
                    <div className="max-w-[280px]">{evidence.title}</div>
                  </td>
                  <td className="py-2 pr-4 text-text-muted">Firecrawl</td>
                  <td className="py-2 pr-4 text-text-muted">Cited during scan</td>
                  <td className="py-2 pr-4">
                    <TypeChip tone="teal" label="Corroboration" />
                  </td>
                  <td className="py-2 pr-4">
                    <a
                      href={evidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted transition-colors hover:text-lime"
                      aria-label={`Open corroborating source: ${evidence.title}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
      <div className="border-t border-hairline-soft px-4 py-3">
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary hover:bg-surface-hover">
          <Plus className="h-3.5 w-3.5" /> Add Source
        </button>
      </div>
    </Panel>
  );
}

function ExtractedFactsCard({
  facts,
  editing,
  onEdit,
  onChange,
}: {
  facts: FactRow[];
  editing: boolean;
  onEdit: () => void;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-3.5">
        <SectionTitle number="2." title="Extracted Facts" />
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary hover:bg-surface-hover"
        >
          <Edit3 className="h-3.5 w-3.5" /> Edit Facts
        </button>
      </div>
      <div className="divide-y divide-hairline-soft">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 px-4 py-2 text-[9px] uppercase tracking-[0.12em] text-text-muted">
          <div>Fact</div>
          <div>Value</div>
          <div>Status</div>
        </div>
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="grid grid-cols-[1fr_1fr_auto] gap-3 px-4 py-2.5 text-[11.5px]"
          >
            <div className="text-text-secondary">{fact.label}</div>
            <div className="text-text-primary">
              {editing ? (
                <input
                  value={fact.value}
                  onChange={(event) => onChange(fact.label, event.target.value)}
                  className="h-7 w-full min-w-0 rounded border border-hairline bg-surface-1 px-2 text-[11px] text-text-primary focus:border-lime/60 focus:outline-none"
                  aria-label={`Edit ${fact.label}`}
                />
              ) : (
                fact.value
              )}
            </div>
            <SourceChip source={fact.source} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AiSummaryCard({ summary }: { summary: CandidateDetailData["summary"] }) {
  return (
    <Panel>
      <div className="flex items-center gap-2 border-b border-hairline-soft px-4 py-3.5">
        <SectionTitle number="3." title="AI Relevance Summary" />
        <SourceChip source="ai" />
      </div>
      <div className="space-y-5 p-4 text-[11.5px] leading-relaxed text-text-secondary">
        <p>{summary.text}</p>
        <div>
          <div className="mb-3 text-[10.5px] font-medium text-text-primary">Key Reasons</div>
          <div className="space-y-3">
            {summary.reasons.map((reason) => (
              <div key={reason} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                <span className="text-text-primary">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PreReviewAssessmentCard({ assessment }: { assessment: PreReviewAssessment | null }) {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-hairline-soft px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-lime" />
          <div>
            <h3 className="text-[12px] font-semibold text-text-primary">Pre-review Assessment</h3>
            <p className="text-[10px] text-text-muted">
              Lightweight evidence framing to support the approval decision.
            </p>
          </div>
        </div>
      </div>
      {!assessment ? (
        <div className="p-5 text-[11px] leading-5 text-text-secondary">
          Assessment unavailable: the scan did not return a structured pre-review assessment.
        </div>
      ) : (
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden">
            <div className="min-w-0">
              <div className="mono mb-1 text-[9px] uppercase tracking-[0.14em] text-text-muted">
                Signal
              </div>
              <p className="text-[12px] font-medium leading-5 text-text-primary">
                {assessment.signal}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-hairline-soft px-5 py-4 lg:grid-cols-2">
            <AssessmentBlock label="Preliminary thesis" value={assessment.preliminaryThesis} />
            <AssessmentBlock label="Interesting because" value={assessment.interestingBecause} />
            <AssessmentBlock label="Counter-thesis" value={assessment.counterThesis} />
            <AssessmentBlock label="Confidence rationale" value={assessment.confidenceRationale} />
            <div>
              <div className="mono mb-1.5 text-[9px] uppercase tracking-[0.14em] text-text-muted">
                Missing evidence
              </div>
              {assessment.missingEvidence.length > 0 ? (
                <ul className="space-y-1.5 text-[11px] leading-5 text-text-secondary">
                  {assessment.missingEvidence.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-text-secondary">
                  No material evidence gaps were returned.
                </p>
              )}
            </div>
            <div>
              <div className="mono mb-1.5 text-[9px] uppercase tracking-[0.14em] text-text-muted">
                Evidence references
              </div>
              {assessment.evidenceRefs.length > 0 ? (
                <div className="space-y-2">
                  {assessment.evidenceRefs.map((item) => (
                    <div
                      key={item.claimId}
                      className="rounded-lg border border-hairline-soft bg-surface-1 p-3"
                    >
                      <div className="mb-1 flex items-center gap-2 text-[10px] font-medium text-text-primary">
                        <span className="rounded border border-lime/30 px-1.5 py-0.5 text-lime">
                          {item.claimId}
                        </span>
                        <span>{item.relation === "supports" ? "Supports" : "Contradicts"}</span>
                      </div>
                      <p className="text-[10.5px] leading-5 text-text-secondary">{item.claim}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-text-secondary">
                  No source claim was strong enough to reference.
                </p>
              )}
            </div>
          </div>
        </details>
      )}
    </Panel>
  );
}

function AssessmentBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono mb-1.5 text-[9px] uppercase tracking-[0.14em] text-text-muted">
        {label}
      </div>
      <p className="text-[11px] leading-5 text-text-secondary">{value}</p>
    </div>
  );
}

function AttributesScoresCard({ facts, scoreRows }: { facts: FactRow[]; scoreRows: ScoreRow[] }) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-3.5">
        <div className="flex items-center gap-2">
          <SectionTitle number="4." title="Attributes & Scores" />
          <span className="text-[9.5px] text-text-muted">(editable)</span>
        </div>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary hover:bg-surface-hover">
          <Edit3 className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      <div className="px-4 py-2">
        <div className="grid grid-cols-[160px_1fr_auto] gap-3 px-0 py-2 text-[9px] uppercase tracking-[0.12em] text-text-muted">
          <div>Attribute</div>
          <div>Value</div>
          <div>Status</div>
        </div>
        {facts
          .filter((fact) => ["Sector", "Deal Type", "AI Role", "Geography"].includes(fact.label))
          .map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[160px_1fr_auto] gap-3 border-t border-hairline-soft py-2.5 text-[11.5px]"
            >
              <div className="text-text-secondary">{item.label}</div>
              <div className="text-text-primary">{item.value}</div>
              <SourceChip source={item.source} />
            </div>
          ))}
      </div>
      <div className="border-t border-hairline-soft px-4 py-3">
        <div className="space-y-4">
          {scoreRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[160px_auto_1fr_auto] items-center gap-3"
            >
              <div className="flex items-center gap-1.5 text-[11.5px] text-text-secondary">
                {row.label}
                <Info className="h-3.5 w-3.5 text-text-muted" />
              </div>
              <ScoreRing value={row.value} />
              <div className="text-[10.5px] text-text-secondary">{row.helper}</div>
              <SourceChip source={row.source} />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function AnalystNotesCard() {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-3.5">
        <SectionTitle number="5." title="Analyst Notes" />
        <span className="text-[9.5px] text-text-muted">0 / 2000</span>
      </div>
      <div className="space-y-3 p-4">
        <textarea
          rows={4}
          placeholder="Add your notes here..."
          className="w-full resize-none rounded-md border border-hairline bg-surface-2 px-3 py-3 text-[11.5px] text-text-primary placeholder:text-text-muted focus:border-lime/40 focus:outline-none"
        />
        <div className="text-[9.5px] text-text-muted">
          These notes are internal and will not be shared externally.
        </div>
      </div>
    </Panel>
  );
}

function InternalTagsCard({ tags }: { tags: string[] }) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-3.5">
        <SectionTitle number="6." title="Internal Tags" />
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary hover:bg-surface-hover">
          <Plus className="h-3.5 w-3.5" /> Add Tag
        </button>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-hairline bg-surface-2 px-3 text-[10.5px] text-text-primary"
          >
            {tag}
            <X className="h-3 w-3 text-text-muted" />
          </span>
        ))}
      </div>
    </Panel>
  );
}

function ProvenanceValidationCard({ rows }: { rows: ValidationRow[] }) {
  return (
    <Panel>
      <div className="flex items-center gap-2 border-b border-hairline-soft px-4 py-3.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Provenance Validation
        </div>
        <Info className="h-3.5 w-3.5 text-text-muted" />
      </div>
      <div className="space-y-3 p-4 text-[10.5px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-lime" />
              {row.label}
            </span>
            <span className="text-lime">{row.value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ScoreExplanationsCard({ items }: { items: ScoreExplanation[] }) {
  return (
    <Panel>
      <div className="flex items-center gap-2 border-b border-hairline-soft px-4 py-3.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Score Explanations
        </div>
        <Info className="h-3.5 w-3.5 text-text-muted" />
      </div>
      <div className="space-y-4 p-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-1 text-text-secondary">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="text-[11.5px] font-medium text-text-primary">{item.title}</div>
              <div className="text-[10.5px] leading-relaxed text-text-secondary">{item.body}</div>
              {item.components.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {item.components.map((component) => (
                    <div
                      key={`${item.title}-${component.label}`}
                      className="text-[10px] leading-relaxed text-text-secondary"
                    >
                      <span className="text-text-primary">{component.label}</span>{" "}
                      <span className="mono text-lime">+{component.points}</span>{" "}
                      <span>{component.rationale}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AuditTrailCard({ entries }: { entries: AuditTrailEntry[] }) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-3.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Audit Trail
        </div>
        <button className="text-[10.5px] text-text-secondary hover:text-lime">View all</button>
      </div>
      <div className="space-y-4 p-4">
        {entries.map((item) => (
          <div key={`${item.name}-${item.action}-${item.when}`} className="flex items-start gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[9.5px] font-semibold"
              style={
                item.tone === "system"
                  ? {
                      background: "rgba(183,241,55,0.10)",
                      borderColor: "rgba(183,241,55,0.35)",
                      color: "#B7F137",
                    }
                  : {
                      background: "rgba(77,157,255,0.12)",
                      borderColor: "rgba(77,157,255,0.35)",
                      color: "#E8EDF3",
                    }
              }
            >
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] text-text-primary">
                <span className="font-medium">{item.name}</span> {item.action}
              </div>
              <div className="text-[10px] text-text-secondary">{item.detail}</div>
            </div>
            <div className="text-[9.5px] text-text-muted">{item.when}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SocialCommunityCard() {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
            Social / Community Enrichment
          </div>
        </div>
        <span className="rounded-md border border-hairline-soft px-2 py-1 text-[9.5px] text-text-muted">
          Secondary Signal
        </span>
      </div>
      <div className="space-y-3 p-4 text-[10.5px] text-text-secondary">
        <div>No social enrichment available.</div>
        <div className="leading-relaxed">
          Social and community data are not primary intake paths and are not required for review.
        </div>
      </div>
    </Panel>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="border-b border-hairline-soft px-4 py-3.5">
      <SectionTitle number={number} title={title} />
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10.5px] text-text-muted">{number}</span>
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
        {title}
      </span>
      <Info className="h-3.5 w-3.5 text-text-muted" />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-text-secondary">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function MiniMark({ tone, mark }: { tone: string; mark: string }) {
  const style =
    tone === "teal"
      ? {
          background: "linear-gradient(135deg, rgba(45,212,191,0.30), rgba(45,212,191,0.12))",
          border: "1px solid rgba(45,212,191,0.35)",
          color: "#7CE7D4",
        }
      : {
          background: "linear-gradient(135deg, rgba(77,157,255,0.30), rgba(77,157,255,0.12))",
          border: "1px solid rgba(77,157,255,0.35)",
          color: "#BBD7FF",
        };

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10.5px] font-semibold"
      style={style}
    >
      {mark}
    </span>
  );
}

function TypeChip({ tone, label }: { tone: string; label: string }) {
  const style =
    tone === "purple"
      ? {
          color: "#B497FF",
          background: "rgba(140,105,255,0.14)",
          border: "1px solid rgba(140,105,255,0.30)",
        }
      : {
          color: "#6CB8FF",
          background: "rgba(77,157,255,0.14)",
          border: "1px solid rgba(77,157,255,0.30)",
        };

  return (
    <span className="rounded px-1.5 py-0.5 text-[9px]" style={style}>
      {label}
    </span>
  );
}

function SourceChip({ source }: { source: "ai" | "human" | "rubric" }) {
  if (source === "human") {
    return (
      <span
        className="inline-flex h-5 items-center gap-1 rounded px-1.5 text-[9px] font-medium"
        style={{
          color: "#F5A524",
          background: "rgba(245,165,36,0.10)",
          border: "1px solid rgba(245,165,36,0.30)",
        }}
      >
        <User className="h-3 w-3" /> Human edited
      </span>
    );
  }

  if (source === "rubric") {
    return (
      <span
        className="inline-flex h-5 items-center gap-1 rounded px-1.5 text-[9px] font-medium"
        style={{
          color: "#8EEA45",
          background: "rgba(142,234,69,0.10)",
          border: "1px solid rgba(142,234,69,0.30)",
        }}
      >
        <CheckCircle2 className="h-3 w-3" /> Rubric v1
      </span>
    );
  }

  return (
    <span
      className="inline-flex h-5 items-center gap-1 rounded px-1.5 text-[9px] font-medium"
      style={{
        color: "#8EEA45",
        background: "rgba(142,234,69,0.10)",
        border: "1px solid rgba(142,234,69,0.30)",
      }}
    >
      <Bot className="h-3 w-3" /> AI draft
    </span>
  );
}

function ScoreRing({ value }: { value: number }) {
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-[10.5px] font-semibold"
      style={{
        background: "rgba(183,241,55,0.10)",
        border: "1px solid rgba(183,241,55,0.35)",
        color: "#B7F137",
      }}
    >
      {value}
    </div>
  );
}
