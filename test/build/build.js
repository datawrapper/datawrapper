'use strict';

// `_range` : an array's function
// -------------------------------

// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](http://docs.python.org/library/functions.html#range).
function _range (start, stop, step) {
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
}

// `_isObject` : an object's function
// -----------------------------------

// Is a given variable an object?
function _isObject (obj) {
	var type = typeof obj;
	return type === 'function' || type === 'object' && !!obj;
}

// quick reference variables for speed access
//-------------------------------------------

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype;
var ObjProto = Object.prototype;
var slice = ArrayProto.slice;
var toString = ObjProto.toString;
var hasOwnProperty = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
var nativeIsArray = Array.isArray;
var nativeKeys = Object.keys;

// `_has` : an object's function

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
function _has (obj, key) {
	return obj != null && hasOwnProperty.call(obj, key);
}

// `_forEach` : a collection's function

// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
function _each (obj, iteratee, context) {
	iteratee = optimizeCb(iteratee, context);
	var i, length;
	if (isArrayLike(obj)) {
		for (i = 0, length = obj.length; i < length; i++) {
			iteratee(obj[i], i, obj);
		}
	} else {
		var keys = _keys(obj);
		for (i = 0, length = keys.length; i < length; i++) {
			iteratee(obj[keys[i]], keys[i], obj);
		}
	}
	return obj;
}

// `_each` : a collection's function

// `_findIndex` : an array's function

// Returns the first index on an array-like that passes a predicate test.
var _findIndex = createPredicateIndexFinder(1);

// `_sortedIndex` : an array's function

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function _sortedIndex (array, obj, iteratee, context) {
	iteratee = cb(iteratee, context, 1);
	var value = iteratee(obj);
	var low = 0,
		high = getLength(array);
	while (low < high) {
		var mid = Math.floor((low + high) / 2);
		if (iteratee(array[mid]) < value) { low = mid + 1; }
		else { high = mid; }
	}
	return low;
}

// `_indexOf` : an array's function

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var _indexOf = createIndexFinder(1, _findIndex, _sortedIndex);

// `_values` : an object's function

// Retrieve the values of an object's properties.
function _values (obj) {
	var keys = _keys(obj);
	var length = keys.length;
	var values = Array(length);
	for (var i = 0; i < length; i++) {
		values[i] = obj[keys[i]];
	}
	return values;
}

// `_include` : a collection's function

// Determine if the array or object contains a given item (using `===`).
function _contains (obj, item, fromIndex, guard) {
	if (!isArrayLike(obj)) { obj = _values(obj); }
	if (typeof fromIndex != 'number' || guard) { fromIndex = 0; }
	return _indexOf(obj, item, fromIndex) >= 0;
}

// `_contains` : a collection's function

// `_isArray` : an object's function

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
var _isArray = nativeIsArray || function (obj) {
	return toString.call(obj) === '[object Array]';
};

// `_isFunction` : an object's function

// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
// IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
function customFunction() {
	if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof document !== 'undefined' && typeof document.childNodes != 'function') {
		return function (obj) { return typeof obj == 'function' || false; };
	}
	return null;
}

// Is a given value a function?
var _isFunction = customFunction() || function (obj) {
	return toString.call(obj) === '[object Function]';
};

// `_isArguments` : an object's function

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
function customArguments () {
	if (toString.call(arguments) === '[object Arguments]') { return null; }
	return function (obj) { return _has(obj, 'callee'); };
}

// Is a given value an arguments object?
var _isArguments = customArguments() || function (obj) {
	return toString.call(obj) === '[object Arguments]';
};

// `_isNumber` : an object's function

// Is a given value a number?
function _isNumber (obj) {
	return toString.call(obj) === '[object Number]';
}

// `_isNaN` : an object's function

// Is the given value `NaN`?
function _isNaN (obj) {
	return _isNumber(obj) && isNaN(obj);
}

// `_invert` : an object's function

// Invert the keys and values of an object. The values must be serializable.
function _invert (obj) {
	var result = {};
	var keys = _keys(obj);
	for (var i = 0, length = keys.length; i < length; i++) {
		result[obj[keys[i]]] = keys[i];
	}
	return result;
}

// `_iteratee` : an utility's function

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only argCount argument.
var _iteratee = builtinIteratee;

// `_identity` : an utility's function
// ------------------------------------

// Keep the identity function around for default iteratees.
function _identity (value) {
	return value;
}

// `_extendOwn` : an object's function

// Extend a given object with the properties in passed-in object(s).
var _extendOwn = createAssigner(_keys);

// `_isMatch` : an object's function

// Returns whether an object has a given set of `key:value` pairs.
function _isMatch (object, attrs) {
	var keys = _keys(attrs),
		length = keys.length;
	if (object == null) { return !length; }
	var obj = Object(object);
	for (var i = 0; i < length; i++) {
		var key = keys[i];
		if (attrs[key] !== obj[key] || !(key in obj)) { return false; }
	}
	return true;
}

// `_matches` : an utility's function

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function _matcher (attrs) {
	attrs = _extendOwn({}, attrs);
	return function (obj) { return _isMatch(obj, attrs); };
}

// `_matcher` : an utility's function

// `_` : base namespace and constructor for underscore's object
 // @important: exportation of the function, not only it definition

// Internal functions


// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb (func, context, argCount) {
	if (context === void 0) { return func; }
	switch (argCount == null ? 3 : argCount) {
		case 1: return function (value) { return func.call(context, value); };
			// The 2-parameter case has been omitted only because no current consumers
			// made use of it.
		case 3: return function (value, index, collection) { return func.call(context, value, index, collection); };
		case 4: return function (accumulator, value, index, collection) { return func.call(context, accumulator, value, index, collection); };
	}
	return function () {
		return func.apply(context, arguments);
	};
}

// for callback generator.
// This abstraction is use to hide the internal-only argCount argument.
function builtinIteratee (value, context) {
	return cb(value, context, Infinity);
}

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function cb (value, context, argCount) {
	if (_iteratee !== builtinIteratee) { return _iteratee(value, context); }
	if (value == null) { return _identity; }
	if (_isFunction(value)) { return optimizeCb(value, context, argCount); }
	if (_isObject(value)) { return _matcher(value); }
	return property(value);
}

// An internal function used for get key's value from an object.
function property (key) {
	return function (obj) { return obj == null ? void 0 : obj[key]; };
}

// Helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var getLength = property('length');
var isArrayLike = function(collection) { // @TODO simplify to function
	var length = getLength(collection);
	return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

// Internal implementation of a recursive `flatten` function.
function flatten (input, shallow, strict, output) {
	output = output || [];
	var idx = output.length;
	for (var i = 0, length = getLength(input); i < length; i++) {
		var value = input[i];
		if (isArrayLike(value) && (_isArray(value) || _isArguments(value))) {
			// Flatten current level of array or arguments object.
			if (shallow) {
				var j = 0,
					len = value.length;
				while (j < len) { output[idx++] = value[j++]; }
			} else {
				flatten(value, shallow, strict, output);
				idx = output.length;
			}
		} else if (!strict) {
			output[idx++] = value;
		}
	}
	return output;
}

// Generator function to create the findIndex and findLastIndex functions.
function createPredicateIndexFinder (dir) {
	return function (array, predicate, context) {
		predicate = cb(predicate, context);
		var length = getLength(array);
		var index = dir > 0 ? 0 : length - 1;
		for (; index >= 0 && index < length; index += dir) {
			if (predicate(array[index], index, array)) { return index; }
		}
		return -1;
	};
}

// Generator function to create the indexOf and lastIndexOf functions.
function createIndexFinder (dir, predicateFind, sortedIndex) {
	return function (array, item, idx) {
		var i = 0,
			length = getLength(array);
		if (typeof idx == 'number') {
			if (dir > 0) {
				i = idx >= 0 ? idx : Math.max(idx + length, i);
			} else {
				length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
			}
		} else if (sortedIndex && idx && length) {
			idx = sortedIndex(array, item);
			return array[idx] === item ? idx : -1;
		}
		if (item !== item) {
			idx = predicateFind(slice.call(array, i, length), _isNaN);
			return idx >= 0 ? idx + i : -1;
		}
		for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
			if (array[idx] === item) { return idx; }
		}
		return -1;
	};
}

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
// @TODO move to _quickaccess to prevent inappropriate cyclic dependency with `keys` and `allkeys`
// @FUTURE remove this hack when the will ignore IE<9 since the goal is now ES6 and beyond.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
// hack for enumerating bug
function collectNonEnumProps (obj, keys) {
	var nonEnumIdx = nonEnumerableProps.length;
	var constructor = obj.constructor;
	var proto = _isFunction(constructor) && constructor.prototype || ObjProto;

	// Constructor is a special case.
	var prop = 'constructor';
	if (_has(obj, prop) && !_contains(keys, prop)) { keys.push(prop); }

	while (nonEnumIdx--) {
		prop = nonEnumerableProps[nonEnumIdx];
		if (prop in obj && obj[prop] !== proto[prop] && !_contains(keys, prop)) {
			keys.push(prop);
		}
	}
}

