import { iterateObjectPaths } from '../objectPaths.js';
import get from 'lodash/get.js';

export type Timestamp = `${number}-${number}`;

export type DeepPartial<O extends object> = {
    [K in keyof O]?: O[K] extends object ? DeepPartial<O[K]> : O[K];
};

export type ReplaceValue<O extends object, V> = {
    [K in keyof O]: O[K] extends object ? ReplaceValue<O[K], V> : V;
};

/** Has the same shape as `O` but with `timestamps`s as values */
export type Timestamps<O extends object> = ReplaceValue<O, Timestamp>;

/**
 * Initialize a timestamp
 * @param nodeId The node id to use, defaults to 0
 * @returns {Timestamp} A timestamp initialized to 0
 */
export const initTimestamp = (nodeId = 0): Timestamp => `${nodeId}-0`;
/**
 * Increment a timestamp
 * @param {Timestamp} timestamp The timestamp to increment
 * @returns {Timestamp} The incremented timestamp
 */
export const incrementTimestamp = (timestamp: Timestamp): Timestamp => {
    const [nodeId, time] = timestamp.split('-');
    return `${parseInt(nodeId)}-${parseInt(time) + 1}`;
};
/**
 * Validate a string as a timestamp
 * @param {Timestamp} timestamp The timestamp to validate
 * @returns {boolean} True if the timestamp is valid, false otherwise
 */
export const validateTimestamp = (timestamp: Timestamp): boolean => {
    return /^\d+-\d+$/.test(timestamp);
};

/**
 * Get the counter from a timestamp
 * @param {Timestamp} timestamp Timestamp to get the counter from
 * @returns {number} Counter of the timestamp
 */
export const counterFromTimestamp = (timestamp: Timestamp): number => {
    return parseInt(timestamp.split('-')[1]);
};

/**
 * Get the nodeId from a timestamp
 * @param {Timestamp} timestamp Timestamp to get the nodeId from
 * @returns {number} nodeId of the timestamp
 */
export const nodeIdFromTimestamp = (timestamp: Timestamp): number => {
    return parseInt(timestamp.split('-')[0]);
};

/**
 * Compare two timestamps
 * @param {Timestamp} timestamp1 first timestamp
 * @param {Timestamp} timestamp2 second timestamp
 * @returns true if timestamp1 > timestamp2, false otherwise
 */
export const compareTimestamps = (timestamp1: Timestamp, timestamp2: Timestamp): boolean => {
    if (!validateTimestamp(timestamp1) || !validateTimestamp(timestamp2)) {
        throw new Error(`Invalid timestamp in ${timestamp1} or ${timestamp2}`);
    }
    const [nodeId1, time1] = timestamp1.split('-').map(x => parseInt(x));
    const [nodeId2, time2] = timestamp2.split('-').map(x => parseInt(x));
    return time1 > time2 || (time1 === time2 && nodeId1 > nodeId2);
};

/**
 * Get the highest timestamp from an object with timestamps as values
 * @param timestamps timestamp object to get the highest timestamp from
 * @returns
 */
export const getHighestTimestamp = (timestamps: Timestamps<object>): Timestamp => {
    if (typeof timestamps !== 'object') {
        throw new Error('Timestamps must be object');
    }
    let maxTimestamp: Timestamp = initTimestamp();
    iterateObjectPaths(timestamps, (path: string[]) => {
        const timestamp = get(timestamps, path);
        if (typeof timestamp !== 'string') {
            throw new Error(`Timestamps must be strings but is ${typeof timestamp}`);
        }
        if (!validateTimestamp(timestamp as Timestamp)) {
            throw new Error(`Invalid timestamp: ${timestamp}`);
        }
        if (compareTimestamps(timestamp as Timestamp, maxTimestamp)) {
            maxTimestamp = timestamp as Timestamp;
        }
    });
    return maxTimestamp;
};

/**
 * A simple clock that keeps track of the current timestamp.
 * It additionally uses the nodeId to break ties between counters with the same timestamp.
 */
export class Clock {
    nodeId: number;
    count: number;

    constructor(nodeId: number, count = 0) {
        if (nodeId < 0 || !Number.isInteger(nodeId)) {
            throw new Error('nodeId must be a positive integer');
        }
        this.nodeId = nodeId;
        this.count = count;
    }

    tick() {
        this.count++;
        return this.timestamp();
    }

    update(timestamp: Timestamp) {
        const counter = counterFromTimestamp(timestamp);
        this.count = Math.max(this.count, counter);
    }

    timestamp(): Timestamp {
        return `${this.nodeId}-${this.count}`;
    }

    toString() {
        return this.timestamp();
    }

    counter() {
        return this.count;
    }

    static fromString(timestamp: Timestamp) {
        const [nodeId, count] = timestamp.split('-').map(x => parseInt(x));
        return new Clock(nodeId, count);
    }
}
