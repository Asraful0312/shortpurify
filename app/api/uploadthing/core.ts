import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "64MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  // Used by the Modal Python worker to store processed clips.
  // No Clerk auth — validated via WORKER_SECRET header instead.
  processedClipUploader: f({
    video: { maxFileSize: "512MB", maxFileCount: 1 },
    image: { maxFileSize: "16MB",  maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const secret = req.headers.get("x-worker-secret") ?? "";
      if (!process.env.WORKER_SECRET || secret !== process.env.WORKER_SECRET) {
        throw new UploadThingError("Unauthorized");
      }
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
