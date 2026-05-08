import Link from "next/link";
import Logo from "./logo";
import { TOOL_CATEGORIES, TOOLS } from "@/lib/tools";

const FOOTER_TOOL_GROUPS = TOOL_CATEGORIES.map((category) => ({
  ...category,
  tools: TOOLS.filter((tool) => tool.category === category.name),
})).filter((category) => category.tools.length > 0);

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/sign-up", label: "Get Started Free" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

function Footer() {
  return (
    <footer className="bg-white border-t border-border/60">
      {/* Main footer grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <Link href="/"><Logo /></Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Turn long videos into viral short clips with AI. Auto-captions, smart crop, and one-click publishing to TikTok, YouTube Shorts &amp; Instagram Reels.
            </p>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              AI features powered by{" "}
              <a
                href="https://www.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
              >
                Claude by Anthropic
              </a>
              .
            </p>
          </div>

          {/* Free Tools */}
          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Free Tools</p>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {FOOTER_TOOL_GROUPS.map((group) => (
                <div key={group.name}>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/70 mb-2">
                    {group.name}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {group.tools.map((tool) => (
                      <li key={tool.href}>
                        <Link href={tool.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {tool.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="sm:col-span-2">
                <Link href="/tools" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  All Free Tools →
                </Link>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Product</p>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Legal</p>
            <ul className="flex flex-col gap-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ShortPurify. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Not affiliated with Anthropic, Google, TikTok, or Meta.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
