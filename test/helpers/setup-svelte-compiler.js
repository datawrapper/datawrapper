const path = require('path');
const addHook = require('pirates').addHook;
const { compile } = require('svelte');
const sourceMapSupport = require('source-map-support');

const SVELTE_EXTENSION = '.html';

// Add sourcemap support for svelte files
const sourcemaps = {};
sourceMapSupport.install({
    retrieveSourceMap: function(filename) {
        const map = sourcemaps[filename];
        return map ? { url: filename, map } : null;
    }
});

// We use LESS which requires async preprocessing, which we can't easily do here.
// To circumvent preprocessing, we simply remove all style tags from the raw code.
// The regex is borrowed from Svelte's original preprocess function:
// https://github.com/sveltejs/svelte/blob/master/src/preprocess/
const removeStyles = code => code.replace(/<style([^]*?)>([^]*?)<\/style>/i, '');

const compileSvelte = (rawCode, filename) => {
    const code = removeStyles(rawCode);
    const { js } = compile(code, {
        // the filename of the source file, used in e.g. generating sourcemaps
        filename,

        // component name, useful for debugging
        name: path.basename(filename, SVELTE_EXTENSION),

        // explicitly set parser for svelte-upgrade
        // TODO: Properly upgrade to v2 (or v3?!)
        parser: 'v2'
    });

    // make the sourcemap available to be retrieved via source map support
    sourcemaps[filename] = js.map;

    return js.code;
};

addHook(compileSvelte, { exts: [SVELTE_EXTENSION] });
