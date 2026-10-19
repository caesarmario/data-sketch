import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Offline tooling only. The site build serves committed assets and does not need Sharp.
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch { throw new Error('Asset generation requires Sharp in the tooling environment (or NODE_PATH). It is not a site runtime dependency.'); }

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = path.join(root, 'design', 'brand');
const publicDir = path.join(root, 'public');
const args = process.argv.slice(2);
const inputs = new Map();
for (let index = 0; index < args.length; index += 2) {
  if (!['--logo', '--og'].includes(args[index]) || !args[index + 1]) throw new Error('Usage: node scripts/generate-brand-assets.mjs [--logo file.png] [--og file.png]');
  inputs.set(args[index], path.resolve(args[index + 1]));
}
await fs.mkdir(sourceDir, { recursive: true });
const sourcePaths = { logo: path.join(sourceDir, 'favicon-source.png'), og: path.join(sourceDir, 'og-image-source.png') };
for (const [key, flag] of [['logo', '--logo'], ['og', '--og']]) {
  if (inputs.has(flag) && inputs.get(flag) !== sourcePaths[key]) await fs.copyFile(inputs.get(flag), sourcePaths[key]);
}
const logo = await fs.readFile(sourcePaths.logo);
const og = await fs.readFile(sourcePaths.og);
const logoMetadata = await sharp(logo).metadata();
const ogMetadata = await sharp(og).metadata();
if (logoMetadata.format !== 'png' || ogMetadata.format !== 'png') throw new Error('Both brand sources must be PNG files');

// Trim only the outer white canvas, including every nonwhite antialiased edge pixel.
const { data, info } = await sharp(logo).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let left = info.width, top = info.height, right = -1, bottom = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const offset = (y * info.width + x) * info.channels;
    if (data[offset] < 255 || data[offset + 1] < 255 || data[offset + 2] < 255) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
}
if (right < left) throw new Error('The favicon source contains no nonwhite artwork');
const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
const master = await sharp(logo).flatten({ background: '#fff' }).extract(crop)
  .resize(472, 472, { fit: 'contain', background: '#fff' })
  .extend({ top: 20, bottom: 20, left: 20, right: 20, background: '#fff' })
  .png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
await fs.writeFile(path.join(sourceDir, 'favicon-master.png'), master);

const icons = new Map();
for (const size of [16, 32, 48, 96, 180]) {
  icons.set(size, await sharp(master).resize(size, size).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer());
}
for (const size of [16, 32, 96]) await fs.writeFile(path.join(publicDir, `favicon-${size}x${size}.png`), icons.get(size));
await fs.writeFile(path.join(publicDir, 'apple-touch-icon.png'), icons.get(180));

// ICO directory entries point to actual PNG frames, not a PNG renamed to .ico.
const sizes = [16, 32, 48];
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
sizes.forEach((size, index) => {
  const frame = icons.get(size);
  const entry = 6 + index * 16;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await fs.writeFile(path.join(publicDir, 'favicon.ico'), Buffer.concat([directory, ...sizes.map(size => icons.get(size))]));

const ogOutput = await sharp(og).resize(1200, 630, { fit: 'contain', background: '#000' })
  .png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
await fs.writeFile(path.join(publicDir, 'og-image.png'), ogOutput);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = {
  sources: {
    logo: { file: 'favicon-source.png', width: logoMetadata.width, height: logoMetadata.height, sha256: digest(logo) },
    og: { file: 'og-image-source.png', width: ogMetadata.width, height: ogMetadata.height, sha256: digest(og) },
  },
  favicon: { crop, masterSize: 512, outerPadding: 20, icoSizes: sizes, pngSizes: [16, 32, 96], appleTouchSize: 180 },
  og: { width: 1200, height: 630, sha256: digest(ogOutput), rgbaSha256: digest(await sharp(ogOutput).ensureAlpha().raw().toBuffer()) },
};
await fs.writeFile(path.join(sourceDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
