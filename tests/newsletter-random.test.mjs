import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { selectSampleIds } from '../newsletter-samples.mjs';
import { newsletterConfig } from '../newsletter.config.mjs';
import { routeManifest } from '../site.routes.mjs';
import { renderHead, renderNewsletterSampleBootstrap } from '../scripts/seo.mjs';
import { loadTypeScriptModule } from '../scripts/load-typescript-module.mjs';
const { sketches } = await loadTypeScriptModule(process.cwd(), 'src/data/sketches.ts');
const published = sketches.filter(sketch => sketch.status === 'published').map(sketch => sketch.id);

const compiled = ts.transpileModule(fs.readFileSync('src/newsletterSamples.ts','utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function reader(random = () => .999) {
  const module = { exports: {} }; let choices = 0;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: name => {
    if (name === '../newsletter.config.mjs') return { newsletterConfig };
    if (name === './data/sketches') return { sketches };
    assert.equal(name, '../newsletter-samples.mjs');
    return { selectSampleIds: ids => { choices++; return selectSampleIds(ids, 2, random); } };
  } });
  return { get: module.exports.getNewsletterSampleIds, choices: () => choices };
}

test('sampling is without replacement, bounded, and leaves the source catalog intact', () => {
  const pool = [1,2,3,4];
  assert.deepEqual(selectSampleIds(pool,2,()=>0),[1,2]);
  assert.deepEqual(selectSampleIds(pool,2,()=>.999),[4,1]);
  assert.deepEqual(pool,[1,2,3,4]);
  assert.equal(selectSampleIds([1,1,2],5).length,2);
  assert.deepEqual(selectSampleIds(pool,0),[]); assert.deepEqual(selectSampleIds(pool,-1),[]);
});

test('all ten published episodes can be selected, including the latest episode 10', () => {
  const covered = new Set();
  for (let i=0;i<10;i++) {
    const r=reader(()=>i/10), ids=r.get({ querySelector:()=>null });
    assert.equal(ids.length,2); assert.equal(new Set(ids).size,2);
    for (const id of ids) { assert.ok(published.includes(id)); covered.add(id); }
  }
  assert.deepEqual([...covered].sort((a,b)=>a-b),published);
  assert.deepEqual(reader().get({ querySelector:()=>null }),[10,1]);
});

test('SSR and a failed parser bootstrap keep the existing published fallback cards', () => {
  const r=reader(); assert.deepEqual(r.get(),newsletterConfig.sampleEpisodeIds); assert.equal(r.choices(),0);
  const doc={ querySelector:()=>({ dataset:{ newsletterSampleIds:'2,8' } }) };
  assert.deepEqual(Array.from(r.get(doc)),[2,8]); assert.equal(r.choices(),0);
});

test('hydration consumes the parser choice and never rolls a second pair on rerender', () => {
  const r=reader(), marker={ dataset:{ newsletterSampleIds:'10,3' } }, doc={ querySelector:()=>marker };
  const first=r.get(doc); marker.dataset.newsletterSampleIds='4,5';
  assert.deepEqual(Array.from(first),[10,3]); assert.equal(r.get(doc),first); assert.equal(r.choices(),0);
});

test('CSR chooses once per document, while fresh documents get independent choices', () => {
  const r=reader(), a={ querySelector:()=>null }, b={ querySelector:()=>null };
  assert.equal(r.get(a),r.get(a)); assert.equal(r.choices(),1);
  r.get(b); assert.equal(r.choices(),2);
});

test('invalid, duplicate, or upcoming seeded IDs fall back to valid public lessons', () => {
  for (const value of ['11,12','2,2','10,13','bad','1,2,3']) {
    const r=reader(), ids=r.get({ querySelector:()=>({ dataset:{ newsletterSampleIds:value } }) });
    assert.deepEqual(ids,newsletterConfig.sampleEpisodeIds); assert.equal(r.choices(),0);
  }
});

test('only newsletter HTML carries the bounded parser bootstrap and published catalog', () => {
  for (const route of routeManifest) {
    const body=renderNewsletterSampleBootstrap(route), head=renderHead({route,preview:false});
    const html=fs.readFileSync(`dist/${route.output}`,'utf8');
    assert.equal(body.includes('data-newsletter-sample-selection'),route.kind==='newsletter');
    assert.equal(head.includes('data-newsletter-sample-boot'),route.kind==='newsletter');
    if (route.kind!=='newsletter') continue;
    assert.ok(body.includes('data-sketch-episode-10.jpg'));
    for (const id of [11,12,13]) assert.ok(!body.includes(`episode-${id}`));
    assert.ok(html.includes('data-newsletter-sample-ids="2,8"'));
    assert.equal((html.match(/data-newsletter-episode=/g)??[]).length,2);
    assert.ok(html.indexOf('<script data-newsletter-sample-selection>')>html.indexOf('</main>'));
    assert.ok(head.includes('5000'));
  }
});
