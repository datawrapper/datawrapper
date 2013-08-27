

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
                new_month = last_date && date.getMonth() != last_date.getMonth();
                last_date = date;
                var i = formats.length - 1, f = formats[i];
                while (!f[1](date)) f = formats[--i];
                return f[0](date);
            };
        }

        return timeFormat([
            [d3.time.format("%Y"), function() { return true; }],
            [d3.time.format(daysDelta > 70 ? "%b" : "%B"), function(d) { return d.getMonth() !== 0; }],  // not January
            [d3.time.format("%d"), function(d) { return d.getDate() != 1; }],  // not 1st of month
            [d3.time.format(daysDelta > 70 ? "%b %d" : "%B %d"), function(d) { return d.getDate() != 1 && new_month; }],  // not 1st of month
            //[d3.time.format("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }],  // not monday
            [d3.time.format("%I %p"), function(d) { return d.getHours(); }],
            [d3.time.format("%I:%M"), function(d) { return d.getMinutes(); }],
            [d3.time.format(":%S"), function(d) { return d.getSeconds(); }],
            [d3.time.format(".%L"), function(d) { return d.getMilliseconds(); }]
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

    /** Remove all html tags from the given string */
    purifyHtml: function(str) {
        if (typeof(str) == "string") {
            str = str.replace(/(<([^>]+)>)/ig,"");
        }
        return str;
    }

};



