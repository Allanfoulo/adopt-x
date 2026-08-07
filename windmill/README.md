# Adopt X Windmill Pipeline

Windmill owns source collection, scheduling, retries, and external connector credentials. Convex remains the system of record and Mastra remains the interpretation layer.

This folder includes a `wmill.yaml` sync configuration. From a machine with the Windmill CLI installed, run `wmill workspace add`, bind the target workspace, and then use `wmill sync push` from this directory. The sync intentionally skips secrets; configure provider credentials and `CONVEX_URL` as Windmill resources/secrets in the workspace.

## Initial flow

1. Schedule `f/flows/run_scheduled_scan.ts` every 1-2 hours for configured feeds.
2. Pass the returned items to `f/flows/scan_adoption_deals.ts`.
3. The flow calls `ingest:ingestSourceBatch`, which is idempotent by external id and content hash.
4. A downstream Mastra run normalizes candidates and scores AI-adoption relevance.
5. Call `f/flows/research_candidate.ts` only for new, ambiguous, high-confidence, or approved candidates. Configure it to call `f/flows/last30days_runner.ts`.

## Environment

- `CONVEX_URL`: Adopt X Convex deployment URL.
- `LAST30DAYS_RUNNER_URL`: authenticated Windmill or Mastra endpoint that wraps the last30days engine.
- `LAST30DAYS_SKILL_DIR`: Windmill worker path containing `scripts/last30days.py`.
- `LAST30DAYS_PYTHON`: optional Python executable path; defaults to `python3`.
- Provider keys belong in Windmill resources/secrets, not in source files.

`ADOPTX_FEEDS_JSON` supports the existing feed array format and a registry format:

```json
{
  "sourceKeys": [
    "sec_press_releases",
    "google_news_ai_adoption",
    "google_news_ai_acquisitions",
    "google_news_ai_partnerships",
    "google_news_ai_investments"
  ]
}
```

The registry currently includes SEC press releases and separate Google News discovery feeds for adoption, acquisitions, partnerships, and investments. Unknown or planned source keys are reported as unconfigured instead of being silently enabled. Existing arrays of explicit `{ sourceType, publisher, url, sourceClass }` feed objects remain supported.

Feed failures are returned per publisher. The scan continues when at least one configured source succeeds and fails only when every configured source is unavailable.

## Source rollout

Start with first-party RSS/Atom or stable public feeds. Add SEC/EDGAR, ASX, company IR pages, press-release wires, sector sources, and community sources as separate collectors. Keep community results marked as enrichment evidence; they do not establish that a deal occurred.
