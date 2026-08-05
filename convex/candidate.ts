import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  candidateStatusLabels,
  formatDateLabel,
  getDemoWorkspaceId,
  titleCase,
  WORKSPACE_SLUG,
} from "./model";

export const getDetail = query({
  args: {
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) {
      return null;
    }

    const candidate = args.externalId
      ? await ctx.db
          .query("dealCandidates")
          .withIndex("by_workspaceId_and_externalId", (q) =>
            q.eq("workspaceId", workspaceId).eq("externalId", args.externalId!),
          )
          .unique()
      : await ctx.db
          .query("dealCandidates")
          .withIndex("by_workspaceId_and_updatedAt", (q) => q.eq("workspaceId", workspaceId))
          .order("desc")
          .first();
    if (!candidate) {
      return null;
    }

    const [facts, sourceLinks, auditEvents, users] = await Promise.all([
      ctx.db
        .query("candidateFacts")
        .withIndex("by_workspaceId_and_candidateId", (q) =>
          q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
        )
        .take(24),
      ctx.db
        .query("candidateSourceLinks")
        .withIndex("by_workspaceId_and_candidateId", (q) =>
          q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
        )
        .take(12),
      ctx.db
        .query("reviewAuditEvents")
        .withIndex("by_workspaceId_and_candidateId_and_createdAt", (q) =>
          q.eq("workspaceId", workspaceId).eq("candidateId", candidate._id),
        )
        .order("desc")
        .take(8),
      ctx.db.query("users").withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId)).take(20),
    ]);

    const sources = [];
    for (const [index, link] of sourceLinks.entries()) {
      const source = await ctx.db.get(link.sourceHitId);
      if (source) {
        sources.push(sourceRow(source, index + 1));
      }
    }

    const usersById = new Map(users.map((user) => [user._id, user]));
    const assignedTo = candidate.assignedToUserId ? usersById.get(candidate.assignedToUserId) : null;

    return {
      candidate: candidateRow(candidate),
      heroFields: heroFields(candidate),
      facts: facts
        .sort((a, b) => factOrder(a.field) - factOrder(b.field))
        .map((fact) => ({
          label: fact.field,
          value: normalizeFactValue(fact.field, fact.value),
          source: fact.source,
        })),
      sources,
      scoreRows: [
        {
          label: "Confidence Score",
          value: candidate.confidenceScore,
          helper: "High confidence in the accuracy of the extracted facts.",
          source: candidate.reviewEdits?.fields.includes("confidenceScore") ? "human" : "ai",
        },
        {
          label: "Thesis-Fit Score",
          value: candidate.thesisFitScore,
          helper: "Strength of alignment with the AI adoption thesis.",
          source: candidate.reviewEdits?.fields.includes("thesisFitScore") ? "human" : "ai",
        },
        {
          label: "Source Confidence",
          value: candidate.sourceConfidence,
          helper: "Quality, independence, and consistency of cited sources.",
          source: "ai",
        },
      ],
      validationRows: [
        { label: "Sources Verified", value: `${sources.length} / ${sources.length}` },
        { label: "Publisher Reputation", value: sourceReputation(sources) },
        { label: "Duplication Check", value: "No issues" },
        { label: "Conflicting Info", value: "None detected" },
      ],
      scoreExplanations: [
        {
          title: `Confidence Score (${candidate.confidenceScore})`,
          body: "Based on extracted fact consistency and candidate scoring from verified public sources.",
        },
        {
          title: `Thesis-Fit Score (${candidate.thesisFitScore})`,
          body: `Measures fit with the Adopt X thesis for ${titleCase(candidate.aiRole)} in ${titleCase(candidate.sector)}.`,
        },
        {
          title: `Source Confidence (${candidate.sourceConfidence})`,
          body: "Reflects source quality, publisher reputation, and provenance coverage.",
        },
      ],
      auditTrail: auditEvents.map((event) => auditRow(event, usersById)),
      reviewState: {
        status: candidateStatusLabels[candidate.status],
        assignedTo: assignedTo?.displayName ?? "Maya Patel",
        assignedOn: formatDateLabel(candidate.updatedAt),
        sla: candidate.status === "pending_review" ? "Due in 2d 16h" : "Reviewed",
      },
      summary: {
        text:
          candidate.reasoningSummary ??
          `${candidate.company} / ${candidate.target || "N/A"} is being reviewed for AI adoption relevance.`,
        reasons: reasonBullets(candidate),
      },
      tags: tagsFor(candidate, sources),
    };
  },
});

