# Cloudflare R2

# Integrate Cloudflare R2 object storage with Convex to store and serve files with high performance and low egress costs.

# Category: Integrations

## Install

- Command: npm install @convex-dev/r2

## Links

- Directory: https://www.convex.dev/components/cloudflare-r2
- Markdown: https://www.convex.dev/components/cloudflare-r2/cloudflare-r2.md
- llms.txt: https://www.convex.dev/components/cloudflare-r2/llms.txt
- npm: https://www.npmjs.com/package/%40convex-dev%2Fr2
- GitHub: https://github.com/get-convex/r2
- Demo: https://github.com/get-convex/r2/tree/main/example

## Details

- Version: 0.9.1
- Weekly downloads: 14,944
- Author: get-convex

## Description

The Cloudflare R2 component provides file storage and serving capabilities using Cloudflare's R2 object storage service. It handles signed URL generation for uploads, syncs file metadata to your Convex database, and provides React/Svelte hooks for seamless client-side file operations. The component supports multiple buckets, custom object keys, and server-side file storage from actions.

## Use Cases

- **User-generated content uploads** where users need to upload profile pictures, documents, or media files directly from your React or Svelte frontend
- **Server-side file processing** where actions download external images, generate documents, or process data that needs to be stored in R2 and associated with database records
- **Multi-tenant applications** where different customers or projects require separate R2 buckets with isolated file storage
- **Content management systems** that need to store and serve large files while keeping metadata searchable in Convex tables
- **File sharing applications** where you need to generate time-limited URLs for secure file access with custom expiration times

## How It Works

The component creates an R2 instance that connects to your Cloudflare bucket using API credentials stored as environment variables. For uploads, it generates signed URLs through the `generateUploadUrl` function and provides `useUploadFile` hooks for React and Svelte that handle the complete upload flow including metadata syncing.

File metadata gets stored in Convex tables alongside the R2 storage, enabling you to query and associate files with other data. The `clientApi` method lets you define upload validation and post-upload callbacks with proper TypeScript typing when you pass your DataModel as a generic parameter.

For server-side operations, the `r2.store` method accepts Blobs, Buffers, or Uint8Arrays from actions and handles both R2 upload and metadata syncing. File serving uses `r2.getUrl` to generate time-limited access URLs with configurable expiration times, and `r2.deleteObject` removes files from both R2 and your database.
