import test from 'ava';
import numeral from 'numeral';
import formatNumber from './formatNumber';
import { formatNumberSplitParts } from './formatNumberSplitParts';

test('simple number', t => {
    t.is(formatNumber(numeral, 1234.5678), '1234.57');
    t.is(formatNumber(numeral, 0), '0');
});

test('negative number', t => {
    t.is(formatNumber(numeral, -1234.5678), '−1234.57');
});

test('negative number, forced plus sign', t => {
    t.is(formatNumber(numeral, -1234.5678, { format: '+0.00' }), '−1234.57');
});

test('negative number, custom minus character', t => {
    t.is(formatNumber(numeral, -1234.5678, { minusChar: '&minus;' }), '&minus;1234.57');
});

test('custom ± character', t => {
    t.is(formatNumber(numeral, 0, { plusMinusChar: '+/-', format: '+0.00' }), '+/-0.00');
});

test('empty string ± character', t => {
    t.is(formatNumber(numeral, 0, { plusMinusChar: '', format: '+0.00' }), '0.00');
});

test('prepend/append', t => {
    t.is(formatNumber(numeral, 1234.5678, { prepend: '[ ', append: ' ]' }), '[ 1234.57 ]');
});

test('number format', t => {
    t.is(formatNumber(numeral, 1234.5678, { format: '0,.0' }), '1,234.6');
});

test('forced plus sign and zero', t => {
    t.is(formatNumber(numeral, 1, { format: '+0' }), '+1');
    t.is(formatNumber(numeral, 0, { format: '+0' }), '±0');
    t.is(formatNumber(numeral, -1, { format: '+0' }), '−1');
    t.is(formatNumber(numeral, 0, { format: '+0', prepend: '$' }), '±$0');
});

test('minus sign and prepend currencies', t => {
    t.is(formatNumber(numeral, -1234.5678, { prepend: '$' }), '−$1234.57');
    t.is(formatNumber(numeral, -1234.5678, { prepend: '$ ' }), '−$ 1234.57');
    t.is(formatNumber(numeral, -1234.5678, { prepend: 'USD ' }), '−USD 1234.57');
    t.is(formatNumber(numeral, -1234.5678, { prepend: 'Cad ' }), '−Cad 1234.57');
});

test('forced plus sign and prepend currencies', t => {
    t.is(formatNumber(numeral, 1234.5678, { format: '+0.00', prepend: '$' }), '+$1234.57');
    t.is(formatNumber(numeral, 1234.5678, { format: '+0.00', prepend: '$ ' }), '+$ 1234.57');
    t.is(formatNumber(numeral, 1234.5678, { format: '+0.00', prepend: 'USD ' }), '+USD 1234.57');
    t.is(formatNumber(numeral, -1234.5678, { format: '+0.00', prepend: 'USD ' }), '−USD 1234.57');
});

test('percentages are not multiplied with 100', t => {
    t.is(formatNumber(numeral, 70, { format: '0%' }), '70%');
});

test('allow multiplying numbers', t => {
    t.is(formatNumber(numeral, 70000, { multiply: 0.001 }), '70');
});

test('special thousands format', t => {
    t.is(formatNumber(numeral, 7000, { multiply: 10, format: '0;0' }), '70,000');
    t.is(formatNumber(numeral, 7000, { format: '0;0' }), '7000');
    t.is(formatNumber(numeral, 70000, { format: '0;0%' }), '70,000%');
    t.is(formatNumber(numeral, -70000.5, { format: '0;0' }), '−70,001');
    t.is(formatNumber(numeral, 70000.34, { format: '0;0.[0]%' }), '70,000.3%');
    t.is(formatNumber(numeral, 0, { format: '0;0' }), '0');
    t.is(formatNumber(numeral, 5, { format: '0;0' }), '5');
});

test('isolated prefix: simple number', t => {
    t.deepEqual(formatNumberSplitParts(numeral, 1234.5678), { prefix: '', number: '1234.57' });
    t.deepEqual(formatNumberSplitParts(numeral, 0), { prefix: '', number: '0' });
});

test('isolated prefix: negative number', t => {
    t.deepEqual(formatNumberSplitParts(numeral, -1234.5678), { prefix: '−', number: '1234.57' });
});

test('isolated prefix: forced plus sign', t => {
    t.deepEqual(formatNumberSplitParts(numeral, -1234.5678, { format: '+0.00' }), {
        prefix: '−',
        number: '1234.57',
    });
    t.deepEqual(formatNumberSplitParts(numeral, 1234.5678, { format: '+0.00' }), {
        prefix: '+',
        number: '1234.57',
    });
});

test('isolated prefix: negative number, custom minus character', t => {
    t.deepEqual(formatNumberSplitParts(numeral, -1234.5678, { minusChar: '&minus;' }), {
        prefix: '&minus;',
        number: '1234.57',
    });
});

test('isolated prefix: custom ± character', t => {
    t.deepEqual(formatNumberSplitParts(numeral, 0, { plusMinusChar: '+/-', format: '+0.00' }), {
        prefix: '+/-',
        number: '0.00',
    });
});

test('isolated prefix: empty string ± character', t => {
    t.deepEqual(formatNumberSplitParts(numeral, 0, { plusMinusChar: '', format: '+0.00' }), {
        prefix: '',
        number: '0.00',
    });
});

test('isolated prefix: prepend/append', t => {
    t.deepEqual(formatNumberSplitParts(numeral, 1234.5678, { prepend: '[ ', append: ' ]' }), {
        prefix: '',
        number: '[ 1234.57 ]',
    });
});

test('isolated prefix: minus sign and prepend currencies', t => {
    t.deepEqual(formatNumberSplitParts(numeral, -1234.5678, { prepend: '$' }), {
        prefix: '−',
        number: '$1234.57',
    });
});

test('absolute format', t => {
    t.is(formatNumber(numeral, 0, { format: '|0.00|' }), '0.00');
    t.is(formatNumber(numeral, -1234.5678, { format: '|0.00|' }), '1234.57');
    t.is(formatNumber(numeral, -1234.5678, { format: '|0.[0]|' }), '1234.6');
    t.is(formatNumber(numeral, -1234.5678, { format: '|+0.00|' }), '+1234.57');
    t.is(formatNumber(numeral, 1234.5678, { format: '|+0.00|' }), '+1234.57');
    t.is(formatNumber(numeral, -1234.5678, { format: '|0.0a|' }), '1.2k');
    t.is(formatNumber(numeral, 1234.5678, { format: '|+0.00|', prepend: '$' }), '+$1234.57');
    t.is(formatNumber(numeral, -1234.5678, { format: '|+0.00|', prepend: '$' }), '+$1234.57');
});
