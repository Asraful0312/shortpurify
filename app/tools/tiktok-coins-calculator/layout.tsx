import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TikTok Coins to USD Calculator | Real-Time Gift Value 2025",
  description: "Calculate the exact value of TikTok coins in USD. Convert coins to dollars for buying or creator payouts. Free, real-time TikTok gift value calculator for 2025.",
  keywords: [
    "tiktok coins to usd",
    "tiktok coin calculator",
    "tiktok gift value 2025",
    "how much is 1 tiktok coin",
    "tiktok diamond to usd",
    "tiktok money calculator",
    "buy tiktok coins cheap",
    "tiktok universe gift price",
    "tiktok lion gift price",
  ],
  alternates: { canonical: "https://shortpurify.com/tools/tiktok-coins-calculator" },
  openGraph: {
    title: "TikTok Coins to USD Calculator | Real-Time Gift Value 2025",
    description: "Calculate the exact value of TikTok coins in USD. Convert coins to dollars for buying or creator payouts instantly.",
    url: "https://shortpurify.com/tools/tiktok-coins-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Coins to USD Calculator | Real-Time Gift Value 2025",
    description: "Calculate the exact value of TikTok coins in USD. Convert coins to dollars for buying or creator payouts instantly.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "TikTok Coins to USD Calculator",
            "url": "https://shortpurify.com/tools/tiktok-coins-calculator",
            "description": "Calculate the exact value of TikTok coins in USD. Convert coins to dollars for buying or creator payouts instantly.",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "creator": { "@type": "Organization", "name": "ShortPurify", "url": "https://shortpurify.com" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How much is 1 TikTok coin worth in USD?","acceptedAnswer":{"@type":"Answer","text":"1 TikTok coin costs approximately $0.015 USD (1.5 cents) to buy. For creators receiving gifts, 1 coin becomes 1 Diamond, which TikTok values at $0.005 USD after taking their 50% cut. So creators receive about half the purchase value of any gift."}},{"@type":"Question","name":"How much does the TikTok Universe gift cost?","acceptedAnswer":{"@type":"Answer","text":"The TikTok Universe gift costs 34,999 coins, which is approximately $532 USD to purchase. The creator receiving it earns roughly $175 USD after TikTok's 50% commission."}},{"@type":"Question","name":"How do I buy TikTok coins cheaper?","acceptedAnswer":{"@type":"Answer","text":"Buy TikTok coins on the TikTok website (tiktok.com/coin) instead of the iOS or Android app. Apple and Google charge TikTok a 30% platform fee on in-app purchases, which gets passed to you. Buying on the web can save you up to 31%."}},{"@type":"Question","name":"How do TikTok Diamonds work?","acceptedAnswer":{"@type":"Answer","text":"When viewers send gifts during a LIVE or on a video, those gifts convert to Diamonds in the creator's account. TikTok takes approximately 50% of the coin value as their commission. Creators can withdraw Diamonds as real money once they reach the minimum threshold ($50 USD on most accounts)."}},{"@type":"Question","name":"What is the minimum withdrawal for TikTok Diamonds?","acceptedAnswer":{"@type":"Answer","text":"The minimum withdrawal amount for TikTok Diamonds is $50 USD in most regions. Withdrawals are processed through PayPal or local bank transfers depending on your country. Processing can take 3–15 business days."}}]}),
        }}
      />
      <div className="min-h-screen bg-[#FAFAF8]">
        {children}
        <div className="max-w-3xl mx-auto px-4 pb-14">
          <div className="prose prose-sm max-w-none text-muted-foreground border-t border-border pt-12">
            <h2 className="text-foreground font-extrabold text-2xl">TikTok Coins to USD: Everything You Need to Know</h2>
            <p>TikTok coins are the virtual currency used on the platform to support your favorite creators. Whether you&apos;re looking to send a Rose, a Galaxy, or the famous TikTok Universe gift, understanding the conversion rate is essential.</p>
            <h3 className="text-foreground font-bold text-lg mt-6">How much is 1 TikTok coin worth?</h3>
            <p>The value of a TikTok coin depends on whether you are buying it or receiving it as a creator:</p>
            <ul>
              <li><strong>Buying:</strong> 1 TikTok coin costs approximately <strong>$0.015 USD</strong> (1.5 cents). Prices are usually cheaper if you buy through the TikTok website instead of the mobile app to avoid Apple/Google platform fees.</li>
              <li><strong>Payout:</strong> For creators, 1 coin sent by a viewer is converted into 1 Diamond. TikTok takes a 50% cut, meaning 1 Diamond is worth <strong>$0.005 USD</strong> (0.5 cents).</li>
            </ul>
            <h3 className="text-foreground font-bold text-lg mt-6">TikTok Gift Values in USD (2025)</h3>
            <p>Here are some of the most popular TikTok gifts and their estimated real-world value:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 font-bold">Gift Name</th>
                    <th className="py-2 font-bold">Coins</th>
                    <th className="py-2 font-bold">Cost to Buy</th>
                    <th className="py-2 font-bold">Creator Receives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2">Rose</td><td className="py-2">1</td><td className="py-2">$0.01</td><td className="py-2">$0.005</td></tr>
                  <tr><td className="py-2">Finger Heart</td><td className="py-2">5</td><td className="py-2">$0.07</td><td className="py-2">$0.025</td></tr>
                  <tr><td className="py-2">Galaxy</td><td className="py-2">1,000</td><td className="py-2">$15.20</td><td className="py-2">$5.00</td></tr>
                  <tr><td className="py-2">Lion</td><td className="py-2">29,999</td><td className="py-2">$455.98</td><td className="py-2">$149.99</td></tr>
                  <tr><td className="py-2">TikTok Universe</td><td className="py-2">34,999</td><td className="py-2">$531.98</td><td className="py-2">$174.99</td></tr>
                </tbody>
              </table>
            </div>
            <h3 className="text-foreground font-bold text-lg mt-6">How to get TikTok coins for cheaper</h3>
            <p>To save money on TikTok coins, avoid buying them through the iOS or Android app. TikTok charges a premium on mobile devices to cover the 30% commission taken by Apple and Google. Instead, go to <strong>tiktok.com/coin</strong> on a web browser to purchase coins at the direct rate, which can save you up to 31%.</p>
            <h3 className="text-foreground font-bold text-lg mt-6">Other free creator tools</h3>
            <p>Boost your TikTok growth with our other free AI tools:</p>
            <ul className="grid sm:grid-cols-2 gap-2 list-none p-0">
              <li><Link href="/tools/tiktok-caption-generator" className="text-primary hover:underline">TikTok Caption Generator →</Link></li>
              <li><Link href="/tools/hashtag-generator" className="text-primary hover:underline">Viral Hashtag Generator →</Link></li>
              <li><Link href="/tools/video-aspect-ratio-calculator" className="text-primary hover:underline">Aspect Ratio Calculator →</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
