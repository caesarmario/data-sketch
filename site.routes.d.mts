export type GalleryRoute = {
  kind: 'gallery';
  path: '/';
  output: 'index.html';
  title: string;
  description: string;
};

export type LessonRoute = {
  kind: 'lesson';
  path: string;
  output: string;
  slug: string;
  episodeId: number;
  title: string;
  description: string;
};

export type SiteRoute = GalleryRoute | LessonRoute;

export const routeManifest: readonly SiteRoute[];
export const routeAliases: ReadonlyMap<string, string>;
export function findRoute(pathname: string): SiteRoute | undefined;
export function findAlias(pathname: string): string | undefined;
