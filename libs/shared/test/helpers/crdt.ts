import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BaseJsonCRDT } from '../../src/crdt/BaseJsonCRDT';
import { DebugCombinedSnapshot, DebugSnapshot } from '../../src/crdt/types';
import { isEqual } from 'lodash';

const BASE_PATH = resolve(__dirname, '../../src/crdt/__snapshots');

function getSnapshotPath(id: string) {
    return resolve(BASE_PATH, `${id}.json`);
}

export function saveSnapshot(snapshots: DebugSnapshot[]): string {
    const id = crypto.randomUUID().slice(0, 5);

    if (!existsSync(BASE_PATH)) {
        mkdirSync(BASE_PATH);
    }

    if (existsSync(getSnapshotPath(id))) {
        throw new Error(`Snapshot with id ${id} already exists`);
    }

    forEachOther(snapshots, ([, snapshotA], [, snapshotB]) => {
        if (!isEqual(snapshotA.data, snapshotB.data)) {
            throw new Error('Initial data is not equal in all snapshots');
        }
    });

    const combinedSnapshot: DebugCombinedSnapshot = {
        data: snapshots[0].data,
        clients: snapshots.map(({ updates }) => ({ updates })),
    };

    writeFileSync(getSnapshotPath(id), JSON.stringify(combinedSnapshot, null, 2));

    return id;
}

export function replaySnapshot(id: string) {
    const path = getSnapshotPath(id);
    if (!existsSync(path)) {
        throw new Error(`Snapshot with id ${id} does not exist`);
    }

    const snapshot: DebugCombinedSnapshot | DebugSnapshot = JSON.parse(readFileSync(path, 'utf-8'));

    const crdts: BaseJsonCRDT[] = [];

    // Support both single snapshots and combined snapshots.
    const clients = 'clients' in snapshot ? snapshot.clients : [snapshot];

    for (const client of clients) {
        const crdt = new BaseJsonCRDT({ data: snapshot.data });

        for (const update of client.updates) {
            crdt.update(update.diff, update.timestamp);
        }

        crdts.push(crdt);
    }

    return crdts;
}

export function forEachOther<T>(arr: T[], callback: (a: [number, T], b: [number, T]) => void) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if (i === j) continue;
            callback([i, arr[i]], [j, arr[j]]);
        }
    }
}
