import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

const production = !process.env.ROLLUP_WATCH;

const targets = [];

// build('publish', { append: '_old' });
// build('publish', { noAMD: true, entry: 'index.js' });
// build('publish/sidebar', { noAMD: true });

build('publish');

export default targets;

function build(appId) {
    targets.push({
        input: 'index.js',
        // input: 'main.js',
        external: ['chroma', 'Handsontable', 'cm', 'vendor', '/static/vendor/jschardet/jschardet.min.js', '/static/vendor/xlsx/xlsx.full.min.js'],
        output: {
            sourcemap: !production,
            name: 'publish',
            file: '../../www/static/js/svelte/publish.js',
            // file: './output/publish.js',
            format: 'umd',
            // amd: undefined,
            globals: {
                '/static/vendor/jschardet/jschardet.min.js': 'jschardet',
                '/static/vendor/xlsx/xlsx.full.min.js': 'xlsx'
            }
        },
        plugins: [
            svelte({
                dev: !production,
                css: css => {
                    css.write('../../www/static/css/svelte/publish.css');
                    // css.write('./output/publish.css');
                },
                cascade: false
                // store: true
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
            buble({
                transforms: { dangerousForOf: true }
            }),
            production &&
                uglify({
                    mangle: true
                })
        ]
    });
}
