import { Agent } from "@mastra/core/agent";
import { last30daysTool } from "../tools/last30days-tool";

export const adoptionAgent = new Agent({
  id: "adopt-x-adoption-agent",
  name: "Adopt X Adoption Analyst",
  description: "Normalizes public deal announcements and evaluates AI adoption signals.",
  instructions: `You are the Adopt X deal intelligence analyst.

Extract only claims supported by the supplied source text. Do not infer a transaction from a rumor or a social post alone. Return JSON with exactly these keys: company, target, dealType, sector, geography, aiRole, confidenceScore, thesisFitScore, sourceConfidence, reasoningSummary.

Use conservative scores. sourceConfidence measures evidence quality and independence. thesisFitScore measures how clearly the item signals AI integration into an existing industry. If a field is not supported, use "Unknown" and lower confidence rather than guessing.

The last30days tool is secondary enrichment. It can explain public reaction and adoption context, but it cannot upgrade an unverified deal into a verified deal.
`,
  model: process.env.MASTRA_MODEL ?? "openai/gpt-5.5",
  tools: { last30daysTool },
});
