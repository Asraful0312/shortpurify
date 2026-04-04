import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileDashboardHeader } from "@/components/mobile-dashboard-header";
import { SyncUser } from "@/components/sync-user";
import { WorkspaceProvider } from "@/components/workspace-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
    <div className="flex h-screen overflow-hidden bg-secondary/20 font-sans selection:bg-primary/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <DashboardSidebar />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <MobileDashboardHeader />

        {/* Syncs Clerk user → Convex users table on every login */}
        <SyncUser />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          {children}
        </main>
      </div>
    </div>
    </WorkspaceProvider>
  );
}