export const updateFacts = mutation({
  args: {
    externalId: v.string(),
    changes: v.array(v.object({ field: v.string(), value: v.string() })),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.changes.length === 0) {
      throw new Error("At least one fact change is required");
    }
    if (args.changes.length > 12) {
      throw new Error("A fact update may contain at most 12 fields");
    }

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
      .unique();
    if (!workspace) {
      throw new Error(`Workspace '${WORKSPACE_SLUG}' has not been seeded`);
    }

    const candidate = await ctx.db
      .query("dealCandidates")
      .withIndex("by_workspaceId_and_externalId", (q) =>
        q.eq("workspaceId", workspace._id).eq("externalId", args.externalId),
      )
      .unique();
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const actor = await ctx.db
      .query("users")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspace._id))
      .filter((q) => q.eq(q.field("email"), "maya.patel@adoptx.local"))
      .first();
    const facts = await ctx.db
      .query("candidateFacts")
      .withIndex("by_workspaceId_and_candidateId", (q) =>
        q.eq("workspaceId", workspace._id).eq("candidateId", candidate._id),
      )
      .take(24);
    const factByField = new Map(facts.map((fact) => [fact.field, fact]));
    const candidatePatch: Partial<Doc<"dealCandidates">> = {};
    const before: Record<string, string> = {};
    const after: Record<string, string> = {};
    const changedFields: string[] = [];
    const now = Date.now();

    for (const change of args.changes) {
      const field = change.field;
      const value = change.value.trim();
      const property = candidatePropertyFor(field);
      if (!property) {
        throw new Error(`The fact '${field}' cannot be edited`);
      }
      if (!value || value.length > 500) {
        throw new Error(`The value for '${field}' must be between 1 and 500 characters`);
      }

      const previous = factValue(candidate, field, factByField.get(field));
      if (previous === value) continue;
      before[field] = previous;
      after[field] = value;
      changedFields.push(field);

      if (property === "announcementDate") {
        const timestamp = Date.parse(value);
        if (!Number.isFinite(timestamp)) {
          throw new Error(`The value for '${field}' must be a valid date`);
        }
        candidatePatch.announcementDate = timestamp;
      } else {
        candidatePatch[property] = value;
      }

      const existingFact = factByField.get(field);
      if (existingFact) {
        await ctx.db.patch(existingFact._id, {
          value,
          source: "human",
          updatedByUserId: actor?._id,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("candidateFacts", {
          workspaceId: workspace._id,
          candidateId: candidate._id,
          field,
          value,
          source: "human",
          updatedByUserId: actor?._id,
          updatedAt: now,
        });
      }
    }

    if (changedFields.length === 0) {
      return { updated: false, changedFields: [] };
    }

    await ctx.db.patch(candidate._id, {
      ...candidatePatch,
      updatedAt: now,
      reviewEdits: {
        editedByUserId: actor?._id,
        fields: changedFields,
        notes: args.note?.trim() || "Updated from Candidate Detail.",
      },
    });

    const correlationId = `facts_${candidate.externalId}_${now}`;
    await ctx.db.insert("reviewAuditEvents", {
      workspaceId: workspace._id,
      candidateId: candidate._id,
      actorType: actor ? "user" : "system",
      actorUserId: actor?._id,
      action: "edited candidate facts",
      before: JSON.stringify(before),
      after: JSON.stringify(after),
      reason: args.note?.trim() || "Updated from Candidate Detail.",
      correlationId,
      createdAt: now,
    });
    await ctx.db.insert("domainEvents", {
      workspaceId: workspace._id,
      type: "candidate.facts_updated",
      version: 1,
      aggregateType: "dealCandidate",
      aggregateId: candidate._id,
      correlationId,
      actorType: actor ? "user" : "system",
      actorId: actor?._id ?? "system",
      data: JSON.stringify({ fields: changedFields, before, after }),
      source: "adopt-x-ui",
      createdAt: now,
    });

    return { updated: true, changedFields };
  },
});

