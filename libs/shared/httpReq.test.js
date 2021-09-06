import test from 'ava';
import fetch from 'node-fetch';
import httpReq from './httpReq.js';
import sinon from 'sinon';

const baseUrl = 'https://httpbin.org';

test.before(() => {
    window.fetch = sinon.spy(fetch);
    global.dw = { backend: { __api_domain: 'api.datawrapper.local' } };
});

test('simple get request', async t => {
    let res = await httpReq.get('/get', { baseUrl });
    t.is(res.url, `${baseUrl}/get`);
    // alternative syntax
    res = await httpReq('/get', { baseUrl });
    t.is(res.url, `${baseUrl}/get`);
});

test('simple put request', async t => {
    document.cookie = 'crumb=abc';
    let res = await httpReq.put('/put', { baseUrl });
    t.is(res.url, `${baseUrl}/put`);
    t.is(res.headers['Content-Type'], `application/json`);
    // alternative syntax
    res = await httpReq('/put', { method: 'PUT', baseUrl });
    t.is(res.url, `${baseUrl}/put`);
});

test('simple put request with json payload', async t => {
    document.cookie = 'crumb=abc';
    const payload = { answer: 42 };
    let res = await httpReq.put('/put', { baseUrl, payload });
    t.deepEqual(res.json, payload);
    t.is(res.headers['Content-Type'], `application/json`);
    // alternative syntax
    res = await httpReq('/put', { method: 'PUT', baseUrl, payload });
    t.deepEqual(res.json, payload);
});

test('post request with csv body', async t => {
    document.cookie = 'crumb=abc';
    const body = 'foo, bar\n1, 2';
    // default content-type is application/json
    let res = await httpReq.put('/put', {
        baseUrl,
        body,
        headers: { 'Content-Type': 'text/csv' }
    });
    t.is(res.headers['Content-Type'], `text/csv`);
    t.is(res.data, body);
    t.falsy(res.json);
    // alternative syntax
    res = await httpReq('/put', {
        method: 'PUT',
        baseUrl,
        body,
        headers: { 'Content-Type': 'text/csv' }
    });
    t.is(res.headers['Content-Type'], `text/csv`);
    t.is(res.data, body);
    t.falsy(res.json);
});

test('no content in 204 requests', async t => {
    const res = await httpReq.get('/status/204', {
        baseUrl
    });

    t.is(res.headers.get('content-length'), null);
});

test('throws nice HttpReqError errors', async t => {
    try {
        await httpReq.get('/status/404', {
            baseUrl
        });
    } catch (err) {
        t.is(err.name, 'HttpReqError');
        t.is(err.status, 404);
        t.is(err.statusText, 'NOT FOUND');
        const body = await err.response.text();
        t.is(body, '');
    }
});

test('sends CSRF header with an "unsafe" HTTP method', async t => {
    document.cookie = 'crumb=abc';
    const promise = httpReq.put('/put', { baseUrl });
    t.is(window.fetch.lastCall.args[1].headers['X-CSRF-Token'], 'abc');
    return promise;
});

test('doesn\'t send CSRF header with a "safe" HTTP method', async t => {
    document.cookie = 'crumb=abc';
    const promise = httpReq.get('/get', { baseUrl });
    t.falsy(window.fetch.lastCall.args[1].headers['X-CSRF-Token']);
    return promise;
});
