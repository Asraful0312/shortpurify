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

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/50 border border-border/60 p-5 rounded-2xl text-sm text-muted-foreground space-y-1">
      {children}
    </div>
  );
}

export default function TermsOfService() {
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
                Terms of Service
              </h1>
              <p className="text-muted-foreground font-medium">Last updated: April 1, 2026</p>
              <div className="h-1 w-20 bg-accent rounded-full" />
            </header>

            <div className="prose prose-stone prose-lg max-w-none space-y-10 text-foreground/80">

              <Section title="1. Acceptance of Terms">
                <p>
                  By accessing or using ShortPurify (&ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) at
                  shortpurify.com, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our{" "}
                  <a href="/privacy" className="underline font-semibold">Privacy Policy</a>. If you do not
                  agree to all of these Terms, you may not access or use the Service. These Terms
                  constitute a legally binding agreement between you and ShortPurify.
                </p>
              </Section>

              <Section title="2. Description of Service">
                <p>
                  ShortPurify is an AI-powered platform that allows users to upload or import long-form
                  video content and automatically generate short-form vertical clips optimised for social
                  media platforms including TikTok, Instagram Reels, YouTube Shorts, X/Twitter, LinkedIn,
                  Threads, Bluesky, Facebook, and Snapchat.
                </p>
                <p>
                  The Service includes AI-driven transcript generation, viral moment identification, smart
                  cropping, subtitle generation, and direct publishing to connected social accounts. Features
                  available to you depend on your subscription plan.
                </p>
              </Section>

              <Section title="3. User Accounts">
                <p>
                  To access the Service you must create an account via Clerk, our authentication provider.
                  You must be at least 13 years of age (or 16 in the EU) to register. You are responsible
                  for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your login credentials.</li>
                  <li>All activity that occurs under your account.</li>
                  <li>Notifying us immediately at <a href="mailto:support@shortpurify.com" className="underline">support@shortpurify.com</a> if you suspect unauthorised access.</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </Section>

              <Section title="4. Subscriptions & Billing">
                <p>
                  ShortPurify offers a free Starter plan and paid subscription plans (Pro Creator, Agency).
                  Paid plans are billed on a monthly or annual basis through our payment processor,{" "}
                  <strong>Creem</strong> (creem.io).
                </p>
                <div className="grid md:grid-cols-2 gap-4 not-prose">
                  <InfoBox>
                    <p className="font-semibold text-foreground">Billing</p>
                    <p>
                      Your subscription begins on the date of purchase. Fees are charged at the start
                      of each billing period (monthly or annual). All prices are listed in USD unless
                      stated otherwise.
                    </p>
                  </InfoBox>
                  <InfoBox>
                    <p className="font-semibold text-foreground">Automatic Renewal</p>
                    <p>
                      Subscriptions renew automatically at the end of each billing period unless you
                      cancel before the renewal date. You authorise us (via Creem) to charge your
                      payment method on file for each renewal.
                    </p>
                  </InfoBox>
                  <InfoBox>
                    <p className="font-semibold text-foreground">Plan Limits</p>
                    <p>
                      Each plan has monthly limits on the number of projects and video minutes processed.
                      Exceeding these limits requires upgrading your plan. Unused allowances do not roll
                      over to the next month.
                    </p>
                  </InfoBox>
                  <InfoBox>
                    <p className="font-semibold text-foreground">Payment Processing</p>
                    <p>
                      All payments are processed by Creem. ShortPurify does not store your full payment
                      card details. By subscribing, you also agree to{" "}
                      <a href="https://creem.io/terms" target="_blank" rel="noopener noreferrer"
                        className="underline">Creem&apos;s Terms of Service</a>.
                    </p>
                  </InfoBox>
                </div>
              </Section>

              <Section title="5. Cancellation & Refunds">
                <p>
                  You may cancel your subscription at any time from your billing settings. Cancellation
                  takes effect at the end of the current billing period — you will retain access to paid
                  features until that date.
                </p>
                <p>
                  We do not offer refunds for partial billing periods. Exceptions may be made at our sole
                  discretion in cases of billing errors or exceptional circumstances. To request a refund,
                  contact <a href="mailto:support@shortpurify.com" className="underline">support@shortpurify.com</a>{" "}
                  within 7 days of the charge.
                </p>
                <p>
                  Upon cancellation, your account will revert to the free Starter plan. Your existing
                  projects and clips remain accessible. We do not delete your data solely because you
                  downgrade or cancel, but data may be deleted if your account is inactive for more than
                  12 months or if you request account deletion.
                </p>
              </Section>

              <Section title="6. Intellectual Property & Content Ownership">
                <p>
                  <strong>Your content:</strong> You retain full ownership of all video content you upload
                  or import and all clips generated from it. By using the Service, you grant ShortPurify
                  a limited, non-exclusive, royalty-free licence to process, store, and transmit your
                  content solely as necessary to provide the Service.
                </p>
                <p>
                  <strong>Our platform:</strong> The ShortPurify platform, including its software, design,
                  AI models, and branding, is owned by ShortPurify and protected by intellectual property
                  law. You may not copy, reverse-engineer, or create derivative works from any part of the
                  platform without our written consent.
                </p>
                <p>
                  <strong>AI-generated output:</strong> We do not claim ownership of clips generated by
                  the Service. However, we make no warranty that AI-generated output is free from
                  third-party intellectual property claims.
                </p>
                <p>
                  <strong>No training use:</strong> We do not use your uploaded videos or generated clips
                  to train AI models.
                </p>
              </Section>

              <Section title="7. Acceptable Use & Content Standards">
                <p>You are solely responsible for the content you upload and publish. You agree not to use the Service to:</p>
                <div className="not-prose">
                  <InfoBox>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Upload or distribute content that is illegal, defamatory, harassing, hateful, or sexually explicit.</li>
                      <li>Infringe the copyright, trademark, or other intellectual property rights of any person or entity.</li>
                      <li>Upload content you do not own or do not have the rights to use and distribute.</li>
                      <li>Circumvent, disable, or interfere with the security features of the Service.</li>
                      <li>Attempt to gain unauthorised access to other users&apos; accounts or our infrastructure.</li>
                      <li>Use automated tools to scrape, extract, or reverse-engineer our AI models or platform.</li>
                      <li>Resell or sublicence access to the Service without prior written consent.</li>
                      <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
                    </ul>
                  </InfoBox>
                </div>
              </Section>

              <Section title="8. YouTube & Third-Party Platform Compliance">
                <p>
                  When you import a YouTube video, you confirm that you own the content or have the
                  appropriate rights and licences to process and repurpose it. Use of the YouTube import
                  feature is subject to the{" "}
                  <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer"
                    className="underline">YouTube Terms of Service</a> and{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                    className="underline">Google Privacy Policy</a>.
                </p>
                <p>
                  When you connect a social media account and publish content, you remain responsible for
                  compliance with that platform&apos;s terms of service, community guidelines, and applicable
                  laws. ShortPurify is not liable for content removed, accounts suspended, or penalties
                  imposed by third-party platforms.
                </p>
              </Section>

              <Section title="9. DMCA & Copyright Takedowns">
                <p>
                  We respect intellectual property rights and respond to valid copyright takedown notices.
                  If you believe content on our Service infringes your copyright, send a notice to{" "}
                  <a href="mailto:support@shortpurify.com" className="underline">support@shortpurify.com</a>{" "}
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A description of the copyrighted work you claim has been infringed.</li>
                  <li>The URL or location of the allegedly infringing content.</li>
                  <li>Your contact information and a statement of good faith.</li>
                  <li>A statement, under penalty of perjury, that the information is accurate and that you are the copyright owner or authorised to act on their behalf.</li>
                </ul>
                <p>
                  Repeat infringers will have their accounts terminated.
                </p>
              </Section>

              <Section title="10. Termination">
                <p>
                  We may suspend or terminate your account and access to the Service at any time, with or
                  without notice, if we reasonably believe you have violated these Terms, engaged in
                  fraudulent activity, or for any other reason at our discretion.
                </p>
                <p>
                  You may terminate your account at any time by deleting it from your account settings.
                  Upon termination, your right to use the Service ceases immediately. Sections of these
                  Terms that by their nature should survive termination (including ownership, disclaimers,
                  limitations of liability, and governing law) will survive.
                </p>
              </Section>

              <Section title="11. Disclaimer of Warranties">
                <p>
                  The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
                  either express or implied, including but not limited to implied warranties of
                  merchantability, fitness for a particular purpose, or non-infringement.
                </p>
                <p>
                  We do not warrant that the Service will be uninterrupted, error-free, or free of
                  harmful components. AI-generated output (transcripts, clip selections, captions) may
                  contain errors and should be reviewed before publishing.
                </p>
              </Section>

              <Section title="12. Limitation of Liability">
                <p>
                  To the fullest extent permitted by applicable law, ShortPurify, its directors,
                  employees, partners, and affiliates shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages, including but not limited to loss of
                  profits, data, goodwill, or business opportunities, arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use of or inability to use the Service.</li>
                  <li>Any content you upload, generate, or publish via the Service.</li>
                  <li>Unauthorised access to or alteration of your data.</li>
                  <li>Any third-party conduct or content.</li>
                </ul>
                <p>
                  Our total aggregate liability to you for any claims arising from the use of the
                  Service shall not exceed the greater of (a) the total fees you paid to us in the
                  3 months preceding the claim, or (b) £50 GBP.
                </p>
              </Section>

              <Section title="13. Governing Law & Dispute Resolution">
                <p>
                  These Terms are governed by and construed in accordance with the laws of England and
                  Wales, without regard to its conflict of law provisions.
                </p>
                <p>
                  Any dispute arising from these Terms or your use of the Service shall first be
                  attempted to be resolved through good-faith negotiation by contacting us at{" "}
                  <a href="mailto:support@shortpurify.com" className="underline">support@shortpurify.com</a>.
                  If unresolved within 30 days, disputes shall be subject to the exclusive jurisdiction
                  of the courts of England and Wales.
                </p>
              </Section>

              <Section title="14. Changes to These Terms">
                <p>
                  We reserve the right to update these Terms at any time. When we make material changes,
                  we will update the &ldquo;Last updated&rdquo; date at the top of this page and notify you via
                  email or an in-app notice at least 14 days before the changes take effect. If you
                  continue to use the Service after the effective date, you accept the updated Terms.
                  If you do not agree to the updated Terms, you must stop using the Service and may
                  cancel your subscription before the effective date.
                </p>
              </Section>

              <Section title="15. Miscellaneous">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Entire agreement:</strong> These Terms and our Privacy Policy constitute the entire agreement between you and ShortPurify regarding the Service.</li>
                  <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full force.</li>
                  <li><strong>No waiver:</strong> Failure to enforce any right or provision does not constitute a waiver of that right.</li>
                  <li><strong>Assignment:</strong> You may not assign your rights under these Terms without our written consent. We may assign our rights freely.</li>
                </ul>
              </Section>

              <section className="space-y-4 text-center py-10 bg-secondary/30 rounded-3xl border border-border/40">
                <h2 className="text-2xl font-bold text-foreground">Questions?</h2>
                <p className="max-w-md mx-auto text-muted-foreground">
                  If you have any questions about these Terms, please contact us at{" "}
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
