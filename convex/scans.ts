import { v } from "convex/values";
import { action, internalMutation, mutation, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { WORKSPACE_SLUG } from "./model";

const defaultWorkspace = "adoptx";
const defaultPath = "p/f/flows/run_scheduled_scan";

/** Creates the run record before the remote job starts so the UI can show progress. */
export const createRun = internalMutation({
  args: { externalRunId: v.string() },
  handler: async (ctx, args) => {
    const workspace = await getWorkspace(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("scanRuns")
      .withIndex("by_workspaceId_and_externalRunId", (q) =>
        q.eq("workspaceId", workspace._id).eq("externalRunId", args.externalRunId),
      )
      .take(1);

    if (existing[0]) {
      await ctx.db.patch(existing[0]._id, {
        status: "running",
        sourceTypes: [],
        hitCount: 0,
        candidateCount: 0,
        errorCount: 0,
        error: undefined,
        completedAt: undefined,
        startedAt: now,
      });
      return existing[0]._id;
    }

    return await ctx.db.insert("scanRuns", {
      workspaceId: workspace._id,
      externalRunId: args.externalRunId,
      status: "running",
      sourceTypes: [],
      hitCount: 0,
      candidateCount: 0,
      errorCount: 0,
      startedAt: now,
      createdAt: now,
    });
  },
});

/** Marks a manually started run failed when Windmill rejects it before ingestion. */
export const markFailed = internalMutation({
  args: { externalRunId: v.string(), error: v.string() },
  handler: markRunFailed,
});

/** Allows Windmill to report asynchronous failures back to the operational panel. */
export const fail = mutation({
  args: { externalRunId: v.string(), error: v.string() },
  handler: markRunFailed,
});

/** Starts the Windmill collector without exposing its scoped token to the browser. */
export const start = action({
  args: {},
  handler: async (ctx) => {
    const baseUrl = process.env.WINDMILL_BASE_URL?.replace(/\/$/, "");
    const workspace = process.env.WINDMILL_WORKSPACE ?? defaultWorkspace;
    const scanPath = process.env.WINDMILL_SCAN_PATH ?? defaultPath;
    const token = process.env.WINDMILL_SCAN_TOKEN;

    if (!baseUrl || !token) {
      throw new Error(
        "Live scanning is not configured. Set WINDMILL_BASE_URL and WINDMILL_SCAN_TOKEN in Convex.",
      );
    }

    const externalRunId = `windmill-${crypto.randomUUID()}`;
    await ctx.runMutation(internal.scans.createRun, { externalRunId });

    try {
      const response = await fetch(
        `${baseUrl}/api/w/${encodeURIComponent(workspace)}/jobs/run/${scanPath}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ externalRunId }),
        },
      );

      const responseText = await response.text();
      let responseBody: unknown = responseText;
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        // Keep the text response for a useful error message below.
      }

      if (!response.ok) {
        const detail =
          typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody);
        throw new Error(`Windmill rejected the scan request (${response.status}): ${detail}`);
      }

      const jobId =
        typeof responseBody === "string"
          ? responseBody
          : responseBody && typeof responseBody === "object" && "uuid" in responseBody
            ? String(responseBody.uuid)
            : null;

      return { jobId, externalRunId };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Windmill request failed.";
      try {
        await ctx.runMutation(internal.scans.markFailed, { externalRunId, error: message });
      } catch {
        // Preserve the original Windmill error if failure telemetry is unavailable.
      }
      throw error;
    }
  },
});

async function getWorkspace(ctx: MutationCtx) {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
    .unique();
  if (!workspace) throw new Error(`Workspace '${WORKSPACE_SLUG}' has not been seeded`);
  return workspace;
}

async function markRunFailed(ctx: MutationCtx, args: { externalRunId: string; error: string }) {
  const workspace = await getWorkspace(ctx);
  const existing = await ctx.db
    .query("scanRuns")
    .withIndex("by_workspaceId_and_externalRunId", (q) =>
      q.eq("workspaceId", workspace._id).eq("externalRunId", args.externalRunId),
    )
    .take(1);
  if (!existing[0]) return null;

  await ctx.db.patch(existing[0]._id, {
    status: "failed",
    error: args.error,
    completedAt: Date.now(),
  });
  return existing[0]._id;
}
