import test from 'ava';
import purifyHtml from './purifyHtml';

test('purifyHtml return same string if no tags present', t => {
    t.is(purifyHtml('Hello world'), 'Hello world');
});

test('return same string if no tags present', t => {
    t.is(purifyHtml('Hello world'), 'Hello world');
});

test('should remove some tags, but keep others', t => {
    t.is(purifyHtml('<h1><b>Hello</b> World</h1>'), '<b>Hello</b> World');
});

test('should not crash if input is not a string', t => {
    t.notThrows(() => purifyHtml(null));
    t.notThrows(() => purifyHtml(undefined));
    t.notThrows(() => purifyHtml(42));
    t.notThrows(() => purifyHtml({ foo: 'bar' }));
});

test('should return the input value if undefined or null', t => {
    t.is(purifyHtml(null), null);
    t.is(purifyHtml(undefined), undefined);
});

test('should remove script tags', t => {
    t.is(purifyHtml('<script>alert("foo")</script>'), 'alert("foo")');
});

test('should keep script tags if we explicitly allow it', t => {
    t.is(purifyHtml('<script>alert("foo")</script>', '<script>'), '<script>alert("foo")</script>');
});

test.todo('test if styles are kept in');

test.todo('test if onclick handlers are removed');

test.todo('test if javascript:... links are removed');
