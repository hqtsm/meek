/**
 * @module
 *
 * MeekValueMap data collection.
 */

/**
 * Like WeakValueMap.
 */
export class MeekValueMap<K = any, V extends WeakKey = WeakKey> {
	/**
	 * Finalization registry.
	 */
	readonly #fr: FinalizationRegistry<K>;

	/**
	 * Map of keys to weak references to values.
	 */
	readonly #kwv: Map<K, WeakRef<V>>;

	/**
	 * Create a new MeekValueMap.
	 *
	 * @param iterable Initial pairs.
	 */
	constructor(iterable?: Iterable<readonly [K, V]> | null) {
		this.#kwv = new Map();
		this.#fr = new FinalizationRegistry(this.#kwv.delete.bind(this.#kwv));
		for (const [key, value] of iterable ?? []) {
			let ref = this.#kwv.get(key);
			if (ref) {
				this.#fr.unregister(ref);
			}
			ref = new WeakRef(value);
			this.#fr.register(value, key, ref);
			this.#kwv.set(key, ref);
		}
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *[Symbol.iterator](): Generator<[K, V], undefined, unknown> {
		for (const [key, ref] of this.#kwv) {
			const value = ref.deref();
			if (value) {
				yield [key, value];
			}
		}
	}

	/**
	 * Type string.
	 */
	public readonly [Symbol.toStringTag] = 'MeekValueMap';

	/**
	 * Clear this map.
	 */
	public clear(): void {
		for (const [key, ref] of this.#kwv) {
			this.#fr.unregister(ref);
			this.#kwv.delete(key);
		}
	}

	/**
	 * Delete a key from this map.
	 *
	 * @param key Key to delete.
	 * @returns Whether the key was deleted.
	 */
	public delete(key: K): boolean {
		const ref = this.#kwv.get(key);
		if (ref) {
			this.#fr.unregister(ref);
			return this.#kwv.delete(key);
		}
		return false;
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *entries(): Generator<[K, V], undefined, unknown> {
		for (const [key, ref] of this.#kwv) {
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
		for (const [key, ref] of this.#kwv) {
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
		return this.#kwv.get(key)?.deref();
	}

	/**
	 * Has a key in this map.
	 *
	 * @param key Key to check.
	 * @returns Whether the key is in this map.
	 */
	public has(key: K): boolean {
		return !!this.#kwv.get(key)?.deref();
	}

	/**
	 * Iterator for keys in this map.
	 *
	 * @returns Key iterator.
	 */
	public *keys(): Generator<K, undefined, unknown> {
		for (const [key, ref] of this.#kwv) {
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
		const ref = new WeakRef(value);
		const old = this.#kwv.get(key);
		if (old) {
			this.#fr.unregister(old);
		}
		this.#fr.register(value, key, ref);
		this.#kwv.set(key, ref);
		return this;
	}

	/**
	 * The number of keys in this map.
	 * Can be higher than the number of active keys.
	 */
	public get size(): number {
		return this.#kwv.size;
	}

	/**
	 * Iterator for values in this map.
	 *
	 * @returns Value iterator.
	 */
	public *values(): Generator<V, undefined, unknown> {
		for (const [, ref] of this.#kwv) {
			const value = ref.deref();
			if (value) {
				yield value;
			}
		}
	}
}

/**
 * Readonly MeekValueMap.
 */
export type ReadonlyMeekValueMap<K = any, V extends WeakKey = WeakKey> = Omit<
	MeekValueMap<K, V>,
	'clear' | 'delete' | 'set'
>;
