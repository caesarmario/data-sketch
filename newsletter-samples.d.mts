export type NewsletterSample = { id: number; title: string; lessonPath: string; image: string; imageAlt: string };
export function selectSampleIds(ids: readonly number[], count?: number, random?: () => number): number[];
export const newsletterSampleBootScript: string;
export function bootstrapNewsletterSamples(catalog: readonly NewsletterSample[], selectIds: typeof selectSampleIds, doc?: Document): boolean;
