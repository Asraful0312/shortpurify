/**
 * usage.ts — Plan limits + monthly usage tracking.
 *
 * Plan limits are derived from the active Creem subscription (product ID → tier).
 * Usage is counted from the projects table using createdAt >= start of billing month.
 *
 * KEY RULES:
 *  - Deletion does NOT reset usage. Limits apply to projects *created* this month.
 *  - Video minutes = sum of durationSeconds / 60 for projects created this month.
 *  - Agency plan has unlimited projects but still caps minutes at 1500/mo.
 */

import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { creem } from "./billing";

export { PLAN_LIMITS };

// Creem product ID → plan tier mapping.
// Update these when you create products in the Creem dashboard.
const PRODUCT_PLAN_MAP: Record<string, "pro" | "agency"> = {
  prod_2XWg0m0jgCJqg0f4HjLvzT: "pro",    // Pro Monthly
  prod_37OuTfnzhHVjvf5ljEAB8F: "pro",    // Pro Yearly
  prod_17EgXmdXdpntOArieGAc14: "agency", // Agency Monthly
  prod_77Pg3SXfh59ALQbNCFDsID: "agency", // Agency Yearly
};

export type PlanTier = "starter" | "pro" | "agency";

/** All platforms are available on all plans. */
export const STARTER_PLATFORMS = ["youtube", "tiktok"] as const; // kept for reference only

const PLAN_LIMITS: Record<PlanTier, {
  projects: number;
  minutes: number;
  /** Max duration of a single input video in minutes. Infinity = no cap. */
  maxVideoDurationMinutes: number;
  /** Allowed platforms — null means all platforms */
  platforms: string[] | null;
  /** Max connected accounts per platform */
  accountsPerPlatform: number;
  /** Max total team members in a workspace (including owner) */
  teamMembers: number;
  /** Whether scheduled publishing is allowed */
  scheduledPublishing: boolean;
  /** Max workspaces the user can own (1 = personal only) */
  maxOwnedWorkspaces: number;
  /** Max AI-generated clips per project */
  clipsPerProject: number;
  /** Max subtitle re-renders per clip (Infinity = unlimited) */
  subtitleBurnsPerClip: number;
  /** Whether zip bulk-download is available */
  zipExport: boolean;
  /** How long clips are retained in R2 storage (days). Infinity = forever. */
  clipRetentionDays: number;
}> = {
  starter: { projects: 2,        minutes: 20,   maxVideoDurationMinutes: 10,       platforms: null, accountsPerPlatform: 1,        teamMembers: 1,        scheduledPublishing: false, maxOwnedWorkspaces: 1,        clipsPerProject: 3,  subtitleBurnsPerClip: 3,        zipExport: false, clipRetentionDays: 7   },
  pro:     { projects: 30,       minutes: 300,  maxVideoDurationMinutes: Infinity,  platforms: null, accountsPerPlatform: 3,        teamMembers: 3,        scheduledPublishing: true,  maxOwnedWorkspaces: 1,        clipsPerProject: 8,  subtitleBurnsPerClip: 10,       zipExport: true,  clipRetentionDays: 90  },
  agency:  { projects: Infinity, minutes: 1500, maxVideoDurationMinutes: Infinity,  platforms: null, accountsPerPlatform: Infinity, teamMembers: Infinity, scheduledPublishing: true,  maxOwnedWorkspaces: Infinity, clipsPerProject: 15, subtitleBurnsPerClip: Infinity, zipExport: true,  clipRetentionDays: 365 },
};

