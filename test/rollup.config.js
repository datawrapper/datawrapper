import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import svelte from 'rollup-plugin-svelte';
import multiEntry from 'rollup-plugin-multi-entry';

export default {
    input: ['./src/**/*.test.js'],
    output: {
        file: './test/build.js',
        sourcemap: false,
        format: 'cjs'
    },
    plugins: [multiEntry(), svelte({ parser: 'v2' }), commonjs(), json()],
    external: ['ava']
};
