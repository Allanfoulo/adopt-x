import { Agent } from "@mastra/core/agent";
import { last30daysTool } from "../tools/last30days-tool";

export const briefEnrichmentAgent = new Agent({
  id: "adopt-x-brief-enrichment-agent",
  name: "Adopt X Brief Enrichment Agent",
  description: "Generates evidence-backed analyst brief sections from verified adoption deal sources.",
  instructions: `You are the Adopt X brief enrichment analyst.

Use only the supplied candidate facts and source evidence. Do not invent transaction terms, financial metrics, people, dates, or outcomes. Use "Not available" when evidence is missing. The source evidence establishes what happened; the last30days tool is optional context about public adoption discussion and must never be treated as proof of a deal.

Return only one valid JSON object with exactly these keys: executiveSummary, transactionOverview, strategicRationale, risks, marketImplications, keyTakeaways, dealStructure, confidenceScore, evidenceUsed, last30daysUsed.

Write concise analyst-ready prose. Generate at least two concrete risks, three key takeaways, and cite source headlines or URLs in evidenceUsed. Set last30daysUsed to true only when the last30days tool was actually called and returned usable context.
`,
  model: process.env.MASTRA_MODEL ?? "openai/gpt-5.5",
  tools: { last30daysTool },
});