/** Start of the current calendar month in ms. Billing resets on the 1st. */
function startOfMonth(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

/** Resolve plan tier from Creem subscription product ID. */
function tierFromProductId(productId: string | null | undefined): PlanTier {
  if (!productId) return "starter";
  return PRODUCT_PLAN_MAP[productId] ?? "starter";
}

/**
 * Resolves the Creem entity ID to use for subscription lookup.
 *
 * The Agency plan covers ALL workspaces owned by the user — you buy it once
 * and all your client workspaces inherit the same plan. Only the first
 * (personal) workspace has the actual Creem subscription record; additional
 * workspaces must cascade to the owner's subscription.
 *
 * Resolution order:
 *   1. The workspace's own subscription (if it has one).
 *   2. Any other workspace owned by the same owner that has a subscription.
 *   3. Fall back to `fallbackId` (userId) → Starter.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveEntityId(ctx: any, workspaceId: string | undefined, fallbackId: string): Promise<string> {
  if (!workspaceId) {
    // No workspaceId provided — check if the user owns a workspace with an active subscription
    // (platform actions don't pass workspaceId, so we cascade from userId → owned workspace)
    const ownedMembership = await ctx.db
      .query("workspaceMembers")
      .filter((q: any) => q.and(
        q.eq(q.field("userId"), fallbackId),
        q.eq(q.field("role"), "owner")
      ))
      .first();
    if (ownedMembership) {
      const sub = await creem.subscriptions.getCurrent(ctx, { entityId: ownedMembership.workspaceId }).catch(() => null);
      if (sub) return ownedMembership.workspaceId;
    }
    return fallbackId;
  }

  // 1. Try the workspace's own subscription
  const ownSub = await creem.subscriptions.getCurrent(ctx, { entityId: workspaceId }).catch(() => null);
  if (ownSub) return workspaceId;

  // 2. Find the workspace owner and check their other workspaces
  const members: { clerkId: string; role: string }[] = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();
  const ownerClerkId = members.find((m) => m.role === "owner")?.clerkId;
  if (!ownerClerkId) return fallbackId;

  const ownerMemberships: { workspaceId: string; role: string }[] = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_clerk_workspace", (q: any) => q.eq("clerkId", ownerClerkId))
    .collect();

  for (const m of ownerMemberships) {
    if (m.role !== "owner" || m.workspaceId === workspaceId) continue;
    const sub = await creem.subscriptions.getCurrent(ctx, { entityId: m.workspaceId }).catch(() => null);
    if (sub) return m.workspaceId;
  }

  return workspaceId; // No subscription found — defaults to Starter
}

/**
 * Returns current plan tier + monthly usage for a user/workspace.
 * Used by the billing page and dashboard stats card.
 */
export const getUsage = query({
  args: { workspaceId: v.optional(v.string()) },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    // ── Manual plan override (collaborations / gifted access) ────────────
    const nowMs = Date.now();
    const hasValidOverride =
      user.grantedTier &&
      (user.grantedTierExpiry == null || user.grantedTierExpiry > nowMs);

    if (hasValidOverride) {
      const tier = user.grantedTier as PlanTier;
      const limits = PLAN_LIMITS[tier];
      const monthStart = startOfMonth();
      let projectsThisMonth: { durationSeconds?: number }[] = [];
      if (workspaceId) {
        const members = await ctx.db.query("workspaceMembers").withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId)).collect();
        const all = await Promise.all(members.map((m) => ctx.db.query("projects").withIndex("by_user", (q) => q.eq("userId", m.userId)).filter((q) => q.gte(q.field("createdAt"), monthStart)).collect()));
        projectsThisMonth = all.flat();
      } else {
        projectsThisMonth = await ctx.db.query("projects").withIndex("by_user", (q) => q.eq("userId", user._id)).filter((q) => q.gte(q.field("createdAt"), monthStart)).collect();
      }
      const projectsUsed = projectsThisMonth.length;
      const minutesUsed = Math.round(projectsThisMonth.reduce((s, p) => s + (p.durationSeconds ?? 0), 0) / 60);
      const overrideResetDate = new Date();
      const resetDateStr = new Date(overrideResetDate.getFullYear(), overrideResetDate.getMonth() + 1, 1).toLocaleDateString("en-US", { month: "long", day: "numeric" });
      return {
        tier,
        limits: {
          projects: limits.projects === Infinity ? null : limits.projects,
          minutes: limits.minutes,
          teamMembers: limits.teamMembers === Infinity ? null : limits.teamMembers,
          scheduledPublishing: limits.scheduledPublishing,
          clipsPerProject: limits.clipsPerProject,
          subtitleBurnsPerClip: limits.subtitleBurnsPerClip === Infinity ? null : limits.subtitleBurnsPerClip,
          zipExport: limits.zipExport,
        },
        usage: { projectsUsed, minutesUsed, memberCount: 1 },
        subscription: null,
        resetDate: resetDateStr,
      };
    }
    // ─────────────────────────────────────────────────────────────────────

    // Resolve entity for Creem lookup — cascades to owner's subscription if workspace has none
    const entityId = await resolveEntityId(ctx, workspaceId, user._id as string);

    // Get subscription from Creem internal tables (reads local DB, not API call).
    // Wrapped in try/catch: creem throws "Product not found" if syncProducts hasn't run yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subscription: any = null;
    try {
      subscription = await creem.subscriptions.getCurrent(ctx, { entityId });
    } catch {
      // Products not yet synced — treat as starter until syncBillingProducts is run
    }
    const tier = tierFromProductId(subscription?.productId);
    const limits = PLAN_LIMITS[tier];

    const monthStart = startOfMonth();

    // Count projects created this month for this user/workspace
    // (workspace mode: count projects for all workspace members)
    let projectsThisMonth: { durationSeconds?: number }[] = [];

    if (workspaceId) {
      const members = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();

      const allProjects = await Promise.all(
        members.map((m) =>
          ctx.db
            .query("projects")
            .withIndex("by_user", (q) => q.eq("userId", m.userId))
            .filter((q) => q.gte(q.field("createdAt"), monthStart))
            .collect()
        )
      );
      projectsThisMonth = allProjects.flat();
    } else {
      projectsThisMonth = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.gte(q.field("createdAt"), monthStart))
        .collect();
    }

    const projectsUsed = projectsThisMonth.length;
    const minutesUsed = Math.round(
      projectsThisMonth.reduce((sum, p) => sum + (p.durationSeconds ?? 0), 0) / 60
    );

    // Count workspace members for team limit display
    const memberCount = workspaceId
      ? (await ctx.db
          .query("workspaceMembers")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .collect()).length
      : 1;

    // Next reset date = 1st of next month
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      tier,
      limits: {
        projects: limits.projects === Infinity ? null : limits.projects,
        minutes: limits.minutes,
        teamMembers: limits.teamMembers === Infinity ? null : limits.teamMembers,
        scheduledPublishing: limits.scheduledPublishing,
        clipsPerProject: limits.clipsPerProject,
        subtitleBurnsPerClip: limits.subtitleBurnsPerClip === Infinity ? null : limits.subtitleBurnsPerClip,
        zipExport: limits.zipExport,
      },
      usage: { projectsUsed, minutesUsed, memberCount },
      resetDate: resetDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      subscription: subscription
        ? {
            productId: subscription.productId,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
    };
  },
});

