/**
 * Convex Aggregate component instances.
 *
 * projectsAggregate — keyed by (namespace=userId, sortKey=_creationTime)
 *   sumValue = clipsCount  →  .sum() gives total clips for a user
 *   .count()              →  total projects for a user
 *
 * scheduledAggregate — keyed by (namespace=userId, sortKey=[status, platform, _creationTime])
 *   .count({ prefix: ["published"] })           → total published for a user
 *   .count({ prefix: ["published", "tiktok"] }) → published to TikTok for a user
 */

import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";

export const projectsAggregate = new TableAggregate<{
  Namespace: Id<"users">;
  Key: number; // _creationTime — enables time-range queries
  DataModel: DataModel;
  TableName: "projects";
}>(components.projectsAggregate, {
  namespace: (doc) => doc.userId,
  sortKey: (doc) => doc._creationTime,
  sumValue: (doc) => doc.clipsCount ?? 0,
});

export const scheduledAggregate = new TableAggregate<{
  Namespace: Id<"users">;
  Key: [string, string, number]; // [status, platform, _creationTime]
  DataModel: DataModel;
  TableName: "scheduledPosts";
}>(components.scheduledAggregate, {
  namespace: (doc) => doc.userId,
  sortKey: (doc) => [doc.status, doc.platform, doc._creationTime],
});
