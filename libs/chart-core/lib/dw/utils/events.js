/**
 * simple event callbacks, mimicking the $.Callbacks API
 */
export default function events() {
    const list = [];

    return {
        fire() {
            for (var i = list.length - 1; i >= 0; i--) {
                list[i].apply(this, arguments);
            }
        },
        add(callback) {
            list.push(callback);
        }
    };
}
