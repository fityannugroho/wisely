import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The name of built-in charsets.
 */
export const CharSets = {
  LATIN: 'latin',
  LATIN_1: 'latin-1',
} as const;

export type CharSetNames = typeof CharSets[keyof typeof CharSets];
export type CharSet = Record<string, string[] | undefined>;

const dirname = path.dirname(fileURLToPath(import.meta.url));

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Get a built-in charset.
 * @param name The name of the charset.
 * @throws {ValidationError} If the given charset name is invalid.
 */
function getCharSet(name: CharSetNames = 'latin'): CharSet {
  // Validating the name
  if (!Object.values(CharSets).includes(name)) {
    throw new ValidationError(`Invalid charSet name: ${name}`);
  }

  const strJson = fs.readFileSync(
    path.resolve(dirname, `../charsets/${name}.json`),
    { encoding: 'utf8' },
  );

  return JSON.parse(strJson) as CharSet;
}

/**
 * Check if the given charset is valid.
 * @param charSet The charset to check.
 */
export function isCharSetValid(charSet: object): boolean {
  return typeof charSet === 'object'
    && Object.keys(charSet).every((key) => (
      key.length === 1
      && /^[a-zA-Z]$/.test(key)
    ))
    && Object.values(charSet).every((replacements) => (
      Array.isArray(replacements) && replacements.every((char) => (
        typeof char === 'string'
        && char.length === 1
        // eslint-disable-next-line no-control-regex
        && /[^\u0000-\u001f\u007f-\u009f]/.test(char)
      ))
    ));
}

/**
 * Check if the given phrase is valid.
 * @param phrase The phrase to check.
 */
export function isPhraseValid(phrase: string): boolean {
  return typeof phrase === 'string'
    && /^[a-zA-Z0-9 \-_'/]+$/.test(phrase)
    && phrase.trim().length > 0 && phrase.length <= 30;
}

/**
 * Merge multiple charsets.
 * @param charSets The names of built-in charset or custom charsets to merge.
 * @returns The merged charset.
 * @throws {ValidationError} If the given built-in charset name is invalid
 * or if the given custom charset is invalid.
 */
export function mergeCharSets(...charSets: (CharSetNames | CharSet)[]): CharSet {
  const res: CharSet = {};

  for (const charSet of charSets) {
    const charSetObj = typeof charSet === 'string' ? getCharSet(charSet) : charSet;

    // Validate the charSet
    if (!isCharSetValid(charSetObj)) {
      throw new ValidationError('Invalid charSet: each key and value must be a single character');
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

/**
 * Get a random replacement for the given character.
 * @param char The character to replace.
 * @param charSet The charset to use.
 * @param caseSensitive Whether to use case sensitive replacements.
 * @returns The replacement character.
 */
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

/**
 * @param options The options.
 * @throws {ValidationError} If the given built-in charset name,
 * the given custom charset, or if the given phrases are invalid.
 */
export default function wisely(options: Options): string {
  const charSet = mergeCharSets(...(options.charSets ?? ['latin']));

  const censor = (phrase: string): string => phrase.split('')
    .map((char) => getChar(char, charSet, options.caseSensitive))
    .join('');

  if (!options.phrases?.length) {
    return censor(options.text);
  }

  let res = options.text;
  for (const phrase of options.phrases) {
    // Validating the phrase
    if (!isPhraseValid(phrase)) {
      throw new ValidationError(`Invalid phrase: ${phrase}`);
    }

    const regex = new RegExp(`\\b${phrase.trim()}\\b`, options.caseSensitive ? 'g' : 'gi');

    for (const m of options.text.matchAll(regex)) {
      const [match] = m;
      // Replace only for current match by the index
      res = res.slice(0, m.index) + censor(match)
        + (m.index === undefined ? '' : res.slice(m.index + match.length));
    }
  }

  return res;
}
