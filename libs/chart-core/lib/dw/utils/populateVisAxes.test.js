import test from 'ava';
import populateVisAxes from './populateVisAxes.js';
import column from '../dataset/column.js';
import dataset from '../dataset/index.js';

const LABELS = { accepts: ['text', 'date'] };
const X_AXIS = { accepts: ['number', 'date'] };
const GROUPS = { accepts: ['text'], optional: true };
const VALUES = { accepts: ['number'], multiple: false };
const VALUES_MULTIPLE = { accepts: ['number'], multiple: true };

test('assign correct columns based on type for non-optional axes', t => {
    const ds = dataset([textColumn('name'), numberColumn('value')]);
    const visAxes = {
        labels: LABELS,
        groups: GROUPS,
        bars: VALUES,
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes });
    t.is(axes.labels, 'name');
    t.is(axes.bars, 'value');
    t.is(axes.groups, false);
});

test('assign all number columns to axis with multiple = true', t => {
    const ds = dataset([
        dateColumn('month'),
        numberColumn('line1'),
        numberColumn('line2'),
        numberColumn('line3'),
    ]);
    const visAxes = {
        date: X_AXIS,
        lines: VALUES_MULTIPLE,
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes });
    t.is(axes.date, 'month');
    t.deepEqual(axes.lines, ['line1', 'line2', 'line3']);
});

test('assign all number columns to axis with multiple = true, except if already assigned to different axis', t => {
    const ds = dataset([
        dateColumn('month'),
        numberColumn('line1'),
        numberColumn('line2'),
        numberColumn('line3'),
        numberColumn('value'),
    ]);
    const visAxes = {
        date: X_AXIS,
        value: VALUES,
        lines: VALUES_MULTIPLE,
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes, userAxes: { value: 'value' } });
    t.is(axes.date, 'month');
    t.is(axes.value, 'value');
    t.deepEqual(axes.lines, ['line1', 'line2', 'line3']);
});

test('if there are no unused columns available for axis with multiple = true, reuse user-assigned axis', t => {
    const ds = dataset([dateColumn('month'), numberColumn('value')]);
    const visAxes = {
        x: X_AXIS,
        lines: VALUES_MULTIPLE,
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes, userAxes: { x: 'value' } });
    t.is(axes.x, 'value');
    t.deepEqual(axes.lines, ['value']);
});

test("don't assign columns twice", t => {
    const ds = dataset([textColumn('name'), numberColumn('value1'), numberColumn('value2')]);
    const visAxes = {
        labels: LABELS,
        start: VALUES,
        end: VALUES,
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes });
    t.is(axes.labels, 'name');
    t.is(axes.start, 'value1');
    t.is(axes.end, 'value2');
});

test('respect user axes preferences for required axis', t => {
    const ds = dataset([textColumn('name'), numberColumn('value1'), numberColumn('value2')]);
    const visAxes = {
        labels: LABELS,
        start: VALUES,
        end: VALUES,
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes, userAxes: { start: 'value2' } });
    t.is(axes.labels, 'name');
    t.is(axes.start, 'value2');
    t.is(axes.end, 'value1');
});

test('respect user preference for optional axis', t => {
    const ds = dataset([textColumn('name'), numberColumn('value'), textColumn('category')]);
    const visAxes = {
        labels: LABELS,
        groups: GROUPS,
        bars: VALUES,
    };
    const { axes } = populateVisAxes({
        dataset: ds,
        visAxes,
        userAxes: { groups: 'category' },
    });
    t.is(axes.labels, 'name');
    t.is(axes.bars, 'value');
    t.is(axes.groups, 'category');
});

test('make optional axis mandatory using overrideOptionalKey', t => {
    const ds = dataset([textColumn('name'), numberColumn('value'), textColumn('category')]);
    const visAxes = {
        labels: LABELS,
        groups: { ...GROUPS, overrideOptionalKey: 'visualize.my-groups' },
        bars: VALUES,
    };
    const { axes } = populateVisAxes({
        dataset: ds,
        visAxes,
        overrideKeys: { 'visualize.my-groups': true },
    });
    t.is(axes.labels, 'name');
    t.is(axes.bars, 'value');
    t.is(axes.groups, 'category');
});

test('make optional axis mandatory using overrideOptionalKey, with specific overrideOptionalValue', t => {
    const ds = dataset([textColumn('name'), numberColumn('value'), textColumn('category')]);
    const visAxes = {
        labels: LABELS,
        area: {
            optional: true,
            accepts: ['number'],
            overrideOptionalKey: 'visualize.symbol-shape',
            overrideOptionalKeyValue: 'arrow',
        },
    };
    const { axes } = populateVisAxes({
        dataset: ds,
        visAxes,
        overrideKeys: { 'visualize.symbol-shape': 'arrow' },
    });
    t.is(axes.labels, 'name');
    t.is(axes.area, 'value');
});

test('prefer columns based on name', t => {
    const ds = dataset([
        textColumn('name'),
        numberColumn('value'),
        numberColumn('latitude'),
        numberColumn('longitude'),
    ]);
    const visAxes = {
        lat: { accepts: ['number'], preferred: '^(lat|y)' },
        lon: { accepts: ['number'], preferred: '^(lon|x)' },
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes });
    t.is(axes.lat, 'latitude');
    t.is(axes.lon, 'longitude');
});

