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
build('controls', {no_amd:true});
build('controls/hot', {no_amd:true});
build('publish', {append:'_old'});
build('publish', {no_amd:true, entry:'index.js'});
build('publish/sidebar', {no_amd:true});
build('highlight');
build('editor');
build('account');

export default targets;


function build(app_id, opts) {
    const {no_amd, entry, append} = Object.assign({
        no_amd: false,
        entry: 'main.js',
        append: ''
    }, opts);
    targets.push({
        input: `${app_id}/${entry}`,
        external: [
            'chroma',
            'Handsontable',
            'cm',
            'vendor',
            '/static/vendor/jschardet/jschardet.min.js',
            '/static/vendor/xlsx/xlsx.full.min.js'
        ],
        output: {
            sourcemap: false,
            name: app_id,
            file: `../www/static/js/svelte/${app_id}${append}.js`,
            format: 'umd',
            amd: no_amd ? undefined : { id: `svelte/${app_id}${append}` },
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
                    css.write(`../www/static/css/svelte/${app_id}${append}.css`);
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
            buble({
                transforms: { dangerousForOf: true }
            }),
            production && uglify({
                mangle: true
            })
        ]
    });
}

