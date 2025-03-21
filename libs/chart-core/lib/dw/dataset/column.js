/*
 * column abstracts the functionality of each column
 * of a dataset. A column has a type (text|number|date).
 *
 * API:
 *
 * column.name() ... returns the name (string)
 * column.type() ... return column type (string)
 * column.length ... number of rows (number)
 * column.val(i) ... parsed value in row i
 * column.each(func) ... apply function to each value
 * column.raw() ... access raw, unparsed values
 *
 */

import every from 'lodash/every.js';
import isString from 'lodash/isString.js';
import isNumber from 'lodash/isNumber.js';
import isDate from 'lodash/isDate.js';
import isNaN from 'lodash/isNaN.js';
import each from 'lodash/each.js';
import isUndefined from 'lodash/isUndefined.js';
import shuffle from 'lodash/shuffle.js';
import map from 'lodash/map.js';
import find from 'lodash/find.js';
import range from 'lodash/range.js';
import columnTypes from './columnTypes/index.js';
import purifyHtml from '@datawrapper/shared/purifyHtml';

/**
 * @function dw.Column
 */
function Column(name_, rows, type, allowedTags) {
    function notEmpty(d) {
        return d !== null && d !== undefined && d !== '';
    }

    function guessType(sample) {
        if (rows.length === 0) return columnTypes.text(); // empty columns are type text by default
        if (every(rows, isNumber)) return columnTypes.number();
        if (every(rows, isDate)) return columnTypes.date();
        // guessing column type by counting parsing errors
        // for every known type
        const types = [columnTypes.date(sample), columnTypes.number(sample), columnTypes.text()];
        let type;
        const tolerance = 0.1 * rows.filter(notEmpty).length; // allowing 10% mis-parsed values

        each(rows, function (val) {
            each(types, function (t) {
                t.parse(val);
            });
        });
        every(types, function (t) {
            if (t.errors() < tolerance) type = t;
            return !type;
        });
        if (isUndefined(type)) type = types[2]; // default to text;
        return type;
    }

    // we pick random 200 non-empty values for column type testing
    const sample = shuffle(range(rows.length))
        .filter(function (i) {
            return notEmpty(rows[i]);
        })
        .slice(0, 200)
        .map(function (i) {
            return rows[i];
        });

    type = type ? columnTypes[type](sample) : guessType(sample);

    let name = purifyHtml(name_);
    let origName = name;
    let valueRange, sum, mean, median;
    const origRows = rows.slice(0);
    let title;

    // public interface
    var column = {
        // column name (used for reference in chart metadata)
        name() {
            if (arguments.length >= 1) {
                name = purifyHtml(arguments[0]);
                if (arguments.length === 2) {
                    origName = purifyHtml(arguments[1]);
                } else {
                    origName = name;
                }
                return column;
            }
            return name;
        },

        origName() {
            return origName;
        },

        // column title (used for presentation)
        title() {
            if (arguments.length) {
                title = purifyHtml(arguments[0], allowedTags);
                return column;
            }
            return title ?? name;
        },

        /**
         * number of rows
         */
        length: rows.length,

        /**
         * returns ith row of the col, parsed
         *
         * @param i
         * @param unfiltered  if set to true, precedent calls of filterRows are ignored
         */
        val(i, unfiltered = false) {
            if (!arguments.length) return undefined;
            var r = unfiltered ? origRows : rows;
            if (i < 0) i += r.length;
            const unsafe = type.parse(r[i]);
            if (typeof unsafe === 'string') {
                return purifyHtml(unsafe, allowedTags);
            }
            return unsafe;
        },

        /**
         * returns an array of formatted values
         *
         * @param {string} [opt.numeral=null] -- format numbers using this Numeral.js instance
         */
        formatted(numeral = null) {
            if (numeral && this.type() === 'number') {
                return this.values().map(val => {
                    if (Number.isFinite(val)) {
                        return numeral(val).format('0.[00000000000000000000]');
                    }
                    // When the value is null, undefined, NaN, Infinity, or when parsing failed.
                    return val;
                });
            }
            return this.raw();
        },

        /**
         * returns an array of parsed values
         */
        values(unfiltered) {
            var r = unfiltered ? origRows : rows;
            return map(r, type.parse).map(unsafe =>
                typeof unsafe === 'string' ? purifyHtml(unsafe, allowedTags) : unsafe
            );
        },

        /**
         * apply function to each value
         */
        each(f) {
            for (var i = 0; i < rows.length; i++) {
                f(column.val(i), i);
            }
        },

        // access to raw values
        raw(i, val) {
            if (!arguments.length)
                return rows.map(d => (isDate(d) || isNumber(d) ? d : purifyHtml(d, allowedTags)));
            if (arguments.length === 2) {
                rows[i] = val;
                return column;
            }
            return isDate(rows[i]) || isNumber(rows[i])
                ? rows[i]
                : purifyHtml(rows[i], allowedTags);
        },

        /**
         * if called with no arguments, this returns the column type name
         * if called with true as argument, this returns the column type (as object)
         * if called with a string as argument, this sets a new column type
         */
        type(o) {
            if (o === true) return type;
            if (isString(o)) {
                if (columnTypes[o]) {
                    type = columnTypes[o](sample);
                    return column;
                } else {
                    throw new Error('unknown column type: ' + o);
                }
            }
            return type.name();
        },

        // [min,max] range
        range() {
            if (!type.toNum) return false;
            if (!valueRange) {
                valueRange = [Number.MAX_VALUE, -Number.MAX_VALUE];
                column.each(function (v) {
                    v = type.toNum(v);
                    if (!isNumber(v) || isNaN(v)) return;
                    if (v < valueRange[0]) valueRange[0] = v;
                    if (v > valueRange[1]) valueRange[1] = v;
                });
                valueRange[0] = type.fromNum(valueRange[0]);
                valueRange[1] = type.fromNum(valueRange[1]);
            }
            return valueRange;
        },
        // sum of values
        sum() {
            if (!type.toNum) return false;
            if (sum === undefined) {
                sum = 0;
                column.each(function (v) {
                    const n = type.toNum(v);
                    if (Number.isFinite(n)) {
                        sum += n;
                    }
                });
                sum = type.fromNum(sum);
            }
            return sum;
        },

        mean() {
            if (!type.toNum) return false;
            if (mean === undefined) {
                mean = 0;
                let count = 0;
                column.each(function (v) {
                    const n = type.toNum(v);
                    if (Number.isFinite(n)) {
                        mean += n;
                        count++;
                    }
                });
                mean = type.fromNum(mean / count);
            }
            return mean;
        },

        median() {
            if (!type.toNum) return false;
            if (median === undefined) {
                const arr = column.values().map(type.toNum);
                median = type.fromNum(d3Median(arr));
            }
            return median;
        },

        // remove rows from column, keep those whose index
        // is within @r
        filterRows(r) {
            rows = [];
            if (arguments.length) {
                each(r, function (i) {
                    rows.push(origRows[i]);
                });
            } else {
                rows = origRows.slice(0);
            }
            column.length = rows.length;
            // invalidate valueRange and total
            valueRange = sum = mean = median = undefined;
            return column;
        },

        deleteRow(i) {
            const deletedRows = rows.splice(i, 1);
            origRows.splice(i, 1);
            column.length = rows.length;
            // invalidate valueRange and total
            valueRange = sum = mean = median = undefined;
            return deletedRows;
        },

        toString() {
            return name + ' (' + type.name() + ')';
        },

        indexOf(val) {
            return find(range(rows.length), function (i) {
                if (type.name() === 'date') {
                    return +column.val(i) === +val;
                }
                return column.val(i) === val;
            });
        },

        limitRows(numRows) {
            if (origRows.length > numRows) {
                origRows.length = numRows;
                rows.length = numRows;
                column.length = numRows;
            }
        },

        /**
         * add one or more new rows
         * @param {...*} values
         */
        add(...values) {
            origRows.push(...values);
            rows.push(...values);
            column.length = rows.length;
        },

        /**
         * create a copy of the column
         * @returns {dw.Column}
         */
        clone() {
            return Column(name, rows.slice(), type.name());
        },

        /**
         * delete all rows
         */
        clear() {
            rows.splice(0);
            column.length = rows.length;
        },

        /**
         * return raw rows
         **/
        rows() {
            return rows;
        },

        /**
         * return the specified row formatted for use as a key.
         */
        key(rowIndex) {
            if (column.type() !== 'text') {
                return purifyHtml(column.raw(rowIndex), []);
            }
            const unsafeString = String(column.val(rowIndex, true) || column.val(rowIndex) || '');
            return purifyHtml(unsafeString, []);
        },

        /**
         * return all row values formatted for use as keys
         */
        keys(allowDuplicates = false) {
            const keys = column.values().map((val, i) => column.key(i));
            return allowDuplicates ? keys : Array.from(new Set(keys));
        },
    };
    // backwards compatibility
    column.total = column.sum;
    return column;
}

// some d3 stuff
function d3Median(array) {
    var numbers = [];
    var n = array.length;
    var a;
    var i = -1;
    if (arguments.length === 1) {
        while (++i < n) if (d3Numeric((a = d3Number(array[i])))) numbers.push(a);
    }
    if (numbers.length) return d3Quantile(numbers.sort(d3Ascending), 0.5);
    return undefined;
}

function d3Quantile(values, p) {
    var H = (values.length - 1) * p + 1;
    var h = Math.floor(H);
    var v = +values[h - 1];
    var e = H - h;
    return e ? v + e * (values[h] - v) : v;
}

function d3Number(x) {
    return x === null ? NaN : +x;
}

function d3Numeric(x) {
    return !isNaN(x);
}

function d3Ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

export default Column;
