import type { Metadata } from "next";
import TermsContent from "./terms-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read ShortPurify's Terms of Service. Understand your rights, subscription policies, acceptable use, and how our AI clip generation platform works.",
  alternates: {
    canonical: "https://shortpurify.com/terms",
  },
};

export default function TermsOfService() {
  return <TermsContent />;
}
