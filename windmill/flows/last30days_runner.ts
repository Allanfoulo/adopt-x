type QueryPlan = {
  subqueries: Array<{ search_query: string; sources: string[] }>;
  ranking_query: string;
};

/**
 * Windmill HTTP flow: wraps the installed last30days Python engine for the
 * Mastra tool. Keep this runner behind Windmill auth because it executes code
 * and may access configured research providers.
 */
export async function main(topic: string, plan: QueryPlan) {
  const skillDir = Deno.env.get("LAST30DAYS_SKILL_DIR");
  if (!skillDir) throw new Error("LAST30DAYS_SKILL_DIR is required");

  const python = Deno.env.get("LAST30DAYS_PYTHON") ?? "python3";
  const script = `${skillDir}/scripts/last30days.py`;
  const planFile = await Deno.makeTempFile({ suffix: ".json" });
  const saveDir = await Deno.makeTempDir({ prefix: "adoptx-last30days-" });
  await Deno.writeTextFile(planFile, JSON.stringify(plan));

  try {
    const command = new Deno.Command(python, {
      args: [
        script,
        topic,
        "--plan",
        planFile,
        "--emit=json",
        "--save-dir",
        saveDir,
        "--save-suffix=adoptx",
        "--no-browser-cookies",
      ],
      stdout: "piped",
      stderr: "piped",
    });
    const result = await command.output();
    const stdout = new TextDecoder().decode(result.stdout);
    const stderr = new TextDecoder().decode(result.stderr);
    if (!result.success) {
      throw new Error(stderr.slice(-4000) || `last30days exited with code ${result.code}`);
    }

    const report = JSON.parse(stdout) as { items_by_source?: Record<string, Array<Record<string, unknown>>> };
    const evidence = await normalizeEvidence(report.items_by_source ?? {});
    return { rawOutput: stdout, evidence };
  } finally {
    await Deno.remove(planFile).catch(() => undefined);
    await Deno.remove(saveDir, { recursive: true }).catch(() => undefined);
  }
}

async function normalizeEvidence(itemsBySource: Record<string, Array<Record<string, unknown>>>) {
  const evidence = [];
  for (const [source, items] of Object.entries(itemsBySource)) {
    for (const item of items.slice(0, 25)) {
      const url = typeof item.url === "string" ? item.url : "";
      const headline = typeof item.title === "string" ? item.title : "";
      if (!/^https?:\/\//i.test(url) || !headline) continue;
      const rawExcerpt = typeof item.snippet === "string"
        ? item.snippet
        : typeof item.body === "string"
          ? item.body
          : "";
      evidence.push({
        externalId: `last30days:${source}:${url}`,
        publisher: source,
        url,
        headline,
        publishedAt: Date.parse(typeof item.published_at === "string" ? item.published_at : "") || Date.now(),
        rawExcerpt: rawExcerpt.slice(0, 4000),
        hash: await sha256(`${source}|${url}|${headline}|${rawExcerpt}`),
      });
    }
  }
  return evidence;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
