import n from 'numeral';
import dateColumnFormatter from './dateColumnFormatter';
import numberColumnFormatter from './numberColumnFormatter';
import get from './get';
import { Column, DateColumnFormatterConfig, Metadata } from './chartTypes';

const identity = <T>(d: T) => d;

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
export function columnFormatter(
    numeral: typeof n,
    column: Column,
    metadata: Metadata,
    axis: string,
    options: DateColumnFormatterConfig = {}
) {
    return column.type() === 'date'
        ? dateColumnFormatter(column.type(true), options)
        : column.type() === 'number'
        ? numberColumnFormatter(numeral, get(metadata, `data.column-format.${axis}`, {}))
        : identity;
}
