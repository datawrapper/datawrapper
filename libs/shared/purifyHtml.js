const TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
const COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
const defaultAllowed = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

/**
 * Remove all non-whitelisted html tags from the given string
 *
 * @exports purifyHTML
 * @kind function
 *
 * @param {string} input - dirty html input
 * @param {string} allowed - list of allowed tags, defaults to `<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>`
 * @return {string} - the cleaned html output
 */
export default function purifyHTML(input, allowed) {
    /*
     * written by Kevin van Zonneveld et.al.
     * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
     */
    if (input === null) return null;
    if (input === undefined) return undefined;
    input = String(input);
    // pass if neither < or > exist in string
    if (input.indexOf('<') < 0 && input.indexOf('>') < 0) {
        return input;
    }
    input = stripTags(input, allowed);
    // remove all event attributes
    if (typeof document === 'undefined') return input;
    var d = document.createElement('div');
    d.innerHTML = `<span>${input}</span>`;
    var sel = d.childNodes[0].querySelectorAll('*');
    for (var i = 0; i < sel.length; i++) {
        if (sel[i].nodeName.toLowerCase() === 'a') {
            // special treatment for <a> elements
            if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
            sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
            if (
                sel[i].getAttribute('href') &&
                sel[i]
                    .getAttribute('href')
                    .trim()
                    .replace(/[^a-zA-Z0-9 -:]/g, '')
                    .startsWith('javascript:')
            ) {
                // remove entire href to be safe
                sel[i].setAttribute('href', '');
            }
        }
        const removeAttrs = [];
        for (var j = 0; j < sel[i].attributes.length; j++) {
            var attrib = sel[i].attributes[j];
            if (attrib.specified) {
                if (attrib.name.substr(0, 2) === 'on') removeAttrs.push(attrib.name);
            }
        }
        removeAttrs.forEach(attr => sel[i].removeAttribute(attr));
    }
    return d.childNodes[0].innerHTML;
}

function stripTags(input, allowed) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = (
        ((allowed !== undefined ? allowed || '' : defaultAllowed) + '')
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g) || []
    ).join('');

    var before = input;
    var after = input;
    // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
    while (true) {
        before = after;
        after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
        // return once no more tags are removed
        if (before === after) {
            return after;
        }
    }
}
