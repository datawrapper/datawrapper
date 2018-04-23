import _isArray from 'underscore-es/isArray';

function fetchJSON(url, method, credentials, body, callback) {
    var opts = {
        method: method,
        mode: 'cors',
        body: body
    };

    opts.credentials = credentials;

    window.fetch(url, opts)
    .then((res) => {
        // console.log('status', res);
        if (res.status != 200) return new Error(res.statusText);
        try {
            return res.json();
        } catch (Error) {
            // could not parse json, so just return text
            return res.text();
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
