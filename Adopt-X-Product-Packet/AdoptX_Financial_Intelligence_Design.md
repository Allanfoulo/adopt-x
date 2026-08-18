# Adopt X Financial Intelligence Design

## Purpose

Adopt X currently identifies public evidence of AI adoption and strategic activity, organizes that evidence around candidate companies and deals, and routes candidates through analyst review.

This design adds a financial intelligence layer so the product can test whether AI adoption is becoming financially funded, operationally deployed, and increasingly visible in public-company disclosures.

The layer is intended to answer questions such as:

- Are companies increasing R&D intensity?
- Is capital expenditure accelerating?
- Are acquisitions becoming more AI-related?
- Are operating margins changing as investment increases?
- Are more firms mentioning AI in filings?
- Is adoption broadening beyond technology companies?
- Is adoption fastest among large companies, mid-market firms, or specific sectors?

The design deliberately separates observed facts, calculated metrics, correlations, hypotheses, and analyst conclusions. Financial values must be calculated deterministically and trace back to the filing facts that produced them.

## Thesis and Market Scope

The working thesis is:

> Identify where AI is moving from publicity into funded, operational adoption.

The initial core market universe is:

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

Singapore and the United Arab Emirates are satellite markets. They are important for AI usage and adoption momentum, but their public-company universes are smaller than the core markets.

The system must track three geographic attributes separately:

```text
issuer domicile
listing venue
operating geography
```

This avoids attributing a company’s activity to the country where it happens to be listed.

## Why a Cross-Market Panel

The United States remains the financial anchor because EDGAR offers broad coverage, filing-level provenance, and extracted XBRL APIs. It should not be the only observation market because AI adoption rates differ materially by country and by measurement method.

The product should compare markets with a scorecard rather than one opaque country score. The scorecard separates:

1. AI usage signal
2. Enterprise adoption signal
3. Financial investment signal
4. Public-company disclosure quality
5. Market scale
6. Adoption momentum

The first version should optimize for financial comparability and evidence quality while retaining enough geographic variation to reveal differences in adoption behavior.

## Regional Disclosure Systems

“SEC-esque” systems are regulators, exchanges, and disclosure repositories rather than companies. The principal systems in scope are:

| Region | System | Role in Adopt X |
| --- | --- | --- |
| United States | SEC EDGAR | Primary financial and filing source; submissions and XBRL APIs |
| Canada | SEDAR+ | National securities filings and issuer documents |
| United Kingdom | FCA National Storage Mechanism and Companies House | Regulated disclosures, annual reports, company accounts, and structured filings |
| European Union | ESMA ESEF through national repositories | IFRS annual reports in XHTML/iXBRL; access remains country-specific |
| Japan | EDINET and JPX disclosures | Annual and periodic financial disclosures for a large industrial market |
| South Korea | DART/OpenDART | Electronic corporate disclosures and financial reports |
| Australia | ASIC and ASX | Financial reports, company records, and market announcements |
| India | SEBI, NSE, BSE, and MCA | Financial results, corporate announcements, and company filings |
| Hong Kong | HKEXnews | Annual, interim, results, and other listed-company disclosures |
| Mainland China | CSRC, Shanghai/Shenzhen exchanges, and CNINFO | Strategic expansion market with additional language, access, and normalization complexity |

Reference systems:

