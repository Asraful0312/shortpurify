import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { SyncUser } from "@/components/sync-user";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-secondary/20 font-sans selection:bg-primary/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <DashboardSidebar />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border h-16 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="text-primary" size={18} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-primary">ShortPurify</span>
          </div>

          <div className="flex items-center gap-4">
            <UserButton />
            <Sheet>
              <SheetTrigger >
                <button className="p-2 -mr-2 text-foreground active:scale-95 transition-transform" aria-label="Menu">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[260px] border-none">
                 {/* Hidden title for screen readers */}
                 <SheetTitle className="sr-only">Dashboard Navigation Menu</SheetTitle>
                <DashboardSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Syncs Clerk user → Convex users table on every login */}
        <SyncUser />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
