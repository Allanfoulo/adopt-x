import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  average,
  candidateStatusLabels,
  countByField,
  countByStatus,
  emptyQueueCounts,
  formatDateLabel,
  getDemoWorkspaceId,
  titleCase,
} from "./model";

export const getSummary = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) {
      return emptySummary();
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
      .take(8);
    const briefRuns = await ctx.db
      .query("briefRuns")
      .withIndex("by_workspaceId_and_startedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(8);
    const auditEvents = await ctx.db
      .query("reviewAuditEvents")
      .withIndex("by_workspaceId_and_createdAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(8);
    const users = await ctx.db
      .query("users")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .take(20);

    const usersById = new Map(users.map((user) => [user._id, user]));
    const latestScan = scanRuns[0] ?? null;
    const latestBriefRun = briefRuns[0] ?? null;
    const needsAttention = candidates
      .filter((candidate) => ["pending_review", "brief_failed", "rejected"].includes(candidate.status))
      .slice(0, 5)
      .map((candidate) => candidateRow(candidate));
    const recentApprovals = candidates
      .filter((candidate) => ["approved", "brief_queued", "brief_ready"].includes(candidate.status))
      .slice(0, 5)
      .map((candidate) => ({
        id: candidate._id,
        company: candidate.company,
        target: candidate.target || titleCase(candidate.sector),
        sector: titleCase(candidate.sector),
        status: candidateStatusLabels[candidate.status],
        approvedBy:
          candidate.approvedByUserId && usersById.get(candidate.approvedByUserId)
            ? usersById.get(candidate.approvedByUserId)!.displayName
            : "Maya Patel",
        time: formatDateLabel(candidate.updatedAt),
      }));

    return {
      queueCounts: countByStatus(candidates),
      latestScan: latestScan ? runSummary(latestScan) : null,
      latestBriefGeneration: latestBriefRun ? runSummary(latestBriefRun) : null,
      sectorDistribution: countByField(candidates, (candidate) => titleCase(candidate.sector)).map(
        (item) => ({
          ...item,
          sourceConfidence: average(
            candidates
              .filter((candidate) => titleCase(candidate.sector) === item.label)
              .map((candidate) => candidate.sourceConfidence),
          ),
        }),
      ),
      needsAttention,
      recentApprovals,
      recentQueueActivity: candidates.slice(0, 8).map((candidate) => ({
        id: candidate._id,
        time: formatDateLabel(candidate.updatedAt),
        company: candidate.company,
        target: candidate.target || "N/A",
        sector: titleCase(candidate.sector),
        dealType: titleCase(candidate.dealType),
        status: candidateStatusLabels[candidate.status],
        assignedTo:
          candidate.assignedToUserId && usersById.get(candidate.assignedToUserId)
            ? usersById.get(candidate.assignedToUserId)!.displayName
            : "Unassigned",
      })),
      operationalRuns: [
        ...scanRuns.map((run) => ({
          id: run.externalRunId,
          type: "Full Scan",
          status: titleCase(run.status),
          started: formatDateLabel(run.startedAt),
          duration: durationLabel(run.startedAt, run.completedAt),
        })),
        ...briefRuns.map((run) => ({
          id: run.externalRunId,
          type: "Brief Gen",
          status: titleCase(run.status),
          started: formatDateLabel(run.startedAt),
          duration: durationLabel(run.startedAt, run.completedAt),
        })),
      ].slice(0, 8),
      auditTrail: auditEvents.map((event) => auditRow(event, usersById)),
      refresh: {
        lastRefreshedAt: latestScan?.completedAt ?? latestScan?.startedAt ?? null,
        label: latestScan?.completedAt ? formatDateLabel(latestScan.completedAt) : "No scan yet",
      },
    };
  },
});

function emptySummary() {
  return {
    queueCounts: emptyQueueCounts(),
    latestScan: null,
    latestBriefGeneration: null,
    sectorDistribution: [],
    needsAttention: [],
    recentApprovals: [],
    recentQueueActivity: [],
    operationalRuns: [],
    auditTrail: [],
    refresh: { lastRefreshedAt: null, label: "No data seeded" },
  };
}

function candidateRow(candidate: Doc<"dealCandidates">) {
  return {
    id: candidate._id,
    company: candidate.company,
    target: candidate.target || "N/A",
    sector: titleCase(candidate.sector),
    issue:
      candidate.status === "brief_failed"
        ? "Brief generation failed"
        : candidate.status === "rejected"
          ? candidate.rejectionReason ?? "Rejected during analyst review"
          : candidate.reasoningSummary ?? "Needs analyst review",
    status: candidateStatusLabels[candidate.status],
    age: formatDateLabel(candidate.updatedAt),
    confidenceScore: candidate.confidenceScore,
    thesisFitScore: candidate.thesisFitScore,
    sourceConfidence: candidate.sourceConfidence,
  };
}

function runSummary(run: Doc<"scanRuns"> | Doc<"briefRuns">) {
  return {
    id: run.externalRunId,
    status: titleCase(run.status),
    timestamp: formatDateLabel(run.startedAt),
    completedAt: run.completedAt ?? null,
  };
}

function auditRow(
  event: Doc<"reviewAuditEvents">,
  usersById: Map<Id<"users">, Doc<"users">>,
) {
  const actor = event.actorUserId ? usersById.get(event.actorUserId) : null;
  return {
    id: event._id,
    actor: actor?.displayName ?? titleCase(event.actorType),
    initials: actor?.avatarInitials ?? "AX",
    action: titleCase(event.action),
    detail: event.reason ?? "",
    when: formatDateLabel(event.createdAt),
  };
}

function durationLabel(startedAt: number, completedAt?: number) {
  if (!completedAt) {
    return "Running";
  }
  const seconds = Math.max(0, Math.round((completedAt - startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
