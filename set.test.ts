import { assert, assertEquals, assertLess } from '@std/assert';

import { MeekSet } from './set.ts';

Deno.test('MeekSet: constructor', () => {
	{
		const set = new MeekSet();
		assertEquals(set.size, 0);
	}
	{
		const set = new MeekSet(null);
		assertEquals(set.size, 0);
	}
	{
		const set = new MeekSet([]);
		assertEquals(set.size, 0);
	}
	{
		const src = [{ a: 1 }];
		const set = new MeekSet(src);
		assertEquals(set.size, src.length);
	}
	{
		const src = new Set([[1], [2], [3]]);
		const set = new MeekSet(src);
		assertEquals(set.size, src.size);
	}
});

Deno.test('MeekSet: add', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet();
	for (let i = 0; i < 100; i++) {
		assertEquals(set.add(values[i]), set);
		assertEquals(set.size, i + 1);
		assertEquals(set.add(values[i]), set);
		assertEquals(set.size, i + 1);
	}
	assert(values);
});

Deno.test('MeekSet: clear', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	assertEquals(set.size, values.length);
	set.clear();
	assertEquals(set.size, 0);
	set.clear();
	assertEquals(set.size, 0);
	assert(values);
});

Deno.test('MeekSet: delete', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	for (let i = values.length; i--;) {
		assertEquals(set.delete(values[i]), true);
		assertEquals(set.size, i);
		assertEquals(set.delete(values[i]), false);
		assertEquals(set.size, i);
	}
	assert(values);
});

Deno.test('MeekSet: has', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	for (let i = values.length; i--;) {
		assertEquals(set.has(values[i]), true);
		assertEquals(set.delete(values[i]), true);
		assertEquals(set.has(values[i]), false);
		assertEquals(set.add(values[i]), set);
		assertEquals(set.has(values[i]), true);
	}
	set.clear();
	for (let i = values.length; i--;) {
		assertEquals(set.has(values[i]), false);
		assertEquals(set.add(values[i]), set);
		assertEquals(set.has(values[i]), true);
	}
	assert(values);
});

Deno.test('MeekSet: forEach', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	let i = 0;
	set.forEach((value) => {
		assertEquals(value, values[i++]);
	});
	assert(values);
});

Deno.test('MeekSet: GC', async () => {
	let total = 0;
	const values = [];
	const set = new MeekSet();
	for (let i = 0; i < 10; i++) {
		const o = { i: total++, data: new Uint8Array(1000) };
		values.push(o);
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
		assertEquals(set.has(o), true);
	}
	assertLess(set.size, total);
	assert(values);
});
