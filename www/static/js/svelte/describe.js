(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('cm/lib/codemirror'), require('cm/mode/javascript/javascript'), require('cm/addon/mode/simple'), require('cm/addon/hint/show-hint'), require('cm/addon/edit/matchbrackets'), require('cm/addon/display/placeholder'), require('Handsontable')) :
	typeof define === 'function' && define.amd ? define('svelte/describe', ['cm/lib/codemirror', 'cm/mode/javascript/javascript', 'cm/addon/mode/simple', 'cm/addon/hint/show-hint', 'cm/addon/edit/matchbrackets', 'cm/addon/display/placeholder', 'Handsontable'], factory) :
	(global.describe = factory(null,null,null,null,null,null,null));
}(this, (function (CodeMirror,javascript,simple,showHint,matchbrackets,placeholder,HOT) { 'use strict';

	CodeMirror = CodeMirror && CodeMirror.hasOwnProperty('default') ? CodeMirror['default'] : CodeMirror;
	HOT = HOT && HOT.hasOwnProperty('default') ? HOT['default'] : HOT;

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
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

	function detachBefore(after) {
		while (after.previousSibling) {
			after.parentNode.removeChild(after.previousSibling);
		}
	}

	function destroyEach(iterations) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d();
		}
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createSvgElement(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function createComment() {
		return document.createComment('');
	}

	function addListener(node, event, handler) {
		node.addEventListener(event, handler, false);
	}

	function removeListener(node, event, handler) {
		node.removeEventListener(event, handler, false);
	}

	function setAttribute(node, attribute, value) {
		node.setAttribute(attribute, value);
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

		if (detach !== false) this._fragment.u();
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
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				handler.__calling = true;
				handler.call(this, data);
				handler.__calling = false;
			}
		}
	}

	function getDev(key) {
		if (key) console.warn("`let x = component.get('x')` is deprecated. Use `let { x } = component.get()` instead");
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
			if (event.changed[key]) fn(event.current[key], event.previous && event.previous[key]);
		});
	}

	function observeDev(key, callback, options) {
		console.warn("this.observe(key, (newValue, oldValue) => {...}) is deprecated. Use\n\n  // runs before DOM updates\n  this.on('state', ({ changed, current, previous }) => {...});\n\n  // runs after DOM updates\n  this.on('update', ...);\n\n...or add the observe method from the svelte-extras package");

		var c = (key = '' + key).search(/[.[]/);
		if (c > -1) {
			var message =
				'The first argument to component.observe(...) must be the name of a top-level property';
			if (c > 0)
				message += ", i.e. '" + key.slice(0, c) + "' rather than '" + key + "'";

			throw new Error(message);
		}

		return observe.call(this, key, callback, options);
	}

	function on(eventName, handler) {
		if (eventName === 'teardown') return this.on('destroy', handler);

		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
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
		if (this.root._lock) return;
		this.root._lock = true;
		callAll(this.root._beforecreate);
		callAll(this.root._oncreate);
		callAll(this.root._aftercreate);
		this.root._lock = false;
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

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
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	function _unmount() {
		if (this._fragment) this._fragment.u();
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
	const ArrayProto = Array.prototype;
	const ObjProto = Object.prototype;
	const slice = ArrayProto.slice;
	const toString = ObjProto.toString;
	const hasOwnProperty = ObjProto.hasOwnProperty;

	// All **ECMAScript 5** native function implementations that we hope to use
	// are declared here.
	const nativeIsArray = Array.isArray;
	const nativeKeys = Object.keys;

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
		if (!_isObject(obj)) return [];
		if (nativeKeys) return nativeKeys(obj);
		let keys = [];
		for (let key in obj)
			if (_has(obj, key)) keys.push(key);
			// Ahem, IE < 9.
		if (hasEnumBug) collectNonEnumProps(obj, keys);
		return keys;
	}

	// `_forEach` : a collection's function

	// Handles raw objects in addition to array-likes. Treats all
	// sparse array-likes as if they were dense.
	function _each (obj, iteratee, context) {
		iteratee = optimizeCb(iteratee, context);
		let i, length;
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
		let value = iteratee(obj);
		let low = 0,
			high = getLength(array);
		while (low < high) {
			let mid = Math.floor((low + high) / 2);
			if (iteratee(array[mid]) < value) low = mid + 1;
			else high = mid;
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
		let keys = _keys(obj);
		let length = keys.length;
		let values = Array(length);
		for (let i = 0; i < length; i++) {
			values[i] = obj[keys[i]];
		}
		return values;
	}

	// `_include` : a collection's function

	// Determine if the array or object contains a given item (using `===`).
	function _contains (obj, item, fromIndex, guard) {
		if (!isArrayLike(obj)) obj = _values(obj);
		if (typeof fromIndex != 'number' || guard) fromIndex = 0;
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
		if (typeof Int8Array != 'object' && typeof document !== 'undefined' && typeof document.childNodes != 'function') {
			return (obj) => typeof obj == 'function' || false;
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
		if (toString.call(arguments) === '[object Arguments]') return null;
		return (obj) => _has(obj, 'callee');
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
		let result = {};
		let keys = _keys(obj);
		for (let i = 0, length = keys.length; i < length; i++) {
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
		let keys = _keys(attrs),
			length = keys.length;
		if (object == null) return !length;
		let obj = Object(object);
		for (let i = 0; i < length; i++) {
			let key = keys[i];
			if (attrs[key] !== obj[key] || !(key in obj)) return false;
		}
		return true;
	}

	// `_matches` : an utility's function

	// Returns a predicate for checking whether an object has a given set of
	// `key:value` pairs.
	function _matcher (attrs) {
		attrs = _extendOwn({}, attrs);
		return (obj) => _isMatch(obj, attrs);
	}

	// `_matcher` : an utility's function

	// `_` : base namespace and constructor for underscore's object
	 // @important: exportation of the function, not only it definition

	// Internal functions


	// Internal function that returns an efficient (for current engines) version
	// of the passed-in callback, to be repeatedly applied in other Underscore
	// functions.
	function optimizeCb (func, context, argCount) {
		if (context === void 0) return func;
		switch (argCount == null ? 3 : argCount) {
			case 1: return (value) => func.call(context, value);
				// The 2-parameter case has been omitted only because no current consumers
				// made use of it.
			case 3: return (value, index, collection) =>  func.call(context, value, index, collection);
			case 4: return (accumulator, value, index, collection) => func.call(context, accumulator, value, index, collection);
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
		if (_iteratee !== builtinIteratee) return _iteratee(value, context);
		if (value == null) return _identity;
		if (_isFunction(value)) return optimizeCb(value, context, argCount);
		if (_isObject(value)) return _matcher(value);
		return property(value);
	}

	// Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
	// This accumulates the arguments passed into an array, after a given index.
	function restArgs (func, startIndex) {
		startIndex = startIndex == null ? func.length - 1 : +startIndex;
		return function () {
			let length = Math.max(arguments.length - startIndex, 0),
				rest = Array(length),
				index = 0;
			for (; index < length; index++) {
				rest[index] = arguments[index + startIndex];
			}
			switch (startIndex) {
				case 0:
					return func.call(this, rest);
				case 1:
					return func.call(this, arguments[0], rest);
				case 2:
					return func.call(this, arguments[0], arguments[1], rest);
			}
			var args = Array(startIndex + 1);
			for (index = 0; index < startIndex; index++) {
				args[index] = arguments[index];
			}
			args[startIndex] = rest;
			return func.apply(this, args);
		};
	}

	// An internal function used for get key's value from an object.
	function property (key) {
		return (obj) => obj == null ? void 0 : obj[key];
	}

	// Helper for collection methods to determine whether a collection
	// should be iterated as an array or as an object.
	// Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var getLength = property('length');
	var isArrayLike = function(collection) { // @TODO simplify to function
		let length = getLength(collection);
		return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	};

	// An internal function used for aggregate "group by" operations.
	function group (behavior, partition) {
		return function (obj, iteratee, context) {
			let result = partition ? [[], []] : {};
			iteratee = cb(iteratee, context);
			_each(obj, (value, index) => {
				let key = iteratee(value, index, obj);
				behavior(result, value, key);
			});
			return result;
		};
	}

	// Generator function to create the findIndex and findLastIndex functions.
	function createPredicateIndexFinder (dir) {
		return function (array, predicate, context) {
			predicate = cb(predicate, context);
			let length = getLength(array);
			let index = dir > 0 ? 0 : length - 1;
			for (; index >= 0 && index < length; index += dir) {
				if (predicate(array[index], index, array)) return index;
			}
			return -1;
		};
	}

	// Generator function to create the indexOf and lastIndexOf functions.
	function createIndexFinder (dir, predicateFind, sortedIndex) {
		return function (array, item, idx) {
			let i = 0,
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
				if (array[idx] === item) return idx;
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
		let nonEnumIdx = nonEnumerableProps.length;
		let constructor = obj.constructor;
		let proto = _isFunction(constructor) && constructor.prototype || ObjProto;

		// Constructor is a special case.
		let prop = 'constructor';
		if (_has(obj, prop) && !_contains(keys, prop)) keys.push(prop);

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
			let length = arguments.length;
			if (defaults) obj = Object(obj);
			if (length < 2 || obj == null) return obj;
			for (let index = 1; index < length; index++) {
				let source = arguments[index],
					keys = keysFunc(source),
					l = keys.length;
				for (let i = 0; i < l; i++) {
					let key = keys[i];
					if (_isObject(obj) && (!defaults || obj[key] === void 0)) obj[key] = source[key];
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

	// `_delay` : (ahem) a function's function

	// Delays a function for the given number of milliseconds, and then calls
	// it with the arguments supplied.
	var _delay = restArgs( (func, wait, args) => {
	  return setTimeout( () => {
	    return func.apply(null, args);
	  }, wait);
	});

	// `_debounce` : (ahem) a function's function

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	function _debounce (func, wait, immediate) {
	  let timeout, result;

	  let later = function (context, args) {
	    timeout = null;
	    if (args) result = func.apply(context, args);
	  };

	  let debounced = restArgs(function (args) {
	    if (timeout) clearTimeout(timeout);
	    if (immediate) {
	      var callNow = !timeout;
	      timeout = setTimeout(later, wait);
	      if (callNow) result = func.apply(this, args);
	    } else {
	      timeout = _delay(later, wait, this, args);
	    }

	    return result;
	  });

	  debounced.cancel = function () {
	    clearTimeout(timeout);
	    timeout = null;
	  };

	  return debounced;
	}

	function clone(o) {
		if (!o || typeof o != 'object') return o;
		try {
			return JSON.parse(JSON.stringify(o));
		} catch(e) {
			return o;
		}
	}

	/* globals dw */

	function __(key, scope='core') {
	    return dw.backend.__messages[scope][key] ||
	        // fall back to core
	        dw.backend.__messages.core[key] || key;
	}

	/* describe/ComputedColumnEditor.html generated by Svelte v1.64.0 */

	function title({ column }) {
	    var s = __("describe / edit-column");
	    return s.replace('%s', `"${column ? column.title() || column.name() : '--'}"`)
	}
	function metaColumns({ columns }) {
	    if (!columns) return [];
	    return columns.map(col => {
	        return {
	            key: column_name_to_var(col.name()),
	            title: col.title(),
	            type: col.type()
	        };
	    });
	}
	function keywords({ metaColumns }) {
	    const keywords = ['sum','round','min','max','median','mean'];
	    metaColumns.forEach(function(col) {
	        keywords.push(col.key);
	        if (col.type == 'number') {
	            keywords.push(col.key+'__sum');
	            keywords.push(col.key+'__min');
	            keywords.push(col.key+'__max');
	            keywords.push(col.key+'__mean');
	            keywords.push(col.key+'__median');
	        }
	    });
	    return keywords;
	}
	function data() {
	    return {
	        name: '',
	        formula: ''
	    }
	}
	var methods = {
	    insert (column) {
	        const {cm} = this.get();
	        cm.replaceSelection(column.key);
	        cm.focus();
	    },
	    removeColumn() {
	        const {column} = this.get();
	        const chart = this.store.get('dw_chart');
	        const ds = chart.dataset();
	        const customCols = clone(chart.get('metadata.describe.computed-columns', {}));
	        delete customCols[column.name()];
	        const col_index = ds.columnOrder()[ds.indexOf(column.name())];
	        // delete all changes that have been made to this column
	        const changes = chart.get('metadata.data.changes', []);
	        const changes_new = [];
	        changes.forEach(c => {
	            if (c.column == col_index) return; // skip
	            if (c.column > col_index) c.column--;
	            changes_new.push(c);
	        });
	        chart.set('metadata.describe.computed-columns', customCols);
	        chart.set('metadata.data.changes', changes_new);
	        chart.saveSoon();
	        this.fire('updateTable');
	        this.fire('unselect');
	    }
	};

	function oncreate() {
	    const {column} = this.get();

	    const chart = this.store.get('dw_chart');
	    const customCols = chart.get('metadata.describe.computed-columns', {});

	    this.set({
	        formula: customCols[column.name()] || '',
	        name: column.title()
	    });

	    // update if column changes
	    this.observe('column', (col) => {
	        if (col) this.set({
	            formula: customCols[col.name()] || '',
	            name: col.title()
	        });
	    });

	    const app = this;

	    function scriptHint(editor) {
	        // Find the token at the cursor
	        var cur = editor.getCursor(),
	            token = editor.getTokenAt(cur),
	            match = [];

	        const keywords = app.get('keywords');

	        if (token.type == 'variable') {
	            match = keywords.filter(function(chk) {
	                return chk.toLowerCase()
	                    .indexOf(token.string.toLowerCase()) === 0;
	            });
	        }

	        return {
	            list: match,
	            from: CodeMirror.Pos(cur.line, token.start),
	            to: CodeMirror.Pos(cur.line, token.end)
	        };
	    }

	    // CodeMirror.registerHelper("hint", "javascript", function(editor, options) {
	    //     return scriptHint(editor, options);
	    // });

	    const cm = CodeMirror.fromTextArea(this.refs.code, {
	        value: this.get('formula') || '',
	        mode: 'simple',
	        indentUnit: 2,
	        tabSize: 2,
	        lineWrapping: true,
	        matchBrackets: true,
	        placeholder: '// enter formula here',
	        continueComments: "Enter",
	        extraKeys: {
	            'Tab': 'autocomplete'
	        },
	        hintOptions: {
	            hint: scriptHint
	        }
	    });

	    window.CodeMirror = CodeMirror;

	    this.set({cm});

	    const updateTable = _debounce(() => this.fire('updateTable'), 1500);

	    this.observe('formula', (formula) => {
	        // update codemirror
	        if (formula != cm.getValue()) {
	            cm.setValue(formula);
	        }
	        // update dw.chart
	        const {column} = this.get();
	        const customCols = chart.get('metadata.describe.computed-columns', {});
	        if (customCols[column.name()] != formula) {
	            customCols[column.name()] = formula;
	            chart.set('metadata.describe.computed-columns', customCols);
	            if (chart.saveSoon) chart.saveSoon();
	            updateTable();
	        }
	    });

	    this.observe('name', (name) => {
	        const {column} = this.get();
	        const changes = chart.get('metadata.data.changes', []);
	        const ds = chart.dataset();
	        const col = ds.columnOrder()[ds.indexOf(column.name())];
	        let last_col_name_change_i = -1;
	        changes.forEach((change,i) => {
	            if (change.column == col && change.row === 0) {
	                last_col_name_change_i = i;
	            }
	        });
	        if (last_col_name_change_i > -1) {
	            // update last change of that cell
	            changes[last_col_name_change_i].value = name;
	            changes[last_col_name_change_i].time = (new Date()).getTime();
	        } else {
	            // add new change
	            changes.push({
	                column: col, row: 0, value: name, time: (new Date()).getTime()
	            });
	        }
	        chart.set('metadata.data.changes', changes);
	        if (chart.saveSoon) chart.saveSoon();
	        updateTable();
	    });

	    cm.on('change', (cm) => {
	        this.set({formula: cm.getValue()});
	    });

	    this.observe('metaColumns', (cols) => {
	        var columns_regex = new RegExp(`(?:${this.get('keywords').join('|')})`);
	        CodeMirror.defineSimpleMode("simplemode", {
	            // The start state contains the rules that are intially used
	            start: [
	                // The regex matches the token, the token property contains the type
	                {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
	                // You can match multiple tokens at once. Note that the captured
	                // groups must span the whole string in this case
	                {regex: /(function)(\s+)([a-z$][\w$]*)/,
	                 token: ["keyword", null, "keyword"]},
	                // Rules are matched in the order in which they appear, so there is
	                // no ambiguity between this one and the one above
	                {regex: /(?:function|var|return|if|for|while|else|do|this)\b/,
	                 token: "keyword"},
	                {regex: /true|false|null|undefined/, token: "atom"},
	                {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
	                 token: "number"},
	                {regex: /\/\/.*/, token: "comment"},
	                {regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
	                // A next property will cause the mode to move to a different state
	                {regex: /\/\*/, token: "comment", next: "comment"},
	                {regex: /[-+\/*=<>!]+/, token: "operator"},
	                // indent and dedent properties guide autoindentation
	                {regex: /[\{\[\(]/, indent: true},
	                {regex: /[\}\]\)]/, dedent: true},
	                {regex: columns_regex, token: 'variable-2'},
	                {regex: /[a-z$][\w$]*/, token: "variable"},
	                // You can embed other modes with the mode property. This rule
	                // causes all code between << and >> to be highlighted with the XML
	                // mode.
	                {regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
	            ],
	            // The multi-line comment state.
	            comment: [
	                {regex: /.*?\*\//, token: "comment", next: "start"},
	                {regex: /.*/, token: "comment"}
	            ],
	            // The meta property contains global information about the mode. It
	            // can contain properties like lineComment, which are supported by
	            // all modes, and also directives like dontIndentStates, which are
	            // specific to simple modes.
	            meta: {
	                dontIndentStates: ["comment"],
	                lineComment: "//"
	            }
	        });

	        cm.setOption('mode', 'simplemode');
	    });
	}
	function column_name_to_var(name) {
	    // if you change this, change dw.chart.js as well
	    return name.toString().toLowerCase()
	        .replace(/\s+/g, '_')           // Replace spaces with _
	        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
	        .replace(/-/g, '_')             // Replace - with single _
	        .replace(/__+/g, '_')         // Replace multiple _ with single _
	        .replace(/^_+/, '')             // Trim _ from start of text
	        .replace(/_+$/, '')             // Trim _ from end of text
	        .replace(/^(\d)/, '_$1')        // If first char is a number, prefix with _
	        .replace(/^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/, '$1_'); // reserved keywords
	}

	function create_main_fragment(component, state) {
		var div, h3, text, text_1, p, text_2_value = __("computed columns / modal / intro"), text_2, text_3, label, text_4_value = __("computed columns / modal / name"), text_4, text_5, input, input_updating = false, text_6, label_1, text_7_value = __("computed columns / modal / formula"), text_7, text_8, textarea, text_9, p_1, text_10_value = __("computed columns / modal / available columns"), text_10, text_11, text_12, ul, text_14, button, i, text_15, text_16_value = __("computed columns / modal / remove"), text_16;

		function input_input_handler() {
			input_updating = true;
			component.set({ name: input.value });
			input_updating = false;
		}

		var each_value = state.metaColumns;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block(component, assign(assign({}, state), {
				each_value: each_value,
				col: each_value[i_1],
				col_index: i_1
			}));
		}

		function click_handler_1(event) {
			component.removeColumn();
		}

		return {
			c: function create() {
				div = createElement("div");
				h3 = createElement("h3");
				text = createText(state.title);
				text_1 = createText("\n    ");
				p = createElement("p");
				text_2 = createText(text_2_value);
				text_3 = createText("\n\n    ");
				label = createElement("label");
				text_4 = createText(text_4_value);
				text_5 = createText("\n    ");
				input = createElement("input");
				text_6 = createText("\n\n    ");
				label_1 = createElement("label");
				text_7 = createText(text_7_value);
				text_8 = createText("\n    ");
				textarea = createElement("textarea");
				text_9 = createText("\n\n    ");
				p_1 = createElement("p");
				text_10 = createText(text_10_value);
				text_11 = createText(":");
				text_12 = createText("\n\n    ");
				ul = createElement("ul");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}

				text_14 = createText("\n\n");
				button = createElement("button");
				i = createElement("i");
				text_15 = createText(" ");
				text_16 = createText(text_16_value);
				this.h();
			},

			h: function hydrate() {
				h3.className = "first";
				label.className = "svelte-du6ec3";
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				label_1.className = "svelte-du6ec3";
				textarea.className = "code";
				setStyle(p_1, "margin-top", "1em");
				ul.className = "col-select svelte-du6ec3";
				setStyle(div, "margin-bottom", "15px");
				i.className = "fa fa-trash";
				addListener(button, "click", click_handler_1);
				button.className = "btn btn-danger";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(h3, div);
				appendNode(text, h3);
				appendNode(text_1, div);
				appendNode(p, div);
				appendNode(text_2, p);
				appendNode(text_3, div);
				appendNode(label, div);
				appendNode(text_4, label);
				appendNode(text_5, div);
				appendNode(input, div);

				input.value = state.name;

				appendNode(text_6, div);
				appendNode(label_1, div);
				appendNode(text_7, label_1);
				appendNode(text_8, div);
				appendNode(textarea, div);
				component.refs.code = textarea;
				appendNode(text_9, div);
				appendNode(p_1, div);
				appendNode(text_10, p_1);
				appendNode(text_11, p_1);
				appendNode(text_12, div);
				appendNode(ul, div);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(ul, null);
				}

				insertNode(text_14, target, anchor);
				insertNode(button, target, anchor);
				appendNode(i, button);
				appendNode(text_15, button);
				appendNode(text_16, button);
			},

			p: function update(changed, state) {
				if (changed.title) {
					text.data = state.title;
				}

				if (!input_updating) input.value = state.name;

				var each_value = state.metaColumns;

				if (changed.metaColumns) {
					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							col: each_value[i_1],
							col_index: i_1
						});

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, each_context);
						} else {
							each_blocks[i_1] = create_each_block(component, each_context);
							each_blocks[i_1].c();
							each_blocks[i_1].m(ul, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].u();
						each_blocks[i_1].d();
					}
					each_blocks.length = each_value.length;
				}
			},

			u: function unmount() {
				detachNode(div);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].u();
				}

				detachNode(text_14);
				detachNode(button);
			},

			d: function destroy$$1() {
				removeListener(input, "input", input_input_handler);
				if (component.refs.code === textarea) component.refs.code = null;

				destroyEach(each_blocks);

				removeListener(button, "click", click_handler_1);
			}
		};
	}

	// (14:8) {#each metaColumns as col}
	function create_each_block(component, state) {
		var col = state.col, each_value = state.each_value, col_index = state.col_index;
		var li, text_value = col.key, text;

		return {
			c: function create() {
				li = createElement("li");
				text = createText(text_value);
				this.h();
			},

			h: function hydrate() {
				addListener(li, "click", click_handler);
				li.className = "svelte-du6ec3";

				li._svelte = {
					component: component,
					each_value: state.each_value,
					col_index: state.col_index
				};
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				appendNode(text, li);
			},

			p: function update(changed, state) {
				col = state.col;
				each_value = state.each_value;
				col_index = state.col_index;
				if ((changed.metaColumns) && text_value !== (text_value = col.key)) {
					text.data = text_value;
				}

				li._svelte.each_value = state.each_value;
				li._svelte.col_index = state.col_index;
			},

			u: function unmount() {
				detachNode(li);
			},

			d: function destroy$$1() {
				removeListener(li, "click", click_handler);
			}
		};
	}

	function click_handler(event) {
		var component = this._svelte.component;
		var each_value = this._svelte.each_value, col_index = this._svelte.col_index, col = each_value[col_index];
		component.insert(col);
	}

	function ComputedColumnEditor(options) {
		this._debugName = '<ComputedColumnEditor>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this.refs = {};
		this._state = assign(data(), options.data);
		this._recompute({ column: 1, columns: 1, metaColumns: 1 }, this._state);
		if (!('column' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'column'");
		if (!('columns' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'columns'");


		if (!('name' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'name'");

		var self = this;
		var _oncreate = function() {
			var changed = { column: 1, columns: 1, metaColumns: 1, title: 1, name: 1 };
			oncreate.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(ComputedColumnEditor.prototype, protoDev);
	assign(ComputedColumnEditor.prototype, methods);

	ComputedColumnEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'title'");
		if ('metaColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'metaColumns'");
		if ('keywords' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'keywords'");
	};

	ComputedColumnEditor.prototype._recompute = function _recompute(changed, state) {
		if (changed.column) {
			if (this._differs(state.title, (state.title = title(state)))) changed.title = true;
		}

		if (changed.columns) {
			if (this._differs(state.metaColumns, (state.metaColumns = metaColumns(state)))) changed.metaColumns = true;
		}

		if (changed.metaColumns) {
			if (this._differs(state.keywords, (state.keywords = keywords(state)))) changed.keywords = true;
		}
	};

	/* controls/Checkbox.html generated by Svelte v1.64.0 */

	function data$1() {
	    return {
	        disabled: false
	    }
	}
	function create_main_fragment$1(component, state) {
		var div, label, input, text, text_1, label_class_value;

		function input_change_handler() {
			component.set({ value: input.checked });
		}

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				input = createElement("input");
				text = createText(" ");
				text_1 = createText(state.label);
				this.h();
			},

			h: function hydrate() {
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "checkbox");
				input.disabled = state.disabled;
				input.className = "svelte-llolt7";
				label.className = label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " svelte-llolt7";
				div.className = "control-group vis-option-group vis-option-type-checkbox";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				appendNode(input, label);

				input.checked = state.value;

				appendNode(text, label);
				appendNode(text_1, label);
			},

			p: function update(changed, state) {
				input.checked = state.value;
				if (changed.disabled) {
					input.disabled = state.disabled;
				}

				if (changed.label) {
					text_1.data = state.label;
				}

				if ((changed.disabled) && label_class_value !== (label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " svelte-llolt7")) {
					label.className = label_class_value;
				}
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy$$1() {
				removeListener(input, "change", input_change_handler);
			}
		};
	}

	function Checkbox(options) {
		this._debugName = '<Checkbox>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(data$1(), options.data);
		if (!('disabled' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
		if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Checkbox.prototype, protoDev);

	Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Select.html generated by Svelte v1.64.0 */

	function data$2() {
	    return {
	        disabled: false,
	        width: 'auto',
	        options: [],
	        optgroups: [],
	    };
	}
	function create_main_fragment$2(component, state) {
		var div, label, text_1, div_1, select, if_block_anchor, select_updating = false, div_1_class_value;

		var if_block = (state.options.length) && create_if_block(component, state);

		var if_block_1 = (state.optgroups.length) && create_if_block_1(component, state);

		function select_change_handler() {
			select_updating = true;
			component.set({ value: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text_1 = createText("\n\n    ");
				div_1 = createElement("div");
				select = createElement("select");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				if (if_block_1) if_block_1.c();
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label";
				addListener(select, "change", select_change_handler);
				if (!('value' in state)) component.root._beforecreate.push(select_change_handler);
				select.disabled = state.disabled;
				setStyle(select, "width", state.width);
				div_1.className = div_1_class_value = "controls form-inline " + (state.disabled? 'disabled' :'');
				div.className = "control-group vis-option-type-select";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				label.innerHTML = state.label;
				appendNode(text_1, div);
				appendNode(div_1, div);
				appendNode(select, div_1);
				if (if_block) if_block.m(select, null);
				appendNode(if_block_anchor, select);
				if (if_block_1) if_block_1.m(select, null);

				selectOption(select, state.value);
			},

			p: function update(changed, state) {
				if (changed.label) {
					label.innerHTML = state.label;
				}

				if (state.options.length) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block(component, state);
						if_block.c();
						if_block.m(select, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (state.optgroups.length) {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1(component, state);
						if_block_1.c();
						if_block_1.m(select, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				if (!select_updating) selectOption(select, state.value);
				if (changed.disabled) {
					select.disabled = state.disabled;
				}

				if (changed.width) {
					setStyle(select, "width", state.width);
				}

				if ((changed.disabled) && div_1_class_value !== (div_1_class_value = "controls form-inline " + (state.disabled? 'disabled' :''))) {
					div_1.className = div_1_class_value;
				}
			},

			u: function unmount() {
				label.innerHTML = '';

				detachNode(div);
				if (if_block) if_block.u();
				if (if_block_1) if_block_1.u();
			},

			d: function destroy$$1() {
				if (if_block) if_block.d();
				if (if_block_1) if_block_1.d();
				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (9:12) {#each options as opt}
	function create_each_block$1(component, state) {
		var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
		var option, text_value = opt.label, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				this.h();
			},

			h: function hydrate() {
				option.__value = option_value_value = opt.value;
				option.value = option.__value;
			},

			m: function mount(target, anchor) {
				insertNode(option, target, anchor);
				appendNode(text, option);
			},

			p: function update(changed, state) {
				opt = state.opt;
				each_value = state.each_value;
				opt_index = state.opt_index;
				if ((changed.options) && text_value !== (text_value = opt.label)) {
					text.data = text_value;
				}

				if ((changed.options) && option_value_value !== (option_value_value = opt.value)) {
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

	// (8:8) {#if options.length}
	function create_if_block(component, state) {
		var each_anchor;

		var each_value = state.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, assign(assign({}, state), {
				each_value: each_value,
				opt: each_value[i],
				opt_index: i
			}));
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insertNode(each_anchor, target, anchor);
			},

			p: function update(changed, state) {
				var each_value = state.options;

				if (changed.options) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							opt: each_value[i],
							opt_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$1(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}
			},

			u: function unmount() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				detachNode(each_anchor);
			},

			d: function destroy$$1() {
				destroyEach(each_blocks);
			}
		};
	}

	// (14:12) {#each optgroups as optgroup}
	function create_each_block_1(component, state) {
		var optgroup = state.optgroup, each_value_1 = state.each_value_1, optgroup_index = state.optgroup_index;
		var optgroup_1, optgroup_1_label_value;

		var each_value_2 = optgroup.options;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, assign(assign({}, state), {
				each_value_2: each_value_2,
				opt: each_value_2[i],
				opt_index_1: i
			}));
		}

		return {
			c: function create() {
				optgroup_1 = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				this.h();
			},

			h: function hydrate() {
				setAttribute(optgroup_1, "label", optgroup_1_label_value = optgroup.label);
			},

			m: function mount(target, anchor) {
				insertNode(optgroup_1, target, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(optgroup_1, null);
				}
			},

			p: function update(changed, state) {
				optgroup = state.optgroup;
				each_value_1 = state.each_value_1;
				optgroup_index = state.optgroup_index;
				var each_value_2 = optgroup.options;

				if (changed.optgroups) {
					for (var i = 0; i < each_value_2.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value_2: each_value_2,
							opt: each_value_2[i],
							opt_index_1: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block_2(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(optgroup_1, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value_2.length;
				}

				if ((changed.optgroups) && optgroup_1_label_value !== (optgroup_1_label_value = optgroup.label)) {
					setAttribute(optgroup_1, "label", optgroup_1_label_value);
				}
			},

			u: function unmount() {
				detachNode(optgroup_1);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy$$1() {
				destroyEach(each_blocks);
			}
		};
	}

	// (16:16) {#each optgroup.options as opt}
	function create_each_block_2(component, state) {
		var optgroup = state.optgroup, each_value_1 = state.each_value_1, optgroup_index = state.optgroup_index, opt = state.opt, each_value_2 = state.each_value_2, opt_index_1 = state.opt_index_1;
		var option, text_value = opt.label, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				this.h();
			},

			h: function hydrate() {
				option.__value = option_value_value = opt.value;
				option.value = option.__value;
			},

			m: function mount(target, anchor) {
				insertNode(option, target, anchor);
				appendNode(text, option);
			},

			p: function update(changed, state) {
				optgroup = state.optgroup;
				each_value_1 = state.each_value_1;
				optgroup_index = state.optgroup_index;
				opt = state.opt;
				each_value_2 = state.each_value_2;
				opt_index_1 = state.opt_index_1;
				if ((changed.optgroups) && text_value !== (text_value = opt.label)) {
					text.data = text_value;
				}

				if ((changed.optgroups) && option_value_value !== (option_value_value = opt.value)) {
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

	// (13:8) {#if optgroups.length}
	function create_if_block_1(component, state) {
		var each_anchor;

		var each_value_1 = state.optgroups;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, assign(assign({}, state), {
				each_value_1: each_value_1,
				optgroup: each_value_1[i],
				optgroup_index: i
			}));
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insertNode(each_anchor, target, anchor);
			},

			p: function update(changed, state) {
				var each_value_1 = state.optgroups;

				if (changed.optgroups) {
					for (var i = 0; i < each_value_1.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value_1: each_value_1,
							optgroup: each_value_1[i],
							optgroup_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block_1(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value_1.length;
				}
			},

			u: function unmount() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				detachNode(each_anchor);
			},

			d: function destroy$$1() {
				destroyEach(each_blocks);
			}
		};
	}

	function Select(options) {
		this._debugName = '<Select>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(data$2(), options.data);
		if (!('label' in this._state)) console.warn("<Select> was created without expected data property 'label'");
		if (!('disabled' in this._state)) console.warn("<Select> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<Select> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<Select> was created without expected data property 'width'");
		if (!('options' in this._state)) console.warn("<Select> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<Select> was created without expected data property 'optgroups'");

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
		}

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._beforecreate);
		}
	}

	assign(Select.prototype, protoDev);

	Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	// `_now` : an utility's function
	// -------------------------------

	// A (possibly faster) way to get the current timestamp as an integer.
	var _now = Date.now || function () {
		return new Date().getTime();
	};

	// `_throttle` : (ahem) a function's function

	// Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.
	function _throttle (func, wait, options) {
	  let timeout, context, args, result;
	  let previous = 0;
	  if (!options) options = {};

	  let later = function () {
	    previous = options.leading === false ? 0 : _now();
	    timeout = null;
	    result = func.apply(context, args);
	    if (!timeout) context = args = null;
	  };

	  let throttled = function () {
	    let now = _now();
	    if (!previous && options.leading === false) previous = now;
	    let remaining = wait - (now - previous);
	    context = this;
	    args = arguments;
	    if (remaining <= 0 || remaining > wait) {
	      if (timeout) {
	        clearTimeout(timeout);
	        timeout = null;
	      }
	      previous = now;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    } else if (!timeout && options.trailing !== false) {
	      timeout = setTimeout(later, remaining);
	    }
	    return result;
	  };

	  throttled.cancel = function () {
	    clearTimeout(timeout);
	    previous = 0;
	    timeout = context = args = null;
	  };

	  return throttled;
	}

	function arrayToObject(o) {
	    if (_isArray(o)) {
	        const obj = {};
	        Object.keys(o).forEach(k => obj[k] = o[k]);
	        return obj;
	    }
	    return o;
	}

	function tailLength(v) {
	    return (String(v - Math.floor(v)).replace(/00000*[0-9]+$/, '').replace(/99999*[0-9]+$/, '')).length - 2;
	}

	function toFixed(v) {
	    return (+v).toFixed(Math.max(0, tailLength(v)));
	}

	/* describe/CustomColumnFormat.html generated by Svelte v1.64.0 */

	function title$1({ column }) {
	    var s = __("describe / edit-column");
	    return s.replace('%s', `"${column ? column.title() || column.name() : '--'}"`)
	}
	function data$3() {
	    return {
	        columnFormat: {
	            type: 'auto',
	            ignore: false,
	            'number-divisor': '-',
	            'number-format': 'auto',
	            'number-prepend': '',
	            'number-append': '',
	        },
	        colTypes: [],
	        divisors_opts: [
	            {value:0, label: __("describe / column-format / no-change") },
	            {value:'auto', label: __("describe / column-format / automatic") },
	        ],
	        divisors: [{
	            label: __("describe / column-format / divide-by"),
	            options: [
	                {value:3, label:'1000'},
	                {value:6, label:'1 million'},
	                {value:9, label:'1 billion'},
	            ]
	        }, {
	            label: __("describe / column-format / multiply-by"),
	            options: [
	                {value:-2, label:'100'},
	                {value:-3, label:'1000'},
	                {value:-6, label:'1 million'},
	                {value:-9, label:'1 billion'},
	                {value:-12, label:'1 trillion'}
	            ]
	        }],
	        numberFormats: [{
	            label: __("Decimal places"),
	            options: [
	                {value:'n3', label: '3 (1,234.568)'},
	                {value:'n2', label: '2 (1,234.57)'},
	                {value:'n1', label: '1 (1,234.6)'},
	                {value:'n0', label: '0 (1,235)'},
	            ]
	        }, {
	            label: __("Significant digits"),
	            options: [
	                {value:'s6', label:'6 (1,234.57)'},
	                {value:'s5', label:'5 (123.45)'},
	                {value:'s4', label:'4 (12.34)'},
	                {value:'s3', label:'3 (1.23)'},
	                {value:'s2', label:'2 (0.12)'},
	                {value:'s1', label:'1 (0.01)'},
	            ]
	        }]
	    }
	}
	var methods$1 = {
	    autoDivisor() {
	        const chart = this.store.get('dw_chart');
	        const {column} = this.get();
	        const mtrSuf = dw.utils.metricSuffix(chart.locale());
	        const values = column.values();
	        const dim = dw.utils.significantDimension(values);
	        let div = dim < -2 ? (Math.round((dim*-1) / 3) * 3) :
	                    (dim > 4 ? dim*-1 : 0);
	        const nvalues = values.map(function(v) {
	            return v / Math.pow(10, div);
	        });
	        let ndim = dw.utils.significantDimension(nvalues);
	        if (ndim <= 0) ndim = nvalues.reduce(function(acc, cur) {
	            return Math.max(acc, Math.min(3,dw.utils.tailLength(cur)));
	        }, 0);

	        if (ndim == div) {
	            div = 0;
	            ndim = 0;
	        }
	        if (div > 15) {
	            div = 0;
	            ndim = 0;
	        }

	        this.set({
	            columnFormat: {
	                'number-divisor': div,
	                'number-format': 'n'+Math.max(0, ndim),
	                'number-prepend': '',
	                'number-append': (div ? mtrSuf[div] || ' × 10<sup>'+div+'</sup>' : '')
	            }
	        });
	    },
	    getColumnFormat(column) {
	        const chart = this.store.get('dw_chart');
	        const columnFormats = arrayToObject(chart.get('metadata.data.column-format', {}));
	        let columnFormat = clone(columnFormats[column.name()]);
	        if (!columnFormat || columnFormat == 'auto' || columnFormat.length !== undefined) {
	            // no valid column format
	            columnFormat = {
	                type: 'auto',
	                ignore: false,
	                'number-prepend': '',
	                'number-append': '',
	                'number-format': 'auto'
	            };
	        }
	        return columnFormat;
	    }
	};

	function oncreate$1() {
	    const updateTable = _throttle(() => { this.fire('updateTable'); },100, {leading: false});
	    const renderTable = _throttle(() => { this.fire('updateTable'); }, 100, {leading: false});

	    const {column} = this.get();

	    this.set({colTypes: [
	        { value:'auto', label: 'auto ('+column.type()+')' },
	        { value:'text', label: 'Text' },
	        { value:'number', label: 'Number' },
	        { value:'date', label: 'Date' },
	    ]});

	    this.set({columnFormat: this.getColumnFormat(column)});

	    this.observe('column', (col) => {
	        this.set({columnFormat: this.getColumnFormat(col)});
	        const {colTypes} = this.get();
	        colTypes[0].label = 'auto ('+column.type()+')';
	    });

	    this.observe('columnFormat', (colFormat) => {
	        const chrt = this.store.get('dw_chart');
	        const {column} = this.get();
	        const columnFormats = arrayToObject(chrt.get('metadata.data.column-format', {}));
	        const oldFormat = columnFormats[column.name()];
	        if (!oldFormat || JSON.stringify(oldFormat) != JSON.stringify(colFormat)) {
	            if (colFormat['number-divisor'] == 'auto') {
	                // stop here and compute divisor automatically
	                setTimeout(() => this.autoDivisor(), 100);
	                return;
	            }
	            columnFormats[column.name()] = clone(colFormat);
	            chrt.set('metadata.data.column-format', columnFormats);
	            if (chrt.saveSoon) chrt.saveSoon();
	            if (!oldFormat || oldFormat.type != colFormat.type) updateTable();
	            else renderTable();
	        }
	    });
	}
	function create_main_fragment$3(component, state) {
		var div, h3, text, text_1, div_1, select_updating = {}, text_2, checkbox_updating = {}, text_3, hr, text_4;

		var select_initial_data = {
		 	label: __("Column type"),
		 	options: state.colTypes,
		 	width: "180px"
		 };
		if ('type' in state.columnFormat) {
			select_initial_data.value = state.columnFormat.type;
			select_updating.value = true;
		}
		var select = new Select({
			root: component.root,
			data: select_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!select_updating.value && changed.value) {
					state.columnFormat.type = childState.value;
					newState.columnFormat = state.columnFormat;
				}
				component._set(newState);
				select_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			select._bind({ value: 1 }, select.get());
		});

		var checkbox_initial_data = { label: __("Hide column from visualization") };
		if ('ignore' in state.columnFormat) {
			checkbox_initial_data.value = state.columnFormat.ignore;
			checkbox_updating.value = true;
		}
		var checkbox = new Checkbox({
			root: component.root,
			data: checkbox_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!checkbox_updating.value && changed.value) {
					state.columnFormat.ignore = childState.value;
					newState.columnFormat = state.columnFormat;
				}
				component._set(newState);
				checkbox_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			checkbox._bind({ value: 1 }, checkbox.get());
		});

		var if_block = (state.column && state.column.type() == 'number') && create_if_block$1(component, state);

		return {
			c: function create() {
				div = createElement("div");
				h3 = createElement("h3");
				text = createText(state.title);
				text_1 = createText("\n\n    ");
				div_1 = createElement("div");
				select._fragment.c();
				text_2 = createText("\n\n        ");
				checkbox._fragment.c();
				text_3 = createText("\n\n        ");
				hr = createElement("hr");
				text_4 = createText("\n\n        ");
				if (if_block) if_block.c();
				this.h();
			},

			h: function hydrate() {
				h3.className = "first";
				div_1.className = "form-horizontal";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(h3, div);
				appendNode(text, h3);
				appendNode(text_1, div);
				appendNode(div_1, div);
				select._mount(div_1, null);
				appendNode(text_2, div_1);
				checkbox._mount(div_1, null);
				appendNode(text_3, div_1);
				appendNode(hr, div_1);
				appendNode(text_4, div_1);
				if (if_block) if_block.m(div_1, null);
			},

			p: function update(changed, state) {
				if (changed.title) {
					text.data = state.title;
				}

				var select_changes = {};
				select_changes.label = __("Column type");
				if (changed.colTypes) select_changes.options = state.colTypes;
				if (!select_updating.value && changed.columnFormat) {
					select_changes.value = state.columnFormat.type;
					select_updating.value = true;
				}
				select._set(select_changes);
				select_updating = {};

				var checkbox_changes = {};
				checkbox_changes.label = __("Hide column from visualization");
				if (!checkbox_updating.value && changed.columnFormat) {
					checkbox_changes.value = state.columnFormat.ignore;
					checkbox_updating.value = true;
				}
				checkbox._set(checkbox_changes);
				checkbox_updating = {};

				if (state.column && state.column.type() == 'number') {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$1(component, state);
						if_block.c();
						if_block.m(div_1, null);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}
			},

			u: function unmount() {
				detachNode(div);
				if (if_block) if_block.u();
			},

			d: function destroy$$1() {
				select.destroy(false);
				checkbox.destroy(false);
				if (if_block) if_block.d();
			}
		};
	}

	// (19:8) {#if column && column.type() == 'number'}
	function create_if_block$1(component, state) {
		var select_updating = {}, text, select_1_updating = {}, text_1, div, label, text_2_value = __("Prepend/Append"), text_2, text_4, div_1, input, input_updating = false, text_5, input_1, input_1_updating = false;

		var select_initial_data = {
		 	label: __("Round numbers to"),
		 	options: [
	                {value:'-',label: __("describe / column-format / individual")},
	                {value:'auto',label: __("describe / column-format / auto-detect") }],
		 	optgroups: state.numberFormats,
		 	width: "180px"
		 };
		if ('number-format' in state.columnFormat) {
			select_initial_data.value = state.columnFormat['number-format'];
			select_updating.value = true;
		}
		var select = new Select({
			root: component.root,
			data: select_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!select_updating.value && changed.value) {
					state.columnFormat['number-format'] = childState.value;
					newState.columnFormat = state.columnFormat;
				}
				component._set(newState);
				select_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			select._bind({ value: 1 }, select.get());
		});

		var select_1_initial_data = {
		 	label: __("Divide numbers by"),
		 	options: state.divisors_opts,
		 	optgroups: state.divisors,
		 	width: "180px"
		 };
		if ('number-divisor' in state.columnFormat) {
			select_1_initial_data.value = state.columnFormat['number-divisor'];
			select_1_updating.value = true;
		}
		var select_1 = new Select({
			root: component.root,
			data: select_1_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!select_1_updating.value && changed.value) {
					state.columnFormat['number-divisor'] = childState.value;
					newState.columnFormat = state.columnFormat;
				}
				component._set(newState);
				select_1_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			select_1._bind({ value: 1 }, select_1.get());
		});

		function input_input_handler() {
			var state = component.get();
			input_updating = true;
			state.columnFormat['number-prepend'] = input.value;
			component.set({ columnFormat: state.columnFormat });
			input_updating = false;
		}

		function input_1_input_handler() {
			var state = component.get();
			input_1_updating = true;
			state.columnFormat['number-append'] = input_1.value;
			component.set({ columnFormat: state.columnFormat });
			input_1_updating = false;
		}

		return {
			c: function create() {
				select._fragment.c();
				text = createText("\n        ");
				select_1._fragment.c();
				text_1 = createText("\n\n        ");
				div = createElement("div");
				label = createElement("label");
				text_2 = createText(text_2_value);
				text_4 = createText("\n            ");
				div_1 = createElement("div");
				input = createElement("input");
				text_5 = createText("\n                #\n                ");
				input_1 = createElement("input");
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label";
				addListener(input, "input", input_input_handler);
				input.autocomplete = "screw-you-google-chrome";
				setStyle(input, "width", "6ex");
				setStyle(input, "text-align", "right");
				input.dataset.lpignore = "true";
				input.name = "prepend";
				setAttribute(input, "type", "text");
				addListener(input_1, "input", input_1_input_handler);
				input_1.autocomplete = "screw-you-google-chrome";
				setStyle(input_1, "width", "6ex");
				input_1.dataset.lpignore = "true";
				input_1.name = "append";
				setAttribute(input_1, "type", "text");
				div_1.className = "controls form-inline";
				div.className = "control-group vis-option-type-select";
			},

			m: function mount(target, anchor) {
				select._mount(target, anchor);
				insertNode(text, target, anchor);
				select_1._mount(target, anchor);
				insertNode(text_1, target, anchor);
				insertNode(div, target, anchor);
				appendNode(label, div);
				appendNode(text_2, label);
				appendNode(text_4, div);
				appendNode(div_1, div);
				appendNode(input, div_1);

				input.value = state.columnFormat['number-prepend'];

				appendNode(text_5, div_1);
				appendNode(input_1, div_1);

				input_1.value = state.columnFormat['number-append'];
			},

			p: function update(changed, state) {
				var select_changes = {};
				select_changes.label = __("Round numbers to");
				select_changes.options = [
	                {value:'-',label: __("describe / column-format / individual")},
	                {value:'auto',label: __("describe / column-format / auto-detect") }];
				if (changed.numberFormats) select_changes.optgroups = state.numberFormats;
				if (!select_updating.value && changed.columnFormat) {
					select_changes.value = state.columnFormat['number-format'];
					select_updating.value = true;
				}
				select._set(select_changes);
				select_updating = {};

				var select_1_changes = {};
				select_1_changes.label = __("Divide numbers by");
				if (changed.divisors_opts) select_1_changes.options = state.divisors_opts;
				if (changed.divisors) select_1_changes.optgroups = state.divisors;
				if (!select_1_updating.value && changed.columnFormat) {
					select_1_changes.value = state.columnFormat['number-divisor'];
					select_1_updating.value = true;
				}
				select_1._set(select_1_changes);
				select_1_updating = {};

				if (!input_updating) input.value = state.columnFormat['number-prepend'];
				if (!input_1_updating) input_1.value = state.columnFormat['number-append'];
			},

			u: function unmount() {
				select._unmount();
				detachNode(text);
				select_1._unmount();
				detachNode(text_1);
				detachNode(div);
			},

			d: function destroy$$1() {
				select.destroy(false);
				select_1.destroy(false);
				removeListener(input, "input", input_input_handler);
				removeListener(input_1, "input", input_1_input_handler);
			}
		};
	}

	function CustomColumnFormat(options) {
		this._debugName = '<CustomColumnFormat>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(data$3(), options.data);
		this._recompute({ column: 1 }, this._state);
		if (!('column' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'column'");

		if (!('colTypes' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'colTypes'");
		if (!('columnFormat' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'columnFormat'");
		if (!('numberFormats' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'numberFormats'");
		if (!('divisors_opts' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors_opts'");
		if (!('divisors' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors'");

		var self = this;
		var _oncreate = function() {
			var changed = { column: 1, title: 1, colTypes: 1, columnFormat: 1, numberFormats: 1, divisors_opts: 1, divisors: 1 };
			oncreate$1.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$3(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(CustomColumnFormat.prototype, protoDev);
	assign(CustomColumnFormat.prototype, methods$1);

	CustomColumnFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<CustomColumnFormat>: Cannot set read-only property 'title'");
	};

	CustomColumnFormat.prototype._recompute = function _recompute(changed, state) {
		if (changed.column) {
			if (this._differs(state.title, (state.title = title$1(state)))) changed.title = true;
		}
	};

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
		let length = Math.max(Math.ceil((stop - start) / step), 0);
		let range = Array(length);
		for (let idx = 0; idx < length; idx++, start += step) {
			range[idx] = start;
		}
		return range;
	}

	// `_countBy` : a collection's function

	// Counts instances of an object that group by a certain criterion. Pass
	// either a string attribute to count by, or a function that returns the
	// criterion.
	var _countBy = group( (result, value, key) => {
		if (_has(result, key)) result[key]++;
		else result[key] = 1;
	});

	function ascending(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function bisector(compare) {
	  if (compare.length === 1) compare = ascendingComparator(compare);
	  return {
	    left: function(a, x, lo, hi) {
	      if (lo == null) lo = 0;
	      if (hi == null) hi = a.length;
	      while (lo < hi) {
	        var mid = lo + hi >>> 1;
	        if (compare(a[mid], x) < 0) lo = mid + 1;
	        else hi = mid;
	      }
	      return lo;
	    },
	    right: function(a, x, lo, hi) {
	      if (lo == null) lo = 0;
	      if (hi == null) hi = a.length;
	      while (lo < hi) {
	        var mid = lo + hi >>> 1;
	        if (compare(a[mid], x) > 0) hi = mid;
	        else lo = mid + 1;
	      }
	      return lo;
	    }
	  };
	}

	function ascendingComparator(f) {
	  return function(d, x) {
	    return ascending(f(d), x);
	  };
	}

	var ascendingBisect = bisector(ascending);
	var bisectRight = ascendingBisect.right;

	function number(x) {
	  return x === null ? NaN : +x;
	}

	function extent(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null) {
	            if (min > value) min = value;
	            if (max < value) max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null) {
	            if (min > value) min = value;
	            if (max < value) max = value;
	          }
	        }
	      }
	    }
	  }

	  return [min, max];
	}

	var array = Array.prototype;

	var slice$1 = array.slice;

	function constant(x) {
	  return function() {
	    return x;
	  };
	}

	function identity(x) {
	  return x;
	}

	function sequence(start, stop, step) {
	  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

	  var i = -1,
	      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
	      range = new Array(n);

	  while (++i < n) {
	    range[i] = start + i * step;
	  }

	  return range;
	}

	var e10 = Math.sqrt(50),
	    e5 = Math.sqrt(10),
	    e2 = Math.sqrt(2);

	function ticks(start, stop, count) {
	  var reverse,
	      i = -1,
	      n,
	      ticks,
	      step;

	  stop = +stop, start = +start, count = +count;
	  if (start === stop && count > 0) return [start];
	  if (reverse = stop < start) n = start, start = stop, stop = n;
	  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

	  if (step > 0) {
	    start = Math.ceil(start / step);
	    stop = Math.floor(stop / step);
	    ticks = new Array(n = Math.ceil(stop - start + 1));
	    while (++i < n) ticks[i] = (start + i) * step;
	  } else {
	    start = Math.floor(start * step);
	    stop = Math.ceil(stop * step);
	    ticks = new Array(n = Math.ceil(start - stop + 1));
	    while (++i < n) ticks[i] = (start - i) / step;
	  }

	  if (reverse) ticks.reverse();

	  return ticks;
	}

	function tickIncrement(start, stop, count) {
	  var step = (stop - start) / Math.max(0, count),
	      power = Math.floor(Math.log(step) / Math.LN10),
	      error = step / Math.pow(10, power);
	  return power >= 0
	      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
	      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
	}

	function tickStep(start, stop, count) {
	  var step0 = Math.abs(stop - start) / Math.max(0, count),
	      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
	      error = step0 / step1;
	  if (error >= e10) step1 *= 10;
	  else if (error >= e5) step1 *= 5;
	  else if (error >= e2) step1 *= 2;
	  return stop < start ? -step1 : step1;
	}

	function sturges(values) {
	  return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
	}

	function histogram() {
	  var value = identity,
	      domain = extent,
	      threshold = sturges;

	  function histogram(data) {
	    var i,
	        n = data.length,
	        x,
	        values = new Array(n);

	    for (i = 0; i < n; ++i) {
	      values[i] = value(data[i], i, data);
	    }

	    var xz = domain(values),
	        x0 = xz[0],
	        x1 = xz[1],
	        tz = threshold(values, x0, x1);

	    // Convert number of thresholds into uniform thresholds.
	    if (!Array.isArray(tz)) {
	      tz = tickStep(x0, x1, tz);
	      tz = sequence(Math.ceil(x0 / tz) * tz, Math.floor(x1 / tz) * tz, tz); // exclusive
	    }

	    // Remove any thresholds outside the domain.
	    var m = tz.length;
	    while (tz[0] <= x0) tz.shift(), --m;
	    while (tz[m - 1] > x1) tz.pop(), --m;

	    var bins = new Array(m + 1),
	        bin;

	    // Initialize bins.
	    for (i = 0; i <= m; ++i) {
	      bin = bins[i] = [];
	      bin.x0 = i > 0 ? tz[i - 1] : x0;
	      bin.x1 = i < m ? tz[i] : x1;
	    }

	    // Assign data to bins by value, ignoring any outside the domain.
	    for (i = 0; i < n; ++i) {
	      x = values[i];
	      if (x0 <= x && x <= x1) {
	        bins[bisectRight(tz, x, 0, m)].push(data[i]);
	      }
	    }

	    return bins;
	  }

	  histogram.value = function(_) {
	    return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
	  };

	  histogram.domain = function(_) {
	    return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
	  };

	  histogram.thresholds = function(_) {
	    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice$1.call(_)) : constant(_), histogram) : threshold;
	  };

	  return histogram;
	}

	function threshold(values, p, valueof) {
	  if (valueof == null) valueof = number;
	  if (!(n = values.length)) return;
	  if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
	  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
	  var n,
	      i = (n - 1) * p,
	      i0 = Math.floor(i),
	      value0 = +valueof(values[i0], i0, values),
	      value1 = +valueof(values[i0 + 1], i0 + 1, values);
	  return value0 + (value1 - value0) * (i - i0);
	}

	function max(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  return max;
	}

	function mean(values, valueof) {
	  var n = values.length,
	      m = n,
	      i = -1,
	      value,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) sum += value;
	      else --m;
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) sum += value;
	      else --m;
	    }
	  }

	  if (m) return sum / m;
	}

	function median(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      numbers = [];

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) {
	        numbers.push(value);
	      }
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) {
	        numbers.push(value);
	      }
	    }
	  }

	  return threshold(numbers.sort(ascending), 0.5);
	}

	function min(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  return min;
	}

	var prefix = "$";

	function Map() {}

	Map.prototype = map$1.prototype = {
	  constructor: Map,
	  has: function(key) {
	    return (prefix + key) in this;
	  },
	  get: function(key) {
	    return this[prefix + key];
	  },
	  set: function(key, value) {
	    this[prefix + key] = value;
	    return this;
	  },
	  remove: function(key) {
	    var property = prefix + key;
	    return property in this && delete this[property];
	  },
	  clear: function() {
	    for (var property in this) if (property[0] === prefix) delete this[property];
	  },
	  keys: function() {
	    var keys = [];
	    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
	    return keys;
	  },
	  values: function() {
	    var values = [];
	    for (var property in this) if (property[0] === prefix) values.push(this[property]);
	    return values;
	  },
	  entries: function() {
	    var entries = [];
	    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
	    return entries;
	  },
	  size: function() {
	    var size = 0;
	    for (var property in this) if (property[0] === prefix) ++size;
	    return size;
	  },
	  empty: function() {
	    for (var property in this) if (property[0] === prefix) return false;
	    return true;
	  },
	  each: function(f) {
	    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
	  }
	};

	function map$1(object, f) {
	  var map = new Map;

	  // Copy constructor.
	  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

	  // Index array by numeric index or specified key function.
	  else if (Array.isArray(object)) {
	    var i = -1,
	        n = object.length,
	        o;

	    if (f == null) while (++i < n) map.set(i, object[i]);
	    else while (++i < n) map.set(f(o = object[i], i, object), o);
	  }

	  // Convert object to map.
	  else if (object) for (var key in object) map.set(key, object[key]);

	  return map;
	}

	function Set() {}

	var proto$1 = map$1.prototype;

	Set.prototype = set$1.prototype = {
	  constructor: Set,
	  has: proto$1.has,
	  add: function(value) {
	    value += "";
	    this[prefix + value] = value;
	    return this;
	  },
	  remove: proto$1.remove,
	  clear: proto$1.clear,
	  values: proto$1.keys,
	  size: proto$1.size,
	  empty: proto$1.empty,
	  each: proto$1.each
	};

	function set$1(object, f) {
	  var set = new Set;

	  // Copy constructor.
	  if (object instanceof Set) object.each(function(value) { set.add(value); });

	  // Otherwise, assume it’s an array.
	  else if (object) {
	    var i = -1, n = object.length;
	    if (f == null) while (++i < n) set.add(object[i]);
	    else while (++i < n) set.add(f(object[i], i, object));
	  }

	  return set;
	}

	var array$1 = Array.prototype;

	var map$2 = array$1.map;
	var slice$2 = array$1.slice;

	var implicit = {name: "implicit"};

	function ordinal(range) {
	  var index = map$1(),
	      domain = [],
	      unknown = implicit;

	  range = range == null ? [] : slice$2.call(range);

	  function scale(d) {
	    var key = d + "", i = index.get(key);
	    if (!i) {
	      if (unknown !== implicit) return unknown;
	      index.set(key, i = domain.push(d));
	    }
	    return range[(i - 1) % range.length];
	  }

	  scale.domain = function(_) {
	    if (!arguments.length) return domain.slice();
	    domain = [], index = map$1();
	    var i = -1, n = _.length, d, key;
	    while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
	    return scale;
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = slice$2.call(_), scale) : range.slice();
	  };

	  scale.unknown = function(_) {
	    return arguments.length ? (unknown = _, scale) : unknown;
	  };

	  scale.copy = function() {
	    return ordinal()
	        .domain(domain)
	        .range(range)
	        .unknown(unknown);
	  };

	  return scale;
	}

	function band() {
	  var scale = ordinal().unknown(undefined),
	      domain = scale.domain,
	      ordinalRange = scale.range,
	      range$$1 = [0, 1],
	      step,
	      bandwidth,
	      round = false,
	      paddingInner = 0,
	      paddingOuter = 0,
	      align = 0.5;

	  delete scale.unknown;

	  function rescale() {
	    var n = domain().length,
	        reverse = range$$1[1] < range$$1[0],
	        start = range$$1[reverse - 0],
	        stop = range$$1[1 - reverse];
	    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
	    if (round) step = Math.floor(step);
	    start += (stop - start - step * (n - paddingInner)) * align;
	    bandwidth = step * (1 - paddingInner);
	    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
	    var values = sequence(n).map(function(i) { return start + step * i; });
	    return ordinalRange(reverse ? values.reverse() : values);
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (domain(_), rescale()) : domain();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = [+_[0], +_[1]], rescale()) : range$$1.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range$$1 = [+_[0], +_[1]], round = true, rescale();
	  };

	  scale.bandwidth = function() {
	    return bandwidth;
	  };

	  scale.step = function() {
	    return step;
	  };

	  scale.round = function(_) {
	    return arguments.length ? (round = !!_, rescale()) : round;
	  };

	  scale.padding = function(_) {
	    return arguments.length ? (paddingInner = paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
	  };

	  scale.paddingInner = function(_) {
	    return arguments.length ? (paddingInner = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
	  };

	  scale.paddingOuter = function(_) {
	    return arguments.length ? (paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingOuter;
	  };

	  scale.align = function(_) {
	    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
	  };

	  scale.copy = function() {
	    return band()
	        .domain(domain())
	        .range(range$$1)
	        .round(round)
	        .paddingInner(paddingInner)
	        .paddingOuter(paddingOuter)
	        .align(align);
	  };

	  return rescale();
	}

	function define(constructor, factory, prototype) {
	  constructor.prototype = factory.prototype = prototype;
	  prototype.constructor = constructor;
	}

	function extend(parent, definition) {
	  var prototype = Object.create(parent.prototype);
	  for (var key in definition) prototype[key] = definition[key];
	  return prototype;
	}

	function Color() {}

	var darker = 0.7;
	var brighter = 1 / darker;

	var reI = "\\s*([+-]?\\d+)\\s*",
	    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
	    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
	    reHex3 = /^#([0-9a-f]{3})$/,
	    reHex6 = /^#([0-9a-f]{6})$/,
	    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
	    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
	    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
	    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
	    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
	    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

	var named = {
	  aliceblue: 0xf0f8ff,
	  antiquewhite: 0xfaebd7,
	  aqua: 0x00ffff,
	  aquamarine: 0x7fffd4,
	  azure: 0xf0ffff,
	  beige: 0xf5f5dc,
	  bisque: 0xffe4c4,
	  black: 0x000000,
	  blanchedalmond: 0xffebcd,
	  blue: 0x0000ff,
	  blueviolet: 0x8a2be2,
	  brown: 0xa52a2a,
	  burlywood: 0xdeb887,
	  cadetblue: 0x5f9ea0,
	  chartreuse: 0x7fff00,
	  chocolate: 0xd2691e,
	  coral: 0xff7f50,
	  cornflowerblue: 0x6495ed,
	  cornsilk: 0xfff8dc,
	  crimson: 0xdc143c,
	  cyan: 0x00ffff,
	  darkblue: 0x00008b,
	  darkcyan: 0x008b8b,
	  darkgoldenrod: 0xb8860b,
	  darkgray: 0xa9a9a9,
	  darkgreen: 0x006400,
	  darkgrey: 0xa9a9a9,
	  darkkhaki: 0xbdb76b,
	  darkmagenta: 0x8b008b,
	  darkolivegreen: 0x556b2f,
	  darkorange: 0xff8c00,
	  darkorchid: 0x9932cc,
	  darkred: 0x8b0000,
	  darksalmon: 0xe9967a,
	  darkseagreen: 0x8fbc8f,
	  darkslateblue: 0x483d8b,
	  darkslategray: 0x2f4f4f,
	  darkslategrey: 0x2f4f4f,
	  darkturquoise: 0x00ced1,
	  darkviolet: 0x9400d3,
	  deeppink: 0xff1493,
	  deepskyblue: 0x00bfff,
	  dimgray: 0x696969,
	  dimgrey: 0x696969,
	  dodgerblue: 0x1e90ff,
	  firebrick: 0xb22222,
	  floralwhite: 0xfffaf0,
	  forestgreen: 0x228b22,
	  fuchsia: 0xff00ff,
	  gainsboro: 0xdcdcdc,
	  ghostwhite: 0xf8f8ff,
	  gold: 0xffd700,
	  goldenrod: 0xdaa520,
	  gray: 0x808080,
	  green: 0x008000,
	  greenyellow: 0xadff2f,
	  grey: 0x808080,
	  honeydew: 0xf0fff0,
	  hotpink: 0xff69b4,
	  indianred: 0xcd5c5c,
	  indigo: 0x4b0082,
	  ivory: 0xfffff0,
	  khaki: 0xf0e68c,
	  lavender: 0xe6e6fa,
	  lavenderblush: 0xfff0f5,
	  lawngreen: 0x7cfc00,
	  lemonchiffon: 0xfffacd,
	  lightblue: 0xadd8e6,
	  lightcoral: 0xf08080,
	  lightcyan: 0xe0ffff,
	  lightgoldenrodyellow: 0xfafad2,
	  lightgray: 0xd3d3d3,
	  lightgreen: 0x90ee90,
	  lightgrey: 0xd3d3d3,
	  lightpink: 0xffb6c1,
	  lightsalmon: 0xffa07a,
	  lightseagreen: 0x20b2aa,
	  lightskyblue: 0x87cefa,
	  lightslategray: 0x778899,
	  lightslategrey: 0x778899,
	  lightsteelblue: 0xb0c4de,
	  lightyellow: 0xffffe0,
	  lime: 0x00ff00,
	  limegreen: 0x32cd32,
	  linen: 0xfaf0e6,
	  magenta: 0xff00ff,
	  maroon: 0x800000,
	  mediumaquamarine: 0x66cdaa,
	  mediumblue: 0x0000cd,
	  mediumorchid: 0xba55d3,
	  mediumpurple: 0x9370db,
	  mediumseagreen: 0x3cb371,
	  mediumslateblue: 0x7b68ee,
	  mediumspringgreen: 0x00fa9a,
	  mediumturquoise: 0x48d1cc,
	  mediumvioletred: 0xc71585,
	  midnightblue: 0x191970,
	  mintcream: 0xf5fffa,
	  mistyrose: 0xffe4e1,
	  moccasin: 0xffe4b5,
	  navajowhite: 0xffdead,
	  navy: 0x000080,
	  oldlace: 0xfdf5e6,
	  olive: 0x808000,
	  olivedrab: 0x6b8e23,
	  orange: 0xffa500,
	  orangered: 0xff4500,
	  orchid: 0xda70d6,
	  palegoldenrod: 0xeee8aa,
	  palegreen: 0x98fb98,
	  paleturquoise: 0xafeeee,
	  palevioletred: 0xdb7093,
	  papayawhip: 0xffefd5,
	  peachpuff: 0xffdab9,
	  peru: 0xcd853f,
	  pink: 0xffc0cb,
	  plum: 0xdda0dd,
	  powderblue: 0xb0e0e6,
	  purple: 0x800080,
	  rebeccapurple: 0x663399,
	  red: 0xff0000,
	  rosybrown: 0xbc8f8f,
	  royalblue: 0x4169e1,
	  saddlebrown: 0x8b4513,
	  salmon: 0xfa8072,
	  sandybrown: 0xf4a460,
	  seagreen: 0x2e8b57,
	  seashell: 0xfff5ee,
	  sienna: 0xa0522d,
	  silver: 0xc0c0c0,
	  skyblue: 0x87ceeb,
	  slateblue: 0x6a5acd,
	  slategray: 0x708090,
	  slategrey: 0x708090,
	  snow: 0xfffafa,
	  springgreen: 0x00ff7f,
	  steelblue: 0x4682b4,
	  tan: 0xd2b48c,
	  teal: 0x008080,
	  thistle: 0xd8bfd8,
	  tomato: 0xff6347,
	  turquoise: 0x40e0d0,
	  violet: 0xee82ee,
	  wheat: 0xf5deb3,
	  white: 0xffffff,
	  whitesmoke: 0xf5f5f5,
	  yellow: 0xffff00,
	  yellowgreen: 0x9acd32
	};

	define(Color, color, {
	  displayable: function() {
	    return this.rgb().displayable();
	  },
	  toString: function() {
	    return this.rgb() + "";
	  }
	});

	function color(format) {
	  var m;
	  format = (format + "").trim().toLowerCase();
	  return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
	      : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
	      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
	      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
	      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
	      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
	      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
	      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
	      : named.hasOwnProperty(format) ? rgbn(named[format])
	      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
	      : null;
	}

	function rgbn(n) {
	  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
	}

	function rgba(r, g, b, a) {
	  if (a <= 0) r = g = b = NaN;
	  return new Rgb(r, g, b, a);
	}

	function rgbConvert(o) {
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Rgb;
	  o = o.rgb();
	  return new Rgb(o.r, o.g, o.b, o.opacity);
	}

	function rgb(r, g, b, opacity) {
	  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
	}

	function Rgb(r, g, b, opacity) {
	  this.r = +r;
	  this.g = +g;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Rgb, rgb, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  rgb: function() {
	    return this;
	  },
	  displayable: function() {
	    return (0 <= this.r && this.r <= 255)
	        && (0 <= this.g && this.g <= 255)
	        && (0 <= this.b && this.b <= 255)
	        && (0 <= this.opacity && this.opacity <= 1);
	  },
	  toString: function() {
	    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	    return (a === 1 ? "rgb(" : "rgba(")
	        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
	        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
	        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
	        + (a === 1 ? ")" : ", " + a + ")");
	  }
	}));

	function hsla(h, s, l, a) {
	  if (a <= 0) h = s = l = NaN;
	  else if (l <= 0 || l >= 1) h = s = NaN;
	  else if (s <= 0) h = NaN;
	  return new Hsl(h, s, l, a);
	}

	function hslConvert(o) {
	  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Hsl;
	  if (o instanceof Hsl) return o;
	  o = o.rgb();
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      min = Math.min(r, g, b),
	      max = Math.max(r, g, b),
	      h = NaN,
	      s = max - min,
	      l = (max + min) / 2;
	  if (s) {
	    if (r === max) h = (g - b) / s + (g < b) * 6;
	    else if (g === max) h = (b - r) / s + 2;
	    else h = (r - g) / s + 4;
	    s /= l < 0.5 ? max + min : 2 - max - min;
	    h *= 60;
	  } else {
	    s = l > 0 && l < 1 ? 0 : h;
	  }
	  return new Hsl(h, s, l, o.opacity);
	}

	function hsl(h, s, l, opacity) {
	  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
	}

	function Hsl(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Hsl, hsl, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = this.h % 360 + (this.h < 0) * 360,
	        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
	        l = this.l,
	        m2 = l + (l < 0.5 ? l : 1 - l) * s,
	        m1 = 2 * l - m2;
	    return new Rgb(
	      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
	      hsl2rgb(h, m1, m2),
	      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
	      this.opacity
	    );
	  },
	  displayable: function() {
	    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
	        && (0 <= this.l && this.l <= 1)
	        && (0 <= this.opacity && this.opacity <= 1);
	  }
	}));

	/* From FvD 13.37, CSS Color Module Level 3 */
	function hsl2rgb(h, m1, m2) {
	  return (h < 60 ? m1 + (m2 - m1) * h / 60
	      : h < 180 ? m2
	      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
	      : m1) * 255;
	}

	var deg2rad = Math.PI / 180;
	var rad2deg = 180 / Math.PI;

	var Kn = 18,
	    Xn = 0.950470, // D65 standard referent
	    Yn = 1,
	    Zn = 1.088830,
	    t0 = 4 / 29,
	    t1 = 6 / 29,
	    t2 = 3 * t1 * t1,
	    t3 = t1 * t1 * t1;

	function labConvert(o) {
	  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
	  if (o instanceof Hcl) {
	    var h = o.h * deg2rad;
	    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
	  }
	  if (!(o instanceof Rgb)) o = rgbConvert(o);
	  var b = rgb2xyz(o.r),
	      a = rgb2xyz(o.g),
	      l = rgb2xyz(o.b),
	      x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
	      y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
	      z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
	  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
	}

	function lab(l, a, b, opacity) {
	  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
	}

	function Lab(l, a, b, opacity) {
	  this.l = +l;
	  this.a = +a;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Lab, lab, extend(Color, {
	  brighter: function(k) {
	    return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
	  },
	  darker: function(k) {
	    return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
	  },
	  rgb: function() {
	    var y = (this.l + 16) / 116,
	        x = isNaN(this.a) ? y : y + this.a / 500,
	        z = isNaN(this.b) ? y : y - this.b / 200;
	    y = Yn * lab2xyz(y);
	    x = Xn * lab2xyz(x);
	    z = Zn * lab2xyz(z);
	    return new Rgb(
	      xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
	      xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
	      xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
	      this.opacity
	    );
	  }
	}));

	function xyz2lab(t) {
	  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
	}

	function lab2xyz(t) {
	  return t > t1 ? t * t * t : t2 * (t - t0);
	}

	function xyz2rgb(x) {
	  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
	}

	function rgb2xyz(x) {
	  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
	}

	function hclConvert(o) {
	  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
	  if (!(o instanceof Lab)) o = labConvert(o);
	  var h = Math.atan2(o.b, o.a) * rad2deg;
	  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
	}

	function hcl(h, c, l, opacity) {
	  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
	}

	function Hcl(h, c, l, opacity) {
	  this.h = +h;
	  this.c = +c;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Hcl, hcl, extend(Color, {
	  brighter: function(k) {
	    return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
	  },
	  darker: function(k) {
	    return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
	  },
	  rgb: function() {
	    return labConvert(this).rgb();
	  }
	}));

	var A = -0.14861,
	    B = +1.78277,
	    C = -0.29227,
	    D = -0.90649,
	    E = +1.97294,
	    ED = E * D,
	    EB = E * B,
	    BC_DA = B * C - D * A;

	function cubehelixConvert(o) {
	  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Rgb)) o = rgbConvert(o);
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
	      bl = b - l,
	      k = (E * (g - l) - C * bl) / D,
	      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
	      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
	  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
	}

	function cubehelix(h, s, l, opacity) {
	  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
	}

	function Cubehelix(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Cubehelix, cubehelix, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
	        l = +this.l,
	        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
	        cosh = Math.cos(h),
	        sinh = Math.sin(h);
	    return new Rgb(
	      255 * (l + a * (A * cosh + B * sinh)),
	      255 * (l + a * (C * cosh + D * sinh)),
	      255 * (l + a * (E * cosh)),
	      this.opacity
	    );
	  }
	}));

	function constant$1(x) {
	  return function() {
	    return x;
	  };
	}

	function linear$1(a, d) {
	  return function(t) {
	    return a + t * d;
	  };
	}

	function exponential(a, b, y) {
	  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
	    return Math.pow(a + t * b, y);
	  };
	}

	function gamma(y) {
	  return (y = +y) === 1 ? nogamma : function(a, b) {
	    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
	  };
	}

	function nogamma(a, b) {
	  var d = b - a;
	  return d ? linear$1(a, d) : constant$1(isNaN(a) ? b : a);
	}

	var rgb$1 = (function rgbGamma(y) {
	  var color$$1 = gamma(y);

	  function rgb$$1(start, end) {
	    var r = color$$1((start = rgb(start)).r, (end = rgb(end)).r),
	        g = color$$1(start.g, end.g),
	        b = color$$1(start.b, end.b),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.r = r(t);
	      start.g = g(t);
	      start.b = b(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }

	  rgb$$1.gamma = rgbGamma;

	  return rgb$$1;
	})(1);

	function array$2(a, b) {
	  var nb = b ? b.length : 0,
	      na = a ? Math.min(nb, a.length) : 0,
	      x = new Array(na),
	      c = new Array(nb),
	      i;

	  for (i = 0; i < na; ++i) x[i] = value(a[i], b[i]);
	  for (; i < nb; ++i) c[i] = b[i];

	  return function(t) {
	    for (i = 0; i < na; ++i) c[i] = x[i](t);
	    return c;
	  };
	}

	function date(a, b) {
	  var d = new Date;
	  return a = +a, b -= a, function(t) {
	    return d.setTime(a + b * t), d;
	  };
	}

	function number$1(a, b) {
	  return a = +a, b -= a, function(t) {
	    return a + b * t;
	  };
	}

	function object(a, b) {
	  var i = {},
	      c = {},
	      k;

	  if (a === null || typeof a !== "object") a = {};
	  if (b === null || typeof b !== "object") b = {};

	  for (k in b) {
	    if (k in a) {
	      i[k] = value(a[k], b[k]);
	    } else {
	      c[k] = b[k];
	    }
	  }

	  return function(t) {
	    for (k in i) c[k] = i[k](t);
	    return c;
	  };
	}

	var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
	    reB = new RegExp(reA.source, "g");

	function zero(b) {
	  return function() {
	    return b;
	  };
	}

	function one(b) {
	  return function(t) {
	    return b(t) + "";
	  };
	}

	function string(a, b) {
	  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
	      am, // current match in a
	      bm, // current match in b
	      bs, // string preceding current number in b, if any
	      i = -1, // index in s
	      s = [], // string constants and placeholders
	      q = []; // number interpolators

	  // Coerce inputs to strings.
	  a = a + "", b = b + "";

	  // Interpolate pairs of numbers in a & b.
	  while ((am = reA.exec(a))
	      && (bm = reB.exec(b))) {
	    if ((bs = bm.index) > bi) { // a string precedes the next number in b
	      bs = b.slice(bi, bs);
	      if (s[i]) s[i] += bs; // coalesce with previous string
	      else s[++i] = bs;
	    }
	    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
	      if (s[i]) s[i] += bm; // coalesce with previous string
	      else s[++i] = bm;
	    } else { // interpolate non-matching numbers
	      s[++i] = null;
	      q.push({i: i, x: number$1(am, bm)});
	    }
	    bi = reB.lastIndex;
	  }

	  // Add remains of b.
	  if (bi < b.length) {
	    bs = b.slice(bi);
	    if (s[i]) s[i] += bs; // coalesce with previous string
	    else s[++i] = bs;
	  }

	  // Special optimization for only a single match.
	  // Otherwise, interpolate each of the numbers and rejoin the string.
	  return s.length < 2 ? (q[0]
	      ? one(q[0].x)
	      : zero(b))
	      : (b = q.length, function(t) {
	          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	          return s.join("");
	        });
	}

	function value(a, b) {
	  var t = typeof b, c;
	  return b == null || t === "boolean" ? constant$1(b)
	      : (t === "number" ? number$1
	      : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
	      : b instanceof color ? rgb$1
	      : b instanceof Date ? date
	      : Array.isArray(b) ? array$2
	      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
	      : number$1)(a, b);
	}

	function interpolateRound(a, b) {
	  return a = +a, b -= a, function(t) {
	    return Math.round(a + b * t);
	  };
	}

	var degrees = 180 / Math.PI;

	var rho = Math.SQRT2;

	function constant$2(x) {
	  return function() {
	    return x;
	  };
	}

	function number$2(x) {
	  return +x;
	}

	var unit = [0, 1];

	function deinterpolateLinear(a, b) {
	  return (b -= (a = +a))
	      ? function(x) { return (x - a) / b; }
	      : constant$2(b);
	}

	function deinterpolateClamp(deinterpolate) {
	  return function(a, b) {
	    var d = deinterpolate(a = +a, b = +b);
	    return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
	  };
	}

	function reinterpolateClamp(reinterpolate) {
	  return function(a, b) {
	    var r = reinterpolate(a = +a, b = +b);
	    return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
	  };
	}

	function bimap(domain, range, deinterpolate, reinterpolate) {
	  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
	  if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
	  else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
	  return function(x) { return r0(d0(x)); };
	}

	function polymap(domain, range, deinterpolate, reinterpolate) {
	  var j = Math.min(domain.length, range.length) - 1,
	      d = new Array(j),
	      r = new Array(j),
	      i = -1;

	  // Reverse descending domains.
	  if (domain[j] < domain[0]) {
	    domain = domain.slice().reverse();
	    range = range.slice().reverse();
	  }

	  while (++i < j) {
	    d[i] = deinterpolate(domain[i], domain[i + 1]);
	    r[i] = reinterpolate(range[i], range[i + 1]);
	  }

	  return function(x) {
	    var i = bisectRight(domain, x, 1, j) - 1;
	    return r[i](d[i](x));
	  };
	}

	function copy(source, target) {
	  return target
	      .domain(source.domain())
	      .range(source.range())
	      .interpolate(source.interpolate())
	      .clamp(source.clamp());
	}

	// deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
	// reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
	function continuous(deinterpolate, reinterpolate) {
	  var domain = unit,
	      range = unit,
	      interpolate$$1 = value,
	      clamp = false,
	      piecewise,
	      output,
	      input;

	  function rescale() {
	    piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
	    output = input = null;
	    return scale;
	  }

	  function scale(x) {
	    return (output || (output = piecewise(domain, range, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate$$1)))(+x);
	  }

	  scale.invert = function(y) {
	    return (input || (input = piecewise(range, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
	  };

	  scale.domain = function(_) {
	    return arguments.length ? (domain = map$2.call(_, number$2), rescale()) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = slice$2.call(_), rescale()) : range.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range = slice$2.call(_), interpolate$$1 = interpolateRound, rescale();
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = !!_, rescale()) : clamp;
	  };

	  scale.interpolate = function(_) {
	    return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
	  };

	  return rescale();
	}

	// Computes the decimal coefficient and exponent of the specified number x with
	// significant digits p, where x is positive and p is in [1, 21] or undefined.
	// For example, formatDecimal(1.23) returns ["123", 0].
	function formatDecimal(x, p) {
	  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
	  var i, coefficient = x.slice(0, i);

	  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
	  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
	  return [
	    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
	    +x.slice(i + 1)
	  ];
	}

	function exponent(x) {
	  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
	}

	function formatGroup(grouping, thousands) {
	  return function(value, width) {
	    var i = value.length,
	        t = [],
	        j = 0,
	        g = grouping[0],
	        length = 0;

	    while (i > 0 && g > 0) {
	      if (length + g + 1 > width) g = Math.max(1, width - length);
	      t.push(value.substring(i -= g, i + g));
	      if ((length += g + 1) > width) break;
	      g = grouping[j = (j + 1) % grouping.length];
	    }

	    return t.reverse().join(thousands);
	  };
	}

	function formatNumerals(numerals) {
	  return function(value) {
	    return value.replace(/[0-9]/g, function(i) {
	      return numerals[+i];
	    });
	  };
	}

	function formatDefault(x, p) {
	  x = x.toPrecision(p);

	  out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
	    switch (x[i]) {
	      case ".": i0 = i1 = i; break;
	      case "0": if (i0 === 0) i0 = i; i1 = i; break;
	      case "e": break out;
	      default: if (i0 > 0) i0 = 0; break;
	    }
	  }

	  return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
	}

	var prefixExponent;

	function formatPrefixAuto(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1],
	      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
	      n = coefficient.length;
	  return i === n ? coefficient
	      : i > n ? coefficient + new Array(i - n + 1).join("0")
	      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
	      : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
	}

	function formatRounded(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1];
	  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
	      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
	      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
	}

	var formatTypes = {
	  "": formatDefault,
	  "%": function(x, p) { return (x * 100).toFixed(p); },
	  "b": function(x) { return Math.round(x).toString(2); },
	  "c": function(x) { return x + ""; },
	  "d": function(x) { return Math.round(x).toString(10); },
	  "e": function(x, p) { return x.toExponential(p); },
	  "f": function(x, p) { return x.toFixed(p); },
	  "g": function(x, p) { return x.toPrecision(p); },
	  "o": function(x) { return Math.round(x).toString(8); },
	  "p": function(x, p) { return formatRounded(x * 100, p); },
	  "r": formatRounded,
	  "s": formatPrefixAuto,
	  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
	  "x": function(x) { return Math.round(x).toString(16); }
	};

	// [[fill]align][sign][symbol][0][width][,][.precision][type]
	var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

	function formatSpecifier(specifier) {
	  return new FormatSpecifier(specifier);
	}

	formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

	function FormatSpecifier(specifier) {
	  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

	  var match,
	      fill = match[1] || " ",
	      align = match[2] || ">",
	      sign = match[3] || "-",
	      symbol = match[4] || "",
	      zero = !!match[5],
	      width = match[6] && +match[6],
	      comma = !!match[7],
	      precision = match[8] && +match[8].slice(1),
	      type = match[9] || "";

	  // The "n" type is an alias for ",g".
	  if (type === "n") comma = true, type = "g";

	  // Map invalid types to the default format.
	  else if (!formatTypes[type]) type = "";

	  // If zero fill is specified, padding goes after sign and before digits.
	  if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

	  this.fill = fill;
	  this.align = align;
	  this.sign = sign;
	  this.symbol = symbol;
	  this.zero = zero;
	  this.width = width;
	  this.comma = comma;
	  this.precision = precision;
	  this.type = type;
	}

	FormatSpecifier.prototype.toString = function() {
	  return this.fill
	      + this.align
	      + this.sign
	      + this.symbol
	      + (this.zero ? "0" : "")
	      + (this.width == null ? "" : Math.max(1, this.width | 0))
	      + (this.comma ? "," : "")
	      + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
	      + this.type;
	};

	function identity$2(x) {
	  return x;
	}

	var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

	function formatLocale(locale) {
	  var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity$2,
	      currency = locale.currency,
	      decimal = locale.decimal,
	      numerals = locale.numerals ? formatNumerals(locale.numerals) : identity$2,
	      percent = locale.percent || "%";

	  function newFormat(specifier) {
	    specifier = formatSpecifier(specifier);

	    var fill = specifier.fill,
	        align = specifier.align,
	        sign = specifier.sign,
	        symbol = specifier.symbol,
	        zero = specifier.zero,
	        width = specifier.width,
	        comma = specifier.comma,
	        precision = specifier.precision,
	        type = specifier.type;

	    // Compute the prefix and suffix.
	    // For SI-prefix, the suffix is lazily computed.
	    var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
	        suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? percent : "";

	    // What format function should we use?
	    // Is this an integer type?
	    // Can this type generate exponential notation?
	    var formatType = formatTypes[type],
	        maybeSuffix = !type || /[defgprs%]/.test(type);

	    // Set the default precision if not specified,
	    // or clamp the specified precision to the supported range.
	    // For significant precision, it must be in [1, 21].
	    // For fixed precision, it must be in [0, 20].
	    precision = precision == null ? (type ? 6 : 12)
	        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
	        : Math.max(0, Math.min(20, precision));

	    function format(value) {
	      var valuePrefix = prefix,
	          valueSuffix = suffix,
	          i, n, c;

	      if (type === "c") {
	        valueSuffix = formatType(value) + valueSuffix;
	        value = "";
	      } else {
	        value = +value;

	        // Perform the initial formatting.
	        var valueNegative = value < 0;
	        value = formatType(Math.abs(value), precision);

	        // If a negative value rounds to zero during formatting, treat as positive.
	        if (valueNegative && +value === 0) valueNegative = false;

	        // Compute the prefix and suffix.
	        valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
	        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

	        // Break the formatted value into the integer “value” part that can be
	        // grouped, and fractional or exponential “suffix” part that is not.
	        if (maybeSuffix) {
	          i = -1, n = value.length;
	          while (++i < n) {
	            if (c = value.charCodeAt(i), 48 > c || c > 57) {
	              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
	              value = value.slice(0, i);
	              break;
	            }
	          }
	        }
	      }

	      // If the fill character is not "0", grouping is applied before padding.
	      if (comma && !zero) value = group(value, Infinity);

	      // Compute the padding.
	      var length = valuePrefix.length + value.length + valueSuffix.length,
	          padding = length < width ? new Array(width - length + 1).join(fill) : "";

	      // If the fill character is "0", grouping is applied after padding.
	      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

	      // Reconstruct the final output based on the desired alignment.
	      switch (align) {
	        case "<": value = valuePrefix + value + valueSuffix + padding; break;
	        case "=": value = valuePrefix + padding + value + valueSuffix; break;
	        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
	        default: value = padding + valuePrefix + value + valueSuffix; break;
	      }

	      return numerals(value);
	    }

	    format.toString = function() {
	      return specifier + "";
	    };

	    return format;
	  }

	  function formatPrefix(specifier, value) {
	    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
	        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
	        k = Math.pow(10, -e),
	        prefix = prefixes[8 + e / 3];
	    return function(value) {
	      return f(k * value) + prefix;
	    };
	  }

	  return {
	    format: newFormat,
	    formatPrefix: formatPrefix
	  };
	}

	var locale;
	var format;
	var formatPrefix;

	defaultLocale({
	  decimal: ".",
	  thousands: ",",
	  grouping: [3],
	  currency: ["$", ""]
	});

	function defaultLocale(definition) {
	  locale = formatLocale(definition);
	  format = locale.format;
	  formatPrefix = locale.formatPrefix;
	  return locale;
	}

	function precisionFixed(step) {
	  return Math.max(0, -exponent(Math.abs(step)));
	}

	function precisionPrefix(step, value) {
	  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
	}

	function precisionRound(step, max) {
	  step = Math.abs(step), max = Math.abs(max) - step;
	  return Math.max(0, exponent(max) - exponent(step)) + 1;
	}

	function tickFormat(domain, count, specifier) {
	  var start = domain[0],
	      stop = domain[domain.length - 1],
	      step = tickStep(start, stop, count == null ? 10 : count),
	      precision;
	  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
	  switch (specifier.type) {
	    case "s": {
	      var value = Math.max(Math.abs(start), Math.abs(stop));
	      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
	      return formatPrefix(specifier, value);
	    }
	    case "":
	    case "e":
	    case "g":
	    case "p":
	    case "r": {
	      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
	      break;
	    }
	    case "f":
	    case "%": {
	      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
	      break;
	    }
	  }
	  return format(specifier);
	}

	function linearish(scale) {
	  var domain = scale.domain;

	  scale.ticks = function(count) {
	    var d = domain();
	    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
	  };

	  scale.tickFormat = function(count, specifier) {
	    return tickFormat(domain(), count, specifier);
	  };

	  scale.nice = function(count) {
	    if (count == null) count = 10;

	    var d = domain(),
	        i0 = 0,
	        i1 = d.length - 1,
	        start = d[i0],
	        stop = d[i1],
	        step;

	    if (stop < start) {
	      step = start, start = stop, stop = step;
	      step = i0, i0 = i1, i1 = step;
	    }

	    step = tickIncrement(start, stop, count);

	    if (step > 0) {
	      start = Math.floor(start / step) * step;
	      stop = Math.ceil(stop / step) * step;
	      step = tickIncrement(start, stop, count);
	    } else if (step < 0) {
	      start = Math.ceil(start * step) / step;
	      stop = Math.floor(stop * step) / step;
	      step = tickIncrement(start, stop, count);
	    }

	    if (step > 0) {
	      d[i0] = Math.floor(start / step) * step;
	      d[i1] = Math.ceil(stop / step) * step;
	      domain(d);
	    } else if (step < 0) {
	      d[i0] = Math.ceil(start * step) / step;
	      d[i1] = Math.floor(stop * step) / step;
	      domain(d);
	    }

	    return scale;
	  };

	  return scale;
	}

	function linear$2() {
	  var scale = continuous(deinterpolateLinear, number$1);

	  scale.copy = function() {
	    return copy(scale, linear$2());
	  };

	  return linearish(scale);
	}

	var t0$1 = new Date,
	    t1$1 = new Date;

	function newInterval(floori, offseti, count, field) {

	  function interval(date) {
	    return floori(date = new Date(+date)), date;
	  }

	  interval.floor = interval;

	  interval.ceil = function(date) {
	    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
	  };

	  interval.round = function(date) {
	    var d0 = interval(date),
	        d1 = interval.ceil(date);
	    return date - d0 < d1 - date ? d0 : d1;
	  };

	  interval.offset = function(date, step) {
	    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
	  };

	  interval.range = function(start, stop, step) {
	    var range = [], previous;
	    start = interval.ceil(start);
	    step = step == null ? 1 : Math.floor(step);
	    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
	    do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
	    while (previous < start && start < stop);
	    return range;
	  };

	  interval.filter = function(test) {
	    return newInterval(function(date) {
	      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
	    }, function(date, step) {
	      if (date >= date) {
	        if (step < 0) while (++step <= 0) {
	          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
	        } else while (--step >= 0) {
	          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
	        }
	      }
	    });
	  };

	  if (count) {
	    interval.count = function(start, end) {
	      t0$1.setTime(+start), t1$1.setTime(+end);
	      floori(t0$1), floori(t1$1);
	      return Math.floor(count(t0$1, t1$1));
	    };

	    interval.every = function(step) {
	      step = Math.floor(step);
	      return !isFinite(step) || !(step > 0) ? null
	          : !(step > 1) ? interval
	          : interval.filter(field
	              ? function(d) { return field(d) % step === 0; }
	              : function(d) { return interval.count(0, d) % step === 0; });
	    };
	  }

	  return interval;
	}

	var millisecond = newInterval(function() {
	  // noop
	}, function(date, step) {
	  date.setTime(+date + step);
	}, function(start, end) {
	  return end - start;
	});

	// An optimized implementation for this simple case.
	millisecond.every = function(k) {
	  k = Math.floor(k);
	  if (!isFinite(k) || !(k > 0)) return null;
	  if (!(k > 1)) return millisecond;
	  return newInterval(function(date) {
	    date.setTime(Math.floor(date / k) * k);
	  }, function(date, step) {
	    date.setTime(+date + step * k);
	  }, function(start, end) {
	    return (end - start) / k;
	  });
	};

	var durationSecond = 1e3;
	var durationMinute = 6e4;
	var durationHour = 36e5;
	var durationDay = 864e5;
	var durationWeek = 6048e5;

	var second = newInterval(function(date) {
	  date.setTime(Math.floor(date / durationSecond) * durationSecond);
	}, function(date, step) {
	  date.setTime(+date + step * durationSecond);
	}, function(start, end) {
	  return (end - start) / durationSecond;
	}, function(date) {
	  return date.getUTCSeconds();
	});

	var minute = newInterval(function(date) {
	  date.setTime(Math.floor(date / durationMinute) * durationMinute);
	}, function(date, step) {
	  date.setTime(+date + step * durationMinute);
	}, function(start, end) {
	  return (end - start) / durationMinute;
	}, function(date) {
	  return date.getMinutes();
	});

	var hour = newInterval(function(date) {
	  var offset = date.getTimezoneOffset() * durationMinute % durationHour;
	  if (offset < 0) offset += durationHour;
	  date.setTime(Math.floor((+date - offset) / durationHour) * durationHour + offset);
	}, function(date, step) {
	  date.setTime(+date + step * durationHour);
	}, function(start, end) {
	  return (end - start) / durationHour;
	}, function(date) {
	  return date.getHours();
	});

	var day = newInterval(function(date) {
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setDate(date.getDate() + step);
	}, function(start, end) {
	  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
	}, function(date) {
	  return date.getDate() - 1;
	});

	function weekday(i) {
	  return newInterval(function(date) {
	    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
	    date.setHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setDate(date.getDate() + step * 7);
	  }, function(start, end) {
	    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
	  });
	}

	var sunday = weekday(0);
	var monday = weekday(1);
	var tuesday = weekday(2);
	var wednesday = weekday(3);
	var thursday = weekday(4);
	var friday = weekday(5);
	var saturday = weekday(6);

	var month = newInterval(function(date) {
	  date.setDate(1);
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setMonth(date.getMonth() + step);
	}, function(start, end) {
	  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
	}, function(date) {
	  return date.getMonth();
	});

	var year = newInterval(function(date) {
	  date.setMonth(0, 1);
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setFullYear(date.getFullYear() + step);
	}, function(start, end) {
	  return end.getFullYear() - start.getFullYear();
	}, function(date) {
	  return date.getFullYear();
	});

	// An optimized implementation for this simple case.
	year.every = function(k) {
	  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
	    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
	    date.setMonth(0, 1);
	    date.setHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setFullYear(date.getFullYear() + step * k);
	  });
	};

	var utcMinute = newInterval(function(date) {
	  date.setUTCSeconds(0, 0);
	}, function(date, step) {
	  date.setTime(+date + step * durationMinute);
	}, function(start, end) {
	  return (end - start) / durationMinute;
	}, function(date) {
	  return date.getUTCMinutes();
	});

	var utcHour = newInterval(function(date) {
	  date.setUTCMinutes(0, 0, 0);
	}, function(date, step) {
	  date.setTime(+date + step * durationHour);
	}, function(start, end) {
	  return (end - start) / durationHour;
	}, function(date) {
	  return date.getUTCHours();
	});

	var utcDay = newInterval(function(date) {
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCDate(date.getUTCDate() + step);
	}, function(start, end) {
	  return (end - start) / durationDay;
	}, function(date) {
	  return date.getUTCDate() - 1;
	});

	function utcWeekday(i) {
	  return newInterval(function(date) {
	    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
	    date.setUTCHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setUTCDate(date.getUTCDate() + step * 7);
	  }, function(start, end) {
	    return (end - start) / durationWeek;
	  });
	}

	var utcSunday = utcWeekday(0);
	var utcMonday = utcWeekday(1);
	var utcTuesday = utcWeekday(2);
	var utcWednesday = utcWeekday(3);
	var utcThursday = utcWeekday(4);
	var utcFriday = utcWeekday(5);
	var utcSaturday = utcWeekday(6);

	var utcMonth = newInterval(function(date) {
	  date.setUTCDate(1);
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCMonth(date.getUTCMonth() + step);
	}, function(start, end) {
	  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
	}, function(date) {
	  return date.getUTCMonth();
	});

	var utcYear = newInterval(function(date) {
	  date.setUTCMonth(0, 1);
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCFullYear(date.getUTCFullYear() + step);
	}, function(start, end) {
	  return end.getUTCFullYear() - start.getUTCFullYear();
	}, function(date) {
	  return date.getUTCFullYear();
	});

	// An optimized implementation for this simple case.
	utcYear.every = function(k) {
	  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
	    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
	    date.setUTCMonth(0, 1);
	    date.setUTCHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setUTCFullYear(date.getUTCFullYear() + step * k);
	  });
	};

	function localDate(d) {
	  if (0 <= d.y && d.y < 100) {
	    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
	    date.setFullYear(d.y);
	    return date;
	  }
	  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
	}

	function utcDate(d) {
	  if (0 <= d.y && d.y < 100) {
	    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
	    date.setUTCFullYear(d.y);
	    return date;
	  }
	  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
	}

	function newYear(y) {
	  return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
	}

	function formatLocale$1(locale) {
	  var locale_dateTime = locale.dateTime,
	      locale_date = locale.date,
	      locale_time = locale.time,
	      locale_periods = locale.periods,
	      locale_weekdays = locale.days,
	      locale_shortWeekdays = locale.shortDays,
	      locale_months = locale.months,
	      locale_shortMonths = locale.shortMonths;

	  var periodRe = formatRe(locale_periods),
	      periodLookup = formatLookup(locale_periods),
	      weekdayRe = formatRe(locale_weekdays),
	      weekdayLookup = formatLookup(locale_weekdays),
	      shortWeekdayRe = formatRe(locale_shortWeekdays),
	      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
	      monthRe = formatRe(locale_months),
	      monthLookup = formatLookup(locale_months),
	      shortMonthRe = formatRe(locale_shortMonths),
	      shortMonthLookup = formatLookup(locale_shortMonths);

	  var formats = {
	    "a": formatShortWeekday,
	    "A": formatWeekday,
	    "b": formatShortMonth,
	    "B": formatMonth,
	    "c": null,
	    "d": formatDayOfMonth,
	    "e": formatDayOfMonth,
	    "f": formatMicroseconds,
	    "H": formatHour24,
	    "I": formatHour12,
	    "j": formatDayOfYear,
	    "L": formatMilliseconds,
	    "m": formatMonthNumber,
	    "M": formatMinutes,
	    "p": formatPeriod,
	    "Q": formatUnixTimestamp,
	    "s": formatUnixTimestampSeconds,
	    "S": formatSeconds,
	    "u": formatWeekdayNumberMonday,
	    "U": formatWeekNumberSunday,
	    "V": formatWeekNumberISO,
	    "w": formatWeekdayNumberSunday,
	    "W": formatWeekNumberMonday,
	    "x": null,
	    "X": null,
	    "y": formatYear,
	    "Y": formatFullYear,
	    "Z": formatZone,
	    "%": formatLiteralPercent
	  };

	  var utcFormats = {
	    "a": formatUTCShortWeekday,
	    "A": formatUTCWeekday,
	    "b": formatUTCShortMonth,
	    "B": formatUTCMonth,
	    "c": null,
	    "d": formatUTCDayOfMonth,
	    "e": formatUTCDayOfMonth,
	    "f": formatUTCMicroseconds,
	    "H": formatUTCHour24,
	    "I": formatUTCHour12,
	    "j": formatUTCDayOfYear,
	    "L": formatUTCMilliseconds,
	    "m": formatUTCMonthNumber,
	    "M": formatUTCMinutes,
	    "p": formatUTCPeriod,
	    "Q": formatUnixTimestamp,
	    "s": formatUnixTimestampSeconds,
	    "S": formatUTCSeconds,
	    "u": formatUTCWeekdayNumberMonday,
	    "U": formatUTCWeekNumberSunday,
	    "V": formatUTCWeekNumberISO,
	    "w": formatUTCWeekdayNumberSunday,
	    "W": formatUTCWeekNumberMonday,
	    "x": null,
	    "X": null,
	    "y": formatUTCYear,
	    "Y": formatUTCFullYear,
	    "Z": formatUTCZone,
	    "%": formatLiteralPercent
	  };

	  var parses = {
	    "a": parseShortWeekday,
	    "A": parseWeekday,
	    "b": parseShortMonth,
	    "B": parseMonth,
	    "c": parseLocaleDateTime,
	    "d": parseDayOfMonth,
	    "e": parseDayOfMonth,
	    "f": parseMicroseconds,
	    "H": parseHour24,
	    "I": parseHour24,
	    "j": parseDayOfYear,
	    "L": parseMilliseconds,
	    "m": parseMonthNumber,
	    "M": parseMinutes,
	    "p": parsePeriod,
	    "Q": parseUnixTimestamp,
	    "s": parseUnixTimestampSeconds,
	    "S": parseSeconds,
	    "u": parseWeekdayNumberMonday,
	    "U": parseWeekNumberSunday,
	    "V": parseWeekNumberISO,
	    "w": parseWeekdayNumberSunday,
	    "W": parseWeekNumberMonday,
	    "x": parseLocaleDate,
	    "X": parseLocaleTime,
	    "y": parseYear,
	    "Y": parseFullYear,
	    "Z": parseZone,
	    "%": parseLiteralPercent
	  };

	  // These recursive directive definitions must be deferred.
	  formats.x = newFormat(locale_date, formats);
	  formats.X = newFormat(locale_time, formats);
	  formats.c = newFormat(locale_dateTime, formats);
	  utcFormats.x = newFormat(locale_date, utcFormats);
	  utcFormats.X = newFormat(locale_time, utcFormats);
	  utcFormats.c = newFormat(locale_dateTime, utcFormats);

	  function newFormat(specifier, formats) {
	    return function(date) {
	      var string = [],
	          i = -1,
	          j = 0,
	          n = specifier.length,
	          c,
	          pad,
	          format;

	      if (!(date instanceof Date)) date = new Date(+date);

	      while (++i < n) {
	        if (specifier.charCodeAt(i) === 37) {
	          string.push(specifier.slice(j, i));
	          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
	          else pad = c === "e" ? " " : "0";
	          if (format = formats[c]) c = format(date, pad);
	          string.push(c);
	          j = i + 1;
	        }
	      }

	      string.push(specifier.slice(j, i));
	      return string.join("");
	    };
	  }

	  function newParse(specifier, newDate) {
	    return function(string) {
	      var d = newYear(1900),
	          i = parseSpecifier(d, specifier, string += "", 0),
	          week, day$$1;
	      if (i != string.length) return null;

	      // If a UNIX timestamp is specified, return it.
	      if ("Q" in d) return new Date(d.Q);

	      // The am-pm flag is 0 for AM, and 1 for PM.
	      if ("p" in d) d.H = d.H % 12 + d.p * 12;

	      // Convert day-of-week and week-of-year to day-of-year.
	      if ("V" in d) {
	        if (d.V < 1 || d.V > 53) return null;
	        if (!("w" in d)) d.w = 1;
	        if ("Z" in d) {
	          week = utcDate(newYear(d.y)), day$$1 = week.getUTCDay();
	          week = day$$1 > 4 || day$$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
	          week = utcDay.offset(week, (d.V - 1) * 7);
	          d.y = week.getUTCFullYear();
	          d.m = week.getUTCMonth();
	          d.d = week.getUTCDate() + (d.w + 6) % 7;
	        } else {
	          week = newDate(newYear(d.y)), day$$1 = week.getDay();
	          week = day$$1 > 4 || day$$1 === 0 ? monday.ceil(week) : monday(week);
	          week = day.offset(week, (d.V - 1) * 7);
	          d.y = week.getFullYear();
	          d.m = week.getMonth();
	          d.d = week.getDate() + (d.w + 6) % 7;
	        }
	      } else if ("W" in d || "U" in d) {
	        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
	        day$$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
	        d.m = 0;
	        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$$1 + 5) % 7 : d.w + d.U * 7 - (day$$1 + 6) % 7;
	      }

	      // If a time zone is specified, all fields are interpreted as UTC and then
	      // offset according to the specified time zone.
	      if ("Z" in d) {
	        d.H += d.Z / 100 | 0;
	        d.M += d.Z % 100;
	        return utcDate(d);
	      }

	      // Otherwise, all fields are in local time.
	      return newDate(d);
	    };
	  }

	  function parseSpecifier(d, specifier, string, j) {
	    var i = 0,
	        n = specifier.length,
	        m = string.length,
	        c,
	        parse;

	    while (i < n) {
	      if (j >= m) return -1;
	      c = specifier.charCodeAt(i++);
	      if (c === 37) {
	        c = specifier.charAt(i++);
	        parse = parses[c in pads ? specifier.charAt(i++) : c];
	        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
	      } else if (c != string.charCodeAt(j++)) {
	        return -1;
	      }
	    }

	    return j;
	  }

	  function parsePeriod(d, string, i) {
	    var n = periodRe.exec(string.slice(i));
	    return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseShortWeekday(d, string, i) {
	    var n = shortWeekdayRe.exec(string.slice(i));
	    return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseWeekday(d, string, i) {
	    var n = weekdayRe.exec(string.slice(i));
	    return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseShortMonth(d, string, i) {
	    var n = shortMonthRe.exec(string.slice(i));
	    return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseMonth(d, string, i) {
	    var n = monthRe.exec(string.slice(i));
	    return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseLocaleDateTime(d, string, i) {
	    return parseSpecifier(d, locale_dateTime, string, i);
	  }

	  function parseLocaleDate(d, string, i) {
	    return parseSpecifier(d, locale_date, string, i);
	  }

	  function parseLocaleTime(d, string, i) {
	    return parseSpecifier(d, locale_time, string, i);
	  }

	  function formatShortWeekday(d) {
	    return locale_shortWeekdays[d.getDay()];
	  }

	  function formatWeekday(d) {
	    return locale_weekdays[d.getDay()];
	  }

	  function formatShortMonth(d) {
	    return locale_shortMonths[d.getMonth()];
	  }

	  function formatMonth(d) {
	    return locale_months[d.getMonth()];
	  }

	  function formatPeriod(d) {
	    return locale_periods[+(d.getHours() >= 12)];
	  }

	  function formatUTCShortWeekday(d) {
	    return locale_shortWeekdays[d.getUTCDay()];
	  }

	  function formatUTCWeekday(d) {
	    return locale_weekdays[d.getUTCDay()];
	  }

	  function formatUTCShortMonth(d) {
	    return locale_shortMonths[d.getUTCMonth()];
	  }

	  function formatUTCMonth(d) {
	    return locale_months[d.getUTCMonth()];
	  }

	  function formatUTCPeriod(d) {
	    return locale_periods[+(d.getUTCHours() >= 12)];
	  }

	  return {
	    format: function(specifier) {
	      var f = newFormat(specifier += "", formats);
	      f.toString = function() { return specifier; };
	      return f;
	    },
	    parse: function(specifier) {
	      var p = newParse(specifier += "", localDate);
	      p.toString = function() { return specifier; };
	      return p;
	    },
	    utcFormat: function(specifier) {
	      var f = newFormat(specifier += "", utcFormats);
	      f.toString = function() { return specifier; };
	      return f;
	    },
	    utcParse: function(specifier) {
	      var p = newParse(specifier, utcDate);
	      p.toString = function() { return specifier; };
	      return p;
	    }
	  };
	}

	var pads = {"-": "", "_": " ", "0": "0"},
	    numberRe = /^\s*\d+/, // note: ignores next directive
	    percentRe = /^%/,
	    requoteRe = /[\\^$*+?|[\]().{}]/g;

	function pad(value, fill, width) {
	  var sign = value < 0 ? "-" : "",
	      string = (sign ? -value : value) + "",
	      length = string.length;
	  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
	}

	function requote(s) {
	  return s.replace(requoteRe, "\\$&");
	}

	function formatRe(names) {
	  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
	}

	function formatLookup(names) {
	  var map = {}, i = -1, n = names.length;
	  while (++i < n) map[names[i].toLowerCase()] = i;
	  return map;
	}

	function parseWeekdayNumberSunday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 1));
	  return n ? (d.w = +n[0], i + n[0].length) : -1;
	}

	function parseWeekdayNumberMonday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 1));
	  return n ? (d.u = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberSunday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.U = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberISO(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.V = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberMonday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.W = +n[0], i + n[0].length) : -1;
	}

	function parseFullYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 4));
	  return n ? (d.y = +n[0], i + n[0].length) : -1;
	}

	function parseYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
	}

	function parseZone(d, string, i) {
	  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
	  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
	}

	function parseMonthNumber(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
	}

	function parseDayOfMonth(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.d = +n[0], i + n[0].length) : -1;
	}

	function parseDayOfYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 3));
	  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
	}

	function parseHour24(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.H = +n[0], i + n[0].length) : -1;
	}

	function parseMinutes(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.M = +n[0], i + n[0].length) : -1;
	}

	function parseSeconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.S = +n[0], i + n[0].length) : -1;
	}

	function parseMilliseconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 3));
	  return n ? (d.L = +n[0], i + n[0].length) : -1;
	}

	function parseMicroseconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 6));
	  return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
	}

	function parseLiteralPercent(d, string, i) {
	  var n = percentRe.exec(string.slice(i, i + 1));
	  return n ? i + n[0].length : -1;
	}

	function parseUnixTimestamp(d, string, i) {
	  var n = numberRe.exec(string.slice(i));
	  return n ? (d.Q = +n[0], i + n[0].length) : -1;
	}

	function parseUnixTimestampSeconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i));
	  return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
	}

	function formatDayOfMonth(d, p) {
	  return pad(d.getDate(), p, 2);
	}

	function formatHour24(d, p) {
	  return pad(d.getHours(), p, 2);
	}

	function formatHour12(d, p) {
	  return pad(d.getHours() % 12 || 12, p, 2);
	}

	function formatDayOfYear(d, p) {
	  return pad(1 + day.count(year(d), d), p, 3);
	}

	function formatMilliseconds(d, p) {
	  return pad(d.getMilliseconds(), p, 3);
	}

	function formatMicroseconds(d, p) {
	  return formatMilliseconds(d, p) + "000";
	}

	function formatMonthNumber(d, p) {
	  return pad(d.getMonth() + 1, p, 2);
	}

	function formatMinutes(d, p) {
	  return pad(d.getMinutes(), p, 2);
	}

	function formatSeconds(d, p) {
	  return pad(d.getSeconds(), p, 2);
	}

	function formatWeekdayNumberMonday(d) {
	  var day$$1 = d.getDay();
	  return day$$1 === 0 ? 7 : day$$1;
	}

	function formatWeekNumberSunday(d, p) {
	  return pad(sunday.count(year(d), d), p, 2);
	}

	function formatWeekNumberISO(d, p) {
	  var day$$1 = d.getDay();
	  d = (day$$1 >= 4 || day$$1 === 0) ? thursday(d) : thursday.ceil(d);
	  return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
	}

	function formatWeekdayNumberSunday(d) {
	  return d.getDay();
	}

	function formatWeekNumberMonday(d, p) {
	  return pad(monday.count(year(d), d), p, 2);
	}

	function formatYear(d, p) {
	  return pad(d.getFullYear() % 100, p, 2);
	}

	function formatFullYear(d, p) {
	  return pad(d.getFullYear() % 10000, p, 4);
	}

	function formatZone(d) {
	  var z = d.getTimezoneOffset();
	  return (z > 0 ? "-" : (z *= -1, "+"))
	      + pad(z / 60 | 0, "0", 2)
	      + pad(z % 60, "0", 2);
	}

	function formatUTCDayOfMonth(d, p) {
	  return pad(d.getUTCDate(), p, 2);
	}

	function formatUTCHour24(d, p) {
	  return pad(d.getUTCHours(), p, 2);
	}

	function formatUTCHour12(d, p) {
	  return pad(d.getUTCHours() % 12 || 12, p, 2);
	}

	function formatUTCDayOfYear(d, p) {
	  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
	}

	function formatUTCMilliseconds(d, p) {
	  return pad(d.getUTCMilliseconds(), p, 3);
	}

	function formatUTCMicroseconds(d, p) {
	  return formatUTCMilliseconds(d, p) + "000";
	}

	function formatUTCMonthNumber(d, p) {
	  return pad(d.getUTCMonth() + 1, p, 2);
	}

	function formatUTCMinutes(d, p) {
	  return pad(d.getUTCMinutes(), p, 2);
	}

	function formatUTCSeconds(d, p) {
	  return pad(d.getUTCSeconds(), p, 2);
	}

	function formatUTCWeekdayNumberMonday(d) {
	  var dow = d.getUTCDay();
	  return dow === 0 ? 7 : dow;
	}

	function formatUTCWeekNumberSunday(d, p) {
	  return pad(utcSunday.count(utcYear(d), d), p, 2);
	}

	function formatUTCWeekNumberISO(d, p) {
	  var day$$1 = d.getUTCDay();
	  d = (day$$1 >= 4 || day$$1 === 0) ? utcThursday(d) : utcThursday.ceil(d);
	  return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
	}

	function formatUTCWeekdayNumberSunday(d) {
	  return d.getUTCDay();
	}

	function formatUTCWeekNumberMonday(d, p) {
	  return pad(utcMonday.count(utcYear(d), d), p, 2);
	}

	function formatUTCYear(d, p) {
	  return pad(d.getUTCFullYear() % 100, p, 2);
	}

	function formatUTCFullYear(d, p) {
	  return pad(d.getUTCFullYear() % 10000, p, 4);
	}

	function formatUTCZone() {
	  return "+0000";
	}

	function formatLiteralPercent() {
	  return "%";
	}

	function formatUnixTimestamp(d) {
	  return +d;
	}

	function formatUnixTimestampSeconds(d) {
	  return Math.floor(+d / 1000);
	}

	var locale$1;
	var timeFormat;
	var timeParse;
	var utcFormat;
	var utcParse;

	defaultLocale$1({
	  dateTime: "%x, %X",
	  date: "%-m/%-d/%Y",
	  time: "%-I:%M:%S %p",
	  periods: ["AM", "PM"],
	  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	});

	function defaultLocale$1(definition) {
	  locale$1 = formatLocale$1(definition);
	  timeFormat = locale$1.format;
	  timeParse = locale$1.parse;
	  utcFormat = locale$1.utcFormat;
	  utcParse = locale$1.utcParse;
	  return locale$1;
	}

	var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

	function formatIsoNative(date) {
	  return date.toISOString();
	}

	var formatIso = Date.prototype.toISOString
	    ? formatIsoNative
	    : utcFormat(isoSpecifier);

	function parseIsoNative(string) {
	  var date = new Date(string);
	  return isNaN(date) ? null : date;
	}

	var parseIso = +new Date("2000-01-01T00:00:00.000Z")
	    ? parseIsoNative
	    : utcParse(isoSpecifier);

	/* describe/Histogram.html generated by Svelte v1.64.0 */

	var xScale_ = linear$2();
	var xScaleBand_ = band();
	var yScale_ = linear$2();

	const pct = (val) => {
	    if (!val) return '0%';
	    if (val < 0.01) return '<1%';
	    return (val*100).toFixed(0)+'%';
	};

	function NAs({ values }) {
	    return values.filter(d => typeof d == 'string' || Number.isNaN(d)).length;
	}
	function validValues({ values }) {
	    return values.filter(d => typeof d == 'number' && !Number.isNaN(d));
	}
	function stats({ validValues, format }) {
	    const xmin = min(validValues);
	    const xmax = max(validValues);
	    const xmean = mean(validValues);
	    const xmed = median(validValues);
	    return [
	        {x:xmin, label: format(xmin), name: 'Min'},
	        {x:xmax, label: format(xmax), name: 'Max'},
	        {x:xmean, label: format(xmean), name: __('describe / histogram / mean')},
	        {x:xmed, label: format(xmed), name: __('describe / histogram / median') }
	    ];
	}
	function niceDomain({ validValues }) {
	    return linear$2()
	        .domain(extent(validValues))
	        .nice().domain();
	}
	function bins({ niceDomain, validValues }) {
	    // const tickCnt = Math.min(_uniq(validValues).length, 14);
	    const dom = niceDomain;
	    // const classw = (s[1]-s[0]);
	    const bins = histogram()
	        .domain(dom)
	        .thresholds(sturges)(validValues);
	    const bin_widths = _countBy(bins.map(b => b.x1 - b.x0));
	    if (bins.length > 2 && _keys(bin_widths).length > 1) {
	        // check first and last bin
	        const binw = bins[1].x1 - bins[1].x0;
	        const lst = dom[0] + Math.ceil((dom[1]-dom[0])/binw)*binw;
	        return histogram().domain([dom[0], lst])
	            .thresholds(_range(dom[0], lst+binw*0.4, binw))(validValues);
	    }
	    return bins;
	}
	function innerWidth({ width, padding }) {
	    return width - padding.left - padding.right;
	}
	function xScaleBand({ bins, innerWidth }) {
	    return xScaleBand_
	        .domain(bins.map(d => d.x0))
	        .paddingInner(0.1)
	        .rangeRound([0, innerWidth])
	        .align(0);
	}
	function xScale({ niceDomain, bins, xScaleBand }) {
	    return xScale_
	        .domain(niceDomain)
	        .rangeRound([0, xScaleBand.step() * bins.length]);
	}
	function ticks$1({ xScale, format }) {
	    return xScale.ticks(4).map(x => {
	        return {x, label:format(x)};
	    });
	}
	function innerHeight({ height, padding }) {
	    return height - padding.bottom - padding.top;
	}
	function yScale({ innerHeight, bins }) {
	    return yScale_
	        .domain([0, max(bins, function(d) { return d.length; })])
	        .range([innerHeight, 0]);
	}
	function barWidth({ bins, xScale }) {
	    return xScale(bins[0].x1) - xScale(bins[0].x0) - 1
	}
	function data$4() {
	    return {
	        format: d => d,
	        t: 0,
	        padding: { top: 10, right: 65, bottom: 20, left: 5 },
	        height: 200,
	        width: 500,
	        values: [],
	        highlight: false
	    };
	}
	function tooltip(bin, i, bins, len) {
	    const tt = i === 0 ? __("describe / histogram / tooltip / first") :
	        i == bins.length-1 ? __("describe / histogram / tooltip / last") :
	        __("describe / histogram / tooltip");
	    return tt.replace('$1', bin.length)
	        .replace('$2', pct(bin.length / len))
	        .replace('$3', toFixed(bin.x0))
	        .replace('$4', toFixed(bin.x1));
	}
	var methods$2 = {
	    show (value) {
	        this.set({highlight: value});
	    },
	    resize: function () {
	        var bcr = this.refs.svg.getBoundingClientRect();

	        this.set({
	            width: bcr.right - bcr.left,
	            height: bcr.bottom - bcr.top
	        });
	    }
	};

	function oncreate$2() {
	    this.resize();
	}
	function create_main_fragment$4(component, state) {
		var h3, text_value = __('describe / histogram'), text, text_1, svg, g, g_1, each_anchor, g_1_transform_value, g_2, g_transform_value, text_2, ul, each_2_anchor, text_3, p, raw_value = __("describe / histogram / learn-more");

		var each_value = state.ticks;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, assign(assign({}, state), {
				each_value: each_value,
				tick: each_value[i],
				tick_index: i
			}));
		}

		var if_block = (state.highlight) && create_if_block$2(component, state);

		var each_value_1 = state.bins;

		var each_1_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_1_blocks[i] = create_each_block_1$1(component, assign(assign({}, state), {
				each_value_1: each_value_1,
				bin: each_value_1[i],
				i: i
			}));
		}

		var each_value_2 = state.stats;

		var each_2_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_2_blocks[i] = create_each_block_2$1(component, assign(assign({}, state), {
				each_value_2: each_value_2,
				s: each_value_2[i],
				s_index: i
			}));
		}

		var if_block_1 = (state.NAs>0) && create_if_block_1$1(component, state);

		return {
			c: function create() {
				h3 = createElement("h3");
				text = createText(text_value);
				text_1 = createText("\n");
				svg = createSvgElement("svg");
				g = createSvgElement("g");
				g_1 = createSvgElement("g");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
				if (if_block) if_block.c();
				g_2 = createSvgElement("g");

				for (var i = 0; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].c();
				}

				text_2 = createText("\n");
				ul = createElement("ul");

				for (var i = 0; i < each_2_blocks.length; i += 1) {
					each_2_blocks[i].c();
				}

				each_2_anchor = createComment();
				if (if_block_1) if_block_1.c();
				text_3 = createText("\n");
				p = createElement("p");
				this.h();
			},

			h: function hydrate() {
				h3.className = "svelte-4derlj";
				setAttribute(g_1, "class", "axis x-axis svelte-4derlj");
				setAttribute(g_1, "transform", g_1_transform_value = "translate(0, " + state.innerHeight + ")");
				setAttribute(g_2, "class", "bars svelte-4derlj");
				setAttribute(g, "transform", g_transform_value = "translate(" + ([state.padding.left,state.padding.top]) + ")");
				setAttribute(svg, "class", "svelte-4derlj");
				ul.className = "svelte-4derlj";
				p.className = "learn-more";
			},

			m: function mount(target, anchor) {
				insertNode(h3, target, anchor);
				appendNode(text, h3);
				insertNode(text_1, target, anchor);
				insertNode(svg, target, anchor);
				appendNode(g, svg);
				appendNode(g_1, g);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(g_1, null);
				}

				appendNode(each_anchor, g_1);
				if (if_block) if_block.m(g_1, null);
				appendNode(g_2, g);

				for (var i = 0; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].m(g_2, null);
				}

				component.refs.svg = svg;
				insertNode(text_2, target, anchor);
				insertNode(ul, target, anchor);

				for (var i = 0; i < each_2_blocks.length; i += 1) {
					each_2_blocks[i].m(ul, null);
				}

				appendNode(each_2_anchor, ul);
				if (if_block_1) if_block_1.m(ul, null);
				insertNode(text_3, target, anchor);
				insertNode(p, target, anchor);
				p.innerHTML = raw_value;
			},

			p: function update(changed, state) {
				var each_value = state.ticks;

				if (changed.xScale || changed.ticks) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							tick: each_value[i],
							tick_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$2(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(g_1, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}

				if (state.highlight) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$2(component, state);
						if_block.c();
						if_block.m(g_1, null);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if ((changed.innerHeight) && g_1_transform_value !== (g_1_transform_value = "translate(0, " + state.innerHeight + ")")) {
					setAttribute(g_1, "transform", g_1_transform_value);
				}

				var each_value_1 = state.bins;

				if (changed.xScaleBand || changed.bins || changed.yScale || changed.validValues || changed.innerHeight) {
					for (var i = 0; i < each_value_1.length; i += 1) {
						var each_1_context = assign(assign({}, state), {
							each_value_1: each_value_1,
							bin: each_value_1[i],
							i: i
						});

						if (each_1_blocks[i]) {
							each_1_blocks[i].p(changed, each_1_context);
						} else {
							each_1_blocks[i] = create_each_block_1$1(component, each_1_context);
							each_1_blocks[i].c();
							each_1_blocks[i].m(g_2, null);
						}
					}

					for (; i < each_1_blocks.length; i += 1) {
						each_1_blocks[i].u();
						each_1_blocks[i].d();
					}
					each_1_blocks.length = each_value_1.length;
				}

				if ((changed.padding) && g_transform_value !== (g_transform_value = "translate(" + ([state.padding.left,state.padding.top]) + ")")) {
					setAttribute(g, "transform", g_transform_value);
				}

				var each_value_2 = state.stats;

				if (changed.stats) {
					for (var i = 0; i < each_value_2.length; i += 1) {
						var each_2_context = assign(assign({}, state), {
							each_value_2: each_value_2,
							s: each_value_2[i],
							s_index: i
						});

						if (each_2_blocks[i]) {
							each_2_blocks[i].p(changed, each_2_context);
						} else {
							each_2_blocks[i] = create_each_block_2$1(component, each_2_context);
							each_2_blocks[i].c();
							each_2_blocks[i].m(ul, each_2_anchor);
						}
					}

					for (; i < each_2_blocks.length; i += 1) {
						each_2_blocks[i].u();
						each_2_blocks[i].d();
					}
					each_2_blocks.length = each_value_2.length;
				}

				if (state.NAs>0) {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1$1(component, state);
						if_block_1.c();
						if_block_1.m(ul, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}
			},

			u: function unmount() {
				p.innerHTML = '';

				detachNode(h3);
				detachNode(text_1);
				detachNode(svg);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				if (if_block) if_block.u();

				for (var i = 0; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].u();
				}

				detachNode(text_2);
				detachNode(ul);

				for (var i = 0; i < each_2_blocks.length; i += 1) {
					each_2_blocks[i].u();
				}

				if (if_block_1) if_block_1.u();
				detachNode(text_3);
				detachNode(p);
			},

			d: function destroy$$1() {
				destroyEach(each_blocks);

				if (if_block) if_block.d();

				destroyEach(each_1_blocks);

				if (component.refs.svg === svg) component.refs.svg = null;

				destroyEach(each_2_blocks);

				if (if_block_1) if_block_1.d();
			}
		};
	}

	// (6:12) {#each ticks as tick}
	function create_each_block$2(component, state) {
		var tick = state.tick, each_value = state.each_value, tick_index = state.tick_index;
		var g, line, text, text_1_value = tick.label, text_1, g_transform_value;

		return {
			c: function create() {
				g = createSvgElement("g");
				line = createSvgElement("line");
				text = createSvgElement("text");
				text_1 = createText(text_1_value);
				this.h();
			},

			h: function hydrate() {
				setAttribute(line, "y2", "3");
				setAttribute(line, "class", "svelte-4derlj");
				setAttribute(text, "y", "5");
				setAttribute(text, "class", "svelte-4derlj");
				setAttribute(g, "class", "tick svelte-4derlj");
				setAttribute(g, "transform", g_transform_value = "translate(" + state.xScale(tick.x) + ",0)");
			},

			m: function mount(target, anchor) {
				insertNode(g, target, anchor);
				appendNode(line, g);
				appendNode(text, g);
				appendNode(text_1, text);
			},

			p: function update(changed, state) {
				tick = state.tick;
				each_value = state.each_value;
				tick_index = state.tick_index;
				if ((changed.ticks) && text_1_value !== (text_1_value = tick.label)) {
					text_1.data = text_1_value;
				}

				if ((changed.xScale || changed.ticks) && g_transform_value !== (g_transform_value = "translate(" + state.xScale(tick.x) + ",0)")) {
					setAttribute(g, "transform", g_transform_value);
				}
			},

			u: function unmount() {
				detachNode(g);
			},

			d: noop
		};
	}

	// (12:12) {#if highlight}
	function create_if_block$2(component, state) {
		var polygon, polygon_transform_value;

		return {
			c: function create() {
				polygon = createSvgElement("polygon");
				this.h();
			},

			h: function hydrate() {
				setAttribute(polygon, "transform", polygon_transform_value = "translate(" + state.xScale(state.highlight.x) + ",0)");
				setAttribute(polygon, "points", "0,0,4,6,-4,6");
			},

			m: function mount(target, anchor) {
				insertNode(polygon, target, anchor);
			},

			p: function update(changed, state) {
				if ((changed.xScale || changed.highlight) && polygon_transform_value !== (polygon_transform_value = "translate(" + state.xScale(state.highlight.x) + ",0)")) {
					setAttribute(polygon, "transform", polygon_transform_value);
				}
			},

			u: function unmount() {
				detachNode(polygon);
			},

			d: noop
		};
	}

	// (30:12) {#each bins as bin, i}
	function create_each_block_1$1(component, state) {
		var bin = state.bin, each_value_1 = state.each_value_1, i = state.i;
		var g, title, text_value = tooltip(bin,i,state.bins,state.validValues.length), text, rect, rect_width_value, rect_height_value, g_transform_value;

		return {
			c: function create() {
				g = createSvgElement("g");
				title = createSvgElement("title");
				text = createText(text_value);
				rect = createSvgElement("rect");
				this.h();
			},

			h: function hydrate() {
				setAttribute(rect, "width", rect_width_value = bin.x1 != bin.x0 ? state.xScaleBand.bandwidth() : 20);
				setAttribute(rect, "height", rect_height_value = state.innerHeight - state.yScale(bin.length));
				setAttribute(rect, "class", "svelte-4derlj");
				setAttribute(g, "class", "bar");
				setAttribute(g, "transform", g_transform_value = "translate(" + state.xScaleBand(bin.x0) + "," + state.yScale(bin.length) + ")");
			},

			m: function mount(target, anchor) {
				insertNode(g, target, anchor);
				appendNode(title, g);
				appendNode(text, title);
				appendNode(rect, g);
			},

			p: function update(changed, state) {
				bin = state.bin;
				each_value_1 = state.each_value_1;
				i = state.i;
				if ((changed.bins || changed.validValues) && text_value !== (text_value = tooltip(bin,i,state.bins,state.validValues.length))) {
					text.data = text_value;
				}

				if ((changed.bins || changed.xScaleBand) && rect_width_value !== (rect_width_value = bin.x1 != bin.x0 ? state.xScaleBand.bandwidth() : 20)) {
					setAttribute(rect, "width", rect_width_value);
				}

				if ((changed.innerHeight || changed.yScale || changed.bins) && rect_height_value !== (rect_height_value = state.innerHeight - state.yScale(bin.length))) {
					setAttribute(rect, "height", rect_height_value);
				}

				if ((changed.xScaleBand || changed.bins || changed.yScale) && g_transform_value !== (g_transform_value = "translate(" + state.xScaleBand(bin.x0) + "," + state.yScale(bin.length) + ")")) {
					setAttribute(g, "transform", g_transform_value);
				}
			},

			u: function unmount() {
				detachNode(g);
			},

			d: noop
		};
	}

	// (44:4) {#each stats as s}
	function create_each_block_2$1(component, state) {
		var s = state.s, each_value_2 = state.each_value_2, s_index = state.s_index;
		var li, text_value = s.name, text, text_1, tt, text_2_value = s.label, text_2;

		return {
			c: function create() {
				li = createElement("li");
				text = createText(text_value);
				text_1 = createText(": ");
				tt = createElement("tt");
				text_2 = createText(text_2_value);
				this.h();
			},

			h: function hydrate() {
				addListener(tt, "mouseleave", mouseleave_handler);
				addListener(tt, "mouseenter", mouseenter_handler);
				tt.className = "svelte-4derlj";

				tt._svelte = {
					component: component,
					each_value_2: state.each_value_2,
					s_index: state.s_index
				};

				li.className = "svelte-4derlj";
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				appendNode(text, li);
				appendNode(text_1, li);
				appendNode(tt, li);
				appendNode(text_2, tt);
			},

			p: function update(changed, state) {
				s = state.s;
				each_value_2 = state.each_value_2;
				s_index = state.s_index;
				if ((changed.stats) && text_value !== (text_value = s.name)) {
					text.data = text_value;
				}

				if ((changed.stats) && text_2_value !== (text_2_value = s.label)) {
					text_2.data = text_2_value;
				}

				tt._svelte.each_value_2 = state.each_value_2;
				tt._svelte.s_index = state.s_index;
			},

			u: function unmount() {
				detachNode(li);
			},

			d: function destroy$$1() {
				removeListener(tt, "mouseleave", mouseleave_handler);
				removeListener(tt, "mouseenter", mouseenter_handler);
			}
		};
	}

	// (48:4) {#if NAs>0}
	function create_if_block_1$1(component, state) {
		var li, text_value = __('describe / histogram / invalid'), text, text_1, tt, text_2, text_3, text_4_value = pct(state.NAs/state.values.length), text_4, text_5;

		return {
			c: function create() {
				li = createElement("li");
				text = createText(text_value);
				text_1 = createText(": ");
				tt = createElement("tt");
				text_2 = createText(state.NAs);
				text_3 = createText(" (");
				text_4 = createText(text_4_value);
				text_5 = createText(")");
				this.h();
			},

			h: function hydrate() {
				setStyle(tt, "color", "#c71e1d");
				tt.className = "svelte-4derlj";
				li.className = "svelte-4derlj";
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				appendNode(text, li);
				appendNode(text_1, li);
				appendNode(tt, li);
				appendNode(text_2, tt);
				appendNode(text_3, li);
				appendNode(text_4, li);
				appendNode(text_5, li);
			},

			p: function update(changed, state) {
				if (changed.NAs) {
					text_2.data = state.NAs;
				}

				if ((changed.NAs || changed.values) && text_4_value !== (text_4_value = pct(state.NAs/state.values.length))) {
					text_4.data = text_4_value;
				}
			},

			u: function unmount() {
				detachNode(li);
			},

			d: noop
		};
	}

	function mouseleave_handler(event) {
		var component = this._svelte.component;
		component.show(false);
	}

	function mouseenter_handler(event) {
		var component = this._svelte.component;
		var each_value_2 = this._svelte.each_value_2, s_index = this._svelte.s_index, s = each_value_2[s_index];
		component.show(s);
	}

	function Histogram(options) {
		this._debugName = '<Histogram>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this.refs = {};
		this._state = assign(data$4(), options.data);
		this._recompute({ values: 1, validValues: 1, format: 1, niceDomain: 1, width: 1, padding: 1, bins: 1, innerWidth: 1, xScaleBand: 1, xScale: 1, height: 1, innerHeight: 1 }, this._state);
		if (!('values' in this._state)) console.warn("<Histogram> was created without expected data property 'values'");

		if (!('format' in this._state)) console.warn("<Histogram> was created without expected data property 'format'");






		if (!('width' in this._state)) console.warn("<Histogram> was created without expected data property 'width'");
		if (!('padding' in this._state)) console.warn("<Histogram> was created without expected data property 'padding'");
		if (!('height' in this._state)) console.warn("<Histogram> was created without expected data property 'height'");

		if (!('highlight' in this._state)) console.warn("<Histogram> was created without expected data property 'highlight'");

		var self = this;
		var _oncreate = function() {
			var changed = { values: 1, validValues: 1, format: 1, xScale: 1, niceDomain: 1, bins: 1, innerWidth: 1, xScaleBand: 1, innerHeight: 1, width: 1, padding: 1, height: 1, ticks: 1, highlight: 1, yScale: 1, stats: 1, NAs: 1 };
			oncreate$2.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment$4(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(Histogram.prototype, protoDev);
	assign(Histogram.prototype, methods$2);

	Histogram.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('NAs' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'NAs'");
		if ('validValues' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'validValues'");
		if ('stats' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'stats'");
		if ('niceDomain' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'niceDomain'");
		if ('bins' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'bins'");
		if ('innerWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'innerWidth'");
		if ('xScaleBand' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'xScaleBand'");
		if ('xScale' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'xScale'");
		if ('ticks' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'ticks'");
		if ('innerHeight' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'innerHeight'");
		if ('yScale' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'yScale'");
		if ('barWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'barWidth'");
	};

	Histogram.prototype._recompute = function _recompute(changed, state) {
		if (changed.values) {
			if (this._differs(state.NAs, (state.NAs = NAs(state)))) changed.NAs = true;
			if (this._differs(state.validValues, (state.validValues = validValues(state)))) changed.validValues = true;
		}

		if (changed.validValues || changed.format) {
			if (this._differs(state.stats, (state.stats = stats(state)))) changed.stats = true;
		}

		if (changed.validValues) {
			if (this._differs(state.niceDomain, (state.niceDomain = niceDomain(state)))) changed.niceDomain = true;
		}

		if (changed.niceDomain || changed.validValues) {
			if (this._differs(state.bins, (state.bins = bins(state)))) changed.bins = true;
		}

		if (changed.width || changed.padding) {
			if (this._differs(state.innerWidth, (state.innerWidth = innerWidth(state)))) changed.innerWidth = true;
		}

		if (changed.bins || changed.innerWidth) {
			if (this._differs(state.xScaleBand, (state.xScaleBand = xScaleBand(state)))) changed.xScaleBand = true;
		}

		if (changed.niceDomain || changed.bins || changed.xScaleBand) {
			if (this._differs(state.xScale, (state.xScale = xScale(state)))) changed.xScale = true;
		}

		if (changed.xScale || changed.format) {
			if (this._differs(state.ticks, (state.ticks = ticks$1(state)))) changed.ticks = true;
		}

		if (changed.height || changed.padding) {
			if (this._differs(state.innerHeight, (state.innerHeight = innerHeight(state)))) changed.innerHeight = true;
		}

		if (changed.innerHeight || changed.bins) {
			if (this._differs(state.yScale, (state.yScale = yScale(state)))) changed.yScale = true;
		}

		if (changed.bins || changed.xScale) {
			if (this._differs(state.barWidth, (state.barWidth = barWidth(state)))) changed.barWidth = true;
		}
	};

	/* controls/hot/Handsontable.html generated by Svelte v1.64.0 */

	let app = null;

	function currentResult({ searchResults, searchIndex }) {
	    if (!searchResults || !searchResults.length) return null;
	    const l = searchResults.length;
	    if (searchIndex < 0 || searchIndex >= l) {
	        while (searchIndex<0) searchIndex += l;
	        if (searchIndex > l) searchIndex %= l;
	    }
	    return searchResults[searchIndex];
	}
	function data$5() {
	    return {
	        data: '',
	        readonly: false,
	        skipRows: 0,
	        firstRowIsHeader: true,
	        searchIndex: 0,
	        sortBy: '-',
	        transpose: false,
	        activeColumn: null,
	        search: '',
	        searchResults: []
	    };
	}
	var methods$3 = {
	    render() {
	        const {hot} = this.get();
	        hot.render();
	    },
	    update() {
	        const {data, transpose, firstRowIsHeader, skipRows, hot} = this.get();

	        if (!data) return;

	        // get chart
	        const chart = this.store.get('dw_chart');

	        // pass dataset through chart to apply changes and computed columns
	        const ds = chart.dataset(dw.datasource.delimited({
	            csv: data,
	            transpose,
	            firstRowIsHeader,
	            skipRows
	        }).parse()).dataset();

	        this.set({columnOrder: ds.columnOrder()});

	        // construct HoT data array
	        const hot_data = [[]];
	        ds.eachColumn(c => hot_data[0].push(c.title()));

	        ds.eachRow(r => {
	            const row = [];
	            ds.eachColumn(col => row.push(col.raw(r)));
	            hot_data.push(row);
	        });

	        // pass data to hot
	        hot.loadData(hot_data);

	        const cellRenderer = getCellRenderer(this, ds, HOT, {});

	        hot.updateSettings({
	            cells: (row, col) => {
	                const {readonly} = this.get();
	                return {
	                    readOnly: readonly || (ds.hasColumn(col) && ds.column(col).isComputed && row === 0),
	                    renderer: cellRenderer
	                };
	            },
	            manualColumnMove: []
	        });

	        this.set({ds});
	        this.set({has_changes: chart.get('metadata.data.changes', []).length > 0});

	        HOT.hooks.once('afterRender', () => this.initCustomEvents());
	        hot.render();
	    },
	    dataChanged (cells) {
	        const {hot} = this.get();
	        let changed = false;
	        cells.forEach(([row, col, old_val, new_val]) => {
	            if (old_val != new_val) {
	                const chart = this.store.get('dw_chart');
	                const {transpose} = this.get();
	                const changes = chart.get('metadata.data.changes', []);
	                row = hot.toPhysicalRow(row);
	                col = chart.dataset().columnOrder()[col];
	                if (transpose) {
	                    // swap row and col
	                    const tmp = row;
	                    row = col;
	                    col = tmp;
	                }
	                // store new change
	                changes.push({
	                    column: col, row, value: new_val, time: (new Date()).getTime()
	                });
	                chart.set('metadata.data.changes', changes);
	                changed = true;
	            }
	        });
	        if (changed) {
	            setTimeout(() => {
	                this.update();
	                chart.save();
	            }, 100);
	        }
	    },
	    columnMoved (srcColumns, tgtIndex) {
	        const {hot} = this.get();
	        if (!srcColumns.length) return;
	        const {columnOrder} = this.get();
	        const newOrder = columnOrder.slice(0);
	        const after = columnOrder[tgtIndex];
	        const elements = newOrder.splice(srcColumns[0], srcColumns.length);
	        const insertAt = after === undefined ? newOrder.length : after ? newOrder.indexOf(after) : 0;
	        newOrder.splice(insertAt, 0, ...elements);
	        this.store.get('dw_chart')
	            .set('metadata.data.column-order', newOrder.slice(0));
	        this.set({columnOrder: newOrder});
	        // update selection
	        HOT.hooks.once('afterRender', () => {
	            setTimeout(() => {
	                this.fire('resetSort');
	                hot.selectCell(0, insertAt, hot.countRows()-1,
	                    insertAt+elements.length-1);
	            }, 10);
	        });
	        this.update();
	    },
	    updateHeight () {
	        const h = document.querySelector('.ht_master.handsontable .wtHolder .wtHider').getBoundingClientRect().height;
	        this.refs.hot.style.height = Math.min(500, h+10)+'px';
	    },
	    checkRange (r,c,r2,c2) {
	        // check if
	        // 1. only a single column is selected, and
	        // 2. the range starts at the first row, and
	        // 3. the range extends through he last row
	        const {hot} = this.get();
	        const {ds} = this.get();
	        const refs = this.refs;
	        if (c == c2 && r === 0 && r2 == hot.countRows()-1) {
	            // const chart = this.store.get('dw_chart');
	            // this.set({activeColumn: chart.dataset().column(c)});
	            return;
	        }
	        if (c != c2 && r === 0 && r2 == hot.countRows()-1) {
	            const sel = [];
	            for (let i=Math.min(c,c2); i<=Math.max(c,c2); i ++) {
	                sel.push(+document.querySelector(`#data-preview .htCore tbody tr:first-child td:nth-child(${i+2})`).dataset.column);
	            }
	            this.set({multiSelection:  sel.map(i => ds.column(i)), activeColumn:null});
	            return;
	        }
	        this.set({activeColumn:null, multiSelection:false});
	    },
	    initCustomEvents () {
	        // wait a bit to make sure HoT is rendered
	        setTimeout(() => {
	            // catch click events on A,B,C,D... header row
	            this.refs.hot.querySelectorAll('.htCore thead th:first-child').forEach(th => {
	                th.removeEventListener('click', topLeftCornerClick);
	                th.addEventListener('click', topLeftCornerClick);
	            });
	            this.refs.hot.querySelectorAll('.htCore thead th+th').forEach(th => {
	                th.removeEventListener('click', cellHeaderClick);
	                th.addEventListener('click', cellHeaderClick);
	            });
	        }, 500);
	    },

	    getColumnFormat(name) {
	        const chart = this.store.get('dw_chart');
	        const colFormats = chart.get('metadata.data.column-format', {});
	        return colFormats[name] || { type: 'auto', ignore: false };
	    }
	};

	function oncreate$3() {
	    app = this;
	    HOT.hooks.once('afterRender', () => this.initCustomEvents());

	    window.addEventListener('keyup', (evt) => {
	        const {activeColumn, ds} = this.get();
	        if (!activeColumn) return;
	        if (evt.key == 'ArrowRight' || evt.key == 'ArrowLeft') {
	            evt.preventDefault();
	            evt.stopPropagation();
	            const cur_i = ds.indexOf(activeColumn.name());
	            if (evt.key == 'ArrowRight') {
	                // select next column
	                this.set({activeColumn: ds.column((cur_i+1) % ds.numColumns())});
	            } else {
	                // select prev column
	                this.set({activeColumn: ds.column((cur_i-1+ds.numColumns()) % ds.numColumns())});
	            }
	        }

	    });

	    const chart = this.store.get('dw_chart');

	    const hot = new HOT(this.refs.hot, {
	        data: [],
	        rowHeaders: (i) => {
	            const ti = hot.getPlugin('ColumnSorting').translateRow(i);
	            return ti+1;
	        },
	        colHeaders: true,
	        fixedRowsTop: 1,
	        filters: true,
	        dropdownMenu: true,
	        startRows: 13,
	        startCols: 8,
	        fillHandle: false,
	        stretchH: 'all',
	        height: 500,
	        manualColumnMove: true,
	        selectionMode: 'range',
	        autoColumnSize: {useHeaders: true, syncLimit: 5},
	        // comments: true,
	        // contextMenu: true,

	        // sorting
	        columnSorting: true,
	        sortIndicator: true,
	        sortFunction: function(sortOrder, columnMeta) {
	            if (columnMeta.col > -1) {
	                var column = chart.dataset().column(columnMeta.col);
	                var colType = column.type();
	                var plugin = hot.getPlugin('columnSorting');
	                return function(a, b) {
	                    var sortFunction;
	                    if (a[0] === 0) return -1;
	                    // replace with values
	                    a[1] = column.val(a[0]-1);
	                    b[1] = column.val(b[0]-1);
	                    if (colType == 'number') {
	                        // sort NaNs at bottom
	                        if (isNaN(a[1])) a[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
	                        if (isNaN(b[1])) b[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
	                    }
	                    if (colType == 'date') {
	                        if (typeof a[1] == 'string') a[1] = new Date(110,0,1);
	                        if (typeof b[1] == 'string') b[1] = new Date(110,0,1);
	                    }
	                    switch (colType) {
	                        case 'date':
	                            sortFunction = plugin.dateSort;
	                            break;
	                        case 'number':
	                            sortFunction = plugin.numericSort;
	                            break;
	                        default:
	                            sortFunction = plugin.defaultSort;
	                    }
	                    return sortFunction(sortOrder, columnMeta)(a, b);
	                };
	            }
	            return (a,b) => a[0]-b[0];
	        },
	        afterGetColHeader: (col, th) => {
	            const {activeColumn, ds} = this.get();
	            if (!ds || !ds.hasColumn(col)) return;
	            if ((col === 0 || col) && activeColumn && ds.column(col).name() == activeColumn.name()) {
	                th.classList.add('selected');
	            }

	            if (col === 0 || col) {
	                if (this.getColumnFormat(ds.column(col).name()).ignore) {
	                    th.classList.add('ignored');
	                } else {
	                    th.classList.remove('ignored');
	                }
	            }
	        },
	        // search
	        search: 'search'
	    });

	    window.HT = hot;
	    this.set({hot});

	    HOT.hooks.add('afterSetDataAtCell', (a) => this.dataChanged(a));
	    HOT.hooks.add('afterColumnMove', (a,b) => this.columnMoved(a,b));
	    HOT.hooks.add('afterRender', () => this.updateHeight());
	    HOT.hooks.add('afterSelection', (r,c,r2,c2) => this.checkRange(r,c,r2,c2));

	    this.observe('data', () => this.update());
	    this.observe('firstRowIsHeader', (v, vo) => {
	        if (v != vo && vo !== undefined) this.update();
	    });

	    this.observe('search', (query, oldquery) => {
	        if (query != oldquery) this.set({searchIndex:0});
	        const searchResults = hot.search.query(query);
	        this.set({searchResults});
	        hot.render();
	    });

	    this.observe('currentResult', (res) => {
	        // console.log('cur search res', res);
	        if (!res || !hot) return;
	        // this is a weird hack to deal with HoT's problems to scroll
	        // all the way down after hot.scrollViewportTo(hot.countRows()-1, res.col);
	        // the first scrollViewportTo will trigger a render event
	        hot.render(); // to update the hightlight colors
	        hot.scrollViewportTo(res.row, res.col);
	        setTimeout(() => {
	            // one more time
	            hot.scrollViewportTo(res.row, res.col);
	        }, 100);
	    });

	    this.observe('activeColumn', () => {
	        setTimeout(() => hot.render(), 10);
	    });

	    // if (hot.sortingEnabled) {
	    this.observe('sorting', (sorting) => {
	        hot.sort(chart.dataset().indexOf(sorting.sortBy), sorting.sortDir);
	    });
	    // }

	}
	function getCellRenderer(app, dataset, Handsontable) {
	    const colTypeIcons = {
	        date: 'fa fa-clock-o'
	    };
	    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
	        var escaped = dw.utils.purifyHtml(Handsontable.helper.stringify(value));
	        TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
	    }
	    return function(instance, td, row, col, prop, value, cellProperties) {
	        if (dataset.numColumns() <= col || !dataset.hasColumn(col)) return;
	        const column = dataset.column(col);
	        const {searchResults, currentResult, activeColumn} = app.get();
	        const colFormat = app.getColumnFormat(column.name());
	        row = instance.toPhysicalRow(row);
	        if (row > 0) {
	            var formatter = chart.columnFormatter(column);
	            value = formatter(column.val(row - 1), true);
	        }
	        if (parseInt(value) < 0) { // if row contains negative number
	            td.classList.add('negative');
	        }
	        td.classList.add(column.type()+'Type');
	        td.dataset.column = col;

	        if (column.type() == 'text' && value && value.length > 70) {
	            value = value.substr(0,60)+'…';
	        }

	        if (row === 0) {
	            td.classList.add('firstRow');
	            if (colTypeIcons[column.type()]) {
	                value = '<i class="'+colTypeIcons[column.type()]+'"></i> ' + value;
	            }
	        } else {
	            td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
	        }
	        if (colFormat.ignore) {
	            td.classList.add('ignored');
	        }
	        if (activeColumn && activeColumn.name() == column.name()) {
	            td.classList.add('active');
	        }
	        const row_p = instance.getPlugin('columnSorting').untranslateRow(row);
	        searchResults.forEach(res => {
	            if (res.row == row_p && res.col == col) {
	                td.classList.add('htSearchResult');
	            }
	        });
	        if (currentResult && currentResult.row == row_p && currentResult.col == col) {
	            td.classList.add('htCurrentSearchResult');
	        }
	        if (row > 0 && !column.type(true).isValid(column.val(row-1))) {
	            td.classList.add('parsingError');
	        }
	        if (cellProperties.readOnly) td.classList.add('readOnly');

	        if (chart.dataCellChanged(col, row)) {
	            td.classList.add('changed');
	        }
	        HtmlCellRender(instance, td, row, col, prop, value, cellProperties);
	        // Reflect.apply(HtmlCellRender, this, arguments);
	    };
	}

	function topLeftCornerClick(evt) {
	    evt.preventDefault();
	    const {transpose} = app.get();
	    app.set({transpose: !transpose});
	    app.update();
	}

	function cellHeaderClick(evt) {
	    const th = this;
	    // reset the HoT selection
	    // find out which data column we're in
	    const k = th.parentNode.children.length;
	    let th_i = -1;
	    // (stupid HTMLCollection has no indexOf)
	    for (let i=0; i<k; i++) {
	        if (th.parentNode.children.item(i) == th) {
	            th_i = i;
	            break;
	        }
	    }
	    // find column index
	    const col_i = +app.refs.hot.querySelector(`.htCore tbody tr:first-child td:nth-child(${th_i+1})`).dataset.column;
	    const chart = app.store.get('dw_chart');
	    const {activeColumn,hot} = app.get();
	    if (chart.dataset().hasColumn(col_i)) {
	        const newActive = chart.dataset().column(+col_i);
	        // set active column (or unset if it's already set)
	        if (activeColumn && activeColumn.name() == newActive.name()) {
	            evt.target.parentNode.classList.remove('selected');
	            app.set({activeColumn:false});
	            hot.deselectCell();
	        } else {
	            evt.target.parentNode.classList.add('selected');
	            app.set({activeColumn: newActive});
	        }
	    }
	}

	function create_main_fragment$5(component, state) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div.id = "data-preview";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				component.refs.hot = div;
			},

			p: noop,

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy$$1() {
				if (component.refs.hot === div) component.refs.hot = null;
			}
		};
	}

	function Handsontable_1(options) {
		this._debugName = '<Handsontable_1>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this.refs = {};
		this._state = assign(data$5(), options.data);
		this._recompute({ searchResults: 1, searchIndex: 1 }, this._state);
		if (!('searchResults' in this._state)) console.warn("<Handsontable_1> was created without expected data property 'searchResults'");
		if (!('searchIndex' in this._state)) console.warn("<Handsontable_1> was created without expected data property 'searchIndex'");

		var self = this;
		var _oncreate = function() {
			var changed = { searchResults: 1, searchIndex: 1 };
			oncreate$3.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment$5(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(Handsontable_1.prototype, protoDev);
	assign(Handsontable_1.prototype, methods$3);

	Handsontable_1.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentResult' in newState && !this._updatingReadonlyProperty) throw new Error("<Handsontable_1>: Cannot set read-only property 'currentResult'");
	};

	Handsontable_1.prototype._recompute = function _recompute(changed, state) {
		if (changed.searchResults || changed.searchIndex) {
			if (this._differs(state.currentResult, (state.currentResult = currentResult(state)))) changed.currentResult = true;
		}
	};

	/* describe/App.html generated by Svelte v1.64.0 */

	function searchIndexSafe({ searchIndex, searchResults }) {
	    if (searchIndex<0) searchIndex+=searchResults.length;
	    searchIndex = searchIndex % searchResults.length;
	    return searchIndex;
	}
	function customColumn({ activeColumn, forceColumnFormat }) {
	    return activeColumn && !forceColumnFormat && activeColumn.isComputed ? activeColumn : false;
	}
	function columnFormat({ activeColumn, forceColumnFormat }) {
	    return activeColumn && (!activeColumn.isComputed || forceColumnFormat) ? activeColumn : false;
	}
	function activeValues({ activeColumn }) {
	    return activeColumn ? activeColumn.values() : [];
	}
	function activeFormat({ activeColumn, $dw_chart }) {
	    return activeColumn ? $dw_chart.columnFormatter(activeColumn) : d => d;
	}
	function columns({ activeColumn }) {
	    const ds = chart.dataset();
	    if (!activeColumn) return ds ? ds.columns() : [];
	    try {
	        return ds.columns().filter(col => !col.isComputed);
	    } catch(e) {
	        return [];
	    }
	}
	function sorting({ sortBy, sortDir }) {
	    return {sortBy,sortDir};
	}
	function data$6() {
	    return {
	        locale: 'en-US',
	        search: '',
	        chartData: '',
	        readonly: false,
	        transpose: false,
	        firstRowIsHeader: true,
	        searchIndex: 0,
	        activeColumn: false,
	        customColumn: false,
	        columnFormat: false,
	        multiSelection: false,
	        forceColumnFormat: false,
	        searchResults: [],
	        sortBy: '-',
	        sortDir: true,
	    };
	}
	var methods$4 = {
	    nextResult (diff) {
	        let {searchIndex, searchResults} = this.get();
	        searchIndex += diff;
	        if (searchIndex<0) searchIndex+=searchResults.length;
	        searchIndex = searchIndex % searchResults.length;
	        this.set({searchIndex});
	    },
	    keyPress (event) {
	        if (event.key == 'F3' || event.key == 'Enter')
	            this.nextResult(event.shiftKey ? -1 : 1);
	    },
	    toggleTranspose() {
	        this.set({activeColumn: false});
	        this.set({transpose: !this.get('transpose')});
	        setTimeout(() => this.refs.hot.update(), 500);
	        // ;
	    },
	    revertChanges() {
	        const chart = this.store.get('dw_chart');
	        chart.set('metadata.data.changes', []);
	        chart.saveSoon();
	        this.refs.hot.update();
	    },
	    cmFocus () {
	        setTimeout(() => {
	            this.refs.hot.get('hot').render();
	        }, 100);
	    },
	    addComputedColumn() {
	        const chart = this.store.get('dw_chart');
	        const ds = chart.dataset();
	        const computed = arrayToObject(chart.get('metadata.describe.computed-columns', {}));
	        // find new id
	        let i = 1;
	        while (ds.hasColumn(`Column ${i}`)) {
	            i++;
	        }
	        const id = `Column ${i}`;
	        computed[id] = '';
	        chart.set('metadata.describe.computed-columns', computed);
	        chart.saveSoon();
	        const ds2 = chart.dataset(true);
	        this.refs.hot.update();
	        this.set({ activeColumn: ds2.column(id) });
	    },
	    sort(event, col, ascending) {
	        event.preventDefault();
	        event.stopPropagation();
	        this.set({sortBy: col, sortDir: ascending});
	        // hide the dropdown menu
	        this.refs.sortDropdownGroup.classList.remove('open');
	    },
	    force(event, val=true) {
	        event.preventDefault();
	        this.set({forceColumnFormat:val});
	    },
	    hideMultiple(columns, hide) {
	        const chart = this.store.get('dw_chart');
	        const colFmt = chart.get('metadata.data.column-format', {});
	        columns.forEach(col => {
	            if (colFmt[col.name()]) colFmt[col.name()].ignore = hide;
	            else {
	                colFmt[col.name()] = {type:'auto',ignore:hide};
	            }
	        });
	        chart.set('metadata.data.column-format', colFmt);
	        chart.saveSoon();
	        setTimeout(() => {
	            this.refs.hot.get('hot').render();
	        }, 10);
	        this.set({multiSelection: false});
	    }
	};

	function oncreate$4() {
	    window.addEventListener('keypress', (event) => {
	        if (event.ctrlKey && event.key == 'f') {
	            event.preventDefault();
	            if (this.refs.search != window.document.activeElement) {
	                this.refs.search.focus();
	            } else {
	                this.nextResult(+1);
	            }
	        }
	    });
	    const sync = (svelte_key, metadata_key) => {
	        this.observe(svelte_key, (svelte_value) => {
	            this.store.get('dw_chart').set(`${metadata_key}`, svelte_value);
	            if (svelte_key == 'locale') {
	                if (!svelte_value) return;
	                this.store.get('dw_chart')
	                    .locale(svelte_value, () => {
	                        this.refs.hot.render();
	                    });
	            }
	        });
	    };
	    sync('transpose', 'metadata.data.transpose');
	    sync('firstRowIsHeader', 'metadata.data.horizontal-header');
	    sync('locale', 'language');
	    this.observe('activeColumn', (ac) => {
	        if (!ac) this.set({forceColumnFormat:false});
	    });
	}
	function create_main_fragment$6(component, state) {
		var div, div_1, div_2, div_3, text, hr, text_1, div_4, a, i, text_2, text_3_value = __("Back"), text_3, text_4, a_1, text_5_value = __("Proceed"), text_5, text_6, i_1, text_10, div_5, div_6, raw_value = __('describe / info-table-header'), raw_after, text_11, img, text_13, div_7, div_8, div_9, button, raw_1_value = __('describe / sort-by'), raw_1_after, text_14, span, text_16, ul, li, a_2, raw_2_value = __('describe / no-sorting'), li_class_value, text_19, div_10, i_2, text_20, div_11, input, input_updating = false, input_placeholder_value, input_class_value, text_21, div_11_class_value, text_23, text_26, handsontable_updating = {}, text_27, div_12, button_1, img_1, text_28, text_29_value = __("describe / transpose-long"), text_29, text_30, button_2, i_3, text_31, text_32_value = __("computed columns / add-btn"), text_32, text_33, text_34, button_3, i_4, text_35, text_36_value = __("Revert changes"), text_36, text_37, button_3_class_value;

		function select_block_type_1(state) {
			if (state.activeColumn) return create_if_block$3;
			if (state.multiSelection) return create_if_block_5;
			return create_if_block_6;
		}

		var current_block_type = select_block_type_1(state);
		var if_block = current_block_type(component, state);

		function click_handler(event) {
			component.sort(event, '-');
		}

		var each_value_1 = state.columns;

		var each_blocks = [];

		for (var i_5 = 0; i_5 < each_value_1.length; i_5 += 1) {
			each_blocks[i_5] = create_each_block_1$2(component, assign(assign({}, state), {
				each_value_1: each_value_1,
				col: each_value_1[i_5],
				col_index: i_5
			}));
		}

		function input_input_handler() {
			input_updating = true;
			component.set({ search: input.value });
			input_updating = false;
		}

		function keypress_handler(event) {
			component.keyPress(event);
		}

		var if_block_2 = (state.searchResults.length > 0) && create_if_block_7(component, state);

		var if_block_3 = (state.search) && create_if_block_8(component, state);

		var handsontable_initial_data = {};
		if ('chartData' in state) {
			handsontable_initial_data.data = state.chartData;
			handsontable_updating.data = true;
		}
		if ('transpose' in state) {
			handsontable_initial_data.transpose = state.transpose
	                ;
			handsontable_updating.transpose = true;
		}
		if ('firstRowIsHeader' in state) {
			handsontable_initial_data.firstRowIsHeader = state.firstRowIsHeader
	                ;
			handsontable_updating.firstRowIsHeader = true;
		}
		if ('activeColumn' in state) {
			handsontable_initial_data.activeColumn = state.activeColumn
	                ;
			handsontable_updating.activeColumn = true;
		}
		if ('readonly' in state) {
			handsontable_initial_data.readonly = state.readonly
	                ;
			handsontable_updating.readonly = true;
		}
		if ('sorting' in state) {
			handsontable_initial_data.sorting = state.sorting
	                ;
			handsontable_updating.sorting = true;
		}
		if ('search' in state) {
			handsontable_initial_data.search = state.search
	                ;
			handsontable_updating.search = true;
		}
		if ('searchResults' in state) {
			handsontable_initial_data.searchResults = state.searchResults
	                ;
			handsontable_updating.searchResults = true;
		}
		if ('searchIndex' in state) {
			handsontable_initial_data.searchIndex = state.searchIndex
	                ;
			handsontable_updating.searchIndex = true;
		}
		if ('multiSelection' in state) {
			handsontable_initial_data.multiSelection = state.multiSelection
	                ;
			handsontable_updating.multiSelection = true;
		}
		var handsontable = new Handsontable_1({
			root: component.root,
			data: handsontable_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!handsontable_updating.data && changed.data) {
					newState.chartData = childState.data;
				}

				if (!handsontable_updating.transpose && changed.transpose) {
					newState.transpose = childState.transpose;
				}

				if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
					newState.firstRowIsHeader = childState.firstRowIsHeader;
				}

				if (!handsontable_updating.activeColumn && changed.activeColumn) {
					newState.activeColumn = childState.activeColumn;
				}

				if (!handsontable_updating.readonly && changed.readonly) {
					newState.readonly = childState.readonly;
				}

				if (!handsontable_updating.sorting && changed.sorting) {
					newState.sorting = childState.sorting;
				}

				if (!handsontable_updating.search && changed.search) {
					newState.search = childState.search;
				}

				if (!handsontable_updating.searchResults && changed.searchResults) {
					newState.searchResults = childState.searchResults;
				}

				if (!handsontable_updating.searchIndex && changed.searchIndex) {
					newState.searchIndex = childState.searchIndex;
				}

				if (!handsontable_updating.multiSelection && changed.multiSelection) {
					newState.multiSelection = childState.multiSelection;
				}
				component._set(newState);
				handsontable_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			handsontable._bind({ data: 1, transpose: 1, firstRowIsHeader: 1, activeColumn: 1, readonly: 1, sorting: 1, search: 1, searchResults: 1, searchIndex: 1, multiSelection: 1 }, handsontable.get());
		});

		handsontable.on("resetSort", function(event) {
			component.set({sortBy:'-'});
		});

		component.refs.hot = handsontable;

		function click_handler_3(event) {
			component.toggleTranspose();
		}

		function click_handler_4(event) {
			component.addComputedColumn();
		}

		function click_handler_5(event) {
			component.revertChanges();
		}

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				div_2 = createElement("div");
				div_3 = createElement("div");
				if_block.c();
				text = createText("\n\n                ");
				hr = createElement("hr");
				text_1 = createText("\n\n                ");
				div_4 = createElement("div");
				a = createElement("a");
				i = createElement("i");
				text_2 = createText(" ");
				text_3 = createText(text_3_value);
				text_4 = createText("\n                    ");
				a_1 = createElement("a");
				text_5 = createText(text_5_value);
				text_6 = createText(" ");
				i_1 = createElement("i");
				text_10 = createText("\n        ");
				div_5 = createElement("div");
				div_6 = createElement("div");
				raw_after = createElement('noscript');
				text_11 = createText(" ");
				img = createElement("img");
				text_13 = createText("\n            ");
				div_7 = createElement("div");
				div_8 = createElement("div");
				div_9 = createElement("div");
				button = createElement("button");
				raw_1_after = createElement('noscript');
				text_14 = createText("… ");
				span = createElement("span");
				text_16 = createText("\n                        ");
				ul = createElement("ul");
				li = createElement("li");
				a_2 = createElement("a");

				for (var i_5 = 0; i_5 < each_blocks.length; i_5 += 1) {
					each_blocks[i_5].c();
				}

				text_19 = createText("\n\n                ");
				div_10 = createElement("div");
				i_2 = createElement("i");
				text_20 = createText("\n                    ");
				div_11 = createElement("div");
				input = createElement("input");
				text_21 = createText("\n                        ");
				if (if_block_2) if_block_2.c();
				text_23 = createText("\n\n                    ");
				if (if_block_3) if_block_3.c();
				text_26 = createText("\n\n            ");
				handsontable._fragment.c();
				text_27 = createText("\n\n            ");
				div_12 = createElement("div");
				button_1 = createElement("button");
				img_1 = createElement("img");
				text_28 = createText(" ");
				text_29 = createText(text_29_value);
				text_30 = createText("\n\n                ");
				button_2 = createElement("button");
				i_3 = createElement("i");
				text_31 = createText(" ");
				text_32 = createText(text_32_value);
				text_33 = createText("…");
				text_34 = createText("\n\n                ");
				button_3 = createElement("button");
				i_4 = createElement("i");
				text_35 = createText(" ");
				text_36 = createText(text_36_value);
				text_37 = createText("...");
				this.h();
			},

			h: function hydrate() {
				i.className = "icon-chevron-left";
				a.className = "btn submit";
				a.href = "upload";
				i_1.className = "icon-chevron-right icon-white";
				a_1.href = "visualize";
				a_1.className = "submit btn btn-primary";
				a_1.id = "describe-proceed";
				div_4.className = "btn-group";
				div_3.className = "sidebar";
				div_2.className = "span4";
				img.src = "/static/img/arrow.svg";
				div_6.className = "help svelte-1kvuoqm";
				span.className = "caret";
				button.className = "btn dropdown-toggle";
				button.dataset.toggle = "dropdown";
				addListener(a_2, "click", click_handler);
				a_2.href = "#s";
				a_2.className = "svelte-1kvuoqm";
				li.className = li_class_value = '-'==state.sortBy?'active':'';
				ul.className = "dropdown-menu sort-menu";
				div_9.className = "btn-group";
				div_8.className = "sort-box svelte-1kvuoqm";
				i_2.className = "im im-magnifier svelte-1kvuoqm";
				addListener(input, "input", input_input_handler);
				addListener(input, "keypress", keypress_handler);
				input.autocomplete = "screw-you-google-chrome";
				setAttribute(input, "type", "search");
				input.placeholder = input_placeholder_value = __('Search data table');
				input.className = input_class_value = "" + (state.searchResults.length > 0?'with-results':'') + " search-query" + " svelte-1kvuoqm";
				div_11.className = div_11_class_value = state.searchResults.length > 0 ? 'input-append' : '';
				div_10.className = "search-box form-search svelte-1kvuoqm";
				div_7.className = "pull-right";
				setStyle(div_7, "margin-bottom", "10px");
				img_1.src = "/static/css/chart-editor/transpose.png";
				img_1.className = "svelte-1kvuoqm";
				addListener(button_1, "click", click_handler_3);
				button_1.className = "btn transpose svelte-1kvuoqm";
				i_3.className = "fa fa-calculator";
				addListener(button_2, "click", click_handler_4);
				button_2.className = "btn computed-columns";
				i_4.className = "fa fa-undo";
				addListener(button_3, "click", click_handler_5);
				button_3.className = button_3_class_value = "btn " + (state.has_changes?'':'disabled') + " svelte-1kvuoqm";
				button_3.id = "reset-data-changes";
				div_12.className = "buttons below-table pull-right svelte-1kvuoqm";
				div_5.className = "span8 svelte-1kvuoqm";
				div_1.className = "row";
				div.className = "chart-editor";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(div_2, div_1);
				appendNode(div_3, div_2);
				if_block.m(div_3, null);
				appendNode(text, div_3);
				appendNode(hr, div_3);
				appendNode(text_1, div_3);
				appendNode(div_4, div_3);
				appendNode(a, div_4);
				appendNode(i, a);
				appendNode(text_2, a);
				appendNode(text_3, a);
				appendNode(text_4, div_4);
				appendNode(a_1, div_4);
				appendNode(text_5, a_1);
				appendNode(text_6, a_1);
				appendNode(i_1, a_1);
				appendNode(text_10, div_1);
				appendNode(div_5, div_1);
				appendNode(div_6, div_5);
				appendNode(raw_after, div_6);
				raw_after.insertAdjacentHTML("beforebegin", raw_value);
				appendNode(text_11, div_6);
				appendNode(img, div_6);
				appendNode(text_13, div_5);
				appendNode(div_7, div_5);
				appendNode(div_8, div_7);
				appendNode(div_9, div_8);
				appendNode(button, div_9);
				appendNode(raw_1_after, button);
				raw_1_after.insertAdjacentHTML("beforebegin", raw_1_value);
				appendNode(text_14, button);
				appendNode(span, button);
				appendNode(text_16, div_9);
				appendNode(ul, div_9);
				appendNode(li, ul);
				appendNode(a_2, li);
				a_2.innerHTML = raw_2_value;

				for (var i_5 = 0; i_5 < each_blocks.length; i_5 += 1) {
					each_blocks[i_5].m(ul, null);
				}

				component.refs.sortDropdownGroup = div_9;
				appendNode(text_19, div_7);
				appendNode(div_10, div_7);
				appendNode(i_2, div_10);
				appendNode(text_20, div_10);
				appendNode(div_11, div_10);
				appendNode(input, div_11);
				component.refs.search = input;

				input.value = state.search;

				appendNode(text_21, div_11);
				if (if_block_2) if_block_2.m(div_11, null);
				appendNode(text_23, div_10);
				if (if_block_3) if_block_3.m(div_10, null);
				appendNode(text_26, div_5);
				handsontable._mount(div_5, null);
				appendNode(text_27, div_5);
				appendNode(div_12, div_5);
				appendNode(button_1, div_12);
				appendNode(img_1, button_1);
				appendNode(text_28, button_1);
				appendNode(text_29, button_1);
				appendNode(text_30, div_12);
				appendNode(button_2, div_12);
				appendNode(i_3, button_2);
				appendNode(text_31, button_2);
				appendNode(text_32, button_2);
				appendNode(text_33, button_2);
				appendNode(text_34, div_12);
				appendNode(button_3, div_12);
				appendNode(i_4, button_3);
				appendNode(text_35, button_3);
				appendNode(text_36, button_3);
				appendNode(text_37, button_3);
			},

			p: function update(changed, state) {
				if (current_block_type === (current_block_type = select_block_type_1(state)) && if_block) {
					if_block.p(changed, state);
				} else {
					if_block.u();
					if_block.d();
					if_block = current_block_type(component, state);
					if_block.c();
					if_block.m(div_3, text);
				}

				if ((changed.sortBy) && li_class_value !== (li_class_value = '-'==state.sortBy?'active':'')) {
					li.className = li_class_value;
				}

				var each_value_1 = state.columns;

				if (changed.columns || changed.sortBy) {
					for (var i_5 = 0; i_5 < each_value_1.length; i_5 += 1) {
						var each_context = assign(assign({}, state), {
							each_value_1: each_value_1,
							col: each_value_1[i_5],
							col_index: i_5
						});

						if (each_blocks[i_5]) {
							each_blocks[i_5].p(changed, each_context);
						} else {
							each_blocks[i_5] = create_each_block_1$2(component, each_context);
							each_blocks[i_5].c();
							each_blocks[i_5].m(ul, null);
						}
					}

					for (; i_5 < each_blocks.length; i_5 += 1) {
						each_blocks[i_5].u();
						each_blocks[i_5].d();
					}
					each_blocks.length = each_value_1.length;
				}

				if (!input_updating) input.value = state.search;
				if ((changed.searchResults) && input_class_value !== (input_class_value = "" + (state.searchResults.length > 0?'with-results':'') + " search-query" + " svelte-1kvuoqm")) {
					input.className = input_class_value;
				}

				if (state.searchResults.length > 0) {
					if (!if_block_2) {
						if_block_2 = create_if_block_7(component, state);
						if_block_2.c();
						if_block_2.m(div_11, null);
					}
				} else if (if_block_2) {
					if_block_2.u();
					if_block_2.d();
					if_block_2 = null;
				}

				if ((changed.searchResults) && div_11_class_value !== (div_11_class_value = state.searchResults.length > 0 ? 'input-append' : '')) {
					div_11.className = div_11_class_value;
				}

				if (state.search) {
					if (if_block_3) {
						if_block_3.p(changed, state);
					} else {
						if_block_3 = create_if_block_8(component, state);
						if_block_3.c();
						if_block_3.m(div_10, null);
					}
				} else if (if_block_3) {
					if_block_3.u();
					if_block_3.d();
					if_block_3 = null;
				}

				var handsontable_changes = {};
				if (!handsontable_updating.data && changed.chartData) {
					handsontable_changes.data = state.chartData;
					handsontable_updating.data = true;
				}
				if (!handsontable_updating.transpose && changed.transpose) {
					handsontable_changes.transpose = state.transpose
	                ;
					handsontable_updating.transpose = true;
				}
				if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
					handsontable_changes.firstRowIsHeader = state.firstRowIsHeader
	                ;
					handsontable_updating.firstRowIsHeader = true;
				}
				if (!handsontable_updating.activeColumn && changed.activeColumn) {
					handsontable_changes.activeColumn = state.activeColumn
	                ;
					handsontable_updating.activeColumn = true;
				}
				if (!handsontable_updating.readonly && changed.readonly) {
					handsontable_changes.readonly = state.readonly
	                ;
					handsontable_updating.readonly = true;
				}
				if (!handsontable_updating.sorting && changed.sorting) {
					handsontable_changes.sorting = state.sorting
	                ;
					handsontable_updating.sorting = true;
				}
				if (!handsontable_updating.search && changed.search) {
					handsontable_changes.search = state.search
	                ;
					handsontable_updating.search = true;
				}
				if (!handsontable_updating.searchResults && changed.searchResults) {
					handsontable_changes.searchResults = state.searchResults
	                ;
					handsontable_updating.searchResults = true;
				}
				if (!handsontable_updating.searchIndex && changed.searchIndex) {
					handsontable_changes.searchIndex = state.searchIndex
	                ;
					handsontable_updating.searchIndex = true;
				}
				if (!handsontable_updating.multiSelection && changed.multiSelection) {
					handsontable_changes.multiSelection = state.multiSelection
	                ;
					handsontable_updating.multiSelection = true;
				}
				handsontable._set(handsontable_changes);
				handsontable_updating = {};

				if ((changed.has_changes) && button_3_class_value !== (button_3_class_value = "btn " + (state.has_changes?'':'disabled') + " svelte-1kvuoqm")) {
					button_3.className = button_3_class_value;
				}
			},

			u: function unmount() {
				detachBefore(raw_after);

				detachBefore(raw_1_after);

				a_2.innerHTML = '';

				detachNode(div);
				if_block.u();

				for (var i_5 = 0; i_5 < each_blocks.length; i_5 += 1) {
					each_blocks[i_5].u();
				}

				if (if_block_2) if_block_2.u();
				if (if_block_3) if_block_3.u();
			},

			d: function destroy$$1() {
				if_block.d();
				removeListener(a_2, "click", click_handler);

				destroyEach(each_blocks);

				if (component.refs.sortDropdownGroup === div_9) component.refs.sortDropdownGroup = null;
				removeListener(input, "input", input_input_handler);
				removeListener(input, "keypress", keypress_handler);
				if (component.refs.search === input) component.refs.search = null;
				if (if_block_2) if_block_2.d();
				if (if_block_3) if_block_3.d();
				handsontable.destroy(false);
				if (component.refs.hot === handsontable) component.refs.hot = null;
				removeListener(button_1, "click", click_handler_3);
				removeListener(button_2, "click", click_handler_4);
				removeListener(button_3, "click", click_handler_5);
			}
		};
	}

	// (26:20) {#if columnFormat.isComputed}
	function create_if_block_3(component, state) {
		var button, i, text, text_1_value = __("describe / edit-formula"), text_1;

		function click_handler(event) {
			component.force(event, false);
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text = createText(" ");
				text_1 = createText(text_1_value);
				this.h();
			},

			h: function hydrate() {
				i.className = "fa  fa-chevron-left";
				addListener(button, "click", click_handler);
				button.className = "btn";
			},

			m: function mount(target, anchor) {
				insertNode(button, target, anchor);
				appendNode(i, button);
				appendNode(text, button);
				appendNode(text_1, button);
			},

			u: function unmount() {
				detachNode(button);
			},

			d: function destroy$$1() {
				removeListener(button, "click", click_handler);
			}
		};
	}

	// (7:16) {#if customColumn}
	function create_if_block_1$2(component, state) {
		var computedcolumneditor_updating = {}, text, button, text_1_value = __("describe / edit-format"), text_1;

		var computedcolumneditor_initial_data = {};
		if ('customColumn' in state) {
			computedcolumneditor_initial_data.column = state.customColumn;
			computedcolumneditor_updating.column = true;
		}
		if ('columns' in state) {
			computedcolumneditor_initial_data.columns = state.columns ;
			computedcolumneditor_updating.columns = true;
		}
		var computedcolumneditor = new ComputedColumnEditor({
			root: component.root,
			data: computedcolumneditor_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!computedcolumneditor_updating.column && changed.column) {
					newState.customColumn = childState.column;
				}

				if (!computedcolumneditor_updating.columns && changed.columns) {
					newState.columns = childState.columns;
				}
				component._set(newState);
				computedcolumneditor_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			computedcolumneditor._bind({ column: 1, columns: 1 }, computedcolumneditor.get());
		});

		computedcolumneditor.on("updateTable", function(event) {
			component.refs.hot.update();
		});
		computedcolumneditor.on("renderTable", function(event) {
			component.refs.hot.render();
		});
		computedcolumneditor.on("unselect", function(event) {
			component.set({activeColumn:false});
		});

		function click_handler(event) {
			component.force(event, true);
		}

		return {
			c: function create() {
				computedcolumneditor._fragment.c();
				text = createText("\n\n                ");
				button = createElement("button");
				text_1 = createText(text_1_value);
				this.h();
			},

			h: function hydrate() {
				addListener(button, "click", click_handler);
				button.className = "btn";
			},

			m: function mount(target, anchor) {
				computedcolumneditor._mount(target, anchor);
				insertNode(text, target, anchor);
				insertNode(button, target, anchor);
				appendNode(text_1, button);
			},

			p: function update(changed, state) {
				var computedcolumneditor_changes = {};
				if (!computedcolumneditor_updating.column && changed.customColumn) {
					computedcolumneditor_changes.column = state.customColumn;
					computedcolumneditor_updating.column = true;
				}
				if (!computedcolumneditor_updating.columns && changed.columns) {
					computedcolumneditor_changes.columns = state.columns ;
					computedcolumneditor_updating.columns = true;
				}
				computedcolumneditor._set(computedcolumneditor_changes);
				computedcolumneditor_updating = {};
			},

			u: function unmount() {
				computedcolumneditor._unmount();
				detachNode(text);
				detachNode(button);
			},

			d: function destroy$$1() {
				computedcolumneditor.destroy(false);
				removeListener(button, "click", click_handler);
			}
		};
	}

	// (18:38) 
	function create_if_block_2(component, state) {
		var customcolumnformat_updating = {}, text, if_block_anchor;

		var customcolumnformat_initial_data = {};
		if ('columnFormat' in state) {
			customcolumnformat_initial_data.column = state.columnFormat;
			customcolumnformat_updating.column = true;
		}
		if ('columns' in state) {
			customcolumnformat_initial_data.columns = state.columns ;
			customcolumnformat_updating.columns = true;
		}
		var customcolumnformat = new CustomColumnFormat({
			root: component.root,
			data: customcolumnformat_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!customcolumnformat_updating.column && changed.column) {
					newState.columnFormat = childState.column;
				}

				if (!customcolumnformat_updating.columns && changed.columns) {
					newState.columns = childState.columns;
				}
				component._set(newState);
				customcolumnformat_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			customcolumnformat._bind({ column: 1, columns: 1 }, customcolumnformat.get());
		});

		customcolumnformat.on("updateTable", function(event) {
			component.refs.hot.update();
		});
		customcolumnformat.on("renderTable", function(event) {
			component.refs.hot.render();
		});

		var if_block = (state.columnFormat.isComputed) && create_if_block_3(component, state);

		return {
			c: function create() {
				customcolumnformat._fragment.c();
				text = createText("\n\n                    ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				customcolumnformat._mount(target, anchor);
				insertNode(text, target, anchor);
				if (if_block) if_block.m(target, anchor);
				insertNode(if_block_anchor, target, anchor);
			},

			p: function update(changed, state) {
				var customcolumnformat_changes = {};
				if (!customcolumnformat_updating.column && changed.columnFormat) {
					customcolumnformat_changes.column = state.columnFormat;
					customcolumnformat_updating.column = true;
				}
				if (!customcolumnformat_updating.columns && changed.columns) {
					customcolumnformat_changes.columns = state.columns ;
					customcolumnformat_updating.columns = true;
				}
				customcolumnformat._set(customcolumnformat_changes);
				customcolumnformat_updating = {};

				if (state.columnFormat.isComputed) {
					if (!if_block) {
						if_block = create_if_block_3(component, state);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}
			},

			u: function unmount() {
				customcolumnformat._unmount();
				detachNode(text);
				if (if_block) if_block.u();
				detachNode(if_block_anchor);
			},

			d: function destroy$$1() {
				customcolumnformat.destroy(false);
				if (if_block) if_block.d();
			}
		};
	}

	// (32:16) {#if activeColumn.type() == 'number'}
	function create_if_block_4(component, state) {
		var histogram_updating = {};

		var histogram_initial_data = {};
		if ('activeValues' in state) {
			histogram_initial_data.values = state.activeValues;
			histogram_updating.values = true;
		}
		if ('activeFormat' in state) {
			histogram_initial_data.format = state.activeFormat;
			histogram_updating.format = true;
		}
		var histogram = new Histogram({
			root: component.root,
			data: histogram_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!histogram_updating.values && changed.values) {
					newState.activeValues = childState.values;
				}

				if (!histogram_updating.format && changed.format) {
					newState.activeFormat = childState.format;
				}
				component._set(newState);
				histogram_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			histogram._bind({ values: 1, format: 1 }, histogram.get());
		});

		return {
			c: function create() {
				histogram._fragment.c();
			},

			m: function mount(target, anchor) {
				histogram._mount(target, anchor);
			},

			p: function update(changed, state) {
				var histogram_changes = {};
				if (!histogram_updating.values && changed.activeValues) {
					histogram_changes.values = state.activeValues;
					histogram_updating.values = true;
				}
				if (!histogram_updating.format && changed.activeFormat) {
					histogram_changes.format = state.activeFormat;
					histogram_updating.format = true;
				}
				histogram._set(histogram_changes);
				histogram_updating = {};
			},

			u: function unmount() {
				histogram._unmount();
			},

			d: function destroy$$1() {
				histogram.destroy(false);
			}
		};
	}

	// (68:20) {#each locales as locale}
	function create_each_block$3(component, state) {
		var locale = state.locale, each_value = state.each_value, locale_index = state.locale_index;
		var option, text_value = locale.label, text, text_1, text_2_value = locale.value, text_2, text_3, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				text_1 = createText(" (");
				text_2 = createText(text_2_value);
				text_3 = createText(")");
				this.h();
			},

			h: function hydrate() {
				option.__value = option_value_value = locale.value;
				option.value = option.__value;
			},

			m: function mount(target, anchor) {
				insertNode(option, target, anchor);
				appendNode(text, option);
				appendNode(text_1, option);
				appendNode(text_2, option);
				appendNode(text_3, option);
			},

			p: function update(changed, state) {
				locale = state.locale;
				each_value = state.each_value;
				locale_index = state.locale_index;
				if ((changed.locales) && text_value !== (text_value = locale.label)) {
					text.data = text_value;
				}

				if ((changed.locales) && text_2_value !== (text_2_value = locale.value)) {
					text_2.data = text_2_value;
				}

				if ((changed.locales) && option_value_value !== (option_value_value = locale.value)) {
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

	// (6:12) {#if activeColumn}
	function create_if_block$3(component, state) {
		var text, if_block_2_anchor;

		function select_block_type(state) {
			if (state.customColumn) return create_if_block_1$2;
			if (state.columnFormat) return create_if_block_2;
			return null;
		}

		var current_block_type = select_block_type(state);
		var if_block = current_block_type && current_block_type(component, state);

		var if_block_2 = (state.activeColumn.type() == 'number') && create_if_block_4(component, state);

		return {
			c: function create() {
				if (if_block) if_block.c();
				text = createText("\n\n                ");
				if (if_block_2) if_block_2.c();
				if_block_2_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insertNode(text, target, anchor);
				if (if_block_2) if_block_2.m(target, anchor);
				insertNode(if_block_2_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
					if_block.p(changed, state);
				} else {
					if (if_block) {
						if_block.u();
						if_block.d();
					}
					if_block = current_block_type && current_block_type(component, state);
					if (if_block) if_block.c();
					if (if_block) if_block.m(text.parentNode, text);
				}

				if (state.activeColumn.type() == 'number') {
					if (if_block_2) {
						if_block_2.p(changed, state);
					} else {
						if_block_2 = create_if_block_4(component, state);
						if_block_2.c();
						if_block_2.m(if_block_2_anchor.parentNode, if_block_2_anchor);
					}
				} else if (if_block_2) {
					if_block_2.u();
					if_block_2.d();
					if_block_2 = null;
				}
			},

			u: function unmount() {
				if (if_block) if_block.u();
				detachNode(text);
				if (if_block_2) if_block_2.u();
				detachNode(if_block_2_anchor);
			},

			d: function destroy$$1() {
				if (if_block) if_block.d();
				if (if_block_2) if_block_2.d();
			}
		};
	}

	// (36:36) 
	function create_if_block_5(component, state) {
		var h3, text_value = __("describe / show-hide-multi"), text, text_1, ul, li, button, i, text_2, text_3_value = __("describe / show-selected"), text_3, li_1, button_1, i_1, text_6, text_7_value = __("describe / hide-selected"), text_7;

		function click_handler(event) {
			var state = component.get();
			component.hideMultiple(state.multiSelection, false);
		}

		function click_handler_1(event) {
			var state = component.get();
			component.hideMultiple(state.multiSelection, true);
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				text = createText(text_value);
				text_1 = createText("\n\n                ");
				ul = createElement("ul");
				li = createElement("li");
				button = createElement("button");
				i = createElement("i");
				text_2 = createText(" ");
				text_3 = createText(text_3_value);
				li_1 = createElement("li");
				button_1 = createElement("button");
				i_1 = createElement("i");
				text_6 = createText(" ");
				text_7 = createText(text_7_value);
				this.h();
			},

			h: function hydrate() {
				h3.className = "first";
				i.className = "fa fa-eye";
				addListener(button, "click", click_handler);
				button.className = "btn";
				setStyle(li, "margin-bottom", "5px");
				i_1.className = "fa fa-eye-slash";
				addListener(button_1, "click", click_handler_1);
				button_1.className = "btn";
				ul.className = "unstyled";
			},

			m: function mount(target, anchor) {
				insertNode(h3, target, anchor);
				appendNode(text, h3);
				insertNode(text_1, target, anchor);
				insertNode(ul, target, anchor);
				appendNode(li, ul);
				appendNode(button, li);
				appendNode(i, button);
				appendNode(text_2, button);
				appendNode(text_3, button);
				appendNode(li_1, ul);
				appendNode(button_1, li_1);
				appendNode(i_1, button_1);
				appendNode(text_6, button_1);
				appendNode(text_7, button_1);
			},

			p: noop,

			u: function unmount() {
				detachNode(h3);
				detachNode(text_1);
				detachNode(ul);
			},

			d: function destroy$$1() {
				removeListener(button, "click", click_handler);
				removeListener(button_1, "click", click_handler_1);
			}
		};
	}

	// (53:12) {:else}
	function create_if_block_6(component, state) {
		var h3, text_value = __("Make sure the data looks right"), text, text_1, p, text_2_value = __("Please make sure that Datawrapper interprets your data correctly. In the table columns should be shown in blue, dates in green and text in black."), text_2, text_3, checkbox_updating = {}, text_4, h4, text_5_value = __("describe / locale-select / hed"), text_5, text_6, p_1, text_7_value = __("describe / locale-select / body"), text_7, text_8, select, select_updating = false;

		var checkbox_initial_data = { label: __("First row as label") };
		if ('firstRowIsHeader' in state) {
			checkbox_initial_data.value = state.firstRowIsHeader;
			checkbox_updating.value = true;
		}
		var checkbox = new Checkbox({
			root: component.root,
			data: checkbox_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!checkbox_updating.value && changed.value) {
					newState.firstRowIsHeader = childState.value;
				}
				component._set(newState);
				checkbox_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			checkbox._bind({ value: 1 }, checkbox.get());
		});

		var each_value = state.locales;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, assign(assign({}, state), {
				each_value: each_value,
				locale: each_value[i],
				locale_index: i
			}));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ locale: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				text = createText(text_value);
				text_1 = createText("\n\n                ");
				p = createElement("p");
				text_2 = createText(text_2_value);
				text_3 = createText("\n\n                ");
				checkbox._fragment.c();
				text_4 = createText("\n\n                ");
				h4 = createElement("h4");
				text_5 = createText(text_5_value);
				text_6 = createText("\n\n                ");
				p_1 = createElement("p");
				text_7 = createText(text_7_value);
				text_8 = createText("\n\n                ");
				select = createElement("select");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				this.h();
			},

			h: function hydrate() {
				h3.className = "first";
				addListener(select, "change", select_change_handler);
				if (!('locale' in state)) component.root._beforecreate.push(select_change_handler);
			},

			m: function mount(target, anchor) {
				insertNode(h3, target, anchor);
				appendNode(text, h3);
				insertNode(text_1, target, anchor);
				insertNode(p, target, anchor);
				appendNode(text_2, p);
				insertNode(text_3, target, anchor);
				checkbox._mount(target, anchor);
				insertNode(text_4, target, anchor);
				insertNode(h4, target, anchor);
				appendNode(text_5, h4);
				insertNode(text_6, target, anchor);
				insertNode(p_1, target, anchor);
				appendNode(text_7, p_1);
				insertNode(text_8, target, anchor);
				insertNode(select, target, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, state.locale);
			},

			p: function update(changed, state) {
				var checkbox_changes = {};
				checkbox_changes.label = __("First row as label");
				if (!checkbox_updating.value && changed.firstRowIsHeader) {
					checkbox_changes.value = state.firstRowIsHeader;
					checkbox_updating.value = true;
				}
				checkbox._set(checkbox_changes);
				checkbox_updating = {};

				var each_value = state.locales;

				if (changed.locales) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							locale: each_value[i],
							locale_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$3(component, each_context);
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

				if (!select_updating) selectOption(select, state.locale);
			},

			u: function unmount() {
				detachNode(h3);
				detachNode(text_1);
				detachNode(p);
				detachNode(text_3);
				checkbox._unmount();
				detachNode(text_4);
				detachNode(h4);
				detachNode(text_6);
				detachNode(p_1);
				detachNode(text_8);
				detachNode(select);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy$$1() {
				checkbox.destroy(false);

				destroyEach(each_blocks);

				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (98:28) {#each columns as col}
	function create_each_block_1$2(component, state) {
		var col = state.col, each_value_1 = state.each_value_1, col_index = state.col_index;
		var li, a, i, i_class_value, text, i_1, i_1_class_value, text_1, text_2_value = col.title(), text_2, a_href_value, li_class_value;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i = createElement("i");
				text = createText("\n                                ");
				i_1 = createElement("i");
				text_1 = createText("   ");
				text_2 = createText(text_2_value);
				this.h();
			},

			h: function hydrate() {
				addListener(i, "click", click_handler$1);
				i.className = i_class_value = "fa fa-sort-" + (col.type()=='text'?'alpha':'amount') + "-asc fa-fw" + " svelte-1kvuoqm";

				i._svelte = {
					component: component,
					each_value_1: state.each_value_1,
					col_index: state.col_index
				};

				addListener(i_1, "click", click_handler_1);
				i_1.className = i_1_class_value = "fa fa-sort-" + (col.type()=='text'?'alpha':'amount') + "-desc fa-fw" + " svelte-1kvuoqm";

				i_1._svelte = {
					component: component,
					each_value_1: state.each_value_1,
					col_index: state.col_index
				};

				addListener(a, "click", click_handler_2);
				a.href = a_href_value = "#/" + col.name();
				a.className = "svelte-1kvuoqm";

				a._svelte = {
					component: component,
					each_value_1: state.each_value_1,
					col_index: state.col_index
				};

				li.className = li_class_value = col.name()==state.sortBy?'active':'';
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				appendNode(a, li);
				appendNode(i, a);
				appendNode(text, a);
				appendNode(i_1, a);
				appendNode(text_1, a);
				appendNode(text_2, a);
			},

			p: function update(changed, state) {
				col = state.col;
				each_value_1 = state.each_value_1;
				col_index = state.col_index;
				if ((changed.columns) && i_class_value !== (i_class_value = "fa fa-sort-" + (col.type()=='text'?'alpha':'amount') + "-asc fa-fw" + " svelte-1kvuoqm")) {
					i.className = i_class_value;
				}

				i._svelte.each_value_1 = state.each_value_1;
				i._svelte.col_index = state.col_index;

				if ((changed.columns) && i_1_class_value !== (i_1_class_value = "fa fa-sort-" + (col.type()=='text'?'alpha':'amount') + "-desc fa-fw" + " svelte-1kvuoqm")) {
					i_1.className = i_1_class_value;
				}

				i_1._svelte.each_value_1 = state.each_value_1;
				i_1._svelte.col_index = state.col_index;

				if ((changed.columns) && text_2_value !== (text_2_value = col.title())) {
					text_2.data = text_2_value;
				}

				if ((changed.columns) && a_href_value !== (a_href_value = "#/" + col.name())) {
					a.href = a_href_value;
				}

				a._svelte.each_value_1 = state.each_value_1;
				a._svelte.col_index = state.col_index;

				if ((changed.columns || changed.sortBy) && li_class_value !== (li_class_value = col.name()==state.sortBy?'active':'')) {
					li.className = li_class_value;
				}
			},

			u: function unmount() {
				detachNode(li);
			},

			d: function destroy$$1() {
				removeListener(i, "click", click_handler$1);
				removeListener(i_1, "click", click_handler_1);
				removeListener(a, "click", click_handler_2);
			}
		};
	}

	// (111:24) {#if searchResults.length > 0}
	function create_if_block_7(component, state) {
		var div, button, text, button_1;

		function click_handler_3(event) {
			component.nextResult(-1);
		}

		function click_handler_4(event) {
			component.nextResult(+1);
		}

		return {
			c: function create() {
				div = createElement("div");
				button = createElement("button");
				button.innerHTML = "<i class=\"fa fa-chevron-up\"></i>";
				text = createText("\n                          ");
				button_1 = createElement("button");
				button_1.innerHTML = "<i class=\"fa fa-chevron-down\"></i>";
				this.h();
			},

			h: function hydrate() {
				addListener(button, "click", click_handler_3);
				button.className = "btn svelte-1kvuoqm";
				addListener(button_1, "click", click_handler_4);
				button_1.className = "btn svelte-1kvuoqm";
				div.className = "btn-group";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(button, div);
				appendNode(text, div);
				appendNode(button_1, div);
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy$$1() {
				removeListener(button, "click", click_handler_3);
				removeListener(button_1, "click", click_handler_4);
			}
		};
	}

	// (123:24) {#if searchResults.length > 0}
	function create_if_block_9(component, state) {
		var text_value = state.searchIndexSafe+1, text, text_1, text_2_value = __("describe / search / of"), text_2, text_3, text_4_value = state.searchResults.length, text_4, text_5, text_6_value = __("describe / search / results"), text_6;

		return {
			c: function create() {
				text = createText(text_value);
				text_1 = createText("\n                            ");
				text_2 = createText(text_2_value);
				text_3 = createText("\n                            ");
				text_4 = createText(text_4_value);
				text_5 = createText("\n                            ");
				text_6 = createText(text_6_value);
			},

			m: function mount(target, anchor) {
				insertNode(text, target, anchor);
				insertNode(text_1, target, anchor);
				insertNode(text_2, target, anchor);
				insertNode(text_3, target, anchor);
				insertNode(text_4, target, anchor);
				insertNode(text_5, target, anchor);
				insertNode(text_6, target, anchor);
			},

			p: function update(changed, state) {
				if ((changed.searchIndexSafe) && text_value !== (text_value = state.searchIndexSafe+1)) {
					text.data = text_value;
				}

				if ((changed.searchResults) && text_4_value !== (text_4_value = state.searchResults.length)) {
					text_4.data = text_4_value;
				}
			},

			u: function unmount() {
				detachNode(text);
				detachNode(text_1);
				detachNode(text_2);
				detachNode(text_3);
				detachNode(text_4);
				detachNode(text_5);
				detachNode(text_6);
			},

			d: noop
		};
	}

	// (128:40) 
	function create_if_block_10(component, state) {
		var text_value = __("describe / search / no-matches"), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insertNode(text, target, anchor);
			},

			p: noop,

			u: function unmount() {
				detachNode(text);
			},

			d: noop
		};
	}

	// (121:20) {#if search}
	function create_if_block_8(component, state) {
		var div;

		function select_block_type_2(state) {
			if (state.searchResults.length > 0) return create_if_block_9;
			if (state.search) return create_if_block_10;
			return null;
		}

		var current_block_type = select_block_type_2(state);
		var if_block = current_block_type && current_block_type(component, state);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block) if_block.c();
				this.h();
			},

			h: function hydrate() {
				div.className = "results svelte-1kvuoqm";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, state) {
				if (current_block_type === (current_block_type = select_block_type_2(state)) && if_block) {
					if_block.p(changed, state);
				} else {
					if (if_block) {
						if_block.u();
						if_block.d();
					}
					if_block = current_block_type && current_block_type(component, state);
					if (if_block) if_block.c();
					if (if_block) if_block.m(div, null);
				}
			},

			u: function unmount() {
				detachNode(div);
				if (if_block) if_block.u();
			},

			d: function destroy$$1() {
				if (if_block) if_block.d();
			}
		};
	}

	function click_handler$1(event) {
		var component = this._svelte.component;
		var each_value_1 = this._svelte.each_value_1, col_index = this._svelte.col_index, col = each_value_1[col_index];
		component.sort(event, col.name(), true);
	}

	function click_handler_1(event) {
		var component = this._svelte.component;
		var each_value_1 = this._svelte.each_value_1, col_index = this._svelte.col_index, col = each_value_1[col_index];
		component.sort(event, col.name(), false);
	}

	function click_handler_2(event) {
		var component = this._svelte.component;
		var each_value_1 = this._svelte.each_value_1, col_index = this._svelte.col_index, col = each_value_1[col_index];
		component.sort(event, col.name(), true);
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["dw_chart"]), data$6()), options.data);
		this.store._add(this, ["dw_chart"]);
		this._recompute({ searchIndex: 1, searchResults: 1, activeColumn: 1, forceColumnFormat: 1, $dw_chart: 1, sortBy: 1, sortDir: 1 }, this._state);
		if (!('searchIndex' in this._state)) console.warn("<App> was created without expected data property 'searchIndex'");
		if (!('searchResults' in this._state)) console.warn("<App> was created without expected data property 'searchResults'");
		if (!('activeColumn' in this._state)) console.warn("<App> was created without expected data property 'activeColumn'");
		if (!('forceColumnFormat' in this._state)) console.warn("<App> was created without expected data property 'forceColumnFormat'");
		if (!('$dw_chart' in this._state)) console.warn("<App> was created without expected data property '$dw_chart'");
		if (!('sortBy' in this._state)) console.warn("<App> was created without expected data property 'sortBy'");
		if (!('sortDir' in this._state)) console.warn("<App> was created without expected data property 'sortDir'");





		if (!('multiSelection' in this._state)) console.warn("<App> was created without expected data property 'multiSelection'");
		if (!('firstRowIsHeader' in this._state)) console.warn("<App> was created without expected data property 'firstRowIsHeader'");
		if (!('locale' in this._state)) console.warn("<App> was created without expected data property 'locale'");
		if (!('locales' in this._state)) console.warn("<App> was created without expected data property 'locales'");
		if (!('search' in this._state)) console.warn("<App> was created without expected data property 'search'");

		if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
		if (!('transpose' in this._state)) console.warn("<App> was created without expected data property 'transpose'");
		if (!('readonly' in this._state)) console.warn("<App> was created without expected data property 'readonly'");

		if (!('has_changes' in this._state)) console.warn("<App> was created without expected data property 'has_changes'");

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { searchIndex: 1, searchResults: 1, activeColumn: 1, forceColumnFormat: 1, $dw_chart: 1, sortBy: 1, sortDir: 1, customColumn: 1, columns: 1, columnFormat: 1, activeValues: 1, activeFormat: 1, multiSelection: 1, firstRowIsHeader: 1, locale: 1, locales: 1, search: 1, searchIndexSafe: 1, chartData: 1, transpose: 1, readonly: 1, sorting: 1, has_changes: 1 };
			oncreate$4.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$6(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$4);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('searchIndexSafe' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'searchIndexSafe'");
		if ('customColumn' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'customColumn'");
		if ('columnFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columnFormat'");
		if ('activeValues' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'activeValues'");
		if ('activeFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'activeFormat'");
		if ('columns' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columns'");
		if ('sorting' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'sorting'");
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.searchIndex || changed.searchResults) {
			if (this._differs(state.searchIndexSafe, (state.searchIndexSafe = searchIndexSafe(state)))) changed.searchIndexSafe = true;
		}

		if (changed.activeColumn || changed.forceColumnFormat) {
			if (this._differs(state.customColumn, (state.customColumn = customColumn(state)))) changed.customColumn = true;
			if (this._differs(state.columnFormat, (state.columnFormat = columnFormat(state)))) changed.columnFormat = true;
		}

		if (changed.activeColumn) {
			if (this._differs(state.activeValues, (state.activeValues = activeValues(state)))) changed.activeValues = true;
		}

		if (changed.activeColumn || changed.$dw_chart) {
			if (this._differs(state.activeFormat, (state.activeFormat = activeFormat(state)))) changed.activeFormat = true;
		}

		if (changed.activeColumn) {
			if (this._differs(state.columns, (state.columns = columns(state)))) changed.columns = true;
		}

		if (changed.sortBy || changed.sortDir) {
			if (this._differs(state.sorting, (state.sorting = sorting(state)))) changed.sorting = true;
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
			var state = {};
			for (var i = 0; i < props.length; i += 1) {
				var prop = props[i];
				state['$' + prop] = this._state[prop];
			}
			return state;
		},

		_remove: function(component) {
			var i = this._dependents.length;
			while (i--) {
				if (this._dependents[i].component === component) {
					this._dependents.splice(i, 1);
					return;
				}
			}
		},

		_sortComputedProperties: function() {
			var computed = this._computed;
			var sorted = this._sortedComputedProperties = [];
			var cycles;
			var visited = blankObject();

			function visit(key) {
				if (cycles[key]) {
					throw new Error('Cyclical dependency detected');
				}

				if (visited[key]) return;
				visited[key] = true;

				var c = computed[key];

				if (c) {
					cycles[key] = true;
					c.deps.forEach(visit);
					sorted.push(c);
				}
			}

			for (var key in this._computed) {
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
						if (dep in changed) dirty = true;
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
			var oldState = this._state,
				changed = this._changed = {},
				dirty = false;

			for (var key in newState) {
				if (this._computed[key]) throw new Error("'" + key + "' is a read-only property");
				if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
			}
			if (!dirty) return;

			this._state = assign(assign({}, oldState), newState);

			for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this._sortedComputedProperties[i].update(this._state, changed);
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
						componentState['$' + prop] = this._state[prop];
						dirty = true;
					}
				}

				if (dirty) dependent.component.set(componentState);
			}

			this.fire('update', {
				changed: changed,
				current: this._state,
				previous: oldState
			});
		}
	});

	const store = new Store({});

	const data$7 = {
	    chart: {
	        id: ''
	    },
	    readonly: false,
	    chartData: '',
	    transpose: false,
	    firstRowIsHeader: true,
	    skipRows: 0
	};

	var main = { App, store, data: data$7 };

	return main;

})));
