import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Info,
  Lock,
  X,
} from "lucide-react";
import { AppShell, Panel } from "@/components/app-shell";
import { useToast } from "@/components/app-toast";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings - Adopt X" }] }),
  component: Settings,
});

type SourceGroup = "Structured" | "Community";

type SourceRow = {
  name: string;
  description: string;
  group: SourceGroup;
  enabled: boolean;
};

const structuredSources: SourceRow[] = [
  {
    name: "Exchange Announcements",
    description: "ASX / LSE / NYSE / NASDAQ",
    group: "Structured",
    enabled: true,
  },
  {
    name: "IR Pages",
    description: "Investor relations & company sites",
    group: "Structured",
    enabled: true,
  },
  {
    name: "PR Wires",
    description: "Business & financial news wires",
    group: "Structured",
    enabled: true,
  },
  {
    name: "Sector Press",
    description: "Industry & sector publications",
    group: "Structured",
    enabled: true,
  },
  {
    name: "Business Press",
    description: "Major business & financial publications",
    group: "Structured",
    enabled: true,
  },
] as const;

const communitySources: SourceRow[] = [
  {
    name: "Reddit",
    description: "Subreddits & company mentions",
    group: "Community",
    enabled: false,
  },
  {
    name: "X / Twitter Lists",
    description: "Curated lists & company handles",
    group: "Community",
    enabled: false,
  },
  {
    name: "Substack / Blogs",
    description: "Independent analysis & newsletters",
    group: "Community",
    enabled: false,
  },
  {
    name: "YouTube Transcripts",
    description: "Earnings calls & related content",
    group: "Community",
    enabled: false,
  },
] as const;

const provenanceRules = [
  { label: "Require source URL", type: "toggle" as const, enabled: true },
  { label: "Minimum source confidence", type: "select" as const, value: "Medium" },
  { label: "Publisher reputation floor", type: "select" as const, value: "Medium" },
  { label: "Detect conflicting info", type: "toggle" as const, enabled: true },
  { label: "Duplicate content check", type: "toggle" as const, enabled: true },
] as const;

const scanCadenceRows = [
  { label: "Scan cadence", type: "select" as const, value: "Continuous (15 min)" },
  { label: "Next scheduled scan", type: "value" as const, value: "Today, 08:45 AM", accent: "success" as const },
  {
    label: "Last scan run",
    type: "status" as const,
    value: "Today, 08:32 AM",
    status: "Completed",
  },
  {
    label: "Timezone",
    type: "select" as const,
    value: "(UTC+10:00) Australia/Sydney",
  },
] as const;

const enrichmentRows = [
  { label: "Dedupe similarity threshold", type: "select" as const, value: "85%" },
  { label: "Scoring threshold for Brief Ready", type: "select" as const, value: "80" },
  { label: "Brief generation default", type: "select" as const, value: "AI assisted with analyst edit" },
  { label: "Last 30 days enrichment after approval", type: "toggle" as const, enabled: true },
  { label: "Event retention (days)", type: "select" as const, value: "90" },
  { label: "Provenance validation rules", type: "select" as const, value: "Strict" },
] as const;

const runtimeRows = [
  { label: "Max parallel scans", value: "6" },
  { label: "AI model tier", value: "Standard (Balanced)" },
  { label: "Rate limit backoff", value: "Exponential (Default)" },
  { label: "Data residency", value: "Australia (au-southeast-2)" },
  { label: "Audit log retention (days)", value: "365" },
] as const;

const reviewGateSteps = [
  {
    title: "Scan & Ingest",
    description: "Sources are scanned and new items are ingested with provenance.",
    state: "complete",
  },
  {
    title: "Enrich & Score",
    description: "Content is enriched, deduped, and scored for relevance & confidence.",
    state: "complete",
  },
  {
    title: "Analyst Review",
    description: "Analysts review facts, sources, and scoring. Edits and notes added.",
    state: "active",
  },
  {
    title: "Approve / Reject",
    description: "Analyst approves to queue for brief or rejects with reason.",
    state: "pending",
  },
  {
    title: "Brief Generation",
    description: "Approved items are drafted and queued or published.",
    state: "pending",
  },
] as const;

