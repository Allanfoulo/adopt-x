import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { WORKSPACE_SLUG } from "./model";
import { sourceClass } from "./schema";
import { calculateCandidateScores } from "./scoring";

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
  quarantineReason: v.optional(v.string()),
  corroboration: v.optional(
    v.object({
      completed: v.boolean(),
      resultCount: v.number(),
      independentPublisherCount: v.number(),
      evidence: v.array(
        v.object({
          externalId: v.string(),
          title: v.string(),
          url: v.string(),
          description: v.string(),
          markdown: v.string(),
        }),
      ),
    }),
  ),
  candidateDraft: v.optional(
    v.object({
      company: v.string(),
      target: v.string(),
      dealType: v.string(),
      sector: v.string(),
      geography: v.string(),
      aiRole: v.string(),
      reasoningSummary: v.string(),
      preReviewAssessment: v.optional(
        v.object({
          signal: v.string(),
          interestingBecause: v.string(),
          preliminaryThesis: v.string(),
          counterThesis: v.string(),
          evidenceRefs: v.array(
            v.object({
              claimId: v.string(),
              claim: v.string(),
              relation: v.union(v.literal("supports"), v.literal("contradicts")),
              sourceExternalIds: v.array(v.string()),
            }),
          ),
          missingEvidence: v.array(v.string()),
          confidenceRationale: v.string(),
        }),
      ),
    }),
  ),
});

type SourceInput = {
  externalId: string;
  sourceClass: Doc<"sourceHits">["sourceClass"];
  sourceType: string;
  publisher: string;
  publisherReputation?: string;
  url: string;
  headline: string;
  publishedAt: number;
  rawExcerpt: string;
  hash: string;
  quarantineReason?: string;
  corroboration?: {
    completed: boolean;
    resultCount: number;
    independentPublisherCount: number;
    evidence: {
      externalId: string;
      title: string;
      url: string;
      description: string;
      markdown: string;
    }[];
  };
  candidateDraft?: {
    company: string;
    target: string;
    dealType: string;
    sector: string;
    geography: string;
    aiRole: string;
    reasoningSummary: string;
    preReviewAssessment?: {
      signal: string;
      interestingBecause: string;
      preliminaryThesis: string;
      counterThesis: string;
      evidenceRefs: {
        claimId: string;
        claim: string;
        relation: "supports" | "contradicts";
        sourceExternalIds: string[];
      }[];
      missingEvidence: string[];
      confidenceRationale: string;
    };
  };
};

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

    const workspace = await getWorkspace(ctx);
    const now = Date.now();
    const existingRun = await ctx.db
      .query("scanRuns")
      .withIndex("by_workspaceId_and_externalRunId", (q) =>
        q.eq("workspaceId", workspace._id).eq("externalRunId", args.externalRunId),
      )
      .take(1);
    const runId =
      existingRun[0]?._id ??
      (await ctx.db.insert("scanRuns", {
        workspaceId: workspace._id,
        externalRunId: args.externalRunId,
        status: "running",
        sourceTypes: args.sourceTypes,
        hitCount: 0,
        candidateCount: 0,
        errorCount: 0,
        startedAt: now,
        createdAt: now,
      }));
    if (existingRun[0]) {
      await ctx.db.patch(existingRun[0]._id, {
        status: "running",
        sourceTypes: args.sourceTypes,
        hitCount: 0,
        candidateCount: 0,
        errorCount: 0,
        error: undefined,
        completedAt: undefined,
      });
    }

    let inserted = 0;
    let duplicates = 0;
    let candidatesCreated = 0;
    let quarantined = 0;

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

      const sourceHitId = await ctx.db.insert("sourceHits", {
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
        quarantineReason: source.quarantineReason,
        corroboration: source.corroboration,
        createdAt: now,
      });
      inserted += 1;
      if (source.quarantineReason) quarantined += 1;
      candidatesCreated += await materializeSource(ctx, workspace._id, sourceHitId, source, now);
    }

    await ctx.db.patch(runId, {
      status: quarantined > 0 ? "partial_failed" : "completed",
      hitCount: inserted,
      candidateCount: candidatesCreated,
      errorCount: quarantined,
      error:
        quarantined > 0
          ? `${quarantined} source item(s) quarantined after adoption-agent analysis.`
          : undefined,
      completedAt: Date.now(),
    });

    return { runId, inserted, duplicates, candidatesCreated, quarantined };
  },
});

