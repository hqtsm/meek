/**
 * @module
 *
 * MeekValueMap data collection.
 */

/**
 * Like WeakValueMap.
 */
export class MeekValueMap<K, V extends WeakKey> {
	/**
	 * Finalization registry.
	 */
	readonly #fr: FinalizationRegistry<K>;

	/**
	 * Map of keys to weak references.
	 */
	readonly #map: Map<K, WeakRef<V>>;

	/**
	 * Create a new MeekValueMap.
	 *
	 * @param iterable Initial pairs.
	 */
	constructor(iterable?: Iterable<readonly [K, V]> | null) {
		this.#map = new Map();
		this.#fr = new FinalizationRegistry(this.#map.delete.bind(this.#map));
		for (const [key, value] of iterable ?? []) {
			let ref = this.#map.get(key);
			if (ref) {
				this.#fr.unregister(ref);
			}
			ref = new WeakRef(value);
			this.#fr.register(value, key, ref);
			this.#map.set(key, ref);
		}
	}

	/**
	 * Clear this map.
	 */
	public clear(): void {
		for (const [key, ref] of this.#map) {
			this.#fr.unregister(ref);
			this.#map.delete(key);
		}
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
			this.#fr.unregister(ref);
			return this.#map.delete(key);
		}
		return false;
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
		for (const [key, ref] of this.#map) {
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
		const ref = this.#map.get(key);
		if (ref) {
			const value = ref.deref();
			if (!value) {
				this.#fr.unregister(ref);
				this.#map.delete(key);
			}
			return value;
		}
	}

	/**
	 * Has a key in this map.
	 *
	 * @param key Key to check.
	 * @returns Whether the key is in this map.
	 */
	public has(key: K): boolean {
		const ref = this.#map.get(key);
		if (ref) {
			const value = ref.deref();
			if (!value) {
				this.#fr.unregister(ref);
				this.#map.delete(key);
			}
			return !!value;
		}
		return false;
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
		const old = this.#map.get(key);
		if (old) {
			this.#fr.unregister(old);
		}
		this.#fr.register(value, key, ref);
		this.#map.set(key, ref);
		return this;
	}

	/**
	 * The number of keys in this map.
	 * Can be higher than the number of active keys.
	 */
	public get size(): number {
		return this.#map.size;
	}
}