// An internal function for creating assigner functions.
function createAssigner (keysFunc, defaults) {
	return function (obj) {
		var arguments$1 = arguments;

		var length = arguments.length;
		if (defaults) { obj = Object(obj); }
		if (length < 2 || obj == null) { return obj; }
		for (var index = 1; index < length; index++) {
			var source = arguments$1[index],
				keys = keysFunc(source),
				l = keys.length;
			for (var i = 0; i < l; i++) {
				var key = keys[i];
				if (_isObject(obj) && (!defaults || obj[key] === void 0)) { obj[key] = source[key]; }
			}
		}
		return obj;
	};
}

// List of HTML entities for escaping.
var escapeMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
	'`': '&#x60;'
};
var unescapeMap = _invert(escapeMap);

// `_keys` : an object's function

// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function _keys (obj) {
	if (!_isObject(obj)) { return []; }
	if (nativeKeys) { return nativeKeys(obj); }
	var keys = [];
	for (var key in obj)
		{ if (_has(obj, key)) { keys.push(key); } }
		// Ahem, IE < 9.
	if (hasEnumBug) { collectNonEnumProps(obj, keys); }
	return keys;
}

// `_all` : a collection's function

// Determine whether all of the elements match a truth test.
function _every (obj, predicate, context) {
	predicate = cb(predicate, context);
	var keys = !isArrayLike(obj) && _keys(obj),
		length = (keys || obj).length;
	for (var index = 0; index < length; index++) {
		var currentKey = keys ? keys[index] : index;
		if (!predicate(obj[currentKey], currentKey, obj)) { return false; }
	}
	return true;
}

// `_every` : a collection's function

// `_findKey` : an object's function

// Returns the first key on an object that passes a predicate test.
function _findKey (obj, predicate, context) {
	predicate = cb(predicate, context);
	var keys = _keys(obj),
		key;
	for (var i = 0, length = keys.length; i < length; i++) {
		key = keys[i];
		if (predicate(obj[key], key, obj)) { return key; }
	}
}

// `_detect` : a collection's function

// Return the first value which passes a truth test. Aliased as `detect`.
function _find (obj, predicate, context) {
	var keyFinder = isArrayLike(obj) ? _findIndex : _findKey;
	var key = keyFinder(obj, predicate, context);
	if (key !== void 0 && key !== -1) { return obj[key]; }
}

// `_find` : a collection's function

// `_isString` : an object's function

// Is a given value a string?
function _isString (obj) {
	return toString.call(obj) === '[object String]';
}

// `_isUndefined` : an object's function
// --------------------------------------

// Is a given variable undefined?
function _isUndefined (obj) {
	return obj === void 0;
}

// `_isDate` : an object's function

// Is a given value a date?
function _isDate (obj) {
	return toString.call(obj) === '[object Date]';
}

// `_random` : an utility's function
// ----------------------------------

// Return a random integer between min and max (inclusive).
function _random (min, max) {
	if (max == null) {
		max = min;
		min = 0;
	}
	return min + Math.floor(Math.random() * (max - min + 1));
}

// `_allKeys` : an object's function

// Retrieve all the property names of an object.
function _allKeys (obj) {
	if (!_isObject(obj)) { return []; }
	var keys = [];
	for (var key in obj) { keys.push(key); }
	// Ahem, IE < 9.
	if (hasEnumBug) { collectNonEnumProps(obj, keys); }
	return keys;
}

// `_extend` : an object's function

// Extend a given object with all the properties in passed-in object(s).
var _extend = createAssigner(_allKeys);

// `_clone` : an object's function

// Create a (shallow-cloned) duplicate of an object.
function _clone (obj) {
	if (!_isObject(obj)) { return obj; }
	return _isArray(obj) ? obj.slice() : _extend({}, obj);
}

// `_sample` : a collection's function

// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `map`.
function _sample (obj, n, guard) {
	if (n == null || guard) {
		if (!isArrayLike(obj)) { obj = _values(obj); }
		return obj[_random(obj.length - 1)];
	}
	var levy = isArrayLike(obj) ? _clone(obj) : _values(obj);
	var length = getLength(levy);
	n = Math.max(Math.min(n, length), 0);
	var last = length - 1;
	for (var index = 0; index < n; index++) {
		var rand = _random(index, last);
		var temp = levy[index];
		levy[index] = levy[rand];
		levy[rand] = temp;
	}
	return levy.slice(0, n);
}

// `_shuffle` : a collection's function

// Shuffle a collection.
function _shuffle (obj) {
	return _sample(obj, Infinity);
}

// `_collect` : a collection's function

// Return the results of applying the iteratee to each element.
function _map (obj, iteratee, context) {
	iteratee = cb(iteratee, context);
	var keys = !isArrayLike(obj) && _keys(obj),
		length = (keys || obj).length,
		results = Array(length);
	for (var index = 0; index < length; index++) {
		var currentKey = keys ? keys[index] : index;
		results[index] = iteratee(obj[currentKey], currentKey, obj);
	}
	return results;
}

// `_map` : a collection's function

// `_isNull` : an object's function
// ---------------------------------

// Is a given value equal to null?
function _isNull (obj) {
	return obj === null;
}

// `_flatten` : an array's function

// Flatten out an array, either recursively (by default), or just one level.
function _flatten (array, shallow) {
	return flatten(array, shallow, false);
}

// `_isRegExp` : an object's function

// Is a given value a regular expression?
function _isRegExp (obj) {
	return toString.call(obj) === '[object RegExp]';
}

// returns true if two values are close enough
function equalish(a,b) {
    return a-b < 1e-6;
}

/* global Globalize */
/* eslint no-irregular-whitespace: "off", no-console: "off" */
var columnTypes = {};

var _identity$1 = function (d) { return d; };

columnTypes.text = function() {
    return {
        parse: _identity$1,
        errors: function() { return 0; },
        name: function() { return 'text'; },
        formatter: function() { return _identity$1; },
        isValid: function() { return true; },
        format: function() { }
    };
};

/*
 * A type for numbers:
 *
 * Usage:
 * var parse = dw.type.number(sampleData);
 * parse()
 */
