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
export type BriefAnalysis = {
  capabilityPurchased: string[];
  buildVsBuy: string;
  marketChange: string;
  valueDrivers: string[];
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
  sources: { headline: string; publisher: string; date: string; type: string; url: string }[];
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
