import tailLength from './tailLength.js';
import round from './round.js';
import { uniq, isFinite } from 'underscore';

/**
 * computes the significant dimension for a list of numbers
 * That's the number of decimals to which we can round the numbers
 * without loosing information
 *
 * @exports significantDimension
 * @kind function
 *
 * @example
 * import {significantDimension} from '@datawrapper/shared/significantDimension';
 * significantDimension([0,10,20,30]); // -1
 *
 * @param {number[]} values - list of input numbers
 * @param {number} tolerance - percent of input values that we allow to "collide"
 * @returns {number} - number of significant dimensions (= the number of decimals)
 */
export default function significantDimension(values, tolerance = 0.1) {
    let result = [];
    let decimals = 0;
    const uniqValues = uniq(values.filter(isFinite));
    const totalUniq = uniqValues.length;
    let check, diff;

    const accepted = Math.floor(totalUniq * (1 - tolerance));

    if (uniqValues.length < 3) {
        // special case if there are only 2 unique values
        return Math.round(
            uniqValues.reduce(function (acc, cur) {
                if (!cur) return acc;
                const exp = Math.log(Math.abs(cur)) / Math.LN10;
                if (exp < 8 && exp > -3) {
                    // use tail length for normal numbers
                    return acc + Math.min(3, tailLength(uniqValues[0]));
                } else {
                    return acc + (exp > 0 ? (exp - 1) * -1 : exp * -1);
                }
            }, 0) / uniqValues.length
        );
    }

    if (uniq(uniqValues.map(currentRound)).length > accepted) {
        // we seem to have enough precision, but maybe it's too much?
        check = function () {
            return uniq(result).length === totalUniq;
        };
        diff = -1;
    } else {
        // if we end up here it means we're loosing too much information
        // due to rounding, we need to increase precision
        check = function () {
            return uniq(result).length <= accepted;
        };
        diff = +1;
    }
    let maxIter = 100;
    do {
        result = uniqValues.map(currentRound);
        decimals += diff;
    } while (check() && maxIter-- > 0);
    if (maxIter < 10) {
        console.warn('maximum iteration reached', values, result, decimals);
    }
    if (diff < 0) decimals += 2;
    else decimals--;
    /* rounds to the current number of decimals */
    function currentRound(v) {
        return round(v, decimals);
    }
    return decimals;
}
