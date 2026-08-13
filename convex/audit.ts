import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { formatDateLabel, getDemoWorkspaceId, titleCase } from "./model";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const workspaceId = await getDemoWorkspaceId(ctx);
    if (!workspaceId) return [];

    const limit = Math.min(Math.max(Math.floor(args.limit ?? 100), 1), 200);
    const events = await ctx.db
      .query("reviewAuditEvents")
      .withIndex("by_workspaceId_and_createdAt", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(limit);

    const [users, candidates, briefs] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
        .take(50),
      getReferencedCandidates(ctx, events),
      getReferencedBriefs(ctx, events),
    ]);
    const usersById = new Map(users.map((user) => [user._id, user]));

    return events.map((event) => {
      const candidate = event.candidateId ? candidates.get(event.candidateId) : undefined;
      const brief = event.briefId ? briefs.get(event.briefId) : undefined;
      const target = candidate
        ? `${candidate.company} / ${candidate.target || "Unknown"}`
        : brief
          ? `Brief ${brief.externalId}`
          : (event.reason ?? "Workspace activity");

      return {
        id: event._id,
        actor: event.actorUserId
          ? (usersById.get(event.actorUserId)?.displayName ?? titleCase(event.actorType))
          : titleCase(event.actorType),
        actorType: titleCase(event.actorType),
        initials: event.actorUserId
          ? (usersById.get(event.actorUserId)?.avatarInitials ?? "AX")
          : "AX",
        action: titleCase(event.action),
        target,
        reason: event.reason ?? event.after ?? event.before ?? "No additional detail recorded.",
        correlationId: event.correlationId,
        when: formatDateLabel(event.createdAt),
        createdAt: event.createdAt,
        entityType: candidate ? "candidate" : brief ? "brief" : "workspace",
        destination: candidate
          ? { type: "candidate" as const, externalId: candidate.externalId }
          : brief
            ? { type: "brief" as const, externalId: brief.externalId }
            : null,
      };
    });
  },
});

async function getReferencedCandidates(ctx: QueryCtx, events: Doc<"reviewAuditEvents">[]) {
  const ids = [
    ...new Set(events.flatMap((event) => (event.candidateId ? [event.candidateId] : []))),
  ];
  const rows = await Promise.all(ids.map((id) => ctx.db.get(id)));
  return new Map(
    rows.filter((row): row is Doc<"dealCandidates"> => row !== null).map((row) => [row._id, row]),
  );
}

async function getReferencedBriefs(ctx: QueryCtx, events: Doc<"reviewAuditEvents">[]) {
  const ids = [...new Set(events.flatMap((event) => (event.briefId ? [event.briefId] : [])))];
  const rows = await Promise.all(ids.map((id) => ctx.db.get(id)));
  return new Map(
    rows.filter((row): row is Doc<"dealBriefs"> => row !== null).map((row) => [row._id, row]),
  );
}
