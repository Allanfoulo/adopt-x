import { main as collectFeeds, type FeedConfig } from "../collectors/public_feed.ts";
import { main as ingestBatch } from "./scan_adoption_deals.ts";

/** Scheduled Windmill entry point for the recurring Adopt X scan. */
export async function main() {
  const rawFeeds = Deno.env.get("ADOPTX_FEEDS_JSON");
  if (!rawFeeds) {
    throw new Error("ADOPTX_FEEDS_JSON Windmill variable is required");
  }

  const feeds = JSON.parse(rawFeeds) as FeedConfig[];
  if (!Array.isArray(feeds) || feeds.length === 0) {
    throw new Error("ADOPTX_FEEDS_JSON must contain at least one feed");
  }

  const sources = await collectFeeds(feeds);
  return await ingestBatch(
    [...new Set(feeds.map((feed) => feed.sourceType))],
    sources,
  );
}
