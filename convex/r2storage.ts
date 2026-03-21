import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";

/** Singleton R2 client — reads R2_* env vars set in Convex dashboard. */
export const r2 = new R2(components.r2);

/**
 * Generate a signed serving URL for a stored key.
 * Default expiry: 7 days (plenty for short-lived dashboard sessions).
 */
export async function getClipServingUrl(
  key: string,
  expiresIn = 60 * 60 * 24 * 7,
): Promise<string> {
  return r2.getUrl(key, { expiresIn });
}
