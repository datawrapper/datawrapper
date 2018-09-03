/* globals describe, it */
const assert = require('assert');
const column = require('./build/build.js').column;

const test_data = [5.4, 4.2, 4, 3.6, 3.4];

// fmt = col.type(true).formatter({ 'number-format': 'n0' })
//                 formatted = []
//                 for v in col.values()
//                     formatted.push fmt(v)
//                 assert.deeEpqual formatted, ['5', '4', '4', '4', '3']

describe('column', () => {
    describe('basic column api', () => {

        const col = column('my title', test_data);

        it('returns the title', () => {
            assert.equal(col.title(), 'my title');
        });
    });
});
