import anyTest, { TestFn } from 'ava';
import fetch from 'node-fetch';
import httpReq, { HttpReqError } from './httpReq';
import nock from 'nock';
import sinon, { SinonSpy } from 'sinon';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { SimpleFetch } from './httpReqOptions';

const test = anyTest as TestFn<{
    fakeFetch: SinonSpy<Parameters<SimpleFetch>, ReturnType<SimpleFetch>>;
}>;
const baseUrl = 'https://httpbin.org';

test.before(t => {
    t.context.fakeFetch = sinon.spy(fetch as SimpleFetch);
    // We don't care about the incompatibilities between browser fetch and node-fetch here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.fetch = t.context.fakeFetch as any;
    global.dw = {
        backend: {
            __api_domain: 'api.datawrapper.local',
            __messages: {
                core: {
                    'existing-foo': 'My error foo',
                    'existing-bar / existing-one': 'My error detail one',
                    'existing-bar / existing-two': 'My error detail two'
                }
            }
        }
    };
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

test('post request with file in multipart/form-data body', async t => {
    document.cookie = 'crumb=abc';
    const filePath = './test/helpers/test.png';

    const formData = new FormData();
    formData.append('file', createReadStream(filePath), 'test.png');
    formData.append('bla', 'foo');

    // TODO: Figure out the types here
    const body = formData as any;
    const res = await httpReq.post('/anything', {
        baseUrl,
        body,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    t.true(res.headers['Content-Type'].startsWith('multipart/form-data;boundary='));
});

test('no content in 204 requests', async t => {
    const res = await httpReq.get('/status/204', {
        baseUrl
    });

    t.is(res.headers.get('content-length'), null);
});

test('throws HttpReqError', async t => {
    nock('http://api.datawrapper.mock').get('/404').reply(404, { foo: 'bar' });
    try {
        await httpReq.get('/404', { baseUrl: 'http://api.datawrapper.mock' });
    } catch (err) {
        t.true(err instanceof HttpReqError);
        if (!(err instanceof HttpReqError)) throw err;
        t.is(err.name, 'HttpReqError');
        t.is(err.status, 404);
        t.is(err.statusText, 'Not Found');
        t.is(err.type, undefined);
        t.is(err.details, undefined);
        t.deepEqual(await err.response.json(), { foo: 'bar' });
    }
});

test('throws HttpReqError with translation key if response contains type and its translation exists', async t => {
    nock('http://api.datawrapper.mock').get('/404-with-type').reply(404, { type: 'existing-foo' });
    try {
        await httpReq.get('/404-with-type', { baseUrl: 'http://api.datawrapper.mock' });
    } catch (err) {
        t.true(err instanceof HttpReqError);
        if (!(err instanceof HttpReqError)) throw err;
        t.is(err.translationKey, 'existing-foo');
        t.is(err.details, undefined);
    }
});

test('throws HttpReqError with undefined translation key if response contains type but its translation does not exit', async t => {
    nock('http://api.datawrapper.mock').get('/404-with-unknown-type').reply(404, { type: 'foo' });
    try {
        await httpReq.get('/404-with-unknown-type', { baseUrl: 'http://api.datawrapper.mock' });
    } catch (err) {
        t.true(err instanceof HttpReqError);
        if (!(err instanceof HttpReqError)) throw err;
        t.is(err.translationKey, undefined);
        t.is(err.details, undefined);
    }
});

test('throws HttpReqError with details with translation keys for response details whose translations exist', async t => {
    nock('http://api.datawrapper.mock')
        .get('/404-with-details')
        .reply(404, {
            type: 'existing-bar',
            details: [
                { type: 'existing-one', path: 'path-one' },
                { type: 'existing-two' }, // Missing path is ok.
                { type: 'unknown', path: 'path-three' },
                { spam: 'missing-type' },
                'not an object',
                null
            ]
        });
    try {
        await httpReq.get('/404-with-details', { baseUrl: 'http://api.datawrapper.mock' });
    } catch (err) {
        t.true(err instanceof HttpReqError);
        if (!(err instanceof HttpReqError)) throw err;
        t.is(err.translationKey, undefined);
        t.deepEqual(err.details, [
            {
                type: 'existing-one',
                path: 'path-one',
                translationKey: 'existing-bar / existing-one'
            },
            { type: 'existing-two', translationKey: 'existing-bar / existing-two' },
            { type: 'unknown', path: 'path-three' },
            { spam: 'missing-type' },
            'not an object',
            null
        ]);
    }
});

test('throws HttpReqError with details with undefined translation keys for invalid response details', async t => {
    nock('http://api.datawrapper.mock')
        .get('/404-with-invalid-details')
        .reply(404, {
            type: 'bar',
            details: [{ spam: 'invalid' }, 'not an object', null]
        });
    try {
        await httpReq.get('/404-with-invalid-details', { baseUrl: 'http://api.datawrapper.mock' });
    } catch (err) {
        t.true(err instanceof HttpReqError);
        if (!(err instanceof HttpReqError)) throw err;
        t.is(err.translationKey, undefined);
        t.deepEqual(err.details, [{ spam: 'invalid' }, 'not an object', null]);
    }
});

test('throws HttpReqError with details with undefined translation keys if there is no top-level type', async t => {
    nock('http://api.datawrapper.mock')
        .get('/404-with-details-without-type')
        .reply(404, {
            details: [{ type: 'existing-one', path: 'path-one' }]
        });
    try {
        await httpReq.get('/404-with-details-without-type', {
            baseUrl: 'http://api.datawrapper.mock'
        });
    } catch (err) {
        t.true(err instanceof HttpReqError);
        if (!(err instanceof HttpReqError)) throw err;
        t.is(err.translationKey, undefined);
        t.deepEqual(err.details, [{ type: 'existing-one', path: 'path-one' }]);
    }
});

test('sends CSRF header with an "unsafe" HTTP method', async t => {
    document.cookie = 'crumb=abc';
    const promise = httpReq.put('/put', { baseUrl });
    t.is(t.context.fakeFetch.lastCall.args[1]?.headers?.['X-CSRF-Token'], 'abc');
    return promise;
});

test('doesn\'t send CSRF header with a "safe" HTTP method', async t => {
    document.cookie = 'crumb=abc';
    const promise = httpReq.get('/get', { baseUrl });
    t.falsy(t.context.fakeFetch.lastCall.args[1]?.headers?.['X-CSRF-Token']);
    return promise;
});
