import { assert, assertEquals } from '@std/assert';

import { MeekMap } from './map.ts';

Deno.test('MeekMap: constructor', () => {
	{
		const map = new MeekMap();
		assertEquals(map.size, 0);
	}
	{
		const map = new MeekMap(null);
		assertEquals(map.size, 0);
	}
	{
		const map = new MeekMap([]);
		assertEquals(map.size, 0);
	}
	{
		const src: readonly [{ k: string }, { v: number }][] = [
			[{ k: 'a' }, { v: 1 }],
		];
		const map = new MeekMap(src);
		assertEquals(map.size, src.length);
	}
	{
		const src: readonly [{ k: string }, { v: number }][] = [
			[{ k: 'a' }, { v: 1 }] as const,
			[{ k: 'b' }, { v: 2 }] as const,
			[{ k: 'c' }, { v: 3 }] as const,
		];
		const map = new MeekMap(src);
		assertEquals(map.size, src.length);
	}
});

Deno.test('MeekMap: get', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
	for (let i = 0; i < pairs.length; i++) {
		const [k, v] = pairs[i];
		assertEquals(map.get(k), v);
	}
	assert(pairs);
});

Deno.test('MeekMap: set', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap();
	for (let i = 0; i < pairs.length; i++) {
		const [k, v] = pairs[i];
		assertEquals(map.set(k, v), map);
		assertEquals(map.get(k), v);
		assertEquals(map.size, i + 1);
		assertEquals(map.set(k, v), map);
		assertEquals(map.get(k), v);
		assertEquals(map.size, i + 1);
		assertEquals(map.set(k, v + 1), map);
		assertEquals(map.get(k), v + 1);
		assertEquals(map.size, i + 1);
	}
	assert(pairs);
});

Deno.test('MeekMap: clear', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
	assertEquals(map.size, pairs.length);
	map.clear();
	assertEquals(map.size, 0);
	map.clear();
	assertEquals(map.size, 0);
	assert(pairs);
});

Deno.test('MeekMap: delete', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
	for (let i = pairs.length; i--;) {
		assertEquals(map.delete(pairs[i][0]), true);
		assertEquals(map.size, i);
		assertEquals(map.delete(pairs[i][0]), false);
		assertEquals(map.size, i);
	}
	assert(pairs);
});

Deno.test('MeekMap: has', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
	for (let i = pairs.length; i--;) {
		const [k, v] = pairs[i];
		assertEquals(map.has(k), true);
		assertEquals(map.delete(k), true);
		assertEquals(map.has(k), false);
		assertEquals(map.set(k, v), map);
		assertEquals(map.has(k), true);
	}
	map.clear();
	for (let i = pairs.length; i--;) {
		const [k, v] = pairs[i];
		assertEquals(map.has(k), false);
		assertEquals(map.set(k, v), map);
		assertEquals(map.has(k), true);
	}
	assert(pairs);
});

Deno.test('MeekMap: forEach', () => {
	const pairs: readonly [{ i: number }, number][] = new Array(100).fill(0)
		.map((_, i) => [{ i }, i]);
	const map = new MeekMap(pairs);
	let i = 0;
	map.forEach((value, key) => {
		assertEquals(value, pairs[i][1]);
		assertEquals(key, pairs[i][0]);
		i++;
	});
	assert(pairs);
});
