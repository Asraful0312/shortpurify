# Aggregate

# Efficiently manage denormalized sums and counts in Convex databases without performance bottlenecks or data consistency issues.

# Category: Database

## Install

- Command: npm install @convex-dev/aggregate

## Links

- Directory: https://www.convex.dev/components/aggregate
- Markdown: https://www.convex.dev/components/aggregate/aggregate.md
- llms.txt: https://www.convex.dev/components/aggregate/llms.txt
- npm: https://www.npmjs.com/package/%40convex-dev%2Faggregate
- GitHub: https://github.com/get-convex/aggregate

## Details

- Version: 0.2.1
- Weekly downloads: 26,208
- Author: get-convex

## Description

The Aggregate component maintains denormalized counts and sums for efficient data aggregation in O(log n) time instead of O(n) table scans. It provides sorted key-value storage with range queries, supporting arbitrary Convex values as keys for flexible grouping and partitioning. The component handles both table-based aggregation with automatic sync and lower-level manual operations.

## Use Cases

- **Building leaderboards and rankings** where you need to quickly find percentile scores, user rankings, or counts above/below thresholds without scanning all records
- **Implementing offset-based pagination** for traditional page-by-page navigation through large datasets, complementing Convex's cursor-based pagination
- **Creating random access patterns** like shuffling playlists or selecting random items by using total counts and index-based lookups
- **Tracking analytics and metrics** such as message counts per time period, user activity summaries, or grouped statistics across multiple dimensions
- **Supporting multi-tenant applications** using namespaces to isolate aggregations per tenant while maintaining high throughput

## How It Works

You define a `TableAggregate` instance that specifies how to extract sort keys and sum values from your table documents. The component maintains a separate denormalized data structure that stays in sync as you call `insert()`, `replace()`, and `delete()` methods alongside your regular database operations.

The aggregate supports flexible grouping through tuple-based sort keys like `[game, username, score]` and prefix-based queries to aggregate at different levels. For completely separate data partitions, namespaces provide isolated aggregation with higher throughput by avoiding interference between unrelated data.

Core query methods include `count()` for totals within bounds, `sum()` for value aggregation, `at()` for index-based access, `indexOf()` for ranking, and `max()`/`min()` for extremes. All operations work with optional bounds and prefix filters to scope queries to specific data ranges.
