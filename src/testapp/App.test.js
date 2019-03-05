/* eslint no-new: 0 */

import test from 'ava';
import App from './App.html';

test('foo', t => {
    t.pass();
});

test('bar', async t => {
    const bar = Promise.resolve('bar');
    t.is(await bar, 'bar');
});

test('Insert to DOM', t => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    t.is(document.querySelector('div'), div);
});

test('Render Svelte', t => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    new App({
        target: div,
        data: { name: 'world' }
    });

    t.is(div.querySelector('h1').innerHTML, 'Hello world!');
});
