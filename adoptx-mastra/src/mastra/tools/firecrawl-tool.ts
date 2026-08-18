import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const firecrawlEvidenceSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  url: z.string().url(),
  description: z.string(),
  markdown: z.string(),
});

export const firecrawlCorroborate = createTool({
  id: "firecrawl-corroborate",
  description:
    "Searches public web pages for independent corroboration of a reported AI adoption event. It is evidence gathering, not proof by itself.",
  inputSchema: z.object({
    headline: z.string(),
    publisher: z.string(),
    url: z.string().url(),
    company: z.string().optional(),
    target: z.string().optional(),
  }),
  outputSchema: z.object({
    status: z.enum(["completed", "failed"]),
    query: z.string(),
    evidence: z.array(firecrawlEvidenceSchema),
    error: z.string().optional(),
  }),
  execute: async ({ headline, publisher, url, company, target }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    const query = [headline, company, target, publisher].filter(Boolean).join(" ").slice(0, 500);

    if (!apiKey) {
      return {
        status: "failed" as const,
        query,
        evidence: [],
        error: "FIRECRAWL_API_KEY is not configured in the Mastra runtime.",
      };
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          limit: 10,
          sources: ["web"],
          scrapeOptions: {
            formats: ["markdown"],
            onlyMainContent: true,
          },
        }),
      });

      if (!response.ok) {
        return {
          status: "failed" as const,
          query,
          evidence: [],
          error: `Firecrawl returned HTTP ${response.status}.`,
        };
      }

      const payload = (await response.json()) as {
        data?: {
          web?: Array<{ title?: string; url?: string; description?: string; markdown?: string }>;
        };
      };
      const evidence = (payload.data?.web ?? [])
        .filter((item): item is Required<Pick<typeof item, "title" | "url">> & typeof item =>
          Boolean(item.title && item.url),
        )
        .map((item) => ({
          externalId: `firecrawl:${item.url}`,
          title: item.title,
          url: item.url,
          description: item.description ?? "",
          markdown: (item.markdown ?? "").slice(0, 8_000),
        }))
        .filter((item) => item.url !== url)
        .slice(0, 5);

      return { status: "completed" as const, query, evidence };
    } catch (error) {
      return {
        status: "failed" as const,
        query,
        evidence: [],
        error: error instanceof Error ? error.message : "Unknown Firecrawl error.",
      };
    }
  },
});
