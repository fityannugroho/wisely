/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, test } from 'vitest';
import wisely, { Options, mergeCharSets } from '~/index.js';

describe('wisely', () => {
  const text = 'Palestine will be free! Freedom is the right of ALL nations!';

  test('valid', () => {
    const result = wisely({ text });

    expect(result).not.equal('');
    expect(result).not.equal(text);
    expect(result).not.contain('will be');
    expect(result).toHaveLength(text.length);
  });

  test.each([
    { phrase: 'palestine', unaffected: 'will be' },
    { phrase: 'free', unaffected: 'Freedom' },
  ])('with specific phrases provided: $phrase', ({
    phrase, unaffected,
  }) => {
    const result = wisely({ text, phrases: [phrase] });

    expect(result).contain(unaffected);
    expect(result).not.match(new RegExp(`\\b${phrase}\\b`, 'i'));
    expect(result).toHaveLength(text.length);
  });

  test.each([
    { testText: 'AABBCCDDz', contains: '48Dz', notContains: '@BC2' },
    { testText: 'aabbccddZ', contains: '@6cd2', notContains: '48Dz' },
  ])('case sensitive: $testText', ({ testText, contains, notContains }) => {
    const result = wisely({ text: testText, caseSensitive: true });

    contains.split('').forEach((char) => {
      expect(result).contain(char);
    });

    notContains.split('').forEach((char) => {
      expect(result).not.contain(char);
    });

    expect(result).toHaveLength(testText.length);
  });

  test('no phrases found in the text', () => {
    expect(wisely({ text, phrases: ['foo'] })).toEqual(text);
  });

  test('empty text', () => {
    expect(wisely({ text: '' })).toEqual('');
  });

  test('empty phrases', () => {
    expect(wisely({ text, phrases: [] })).toEqual(text);
  });

  test.each<{ testText: string, charSets: Options['charSets'], contains: string, notContains: string }>([
    {
      charSets: ['latin-1'],
      testText: 'AaBbCcDdXxZz',
      contains: '\u00df\u00d7Zz',
      notContains: 'AaBbCcDdXx',
    },
    {
      charSets: ['latin', 'latin-1'],
      testText: 'AaBbCcDdXxZz',
      contains: '\u00d72',
      notContains: 'AaBbCcDdXxZz',
    },
    {
      charSets: [{ a: ['b', 'c'], x: ['y', 'z'] }],
      testText: 'AaBbCcDdXxZz',
      contains: 'BbCcDdZz',
      notContains: 'AaXx',
    },
  ])('with specific charSet $charSets: $testText', ({
    testText, charSets, contains, notContains,
  }) => {
    const result = wisely({ text: testText, charSets });

    contains.split('').forEach((char) => {
      expect(result).contain(char);
    });

    notContains.split('').forEach((char) => {
      expect(result).not.contain(char);
    });

    expect(result).toHaveLength(testText.length);
  });
});

describe('mergeCharSets', () => {
  test('merge two charSets', () => {
    const charSet1 = { a: ['b', 'c'], x: ['y', 'z'] };
    const charSet2 = { a: ['c', 'd', 'e'], X: ['Y', 'Z'] };

    expect(mergeCharSets(charSet1, charSet2)).toEqual({
      a: ['b', 'c', 'd', 'e'],
      x: ['y', 'z'],
      X: ['Y', 'Z'],
    });
  });

  test('merge three charSets', () => {
    const charSet1 = { a: ['b', 'c'], x: ['y', 'z'] };
    const charSet2 = { a: ['c', 'd', 'e'], X: ['Y', 'Z'] };
    const charSet3 = { a: ['e', 'f', 'g'], A: ['B', 'C'] };

    expect(mergeCharSets(charSet1, charSet2, charSet3)).toEqual({
      a: ['b', 'c', 'd', 'e', 'f', 'g'],
      A: ['B', 'C'],
      x: ['y', 'z'],
      X: ['Y', 'Z'],
    });
  });

  test('merge charSet with charSetNames', () => {
    const charSet1 = { a: ['b', 'c'], x: ['y', 'z'] };

    expect(mergeCharSets(charSet1, 'latin')).toEqual(
      expect.objectContaining({
        A: ['4'],
        a: ['b', 'c', '@'],
        x: ['y', 'z'],
        Z: ['2'],
      }),
    );
  });

  test('duplicate charSetNames', () => {
    expect(mergeCharSets('latin', 'latin')).toEqual(
      expect.objectContaining({
        A: ['4'], a: ['@'], B: ['8'], b: ['6'], Z: ['2'],
      }),
    );
  });

  test('Unknown charSetNames', () => {
    // @ts-expect-error
    expect(() => mergeCharSets('')).toThrow();
    // @ts-expect-error
    expect(() => mergeCharSets('x')).toThrow();
  });

  test('Invalid custom charSet', () => {
    expect(() => mergeCharSets({ aa: ['b', 'c', 'd'] })).toThrow();
    expect(() => mergeCharSets({ a: ['bc'] })).toThrow();
    expect(() => mergeCharSets({ a: ['b', 'c', ''] })).toThrow();
    expect(() => mergeCharSets({ a: ['b', 'c', 'd', ''] })).toThrow();
  });
});
