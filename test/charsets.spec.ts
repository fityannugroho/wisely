import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { CharSet, CharSets, isCharSetValid } from '~/index.js';

const charSetsNames = Object.values(CharSets);

test.each(charSetsNames.map((name) => ({ name })))('validate charSet: $name', ({ name }) => {
  const strJson = fs.readFileSync(
    path.resolve(__dirname, `../charsets/${name}.json`),
    { encoding: 'utf8' },
  );

  const charSet = JSON.parse(strJson) as CharSet;
  expect(isCharSetValid(charSet)).toBe(true);
});
