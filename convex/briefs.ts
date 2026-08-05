import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { formatDateLabel, getDemoWorkspaceId, titleCase, WORKSPACE_SLUG } from "./model";

export const queue = mutation({
  args: { externalIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    if (args.externalIds.length === 0) throw new Error("Select at least one candidate");
    if (args.externalIds.length > 50) throw new Error("A brief run may contain at most 50 candidates");

    const workspace = await getWorkspace(ctx);
    const now = Date.now();
    const runId = `brief-${now}-${args.externalIds.length}`;
    const queued: string[] = [];

    for (const externalId of [...new Set(args.externalIds)]) {
      const candidate = await ctx.db
        .query("dealCandidates")
        .withIndex("by_workspaceId_and_externalId", (q) =>
          q.eq("workspaceId", workspace._id).eq("externalId", externalId),
        )
        .unique();
      if (!candidate) continue;

      const briefRunId = await ctx.db.insert("briefRuns", {
        workspaceId: workspace._id,
        candidateId: candidate._id,
        externalRunId: runId,
        status: "queued",
        last30daysUsed: false,
        startedAt: now,
        createdAt: now,
      });
      await ctx.db.patch(candidate._id, { status: "brief_queued", updatedAt: now });
      await ctx.scheduler.runAfter(
        queued.length * 250,
        internal.briefs.generateCandidate,
        { briefRunId },
      );
      queued.push(externalId);
    }

    if (queued.length === 0) throw new Error("No selected candidates were found");
    return { runId, queued: queued.length };
  },
});

export const getRuns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) return [];

    const rows = await ctx.db
      .query("briefRuns")
      .withIndex("by_workspaceId_and_startedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(Math.min(args.limit ?? 100, 200));
    const grouped = new Map<string, Doc<"briefRuns">[]>();
    for (const row of rows) {
      const batch = grouped.get(row.externalRunId) ?? [];
      batch.push(row);
      grouped.set(row.externalRunId, batch);
    }

    return [...grouped.entries()].map(([id, batch]) => {
      const completed = batch.filter((row) => row.status === "completed").length;
      const failed = batch.filter((row) => row.status === "failed").length;
      const running = batch.some((row) => row.status === "running");
      const status = failed > 0 && completed + failed === batch.length
        ? "Partial Failed"
        : completed === batch.length
          ? "Completed"
          : running
            ? "Running"
            : "Queued";
      return {
        id,
        status,
        when: formatDateLabel(batch[0].startedAt),
        total: batch.length,
        completed,
        failed,
        remaining: batch.length - completed - failed,
        progress: Math.round(((completed + failed) / batch.length) * 100),
        error: batch.find((row) => row.error)?.error ?? null,
      };
    });
  },
});

export const getRunDetails = query({
  args: { externalRunId: v.string() },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) return null;

    const rows = await ctx.db
      .query("briefRuns")
      .withIndex("by_workspaceId_and_externalRunId", (q) =>
        q.eq("workspaceId", workspaceId).eq("externalRunId", args.externalRunId),
      )
      .collect();
    if (rows.length === 0) return null;

    const completed = rows.filter((row) => row.status === "completed").length;
    const failed = rows.filter((row) => row.status === "failed").length;
    const running = rows.some((row) => row.status === "running");
    const status = failed > 0 && completed + failed === rows.length
      ? "Partial Failed"
      : completed === rows.length
        ? "Completed"
        : running
          ? "Running"
          : "Queued";
    const items = [];
    for (const row of rows) {
      const candidate = await ctx.db.get(row.candidateId);
      if (!candidate) continue;
      items.push({
        externalId: candidate.externalId,
        company: candidate.company,
        target: candidate.target,
        status: row.status,
        error: row.error ?? null,
        briefId: candidate.briefId ?? null,
      });
    }

    return {
      id: args.externalRunId,
      status,
      when: formatDateLabel(rows[0].startedAt),
      total: rows.length,
      completed,
      failed,
      remaining: rows.length - completed - failed,
      progress: Math.round(((completed + failed) / rows.length) * 100),
      error: rows.find((row) => row.error)?.error ?? null,
      items,
    };
  },
});

