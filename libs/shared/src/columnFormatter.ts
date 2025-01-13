import n from 'numeral';
import dateColumnFormatter from './dateColumnFormatter.js';
import numberColumnFormatter from './numberColumnFormatter.js';
import get from './get.js';
import { Column, DateColumnFormatterConfig, Metadata } from './chartTypes.js';

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
 * @param numeral - Numeral.js instance
 * @param column - the date column object
 * @param metadata - the full metadata object
 * @param axis - the column name of the axis
 * @returns formatting function
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
