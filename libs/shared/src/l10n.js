import purifyHtml from './purifyHtml.js';

const ALLOWED_HTML =
    '<p><h1><h2><h3><h4><h5><h6><blockquote><ol><ul><li><pre><hr><br>' + // Block elements (Markdown official)
    '<a><em><i><strong><b><code><img>' + // Inline elements (Markdown official)
    '<table><tr><th><td>' + // Tables
    '<small><span><div><sup><sub><tt>'; // Additional tags to support advanced customization

const __messages = {};

function initMessages(scope = 'core') {
    /* globals dw */

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

function getText(key, scope, messages) {
    try {
        const msg = messages[scope];
        return msg[key] || key;
    } catch (e) {
        return key;
    }
}

/**
 * Replaces named placeholders marked with %, such as %name% or %id.
 */
function replaceNamedPlaceholders(text, replacements = {}) {
    Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`%${k}%|%${k}(?!\\w)`, 'g'), v);
    });
    return text;
}

/**
 * Replaces numbered placeholders marked with $, such as $0, $1 etc.
 */
function replaceNumberedPlaceholders(text, replacements = []) {
    return text.replace(/\$(\d)/g, (m, i) => {
        if (replacements[+i] === undefined) return m;
        return purifyHtml(replacements[+i], '');
    });
}

/**
 * Translates a message key, replaces placeholders within translated strings, and sanitizes the
 * result of the translation so that it can be safely used in HTML.
 *
 * @param {string} key -- the key to be translated, e.g. "signup / hed"
 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
 * @param {object} messages -- translation strings in the format of { scope: { key: value }}
 * @param {string|object} replacements -- replacements for placeholders in the translations strings
 * @returns {string} -- the translated text
 */
export function translate(key, scope = 'core', messages, ...replacements) {
    let text = getText(key, scope, messages);
    if (typeof replacements[0] === 'string') {
        // use legacy, parameterized string replacements ($0, $1, etc.)
        text = replaceNumberedPlaceholders(text, replacements);
    } else {
        // use object for string replacement (i.e. %key% for { key: 'value' })
        text = replaceNamedPlaceholders(text, replacements[0]);
    }
    return purifyHtml(text, ALLOWED_HTML);
}

/**
 * Helper for finding a translation key based on a globally accessible dictionary (to be used
 * e.g. in visualization plugins and legacy Svelte 2 code).
 *
 * Translates a message key, replaces placeholders within translated strings, and sanitizes the
 * result of the translation so that it can be safely used in HTML.
 *
 * For the client-side translation to work we are pulling the translations from the global
 * `window.dw.backend.__messages` object. plugins that need client-side translations must set
 * `"svelte": true` in their plugin.json.
 *
 * @param {string} key -- the key to be translated, e.g. "signup / hed"
 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
 * @param {string|object} replacements -- replacements for placeholders in the translations strings
 * @returns {string} -- the translated text
 */
export function __(key, scope = 'core', ...replacements) {
    key = key.trim();
    if (!__messages[scope]) initMessages(scope);
    if (!__messages[scope][key]) return 'MISSING:' + key;
    return translate(key, scope, __messages, ...replacements);
}

export function keyExists(key, scope = 'core') {
    if (!__messages[scope]) initMessages(scope);
    return !!__messages[scope][key];
}
