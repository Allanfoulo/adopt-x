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

export const evidenceReferenceSchema = z.object({
  claimId: z.string().min(1),
  claim: z.string().min(1),
  relation: z.enum(["supports", "contradicts"]),
  sourceExternalIds: z.array(z.string()),
});

export const preReviewAssessmentSchema = z.object({
  signal: z.string().min(1),
  interestingBecause: z.string().min(1),
  preliminaryThesis: z.string().min(1),
  counterThesis: z.string().min(1),
  evidenceRefs: z.array(evidenceReferenceSchema),
  missingEvidence: z.array(z.string().min(1)),
  confidenceRationale: z.string().min(1),
});

export const candidateDraftSchema = z.object({
  company: z.string(),
  target: z.string(),
  dealType: z.string(),
  sector: z.string(),
  geography: z.string(),
  aiRole: z.string(),
  reasoningSummary: z.string(),
  preReviewAssessment: preReviewAssessmentSchema,
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
export type PreReviewAssessment = z.infer<typeof preReviewAssessmentSchema>;
