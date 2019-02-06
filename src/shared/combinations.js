export default function(arr) {
    var fn = function(active, rest, a) {
        if (!active.length && !rest.length) return;
        if (!rest.length) {
            a.push(active);
        } else {
            fn(active.concat(rest[0]), rest.slice(1), a);
            fn(active, rest.slice(1), a);
        }
        return a;
    };
    return fn([], arr, []);
}
