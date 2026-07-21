import { v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { WORKSPACE_SLUG } from "./model";

const analystEmail = "maya.patel@adoptx.local";
const adminEmail = "jordan.smith@adoptx.local";

type SourceFixture = {
  externalId: string;
  sourceClass: Doc<"sourceHits">["sourceClass"];
  sourceType: string;
  publisher: string;
  publisherReputation: string;
  url: string;
  headline: string;
  publishedAt: string;
  rawExcerpt: string;
  scanRunId: string;
  hash: string;
};

type CandidateFixture = {
  externalId: string;
  dedupeKey: string;
  status: Doc<"dealCandidates">["status"];
  company: string;
  target: string;
  dealType: string;
  sector: string;
  geography: string;
  announcementDate: string;
  aiRole: string;
  confidenceScore: number;
  thesisFitScore: number;
  sourceConfidence: number;
  reasoningSummary: string;
  reviewEdits?: {
    fields: string[];
    notes: string;
  };
  rejectionReason?: string;
  sourceIds: readonly string[];
};

const sourceFixtures = [
  {
    externalId: "sh_001",
    sourceClass: "primary_structured",
    sourceType: "exchange_announcement",
    publisher: "JSE SENS",
    publisherReputation: "High",
    url: "https://example.com/sens/purple-telescope",
    headline: "Purple Group to acquire Telescope AI",
    publishedAt: "2026-07-16T08:00:00Z",
    rawExcerpt: "Purple Group announced an agreement to acquire Telescope AI.",
    scanRunId: "scan_001",
    hash: "purple-telescope-2026-07-16",
  },
  {
    externalId: "sh_002",
    sourceClass: "primary_structured",
    sourceType: "press_release",
    publisher: "Business Wire",
    publisherReputation: "High",
    url: "https://example.com/bw/health-partnership",
    headline: "MediAxis partners with ClinPilot AI to streamline triage workflows",
    publishedAt: "2026-07-15T13:00:00Z",
    rawExcerpt: "The companies announced a strategic partnership focused on intake and triage.",
    scanRunId: "scan_001",
    hash: "mediaxis-clinpilot-2026-07-15",
  },
  {
    externalId: "sh_003",
    sourceClass: "primary_structured",
    sourceType: "ir_release",
    publisher: "InsuraCo IR",
    publisherReputation: "High",
    url: "https://example.com/ir/insuraco-claimforge",
    headline: "InsuraCo invests in ClaimForge AI automation platform",
    publishedAt: "2026-07-14T10:20:00Z",
    rawExcerpt: "Investment intended to expand claims workflow automation.",
    scanRunId: "scan_001",
    hash: "insuraco-claimforge-2026-07-14",
  },
  {
    externalId: "sh_004",
    sourceClass: "primary_structured",
    sourceType: "sector_press",
    publisher: "LegalTech Journal",
    publisherReputation: "Medium",
    url: "https://example.com/legaltech/lexgrid-acquires-regaicore",
    headline: "LexGrid acquires RegAICore for compliance review automation",
    publishedAt: "2026-07-13T16:40:00Z",
    rawExcerpt: "The acquisition expands document and compliance review capabilities.",
    scanRunId: "scan_001",
    hash: "lexgrid-regaicore-2026-07-13",
  },
  {
    externalId: "sh_005",
    sourceClass: "primary_structured",
    sourceType: "press_release",
    publisher: "PR Newswire",
    publisherReputation: "Medium",
    url: "https://example.com/pr/random-ai-launch",
    headline: "Startup launches general AI marketing copilot",
    publishedAt: "2026-07-12T09:00:00Z",
    rawExcerpt: "Standalone launch with no integration deal or incumbent adoption angle.",
    scanRunId: "scan_001",
    hash: "random-marketing-copilot-2026-07-12",
  },
] as const satisfies readonly SourceFixture[];

const candidateFixtures = [
  {
    externalId: "dc_001",
    dedupeKey: "purple-group-telescope-ai",
    status: "brief_ready",
    company: "Purple Group",
    target: "Telescope AI",
    dealType: "acquisition",
    sector: "fintech",
    geography: "South Africa / Australia",
    announcementDate: "2026-07-16",
    aiRole: "investment intelligence infrastructure",
    confidenceScore: 92,
    thesisFitScore: 94,
    sourceConfidence: 95,
    reasoningSummary:
      "AI capability is being acquired as core investment intelligence infrastructure in a regulated financial context.",
    reviewEdits: {
      fields: ["aiRole"],
      notes: "Clarified AI role as domain infrastructure, not consumer assistant.",
    },
    sourceIds: ["sh_001"],
  },
  {
    externalId: "dc_002",
    dedupeKey: "mediaxis-clinpilot-ai",
    status: "pending_review",
    company: "MediAxis",
    target: "ClinPilot AI",
    dealType: "strategic_partnership",
    sector: "healthcare",
    geography: "UK",
    announcementDate: "2026-07-15",
    aiRole: "clinical workflow support",
    confidenceScore: 81,
    thesisFitScore: 86,
    sourceConfidence: 88,
    reasoningSummary:
      "Partnership directly supports AI-enabled clinical intake and triage workflows.",
    sourceIds: ["sh_002"],
  },
  {
    externalId: "dc_003",
    dedupeKey: "insuraco-claimforge-ai",
    status: "approved",
    company: "InsuraCo",
    target: "ClaimForge AI",
    dealType: "strategic_investment",
    sector: "insurance",
    geography: "US",
    announcementDate: "2026-07-14",
    aiRole: "claims automation",
    confidenceScore: 79,
    thesisFitScore: 83,
    sourceConfidence: 84,
    reasoningSummary:
      "Strategic investment expands AI claims workflow automation inside incumbent insurance operations.",
    reviewEdits: {
      fields: ["dealType", "thesisFitScore"],
      notes: "Downgraded from partnership to strategic investment.",
    },
    sourceIds: ["sh_003"],
  },
  {
    externalId: "dc_004",
    dedupeKey: "lexgrid-regaicore",
    status: "brief_queued",
    company: "LexGrid",
    target: "RegAICore",
    dealType: "acquisition",
    sector: "legal",
    geography: "Australia",
    announcementDate: "2026-07-13",
    aiRole: "compliance review automation",
    confidenceScore: 77,
    thesisFitScore: 85,
    sourceConfidence: 82,
    reasoningSummary:
      "Acquisition strengthens AI-assisted compliance review in a regulated legal workflow.",
    sourceIds: ["sh_004"],
  },
  {
    externalId: "dc_005",
    dedupeKey: "random-marketing-copilot",
    status: "rejected",
    company: "SparkPrompt",
    target: "",
    dealType: "product_launch",
    sector: "marketing_software",
    geography: "US",
    announcementDate: "2026-07-12",
    aiRole: "generic marketing copilot",
    confidenceScore: 41,
    thesisFitScore: 22,
    sourceConfidence: 60,
    reasoningSummary:
      "Standalone launch does not show AI integration into an existing regulated sector.",
    reviewEdits: {
      fields: ["status"],
      notes: "Rejected as off-thesis and non-regulated.",
    },
    sourceIds: ["sh_005"],
    rejectionReason: "Off-thesis and non-regulated.",
  },
] as const satisfies readonly CandidateFixture[];

function timestamp(value: string): number {
  return Date.parse(value);
}

async function getOrCreateWorkspace(ctx: MutationCtx) {
  const existing = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
    .unique();
  if (existing) {
    return existing._id as Id<"workspaces">;
  }
  return await ctx.db.insert("workspaces", {
    name: "Adopt X Demo",
    slug: WORKSPACE_SLUG,
    createdAt: timestamp("2026-07-16T07:30:00Z"),
  });
}

export const seedFixtures = mutation({
  args: {},
  handler: async (ctx) => {
    const workspaceId = await getOrCreateWorkspace(ctx);
    const now = timestamp("2026-07-16T09:12:00Z");

    const analystId = await upsertUser(ctx, workspaceId, {
      displayName: "Maya Patel",
      email: analystEmail,
      role: "analyst",
      avatarInitials: "MP",
      createdAt: timestamp("2026-07-16T07:31:00Z"),
    });
    const adminId = await upsertUser(ctx, workspaceId, {
      displayName: "Jordan Smith",
      email: adminEmail,
      role: "admin",
      avatarInitials: "JS",
      createdAt: timestamp("2026-07-16T07:32:00Z"),
    });

    await upsertRuntimeConfig(ctx, workspaceId, now);

    const scanRunId = await upsertScanRun(ctx, workspaceId, {
      externalRunId: "scan_001",
      status: "completed",
      sourceTypes: ["exchange_announcement", "press_release", "ir_release", "sector_press"],
      hitCount: 5,
      candidateCount: 5,
      errorCount: 0,
      startedAt: timestamp("2026-07-16T07:45:00Z"),
      completedAt: timestamp("2026-07-16T08:02:00Z"),
      createdAt: timestamp("2026-07-16T07:45:00Z"),
    });

    const sourceIds = new Map<string, Id<"sourceHits">>();
    for (const source of sourceFixtures) {
      const sourceId = await upsertSourceHit(ctx, workspaceId, scanRunId, source);
      sourceIds.set(source.externalId, sourceId);
    }

    const candidateIds = new Map<string, Id<"dealCandidates">>();
    for (const candidate of candidateFixtures) {
      const candidateId = await upsertCandidate(ctx, workspaceId, analystId, candidate);
      candidateIds.set(candidate.externalId, candidateId);
    }

    for (const candidate of candidateFixtures) {
      const candidateId = candidateIds.get(candidate.externalId);
      if (!candidateId) {
        continue;
      }
      for (const externalSourceId of candidate.sourceIds) {
        const sourceHitId = sourceIds.get(externalSourceId);
        if (!sourceHitId) {
          continue;
        }
        await upsertCandidateSourceLink(ctx, workspaceId, candidateId, sourceHitId);
      }
      await upsertCandidateFacts(ctx, workspaceId, candidateId, analystId, candidate);
    }

    const purpleCandidateId = candidateIds.get("dc_001");
    const purpleSourceId = sourceIds.get("sh_001");
    if (purpleCandidateId && purpleSourceId) {
      const briefId = await upsertDealBrief(ctx, workspaceId, analystId, purpleCandidateId, purpleSourceId);
      await ctx.db.patch(purpleCandidateId, { briefId, updatedAt: now });
    }

    const lexGridCandidateId = candidateIds.get("dc_004");
    if (lexGridCandidateId) {
      await upsertBriefRun(ctx, workspaceId, lexGridCandidateId, {
        externalRunId: "brief_002",
        status: "running",
        last30daysUsed: false,
        startedAt: timestamp("2026-07-16T08:16:00Z"),
        createdAt: timestamp("2026-07-16T08:16:00Z"),
      });
    }

    if (purpleCandidateId) {
      await upsertBriefRun(ctx, workspaceId, purpleCandidateId, {
        externalRunId: "brief_001",
        status: "completed",
        last30daysUsed: true,
        startedAt: timestamp("2026-07-16T08:10:00Z"),
        completedAt: timestamp("2026-07-16T08:15:00Z"),
        createdAt: timestamp("2026-07-16T08:10:00Z"),
      });
      await upsertAuditEvent(ctx, workspaceId, purpleCandidateId, analystId, {
        action: "edit_and_approve",
        before: JSON.stringify({ aiRole: "conversational investing" }),
        after: JSON.stringify({ aiRole: "investment intelligence infrastructure" }),
        reason: "Refined role to better reflect acquisition thesis.",
        correlationId: "corr_001",
        createdAt: timestamp("2026-07-16T08:08:00Z"),
      });
      await upsertDomainEvent(ctx, workspaceId, {
        type: "candidate.approved",
        aggregateType: "dealCandidate",
        aggregateId: purpleCandidateId,
        correlationId: "corr_001",
        actorType: "user",
        actorId: analystId,
        data: { status: "brief_ready" },
        createdAt: timestamp("2026-07-16T08:08:00Z"),
      });
    }

    const insuraCandidateId = candidateIds.get("dc_003");
    if (insuraCandidateId) {
      await upsertAuditEvent(ctx, workspaceId, insuraCandidateId, adminId, {
        action: "approved_candidate",
        reason: "Approved for archive after analyst review.",
        correlationId: "corr_002",
        createdAt: timestamp("2026-07-14T16:18:00Z"),
      });
    }

    return {
      workspaceId,
      users: 2,
      sourceHits: sourceIds.size,
      dealCandidates: candidateIds.size,
    };
  },
});

async function upsertUser(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  user: {
    displayName: string;
    email: string;
    role: Doc<"users">["role"];
    avatarInitials: string;
    createdAt: number;
  },
) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
    .filter((q) => q.eq(q.field("email"), user.email))
    .unique();
  const doc = { workspaceId, ...user };
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"users">;
  }
  return await ctx.db.insert("users", doc);
}

