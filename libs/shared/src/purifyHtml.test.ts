import test from 'ava';
import { testProp, fc } from 'ava-fast-check';
import purifyHtml from './purifyHtml';

test('purifyHtml returns the string unchanged if no tags are present', t => {
    t.is(purifyHtml('Hello world'), 'Hello world');
});

test('purifyHtml removes the H1 tag but keeps B tag by default', t => {
    t.is(purifyHtml('<h1><b>Hello</b> World</h1>'), '<b>Hello</b> World');
});

test('purifyHtml does not crash if input is not a string', t => {
    t.notThrows(() => purifyHtml(null));
    t.notThrows(() => purifyHtml(undefined));
    t.notThrows(() => purifyHtml(42));
    t.notThrows(() => purifyHtml({ foo: 'bar' }));
});

test('purifyHtml returns the input value unchanged if it is undefined or null', t => {
    t.is(purifyHtml(null), null);
    t.is(purifyHtml(undefined), undefined);
});

test('purifyHtml keeps all tags that we allow explicitly', t => {
    const htmlSample = '<h1>Headline with <span style="color:red">additional styling</span></h1>';
    t.is(purifyHtml(htmlSample, ['h1', 'span']), htmlSample);
});

test('purifyHtml supports a string type of the allowed tags argument', t => {
    const htmlSample = '<h1>Headline with <span style="color:red">additional styling</span></h1>';
    t.is(purifyHtml(htmlSample, '<h1><span>'), htmlSample);
});

test('purifyHtml removes script tags including their content', t => {
    t.is(purifyHtml('<script>alert("foo")</script>'), '');
});

test('purifyHtml keeps script tags if we explicitly allow them', t => {
    t.is(purifyHtml('<script>alert("foo")</script>', ['script']), '<script>alert("foo")</script>');
});

test('purifyHtml sets default link target and rel', t => {
    t.is(
        purifyHtml('check out <a href="https://example.com">this link</a>!'),
        'check out <a rel="nofollow noopener noreferrer" target="_blank" href="https://example.com">this link</a>!'
    );
});

test('purifyHtml overwrites existing link target if it is not _self', t => {
    t.is(
        purifyHtml('check out <a href="https://example.com" target="_parent">this link</a>!'),
        'check out <a rel="nofollow noopener noreferrer" target="_blank" href="https://example.com">this link</a>!'
    );
});

test('purifyHtml does not overwrite existing link target if it is _self', t => {
    t.is(
        purifyHtml('check out <a href="https://example.com" target="_self">this link</a>!'),
        'check out <a rel="nofollow noopener noreferrer" target="_self" href="https://example.com">this link</a>!'
    );
});

test('purifyHtml overwrites existing link rel', t => {
    t.is(
        purifyHtml(
            'check out <a href="https://example.com" target="_self" rel="nofollow">this link</a>!'
        ),
        'check out <a rel="nofollow noopener noreferrer" target="_self" href="https://example.com">this link</a>!'
    );
});

test('purifyHtml keeps styles', t => {
    t.is(
        purifyHtml('this is <span style="color:red">red</span>!'),
        'this is <span style="color:red">red</span>!'
    );
});

test('purifyHtml removes onclick handlers', t => {
    t.is(
        purifyHtml('<a href="https://example.com" onclick="alert(42)">click me!</a>'),
        '<a rel="nofollow noopener noreferrer" target="_blank" href="https://example.com">click me!</a>'
    );
});

test('purifyHtml removes javascript urls', t => {
    t.is(
        purifyHtml('<a href="javascript:alert(42)">click me!</a>'),
        '<a rel="nofollow noopener noreferrer" target="_blank">click me!</a>'
    );
});

test('purifyHtml removes javascript urls with leading whitespace', t => {
    t.is(
        purifyHtml('<a href="   javascript:alert(42)">click me!</a>'),
        '<a rel="nofollow noopener noreferrer" target="_blank">click me!</a>'
    );
});

