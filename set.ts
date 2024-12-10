/**
 * @module
 *
 * MeekSet data collection.
 */

/**
 * Like WeakSet.
 */
export class MeekSet<T extends WeakKey = WeakKey> {
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
	public *[Symbol.iterator](): Generator<T, undefined, unknown> {
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value) {
				yield value;
			}
		}
	}

	/**
	 * Type string.
	 */
	public readonly [Symbol.toStringTag] = 'MeekSet';

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
	 * New MeekSet containing the values in this set not in other set.
	 *
	 * @param other Other set.
	 * @returns New MeekSet.
	 */
	public difference<U>(other: ReadonlySetLike<U>): MeekSet<T> {
		const set = new MeekSet<T>();
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value && !other.has(value as unknown as U)) {
				set.add(value);
			}
		}
		return set;
	}

	/**
	 * Iterator for key-value pairs in this set.
	 *
	 * @returns Key-value iterator.
	 */
	public *entries(): Generator<[T, T], undefined, unknown> {
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
		return !!this.#vwv.get(value);
	}

	/**
	 * New MeekSet containing the values in both sets.
	 *
	 * @param other Other set.
	 * @returns New MeekSet.
	 */
	public intersection<U extends WeakKey>(
		other: ReadonlySetLike<U>,
	): MeekSet<T & U> {
		const set = new MeekSet<T & U>();
		for (const ref of this.#wv) {
			const value = ref.deref() as T & U;
			if (value) {
				if (other.has(value)) {
					set.add(value);
				}
			}
		}
		return set;
	}

	/**
	 * Iterator for keys in this set.
	 *
	 * @returns Key iterator.
	 */
	public *keys(): Generator<T, undefined, unknown> {
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

	public symmetricDifference<U extends WeakKey>(
		other: ReadonlySetLike<U>,
	): MeekSet<T> {
		const set = new MeekSet<T>();
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value && !other.has(value as unknown as U)) {
				set.add(value);
			}
		}
		const itter = other.keys();
		for (let result = itter.next(); !result.done; result = itter.next()) {
			const { value } = result as { value: T & U };
			if (!this.#vwv.has(value)) {
				set.add(value);
			}
		}
		return set;
	}

	/**
	 * New MeekSet containing all values from both sets.
	 *
	 * @param other Other set.
	 * @returns New MeekSet.
	 */
	public union<U extends WeakKey>(other: ReadonlySetLike<U>): MeekSet<T | U> {
		const set = new MeekSet<T | U>();
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value) {
				set.add(value);
			}
		}
		const itter = other.keys();
		for (let result = itter.next(); !result.done; result = itter.next()) {
			set.add(result.value);
		}
		return set;
	}

	/**
	 * Iterator for values in this set.
	 *
	 * @returns Value iterator.
	 */
	public *values(): Generator<T, undefined, unknown> {
		for (const ref of this.#wv) {
			const value = ref.deref();
			if (value) {
				yield value;
			}
		}
	}
}
