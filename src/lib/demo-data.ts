export type Status =
  | "Brief Ready"
  | "Needs Review"
  | "Approved"
  | "Brief Queued"
  | "Rejected"
  | "Brief Failed";

export type Candidate = {
  id: string;
  company: string;
  target: string;
  sector: string;
  geography: string;
  dealType: string;
  aiRole: string;
  confidence: number;
  thesisFit: number;
  sourceConfidence: number;
  published: string;
  status: Status;
  logoColor: string;
  logoLetter: string;
};

export const candidates: Candidate[] = [
  {
    id: "dc_001",
    company: "Purple Group",
    target: "Telescope AI",
    sector: "Fintech",
    geography: "South Africa · Australia",
    dealType: "Acquisition",
    aiRole: "Investment intelligence infrastructure",
    confidence: 92, thesisFit: 94, sourceConfidence: 95,
    published: "Jul 16",
    status: "Brief Ready",
    logoColor: "#8B5CF6", logoLetter: "P",
  },
  {
    id: "dc_002",
    company: "MediAxis",
    target: "ClinPilot AI",
    sector: "Healthcare",
    geography: "UK",
    dealType: "Strategic Partnership",
    aiRole: "Clinical workflow support",
    confidence: 81, thesisFit: 86, sourceConfidence: 88,
    published: "Jul 15",
    status: "Needs Review",
    logoColor: "#2DD4BF", logoLetter: "M",
  },
  {
    id: "dc_003",
    company: "InsuraCo",
    target: "ClaimForge AI",
    sector: "Insurance",
    geography: "US",
    dealType: "Strategic Investment",
    aiRole: "Claims automation",
    confidence: 79, thesisFit: 83, sourceConfidence: 84,
    published: "Jul 14",
    status: "Approved",
    logoColor: "#4D9DFF", logoLetter: "I",
  },
  {
    id: "dc_004",
    company: "LexGrid",
    target: "RegAICore",
    sector: "Legal",
    geography: "Australia",
    dealType: "Acquisition",
    aiRole: "Compliance review automation",
    confidence: 77, thesisFit: 85, sourceConfidence: 82,
    published: "Jul 13",
    status: "Brief Queued",
    logoColor: "#F5A524", logoLetter: "L",
  },
  {
    id: "dc_005",
    company: "SparkPrompt",
    target: "—",
    sector: "Marketing Software",
    geography: "US",
    dealType: "Product Launch",
    aiRole: "Generic marketing copilot",
    confidence: 41, thesisFit: 22, sourceConfidence: 60,
    published: "Jul 12",
    status: "Rejected",
    logoColor: "#FF4D45", logoLetter: "S",
  },
  {
    id: "dc_006",
    company: "HealthBridge",
    target: "CareScribe AI",
    sector: "Healthcare",
    geography: "Canada",
    dealType: "Strategic Partnership",
    aiRole: "Ambient clinical documentation",
    confidence: 74, thesisFit: 78, sourceConfidence: 81,
    published: "Jul 11",
    status: "Needs Review",
    logoColor: "#8EEA45", logoLetter: "H",
  },
  {
    id: "dc_007",
    company: "PayFlow Systems",
    target: "FraudSense AI",
    sector: "Fintech",
    geography: "Singapore",
    dealType: "Strategic Investment",
    aiRole: "Fraud detection & prevention",
    confidence: 88, thesisFit: 90, sourceConfidence: 91,
    published: "Jul 10",
    status: "Brief Ready",
    logoColor: "#8B5CF6", logoLetter: "P",
  },
  {
    id: "dc_008",
    company: "DataWeave",
    target: "VectorDB AI",
    sector: "Enterprise Software",
    geography: "Germany",
    dealType: "Acquisition",
    aiRole: "Unstructured data indexing",
    confidence: 68, thesisFit: 73, sourceConfidence: 75,
    published: "Jul 9",
    status: "Brief Queued",
    logoColor: "#4D9DFF", logoLetter: "D",
  },
];

export const queueCounts = {
  "Pending Review": 14,
  "Brief Queued": 6,
  "Brief Ready": 5,
  "Rejected": 2,
};

export const sectors = [
  { name: "Fintech", count: 9, pct: 33, color: "#F5A524" },
  { name: "Healthcare", count: 7, pct: 26, color: "#2DD4BF" },
  { name: "Insurance", count: 6, pct: 22, color: "#4D9DFF" },
  { name: "Legal", count: 5, pct: 19, color: "#8B5CF6" },
];

export const scanRuns = [
  { id: "scan_002", status: "Completed", when: "Today, 08:32 AM" },
  { id: "scan_001", status: "Completed", when: "Yesterday, 08:15 AM" },
  { id: "scan_003", status: "Running",   when: "Started 09:01 AM" },
  { id: "scan_000", status: "Failed",    when: "Jul 13, 04:28 PM" },
];

export const briefRuns = [
  { id: "brief_003", status: "Running",   when: "Started 09:01 AM" },
  { id: "brief_001", status: "Completed", when: "Today, 08:45 AM" },
  { id: "brief_002", status: "Completed", when: "Today, 08:36 AM" },
  { id: "brief_000", status: "Failed",    when: "Jul 13, 06:50 PM" },
];

export const auditEvents = [
  { who: "JS", action: "Edited AI Role", target: "Purple Group / Telescope AI / Fintech", when: "Today, 09:42 AM" },
  { who: "MP", action: "Approved Candidate", target: "InsuraCo / ClaimForge AI", when: "Today, 08:43 AM" },
  { who: "JS", action: "Rejected Off-Thesis Candidate", target: "HealthBridge / CareScribe AI", when: "Jul 13, 06:51 PM" },
];
