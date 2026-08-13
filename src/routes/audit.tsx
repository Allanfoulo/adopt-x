import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { FunctionReturnType } from "convex/server";
import { AppShell, Panel, StatusBadge } from "@/components/app-shell";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit Log - Adopt X" }] }),
  component: AuditLog,
});

type AuditEvent = FunctionReturnType<typeof api.audit.list>[number];
type EntityFilter = "all" | "candidate" | "brief" | "workspace";

function AuditLog() {
  const events = useQuery(api.audit.list, { limit: 200 });
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");

  const visibleEvents =
    events?.filter((event) => {
      const haystack = [event.actor, event.actorType, event.action, event.target, event.reason]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      const matchesEntity = entityFilter === "all" || event.entityType === entityFilter;
      return matchesSearch && matchesEntity;
    }) ?? [];

  return (
    <AppShell
      title="Audit Log"
      subtitle="Follow workspace decisions, review actions, and system activity"
      actions={
        <Link
          to="/settings"
          className="inline-flex h-9 items-center justify-center rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] font-medium text-text-primary transition-colors hover:bg-surface-hover"
        >
          Audit settings
        </Link>
      }
    >
      <div className="space-y-5">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-hairline-soft px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <div className="text-[12px] font-semibold text-text-primary">Workspace activity</div>
              <div className="mt-1 text-[10.5px] text-text-secondary">
                Live events from Convex, newest first.
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block min-w-0 sm:w-64">
                <span className="sr-only">Search audit log</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search audit log..."
                  className="h-9 w-full rounded-md border border-hairline bg-surface-1 pl-9 pr-3 text-[10.5px] text-text-primary outline-none placeholder:text-text-muted focus:border-lime/50"
                />
              </label>
              <label>
                <span className="sr-only">Filter audit entity</span>
                <select
                  value={entityFilter}
                  onChange={(event) => setEntityFilter(event.target.value as EntityFilter)}
                  className="h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary outline-none focus:border-lime/50 sm:w-36"
                >
                  <option value="all">All entities</option>
                  <option value="candidate">Candidates</option>
                  <option value="brief">Briefs</option>
                  <option value="workspace">Workspace</option>
                </select>
              </label>
            </div>
          </div>

          {events === undefined ? (
            <AuditLoadingState />
          ) : visibleEvents.length === 0 ? (
            <AuditEmptyState hasFilters={Boolean(search || entityFilter !== "all")} />
          ) : (
            <AuditTable events={visibleEvents} />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

function AuditTable({ events }: { events: AuditEvent[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[720px] w-full text-left text-[10.5px]">
        <thead className="border-b border-hairline-soft text-[9px] uppercase tracking-[0.12em] text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium sm:px-5">When</th>
            <th className="py-3 pr-4 font-medium">Actor</th>
            <th className="py-3 pr-4 font-medium">Action</th>
            <th className="py-3 pr-4 font-medium">Target</th>
            <th className="py-3 pr-4 font-medium">Detail</th>
            <th className="py-3 pr-4 font-medium">Reference</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-t border-hairline-soft align-top">
              <td className="whitespace-nowrap px-4 py-4 text-text-secondary sm:px-5">
                {event.when}
              </td>
              <td className="py-4 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-2 text-[9px] font-semibold text-text-primary">
                    {event.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-text-primary">{event.actor}</div>
                    <div className="mt-0.5 text-[9px] text-text-muted">{event.actorType}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4 whitespace-nowrap">
                <StatusBadge status={event.action} size="xs" />
              </td>
              <td className="max-w-[220px] py-4 pr-4 text-text-primary">{event.target}</td>
              <td className="max-w-[260px] py-4 pr-4 text-text-secondary">{event.reason}</td>
              <td className="py-4 pr-4">
                {event.destination?.type === "candidate" ? (
                  <Link
                    to="/candidate"
                    search={{ externalId: event.destination.externalId }}
                    className="inline-flex items-center gap-1 text-info hover:text-lime"
                  >
                    Open candidate
                  </Link>
                ) : event.destination?.type === "brief" ? (
                  <Link
                    to="/briefs/$externalId"
                    params={{ externalId: event.destination.externalId }}
                    className="inline-flex items-center gap-1 text-info hover:text-lime"
                  >
                    Open brief
                  </Link>
                ) : (
                  <span className="text-text-muted">Unlinked</span>
                )}
                <div
                  className="mono mt-1 max-w-[170px] truncate text-[8.5px] text-text-muted"
                  title={event.correlationId}
                >
                  {event.correlationId}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditLoadingState() {
  return (
    <div className="space-y-3 px-4 py-6 sm:px-5">
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="h-12 animate-pulse rounded-md bg-surface-2/60" />
      ))}
    </div>
  );
}

function AuditEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
      <ShieldCheck className="h-8 w-8 text-text-muted" />
      <div className="mt-3 text-[12px] font-semibold text-text-primary">
        {hasFilters ? "No matching audit events" : "No audit events recorded"}
      </div>
      <p className="mt-1 max-w-sm text-[10.5px] text-text-secondary">
        {hasFilters
          ? "Try a different search term or entity filter."
          : "Review events will appear here as scans, approvals, edits, and brief runs progress."}
      </p>
    </div>
  );
}
