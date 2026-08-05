import { action } from "./_generated/server";

const defaultWorkspace = "adoptx";
const defaultPath = "p/f/flows/run_scheduled_scan";

/** Starts the Windmill collector without exposing its scoped token to the browser. */
export const start = action({
  args: {},
  handler: async () => {
    const baseUrl = process.env.WINDMILL_BASE_URL?.replace(/\/$/, "");
    const workspace = process.env.WINDMILL_WORKSPACE ?? defaultWorkspace;
    const scanPath = process.env.WINDMILL_SCAN_PATH ?? defaultPath;
    const token = process.env.WINDMILL_SCAN_TOKEN;

    if (!baseUrl || !token) {
      throw new Error(
        "Live scanning is not configured. Set WINDMILL_BASE_URL and WINDMILL_SCAN_TOKEN in Convex.",
      );
    }

    const response = await fetch(
      `${baseUrl}/api/w/${encodeURIComponent(workspace)}/jobs/run/${scanPath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      },
    );

    const responseText = await response.text();
    let responseBody: unknown = responseText;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      // Keep the text response for a useful error message below.
    }

    if (!response.ok) {
      const detail =
        typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody);
      throw new Error(`Windmill rejected the scan request (${response.status}): ${detail}`);
    }

    const jobId =
      typeof responseBody === "string"
        ? responseBody
        : responseBody && typeof responseBody === "object" && "uuid" in responseBody
          ? String(responseBody.uuid)
          : null;

    return { jobId };
  },
});
