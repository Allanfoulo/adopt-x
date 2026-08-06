import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { formatDateLabel, getDemoWorkspaceId, titleCase, WORKSPACE_SLUG } from "./model";

const briefEnrichmentValidator = v.object({
  executiveSummary: v.string(),
  transactionOverview: v.string(),
  strategicRationale: v.string(),
  risks: v.array(v.string()),
  marketImplications: v.string(),
  keyTakeaways: v.array(v.string()),
  dealStructure: v.string(),
  confidenceScore: v.number(),
  evidenceUsed: v.array(v.string()),
  last30daysUsed: v.boolean(),
});

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

export const getArchiveDetail = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) return null;

    const brief = await ctx.db
      .query("dealBriefs")
      .withIndex("by_workspaceId_and_externalId", (q) =>
        q.eq("workspaceId", workspaceId).eq("externalId", args.externalId),
      )
      .unique();
    if (!brief) return null;

    const candidate = await ctx.db.get(brief.candidateId);
    if (!candidate) return null;

    const links = await ctx.db
      .query("candidateSourceLinks")
      .withIndex("by_workspaceId_and_candidateId", (q) =>
        q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
      )
      .take(20);
    const sources = (await Promise.all(links.map((link) => ctx.db.get(link.sourceHitId))))
      .filter((source): source is Doc<"sourceHits"> => source !== null)
      .sort((a, b) => b.publishedAt - a.publishedAt);

    const users = await ctx.db
      .query("users")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    const usersById = new Map(users.map((user) => [user._id, user]));
    const briefEvents = await ctx.db
      .query("reviewAuditEvents")
      .withIndex("by_workspaceId_and_briefId_and_createdAt", (q) =>
        q.eq("workspaceId", workspaceId).eq("briefId", brief._id),
      )
      .order("desc")
      .take(20);
    const candidateEvents = await ctx.db
      .query("reviewAuditEvents")
      .withIndex("by_workspaceId_and_candidateId_and_createdAt", (q) =>
        q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
      )
      .order("desc")
      .take(20);
    const auditEvents = [...briefEvents, ...candidateEvents]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((event, index, all) => all.findIndex((item) => item._id === event._id) === index)
      .slice(0, 20);

    return {
      id: brief.externalId,
      brief: {
        executiveSummary: brief.executiveSummary,
        transactionOverview: brief.transactionOverview,
        strategicRationale: brief.strategicRationale,
        risks: brief.risks,
        marketImplications: brief.marketImplications,
        keyTakeaways: brief.keyTakeaways,
        evidenceUsed: brief.evidenceUsed ?? [],
        dealStructure: brief.dealStructure ?? "Not available",
        confidenceScore: brief.confidenceScore ?? null,
        last30daysUsed: brief.last30daysUsed ?? false,
        version: `v${brief.version}`,
        status: titleCase(brief.status),
        updatedAt: brief.updatedAt,
      },
      candidate: {
        company: candidate.company,
        target: candidate.target || "Unknown",
        sector: titleCase(candidate.sector),
        geography: candidate.geography,
        dealType: titleCase(candidate.dealType),
        aiRole: titleCase(candidate.aiRole),
        announcementDate: formatDateLabel(candidate.announcementDate),
      },
      transaction: [
        { label: "Deal Type", value: titleCase(candidate.dealType) },
        { label: "Structure", value: brief.dealStructure ?? "Not available" },
        { label: "Announced", value: formatDateLabel(candidate.announcementDate) },
        { label: "Target HQ", value: candidate.geography || "Not available" },
        { label: "Enterprise Value", value: "Not available" },
        { label: "Employees", value: "Not available" },
      ],
      sources: sources.map((source) => ({
        headline: source.headline,
        publisher: source.publisher,
        date: formatDateLabel(source.publishedAt),
        type: titleCase(source.sourceType),
        url: source.url,
      })),
      auditTrail: auditEvents.map((event) => {
        const actor = event.actorUserId ? usersById.get(event.actorUserId) : null;
        return {
          actor: actor?.displayName ?? titleCase(event.actorType),
          initials: actor?.avatarInitials ?? "AI",
          action: titleCase(event.action),
          detail: event.after ?? event.before ?? event.reason ?? event.correlationId,
          when: formatDateLabel(event.createdAt),
          system: event.actorType === "system",
        };
      }),
      metadata: [
        { label: "Owner", value: brief.ownerUserId ? usersById.get(brief.ownerUserId)?.displayName ?? "Not available" : "System" },
        { label: "Team", value: "Not available" },
        { label: "Tags", value: `${titleCase(candidate.sector)}, ${titleCase(candidate.aiRole)}` },
        { label: "Visibility", value: "Internal" },
        { label: "Last Updated", value: formatDateLabel(brief.updatedAt) },
      ],
    };
  },
});

export const generateCandidate = internalAction({
  args: { briefRunId: v.id("briefRuns") },
  handler: async (ctx, args) => {
    try {
      const run = await ctx.runQuery(internal.briefs.getBriefRunForEnrichment, args);
      if (!run) throw new Error("Brief run not found");
      const enrichment = await generateBriefEnrichment(run);
      await ctx.runMutation(internal.briefs.completeCandidate, {
        briefRunId: args.briefRunId,
        enrichment,
      });
    } catch (error) {
      await ctx.runMutation(internal.briefs.failCandidate, {
        briefRunId: args.briefRunId,
        error: error instanceof Error ? error.message : "Brief generation failed",
      });
    }
  },
});

