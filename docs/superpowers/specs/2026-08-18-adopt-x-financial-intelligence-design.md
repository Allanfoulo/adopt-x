# Adopt X Financial Intelligence Layer Design

## Summary

This design adds a cross-market financial intelligence layer to Adopt X. It extends the existing public-source and analyst-review workflow with structured financial filings, XBRL/iXBRL facts, deterministic financial ratios, cash-allocation analysis, AI-related filing interpretation, and country/sector/company-size comparisons.

The product objective is to identify where AI is moving from publicity into funded, operational adoption.

This document is implementation-oriented. The explanatory rationale and future change points are maintained in [AdoptX_Financial_Intelligence_Design.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Financial_Intelligence_Design.md).

## Current System Boundary

The current system uses:

- Windmill for scheduled public-source collection and durable jobs;
- Convex as the system of record for sources, candidates, review state, audit events, and briefs;
- Mastra for candidate interpretation, enrichment, and brief drafting;
- the React/TanStack UI for analyst review.

The financial layer must preserve this boundary:

```text
Windmill collects and parses.
Convex stores and governs.
Deterministic code calculates.
Mastra interprets and explains.
The analyst reviews.
```

No financial metric should depend on an LLM-generated number.

## Approved Market Universe

### Core markets

- United States
- United Kingdom
- Denmark
- Finland
- Sweden
- France
- Germany
- Japan
- South Korea
- Australia
- Canada

### Satellite markets

- Singapore
- United Arab Emirates

### Deferred expansion tracks

- India
- Mainland China

The market registry must distinguish issuer domicile, listing venue, and operating geography.

## Functional Requirements

### Filing collection

Collectors must retrieve filing metadata and structured data from market-specific systems while preserving source URLs, filing identifiers, and retrieval hashes.

The initial filing scope should prioritize annual and periodic financial reports plus material-event disclosures:

- SEC: 10-K, 10-Q, 8-K and amendments;
- UK: regulated annual financial reports and material disclosures;
- EU: ESEF annual reports and relevant regulated disclosures;
- Japan: EDINET annual/periodic filings and JPX disclosures;
- South Korea: DART annual, periodic, and material disclosures;
- Australia, Canada, India, Hong Kong: equivalent annual, periodic, and material disclosures.

Market-specific forms must be mapped to a common filing-type vocabulary.

### Financial fact normalization

Normalize facts into a common concept set:

```text
revenue
grossProfit
operatingIncome
netIncome
cashFromOperations
capitalExpenditures
researchAndDevelopment
cashPaidForAcquisitions
debtIssued
debtRepaid
shareRepurchases
dividendsPaid
cashAndEquivalents
totalDebt
```

Retain the original taxonomy, tag, unit, period, dimensions, filing ID, and parser version for every fact.

### Ratio and trend calculations

The initial deterministic metric library must include:

```text
revenueGrowth = revenue_t / revenue_t-1 - 1
grossMargin = grossProfit / revenue
operatingMargin = operatingIncome / revenue
netMargin = netIncome / revenue
freeCashFlow = cashFromOperations - capitalExpenditures
freeCashFlowMargin = freeCashFlow / revenue
researchAndDevelopmentIntensity = researchAndDevelopment / revenue
capexIntensity = capitalExpenditures / revenue
acquisitionIntensity = cashPaidForAcquisitions / revenue
cashConversion = cashFromOperations / netIncome
netDebt = totalDebt - cashAndEquivalents
netDebtToFreeCashFlow = netDebt / freeCashFlow
```

Trend metrics must include year-over-year change, multi-period change, and acceleration where sufficient history exists.

The calculation engine must return missing-input reasons and must not convert unavailable values into zero.

### Cash allocation

The system must separate cash sources from cash uses.

Cash sources:

- cash from operations;
- debt issuance;
- equity issuance;
- asset sales.

Cash uses:

- capital expenditures;
- acquisitions;
- debt repayment;
- share repurchases;
- dividends.

Required derived measures:

```text
cashDeploymentMix = individualCashUse /
  (capitalExpenditures + acquisitions + buybacks + dividends + debtRepayment)

freeCashFlowAllocation = individualCashUse / freeCashFlow
```

The denominator and sign convention must be displayed with every allocation metric.

R&D is treated as a strategic investment proxy because it is generally an income-statement expense rather than a separately reported cash-flow use.

### AI-related acquisition analysis

Acquisition relevance requires both:

1. structured or extracted acquisition spending;
2. filing text that supports AI relevance.

The classifier must return one of:

- `explicit_ai_related`;
- `technology_related_possible_ai`;
- `not_ai_related_from_available_evidence`;
- `insufficient_disclosure`.

The classifier output must include the filing passage and confidence.

### Filing-language analysis

For each filing, calculate normalized AI-mention rates and classify mentions by section:

- strategy;
- operations;
- risk factors;
- capital allocation;
- products and services;
- workforce and hiring.

The system must distinguish boilerplate language from substantive disclosure using an explainable classifier and retained evidence.

### Cross-market aggregation

Aggregate metrics by:

- country;
- sector;
- company-size cohort;
- reporting period;
- accounting standard.

Produce both equal-weighted and revenue-weighted measures.

Minimum cohort outputs:

```text
adoption rate
R&D intensity and change
capex intensity and change
AI mention breadth
AI-related acquisition breadth
operating-margin change
coverage rate
confidence level
```

## Analytical Questions and Required Outputs

### R&D intensity

Show R&D spend growth, R&D intensity, and R&D intensity change by country, sector, size cohort, and period.

### Capex acceleration

