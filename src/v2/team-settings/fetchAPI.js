import { getJSON } from '@datawrapper/shared/fetch';

/* globals dw */
export default function(route) {
    return getJSON(`${window.location.protocol}//${dw.backend.__api_domain}${route}`, 'include');
}