export const completeCandidate = internalMutation({
  args: { briefRunId: v.id("briefRuns"), enrichment: briefEnrichmentValidator },
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
        args.enrichment.executiveSummary,
      transactionOverview: args.enrichment.transactionOverview,
      strategicRationale: args.enrichment.strategicRationale,
      risks: args.enrichment.risks,
      marketImplications: args.enrichment.marketImplications,
      keyTakeaways: args.enrichment.keyTakeaways,
      evidenceUsed: args.enrichment.evidenceUsed,
      dealStructure: args.enrichment.dealStructure,
      sourcesSnapshot: sources.map((source) => source._id),
      confidenceScore: args.enrichment.confidenceScore,
      last30daysUsed: args.enrichment.last30daysUsed,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(candidate._id, { status: "brief_ready", briefId, updatedAt: now });
    await ctx.db.patch(args.briefRunId, {
      status: "completed",
      completedAt: now,
      last30daysUsed: args.enrichment.last30daysUsed,
    });
  },
});

export const getBriefRunForEnrichment = internalQuery({
  args: { briefRunId: v.id("briefRuns") },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.briefRunId);
    if (!run) return null;
    const candidate = await ctx.db.get(run.candidateId);
    if (!candidate) return null;
    const links = await ctx.db
      .query("candidateSourceLinks")
      .withIndex("by_workspaceId_and_candidateId", (q) =>
        q.eq("workspaceId", run.workspaceId).eq("candidateId", candidate._id),
      )
      .take(20);
    const sources = (await Promise.all(links.map((link) => ctx.db.get(link.sourceHitId)))).filter(
      (source): source is Doc<"sourceHits"> => source !== null,
    );
    return {
      candidate: {
        externalId: candidate.externalId,
        company: candidate.company,
        target: candidate.target,
        dealType: candidate.dealType,
        sector: candidate.sector,
        geography: candidate.geography,
        aiRole: candidate.aiRole,
        confidenceScore: candidate.confidenceScore,
        thesisFitScore: candidate.thesisFitScore,
        sourceConfidence: candidate.sourceConfidence,
      },
      sources: sources.map((source) => ({
        publisher: source.publisher,
        sourceType: source.sourceType,
        sourceClass: source.sourceClass,
        url: source.url,
        headline: source.headline,
        publishedAt: source.publishedAt,
        rawExcerpt: source.rawExcerpt,
      })),
    };
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

type BriefEnrichmentInput = {
  candidate: {
    externalId: string;
    company: string;
    target: string;
    dealType: string;
    sector: string;
    geography: string;
    aiRole: string;
    confidenceScore: number;
    thesisFitScore: number;
    sourceConfidence: number;
  };
  sources: {
    publisher: string;
    sourceType: string;
    sourceClass: string;
    url: string;
    headline: string;
    publishedAt: number;
    rawExcerpt: string;
  }[];
};

async function generateBriefEnrichment(input: BriefEnrichmentInput) {
  const baseUrl = process.env.APP_GATEWAY_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("Brief enrichment is not configured. Set APP_GATEWAY_URL in Convex.");
  }

  const response = await fetch(`${baseUrl}/api/briefs/enrich`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Mastra brief enrichment failed (${response.status}): ${responseText.slice(0, 500)}`);
  }

  let body: { value?: unknown; toolResults?: unknown[] };
  try {
    body = JSON.parse(responseText) as typeof body;
  } catch {
    throw new Error("Mastra brief enrichment returned invalid JSON.");
  }
  if (!body.value || typeof body.value !== "object" || Array.isArray(body.value)) {
    throw new Error("Brief gateway returned no enrichment object.");
  }
  const toolPayload = JSON.stringify(body.toolResults ?? []);
  const validated = validateBriefEnrichment(body.value as Record<string, unknown>);
  return {
    ...validated,
    last30daysUsed: validated.last30daysUsed && /last30days/i.test(toolPayload),
  };
}

function validateBriefEnrichment(value: Record<string, unknown>) {
  const text = (key: string) => {
    const result = value[key];
    if (typeof result !== "string" || !result.trim()) throw new Error(`Mastra enrichment missing ${key}.`);
    return result.trim();
  };
  const list = (key: string, min: number) => {
    const result = value[key];
    if (!Array.isArray(result) || result.length < min || result.some((item) => typeof item !== "string" || !item.trim())) {
      throw new Error(`Mastra enrichment returned an invalid ${key} list.`);
    }
    return result.map((item) => String(item).trim());
  };
  const confidenceScore = value.confidenceScore;
  if (typeof confidenceScore !== "number" || confidenceScore < 0 || confidenceScore > 100) {
    throw new Error("Mastra enrichment returned an invalid confidenceScore.");
  }
  if (typeof value.last30daysUsed !== "boolean") throw new Error("Mastra enrichment missing last30daysUsed.");
  return {
    executiveSummary: text("executiveSummary"),
    transactionOverview: text("transactionOverview"),
    strategicRationale: text("strategicRationale"),
    risks: list("risks", 2),
    marketImplications: text("marketImplications"),
    keyTakeaways: list("keyTakeaways", 3),
    dealStructure: text("dealStructure"),
    confidenceScore,
    evidenceUsed: list("evidenceUsed", 1),
    last30daysUsed: value.last30daysUsed,
  };
}

function getLogoColor(sector: string): string {
  const colors = ["#B7F137", "#4D9DFF", "#2DD4BF", "#A879FF", "#FFB020"];
  return colors[sector.length % colors.length];
}
