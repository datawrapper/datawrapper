import { CRDT, Update } from './CRDT.js';
import { Timestamp, Timestamps } from './Clock.js';
import { JsonCRDT } from './JsonCRDT.js';

export class SimpleCRDT<O extends number | string> implements CRDT<O> {
    private crdt: JsonCRDT<{ value: O }>;
    constructor(nodeId: number, value: O, timestamp?: Timestamp) {
        this.crdt = new JsonCRDT<{ value: O }>(
            nodeId,
            { value },
            timestamp ? ({ value: timestamp } as Timestamps<{ value: O }>) : undefined
        );
    }

    createUpdate(diff: O): Update<O> {
        const update = this.crdt.createUpdate({ value: diff });
        return { diff, timestamp: update.timestamp };
    }

    applyUpdate(update: Update<O>): void {
        this.crdt.applyUpdate({ diff: { value: update.diff }, timestamp: update.timestamp });
    }

    calculateDiff(newData: O): O {
        return newData;
    }

    data(): O {
        return this.crdt.data().value;
    }
}
