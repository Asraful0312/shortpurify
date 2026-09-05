"use client";

import Image from "next/image";
import { AlertTriangle, Download, FileJson, Table2, Users } from "lucide-react";
import ToolsBreadcrumb from "@/components/tools-breadcrumb";
import ToolsCta from "@/components/tools-cta";

const STEPS: { icon: typeof Download; title: string; text: string }[] = [
  {
    icon: Download,
    title: "Request your data from Instagram directly",
    text: "Open Instagram → Settings → Accounts Center → Your information and permissions → Download your information. Choose your account, select \"Some of your information,\" and pick \"Followers and following.\"",
  },
  {
    icon: FileJson,
    title: "Choose JSON or HTML format",
    text: "JSON is best if you plan to process the list with a spreadsheet or script. HTML is easier to just open and read in a browser. Instagram emails you a download link once the export is ready — usually within a few minutes to a few hours.",
  },
  {
    icon: Table2,
    title: "Convert the export to a spreadsheet",
    text: "Once downloaded, open followers_1.json in a text editor or paste it into a free JSON-to-CSV converter to get a clean spreadsheet of usernames — useful for audits, outreach lists, or just archiving your audience.",
  },
  {
    icon: Users,
    title: "Use the list responsibly",
    text: "This export is for your own records. Mass messaging or scraping profile data beyond what you exported can violate Instagram's Terms of Service and get your account restricted.",
  },
];

export default function InstagramFollowerExportTool() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <ToolsBreadcrumb toolName="Instagram Follower Export Tool" toolHref="/tools/instagram-follower-export-tool" />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Image src="/icons/instagram.png" alt="Instagram" width={14} height={14} /> Free Guide
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Instagram Follower Export Tool</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          The safe, official way to export your Instagram followers list — no password sharing required.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-3xl p-5 mb-8 flex gap-3">
        <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-800">Never give your Instagram password to a third-party &quot;export tool.&quot;</p>
          <p className="text-sm text-red-700/80 mt-1">Most browser extensions and websites promising instant follower exports are either credential-phishing scams or bots that get accounts banned for automated activity. Instagram&apos;s own export feature below does the same job safely.</p>
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="bg-white border border-border rounded-2xl p-5 shadow-sm flex gap-4">
              <div className="size-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 font-black text-sm">
                {index + 1}
              </div>
              <div>
                <h3 className="font-extrabold flex items-center gap-2"><Icon size={16} className="text-pink-600" /> {step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{step.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <ToolsCta
        headerText="Know your audience? Now make content for them."
        subText="ShortPurify turns long videos into short, publish-ready Reels and TikToks with AI captions — built to keep the audience you've already grown."
      />
    </main>
  );
}
