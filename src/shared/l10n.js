/* globals dw */

function __(key, scope='core') {
    return dw.backend.__messages[scope][key] ||
        // fall back to core
        dw.backend.__messages.core[key] || key;
}

export { __ };
