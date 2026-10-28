export type PublishedSketch = {
  status: 'published';
  href: string;
  lessonPath: string;
  image: string;
  imageAlt: string;
  dateTime: string;
  month: string;
  modifiedAt: string;
  walkthrough: {
    heading: string;
    body: string;
  }[];
  takeaway: string;
};

type UpcomingSketch = {
  status: 'upcoming';
  teaserTitle: string;
  teaserDescription: string;
  href?: never;
  image?: never;
  imageAlt?: never;
};

export type Sketch = {
  id: number;
  title: string;
  lesson: string;
  date: string;
  category: string;
  tags: string[];
} & (PublishedSketch | UpcomingSketch);

export type SortOrder = 'oldest' | 'latest';

export function sortSketches(entries: readonly Sketch[], order: SortOrder) {
  const published = entries
    .filter(sketch => sketch.status === 'published')
    .sort((a, b) => order === 'latest' ? b.id - a.id : a.id - b.id);
  const upcoming = entries.filter(sketch => sketch.status === 'upcoming');
  return [...published, ...upcoming];
}

export const sketches: Sketch[] = [
  {
    id: 1, status: 'published', title: 'Backfill Playbook: From Request to Release',
    lesson: 'A backfill needs more than a rerun. I use five stages: define the scope, choose a strategy, run by partition, validate the result, and publish atomically.',
    date: 'Mar 2026', category: 'Pipelines', tags: ['Backfill', 'ETL', 'Release'],
    dateTime: '2026-03', month: 'March 2026', lessonPath: '/sketches/backfill-playbook/',
    modifiedAt: '2026-10-21',
    href: 'https://www.linkedin.com/posts/caesarmario_dataengineering-datapipelines-etl-activity-7434768333952020480-jUOO',
    image: '/images/data-sketch/data-sketch-episode-01.jpg',
    imageAlt: 'Data Sketch Episode 1: Backfill Playbook from Request to Release',
    walkthrough: [
      { heading: 'Intake', body: 'Define the scope first: the tables, date range, and owner.' },
      { heading: 'Plan', body: 'Choose the backfill strategy: recompute, rebuild, or patch.' },
      { heading: 'Run', body: 'Run by partition, track progress, and store the run ID.' },
      { heading: 'Validate', body: 'Check counts and uniqueness, then reconcile the metrics.' },
      { heading: 'Publish', body: 'Publish atomically by swapping tables or rebuilding marts, then monitor the release.' },
    ],
    takeaway: 'Treat a backfill like a release: define the scope, control the run, validate the result, and publish only when the gates pass.',
  },
  {
    id: 2, status: 'published', title: 'Join Duplication Debugging Workflow',
    lesson: 'When a join pushes the numbers up, I check row counts and aggregation first. Then I work through key uniqueness, table grain, join type, and null behavior before changing the query.',
    date: 'Apr 2026', category: 'SQL', tags: ['SQL', 'Joins', 'Debugging'],
    dateTime: '2026-04', month: 'April 2026', lessonPath: '/sketches/join-duplication-debugging/',
    modifiedAt: '2026-10-21',
    href: 'https://www.linkedin.com/posts/caesarmario_sql-dataengineering-analyticsengineering-activity-7447440590171979776-NY45',
    image: '/images/data-sketch/data-sketch-episode-02.jpg',
    imageAlt: 'Data Sketch Episode 2: Join Duplication Debugging Workflow',
    walkthrough: [
      { heading: 'Confirm the symptom', body: 'Compare row counts and metrics before and after the join.' },
      { heading: 'Check aggregation and keys', body: 'Review the aggregation logic and test whether the join keys are unique.' },
      { heading: 'Compare table grain', body: 'Check whether both sides of the join describe data at the same grain.' },
      { heading: 'Inspect join behavior', body: 'Review the join type and look for unexpected nulls or dropped rows.' },
      { heading: 'Trace the cause', body: 'Use the evidence from each check to identify the root cause before changing the query.' },
    ],
    takeaway: 'Follow the row counts, keys, grain, and join behavior in order. Each check narrows the cause of duplicated or missing results.',
  },
  {
    id: 3, status: 'published', title: 'Full Refresh vs Incremental Load',
    lesson: 'Full refresh is simple and easier to trust while logic is still changing, but that simplicity gets expensive as data grows. This sketch is the checklist I use before moving into incremental loads: checkpoint, watermark, late updates, dedup, and merge safety.',
    date: 'May 2026', category: 'Pipelines', tags: ['Incremental Load', 'Full Refresh', 'Watermark'],
    dateTime: '2026-05', month: 'May 2026', lessonPath: '/sketches/full-refresh-vs-incremental-load/',
    modifiedAt: '2026-10-21',
    href: 'https://www.linkedin.com/posts/caesarmario_dataengineering-datapipelines-etl-share-7447951803163336704-gHz_/',
    image: '/images/data-sketch/data-sketch-episode-03.jpg',
    imageAlt: 'Data Sketch Episode 3: Full Refresh vs Incremental Load',
    walkthrough: [
      { heading: 'Full refresh fits simpler loads', body: 'It works well with simple logic, infrequent updates, and rebuild costs that remain acceptable.' },
      { heading: 'Full refresh needs fewer controls', body: 'A pipeline can rebuild without a reliable watermark or upsert support.' },
      { heading: 'Incremental load fits growing workloads', body: 'It becomes useful when data volume and refresh cost make full rebuilds too slow.' },
      { heading: 'Incremental load needs reliable state', body: 'The pipeline needs a dependable watermark and a way to handle upserts.' },
      { heading: 'Late updates affect the decision', body: 'Frequent late updates add another constraint to incremental processing.' },
    ],
    takeaway: 'Full refresh keeps the logic simple. Incremental loading becomes more useful as data volume, refresh cost, and runtime grow.',
  },
  {
    id: 4, status: 'published', title: 'From Raw to Trusted: Bronze, Silver, and Gold',
    lesson: 'Getting data into a warehouse does not make it trusted. This sketch follows raw landed data through cleaning and standardization, then into business-ready datasets.',
    date: 'Jun 2026', category: 'Warehouse', tags: ['Bronze Silver Gold', 'Lakehouse', 'Data Modeling'],
    dateTime: '2026-06', month: 'June 2026', lessonPath: '/sketches/bronze-silver-gold/',
    modifiedAt: '2026-10-21',
    href: 'https://www.linkedin.com/posts/caesarmario_dataengineering-dataarchitecture-datawarehouse-activity-7477530103883673600-Ur5L',
    image: '/images/data-sketch/data-sketch-episode-04.jpg',
    imageAlt: 'Data Sketch Episode 4: From Raw to Trusted with Bronze, Silver, and Gold layers',
    walkthrough: [
      { heading: 'Bronze: raw landed data', body: 'The bronze layer receives data from source systems with minimal transformation.' },
      { heading: 'Silver: cleaned and standardized data', body: 'The silver layer cleans, standardizes, and deduplicates the landed data.' },
      { heading: 'Gold: business-ready trusted data', body: 'The gold layer turns prepared data into datasets for business use.' },
    ],
    takeaway: 'Each layer has a distinct job: land the source data, improve its quality, then shape it for business use.',
  },
  {
    id: 5, status: 'published', title: 'Safe Publish Pattern Flow',
    lesson: 'Prepare new data in a staging table, validate it, and publish only after the checks pass. This flow keeps failed results away from the target and includes monitoring after release.',
    date: 'Jul 2026', category: 'Pipelines', tags: ['Staging', 'Data Validation', 'Atomic Publish'],
    dateTime: '2026-07', month: 'July 2026', lessonPath: '/sketches/safe-publish-pattern/',
    modifiedAt: '2026-10-21',
    href: 'https://lnkd.in/p/g7Qw3Uvf',
    image: '/images/data-sketch/data-sketch-episode-05.jpg',
    imageAlt: 'Safe publish flow from building and staging data through validation, publishing, and monitoring, with a failure branch',
    walkthrough: [
      { heading: 'Build the new data', body: 'Run the transformation and prepare the new output.' },
      { heading: 'Write to staging', body: 'Keep the new result in a temporary or staging table instead of writing straight to the target.' },
      { heading: 'Validate before publishing', body: 'Check row counts, uniqueness, nulls, and reconciliation of the key metrics.' },
      { heading: 'Stop if validation fails', body: 'Halt the release and investigate the failed checks before replacing the target.' },
      { heading: 'Publish the validated result', body: 'Use an atomic swap or promotion where the target system supports it. The trusted table should change only when the new data is ready.' },
      { heading: 'Monitor after release', body: 'Check downstream dashboards, confirm freshness, and watch for anomalies after publishing.' },
    ],
    takeaway: 'Keep the current target available while preparing and validating its replacement. Failed checks should stop the release; successful checks still need follow-up monitoring.',
  },
  {
    id: 6, status: 'published', title: 'A Simple Reconciliation Workflow',
    lesson: 'A count mismatch is a starting point for investigation. Compare the date range, filters, grain, keys, pipeline stage, and late updates to understand why source and target results differ.',
    date: 'Aug 2026', category: 'Data Quality', tags: ['Reconciliation', 'Data Validation', 'Debugging'],
    dateTime: '2026-08', month: 'August 2026', lessonPath: '/sketches/reconciliation-workflow/',
    modifiedAt: '2026-10-21',
    href: 'https://lnkd.in/p/gEqAwxzN',
    image: '/images/data-sketch/data-sketch-episode-06.jpg',
    imageAlt: 'Reconciliation funnel checking count mismatch, date range, filters, grain, keys, pipeline stage, and late updates',
    walkthrough: [
      { heading: 'Confirm the mismatch', body: 'Identify which source and target counts differ before changing the pipeline.' },
      { heading: 'Align the date range', body: 'Compare the same date range or partition window on both sides.' },
      { heading: 'Compare the filters', body: 'Check that the WHERE conditions select comparable records.' },
      { heading: 'Check the grain', body: 'Confirm what each row represents. Counts at different grains are not directly comparable.' },
      { heading: 'Inspect the keys', body: 'Look for missing keys and duplicate rows that could explain the difference.' },
      { heading: 'Locate the pipeline stage', body: 'Determine which processing stage each dataset represents before comparing the results.' },
      { heading: 'Check late updates', body: 'Review delayed records and source changes that may not have reached the target yet.' },
    ],
    takeaway: 'Make the two sides comparable before treating a count difference as missing data. Date windows, filters, grain, and processing state all affect the result.',
  },
  {
    id: 7, status: 'published', title: 'Late-Arriving Data',
    lesson: 'Data can reach a pipeline after the period it belongs to. Historical edits, backdated transactions, batch uploads, network lag, and delayed source systems are five causes to check.',
    date: 'Aug 2026', category: 'Pipelines', tags: ['Late-Arriving Data', 'Source Updates', 'Batch Processing'],
    dateTime: '2026-08', month: 'August 2026', lessonPath: '/sketches/late-arriving-data/',
    modifiedAt: '2026-10-21',
    href: 'https://lnkd.in/p/ghHjf7Eb',
    image: '/images/data-sketch/data-sketch-episode-07.jpg',
    imageAlt: 'Five causes of late-arriving data: historical edits, backdated transactions, batch delays, network lag, and source delays',
    walkthrough: [
      { heading: 'Updated historical records', body: 'A source can modify a record after the pipeline has already processed its original value.' },
      { heading: 'Backdated transactions', body: 'A newly entered transaction can carry an older business date.' },
      { heading: 'Batch upload delays', body: 'A source may hold records until its next batch upload or processing run.' },
      { heading: 'API or network lag', body: 'Slow transmission can delay when records become available to the pipeline.' },
      { heading: 'Delayed source systems', body: 'A source can deliver data after the downstream pipeline has already run.' },
    ],
    takeaway: 'The date a record describes and the time it becomes available can differ. Check how the source creates, changes, and delivers records when investigating late data.',
  },
  {
    id: 8, status: 'published', title: 'Data Freshness',
    lesson: 'A successful pipeline run can still leave users with stale data. Check the latest timestamp, expected partition, row volume, source delay, and freshness SLA before treating the result as ready.',
    date: 'Sep 2026', category: 'Data Quality', tags: ['Data Freshness', 'Monitoring', 'SLA'],
    dateTime: '2026-09', month: 'September 2026', lessonPath: '/sketches/data-freshness/',
    modifiedAt: '2026-10-21',
    href: 'https://lnkd.in/p/gdfHCzTz',
    image: '/images/data-sketch/data-sketch-episode-08.jpg',
    imageAlt: 'Freshness checks after pipeline success, with publish and notify or alert, investigate, and communicate outcomes',
    walkthrough: [
      { heading: 'Check the latest timestamp', body: 'Inspect how recent the available data is, even when the pipeline reports success.' },
      { heading: 'Check the expected partition', body: 'Confirm that the partition needed for this delivery is present.' },
      { heading: 'Review the row volume', body: 'Check the amount of data received for the expected delivery.' },
      { heading: 'Check for source delay', body: 'Determine whether the source has delivered the data required for the refresh.' },
      { heading: 'Compare with the freshness SLA', body: 'Check whether the data meets the agreed freshness requirement.' },
      { heading: 'Choose the delivery outcome', body: 'Publish and notify users when the checks pass. If a check fails, alert, investigate, and communicate the delay.' },
    ],
    takeaway: 'Use freshness checks alongside pipeline status. Users need to know whether the expected data arrived and meets the delivery requirement.',
  },
  {
    id: 9, status: 'published', title: 'Partitioning: Why Scanning Less Data Matters',
    lesson: 'Scanning more data than a query needs can increase runtime and cost. Partitioning can reduce that work when the query can skip irrelevant partitions; it does not make every query faster.',
    date: 'Oct 2026', category: 'Warehouse', tags: ['Partitioning', 'Query Performance', 'Data Scanning'],
    dateTime: '2026-10', month: 'October 2026', lessonPath: '/sketches/partitioning/',
    modifiedAt: '2026-10-21',
    href: 'https://lnkd.in/p/gbbYGrdV',
    image: '/images/data-sketch/data-sketch-episode-09.jpg',
    imageAlt: 'Partitioning diagram showing how scanning less data can reduce query work and improve performance and cost',
    walkthrough: [
      { heading: 'Review how much data is scanned', body: 'Check whether the query reads data beyond what it needs for the result.' },
      { heading: 'Organize data into partitions', body: 'Partitioning separates data into groups that the query engine may be able to read independently.' },
      { heading: 'Skip irrelevant partitions', body: 'The benefit depends on whether the query can avoid reading partitions it does not need. A query that scans most partitions may gain little.' },
      { heading: 'Check the actual result', body: 'Compare the scanning work and runtime after the change. Cost savings depend on the platform and how it charges for the workload.' },
    ],
    takeaway: 'Partitioning helps when it reduces the data a query reads. Verify that the workload can use it before expecting lower runtime or cost.',
  },
  {
    id: 10, status: 'upcoming', title: 'Upcoming episode',
    lesson: 'Episode 10 is planned. Its topic has not been announced.',
    date: 'Coming Soon', category: 'Coming Soon', tags: ['Coming Soon', 'Data Sketch'],
    teaserTitle: 'Upcoming episode', teaserDescription: 'Topic to be announced.',
  },
  {
    id: 11, status: 'upcoming', title: 'Upcoming episode',
    lesson: 'Episode 11 is planned. Its topic has not been announced.',
    date: 'Coming Soon', category: 'Coming Soon', tags: ['Coming Soon', 'Data Engineering'],
    teaserTitle: 'Upcoming episode', teaserDescription: 'Topic to be announced.',
  },
];

export function findPublishedSketch(id: number) {
  const sketch = sketches.find(entry => entry.id === id);
  return sketch?.status === 'published' ? sketch : undefined;
}
