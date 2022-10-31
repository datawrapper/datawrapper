import test from 'ava';
import { testProp, fc } from 'ava-fast-check';
import { isAllowedSourceUrl, isValidUrl } from './validation';

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
                withFragments: true
            })
        )
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
                withFragments: true
            })
        )
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
            withFragments: true
        })
    ],
    (t, url) => {
        t.false(isValidUrl(url));
    }
);
