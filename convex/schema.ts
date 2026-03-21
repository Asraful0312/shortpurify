import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
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
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

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
    // Clip window inside the source video (seconds)
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    // Populated after publishing via Upload-Post
    publishedUrls: v.optional(v.record(v.string(), v.string())),
    publishedAt: v.optional(v.number()),
    publishStatus: v.optional(
      v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    ),
  }).index("by_project", ["projectId"]),

  socialConnections: defineTable({
    userId: v.id("users"),
    provider: v.string(), // "uploadpost"
    accessToken: v.string(),
    profiles: v.array(
      v.object({ platform: v.string(), profileId: v.string() }),
    ),
  }).index("by_user", ["userId"]),
});
