import test from 'ava';
import isValidUrl from './isValidUrl.js';

test('some valid urls', t => {
    t.true(isValidUrl('https://www.datawrapper.de'));
    t.true(isValidUrl('http://www.example.com:8800'));
    t.true(isValidUrl('http://user@www.example.com'));
    t.true(isValidUrl('http://user:password@www.example.com'));
    t.true(isValidUrl('http://www.example.com/a/b/c/d/e/f/g/h/i.html'));
    t.true(isValidUrl('http://www.test.com/?pageid=123&testid=1524'));
});

test('some invalid urls', t => {
    t.false(isValidUrl('htps://www.datawrapper.de'));
    t.false(isValidUrl('www.example.com'));
    t.false(isValidUrl('http:/www.example.com'));
    t.false(isValidUrl('http//www.example.com'));
    t.false(isValidUrl('http://www.test.com?pageid=123&testid=1524'));
});
