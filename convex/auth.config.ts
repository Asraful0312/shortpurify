import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk JWT issuer URL.
      // 1. In your Clerk dashboard: JWT Templates → New → Convex → copy the Issuer URL
      // 2. In your Convex dashboard: Settings → Environment Variables → add:
      //      CLERK_JWT_ISSUER_DOMAIN = https://<your-clerk-subdomain>.clerk.accounts.dev
      // See: https://docs.convex.dev/auth/clerk
      domain: process.env.CLERK_ISSUER_URL!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