/** Materializes source hits that were ingested before candidate extraction existed. */
export const materializePendingSources = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const workspace = await getWorkspace(ctx);
    const limit = Math.min(Math.max(args.limit ?? 250, 1), 250);
    const sourceHits = await ctx.db
      .query("sourceHits")
      .withIndex("by_workspaceId_and_publishedAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .take(limit);

    let created = 0;
    let linked = 0;
    for (const source of sourceHits) {
      if (source.quarantineReason) continue;
      const result = await materializeSource(ctx, workspace._id, source._id, source, Date.now());
      created += result;
      linked += result > 0 ? 1 : 0;
    }

    return { examined: sourceHits.length, created, linked };
  },
});

/** Recalculates legacy candidate scores from their linked source evidence. */
export const recalculateCandidateScores = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const workspace = await getWorkspace(ctx);
    const limit = Math.min(Math.max(args.limit ?? 250, 1), 250);
    const candidates = await ctx.db
      .query("dealCandidates")
      .withIndex("by_workspaceId_and_updatedAt", (q) => q.eq("workspaceId", workspace._id))
      .order("asc")
      .take(limit);

    let updated = 0;
    let skipped = 0;
    for (const candidate of candidates) {
      const editedFields = candidate.reviewEdits?.fields ?? [];
      if (
        editedFields.some((field) =>
          ["confidenceScore", "thesisFitScore", "sourceConfidence"].includes(field),
        )
      ) {
        skipped += 1;
        continue;
      }

      const links = await ctx.db
        .query("candidateSourceLinks")
        .withIndex("by_workspaceId_and_candidateId", (q) =>
          q.eq("workspaceId", workspace._id).eq("candidateId", candidate._id),
        )
        .take(12);
      const sourceHits = [];
      for (const link of links) {
        const source = await ctx.db.get(link.sourceHitId);
        if (source) sourceHits.push(source);
      }
      const source = sourceHits.sort((left, right) => {
        const classRank = (value: typeof left.sourceClass) =>
          value === "primary_structured" ? 0 : value === "secondary_signal" ? 1 : 2;
        return (
          classRank(left.sourceClass) - classRank(right.sourceClass) ||
          right.publishedAt - left.publishedAt
        );
      })[0];
      if (!source) {
        skipped += 1;
        continue;
      }

      const scores = calculateCandidateScores(
        source,
        {
          company: candidate.company,
          target: candidate.target,
          dealType: candidate.dealType,
          sector: candidate.sector,
          geography: candidate.geography,
          aiRole: candidate.aiRole,
        },
        Date.now(),
      );
      await ctx.db.patch(candidate._id, { ...scores, updatedAt: Date.now() });
      updated += 1;
    }

    return { examined: candidates.length, updated, skipped };
  },
});

async function getWorkspace(ctx: MutationCtx) {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
    .unique();
  if (!workspace) {
    throw new Error(`Workspace '${WORKSPACE_SLUG}' has not been seeded`);
  }
  return workspace;
}

