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
// To circumvent preprocessing, we simply replace all style tags with placeholders.
// The placeholders make sure that line numbers are kept intact for accurate source maps.
// The regex is borrowed from Svelte's original preprocess function:
// https://github.com/sveltejs/svelte/blob/master/src/preprocess/
const removeStyles = code => {
    const styleBlocks = code.match(/<style([^]*?)>([^]*?)<\/style>/gi);
    // if no style blocks are found, just return the code
    if (!styleBlocks) return code;
    styleBlocks.forEach(block => {
        const lines = block.split(/\r\n|\r|\n/);
        const placeholder = lines.map(() => '<!-- This line replaces LESS code! -->').join('\n');
        code = code.replace(block, placeholder);
    });
    return code;
};
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

    // make the sourcemap available to be retrieved via "source-map-support"
    sourcemaps[filename] = js.map;

    return js.code;
};

addHook(compileSvelte, { exts: [SVELTE_EXTENSION], ignoreNodeModules: false });
