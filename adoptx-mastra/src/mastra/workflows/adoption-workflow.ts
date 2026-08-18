import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { adoptionAgent } from "../agents/adoption-agent";
import {
  adoptionScanInputSchema,
  adoptionScanOutputSchema,
  candidateDraftSchema,
  type AdoptionScanInput,
} from "../contracts/adoption";
import { runLast30daysResearch } from "../tools/last30days-tool";

function hasSuccessfulFirecrawl(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasSuccessfulFirecrawl);
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  const toolName =
    typeof record.toolName === "string"
      ? record.toolName
      : typeof record.name === "string"
        ? record.name
        : "";
  const output = record.output ?? record.result;
  if (toolName.toLowerCase().includes("firecrawl") && output && typeof output === "object") {
    return (output as Record<string, unknown>).status === "completed";
  }

  return Object.values(record).some(hasSuccessfulFirecrawl);
}

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
    const sourceText = inputData.sources
      .slice(0, 12)
      .map(
        (source) =>
          `SOURCE EXTERNAL ID: ${source.externalId}\n${source.publisher}: ${source.headline}\n${source.rawExcerpt}`,
      )
      .join("\n\n");

    const response = await adoptionAgent.generate(
      [
        {
          role: "user",
          content: `Analyze these public source items and return only the requested JSON object. You must call firecrawlCorroborate before responding.\n\n${sourceText}`,
        },
      ],
      {
        activeTools: ["firecrawlCorroborate"],
        maxSteps: 6,
        toolChoice: "required",
      },
    );
    if (!hasSuccessfulFirecrawl(response.steps)) {
      throw new Error(
        "Adoption candidate quarantined because Firecrawl corroboration did not complete.",
      );
    }
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

export const adoptionWorkflow = createWorkflow({
  id: "adopt-x-adoption-workflow",
  inputSchema: adoptionScanInputSchema,
  outputSchema: adoptionScanOutputSchema,
})
  .then(extractCandidate)
  .then(enrichAdoptionSignal);

adoptionWorkflow.commit();
