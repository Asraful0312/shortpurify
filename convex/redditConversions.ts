import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const trackSignUp = internalAction({
  args: {
    email: v.optional(v.string()),
    eventAt: v.number(),
  },
  handler: async (_ctx, { email, eventAt }) => {
    const token = process.env.REDDIT_ADS_TOKEN;
    if (!token) return;

    const event: Record<string, unknown> = {
      event_at: eventAt,
      action_source: "website",
      type: { tracking_type: "SignUp" },
    };
    if (email) {
      event.user = { email };
    }

    await fetch(
      "https://ads-api.reddit.com/api/v3/pixels/a2_iw26alqs6d0f/conversion_events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { events: [event] } }),
      }
    );
  },
});