columnTypes.number = function(sample) {

    function signDigitsDecimalPlaces(num, sig) {
        if (num === 0) { return 0; }
        return Math.round( sig - Math.ceil( Math.log( Math.abs( num ) ) / Math.LN10 ) );
    }
    var format,
        errors = 0,
        knownFormats = {
            '-.': /^ *[-–—]?[0-9]*(\.[0-9]+)?(e[+-][0-9]+)?%? *$/,
            '-,': /^ *[-–—]?[0-9]*(,[0-9]+)?%? *$/,
            ',.': /^ *[-–—]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
            '.,': /^ *[-–—]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
            ' .': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
            ' ,': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
            // thin spaces
            ' .': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
            ' ,': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
            // excel sometimes produces a strange white-space:
            ' .': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
            ' ,': /^ *[-–—]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
            "'.": /^ *[-–—]?[0-9]{1,3}('[0-9]{3})*(\.[0-9]+)?%? *$/
        },
        formatLabels = {
            '-.': '1234.56',
            '-,': '1234,56',
            ',.': '1,234.56',
            '.,': '1.234,56',
            ' .': '1 234.56',
            ' ,': '1 234,56',
            // excel sometimes produces a strange white-space:
            ' .': '1 234.56',
            ' ,': '1 234,56',
            ' .': '1 234.56',
            ' ,': '1 234,56',
        },
        // a list of strings that are recognized as 'not available'
        naStrings = {
            'na': 1,
            'n/a': 1,
            '-': 1,
            ':': 1
        };

    var matches = {},
        bestMatch = ['-.', 0];

    sample = sample || [];

    _each(sample, function(n) {
        _each(knownFormats, function(regex, fmt) {
            if (matches[fmt] === undefined) { matches[fmt] = 0; }
            if (regex.test(n)) {
                matches[fmt] += 1;
                if (matches[fmt] > bestMatch[1]) {
                    bestMatch[0] = fmt;
                    bestMatch[1] = matches[fmt];
                }
            }
        });
    });
    format = bestMatch[0];

    // public interface
    var type = {
        parse: function(raw) {
            if (_isNumber(raw) || _isUndefined(raw) || _isNull(raw)) { return raw; }
            // replace percent sign, n-dash & m-dash
            var number = raw.replace("%", "").replace('–', '-').replace('—', '-');
            // normalize number
            if (format[0] != '-') {
                // remove kilo seperator
                number = number.replace(format[0], '');
            }
            if (format[1] != '.') {
                // replace decimal char w/ point
                number = number.replace(format[1], '.');
            }
            if (isNaN(number) || number === "") {
                if (!naStrings[number.toLowerCase()] && number !== "") { errors++; }
                return raw;
            }
            return Number(number);
        },
        toNum: function(i) { return i; },
        fromNum: function(i) { return i; },
        errors: function() { return errors; },
        name: function() { return 'number'; },

        // returns a function for formatting numbers
        formatter: function(config) {
            var format = config['number-format'] || '-',
                div = Number(config['number-divisor'] || 0),
                append = (config['number-append'] || '').replace(/ /g, '\u00A0'),
                prepend = (config['number-prepend'] || '').replace(/ /g, '\u00A0');
            return function(val, full, round) {
                if (isNaN(val)) { return val; }
                var _fmt = format;
                if (div !== 0 && _fmt == '-') { _fmt = 'n1'; }
                if (div !== 0) { val = Number(val) / Math.pow(10, div); }
                if (_fmt.substr(0,1) == 's') {
                    // significant figures
                    var sig = +_fmt.substr(1);
                    _fmt = 'n'+Math.max(0, signDigitsDecimalPlaces(val, sig));
                }
                if (round) { _fmt = 'n0'; }
                if (_fmt == '-') {
                    // guess number format based on single number
                    _fmt = equalish(val, Math.round(val)) ? 'n0' :
                        equalish(val, Math.round(val*10)*0.1) ? 'n1' :
                        equalish(val, Math.round(val*100)*0.01) ? 'n2' :
                        equalish(val, Math.round(val*1000)*0.001) ? 'n3' :
                        equalish(val, Math.round(val*10000)*0.0001) ? 'n4' :
                        equalish(val, Math.round(val*100000)*0.00001) ? 'n5' :
                        'n6';
                }
                val = Globalize.format(val, _fmt != '-' ? _fmt : null);
                return full ? prepend + val + append : val;
            };
        },

        isValid: function(val) {
            return val === "" || naStrings[String(val).toLowerCase()] || _isNumber(type.parse(val));
        },

        ambiguousFormats: function() {
            var candidates = [];
            _each(matches, function(cnt, fmt) {
                if (cnt == bestMatch[1]) {
                    candidates.push([fmt, formatLabels[fmt]]); // key, label
                }
            });
            return candidates;
        },

        format: function(fmt) {
            if (arguments.length) {
                format = fmt;
                return type;
            }
            return format;
        }
    };
    return type;
};


/*
 * type for date values, e.g. 2004 Q1
 */
columnTypes.date = (function() {

    var begin = /^ */.source,
        end = /[*']* *$/.source,
        s0 = /[ \-/.]?/.source, // optional separator
        s1 = /[ \-/.]/.source, // mandatory separator
        s2 = /[ \-/.,]/.source, // mandatory separator
        s3 = /[ \-|T]/.source, // mandatory separator
        rx = {
            YY:    { parse: /['’‘]?(\d{2})/ },
            YYYY:  { test: /([12]\d{3})/, parse: /(\d{4})/ },
            YYYY2: { test: /(?:1[7-9]|20)\d{2}/, parse: /(\d{4})/ },
            H:     { parse: /h([12])/ },
            Q:     { parse: /q([1234])/ },
            W:     { parse: /w([0-5]?[0-9])/ },
            Mm:    { test: /m?(0?[1-9]|1[0-2])/, parse: /m?(0?[1-9]|1[0-2])/ },
            MM:    { test: /(0?[1-9]|1[0-2])/, parse: /(0?[1-9]|1[0-2])/ },
            DD:    { parse: /(0?[1-9]|[1-2][0-9]|3[01])/ },
            DOW:   { parse: /([0-7])/ },
            HHMM:  { parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(am|pm)?/ },
        };

    var MONTHS = { // feel free to add more localized month names
        0:  ['jan','january','januar','jänner','jän','janv','janvier','ene','enero','gen','gennaio','janeiro'],
        1:  ['feb','february','febr','februar','fév','févr','février','febrero','febbraio','fev','fevereiro'],
        2:  ['mar','mär','march','mrz','märz','mars','mars','marzo','marzo','março'],
        3:  ['apr','april','apr','april','avr','avril','abr','abril','aprile'],
        4:  ['may','mai','mayo','mag','maggio','maio','maj'],
        5:  ['jun','june','juni','juin','junio','giu','giugno','junho'],
        6:  ['jul','july','juli','juil','juillet','julio','lug','luglio','julho'],
        7:  ['aug','august','août','ago','agosto'],
        8:  ['sep','september','sept','septembre','septiembre','set','settembre','setembro'],
        9:  ['oct','october','okt','oktober','octobre','octubre','ott','ottobre','out','outubro'],
        10: ['nov','november','november','novembre','noviembre','novembre','novembro'],
        11: ['dec','december','dez','des','dezember','déc','décembre','dic','diciembre','dicembre','desember','dezembro'],
        },
        MMM_key = {};

    _each(MONTHS, function(abbr, m) {
        _each(abbr, function(a) { MMM_key[a] = m; });
    });

    rx.MMM = { parse: new RegExp('('+_flatten(_values(MONTHS)).join('|')+')') };

    _each(rx, function(r) {
        r.parse = r.parse.source;
        if (_isRegExp(r.test)) { r.test = r.test.source; }
        else { r.test = r.parse; }
    });

    var knownFormats = {
        // each format has two regex, a strict one for format guessing
        // based on a sample and a lazy one for parsing
        'YYYY': {
            test: reg(rx.YYYY2.test),
            parse: reg(rx.YYYY2.parse),
            precision: 'year'
        },
        'YYYY-H': {
            test: reg(rx.YYYY.test, s0, rx.H.test),
            parse: reg(rx.YYYY.parse, s0, rx.H.parse),
            precision: 'half'
        },
        'H-YYYY': {
            test: reg(rx.H.test, s1, rx.YYYY.test),
            parse: reg(rx.H.parse, s1, rx.YYYY.parse),
            precision: 'half'
        },
        'YYYY-Q': {
            test: reg(rx.YYYY.test, s0, rx.Q.test),
            parse: reg(rx.YYYY.parse, s0, rx.Q.parse),
            precision: 'quarter'
        },
        'Q-YYYY': {
            test: reg(rx.Q.test, s1, rx.YYYY.test),
            parse: reg(rx.Q.parse, s1, rx.YYYY.parse),
            precision: 'quarter'
        },
        'YYYY-M': {
            test: reg(rx.YYYY.test, s0, rx.Mm.test),
            parse: reg(rx.YYYY.parse, s0, rx.Mm.parse),
            precision: 'month'
        },
        'M-YYYY': {
            test: reg(rx.MM.test, s1, rx.YYYY.test),
            parse: reg(rx.MM.parse, s1, rx.YYYY.parse),
            precision: 'month'
        },
        'YYYY-MMM': {
            test: reg(rx.YYYY.test, s1, rx.MMM.parse),
            parse: reg(rx.YYYY.parse, s1, rx.MMM.parse),
            precision: 'month'
        },
        'MMM-YYYY': {
            test: reg(rx.MMM.parse, s1, rx.YYYY.test),
            parse: reg(rx.MMM.parse, s1, rx.YYYY.parse),
            precision: 'month'
        },
        'MMM-YY': {
            test: reg(rx.MMM.parse, s1, rx.YY.test),
            parse: reg(rx.MMM.parse, s1, rx.YY.parse),
            precision: 'month'
        },
        'MMM': {
            test: reg(rx.MMM.parse),
            parse: reg(rx.MMM.parse),
            precision: 'month'
        },
        'YYYY-WW': {
            test: reg(rx.YYYY.test, s0, rx.W.test),
            parse: reg(rx.YYYY.parse, s0, rx.W.parse),
            precision: 'week'
        },
        'WW-YYYY': {
            test: reg(rx.W.test, s1, rx.YYYY.test),
            parse: reg(rx.W.parse, s1, rx.YYYY.parse),
            precision: 'week'
        },
        'MM/DD/YYYY': {
            test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test),
            parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse),
            precision: 'day'
        },
        'DD/MM/YYYY': {
            test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test),
            parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse),
            precision: 'day'
        },
        'DD/MMM/YYYY': {
            test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YYYY.test),
            parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YYYY.parse),
            precision: 'day'
        },
        'DD/MMM/YY': {
            test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YY.test),
            parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YY.parse),
            precision: 'day'
        },
        'YYYY-MM-DD': {
            test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test),
            parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse),
            precision: 'day'
        },

        'MMM-DD-YYYY': {
            test: reg(rx.MMM.test, s1, rx.DD.test, s2, rx.YYYY.test),
            parse: reg(rx.MMM.parse, s1, rx.DD.parse, s2, rx.YYYY.parse),
            precision: 'day'
        },

        'YYYY-WW-d': { // year + ISO week + [day]
            test: reg(rx.YYYY.test, s0, rx.W.test, s1, rx.DOW.test),
            parse: reg(rx.YYYY.parse, s0, rx.W.parse, s1, rx.DOW.parse),
            precision: 'day'
        },

        // dates with a time
        'MM/DD/YYYY HH:MM': {
            test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
            parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
            precision: 'day-minutes'
        },
        'DD.MM.YYYY HH:MM': {
            test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
            parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
            precision: 'day-minutes'
        },
        'YYYY-MM-DD HH:MM': {
            test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test, s3, rx.HHMM.test),
            parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse, s3, rx.HHMM.parse),
            precision: 'day-minutes'
        }
    };

    function reg() {
        return new RegExp(begin + Array.prototype.slice.call(arguments).join(' *') + end, 'i');
    }

    function test(str, key) {
        var fmt = knownFormats[key];
        if (_isRegExp(fmt.test)) {
            return fmt.test.test(str);
        } else {
            return fmt.test(str, key);
        }
    }

    function parse(str, key) {
        var fmt = knownFormats[key];
        if (_isRegExp(fmt.parse)) {
            return str.match(fmt.parse);
        } else {
            return fmt.parse(str, key);
        }
    }

    function dateFromIsoWeek(year, week, day) {
        var d = new Date(Date.UTC(year, 0, 3));
        d.setUTCDate(3 - d.getUTCDay() + (week-1)*7 + parseInt(day,10));
        return d;
    }

    function dateToIsoWeek(date) {
        var d = date.getUTCDay(),
            t = new Date(date.valueOf());
        t.setDate(t.getDate() - ((d + 6) % 7) + 3);
        var iso_year = t.getUTCFullYear(),
            w = Math.floor( (t.getTime() - new Date(iso_year, 0, 1, -6)) / 864e5);
        return [ iso_year, 1+Math.floor(w/7), d > 0 ? d : 7 ];
    }

    function hour(hr, amPm) {
        if (hr != 12) { return hr + (amPm == 'pm' ? 12 : 0); }
        return amPm == 'am' ? 0 : 12;
    }

    return function(sample) {

        var format,
            errors = 0,
            matches = {},
            bestMatch = ['', 0];

        sample = sample || [];

        _each(knownFormats, function(format, key) {
            _each(sample, function(n) {
                if (matches[key] === undefined) { matches[key] = 0; }
                if (test(n, key)) {
                    matches[key] += 1;
                    if (matches[key] > bestMatch[1]) {
                        bestMatch[0] = key;
                        bestMatch[1] = matches[key];
                    }
                }
            });
        });
        format = bestMatch[0];

        // public interface
        var type = {
            parse: function(raw) {
                if (_isDate(raw) || _isUndefined(raw)) { return raw; }
                if (!format || !_isString(raw)) {
                    errors++;
                    return raw;
                }

                var m = parse(raw.toLowerCase(), format);

                if (!m) {
                    errors++;
                    return raw;
                } else {
                    // increment errors anyway if string doesn't match strict format
                    if (!test(raw, format)) { errors++; }
                }

                function guessTwoDigitYear(yr) {
                    yr = +yr;
                    if (yr < 20) { return 2000 + yr; }
                    else { return 1900 + yr; }
                }

                var curYear = (new Date()).getFullYear();

                switch (format) {
                    case 'YYYY': return new Date(m[1], 0, 1);
                    case 'YYYY-H': return new Date(m[1], (m[2]-1) * 6, 1);
                    case 'H-YYYY': return new Date(m[2], (m[1]-1) * 6, 1);
                    case 'YYYY-Q': return new Date(m[1], (m[2]-1) * 3, 1);
                    case 'Q-YYYY': return new Date(m[2], (m[1]-1) * 3, 1);
                    case 'YYYY-M': return new Date(m[1], (m[2]-1), 1);
                    case 'M-YYYY': return new Date(m[2], (m[1]-1), 1);

                    case 'YYYY-MMM': return new Date(+m[1], MMM_key[m[2]], 1);
                    case 'MMM-YYYY': return new Date(+m[2], MMM_key[m[1]], 1);
                    case 'MMM-YY': return new Date(guessTwoDigitYear(+m[2]), MMM_key[m[1]], 1);
                    case 'MMM': return new Date(curYear, MMM_key[m[1]], 1);

                    case 'YYYY-WW': return dateFromIsoWeek(m[1], m[2], 1);
                    case 'WW-YYYY': return dateFromIsoWeek(m[2], m[1], 1);

                    case 'YYYY-WW-d': return dateFromIsoWeek(m[1], m[2], m[3]);
                    case 'YYYY-MM-DD': return new Date(m[1], (m[3]-1), m[4]);
                    case 'DD/MM/YYYY': return new Date(m[4], (m[3]-1), m[1]);
                    case 'DD/MMM/YYYY': return new Date(m[4], MMM_key[m[3]], m[1]);
                    case 'DD/MMM/YY': return new Date(guessTwoDigitYear(m[4]), MMM_key[m[3]], m[1]);
                    case 'MM/DD/YYYY': return new Date(m[4], (m[1]-1), m[3]);
                    case 'MMM-DD-YYYY': return new Date(m[3], MMM_key[m[1]], m[2]);

                    case 'YYYY-MM-DD HH:MM': return new Date(+m[1], (m[3]-1), +m[4], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);
                    case 'DD.MM.YYYY HH:MM': return new Date(+m[4], (m[3]-1), +m[1], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);
                    case 'MM/DD/YYYY HH:MM': return new Date(+m[4], (m[1]-1), +m[3], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);

                    default:
                        console.warn('unknown format', format);
                }
                errors++;
                return raw;
            },
            toNum: function(d) { return d.getTime(); },
            fromNum: function(i) { return new Date(i); },
            errors: function() { return errors; },
            name: function() { return 'date'; },

            format: function(fmt) {
                if (arguments.length) {
                    format = fmt;
                    return type;
                }
                return format;
            },

            precision: function() { return knownFormats[format].precision; },

            // returns a function for formatting dates
            formatter: function() {
                if (!format) { return _identity$1; }
                var M_pattern = Globalize.culture().calendar.patterns.M.replace('MMMM','MMM');
                switch (knownFormats[format].precision) {
                    case 'year': return function(d) { return !_isDate(d) ? d : d.getFullYear(); };
                    case 'half': return function(d) { return !_isDate(d) ? d : d.getFullYear() + ' H'+(d.getMonth()/6 + 1); };
                    case 'quarter': return function(d) { return !_isDate(d) ? d : d.getFullYear() + ' Q'+(d.getMonth()/3 + 1); };
                    case 'month': return function(d) { return !_isDate(d) ? d : Globalize.format(d, 'MMM yy'); };
                    case 'week': return function(d) { return !_isDate(d) ? d : dateToIsoWeek(d).slice(0,2).join(' W'); };
                    case 'day': return function(d, verbose) { return !_isDate(d) ? d : Globalize.format(d, verbose ? 'D' : 'd'); };
                    case 'day-minutes': return function(d) { return !_isDate(d) ? d : Globalize.format(d, M_pattern).replace(' ', '&nbsp;')+' - '+ Globalize.format(d, 't').replace(' ', '&nbsp;'); };
                    case 'day-seconds': return function(d) { return !_isDate(d) ? d : Globalize.format(d, 'T').replace(' ', '&nbsp;'); };
                }
            },

            isValid: function(val) {
                return _isDate(type.parse(val));
            },

            ambiguousFormats: function() {
                var candidates = [];
                _each(matches, function(cnt, fmt) {
                    if (cnt == bestMatch[1]) {
                        candidates.push([fmt, fmt]); // key, label
                    }
                });
                return candidates;
            }
        };
        return type;
    };
})();

