import dateColumnFormatter from './dateColumnFormatter.js';
import numberColumnFormatter from './numberColumnFormatter.js';
import get from './get.js';

const identity = d => d;

/**
 * Creates a column formatter
 *
 * @exports columnFormatter
 * @kind function
 *
 * @description
 * This function returns a formatting function based, given a column object,
 * a metadata object and the axis column name.
 *
 * @param {object} numeral - Numeral.js instance
 * @param {object} column - the date column object
 * @param {object} metadata - the full metadata object
 * @param {string} axis - the column name of the axis
 * @returns {function}
 */
export function columnFormatter(numeral, column, metadata, axis, options = {}) {
    return column.type() === 'date'
        ? dateColumnFormatter(column.type(true), options)
        : column.type() === 'number'
        ? numberColumnFormatter(numeral, get(metadata, `data.column-format.${axis}`, {}))
        : identity;
}
