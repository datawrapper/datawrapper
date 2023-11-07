import test from 'ava';
import fetch, { Response } from 'node-fetch';
import sinon from 'sinon';

import httpReq from './httpReq';
import { SimpleFetch, SimpleFetchOptions } from './httpReqOptions';

const baseUrl = 'http://api.datawrapper.mock';

test.before(() => {
    // We don't care about the incompatibilities between browser fetch and node-fetch here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.fetch = sinon.spy(fetch) as any;
    global.dw = { backend: { __api_domain: 'api.datawrapper.local' } };
});

/**
 * This test is in a separate file because it manipulates the global document.cookie.
 */
test('calls /v3/me when CSRF cookie is not set', async t => {
    document.cookie = '';
    let wasGETCalled = false;
    let lastFetchOpts = undefined as SimpleFetchOptions | undefined;
    await httpReq.put('/put', {
        baseUrl,
        fetch: (url: string, opts: SimpleFetchOptions) => {
            if (url === baseUrl + '/v3/me') {
                wasGETCalled = true;
                document.cookie = 'crumb=abc';
                return Promise.resolve(new Response());
            }
            lastFetchOpts = opts;
            return Promise.resolve(new Response());
        }
    } as unknown as {
        // TODO Fix the SimpleFetch type and then remove this casting.
        baseUrl: string;
        fetch: SimpleFetch;
    });
    t.true(wasGETCalled);
    t.is(lastFetchOpts?.headers?.['X-CSRF-Token'], 'abc');
});
