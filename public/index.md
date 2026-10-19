# Data Sketch

> Practical data engineering diagrams by Mario Caesar, with short lessons on SQL joins, backfills, data quality checks, and warehouse workflows.

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

## Safe Publish Pattern Flow

July 2026 | Pipelines

Prepare new data in a staging table, validate it, and publish only after the checks pass. This flow keeps failed results away from the target and includes monitoring after release.

Tags: Staging, Data Validation, Atomic Publish

[Read the lesson](https://datasketch.caesarmar.io/sketches/safe-publish-pattern/index.md) | [Original LinkedIn post](https://lnkd.in/p/g7Qw3Uvf)

## A Simple Reconciliation Workflow

August 2026 | Data Quality

A count mismatch is a starting point for investigation. Compare the date range, filters, grain, keys, pipeline stage, and late updates to understand why source and target results differ.

Tags: Reconciliation, Data Validation, Debugging

[Read the lesson](https://datasketch.caesarmar.io/sketches/reconciliation-workflow/index.md) | [Original LinkedIn post](https://lnkd.in/p/gEqAwxzN)

## Late-Arriving Data

August 2026 | Pipelines

Data can reach a pipeline after the period it belongs to. Historical edits, backdated transactions, batch uploads, network lag, and delayed source systems are five causes to check.

Tags: Late-Arriving Data, Source Updates, Batch Processing

[Read the lesson](https://datasketch.caesarmar.io/sketches/late-arriving-data/index.md) | [Original LinkedIn post](https://lnkd.in/p/ghHjf7Eb)

## Data Freshness

September 2026 | Data Quality

A successful pipeline run can still leave users with stale data. Check the latest timestamp, expected partition, row volume, source delay, and freshness SLA before treating the result as ready.

Tags: Data Freshness, Monitoring, SLA

[Read the lesson](https://datasketch.caesarmar.io/sketches/data-freshness/index.md) | [Original LinkedIn post](https://lnkd.in/p/gdfHCzTz)

## Partitioning: Why Scanning Less Data Matters

October 2026 | Warehouse

Scanning more data than a query needs can increase runtime and cost. Partitioning can reduce that work when the query can skip irrelevant partitions; it does not make every query faster.

Tags: Partitioning, Query Performance, Data Scanning

[Read the lesson](https://datasketch.caesarmar.io/sketches/partitioning/index.md) | [Original LinkedIn post](https://lnkd.in/p/gbbYGrdV)
