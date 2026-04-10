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

  return `
You are ViralShortGPT, an expert in turning long-form podcasts/videos into viral TikTok/Reels/Shorts clips (15–60 seconds). Your only job is to find the ${maxClips <= 3 ? `top ${maxClips}` : `${maxClips} MOST`} shareable, high-engagement moments that will perform best on social media.

Video duration: ${videoDuration.toFixed(0)} seconds
Full transcript:
${transcriptText}

Rules you MUST follow strictly:
1. Only select moments from the MAIN content (after intro, before outro/CTA/sponsors/ads). Avoid:
   - Any sponsor mentions, promotions, affiliate links, "this video is sponsored by", discount codes
   - Intros ("welcome to...", "today we're talking about...")
   - Outros ("thanks for watching", "subscribe", "like & comment")
   - Filler, chit-chat, or low-energy sections
2. Prioritize moments with:
   - Interesting statements or stories
   - Emotional moments
   - Surprising revelations or insights
   - Quotable or memorable segments
   - Self-contained moments that work well in isolation
   - Strong hooks: questions, bold statements, "mind blown", "I can't believe", "secret", "mistake you're making"
   - Emotional peaks: surprise, anger, laughter, inspiration, controversy, relatable stories
   - Clear value: actionable tips, hot takes, data reveals, personal failures → lessons
   - High shareability: quotable lines, "this is so true", "tag a friend who..."
3. Each clip MUST:
   - Start at a natural sentence beginning or strong transition
   - End at a natural pause/sentence end (NEVER cut mid-sentence or mid-thought — always finish the complete thought)
   - Be 25–60 seconds. Aim for 35–55 seconds sweet spot. NEVER return a clip under 25s unless the moment is 100% complete and self-contained
   - Prefer longer clips that tell a complete mini-story over short one-liners
   - Spread clips across the full video — do NOT cluster multiple clips from the same section
   - Have high viral potential (score 70+)
4. Return ONLY a valid JSON array of objects. No explanations, no markdown, no extra text.
   Shape:
   [
     {
       "title": "Short, punchy viral hook title (max 60 chars, use hyphen - only, no em/en dash)",
       "startTime": number (float seconds, exact start),
       "endTime": number (float seconds, natural end <= videoDuration),
       "duration": number (endTime - startTime, must be 25-60, target 35-55),
       "viralScore": integer 0-100 (be harsh — only 80+ for truly viral potential),
       "platform": one best platform from: ${platforms.join(", ")},
       "reason": short internal note why this moment is viral (1 sentence, will not be output),
       "captions": {
         ${platformList}
       }
     }
   ]

Example output (do NOT copy — generate your own):
[{"title":"The biggest mistake most beginners make","startTime":125.4,"endTime":168.9,"duration":43.5,"viralScore":92,"platform":"tiktok","reason":"Strong hook + relatable pain point + quick solution","captions":{"tiktok":"...","instagram":"..."}}]

Analyze carefully and be selective — only return moments that would actually go viral in 2026.
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

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildPrompt(transcriptText, videoDuration, platforms, maxClips),
        },
      ],
    });

    if (response.stop_reason === "max_tokens") {
      throw new ConvexError(
        "Claude response was truncated (exceeded token limit). " +
        "Try reducing the number of enabled platforms or the transcript length.",
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
