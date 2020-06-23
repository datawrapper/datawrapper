/* eslint-env node, es6 */
import less from 'less';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const targets = [];

build('fields');
build('team-settings');
build('account');
build('chart-breadcrumb');
build('signin');
build('invite');
build('publish', { append: '_old' });
build('publish', { noAMD: true, entry: 'index.js' });
build('publish/sidebar', { noAMD: true });
build('publish/guest');
build('publish/pending-activation');
build('describe');
build('describe/hot', { noAMD: true });
build('visualize');
build('upload');
build('highlight');
build('resizer');

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
        output: {
            sourcemap: !production,
            name: appId,
            file: `../www/static/js/svelte/${appId}${append}.js`,
            format: 'umd',
            amd: noAMD ? undefined : { id: `svelte/${appId}${append}` }
        },
        plugins: [
            svelte({
                dev: !production,
                css: css => {
                    css.write(`../www/static/css/svelte/${appId}${append}.css`);
                },
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

            resolve(),
            commonjs(),
            json(),

            babel({
                // don't exclude anything!
                // exclude: [/node_modules\/(?!(@datawrapper|svelte)\/).*/],
                extensions: ['.js', '.mjs', '.html'],
                babelHelpers: 'runtime',
                presets: [
                    [
                        '@babel/env',
                        {
                            targets: 'last 2 versions, not IE 10, not dead',
                            corejs: 3,
                            useBuiltIns: 'entry'
                        }
                    ]
                ],
                plugins: [
                    'babel-plugin-transform-async-to-promises',
                    '@babel/plugin-transform-runtime'
                ]
            }),
            production && terser()
        ]
    });
}

function checkTarget(appId) {
    if (!process.env.ROLLUP_TGT_APP) return true;
    return process.env.ROLLUP_TGT_APP === appId;
}
