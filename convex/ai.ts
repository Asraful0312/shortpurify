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

function buildSystemMessage(): string {
  return `You are ViralShortGPT, an expert at turning long-form video transcripts into viral short clips for TikTok, Reels, and YouTube Shorts.

MANDATORY TWO-PHASE PROCESS — you MUST complete both phases before producing output:

━━ PHASE 1: UNDERSTAND THE VIDEO COMPLETELY ━━
Read the ENTIRE transcript from start to finish before touching any timestamps. Build a full mental model:
- What is this video actually about? (the real subject, not just surface keywords)
- What is the narrative arc or structure? (tutorial, story, list, interview, etc.)
- Who is the speaker and who is their audience?
- Where do complete standalone thoughts, stories, or insights naturally begin and end?
- Which moments have the strongest hooks, reveals, or emotional peaks?
You CANNOT pick timestamps until you can answer all of the above.

━━ PHASE 2: SELECT CLIPS (only after Phase 1) ━━
Select clips that are complete, self-contained pieces — someone must be able to watch the clip cold (no prior context) and fully understand it.

━━ CRITICAL SENTENCE BOUNDARY RULE ━━
This is the #1 failure mode. Before locking any startTime, look at what appears in the transcript IMMEDIATELY BEFORE that timestamp. Ask: "Does this clip start at the beginning of a sentence or new thought?"

BAD startTime examples (clip starts mid-sentence or mid-thought):
- "to analyze audio in real time?" — starts with "to", clearly a sentence continuation
- "talk your character will jump." — starts mid-clause
- "games or simulations." — fragment, not a sentence start
- "engine that simulates gravity" — mid-noun-phrase
- Any clip starting with: and, but, or, to, that, which, so, then, because, if, when, where, who, this (when referring to something already mentioned)

GOOD startTime examples:
- "This library gives you access to audio features like pitch..." — complete sentence start
- "The biggest mistake developers make is..." — strong hook, clear start
- "Here's something I discovered that changed everything:" — natural beginning
- "I built a game where screaming makes your character jump." — self-contained opening

If the transcript timestamp you want starts mid-sentence, scroll BACK in the transcript to find where that sentence actually begins and use THAT timestamp instead.`;
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
Video duration: ${videoDuration.toFixed(0)} seconds

Full transcript (read it completely before selecting any clips):
${transcriptText}

SELECTION RULES:
1. Return FEWER clips if the video doesn't have enough strong moments. ${Math.max(1, Math.floor(clipCap / 2))} excellent clips beats ${clipCap} mediocre or cut-off ones.
2. NEVER exceed ${clipCap} clips. Short videos get proportionally fewer.
3. Only select moments from MAIN content. Skip:
   - Sponsor mentions, ads, affiliate links, discount codes
   - Intros ("welcome to...", "today we're talking about...")
   - Outros ("thanks for watching", "subscribe", "like & comment")
   - Filler, transitions, low-energy sections
4. Every clip MUST:
   - Start at the exact beginning of a sentence or new thought — see CRITICAL SENTENCE BOUNDARY RULE in your system instructions
   - End at the natural completion of that thought — NEVER cut mid-sentence or mid-story
   - Be 30–60 seconds. Target 35–50s. Reject anything that can't contain a complete thought
   - Tell a complete mini-story or deliver a complete insight on its own
   - Score 75+ to be included
5. Spread clips across the video. Never cluster multiple clips within the same 2-minute window.
6. Prioritize moments with:
   - Strong self-contained hooks: bold claims, surprising reveals, personal stories, "the mistake everyone makes"
   - Emotional peaks: surprise, inspiration, controversy, relatability
   - Clear standalone value: one actionable tip, one hot take, one data reveal
   - Quotable, shareable lines

Return a JSON object with this exact shape (no markdown, no extra text):
{
  "videoContext": {
    "topic": "one sentence: what this video is actually about",
    "format": "tutorial | story | interview | list | commentary | other",
    "targetAudience": "who this is for",
    "structure": "brief description of how the video is structured (intro → main sections → outro)"
  },
  "clips": [
    {
      "title": "Short punchy viral hook title (max 60 chars, hyphen - only, no em/en dash)",
      "startTime": number (float seconds — must be start of a complete sentence),
      "endTime": number (float seconds, must be <= ${videoDuration.toFixed(0)}),
      "duration": number (endTime - startTime, must be 30–60),
      "viralScore": integer 0-100 (75+ minimum),
      "platform": "best platform from: ${platforms.join(", ")}",
      "sentenceCheck": "first 8 words of the clip exactly as they appear in the transcript",
      "reason": "one sentence — why this specific moment is viral and complete",
      "captions": {
        ${platformList}
      }
    }
  ]
}

The "sentenceCheck" field is mandatory — it forces you to verify the clip starts at a real sentence beginning.
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
      system: buildSystemMessage(),
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

    // Response is now { videoContext, clips } — extract the clips array.
    // Fall back to a bare array if the model omitted the wrapper (older cached responses).
    let clips: GeneratedClip[];
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (objMatch) {
      const parsed = JSON.parse(objMatch[0]);
      clips = Array.isArray(parsed.clips) ? parsed.clips : parsed;
    } else if (arrMatch) {
      clips = JSON.parse(arrMatch[0]);
    } else {
      throw new ConvexError(
        `Claude did not return valid JSON. Preview: ${block.text.slice(0, 300)}`,
      );
    }

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
