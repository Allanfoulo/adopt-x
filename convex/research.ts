import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { WORKSPACE_SLUG } from "./model";

const evidenceInput = v.object({
  externalId: v.string(),
  publisher: v.string(),
  url: v.string(),
  headline: v.string(),
  publishedAt: v.number(),
  rawExcerpt: v.string(),
  hash: v.string(),
});

/** Persists a last30days run as auditable community enrichment evidence. */
export const recordResearchRun = mutation({
  args: {
    candidateExternalId: v.optional(v.string()),
    topic: v.string(),
    rawOutput: v.string(),
    evidence: v.array(evidenceInput),
  },
  handler: async (ctx, args) => {
    if (args.evidence.length > 100) {
      throw new Error("A research run may contain at most 100 evidence items");
    }

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
      .unique();
    if (!workspace) {
      throw new Error(`Workspace '${WORKSPACE_SLUG}' has not been seeded`);
    }

    const candidate = args.candidateExternalId
      ? (
          await ctx.db
            .query("dealCandidates")
            .withIndex("by_workspaceId_and_externalId", (q) =>
              q.eq("workspaceId", workspace._id).eq("externalId", args.candidateExternalId!),
            )
            .take(1)
        )[0]
      : null;

    const now = Date.now();
    const correlationId = `research-${now}`;
    const scanRunId = await ctx.db.insert("scanRuns", {
      workspaceId: workspace._id,
      externalRunId: correlationId,
      status: "completed",
      sourceTypes: ["last30days"],
      hitCount: 0,
      candidateCount: candidate ? 1 : 0,
      errorCount: 0,
      startedAt: now,
      completedAt: now,
      createdAt: now,
    });

    let inserted = 0;
    for (const item of args.evidence) {
      const duplicate = await ctx.db
        .query("sourceHits")
        .withIndex("by_workspaceId_and_hash", (q) =>
          q.eq("workspaceId", workspace._id).eq("hash", item.hash),
        )
        .take(1);
      if (duplicate[0]) {
        continue;
      }

      const sourceHitId = await ctx.db.insert("sourceHits", {
        workspaceId: workspace._id,
        scanRunId,
        externalId: item.externalId,
        sourceClass: "community",
        sourceType: "last30days",
        publisher: item.publisher,
        url: item.url,
        headline: item.headline,
        publishedAt: item.publishedAt,
        rawExcerpt: item.rawExcerpt,
        hash: item.hash,
        createdAt: now,
      });
      inserted += 1;

      if (candidate) {
        await ctx.db.insert("candidateSourceLinks", {
          workspaceId: workspace._id,
          candidateId: candidate._id,
          sourceHitId,
          sourceRole: "enrichment",
          claimSummary: `Last30days research for ${args.topic}`,
          createdAt: now,
        });
      }
    }

    if (candidate) {
      await ctx.db.insert("reviewAuditEvents", {
        workspaceId: workspace._id,
        candidateId: candidate._id,
        actorType: "agent",
        action: "last30days_research_completed",
        after: args.rawOutput.slice(0, 12000),
        correlationId,
        createdAt: now,
      });
    }

    await ctx.db.insert("domainEvents", {
      workspaceId: workspace._id,
      type: "research.completed",
      version: 1,
      aggregateType: candidate ? "dealCandidate" : "workspace",
      aggregateId: candidate?._id ?? workspace._id,
      correlationId,
      actorType: "agent",
      actorId: "last30days",
      data: JSON.stringify({ topic: args.topic, evidenceCount: inserted }),
      source: "last30days",
      createdAt: now,
    });

    await ctx.db.patch(scanRunId, { hitCount: inserted });
    return { scanRunId, candidateId: candidate?._id ?? null, inserted };
  },
});
