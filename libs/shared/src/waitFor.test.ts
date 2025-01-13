import test from 'ava';
import sinon from 'sinon';
import { waitFor } from './waitFor';

let clock: sinon.SinonFakeTimers;

test.beforeEach(_t => {
    clock = sinon.useFakeTimers();
});

test.afterEach(_t => {
    clock.restore();
});

test.serial('waitFor resolves once the condition func is truthy', async t => {
    let result: boolean | number = false;
    setTimeout(() => (result = 42), 200);
    const [res] = await Promise.all([waitFor(() => result), clock.tickAsync(200)]);
    t.is(res, 42);
});

test.serial('waitFor times out', async t => {
    let result = false;
    setTimeout(() => (result = true), 2000);
    await t.throwsAsync(
        async () => {
            await Promise.all([waitFor(() => result, { timeout: 500 }), clock.tickAsync(500)]);
        },
        { instanceOf: Error, message: 'waitFor timeout exceeded' }
    );
});

test.serial('waitFor allows a custom error message', async t => {
    let result = false;
    setTimeout(() => (result = true), 2000);
    await t.throwsAsync(
        async () => {
            await Promise.all([
                waitFor(() => result, { timeout: 500, message: 'timed out in style' }),
                clock.tickAsync(500),
            ]);
        },
        { instanceOf: Error, message: 'timed out in style' }
    );
});

test.serial('waitFor uses custom interval when provided', async t => {
    let result = false;
    let checkedTimes = 0;
    setTimeout(() => (result = true), 200);
    await Promise.all([
        waitFor(
            () => {
                checkedTimes++;
                return result;
            },
            { interval: 50 }
        ),
        clock.tickAsync(200),
    ]);
    t.is(checkedTimes, 5);

    result = false;
    checkedTimes = 0;
    setTimeout(() => (result = true), 200);
    await Promise.all([
        waitFor(
            () => {
                checkedTimes++;
                return result;
            },
            { interval: 100 }
        ),
        clock.tickAsync(200),
    ]);
    t.is(checkedTimes, 3);
});
