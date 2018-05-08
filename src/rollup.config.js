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

const targets = [];

build('upload');
build('describe');
build('controls');
build('controls/hot');
build('publish');
build('highlight');

export default targets;


function build(app_id) {
    targets.push({
        input: `${app_id}/main.js`,
        external: ['chroma', 'Handsontable', 'cm', 'vendor', '/static/vendor/jschardet/jschardet.min.js'],
        output: {
            sourcemap: false,
            name: app_id,
            file: `../www/static/js/svelte/${app_id}.js`,
            format: 'umd',
            amd: app_id.substr(0,8) != 'controls' ? { id: `svelte/${app_id}` } : undefined,
            globals: {
                '/static/vendor/jschardet/jschardet.min.js': 'jschardet'
            }
        },
        plugins: [
            svelte({
                dev: !production,
                parser: 'v2',
                // we'll extract any component CSS out into
                // a separate file — better for performance
                css: css => {
                    css.write(`../www/static/css/svelte/${app_id}.css`);
                },
                // this results in smaller CSS files
                cascade: false,
                store: true,
                preprocess: {
                    style: ({ content, attributes }) => {
                        if (attributes.lang !== 'less') return;
                        return new Promise((fulfil, reject) => {
                            less.render(content, {
                                data: content,
                                includePaths: ['src'],
                                sourceMap: true,
                            }, (err, result) => {
                                if (err) return reject(err);

                                fulfil({
                                    code: result.css.toString(),
                                    map: result.map.toString()
                                });
                            });
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
            production && buble({
                transforms: { dangerousForOf: true }
            }),
            production && uglify()
        ]
    });
}