async function upsertRuntimeConfig(ctx: MutationCtx, workspaceId: Id<"workspaces">, updatedAt: number) {
  const existing = await ctx.db
    .query("runtimeConfig")
    .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
    .unique();
  const doc = {
    workspaceId,
    sourceToggles: [
      {
        key: "exchange_announcements",
        name: "Exchange Announcements",
        description: "ASX / LSE / NYSE / NASDAQ",
        group: "structured" as const,
        enabled: true,
      },
      {
        key: "ir_pages",
        name: "IR Pages",
        description: "Investor relations & company sites",
        group: "structured" as const,
        enabled: true,
      },
      {
        key: "pr_wires",
        name: "PR Wires",
        description: "Business & financial news wires",
        group: "structured" as const,
        enabled: true,
      },
      {
        key: "sector_press",
        name: "Sector Press",
        description: "Industry & sector publications",
        group: "structured" as const,
        enabled: true,
      },
      {
        key: "reddit",
        name: "Reddit",
        description: "Subreddits & company mentions",
        group: "community" as const,
        enabled: false,
      },
    ],
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
    updatedAt,
  };
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"runtimeConfig">;
  }
  return await ctx.db.insert("runtimeConfig", doc);
}

async function upsertScanRun(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  run: Omit<Doc<"scanRuns">, "_id" | "_creationTime" | "workspaceId">,
) {
  const existing = await ctx.db
    .query("scanRuns")
    .withIndex("by_workspaceId_and_externalRunId", (q) =>
      q.eq("workspaceId", workspaceId).eq("externalRunId", run.externalRunId),
    )
    .unique();
  const doc = { workspaceId, ...run };
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"scanRuns">;
  }
  return await ctx.db.insert("scanRuns", doc);
}

