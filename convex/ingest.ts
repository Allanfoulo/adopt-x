import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { WORKSPACE_SLUG } from "./model";
import { sourceClass } from "./schema";

const sourceInput = v.object({
  externalId: v.string(),
  sourceClass,
  sourceType: v.string(),
  publisher: v.string(),
  publisherReputation: v.optional(v.string()),
  url: v.string(),
  headline: v.string(),
  publishedAt: v.number(),
  rawExcerpt: v.string(),
  hash: v.string(),
});

/**
 * Entry point for Windmill collectors. Ingestion is idempotent by external id
 * and content hash so retries do not create duplicate source evidence.
 */
export const ingestSourceBatch = mutation({
  args: {
    externalRunId: v.string(),
    sourceTypes: v.array(v.string()),
    sources: v.array(sourceInput),
  },
  handler: async (ctx, args) => {
    if (args.sources.length > 250) {
      throw new Error("A scan batch may contain at most 250 source items");
    }

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
      .unique();
    if (!workspace) {
      throw new Error(`Workspace '${WORKSPACE_SLUG}' has not been seeded`);
    }

    const now = Date.now();
    const runId = await ctx.db.insert("scanRuns", {
      workspaceId: workspace._id,
      externalRunId: args.externalRunId,
      status: "running",
      sourceTypes: args.sourceTypes,
      hitCount: 0,
      candidateCount: 0,
      errorCount: 0,
      startedAt: now,
      createdAt: now,
    });

    let inserted = 0;
    let duplicates = 0;

    for (const source of args.sources) {
      const existingByExternalId = await ctx.db
        .query("sourceHits")
        .withIndex("by_workspaceId_and_externalId", (q) =>
          q.eq("workspaceId", workspace._id).eq("externalId", source.externalId),
        )
        .take(1);
      const existingByHash = await ctx.db
        .query("sourceHits")
        .withIndex("by_workspaceId_and_hash", (q) =>
          q.eq("workspaceId", workspace._id).eq("hash", source.hash),
        )
        .take(1);

      if (existingByExternalId[0] || existingByHash[0]) {
        duplicates += 1;
        continue;
      }

      await ctx.db.insert("sourceHits", {
        workspaceId: workspace._id,
        scanRunId: runId,
        externalId: source.externalId,
        sourceClass: source.sourceClass,
        sourceType: source.sourceType,
        publisher: source.publisher,
        publisherReputation: source.publisherReputation,
        url: source.url,
        headline: source.headline,
        publishedAt: source.publishedAt,
        rawExcerpt: source.rawExcerpt,
        hash: source.hash,
        createdAt: now,
      });
      inserted += 1;
    }

    await ctx.db.patch(runId, {
      status: "completed",
      hitCount: inserted,
      completedAt: Date.now(),
    });

    return { runId, inserted, duplicates };
  },
});