/**
 * Internal query — returns true when the user/workspace is on a paid plan.
 * Used by export actions to decide whether to burn a watermark.
 * Pass workspaceId when the project belongs to a workspace; fallbackEntityId = userId otherwise.
 * Cascades to the workspace owner's subscription if the workspace has no direct subscription.
 */
/** Internal: returns max clips allowed per project for a user/workspace. */
export const getClipsLimit = internalQuery({
  args: { workspaceId: v.optional(v.string()), fallbackEntityId: v.string() },
  handler: async (ctx, { workspaceId, fallbackEntityId }) => {
    // Check manual override on the user record first
    const user = await ctx.db.get(fallbackEntityId as import("./_generated/dataModel").Id<"users">).catch(() => null);
    if (user?.grantedTier && (user.grantedTierExpiry == null || user.grantedTierExpiry > Date.now())) {
      return PLAN_LIMITS[user.grantedTier].clipsPerProject;
    }
    const entityId = await resolveEntityId(ctx, workspaceId, fallbackEntityId);
    const sub = await creem.subscriptions.getCurrent(ctx, { entityId }).catch(() => null);
    const tier = tierFromProductId(sub?.productId);
    return PLAN_LIMITS[tier].clipsPerProject;
  },
});

/** Internal: returns max subtitle burns allowed per clip (null = unlimited). */
export const getBurnLimit = internalQuery({
  args: { workspaceId: v.optional(v.string()), fallbackEntityId: v.string() },
  handler: async (ctx, { workspaceId, fallbackEntityId }) => {
    // Check manual override on the user record first
    const user = await ctx.db.get(fallbackEntityId as import("./_generated/dataModel").Id<"users">).catch(() => null);
    if (user?.grantedTier && (user.grantedTierExpiry == null || user.grantedTierExpiry > Date.now())) {
      const limit = PLAN_LIMITS[user.grantedTier].subtitleBurnsPerClip;
      return limit === Infinity ? null : limit;
    }
    const entityId = await resolveEntityId(ctx, workspaceId, fallbackEntityId);
    const sub = await creem.subscriptions.getCurrent(ctx, { entityId }).catch(() => null);
    const tier = tierFromProductId(sub?.productId);
    const limit = PLAN_LIMITS[tier].subtitleBurnsPerClip;
    return limit === Infinity ? null : limit;
  },
});

