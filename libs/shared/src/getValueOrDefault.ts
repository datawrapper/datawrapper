export const getValueOrDefault = <T>(
    value: T | null | undefined,
    additionalCheck: (value: T) => boolean,
    createDefaultValue: () => T
): T => {
    if (value && additionalCheck(value)) {
        return value;
    }

    return createDefaultValue();
};
