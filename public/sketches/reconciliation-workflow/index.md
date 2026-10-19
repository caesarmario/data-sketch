# A Simple Reconciliation Workflow

> A count mismatch is a starting point for investigation. Compare the date range, filters, grain, keys, pipeline stage, and late updates to understand why source and target results differ.

August 2026 | Data Quality

Tags: Reconciliation, Data Validation, Debugging

Canonical page: https://datasketch.caesarmar.io/sketches/reconciliation-workflow/

![Reconciliation funnel checking count mismatch, date range, filters, grain, keys, pipeline stage, and late updates](https://datasketch.caesarmar.io/images/data-sketch/data-sketch-episode-06.jpg)

## Reading the sketch

### Confirm the mismatch

Identify which source and target counts differ before changing the pipeline.

### Align the date range

Compare the same date range or partition window on both sides.

### Compare the filters

Check that the WHERE conditions select comparable records.

### Check the grain

Confirm what each row represents. Counts at different grains are not directly comparable.

### Inspect the keys

Look for missing keys and duplicate rows that could explain the difference.

### Locate the pipeline stage

Determine which processing stage each dataset represents before comparing the results.

### Check late updates

Review delayed records and source changes that may not have reached the target yet.

## Takeaway

Make the two sides comparable before treating a count difference as missing data. Date windows, filters, grain, and processing state all affect the result.

## Sources

- [Original LinkedIn post](https://lnkd.in/p/gEqAwxzN)
- [Mario Caesar](https://caesarmar.io/index.md)
