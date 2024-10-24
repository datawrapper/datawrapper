import test from 'ava';
import { generateRandomId } from './generateRandomId';

test('generateRandomId generates random string of length 10', t => {
    t.true(generateRandomId().length === 10);
});

test('generateRandomId generates different string every time', t => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
        ids.add(generateRandomId());
    }
    t.is(ids.size, 10);
});
