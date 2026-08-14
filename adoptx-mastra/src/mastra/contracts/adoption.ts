import { z } from "zod";

export const sourceHitSchema = z.object({
  externalId: z.string(),
  sourceClass: z.enum(["primary_structured", "secondary_signal", "community"]),
  sourceType: z.string(),
  publisher: z.string(),
  url: z.string().url(),
  headline: z.string(),
  publishedAt: z.number(),
  rawExcerpt: z.string(),
  hash: z.string(),
});

export const candidateDraftSchema = z.object({
  company: z.string(),
  target: z.string(),
  dealType: z.string(),
  sector: z.string(),
  geography: z.string(),
  aiRole: z.string(),
  reasoningSummary: z.string(),
});

export const adoptionScanInputSchema = z.object({
  scanRunId: z.string(),
  sources: z.array(sourceHitSchema).min(1).max(250),
});

export const adoptionScanOutputSchema = z.object({
  scanRunId: z.string(),
  candidate: candidateDraftSchema,
  research: z.object({
    status: z.enum(["disabled", "completed", "failed"]),
    topic: z.string(),
    rawOutput: z.string(),
    evidence: z.array(
      z.object({
        externalId: z.string(),
        publisher: z.string(),
        url: z.string().url(),
        headline: z.string(),
        publishedAt: z.number(),
        rawExcerpt: z.string(),
        hash: z.string(),
      }),
    ),
  }),
});

export type AdoptionScanInput = z.infer<typeof adoptionScanInputSchema>;
export type CandidateDraft = z.infer<typeof candidateDraftSchema>;
