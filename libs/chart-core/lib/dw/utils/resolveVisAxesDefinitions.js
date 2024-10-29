import omit from 'lodash/omit.js';
/**
 * Returns visualization axes config with the 'optional' property of each axis
 * resolved based on overrideOptionalKey, overrideOptionalValue, and the passed overrideKeys
 */
export default function resolveVisAxesDefinitions(visAxes, overrideKeys = {}) {
    return Object.fromEntries(
        Object.entries(visAxes).map(([axisType, axisDef]) => {
            if (axisDef.optional && axisDef.overrideOptionalKey) {
                const overrideValue = overrideKeys[axisDef.overrideOptionalKey];
                const forceNonOptional =
                    'overrideOptionalKeyValue' in axisDef
                        ? overrideValue === axisDef.overrideOptionalKeyValue
                        : overrideValue;
                return [
                    axisType,
                    {
                        ...omit(axisDef, ['overrideOptionalKey', 'overrideOptionalKeyValue']),
                        optional: !forceNonOptional
                    }
                ];
            } else {
                return [axisType, axisDef];
            }
        })
    );
}
