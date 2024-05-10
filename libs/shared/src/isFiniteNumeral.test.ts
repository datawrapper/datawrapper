import test from 'ava';
import isFiniteNumeral from './isFiniteNumeral';

// tests taken from underscore's implementation
// @see https://github.com/jashkenas/underscore/blob/1abc36c169947c54c97e266513b1d763d0198f46/test/objects.js#L865C3-L884C6
test('isFiniteNumeral', t => {
    t.false(isFiniteNumeral(void 0), 'undefined is not finite');
    t.false(isFiniteNumeral(null), 'null is not finite');
    t.false(isFiniteNumeral(NaN), 'NaN is not finite');
    t.false(isFiniteNumeral(Infinity), 'Infinity is not finite');
    t.false(isFiniteNumeral(-Infinity), '-Infinity is not finite');
    t.false(isFiniteNumeral('1a'), 'Non numeric strings are not numbers');
    t.false(isFiniteNumeral(''), 'Empty strings are not numbers');
    t.true(isFiniteNumeral('12'), 'Numeric strings are numbers');
    const obj = new Number(5);
    t.true(isFiniteNumeral(obj), 'Number instances can be finite');
    t.true(isFiniteNumeral(0), '0 is finite');
    t.true(isFiniteNumeral(123), 'Ints are finite');
    t.true(isFiniteNumeral(-12.44), 'Floats are finite');
    if (typeof Symbol === 'function') {
        t.false(isFiniteNumeral(Symbol()), 'symbols are not numbers');
        t.false(isFiniteNumeral(Symbol('description')), 'described symbols are not numbers');
        t.false(isFiniteNumeral(Object(Symbol())), 'boxed symbols are not numbers');
    }
});
