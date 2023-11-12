import { describe, expect, test } from 'vitest';
import wisely from '~/index.js';

describe('wisely', () => {
  const text = 'Palestine will be free! Freedom is the right of ALL nations!';

  test('valid', async () => {
    const result = await wisely({ text });

    expect(result).not.equal('');
    expect(result).not.equal(text);
    expect(result).not.contain('will be');
    expect(result).toHaveLength(text.length);
  });

  test.each([
    { phrase: 'palestine', unaffected: 'will be' },
    { phrase: 'free', unaffected: 'Freedom' },
  ])('with specific phrases provided: $phrase', async ({
    phrase, unaffected,
  }) => {
    const result = await wisely({ text, phrases: [phrase] });

    expect(result).contain(unaffected);
    expect(result).not.match(new RegExp(`\\b${phrase}\\b`, 'i'));
    expect(result).toHaveLength(text.length);
  });

  test.each([
    { testText: 'AABBCCDDz', contains: '48Dz', notContains: '@BC2' },
    { testText: 'aabbccddZ', contains: '@6cd2', notContains: '48Dz' },
  ])('case sensitive: $testText', async ({ testText, contains, notContains }) => {
    const result = await wisely({ text: testText, caseSensitive: true });

    contains.split('').forEach((char) => {
      expect(result).contain(char);
    });

    notContains.split('').forEach((char) => {
      expect(result).not.contain(char);
    });

    expect(result).toHaveLength(testText.length);
  });

  test('no phrases found in the text', async () => {
    expect(await wisely({ text, phrases: ['foo'] })).toEqual(text);
  });

  test('empty text', async () => {
    expect(await wisely({ text: '' })).toEqual('');
  });

  test('empty phrases', async () => {
    expect(await wisely({ text, phrases: [] })).toEqual(text);
  });

  test.each([
    { testText: 'AaBbCcDdXxZz', contains: '\u00df\u00d7Zz', notContains: 'AaBbCcDdXx' },
  ])('with specific charSet (latin-1): $testText', async ({ testText, contains, notContains }) => {
    const result = await wisely({ text: testText, charSet: 'latin-1' });

    contains.split('').forEach((char) => {
      expect(result).contain(char);
    });

    notContains.split('').forEach((char) => {
      expect(result).not.contain(char);
    });

    expect(result).toHaveLength(testText.length);
  });
});
