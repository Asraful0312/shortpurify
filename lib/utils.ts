import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips the raw Convex error envelope and returns just the user-facing message.
 *
 * Convex errors arrive as strings like:
 *   "[CONVEX A(fn:name)] [Request ID: abc] Server Error\nUncaught ConvexError: Your message\nat handler ..."
 *
 * This extracts "Your message" (or falls back to a generic string).
 */
export function friendlyError(err: unknown, fallback = "Something went wrong"): string {
  const raw = err instanceof Error ? err.message : String(err ?? fallback);
  // Extract the text after "Uncaught ConvexError:" or "Uncaught Error:"
  const match = raw.match(/Uncaught (?:Convex)?Error:\s*([\s\S]+?)(?:\n\s*at |\n\s*Called by|$)/);
  if (match) return match[1].trim();
  // If there's no envelope prefix at all, return the raw message
  return raw.trim() || fallback;
}
