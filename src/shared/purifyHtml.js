/**
 * Remove all html tags from the given string
 *
 * written by Kevin van Zonneveld et.al.
 * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
 */
const TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
const COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
const defaultAllowed = '<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

export default function(input, allowed) {
    if (input === null) return null;
    if (input === undefined) return undefined;
    input = String(input);
    // strip tags
    if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
        return input;
    }
    input = stripTags(input, allowed);
    // remove all event attributes
    if (typeof document === 'undefined') return input;
    var d = document.createElement('div');
    d.innerHTML = input;
    var sel = d.querySelectorAll('*');
    for (var i = 0; i < sel.length; i++) {
        for (var j = 0; j < sel[i].attributes.length; j++) {
            var attrib = sel[i].attributes[j];
            if (attrib.specified) {
                if (attrib.name.substr(0, 2) === 'on') sel[i].removeAttribute(attrib.name);
            }
        }
    }
    return d.innerHTML;
}

function stripTags(input, allowed) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = (((allowed !== undefined ? allowed || '' : defaultAllowed) + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

    var before = input;
    var after = input;
    // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
    while (true) {
        before = after;
        after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
        // return once no more tags are removed
        if (before === after) {
            return after;
        }
    }
}
