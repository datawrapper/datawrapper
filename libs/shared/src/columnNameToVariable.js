/**
 * converts a column name to a variable name that can be used in the custom
 * column editor. variable names can't contain spaces and special characters
 * and are also converted to lowercase.
 *
 * @exports columnNameToVariable
 * @kind function
 *
 * @example
 * import columnNameToVariable from '@datawrapper/shared/columnNameToVariable';
 *
 * columnNameToVariable('GDP (per cap.)') // gdp_per_cap
 *
 * @param {string} name -- name of the column
 * @returns {string} -- variable name
 */
export default function columnNameToVariable(name) {
    return name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '_') // Replace spaces with _
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/-/g, '_') // Replace multiple - with single -
        .replace(/__+/g, '_') // Replace multiple - with single -
        .replace(/^_+/, '') // Trim - from start of text
        .replace(/_+$/, '') // Trim - from end of text
        .replace(/^(\d)/, '_$1') // If first char is a number, prefix with _
        .replace(/^(and|or|in|true|false)$/, '$1_'); // avoid reserved keywords
}
