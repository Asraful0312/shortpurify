"use client"

import { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import Logo from "./logo";
import useClickOutside from "../motion-primitives/useClickOutside";
import { api } from "@/convex/_generated/api";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const AFFILIATE_JOIN_URL = "https://affiliates.creem.io/join/shortpurify";

const DISMISS_KEY = "sp_affiliate_banner_dismissed";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref as any, () => setIsMobileMenuOpen(false));
  const reviews = useQuery(api.reviews.getApprovedReviews);
  const showTestimonials = (reviews?.length ?? 0) >= 3;
    const [visible, setVisible] = useState(false);
  
    useEffect(() => {
      if (!localStorage.getItem(DISMISS_KEY)) setVisible(true);
    }, []);
  
    function dismiss() {
      localStorage.setItem(DISMISS_KEY, "1");
      setVisible(false);
    }
  

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-4 duration-700">
      {/* Affiliate announcement banner */}
      {visible && (
        <div className="relative bg-linear-to-r from-violet-600 to-indigo-600 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
            <span className="font-semibold hidden sm:inline bg-black px-2 py-1 rounded-full">New:</span>
            <span>
              Earn{" "}
              <span className="font-bold underline underline-offset-2">30% recurring commission</span>
              {" "}for every customer you refer.
            </span>
            <a
              href={AFFILIATE_JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-xs whitespace-nowrap"
            >
              Join affiliate program <ArrowRight size={12} />
            </a>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Floating pill navbar */}
      <div className={cn("flex justify-center px-4 ", visible ? "top-12" : "pt-3")}>
      <header className="w-full max-w-6xl bg-white/95 backdrop-blur-md border border-border/60 shadow-sm rounded-full py-3 px-6 flex items-center justify-between">


<Link href="/">
       <Logo/>
</Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-black transition-colors">Products</Link>
          <Link href="#workflows" className="hover:text-black transition-colors">Workflows</Link>
          <Link href="#how-it-works" className="hover:text-black transition-colors">Solutions</Link>
          {showTestimonials && (
            <Link href="#testimonials" className="hover:text-black transition-colors">Testimonials</Link>
          )}
          <Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Authenticated>
            <Link href="/dashboard" className="text-sm font-medium hover:text-black transition-colors pr-2">
              Dashboard
            </Link>
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal">
              <button className="text-sm cursor-pointer font-medium text-black bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-full transition-colors border border-border/50">
                Sign in
              </button>
            </SignInButton>
            <Link href="/contact" className="cursor-pointer bg-black text-white hover:bg-black/90 px-5 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md">
                Contact
            </Link>
          </Unauthenticated>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-foreground z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div ref={ref} className="absolute top-[calc(100%+12px)] left-0 right-0 mx-4 bg-white border border-border/60 shadow-xl rounded-3xl p-6 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-2 origin-top">
          <nav className="flex flex-col gap-4 text-lg font-semibold text-foreground">
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
            <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>Solutions</Link>
            {showTestimonials && (
              <Link href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</Link>
            )}
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="#workflows" onClick={() => setIsMobileMenuOpen(false)}>Workflows</Link>
          </nav>
          
          <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
            <Authenticated>
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="text-lg font-semibold text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <UserButton />
              </div>
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <button className="w-full text-center text-base font-semibold text-black bg-secondary hover:bg-secondary/80 px-4 py-3 rounded-full transition-colors border border-border/50">
                  Sign in
                </button>
              </SignInButton>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-black text-white hover:bg-black/90 px-5 py-3 rounded-full text-base font-semibold transition-all shadow-md text-center">
                  Contact
              </Link>
             </Unauthenticated>
          </div>
        </div>
      )}
      </div> {/* end flex justify-center pill wrapper */}
    </div>
  );
}

export default Navbar;