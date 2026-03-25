import { action } from "./_generated/server";
import { v } from "convex/values";
import { r2 } from "./r2storage";
import { internal, api } from "./_generated/api";

export const getPublicClip = action({
  args: { outputId: v.id("outputs") },
  handler: async (ctx, { outputId }): Promise<any> => {
    const output = await ctx.runQuery(internal.outputs.getOutput, { outputId });
    if (!output) return null;

    // Prefer the subtitle-burned export over the raw clip
    const videoKey = output.exportKey ?? output.clipKey;
    let videoUrl = output.clipUrl;
    if (videoKey) {
      videoUrl = await r2.getUrl(videoKey, { expiresIn: 60 * 60 * 24 * 7 });
    }

    let imageUrl = output.thumbnailUrl;
    if (output.thumbnailKey) {
      imageUrl = await r2.getUrl(output.thumbnailKey, { expiresIn: 60 * 60 * 24 * 7 });
    }

    // Fetch subtitle words + settings from project so clip page can render overlay
    let subtitleWords: { text: string; startMs: number; endMs: number }[] = [];
    let subtitleSettings = null;
    try {
      const project = await ctx.runQuery(api.projects.getProject, { projectId: output.projectId });
      if (project && (project.transcriptWords?.length ?? 0) > 0) {
        const clipStartMs = (output.startTime ?? 0) * 1000;
        const clipEndMs   = (output.endTime   ?? Infinity) * 1000;
        subtitleWords = (project.transcriptWords ?? [])
          .filter((w) => w.start >= clipStartMs && w.end <= clipEndMs)
          .map((w) => ({ text: w.text, startMs: w.start - clipStartMs, endMs: w.end - clipStartMs }));
        subtitleSettings = project.subtitleSettings;
      }
    } catch {
      // Project may be private/unavailable — skip subtitles
    }

    return {
      ...output,
      videoUrl,
      imageUrl: imageUrl || "https://shortpurify.com/og.jpg",
      subtitleWords,
      subtitleSettings,
    };
  }
});
