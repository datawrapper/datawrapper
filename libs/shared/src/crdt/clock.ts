import { iterateObjectPaths } from '../objectPaths.js';
import get from 'lodash/get.js';

export type Timestamp = `${number}-${number}`;

type AnyArray<T = unknown> = Array<T> | ReadonlyArray<T>;

export type ItemArray = AnyArray<{ id: string | number } & Record<string, unknown>>;

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

export class Clock {
    /**
     * Split a timestamp into its nodeId and count
     * @param {Timestamp} timestamp The timestamp to split
     * @returns {[number, number]} The nodeId and count of the timestamp
     */
    static split(timestamp: Clock | Timestamp): [number, number] {
        if (timestamp instanceof Clock) {
            return [timestamp.nodeId, timestamp.count];
        }

        const [nodeId, count] = timestamp.split('-').map(x => parseInt(x));
        return [nodeId, count];
    }

    /**
     * Get the nodeId from a timestamp
     * @param {Timestamp} timestamp The timestamp to get the nodeId from
     * @returns {number} The nodeId of the timestamp
     */
    static getNodeId(timestamp: Clock | Timestamp): number {
        if (timestamp instanceof Clock) {
            return timestamp.nodeId;
        }
        return parseInt(timestamp.split('-')[0]);
    }

    /**
     * Get the count from a timestamp
     * @param {Timestamp} timestamp The timestamp to get the count from
     * @returns {number} The count of the timestamp
     */
    static getCount(timestamp: Clock | Timestamp): number {
        if (timestamp instanceof Clock) {
            return timestamp.count;
        }
        return parseInt(timestamp.split('-')[1]);
    }

    /**
     * Validate a string as a timestamp
     * @param {Timestamp} timestamp The timestamp to validate
     * @returns {boolean} True if the timestamp is valid, false otherwise
     */
    static validate(timestamp: string): timestamp is Timestamp {
        return /^\d+-\d+$/.test(timestamp);
    }

    /**
     * Get the highest timestamp from an object with timestamps as values
     * @param timestamps timestamp object to get the highest timestamp from
     * @returns
     */
    static max(timestamps: Timestamps<object>): Clock {
        if (typeof timestamps !== 'object') {
            throw new Error('Timestamps must be object');
        }
        let maxTimestamp = new Clock();
        iterateObjectPaths(timestamps, (path: string[]) => {
            const value = get(timestamps, path);
            if (typeof value !== 'string') {
                throw new Error(`Timestamps must be strings but is ${typeof value}`);
            }

            const timestamp = new Clock(value);
            if (timestamp.isNewerThan(maxTimestamp)) {
                maxTimestamp = timestamp;
            }
        });
        return maxTimestamp;
    }

    readonly nodeId: number;
    count: number;

    /**
     * Initialize a timestamp
     * @param nodeId The node id to use, defaults to 0
     */
    constructor(timestamp: Clock);
    constructor(timestamp: string);
    constructor(nodeId?: number, count?: number);
    constructor(nodeIdOrTimestamp: string | number | Clock = 0, count = 0) {
        if (typeof nodeIdOrTimestamp === 'number') {
            if (nodeIdOrTimestamp < 0 || !Number.isInteger(nodeIdOrTimestamp)) {
                throw new Error(`nodeId must be a positive integer but is: "${nodeIdOrTimestamp}"`);
            }
            this.nodeId = nodeIdOrTimestamp;
            this.count = count;
            return;
        }
        if (nodeIdOrTimestamp instanceof Clock) {
            this.nodeId = nodeIdOrTimestamp.nodeId;
            this.count = nodeIdOrTimestamp.count;
            return;
        }

        if (!Clock.validate(nodeIdOrTimestamp)) {
            throw new Error(
                `Timestamps must be a string or an instance of Timestamp but is: "${nodeIdOrTimestamp}"`
            );
        }
        [this.nodeId, this.count] = Clock.split(nodeIdOrTimestamp);
    }

    /**
     * Increment a timestamp
     * @returns {Timestamp} The incremented timestamp
     */
    tick() {
        this.count++;
        return this.timestamp;
    }

    /**
     * Update the timestamp to the highest value
     * @param {Clock} timestamp The timestamp to update to
     * @returns {Timestamp} The updated timestamp
     */
    update(timestamp: Clock | Timestamp) {
        const count = Clock.getCount(timestamp);
        this.count = Math.max(this.count, count);
    }

    /**
     * Compare timestamps
     * @param {Clock} timestamp timestamp to compare to
     * @returns true if this > timestamp, false otherwise
     */
    isNewerThan(timestamp: Clock | Timestamp): boolean {
        const [nodeId, count] = Clock.split(timestamp);
        const hasNewerCount = this.count > count;
        const hasSameCount = this.count === count;
        const hasHigherNodeId = this.nodeId > nodeId;

        return hasNewerCount || (hasSameCount && hasHigherNodeId);
    }

    /**
     * Compare timestamps
     * @param {Clock} timestamp timestamp to compare to
     * @returns true if this < timestamp, false otherwise
     */
    isOlderThan(timestamp: Clock | Timestamp): boolean {
        const [nodeId, count] = Clock.split(timestamp);
        const hasOlderCount = this.count < count;
        const hasSameCount = this.count === count;
        const hasLowerNodeId = this.nodeId < nodeId;

        return hasOlderCount || (hasSameCount && hasLowerNodeId);
    }

    /**
     * Get the timestamp as a string
     * @returns {Timestamp} The timestamp as a string
     */
    get timestamp(): Timestamp {
        return `${this.nodeId}-${this.count}`;
    }

    toString(): string {
        return this.timestamp;
    }

    toJSON(): string {
        return this.timestamp;
    }
}
