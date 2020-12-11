define(function () {
    var CSRF_COOKIE_NAME = 'crumb';
    var CSRF_TOKEN_HEADER = 'X-CSRF-Token';
    var CSRF_SAFE_METHODS = ['get', 'head', 'options', 'trace']; // according to RFC7231

    /**
     * An implementation of httpReq compatible with IE 11.
     *
     * Differences from httpReq:
     *
     * - Uses jQuery to infer the type of the response data.
     * - Returns jQuery.Deferred instead of Promise.
     * - Returns jQuery XMLHttpRequest object instead of Response.
     *
     * @see https://github.com/datawrapper/shared/blob/master/httpReq.js
     */
    function httpReq(path, options) {
        var baseUrl = options.baseUrl || '//' + dw.backend.__api_domain;
        var method = options.method || 'GET';
        var headers = Object.assign({}, options.headers);
        if (headers['Content-Type'] === undefined && !options.formData) {
            headers['Content-Type'] = 'application/json';
        }

        var deferred = $.Deferred();
        deferred.resolve();
        if (CSRF_SAFE_METHODS.indexOf(method.toLowerCase()) === -1) {
            var csrfCookieValue = getCookie(CSRF_COOKIE_NAME);
            if (csrfCookieValue) {
                headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
            } else {
                httpReq('/v3/me', { baseUrl: baseUrl })
                    .then(function () {
                        var csrfCookieValue = getCookie(CSRF_COOKIE_NAME);
                        if (csrfCookieValue) {
                            headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
                        }
                    })
                    .always(function () {
                        deferred.resolve();
                    });
            }
        }

        return deferred
            .then(function () {
                return $.ajax({
                    url: [baseUrl.replace(/\/$/, ''), path.replace(/^\//, '')].join('/'),
                    type: method,
                    headers: headers,
                    contentType: options.formData ? false : headers['Content-Type'],
                    context: this,
                    crossDomain: !options.mode || options.mode === 'cors',
                    data:
                        options.formData ||
                        options.data ||
                        (options.payload && JSON.stringify(options.payload)),
                    processData:
                        options.processData !== undefined ? options.processData : !options.formData,
                    xhrFields: {
                        withCredentials: !options.credential || options.credentials === 'include'
                    }
                });
            })
            .then(function (data, textStatus, jqXhr) {
                if (options.raw) {
                    return jqXhr;
                }
                if (jqXhr.status < 200 || jqXhr.status > 299) {
                    return $.Deferred().fail(new HttpReqError(jqXhr));
                }
                if (jqXhr.status === 204 || !jqXhr.getResponseHeader('Content-Type')) {
                    return jqXhr; // no content
                }
                return data;
            });
    }

    var get = (httpReq.get = httpReqVerb('GET'));

    var patch = (httpReq.patch = httpReqVerb('PATCH'));

    var put = (httpReq.put = httpReqVerb('PUT'));

    var post = (httpReq.post = httpReqVerb('POST'));

    var head = (httpReq.head = httpReqVerb('HEAD'));

    httpReq.delete = httpReqVerb('DELETE');

    function httpReqVerb(method) {
        return function (path, options) {
            if (options && options.method) {
                throw new Error(
                    'Setting option.method is not allowed in httpReq.' + method.toLowerCase() + '()'
                );
            }
            return httpReq(path, Object.assign(options || {}, { method: method }));
        };
    }

    function HttpReqError(jqXhr) {
        this.name = 'HttpReqError';
        this.status = jqXhr.status;
        this.statusText = jqXhr.statusText;
        this.message = '[' + jqXhr.status + '] ' + jqXhr.statusText;
        this.response = jqXhr.response;
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
        head: head,
        delete: httpReq.delete
    };
});
