const fs = require('fs');
const less = require('less');
const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const buble = require('rollup-plugin-buble');
const uglify = require('rollup-plugin-uglify');
const i18n = require('rollup-plugin-i18n');

const production = !process.env.ROLLUP_WATCH;

function build(app_id) {
    buildLocale(app_id, 'en_US');
    buildLocale(app_id, 'de_DE');
}

function buildLocale(app_id, locale, callback) {
    const messages = JSON.parse(fs.readFileSync(`../locale/${locale}.json`, 'utf-8'));
    const inputOptions = {
        input: `${app_id}/main.js`,
        external: ['chroma', 'Handsontable', 'cm', 'vendor', '/static/vendor/jschardet/jschardet.min.js'],
        plugins: [
            i18n({
                language: messages
            }),

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
    };
    const outputOptions = {
        sourcemap: false,
        name: app_id,
        file: `../www/static/js/svelte/${app_id}.${locale}.js`,
        format: 'umd',
        globals: {
            '/static/vendor/jschardet/jschardet.min.js': 'jschardet'
        }
    };

    if (app_id.substr(0,8) != 'controls') outputOptions.amd = { id: `svelte/${app_id}` };

    _rollup(bundle => {
        _generate(bundle, () => {
            _write(bundle, () => {
                console.log(app_id, locale);
            });
        });
    });

    function _rollup(callback) {
        rollup.rollup(inputOptions)
            .catch(err => { console.log('rollup error:', err); })
            .then(bundle => {
                // console.log(bundle.imports); // an array of external dependencies
                // console.log(bundle.exports); // an array of names exported by the entry point
                // console.log(bundle.modules); // an array of module objects
                callback(bundle);
            });
    }

    function _generate(bundle, callback) {
        bundle.generate(outputOptions)
            .catch(err => { console.log('generate error:', err); })
            .then((code, map) => {
                callback(code, map);
            });
    }

    function _write(bundle, callback) {
        bundle.write(outputOptions)
            .catch(err => { console.log('write error:', err); })
            .then(callback);
    }
}

build('upload');
build('describe');
// build('controls');
// build('controls/hot');
// build('publish');
// build('highlight');

