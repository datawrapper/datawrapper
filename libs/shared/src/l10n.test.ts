import test from 'ava';
import { ApiError, __, keyExists, translate, translateError } from './l10n';

test.before(() => {
    global.dw = {
        backend: {
            __messages: {
                core: {
                    foo: 'Fooo',
                    bar: 'Baaar',
                    baz: 'Baaaz',
                    'html-example': '<strong>Hello</strong> %user_name%!',
                    'named-example': '%a %a% %ab %ab% %abc %abc%',
                    'numbered-example': 'Hi! $0. What? $0. Who? $0 $1!',
                    'Unknown error': 'Unknown error'
                }
            }
        }
    };
});

test('__ picks a translation string from the global dw.backend.__messages object', t => {
    t.is(__('foo', 'core'), 'Fooo');
    t.is(__('bar', 'core'), 'Baaar');
});

test('__ returns the passed key with prefix MISSING when the key does not exist', t => {
    t.is(__('non-existent-key'), 'MISSING:non-existent-key');
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

test('keyExists returns true if the key exists in the default scope', t => {
    t.true(keyExists('foo'));
});

test('keyExists returns false if the key does not exist in the default scope', t => {
    t.false(keyExists('non-existent-key'));
});

test('keyExists returns false if the passed scope does not exist', t => {
    t.false(keyExists('non-existent-key', 'non-existent-scope'));
});

test('translateError translates an API error object', t => {
    let error: ApiError;
    error = {
        statusCode: 404
    };
    t.is(translateError(error), 'Unknown error');

    error = {
        statusCode: 404,
        message: 'foo'
    };
    t.is(translateError(error), 'Fooo');

    error = {
        statusCode: 404,
        message: 'foo'
    };
    t.is(translateError(error, 'baz'), 'Baaaz');

    error = {
        statusCode: 404,
        message: 'foo',
        translationKey: 'bar'
    };
    t.is(translateError(error), 'Baaar');

    error = {
        statusCode: 404,
        message: 'foo',
        translationKey: 'bar',
        details: [{ type: 'baz', path: 'baz', translationKey: 'baz' }]
    };
    t.is(translateError(error), 'Baaaz');

    error = {
        statusCode: 404,
        message: 'foo',
        translationKey: 'bar',
        details: [
            { type: 'baz', path: 'baz', translationKey: 'baz' },
            { type: 'foo', path: 'foo', translationKey: 'foo' }
        ]
    };
    t.is(translateError(error), 'Baaaz. Fooo');
});
