const path = require('path');
const fs = require('fs');

/**
 * Function to find a Datawrapper config file (`config.js`).
 * It looks in the current working directory and in `/etc/datawrapper/`.
 * If no config is found, the process will exit with a non zero exit code.
 *
 * It is possible to overwrite the config path with the env variable `DW_CONFIG_PATH`.
 * Useful for tests!
 *
 * **This is a Node module, that will probably not work in a browser environment.**
 *
 * @example
 * const { findConfigPath } = require('@datawrapper/shared/node/findConfig')
 *
 * const path = findConfigPath()
 * // -> /etc/datawrapper/config.js
 *
 * @returns {String}
 */
function findConfigPath() {
    const customPath = process.env.DW_CONFIG_PATH
        ? path.resolve(process.env.DW_CONFIG_PATH)
        : undefined;

    const paths = [
        '/etc/datawrapper/config.js',
        path.join(process.cwd(), '../../', 'config.js'),
        path.join(process.cwd(), 'config.js')
    ];

    if (customPath) {
        paths.unshift(customPath);
    }

    // eslint-disable-next-line
    for (const path of paths) {
        if (fs.existsSync(path)) return path;
    }

    process.stderr.write(`
❌ No config.js found!

Please check if there is a \`config.js\` file in either

${paths.join('\n')}
`);
    process.exit(1);
}

/**
 * Tiny wrapper around `findConfigPath` that directly `require`s the found config.
 *
 * @example
 * const { requireConfig } = require('@datawrapper/shared/node/findConfig')
 *
 * const config = requireConfig()
 *
 * @returns {Object}
 */
function requireConfig() {
    return require(findConfigPath());
}

module.exports = { findConfigPath, requireConfig };
