
dw.utils = {
    /* global dw,Globalize,_,$ */

    /*
     * returns the min/max range of a set of columns
     */
    minMax: function (columns) {
        var minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
            _.each(columns, function(column) {
                minmax[0] = Math.min(minmax[0], column.range()[0]);
                minmax[1] = Math.max(minmax[1], column.range()[1]);
            });
        return minmax;
    },

    /*
     * return a custom date tick format function for d3.time.scales
     *
     * @param daysDelta    the number of days between minimum and maximum date
     */
    dateFormat: function(daysDelta) {
        var new_month = true, last_date = false;
        function timeFormat(formats) {
            return function(date) {
                new_month = !last_date || date.getMonth() != last_date.getMonth();
                last_date = date;
                var i = formats.length - 1, f = formats[i];
                while (!f[1](date)) f = formats[--i];
                return f[0](date);
            };
        }

        function time_fmt(fmt) {
            var format = function(date) {
                var r = Globalize.format(date, fmt);
                return fmt != 'htt' ? r : r.toLowerCase();
            };
            return format;
        }

        var fmt = (function(lang) {
            return {
                date: lang == 'de' ? "dd." : "dd",
                hour: lang != 'en' ? "H:00" : "htt",
                minute: lang == 'de' ? "H:mm" : 'h:mm',
                mm: lang == 'de' ? 'd.M.' : 'MM/dd',
                mmm: lang == 'de' ? 'd.MMM' : 'MMM dd',
                mmmm: lang == 'de' ? 'd. MMMM' : 'MMMM dd'
            };
        })(Globalize.culture().language);

        // use globalize instead of d3
        return timeFormat([
            [time_fmt("yyyy"),
                function() { return true; }],
            [time_fmt(daysDelta > 70 ? "MMM" : "MMM"),
                function(d) { return d.getMonth() !== 0; }],  // not January
            [time_fmt(fmt.date),
                function(d) { return d.getDate() != 1; }],  // not 1st of month
            [time_fmt(daysDelta < 7 ? fmt.mm : daysDelta > 70 ? fmt.mmm : fmt.mmm),
                function(d) { return d.getDate() != 1 && new_month; }],  // not 1st of month
            //[time_fmt("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }],  // not monday
            [time_fmt(fmt.hour),
                function(d) { return d.getHours(); }],
            [time_fmt(fmt.minute),
                function(d) { return d.getMinutes(); }],
            [time_fmt(":ss"),
                function(d) { return d.getSeconds(); }],
            [time_fmt(".fff"),
                function(d) { return d.getMilliseconds(); }]
        ]);
    },

    /**
     * DEPRECATED
     * returns a function for formating a date based on the
     * input format of the dates in the dataset
     */
    longDateFormat: function(column) {
        return function(d) {
            if (column.type() == 'date') {
                switch (column.type(true).precision()) {
                    case 'year': return d.getFullYear();
                    case 'quarter': return d.getFullYear() + ' Q'+(d.getMonth()/3 + 1);
                    case 'month': return Globalize.format(d, 'MMM yy');
                    case 'day': return Globalize.format(d, 'MMM d');
                    case 'minute': return Globalize.format(d, 't');
                    case 'second': return Globalize.format(d, 'T');
                }
            } else {
                return d;
            }
        };
    },

    columnNameColumn: function(columns) {
        var names = _.map(columns, function(col) { return col.title(); });
        return dw.column('', names);
    },

    name: function(obj) {
        return _.isFunction(obj.name) ? obj.name() : _.isString(obj.name) ? obj.name : obj;
    },

    getMaxChartHeight: function(el) {        
        var maxH = $(window).height() - 8;    

        // IE Fix
        if (!$.support.leadingWhitespace) {
            maxH -= 15;
        }    

        $('body > *').each(function(i, el) {                 
            var t = el.tagName.toLowerCase(),
                cls = $(el).attr('class') || "";

            function hasClass(className) {
                return cls.split(" ").indexOf(className) > -1;
            }

            if (t != 'script' && t != 'style' && el.id != 'chart' &&! $(el).attr('aria-hidden') &&
                !hasClass('tooltip') &&
                !hasClass('vg-tooltip') &&
                !hasClass('hidden') &&
                !hasClass('qtip') &&
                !hasClass('container') &&
                !hasClass('noscript') &&
                !hasClass('hidden') &&
                !hasClass("filter-ui")) {

                maxH -= $(el).outerHeight(true);
            }
        });

        function getProp(selector, property) {
            return getComputedStyle($(selector).get(0))[property].replace('px', '')
        }

        var selectors = ["body", "body #chart"],
            properties = ["padding-top", "padding-bottom", "margin-top", "margin-bottom", "border-top-width", "border-bottom-width"];

        selectors.forEach(function(sel) {
            properties.forEach(function(prop) {
                maxH -= getProp(sel, prop);
            });
        });

        return maxH;
    },

    /*
     * Remove all html tags from the given string
     *
     * written by Kevin van Zonneveld et.al.
     * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
     */
    purifyHtml: function(input, allowed) {
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,
            default_allowed = "<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>";

        function purifyHtml(input, allowed) {
            if (input === null) return null;
            input = String(input);
            // strip tags
            if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
                return input;
            }
            input = stripTags(input, allowed);
            // remove all event attributes
            if (typeof document == 'undefined') return input;
            var d = document.createElement('div');
            d.innerHTML = input;
            var sel = d.querySelectorAll('*');
            for (var i=0; i<sel.length; i++) {
                for (var j=0; j<sel[i].attributes.length; j++) {
                    var attrib = sel[i].attributes[j];
                    if (attrib.specified) {
                        if (attrib.name.substr(0,2) == 'on') sel[i].removeAttribute(attrib.name);
                    }
                }
            }
            return d.innerHTML;
        }
        function stripTags(input, allowed) {
            // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
            allowed = (((allowed !== undefined ? allowed || '' : default_allowed) + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

            var before = input;
            var after = input;
            // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
            while (true) {
                before = after;
                after = before.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
                })
;                // return once no more tags are removed
                if (before === after) {
                    return after;
                }
            }
        }
        dw.utils.purifyHtml = purifyHtml;
        return purifyHtml(input, allowed);
    },

    /*
     * computes the significant dimensions for a series of number
     * return value can be read as N places after the decimal
     */
    significantDimension: function(values) {
        var result = [], dimension = 0,
            uniqValues = _.uniq(values),
            totalUniq = uniqValues.length,
            check, diff;

        var accepted = Math.floor(totalUniq * 0.8);

        if (uniqValues.length < 3) {
            return Math.round(uniqValues.reduce(function(acc, cur) {
                if (!cur) return acc;
                var exp = Math.log(Math.abs(cur))/Math.LN10;
                if (exp < 8 && exp > -3) {
                    // use tail length for normal numbers
                    return acc + Math.min(3, dw.utils.tailLength(uniqValues[0]));
                } else {
                    return acc + (exp > 0 ? (exp-1)*-1 : (exp)*-1 );
                }
            }, 0) / uniqValues.length);
        }

        if (_.uniq(_.map(uniqValues, round)).length > accepted) {
            // we seem to have enough precision, but maybe it's too much?
            check = function() { return _.uniq(result).length == totalUniq; };
            diff = -1;
        } else {
            // if we end up here it means we're loosing too much information
            // due to rounding, we need to increase precision
            check = function() { return _.uniq(result).length <= accepted; };
            diff = +1;
        }
        var max_iter = 100;
        do {
            result = _.map(uniqValues, round);
            dimension += diff;
        } while (check() && max_iter-- > 0);
        if (max_iter < 10) {
            console.warn('maximum iteration reached', values, result, dimension);
        }
        if (diff < 0) dimension += 2; else dimension--;
        function round(v) {
            return dw.utils.round(v, dimension);
        }
        return dimension;
    },

    /*
     * returns the number of digits after the decimal
     */
    tailLength: function(v) {
        return (String(v - Math.floor(v)).replace(/00000*[0-9]+$/, '').replace(/99999*[0-9]+$/, '')).length - 2;
    },

    round: function(value, dimension) {
        var base = Math.pow(10, dimension);
        return Math.round(value * base) / base;
    },

    /*
     * Rounds a set of unique numbers to the lowest
     * precision where the values remain unique
     */
    smartRound: function(values, add_precision) {
        var dim = dw.utils.significantDimension(values);
        dim += add_precision || 0;
        return _.map(values, function(v) { return dw.utils.round(v, dim); });
    },

    /*
     * returns the number in array that is closest
     * to the given value
     */
    nearest: function(array, value) {
        var min_diff = Number.MAX_VALUE, min_diff_val;
        _.each(array, function(v) {
            var d = Math.abs(v - value);
            if (d < min_diff) {
                min_diff = d;
                min_diff_val = v;
            }
        });
        return min_diff_val;
    },

    metricSuffix: function(locale) {
        switch (locale.substr(0, 2).toLowerCase()) {
            case 'de': return { 3: ' Tsd.', 6: ' Mio.', 9: ' Mrd.', 12: ' Bio.' };
            case 'fr': return { 3: ' mil', 6: ' Mio', 9: ' Mrd' };
            case 'es': return { 3: ' Mil', 6: ' millón' };
            default: return { 3: 'k', 6: 'M', 9: ' bil' };
        }
    },

    magnitudeRange: function(minmax) {
        var e0 = Math.round(Math.log(minmax[0]) / Math.LN10),
            e1 = Math.round(Math.log(minmax[1]) / Math.LN10);
        return e1 - e0;
    },

    logTicks: function(min, max) {
        var e0 = Math.round(Math.log(min) / Math.LN10),
            e1 = Math.round(Math.log(max) / Math.LN10);
        return _.map(_.range(e0, e1), function(exp) { return Math.pow(10, exp); });
    },

    clone: function(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {}
        return obj;
    },

    equalish: function(a,b) {
        return a-b < 1e-6;
    }

};
