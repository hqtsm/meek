/**
 * @module
 *
 * MeekSet data collection.
 */

/**
 * Private data.
 */
interface Pri<T extends WeakKey = WeakKey> {
	/**
	 * Finalization registry.
	 */
	readonly fr: FinalizationRegistry<WeakRef<T>>;

	/**
	 * Map of values to weak references.
	 */
	vwv: WeakMap<T, WeakRef<T>>;

	/**
	 * Set of weak references to values.
	 */
	readonly wv: Set<WeakRef<T>>;
}

let pri: WeakMap<MeekSet, Pri>;

/**
 * Like WeakSet.
 */
export class MeekSet<T extends WeakKey = WeakKey> {
	/**
	 * Type string.
	 */
	declare public readonly [Symbol.toStringTag]: string;

	/**
	 * Create a new MeekSet.
	 *
	 * @param iterable Initial values.
	 */
	constructor(iterable?: Iterable<T> | null) {
		const vwv = new WeakMap<T, WeakRef<T>>();
		const wv = new Set<WeakRef<T>>();
		const fr = new FinalizationRegistry(wv.delete.bind(wv));
		for (const value of iterable ?? []) {
			if (!vwv.has(value)) {
				const ref = new WeakRef(value);
				fr.register(value, ref, value);
				vwv.set(value, ref);
				wv.add(ref);
			}
		}
		(pri ??= new WeakMap()).set(this, { fr, vwv, wv });
	}

	/**
	 * Iterator for values in this set.
	 *
	 * @returns Set iterator.
	 */
	public *[Symbol.iterator](): Generator<T, undefined, unknown> {
		for (const ref of (pri.get(this) as Pri<T>).wv) {
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
		const { fr, vwv, wv } = pri.get(this) as Pri<T>;
		let ref = vwv.get(value);
		if (!ref) {
			ref = new WeakRef(value);
			fr.register(value, ref, value);
			vwv.set(value, ref);
			wv.add(ref);
		}
		return this;
	}

	/**
	 * Clear this set.
	 */
	public clear(): void {
		const p = pri.get(this) as Pri<T>;
		const map = new WeakMap();
		p.wv.clear();
		p.vwv = map;
	}

	/**
	 * Delete a value from this set.
	 *
	 * @param value Value to delete.
	 * @returns Whether the value was deleted.
	 */
	public delete(value: T): boolean {
		const { fr, vwv, wv } = pri.get(this) as Pri<T>;
		const ref = vwv.get(value);
		if (ref) {
			fr.unregister(value);
			vwv.delete(value);
			return wv.delete(ref);
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
		for (const ref of (pri.get(this) as Pri<T>).wv) {
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
		for (const ref of (pri.get(this) as Pri<T>).wv) {
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
		for (const ref of (pri.get(this) as Pri<T>).wv) {
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
		return (pri.get(this) as Pri<T>).vwv.has(value);
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
		for (const ref of (pri.get(this) as Pri<T>).wv) {
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
	 * Is every value in this set not in other set.
	 *
	 * @param other Other set.
	 * @returns Whether every value in this set is not in other set.
	 */
	public isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {
		for (const ref of (pri.get(this) as Pri<T>).wv) {
			const value = ref.deref();
			if (value && other.has(value)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Is every value in this set in other set.
	 *
	 * @param other Other set.
	 * @returns Whether every value in this set is in other set.
	 */
	public isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
		for (const ref of (pri.get(this) as Pri<T>).wv) {
			const value = ref.deref();
			if (value && !other.has(value)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Is every value in other set in this set.
	 *
	 * @param other Other set.
	 * @returns Whether every value in other set is in this set.
	 */
	public isSupersetOf(other: ReadonlySetLike<unknown>): boolean {
		const p = pri.get(this) as Pri<T>;
		const it = other.keys();
		for (let result = it.next(); !result.done; result = it.next()) {
			const { value } = result as { value: T };
			if (!p.vwv.has(value)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Iterator for keys in this set.
	 *
	 * @returns Key iterator.
	 */
	public *keys(): Generator<T, undefined, unknown> {
		for (const ref of (pri.get(this) as Pri<T>).wv) {
			const value = ref.deref();
			if (value) {
				yield value;
			}
		}
	}

	/**
	 * The number of values in this set.
	 * Can be greater than number of active keys.
	 */
	public get size(): number {
		return (pri.get(this) as Pri<T>).wv.size;
	}

	/**
	 * New MeekSet containing the values in either set but not both.
	 *
	 * @param other Other set.
	 * @returns New MeekSet.
	 */
	public symmetricDifference<U extends WeakKey>(
		other: ReadonlySetLike<U>,
	): MeekSet<T | U> {
		const p = pri.get(this) as Pri<T>;
		const set = new MeekSet<T | U>();
		for (const ref of p.wv) {
			const value = ref.deref();
			if (value && !other.has(value as unknown as U)) {
				set.add(value);
			}
		}
		const it = other.keys();
		for (let result = it.next(); !result.done; result = it.next()) {
			const { value } = result as { value: T & U };
			if (!p.vwv.has(value)) {
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
		for (const ref of (pri.get(this) as Pri<T>).wv) {
			const value = ref.deref();
			if (value) {
				set.add(value);
			}
		}
		const it = other.keys();
		for (let result = it.next(); !result.done; result = it.next()) {
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
		for (const ref of (pri.get(this) as Pri<T>).wv) {
			const value = ref.deref();
			if (value) {
				yield value;
			}
		}
	}

	static {
		Object.defineProperty(this.prototype, Symbol.toStringTag, {
			value: 'MeekSet',
			configurable: true,
		});
	}
}

/**
 * Readonly MeekSet.
 */
export type ReadonlyMeekSet<T extends WeakKey> = Omit<
	MeekSet<T>,
	'add' | 'clear' | 'delete'
>;
