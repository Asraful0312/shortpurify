/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aggregates from "../aggregates.js";
import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as authz from "../authz.js";
import type * as billing from "../billing.js";
import type * as blueskyActions from "../blueskyActions.js";
import type * as cloudinaryActions from "../cloudinaryActions.js";
import type * as emails from "../emails.js";
import type * as exportActions from "../exportActions.js";
import type * as facebookActions from "../facebookActions.js";
import type * as http from "../http.js";
import type * as outputs from "../outputs.js";
import type * as projects from "../projects.js";
import type * as publicClip from "../publicClip.js";
import type * as r2 from "../r2.js";
import type * as r2Actions from "../r2Actions.js";
import type * as r2storage from "../r2storage.js";
import type * as rateLimits from "../rateLimits.js";
import type * as scheduledPublish from "../scheduledPublish.js";
import type * as socialTokens from "../socialTokens.js";
import type * as tenants from "../tenants.js";
import type * as threadsActions from "../threadsActions.js";
import type * as tiktokActions from "../tiktokActions.js";
import type * as transcription from "../transcription.js";
import type * as usage from "../usage.js";
import type * as users from "../users.js";
import type * as videoProcessingActions from "../videoProcessingActions.js";
import type * as workflow from "../workflow.js";
import type * as workspaceMembers from "../workspaceMembers.js";
import type * as xActions from "../xActions.js";
import type * as youtubeActions from "../youtubeActions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aggregates: typeof aggregates;
  ai: typeof ai;
  analytics: typeof analytics;
  authz: typeof authz;
  billing: typeof billing;
  blueskyActions: typeof blueskyActions;
  cloudinaryActions: typeof cloudinaryActions;
  emails: typeof emails;
  exportActions: typeof exportActions;
  facebookActions: typeof facebookActions;
  http: typeof http;
  outputs: typeof outputs;
  projects: typeof projects;
  publicClip: typeof publicClip;
  r2: typeof r2;
  r2Actions: typeof r2Actions;
  r2storage: typeof r2storage;
  rateLimits: typeof rateLimits;
  scheduledPublish: typeof scheduledPublish;
  socialTokens: typeof socialTokens;
  tenants: typeof tenants;
  threadsActions: typeof threadsActions;
  tiktokActions: typeof tiktokActions;
  transcription: typeof transcription;
  usage: typeof usage;
  users: typeof users;
  videoProcessingActions: typeof videoProcessingActions;
  workflow: typeof workflow;
  workspaceMembers: typeof workspaceMembers;
  xActions: typeof xActions;
  youtubeActions: typeof youtubeActions;
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

