import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CharSets = {
  LATIN: 'latin',
  LATIN_1: 'latin-1',
} as const;
export type CharSetNames = typeof CharSets[keyof typeof CharSets];
export type CharSet = Record<string, string[] | undefined>;

const dirname = path.dirname(fileURLToPath(import.meta.url));

function getCharSet(name: CharSetNames = 'latin'): CharSet {
  // Validating the name
  if (!Object.values(CharSets).includes(name)) {
    throw new Error(`Invalid charSet name: ${name}`);
  }

  const strJson = fs.readFileSync(
    path.resolve(dirname, `../charsets/${name}.json`),
    { encoding: 'utf8' },
  );

  return JSON.parse(strJson) as CharSet;
}

export function isCharSetValid(charSet: CharSet): boolean {
  return typeof charSet === 'object'
    && Object.keys(charSet).every((key) => key.length === 1)
    && Object.values(charSet).every((replacements) => (
      Array.isArray(replacements)
      && replacements.every((char) => char.length === 1)
    ));
}

export function mergeCharSets(...charSets: (CharSetNames | CharSet)[]): CharSet {
  const res: CharSet = {};

  for (const charSet of charSets) {
    const charSetObj = typeof charSet === 'string' ? getCharSet(charSet) : charSet;

    // Validate the charSet
    if (!isCharSetValid(charSetObj)) {
      throw new Error('Invalid charSet: each key and value must be a single character');
    }

    for (const [key, replacements] of Object.entries(charSetObj)) {
      res[key] = Array.from(new Set([
        ...(res[key] ?? []),
        ...(replacements ?? []),
      ])).sort();
    }
  }

  return res;
}

function getChar(char: string, charSet: CharSet, caseSensitive?: boolean) {
  const replacements = caseSensitive ? charSet[char] ?? []
    : Array.from(new Set([
      ...(charSet[char.toUpperCase()] ?? []),
      ...(charSet[char.toLowerCase()] ?? []),
    ]));

  if (!replacements.length) {
    return char;
  }

  return replacements[Math.floor(Math.random() * replacements.length)];
}

export type Options = {
  text: string;
  phrases?: string[];
  caseSensitive?: boolean;
  charSets?: (CharSetNames | CharSet)[];
};

export default function wisely(options: Options): string {
  const charSet = mergeCharSets(...(options.charSets ?? ['latin']));

  const censor = (phrase: string): string => phrase.split('')
    .map((char) => getChar(char, charSet, options.caseSensitive))
    .join('');

  if (!options.phrases) {
    return censor(options.text);
  }

  let res = options.text;
  for (const t of options.phrases) {
    const regex = new RegExp(`\\b${t}\\b`, options.caseSensitive ? 'g' : 'gi');

    for (const m of options.text.matchAll(regex)) {
      const [match] = m;
      // Replace only for current match by the index
      res = res.slice(0, m.index) + censor(match)
        + (m.index === undefined ? '' : res.slice(m.index + match.length));
    }
  }

  return res;
}
