import test from 'ava';
import { moveToStart } from './array';

test('moveToStart moves a matching item to the start of the array', t => {
    const array = [1, 2, 3, 4, 5];
    moveToStart(array, item => item === 3);
    t.deepEqual(array, [3, 1, 2, 4, 5]);
});

test('moveToStart returns the original array if no matching item is found', t => {
    const array = [1, 2, 3, 4, 5];
    moveToStart(array, item => item === 6);
    t.deepEqual(array, [1, 2, 3, 4, 5]);
});

test('moveToStart can handle objects in the array', t => {
    const array = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
    moveToStart(array, item => item.id === 3);
    t.deepEqual(array, [{ id: 3 }, { id: 1 }, { id: 2 }, { id: 4 }, { id: 5 }]);
});

test('moveToStart moves all matching items to the start of the array if there are multiple matches and preserves their order', t => {
    const array = [
        { id: 1, letter: 'a' },
        { id: 2, letter: 'b' },
        { id: 3, letter: 'b' },
        { id: 4, letter: 'c' },
    ];
    moveToStart(array, item => item.letter === 'b');
    t.deepEqual(array, [
        { id: 2, letter: 'b' },
        { id: 3, letter: 'b' },
        { id: 1, letter: 'a' },
        { id: 4, letter: 'c' },
    ]);
});
