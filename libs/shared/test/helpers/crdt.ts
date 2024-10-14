import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Timestamp } from '../../src/crdt';
import { BaseJsonCRDT } from '../../src/crdt/BaseJsonCRDT';

const BASE_PATH = resolve(__dirname, '../../src/crdt/__snapshots');

type Snapshot = {
    initialData: object;
    updates: Record<number, { diff: object; timestamp: Timestamp }[]>;
};

function getSnapshotPath(id: string) {
    return resolve(BASE_PATH, `${id}.json`);
}

export function saveSnapshot(data: Snapshot): string {
    const id = crypto.randomUUID().slice(0, 5);

    if (!existsSync(BASE_PATH)) {
        mkdirSync(BASE_PATH);
    }

    if (existsSync(getSnapshotPath(id))) {
        throw new Error(`Snapshot with id ${id} already exists`);
    }

    writeFileSync(getSnapshotPath(id), JSON.stringify(data, null, 2));

    return id;
}

export function replaySnapshot(id: string) {
    const path = getSnapshotPath(id);
    if (!existsSync(path)) {
        throw new Error(`Snapshot with id ${id} does not exist`);
    }

    const snapshot: Snapshot = JSON.parse(readFileSync(path, 'utf-8'));

    const crdts: BaseJsonCRDT[] = [];

    for (const updates of Object.values(snapshot.updates)) {
        const crdt = new BaseJsonCRDT(snapshot.initialData);

        for (const update of updates) {
            crdt.update(update.diff, update.timestamp);
        }

        crdts.push(crdt);
    }

    return crdts;
}
