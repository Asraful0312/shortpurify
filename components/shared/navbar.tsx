"use client"

import { useState } from "react";
import { Menu, Wand2, X } from "lucide-react";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import Image from "next/image";
import Logo from "./logo";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4 animate-in slide-in-from-top-4 duration-700">
      <header className="w-full bg-white/95 backdrop-blur-md border border-border/60 shadow-sm rounded-full py-3 px-6 flex items-center justify-between">


<Link href="/">
       <Logo/>
</Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-black transition-colors">Products</Link>
          <Link href="#workflows" className="hover:text-black transition-colors">Workflows</Link>
          <Link href="#how-it-works" className="hover:text-black transition-colors">Solutions</Link>
          <Link href="#testimonials" className="hover:text-black transition-colors flex gap-2 items-center">
            Testimonials <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">NEW</span>
          </Link>
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
        <div className="absolute top-[calc(100%+12px)] left-4 right-4 bg-white border border-border/60 shadow-xl rounded-3xl p-6 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-2 origin-top">
          <nav className="flex flex-col gap-4 text-lg font-semibold text-foreground">
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
            <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>Solutions</Link>
            <Link href="#testimonials" className="flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              Testimonials <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md">NEW</span>
            </Link>
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
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-black text-white hover:bg-black/90 px-5 py-3 rounded-full text-base font-semibold transition-all shadow-md text-center">
                  Contact
              </Link>
             </Unauthenticated>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;