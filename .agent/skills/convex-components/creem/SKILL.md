# Creem

# Add production-ready billing to Convex apps with subscriptions, one-time purchases, seat-based pricing, and ready-made React/Svelte widgets.

# Category: Payments

## Install

- Command: npm install @mmailaender/convex-creem

## Links

- Directory: https://www.convex.dev/components/mmailaender/convex-creem
- Markdown: https://www.convex.dev/components/mmailaender/convex-creem/convex-creem.md
- llms.txt: https://www.convex.dev/components/mmailaender/convex-creem/llms.txt
- npm: https://www.npmjs.com/package/%40mmailaender%2Fconvex-creem
- GitHub: https://github.com/mmailaender/convex-creem
- Demo: https://convex-creem.pages.dev/

## Details

- Version: 0.2.0
- Weekly downloads: 130
- Author: mmailaender
- Tags: creem, subscription, billing, payments, checkout

## Description

The Creem component integrates subscription billing, one-time purchases, and seat-based pricing into Convex apps through the Creem billing service. It provides a complete billing API with webhook handling, automatic product syncing, and pre-built React/Svelte UI widgets for checkout, plan switching, and customer portals. The component handles billing entity resolution, supports both user and organization-level billing, and includes built-in security with access control.

## Use Cases

- **Add SaaS subscriptions** to your app with monthly/yearly billing cycles, plan upgrades/downgrades, and automatic trial handling
- **Implement seat-based pricing** for team products where billing scales with organization member count or user-selected quantities
- **Sell one-time products** like licenses, credits, or premium features with purchase tracking and ownership validation
- **Build customer billing portals** where users can manage subscriptions, update payment methods, and view billing history
- **Handle organization billing** by scoping subscriptions to team or workspace entities instead of individual users

## How It Works

The component registers as a Convex component using `defineApp()` and `app.use()`, then exposes billing operations through a `Creem` class instance. You define an `ApiResolver` function that maps authenticated users to billing entities, which the component uses to scope all billing operations. The `creem.api({ resolve })` method generates Convex query and mutation functions that handle checkout creation, subscription management, and customer operations.

Webhook handling is automatic through `creem.registerRoutes(http)` in your HTTP router, processing events like `checkout.completed` and `subscription.*` from Creem's servers. The component syncs product data from Creem into your Convex database using `creem.syncProducts()`, enabling offline access to pricing and plan information.

The UI widgets connect to your Convex functions through a `ConnectedBillingApi` object that maps component methods to your exported billing functions. Widgets like `<Subscription.Root>` and `<Product.Root>` handle complex billing flows including plan switching, seat management, and checkout processing with built-in confirmation dialogs and state management.
