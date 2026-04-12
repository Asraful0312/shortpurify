import { ConvexError, v } from "convex/values";
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
  maxClips: number,
): string {
  const platformList = platforms.map((p) => ` - "${p}": ${PLATFORM_INSTRUCTIONS[p] ?? "short caption"}`).join("\n");

  // Calculate a realistic clip capacity based on video duration.
  // Assume avg clip = 40s + 20s gap between clips = 60s per clip slot.
  const realisticMax = Math.max(1, Math.floor(videoDuration / 60));
  const clipCap = Math.min(maxClips, realisticMax);

  return `
You are ViralShortGPT, an expert in turning long-form podcasts/videos into viral TikTok/Reels/Shorts clips. Your job is to find UP TO ${clipCap} genuinely great clips — quality over quantity always.

Video duration: ${videoDuration.toFixed(0)} seconds
Full transcript:
${transcriptText}

CRITICAL RULES — read carefully:
1. Return FEWER clips if the video doesn't have enough strong moments. It is MUCH better to return ${Math.max(1, Math.floor(clipCap / 2))} excellent clips than ${clipCap} mediocre or cut-off ones. Never force clips just to hit the maximum.
2. NEVER exceed ${clipCap} clips. If video duration is short, return proportionally fewer.
3. Only select moments from the MAIN content (after intro, before outro/CTA/sponsors/ads). Skip:
   - Sponsor mentions, ads, affiliate links, discount codes
   - Intros ("welcome to...", "today we're talking about...")
   - Outros ("thanks for watching", "subscribe", "like & comment")
   - Filler, transitions, low-energy sections
4. Every clip MUST:
   - Start at a natural sentence beginning or strong hook
   - End at a complete thought — NEVER cut mid-sentence, mid-story, or mid-point
   - Be 30–60 seconds. Target 35–50s sweet spot. Reject any moment that can't fit a complete thought in 60s
   - Tell a complete mini-story or deliver a complete insight on its own
   - Score 75+ to be included — be harsh, most moments don't deserve to go viral
5. Clips must be spread across the video. Do NOT cluster multiple clips from the same 2-minute window.
6. Prioritize moments with:
   - Strong self-contained hooks: bold claims, surprising facts, "the mistake everyone makes", personal stories
   - Emotional peaks: surprise, inspiration, controversy, relatability
   - Clear standalone value: one actionable tip, one hot take, one data reveal
   - Quotable lines people will screenshot or share

Return ONLY a valid JSON array. No markdown, no explanation, no extra text.
Shape:
[
  {
    "title": "Short punchy viral hook title (max 60 chars, hyphen - only, no em/en dash)",
    "startTime": number (float seconds),
    "endTime": number (float seconds, must be <= ${videoDuration.toFixed(0)}),
    "duration": number (endTime - startTime, must be 30–60),
    "viralScore": integer 0-100 (75+ minimum to include),
    "platform": one best platform from: ${platforms.join(", ")},
    "reason": one sentence — why this specific moment is viral,
    "captions": {
      ${platformList}
    }
  }
]

Example (do NOT copy):
[{"title":"The biggest mistake most beginners make","startTime":125.4,"endTime":168.9,"duration":43.5,"viralScore":92,"platform":"tiktok","reason":"Strong hook + relatable pain point + complete solution delivered","captions":{"tiktok":"...","instagram":"..."}}]

Remember: return fewer COMPLETE clips over more CUT-OFF clips. Quality is everything.
`.trim();
}

/**
 * Calls Claude to identify viral clip windows and generate per-platform captions.
 */
export const generateClipIdeas = internalAction({
  args: {
    transcriptText: v.string(),
    videoDuration: v.optional(v.number()),
    enabledPlatforms: v.optional(v.array(v.string())),
    maxClips: v.optional(v.number()),
  },
  handler: async (
    _ctx,
    { transcriptText, videoDuration = 300, enabledPlatforms, maxClips = 6 },
  ): Promise<GeneratedClip[]> => {
    const platforms =
      enabledPlatforms && enabledPlatforms.length > 0
        ? enabledPlatforms
        : Object.keys(PLATFORM_INSTRUCTIONS);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    // Trim transcript to ~12k words to stay within context limits for long videos.
    // At ~150 words/min, 12k words ≈ 80 min of content — more than enough for clip selection.
    const MAX_WORDS = 12000;
    const words = transcriptText.split(/\s+/);
    const trimmedTranscript = words.length > MAX_WORDS
      ? words.slice(0, MAX_WORDS).join(" ") + "\n[transcript trimmed for length]"
      : transcriptText;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: buildPrompt(trimmedTranscript, videoDuration, platforms, maxClips),
        },
      ],
    });

    if (response.stop_reason === "max_tokens") {
      throw new ConvexError(
        "Claude response was truncated. Please reduce the number of enabled platforms and try again.",
      );
    }

    const block = response.content[0];
    if (block.type !== "text") throw new ConvexError("Unexpected Claude response type");

    // Strip markdown code fences Claude sometimes adds (e.g. ```json ... ```)
    const cleaned = block.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new ConvexError(
        `Claude did not return a JSON array. Preview: ${block.text.slice(0, 300)}`,
      );
    }

    const clips: GeneratedClip[] = JSON.parse(match[0]);

    return clips.slice(0, maxClips).map((c) => ({
      title: sanitize(c.title),
      startTime: Math.max(0, c.startTime),
      endTime: Math.min(videoDuration, Math.min(c.startTime + 60, Math.max(c.startTime + 25, c.endTime))),
      viralScore: c.viralScore,
      platform: c.platform,
      // Sanitize + ensure every requested platform has a caption
      captions: Object.fromEntries(
        platforms.map((p) => [
          p,
          sanitize(c.captions?.[p] ?? c.captions?.tiktok ?? ""),
        ]),
      ),
    }));
  },
});
