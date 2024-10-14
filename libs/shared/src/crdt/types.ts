import { Clock } from './Clock.js';
import { TIMESTAMP_KEY } from './constants.js';

export type Timestamp = `${number}-${number}`;

type AnyArray<T = unknown> = Array<T> | ReadonlyArray<T>;

export type ArrayItem = { id: string | number } & Record<string, unknown>;
export type ItemArray = AnyArray<ArrayItem>;

/**
 * Constructs array representation of CRDT Arrays
 * @example
 * const arr = [
 *     { id: 'a', c: 'foo', d: 'bar' },
 *     { id: 'b', c: 'baz', d: 'qux' }
 * ];
 *
 * const timestamps: TimestampsArray<typeof arr> = {
 *     a: {
 *         c: '1-1',
 *         d: '1-1'
 *     },
 *     b: {
 *         c: '1-1',
 *         d: '1-1'
 *     }
 * };
 */
type TimestampsArray<A extends ItemArray> = {
    [Key in A[number]['id']]: Timestamps<Omit<A[number], 'id'>>;
};

/** Has the same shape as `O` but with `Timestamp`s or `Clock`s as values */
export type Timestamps<O extends object> = {
    [K in keyof O]: O[K] extends ItemArray
        ? // if the value is an array of objects with an id property
          TimestampsArray<O[K]>
        : O[K] extends AnyArray<unknown>
        ? // if the value is a simple array, treat it as a primitive
          Clock | Timestamp
        : O[K] extends object
        ? // if the value is an object, recursively timestampify it
          Timestamps<O[K]>
        : // otherwise, treat it as a primitive
          Clock | Timestamp;
};

type TimestampObject = { [TIMESTAMP_KEY]: Timestamp | Clock };

type NewTimestampsArray<A extends ItemArray> = {
    [Key in A[number]['id']]: NewTimestamps<Omit<A[number], 'id'>>;
};

/** Has the same shape as `O` but with additional `[TIMESTAMP_KEY]` keys and `Timestamp`s or `Clock`s as values */
export type NewTimestamps<O extends object> = {
    [K in keyof O]: O[K] extends ItemArray
        ? // if the value is an array of objects with an id property
          NewTimestampsArray<O[K]>
        : O[K] extends AnyArray<unknown>
        ? // if the value is a simple array, treat it as a primitive
          TimestampObject
        : O[K] extends object
        ? // if the value is an object, recursively timestampify it
          NewTimestamps<O[K]>
        : // otherwise, treat it as a primitive
          TimestampObject;
};

export type SerializedBaseJsonCRDT<O extends object> = {
    data: O;
    timestamps: NewTimestamps<O>;
    pathToItemArrays: string[];
};

export type ItemArrayObject = Record<string, { id: string; _index: number } & unknown>;

export type HasId = { id: string | number };

export type SerializedJsonCRDT<O extends object> = {
    crdt: SerializedBaseJsonCRDT<O>;
    clock: Timestamp;
};
