# Late-Arriving Data

> Data can reach a pipeline after the period it belongs to. Historical edits, backdated transactions, batch uploads, network lag, and delayed source systems are five causes to check.

August 2026 | Pipelines

Tags: Late-Arriving Data, Source Updates, Batch Processing

Canonical page: https://datasketch.caesarmar.io/sketches/late-arriving-data/

![Five causes of late-arriving data: historical edits, backdated transactions, batch delays, network lag, and source delays](https://datasketch.caesarmar.io/images/data-sketch/data-sketch-episode-07.jpg)

## Reading the sketch

### Updated historical records

A source can modify a record after the pipeline has already processed its original value.

### Backdated transactions

A newly entered transaction can carry an older business date.

### Batch upload delays

A source may hold records until its next batch upload or processing run.

### API or network lag

Slow transmission can delay when records become available to the pipeline.

### Delayed source systems

A source can deliver data after the downstream pipeline has already run.

## Takeaway

The date a record describes and the time it becomes available can differ. Check how the source creates, changes, and delivers records when investigating late data.

## Sources

- [Original LinkedIn post](https://lnkd.in/p/ghHjf7Eb)
- [Mario Caesar](https://caesarmar.io/index.md)
