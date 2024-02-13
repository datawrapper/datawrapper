import isEqual from 'lodash/isEqual.js';
import { CRDT, Update } from './CRDT.js';
import { Timestamp, Timestamps } from './Clock.js';
import { JsonCRDT } from './JsonCRDT.js';

export class SimpleCRDT implements CRDT<string> {
    private crdt: JsonCRDT<{ value: string }>;
    constructor(nodeId: number, value: string, timestamp?: Timestamp) {
        this.crdt = new JsonCRDT<{ value: string }>(
            nodeId,
            { value },
            timestamp ? ({ value: timestamp } as Timestamps<{ value: string }>) : undefined
        );
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
}