export const isPaidPlan = internalQuery({
  args: { workspaceId: v.optional(v.string()), fallbackEntityId: v.string() },
  handler: async (ctx, { workspaceId, fallbackEntityId }) => {
    // Check manual override first — granted tier counts as paid
    const user = await ctx.db.get(fallbackEntityId as import("./_generated/dataModel").Id<"users">).catch(() => null);
    if (user?.grantedTier && (user.grantedTierExpiry == null || user.grantedTierExpiry > Date.now())) {
      return true;
    }
    const entityId = await resolveEntityId(ctx, workspaceId, fallbackEntityId);
    const subscription = await creem.subscriptions.getCurrent(ctx, { entityId }).catch(() => null);
    const tier = tierFromProductId(subscription?.productId ?? null);
    return tier !== "starter";
  },
});

/**
 * Internal query — checks if a user/workspace can create another project.
 * Enforces both project count limit and video-minute limit.
 *
 * @param estimatedDurationMinutes - If known upfront (YouTube info, client-side video metadata),
 *   also verify they have enough remaining minutes for this specific video.
 */
export const canCreateProject = internalQuery({
  args: {
    userId: v.id("users"),
    workspaceId: v.optional(v.string()),
    estimatedDurationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, { userId, workspaceId, estimatedDurationMinutes }) => {
    const user = await ctx.db.get(userId);
    if (!user) return { allowed: false, reason: "User not found", limitType: "unknown" as const };

    const entityId = await resolveEntityId(ctx, workspaceId, userId);
    const subscription = await creem.subscriptions.getCurrent(ctx, { entityId });
    const tier = tierFromProductId(subscription?.productId);
    const limits = PLAN_LIMITS[tier];
    const planName = tier === "starter" ? "Free" : tier === "pro" ? "Pro Creator" : "Agency";

    const monthStart = startOfMonth();
    const projectsThisMonth = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("createdAt"), monthStart))
      .collect();

    // ── Project count check ──────────────────────────────────────────────
    if (limits.projects !== Infinity && projectsThisMonth.length >= limits.projects) {
      return {
        allowed: false,
        tier,
        limitType: "projects" as const,
        reason: `${planName} plan limit of ${limits.projects} projects/month reached. Upgrade to continue.`,
      };
    }

    // ── Per-video duration cap ───────────────────────────────────────────
    if (estimatedDurationMinutes !== undefined && limits.maxVideoDurationMinutes !== Infinity) {
      if (estimatedDurationMinutes > limits.maxVideoDurationMinutes) {
        return {
          allowed: false,
          tier,
          limitType: "duration" as const,
          reason: `The Free plan supports videos up to ${limits.maxVideoDurationMinutes} minutes. This video is ~${Math.round(estimatedDurationMinutes)} min. Upgrade to Pro for unlimited video length.`,
        };
      }
    }

    // ── Monthly minute check (only when duration is known) ──────────────
    if (estimatedDurationMinutes !== undefined) {
      const minutesUsedThisMonth = Math.round(
        projectsThisMonth.reduce((sum, p) => sum + (p.durationSeconds ?? 0), 0) / 60
      );
      const remainingMinutes = limits.minutes - minutesUsedThisMonth;

      if (estimatedDurationMinutes > remainingMinutes) {
        return {
          allowed: false,
          tier,
          limitType: "minutes" as const,
          reason: remainingMinutes <= 0
            ? `You've used all ${limits.minutes} video minutes on the ${planName} plan this month. Upgrade or wait until next month.`
            : `This video is ~${estimatedDurationMinutes} min but you only have ${remainingMinutes} min left this month on the ${planName} plan. Upgrade for more.`,
        };
      }
    }

    return { allowed: true as const, tier };
  },
});

