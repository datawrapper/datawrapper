import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const targets = [];
['publish', 'publish/sidebar', 'publish_old'].forEach(id => {
    targets.push({
        input:
            id === 'publish'
                ? '../index.js'
                : id === 'publish/sidebar'
                ? '../sidebar/main.js'
                : '../main.js',
        external: [
            'chroma',
            'Handsontable',
            'cm',
            'vendor',
            '/static/vendor/jschardet/jschardet.min.js',
            '/static/vendor/xlsx/xlsx.full.min.js'
        ],
        output: {
            sourcemap: !production,
            name: id,
            file: `../../../www/static/js/svelte/${id}.js`,
            format: 'umd',
            amd: id === 'publish_old' ? { id: `svelte/publish_old` } : undefined,
            globals: {
                '/static/vendor/jschardet/jschardet.min.js': 'jschardet',
                '/static/vendor/xlsx/xlsx.full.min.js': 'xlsx'
            }
        },
        plugins: [
            svelte({
                dev: !production,
                css: css => {
                    css.write(`../../../www/static/css/svelte/${id}.css`);
                },
                cascade: false
            }),

            // If you have external dependencies installed from
            // npm, you'll most likely need these plugins. In
            // some cases you'll need additional configuration —
            // consult the documentation for details:
            // https://github.com/rollup/rollup-plugin-commonjs
            resolve(),
            commonjs(),
            json(),

            // If we're building for production (npm run build
            // instead of npm run dev), transpile and minify
            production &&
                buble({
                    transforms: { dangerousForOf: true }
                }),
            production && terser()
        ]
    });
});

export default targets;
