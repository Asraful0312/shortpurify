// convex/convex.config.ts
import workflow from "@convex-dev/workflow/convex.config.js";
import { defineApp } from "convex/server";
import polar from "@convex-dev/polar/convex.config.js";
import r2 from "@convex-dev/r2/convex.config.js";
import aggregate from "@convex-dev/aggregate/convex.config.js";


const app = defineApp();
app.use(workflow);
app.use(polar);
app.use(r2);
app.use(aggregate);


export default app;