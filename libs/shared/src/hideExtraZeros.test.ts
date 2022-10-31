import test from 'ava';

import { forceOptionalDecimals, hideExtraZeros } from './hideExtraZeros';

test('forceOptionalDecimals', async t => {
    t.is(forceOptionalDecimals('$1,000.[0]'), '$1,000.0');

    t.is(forceOptionalDecimals('0%'), '0%');

    t.is(forceOptionalDecimals('0.[00]%'), '0.[00]%');

    t.is(forceOptionalDecimals('0.0'), '0.0');

    t.is(forceOptionalDecimals(' 0.0 '), '0.0');
});

test('hideExtraZeros', async t => {
    t.is(
        hideExtraZeros('$723.0', '$1,000.[0]'),
        `$723<span class="decimals" aria-hidden="true">.0</span>`
    );

    t.is(hideExtraZeros('$5,710.2', '$1,000.[0]'), `$5,710.2`);

    t.is(
        hideExtraZeros('$34.0', '$1,000.[0]'),
        `$34<span class="decimals" aria-hidden="true">.0</span>`
    );

    // if suffix, don't bother trying to align
    t.is(hideExtraZeros('723.00%', '0.[00]%'), `723.00%`);

    t.is(
        hideExtraZeros(' $723.0 ', ' $1,000.[0] '),
        `$723<span class="decimals" aria-hidden="true">.0</span>`
    );
});
