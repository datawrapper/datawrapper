import Cookies from 'js-cookie';
import { BrowserWindow } from './browserGlobals';
import { getValueOrDefault } from './getValueOrDefault';
import { HttpReqOptions, SimpleFetchResponse } from './httpReqOptions';
import { keyExists } from './l10n';

declare global {
    // This is not a new meaningless interface;
    // we extend an existing built-in Window interface with our globals
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Window extends BrowserWindow {}
}

const CSRF_COOKIE_NAME = 'crumb';
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']); // according to RFC7231

const TRANSLATION_KEY_SEPARATOR = ' / ';

/**
 * The response body is automatically parsed according
 * to the response content type.
 *
 * @exports httpReq
 * @kind function
 *
 * @param {string} path                - the url path that gets appended to baseUrl
 * @param {object} options.body        - raw body to be send with req
 * @param {object} options.payload     - raw JSON payload to be send with req (will overwrite options.body)
 * @param {boolean} options.raw        - disable parsing of response body, returns raw response
 * @param {string} options.baseUrl     - base for url, defaults to dw api domain
 * @param {string} options.disableCSRF - set to true to disable CSRF cookies
 * @param {*} options.*                - additional options for window.fetch or node-fetch
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
function httpReq(
    path: string,
    { fetch: inputFetch, baseUrl: inputBaseUrl, ...options }: HttpReqOptions = {}
) {
    const fetch = getValueOrDefault(
        inputFetch,
        () => true,
        () => {
            try {
                const result = window.fetch;
                if (!result) throw new Error();
                return result;
            } catch (e) {
                throw new Error('Neither options.fetch nor window.fetch is defined.');
            }
        }
    );

    const baseUrl = getValueOrDefault(
        inputBaseUrl,
        () => true,
        () => {
            const apiDomain = window.dw.backend.__api_domain;
            if (!apiDomain) {
                throw new Error('Neither options.baseUrl nor window.dw is defined.');
            }

            return apiDomain.startsWith('http') ? apiDomain : `//${apiDomain}`;
        }
    );

    const { payload, raw, ...opts } = {
        payload: null,
        raw: false,
        method: 'GET',
        mode: 'cors' as const,
        credentials: 'include' as const,
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        } as Record<string, string>
    };
    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    if (payload) {
        // overwrite body
        opts.body = JSON.stringify(payload);
    }
    if (opts.headers['Content-Type'].startsWith('multipart/')) {
        // removing 'Content-Type' will ensure that fetch
        // sets the correct content type and boundary parameter
        delete opts.headers['Content-Type'];
    }

    let promise: Promise<SimpleFetchResponse>;
    if (!opts.disableCSRF && !CSRF_SAFE_METHODS.has(opts.method.toLowerCase())) {
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
                .catch(() => {
                    // Ignore errors from /v3/me. It probably means the user is not logged in.
                })
                .then(async () => await fetch(url, opts));
        }
    } else {
        promise = fetch(url, opts);
    }

    // The variable `promise` and the repeated `fetch(url, opts)` could be replaced with `await
    // httpReq('/v3/me'...)`, but then we would need to configure babel to transform async/await for
    // all repositories that use @datawrapper/shared.

    return promise.then(res => {
        if (raw) {
            return res;
        }
        if (!res.ok) {
            return res.json().then(json => {
                throw new HttpReqError(res, json);
            });
        }
        if (res.status === 204 || !res.headers.get('content-type')) {
            // no content
            return res;
        }
        // trim away the ;charset=utf-8 from content-type
        const contentType = (res.headers.get('content-type') || '').split(';')[0];
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
httpReq.get = httpReqVerb('GET');

/**
 * Like `httpReq` but with fixed http method PATCH
 * @see {@link httpReq}
 *
 * @exports httpReq.patch
 * @kind function
 */
httpReq.patch = httpReqVerb('PATCH');

/**
 * Like `httpReq` but with fixed http method PUT
 * @see {@link httpReq}
 *
 * @exports httpReq.put
 * @kind function
 */
httpReq.put = httpReqVerb('PUT');

/**
 * Like `httpReq` but with fixed http method POST
 * @see {@link httpReq}
 *
 * @exports httpReq.post
 * @kind function
 */
httpReq.post = httpReqVerb('POST');

/**
 * Like `httpReq` but with fixed http method HEAD
 * @see {@link httpReq}
 *
 * @exports httpReq.head
 * @kind function
 */
httpReq.head = httpReqVerb('HEAD');

/**
 * Like `httpReq` but with fixed http method DELETE
 * @see {@link httpReq}
 *
 * @exports httpReq.delete
 * @kind function
 */
httpReq.delete = httpReqVerb('DELETE');

function httpReqVerb(method: string) {
    return (path: string, options: Omit<HttpReqOptions, 'method'>) => {
        if (options && (options as HttpReqOptions).method) {
            throw new Error(
                `Setting option.method is not allowed in httpReq.${method.toLowerCase()}()`
            );
        }
        return httpReq(path, { ...options, method });
    };
}

type ErrorInfo = {
    type: string;
    details?: {
        path: string;
        type?: string;
    }[];
};

class HttpReqError extends Error {
    status: number;
    statusText: string;
    message: string;
    response: SimpleFetchResponse;
    type?: string;
    translationKey?: string;
    details?: {
        path: string;
        type?: string;
        translationKey?: string;
    }[];

    constructor(res: SimpleFetchResponse, json?: ErrorInfo) {
        super();
        this.name = 'HttpReqError';
        this.status = res.status;
        this.statusText = res.statusText;
        this.message = `[${res.status}] ${res.statusText}`;
        this.response = res;

        // Prevent "TypeError: body used already for" when calling `await this.response.json()`.
        this.response.json = () => Promise.resolve(json);

        // Parse response `json` into `this.type` and `this.details` and add translation keys.
        if (json) {
            this.type = json.type;
            if (this.type && keyExists(this.type)) {
                this.translationKey = this.type;
            }
            this.details = json.details;
            if (Array.isArray(this.details)) {
                this.details.forEach(detail => {
                    if (detail && detail.type) {
                        const translationKey = [this.type, detail.type].join(
                            TRANSLATION_KEY_SEPARATOR
                        );
                        if (keyExists(translationKey)) {
                            detail.translationKey = translationKey;
                        }
                    }
                });
            }
        }
    }
}

httpReq.HttpReqError = HttpReqError;

export = httpReq;
