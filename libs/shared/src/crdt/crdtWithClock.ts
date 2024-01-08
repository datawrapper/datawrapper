import {
    Clock,
    Timestamp,
    Timestamps,
    getHighestTimestamp,
    counterFromTimestamp
} from './clock.js';
import { CRDT, Patch } from './crdt.js';
import isEmpty from 'lodash/isEmpty.js';

/*
CRDT implementation using a single counter to track updates.
This version has two methods, `foreignUpdate` and `selfUpdate`, which are used to update the data.
The counter is part of the class and is incremented on every self update.
*/
export class CRDTWithClock<O extends object, T extends Timestamps<O>> {
    private clock: Clock;
    private crdt: CRDT<O, T>;

    constructor(nodeId: number, data: O, timestamps?: T) {
        this.crdt = new CRDT(data, timestamps);
        const counter = isEmpty(timestamps)
            ? 0
            : counterFromTimestamp(getHighestTimestamp(timestamps));
        this.clock = new Clock(nodeId, counter);
    }

    /**
     * Update the CRDT with foreign data and timestamp
     * @param patch.data The data patch to apply
     * @param patch.timestamp The timestamp assosicated with the data patch
     */
    foreignUpdate(patch: Patch) {
        const { data, timestamp } = patch;
        this.clock.update(timestamp);
        this.crdt.update(data, timestamp);
    }

    /**
    Increments the counter and updates the internal CRDT with the given data.
    @param data The data patch to apply
    @returns A patch object that contains the applied data patch and the assosicated timestamp
    */
    selfUpdate(data: object): Patch {
        const timestamp = this.clock.tick();
        this.crdt.update(data, timestamp);
        return { data, timestamp };
    }

    data(): O {
        return this.crdt.data();
    }

    timestamps(): T {
        return this.crdt.timestamps();
    }

    timestamp(): Timestamp {
        return this.clock.timestamp();
    }

    counter(): number {
        return this.clock.counter();
    }

    logs() {
        return this.crdt.logs();
    }
}
