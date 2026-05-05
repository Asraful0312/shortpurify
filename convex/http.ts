import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { creem } from "./billing";

const http = httpRouter();

/**
 * Facebook OAuth callback.
 * Register this URL in your Facebook App's "Valid OAuth Redirect URIs":
 *   https://{your-deployment}.convex.site/oauth/facebook/callback
 *
 * You can find your Convex site URL in the Convex dashboard, or check
 * the CONVEX_SITE_URL env var that Convex sets automatically.
 */
http.route({
  path: "/oauth/facebook/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDesc = url.searchParams.get("error_description");

    const appUrl = process.env.APP_URL ?? "https://shortpurify.com";

    // User denied the permission dialog
    if (error || !code || !state) {
      console.warn("[facebook callback] denied or missing params:", error, errorDesc);
      return Response.redirect(`${appUrl}/dashboard/publish?error=facebook_denied`, 302);
    }

    try {
      await ctx.runAction(internal.facebookActions.handleCallback, { code, state });
      return Response.redirect(`${appUrl}/dashboard/publish?connected=facebook`, 302);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      console.error("[facebook callback] failed:", msg);
      // Encode error in URL so the frontend can show it
      const params = new URLSearchParams({ error: "facebook_failed", detail: msg });
      return Response.redirect(`${appUrl}/dashboard/publish?${params}`, 302);
    }
  }),
});

/**
 * YouTube OAuth callback.
 * Register this URL in Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs:
 *   https://{your-deployment}.convex.site/oauth/youtube/callback
 */
http.route({
  path: "/oauth/youtube/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code  = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const appUrl = process.env.APP_URL ?? "https://shortpurify.com";

    if (error || !code || !state) {
      console.warn("[youtube callback] denied or missing params:", error);
      return Response.redirect(`${appUrl}/dashboard/publish?error=youtube_denied`, 302);
    }

    try {
      await ctx.runAction(internal.youtubeActions.handleCallback, { code, state });
      return Response.redirect(`${appUrl}/dashboard/publish?connected=youtube`, 302);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      console.error("[youtube callback] failed:", msg);
      const params = new URLSearchParams({ error: "youtube_failed", detail: msg });
      return Response.redirect(`${appUrl}/dashboard/publish?${params}`, 302);
    }
  }),
});

/**
 * TikTok OAuth callback.
 * Register this URL in TikTok Developer Portal → your app → Login Kit → Redirect URI:
 *   https://{your-deployment}.convex.site/oauth/tiktok/callback
 */
http.route({
  path: "/oauth/tiktok/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code  = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const appUrl = process.env.APP_URL ?? "https://shortpurify.com";

    if (error || !code || !state) {
      console.warn("[tiktok callback] denied or missing params:", error);
      return Response.redirect(`${appUrl}/dashboard/publish?error=tiktok_denied`, 302);
    }

    try {
      await ctx.runAction(internal.tiktokActions.handleCallback, { code, state });
      return Response.redirect(`${appUrl}/dashboard/publish?connected=tiktok`, 302);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      console.error("[tiktok callback] failed:", msg);
      const params = new URLSearchParams({ error: "tiktok_failed", detail: msg });
      return Response.redirect(`${appUrl}/dashboard/publish?${params}`, 302);
    }
  }),
});


/**
 * Threads OAuth callback.
 * Add to Meta Developer → your Threads app → Use cases → Customize → Settings → Redirect URI:
 *   https://{your-deployment}.convex.site/oauth/threads/callback
 */
http.route({
  path: "/oauth/threads/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url   = new URL(request.url);
    const code  = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const appUrl = process.env.APP_URL ?? "https://shortpurify.com";

    if (error || !code || !state) {
      console.warn("[threads callback] denied or missing params:", error);
      return Response.redirect(`${appUrl}/dashboard/publish?error=threads_denied`, 302);
    }

    try {
      await ctx.runAction(internal.threadsActions.handleCallback, { code, state });
      return Response.redirect(`${appUrl}/dashboard/publish?connected=threads`, 302);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      console.error("[threads callback] failed:", msg);
      const params = new URLSearchParams({ error: "threads_failed", detail: msg });
      return Response.redirect(`${appUrl}/dashboard/publish?${params}`, 302);
    }
  }),
});

