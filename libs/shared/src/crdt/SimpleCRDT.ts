import { CRDT, Diff, Update } from './CRDT.js';
import { Timestamp, NewTimestamps, DebugFlagOrLevel } from './types.js';
import { JsonCRDT } from './JsonCRDT.js';
import { TIMESTAMP_KEY } from './constants.js';
import isEqual from 'lodash/isEqual.js';

export class SimpleCRDT implements CRDT<string> {
    private crdt: JsonCRDT<{ value: string }>;
    constructor(nodeId: number, value: string, timestamp?: Timestamp) {
        if (timestamp) {
            // fromSerialized constructor
            this.crdt = new JsonCRDT<{ value: string }>({
                timestamp,
                serialized: {
                    data: { value },
                    pathsToItemArrays: [],
                    timestamps: { value: { [TIMESTAMP_KEY]: timestamp } } as NewTimestamps<{
                        value: string;
                    }>,
                },
            });
            return;
        }
        // normal constructor
        this.crdt = new JsonCRDT<{ value: string }>({ nodeId, data: { value } });
    }

    createUpdate(diff: Diff<string>): Update<string> | null {
        if (diff === undefined) {
            return null;
        }
        const update = this.crdt.createUpdate({ value: diff });
        if (update === null) {
            throw new Error('Update is null, but must be an object.');
        }
        return { diff, timestamp: update.timestamp };
    }

    applyUpdate(update: Update<string>): void {
        const { diff } = update;
        if (diff === undefined || diff === null) {
            throw new Error('diff is undefined or null, but must be a string.');
        }
        this.crdt.applyUpdate({ diff: { value: diff }, timestamp: update.timestamp });
    }

    calculateDiff(newData: string): Diff<string> {
        return this.crdt.calculateDiff({ value: newData })?.value;
    }

    data(): string {
        return this.crdt.data().value;
    }

    timestamp(): Timestamp {
        return this.crdt.timestamp();
    }

    setDebug(debug: DebugFlagOrLevel): void {
        this.crdt.setDebug(debug);
    }

    getDebugInfo() {
        return this.crdt.getDebugInfo();
    }
}
