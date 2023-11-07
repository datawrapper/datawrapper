import fetch from 'node-fetch';
import httpReqClient from './httpReq.js';
import { HttpReqOptions, SimpleFetch } from './httpReqOptions.js';

function httpReq(path: string, options: Omit<HttpReqOptions, 'fetch' | 'disableCSRF'> = {}) {
    return httpReqClient(path, {
        ...options,
        fetch: fetch as unknown as SimpleFetch, // TODO Fix the types instead of casting.
        disableCSRF: true
    });
}

httpReq.get = httpReqVerb('GET');
httpReq.patch = httpReqVerb('PATCH');
httpReq.put = httpReqVerb('PUT');
httpReq.post = httpReqVerb('POST');
httpReq.head = httpReqVerb('HEAD');
httpReq.delete = httpReqVerb('DELETE');

function httpReqVerb(method: string) {
    return (path: string, options: HttpReqOptions) => {
        if (options && options.method) {
            throw new Error(
                `Setting option.method is not allowed in httpReq.${method.toLowerCase()}()`
            );
        }
        return httpReq(path, { ...options, method });
    };
}

export default httpReq;
