"use node";

import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { rateLimiter } from "./rateLimits";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const PROMPTS: Record<string, (input: string) => string> = {
  "youtube-shorts-title": (topic: string) =>
    `You are an expert YouTube Shorts creator. Generate 10 compelling, click-worthy YouTube Shorts titles for the following topic: "${topic}"

Rules:
- Each title must be under 60 characters
- Use power words, numbers, and curiosity gaps
- Optimized for YouTube Shorts algorithm (2024-2025)
- Mix styles: how-to, listicle, question, shocking fact, story
- Do NOT use quotation marks around titles
- Return ONLY the 10 titles, one per line, numbered 1-10
- No extra commentary`,

  "tiktok-caption": (description: string) =>
    `You are a viral TikTok content strategist. Generate a TikTok caption with hashtags for this video: "${description}"

Return this exact format:
CAPTION:
[2-3 sentence engaging caption that hooks viewers, uses conversational tone, includes a call to action]

HASHTAGS:
[20-25 relevant hashtags — mix of niche, medium, and broad — starting with #]

Rules:
- Caption must be punchy and conversational
- First line of caption must be a hook (question or bold statement)
- Hashtags should be a mix of sizes for maximum reach
- Return ONLY the formatted output above, nothing else`,

  "youtube-shorts-script": (topic: string) =>
    `You are an expert short-form video scriptwriter. Write a high-retention YouTube Shorts script for the following topic: "${topic}"

Return this exact format:
HOOK:
[1-2 punchy sentences — the first 3 seconds that stop the scroll. Use a bold statement, surprising fact, or direct question.]

BODY:
[The core content — 3 to 6 short paragraphs or bullet points. Keep each point fast and punchy. No filler words.]

CTA:
[1 sentence call to action — follow, comment, or watch another video. Make it feel natural, not salesy.]

DURATION:
[Estimated speaking duration in seconds, e.g. "~45 seconds"]

NOTES:
[2-3 quick on-screen text or visual suggestions to boost retention]

Rules:
- Write in a natural, conversational speaking voice — not formal
- Each sentence should be short enough to read in one breath
- The hook must create curiosity or urgency in the first 3 seconds
- Total script should fit in 30–90 seconds when spoken at natural pace
- Return ONLY the formatted output above, nothing else`,

  "youtube-thumbnail-prompt": (topic: string) =>
    `You are an expert YouTube thumbnail designer and AI image prompt engineer. Generate 3 optimized AI image generation prompts for a YouTube thumbnail about: "${topic}"

Return this exact format:
MIDJOURNEY:
[One detailed Midjourney prompt optimized for YouTube thumbnails — include style, lighting, composition, aspect ratio --ar 16:9, quality flags]

DALLE:
[One detailed DALL-E 3 prompt optimized for YouTube thumbnails — descriptive, cinematic, specific about composition and mood]

STABLE_DIFFUSION:
[One detailed Stable Diffusion prompt with positive tags — include style tokens, lighting, quality boosters like (masterpiece:1.2), (high quality)]

TIPS:
[3 short bullet points on how to make this specific thumbnail perform better — text placement, color contrast, face expression if applicable]

Rules:
- Each prompt must produce a 16:9 image suitable for a YouTube thumbnail
- Prompts must be high contrast, eye-catching, cinematic
- Include bold color palette suggestions relevant to the topic
- If the topic suits it, suggest a shocked/excited face expression
- Return ONLY the formatted output above, nothing else`,

  "hashtag-generator": (topic: string) =>
    `You are a social media hashtag expert. Generate the best hashtags for the following topic or content: "${topic}"

Return this exact format:
INSTAGRAM:
[15-20 hashtags optimized for Instagram — mix of niche, medium, and broad]

TIKTOK:
[10-15 hashtags optimized for TikTok]

YOUTUBE:
[8-10 hashtags optimized for YouTube Shorts]

Rules:
- Each section must start with the platform label exactly as shown
- All hashtags must start with #
- Mix hashtag sizes: small niche (under 500K posts), medium (500K-5M), broad (5M+)
- Make hashtags specific and relevant to the topic
- Return ONLY the formatted output above, nothing else`,

  "instagram-bio": (description: string) =>
    `You are an expert Instagram brand strategist. Write 5 Instagram bio options for: "${description}"

Return this exact format:
AESTHETIC:
[bio in a soft, aspirational, lifestyle tone]

FUNNY:
[bio with a witty, self-aware, or punny line]

PROFESSIONAL:
[bio in a clean, credible, business-appropriate tone]

MINIMAL:
[short, punchy bio with lots of white space, no fluff]

BOLD:
[confident, high-energy bio that states value clearly]

Rules:
- Each bio must be under 150 characters (Instagram's bio limit) including spaces and emojis
- Use tasteful, relevant emojis where they fit — do not overdo it
- Include a line break (use " | " as a separator) between short bio segments where natural
- No hashtags inside bios
- Return ONLY the formatted output above, nothing else`,

  "instagram-story-idea": (description: string) =>
    `You are an expert Instagram Stories content strategist. Generate 8 Instagram Story ideas for: "${description}"

Return this exact format, exactly 8 numbered lines, one idea per line:
1. [Idea title] — [one sentence on how to execute it, naming a specific interactive sticker like Poll, Quiz, Slider, Question box, Countdown, or "Add yours" where relevant]
2. [Idea title] — [one sentence on how to execute it]
3. [Idea title] — [one sentence on how to execute it]
4. [Idea title] — [one sentence on how to execute it]
5. [Idea title] — [one sentence on how to execute it]
6. [Idea title] — [one sentence on how to execute it]
7. [Idea title] — [one sentence on how to execute it]
8. [Idea title] — [one sentence on how to execute it]

Rules:
- Mix formats: at least one poll/quiz sticker idea, one behind-the-scenes idea, one this-or-that idea, one countdown/announcement idea, one UGC or "Add yours" idea, one educational/tip idea
- Each idea must be specific to the topic, not generic
- Keep each line under 160 characters
- Return ONLY the 8 numbered lines, nothing else`,
};