/*
 * Remove all html tags from the given string
 *
 * written by Kevin van Zonneveld et.al.
 * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
 */
var TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
var COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
var default_allowed = "<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>";

function purifyHtml(input, allowed) {
    if (input === null) { return null; }
    if (input === undefined) { return undefined; }
    input = String(input);
    // strip tags
    if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
        return input;
    }
    input = stripTags(input, allowed);
    // remove all event attributes
    if (typeof document == 'undefined') { return input; }
    var d = document.createElement('div');
    d.innerHTML = input;
    var sel = d.querySelectorAll('*');
    for (var i=0; i<sel.length; i++) {
        for (var j=0; j<sel[i].attributes.length; j++) {
            var attrib = sel[i].attributes[j];
            if (attrib.specified) {
                if (attrib.name.substr(0,2) == 'on') { sel[i].removeAttribute(attrib.name); }
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
        after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
        });
        // return once no more tags are removed
        if (before === after) {
            return after;
        }
    }
}

/* globals */
function column(name, rows, type) {

    function notEmpty(d) {
        return d !== null && d !== undefined && d !== '';
    }

    function guessType(sample) {

        if (_every(rows, _isNumber)) { return columnTypes.number(); }
        if (_every(rows, _isDate)) { return columnTypes.date(); }
        // guessing column type by counting parsing errors
        // for every known type
        var types = [
                columnTypes.date(sample),
                columnTypes.number(sample),
                columnTypes.text()
            ],
            type,
            k = rows.filter(notEmpty).length,
            tolerance = 0.1; // allowing 10% mis-parsed values

        _each(rows, function(val) {
            _each(types, function(t) {
                t.parse(val);
            });
        });
        _every(types, function(t) {
            if (t.errors() / k < tolerance) { type = t; }
            return !type;
        });
        if (_isUndefined(type)) { type = types[2]; } // default to text;
        return type;
    }

    // we pick random 200 non-empty values for column type testing
    var sample = _shuffle(_range(rows.length))
        .filter(function(i) { return notEmpty(rows[i]); })
        .slice(0, 200)
        .map(function(i) { return rows[i]; });

    type = type ? columnTypes[type](sample) : guessType(sample);

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
            if (!arguments.length) { return undefined; }
            var r = unfiltered ? origRows : rows;
            if (i < 0) { i += r.length; }
            return type.parse(purifyHtml(r[i]));
        },

        /*
         * returns an array of parsed values
         */
        values: function(unfiltered) {
            var r = unfiltered ? origRows : rows;
            r = _map(r, function(d) { return purifyHtml(d); });
            return _map(r, type.parse);
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
            if (!arguments.length) { return rows; }
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
            if (o === true) { return type; }
            if (_isString(o)) {
                if (columnTypes[o]) {
                    type = columnTypes[o](sample);
                    return column;
                } else {
                    throw 'unknown column type: '+o;
                }
            }
            return type.name();
        },

        // [min,max] range
        range: function() {
            if (!type.toNum) { return false; }
            if (!range) {
                range = [Number.MAX_VALUE, -Number.MAX_VALUE];
                column.each(function(v) {
                    v = type.toNum(v);
                    if (!_isNumber(v) || _isNaN(v)) { return; }
                    if (v < range[0]) { range[0] = v; }
                    if (v > range[1]) { range[1] = v; }
                });
                range[0] = type.fromNum(range[0]);
                range[1] = type.fromNum(range[1]);
            }
            return range;
        },
        // sum of values
        total: function() {
            if (!type.toNum) { return false; }
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
            return name + ' ('+type.name()+')';
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

/*
 * Dataset class
 */
function dataset(columns) {

    // make column names unique
    var columnsByName = {},
        origColumns = columns.slice(0);

    columns.forEach(function (col) {
        uniqueName(col);
        columnsByName[col.name()] = col;
    });

    // sets a unique name for a column
    function uniqueName(col) {
        var origColName = col.name(),
            colName = origColName,
            appendix = 1;

        while (columnsByName.hasOwnProperty(colName)) {
            colName = origColName+'.'+(appendix++);
        }
        if (colName != origColName) { col.name(colName); } // rename column
    }

    // public interface
    var dataset = {

        columns: function columns$1() {
            return columns;
        },

        column: function column(x) {
            if (_isString(x)) {
                // single column by name
                if (columnsByName[x] !== undefined) { return columnsByName[x]; }
                throw 'No column found with that name: "'+x+'"';
            } else {
                if (x < 0) {
                    return;
                }
            }

            // single column by index
            if (columns[x] !== undefined) { return columns[x]; }
            throw 'No column found with that index: '+x;
        },

        numColumns: function numColumns() {
            return columns.length;
        },

        numRows: function numRows() {
            return columns[0].length;
        },

        eachColumn: function eachColumn(func) {
            columns.forEach(func);
        },

        hasColumn: function hasColumn(x) {
            return (_isString(x) ? columnsByName[x] : columns[x]) !== undefined;
        },

        indexOf: function indexOf(column_name) {
            if (!dataset.hasColumn(column_name)) { return -1; }
            return columns.indexOf(columnsByName[column_name]);
        },

        /*
         * returns a D3 friendly list of objects
         */
        list: function list() {
            return _range(columns[0].length).map(function(r) {
                var o = {};
                columns.forEach(function (col) { o[col.name()] = col.val(r); });
                return o;
            });
        },

        csv: function csv() {
            var csv = "",
                sep = ",",
                quote = "\"";
            // add header
            columns.forEach(function (col, i) {
                var t = col.title();
                if (t.indexOf(quote) > -1) { t.replace(quote, '\\'+quote); }
                if (t.indexOf(sep) > -1) { t = quote + t + quote; }
                csv += (i > 0 ? sep : '') + t;
            });
            // add values
            _range(dataset.numRows()).forEach(function (row) {
                csv += '\n';
                columns.forEach(function (col, i) {
                    var t = ''+(col.type() == 'date' ? col.raw(row) : col.val(row));
                    if (t.indexOf(quote) > -1) { t.replace(quote, '\\'+quote); }
                    if (t.indexOf(sep) > -1) { t = quote + t + quote; }
                    csv += (i > 0 ? sep : '') + t;
                });
            });
            return csv;
        },

        // DEPRECATED
        toCSV: function toCSV() {
            return this.csv();
        },

        /*
         * removes ignored columns from dataset
         */
        filterColumns: function filterColumns(ignore) {
            columns = columns.filter(function (c) { return !ignore[c.name()]; });
            ignore.forEach(function (ign, key) {
                if (ign && columnsByName[key]) { delete columnsByName[key]; }
            });
            return dataset;
        },

        /*
         * executes func for each row of the dataset
         */
        eachRow: function eachRow(func) {
            var i;
            for (i=0; i<dataset.numRows(); i++) {
                func(i);
            }
            return dataset;
        },

        /*
         * adds a new column to the dataset
         */
        add: function add(column) {
            uniqueName(column);
            columns.push(column);
            columnsByName[column.name()] = column;
            origColumns.push(column);
            return dataset;
        },

        reset: function reset() {
            columns = origColumns.slice(0);
            columnsByName = {};
            columns.forEach(function (col) {
                columnsByName[col.name()] = col;
            });
            return dataset;
        },

        limitRows: function limitRows(numRows) {
            columns.forEach(function (col) {
                col.limitRows(numRows);
            });
            return dataset;
        },

        limitColumns: function limitColumns(numCols) {
            if (columns.length > numCols) {
                columns.length = numCols;
                origColumns.length = numCols;
            }
            return dataset;
        },

        columnOrder: function columnOrder(sortOrder) {
            if (arguments.length) {
                columns.length = 0;
                sortOrder.forEach(function(i) {
                    columns.push(origColumns[i]);
                });
                return dataset;
            }
            return columns.map(function(c) {
                return origColumns.indexOf(c);
            });
        },

    };

    return dataset;

}

function assign(tar, src) {
	for (var k in src) { tar[k] = src[k]; }
	return tar;
}

function blankObject() {
	return Object.create(null);
}

function _differs(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function _differsImmutable(a, b) {
	return a != a ? b == b : a !== b;
}

function fire(eventName, data) {
	var this$1 = this;

	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) { return; }

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			handler.__calling = true;
			handler.call(this$1, data);
			handler.__calling = false;
		}
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function observe(key, callback, options) {
	var fn = callback.bind(this);

	if (!options || options.init !== false) {
		fn(this.get()[key], undefined);
	}

	return this.on(options && options.defer ? 'update' : 'state', function(event) {
		if (event.changed[key]) { fn(event.current[key], event.previous && event.previous[key]); }
	});
}

function on(eventName, handler) {
	if (eventName === 'teardown') { return this.on('destroy', handler); }

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) { handlers.splice(index, 1); }
		}
	};
}