async function upsertSourceHit(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  scanRunId: Id<"scanRuns">,
  source: SourceFixture,
) {
  const existing = await ctx.db
    .query("sourceHits")
    .withIndex("by_workspaceId_and_externalId", (q) =>
      q.eq("workspaceId", workspaceId).eq("externalId", source.externalId),
    )
    .unique();
  const doc = {
    workspaceId,
    scanRunId,
    externalId: source.externalId,
    sourceClass: source.sourceClass,
    sourceType: source.sourceType,
    publisher: source.publisher,
    publisherReputation: source.publisherReputation,
    url: source.url,
    headline: source.headline,
    publishedAt: timestamp(source.publishedAt),
    rawExcerpt: source.rawExcerpt,
    hash: source.hash,
    createdAt: timestamp(source.publishedAt),
  };
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"sourceHits">;
  }
  return await ctx.db.insert("sourceHits", doc);
}

async function upsertCandidate(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  analystId: Id<"users">,
  candidate: CandidateFixture,
) {
  const existing = await ctx.db
    .query("dealCandidates")
    .withIndex("by_workspaceId_and_externalId", (q) =>
      q.eq("workspaceId", workspaceId).eq("externalId", candidate.externalId),
    )
    .unique();
  const updatedAt = timestamp(`${candidate.announcementDate}T09:00:00Z`);
  const doc = {
    workspaceId,
    externalId: candidate.externalId,
    dedupeKey: candidate.dedupeKey,
    status: candidate.status,
    company: candidate.company,
    target: candidate.target,
    dealType: candidate.dealType,
    sector: candidate.sector,
    geography: candidate.geography,
    announcementDate: timestamp(`${candidate.announcementDate}T00:00:00Z`),
    aiRole: candidate.aiRole,
    confidenceScore: candidate.confidenceScore,
    thesisFitScore: candidate.thesisFitScore,
    sourceConfidence: candidate.sourceConfidence,
    reasoningSummary: candidate.reasoningSummary,
    assignedToUserId: analystId,
    createdAt: timestamp(`${candidate.announcementDate}T08:30:00Z`),
    updatedAt,
  };
  if (candidate.reviewEdits) {
    Object.assign(doc, {
      reviewEdits: {
        editedByUserId: analystId,
        fields: candidate.reviewEdits.fields,
        notes: candidate.reviewEdits.notes,
      },
    });
  }
  if ("rejectionReason" in candidate) {
    Object.assign(doc, { rejectionReason: candidate.rejectionReason });
  }
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"dealCandidates">;
  }
  return await ctx.db.insert("dealCandidates", doc);
}

