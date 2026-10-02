export type PublishedSketch = {
  status: 'published';
  href: string;
  lessonPath: string;
  image: string;
  imageAlt: string;
  dateTime: string;
  month: string;
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
  return [...entries].sort((a, b) => order === 'latest' ? b.id - a.id : a.id - b.id);
}

export const sketches: Sketch[] = [
  {
    id: 1, status: 'published', title: 'Backfill Playbook: From Request to Release',
    lesson: 'A backfill needs more than a rerun. I use five stages: define the scope, choose a strategy, run by partition, validate the result, and publish atomically.',
    date: 'Mar 2026', category: 'Pipelines', tags: ['Backfill', 'ETL', 'Release'],
    dateTime: '2026-03', month: 'March 2026', lessonPath: '/sketches/backfill-playbook/',
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
    id: 5, status: 'upcoming', title: 'Upcoming episode',
    lesson: 'Episode 05 is planned. Its topic has not been announced.',
    date: 'Coming Soon', category: 'Coming Soon', tags: ['Coming Soon', 'Data Sketch'],
    teaserTitle: 'Upcoming episode', teaserDescription: 'Topic to be announced.',
  },
  {
    id: 6, status: 'upcoming', title: 'Upcoming episode',
    lesson: 'Episode 06 is planned. Its topic has not been announced.',
    date: 'Coming Soon', category: 'Coming Soon', tags: ['Coming Soon', 'Data Engineering'],
    teaserTitle: 'Upcoming episode', teaserDescription: 'Topic to be announced.',
  },
];

export function findPublishedSketch(id: number) {
  const sketch = sketches.find(entry => entry.id === id);
  return sketch?.status === 'published' ? sketch : undefined;
}
