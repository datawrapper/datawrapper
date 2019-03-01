import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';

export default {
    input: 'main.js',
    output: {
        file: 'build.js',
        sourcemap: false,
        format: 'cjs'
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
