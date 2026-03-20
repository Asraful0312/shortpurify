import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import Anthropic from "@anthropic-ai/sdk";

export interface GeneratedClip {
  title: string;
  startTime: number;
  endTime: number;
  viralScore: number;
  /** Primary recommended platform for this clip */
  platform: string;
  /** Per-platform captions keyed by platform id */
  captions: Record<string, string>;
}

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  tiktok:    "TikTok caption — hook-first, casual, max 220 chars, 3-5 hashtags",
  instagram: "Instagram Reels caption — polished storytelling, max 300 chars, 5-8 hashtags",
  youtube:   "YouTube Shorts description — keyword-rich, max 200 chars, 3-5 hashtags",
  x:         "X (Twitter) post — punchy, max 280 chars, 1-2 hashtags",
  threads:   "Threads post — conversational, max 500 chars, no hashtags needed",
  linkedin:  "LinkedIn post — professional insight angle, max 300 chars",
  snapchat:  "Snapchat caption — short and fun, max 250 chars",
  blog:      "2-sentence blog intro paragraph that teases the clip topic (no hashtags)",
};

/** Strip em dashes and en dashes from AI-generated text */
function sanitize(text: string): string {
  return text.replace(/[—–]/g, "-").trim();
}

function buildPrompt(
  transcriptText: string,
  videoDuration: number,
  platforms: string[],
): string {
  const platformList = platforms.map((p) => `  - "${p}": ${PLATFORM_INSTRUCTIONS[p] ?? "short caption"}`).join("\n");

  return `You are a viral short-form content strategist. Analyze this transcript and identify 3-5 of the most compelling moments for short-form clips.

Video duration: ${videoDuration.toFixed(0)}s

Transcript:
${transcriptText}

For each clip return a JSON object with EXACTLY these keys:
- title: viral hook title, max 60 chars, NO em-dashes (use hyphen instead), no clickbait
- startTime: float seconds where the moment begins
- endTime: float seconds, max 60s after startTime, must be <= ${videoDuration.toFixed(0)}
- viralScore: integer 0-100 (hook strength + emotional impact + info value)
- platform: best single platform for this clip (one of: ${platforms.join(", ")})
- captions: object with a key for each platform below:
${platformList}

Rules:
- NEVER use em dashes (—) or en dashes (–) anywhere — use a hyphen (-) instead
- NEVER use markdown, bullet points, or special formatting inside caption strings
- Return ONLY a valid JSON array, no markdown fence, no explanation

Example shape:
[{"title":"...","startTime":0.0,"endTime":45.0,"viralScore":88,"platform":"tiktok","captions":{"tiktok":"...","instagram":"...","youtube":"...","x":"...","threads":"...","linkedin":"...","snapchat":"...","blog":"..."}}]`.trim();
}

/**
 * Calls Claude to identify viral clip windows and generate per-platform captions.
 */
export const generateClipIdeas = internalAction({
  args: {
    transcriptText: v.string(),
    videoDuration: v.optional(v.number()),
    enabledPlatforms: v.optional(v.array(v.string())),
  },
  handler: async (
    _ctx,
    { transcriptText, videoDuration = 300, enabledPlatforms },
  ): Promise<GeneratedClip[]> => {
    const platforms =
      enabledPlatforms && enabledPlatforms.length > 0
        ? enabledPlatforms
        : Object.keys(PLATFORM_INSTRUCTIONS);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: buildPrompt(transcriptText, videoDuration, platforms),
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") throw new Error("Unexpected Claude response type");

    const match = block.text.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error(
        `Claude did not return a JSON array. Preview: ${block.text.slice(0, 300)}`,
      );
    }

    const clips: GeneratedClip[] = JSON.parse(match[0]);

    return clips.map((c) => ({
      ...c,
      title: sanitize(c.title),
      // Sanitize + ensure every requested platform has a caption
      captions: Object.fromEntries(
        platforms.map((p) => [
          p,
          sanitize(c.captions?.[p] ?? c.captions?.tiktok ?? ""),
        ]),
      ),
      startTime: Math.max(0, c.startTime),
      endTime: Math.min(videoDuration, Math.max(c.startTime + 5, c.endTime)),
    }));
  },
});
