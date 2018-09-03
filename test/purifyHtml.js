/* globals describe, it */
var assert = require('assert');

import purifyHtml from '../src/shared/purifyHtml.js';

describe('purifyHtml', () => {
    describe('default behavior', () => {

        it('return same string if no tags present', () => {
            assert.equal(purifyHtml('Hello world'), 'Hello world');
        });

        it('should remove some tags, but keep others', () => {
            assert.equal(purifyHtml('<h1><b>Hello</b> World</h1>'), '<b>Hello</b> World');
        });

        it('should not crash if input is not a string', () => {
            assert.doesNotThrow(() => purifyHtml(null));
            assert.doesNotThrow(() => purifyHtml(undefined));
            assert.doesNotThrow(() => purifyHtml(42));
            assert.doesNotThrow(() => purifyHtml({foo:'bar'}));
        });

        it('should return the input value if not a string', () => {
            assert.equal(purifyHtml(null), null);
            assert.equal(purifyHtml(undefined), undefined);
            assert.equal(purifyHtml(42), 42);
            const obj = {foo:'bar'};
            assert.equal(purifyHtml(obj), obj);
        });

    });
});
