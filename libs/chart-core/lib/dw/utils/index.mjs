import purifyHtml from '@datawrapper/shared/purifyHtml.js';
import column from '../dataset/column.mjs';
import significantDimension from '@datawrapper/shared/significantDimension.js';
import tailLength from '@datawrapper/shared/tailLength.js';
import round from '@datawrapper/shared/round.js';
import smartRound from '@datawrapper/shared/smartRound.js';
import equalish from '@datawrapper/shared/equalish.js';
import clone from '@datawrapper/shared/clone.js';
import { outerHeight, getNonChartHeight } from './getNonChartHeight.mjs';
import htmlTemplate from './htmlTemplate.mjs';
import { isFunction, isString, range } from 'underscore';

export {
    purifyHtml,
    significantDimension,
    tailLength,
    round,
    smartRound,
    equalish,
    clone,
    getNonChartHeight,
    outerHeight,
    htmlTemplate
};

/*
 * returns the min/max range of a set of columns
 */
export function minMax(columns) {
    const minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
    columns.forEach(column => {
        minmax[0] = Math.min(minmax[0], column.range()[0]);
        minmax[1] = Math.max(minmax[1], column.range()[1]);
    });
    return minmax;
}

/*
 * returns a new column with all column names as values
 */
export function columnNameColumn(columns) {
    const names = columns.map(col => col.title());
    return column('', names);
}

export function name(obj) {
    return isFunction(obj.name) ? obj.name() : isString(obj.name) ? obj.name : obj;
}

export function getMaxChartHeight() {
    if (window.innerHeight === 0) return 0;
    var maxH = window.innerHeight - getNonChartHeight();
    return Math.max(maxH, 0);
}

export function nearest(array, value) {
    let minDiff = Number.MAX_VALUE;
    let minDiffVal;
    array.forEach(v => {
        var d = Math.abs(v - value);
        if (d < minDiff) {
            minDiff = d;
            minDiffVal = v;
        }
    });
    return minDiffVal;
}

export function metricSuffix(locale) {
    switch (locale.substr(0, 2).toLowerCase()) {
        case 'de':
            return { 3: ' Tsd.', 6: ' Mio.', 9: ' Mrd.', 12: ' Bio.' };
        case 'fr':
            return { 3: ' mil', 6: ' Mio', 9: ' Mrd' };
        case 'es':
            return { 3: ' Mil', 6: ' millón' };
        default:
            return { 3: 'k', 6: 'M', 9: ' bil' };
    }
}

export function magnitudeRange(minmax) {
    return (
        Math.round(Math.log(minmax[1]) / Math.LN10) - Math.round(Math.log(minmax[0]) / Math.LN10)
    );
}

export function logTicks(min, max) {
    const e0 = Math.round(Math.log(min) / Math.LN10);
    const e1 = Math.round(Math.log(max) / Math.LN10);
    return range(e0, e1).map(exp => Math.pow(10, exp));
}

export function height(element) {
    const h = parseFloat(getComputedStyle(element, null).height.replace('px', ''));
    return isNaN(h) ? 0 : h;
}

export function width(element) {
    const w = parseFloat(getComputedStyle(element, null).width.replace('px', ''));
    return isNaN(w) ? 0 : w;
}

export function addClass(element, className) {
    if (element) element.classList.add(className);
}

export function removeClass(element, className) {
    if (element) element.classList.remove(className);
}

export function remove(elementOrSelector) {
    const element =
        typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector;
    if (element) element.parentElement.removeChild(element);
}

export function domReady(callback) {
    if (/complete|interactive|loaded/.test(document.readyState)) {
        // dom is already loaded
        callback();
    } else {
        // wait for dom to load
        window.addEventListener('DOMContentLoaded', () => {
            callback();
        });
    }
}
