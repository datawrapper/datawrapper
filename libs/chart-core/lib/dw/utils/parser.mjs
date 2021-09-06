import { TEOF } from '@datawrapper/expr-eval/src/token.js';
import { TokenStream } from '@datawrapper/expr-eval/src/token-stream.js';
import { ParserState } from '@datawrapper/expr-eval/src/parser-state.js';
import {
    add,
    sub,
    mul,
    div,
    mod,
    equal,
    notEqual,
    greaterThan,
    lessThan,
    greaterThanEqual,
    lessThanEqual,
    andOperator,
    orOperator,
    // inOperator,
    // sinh,
    // cosh,
    // tanh,
    // asinh,
    // acosh,
    // atanh,
    log10,
    neg,
    not,
    trunc,
    random,
    // factorial,
    // gamma,
    stringOrArrayLength,
    // hypot,
    condition,
    roundTo,
    // setVar,
    arrayIndex,
    max,
    min,
    sum,
    arrayMap,
    arrayFold,
    arrayFilter,
    // stringOrArrayIndexOf,
    // arrayJoin,
    sign,
    // cbrt,
    // expm1,
    log1p,
    log2
} from '@datawrapper/expr-eval/src/functions.js';

// expression
import evaluate from '@datawrapper/expr-eval/src/evaluate.js';

function Expression(tokens, parser) {
    this.tokens = tokens;
    this.parser = parser;
    this.unaryOps = parser.unaryOps;
    this.binaryOps = parser.binaryOps;
    this.ternaryOps = parser.ternaryOps;
    this.functions = parser.functions;
}

Expression.prototype.evaluate = function(values) {
    values = values || {};
    return evaluate(this.tokens, this, values);
};

Expression.prototype.variables = function() {
    return (this.tokens || []).filter(token => token.type === 'IVAR').map(token => token.value);
};

function trim(s) {
    return s.trim();
}

