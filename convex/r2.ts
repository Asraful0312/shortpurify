/**
 * r2.ts — Client-facing R2 mutations for the useUploadFile hook.
 * Export generateUploadUrl + syncMetadata via r2.clientApi() as documented.
 */

import { r2 } from "./r2storage";
import type { DataModel } from "./_generated/dataModel";

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
  },
});
