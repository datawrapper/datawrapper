import test from 'ava';
import columnNameToVariable from './columnNameToVariable.js';

test('simple case, already a valid variable', t => {
    t.is(columnNameToVariable('foo'), 'foo');
    t.is(columnNameToVariable('foo123'), 'foo123');
});

test('lowercase variables', t => {
    t.is(columnNameToVariable('Foo'), 'foo');
    t.is(columnNameToVariable('FooBar'), 'foobar');
});

test('replace spaces with underscores', t => {
    t.is(columnNameToVariable('Foo Bar'), 'foo_bar');
});

test('replace dashes with underscores', t => {
    t.is(columnNameToVariable('Foo-Bar'), 'foo_bar');
});

test('ignore most other characters', t => {
    t.is(columnNameToVariable('Foo.Bar'), 'foobar');
    t.is(columnNameToVariable('Foo%Bar'), 'foobar');
    t.is(columnNameToVariable('Foo$Bar'), 'foobar');
    t.is(columnNameToVariable('Foo#Bar'), 'foobar');
});

test('multiple dashes become a single underscores', t => {
    t.is(columnNameToVariable('Foo Bar'), 'foo_bar');
    t.is(columnNameToVariable('Foo  Bar'), 'foo_bar');
    t.is(columnNameToVariable('Foo   Bar'), 'foo_bar');
    t.is(columnNameToVariable('Foo    Bar'), 'foo_bar');
    t.is(columnNameToVariable('Foo--Bar'), 'foo_bar');
    t.is(columnNameToVariable('Foo---Bar'), 'foo_bar');
    t.is(columnNameToVariable('Foo----Bar'), 'foo_bar');
});

test('no numbers at the beginning', t => {
    t.is(columnNameToVariable('12Foo'), '_12foo');
});

test('no underscores at the beginning', t => {
    t.is(columnNameToVariable('_%_foo'), 'foo');
    t.is(columnNameToVariable('__foo'), 'foo');
});

test('some real-world examples', t => {
    t.is(columnNameToVariable('Country Name'), 'country_name');
    t.is(columnNameToVariable('GDP (per cap.)'), 'gdp_per_cap');
    t.is(columnNameToVariable('Unempl. in %'), 'unempl_in');
});

test('preserve keywords', t => {
    t.is(columnNameToVariable('and'), 'and_');
    t.is(columnNameToVariable('true'), 'true_');
    t.is(columnNameToVariable('false'), 'false_');
    t.is(columnNameToVariable('or'), 'or_');
    t.is(columnNameToVariable('in'), 'in_');
});

test('JS keywords are now allowed as variables', t => {
    t.is(columnNameToVariable('abstract'), 'abstract');
    t.is(columnNameToVariable('Number'), 'number');
    t.is(columnNameToVariable('class'), 'class');
    t.is(columnNameToVariable('function'), 'function');
    t.is(columnNameToVariable('const'), 'const');
});
