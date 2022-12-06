import test from 'ava';
import slugify from './slugify';

test('slugify', t => {
    t.deepEqual(slugify('This is a sentence!'), 'this-is-a-sentence');
    t.deepEqual(slugify('--F-oo'), 'f-oo');
    t.deepEqual(slugify('numbers ARE fine!!! 42'), 'numbers-are-fine-42');
    t.deepEqual(slugify('filename.ext'), 'filenameext');
});
