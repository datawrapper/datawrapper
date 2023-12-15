import setNestedValue from 'lodash/set.js';
import getNestedValue from 'lodash/get.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { compareTimestamps, initTimestamp, Timestamp } from './clock.js';

/** Has the same shape as `O` but with `timestamps`s as values */
export type Timestamps<O extends object> = ReplaceValue<O, Timestamp>;

export type DeepPartial<O extends object> = {
    [K in keyof O]?: O[K] extends object ? DeepPartial<O[K]> : O[K];
};

export type ReplaceValue<O extends object, V> = {
    [K in keyof O]: O[K] extends object ? ReplaceValue<O[K], V> : V;
};

export type Patch = {
    timestamp: Timestamp;
    data: object;
};

/**
 * Recursively maps an object to a new object of identical shape, applying the given function on each value of the object
 * @param obj Object to map
 * @param fn Function to apply to each value
 * @param additionalArgs Additional arguments to pass to the function
 * @param path Path to the current value: Must be empty when calling this function externally and is used internally for recursion
 */
export function iterateObjectValuesWithPath<
    O extends object,
    Fn extends (value: unknown, path: string[]) => unknown
>(obj: O, fn: Fn, path = [] as string[]): ReplaceValue<O, ReturnType<Fn>> {
    const newObj = {} as ReplaceValue<O, ReturnType<Fn>>;

    for (const key in obj) {
        const value = obj[key];
        const currentPath = [...path, key];
        if (typeof value === 'object' && value !== null) {
            newObj[key] = iterateObjectValuesWithPath(
                value,
                fn,
                currentPath
            ) as typeof newObj[typeof key];
        } else {
            newObj[key] = fn(value, currentPath) as typeof newObj[typeof key];
        }
    }
    return newObj;
}

/**
CRDT implementation using a single counter to track updates.
It only has one update method which takes a data patch and a timestamp patch.
The user has to keep track of the counter themselves, outside of this class.
*/
export class CRDT<O extends object, T extends Timestamps<O>> {
    private dataObj: O;
    private timestampObj: T;
    private log: {
        receivedUpdates: number;
        appliedUpdates: number;
    };
    /**
     * Constructs a new CRDT instance with the given data and optional timestamps.
     * @param data The initial data object
     * @param timestamps The initial timestamp object, if not provided it will be inferred from the data
     * @returns A new CRDT instance
     */
    constructor(data: O, timestamps?: T) {
        this.dataObj = data;
        this.timestampObj = timestamps ?? this.initTimestamps();
        this.log = {
            receivedUpdates: 0,
            appliedUpdates: 0
        };
    }

    /**
     * Updates the CRDT with the given data patch and timestamp patch.
     * @param data The data patch to apply
     * @param timestamp The timestamp assosicated with the data patch
     */
    update(data: object, timestamp: Timestamp) {
        iterateObjectValuesWithPath(data, (patchValue, path) => {
            const currentTimestamp = getNestedValue(this.timestampObj, path) ?? initTimestamp();
            this.log.receivedUpdates += 1;
            if (compareTimestamps(timestamp, currentTimestamp)) {
                setNestedValue(this.dataObj, path, patchValue);
                setNestedValue(this.timestampObj, path, timestamp);
                this.log.appliedUpdates += 1;
            }
        });
    }

    /** Creates a timestamps with the same shape as data but with new timestamps as values */
    private initTimestamps(): T {
        return iterateObjectValuesWithPath(this.dataObj, () => initTimestamp()) as T;
    }

    data(): O {
        return cloneDeep(this.dataObj);
    }

    timestamps(): T {
        return cloneDeep(this.timestampObj);
    }

    logs() {
        return { ...this.log, successRate: this.log.appliedUpdates / this.log.receivedUpdates };
    }
}
