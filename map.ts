/**
 * @module
 *
 * MeekMap data collection.
 */

/**
 * Like WeakMap.
 */
export class MeekMap<K extends WeakKey, V> {
	/**
	 * Finalization registry.
	 */
	readonly #fr: FinalizationRegistry<WeakRef<K>>;

	/**
	 * Map of keys to weak references.
	 */
	#map: WeakMap<K, WeakRef<K>>;

	/**
	 * Set of weak references.
	 */
	readonly #set: Set<WeakRef<K>>;

	/**
	 * Map of keys to values.
	 */
	#values: WeakMap<K, V>;

	/**
	 * Create a new MeekMap.
	 *
	 * @param iterable Initial pairs.
	 */
	constructor(iterable?: Iterable<readonly [K, V]> | null) {
		this.#map = new WeakMap();
		this.#set = new Set();
		this.#fr = new FinalizationRegistry(this.#set.delete.bind(this.#set));
		this.#values = new WeakMap();
		for (const [key, value] of iterable ?? []) {
			let ref = this.#map.get(key);
			if (!ref) {
				ref = new WeakRef(key);
				this.#fr.register(key, ref, key);
				this.#map.set(key, ref);
				this.#set.add(ref);
			}
			this.#values.set(key, value);
		}
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *[Symbol.iterator](): IterableIterator<[K, V]> {
		for (const ref of this.#set) {
			const key = ref.deref();
			if (key) {
				yield [key, this.#values.get(key) as V];
			}
		}
	}

	/**
	 * Clear this map.
	 */
	public clear(): void {
		const map = new WeakMap();
		const values = new WeakMap();
		this.#set.clear();
		this.#map = map;
		this.#values = values;
	}

	/**
	 * Delete a key from this map.
	 *
	 * @param key Key to delete.
	 * @returns Whether the key was deleted.
	 */
	public delete(key: K): boolean {
		const ref = this.#map.get(key);
		if (ref) {
			this.#fr.unregister(key);
			this.#map.delete(key);
			this.#values.delete(key);
			return this.#set.delete(ref);
		}
		return false;
	}

	/**
	 * Iterator for key-value pairs in this map.
	 *
	 * @returns Key-value iterator.
	 */
	public *entries(): IterableIterator<[K, V]> {
		for (const ref of this.#set) {
			const key = ref.deref();
			if (key) {
				yield [key, this.#values.get(key) as V];
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
		for (const ref of this.#set) {
			const key = ref.deref();
			if (key) {
				callbackfn.call(
					thisArg,
					this.#values.get(key) as V,
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
		const ref = this.#map.get(key);
		if (ref) {
			const key = ref.deref();
			if (key) {
				return this.#values.get(key);
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
		return !!this.#map.get(key)?.deref();
	}

	/**
	 * Iterator for keys in this map.
	 *
	 * @returns Key iterator.
	 */
	public *keys(): IterableIterator<K> {
		for (const ref of this.#set) {
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
		let ref = this.#map.get(key);
		if (!ref) {
			ref = new WeakRef(key);
			this.#fr.register(key, ref, key);
			this.#map.set(key, ref);
		}
		this.#set.add(ref);
		this.#values.set(key, value);
		return this;
	}

	/**
	 * The number of keys in this map.
	 * Can be higher than the number of active keys.
	 */
	public get size(): number {
		return this.#set.size;
	}

	/**
	 * Iterator for values in this map.
	 *
	 * @returns Value iterator.
	 */
	public *values(): IterableIterator<V> {
		for (const ref of this.#set) {
			const key = ref.deref();
			if (key) {
				yield this.#values.get(key) as V;
			}
		}
	}
}
