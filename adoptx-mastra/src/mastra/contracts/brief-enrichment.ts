import { z } from "zod";

export const briefEnrichmentSchema = z.object({
  executiveSummary: z.string().min(1),
  transactionOverview: z.string().min(1),
  strategicRationale: z.string().min(1),
  risks: z.array(z.string().min(1)).min(2).max(8),
  marketImplications: z.string().min(1),
  keyTakeaways: z.array(z.string().min(1)).min(3).max(6),
  dealStructure: z.string().min(1),
  confidenceScore: z.number().min(0).max(100),
  evidenceUsed: z.array(z.string().min(1)).min(1),
  last30daysUsed: z.boolean(),
});

export type BriefEnrichment = z.infer<typeof briefEnrichmentSchema>;
