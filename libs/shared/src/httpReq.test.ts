import anyTest, { TestFn } from 'ava';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import type { ClientRequest } from 'http';
import nock from 'nock';
import fetch from 'node-fetch';
import sinon, { SinonSpy } from 'sinon';
import httpReq, { HttpReqError } from './httpReq';
import { SimpleFetch } from './httpReqOptions';

const test = anyTest as TestFn<{
    fakeFetch: SinonSpy<Parameters<SimpleFetch>, ReturnType<SimpleFetch>>;
}>;
const baseUrl = 'http://api.datawrapper.mock';

const getHeader = (request: ClientRequest, name: string) => {
    const value = request.getHeader(name);
    return Array.isArray(value) ? value.join() : value;
};

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

test.afterEach(() => nock.cleanAll());

test.serial('simple get request', async t => {
    nock(baseUrl)
        .get('/get')
        .reply(function (uri, body) {
            return [
                200,
                {
                    url: `${baseUrl}${uri}`
                }
            ];
        })
        .persist();

    let res = await httpReq.get('/get', { baseUrl });
    t.is(res.url, `${baseUrl}/get`);
    // alternative syntax
    res = await httpReq('/get', { baseUrl });
    t.is(res.url, `${baseUrl}/get`);
});

test.serial('simple put request', async t => {
    nock(baseUrl)
        .put('/put')
        .reply(function (uri, body) {
            return [
                200,
                {
                    url: `${baseUrl}${uri}`,
                    headers: {
                        'Content-Type': getHeader(this.req, 'Content-Type')
                    }
                }
            ];
        })
        .persist();

    document.cookie = 'crumb=abc';
    let res = await httpReq.put('/put', { baseUrl });
    t.is(res.url, `${baseUrl}/put`);
    t.is(res.headers['Content-Type'], `application/json`);
    // alternative syntax
    res = await httpReq('/put', { method: 'PUT', baseUrl });
    t.is(res.url, `${baseUrl}/put`);
});

test.serial('simple put request with json payload', async t => {
    nock(baseUrl)
        .put('/put')
        .reply(function (uri, body) {
            return [
                200,
                {
                    headers: {
                        'Content-Type': getHeader(this.req, 'Content-Type')
                    },
                    json: body
                }
            ];
        })
        .persist();

    document.cookie = 'crumb=abc';
    const payload = { answer: 42 };
    let res = await httpReq.put('/put', { baseUrl, payload });
    t.deepEqual(res.json, payload);
    t.is(res.headers['Content-Type'], `application/json`);
    // alternative syntax
    res = await httpReq('/put', { method: 'PUT', baseUrl, payload });
    t.deepEqual(res.json, payload);
});

test.serial('post request with csv body', async t => {
    nock(baseUrl)
        .put('/put')
        .reply(function (uri, body) {
            return [
                200,
                {
                    headers: {
                        'Content-Type': getHeader(this.req, 'Content-Type')
                    },
                    data: body
                }
            ];
        })
        .persist();

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
    // alternative syntax
    res = await httpReq('/put', {
        method: 'PUT',
        baseUrl,
        body,
        headers: { 'Content-Type': 'text/csv' }
    });
    t.is(res.headers['Content-Type'], `text/csv`);
    t.is(res.data, body);
});

