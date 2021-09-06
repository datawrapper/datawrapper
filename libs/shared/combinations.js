/**
 * computes all combinations of input elements
 *
 * @exports combinations
 * @kind function
 *
 * @example
 * // returns [['a','b'], ['a'], ['b']]
 * combinations(['a', 'b']);
 *
 * @example
 * // returns [[1,2,3], [1,2], [1,3], [1], [2,3], [2], [3]]
 * combinations([1,2,3])

 * @param {array[]} input -- array of input objects, could be numbers, strings, etc
 * @returns {array[]} -- array of combinations
 */
export default function combinations(input) {
    var fn = function (active, rest, a) {
        if (!active.length && !rest.length) return;
        if (!rest.length) {
            a.push(active);
        } else {
            fn(active.concat(rest[0]), rest.slice(1), a);
            fn(active, rest.slice(1), a);
        }
        return a;
    };
    return fn([], input, []);
}
