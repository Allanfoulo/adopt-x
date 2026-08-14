# Adopt X Windmill Pipeline

Windmill owns source collection, scheduling, retries, and external connector credentials. Convex remains the system of record and Mastra remains the interpretation layer.

This folder includes a `wmill.yaml` sync configuration. From a machine with the Windmill CLI installed, run `wmill workspace add`, bind the target workspace, and then use `wmill sync push` from this directory. The sync intentionally skips secrets; configure provider credentials and `CONVEX_URL` as Windmill resources/secrets in the workspace.

## Initial flow

1. Schedule `f/flows/run_scheduled_scan.ts` every 1-2 hours for configured feeds.
2. Pass the returned items to `f/flows/scan_adoption_deals.ts`.
3. The flow sends candidate-worthy items to the registered `adopt-x-adoption-agent` in Mastra.
4. The Adoption Agent must complete Firecrawl corroboration before the source is materialized with a score.
5. The flow calls `ingest:ingestSourceBatch`, which is idempotent by external id and content hash; failed agent items remain quarantined as source hits.
6. Call `f/flows/research_candidate.ts` only for new, ambiguous, high-confidence, or approved candidates. Configure it to call `f/flows/last30days_runner.ts`.

## Deterministic scoring

The adoption agent does not generate `confidenceScore`, `thesisFitScore`, or `sourceConfidence`. Convex calculates them with `rubric-v1` after ingestion. The rubric records point components for source quality, thesis fit, and factual confidence. Older fixture candidates may not have a stored breakdown and are treated as historical data. Newly materialized candidates always store the rubric breakdown for review and audit.

After deploying the Convex functions, legacy candidates with linked source
evidence can be recalculated with the `ingest:recalculateCandidateScores`
mutation. The mutation skips candidates with explicit human score edits and
does not fabricate scores for candidates without source evidence. Run it in
batches from the project root, for example:

```powershell
npx convex run ingest:recalculateCandidateScores '{"limit":250}'
```

## Environment

- `CONVEX_URL`: Adopt X Convex deployment URL.
- `MASTRA_SERVER_URL`: Mastra HTTP base URL reachable by the Windmill worker.
- `MASTRA_API_TOKEN`: optional token for the Mastra HTTP endpoint.
- `MASTRA_ADOPTION_AGENT_ID`: optional agent id; defaults to `adopt-x-adoption-agent`.
- `LAST30DAYS_RUNNER_URL`: authenticated Windmill or Mastra endpoint that wraps the last30days engine.
- `LAST30DAYS_SKILL_DIR`: Windmill worker path containing `scripts/last30days.py`.
- `LAST30DAYS_PYTHON`: optional Python executable path; defaults to `python3`.
- `FIRECRAWL_API_KEY` belongs in the Mastra runtime secret environment, not in Windmill source files or the browser app environment. The Mastra project template is `adoptx-mastra/.env.example`; copy the key into the local `adoptx-mastra/.env` or the deployed Mastra secret store.

`ADOPTX_FEEDS_JSON` supports the existing feed array format and a registry format:

```json
{
  "sourceKeys": [
    "sec_press_releases",
    "exchange_announcements",
    "ir_pages",
    "pr_wires",
    "sector_press",
    "business_press",
    "google_news_ai_adoption",
    "google_news_ai_acquisitions",
    "google_news_ai_partnerships",
    "google_news_ai_investments"
  ]
}
```

The registry includes SEC press releases, Google News discovery feeds for adoption, acquisitions, partnerships, investments, exchange announcements, IR/newsroom mentions, and PR-wire mentions, plus direct TechCrunch AI and Dow Jones market RSS feeds. These expanded feeds are marked `secondary_signal`; they identify or corroborate candidates but do not independently establish that a deal occurred. ASX ComNews and company-specific IR feeds remain separate integrations because they require commercial access or a company watchlist. Unknown or planned source keys are reported as unconfigured instead of being silently enabled. Existing arrays of explicit `{ sourceType, publisher, url, sourceClass }` feed objects remain supported.

Feed failures are returned per publisher. The scan continues when at least one configured source succeeds and fails only when every configured source is unavailable.

## Source rollout

Start with first-party RSS/Atom or stable public feeds. Add SEC/EDGAR, ASX, company IR pages, press-release wires, sector sources, and community sources as separate collectors. Keep community results marked as enrichment evidence; they do not establish that a deal occurred.
