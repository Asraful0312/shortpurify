import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { ContactForm } from "@/components/contact/contact-form";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Contact Us | ShortPurify",
  description: "Get in touch with the ShortPurify team for support, feature requests, or business inquiries.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-black">
              Get in touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions about ShortPurify? We're here to help you turn your content into viral success.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start max-w-6xl mx-auto">
            {/* Contact Info Sidebar */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
              <div className="bg-white/50 border border-border p-8 rounded-[2rem] space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-black mb-1">Email Us</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-2">Our support team usually responds within 24 hours.</p>
                    <a href="mailto:support@shortpurify.com" className="text-primary font-bold hover:underline">
                      support@shortpurify.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-black mb-1">Community</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-2">Join our   <a href="https://discord.gg/By7H7MkHgn" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline inline-block -mb-1 mx-1">
                     <Image src="/icons/discord.png" alt="Discord" width={18} height={18} />
                    </a> to chat with other creators and get quick tips.</p>
                  
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-black mb-1">Support</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">Priority support for Agency and Enterprise plan users.</p>
                  </div>
                </div>
              </div>

              {/* FAQ Small Note */}
              <div className="px-8 flex flex-col gap-2">
                 <h4 className="font-bold text-black">Looking for help?</h4>
                 <p className="text-sm text-muted-foreground">Check out our <span className="text-primary font-semibold hover:underline cursor-pointer">Help Center</span> for tutorials and common issues.</p>
              </div>
            </div>

            {/* Main Contact Form */}
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
