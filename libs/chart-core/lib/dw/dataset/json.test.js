import test from 'ava';
import json from './json.js';
import sinon from 'sinon';

test.before(() => {
    global.fetch = () => {
        throw new Error('unexpected fetch call');
    };
});

test.after(() => {
    delete global.fetch;
});

test('simple JSON', async t => {
    const source = {
        foo: 'bar'
    };
    const dataset = await json({ csv: JSON.stringify(source) }).dataset();
    t.deepEqual(dataset, {
        foo: 'bar'
    });
});

function makeResponse(status, body = { foo: 'bar' }) {
    return Promise.resolve(
        new Response(JSON.stringify(body), {
            status,
            headers: {
                'Content-type': 'application/json'
            }
        })
    );
}

test.serial('With url: return parsed dataset if response is successful (HTTP 200-299)', async t => {
    const source = {
        foo: 'bar',
        baz: 42,
        qux: [1, 2, 3]
    };

    const stub = sinon.stub(global, 'fetch').callsFake(() => makeResponse(200, source));

    const dataset = await json({ url: 'http://example.com' }).dataset();
    t.deepEqual(dataset, source);

    stub.restore();
});

test.serial(
    'With url: return empty dataset if response is not successful (outside HTTP 200-299)',
    async t => {
        const stub = sinon.stub(global, 'fetch').callsFake(() => makeResponse(404));

        const dataset = await json({ url: 'http://example.com' }).dataset();
        t.deepEqual(dataset, {});

        stub.restore();
    }
);
