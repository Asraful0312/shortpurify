import { ConvexError } from "convex/values";

export function getToolError(err: unknown): string {
  if (err instanceof ConvexError) {
    return typeof err.data === "string" ? err.data : "Something went wrong. Please try again.";
  }
  if (err instanceof Error) {
    // Strip server-side Convex prefix if it leaks into message
    const cleaned = err.message.replace(/^(Uncaught\s+)?ConvexError:\s*/i, "").trim();
    return cleaned || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
