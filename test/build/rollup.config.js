import fs from 'fs';
import less from 'less';
import rollup from 'rollup';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

const production = !process.env.ROLLUP_WATCH;


export default {
    input: 'main.js',
    output: {
        file: 'build.js',
        sourcemap: false,
        format: 'cjs',
    },
    plugins: [
        resolve(),
        commonjs(),
        json(),
        buble({
            transforms: { dangerousForOf: true }
        })
    ]
};
