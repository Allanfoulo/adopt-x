import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const researchEvidenceSchema = z.object({
  externalId: z.string(),
  publisher: z.string(),
  url: z.string().url(),
  headline: z.string(),
  publishedAt: z.number(),
  rawExcerpt: z.string(),
  hash: z.string(),
});

export type Last30DaysResearchResult = {
  status: "disabled" | "completed" | "failed";
  topic: string;
  rawOutput: string;
  evidence: z.infer<typeof researchEvidenceSchema>[];
};

export async function runLast30daysResearch({
  topic,
  candidateExternalId,
}: {
  topic: string;
  candidateExternalId?: string;
}): Promise<Last30DaysResearchResult> {
  const runnerUrl = process.env.LAST30DAYS_RUNNER_URL;
  if (!runnerUrl) {
    return { status: "disabled", topic, rawOutput: "", evidence: [] };
  }

  const plan = {
    subqueries: [
      { search_query: `${topic} AI adoption deal`, sources: ["web", "reddit", "x"] },
      { search_query: `${topic} customers deployment AI`, sources: ["web", "reddit", "youtube"] },
      { search_query: `${topic} hiring strategy AI`, sources: ["web", "github"] },
    ],
    ranking_query: `What does recent public discussion say about AI adoption related to ${topic}?`,
  };

  try {
    const response = await fetch(runnerUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic, candidateExternalId, plan }),
    });
    if (!response.ok) {
      throw new Error(`last30days runner returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      rawOutput?: string;
      evidence?: unknown[];
    };
    const evidence = z.array(researchEvidenceSchema).parse(payload.evidence ?? []);
    return { status: "completed", topic, rawOutput: payload.rawOutput ?? "", evidence };
  } catch (error) {
    return {
      status: "failed",
      topic,
      rawOutput: error instanceof Error ? error.message : "Unknown research error",
      evidence: [],
    };
  }
}

export const last30daysTool = createTool({
  id: "last30days-research",
  description:
    "Runs the last30days research adapter for recent public adoption discussion. Use as enrichment, never as proof that a deal occurred.",
  inputSchema: z.object({
    topic: z.string(),
    candidateExternalId: z.string().optional(),
  }),
  outputSchema: z.object({
    status: z.enum(["disabled", "completed", "failed"]),
    topic: z.string(),
    rawOutput: z.string(),
    evidence: z.array(researchEvidenceSchema),
  }),
  execute: async ({ topic, candidateExternalId }) =>
    runLast30daysResearch({ topic, candidateExternalId }),
});
