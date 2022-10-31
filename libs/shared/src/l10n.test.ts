import test from 'ava';
import { __, translate } from './l10n';

test.before(() => {
    global.dw = {
        backend: {
            __messages: {
                core: {
                    foo: 'Fooo',
                    bar: 'Baaar',
                    'html-example': '<strong>Hello</strong> %user_name%!',
                    'named-example': '%a %a% %ab %ab% %abc %abc%',
                    'numbered-example': 'Hi! $0. What? $0. Who? $0 $1!'
                }
            }
        }
    };
});

test('__ picks a translation string from a global `dw.backend.__messages` object', t => {
    t.is(__('foo', 'core'), 'Fooo');
    t.is(__('bar', 'core'), 'Baaar');
});

test('__ replaces named placeholders (e.g. %name%, %id%) with provided values', t => {
    t.is(__('named-example', 'core', { a: 'foo' }), 'foo foo %ab %ab% %abc %abc%');
    t.is(__('named-example', 'core', { ab: 'foo' }), '%a %a% foo foo %abc %abc%');
    t.is(__('named-example', 'core', { abc: 'foo' }), '%a %a% %ab %ab% foo foo');
});

test('__ replaces numbered placeholders ($0, $1, etc.) with string attributes', t => {
    t.is(
        __('numbered-example', 'core', 'My name is', 'Slim Shady'),
        'Hi! My name is. What? My name is. Who? My name is Slim Shady!'
    );
});

test('__ sanitizes potentially malicious HTML', t => {
    t.is(
        __('html-example', 'core', { user_name: '<a href="#" onclick="alert(this)">World</a>' }),
        '<strong>Hello</strong> <a rel="nofollow noopener noreferrer" target="_blank" href="#">World</a>!'
    );
});

test('translate picks a translation string from a provided message object', t => {
    const messages = { core: { foo: 'Fooo', bar: 'Baaar' } };
    t.is(translate('foo', 'core', messages), 'Fooo');
    t.is(translate('bar', 'core', messages), 'Baaar');
});

test('translate falls back to key if no translation is available', t => {
    const messages = { core: { foo: 'Fooo', bar: 'Baaar' } };
    t.is(translate('baz', 'core', messages), 'baz');
});

test('translate replaces named placeholders (e.g. %name%, %id%) with provided values', t => {
    const messages = { core: { 'named-example': '%a %a% %ab %ab% %abc %abc%' } };
    t.is(translate('named-example', 'core', messages, { a: 'foo' }), 'foo foo %ab %ab% %abc %abc%');
    t.is(translate('named-example', 'core', messages, { ab: 'foo' }), '%a %a% foo foo %abc %abc%');
    t.is(translate('named-example', 'core', messages, { abc: 'foo' }), '%a %a% %ab %ab% foo foo');
});

test('translate replaces numbered placeholders ($0, $1, etc.) with string attributes', t => {
    const messages = { core: { 'numbered-example': 'Hi! $0. What? $0. Who? $0 $1!' } };
    t.is(
        translate('numbered-example', 'core', messages, 'My name is', 'Slim Shady'),
        'Hi! My name is. What? My name is. Who? My name is Slim Shady!'
    );
});

test('translate does not replace numbered placeholders for which no value is provided', t => {
    const messages = { core: { 'numbered-example': 'Hi! $0. What? $2. Who? $0 $1!' } };
    t.is(
        translate('numbered-example', 'core', messages, 'My name is', 'Slim Shady'),
        'Hi! My name is. What? $2. Who? My name is Slim Shady!'
    );
});

test('translate sanitizes potentially malicious HTML', t => {
    const messages = { core: { 'my-key': 'Hello %user_name%!' } };
    const replacements = { user_name: '<a href="#" onclick="alert(this)">World</a>' };
    t.is(
        translate('my-key', 'core', messages, replacements),
        'Hello <a rel="nofollow noopener noreferrer" target="_blank" href="#">World</a>!'
    );
});
