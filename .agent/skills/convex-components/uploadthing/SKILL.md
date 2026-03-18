# UploadThing

# Track UploadThing files in Convex with automated access control, expiration cleanup, and webhook verification for secure file management.

# Category: Integrations

## Install

- Command: npm install @mzedstudio/uploadthingtrack

## Links

- Directory: https://www.convex.dev/components/mzedstudio/uploadthingtrack
- Markdown: https://www.convex.dev/components/mzedstudio/uploadthingtrack/uploadthingtrack.md
- llms.txt: https://www.convex.dev/components/mzedstudio/uploadthingtrack/llms.txt
- npm: https://www.npmjs.com/package/%40mzedstudio%2Fuploadthingtrack
- GitHub: https://github.com/raymond-UI/uploadthingtrack
- Demo: https://ephemera-upt-demo.vercel.app

## Details

- Version: 0.4.1
- Weekly downloads: 19
- Author: raymond-UI
- Tags: UploadThing, files, tracking

## Benefits

- Automatically clean up expired files with configurable TTL policies
- Secure file access with built-in permission controls and ownership validation
- Verify UploadThing webhooks with cryptographic signature validation
- Track file metadata and usage patterns across your Convex application

## Use Cases

- Q: how to automatically delete uploaded files after expiration in Convex
  A: UploadThing Track provides configurable TTL policies that automatically clean up expired files from both UploadThing and your Convex database. It runs scheduled functions to identify and remove files based on access patterns and expiration rules you define.
- Q: secure file access control with UploadThing and Convex
  A: The component implements ownership validation and permission checks before serving file URLs. It tracks who uploaded each file and validates access requests against your defined authorization rules.
- Q: verify UploadThing webhook signatures in Convex
  A: UploadThing Track automatically validates webhook signatures using cryptographic verification to ensure requests actually come from UploadThing. It handles the signature validation and parses webhook payloads for file lifecycle events.
- Q: track file metadata and usage in Convex database
  A: The component stores comprehensive file metadata including upload timestamps, file sizes, access counts, and ownership information in your Convex database. This enables analytics and informed cleanup decisions based on actual usage patterns.

## FAQ

- Q: Does UploadThing Track work with existing UploadThing integrations?
  A: Yes, UploadThing Track is designed to work alongside existing UploadThing implementations. It operates as a tracking layer that monitors file lifecycle events through webhooks without interfering with your current upload flows or file serving.
- Q: How does the automatic file cleanup prevent accidentally deleting active files?
  A: UploadThing Track uses configurable TTL policies combined with access tracking to identify truly unused files. It monitors file access patterns and only removes files that meet both age and inactivity criteria you define, protecting actively used files from deletion.
- Q: What webhook events does the component handle from UploadThing?
  A: UploadThing Track processes upload completion, deletion, and error events from UploadThing webhooks. It verifies each webhook signature cryptographically and updates your Convex database with the latest file status and metadata changes.
- Q: Can I customize the access control rules for different file types?
  A: Yes, UploadThing Track allows you to define custom permission functions that can check user roles, file ownership, and file metadata before granting access. You can implement different access patterns for different file types or user groups within your Convex functions.
