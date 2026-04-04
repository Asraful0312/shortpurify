"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Logo from "@/components/shared/logo";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export function MobileDashboardHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border h-16 shrink-0 shadow-sm z-30">
      <Logo />
      <div className="flex items-center gap-4">
        <UserButton />
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            onClick={() => setOpen(true)}
            className="p-2 -mr-2 text-foreground active:scale-95 transition-transform"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
          <SheetContent side="left" className="p-0 w-[260px] border-none">
            <SheetTitle className="sr-only">Dashboard Navigation Menu</SheetTitle>
            <DashboardSidebar onNavClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
