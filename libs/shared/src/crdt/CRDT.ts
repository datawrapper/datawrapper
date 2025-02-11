import { Clock } from './Clock.js';
import type {
    DebugFlagOrLevel,
    DebugHistoryEntry,
    DebugSnapshot,
    Timestamp,
    CalculateDiffOptions,
} from './types.js';

export type Diff<O extends object | string | number> = O extends object
    ? Partial<O>
    : O | undefined;

export type Update<O extends object | string | number> = {
    timestamp: Timestamp | Clock;
    diff: Diff<O>;
};

/**
 * CRDT interface, which defines the methods that a CRDT implementation must implement.
 * @applyUpdate applies an update (diff & timestamp) to the CRDT
 * @createUpdate creates an update from a diff. If the diff is empty (i.e., the data has not changed), createUpdate must return null.
 * @calculateDiff calculates the difference between two data objects
 * @data gets the current data object
 */
// #region CRDT
export interface CRDT<O extends object | string | number> {
    applyUpdate(update: Update<O>): void;
    createUpdate(diff: Diff<O>): Update<O> | null;
    calculateDiff(
        newData: O,
        options?: Pick<CalculateDiffOptions, 'allowedKeys' | 'ignorePaths'>
    ): Diff<O>;
    data(): O;

    setDebug(debug: DebugFlagOrLevel): void;
    getDebugInfo(): {
        history: DebugHistoryEntry[];
        getSnapshot: () => DebugSnapshot;
        printHistory: (name?: string) => void;
    };
}
// #endregion CRDT
