import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import coreWisely, {
  CharSet,
  CharSets,
  Options as CoreOptions,
  ValidationError,
  mergeCharSets as coreMergeCharSets,
  isCharSetValid,
  isPhraseValid,
} from './core.js';

type CharSetNames = typeof CharSets[keyof typeof CharSets];

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get a built-in charset.
 * @param name The name of the charset.
 * @throws {ValidationError} If the given charset name is invalid.
 */
export function getCharSet(name: CharSetNames = 'latin'): CharSet {
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
 * Merge multiple charsets.
 * @param charSets The names of built-in charset or custom charsets to merge.
 * @returns The merged charset.
 * @throws {ValidationError} If either the given built-in charset name or custom charset are invalid.
 */
export function mergeCharSets(...charSets: (CharSetNames | CharSet)[]): CharSet {
  return coreMergeCharSets(...charSets.map((charSet) => (
    typeof charSet === 'string' ? getCharSet(charSet) : charSet
  )));
}

export type Options = Omit<CoreOptions, 'charSets'> & {
  /**
   * The names of built-in charset or custom charsets to use.
   * @default ['latin']
   */
  charSets?: (CharSetNames | CharSet)[];
};

/**
 * @param options The options.
 * @throws {ValidationError} If one of the given built-in charset names, custom charsets, or phrases are invalid.
 */
export default function wisely(options: Options): string {
  const charSet = mergeCharSets(...(options.charSets ?? ['latin']));

  return coreWisely({
    ...options,
    charSets: [charSet],
  });
}

// Export from core
export {
  CharSet, CharSets, ValidationError, isCharSetValid, isPhraseValid,
};
