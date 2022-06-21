import test from 'ava';
import { testProp, fc } from 'ava-fast-check';
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

test('should keep all tags that we allow explicitly', t => {
    const htmlSample = '<h1>Headline with <span style="color:red">additional styling</span></h1>';
    t.is(purifyHtml(htmlSample, '<h1><span>'), htmlSample);
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

test('test if javascript urls with leading whitespace are removed', t => {
    t.is(
        purifyHtml('<a href="   javascript:alert(42)">click me!</a>'),
        '<a href="" target="_blank" rel="nofollow noopener noreferrer">click me!</a>'
    );
});

test('test if vbscript and data urls are removed', t => {
    t.is(
        purifyHtml('<a href="vbscript:alert(42)">click me!</a>'),
        '<a href="" target="_blank" rel="nofollow noopener noreferrer">click me!</a>'
    );
    t.is(
        purifyHtml('<a href="data:alert(42)">click me!</a>'),
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
    t.is(el.childNodes[0].innerHTML, '');
    t.is(el.childNodes[0].childNodes.length, 0);
});

test('prevent unclosed iframe exploit ', t => {
    const el = document.createElement('p');
    const purified = purifyHtml('<iframe src=x y=');
    el.innerHTML = `<span>${purified}</span>`;
    t.is(el.childNodes[0].tagName, 'SPAN');
    t.is(el.childNodes[0].innerHTML, '');
    t.is(el.childNodes[0].childNodes.length, 0);
});

test('prevent hacky javascript links', t => {
    t.is(
        purifyHtml('<a href=javAscript:alert(1) target=_self>link</a>'),
        '<a href="" target="_self" rel="nofollow noopener noreferrer">link</a>'
    );
});

testProp(
    'purify some random HTML',
    [
        fc.stringOf(
            fc.oneof(
                fc.lorem(),
                fc
                    .tuple(
                        fc.oneof(...['b', 'i', 'h1', 'h2', 'h3'].map(t => fc.constant(t))),
                        fc.lorem()
                    )
                    .map(([tagName, content]) => `<${tagName}>${content}</${tagName}>`)
            ),
            { minLength: 50 }
        )
    ],
    (t, html) => {
        t.not(purifyHtml(html, ''), html);
        t.is(purifyHtml(html, '<b><i><h1><h2><h3>'), html);
    }
);
