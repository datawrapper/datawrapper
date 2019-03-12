const path = require('path');
const addHook = require('pirates').addHook;
const { compile } = require('svelte');

const SVELTE_EXTENSION = '.html';

// We use LESS which requires async preprocessing, which we can't easily do here.
// To circumvent preprocessing, we simply remove all style tags from the raw code.
const removeStyles = code => code.replace(/<style([^]*?)>([^]*?)<\/style>/i, '');

const compileSvelte = (rawCode, filename) => {
    const code = removeStyles(rawCode);
    const { js } = compile(code, {
        // the filename of the source file, used in e.g. generating sourcemaps.
        filename,

        // component name, useful for debugging.
        name: path.basename(filename, SVELTE_EXTENSION),

        // explicitly set parser for svelte-upgrade.
        // TODO: Properly upgrade to v2 (or v3?!)
        parser: 'v2'
    });

    return js.code;
};

addHook(compileSvelte, { exts: [SVELTE_EXTENSION] });
