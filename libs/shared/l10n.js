/* globals dw */

const __messages = {};

function initMessages(scope = 'core') {
    // let's check if we're in a chart
    if (scope === 'chart') {
        if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
            // use in-chart translations
            __messages[scope] = window.__dw.vis.meta.locale || {};
        }
    } else {
        // use backend translations
        __messages[scope] =
            scope === 'core'
                ? dw.backend.__messages.core
                : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
    }
}

/**
 * translates a message key. translations are originally stored in a
 * Google spreadsheet that we're pulling into Datawrapper using the
 * `scripts/update-translations` script, which stores them as `:locale.json`
 * files in the /locale folders (both in core as well as inside plugin folders)
 *
 * for the client-side translation to work we are also storing the translations
 * in the global `window.dw.backend.__messages` object. plugins that need
 * client-side translations must set `"svelte": true` in their plugin.json
 *
 * @param {string} key -- the key to be translated, e.g. "signup / hed"
 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
 * @returns {string} -- the translated text
 */
function __(key, scope = 'core') {
    key = key.trim();
    if (!__messages[scope]) initMessages(scope);
    if (!__messages[scope][key]) return 'MISSING:' + key;
    var translation = __messages[scope][key];

    if (typeof translation === 'string' && arguments.length > 2) {
        // replace $0, $1 etc with remaining arguments
        translation = translation.replace(/\$(\d)/g, (m, i) => {
            i = 2 + Number(i);
            if (arguments[i] === undefined) return m;
            return arguments[i];
        });
    }
    return translation;
}

export { __ };
