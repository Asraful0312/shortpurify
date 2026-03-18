# Polar

# Add Polar subscriptions and billing to Convex apps with built-in webhook handling and subscription state management.

# Category: Payments

## Install

- Command: npm install @convex-dev/polar

## Links

- Directory: https://www.convex.dev/components/polar
- Markdown: https://www.convex.dev/components/polar/polar.md
- llms.txt: https://www.convex.dev/components/polar/llms.txt
- npm: https://www.npmjs.com/package/%40convex-dev%2Fpolar
- GitHub: https://github.com/erquhart/convex-polar
- Demo: https://github.com/get-convex/polar/tree/main/example

## Details

- Version: 0.8.1
- Weekly downloads: 2,145
- Author: erquhart

## Description

Integrates Polar subscriptions and billing into Convex applications with automatic webhook synchronization and React UI components. Provides type-safe subscription management, product syncing, and customer portal integration. Handles all Polar price types including fixed, custom pay-what-you-want, seat-based, and metered pricing models.

## Use Cases

• **Add subscription billing to SaaS apps** - Configure products with keys like `premiumMonthly` and `premiumYearly`, then use `CheckoutLink` components for user upgrades
• **Implement tiered pricing with trials** - Support free trials, multiple subscription tiers, and seat-based pricing for team plans
• **Build customer self-service portals** - Let users manage subscriptions, update payment methods, and view billing history with `CustomerPortalLink`
• **Handle subscription lifecycle events** - Process webhook events like `subscription.updated` and `product.created` with type-safe handlers
• **Migrate from other billing providers** - Replace existing subscription logic while keeping product data synced between Polar and Convex

## How It Works

The component creates a `Polar` client in your Convex backend that syncs product and subscription data via webhooks. You configure it with a `getUserInfo` function that maps your user system to Polar customers, and optionally define product keys for easy reference. The webhook handler at `/polar/events` keeps subscription data current by processing events like `subscription.created` and `product.updated`.

React components like `CheckoutLink` and `CustomerPortalLink` generate Polar URLs on-demand through Convex actions. The `CheckoutLink` supports embedded checkout or redirect modes, while `CustomerPortalLink` provides subscription management. Functions like `getCurrentSubscription` and `changeCurrentSubscription` handle subscription queries and modifications.

Product configuration supports static mapping (`products: { premiumMonthly: 'product_id' }`) or dynamic listing with `listAllProducts`. The component handles all Polar price types automatically, exposing different fields based on `amountType` - from simple `priceAmount` for fixed pricing to complex `seatTiers` for seat-based models.
