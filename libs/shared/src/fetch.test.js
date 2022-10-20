import test from 'ava';
import sinon from 'sinon';

import { fetchJSON, getJSON, patchJSON, postJSON, putJSON, deleteJSON } from './fetch.js';

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

test('Call `window.fetch` with given url, HTTP method, credentials, and body)', t => {
    window.fetch = sinon.fake.resolves(POSITIVE_RESPONSE);
    fetchJSON('/some/url', 'GET', 'omit', '{ "foo": "bar" }');
    t.is(window.fetch.firstCall.args[0], '/some/url');
    t.is(window.fetch.firstCall.args[1].method, 'GET');
    t.is(window.fetch.firstCall.args[1].body, '{ "foo": "bar" }');
    t.is(window.fetch.firstCall.args[1].credentials, 'omit');
});

test('Pass response JSON through a callback upon positive response', async t => {
    window.fetch = sinon.fake.resolves(POSITIVE_RESPONSE);
    const callback = sinon.spy();
    await fetchJSON('/some/url', 'GET', 'omit', '{ "foo": "bar" }', callback);
    t.true(callback.calledWith({ id: 42, name: 'Ozzy', email: 'ozzy@example.com' }));
});

test('Ignore the callback upon negative response', async t => {
    window.fetch = sinon.fake.resolves(NEGATIVE_RESPONSE);
    const callback = sinon.spy();
    await fetchJSON('/some/url', 'GET', 'omit', null, callback);
    t.is(callback.callCount, 0);
});

test('Return a promise that resolves when request succeeds', async t => {
    window.fetch = sinon.fake.resolves(POSITIVE_RESPONSE);
    const result = await fetchJSON('/some/url', 'GET', 'omit', '{ "foo": "bar" }');
    t.deepEqual(result, { id: 42, name: 'Ozzy', email: 'ozzy@example.com' });
});

test('Call `window.fetch` with `PATCH` and the given request body', t => {
    window.fetch = sinon.fake.resolves(POSITIVE_RESPONSE);
    patchJSON('/some/url', '{ "foo": "bar" }');
    t.is(window.fetch.firstCall.args[0], '/some/url');
    t.is(window.fetch.firstCall.args[1].method, 'PATCH');
    t.is(window.fetch.firstCall.args[1].body, '{ "foo": "bar" }');
});

test('Call `window.fetch` with `POST` and the given request body', t => {
    window.fetch = sinon.fake.resolves(POSITIVE_RESPONSE);
    postJSON('/some/url', '{ "foo": "bar" }');
    t.is(window.fetch.firstCall.args[0], '/some/url');
    t.is(window.fetch.firstCall.args[1].method, 'POST');
    t.is(window.fetch.firstCall.args[1].body, '{ "foo": "bar" }');
});

test('Call `window.fetch` with `PUT` and the given request body', t => {
    window.fetch = sinon.fake.resolves(POSITIVE_RESPONSE);
    putJSON('/some/url', '{ "foo": "bar" }');
    t.is(window.fetch.firstCall.args[0], '/some/url');
    t.is(window.fetch.firstCall.args[1].method, 'PUT');
    t.is(window.fetch.firstCall.args[1].body, '{ "foo": "bar" }');
});

test('Call `window.fetch` with `GET`', t => {
    window.fetch = sinon.fake.resolves(POSITIVE_RESPONSE);
    getJSON('/some/url');
    t.is(window.fetch.firstCall.args[0], '/some/url');
    t.is(window.fetch.firstCall.args[1].method, 'GET');
});

test('Call `window.fetch` with `DELETE`', t => {
    window.fetch = sinon.fake.resolves(POSITIVE_RESPONSE);
    deleteJSON('/some/url');
    t.is(window.fetch.firstCall.args[0], '/some/url');
    t.is(window.fetch.firstCall.args[1].method, 'DELETE');
});