/**
 * Internal query — checks if a user can connect a social platform account.
 * Enforces:
 *   - Platform availability (Starter: YouTube + TikTok only)
 *   - Per-platform account limit (Starter: 1, Pro: 3, Agency: unlimited)
 */
export const canConnectPlatform = internalQuery({
  args: {
    userId: v.id("users"),
    workspaceId: v.optional(v.string()),
    platform: v.string(),
  },
  handler: async (ctx, { userId, workspaceId, platform }) => {
    const entityId = await resolveEntityId(ctx, workspaceId, userId);
    const subscription = await creem.subscriptions.getCurrent(ctx, { entityId }).catch(() => null);
    const tier = tierFromProductId(subscription?.productId);
    const limits = PLAN_LIMITS[tier];
    const planName = tier === "starter" ? "Free" : tier === "pro" ? "Pro Creator" : "Agency";

    // ── Platform availability ────────────────────────────────────────────
    if (limits.platforms !== null && !limits.platforms.includes(platform)) {
      return {
        allowed: false as const,
        tier,
        reason: `${platform.charAt(0).toUpperCase() + platform.slice(1)} publishing requires the Pro Creator plan or higher. Upgrade to connect all 9 platforms.`,
      };
    }

    // ── Per-platform account limit ───────────────────────────────────────
    if (limits.accountsPerPlatform !== Infinity) {
      const existing = await ctx.db
        .query("socialTokens")
        .withIndex("by_user_platform", (q) => q.eq("userId", userId).eq("platform", platform))
        .collect();

      if (existing.length >= limits.accountsPerPlatform) {
        return {
          allowed: false as const,
          tier,
          reason: limits.accountsPerPlatform === 1
            ? `The ${planName} plan allows 1 ${platform} account. Disconnect the existing one first, or upgrade to connect multiple accounts.`
            : `The ${planName} plan allows up to ${limits.accountsPerPlatform} ${platform} accounts. Upgrade to connect more.`,
        };
      }
    }

    return { allowed: true as const, tier };
  },
});

/**
 * Internal query — checks if a workspace can invite another team member.
 * Enforces per-plan team size limits.
 */
export const canInviteMember = internalQuery({
  args: { workspaceId: v.string() },
  handler: async (ctx, { workspaceId }) => {
    const entityId = await resolveEntityId(ctx, workspaceId, workspaceId);
    const subscription = await creem.subscriptions.getCurrent(ctx, { entityId }).catch(() => null);
    const tier = tierFromProductId(subscription?.productId);
    const limits = PLAN_LIMITS[tier];
    const planName = tier === "starter" ? "Free" : tier === "pro" ? "Pro Creator" : "Agency";

    if (limits.teamMembers === 1) {
      return {
        allowed: false as const,
        tier,
        reason: "The Free plan does not support team members. Upgrade to Pro Creator to invite your team.",
      };
    }

    if (limits.teamMembers !== Infinity) {
      const members = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();

      if (members.length >= limits.teamMembers) {
        return {
          allowed: false as const,
          tier,
          reason: `The ${planName} plan allows up to ${limits.teamMembers} team members. Upgrade to Agency for unlimited seats.`,
        };
      }
    }

    return { allowed: true as const, tier };
  },
});

