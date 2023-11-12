export type CharSetNames = 'latin' | 'latin-1';
export type CharSet = Record<string, string[] | undefined>;

async function getCharSet(name: CharSetNames = 'latin'): Promise<CharSet> {
  return import(`../charsets/${name}.json`) as Promise<CharSet>;
}

function getChar(char: string, charSet: CharSet, caseSensitive?: boolean) {
  const upperReplacements = charSet[char.toUpperCase()] ?? [];
  const lowerReplacements = charSet[char.toLowerCase()] ?? [];

  const replacements = caseSensitive ? charSet[char] ?? []
    : Array.from(new Set([...upperReplacements, ...lowerReplacements]));

  if (!replacements.length) {
    return char;
  }

  return replacements[Math.floor(Math.random() * replacements.length)];
}

export type Options = {
  text: string;
  phrases?: string[];
  caseSensitive?: boolean;
  charSet?: CharSetNames;
};

export default async function wisely(options: Options): Promise<string> {
  const charSet = await getCharSet(options.charSet);

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
