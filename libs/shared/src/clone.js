/**
 * Clones an object
 *
 * @exports clone
 * @kind function
 *
 * @param {*} object - the thing that should be cloned
 * @returns {*} - the cloned thing
 */
export default function clone(o) {
    if (!o || typeof o !== 'object') return o;
    try {
        return JSON.parse(JSON.stringify(o));
    } catch (e) {
        return o;
    }
}