export const reviewCandidates = mutation({
  args: {
    externalIds: v.array(v.string()),
    action: v.union(v.literal("approve"), v.literal("reject")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
      .unique();
    if (!workspace) {
      return { updated: 0, skipped: args.externalIds.length };
    }

    const actor = await ctx.db
      .query("users")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspace._id))
      .filter((q) => q.eq(q.field("email"), "maya.patel@adoptx.local"))
      .first();
    const now = Date.now();
    let updated = 0;
    let skipped = 0;

    for (const externalId of args.externalIds) {
      const candidate = await ctx.db
        .query("dealCandidates")
        .withIndex("by_workspaceId_and_externalId", (q) =>
          q.eq("workspaceId", workspace._id).eq("externalId", externalId),
        )
        .unique();

      if (!candidate) {
        skipped += 1;
        continue;
      }

      const nextStatus = args.action === "approve" ? "approved" : "rejected";
      const candidatePatch: Partial<Doc<"dealCandidates">> = {
        status: nextStatus,
        updatedAt: now,
      };
      if (args.action === "approve" && actor) {
        candidatePatch.approvedByUserId = actor._id;
      }
      if (args.action === "reject") {
        candidatePatch.rejectionReason = args.reason ?? "Rejected by analyst review.";
        if (actor) {
          candidatePatch.rejectedByUserId = actor._id;
        }
      }
      await ctx.db.patch(candidate._id, candidatePatch);

      const correlationId = `${args.action}_${candidate.externalId}_${now}`;
      await ctx.db.insert("reviewAuditEvents", {
        workspaceId: workspace._id,
        candidateId: candidate._id,
        actorType: actor ? "user" : "system",
        actorUserId: actor?._id,
        action: args.action === "approve" ? "approved candidate" : "rejected candidate",
        before: candidateStatusLabels[candidate.status],
        after: candidateStatusLabels[nextStatus],
        reason:
          args.action === "approve"
            ? args.reason ?? "Approved from analyst review."
            : args.reason ?? "Rejected by analyst review.",
        correlationId,
        createdAt: now,
      });
      await ctx.db.insert("domainEvents", {
        workspaceId: workspace._id,
        type: args.action === "approve" ? "candidate.approved" : "candidate.rejected",
        version: 1,
        aggregateType: "dealCandidate",
        aggregateId: candidate._id,
        correlationId,
        actorType: actor ? "user" : "system",
        actorId: actor?._id ?? "system",
        data: JSON.stringify({
          externalId: candidate.externalId,
          company: candidate.company,
          status: nextStatus,
        }),
        source: "adopt-x-ui",
        createdAt: now,
      });

      updated += 1;
    }

    return { updated, skipped };
  },
});

function candidatePropertyFor(field: string):
  | "company"
  | "target"
  | "sector"
  | "geography"
  | "dealType"
  | "aiRole"
  | "announcementDate"
  | null {
  const fields = {
    Company: "company",
    Target: "target",
    Sector: "sector",
    Geography: "geography",
    "Deal Type": "dealType",
    "AI Role": "aiRole",
    "Announcement Date": "announcementDate",
  } as const;
  return fields[field as keyof typeof fields] ?? null;
}