// parser
export function Parser(options) {
    this.options = options || {};
    this.unaryOps = {
        /**
         * Sine (trigonometric function)
         *
         * @method SIN
         * @returns {number}
         * @example
         * SIN PI
         * SIN(PI)
         */
        SIN: Math.sin,
        /**
         * Cosine (trigonometric function)
         *
         * @method COS
         * @returns {number}
         * @example
         * COS PI
         * COS(PI)
         */
        COS: Math.cos,
        /**
         * Tangent (trigonometric function)
         *
         * @method TAN
         * @returns {number}
         * @example
         * TAN PI
         * TAN(PI)
         */
        TAN: Math.tan,
        /**
         * Arcus sine (inverse tigonometric function)
         *
         * @method ASIN
         * @returns {number}
         */
        ASIN: Math.asin,
        /**
         * Arcus cosine (inverse trigonometric function)
         *
         * @method ACOS
         * @returns {number}
         */
        ACOS: Math.acos,
        /**
         * Arcus tangent (inverse trigonometric function)
         *
         * @method ATAN
         * @returns {number}
         */
        ATAN: Math.atan,
        /**
         * Computes the square root
         *
         * @method SQRT
         * @returns {number}
         * @example
         * SQRT 9 // 3
         * SQRT(9) // 3
         */
        SQRT: Math.sqrt,
        /**
         * Returns the natural logarithm (base `e`) of a number
         *
         * @method LOG
         * @returns {number}
         * @example
         * LOG x
         */
        LOG: Math.log,
        /**
         * Returns the base 2 logarithm of a number
         *
         * @method LOG2
         * @returns {number}
         * @example
         * LOG2 8 // 3
         */
        LOG2: Math.log2 || log2,
        /**
         * Alias for {@link LOG}
         * @method LN
         * @returns {number}
         * @alias LOG
         */
        LN: Math.log,
        /**
         * Returns the base 10 logarithm of a number
         *
         * @method LOG10
         * @alias LG
         * @returns {number}
         * @example
         * LOG10 10 // 1
         * LOG10(100) // 2
         * LOG10(1000) // 3
         */
        LOG10: Math.log10 || log10,
        /**
         * Alias for {@link LOG10}
         * @method LG
         * @returns {number}
         * @alias LOG10
         */
        LG: Math.log10 || log10,
        LOG1P: Math.log1p || log1p,
        /**
         * Absolute number
         *
         * @method ABS
         * @example
         * ABS -10 // 10
         * @returns {number}
         */
        ABS: Math.abs,
        /**
         * Round number to next largest integer
         *
         * @method CEIL
         * @example
         * CEIL 2.3 // 3
         * CEIL(2.7) // 3
         * @returns {number}
         * @see {@link FLOOR}, {@link ROUND}, {@link TRUNC}
         */
        CEIL: Math.ceil,
        /**
         * Round number to the next smallest integer
         *
         * @method FLOOR
         * @example
         * FLOOR 2.3 // 2
         * FLOOR 2.7 // 2
         * FLOOR -5.05 // -6
         * @see {@link CEIL}, {@link ROUND}, {@link TRUNC}
         * @returns {number}
         */
        FLOOR: Math.floor,
        /**
         * Checks if an expression is NULL
         *
         * @method ISNULL
         * @example
         * ISNULL 0 // false
         * ISNULL NULL // true*
         * @returns {boolean}
         */
        ISNULL(a) {
            return a === null;
        },
        /**
         * Returns the integer part of a number by removing any fractional digits
         * @method TRUNC
         * @returns {number}
         * @see {@link CEIL}, {@link ROUND}, {@link FLOOR}
         * @example
         * TRUNC 5.05 // 5
         * TRUNC -5.05 // -5
         */
        TRUNC: Math.trunc || trunc,
        '-': neg,
        '+': Number,
        /**
         * Returns `e^x` where `e` is the Euler's number
         * @method EXP
         * @returns {number}
         * @example
         * LOG(EXP(4)) // 4
         */
        EXP: Math.exp,
        /**
         * Negates a boolean expression
         * @method NOT
         * @returns {boolean}
         * @example
         * NOT 3 > 5 // true
         */
        NOT: not,
        /**
         * Returns the length of an array or strng
         * @method LENGTH
         * @returns {number}
         * @example
         * LENGTH 'hello' // 5
         * LENGTH [1,2,3] // 3
         */
        LENGTH: stringOrArrayLength,
        /**
         * Alias for {@link NOT}
         * @method !
         * @alias NOT
         */
        '!': not,
        /**
         * returns either a positive or negative +/- 1, indicating the sign of a number passed
         * @example
         * SIGN 35 // 1
         * SIGN -6 // -1
         * @returns {number}
         */
        SIGN: Math.sign || sign,
        /**
         * Converts a value to a string
         * @method TEXT
         * @returns {string}
         * @example
         * TEXT 12.5 // '12.5'
         * @see {@link NUMBER}
         */
        TEXT(value) {
            if (isDate(value)) {
                return value.toISOString();
            }
            return String(value);
        },
        /**
         * Converts a value to a number
         * @method NUMBER
         * @returns {number}
         * @example
         * NUMBER '12.5' // 12.5
         * @see {@link TEXT}
         */
        NUMBER: Number
    };

    this.binaryOps = {
        '+': add,
        '-': sub,
        '*': mul,
        '/': div,
        '%': mod,
        '^': Math.pow,
        '==': equal,
        '!=': notEqual,
        '>': greaterThan,
        '<': lessThan,
        '>=': greaterThanEqual,
        '<=': lessThanEqual,
        and: andOperator,
        or: orOperator,
        in: (needle, haystack) =>
            Array.isArray(haystack) ? haystack.includes(needle) : String(haystack).includes(needle),
        '[': arrayIndex
    };

    this.ternaryOps = {
        '?': condition
    };

    const isDate = d => d instanceof Date && !isNaN(d);
    const asDate = d => {
        if (isDate(d)) return d;
        try {
            const n = new Date(d);
            if (isDate(n)) return n;
            return null;
        } catch (e) {
            return null;
        }
    };
    function filterNumbers(array) {
        return (arguments.length === 1 && Array.isArray(array) ? array : Array.from(arguments))
            .slice(0)
            .filter(v => !isNaN(v) && Number.isFinite(v));
    }
    // fallback regular expressions for browsers without
    // support for the unicode flag //u
    let PROPER_REGEX = /\w*/g;
    let TITLE_REGEX = /\w\S*/g;
    const ESCAPE_REGEX = /[\\^$*+?.()|[\]{}]/g;

    try {
        PROPER_REGEX = new RegExp('\\p{L}*', 'ug');
        TITLE_REGEX = new RegExp('[\\p{L}\\p{N}]\\S*', 'ug');
    } catch (e) {
        // continue regardless of error
    }

    this.functions = {
        // ---- LOGICAL FUNCTIONS ----

        /**
         * if-else statement
         *
         * @method IF
         *
         * @param boolean condition
         * @param expr  yay   expression to use if condition is `TRUE`
         * @param expr  nay   expression to use if condition is `FALSE`
         * @example IF(temp_diff > 0, "hotter", "colder")
         * // note: you can also use the shorthand ? notaton:
         * temp_diff > 0 ? "hotter" : "colder"
         */
        IF: condition,

        // ---- MATH FUNCTIONS ----

        /**
         * Generate a random real number between 0 and 1 when used without arguments, or between 0 and the passed number
         *
         * @method RANDOM
         * @param number  max value (optional)
         * @example RANDOM()
         * RANDOM(100)
         * @returns {number}
         */
        RANDOM: random,
        // fac: factorial,

        /**
         * Returns the smallest of the given numbers
         *
         * @method MIN
         * @example
         * MIN(1,2,3) // 1
         * MIN([1,2,3]) // 1
         * @returns {number}
         */
        MIN() {
            const v = filterNumbers.apply(this, arguments);
            return min(v);
        },

        /**
         * Returns the largest of the given numbers
         *
         * @method MAX
         * @example
         * MAX(1,2,3) // 3
         * MAX([1,2,3]) // 3
         * @returns {number}
         */
        MAX() {
            return max(filterNumbers.apply(this, arguments));
        },

        /**
         * Returns the sum of the given numbers
         *
         * @method SUM
         *
         * @example
         * SUM(1,2,3) // 6
         * SUM([1,2,3]) // 6
         * @returns {number}
         */
        SUM() {
            return sum(filterNumbers.apply(this, arguments));
        },

        /**
         * Returns the average of the given numbers
         *
         * @method MEAN
         * @example
         * MEAN(1,2,4,8) // 3.75
         * MEAN([1,2,4,8]) // 3.75
         * @returns {number}
         * @see {@link MEDIAN}
         */
        MEAN() {
            const v = filterNumbers.apply(this, arguments);
            return sum(v) / v.length;
        },

        /**
         * Returns the median of the given numbers
         *
         * @method MEDIAN
         * @example
         * MEDIAN(1,2,4,8) // 3
         * MEDIAN([1,2,4,8]) // 3
         * @returns {number}
         * @see {@link MEAN}
         */
        MEDIAN() {
            const v = filterNumbers.apply(this, arguments).sort((a, b) => a - b);
            const i = Math.floor(v.length / 2);
            return v.length % 2 === 1 ? v[i] : (v[i - 1] + v[i]) * 0.5;
        },

        /**
         * Computes the power of a number
         *
         * @method POW
         * @example
         * POW(2,3) // 8
         * POW(4,2) // 16
         * @returns {number}
         */
        POW: Math.pow,

        /**
         * Computes the atan2, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
         *
         * @method ATAN2
         * @example
         * ATAN2(2,3) // 8
         * ATAN2(4,2) // 16
         * @returns {number}
         */
        ATAN2: Math.atan2,

        /**
         * Rounds a number (to a given number of decimals)
         *
         * @method ROUND
         * @example
         * ROUND(3.1415) // 3
         * ROUND(3.1415, 2) // 3.14
         * @returns {number}
         * @see {@link FLOOR}, {@link CEIL}
         */
        ROUND: roundTo,

        // ---- STRING FUNCTIONS ----
        /**
         * Concatenate two or more strings
         *
         * @method CONCAT
         * @example
         * CONCAT("<b>", name, "</b>")
         * @returns {string}
         */
        CONCAT() {
            return Array.from(arguments).join('');
        },
        /**
         * Removes whitespaces at the beginning and end of a string
         *
         * @method TRIM
         * @returns {string}
         * @example
         * TRIM("  hello ") // 'hello'
         */
        TRIM: trim,
        /**
         * Extracts a part of a string
         *
         * @method SUBSTR
         * @param string the input string
         * @param number start
         * @param number end
         * @example
         * SUBSTR("This is fine", 5,7) // 'is'
         * @returns {string}
         */
        SUBSTR(s, start, end) {
            return s.substr(start, end);
        },
        /**
         * Replaces all occurances of a string with another string
         *
         * @method REPLACE
         * @param string the input string
         * @param string the search string
         * @param string the replacement string or function
         * @example
         * REPLACE("hello name", "name", "world") // 'hello world'
         * REPLACE("hello name", "name", TITLE) // 'hello Name'
         * REPLACE("hello name", "name", f(d) = CONCAT("<b>", d, "</b>")) // 'hello <b>name</b>'
         * @returns {string}
         * @see {@link REPLACE_REGEX}
         */
        REPLACE(str, search, replace) {
            return str.replace(
                new RegExp(String(search).replace(ESCAPE_REGEX, '\\$&'), 'g'),
                replace
            );
        },
        /**
         * Like REPLACE, but interprets the search string as regular expression
         *
         * @method REPLACE_REGEX
         * @param string the input string
         * @param string the search regex
         * @param string the replacement string or function
         * @example
         * REPLACE_REGEX("hello 123 world", "[0-9]", '#') // 'hello ### world'
         * REPLACE_REGEX("hello 123 world", "[0-9]+", '#') // 'hello # world'
         * @returns {string}
         * @see {@link REPLACE}
         */
        REPLACE_REGEX(str, regex, replace) {
            return str.replace(new RegExp(regex, 'g'), replace);
        },
        /**
         * Splits a string into an array
         *
         * @method SPLIT
         * @param string the input string
         * @param string the separator string
         * @example
         * SPLIT("hello world", " ") // ['hello', 'world']
         * @returns {array}
         */
        SPLIT(str, sep) {
            return String(str).split(sep);
        },
        /**
         * Lowercase a string
         *
         * @method LOWER
         * @example
         * LOWER("Hello World") // 'hello world'
         * @returns {string}
         * @see {@link UPPER}, {@link TITLE}, {@link PROPER}
         */
        LOWER(str) {
            return String(str).toLowerCase();
        },
        /**
         * Uppercase a string
         *
         * @method UPPER
         * @example
         * UPPER("Hello World") // 'HELLO WORLD'
         * @returns {string}
         * @see {@link LOWER}, {@link TITLE}, {@link PROPER}
         */
        UPPER(str) {
            return String(str).toUpperCase();
        },
        /**
         * Convert a string to title-case. Like `TITLE`, but better for names.
         *
         * @method PROPER
         * @example
         * PROPER("hello WoRLd") // 'Hello World'
         * PROPER("2-WAY STREET") // '2-Way Street'
         * PROPER("baron lloyd-webber") // 'Baron Lloyd-Webber'
         * @returns {string}
         * @see {@link TITLE}
         */
        PROPER(str) {
            return String(str).replace(
                PROPER_REGEX,
                txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },
        /**
         * Convert a string to title-case. Like `PROPER`, but better for headlines.
         *
         * @method TITLE
         * @example
         * TITLE("hello WoRLd") // 'Hello World'
         * TITLE("2-WAY STREET") // '2-way Street'
         * TITLE("baron lloyd-webber") // 'Baron Lloyd-webber'
         * @returns {string}
         * @see {@link PROPER}
         */
        TITLE(str) {
            return String(str).replace(
                TITLE_REGEX,
                txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },

        // ARRAY FUNCTIONS
        /**
         * Sort an array ascending or descending
         *
         * @method SORT
         * @param array the input array
         * @param boolean true for ascending, false for descending
         * @param string key to sort by (optional)
         * @example
         * SORT([5,2,4,1]) // [1,2,4,5]
         * SORT(countries, false, 'population')
         * @returns {array}
         */
        SORT(arr, asc = true, key = null) {
            if (!Array.isArray(arr)) {
                throw new Error('First argument to SORT is not an array');
            }
            return arr.slice(0).sort((a, b) => {
                a = typeof key === 'string' ? a[key] : typeof key === 'function' ? key(a) : a;
                b = typeof key === 'string' ? b[key] : typeof key === 'function' ? key(b) : b;
                return (a > b ? 1 : a < b ? -1 : 0) * (asc ? 1 : -1);
            });
        },
        /**
         * Slice an array (extract a part of array)
         *
         * @method SLICE
         * @param array the input array
         * @param number start index
         * @param number end index
         * @example
         * SLICE([1,2,3,4,5], 1) // [2,3,4,5]
         * SLICE([1,2,3,4,5], 1,3) // [2,3]
         * SLICE([1,2,3,4,5], -2) // [4,5]
         * @returns {array}
         */
        SLICE(arr, start, end) {
            if (!Array.isArray(arr)) {
                throw new Error('First argument to SLICE is not an array');
            }
            return arr.slice(start, end);
        },
        /**
         * Join array elements into a string
         *
         * @method JOIN
         * @param array the input array
         * @param string the glue string
         * @param string alternative glue string for the last join (optional)
         * @returns {string}
         * @example
         * JOIN(['USA', 'Canada', 'Mexico'], ', ') // 'USA, Canada, Mexico'
         * JOIN(['USA', 'Canada', 'Mexico'], ', ', ', and ') // 'USA, Canada, and Mexico'
         */
        JOIN(arr, sep, sepLast = null) {
            if (!Array.isArray(arr)) {
                throw new Error('First argument to JOIN is not an array');
            }
            return sepLast
                ? [arr.slice(0, arr.length - 1).join(sep), arr[arr.length - 1]].join(sepLast)
                : arr.join(sep);
        },
        /**
         * Evaluate function for each element in an array
         *
         * @method MAP
         * @param function the function to call
         * @param array the input array
         * @returns {array}
         * @example
         * MAP(UPPER, ['USA', 'Canada', 'Mexico']) // ['USA', 'CANADA', 'MEXICO']
         * MAP(f(s) = SUBSTR(s, 0, 2), ['USA', 'Canada', 'Mexico']) // ['US', 'Ca', 'Me']
         */
        MAP: arrayMap,
        /**
         * Fold array into a single value, good for more complex aggregations
         *
         * @method FOLD
         * @param function the function to call
         * @param * intial value
         * @param array the input array
         * @returns {}
         * @example
         * FOLD(f(a,b) = a * b, 1, [1,2,3,4,5]) // 120
         */
        FOLD: arrayFold,
        /**
         * Filter elements of an array using a function
         *
         * @method FILTER
         * @param function the function to test elements
         * @param array the input array
         * @returns {array}
         * @example
         * FILTER(f(x) = x > 2, [1, 2, 0, 3, -1, 5]) // [3, 5]
         * FILTER(f(x) = x >= 2, [1, 2, 0, 3, -1, 5]) // [2, 3, 5]
         */
        FILTER: arrayFilter,
        /**
         * Extract values from an array of objects
         *
         * @method PLUCK
         * @param array the input array of objects
         * @param string the key
         * @returns {array}
         * @example
         * PLUCK(countries, 'name')
         * PLUCK(countries, 'population')
         */
        PLUCK(arr, key) {
            if (!Array.isArray(arr)) throw new Error('First argument to PLUCK is not an array');
            return arr.map(item =>
                Object.prototype.hasOwnProperty.call(item, key) ? item[key] : null
            );
        },
        /**
         * Returns the index of the first occurance of an element in an array (or -1 if it's not in the array)
         *
         * @method INDEXOF
         * @param array the input array of objects
         * @param * target
         * @returns {number}
         * @example
         * INDEXOF(['a', 'b', 'c'], 'b') // 1
         * INDEXOF(['a', 'b', 'c'], 'd') // -1
         * @see {@link FIND}
         */
        INDEXOF(arr, target) {
            if (!Array.isArray(arr)) arr = String(arr);
            return arr.indexOf(target);
        },
        /**
         * Returns the first element of an array for which the test function returns true
         *
         * @method FIND
         * @param array the input array of objects
         * @param function test function
         * @returns {*}
         * @example
         * FIND([1,2,3,4,5,6], f(d) = d > 3) // 4
         * @see {@link INDEXOF}
         */
        FIND(arr, test) {
            if (!Array.isArray(arr)) throw new Error('First argument to FIND is not an array');
            if (typeof test !== 'function')
                throw new Error('Second argument to FIND is not a function');
            const k = arr.length;
            for (let i = 0; i < k; i++) {
                if (test(arr[i])) return arr[i];
            }
            return null;
        },
        /**
         * Creates an array of numbers
         *
         * @method RANGE
         * @param number start value
         * @param number stop value (not included)
         * @param number step to increment each
         * @returns {array}
         * @example
         * RANGE(0,5) // [0,1,2,3,4]
         * RANGE(0,5,2) // [0,2,4]
         * RANGE(0,1,0.25) // [0,0.25,0.5,0.75]
         */
        RANGE(start, stop, step) {
            // borrowed from https://github.com/jashkenas/underscore/blob/master/modules/range.js
            if (stop == null) {
                stop = start || 0;
                start = 0;
            }
            if (!step) {
                step = stop < start ? -1 : 1;
            }

            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var range = Array(length);

            for (var idx = 0; idx < length; idx++, start += step) {
                range[idx] = start;
            }

            return range;
        },
        /**
         * Returns TRUE if the test function is TRUE for every element in the arrat
         *
         * @method EVERY
         * @param array the input array
         * @param function the test function
         * @returns {boolean}
         * @see {@link SOME}
         * @example
         * EVERY([5,8,4,7,3], f(d) = d > 2) // true
         * EVERY([5,8,4,7,3], f(d) = d < 6) // false
         */
        EVERY(arr, test) {
            if (!Array.isArray(arr)) throw new Error('First argument to EVERY is not an array');
            if (typeof test !== 'function')
                throw new Error('Second argument to EVERY is not a function');
            const k = arr.length;
            let every = true;
            for (let i = 0; i < k; i++) {
                every = every && test(arr[i]);
                if (!every) return false;
            }
            return true;
        },
        /**
         * Returns `true` if the test function is `true` for at least one element in the arrat
         *
         * @method SOME
         * @param array the input array
         * @param function the test function
         * @returns {boolean}
         * @see {@link EVERY}
         * @example
         * SOME([5,8,4,7,3], f(d) = d > 2) // true
         * SOME([5,8,4,7,3], f(d) = d < 6) // true
         * SOME([5,8,4,7,3], f(d) = d < 2) // false
         */
        SOME(arr, test) {
            if (!Array.isArray(arr)) throw new Error('First argument to SOME is not an array');
            if (typeof test !== 'function')
                throw new Error('Second argument to SOME is not a function');
            const k = arr.length;
            let some = false;
            for (let i = 0; i < k; i++) {
                some = some || test(arr[i]);
                if (some) return true;
            }
            return false;
        },

        // ---- DATE FUNCTIONS ----
        /**
         * Constructs a new date object
         *
         * @method DATE
         * @param number year
         * @param number month
         * @param number day
         * @returns {date}
         * @example
         * DATE(2020, 1, 1) // January 1st, 2020
         */
        DATE() {
            if (arguments.length > 1) {
                // "correct" month argument (1=january, etc)
                arguments[1] = arguments[1] - 1;
            }
            return new Date(...arguments);
        },
        /**
         * Returns the year of a date
         *
         * @method YEAR
         * @param date the input date
         * @returns {number}
         * @see {@link MONTH},{@link DAY}
         * @example
         * YEAR(DATE(2020, 1, 1)) // 2020
         */
        YEAR(d) {
            d = asDate(d);
            return d ? d.getFullYear() : null;
        },
        /**
         * Returns the month of a date (1-12)
         *
         * @method MONTH
         * @param date the input date
         * @returns {number}
         * @see {@link YEAR},{@link DAY}
         * @example
         * MONTH(DATE(2020, 6, 1)) // 6
         */
        MONTH(d) {
            d = asDate(d);
            return d ? d.getMonth() + 1 : null;
        },
        /**
         * Returns the day of a date (1-31)
         *
         * @method DAY
         * @param date the input date
         * @returns {number}
         * @see {@link WEEKDAY},{@link YEAR},{@link MONTH},{@link DAY}
         * @example
         * DAY(DATE(2020, 6, 1)) // 1
         */
        DAY(d) {
            d = asDate(d);
            return d ? d.getDate() : null;
        },
        /**
         * Returns the weekday of a date (0 = Sunday, 1 = Monday, etc)
         *
         * @method WEEKDAY
         * @param date the input date
         * @returns {number}
         * @see {@link DAY}
         * @example
         * WEEKDAY(DATE(2020, 5, 10)) // 0
         */
        WEEKDAY(d) {
            d = asDate(d);
            return d ? d.getDay() : null;
        },
        /**
         * Returns the hours of a date (0-23)
         *
         * @method HOURS
         * @param date the input date
         * @returns {number}
         * @see {@link DAY},{@link MINUTES},{@link SECONDS}
         * @example
         * HOURS(time)
         */
        HOURS(d) {
            d = asDate(d);
            return d ? d.getHours() : null;
        },
        /**
         * Returns the minutes of a date (0-59)
         *
         * @method MINUTES
         * @param date the input date
         * @returns {number}
         * @see {@link HOURS},{@link SECONDS}
         * @example
         * MINUTES(time)
         */
        MINUTES(d) {
            d = asDate(d);
            return d ? d.getMinutes() : null;
        },
        /**
         * Returns the seconds of a date (0-59)
         *
         * @method SECONDS
         * @param date the input date
         * @returns {number}
         * @see {@link HOURS},{@link MINUTES}
         * @example
         * SECONDS(time)
         */
        SECONDS(d) {
            d = asDate(d);
            return d ? d.getSeconds() : null;
        },
        /**
         * Computes the  number of days between two dates
         *
         * @method DATEDIFF
         * @param date the input date 1
         * @param date the input date to substract from
         * @returns {number}
         * @see {@link TIMEDIFF}
         * @example
         * DATEDIFF(date1, date2)
         */
        DATEDIFF(d1, d2) {
            d1 = asDate(d1);
            d2 = asDate(d2);
            return d1 && d2 ? (d2.getTime() - d1.getTime()) / 864e5 : null;
        },
        /**
         * Computes the  number of seconds between two dates
         *
         * @method TIMEDIFF
         * @param date the input date 1
         * @param date the input date to substract from
         * @returns {number}
         * @see {@link DATEDIFF}
         * @example
         * TIMEDIFF(date1, date2)
         */
        TIMEDIFF(d1, d2) {
            d1 = asDate(d1);
            d2 = asDate(d2);
            return d1 && d2 ? (d2.getTime() - d1.getTime()) / 1000 : null;
        }
    };

    this.unaryOps.LOWER = this.functions.LOWER;
    this.unaryOps.UPPER = this.functions.UPPER;
    this.unaryOps.PROPER = this.functions.PROPER;
    this.unaryOps.TITLE = this.functions.TITLE;
    this.unaryOps.TRIM = this.functions.TRIM;
    this.unaryOps.YEAR = this.functions.YEAR;
    this.unaryOps.MONTH = this.functions.MONTH;
    this.unaryOps.DAY = this.functions.DAY;
    this.unaryOps.WEEKDAY = this.functions.WEEKDAY;
    this.unaryOps.HOURS = this.functions.HOURS;
    this.unaryOps.MINUTES = this.functions.MINUTES;
    this.unaryOps.SECONDS = this.functions.SECONDS;

    this.consts = {
        E: Math.E,
        PI: Math.PI,
        TRUE: true,
        FALSE: false,
        NA: Number.NaN,
        NULL: Number.NaN
    };
}

Parser.prototype.parse = function(expr) {
    var instr = [];
    var parserState = new ParserState(this, new TokenStream(this, expr), {
        allowMemberAccess: true
    });

    parserState.parseExpression(instr);
    parserState.expect(TEOF, 'EOF');

    return new Expression(instr, this);
};

Parser.prototype.evaluate = function(expr, variables) {
    return this.parse(expr).evaluate(variables);
};

var sharedParser = new Parser();

Parser.parse = function(expr) {
    return sharedParser.parse(expr);
};

Parser.evaluate = function(expr, variables) {
    return sharedParser.parse(expr).evaluate(variables);
};

Parser.keywords = [
    'ABS',
    'ACOS',
    'ACOSH',
    'and',
    'ASIN',
    'ASINH',
    'ATAN',
    'ATAN2',
    'ATANH',
    'CBRT',
    'CEIL',
    'CONCAT',
    'COS',
    'COSH',
    'DATEDIFF',
    'DAY',
    'E',
    'EVERY',
    'EXP',
    'EXPM1',
    'FIND',
    'FLOOR',
    'HOURS',
    'IF',
    'in',
    'INDEXOF',
    'ISNULL',
    'JOIN',
    'LENGTH',
    'LN',
    'LOG',
    'LOG10',
    'LOG1P',
    'LOG2',
    'LOWER',
    'MAP',
    'MAX',
    'MEAN',
    'MEDIAN',
    'MIN',
    'MINUTES',
    'MONTH',
    'NOT',
    'NOT',
    'or',
    'PI',
    'PLUCK',
    'POW',
    'PROPER',
    'RANDOM',
    'RANGE',
    'REPLACE',
    'REPLACE_REGEX',
    'ROUND',
    'SECONDS',
    'SIGN',
    'SIN',
    'SINH',
    'SLICE',
    'SOME',
    'SORT',
    'SPLIT',
    'SQRT',
    'SUBSTR',
    'SUM',
    'TAN',
    'TANH',
    'TIMEDIFF',
    'TITLE',
    'TRIM',
    'TRUNC',
    'UPPER',
    'WEEKDAY',
    'YEAR'
];

var optionNameMap = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
    '%': 'remainder',
    '^': 'power',
    '!': 'factorial',
    '<': 'comparison',
    '>': 'comparison',
    '<=': 'comparison',
    '>=': 'comparison',
    '==': 'comparison',
    '!=': 'comparison',
    '||': 'concatenate',
    AND: 'logical',
    OR: 'logical',
    NOT: 'logical',
    IN: 'logical',
    '?': 'conditional',
    ':': 'conditional',
    '=': 'assignment',
    '[': 'array',
    '()=': 'fndef'
};

function getOptionName(op) {
    return Object.prototype.hasOwnProperty.call(optionNameMap, op) ? optionNameMap[op] : op;
}

Parser.prototype.isOperatorEnabled = function(op) {
    var optionName = getOptionName(op);
    var operators = this.options.operators || {};

    return !(optionName in operators) || !!operators[optionName];
};
