/**
 * @module
 *
 * MeekValueMap data collection.
 */

/**
 * Private data.
 */
interface Pri<K = any, V extends WeakKey = WeakKey> {
	/**
	 * Finalization registry.
	 */
	readonly fr: FinalizationRegistry<K>;

	/**
	 * Map of keys to weak references to values.
	 */
	kwv: Map<K, WeakRef<V>>;
}

let pri: WeakMap<MeekValueMap, Pri>;

/**
 * Like WeakValueMap.
 */
export class MeekValueMap<K = any, V extends WeakKey = WeakKey> {
	/**
	 * Type string.
	 */
	declare public readonly [Symbol.toStringTag]: string;

	/**
	 * Create a new MeekValueMap.
	 *
	 * @param iterable Initial pairs.
	 */
	constructor(iterable?: Iterable<readonly [K, V]> | null) {
		const kwv = new Map<K, WeakRef<V>>();
		const fr = new FinalizationRegistry(kwv.delete.bind(kwv));
		for (const [key, value] of iterable ?? []) {
			let ref = kwv.get(key);
			if (ref) {
				fr.unregister(ref);
			}
			ref = new WeakRef(value);
			fr.register(value, key, ref);
			kwv.set(key, ref);
		}
		(pri ??= new WeakMap()).set(this, { fr, kwv });
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *[Symbol.iterator](): Generator<[K, V], undefined, unknown> {
		for (const [key, ref] of (pri.get(this) as Pri<K, V>).kwv) {
			const value = ref.deref();
			if (value) {
				yield [key, value];
			}
		}
	}

	/**
	 * Clear this map.
	 */
	public clear(): void {
		const { fr, kwv } = pri.get(this) as Pri<K, V>;
		for (const [key, ref] of kwv) {
			fr.unregister(ref);
			kwv.delete(key);
		}
	}

	/**
	 * Delete a key from this map.
	 *
	 * @param key Key to delete.
	 * @returns Whether the key was deleted.
	 */
	public delete(key: K): boolean {
		const { fr, kwv } = pri.get(this) as Pri<K, V>;
		const ref = kwv.get(key);
		if (ref) {
			fr.unregister(ref);
			return kwv.delete(key);
		}
		return false;
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *entries(): Generator<[K, V], undefined, unknown> {
		for (const [key, ref] of (pri.get(this) as Pri<K, V>).kwv) {
			const value = ref.deref();
			if (value) {
				yield [key, value];
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
		callbackfn: (value: V, key: K, map: MeekValueMap<K, V>) => void,
		thisArg?: any,
	): void {
		for (const [key, ref] of (pri.get(this) as Pri<K, V>).kwv) {
			const value = ref.deref();
			if (value) {
				callbackfn.call(thisArg, value, key, this);
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
		return (pri.get(this) as Pri<K, V>).kwv.get(key)?.deref();
	}

	/**
	 * Has a key in this map.
	 *
	 * @param key Key to check.
	 * @returns Whether the key is in this map.
	 */
	public has(key: K): boolean {
		return !!(pri.get(this) as Pri<K, V>).kwv.get(key)?.deref();
	}

	/**
	 * Iterator for keys in this map.
	 *
	 * @returns Key iterator.
	 */
	public *keys(): Generator<K, undefined, unknown> {
		for (const [key, ref] of (pri.get(this) as Pri<K, V>).kwv) {
			if (ref.deref()) {
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
		const { fr, kwv } = pri.get(this) as Pri<K, V>;
		const ref = new WeakRef(value);
		const old = kwv.get(key);
		if (old) {
			fr.unregister(old);
		}
		fr.register(value, key, ref);
		kwv.set(key, ref);
		return this;
	}

	/**
	 * The number of keys in this map.
	 * Can be higher than the number of active keys.
	 */
	public get size(): number {
		return (pri.get(this) as Pri<K, V>).kwv.size;
	}

	/**
	 * Iterator for values in this map.
	 *
	 * @returns Value iterator.
	 */
	public *values(): Generator<V, undefined, unknown> {
		for (const [, ref] of (pri.get(this) as Pri<K, V>).kwv) {
			const value = ref.deref();
			if (value) {
				yield value;
			}
		}
	}

	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: 'MeekValueMap',
			configurable: true,
		});
	}
}

/**
 * Readonly MeekValueMap.
 */
export type ReadonlyMeekValueMap<K = any, V extends WeakKey = WeakKey> = Omit<
	MeekValueMap<K, V>,
	'clear' | 'delete' | 'set'
>;
