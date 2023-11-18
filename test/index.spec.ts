/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, test } from 'vitest';
import wisely, { Options, mergeCharSets } from '~/index.js';

describe('mergeCharSets', () => {
  test('merge two built-in charSets', () => {
    const mergedCharSet = mergeCharSets('latin', 'latin-1');

    expect(mergedCharSet).toEqual(
      expect.objectContaining({
        A: ['4', '\u00c0', '\u00c1', '\u00c2', '\u00c3', '\u00c4', '\u00c5'],
        a: ['@', '\u00aa', '\u00e0', '\u00e1', '\u00e2', '\u00e3', '\u00e4', '\u00e5'],
      }),
    );
  });

  test('merge built-in charSets with custom charSets', () => {
    const customCharSet = { a: ['b', 'c'], x: ['y', 'z'] };

    expect(mergeCharSets('latin', customCharSet)).toEqual(
      expect.objectContaining({
        A: ['4'],
        a: ['@', 'b', 'c'],
        x: ['y', 'z'],
        Z: ['2'],
      }),
    );
  });

  test('merge two custom charSets', () => {
    const charSet1 = { a: ['b', 'c'], x: ['y', 'z'] };
    const charSet2 = { a: ['c', 'd', 'e'], X: ['Y', 'Z'] };

    expect(mergeCharSets(charSet1, charSet2)).toEqual({
      a: ['b', 'c', 'd', 'e'],
      x: ['y', 'z'],
      X: ['Y', 'Z'],
    });
  });

  test('charSet order should not affect the result', () => {
    const customCharSet = { a: ['4', '@'] };

    expect(mergeCharSets('latin', 'latin-1')).toEqual(mergeCharSets('latin-1', 'latin'));
    expect(mergeCharSets('latin', customCharSet)).toEqual(mergeCharSets(customCharSet, 'latin'));
  });

  test('merge three custom charSets', () => {
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

  test('duplicate built-in charSets names', () => {
    expect(mergeCharSets('latin', 'latin')).toEqual(
      expect.objectContaining({
        A: ['4'], a: ['@'], B: ['8'], b: ['6'], Z: ['2'],
      }),
    );
  });

  test('unknown charSets names', () => {
    // @ts-expect-error
    expect(() => mergeCharSets('')).toThrow();
    // @ts-expect-error
    expect(() => mergeCharSets('x')).toThrow();
  });

  test('invalid custom charSets', () => {
    expect(() => mergeCharSets({ aa: ['b'] })).toThrow();
    expect(() => mergeCharSets({ a: ['bc'] })).toThrow();
    expect(() => mergeCharSets({ a: [''] })).toThrow();
    expect(() => mergeCharSets({ a: ['b', ''] })).toThrow();
    expect(() => mergeCharSets({ 1: ['a'] })).toThrow();
    expect(() => mergeCharSets({ '!': ['a'] })).toThrow();
    // Not contains control characters
    expect(() => mergeCharSets({
      a: ['\u0000', '\u0001', '\u001f', '\u007f', '\u0080', '\u009f'],
    })).toThrow();
  });
});

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
    expect(wisely({ text, phrases: [] })).not.toEqual(text);
  });

  test('with invalid phrases', () => {
    expect(() => wisely({ text, phrases: [''] })).toThrow();
    expect(() => wisely({ text, phrases: [' '] })).toThrow();
    expect(() => wisely({ text, phrases: [' '.repeat(10)] })).toThrow();
    expect(() => wisely({ text, phrases: ['\n'] })).toThrow();
    expect(() => wisely({ text, phrases: ['a\n'] })).toThrow();
    expect(() => wisely({ text, phrases: ['\t'] })).toThrow();
    expect(() => wisely({ text, phrases: ['a\t'] })).toThrow();
    expect(() => wisely({ text, phrases: ['a'.repeat(31)] })).toThrow();
    expect(() => wisely({ text, phrases: ['th!s symbo|'] })).toThrow();
    expect(() => wisely({ text, phrases: ['\\'] })).toThrow();
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
