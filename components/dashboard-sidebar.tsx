"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  UploadCloud,
  CreditCard,
  Sparkles,
  BarChart3,
  Send,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const mainNav = [
  { name: "Projects", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create New", href: "/dashboard/upload", icon: UploadCloud },
];

const publishNav = [
  { name: "Publish Hub", href: "/dashboard/publish", icon: Send, badge: "Phase 2" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, badge: "Phase 2" },
];

const teamNav = [
  { name: "Team", href: "/dashboard/team", icon: Users, badge: "Phase 3" },
];

const accountNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

function NavGroup({
  label,
  items,
  pathname,
}: {
  label?: string;
  items: { name: string; href: string; icon: React.ElementType; badge?: string }[];
  pathname: string;
}) {
  return (
    <div className="mb-2">
      {label && (
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 mb-1">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon
                size={18}
                className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground")}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && !isActive && (
                <span className="text-[9px] font-extrabold uppercase tracking-wide bg-accent/20 text-accent px-1.5 py-0.5 rounded-full border border-accent/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-border bg-white px-4 py-6">
      {/* Brand */}
      <Image className="mb-8" src="/logo.png" alt="Logo" width={100} height={100} />

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto">
        <NavGroup items={mainNav} pathname={pathname} />
        <NavGroup label="Publish" items={publishNav} pathname={pathname} />
        <NavGroup label="Team" items={teamNav} pathname={pathname} />
        <NavGroup label="Account" items={accountNav} pathname={pathname} />
      </nav>

      {/* User Area */}
      <div className="mt-auto border-t border-border pt-4 px-2 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">My Account</span>
            <span className="text-xs font-medium text-muted-foreground truncate w-28">
              Manage Profile
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
