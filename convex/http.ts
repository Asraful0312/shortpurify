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

// Creem billing webhooks — handles checkout.completed, subscription.*, product.*
// Webhook URL to register in Creem dashboard:
//   https://<your-deployment>.convex.site/creem/events
creem.registerRoutes(http, { path: "/creem/events" });

export default http;
