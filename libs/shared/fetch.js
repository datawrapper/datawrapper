/**
 * Download and parse a remote JSON document. Use {@link httpReq} instead
 *
 * @deprecated
 *
 * @param {string} url
 * @param {string} method - HTTP method, either GET, POST or PUT
 * @param {string|undefined} credentials - set to "include" if cookies should be passed along CORS requests
 * @param {string} body
 * @param {function} callback
 *
 * @returns {Promise}
 *
 * @example
 * import { fetchJSON } from '@datawrapper/shared/fetch';
 * fetchJSON('http://api.example.org', 'GET', 'include');
 */
export function fetchJSON(url, method, credentials, body, callback) {
    var opts = {
        method,
        body,
        mode: 'cors',
        credentials
    };

    return window
        .fetch(url, opts)
        .then(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.text();
        })
        .then(text => {
            try {
                return JSON.parse(text);
            } catch (Error) {
                // could not parse json, so just return text
                console.warn('malformed json input', text);
                return text;
            }
        })
        .then(res => {
            if (callback) callback(res);
            return res;
        })
        .catch(err => {
            if (callback) {
                console.error(err);
            } else {
                throw err;
            }
        });
}

/**
 * Download and parse a JSON document via GET.
 * Use {@link httpReq} or {@link httpReq.get} instead.
 *
 * @deprecated
 *
 * @param {string} url
 * @param {string|undefined} credentials - optional, set to undefined to disable credentials
 * @param {function} callback
 *
 * @returns {Promise}
 *
 * @example
 * import { getJSON } from '@datawrapper/shared/fetch';
 * // use it callback style
 * getJSON('http://api.example.org', 'include', function(data) {
 *     console.log(data);
 * });
 * // or promise-style
 * getJSON('http://api.example.org')
 *   .then(data => {
 *      console.log(data);
 *   });
 */
export function getJSON(url, credentials, callback) {
    if (arguments.length === 2 && typeof credentials === 'function') {
        // swap callback and assume default credentials
        callback = credentials;
        credentials = 'include';
    } else if (arguments.length === 1) {
        credentials = 'include';
    }
    return fetchJSON(url, 'GET', credentials, null, callback);
}

/**
 * Download and parse a remote JSON endpoint via POST. credentials
 * are included automatically.
 * Use {@link httpReq} or {@link httpReq.post} instead.
 *
 * @deprecated
 *
 * @param {string} url
 * @param {string} body
 * @param {function} callback
 *
 * @returns {Promise}
 * @example
 * import { postJSON } from '@datawrapper/shared/fetch';
 *
 * postJSON('http://api.example.org', JSON.stringify({
 *    query: 'foo',
 *    page: 12
 * }));
 */
export function postJSON(url, body, callback) {
    return fetchJSON(url, 'POST', 'include', body, callback);
}

/**
 * Download and parse a remote JSON endpoint via PUT. credentials
 * are included automatically
 * Use {@link httpReq} or {@link httpReq.put} instead.
 *
 * @deprecated
 *
 * @param {string} url
 * @param {string} body
 * @param {function} callback
 *
 * @returns {Promise}
 * @example
 * import { putJSON } from '@datawrapper/shared/fetch';
 *
 * putJSON('http://api.example.org', JSON.stringify({
 *    query: 'foo',
 *    page: 12
 * }));
 */
export function putJSON(url, body, callback) {
    return fetchJSON(url, 'PUT', 'include', body, callback);
}

/**
 * @deprecated use httpReq or httpReq.patch instead
 *
 * Download and parse a remote JSON endpoint via PATCH. credentials
 * are included automatically
 *
 * @param {string} url
 * @param {string} body
 * @param {function} callback
 *
 * @returns {Promise}
 * @example
 * import { patchJSON } from '@datawrapper/shared/fetch';
 *
 * patchJSON('http://api.example.org', JSON.stringify({
 *    query: 'foo',
 *    page: 12
 * }));
 */
export function patchJSON(url, body, callback) {
    return fetchJSON(url, 'PATCH', 'include', body, callback);
}

/**
 * Download and parse a remote JSON endpoint via DELETE. credentials
 * are included automatically
 * Use {@link httpReq} or {@link httpReq.delete} instead.
 *
 * @deprecated
 *
 * @param {string} url
 * @param {function} callback
 *
 * @returns {Promise}
 *
 * @example
 * import { deleteJSON } from '@datawrapper/shared/fetch';
 *
 * deleteJSON('http://api.example.org/chart/123').then(() => {
 *     console.log('deleted!')
 * });
 */
export function deleteJSON(url, callback) {
    return fetchJSON(url, 'DELETE', 'include', null, callback);
}

/**
 * injects a `<script>` element to the page to load a new JS script
 *
 * @param {string} src
 * @param {function} callback
 *
 * @example
 * import { loadScript } from '@datawrapper/shared/fetch';
 *
 * loadScript('/static/js/library.js', () => {
 *     console.log('library is loaded');
 * })
 */
export function loadScript(src, callback = null) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            if (callback) callback();
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

/**
 * @typedef {object} opts
 * @property {string} src - stylesheet URL to load
 * @property {DOMElement} parentElement - DOM element to append style tag to
 */

/**
 * injects a `<link>` element to the page to load a new stylesheet
 *
 * @param {string|opts} src
 * @param {function} callback
 *
 * @example
 * import { loadStylesheet } from '@datawrapper/shared/fetch';
 *
 * loadStylesheet('/static/css/library.css', () => {
 *     console.log('library styles are loaded');
 * })
 */
export function loadStylesheet(opts, callback = null) {
    if (typeof opts === 'string') {
        opts = {
            src: opts
        };
    }

    if (!opts.parentElement || typeof opts.parentElement.appendChild !== 'function') {
        opts.parentElement = document.head;
    }

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = opts.src;
        link.onload = () => {
            if (callback) callback();
            resolve();
        };
        link.onerror = reject;
        opts.parentElement.appendChild(link);
    });
}
