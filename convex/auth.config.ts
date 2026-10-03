import { AuthConfig } from "convex/server";

// This is the Clerk Frontend API URL (the JWT issuer), not the Vercel URL.
// Configure the same value as CLERK_JWT_ISSUER_DOMAIN on every Convex
// deployment (development and production).
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
