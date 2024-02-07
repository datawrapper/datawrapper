import { Clock, Timestamp } from './Clock.js';

export type Diff = object;

export type Update = {
    timestamp: Timestamp | Clock;
    diff: Diff;
};

export interface CRDT<O extends object> {
    applyUpdate(update: Update): void;
    createUpdate(diff: Diff): Update;
    calculateDiff(newData: O, options?: { allowedKeys?: null | (keyof O)[] }): Diff;
    data(): O;
}
