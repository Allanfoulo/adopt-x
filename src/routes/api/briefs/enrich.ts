import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const evidenceReferenceSchema = z.object({
  claimId: z.string(),
  claim: z.string(),
  relation: z.enum(["supports", "contradicts"]),
  sourceExternalIds: z.array(z.string()),
});

const preReviewAssessmentSchema = z.object({
  signal: z.string(),
  interestingBecause: z.string(),
  preliminaryThesis: z.string(),
  counterThesis: z.string(),
  evidenceRefs: z.array(evidenceReferenceSchema),
  missingEvidence: z.array(z.string()),
  confidenceRationale: z.string(),
});

const corroborationEvidenceSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  url: z.string().url(),
  description: z.string(),
  markdown: z.string(),
});

const sourceSchema = z.object({
  externalId: z.string(),
  publisher: z.string(),
  sourceType: z.string(),
  sourceClass: z.string(),
  url: z.string().url(),
  headline: z.string(),
  publishedAt: z.number(),
  rawExcerpt: z.string(),
  corroborationEvidence: z.array(corroborationEvidenceSchema),
});

const requestSchema = z.object({
  candidate: z.object({
    externalId: z.string(),
    company: z.string(),
    target: z.string(),
    dealType: z.string(),
    sector: z.string(),
    geography: z.string(),
    aiRole: z.string(),
    confidenceScore: z.number(),
    thesisFitScore: z.number(),
    sourceConfidence: z.number(),
    preReviewAssessment: preReviewAssessmentSchema.nullable().optional(),
  }),
  sources: z.array(sourceSchema),
});

