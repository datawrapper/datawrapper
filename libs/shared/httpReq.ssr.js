import fetch from 'node-fetch';
import httpReqClient from './httpReq';

export default function httpReq(path, options = {}) {
    return httpReqClient(path, {
        ...options,
        fetch,
        disableCSFR: true
    });
}

export const get = (httpReq.get = httpReqVerb('GET'));
export const patch = (httpReq.patch = httpReqVerb('PATCH'));
export const put = (httpReq.put = httpReqVerb('PUT'));
export const post = (httpReq.post = httpReqVerb('POST'));
export const head = (httpReq.head = httpReqVerb('HEAD'));
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
