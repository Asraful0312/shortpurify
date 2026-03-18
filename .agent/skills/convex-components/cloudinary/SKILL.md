# Cloudinary

# Cloudinary integration that provides image upload, transformation, and management capabilities using direct Cloudinary REST APIs with full TypeScript support.

# Category: Integrations

## Install

- Command: npm install @imaxis/cloudinary-convex

## Links

- Directory: https://www.convex.dev/components/imaxis/cloudinary-convex
- Markdown: https://www.convex.dev/components/imaxis/cloudinary-convex/cloudinary-convex.md
- llms.txt: https://www.convex.dev/components/imaxis/cloudinary-convex/llms.txt
- npm: https://www.npmjs.com/package/%40imaxis%2Fcloudinary-convex
- GitHub: https://github.com/imaxisXD/cloudinary-convex
- Demo: https://github.com/imaxisXD/cloudinary-convex-studio

## Details

- Version: 0.1.6
- Weekly downloads: 15
- Author: imaxisXD

## Description

This component integrates Cloudinary's image management APIs directly into Convex, providing both base64 uploads for small files and direct uploads that bypass Convex's 16MB limit for large files up to 100MB. It automatically tracks assets in your Convex database with optimized indexes, generates secure upload signatures server-side, and provides full TypeScript support with exported validators. The component offers both a high-level `makeCloudinaryAPI` approach for React apps and a lower-level `CloudinaryClient` for custom server logic.

## Use Cases

• Building a photo sharing app where users upload high-resolution images that exceed typical serverless limits
• Creating a content management system that needs real-time asset tracking synchronized between Cloudinary and your database
• Implementing dynamic image transformations with type-safe parameters for e-commerce product galleries
• Building an admin dashboard that requires secure server-side image uploads with progress tracking
• Developing a social media platform where you need both small profile pictures and large media uploads

## How It Works

The component provides two main integration patterns: `makeCloudinaryAPI` creates public functions in your Convex app that React clients can call directly, while `CloudinaryClient` gives you fine-grained control within Convex actions and queries. For uploads, it supports both base64 encoding for files under 10MB and direct uploads to Cloudinary that bypass Convex entirely for larger files.

Asset metadata gets automatically stored in Convex with optimized indexes, allowing you to use `useQuery` for real-time asset lists and management. The component includes React hooks like `useCloudinaryUpload` and `useCloudinaryImage` that work with your app's API functions, providing upload progress tracking and transformation capabilities.

Setup requires adding the component to your `convex.config.ts` with `app.use(cloudinary)` and configuring your Cloudinary credentials as environment variables. The component handles secure signature generation server-side and provides full TypeScript support with validators like `vAssetResponse` for type-safe data flow.
