import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Check, CheckCircle2, ChevronDown, Info, Lock, X } from "lucide-react";
import { AppShell, Panel } from "@/components/app-shell";
import { useToast } from "@/components/app-toast";
import { normalizeStoredTimezone, timeZoneOptions } from "@/lib/time-zones";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings - Adopt X" }] }),
  component: Settings,
});

type SettingsData = FunctionReturnType<typeof api.settings.getRuntimeConfig>;
type RuntimeSettings = Exclude<SettingsData, null>;
type SourceRow = RuntimeSettings["sourceToggles"][number];
type SourceGroup = SourceRow["group"];

const sourceGroupLabels: Record<SourceGroup, string> = {
  structured: "Structured Public Sources",
  discovery: "Discovery & Market Signals",
  community: "Secondary & Community Sources",
};

const emptySettings: RuntimeSettings = {
  sourceToggles: [],
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
  latestScan: null,
  nextScheduledScanAt: null,
  configuredSourceKeys: [],
};

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
  const settings = useQuery(api.settings.getRuntimeConfig, {});
  const saveSettings = useMutation(api.settings.updateRuntimeConfig);
  const [draft, setDraft] = useState<RuntimeSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveBannerVisible, setSaveBannerVisible] = useState(false);

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  const current = draft ?? settings ?? emptySettings;
  const update = <K extends keyof RuntimeSettings>(key: K, value: RuntimeSettings[K]) => {
    setDraft((previous) => ({ ...(previous ?? current), [key]: value }));
  };
  const updateSource = (key: string) => {
    update(
      "sourceToggles",
      current.sourceToggles.map((source) =>
        source.key === key ? { ...source, enabled: !source.enabled } : source,
      ),
    );
  };
  const hasChanges = Boolean(
    draft && settings && JSON.stringify(draft) !== JSON.stringify(settings),
  );

  const handleSave = async () => {
    if (!draft || !hasChanges) return;
    setIsSaving(true);
    try {
      const editable = {
        sourceToggles: draft.sourceToggles,
        scanCadenceMinutes: draft.scanCadenceMinutes,
        timezone: draft.timezone,
        dedupeSimilarityThreshold: draft.dedupeSimilarityThreshold,
        briefReadyThreshold: draft.briefReadyThreshold,
        briefGenerationMode: draft.briefGenerationMode,
        last30daysAfterApproval: draft.last30daysAfterApproval,
        eventRetentionDays: draft.eventRetentionDays,
        provenanceValidationMode: draft.provenanceValidationMode,
        requireSourceUrl: draft.requireSourceUrl,
        minimumSourceConfidence: draft.minimumSourceConfidence,
        publisherReputationFloor: draft.publisherReputationFloor,
        detectConflictingInfo: draft.detectConflictingInfo,
        duplicateContentCheck: draft.duplicateContentCheck,
        maxParallelScans: draft.maxParallelScans,
        modelTier: draft.modelTier,
        rateLimitBackoff: draft.rateLimitBackoff,
        dataResidency: draft.dataResidency,
        auditRetentionDays: draft.auditRetentionDays,
      };
      await saveSettings(editable);
      setSaveBannerVisible(true);
      info({
        title: "Settings saved",
        description: "The next Windmill scan will use the enabled source configuration.",
        action: { label: "View scan controls", emphasis: "secondary" },
      });
    } catch (error) {
      info({
        title: "Settings could not be saved",
        description: error instanceof Error ? error.message : "Convex rejected the update.",
        action: { label: "Retry save", emphasis: "secondary" },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Configure sources, scans, enrichment, and governance"
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {saveBannerVisible ? (
            <SettingsSavedBanner onDismiss={() => setSaveBannerVisible(false)} />
          ) : null}
          <button
            type="button"
            disabled={!hasChanges || isSaving || !settings}
            onClick={handleSave}
            className="inline-flex h-9 items-center justify-center rounded-md bg-lime px-4 text-[10.5px] font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      }
    >
      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.98fr)_344px]">
        <div className="space-y-5">
          <SourceTogglesPanel settings={current} onToggle={updateSource} />
          <ProvenanceRulesPanel settings={current} onChange={update} />
        </div>

        <div className="space-y-5">
          <ScanCadencePanel settings={current} onChange={update} />
          <EnrichmentControlsPanel settings={current} onChange={update} />
          <RuntimeConfigPanel settings={current} onChange={update} />
        </div>

        <div className="space-y-5">
          <HumanReviewGatePanel />
          <PermissionsPanel isConfigured={Boolean(settings)} />
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
        background: "linear-gradient(180deg, rgba(183,241,55,0.08), rgba(13,23,30,0.92) 60%)",
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

function SourceTogglesPanel({
  settings,
  onToggle,
}: {
  settings: RuntimeSettings;
  onToggle: (key: string) => void;
}) {
  const groups = (["structured", "discovery", "community"] as const).map((group) => ({
    group,
    rows: settings.sourceToggles.filter((source) => source.group === group),
  }));
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Source Toggles" />
      <div className="space-y-5 px-4 pb-4 sm:px-5 sm:pb-5">
        {groups.map(({ group, rows }) => (
          <SourceGroupSection
            key={group}
            title={sourceGroupLabels[group]}
            count={`${rows.filter((row) => row.enabled).length} / ${rows.length} enabled`}
            rows={rows}
            onToggle={onToggle}
          />
        ))}
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
  onToggle,
}: {
  title: string;
  count: string;
  rows: readonly SourceRow[];
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-hairline-soft pb-3">
        <div className="text-[11px] text-text-secondary">{title}</div>
        <div className="text-[11px] text-text-secondary">{count}</div>
      </div>
      <div>
        {rows.map((row) => (
          <SourceToggleRow key={row.key} row={row} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

function SourceToggleRow({ row, onToggle }: { row: SourceRow; onToggle: (key: string) => void }) {
  return (
    <div className="flex items-start gap-3 border-b border-hairline-soft py-3 last:border-b-0">
      <ToggleSwitch enabled={row.enabled} onToggle={() => onToggle(row.key)} />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-text-primary">{row.name}</div>
        <div className="mt-0.5 text-[10px] text-text-secondary">{row.description}</div>
      </div>
      <SourceBadge group={row.group} configured={row.configured !== false} />
    </div>
  );
}

function ProvenanceRulesPanel({
  settings,
  onChange,
}: {
  settings: RuntimeSettings;
  onChange: <K extends keyof RuntimeSettings>(key: K, value: RuntimeSettings[K]) => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Provenance & Quality Rules" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <SettingsFieldRow label="Require source URL">
          <InlineToggle
            enabled={settings.requireSourceUrl}
            onChange={(value) => onChange("requireSourceUrl", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Minimum source confidence">
          <CompactSelect
            value={settings.minimumSourceConfidence}
            options={["Low", "Medium", "High"]}
            onChange={(value) => onChange("minimumSourceConfidence", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Publisher reputation floor">
          <CompactSelect
            value={settings.publisherReputationFloor}
            options={["Low", "Medium", "High"]}
            onChange={(value) => onChange("publisherReputationFloor", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Detect conflicting info">
          <InlineToggle
            enabled={settings.detectConflictingInfo}
            onChange={(value) => onChange("detectConflictingInfo", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Duplicate content check">
          <InlineToggle
            enabled={settings.duplicateContentCheck}
            onChange={(value) => onChange("duplicateContentCheck", value)}
          />
        </SettingsFieldRow>
        <div className="pt-3 text-[10px] text-text-muted">
          Rules apply before content is submitted for review.
        </div>
      </div>
    </Panel>
  );
}

function ScanCadencePanel({
  settings,
  onChange,
}: {
  settings: RuntimeSettings;
  onChange: <K extends keyof RuntimeSettings>(key: K, value: RuntimeSettings[K]) => void;
}) {
  const cadenceLabel = `${settings.scanCadenceMinutes} min`;
  const latestScanValue = settings.latestScan
    ? new Date(settings.latestScan.startedAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No scan yet";
  const nextScanValue = settings.nextScheduledScanAt
    ? new Date(settings.nextScheduledScanAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Waiting for first scan";
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Scan Cadence Controls" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <SettingsFieldRow label="Scan cadence">
          <CompactSelect
            value={cadenceLabel}
            options={["15 min", "60 min", "120 min", "240 min"]}
            onChange={(value) => onChange("scanCadenceMinutes", Number.parseInt(value, 10))}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Next scheduled scan">
          <ValueText value={nextScanValue} accent="success" />
        </SettingsFieldRow>
        <SettingsFieldRow label="Last scan run">
          <StatusValue value={latestScanValue} status={settings.latestScan?.status ?? "Empty"} />
        </SettingsFieldRow>
        <SettingsFieldRow label="Timezone">
          <CompactSelect
            value={normalizeStoredTimezone(settings.timezone)}
            options={timeZoneOptions}
            onChange={(value) => onChange("timezone", value)}
          />
        </SettingsFieldRow>
      </div>
    </Panel>
  );
}

function EnrichmentControlsPanel({
  settings,
  onChange,
}: {
  settings: RuntimeSettings;
  onChange: <K extends keyof RuntimeSettings>(key: K, value: RuntimeSettings[K]) => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Enrichment Controls" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <SettingsFieldRow label="Dedupe similarity threshold">
          <CompactSelect
            value={`${settings.dedupeSimilarityThreshold}%`}
            options={["75%", "85%", "90%", "95%"]}
            onChange={(value) => onChange("dedupeSimilarityThreshold", Number.parseInt(value, 10))}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Scoring threshold for Brief Ready">
          <CompactSelect
            value={String(settings.briefReadyThreshold)}
            options={["70", "80", "90"]}
            onChange={(value) => onChange("briefReadyThreshold", Number.parseInt(value, 10))}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Brief generation default">
          <CompactSelect
            value={settings.briefGenerationMode}
            options={["AI assisted with analyst edit", "AI draft only", "Analyst authored"]}
            onChange={(value) => onChange("briefGenerationMode", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Last 30 days enrichment after approval">
          <InlineToggle
            enabled={settings.last30daysAfterApproval}
            onChange={(value) => onChange("last30daysAfterApproval", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Event retention (days)">
          <CompactSelect
            value={String(settings.eventRetentionDays)}
            options={["30", "90", "180", "365"]}
            onChange={(value) => onChange("eventRetentionDays", Number.parseInt(value, 10))}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Provenance validation rules">
          <CompactSelect
            value={settings.provenanceValidationMode}
            options={["Strict", "Balanced", "Relaxed"]}
            onChange={(value) => onChange("provenanceValidationMode", value)}
          />
        </SettingsFieldRow>
        <div className="pt-3 text-[10px] text-text-muted">
          Higher similarity reduces duplicates. Strict provenance may reduce throughput. Windmill
          remains scheduled hourly; longer cadences are enforced before collection.
        </div>
      </div>
    </Panel>
  );
}

function RuntimeConfigPanel({
  settings,
  onChange,
}: {
  settings: RuntimeSettings;
  onChange: <K extends keyof RuntimeSettings>(key: K, value: RuntimeSettings[K]) => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <PanelTitle title="Runtime Config" />
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <SettingsFieldRow label="Max parallel scans">
          <CompactSelect
            value={String(settings.maxParallelScans)}
            options={["2", "4", "6", "8"]}
            onChange={(value) => onChange("maxParallelScans", Number.parseInt(value, 10))}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="AI model tier">
          <CompactSelect
            value={settings.modelTier}
            options={["Standard (Balanced)", "Fast", "High accuracy"]}
            onChange={(value) => onChange("modelTier", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Rate limit backoff">
          <CompactSelect
            value={settings.rateLimitBackoff}
            options={["Exponential (Default)", "Linear", "Fixed"]}
            onChange={(value) => onChange("rateLimitBackoff", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Data residency">
          <CompactSelect
            value={settings.dataResidency}
            options={[
              "Australia (au-southeast-2)",
              "United States (us-east-1)",
              "European Union (eu-west-1)",
            ]}
            onChange={(value) => onChange("dataResidency", value)}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Audit log retention (days)">
          <CompactSelect
            value={String(settings.auditRetentionDays)}
            options={["90", "180", "365", "730"]}
            onChange={(value) => onChange("auditRetentionDays", Number.parseInt(value, 10))}
          />
        </SettingsFieldRow>
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

function PermissionsPanel({ isConfigured }: { isConfigured: boolean }) {
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
          {isConfigured
            ? "Local development access is enabled while authentication is being wired."
            : "Loading workspace settings access..."}
        </div>
        <div className="text-[10.5px] leading-relaxed text-text-secondary">
          Only users with the Analyst Admin or Platform Admin role can edit these settings.
        </div>
        <div className="rounded-md border border-hairline-soft bg-surface-2/45 px-3 py-2 text-[10px] text-text-muted">
          Authentication will enforce Analyst Admin or Platform Admin access before production use.
        </div>
        <div className="flex flex-wrap items-center gap-1 text-[10.5px]">
          <button
            type="button"
            disabled
            title="Authentication and access requests are not configured yet"
            className="cursor-not-allowed text-text-muted underline-offset-2"
          >
            Request access
          </button>
          <span className="text-text-muted">or</span>
          <Link
            to="/audit"
            className="text-info underline-offset-2 hover:text-lime hover:underline"
          >
            view audit logs
          </Link>
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

function SettingsFieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-hairline-soft py-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-center">
      <div className="text-[11px] text-text-primary">{label}</div>
      <div className="sm:justify-self-end sm:w-full">{children}</div>
    </div>
  );
}

function CompactSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly (string | { value: string; label: string })[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="inline-flex h-9 w-full appearance-none items-center rounded-md border border-hairline bg-surface-1 px-3 pr-9 text-[10.5px] text-text-primary outline-none transition-colors hover:bg-surface-hover focus:border-lime"
      >
        {options.map((option) => {
          const normalized = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
    </div>
  );
}

function ValueText({ value, accent }: { value: string; accent?: "success" }) {
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

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
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

function InlineToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return <ToggleSwitch enabled={enabled} onToggle={() => onChange(!enabled)} />;
}

function SourceBadge({ group, configured }: { group: SourceGroup; configured: boolean }) {
  const palette = {
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
      {configured
        ? group === "discovery"
          ? "Discovery"
          : group === "structured"
            ? "Structured"
            : "Community"
        : "Not configured"}
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
        <div className={`text-[12px] font-medium ${active ? "text-lime" : "text-text-primary"}`}>
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