function Store(state, options) {
	this._observers = { pre: blankObject(), post: blankObject() };
	this._handlers = {};
	this._dependents = [];

	this._computed = blankObject();
	this._sortedComputedProperties = [];

	this._state = assign({}, state);
	this._differs = options && options.immutable ? _differsImmutable : _differs;
}

assign(Store.prototype, {
	_add: function(component, props) {
		this._dependents.push({
			component: component,
			props: props
		});
	},

	_init: function(props) {
		var this$1 = this;

		var state = {};
		for (var i = 0; i < props.length; i += 1) {
			var prop = props[i];
			state['$' + prop] = this$1._state[prop];
		}
		return state;
	},

	_remove: function(component) {
		var this$1 = this;

		var i = this._dependents.length;
		while (i--) {
			if (this$1._dependents[i].component === component) {
				this$1._dependents.splice(i, 1);
				return;
			}
		}
	},

	_sortComputedProperties: function() {
		var this$1 = this;

		var computed = this._computed;
		var sorted = this._sortedComputedProperties = [];
		var cycles;
		var visited = blankObject();

		function visit(key) {
			if (cycles[key]) {
				throw new Error('Cyclical dependency detected');
			}

			if (visited[key]) { return; }
			visited[key] = true;

			var c = computed[key];

			if (c) {
				cycles[key] = true;
				c.deps.forEach(visit);
				sorted.push(c);
			}
		}

		for (var key in this$1._computed) {
			cycles = blankObject();
			visit(key);
		}
	},

	compute: function(key, deps, fn) {
		var store = this;
		var value;

		var c = {
			deps: deps,
			update: function(state, changed, dirty) {
				var values = deps.map(function(dep) {
					if (dep in changed) { dirty = true; }
					return state[dep];
				});

				if (dirty) {
					var newValue = fn.apply(null, values);
					if (store._differs(newValue, value)) {
						value = newValue;
						changed[key] = true;
						state[key] = value;
					}
				}
			}
		};

		c.update(this._state, {}, true);

		this._computed[key] = c;
		this._sortComputedProperties();
	},

	fire: fire,

	get: get,

	// TODO remove this method
	observe: observe,

	on: on,

	onchange: function(callback) {
		// TODO remove this method
		console.warn("store.onchange is deprecated in favour of store.on('state', event => {...})");

		return this.on('state', function(event) {
			callback(event.current, event.changed);
		});
	},

	set: function(newState) {
		var this$1 = this;

		var oldState = this._state,
			changed = this._changed = {},
			dirty = false;

		for (var key in newState) {
			if (this$1._computed[key]) { throw new Error("'" + key + "' is a read-only property"); }
			if (this$1._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
		}
		if (!dirty) { return; }

		this._state = assign(assign({}, oldState), newState);

		for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
			this$1._sortedComputedProperties[i].update(this$1._state, changed);
		}

		this.fire('state', {
			changed: changed,
			current: this._state,
			previous: oldState
		});

		var dependents = this._dependents.slice(); // guard against mutations
		for (var i = 0; i < dependents.length; i += 1) {
			var dependent = dependents[i];
			var componentState = {};
			dirty = false;

			for (var j = 0; j < dependent.props.length; j += 1) {
				var prop = dependent.props[j];
				if (prop in changed) {
					componentState['$' + prop] = this$1._state[prop];
					dirty = true;
				}
			}

			if (dirty) { dependent.component.set(componentState); }
		}

		this.fire('update', {
			changed: changed,
			current: this._state,
			previous: oldState
		});
	}
});

