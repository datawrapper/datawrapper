/* eslint-env node, es6 */
import less from 'less';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const targets = [];

build('upload');
build('controls', { noAMD: true });
build('highlight');
build('editor');

export default targets;

function build(appId, opts) {
    const { noAMD, entry, append } = Object.assign(
        {
            noAMD: false,
            entry: 'main.js',
            append: ''
        },
        opts
    );
    if (!checkTarget(appId)) return;
    targets.push({
        input: `${appId}/${entry}`,
        external: ['chroma', 'Handsontable', 'cm', 'vendor', '/static/vendor/jschardet/jschardet.min.js', '/static/vendor/xlsx/xlsx.full.min.js'],
        output: {
            sourcemap: !production,
            name: appId,
            file: `../www/static/js/svelte/${appId}${append}.js`,
            format: 'umd',
            amd: noAMD ? undefined : { id: `svelte/${appId}${append}` },
            globals: {
                '/static/vendor/jschardet/jschardet.min.js': 'jschardet',
                '/static/vendor/xlsx/xlsx.full.min.js': 'xlsx'
            }
        },
        plugins: [
            svelte({
                dev: !production,
                parser: 'v2',
                // we'll extract any component CSS out into
                // a separate file — better for performance
                css: css => {
                    css.write(`../www/static/css/svelte/${appId}${append}.css`);
                },
                // this results in smaller CSS files
                cascade: false,
                store: true,
                preprocess: {
                    style: ({ content, attributes }) => {
                        if (attributes.lang !== 'less') return;
                        return new Promise((resolve, reject) => {
                            less.render(
                                content,
                                {
                                    data: content,
                                    includePaths: ['src'],
                                    sourceMap: true
                                },
                                (err, result) => {
                                    if (err) return reject(err);

                                    resolve({
                                        code: result.css.toString(),
                                        map: result.map.toString()
                                    });
                                }
                            );
                        });
                    }
                }
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
                transforms: { dangerousForOf: true },
                objectAssign: 'Object.assign'
            }),
            production &&
                terser({
                    mangle: true
                })
        ]
    });
}

function checkTarget(appId) {
    if (!process.env.ROLLUP_TGT_APP) return true;
    return process.env.ROLLUP_TGT_APP === appId;
}
