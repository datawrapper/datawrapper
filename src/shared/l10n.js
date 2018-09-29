/* globals dw */

function __(key, scope='core') {
	key = key.trim();
	if (!dw.backend.__messages[scope]) return 'MISSING:'+key;
    return dw.backend.__messages[scope][key] ||
        // fall back to core
        dw.backend.__messages.core[key] || key;
}

export { __ };
