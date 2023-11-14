# Wisely

Obfuscating text or phrases with random uncommon characters to avoid banning. Everyone is free to speak as long as they do so **wisely**.

[![MIT license](https://img.shields.io/github/license/fityannugroho/wisely.svg)](https://github.com/fityannugroho/wisely/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/wisely.svg)](https://www.npmjs.com/package/wisely)

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher

## Install

```sh
npm install wisely
```

## Usage

```js
import wisely from 'wisely';

const text = 'Palestine will be free! Freedom is the right of ALL nations!';

// Obscuring the whole text
const res1 = wisely({ text });

// Only obscures the specified phrases
const res2 = wisely({ text, phrases: ['palestine', 'free'] });

console.log(res1, res2);
// P@l3$t|n3 w!ll 83 fr33! Fr33d0m |$ t#3 r!6#t 0f @LL n4t|0n5!
// P4l35t1n3 will be fr33! Freedom is the right of ALL nations!
```

## API

### `wisely(options)`

Returns a `string` with the obsfucated text.

#### options

Type: `object`

##### text

- Type: `string`
- Required: `true`

The text to be obscured.

##### phrases

- Type: `string[]`
- Required: `false`

The specific phrases to be obscured. If not specified, the whole text will be obscured.

##### caseSensitive

- Type: `boolean`
- Default: `false`

Whether to obscure in a case-sensitive manner.

##### charSets

- Type: `(string | object)[]`
- Default: `['latin']`

The character set that will be used for obfuscation. Put the **name of the** [**built-in character sets**](#character-sets) or a **custom character set objects**.

The valid custom character set object must be an object that **each key is a single character** and **each value is an array of single characters** that will be used to replace the key. See the example below.

```js
const customCharSet = {
  a: ['@', '4'],
  e: ['3'],
  i: ['1', '!'],
  o: ['0'],
  s: ['5', '$'],
  t: ['7'],
};
```

### `isCharSetValid(charSet)`

Returns a `boolean` whether the character set is valid.

#### charSet

Type: `object`

The character set that will be checked.

### `mergeCharSets(...charSets)`

Returns a merged character set object.

#### charSets

Type: `string | object`

The character set that will be merged. Put the **name of the** [**built-in character sets**](#character-sets) or a **custom character set objects**.

## Character Sets

Below is the built-in character sets available. See the details of each character set in the [charsets](./charsets) directory.

| `charSet` Name | Block Name | Block Range |
| --- | --- | --- |
| `latin` | [Basic Latin](https://unicodeplus.com/block/0000) | \u0000 - \u007f |
| `latin-1` | [Latin-1 Supplement](https://unicodeplus.com/block/0080) | \u0080 - \u00ff |

## Support This Project

Give a ⭐️ if this project helped you!

Also please consider supporting this project by **becoming a sponsor**. Your donation will help us to maintain and develop this project and provide you with better support.
