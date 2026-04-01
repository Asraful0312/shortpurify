"use client"

import { motion } from "framer-motion";
import Footer from "@/components/shared/footer";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/50 border border-border/60 p-6 rounded-2xl">
      <h3 className="font-bold text-base mb-2">{title}</h3>
      <div className="text-sm text-muted-foreground space-y-1">{children}</div>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <main className="pt-12 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
            className="space-y-12"
          >
            {/* Header */}
            <header className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground font-medium">Last updated: April 1, 2026</p>
              <div className="h-1 w-20 bg-accent rounded-full" />
            </header>

            <div className="prose prose-stone prose-lg max-w-none space-y-10 text-foreground/80">

              <Section title="1. Introduction">
                <p>
                  ShortPurify (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website shortpurify.com and the
                  ShortPurify platform (the &ldquo;Service&rdquo;). This Privacy Policy explains what information we
                  collect, how we use it, who we share it with, and what rights you have regarding your data.
                </p>
                <p>
                  By using our Service you agree to the collection and use of information as described in this
                  policy. If you do not agree, please stop using the Service.
                </p>
              </Section>

              <Section title="2. Information We Collect">
                <div className="grid md:grid-cols-2 gap-4 not-prose">
                  <Card title="Account Information">
                    <p>Name, email address, profile picture, and account preferences provided when you
                    sign up or authenticate via Clerk.</p>
                  </Card>
                  <Card title="Video & Media Content">
                    <p>Video files you upload and YouTube URLs you submit for processing. Content is
                    stored temporarily on Cloudflare R2 storage and deleted after processing or upon
                    account deletion.</p>
                  </Card>
                  <Card title="Social Account Tokens">
                    <p>OAuth access tokens for connected social accounts (TikTok, YouTube, Instagram,
                    X/Twitter, LinkedIn, Threads, Bluesky, Facebook, Snapchat). These are encrypted
                    at rest and used solely to publish clips on your behalf.</p>
                  </Card>
                  <Card title="Usage & Analytics Data">
                    <p>Pages visited, features used, clip processing logs, error reports, and
                    interaction data used to improve the Service.</p>
                  </Card>
                  <Card title="Payment & Billing Data">
                    <p>Subscription plan, billing history, and transaction references. Full payment
                    card details are handled exclusively by Creem and never stored on our servers.</p>
                  </Card>
                  <Card title="Technical Data">
                    <p>IP address, browser type, device identifiers, operating system, referral URLs,
                    and session data collected automatically when you use the Service.</p>
                  </Card>
                </div>
              </Section>

              <Section title="3. How We Use Your Information">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, operate, and maintain the Service including video processing and clip generation.</li>
                  <li>Authenticate your identity and manage your account via Clerk.</li>
                  <li>Publish content to connected social platforms when you request it.</li>
                  <li>Process subscription payments and manage your billing plan through Creem.</li>
                  <li>Enforce usage limits based on your subscription tier.</li>
                  <li>Send transactional emails (account confirmation, billing receipts, processing notifications).</li>
                  <li>Respond to support requests and troubleshoot issues.</li>
                  <li>Detect fraud, abuse, or violations of our Terms of Service.</li>
                  <li>Improve and develop new features by analyzing aggregated, anonymized usage patterns.</li>
                  <li>Comply with legal obligations.</li>
                </ul>
                <p>
                  We do <strong>not</strong> use your uploaded videos or generated clips to train AI models,
                  sell advertising, or share your content with third parties beyond what is necessary to
                  operate the Service.
                </p>
              </Section>

              <Section title="4. Third-Party Service Providers">
                <p>
                  We work with the following third-party processors who may handle your data on our behalf.
                  Each is bound by their own privacy policy and data processing agreements.
                </p>
                <div className="grid md:grid-cols-2 gap-4 not-prose">
                  <Card title="Clerk (Authentication)">
                    <p>Handles user registration, login, session management, and organization/workspace
                    features. <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer"
                    className="underline">clerk.com/privacy</a></p>
                  </Card>
                  <Card title="Convex (Database & Backend)">
                    <p>Our backend database and real-time infrastructure where project data, clip metadata,
                    and account information is stored. <a href="https://www.convex.dev/privacy"
                    target="_blank" rel="noopener noreferrer" className="underline">convex.dev/privacy</a></p>
                  </Card>
                  <Card title="Cloudflare R2 (File Storage)">
                    <p>Stores uploaded video files, generated clips, thumbnails, and export files.
                    Files are stored securely and deleted when no longer needed.
                    <a href="https://www.cloudflare.com/privacypolicy/" target="_blank"
                    rel="noopener noreferrer" className="underline"> cloudflare.com/privacypolicy</a></p>
                  </Card>
                  <Card title="Creem (Payments & Subscriptions)">
                    <p>Processes all subscription payments. Your full payment card details are entered
                    directly on Creem&apos;s secure checkout and are never transmitted to or stored by
                    ShortPurify. <a href="https://creem.io/privacy" target="_blank"
                    rel="noopener noreferrer" className="underline">creem.io/privacy</a></p>
                  </Card>
                  <Card title="Anthropic (AI Processing)">
                    <p>Powers transcript analysis and viral moment identification. Video content is
                    processed via Anthropic&apos;s API. <a href="https://www.anthropic.com/privacy"
                    target="_blank" rel="noopener noreferrer" className="underline">anthropic.com/privacy</a></p>
                  </Card>
                  <Card title="YouTube API (Video Import)">
                    <p>Used to fetch and process YouTube videos you submit. Use of YouTube data is
                    subject to <a href="https://policies.google.com/privacy" target="_blank"
                    rel="noopener noreferrer" className="underline">Google&apos;s Privacy Policy</a>.</p>
                  </Card>
                </div>
                <p className="text-sm">
                  Social platform APIs (TikTok, Instagram, X/Twitter, LinkedIn, Threads, Bluesky,
                  Facebook, Snapchat) are accessed only when you explicitly connect an account, and
                  only to publish content you authorize. OAuth tokens are encrypted and stored in
                  Convex. You can revoke access at any time from your connected accounts settings.
                </p>
              </Section>

              <Section title="5. Cookies & Tracking">
                <p>We use the following types of cookies and similar technologies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential cookies:</strong> Required for authentication sessions (managed by Clerk) and core Service functionality. Cannot be disabled.</li>
                  <li><strong>Preference cookies:</strong> Remember your settings such as selected workspace or UI preferences.</li>
                  <li><strong>Analytics:</strong> Aggregated, anonymized data to understand how users interact with the Service. We do not use cross-site advertising trackers.</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. Disabling essential cookies
                  will prevent you from logging in or using the Service.
                </p>
              </Section>

              <Section title="6. Data Retention">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Video files & clips:</strong> Original uploaded videos are deleted from storage once processing is complete (or within 30 days at the latest). Generated clips are retained for as long as your account is active or until you delete a project.</li>
                  <li><strong>Account data:</strong> Retained for the lifetime of your account and deleted within 30 days of account deletion.</li>
                  <li><strong>Social tokens:</strong> Deleted immediately when you disconnect a social account or delete your account.</li>
                  <li><strong>Billing records:</strong> Retained for up to 7 years as required by financial regulations, even after account deletion.</li>
                  <li><strong>Logs:</strong> Server and error logs retained for up to 90 days for debugging and security purposes.</li>
                </ul>
              </Section>

              <Section title="7. Your Rights">
                <p>
                  Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <div className="grid md:grid-cols-2 gap-4 not-prose">
                  <Card title="Access & Portability">
                    <p>Request a copy of the personal data we hold about you.</p>
                  </Card>
                  <Card title="Correction">
                    <p>Request correction of inaccurate or incomplete data.</p>
                  </Card>
                  <Card title="Deletion">
                    <p>Request deletion of your account and associated data (the &ldquo;right to be forgotten&rdquo;).
                    Some data may be retained for legal obligations.</p>
                  </Card>
                  <Card title="Restriction & Objection">
                    <p>Object to or restrict certain types of processing, including marketing
                    communications.</p>
                  </Card>
                  <Card title="Withdraw Consent">
                    <p>Where processing is based on consent, you may withdraw it at any time without
                    affecting prior processing.</p>
                  </Card>
                  <Card title="Lodge a Complaint">
                    <p>EU/UK residents may lodge a complaint with their local data protection authority
                    (e.g. the ICO in the UK or your national DPA).</p>
                  </Card>
                </div>
                <p>
                  To exercise any of these rights, email us at{" "}
                  <a href="mailto:support@shortpurify.com" className="underline font-semibold">
                    support@shortpurify.com
                  </a>. We will respond within 30 days. To delete your account, you may also do so
                  directly from your account settings.
                </p>
              </Section>

              <Section title="8. International Data Transfers">
                <p>
                  ShortPurify is operated from the United Kingdom. Our third-party processors (Convex,
                  Cloudflare, Clerk, Creem, Anthropic) may store and process data in the United States
                  or other countries. Where data is transferred outside the EEA or UK, we rely on
                  Standard Contractual Clauses or equivalent mechanisms to ensure adequate protection.
                </p>
              </Section>

              <Section title="9. Children's Privacy">
                <p>
                  The Service is not directed to children under the age of 13 (or 16 in the EU). We do
                  not knowingly collect personal data from children. If you believe a child has provided
                  us with personal data, please contact us at{" "}
                  <a href="mailto:support@shortpurify.com" className="underline font-semibold">
                    support@shortpurify.com
                  </a>{" "}
                  and we will delete it promptly.
                </p>
              </Section>

              <Section title="10. Data Security">
                <p>
                  We implement industry-standard security measures including encryption in transit (TLS),
                  encryption at rest for sensitive fields (OAuth tokens, API keys), access controls, and
                  regular security reviews. However, no method of transmission over the internet is 100%
                  secure. In the event of a data breach that affects your rights and freedoms, we will
                  notify you and the relevant authorities as required by law.
                </p>
              </Section>

              <Section title="11. Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time. When we make material changes, we
                  will update the &ldquo;Last updated&rdquo; date at the top of this page and, where appropriate,
                  notify you by email or an in-app notice. Continued use of the Service after changes
                  are posted constitutes your acceptance of the updated policy.
                </p>
              </Section>

              <section className="space-y-4 text-center py-10 bg-secondary/30 rounded-3xl border border-border/40">
                <h2 className="text-2xl font-bold text-foreground">Questions or Requests?</h2>
                <p className="max-w-md mx-auto text-muted-foreground">
                  For any privacy-related questions, data access requests, or concerns, contact us at{" "}
                  <a
                    className="text-primary underline font-semibold"
                    href="mailto:support@shortpurify.com"
                  >
                    support@shortpurify.com
                  </a>.
                </p>
              </section>

            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