// `_any` : a collection's function

// Determine if at least one element in the object matches a truth test.
// Aliased as `any`.
function _some (obj, predicate, context) {
	predicate = cb(predicate, context);
	var keys = !isArrayLike(obj) && _keys(obj),
		length = (keys || obj).length;
	for (var index = 0; index < length; index++) {
		var currentKey = keys ? keys[index] : index;
		if (predicate(obj[currentKey], currentKey, obj)) { return true; }
	}
	return false;
}

// `_some` : a collection's function

/*
* dataset source for delimited files (CSV, TSV, ...)
*/

function delimited(opts) {

    function loadAndParseCsv() {
        if (opts.url) {
            // return $.ajax({
            //     url: opts.url + (opts.url.indexOf('?') > -1 ? '&' : '?') + 'v='+(new Date()).getTime(),
            //     method: 'GET',
            //     dataType: "text"
            // }).then(function(raw) {
            //     return new DelimitedParser(opts).parse(raw);
            // });
        } else if (opts.csv) {
            var dfd = new Promise(function (resolve) {
                resolve(opts.csv);
            });
            var parsed = dfd.then(function (raw) {
                return new DelimitedParser(opts).parse(raw);
            });
            return parsed;
        }
        throw 'you need to provide either an URL or CSV data.';
    }

    return {
        dataset: loadAndParseCsv,
        parse: function() {
            return new DelimitedParser(opts).parse(opts.csv);
        }
    };
}

