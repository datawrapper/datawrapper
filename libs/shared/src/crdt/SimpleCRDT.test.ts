import test from 'ava';
import { SimpleCRDT } from './SimpleCRDT';

test('overwrites value if timestamp.count is newer', t => {
    const crdt = new SimpleCRDT(1, 'value', '1-1');
    crdt.applyUpdate({ diff: 'new value', timestamp: '1-2' });
    t.is(crdt.data(), 'new value');
});

test('does overwrite value if timestamp.nodeId is higher but count is the same', t => {
    const crdt = new SimpleCRDT(1, 'value', '1-1');
    crdt.applyUpdate({ diff: 'new value', timestamp: '2-1' });
    t.is(crdt.data(), 'new value');
});

test('does not overwrites value if timestamp.count is older', t => {
    const crdt = new SimpleCRDT(1, 'value', '1-2');
    crdt.applyUpdate({ diff: 'new value', timestamp: '1-1' });
    t.is(crdt.data(), 'value');
});

test('does not overwrites value if timestamp.count and timestamp.nodeId is equal', t => {
    const crdt = new SimpleCRDT(1, 'value', '1-1');
    crdt.applyUpdate({ diff: 'new value', timestamp: '1-1' });
    t.is(crdt.data(), 'value');
});

test('does not overwrite value if timestamp.count is older but timestamp.nodeId is higher', t => {
    const crdt = new SimpleCRDT(1, 'value', '1-2');
    crdt.applyUpdate({ diff: 'new value', timestamp: '2-1' });
    t.is(crdt.data(), 'value');
});

test('creates a new update with a higher count', t => {
    const crdt = new SimpleCRDT(1, 'value', '1-1');
    const update1 = crdt.createUpdate('new value');
    t.is(update1.diff, 'new value');
    t.is(update1.timestamp, '1-2');

    const update2 = crdt.createUpdate('another value');
    t.is(update2.diff, 'another value');
    t.is(update2.timestamp, '1-3');
});

test('calculateDiff returns undefined if there is no diff', t => {
    const crdt = new SimpleCRDT(1, 'value', '1-1');
    t.is(crdt.calculateDiff('value'), undefined);
});
