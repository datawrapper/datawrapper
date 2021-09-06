import test from 'ava';
import fetch from 'node-fetch';
import httpReq from './httpReq.js';
import sinon from 'sinon';

const baseUrl = 'https://httpbin.org';

test.before(() => {
    window.fetch = sinon.spy(fetch);
    global.dw = { backend: { __api_domain: 'api.datawrapper.local' } };
});

/**
 * This test is in a separate file because it manipulates the global document.cookie.
 */
test('calls /v3/me when CSRF cookie is not set', async t => {
    document.cookie = '';
    let wasGETCalled = false;
    let lastFetchOpts;
    await httpReq.put('/put', {
        baseUrl,
        fetch: (url, opts) => {
            if (url === baseUrl + '/v3/me') {
                wasGETCalled = true;
                document.cookie = 'crumb=abc';
                return Promise.resolve(new fetch.Response());
            }
            lastFetchOpts = opts;
            return window.fetch(url, opts);
        }
    });
    t.true(wasGETCalled);
    t.is(lastFetchOpts.headers['X-CSRF-Token'], 'abc');
});
