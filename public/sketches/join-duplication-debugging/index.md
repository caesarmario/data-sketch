# Join Duplication Debugging Workflow

> When a join pushes the numbers up, I check row counts and aggregation first. Then I work through key uniqueness, table grain, join type, and null behavior before changing the query.

April 2026 | SQL

Tags: SQL, Joins, Debugging

Canonical page: https://datasketch.caesarmar.io/sketches/join-duplication-debugging/

![Data Sketch Episode 2: Join Duplication Debugging Workflow](https://datasketch.caesarmar.io/images/data-sketch/data-sketch-episode-02.jpg)

## Reading the sketch

### Confirm the symptom

Compare row counts and metrics before and after the join.

### Check aggregation and keys

Review the aggregation logic and test whether the join keys are unique.

### Compare table grain

Check whether both sides of the join describe data at the same grain.

### Inspect join behavior

Review the join type and look for unexpected nulls or dropped rows.

### Trace the cause

Use the evidence from each check to identify the root cause before changing the query.

## Takeaway

Follow the row counts, keys, grain, and join behavior in order. Each check narrows the cause of duplicated or missing results.

## Sources

- [Original LinkedIn post](https://www.linkedin.com/posts/caesarmario_sql-dataengineering-analyticsengineering-activity-7447440590171979776-NY45)
- [Mario Caesar](https://caesarmar.io/index.md)
