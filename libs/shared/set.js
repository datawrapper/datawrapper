/**
 * safely set object properties without throwing nasty
 * `cannot access X of undefined` errors if a property along the
 * way doesn't exist.
 *
 * @exports set
 * @kind function
 *
 * @param object - the object which properties you want to acccess
 * @param {String|String[]} key - path to the property as a dot-separated string or array of strings
 * @param {*} value - the value to be set
 *
 * @returns the value
 */
export default function set(object, key, value) {
    const keys = Array.isArray(key) ? key : key.split('.');
    const lastKey = keys.pop();
    let pt = object;

    // resolve property until the parent dict
    keys.forEach(key => {
        if (pt[key] === undefined || pt[key] === null) {
            pt[key] = {};
        }
        pt = pt[key];
    });

    // check if new value is set
    if (JSON.stringify(pt[lastKey]) !== JSON.stringify(value)) {
        pt[lastKey] = value;
        return true;
    }
    return false;
}
