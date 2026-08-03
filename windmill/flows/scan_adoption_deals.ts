import { ConvexHttpClient } from "npm:convex/browser";
import { makeFunctionReference } from "npm:convex/server";

type Source = {
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

const ingestSourceBatch = makeFunctionReference<"mutation">("ingest:ingestSourceBatch");

/** Windmill flow entry point after collectors have returned normalized sources. */
export async function main(sourceTypes: string[], sources: Source[]) {
  const convexUrl = Deno.env.get("CONVEX_URL");
  if (!convexUrl) throw new Error("CONVEX_URL is required");
  const client = new ConvexHttpClient(convexUrl);
  return await client.mutation(ingestSourceBatch, {
    externalRunId: `windmill-${crypto.randomUUID()}`,
    sourceTypes,
    sources: sources.slice(0, 250),
  });
}