- [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)
- [SEC reporting issuer statistics](https://www.sec.gov/data-research/statistics-data-visualizations/reporting-issuers)
- [SEDAR+ public information](https://www.sedarplus.ca/)
- [FCA National Storage Mechanism](https://www.fca.org.uk/markets/primary-markets/regulatory-disclosures/national-storage-mechanism)
- [Companies House public register](https://www.gov.uk/guidance/searching-the-companies-house-register)
- [ESMA electronic reporting and ESEF](https://www.esma.europa.eu/issuer-disclosure/electronic-reporting)
- [Japan EDINET](https://www.fsa.go.jp/search/index.html)
- [Korea DART](https://englishdart.fss.or.kr/about/engAbout1.do)
- [ASX market statistics and announcements](https://www.asx.com.au/about/market-statistics)
- [SEBI corporate filings](https://www.sebi.gov.in/curation/corporate_filings.html)
- [HKEX listed-company disclosures](https://www.hkexnews.hk/)

## Analytical Dimensions

### AI Usage Signal

This measures adoption by people or working-age populations. It provides context about usage intensity, but it is not proof that public companies are deploying AI operationally.

Candidate measures:

- working-age population AI usage;
- usage growth over time;
- usage by country or region;
- consumer versus workplace usage where available.

### Enterprise Adoption Signal

This measures whether firms report using AI technologies in their operations.

Candidate measures:

- percentage of firms using AI;
- adoption by sector;
- adoption by company size;
- adoption by use case;
- year-over-year adoption change;
- share of sectors with meaningful adoption.

Enterprise survey data should be sourced from official statistical agencies or carefully documented research datasets. Country comparisons must preserve the original population, company-size, sector, and survey-year definitions.

### Financial Investment Signal

This measures whether companies are allocating financial resources toward investment and strategic expansion.

Core measures:

```text
R&D intensity = R&D expense / Revenue
Capex intensity = Capital expenditures / Revenue
Free cash flow = Cash from operations - Capital expenditures
Acquisition intensity = Cash paid for acquisitions / Revenue
Operating margin = Operating income / Revenue
```

Additional measures include R&D growth, capex growth, acquisition growth, cash deployment mix, debt funding, buybacks, dividends, and changes in operating margin.

### Public-Company Disclosure Quality

This measures whether a market’s data is sufficiently structured and complete for comparison.

Candidate measures:

- percentage of eligible issuers with structured financial facts;
- filing availability and access reliability;
- filing frequency;
- proportion of metrics with valid inputs;
- missingness by metric and sector;
- standard-taxonomy versus custom-taxonomy usage;
- amendment and restatement visibility;
- filing-to-normalization latency.

Disclosure quality is a confidence dimension, not an economic performance score.

### Market Scale

This measures the economic and public-market size of the observation universe.

Candidate measures:

- number of eligible issuers;
- aggregate revenue;
- aggregate market capitalization where available;
- sector coverage;
- number of qualifying filings;
- revenue-weighted coverage of the market.

Headline listed-company counts are not directly comparable because markets count different instruments, funds, trusts, and reporting entities. The product should publish its own eligibility definition.

### Adoption Momentum

This measures change rather than level.

Candidate measures:

```text
adoption change
R&D-intensity change
capex-intensity change
AI-mention breadth change
acquisition-activity change
sector-breadth change
```

Momentum should be reported separately from the level of adoption. A smaller market can have faster growth while still having lower absolute adoption.

## Questions the System Must Address

### Are companies increasing R&D intensity?

```text
R&D intensity = R&D expense / Revenue
R&D intensity change = R&D intensity_t - R&D intensity_t-1
R&D growth = R&D_t / R&D_t-1 - 1
```

Show both absolute R&D growth and R&D as a percentage of revenue. Increasing R&D spend does not necessarily mean increasing strategic intensity if revenue grows faster.

### Is capex accelerating?

```text
Capex intensity = Capital expenditures / Revenue
Capex growth = Capex_t / Capex_t-1 - 1
Capex acceleration = Capex growth_t - Capex growth_t-1
```

When filings provide detail, separate ordinary capital expenditure from data-center, infrastructure, technology, or capacity-expansion spending.

### Are acquisitions becoming more AI-related?

This requires two evidence streams:

```text
acquisition cash spending
+
AI-related acquisition language in filings
```

Classify each acquisition as:

- explicitly AI-related;
- technology-related with possible AI relevance;
- not AI-related based on available evidence;
- insufficiently disclosed.

The financial amount should come from structured facts where available. The AI classification must retain the supporting filing passage.

### Are operating margins changing as investment increases?

```text
Operating margin = Operating income / Revenue
Margin change = Operating margin_t - Operating margin_t-1
```

Compare margin change with R&D-intensity and capex-intensity change. The product may identify association, but it must not claim causality without supporting disclosure.

### Are more firms mentioning AI in filings?

```text
AI mention rate = normalized AI-related mentions / total filing words
```

Track:

- first meaningful AI disclosure;
- repeated mentions over time;
- AI mentions in strategy, risk, capital-allocation, and operations sections;
- boilerplate versus substantive disclosure;
- share of firms mentioning AI by country and sector.

### Is adoption broadening beyond technology companies?

```text
sector adoption breadth = sectors with meaningful AI adoption / sectors covered
```

Compare technology with financial services, manufacturing, healthcare, energy, retail, logistics, professional services, telecommunications, and media.

### Is adoption fastest among large, mid-market, or smaller firms?

Create country-normalized size cohorts using revenue first:

```text
small
mid-market
large
```

Market capitalization can be a secondary classification. Compare AI adoption, R&D intensity, capex intensity, AI mention rate, and acquisition activity by size cohort.

## Architecture and Ownership

The financial layer extends the existing Windmill → Convex → Mastra architecture.

```text
Market registry
    ↓
Market-specific collectors
    ↓
Filing metadata and raw facts
    ↓
Canonical financial normalization
    ↓
Deterministic calculations
    ↓
Country / sector / size aggregation
    ↓
Mastra interpretation
    ↓
Analyst-facing intelligence views
```

### Windmill owns

- schedules;
- retries;
- rate limiting;
- external HTTP access;
- market-specific parsing;
- incremental collection;
- collector health and run status.

### Convex owns

- issuer records;
- filing records;
- raw facts;
- filing excerpts;
- normalized periods;
- derived metrics;
- financial signals;
- provenance and audit history.

### Deterministic calculation code owns

- ratio formulas;
- period comparisons;
- trend calculations;
- cash-allocation calculations;
- cohort aggregation;
- coverage and confidence calculations.

### Mastra owns

- AI-related filing classification;
- substantive-versus-boilerplate disclosure interpretation;
- acquisition relevance classification;
- narrative explanations;
- hypothesis generation with citations.

Mastra must not be the source of truth for financial values.

## Proposed Financial Data Model

The first implementation should add financial-specific tables rather than overload the existing `sourceHits` table.

### `secEntities`

Stores market-aware entity identity:

- market;
- legal name;
- ticker;
- issuer domicile;
- listing venue;
- operating geographies;
- market-specific identifiers;
- accounting standard;
- reporting currency;
- sector classification;
- created and updated timestamps.

### `secFilings`

Stores filing-level provenance:

- entity ID;
- filing ID and accession number;
- form or filing type;
- filed date;
- period of report;
- filing URL;
- primary document;
- reporting currency;
- accounting standard;
- raw document hash;
- amendment/restatement status;
- collection run ID.

### `xbrlFacts`

Stores immutable raw and parsed facts:

- filing ID;
- taxonomy;
- tag;
- unit;
- value;
- start date;
- end date or instant date;
- fiscal year and period;
- dimensions;
- source location;
- parser version.

### `financialPeriods`

Stores normalized reporting periods and canonical values:

- entity ID;
- period type;
- period start and end;
- fiscal year and quarter;
- normalized fact references;
- restatement status;
- normalization version.

### `derivedMetrics`

Stores calculated metrics:

- entity ID;
- period;
- metric name;
- value;
- formula version;
- input fact IDs;
- missing inputs;
- confidence;
- calculation timestamp.

### `financialSignals`

Stores interpretation-ready signals:

- country or cohort;
- sector and size bucket;
- period;
- signal type;
- raw value;
- trend value;
- coverage rate;
- confidence;
- supporting metric IDs;
- supporting filing IDs;
- interpretation status.

## Data-Quality Rules

Every metric must expose:

```text
coverageRate
missingInputs
sourceCount
latestFilingDate
accountingStandard
currency
restatementStatus
confidenceLevel
```

Normalization must handle:

- US GAAP versus IFRS;
- different fiscal year-ends;
- annual, quarterly, and year-to-date facts;
- local reporting currencies;
- amended and restated filings;
- custom XBRL extensions;
- different R&D and capex definitions;
- acquisitions disclosed only in narrative text;
- partial segment reporting.

The system should return `null` plus a reason when required inputs are unavailable. It must not silently substitute zero.

## Interpretation Rules

Outputs must distinguish:

```text
observed fact
derived metric
correlation
hypothesis
analyst conclusion
```

For example:

```text
Observed: R&D expense increased 28%.
Derived: R&D intensity increased from 9.4% to 11.1%.
Observed: Operating margin declined by 140 basis points.
Hypothesis: Margin pressure may coincide with increased investment.
```

The system must not state that increased investment caused the margin decline unless the evidence supports that conclusion.

## Rollout Order

1. Build a United States vertical slice with one company, one annual filing, and core facts.
2. Add annual and quarterly normalization, amendments, fiscal calendars, and missing-data handling.
3. Add cash allocation and acquisition metrics.
4. Add the remaining core market collectors.
5. Add country, sector, and company-size aggregation.
6. Add AI filing-mention and acquisition-relevance interpretation.
7. Add Singapore and UAE satellite signals.
8. Add India and China as separate expansion tracks after the normalization model is proven.

## Success Criteria

An analyst must be able to ask:

> Which markets are showing increasing AI-related investment, and is that investment broadening beyond technology companies?

The system must return:

1. comparable country and sector metrics;
2. trends over time;
3. company-size breakdowns;
4. adoption and financial-investment evidence;
5. filing citations;
6. confidence and coverage warnings;
7. explanations that distinguish facts from hypotheses.

## Change Points

Future changes should normally be isolated to one of these areas:

- add a market: new collector and identifier adapter;
- add a financial concept: taxonomy mapping and normalization tests;
- change a formula: new formula version and recalculation migration;
- change an adoption definition: new source adapter and metric version;
- change a cohort definition: aggregation configuration and historical rebuild;
- change an interpretation rule: Mastra prompt/classifier version with evaluation cases.

This separation is intentional. It allows the thesis to evolve without rewriting raw provenance or confusing observed facts with derived conclusions.

