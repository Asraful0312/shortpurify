import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    // Email notification preferences
    emailNotifications: v.optional(v.boolean()), // default true when unset
    // Manual plan override — bypasses Creem subscription for collaborations/gifts
    grantedTier: v.optional(v.union(v.literal("pro"), v.literal("agency"))),
    grantedTierExpiry: v.optional(v.number()), // Unix ms — null means no expiry
  }).index("by_clerk_id", ["clerkId"]),

  projects: defineTable({
    userId: v.id("users"),
    title: v.string(),
    originalUrl: v.string(),
    originalSize: v.optional(v.number()),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    // Current pipeline step label shown in UI during processing
    processingStep: v.optional(v.string()),
    // Populated once pipeline completes
    clipsCount: v.optional(v.number()),
    workflowId: v.optional(v.string()),
    // First clip thumbnail (set after pipeline completes)
    thumbnailUrl: v.optional(v.string()),
    // Full transcript text saved after step 1
    transcriptText: v.optional(v.string()),
    // Word-level timestamps from AssemblyAI (start/end in ms)
    transcriptWords: v.optional(
      v.array(
        v.object({
          text: v.string(),
          start: v.number(),
          end: v.number(),
          speaker: v.optional(v.string()),
        }),
      ),
    ),
    // Which platforms to generate captions for (defaults to all)
    enabledPlatforms: v.optional(v.array(v.string())),
    cropMode: v.optional(v.string()), // "smart_crop" | "blur_background"
    // Workspace (org) this project belongs to. Undefined = personal project.
    workspaceId: v.optional(v.string()),
    // Duration of the source video in seconds — used for monthly minute metering
    durationSeconds: v.optional(v.number()),
    // R2 key of the original uploaded video — deleted once clips are generated
    originalKey: v.optional(v.string()),
    // Persisted subtitle style — shared across all clips in this project
    subtitleSettings: v.optional(v.object({
      enabled: v.boolean(),
      x: v.number(),
      y: v.number(),
      fontSize: v.number(),
      fontFamily: v.string(),
      textColor: v.string(),
      highlightColor: v.string(),
      highlightBg: v.string(),
      wordsPerLine: v.number(),
      template: v.optional(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_workspace", ["workspaceId"]),

  outputs: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    platform: v.string(),
    // Primary caption (same as captions[platform])
    content: v.string(),
    // Per-platform captions: { tiktok, instagram, youtube, x, threads, linkedin, snapchat, blog }
    captions: v.optional(v.record(v.string(), v.string())),
    viralScore: v.optional(v.number()),
    // Processed clip URL — R2 signed URL regenerated on read, or legacy Cloudinary URL
    clipUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    // R2 object keys — stored so URLs can be refreshed when they expire
    clipKey: v.optional(v.string()),
    thumbnailKey: v.optional(v.string()),
    // Cached subtitle export — R2 key + settings hash to skip Modal on re-download
    exportKey: v.optional(v.string()),
    exportSettingsHash: v.optional(v.string()),
    // Number of unique subtitle renders (cache misses) — used to enforce per-plan burn limits
    burnCount: v.optional(v.number()),
    // Clip window inside the source video (seconds)
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    // Populated after publishing via Upload-Post
    publishedUrls: v.optional(v.record(v.string(), v.string())),
    publishedAt: v.optional(v.number()),
    publishStatus: v.optional(
      v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    ),
    publishRequestId: v.optional(v.string()), // async upload request ID
    publishJobId: v.optional(v.string()),      // scheduled post job ID
  }).index("by_project", ["projectId"]),

  // Temporary state tokens for OAuth CSRF protection (TTL ~10 min)
  oauthStates: defineTable({
    token: v.string(),
    userId: v.id("users"),
    platform: v.string(),
    createdAt: v.number(),
    codeVerifier: v.optional(v.string()), // PKCE — used by X/Twitter OAuth
  }).index("by_token", ["token"]),

  // Scheduled publish jobs — one row per account per scheduled post
  scheduledPosts: defineTable({
    userId: v.id("users"),
    outputId: v.id("outputs"),
    platform: v.string(),
    accountId: v.string(),
    accountName: v.string(),
    accountPicture: v.optional(v.string()),
    clipTitle: v.string(),
    caption: v.string(),
    scheduledAt: v.number(),          // ms timestamp when to publish
    convexJobId: v.optional(v.string()), // Id<"_scheduled_functions"> for cancellation
    status: v.union(
      v.literal("pending"),
      v.literal("published"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    postId: v.optional(v.string()),   // platform post ID after publish
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  /**
   * Denormalized workspace membership — kept in sync via convex-tenants hooks
   * and a client-side syncMembership call on login.
   * Allows server-side auth checks without accessing tenants' internal tables.
   */
  workspaceMembers: defineTable({
    workspaceId: v.string(),       // org _id from convex-tenants
    clerkId: v.string(),           // Clerk user ID (identity.subject)
    userId: v.id("users"),         // Convex user _id — for joining with projects
    role: v.string(),              // "owner" | "admin" | "member"
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_clerk_workspace", ["clerkId", "workspaceId"]),

  // Connected social accounts — one row per page/account per user
  socialTokens: defineTable({
    userId: v.id("users"),
    platform: v.string(),           // "facebook" | "instagram" | ...
    accountId: v.string(),          // platform-specific page/account ID
    accountName: v.string(),
    accountPicture: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()), // for platforms that issue refresh tokens (Google/YouTube)
    tokenExpiry: v.optional(v.number()), // ms timestamp; undefined = never expires
    scope: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_platform", ["userId", "platform"])
    .index("by_user_platform_account", ["userId", "platform", "accountId"]),
});
