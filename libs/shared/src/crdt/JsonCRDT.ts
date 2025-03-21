import { Clock } from './Clock.js';
import { BaseJsonCRDT } from './BaseJsonCRDT.js';
import type { CRDT, Diff, Update } from './CRDT.js';
import type {
    Timestamp,
    SerializedBaseJsonCRDT,
    SerializedJsonCRDT,
    DebugFlagOrLevel,
    CalculateDiffOptions,
} from './types.js';
import { typeofObjectProperties } from './utils.js';
import isEmpty from 'lodash/isEmpty.js';

/*
CRDT implementation using a single counter to track updates.
This version has two methods, `applyUpdate` and `createUpdate`, which are used to update the data.
The counter is part of the class and is incremented everytime we create or apply an update.
*/
export class JsonCRDT<O extends object> implements CRDT<O> {
    private clock: Clock;
    private crdt: BaseJsonCRDT<O>;

    static fromSerialized<O extends object>(
        serialized: SerializedJsonCRDT<O>,
        nodeId?: number
    ): JsonCRDT<O> {
        const { crdt } = serialized;
        let { clock } = serialized;
        if (nodeId !== undefined) {
            clock = `${nodeId}-${Clock.getCount(clock)}`;
        }
        return new JsonCRDT({ timestamp: clock, serialized: crdt });
    }

    // Normal constructor
    constructor(props: { nodeId: number; data: O; pathsToItemArrays?: string[] });
    // FromSerialized constructor
    constructor(props: { timestamp: Timestamp; serialized: SerializedBaseJsonCRDT<O> });

    constructor(props: {
        nodeId?: number;
        timestamp?: Timestamp;
        data?: O;
        serialized?: SerializedBaseJsonCRDT<O>;
        pathsToItemArrays?: string[];
    }) {
        const { nodeId, timestamp, data, serialized, pathsToItemArrays } = props;
        if (
            !timestamp &&
            !serialized &&
            data &&
            typeof nodeId === 'number' &&
            typeof data === 'object'
        ) {
            // normal constructor
            this.crdt = new BaseJsonCRDT({ data: data as O, pathsToItemArrays });
            this.clock = new Clock(nodeId, 0);
        } else if (
            !nodeId &&
            !data &&
            timestamp &&
            typeof timestamp === 'string' &&
            Clock.validate(timestamp) &&
            serialized &&
            'data' in serialized &&
            'timestamps' in serialized &&
            'pathsToItemArrays' in serialized
        ) {
            // fromSerialized constructor
            this.crdt = BaseJsonCRDT.fromSerialized(serialized);
            this.clock = new Clock(timestamp);
        } else {
            throw new Error(
                `JsonCRDT constructor called with invalid arguments. Types: ${JSON.stringify(
                    typeofObjectProperties(props ?? {})
                )}, Values: ${JSON.stringify(props ?? {})}`
            );
        }
    }

    /**
     * Apply an update to the CRDT. An update consists of a data diff and a timestamp.
     * @param update.diff The data diff to apply
     * @param update.timestamp The timestamp associated with the data diff
     */
    applyUpdate(update: Update<O>) {
        if (isEmpty(update.diff)) {
            // Updates must be created by createUpdate. createUpdate must return null for empty diffs.
            throw new Error(
                'Empty diffs are not allowed. Use createUpdate to create updates with empty diffs.'
            );
        }
        const { diff, timestamp } = update;
        this.clock.update(timestamp);
        this.crdt.update(diff, timestamp);
    }

    /**
     * Apply an update to the CRDT. An update consists of a data diff and a timestamp.
     * @param update.diff The data diff to apply
     * @param update.timestamp The timestamp associated with the data diff
     */
    applyUpdates(updates: Update<O>[]) {
        for (const update of updates) {
            this.applyUpdate(update);
        }
    }

    /**
     * Applies the provided data diff to the CRDT and returns an update containing the diff and the associated timestamp.
     * The timestamp is generated by the incrementing the internal logical clock.
     * @param data The data diff to apply
     * @returns An update object that contains the applied data diff and the associated timestamp
     */
    createUpdate(diff: Diff<O>): Update<O> | null {
        if (isEmpty(diff)) {
            // We don't allow to create updates with empty diffs as there is nothing to change
            return null;
        }
        const timestamp = this.clock.tick();
        this.crdt.update(diff, timestamp);
        return { diff, timestamp };
    }

    calculateDiff(
        newData: O,
        options?: Pick<CalculateDiffOptions, 'allowedKeys' | 'ignorePaths'>
    ): Diff<O> {
        return this.crdt.calculateDiff(newData, options) as Diff<O>;
    }

    data(): O {
        return this.crdt.data();
    }

    // timestamps(): O {
    //     return this.crdt.timestamps();
    // }

    serialize(): SerializedJsonCRDT<O> {
        return {
            crdt: this.crdt.serialize(),
            clock: this.clock.timestamp,
        };
    }

    nodeId(): number {
        return this.clock.nodeId;
    }

    timestamp(): Timestamp {
        return Clock.max(this.crdt.timestamps()).timestamp;
    }

    counter(): number {
        return this.clock.count;
    }

    setDebug(value: DebugFlagOrLevel) {
        this.crdt.setDebug(value);
    }

    getDebugInfo() {
        return {
            history: this.crdt.getDebugHistory(),
            getSnapshot: () => this.crdt.getDebugSnapshot(),
            printHistory: (name?: string) =>
                this.crdt.printDebugHistory(name, { nodeId: this.nodeId() }),
        };
    }
}
