import { WorkflowManager } from "@convex-dev/workflow";
import { api, components, internal } from "./_generated/api";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

const workflowManager = new WorkflowManager(components.workflow);

/**
 * Entry point scheduled by `createProjectAndStart` mutation.
 * Runs as an action so it can call workflowManager.start().
 */
export const kickoff = internalAction({
  args: {
    projectId: v.id("projects"),
    videoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Read enabledPlatforms from the project record
    const project = await ctx.runQuery(api.projects.getProject, {
      projectId: args.projectId,
    });
    const enabledPlatforms = project?.enabledPlatforms ?? undefined;

    const workflowId = await workflowManager.start(
      ctx,
      internal.workflow.processVideo,
      { ...args, enabledPlatforms },
    );
    await ctx.runMutation(internal.projects.updateProjectStatus, {
      projectId: args.projectId,
      status: "processing",
      workflowId: workflowId as unknown as string,
    });
  },
});

/**
 * Durable 4-step pipeline:
 *   1. AssemblyAI transcription → saves transcript to project
 *   2. Claude AI clip ideas (per-platform captions)
 *   3. Save clips with Cloudinary fetch URLs + project thumbnail
 *   4. Mark complete
 */
export const processVideo = workflowManager.define({
  args: {
    projectId: v.id("projects"),
    videoUrl: v.string(),
    enabledPlatforms: v.optional(v.array(v.string())),
  },
  handler: async (step, { projectId, videoUrl, enabledPlatforms }) => {
    // ── Step 1: Transcription ──────────────────────────────────────────
    await step.runMutation(internal.projects.updateProjectStatus, {
      projectId,
      status: "processing",
      processingStep: "Transcribing audio…",
    });

    const transcript = await step.runAction(
      internal.transcription.transcribeVideo,
      { videoUrl },
    );

    // Save transcript to project for the Transcript tab
    await step.runMutation(internal.projects.saveTranscript, {
      projectId,
      transcriptText: transcript.text,
      transcriptWords: transcript.words,
    });

    // ── Step 2: AI Analysis ────────────────────────────────────────────
    await step.runMutation(internal.projects.updateProjectStatus, {
      projectId,
      status: "processing",
      processingStep: "Generating clip ideas with Claude AI…",
    });

    const clips = await step.runAction(internal.ai.generateClipIdeas, {
      transcriptText: transcript.text,
      videoDuration: transcript.duration,
      enabledPlatforms,
    });

    // ── Step 3: Smart crop + encode via Python worker ─────────────────
    await step.runMutation(internal.projects.updateProjectStatus, {
      projectId,
      status: "processing",
      processingStep: "Processing clips (AI crop + FFmpeg)…",
    });

    await step.runAction(internal.videoProcessingActions.saveClipsToDb, {
      projectId,
      videoUrl,
      clips,
    });

    // ── Done ───────────────────────────────────────────────────────────
    await step.runMutation(internal.projects.updateProjectStatus, {
      projectId,
      status: "complete",
      processingStep: "Complete",
      clipsCount: clips.length,
    });
  },
});
