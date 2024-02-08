import { Clock, Timestamp } from './Clock.js';

export type Diff<O extends object | string | number> = O;

export type Update<O extends object | string | number> = {
    timestamp: Timestamp | Clock;
    diff: Diff<O>;
};

export interface CRDT<O extends object | string | number> {
    applyUpdate(update: Update<O>): void;
    createUpdate(diff: Diff<O>): Update<O>;
    calculateDiff(
        newData: O,
        options?: { allowedKeys?: Set<string>; ignorePaths?: Set<string> | null }
    ): Diff<O>;
    data(): O;
}
