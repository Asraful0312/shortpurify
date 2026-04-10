import { Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "./logo";

function Footer() {
  return (
    <footer className="bg-white border-t border-border/60 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
      <Link href="/">
      <Logo/>
      
      </Link>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            © {new Date().getFullYear()} ShortPurify. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            AI features powered by{" "}
            <a
              href="https://www.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
            >
              Claude by Anthropic
            </a>
            . ShortPurify is an independent product and is not affiliated with Anthropic.
          </p>

  
        </div>
        <div className="flex gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer