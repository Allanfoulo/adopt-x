import { z } from "zod";

const pointSchema = z.object({ title: z.string().min(1), detail: z.string().min(1) });
const opportunitySchema = pointSchema.extend({ confidence: z.enum(["High", "Medium", "Low"]) });

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
  analysis: z.object({
    capabilityPurchased: z.array(z.string().min(1)).min(1),
    buildVsBuy: z.string().min(1),
    marketChange: z.string().min(1),
    valueDrivers: z.array(z.string().min(1)).min(1),
    strategicRationalePoints: z.array(pointSchema).min(2),
    synergyMap: z.array(z.object({
      category: z.enum(["Revenue", "Cost", "Strategic"]),
      items: z.array(z.string().min(1)).min(1),
    })).min(1),
    riskAnalysis: z.array(z.object({
      category: z.enum(["Technology", "Integration", "Regulation", "Execution", "Competition", "Talent", "Financial", "Macro"]),
      title: z.string().min(1),
      detail: z.string().min(1),
      mitigation: z.string().min(1),
    })).min(2),
    marketSignal: z.string().min(1),
    followTheMoney: z.array(pointSchema).min(1),
    secondOrderEffects: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(2),
    startupOpportunities: z.array(opportunitySchema).min(1),
    productIdeas: z.array(opportunitySchema).min(1),
    investmentThesis: z.string().min(1),
  }),
});

export type BriefEnrichment = z.infer<typeof briefEnrichmentSchema>;
