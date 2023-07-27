import test from 'ava';
import { formatDelimited } from './delimited';

test('formatDelimited returns a CSV with delimiter, quotes and line-breaks escaped', async t => {
    t.is(
        formatDelimited([['comma,comma', 'quote"quote', 'line\nbreak']]),
        '"comma,comma","quote""quote","line\nbreak"'
    );
});
