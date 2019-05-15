(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/highlight', factory) :
	(global.highlight = factory());
}(this, (function () { 'use strict';

function noop() {}

function assign(tar, src) {
	for (var k in src) { tar[k] = src[k]; }
	return tar;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function detachBetween(before, after) {
	while (before.nextSibling && before.nextSibling !== after) {
		before.parentNode.removeChild(before.nextSibling);
	}
}

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) { iterations[i].d(); }
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setStyle(node, key, value) {
	node.style.setProperty(key, value);
}

function selectOption(select, value) {
	for (var i = 0; i < select.options.length; i += 1) {
		var option = select.options[i];

		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
}

function selectValue(select) {
	var selectedOption = select.querySelector(':checked') || select.options[0];
	return selectedOption && selectedOption.__value;
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = this.get = noop;

	if (detach !== false) { this._fragment.u(); }
	this._fragment.d();
	this._fragment = this._state = null;
}

function destroyDev(detach) {
	destroy.call(this, detach);
	this.destroy = function() {
		console.warn('Component was already destroyed');
	};
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

function getDev(key) {
	if (key) { console.warn("`let x = component.get('x')` is deprecated. Use `let { x } = component.get()` instead"); }
	return get.call(this, key);
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function init(component, options) {
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
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

function observeDev(key, callback, options) {
	console.warn("this.observe(key, (newValue, oldValue) => {...}) is deprecated. Use\n\n  // runs before DOM updates\n  this.on('state', ({ changed, current, previous }) => {...});\n\n  // runs after DOM updates\n  this.on('update', ...);\n\n...or add the observe method from the svelte-extras package");

	var c = (key = '' + key).search(/[.[]/);
	if (c > -1) {
		var message =
			'The first argument to component.observe(...) must be the name of a top-level property';
		if (c > 0)
			{ message += ", i.e. '" + key.slice(0, c) + "' rather than '" + key + "'"; }

		throw new Error(message);
	}

	return observe.call(this, key, callback, options);
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

function onDev(eventName, handler) {
	if (eventName === 'teardown') {
		console.warn(
			"Use component.on('destroy', ...) instead of component.on('teardown', ...) which has been deprecated and will be unsupported in Svelte 2"
		);
		return this.on('destroy', handler);
	}

	return on.call(this, eventName, handler);
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) { return; }
	this.root._lock = true;
	callAll(this.root._beforecreate);
	callAll(this.root._oncreate);
	callAll(this.root._aftercreate);
	this.root._lock = false;
}

function _set(newState) {
	var this$1 = this;

	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (this$1._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
	}
	if (!dirty) { return; }

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) { this._bind(changed, this._state); }

	if (this._fragment) {
		this.fire("state", { changed: changed, current: this._state, previous: oldState });
		this._fragment.p(changed, this._state);
		this.fire("update", { changed: changed, current: this._state, previous: oldState });
	}
}

function setDev(newState) {
	if (typeof newState !== 'object') {
		throw new Error(
			this._debugName + '.set was called without an object of data key-values to update.'
		);
	}

	this._checkReadOnly(newState);
	set.call(this, newState);
}

function callAll(fns) {
	while (fns && fns.length) { fns.shift()(); }
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

function _unmount() {
	if (this._fragment) { this._fragment.u(); }
}

function removeFromStore() {
	this.store._remove(this);
}

var protoDev = {
	destroy: destroyDev,
	get: getDev,
	fire: fire,
	observe: observeDev,
	on: onDev,
	set: setDev,
	teardown: destroyDev,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount,
	_differs: _differs
};

/* @DEPRECATED: plase use @datawrapper/shared instead */

/* globals dw */

/**
 * translates a message key. translations are originally stored in a
 * Google spreadsheet that we're pulling into Datawrapper using the
 * `scripts/update-translations` script, which stores them as `:locale.json`
 * files in the /locale folders (both in core as well as inside plugin folders)
 *
 * for the client-side translation to work we are also storing the translations
 * in the global `window.dw.backend.__messages` object. plugins that need
 * client-side translations must set `"svelte": true` in their plugin.json
 *
 * @export
 * @param {string} key -- the key to be translated, e.g. "signup / hed"
 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
 * @returns {string} -- the translated text
 */

var dw = window.dw;

function __(key, scope) {
    var arguments$1 = arguments;
    if ( scope === void 0 ) scope = 'core';

    key = key.trim();
    if (!dw.backend.__messages[scope]) { return 'MISSING:' + key; }
    var translation = dw.backend.__messages[scope][key] || dw.backend.__messages.core[key] || key;

    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            var index = i - 1;
            translation = translation.replace('$' + index, arguments$1[i]);
        }
    }

    return translation;
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
var nativeKeys = Object.keys;

// `_has` : an object's function

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
function _has (obj, key) {
	return obj != null && hasOwnProperty.call(obj, key);
}

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

// An internal function used for aggregate "group by" operations.
function group (behavior, partition) {
	return function (obj, iteratee, context) {
		var result = partition ? [[], []] : {};
		iteratee = cb(iteratee, context);
		_each(obj, function (value, index) {
			var key = iteratee(value, index, obj);
			behavior(result, value, key);
		});
		return result;
	};
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

// `_indexBy` : a collection's function

// Indexes the object's values by a criterion, similar to `groupBy`, but for
// when you know that your index values will be unique.
var _indexBy = group( function (result, value, key) {
	result[key] = value;
});

/* highlight/App.html generated by Svelte v1.64.0 */

function elements(ref) {
    var $vis = ref.$vis;

    if (!$vis) { return []; }
    return $vis
        .keys()
        .sort()
        .map(function (key) {
            var keyLbl = $vis.keyLabel(key);
            return {
                key: key,
                label: key + (key !== keyLbl ? (" (" + keyLbl + ")") : '')
            };
        });
}
function highlightedElements(ref) {
    var highlighted = ref.highlighted;
    var elements = ref.elements;

    var els = _indexBy(elements, 'key');
    return highlighted.map(function (k) {
        return {
            key: k,
            valid: els[k]
        };
    });
}
function data() {
    return {
        selected: '---',
        highlighted: []
    };
}
var methods = {
    add: function add(element) {
        var this$1 = this;

        var ref = this.get();
        var highlighted = ref.highlighted;
        if (highlighted.indexOf(element) < 0) { highlighted.push(element); }
        this.set({ highlighted: highlighted });
        setTimeout(function () { return this$1.set({ selected: '---' }); }, 30);
    },
    remove: function remove(element) {
        var ref = this.get();
        var highlighted = ref.highlighted;
        highlighted.splice(highlighted.indexOf(element), 1);
        this.set({ highlighted: highlighted });
    }
};

function oncreate() {
    var this$1 = this;

    this.store.observe('vis', function (vis) {
        if (!vis) { return; }
        this$1.set({ highlighted: clone(vis.get('highlighted-series')) });
        vis.chart().onChange(function (chart, key) {
            if (key === 'metadata.visualize.highlighted-series') {
                this$1.set({ highlighted: clone(vis.get('highlighted-series')) });
            }
        });
    });
    this.observe('highlighted', function (hl) {
        var ref = this$1.store.get();
        var vis = ref.vis;
        if (!vis) { return; }
        var old = JSON.stringify(vis.get('highlighted-series'));
        if (old !== JSON.stringify(hl) && vis) {
            vis.chart().set('metadata.visualize.highlighted-series', clone(hl));
        }
    });
    this.observe('selected', function (sel) {
        if (sel && sel !== '---') {
            this$1.add(sel);
        }
    });
}
function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

function create_main_fragment(component, state) {
	var div, label, raw_value = __("Highlight the most import elements (optional)"), text, div_1, select, option, text_1, raw_1_value = __("select element"), raw_1_before, raw_1_after, text_2, select_updating = false, text_4, p;

	var each_value = state.elements;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			element: each_value[i],
			element_index: i
		}));
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ selected: selectValue(select) });
		select_updating = false;
	}

	var each_value_1 = state.highlightedElements;

	var each_1_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_1_blocks[i] = create_each_block_1(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			el: each_value_1[i],
			el_index: i
		}));
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text = createText("\n    ");
			div_1 = createElement("div");
			select = createElement("select");
			option = createElement("option");
			text_1 = createText("- ");
			raw_1_before = createElement('noscript');
			raw_1_after = createElement('noscript');
			text_2 = createText(" -");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_4 = createText("\n    ");
			p = createElement("p");

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			label.className = "separator";
			option.__value = "---";
			option.value = option.__value;
			addListener(select, "change", select_change_handler);
			if (!('selected' in state)) { component.root._beforecreate.push(select_change_handler); }
			select.id = "highlight-series";
			select.className = "span2";
			p.className = "highlighted-series";
			setStyle(p, "margin-top", "5px");
			div.className = "story-highlight control-group";
			setStyle(div, "clear", "both");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			label.innerHTML = raw_value;
			appendNode(text, div);
			appendNode(div_1, div);
			appendNode(select, div_1);
			appendNode(option, select);
			appendNode(text_1, option);
			appendNode(raw_1_before, option);
			raw_1_before.insertAdjacentHTML("afterend", raw_1_value);
			appendNode(raw_1_after, option);
			appendNode(text_2, option);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.selected);

			appendNode(text_4, div);
			appendNode(p, div);

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].m(p, null);
			}
		},

		p: function update(changed, state) {
			var each_value = state.elements;

			if (changed.elements) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						element: each_value[i],
						element_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) { selectOption(select, state.selected); }

			var each_value_1 = state.highlightedElements;

			if (changed.highlightedElements) {
				for (var i = 0; i < each_value_1.length; i += 1) {
					var each_1_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						el: each_value_1[i],
						el_index: i
					});

					if (each_1_blocks[i]) {
						each_1_blocks[i].p(changed, each_1_context);
					} else {
						each_1_blocks[i] = create_each_block_1(component, each_1_context);
						each_1_blocks[i].c();
						each_1_blocks[i].m(p, null);
					}
				}

				for (; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].u();
					each_1_blocks[i].d();
				}
				each_1_blocks.length = each_value_1.length;
			}
		},

		u: function unmount() {
			label.innerHTML = '';

			detachBetween(raw_1_before, raw_1_after);

			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);

			destroyEach(each_1_blocks);
		}
	};
}