Show capex growth, capex intensity, acceleration, and disclosed technology/infrastructure capex where available.

### AI-related acquisitions

Show acquisition count, disclosed acquisition value, acquisition intensity, AI-relevance classification, and supporting passages.

### Investment and margins

Show operating-margin changes alongside changes in R&D and capex intensity. Label the result as association unless filing evidence supports a stronger conclusion.

### AI mentions in filings

Show the percentage of eligible firms mentioning AI, mention rate per filing length, first meaningful mention, and substantive-versus-boilerplate classification.

### Adoption beyond technology

Show adoption and financial-investment measures across non-technology sectors, with sector definitions retained by market.

### Company-size adoption

Show the same measures for small, mid-market, and large cohorts. Revenue is the primary size variable; market capitalization is secondary.

## Proposed Convex Tables

### `secEntities`

Stores market-aware issuer identity and classification.

### `secFilings`

Stores immutable filing metadata, provenance, URLs, hashes, form mappings, and collection state.

### `xbrlFacts`

Stores raw and parsed XBRL/iXBRL facts, including taxonomy, tag, unit, value, period, dimensions, and source location.

### `financialPeriods`

Stores normalized annual, quarterly, and instant periods with restatement and normalization versions.

### `derivedMetrics`

Stores calculated values, formula versions, input fact references, missing inputs, and confidence.

### `financialSignals`

Stores cohort-level signals, coverage, trend values, supporting metrics, and supporting filings.

Existing `sourceHits` should remain the general provenance layer. Filing records can link to source hits, but financial facts should not be flattened into raw news-source fields.

## Windmill Contracts

Each collector should emit a common envelope:

```ts
type FilingEnvelope = {
  market: string;
  issuerId: string;
  filingId: string;
  filingType: string;
  filedAt: number;
  periodOfReport?: { start?: number; end?: number; instant?: number };
  reportingCurrency?: string;
  accountingStandard?: string;
  sourceUrl: string;
  rawDocumentHash: string;
  structuredFacts: unknown[];
  textSections: Array<{
    section: string;
    text: string;
    sourceLocation?: string;
  }>;
};
```

Windmill owns scheduling, retries, rate limiting, external requests, parsing, and incremental collection. Convex mutations must validate and persist the envelope before downstream interpretation.

## Calculation Contracts

Every derived metric must return:

```ts
type DerivedMetric = {
  entityId: string;
  periodId: string;
  metric: string;
  value: number | null;
  formulaVersion: string;
  inputFactIds: string[];
  missingInputs: string[];
  confidence: "high" | "medium" | "low";
};
```

Every cohort signal must return:

```ts
type FinancialSignal = {
  scope: "country" | "sector" | "size" | "country_sector";
  scopeKey: string;
  periodId: string;
  signalType: string;
  value: number | null;
  coverageRate: number;
  sourceCount: number;
  supportingMetricIds: string[];
  supportingFilingIds: string[];
  confidence: "high" | "medium" | "low";
};
```

## Data Quality and Error Handling

The system must preserve:

- accounting standard;
- reporting currency;
- original period semantics;
- amendment and restatement status;
- custom-taxonomy status;
- parser and mapping version;
- filing-level source location.

Failure rules:

- collection failure: retry with an explicit collector run error;
- malformed filing: persist the filing metadata and mark parsing as partial failure;
- missing concept: return a missing-input reason;
- conflicting facts: retain both facts and apply a documented selection rule;
- restatement: create a new version and preserve the earlier version;
- insufficient cohort coverage: suppress or downgrade the signal;
- ambiguous AI classification: keep the item reviewable rather than force a label.

## Security and Access

Public filing access does not eliminate operational requirements. Collectors must follow each source’s access rules, use declared user agents where required, rate-limit requests, and avoid storing credentials in source files.

Financial facts and derived signals are internal product records. Filing URLs and excerpts should remain traceable to public source documents.

## Testing and Evaluation

### Unit tests

- formula correctness;
- sign conventions;
- annual/quarterly/YTD normalization;
- unit and currency handling;
- missing-input behavior;
- restatement selection;
- cohort aggregation;
- coverage calculations.

### Contract tests

- each collector emits the common filing envelope;
- Convex validates and persists the envelope;
- normalized facts retain provenance;
- derived metrics retain input references;
- Mastra outputs include evidence passages;
- no model output can mutate financial facts directly.

### Golden datasets

Maintain hand-verified examples for:

- one US issuer;
- one UK/EU issuer;
- one Japanese issuer;
- one South Korean issuer;
- one Australian or Canadian issuer.

Each example should include known revenue, R&D, capex, cash flow, margin, and acquisition values for at least two reporting periods.

## Rollout Plan

1. US vertical slice: one issuer, one annual filing, core facts, and ratios.
2. Period normalization: annual/quarterly data, fiscal calendars, amendments, and restatements.
3. Cash allocation and acquisition analysis.
4. Core market collectors.
5. Country, sector, and company-size aggregation.
6. AI filing-mention and acquisition-relevance interpretation.
7. Satellite market signals for Singapore and the UAE.
8. Separate India and Mainland China expansion tracks.

## Acceptance Criteria

The implementation is acceptable when an analyst can select a market, sector, and period and receive:

- financial metrics with formulas;
- filing-level source links;
- input facts behind derived values;
- country, sector, and size comparisons;
- adoption and investment trends;
- AI mention and acquisition-relevance evidence;
- coverage and confidence warnings;
- clear separation between observed facts and hypotheses.

The implementation must answer the seven approved analytical questions without requiring an analyst to manually reconstruct the underlying filings or calculations.