export const generateToolContent = action({
  args: {
    tool: v.string(),
    input: v.string(),
    clientId: v.string(),
  },
  handler: async (ctx, { tool, input, clientId }) => {
    const key = clientId.slice(0, 64);

    const [perMinute, perHour] = await Promise.all([
      rateLimiter.limit(ctx, "toolGenerate", { key }),
      rateLimiter.limit(ctx, "toolGenerateHourly", { key }),
    ]);
    if (!perMinute.ok) {
      throw new ConvexError("Too many requests. Please wait a moment and try again.");
    }
    if (!perHour.ok) {
      throw new ConvexError("Hourly limit reached. Please try again later.");
    }

    const promptFn = PROMPTS[tool];
    if (!promptFn) throw new ConvexError("Unknown tool");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ConvexError("Service not configured.");

    const trimmedInput = input.trim().slice(0, 500);
    const prompt = promptFn(trimmedInput);

    const google = createGoogleGenerativeAI({ apiKey });

    const { text } = await generateText({
      model: google("gemini-flash-lite-latest"),
      prompt,
    });

    return { result: text };
  },
});
type CobaltResult =
  | { status: "success"; url: string }
  | { status: "success"; type: "gallery"; images: string[] };

async function extractViaCobalt(
  trimmedUrl: string,
  { logLabel, unavailableMessage, failureMessage }: { logLabel: string; unavailableMessage: string; failureMessage: string },
): Promise<CobaltResult> {
  const configuredCobaltUrl = process.env.COBALT_API_URL?.replace(/\/+$/, "");
  const cobaltApiKey = process.env.COBALT_API_KEY;
  const cobaltAuthScheme = process.env.COBALT_AUTH_SCHEME ?? "Api-Key";

  const instances: Array<{
    endpoint: string;
    version: "current" | "legacy";
    headers?: Record<string, string>;
  }> = [];

  if (configuredCobaltUrl) {
    instances.push({
      endpoint: configuredCobaltUrl,
      version: "current",
      headers: cobaltApiKey ? { Authorization: `${cobaltAuthScheme} ${cobaltApiKey}` } : undefined,
    });
  }

  // Best-effort public fallbacks. These are not guaranteed and may rate-limit,
  // go offline, or reject requests depending on the instance owner's policy.
  instances.push(
    { endpoint: "https://co.eepy.today/api/json", version: "legacy" },
    { endpoint: "https://cobalt.hypert.xyz/api/json", version: "legacy" },
  );

  let error = "";
  for (const instance of instances) {
    try {
      const isCurrentApi = instance.version === "current";
      const res = await fetch(instance.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...instance.headers,
        },
        body: JSON.stringify(isCurrentApi
          ? {
            url: trimmedUrl,
            videoQuality: "1080",
            youtubeVideoCodec: "h264",
            filenameStyle: "basic",
          }
          : {
            url: trimmedUrl,
            vQuality: "1080",
            vCodec: "h264",
            isNoWatermark: true,
          }),
      });

      const data = await res.json() as {
        status?: string;
        url?: string;
        text?: string;
        error?: { code?: string };
        picker?: { url: string; type: string }[];
      };

      if (!res.ok) {
        error = data.text || data.error?.code || `${res.status} ${res.statusText}`;
        console.error(`[${logLabel}] Instance ${instance.endpoint} failed:`, error);
        continue;
      }

      if ((data.status === "stream" || data.status === "tunnel" || data.status === "redirect") && data.url) {
        return {
          url: data.url,
          status: "success",
        };
      }

      if (data.status === "picker" && data.picker?.length) {
        const videos = data.picker.filter((p) => p.type === "video").map((p) => p.url);
        const photos = data.picker.filter((p) => p.type === "photo").map((p) => p.url);
        if (videos[0]) {
          return {
            url: videos[0],
            status: "success",
          };
        }
        if (photos.length) {
          return {
            images: photos,
            status: "success",
            type: "gallery",
          };
        }
      }

      error = data.text || data.error?.code || "Failed to extract video.";
    } catch (e) {
      console.error(`[${logLabel}] Instance ${instance.endpoint} failed:`, e);
    }
  }

  // Translate gateway/connectivity failures into the friendly "temporarily unavailable"
  // message regardless of whether we're using the configured instance or the public
  // fallbacks — this also lets the client detect cold starts (e.g. a sleeping free-tier
  // host) and show a countdown instead of a raw "502 Bad Gateway".
  if (/api\.auth|v7 api has been shut down|502|503|504|fetch failed/i.test(error)) {
    throw new ConvexError(unavailableMessage);
  }

  throw new ConvexError(error || failureMessage);
}

