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
	#vwv: WeakMap<T, WeakRef<T>>;

	/**
	 * Set of weak references to values.
	 */
	readonly #wv: Set<WeakRef<T>>;

	/**
	 * Create a new MeekSet.
	 *
	 * @param iterable Initial values.
	 */
	constructor(iterable?: Iterable<T> | null) {
		this.#vwv = new WeakMap();
		this.#wv = new Set();
		this.#fr = new FinalizationRegistry(this.#wv.delete.bind(this.#wv));
		for (const value of iterable ?? []) {
			if (!this.#vwv.has(value)) {
				const ref = new WeakRef(value);
				this.#fr.register(value, ref, value);
				this.#vwv.set(value, ref);
				this.#wv.add(ref);
			}
		}
	}

	/**
	 * Iterator for values in this set.
	 *
	 * @returns Set iterator.
	 */
	public *[Symbol.iterator](): IterableIterator<T> {
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value) {
				yield value;
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
		let ref = this.#vwv.get(value);
		if (!ref) {
			ref = new WeakRef(value);
			this.#fr.register(value, ref, value);
			this.#vwv.set(value, ref);
			this.#wv.add(ref);
		}
		return this;
	}

	/**
	 * Clear this set.
	 */
	public clear(): void {
		const map = new WeakMap();
		this.#wv.clear();
		this.#vwv = map;
	}

	/**
	 * Delete a value from this set.
	 *
	 * @param value Value to delete.
	 * @returns Whether the value was deleted.
	 */
	public delete(value: T): boolean {
		const ref = this.#vwv.get(value);
		if (ref) {
			this.#fr.unregister(value);
			this.#vwv.delete(value);
			return this.#wv.delete(ref);
		}
		return false;
	}

	/**
	 * Iterator for key-value pairs in this set.
	 *
	 * @returns Key-value iterator.
	 */
	public *entries(): IterableIterator<[T, T]> {
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value) {
				yield [value, value];
			}
		}
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
		for (const ref of this.#wv) {
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
		return !!this.#vwv.get(value)?.deref();
	}

	/**
	 * Iterator for keys in this set.
	 *
	 * @returns Key iterator.
	 */
	public *keys(): IterableIterator<T> {
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value) {
				yield value;
			}
		}
	}

	/**
	 * The number of values in this set.
	 * Can be higher than the number of active values.
	 */
	public get size(): number {
		return this.#wv.size;
	}

	/**
	 * Iterator for values in this set.
	 *
	 * @returns Value iterator.
	 */
	public *values(): IterableIterator<T> {
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value) {
				yield value;
			}
		}
	}
}
