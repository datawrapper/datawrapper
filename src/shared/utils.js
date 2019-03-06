import _isArray from 'underscore-es/isArray';

export function fetchJSON(url, method, credentials, body, callback) {
    var opts = {
        method,
        body,
        mode: 'cors',
        credentials
    };

    window
        .fetch(url, opts)
        .then(res => {
            if (res.status !== 200) return new Error(res.statusText);
            return res.text();
        })
        .then(text => {
            // console.log('status', res);
            try {
                return JSON.parse(text);
            } catch (Error) {
                // could not parse json, so just return text
                console.warn('malformed json input', text);
                return text;
            }
        })
        .then(callback)
        .catch(err => {
            console.error(err);
        });
}

export function getJSON(url, credentials, callback) {
    if (arguments.length === 2) {
        callback = credentials;
        credentials = 'include';
    }

    return fetchJSON(url, 'GET', credentials, null, callback);
}
export function postJSON(url, body, callback) {
    return fetchJSON(url, 'POST', 'include', body, callback);
}
export function putJSON(url, body, callback) {
    return fetchJSON(url, 'PUT', 'include', body, callback);
}
export function deleteJSON(url, callback) {
    return fetchJSON(url, 'DELETE', 'include', null, callback);
}

/**
 * Converts an array with properties back to a normal object.
 *
 * @description
 * This function fixes an uglyness when working with PHP backends.
 * in PHP, there is no distiction between arrays and objects, so
 * PHP converts an empty object {} to a empty array [].
 *
 * When this empty array then ends up in client-side JS functions which
 * might start to assign values to the array using `arr.foo = "bar"`
 * which results in a data structure like this:
 *
 * >> arr
 * []
 *   foo: "bar"
 *   length: 0
 *   <prototype>: Array []
 *
 * to convert this structure back to a proper object you can use
 * this `arrayToObject` function.
 * >> arrayToObject(arr)
 * Object { foo: "bar" }
 *
 * @param {array} o
 * @returns {object}
 */
export function arrayToObject(o) {
    if (_isArray(o)) {
        const obj = {};
        Object.keys(o).forEach(k => (obj[k] = o[k]));
        return obj;
    }
    return o;
}

/**
 * returns the length of the "tail" of a number, meaning the
 * number of meaningful decimal places
 *
 * @example
 * // returns 3
 * tailLength(3.123)
 *
 * @example
 * // returns 2
 * tailLength(3.12999999)
 *
 * @param {number} value
 * @returns {number}
 */
export function tailLength(value) {
    return Math.max(
        0,
        String(value - Math.floor(value))
            .replace(/00000*[0-9]+$/, '')
            .replace(/99999*[0-9]+$/, '').length - 2
    );
}

/**
 * automatically converts a numeric value to a string. this is better
 * than the default number to string conversion in JS which sometimes
 * produces ugly strings like "3.999999998"
 *
 * @example
 * // returns '3.1'
 * toFixed(3.100001)
 *
 * @param {number} value
 * @returns {string}
 */
export function toFixed(value) {
    return (+value).toFixed(tailLength(value));
}

/**
 * checks if a given string is a valid URL
 *
 * @param {string} input
 * @returns {boolean}
 */
export function isValidUrl(input) {
    var urlregex = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=/?]|%[0-9a-fA-F]{2})*)?(#([a-zA-Z0-9$\-_.+!*'(),;:@&=/?]|%[0-9a-fA-F]{2})*)?)?$/;
    return urlregex.test(input);
}

/**
 * injects a <script> element to the page to load a new JS script
 *
 * @param {string} src
 * @param {function} callback
 */
export function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
        if (callback) callback();
    };
    document.body.appendChild(script);
}

/**
 * injects a <link> element to the page to load a new stylesheet
 *
 * @param {string} src
 * @param {function} callback
 */
export function loadStylesheet(src, callback) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src;
    link.onload = () => {
        if (callback) callback();
    };
    document.head.appendChild(link);
}
