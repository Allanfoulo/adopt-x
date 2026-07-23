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
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) {
      return emptyQueue();
    }

    const limit = Math.min(args.limit ?? 100, 200);
    const candidates = await ctx.db
      .query("dealCandidates")
      .withIndex("by_workspaceId_and_updatedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(limit);
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
      tabs: countByStatus(candidates),
      rows: candidates.map((candidate) => candidateRow(candidate)),
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
      queueSummary: countByStatus(candidates),
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
        showingStart: candidates.length > 0 ? 1 : 0,
        showingEnd: Math.min(candidates.length, 10),
        total: candidates.length,
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
    pagination: { showingStart: 0, showingEnd: 0, total: 0 },
  };
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

function auditRow(
  event: Doc<"reviewAuditEvents">,
  usersById: Map<Id<"users">, Doc<"users">>,
) {
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
  return run.status === "running" ? `Started ${formatDateLabel(run.startedAt)}` : formatDateLabel(run.startedAt);
}
