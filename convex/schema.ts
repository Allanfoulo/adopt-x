import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { scoreBreakdownValidator } from "./scoring";

export const userRole = v.union(v.literal("analyst"), v.literal("admin"));

export const runStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("partial_failed"),
);

export const candidateStatus = v.union(
  v.literal("new"),
  v.literal("normalized"),
  v.literal("scored"),
  v.literal("pending_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("brief_queued"),
  v.literal("brief_ready"),
  v.literal("brief_failed"),
);

export const sourceClass = v.union(
  v.literal("primary_structured"),
  v.literal("secondary_signal"),
  v.literal("community"),
);

export const briefStatus = v.union(
  v.literal("draft"),
  v.literal("generated"),
  v.literal("approved"),
  v.literal("archived"),
);

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  users: defineTable({
    workspaceId: v.id("workspaces"),
    displayName: v.string(),
    email: v.string(),
    role: userRole,
    avatarInitials: v.string(),
    avatarUrl: v.optional(v.string()),
    authSubject: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspaceId_and_role", ["workspaceId", "role"])
    .index("by_authSubject", ["authSubject"]),

  runtimeConfig: defineTable({
    workspaceId: v.id("workspaces"),
    sourceToggles: v.array(
      v.object({
        key: v.string(),
        name: v.string(),
        description: v.string(),
        group: v.union(v.literal("structured"), v.literal("discovery"), v.literal("community")),
        enabled: v.boolean(),
        configured: v.optional(v.boolean()),
      }),
    ),
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
    updatedAt: v.number(),
  }).index("by_workspaceId", ["workspaceId"]),

  scanRuns: defineTable({
    workspaceId: v.id("workspaces"),
    externalRunId: v.string(),
    status: runStatus,
    sourceTypes: v.array(v.string()),
    hitCount: v.number(),
    candidateCount: v.number(),
    errorCount: v.number(),
    error: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_workspaceId_and_externalRunId", ["workspaceId", "externalRunId"])
    .index("by_workspaceId_and_startedAt", ["workspaceId", "startedAt"])
    .index("by_workspaceId_and_status_and_startedAt", ["workspaceId", "status", "startedAt"]),

  sourceHits: defineTable({
    workspaceId: v.id("workspaces"),
    sourceClass,
    sourceType: v.string(),
    publisher: v.string(),
    publisherReputation: v.optional(v.string()),
    url: v.string(),
    headline: v.string(),
    publishedAt: v.number(),
    rawExcerpt: v.string(),
    scanRunId: v.id("scanRuns"),
    externalId: v.string(),
    hash: v.string(),
    quarantineReason: v.optional(v.string()),
    corroboration: v.optional(
      v.object({
        completed: v.boolean(),
        resultCount: v.number(),
        independentPublisherCount: v.number(),
      }),
    ),
    createdAt: v.number(),
  })
    .index("by_workspaceId_and_externalId", ["workspaceId", "externalId"])
    .index("by_workspaceId_and_publishedAt", ["workspaceId", "publishedAt"])
    .index("by_workspaceId_and_hash", ["workspaceId", "hash"])
    .index("by_workspaceId_and_scanRunId", ["workspaceId", "scanRunId"])
    .index("by_workspaceId_and_sourceClass_and_publishedAt", [
      "workspaceId",
      "sourceClass",
      "publishedAt",
    ]),

  dealCandidates: defineTable({
    workspaceId: v.id("workspaces"),
    externalId: v.string(),
    dedupeKey: v.string(),
    status: candidateStatus,
    company: v.string(),
    target: v.string(),
    dealType: v.string(),
    sector: v.string(),
    geography: v.string(),
    announcementDate: v.number(),
    aiRole: v.string(),
    confidenceScore: v.number(),
    thesisFitScore: v.number(),
    sourceConfidence: v.number(),
    scoreBreakdown: v.optional(scoreBreakdownValidator),
    reasoningSummary: v.optional(v.string()),
    reviewEdits: v.optional(
      v.object({
        editedByUserId: v.optional(v.id("users")),
        fields: v.array(v.string()),
        notes: v.string(),
      }),
    ),
    assignedToUserId: v.optional(v.id("users")),
    approvedByUserId: v.optional(v.id("users")),
    rejectedByUserId: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
    briefId: v.optional(v.id("dealBriefs")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspaceId_and_externalId", ["workspaceId", "externalId"])
    .index("by_workspaceId_and_status_and_announcementDate", [
      "workspaceId",
      "status",
      "announcementDate",
    ])
    .index("by_workspaceId_and_sector_and_status", ["workspaceId", "sector", "status"])
    .index("by_workspaceId_and_geography_and_status", ["workspaceId", "geography", "status"])
    .index("by_workspaceId_and_dealType_and_status", ["workspaceId", "dealType", "status"])
    .index("by_workspaceId_and_dedupeKey", ["workspaceId", "dedupeKey"])
    .index("by_workspaceId_and_updatedAt", ["workspaceId", "updatedAt"]),

  candidateSourceLinks: defineTable({
    workspaceId: v.id("workspaces"),
    candidateId: v.id("dealCandidates"),
    sourceHitId: v.id("sourceHits"),
    sourceRole: v.union(
      v.literal("primary"),
      v.literal("supporting"),
      v.literal("conflicting"),
      v.literal("enrichment"),
    ),
    claimSummary: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workspaceId_and_candidateId", ["workspaceId", "candidateId"])
    .index("by_workspaceId_and_sourceHitId", ["workspaceId", "sourceHitId"])
    .index("by_workspaceId_and_candidateId_and_sourceRole", [
      "workspaceId",
      "candidateId",
      "sourceRole",
    ]),

  candidateFacts: defineTable({
    workspaceId: v.id("workspaces"),
    candidateId: v.id("dealCandidates"),
    field: v.string(),
    value: v.string(),
    source: v.union(v.literal("ai"), v.literal("human")),
    sourceHitId: v.optional(v.id("sourceHits")),
    updatedByUserId: v.optional(v.id("users")),
    updatedAt: v.number(),
  })
    .index("by_workspaceId_and_candidateId", ["workspaceId", "candidateId"])
    .index("by_workspaceId_and_candidateId_and_field", ["workspaceId", "candidateId", "field"]),

  reviewAuditEvents: defineTable({
    workspaceId: v.id("workspaces"),
    candidateId: v.optional(v.id("dealCandidates")),
    briefId: v.optional(v.id("dealBriefs")),
    actorType: v.union(v.literal("user"), v.literal("agent"), v.literal("system")),
    actorUserId: v.optional(v.id("users")),
    action: v.string(),
    before: v.optional(v.string()),
    after: v.optional(v.string()),
    reason: v.optional(v.string()),
    correlationId: v.string(),
    createdAt: v.number(),
  })
    .index("by_workspaceId_and_createdAt", ["workspaceId", "createdAt"])
    .index("by_workspaceId_and_candidateId_and_createdAt", [
      "workspaceId",
      "candidateId",
      "createdAt",
    ])
    .index("by_workspaceId_and_briefId_and_createdAt", ["workspaceId", "briefId", "createdAt"]),

  domainEvents: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(),
    version: v.number(),
    aggregateType: v.string(),
    aggregateId: v.string(),
    correlationId: v.string(),
    causationId: v.optional(v.string()),
    actorType: v.union(v.literal("user"), v.literal("agent"), v.literal("system")),
    actorId: v.string(),
    data: v.string(),
    source: v.string(),
    createdAt: v.number(),
  })
    .index("by_workspaceId_and_createdAt", ["workspaceId", "createdAt"])
    .index("by_workspaceId_and_type_and_createdAt", ["workspaceId", "type", "createdAt"])
    .index("by_workspaceId_and_aggregateType_and_aggregateId_and_createdAt", [
      "workspaceId",
      "aggregateType",
      "aggregateId",
      "createdAt",
    ])
    .index("by_workspaceId_and_correlationId", ["workspaceId", "correlationId"]),

  briefRuns: defineTable({
    workspaceId: v.id("workspaces"),
    candidateId: v.id("dealCandidates"),
    externalRunId: v.string(),
    status: runStatus,
    last30daysUsed: v.boolean(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workspaceId_and_externalRunId", ["workspaceId", "externalRunId"])
    .index("by_workspaceId_and_status_and_startedAt", ["workspaceId", "status", "startedAt"])
    .index("by_workspaceId_and_candidateId", ["workspaceId", "candidateId"])
    .index("by_workspaceId_and_startedAt", ["workspaceId", "startedAt"]),

  dealBriefs: defineTable({
    workspaceId: v.id("workspaces"),
    candidateId: v.id("dealCandidates"),
    externalId: v.string(),
    version: v.number(),
    status: briefStatus,
    ownerUserId: v.optional(v.id("users")),
    executiveSummary: v.string(),
    transactionOverview: v.string(),
    strategicRationale: v.string(),
    dealStructure: v.optional(v.string()),
    risks: v.array(v.string()),
    marketImplications: v.string(),
    keyTakeaways: v.array(v.string()),
    evidenceUsed: v.optional(v.array(v.string())),
    analysis: v.optional(
      v.object({
        capabilityPurchased: v.array(v.string()),
        buildVsBuy: v.string(),
        marketChange: v.string(),
        valueDrivers: v.array(
          v.union(v.string(), v.object({ title: v.string(), detail: v.string() })),
        ),
        strategicRationalePoints: v.array(v.object({ title: v.string(), detail: v.string() })),
        synergyMap: v.array(v.object({ category: v.string(), items: v.array(v.string()) })),
        riskAnalysis: v.array(
          v.object({
            category: v.string(),
            title: v.string(),
            detail: v.string(),
            mitigation: v.string(),
          }),
        ),
        marketSignal: v.string(),
        followTheMoney: v.array(v.object({ title: v.string(), detail: v.string() })),
        secondOrderEffects: v.array(v.object({ question: v.string(), answer: v.string() })),
        startupOpportunities: v.array(
          v.object({ title: v.string(), detail: v.string(), confidence: v.string() }),
        ),
        productIdeas: v.array(
          v.object({ title: v.string(), detail: v.string(), confidence: v.string() }),
        ),
        investmentThesis: v.string(),
      }),
    ),
    sourcesSnapshot: v.array(v.id("sourceHits")),
    confidenceScore: v.optional(v.number()),
    last30daysUsed: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
    approvedAt: v.optional(v.number()),
  })
    .index("by_workspaceId_and_externalId", ["workspaceId", "externalId"])
    .index("by_workspaceId_and_candidateId", ["workspaceId", "candidateId"])
    .index("by_workspaceId_and_status_and_updatedAt", ["workspaceId", "status", "updatedAt"])
    .index("by_workspaceId_and_approvedAt", ["workspaceId", "approvedAt"])
    .index("by_workspaceId_and_updatedAt", ["workspaceId", "updatedAt"]),
});
