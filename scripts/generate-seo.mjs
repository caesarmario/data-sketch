import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateFiles } from './seo.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
let stale = false;
for (const [name, content] of Object.entries(generateFiles())) {
  const target = path.join(root, 'public', name);
  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === content) continue;
  if (check) { console.error(`Stale SEO asset: ${name}`); stale = true; }
  else { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content); }
}
if (stale) process.exitCode = 1;
else console.log(check ? 'SEO source assets verified.' : 'SEO source assets generated.');
