// convex/convex.config.ts
import workflow from "@convex-dev/workflow/convex.config.js";
import { defineApp } from "convex/server";
import r2 from "@convex-dev/r2/convex.config.js";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import tenants from "@djpanda/convex-tenants/convex.config";
import authz from "@djpanda/convex-authz/convex.config";
import creem from "@mmailaender/convex-creem/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();
app.use(workflow);
app.use(r2);
app.use(aggregate, { name: "projectsAggregate" }); 
app.use(aggregate, { name: "scheduledAggregate" }); 
app.use(tenants);
app.use(creem);
app.use(authz);
app.use(rateLimiter)


export default app;