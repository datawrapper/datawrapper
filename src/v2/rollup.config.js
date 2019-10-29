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

build('fields');
build('chart-breadcrumb');

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
            file: `../../www/static/js/svelte/${appId}${append}.js`,
            format: 'umd',
            amd: noAMD ? undefined : { id: `svelte/${appId}${append}` }
        },
        plugins: [
            svelte({
                dev: !production,
                css: css => {
                    css.write(`../../www/static/css/svelte/${appId}${append}.css`);
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

            buble({
                transforms: { dangerousForOf: true, asyncAwait: false },
                objectAssign: 'Object.assign'
            }),
            production && terser()
        ]
    });
}

function checkTarget(appId) {
    if (!process.env.ROLLUP_TGT_APP) return true;
    return process.env.ROLLUP_TGT_APP === appId;
}