// (6:12) {#each elements as element}
function create_each_block(component, state) {
	var element = state.element, each_value = state.each_value, element_index = state.element_index;
	var option, text_value = element.label, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = element.key;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			element = state.element;
			each_value = state.each_value;
			element_index = state.element_index;
			if ((changed.elements) && text_value !== (text_value = element.label)) {
				text.data = text_value;
			}

			if ((changed.elements) && option_value_value !== (option_value_value = element.key)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (12:8) {#each highlightedElements as el}
function create_each_block_1(component, state) {
	var el = state.el, each_value_1 = state.each_value_1, el_index = state.el_index;
	var span, i, text, text_1_value = el.key, text_1, span_data_series_value, span_class_value, text_2;

	return {
		c: function create() {
			span = createElement("span");
			i = createElement("i");
			text = createText(" ");
			text_1 = createText(text_1_value);
			text_2 = createText("\n         ");
			this.h();
		},

		h: function hydrate() {
			addListener(i, "click", click_handler);
			i.className = "fa fa-remove";

			i._svelte = {
				component: component,
				each_value_1: state.each_value_1,
				el_index: state.el_index
			};

			span.dataset.series = span_data_series_value = el.key;
			span.className = span_class_value = "badge " + (el.valid ? 'badge-info' : '');
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(i, span);
			appendNode(text, span);
			appendNode(text_1, span);
			insertNode(text_2, target, anchor);
		},

		p: function update(changed, state) {
			el = state.el;
			each_value_1 = state.each_value_1;
			el_index = state.el_index;
			i._svelte.each_value_1 = state.each_value_1;
			i._svelte.el_index = state.el_index;

			if ((changed.highlightedElements) && text_1_value !== (text_1_value = el.key)) {
				text_1.data = text_1_value;
			}

			if ((changed.highlightedElements) && span_data_series_value !== (span_data_series_value = el.key)) {
				span.dataset.series = span_data_series_value;
			}

			if ((changed.highlightedElements) && span_class_value !== (span_class_value = "badge " + (el.valid ? 'badge-info' : ''))) {
				span.className = span_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
			detachNode(text_2);
		},

		d: function destroy$$1() {
			removeListener(i, "click", click_handler);
		}
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var each_value_1 = this._svelte.each_value_1, el_index = this._svelte.el_index, el = each_value_1[el_index];
	component.remove(el.key);
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(assign(this.store._init(["vis"]), data()), options.data);
	this.store._add(this, ["vis"]);
	this._recompute({ $vis: 1, highlighted: 1, elements: 1 }, this._state);
	if (!('highlighted' in this._state)) { console.warn("<App> was created without expected data property 'highlighted'"); }

	if (!('$vis' in this._state)) { console.warn("<App> was created without expected data property '$vis'"); }
	if (!('selected' in this._state)) { console.warn("<App> was created without expected data property 'selected'"); }

	this._handlers.destroy = [removeFromStore];

	var self = this;
	var _oncreate = function() {
		var changed = { highlighted: 1, elements: 1, $vis: 1, selected: 1, highlightedElements: 1 };
		oncreate.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
		callAll(this._oncreate);
	}
}

assign(App.prototype, protoDev);
assign(App.prototype, methods);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('elements' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'elements'"); }
	if ('highlightedElements' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'highlightedElements'"); }
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.$vis) {
		if (this._differs(state.elements, (state.elements = elements(state)))) { changed.elements = true; }
	}

	if (changed.highlighted || changed.elements) {
		if (this._differs(state.highlightedElements, (state.highlightedElements = highlightedElements(state)))) { changed.highlightedElements = true; }
	}
};

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

/* globals chart */

var store = new Store({});

var data$1 = {
    chart: {
        id: ''
    }
};

function init$1(app) {
    window.dw.backend
        .on('dataset-loaded', function() {
            app.store.set({ dataset: chart.dataset() });
        })
        .on('theme-changed-and-loaded', function() {
            app.store.set({ theme: window.dw.theme(chart.get('theme')) });
        })
        .on('backend-vis-loaded', function(vis) {
            app.store.set({ vis: vis });
        });
}

var main = { App: App, data: data$1, store: store, init: init$1 };

return main;

})));
//# sourceMappingURL=highlight.js.map
