// convex/convex.config.ts
import workflow from "@convex-dev/workflow/convex.config.js";
import { defineApp } from "convex/server";
import polar from "@convex-dev/polar/convex.config.js";
import r2 from "@convex-dev/r2/convex.config.js";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import tenants from "@djpanda/convex-tenants/convex.config";
import authz from "@djpanda/convex-authz/convex.config";

const app = defineApp();
app.use(workflow);
app.use(polar);
app.use(r2);
// Named aggregate instances — one per metric group to avoid key conflicts
app.use(aggregate, { name: "projectsAggregate" }); // counts/sums clips per user from projects table
app.use(aggregate, { name: "scheduledAggregate" }); // counts published posts per user/platform
// Multi-tenant team/workspace management (authz is a sibling, not a child of tenants)
app.use(tenants);
app.use(authz);

export default app;