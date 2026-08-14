import { v } from "convex/values";

export const scoreComponentValidator = v.object({
  label: v.string(),
  points: v.number(),
  rationale: v.string(),
});

export const scoreBreakdownValidator = v.object({
  version: v.string(),
  confidence: v.array(scoreComponentValidator),
  thesisFit: v.array(scoreComponentValidator),
  sourceConfidence: v.array(scoreComponentValidator),
});

type ScoreComponent = {
  label: string;
  points: number;
  rationale: string;
};

export type ScoreBreakdown = {
  version: "rubric-v1";
  confidence: ScoreComponent[];
  thesisFit: ScoreComponent[];
  sourceConfidence: ScoreComponent[];
};

type ScoringSource = {
  sourceClass: "primary_structured" | "secondary_signal" | "community";
  publisherReputation?: string;
  headline: string;
  rawExcerpt: string;
  publishedAt: number;
  corroboration?: {
    completed: boolean;
    resultCount: number;
    independentPublisherCount: number;
  };
};

type ScoringCandidate = {
  company: string;
  target: string;
  dealType: string;
  sector: string;
  geography: string;
  aiRole: string;
};

export function calculateCandidateScores(
  source: ScoringSource,
  candidate: ScoringCandidate,
  now = Date.now(),
) {
  const text = `${source.headline} ${source.rawExcerpt}`;
  const corroboration = source.corroboration;
  const corroborationCount = corroboration?.resultCount ?? 0;
  const independentPublisherCount = corroboration?.independentPublisherCount ?? 0;
  const recencyDays = Math.max(0, (now - source.publishedAt) / 86_400_000);
  const recencyPoints = recencyDays <= 7 ? 10 : recencyDays <= 30 ? 6 : recencyDays <= 90 ? 3 : 0;
  const sourceClassPoints =
    source.sourceClass === "primary_structured"
      ? 45
      : source.sourceClass === "secondary_signal"
        ? 30
        : 15;
  const publisherPoints =
    source.publisherReputation?.toLowerCase() === "high"
      ? 25
      : source.publisherReputation?.toLowerCase() === "medium"
        ? 15
        : 5;
  const corroborationPoints = Math.min(20, corroborationCount * 5);
  const independentPoints = Math.min(10, independentPublisherCount * 5);
  const sourceConfidence = clamp(
    sourceClassPoints + publisherPoints + recencyPoints + corroborationPoints + independentPoints,
  );

  const knownFields = [
    candidate.company,
    candidate.target,
    candidate.dealType,
    candidate.sector,
    candidate.geography,
    candidate.aiRole,
  ].filter((value) => value.trim() && !/^unknown|not available|n\/a$/i.test(value.trim())).length;
  const factCompletenessPoints = Math.round((knownFields / 6) * 40);
  const transactionSpecificityPoints =
    (hasNamedTarget(candidate.target) ? 10 : 0) +
    (candidate.dealType ? 5 : 0) +
    (hasActionLanguage(text) ? 5 : 0);
  const confidenceCorroborationPoints = Math.min(20, independentPublisherCount * 10);
  const confidenceRecencyPoints = recencyPoints;
  const confidenceSourceQualityPoints = Math.min(10, Math.round(sourceConfidence * 0.1));
  const confidenceScore = clamp(
    factCompletenessPoints +
      transactionSpecificityPoints +
      confidenceCorroborationPoints +
      confidenceRecencyPoints +
      confidenceSourceQualityPoints,
  );

  const aiCapabilityPoints = hasSpecificAiCapability(candidate.aiRole, text) ? 30 : 8;
  const integrationPoints = hasActionLanguage(text) ? 25 : 5;
  const industryPoints = hasKnownIndustry(candidate.sector) ? 20 : 8;
  const mechanismPoints = candidate.dealType ? 15 : 0;
  const targetPoints = hasNamedTarget(candidate.target) ? 10 : 0;
  const thesisCorroborationPoints = Math.min(10, independentPublisherCount * 5);
  const thesisFitScore = clamp(
    aiCapabilityPoints +
      integrationPoints +
      industryPoints +
      mechanismPoints +
      targetPoints +
      thesisCorroborationPoints,
  );

  const breakdown: ScoreBreakdown = {
    version: "rubric-v1",
    confidence: [
      {
        label: "Fact completeness",
        points: factCompletenessPoints,
        rationale: `${knownFields} of 6 core candidate fields are supported and identified.`,
      },
      {
        label: "Transaction specificity",
        points: transactionSpecificityPoints,
        rationale:
          "Rewards a named target, identified deal type, and explicit transaction language.",
      },
      {
        label: "Independent corroboration",
        points: confidenceCorroborationPoints,
        rationale: `${independentPublisherCount} independent publisher domain(s) returned by corroboration.`,
      },
      {
        label: "Recency",
        points: confidenceRecencyPoints,
        rationale: `Published ${Math.round(recencyDays)} day(s) ago.`,
      },
      {
        label: "Source quality contribution",
        points: confidenceSourceQualityPoints,
        rationale:
          "A bounded 10% contribution from the separately itemized source-confidence score is included.",
      },
    ],
    thesisFit: [
      {
        label: "Specific AI capability",
        points: aiCapabilityPoints,
        rationale: hasSpecificAiCapability(candidate.aiRole, text)
          ? `The AI role is specific: ${candidate.aiRole}.`
          : "The AI role remains generic or unsupported by the source text.",
      },
      {
        label: "Integration or adoption action",
        points: integrationPoints,
        rationale: hasActionLanguage(text)
          ? "The source contains an explicit adoption, partnership, investment, launch, or transaction action."
          : "No explicit adoption action was detected.",
      },
      {
        label: "Identifiable industry",
        points: industryPoints,
        rationale: hasKnownIndustry(candidate.sector)
          ? `The signal is attributable to the ${candidate.sector} sector.`
          : "The sector is unknown or too broad to establish industry adoption.",
      },
      {
        label: "Transaction mechanism",
        points: mechanismPoints,
        rationale: candidate.dealType
          ? `The deal mechanism is identified as ${candidate.dealType}.`
          : "No deal mechanism was identified.",
      },
      {
        label: "Named target",
        points: targetPoints,
        rationale: hasNamedTarget(candidate.target)
          ? `The target is identified as ${candidate.target}.`
          : "The target is unknown or unavailable.",
      },
      {
        label: "Corroboration",
        points: thesisCorroborationPoints,
        rationale: `${independentPublisherCount} independent publisher domain(s) support the adoption signal.`,
      },
    ],
    sourceConfidence: [
      {
        label: "Source class",
        points: sourceClassPoints,
        rationale: `The ${source.sourceClass} class has a fixed rubric weight.`,
      },
      {
        label: "Publisher reputation",
        points: publisherPoints,
        rationale: `Publisher reputation is ${source.publisherReputation ?? "unknown"}.`,
      },
      {
        label: "Recency",
        points: recencyPoints,
        rationale: `Published ${Math.round(recencyDays)} day(s) ago.`,
      },
      {
        label: "Corroborating results",
        points: corroborationPoints,
        rationale: `${corroborationCount} corroborating result(s) were returned.`,
      },
      {
        label: "Independent publishers",
        points: independentPoints,
        rationale: `${independentPublisherCount} independent publisher domain(s) were identified.`,
      },
    ],
  };

  return { confidenceScore, thesisFitScore, sourceConfidence, scoreBreakdown: breakdown };
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasNamedTarget(target: string) {
  return Boolean(target.trim()) && !/^unknown|not available|n\/a$/i.test(target.trim());
}

function hasKnownIndustry(sector: string) {
  return Boolean(sector.trim()) && !/^other|unknown|not available|n\/a$/i.test(sector.trim());
}

function hasActionLanguage(text: string) {
  return /\b(acquire|acquires|acquired|acquisition|merger|merges|partner|partners|partnership|partnered|collaborat\w*|joint venture|invests in|invested in|investment in|funding|deploys?|implements?|integrates?|launches?)\b/i.test(
    text,
  );
}

function hasSpecificAiCapability(aiRole: string, text: string) {
  return (
    Boolean(aiRole.trim()) &&
    !/^ai integration and workflow automation|unknown|not available|n\/a$/i.test(aiRole.trim()) &&
    /\b(ai|artificial intelligence|machine learning|generative|copilot|automation|model|robotics)\w*/i.test(
      text,
    )
  );
}
