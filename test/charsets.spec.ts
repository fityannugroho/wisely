import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { CharSet, isCharSetValid } from '~/index.js';

test.each([
  { name: 'latin' },
  { name: 'latin-1' },
])('validate charSet: $name', ({ name }) => {
  const strJson = fs.readFileSync(
    path.resolve(__dirname, `../charsets/${name}.json`),
    { encoding: 'utf8' },
  );

  const charSet = JSON.parse(strJson) as CharSet;
  expect(isCharSetValid(charSet)).toBe(true);
});
