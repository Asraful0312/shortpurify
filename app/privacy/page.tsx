import type { Metadata } from "next";
import PrivacyContent from "./privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how ShortPurify collects, uses, and protects your personal data in compliance with GDPR and applicable privacy laws.",
  alternates: {
    canonical: "https://shortpurify.com/privacy",
  },
};

export default function PrivacyPolicy() {
  return <PrivacyContent />;
}
