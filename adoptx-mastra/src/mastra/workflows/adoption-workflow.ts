import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { adoptionAgent } from "../agents/adoption-agent";
import {
  adoptionScanInputSchema,
  adoptionScanOutputSchema,
  candidateDraftSchema,
  type AdoptionScanInput,
  type CandidateDraft,
} from "../contracts/adoption";
import { runLast30daysResearch } from "../tools/last30days-tool";

const extractCandidate = createStep({
  id: "extract-adoption-candidate",
  description: "Extracts a normalized candidate from a bounded source batch.",
  inputSchema: adoptionScanInputSchema,
  outputSchema: z.object({
    scanRunId: z.string(),
    candidate: candidateDraftSchema,
  }),
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error("Scan input not found");
    const primary = inputData.sources[0];
    const sourceText = inputData.sources
      .slice(0, 12)
      .map((source) => `${source.publisher}: ${source.headline}\n${source.rawExcerpt}`)
      .join("\n\n");

    if (!process.env.OPENAI_API_KEY && !process.env.MASTRA_PROVIDER_API_KEY) {
      return {
        scanRunId: inputData.scanRunId,
        candidate: deterministicDraft(primary),
      };
    }

    const response = await adoptionAgent.generate([
      {
        role: "user",
        content: `Analyze these public source items and return only the requested JSON object.\n\n${sourceText}`,
      },
    ]);
    const parsed = candidateDraftSchema.safeParse(JSON.parse(response.text));
    if (!parsed.success) {
      throw new Error("Adoption agent returned invalid structured output");
    }
    return { scanRunId: inputData.scanRunId, candidate: parsed.data };
  },
});

const enrichAdoptionSignal = createStep({
  id: "enrich-adoption-signal",
  description: "Adds optional last30days context after primary-source extraction.",
  inputSchema: z.object({
    scanRunId: z.string(),
    candidate: candidateDraftSchema,
  }),
  outputSchema: adoptionScanOutputSchema,
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error("Candidate input not found");
    const topic = `${inputData.candidate.company} ${inputData.candidate.target}`;
    const research = await runLast30daysResearch({ topic });
    return { ...inputData, research };
  },
});

function deterministicDraft(source: AdoptionScanInput["sources"][number]): CandidateDraft {
  const headline = source.headline;
  const company = headline.split(/\s+(?:acquires|acquired|partners|partnered|invests|launches)\s+/i)[0] ?? headline;
  return {
    company: company.trim() || "Unknown",
    target: "Unknown",
    dealType: "Needs review",
    sector: "Unknown",
    geography: "Unknown",
    aiRole: "AI integration signal",
    confidenceScore: source.sourceClass === "primary_structured" ? 58 : 35,
    thesisFitScore: 50,
    sourceConfidence: source.sourceClass === "primary_structured" ? 72 : 42,
    reasoningSummary: "Deterministic dry-run extraction. Configure a Mastra model for semantic normalization.",
  };
}

export const adoptionWorkflow = createWorkflow({
  id: "adopt-x-adoption-workflow",
  inputSchema: adoptionScanInputSchema,
  outputSchema: adoptionScanOutputSchema,
})
  .then(extractCandidate)
  .then(enrichAdoptionSignal);

adoptionWorkflow.commit();
