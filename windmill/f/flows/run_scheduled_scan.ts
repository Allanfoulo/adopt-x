import { collectFeedsWithDiagnostics } from "../collectors/public_feed.ts";
import { resolveSourceConfiguration } from "../config/source_registry.ts";
import { main as ingestBatch } from "./scan_adoption_deals.ts";

/** Scheduled Windmill entry point for the recurring Adopt X scan. */
export async function main() {
  const rawFeeds = Deno.env.get("ADOPTX_FEEDS_JSON");
  if (!rawFeeds) {
    throw new Error("ADOPTX_FEEDS_JSON Windmill variable is required");
  }

  const configuration = resolveSourceConfiguration(rawFeeds);
  if (configuration.feeds.length === 0) {
    throw new Error("ADOPTX_FEEDS_JSON must contain at least one feed");
  }

  const collection = await collectFeedsWithDiagnostics(configuration.feeds);
  if (collection.sources.length === 0 && collection.failures.length > 0) {
    throw new Error(`All configured feeds failed: ${JSON.stringify(collection.failures)}`);
  }

  const result = await ingestBatch(
    [...new Set(collection.sources.map((source) => source.sourceType))],
    collection.sources,
  );

  return {
    ...result,
    configuredSourceKeys: configuration.feeds.map(
      (feed) => feed.key ?? `${feed.publisher}:${feed.sourceType}`,
    ),
    unconfiguredSourceKeys: configuration.unconfiguredKeys,
    feedFailures: collection.failures,
  };
}
