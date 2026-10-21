export type GalleryRoute = {
  kind: 'gallery';
  path: '/';
  output: 'index.html';
  title: string;
  description: string;
  markdownPath: string;
  markdownOutput: string;
};

export type LessonRoute = {
  kind: 'lesson';
  path: string;
  output: string;
  slug: string;
  episodeId: number;
  title: string;
  description: string;
  markdownPath: string;
  markdownOutput: string;
};

export type InformationRoute = {
  kind: 'newsletter' | 'privacy';
  path: string;
  output: string;
  title: string;
  description: string;
  markdownPath: string;
  markdownOutput: string;
  modifiedAt: string;
};

export type SiteRoute = GalleryRoute | LessonRoute | InformationRoute;

export const routeManifest: readonly SiteRoute[];
export const routeAliases: ReadonlyMap<string, string>;
export function findRoute(pathname: string): SiteRoute | undefined;
export function findAlias(pathname: string): string | undefined;
