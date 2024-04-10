import getVersionlessURL from './getVersionlessURL.js';
import test from 'ava';

test('getVersionlessURL removes version from a public URL without path prefix or index.html', t => {
    t.is(
        getVersionlessURL('https://datawrapper-stg.dwcdn.net/AB-_1/10/'),
        'https://datawrapper-stg.dwcdn.net/AB-_1/'
    );
});

test('getVersionlessURL removes version from a public URL with path prefix', t => {
    t.is(
        getVersionlessURL('http://127.0.0.1:9000/dwbucket/charts/AB-_1/1/'),
        'http://127.0.0.1:9000/dwbucket/charts/AB-_1/'
    );
});

test('getVersionlessURL removes version from a public URL with path prefix and index.html', t => {
    t.is(
        getVersionlessURL('http://127.0.0.1:9000/dwbucket/charts/AB-_1/1/index.html'),
        'http://127.0.0.1:9000/dwbucket/charts/AB-_1/index.html'
    );
});

test('getVersionlessURL removes version from a public URL with hash instead of chart id', t => {
    t.is(
        getVersionlessURL('https://datawrapper.dwcdn.net/77cf8dc956c92b80b6a98fea2098c3bc/2/'),
        'https://datawrapper.dwcdn.net/77cf8dc956c92b80b6a98fea2098c3bc/'
    );
});

test('getVersionlessURL removes version from a public URL with path prefix that looks like chart id and version', t => {
    // 'AB-_1/123' should be treated as path prefix and 'CD-_2/345' as chart id and version
    t.is(
        getVersionlessURL('https://datawrapper.dwcdn.net/AB-_1/123/CD-_2/345/'),
        'https://datawrapper.dwcdn.net/AB-_1/123/CD-_2/'
    );
    t.is(
        getVersionlessURL('https://datawrapper.dwcdn.net/AB-_1/123/CD-_2/345/index.html'),
        'https://datawrapper.dwcdn.net/AB-_1/123/CD-_2/index.html'
    );
});

test('getVersionlessURL returns the passed public URL unchanged if its format is not recognized', t => {
    t.is(getVersionlessURL('https://www.example.com/'), 'https://www.example.com/');
    t.is(getVersionlessURL('spam'), 'spam');
});
