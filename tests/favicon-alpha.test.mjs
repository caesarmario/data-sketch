import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { inflateSync } from 'node:zlib';

// Decode the generated 8-bit RGBA PNGs so an opaque RGBA export cannot pass.
function decodeRgba(bytes) {
  assert.equal(bytes[24], 8);
  assert.equal(bytes[25], 6);
  assert.equal(bytes[28], 0);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  const chunks = [];
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const rows = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  assert.equal(rows.length, (stride + 1) * height);
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = rows[y * (stride + 1)];
    assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const index = y * stride + x;
      const left = x >= 4 ? pixels[index - 4] : 0;
      const up = y ? pixels[index - stride] : 0;
      const corner = y && x >= 4 ? pixels[index - stride - 4] : 0;
      const p = left + up - corner;
      const distances = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - corner)];
      const paeth = distances[0] <= distances[1] && distances[0] <= distances[2] ? left : distances[1] <= distances[2] ? up : corner;
      const predictor = [0, left, up, Math.floor((left + up) / 2), paeth][filter];
      pixels[index] = (rows[y * (stride + 1) + 1 + x] + predictor) & 255;
    }
  }
  return { width, height, pixels };
}

function assertTransparent(bytes, label) {
  const { width, height, pixels } = decodeRgba(bytes);
  for (const index of [0, width - 1, width * (height - 1), width * height - 1]) {
    assert.equal(pixels[index * 4 + 3], 0, `${label}: opaque corner`);
  }
  let transparent = 0, visible = 0, partial = 0, white = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3];
    if (alpha === 0) transparent++;
    if (alpha > 0) visible++;
    if (alpha > 0 && alpha < 255) partial++;
    if (alpha === 255 && pixels[index] >= 250 && pixels[index + 1] >= 250 && pixels[index + 2] >= 250) white++;
  }
  assert.ok(transparent > width * height / 2, `${label}: background lost its alpha`);
  assert.ok(visible > 0, `${label}: artwork missing`);
  assert.ok(partial > 0, `${label}: antialiased transparency missing`);
  assert.equal(white, 0, `${label}: opaque white background introduced`);
}

test('favicon master, PNG variants and Apple icon preserve real pixel transparency', () => {
  const manifest = JSON.parse(fs.readFileSync('design/brand/manifest.json', 'utf8'));
  assert.equal(manifest.favicon.background, 'transparent');
  for (const file of ['design/brand/favicon-master.png', 'public/favicon-16x16.png', 'public/favicon-32x32.png', 'public/favicon-96x96.png', 'public/apple-touch-icon.png']) {
    const bytes = fs.readFileSync(file);
    assertTransparent(bytes, file);
    if (file.startsWith('public/')) assert.deepEqual(fs.readFileSync(file.replace(/^public\//, 'dist/')), bytes);
  }
});

test('all three ICO frames retain transparent padding and antialiased alpha', () => {
  const ico = fs.readFileSync('public/favicon.ico');
  assert.deepEqual(fs.readFileSync('dist/favicon.ico'), ico);
  assert.equal(ico.readUInt16LE(4), 3);
  for (let index = 0; index < 3; index++) {
    const entry = 6 + index * 16;
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assertTransparent(ico.subarray(offset, offset + length), `ICO ${ico[entry]}px`);
  }
});
