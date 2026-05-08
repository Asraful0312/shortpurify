import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  toolName: string;
  toolHref: string;
}

export default function ToolsBreadcrumb({ toolName, toolHref }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
      <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
      <ChevronRight size={12} className="opacity-40" />
      <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
      <ChevronRight size={12} className="opacity-40" />
      <span className="text-foreground font-medium truncate max-w-[200px]">{toolName}</span>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://shortpurify.com" },
              { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://shortpurify.com/tools" },
              { "@type": "ListItem", "position": 3, "name": toolName, "item": `https://shortpurify.com${toolHref}` },
            ],
          }),
        }}
      />
    </div>
  );
}
