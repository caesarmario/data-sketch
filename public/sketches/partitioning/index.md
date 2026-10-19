# Partitioning: Why Scanning Less Data Matters

> Scanning more data than a query needs can increase runtime and cost. Partitioning can reduce that work when the query can skip irrelevant partitions; it does not make every query faster.

October 2026 | Warehouse

Tags: Partitioning, Query Performance, Data Scanning

Canonical page: https://datasketch.caesarmar.io/sketches/partitioning/

![Partitioning diagram showing how scanning less data can reduce query work and improve performance and cost](https://datasketch.caesarmar.io/images/data-sketch/data-sketch-episode-09.jpg)

## Reading the sketch

### Review how much data is scanned

Check whether the query reads data beyond what it needs for the result.

### Organize data into partitions

Partitioning separates data into groups that the query engine may be able to read independently.

### Skip irrelevant partitions

The benefit depends on whether the query can avoid reading partitions it does not need. A query that scans most partitions may gain little.

### Check the actual result

Compare the scanning work and runtime after the change. Cost savings depend on the platform and how it charges for the workload.

## Takeaway

Partitioning helps when it reduces the data a query reads. Verify that the workload can use it before expecting lower runtime or cost.

## Sources

- [Original LinkedIn post](https://lnkd.in/p/gbbYGrdV)
- [Mario Caesar](https://caesarmar.io/index.md)
