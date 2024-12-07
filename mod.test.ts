import { assertEquals } from '@std/assert';

import * as MOD from './mod.ts';

Deno.test('exports', () => {
	assertEquals(Object.keys(MOD).sort(), [
		'MeekMap',
		'MeekSet',
		'MeekValueMap',
	]);
});
