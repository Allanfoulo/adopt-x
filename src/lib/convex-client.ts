import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL is required to run Adopt X with Convex data.");
}

export const convexClient = new ConvexReactClient(convexUrl);
