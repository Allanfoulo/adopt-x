import { collectFeedsWithDiagnostics } from "../collectors/public_feed.ts";
import { resolveSourceConfiguration, sourceKeyForFeed } from "../config/source_registry.ts";
import { main as ingestBatch } from "./scan_adoption_deals.ts";
import { ConvexHttpClient } from "npm:convex/browser";
import { makeFunctionReference } from "npm:convex/server";

const getRuntimeConfig = makeFunctionReference<"query">("settings:getRuntimeConfig");
const failScan = makeFunctionReference<"mutation">("scans:fail");

/** Scheduled Windmill entry point for the recurring Adopt X scan. */
export async function main(externalRunId?: string) {
  try {
    return await runScan(externalRunId);
  } catch (error) {
    await reportScanFailure(externalRunId, error);
    throw error;
  }
}

async function runScan(externalRunId?: string) {
  const rawFeeds = Deno.env.get("ADOPTX_FEEDS_JSON");
  const convexUrl = Deno.env.get("CONVEX_URL");
  if (!rawFeeds) {
    throw new Error("ADOPTX_FEEDS_JSON Windmill variable is required");
  }
  if (!convexUrl) {
    throw new Error("CONVEX_URL Windmill variable is required");
  }

  const configuration = resolveSourceConfiguration(rawFeeds);
  const client = new ConvexHttpClient(convexUrl);
  const runtimeConfig = await client.query(getRuntimeConfig, {});
  if (
    runtimeConfig.nextScheduledScanAt &&
    runtimeConfig.scanCadenceMinutes >= 60 &&
    Date.now() < runtimeConfig.nextScheduledScanAt
  ) {
    return {
      status: "skipped",
      reason: "Adopt X cadence has not elapsed since the previous scan",
      nextScheduledScanAt: runtimeConfig.nextScheduledScanAt,
    };
  }
  const enabledKeys = new Set(
    runtimeConfig.sourceToggles
      .filter((source) => source.enabled && source.configured !== false)
      .map((source) => source.key),
  );
  const enabledFeeds = configuration.feeds.filter((feed) => {
    const key = sourceKeyForFeed(feed);
    return key ? enabledKeys.has(key) : true;
  });

  if (enabledFeeds.length === 0) {
    throw new Error("No configured sources are enabled in Adopt X Settings");
  }

  const collection = await collectFeedsWithDiagnostics(enabledFeeds);
  if (collection.sources.length === 0 && collection.failures.length > 0) {
    throw new Error(`All configured feeds failed: ${JSON.stringify(collection.failures)}`);
  }

  const result = await ingestBatch(
    [...new Set(collection.sources.map((source) => source.sourceType))],
    collection.sources,
    externalRunId,
  );

  return {
    ...result,
    configuredSourceKeys: enabledFeeds.map(
      (feed) => feed.key ?? `${feed.publisher}:${feed.sourceType}`,
    ),
    unconfiguredSourceKeys: configuration.unconfiguredKeys,
    feedFailures: collection.failures,
  };
}

async function reportScanFailure(externalRunId: string | undefined, error: unknown) {
  if (!externalRunId) return;
  const convexUrl = Deno.env.get("CONVEX_URL");
  if (!convexUrl) return;

  const message = error instanceof Error ? error.message : "Windmill scan failed.";
  try {
    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(failScan, {
      externalRunId,
      error: message.slice(0, 1000),
    });
  } catch {
    // Preserve the original Windmill failure if telemetry cannot be reported.
  }
}
