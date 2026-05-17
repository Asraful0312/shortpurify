import type { Metadata } from "next";
import { Outfit, Geist_Mono, Bangers, Comic_Relief } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import HotJar from "@/components/hotjar";
import GoogleAnalytics from "@/components/google-analytics";
import CookieConsentBanner from "@/components/cookie-consent";
import RedditPixelEvents from "@/components/reddit-pixel";
import ReferralCapture from "@/components/referral-capture";

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
    "video to clips generator",
    "video to shorts generator",
    "youtube video to shorts",
    "podcast to shorts",
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
    title: "ShortPurify | AI Short Clip Generator",
    description:
      "AI short clip generator that turns long videos into viral Shorts. Auto-captions, smart crop for 9:16, publish to TikTok, Instagram & YouTube.",
    url: "https://shortpurify.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShortPurify | AI Short-Form Clip Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShortPurify | AI Short-Form Clip Generator",
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
                  "target": "https://shortpurify.com/tools?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
                "siteNavigationElement": [
                  { "@type": "SiteNavigationElement", "name": "Get Started Free", "url": "https://shortpurify.com/sign-up" },
                  { "@type": "SiteNavigationElement", "name": "Pricing", "url": "https://shortpurify.com/#pricing" },
                  { "@type": "SiteNavigationElement", "name": "Affiliate Program", "url": "https://shortpurify.com/affiliates" },
                  { "@type": "SiteNavigationElement", "name": "Free Tools", "url": "https://shortpurify.com/tools" },
                  { "@type": "SiteNavigationElement", "name": "Contact", "url": "https://shortpurify.com/contact" },
                ],
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
            ]),
          }}
        />
        {/* Reddit Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_iw26alqs6d0f",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_iw26alqs6d0f');rdt('track','PageVisit');`,
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
          <ReferralCapture />
          <RedditPixelEvents />
          <HotJar />
          <GoogleAnalytics />
          <CookieConsentBanner />
        </ClerkProvider>
      </body>
    </html>
  );
}
