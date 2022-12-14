import { BrowserWindow, GlobalDw } from './browserGlobals';
import purifyHtml from './purifyHtml';

declare global {
    // This is not a new meaningless interface;
    // we extend an existing built-in Window interface with our globals
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Window extends BrowserWindow {}
}

declare const dw: GlobalDw;

const ALLOWED_HTML = [
    // Block elements (Markdown official)
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'ol',
    'ul',
    'li',
    'pre',
    'hr',
    'br',
    // Inline elements (Markdown official)
    'a',
    'em',
    'i',
    'strong',
    'b',
    'code',
    'img',
    // Tables
    'table',
    'tr',
    'th',
    'td',
    // Additional tags to support advanced customization
    'small',
    'span',
    'div',
    'sup',
    'sub',
    'kbd',
    'tt'
];

const __messages: Record<string, Record<string, string>> = {};

function initMessages(scope = 'core') {
    // let's check if we're in a chart
    if (scope === 'chart') {
        if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
            // use in-chart translations
            __messages[scope] = window.__dw.vis.meta.locale || {};
        }
    } else if (dw.backend.__messages) {
        // use backend translations
        __messages[scope] =
            scope === 'core'
                ? dw.backend.__messages.core
                : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
    }
}

function getText(key: string, scope: string, messages: Record<string, Record<string, string>>) {
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
function replaceNamedPlaceholders(text: string, replacements: Record<string, unknown> = {}) {
    Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`%${k}%|%${k}(?!\\w)`, 'g'), `${v}`);
    });
    return text;
}

/**
 * Replaces numbered placeholders marked with $, such as $0, $1 etc.
 */
function replaceNumberedPlaceholders(text: string, replacements: string[] = []) {
    return text.replace(/\$(\d)/g, (m, i) => {
        if (replacements[+i] === undefined) return m;
        return purifyHtml(replacements[+i], '');
    });
}

const isLegacyReplacements = (
    replacements: string[] | Record<string, unknown>[]
): replacements is string[] => {
    return typeof replacements[0] === 'string';
};

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
export function translate(
    key: string,
    scope = 'core',
    messages: Record<string, Record<string, string>>,
    ...replacements: string[] | Record<string, unknown>[]
) {
    let text = getText(key, scope, messages);
    if (isLegacyReplacements(replacements)) {
        const replacementsArray = replacements as string[];
        // use legacy, parameterized string replacements ($0, $1, etc.)
        text = replaceNumberedPlaceholders(text, replacementsArray);
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
export function __(
    key: string,
    scope = 'core',
    ...replacements: string[] | Record<string, unknown>[]
) {
    key = key.trim();
    if (!__messages[scope]) initMessages(scope);
    if (!__messages[scope][key]) return 'MISSING:' + key;
    return translate(key, scope, __messages, ...replacements);
}

export function keyExists(key: string, scope = 'core') {
    if (!__messages[scope]) initMessages(scope);
    return !!__messages[scope][key];
}