/**
 * Internal query — checks if a user/workspace can use scheduled publishing.
 * Only Pro and Agency plans support scheduled publishing.
 */
export const canSchedulePost = internalQuery({
  args: { userId: v.id("users"), workspaceId: v.optional(v.string()) },
  handler: async (ctx, { userId, workspaceId }) => {
    const entityId = await resolveEntityId(ctx, workspaceId, userId);
    const subscription = await creem.subscriptions.getCurrent(ctx, { entityId }).catch(() => null);
    const tier = tierFromProductId(subscription?.productId);
    const limits = PLAN_LIMITS[tier];

    if (!limits.scheduledPublishing) {
      return {
        allowed: false as const,
        tier,
        reason: "Scheduled publishing requires the Pro Creator plan or higher. Upgrade to schedule posts.",
      };
    }

    return { allowed: true as const, tier };
  },
});

/** Shared logic for workspace creation check — used by both the internal and public queries. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _checkCanCreateWorkspace(ctx: any, clerkId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .unique();
  if (!user) return { allowed: false as const, tier: "starter" as PlanTier, reason: "User not found" };

  // Count workspaces the user currently owns
  const allMemberships = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_clerk_workspace", (q: any) => q.eq("clerkId", clerkId))
    .collect();
  const ownedCount = (allMemberships as { role: string }[]).filter((m) => m.role === "owner").length;

  // Derive tier from the subscription on the primary (first owned) workspace
  const primaryWorkspaceId =
    (allMemberships as { role: string; workspaceId: string }[]).find((m) => m.role === "owner")?.workspaceId ?? user._id;
  const subscription = await creem.subscriptions.getCurrent(ctx, { entityId: primaryWorkspaceId }).catch(() => null);
  const tier = tierFromProductId(subscription?.productId);
  const limits = PLAN_LIMITS[tier];

  if (limits.maxOwnedWorkspaces !== Infinity && ownedCount >= limits.maxOwnedWorkspaces) {
    return {
      allowed: false as const,
      tier,
      reason: "Multiple workspaces require the Agency plan. Upgrade to create additional workspaces.",
    };
  }

  return { allowed: true as const, tier };
}

/**
 * Internal query — resolves the plan tier for a given userId + optional workspaceId.
 * Used by saveOutput to determine clip retention expiry at creation time.
 */
export const getTierForUser = internalQuery({
  args: { userId: v.id("users"), workspaceId: v.optional(v.string()) },
  handler: async (ctx, { userId, workspaceId }): Promise<PlanTier> => {
    const user = await ctx.db.get(userId);
    if (!user) return "starter";
    // Check manual override first
    if (user.grantedTier && (user.grantedTierExpiry == null || user.grantedTierExpiry > Date.now())) {
      return user.grantedTier as PlanTier;
    }
    const entityId = await resolveEntityId(ctx, workspaceId, userId as string);
    const sub = await creem.subscriptions.getCurrent(ctx, { entityId }).catch(() => null);
    return tierFromProductId(sub?.productId);
  },
});

/**
 * Internal query — called from the onOrganizationCreated hook in tenants.ts.
 * At hook time the new workspace hasn't been added to workspaceMembers yet,
 * so the count reflects workspaces owned BEFORE this creation attempt.
 */
export const canCreateWorkspaceForUser = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => _checkCanCreateWorkspace(ctx, clerkId),
});

/**
 * Public query — frontend uses this to decide whether to show
 * the create workspace form or an upgrade prompt.
 */
export const canCreateWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { allowed: false as const, tier: "starter" as PlanTier, reason: "Not authenticated" };
    return _checkCanCreateWorkspace(ctx, identity.subject);
  },
});
