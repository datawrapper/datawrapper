import test from 'ava';
import htmlTemplate from './htmlTemplate.mjs';

test('hello world', async t => {
    const tpl = htmlTemplate(`hello {{ world }}`);
    t.is(tpl({ world: 'foo' }), 'hello foo');
    t.is(tpl({ world: 'cat' }), 'hello cat');
    t.is(tpl({ world: 42 }), 'hello 42');
});

test('more html', async t => {
    const tpl = htmlTemplate(`<h2>{{ title }}</h2><ul><li>{{ value * 2 }}</li></ul>`);
    t.is(tpl({ title: 'foo', value: 3 }), '<h2>foo</h2><ul><li>6</li></ul>');
    t.is(tpl({ title: 'bar', value: 9 }), '<h2>bar</h2><ul><li>18</li></ul>');
});

test('ternary operator', async t => {
    const tpl = htmlTemplate(`{{ value > 10 ? "bigger" : "smaller" }}`);
    t.is(tpl({ value: 9 }), 'smaller');
    t.is(tpl({ value: 11 }), 'bigger');
});

test('round', async t => {
    const tpl = htmlTemplate(`{{ ROUND(value) }}`);
    t.is(tpl({ value: 1.3 }), '1');
    t.is(tpl({ value: 1.7 }), '2');
});

test('evil expression', async t => {
    t.throws(() => {
        const tpl = htmlTemplate(`{{ window.document.cookie }}`);
        tpl({ title: 'foo' });
    });
});

test('evil expression 2', async t => {
    t.throws(() => {
        const tpl = htmlTemplate(`{{ this.alert(422) }}`);
        tpl({ title: 'foo' });
    });
});

test('evil html', async t => {
    const tpl = htmlTemplate(`{{ title }} <script>alert('you are hacked')</script>`);
    t.is(tpl({ title: 'foo' }), "foo alert('you are hacked')");
});

test('evil expr + html', async t => {
    const tpl = htmlTemplate(`{{ col1 }} alert('you are hacked') {{col2}}`);
    t.is(tpl({ col1: '<script>', col2: '</script>' }), " alert('you are hacked') ");
});

test('expressions in style attributes', async t => {
    const tpl = htmlTemplate(`<span style="display:block;width: {{ col1 }}px">foo</span>`);
    t.is(tpl({ col1: 123 }), '<span style="display:block;width: 123px">foo</span>');
});

test('cluster tooltips', async t => {
    const tpl = (tpl, ctx) => {
        tpl = htmlTemplate(tpl);
        return tpl(ctx);
    };
    const ctx = {
        symbols: [
            {
                ID: 'USA',
                value: 1234
            },
            {
                ID: 'Canada',
                value: 1876
            },
            {
                ID: 'Mexico',
                value: 234
            }
        ]
    };
    ctx.first = ctx.symbols[0];
    t.is(tpl(`{{ first.ID }}`, ctx), 'USA');
    t.is(tpl(`{{ JOIN(PLUCK(symbols, 'ID'), ' and ') }}`, ctx), 'USA and Canada and Mexico');
    t.is(tpl(`{{ JOIN(PLUCK(symbols, 'ID'), ', ', ' and ') }}`, ctx), 'USA, Canada and Mexico');
    t.is(
        tpl(
            `The countries are {{ JOIN(MAP(f(a) = CONCAT('<b>',a,'</b>'), PLUCK(symbols, 'ID')), ', ', ', and ') }}!`,
            ctx
        ),
        'The countries are <b>USA</b>, <b>Canada</b>, and <b>Mexico</b>!'
    );
    t.is(
        tpl(
            `There are <b>{{ LENGTH(symbols) }} countries</b> and their names are {{ JOIN(MAP(f(a) = CONCAT('<b>',a,'</b>'), PLUCK(symbols, 'ID')), ', ', ' and ') }}!`,
            ctx
        ),
        'There are <b>3 countries</b> and their names are <b>USA</b>, <b>Canada</b> and <b>Mexico</b>!'
    );
    t.is(
        tpl(
            `There are <b>{{ LENGTH(symbols) }} countries</b> and their names are {{ JOIN(MAP(f(a) = CONCAT('<b>',a.ID,'</b>'), symbols), ', ', ' and ') }}!`,
            ctx
        ),
        'There are <b>3 countries</b> and their names are <b>USA</b>, <b>Canada</b> and <b>Mexico</b>!'
    );
    t.is(
        tpl(`The biggest value is in <b>{{ (SORT(symbols, FALSE, 'value'))[0].ID }}</b>!`, ctx),
        'The biggest value is in <b>Canada</b>!'
    );
});

test('null expressions converted to empty strings', async t => {
    const tpl = htmlTemplate(`hello {{ value }}`);
    t.is(tpl({ value: null }), 'hello ');
    t.is(tpl({ value: false }), 'hello false');
});

test('style tags are removed', async t => {
    const tpl = htmlTemplate(`hello <style>div { background: yellow }</style> {{ value }}`);
    t.is(tpl({ value: 'world' }), 'hello div { background: yellow } world');
});
