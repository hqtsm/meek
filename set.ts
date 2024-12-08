/**
 * @module
 *
 * MeekSet data collection.
 */

/**
 * Like WeakSet.
 */
export class MeekSet<T extends WeakKey> {
	/**
	 * Finalization registry.
	 */
	readonly #fr: FinalizationRegistry<WeakRef<T>>;

	/**
	 * Map of values to weak references.
	 */
	#map: WeakMap<T, WeakRef<T>>;

	/**
	 * Set of weak references.
	 */
	readonly #set: Set<WeakRef<T>>;

	/**
	 * Create a new MeekSet.
	 *
	 * @param iterable Initial values.
	 */
	constructor(iterable?: Iterable<T> | null) {
		this.#map = new WeakMap();
		this.#set = new Set();
		this.#fr = new FinalizationRegistry(this.#set.delete.bind(this.#set));
		for (const value of iterable ?? []) {
			if (!this.#map.has(value)) {
				const ref = new WeakRef(value);
				this.#fr.register(value, ref, value);
				this.#map.set(value, ref);
				this.#set.add(ref);
			}
		}
	}

	/**
	 * Add a value to this set.
	 *
	 * @param value Value to add.
	 * @returns This set.
	 */
	public add(value: T): this {
		let ref = this.#map.get(value);
		if (!ref || !this.#set.has(ref) || !ref.deref()) {
			ref = new WeakRef(value);
			this.#fr.register(value, ref, value);
			this.#map.set(value, ref);
			this.#set.add(ref);
		}
		return this;
	}

	/**
	 * Clear this set.
	 */
	public clear(): void {
		const map = new WeakMap();
		this.#set.clear();
		this.#map = map;
	}

	/**
	 * Delete a value from this set.
	 *
	 * @param value Value to delete.
	 * @returns Whether the value was deleted.
	 */
	public delete(value: T): boolean {
		const ref = this.#map.get(value);
		if (ref) {
			this.#fr.unregister(value);
			this.#map.delete(value);
			return this.#set.delete(ref);
		}
		return false;
	}

	/**
	 * Call a function for each value in this set.
	 *
	 * @param callbackfn Callback function.
	 * @param thisArg This argument.
	 */
	public forEach(
		callbackfn: (value: T, value2: T, set: MeekSet<T>) => void,
		thisArg?: any,
	): void {
		for (const ref of this.#set) {
			const value = ref.deref();
			if (value) {
				callbackfn.call(thisArg, value, value, this);
			}
		}
	}

	/**
	 * Has a value in this set.
	 *
	 * @param value Value to check.
	 * @returns Whether the value is in this set.
	 */
	public has(value: T): boolean {
		return !!this.#map.get(value)?.deref();
	}

	/**
	 * The number of values in this set.
	 * Can be higher than the number of active values.
	 */
	public get size(): number {
		return this.#set.size;
	}
}
