import { Clock } from './Clock.js';
import { type Timestamp } from './types.js';

export type Diff<O extends object | string | number> = O;

export type Update<O extends object | string | number> = {
    timestamp: Timestamp | Clock;
    diff: Diff<O>;
};

/**
 * CRDT interface, which defines the methods that a CRDT implementation must implement.
 * @applyUpdate applies an update (diff & timestamp) to the CRDT
 * @createUpdate creates an update from a diff
 * @calculateDiff calculates the diff between two data objects
 * @data gets the current data object
 */
// #region CRDT
export interface CRDT<O extends object | string | number> {
    applyUpdate(update: Update<O>): void;
    createUpdate(diff: Diff<O>): Update<O>;
    calculateDiff(
        newData: O,
        options?: { allowedKeys?: Set<string>; ignorePaths?: Set<string> | null }
    ): Diff<O>;
    data(): O;
}
// #endregion CRDT
