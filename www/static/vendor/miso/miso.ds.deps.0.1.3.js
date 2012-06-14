/**
* Miso.Dataset - v0.1.3 - 5/23/2012
* http://github.com/misoproject/dataset
* Copyright (c) 2012 Alex Graul, Irene Ros;
* Dual Licensed: MIT, GPL
* https://github.com/misoproject/dataset/blob/master/LICENSE-MIT 
* https://github.com/misoproject/dataset/blob/master/LICENSE-GPL 
*/

// Moment.js
//
// (c) 2011 Tim Wood
// Moment.js is freely distributable under the terms of the MIT license.
//
// Version 1.4.0

/*global define:false */

(function (Date, undefined) {

    var moment,
        round = Math.round,
        languages = {},
        hasModule = (typeof module !== 'undefined'),
        paramsToParse = 'months|monthsShort|monthsParse|weekdays|weekdaysShort|longDateFormat|calendar|relativeTime|ordinal|meridiem'.split('|'),
        i,
        jsonRegex = /^\/?Date\((\d+)/i,
        charactersToReplace = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|dddd?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|zz?|ZZ?|LT|LL?L?L?)/g,
        nonuppercaseLetters = /[^A-Z]/g,
        timezoneRegex = /\([A-Za-z ]+\)|:[0-9]{2} [A-Z]{3} /g,
        tokenCharacters = /(\\)?(MM?M?M?|dd?d?d|DD?D?D?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|ZZ?|T)/g,
        inputCharacters = /(\\)?([0-9]+|([a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+|([\+\-]\d\d:?\d\d))/gi,
        timezoneParseRegex = /([\+\-]|\d\d)/gi,
        VERSION = "1.4.0",
        shortcuts = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|');

    // Moment prototype object
    function Moment(date) {
        this._d = date;
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // helper function for _.addTime and _.subtractTime
    function dateAddRemove(date, _input, adding, val) {
        var isString = (typeof _input === 'string'),
            input = isString ? {} : _input,
            ms, d, M, currentDate;
        if (isString && val) {
            input[_input] = +val;
        }
        ms = (input.ms || input.milliseconds || 0) +
            (input.s || input.seconds || 0) * 1e3 + // 1000
            (input.m || input.minutes || 0) * 6e4 + // 1000 * 60
            (input.h || input.hours || 0) * 36e5; // 1000 * 60 * 60
        d = (input.d || input.days || 0) +
            (input.w || input.weeks || 0) * 7;
        M = (input.M || input.months || 0) +
            (input.y || input.years || 0) * 12;
        if (ms) {
            date.setTime(+date + ms * adding);
        }
        if (d) {
            date.setDate(date.getDate() + d * adding);
        }
        if (M) {
            currentDate = date.getDate();
            date.setDate(1);
            date.setMonth(date.getMonth() + M * adding);
            date.setDate(Math.min(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(), currentDate));
        }
        return date;
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromArray(input) {
        return new Date(input[0], input[1] || 0, input[2] || 1, input[3] || 0, input[4] || 0, input[5] || 0, input[6] || 0);
    }

    // format date using native date object
    function formatDate(date, inputString) {
        var m = new Moment(date),
            currentMonth = m.month(),
            currentDate = m.date(),
            currentYear = m.year(),
            currentDay = m.day(),
            currentHours = m.hours(),
            currentMinutes = m.minutes(),
            currentSeconds = m.seconds(),
            currentZone = -m.zone(),
            ordinal = moment.ordinal,
            meridiem = moment.meridiem;
        // check if the character is a format
        // return formatted string or non string.
        //
        // uses switch/case instead of an object of named functions (like http://phpjs.org/functions/date:380)
        // for minification and performance
        // see http://jsperf.com/object-of-functions-vs-switch for performance comparison
        function replaceFunction(input) {
            // create a couple variables to be used later inside one of the cases.
            var a, b;
            switch (input) {
                // MONTH
            case 'M' :
                return currentMonth + 1;
            case 'Mo' :
                return (currentMonth + 1) + ordinal(currentMonth + 1);
            case 'MM' :
                return leftZeroFill(currentMonth + 1, 2);
            case 'MMM' :
                return moment.monthsShort[currentMonth];
            case 'MMMM' :
                return moment.months[currentMonth];
            // DAY OF MONTH
            case 'D' :
                return currentDate;
            case 'Do' :
                return currentDate + ordinal(currentDate);
            case 'DD' :
                return leftZeroFill(currentDate, 2);
            // DAY OF YEAR
            case 'DDD' :
                a = new Date(currentYear, currentMonth, currentDate);
                b = new Date(currentYear, 0, 1);
                return ~~ (((a - b) / 864e5) + 1.5);
            case 'DDDo' :
                a = replaceFunction('DDD');
                return a + ordinal(a);
            case 'DDDD' :
                return leftZeroFill(replaceFunction('DDD'), 3);
            // WEEKDAY
            case 'd' :
                return currentDay;
            case 'do' :
                return currentDay + ordinal(currentDay);
            case 'ddd' :
                return moment.weekdaysShort[currentDay];
            case 'dddd' :
                return moment.weekdays[currentDay];
            // WEEK OF YEAR
            case 'w' :
                a = new Date(currentYear, currentMonth, currentDate - currentDay + 5);
                b = new Date(a.getFullYear(), 0, 4);
                return ~~ ((a - b) / 864e5 / 7 + 1.5);
            case 'wo' :
                a = replaceFunction('w');
                return a + ordinal(a);
            case 'ww' :
                return leftZeroFill(replaceFunction('w'), 2);
            // YEAR
            case 'YY' :
                return leftZeroFill(currentYear % 100, 2);
            case 'YYYY' :
                return currentYear;
            // AM / PM
            case 'a' :
                return currentHours > 11 ? meridiem.pm : meridiem.am;
            case 'A' :
                return currentHours > 11 ? meridiem.PM : meridiem.AM;
            // 24 HOUR
            case 'H' :
                return currentHours;
            case 'HH' :
                return leftZeroFill(currentHours, 2);
            // 12 HOUR
            case 'h' :
                return currentHours % 12 || 12;
            case 'hh' :
                return leftZeroFill(currentHours % 12 || 12, 2);
            // MINUTE
            case 'm' :
                return currentMinutes;
            case 'mm' :
                return leftZeroFill(currentMinutes, 2);
            // SECOND
            case 's' :
                return currentSeconds;
            case 'ss' :
                return leftZeroFill(currentSeconds, 2);
            // TIMEZONE
            case 'zz' :
                // depreciating 'zz' fall through to 'z'
            case 'z' :
                return (date.toString().match(timezoneRegex) || [''])[0].replace(nonuppercaseLetters, '');
            case 'Z' :
                return (currentZone > 0 ? '+' : '-') + leftZeroFill(~~(Math.abs(currentZone) / 60), 2) + ':' + leftZeroFill(~~(Math.abs(currentZone) % 60), 2);
            case 'ZZ' :
                return (currentZone > 0 ? '+' : '-') + leftZeroFill(~~(10 * Math.abs(currentZone) / 6), 4);
            // LONG DATES
            case 'L' :
            case 'LL' :
            case 'LLL' :
            case 'LLLL' :
            case 'LT' :
                return formatDate(date, moment.longDateFormat[input]);
            // DEFAULT
            default :
                return input.replace(/(^\[)|(\\)|\]$/g, "");
            }
        }
        return inputString.replace(charactersToReplace, replaceFunction);
    }

    // date from string and format string
    function makeDateFromStringAndFormat(string, format) {
        var inArray = [0, 0, 1, 0, 0, 0, 0],
            timezoneHours = 0,
            timezoneMinutes = 0,
            isUsingUTC = false,
            inputParts = string.match(inputCharacters),
            formatParts = format.match(tokenCharacters),
            i,
            isPm;

        // function to convert string input to date
        function addTime(format, input) {
            var a;
            switch (format) {
            // MONTH
            case 'M' :
                // fall through to MM
            case 'MM' :
                inArray[1] = ~~input - 1;
                break;
            case 'MMM' :
                // fall through to MMMM
            case 'MMMM' :
                for (a = 0; a < 12; a++) {
                    if (moment.monthsParse[a].test(input)) {
                        inArray[1] = a;
                        break;
                    }
                }
                break;
            // DAY OF MONTH
            case 'D' :
                // fall through to DDDD
            case 'DD' :
                // fall through to DDDD
            case 'DDD' :
                // fall through to DDDD
            case 'DDDD' :
                inArray[2] = ~~input;
                break;
            // YEAR
            case 'YY' :
                input = ~~input;
                inArray[0] = input + (input > 70 ? 1900 : 2000);
                break;
            case 'YYYY' :
                inArray[0] = ~~Math.abs(input);
                break;
            // AM / PM
            case 'a' :
                // fall through to A
            case 'A' :
                isPm = (input.toLowerCase() === 'pm');
                break;
            // 24 HOUR
            case 'H' :
                // fall through to hh
            case 'HH' :
                // fall through to hh
            case 'h' :
                // fall through to hh
            case 'hh' :
                inArray[3] = ~~input;
                break;
            // MINUTE
            case 'm' :
                // fall through to mm
            case 'mm' :
                inArray[4] = ~~input;
                break;
            // SECOND
            case 's' :
                // fall through to ss
            case 'ss' :
                inArray[5] = ~~input;
                break;
            // TIMEZONE
            case 'Z' :
                // fall through to ZZ
            case 'ZZ' :
                isUsingUTC = true;
                a = (input || '').match(timezoneParseRegex);
                if (a && a[1]) {
                    timezoneHours = ~~a[1];
                }
                if (a && a[2]) {
                    timezoneMinutes = ~~a[2];
                }
                // reverse offsets
                if (a && a[0] === '+') {
                    timezoneHours = -timezoneHours;
                    timezoneMinutes = -timezoneMinutes;
                }
                break;
            }
        }
        for (i = 0; i < formatParts.length; i++) {
            addTime(formatParts[i], inputParts[i]);
        }
        // handle am pm
        if (isPm && inArray[3] < 12) {
            inArray[3] += 12;
        }
        // if is 12 am, change hours to 0
        if (isPm === false && inArray[3] === 12) {
            inArray[3] = 0;
        }
        // handle timezone
        inArray[3] += timezoneHours;
        inArray[4] += timezoneMinutes;
        // return
        return isUsingUTC ? new Date(Date.UTC.apply({}, inArray)) : dateFromArray(inArray);
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (~~array1[i] !== ~~array2[i]) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(string, formats) {
        var output,
            inputParts = string.match(inputCharacters),
            scores = [],
            scoreToBeat = 99,
            i,
            curDate,
            curScore;
        for (i = 0; i < formats.length; i++) {
            curDate = makeDateFromStringAndFormat(string, formats[i]);
            curScore = compareArrays(inputParts, formatDate(curDate, formats[i]).match(inputCharacters));
            if (curScore < scoreToBeat) {
                scoreToBeat = curScore;
                output = curDate;
            }
        }
        return output;
    }

    moment = function (input, format) {
        if (input === null) {
            return null;
        }
        var date,
            matched;
        // parse Moment object
        if (input && input._d instanceof Date) {
            date = new Date(+input._d);
        // parse string and format
        } else if (format) {
            if (isArray(format)) {
                date = makeDateFromStringAndArray(input, format);
            } else {
                date = makeDateFromStringAndFormat(input, format);
            }
        // evaluate it as a JSON-encoded date
        } else {
            matched = jsonRegex.exec(input);
            date = input === undefined ? new Date() :
                matched ? new Date(+matched[1]) :
                input instanceof Date ? input :
                isArray(input) ? dateFromArray(input) :
                new Date(input);
        }
        return new Moment(date);
    };

    // version number
    moment.version = VERSION;

    // language switching and caching
    moment.lang = function (key, values) {
        var i,
            param,
            req,
            parse = [];
        if (values) {
            for (i = 0; i < 12; i++) {
                parse[i] = new RegExp('^' + values.months[i] + '|^' + values.monthsShort[i].replace('.', ''), 'i');
            }
            values.monthsParse = values.monthsParse || parse;
            languages[key] = values;
        }
        if (languages[key]) {
            for (i = 0; i < paramsToParse.length; i++) {
                param = paramsToParse[i];
                moment[param] = languages[key][param] || moment[param];
            }
        } else {
            if (hasModule) {
                req = require('./lang/' + key);
                moment.lang(key, req);
            }
        }
    };

    // set default language
    moment.lang('en', {
        months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        meridiem : {
            AM : 'AM',
            am : 'am',
            PM : 'PM',
            pm : 'pm'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        ordinal : function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        }
    });

    // helper function for _date.from() and _date.fromNow()
    function substituteTimeAgo(string, number, withoutSuffix) {
        var rt = moment.relativeTime[string];
        return (typeof rt === 'function') ?
            rt(number || 1, !!withoutSuffix, string) :
            rt.replace(/%d/i, number || 1);
    }

    function relativeTime(milliseconds, withoutSuffix) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        return substituteTimeAgo.apply({}, args);
    }

    // shortcut for prototype
    moment.fn = Moment.prototype = {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d;
        },

        'native' : function () {
            return this._d;
        },

        toString : function () {
            return this._d.toString();
        },

        toDate : function () {
            return this._d;
        },

        format : function (inputString) {
            return formatDate(this._d, inputString);
        },

        add : function (input, val) {
            this._d = dateAddRemove(this._d, input, 1, val);
            return this;
        },

        subtract : function (input, val) {
            this._d = dateAddRemove(this._d, input, -1, val);
            return this;
        },

        diff : function (input, val, asFloat) {
            var inputMoment = moment(input),
                zoneDiff = (this.zone() - inputMoment.zone()) * 6e4,
                diff = this._d - inputMoment._d - zoneDiff,
                year = this.year() - inputMoment.year(),
                month = this.month() - inputMoment.month(),
                date = this.date() - inputMoment.date(),
                output;
            if (val === 'months') {
                output = year * 12 + month + date / 30;
            } else if (val === 'years') {
                output = year + month / 12;
            } else {
                output = val === 'seconds' ? diff / 1e3 : // 1000
                    val === 'minutes' ? diff / 6e4 : // 1000 * 60
                    val === 'hours' ? diff / 36e5 : // 1000 * 60 * 60
                    val === 'days' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                    val === 'weeks' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                    diff;
            }
            return asFloat ? output : round(output);
        },

        from : function (time, withoutSuffix) {
            var difference = this.diff(time),
                rel = moment.relativeTime,
                output = relativeTime(difference, withoutSuffix);
            return withoutSuffix ? output : (difference <= 0 ? rel.past : rel.future).replace(/%s/i, output);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            var diff = this.diff(moment().sod(), 'days', true),
                calendar = moment.calendar,
                allElse = calendar.sameElse,
                format = diff < -6 ? allElse :
                diff < -1 ? calendar.lastWeek :
                diff < 0 ? calendar.lastDay :
                diff < 1 ? calendar.sameDay :
                diff < 2 ? calendar.nextDay :
                diff < 7 ? calendar.nextWeek : allElse;
            return this.format(typeof format === 'function' ? format.apply(this) : format);
        },

        isLeapYear : function () {
            var year = this.year();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        isDST : function () {
            return (this.zone() < moment([this.year()]).zone() || 
                this.zone() < moment([this.year(), 5]).zone());
        },

        day : function (input) {
            var day = this._d.getDay();
            return input == null ? day :
                this.add({ d : input - day });
        },

        sod: function () {
            return this.clone()
                .hours(0)
                .minutes(0)
                .seconds(0)
                .milliseconds(0);
        },

        eod: function () {
            // end of day = start of day plus 1 day, minus 1 millisecond
            return this.sod().add({
                d : 1,
                ms : -1
            });
        }
    };

    // helper for adding shortcuts
    function makeShortcut(name, key) {
        moment.fn[name] = function (input) {
            if (input != null) {
                this._d['set' + key](input);
                return this;
            } else {
                return this._d['get' + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < shortcuts.length; i ++) {
        makeShortcut(shortcuts[i].toLowerCase(), shortcuts[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeShortcut('year', 'FullYear');

    // add shortcut for timezone offset (no setter)
    moment.fn.zone = function () {
        return this._d.getTimezoneOffset();
    };

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    }
    if (typeof window !== 'undefined') {
        window.moment = moment;
    }
    if (typeof define === "function" && define.amd) {
        define("moment", [], function () {
            return moment;
        });
    }
})(Date);

//     Underscore.js 1.3.1
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var result = [];
    _.reduce(initial, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
        memo[memo.length] = el;
        result[result.length] = array[i];
      }
      return memo;
    }, []);
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape || noMatch, function(match, code) {
           return "',_.escape(" + unescape(code) + "),'";
         })
         .replace(c.interpolate || noMatch, function(match, code) {
           return "'," + unescape(code) + ",'";
         })
         .replace(c.evaluate || noMatch, function(match, code) {
           return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    if (data) return func(data, _);
    return function(data) {
      return func.call(this, data, _);
    };
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

//   Math.js

(function() {

  var math = this.math = {};

  // Arithmetic mean
  // math.mean([1,2,3])
  //   => 2
  math.mean = math.ave = math.average = function(obj, key) {
    return math.sum(obj, key) / _(obj).size();
  };

  // math.median([1,2,3,4])
  //   => 2.5
  //   TODO {}, [{}]
  math.median = function(arr) {
    var middle = (arr.length + 1) /2;
    var sorted = math.sort(arr);
    return (sorted.length % 2) ? sorted[middle - 1] : (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2;
  };

  // Power, exponent
  // math.pow(2,3)
  //   => 8
  math.pow = function(x, n) {
     if (_.isNumber(x))
        return Math.pow(x, n);
     if (_.isArray(x))
        return _.map(x, function(i) { return _.pow(i,n); });
  };

  // Scale to max value
  // math.scale(1,[2,5,10])
  //   => [ 0.2, 0.5, 1]
  math.scale = function(arr, max) {
    var max = max || 1;
    var max0 = _.max(arr);
    return _.map(arr, function(i) { return i * (max/max0); });
  };

  // Slope between two points
  // math.slope([0,0],[1,2])
  //   => 2
  math.slope = function(x, y) {
    return (y[1] - x[1]) / (y[0]-x[0]);
  };

  // Numeric sort
  // math.sort([3,1,2])
  //   => [1,2,3]
  math.sort = function(arr) {
    return arr.sort(function(a, b){
      return a - b;
    });
  };

   // math.stdDeviation([1,2,3])
  //   => 0.816496580927726
  math.stdDeviation = math.sigma = function(arr) {
    return Math.sqrt(_(arr).variance());
  };

  // Sum of array
  // math.sum([1,2,3])
  //   => 6
  // math.sum([{b: 4},{b: 5},{b: 6}], 'b')
  //   => 15
  math.sum = function(obj, key) {
    if (_.isArray(obj) && typeof obj[0] === 'number') {
      var arr = obj;
    } else {
      var key = key || 'value';
      var arr = _(obj).pluck(key);
    }
    var val = 0;
    for (var i=0, len = arr.length; i<len; i++)
      val += arr[i];
    return val;
  };

  // math.transpose(([1,2,3], [4,5,6], [7,8,9]])
  //   => [[1,4,7], [2,5,8], [3,6,9]]
  math.transpose = function(arr) {
    var trans = [];
    _(arr).each(function(row, y){
      _(row).each(function(col, x){
        if (!trans[x]) trans[x] = [];
        trans[x][y] = col;
      });
    });
    return trans;
  };
 
  // math.variance([1,2,3])
  //   => 2/3
  math.variance = function(arr) {
    var mean = _(arr).mean();
    return _(arr).chain().map(function(x) { return _(x-mean).pow(2); }).mean().value();
  };
  
  _.mixin(math);

})();
(function(root){

  // Let's borrow a couple of things from Underscore that we'll need

  // _.each
  var breaker = {},
      AP = Array.prototype,
      OP = Object.prototype,

      hasOwn = OP.hasOwnProperty,
      toString = OP.toString,
      forEach = AP.forEach,
      slice = AP.slice;

  var _each = function( obj, iterator, context ) {
    var key, i, l;

    if ( !obj ) {
      return;
    }
    if ( forEach && obj.forEach === forEach ) {
      obj.forEach( iterator, context );
    } else if ( obj.length === +obj.length ) {
      for ( i = 0, l = obj.length; i < l; i++ ) {
        if ( i in obj && iterator.call( context, obj[i], i, obj ) === breaker ) {
          return;
        }
      }
    } else {
      for ( key in obj ) {
        if ( hasOwn.call( obj, key ) ) {
          if ( iterator.call( context, obj[key], key, obj) === breaker ) {
            return;
          }
        }
      }
    }
  };

  // _.isFunction
  var _isFunction = function( obj ) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // _.extend
  var _extend = function( obj ) {

    _each( slice.call( arguments, 1), function( source ) {
      var prop;

      for ( prop in source ) {
        if ( source[prop] !== void 0 ) {
          obj[ prop ] = source[ prop ];
        }
      }
    });
    return obj;
  };

  // And some jQuery specific helpers

  var class2type = { "[object Array]": "array", "[object Function]": "function" };

  var _type = function( obj ) {
    return !obj ?
      String( obj ) :
      class2type[ toString.call(obj) ] || "object";
  };

  // Now start the jQuery-cum-Underscore implementation. Some very
  // minor changes to the jQuery source to get this working.

  // Internal Deferred namespace
  var _d = {};

  var flagsCache = {};
  // Convert String-formatted flags into Object-formatted ones and store in cache
  function createFlags( flags ) {
      var object = flagsCache[ flags ] = {},
          i, length;
      flags = flags.split( /\s+/ );
      for ( i = 0, length = flags.length; i < length; i++ ) {
          object[ flags[i] ] = true;
      }
      return object;
  }

  _d.Callbacks = function( flags ) {

    // Convert flags from String-formatted to Object-formatted
    // (we check in cache first)
    flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

    var // Actual callback list
      list = [],
      // Stack of fire calls for repeatable lists
      stack = [],
      // Last fire value (for non-forgettable lists)
      memory,
      // Flag to know if list was already fired
      fired,
      // Flag to know if list is currently firing
      firing,
      // First callback to fire (used internally by add and fireWith)
      firingStart,
      // End of the loop when firing
      firingLength,
      // Index of currently firing callback (modified by remove if needed)
      firingIndex,
      // Add one or several callbacks to the list
      add = function( args ) {
        var i,
          length,
          elem,
          type,
          actual;
        for ( i = 0, length = args.length; i < length; i++ ) {
          elem = args[ i ];
          type = _type( elem );
          if ( type === "array" ) {
            // Inspect recursively
            add( elem );
          } else if ( type === "function" ) {
            // Add if not in unique mode and callback is not in
            if ( !flags.unique || !self.has( elem ) ) {
              list.push( elem );
            }
          }
        }
      },
      // Fire callbacks
      fire = function( context, args ) {
        args = args || [];
        memory = !flags.memory || [ context, args ];
        fired = true;
        firing = true;
        firingIndex = firingStart || 0;
        firingStart = 0;
        firingLength = list.length;
        for ( ; list && firingIndex < firingLength; firingIndex++ ) {
          if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
            memory = true; // Mark as halted
            break;
          }
        }
        firing = false;
        if ( list ) {
          if ( !flags.once ) {
            if ( stack && stack.length ) {
              memory = stack.shift();
              self.fireWith( memory[ 0 ], memory[ 1 ] );
            }
          } else if ( memory === true ) {
            self.disable();
          } else {
            list = [];
          }
        }
      },
      // Actual Callbacks object
      self = {
        // Add a callback or a collection of callbacks to the list
        add: function() {
          if ( list ) {
            var length = list.length;
            add( arguments );
            // Do we need to add the callbacks to the
            // current firing batch?
            if ( firing ) {
              firingLength = list.length;
            // With memory, if we're not firing then
            // we should call right away, unless previous
            // firing was halted (stopOnFalse)
            } else if ( memory && memory !== true ) {
              firingStart = length;
              fire( memory[ 0 ], memory[ 1 ] );
            }
          }
          return this;
        },
        // Remove a callback from the list
        remove: function() {
          if ( list ) {
            var args = arguments,
              argIndex = 0,
              argLength = args.length;
            for ( ; argIndex < argLength ; argIndex++ ) {
              for ( var i = 0; i < list.length; i++ ) {
                if ( args[ argIndex ] === list[ i ] ) {
                  // Handle firingIndex and firingLength
                  if ( firing ) {
                    if ( i <= firingLength ) {
                      firingLength--;
                      if ( i <= firingIndex ) {
                        firingIndex--;
                      }
                    }
                  }
                  // Remove the element
                  list.splice( i--, 1 );
                  // If we have some unicity property then
                  // we only need to do this once
                  if ( flags.unique ) {
                    break;
                  }
                }
              }
            }
          }
          return this;
        },
        // Control if a given callback is in the list
        has: function( fn ) {
          if ( list ) {
            var i = 0,
              length = list.length;
            for ( ; i < length; i++ ) {
              if ( fn === list[ i ] ) {
                return true;
              }
            }
          }
          return false;
        },
        // Remove all callbacks from the list
        empty: function() {
          list = [];
          return this;
        },
        // Have the list do nothing anymore
        disable: function() {
          list = stack = memory = undefined;
          return this;
        },
        // Is it disabled?
        disabled: function() {
          return !list;
        },
        // Lock the list in its current state
        lock: function() {
          stack = undefined;
          if ( !memory || memory === true ) {
            self.disable();
          }
          return this;
        },
        // Is it locked?
        locked: function() {
          return !stack;
        },
        // Call all callbacks with the given context and arguments
        fireWith: function( context, args ) {
          if ( stack ) {
            if ( firing ) {
              if ( !flags.once ) {
                stack.push( [ context, args ] );
              }
            } else if ( !( flags.once && memory ) ) {
              fire( context, args );
            }
          }
          return this;
        },
        // Call all the callbacks with the given arguments
        fire: function() {
          self.fireWith( this, arguments );
          return this;
        },
        // To know if the callbacks have already been called at least once
        fired: function() {
          return !!fired;
        }
      };

    return self;
  };

  _d.Deferred = function( func ) {
      var doneList = _d.Callbacks( "once memory" ),
        failList = _d.Callbacks( "once memory" ),
        progressList = _d.Callbacks( "memory" ),
        state = "pending",
        lists = {
            resolve: doneList,
            reject: failList,
            notify: progressList
        },
        promise = {
            done: doneList.add,
            fail: failList.add,
            progress: progressList.add,

            state: function() {
                return state;
            },

            // Deprecated
            isResolved: doneList.fired,
            isRejected: failList.fired,

            then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
                deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
                return this;
            },
            always: function() {
                deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
                return this;
            },
            pipe: function( fnDone, fnFail, fnProgress ) {
                return _d.Deferred(function( newDefer ) {
                    _each( {
                        done: [ fnDone, "resolve" ],
                        fail: [ fnFail, "reject" ],
                        progress: [ fnProgress, "notify" ]
                    }, function( data, handler ) {
                        var fn = data[ 0 ],
                            action = data[ 1 ],
                            returned;
                        if ( _isFunction( fn ) ) {
                            deferred[ handler ](function() {
                                returned = fn.apply( this, arguments );
                                if ( returned && _isFunction( returned.promise ) ) {
                                    returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
                                } else {
                                    newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
                                }
                            });
                        } else {
                            deferred[ handler ]( newDefer[ action ] );
                        }
                    });
                }).promise();
            },
            // Get a promise for this deferred
            // If obj is provided, the promise aspect is added to the object
            promise: function( obj ) {
                if ( !obj ) {
                    obj = promise;
                } else {
                    for ( var key in promise ) {
                        obj[ key ] = promise[ key ];
                    }
                }
                return obj;
            }
        },
        deferred = promise.promise({}),
        key;

        for ( key in lists ) {
            deferred[ key ] = lists[ key ].fire;
            deferred[ key + "With" ] = lists[ key ].fireWith;
        }

        // Handle state
        deferred.done( function() {
          state = "resolved";
        }, failList.disable, progressList.lock ).fail( function() {
          state = "rejected";
        }, doneList.disable, progressList.lock );

        // Call given func if any
        if ( func ) {
          func.call( deferred, deferred );
        }

        // All done!
        return deferred;
    };

    // Deferred helper
    _d.when = function( firstParam ) {
      var args = slice.call( arguments, 0 ),
        i = 0,
        length = args.length,
        pValues = new Array( length ),
        count = length,
        pCount = length,
        deferred = length <= 1 && firstParam && _isFunction( firstParam.promise ) ?
            firstParam :
            _d.Deferred(),
        promise = deferred.promise();
      function resolveFunc( i ) {
        return function( value ) {
          args[ i ] = arguments.length > 1 ? slice.call( arguments, 0 ) : value;
          if ( !( --count ) ) {
            deferred.resolveWith( deferred, args );
          }
        };
      }
      function progressFunc( i ) {
        return function( value ) {
          pValues[ i ] = arguments.length > 1 ? slice.call( arguments, 0 ) : value;
          deferred.notifyWith( promise, pValues );
        };
      }
      if ( length > 1 ) {
        for ( ; i < length; i++ ) {
          if ( args[ i ] && args[ i ].promise && _isFunction( args[ i ].promise ) ) {
            args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) );
          } else {
            --count;
          }
        }
        if ( !count ) {
          deferred.resolveWith( deferred, args );
        }
      } else if ( deferred !== firstParam ) {
        deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
      }
      return promise;
    };

  // Try exporting as a Common.js Module
  if ( typeof module !== "undefined" && module.exports ) {
    module.exports = _d;

  // Or mixin to Underscore.js
  } else if ( typeof root._ !== "undefined" ) {
    root._.mixin(_d);

  // Or assign it to window._
  } else {
    root._ = _d;
  }

})(this);
/**
* Miso.Dataset - v0.1.3 - 5/23/2012
* http://github.com/misoproject/dataset
* Copyright (c) 2012 Alex Graul, Irene Ros;
* Dual Licensed: MIT, GPL
* https://github.com/misoproject/dataset/blob/master/LICENSE-MIT 
* https://github.com/misoproject/dataset/blob/master/LICENSE-GPL 
*/

(function(global, _) {

  /* @exports namespace */
  var Miso = global.Miso = {};

  Miso.typeOf = function(value, options) {
    var types = _.keys(Miso.types),
        chosenType;

    //move string and mixed to the end
    types.push(types.splice(_.indexOf(types, 'string'), 1)[0]);
    types.push(types.splice(_.indexOf(types, 'mixed'), 1)[0]);

    chosenType = _.find(types, function(type) {
      return Miso.types[type].test(value, options);
    });

    chosenType = _.isUndefined(chosenType) ? 'string' : chosenType;

    return chosenType;
  };
  
  Miso.types = {
    
    mixed : {
      name : 'mixed',
      coerce : function(v) {
        return v;
      },
      test : function(v) {
        return true;
      },
      compare : function(s1, s2) {
        if (s1 < s2) { return -1; }
        if (s1 > s2) { return 1;  }
        return 0;
      },
      numeric : function(v) {
        return _.isNaN( Number(v) ) ? 0 : Number(v);
      }
    },

    string : {
      name : "string",
      coerce : function(v) {
        return v == null ? null : v.toString();
      },
      test : function(v) {
        return (v === null || typeof v === "undefined" || typeof v === 'string');
      },
      compare : function(s1, s2) {
        if (s1 == null && s2 != null) { return -1; }
        if (s1 != null && s2 == null) { return 1; }
        if (s1 < s2) { return -1; }
        if (s1 > s2) { return 1;  }
        return 0;
      },

      numeric : function(value) {
        return _.isNaN(+value) ? 0 : +value;
      }
    },

    boolean : {
      name : "boolean",
      regexp : /^(true|false)$/,
      coerce : function(v) {
        if (v === 'false') { return false; }
        return Boolean(v);
      },
      test : function(v) {
        if (v === null || typeof v === "undefined" || typeof v === 'boolean' || this.regexp.test( v ) ) {
          return true;
        } else {
          return false;
        }
      },
      compare : function(n1, n2) {
        if (n1 == null && n2 != null) { return -1; }
        if (n1 != null && n2 == null) { return 1; }
        if (n1 == null && n2 == null) { return 0; }
        if (n1 === n2) { return 0; }
        return (n1 < n2 ? -1 : 1);
      },
      numeric : function(value) {
        return (value) ? 1 : 0;
      }
    },

    number : {  
      name : "number",
      regexp : /^[\-\.]?[0-9]+([\.][0-9]+)?$/,
      coerce : function(v) {
        if (_.isNull(v) || v === "") {
          return null;
        }
        return _.isNaN(v) ? null : +v;
      },
      test : function(v) {
        if (v === null || typeof v === "undefined" || typeof v === 'number' || this.regexp.test( v ) ) {
          return true;
        } else {
          return false;
        }
      },
      compare : function(n1, n2) {
        if (n1 == null && n2 != null) { return -1; }
        if (n1 != null && n2 == null) { return 1; }
        if (n1 == null && n2 == null) { return 0; }
        if (n1 === n2) { return 0; }
        return (n1 < n2 ? -1 : 1);
      },
      numeric : function(value) {
        return value;
      }
    },

    time : {
      name : "time",
      format : "DD/MM/YYYY",
      _formatLookup : [
        ['DD', "\\d{2}"],
        ['D' ,  "\\d{1}|\\d{2}"],
        ['MM', "\\d{2}"],
        ['M' , "\\d{1}|\\d{2}"],
        ['YYYY', "\\d{4}"],
        ['YY', "\\d{2}"],
        ['A', "[AM|PM]"],
        ['hh', "\\d{2}"],
        ['h', "\\d{1}|\\d{2}"],
        ['mm', "\\d{2}"],
        ['m', "\\d{1}|\\d{2}"],
        ['ss', "\\d{2}"],
        ['s', "\\d{1}|\\d{2}"],
        ['ZZ',"[-|+]\\d{4}"],
        ['Z', "[-|+]\\d{2}:\\d{2}"]
      ],
      _regexpTable : {},

      _regexp: function(format) {
        //memoise
        if (this._regexpTable[format]) {
          return new RegExp(this._regexpTable[format], 'g');
        }

        //build the regexp for substitutions
        var regexp = format;
        _.each(this._formatLookup, function(pair) {
          regexp = regexp.replace(pair[0], pair[1]);
        }, this);

        // escape all forward slashes
        regexp = regexp.split("/").join("\\/");

        // save the string of the regexp, NOT the regexp itself.
        // For some reason, this resulted in inconsistant behavior
        this._regexpTable[format] = regexp; 
        return new RegExp(this._regexpTable[format], 'g');
      },

      coerce : function(v, options) {
        options = options || {};
        // if string, then parse as a time
        if (_.isString(v)) {
          var format = options.format || this.format;
          return moment(v, options.format);   
        } else if (_.isNumber(v)) {
          return moment(v);
        } else {
          return v;
        }

      },

      test : function(v, options) {
        options = options || {};
        if (v === null || typeof v === "undefined") {
          return true;
        }
        if (_.isString(v) ) {
          var format = options.format || this.format,
              regex = this._regexp(format);
          return regex.test(v);
        } else {
          //any number or moment obj basically
          return true;
        }
      },
      compare : function(d1, d2) {
        if (d1 < d2) {return -1;}
        if (d1 > d2) {return 1;}
        return 0;
      },
      numeric : function( value ) {
        return value.valueOf();
      }
    }
  };

}(this, _));

(function(global, _) {

  var Miso = global.Miso || (global.Miso = {});

  /**
  * A representation of an event as it is passed through the
  * system. Used for view synchronization and other default
  * CRUD ops.
  * Parameters:
  *   deltas - array of deltas.
  *     each delta: { changed : {}, old : {} }
  */
  Miso.Event = function(deltas) {
    if (!_.isArray(deltas)) {
      deltas = [deltas];
    }
    this.deltas = deltas;
  };

  _.extend(Miso.Event.prototype, {
    affectedColumns : function() {
      var cols = [];
      _.each(this.deltas, function(delta) {
        delta.old = (delta.old || []);
        delta.changed = (delta.changed || []);
        cols = _.chain(cols)
          .union(_.keys(delta.old), _.keys(delta.changed) )
          .reject(function(col) {
            return col === '_id';
          }).value();
      });

      return cols;
    }
  });

   _.extend(Miso.Event, {
    /**
    * Returns true if the event is a deletion
    */
    isRemove : function(delta) {
      if (_.isUndefined(delta.changed) || _.keys(delta.changed).length === 0) {
        return true;
      } else {
        return false;
      }
    },

    /**
    * Returns true if the event is an add event.
    */
    isAdd : function(delta) {
      if (_.isUndefined(delta.old) || _.keys(delta.old).length === 0) {
        return true;
      } else {
        return false;
      }
    },

    /**
    * Returns true if the event is an update.
    */
    isUpdate : function(delta) {
      if (!this.isRemove(delta) && !this.isAdd(delta)) {
        return true;
      } else {
        return false;
      }
    }
  });
  
  
  //Event Related Methods
  Miso.Events = {};

  /**
  * Bind callbacks to dataset events
  * Parameters:
  *   ev - name of the event
  *   callback - callback function
  *   context - context for the callback. optional.
  * Returns 
  *   object being bound to.
  */
  Miso.Events.bind = function (ev, callback, context) {
    var calls = this._callbacks || (this._callbacks = {});
    var list  = calls[ev] || (calls[ev] = {});
    var tail = list.tail || (list.tail = list.next = {});
    tail.callback = callback;
    tail.context = context;
    list.tail = tail.next = {};
    return this;
  };

  /**
  * Remove one or many callbacks. If `callback` is null, removes all
  * callbacks for the event. If `ev` is null, removes all bound callbacks
  * for all events.
  * Parameters:
  *   ev - event name
  *   callback - Optional. callback function to be removed
  * Returns:
  *   The object being unbound from.
  */
  Miso.Events.unbind = function(ev, callback) {
    var calls, node, prev;
    if (!ev) {
      this._callbacks = null;
    } else if (calls = this._callbacks) {
      if (!callback) {
        calls[ev] = {};
      } else if (node = calls[ev]) {
        while ((prev = node) && (node = node.next)) {
          if (node.callback !== callback) { 
            continue;
          }
          prev.next = node.next;
          node.context = node.callback = null;
          break;
        }
      }
    }
    return this;
  };

  /**
  * trigger a given event
  * Parameters:
  *   eventName - name of event
  * Returns;
  *   object being triggered on.
  */
  Miso.Events.trigger = function(eventName) {
    var node, calls, callback, args, ev, events = ['all', eventName];
    if (!(calls = this._callbacks)) {
      return this;
    }
    while (ev = events.pop()) {
      if (!(node = calls[ev])) {
        continue;
      }
      args = ev === 'all' ? arguments : Array.prototype.slice.call(arguments, 1);
      while (node = node.next) {
        if (callback = node.callback) {
          callback.apply(node.context || this, args);
        }
      }
    }
    return this;
  };

  // Used to build event objects accross the application.
  Miso.Events._buildEvent = function(delta) {
    return new Miso.Event(delta);
  };
}(this, _));

(function(global, _) {
  
  var Miso = global.Miso || {};
  
  /**
  * This is a generic collection of dataset-building utilities
  * that are used by Miso.Dataset and Miso.DataView.
  */
  Miso.Builder = {

    /**
    * Detects the type of a column based on some input data.
    * Parameters:
    *   column - the Miso.Column object
    *   data - an array of data to be scanned for type detection
    * Returns:
    *   input column but typed.
    */
    detectColumnType : function(column, data) {

      // compute the type by assembling a sample of computed types
      // and then squashing it to create a unique subset.
      var type = _.inject(data.slice(0, 5), function(memo, value) {

        var t = Miso.typeOf(value);

        if (value !== "" && memo.indexOf(t) === -1 && !_.isNull(value)) {
          memo.push(t);
        }
        return memo;
      }, []);

      // if we only have one type in our sample, save it as the type
      if (type.length === 1) {
        column.type = type[0];
      } else {
        //empty column or mixed type
        column.type = 'mixed';
      }

      return column;
    },

    /**
    * Detects the types of all columns in a dataset.
    * Parameters:
    *   dataset - the dataset to test the columns of
    *   parsedData - the data to check the type of
    */
    detectColumnTypes : function(dataset, parsedData) {

      _.each(parsedData, function(data, columnName) {
        
        var column = dataset.column( columnName );
        
        // check if the column already has a type defined
        if ( column.type ) { 
          column.force = true;
          return; 
        } else {
          Miso.Builder.detectColumnType(column, data);
        }

      }, this);
    },

    /**
    * Used by internal importers to cache the rows 
    * in quick lookup tables for any id based operations.
    * also used by views to cache the new rows they get
    * as a result of whatever filter created them.
    */
    cacheRows : function(dataset) {

      Miso.Builder.clearRowCache(dataset);

      // cache the row id positions in both directions.
      // iterate over the _id column and grab the row ids
      _.each(dataset._columns[dataset._columnPositionByName._id].data, function(id, index) {
        dataset._rowPositionById[id] = index;
        dataset._rowIdByPosition.push(id);
      }, dataset);  

      // cache the total number of rows. There should be same 
      // number in each column's data
      var rowLengths = _.uniq( _.map(dataset._columns, function(column) { 
        return column.data.length;
      }));

      if (rowLengths.length > 1) {
        throw new Error("Row lengths need to be the same. Empty values should be set to null." + 
          _.map(dataset._columns, function(c) { return c.data + "|||" ; }));
      } else {
        dataset.length = rowLengths[0];
      }
    },

    /**
    * Clears the row cache objects of a dataset
    * Parameters:
    *   dataset - Miso.Dataset instance.
    */
    clearRowCache : function(dataset) {
      dataset._rowPositionById = {};
      dataset._rowIdByPosition = [];
    },

    /**
    * Caches the column positions by name
    * Parameters:
    *   dataset - Miso.Dataset instance.
    */
    cacheColumns : function(dataset) {
      dataset._columnPositionByName = {};
      _.each(dataset._columns, function(column, i) {
        dataset._columnPositionByName[column.name] = i;
      });
    }
  };

  // fix lack of IE indexOf. Again.
  if (!Array.prototype.indexOf) { 
    Array.prototype.indexOf = function(obj, start) {
     for (var i = (start || 0), j = this.length; i < j; i++) {
         if (this[i] === obj) { return i; }
     }
     return -1;
    };
  }

}(this, _));
(function(global, _) {

  var Miso = global.Miso;

  /**
  * A single column in a dataset
  * Parameters:
  *   options
  *     name
  *     type (from Miso.types)
  *     data (optional)
  *     before (a pre coercion formatter)
  *     format (for time type.)
  *     any additional arguments here..
  * Returns:
  *   new Miso.Column
  */
  Miso.Column = function(options) {
    _.extend(this, options);
    this._id = options.id || _.uniqueId();
    this.data = options.data || [];
    return this;
  };

  _.extend(Miso.Column.prototype, {

    /**
    * Converts any value to this column's type for a given position
    * in some source array.
    * Parameters:
    *   value
    * Returns: 
    *   number
    */
    toNumeric : function(value) {
      return Miso.types[this.type].numeric(value);
    },

    /**
    * Returns the numeric representation of a datum at any index in this 
    * column.
    * Parameters:
    *   index - position in data array
    * Returns
    *   number
    */
    numericAt : function(index) {
      return this.toNumeric(this.data[index]);
    },

    /**
    * Coerces the entire column's data to the column type.
    */
    coerce : function() {
      this.data = _.map(this.data, function(datum) {
        return Miso.types[this.type].coerce(datum, this);
      }, this);
    },

    _sum : function() {
      return _.sum(this.data);
    },

    _mean : function() {
      var m = 0;
      for (var j = 0; j < this.data.length; j++) {
        m += this.numericAt(j);
      }
      m /= this.data.length;
      return Miso.types[this.type].coerce(m, this);
    },

    _median : function() {
      return Miso.types[this.type].coerce(_.median(this.data), this);
    },

    _max : function() {
      var max = -Infinity;
      for (var j = 0; j < this.data.length; j++) {
        if (Miso.types[this.type].compare(this.data[j], max) > 0) {
          max = this.numericAt(j);
        }
      }

      return Miso.types[this.type].coerce(max, this);
    },

    _min : function() {
      var min = Infinity;
      for (var j = 0; j < this.data.length; j++) {
        if (Miso.types[this.type].compare(this.data[j], min) < 0) {
          min = this.numericAt(j);
        }
      }
      return Miso.types[this.type].coerce(min, this);
    }
  });

  /**
  * Creates a new view.
  * Parameters
  *   options - initialization parameters:
  *     parent : parent dataset
  *     filter : filter specification TODO: document better
  *       columns : column name or multiple names
  *       rows : rowId or function
  * Returns
  *   new Miso.Dataview.
  */
  Miso.DataView = function(options) {
    if (typeof options !== "undefined") {
      options = options || (options = {});

      if (_.isUndefined(options.parent)) {
        throw new Error("A view must have a parent specified.");
      } 
      this.parent = options.parent;
      this._initialize(options);
    }
  };

  _.extend(Miso.DataView.prototype, {

    _initialize: function(options) {
      
      // is this a syncable dataset? if so, pull
      // required methoMiso and mark this as a syncable dataset.
      if (this.parent.syncable === true) {
        _.extend(this, Miso.Events);
        this.syncable = true;
      }

      // save filter
      this.filter = {
        columns : this._columnFilter(options.filter.columns || undefined),
        rows    : this._rowFilter(options.filter.rows || undefined)
      };

      // initialize columns.
      this._columns = this._selectData();

      Miso.Builder.cacheColumns(this);
      Miso.Builder.cacheRows(this);

      // bind to parent if syncable
      if (this.syncable) {
        this.parent.bind("change", this._sync, this);  
      }
    },

    // Syncs up the current view based on a passed delta.
    _sync : function(event) {
      var deltas = event.deltas, eventType = null;
 
      // iterate over deltas and update rows that are affected.
      _.each(deltas, function(d, deltaIndex) {
        
        // find row position based on delta _id
        var rowPos = this._rowPositionById[d._id];

        // ===== ADD NEW ROW

        if (typeof rowPos === "undefined" && Miso.Event.isAdd(d)) {
          // this is an add event, since we couldn't find an
          // existing row to update and now need to just add a new
          // one. Use the delta's changed properties as the new row
          // if it passes the filter.
          if (this.filter.rows && this.filter.rows(d.changed)) {
            this._add(d.changed);  
            eventType = "add";
          }
        } else {

          //===== UPDATE EXISTING ROW
          if (rowPos === "undefined") { return; }
          
          // iterate over each changed property and update the value
          _.each(d.changed, function(newValue, columnName) {
            
            // find col position based on column name
            var colPos = this._columnPositionByName[columnName];
            if (_.isUndefined(colPos)) { return; }
            this._columns[colPos].data[rowPos] = newValue;

            eventType = "update";
          }, this);
        }


        // ====== DELETE ROW (either by event or by filter.)
        // TODO check if the row still passes filter, if not
        // delete it.
        var row = this.rowByPosition(rowPos);
    
        // if this is a delete event OR the row no longer
        // passes the filter, remove it.
        if (Miso.Event.isRemove(d) || 
            (this.filter.row && !this.filter.row(row))) {

          // Since this is now a delete event, we need to convert it
          // to such so that any child views, know how to interpet it.

          var newDelta = {
            _id : d._id,
            old : this.rowByPosition(rowPos),
            changed : {}
          };

          // replace the old delta with this delta
          event.deltas.splice(deltaIndex, 1, newDelta);

          // remove row since it doesn't match the filter.
          this._remove(rowPos);
          eventType = "delete";
        }

      }, this);

      // trigger any subscribers 
      if (this.syncable) {
        this.trigger(eventType, event);
        this.trigger("change", event);  
      }
    },

    /**
    * Returns a dataset view based on the filtration parameters 
    * Parameters:
    *   filter - object with optional columns array and filter object/function 
    *   options - Options.
    * Returns:
    *   new Miso.DataView
    */
    where : function(filter, options) {
      options = options || {};
      
      options.parent = this;
      options.filter = filter || {};

      return new Miso.DataView(options);
    },

    _selectData : function() {
      var selectedColumns = [];

      _.each(this.parent._columns, function(parentColumn) {
        
        // check if this column passes the column filter
        if (this.filter.columns(parentColumn)) {
          selectedColumns.push(new Miso.Column({
            name : parentColumn.name,
            data : [], 
            type : parentColumn.type,
            _id : parentColumn._id
          }));
        }

      }, this);

      // get the data that passes the row filter.
      this.parent.each(function(row) {

        if (!this.filter.rows(row)) { 
          return; 
        }

        for(var i = 0; i < selectedColumns.length; i++) {
          selectedColumns[i].data.push(row[selectedColumns[i].name]);
        }
      }, this);

      return selectedColumns;
    },

    /**
    * Returns a normalized version of the column filter function
    * that can be executed.
    * Parameters:
    *   columnFilter - function or column name
    */
    _columnFilter: function(columnFilter) {
      var columnSelector;

      // if no column filter is specified, then just
      // return a passthrough function that will allow
      // any column through.
      if (_.isUndefined(columnFilter)) {
        columnSelector = function() {
          return true;
        };
      } else { //array
        if (_.isString(columnFilter) ) {
          columnFilter = [ columnFilter ];
        }
        columnFilter.push('_id');
        columnSelector = function(column) {
          return _.indexOf(columnFilter, column.name) === -1 ? false : true;
        };
      }

      return columnSelector;
    },

    /**
    * Returns a normalized row filter function
    * that can be executed 
    */
    _rowFilter: function(rowFilter) {
      
      var rowSelector;

      //support for a single ID;
      if (_.isNumber(rowFilter)) {
        rowFilter = [rowFilter];
      }

      if (_.isUndefined(rowFilter)) {
        rowSelector = function() { 
          return true;
        };

      } else if (_.isFunction(rowFilter)) {
        rowSelector = rowFilter;

      } else { //array
        rowSelector = function(row) {
          return _.indexOf(rowFilter, row._id) === -1 ? false : true;
        };
      }

      return rowSelector;
    },

    /**
    * Returns a dataset view of the given column name
    * Parameters:
    *   name - name of the column to be selected
    * Returns:
    *   Miso.Column.
    */
    column : function(name) {
      return this._column(name);
    },

    _column : function(name) {
      if (_.isUndefined(this._columnPositionByName)) { return undefined; }
      var pos = this._columnPositionByName[name];
      return this._columns[pos];
    },

    /**
    * Returns a dataset view of the given columns 
    * Parameters:
    *   columnsArray - an array of column names
    * Returns:
    *   Miso.DataView.
    */    
    columns : function(columnsArray) {
     return new Miso.DataView({
        filter : { columns : columnsArray },
        parent : this
      });
    },

    /**
    * Returns the names of all columns, not including id column.
    * Returns:
    *   columnNames array
    */
    columnNames : function() {
      var cols = _.pluck(this._columns, 'name');
      return _.reject(cols, function( colName ) {
        return colName === '_id' || colName === '_oids';
      });
    },

    /** 
    * Returns true if a column exists, false otherwise.
    * Parameters:
    *   name (string)
    * Returns
    *   true | false
    */
    hasColumn : function(name) {
      return (!_.isUndefined(this._columnPositionByName[name]));
    },

    /**
    * Iterates over all rows in the dataset
    * Paramters:
    *   iterator - function that is passed each row
    *              iterator(rowObject, index, dataset)
    *   context - options object. Optional.
    */    
    each : function(iterator, context) {
      for(var i = 0; i < this.length; i++) {
        iterator.apply(context || this, [this.rowByPosition(i), i]);
      }
    },

    /**
    * Iterates over each column.
    * Parameters:
    *   iterator - function that is passed:
    *              iterator(colName, column, index)
    *   context - options object. Optional.
    */
    eachColumn : function(iterator, context) {
      // skip id col
      var cols = this.columnNames();
      for(var i = 0; i < cols.length; i++) {
        iterator.apply(context || this, [cols[i], this.column(cols[i]), i]);
      }  
    },

    /**
    * Returns a single row based on its position (NOT ID.)
    * Paramters:
    *   i - position index
    * Returns:
    *   row object representation
    */
    rowByPosition : function(i) {
      return this._row(i);
    },

    /** 
    * Returns a single row based on its id (NOT Position.)
    * Parameters:
    *   id - unique id
    * Returns:
    *   row object representation
    */
    rowById : function(id) {
      return this._row(this._rowPositionById[id]);
    },

    _row : function(pos) {
      var row = {};
      _.each(this._columns, function(column) {
        row[column.name] = column.data[pos];
      });
      return row;   
    },
    _remove : function(rowId) {
      var rowPos = this._rowPositionById[rowId];

      // remove all values
      _.each(this._columns, function(column) {
        column.data.splice(rowPos, 1);
      });
      
      // update caches
      delete this._rowPositionById[rowId];
      this._rowIdByPosition.splice(rowPos, 1);
      this.length--;

      return this;
    },

    _add : function(row, options) {
      
      // first coerce all the values appropriatly
      _.each(row, function(value, key) {
        var column = this.column(key);

        // if we suddenly see values for data that didn't exist before as a column
        // just drop it. First fetch defines the column structure.
        if (typeof column !== "undefined") {
          var Type = Miso.types[column.type];

          // test if value matches column type
          if (column.force || Type.test(row[column.name], column)) {
            
            // do we have a before filter? If so, pass it through that first
            if (!_.isUndefined(column.before)) {
              row[column.name] = column.before(row[column.name]);
            }

            // coerce it.
            row[column.name] = Type.coerce(row[column.name], column);

          } else {
            throw("incorrect value '" + row[column.name] + 
                  "' of type " + Miso.typeOf(row[column.name], column) +
                  " passed to column with type " + column.type);  
          
          }
        }
      }, this);

      // if we don't have a comparator, just append them at the end.
      if (_.isUndefined(this.comparator)) {
        
        // add all data
        _.each(this._columns, function(column) {
          column.data.push(!_.isUndefined(row[column.name]) && !_.isNull(row[column.name]) ? row[column.name] : null);
        });

        this.length++;

        // add row indeces to the cache
        this._rowIdByPosition = this._rowIdByPosition || (this._rowIdByPosition = []);
        this._rowPositionById = this._rowPositionById || (this._rowPositionById = {});
        this._rowIdByPosition.push(row._id);
        this._rowPositionById[row._id] = this._rowIdByPosition.length;
      
      // otherwise insert them in the right place. This is a somewhat
      // expensive operation.    
      } else {
        
        var insertAt = function(at, value, into) {
          Array.prototype.splice.apply(into, [at, 0].concat(value));
        };

        var i;
        this.length++;
        for(i = 0; i < this.length; i++) {
          var row2 = this.rowByPosition(i);
          if (_.isUndefined(row2._id) || this.comparator(row, row2) < 0) {
            
            _.each(this._columns, function(column) {
              insertAt(i, (row[column.name] ? row[column.name] : null), column.data);
            });
            
            break;
          }
        }
    
        // rebuild position cache... 
        // we could splice it in but its safer this way.
        this._rowIdByPosition = [];
        this._rowPositionById = {};
        this.each(function(row, i) {
          this._rowIdByPosition.push(row._id);
          this._rowPositionById[row._id] = i;
        });
      }
      
      return this;
    },

    /**
    * Returns a dataset view of filtered rows
    * @param {function|array} filter - a filter function or object, 
    * the same as where
    */    
    rows : function(filter) {
      return new Miso.DataView({
        filter : { rows : filter },
        parent : this
      });
    },

    /**
    * Sort rows based on comparator
    *
    * roughly taken from here: 
    * http://jxlib.googlecode.com/svn-history/r977/trunk/src/Source/Data/heapsort.js
    * License:
    *   Copyright (c) 2009, Jon Bomgardner.
    *   This file is licensed under an MIT style license
    * Parameters:
    *   options - Optional
    */    
    sort : function(options) {
      options = options || {};

      if (options.comparator) {
        this.comparator = options.comparator;
      }
      
      if (_.isUndefined(this.comparator)) {
        throw new Error("Cannot sort without this.comparator.");
      } 

      var count = this.length, end;

      if (count === 1) {
        // we're done. only one item, all sorted.
        return;
      }

      var swap = _.bind(function(from, to) {
      
        // move second row over to first
        var row = this.rowByPosition(to);

        _.each(row, function(value, column) {
          var colPosition = this._columnPositionByName[column],
              value2 = this._columns[colPosition].data[from];
          this._columns[colPosition].data.splice(from, 1, value);
          this._columns[colPosition].data.splice(to, 1, value2);
        }, this);
      }, this);

      var siftDown = _.bind(function(start, end) {
        var root = start, child;
        while (root * 2 <= end) {
          child = root * 2;
          var root_node = this.rowByPosition(root);

          if ((child + 1 < end) && 
              this.comparator(
                this.rowByPosition(child), 
                this.rowByPosition(child+1)
              ) < 0) {
            child++;  
          }

          if (this.comparator(
                root_node, 
                this.rowByPosition(child)) < 0) {
                  
            swap(root, child);
            root = child;
          } else {
            return;
          }
     
        }
          
      }, this);
      

      // puts data in max-heap order
      var heapify = function(count) {
        var start = Math.round((count - 2) / 2);
        while (start >= 0) {
          siftDown(start, count - 1);
          start--;
        }  
      };

      if (count > 2) {
        heapify(count);

        end = count - 1;
        while (end > 1) {
          
          swap(end, 0);
          end--;
          siftDown(0, end);

        }
      } else {
        if (this.comparator(
            this.rowByPosition(0), 
            this.rowByPosition(1)) > 0) {
          swap(0,1);
        }
      }

      // check last two rows, they seem to always be off sync.
      if (this.comparator(
          this.rowByPosition(this.length - 2), 
          this.rowByPosition(this.length - 1)) > 0) {
        swap(this.length - 1,this.length - 2);
      }

      if (this.syncable && options.silent) {
        this.trigger("sort");
      }
      return this;
    },

    /**
    * Exports a version of the dataset in json format.
    * Returns:
    *   Array of rows.
    */
    toJSON : function() {
      var rows = [];
      for(var i = 0; i < this.length; i++) {
        rows.push(this.rowByPosition(i));
      }
      return rows;
    }
  });

}(this, _));

(function(global, _) {

  // shorthand
  var Miso = global.Miso;

  /**
  * A Miso.Product is a single computed value that can be obtained 
  * from a Miso.Dataset. When a dataset is syncable, it will be an object
  * that one can subscribe to the changes of. Otherwise, it returns
  * the actual computed value.
  * Parameters:
  *   func - the function that derives the computation.
  *   columns - the columns from which the function derives the computation
  */
  Miso.Product = (Miso.Product || function(options) {
    options = options || {};
    
    // save column name. This will be necessary later
    // when we decide whether we need to update the column
    // when sync is called.
    this.func = options.func;

    // determine the product type (numeric, string, time etc.)
    if (options.columns) {
      var column = options.columns;
      if (_.isArray(options.columns)) {
        column = options.columns[0];
      }
      
      this.valuetype = column.type;
      this.numeric = function() {
        return column.toNumeric(this.value);
      };
    }

    this.func({ silent : true });
    return this;
  });

  _.extend(Miso.Product.prototype, Miso.Events, {

    /**
    * return the raw value of the product
    * Returns:
    *   The value of the product. Most likely a number.
    */
    val : function() {
      return this.value;
    },

    /**
    * return the type of product this is (numeric, time etc.)
    * Returns
    *   type. Matches the name of one of the Miso.types.
    */
    type : function() {
      return this.valuetype;
    },
    
    //This is a callback method that is responsible for recomputing
    //the value based on the column its closed on.
    _sync : function(event) {
      this.func();
    },

    // builds a delta object.
    _buildDelta : function(old, changed) {
      return {
        old : old,
        changed : changed
      };
    }
  });

  _.extend(Miso.DataView.prototype, {

    // finds the column objects that match the single/multiple
    // input columns. Helper method.
    _findColumns : function(columns) {
      var columnObjects = [];

      // if no column names were specified, get all column names.
      if (_.isUndefined(columns)) {
        columns = this.columnNames();
      }

      // convert columns to an array in case we only got one column name.
      columns = _.isArray(columns) ? columns : [columns];

      // assemble actual column objecets together.
      _.each(columns, function(column) {
        column = this._columns[this._columnPositionByName[column]];
        columnObjects.push(column);
      }, this);

      return columnObjects;
    },

    /**
    * Computes the sum of one or more columns.
    * Parameters:
    *   columns - string or array of column names on which the value is calculated 
    *   options
    *     silent - set to tue to prevent event propagation
    */
    sum : function(columns, options) {
      options = options || {};
      var columnObjects = this._findColumns(columns);

      var sumFunc = (function(columns){
        return function() {
          // check column types, can't sum up time.
          _.each(columns, function(col) {
            if (col.type === Miso.types.time.name) {
              throw new Error("Can't sum up time");
            }
          });
          return _.sum(_.map(columns, function(c) { return c._sum(); }));
        };
      }(columnObjects));

      return this._calculated(columnObjects, sumFunc);
    },

    /**
    * return a Product with the value of the maximum 
    * value of the column
    * Parameters:
    *   column - string or array of column names on which the value is calculated 
    */    
    max : function(columns, options) {
      options = options || {};
      var columnObjects = this._findColumns(columns);

      var maxFunc = (function(columns) {
        return function() {

          var max = _.max(_.map(columns, function(c) { 
            return c._max(); 
          }));
          
          // save types and type options to later coerce
          var type = columns[0].type;
          var typeOptions = columns[0].typeOptions;

          // return the coerced value for column type.
          return Miso.types[type].coerce(max, typeOptions);
        };
      }(columnObjects));

      return this._calculated(columnObjects, maxFunc);  
      
    },

    /**
    * return a Product with the value of the minimum 
    * value of the column
    * Paramaters:
    *   columns - string or array of column names on which the value is calculated 
    */    
    min : function(columns, options) {
      options = options || {};
      var columnObjects = this._findColumns(columns);
      
      var minFunc = (function(columns) {
        return function() {

          var min = _.min(_.map(columns, function(c) { return c._min(); }));

           // save types and type options to later coerce
          var type = columns[0].type;
          var typeOptions = columns[0].typeOptions;

          // return the coerced value for column type.
          return Miso.types[type].coerce(min, typeOptions);
        };
      }(columnObjects));

      return this._calculated(columnObjects, minFunc); 
    },

    /**
    * return a Product with the value of the average
    * value of the column
    * Parameters:
    *   column - string or array of column names on which the value is calculated 
    */    
    mean : function(columns, options) {
      options = options || {};
      var columnObjects = this._findColumns(columns);

      var meanFunc = (function(columns){
        return function() {
          var vals = [];
          _.each(columns, function(col) {
            vals.push(col.data);
          });
          
          vals = _.flatten(vals);
          
          // save types and type options to later coerce
          var type = columns[0].type;
          var typeOptions = columns[0].typeOptions;

          // convert the values to their appropriate numeric value
          vals = _.map(vals, function(v) { return Miso.types[type].numeric(v); });

          // return the coerced value for column type.
          return Miso.types[type].coerce(_.mean(vals), typeOptions);   
        };
      }(columnObjects));

      return this._calculated(columnObjects, meanFunc);
    },

    
    // return a Product derived by running the passed function
    // Parameters:
    //   column - column on which the value is calculated 
    //   producer - function which derives the product after
    //              being passed each row
    _calculated : function(columns, producer) {
      var _self = this;

      var prod = new Miso.Product({
        columns : columns,
        func : function(options) {
          options = options || {};
          
          // build a diff delta. We're using the column name
          // so that any subscribers know whether they need to 
          // update if they are sharing a column.
          var delta = this._buildDelta(this.value, producer.apply(_self));

          // because below we are triggering any change subscribers to this product
          // before actually returning the changed value
          // let's just set it here.
          this.value = delta.changed;

          if (_self.syncable) {
            var event = this._buildEvent(delta);

            // trigger any subscribers this might have if the values are diff
            if (!_.isUndefined(delta.old) && !options.silent && delta.old !== delta.changed) {
              this.trigger("change", event);
            }  
          }
        }
      });

      // auto bind to parent dataset if its syncable
      if (this.syncable) {
        this.bind("change", prod._sync, prod); 
        return prod; 
      } else {
        return producer();
      }
      
    }

  });

}(this, _));


/**
Library Deets go here
USE OUR CODES

Version 0.0.1.2
*/

(function(global, _, moment) {

  var Miso = global.Miso;

  /**
  * Instantiates a new dataset.
  * Parameters:
  * options - optional parameters. 
  *   data : "Object - an actual javascript object that already contains the data",  
  *   url : "String - url to fetch data from",
  *   sync : Set to true to be able to bind to dataset changes. False by default.
  *   jsonp : "boolean - true if this is a jsonp request",
  *   delimiter : "String - a delimiter string that is used in a tabular datafile",
  *   strict : "Whether to expect the json in our format or whether to interpret as raw array of objects, default false",
  *   extract : "function to apply to JSON before internal interpretation, optional"
  *   ready : the callback function to act on once the data is fetched. Isn't reuired for local imports
  *           but is required for remote url fetching.
  *   columns: A way to manually override column type detection. Expects an array of 
  *            objects of the following structure: 
  *           { name : 'columnname', type: 'columntype', 
  *             ... (additional params required for type here.) }
  *   comparator : function (optional) - takes two rows and returns 1, 0, or -1  if row1 is
  *     before, equal or after row2. 
  *   deferred : by default we use underscore.deferred, but if you want to pass your own (like jquery's) just
  *              pass it here.
  *   importer : The classname of any importer (passes through auto detection based on parameters. 
  *              For example: <code>Miso.Importers.Polling</code>.
  *   parser   : The classname of any parser (passes through auto detection based on parameters. 
  *              For example: <code>Miso.Parsers.Delimited</code>.
  *   resetOnFetch : set to true if any subsequent fetches after first one should overwrite the
  *                  current data.
  *   uniqueAgainst : Set to a column name to check for duplication on subsequent fetches.
  *   interval : Polling interval. Set to any value in milliseconds to enable polling on a url.
  }
  */
  Miso.Dataset = function(options) {
    this.length = 0;
    
    this._columns = [];
    this._columnPositionByName = {};
    
    if (typeof options !== "undefined") {
      options = options || {};
      this._initialize(options);
    }
  };

  // take on miso dataview's prototype
  Miso.Dataset.prototype = new Miso.DataView();

  // add dataset methods to dataview.
  _.extend(Miso.Dataset.prototype, {

    /**
    * @private
    * Internal initialization method. Reponsible for data parsing.
    * @param {object} options - Optional options  
    */
    _initialize: function(options) {

      // is this a syncable dataset? if so, pull
      // required methods and mark this as a syncable dataset.
      if (options.sync === true) {
        _.extend(this, Miso.Events);
        this.syncable = true;
      }

      // initialize importer from options or just create a blank
      // one for now, we'll detect it later.
      this.importer = options.importer || null;

      // default parser is object parser, unless otherwise specified.
      this.parser  = options.parser || Miso.Parsers.Obj;

      // figure out out if we need another parser.
      if (_.isUndefined(options.parser)) {
        if (options.strict) {
          this.parser = Miso.Parsers.Strict;
        } else if (options.delimiter) {
          this.parser = Miso.Parsers.Delimited;
        } 
      }

      // initialize the proper importer
      if (this.importer === null) {
        if (options.url) {

          if (!options.interval) {
            this.importer = Miso.Importers.Remote;  
          } else {
            this.importer = Miso.Importers.Polling;
            this.interval = options.interval;
          }
          
        } else {
          this.importer = Miso.Importers.Local;
        }
      }

      // initialize importer and parser
      this.parser = new this.parser(options);

      if (this.parser instanceof Miso.Parsers.Delimited) {
        options.dataType = "text";
      }

      this.importer = new this.importer(options);

      // save comparator if we have one
      if (options.comparator) {
        this.comparator = options.comparator;  
      }

      // if we have a ready callback, save it too
      if (options.ready) {
        this.ready = options.ready;
      }

      // If new data is being fetched and we want to just
      // replace existing rows, save this flag.
      if (options.resetOnFetch) {
        this.resetOnFetch = options.resetOnFetch;
      }

      // if new data is being fetched and we want to make sure
      // only new rows are appended, a column must be provided
      // against which uniqueness will be checked.
      // otherwise we are just going to blindly add rows.
      if (options.uniqueAgainst) {
        this.uniqueAgainst = options.uniqueAgainst;
      }

      

      // if there is no data and no url set, we must be building
      // the dataset from scratch, so create an id column.
      if (_.isUndefined(options.data) && _.isUndefined(options.url)) {
        this._addIdColumn();  
      }

      // if for any reason, you want to use a different deferred
      // implementation, pass it as an option
      if (options.deferred) {
        this.deferred = options.deferred;
      }

      //build any columns present in the constructor
      if ( options.columns ) {
        this.addColumns(options.columns);
      }

    },

    /**
    * Responsible for actually fetching the data based on the initialized dataset.
    * Note that this needs to be called for either local or remote data.
    * There are three different ways to use this method:
    * ds.fetch() - will just fetch the data based on the importer. Note that for async 
    *              fetching this isn't blocking so don't put your next set of instructions
    *              expecting the data to be there.
    * ds.fetch({
    *   success: function() { 
    *     // do stuff
    *     // this is the dataset.
    *   },
    *   error : function(e) {
    *     // do stuff
    *   }
    * })        - Allows you to pass success and error callbacks that will be called once data
    *             is property fetched.
    *
    * _.when(ds.fetch(), function() {
    *   // do stuff
    *   // note 'this' is NOT the dataset.
    * })        - Allows you to use deferred behavior to potentially chain multiple datasets.
    *
    * @param {object} options Optional success/error callbacks.
    **/
    fetch : function(options) {
      options = options || {};
      
      var dfd = this.deferred || new _.Deferred();

      if ( _.isNull(this.importer) ) {
        throw "No importer defined";
      }

      this.importer.fetch({
        success: _.bind(function( data ) {

          this._apply( data );

          // if a comparator was defined, sort the data
          if (this.comparator) {
            this.sort();
          }

          if (this.ready) {
            this.ready.call(this);
          }

          if (options.success) {
            options.success.call(this);
          }

          // Ensure the context of the promise is set to the Dataset
          dfd.resolveWith(this, [this]);

        }, this),

        error : _.bind(function(e) {
          if (options.error) {
            options.error.call(this);
          }

          dfd.reject(e);
        }, this)
      });

      return dfd.promise();
    },

    //These are the methods that will be used to determine
    //how to update a dataset's data when fetch() is called
    _applications : {

      //Update existing values, used the pass column to match 
      //incoming data to existing rows.
      againstColumn : function(data) {
        
        var rows = [],

            colNames = _.keys(data),   
            row,
            // get against unique col
            uniqCol = this.column(this.uniqueAgainst),
            len = data[this._columns[1].name].length,
            dataLength = _.max(_.map(colNames, function(name) {
              return data[name].length;
            }, this));

        var posToRemove = [], i;
        for(i = 0; i < len; i++) {

          var datum = data[this.uniqueAgainst][i];
          // this is a non unique row, remove it from all the data
          // arrays
          if (uniqCol.data.indexOf(datum) !== -1) {
            posToRemove.push(i);
          }
        }

        // sort and reverse the removal ids, this way we won't
        // lose position by removing an early id that will shift
        // array and throw all other ids off.
        posToRemove.sort().reverse();

        for(i = 0; i < dataLength; i++) {
          if (posToRemove.indexOf(i) === -1) {
            row = {};
            for(var j = 0; j < colNames.length; j++) {
              row[colNames[j]] = data[colNames[j]][i];
            }
            rows.push(row);
          }
        }

        this.add(rows);
      },

      //Always blindly add new rows
      blind : function( data ) {
        var columnName, columnData, rows = [], row;

        // figure out the length of rows we have.
        var colNames = _.keys(data),
            dataLength = _.max(_.map(colNames, function(name) {
              return data[name].length;
            }, this));

        // build row objects
        for( var i = 0; i < dataLength; i++) {
          row = {};
          for(var j = 0; j < colNames.length; j++) {
            row[colNames[j]] = data[colNames[j]][i];
          }
          rows.push(row);
        }

        this.add(rows);
      }
    },

    //Takes a dataset and some data and applies one to the other
    _apply : function( data ) {
      
      var parsed = this.parser.parse( data );

      // first time fetch
      if ( !this.fetched ) {

        // create columns (inc _id col.)
        this._addIdColumn();
        this.addColumns( _.map(parsed.columns, function( name ) {
            return { name : name };
          })
        );
        
        // detect column types, add all rows blindly and cache them.
        Miso.Builder.detectColumnTypes(this, parsed.data);
        this._applications.blind.call( this, parsed.data );
        
        this.fetched = true;
      
      // reset on fetch
      } else if (this.resetOnFetch) {

        // clear the data
        this.reset();

        // blindly add the data.
        this._applications.blind.call( this, parsed.data );

      // append
      } else if (this.uniqueAgainst) {

        // make sure we actually have this column
        if (!this.hasColumn(this.uniqueAgainst)) {
          throw new Error("You requested a unique add against a column that doesn't exist.");
        }

        this._applications.againstColumn.call(this, parsed.data);
      
      // polling fetch, just blindly add rows
      } else {
        this._applications.blind.call( this, parsed.data );
      }

      Miso.Builder.cacheRows(this);
    },

    /**
    * Adds columns to the dataset.
    */
    addColumns : function( columns ) {
      _.each(columns, function( column ) {
        this.addColumn( column );
      }, this);
    },

    /** 
    * Adds a single column to the dataset
    * Parameters:
    *   column : a set of properties describing a column (name, type, data etc.)
    * Returns
    *   Miso.Column object.
    */
    addColumn : function(column) {
      //don't create a column that already exists
      if ( !_.isUndefined(this.column(column.name)) ) { 
        return false; 
      }

      column = new Miso.Column( column );

      this._columns.push( column );
      this._columnPositionByName[column.name] = this._columns.length - 1;

      return column;
    },

    /**
    * Adds an id column to the column definition. If a count
    * is provided, also generates unique ids.
    * Parameters:
    *   count - the number of ids to generate.
    */
    _addIdColumn : function( count ) {
      // if we have any data, generate actual ids.

      if (!_.isUndefined(this.column("_id"))) {
        return;
      }

      var ids = [];
      if (count && count > 0) {
        _.times(count, function() {
          ids.push(_.uniqueId());
        });
      }

      // add the id column
      this.addColumn({ name: "_id", type : "number", data : ids });

      // did we accidentally add it to the wrong place? (it should always be first.)
      if (this._columnPositionByName._id !== 0) {

        // we need to move it to the beginning and unshift all the other
        // columns
        var idCol = this._columns[this._columnPositionByName._id],
            oldIdColPos = this._columnPositionByName._id;

        // move col back 
        this._columns.splice(oldIdColPos, 1);
        this._columns.unshift(idCol);
        
        this._columnPositionByName._id = 0;
        _.each(this._columnPositionByName, function(pos, colName) {
          if (colName !== "_id" && this._columnPositionByName[colName] < oldIdColPos) {
            this._columnPositionByName[colName]++;
          }
        }, this);
      }
      
    },

    /**
    * Add a row to the dataset. Triggers add and change.
    * Parameters:
    *   row - an object representing a row in the form of:
    *         {columnName: value}
    *   options - options
    *     silent: boolean, do not trigger an add (and thus view updates) event
    */    
    add : function(rows, options) {
      
      options = options || {};

      if (!_.isArray(rows)) {
        rows = [rows];
      }

      var deltas = [];

      _.each(rows, function(row) {
        if (!row._id) {
          row._id = _.uniqueId();
        }

        this._add(row, options);

        // store all deltas for a single fire event.
        if (this.syncable && !options.silent) {
          deltas.push({ changed : row });
        }
      
      }, this);
      
      if (this.syncable && !options.silent) {
        var e = this._buildEvent(deltas);
        this.trigger('add', e );
        this.trigger('change', e );
      }

      return this;
    },

    /**
    * Remove all rows that match the filter. Fires remove and change.
    * Parameters:
    *   filter - row id OR function applied to each row to see if it should be removed.
    *   options - options. Optional.
    *     silent: boolean, do not trigger an add (and thus view updates) event
    */    
    remove : function(filter, options) {
      filter = this._rowFilter(filter);
      var deltas = [], rowsToRemove = [];

      this.each(function(row, rowIndex) {
        if (filter(row)) {
          rowsToRemove.push(row._id);
          deltas.push( { old: row } );
        }
      });

      // don't attempt tp remove the rows while iterating over them
      // since that modifies the length of the dataset and thus
      // terminates the each loop early. 
      _.each(rowsToRemove, function(rowId) {
        this._remove(rowId);  
      }, this);
      
      if (this.syncable && (!options || !options.silent)) {
        var ev = this._buildEvent( deltas );
        this.trigger('remove', ev );
        this.trigger('change', ev );
      }
    },

    /**
    * Update all rows that match the filter. Fires update and change.
    * Parameters:
    *   filter - row id OR filter rows to be updated
    *   newProperties - values to be updated.
    *   options - options. Optional
    *     silent - set to true to prevent event triggering..
    */    
    update : function(filter, newProperties, options) {

      var newKeys, deltas = [];

      var updateRow = _.bind(function(row, rowIndex) {
        var c, props;

        if (_.isFunction(newProperties)) {
          props = newProperties.apply(this, [row]);
        } else {
          props = newProperties;
        }

        newKeys = _.keys(props);

        _.each(newKeys, function(columnName) {
          c = this.column(columnName);

          // test if the value passes the type test
          var Type = Miso.types[c.type];
          
          if (Type) {
            if (Type.test(props[c.name], c)) {

              // do we have a before filter on the column? If so, apply it
              if (!_.isUndefined(c.before)) {
                props[c.name] = c.before(props[c.name]);
              }

              // coerce it.
              props[c.name] = Type.coerce(props[c.name], c);
            } else {
              throw("incorrect value '" + props[c.name] + 
                    "' of type " + Miso.typeOf(props[c.name], c) +
                    " passed to column with type " + c.type);  
            }
          }
          c.data[rowIndex] = props[c.name];
        }, this);

        deltas.push( { _id : row._id, old : row, changed : props } );
      }, this);

      // do we just have a single id? array it up.
      if (_.isString(filter)) {
        filter = [filter];
      }
      // do we have an array of ids instead of filter functions?
      if (_.isArray(filter)) {
        var row, rowIndex;
        _.each(filter, function(rowId) {
          row = this.rowById(rowId);
          rowIndex = this._rowPositionById[rowId];
          
          updateRow(row, rowIndex);
        });

      } else {

        // make a filter function.
        filter = this._rowFilter(filter);

        this.each(function(row, rowIndex) {
          if (filter(row)) {
            updateRow(row, rowIndex);
          }
        }, this);
      }

      if (this.syncable && (!options || !options.silent)) {
        var ev = this._buildEvent( deltas );
        this.trigger('update', ev );
        this.trigger('change', ev );
      }
      return this;
    },

    /**
    * Clears all the rows
    * Fires a "reset" event.
    * Parameters:
    *   options (object)
    *     silent : true | false.
    */
    reset : function(options) {
      _.each(this._columns, function(col) {
        col.data = [];
      });
      this.length = 0;
      if (this.syncable && (!options || !options.silent)) {
        this.trigger("reset");
      }
    }

  });
}(this, _, moment));


(function(global, _) {

  var Miso = global.Miso || (global.Miso = {});

  /**
  * A Miso.Derived dataset is a regular dataset that has been derived
  * through some computation from a parent dataset. It behaves just like 
  * a regular dataset except it also maintains a reference to its parent
  * and the method that computed it.
  * Parameters:
  *   options
  *     parent - the parent dataset
  *     method - the method by which this derived dataset was computed
  * Returns
  *   a derived dataset instance
  */

  Miso.Derived = function(options) {
    options = options || {};

    Miso.Dataset.call(this);
    
    // save parent dataset reference
    this.parent = options.parent;

    // save the method we apply to bins.
    this.method = options.method;

    this._addIdColumn();

    this.addColumn({
      name : "_oids",
      type : "mixed"
    });

    if (this.parent.syncable) {
      _.extend(this, Miso.Events);
      this.syncable = true;
      this.parent.bind("change", this._sync, this);  
    }
  };

  // take in dataset's prototype.
  Miso.Derived.prototype = new Miso.Dataset();

  // inherit all of dataset's methods.
  _.extend(Miso.Derived.prototype, {
    _sync : function(event) {
      // recompute the function on an event.
      // TODO: would be nice to be more clever about this at some point.
      this.func.call(this.args);
      this.trigger("change");
    }
  });


  // add derived methods to dataview (and thus dataset & derived)
  _.extend(Miso.DataView.prototype, {

    /**
    * moving average
    * Parameters:
    *   column - The column on which to calculate the average
    *   size - The window size to utilize for the moving average
    *   options
    *     method - the method to apply to all values in a window. Mean by default.
    * Returns:
    *   a miso.derived dataset instance
    */
    movingAverage : function(columns, size, options) {
      
      options = options || {};

      var d = new Miso.Derived({
        parent : this,
        method : options.method || _.mean,
        size : size,
        args : arguments
      });

      // copy over all columns
      this.eachColumn(function(columnName) {
        d.addColumn({
          name : columnName, type : this.column(columnName).type, data : []
        });
      }, this);

      // save column positions on new dataset.
      Miso.Builder.cacheColumns(d);

      // apply with the arguments columns, size, method
      var computeMovingAverage = function() {
        var win = [];

        // normalize columns arg - if single string, to array it.
        if (typeof columns === "string") {
          columns = [columns];
        }

        // copy the ids
        this.column("_id").data = this.parent.column("_id").data.slice(size-1, this.parent.length);

        // copy the columns we are NOT combining minus the sliced size.
        this.eachColumn(function(columnName, column, i) {
          if (columns.indexOf(columnName) === -1 && columnName !== "_oids") {
            // copy data
            column.data = this.parent.column(columnName).data.slice(size-1, this.parent.length);
          } else {
            // compute moving average for each column and set that as the data 
            column.data = _.movingAvg(this.parent.column(columnName).data, size, this.method);
          }
        }, this);

        this.length = this.parent.length - size + 1;
        
        // generate oids for the oid col
        var oidcol = this.column("_oids");
        oidcol.data = [];
        for(var i = 0; i < this.length; i++) {
          oidcol.data.push(this.parent.column("_id").data.slice(i, i+size));
        }
        
        Miso.Builder.cacheRows(this);
        
        return this;
      };

      d.func = _.bind(computeMovingAverage, d);
      return d.func.call(d.args);
    },

    /**
    * Group rows by the column passed and return a column with the
    * counts of the instance of each value in the column passed.
    */
    countBy : function(byColumn, options) {

      options = options || {};
      var d = new Miso.Derived({
        parent : this,
        method : _.sum,
        args : arguments
      });

      var parentByColumn = this.column(byColumn);
      //add columns
      d.addColumn({
        name : byColumn,
        type : parentByColumn.type
      });
      d.addColumn({ name : 'count', type : 'number' });
      d.addColumn({ name : '_oids', type : 'mixed' });
      Miso.Builder.cacheColumns(d);

      var names = d._column(byColumn).data, 
          values = d._column('count').data, 
          _oids = d._column('_oids').data,
          _ids = d._column('_id').data;

      function findIndex(names, datum, type) {
        var i;
        for(i = 0; i < names.length; i++) {
          if (Miso.types[type].compare(names[i], datum) === 0) {
            return i;
          }
        }
        return -1;
      }

      this.each(function(row) {
        var index = findIndex(names, row[byColumn], parentByColumn.type);
        if ( index === -1 ) {
          names.push( row[byColumn] );
          _ids.push( _.uniqueId() );
          values.push( 1 );
          _oids.push( [row._id] );
        } else {
          values[index] += 1;
          _oids[index].push( row._id ); 
        }
      });

      Miso.Builder.cacheRows(d);
      return d;
    },

    /**
    * group rows by values in a given column
    * Parameters:
    *   byColumn - The column by which rows will be grouped (string)
    *   columns - The columns to be included (string array of column names)
    *   options 
    *     method - function to be applied, default is sum
    *     preprocess - specify a normalization function for the
    *                  byColumn values if you need to group by some kind of 
    *                  derivation of those values that are not just equality based.
    * Returns:
    *   a miso.derived dataset instance
    */
    groupBy : function(byColumn, columns, options) {
      
      options = options || {};

      var d = new Miso.Derived({

        // save a reference to parent dataset
        parent : this,
        
        // default method is addition
        method : options.method || _.sum,

        // save current arguments
        args : arguments
      });

      if (options && options.preprocess) {
        d.preprocess = options.preprocess;  
      }

      // copy columns we want - just types and names. No data.
      var newCols = _.union([byColumn], columns);
      
      _.each(newCols, function(columnName) {

        this.addColumn({
          name : columnName,
          type : this.parent.column(columnName).type
        });
      }, d);

      // save column positions on new dataset.
      Miso.Builder.cacheColumns(d);

      // will get called with all the arguments passed to this
      // host function
      var computeGroupBy = function() {

        // clear row cache if it exists
        Miso.Builder.clearRowCache(this);

        // a cache of values
        var categoryPositions = {},
            categoryCount     = 0,
            byColumnPosition  = this._columnPositionByName[byColumn],
            originalByColumn = this.parent.column(byColumn);

        // bin all values by their
        for(var i = 0; i < this.parent.length; i++) {
          var category = null;
          
          // compute category. If a pre-processing function was specified
          // (for binning time for example,) run that first.
          if (this.preprocess) {
            category = this.preprocess(originalByColumn.data[i]);
          } else {
            category = originalByColumn.data[i];  
          }
           
          if (_.isUndefined(categoryPositions[category])) {
              
            // this is a new value, we haven't seen yet so cache
            // its position for lookup of row vals
            categoryPositions[category] = categoryCount;

            // add an empty array to all columns at that position to
            // bin the values
            _.each(columns, function(columnToGroup) {
              var column = this.column(columnToGroup);
              var idCol  = this.column("_id");
              column.data[categoryCount] = [];
              idCol.data[categoryCount] = _.uniqueId();
            }, this);

            // add the actual bin number to the right col
            this.column(byColumn).data[categoryCount] = category;

            categoryCount++;
          }

          _.each(columns, function(columnToGroup) {
            
            var column = this.column(columnToGroup),
                value  = this.parent.column(columnToGroup).data[i],
                binPosition = categoryPositions[category];

            column.data[binPosition].push(this.parent.rowByPosition(i));
          }, this);
        }

        // now iterate over all the bins and combine their
        // values using the supplied method. 
        var oidcol = this._columns[this._columnPositionByName._oids];
        oidcol.data = [];

        _.each(columns, function(colName) {
          var column = this.column(colName);

          _.each(column.data, function(bin, binPos) {
            if (_.isArray(bin)) {
              
              // save the original ids that created this group by?
              oidcol.data[binPos] = oidcol.data[binPos] || [];
              oidcol.data[binPos].push(_.map(bin, function(row) { return row._id; }));
              oidcol.data[binPos] = _.flatten(oidcol.data[binPos]);

              // compute the final value.
              column.data[binPos] = this.method(_.map(bin, function(row) { return row[colName]; }));
              this.length++;
            }
          }, this);

        }, this);

        Miso.Builder.cacheRows(this);
        return this;
      };
      
      // bind the recomputation function to the dataset as the context.
      d.func = _.bind(computeGroupBy, d);

      return d.func.call(d.args);
    }
  });

}(this, _));


(function(global, _) {
  var Miso = (global.Miso || (global.Miso = {}));

  Miso.Importers = function(data, options) {};

  /**
  * Simple base extract method, passing data through
  * If your importer needs to extract the data from the
  * returned payload before converting it to
  * a dataset, overwrite this method to return the
  * actual data object.
  */
  Miso.Importers.prototype.extract = function(data) {
    data = _.clone(data);
    return data;
  };

}(this, _));

(function(global, _) {
  var Miso = (global.Miso || (global.Miso = {}));

  /**
  * Local data importer is responsible for just using
  * a data object and passing it appropriately.
  */
  Miso.Importers.Local = function(options) {
    options = options || {};

    this.data = options.data || null;
    this.extract = options.extract || this.extract;
  };

  _.extend(Miso.Importers.Local.prototype, Miso.Importers.prototype, {
    fetch : function(options) {
      var data = options.data ? options.data : this.data;
      options.success( this.extract(data) );
    }
  });

}(this, _));

(function(global, _) {
  var Miso = (global.Miso || (global.Miso = {}));

  /**
  * A remote importer is responsible for fetching data from a url.
  * Parameters:
  *   options
  *     url - url to query
  *     extract - a method to pass raw data through before handing back to parser.
  *     dataType - ajax datatype
  *     jsonp  - true if it's a jsonp request, false otherwise.
  */
  Miso.Importers.Remote = function(options) {
    options = options || {};

    this._url = options.url;
    this.extract = options.extract || this.extract;

    // Default ajax request parameters
    this.params = {
      type : "GET",
      url : _.isFunction(this._url) ? _.bind(this._url, this) : this._url,
      dataType : options.dataType ? options.dataType : (options.jsonp ? "jsonp" : "json")
    };
  };

  _.extend(Miso.Importers.Remote.prototype, Miso.Importers.prototype, {
    fetch : function(options) {

      // call the original fetch method of object parsing.
      // we are assuming the parsed version of the data will
      // be an array of objects.
      var callback = _.bind(function(data) {
        options.success( this.extract(data) );
      }, this);

      // do we have a named callback? We need to wrap our
      // success callback in this name
      if (this.callback) {
        window[this.callback] = callback;
      }

      // make ajax call to fetch remote url.
      Miso.Xhr(_.extend(this.params, {
        success : this.callback ? this.callback : callback,
        error   : options.error
      }));
    }
  });

  // this XHR code is from @rwldron.
  var _xhrSetup = {
    url       : "",
    data      : "",
    dataType  : "",
    success   : function() {},
    type      : "GET",
    async     : true,
    xhr : function() {
      return new global.XMLHttpRequest();
    }
  }, rparams = /\?/;

  Miso.Xhr = function(options) {

    // json|jsonp etc.
    options.dataType = options.dataType && options.dataType.toLowerCase() || null;

    var url = _.isFunction(options.url) ? options.url() : options.url;

    if (options.dataType &&
      (options.dataType === "jsonp" || options.dataType === "script" )) {

        Miso.Xhr.getJSONP(
          url, 
          options.success,
          options.dataType === "script",
          options.error
        );

        return;
      }

      var settings = _.extend({}, _xhrSetup, options, { url : url });

      // create new xhr object
      settings.ajax = settings.xhr();

      if (settings.ajax) {
        if (settings.type === "GET" && settings.data) {

          //  append query string
          settings.url += (rparams.test(settings.url) ? "&" : "?") + settings.data;

          //  Garbage collect and reset settings.data
          settings.data = null;
        }

        settings.ajax.open(settings.type, settings.url, settings.async);
        settings.ajax.send(settings.data || null);

        return Miso.Xhr.httpData(settings);
      }
  };

  Miso.Xhr.getJSONP = function(url, success, isScript, error) {
    // If this is a script request, ensure that we do not
    // call something that has already been loaded
    if (isScript) {

      var scripts = document.querySelectorAll("script[src=\"" + url + "\"]");

      //  If there are scripts with this url loaded, early return
      if (scripts.length) {

        //  Execute success callback and pass "exists" flag
        if (success) {
          success(true);
        }

        return;
      }
    }

    var head    = document.head ||
    document.getElementsByTagName("head")[0] ||
    document.documentElement,

    script    = document.createElement("script"),
    paramStr  = url.split("?")[ 1 ],
    isFired   = false,
    params    = [],
    callback, parts, callparam;

    // Extract params
    if (paramStr && !isScript) {
      params = paramStr.split("&");
    }
    if (params.length) {
      parts = params[params.length - 1].split("=");
    }
    callback = params.length ? (parts[ 1 ] ? parts[ 1 ] : parts[ 0 ]) : "jsonp";

    if (!paramStr && !isScript) {
      url += "?callback=" + callback;
    }

    if (callback && !isScript) {

      // If a callback name already exists
      if (!!window[callback]) {
        callback = callback + (+new Date()) + _.uniqueId();
      }

      //  Define the JSONP success callback globally
      window[callback] = function(data) {
        if (success) {
          success(data);
        }
        isFired = true;
      };

      //  Replace callback param and callback name
      url = url.replace(parts.join("="), parts[0] + "=" + callback);
    }

    script.onload = script.onreadystatechange = function() {
      if (!script.readyState || /loaded|complete/.test(script.readyState)) {

        //  Handling remote script loading callbacks
        if (isScript) {

          //  getScript
          if (success) {
            success();
          }
        }

        //  Executing for JSONP requests
        if (isFired) {

          //  Garbage collect the callback
          try {
            delete window[callback];
          } catch(e) {
            window[callback] = void 0;
          }
          
          //  Garbage collect the script resource
          head.removeChild(script);
        }
      }
    };

    script.onerror = function(e) {
      if (error) {
        error.call(null);
      }
    };

    script.src = url;
    head.insertBefore(script, head.firstChild);
    return;
  };

  Miso.Xhr.httpData = function(settings) {
    var data, json = null;

    settings.ajax.onreadystatechange = function() {
      if (settings.ajax.readyState === 4) {
        try {
          json = JSON.parse(settings.ajax.responseText);
        } catch (e) {
          // suppress
        }

        data = {
          xml : settings.ajax.responseXML,
          text : settings.ajax.responseText,
          json : json
        };

        if (settings.dataType) {
          data = data[settings.dataType];
        }

        // if we got an ok response, call success, otherwise fail.
        if (/(2..)/.test(settings.ajax.status)) {
          settings.success.call(settings.ajax, data);
        } else {
          if (settings.error) {
            settings.error.call(null, settings.ajax.statusText);
          }
        }
      }
    };

    return data;
  };

}(this, _));

(function(global,_){
  
  var Miso = (global.Miso || (global.Miso = {}));

  /**
  * A remote polling importer that queries a url once every 1000
  * seconds.
  * Parameters:
  *   interval - poll every N milliseconds. Default is 1000.
  *   extract  - a method to pass raw data through before handing back to parser.
  */
  Miso.Importers.Polling = function(options) {
    options = options || {};
    this.interval = options.interval || 1000;
    this._def = null;

    Miso.Importers.Remote.apply(this, [options]);
  };

  _.extend(Miso.Importers.Polling.prototype, Miso.Importers.Remote.prototype, {
    fetch : function(options) {

      if (this._def === null) {

        this._def = _.Deferred();

        // wrap success with deferred resolution
        this.success_callback = _.bind(function(data) {
          options.success(this.extract(data));
          this._def.resolve(this);
        }, this);

        // wrap error with defered rejection
        this.error_callback = _.bind(function(error) {
          options.error(error);
          this._def.reject(error);
        }, this);
      } 

      // on success, setTimeout another call
      _.when(this._def.promise()).then(function(importer) {
        
        var callback = _.bind(function() {
          this.fetch({
            success : this.success_callback,
            error   : this.error_callback
          });
        }, importer);

        importer._timeout = setTimeout(callback, importer.interval);
        // reset deferred
        importer._def = _.Deferred();
      });

      Miso.Xhr(_.extend(this.params, {
        success : this.success_callback,
        error : this.error_callback
      }));

      global.imp = this;
    },

    stop : function() {
      if (this._def !== null) {
        this._def.reject();
      }
      if (typeof this._timeout !== "undefined") {
        clearTimeout(this._timeout);
      }
    },

    start : function() {
      if (this._def !== null) {
        this._def = _.Deferred();
        this.fetch();
      }
    }
  });

}(this, _));

(function(global, _) {

  var Miso = (global.Miso || (global.Miso = {}));
  
  /**
  * Instantiates a new google spreadsheet importer.
  * Parameters
  *   options - Options object. Requires at the very least:
  *     key - the google spreadsheet key
  *     gid - the index of the spreadsheet to be retrieved (1 default)
  *       OR
  *     sheetName - the name of the sheet to fetch ("Sheet1" default)
  *   OR
  *     url - a more complex url (that may include filtering.) In this case
  *           make sure it's returning the feed json data.
  */
  Miso.Importers.GoogleSpreadsheet = function(options) {
    options = options || {};
    if (options.url) {

      options.url = options.url;

    } else {

      if (_.isUndefined(options.key)) {

        throw new Error("Set options 'key' properties to point to your google document.");
      } else {

        // turning on the "fast" option will use the farser parser
        // that downloads less data but it's flakier (due to google not
        // correctly escaping various strings when returning json.)
        if (options.fast) {
          
          options.url = "https://spreadsheets.google.com/tq?key=" + options.key;
                  
          if (options.sheetName) {
            options.url += "&sheet=" + options.sheetName;
          } else {
            options.url += "&gid=" + (options.worksheet || 1);  
            delete options.worksheet;
          }

          this.callback = "misodsgs" + new Date().getTime();
          options.url += "&tqx=version:0.6;responseHandler:" + this.callback;
          options.url += ";reqId:0;out:json&tq&_=1335871249558#";

          delete options.sheetName;

        } else {
          options.url = "https://spreadsheets.google.com/feeds/cells/" + 
          options.key + "/" + 
          options.worksheet + 
          "/public/basic?alt=json-in-script&callback=";
        }
        
        delete options.key;
      }
    }
    
    this.params = {
      type : "GET",
      url : options.url,
      dataType : "jsonp"
    };

    return this;
  };

  _.extend(Miso.Importers.GoogleSpreadsheet.prototype, Miso.Importers.Remote.prototype);

}(this, _));
(function(global, _) {

  var Miso = (global.Miso || (global.Miso = {}));

  /**
  * Base Miso.Parser class.
  */
  Miso.Parsers = function( options ) {
    this.options = options || {};
  };

  _.extend(Miso.Parsers.prototype, {

    //this is the main function for the parser,
    //it must return an object with the columns names
    //and the data in columns
    parse : function() {}

  });
}(this, _));

(function(global, _) {
  var Miso = (global.Miso || (global.Miso = {}));

  /**
  * Strict format parser.
  * Handles basic strict data format.
  * Looks like: {
  *   data : {
  *     columns : [
  *       { name : colName, type : colType, data : [...] }
  *     ]
  *   }
  * }
  */
  Miso.Parsers.Strict = function( options ) {
    this.options = options || {};
  }; 

  _.extend( Miso.Parsers.Strict.prototype, Miso.Parsers.prototype, {

    parse : function( data ) {
      var columnData = {}, columnNames = [];

      _.each(data.columns, function(column) {
        columnNames.push( column.name );
        columnData[ column.name ] = column.data;
      });

      return {
        columns : columnNames,
        data : columnData 
      };
    }

  });

}(this, _));

(function(global, _) {
  var Miso = (global.Miso || (global.Miso = {}));

  /**
  * Object parser
  * Converts an array of objects to strict format.
  * Each object is a flat json object of properties.
  */
  Miso.Parsers.Obj = Miso.Parsers;

  _.extend(Miso.Parsers.Obj.prototype, Miso.Parsers.prototype, {

    parse : function( data ) {
      var columns = _.keys(data[0]),
          columnData = {};

      //create the empty arrays
      _.each(columns, function( key ) {
        columnData[ key ] = [];
      });

      // iterate over properties in each row and add them
      // to the appropriate column data.
      _.each(columns, function( col ) {
        _.times(data.length, function( i ) {
          columnData[ col ].push( data[i][col] );
        });
      });
     
      return {
        columns : columns,
        data : columnData 
      };
    }

  });

}(this, _));

// --------- Google Spreadsheet Parser -------
// 

(function(global, _) {

  var Miso = (global.Miso || (global.Miso = {}));
  /**
  * Google Spreadsheet Parser. 
  * This is utilizing the format that can be obtained using this:
  * http://code.google.com/apis/gdata/samples/spreadsheet_sample.html
  * Used in conjunction with the Google Spreadsheet Importer.
  */
  Miso.Parsers.GoogleSpreadsheet = function(options) {
    this.fast = options.fast || false;
  };

  _.extend(Miso.Parsers.GoogleSpreadsheet.prototype, Miso.Parsers.prototype, {

    parse : function(data) {
      var columns = [],
          columnData = [],  
          keyedData = {},
          i;

      if (this.fast) {

        // init column names
        columns = _.pluck(data.table.cols, "label");

        // save data
        _.each(data.table.rows, function(row) {
          row = row.c;
          for(i = 0; i < row.length; i++) {
            columnData[i] = columnData[i] || [];
            if (row[i].v === "") {
              columnData[i].push(null);  
            } else {
              columnData[i].push(row[i].v);
            }
          }
        });

        // convert to keyed data.
        _.each(columns, function(colName, index) {
          keyedData[colName] = columnData[index];
        });

      } else {
        var positionRegex = /([A-Z]+)(\d+)/,
            columnPositions = {};

        _.each(data.feed.entry, function(cell, index) {

          var parts = positionRegex.exec(cell.title.$t),
          column = parts[1],
          position = parseInt(parts[2], 10);

          if (_.isUndefined(columnPositions[column])) {

            // cache the column position
            columnPositions[column] = columnData.length;

            // we found a new column, so build a new column type.
            columns[columnPositions[column]]    = cell.content.$t;
            columnData[columnPositions[column]] = [];


          } else {

            // find position: 
            var colpos = columnPositions[column];

            // this is a value for an existing column, so push it.
            columnData[colpos][position-1] = cell.content.$t; 

          }
        }, this);

        _.each(columnData, function(coldata, column) {
          // fill whatever empty spaces we might have in the data due to empty cells
          coldata.length = _.max(_.pluck(columnData, "length"));

          // slice off first space. It was alocated for the column name
          // and we've moved that off.
          coldata.splice(0,1);

          for (var i = 0; i < coldata.length; i++) {
            if (_.isUndefined(coldata[i]) || coldata[i] === "") {
              coldata[i] = null;
            }
          }

          keyedData[columns[column]] = coldata;
        });

      }
      
      return {
        columns : columns,
        data : keyedData
      };
    }

  });
}(this, _));


(function(global, _) {

  var Miso = (global.Miso || (global.Miso = {}));

  /**
  * Delimited data parser.
  * Handles CSV and other delimited data. 
  * Parameters:
  *   options
  *     delimiter : ","
  */
  Miso.Parsers.Delimited = function(options) {
    options = options || {};

    this.delimiter = options.delimiter || ",";

    this.skipRows = options.skipRows || 0;

    this.emptyValue = options.emptyValue || null;

    this.__delimiterPatterns = new RegExp(
      (
        // Delimiters.
        "(\\" + this.delimiter + "|\\r?\\n|\\r|^)" +

        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

        // Standard fields.
        "([^\"\\" + this.delimiter + "\\r\\n]*))"
      ),
      "gi"
    );
  };

  // Ie is not aware of trim method...
  if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, ''); 
    };
  }

  _.extend(Miso.Parsers.Delimited.prototype, Miso.Parsers.prototype, {

    parse : function(data) {
      var columns = [];
      var columnData = {};

      var parseCSV = function(delimiterPattern, strData, strDelimiter, skipRows, emptyValue) {

        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;

        // track how many columns we have. Once we reach a new line
        // mark a flag that we're done calculating that.
        var columnCount = 0;
        var columnCountComputed = false;

        // track which column we're on. Start with -1 because we increment it before
        // we actually save the value.
        var columnIndex = -1;

        // track which row we're on
        var rowIndex = 0;

        try {

          // trim any empty lines at the end
          strData = strData.trim();

          // do we have any rows to skip? if so, remove them from the string
          if (skipRows > 0) {
            var rowsSeen = 0,
                charIndex = 0,
                strLen = strData.length;

            while (rowsSeen < skipRows && charIndex < strLen) {
              if (/\n|\r|\r\n/.test(strData[charIndex])) {
                rowsSeen++;
              } 
              charIndex++;
            }

            strData = strData.slice(charIndex, strLen);
          }

          // Keep looping over the regular expression matches
          // until we can no longer find a match.
          while (arrMatches = delimiterPattern.exec(strData)) {

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if ( strMatchedDelimiter.length &&
               ( strMatchedDelimiter !== strDelimiter )){
                
                // we have reached a new row.
                rowIndex++;

                // if we caught less items than we expected, throw an error
                if (columnIndex < columnCount-1) {
                  rowIndex--;
                  throw new Error("Not enough items in row");
                }

                // We are clearly done computing columns.
                columnCountComputed = true;

                // when we're done with a row, reset the row index to 0
                columnIndex = 0;
              
              } else {

                // Find the number of columns we're fetching and
                // create placeholders for them.
                if (!columnCountComputed) {
                  columnCount++;
                }

                columnIndex++;
              }


              // Now that we have our delimiter out of the way,
              // let's check to see which kind of value we
              // captured (quoted or unquoted).
              var strMatchedValue = null;
              if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                  new RegExp( "\"\"", "g" ),
                  "\""
                );

              } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];
              }


              // Now that we have our value string, let's add
              // it to the data array.
              
              if (columnCountComputed) {

                if (strMatchedValue === '') {
                  strMatchedValue = emptyValue;
                }

                if (typeof columnData[columns[columnIndex]] === "undefined") {
                  throw new Error("Too many items in row"); 
                }
                
                columnData[columns[columnIndex]].push(strMatchedValue);  
          
              } else {
                // we are building the column names here
                columns.push(strMatchedValue);
                columnData[strMatchedValue] = [];
              }
            
          } // end while
        } catch (e) {
          throw new Error("Error while parsing delimited data on row " + rowIndex + ". Message: " + e.message);
        }

        // Return the parsed data.
        return {
          columns : columns,
          data : columnData
        };
      };

      return parseCSV(
        this.__delimiterPatterns, 
        data, 
        this.delimiter,
        this.skipRows,
        this.emptyValue);
    }

  });


}(this, _));
