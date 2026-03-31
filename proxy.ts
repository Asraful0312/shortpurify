// NOTE: Next.js only loads middleware from `middleware.ts` in the project root.
// This file is kept as the source of truth — `middleware.ts` mirrors it.
// Edit here and copy changes to middleware.ts.

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes anyone can access without being logged in
const isPublicRoute = createRouteMatcher([
  "/",
  "/privacy",
  "/terms",
  "/contact",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/clip(.*)",          
  "/api/uploadthing(.*)",
  "/api/webhooks(.*)",
]);

// Add all your dashboard/private routes here
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",      // this makes /dashboard, /dashboard/anything private
  // Add more if needed, e.g.:
  // "/settings(.*)",
  // "/profile(.*)",
  // "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Logged-in user hitting the homepage → redirect to dashboard
  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If the route is protected, require authentication
  // (this will automatically redirect unauthenticated users to /sign-in)
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Optional: You can also keep the old logic for extra safety
  // if (!isPublicRoute(req)) {
  //   await auth.protect();
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};