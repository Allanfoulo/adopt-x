import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getDemoWorkspaceId } from "./model";

const sourceToggle = v.object({
  key: v.string(),
  name: v.string(),
  description: v.string(),
  group: v.union(v.literal("structured"), v.literal("discovery"), v.literal("community")),
  enabled: v.boolean(),
  configured: v.optional(v.boolean()),
});

const runtimeConfigFields = {
  sourceToggles: v.array(sourceToggle),
  scanCadenceMinutes: v.number(),
  timezone: v.string(),
  dedupeSimilarityThreshold: v.number(),
  briefReadyThreshold: v.number(),
  briefGenerationMode: v.string(),
  last30daysAfterApproval: v.boolean(),
  eventRetentionDays: v.number(),
  provenanceValidationMode: v.string(),
  requireSourceUrl: v.boolean(),
  minimumSourceConfidence: v.string(),
  publisherReputationFloor: v.string(),
  detectConflictingInfo: v.boolean(),
  duplicateContentCheck: v.boolean(),
  maxParallelScans: v.number(),
  modelTier: v.string(),
  rateLimitBackoff: v.string(),
  dataResidency: v.string(),
  auditRetentionDays: v.number(),
};

type SourceToggle = {
  key: string;
  name: string;
  description: string;
  group: "structured" | "discovery" | "community";
  enabled: boolean;
  configured?: boolean;
};

const defaultSourceToggles: SourceToggle[] = [
  {
    key: "sec_press_releases",
    name: "SEC Press Releases",
    description: "Issuer announcements and regulatory disclosures",
    group: "structured",
    enabled: true,
    configured: true,
  },
  {
    key: "google_news_ai_adoption",
    name: "AI Adoption News",
    description: "Cross-industry adoption and integration signals",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "google_news_ai_acquisitions",
    name: "AI Acquisition News",
    description: "Acquisitions and corporate control transactions",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "google_news_ai_partnerships",
    name: "AI Partnership News",
    description: "Strategic partnerships and commercial integrations",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "google_news_ai_investments",
    name: "AI Investment News",
    description: "Funding, investment, and capital allocation signals",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "exchange_announcements",
    name: "Exchange Announcements",
    description: "Market announcement discovery feed; requires primary corroboration",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "ir_pages",
    name: "IR Pages",
    description: "Investor relations and newsroom discovery feed",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "pr_wires",
    name: "PR Wires",
    description: "PR Newswire and Business Wire discovery feed",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "sector_press",
    name: "Sector Press",
    description: "TechCrunch AI and sector coverage",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "business_press",
    name: "Business Press",
    description: "Dow Jones market and business coverage",
    group: "discovery",
    enabled: true,
    configured: true,
  },
  {
    key: "reddit",
    name: "Reddit",
    description: "Subreddits and company mentions",
    group: "community",
    enabled: false,
    configured: false,
  },
  {
    key: "x_lists",
    name: "X / Twitter Lists",
    description: "Curated lists and company handles",
    group: "community",
    enabled: false,
    configured: false,
  },
  {
    key: "substack",
    name: "Substack / Blogs",
    description: "Independent analysis and newsletters",
    group: "community",
    enabled: false,
    configured: false,
  },
  {
    key: "youtube_transcripts",
    name: "YouTube Transcripts",
    description: "Earnings calls and related content",
    group: "community",
    enabled: false,
    configured: false,
  },
];

const defaultRuntimeConfig = {
  sourceToggles: defaultSourceToggles,
  scanCadenceMinutes: 15,
  timezone: "(UTC+10:00) Australia/Sydney",
  dedupeSimilarityThreshold: 85,
  briefReadyThreshold: 80,
  briefGenerationMode: "AI assisted with analyst edit",
  last30daysAfterApproval: true,
  eventRetentionDays: 90,
  provenanceValidationMode: "Strict",
  requireSourceUrl: true,
  minimumSourceConfidence: "Medium",
  publisherReputationFloor: "Medium",
  detectConflictingInfo: true,
  duplicateContentCheck: true,
  maxParallelScans: 6,
  modelTier: "Standard (Balanced)",
  rateLimitBackoff: "Exponential (Default)",
  dataResidency: "Australia (au-southeast-2)",
  auditRetentionDays: 365,
};

function normalizeSourceToggles(current: readonly SourceToggle[] | undefined): SourceToggle[] {
  const byKey = new Map((current ?? []).map((source) => [source.key, source]));
  return defaultSourceToggles.map((source) => ({
    ...source,
    ...byKey.get(source.key),
    name: source.name,
    description: source.description,
    group: source.group,
    enabled: source.configured ? (byKey.get(source.key)?.enabled ?? source.enabled) : false,
    configured: source.configured,
  }));
}

function publicConfig(config: Doc<"runtimeConfig"> | null) {
  return {
    ...(config ?? defaultRuntimeConfig),
    timezone: normalizeStoredTimezone((config ?? defaultRuntimeConfig).timezone),
    sourceToggles: normalizeSourceToggles(config?.sourceToggles),
  };
}

function normalizeStoredTimezone(value: string): string {
  const legacyMatch = value.match(/^\([^)]*\)\s*(.+)$/);
  return legacyMatch?.[1] ?? value;
}

export const getRuntimeConfig = query({
  args: {},
  handler: async (ctx) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) {
      return null;
    }

    const config = await ctx.db
      .query("runtimeConfig")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .unique();
    const latestScan = await ctx.db
      .query("scanRuns")
      .withIndex("by_workspaceId_and_startedAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .first();
    const settings = publicConfig(config);

    return {
      ...settings,
      latestScan: latestScan
        ? {
            status: latestScan.status,
            startedAt: latestScan.startedAt,
            completedAt: latestScan.completedAt ?? null,
          }
        : null,
      nextScheduledScanAt: latestScan
        ? latestScan.startedAt + settings.scanCadenceMinutes * 60_000
        : null,
      configuredSourceKeys: settings.sourceToggles
        .filter((source) => source.configured)
        .map((source) => source.key),
    };
  },
});

export const updateRuntimeConfig = mutation({
  args: runtimeConfigFields,
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) {
      throw new Error("Adopt X workspace is not initialized");
    }

    const existing = await ctx.db
      .query("runtimeConfig")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .unique();
    const doc = {
      ...args,
      sourceToggles: normalizeSourceToggles(args.sourceToggles),
      workspaceId,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return existing._id;
    }
    return await ctx.db.insert("runtimeConfig", doc);
  },
});
