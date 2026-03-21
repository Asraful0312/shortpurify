// convex/convex.config.ts
import workflow from "@convex-dev/workflow/convex.config.js";
import { defineApp } from "convex/server";
import cloudinary from "@imaxis/cloudinary-convex/convex.config";
import polar from "@convex-dev/polar/convex.config.js";
import uploadthingFileTracker from "@mzedstudio/uploadthingtrack/convex.config.js";
import r2 from "@convex-dev/r2/convex.config.js";


const app = defineApp();
app.use(workflow);
app.use(cloudinary);
app.use(polar);
app.use(r2);
app.use(uploadthingFileTracker, { name: "uploadthingFileTracker" });

export default app;