test('purifyHtml removes vbscript and data urls', t => {
    t.is(
        purifyHtml('<a href="vbscript:alert(42)">click me!</a>'),
        '<a rel="nofollow noopener noreferrer" target="_blank">click me!</a>'
    );
    t.is(
        purifyHtml('<a href="data:alert(42)">click me!</a>'),
        '<a rel="nofollow noopener noreferrer" target="_blank">click me!</a>'
    );
});

test('purifyHtml removes multiple on* handlers', t => {
    t.is(
        purifyHtml('<span onmouseover="diversion" onclick="alert(document.domain)">span</span>'),
        '<span>span</span>'
    );
});

test('purifyHtml removes javascript links with special chars', t => {
    t.is(
        purifyHtml(
            '<a href="ja&Tab;va&NewLine;script&colon;alert&lpar;document.domain&rpar;" target="_self">link</a>'
        ),
        '<a rel="nofollow noopener noreferrer" target="_self">link</a>'
    );
});

test('purifyHtml prevents unclosed tag exploit', t => {
    const el = document.createElement('p');
    const purified = purifyHtml('<img src=x onerror=alert(1);"" onload="a="');
    el.innerHTML = `<span>${purified}</span>`;

    t.is(el.children[0].tagName, 'SPAN');
    t.is(el.children[0].innerHTML, '');
    t.is(el.children[0].childNodes.length, 0);
});

test('purifyHtml prevents unclosed iframe exploit ', t => {
    const el = document.createElement('p');
    const purified = purifyHtml('<iframe src=x y=');
    el.innerHTML = `<span>${purified}</span>`;
    t.is(el.children[0].tagName, 'SPAN');
    t.is(el.children[0].innerHTML, '');
    t.is(el.children[0].childNodes.length, 0);
});

test('purifyHtml prevents hacky javascript links', t => {
    t.is(
        purifyHtml('<a href=javAscript:alert(1) target=_self>link</a>'),
        '<a rel="nofollow noopener noreferrer" target="_self">link</a>'
    );
});

testProp(
    'purifyHtml purifies some random HTML',
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
        t.is(purifyHtml(html, ['b', 'i', 'h1', 'h2', 'h3']), html);
    }
);

test('purifyHtml handles void tags', t => {
    t.is(
        purifyHtml(
            `
<p>
  <img src="foo" />
  <script>alert(1)</script>
  <br />
  foo
</p>`,
            ['img', 'br', 'p']
        ),
        `
<p>
  <img src="foo">
  \n  <br>
  foo
</p>`
    );
});

test('purifyHtml removes styles if they contain something that resembles an HTML tag', t => {
    // See https://github.com/cure53/DOMPurify/blob/abf62956a8ac86c74b1954274dd6b5b9813094ba/src/purify.js#L928-L939
    t.is(
        purifyHtml("<style>.body:after { content: 'without tags'; }</style>", '<style>'),
        "<style>.body:after { content: 'without tags'; }</style>"
    );
    t.is(purifyHtml("<style>.body:after { content: '<b>with tags</b>'; }</style>", '<style>'), '');
});

test('purifyHtml removes everything if `allowed` is an empty string', t => {
    t.is(
        purifyHtml('<a>link</a> <b>bold</b> <i>italic</i> <p>paragraph</p>', ''),
        'link bold italic paragraph'
    );
});

test('purifyHtml removes everything if `allowed` is an empty array', t => {
    t.is(
        purifyHtml('<a>link</a> <b>bold</b> <i>italic</i> <p>paragraph</p>', ''),
        'link bold italic paragraph'
    );
});

test('purifyHtml preserves DEFAULT_ALLOWED tags if `allowed` is not passed', t => {
    t.is(
        purifyHtml('<a>link</a> <b>bold</b> <i>italic</i> <p>paragraph</p>'),
        '<a rel="nofollow noopener noreferrer" target="_blank">link</a> <b>bold</b> <i>italic</i> paragraph'
    );
});