var DelimitedParser = function DelimitedParser(opts) {
    opts = Object.assign({
        delimiter: "auto",
        quoteChar: "\"",
        skipRows: 0,
        emptyValue: null,
        transpose: false,
        firstRowIsHeader: true
    }, opts);

    this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
    this.opts = opts;
};

DelimitedParser.prototype.parse = function parse (data) {
    this.__rawData = data;
    var opts = this.opts;

    if (opts.delimiter == 'auto') {
        opts.delimiter = this.guessDelimiter(data, opts.skipRows);
        this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
    }
    var closure = opts.delimiter != '|' ? '|' : '#',
        arrData;

    data = closure + '\n' + data.replace(/\s+$/g, '') + closure;

    function parseCSV(delimiterPattern, strData, strDelimiter) {
        // implementation and regex borrowed from:
        // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [
            []
        ];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null,
            strMatchedValue;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while ((arrMatches = delimiterPattern.exec(strData))) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);

            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }

        // remove closure
        if (arrData[0][0].substr(0, 1) == closure) {
            arrData[0][0] = arrData[0][0].substr(1);
        }
        var p = arrData.length - 1,
            q = arrData[p].length - 1,
            r = arrData[p][q].length - 1;
        if (arrData[p][q].substr(r) == closure) {
            arrData[p][q] = arrData[p][q].substr(0, r);
        }

        // Return the parsed data.
        return (arrData.slice(1));
    } // end parseCSV

    function transpose(arrMatrix) {
        // borrowed from:
        // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
        var a = arrMatrix,
            w = a.length ? a.length : 0,
            h = a[0] instanceof Array ? a[0].length : 0;
        if (h === 0 || w === 0) {
            return [];
        }
        var i, j, t = [];
        for (i = 0; i < h; i++) {
            t[i] = [];
            for (j = 0; j < w; j++) {
                t[i][j] = a[j][i];
            }
        }
        return t;
    }

    function makeDataset(arrData) {
        var columns = [],
            columnNames = {},
            rowCount = arrData.length,
            columnCount = arrData[0].length,
            rowIndex = opts.skipRows;

        // compute series
        var srcColumns = [];
        if (opts.firstRowIsHeader) {
            srcColumns = arrData[rowIndex];
            rowIndex++;
        }

        // check that columns names are unique and not empty

        for (var c = 0; c < columnCount; c++) {
            var col = _isString(srcColumns[c]) ? srcColumns[c].replace(/^\s+|\s+$/g, '') : '',
                suffix = col !== '' ? '' : 1;
            col = col !== '' ? col : 'X.';
            while (columnNames[col + suffix] !== undefined) {
                suffix = suffix === '' ? 1 : suffix + 1;
            }
            columns.push({
                name: col + suffix,
                data: []
            });
            columnNames[col + suffix] = true;
        }

        _range(rowIndex, rowCount).forEach(function (row) {
            columns.forEach(function (c, i) {
                c.data.push(arrData[row][i] !== '' ? arrData[row][i] : opts.emptyValue);
            });
        });

        columns = columns.map(function (c) { return column(c.name, c.data); });
        return dataset(columns);
    } // end makeDataset

    arrData = parseCSV(this.__delimiterPatterns, data, opts.delimiter);
    if (opts.transpose) {
        arrData = transpose(arrData);
    }
    return makeDataset(arrData);
}; // end parse

DelimitedParser.prototype.guessDelimiter = function guessDelimiter (strData) {
    // find delimiter which occurs most often
    var maxMatchCount = 0,
        k = -1,
        me = this,
        delimiters = ['\t', ';', '|', ','];
    delimiters.forEach(function (delimiter, i) {
        var regex = getDelimiterPatterns(delimiter, me.quoteChar),
            c = strData.match(regex).length;
        if (c > maxMatchCount) {
            maxMatchCount = c;
            k = i;
        }
    });
    return delimiters[k];
};

function getDelimiterPatterns(delimiter, quoteChar) {
    return new RegExp(
    (
    // Delimiters.
    "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.
    "(?:" + quoteChar + "([^" + quoteChar + "]*(?:" + quoteChar + "\"[^" + quoteChar + "]*)*)" + quoteChar + "|" +
    // Standard fields.
    "([^" + quoteChar + "\\" + delimiter + "\\r\\n]*))"), "gi");
}

function reorderColumns(chart, dataset) {
    var order = chart.getMetadata('data.column-order', []);
    if (order.length && order.length == dataset.numColumns()) {
        dataset.columnOrder(order);
    }
    return dataset;
}

function applyChanges(chart, dataset) {
    var changes = chart.getMetadata('data.changes', []);
    var transpose = chart.getMetadata('data.transpose', false);
    // apply changes
    changes.forEach(function (change) {
        var row = "row", column = "column";
        if (transpose) {
            row = "column";
            column = "row";
        }

        if (dataset.hasColumn(change[column])) {
            if (change[row] === 0) {
                dataset.column(change[column]).title(change.value);
            }
            else {
                dataset.column(change[column]).raw(change[row] - 1, change.value);
            }
        }
    });

    // overwrite column types
    var columnFormats = chart.getMetadata('data.column-format', {});
    _each(columnFormats, function (columnFormat, key) {
        if (columnFormat.type && dataset.hasColumn(key) && columnFormat.type != 'auto') {
            dataset.column(key).type(columnFormat.type);
        }
        if (columnFormat['input-format'] && dataset.hasColumn(key)) {
            dataset.column(key).type(true).format(columnFormat['input-format']);
        }
    });
    return dataset;
}

// `_isBoolean` : an object's function

// Is a given value a boolean?
function _isBoolean (obj) {
	return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}

