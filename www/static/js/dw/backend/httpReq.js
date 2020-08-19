/* global define, dw */

define(function () {
    /**
     * The response body is automatically parsed according
     * to the response content type.
     *
     * @exports httpReq
     * @kind function
     *
     * @param {string} path               - the url path that gets appended to baseUrl
     * @param {object} options.payload    - payload to be send with req
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
     */
    function httpReq(
        path,
        options = {},
        csrfCookieName = 'crumb',
        csrfTokenHeader = 'X-CSRF-Token',
        csrfSafeMethods = ['get', 'head', 'options', 'trace'] // according to RFC7231
    ) {
        var opts = Object.assign(
            {
                payload: null,
                raw: false,
                method: 'GET',
                baseUrl: '//' + dw.backend.__api_domain,
                mode: 'cors',
                credentials: 'include'
            },
            options
        );
        opts.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers);

        if (csrfSafeMethods.indexOf(opts.method.toLowerCase()) === -1) {
            opts.headers[csrfTokenHeader] = getCookie(csrfCookieName);
        }
        var url = [opts.baseUrl.replace(/\/$/, ''), path.replace(/^\//, '')].join('/');
        if (opts.payload) {
            // overwrite body
            opts.body = JSON.stringify(opts.payload);
        }
        delete opts.payload;
        delete opts.baseUrl;
        var raw = opts.raw;
        delete opts.raw;
        return window.fetch(url, opts).then(function (res) {
            if (raw) return res;
            if (!res.ok) throw new HttpReqError(res);
            if (res.status === 204 || !res.headers.get('content-type')) return res; // no content
            // trim away the ;charset=utf-8 from content-type
            var contentType = res.headers.get('content-type').split(';')[0];
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
    var get = (httpReq.get = httpReqVerb('GET'));

    /**
     * Like `httpReq` but with fixed http method PATCH
     * @see {@link httpReq}
     *
     * @exports httpReq.patch
     * @kind function
     */
    var patch = (httpReq.patch = httpReqVerb('PATCH'));

    /**
     * Like `httpReq` but with fixed http method PUT
     * @see {@link httpReq}
     *
     * @exports httpReq.put
     * @kind function
     */
    var put = (httpReq.put = httpReqVerb('PUT'));

    /**
     * Like `httpReq` but with fixed http method POST
     * @see {@link httpReq}
     *
     * @exports httpReq.post
     * @kind function
     */
    var post = (httpReq.post = httpReqVerb('POST'));

    /**
     * Like `httpReq` but with fixed http method HEAD
     * @see {@link httpReq}
     *
     * @exports httpReq.head
     * @kind function
     */
    var head = (httpReq.head = httpReqVerb('HEAD'));

    /**
     * Like `httpReq` but with fixed http method DELETE
     * @see {@link httpReq}
     *
     * @exports httpReq.delete
     * @kind function
     */
    httpReq.delete = httpReqVerb('DELETE');

    function httpReqVerb(method) {
        return function (path, options) {
            if (options && options.method) {
                throw new Error(
                    'Setting option.method is not allowed in httpReq.' + method.toLowerCase() + '()'
                );
            }
            return httpReq(path, Object.assign(options, { method: method }));
        };
    }

    function HttpReqError(res) {
        this.name = 'HttpReqError';
        this.status = res.status;
        this.statusText = res.statusText;
        this.message = '[' + res.status + '] ' + res.statusText;
        this.response = res;
    }

    HttpReqError.prototype = new Error();

    /**
     * @see https://docs.djangoproject.com/en/3.1/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
     */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === name + '=') {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    return {
        httpReq: httpReq,
        get: get,
        patch: patch,
        put: put,
        post: post,
        head: head
    };
});
