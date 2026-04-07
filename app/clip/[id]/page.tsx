import { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ClipPlayer from "./ClipPlayer";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  
  try {
    const resolvedParams = await params;
    const data = await convex.action(api.publicClip.getPublicClip, { 
      outputId: resolvedParams.id as Id<"outputs"> 
    });

    if (!data) return { title: "Clip Not Found" };

    const appUrl = process.env.APP_URL || "https://shortpurify.com";
    const clipUrl = `${appUrl}/clip/${resolvedParams.id}`;

    return {
      title: data.title,
      description: data.content || data.title,
      openGraph: {
        title: data.title,
        description: data.content || data.title,
        url: clipUrl,
        siteName: "ShortPurify",
        images: [
            {
                url: data.imageUrl,
                width: 720,
                height: 1280,
                alt: data.title,
            }
        ],
        type: "video.other",
        videos: [{ url: data.videoUrl, type: "video/mp4", width: 720, height: 1280 }]
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.content || data.title,
        images: [data.imageUrl],
      }
    };
  } catch (e) {
    return { title: "Clip Not Found" };
  }
}

export default async function ClipPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  
  const resolvedParams = await params;
  const data = await convex.action(api.publicClip.getPublicClip, { 
    outputId: resolvedParams.id as Id<"outputs">
  }).catch(() => null);

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Clip not found or unavailable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <ClipPlayer
          videoUrl={data.videoUrl}
          posterUrl={data.imageUrl !== "https://shortpurify.com/og.jpg" ? data.imageUrl : undefined}
          subtitleWords={data.subtitleWords ?? []}
          subtitleSettings={data.subtitleSettings ?? null}
        />
        <div className="p-6">
          <h1 className="text-xl font-bold text-white mb-2">{data.title}</h1>
          <p className="text-zinc-400 text-sm">{data.content}</p>
        </div>
      </div>
    </div>
  );
}
