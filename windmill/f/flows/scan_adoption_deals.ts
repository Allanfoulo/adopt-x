import { ConvexHttpClient } from "npm:convex/browser";
import { makeFunctionReference } from "npm:convex/server";

type Source = {
  externalId: string;
  sourceClass: "primary_structured" | "secondary_signal" | "community";
  sourceType: string;
  publisher: string;
  publisherReputation?: string;
  url: string;
  headline: string;
  publishedAt: number;
  rawExcerpt: string;
  hash: string;
};

type CandidateDraft = {
  company: string;
  target: string;
  dealType: string;
  sector: string;
  geography: string;
  aiRole: string;
  reasoningSummary: string;
};

type PreparedSource = Source & {
  candidateDraft?: CandidateDraft;
  quarantineReason?: string;
  corroboration?: {
    completed: boolean;
    resultCount: number;
    independentPublisherCount: number;
  };
};

type AgentResponse = {
  object?: unknown;
  text?: unknown;
  steps?: unknown;
  toolResults?: unknown;
};

const ingestSourceBatch = makeFunctionReference<"mutation">("ingest:ingestSourceBatch");

/** Windmill flow entry point after collectors have returned normalized sources. */
export async function main(sourceTypes: string[], sources: Source[]) {
  const convexUrl = Deno.env.get("CONVEX_URL");
  if (!convexUrl) throw new Error("CONVEX_URL is required");
  const mastraUrl = Deno.env.get("MASTRA_SERVER_URL")?.replace(/\/$/, "");
  if (!mastraUrl) throw new Error("MASTRA_SERVER_URL is required; adoption scoring is fail-closed");

  const agentId = Deno.env.get("MASTRA_ADOPTION_AGENT_ID") ?? "adopt-x-adoption-agent";
  const token = Deno.env.get("MASTRA_API_TOKEN");
  const preparedSources: PreparedSource[] = [];
  const inputSources = sources.slice(0, 250);

  for (let index = 0; index < inputSources.length; index += 4) {
    const batch = inputSources.slice(index, index + 4);
    const preparedBatch = await Promise.all(
      batch.map((source) =>
        isPotentialAdoptionSignal(source)
          ? analyzeSource(source, mastraUrl, agentId, token)
          : Promise.resolve(source),
      ),
    );
    preparedSources.push(...preparedBatch);
  }

  const client = new ConvexHttpClient(convexUrl);
  return await client.mutation(ingestSourceBatch, {
    externalRunId: `windmill-${crypto.randomUUID()}`,
    sourceTypes,
    sources: preparedSources,
  });
}

async function analyzeSource(
  source: Source,
  mastraUrl: string,
  agentId: string,
  token?: string,
): Promise<PreparedSource> {
  try {
    const response = await fetch(
      `${mastraUrl}/api/agents/${encodeURIComponent(agentId)}/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                "Analyze this public source as an Adopt X market-adoption candidate.",
                "You must call firecrawlCorroborate before returning the JSON.",
                "Return only the exact candidate JSON keys defined in your instructions.",
                JSON.stringify(source, null, 2),
              ].join("\n\n"),
            },
          ],
          activeTools: ["firecrawlCorroborate"],
          maxSteps: 6,
          toolChoice: "required",
          modelSettings: { temperature: 0.1 },
        }),
      },
    );

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(
        `Adoption agent returned HTTP ${response.status}: ${responseText.slice(0, 240)}`,
      );
    }

    const payload = JSON.parse(responseText) as AgentResponse;
    if (!hasSuccessfulFirecrawl(payload.toolResults ?? payload.steps ?? payload)) {
      throw new Error("Firecrawl corroboration did not complete");
    }

    const corroboration = summarizeFirecrawl(payload.toolResults ?? payload.steps ?? payload);
    const candidateDraft = parseCandidateDraft(payload.object ?? payload.text);
    if (!candidateDraft) throw new Error("Adoption agent returned invalid candidate JSON");
    return { ...source, candidateDraft, corroboration };
  } catch (error) {
    return {
      ...source,
      quarantineReason: error instanceof Error ? error.message : "Unknown adoption-agent error",
    };
  }
}

function isPotentialAdoptionSignal(source: Source) {
  const text = `${source.headline} ${source.rawExcerpt}`;
  return (
    /\b(acquire|acquires|acquired|acquisition|merger|merges|partner|partners|partnership|partnered|collaborat\w*|joint venture|invests in|invested in|investment in|funding|deploys?|implements?|integrates?|launches?)\b/i.test(
      text,
    ) &&
    /\b(ai|artificial intelligence|machine learning|generative|copilot|automation|model|robotics)\w*/i.test(
      text,
    )
  );
}

function hasSuccessfulFirecrawl(value: unknown): boolean {
  return summarizeFirecrawl(value).completed;
}

function summarizeFirecrawl(value: unknown) {
  const urls = new Set<string>();
  let resultCount = 0;
  let completed = false;

  function visit(current: unknown) {
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }
    if (!current || typeof current !== "object") return;
    const record = current as Record<string, unknown>;
    const toolName =
      typeof record.toolName === "string"
        ? record.toolName
        : typeof record.name === "string"
          ? record.name
          : "";
    const output = record.output ?? record.result;
    if (toolName.toLowerCase().includes("firecrawl") && output && typeof output === "object") {
      const outputRecord = output as Record<string, unknown>;
      if (outputRecord.status === "completed") {
        completed = true;
        const evidence = Array.isArray(outputRecord.evidence) ? outputRecord.evidence : [];
        resultCount += evidence.length;
        for (const item of evidence) {
          if (!item || typeof item !== "object") continue;
          const url = (item as Record<string, unknown>).url;
          if (typeof url !== "string") continue;
          try {
            urls.add(new URL(url).hostname.toLowerCase());
          } catch {
            // Ignore malformed evidence URLs; the tool schema rejects them upstream.
          }
        }
      }
    }
    Object.values(record).forEach(visit);
  }

  visit(value);
  return {
    completed,
    resultCount,
    independentPublisherCount: urls.size,
  };
}

function parseCandidateDraft(value: unknown): CandidateDraft | null {
  const parsed = typeof value === "object" && value !== null ? value : parseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  const stringFields = [
    "company",
    "target",
    "dealType",
    "sector",
    "geography",
    "aiRole",
    "reasoningSummary",
  ];
  if (stringFields.some((field) => typeof record[field] !== "string")) return null;
  return {
    company: String(record.company),
    target: String(record.target),
    dealType: String(record.dealType),
    sector: String(record.sector),
    geography: String(record.geography),
    aiRole: String(record.aiRole),
    reasoningSummary: String(record.reasoningSummary),
  };
}

function parseJson(value: unknown): unknown {
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
