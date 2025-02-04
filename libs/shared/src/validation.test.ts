import test from 'ava';
import { testProp, fc } from '@fast-check/ava';
import { isAllowedSourceUrl, isValidMySQLJSON, isValidUrl } from './validation';

test('isAllowedSourceUrl', t => {
    t.true(isAllowedSourceUrl('http://www.datawrapper.de'));
    t.true(isAllowedSourceUrl('https://www.datawrapper.de'));
    t.true(isAllowedSourceUrl('HTTPS://WWW.DATAWRAPPER.DE'));
    t.true(isAllowedSourceUrl('ftp://www.datawrapper.de'));
    t.false(isAllowedSourceUrl('ssh://www.datawrapper.de'));
    t.false(isAllowedSourceUrl('javascript:alert()'));
    t.false(isAllowedSourceUrl('foo'));
    t.false(isAllowedSourceUrl(''));
});

testProp(
    'isAllowedSourceUrl: some auto-generated valid urls',
    [
        fc.mixedCase(
            fc.webUrl({
                validSchemes: ['http', 'https', 'ftp'],
                withQueryParameters: true,
                withFragments: true,
            })
        ),
    ],
    (t, url) => {
        t.true(isAllowedSourceUrl(url));
    }
);

test('isValidUrl: some valid urls', t => {
    t.true(isValidUrl('https://www.datawrapper.de'));
    t.true(isValidUrl('http://www.example.com:8800'));
    t.true(isValidUrl('http://user@www.example.com'));
    t.true(isValidUrl('http://user:password@www.example.com'));
    t.true(isValidUrl('http://www.example.com/a/b/c/d/e/f/g/h/i.html'));
    t.true(isValidUrl('http://www.test.com/?pageid=123&testid=1524'));
});

test('isValidUrl: some invalid urls', t => {
    t.false(isValidUrl('htps://www.datawrapper.de'));
    t.false(isValidUrl('www.example.com'));
    t.false(isValidUrl('http:/www.example.com'));
    t.false(isValidUrl('http//www.example.com'));
});

testProp(
    'isValidUrl: some auto-generated valid urls',
    [
        fc.mixedCase(
            fc.webUrl({
                validSchemes: ['http', 'https'],
                withQueryParameters: true,
                withFragments: true,
            })
        ),
    ],
    (t, url) => {
        t.true(isValidUrl(url));
    }
);

testProp(
    'isValidUrl: some auto-generated invalid urls',
    [
        fc.webUrl({
            validSchemes: ['ftp', 'ftps', 'unix', 'file'],
            withQueryParameters: true,
            withFragments: true,
        }),
    ],
    (t, url) => {
        t.false(isValidUrl(url));
    }
);

test('isValidUrl returns true for URL with a query param with brackets', t => {
    t.true(isValidUrl('https://example.com/?filter[type]=2&filter[meldedatum][lte]=2022-12-01'));
});

test('isValidMySQLJSON returns true for a valid JSON', t => {
    t.true(
        isValidMySQLJSON({
            null: null,
            boolean: true,
            number: 1,
            string: 'a',
            object: {
                0: 'number',
                string: 'a',
                nested: {
                    string: 'a',
                },
            },
            arrays: {
                empty: [],
                numbers: [1, 2],
                strings: ['a', 'b'],
                objects: [{ string: 'a' }, { string: 'a' }],
            },
        })
    );
});

test('isValidMySQLJSON returns false for a JSON with too large object key', t => {
    t.false(isValidMySQLJSON({ ['a'.repeat(2 ** 16)]: 'value' }));
    t.false(
        isValidMySQLJSON({
            nested: { ['a'.repeat(2 ** 16)]: 'value' },
        })
    );
    t.false(
        isValidMySQLJSON({
            array: [{ ['a'.repeat(2 ** 16)]: 'value' }],
        })
    );
});

test('isValidMySQLJSON returns false for a JSON with an invalid UTF-16 string', t => {
    // This testing string is invalid UTF-16, because it misses the tail surrogate.
    // See https://mnaoumov.wordpress.com/2014/06/14/stripping-invalid-characters-from-utf-16-strings/
    t.false(isValidMySQLJSON('\ud800b'));
    t.false(
        isValidMySQLJSON({
            nested: '\ud800b',
        })
    );
    t.false(
        isValidMySQLJSON({
            array: ['\ud800b'],
        })
    );
});
