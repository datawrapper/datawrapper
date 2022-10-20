import significantDimension from './significantDimension.js';
import round from './round.js';

/**
 * rounds an array of numbers to the least number of decimals
 * without loosing any information due to the rounding
 *
 * @exports smartRound
 * @kind function
 *
 * @example
 * import {smartRound} from '@datawrapper/shared/smartRound';
 * smartRound([9, 10.5714, 12.1428, 13.7142]); // [9, 11, 12, 14]
 * smartRound([9, 10.5714, 12.1428, 12.4142]); // [9, 10.6, 12.1, 12.4]
 *
 * @param {array} values - the numbers to be rounded
 * @param {number} addPrecision - force more precision (=numbers of decimals) to the rounding
 * @param {number} tolerance - the percent of uniq input values that we can tolerate to lose after rounding
 * @returns the rounded values
 */
export default function smartRound(values, addPrecision = 0, tolerance = 0.1) {
    let dim = significantDimension(values, tolerance);
    dim += addPrecision;
    return values.map(v => round(v, dim));
}
