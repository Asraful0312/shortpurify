"use node";
/**
 * r2Actions.ts — Node.js R2 actions.
 * generateUploadUrl: returns a presigned PUT URL + key for direct browser upload.
 * getServingUrl:     returns a 7-day signed GET URL for a stored R2 key.
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { r2 } from "./r2storage";

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await r2.generateUploadUrl();
  },
});

export const getServingUrl = action({
  args: { key: v.string() },
  handler: async (_ctx, { key }) => {
    return await r2.getUrl(key, { expiresIn: 60 * 60 * 24 * 7 });
  },
});
