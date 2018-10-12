import _isArray from 'underscore-es/isArray';

export function fetchJSON(url, method, credentials, body, callback) {
    var opts = {
        method, body,
        mode: 'cors',
        credentials
    };

    window.fetch(url, opts)
    .then(res => {
        if (res.status != 200) return new Error(res.statusText);
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
    .catch((err) => {
        console.error(err);
    });
}

export function getJSON(url, credentials, callback) {
    if (arguments.length == 2) {
        callback = credentials;
        credentials = "include";
    }

    return fetchJSON(url, 'GET', credentials, null, callback);
}
export function postJSON(url, body, callback) { return fetchJSON(url, 'POST', "include", body, callback); }
export function putJSON(url, body, callback) { return fetchJSON(url, 'PUT', "include", body, callback); }
export function deleteJSON(url, callback) { return fetchJSON(url, 'DELETE', "include", null, callback); }

export function arrayToObject(o) {
    if (_isArray(o)) {
        const obj = {};
        Object.keys(o).forEach(k => obj[k] = o[k]);
        return obj;
    }
    return o;
}

export function tailLength(v) {
    return (String(v - Math.floor(v)).replace(/00000*[0-9]+$/, '').replace(/99999*[0-9]+$/, '')).length - 2;
}

export function toFixed(v) {
    return (+v).toFixed(Math.max(0, tailLength(v)));
}

export function isValidUrl(textval) {
    var urlregex = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/;
    return urlregex.test(textval);
}

export function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
        console.log('script', src, 'loaded');
        if (callback) callback();
    };
    document.body.appendChild(script);
}

export function loadStylesheet(src, callback) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src;
    link.onload = () => {
        console.log('style', src, 'loaded');
        if (callback) callback();
    };
    document.head.appendChild(link);
}
