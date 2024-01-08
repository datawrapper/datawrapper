import set from 'lodash/set.js';
import get from 'lodash/get.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { compareTimestamps, initTimestamp, Timestamp, Timestamps } from './clock.js';
import { iterateObjectPaths } from '../objectPaths.js';

export type Patch = {
    timestamp: Timestamp;
    data: object;
};

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
        iterateObjectPaths(data, path => {
            const currentTimestamp = get(this.timestampObj, path) ?? initTimestamp();
            const patchValue = get(data, path);
            this.log.receivedUpdates += 1;
            if (compareTimestamps(timestamp, currentTimestamp)) {
                set(this.dataObj, path, patchValue);
                set(this.timestampObj, path, timestamp);
                this.log.appliedUpdates += 1;
            }
        });
    }

    /** Creates a timestamps with the same shape as data but with new timestamps as values */
    private initTimestamps(): T {
        const timestamps = {};
        iterateObjectPaths(this.dataObj, path => {
            set(timestamps, path, initTimestamp());
        });
        return timestamps as T;
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