async function upsertCandidateSourceLink(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  candidateId: Id<"dealCandidates">,
  sourceHitId: Id<"sourceHits">,
) {
  const existing = await ctx.db
    .query("candidateSourceLinks")
    .withIndex("by_workspaceId_and_candidateId", (q) =>
      q.eq("workspaceId", workspaceId).eq("candidateId", candidateId),
    )
    .filter((q) => q.eq(q.field("sourceHitId"), sourceHitId))
    .unique();
  const doc = {
    workspaceId,
    candidateId,
    sourceHitId,
    sourceRole: "primary" as const,
    claimSummary: "Primary source for candidate normalization and scoring.",
    createdAt: timestamp("2026-07-16T08:03:00Z"),
  };
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"candidateSourceLinks">;
  }
  return await ctx.db.insert("candidateSourceLinks", doc);
}

async function upsertCandidateFacts(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  candidateId: Id<"dealCandidates">,
  analystId: Id<"users">,
  candidate: CandidateFixture,
) {
  const facts = [
    ["Company", candidate.company, "ai"],
    ["Target", candidate.target || "N/A", "ai"],
    ["Sector", candidate.sector, "ai"],
    ["Geography", candidate.geography, "ai"],
    ["Deal Type", candidate.dealType, candidate.reviewEdits?.fields.includes("dealType") ? "human" : "ai"],
    ["AI Role", candidate.aiRole, candidate.reviewEdits?.fields.includes("aiRole") ? "human" : "ai"],
    ["Announcement Date", candidate.announcementDate, "ai"],
    ["Source Class", "News / Press", "ai"],
  ] as const;

  for (const [field, value, source] of facts) {
    const existing = await ctx.db
      .query("candidateFacts")
      .withIndex("by_workspaceId_and_candidateId_and_field", (q) =>
        q.eq("workspaceId", workspaceId).eq("candidateId", candidateId).eq("field", field),
      )
      .unique();
    const doc = {
      workspaceId,
      candidateId,
      field,
      value,
      source,
      updatedAt: timestamp(`${candidate.announcementDate}T09:00:00Z`),
    };
    if (source === "human") {
      Object.assign(doc, { updatedByUserId: analystId });
    }
    if (existing) {
      await ctx.db.patch(existing._id, doc);
    } else {
      await ctx.db.insert("candidateFacts", doc);
    }
  }
}

