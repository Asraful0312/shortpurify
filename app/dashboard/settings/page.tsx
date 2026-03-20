"use client";

import { useState } from "react";
import { Save, Bell, Globe, Shield, Trash2, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    processingComplete: true,
    publishSuccess: true,
    weeklyDigest: false,
    productUpdates: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto w-full min-h-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and integrations.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API & Integrations</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h2 className="font-extrabold">Profile</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold mb-1.5 block">Display Name</label>
                <Input defaultValue="ShortPurify User" className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Email</label>
                <Input defaultValue="user@example.com" type="email" className="rounded-xl" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold mb-1.5 block">Default Caption Language</label>
              <select className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option>English</option>
                <option>Bengali</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Hindi</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold mb-1.5 block">Default Export Format</label>
              <select className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option>9:16 (Vertical — TikTok/Reels/Shorts)</option>
                <option>1:1 (Square — Instagram Feed)</option>
                <option>16:9 (Landscape — YouTube)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <p className="text-sm font-bold">Auto-generate captions</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically add AI captions to every new clip
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <p className="text-sm font-bold">Face-tracking crop</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use Cloudinary g_auto:face for all 9:16 clips
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <button
              onClick={handleSave}
              className="bg-primary text-primary-foreground font-extrabold px-6 py-2.5 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 self-start"
            >
              <Save size={16} />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-extrabold flex items-center gap-2">
              <Bell size={18} /> Notification Preferences
            </h2>
            {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(
              ([key, val]) => {
                const labels: Record<keyof typeof notifications, { title: string; desc: string }> = {
                  processingComplete: { title: "Processing Complete", desc: "Get notified when your AI pipeline finishes" },
                  publishSuccess: { title: "Publish Success", desc: "Confirmation when clips go live on platforms" },
                  weeklyDigest: { title: "Weekly Digest", desc: "Summary of your clips' performance every Monday" },
                  productUpdates: { title: "Product Updates", desc: "New features and improvements from ShortPurify" },
                };
                return (
                  <div key={key} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div>
                      <p className="text-sm font-bold">{labels[key].title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{labels[key].desc}</p>
                    </div>
                    <Switch
                      checked={val}
                      onCheckedChange={(v) => setNotifications((n) => ({ ...n, [key]: v }))}
                    />
                  </div>
                );
              }
            )}
          </div>
        </TabsContent>

        {/* API */}
        <TabsContent value="api">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h2 className="font-extrabold flex items-center gap-2">
              <Globe size={18} /> API & Integrations
            </h2>

            <div>
              <label className="text-sm font-bold mb-1.5 block">Your API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    defaultValue="sp_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                    readOnly
                    className="rounded-xl pr-10 font-mono text-xs"
                  />
                  <button
                    onClick={() => setShowApiKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button className="px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-secondary transition-colors">
                  Regenerate
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Keep this secret. Use it to call the ShortPurify API directly.
              </p>
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Shield size={15} /> Connected Services
              </h3>
              {[
                { name: "UploadThing", desc: "File storage & video uploads", connected: true },
                { name: "Cloudinary", desc: "Smart video transformations", connected: true },
                { name: "Deepgram", desc: "Speech-to-text transcription", connected: true },
                { name: "Upload-Post", desc: "Multi-platform auto-publishing", connected: false },
              ].map(({ name, desc, connected }) => (
                <div
                  key={name}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold">{name}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                      connected
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {connected ? "Connected ✓" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger">
          <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-extrabold text-red-600 flex items-center gap-2">
              <Trash2 size={18} /> Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground">
              These actions are irreversible. Please proceed with caution.
            </p>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50/30">
              <div>
                <p className="text-sm font-bold text-red-700">Delete All Projects</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently remove all projects, clips, and exports.
                </p>
              </div>
              <button className="px-4 py-2 border border-red-300 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors">
                Delete All
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50/30">
              <div>
                <p className="text-sm font-bold text-red-700">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
