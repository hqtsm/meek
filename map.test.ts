import { assert, assertLess, assertStrictEquals } from '@std/assert';

import { MeekMap } from './map.ts';

Deno.test('MeekMap: constructor', () => {
	{
		const map = new MeekMap();
		assertStrictEquals(map.size, 0);
	}
	{
		const map = new MeekMap(null);
		assertStrictEquals(map.size, 0);
	}
	{
		const map = new MeekMap([]);
		assertStrictEquals(map.size, 0);
	}
	{
		const src: readonly [{ k: string }, { v: number }][] = [
			[{ k: 'a' }, { v: 1 }],
		];
		const map = new MeekMap(src);
		assertStrictEquals(map.size, src.length);
	}
	{
		const src: readonly [{ k: string }, { v: number }][] = [
			[{ k: 'a' }, { v: 1 }] as const,
			[{ k: 'b' }, { v: 2 }] as const,
			[{ k: 'c' }, { v: 3 }] as const,
		];
		const map = new MeekMap(src);
		assertStrictEquals(map.size, src.length);
	}
});

Deno.test('MeekMap: get', () => {
	const pairs: readonly [{ i: number }, { v: number }][] = new Array(100)
		.fill(0)
		.map((_, i) => [{ i }, { v: i }]);
	const map = new MeekMap(pairs);
	for (let i = 0; i < pairs.length; i++) {
		const [k, v] = pairs[i];
		assertStrictEquals(map.get(k), v);
	}
	assert(pairs);
});

Deno.test('MeekMap: set', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap();
	for (let i = 0; i < pairs.length; i++) {
		const [k, v] = pairs[i];
		assertStrictEquals(map.set(k, v), map);
		assertStrictEquals(map.get(k), v);
		assertStrictEquals(map.size, i + 1);
		assertStrictEquals(map.set(k, v), map);
		assertStrictEquals(map.get(k), v);
		assertStrictEquals(map.size, i + 1);
		assertStrictEquals(map.set(k, v + 1), map);
		assertStrictEquals(map.get(k), v + 1);
		assertStrictEquals(map.size, i + 1);
	}
	assert(pairs);
});

Deno.test('MeekMap: clear', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
	assertStrictEquals(map.size, pairs.length);
	map.clear();
	assertStrictEquals(map.size, 0);
	map.clear();
	assertStrictEquals(map.size, 0);
	assert(pairs);
});

Deno.test('MeekMap: delete', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
	for (let i = pairs.length; i--;) {
		assertStrictEquals(map.delete(pairs[i][0]), true);
		assertStrictEquals(map.size, i);
		assertStrictEquals(map.delete(pairs[i][0]), false);
		assertStrictEquals(map.size, i);
	}
	assert(pairs);
});

Deno.test('MeekMap: has', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
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

Deno.test('MeekMap: forEach', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
	let i = 0;
	map.forEach((value, key, m) => {
		assertStrictEquals(value, pairs[i][1]);
		assertStrictEquals(key, pairs[i][0]);
		assertStrictEquals(m, map);
		i++;
	});
	assert(pairs);
});

Deno.test('MeekMap: GC', async () => {
	let total = 0;
	const pairs = new Map();
	const map = new MeekMap();
	for (let i = 0; i < 10; i++) {
		const o = { i: total++, data: new Uint8Array(1000) };
		pairs.set(o, o.i + 1);
		map.set(o, o.i + 1);
	}
	while (map.size >= (total / 2)) {
		for (let i = 0; i < 100; i++) {
			map.set({ i: total++, data: new Uint8Array(10000) }, -1);
		}
		// deno-lint-ignore no-await-in-loop
		await new Promise((r) => setTimeout(r, 0));
	}
	for (const [k, v] of pairs) {
		assertStrictEquals(map.has(k), true);
		assertStrictEquals(map.get(k), v);
	}
	assertLess(map.size, total);
	assert(pairs);
});
