import { assert, assertLess, assertStrictEquals } from '@std/assert';

import { MeekSet } from './set.ts';

Deno.test('MeekSet: constructor', () => {
	{
		const set = new MeekSet();
		assertStrictEquals(set.size, 0);
	}
	{
		const set = new MeekSet(null);
		assertStrictEquals(set.size, 0);
	}
	{
		const set = new MeekSet([]);
		assertStrictEquals(set.size, 0);
	}
	{
		const src = [{ a: 1 }];
		const set = new MeekSet(src);
		assertStrictEquals(set.size, src.length);
	}
	{
		const src = new Set([[1], [2], [3]]);
		const set = new MeekSet(src);
		assertStrictEquals(set.size, src.size);
	}
});

Deno.test('MeekSet: add', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet();
	for (let i = 0; i < values.length; i++) {
		assertStrictEquals(set.add(values[i]), set);
		assertStrictEquals(set.size, i + 1);
		assertStrictEquals(set.add(values[i]), set);
		assertStrictEquals(set.size, i + 1);
	}
	assert(values);
});

Deno.test('MeekSet: clear', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	assertStrictEquals(set.size, values.length);
	set.clear();
	assertStrictEquals(set.size, 0);
	set.clear();
	assertStrictEquals(set.size, 0);
	assert(values);
});

Deno.test('MeekSet: delete', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	for (let i = values.length; i--;) {
		assertStrictEquals(set.delete(values[i]), true);
		assertStrictEquals(set.size, i);
		assertStrictEquals(set.delete(values[i]), false);
		assertStrictEquals(set.size, i);
	}
	assert(values);
});

Deno.test('MeekSet: has', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	for (let i = values.length; i--;) {
		assertStrictEquals(set.has(values[i]), true);
		assertStrictEquals(set.delete(values[i]), true);
		assertStrictEquals(set.has(values[i]), false);
		assertStrictEquals(set.add(values[i]), set);
		assertStrictEquals(set.has(values[i]), true);
	}
	set.clear();
	for (let i = values.length; i--;) {
		assertStrictEquals(set.has(values[i]), false);
		assertStrictEquals(set.add(values[i]), set);
		assertStrictEquals(set.has(values[i]), true);
	}
	assert(values);
});

Deno.test('MeekSet: forEach', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	let i = 0;
	set.forEach((value, key, s) => {
		assertStrictEquals(value, values[i]);
		assertStrictEquals(key, values[i]);
		assertStrictEquals(s, set);
		i++;
	});
	assert(values);
});

Deno.test('MeekSet: GC', async () => {
	let total = 0;
	const values = new Set<{ i: number; data: Uint8Array }>();
	const set = new MeekSet<{ i: number; data: Uint8Array }>();
	for (let i = 0; i < 10; i++) {
		const o = { i: total++, data: new Uint8Array(1000) };
		values.add(o);
		set.add(o);
	}
	while (set.size >= (total / 2)) {
		for (let i = 0; i < 100; i++) {
			set.add({ i: total++, data: new Uint8Array(10000) });
		}
		// deno-lint-ignore no-await-in-loop
		await new Promise((r) => setTimeout(r, 0));
	}
	for (const o of values) {
		assertStrictEquals(set.has(o), true);
	}
	assertLess(set.size, total);
	set.forEach((value) => {
		assertStrictEquals(values.has(value), value.i < 10);
	});
	assert(values);
});
