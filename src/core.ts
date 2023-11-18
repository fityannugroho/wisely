export type CharSet = Record<string, string[] | undefined>;

/**
 * The list of built-in charset names.
 */
export const CharSets = {
  LATIN: 'latin',
  LATIN_1: 'latin-1',
} as const;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
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
 * Merge multiple charsets.
 * @param charSets The charsets to merge.
 * @returns The merged charset.
 * @throws {ValidationError} If the given custom charset is invalid.
 */
export function mergeCharSets(...charSets: CharSet[]): CharSet {
  const res: CharSet = {};

  for (const charSet of charSets) {
    // Validate the charSet
    if (!isCharSetValid(charSet)) {
      throw new ValidationError('Invalid charSet: each key and value must be a single character');
    }

    for (const [key, replacements] of Object.entries(charSet)) {
      res[key] = Array.from(new Set([
        ...(res[key] ?? []),
        ...(replacements ?? []),
      ])).sort();
    }
  }

  return res;
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
  charSets?: CharSet[];
};

/**
 * @param options The options.
 * @throws {ValidationError} If either the given custom charset or phrases are invalid.
 */
export default function wisely(options: Options): string {
  const charSet = mergeCharSets(...(options.charSets ?? []));

  const censor = (phrase: string): string => phrase.split('')
    .map((char) => getChar(char, charSet, options.caseSensitive))
    .join('');

  if (!options.phrases?.length) {
    return censor(options.text);
  }

  let res = options.text;
  for (const phrase of options.phrases) {
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
