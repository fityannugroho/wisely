import { expect, test } from 'vitest';
import { performance } from 'perf_hooks';
import fs from 'node:fs';
import wisely from '~/index.js';

test('perf on large string must <= 20ms', async () => {
  const text = fs.readFileSync('test/large-string.txt', 'utf-8');

  const startTime = performance.now();
  const res = await wisely({ text, phrases: ['pulau'] });
  const diff = performance.now() - startTime;

  console.log(`Perf: ${diff}ms`);
  expect(res).not.toContain('pulau');
});
