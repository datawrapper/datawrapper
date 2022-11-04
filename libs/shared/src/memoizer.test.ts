import sinon from 'sinon';
import test from 'ava';
import { createPermanentMemoizer } from './memoizer';

test('memoizer drops the whole cache when maxsize is reached', async t => {
    const valueCreator = sinon.fake(key => `my value for ${key}`);

    const memoizer = createPermanentMemoizer(key => key, valueCreator, { maxsize: 2 });

    // Store two items to the cache.
    memoizer.get('key-1');
    memoizer.get('key-2');

    // Check that both items are retrieved from the cache.
    valueCreator.resetHistory();
    memoizer.get('key-1');
    memoizer.get('key-2');
    t.true(valueCreator.notCalled);

    // Store a third item in the cache, which exceeds maxsize and drops the whole cache.
    memoizer.get('key-3');

    // Check that now the first item is not cached anymore but the third one is.
    valueCreator.resetHistory();
    memoizer.get('key-1');
    t.true(valueCreator.calledOnce);
    t.true(valueCreator.calledWith('key-1'));
    valueCreator.resetHistory();
    memoizer.get('key-3');
    t.true(valueCreator.notCalled);
});
