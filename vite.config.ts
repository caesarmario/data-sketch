import { defineConfig, type Plugin, type Connect } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHead, renderNotFound, isPreview } from './scripts/seo.mjs';
import { siteConfig } from './site.config.mjs';
import { findAlias, findRoute, routeManifest } from './site.routes.mjs';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)));

// Vite does not interpret Netlify routing files. Keep local unknown routes honest.
function routeGuard(base: string, dev: boolean): Connect.NextHandleFunction {
  return (req, res, next) => {
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
    const alias = findAlias(pathname);
    if (alias) {
      res.writeHead(301, { Location: alias, 'Cache-Control': 'no-store' }); res.end(); return;
    }
    if (findRoute(pathname)) { next(); return; }
    let localPath: string;
    try { localPath = path.resolve(base, '.' + decodeURIComponent(pathname)); }
    catch { res.statusCode = 400; res.end('Bad request'); return; }
    const inRoot = localPath.startsWith(base + path.sep);
    const internal = dev && /^\/(?:@vite\/|@react-refresh|@id\/|@fs\/|node_modules\/|src\/)/.test(pathname);
    const existingFile = inRoot && fs.existsSync(localPath) && fs.statSync(localPath).isFile();
    const publicFile = dev && inRoot && fs.existsSync(path.join(base, 'public', path.relative(base, localPath))) && fs.statSync(path.join(base, 'public', path.relative(base, localPath))).isFile();
    if (pathname !== '/404.html' && (internal || existingFile || publicFile)) { next(); return; }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' });
    res.end(renderNotFound());
  };
}

export default defineConfig(({ command }) => {
  const seo: Plugin = {
    name: 'data-sketch-seo',
    transformIndexHtml(html, context) {
      const pathname = context.path === '/index.html' ? '/' : context.path;
      const route = findRoute(pathname) ?? routeManifest[0];
      return html.replace('<!--seo-head-->', renderHead({ route, preview: command === 'serve' || isPreview(), analyticsToken: process.env[siteConfig.analyticsTokenEnv] ?? '' }));
    },
    configureServer(server) { server.middlewares.use(routeGuard(root, true)); },
    configurePreviewServer(server) { server.middlewares.use(routeGuard(path.join(root, 'dist'), false)); },
  };
  return { plugins: [react(), seo], server: { host: '127.0.0.1', strictPort: true }, preview: { host: '127.0.0.1', strictPort: true } };
});
