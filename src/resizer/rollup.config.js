/* eslint-env node, es6 */
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;
const appId = 'resizer';
const entry = 'main.js';

export default [
    {
        input: `./${entry}`,
        output: {
            sourcemap: !production,
            name: appId,
            file: `../../www/static/js/svelte/${appId}.js`,
            format: 'umd',
            amd: { id: `svelte/${appId}` }
        },
        plugins: [
            svelte({
                dev: !production,
                parser: 'v2',
                // we'll extract any component CSS out into
                // a separate file — better for performance
                css: css => {
                    css.write(`../../www/static/css/svelte/${appId}.css`);
                },
                // this results in smaller CSS files
                cascade: false,
                store: true
            }),

            resolve(),
            commonjs(),
            json(),
            buble({
                transforms: { dangerousForOf: true },
                objectAssign: 'Object.assign'
            }),
            production && terser()
        ]
    }
];
