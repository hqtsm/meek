# HQTSM: Meek

Weak data collections without the limitations

![weakset](https://img.shields.io/badge/weakset-eee)
![weakmap](https://img.shields.io/badge/weakmap-eee)
![weakvaluemap](https://img.shields.io/badge/weakvaluemap-eee)
![enumerable](https://img.shields.io/badge/enumerable-eee)
![iterable](https://img.shields.io/badge/iterable-eee)
![collection](https://img.shields.io/badge/collection-eee)

[![JSR](https://jsr.io/badges/@hqtsm/meek)](https://jsr.io/@hqtsm/meek)
[![npm](https://img.shields.io/npm/v/@hqtsm/meek.svg)](https://npmjs.com/package/@hqtsm/meek)
[![CI](https://github.com/hqtsm/meek/actions/workflows/ci.yaml/badge.svg)](https://github.com/hqtsm/meek/actions/workflows/ci.yaml)

# Features

- Pure TypeScript, run anywhere
- Enumerable WeakSet: MeekSet
- Enumerable WeakMap: MeekMap
- WeakValueMap: MeekValueMap
- Designed to be as compatible with the native collection types as possible
- Do almost anything you can with regular collections with weak collections

# Usage

## MeekSet

```ts
import { MeekSet } from '@hqtsm/meek';

const values = [{ a: 1 }, { b: 2 }, { c: 3 }];
const set = new MeekSet(values);
console.assert(JSON.stringify([...set]) === JSON.stringify(values));
```

## MeekMap

```ts
import { MeekMap } from '@hqtsm/meek';

const values: [{ i: number }, number][] = [
	[{ i: 0 }, 1],
	[{ i: 1 }, 2],
	[{ i: 2 }, 3],
];
const map = new MeekMap(values);
console.assert(JSON.stringify([...map]) === JSON.stringify(values));
```

## MeekValueMap

```ts
import { MeekValueMap } from '@hqtsm/meek';

const values: [number, { i: number }][] = [
	[1, { i: 0 }],
	[2, { i: 1 }],
	[3, { i: 2 }],
];
const map = new MeekValueMap(values);
console.assert(JSON.stringify([...map]) === JSON.stringify(values));
```