export const extractTikTokVideo = action({
  args: { url: v.string(), clientId: v.string() },
  handler: async (ctx, { url, clientId }) => {
    const key = clientId.slice(0, 64);
    const { ok } = await rateLimiter.limit(ctx, "toolGenerate", { key });
    if (!ok) throw new ConvexError("Too many requests. Please wait a moment.");

    const trimmedUrl = url.trim();
    if (!/^https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\//i.test(trimmedUrl)) {
      throw new ConvexError("Please paste a valid TikTok video link.");
    }

    return extractViaCobalt(trimmedUrl, {
      logLabel: "extractTikTokVideo",
      unavailableMessage: "TikTok downloader service is temporarily unavailable. The public extraction services are down or no longer support this API.",
      failureMessage: "TikTok extraction failed. The link might be private, deleted, region-blocked, or unsupported by the downloader service.",
    });
  },
});

export const extractInstagramVideo = action({
  args: { url: v.string(), clientId: v.string() },
  handler: async (ctx, { url, clientId }) => {
    const key = clientId.slice(0, 64);
    const { ok } = await rateLimiter.limit(ctx, "toolGenerate", { key });
    if (!ok) throw new ConvexError("Too many requests. Please wait a moment.");

    const trimmedUrl = url.trim();
    if (!/^https?:\/\/(?:www\.)?instagram\.com\/(?:reel|reels|p|tv|stories)\//i.test(trimmedUrl)) {
      throw new ConvexError("Please paste a valid Instagram Reel, post, or video link.");
    }

    return extractViaCobalt(trimmedUrl, {
      logLabel: "extractInstagramVideo",
      unavailableMessage: "Instagram downloader service is temporarily unavailable. The public extraction services are down or no longer support this API.",
      failureMessage: "Instagram extraction failed. The link might be private, deleted, or unsupported by the downloader service.",
    });
  },
});