async function materializeSource(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  sourceHitId: Id<"sourceHits">,
  source: SourceInput | Doc<"sourceHits">,
  now: number,
) {
  if (!isAdoptionSignal(source.headline, source.rawExcerpt)) {
    return 0;
  }

  const existingLink = await ctx.db
    .query("candidateSourceLinks")
    .withIndex("by_workspaceId_and_sourceHitId", (q) =>
      q.eq("workspaceId", workspaceId).eq("sourceHitId", sourceHitId),
    )
    .take(1);
  if (existingLink[0]) {
    return 0;
  }

  if ("quarantineReason" in source && source.quarantineReason) return 0;

  const extracted =
    "candidateDraft" in source && source.candidateDraft
      ? source.candidateDraft
      : extractCandidate(source);
  const scores = calculateCandidateScores(source, extracted, now);
  const draft = { ...extracted, ...scores };
  const externalId = `candidate:${source.hash}`;
  const dedupeKey = normalizeKey(`${draft.company}-${draft.target}`);
  const existingCandidate = await ctx.db
    .query("dealCandidates")
    .withIndex("by_workspaceId_and_dedupeKey", (q) =>
      q.eq("workspaceId", workspaceId).eq("dedupeKey", dedupeKey),
    )
    .take(1);

  let candidateId = existingCandidate[0]?._id;
  if (!candidateId) {
    candidateId = await ctx.db.insert("dealCandidates", {
      workspaceId,
      externalId,
      dedupeKey,
      status: "pending_review",
      company: draft.company,
      target: draft.target,
      dealType: draft.dealType,
      sector: draft.sector,
      geography: draft.geography,
      announcementDate: source.publishedAt,
      aiRole: draft.aiRole,
      confidenceScore: draft.confidenceScore,
      thesisFitScore: draft.thesisFitScore,
      sourceConfidence: draft.sourceConfidence,
      scoreBreakdown: draft.scoreBreakdown,
      reasoningSummary: draft.reasoningSummary,
      preReviewAssessment: draft.preReviewAssessment,
      createdAt: now,
      updatedAt: now,
    });

    for (const [field, value] of [
      ["Company", draft.company],
      ["Target", draft.target],
      ["Deal Type", draft.dealType],
      ["Sector", draft.sector],
      ["Geography", draft.geography],
      ["AI Role", draft.aiRole],
    ]) {
      await ctx.db.insert("candidateFacts", {
        workspaceId,
        candidateId,
        field,
        value,
        source: "ai",
        sourceHitId,
        updatedAt: now,
      });
    }

    await ctx.db.insert("domainEvents", {
      workspaceId,
      type: "candidate.materialized",
      version: 1,
      aggregateType: "dealCandidate",
      aggregateId: candidateId,
      correlationId: `materialize-${source.hash}`,
      actorType: "agent",
      actorId: "source-normalizer",
      data: JSON.stringify({ sourceHitId, sourceType: source.sourceType }),
      source: "ingest",
      createdAt: now,
    });
  }

  await ctx.db.insert("candidateSourceLinks", {
    workspaceId,
    candidateId,
    sourceHitId,
    sourceRole: source.sourceClass === "primary_structured" ? "primary" : "supporting",
    claimSummary: "Source used for candidate extraction and adoption scoring.",
    createdAt: now,
  });

  return existingCandidate[0] ? 0 : 1;
}

function isAdoptionSignal(headline: string, excerpt: string) {
  const text = `${headline} ${excerpt}`;
  return (
    /\b(acquire|acquires|acquired|acquisition|merger|merges|partner|partners|partnership|partnered|collaborat\w*|joint venture|invests in|invested in|investment in|funding|deploys?|implements?|integrates?|launches?)\b/i.test(
      text,
    ) &&
    /\b(ai|artificial intelligence|machine learning|generative|copilot|automation|model|robotics)\w*/i.test(
      text,
    )
  );
}