/**
 * Zernio webhook — receives account lifecycle events.
 *
 * Register this URL in your Zernio dashboard → Webhooks:
 *   https://<your-deployment>.convex.site/webhooks/zernio
 *
 * Optionally set ZERNIO_WEBHOOK_SECRET in Convex env vars to verify signatures.
 *
 * Events handled:
 *   account.connected → upserts account into our DB (no manual Refresh needed)
 *   account.disconnected / account.deleted → removes account from our DB
 */
http.route({
  path: "/webhooks/zernio",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Optional signature verification (HMAC-SHA256)
    const secret = process.env.ZERNIO_WEBHOOK_SECRET;
    if (secret) {
      const sig = request.headers.get("x-zernio-signature") ??
                  request.headers.get("x-webhook-signature") ?? "";
      const body = await request.text();
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
      );
      const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
      const expected = Array.from(new Uint8Array(mac))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      if (!sig.includes(expected)) {
        console.warn("[zernio webhook] signature mismatch — rejecting");
        return new Response("Unauthorized", { status: 401 });
      }
      // Body already consumed as text — parse it
      let payload: Record<string, unknown>;
      try { payload = JSON.parse(body); } catch { return new Response("Bad JSON", { status: 400 }); }
      return handleZernioEvent(ctx, payload);
    }

    // No secret configured — parse body directly
    let payload: Record<string, unknown>;
    try { payload = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
    return handleZernioEvent(ctx, payload);
  }),
});

async function handleZernioEvent(
  ctx: Parameters<Parameters<typeof httpAction>[0]>[0],
  payload: Record<string, unknown>
): Promise<Response> {
  const event = (payload.event ?? payload.type ?? payload.eventType) as string | undefined;
  console.log("[zernio webhook] event:", event, JSON.stringify(payload).slice(0, 500));

  // Zernio sends account data under payload.account (not payload.data)
  // e.g. { id, event, account: { accountId, profileId, platform, displayName, ... }, timestamp }
  const acc = (payload.account ?? payload.data ?? {}) as Record<string, unknown>;

  if (event === "account.connected" || event === "account.created") {
    const profileId = (acc.profileId ?? acc.profile) as string | undefined;
    const accountId = (acc.accountId ?? acc._id ?? acc.id) as string | undefined;
    const platform = ((acc.platform ?? acc.type ?? "") as string).toLowerCase();
    const accountName = (acc.displayName ?? acc.accountName ?? acc.name ?? acc.username ?? platform) as string;
    const rawPicture = acc.accountPicture ?? acc.picture ?? acc.profilePicture ?? acc.avatar;
    const accountPicture = typeof rawPicture === "string" ? rawPicture : undefined;

    if (profileId && accountId && platform) {
      const profile = await ctx.runQuery(internal.zernio.getProfileOwner, { profileId });
      if (profile) {
        await ctx.runMutation(internal.zernio.upsertAccount, {
          userId: profile.userId,
          profileId,
          accountId,
          platform,
          accountName,
          accountPicture,
        });
        console.log("[zernio webhook] upserted account:", platform, accountName, accountId);
      } else {
        console.warn("[zernio webhook] no profile owner found for profileId:", profileId);
      }
    } else {
      console.warn("[zernio webhook] account.connected missing fields — profileId:", profileId, "accountId:", accountId, "platform:", platform);
    }
  } else if (event === "account.disconnected" || event === "account.deleted" || event === "account.removed") {
    // Zernio sends accountId (their internal ID string), not _id
    const accountId = (acc.accountId ?? acc._id ?? acc.id) as string | undefined;
    if (accountId) {
      await ctx.runMutation(internal.zernio.deleteAccountByAccountId, { accountId });
      console.log("[zernio webhook] removed account:", accountId);
    } else {
      console.warn("[zernio webhook] account.disconnected missing accountId — payload:", JSON.stringify(acc));
    }
  } else {
    console.log("[zernio webhook] unhandled event type:", event);
  }

  return new Response("ok", { status: 200 });
}

// Creem billing webhooks — handles checkout.completed, subscription.*, product.*
// Webhook URL to register in Creem dashboard:
//   https://<your-deployment>.convex.site/creem/events
creem.registerRoutes(http, { path: "/creem/events" });

export default http;
