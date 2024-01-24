/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import assignWithEmptyObjects from './assignWithEmptyObjects';
import test from 'ava';

/**
 * test suite copied and adapted from (https://github.com/jonschlinkert/assign-deep/)
 */

test('should deeply assign properties of additional objects to the first object', t => {
    const one = { b: { c: { d: 'e' } } };
    const two = { b: { c: { f: 'g', j: 'i' } } };
    t.deepEqual(assignWithEmptyObjects(one, two), { b: { c: { d: 'e', f: 'g', j: 'i' } } });
});

test('should not assign values in arrays (same as Object.assign)', t => {
    const abc = ['a', 'b'];
    const xyz = ['c', 'd'];
    t.is(assignWithEmptyObjects(abc, xyz), abc);
    t.is(Object.assign(abc, xyz), abc);

    const obj = { b: [{ a: { a: 0 } as Record<string, number> }] };
    const one = assignWithEmptyObjects({}, obj);
    const two = assignWithEmptyObjects({}, obj);

    t.true(one !== obj);
    t.true(two !== obj);
    t.true(one !== two);
    t.true(one.b === two.b);
    one.b[0].a = { b: 0 };
    two.b[0].a = { c: 0 };
    t.deepEqual(one.b[0].a, { c: 0 });
});

test('should extend properties onto a function', t => {
    function target() {}
    const one = { b: { c: { d: 'e' } } };
    const two = { b: { c: { f: 'g', j: 'i' } } };
    assignWithEmptyObjects(target, one, two);
    t.deepEqual((target as any).b, { c: { d: 'e', f: 'g', j: 'i' } });
});

test('should extend ignore primitives', t => {
    function target() {}
    const one = { b: { c: { d: 'e' } } };
    const two = { b: { c: { f: 'g', j: 'i' } } };
    assignWithEmptyObjects('foo', target, one, two);
    t.deepEqual((target as any).b, { c: { d: 'e', f: 'g', j: 'i' } });
});

test('should extend deeply nested functions', t => {
    const fn = function () {};
    const target = {};
    const one = { b: { c: { d: fn } } };
    const two = { b: { c: { f: 'g', j: 'i' } } };
    assignWithEmptyObjects(target, one, two);
    t.deepEqual((target as any).b, { c: { d: fn, f: 'g', j: 'i' } });
});

test('should extend deeply nested functions with properties', t => {
    const fn = function () {};
    fn.foo = 'foo';
    fn.bar = 'bar';

    const target = {};
    const one = { b: { c: { d: fn } } };
    const two = { b: { c: { f: 'g', j: 'i' } } };
    assignWithEmptyObjects(target, one, two);
    t.deepEqual((target as any).b, { c: { d: fn, f: 'g', j: 'i' } });
});

test('should invoke getters and setters', t => {
    let name: string, username: string;
    const config = {
        set name(val) {
            name = val;
        },
        get name() {
            return name;
        },
        set username(val) {
            username = val;
        },
        get username() {
            return username || 'Walter';
        },
        get other() {
            return 'other';
        }
    };
    const locals = {
        get name() {
            return 'Brian';
        },
        get username() {
            return 'doowb';
        }
    };
    const result = assignWithEmptyObjects(config, locals);
    t.true(result === config);
    t.is(result.name, 'Brian');
    t.is(result.username, 'doowb');
    t.is(result.other, 'other');
});

test('should extend functions with nested properties', t => {
    const aaa = () => {};
    aaa.foo = { y: 'y' };
    aaa.bar = { z: 'z' };

    const bbb = () => {};
    bbb.foo = { w: 'w' };
    bbb.bar = { x: 'x' };

    const result = assignWithEmptyObjects(aaa, bbb);
    t.true(aaa === result);

    t.deepEqual(result.foo, { y: 'y', w: 'w' });
    t.deepEqual(result.bar, { z: 'z', x: 'x' });
});

test('should extend properties from functions to functions', t => {
    function target() {}
    function one() {}
    function two() {}
    one.b = { c: { d: 'e' } };
    two.b = { c: { f: 'g', j: 'i' } };
    assignWithEmptyObjects(target, one, two);
    t.deepEqual((target as any).b, { c: { d: 'e', f: 'g', j: 'i' } });
});

test('should update a value when a duplicate is assigned', t => {
    const one = { b: { c: { d: 'e' } } };
    const two = { b: { c: { d: 'f' } } };
    t.deepEqual(assignWithEmptyObjects(one, two), { b: { c: { d: 'f' } } });
});

test('should not loop over arrays', t => {
    const one = { b: { c: { d: 'e', g: ['b'] } } };
    const two = { b: { c: { d: 'f', g: ['a'] } } };
    t.deepEqual(assignWithEmptyObjects(one, two), { b: { c: { d: 'f', g: ['a'] } } });
});

