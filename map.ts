/**
 * @module
 *
 * MeekMap data collection.
 */

/**
 * Like WeakMap.
 */
export class MeekMap<K extends WeakKey = WeakKey, V = any> {
	/**
	 * Finalization registry.
	 */
	readonly #fr: FinalizationRegistry<WeakRef<K>>;

	/**
	 * Map of keys to weak references to keys.
	 */
	#kwk: WeakMap<K, WeakRef<K>>;

	/**
	 * Set of weak references to keys.
	 */
	readonly #wk: Set<WeakRef<K>>;

	/**
	 * Map of keys to values.
	 */
	#kv: WeakMap<K, V>;

	/**
	 * Create a new MeekMap.
	 *
	 * @param iterable Initial pairs.
	 */
	constructor(iterable?: Iterable<readonly [K, V]> | null) {
		this.#kwk = new WeakMap();
		this.#wk = new Set();
		this.#fr = new FinalizationRegistry(this.#wk.delete.bind(this.#wk));
		this.#kv = new WeakMap();
		for (const [key, value] of iterable ?? []) {
			let ref = this.#kwk.get(key);
			if (!ref) {
				ref = new WeakRef(key);
				this.#fr.register(key, ref, key);
				this.#kwk.set(key, ref);
				this.#wk.add(ref);
			}
			this.#kv.set(key, value);
		}
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *[Symbol.iterator](): Generator<[K, V], undefined, unknown> {
		for (const ref of this.#wk) {
			const key = ref.deref();
			if (key) {
				yield [key, this.#kv.get(key) as V];
			}
		}
	}

	/**
	 * Type string.
	 */
	public readonly [Symbol.toStringTag] = 'MeekMap';

	/**
	 * Clear this map.
	 */
	public clear(): void {
		const map = new WeakMap();
		const values = new WeakMap();
		this.#wk.clear();
		this.#kwk = map;
		this.#kv = values;
	}

	/**
	 * Delete a key from this map.
	 *
	 * @param key Key to delete.
	 * @returns Whether the key was deleted.
	 */
	public delete(key: K): boolean {
		const ref = this.#kwk.get(key);
		if (ref) {
			this.#fr.unregister(key);
			this.#kwk.delete(key);
			this.#kv.delete(key);
			return this.#wk.delete(ref);
		}
		return false;
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *entries(): Generator<[K, V], undefined, unknown> {
		for (const ref of this.#wk) {
			const key = ref.deref();
			if (key) {
				yield [key, this.#kv.get(key) as V];
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
		for (const ref of this.#wk) {
			const key = ref.deref();
			if (key) {
				callbackfn.call(
					thisArg,
					this.#kv.get(key) as V,
					key,
					this,
				);
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
		const ref = this.#kwk.get(key);
		if (ref) {
			const key = ref.deref();
			if (key) {
				return this.#kv.get(key);
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
		return !!this.#kwk.get(key)?.deref();
	}

	/**
	 * Iterator for keys in this map.
	 *
	 * @returns Key iterator.
	 */
	public *keys(): Generator<K, undefined, unknown> {
		for (const ref of this.#wk) {
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
		let ref = this.#kwk.get(key);
		if (!ref) {
			ref = new WeakRef(key);
			this.#fr.register(key, ref, key);
			this.#kwk.set(key, ref);
		}
		this.#wk.add(ref);
		this.#kv.set(key, value);
		return this;
	}

	/**
	 * The number of keys in this map.
	 * Can be higher than the number of active keys.
	 */
	public get size(): number {
		return this.#wk.size;
	}

	/**
	 * Iterator for values in this map.
	 *
	 * @returns Value iterator.
	 */
	public *values(): Generator<V, undefined, unknown> {
		for (const ref of this.#wk) {
			const key = ref.deref();
			if (key) {
				yield this.#kv.get(key) as V;
			}
		}
	}
}
