import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  average,
  countByField,
  countByStatus,
  formatDateLabel,
  getDemoWorkspaceId,
  titleCase,
} from "./model";

export const getInsights = query({
  args: {
    limit: v.optional(v.number()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    compareStartAt: v.optional(v.number()),
    compareEndAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) {
      return emptyInsights();
    }

    const limit = Math.min(args.limit ?? 100, 200);
    const allCandidates = await ctx.db
      .query("dealCandidates")
      .withIndex("by_workspaceId_and_updatedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(limit);
    const allBriefs = await ctx.db
      .query("dealBriefs")
      .withIndex("by_workspaceId_and_updatedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(limit);
    const candidates = allCandidates.filter((candidate) => inRange(candidate.announcementDate, args.startAt, args.endAt));
    const previousCandidates = allCandidates.filter((candidate) => inRange(candidate.announcementDate, args.compareStartAt, args.compareEndAt));
    const briefs = allBriefs.filter((brief) => inRange(brief.approvedAt ?? brief.updatedAt, args.startAt, args.endAt));
    const previousBriefs = allBriefs.filter((brief) => inRange(brief.approvedAt ?? brief.updatedAt, args.compareStartAt, args.compareEndAt));
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

    return {
      kpis: {
        totalCandidates: candidates.length,
        approvedBriefs: briefs.filter((brief) => brief.status === "approved").length,
        pendingReview: candidates.filter((candidate) => candidate.status === "pending_review").length,
        briefReady: candidates.filter((candidate) => candidate.status === "brief_ready").length,
        averageSourceConfidence: average(candidates.map((candidate) => candidate.sourceConfidence)),
        averageThesisFit: average(candidates.map((candidate) => candidate.thesisFitScore)),
        deltas: {
          totalCandidates: percentageDelta(candidates.length, previousCandidates.length),
          approvedBriefs: percentageDelta(
            briefs.filter((brief) => brief.status === "approved").length,
            previousBriefs.filter((brief) => brief.status === "approved").length,
          ),
          pendingReview: percentageDelta(
            candidates.filter((candidate) => candidate.status === "pending_review").length,
            previousCandidates.filter((candidate) => candidate.status === "pending_review").length,
          ),
          briefReady: percentageDelta(
            candidates.filter((candidate) => candidate.status === "brief_ready").length,
            previousCandidates.filter((candidate) => candidate.status === "brief_ready").length,
          ),
          averageSourceConfidence: percentageDelta(
            average(candidates.map((candidate) => candidate.sourceConfidence)),
            average(previousCandidates.map((candidate) => candidate.sourceConfidence)),
          ),
          averageThesisFit: percentageDelta(
            average(candidates.map((candidate) => candidate.thesisFitScore)),
            average(previousCandidates.map((candidate) => candidate.thesisFitScore)),
          ),
        },
      },
      distributions: {
        sectors: distribution(candidates, (candidate) => titleCase(candidate.sector)),
        dealTypes: distribution(candidates, (candidate) => titleCase(candidate.dealType)),
        geographies: distribution(candidates, (candidate) => candidate.geography),
        aiRoles: distribution(candidates, (candidate) => titleCase(candidate.aiRole)),
      },
      trends: {
        candidates: trend(candidates, (candidate) => candidate.announcementDate),
        previousCandidates: trend(previousCandidates, (candidate) => candidate.announcementDate),
        approvedBriefs: trend(
          briefs.filter((brief) => brief.status === "approved"),
          (brief) => brief.approvedAt ?? brief.updatedAt,
        ),
        previousApprovedBriefs: trend(
          previousBriefs.filter((brief) => brief.status === "approved"),
          (brief) => brief.approvedAt ?? brief.updatedAt,
        ),
      },
      queueHealth: countByStatus(candidates).map((item) => ({
        ...item,
        delta: 0,
      })),
      queueAging: [
        { label: "0-24h", value: candidates.filter((candidate) => candidate.status === "pending_review").length },
        { label: "24-72h", value: candidates.filter((candidate) => candidate.status === "brief_queued").length },
        { label: "72h+", value: candidates.filter((candidate) => candidate.status === "brief_failed").length },
      ],
      operationalRuns: {
        scans: scanRuns.map((run) => runLine(run)),
        briefs: briefRuns.map((run) => runLine(run)),
      },
      auditEvents: auditEvents.map((event) => ({
        id: event._id,
        action: titleCase(event.action),
        target: event.reason ?? "",
        when: formatDateLabel(event.createdAt),
      })),
      insights: insightCopy(candidates),
    };
  },
});

function emptyInsights() {
  return {
    kpis: {
      totalCandidates: 0,
      approvedBriefs: 0,
      pendingReview: 0,
      briefReady: 0,
      averageSourceConfidence: 0,
      averageThesisFit: 0,
      deltas: {
        totalCandidates: null,
        approvedBriefs: null,
        pendingReview: null,
        briefReady: null,
        averageSourceConfidence: null,
        averageThesisFit: null,
      },
    },
    distributions: {
      sectors: [],
      dealTypes: [],
      geographies: [],
      aiRoles: [],
    },
    trends: {
      candidates: [],
      previousCandidates: [],
      approvedBriefs: [],
      previousApprovedBriefs: [],
    },
    queueHealth: [],
    queueAging: [],
    operationalRuns: {
      scans: [],
      briefs: [],
    },
    auditEvents: [],
    insights: [],
  };
}

function inRange(timestamp: number, startAt?: number, endAt?: number) {
  return (startAt === undefined || timestamp >= startAt) && (endAt === undefined || timestamp < endAt);
}

function percentageDelta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function distribution(
  candidates: Doc<"dealCandidates">[],
  getValue: (candidate: Doc<"dealCandidates">) => string,
) {
  const rows = countByField(candidates, getValue);
  const total = Math.max(1, candidates.length);
  return rows.map((row) => ({
    ...row,
    percentage: Math.round((row.value / total) * 100),
  }));
}

function trend<T>(rows: T[], getTimestamp: (row: T) => number) {
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
      getTimestamp(row),
    );
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => Date.parse(`${a.label}, 2026`) - Date.parse(`${b.label}, 2026`));
}

function runLine(run: Doc<"scanRuns"> | Doc<"briefRuns">) {
  return {
    id: run.externalRunId,
    status: titleCase(run.status),
    when: formatDateLabel(run.startedAt),
  };
}

function insightCopy(candidates: Doc<"dealCandidates">[]) {
  if (candidates.length === 0) {
    return [];
  }

  const sectorRows = distribution(candidates, (candidate) => titleCase(candidate.sector));
  const topSector = sectorRows[0];
  const readyCount = candidates.filter((candidate) =>
    ["approved", "brief_queued", "brief_ready"].includes(candidate.status),
  ).length;
  const reviewCount = candidates.filter((candidate) => candidate.status === "pending_review").length;

  return [
    `${topSector?.label ?? "Tracked sectors"} currently leads adoption volume across the seeded candidate set.`,
    `${readyCount} candidates have moved past review into approved or brief workflow states.`,
    `${reviewCount} candidates remain in human review and should be checked before brief generation.`,
  ];
}
