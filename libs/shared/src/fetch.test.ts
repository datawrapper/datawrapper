import test from 'ava';
import sinon from 'sinon';

import { fetchJSON, getJSON, patchJSON, postJSON, putJSON, deleteJSON } from './fetch';

const POSITIVE_RESPONSE = {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    ok: true,
    text: () => '{"id": 42, "email": "ozzy@example.com", "name": "Ozzy"}'
};

const NEGATIVE_RESPONSE = {
    status: 404,
    ok: false,
    statusText: 'Not Found'
};

const createFakeFetch = <TResponse>(response: TResponse) => {
    const fakeFetch = sinon.fake.resolves<Parameters<typeof window.fetch>, Promise<TResponse>>(
        response
    );
    // We don't care about the incompatibilities between browser fetch and node-fetch here,
    // or about incompatibilities between mock responses and actual responses.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.fetch = fakeFetch as any;
    return fakeFetch;
};

test('Call `window.fetch` with given url, HTTP method, credentials, and body)', t => {
    const fakeFetch = createFakeFetch(POSITIVE_RESPONSE);
    fetchJSON('/some/url', 'GET', 'omit', '{ "foo": "bar" }');
    t.is(fakeFetch.firstCall.args[0], '/some/url');
    t.is(fakeFetch.firstCall.args[1]?.method, 'GET');
    t.is(fakeFetch.firstCall.args[1]?.body, '{ "foo": "bar" }');
    t.is(fakeFetch.firstCall.args[1]?.credentials, 'omit');
});

test('Pass response JSON through a callback upon positive response', async t => {
    createFakeFetch(POSITIVE_RESPONSE);
    const callback = sinon.spy();
    await fetchJSON('/some/url', 'GET', 'omit', '{ "foo": "bar" }', callback);
    t.true(callback.calledWith({ id: 42, name: 'Ozzy', email: 'ozzy@example.com' }));
});

test('Ignore the callback upon negative response', async t => {
    createFakeFetch(NEGATIVE_RESPONSE);
    const callback = sinon.spy();
    await fetchJSON('/some/url', 'GET', 'omit', null, callback);
    t.is(callback.callCount, 0);
});

test('Return a promise that resolves when request succeeds', async t => {
    createFakeFetch(POSITIVE_RESPONSE);
    const result = await fetchJSON('/some/url', 'GET', 'omit', '{ "foo": "bar" }');
    t.deepEqual(result, { id: 42, name: 'Ozzy', email: 'ozzy@example.com' });
});

test('Call `window.fetch` with `PATCH` and the given request body', async t => {
    const fakeFetch = createFakeFetch(POSITIVE_RESPONSE);
    await patchJSON('/some/url', '{ "foo": "bar" }');
    t.is(fakeFetch.firstCall.args[0], '/some/url');
    t.is(fakeFetch.firstCall.args[1]?.method, 'PATCH');
    t.is(fakeFetch.firstCall.args[1]?.body, '{ "foo": "bar" }');
});

test('Call `window.fetch` with `POST` and the given request body', t => {
    const fakeFetch = createFakeFetch(POSITIVE_RESPONSE);
    postJSON('/some/url', '{ "foo": "bar" }');
    t.is(fakeFetch.firstCall.args[0], '/some/url');
    t.is(fakeFetch.firstCall.args[1]?.method, 'POST');
    t.is(fakeFetch.firstCall.args[1]?.body, '{ "foo": "bar" }');
});

test('Call `window.fetch` with `PUT` and the given request body', t => {
    const fakeFetch = createFakeFetch(POSITIVE_RESPONSE);
    putJSON('/some/url', '{ "foo": "bar" }');
    t.is(fakeFetch.firstCall.args[0], '/some/url');
    t.is(fakeFetch.firstCall.args[1]?.method, 'PUT');
    t.is(fakeFetch.firstCall.args[1]?.body, '{ "foo": "bar" }');
});

test('Call `window.fetch` with `GET`', t => {
    const fakeFetch = createFakeFetch(POSITIVE_RESPONSE);
    getJSON('/some/url');
    t.is(fakeFetch.firstCall.args[0], '/some/url');
    t.is(fakeFetch.firstCall.args[1]?.method, 'GET');
});

test('Call `window.fetch` with `DELETE`', t => {
    const fakeFetch = createFakeFetch(POSITIVE_RESPONSE);
    deleteJSON('/some/url');
    t.is(fakeFetch.firstCall.args[0], '/some/url');
    t.is(fakeFetch.firstCall.args[1]?.method, 'DELETE');
});
