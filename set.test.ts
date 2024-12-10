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
	{
		const reuse = {};
		const src = [reuse, [2], [2], reuse];
		const set = new MeekSet(src);
		assertStrictEquals(set.size, src.length - 1);
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

Deno.test('MeekSet: Symbol.iterator', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	let i = 0;
	for (const value of set) {
		assertStrictEquals(value, values[i]);
		i++;
	}
	assert(values);
});

Deno.test('MeekSet: entries', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	let i = 0;
	for (const [k, v] of set.entries()) {
		assertStrictEquals(k, v);
		assertStrictEquals(v, values[i]);
		i++;
	}
	assert(values);
});

Deno.test('MeekSet: keys', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	let i = 0;
	for (const value of set.keys()) {
		assertStrictEquals(value, values[i]);
		i++;
	}
	assert(values);
});

Deno.test('MeekSet: values', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values);
	let i = 0;
	for (const value of set.values()) {
		assertStrictEquals(value, values[i]);
		i++;
	}
	assert(values);
});

Deno.test('MeekSet: Symbol.toStringTag', () => {
	const set = new MeekSet();
	assertStrictEquals(String(set), `[object ${MeekSet.name}]`);
});

Deno.test('MeekSet: difference', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const a = new MeekSet(values.slice(0, 90));
	const b = new MeekSet(values.slice(80));
	const c = new Set([...values.slice(0, 10), NaN, true, null, Symbol(), {}]);
	const all = a.difference(b).difference(c);
	let i = 10;
	for (const value of all) {
		assertStrictEquals(value, values[i++]);
	}
	assertStrictEquals(all.size, 70);
	if ('difference' in Set.prototype) {
		assertStrictEquals(new Set(values.slice(10)).difference(a).size, 10);
	}
	assert(values);
});

Deno.test('MeekSet: intersection', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const a = new MeekSet(values.slice(0, 70));
	const b = new MeekSet(values.slice(30));
	const c = new Set(values.slice(40, 60));
	const all = a.intersection(b).intersection(c);
	let i = 40;
	for (const value of all) {
		assertStrictEquals(value, values[i++]);
	}
	assertStrictEquals(all.size, 20);
	if ('intersection' in Set.prototype) {
		assertStrictEquals(new Set(values.slice(10)).intersection(a).size, 60);
	}
	assert(values);
});

Deno.test('MeekSet: isDisjointFrom', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values.slice(0, 90));
	assertStrictEquals(set.isDisjointFrom(set), false);
	assertStrictEquals(set.isDisjointFrom(new MeekSet(values.slice(90))), true);
	assertStrictEquals(set.isDisjointFrom(new MeekSet(values.slice(91))), true);
	assertStrictEquals(
		set.isDisjointFrom(new MeekSet(values.slice(89))),
		false,
	);
	assertStrictEquals(set.isDisjointFrom(new Set([1])), true);
	if ('isDisjointFrom' in Set.prototype) {
		assertStrictEquals(
			new Set(values.slice(10)).isDisjointFrom(set),
			false,
		);
		assertStrictEquals(new Set([1, 2, 3]).isDisjointFrom(set), true);
	}
	assert(values);
});

Deno.test('MeekSet: isSubsetOf', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values.slice(0, 90));
	assertStrictEquals(set.isSubsetOf(set), true);
	assertStrictEquals(new MeekSet(values.slice(0, 90)).isSubsetOf(set), true);
	assertStrictEquals(new MeekSet(values.slice(0, 91)).isSubsetOf(set), false);
	assertStrictEquals(new MeekSet(values.slice(90)).isSubsetOf(set), false);
	assertStrictEquals(new MeekSet(values).isSubsetOf(new Set([1])), false);
	if ('isSubsetOf' in Set.prototype) {
		assertStrictEquals(
			new Set(values).isSubsetOf(new MeekSet([{}])),
			false,
		);
		assertStrictEquals(new Set(set).isSubsetOf(set), true);
	}
	assert(values);
});

Deno.test('MeekSet: isSupersetOf', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const set = new MeekSet(values.slice(0, 90));
	assertStrictEquals(set.isSupersetOf(set), true);
	assertStrictEquals(
		new MeekSet(values.slice(0, 90)).isSupersetOf(set),
		true,
	);
	assertStrictEquals(
		new MeekSet(values.slice(0, 91)).isSupersetOf(set),
		true,
	);
	assertStrictEquals(
		new MeekSet(values.slice(0, 89)).isSupersetOf(set),
		false,
	);
	assertStrictEquals(new MeekSet(values).isSupersetOf(new Set([1])), false);
	if ('isSupersetOf' in Set.prototype) {
		assertStrictEquals(
			new Set(values).isSupersetOf(new MeekSet([{}])),
			false,
		);
		assertStrictEquals(new Set(values).isSupersetOf(set), true);
	}
	assert(values);
});

Deno.test('MeekSet: symmetricDifference', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const a = new MeekSet(values.slice(0, 40));
	const b = new MeekSet(values.slice(30, 70));
	const c = new Set(values.slice(60));
	const all = a.symmetricDifference(b).symmetricDifference(c);
	for (const value of all) {
		assert(value.i < 30 || value.i >= 40);
		assert(value.i < 60 || value.i >= 70);
	}
	assertStrictEquals(all.size, 80);
	if ('symmetricDifference' in Set.prototype) {
		assertStrictEquals(
			new Set(values.slice(10)).symmetricDifference(a).size,
			70,
		);
	}
	assert(values);
});

Deno.test('MeekSet: union', () => {
	const values = new Array(100).fill(0).map((_, i) => ({ i }));
	const a = new MeekSet(values.slice(0, 40));
	const b = new MeekSet(values.slice(30, 70));
	const c = new Set(values.slice(60));
	const all = a.union(b).union(c);
	let i = 0;
	for (const value of all) {
		assertStrictEquals(value, values[i++]);
	}
	assertStrictEquals(all.size, values.length);
	if ('union' in Set.prototype) {
		assertStrictEquals(new Set(values.slice(90)).union(a).size, 50);
	}
	assert(values);
});

Deno.test('MeekSet: GC', async () => {
	let total = 0;
	const values = new Set<{ i: number; data: Uint8Array }>();
	const set = new MeekSet<{ i: number; data: Uint8Array }>();
	for (let i = 0; i < 10; i++) {
		const o = { i, data: new Uint8Array(1000) };
		values.add(o);
		set.add(o);
		total++;
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

Deno.test('MeekSet: implements set', () => {
	// Really just type checked.
	const weakSet: WeakSet<[number]> = new MeekSet([[1], [2], [3]]);
	assert(weakSet);

	// Very similar, but some methods have more restrictions.
	const set: Omit<
		Set<[number]>,
		| 'forEach'
		| 'union'
		| 'symmetricDifference'
		| 'intersection'
		| 'difference'
		| 'add'
	> = new MeekSet([
		[1],
		[2],
		[3],
	]);
	assert(set);
});