async function upsertDealBrief(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  analystId: Id<"users">,
  candidateId: Id<"dealCandidates">,
  sourceHitId: Id<"sourceHits">,
) {
  const externalId = "db_001";
  const existing = await ctx.db
    .query("dealBriefs")
    .withIndex("by_workspaceId_and_externalId", (q) =>
      q.eq("workspaceId", workspaceId).eq("externalId", externalId),
    )
    .unique();
  const doc = {
    workspaceId,
    candidateId,
    externalId,
    version: 1,
    status: "approved" as const,
    ownerUserId: analystId,
    executiveSummary:
      "Purple Group acquires Telescope AI to accelerate domain-specific AI infrastructure in investing.",
    transactionOverview: "100% acquisition with mixed consideration and earn-out mechanics.",
    strategicRationale: "Acquire mature AI research capability rather than build internally.",
    dealStructure: "Cash, equity, and performance-based earn-out.",
    risks: ["integration risk", "regulatory risk", "adoption risk"],
    marketImplications: "Signals AI as financial infrastructure rather than a surface feature.",
    keyTakeaways: [
      "AI capability bought as core infrastructure",
      "Existing enterprise relationships increase strategic value",
      "Supports adoption thesis in regulated sectors",
    ],
    sourcesSnapshot: [sourceHitId],
    confidenceScore: 92,
    createdAt: timestamp("2026-07-16T08:15:00Z"),
    updatedAt: timestamp("2026-07-16T08:32:00Z"),
    approvedAt: timestamp("2026-07-16T08:32:00Z"),
  };
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"dealBriefs">;
  }
  return await ctx.db.insert("dealBriefs", doc);
}