test('prefer columns based on (regex test)', t => {
    const ds = dataset([
        textColumn('name'),
        numberColumn('value'),
        numberColumn('longitude'),
        numberColumn('year'),
    ]);
    const visAxes = {
        lat: { accepts: ['number'], preferred: '^(lat|y$)' },
        lon: { accepts: ['number'], preferred: '^(lon|x$)' },
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes });
    t.is(axes.lat, 'value');
    t.is(axes.lon, 'longitude');
});

test('add missing label column to dataset', t => {
    const ds = dataset([numberColumn('value')]);
    const visAxes = {
        labels: { accepts: ['text', 'date'] },
        slices: { accepts: ['number'], multiple: false },
    };
    t.is(ds.numColumns(), 1);

    const { axes } = populateVisAxes({ dataset: ds, visAxes });
    t.is(axes.labels, 'labels');
    t.is(axes.slices, 'value');
    t.is(ds.numColumns(), 2);
    t.is(ds.column('labels').type(), 'text');
    t.deepEqual(ds.column('labels').values(), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
});

test('regression test for scatter charts', t => {
    const ds = dataset([numberColumn('column1'), numberColumn('column2')]);
    const visAxes = {
        x: { accepts: ['number', 'date'], prefers: 'number' },
        y: { accepts: ['number', 'date'], prefers: 'number' },
        size: { accepts: ['number'], optional: true },
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes, userAxes: { size: 'column1' } });
    t.truthy(axes.x, 'axis.x is undefined');
    t.truthy(axes.y, 'axis.y is undefined');
    t.truthy(axes.size, 'axis.size is undefined');
});

test('insufficient dataset - column gets reused when there is no other option', t => {
    const ds = dataset([numberColumn('column1'), numberColumn('column2')]);
    const visAxes = {
        x: { accepts: ['number'] },
        y: { accepts: ['number'] },
        size: { accepts: ['number'] },
    };
    const { axes } = populateVisAxes({ dataset: ds, visAxes });
    t.truthy(axes.x, 'axis.x is undefined');
    t.truthy(axes.y, 'axis.y is undefined');
    t.truthy(axes.size, 'axis.size is undefined');
});

test('insufficient dataset with preventMultipleUse: true - column does not get reused (irrespective of order of visAxes definition)', t => {
    const ds = dataset([numberColumn('column1'), numberColumn('column2')]);

    const variants = [
        {
            x: { accepts: ['number'], preventMultipleUse: true },
            y: { accepts: ['number'], preventMultipleUse: true },
            size: { accepts: ['number'] },
        },
        {
            size: { accepts: ['number'] },
            x: { accepts: ['number'], preventMultipleUse: true },
            y: { accepts: ['number'], preventMultipleUse: true },
        },
    ];

    variants.forEach(visAxes => {
        const { axes } = populateVisAxes({ dataset: ds, visAxes });
        t.truthy(axes.x, 'axis.x is undefined');
        t.truthy(axes.y, 'axis.y is undefined');
        t.is(axes.size, false, "axis.size got assigned even though there aren't enough columns");
    });
});

test('insufficient dataset with preventMultipleUse: true - automatic population takes prescedence over user preference', t => {
    const ds = dataset([numberColumn('column1'), numberColumn('column2')]);

    const variants = [
        {
            x: { accepts: ['number'], preventMultipleUse: true },
            y: { accepts: ['number'], preventMultipleUse: true },
            size: { accepts: ['number'] },
        },
        {
            size: { accepts: ['number'] },
            x: { accepts: ['number'], preventMultipleUse: true },
            y: { accepts: ['number'], preventMultipleUse: true },
        },
    ];
    variants.forEach(visAxes => {
        const { axes } = populateVisAxes({ dataset: ds, visAxes, userAxes: { size: 'column1' } });
        t.truthy(axes.x, 'axis.x is undefined');
        t.truthy(axes.y, 'axis.y is undefined');
        t.is(
            axes.size,
            false,
            "axis.size user preference retained even though there aren't enough columns"
        );
    });
});

test('insufficient dataset with preventMultipleUse: true still applies even when all axes have user-preference', t => {
    const ds = dataset([numberColumn('column1'), numberColumn('column2')]);

    const variants = [
        {
            x: { accepts: ['number'], preventMultipleUse: true },
            y: { accepts: ['number'], preventMultipleUse: true },
            size: { accepts: ['number'] },
        },
        {
            size: { accepts: ['number'] },
            x: { accepts: ['number'], preventMultipleUse: true },
            y: { accepts: ['number'], preventMultipleUse: true },
        },
    ];
    variants.forEach(visAxes => {
        const { axes } = populateVisAxes({
            dataset: ds,
            visAxes,
            userAxes: { size: 'column1', x: 'column1', y: 'column1' },
        });
        t.truthy(axes.x, 'axis.x is undefined');
        t.truthy(axes.y, 'axis.y is undefined');
        t.is(
            axes.size,
            false,
            "axis.size user preference retained even though there aren't enough columns"
        );
    });
});

// some utility methods for constructing datasets below
function textColumn(name) {
    return column(
        name,
        [
            'Alfa',
            'Bravo',
            'Charlie',
            'Delta',
            'Echo',
            'Foxtrot',
            'Golf',
            'Hotel',
            'India',
            'Juliett',
        ],
        'text'
    );
}

function numberColumn(name) {
    return column(name, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'number');
}

function dateColumn(name) {
    return column(
        name,
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `2021/${i}/01`),
        'date'
    );
}
