import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const sources = readdirSync('components').filter(name => name.endsWith('.tsx')).map(name => ({name, source:readFileSync(join('components',name),'utf8')}));

test('static frontend route links point to implemented pages', () => {
  for (const {name, source} of sources) {
    for (const match of source.matchAll(/href="(\/[^"{}]*)"/g)) {
      const path = match[1].split(/[?#]/)[0];
      if (path.startsWith('/api/') || path.startsWith('//')) continue;
      assert.ok(existsSync(join('app',path.slice(1),'page.tsx')), `${name} links to missing route ${path}`);
    }
  }
});
test('navigation has no empty placeholder href or nonexistent blog route', () => {
  for (const {name, source} of sources) {
    assert.doesNotMatch(source, /href=["']#["']/, `${name} has an empty placeholder link`);
    assert.doesNotMatch(source, /href=["']\/blog["']/, `${name} has an unimplemented blog route`);
  }
});
test('homepage fragment links refer to real section IDs', () => {
  const homepage = readFileSync('components/homepage.tsx','utf8');
  const map = readFileSync('components/nigeria-trip-map.tsx','utf8');
  for (const match of homepage.matchAll(/(?:href="\/?#|"\/#)([a-z-]+)"/g)) {
    assert.ok((homepage + map).includes(`id="${match[1]}"`), `Missing homepage section ${match[1]}`);
  }
});
