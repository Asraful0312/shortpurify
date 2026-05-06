import type { Metadata } from "next";
import { Outfit, Geist_Mono, Bangers, Comic_Relief } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import HotJar from "@/components/hotjar";
import GoogleAnalytics from "@/components/google-analytics";
import CookieConsentBanner from "@/components/cookie-consent";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
});

const comicRelief = Comic_Relief({
  weight: "400",
  variable: "--font-comic-relief",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shortpurify.com"),
  title: {
    default: "ShortPurify | AI Short Clip Generator",
    template: "%s | ShortPurify",
  },
  description:
    "AI short clip generator that turns long videos into viral Shorts. Auto-captions, smart crop for 9:16, publish to TikTok, Instagram & YouTube.",
  alternates: {
    canonical: "https://shortpurify.com",
  },
  keywords: [
    "AI video clips",
    "short-form video",
    "clip generator",
    "TikTok clips",
    "YouTube Shorts",
    "Instagram Reels",
    "AI video editing",
    "video to clips",
    "auto captions",
    "viral clips",
  ],
  applicationName: "ShortPurify",
  authors: [{ name: "ShortPurify" }],
  creator: "ShortPurify",
  publisher: "ShortPurify",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "ShortPurify",
    title: "ShortPurify – AI Short Clip Generator",
    description:
      "AI short clip generator that turns long videos into viral Shorts. Auto-captions, smart crop for 9:16, publish to TikTok, Instagram & YouTube.",
    url: "https://shortpurify.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShortPurify – AI Short-Form Clip Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShortPurify – AI Short-Form Clip Generator",
    description:
      "Turn long-form videos into viral short clips with AI. Auto-generate captions and publish to TikTok, Instagram, YouTube Shorts and more.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "ShortPurify",
                "url": "https://shortpurify.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://shortpurify.com/?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "ShortPurify",
                "url": "https://shortpurify.com",
                "applicationCategory": "VideoApplication",
                "operatingSystem": "Web",
                "description": "AI short clip generator that turns long videos into viral Shorts. Auto-captions, smart crop for 9:16, publish to TikTok, Instagram & YouTube.",
                "offers": [
                  { "@type": "Offer", "name": "Starter", "price": "0", "priceCurrency": "USD" },
                  { "@type": "Offer", "name": "Pro Creator", "price": "24", "priceCurrency": "USD" },
                  { "@type": "Offer", "name": "Agency", "price": "79", "priceCurrency": "USD" }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "ShortPurify Navigation",
                "itemListElement": [
                  { "@type": "SiteLinksSearchBox", "url": "https://shortpurify.com" },
                  { "@type": "ListItem", "position": 1, "name": "Pricing", "url": "https://shortpurify.com/#pricing" },
                  { "@type": "ListItem", "position": 2, "name": "Features", "url": "https://shortpurify.com/#features" },
                  { "@type": "ListItem", "position": 3, "name": "Get Started Free", "url": "https://shortpurify.com/sign-up" },
                  { "@type": "ListItem", "position": 4, "name": "Sign In", "url": "https://shortpurify.com/sign-in" },
                  { "@type": "ListItem", "position": 5, "name": "Contact", "url": "https://shortpurify.com/contact" }
                ]
              }
            ]),
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${geistMono.variable} ${bangers.variable} ${comicRelief.variable} antialiased`}
      >
        <ClerkProvider
          dynamic
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <HotJar />
          <GoogleAnalytics />
          <CookieConsentBanner />
        </ClerkProvider>
      </body>
    </html>
  );
}
