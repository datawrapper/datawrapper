import test from 'ava';
import purifyHtml from './purifyHtml.js';

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

test('links get target="_blank" and rel="" set automatically', t => {
    t.is(
        purifyHtml('check out <a href="https://example.com">this link</a>!'),
        'check out <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">this link</a>!'
    );
});

test('links with existing target != _self get overwritten', t => {
    t.is(
        purifyHtml('check out <a href="https://example.com" target="_parent">this link</a>!'),
        'check out <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">this link</a>!'
    );
});

test('links with existing target _self dont get overwritten', t => {
    t.is(
        purifyHtml('check out <a href="https://example.com" target="_self">this link</a>!'),
        'check out <a href="https://example.com" target="_self" rel="nofollow noopener noreferrer">this link</a>!'
    );
});

test('test if styles are kept in', t => {
    t.is(
        purifyHtml('this is <span style="color:red">red</span>!'),
        'this is <span style="color:red">red</span>!'
    );
});

test('test if onclick handlers are removed', t => {
    t.is(
        purifyHtml('<a href="https://example.com" onclick="alert(42)">click me!</a>'),
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">click me!</a>'
    );
});

test('test if javascript urls are removed', t => {
    t.is(
        purifyHtml('<a href="javascript:alert(42)">click me!</a>'),
        '<a href="" target="_blank" rel="nofollow noopener noreferrer">click me!</a>'
    );
});

test('test if multiple on* handlers are removed', t => {
    t.is(
        purifyHtml('<span onmouseover="diversion" onclick="alert(document.domain)">span</span>'),
        '<span>span</span>'
    );
});

test('javascript link with special chars', t => {
    t.is(
        purifyHtml(
            '<a href="ja&Tab;va&NewLine;script&colon;alert&lpar;document.domain&rpar;" target="_self">link</a>'
        ),
        '<a href="" target="_self" rel="nofollow noopener noreferrer">link</a>'
    );
});

test('prevent unclosed tag exploit', t => {
    const el = document.createElement('p');
    const purified = purifyHtml('<img src=x onerror=alert(1);"" onload="a="');
    el.innerHTML = `<span>${purified}</span>`;

    t.is(el.childNodes[0].tagName, 'SPAN');
    t.is(el.childNodes[0].innerHTML, '<img src="x" <="" span="">');
    t.is(el.childNodes[0].childNodes[0].tagName, 'IMG');
    t.is(el.childNodes[0].childNodes[0].getAttribute('onerror'), null);
    t.is(el.childNodes[0].childNodes[0].getAttribute('onload'), null);
});