async function upsertBriefRun(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  candidateId: Id<"dealCandidates">,
  run: {
    externalRunId: string;
    status: Doc<"briefRuns">["status"];
    last30daysUsed: boolean;
    startedAt: number;
    completedAt?: number;
    createdAt: number;
  },
) {
  const existing = await ctx.db
    .query("briefRuns")
    .withIndex("by_workspaceId_and_externalRunId", (q) =>
      q.eq("workspaceId", workspaceId).eq("externalRunId", run.externalRunId),
    )
    .unique();
  const doc = { workspaceId, candidateId, ...run };
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"briefRuns">;
  }
  return await ctx.db.insert("briefRuns", doc);
}

async function upsertAuditEvent(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  candidateId: Id<"dealCandidates">,
  actorUserId: Id<"users">,
  event: {
    action: string;
    before?: string;
    after?: string;
    reason: string;
    correlationId: string;
    createdAt: number;
  },
) {
  const existing = await ctx.db
    .query("reviewAuditEvents")
    .withIndex("by_workspaceId_and_candidateId_and_createdAt", (q) =>
      q.eq("workspaceId", workspaceId).eq("candidateId", candidateId).eq("createdAt", event.createdAt),
    )
    .unique();
  const doc = {
    workspaceId,
    candidateId,
    actorType: "user" as const,
    actorUserId,
    action: event.action,
    reason: event.reason,
    correlationId: event.correlationId,
    createdAt: event.createdAt,
  };
  if (event.before) {
    Object.assign(doc, { before: event.before });
  }
  if (event.after) {
    Object.assign(doc, { after: event.after });
  }
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"reviewAuditEvents">;
  }
  return await ctx.db.insert("reviewAuditEvents", doc);
}

async function upsertDomainEvent(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  event: {
    type: string;
    aggregateType: string;
    aggregateId: Id<"dealCandidates">;
    correlationId: string;
    actorType: "user" | "agent" | "system";
    actorId: Id<"users">;
    data: Record<string, string>;
    createdAt: number;
  },
) {
  const existing = await ctx.db
    .query("domainEvents")
    .withIndex("by_workspaceId_and_correlationId", (q) =>
      q.eq("workspaceId", workspaceId).eq("correlationId", event.correlationId),
    )
    .unique();
  const doc = {
    workspaceId,
    type: event.type,
    version: 1,
    aggregateType: event.aggregateType,
    aggregateId: event.aggregateId,
    correlationId: event.correlationId,
    actorType: event.actorType,
    actorId: event.actorId,
    data: JSON.stringify(event.data),
    source: "seedFixtures",
    createdAt: event.createdAt,
  };
  if (existing) {
    await ctx.db.patch(existing._id, doc);
    return existing._id as Id<"domainEvents">;
  }
  return await ctx.db.insert("domainEvents", doc);
}
