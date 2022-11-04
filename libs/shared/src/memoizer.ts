export const createPermanentMemoizer = <TKey, TSerializedKey, TValue>(
    keySerializer: (key: TKey) => TSerializedKey,
    valueCreator: (key: TKey) => TValue,
    { maxsize }: { maxsize?: number } = {}
) => {
    let map = new Map<TSerializedKey, TValue>();

    return {
        get: (key: TKey): TValue => {
            const serializedKey = keySerializer(key);
            if (map.has(serializedKey)) {
                // We can be certain that `map.get` does not return undefined
                // (if TValue does not include undefined)
                // because we've just checked that it has this key.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return map.get(serializedKey)!;
            }

            const value = valueCreator(key);
            if (maxsize && map.size >= maxsize) {
                map = new Map();
            }
            map.set(serializedKey, value);
            return value;
        }
    };
};
