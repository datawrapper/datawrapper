import Cookies from 'js-cookie';

const CSRF_COOKIE_NAME = 'crumb';
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']); // according to RFC7231

/**
 * The response body is automatically parsed according
 * to the response content type.
 *
 * @exports httpReq
 * @kind function
 *
 * @param {string} path               - the url path that gets appended to baseUrl
 * @param {object} options.body       - raw body to be send with req
 * @param {object} options.payload    - raw JSON payload to be send with req (will overwrite options.body)
 * @param {boolean} options.raw       - disable parsing of response body, returns raw response
 * @param {string} options.baseUrl    - base for url, defaults to dw api domain
 * @param {*} options                 - see documentation for window.fetch for additional options
 *
 * @returns {Promise} promise of parsed response body or raw response
 *
 * @example
 *  import httpReq from '@datawrapper/shared/httpReq';
 *  let res = await httpReq('/v3/charts', {
 *      method: 'post',
 *      payload: {
 *          title: 'My new chart'
 *      }
 *  });
 *  import { post } from '@datawrapper/shared/httpReq';
 *  res = await post('/v3/charts', {
 *      payload: {
 *          title: 'My new chart'
 *      }
 *  });
 *  // send raw csv
 *  await httpReq.put(`/v3/charts/${chartId}/data`, {
 *       body: csvData,
 *       headers: {
 *           'Content-Type': 'text/csv'
 *       }
 *   });
 */
export default function httpReq(path, options = {}) {
    if (!options.fetch) {
        try {
            options.fetch = window.fetch;
        } catch (e) {
            throw new Error('Neither options.fetch nor window.fetch is defined.');
        }
    }
    if (!options.baseUrl) {
        try {
            options.baseUrl = `//${window.dw.backend.__api_domain}`;
        } catch (e) {
            throw new Error('Neither options.baseUrl nor window.dw is defined.');
        }
    }
    const { payload, baseUrl, fetch, raw, ...opts } = {
        payload: null,
        raw: false,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    if (payload) {
        // overwrite body
        opts.body = JSON.stringify(payload);
    }

    let promise;
    if (!CSRF_SAFE_METHODS.has(opts.method.toLowerCase())) {
        const csrfCookieValue = Cookies.get(CSRF_COOKIE_NAME);
        if (csrfCookieValue) {
            opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
            promise = fetch(url, opts);
        } else {
            promise = httpReq('/v3/me', { fetch, baseUrl })
                .then(() => {
                    const csrfCookieValue = Cookies.get(CSRF_COOKIE_NAME);
                    if (csrfCookieValue) {
                        opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
                    }
                })
                .catch(() => {}) // Ignore errors from /v3/me. It probably means the user is not logged in.
                .then(() => fetch(url, opts));
        }
    } else {
        promise = fetch(url, opts);
    }
    // The variable `promise` and the repeated `fetch(url, opts)` could be replaced with `await
    // httpReq('/v3/me'...)`, but then we would need to configure babel to transform async/await for
    // all repositories that use @datawrapper/shared.

    return promise.then(res => {
        if (raw) return res;
        if (!res.ok) throw new HttpReqError(res);
        if (res.status === 204 || !res.headers.get('content-type')) return res; // no content
        // trim away the ;charset=utf-8 from content-type
        const contentType = res.headers.get('content-type').split(';')[0];
        if (contentType === 'application/json') {
            return res.json();
        }
        if (contentType === 'image/png' || contentType === 'application/pdf') {
            return res.blob();
        }
        // default to text for all other content types
        return res.text();
    });
}

/**
 * Like `httpReq` but with fixed http method GET
 * @see {@link httpReq}
 *
 * @exports httpReq.get
 * @kind function
 */
export const get = (httpReq.get = httpReqVerb('GET'));

/**
 * Like `httpReq` but with fixed http method PATCH
 * @see {@link httpReq}
 *
 * @exports httpReq.patch
 * @kind function
 */
export const patch = (httpReq.patch = httpReqVerb('PATCH'));

/**
 * Like `httpReq` but with fixed http method PUT
 * @see {@link httpReq}
 *
 * @exports httpReq.put
 * @kind function
 */
export const put = (httpReq.put = httpReqVerb('PUT'));

/**
 * Like `httpReq` but with fixed http method POST
 * @see {@link httpReq}
 *
 * @exports httpReq.post
 * @kind function
 */
export const post = (httpReq.post = httpReqVerb('POST'));

/**
 * Like `httpReq` but with fixed http method HEAD
 * @see {@link httpReq}
 *
 * @exports httpReq.head
 * @kind function
 */
export const head = (httpReq.head = httpReqVerb('HEAD'));

/**
 * Like `httpReq` but with fixed http method DELETE
 * @see {@link httpReq}
 *
 * @exports httpReq.delete
 * @kind function
 */
httpReq.delete = httpReqVerb('DELETE');

function httpReqVerb(method) {
    return (path, options) => {
        if (options && options.method) {
            throw new Error(
                `Setting option.method is not allowed in httpReq.${method.toLowerCase()}()`
            );
        }
        return httpReq(path, { ...options, method });
    };
}

class HttpReqError extends Error {
    constructor(res) {
        super();
        this.name = 'HttpReqError';
        this.status = res.status;
        this.statusText = res.statusText;
        this.message = `[${res.status}] ${res.statusText}`;
        this.response = res;
    }
}
