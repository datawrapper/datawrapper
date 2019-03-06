const path = require('path');
const hooks = require('require-extension-hooks');
const { compile } = require(`svelte`);

const SVELTE_EXTENSION = '.html';

hooks(SVELTE_EXTENSION).push(function({ filename, content }) {
    const { js } = compile(content, {
        // the filename of the source file, used in e.g. generating sourcemaps.
        filename,

        // component name, useful for debugging.
        name: path.basename(filename, SVELTE_EXTENSION),

        // explicitly set parser for svelte-upgrade.
        // TODO: Properly upgrade to v2 (or v3?!)
        parser: 'v2'
    });

    return js.code;
});