export declare const components: {
  workflow: {
    event: {
      create: FunctionReference<
        "mutation",
        "internal",
        { name: string; workflowId: string },
        string
      >;
      send: FunctionReference<
        "mutation",
        "internal",
        {
          eventId?: string;
          name?: string;
          result:
            | { kind: "success"; returnValue: any }
            | { error: string; kind: "failed" }
            | { kind: "canceled" };
          workflowId?: string;
          workpoolOptions?: {
            defaultRetryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
            retryActionsByDefault?: boolean;
          };
        },
        string
      >;
    };
    journal: {
      load: FunctionReference<
        "query",
        "internal",
        { shortCircuit?: boolean; workflowId: string },
        {
          blocked?: boolean;
          journalEntries: Array<{
            _creationTime: number;
            _id: string;
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          ok: boolean;
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
      startSteps: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          steps: Array<{
            retry?:
              | boolean
              | { base: number; initialBackoffMs: number; maxAttempts: number };
            schedulerOptions?: { runAt?: number } | { runAfter?: number };
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
          }>;
          workflowId: string;
          workpoolOptions?: {
            defaultRetryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
            retryActionsByDefault?: boolean;
          };
        },
        Array<{
          _creationTime: number;
          _id: string;
          step:
            | {
                args: any;
                argsSize: number;
                completedAt?: number;
                functionType: "query" | "mutation" | "action";
                handle: string;
                inProgress: boolean;
                kind?: "function";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
                workId?: string;
              }
            | {
                args: any;
                argsSize: number;
                completedAt?: number;
                handle: string;
                inProgress: boolean;
                kind: "workflow";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
                workflowId?: string;
              }
            | {
                args: { eventId?: string };
                argsSize: number;
                completedAt?: number;
                eventId?: string;
                inProgress: boolean;
                kind: "event";
                name: string;
                runResult?:
                  | { kind: "success"; returnValue: any }
                  | { error: string; kind: "failed" }
                  | { kind: "canceled" };
                startedAt: number;
              };
          stepNumber: number;
          workflowId: string;
        }>
      >;
    };
    workflow: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { workflowId: string },
        null
      >;
      cleanup: FunctionReference<
        "mutation",
        "internal",
        { force?: boolean; workflowId: string },
        boolean
      >;
      complete: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          runResult:
            | { kind: "success"; returnValue: any }
            | { error: string; kind: "failed" }
            | { kind: "canceled" };
          workflowId: string;
        },
        null
      >;
      create: FunctionReference<
        "mutation",
        "internal",
        {
          maxParallelism?: number;
          onComplete?: { context?: any; fnHandle: string };
          startAsync?: boolean;
          workflowArgs: any;
          workflowHandle: string;
          workflowName: string;
        },
        string
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { workflowId: string },
        {
          inProgress: Array<{
            _creationTime: number;
            _id: string;
            step:
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  functionType: "query" | "mutation" | "action";
                  handle: string;
                  inProgress: boolean;
                  kind?: "function";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workId?: string;
                }
              | {
                  args: any;
                  argsSize: number;
                  completedAt?: number;
                  handle: string;
                  inProgress: boolean;
                  kind: "workflow";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                  workflowId?: string;
                }
              | {
                  args: { eventId?: string };
                  argsSize: number;
                  completedAt?: number;
                  eventId?: string;
                  inProgress: boolean;
                  kind: "event";
                  name: string;
                  runResult?:
                    | { kind: "success"; returnValue: any }
                    | { error: string; kind: "failed" }
                    | { kind: "canceled" };
                  startedAt: number;
                };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          order: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            args: any;
            context?: any;
            name?: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            workflowId: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      listByName: FunctionReference<
        "query",
        "internal",
        {
          name: string;
          order: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            args: any;
            context?: any;
            name?: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            workflowId: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      listSteps: FunctionReference<
        "query",
        "internal",
        {
          order: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          workflowId: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            args: any;
            completedAt?: number;
            eventId?: string;
            kind: "function" | "workflow" | "event";
            name: string;
            nestedWorkflowId?: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt: number;
            stepId: string;
            stepNumber: number;
            workId?: string;
            workflowId: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      restart: FunctionReference<
        "mutation",
        "internal",
        { from?: number | string; startAsync?: boolean; workflowId: string },
        null
      >;
    };
  };
  r2: {
    lib: {
      deleteMetadata: FunctionReference<
        "mutation",
        "internal",
        { bucket: string; key: string },
        null
      >;
      deleteObject: FunctionReference<
        "mutation",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      deleteR2Object: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      getMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        {
          bucket: string;
          bucketLink: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
          url: string;
        } | null
      >;
      listMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          cursor?: string;
          endpoint: string;
          limit?: number;
          secretAccessKey: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            bucket: string;
            bucketLink: string;
            contentType?: string;
            key: string;
            lastModified: string;
            link: string;
            sha256?: string;
            size?: number;
            url: string;
          }>;
          pageStatus?: null | "SplitRecommended" | "SplitRequired";
          splitCursor?: null | string;
        }
      >;
      store: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          secretAccessKey: string;
          url: string;
        },
        any
      >;
      syncMetadata: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          onComplete?: string;
          secretAccessKey: string;
        },
        null
      >;
      upsertMetadata: FunctionReference<
        "mutation",
        "internal",
        {
          bucket: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
        },
        { isNew: boolean }
      >;
    };
  };
  projectsAggregate: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any },
        { count: number; sum: number }
      >;
      aggregateBetweenBatch: FunctionReference<
        "query",
        "internal",
        { queries: Array<{ k1?: any; k2?: any; namespace?: any }> },
        Array<{ count: number; sum: number }>
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffsetBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{
            k1?: any;
            k2?: any;
            namespace?: any;
            offset: number;
          }>;
        },
        Array<{ k: any; s: number; v: any }>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { key: any; namespace?: any },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any; namespace?: any },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any; namespace?: any },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          namespace?: any;
          order: "asc" | "desc";
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      paginateNamespaces: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit: number },
        { cursor: string; isDone: boolean; page: Array<any> }
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { namespace?: any },
        any
      >;
    };
    inspect: {
      display: FunctionReference<"query", "internal", { namespace?: any }, any>;
      dump: FunctionReference<"query", "internal", { namespace?: any }, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { namespace?: any; node?: string },
        null
      >;
      listTreeNodes: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          aggregate?: { count: number; sum: number };
          items: Array<{ k: any; s: number; v: any }>;
          subtrees: Array<string>;
        }>
      >;
      listTrees: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          maxNodeSize: number;
          namespace?: any;
          root: string;
        }>
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      delete_: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        any
      >;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<
        "mutation",
        "internal",
        { namespace?: any },
        null
      >;
      replace: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        any
      >;
    };
  };
  scheduledAggregate: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any },
        { count: number; sum: number }
      >;
      aggregateBetweenBatch: FunctionReference<
        "query",
        "internal",
        { queries: Array<{ k1?: any; k2?: any; namespace?: any }> },
        Array<{ count: number; sum: number }>
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffsetBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{
            k1?: any;
            k2?: any;
            namespace?: any;
            offset: number;
          }>;
        },
        Array<{ k: any; s: number; v: any }>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { key: any; namespace?: any },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any; namespace?: any },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any; namespace?: any },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          namespace?: any;
          order: "asc" | "desc";
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      paginateNamespaces: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit: number },
        { cursor: string; isDone: boolean; page: Array<any> }
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { namespace?: any },
        any
      >;
    };
    inspect: {
      display: FunctionReference<"query", "internal", { namespace?: any }, any>;
      dump: FunctionReference<"query", "internal", { namespace?: any }, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { namespace?: any; node?: string },
        null
      >;
      listTreeNodes: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          aggregate?: { count: number; sum: number };
          items: Array<{ k: any; s: number; v: any }>;
          subtrees: Array<string>;
        }>
      >;
      listTrees: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          maxNodeSize: number;
          namespace?: any;
          root: string;
        }>
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      delete_: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        any
      >;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<
        "mutation",
        "internal",
        { namespace?: any },
        null
      >;
      replace: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        any
      >;
    };
  };
  tenants: {
    invitations: {
      acceptInvitation: FunctionReference<
        "mutation",
        "internal",
        {
          acceptingUserId: string;
          acceptingUserIdentifier?: string;
          invitationId: string;
        },
        null
      >;
      bulkInviteMembers: FunctionReference<
        "mutation",
        "internal",
        {
          expiresAt?: number;
          invitations: Array<{
            identifierType?: string;
            inviteeIdentifier: string;
            message?: string;
            role: string;
            teamId?: string;
          }>;
          inviterName?: string;
          organizationId: string;
          userId: string;
        },
        {
          errors: Array<{
            code: string;
            inviteeIdentifier: string;
            message: string;
          }>;
          success: Array<{
            expiresAt: number;
            invitationId: string;
            inviteeIdentifier: string;
          }>;
        }
      >;
      cancelInvitation: FunctionReference<
        "mutation",
        "internal",
        { invitationId: string; userId: string },
        null
      >;
      countInvitations: FunctionReference<
        "query",
        "internal",
        { organizationId: string },
        number
      >;
      getInvitation: FunctionReference<
        "query",
        "internal",
        { invitationId: string },
        null | {
          _creationTime: number;
          _id: string;
          expiresAt: number;
          identifierType?: string;
          inviteeIdentifier: string;
          inviterId: string;
          inviterName?: string;
          isExpired: boolean;
          message?: string;
          organizationId: string;
          organizationName: string;
          role: string;
          status: "pending" | "accepted" | "cancelled" | "expired";
          teamId: null | string;
        }
      >;
      getPendingInvitationsForIdentifier: FunctionReference<
        "query",
        "internal",
        { identifier: string },
        Array<{
          _creationTime: number;
          _id: string;
          expiresAt: number;
          identifierType?: string;
          inviteeIdentifier: string;
          inviterId: string;
          inviterName?: string;
          isExpired: boolean;
          organizationId: string;
          organizationName: string;
          role: string;
          teamId: null | string;
        }>
      >;
      inviteMember: FunctionReference<
        "mutation",
        "internal",
        {
          expiresAt?: number;
          identifierType?: string;
          inviteeIdentifier: string;
          inviterName?: string;
          message?: string;
          organizationId: string;
          role: string;
          teamId?: string;
          userId: string;
        },
        { expiresAt: number; invitationId: string; inviteeIdentifier: string }
      >;
      listInvitations: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          sortBy?: "inviteeIdentifier" | "expiresAt" | "createdAt";
          sortOrder?: "asc" | "desc";
        },
        Array<{
          _creationTime: number;
          _id: string;
          expiresAt: number;
          identifierType?: string;
          inviteeIdentifier: string;
          inviterId: string;
          inviterName?: string;
          isExpired: boolean;
          message?: string;
          organizationId: string;
          role: string;
          status: "pending" | "accepted" | "cancelled" | "expired";
          teamId: null | string;
        }>
      >;
      listInvitationsPaginated: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      resendInvitation: FunctionReference<
        "mutation",
        "internal",
        { invitationId: string; userId: string },
        { invitationId: string; inviteeIdentifier: string }
      >;
    };
    members: {
      addMember: FunctionReference<
        "mutation",
        "internal",
        {
          memberUserId: string;
          organizationId: string;
          role: string;
          userId: string;
        },
        null
      >;
      bulkAddMembers: FunctionReference<
        "mutation",
        "internal",
        {
          members: Array<{ memberUserId: string; role: string }>;
          organizationId: string;
          userId: string;
        },
        {
          errors: Array<{ code: string; message: string; userId: string }>;
          success: Array<string>;
        }
      >;
      bulkRemoveMembers: FunctionReference<
        "mutation",
        "internal",
        {
          memberUserIds: Array<string>;
          organizationId: string;
          userId: string;
        },
        {
          errors: Array<{ code: string; message: string; userId: string }>;
          success: Array<string>;
        }
      >;
      checkMemberPermission: FunctionReference<
        "query",
        "internal",
        {
          minRole: "member" | "admin" | "owner";
          organizationId: string;
          userId: string;
        },
        {
          currentRole: null | "owner" | "admin" | "member";
          hasPermission: boolean;
        }
      >;
      countOrganizationMembers: FunctionReference<
        "query",
        "internal",
        { organizationId: string; status?: "active" | "suspended" | "all" },
        number
      >;
      getMember: FunctionReference<
        "query",
        "internal",
        { organizationId: string; userId: string },
        null | {
          _creationTime: number;
          _id: string;
          joinedAt?: number;
          organizationId: string;
          role: string;
          status?: "active" | "suspended";
          suspendedAt?: number;
          userId: string;
        }
      >;
      leaveOrganization: FunctionReference<
        "mutation",
        "internal",
        { organizationId: string; userId: string },
        null
      >;
      listOrganizationMembers: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          sortBy?: "role" | "joinedAt" | "createdAt" | "userId";
          sortOrder?: "asc" | "desc";
          status?: "active" | "suspended" | "all";
        },
        Array<{
          _creationTime: number;
          _id: string;
          joinedAt?: number;
          organizationId: string;
          role: string;
          status?: "active" | "suspended";
          suspendedAt?: number;
          userId: string;
        }>
      >;
      listOrganizationMembersPaginated: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          status?: "active" | "suspended" | "all";
        },
        any
      >;
      removeMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; organizationId: string; userId: string },
        null
      >;
      suspendMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; organizationId: string; userId: string },
        null
      >;
      unsuspendMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; organizationId: string; userId: string },
        null
      >;
      updateMemberRole: FunctionReference<
        "mutation",
        "internal",
        {
          memberUserId: string;
          organizationId: string;
          role: string;
          userId: string;
        },
        null
      >;
    };
    organizations: {
      createOrganization: FunctionReference<
        "mutation",
        "internal",
        {
          creatorRole?: string;
          logo?: string;
          metadata?: any;
          name: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug: string;
          userId: string;
        },
        string
      >;
      deleteOrganization: FunctionReference<
        "mutation",
        "internal",
        { organizationId: string; userId: string },
        null
      >;
      getOrganization: FunctionReference<
        "query",
        "internal",
        { organizationId: string },
        null | {
          _creationTime: number;
          _id: string;
          logo: null | string;
          metadata?: any;
          name: string;
          ownerId: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug: string;
          status?: "active" | "suspended" | "archived";
        }
      >;
      getOrganizationBySlug: FunctionReference<
        "query",
        "internal",
        { slug: string },
        null | {
          _creationTime: number;
          _id: string;
          logo: null | string;
          metadata?: any;
          name: string;
          ownerId: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug: string;
          status?: "active" | "suspended" | "archived";
        }
      >;
      listUserOrganizations: FunctionReference<
        "query",
        "internal",
        {
          sortBy?: "name" | "createdAt" | "slug";
          sortOrder?: "asc" | "desc";
          userId: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          logo: null | string;
          metadata?: any;
          name: string;
          ownerId: string;
          role: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug: string;
          status?: "active" | "suspended" | "archived";
        }>
      >;
      transferOwnership: FunctionReference<
        "mutation",
        "internal",
        {
          newOwnerUserId: string;
          organizationId: string;
          previousOwnerRole?: string;
          userId: string;
        },
        null
      >;
      updateOrganization: FunctionReference<
        "mutation",
        "internal",
        {
          logo?: null | string;
          metadata?: any;
          name?: string;
          organizationId: string;
          settings?: {
            allowPublicSignup?: boolean;
            requireInvitationToJoin?: boolean;
          };
          slug?: string;
          status?: "active" | "suspended" | "archived";
          userId: string;
        },
        null
      >;
    };
    teams: {
      addTeamMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; role?: string; teamId: string; userId: string },
        null
      >;
      countTeams: FunctionReference<
        "query",
        "internal",
        { organizationId: string },
        number
      >;
      createTeam: FunctionReference<
        "mutation",
        "internal",
        {
          description?: string;
          metadata?: any;
          name: string;
          organizationId: string;
          parentTeamId?: string;
          slug?: string;
          userId: string;
        },
        string
      >;
      deleteTeam: FunctionReference<
        "mutation",
        "internal",
        { teamId: string; userId: string },
        null
      >;
      getTeam: FunctionReference<
        "query",
        "internal",
        { teamId: string },
        null | {
          _creationTime: number;
          _id: string;
          description: null | string;
          metadata?: any;
          name: string;
          organizationId: string;
          parentTeamId?: string;
          slug?: string;
        }
      >;
      isTeamMember: FunctionReference<
        "query",
        "internal",
        { teamId: string; userId: string },
        boolean
      >;
      listTeamMembers: FunctionReference<
        "query",
        "internal",
        {
          sortBy?: "userId" | "role" | "createdAt";
          sortOrder?: "asc" | "desc";
          teamId: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          role?: string;
          teamId: string;
          userId: string;
        }>
      >;
      listTeamMembersPaginated: FunctionReference<
        "query",
        "internal",
        {
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          teamId: string;
        },
        any
      >;
      listTeams: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          parentTeamId?: null | string;
          sortBy?: "name" | "createdAt" | "slug";
          sortOrder?: "asc" | "desc";
        },
        Array<{
          _creationTime: number;
          _id: string;
          description: null | string;
          metadata?: any;
          name: string;
          organizationId: string;
          parentTeamId?: string;
          slug?: string;
        }>
      >;
      listTeamsAsTree: FunctionReference<
        "query",
        "internal",
        { organizationId: string },
        Array<{
          children: any;
          team: {
            _creationTime: number;
            _id: string;
            description: null | string;
            metadata?: any;
            name: string;
            organizationId: string;
            parentTeamId?: string;
            slug?: string;
          };
        }>
      >;
      listTeamsPaginated: FunctionReference<
        "query",
        "internal",
        {
          organizationId: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      removeTeamMember: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; teamId: string; userId: string },
        null
      >;
      updateTeam: FunctionReference<
        "mutation",
        "internal",
        {
          description?: null | string;
          metadata?: any;
          name?: string;
          parentTeamId?: null | string;
          slug?: string;
          teamId: string;
          userId: string;
        },
        null
      >;
      updateTeamMemberRole: FunctionReference<
        "mutation",
        "internal",
        { memberUserId: string; role: string; teamId: string; userId: string },
        null
      >;
    };
  };
  creem: {
    lib: {
      createOrder: FunctionReference<
        "mutation",
        "internal",
        {
          order: {
            affiliate?: string | null;
            amount: number;
            amountDue?: number;
            amountPaid?: number;
            checkoutId?: string | null;
            createdAt: string;
            currency: string;
            customerId: string;
            discountAmount?: number;
            discountId?: string | null;
            id: string;
            metadata?: Record<string, any>;
            mode?: string;
            productId: string;
            status: string;
            subTotal?: number;
            taxAmount?: number;
            transactionId?: string | null;
            type: string;
            updatedAt: string;
          };
        },
        any
      >;
      createProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            billingPeriod?: string;
            billingType: string;
            createdAt: string;
            currency: string;
            defaultSuccessUrl?: string | null;
            description: string | null;
            features?: Array<{ description: string; id: string }>;
            id: string;
            imageUrl?: string;
            metadata?: Record<string, any>;
            mode?: string;
            modifiedAt: string | null;
            name: string;
            price: number;
            productUrl?: string;
            status: string;
            taxCategory?: string;
            taxMode?: string;
          };
        },
        any
      >;
      createSubscription: FunctionReference<
        "mutation",
        "internal",
        {
          subscription: {
            amount: number | null;
            cancelAtPeriodEnd: boolean;
            canceledAt?: string | null;
            checkoutId: string | null;
            collectionMethod?: string;
            createdAt: string;
            currency: string | null;
            currentPeriodEnd: string | null;
            currentPeriodStart: string;
            customerId: string;
            discountId?: string | null;
            endedAt: string | null;
            endsAt?: string | null;
            id: string;
            lastTransactionId?: string | null;
            metadata: Record<string, any>;
            mode?: string;
            modifiedAt: string | null;
            nextTransactionDate?: string | null;
            priceId?: string;
            productId: string;
            recurringInterval: string | null;
            seats?: number | null;
            startedAt: string | null;
            status: string;
            trialEnd?: string | null;
            trialStart?: string | null;
          };
        },
        any
      >;
      executeSubscriptionLifecycle: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          cancelMode?: string;
          operation: "cancel" | "resume" | "pause";
          previousCancelAtPeriodEnd?: boolean;
          previousStatus?: string;
          serverIdx?: number;
          serverURL?: string;
          subscriptionId: string;
        },
        any
      >;
      executeSubscriptionUpdate: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          previousProductId?: string;
          previousSeats?: number | null;
          productId?: string;
          serverIdx?: number;
          serverURL?: string;
          subscriptionId: string;
          units?: number;
          updateBehavior?: string;
        },
        any
      >;
      getCurrentSubscription: FunctionReference<
        "query",
        "internal",
        { entityId: string },
        {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          canceledAt?: string | null;
          checkoutId: string | null;
          collectionMethod?: string;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          lastTransactionId?: string | null;
          metadata: Record<string, any>;
          mode?: string;
          modifiedAt: string | null;
          nextTransactionDate?: string | null;
          priceId?: string;
          product: {
            billingPeriod?: string;
            billingType: string;
            createdAt: string;
            currency: string;
            defaultSuccessUrl?: string | null;
            description: string | null;
            features?: Array<{ description: string; id: string }>;
            id: string;
            imageUrl?: string;
            metadata?: Record<string, any>;
            mode?: string;
            modifiedAt: string | null;
            name: string;
            price: number;
            productUrl?: string;
            status: string;
            taxCategory?: string;
            taxMode?: string;
          };
          productId: string;
          recurringInterval: string | null;
          seats?: number | null;
          startedAt: string | null;
          status: string;
          trialEnd?: string | null;
          trialStart?: string | null;
        } | null
      >;
      getCustomerByEntityId: FunctionReference<
        "query",
        "internal",
        { entityId: string },
        {
          country?: string;
          createdAt?: string;
          email?: string;
          entityId: string;
          id: string;
          metadata?: Record<string, any>;
          mode?: string;
          name?: string | null;
          updatedAt?: string;
        } | null
      >;
      getProduct: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          billingPeriod?: string;
          billingType: string;
          createdAt: string;
          currency: string;
          defaultSuccessUrl?: string | null;
          description: string | null;
          features?: Array<{ description: string; id: string }>;
          id: string;
          imageUrl?: string;
          metadata?: Record<string, any>;
          mode?: string;
          modifiedAt: string | null;
          name: string;
          price: number;
          productUrl?: string;
          status: string;
          taxCategory?: string;
          taxMode?: string;
        } | null
      >;
      getSubscription: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          canceledAt?: string | null;
          checkoutId: string | null;
          collectionMethod?: string;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          lastTransactionId?: string | null;
          metadata: Record<string, any>;
          mode?: string;
          modifiedAt: string | null;
          nextTransactionDate?: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: string | null;
          seats?: number | null;
          startedAt: string | null;
          status: string;
          trialEnd?: string | null;
          trialStart?: string | null;
        } | null
      >;
      insertCustomer: FunctionReference<
        "mutation",
        "internal",
        {
          country?: string;
          createdAt?: string;
          email?: string;
          entityId: string;
          id: string;
          metadata?: Record<string, any>;
          mode?: string;
          name?: string | null;
          updatedAt?: string;
        },
        string
      >;
      listAllUserSubscriptions: FunctionReference<
        "query",
        "internal",
        { entityId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          canceledAt?: string | null;
          checkoutId: string | null;
          collectionMethod?: string;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          lastTransactionId?: string | null;
          metadata: Record<string, any>;
          mode?: string;
          modifiedAt: string | null;
          nextTransactionDate?: string | null;
          priceId?: string;
          product: {
            billingPeriod?: string;
            billingType: string;
            createdAt: string;
            currency: string;
            defaultSuccessUrl?: string | null;
            description: string | null;
            features?: Array<{ description: string; id: string }>;
            id: string;
            imageUrl?: string;
            metadata?: Record<string, any>;
            mode?: string;
            modifiedAt: string | null;
            name: string;
            price: number;
            productUrl?: string;
            status: string;
            taxCategory?: string;
            taxMode?: string;
          } | null;
          productId: string;
          recurringInterval: string | null;
          seats?: number | null;
          startedAt: string | null;
          status: string;
          trialEnd?: string | null;
          trialStart?: string | null;
        }>
      >;
      listCustomerSubscriptions: FunctionReference<
        "query",
        "internal",
        { customerId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          canceledAt?: string | null;
          checkoutId: string | null;
          collectionMethod?: string;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          lastTransactionId?: string | null;
          metadata: Record<string, any>;
          mode?: string;
          modifiedAt: string | null;
          nextTransactionDate?: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: string | null;
          seats?: number | null;
          startedAt: string | null;
          status: string;
          trialEnd?: string | null;
          trialStart?: string | null;
        }>
      >;
      listProducts: FunctionReference<
        "query",
        "internal",
        { includeArchived?: boolean },
        Array<{
          billingPeriod?: string;
          billingType: string;
          createdAt: string;
          currency: string;
          defaultSuccessUrl?: string | null;
          description: string | null;
          features?: Array<{ description: string; id: string }>;
          id: string;
          imageUrl?: string;
          metadata?: Record<string, any>;
          mode?: string;
          modifiedAt: string | null;
          name: string;
          price: number;
          productUrl?: string;
          status: string;
          taxCategory?: string;
          taxMode?: string;
        }>
      >;
      listUserOrders: FunctionReference<
        "query",
        "internal",
        { entityId: string },
        Array<{
          affiliate?: string | null;
          amount: number;
          amountDue?: number;
          amountPaid?: number;
          checkoutId?: string | null;
          createdAt: string;
          currency: string;
          customerId: string;
          discountAmount?: number;
          discountId?: string | null;
          id: string;
          metadata?: Record<string, any>;
          mode?: string;
          productId: string;
          status: string;
          subTotal?: number;
          taxAmount?: number;
          transactionId?: string | null;
          type: string;
          updatedAt: string;
        }>
      >;
      listUserSubscriptions: FunctionReference<
        "query",
        "internal",
        { entityId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          canceledAt?: string | null;
          checkoutId: string | null;
          collectionMethod?: string;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          lastTransactionId?: string | null;
          metadata: Record<string, any>;
          mode?: string;
          modifiedAt: string | null;
          nextTransactionDate?: string | null;
          priceId?: string;
          product: {
            billingPeriod?: string;
            billingType: string;
            createdAt: string;
            currency: string;
            defaultSuccessUrl?: string | null;
            description: string | null;
            features?: Array<{ description: string; id: string }>;
            id: string;
            imageUrl?: string;
            metadata?: Record<string, any>;
            mode?: string;
            modifiedAt: string | null;
            name: string;
            price: number;
            productUrl?: string;
            status: string;
            taxCategory?: string;
            taxMode?: string;
          } | null;
          productId: string;
          recurringInterval: string | null;
          seats?: number | null;
          startedAt: string | null;
          status: string;
          trialEnd?: string | null;
          trialStart?: string | null;
        }>
      >;
      patchSubscription: FunctionReference<
        "mutation",
        "internal",
        {
          cancelAtPeriodEnd?: boolean;
          clearOptimistic?: boolean;
          productId?: string;
          seats?: number | null;
          status?: string;
          subscriptionId: string;
        },
        any
      >;
      syncProducts: FunctionReference<
        "action",
        "internal",
        { apiKey: string; serverIdx?: number; serverURL?: string },
        any
      >;
      updateProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            billingPeriod?: string;
            billingType: string;
            createdAt: string;
            currency: string;
            defaultSuccessUrl?: string | null;
            description: string | null;
            features?: Array<{ description: string; id: string }>;
            id: string;
            imageUrl?: string;
            metadata?: Record<string, any>;
            mode?: string;
            modifiedAt: string | null;
            name: string;
            price: number;
            productUrl?: string;
            status: string;
            taxCategory?: string;
            taxMode?: string;
          };
        },
        any
      >;
      updateProducts: FunctionReference<
        "mutation",
        "internal",
        {
          products: Array<{
            billingPeriod?: string;
            billingType: string;
            createdAt: string;
            currency: string;
            defaultSuccessUrl?: string | null;
            description: string | null;
            features?: Array<{ description: string; id: string }>;
            id: string;
            imageUrl?: string;
            metadata?: Record<string, any>;
            mode?: string;
            modifiedAt: string | null;
            name: string;
            price: number;
            productUrl?: string;
            status: string;
            taxCategory?: string;
            taxMode?: string;
          }>;
        },
        any
      >;
      updateSubscription: FunctionReference<
        "mutation",
        "internal",
        {
          subscription: {
            amount: number | null;
            cancelAtPeriodEnd: boolean;
            canceledAt?: string | null;
            checkoutId: string | null;
            collectionMethod?: string;
            createdAt: string;
            currency: string | null;
            currentPeriodEnd: string | null;
            currentPeriodStart: string;
            customerId: string;
            discountId?: string | null;
            endedAt: string | null;
            endsAt?: string | null;
            id: string;
            lastTransactionId?: string | null;
            metadata: Record<string, any>;
            mode?: string;
            modifiedAt: string | null;
            nextTransactionDate?: string | null;
            priceId?: string;
            productId: string;
            recurringInterval: string | null;
            seats?: number | null;
            startedAt: string | null;
            status: string;
            trialEnd?: string | null;
            trialStart?: string | null;
          };
        },
        any
      >;
    };
  };
  authz: {
    indexed: {
      addRelationWithCompute: FunctionReference<
        "mutation",
        "internal",
        {
          createdBy?: string;
          inheritedRelations?: Array<{
            fromObjectType: string;
            fromRelation: string;
            relation: string;
          }>;
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        string
      >;
      assignRoleWithCompute: FunctionReference<
        "mutation",
        "internal",
        {
          assignedBy?: string;
          expiresAt?: number;
          role: string;
          rolePermissions: Array<string>;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      checkPermissionFast: FunctionReference<
        "query",
        "internal",
        {
          objectId?: string;
          objectType?: string;
          permission: string;
          userId: string;
        },
        boolean
      >;
      cleanupExpired: FunctionReference<
        "mutation",
        "internal",
        {},
        { expiredPermissions: number; expiredRoles: number }
      >;
      denyPermissionDirect: FunctionReference<
        "mutation",
        "internal",
        {
          deniedBy?: string;
          expiresAt?: number;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      getUserPermissionsFast: FunctionReference<
        "query",
        "internal",
        { scopeKey?: string; userId: string },
        Array<{
          effect: string;
          permission: string;
          scopeKey: string;
          sources: Array<string>;
        }>
      >;
      getUserRolesFast: FunctionReference<
        "query",
        "internal",
        { scopeKey?: string; userId: string },
        Array<{
          role: string;
          scope?: { id: string; type: string };
          scopeKey: string;
        }>
      >;
      grantPermissionDirect: FunctionReference<
        "mutation",
        "internal",
        {
          expiresAt?: number;
          grantedBy?: string;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      hasRelationFast: FunctionReference<
        "query",
        "internal",
        {
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        boolean
      >;
      hasRoleFast: FunctionReference<
        "query",
        "internal",
        {
          objectId?: string;
          objectType?: string;
          role: string;
          userId: string;
        },
        boolean
      >;
      removeRelationWithCompute: FunctionReference<
        "mutation",
        "internal",
        {
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        boolean
      >;
      revokeRoleWithCompute: FunctionReference<
        "mutation",
        "internal",
        {
          role: string;
          rolePermissions: Array<string>;
          scope?: { id: string; type: string };
          userId: string;
        },
        boolean
      >;
    };
    mutations: {
      assignRole: FunctionReference<
        "mutation",
        "internal",
        {
          assignedBy?: string;
          enableAudit?: boolean;
          expiresAt?: number;
          metadata?: any;
          role: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      cleanupExpired: FunctionReference<
        "mutation",
        "internal",
        {},
        { expiredOverrides: number; expiredRoles: number }
      >;
      denyPermission: FunctionReference<
        "mutation",
        "internal",
        {
          createdBy?: string;
          enableAudit?: boolean;
          expiresAt?: number;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      grantPermission: FunctionReference<
        "mutation",
        "internal",
        {
          createdBy?: string;
          enableAudit?: boolean;
          expiresAt?: number;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        string
      >;
      logPermissionCheck: FunctionReference<
        "mutation",
        "internal",
        {
          permission: string;
          reason?: string;
          result: boolean;
          scope?: { id: string; type: string };
          userId: string;
        },
        null
      >;
      removeAllAttributes: FunctionReference<
        "mutation",
        "internal",
        { enableAudit?: boolean; removedBy?: string; userId: string },
        number
      >;
      removeAttribute: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          key: string;
          removedBy?: string;
          userId: string;
        },
        boolean
      >;
      removePermissionOverride: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          permission: string;
          removedBy?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        boolean
      >;
      revokeAllRoles: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          revokedBy?: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        number
      >;
      revokeRole: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          revokedBy?: string;
          role: string;
          scope?: { id: string; type: string };
          userId: string;
        },
        boolean
      >;
      setAttribute: FunctionReference<
        "mutation",
        "internal",
        {
          enableAudit?: boolean;
          key: string;
          setBy?: string;
          userId: string;
          value: any;
        },
        string
      >;
    };
    queries: {
      checkPermission: FunctionReference<
        "query",
        "internal",
        {
          permission: string;
          rolePermissions: Record<string, Array<string>>;
          scope?: { id: string; type: string };
          userId: string;
        },
        {
          allowed: boolean;
          matchedOverride?: string;
          matchedRole?: string;
          reason: string;
        }
      >;
      getAuditLog: FunctionReference<
        "query",
        "internal",
        {
          action?:
            | "permission_check"
            | "role_assigned"
            | "role_revoked"
            | "permission_granted"
            | "permission_denied"
            | "attribute_set"
            | "attribute_removed";
          limit?: number;
          userId?: string;
        },
        Array<{
          _id: string;
          action: string;
          actorId?: string;
          details: any;
          timestamp: number;
          userId: string;
        }>
      >;
      getEffectivePermissions: FunctionReference<
        "query",
        "internal",
        {
          rolePermissions: Record<string, Array<string>>;
          scope?: { id: string; type: string };
          userId: string;
        },
        {
          deniedPermissions: Array<string>;
          permissions: Array<string>;
          roles: Array<string>;
        }
      >;
      getPermissionOverrides: FunctionReference<
        "query",
        "internal",
        { permission?: string; userId: string },
        Array<{
          _id: string;
          effect: "allow" | "deny";
          expiresAt?: number;
          permission: string;
          reason?: string;
          scope?: { id: string; type: string };
        }>
      >;
      getUserAttribute: FunctionReference<
        "query",
        "internal",
        { key: string; userId: string },
        null | any
      >;
      getUserAttributes: FunctionReference<
        "query",
        "internal",
        { userId: string },
        Array<{ _id: string; key: string; value: any }>
      >;
      getUserRoles: FunctionReference<
        "query",
        "internal",
        { scope?: { id: string; type: string }; userId: string },
        Array<{
          _id: string;
          expiresAt?: number;
          metadata?: any;
          role: string;
          scope?: { id: string; type: string };
        }>
      >;
      getUsersWithRole: FunctionReference<
        "query",
        "internal",
        { role: string; scope?: { id: string; type: string } },
        Array<{ assignedAt: number; expiresAt?: number; userId: string }>
      >;
      hasRole: FunctionReference<
        "query",
        "internal",
        { role: string; scope?: { id: string; type: string }; userId: string },
        boolean
      >;
    };
    rebac: {
      addRelation: FunctionReference<
        "mutation",
        "internal",
        {
          createdBy?: string;
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        string
      >;
      checkRelationWithTraversal: FunctionReference<
        "query",
        "internal",
        {
          maxDepth?: number;
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
          traversalRules?: any;
        },
        { allowed: boolean; path: Array<string>; reason: string }
      >;
      getObjectRelations: FunctionReference<
        "query",
        "internal",
        { objectId: string; objectType: string; relation?: string },
        Array<{
          _id: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        }>
      >;
      getSubjectRelations: FunctionReference<
        "query",
        "internal",
        { objectType?: string; subjectId: string; subjectType: string },
        Array<{
          _id: string;
          objectId: string;
          objectType: string;
          relation: string;
        }>
      >;
      hasDirectRelation: FunctionReference<
        "query",
        "internal",
        {
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        boolean
      >;
      listAccessibleObjects: FunctionReference<
        "query",
        "internal",
        {
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
          traversalRules?: any;
        },
        Array<{ objectId: string; via: string }>
      >;
      listUsersWithAccess: FunctionReference<
        "query",
        "internal",
        { objectId: string; objectType: string; relation: string },
        Array<{ userId: string; via: string }>
      >;
      removeRelation: FunctionReference<
        "mutation",
        "internal",
        {
          objectId: string;
          objectType: string;
          relation: string;
          subjectId: string;
          subjectType: string;
        },
        boolean
      >;
    };
  };
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
