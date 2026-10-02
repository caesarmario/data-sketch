import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { generateFiles, isPreview, renderHead, replaceHead } from './seo.mjs';
import { siteConfig } from '../site.config.mjs';
import { routeManifest } from '../site.routes.mjs';

await build();
await build({ build: { ssr: 'src/entry-server.tsx', outDir: 'artifacts/ssr', emptyOutDir: true } });
const { render } = await import('../artifacts/ssr/entry-server.js');
const root = fileURLToPath(new URL('../', import.meta.url));
const htmlPath = path.join(root, 'dist', 'index.html');
const template = await fs.readFile(htmlPath, 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('Prerender placeholder missing');
const preview = isPreview();
const analyticsToken = process.env[siteConfig.analyticsTokenEnv] ?? '';
for (const route of routeManifest) {
  const output = path.join(root, 'dist', route.output);
  const html = replaceHead(template, renderHead({ route, preview, analyticsToken }))
    .replace('<!--app-html-->', render(route.path));
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, html);
}
for (const [name, content] of Object.entries(generateFiles({ preview }))) {
  await fs.writeFile(new URL(`../dist/${name}`, import.meta.url), content);
}
console.log(`Prerendered ${routeManifest.length} public pages; indexing: ${preview ? 'disabled (preview)' : 'production'}.`);
