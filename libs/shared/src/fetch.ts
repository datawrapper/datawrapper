import { getValueOrDefault } from './getValueOrDefault';

// `any` is more appropriate than `unknown`, just like for JSON.parse
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (res: any) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResultPromise = Promise<any>;

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
export function fetchJSON(
    url: string,
    method: string,
    credentials: RequestCredentials | undefined,
    body: string | null,
    callback?: Callback
) {
    const opts = {
        method,
        body,
        mode: 'cors' as const,
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
 * @param {function} callback
 *
 * @returns {Promise}
 *
 * @example
 * import { getJSON } from '@datawrapper/shared/fetch';
 * // use it callback style
 * getJSON('http://api.example.org', function(data) {
 *     console.log(data);
 * });
 * // or promise-style
 * getJSON('http://api.example.org')
 *   .then(data => {
 *      console.log(data);
 *   });
 */
function getJSON(url: string, callback: Callback): ResultPromise;
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
function getJSON(url: string, credentials?: RequestCredentials, callback?: Callback): ResultPromise;
function getJSON(
    url: string,
    inputCredentials?: RequestCredentials | Callback,
    inputCallback?: Callback
) {
    let credentials: RequestCredentials;
    let callback: Callback | undefined;
    if (arguments.length === 2 && typeof inputCredentials === 'function') {
        // swap callback and assume default credentials
        callback = inputCredentials;
        credentials = 'include';
    } else if (arguments.length === 1) {
        callback = undefined;
        credentials = 'include';
    } else {
        callback = inputCallback;
        credentials = inputCredentials as RequestCredentials;
    }
    return fetchJSON(url, 'GET', credentials, null, callback);
}
export { getJSON };

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
export function postJSON(url: string, body: string, callback?: Callback) {
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
export function putJSON(url: string, body: string, callback?: Callback) {
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
export function patchJSON(url: string, body: string, callback?: Callback) {
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
export function deleteJSON(url: string, callback?: Callback) {
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
export function loadScript(src: string, callback: (() => void) | null = null) {
    return new Promise<void>((resolve, reject) => {
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
type LoadStylesheetOptions = {
    src: string;
    parentElement?: HTMLElement;
};

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
export function loadStylesheet(
    _opts: string | LoadStylesheetOptions,
    callback: (() => void) | null = null
) {
    if (typeof _opts === 'string') {
        _opts = {
            src: _opts
        };
    }
    const opts = _opts;

    const targetElement = getValueOrDefault(
        opts.parentElement,
        element => typeof element.appendChild === 'function',
        () => document.head
    );

    return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = opts.src;
        link.onload = () => {
            if (callback) callback();
            resolve();
        };
        link.onerror = reject;
        targetElement.appendChild(link);
    });
}