function addComputedColumns(chart, dataset) {
    var v_columns = chart.getMetadata('describe.computed-columns', {});
    var data = dataset.list();
    var columnNameToVar = {};
    var col_aggregates = {};

    dataset.eachColumn(function(col) {
        if (col.isComputed) { return; }
        columnNameToVar[col.name()] = column_name_to_var(col.name());
        if (col.type() == 'number') {
            col_aggregates[col.name()] = {
                min: d3_min(col.values()),
                max: d3_max(col.values()),
                sum: d3_sum(col.values()),
                mean: d3_mean(col.values()),
                median: d3_median(col.values())
            };
        }
    });

    _each(v_columns, add_computed_column);

    return dataset;

    function add_computed_column(formula, name) {
        var datefmt = function (d) { return d.getFullYear()+'-'+left_pad(1+d.getMonth(), 2, 0)+'-'+left_pad(1+d.getDate(), 2, 0); },
            values = data.map(function (row, row_i) {
                var context = [];
                context.push('var __row = '+row_i+';');
                row.forEach(function (val, key) {
                    if (!columnNameToVar[key]) { return; }
                    context.push('var '+columnNameToVar[key]+' = '+JSON.stringify(val)+';');
                    if (dataset.column(key).type() == 'number') {
                        context.push('var '+columnNameToVar[key]+'__sum = '+col_aggregates[key].sum+';');
                        context.push('var '+columnNameToVar[key]+'__min = '+col_aggregates[key].min+';');
                        context.push('var '+columnNameToVar[key]+'__max = '+col_aggregates[key].max+';');
                        context.push('var '+columnNameToVar[key]+'__mean = '+col_aggregates[key].mean+';');
                        context.push('var '+columnNameToVar[key]+'__median = '+col_aggregates[key].median+';');
                    }
                });
                context.push('var max = Math.max, min = Math.min;');
                // console.log(context.join('\n'));
                return (function() {
                    try {
                        return eval(this.context.join('\n')+'\n'+formula);
                    } catch (e) {
                        console.warn(e);
                        return 'n/a';
                    }
                }).call({ context: context });
            }).map(function(v) {
                if (_isBoolean(v)) { return v ? 'yes' : 'no'; }
                if (_isDate(v)) { return datefmt(v); }
                if (_isNumber(v)) { return ''+v; }
                return String(v);
            });
        var v_col = dw.column(name, values);
        v_col.isComputed = true;
        dataset.add(v_col);
    }

    function column_name_to_var(name) {
        // if you change this, change computed-columns.js as well
        return name.toString().toLowerCase()
            .replace(/\s+/g, '_')           // Replace spaces with _
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/-/g, '_')             // Replace multiple - with single -
            .replace(/\_\_+/g, '_')         // Replace multiple - with single -
            .replace(/^_+/, '')             // Trim - from start of text
            .replace(/_+$/, '')             // Trim - from end of text
            .replace(/^(\d)/, '_$1')        // If first char is a number, prefix with _
            .replace(/^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/, '$1_'); // avoid reserved keywords
    }

    function d3_min(array) {
      var i = -1, n = array.length, a, b;
      if (arguments.length === 1) {
        while (++i < n) { if ((b = array[i]) != null && b >= b) {
          a = b;
          break;
        } }
        while (++i < n) { if ((b = array[i]) != null && a > b) { a = b; } }
      }
      return a;
    }
    function d3_max(array) {
      var i = -1, n = array.length, a, b;
      if (arguments.length === 1) {
        while (++i < n) { if ((b = array[i]) != null && b >= b) {
          a = b;
          break;
        } }
        while (++i < n) { if ((b = array[i]) != null && b > a) { a = b; } }
      }
      return a;
    }
    function d3_sum(array) {
        var s = 0, n = array.length, a, i = -1;
        if (arguments.length === 1) {
            while (++i < n) { if (d3_numeric(a = +array[i])) { s += a; } }
        }
        return s;
    }
    function d3_mean(array) {
        var s = 0, n = array.length, a, i = -1, j = n;
        while (++i < n) { if (d3_numeric(a = d3_number(array[i]))) { s += a; } else { --j; } }
        if (j) { return s / j; }
    }
    function d3_median(array) {
        var numbers = [], n = array.length, a, i = -1;
        if (arguments.length === 1) {
            while (++i < n) { if (d3_numeric(a = d3_number(array[i]))) { numbers.push(a); } }
        }
        if (numbers.length) { return d3_quantile(numbers.sort(d3_ascending), 0.5); }
    }
    function d3_quantile(values, p) {
        var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
        return e ? v + e * (values[h] - v) : v;
    }
    function d3_number(x) { return x === null ? NaN : +x; }
    function d3_numeric(x) { return !isNaN(x); }
    function d3_ascending(a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }
    function left_pad(s, l, pad) {
        s = String(s);
        while (s.length < l) { s = String(pad) + s; }
        return s;
    }
}

var Chart = (function (Store$$1) {
    function Chart () {
        Store$$1.apply(this, arguments);
    }

    if ( Store$$1 ) Chart.__proto__ = Store$$1;
    Chart.prototype = Object.create( Store$$1 && Store$$1.prototype );
    Chart.prototype.constructor = Chart;

    Chart.prototype.load = function load (csv, externalData) {
        var this$1 = this;

        var dsopts = {
            firstRowIsHeader: this.getMetadata('data.horizontal-header', true),
            transpose: this.getMetadata('data.transpose', false)
        };

        if (csv && !externalData) { dsopts.csv = csv; }
        else { dsopts.url = externalData || 'data.csv'; }

        var datasource = delimited(dsopts);

        return datasource.dataset().then(function (ds) {
            this$1.dataset(ds);
            // this.dataset(ds);
            // dataset_change_callbacks.fire(chart, ds);
            return ds;
        }).catch(function (e) {
            console.log('nope', e);
        });
    };

    // sets or returns the dataset
    Chart.prototype.dataset = function dataset (ds) {
        // set a new dataset, or reset the old one if ds===true
        if (arguments.length) {
            if (ds !== true) { this._dataset_cache = ds; }
            this._dataset =
                reorderColumns(this,
                applyChanges(this,
                addComputedColumns(this, ds === true ? this._dataset_cache : ds)));
            return this._dataset;
        }
        // return current dataset
        return this._dataset;
    };

    // sets or gets the theme
    Chart.prototype.theme = function theme (theme$1) {
        if (arguments.length) {
            // set new theme
            this.set({theme: theme$1});
            return this;
        }
        return this.get().theme;
    };

    // sets or gets the visualization
    Chart.prototype.vis = function vis (vis$1) {
        if (arguments.length) {
            // set new visualization
            this.set({vis: vis$1});
            return this;
        }
        return this.get().vis;
    };

    Chart.prototype.locale = function locale () {

    };

    Chart.prototype.getMetadata = function getMetadata (key, _default) {
        if ( _default === void 0 ) _default=null;

        var ref = this.get();
        var metadata = ref.metadata;
        // get metadata
        var keys = key.split('.');
        var pt = metadata;

        _some(keys, function (key) {
            if (_isUndefined(pt) || _isNull(pt)) { return true; } // break out of the loop
            pt = pt[key];
            return false;
        });
        return _isUndefined(pt) || _isNull(pt) ? _default : pt;
    };

    Chart.prototype.setMetadata = function setMetadata (key, value) {
        var keys = key.split('.');
        var lastKey = keys.pop();
        var ref = this.get();
        var metadata = ref.metadata;
        var pt = metadata;

        // resolve property until the parent dict
        keys.forEach(function (key) {
            if (_isUndefined(pt[key]) || _isNull(pt[key])) {
                pt[key] = {};
            }
            pt = pt[key];
        });

        // check if new value is set
        if (!is_equal(pt[lastKey], value)) {
            pt[lastKey] = value;
            this.set({metadata: metadata});
        }
        return this;
    };

    // stores the state of this chart to server
    Chart.prototype.save = function save () {

    };

    return Chart;
}(Store));

function is_equal(a, b) {
    return JSON.stringify(a) == JSON.stringify(b);
}

var main = {
	column: column,
	dataset: dataset,
	Chart: Chart,
	purifyHtml: purifyHtml,
	Store: Store
}

module.exports = main;
