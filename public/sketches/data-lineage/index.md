# Data Lineage: What Breaks If This Table Changes?

> Before you change a table, trace its sources and see which dashboards and pipelines depend on it.

November 2026 | Data Governance

Tags: Data Lineage, Data Architecture, Data Governance

Canonical page: https://datasketch.caesarmar.io/sketches/data-lineage/

![A Newton’s cradle illustrates how a table change leads to upstream and downstream checks, dashboard and pipeline impact, and consumer notification.](https://datasketch.caesarmar.io/images/data-sketch/data-sketch-episode-11.jpg)

## LinkedIn caption

[Data Sketch #11] 🧬 Data Lineage: What Breaks If This Table Changes?

Welcome back to Data Sketch. One diagram, one lesson from things I’ve learned in data engineering ✍️

Changing a table can look harmless.

Rename one column.
Change a data type.
Adjust one piece of business logic.

The pipeline still runs, so everything should be fine... right?

Not always.

That table might feed another transformation. That transformation might build a mart. The mart might power several dashboards, extracts, or even another pipeline.

Suddenly, a small upstream change has a much bigger blast radius than expected.

This is why I find data lineage useful.

Before changing an important table, I want to understand where the data comes from, what transforms it, and most importantly, who depends on it downstream.

For me, lineage is not just a nice graph in a catalog.

It helps answer a very practical question:
If I change this table, what could I break?

Knowing that before deployment makes schema changes, logic changes, and deprecations much safer.

This diagram is the simple mental model I use when thinking about upstream and downstream impact 🧬

Curious: how do you usually check downstream dependencies before changing a table?

Tags:
#DataEngineering #DataLineage #DataArchitecture #DataWarehouse #DataGovernance #DataPipelines #AnalyticsEngineering #DataOps

## Reading the sketch

### Trace the upstream inputs

Find the source data and transformations that feed the table you plan to change.

### Follow the downstream dependencies

Check the transformations and marts that read the table, then follow them to the dashboards, extracts, and pipelines they feed.

### Notify affected consumers

Tell the people who depend on the changed data what will change before you deploy.

## Takeaway

Before you rename a column or change its type, use lineage to find the consumers that could break even if the pipeline still runs.

## Sources

- [Original LinkedIn post](https://lnkd.in/p/ghrbtu9Z)
- [Mario Caesar](https://caesarmar.io/index.md)
