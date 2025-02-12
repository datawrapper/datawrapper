/**
 *  Treats probablyArray as an array and returns the value at the given index.
 *  If probablyArray is not an array or the index is out of bounds, it returns undefined.
 */
export function getValueFromArray(probablyArray: unknown[] | unknown, index: number) {
    if (!Array.isArray(probablyArray)) return undefined;
    try {
        return (probablyArray as unknown[])[index];
    } catch (e) {
        return undefined;
    }
}