function extractCandidate(source: SourceInput | Doc<"sourceHits">) {
  const text = `${source.headline} ${source.rawExcerpt}`;
  const names = parseNames(source.headline);
  const dealType = /acqui|buy|merger/i.test(text)
    ? "acquisition"
    : /invest|funding|financ/i.test(text)
      ? "strategic_investment"
      : /partner|alliance|collaborat|team up/i.test(text)
        ? "strategic_partnership"
        : "product_launch";
  const sector = inferSector(text);
  return {
    externalId: `candidate:${source.hash}`,
    dedupeKey: normalizeKey(`${names.company}-${names.target}`),
    company: names.company,
    target: names.target,
    dealType,
    sector,
    geography: inferGeography(text),
    aiRole: inferAiRole(text),
    reasoningSummary:
      names.target === "Unknown"
        ? "AI adoption signal detected; target and transaction details require analyst review."
        : `AI adoption signal extracted from ${source.publisher}; transaction details require analyst review.`,
    preReviewAssessment: {
      signal: source.headline,
      interestingBecause:
        "The source indicates an AI adoption signal, but the available evidence requires analyst review before a stronger conclusion is drawn.",
      preliminaryThesis: "Preliminary thesis only; confidence is low because evidence is limited.",
      counterThesis:
        "The announcement may describe a product, marketing, or exploratory initiative rather than a durable adoption event.",
      evidenceRefs: [
        {
          claimId: "E1",
          claim: source.headline,
          relation: "supports" as const,
          sourceExternalIds: [source.externalId],
        },
      ],
      missingEvidence: [
        "Independent corroboration of the transaction or implementation details.",
        "Evidence of production deployment, commercial terms, or measurable adoption outcomes.",
      ],
      confidenceRationale:
        "The assessment is anchored to the supplied source only and should not be treated as a confirmed thesis.",
    },
  };
}

function parseNames(headline: string) {
  const clean = headline.replace(/\s*[|:-].*$/, "").trim();
  const match = clean.match(
    /^(.+?)\s+(?:acquires|acquired|buys|bought|partners with|partnered with|invests in|invested in|teams up with)\s+(.+)$/i,
  );
  if (!match) {
    return { company: clean.split(/\s+/).slice(0, 5).join(" ") || "Unknown", target: "Unknown" };
  }
  return {
    company: cleanName(match[1]),
    target: cleanName(match[2]),
  };
}

function inferSector(text: string) {
  const sectors = [
    ["healthcare", /health|clinical|hospital|medical|pharma|patient/i],
    ["fintech", /fintech|bank|payment|investment|capital|trading|financial/i],
    ["insurance", /insurance|insurtech|claims|underwriting/i],
    ["legal", /legal|law firm|compliance|regulatory/i],
    ["retail", /retail|commerce|shopping|consumer/i],
    ["energy", /energy|utility|solar|oil|gas/i],
    ["logistics", /logistics|supply chain|shipping|freight/i],
    ["marketing", /marketing|advertising|brand|media/i],
    ["industrial", /manufactur|factory|industrial|robotics/i],
    ["education", /education|school|university|student/i],
  ] as const;
  return sectors.find(([, pattern]) => pattern.test(text))?.[0] ?? "other";
}

function inferGeography(text: string) {
  const places = [
    ["United States", /\b(US|USA|United States|America)\b/i],
    ["United Kingdom", /\b(UK|United Kingdom|Britain)\b/i],
    ["Australia", /\b(Australia|Sydney|Melbourne)\b/i],
    ["South Africa", /\b(South Africa|Johannesburg|Cape Town)\b/i],
    ["Europe", /\b(Europe|European|EU)\b/i],
  ] as const;
  return places.find(([, pattern]) => pattern.test(text))?.[0] ?? "Global / Unknown";
}

function inferAiRole(text: string) {
  if (/claims|underwriting|fraud/i.test(text)) return "claims automation";
  if (/clinical|patient|hospital|medical/i.test(text)) return "clinical workflow support";
  if (/investment|trading|capital|financial/i.test(text)) return "investment intelligence";
  if (/legal|compliance|regulatory/i.test(text)) return "compliance automation";
  if (/marketing|advertising|brand/i.test(text)) return "marketing automation";
  if (/robotics|manufactur|factory/i.test(text)) return "industrial automation";
  return "AI integration and workflow automation";
}

function cleanName(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .slice(0, 160);
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}
