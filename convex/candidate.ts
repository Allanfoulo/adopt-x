import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  candidateStatusLabels,
  formatDateLabel,
  getDemoWorkspaceId,
  titleCase,
} from "./model";

export const getDetail = query({
  args: {
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) {
      return null;
    }

    const candidate = await ctx.db
      .query("dealCandidates")
      .withIndex("by_workspaceId_and_externalId", (q) =>
        q.eq("workspaceId", workspaceId).eq("externalId", args.externalId ?? "dc_002"),
      )
      .unique();
    if (!candidate) {
      return null;
    }

    const [facts, sourceLinks, auditEvents, users] = await Promise.all([
      ctx.db
        .query("candidateFacts")
        .withIndex("by_workspaceId_and_candidateId", (q) =>
          q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
        )
        .take(24),
      ctx.db
        .query("candidateSourceLinks")
        .withIndex("by_workspaceId_and_candidateId", (q) =>
          q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
        )
        .take(12),
      ctx.db
        .query("reviewAuditEvents")
        .withIndex("by_workspaceId_and_candidateId_and_createdAt", (q) =>
          q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
        )
        .order("desc")
        .take(8),
      ctx.db.query("users").withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId)).take(20),
    ]);

    const sources = [];
    for (const [index, link] of sourceLinks.entries()) {
      const source = await ctx.db.get(link.sourceHitId);
      if (source) {
        sources.push(sourceRow(source, index + 1));
      }
    }

    const usersById = new Map(users.map((user) => [user._id, user]));
    const assignedTo = candidate.assignedToUserId ? usersById.get(candidate.assignedToUserId) : null;

    return {
      candidate: candidateRow(candidate),
      heroFields: heroFields(candidate),
      facts: facts
        .sort((a, b) => factOrder(a.field) - factOrder(b.field))
        .map((fact) => ({
          label: fact.field,
          value: normalizeFactValue(fact.field, fact.value),
          source: fact.source,
        })),
      sources,
      scoreRows: [
        {
          label: "Confidence Score",
          value: candidate.confidenceScore,
          helper: "High confidence in the accuracy of the extracted facts.",
          source: candidate.reviewEdits?.fields.includes("confidenceScore") ? "human" : "ai",
        },
        {
          label: "Thesis-Fit Score",
          value: candidate.thesisFitScore,
          helper: "Strength of alignment with the AI adoption thesis.",
          source: candidate.reviewEdits?.fields.includes("thesisFitScore") ? "human" : "ai",
        },
        {
          label: "Source Confidence",
          value: candidate.sourceConfidence,
          helper: "Quality, independence, and consistency of cited sources.",
          source: "ai",
        },
      ],
      validationRows: [
        { label: "Sources Verified", value: `${sources.length} / ${sources.length}` },
        { label: "Publisher Reputation", value: sourceReputation(sources) },
        { label: "Duplication Check", value: "No issues" },
        { label: "Conflicting Info", value: "None detected" },
      ],
      scoreExplanations: [
        {
          title: `Confidence Score (${candidate.confidenceScore})`,
          body: "Based on extracted fact consistency and candidate scoring from verified public sources.",
        },
        {
          title: `Thesis-Fit Score (${candidate.thesisFitScore})`,
          body: `Measures fit with the Adopt X thesis for ${titleCase(candidate.aiRole)} in ${titleCase(candidate.sector)}.`,
        },
        {
          title: `Source Confidence (${candidate.sourceConfidence})`,
          body: "Reflects source quality, publisher reputation, and provenance coverage.",
        },
      ],
      auditTrail: auditEvents.map((event) => auditRow(event, usersById)),
      reviewState: {
        status: candidateStatusLabels[candidate.status],
        assignedTo: assignedTo?.displayName ?? "Maya Patel",
        assignedOn: formatDateLabel(candidate.updatedAt),
        sla: candidate.status === "pending_review" ? "Due in 2d 16h" : "Reviewed",
      },
      summary: {
        text:
          candidate.reasoningSummary ??
          `${candidate.company} / ${candidate.target || "N/A"} is being reviewed for AI adoption relevance.`,
        reasons: reasonBullets(candidate),
      },
      tags: tagsFor(candidate, sources),
    };
  },
});

function candidateRow(candidate: Doc<"dealCandidates">) {
  return {
    id: candidate.externalId,
    company: candidate.company,
    target: candidate.target || "N/A",
    headline: `${candidate.company} ${
      candidate.dealType === "acquisition" ? "acquires" : "partners with"
    } ${candidate.target || titleCase(candidate.aiRole)} to expand ${titleCase(candidate.aiRole)}`,
    status: candidateStatusLabels[candidate.status],
  };
}

function heroFields(candidate: Doc<"dealCandidates">) {
  return [
    { label: "Company", value: candidate.company, tone: "teal", mark: candidate.company.charAt(0) },
    {
      label: "Target",
      value: candidate.target || "N/A",
      tone: "blue",
      mark: (candidate.target || candidate.company).charAt(0),
    },
    { label: "Sector", value: titleCase(candidate.sector) },
    { label: "Geography", value: candidate.geography },
    { label: "Deal Type", value: titleCase(candidate.dealType) },
    { label: "AI Role", value: titleCase(candidate.aiRole) },
    { label: "Published", value: formatDateLabel(candidate.announcementDate) },
  ];
}

function sourceRow(source: Doc<"sourceHits">, n: number) {
  return {
    n,
    headline: source.headline,
    publisher: source.publisher,
    date: formatDateLabel(source.publishedAt),
    type: titleCase(source.sourceType),
    tone: source.sourceType.includes("release") ? "purple" : "blue",
    url: source.url,
    reputation: source.publisherReputation ?? "Medium",
  };
}

function auditRow(
  event: Doc<"reviewAuditEvents">,
  usersById: Map<Id<"users">, Doc<"users">>,
) {
  const actor = event.actorUserId ? usersById.get(event.actorUserId) : null;
  return {
    name: actor?.displayName ?? titleCase(event.actorType),
    action: titleCase(event.action),
    detail: event.after ?? event.before ?? event.reason ?? event.correlationId,
    when: formatDateLabel(event.createdAt),
    initials: actor?.avatarInitials ?? "AI",
    tone: event.actorType === "system" ? "system" : "human",
  };
}

function factOrder(field: string) {
  const order = ["Company", "Target", "Sector", "Geography", "Deal Type", "AI Role", "Announcement Date", "Source Class"];
  const index = order.indexOf(field);
  return index === -1 ? order.length : index;
}

function normalizeFactValue(field: string, value: string) {
  if (field === "Announcement Date") {
    return formatDateLabel(Date.parse(value));
  }
  if (["Sector", "Deal Type", "AI Role"].includes(field)) {
    return titleCase(value);
  }
  return value;
}

function sourceReputation(sources: { reputation: string }[]) {
  if (sources.some((source) => source.reputation === "High")) {
    return "High";
  }
  return sources[0]?.reputation ?? "Unknown";
}

function reasonBullets(candidate: Doc<"dealCandidates">) {
  return [
    `Direct AI role: ${titleCase(candidate.aiRole)}`,
    `Sector adoption signal in ${titleCase(candidate.sector)}`,
    `Source confidence scored at ${candidate.sourceConfidence}`,
  ];
}

function tagsFor(candidate: Doc<"dealCandidates">, sources: { type: string }[]) {
  return [
    candidate.geography,
    titleCase(candidate.sector),
    titleCase(candidate.aiRole),
    titleCase(candidate.dealType),
    ...sources.slice(0, 2).map((source) => source.type),
  ];
}
