**Full Architecture + Complete Guideline for Your AI Content Repurposer (ShortPurify – Next.js 15 + Convex + Polar + Upload-Post)**

This is the **final production-ready 2026 architecture** built specifically for Bangladesh devs (Polar for payments + Upload-Post for cheap auto-publishing). You can ship the full MVP (manual + basic auto-publish) in **10–14 days** solo.

### 1. Tech Stack & Required Packages (All 2026 Best-in-Class)

**Core**

- **Next.js 15** (App Router + React Server Components) – frontend dashboard
- **Convex** – backend (real-time DB, auth, serverless functions)
- **TypeScript** + **Tailwind CSS** + **shadcn/ui** + **TanStack Query** – UI + data fetching

**Auth & Billing (Bangladesh-friendly)**

- **Clerk** – social/email auth (Google, etc.)
- **Polar** – subscriptions, webhooks, customer portal, invoices (official Convex component)

**File Handling & Media**

- **UploadThing** – drag-drop video/audio/YouTube URL uploads
- **Cloudinary** – smart video transforms & face-focused cropping (g_auto:face)

**AI & Processing**

- **Anthropic (Claude 3.5 Sonnet / latest)** – content generation + viral scoring
- **Deepgram** – transcription + speaker detection + timestamps
- **Vercel AI SDK** – streaming responses

**Background Jobs & Durability**

- **Convex Workflow component** – durable long-running pipeline
- **Inngest** (optional)

**Auto-Publish (New – Cheap & SaaS-friendly)**

- **Upload-Post** – unified API for posting/scheduling to TikTok, IG Reels, YouTube Shorts, Snapchat Spotlight, LinkedIn, X, etc. (Free tier: 10 uploads/mo, Basic ~$16/mo annual unlimited)

**Other**

- **Resend** – emails
- **Zod** + **React Hook Form** – validation
- **Lucide React** – icons

**Deployment**

- Vercel (frontend)
- Convex (backend)

**Exact npm install command**:

```bash
npx create-next-app@latest shortpurify --typescript --tailwind --eslint --app --yes
cd shortpurify
npx convex init
npm install @convex-dev/polar @convex-dev/workflow @imaxis/cloudinary-convex uploadthing @uploadthing/react clerk @clerk/nextjs @anthropic-ai/sdk deepgram-sdk resend inngest zod lucide-react @tanstack/react-query
npm install -D @types/node
```

### 2. Useful Convex Components (https://www.convex.dev/components)

- `@convex-dev/polar` → Billing (install with `npx convex components add polar`)
- `@convex-dev/workflow` → Durable AI pipeline
- `@imaxis/cloudinary-convex` → Video transforms
- Rate Limiter + Crons (optional)

### 3. Project Structure (Clean & Scalable)

```
shortpurify/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── upload/page.tsx
│   │   └── [projectId]/page.tsx
│   ├── api/ (UploadThing webhooks)
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── upload-dropzone.tsx
│   ├── project-card.tsx
│   └── output-preview.tsx
├── convex/
│   ├── schema.ts
│   ├── projects.ts
│   ├── outputs.ts
│   ├── workflow.ts          # AI + clipping pipeline
│   ├── uploadpost.ts        # ← New: Upload-Post publish logic
│   ├── polar/
│   ├── cloudinary.ts
│   ├── http.ts
│   └── auth.ts
├── lib/
│   ├── utils.ts
│   ├── polar.ts
│   └── ai-prompts.ts
├── hooks/
│   └── use-projects.ts
├── public/
└── convex.json
```

### 4. Core Features + Full Roadmap (2026 Money-Making Plan)

**Phase 1 – MVP (Week 1–2, launch-ready)**

- Clerk + Polar gating
- Upload (YouTube/audio/video via Cloudflare r2)
- Real-time dashboard
- Workflow: AssemblyAI → Claude → Smart clips (custom python code with modal.com)
- Editable previews + ZIP export + copy
- Free tier (3 projects/month)

**Phase 2 – Viral Features (Week 3–4, $1k MRR target)**

- Full Cloudinary smart cropping
- Viral scoring + auto-timestamp clips
- **Basic auto-scheduling via Upload-Post** (free tier for testing)
- Basic analytics

**Phase 3 – Team & Scale (Month 2)**

- Team workspaces
- Full auto-publish (one-click to multiple platforms)
- Usage-based billing via Polar
- Performance dashboard

**Phase 4 – Pro (Month 3+)**

- Bulk publish + advanced scheduling
- Agency plans ($49/mo)

### 5. Architecture Flow (How It All Works)

1. User uploads → **UploadThing** → Convex saves `originalUrl`
2. Workflow triggers (durable):
   - Step 1: Deepgram transcription + speaker detection
   - Step 2: Claude generates captions/scripts/threads + viral scores
   - Step 3: Cloudinary smart clip generation (face-focused 9:16)
3. Outputs saved with `clipUrl` (Cloudinary transformed URL)
4. **Publish Flow** (Phase 2+):
   - User connects accounts via Upload-Post OAuth
   - "Publish" button → Convex calls Upload-Post API (video URL + caption + platforms)
   - Status updated in real-time
5. Polar checks subscription before processing/publishing

**Video Processing (No Re-Upload Needed)**

- Upload once to UploadThing
- Cloudinary uses the public URL in **fetch mode** + `g_auto:face` to prevent face cutoffs
- Lazy transformations (only pay when preview/download happens)

### 6. Convex Schema (Copy-Paste Ready – Updated)

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    /* Clerk sync */
  }),

  projects: defineTable({
    userId: v.id("users"),
    title: v.string(),
    originalUrl: v.string(), // UploadThing URL
    originalSize: v.optional(v.number()),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    workflowId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  outputs: defineTable({
    projectId: v.id("projects"),
    platform: v.string(),
    content: v.string(),
    viralScore: v.optional(v.number()),
    clipUrl: v.string(), // Cloudinary transformed URL
    thumbnailUrl: v.optional(v.string()),
    publishedUrls: v.optional(v.record(v.string(), v.string())), // e.g. { tiktok: "...", instagram: "..." }
    publishedAt: v.optional(v.number()),
    publishStatus: v.optional(
      v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    ),
  }).index("by_project", ["projectId"]),

  socialConnections: defineTable({
    userId: v.id("users"),
    provider: v.string(), // "uploadpost"
    accessToken: v.string(),
    profiles: v.array(
      v.object({ platform: v.string(), profileId: v.string() }),
    ),
  }).index("by_user", ["userId"]),

  // Polar auto-adds subscription tables
});
```

### 7. Quick Start Steps (Do This Today)

1. Run the create command + `npx convex init`
2. Add Clerk + Polar (`npx convex components add polar`)
3. Install the 3 key components (`workflow`, `cloudinary-convex`)
4. Add Upload-Post:
   - Sign up at app.upload-post.com (free tier)
   - Get API key
   - Create `convex/uploadpost.ts` (use the publish example I gave earlier)
5. Build upload page (UploadThing dropzone → Convex mutation)
6. Copy schema + workflow.ts (I can send exact files if needed)
7. Launch on Vercel + post demos on TikTok/Reddit/X

**Total Cost Until 500 Users**: <$15/month (Convex + Polar + Cloudinary + Upload-Post free tier). When you add auto-publish, Upload-Post Basic is only ~$16/mo annual.
