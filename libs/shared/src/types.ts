/**
 * Allows any string value, but also provides autocomplete for a set of values.
 */
export type StringWithAutocomplete<Values> = Values | (string & NonNullable<unknown>);