function Settings() {
  const { info } = useToast();
  const [saveBannerVisible, setSaveBannerVisible] = useState(true);

  return (
    <AppShell
      title="Settings"
      subtitle="Configure sources, scans, enrichment, and governance"
      actions={
        saveBannerVisible ? (
          <SettingsSavedBanner onDismiss={() => setSaveBannerVisible(false)} />
        ) : null
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.98fr)_344px]">
        <div className="space-y-5">
          <SourceTogglesPanel />
          <ProvenanceRulesPanel />
        </div>

        <div className="space-y-5">
          <ScanCadencePanel />
          <EnrichmentControlsPanel />
          <RuntimeConfigPanel />
        </div>

        <div className="space-y-5">
          <HumanReviewGatePanel />
          <PermissionsPanel
            onRequestAccess={() =>
              info({
                title: "Access request queued",
                description:
                  "Admin review will notify you when elevated settings access is available.",
                action: { label: "View request", emphasis: "secondary" },
              })
            }
            onViewAuditLogs={() =>
              info({
                title: "Audit logs selected",
                description: "Settings audit history is available in the operational archive.",
                action: { label: "Open audit trail", emphasis: "secondary" },
              })
            }
          />
        </div>
      </div>
    </AppShell>
  );
}

function SettingsSavedBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="flex w-full items-start gap-3 rounded-xl border px-4 py-3 sm:w-[324px]"
      style={{
        borderColor: "rgba(183,241,55,0.35)",
        background:
          "linear-gradient(180deg, rgba(183,241,55,0.08), rgba(13,23,30,0.92) 60%)",
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: "rgba(183,241,55,0.14)", color: "#B7F137" }}
      >
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-text-primary">Settings saved</div>
        <div className="mt-1 text-[10.5px] text-text-secondary">
          Your preferences have been updated.
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss settings saved banner"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-text-muted transition-colors hover:border-hairline hover:bg-surface-2 hover:text-text-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SourceTogglesPanel() {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Source Toggles" />
      <div className="space-y-5 px-4 pb-4 sm:px-5 sm:pb-5">
        <SourceGroupSection
          title="Structured Public Sources (enabled by default)"
          count="5 / 5 enabled"
          rows={structuredSources}
        />
        <SourceGroupSection
          title="Secondary & Community Sources (optional)"
          count="0 / 4 enabled"
          rows={communitySources}
        />
        <div className="text-[10px] text-text-muted">
          Source availability may vary by region and plan.
        </div>
      </div>
    </Panel>
  );
}

function SourceGroupSection({
  title,
  count,
  rows,
}: {
  title: string;
  count: string;
  rows: readonly SourceRow[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-hairline-soft pb-3">
        <div className="text-[11px] text-text-secondary">{title}</div>
        <div className="text-[11px] text-text-secondary">{count}</div>
      </div>
      <div>
        {rows.map((row) => (
          <SourceToggleRow key={row.name} row={row} />
        ))}
      </div>
    </div>
  );
}

function SourceToggleRow({ row }: { row: SourceRow }) {
  const [enabled, setEnabled] = useState(row.enabled);

  return (
    <div className="flex items-start gap-3 border-b border-hairline-soft py-3 last:border-b-0">
      <ToggleSwitch enabled={enabled} onToggle={() => setEnabled((value) => !value)} />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-text-primary">{row.name}</div>
        <div className="mt-0.5 text-[10px] text-text-secondary">{row.description}</div>
      </div>
      <SourceBadge group={row.group} />
    </div>
  );
}

function ProvenanceRulesPanel() {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Provenance & Quality Rules" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        {provenanceRules.map((row) => (
          <SettingsRuleRow key={row.label} row={row} />
        ))}
        <div className="pt-3 text-[10px] text-text-muted">
          Rules apply before content is submitted for review.
        </div>
      </div>
    </Panel>
  );
}

function ScanCadencePanel() {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Scan Cadence Controls" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        {scanCadenceRows.map((row) => (
          <SettingsFieldRow key={row.label} label={row.label}>
            {row.type === "select" ? (
              <CompactSelect value={row.value} />
            ) : row.type === "value" ? (
              <ValueText value={row.value} accent={row.accent} />
            ) : (
              <StatusValue value={row.value} status={row.status} />
            )}
          </SettingsFieldRow>
        ))}
      </div>
    </Panel>
  );
}