test.serial('post request with file in multipart/form-data body', async t => {
    nock(baseUrl)
        .post('/anything')
        .reply(function (uri, body) {
            return [
                200,
                {
                    headers: {
                        'Content-Type': getHeader(this.req, 'Content-Type')
                    }
                }
            ];
        })
        .persist();

    document.cookie = 'crumb=abc';
    const filePath = './test/helpers/test.png';

    const formData = new FormData();
    formData.append('file', createReadStream(filePath), 'test.png');
    formData.append('bla', 'foo');

    // Cast form data to any, because our SimpleFetch type definition currently doesn't work with
    // either DOM FormData or Node FormData from form-data, because those two types are
    // incompatible.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = formData as any;
    const res = await httpReq.post('/anything', {
        baseUrl,
        body,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    t.true(res.headers['Content-Type'].startsWith('multipart/form-data;boundary='));
});

test.serial('no content in 204 requests', async t => {
    nock(baseUrl).get('/status/204').reply(204);
    const res = await httpReq.get('/status/204', {
        baseUrl
    });

    t.is(res.headers.get('content-length'), null);
});

test.serial('throws HttpReqError', async t => {
    nock(baseUrl).get('/404').reply(404, { foo: 'bar' });
    try {
        await httpReq.get('/404', { baseUrl });
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

test.serial(
    'throws HttpReqError with translation key if response contains type and its translation exists',
    async t => {
        nock(baseUrl).get('/404-with-type').reply(404, { type: 'existing-foo' });
        try {
            await httpReq.get('/404-with-type', { baseUrl });
        } catch (err) {
            t.true(err instanceof HttpReqError);
            if (!(err instanceof HttpReqError)) throw err;
            t.is(err.translationKey, 'existing-foo');
            t.is(err.details, undefined);
        }
    }
);

test.serial(
    'throws HttpReqError with undefined translation key if response contains type but its translation does not exit',
    async t => {
        nock(baseUrl).get('/404-with-unknown-type').reply(404, { type: 'foo' });
        try {
            await httpReq.get('/404-with-unknown-type', { baseUrl });
        } catch (err) {
            t.true(err instanceof HttpReqError);
            if (!(err instanceof HttpReqError)) throw err;
            t.is(err.translationKey, undefined);
            t.is(err.details, undefined);
        }
    }
);

test.serial(
    'throws HttpReqError with details with translation keys for response details whose translations exist',
    async t => {
        nock(baseUrl)
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
            await httpReq.get('/404-with-details', { baseUrl });
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
    }
);

test.serial(
    'throws HttpReqError with details with undefined translation keys for invalid response details',
    async t => {
        nock(baseUrl)
            .get('/404-with-invalid-details')
            .reply(404, {
                type: 'bar',
                details: [{ spam: 'invalid' }, 'not an object', null]
            });
        try {
            await httpReq.get('/404-with-invalid-details', { baseUrl });
        } catch (err) {
            t.true(err instanceof HttpReqError);
            if (!(err instanceof HttpReqError)) throw err;
            t.is(err.translationKey, undefined);
            t.deepEqual(err.details, [{ spam: 'invalid' }, 'not an object', null]);
        }
    }
);

test.serial(
    'throws HttpReqError with details with undefined translation keys if there is no top-level type',
    async t => {
        nock(baseUrl)
            .get('/404-with-details-without-type')
            .reply(404, {
                details: [{ type: 'existing-one', path: 'path-one' }]
            });
        try {
            await httpReq.get('/404-with-details-without-type', {
                baseUrl
            });
        } catch (err) {
            t.true(err instanceof HttpReqError);
            if (!(err instanceof HttpReqError)) throw err;
            t.is(err.translationKey, undefined);
            t.deepEqual(err.details, [{ type: 'existing-one', path: 'path-one' }]);
        }
    }
);

test.serial('sends CSRF header with an "unsafe" HTTP method', async t => {
    nock(baseUrl).put('/put').reply(200).persist();

    document.cookie = 'crumb=abc';
    const promise = httpReq.put('/put', { baseUrl });
    t.is(t.context.fakeFetch.lastCall.args[1]?.headers?.['X-CSRF-Token'], 'abc');
    return promise;
});

test.serial('doesn\'t send CSRF header with a "safe" HTTP method', async t => {
    nock(baseUrl).get('/get').reply(200).persist();

    document.cookie = 'crumb=abc';
    const promise = httpReq.get('/get', { baseUrl });
    t.falsy(t.context.fakeFetch.lastCall.args[1]?.headers?.['X-CSRF-Token']);
    return promise;
});
