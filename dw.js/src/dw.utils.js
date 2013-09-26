

dw.utils = {

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
            [time_fmt("yyyy"), function() { return true; }],
            [time_fmt(daysDelta > 70 ? "MMM" : "MMMM"), function(d) { return d.getMonth() !== 0; }],  // not January
            [time_fmt(fmt.date), function(d) { return d.getDate() != 1; }],  // not 1st of month
            [time_fmt(daysDelta < 7 ? fmt.mm : daysDelta > 70 ? fmt.mmm : fmt.mmmm), function(d) { return d.getDate() != 1 && new_month; }],  // not 1st of month
            //[time_fmt("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }],  // not monday
            [time_fmt(fmt.hour), function(d) { return d.getHours(); }],
            [time_fmt(fmt.minute), function(d) { return d.getMinutes(); }],
            [time_fmt(":ss"), function(d) { return d.getSeconds(); }],
            [time_fmt(".fff"), function(d) { return d.getMilliseconds(); }]
        ]);
    },

    /**
     * DEPRECATED
     * returns a function for formating a date based on the
     * input format of the dates in the dataset
     */
    longDateFormat: function(column) {
        var me = this;
        return function(d) {
            if (column.type() == 'date') {
                switch (column.type(true).precision()) {
                    case 'year': return d.getFullYear();
                    case 'quarter': return d.getFullYear() + ' Q'+(d.getMonth()/3 + 1);
                    case 'month': return Globalize.format(d, 'MMM yy');
                    case 'day': return Globalize.format(d, 'd');
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
        function margin(el, type) {
            if ($(el).css('margin-' + type) == 'auto') return 0;
            return +$(el).css('margin-' + type).replace('px', '');
        }
        var ch = 0, bottom = 0; // summed height of children, 10px for top & bottom margin
        $('body > *').each(function(i, el) {
            var t = el.tagName.toLowerCase();
            if (t != 'script' && el.id != 'chart' && !$(el).hasClass('tooltip') && !$(el).hasClass('container') && !$(el).hasClass('noscript')) {
                ch += $(el).outerHeight(false); // element height
            }
            ch += Math.max(margin(el, 'top'), bottom);
            bottom = margin(el, 'bottom');
        });
        ch += bottom;
        // subtract body padding
        //ch += $('body').innerHeight() - $('body').height();
        var mt = $('#chart').css('margin-top').replace('px', ''),
            mb = $('#chart').css('margin-bottom').replace('px', ''),
            // FIXME: -8 instead of -2 because when `introduction` is filled, a scrollbar appears.
            // Should be dynamic.
            maxH = $(window).height() - ch - 8;
        // IE Fix
        if (!$.support.leadingWhitespace) maxH -= 15;
        maxH -= $('body').css('padding-top').replace('px', '');
        maxH -= $('body').css('padding-bottom').replace('px', '');
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
            default_allowed = "<b><br><br/><i><strong>",
            allowed_split = {};

        if (allowed === undefined) allowed = default_allowed;
        allowed_split[allowed] = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)

        function purifyHtml(input, allowed) {
            if (!_.isString(input) || input.indexOf("<") < 0) {
                return input;
            }
            if (allowed === undefined) {
                allowed = default_allowed;
            }
            if (!allowed_split[allowed]) {
                allowed_split[allowed] = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
            }
            return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                return allowed_split[allowed].indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
            });
        }
        dw.utils.purifyHtml = purifyHtml;
        return purifyHtml(input, allowed);
    },

    /*
     * Rounds a set of unique numbers to the lowest
     * precision where the values remain unique
     */
    smartRound: function(values, add_precision) {
            var result = [], precision = 0, nonEqual = true;
            do {
                result = _.map(values, round);
                precision++;
            } while (_.uniq(result, true).length < values.length);
            if (add_precision) {
                precision += add_precision - 1;
                result = _.map(values, round);
            }
            function round(b) { return +(b.toFixed(precision)); }
            return result;
        }

};
