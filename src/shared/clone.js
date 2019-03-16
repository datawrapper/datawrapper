export default function clone(o) {
    if (!o || typeof o !== 'object') return o;
    try {
        return JSON.parse(JSON.stringify(o));
    } catch (e) {
        return o;
    }
}