export const extractFacebookVideo = action({
  args: { url: v.string(), clientId: v.string() },
  handler: async (ctx, { url, clientId }) => {
    const key = clientId.slice(0, 64);
    const { ok } = await rateLimiter.limit(ctx, "toolGenerate", { key });
    if (!ok) throw new ConvexError("Too many requests. Please wait a moment.");

    const trimmedUrl = url.trim();
    if (!/^https?:\/\/(?:www\.|m\.|web\.)?(?:facebook\.com|fb\.watch)\//i.test(trimmedUrl)) {
      throw new ConvexError("Please paste a valid Facebook video, Reel, or Watch link.");
    }

    return extractViaCobalt(trimmedUrl, {
      logLabel: "extractFacebookVideo",
      unavailableMessage: "Facebook downloader service is temporarily unavailable. The public extraction services are down or no longer support this API.",
      failureMessage: "Facebook extraction failed. The link might be private, deleted, or unsupported by the downloader service.",
    });
  },
});

function parseChannelInput(input: string): { param: "forHandle" | "id"; value: string } {
  const handleFromUrl = input.match(/youtube\.com\/@([^/?&\s]+)/);
  if (handleFromUrl) return { param: "forHandle", value: handleFromUrl[1] };

  const idFromUrl = input.match(/youtube\.com\/channel\/(UC[^/?&\s]+)/);
  if (idFromUrl) return { param: "id", value: idFromUrl[1] };

  if (input.startsWith("@")) return { param: "forHandle", value: input.slice(1) };
  if (input.startsWith("UC")) return { param: "id", value: input };

  return { param: "forHandle", value: input };
}

export const checkYouTubeChannel = action({
  args: { channelInput: v.string(), clientId: v.string() },
  handler: async (ctx, { channelInput, clientId }) => {
    const key = clientId.slice(0, 64);
    const { ok } = await rateLimiter.limit(ctx, "toolGenerate", { key });
    if (!ok) throw new ConvexError("Too many requests. Please wait a moment and try again.");

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new ConvexError("Service not configured.");

    const { param, value } = parseChannelInput(channelInput.trim());
    const params = new URLSearchParams({ part: "snippet,statistics", key: apiKey, [param]: value });

    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params.toString()}`);
    if (!res.ok) {
      const err = await res.text();
      console.error("[checkYouTubeChannel] API error:", res.status, err);
      throw new ConvexError(`YouTube API error (${res.status}). Check the channel URL and try again.`);
    }

    const data = await res.json() as {
      items?: {
        id: string;
        snippet: { title: string; customUrl?: string; thumbnails?: { default?: { url: string } } };
        statistics: { subscriberCount?: string; videoCount?: string; viewCount?: string; hiddenSubscriberCount?: boolean };
      }[];
    };

    const channel = data.items?.[0];
    if (!channel) throw new ConvexError("Channel not found. Try using the full YouTube channel URL or @handle.");

    return {
      id: channel.id,
      name: channel.snippet.title,
      handle: channel.snippet.customUrl ?? null,
      thumbnail: channel.snippet.thumbnails?.default?.url ?? null,
      subscribers: parseInt(channel.statistics.subscriberCount ?? "0"),
      subscribersHidden: channel.statistics.hiddenSubscriberCount ?? false,
      videoCount: parseInt(channel.statistics.videoCount ?? "0"),
      viewCount: parseInt(channel.statistics.viewCount ?? "0"),
    };
  },
});
