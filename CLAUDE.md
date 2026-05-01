# ShortPurify — AI Agent Guide

## Plan / Tier Checks

This is the most error-prone area of the codebase. Read this before touching any feature gate, badge, or export restriction.

---

### The two resolver functions — and when to use each

| Function | Where | What it checks | Use when |
|---|---|---|---|
| `getDirectWorkspaceTier` (query) | `convex/usage.ts` | User's grantedTier **only if they own the workspace** → workspace owner's grantedTier → workspace Creem subscription | UI badges, feature gates in the player/editor — must match sidebar |
| `resolveWorkspaceTier` (internal helper) | `convex/usage.ts` | Current user's grantedTier (any role) → workspace owner's grantedTier → Creem subscription | Internal server-side checks (export watermark, burn limits, project creation) |
| `isPaidPlan` (internalQuery) | `convex/usage.ts` | Calls `resolveWorkspaceTier` — returns `true` when tier ≠ "starter" | Export actions, internalMutations, internalActions |
| `getUsage` (query) | `convex/usage.ts` | Full usage stats + tier via `resolveWorkspaceTier` | Showing usage numbers to the user, NOT for feature gating |

**Key difference:** `getDirectWorkspaceTier` requires the user to be the **owner** of the workspace before their personal grantedTier counts. `resolveWorkspaceTier` grants the user's personal tier regardless of their role. Use `getDirectWorkspaceTier` for all client-side feature gates so they match the sidebar badges.

---

### Tier values

```
"starter"  — free plan (0 paid)
"pro"      — Pro Creator ($24/mo)
"agency"   — Agency ($79/mo)
```

---

### How a user gets a paid tier (cascade order)

For a **workspace** context (`workspaceId` provided to `getDirectWorkspaceTier`):

1. Does the current user have a valid `grantedTier` **AND** are they the `owner` of this workspace? → use it.
2. Does the workspace owner have a valid `grantedTier`? → use it (members inherit from owner).
3. Does the workspace have a direct Creem subscription? → derive tier from `productId`.
4. Default → `"starter"`.

For a **personal** context (no `workspaceId`):

1. Does the user have a valid `grantedTier`? → use it.
2. Does the user have a direct Creem subscription? → derive tier.
3. Default → `"starter"`.

`grantedTier` is valid when `grantedTierExpiry == null || grantedTierExpiry > Date.now()`.

---

### Paid-only feature pattern (client-side badge)

Use `getDirectWorkspaceTier` — same query the sidebar uses:

```typescript
// In a React component
const { activeOrgId } = useWorkspace();
const tier = useQuery(api.usage.getDirectWorkspaceTier, { workspaceId: activeOrgId ?? undefined });
const isFreePlan = !tier || tier === "starter";

// Show badge / disable button when isFreePlan === true
```

**Do NOT** use `usage?.tier` from `getUsage` for feature gates — it cascades the user's personal tier regardless of role and will allow an admin of a starter workspace to bypass workspace-level gates.

---

### Paid-only feature pattern (server-side export / action)

Use `isPaidPlan` internalQuery which correctly calls `resolveWorkspaceTier`:

```typescript
// In an action or mutation
const paid = await ctx.runQuery(internal.usage.isPaidPlan, {
  workspaceId: project.workspaceId ?? undefined,
  fallbackEntityId: project.userId,
});
if (!paid) throw new ConvexError("This feature requires a Pro or Agency plan.");
```

Always prefer passing `workspaceId` when available so workspace-level subscriptions are checked.

---

### Paid-only subtitle template pattern (the comic template incident)

The comic subtitle template (and any future paid-only template) is gated at two layers:

**Layer 1 — client preview badge** (`subtitle-editor.tsx`)
```typescript
// SUBTITLE_TEMPLATES entries have paidOnly?: boolean
// In SubtitleEditor, plan prop comes from getDirectWorkspaceTier (NOT getUsage)
const isPaidTemplate = Boolean(t.paidOnly) && isFreePlan;
// Shows PRO badge; user can still click to preview but cannot export
```

**Layer 2 — export block** (`exportActions.ts`)
```typescript
// Early in exportWithSubtitles handler, after resolving isPaid:
if (settings.template === "comic" && !isPaid) {
  throw new ConvexError("The Comic subtitle template requires a Pro or Agency plan.");
}
```

When adding a new paid template:
1. Add `paidOnly: true` to its `TemplatePreset` in `SUBTITLE_TEMPLATES`.
2. Add its template id to the export block in `exportActions.ts`.
3. No other changes needed — the badge and block are driven by those two sources.

---

### Adding a new plan tier check — checklist

- [ ] Client badge: use `getDirectWorkspaceTier`, compare against `"starter"`
- [ ] Server action/mutation: use `isPaidPlan` internalQuery with `workspaceId`
- [ ] Export actions: check early (before cache lookup) so tier changes invalidate cache via `settingsHash`
- [ ] `grantedTier` is already handled by both resolver functions — do NOT add manual grantedTier checks
- [ ] Never hardcode a Creem product ID in component code — use the tier string

---

### PLAN_LIMITS reference (`convex/usage.ts`)

```typescript
starter: { projects: 2, minutes: 20, maxVideoDurationMinutes: 20, clipsPerProject: 3, subtitleBurnsPerClip: 1 }
pro:     { projects: 30, minutes: 300, maxVideoDurationMinutes: null, clipsPerProject: 8, subtitleBurnsPerClip: 5 }
agency:  { projects: null, minutes: 1500, maxVideoDurationMinutes: null, clipsPerProject: 15, subtitleBurnsPerClip: null }
```

`null` = unlimited.
