/**
 * Returns a new string containing all elements of arrayOfStrings
 * where duplicate strings are made unique by appended indices.
 * @param keys
 */
export default function makeUnique(keys: string[]) {
    const keySet = new Set();
    return keys.map(key => {
        let uniqueKey = key;
        let index = 0;
        while (keySet.has(uniqueKey)) {
            uniqueKey = `${key}_${++index}`;
        }
        keySet.add(uniqueKey);
        return uniqueKey;
    });
}
