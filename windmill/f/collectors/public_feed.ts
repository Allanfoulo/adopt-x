import type { FeedConfig } from "../config/source_registry.ts";

export type { FeedConfig } from "../config/source_registry.ts";

export type CollectedSource = {
  externalId: string;
  sourceClass: "primary_structured" | "secondary_signal" | "community";
  sourceType: string;
  publisher: string;
  publisherReputation?: string;
  url: string;
  headline: string;
  publishedAt: number;
  rawExcerpt: string;
  hash: string;
};

export type FeedCollectionResult = {
  sources: CollectedSource[];
  failures: { publisher: string; url: string; error: string }[];
};

/** Windmill script: collect new RSS/Atom items from a configured public feed. */
export async function main(feeds: FeedConfig[]): Promise<CollectedSource[]> {
  return (await collectFeedsWithDiagnostics(feeds)).sources;
}

export async function collectFeedsWithDiagnostics(
  feeds: FeedConfig[],
): Promise<FeedCollectionResult> {
  const output: CollectedSource[] = [];
  const failures: FeedCollectionResult["failures"] = [];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, {
        headers: { "user-agent": "Adopt-X-source-collector/1.0" },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const xml = await response.text();
      const items = [...xml.matchAll(/<(?:item|entry)([\s\S]*?)<\/(?:item|entry)>/gi)].map(
        (match) => match[1],
      );
      for (const item of items) {
        const headline = readTag(item, "title");
        const url = readTag(item, "link") || readAttribute(item, "link", "href");
        if (!headline || !url) continue;
        const published =
          readTag(item, "pubDate") || readTag(item, "published") || readTag(item, "updated");
        const rawExcerpt = stripMarkup(readTag(item, "description") || readTag(item, "summary"));
        const externalId = `${feed.publisher}:${url}`;
        output.push({
          externalId,
          sourceClass: feed.sourceClass ?? "primary_structured",
          sourceType: feed.sourceType,
          publisher: feed.publisher,
          publisherReputation: feed.publisherReputation,
          url,
          headline: stripMarkup(headline),
          publishedAt: published ? Date.parse(published) || Date.now() : Date.now(),
          rawExcerpt: rawExcerpt.slice(0, 4000),
          hash: await sha256(`${headline}|${url}|${rawExcerpt}`),
        });
      }
    } catch (error) {
      failures.push({
        publisher: feed.publisher,
        url: feed.url,
        error: error instanceof Error ? error.message : "Unknown feed error",
      });
    }
  }

  return { sources: output, failures };
}

function readTag(input: string, tag: string): string {
  const match = input.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function readAttribute(input: string, tag: string, attribute: string): string {
  const match = input.match(
    new RegExp(`<${tag}[^>]*\\b${attribute}=["']([^"']+)["'][^>]*\\/?` + ">", "i"),
  );
  return match?.[1]?.trim() ?? "";
}

function stripMarkup(input: string): string {
  return input
    .replace(/<![\s\S]*?>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
