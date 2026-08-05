import { ConvexHttpClient } from "npm:convex/browser";
import { makeFunctionReference } from "npm:convex/server";

const recordResearchRun = makeFunctionReference<"mutation">("research:recordResearchRun");

/** Runs the optional last30days adapter and persists its evidence in Convex. */
export async function main(topic: string, candidateExternalId?: string) {
  const runnerUrl = Deno.env.get("LAST30DAYS_RUNNER_URL");
  const convexUrl = Deno.env.get("CONVEX_URL");
  if (!runnerUrl || !convexUrl) {
    return { status: "disabled", reason: "LAST30DAYS_RUNNER_URL or CONVEX_URL is missing" };
  }

  const plan = {
    subqueries: [
      { search_query: `${topic} AI adoption deal`, sources: ["web", "reddit", "x"] },
      { search_query: `${topic} customers deployment AI`, sources: ["web", "reddit", "youtube"] },
      { search_query: `${topic} hiring strategy AI`, sources: ["web", "github"] },
    ],
    ranking_query: `What does recent public discussion say about AI adoption related to ${topic}?`,
  };
  const response = await fetch(runnerUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ topic, candidateExternalId, plan }),
  });
  if (!response.ok) throw new Error(`Research runner returned HTTP ${response.status}`);

  const result = await response.json();
  const client = new ConvexHttpClient(convexUrl);
  return await client.mutation(recordResearchRun, {
    candidateExternalId,
    topic,
    rawOutput: typeof result.rawOutput === "string" ? result.rawOutput : JSON.stringify(result),
    evidence: Array.isArray(result.evidence) ? result.evidence : [],
  });
}
