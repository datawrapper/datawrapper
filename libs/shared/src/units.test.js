import test from 'ava';
import { UNIT_IN, UNIT_MM, UNIT_PX, pxToUnit, unitToPx } from './units.js';

test('unitToPx() converts px to px', t => {
    t.deepEqual(unitToPx(12.3, UNIT_PX), 12.3);
});

test('unitToPx() converts inch to px', t => {
    t.deepEqual(unitToPx(12.3, UNIT_IN).toFixed(2), '1180.80');
    t.deepEqual(unitToPx(12.3, UNIT_IN, 72).toFixed(2), '885.60');
});

test('unitToPx() converts mm to px', t => {
    t.deepEqual(unitToPx(12.3, UNIT_MM).toFixed(2), '46.49');
    t.deepEqual(unitToPx(12.3, UNIT_MM, 72).toFixed(2), '34.87');
});

test('unitToPx() throws and error for invalid unit', t => {
    t.throws(() => {
        unitToPx(12.3);
    });
    t.throws(() => {
        unitToPx(12.3, 'foo');
    });
});

test('pxToUnit() converts px to px', t => {
    t.deepEqual(pxToUnit(12.3, UNIT_PX), 12.3);
});

test('pxToUnit() converts inch to px', t => {
    t.deepEqual(pxToUnit(1180.8, UNIT_IN).toFixed(2), '12.30');
    t.deepEqual(pxToUnit(885.6, UNIT_IN, 72).toFixed(2), '12.30');
});

test('pxToUnit() converts mm to px', t => {
    t.deepEqual(pxToUnit(46.49, UNIT_MM).toFixed(2), '12.30');
    t.deepEqual(pxToUnit(34.87, UNIT_MM, 72).toFixed(2), '12.30');
});

test('pxToUnit() throws and error for invalid unit', t => {
    t.throws(() => {
        pxToUnit(12.3);
    });
    t.throws(() => {
        pxToUnit(12.3, 'foo');
    });
});