test('should deeply assign values from multiple objects', t => {
    const foo = {};
    const bar = { a: 'b' };
    const baz = { c: 'd', g: { h: 'i' } };
    const quux = { e: 'f', g: { j: 'k' } };

    assignWithEmptyObjects(foo, bar, baz, quux);
    t.deepEqual(foo, { a: 'b', c: 'd', e: 'f', g: { h: 'i', j: 'k' } });
});

test('should not assign primitive arguments', t => {
    const one = { b: { c: { d: 'e', g: ['b'] } } };
    const two = 5;
    t.deepEqual(assignWithEmptyObjects(one, two), one);
});

test('should assign primitive values', t => {
    const one = { b: { c: { d: 'e', g: ['b'] } } };
    const two = { b: 5 };
    t.deepEqual(assignWithEmptyObjects(one, two), { b: 5 });
});

test('should assign over primitive values', t => {
    const one = { b: { c: { d: 'e', g: ['b'] } } };
    const two = { b: 5 };
    const three = { b: function () {} };
    (three.b as any).foo = 'bar';
    t.deepEqual(assignWithEmptyObjects(one, two, three), three);
});

test('should assign null values', t => {
    const one = { b: { c: { d: 'e', g: ['b'] } } };
    const two = { b: null, c: null };
    t.deepEqual(assignWithEmptyObjects(one, two), { b: null, c: null });
});

test('should delete undefined values', t => {
    const one = { b: { c: { d: 'e', g: ['b'] } } };
    const two = { b: undefined };
    t.deepEqual(assignWithEmptyObjects(one, two), {});
});

test('should delete undefined nested values', t => {
    const one = { b: { c: { d: 'e', g: ['b'] } } };
    const two = { b: { c: { d: undefined } } };
    t.deepEqual(assignWithEmptyObjects(one, two), { b: { c: { g: ['b'] } } });
});

test('should apply empty objects', t => {
    const one = { b: { c: { d: 'e', g: ['b'] } } };
    const two = { b: { c: {} } };
    t.deepEqual(assignWithEmptyObjects(one, two), { b: { c: {} } });
});

test('should assign properties to a function', t => {
    function one() {}
    one.a = 'b';
    one.c = 'd';

    const two = { e: 'f', g: ['h'] };
    assignWithEmptyObjects(one, two);
    t.deepEqual((one as any).g, ['h']);
    t.is((one as any).g, two.g);
    t.is(typeof one, 'function');
});

test('should assign properties from a function', t => {
    function one() {}
    one.a = 'b';
    one.c = 'd';

    const two = { e: 'f', g: ['h'] };
    assignWithEmptyObjects(two, one);
    t.deepEqual(two.g, ['h']);
    t.is(two.g, two.g);
    t.is(typeof two, 'object');
});

test('should deeply mix the properties of object into the first object.', t => {
    const a = assignWithEmptyObjects({ a: { aa: 'aa' } }, { a: { bb: 'bb' } }, { a: { cc: 'cc' } });
    t.deepEqual(a, { a: { aa: 'aa', bb: 'bb', cc: 'cc' } });

    const b = assignWithEmptyObjects(
        { a: { aa: 'aa', dd: { ee: 'ff' } } },
        { a: { bb: 'bb', dd: { gg: 'hh' } } },
        { a: { cc: 'cc', dd: { ii: 'jj' } } }
    );
    t.deepEqual(b, {
        a: { aa: 'aa', dd: { ee: 'ff', gg: 'hh', ii: 'jj' }, bb: 'bb', cc: 'cc' }
    });
});

test('should merge object properties without affecting any object', t => {
    const obj1 = { a: 0, b: 1 };
    const obj2 = { c: 2, d: 3 };
    const obj3 = { a: 4, d: 5 };

    const actual = { a: 4, b: 1, c: 2, d: 5 };

    t.deepEqual(assignWithEmptyObjects({}, obj1, obj2, obj3), actual);
    t.notDeepEqual(actual, obj1);
    t.notDeepEqual(actual, obj2);
    t.notDeepEqual(actual, obj3);
});

test('should do a deep merge', t => {
    const obj1 = { a: { b: 1, c: 1, d: { e: 1, f: 1 } } };
    const obj2 = { a: { b: 2, d: { f: 'f' } } };

    t.deepEqual(assignWithEmptyObjects(obj1, obj2), { a: { b: 2, c: 1, d: { e: 1, f: 'f' } } });
});

test('should use the last value defined', t => {
    const obj1 = { a: 'b' };
    const obj2 = { a: 'c' };

    t.deepEqual(assignWithEmptyObjects(obj1, obj2), { a: 'c' });
});

