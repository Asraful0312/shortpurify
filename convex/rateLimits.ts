import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Max 5 project creates per user per minute (burst protection)
  createProject: { kind: "fixed window", rate: 5, period: 60 * 1000 },
  // Max 20 project creates per user per hour (sustained abuse protection)
  createProjectHourly: { kind: "fixed window", rate: 20, period: 60 * 60 * 1000 },
  // Free tools: 10 AI generations per minute per client, 30 per hour
  toolGenerate: { kind: "fixed window", rate: 10, period: 60 * 1000 },
  toolGenerateHourly: { kind: "fixed window", rate: 30, period: 60 * 60 * 1000 },
});