function EnrichmentControlsPanel() {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Enrichment Controls" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        {enrichmentRows.map((row) => (
          <SettingsFieldRow key={row.label} label={row.label}>
            {row.type === "toggle" ? (
              <InlineToggle enabled={row.enabled} />
            ) : (
              <CompactSelect value={row.value} />
            )}
          </SettingsFieldRow>
        ))}
        <div className="pt-3 text-[10px] text-text-muted">
          Higher similarity reduces duplicates. Strict provenance may reduce throughput.
        </div>
      </div>
    </Panel>
  );
}

function RuntimeConfigPanel() {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Runtime Config" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        {runtimeRows.map((row) => (
          <SettingsFieldRow key={row.label} label={row.label}>
            <CompactSelect value={row.value} />
          </SettingsFieldRow>
        ))}
      </div>
    </Panel>
  );
}

function HumanReviewGatePanel() {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Human Review Gate" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="text-[10.5px] text-text-secondary">
          No brief becomes final without analyst approval.
        </div>
        <div className="mt-6 space-y-1">
          {reviewGateSteps.map((step, index) => (
            <ReviewGateStep
              key={step.title}
              step={step}
              index={index + 1}
              isLast={index === reviewGateSteps.length - 1}
            />
          ))}
        </div>
        <div
          className="mt-5 flex items-start gap-3 rounded-lg border px-3 py-3"
          style={{
            borderColor: "rgba(245,165,36,0.24)",
            background: "rgba(245,165,36,0.05)",
          }}
        >
          <div
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(245,165,36,0.24)", color: "#A9B4BE" }}
          >
            <Info className="h-3 w-3" />
          </div>
          <div className="text-[10.5px] leading-relaxed text-text-secondary">
            Analyst approval is required for all brief-ready items. Automated briefs are never
            final.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PermissionsPanel({
  onRequestAccess,
  onViewAuditLogs,
}: {
  onRequestAccess: () => void;
  onViewAuditLogs: () => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-hairline-soft px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="truncate text-[12px] font-semibold tracking-tight text-text-primary">
            Permissions
          </div>
          <Lock className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        </div>
        <PermissionBadge />
      </div>
      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div className="text-[10.5px] text-text-secondary">
          You have view-only access to Settings.
        </div>
        <div className="text-[10.5px] leading-relaxed text-text-secondary">
          Only users with the Analyst Admin or Platform Admin role can edit these settings.
        </div>
        <button
          type="button"
          disabled
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-hairline bg-surface-2/65 px-3 text-[10.5px] text-text-muted opacity-80"
        >
          <Lock className="h-3.5 w-3.5" />
          Edit Settings
        </button>
        <div className="flex flex-wrap items-center gap-1 text-[10.5px]">
          <button
            type="button"
            onClick={onRequestAccess}
            className="text-info underline-offset-2 hover:text-lime hover:underline"
          >
            Request access
          </button>
          <span className="text-text-muted">or</span>
          <button
            type="button"
            onClick={onViewAuditLogs}
            className="text-info underline-offset-2 hover:text-lime hover:underline"
          >
            view audit logs
          </button>
        </div>
      </div>
    </Panel>
  );
}

function PanelTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-4 sm:px-5">
      <div className="text-[12px] font-semibold uppercase tracking-[0.02em] text-text-primary">
        {title}
      </div>
      <Info className="h-3.5 w-3.5 text-text-muted" />
    </div>
  );
}

function SettingsRuleRow({
  row,
}: {
  row:
    | { label: string; type: "toggle"; enabled: boolean }
    | { label: string; type: "select"; value: string };
}) {
  return (
    <SettingsFieldRow label={row.label}>
      {row.type === "toggle" ? (
        <InlineToggle enabled={row.enabled} />
      ) : (
        <CompactSelect value={row.value} />
      )}
    </SettingsFieldRow>
  );
}

function SettingsFieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 border-t border-hairline-soft py-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-center">
      <div className="text-[11px] text-text-primary">{label}</div>
      <div className="sm:justify-self-end sm:w-full">{children}</div>
    </div>
  );
}

function CompactSelect({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 w-full items-center justify-between rounded-md border border-hairline bg-surface-1 px-3 text-[10.5px] text-text-primary transition-colors hover:bg-surface-hover"
    >
      <span className="truncate">{value}</span>
      <ChevronDown className="ml-3 h-3.5 w-3.5 shrink-0 text-text-muted" />
    </button>
  );
}

function ValueText({
  value,
  accent,
}: {
  value: string;
  accent?: "success";
}) {
  return (
    <div
      className={`text-right text-[10.5px] ${
        accent === "success" ? "text-success" : "text-text-primary"
      }`}
    >
      {value}
    </div>
  );
}

function StatusValue({ value, status }: { value: string; status: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 text-[10.5px]">
      <span className="text-text-secondary">{value}</span>
      <span
        className="inline-flex h-5 items-center rounded px-1.5 text-[9px]"
        style={{
          color: "#8EEA45",
          background: "rgba(142,234,69,0.10)",
          border: "1px solid rgba(142,234,69,0.26)",
        }}
      >
        {status}
      </span>
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative mt-0.5 h-5 w-10 shrink-0 rounded-full transition-colors"
      style={{ background: enabled ? "#98E23E" : "rgba(255,255,255,0.22)" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
        style={{ left: enabled ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );
}

function InlineToggle({ enabled }: { enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  return <ToggleSwitch enabled={isEnabled} onToggle={() => setIsEnabled((value) => !value)} />;
}

function SourceBadge({ group }: { group: SourceGroup }) {
  const palette =
    group === "Structured"
      ? {
          color: "#A9B4BE",
          background: "rgba(169,180,190,0.10)",
          border: "rgba(169,180,190,0.16)",
        }
      : {
          color: "#A9B4BE",
          background: "rgba(169,180,190,0.10)",
          border: "rgba(169,180,190,0.16)",
        };

  return (
    <span
      className="inline-flex h-6 items-center rounded-md px-2 text-[9px]"
      style={{
        color: palette.color,
        background: palette.background,
        border: `1px solid ${palette.border}`,
      }}
    >
      {group}
    </span>
  );
}

function ReviewGateStep({
  step,
  index,
  isLast,
}: {
  step: (typeof reviewGateSteps)[number];
  index: number;
  isLast: boolean;
}) {
  const complete = step.state === "complete";
  const active = step.state === "active";

  return (
    <div className="relative flex gap-4 pb-5 last:pb-0">
      <div className="relative flex w-8 shrink-0 justify-center">
        {!isLast && (
          <span
            className="absolute top-8 bottom-[-12px] w-px"
            style={{ background: "rgba(152,226,62,0.45)" }}
            aria-hidden="true"
          />
        )}
        <div
          className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
            complete ? "bg-lime text-primary-foreground" : ""
          }`}
          style={
            complete
              ? {
                  borderColor: "rgba(152,226,62,0.55)",
                  boxShadow: "0 0 0 4px rgba(152,226,62,0.06)",
                }
              : active
                ? {
                    color: "#B7F137",
                    borderColor: "rgba(183,241,55,0.45)",
                    background: "rgba(183,241,55,0.08)",
                  }
                : {
                    color: "#A9B4BE",
                    borderColor: "rgba(169,180,190,0.28)",
                    background: "rgba(20,30,38,0.65)",
                  }
          }
        >
          {complete ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index}
        </div>
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div
          className={`text-[12px] font-medium ${
            active ? "text-lime" : "text-text-primary"
          }`}
        >
          {step.title}
        </div>
        <div className="mt-1 text-[10.5px] leading-relaxed text-text-secondary">
          {step.description}
        </div>
      </div>
    </div>
  );
}

function PermissionBadge() {
  return (
    <span
      className="inline-flex h-6 items-center rounded-md px-2.5 text-[10px] font-medium"
      style={{
        color: "#F5A524",
        background: "rgba(245,165,36,0.10)",
        border: "1px solid rgba(245,165,36,0.24)",
      }}
    >
      Permission Restricted
    </span>
  );
}
