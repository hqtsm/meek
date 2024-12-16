/**
 * @module
 *
 * MeekMap data collection.
 */

/**
 * Private data.
 */
interface Pri<K extends WeakKey = WeakKey, V = any> {
	/**
	 * Finalization registry.
	 */
	readonly fr: FinalizationRegistry<WeakRef<K>>;

	/**
	 * Map of keys to weak references to keys.
	 */
	kwk: WeakMap<K, WeakRef<K>>;

	/**
	 * Set of weak references to keys.
	 */
	readonly wk: Set<WeakRef<K>>;

	/**
	 * Map of keys to values.
	 */
	kv: WeakMap<K, V>;
}

let pri: WeakMap<MeekMap, Pri>;

/**
 * Like WeakMap.
 */
export class MeekMap<K extends WeakKey = WeakKey, V = any> {
	/**
	 * Type string.
	 */
	declare public readonly [Symbol.toStringTag]: string;

	/**
	 * Create a new MeekMap.
	 *
	 * @param iterable Initial pairs.
	 */
	constructor(iterable?: Iterable<readonly [K, V]> | null) {
		const kwk = new WeakMap<K, WeakRef<K>>();
		const wk = new Set<WeakRef<K>>();
		const fr = new FinalizationRegistry(wk.delete.bind(wk));
		const kv = new WeakMap<K, V>();
		for (const [key, value] of iterable ?? []) {
			let ref = kwk.get(key);
			if (!ref) {
				ref = new WeakRef(key);
				fr.register(key, ref, key);
				kwk.set(key, ref);
				wk.add(ref);
			}
			kv.set(key, value);
		}
		(pri ??= new WeakMap()).set(this, { fr, kwk, wk, kv });
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *[Symbol.iterator](): Generator<[K, V], undefined, unknown> {
		const p = pri.get(this) as Pri<K, V>;
		for (const ref of p.wk) {
			const key = ref.deref();
			if (key) {
				yield [key, p.kv.get(key) as V];
			}
		}
	}

	/**
	 * Clear this map.
	 */
	public clear(): void {
		const p = pri.get(this) as Pri<K, V>;
		const map = new WeakMap();
		const values = new WeakMap();
		p.wk.clear();
		p.kwk = map;
		p.kv = values;
	}

	/**
	 * Delete a key from this map.
	 *
	 * @param key Key to delete.
	 * @returns Whether the key was deleted.
	 */
	public delete(key: K): boolean {
		const { fr, kv, kwk, wk } = pri.get(this) as Pri<K, V>;
		const ref = kwk.get(key);
		if (ref) {
			fr.unregister(key);
			kwk.delete(key);
			kv.delete(key);
			return wk.delete(ref);
		}
		return false;
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *entries(): Generator<[K, V], undefined, unknown> {
		const p = pri.get(this) as Pri<K, V>;
		for (const ref of p.wk) {
			const key = ref.deref();
			if (key) {
				yield [key, p.kv.get(key) as V];
			}
		}
	}

	/**
	 * Call a function for each pair in this map.
	 *
	 * @param callbackfn Callback function.
	 * @param thisArg This argument.
	 */
	public forEach(
		callbackfn: (value: V, key: K, map: MeekMap<K, V>) => void,
		thisArg?: any,
	): void {
		const p = pri.get(this) as Pri<K, V>;
		for (const ref of p.wk) {
			const key = ref.deref();
			if (key) {
				callbackfn.call(thisArg, p.kv.get(key) as V, key, this);
			}
		}
	}

	/**
	 * Get the value for a key from this map.
	 *
	 * @param key Key to get.
	 * @returns Value for the key.
	 */
	public get(key: K): V | undefined {
		const { kv, kwk } = pri.get(this) as Pri<K, V>;
		const ref = kwk.get(key);
		if (ref) {
			const key = ref.deref();
			if (key) {
				return kv.get(key);
			}
		}
	}

	/**
	 * Has a key in this map.
	 *
	 * @param key Key to check.
	 * @returns Whether the key is in this map.
	 */
	public has(key: K): boolean {
		return !!(pri.get(this) as Pri<K, V>).kwk.get(key)?.deref();
	}

	/**
	 * Iterator for keys in this map.
	 *
	 * @returns Key iterator.
	 */
	public *keys(): Generator<K, undefined, unknown> {
		const { wk } = pri.get(this) as Pri<K, V>;
		for (const ref of wk) {
			const key = ref.deref();
			if (key) {
				yield key;
			}
		}
	}

	/**
	 * Set a value for a key in this map.
	 *
	 * @param key Key to set.
	 * @param value Value to set.
	 * @returns This map.
	 */
	public set(key: K, value: V): this {
		const { fr, kv, kwk, wk } = pri.get(this) as Pri<K, V>;
		let ref = kwk.get(key);
		if (!ref) {
			ref = new WeakRef(key);
			fr.register(key, ref, key);
			kwk.set(key, ref);
		}
		wk.add(ref);
		kv.set(key, value);
		return this;
	}

	/**
	 * The number of keys in this map.
	 *
	 * @returns Number of keys, can be greater than number of active keys.
	 */
	public get size(): number {
		return (pri.get(this) as Pri<K, V>).wk.size;
	}

	/**
	 * Iterator for values in this map.
	 *
	 * @returns Value iterator.
	 */
	public *values(): Generator<V, undefined, unknown> {
		const p = pri.get(this) as Pri<K, V>;
		for (const ref of p.wk) {
			const key = ref.deref();
			if (key) {
				yield p.kv.get(key) as V;
			}
		}
	}

	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: 'MeekMap',
			configurable: true,
		});
	}
}

/**
 * Readonly MeekMap.
 */
export type ReadonlyMeekMap<K extends WeakKey = WeakKey, V = any> = Omit<
	MeekMap<K, V>,
	'clear' | 'delete' | 'set'
>;