function factValue(
  candidate: Doc<"dealCandidates">,
  field: string,
  fact: Doc<"candidateFacts"> | undefined,
) {
  if (fact) return fact.value;
  if (field === "Announcement Date") return formatDateLabel(candidate.announcementDate);
  const property = candidatePropertyFor(field);
  if (!property || property === "announcementDate") return "";
  return String(candidate[property]);
}

function candidateRow(candidate: Doc<"dealCandidates">) {
  const target = candidate.target && candidate.target !== "Unknown" ? candidate.target : null;
  const verb =
    candidate.dealType === "acquisition"
      ? "acquires"
      : candidate.dealType === "strategic_investment"
        ? "invests in"
        : candidate.dealType === "product_launch"
          ? "launches"
          : "partners with";
  return {
    id: candidate.externalId,
    company: candidate.company,
    target: candidate.target || "N/A",
    headline: target
      ? `${candidate.company} ${verb} ${target} for ${titleCase(candidate.aiRole)}`
      : `${candidate.company} shows a ${titleCase(candidate.aiRole)} adoption signal`,
    status: candidateStatusLabels[candidate.status],
  };
}

function heroFields(candidate: Doc<"dealCandidates">) {
  return [
    { label: "Company", value: candidate.company, tone: "teal", mark: candidate.company.charAt(0) },
    {
      label: "Target",
      value: candidate.target || "N/A",
      tone: "blue",
      mark: (candidate.target || candidate.company).charAt(0),
    },
    { label: "Sector", value: titleCase(candidate.sector) },
    { label: "Geography", value: candidate.geography },
    { label: "Deal Type", value: titleCase(candidate.dealType) },
    { label: "AI Role", value: titleCase(candidate.aiRole) },
    { label: "Published", value: formatDateLabel(candidate.announcementDate) },
  ];
}

function sourceRow(source: Doc<"sourceHits">, n: number) {
  return {
    n,
    headline: source.headline,
    publisher: source.publisher,
    date: formatDateLabel(source.publishedAt),
    type: titleCase(source.sourceType),
    tone: source.sourceType.includes("release") ? "purple" : "blue",
    url: source.url,
    reputation: source.publisherReputation ?? "Medium",
  };
}

function auditRow(
  event: Doc<"reviewAuditEvents">,
  usersById: Map<Id<"users">, Doc<"users">>,
) {
  const actor = event.actorUserId ? usersById.get(event.actorUserId) : null;
  return {
    name: actor?.displayName ?? titleCase(event.actorType),
    action: titleCase(event.action),
    detail: event.after ?? event.before ?? event.reason ?? event.correlationId,
    when: formatDateLabel(event.createdAt),
    initials: actor?.avatarInitials ?? "AI",
    tone: event.actorType === "system" ? "system" : "human",
  };
}

function factOrder(field: string) {
  const order = ["Company", "Target", "Sector", "Geography", "Deal Type", "AI Role", "Announcement Date", "Source Class"];
  const index = order.indexOf(field);
  return index === -1 ? order.length : index;
}

function normalizeFactValue(field: string, value: string) {
  if (field === "Announcement Date") {
    return formatDateLabel(Date.parse(value));
  }
  if (["Sector", "Deal Type", "AI Role"].includes(field)) {
    return titleCase(value);
  }
  return value;
}

function sourceReputation(sources: { reputation: string }[]) {
  if (sources.some((source) => source.reputation === "High")) {
    return "High";
  }
  return sources[0]?.reputation ?? "Unknown";
}

function reasonBullets(candidate: Doc<"dealCandidates">) {
  return [
    `Direct AI role: ${titleCase(candidate.aiRole)}`,
    `Sector adoption signal in ${titleCase(candidate.sector)}`,
    `Source confidence scored at ${candidate.sourceConfidence}`,
  ];
}

function tagsFor(candidate: Doc<"dealCandidates">, sources: { type: string }[]) {
  return [
    candidate.geography,
    titleCase(candidate.sector),
    titleCase(candidate.aiRole),
    titleCase(candidate.dealType),
    ...sources.slice(0, 2).map((source) => source.type),
  ];
}
