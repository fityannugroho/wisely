import { expect, test } from 'vitest';
import { performance } from 'perf_hooks';
import fs from 'node:fs';
import wisely from '~/index.js';

test('large text', () => {
  const text = fs.readFileSync('test/large-string.txt', 'utf-8');

  const startTime = performance.now();
  const res = wisely({ text, phrases: ['pulau'] });
  const diff = performance.now() - startTime;

  console.log(`Perf: ${diff}ms`);
  expect(res).not.toContain('pulau');
});