test('should use the last value defined on nested object', t => {
    const obj1 = { a: 'b', c: { d: 'e' } };
    const obj2 = { a: 'c', c: { d: 'f' } };

    t.deepEqual(assignWithEmptyObjects(obj1, obj2), { a: 'c', c: { d: 'f' } });
});

test('should shallow clone when an empty object is passed', t => {
    const obj1 = { a: 'b', c: { d: 'e' } };
    const obj2 = { a: 'c', c: { d: 'f' } };

    const res = assignWithEmptyObjects({}, obj1, obj2);
    t.deepEqual(res, { a: 'c', c: { d: 'f' } });
});

test('should merge additional objects into the first', t => {
    const obj1 = { a: { b: 1, c: 1, d: { e: 1, f: 1 } } };
    const obj2 = { a: { b: 2, d: { f: 'f' } } };

    assignWithEmptyObjects(obj1, obj2);
    t.deepEqual(obj1, { a: { b: 2, c: 1, d: { e: 1, f: 'f' } } });
});

test('should clone objects during merge', t => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };

    const target = assignWithEmptyObjects({}, obj1, obj2);
    t.deepEqual(target, { a: { b: 1, c: 2 } });
    t.deepEqual(target.a, { b: 1, c: 2 });
});

test('should deep clone arrays during merge', t => {
    const obj1 = { a: [1, 2, [3, 4]] };
    const obj2 = { b: [5, 6] };

    const actual = assignWithEmptyObjects(obj1, obj2);
    t.deepEqual(actual.a, [1, 2, [3, 4]]);
    t.deepEqual(actual.a[2], [3, 4]);
    t.deepEqual(actual.b, obj2.b);
});

test('should copy source properties', t => {
    t.is(assignWithEmptyObjects({ test: true }).test, true);
});

test('should not deep clone arrays', t => {
    t.deepEqual(assignWithEmptyObjects([1, 2, 3]), [1, 2, 3]);
    t.deepEqual(assignWithEmptyObjects([1, 2, 3], {}), [1, 2, 3]);
});

test('should iterate over sparse arguments', t => {
    const actual = assignWithEmptyObjects({}, undefined, { a: 'b' }, undefined, { c: 'd' });
    t.deepEqual(actual, { a: 'b', c: 'd' });
});

test('should clone RegExps', t => {
    const fixture = /test/g;
    const actual = assignWithEmptyObjects(fixture);
    t.deepEqual(actual, fixture);
});

test('should clone Dates', t => {
    const fixture = new Date();
    const actual = assignWithEmptyObjects(fixture);
    t.deepEqual(actual, fixture);
});

test('should not clone objects created with custom constructor', t => {
    class TestType {}
    const fixture = new TestType();
    const actual = assignWithEmptyObjects(fixture);
    t.deepEqual(actual, fixture);
});

test('should return the first object when one argument is passed', t => {
    t.deepEqual(assignWithEmptyObjects({ a: 'b' }), { a: 'b' });
});

test('should update properties of array items containing IDs', t => {
    const target = {
        list: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' }
        ]
    };
    const source = {
        list: [{ id: 1, name: 'New name' }, { id: 2 }]
    };
    t.deepEqual(assignWithEmptyObjects(target, source), {
        list: [
            { id: 1, name: 'New name' },
            { id: 2, name: 'B' }
        ]
    });
});

test('should delete properties of array items containing IDs', t => {
    const target = {
        list: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' }
        ]
    };
    const source = {
        list: [{ id: 1, name: undefined }, { id: 2 }]
    };
    t.deepEqual(assignWithEmptyObjects(target, source), {
        list: [{ id: 1 }, { id: 2, name: 'B' }]
    });
});

test('should update the order of array items containing IDs', t => {
    const target = {
        list: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' }
        ]
    };
    const source = {
        list: [{ id: 2 }, { id: 1 }]
    };
    t.deepEqual(assignWithEmptyObjects(target, source), {
        list: [
            { id: 2, name: 'B' },
            { id: 1, name: 'A' }
        ]
    });
});

test('should add new items to the end of the array', t => {
    const target = {
        list: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' }
        ]
    };
    const source = {
        list: [{ id: 1 }, { id: 2 }, { id: 3, name: 'C' }]
    };
    t.deepEqual(assignWithEmptyObjects(target, source), {
        list: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
            { id: 3, name: 'C' }
        ]
    });
});

test('should remove items from the end of the array', t => {
    const target = {
        list: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
            { id: 3, name: 'C' }
        ]
    };
    const source = {
        list: [{ id: 1 }, { id: 2 }]
    };
    t.deepEqual(assignWithEmptyObjects(target, source), {
        list: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' }
        ]
    });
});
