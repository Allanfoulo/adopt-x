import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  candidateStatusLabels,
  countByStatus,
  emptyQueueCounts,
  formatDateLabel,
  getDemoWorkspaceId,
  titleCase,
} from "./model";

export const getQueue = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    sector: v.optional(v.string()),
    geography: v.optional(v.string()),
    dealType: v.optional(v.string()),
    status: v.optional(v.string()),
    sourceClass: v.optional(v.string()),
    scorePreset: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) {
      return emptyQueue();
    }

    const page = Math.max(1, Math.floor(args.page ?? 1));
    const pageSize = Math.min(Math.max(Math.floor(args.pageSize ?? 10), 1), 100);
    const candidates = await ctx.db
      .query("dealCandidates")
      .withIndex("by_workspaceId_and_updatedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(1000);

    const sourceClassesByCandidate = new Map<Id<"dealCandidates">, Set<string>>();
    if (args.sourceClass) {
      for (const candidate of candidates) {
        const links = await ctx.db
          .query("candidateSourceLinks")
          .withIndex("by_workspaceId_and_candidateId", (q) =>
            q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
          )
          .take(12);
        const sourceClasses = new Set<string>();
        for (const link of links) {
          const source = await ctx.db.get(link.sourceHitId);
          if (source) sourceClasses.add(source.sourceClass);
        }
        sourceClassesByCandidate.set(candidate._id, sourceClasses);
      }
    }

    const normalizedSearch = args.search?.trim().toLowerCase();
    const baseFilteredCandidates = candidates.filter((candidate) => {
      const searchable = [
        candidate.company,
        candidate.target,
        candidate.sector,
        candidate.geography,
        candidate.dealType,
        candidate.aiRole,
      ]
        .join(" ")
        .toLowerCase();
      if (normalizedSearch && !searchable.includes(normalizedSearch)) return false;
      if (!matchesFilter(candidate.sector, args.sector)) return false;
      if (!matchesFilter(candidate.geography, args.geography)) return false;
      if (!matchesFilter(candidate.dealType, args.dealType)) return false;
      if (args.scorePreset === "confidence_70" && candidate.confidenceScore < 70) return false;
      if (args.scorePreset === "thesis_70" && candidate.thesisFitScore < 70) return false;
      if (args.scorePreset === "source_70" && candidate.sourceConfidence < 70) return false;
      if (args.sourceClass && !sourceClassesByCandidate.get(candidate._id)?.has(args.sourceClass)) {
        return false;
      }
      return true;
    });
    const filteredCandidates = args.status
      ? baseFilteredCandidates.filter((candidate) => matchesFilter(candidate.status, args.status))
      : baseFilteredCandidates;
    const startIndex = (page - 1) * pageSize;
    const pagedCandidates = filteredCandidates.slice(startIndex, startIndex + pageSize);
    const scanRuns = await ctx.db
      .query("scanRuns")
      .withIndex("by_workspaceId_and_startedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(6);
    const briefRuns = await ctx.db
      .query("briefRuns")
      .withIndex("by_workspaceId_and_startedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(6);
    const auditEvents = await ctx.db
      .query("reviewAuditEvents")
      .withIndex("by_workspaceId_and_createdAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(6);
    const users = await ctx.db
      .query("users")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .take(20);

    const usersById = new Map(users.map((user) => [user._id, user]));
    const latestScan = scanRuns[0] ?? null;
    const latestBriefRun = briefRuns[0] ?? null;

    return {
      tabs: countByStatus(baseFilteredCandidates),
      rows: pagedCandidates.map((candidate) => candidateRow(candidate)),
      summaryCards: [
        {
          label: "Latest Scan",
          status: latestScan ? titleCase(latestScan.status) : "Empty",
          time: latestScan ? formatDateLabel(latestScan.startedAt) : "No scan yet",
          cta: "View scans",
        },
        {
          label: "Latest Brief Run",
          status: latestBriefRun ? titleCase(latestBriefRun.status) : "Empty",
          time: latestBriefRun ? runTimeLabel(latestBriefRun) : "No brief run yet",
          cta: "View runs",
        },
      ],
      queueSummary: countByStatus(baseFilteredCandidates),
      operationalRuns: {
        runs: {
          scans: scanRuns.map((run) => runRow(run)),
          briefs: briefRuns.map((run) => runRow(run)),
        },
        activity: auditEvents.slice(0, 4).map((event) => ({
          id: event._id,
          label: titleCase(event.action),
          meta: event.correlationId,
          when: formatDateLabel(event.createdAt),
        })),
      },
      auditTrail: auditEvents.map((event) => auditRow(event, usersById)),
      pagination: {
        showingStart: filteredCandidates.length > 0 ? startIndex + 1 : 0,
        showingEnd: Math.min(startIndex + pagedCandidates.length, filteredCandidates.length),
        total: filteredCandidates.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(filteredCandidates.length / pageSize)),
      },
    };
  },
});

function emptyQueue() {
  return {
    tabs: emptyQueueCounts(),
    rows: [],
    summaryCards: [
      { label: "Latest Scan", status: "Empty", time: "No scan yet", cta: "View scans" },
      { label: "Latest Brief Run", status: "Empty", time: "No brief run yet", cta: "View runs" },
    ],
    queueSummary: emptyQueueCounts(),
    operationalRuns: {
      runs: { scans: [], briefs: [] },
      activity: [],
    },
    auditTrail: [],
    pagination: { showingStart: 0, showingEnd: 0, total: 0, page: 1, pageSize: 10, totalPages: 1 },
  };
}

function matchesFilter(value: string, filter?: string) {
  return !filter || value.trim().toLowerCase() === filter.trim().toLowerCase();
}

function candidateRow(candidate: Doc<"dealCandidates">) {
  return {
    id: candidate.externalId,
    candidateId: candidate._id,
    company: candidate.company,
    target: candidate.target || "N/A",
    sector: titleCase(candidate.sector),
    geography: candidate.geography,
    dealType: titleCase(candidate.dealType),
    aiRole: titleCase(candidate.aiRole),
    confidence: candidate.confidenceScore,
    thesisFit: candidate.thesisFitScore,
    sourceConfidence: candidate.sourceConfidence,
    published: formatDateLabel(candidate.announcementDate),
    status: candidateStatusLabels[candidate.status],
  };
}

function runRow(run: Doc<"scanRuns"> | Doc<"briefRuns">) {
  return {
    id: run.externalRunId,
    status: titleCase(run.status),
    when: formatDateLabel(run.startedAt),
  };
}

function auditRow(event: Doc<"reviewAuditEvents">, usersById: Map<Id<"users">, Doc<"users">>) {
  const actor = event.actorUserId ? usersById.get(event.actorUserId) : null;
  return {
    actor: actor?.displayName ?? titleCase(event.actorType),
    initials: actor?.avatarInitials ?? "AX",
    action: titleCase(event.action),
    target: event.after ?? event.before ?? event.correlationId,
    detail: event.reason ?? "",
    when: formatDateLabel(event.createdAt),
    system: event.actorType === "system",
  };
}

function runTimeLabel(run: Doc<"scanRuns"> | Doc<"briefRuns">) {
  return run.status === "running"
    ? `Started ${formatDateLabel(run.startedAt)}`
    : formatDateLabel(run.startedAt);
}
