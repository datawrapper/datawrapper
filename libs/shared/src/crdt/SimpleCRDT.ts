import isEqual from 'lodash/isEqual.js';
import { CRDT, Update } from './CRDT.js';
import { Timestamp, NewTimestamps, DebugFlagOrLevel } from './types.js';
import { JsonCRDT } from './JsonCRDT.js';
import { TIMESTAMP_KEY } from './constants.js';

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
                    }>
                }
            });
            return;
        }
        // normal constructor
        this.crdt = new JsonCRDT<{ value: string }>({ nodeId, data: { value } });
    }

    createUpdate(diff: string): Update<string> {
        const update = this.crdt.createUpdate({ value: diff });
        return { diff, timestamp: update.timestamp };
    }

    applyUpdate(update: Update<string>): void {
        this.crdt.applyUpdate({ diff: { value: update.diff }, timestamp: update.timestamp });
    }

    calculateDiff(newData: string): string {
        if (isEqual(this.data(), newData)) return ''; // isEmpty('') === true
        return newData;
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