export const Route = createFileRoute("/api/briefs/enrich")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const baseUrl = process.env.MASTRA_SERVER_URL?.replace(/\/$/, "");
        const agentId = process.env.MASTRA_BRIEF_AGENT_ID ?? "adopt-x-brief-enrichment-agent";
        const token = process.env.MASTRA_API_TOKEN;
        if (!baseUrl) {
          return Response.json({ error: "MASTRA_SERVER_URL is not configured." }, { status: 503 });
        }

        let input: z.infer<typeof requestSchema>;
        try {
          input = requestSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid brief enrichment input." }, { status: 400 });
        }

        const response = await fetch(
          `${baseUrl}/api/agents/${encodeURIComponent(agentId)}/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: buildPrompt(input) }],
              maxSteps: 8,
              toolChoice: "auto",
              tracingOptions: { traceName: "adopt-x-brief-enrichment" },
            }),
          },
        );
        const responseText = await response.text();
        if (!response.ok) {
          return Response.json(
            {
              error: `Mastra enrichment failed (${response.status}): ${responseText.slice(0, 500)}`,
            },
            { status: 502 },
          );
        }

        let body: { text?: string; object?: unknown; toolResults?: unknown[]; steps?: unknown[] };
        try {
          body = JSON.parse(responseText) as typeof body;
        } catch {
          return Response.json({ error: "Mastra returned invalid JSON." }, { status: 502 });
        }

        return Response.json({
          value: parseJsonFromText(body.object ?? body.text),
          toolResults: body.toolResults ?? body.steps ?? [],
        });
      },
    },
  },
});

function buildPrompt(input: z.infer<typeof requestSchema>): string {
  return [
    "Generate a detailed, decision-ready Adopt X investment banking brief from this candidate and public evidence.",
    "Apply this framework: facts, capability purchased, build versus buy, market change, value drivers, synergy map, risk buckets, market signal, follow the money, second-order effects, startup opportunities, product ideas, and investment thesis.",
    "Use the last30days-research tool for secondary context when available, but never treat it as proof of the deal.",
    "Use precise evidence limits. For unsupported opportunities write 'No defensible opportunity identified from the available evidence'. For unsupported theses write 'Preliminary thesis only; confidence is low because evidence is limited'. Never invent facts and never say 'I can't think of'.",
    "Use the supplied pre-review assessment as a starting point, but re-check it against all sources. Return a thesisMap with claim-level sourceExternalIds, a counter-thesis, invalidation conditions, confidence rationale, and explicit limitations. Do not invent source IDs. If evidence is insufficient, use precise unavailable language.",
    "The source list may contain nested corroborationEvidence returned by Firecrawl. Treat each nested item's externalId, title, URL, description, and markdown as citable evidence. Cite those externalIds exactly in thesisMap.evidenceClaims when they support or contradict a claim.",
    "Write detailed prose suitable for a multi-page investment banking brief, not a short summary.",
    "Return only valid JSON with exactly these keys. Do not use markdown.",
    JSON.stringify(
      {
        executiveSummary: "string",
        transactionOverview: "string",
        strategicRationale: "string",
        risks: ["string", "string"],
        marketImplications: "string",
        keyTakeaways: ["string", "string", "string"],
        dealStructure: "string or Not available",
        confidenceScore: 0,
        evidenceUsed: ["source headline or URL"],
        last30daysUsed: false,
        thesisMap: {
          signal: "what happened",
          surfaceInterpretation: "the obvious reading of the signal",
          interestingBecause: "why this signal matters",
          thesis: "what the signal suggests is becoming true",
          evidenceClaims: [
            {
              claimId: "E1",
              claim: "evidence-backed claim",
              relation: "supports",
              sourceExternalIds: ["source external id"],
            },
          ],
          implications: [{ title: "implication", detail: "what follows if the thesis is correct" }],
          followTheMoney: [{ title: "value flow", detail: "where spending or value may move" }],
          invalidationConditions: ["what evidence would weaken or invalidate the thesis"],
          counterThesis: "the strongest alternative explanation",
          opportunities: [
            {
              title: "opportunity",
              detail: "evidence-bounded opportunity or explicit lack of one",
              confidence: "High | Medium | Low",
            },
          ],
          confidence: {
            level: "High | Medium | Low",
            rationale: "why this confidence level is justified",
            basis: "candidate_confidence_score | evidence_coverage | mixed",
          },
          limitations: ["material evidence limitation"],
        },
        analysis: {
          capabilityPurchased: ["capability, not a feature"],
          buildVsBuy: "why buying was preferred to internal development",
          marketChange: "market change forcing the transaction",
          valueDrivers: [
            {
              title: "technology, customers, talent, distribution, data, or regulation",
              detail: "evidence-backed reason this driver creates value in this specific case",
            },
          ],
          strategicRationalePoints: [{ title: "reason", detail: "evidence-backed explanation" }],
          synergyMap: [{ category: "Revenue | Cost | Strategic", items: ["specific synergy"] }],
          riskAnalysis: [
            { category: "Integration", title: "risk", detail: "impact", mitigation: "mitigation" },
          ],
          marketSignal: "what this deal signals about tomorrow",
          followTheMoney: [{ title: "stakeholder", detail: "who benefits financially and how" }],
          secondOrderEffects: [
            { question: "What becomes easier?", answer: "evidence-backed effect" },
          ],
          startupOpportunities: [
            {
              title: "opportunity",
              detail: "hypothesis or evidence",
              confidence: "High | Medium | Low",
            },
          ],
          productIdeas: [
            {
              title: "product idea",
              detail: "hypothesis or evidence",
              confidence: "High | Medium | Low",
            },
          ],
          investmentThesis: "decision-ready thesis with explicit evidence limits",
        },
      },
      null,
      2,
    ),
    "Candidate:",
    JSON.stringify(input.candidate, null, 2),
    "Sources:",
    JSON.stringify(input.sources, null, 2),
    "Pre-review assessment:",
    JSON.stringify(input.candidate.preReviewAssessment ?? null, null, 2),
  ].join("\n\n");
}

function parseJsonFromText(value: unknown): unknown {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
