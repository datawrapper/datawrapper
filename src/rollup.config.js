/* eslint-env node, es6 */
import less from 'less';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

const production = !process.env.ROLLUP_WATCH;

const targets = [];

build('upload');
build('describe');
build('controls', { noAMD: true });
build('controls/hot', { noAMD: true });
// publish_old.js, publish.js and publish/sidebar.js now get built in Svelte 2, in /publish/build-svelte-2
// build('publish', { append: '_old' });
// build('publish', { noAMD: true, entry: 'index.js' });
// build('publish/sidebar', { noAMD: true });
build('highlight');
build('editor');
build('account');

if (checkTarget('render'))
    targets.push({
        input: 'render/index.js',
        output: {
            name: 'render',
            file: '../templates/chart/render.js.twig',
            format: 'iife',
            banner: `/*! {#
     # This file is auto-generated. Do NOT attempt to edit directly.
     # Instead, edit \`src/render/index.js\` and run make build
     #} */`
        },
        plugins: [
            resolve(),
            commonjs(),
            buble({
                transforms: { dangerousForOf: true }
            }),
            production &&
                uglify({
                    mangle: true,
                    output: { comments: /^!/ }
                })
        ]
    });

if (checkTarget('embed'))
    targets.push({
        input: 'embed/index.js',
        output: {
            name: 'embed',
            file: '../templates/chart/embed.js',
            format: 'iife'
        },
        plugins: [
            resolve(),
            commonjs(),
            buble({
                transforms: { dangerousForOf: true }
            }),
            production &&
                uglify({
                    mangle: true,
                    output: { comments: /^!/ }
                })
        ]
    });

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
                transforms: { dangerousForOf: true }
            }),
            production &&
                uglify({
                    mangle: true
                })
        ]
    });
}

function checkTarget(appId) {
    if (!process.env.ROLLUP_TGT_APP) return true;
    return process.env.ROLLUP_TGT_APP === appId;
}
