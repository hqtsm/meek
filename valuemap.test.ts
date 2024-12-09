import { assert, assertLess, assertStrictEquals } from '@std/assert';

import { MeekValueMap } from './valuemap.ts';

Deno.test('MeekValueMap: constructor', () => {
	{
		const map = new MeekValueMap();
		assertStrictEquals(map.size, 0);
	}
	{
		const map = new MeekValueMap(null);
		assertStrictEquals(map.size, 0);
	}
	{
		const map = new MeekValueMap([]);
		assertStrictEquals(map.size, 0);
	}
	{
		const src: readonly [number, { v: number }][] = [
			[1, { v: 1 }],
		];
		const map = new MeekValueMap(src);
		assertStrictEquals(map.size, src.length);
	}
	{
		const src: readonly [string, { v: number }][] = [
			['a', { v: 1 }] as const,
			['b', { v: 2 }] as const,
			['c', { v: 3 }] as const,
		];
		const map = new MeekValueMap(src);
		assertStrictEquals(map.size, src.length);
	}
	{
		const src: readonly [number, { v: number }][] = [
			[1, { v: 1 }] as const,
			[2, { v: 2 }] as const,
			[1, { v: 3 }] as const,
		];
		const map = new MeekValueMap(src);
		assertStrictEquals(map.get(1), src[2][1]);
	}
});

Deno.test('MeekValueMap: get', () => {
	const pairs: readonly [number, { v: number }][] = new Array(100)
		.fill(0)
		.map((_, i) => [i, { v: i }]);
	const map = new MeekValueMap(pairs);
	for (let i = 0; i < pairs.length; i++) {
		const [k, v] = pairs[i];
		assertStrictEquals(map.get(k), v);
	}
	assert(pairs);
});

Deno.test('MeekValueMap: set', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap();
	for (let i = 0; i < pairs.length; i++) {
		const [k, v] = pairs[i];
		assertStrictEquals(map.set(k, v), map);
		assertStrictEquals(map.get(k), v);
		assertStrictEquals(map.size, i + 1);
		assertStrictEquals(map.set(k, v), map);
		assertStrictEquals(map.get(k), v);
		assertStrictEquals(map.size, i + 1);
		const o = { i: -i };
		assertStrictEquals(map.set(k, o), map);
		assertStrictEquals(map.get(k), o);
		assertStrictEquals(map.size, i + 1);
	}
	assert(pairs);
});

Deno.test('MeekValueMap: clear', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap(pairs);
	assertStrictEquals(map.size, pairs.length);
	map.clear();
	assertStrictEquals(map.size, 0);
	map.clear();
	assertStrictEquals(map.size, 0);
	assert(pairs);
});

Deno.test('MeekValueMap: delete', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap(pairs);
	for (let i = pairs.length; i--;) {
		assertStrictEquals(map.delete(pairs[i][0]), true);
		assertStrictEquals(map.size, i);
		assertStrictEquals(map.delete(pairs[i][0]), false);
		assertStrictEquals(map.size, i);
	}
	assert(pairs);
});

Deno.test('MeekValueMap: has', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap(pairs);
	for (let i = pairs.length; i--;) {
		const [k, v] = pairs[i];
		assertStrictEquals(map.has(k), true);
		assertStrictEquals(map.delete(k), true);
		assertStrictEquals(map.has(k), false);
		assertStrictEquals(map.set(k, v), map);
		assertStrictEquals(map.has(k), true);
	}
	map.clear();
	for (let i = pairs.length; i--;) {
		const [k, v] = pairs[i];
		assertStrictEquals(map.has(k), false);
		assertStrictEquals(map.set(k, v), map);
		assertStrictEquals(map.has(k), true);
	}
	assert(pairs);
});

Deno.test('MeekValueMap: forEach', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap(pairs);
	let i = 0;
	map.forEach((value, key, m) => {
		assertStrictEquals(value, pairs[i][1]);
		assertStrictEquals(key, pairs[i][0]);
		assertStrictEquals(m, map);
		i++;
	});
	assert(pairs);
});

Deno.test('MeekValueMap: Symbol.iterator', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap(pairs);
	let i = 0;
	for (const [key, value] of map) {
		assertStrictEquals(value, pairs[i][1]);
		assertStrictEquals(key, pairs[i][0]);
		i++;
	}
	assert(pairs);
});

Deno.test('MeekValueMap: entries', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap(pairs);
	let i = 0;
	for (const [key, value] of map.entries()) {
		assertStrictEquals(value, pairs[i][1]);
		assertStrictEquals(key, pairs[i][0]);
		i++;
	}
	assert(pairs);
});

Deno.test('MeekValueMap: keys', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap(pairs);
	let i = 0;
	for (const key of map.keys()) {
		assertStrictEquals(key, pairs[i][0]);
		i++;
	}
	assert(pairs);
});

Deno.test('MeekValueMap: values', () => {
	const pairs: readonly [number, { i: number }][] = new Array(100).fill(0)
		.map((_, i) => [i, { i }]);
	const map = new MeekValueMap(pairs);
	let i = 0;
	for (const value of map.values()) {
		assertStrictEquals(value, pairs[i][1]);
		i++;
	}
	assert(pairs);
});

Deno.test('MeekValueMap: Symbol.toStringTag', () => {
	const set = new MeekValueMap();
	assertStrictEquals(String(set), `[object ${MeekValueMap.name}]`);
});

Deno.test('MeekValueMap: GC', async () => {
	let total = 0;
	const pairs = new Map();
	const map = new MeekValueMap();
	for (let i = 0; i < 10; i++) {
		const o = { i, data: new Uint8Array(1000) };
		pairs.set(i, o);
		map.set(i, o);
		total++;
	}
	while (map.size >= (total / 2)) {
		for (let i = 0; i < 100; i++) {
			map.set(total, { i: total, data: new Uint8Array(10000) });
			total++;
		}
		// deno-lint-ignore no-await-in-loop
		await new Promise((r) => setTimeout(r, 0));
	}
	for (const [k, v] of pairs) {
		assertStrictEquals(map.has(k), true);
		assertStrictEquals(map.get(k), v);
	}
	assertLess(map.size, total);
	let found = 0;
	map.forEach((value, key) => {
		if (pairs.has(key)) {
			assertStrictEquals(value, pairs.get(key));
			found++;
		}
	});
	assertStrictEquals(found, pairs.size);
	assert(pairs);
});

Deno.test('MeekValueMap: implements map', () => {
	// Really just type checked.
	const map: Map<number, WeakKey> = new MeekValueMap([[123, { a: 1 }]]);
	assert(map);
});
