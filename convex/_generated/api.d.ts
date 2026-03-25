/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as blueskyActions from "../blueskyActions.js";
import type * as cloudinaryActions from "../cloudinaryActions.js";
import type * as exportActions from "../exportActions.js";
import type * as facebookActions from "../facebookActions.js";
import type * as http from "../http.js";
import type * as outputs from "../outputs.js";
import type * as outstandActions from "../outstandActions.js";
import type * as projects from "../projects.js";
import type * as publicClip from "../publicClip.js";
import type * as r2 from "../r2.js";
import type * as r2Actions from "../r2Actions.js";
import type * as r2storage from "../r2storage.js";
import type * as socialTokens from "../socialTokens.js";
import type * as threadsActions from "../threadsActions.js";
import type * as tiktokActions from "../tiktokActions.js";
import type * as transcription from "../transcription.js";
import type * as users from "../users.js";
import type * as videoProcessingActions from "../videoProcessingActions.js";
import type * as workflow from "../workflow.js";
import type * as xActions from "../xActions.js";
import type * as youtubeActions from "../youtubeActions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  blueskyActions: typeof blueskyActions;
  cloudinaryActions: typeof cloudinaryActions;
  exportActions: typeof exportActions;
  facebookActions: typeof facebookActions;
  http: typeof http;
  outputs: typeof outputs;
  outstandActions: typeof outstandActions;
  projects: typeof projects;
  publicClip: typeof publicClip;
  r2: typeof r2;
  r2Actions: typeof r2Actions;
  r2storage: typeof r2storage;
  socialTokens: typeof socialTokens;
  threadsActions: typeof threadsActions;
  tiktokActions: typeof tiktokActions;
  transcription: typeof transcription;
  users: typeof users;
  videoProcessingActions: typeof videoProcessingActions;
  workflow: typeof workflow;
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
  cloudinary: {
    lib: {
      createPendingUpload: FunctionReference<
        "mutation",
        "internal",
        {
          filename?: string;
          folder?: string;
          metadata?: any;
          tags?: Array<string>;
          userId?: string;
        },
        { publicId: string; uploadId: string }
      >;
      deleteAsset: FunctionReference<
        "action",
        "internal",
        {
          config: { apiKey: string; apiSecret: string; cloudName: string };
          publicId: string;
        },
        { error?: string; success: boolean }
      >;
      deletePendingUpload: FunctionReference<
        "mutation",
        "internal",
        { uploadId: string },
        { error?: string; success: boolean }
      >;
      finalizeUpload: FunctionReference<
        "mutation",
        "internal",
        {
          folder?: string;
          publicId: string;
          uploadResult: {
            access_mode?: string;
            accessibility_analysis?: any;
            api_key?: string;
            asset_folder?: string;
            asset_id?: string;
            batch_id?: string;
            bytes?: number;
            colors?: Array<Array<any>>;
            context?: any;
            created_at?: string;
            delete_token?: string;
            display_name?: string;
            done?: boolean;
            eager?: Array<{
              bytes?: number;
              format?: string;
              height?: number;
              secure_url?: string;
              transformation?: string;
              url?: string;
              width?: number;
            }>;
            etag?: string;
            existing?: boolean;
            faces?: Array<Array<number>>;
            folder?: string;
            format: string;
            grayscale?: boolean;
            height?: number;
            illustration_score?: number;
            image_metadata?: any;
            media_metadata?: any;
            moderation?: Array<any>;
            original_extension?: string;
            original_filename?: string;
            pages?: number;
            phash?: string;
            placeholder?: boolean;
            public_id: string;
            quality_analysis?: { focus?: number };
            resource_type?: string;
            secure_url: string;
            semi_transparent?: boolean;
            signature?: string;
            status?: string;
            tags?: Array<string>;
            type?: string;
            url: string;
            version?: number;
            version_id?: string;
            width?: number;
          };
          userId?: string;
        },
        string
      >;
      generateUploadCredentials: FunctionReference<
        "action",
        "internal",
        {
          config: { apiKey: string; apiSecret: string; cloudName: string };
          filename?: string;
          folder?: string;
          publicId?: string;
          tags?: Array<string>;
          transformation?: {
            angle?: number | string;
            aspectRatio?: string | number;
            background?: string;
            border?: string;
            color?: string;
            crop?: string;
            defaultImage?: string;
            density?: number;
            dpr?: number | string;
            effect?: string;
            flags?: string | Array<string>;
            format?: string;
            gravity?: string;
            height?: number;
            namedTransformation?: string;
            opacity?: number;
            overlay?: string;
            page?: number;
            quality?: string | number;
            radius?: number | string;
            rawTransformation?: string;
            width?: number;
            x?: number;
            y?: number;
            zoom?: number;
          };
          userId?: string;
        },
        {
          uploadParams: {
            api_key: string;
            folder?: string;
            public_id?: string;
            signature: string;
            tags?: string;
            timestamp: string;
            transformation?: string;
          };
          uploadUrl: string;
        }
      >;
      getAsset: FunctionReference<
        "query",
        "internal",
        {
          config: { apiKey: string; apiSecret: string; cloudName: string };
          publicId: string;
        },
        {
          _creationTime: number;
          _id: string;
          bytes?: number;
          cloudinaryUrl: string;
          errorMessage?: string;
          folder?: string;
          format: string;
          height?: number;
          metadata?: any;
          originalFilename?: string;
          publicId: string;
          secureUrl: string;
          status: "pending" | "uploading" | "completed" | "failed";
          tags?: Array<string>;
          transformations?: Array<any>;
          updatedAt: number;
          uploadedAt: number;
          userId?: string;
          width?: number;
        } | null
      >;
      getUploadsByStatus: FunctionReference<
        "query",
        "internal",
        {
          limit?: number;
          status: "pending" | "uploading" | "completed" | "failed";
          userId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          bytes?: number;
          cloudinaryUrl: string;
          errorMessage?: string;
          folder?: string;
          format: string;
          height?: number;
          metadata?: any;
          originalFilename?: string;
          publicId: string;
          secureUrl: string;
          status: "pending" | "uploading" | "completed" | "failed";
          tags?: Array<string>;
          transformations?: Array<any>;
          updatedAt: number;
          uploadedAt: number;
          userId?: string;
          width?: number;
        }>
      >;
      listAssets: FunctionReference<
        "query",
        "internal",
        {
          config: { apiKey: string; apiSecret: string; cloudName: string };
          folder?: string;
          limit?: number;
          order?: "asc" | "desc";
          orderBy?: "uploadedAt" | "updatedAt";
          tags?: Array<string>;
          userId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          bytes?: number;
          cloudinaryUrl: string;
          errorMessage?: string;
          folder?: string;
          format: string;
          height?: number;
          metadata?: any;
          originalFilename?: string;
          publicId: string;
          secureUrl: string;
          status: "pending" | "uploading" | "completed" | "failed";
          tags?: Array<string>;
          transformations?: Array<any>;
          updatedAt: number;
          uploadedAt: number;
          userId?: string;
          width?: number;
        }>
      >;
      transform: FunctionReference<
        "query",
        "internal",
        {
          config: { apiKey: string; apiSecret: string; cloudName: string };
          publicId: string;
          transformation: {
            angle?: number | string;
            aspectRatio?: string | number;
            background?: string;
            border?: string;
            color?: string;
            crop?: string;
            defaultImage?: string;
            density?: number;
            dpr?: number | string;
            effect?: string;
            flags?: string | Array<string>;
            format?: string;
            gravity?: string;
            height?: number;
            namedTransformation?: string;
            opacity?: number;
            overlay?: string;
            page?: number;
            quality?: string | number;
            radius?: number | string;
            rawTransformation?: string;
            width?: number;
            x?: number;
            y?: number;
            zoom?: number;
          };
        },
        { secureUrl: string; transformedUrl: string }
      >;
      updateAsset: FunctionReference<
        "mutation",
        "internal",
        { metadata?: any; publicId: string; tags?: Array<string> },
        {
          _creationTime: number;
          _id: string;
          bytes?: number;
          cloudinaryUrl: string;
          errorMessage?: string;
          folder?: string;
          format: string;
          height?: number;
          metadata?: any;
          originalFilename?: string;
          publicId: string;
          secureUrl: string;
          status: "pending" | "uploading" | "completed" | "failed";
          tags?: Array<string>;
          transformations?: Array<any>;
          updatedAt: number;
          uploadedAt: number;
          userId?: string;
          width?: number;
        } | null
      >;
      updateUploadStatus: FunctionReference<
        "mutation",
        "internal",
        {
          bytes?: number;
          cloudinaryUrl?: string;
          errorMessage?: string;
          format?: string;
          height?: number;
          publicId?: string;
          secureUrl?: string;
          status: "pending" | "uploading" | "completed" | "failed";
          uploadId: string;
          width?: number;
        },
        {
          _creationTime: number;
          _id: string;
          bytes?: number;
          cloudinaryUrl: string;
          errorMessage?: string;
          folder?: string;
          format: string;
          height?: number;
          metadata?: any;
          originalFilename?: string;
          publicId: string;
          secureUrl: string;
          status: "pending" | "uploading" | "completed" | "failed";
          tags?: Array<string>;
          transformations?: Array<any>;
          updatedAt: number;
          uploadedAt: number;
          userId?: string;
          width?: number;
        } | null
      >;
      upload: FunctionReference<
        "action",
        "internal",
        {
          base64Data: string;
          config: { apiKey: string; apiSecret: string; cloudName: string };
          filename?: string;
          folder?: string;
          publicId?: string;
          tags?: Array<string>;
          transformation?: {
            angle?: number | string;
            aspectRatio?: string | number;
            background?: string;
            border?: string;
            color?: string;
            crop?: string;
            defaultImage?: string;
            density?: number;
            dpr?: number | string;
            effect?: string;
            flags?: string | Array<string>;
            format?: string;
            gravity?: string;
            height?: number;
            namedTransformation?: string;
            opacity?: number;
            overlay?: string;
            page?: number;
            quality?: string | number;
            radius?: number | string;
            rawTransformation?: string;
            width?: number;
            x?: number;
            y?: number;
            zoom?: number;
          };
          userId?: string;
        },
        {
          bytes?: number;
          error?: string;
          format?: string;
          height?: number;
          publicId?: string;
          secureUrl?: string;
          success: boolean;
          width?: number;
        }
      >;
    };
  };
  polar: {
    lib: {
      createProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            benefits?: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: string | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              source?: string;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: string | null;
            recurringIntervalCount?: number | null;
            trialInterval?: string | null;
            trialIntervalCount?: number | null;
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
            createdAt: string;
            currency: string | null;
            currentPeriodEnd: string | null;
            currentPeriodStart: string;
            customFieldData?: Record<string, any>;
            customerCancellationComment?: string | null;
            customerCancellationReason?: string | null;
            customerId: string;
            discountId?: string | null;
            endedAt: string | null;
            endsAt?: string | null;
            id: string;
            metadata: Record<string, any>;
            modifiedAt: string | null;
            priceId?: string;
            productId: string;
            recurringInterval: string | null;
            recurringIntervalCount?: number;
            seats?: number | null;
            startedAt: string | null;
            status: string;
            trialEnd?: string | null;
            trialStart?: string | null;
          };
        },
        any
      >;
      getCurrentSubscription: FunctionReference<
        "query",
        "internal",
        { userId: string },
        {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          canceledAt?: string | null;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customFieldData?: Record<string, any>;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          product: {
            benefits?: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: string | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              source?: string;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: string | null;
            recurringIntervalCount?: number | null;
            trialInterval?: string | null;
            trialIntervalCount?: number | null;
          };
          productId: string;
          recurringInterval: string | null;
          recurringIntervalCount?: number;
          seats?: number | null;
          startedAt: string | null;
          status: string;
          trialEnd?: string | null;
          trialStart?: string | null;
        } | null
      >;
      getCustomerByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        { id: string; metadata?: Record<string, any>; userId: string } | null
      >;
      getProduct: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          benefits?: Array<{
            createdAt: string;
            deletable: boolean;
            description: string;
            id: string;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            organizationId: string;
            properties?: any;
            selectable: boolean;
            type: string;
          }>;
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          prices: Array<{
            amountType?: string;
            capAmount?: number | null;
            createdAt: string;
            id: string;
            isArchived: boolean;
            maximumAmount?: number | null;
            meter?: { id: string; name: string };
            meterId?: string;
            minimumAmount?: number | null;
            modifiedAt: string | null;
            presetAmount?: number | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: string | null;
            seatTiers?: Array<{
              maxSeats: number | null;
              minSeats: number;
              pricePerSeat: number;
            }>;
            source?: string;
            type?: string;
            unitAmount?: string;
          }>;
          recurringInterval?: string | null;
          recurringIntervalCount?: number | null;
          trialInterval?: string | null;
          trialIntervalCount?: number | null;
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
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customFieldData?: Record<string, any>;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: string | null;
          recurringIntervalCount?: number;
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
        { id: string; metadata?: Record<string, any>; userId: string },
        string
      >;
      listAllUserSubscriptions: FunctionReference<
        "query",
        "internal",
        { userId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          canceledAt?: string | null;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customFieldData?: Record<string, any>;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          product: {
            benefits?: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: string | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              source?: string;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: string | null;
            recurringIntervalCount?: number | null;
            trialInterval?: string | null;
            trialIntervalCount?: number | null;
          } | null;
          productId: string;
          recurringInterval: string | null;
          recurringIntervalCount?: number;
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
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customFieldData?: Record<string, any>;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: string | null;
          recurringIntervalCount?: number;
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
          benefits?: Array<{
            createdAt: string;
            deletable: boolean;
            description: string;
            id: string;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            organizationId: string;
            properties?: any;
            selectable: boolean;
            type: string;
          }>;
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          priceAmount?: number;
          prices: Array<{
            amountType?: string;
            capAmount?: number | null;
            createdAt: string;
            id: string;
            isArchived: boolean;
            maximumAmount?: number | null;
            meter?: { id: string; name: string };
            meterId?: string;
            minimumAmount?: number | null;
            modifiedAt: string | null;
            presetAmount?: number | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: string | null;
            seatTiers?: Array<{
              maxSeats: number | null;
              minSeats: number;
              pricePerSeat: number;
            }>;
            source?: string;
            type?: string;
            unitAmount?: string;
          }>;
          recurringInterval?: string | null;
          recurringIntervalCount?: number | null;
          trialInterval?: string | null;
          trialIntervalCount?: number | null;
        }>
      >;
      listUserSubscriptions: FunctionReference<
        "query",
        "internal",
        { userId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          canceledAt?: string | null;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customFieldData?: Record<string, any>;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          discountId?: string | null;
          endedAt: string | null;
          endsAt?: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          product: {
            benefits?: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: string | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              source?: string;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: string | null;
            recurringIntervalCount?: number | null;
            trialInterval?: string | null;
            trialIntervalCount?: number | null;
          } | null;
          productId: string;
          recurringInterval: string | null;
          recurringIntervalCount?: number;
          seats?: number | null;
          startedAt: string | null;
          status: string;
          trialEnd?: string | null;
          trialStart?: string | null;
        }>
      >;
      syncProducts: FunctionReference<
        "action",
        "internal",
        { polarAccessToken: string; server: "sandbox" | "production" },
        any
      >;
      updateProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            benefits?: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: string | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              source?: string;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: string | null;
            recurringIntervalCount?: number | null;
            trialInterval?: string | null;
            trialIntervalCount?: number | null;
          };
        },
        any
      >;
      updateProducts: FunctionReference<
        "mutation",
        "internal",
        {
          polarAccessToken: string;
          products: Array<{
            benefits?: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: string | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              source?: string;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: string | null;
            recurringIntervalCount?: number | null;
            trialInterval?: string | null;
            trialIntervalCount?: number | null;
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
            createdAt: string;
            currency: string | null;
            currentPeriodEnd: string | null;
            currentPeriodStart: string;
            customFieldData?: Record<string, any>;
            customerCancellationComment?: string | null;
            customerCancellationReason?: string | null;
            customerId: string;
            discountId?: string | null;
            endedAt: string | null;
            endsAt?: string | null;
            id: string;
            metadata: Record<string, any>;
            modifiedAt: string | null;
            priceId?: string;
            productId: string;
            recurringInterval: string | null;
            recurringIntervalCount?: number;
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
  uploadthingFileTracker: {
    callbacks: {
      handleUploadthingCallback: FunctionReference<
        "action",
        "internal",
        { apiKey?: string; hook: string; rawBody: string; signature: string },
        | { fileId: string; hook: string; ok: true }
        | { error: string; ok: false }
      >;
    };
    cleanup: {
      cleanupExpired: FunctionReference<
        "action",
        "internal",
        { apiKey?: string; batchSize?: number; dryRun?: boolean },
        {
          deletedCount: number;
          hasMore: boolean;
          keys: Array<string>;
          remoteDeleteError?: string;
          remoteDeleteFailed?: boolean;
          remoteDeletedCount?: number;
        }
      >;
    };
    config: {
      getConfig: FunctionReference<
        "query",
        "internal",
        {},
        {
          defaultTtlMs?: number;
          deleteBatchSize?: number;
          deleteRemoteOnExpire?: boolean;
          hasApiKey: boolean;
          ttlByFileType?: Record<string, number>;
          ttlByMimeType?: Record<string, number>;
        }
      >;
      setConfig: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            defaultTtlMs?: number;
            deleteBatchSize?: number;
            deleteRemoteOnExpire?: boolean;
            ttlByFileType?: Record<string, number>;
            ttlByMimeType?: Record<string, number>;
            uploadthingApiKey?: string;
          };
          replace?: boolean;
        },
        { created: boolean }
      >;
    };
    files: {
      deleteFiles: FunctionReference<
        "mutation",
        "internal",
        { keys: Array<string> },
        number
      >;
      setFileAccess: FunctionReference<
        "mutation",
        "internal",
        {
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          } | null;
          key: string;
        },
        string | null
      >;
      setFolderAccess: FunctionReference<
        "mutation",
        "internal",
        {
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          } | null;
          folder: string;
        },
        string | null
      >;
      upsertFile: FunctionReference<
        "mutation",
        "internal",
        {
          file: {
            customId?: string;
            fileType?: string;
            key: string;
            mimeType: string;
            name: string;
            size: number;
            uploadedAt?: number;
            url: string;
          };
          options?: {
            access?: {
              allowUserIds?: Array<string>;
              denyUserIds?: Array<string>;
              visibility: "public" | "private" | "restricted";
            };
            expiresAt?: number;
            fileType?: string;
            folder?: string;
            metadata?: any;
            tags?: Array<string>;
            ttlMs?: number;
          };
          userId: string;
        },
        string
      >;
    };
    queries: {
      getFileByKey: FunctionReference<
        "query",
        "internal",
        { key: string; viewerUserId?: string },
        {
          _creationTime: number;
          _id: string;
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          customId?: string;
          expiresAt?: number;
          fileType?: string;
          folder?: string;
          key: string;
          metadata?: any;
          mimeType: string;
          name: string;
          replacedAt?: number;
          size: number;
          tags?: Array<string>;
          uploadedAt: number;
          url: string;
          userId: string;
        } | null
      >;
      getFolderRuleByFolder: FunctionReference<
        "query",
        "internal",
        { folder: string },
        {
          _creationTime: number;
          _id: string;
          access: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          folder: string;
          updatedAt: number;
        } | null
      >;
      listAllFiles: FunctionReference<
        "query",
        "internal",
        {
          folder?: string;
          includeExpired?: boolean;
          limit?: number;
          mimeType?: string;
          tag?: string;
          viewerUserId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          customId?: string;
          expiresAt?: number;
          fileType?: string;
          folder?: string;
          key: string;
          metadata?: any;
          mimeType: string;
          name: string;
          replacedAt?: number;
          size: number;
          tags?: Array<string>;
          uploadedAt: number;
          url: string;
          userId: string;
        }>
      >;
      listFiles: FunctionReference<
        "query",
        "internal",
        {
          folder?: string;
          includeExpired?: boolean;
          limit?: number;
          mimeType?: string;
          ownerUserId: string;
          tag?: string;
          viewerUserId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          access?: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          customId?: string;
          expiresAt?: number;
          fileType?: string;
          folder?: string;
          key: string;
          metadata?: any;
          mimeType: string;
          name: string;
          replacedAt?: number;
          size: number;
          tags?: Array<string>;
          uploadedAt: number;
          url: string;
          userId: string;
        }>
      >;
      listFolderRules: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        Array<{
          _creationTime: number;
          _id: string;
          access: {
            allowUserIds?: Array<string>;
            denyUserIds?: Array<string>;
            visibility: "public" | "private" | "restricted";
          };
          folder: string;
          updatedAt: number;
        }>
      >;
    };
    stats: {
      getUsageStats: FunctionReference<
        "query",
        "internal",
        { userId: string },
        { totalBytes: number; totalFiles: number }
      >;
    };
  };
};
