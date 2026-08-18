export type ArchiveRow = {
  id: string;
  company: string;
  target: string;
  logoLetter: string;
  logoColor: string;
  sector: string;
  geography: string;
  approvedDate: string;
  approvedTime: string;
  dealType: string;
  takeaway: string;
  version: string;
  status: "Approved" | "Generated" | "Draft" | "Archived";
};

export type BriefPoint = { title: string; detail: string };
export type BriefOpportunity = BriefPoint & { confidence: "High" | "Medium" | "Low" | string };
export type EvidenceClaim = {
  claimId: string;
  claim: string;
  relation: "supports" | "contradicts";
  sourceExternalIds: string[];
};
export type PreReviewAssessment = {
  signal: string;
  interestingBecause: string;
  preliminaryThesis: string;
  counterThesis: string;
  evidenceRefs: EvidenceClaim[];
  missingEvidence: string[];
  confidenceRationale: string;
};
export type ThesisMap = {
  signal: string;
  surfaceInterpretation: string;
  interestingBecause: string;
  thesis: string;
  evidenceClaims: EvidenceClaim[];
  implications: BriefPoint[];
  followTheMoney: BriefPoint[];
  invalidationConditions: string[];
  counterThesis: string;
  opportunities: BriefOpportunity[];
  confidence: {
    level: "High" | "Medium" | "Low" | string;
    rationale: string;
    basis: string;
  };
  limitations: string[];
};
export type BriefAnalysis = {
  capabilityPurchased: string[];
  buildVsBuy: string;
  marketChange: string;
  valueDrivers: (string | BriefPoint)[];
  strategicRationalePoints: BriefPoint[];
  synergyMap: { category: string; items: string[] }[];
  riskAnalysis: { category: string; title: string; detail: string; mitigation: string }[];
  marketSignal: string;
  followTheMoney: BriefPoint[];
  secondOrderEffects: { question: string; answer: string }[];
  startupOpportunities: BriefOpportunity[];
  productIdeas: BriefOpportunity[];
  investmentThesis: string;
};

export type ArchiveDetail = {
  id: string;
  brief: {
    executiveSummary: string;
    transactionOverview: string;
    strategicRationale: string;
    risks: string[];
    marketImplications: string;
    keyTakeaways: string[];
    evidenceUsed: string[];
    dealStructure: string;
    confidenceScore: number | null;
    last30daysUsed: boolean;
    analysis: BriefAnalysis | null;
    thesisMap: ThesisMap | null;
    version: string;
    status: string;
    updatedAt: number;
  };
  candidate: {
    company: string;
    target: string;
    sector: string;
    geography: string;
    dealType: string;
    aiRole: string;
    announcementDate: string;
  };
  transaction: { label: string; value: string }[];
  sources: {
    externalId: string;
    headline: string;
    publisher: string;
    date: string;
    type: string;
    url: string;
  }[];
  auditTrail: {
    actor: string;
    initials: string;
    action: string;
    detail: string;
    when: string;
    system: boolean;
  }[];
  metadata: { label: string; value: string }[];
};
