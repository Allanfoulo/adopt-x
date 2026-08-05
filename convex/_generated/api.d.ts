/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as candidate from "../candidate.js";
import type * as dashboard from "../dashboard.js";
import type * as datasets from "../datasets.js";
import type * as ingest from "../ingest.js";
import type * as model from "../model.js";
import type * as overview from "../overview.js";
import type * as research from "../research.js";
import type * as scans from "../scans.js";
import type * as triage from "../triage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  candidate: typeof candidate;
  dashboard: typeof dashboard;
  datasets: typeof datasets;
  ingest: typeof ingest;
  model: typeof model;
  overview: typeof overview;
  research: typeof research;
  scans: typeof scans;
  triage: typeof triage;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
