/**
 * emails.ts — Transactional emails via Resend.
 *
 * Called internally from tenants.ts invitation hooks.
 * Set RESEND_API_KEY in your Convex environment variables.
 * Set NEXT_PUBLIC_APP_URL (e.g. https://shortpurify.com) for the accept-link base URL.
 */

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendScheduledPostNotification = internalAction({
  args: {
    toEmail: v.string(),
    toName: v.optional(v.string()),
    clipTitle: v.string(),
    platform: v.string(),
    status: v.union(v.literal("published"), v.literal("failed")),
    scheduledAt: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (_ctx, { toEmail, toName, clipTitle, platform, status, scheduledAt, errorMessage }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[emails] RESEND_API_KEY not set — skipping notification");
      return;
    }

    const appUrl = process.env.APP_URL ?? "https://shortpurify.com";
    const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
    const scheduledDate = new Date(scheduledAt).toLocaleString("en-US", {
      month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
    const greeting = toName ? `Hi ${toName.split(" ")[0]},` : "Hi,";

    const isSuccess = status === "published";
    const accentColor = isSuccess ? "#16a34a" : "#dc2626";
    const accentBg = isSuccess ? "#f0fdf4" : "#fef2f2";
    const statusLabel = isSuccess ? "Successfully Published" : "Publish Failed";
    const statusIcon = isSuccess ? "✅" : "❌";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;background:#f6f6f6;margin:0;padding:40px 0;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <div style="background:#1e3a2b;padding:32px 40px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-.5px;">ShortPurify</h1>
    </div>
    <div style="padding:40px;">
      <div style="background:${accentBg};border:1px solid ${accentColor}30;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:22px;">${statusIcon}</span>
        <div>
          <p style="margin:0;font-weight:800;color:${accentColor};font-size:15px;">${statusLabel}</p>
          <p style="margin:4px 0 0;color:#555;font-size:13px;">${platformLabel} · ${scheduledDate}</p>
        </div>
      </div>
      <p style="margin:0 0 8px;color:#555;line-height:1.6;">${greeting}</p>
      <p style="margin:0 0 24px;color:#555;line-height:1.6;">
        ${isSuccess
          ? `Your scheduled clip <strong>"${clipTitle}"</strong> has been published to <strong>${platformLabel}</strong>.`
          : `Your scheduled clip <strong>"${clipTitle}"</strong> failed to publish to <strong>${platformLabel}</strong>.`
        }
      </p>
      ${!isSuccess && errorMessage ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#991b1b;font-family:monospace;">${errorMessage}</p>
      </div>` : ""}
      <a href="${appUrl}/dashboard/schedule"
        style="display:inline-block;background:#1e3a2b;color:#fff;text-decoration:none;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;">
        ${isSuccess ? "View Schedule" : "Retry Post"}
      </a>
      <p style="margin:28px 0 0;color:#aaa;font-size:12px;">
        You're receiving this because you have scheduled post notifications enabled.
        <a href="${appUrl}/dashboard/settings" style="color:#aaa;">Manage preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    const subject = isSuccess
      ? `✅ "${clipTitle}" published to ${platformLabel}`
      : `❌ Scheduled post to ${platformLabel} failed`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ShortPurify <noreply@shortpurify.com>",
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      console.error("[emails] Resend error:", res.status, await res.text());
    }
  },
});

export const sendInvitation = internalAction({
  args: {
    email: v.string(),
    organizationName: v.string(),
    inviterName: v.optional(v.string()),
    role: v.string(),
    invitationId: v.string(),
    expiresAt: v.number(),
  },
  handler: async (_ctx, { email, organizationName, inviterName, role, invitationId, expiresAt }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[emails] RESEND_API_KEY not set — skipping invitation email");
      return;
    }

    const appUrl = process.env.APP_URL ?? "https://shortpurify.com";
    const acceptUrl = `${appUrl}/invite/accept?id=${invitationId}`;
    const expiresDate = new Date(expiresAt).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    const roleLabel = role === "owner" ? "Owner" : role === "admin" ? "Admin" : "Member";
    const inviterLabel = inviterName ? `<strong>${inviterName}</strong>` : "Someone";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;background:#f6f6f6;margin:0;padding:40px 0;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <div style="background:#1e3a2b;padding:32px 40px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-.5px;">ShortPurify</h1>
    </div>
    <div style="padding:40px;">
      <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#111;">You're invited to join a workspace</h2>
      <p style="margin:0 0 24px;color:#555;line-height:1.6;">
        ${inviterLabel} has invited you to join the <strong>${organizationName}</strong> workspace on ShortPurify as a <strong>${roleLabel}</strong>.
      </p>
      <a href="${acceptUrl}"
        style="display:inline-block;background:#1e3a2b;color:#fff;text-decoration:none;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;">
        Accept Invitation
      </a>
      <p style="margin:28px 0 0;color:#888;font-size:13px;">
        This invitation expires on ${expiresDate}. If you weren't expecting this, you can ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ShortPurify <noreply@shortpurify.com>",
        to: [email],
        subject: `You're invited to join ${organizationName} on ShortPurify`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[emails] Resend error:", res.status, body);
    }
  },
});
