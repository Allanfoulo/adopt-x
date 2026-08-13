import { getTimeZones } from "@vvo/tzdb";

function formatOffset(minutes: number): string {
  if (minutes === 0) return "UTC+00:00";
  const sign = minutes > 0 ? "+" : "-";
  const absolute = Math.abs(minutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const remainder = String(absolute % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${remainder}`;
}

export const timeZoneOptions = getTimeZones({ includeUtc: true })
  .map((zone) => ({
    value: zone.name,
    label: `${zone.name} (${formatOffset(zone.currentTimeOffsetInMinutes)})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function normalizeStoredTimezone(value: string): string {
  const legacyMatch = value.match(/^\([^)]*\)\s*(.+)$/);
  return legacyMatch?.[1] ?? value;
}
