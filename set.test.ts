import { assertEquals } from '@std/assert';

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
});

Deno.test('MeekSet: clear', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	assertEquals(set.size, values.length);
	set.clear();
	assertEquals(set.size, 0);
	set.clear();
	assertEquals(set.size, 0);
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
});

Deno.test('MeekSet: forEach', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	let i = 0;
	set.forEach((value) => {
		assertEquals(value, values[i++]);
	});
});
