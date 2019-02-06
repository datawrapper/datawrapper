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

import _range from 'underscore-es/range';
import _every from 'underscore-es/every';
import _each from 'underscore-es/each';
import _find from 'underscore-es/find';
import _isNumber from 'underscore-es/isNumber';
import _isString from 'underscore-es/isString';
import _isUndefined from 'underscore-es/isUndefined';
import _isDate from 'underscore-es/isDate';
import _isNaN from 'underscore-es/isNaN';
import _shuffle from 'underscore-es/shuffle';
import _map from 'underscore-es/map';

import columnTypes from './columnTypes.js';
import purifyHtml from '../../shared/purifyHtml.js';

/* globals */
export default function(name, rows, type) {
    function notEmpty(d) {
        return d !== null && d !== undefined && d !== '';
    }

    function guessType(sample) {
        if (_every(rows, _isNumber)) return columnTypes.number();
        if (_every(rows, _isDate)) return columnTypes.date();
        // guessing column type by counting parsing errors
        // for every known type
        var types = [columnTypes.date(sample), columnTypes.number(sample), columnTypes.text()];
        var type;
        var k = rows.filter(notEmpty).length;
        var tolerance = 0.1; // allowing 10% mis-parsed values

        _each(rows, function(val) {
            _each(types, function(t) {
                t.parse(val);
            });
        });
        _every(types, function(t) {
            if (t.errors() / k < tolerance) type = t;
            return !type;
        });
        if (_isUndefined(type)) type = types[2]; // default to text;
        return type;
    }

    // we pick random 200 non-empty values for column type testing
    var sample = _shuffle(_range(rows.length))
        .filter(function(i) {
            return notEmpty(rows[i]);
        })
        .slice(0, 200)
        .map(function(i) {
            return rows[i];
        });

    type = type ? columnTypes[type](sample) : guessType(sample);

    var range;
    var total;
    var origRows = rows.slice(0);
    var title;

    // public interface
    var column = {
        // column name (used for reference in chart metadata)
        name: function() {
            if (arguments.length) {
                name = arguments[0];
                return column;
            }
            return purifyHtml(name);
        },

        // column title (used for presentation)
        title: function() {
            if (arguments.length) {
                title = arguments[0];
                return column;
            }
            return purifyHtml(title || name);
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
        val: function(i, unfiltered) {
            if (!arguments.length) return undefined;
            var r = unfiltered ? origRows : rows;
            if (i < 0) i += r.length;
            return type.parse(purifyHtml(r[i]));
        },

        /*
         * returns an array of parsed values
         */
        values: function(unfiltered) {
            var r = unfiltered ? origRows : rows;
            r = _map(r, function(d) {
                return purifyHtml(d);
            });
            return _map(r, type.parse);
        },

        /**
         * apply function to each value
         */
        each: function(f) {
            for (var i = 0; i < rows.length; i++) {
                f(column.val(i), i);
            }
        },

        // access to raw values
        raw: function(i, val) {
            if (!arguments.length) return rows;
            if (arguments.length == 2) {
                rows[i] = val;
                return column;
            }
            return purifyHtml(rows[i]);
        },

        /**
         * if called with no arguments, this returns the column type name
         * if called with true as argument, this returns the column type (as object)
         * if called with a string as argument, this sets a new column type
         */
        type: function(o) {
            if (o === true) return type;
            if (_isString(o)) {
                if (columnTypes[o]) {
                    type = columnTypes[o](sample);
                    return column;
                } else {
                    throw 'unknown column type: ' + o;
                }
            }
            return type.name();
        },

        // [min,max] range
        range: function() {
            if (!type.toNum) return false;
            if (!range) {
                range = [Number.MAX_VALUE, -Number.MAX_VALUE];
                column.each(function(v) {
                    v = type.toNum(v);
                    if (!_isNumber(v) || _isNaN(v)) return;
                    if (v < range[0]) range[0] = v;
                    if (v > range[1]) range[1] = v;
                });
                range[0] = type.fromNum(range[0]);
                range[1] = type.fromNum(range[1]);
            }
            return range;
        },
        // sum of values
        total: function() {
            if (!type.toNum) return false;
            if (!total) {
                total = 0;
                column.each(function(v) {
                    total += type.toNum(v);
                });
                total = type.fromNum(total);
            }
            return total;
        },
        // remove rows from column, keep those whose index
        // is within @r
        filterRows: function(r) {
            rows = [];
            if (arguments.length) {
                _each(r, function(i) {
                    rows.push(origRows[i]);
                });
            } else {
                rows = origRows.slice(0);
            }
            column.length = rows.length;
            // invalidate range and total
            range = total = false;
            return column;
        },

        toString: function() {
            return name + ' (' + type.name() + ')';
        },

        indexOf: function(val) {
            return _find(_range(rows.length), function(i) {
                return column.val(i) == val;
            });
        },

        limitRows: function(numRows) {
            if (origRows.length > numRows) {
                origRows.length = numRows;
                rows.length = numRows;
                column.length = numRows;
            }
        }
    };
    return column;
}
