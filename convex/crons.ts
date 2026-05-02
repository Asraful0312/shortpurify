import { cronJobs } from "convex/server";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const crons = cronJobs();

/** Runs once per day at 03:00 UTC — deletes outputs past their expiresAt and their R2 files. */
crons.daily(
  "delete-expired-clips",
  { hourUTC: 3, minuteUTC: 0 },
  internal.r2Actions.deleteExpiredClips,
);

/** Runs once per day at 03:30 UTC — soft-deletes projects past their expiresAt. */
crons.daily(
  "delete-expired-projects",
  { hourUTC: 3, minuteUTC: 30 },
  internal.r2Actions.deleteExpiredProjects,
);

export default crons;

/** Returns up to `limit` outputs whose expiresAt has passed. */
export const getExpiredOutputs = internalQuery({
  args: { now: v.number(), limit: v.number() },
  handler: async (ctx, { now, limit }) => {
    // gte(1) excludes rows with expiresAt=undefined (they sort as the minimum in Convex indexes)
    return ctx.db
      .query("outputs")
      .withIndex("by_expires", (q) => q.gte("expiresAt", 1).lt("expiresAt", now))
      .take(limit);
  },
});

/** Deletes a single output record. */
export const deleteOutput = internalMutation({
  args: { outputId: v.id("outputs") },
  handler: async (ctx, { outputId }) => {
    await ctx.db.delete(outputId);
  },
});

/**
 * Returns up to `limit` projects whose expiresAt has passed and haven't been soft-deleted yet.
 * gte(1) excludes rows where expiresAt is undefined.
 */
export const getExpiredProjects = internalQuery({
  args: { now: v.number(), limit: v.number() },
  handler: async (ctx, { now, limit }) => {
    return ctx.db
      .query("projects")
      .withIndex("by_expires", (q) => q.gte("expiresAt", 1).lt("expiresAt", now))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);
  },
});
