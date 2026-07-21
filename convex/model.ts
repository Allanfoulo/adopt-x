import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

export const WORKSPACE_SLUG = "adopt-x-demo";

export const candidateStatusLabels: Record<Doc<"dealCandidates">["status"], string> = {
  new: "New",
  normalized: "Normalized",
  scored: "Scored",
  pending_review: "Needs Review",
  approved: "Approved",
  rejected: "Rejected",
  brief_queued: "Brief Queued",
  brief_ready: "Brief Ready",
  brief_failed: "Brief Failed",
};

export const statusOrder: Doc<"dealCandidates">["status"][] = [
  "pending_review",
  "brief_queued",
  "brief_ready",
  "rejected",
  "approved",
  "brief_failed",
];

export function titleCase(value: string): string {
  return value
    .split(/[_\s/]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDateLabel(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export async function getDemoWorkspace(ctx: QueryCtx): Promise<Doc<"workspaces"> | null> {
  return await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", WORKSPACE_SLUG))
    .unique();
}

export async function getDemoWorkspaceId(ctx: QueryCtx): Promise<Id<"workspaces"> | null> {
  const workspace = await getDemoWorkspace(ctx);
  return workspace?._id ?? null;
}

export function emptyQueueCounts() {
  return statusOrder.map((status) => ({
    status,
    label: candidateStatusLabels[status],
    value: 0,
  }));
}

export function countByStatus(candidates: Doc<"dealCandidates">[]) {
  const counts = new Map<Doc<"dealCandidates">["status"], number>();
  for (const status of statusOrder) {
    counts.set(status, 0);
  }
  for (const candidate of candidates) {
    counts.set(candidate.status, (counts.get(candidate.status) ?? 0) + 1);
  }
  return statusOrder.map((status) => ({
    status,
    label: candidateStatusLabels[status],
    value: counts.get(status) ?? 0,
  }));
}

export function countByField<T extends string>(
  rows: Doc<"dealCandidates">[],
  getValue: (row: Doc<"dealCandidates">) => T,
) {
  const counts = new Map<T, number>();
  for (const row of rows) {
    const value = getValue(row);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
