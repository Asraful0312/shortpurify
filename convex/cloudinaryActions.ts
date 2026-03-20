import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Builds a Cloudinary fetch-mode video URL (9:16, face crop, trimmed to clip window).
 */
function buildVideoUrl(
  cloudName: string,
  sourceUrl: string,
  startTime: number,
  duration: number,
): string {
  const chain1 = `so_${startTime.toFixed(1)},du_${Math.ceil(duration)}`;
  const chain2 = `ar_9:16,c_fill,g_auto:face`;
  const chain3 = `f_mp4,q_auto`;
  return `https://res.cloudinary.com/${cloudName}/video/fetch/${chain1}/${chain2}/${chain3}/${sourceUrl}`;
}

/**
 * Builds a Cloudinary fetch-mode JPEG thumbnail from the clip's first frame.
 */
function buildThumbnailUrl(
  cloudName: string,
  sourceUrl: string,
  startTime: number,
): string {
  const chain1 = `so_${startTime.toFixed(1)}`;
  const chain2 = `ar_9:16,c_fill,g_auto:face`;
  const chain3 = `f_jpg,q_auto,w_400`;
  return `https://res.cloudinary.com/${cloudName}/video/fetch/${chain1}/${chain2}/${chain3}/${sourceUrl}`;
}

/** Saves all AI-identified clips to the outputs table with Cloudinary transform URLs. */
export const saveClipsToDb = internalAction({
  args: {
    projectId: v.id("projects"),
    videoUrl: v.string(),
    clips: v.array(
      v.object({
        title: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        viralScore: v.number(),
        platform: v.string(),
        captions: v.record(v.string(), v.string()),
      }),
    ),
  },
  handler: async (ctx, { projectId, videoUrl, clips }) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error("CLOUDINARY_CLOUD_NAME env var is not set");

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const duration = Math.max(1, clip.endTime - clip.startTime);
      const thumbUrl = buildThumbnailUrl(cloudName, videoUrl, clip.startTime);

      await ctx.runMutation(internal.outputs.saveOutput, {
        projectId,
        title: clip.title,
        platform: clip.platform,
        // Primary caption = the clip's recommended platform caption
        content: clip.captions[clip.platform] ?? Object.values(clip.captions)[0] ?? "",
        captions: clip.captions,
        viralScore: clip.viralScore,
        clipUrl: buildVideoUrl(cloudName, videoUrl, clip.startTime, duration),
        thumbnailUrl: thumbUrl,
        startTime: clip.startTime,
        endTime: clip.endTime,
      });

      // Set project thumbnail from the highest-scored clip (first, sorted by viralScore desc)
      if (i === 0) {
        await ctx.runMutation(internal.projects.updateProjectStatus, {
          projectId,
          status: "processing",
          thumbnailUrl: thumbUrl,
        });
      }
    }
  },
});
