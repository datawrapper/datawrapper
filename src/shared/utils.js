import _isArray from 'underscore-es/isArray';

function fetchJSON(url, method, body, callback) {
    window.fetch(url, {
        credentials: 'include',
        method: method,
        mode: 'cors',
        body: body
    })
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

export function getJSON(url, callback) { return fetchJSON(url, 'GET', null, callback); }
export function postJSON(url, body, callback) { return fetchJSON(url, 'POST', body, callback); }
export function putJSON(url, body, callback) { return fetchJSON(url, 'PUT', body, callback); }

export function arrayToObject(o) {
    if (_isArray(o)) {
        const obj = {};
        Object.keys(o).forEach(k => obj[k] = o[k]);
        return obj;
    }
    return o;
}
