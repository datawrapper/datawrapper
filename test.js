import test from 'ava';
import { rollup } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import svelte from 'rollup-plugin-svelte';

rollup({
    input: './App.html',
    plugins: [
        svelte({ parser: 'v2' }),
        resolve(),
        commonjs(),
        json(),
        buble({
            transforms: { dangerousForOf: true }
        })
    ]
})
    .then(generateOutput)
    .catch(error => {
        console.error(error.stack);
    });

function generateOutput(bundle) {
    bundle
        .generate({ format: 'iife', name: 'App' })
        .then(initTests)
        .catch(error => {
            console.error(error.stack);
        });
}

function initTests(output) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = output.code;

    document.body.appendChild(script);

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

        const app = new window.App({
            target: div,
            data: { name: 'world' }
        });

        t.is(document.querySelector('h1').innerHTML, 'Hello world!');
    });
}
