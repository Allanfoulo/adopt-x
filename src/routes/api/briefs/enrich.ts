import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const sourceSchema = z.object({
  publisher: z.string(),
  sourceType: z.string(),
  sourceClass: z.string(),
  url: z.string().url(),
  headline: z.string(),
  publishedAt: z.number(),
  rawExcerpt: z.string(),
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

        const response = await fetch(`${baseUrl}/api/agents/${encodeURIComponent(agentId)}/generate`, {
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
        });
        const responseText = await response.text();
        if (!response.ok) {
          return Response.json(
            { error: `Mastra enrichment failed (${response.status}): ${responseText.slice(0, 500)}` },
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
    "Generate an analyst-ready Adopt X brief from this candidate and public evidence.",
    "Use the last30days-research tool for secondary context when available, but never treat it as proof of the deal.",
    "Return only valid JSON with exactly these keys. Do not use markdown.",
    JSON.stringify({
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
    }, null, 2),
    "Candidate:",
    JSON.stringify(input.candidate, null, 2),
    "Sources:",
    JSON.stringify(input.sources, null, 2),
  ].join("\n\n");
}

function parseJsonFromText(value: unknown): unknown {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
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
