/* globals dw */

function __(key, scope = 'core') {
    key = key.trim();
    if (!dw.backend.__messages[scope]) return 'MISSING:' + key;
    var translation = dw.backend.__messages[scope][key] || dw.backend.__messages.core[key] || key;

    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            var index = i - 1;
            translation = translation.replace('$' + index, arguments[i]);
        }
    }

    return translation;
}

export { __ };
