
/*
 * DataColumn abstracts the functionality of each column
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
dw.column = function(name, rows, type) {

    function guessType(sample) {

        if (_.every(rows, _.isNumber)) return dw.column.types.number();
        if (_.every(rows, _.isDate)) return dw.column.types.date();
        // guessing column type by counting parsing errors
        // for every known type
        var types = [
                dw.column.types.date(sample),
                dw.column.types.number(sample),
                dw.column.types.text()
            ],
            type,
            k = rows.length,
            tolerance = 0.1; // allowing 10% mis-parsed values

        _.each(rows, function(val) {
            _.each(types, function(t) {
                t.parse(val);
            });
        });
        _.every(types, function(t) {
            if (t.errors() / k < tolerance) type = t;
            return !type;
        });
        return type;
    }

    // we pick random 100 values for column type testing
    var sample = _.map(_.shuffle(_.range(rows.length)).slice(0, 200), function(i) { return rows[i]; });

    type = type ? dw.column.types[type](sample) : guessType(sample);

    var range,
        total,
        origRows = rows.slice(0),
        title;

    // public interface
    var column = {
        // column name (used for reference in chart metadata)
        name: function() {
            if (arguments.length) {
                name = arguments[0];
                return column;
            }
            return dw.utils.purifyHtml(name);
        },

        // column title (used for presentation)
        title: function() {
            if (arguments.length) {
              title = arguments[0];
              return column;
            }
            return dw.utils.purifyHtml(title || name);
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
            return type.parse(dw.utils.purifyHtml(r[i]));
        },

        /*
         * returns an array of parsed values
         */
        values: function(unfiltered) {
            var r = unfiltered ? origRows : rows;
            r = _.map(r, dw.utils.purifyHtml);
            return _.map(r, type.parse);
        },

        /**
         * apply function to each value
         */
        each: function(f) {
            for (var i=0; i<rows.length; i++) {
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
            return dw.utils.purifyHtml(rows[i]);
        },

        /**
         * if called with no arguments, this returns the column type name
         * if called with true as argument, this returns the column type (as object)
         * if called with a string as argument, this sets a new column type
         */
        type: function(o) {
            if (o === true) return type;
            if (_.isString(o)) {
                if (dw.column.types[o]) {
                    type = dw.column.types[o](sample);
                    return column;
                } else {
                    throw 'unknown column type: '+o;
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
                    if (!_.isNumber(v) || _.isNaN(v)) return;
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
                _.each(r, function(i) {
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
            return name + ' ('+type.name()+')';
        },

        indexOf: function(val) {
            return _.find(_.range(rows.length), function(i) {
                return column.val(i) == val;
            });
        }
    };
    return column;
};
