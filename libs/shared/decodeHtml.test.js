import test from 'ava';
import decodeHtml from './decodeHtml.js';

test('decode html entities does nothing to strings without entities', t => {
    t.is('No entities', 'No entities');
    t.is(decodeHtml('white\u00A0space'), 'white\u00A0space');
});

test('decode removed all html tags', t => {
    t.is(decodeHtml('<b>bold</b> text'), 'bold text');
});

test('decodes all &; entities', t => {
    t.is(decodeHtml('300 &lt; 400'), '300 < 400');
    t.is(decodeHtml('white&nbsp;space'), 'white\u00A0space');
});

test('outputs content of script tag', t => {
    t.is(decodeHtml('<script>alert(42)</script>'), 'alert(42)');
});