export const getArchive = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) return [];

    const briefs = await ctx.db
      .query("dealBriefs")
      .withIndex("by_workspaceId_and_updatedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(Math.min(args.limit ?? 100, 200));

    const rows = [];
    for (const brief of briefs) {
      const candidate = await ctx.db.get(brief.candidateId);
      if (!candidate) continue;
      rows.push({
        id: brief.externalId,
        company: candidate.company,
        target: candidate.target || "Unknown",
        logoLetter: candidate.company.charAt(0).toUpperCase() || "A",
        logoColor: getLogoColor(candidate.sector),
        sector: titleCase(candidate.sector),
        geography: candidate.geography,
        approvedDate: formatDateLabel(brief.updatedAt),
        approvedTime: new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(brief.updatedAt),
        dealType: titleCase(candidate.dealType),
        takeaway: brief.keyTakeaways[0] ?? brief.executiveSummary,
        version: `v${brief.version}`,
        status: titleCase(brief.status),
      });
    }
    return rows;
  },
});

export const generateCandidate = internalAction({
  args: { briefRunId: v.id("briefRuns") },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.briefs.completeCandidate, args);
    } catch (error) {
      await ctx.runMutation(internal.briefs.failCandidate, {
        briefRunId: args.briefRunId,
        error: error instanceof Error ? error.message : "Brief generation failed",
      });
    }
  },
});

export const completeCandidate = internalMutation({
  args: { briefRunId: v.id("briefRuns") },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.briefRunId);
    if (!run || run.status === "completed") return;
    await ctx.db.patch(args.briefRunId, { status: "running" });

    const candidate = await ctx.db.get(run.candidateId);
    if (!candidate) throw new Error("Candidate not found for brief generation");
    const links = await ctx.db
      .query("candidateSourceLinks")
      .withIndex("by_workspaceId_and_candidateId", (q) =>
        q.eq("workspaceId", run.workspaceId).eq("candidateId", candidate._id),
      )
      .take(20);
    const sources = (await Promise.all(links.map((link) => ctx.db.get(link.sourceHitId)))).filter(
      (source): source is Doc<"sourceHits"> => source !== null,
    );
    const existing = await ctx.db
      .query("dealBriefs")
      .withIndex("by_workspaceId_and_candidateId", (q) =>
        q.eq("workspaceId", run.workspaceId).eq("candidateId", candidate._id),
      )
      .order("desc")
      .first();
    const now = Date.now();
    const version = (existing?.version ?? 0) + 1;
    const briefId = await ctx.db.insert("dealBriefs", {
      workspaceId: run.workspaceId,
      candidateId: candidate._id,
      externalId: `${run.externalRunId}:${candidate.externalId}`,
      version,
      status: "generated",
      executiveSummary:
        candidate.reasoningSummary ??
        `${candidate.company} shows a ${titleCase(candidate.aiRole)} adoption signal requiring analyst review.`,
      transactionOverview: `${titleCase(candidate.dealType)} involving ${candidate.company} and ${candidate.target || "an unidentified target"}.`,
      strategicRationale: `The candidate indicates ${titleCase(candidate.aiRole)} adoption in ${titleCase(candidate.sector)} with a thesis-fit score of ${candidate.thesisFitScore}.`,
      risks: [
        candidate.target === "Unknown" ? "Target details require analyst confirmation." : "Transaction details require source validation.",
        "Automated extraction requires analyst review before approval.",
      ],
      marketImplications: `This signal contributes to the ${titleCase(candidate.sector)} view of AI integration across existing operating models.`,
      keyTakeaways: [
        `AI role: ${titleCase(candidate.aiRole)}`,
        `Source confidence: ${candidate.sourceConfidence}`,
        `${sources.length} provenance source${sources.length === 1 ? "" : "s"} linked`,
      ],
      sourcesSnapshot: sources.map((source) => source._id),
      confidenceScore: candidate.confidenceScore,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(candidate._id, { status: "brief_ready", briefId, updatedAt: now });
    await ctx.db.patch(args.briefRunId, { status: "completed", completedAt: now });
  },
});

export const failCandidate = internalMutation({
  args: { briefRunId: v.id("briefRuns"), error: v.string() },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.briefRunId);
    if (!run || run.status === "completed") return;
    const now = Date.now();
    await ctx.db.patch(args.briefRunId, { status: "failed", error: args.error, completedAt: now });
    await ctx.db.patch(run.candidateId, { status: "brief_failed", updatedAt: now });
  },
});

async function getWorkspace(ctx: Parameters<typeof getDemoWorkspaceId>[0]) {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
    .unique();
  if (!workspace) throw new Error(`Workspace '${WORKSPACE_SLUG}' has not been seeded`);
  return workspace;
}

function getLogoColor(sector: string): string {
  const colors = ["#B7F137", "#4D9DFF", "#2DD4BF", "#A879FF", "#FFB020"];
  return colors[sector.length % colors.length];
}
