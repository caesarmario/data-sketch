# Data Sketch

> Visual notes on data pipelines, SQL, warehouses, and data quality, drawn from Mario Caesar's work in data engineering.

Canonical page: https://datasketch.caesarmar.io/

## Backfill Playbook: From Request to Release

March 2026 | Pipelines

A backfill needs more than a rerun. I use five stages: define the scope, choose a strategy, run by partition, validate the result, and publish atomically.

Tags: Backfill, ETL, Release

[Read the lesson](https://datasketch.caesarmar.io/sketches/backfill-playbook/index.md) | [Original LinkedIn post](https://www.linkedin.com/posts/caesarmario_dataengineering-datapipelines-etl-activity-7434768333952020480-jUOO)

## Join Duplication Debugging Workflow

April 2026 | SQL

When a join pushes the numbers up, I check row counts and aggregation first. Then I work through key uniqueness, table grain, join type, and null behavior before changing the query.

Tags: SQL, Joins, Debugging

[Read the lesson](https://datasketch.caesarmar.io/sketches/join-duplication-debugging/index.md) | [Original LinkedIn post](https://www.linkedin.com/posts/caesarmario_sql-dataengineering-analyticsengineering-activity-7447440590171979776-NY45)

## Full Refresh vs Incremental Load

May 2026 | Pipelines

Full refresh is simple and easier to trust while logic is still changing, but that simplicity gets expensive as data grows. This sketch is the checklist I use before moving into incremental loads: checkpoint, watermark, late updates, dedup, and merge safety.

Tags: Incremental Load, Full Refresh, Watermark

[Read the lesson](https://datasketch.caesarmar.io/sketches/full-refresh-vs-incremental-load/index.md) | [Original LinkedIn post](https://www.linkedin.com/posts/caesarmario_dataengineering-datapipelines-etl-share-7447951803163336704-gHz_/)

## From Raw to Trusted: Bronze, Silver, and Gold

June 2026 | Warehouse

Getting data into a warehouse does not make it trusted. This sketch follows raw landed data through cleaning and standardization, then into business-ready datasets.

Tags: Bronze Silver Gold, Lakehouse, Data Modeling

[Read the lesson](https://datasketch.caesarmar.io/sketches/bronze-silver-gold/index.md) | [Original LinkedIn post](https://www.linkedin.com/posts/caesarmario_dataengineering-dataarchitecture-datawarehouse-activity-7477530103883673600-Ur5L)
