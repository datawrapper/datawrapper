/* eslint no-new: 0 */

import test from 'ava';
import Checkbox from './Checkbox.html';

test.beforeEach(t => {
    t.context = document.createElement('form');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Render label with provided text', t => {
    new Checkbox({
        target: t.context,
        data: { label: 'Some text' }
    });

    t.is(t.context.querySelector('label').textContent.trim(), 'Some text');
});

test('Render unchecked input by default', t => {
    new Checkbox({
        target: t.context
    });

    t.false(t.context.querySelector('input[type=checkbox]').checked);
});

test('Render checked input', t => {
    new Checkbox({
        target: t.context,
        data: { value: true }
    });

    t.true(t.context.querySelector('input[type=checkbox]').checked);
});

test('Render unchecked input', t => {
    new Checkbox({
        target: t.context,
        data: { value: false }
    });

    t.false(t.context.querySelector('input[type=checkbox]').checked);
});

test('Render disabled input', t => {
    new Checkbox({
        target: t.context,
        data: { disabled: true }
    });

    t.true(t.context.querySelector('input[type=checkbox]').disabled);
    t.true(t.context.querySelector('label').classList.contains('disabled'));
});

test('Render "faded" input', t => {
    new Checkbox({
        target: t.context,
        data: { faded: true }
    });

    t.true(t.context.querySelector('label').classList.contains('faded'));
});

test('Can be checked', t => {
    const checkbox = new Checkbox({
        target: t.context
    });

    t.context.querySelector('input[type=checkbox]').click();
    t.true(checkbox.get().value);
});

test('Can be toggled', t => {
    const checkbox = new Checkbox({
        target: t.context
    });

    t.context.querySelector('input[type=checkbox]').click();
    t.true(checkbox.get().value);
    t.context.querySelector('input[type=checkbox]').click();
    t.false(checkbox.get().value);
    t.context.querySelector('input[type=checkbox]').click();
    t.true(checkbox.get().value);
});
