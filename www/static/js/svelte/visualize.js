(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/visualize', factory) :
	(global = global || self, global.visualize = factory());
}(this, (function () { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function append(target, node) {
		target.appendChild(node);
	}

	function insert(target, node, anchor) {
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

	function reinsertChildren(parent, target) {
		while (parent.firstChild) target.appendChild(parent.firstChild);
	}

	function reinsertAfter(before, target) {
		while (before.nextSibling) target.appendChild(before.nextSibling);
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createFragment() {
		return document.createDocumentFragment();
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function createComment() {
		return document.createComment('');
	}

	function addListener(node, event, handler, options) {
		node.addEventListener(event, handler, options);
	}

	function removeListener(node, event, handler, options) {
		node.removeEventListener(event, handler, options);
	}

	function setAttribute(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else node.setAttribute(attribute, value);
	}

	function setData(text, data) {
		text.data = '' + data;
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

	function toggleClass(element, name, toggle) {
		element.classList[toggle ? 'add' : 'remove'](name);
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = noop;

		this._fragment.d(detach !== false);
		this._fragment = null;
		this._state = {};
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

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function flush(component) {
		component._lock = true;
		callAll(component._beforecreate);
		callAll(component._oncreate);
		callAll(component._aftercreate);
		component._lock = false;
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._slots = blankObject();
		component._bind = options._bind;
		component._staged = {};

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;

		if (!options.root) {
			component._beforecreate = [];
			component._oncreate = [];
			component._aftercreate = [];
		}
	}

	function on(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		flush(this.root);
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		newState = assign(this._staged, newState);
		this._staged = {};

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

	function _stage(newState) {
		assign(this._staged, newState);
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

	function removeFromStore() {
		this.store._remove(this);
	}

	var protoDev = {
		destroy: destroyDev,
		get,
		fire,
		on,
		set: setDev,
		_recompute: noop,
		_set,
		_stage,
		_mount,
		_differs
	};

	/**
	 * Download and parse a remote JSON document. Use {@link httpReq} instead
	 *
	 * @deprecated
	 *
	 * @param {string} url
	 * @param {string} method - HTTP method, either GET, POST or PUT
	 * @param {string|undefined} credentials - set to "include" if cookies should be passed along CORS requests
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * import { fetchJSON } from '@datawrapper/shared/fetch';
	 * fetchJSON('http://api.example.org', 'GET', 'include');
	 */
	function fetchJSON(url, method, credentials, body, callback) {
	    var opts = {
	        method,
	        body,
	        mode: 'cors',
	        credentials
	    };

	    return window
	        .fetch(url, opts)
	        .then(res => {
	            if (!res.ok) throw new Error(res.statusText);
	            return res.text();
	        })
	        .then(text => {
	            try {
	                return JSON.parse(text);
	            } catch (Error) {
	                // could not parse json, so just return text
	                console.warn('malformed json input', text);
	                return text;
	            }
	        })
	        .then(res => {
	            if (callback) callback(res);
	            return res;
	        })
	        .catch(err => {
	            if (callback) {
	                console.error(err);
	            } else {
	                throw err;
	            }
	        });
	}

	/**
	 * Download and parse a JSON document via GET.
	 * Use {@link httpReq} or {@link httpReq.get} instead.
	 *
	 * @deprecated
	 *
	 * @param {string} url
	 * @param {string|undefined} credentials - optional, set to undefined to disable credentials
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * import { getJSON } from '@datawrapper/shared/fetch';
	 * // use it callback style
	 * getJSON('http://api.example.org', 'include', function(data) {
	 *     console.log(data);
	 * });
	 * // or promise-style
	 * getJSON('http://api.example.org')
	 *   .then(data => {
	 *      console.log(data);
	 *   });
	 */
	function getJSON(url, credentials, callback) {
	    if (arguments.length === 2 && typeof credentials === 'function') {
	        // swap callback and assume default credentials
	        callback = credentials;
	        credentials = 'include';
	    } else if (arguments.length === 1) {
	        credentials = 'include';
	    }
	    return fetchJSON(url, 'GET', credentials, null, callback);
	}

	/**
	 * injects a `<script>` element to the page to load a new JS script
	 *
	 * @param {string} src
	 * @param {function} callback
	 *
	 * @example
	 * import { loadScript } from '@datawrapper/shared/fetch';
	 *
	 * loadScript('/static/js/library.js', () => {
	 *     console.log('library is loaded');
	 * })
	 */
	function loadScript(src, callback = null) {
	    return new Promise((resolve, reject) => {
	        const script = document.createElement('script');
	        script.src = src;
	        script.onload = () => {
	            if (callback) callback();
	            resolve();
	        };
	        script.onerror = reject;
	        document.body.appendChild(script);
	    });
	}

	/**
	 * injects a `<link>` element to the page to load a new stylesheet
	 *
	 * @param {string} src
	 * @param {function} callback
	 *
	 * @example
	 * import { loadStylesheet } from '@datawrapper/shared/fetch';
	 *
	 * loadStylesheet('/static/css/library.css', () => {
	 *     console.log('library styles are loaded');
	 * })
	 */
	function loadStylesheet(src, callback = null) {
	    return new Promise((resolve, reject) => {
	        const link = document.createElement('link');
	        link.rel = 'stylesheet';
	        link.href = src;
	        link.onload = () => {
	            if (callback) callback();
	            resolve();
	        };
	        link.onerror = reject;
	        document.head.appendChild(link);
	    });
	}

	/* globals dw */

	let __messages = {};

	function initMessages(scope = 'core') {
	    // let's check if we're in a chart
	    if (scope === 'chart') {
	        if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
	            // use in-chart translations
	            __messages[scope] = window.__dw.vis.meta.locale || {};
	        }
	    } else {
	        // use backend translations
	        __messages[scope] =
	            scope === 'core'
	                ? dw.backend.__messages.core
	                : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
	    }
	}

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
	 * @param {string} key -- the key to be translated, e.g. "signup / hed"
	 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
	 * @returns {string} -- the translated text
	 */
	function __(key, scope = 'core') {
	    key = key.trim();
	    if (!__messages[scope]) initMessages(scope);
	    if (!__messages[scope][key]) return 'MISSING:' + key;
	    var translation = __messages[scope][key];

	    if (typeof translation === 'string' && arguments.length > 2) {
	        // replace $0, $1 etc with remaining arguments
	        translation = translation.replace(/\$(\d)/g, (m, i) => {
	            i = 2 + Number(i);
	            if (arguments[i] === undefined) return m;
	            return arguments[i];
	        });
	    }
	    return translation;
	}

	// Current version.
	var VERSION = '1.11.0';

	// Establish the root object, `window` (`self`) in the browser, `global`
	// on the server, or `this` in some virtual machines. We use `self`
	// instead of `window` for `WebWorker` support.
	var root = typeof self == 'object' && self.self === self && self ||
	          typeof global == 'object' && global.global === global && global ||
	          Function('return this')() ||
	          {};

	// Save bytes in the minified (but not gzipped) version:
	var ObjProto = Object.prototype;
	var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

	// Create quick reference variables for speed access to core prototypes.
	var toString = ObjProto.toString,
	    hasOwnProperty = ObjProto.hasOwnProperty;

	// Modern feature detection.
	var supportsArrayBuffer = typeof ArrayBuffer !== 'undefined';

	// All **ECMAScript 5+** native function implementations that we hope to use
	// are declared here.
	var nativeKeys = Object.keys,
	    nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;

	// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	// The largest integer that can be represented exactly.
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

	// If Underscore is called as a function, it returns a wrapped object that can
	// be used OO-style. This wrapper holds altered versions of all functions added
	// through `_.mixin`. Wrapped objects may be chained.
	function _$1(obj) {
	  if (obj instanceof _$1) return obj;
	  if (!(this instanceof _$1)) return new _$1(obj);
	  this._wrapped = obj;
	}

	_$1.VERSION = VERSION;

	// Extracts the result from a wrapped and chained object.
	_$1.prototype.value = function() {
	  return this._wrapped;
	};

	// Provide unwrapping proxies for some methods used in engine operations
	// such as arithmetic and JSON stringification.
	_$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value;

	_$1.prototype.toString = function() {
	  return String(this._wrapped);
	};

	// Internal helper to generate a function to obtain property `key` from `obj`.
	function shallowProperty(key) {
	  return function(obj) {
	    return obj == null ? void 0 : obj[key];
	  };
	}

	// Internal helper to obtain the `byteLength` property of an object.
	var getByteLength = shallowProperty('byteLength');

	// Internal function for creating a `toString`-based type tester.
	function tagTester(name) {
	  return function(obj) {
	    return toString.call(obj) === '[object ' + name + ']';
	  };
	}

	var isDataView = tagTester('DataView');

	// Predicate-generating function. Often useful outside of Underscore.
	function constant(value) {
	  return function() {
	    return value;
	  };
	}

	// Common internal logic for `isArrayLike` and `isBufferLike`.
	function createSizePropertyCheck(getSizeProperty) {
	  return function(collection) {
	    var sizeProperty = getSizeProperty(collection);
	    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
	  }
	}

	// Internal helper to determine whether we should spend extensive checks against
	// `ArrayBuffer` et al.
	var isBufferLike = createSizePropertyCheck(getByteLength);

	// Is a given value a typed array?
	var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
	function isTypedArray(obj) {
	  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
	  // Otherwise, fall back on the above regular expression.
	  return nativeIsView ? (nativeIsView(obj) && !isDataView(obj)) :
	                isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
	}

	var isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false);

	var isFunction = tagTester('Function');

	// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
	// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
	var nodelist = root.document && root.document.childNodes;
	if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
	  isFunction = function(obj) {
	    return typeof obj == 'function' || false;
	  };
	}

	var isFunction$1 = isFunction;

	// Is a given variable an object?
	function isObject(obj) {
	  var type = typeof obj;
	  return type === 'function' || type === 'object' && !!obj;
	}

	// Internal function to check whether `key` is an own property name of `obj`.
	function has(obj, key) {
	  return obj != null && hasOwnProperty.call(obj, key);
	}

	// Internal helper to create a simple lookup structure.
	// `collectNonEnumProps` used to depend on `_.contains`, but this led to
	// circular imports. `emulatedSet` is a one-off solution that only works for
	// arrays of strings.
	function emulatedSet(keys) {
	  var hash = {};
	  for (var l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
	  return {
	    contains: function(key) { return hash[key]; },
	    push: function(key) {
	      hash[key] = true;
	      return keys.push(key);
	    }
	  };
	}

	// Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
	// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
	// needed.
	function collectNonEnumProps(obj, keys) {
	  keys = emulatedSet(keys);
	  var nonEnumIdx = nonEnumerableProps.length;
	  var constructor = obj.constructor;
	  var proto = isFunction$1(constructor) && constructor.prototype || ObjProto;

	  // Constructor is a special case.
	  var prop = 'constructor';
	  if (has(obj, prop) && !keys.contains(prop)) keys.push(prop);

	  while (nonEnumIdx--) {
	    prop = nonEnumerableProps[nonEnumIdx];
	    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
	      keys.push(prop);
	    }
	  }
	}

	// Retrieve the names of an object's own properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`.
	function keys(obj) {
	  if (!isObject(obj)) return [];
	  if (nativeKeys) return nativeKeys(obj);
	  var keys = [];
	  for (var key in obj) if (has(obj, key)) keys.push(key);
	  // Ahem, IE < 9.
	  if (hasEnumBug) collectNonEnumProps(obj, keys);
	  return keys;
	}

	// Internal recursive comparison function for `_.isEqual`.
	function eq(a, b, aStack, bStack) {
	  // Identical objects are equal. `0 === -0`, but they aren't identical.
	  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
	  if (a === b) return a !== 0 || 1 / a === 1 / b;
	  // `null` or `undefined` only equal to itself (strict comparison).
	  if (a == null || b == null) return false;
	  // `NaN`s are equivalent, but non-reflexive.
	  if (a !== a) return b !== b;
	  // Exhaust primitive checks
	  var type = typeof a;
	  if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
	  return deepEq(a, b, aStack, bStack);
	}

	// Internal recursive comparison function for `_.isEqual`.
	function deepEq(a, b, aStack, bStack) {
	  // Unwrap any wrapped objects.
	  if (a instanceof _$1) a = a._wrapped;
	  if (b instanceof _$1) b = b._wrapped;
	  // Compare `[[Class]]` names.
	  var className = toString.call(a);
	  if (className !== toString.call(b)) return false;
	  switch (className) {
	    // These types are compared by value.
	    case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	    case '[object String]':
	      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	      // equivalent to `new String("5")`.
	      return '' + a === '' + b;
	    case '[object Number]':
	      // `NaN`s are equivalent, but non-reflexive.
	      // Object(NaN) is equivalent to NaN.
	      if (+a !== +a) return +b !== +b;
	      // An `egal` comparison is performed for other numeric values.
	      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	    case '[object Date]':
	    case '[object Boolean]':
	      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	      // millisecond representations. Note that invalid dates with millisecond representations
	      // of `NaN` are not equivalent.
	      return +a === +b;
	    case '[object Symbol]':
	      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
	    case '[object ArrayBuffer]':
	      // Coerce to `DataView` so we can fall through to the next case.
	      return deepEq(new DataView(a), new DataView(b), aStack, bStack);
	    case '[object DataView]':
	      var byteLength = getByteLength(a);
	      if (byteLength !== getByteLength(b)) {
	        return false;
	      }
	      while (byteLength--) {
	        if (a.getUint8(byteLength) !== b.getUint8(byteLength)) {
	          return false;
	        }
	      }
	      return true;
	  }

	  if (isTypedArray$1(a)) {
	    // Coerce typed arrays to `DataView`.
	    return deepEq(new DataView(a.buffer), new DataView(b.buffer), aStack, bStack);
	  }

	  var areArrays = className === '[object Array]';
	  if (!areArrays) {
	    if (typeof a != 'object' || typeof b != 'object') return false;

	    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	    // from different frames are.
	    var aCtor = a.constructor, bCtor = b.constructor;
	    if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor &&
	                             isFunction$1(bCtor) && bCtor instanceof bCtor)
	                        && ('constructor' in a && 'constructor' in b)) {
	      return false;
	    }
	  }
	  // Assume equality for cyclic structures. The algorithm for detecting cyclic
	  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	  // Initializing stack of traversed objects.
	  // It's done here since we only need them for objects and arrays comparison.
	  aStack = aStack || [];
	  bStack = bStack || [];
	  var length = aStack.length;
	  while (length--) {
	    // Linear search. Performance is inversely proportional to the number of
	    // unique nested structures.
	    if (aStack[length] === a) return bStack[length] === b;
	  }

	  // Add the first object to the stack of traversed objects.
	  aStack.push(a);
	  bStack.push(b);

	  // Recursively compare objects and arrays.
	  if (areArrays) {
	    // Compare array lengths to determine if a deep comparison is necessary.
	    length = a.length;
	    if (length !== b.length) return false;
	    // Deep compare the contents, ignoring non-numeric properties.
	    while (length--) {
	      if (!eq(a[length], b[length], aStack, bStack)) return false;
	    }
	  } else {
	    // Deep compare objects.
	    var _keys = keys(a), key;
	    length = _keys.length;
	    // Ensure that both objects contain the same number of properties before comparing deep equality.
	    if (keys(b).length !== length) return false;
	    while (length--) {
	      // Deep compare each member
	      key = _keys[length];
	      if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	    }
	  }
	  // Remove the first object from the stack of traversed objects.
	  aStack.pop();
	  bStack.pop();
	  return true;
	}

	// Perform a deep comparison to check if two objects are equal.
	function isEqual(a, b) {
	  return eq(a, b);
	}

	const TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	const COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	const defaultAllowed = '<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

	/**
	 * Remove all non-whitelisted html tags from the given string
	 *
	 * @exports purifyHTML
	 * @kind function
	 *
	 * @param {string} input - dirty html input
	 * @param {string} allowed - list of allowed tags, defaults to `<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>`
	 * @return {string} - the cleaned html output
	 */
	function purifyHTML(input, allowed) {
	    /*
	     * written by Kevin van Zonneveld et.al.
	     * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
	     */
	    if (input === null) return null;
	    if (input === undefined) return undefined;
	    input = String(input);
	    // strip tags
	    if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
	        return input;
	    }
	    input = stripTags(input, allowed);
	    // remove all event attributes
	    if (typeof document === 'undefined') return input;
	    var d = document.createElement('div');
	    d.innerHTML = input;
	    var sel = d.querySelectorAll('*');
	    for (var i = 0; i < sel.length; i++) {
	        if (sel[i].nodeName.toLowerCase() === 'a') {
	            // special treatment for <a> elements
	            if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
	            sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
	        }
	        for (var j = 0; j < sel[i].attributes.length; j++) {
	            var attrib = sel[i].attributes[j];
	            if (attrib.specified) {
	                if (attrib.name.substr(0, 2) === 'on') sel[i].removeAttribute(attrib.name);
	            }
	        }
	    }
	    return d.innerHTML;
	}

	function stripTags(input, allowed) {
	    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	    allowed = (
	        ((allowed !== undefined ? allowed || '' : defaultAllowed) + '')
	            .toLowerCase()
	            .match(/<[a-z][a-z0-9]*>/g) || []
	    ).join('');

	    var before = input;
	    var after = input;
	    // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
	    while (true) {
	        before = after;
	        after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function($0, $1) {
	            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	        });
	        // return once no more tags are removed
	        if (before === after) {
	            return after;
	        }
	    }
	}

	/**
	 * Clones an object
	 *
	 * @exports clone
	 * @kind function
	 *
	 * @param {*} object - the thing that should be cloned
	 * @returns {*} - the cloned thing
	 */
	function clone(o) {
	    if (!o || typeof o !== 'object') return o;
	    try {
	        return JSON.parse(JSON.stringify(o));
	    } catch (e) {
	        return o;
	    }
	}

	/* Users/sjockers/Projects/datawrapper/controls/v2/editor/ChartPreview.html generated by Svelte v2.16.1 */



	let preview;
	let startX;
	let startY;
	let startWidth;
	let startHeight;

	// Declare how to handle changes in the chart's attributes:
	const UPDATE = ['title', 'metadata.describe', 'metadata.annotate.notes', 'metadata.custom'];
	const RELOAD = ['type', 'theme', 'language', 'metadata.data.transpose'];
	const RENDER = ['metadata.visualize', 'metadata.axes'];
	const IGNORE = ['metadata.visualize.text-annotations'];

	function url({ $id, src }) {
	    // eslint-disable-next-line
	    return src ? src : $id ? `/chart/${$id}/preview` : '';
	}
	function data() {
	    return {
	        src: false,
	        loading: true,
	        // resize logic
	        width: dw.backend.currentChart.get().metadata.publish['embed-width'],
	        height: dw.backend.currentChart.get().metadata.publish['embed-height'],
	        border: 10,
	        resizable: true,
	        resizing: false,
	        // inline editing
	        editable: true,
	        previousAttributes: {}
	    };
	}
	var methods = {
	    iframeLoaded() {
	        const { editable } = this.get();
	        if (editable) {
	            this.getContext((win, doc) => {
	                activateInlineEditing(doc, this.store);
	            });
	        }
	        this.set({ loading: false });
	        this.fire('iframeLoaded');
	    },

	    getContext(callback) {
	        const win = this.refs.iframe.contentWindow;
	        const doc = this.refs.iframe.contentDocument;

	        if (!win.__dw || !win.__dw.vis) {
	            return setTimeout(() => {
	                this.getContext(callback);
	            }, 50);
	        }

	        callback(win, doc);
	    },

	    updateChart() {
	        // Update title, intro, byline, etc. in chart preview:
	        this.getContext(win => {
	            win.__dwUpdate({ chart: this.store.serialize() });
	        });
	    },

	    renderChart({ key, value }) {
	        // Do not re-render in passive mode:
	        if (this.get().passiveMode) return;

	        // Figure out if re-rendering is really necessary:
	        let shouldRender = IGNORE.reduce((render, ignoredKeys) => {
	            if (this.hasChanged(ignoredKeys)) render = false;
	            return render;
	        }, this.hasChanged(key));

	        this.getContext(win => {
	            if (shouldRender) {
	                // Re-render chart with new attributes:
	                win.__dw.vis.chart().set(key, value);
	                win.__dw.vis.chart().load(win.__dw.params.data);
	                win.__dw.render();
	            }

	            // Clone attributes for checking whether there were changes:
	            this.set({
	                previousAttributes: clone(this.store.serialize())
	            });
	        });
	    },

	    reloadChart() {
	        // Do not reload in passive moder:
	        if (this.get().passiveMode) return;

	        // Set loading state:
	        this.set({ loading: true });
	        const reloadOnce = this.store.on('save', () => {
	            reloadOnce.cancel();
	            this.refs.iframe.contentWindow.location.reload();
	        });
	    },

	    hasChanged(key) {
	        let p0 = this.store.serialize();
	        let p1 = this.get().previousAttributes;
	        const keys = key.split('.');
	        keys.forEach(k => {
	            p0 = p0[k] || {};
	            p1 = p1[k] || {};
	        });
	        return !isEqual(p0, p1);
	    },

	    dragStart(event) {
	        startX = event.clientX;
	        startY = event.clientY;
	        startWidth = this.get().width;
	        startHeight = this.get().height;
	        this.set({ resizing: true });
	        this.fire('beforeResize');
	        window.document.addEventListener('mousemove', doDrag);
	        window.document.addEventListener('mouseup', stopDrag);
	    }
	};

	function oncreate() {
	    preview = this;

	    // Resize when chart wants to resize itself:
	    window.addEventListener('message', e => {
	        var message = e.data;
	        const { resizing } = this.get();
	        if (resizing) return;

	        if (typeof message['datawrapper-height'] !== 'undefined') {
	            var h;

	            for (var chartId in message['datawrapper-height']) {
	                h = message['datawrapper-height'][chartId];
	            }

	            this.set({ height: h });
	        }
	    });

	    // Observe change in attributes that require the chart wrapper to be updated:
	    UPDATE.forEach(key => {
	        this.store.observeDeep(key, this.updateChart.bind(this), { init: false });
	    });

	    // Observe change in attributes that require the iframe to reload:
	    RELOAD.forEach(key => {
	        this.store.observeDeep(key, this.reloadChart.bind(this), { init: false });
	    });

	    // Observe change in attributes that require the chart to re-render:
	    RENDER.forEach(key => {
	        this.store.observeDeep(key, value => this.renderChart({ key, value }), { init: false });
	    });
	}
	function onupdate({ changed, current }) {
	    // sync embed height and width
	    if (changed.width) {
	        this.store.setMetadata('publish.embed-width', current.width);
	    }
	    if (changed.height) {
	        this.store.setMetadata('publish.embed-height', current.height);
	    }
	}
	function doDrag(event) {
	    preview.set({
	        width: startWidth + (event.clientX - startX) * 2,
	        height: startHeight + event.clientY - startY
	    });
	    event.preventDefault();
	    return false;
	}

	function stopDrag() {
	    window.document.removeEventListener('mousemove', doDrag);
	    window.document.removeEventListener('mouseup', stopDrag);
	    preview.set({ resizing: false });
	    const { width, height } = preview.get();
	    const bbox = preview.refs.iframe.contentDocument.querySelector('.dw-chart-body').getBoundingClientRect();
	    const maxH = preview.refs.iframe.contentWindow.dw.utils.getMaxChartHeight();
	    const [chartWidth, chartHeight] = [bbox.width, maxH];
	    preview.fire('resize', { width, height, chartWidth, chartHeight });
	}

	function activateInlineEditing(doc, chart) {
	    makeElementEditable({
	        el: doc.querySelector('.headline-block .block-inner'),
	        updateContent(lbl) {
	            chart.set({ passiveMode: true });
	            chart.set({ title: lbl });
	            chart.set({ passiveMode: false });
	        }
	    });

	    makeElementEditable({
	        el: doc.querySelector('.description-block .block-inner'),
	        updateContent: sync('describe.intro')
	    });

	    makeElementEditable({
	        el: doc.querySelector('.notes-block .block-inner'),
	        updateContent: sync('annotate.notes')
	    });

	    function sync(key) {
	        return function(txt) {
	            chart.set({ passiveMode: true });
	            chart.setMetadata(key, txt);
	            chart.set({ passiveMode: false });
	        };
	    }

	    function makeElementEditable({ el, updateContent }) {
	        if (!el) return;
	        let lastValue = false;

	        el.setAttribute('contenteditable', true);

	        // Save old value for ESC key:
	        el.addEventListener('focus', () => {
	            lastValue = el.innerHTML;
	        });

	        // Revert last value when ESC is hit:
	        el.addEventListener('keydown', evt => {
	            if (evt.keyCode === 27) {
	                evt.preventDefault();
	                el.innerHTML = lastValue;
	                el.blur();
	            }
	        });

	        // Persist changes when edited element loses focus:
	        el.addEventListener('blur', () => {
	            el.innerHTML = el.innerHTML.replace(/(<br>)+$/g, ''); // Remove trailing line breaks
	            updateContent(purifyHTML(el.innerHTML));
	        });
	    }
	}

	const file = "Users/sjockers/Projects/datawrapper/controls/v2/editor/ChartPreview.html";

	function create_main_fragment(component, ctx) {
		var div2, div0, iframe, text0, text1, div1;

		function load_handler(event) {
			component.iframeLoaded(event);
		}

		var if_block = (ctx.resizable) && create_if_block(component);

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				iframe = createElement("iframe");
				text0 = createText("\n        ");
				if (if_block) if_block.c();
				text1 = createText("\n\n    ");
				div1 = createElement("div");
				addListener(iframe, "load", load_handler);
				iframe.title = "chart-preview";
				iframe.src = ctx.url;
				iframe.id = "iframe-vis";
				iframe.className = "svelte-13jlz0t";
				addLoc(iframe, file, 12, 8, 326);
				div0.id = "iframe-wrapper";
				setStyle(div0, "width", "" + ctx.width + "px");
				setStyle(div0, "height", "" + ctx.height + "px");
				setStyle(div0, "overflow", "visible");
				setStyle(div0, "padding", "" + ctx.border + "px");
				div0.className = "svelte-13jlz0t";
				toggleClass(div0, "loading", ctx.loading);
				toggleClass(div0, "resizable", ctx.resizable);
				toggleClass(div0, "resizing", ctx.resizing);
				addLoc(div0, file, 5, 4, 117);
				div1.id = "notifications";
				addLoc(div1, file, 20, 4, 636);
				setStyle(div2, "position", "relative");
				addLoc(div2, file, 4, 0, 71);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div0, iframe);
				component.refs.iframe = iframe;
				append(div0, text0);
				if (if_block) if_block.m(div0, null);
				append(div2, text1);
				append(div2, div1);
				component.refs.cont = div2;
			},

			p: function update(changed, ctx) {
				if (changed.url) {
					iframe.src = ctx.url;
				}

				if (ctx.resizable) {
					if (!if_block) {
						if_block = create_if_block(component);
						if_block.c();
						if_block.m(div0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.width) {
					setStyle(div0, "width", "" + ctx.width + "px");
				}

				if (changed.height) {
					setStyle(div0, "height", "" + ctx.height + "px");
				}

				if (changed.border) {
					setStyle(div0, "padding", "" + ctx.border + "px");
				}

				if (changed.loading) {
					toggleClass(div0, "loading", ctx.loading);
				}

				if (changed.resizable) {
					toggleClass(div0, "resizable", ctx.resizable);
				}

				if (changed.resizing) {
					toggleClass(div0, "resizing", ctx.resizing);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				removeListener(iframe, "load", load_handler);
				if (component.refs.iframe === iframe) component.refs.iframe = null;
				if (if_block) if_block.d();
				if (component.refs.cont === div2) component.refs.cont = null;
			}
		};
	}

	// (14:8) {#if resizable}
	function create_if_block(component, ctx) {
		var div, i;

		function mousedown_handler(event) {
			component.dragStart(event);
		}

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				i.className = "fa fa-arrows-h";
				addLoc(i, file, 15, 12, 560);
				addListener(div, "mousedown", mousedown_handler);
				setAttribute(div, "ref", "resizer");
				div.className = "resizer resizer-both";
				addLoc(div, file, 14, 8, 467);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(div, "mousedown", mousedown_handler);
			}
		};
	}

	function ChartPreview(options) {
		this._debugName = '<ChartPreview>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ChartPreview> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["id"]), data()), options.data);
		this.store._add(this, ["id"]);

		this._recompute({ $id: 1, src: 1 }, this._state);
		if (!('$id' in this._state)) console.warn("<ChartPreview> was created without expected data property '$id'");
		if (!('src' in this._state)) console.warn("<ChartPreview> was created without expected data property 'src'");
		if (!('width' in this._state)) console.warn("<ChartPreview> was created without expected data property 'width'");
		if (!('height' in this._state)) console.warn("<ChartPreview> was created without expected data property 'height'");
		if (!('border' in this._state)) console.warn("<ChartPreview> was created without expected data property 'border'");

		if (!('resizable' in this._state)) console.warn("<ChartPreview> was created without expected data property 'resizable'");
		this._intro = true;
		this._handlers.update = [onupdate];

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment(this, this._state);

		this.root._oncreate.push(() => {
			oncreate.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ChartPreview.prototype, protoDev);
	assign(ChartPreview.prototype, methods);

	ChartPreview.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('url' in newState && !this._updatingReadonlyProperty) throw new Error("<ChartPreview>: Cannot set read-only property 'url'");
	};

	ChartPreview.prototype._recompute = function _recompute(changed, state) {
		if (changed.$id || changed.src) {
			if (this._differs(state.url, (state.url = url(state)))) changed.url = true;
		}
	};

	/* visualize/TabNav.html generated by Svelte v2.16.1 */

	const allTabs = [
	    {
	        id: 'pick',
	        title: __('Chart type')
	    },
	    {
	        id: 'refine',
	        title: __('Refine')
	    },
	    {
	        id: 'annotate',
	        title: __('Annotate')
	    },
	    {
	        id: 'design',
	        title: __('Design')
	    }
	];

	function tabs({ showChartPicker }) {
	    return showChartPicker ? allTabs : allTabs.slice(1);
	}
	function data$1() {
	    return {
	        showChartPicker: true,
	        visLoading: false
	    };
	}
	function onstate({ changed, current, previous }) {
	    if (changed.tab && previous && current.tab) {
	        window.location.hash = '#' + current.tab;
	    }
	}
	const file$1 = "visualize/TabNav.html";

	function click_handler(event) {
		event.preventDefault();
		const { component, ctx } = this._svelte;

		component.set({tab:ctx.t.id});
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.t = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var div, ul;

		var each_value = ctx.tabs;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				ul.className = "nav nav-tabs visualize-nav-tabs";
				addLoc(ul, file$1, 1, 4, 39);
				setStyle(div, "margin-bottom", "20px");
				addLoc(div, file$1, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.tab || changed.tabs) {
					each_value = ctx.tabs;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (3:8) {#each tabs as t}
	function create_each_block(component, ctx) {
		var li, a, raw_value = ctx.t.title, a_href_value, text;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				text = createText("\n        ");
				a._svelte = { component, ctx };

				addListener(a, "click", click_handler);
				a.href = a_href_value = "#" + ctx.t.id;
				addLoc(a, file$1, 4, 12, 163);
				toggleClass(li, "active", ctx.tab === ctx.t.id);
				addLoc(li, file$1, 3, 8, 118);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				a.innerHTML = raw_value;
				append(li, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.tabs) && raw_value !== (raw_value = ctx.t.title)) {
					a.innerHTML = raw_value;
				}

				a._svelte.ctx = ctx;
				if ((changed.tabs) && a_href_value !== (a_href_value = "#" + ctx.t.id)) {
					a.href = a_href_value;
				}

				if ((changed.tab || changed.tabs)) {
					toggleClass(li, "active", ctx.tab === ctx.t.id);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	function TabNav(options) {
		this._debugName = '<TabNav>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);

		this._recompute({ showChartPicker: 1 }, this._state);
		if (!('showChartPicker' in this._state)) console.warn("<TabNav> was created without expected data property 'showChartPicker'");

		if (!('tab' in this._state)) console.warn("<TabNav> was created without expected data property 'tab'");
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$1(this, this._state);

		this.root._oncreate.push(() => {
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(TabNav.prototype, protoDev);

	TabNav.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('tabs' in newState && !this._updatingReadonlyProperty) throw new Error("<TabNav>: Cannot set read-only property 'tabs'");
	};

	TabNav.prototype._recompute = function _recompute(changed, state) {
		if (changed.showChartPicker) {
			if (this._differs(state.tabs, (state.tabs = tabs(state)))) changed.tabs = true;
		}
	};

	/* visualize/ButtonNav.html generated by Svelte v2.16.1 */

	function data$2() {
	    return {
	        showChartPicker: false
	    };
	}
	var methods$1 = {
	    back() {
	        const { tab, showChartPicker } = this.get();
	        if ((tab === 'refine' && !showChartPicker) || tab === 'pick')
	            window.location.href = 'describe';
	        else if (tab === 'refine' && showChartPicker) this.set({ tab: 'pick' });
	        else if (tab === 'annotate') this.set({ tab: 'refine' });
	        else if (tab === 'design') this.set({ tab: 'annotate' });
	    },
	    proceed() {
	        const { tab } = this.get();
	        if (tab === 'design') window.location.href = 'publish';
	        else if (tab === 'annotate') this.set({ tab: 'design' });
	        else if (tab === 'refine') this.set({ tab: 'annotate' });
	        else if (tab === 'pick') this.set({ tab: 'refine' });
	    }
	};

	const file$2 = "visualize/ButtonNav.html";

	function create_main_fragment$2(component, ctx) {
		var div, a0, i0, text0, text1_value = __("Back"), text1, text2, a1, text3_value = __("Proceed"), text3, text4, i1;

		function click_handler(event) {
			event.preventDefault();
			component.back();
		}

		function click_handler_1(event) {
			event.preventDefault();
			component.proceed();
		}

		return {
			c: function create() {
				div = createElement("div");
				a0 = createElement("a");
				i0 = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				text2 = createText("\n    ");
				a1 = createElement("a");
				text3 = createText(text3_value);
				text4 = createText(" ");
				i1 = createElement("i");
				i0.className = "fa fa-chevron-left fa-fw icon-btn-left";
				addLoc(i0, file$2, 2, 9, 138);
				addListener(a0, "click", click_handler);
				a0.className = "btn submitk";
				a0.href = "#back";
				addLoc(a0, file$2, 1, 4, 60);
				i1.className = "fa fa-chevron-right fa-fw icon-btn-right";
				addLoc(i1, file$2, 5, 25, 332);
				addListener(a1, "click", click_handler_1);
				a1.className = "btn submit btn-primary";
				a1.href = "#proceed";
				addLoc(a1, file$2, 4, 4, 220);
				div.className = "btn-group buttons";
				setStyle(div, "margin", "20px 0");
				addLoc(div, file$2, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, a0);
				append(a0, i0);
				append(a0, text0);
				append(a0, text1);
				append(div, text2);
				append(div, a1);
				append(a1, text3);
				append(a1, text4);
				append(a1, i1);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(a0, "click", click_handler);
				removeListener(a1, "click", click_handler_1);
			}
		};
	}

	function ButtonNav(options) {
		this._debugName = '<ButtonNav>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ButtonNav.prototype, protoDev);
	assign(ButtonNav.prototype, methods$1);

	ButtonNav.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* visualize/Empty.html generated by Svelte v2.16.1 */

	function create_main_fragment$3(component, ctx) {

		return {
			c: noop,

			m: noop,

			p: noop,

			d: noop
		};
	}

	function Empty(options) {
		this._debugName = '<Empty>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		this._intro = true;

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Empty.prototype, protoDev);

	Empty.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* globals dw */

	let __messages$1 = {};

	function initMessages$1(scope = 'core') {
	    // let's check if we're in a chart
	    if (scope === 'chart') {
	        if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
	            // use in-chart translations
	            __messages$1[scope] = window.__dw.vis.meta.locale || {};
	        }
	    } else {
	        // use backend translations
	        __messages$1[scope] =
	            scope === 'core'
	                ? dw.backend.__messages.core
	                : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
	    }
	}

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
	 * @param {string} key -- the key to be translated, e.g. "signup / hed"
	 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
	 * @returns {string} -- the translated text
	 */
	function __$1(key, scope = 'core') {
	    key = key.trim();
	    if (!__messages$1[scope]) initMessages$1(scope);
	    if (!__messages$1[scope][key]) return 'MISSING:' + key;
	    var translation = __messages$1[scope][key];

	    if (typeof translation === 'string' && arguments.length > 2) {
	        // replace $0, $1 etc with remaining arguments
	        translation = translation.replace(/\$(\d)/g, (m, i) => {
	            i = 2 + Number(i);
	            if (arguments[i] === undefined) return m;
	            return arguments[i];
	        });
	    }
	    return translation;
	}

	/* Users/sjockers/Projects/datawrapper/controls/v2/BaseText.html generated by Svelte v2.16.1 */

	const getScrollHeight = element => {
	    const actualHeight = element.style.height; // Store original height of element
	    element.style.height = 'auto'; // Set height to 'auto' in order to get actual scroll height
	    const scrollHeight = element.scrollHeight - 8; // Deduct 8px to account for padding & borders
	    element.style.height = actualHeight; // Reset to original height
	    return scrollHeight;
	};

	function data$3() {
	    return {
	        value: '',
	        id: '',
	        autocomplete: 'off',
	        disabled: false,
	        expandable: false,
	        placeholder: '',
	        width: '100%',
	        height: 20,
	        rows: 5
	    };
	}
	var methods$2 = {
	    resize(textarea) {
	        const { lineHeight } = window.getComputedStyle(textarea);
	        const maxHeight = parseInt(lineHeight) * this.get().rows;
	        const newHeight = getScrollHeight(textarea);
	        this.set({
	            height: maxHeight < newHeight ? maxHeight : newHeight,
	            scroll: maxHeight < newHeight
	        });
	    }
	};

	function oncreate$1() {
	    const { expandable } = this.get();
	    if (expandable) this.resize(this.refs.textarea);
	}
	const file$3 = "Users/sjockers/Projects/datawrapper/controls/v2/BaseText.html";

	function create_main_fragment$4(component, ctx) {
		var div;

		function select_block_type(ctx) {
			if (ctx.expandable) return create_if_block$1;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				div.className = "text-container svelte-7gynmf";
				setStyle(div, "width", ctx.width);
				addLoc(div, file$3, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div, null);
				}

				if (changed.width) {
					setStyle(div, "width", ctx.width);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block.d();
			}
		};
	}

	// (15:4) {:else}
	function create_else_block(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ value: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.id = ctx.id;
				input.disabled = ctx.disabled;
				input.placeholder = ctx.placeholder;
				input.autocomplete = ctx.autocomplete;
				input.className = "svelte-7gynmf";
				addLoc(input, file$3, 15, 4, 338);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.value ;
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.value) input.value = ctx.value ;
				if (changed.id) {
					input.id = ctx.id;
				}

				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.placeholder) {
					input.placeholder = ctx.placeholder;
				}

				if (changed.autocomplete) {
					input.autocomplete = ctx.autocomplete;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (2:4) {#if expandable}
	function create_if_block$1(component, ctx) {
		var textarea, textarea_updating = false;

		function textarea_input_handler() {
			textarea_updating = true;
			component.set({ value: textarea.value });
			textarea_updating = false;
		}

		function input_handler(event) {
			component.resize(event.target);
		}

		return {
			c: function create() {
				textarea = createElement("textarea");
				addListener(textarea, "input", textarea_input_handler);
				addListener(textarea, "input", input_handler);
				setStyle(textarea, "height", "" + ctx.height + "px");
				textarea.rows = "1";
				textarea.id = ctx.id;
				textarea.disabled = ctx.disabled;
				textarea.placeholder = ctx.placeholder;
				setAttribute(textarea, "autocomplete", ctx.autocomplete);
				textarea.className = "svelte-7gynmf";
				toggleClass(textarea, "scroll", ctx.scroll);
				addLoc(textarea, file$3, 2, 4, 76);
			},

			m: function mount(target, anchor) {
				insert(target, textarea, anchor);
				component.refs.textarea = textarea;

				textarea.value = ctx.value
	        ;
			},

			p: function update(changed, ctx) {
				if (!textarea_updating && changed.value) textarea.value = ctx.value
	        ;
				if (changed.height) {
					setStyle(textarea, "height", "" + ctx.height + "px");
				}

				if (changed.id) {
					textarea.id = ctx.id;
				}

				if (changed.disabled) {
					textarea.disabled = ctx.disabled;
				}

				if (changed.placeholder) {
					textarea.placeholder = ctx.placeholder;
				}

				if (changed.autocomplete) {
					setAttribute(textarea, "autocomplete", ctx.autocomplete);
				}

				if (changed.scroll) {
					toggleClass(textarea, "scroll", ctx.scroll);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(textarea);
				}

				removeListener(textarea, "input", textarea_input_handler);
				removeListener(textarea, "input", input_handler);
				if (component.refs.textarea === textarea) component.refs.textarea = null;
			}
		};
	}

	function BaseText(options) {
		this._debugName = '<BaseText>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$3(), options.data);
		if (!('width' in this._state)) console.warn("<BaseText> was created without expected data property 'width'");
		if (!('expandable' in this._state)) console.warn("<BaseText> was created without expected data property 'expandable'");
		if (!('value' in this._state)) console.warn("<BaseText> was created without expected data property 'value'");
		if (!('height' in this._state)) console.warn("<BaseText> was created without expected data property 'height'");
		if (!('id' in this._state)) console.warn("<BaseText> was created without expected data property 'id'");
		if (!('disabled' in this._state)) console.warn("<BaseText> was created without expected data property 'disabled'");
		if (!('placeholder' in this._state)) console.warn("<BaseText> was created without expected data property 'placeholder'");
		if (!('autocomplete' in this._state)) console.warn("<BaseText> was created without expected data property 'autocomplete'");
		this._intro = true;

		this._fragment = create_main_fragment$4(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$1.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(BaseText.prototype, protoDev);
	assign(BaseText.prototype, methods$2);

	BaseText.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/sjockers/Projects/datawrapper/controls/v2/BaseTextArea.html generated by Svelte v2.16.1 */

	function data$4() {
	    return {
	        id: '',
	        autocomplete: 'off',
	        placeholder: '',
	        width: '100%',
	        height: 'auto'
	    };
	}
	const file$4 = "Users/sjockers/Projects/datawrapper/controls/v2/BaseTextArea.html";

	function create_main_fragment$5(component, ctx) {
		var div, textarea, textarea_updating = false;

		function textarea_input_handler() {
			textarea_updating = true;
			component.set({ value: textarea.value });
			textarea_updating = false;
		}

		return {
			c: function create() {
				div = createElement("div");
				textarea = createElement("textarea");
				addListener(textarea, "input", textarea_input_handler);
				textarea.id = ctx.id;
				textarea.placeholder = ctx.placeholder;
				textarea.disabled = ctx.disabled;
				setAttribute(textarea, "autocomplete", ctx.autocomplete);
				setStyle(textarea, "height", ctx.height);
				textarea.className = "svelte-1t08y9k";
				addLoc(textarea, file$4, 1, 4, 59);
				div.className = "textarea-container svelte-1t08y9k";
				setStyle(div, "width", ctx.width);
				addLoc(div, file$4, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, textarea);

				textarea.value = ctx.value;
			},

			p: function update(changed, ctx) {
				if (!textarea_updating && changed.value) textarea.value = ctx.value;
				if (changed.id) {
					textarea.id = ctx.id;
				}

				if (changed.placeholder) {
					textarea.placeholder = ctx.placeholder;
				}

				if (changed.disabled) {
					textarea.disabled = ctx.disabled;
				}

				if (changed.autocomplete) {
					setAttribute(textarea, "autocomplete", ctx.autocomplete);
				}

				if (changed.height) {
					setStyle(textarea, "height", ctx.height);
				}

				if (changed.width) {
					setStyle(div, "width", ctx.width);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(textarea, "input", textarea_input_handler);
			}
		};
	}

	function BaseTextArea(options) {
		this._debugName = '<BaseTextArea>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$4(), options.data);
		if (!('width' in this._state)) console.warn("<BaseTextArea> was created without expected data property 'width'");
		if (!('value' in this._state)) console.warn("<BaseTextArea> was created without expected data property 'value'");
		if (!('id' in this._state)) console.warn("<BaseTextArea> was created without expected data property 'id'");
		if (!('placeholder' in this._state)) console.warn("<BaseTextArea> was created without expected data property 'placeholder'");
		if (!('disabled' in this._state)) console.warn("<BaseTextArea> was created without expected data property 'disabled'");
		if (!('autocomplete' in this._state)) console.warn("<BaseTextArea> was created without expected data property 'autocomplete'");
		if (!('height' in this._state)) console.warn("<BaseTextArea> was created without expected data property 'height'");
		this._intro = true;

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(BaseTextArea.prototype, protoDev);

	BaseTextArea.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/sjockers/Projects/datawrapper/controls/v2/editor/ChartDescription.html generated by Svelte v2.16.1 */





	const file$5 = "Users/sjockers/Projects/datawrapper/controls/v2/editor/ChartDescription.html";

	function create_main_fragment$6(component, ctx) {
		var div4, div0, label0, input, text0, text1_value = __$1('annotate / hide-title'), text1, text2, label1, text3_value = __$1('Title'), text3, text4, basetext0_updating = {}, text5, label2, text6_value = __$1('Description'), text6, text7, basetextarea_updating = {}, text8, label3, text9_value = __$1('Notes'), text9, text10, basetext1_updating = {}, text11, div3, div1, label4, text12_value = __$1('Source name'), text12, text13, basetext2_updating = {}, text14, div2, label5, text15_value = __$1('Source URL'), text15, text16, basetext3_updating = {}, text17, label6, text18_value = __$1('visualize / annotate / byline'), text18, text19, basetext4_updating = {};

		function input_change_handler() {
			var $ = component.store.get();
			ctx.$metadata.describe['hide-title'] = input.checked;
			component.store.set({ metadata: $.metadata });
		}

		var basetext0_initial_data = {
		 	autocomplete: "off",
		 	id: "text-title",
		 	expandable: true
		 };
		if (ctx.$title !== void 0) {
			basetext0_initial_data.value = ctx.$title;
			basetext0_updating.value = true;
		}
		var basetext0 = new BaseText({
			root: component.root,
			store: component.store,
			data: basetext0_initial_data,
			_bind(changed, childState) {
				var newStoreState = {};
				if (!basetext0_updating.value && changed.value) {
					newStoreState.title = childState.value;
				}
				component.store.set(newStoreState);
				basetext0_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			basetext0._bind({ value: 1 }, basetext0.get());
		});

		var basetextarea_initial_data = { id: "text-intro" };
		if (ctx.$metadata.describe.intro !== void 0) {
			basetextarea_initial_data.value = ctx.$metadata.describe.intro;
			basetextarea_updating.value = true;
		}
		var basetextarea = new BaseTextArea({
			root: component.root,
			store: component.store,
			data: basetextarea_initial_data,
			_bind(changed, childState) {
				var newStoreState = {};
				if (!basetextarea_updating.value && changed.value) {
					ctx.$metadata.describe.intro = childState.value;
					newStoreState.metadata = ctx.$metadata;
				}
				component.store.set(newStoreState);
				basetextarea_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			basetextarea._bind({ value: 1 }, basetextarea.get());
		});

		var basetext1_initial_data = { id: "text-notes", expandable: true };
		if (ctx.$metadata.annotate.notes !== void 0) {
			basetext1_initial_data.value = ctx.$metadata.annotate.notes;
			basetext1_updating.value = true;
		}
		var basetext1 = new BaseText({
			root: component.root,
			store: component.store,
			data: basetext1_initial_data,
			_bind(changed, childState) {
				var newStoreState = {};
				if (!basetext1_updating.value && changed.value) {
					ctx.$metadata.annotate.notes = childState.value;
					newStoreState.metadata = ctx.$metadata;
				}
				component.store.set(newStoreState);
				basetext1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			basetext1._bind({ value: 1 }, basetext1.get());
		});

		var basetext2_initial_data = {
		 	id: "text-source",
		 	expandable: true,
		 	placeholder: __$1('name of the organisation')
		 };
		if (ctx.$metadata.describe['source-name'] !== void 0) {
			basetext2_initial_data.value = ctx.$metadata.describe['source-name'];
			basetext2_updating.value = true;
		}
		var basetext2 = new BaseText({
			root: component.root,
			store: component.store,
			data: basetext2_initial_data,
			_bind(changed, childState) {
				var newStoreState = {};
				if (!basetext2_updating.value && changed.value) {
					ctx.$metadata.describe['source-name'] = childState.value;
					newStoreState.metadata = ctx.$metadata;
				}
				component.store.set(newStoreState);
				basetext2_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			basetext2._bind({ value: 1 }, basetext2.get());
		});

		var basetext3_initial_data = {
		 	id: "text-source-link",
		 	expandable: true,
		 	placeholder: __$1('URL of the dataset')
		 };
		if (ctx.$metadata.describe['source-url'] !== void 0) {
			basetext3_initial_data.value = ctx.$metadata.describe['source-url'];
			basetext3_updating.value = true;
		}
		var basetext3 = new BaseText({
			root: component.root,
			store: component.store,
			data: basetext3_initial_data,
			_bind(changed, childState) {
				var newStoreState = {};
				if (!basetext3_updating.value && changed.value) {
					ctx.$metadata.describe['source-url'] = childState.value;
					newStoreState.metadata = ctx.$metadata;
				}
				component.store.set(newStoreState);
				basetext3_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			basetext3._bind({ value: 1 }, basetext3.get());
		});

		var basetext4_initial_data = {
		 	id: "text-byline",
		 	expandable: true,
		 	placeholder: __$1('visualize / annotate / byline / placeholder')
		 };
		if (ctx.$metadata.describe.byline !== void 0) {
			basetext4_initial_data.value = ctx.$metadata.describe.byline;
			basetext4_updating.value = true;
		}
		var basetext4 = new BaseText({
			root: component.root,
			store: component.store,
			data: basetext4_initial_data,
			_bind(changed, childState) {
				var newStoreState = {};
				if (!basetext4_updating.value && changed.value) {
					ctx.$metadata.describe.byline = childState.value;
					newStoreState.metadata = ctx.$metadata;
				}
				component.store.set(newStoreState);
				basetext4_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			basetext4._bind({ value: 1 }, basetext4.get());
		});

		return {
			c: function create() {
				div4 = createElement("div");
				div0 = createElement("div");
				label0 = createElement("label");
				input = createElement("input");
				text0 = createText(" ");
				text1 = createText(text1_value);
				text2 = createText("\n\n        ");
				label1 = createElement("label");
				text3 = createText(text3_value);
				text4 = createText("\n        ");
				basetext0._fragment.c();
				text5 = createText("\n\n        ");
				label2 = createElement("label");
				text6 = createText(text6_value);
				text7 = createText("\n        ");
				basetextarea._fragment.c();
				text8 = createText("\n\n        ");
				label3 = createElement("label");
				text9 = createText(text9_value);
				text10 = createText("\n        ");
				basetext1._fragment.c();
				text11 = createText("\n\n    ");
				div3 = createElement("div");
				div1 = createElement("div");
				label4 = createElement("label");
				text12 = createText(text12_value);
				text13 = createText("\n            ");
				basetext2._fragment.c();
				text14 = createText("\n        ");
				div2 = createElement("div");
				label5 = createElement("label");
				text15 = createText(text15_value);
				text16 = createText("\n            ");
				basetext3._fragment.c();
				text17 = createText("\n\n    ");
				label6 = createElement("label");
				text18 = createText(text18_value);
				text19 = createText("\n    ");
				basetext4._fragment.c();
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "checkbox");
				setAttribute(input, "expandable", true);
				input.className = "svelte-ucg8ir";
				addLoc(input, file$5, 3, 12, 111);
				label0.className = "hide-title svelte-ucg8ir";
				addLoc(label0, file$5, 2, 8, 72);
				label1.className = "control-label svelte-ucg8ir";
				label1.htmlFor = "text-title";
				addLoc(label1, file$5, 6, 8, 258);
				label2.className = "control-label svelte-ucg8ir";
				label2.htmlFor = "text-intro";
				addLoc(label2, file$5, 9, 8, 422);
				label3.className = "control-label svelte-ucg8ir";
				label3.htmlFor = "text-notes";
				addLoc(label3, file$5, 12, 8, 584);
				setStyle(div0, "position", "relative");
				addLoc(div0, file$5, 1, 4, 30);
				label4.className = "control-label svelte-ucg8ir";
				label4.htmlFor = "text-source";
				addLoc(label4, file$5, 18, 12, 821);
				div1.className = "mr-1";
				addLoc(div1, file$5, 17, 8, 790);
				label5.className = "control-label svelte-ucg8ir";
				label5.htmlFor = "text-source-link";
				addLoc(label5, file$5, 22, 12, 1097);
				div2.className = "ml-1";
				addLoc(div2, file$5, 21, 8, 1066);
				div3.className = "control-split svelte-ucg8ir";
				addLoc(div3, file$5, 16, 4, 754);
				label6.className = "control-label svelte-ucg8ir";
				label6.htmlFor = "text-byline";
				addLoc(label6, file$5, 27, 4, 1352);
				div4.className = "story-title";
				addLoc(div4, file$5, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div0);
				append(div0, label0);
				append(label0, input);

				input.checked = ctx.$metadata.describe['hide-title'];

				append(label0, text0);
				append(label0, text1);
				append(div0, text2);
				append(div0, label1);
				append(label1, text3);
				append(div0, text4);
				basetext0._mount(div0, null);
				append(div0, text5);
				append(div0, label2);
				append(label2, text6);
				append(div0, text7);
				basetextarea._mount(div0, null);
				append(div0, text8);
				append(div0, label3);
				append(label3, text9);
				append(div0, text10);
				basetext1._mount(div0, null);
				append(div4, text11);
				append(div4, div3);
				append(div3, div1);
				append(div1, label4);
				append(label4, text12);
				append(div1, text13);
				basetext2._mount(div1, null);
				append(div3, text14);
				append(div3, div2);
				append(div2, label5);
				append(label5, text15);
				append(div2, text16);
				basetext3._mount(div2, null);
				append(div4, text17);
				append(div4, label6);
				append(label6, text18);
				append(div4, text19);
				basetext4._mount(div4, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.$metadata) input.checked = ctx.$metadata.describe['hide-title'];

				var basetext0_changes = {};
				if (!basetext0_updating.value && changed.$title) {
					basetext0_changes.value = ctx.$title;
					basetext0_updating.value = ctx.$title !== void 0;
				}
				basetext0._set(basetext0_changes);
				basetext0_updating = {};

				var basetextarea_changes = {};
				if (!basetextarea_updating.value && changed.$metadata) {
					basetextarea_changes.value = ctx.$metadata.describe.intro;
					basetextarea_updating.value = ctx.$metadata.describe.intro !== void 0;
				}
				basetextarea._set(basetextarea_changes);
				basetextarea_updating = {};

				var basetext1_changes = {};
				if (!basetext1_updating.value && changed.$metadata) {
					basetext1_changes.value = ctx.$metadata.annotate.notes;
					basetext1_updating.value = ctx.$metadata.annotate.notes !== void 0;
				}
				basetext1._set(basetext1_changes);
				basetext1_updating = {};

				var basetext2_changes = {};
				if (!basetext2_updating.value && changed.$metadata) {
					basetext2_changes.value = ctx.$metadata.describe['source-name'];
					basetext2_updating.value = ctx.$metadata.describe['source-name'] !== void 0;
				}
				basetext2._set(basetext2_changes);
				basetext2_updating = {};

				var basetext3_changes = {};
				if (!basetext3_updating.value && changed.$metadata) {
					basetext3_changes.value = ctx.$metadata.describe['source-url'];
					basetext3_updating.value = ctx.$metadata.describe['source-url'] !== void 0;
				}
				basetext3._set(basetext3_changes);
				basetext3_updating = {};

				var basetext4_changes = {};
				if (!basetext4_updating.value && changed.$metadata) {
					basetext4_changes.value = ctx.$metadata.describe.byline;
					basetext4_updating.value = ctx.$metadata.describe.byline !== void 0;
				}
				basetext4._set(basetext4_changes);
				basetext4_updating = {};
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div4);
				}

				removeListener(input, "change", input_change_handler);
				basetext0.destroy();
				basetextarea.destroy();
				basetext1.destroy();
				basetext2.destroy();
				basetext3.destroy();
				basetext4.destroy();
			}
		};
	}

	function ChartDescription(options) {
		this._debugName = '<ChartDescription>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ChartDescription> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["metadata","title"]), options.data);
		this.store._add(this, ["metadata","title"]);
		if (!('$metadata' in this._state)) console.warn("<ChartDescription> was created without expected data property '$metadata'");
		if (!('$title' in this._state)) console.warn("<ChartDescription> was created without expected data property '$title'");
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ChartDescription.prototype, protoDev);

	ChartDescription.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* visualize/HookBlocks.html generated by Svelte v2.16.1 */

	/* globals dw */
	function data$5() {
	    return {
	        blocks: []
	    };
	}
	function oncreate$2() {
	    const chart = this.store;
	    const { key } = this.get();
	    const { results } = dw.backend.hooks.call(key, [chart]);
	    this.set({
	        blocks: results.sort((a, b) => (b.priority || 0) - (a.priority || 0))
	    });
	}
	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.b = list[i];
		return child_ctx;
	}

	function create_main_fragment$7(component, ctx) {
		var each_anchor;

		var each_value = ctx.blocks;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
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

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.blocks) {
					each_value = ctx.blocks;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (1:0) {#each blocks as b}
	function create_each_block$1(component, ctx) {
		var switch_instance_anchor;

		var switch_value = ctx.b.ui;

		function switch_props(ctx) {
			var switch_instance_initial_data = { name: ctx.b.name, data: ctx.b.data || {} };
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));
		}

		return {
			c: function create() {
				if (switch_instance) switch_instance._fragment.c();
				switch_instance_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (switch_instance) {
					switch_instance._mount(target, anchor);
				}

				insert(target, switch_instance_anchor, anchor);
			},

			p: function update(changed, ctx) {
				var switch_instance_changes = {};
				if (changed.blocks) switch_instance_changes.name = ctx.b.name;
				if (changed.blocks) switch_instance_changes.data = ctx.b.data || {};

				if (switch_value !== (switch_value = ctx.b.ui)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));
						switch_instance._fragment.c();
						switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(switch_instance_anchor);
				}

				if (switch_instance) switch_instance.destroy(detach);
			}
		};
	}

	function HookBlocks(options) {
		this._debugName = '<HookBlocks>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$5(), options.data);
		if (!('blocks' in this._state)) console.warn("<HookBlocks> was created without expected data property 'blocks'");
		this._intro = true;

		this._fragment = create_main_fragment$7(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$2.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(HookBlocks.prototype, protoDev);

	HookBlocks.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* visualize/Annotate.html generated by Svelte v2.16.1 */





	const file$6 = "visualize/Annotate.html";

	function create_main_fragment$8(component, ctx) {
		var div, text;

		var chartdescription = new ChartDescription({
			root: component.root,
			store: component.store
		});

		var hookblocks_initial_data = { key: "annotate-blocks" };
		var hookblocks = new HookBlocks({
			root: component.root,
			store: component.store,
			data: hookblocks_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				chartdescription._fragment.c();
				text = createText("\n\n");
				hookblocks._fragment.c();
				setStyle(div, "margin-bottom", "30px");
				addLoc(div, file$6, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				chartdescription._mount(div, null);
				insert(target, text, anchor);
				hookblocks._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				chartdescription.destroy();
				if (detach) {
					detachNode(text);
				}

				hookblocks.destroy(detach);
			}
		};
	}

	function Annotate(options) {
		this._debugName = '<Annotate>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		this._intro = true;

		this._fragment = create_main_fragment$8(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Annotate.prototype, protoDev);

	Annotate.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/sjockers/Projects/datawrapper/controls/v2/ControlGroup.html generated by Svelte v2.16.1 */

	function data$6() {
	    return {
	        disabled: false,
	        help: false,
	        type: 'default',
	        valign: 'baseline',
	        inline: false
	    };
	}
	var def = {
	    width: '100px'
	};

	const file$7 = "Users/sjockers/Projects/datawrapper/controls/v2/ControlGroup.html";

	function create_main_fragment$9(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_1(component, ctx);

		var if_block1 = (ctx.help) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n    ");
				div0 = createElement("div");
				text1 = createText("\n    ");
				if (if_block1) if_block1.c();
				div0.className = "controls svelte-p72242";
				setStyle(div0, "width", "calc(100% - " + (ctx.width||def.width) + " - 32px)");
				toggleClass(div0, "form-inline", ctx.inline);
				addLoc(div0, file$7, 8, 4, 318);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-p72242";
				addLoc(div1, file$7, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				if (if_block0) if_block0.m(div1, null);
				append(div1, text0);
				append(div1, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
				}

				append(div1, text1);
				if (if_block1) if_block1.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (ctx.label) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1(component, ctx);
						if_block0.c();
						if_block0.m(div1, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.width) {
					setStyle(div0, "width", "calc(100% - " + (ctx.width||def.width) + " - 32px)");
				}

				if (changed.inline) {
					toggleClass(div0, "form-inline", ctx.inline);
				}

				if (ctx.help) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$2(component, ctx);
						if_block1.c();
						if_block1.m(div1, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if ((changed.type || changed.valign) && div1_class_value !== (div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-p72242")) {
					div1.className = div1_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block0) if_block0.d();

				if (slot_content_default) {
					reinsertChildren(div0, slot_content_default);
				}

				if (if_block1) if_block1.d();
			}
		};
	}

	// (2:4) {#if label}
	function create_if_block_1(component, ctx) {
		var label, raw_after, text;

		var if_block = (ctx.labelHelp) && create_if_block_2(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				text = createText(" ");
				if (if_block) if_block.c();
				setStyle(label, "width", (ctx.width||def.width));
				label.className = "control-label svelte-p72242";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$7, 2, 4, 104);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, raw_after);
				raw_after.insertAdjacentHTML("beforebegin", ctx.label);
				append(label, text);
				if (if_block) if_block.m(label, null);
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					detachBefore(raw_after);
					raw_after.insertAdjacentHTML("beforebegin", ctx.label);
				}

				if (ctx.labelHelp) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_2(component, ctx);
						if_block.c();
						if_block.m(label, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.width) {
					setStyle(label, "width", (ctx.width||def.width));
				}

				if (changed.disabled) {
					toggleClass(label, "disabled", ctx.disabled);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (4:24) {#if labelHelp}
	function create_if_block_2(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help mt-1";
				addLoc(p, file$7, 4, 8, 229);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.labelHelp;
			},

			p: function update(changed, ctx) {
				if (changed.labelHelp) {
					p.innerHTML = ctx.labelHelp;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (12:4) {#if help}
	function create_if_block$2(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.width||def.width));
				p.className = p_class_value = "mini-help " + ctx.type + " svelte-p72242";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file$7, 12, 4, 469);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.help;
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					p.innerHTML = ctx.help;
				}

				if (changed.inline || changed.width) {
					setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.width||def.width));
				}

				if ((changed.type) && p_class_value !== (p_class_value = "mini-help " + ctx.type + " svelte-p72242")) {
					p.className = p_class_value;
				}

				if ((changed.type || changed.inline)) {
					toggleClass(p, "mini-help-block", !ctx.inline);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function ControlGroup(options) {
		this._debugName = '<ControlGroup>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$6(), options.data);
		if (!('type' in this._state)) console.warn("<ControlGroup> was created without expected data property 'type'");
		if (!('valign' in this._state)) console.warn("<ControlGroup> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<ControlGroup> was created without expected data property 'label'");
		if (!('width' in this._state)) console.warn("<ControlGroup> was created without expected data property 'width'");
		if (!('labelHelp' in this._state)) console.warn("<ControlGroup> was created without expected data property 'labelHelp'");
		if (!('inline' in this._state)) console.warn("<ControlGroup> was created without expected data property 'inline'");
		if (!('help' in this._state)) console.warn("<ControlGroup> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$9(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/sjockers/Projects/datawrapper/controls/v2/BaseSelect.html generated by Svelte v2.16.1 */

	function data$7() {
	    return {
	        disabled: false,
	        width: 'auto',
	        labelWidth: 'auto',
	        options: [],
	        optgroups: [],
	        value: null
	    };
	}
	const file$8 = "Users/sjockers/Projects/datawrapper/controls/v2/BaseSelect.html";

	function get_each_context_2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.optgroup = list[i];
		return child_ctx;
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$a(component, ctx) {
		var select, if_block0_anchor, select_updating = false;

		var if_block0 = (ctx.options.length) && create_if_block_1$1(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$3(component, ctx);

		function select_change_handler() {
			select_updating = true;
			component.set({ value: selectValue(select) });
			select_updating = false;
		}

		function change_handler(event) {
			component.fire('change', event);
		}

		return {
			c: function create() {
				select = createElement("select");
				if (if_block0) if_block0.c();
				if_block0_anchor = createComment();
				if (if_block1) if_block1.c();
				addListener(select, "change", select_change_handler);
				if (!('value' in ctx)) component.root._beforecreate.push(select_change_handler);
				addListener(select, "change", change_handler);
				select.className = "select-css svelte-v0oq4b";
				select.disabled = ctx.disabled;
				setStyle(select, "width", ctx.width);
				addLoc(select, file$8, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, select, anchor);
				if (if_block0) if_block0.m(select, null);
				append(select, if_block0_anchor);
				if (if_block1) if_block1.m(select, null);

				selectOption(select, ctx.value);
			},

			p: function update(changed, ctx) {
				if (ctx.options.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$1(component, ctx);
						if_block0.c();
						if_block0.m(select, if_block0_anchor);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.optgroups.length) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$3(component, ctx);
						if_block1.c();
						if_block1.m(select, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!select_updating && changed.value) selectOption(select, ctx.value);
				if (changed.disabled) {
					select.disabled = ctx.disabled;
				}

				if (changed.width) {
					setStyle(select, "width", ctx.width);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(select);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				removeListener(select, "change", select_change_handler);
				removeListener(select, "change", change_handler);
			}
		};
	}

	// (2:4) {#if options.length}
	function create_if_block_1$1(component, ctx) {
		var each_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context$2(ctx, each_value, i));
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

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.options || changed.value) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (2:25) {#each options as opt}
	function create_each_block_2(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$8, 2, 4, 179);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.options) && text_value !== (text_value = ctx.opt.label)) {
					setData(text, text_value);
				}

				if ((changed.options) && option_value_value !== (option_value_value = ctx.opt.value)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
				if ((changed.options || changed.value) && option_selected_value !== (option_selected_value = ctx.opt.value === ctx.value)) {
					option.selected = option_selected_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	// (4:18) {#if optgroups.length}
	function create_if_block$3(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.optgroups;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context_1(ctx, each_value_1, i));
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

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.optgroups || changed.value) {
					each_value_1 = ctx.optgroups;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (6:8) {#each optgroup.options as opt}
	function create_each_block_1(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$8, 6, 8, 420);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.optgroups) && text_value !== (text_value = ctx.opt.label)) {
					setData(text, text_value);
				}

				if ((changed.optgroups) && option_value_value !== (option_value_value = ctx.opt.value)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
				if ((changed.optgroups || changed.value) && option_selected_value !== (option_selected_value = ctx.opt.value === ctx.value)) {
					option.selected = option_selected_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	// (4:41) {#each optgroups as optgroup}
	function create_each_block$2(component, ctx) {
		var optgroup, optgroup_label_value;

		var each_value_2 = ctx.optgroup.options;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
				addLoc(optgroup, file$8, 4, 4, 336);
			},

			m: function mount(target, anchor) {
				insert(target, optgroup, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(optgroup, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.optgroups || changed.value) {
					each_value_2 = ctx.optgroup.options;

					for (var i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(optgroup, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_2.length;
				}

				if ((changed.optgroups) && optgroup_label_value !== (optgroup_label_value = ctx.optgroup.label)) {
					setAttribute(optgroup, "label", optgroup_label_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(optgroup);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	function BaseSelect(options) {
		this._debugName = '<BaseSelect>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$7(), options.data);
		if (!('disabled' in this._state)) console.warn("<BaseSelect> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<BaseSelect> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<BaseSelect> was created without expected data property 'width'");
		if (!('options' in this._state)) console.warn("<BaseSelect> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<BaseSelect> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$a(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(BaseSelect.prototype, protoDev);

	BaseSelect.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/sjockers/Projects/datawrapper/controls/v2/Select.html generated by Svelte v2.16.1 */



	function controlWidth({ inline, width }) {
		return inline ? width || 'auto' : width;
	}

	function labelWidth({ inline, labelWidth }) {
		return inline ? labelWidth || 'auto' : labelWidth;
	}

	function data$8() {
	    return {
	        disabled: false,
	        width: null,
	        labelWidth: null,
	        options: [],
	        optgroups: [],
	        valign: 'middle',
	        inline: true,
	        help: ''
	    };
	}
	function create_main_fragment$b(component, ctx) {
		var baseselect_updating = {}, controlgroup_updating = {};

		var baseselect_initial_data = { width: ctx.controlWidth };
		if (ctx.value  !== void 0) {
			baseselect_initial_data.value = ctx.value ;
			baseselect_updating.value = true;
		}
		if (ctx.disabled  !== void 0) {
			baseselect_initial_data.disabled = ctx.disabled ;
			baseselect_updating.disabled = true;
		}
		if (ctx.options  !== void 0) {
			baseselect_initial_data.options = ctx.options ;
			baseselect_updating.options = true;
		}
		if (ctx.optgroups  !== void 0) {
			baseselect_initial_data.optgroups = ctx.optgroups ;
			baseselect_updating.optgroups = true;
		}
		var baseselect = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!baseselect_updating.value && changed.value) {
					newState.value = childState.value;
				}

				if (!baseselect_updating.disabled && changed.disabled) {
					newState.disabled = childState.disabled;
				}

				if (!baseselect_updating.options && changed.options) {
					newState.options = childState.options;
				}

				if (!baseselect_updating.optgroups && changed.optgroups) {
					newState.optgroups = childState.optgroups;
				}
				component._set(newState);
				baseselect_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			baseselect._bind({ value: 1, disabled: 1, options: 1, optgroups: 1 }, baseselect.get());
		});

		baseselect.on("change", function(event) {
			component.fire('change', event);
		});

		var controlgroup_initial_data = { width: ctx.labelWidth, type: "select" };
		if (ctx.valign  !== void 0) {
			controlgroup_initial_data.valign = ctx.valign ;
			controlgroup_updating.valign = true;
		}
		if (ctx.label  !== void 0) {
			controlgroup_initial_data.label = ctx.label ;
			controlgroup_updating.label = true;
		}
		if (ctx.disabled  !== void 0) {
			controlgroup_initial_data.disabled = ctx.disabled ;
			controlgroup_updating.disabled = true;
		}
		if (ctx.help  !== void 0) {
			controlgroup_initial_data.help = ctx.help ;
			controlgroup_updating.help = true;
		}
		if (ctx.inline !== void 0) {
			controlgroup_initial_data.inline = ctx.inline;
			controlgroup_updating.inline = true;
		}
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!controlgroup_updating.valign && changed.valign) {
					newState.valign = childState.valign;
				}

				if (!controlgroup_updating.label && changed.label) {
					newState.label = childState.label;
				}

				if (!controlgroup_updating.disabled && changed.disabled) {
					newState.disabled = childState.disabled;
				}

				if (!controlgroup_updating.help && changed.help) {
					newState.help = childState.help;
				}

				if (!controlgroup_updating.inline && changed.inline) {
					newState.inline = childState.inline;
				}
				component._set(newState);
				controlgroup_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			controlgroup._bind({ valign: 1, label: 1, disabled: 1, help: 1, inline: 1 }, controlgroup.get());
		});

		return {
			c: function create() {
				baseselect._fragment.c();
				controlgroup._fragment.c();
			},

			m: function mount(target, anchor) {
				baseselect._mount(controlgroup._slotted.default, null);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var baseselect_changes = {};
				if (changed.controlWidth) baseselect_changes.width = ctx.controlWidth;
				if (!baseselect_updating.value && changed.value) {
					baseselect_changes.value = ctx.value ;
					baseselect_updating.value = ctx.value  !== void 0;
				}
				if (!baseselect_updating.disabled && changed.disabled) {
					baseselect_changes.disabled = ctx.disabled ;
					baseselect_updating.disabled = ctx.disabled  !== void 0;
				}
				if (!baseselect_updating.options && changed.options) {
					baseselect_changes.options = ctx.options ;
					baseselect_updating.options = ctx.options  !== void 0;
				}
				if (!baseselect_updating.optgroups && changed.optgroups) {
					baseselect_changes.optgroups = ctx.optgroups ;
					baseselect_updating.optgroups = ctx.optgroups  !== void 0;
				}
				baseselect._set(baseselect_changes);
				baseselect_updating = {};

				var controlgroup_changes = {};
				if (changed.labelWidth) controlgroup_changes.width = ctx.labelWidth;
				if (!controlgroup_updating.valign && changed.valign) {
					controlgroup_changes.valign = ctx.valign ;
					controlgroup_updating.valign = ctx.valign  !== void 0;
				}
				if (!controlgroup_updating.label && changed.label) {
					controlgroup_changes.label = ctx.label ;
					controlgroup_updating.label = ctx.label  !== void 0;
				}
				if (!controlgroup_updating.disabled && changed.disabled) {
					controlgroup_changes.disabled = ctx.disabled ;
					controlgroup_updating.disabled = ctx.disabled  !== void 0;
				}
				if (!controlgroup_updating.help && changed.help) {
					controlgroup_changes.help = ctx.help ;
					controlgroup_updating.help = ctx.help  !== void 0;
				}
				if (!controlgroup_updating.inline && changed.inline) {
					controlgroup_changes.inline = ctx.inline;
					controlgroup_updating.inline = ctx.inline !== void 0;
				}
				controlgroup._set(controlgroup_changes);
				controlgroup_updating = {};
			},

			d: function destroy(detach) {
				baseselect.destroy();
				controlgroup.destroy(detach);
			}
		};
	}

	function Select(options) {
		this._debugName = '<Select>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$8(), options.data);

		this._recompute({ inline: 1, width: 1, labelWidth: 1 }, this._state);
		if (!('inline' in this._state)) console.warn("<Select> was created without expected data property 'inline'");
		if (!('width' in this._state)) console.warn("<Select> was created without expected data property 'width'");

		if (!('valign' in this._state)) console.warn("<Select> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<Select> was created without expected data property 'label'");
		if (!('disabled' in this._state)) console.warn("<Select> was created without expected data property 'disabled'");
		if (!('help' in this._state)) console.warn("<Select> was created without expected data property 'help'");

		if (!('value' in this._state)) console.warn("<Select> was created without expected data property 'value'");
		if (!('options' in this._state)) console.warn("<Select> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<Select> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$b(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Select.prototype, protoDev);

	Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('controlWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Select>: Cannot set read-only property 'controlWidth'");
		if ('labelWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Select>: Cannot set read-only property 'labelWidth'");
	};

	Select.prototype._recompute = function _recompute(changed, state) {
		if (changed.inline || changed.width) {
			if (this._differs(state.controlWidth, (state.controlWidth = controlWidth(state)))) changed.controlWidth = true;
		}

		if (changed.inline || changed.labelWidth) {
			if (this._differs(state.labelWidth, (state.labelWidth = labelWidth(state)))) changed.labelWidth = true;
		}
	};

	/* visualize/Design.html generated by Svelte v2.16.1 */



	function themeOptions({ $themes }) {
	    return $themes.map(t => {
	        return { value: t.id, label: t.title };
	    });
	}
	function create_main_fragment$c(component, ctx) {
		var selectinput_updating = {}, text;

		var selectinput_initial_data = {
		 	label: "Select layout:",
		 	options: ctx.themeOptions,
		 	labelWidth: "100px",
		 	width: "200px"
		 };
		if (ctx.$theme !== void 0) {
			selectinput_initial_data.value = ctx.$theme;
			selectinput_updating.value = true;
		}
		var selectinput = new Select({
			root: component.root,
			store: component.store,
			data: selectinput_initial_data,
			_bind(changed, childState) {
				var newStoreState = {};
				if (!selectinput_updating.value && changed.value) {
					newStoreState.theme = childState.value;
				}
				component.store.set(newStoreState);
				selectinput_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput._bind({ value: 1 }, selectinput.get());
		});

		var hookblocks_initial_data = { key: "design-blocks" };
		var hookblocks = new HookBlocks({
			root: component.root,
			store: component.store,
			data: hookblocks_initial_data
		});

		return {
			c: function create() {
				selectinput._fragment.c();
				text = createText("\n\n");
				hookblocks._fragment.c();
			},

			m: function mount(target, anchor) {
				selectinput._mount(target, anchor);
				insert(target, text, anchor);
				hookblocks._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectinput_changes = {};
				if (changed.themeOptions) selectinput_changes.options = ctx.themeOptions;
				if (!selectinput_updating.value && changed.$theme) {
					selectinput_changes.value = ctx.$theme;
					selectinput_updating.value = ctx.$theme !== void 0;
				}
				selectinput._set(selectinput_changes);
				selectinput_updating = {};
			},

			d: function destroy(detach) {
				selectinput.destroy(detach);
				if (detach) {
					detachNode(text);
				}

				hookblocks.destroy(detach);
			}
		};
	}

	function Design(options) {
		this._debugName = '<Design>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Design> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["themes","theme"]), options.data);
		this.store._add(this, ["themes","theme"]);

		this._recompute({ $themes: 1 }, this._state);
		if (!('$themes' in this._state)) console.warn("<Design> was created without expected data property '$themes'");

		if (!('$theme' in this._state)) console.warn("<Design> was created without expected data property '$theme'");
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$c(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Design.prototype, protoDev);

	Design.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('themeOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<Design>: Cannot set read-only property 'themeOptions'");
	};

	Design.prototype._recompute = function _recompute(changed, state) {
		if (changed.$themes) {
			if (this._differs(state.themeOptions, (state.themeOptions = themeOptions(state)))) changed.themeOptions = true;
		}
	};

	/* visualize/ChartPicker.html generated by Svelte v2.16.1 */



	function archiveOpts({ visArchive }) {
	    return [
	        {
	            value: null,
	            label: '---'
	        }
	    ].concat(visArchive.map(vis => ({ value: vis.id, label: vis.title })));
	}
	function namespaceVisualizations({ namespace, visualizations }) {
	    if (namespace === 'chart' || namespace === 'table') {
	        return visualizations.filter(
	            el => ['chart', 'table'].indexOf(el.namespace) > -1
	        );
	    } else {
	        return visualizations.filter(el => el.namespace === namespace);
	    }
	}
	var methods$3 = {
	    loadVis(id) {
	        const { type } = this.store.get();
	        if (id !== type) {
	            this.fire('change', id);
	        }
	    },
	    transpose() {
	        const transpose = this.store.getMetadata('data.transpose');
	        this.store.setMetadata('data.transpose', !transpose);
	    }
	};

	const file$9 = "visualize/ChartPicker.html";

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.loadVis(ctx.vis.id);
	}

	function get_each_context$3(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.vis = list[i];
		return child_ctx;
	}

	function create_main_fragment$d(component, ctx) {
		var div3, div2, div0, text0, div1, text1, p, b, text2_value = __("Hint"), text2, text3, text4, text5_value = __("visualize / transpose-hint "), text5, text6, button, text7_value = __("visualize / transpose-button "), text7;

		var each_value = ctx.namespaceVisualizations;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, get_each_context$3(ctx, each_value, i));
		}

		var selectinput_initial_data = {
		 	width: "180px",
		 	options: ctx.archiveOpts,
		 	label: __('visualize / vis archive')
		 };
		var selectinput = new Select({
			root: component.root,
			store: component.store,
			data: selectinput_initial_data
		});

		selectinput.on("change", function(event) {
			component.loadVis(event.target.value);
		});

		function click_handler_1(event) {
			component.transpose();
		}

		function mousedown_handler(event) {
			event.preventDefault();
		}

		return {
			c: function create() {
				div3 = createElement("div");
				div2 = createElement("div");
				div0 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text0 = createText("\n\n        ");
				div1 = createElement("div");
				selectinput._fragment.c();
				text1 = createText("\n\n        ");
				p = createElement("p");
				b = createElement("b");
				text2 = createText(text2_value);
				text3 = createText(":");
				text4 = createText("\n            ");
				text5 = createText(text5_value);
				text6 = createText("\n            ");
				button = createElement("button");
				text7 = createText(text7_value);
				div0.className = "vis-thumbs";
				addLoc(div0, file$9, 2, 8, 91);
				div1.className = "vis-archive-select";
				addLoc(div1, file$9, 11, 8, 418);
				addLoc(b, file$9, 21, 12, 713);
				addListener(button, "click", click_handler_1);
				addListener(button, "mousedown", mousedown_handler);
				button.className = "plain-link";
				addLoc(button, file$9, 23, 12, 798);
				addLoc(p, file$9, 20, 8, 697);
				div2.className = "vis-selector-unfolded";
				addLoc(div2, file$9, 1, 4, 47);
				div3.className = "section select-visualization";
				addLoc(div3, file$9, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div2);
				append(div2, div0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}

				append(div2, text0);
				append(div2, div1);
				selectinput._mount(div1, null);
				append(div2, text1);
				append(div2, p);
				append(p, b);
				append(b, text2);
				append(b, text3);
				append(p, text4);
				append(p, text5);
				append(p, text6);
				append(p, button);
				append(button, text7);
			},

			p: function update(changed, ctx) {
				if (changed.namespaceVisualizations || changed.$type) {
					each_value = ctx.namespaceVisualizations;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$3(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div0, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				var selectinput_changes = {};
				if (changed.archiveOpts) selectinput_changes.options = ctx.archiveOpts;
				selectinput._set(selectinput_changes);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div3);
				}

				destroyEach(each_blocks, detach);

				selectinput.destroy();
				removeListener(button, "click", click_handler_1);
				removeListener(button, "mousedown", mousedown_handler);
			}
		};
	}

	// (4:12) {#each namespaceVisualizations as vis}
	function create_each_block$3(component, ctx) {
		var div1, raw0_value = ctx.vis.icon, raw0_after, text, div0, raw1_value = ctx.vis.title;

		return {
			c: function create() {
				div1 = createElement("div");
				raw0_after = createElement('noscript');
				text = createText("\n                ");
				div0 = createElement("div");
				div0.className = "title";
				addLoc(div0, file$9, 6, 16, 312);

				div1._svelte = { component, ctx };

				addListener(div1, "click", click_handler$1);
				div1.className = "vis-thumb";
				toggleClass(div1, "active", ctx.vis.id === ctx.$type);
				addLoc(div1, file$9, 4, 12, 179);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, raw0_after);
				raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
				append(div1, text);
				append(div1, div0);
				div0.innerHTML = raw1_value;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.namespaceVisualizations) && raw0_value !== (raw0_value = ctx.vis.icon)) {
					detachBefore(raw0_after);
					raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
				}

				if ((changed.namespaceVisualizations) && raw1_value !== (raw1_value = ctx.vis.title)) {
					div0.innerHTML = raw1_value;
				}

				div1._svelte.ctx = ctx;
				if ((changed.namespaceVisualizations || changed.$type)) {
					toggleClass(div1, "active", ctx.vis.id === ctx.$type);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(div1, "click", click_handler$1);
			}
		};
	}

	function ChartPicker(options) {
		this._debugName = '<ChartPicker>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ChartPicker> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["type"]), options.data);
		this.store._add(this, ["type"]);

		this._recompute({ visArchive: 1, namespace: 1, visualizations: 1 }, this._state);
		if (!('visArchive' in this._state)) console.warn("<ChartPicker> was created without expected data property 'visArchive'");
		if (!('namespace' in this._state)) console.warn("<ChartPicker> was created without expected data property 'namespace'");
		if (!('visualizations' in this._state)) console.warn("<ChartPicker> was created without expected data property 'visualizations'");

		if (!('$type' in this._state)) console.warn("<ChartPicker> was created without expected data property '$type'");
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$d(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ChartPicker.prototype, protoDev);
	assign(ChartPicker.prototype, methods$3);

	ChartPicker.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('archiveOpts' in newState && !this._updatingReadonlyProperty) throw new Error("<ChartPicker>: Cannot set read-only property 'archiveOpts'");
		if ('namespaceVisualizations' in newState && !this._updatingReadonlyProperty) throw new Error("<ChartPicker>: Cannot set read-only property 'namespaceVisualizations'");
	};

	ChartPicker.prototype._recompute = function _recompute(changed, state) {
		if (changed.visArchive) {
			if (this._differs(state.archiveOpts, (state.archiveOpts = archiveOpts(state)))) changed.archiveOpts = true;
		}

		if (changed.namespace || changed.visualizations) {
			if (this._differs(state.namespaceVisualizations, (state.namespaceVisualizations = namespaceVisualizations(state)))) changed.namespaceVisualizations = true;
		}
	};

	/* visualize/Loading.html generated by Svelte v2.16.1 */



	const file$a = "visualize/Loading.html";

	function create_main_fragment$e(component, ctx) {
		var p, i, text0, text1_value = __('svelte-option / loading'), text1;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				i.className = "fa fa-circle-o-notch fa-spin fa-cog";
				addLoc(i, file$a, 1, 4, 29);
				setStyle(p, "color", "#777");
				addLoc(p, file$a, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text0);
				append(p, text1);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function Loading(options) {
		this._debugName = '<Loading>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		this._intro = true;

		this._fragment = create_main_fragment$e(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Loading.prototype, protoDev);

	Loading.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* Users/sjockers/Projects/datawrapper/controls/v2/Radio.html generated by Svelte v2.16.1 */

	function data$9() {
	    return {
	        value: null,
	        disabled: false,
	        disabled_msg: '',
	        indeterminate: false,
	        width: 'auto',
	        valign: 'top',
	        inline: true
	    };
	}
	function onstate$1({ changed, previous }) {
	    if (previous && changed.value) {
	        this.set({ indeterminate: false });
	    }
	}
	const file$b = "Users/sjockers/Projects/datawrapper/controls/v2/Radio.html";

	function get_each_context$4(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$f(component, ctx) {
		var div, text0, slot_content_default = component._slotted.default, slot_content_default_before, text1, if_block_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(component, get_each_context$4(ctx, each_value, i));
		}

		var controlgroup_initial_data = {
		 	type: "radio",
		 	width: ctx.width,
		 	valign: ctx.valign,
		 	label: ctx.label,
		 	disabled: ctx.disabled
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block = (ctx.disabled && ctx.disabled_msg) && create_if_block$4(component, ctx);

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text0 = createText("\n    ");
				controlgroup._fragment.c();
				text1 = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				div.className = "svelte-1qlzejw";
				toggleClass(div, "inline", ctx.inline);
				toggleClass(div, "indeterminate", ctx.indeterminate);
				addLoc(div, file$b, 1, 4, 68);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				append(controlgroup._slotted.default, text0);

				if (slot_content_default) {
					append(controlgroup._slotted.default, slot_content_default_before || (slot_content_default_before = createComment()));
					append(controlgroup._slotted.default, slot_content_default);
				}

				controlgroup._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.options || changed.disabled || changed.value) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$4(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (changed.inline) {
					toggleClass(div, "inline", ctx.inline);
				}

				if (changed.indeterminate) {
					toggleClass(div, "indeterminate", ctx.indeterminate);
				}

				var controlgroup_changes = {};
				if (changed.width) controlgroup_changes.width = ctx.width;
				if (changed.valign) controlgroup_changes.valign = ctx.valign;
				if (changed.label) controlgroup_changes.label = ctx.label;
				if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;
				controlgroup._set(controlgroup_changes);

				if (ctx.disabled && ctx.disabled_msg) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$4(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}

				controlgroup.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (9:12) {#if opt.help}
	function create_if_block_1$2(component, ctx) {
		var div, raw_value = ctx.opt.help;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-1qlzejw";
				addLoc(div, file$b, 9, 12, 475);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.options) && raw_value !== (raw_value = ctx.opt.help)) {
					div.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (3:8) {#each options as opt}
	function create_each_block$4(component, ctx) {
		var label, input, input_value_value, text0, span0, text1, span1, raw_value = ctx.opt.label, text2, label_title_value;

		function input_change_handler() {
			component.set({ value: input.__value });
		}

		var if_block = (ctx.opt.help) && create_if_block_1$2(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				text0 = createText("\n            ");
				span0 = createElement("span");
				text1 = createText(" ");
				span1 = createElement("span");
				text2 = createText("\n            ");
				if (if_block) if_block.c();
				component._bindingGroups[0].push(input);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "radio");
				input.__value = input_value_value = ctx.opt.value;
				input.value = input.__value;
				input.disabled = ctx.disabled;
				input.className = "svelte-1qlzejw";
				addLoc(input, file$b, 4, 12, 233);
				span0.className = "css-ui svelte-1qlzejw";
				addLoc(span0, file$b, 5, 12, 320);
				span1.className = "inner-label svelte-1qlzejw";
				addLoc(span1, file$b, 5, 46, 354);
				label.title = label_title_value = ctx.opt.tooltip||'';
				label.className = "svelte-1qlzejw";
				toggleClass(label, "disabled", ctx.disabled);
				toggleClass(label, "has-help", ctx.opt.help);
				addLoc(label, file$b, 3, 8, 146);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, input);

				input.checked = input.__value === ctx.value;

				append(label, text0);
				append(label, span0);
				append(label, text1);
				append(label, span1);
				span1.innerHTML = raw_value;
				append(label, text2);
				if (if_block) if_block.m(label, null);
			},

			p: function update(changed, ctx) {
				if (changed.value) input.checked = input.__value === ctx.value;
				if ((changed.options) && input_value_value !== (input_value_value = ctx.opt.value)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if ((changed.options) && raw_value !== (raw_value = ctx.opt.label)) {
					span1.innerHTML = raw_value;
				}

				if (ctx.opt.help) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$2(component, ctx);
						if_block.c();
						if_block.m(label, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.options) && label_title_value !== (label_title_value = ctx.opt.tooltip||'')) {
					label.title = label_title_value;
				}

				if (changed.disabled) {
					toggleClass(label, "disabled", ctx.disabled);
				}

				if (changed.options) {
					toggleClass(label, "has-help", ctx.opt.help);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);
				if (if_block) if_block.d();
			}
		};
	}

	// (20:0) {#if disabled && disabled_msg}
	function create_if_block$4(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "disabled-message svelte-1qlzejw";
				addLoc(div, file$b, 20, 0, 669);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.disabled_msg;
			},

			p: function update(changed, ctx) {
				if (changed.disabled_msg) {
					div.innerHTML = ctx.disabled_msg;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function Radio(options) {
		this._debugName = '<Radio>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$9(), options.data);
		if (!('width' in this._state)) console.warn("<Radio> was created without expected data property 'width'");
		if (!('valign' in this._state)) console.warn("<Radio> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<Radio> was created without expected data property 'label'");
		if (!('disabled' in this._state)) console.warn("<Radio> was created without expected data property 'disabled'");
		if (!('options' in this._state)) console.warn("<Radio> was created without expected data property 'options'");
		if (!('value' in this._state)) console.warn("<Radio> was created without expected data property 'value'");
		if (!('disabled_msg' in this._state)) console.warn("<Radio> was created without expected data property 'disabled_msg'");
		this._bindingGroups = [[]];
		this._intro = true;

		this._handlers.state = [onstate$1];

		this._slotted = options.slots || {};

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$f(this, this._state);

		this.root._oncreate.push(() => {
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Radio.prototype, protoDev);

	Radio.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
		  path: basedir,
		  exports: {},
		  require: function (path, base) {
	      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
	    }
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var js_cookie = createCommonjsModule(function (module, exports) {
	(function (factory) {
		var registeredInModuleLoader;
		{
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function decode (s) {
			return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
		}

		function init (converter) {
			function api() {}

			function set (key, value, attributes) {
				if (typeof document === 'undefined') {
					return;
				}

				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}

					// Considers RFC 6265 section 5.2:
					// ...
					// 3.  If the remaining unparsed-attributes contains a %x3B (";")
					//     character:
					// Consume the characters of the unparsed-attributes up to,
					// not including, the first %x3B (";") character.
					// ...
					stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
				}

				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			function get (key, json) {
				if (typeof document === 'undefined') {
					return;
				}

				var jar = {};
				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all.
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = decode(parts[0]);
						cookie = (converter.read || converter)(cookie, name) ||
							decode(cookie);

						if (json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						jar[name] = cookie;

						if (key === name) {
							break;
						}
					} catch (e) {}
				}

				return key ? jar[key] : jar;
			}

			api.set = set;
			api.get = function (key) {
				return get(key, false /* read as raw */);
			};
			api.getJSON = function (key) {
				return get(key, true /* read as json */);
			};
			api.remove = function (key, attributes) {
				set(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.defaults = {};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));
	});

	const CSRF_COOKIE_NAME = 'crumb';
	const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
	const CSRF_SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']); // according to RFC7231

	/**
	 * The response body is automatically parsed according
	 * to the response content type.
	 *
	 * @exports httpReq
	 * @kind function
	 *
	 * @param {string} path               - the url path that gets appended to baseUrl
	 * @param {object} options.payload    - payload to be send with req
	 * @param {boolean} options.raw       - disable parsing of response body, returns raw response
	 * @param {string} options.baseUrl    - base for url, defaults to dw api domain
	 * @param {*} options                 - see documentation for window.fetch for additional options
	 *
	 * @returns {Promise} promise of parsed response body or raw response
	 *
	 * @example
	 *  import httpReq from '@datawrapper/shared/httpReq';
	 *  let res = await httpReq('/v3/charts', {
	 *      method: 'post',
	 *      payload: {
	 *          title: 'My new chart'
	 *      }
	 *  });
	 *  import { post } from '@datawrapper/shared/httpReq';
	 *  res = await post('/v3/charts', {
	 *      payload: {
	 *          title: 'My new chart'
	 *      }
	 *  });
	 */
	function httpReq(path, options = {}) {
	    if (!options.fetch) {
	        try {
	            options.fetch = window.fetch;
	        } catch (e) {
	            throw new Error('Neither options.fetch nor window.fetch is defined.');
	        }
	    }
	    if (!options.baseUrl) {
	        try {
	            options.baseUrl = `//${window.dw.backend.__api_domain}`;
	        } catch (e) {
	            throw new Error('Neither options.baseUrl nor window.dw is defined.');
	        }
	    }
	    const { payload, baseUrl, fetch, raw, ...opts } = {
	        payload: null,
	        raw: false,
	        method: 'GET',
	        mode: 'cors',
	        credentials: 'include',
	        ...options,
	        headers: {
	            'Content-Type': 'application/json',
	            ...options.headers
	        }
	    };
	    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
	    if (payload) {
	        // overwrite body
	        opts.body = JSON.stringify(payload);
	    }

	    let promise;
	    if (!CSRF_SAFE_METHODS.has(opts.method.toLowerCase())) {
	        let csrfCookieValue = js_cookie.get(CSRF_COOKIE_NAME);
	        if (csrfCookieValue) {
	            opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
	            promise = fetch(url, opts);
	        } else {
	            promise = httpReq('/v3/me', { fetch, baseUrl })
	                .then(() => {
	                    const csrfCookieValue = js_cookie.get(CSRF_COOKIE_NAME);
	                    if (csrfCookieValue) {
	                        opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
	                    }
	                })
	                .catch(() => {}) // Ignore errors from /v3/me. It probably means the user is not logged in.
	                .then(() => fetch(url, opts));
	        }
	    } else {
	        promise = fetch(url, opts);
	    }
	    // The variable `promise` and the repeated `fetch(url, opts)` could be replaced with `await
	    // httpReq('/v3/me'...)`, but then we would need to configure babel to transform async/await for
	    // all repositories that use @datawrapper/shared.

	    return promise.then(res => {
	        if (raw) return res;
	        if (!res.ok) throw new HttpReqError(res);
	        if (res.status === 204 || !res.headers.get('content-type')) return res; // no content
	        // trim away the ;charset=utf-8 from content-type
	        const contentType = res.headers.get('content-type').split(';')[0];
	        if (contentType === 'application/json') {
	            return res.json();
	        }
	        if (contentType === 'image/png' || contentType === 'application/pdf') {
	            return res.blob();
	        }
	        // default to text for all other content types
	        return res.text();
	    });
	}

	/**
	 * Like `httpReq` but with fixed http method GET
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.get
	 * @kind function
	 */
	const get$1 = (httpReq.get = httpReqVerb('GET'));

	/**
	 * Like `httpReq` but with fixed http method PATCH
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.patch
	 * @kind function
	 */
	const patch = (httpReq.patch = httpReqVerb('PATCH'));

	/**
	 * Like `httpReq` but with fixed http method PUT
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.put
	 * @kind function
	 */
	const put = (httpReq.put = httpReqVerb('PUT'));

	/**
	 * Like `httpReq` but with fixed http method POST
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.post
	 * @kind function
	 */
	const post = (httpReq.post = httpReqVerb('POST'));

	/**
	 * Like `httpReq` but with fixed http method HEAD
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.head
	 * @kind function
	 */
	const head = (httpReq.head = httpReqVerb('HEAD'));

	/**
	 * Like `httpReq` but with fixed http method DELETE
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.delete
	 * @kind function
	 */
	httpReq.delete = httpReqVerb('DELETE');

	function httpReqVerb(method) {
	    return (path, options) => {
	        if (options && options.method) {
	            throw new Error(
	                `Setting option.method is not allowed in httpReq.${method.toLowerCase()}()`
	            );
	        }
	        return httpReq(path, { ...options, method });
	    };
	}

	class HttpReqError extends Error {
	    constructor(res) {
	        super();
	        this.name = 'HttpReqError';
	        this.status = res.status;
	        this.statusText = res.statusText;
	        this.message = `[${res.status}] ${res.statusText}`;
	        this.response = res;
	    }
	}

	/* visualize/Resizer.html generated by Svelte v2.16.1 */



	const DPI = 96;
	const IN2MM = 25.4;

	function width_px({ width, unit }) {
	    return width * (unit === 'px' ? 1 : unit === 'mm' ? DPI / IN2MM : DPI);
	}
	function height_px({ height, unit }) {
	    return height * (unit === 'px' ? 1 : unit === 'mm' ? DPI / IN2MM : DPI);
	}
	function theUnit({ unit, units }) {
	    for (let i = 0; i < units.length; i++) {
	        if (units[i].value === unit) return units[i];
	    }
	}
	function hasPresets({ theme }) {
	    return (
	        theme &&
	        theme &&
	        theme.export &&
	        theme.export.presets &&
	        theme.export.presets.pdf &&
	        theme.export.presets.pdf.length
	    );
	}
	function presets({ hasPresets, theme }) {
	    if (!hasPresets) return [];
	    return theme.export.presets.pdf;
	}
	function presetOptions({ hasPresets, theme }) {
	    if (!hasPresets) return [];

	    var presets = theme.export.presets.pdf.map((el, i) => {
	        return {
	            value: i,
	            label: el.title
	        };
	    });

	    presets.unshift({
	        value: '---',
	        label: 'Apply preset…'
	    });

	    return presets;
	}
	function data$a() {
	    return {
	        webToPrint: false,
	        mode: '',
	        width: 600,
	        height: 400,
	        width_txt: null,
	        height_txt: null,
	        unit: 'px',
	        units: [
	            { value: 'mm', label: 'mm', step: 1, decimals: 0 },
	            { value: 'in', label: 'in', step: 0.01, decimals: 2 },
	            { value: 'px', label: 'px', step: 1, decimals: 0 }
	        ],
	        breakpoints: [
	            {
	                icon: 'fa-mobile',
	                iconSize: 14,
	                minWidth: 0,
	                maxWidth: 320,
	                width: 320
	            },
	            {
	                icon: 'fa-mobile',
	                iconSize: 17,
	                minWidth: 321,
	                maxWidth: 400,
	                width: 400
	            },
	            {
	                icon: 'fa-desktop',
	                iconSize: 14,
	                minWidth: 401,
	                maxWidth: Infinity,
	                width: 600
	            }
	        ],
	        preset: null,
	        hasPresets: false,
	        printExpanded: false,
	        theme: null
	    };
	}
	var methods$4 = {
	    usePreset() {
	        const { preset, presets } = this.get();
	        if (preset === '---') return;

	        this.set(presets[preset]);
	        this.updateSize();
	    },
	    changed() {
	        const app = this;

	        clearTimeout(this.debounceUpdateSize);
	        this.debounceUpdateSize = setTimeout(function () {
	            app.set({
	                width: app.get().width_txt,
	                height: app.get().height_txt
	            });
	        }, 100);
	    },
	    activate(mode) {
	        if (mode === 'web') {
	            if (this.store.getMetadata('custom.webToPrint.webChartId')) {
	                window.location =
	                    window.location.protocol +
	                    '//' +
	                    window.location.host +
	                    '/chart/' +
	                    this.store.getMetadata('custom.webToPrint.webChartId') +
	                    '/visualize';
	            }
	        } else if (mode === 'print') {
	            if (this.store.getMetadata('custom.webToPrint.printChartId')) {
	                window.location =
	                    window.location.protocol +
	                    '//' +
	                    window.location.host +
	                    '/chart/' +
	                    this.store.getMetadata('custom.webToPrint.printChartId') +
	                    '/visualize';
	            } else {
	                httpReq
	                    .post(`/v3/charts/${dw.backend.currentChart.get('id')}/print`)
	                    .then(data => {
	                        window.location = `${window.location.protocol}//${window.location.host}/chart/${data.id}/visualize`;
	                    });
	            }
	        }
	    },
	    setWidth(w) {
	        this.set({ width: w });
	    },
	    setHeight(h) {
	        this.set({ height: h });
	    },
	    togglePrintOptions() {
	        this.set({ printExpanded: !this.get().printExpanded });
	    },
	    reset() {
	        if (!window.confirm('Are you sure you want to reset to the web version?')) return;

	        httpReq
	            .delete(`/v3/charts/${dw.backend.currentChart.get('id')}/print`)
	            .then(data => {
	                window.location.reload();
	            });
	    },
	    updateSize() {
	        const { width, height, unit } = this.get();
	        const w = this.get().width_px;
	        const h = this.get().height_px;

	        const maxW = $('#iframe-wrapper').parent().parent().width() - 22;

	        this.store.setMetadata('publish.embed-width', w);
	        this.store.setMetadata('publish.embed-height', h);

	        $('#iframe-wrapper').animate(
	            {
	                width: w,
	                height: h,
	                'margin-left': (maxW - w) * 0.5
	            },
	            {
	                duration: 200,
	                step: function () {
	                    $(this).css('overflow', 'visible');
	                }
	            }
	        );

	        $('.visconfig')
	            .css('min-height', +h + 250) // Randomly adds 250px?! TODO: Clarify if that's really necessary.
	            .animate({
	                left: Math.min(0, maxW - w) / 2
	            });

	        dw.backend.fire('chart-resize');

	        this.set({ width_txt: width, height_txt: height });

	        if (this.get().mode === 'web') {
	            this.store.setMetadata('publish.embed-width', Math.round(w));
	            this.store.setMetadata('publish.embed-height', Math.round(h));
	        } else {
	            this.store.setMetadata('publish.export-pdf.width', width);
	            this.store.setMetadata('publish.export-pdf.height', height);
	            this.store.setMetadata('publish.export-pdf.unit', unit);
	        }

	        this.measureChartHeight();
	    },
	    measureChartHeight() {
	        clearTimeout(window.measureChartHeightTimeout);

	        window.measureChartHeightTimeout = setTimeout(() => {
	            const iframe = $('#iframe-vis').get(0).contentWindow;

	            if (iframe) {
	                var chartBody = iframe.document.querySelector('.dw-chart-body');

	                if (chartBody && chartBody.getBoundingClientRect) {
	                    var h = chartBody.getBoundingClientRect().height;
	                    if (h !== this.store.get('metadata.publish.chart-height')) {
	                        this.store.setMetadata('publish.chart-height', h);
	                        if (this.store.save) this.store.save();
	                    }
	                } else {
	                    setTimeout(() => this.measureChartHeight(), 1000);
	                }
	            }
	        }, 1000);
	    },
	    registerDragAndDropListener() {
	        const app = this;
	        const iframe = $('#iframe-wrapper').addClass('resizable');
	        var startX, startY, startWidth, startHeight;

	        iframe.find('.resizer').remove();
	        iframe.append('<div class="resizer resizer-both icon-resize-horizontal"></div>');

	        $('.resizer', iframe).on('mousedown', dragStart);

	        function dragStart(e) {
	            startX = e.clientX;
	            startY = e.clientY;
	            startWidth = iframe.width();
	            startHeight = iframe.height();

	            $(document).on('mousemove', doDrag);
	            $(document).on('mouseup', stopDrag);
	            $('#iframe-vis').addClass('resizing');
	        }

	        function doDrag(e) {
	            iframe.height(startHeight + e.clientY - startY);
	            iframe.width(startWidth + e.clientX - startX);
	            iframe.css('pointer-events', 'none');
	            e.preventDefault();
	            return false;
	        }

	        function stopDrag(e) {
	            $(document).unbind('mousemove', doDrag);
	            $(document).unbind('mouseup', stopDrag);

	            app.set({
	                width: $('#iframe-vis').width(),
	                height: $('#iframe-vis').height()
	            });

	            iframe.css('pointer-events', 'initial');
	            $('#iframe-vis').removeClass('resizing');
	        }
	    },
	    registerTypeListener() {
	        const app = this;

	        dw.backend.on('type-changed', function (metas) {
	            // switch from fixed to fit
	            if (metas[0].height !== 'fixed' && metas[1].height === 'fixed') {
	                app.setHeight(Math.min(app.get().height_px, 500));
	            }
	        });
	    },
	    registerChartHeightListener() {
	        const app = this;

	        window.addEventListener('message', function (e) {
	            var message = e.data;

	            if (typeof message['datawrapper-height'] !== 'undefined') {
	                var h;

	                for (var chartId in message['datawrapper-height']) {
	                    h = message['datawrapper-height'][chartId];
	                }

	                if (
	                    !$('#iframe-vis').hasClass('resizing') &&
	                    $('#iframe-vis').is(':visible')
	                ) {
	                    app.setHeight(h);
	                }
	            }
	        });
	    }
	};

	function oncreate$3() {
	    this.set({
	        mode: this.store.getMetadata('custom.webToPrint.mode', 'web')
	    });
	}
	function onstate$2({ changed, current, previous }) {
	    const app = this;

	    if (!previous) return;

	    if (changed.unit && !changed.width && !changed.height) {
	        // changed unit, let's recompute

	        const factor =
	            current.unit === 'px' ? 1 : current.unit === 'mm' ? IN2MM / DPI : 1 / DPI;

	        this.set({
	            width: +(previous.width_px * factor).toFixed(current.theUnit.decimals),
	            height: +(previous.height_px * factor).toFixed(current.theUnit.decimals),
	            width_txt: +(previous.width_px * factor).toFixed(current.theUnit.decimals),
	            height_txt: +(previous.height_px * factor).toFixed(current.theUnit.decimals)
	        });
	    }

	    if (changed.mode) {
	        if (current.mode === 'web') {
	            this.set({
	                width: this.store.getMetadata('publish.embed-width'),
	                height: this.store.getMetadata('publish.embed-height'),
	                width_txt: this.store.getMetadata('publish.embed-width'),
	                height_txt: this.store.getMetadata('publish.embed-height')
	            });

	            this.registerDragAndDropListener();
	            this.registerTypeListener();
	            this.registerChartHeightListener();

	            app.updateSize();
	        } else {
	            this.set({
	                width: dw.backend.currentChart.get(
	                    'metadata.publish.export-pdf.width',
	                    120
	                ),
	                height: dw.backend.currentChart.get(
	                    'metadata.publish.export-pdf.height',
	                    80
	                ),
	                width_txt: dw.backend.currentChart.get(
	                    'metadata.publish.export-pdf.width',
	                    120
	                ),
	                height_txt: dw.backend.currentChart.get(
	                    'metadata.publish.export-pdf.height',
	                    80
	                ),
	                unit: this.store.getMetadata('publish.export-pdf.unit', 'mm')
	            });

	            app.updateSize();
	        }
	    }

	    if ((changed.width_px || changed.height_px) && current.width_px && current.height_px) {
	        app.updateSize();
	    }
	}
	const file$c = "visualize/Resizer.html";

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.option = list[i];
		return child_ctx;
	}

	function click_handler$2(event) {
		const { component, ctx } = this._svelte;

		component.setWidth(ctx.preset.width);
	}

	function get_each_context$5(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.preset = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$g(component, ctx) {
		var text0, div3, div2, div0, text2, div1, input0, input0_updating = false, text3, input1, input1_updating = false, text4, text5;

		var if_block0 = (ctx.webToPrint) && create_if_block_4(component, ctx);

		function input0_input_handler() {
			input0_updating = true;
			component.set({ width_txt: input0.value });
			input0_updating = false;
		}

		function change_handler(event) {
			component.changed();
		}

		function input1_input_handler() {
			input1_updating = true;
			component.set({ height_txt: input1.value });
			input1_updating = false;
		}

		function change_handler_1(event) {
			component.changed();
		}

		function select_block_type(ctx) {
			if (ctx.mode === "web") return create_if_block_2$1;
			if (ctx.mode === "print") return create_if_block_3;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type && current_block_type(component, ctx);

		var if_block2 = (ctx.printExpanded) && create_if_block$5(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n\n");
				div3 = createElement("div");
				div2 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "Chart size";
				text2 = createText("\n\n        ");
				div1 = createElement("div");
				input0 = createElement("input");
				text3 = createText("\n            ×\n            ");
				input1 = createElement("input");
				text4 = createText("\n\n        ");
				if (if_block1) if_block1.c();
				text5 = createText("\n\n    ");
				if (if_block2) if_block2.c();
				div0.className = "toolbar-caption svelte-163pzyx";
				addLoc(div0, file$c, 15, 8, 427);
				addListener(input0, "input", input0_input_handler);
				addListener(input0, "change", change_handler);
				input0.id = "resize-w";
				input0.className = "input-resize input-large";
				setAttribute(input0, "type", "text");
				addLoc(input0, file$c, 18, 12, 526);
				addListener(input1, "input", input1_input_handler);
				addListener(input1, "change", change_handler_1);
				input1.id = "resize-h";
				input1.className = "input-resize input-large";
				setAttribute(input1, "type", "text");
				addLoc(input1, file$c, 26, 12, 758);
				setStyle(div1, "padding-top", "4px");
				div1.className = "svelte-163pzyx";
				addLoc(div1, file$c, 17, 8, 482);
				setStyle(div2, "display", "flex");
				div2.className = "svelte-163pzyx";
				addLoc(div2, file$c, 14, 4, 390);
				div3.className = "toolbar-container svelte-163pzyx";
				setStyle(div3, "display", "block");
				addLoc(div3, file$c, 13, 0, 330);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, div3, anchor);
				append(div3, div2);
				append(div2, div0);
				append(div2, text2);
				append(div2, div1);
				append(div1, input0);

				input0.value = ctx.width_txt;

				append(div1, text3);
				append(div1, input1);

				input1.value = ctx.height_txt;

				append(div2, text4);
				if (if_block1) if_block1.m(div2, null);
				append(div3, text5);
				if (if_block2) if_block2.m(div3, null);
			},

			p: function update(changed, ctx) {
				if (ctx.webToPrint) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_4(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!input0_updating && changed.width_txt) input0.value = ctx.width_txt;
				if (!input1_updating && changed.height_txt) input1.value = ctx.height_txt;

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if (if_block1) if_block1.d(1);
					if_block1 = current_block_type && current_block_type(component, ctx);
					if (if_block1) if_block1.c();
					if (if_block1) if_block1.m(div2, null);
				}

				if (ctx.printExpanded) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$5(component, ctx);
						if_block2.c();
						if_block2.m(div3, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div3);
				}

				removeListener(input0, "input", input0_input_handler);
				removeListener(input0, "change", change_handler);
				removeListener(input1, "input", input1_input_handler);
				removeListener(input1, "change", change_handler_1);
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
			}
		};
	}

	// (1:0) {#if webToPrint}
	function create_if_block_4(component, ctx) {
		var div3, div0, text1, div1, text2, div1_class_value, text3, div2, text4, div2_class_value;

		function click_handler(event) {
			component.activate('web');
		}

		function click_handler_1(event) {
			component.activate('print');
		}

		return {
			c: function create() {
				div3 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "Mode";
				text1 = createText("\n\n    ");
				div1 = createElement("div");
				text2 = createText("Web");
				text3 = createText("\n    ");
				div2 = createElement("div");
				text4 = createText("Print");
				div0.className = "toolbar-caption svelte-163pzyx";
				addLoc(div0, file$c, 2, 4, 53);
				addListener(div1, "click", click_handler);
				div1.className = div1_class_value = "button " + (ctx.mode === 'web' ? 'active' : '') + " svelte-163pzyx";
				addLoc(div1, file$c, 4, 4, 98);
				addListener(div2, "click", click_handler_1);
				div2.className = div2_class_value = "button " + (ctx.mode === 'print' ? 'active' : '') + " svelte-163pzyx";
				addLoc(div2, file$c, 7, 4, 206);
				div3.className = "toolbar-container svelte-163pzyx";
				addLoc(div3, file$c, 1, 0, 17);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div0);
				append(div3, text1);
				append(div3, div1);
				append(div1, text2);
				append(div3, text3);
				append(div3, div2);
				append(div2, text4);
			},

			p: function update(changed, ctx) {
				if ((changed.mode) && div1_class_value !== (div1_class_value = "button " + (ctx.mode === 'web' ? 'active' : '') + " svelte-163pzyx")) {
					div1.className = div1_class_value;
				}

				if ((changed.mode) && div2_class_value !== (div2_class_value = "button " + (ctx.mode === 'print' ? 'active' : '') + " svelte-163pzyx")) {
					div2.className = div2_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div3);
				}

				removeListener(div1, "click", click_handler);
				removeListener(div2, "click", click_handler_1);
			}
		};
	}

	// (43:42) 
	function create_if_block_3(component, ctx) {
		var div, i, i_class_value;

		function click_handler_1(event) {
			component.togglePrintOptions();
		}

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				i.className = i_class_value = "fa " + (ctx.printExpanded ? 'fa-chevron-up' : 'fa-ellipsis-h') + " svelte-163pzyx";
				addLoc(i, file$c, 48, 12, 1520);
				addListener(div, "click", click_handler_1);
				div.className = "button svelte-163pzyx";
				setStyle(div, "min-width", "12px");
				setStyle(div, "border-right", "none");
				addLoc(div, file$c, 43, 8, 1365);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
			},

			p: function update(changed, ctx) {
				if ((changed.printExpanded) && i_class_value !== (i_class_value = "fa " + (ctx.printExpanded ? 'fa-chevron-up' : 'fa-ellipsis-h') + " svelte-163pzyx")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(div, "click", click_handler_1);
			}
		};
	}

	// (36:8) {#if mode === "web"}
	function create_if_block_2$1(component, ctx) {
		var each_anchor;

		var each_value = ctx.breakpoints;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(component, get_each_context$5(ctx, each_value, i));
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

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.width_px || changed.breakpoints) {
					each_value = ctx.breakpoints;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$5(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (36:29) {#each breakpoints as preset, i}
	function create_each_block_1$1(component, ctx) {
		var div, i_1, i_1_class_value, div_class_value;

		return {
			c: function create() {
				div = createElement("div");
				i_1 = createElement("i");
				setStyle(i_1, "font-size", "" + ctx.preset.iconSize + "px");
				i_1.className = i_1_class_value = "fa " + ctx.preset.icon + " svelte-163pzyx";
				addLoc(i_1, file$c, 40, 12, 1228);

				div._svelte = { component, ctx };

				addListener(div, "click", click_handler$2);
				div.className = div_class_value = "button " + (ctx.width_px >= ctx.preset.minWidth && ctx.width_px <= ctx.preset.maxWidth ? 'active' : '') + " svelte-163pzyx";
				addLoc(div, file$c, 36, 8, 1051);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i_1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.breakpoints) {
					setStyle(i_1, "font-size", "" + ctx.preset.iconSize + "px");
				}

				if ((changed.breakpoints) && i_1_class_value !== (i_1_class_value = "fa " + ctx.preset.icon + " svelte-163pzyx")) {
					i_1.className = i_1_class_value;
				}

				div._svelte.ctx = ctx;
				if ((changed.width_px || changed.breakpoints) && div_class_value !== (div_class_value = "button " + (ctx.width_px >= ctx.preset.minWidth && ctx.width_px <= ctx.preset.maxWidth ? 'active' : '') + " svelte-163pzyx")) {
					div.className = div_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(div, "click", click_handler$2);
			}
		};
	}

	// (54:4) {#if printExpanded}
	function create_if_block$5(component, ctx) {
		var div2, div0, radio_updating = {}, text0, text1, div1, i, text2;

		var radio_initial_data = { options: ctx.units, label: "" };
		if (ctx.unit !== void 0) {
			radio_initial_data.value = ctx.unit;
			radio_updating.value = true;
		}
		var radio = new Radio({
			root: component.root,
			store: component.store,
			data: radio_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!radio_updating.value && changed.value) {
					newState.unit = childState.value;
				}
				component._set(newState);
				radio_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			radio._bind({ value: 1 }, radio.get());
		});

		var if_block = (ctx.hasPresets) && create_if_block_1$3(component, ctx);

		function click_handler_1(event) {
			component.reset();
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				radio._fragment.c();
				text0 = createText("\n\n            ");
				if (if_block) if_block.c();
				text1 = createText("\n\n        ");
				div1 = createElement("div");
				i = createElement("i");
				text2 = createText("  Undo print changes");
				setStyle(div0, "padding", "12px 8px 0px 8px");
				div0.className = "svelte-163pzyx";
				addLoc(div0, file$c, 55, 8, 1760);
				i.className = "fa fa-undo svelte-163pzyx";
				addLoc(i, file$c, 77, 12, 2588);
				addListener(div1, "click", click_handler_1);
				div1.className = "button svelte-163pzyx";
				addLoc(div1, file$c, 76, 8, 2536);
				div2.className = "toolbar-container options svelte-163pzyx";
				setStyle(div2, "display", "block");
				setStyle(div2, "height", "auto");
				setStyle(div2, "z-index", "1");
				addLoc(div2, file$c, 54, 4, 1662);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				radio._mount(div0, null);
				append(div0, text0);
				if (if_block) if_block.m(div0, null);
				append(div2, text1);
				append(div2, div1);
				append(div1, i);
				append(div1, text2);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var radio_changes = {};
				if (changed.units) radio_changes.options = ctx.units;
				if (!radio_updating.value && changed.unit) {
					radio_changes.value = ctx.unit;
					radio_updating.value = ctx.unit !== void 0;
				}
				radio._set(radio_changes);
				radio_updating = {};

				if (ctx.hasPresets) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$3(component, ctx);
						if_block.c();
						if_block.m(div0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				radio.destroy();
				if (if_block) if_block.d();
				removeListener(div1, "click", click_handler_1);
			}
		};
	}

	// (60:12) {#if hasPresets}
	function create_if_block_1$3(component, ctx) {
		var div1, div0, select, select_updating = false;

		var each_value_1 = ctx.presetOptions;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block$5(component, get_each_context_1$1(ctx, each_value_1, i));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ preset: selectValue(select) });
			select_updating = false;
		}

		function change_handler(event) {
			component.usePreset();
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				select = createElement("select");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addListener(select, "change", select_change_handler);
				if (!('preset' in ctx)) component.root._beforecreate.push(select_change_handler);
				addListener(select, "change", change_handler);
				setStyle(select, "max-width", "170px");
				setStyle(select, "margin-bottom", "0");
				addLoc(select, file$c, 62, 20, 2062);
				div0.className = "controls";
				addLoc(div0, file$c, 61, 16, 2019);
				div1.className = "control-group svelte-163pzyx";
				setStyle(div1, "margin-bottom", "6px");
				addLoc(div1, file$c, 60, 12, 1947);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, select);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, ctx.preset);
			},

			p: function update(changed, ctx) {
				if (changed.presetOptions) {
					each_value_1 = ctx.presetOptions;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$5(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}

				if (!select_updating && changed.preset) selectOption(select, ctx.preset);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				destroyEach(each_blocks, detach);

				removeListener(select, "change", select_change_handler);
				removeListener(select, "change", change_handler);
			}
		};
	}

	// (68:24) {#each presetOptions as option }
	function create_each_block$5(component, ctx) {
		var option, text_value = ctx.option.label, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.option.value;
				option.value = option.__value;
				addLoc(option, file$c, 68, 24, 2333);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.presetOptions) && text_value !== (text_value = ctx.option.label)) {
					setData(text, text_value);
				}

				if ((changed.presetOptions) && option_value_value !== (option_value_value = ctx.option.value)) {
					option.__value = option_value_value;
				}

				option.value = option.__value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	function Resizer(options) {
		this._debugName = '<Resizer>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$a(), options.data);

		this._recompute({ width: 1, unit: 1, height: 1, units: 1, theme: 1, hasPresets: 1 }, this._state);
		if (!('width' in this._state)) console.warn("<Resizer> was created without expected data property 'width'");
		if (!('unit' in this._state)) console.warn("<Resizer> was created without expected data property 'unit'");
		if (!('height' in this._state)) console.warn("<Resizer> was created without expected data property 'height'");
		if (!('units' in this._state)) console.warn("<Resizer> was created without expected data property 'units'");
		if (!('theme' in this._state)) console.warn("<Resizer> was created without expected data property 'theme'");

		if (!('webToPrint' in this._state)) console.warn("<Resizer> was created without expected data property 'webToPrint'");
		if (!('mode' in this._state)) console.warn("<Resizer> was created without expected data property 'mode'");
		if (!('width_txt' in this._state)) console.warn("<Resizer> was created without expected data property 'width_txt'");
		if (!('height_txt' in this._state)) console.warn("<Resizer> was created without expected data property 'height_txt'");
		if (!('breakpoints' in this._state)) console.warn("<Resizer> was created without expected data property 'breakpoints'");

		if (!('printExpanded' in this._state)) console.warn("<Resizer> was created without expected data property 'printExpanded'");
		if (!('preset' in this._state)) console.warn("<Resizer> was created without expected data property 'preset'");
		this._intro = true;

		this._handlers.state = [onstate$2];

		onstate$2.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$g(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$3.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Resizer.prototype, protoDev);
	assign(Resizer.prototype, methods$4);

	Resizer.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('width_px' in newState && !this._updatingReadonlyProperty) throw new Error("<Resizer>: Cannot set read-only property 'width_px'");
		if ('height_px' in newState && !this._updatingReadonlyProperty) throw new Error("<Resizer>: Cannot set read-only property 'height_px'");
		if ('theUnit' in newState && !this._updatingReadonlyProperty) throw new Error("<Resizer>: Cannot set read-only property 'theUnit'");
		if ('hasPresets' in newState && !this._updatingReadonlyProperty) throw new Error("<Resizer>: Cannot set read-only property 'hasPresets'");
		if ('presets' in newState && !this._updatingReadonlyProperty) throw new Error("<Resizer>: Cannot set read-only property 'presets'");
		if ('presetOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<Resizer>: Cannot set read-only property 'presetOptions'");
	};

	Resizer.prototype._recompute = function _recompute(changed, state) {
		if (changed.width || changed.unit) {
			if (this._differs(state.width_px, (state.width_px = width_px(state)))) changed.width_px = true;
		}

		if (changed.height || changed.unit) {
			if (this._differs(state.height_px, (state.height_px = height_px(state)))) changed.height_px = true;
		}

		if (changed.unit || changed.units) {
			if (this._differs(state.theUnit, (state.theUnit = theUnit(state)))) changed.theUnit = true;
		}

		if (changed.theme) {
			if (this._differs(state.hasPresets, (state.hasPresets = hasPresets(state)))) changed.hasPresets = true;
		}

		if (changed.hasPresets || changed.theme) {
			if (this._differs(state.presets, (state.presets = presets(state)))) changed.presets = true;
			if (this._differs(state.presetOptions, (state.presetOptions = presetOptions(state)))) changed.presetOptions = true;
		}
	};

	/* Users/sjockers/Projects/datawrapper/controls/v2/Alert.html generated by Svelte v2.16.1 */

	function data$b() {
	    return {
	        visible: false,
	        type: '',
	        closeable: true
	    };
	}
	var methods$5 = {
	    close() {
	        this.set({ visible: false });
	        this.fire('close');
	    }
	};

	const file$d = "Users/sjockers/Projects/datawrapper/controls/v2/Alert.html";

	function create_main_fragment$h(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.visible) && create_if_block$6(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.visible) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$6(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if visible}
	function create_if_block$6(component, ctx) {
		var div, text0, slot_content_default = component._slotted.default, slot_content_default_before, text1;

		var if_block = (ctx.closeable) && create_if_block_1$4(component);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block) if_block.c();
				text0 = createText("\n    ");
				if (!slot_content_default) {
					text1 = createText("content");
				}
				div.className = "alert svelte-9b8qew";
				toggleClass(div, "alert-success", ctx.type==='success');
				toggleClass(div, "alert-warning", ctx.type==='warning');
				toggleClass(div, "alert-error", ctx.type==='error');
				addLoc(div, file$d, 1, 0, 14);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block) if_block.m(div, null);
				append(div, text0);
				if (!slot_content_default) {
					append(div, text1);
				}

				else {
					append(div, slot_content_default_before || (slot_content_default_before = createComment()));
					append(div, slot_content_default);
				}
			},

			p: function update(changed, ctx) {
				if (ctx.closeable) {
					if (!if_block) {
						if_block = create_if_block_1$4(component);
						if_block.c();
						if_block.m(div, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.type) {
					toggleClass(div, "alert-success", ctx.type==='success');
					toggleClass(div, "alert-warning", ctx.type==='warning');
					toggleClass(div, "alert-error", ctx.type==='error');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block) if_block.d();

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}
			}
		};
	}

	// (3:4) {#if closeable}
	function create_if_block_1$4(component, ctx) {
		var button;

		function click_handler(event) {
			component.close();
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "×";
				addListener(button, "click", click_handler);
				button.type = "button";
				setAttribute(button, "aria-label", "close");
				button.className = "close";
				addLoc(button, file$d, 3, 4, 171);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	function Alert(options) {
		this._debugName = '<Alert>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$b(), options.data);
		if (!('visible' in this._state)) console.warn("<Alert> was created without expected data property 'visible'");
		if (!('type' in this._state)) console.warn("<Alert> was created without expected data property 'type'");
		if (!('closeable' in this._state)) console.warn("<Alert> was created without expected data property 'closeable'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$h(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Alert.prototype, protoDev);
	assign(Alert.prototype, methods$5);

	Alert.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* visualize/Notifications.html generated by Svelte v2.16.1 */

	function data$c() {
	    return {
	        notifications: []
	    };
	}
	const file$e = "visualize/Notifications.html";

	function get_each_context$6(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.note = list[i];
		return child_ctx;
	}

	function create_main_fragment$i(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.notifications && ctx.notifications.length) && create_if_block$7(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.notifications && ctx.notifications.length) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$7(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if notifications && notifications.length}
	function create_if_block$7(component, ctx) {
		var div;

		var each_value = ctx.notifications;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$6(component, get_each_context$6(ctx, each_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "notifications";
				addLoc(div, file$e, 1, 0, 44);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.notifications) {
					each_value = ctx.notifications;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$6(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$6(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (3:4) {#each notifications as note}
	function create_each_block$6(component, ctx) {
		var raw_value = ctx.note.message, raw_after, text;

		var alert_initial_data = {
		 	visible: true,
		 	type: ctx.note.type,
		 	closeable: ctx.note.closeable
		 };
		var alert = new Alert({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: alert_initial_data
		});

		return {
			c: function create() {
				raw_after = createElement('noscript');
				text = createText("\n    ");
				alert._fragment.c();
			},

			m: function mount(target, anchor) {
				append(alert._slotted.default, raw_after);
				raw_after.insertAdjacentHTML("beforebegin", raw_value);
				append(alert._slotted.default, text);
				alert._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.notifications) && raw_value !== (raw_value = ctx.note.message)) {
					detachBefore(raw_after);
					raw_after.insertAdjacentHTML("beforebegin", raw_value);
				}

				var alert_changes = {};
				if (changed.notifications) alert_changes.type = ctx.note.type;
				if (changed.notifications) alert_changes.closeable = ctx.note.closeable;
				alert._set(alert_changes);
			},

			d: function destroy(detach) {
				alert.destroy(detach);
			}
		};
	}

	function Notifications(options) {
		this._debugName = '<Notifications>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$c(), options.data);
		if (!('notifications' in this._state)) console.warn("<Notifications> was created without expected data property 'notifications'");
		this._intro = true;

		this._fragment = create_main_fragment$i(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Notifications.prototype, protoDev);

	Notifications.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* eslint-disable */
	const blinder = (function () {

	    function createCommonjsModule(fn, module) {
	        return (module = { exports: {} }), fn(module, module.exports), module.exports;
	    }

	    var oneColorAllDebug = createCommonjsModule(function (module, exports) {
	        /*jshint evil:true, onevar:false*/
	        /*global define*/
	        var installedColorSpaces = [],
	            namedColors = {},
	            undef = function (obj) {
	                return typeof obj === 'undefined';
	            },
	            channelRegExp = /\s*(\.\d+|\d+(?:\.\d+)?)(%)?\s*/,
	            percentageChannelRegExp = /\s*(\.\d+|100|\d?\d(?:\.\d+)?)%\s*/,
	            alphaChannelRegExp = /\s*(\.\d+|\d+(?:\.\d+)?)\s*/,
	            cssColorRegExp = new RegExp(
	                '^(rgb|hsl|hsv)a?' +
	                    '\\(' +
	                    channelRegExp.source +
	                    ',' +
	                    channelRegExp.source +
	                    ',' +
	                    channelRegExp.source +
	                    '(?:,' +
	                    alphaChannelRegExp.source +
	                    ')?' +
	                    '\\)$',
	                'i'
	            );

	        function ONECOLOR(obj) {
	            if (Object.prototype.toString.apply(obj) === '[object Array]') {
	                if (typeof obj[0] === 'string' && typeof ONECOLOR[obj[0]] === 'function') {
	                    // Assumed array from .toJSON()
	                    return new ONECOLOR[obj[0]](obj.slice(1, obj.length));
	                } else if (obj.length === 4) {
	                    // Assumed 4 element int RGB array from canvas with all channels [0;255]
	                    return new ONECOLOR.RGB(obj[0] / 255, obj[1] / 255, obj[2] / 255, obj[3] / 255);
	                }
	            } else if (typeof obj === 'string') {
	                var lowerCased = obj.toLowerCase();
	                if (namedColors[lowerCased]) {
	                    obj = '#' + namedColors[lowerCased];
	                }
	                if (lowerCased === 'transparent') {
	                    obj = 'rgba(0,0,0,0)';
	                }
	                // Test for CSS rgb(....) string
	                var matchCssSyntax = obj.match(cssColorRegExp);
	                if (matchCssSyntax) {
	                    var colorSpaceName = matchCssSyntax[1].toUpperCase(),
	                        alpha = undef(matchCssSyntax[8])
	                            ? matchCssSyntax[8]
	                            : parseFloat(matchCssSyntax[8]),
	                        hasHue = colorSpaceName[0] === 'H',
	                        firstChannelDivisor = matchCssSyntax[3] ? 100 : hasHue ? 360 : 255,
	                        secondChannelDivisor = matchCssSyntax[5] || hasHue ? 100 : 255,
	                        thirdChannelDivisor = matchCssSyntax[7] || hasHue ? 100 : 255;
	                    if (undef(ONECOLOR[colorSpaceName])) {
	                        throw new Error('one.color.' + colorSpaceName + ' is not installed.');
	                    }
	                    return new ONECOLOR[colorSpaceName](
	                        parseFloat(matchCssSyntax[2]) / firstChannelDivisor,
	                        parseFloat(matchCssSyntax[4]) / secondChannelDivisor,
	                        parseFloat(matchCssSyntax[6]) / thirdChannelDivisor,
	                        alpha
	                    );
	                }
	                // Assume hex syntax
	                if (obj.length < 6) {
	                    // Allow CSS shorthand
	                    obj = obj.replace(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i, '$1$1$2$2$3$3');
	                }
	                // Split obj into red, green, and blue components
	                var hexMatch = obj.match(
	                    /^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i
	                );
	                if (hexMatch) {
	                    return new ONECOLOR.RGB(
	                        parseInt(hexMatch[1], 16) / 255,
	                        parseInt(hexMatch[2], 16) / 255,
	                        parseInt(hexMatch[3], 16) / 255
	                    );
	                }

	                // No match so far. Lets try the less likely ones
	                if (ONECOLOR.CMYK) {
	                    var cmykMatch = obj.match(
	                        new RegExp(
	                            '^cmyk' +
	                                '\\(' +
	                                percentageChannelRegExp.source +
	                                ',' +
	                                percentageChannelRegExp.source +
	                                ',' +
	                                percentageChannelRegExp.source +
	                                ',' +
	                                percentageChannelRegExp.source +
	                                '\\)$',
	                            'i'
	                        )
	                    );
	                    if (cmykMatch) {
	                        return new ONECOLOR.CMYK(
	                            parseFloat(cmykMatch[1]) / 100,
	                            parseFloat(cmykMatch[2]) / 100,
	                            parseFloat(cmykMatch[3]) / 100,
	                            parseFloat(cmykMatch[4]) / 100
	                        );
	                    }
	                }
	            } else if (typeof obj === 'object' && obj.isColor) {
	                return obj;
	            }
	            return false;
	        }

	        function installColorSpace(colorSpaceName, propertyNames, config) {
	            ONECOLOR[colorSpaceName] = new Function(
	                propertyNames.join(','),
	                // Allow passing an array to the constructor:
	                'if (Object.prototype.toString.apply(' +
	                    propertyNames[0] +
	                    ") === '[object Array]') {" +
	                    propertyNames
	                        .map(function (propertyName, i) {
	                            return propertyName + '=' + propertyNames[0] + '[' + i + '];';
	                        })
	                        .reverse()
	                        .join('') +
	                    '}' +
	                    'if (' +
	                    propertyNames
	                        .filter(function (propertyName) {
	                            return propertyName !== 'alpha';
	                        })
	                        .map(function (propertyName) {
	                            return 'isNaN(' + propertyName + ')';
	                        })
	                        .join('||') +
	                    '){' +
	                    'throw new Error("[' +
	                    colorSpaceName +
	                    ']: Invalid color: ("+' +
	                    propertyNames.join('+","+') +
	                    '+")");}' +
	                    propertyNames
	                        .map(function (propertyName) {
	                            if (propertyName === 'hue') {
	                                return 'this._hue=hue<0?hue-Math.floor(hue):hue%1'; // Wrap
	                            } else if (propertyName === 'alpha') {
	                                return 'this._alpha=(isNaN(alpha)||alpha>1)?1:(alpha<0?0:alpha);';
	                            } else {
	                                return (
	                                    'this._' +
	                                    propertyName +
	                                    '=' +
	                                    propertyName +
	                                    '<0?0:(' +
	                                    propertyName +
	                                    '>1?1:' +
	                                    propertyName +
	                                    ')'
	                                );
	                            }
	                        })
	                        .join(';') +
	                    ';'
	            );
	            ONECOLOR[colorSpaceName].propertyNames = propertyNames;

	            var prototype = ONECOLOR[colorSpaceName].prototype;

	            ['valueOf', 'hex', 'hexa', 'css', 'cssa'].forEach(function (methodName) {
	                prototype[methodName] =
	                    prototype[methodName] ||
	                    (colorSpaceName === 'RGB'
	                        ? prototype.hex
	                        : new Function('return this.rgb().' + methodName + '();'));
	            });

	            prototype.isColor = true;

	            prototype.equals = function (otherColor, epsilon) {
	                if (undef(epsilon)) {
	                    epsilon = 1e-10;
	                }

	                otherColor = otherColor[colorSpaceName.toLowerCase()]();

	                for (var i = 0; i < propertyNames.length; i = i + 1) {
	                    if (
	                        Math.abs(
	                            this['_' + propertyNames[i]] - otherColor['_' + propertyNames[i]]
	                        ) > epsilon
	                    ) {
	                        return false;
	                    }
	                }

	                return true;
	            };

	            prototype.toJSON = new Function(
	                "return ['" +
	                    colorSpaceName +
	                    "', " +
	                    propertyNames
	                        .map(function (propertyName) {
	                            return 'this._' + propertyName;
	                        }, this)
	                        .join(', ') +
	                    '];'
	            );

	            for (var propertyName in config) {
	                if (config.hasOwnProperty(propertyName)) {
	                    var matchFromColorSpace = propertyName.match(/^from(.*)$/);
	                    if (matchFromColorSpace) {
	                        ONECOLOR[matchFromColorSpace[1].toUpperCase()].prototype[
	                            colorSpaceName.toLowerCase()
	                        ] = config[propertyName];
	                    } else {
	                        prototype[propertyName] = config[propertyName];
	                    }
	                }
	            }

	            // It is pretty easy to implement the conversion to the same color space:
	            prototype[colorSpaceName.toLowerCase()] = function () {
	                return this;
	            };
	            prototype.toString = new Function(
	                'return "[one.color.' +
	                    colorSpaceName +
	                    ':"+' +
	                    propertyNames
	                        .map(function (propertyName, i) {
	                            return '" ' + propertyNames[i] + '="+this._' + propertyName;
	                        })
	                        .join('+') +
	                    '+"]";'
	            );

	            // Generate getters and setters
	            propertyNames.forEach(function (propertyName, i) {
	                prototype[propertyName] = prototype[
	                    propertyName === 'black' ? 'k' : propertyName[0]
	                ] = new Function(
	                    'value',
	                    'isDelta',
	                    // Simple getter mode: color.red()
	                    "if (typeof value === 'undefined') {" +
	                        'return this._' +
	                        propertyName +
	                        ';' +
	                        '}' +
	                        // Adjuster: color.red(+.2, true)
	                        'if (isDelta) {' +
	                        'return new this.constructor(' +
	                        propertyNames
	                            .map(function (otherPropertyName, i) {
	                                return (
	                                    'this._' +
	                                    otherPropertyName +
	                                    (propertyName === otherPropertyName ? '+value' : '')
	                                );
	                            })
	                            .join(', ') +
	                        ');' +
	                        '}' +
	                        // Setter: color.red(.2);
	                        'return new this.constructor(' +
	                        propertyNames
	                            .map(function (otherPropertyName, i) {
	                                return propertyName === otherPropertyName
	                                    ? 'value'
	                                    : 'this._' + otherPropertyName;
	                            })
	                            .join(', ') +
	                        ');'
	                );
	            });

	            function installForeignMethods(targetColorSpaceName, sourceColorSpaceName) {
	                var obj = {};
	                obj[sourceColorSpaceName.toLowerCase()] = new Function(
	                    'return this.rgb().' + sourceColorSpaceName.toLowerCase() + '();'
	                ); // Fallback
	                ONECOLOR[sourceColorSpaceName].propertyNames.forEach(function (propertyName, i) {
	                    obj[propertyName] = obj[
	                        propertyName === 'black' ? 'k' : propertyName[0]
	                    ] = new Function(
	                        'value',
	                        'isDelta',
	                        'return this.' +
	                            sourceColorSpaceName.toLowerCase() +
	                            '().' +
	                            propertyName +
	                            '(value, isDelta);'
	                    );
	                });
	                for (var prop in obj) {
	                    if (
	                        obj.hasOwnProperty(prop) &&
	                        ONECOLOR[targetColorSpaceName].prototype[prop] === undefined
	                    ) {
	                        ONECOLOR[targetColorSpaceName].prototype[prop] = obj[prop];
	                    }
	                }
	            }

	            installedColorSpaces.forEach(function (otherColorSpaceName) {
	                installForeignMethods(colorSpaceName, otherColorSpaceName);
	                installForeignMethods(otherColorSpaceName, colorSpaceName);
	            });

	            installedColorSpaces.push(colorSpaceName);
	        }

	        ONECOLOR.installMethod = function (name, fn) {
	            installedColorSpaces.forEach(function (colorSpace) {
	                ONECOLOR[colorSpace].prototype[name] = fn;
	            });
	        };

	        installColorSpace('RGB', ['red', 'green', 'blue', 'alpha'], {
	            hex: function () {
	                var hexString = (
	                    Math.round(255 * this._red) * 0x10000 +
	                    Math.round(255 * this._green) * 0x100 +
	                    Math.round(255 * this._blue)
	                ).toString(16);
	                return '#' + '00000'.substr(0, 6 - hexString.length) + hexString;
	            },

	            hexa: function () {
	                var alphaString = Math.round(this._alpha * 255).toString(16);
	                return (
	                    '#' +
	                    '00'.substr(0, 2 - alphaString.length) +
	                    alphaString +
	                    this.hex().substr(1, 6)
	                );
	            },

	            css: function () {
	                return (
	                    'rgb(' +
	                    Math.round(255 * this._red) +
	                    ',' +
	                    Math.round(255 * this._green) +
	                    ',' +
	                    Math.round(255 * this._blue) +
	                    ')'
	                );
	            },

	            cssa: function () {
	                return (
	                    'rgba(' +
	                    Math.round(255 * this._red) +
	                    ',' +
	                    Math.round(255 * this._green) +
	                    ',' +
	                    Math.round(255 * this._blue) +
	                    ',' +
	                    this._alpha +
	                    ')'
	                );
	            }
	        });
	        {
	            // Node module export
	            module.exports = ONECOLOR;
	        }

	        if (typeof jQuery !== 'undefined' && undef(jQuery.color)) {
	            jQuery.color = ONECOLOR;
	        }

	        /*global namedColors*/
	        namedColors = {
	            aliceblue: 'f0f8ff',
	            antiquewhite: 'faebd7',
	            aqua: '0ff',
	            aquamarine: '7fffd4',
	            azure: 'f0ffff',
	            beige: 'f5f5dc',
	            bisque: 'ffe4c4',
	            black: '000',
	            blanchedalmond: 'ffebcd',
	            blue: '00f',
	            blueviolet: '8a2be2',
	            brown: 'a52a2a',
	            burlywood: 'deb887',
	            cadetblue: '5f9ea0',
	            chartreuse: '7fff00',
	            chocolate: 'd2691e',
	            coral: 'ff7f50',
	            cornflowerblue: '6495ed',
	            cornsilk: 'fff8dc',
	            crimson: 'dc143c',
	            cyan: '0ff',
	            darkblue: '00008b',
	            darkcyan: '008b8b',
	            darkgoldenrod: 'b8860b',
	            darkgray: 'a9a9a9',
	            darkgrey: 'a9a9a9',
	            darkgreen: '006400',
	            darkkhaki: 'bdb76b',
	            darkmagenta: '8b008b',
	            darkolivegreen: '556b2f',
	            darkorange: 'ff8c00',
	            darkorchid: '9932cc',
	            darkred: '8b0000',
	            darksalmon: 'e9967a',
	            darkseagreen: '8fbc8f',
	            darkslateblue: '483d8b',
	            darkslategray: '2f4f4f',
	            darkslategrey: '2f4f4f',
	            darkturquoise: '00ced1',
	            darkviolet: '9400d3',
	            deeppink: 'ff1493',
	            deepskyblue: '00bfff',
	            dimgray: '696969',
	            dimgrey: '696969',
	            dodgerblue: '1e90ff',
	            firebrick: 'b22222',
	            floralwhite: 'fffaf0',
	            forestgreen: '228b22',
	            fuchsia: 'f0f',
	            gainsboro: 'dcdcdc',
	            ghostwhite: 'f8f8ff',
	            gold: 'ffd700',
	            goldenrod: 'daa520',
	            gray: '808080',
	            grey: '808080',
	            green: '008000',
	            greenyellow: 'adff2f',
	            honeydew: 'f0fff0',
	            hotpink: 'ff69b4',
	            indianred: 'cd5c5c',
	            indigo: '4b0082',
	            ivory: 'fffff0',
	            khaki: 'f0e68c',
	            lavender: 'e6e6fa',
	            lavenderblush: 'fff0f5',
	            lawngreen: '7cfc00',
	            lemonchiffon: 'fffacd',
	            lightblue: 'add8e6',
	            lightcoral: 'f08080',
	            lightcyan: 'e0ffff',
	            lightgoldenrodyellow: 'fafad2',
	            lightgray: 'd3d3d3',
	            lightgrey: 'd3d3d3',
	            lightgreen: '90ee90',
	            lightpink: 'ffb6c1',
	            lightsalmon: 'ffa07a',
	            lightseagreen: '20b2aa',
	            lightskyblue: '87cefa',
	            lightslategray: '789',
	            lightslategrey: '789',
	            lightsteelblue: 'b0c4de',
	            lightyellow: 'ffffe0',
	            lime: '0f0',
	            limegreen: '32cd32',
	            linen: 'faf0e6',
	            magenta: 'f0f',
	            maroon: '800000',
	            mediumaquamarine: '66cdaa',
	            mediumblue: '0000cd',
	            mediumorchid: 'ba55d3',
	            mediumpurple: '9370d8',
	            mediumseagreen: '3cb371',
	            mediumslateblue: '7b68ee',
	            mediumspringgreen: '00fa9a',
	            mediumturquoise: '48d1cc',
	            mediumvioletred: 'c71585',
	            midnightblue: '191970',
	            mintcream: 'f5fffa',
	            mistyrose: 'ffe4e1',
	            moccasin: 'ffe4b5',
	            navajowhite: 'ffdead',
	            navy: '000080',
	            oldlace: 'fdf5e6',
	            olive: '808000',
	            olivedrab: '6b8e23',
	            orange: 'ffa500',
	            orangered: 'ff4500',
	            orchid: 'da70d6',
	            palegoldenrod: 'eee8aa',
	            palegreen: '98fb98',
	            paleturquoise: 'afeeee',
	            palevioletred: 'd87093',
	            papayawhip: 'ffefd5',
	            peachpuff: 'ffdab9',
	            peru: 'cd853f',
	            pink: 'ffc0cb',
	            plum: 'dda0dd',
	            powderblue: 'b0e0e6',
	            purple: '800080',
	            rebeccapurple: '639',
	            red: 'f00',
	            rosybrown: 'bc8f8f',
	            royalblue: '4169e1',
	            saddlebrown: '8b4513',
	            salmon: 'fa8072',
	            sandybrown: 'f4a460',
	            seagreen: '2e8b57',
	            seashell: 'fff5ee',
	            sienna: 'a0522d',
	            silver: 'c0c0c0',
	            skyblue: '87ceeb',
	            slateblue: '6a5acd',
	            slategray: '708090',
	            slategrey: '708090',
	            snow: 'fffafa',
	            springgreen: '00ff7f',
	            steelblue: '4682b4',
	            tan: 'd2b48c',
	            teal: '008080',
	            thistle: 'd8bfd8',
	            tomato: 'ff6347',
	            turquoise: '40e0d0',
	            violet: 'ee82ee',
	            wheat: 'f5deb3',
	            white: 'fff',
	            whitesmoke: 'f5f5f5',
	            yellow: 'ff0',
	            yellowgreen: '9acd32'
	        };

	        /*global INCLUDE, installColorSpace, ONECOLOR*/

	        installColorSpace('XYZ', ['x', 'y', 'z', 'alpha'], {
	            fromRgb: function () {
	                // http://www.easyrgb.com/index.php?X=MATH&H=02#text2
	                var convert = function (channel) {
	                        return channel > 0.04045
	                            ? Math.pow((channel + 0.055) / 1.055, 2.4)
	                            : channel / 12.92;
	                    },
	                    r = convert(this._red),
	                    g = convert(this._green),
	                    b = convert(this._blue);

	                // Reference white point sRGB D65:
	                // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	                return new ONECOLOR.XYZ(
	                    r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
	                    r * 0.2126729 + g * 0.7151522 + b * 0.072175,
	                    r * 0.0193339 + g * 0.119192 + b * 0.9503041,
	                    this._alpha
	                );
	            },

	            rgb: function () {
	                // http://www.easyrgb.com/index.php?X=MATH&H=01#text1
	                var x = this._x,
	                    y = this._y,
	                    z = this._z,
	                    convert = function (channel) {
	                        return channel > 0.0031308
	                            ? 1.055 * Math.pow(channel, 1 / 2.4) - 0.055
	                            : 12.92 * channel;
	                    };

	                // Reference white point sRGB D65:
	                // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	                return new ONECOLOR.RGB(
	                    convert(x * 3.2404542 + y * -1.5371385 + z * -0.4985314),
	                    convert(x * -0.969266 + y * 1.8760108 + z * 0.041556),
	                    convert(x * 0.0556434 + y * -0.2040259 + z * 1.0572252),
	                    this._alpha
	                );
	            },

	            lab: function () {
	                // http://www.easyrgb.com/index.php?X=MATH&H=07#text7
	                var convert = function (channel) {
	                        return channel > 0.008856
	                            ? Math.pow(channel, 1 / 3)
	                            : 7.787037 * channel + 4 / 29;
	                    },
	                    x = convert(this._x / 95.047),
	                    y = convert(this._y / 100.0),
	                    z = convert(this._z / 108.883);

	                return new ONECOLOR.LAB(116 * y - 16, 500 * (x - y), 200 * (y - z), this._alpha);
	            }
	        });

	        /*global INCLUDE, installColorSpace, ONECOLOR*/

	        installColorSpace('LAB', ['l', 'a', 'b', 'alpha'], {
	            fromRgb: function () {
	                return this.xyz().lab();
	            },

	            rgb: function () {
	                return this.xyz().rgb();
	            },

	            xyz: function () {
	                // http://www.easyrgb.com/index.php?X=MATH&H=08#text8
	                var convert = function (channel) {
	                        var pow = Math.pow(channel, 3);
	                        return pow > 0.008856 ? pow : (channel - 16 / 116) / 7.87;
	                    },
	                    y = (this._l + 16) / 116,
	                    x = this._a / 500 + y,
	                    z = y - this._b / 200;

	                return new ONECOLOR.XYZ(
	                    convert(x) * 95.047,
	                    convert(y) * 100.0,
	                    convert(z) * 108.883,
	                    this._alpha
	                );
	            }
	        });

	        /*global one*/

	        installColorSpace('HSV', ['hue', 'saturation', 'value', 'alpha'], {
	            rgb: function () {
	                var hue = this._hue,
	                    saturation = this._saturation,
	                    value = this._value,
	                    i = Math.min(5, Math.floor(hue * 6)),
	                    f = hue * 6 - i,
	                    p = value * (1 - saturation),
	                    q = value * (1 - f * saturation),
	                    t = value * (1 - (1 - f) * saturation),
	                    red,
	                    green,
	                    blue;
	                switch (i) {
	                    case 0:
	                        red = value;
	                        green = t;
	                        blue = p;
	                        break;
	                    case 1:
	                        red = q;
	                        green = value;
	                        blue = p;
	                        break;
	                    case 2:
	                        red = p;
	                        green = value;
	                        blue = t;
	                        break;
	                    case 3:
	                        red = p;
	                        green = q;
	                        blue = value;
	                        break;
	                    case 4:
	                        red = t;
	                        green = p;
	                        blue = value;
	                        break;
	                    case 5:
	                        red = value;
	                        green = p;
	                        blue = q;
	                        break;
	                }
	                return new ONECOLOR.RGB(red, green, blue, this._alpha);
	            },

	            hsl: function () {
	                var l = (2 - this._saturation) * this._value,
	                    sv = this._saturation * this._value,
	                    svDivisor = l <= 1 ? l : 2 - l,
	                    saturation;

	                // Avoid division by zero when lightness approaches zero:
	                if (svDivisor < 1e-9) {
	                    saturation = 0;
	                } else {
	                    saturation = sv / svDivisor;
	                }
	                return new ONECOLOR.HSL(this._hue, saturation, l / 2, this._alpha);
	            },

	            fromRgb: function () {
	                // Becomes one.color.RGB.prototype.hsv
	                var red = this._red,
	                    green = this._green,
	                    blue = this._blue,
	                    max = Math.max(red, green, blue),
	                    min = Math.min(red, green, blue),
	                    delta = max - min,
	                    hue,
	                    saturation = max === 0 ? 0 : delta / max,
	                    value = max;
	                if (delta === 0) {
	                    hue = 0;
	                } else {
	                    switch (max) {
	                        case red:
	                            hue = (green - blue) / delta / 6 + (green < blue ? 1 : 0);
	                            break;
	                        case green:
	                            hue = (blue - red) / delta / 6 + 1 / 3;
	                            break;
	                        case blue:
	                            hue = (red - green) / delta / 6 + 2 / 3;
	                            break;
	                    }
	                }
	                return new ONECOLOR.HSV(hue, saturation, value, this._alpha);
	            }
	        });

	        /*global one*/

	        installColorSpace('HSL', ['hue', 'saturation', 'lightness', 'alpha'], {
	            hsv: function () {
	                // Algorithm adapted from http://wiki.secondlife.com/wiki/Color_conversion_scripts
	                var l = this._lightness * 2,
	                    s = this._saturation * (l <= 1 ? l : 2 - l),
	                    saturation;

	                // Avoid division by zero when l + s is very small (approaching black):
	                if (l + s < 1e-9) {
	                    saturation = 0;
	                } else {
	                    saturation = (2 * s) / (l + s);
	                }

	                return new ONECOLOR.HSV(this._hue, saturation, (l + s) / 2, this._alpha);
	            },

	            rgb: function () {
	                return this.hsv().rgb();
	            },

	            fromRgb: function () {
	                // Becomes one.color.RGB.prototype.hsv
	                return this.hsv().hsl();
	            }
	        });

	        /*global one*/

	        installColorSpace('CMYK', ['cyan', 'magenta', 'yellow', 'black', 'alpha'], {
	            rgb: function () {
	                return new ONECOLOR.RGB(
	                    1 - this._cyan * (1 - this._black) - this._black,
	                    1 - this._magenta * (1 - this._black) - this._black,
	                    1 - this._yellow * (1 - this._black) - this._black,
	                    this._alpha
	                );
	            },

	            fromRgb: function () {
	                // Becomes one.color.RGB.prototype.cmyk
	                // Adapted from http://www.javascripter.net/faq/rgb2cmyk.htm
	                var red = this._red,
	                    green = this._green,
	                    blue = this._blue,
	                    cyan = 1 - red,
	                    magenta = 1 - green,
	                    yellow = 1 - blue,
	                    black = 1;
	                if (red || green || blue) {
	                    black = Math.min(cyan, Math.min(magenta, yellow));
	                    cyan = (cyan - black) / (1 - black);
	                    magenta = (magenta - black) / (1 - black);
	                    yellow = (yellow - black) / (1 - black);
	                } else {
	                    black = 1;
	                }
	                return new ONECOLOR.CMYK(cyan, magenta, yellow, black, this._alpha);
	            }
	        });

	        ONECOLOR.installMethod('clearer', function (amount) {
	            return this.alpha(isNaN(amount) ? -0.1 : -amount, true);
	        });

	        ONECOLOR.installMethod('darken', function (amount) {
	            return this.lightness(isNaN(amount) ? -0.1 : -amount, true);
	        });

	        ONECOLOR.installMethod('desaturate', function (amount) {
	            return this.saturation(isNaN(amount) ? -0.1 : -amount, true);
	        });

	        function gs() {
	            var rgb = this.rgb(),
	                val = rgb._red * 0.3 + rgb._green * 0.59 + rgb._blue * 0.11;

	            return new ONECOLOR.RGB(val, val, val, this._alpha);
	        }

	        ONECOLOR.installMethod('greyscale', gs);
	        ONECOLOR.installMethod('grayscale', gs);

	        ONECOLOR.installMethod('lighten', function (amount) {
	            return this.lightness(isNaN(amount) ? 0.1 : amount, true);
	        });

	        ONECOLOR.installMethod('mix', function (otherColor, weight) {
	            otherColor = ONECOLOR(otherColor).rgb();
	            weight = 1 - (isNaN(weight) ? 0.5 : weight);

	            var w = weight * 2 - 1,
	                a = this._alpha - otherColor._alpha,
	                weight1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2,
	                weight2 = 1 - weight1,
	                rgb = this.rgb();

	            return new ONECOLOR.RGB(
	                rgb._red * weight1 + otherColor._red * weight2,
	                rgb._green * weight1 + otherColor._green * weight2,
	                rgb._blue * weight1 + otherColor._blue * weight2,
	                rgb._alpha * weight + otherColor._alpha * (1 - weight)
	            );
	        });

	        ONECOLOR.installMethod('negate', function () {
	            var rgb = this.rgb();
	            return new ONECOLOR.RGB(1 - rgb._red, 1 - rgb._green, 1 - rgb._blue, this._alpha);
	        });

	        ONECOLOR.installMethod('opaquer', function (amount) {
	            return this.alpha(isNaN(amount) ? 0.1 : amount, true);
	        });

	        ONECOLOR.installMethod('rotate', function (degrees) {
	            return this.hue((degrees || 0) / 360, true);
	        });

	        ONECOLOR.installMethod('saturate', function (amount) {
	            return this.saturation(isNaN(amount) ? 0.1 : amount, true);
	        });

	        // Adapted from http://gimp.sourcearchive.com/documentation/2.6.6-1ubuntu1/color-to-alpha_8c-source.html
	        /*
	    toAlpha returns a color where the values of the argument have been converted to alpha
	*/
	        ONECOLOR.installMethod('toAlpha', function (color) {
	            var me = this.rgb(),
	                other = ONECOLOR(color).rgb(),
	                epsilon = 1e-10,
	                a = new ONECOLOR.RGB(0, 0, 0, me._alpha),
	                channels = ['_red', '_green', '_blue'];

	            channels.forEach(function (channel) {
	                if (me[channel] < epsilon) {
	                    a[channel] = me[channel];
	                } else if (me[channel] > other[channel]) {
	                    a[channel] = (me[channel] - other[channel]) / (1 - other[channel]);
	                } else if (me[channel] > other[channel]) {
	                    a[channel] = (other[channel] - me[channel]) / other[channel];
	                } else {
	                    a[channel] = 0;
	                }
	            });

	            if (a._red > a._green) {
	                if (a._red > a._blue) {
	                    me._alpha = a._red;
	                } else {
	                    me._alpha = a._blue;
	                }
	            } else if (a._green > a._blue) {
	                me._alpha = a._green;
	            } else {
	                me._alpha = a._blue;
	            }

	            if (me._alpha < epsilon) {
	                return me;
	            }

	            channels.forEach(function (channel) {
	                me[channel] = (me[channel] - other[channel]) / me._alpha + other[channel];
	            });
	            me._alpha *= a._alpha;

	            return me;
	        });

	        /*global one*/

	        // This file is purely for the build system

	        // Order is important to prevent channel name clashes. Lab <-> hsL

	        // Convenience functions
	    });
	    var gammaCorrection = 2.2;
	    var matrixXyzRgb = [
	        3.240712470389558,
	        -0.969259258688888,
	        0.05563600315398933,
	        -1.5372626602963142,
	        1.875996969313966,
	        -0.2039948802843549,
	        -0.49857440415943116,
	        0.041556132211625726,
	        1.0570636917433989
	    ];
	    var matrixRgbXyz = [
	        0.41242371206635076,
	        0.21265606784927693,
	        0.019331987577444885,
	        0.3575793401363035,
	        0.715157818248362,
	        0.11919267420354762,
	        0.1804662232369621,
	        0.0721864539171564,
	        0.9504491124870351
	    ];
	    // xy: coordinates, m: slope, yi: y-intercept
	    var blinder$2 = {
	        protan: {
	            x: 0.7465,
	            y: 0.2535,
	            m: 1.273463,
	            yi: -0.073894
	        },
	        deutan: {
	            x: 1.4,
	            y: -0.4,
	            m: 0.968437,
	            yi: 0.003331
	        },
	        tritan: {
	            x: 0.1748,
	            y: 0,
	            m: 0.062921,
	            yi: 0.292119
	        },
	        custom: {
	            x: 0.735,
	            y: 0.265,
	            m: -1.059259,
	            yi: 1.026914
	        }
	    };

	    var convertRgbToXyz = function (o) {
	        var M = matrixRgbXyz;
	        var z = {};
	        var R = o.R / 255;
	        var G = o.G / 255;
	        var B = o.B / 255;
	        {
	            R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
	            G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
	            B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;
	        }
	        z.X = R * M[0] + G * M[3] + B * M[6];
	        z.Y = R * M[1] + G * M[4] + B * M[7];
	        z.Z = R * M[2] + G * M[5] + B * M[8];
	        return z;
	    };

	    var convertXyzToXyy = function (o) {
	        var n = o.X + o.Y + o.Z;
	        if (n === 0) {
	            return { x: 0, y: 0, Y: o.Y };
	        }
	        return { x: o.X / n, y: o.Y / n, Y: o.Y };
	    };

	    var Blind = function (rgb, type, anomalize) {
	        var z,
	            v,
	            n,
	            line,
	            c,
	            slope,
	            yi,
	            dx,
	            dy,
	            dX,
	            dY,
	            dZ,
	            dR,
	            dG,
	            dB,
	            _r,
	            _g,
	            _b,
	            ngx,
	            ngz,
	            M,
	            adjust;
	        if (type === 'achroma') {
	            // D65 in sRGB
	            z = rgb.R * 0.212656 + rgb.G * 0.715158 + rgb.B * 0.072186;
	            z = { R: z, G: z, B: z };
	            if (anomalize) {
	                v = 1.75;
	                n = v + 1;
	                z.R = (v * z.R + rgb.R) / n;
	                z.G = (v * z.G + rgb.G) / n;
	                z.B = (v * z.B + rgb.B) / n;
	            }
	            return z;
	        }
	        line = blinder$2[type];
	        c = convertXyzToXyy(convertRgbToXyz(rgb));
	        // The confusion line is between the source color and the confusion point
	        slope = (c.y - line.y) / (c.x - line.x);
	        yi = c.y - c.x * slope; // slope, and y-intercept (at x=0)
	        // Find the change in the x and y dimensions (no Y change)
	        dx = (line.yi - yi) / (slope - line.m);
	        dy = slope * dx + yi;
	        dY = 0;
	        // Find the simulated colors XYZ coords
	        z = {};
	        z.X = (dx * c.Y) / dy;
	        z.Y = c.Y;
	        z.Z = ((1 - (dx + dy)) * c.Y) / dy;
	        // Calculate difference between sim color and neutral color
	        ngx = (0.312713 * c.Y) / 0.329016; // find neutral grey using D65 white-point
	        ngz = (0.358271 * c.Y) / 0.329016;
	        dX = ngx - z.X;
	        dZ = ngz - z.Z;
	        // find out how much to shift sim color toward neutral to fit in RGB space
	        M = matrixXyzRgb;
	        dR = dX * M[0] + dY * M[3] + dZ * M[6]; // convert d to linear RGB
	        dG = dX * M[1] + dY * M[4] + dZ * M[7];
	        dB = dX * M[2] + dY * M[5] + dZ * M[8];
	        z.R = z.X * M[0] + z.Y * M[3] + z.Z * M[6]; // convert z to linear RGB
	        z.G = z.X * M[1] + z.Y * M[4] + z.Z * M[7];
	        z.B = z.X * M[2] + z.Y * M[5] + z.Z * M[8];
	        _r = ((z.R < 0 ? 0 : 1) - z.R) / dR;
	        _g = ((z.G < 0 ? 0 : 1) - z.G) / dG;
	        _b = ((z.B < 0 ? 0 : 1) - z.B) / dB;
	        _r = _r > 1 || _r < 0 ? 0 : _r;
	        _g = _g > 1 || _g < 0 ? 0 : _g;
	        _b = _b > 1 || _b < 0 ? 0 : _b;
	        adjust = _r > _g ? _r : _g;
	        if (_b > adjust) {
	            adjust = _b;
	        }
	        // shift proportionally...
	        z.R += adjust * dR;
	        z.G += adjust * dG;
	        z.B += adjust * dB;
	        // apply gamma and clamp simulated color...
	        z.R = 255 * (z.R <= 0 ? 0 : z.R >= 1 ? 1 : Math.pow(z.R, 1 / gammaCorrection));
	        z.G = 255 * (z.G <= 0 ? 0 : z.G >= 1 ? 1 : Math.pow(z.G, 1 / gammaCorrection));
	        z.B = 255 * (z.B <= 0 ? 0 : z.B >= 1 ? 1 : Math.pow(z.B, 1 / gammaCorrection));
	        //
	        if (anomalize) {
	            v = 1.75;
	            n = v + 1;
	            z.R = (v * z.R + rgb.R) / n;
	            z.G = (v * z.G + rgb.G) / n;
	            z.B = (v * z.B + rgb.B) / n;
	        }
	        //
	        return z;
	    };

	    var blind = {
	        Blind: Blind
	    };

	    var colorBlind = createCommonjsModule(function (module, exports) {
	        /*
	         * color-blind
	         * https://github.com/skratchdot/color-blind
	         *
	         * see blind.js for more information about the original source.
	         *
	         * Copyright (c) 2014 skratchdot
	         * Licensed under the MIT license.
	         */
	        var Blind = blind.Blind;
	        var colorVisionData = {
	            protanomaly: { type: 'protan', anomalize: true },
	            protanopia: { type: 'protan' },
	            deuteranomaly: { type: 'deutan', anomalize: true },
	            deuteranopia: { type: 'deutan' },
	            tritanomaly: { type: 'tritan', anomalize: true },
	            tritanopia: { type: 'tritan' },
	            achromatomaly: { type: 'achroma', anomalize: true },
	            achromatopsia: { type: 'achroma' }
	        };
	        var denorm = function (ratio) {
	            return Math.round(ratio * 255);
	        };
	        var createBlinder = function (key) {
	            return function (colorString, returnRgb) {
	                var color = oneColorAllDebug(colorString);
	                if (!color) {
	                    return returnRgb ? { R: 0, G: 0, B: 0 } : '#000000';
	                }
	                var rgb = new Blind(
	                    {
	                        R: denorm(color.red() || 0),
	                        G: denorm(color.green() || 0),
	                        B: denorm(color.blue() || 0)
	                    },
	                    colorVisionData[key].type,
	                    colorVisionData[key].anomalize
	                );
	                // blinder.tritanomaly('#000000') causes NaN / null
	                rgb.R = rgb.R || 0;
	                rgb.G = rgb.G || 0;
	                rgb.B = rgb.B || 0;
	                if (returnRgb) {
	                    delete rgb.X;
	                    delete rgb.Y;
	                    delete rgb.Z;
	                    return rgb;
	                }
	                return new oneColorAllDebug.RGB(
	                    (rgb.R % 256) / 255,
	                    (rgb.G % 256) / 255,
	                    (rgb.B % 256) / 255,
	                    1
	                ).hex();
	            };
	        };

	        // add our exported functions
	        for (var key in colorVisionData) {
	            exports[key] = createBlinder(key);
	        }
	    });

	    return colorBlind;
	})();

	var chroma = createCommonjsModule(function (module, exports) {
	/**
	 * chroma.js - JavaScript library for color conversions
	 *
	 * Copyright (c) 2011-2019, Gregor Aisch
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are met:
	 *
	 * 1. Redistributions of source code must retain the above copyright notice, this
	 * list of conditions and the following disclaimer.
	 *
	 * 2. Redistributions in binary form must reproduce the above copyright notice,
	 * this list of conditions and the following disclaimer in the documentation
	 * and/or other materials provided with the distribution.
	 *
	 * 3. The name Gregor Aisch may not be used to endorse or promote products
	 * derived from this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
	 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 *
	 * -------------------------------------------------------
	 *
	 * chroma.js includes colors from colorbrewer2.org, which are released under
	 * the following license:
	 *
	 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
	 * and The Pennsylvania State University.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
	 * either express or implied. See the License for the specific
	 * language governing permissions and limitations under the License.
	 *
	 * ------------------------------------------------------
	 *
	 * Named colors are taken from X11 Color Names.
	 * http://www.w3.org/TR/css3-color/#svg-color
	 *
	 * @preserve
	 */

	(function (global, factory) {
	     module.exports = factory() ;
	}(commonjsGlobal, (function () {
	    var limit = function (x, min, max) {
	        if ( min === void 0 ) min=0;
	        if ( max === void 0 ) max=1;

	        return x < min ? min : x > max ? max : x;
	    };

	    var clip_rgb = function (rgb) {
	        rgb._clipped = false;
	        rgb._unclipped = rgb.slice(0);
	        for (var i=0; i<=3; i++) {
	            if (i < 3) {
	                if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
	                rgb[i] = limit(rgb[i], 0, 255);
	            } else if (i === 3) {
	                rgb[i] = limit(rgb[i], 0, 1);
	            }
	        }
	        return rgb;
	    };

	    // ported from jQuery's $.type
	    var classToType = {};
	    for (var i = 0, list = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i < list.length; i += 1) {
	        var name = list[i];

	        classToType[("[object " + name + "]")] = name.toLowerCase();
	    }
	    var type = function(obj) {
	        return classToType[Object.prototype.toString.call(obj)] || "object";
	    };

	    var unpack = function (args, keyOrder) {
	        if ( keyOrder === void 0 ) keyOrder=null;

	    	// if called with more than 3 arguments, we return the arguments
	        if (args.length >= 3) { return Array.prototype.slice.call(args); }
	        // with less than 3 args we check if first arg is object
	        // and use the keyOrder string to extract and sort properties
	    	if (type(args[0]) == 'object' && keyOrder) {
	    		return keyOrder.split('')
	    			.filter(function (k) { return args[0][k] !== undefined; })
	    			.map(function (k) { return args[0][k]; });
	    	}
	    	// otherwise we just return the first argument
	    	// (which we suppose is an array of args)
	        return args[0];
	    };

	    var last = function (args) {
	        if (args.length < 2) { return null; }
	        var l = args.length-1;
	        if (type(args[l]) == 'string') { return args[l].toLowerCase(); }
	        return null;
	    };

	    var PI = Math.PI;

	    var utils = {
	    	clip_rgb: clip_rgb,
	    	limit: limit,
	    	type: type,
	    	unpack: unpack,
	    	last: last,
	    	PI: PI,
	    	TWOPI: PI*2,
	    	PITHIRD: PI/3,
	    	DEG2RAD: PI / 180,
	    	RAD2DEG: 180 / PI
	    };

	    var input = {
	    	format: {},
	    	autodetect: []
	    };

	    var last$1 = utils.last;
	    var clip_rgb$1 = utils.clip_rgb;
	    var type$1 = utils.type;


	    var Color = function Color() {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var me = this;
	        if (type$1(args[0]) === 'object' &&
	            args[0].constructor &&
	            args[0].constructor === this.constructor) {
	            // the argument is already a Color instance
	            return args[0];
	        }

	        // last argument could be the mode
	        var mode = last$1(args);
	        var autodetect = false;

	        if (!mode) {
	            autodetect = true;
	            if (!input.sorted) {
	                input.autodetect = input.autodetect.sort(function (a,b) { return b.p - a.p; });
	                input.sorted = true;
	            }
	            // auto-detect format
	            for (var i = 0, list = input.autodetect; i < list.length; i += 1) {
	                var chk = list[i];

	                mode = chk.test.apply(chk, args);
	                if (mode) { break; }
	            }
	        }

	        if (input.format[mode]) {
	            var rgb = input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
	            me._rgb = clip_rgb$1(rgb);
	        } else {
	            throw new Error('unknown format: '+args);
	        }

	        // add alpha channel
	        if (me._rgb.length === 3) { me._rgb.push(1); }
	    };

	    Color.prototype.toString = function toString () {
	        if (type$1(this.hex) == 'function') { return this.hex(); }
	        return ("[" + (this._rgb.join(',')) + "]");
	    };

	    var Color_1 = Color;

	    var chroma = function () {
	    	var args = [], len = arguments.length;
	    	while ( len-- ) args[ len ] = arguments[ len ];

	    	return new (Function.prototype.bind.apply( chroma.Color, [ null ].concat( args) ));
	    };

	    chroma.Color = Color_1;
	    chroma.version = '2.1.0';

	    var chroma_1 = chroma;

	    var unpack$1 = utils.unpack;
	    var max = Math.max;

	    var rgb2cmyk = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$1(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        r = r / 255;
	        g = g / 255;
	        b = b / 255;
	        var k = 1 - max(r,max(g,b));
	        var f = k < 1 ? 1 / (1-k) : 0;
	        var c = (1-r-k) * f;
	        var m = (1-g-k) * f;
	        var y = (1-b-k) * f;
	        return [c,m,y,k];
	    };

	    var rgb2cmyk_1 = rgb2cmyk;

	    var unpack$2 = utils.unpack;

	    var cmyk2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$2(args, 'cmyk');
	        var c = args[0];
	        var m = args[1];
	        var y = args[2];
	        var k = args[3];
	        var alpha = args.length > 4 ? args[4] : 1;
	        if (k === 1) { return [0,0,0,alpha]; }
	        return [
	            c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
	            m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
	            y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
	            alpha
	        ];
	    };

	    var cmyk2rgb_1 = cmyk2rgb;

	    var unpack$3 = utils.unpack;
	    var type$2 = utils.type;



	    Color_1.prototype.cmyk = function() {
	        return rgb2cmyk_1(this._rgb);
	    };

	    chroma_1.cmyk = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['cmyk']) ));
	    };

	    input.format.cmyk = cmyk2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$3(args, 'cmyk');
	            if (type$2(args) === 'array' && args.length === 4) {
	                return 'cmyk';
	            }
	        }
	    });

	    var unpack$4 = utils.unpack;
	    var last$2 = utils.last;
	    var rnd = function (a) { return Math.round(a*100)/100; };

	    /*
	     * supported arguments:
	     * - hsl2css(h,s,l)
	     * - hsl2css(h,s,l,a)
	     * - hsl2css([h,s,l], mode)
	     * - hsl2css([h,s,l,a], mode)
	     * - hsl2css({h,s,l,a}, mode)
	     */
	    var hsl2css = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var hsla = unpack$4(args, 'hsla');
	        var mode = last$2(args) || 'lsa';
	        hsla[0] = rnd(hsla[0] || 0);
	        hsla[1] = rnd(hsla[1]*100) + '%';
	        hsla[2] = rnd(hsla[2]*100) + '%';
	        if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
	            hsla[3] = hsla.length > 3 ? hsla[3] : 1;
	            mode = 'hsla';
	        } else {
	            hsla.length = 3;
	        }
	        return (mode + "(" + (hsla.join(',')) + ")");
	    };

	    var hsl2css_1 = hsl2css;

	    var unpack$5 = utils.unpack;

	    /*
	     * supported arguments:
	     * - rgb2hsl(r,g,b)
	     * - rgb2hsl(r,g,b,a)
	     * - rgb2hsl([r,g,b])
	     * - rgb2hsl([r,g,b,a])
	     * - rgb2hsl({r,g,b,a})
	     */
	    var rgb2hsl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$5(args, 'rgba');
	        var r = args[0];
	        var g = args[1];
	        var b = args[2];

	        r /= 255;
	        g /= 255;
	        b /= 255;

	        var min = Math.min(r, g, b);
	        var max = Math.max(r, g, b);

	        var l = (max + min) / 2;
	        var s, h;

	        if (max === min){
	            s = 0;
	            h = Number.NaN;
	        } else {
	            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
	        }

	        if (r == max) { h = (g - b) / (max - min); }
	        else if (g == max) { h = 2 + (b - r) / (max - min); }
	        else if (b == max) { h = 4 + (r - g) / (max - min); }

	        h *= 60;
	        if (h < 0) { h += 360; }
	        if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
	        return [h,s,l];
	    };

	    var rgb2hsl_1 = rgb2hsl;

	    var unpack$6 = utils.unpack;
	    var last$3 = utils.last;


	    var round = Math.round;

	    /*
	     * supported arguments:
	     * - rgb2css(r,g,b)
	     * - rgb2css(r,g,b,a)
	     * - rgb2css([r,g,b], mode)
	     * - rgb2css([r,g,b,a], mode)
	     * - rgb2css({r,g,b,a}, mode)
	     */
	    var rgb2css = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var rgba = unpack$6(args, 'rgba');
	        var mode = last$3(args) || 'rgb';
	        if (mode.substr(0,3) == 'hsl') {
	            return hsl2css_1(rgb2hsl_1(rgba), mode);
	        }
	        rgba[0] = round(rgba[0]);
	        rgba[1] = round(rgba[1]);
	        rgba[2] = round(rgba[2]);
	        if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
	            rgba[3] = rgba.length > 3 ? rgba[3] : 1;
	            mode = 'rgba';
	        }
	        return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
	    };

	    var rgb2css_1 = rgb2css;

	    var unpack$7 = utils.unpack;
	    var round$1 = Math.round;

	    var hsl2rgb = function () {
	        var assign;

	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];
	        args = unpack$7(args, 'hsl');
	        var h = args[0];
	        var s = args[1];
	        var l = args[2];
	        var r,g,b;
	        if (s === 0) {
	            r = g = b = l*255;
	        } else {
	            var t3 = [0,0,0];
	            var c = [0,0,0];
	            var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
	            var t1 = 2 * l - t2;
	            var h_ = h / 360;
	            t3[0] = h_ + 1/3;
	            t3[1] = h_;
	            t3[2] = h_ - 1/3;
	            for (var i=0; i<3; i++) {
	                if (t3[i] < 0) { t3[i] += 1; }
	                if (t3[i] > 1) { t3[i] -= 1; }
	                if (6 * t3[i] < 1)
	                    { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
	                else if (2 * t3[i] < 1)
	                    { c[i] = t2; }
	                else if (3 * t3[i] < 2)
	                    { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
	                else
	                    { c[i] = t1; }
	            }
	            (assign = [round$1(c[0]*255),round$1(c[1]*255),round$1(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
	        }
	        if (args.length > 3) {
	            // keep alpha channel
	            return [r,g,b,args[3]];
	        }
	        return [r,g,b,1];
	    };

	    var hsl2rgb_1 = hsl2rgb;

	    var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
	    var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
	    var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
	    var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
	    var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
	    var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

	    var round$2 = Math.round;

	    var css2rgb = function (css) {
	        css = css.toLowerCase().trim();
	        var m;

	        if (input.format.named) {
	            try {
	                return input.format.named(css);
	            } catch (e) {
	                // eslint-disable-next-line
	            }
	        }

	        // rgb(250,20,0)
	        if ((m = css.match(RE_RGB))) {
	            var rgb = m.slice(1,4);
	            for (var i=0; i<3; i++) {
	                rgb[i] = +rgb[i];
	            }
	            rgb[3] = 1;  // default alpha
	            return rgb;
	        }

	        // rgba(250,20,0,0.4)
	        if ((m = css.match(RE_RGBA))) {
	            var rgb$1 = m.slice(1,5);
	            for (var i$1=0; i$1<4; i$1++) {
	                rgb$1[i$1] = +rgb$1[i$1];
	            }
	            return rgb$1;
	        }

	        // rgb(100%,0%,0%)
	        if ((m = css.match(RE_RGB_PCT))) {
	            var rgb$2 = m.slice(1,4);
	            for (var i$2=0; i$2<3; i$2++) {
	                rgb$2[i$2] = round$2(rgb$2[i$2] * 2.55);
	            }
	            rgb$2[3] = 1;  // default alpha
	            return rgb$2;
	        }

	        // rgba(100%,0%,0%,0.4)
	        if ((m = css.match(RE_RGBA_PCT))) {
	            var rgb$3 = m.slice(1,5);
	            for (var i$3=0; i$3<3; i$3++) {
	                rgb$3[i$3] = round$2(rgb$3[i$3] * 2.55);
	            }
	            rgb$3[3] = +rgb$3[3];
	            return rgb$3;
	        }

	        // hsl(0,100%,50%)
	        if ((m = css.match(RE_HSL))) {
	            var hsl = m.slice(1,4);
	            hsl[1] *= 0.01;
	            hsl[2] *= 0.01;
	            var rgb$4 = hsl2rgb_1(hsl);
	            rgb$4[3] = 1;
	            return rgb$4;
	        }

	        // hsla(0,100%,50%,0.5)
	        if ((m = css.match(RE_HSLA))) {
	            var hsl$1 = m.slice(1,4);
	            hsl$1[1] *= 0.01;
	            hsl$1[2] *= 0.01;
	            var rgb$5 = hsl2rgb_1(hsl$1);
	            rgb$5[3] = +m[4];  // default alpha = 1
	            return rgb$5;
	        }
	    };

	    css2rgb.test = function (s) {
	        return RE_RGB.test(s) ||
	            RE_RGBA.test(s) ||
	            RE_RGB_PCT.test(s) ||
	            RE_RGBA_PCT.test(s) ||
	            RE_HSL.test(s) ||
	            RE_HSLA.test(s);
	    };

	    var css2rgb_1 = css2rgb;

	    var type$3 = utils.type;




	    Color_1.prototype.css = function(mode) {
	        return rgb2css_1(this._rgb, mode);
	    };

	    chroma_1.css = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['css']) ));
	    };

	    input.format.css = css2rgb_1;

	    input.autodetect.push({
	        p: 5,
	        test: function (h) {
	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

	            if (!rest.length && type$3(h) === 'string' && css2rgb_1.test(h)) {
	                return 'css';
	            }
	        }
	    });

	    var unpack$8 = utils.unpack;

	    input.format.gl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var rgb = unpack$8(args, 'rgba');
	        rgb[0] *= 255;
	        rgb[1] *= 255;
	        rgb[2] *= 255;
	        return rgb;
	    };

	    chroma_1.gl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['gl']) ));
	    };

	    Color_1.prototype.gl = function() {
	        var rgb = this._rgb;
	        return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
	    };

	    var unpack$9 = utils.unpack;

	    var rgb2hcg = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$9(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var min = Math.min(r, g, b);
	        var max = Math.max(r, g, b);
	        var delta = max - min;
	        var c = delta * 100 / 255;
	        var _g = min / (255 - delta) * 100;
	        var h;
	        if (delta === 0) {
	            h = Number.NaN;
	        } else {
	            if (r === max) { h = (g - b) / delta; }
	            if (g === max) { h = 2+(b - r) / delta; }
	            if (b === max) { h = 4+(r - g) / delta; }
	            h *= 60;
	            if (h < 0) { h += 360; }
	        }
	        return [h, c, _g];
	    };

	    var rgb2hcg_1 = rgb2hcg;

	    var unpack$a = utils.unpack;
	    var floor = Math.floor;

	    /*
	     * this is basically just HSV with some minor tweaks
	     *
	     * hue.. [0..360]
	     * chroma .. [0..1]
	     * grayness .. [0..1]
	     */

	    var hcg2rgb = function () {
	        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];
	        args = unpack$a(args, 'hcg');
	        var h = args[0];
	        var c = args[1];
	        var _g = args[2];
	        var r,g,b;
	        _g = _g * 255;
	        var _c = c * 255;
	        if (c === 0) {
	            r = g = b = _g;
	        } else {
	            if (h === 360) { h = 0; }
	            if (h > 360) { h -= 360; }
	            if (h < 0) { h += 360; }
	            h /= 60;
	            var i = floor(h);
	            var f = h - i;
	            var p = _g * (1 - c);
	            var q = p + _c * (1 - f);
	            var t = p + _c * f;
	            var v = p + _c;
	            switch (i) {
	                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
	                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
	                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
	                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
	                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
	                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
	            }
	        }
	        return [r, g, b, args.length > 3 ? args[3] : 1];
	    };

	    var hcg2rgb_1 = hcg2rgb;

	    var unpack$b = utils.unpack;
	    var type$4 = utils.type;






	    Color_1.prototype.hcg = function() {
	        return rgb2hcg_1(this._rgb);
	    };

	    chroma_1.hcg = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcg']) ));
	    };

	    input.format.hcg = hcg2rgb_1;

	    input.autodetect.push({
	        p: 1,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$b(args, 'hcg');
	            if (type$4(args) === 'array' && args.length === 3) {
	                return 'hcg';
	            }
	        }
	    });

	    var unpack$c = utils.unpack;
	    var last$4 = utils.last;
	    var round$3 = Math.round;

	    var rgb2hex = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$c(args, 'rgba');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var a = ref[3];
	        var mode = last$4(args) || 'auto';
	        if (a === undefined) { a = 1; }
	        if (mode === 'auto') {
	            mode = a < 1 ? 'rgba' : 'rgb';
	        }
	        r = round$3(r);
	        g = round$3(g);
	        b = round$3(b);
	        var u = r << 16 | g << 8 | b;
	        var str = "000000" + u.toString(16); //#.toUpperCase();
	        str = str.substr(str.length - 6);
	        var hxa = '0' + round$3(a * 255).toString(16);
	        hxa = hxa.substr(hxa.length - 2);
	        switch (mode.toLowerCase()) {
	            case 'rgba': return ("#" + str + hxa);
	            case 'argb': return ("#" + hxa + str);
	            default: return ("#" + str);
	        }
	    };

	    var rgb2hex_1 = rgb2hex;

	    var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	    var RE_HEXA = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

	    var hex2rgb = function (hex) {
	        if (hex.match(RE_HEX)) {
	            // remove optional leading #
	            if (hex.length === 4 || hex.length === 7) {
	                hex = hex.substr(1);
	            }
	            // expand short-notation to full six-digit
	            if (hex.length === 3) {
	                hex = hex.split('');
	                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	            }
	            var u = parseInt(hex, 16);
	            var r = u >> 16;
	            var g = u >> 8 & 0xFF;
	            var b = u & 0xFF;
	            return [r,g,b,1];
	        }

	        // match rgba hex format, eg #FF000077
	        if (hex.match(RE_HEXA)) {
	            if (hex.length === 5 || hex.length === 9) {
	                // remove optional leading #
	                hex = hex.substr(1);
	            }
	            // expand short-notation to full eight-digit
	            if (hex.length === 4) {
	                hex = hex.split('');
	                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
	            }
	            var u$1 = parseInt(hex, 16);
	            var r$1 = u$1 >> 24 & 0xFF;
	            var g$1 = u$1 >> 16 & 0xFF;
	            var b$1 = u$1 >> 8 & 0xFF;
	            var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
	            return [r$1,g$1,b$1,a];
	        }

	        // we used to check for css colors here
	        // if _input.css? and rgb = _input.css hex
	        //     return rgb

	        throw new Error(("unknown hex color: " + hex));
	    };

	    var hex2rgb_1 = hex2rgb;

	    var type$5 = utils.type;




	    Color_1.prototype.hex = function(mode) {
	        return rgb2hex_1(this._rgb, mode);
	    };

	    chroma_1.hex = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hex']) ));
	    };

	    input.format.hex = hex2rgb_1;
	    input.autodetect.push({
	        p: 4,
	        test: function (h) {
	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

	            if (!rest.length && type$5(h) === 'string' && [3,4,5,6,7,8,9].indexOf(h.length) >= 0) {
	                return 'hex';
	            }
	        }
	    });

	    var unpack$d = utils.unpack;
	    var TWOPI = utils.TWOPI;
	    var min = Math.min;
	    var sqrt = Math.sqrt;
	    var acos = Math.acos;

	    var rgb2hsi = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        /*
	        borrowed from here:
	        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
	        */
	        var ref = unpack$d(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        r /= 255;
	        g /= 255;
	        b /= 255;
	        var h;
	        var min_ = min(r,g,b);
	        var i = (r+g+b) / 3;
	        var s = i > 0 ? 1 - min_/i : 0;
	        if (s === 0) {
	            h = NaN;
	        } else {
	            h = ((r-g)+(r-b)) / 2;
	            h /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
	            h = acos(h);
	            if (b > g) {
	                h = TWOPI - h;
	            }
	            h /= TWOPI;
	        }
	        return [h*360,s,i];
	    };

	    var rgb2hsi_1 = rgb2hsi;

	    var unpack$e = utils.unpack;
	    var limit$1 = utils.limit;
	    var TWOPI$1 = utils.TWOPI;
	    var PITHIRD = utils.PITHIRD;
	    var cos = Math.cos;

	    /*
	     * hue [0..360]
	     * saturation [0..1]
	     * intensity [0..1]
	     */
	    var hsi2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        /*
	        borrowed from here:
	        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
	        */
	        args = unpack$e(args, 'hsi');
	        var h = args[0];
	        var s = args[1];
	        var i = args[2];
	        var r,g,b;

	        if (isNaN(h)) { h = 0; }
	        if (isNaN(s)) { s = 0; }
	        // normalize hue
	        if (h > 360) { h -= 360; }
	        if (h < 0) { h += 360; }
	        h /= 360;
	        if (h < 1/3) {
	            b = (1-s)/3;
	            r = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
	            g = 1 - (b+r);
	        } else if (h < 2/3) {
	            h -= 1/3;
	            r = (1-s)/3;
	            g = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
	            b = 1 - (r+g);
	        } else {
	            h -= 2/3;
	            g = (1-s)/3;
	            b = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
	            r = 1 - (g+b);
	        }
	        r = limit$1(i*r*3);
	        g = limit$1(i*g*3);
	        b = limit$1(i*b*3);
	        return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
	    };

	    var hsi2rgb_1 = hsi2rgb;

	    var unpack$f = utils.unpack;
	    var type$6 = utils.type;






	    Color_1.prototype.hsi = function() {
	        return rgb2hsi_1(this._rgb);
	    };

	    chroma_1.hsi = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsi']) ));
	    };

	    input.format.hsi = hsi2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$f(args, 'hsi');
	            if (type$6(args) === 'array' && args.length === 3) {
	                return 'hsi';
	            }
	        }
	    });

	    var unpack$g = utils.unpack;
	    var type$7 = utils.type;






	    Color_1.prototype.hsl = function() {
	        return rgb2hsl_1(this._rgb);
	    };

	    chroma_1.hsl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsl']) ));
	    };

	    input.format.hsl = hsl2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$g(args, 'hsl');
	            if (type$7(args) === 'array' && args.length === 3) {
	                return 'hsl';
	            }
	        }
	    });

	    var unpack$h = utils.unpack;
	    var min$1 = Math.min;
	    var max$1 = Math.max;

	    /*
	     * supported arguments:
	     * - rgb2hsv(r,g,b)
	     * - rgb2hsv([r,g,b])
	     * - rgb2hsv({r,g,b})
	     */
	    var rgb2hsl$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$h(args, 'rgb');
	        var r = args[0];
	        var g = args[1];
	        var b = args[2];
	        var min_ = min$1(r, g, b);
	        var max_ = max$1(r, g, b);
	        var delta = max_ - min_;
	        var h,s,v;
	        v = max_ / 255.0;
	        if (max_ === 0) {
	            h = Number.NaN;
	            s = 0;
	        } else {
	            s = delta / max_;
	            if (r === max_) { h = (g - b) / delta; }
	            if (g === max_) { h = 2+(b - r) / delta; }
	            if (b === max_) { h = 4+(r - g) / delta; }
	            h *= 60;
	            if (h < 0) { h += 360; }
	        }
	        return [h, s, v]
	    };

	    var rgb2hsv = rgb2hsl$1;

	    var unpack$i = utils.unpack;
	    var floor$1 = Math.floor;

	    var hsv2rgb = function () {
	        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];
	        args = unpack$i(args, 'hsv');
	        var h = args[0];
	        var s = args[1];
	        var v = args[2];
	        var r,g,b;
	        v *= 255;
	        if (s === 0) {
	            r = g = b = v;
	        } else {
	            if (h === 360) { h = 0; }
	            if (h > 360) { h -= 360; }
	            if (h < 0) { h += 360; }
	            h /= 60;

	            var i = floor$1(h);
	            var f = h - i;
	            var p = v * (1 - s);
	            var q = v * (1 - s * f);
	            var t = v * (1 - s * (1 - f));

	            switch (i) {
	                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
	                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
	                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
	                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
	                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
	                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
	            }
	        }
	        return [r,g,b,args.length > 3?args[3]:1];
	    };

	    var hsv2rgb_1 = hsv2rgb;

	    var unpack$j = utils.unpack;
	    var type$8 = utils.type;






	    Color_1.prototype.hsv = function() {
	        return rgb2hsv(this._rgb);
	    };

	    chroma_1.hsv = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsv']) ));
	    };

	    input.format.hsv = hsv2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$j(args, 'hsv');
	            if (type$8(args) === 'array' && args.length === 3) {
	                return 'hsv';
	            }
	        }
	    });

	    var labConstants = {
	        // Corresponds roughly to RGB brighter/darker
	        Kn: 18,

	        // D65 standard referent
	        Xn: 0.950470,
	        Yn: 1,
	        Zn: 1.088830,

	        t0: 0.137931034,  // 4 / 29
	        t1: 0.206896552,  // 6 / 29
	        t2: 0.12841855,   // 3 * t1 * t1
	        t3: 0.008856452,  // t1 * t1 * t1
	    };

	    var unpack$k = utils.unpack;
	    var pow = Math.pow;

	    var rgb2lab = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$k(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var ref$1 = rgb2xyz(r,g,b);
	        var x = ref$1[0];
	        var y = ref$1[1];
	        var z = ref$1[2];
	        var l = 116 * y - 16;
	        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
	    };

	    var rgb_xyz = function (r) {
	        if ((r /= 255) <= 0.04045) { return r / 12.92; }
	        return pow((r + 0.055) / 1.055, 2.4);
	    };

	    var xyz_lab = function (t) {
	        if (t > labConstants.t3) { return pow(t, 1 / 3); }
	        return t / labConstants.t2 + labConstants.t0;
	    };

	    var rgb2xyz = function (r,g,b) {
	        r = rgb_xyz(r);
	        g = rgb_xyz(g);
	        b = rgb_xyz(b);
	        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / labConstants.Xn);
	        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / labConstants.Yn);
	        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / labConstants.Zn);
	        return [x,y,z];
	    };

	    var rgb2lab_1 = rgb2lab;

	    var unpack$l = utils.unpack;
	    var pow$1 = Math.pow;

	    /*
	     * L* [0..100]
	     * a [-100..100]
	     * b [-100..100]
	     */
	    var lab2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$l(args, 'lab');
	        var l = args[0];
	        var a = args[1];
	        var b = args[2];
	        var x,y,z, r,g,b_;

	        y = (l + 16) / 116;
	        x = isNaN(a) ? y : y + a / 500;
	        z = isNaN(b) ? y : y - b / 200;

	        y = labConstants.Yn * lab_xyz(y);
	        x = labConstants.Xn * lab_xyz(x);
	        z = labConstants.Zn * lab_xyz(z);

	        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
	        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
	        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

	        return [r,g,b_,args.length > 3 ? args[3] : 1];
	    };

	    var xyz_rgb = function (r) {
	        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$1(r, 1 / 2.4) - 0.055)
	    };

	    var lab_xyz = function (t) {
	        return t > labConstants.t1 ? t * t * t : labConstants.t2 * (t - labConstants.t0)
	    };

	    var lab2rgb_1 = lab2rgb;

	    var unpack$m = utils.unpack;
	    var type$9 = utils.type;






	    Color_1.prototype.lab = function() {
	        return rgb2lab_1(this._rgb);
	    };

	    chroma_1.lab = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lab']) ));
	    };

	    input.format.lab = lab2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$m(args, 'lab');
	            if (type$9(args) === 'array' && args.length === 3) {
	                return 'lab';
	            }
	        }
	    });

	    var unpack$n = utils.unpack;
	    var RAD2DEG = utils.RAD2DEG;
	    var sqrt$1 = Math.sqrt;
	    var atan2 = Math.atan2;
	    var round$4 = Math.round;

	    var lab2lch = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$n(args, 'lab');
	        var l = ref[0];
	        var a = ref[1];
	        var b = ref[2];
	        var c = sqrt$1(a * a + b * b);
	        var h = (atan2(b, a) * RAD2DEG + 360) % 360;
	        if (round$4(c*10000) === 0) { h = Number.NaN; }
	        return [l, c, h];
	    };

	    var lab2lch_1 = lab2lch;

	    var unpack$o = utils.unpack;



	    var rgb2lch = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$o(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var ref$1 = rgb2lab_1(r,g,b);
	        var l = ref$1[0];
	        var a = ref$1[1];
	        var b_ = ref$1[2];
	        return lab2lch_1(l,a,b_);
	    };

	    var rgb2lch_1 = rgb2lch;

	    var unpack$p = utils.unpack;
	    var DEG2RAD = utils.DEG2RAD;
	    var sin = Math.sin;
	    var cos$1 = Math.cos;

	    var lch2lab = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        /*
	        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
	        These formulas were invented by David Dalrymple to obtain maximum contrast without going
	        out of gamut if the parameters are in the range 0-1.

	        A saturation multiplier was added by Gregor Aisch
	        */
	        var ref = unpack$p(args, 'lch');
	        var l = ref[0];
	        var c = ref[1];
	        var h = ref[2];
	        if (isNaN(h)) { h = 0; }
	        h = h * DEG2RAD;
	        return [l, cos$1(h) * c, sin(h) * c]
	    };

	    var lch2lab_1 = lch2lab;

	    var unpack$q = utils.unpack;



	    var lch2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$q(args, 'lch');
	        var l = args[0];
	        var c = args[1];
	        var h = args[2];
	        var ref = lch2lab_1 (l,c,h);
	        var L = ref[0];
	        var a = ref[1];
	        var b_ = ref[2];
	        var ref$1 = lab2rgb_1 (L,a,b_);
	        var r = ref$1[0];
	        var g = ref$1[1];
	        var b = ref$1[2];
	        return [r, g, b, args.length > 3 ? args[3] : 1];
	    };

	    var lch2rgb_1 = lch2rgb;

	    var unpack$r = utils.unpack;


	    var hcl2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var hcl = unpack$r(args, 'hcl').reverse();
	        return lch2rgb_1.apply(void 0, hcl);
	    };

	    var hcl2rgb_1 = hcl2rgb;

	    var unpack$s = utils.unpack;
	    var type$a = utils.type;






	    Color_1.prototype.lch = function() { return rgb2lch_1(this._rgb); };
	    Color_1.prototype.hcl = function() { return rgb2lch_1(this._rgb).reverse(); };

	    chroma_1.lch = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lch']) ));
	    };
	    chroma_1.hcl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcl']) ));
	    };

	    input.format.lch = lch2rgb_1;
	    input.format.hcl = hcl2rgb_1;

	    ['lch','hcl'].forEach(function (m) { return input.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$s(args, m);
	            if (type$a(args) === 'array' && args.length === 3) {
	                return m;
	            }
	        }
	    }); });

	    /**
	    	X11 color names

	    	http://www.w3.org/TR/css3-color/#svg-color
	    */

	    var w3cx11 = {
	        aliceblue: '#f0f8ff',
	        antiquewhite: '#faebd7',
	        aqua: '#00ffff',
	        aquamarine: '#7fffd4',
	        azure: '#f0ffff',
	        beige: '#f5f5dc',
	        bisque: '#ffe4c4',
	        black: '#000000',
	        blanchedalmond: '#ffebcd',
	        blue: '#0000ff',
	        blueviolet: '#8a2be2',
	        brown: '#a52a2a',
	        burlywood: '#deb887',
	        cadetblue: '#5f9ea0',
	        chartreuse: '#7fff00',
	        chocolate: '#d2691e',
	        coral: '#ff7f50',
	        cornflower: '#6495ed',
	        cornflowerblue: '#6495ed',
	        cornsilk: '#fff8dc',
	        crimson: '#dc143c',
	        cyan: '#00ffff',
	        darkblue: '#00008b',
	        darkcyan: '#008b8b',
	        darkgoldenrod: '#b8860b',
	        darkgray: '#a9a9a9',
	        darkgreen: '#006400',
	        darkgrey: '#a9a9a9',
	        darkkhaki: '#bdb76b',
	        darkmagenta: '#8b008b',
	        darkolivegreen: '#556b2f',
	        darkorange: '#ff8c00',
	        darkorchid: '#9932cc',
	        darkred: '#8b0000',
	        darksalmon: '#e9967a',
	        darkseagreen: '#8fbc8f',
	        darkslateblue: '#483d8b',
	        darkslategray: '#2f4f4f',
	        darkslategrey: '#2f4f4f',
	        darkturquoise: '#00ced1',
	        darkviolet: '#9400d3',
	        deeppink: '#ff1493',
	        deepskyblue: '#00bfff',
	        dimgray: '#696969',
	        dimgrey: '#696969',
	        dodgerblue: '#1e90ff',
	        firebrick: '#b22222',
	        floralwhite: '#fffaf0',
	        forestgreen: '#228b22',
	        fuchsia: '#ff00ff',
	        gainsboro: '#dcdcdc',
	        ghostwhite: '#f8f8ff',
	        gold: '#ffd700',
	        goldenrod: '#daa520',
	        gray: '#808080',
	        green: '#008000',
	        greenyellow: '#adff2f',
	        grey: '#808080',
	        honeydew: '#f0fff0',
	        hotpink: '#ff69b4',
	        indianred: '#cd5c5c',
	        indigo: '#4b0082',
	        ivory: '#fffff0',
	        khaki: '#f0e68c',
	        laserlemon: '#ffff54',
	        lavender: '#e6e6fa',
	        lavenderblush: '#fff0f5',
	        lawngreen: '#7cfc00',
	        lemonchiffon: '#fffacd',
	        lightblue: '#add8e6',
	        lightcoral: '#f08080',
	        lightcyan: '#e0ffff',
	        lightgoldenrod: '#fafad2',
	        lightgoldenrodyellow: '#fafad2',
	        lightgray: '#d3d3d3',
	        lightgreen: '#90ee90',
	        lightgrey: '#d3d3d3',
	        lightpink: '#ffb6c1',
	        lightsalmon: '#ffa07a',
	        lightseagreen: '#20b2aa',
	        lightskyblue: '#87cefa',
	        lightslategray: '#778899',
	        lightslategrey: '#778899',
	        lightsteelblue: '#b0c4de',
	        lightyellow: '#ffffe0',
	        lime: '#00ff00',
	        limegreen: '#32cd32',
	        linen: '#faf0e6',
	        magenta: '#ff00ff',
	        maroon: '#800000',
	        maroon2: '#7f0000',
	        maroon3: '#b03060',
	        mediumaquamarine: '#66cdaa',
	        mediumblue: '#0000cd',
	        mediumorchid: '#ba55d3',
	        mediumpurple: '#9370db',
	        mediumseagreen: '#3cb371',
	        mediumslateblue: '#7b68ee',
	        mediumspringgreen: '#00fa9a',
	        mediumturquoise: '#48d1cc',
	        mediumvioletred: '#c71585',
	        midnightblue: '#191970',
	        mintcream: '#f5fffa',
	        mistyrose: '#ffe4e1',
	        moccasin: '#ffe4b5',
	        navajowhite: '#ffdead',
	        navy: '#000080',
	        oldlace: '#fdf5e6',
	        olive: '#808000',
	        olivedrab: '#6b8e23',
	        orange: '#ffa500',
	        orangered: '#ff4500',
	        orchid: '#da70d6',
	        palegoldenrod: '#eee8aa',
	        palegreen: '#98fb98',
	        paleturquoise: '#afeeee',
	        palevioletred: '#db7093',
	        papayawhip: '#ffefd5',
	        peachpuff: '#ffdab9',
	        peru: '#cd853f',
	        pink: '#ffc0cb',
	        plum: '#dda0dd',
	        powderblue: '#b0e0e6',
	        purple: '#800080',
	        purple2: '#7f007f',
	        purple3: '#a020f0',
	        rebeccapurple: '#663399',
	        red: '#ff0000',
	        rosybrown: '#bc8f8f',
	        royalblue: '#4169e1',
	        saddlebrown: '#8b4513',
	        salmon: '#fa8072',
	        sandybrown: '#f4a460',
	        seagreen: '#2e8b57',
	        seashell: '#fff5ee',
	        sienna: '#a0522d',
	        silver: '#c0c0c0',
	        skyblue: '#87ceeb',
	        slateblue: '#6a5acd',
	        slategray: '#708090',
	        slategrey: '#708090',
	        snow: '#fffafa',
	        springgreen: '#00ff7f',
	        steelblue: '#4682b4',
	        tan: '#d2b48c',
	        teal: '#008080',
	        thistle: '#d8bfd8',
	        tomato: '#ff6347',
	        turquoise: '#40e0d0',
	        violet: '#ee82ee',
	        wheat: '#f5deb3',
	        white: '#ffffff',
	        whitesmoke: '#f5f5f5',
	        yellow: '#ffff00',
	        yellowgreen: '#9acd32'
	    };

	    var w3cx11_1 = w3cx11;

	    var type$b = utils.type;





	    Color_1.prototype.name = function() {
	        var hex = rgb2hex_1(this._rgb, 'rgb');
	        for (var i = 0, list = Object.keys(w3cx11_1); i < list.length; i += 1) {
	            var n = list[i];

	            if (w3cx11_1[n] === hex) { return n.toLowerCase(); }
	        }
	        return hex;
	    };

	    input.format.named = function (name) {
	        name = name.toLowerCase();
	        if (w3cx11_1[name]) { return hex2rgb_1(w3cx11_1[name]); }
	        throw new Error('unknown color name: '+name);
	    };

	    input.autodetect.push({
	        p: 5,
	        test: function (h) {
	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

	            if (!rest.length && type$b(h) === 'string' && w3cx11_1[h.toLowerCase()]) {
	                return 'named';
	            }
	        }
	    });

	    var unpack$t = utils.unpack;

	    var rgb2num = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$t(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        return (r << 16) + (g << 8) + b;
	    };

	    var rgb2num_1 = rgb2num;

	    var type$c = utils.type;

	    var num2rgb = function (num) {
	        if (type$c(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
	            var r = num >> 16;
	            var g = (num >> 8) & 0xFF;
	            var b = num & 0xFF;
	            return [r,g,b,1];
	        }
	        throw new Error("unknown num color: "+num);
	    };

	    var num2rgb_1 = num2rgb;

	    var type$d = utils.type;



	    Color_1.prototype.num = function() {
	        return rgb2num_1(this._rgb);
	    };

	    chroma_1.num = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['num']) ));
	    };

	    input.format.num = num2rgb_1;

	    input.autodetect.push({
	        p: 5,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            if (args.length === 1 && type$d(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
	                return 'num';
	            }
	        }
	    });

	    var unpack$u = utils.unpack;
	    var type$e = utils.type;
	    var round$5 = Math.round;

	    Color_1.prototype.rgb = function(rnd) {
	        if ( rnd === void 0 ) rnd=true;

	        if (rnd === false) { return this._rgb.slice(0,3); }
	        return this._rgb.slice(0,3).map(round$5);
	    };

	    Color_1.prototype.rgba = function(rnd) {
	        if ( rnd === void 0 ) rnd=true;

	        return this._rgb.slice(0,4).map(function (v,i) {
	            return i<3 ? (rnd === false ? v : round$5(v)) : v;
	        });
	    };

	    chroma_1.rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['rgb']) ));
	    };

	    input.format.rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var rgba = unpack$u(args, 'rgba');
	        if (rgba[3] === undefined) { rgba[3] = 1; }
	        return rgba;
	    };

	    input.autodetect.push({
	        p: 3,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$u(args, 'rgba');
	            if (type$e(args) === 'array' && (args.length === 3 ||
	                args.length === 4 && type$e(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
	                return 'rgb';
	            }
	        }
	    });

	    /*
	     * Based on implementation by Neil Bartlett
	     * https://github.com/neilbartlett/color-temperature
	     */

	    var log = Math.log;

	    var temperature2rgb = function (kelvin) {
	        var temp = kelvin / 100;
	        var r,g,b;
	        if (temp < 66) {
	            r = 255;
	            g = -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log(g);
	            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log(b);
	        } else {
	            r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log(r);
	            g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log(g);
	            b = 255;
	        }
	        return [r,g,b,1];
	    };

	    var temperature2rgb_1 = temperature2rgb;

	    /*
	     * Based on implementation by Neil Bartlett
	     * https://github.com/neilbartlett/color-temperature
	     **/


	    var unpack$v = utils.unpack;
	    var round$6 = Math.round;

	    var rgb2temperature = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var rgb = unpack$v(args, 'rgb');
	        var r = rgb[0], b = rgb[2];
	        var minTemp = 1000;
	        var maxTemp = 40000;
	        var eps = 0.4;
	        var temp;
	        while (maxTemp - minTemp > eps) {
	            temp = (maxTemp + minTemp) * 0.5;
	            var rgb$1 = temperature2rgb_1(temp);
	            if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
	                maxTemp = temp;
	            } else {
	                minTemp = temp;
	            }
	        }
	        return round$6(temp);
	    };

	    var rgb2temperature_1 = rgb2temperature;

	    Color_1.prototype.temp =
	    Color_1.prototype.kelvin =
	    Color_1.prototype.temperature = function() {
	        return rgb2temperature_1(this._rgb);
	    };

	    chroma_1.temp =
	    chroma_1.kelvin =
	    chroma_1.temperature = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['temp']) ));
	    };

	    input.format.temp =
	    input.format.kelvin =
	    input.format.temperature = temperature2rgb_1;

	    var type$f = utils.type;

	    Color_1.prototype.alpha = function(a, mutate) {
	        if ( mutate === void 0 ) mutate=false;

	        if (a !== undefined && type$f(a) === 'number') {
	            if (mutate) {
	                this._rgb[3] = a;
	                return this;
	            }
	            return new Color_1([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
	        }
	        return this._rgb[3];
	    };

	    Color_1.prototype.clipped = function() {
	        return this._rgb._clipped || false;
	    };

	    Color_1.prototype.darken = function(amount) {
	    	if ( amount === void 0 ) amount=1;

	    	var me = this;
	    	var lab = me.lab();
	    	lab[0] -= labConstants.Kn * amount;
	    	return new Color_1(lab, 'lab').alpha(me.alpha(), true);
	    };

	    Color_1.prototype.brighten = function(amount) {
	    	if ( amount === void 0 ) amount=1;

	    	return this.darken(-amount);
	    };

	    Color_1.prototype.darker = Color_1.prototype.darken;
	    Color_1.prototype.brighter = Color_1.prototype.brighten;

	    Color_1.prototype.get = function(mc) {
	        var ref = mc.split('.');
	        var mode = ref[0];
	        var channel = ref[1];
	        var src = this[mode]();
	        if (channel) {
	            var i = mode.indexOf(channel);
	            if (i > -1) { return src[i]; }
	            throw new Error(("unknown channel " + channel + " in mode " + mode));
	        } else {
	            return src;
	        }
	    };

	    var type$g = utils.type;
	    var pow$2 = Math.pow;

	    var EPS = 1e-7;
	    var MAX_ITER = 20;

	    Color_1.prototype.luminance = function(lum) {
	        if (lum !== undefined && type$g(lum) === 'number') {
	            if (lum === 0) {
	                // return pure black
	                return new Color_1([0,0,0,this._rgb[3]], 'rgb');
	            }
	            if (lum === 1) {
	                // return pure white
	                return new Color_1([255,255,255,this._rgb[3]], 'rgb');
	            }
	            // compute new color using...
	            var cur_lum = this.luminance();
	            var mode = 'rgb';
	            var max_iter = MAX_ITER;

	            var test = function (low, high) {
	                var mid = low.interpolate(high, 0.5, mode);
	                var lm = mid.luminance();
	                if (Math.abs(lum - lm) < EPS || !max_iter--) {
	                    // close enough
	                    return mid;
	                }
	                return lm > lum ? test(low, mid) : test(mid, high);
	            };

	            var rgb = (cur_lum > lum ? test(new Color_1([0,0,0]), this) : test(this, new Color_1([255,255,255]))).rgb();
	            return new Color_1(rgb.concat( [this._rgb[3]]));
	        }
	        return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
	    };


	    var rgb2luminance = function (r,g,b) {
	        // relative luminance
	        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	        r = luminance_x(r);
	        g = luminance_x(g);
	        b = luminance_x(b);
	        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	    };

	    var luminance_x = function (x) {
	        x /= 255;
	        return x <= 0.03928 ? x/12.92 : pow$2((x+0.055)/1.055, 2.4);
	    };

	    var interpolator = {};

	    var type$h = utils.type;


	    var mix = function (col1, col2, f) {
	        if ( f === void 0 ) f=0.5;
	        var rest = [], len = arguments.length - 3;
	        while ( len-- > 0 ) rest[ len ] = arguments[ len + 3 ];

	        var mode = rest[0] || 'lrgb';
	        if (!interpolator[mode] && !rest.length) {
	            // fall back to the first supported mode
	            mode = Object.keys(interpolator)[0];
	        }
	        if (!interpolator[mode]) {
	            throw new Error(("interpolation mode " + mode + " is not defined"));
	        }
	        if (type$h(col1) !== 'object') { col1 = new Color_1(col1); }
	        if (type$h(col2) !== 'object') { col2 = new Color_1(col2); }
	        return interpolator[mode](col1, col2, f)
	            .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
	    };

	    Color_1.prototype.mix =
	    Color_1.prototype.interpolate = function(col2, f) {
	    	if ( f === void 0 ) f=0.5;
	    	var rest = [], len = arguments.length - 2;
	    	while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

	    	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
	    };

	    Color_1.prototype.premultiply = function(mutate) {
	    	if ( mutate === void 0 ) mutate=false;

	    	var rgb = this._rgb;
	    	var a = rgb[3];
	    	if (mutate) {
	    		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
	    		return this;
	    	} else {
	    		return new Color_1([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
	    	}
	    };

	    Color_1.prototype.saturate = function(amount) {
	    	if ( amount === void 0 ) amount=1;

	    	var me = this;
	    	var lch = me.lch();
	    	lch[1] += labConstants.Kn * amount;
	    	if (lch[1] < 0) { lch[1] = 0; }
	    	return new Color_1(lch, 'lch').alpha(me.alpha(), true);
	    };

	    Color_1.prototype.desaturate = function(amount) {
	    	if ( amount === void 0 ) amount=1;

	    	return this.saturate(-amount);
	    };

	    var type$i = utils.type;

	    Color_1.prototype.set = function(mc, value, mutate) {
	        if ( mutate === void 0 ) mutate=false;

	        var ref = mc.split('.');
	        var mode = ref[0];
	        var channel = ref[1];
	        var src = this[mode]();
	        if (channel) {
	            var i = mode.indexOf(channel);
	            if (i > -1) {
	                if (type$i(value) == 'string') {
	                    switch(value.charAt(0)) {
	                        case '+': src[i] += +value; break;
	                        case '-': src[i] += +value; break;
	                        case '*': src[i] *= +(value.substr(1)); break;
	                        case '/': src[i] /= +(value.substr(1)); break;
	                        default: src[i] = +value;
	                    }
	                } else if (type$i(value) === 'number') {
	                    src[i] = value;
	                } else {
	                    throw new Error("unsupported value for Color.set");
	                }
	                var out = new Color_1(src, mode);
	                if (mutate) {
	                    this._rgb = out._rgb;
	                    return this;
	                }
	                return out;
	            }
	            throw new Error(("unknown channel " + channel + " in mode " + mode));
	        } else {
	            return src;
	        }
	    };

	    var rgb$1 = function (col1, col2, f) {
	        var xyz0 = col1._rgb;
	        var xyz1 = col2._rgb;
	        return new Color_1(
	            xyz0[0] + f * (xyz1[0]-xyz0[0]),
	            xyz0[1] + f * (xyz1[1]-xyz0[1]),
	            xyz0[2] + f * (xyz1[2]-xyz0[2]),
	            'rgb'
	        )
	    };

	    // register interpolator
	    interpolator.rgb = rgb$1;

	    var sqrt$2 = Math.sqrt;
	    var pow$3 = Math.pow;

	    var lrgb = function (col1, col2, f) {
	        var ref = col1._rgb;
	        var x1 = ref[0];
	        var y1 = ref[1];
	        var z1 = ref[2];
	        var ref$1 = col2._rgb;
	        var x2 = ref$1[0];
	        var y2 = ref$1[1];
	        var z2 = ref$1[2];
	        return new Color_1(
	            sqrt$2(pow$3(x1,2) * (1-f) + pow$3(x2,2) * f),
	            sqrt$2(pow$3(y1,2) * (1-f) + pow$3(y2,2) * f),
	            sqrt$2(pow$3(z1,2) * (1-f) + pow$3(z2,2) * f),
	            'rgb'
	        )
	    };

	    // register interpolator
	    interpolator.lrgb = lrgb;

	    var lab$1 = function (col1, col2, f) {
	        var xyz0 = col1.lab();
	        var xyz1 = col2.lab();
	        return new Color_1(
	            xyz0[0] + f * (xyz1[0]-xyz0[0]),
	            xyz0[1] + f * (xyz1[1]-xyz0[1]),
	            xyz0[2] + f * (xyz1[2]-xyz0[2]),
	            'lab'
	        )
	    };

	    // register interpolator
	    interpolator.lab = lab$1;

	    var _hsx = function (col1, col2, f, m) {
	        var assign, assign$1;

	        var xyz0, xyz1;
	        if (m === 'hsl') {
	            xyz0 = col1.hsl();
	            xyz1 = col2.hsl();
	        } else if (m === 'hsv') {
	            xyz0 = col1.hsv();
	            xyz1 = col2.hsv();
	        } else if (m === 'hcg') {
	            xyz0 = col1.hcg();
	            xyz1 = col2.hcg();
	        } else if (m === 'hsi') {
	            xyz0 = col1.hsi();
	            xyz1 = col2.hsi();
	        } else if (m === 'lch' || m === 'hcl') {
	            m = 'hcl';
	            xyz0 = col1.hcl();
	            xyz1 = col2.hcl();
	        }

	        var hue0, hue1, sat0, sat1, lbv0, lbv1;
	        if (m.substr(0, 1) === 'h') {
	            (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
	            (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
	        }

	        var sat, hue, lbv, dh;

	        if (!isNaN(hue0) && !isNaN(hue1)) {
	            // both colors have hue
	            if (hue1 > hue0 && hue1 - hue0 > 180) {
	                dh = hue1-(hue0+360);
	            } else if (hue1 < hue0 && hue0 - hue1 > 180) {
	                dh = hue1+360-hue0;
	            } else {
	                dh = hue1 - hue0;
	            }
	            hue = hue0 + f * dh;
	        } else if (!isNaN(hue0)) {
	            hue = hue0;
	            if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
	        } else if (!isNaN(hue1)) {
	            hue = hue1;
	            if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
	        } else {
	            hue = Number.NaN;
	        }

	        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
	        lbv = lbv0 + f * (lbv1-lbv0);
	        return new Color_1([hue, sat, lbv], m);
	    };

	    var lch$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'lch');
	    };

	    // register interpolator
	    interpolator.lch = lch$1;
	    interpolator.hcl = lch$1;

	    var num$1 = function (col1, col2, f) {
	        var c1 = col1.num();
	        var c2 = col2.num();
	        return new Color_1(c1 + f * (c2-c1), 'num')
	    };

	    // register interpolator
	    interpolator.num = num$1;

	    var hcg$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'hcg');
	    };

	    // register interpolator
	    interpolator.hcg = hcg$1;

	    var hsi$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'hsi');
	    };

	    // register interpolator
	    interpolator.hsi = hsi$1;

	    var hsl$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'hsl');
	    };

	    // register interpolator
	    interpolator.hsl = hsl$1;

	    var hsv$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'hsv');
	    };

	    // register interpolator
	    interpolator.hsv = hsv$1;

	    var clip_rgb$2 = utils.clip_rgb;
	    var pow$4 = Math.pow;
	    var sqrt$3 = Math.sqrt;
	    var PI$1 = Math.PI;
	    var cos$2 = Math.cos;
	    var sin$1 = Math.sin;
	    var atan2$1 = Math.atan2;

	    var average = function (colors, mode, weights) {
	        if ( mode === void 0 ) mode='lrgb';
	        if ( weights === void 0 ) weights=null;

	        var l = colors.length;
	        if (!weights) { weights = Array.from(new Array(l)).map(function () { return 1; }); }
	        // normalize weights
	        var k = l / weights.reduce(function(a, b) { return a + b; });
	        weights.forEach(function (w,i) { weights[i] *= k; });
	        // convert colors to Color objects
	        colors = colors.map(function (c) { return new Color_1(c); });
	        if (mode === 'lrgb') {
	            return _average_lrgb(colors, weights)
	        }
	        var first = colors.shift();
	        var xyz = first.get(mode);
	        var cnt = [];
	        var dx = 0;
	        var dy = 0;
	        // initial color
	        for (var i=0; i<xyz.length; i++) {
	            xyz[i] = (xyz[i] || 0) * weights[0];
	            cnt.push(isNaN(xyz[i]) ? 0 : weights[0]);
	            if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
	                var A = xyz[i] / 180 * PI$1;
	                dx += cos$2(A) * weights[0];
	                dy += sin$1(A) * weights[0];
	            }
	        }

	        var alpha = first.alpha() * weights[0];
	        colors.forEach(function (c,ci) {
	            var xyz2 = c.get(mode);
	            alpha += c.alpha() * weights[ci+1];
	            for (var i=0; i<xyz.length; i++) {
	                if (!isNaN(xyz2[i])) {
	                    cnt[i] += weights[ci+1];
	                    if (mode.charAt(i) === 'h') {
	                        var A = xyz2[i] / 180 * PI$1;
	                        dx += cos$2(A) * weights[ci+1];
	                        dy += sin$1(A) * weights[ci+1];
	                    } else {
	                        xyz[i] += xyz2[i] * weights[ci+1];
	                    }
	                }
	            }
	        });

	        for (var i$1=0; i$1<xyz.length; i$1++) {
	            if (mode.charAt(i$1) === 'h') {
	                var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
	                while (A$1 < 0) { A$1 += 360; }
	                while (A$1 >= 360) { A$1 -= 360; }
	                xyz[i$1] = A$1;
	            } else {
	                xyz[i$1] = xyz[i$1]/cnt[i$1];
	            }
	        }
	        alpha /= l;
	        return (new Color_1(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
	    };


	    var _average_lrgb = function (colors, weights) {
	        var l = colors.length;
	        var xyz = [0,0,0,0];
	        for (var i=0; i < colors.length; i++) {
	            var col = colors[i];
	            var f = weights[i] / l;
	            var rgb = col._rgb;
	            xyz[0] += pow$4(rgb[0],2) * f;
	            xyz[1] += pow$4(rgb[1],2) * f;
	            xyz[2] += pow$4(rgb[2],2) * f;
	            xyz[3] += rgb[3] * f;
	        }
	        xyz[0] = sqrt$3(xyz[0]);
	        xyz[1] = sqrt$3(xyz[1]);
	        xyz[2] = sqrt$3(xyz[2]);
	        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
	        return new Color_1(clip_rgb$2(xyz));
	    };

	    // minimal multi-purpose interface

	    // @requires utils color analyze


	    var type$j = utils.type;

	    var pow$5 = Math.pow;

	    var scale = function(colors) {

	        // constructor
	        var _mode = 'rgb';
	        var _nacol = chroma_1('#ccc');
	        var _spread = 0;
	        // const _fixed = false;
	        var _domain = [0, 1];
	        var _pos = [];
	        var _padding = [0,0];
	        var _classes = false;
	        var _colors = [];
	        var _out = false;
	        var _min = 0;
	        var _max = 1;
	        var _correctLightness = false;
	        var _colorCache = {};
	        var _useCache = true;
	        var _gamma = 1;

	        // private methods

	        var setColors = function(colors) {
	            colors = colors || ['#fff', '#000'];
	            if (colors && type$j(colors) === 'string' && chroma_1.brewer &&
	                chroma_1.brewer[colors.toLowerCase()]) {
	                colors = chroma_1.brewer[colors.toLowerCase()];
	            }
	            if (type$j(colors) === 'array') {
	                // handle single color
	                if (colors.length === 1) {
	                    colors = [colors[0], colors[0]];
	                }
	                // make a copy of the colors
	                colors = colors.slice(0);
	                // convert to chroma classes
	                for (var c=0; c<colors.length; c++) {
	                    colors[c] = chroma_1(colors[c]);
	                }
	                // auto-fill color position
	                _pos.length = 0;
	                for (var c$1=0; c$1<colors.length; c$1++) {
	                    _pos.push(c$1/(colors.length-1));
	                }
	            }
	            resetCache();
	            return _colors = colors;
	        };

	        var getClass = function(value) {
	            if (_classes != null) {
	                var n = _classes.length-1;
	                var i = 0;
	                while (i < n && value >= _classes[i]) {
	                    i++;
	                }
	                return i-1;
	            }
	            return 0;
	        };

	        var tMapLightness = function (t) { return t; };
	        var tMapDomain = function (t) { return t; };

	        // const classifyValue = function(value) {
	        //     let val = value;
	        //     if (_classes.length > 2) {
	        //         const n = _classes.length-1;
	        //         const i = getClass(value);
	        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
	        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
	        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
	        //     }
	        //     return val;
	        // };

	        var getColor = function(val, bypassMap) {
	            var col, t;
	            if (bypassMap == null) { bypassMap = false; }
	            if (isNaN(val) || (val === null)) { return _nacol; }
	            if (!bypassMap) {
	                if (_classes && (_classes.length > 2)) {
	                    // find the class
	                    var c = getClass(val);
	                    t = c / (_classes.length-2);
	                } else if (_max !== _min) {
	                    // just interpolate between min/max
	                    t = (val - _min) / (_max - _min);
	                } else {
	                    t = 1;
	                }
	            } else {
	                t = val;
	            }

	            // domain map
	            t = tMapDomain(t);

	            if (!bypassMap) {
	                t = tMapLightness(t);  // lightness correction
	            }

	            if (_gamma !== 1) { t = pow$5(t, _gamma); }

	            t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

	            t = Math.min(1, Math.max(0, t));

	            var k = Math.floor(t * 10000);

	            if (_useCache && _colorCache[k]) {
	                col = _colorCache[k];
	            } else {
	                if (type$j(_colors) === 'array') {
	                    //for i in [0.._pos.length-1]
	                    for (var i=0; i<_pos.length; i++) {
	                        var p = _pos[i];
	                        if (t <= p) {
	                            col = _colors[i];
	                            break;
	                        }
	                        if ((t >= p) && (i === (_pos.length-1))) {
	                            col = _colors[i];
	                            break;
	                        }
	                        if (t > p && t < _pos[i+1]) {
	                            t = (t-p)/(_pos[i+1]-p);
	                            col = chroma_1.interpolate(_colors[i], _colors[i+1], t, _mode);
	                            break;
	                        }
	                    }
	                } else if (type$j(_colors) === 'function') {
	                    col = _colors(t);
	                }
	                if (_useCache) { _colorCache[k] = col; }
	            }
	            return col;
	        };

	        var resetCache = function () { return _colorCache = {}; };

	        setColors(colors);

	        // public interface

	        var f = function(v) {
	            var c = chroma_1(getColor(v));
	            if (_out && c[_out]) { return c[_out](); } else { return c; }
	        };

	        f.classes = function(classes) {
	            if (classes != null) {
	                if (type$j(classes) === 'array') {
	                    _classes = classes;
	                    _domain = [classes[0], classes[classes.length-1]];
	                } else {
	                    var d = chroma_1.analyze(_domain);
	                    if (classes === 0) {
	                        _classes = [d.min, d.max];
	                    } else {
	                        _classes = chroma_1.limits(d, 'e', classes);
	                    }
	                }
	                return f;
	            }
	            return _classes;
	        };


	        f.domain = function(domain) {
	            if (!arguments.length) {
	                return _domain;
	            }
	            _min = domain[0];
	            _max = domain[domain.length-1];
	            _pos = [];
	            var k = _colors.length;
	            if ((domain.length === k) && (_min !== _max)) {
	                // update positions
	                for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
	                    var d = list[i];

	                  _pos.push((d-_min) / (_max-_min));
	                }
	            } else {
	                for (var c=0; c<k; c++) {
	                    _pos.push(c/(k-1));
	                }
	                if (domain.length > 2) {
	                    // set domain map
	                    var tOut = domain.map(function (d,i) { return i/(domain.length-1); });
	                    var tBreaks = domain.map(function (d) { return (d - _min) / (_max - _min); });
	                    if (!tBreaks.every(function (val, i) { return tOut[i] === val; })) {
	                        tMapDomain = function (t) {
	                            if (t <= 0 || t >= 1) { return t; }
	                            var i = 0;
	                            while (t >= tBreaks[i+1]) { i++; }
	                            var f = (t - tBreaks[i]) / (tBreaks[i+1] - tBreaks[i]);
	                            var out = tOut[i] + f * (tOut[i+1] - tOut[i]);
	                            return out;
	                        };
	                    }

	                }
	            }
	            _domain = [_min, _max];
	            return f;
	        };

	        f.mode = function(_m) {
	            if (!arguments.length) {
	                return _mode;
	            }
	            _mode = _m;
	            resetCache();
	            return f;
	        };

	        f.range = function(colors, _pos) {
	            setColors(colors);
	            return f;
	        };

	        f.out = function(_o) {
	            _out = _o;
	            return f;
	        };

	        f.spread = function(val) {
	            if (!arguments.length) {
	                return _spread;
	            }
	            _spread = val;
	            return f;
	        };

	        f.correctLightness = function(v) {
	            if (v == null) { v = true; }
	            _correctLightness = v;
	            resetCache();
	            if (_correctLightness) {
	                tMapLightness = function(t) {
	                    var L0 = getColor(0, true).lab()[0];
	                    var L1 = getColor(1, true).lab()[0];
	                    var pol = L0 > L1;
	                    var L_actual = getColor(t, true).lab()[0];
	                    var L_ideal = L0 + ((L1 - L0) * t);
	                    var L_diff = L_actual - L_ideal;
	                    var t0 = 0;
	                    var t1 = 1;
	                    var max_iter = 20;
	                    while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
	                        (function() {
	                            if (pol) { L_diff *= -1; }
	                            if (L_diff < 0) {
	                                t0 = t;
	                                t += (t1 - t) * 0.5;
	                            } else {
	                                t1 = t;
	                                t += (t0 - t) * 0.5;
	                            }
	                            L_actual = getColor(t, true).lab()[0];
	                            return L_diff = L_actual - L_ideal;
	                        })();
	                    }
	                    return t;
	                };
	            } else {
	                tMapLightness = function (t) { return t; };
	            }
	            return f;
	        };

	        f.padding = function(p) {
	            if (p != null) {
	                if (type$j(p) === 'number') {
	                    p = [p,p];
	                }
	                _padding = p;
	                return f;
	            } else {
	                return _padding;
	            }
	        };

	        f.colors = function(numColors, out) {
	            // If no arguments are given, return the original colors that were provided
	            if (arguments.length < 2) { out = 'hex'; }
	            var result = [];

	            if (arguments.length === 0) {
	                result = _colors.slice(0);

	            } else if (numColors === 1) {
	                result = [f(0.5)];

	            } else if (numColors > 1) {
	                var dm = _domain[0];
	                var dd = _domain[1] - dm;
	                result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

	            } else { // returns all colors based on the defined classes
	                colors = [];
	                var samples = [];
	                if (_classes && (_classes.length > 2)) {
	                    for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
	                        samples.push((_classes[i-1]+_classes[i])*0.5);
	                    }
	                } else {
	                    samples = _domain;
	                }
	                result = samples.map(function (v) { return f(v); });
	            }

	            if (chroma_1[out]) {
	                result = result.map(function (c) { return c[out](); });
	            }
	            return result;
	        };

	        f.cache = function(c) {
	            if (c != null) {
	                _useCache = c;
	                return f;
	            } else {
	                return _useCache;
	            }
	        };

	        f.gamma = function(g) {
	            if (g != null) {
	                _gamma = g;
	                return f;
	            } else {
	                return _gamma;
	            }
	        };

	        f.nodata = function(d) {
	            if (d != null) {
	                _nacol = chroma_1(d);
	                return f;
	            } else {
	                return _nacol;
	            }
	        };

	        return f;
	    };

	    function __range__(left, right, inclusive) {
	      var range = [];
	      var ascending = left < right;
	      var end = !inclusive ? right : ascending ? right + 1 : right - 1;
	      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
	        range.push(i);
	      }
	      return range;
	    }

	    //
	    // interpolates between a set of colors uzing a bezier spline
	    //

	    // @requires utils lab




	    var bezier = function(colors) {
	        var assign, assign$1, assign$2;

	        var I, lab0, lab1, lab2;
	        colors = colors.map(function (c) { return new Color_1(c); });
	        if (colors.length === 2) {
	            // linear interpolation
	            (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
	                return new Color_1(lab, 'lab');
	            };
	        } else if (colors.length === 3) {
	            // quadratic bezier interpolation
	            (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
	                return new Color_1(lab, 'lab');
	            };
	        } else if (colors.length === 4) {
	            // cubic bezier interpolation
	            var lab3;
	            (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
	                return new Color_1(lab, 'lab');
	            };
	        } else if (colors.length === 5) {
	            var I0 = bezier(colors.slice(0, 3));
	            var I1 = bezier(colors.slice(2, 5));
	            I = function(t) {
	                if (t < 0.5) {
	                    return I0(t*2);
	                } else {
	                    return I1((t-0.5)*2);
	                }
	            };
	        }
	        return I;
	    };

	    var bezier_1 = function (colors) {
	        var f = bezier(colors);
	        f.scale = function () { return scale(f); };
	        return f;
	    };

	    /*
	     * interpolates between a set of colors uzing a bezier spline
	     * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
	     */




	    var blend = function (bottom, top, mode) {
	        if (!blend[mode]) {
	            throw new Error('unknown blend mode ' + mode);
	        }
	        return blend[mode](bottom, top);
	    };

	    var blend_f = function (f) { return function (bottom,top) {
	            var c0 = chroma_1(top).rgb();
	            var c1 = chroma_1(bottom).rgb();
	            return chroma_1.rgb(f(c0, c1));
	        }; };

	    var each = function (f) { return function (c0, c1) {
	            var out = [];
	            out[0] = f(c0[0], c1[0]);
	            out[1] = f(c0[1], c1[1]);
	            out[2] = f(c0[2], c1[2]);
	            return out;
	        }; };

	    var normal = function (a) { return a; };
	    var multiply = function (a,b) { return a * b / 255; };
	    var darken$1 = function (a,b) { return a > b ? b : a; };
	    var lighten = function (a,b) { return a > b ? a : b; };
	    var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
	    var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
	    var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
	    var dodge = function (a,b) {
	        if (a === 255) { return 255; }
	        a = 255 * (b / 255) / (1 - a / 255);
	        return a > 255 ? 255 : a
	    };

	    // # add = (a,b) ->
	    // #     if (a + b > 255) then 255 else a + b

	    blend.normal = blend_f(each(normal));
	    blend.multiply = blend_f(each(multiply));
	    blend.screen = blend_f(each(screen));
	    blend.overlay = blend_f(each(overlay));
	    blend.darken = blend_f(each(darken$1));
	    blend.lighten = blend_f(each(lighten));
	    blend.dodge = blend_f(each(dodge));
	    blend.burn = blend_f(each(burn));
	    // blend.add = blend_f(each(add));

	    var blend_1 = blend;

	    // cubehelix interpolation
	    // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
	    // http://astron-soc.in/bulletin/11June/289392011.pdf

	    var type$k = utils.type;
	    var clip_rgb$3 = utils.clip_rgb;
	    var TWOPI$2 = utils.TWOPI;
	    var pow$6 = Math.pow;
	    var sin$2 = Math.sin;
	    var cos$3 = Math.cos;


	    var cubehelix = function(start, rotations, hue, gamma, lightness) {
	        if ( start === void 0 ) start=300;
	        if ( rotations === void 0 ) rotations=-1.5;
	        if ( hue === void 0 ) hue=1;
	        if ( gamma === void 0 ) gamma=1;
	        if ( lightness === void 0 ) lightness=[0,1];

	        var dh = 0, dl;
	        if (type$k(lightness) === 'array') {
	            dl = lightness[1] - lightness[0];
	        } else {
	            dl = 0;
	            lightness = [lightness, lightness];
	        }

	        var f = function(fract) {
	            var a = TWOPI$2 * (((start+120)/360) + (rotations * fract));
	            var l = pow$6(lightness[0] + (dl * fract), gamma);
	            var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
	            var amp = (h * l * (1-l)) / 2;
	            var cos_a = cos$3(a);
	            var sin_a = sin$2(a);
	            var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
	            var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
	            var b = l + (amp * (+1.97294 * cos_a));
	            return chroma_1(clip_rgb$3([r*255,g*255,b*255,1]));
	        };

	        f.start = function(s) {
	            if ((s == null)) { return start; }
	            start = s;
	            return f;
	        };

	        f.rotations = function(r) {
	            if ((r == null)) { return rotations; }
	            rotations = r;
	            return f;
	        };

	        f.gamma = function(g) {
	            if ((g == null)) { return gamma; }
	            gamma = g;
	            return f;
	        };

	        f.hue = function(h) {
	            if ((h == null)) { return hue; }
	            hue = h;
	            if (type$k(hue) === 'array') {
	                dh = hue[1] - hue[0];
	                if (dh === 0) { hue = hue[1]; }
	            } else {
	                dh = 0;
	            }
	            return f;
	        };

	        f.lightness = function(h) {
	            if ((h == null)) { return lightness; }
	            if (type$k(h) === 'array') {
	                lightness = h;
	                dl = h[1] - h[0];
	            } else {
	                lightness = [h,h];
	                dl = 0;
	            }
	            return f;
	        };

	        f.scale = function () { return chroma_1.scale(f); };

	        f.hue(hue);

	        return f;
	    };

	    var digits = '0123456789abcdef';

	    var floor$2 = Math.floor;
	    var random = Math.random;

	    var random_1 = function () {
	        var code = '#';
	        for (var i=0; i<6; i++) {
	            code += digits.charAt(floor$2(random() * 16));
	        }
	        return new Color_1(code, 'hex');
	    };

	    var log$1 = Math.log;
	    var pow$7 = Math.pow;
	    var floor$3 = Math.floor;
	    var abs = Math.abs;


	    var analyze = function (data, key) {
	        if ( key === void 0 ) key=null;

	        var r = {
	            min: Number.MAX_VALUE,
	            max: Number.MAX_VALUE*-1,
	            sum: 0,
	            values: [],
	            count: 0
	        };
	        if (type(data) === 'object') {
	            data = Object.values(data);
	        }
	        data.forEach(function (val) {
	            if (key && type(val) === 'object') { val = val[key]; }
	            if (val !== undefined && val !== null && !isNaN(val)) {
	                r.values.push(val);
	                r.sum += val;
	                if (val < r.min) { r.min = val; }
	                if (val > r.max) { r.max = val; }
	                r.count += 1;
	            }
	        });

	        r.domain = [r.min, r.max];

	        r.limits = function (mode, num) { return limits(r, mode, num); };

	        return r;
	    };


	    var limits = function (data, mode, num) {
	        if ( mode === void 0 ) mode='equal';
	        if ( num === void 0 ) num=7;

	        if (type(data) == 'array') {
	            data = analyze(data);
	        }
	        var min = data.min;
	        var max = data.max;
	        var values = data.values.sort(function (a,b) { return a-b; });

	        if (num === 1) { return [min,max]; }

	        var limits = [];

	        if (mode.substr(0,1) === 'c') { // continuous
	            limits.push(min);
	            limits.push(max);
	        }

	        if (mode.substr(0,1) === 'e') { // equal interval
	            limits.push(min);
	            for (var i=1; i<num; i++) {
	                limits.push(min+((i/num)*(max-min)));
	            }
	            limits.push(max);
	        }

	        else if (mode.substr(0,1) === 'l') { // log scale
	            if (min <= 0) {
	                throw new Error('Logarithmic scales are only possible for values > 0');
	            }
	            var min_log = Math.LOG10E * log$1(min);
	            var max_log = Math.LOG10E * log$1(max);
	            limits.push(min);
	            for (var i$1=1; i$1<num; i$1++) {
	                limits.push(pow$7(10, min_log + ((i$1/num) * (max_log - min_log))));
	            }
	            limits.push(max);
	        }

	        else if (mode.substr(0,1) === 'q') { // quantile scale
	            limits.push(min);
	            for (var i$2=1; i$2<num; i$2++) {
	                var p = ((values.length-1) * i$2)/num;
	                var pb = floor$3(p);
	                if (pb === p) {
	                    limits.push(values[pb]);
	                } else { // p > pb
	                    var pr = p - pb;
	                    limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
	                }
	            }
	            limits.push(max);

	        }

	        else if (mode.substr(0,1) === 'k') { // k-means clustering
	            /*
	            implementation based on
	            http://code.google.com/p/figue/source/browse/trunk/figue.js#336
	            simplified for 1-d input values
	            */
	            var cluster;
	            var n = values.length;
	            var assignments = new Array(n);
	            var clusterSizes = new Array(num);
	            var repeat = true;
	            var nb_iters = 0;
	            var centroids = null;

	            // get seed values
	            centroids = [];
	            centroids.push(min);
	            for (var i$3=1; i$3<num; i$3++) {
	                centroids.push(min + ((i$3/num) * (max-min)));
	            }
	            centroids.push(max);

	            while (repeat) {
	                // assignment step
	                for (var j=0; j<num; j++) {
	                    clusterSizes[j] = 0;
	                }
	                for (var i$4=0; i$4<n; i$4++) {
	                    var value = values[i$4];
	                    var mindist = Number.MAX_VALUE;
	                    var best = (void 0);
	                    for (var j$1=0; j$1<num; j$1++) {
	                        var dist = abs(centroids[j$1]-value);
	                        if (dist < mindist) {
	                            mindist = dist;
	                            best = j$1;
	                        }
	                        clusterSizes[best]++;
	                        assignments[i$4] = best;
	                    }
	                }

	                // update centroids step
	                var newCentroids = new Array(num);
	                for (var j$2=0; j$2<num; j$2++) {
	                    newCentroids[j$2] = null;
	                }
	                for (var i$5=0; i$5<n; i$5++) {
	                    cluster = assignments[i$5];
	                    if (newCentroids[cluster] === null) {
	                        newCentroids[cluster] = values[i$5];
	                    } else {
	                        newCentroids[cluster] += values[i$5];
	                    }
	                }
	                for (var j$3=0; j$3<num; j$3++) {
	                    newCentroids[j$3] *= 1/clusterSizes[j$3];
	                }

	                // check convergence
	                repeat = false;
	                for (var j$4=0; j$4<num; j$4++) {
	                    if (newCentroids[j$4] !== centroids[j$4]) {
	                        repeat = true;
	                        break;
	                    }
	                }

	                centroids = newCentroids;
	                nb_iters++;

	                if (nb_iters > 200) {
	                    repeat = false;
	                }
	            }

	            // finished k-means clustering
	            // the next part is borrowed from gabrielflor.it
	            var kClusters = {};
	            for (var j$5=0; j$5<num; j$5++) {
	                kClusters[j$5] = [];
	            }
	            for (var i$6=0; i$6<n; i$6++) {
	                cluster = assignments[i$6];
	                kClusters[cluster].push(values[i$6]);
	            }
	            var tmpKMeansBreaks = [];
	            for (var j$6=0; j$6<num; j$6++) {
	                tmpKMeansBreaks.push(kClusters[j$6][0]);
	                tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
	            }
	            tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
	            limits.push(tmpKMeansBreaks[0]);
	            for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
	                var v = tmpKMeansBreaks[i$7];
	                if (!isNaN(v) && (limits.indexOf(v) === -1)) {
	                    limits.push(v);
	                }
	            }
	        }
	        return limits;
	    };

	    var analyze_1 = {analyze: analyze, limits: limits};

	    var contrast = function (a, b) {
	        // WCAG contrast ratio
	        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
	        a = new Color_1(a);
	        b = new Color_1(b);
	        var l1 = a.luminance();
	        var l2 = b.luminance();
	        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
	    };

	    var sqrt$4 = Math.sqrt;
	    var atan2$2 = Math.atan2;
	    var abs$1 = Math.abs;
	    var cos$4 = Math.cos;
	    var PI$2 = Math.PI;

	    var deltaE = function(a, b, L, C) {
	        if ( L === void 0 ) L=1;
	        if ( C === void 0 ) C=1;

	        // Delta E (CMC)
	        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CMC.html
	        a = new Color_1(a);
	        b = new Color_1(b);
	        var ref = Array.from(a.lab());
	        var L1 = ref[0];
	        var a1 = ref[1];
	        var b1 = ref[2];
	        var ref$1 = Array.from(b.lab());
	        var L2 = ref$1[0];
	        var a2 = ref$1[1];
	        var b2 = ref$1[2];
	        var c1 = sqrt$4((a1 * a1) + (b1 * b1));
	        var c2 = sqrt$4((a2 * a2) + (b2 * b2));
	        var sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + (0.01765 * L1));
	        var sc = ((0.0638 * c1) / (1.0 + (0.0131 * c1))) + 0.638;
	        var h1 = c1 < 0.000001 ? 0.0 : (atan2$2(b1, a1) * 180.0) / PI$2;
	        while (h1 < 0) { h1 += 360; }
	        while (h1 >= 360) { h1 -= 360; }
	        var t = (h1 >= 164.0) && (h1 <= 345.0) ? (0.56 + abs$1(0.2 * cos$4((PI$2 * (h1 + 168.0)) / 180.0))) : (0.36 + abs$1(0.4 * cos$4((PI$2 * (h1 + 35.0)) / 180.0)));
	        var c4 = c1 * c1 * c1 * c1;
	        var f = sqrt$4(c4 / (c4 + 1900.0));
	        var sh = sc * (((f * t) + 1.0) - f);
	        var delL = L1 - L2;
	        var delC = c1 - c2;
	        var delA = a1 - a2;
	        var delB = b1 - b2;
	        var dH2 = ((delA * delA) + (delB * delB)) - (delC * delC);
	        var v1 = delL / (L * sl);
	        var v2 = delC / (C * sc);
	        var v3 = sh;
	        return sqrt$4((v1 * v1) + (v2 * v2) + (dH2 / (v3 * v3)));
	    };

	    // simple Euclidean distance
	    var distance = function(a, b, mode) {
	        if ( mode === void 0 ) mode='lab';

	        // Delta E (CIE 1976)
	        // see http://www.brucelindbloom.com/index.html?Equations.html
	        a = new Color_1(a);
	        b = new Color_1(b);
	        var l1 = a.get(mode);
	        var l2 = b.get(mode);
	        var sum_sq = 0;
	        for (var i in l1) {
	            var d = (l1[i] || 0) - (l2[i] || 0);
	            sum_sq += d*d;
	        }
	        return Math.sqrt(sum_sq);
	    };

	    var valid = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        try {
	            new (Function.prototype.bind.apply( Color_1, [ null ].concat( args) ));
	            return true;
	        } catch (e) {
	            return false;
	        }
	    };

	    // some pre-defined color scales:




	    var scales = {
	    	cool: function cool() { return scale([chroma_1.hsl(180,1,.9), chroma_1.hsl(250,.7,.4)]) },
	    	hot: function hot() { return scale(['#000','#f00','#ff0','#fff']).mode('rgb') }
	    };

	    /**
	        ColorBrewer colors for chroma.js

	        Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
	        Pennsylvania State University.

	        Licensed under the Apache License, Version 2.0 (the "License");
	        you may not use this file except in compliance with the License.
	        You may obtain a copy of the License at
	        http://www.apache.org/licenses/LICENSE-2.0

	        Unless required by applicable law or agreed to in writing, software distributed
	        under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	        CONDITIONS OF ANY KIND, either express or implied. See the License for the
	        specific language governing permissions and limitations under the License.
	    */

	    var colorbrewer = {
	        // sequential
	        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
	        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
	        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
	        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
	        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
	        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
	        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
	        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
	        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
	        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
	        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
	        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
	        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
	        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
	        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
	        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
	        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
	        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
	        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

	        // diverging

	        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
	        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
	        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
	        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
	        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
	        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
	        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
	        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
	        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

	        // qualitative

	        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
	        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
	        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
	        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
	        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
	        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
	        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
	        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
	    };

	    // add lowercase aliases for case-insensitive matches
	    for (var i$1 = 0, list$1 = Object.keys(colorbrewer); i$1 < list$1.length; i$1 += 1) {
	        var key = list$1[i$1];

	        colorbrewer[key.toLowerCase()] = colorbrewer[key];
	    }

	    var colorbrewer_1 = colorbrewer;

	    // feel free to comment out anything to rollup
	    // a smaller chroma.js built

	    // io --> convert colors















	    // operators --> modify existing Colors










	    // interpolators










	    // generators -- > create new colors
	    chroma_1.average = average;
	    chroma_1.bezier = bezier_1;
	    chroma_1.blend = blend_1;
	    chroma_1.cubehelix = cubehelix;
	    chroma_1.mix = chroma_1.interpolate = mix;
	    chroma_1.random = random_1;
	    chroma_1.scale = scale;

	    // other utility methods
	    chroma_1.analyze = analyze_1.analyze;
	    chroma_1.contrast = contrast;
	    chroma_1.deltaE = deltaE;
	    chroma_1.distance = distance;
	    chroma_1.limits = analyze_1.limits;
	    chroma_1.valid = valid;

	    // scale
	    chroma_1.scales = scales;

	    // colors
	    chroma_1.colors = w3cx11_1;
	    chroma_1.brewer = colorbrewer_1;

	    var chroma_js = chroma_1;

	    return chroma_js;

	})));
	});

	/* visualize/colorblind-check/ColorblindCheck.html generated by Svelte v2.16.1 */



	let __dw;
	const lastColors = new Set();
	let colorLookup = {};

	function data$d() {
	    return {
	        activeMode: 'normal',
	        testing: false,
	        warnings: {
	            deuteranopia: false,
	            protanopia: false,
	            tritanopia: false
	        }
	    };
	}
	var modes = [
	    {
	        id: 'normal',
	        label: 'Norm',
	        icon: 'norm.png',
	        info: false
	    },
	    {
	        id: 'deuteranopia',
	        label: 'Deut',
	        icon: 'deut.png',
	        info: __('colorblind / info / deut')
	    },
	    {
	        id: 'protanopia',
	        label: 'Prot',
	        icon: 'prot.png',
	        info: __('colorblind / info / prot')
	    },
	    {
	        id: 'tritanopia',
	        label: 'Trit',
	        icon: 'trit.png',
	        info: __('colorblind / info / trit')
	    },
	    {
	        id: 'achromatopsia',
	        label: 'Achr',
	        icon: 'bw.png',
	        info: __('colorblind / info / bw')
	    }
	];

	var methods$6 = {
	    setMode(mode) {
	        this.set({ activeMode: mode });
	        colorLookup = {};
	        this.forceRerender();
	    },
	    resetWarnings() {
	        this.set({
	            warnings: {
	                deuteranopia: false,
	                protanopia: false,
	                tritanopia: false
	            }
	        });
	    },
	    forceRerender() {
	        const { activeMode } = this.get();
	        this.initIframe(() => {
	            $('#iframe-vis').get(0).contentWindow.__dwColorMode = activeMode;
	            $('#iframe-vis').get(0).contentWindow.__dw.render();
	            $('#iframe-vis').get(0).contentWindow.dispatchEvent(new Event('resize'));
	        });
	    },
	    initIframe(callback) {
	        const iframe = $('#iframe-vis').get(0);
	        const iframeWin = iframe.contentWindow;

	        if (!iframeWin.__dw) return setTimeout(() => this.initIframe(callback), 5);

	        __dw = iframeWin.__dw;

	        if (!__dw.colorMapInjected) {
	            iframeWin.__dwColorMap = color => this.colorMap(color);
	            __dw.colorMapInjected = true;
	        }
	        if (typeof callback === 'function') callback();
	    },
	    colorMap(color) {
	        const { activeMode } = this.get();
	        if (
	            activeMode === 'normal' ||
	            !color ||
	            color === 'none' ||
	            color === 'transparent' ||
	            color === 'auto'
	        )
	            return color;
	        var k = String(color);
	        lastColors.add(k);
	        if (colorLookup[k] !== undefined) return colorLookup[k];
	        try {
	            color = chroma(k).hex();
	            return (colorLookup[k] = blinder[activeMode](color));
	        } catch (e) {
	            return color;
	        }
	    }, //
	    runTests() {
	        // get list of all colors used in last run
	        if (!__dw.vis) {
	            // try again later
	            return setTimeout(() => {
	                this.runTests();
	            }, 1000);
	        }
	        let colors = __dw.vis
	            .colorsUsed()
	            .filter(c => chroma.valid(c) && chroma(c).get('lch.c') > 1.5);

	        let sample;
	        if (colors.length > 30) {
	            colors = colors
	                .map(function (c) {
	                    var col = chroma(c);
	                    return {
	                        raw: c,
	                        color: col,
	                        hue: col.get('lch.h')
	                    };
	                })
	                .sort(function (a, b) {
	                    return a.hue - b.hue;
	                })
	                .map(function (c) {
	                    return c.color;
	                });
	            // sample colors from hue gradient
	            sample = chroma.scale(colors).colors(40);
	        } else {
	            // use all colors
	            sample = colors;
	        }

	        const { testing } = this.get();
	        if (testing) return;

	        if (!sample.length) {
	            // wait a second
	            setTimeout(() => {
	                this.runTests();
	            }, 1000);
	            return;
	        }

	        this.set({ testing: true });
	        setTimeout(() => {
	            this.set({ testing: false });
	        }, 4000);

	        // auto-test 3 simulations

	        var res = {};

	        if (colors.length > 1) {
	            // this.resetWarnings();
	            const { warnings } = this.get();
	            Object.keys(warnings).forEach(mode => {
	                if (!this.testSample(sample, mode)) {
	                    warnings[mode] = true;
	                    res[mode] = 1;
	                } else {
	                    warnings[mode] = false;
	                    res[mode] = 0;
	                }
	            });
	            this.set({ warnings });
	        } else {
	            // just one color
	            res = { deuteranopia: 0, protanopia: 0, tritanopia: 0 };
	        }

	        this.set({ testing: false });

	        if (window.location.search === '?cbchk') {
	            if (chart.save) {
	                chart.setMetadata('colorblind', res);
	            } else {
	                setTimeout(function () {
	                    chart.setMetadata('colorblind', res);
	                }, 3000);
	            }
	        }

	        colorLookup = {};
	    },
	    testSample(sample, type) {
	        let ok = 0;
	        let notok = 0;
	        const ratioThres = 5;
	        const smallestPercievableDistance = 9.2;
	        const k = sample.length;
	        if (!k) {
	            return true;
	        }
	        // compute distances between colors
	        for (var a = 0; a < k; a++) {
	            for (var b = a + 1; b < k; b++) {
	                try {
	                    var colA = chroma(sample[a]);
	                    var colB = chroma(sample[b]);
	                } catch (e) {
	                    // something odd with either of the colors, ignore
	                    continue;
	                }
	                const dstNorm = difference(colA, colB);
	                if (dstNorm < smallestPercievableDistance) continue;
	                const aSim = blinder[type](colA.hex());
	                const bSim = blinder[type](colB.hex());
	                const dstSim = difference(aSim, bSim);
	                const isNotOk =
	                    dstNorm / dstSim > ratioThres && dstSim < smallestPercievableDistance;
	                // count combinations that are problematic
	                if (isNotOk) notok++;
	                else ok++;
	            }
	        }

	        // compute share of problematic samples
	        return notok / (ok + notok) < 0.03;
	    }
	};

	function oncreate$4() {
	    window.addEventListener('message', evt => {
	        if (evt.data === 'datawrapper:vis:init') {
	            this.initIframe();
	        }
	        if (evt.data === 'datawrapper:vis:rendered') {
	            this.runTests();
	        }
	    });
	    // run test upon first load
	    this.initIframe(() => {
	        this.runTests();
	    });
	}
	function difference(colA, colB) {
	    return 0.5 * (chroma.deltaE(colA, colB) + chroma.deltaE(colB, colA));
	}

	const file$f = "visualize/colorblind-check/ColorblindCheck.html";

	function click_handler$3(event) {
		const { component, ctx } = this._svelte;

		component.setMode(ctx.mode.id);
	}

	function get_each_context$7(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.mode = list[i];
		return child_ctx;
	}

	function create_main_fragment$j(component, ctx) {
		var div1, div0, text0_value = __('colorblind / caption'), text0, text1, text2;

		var if_block = (ctx.testing) && create_if_block_1$5();

		var each_value = modes;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$7(component, get_each_context$7(ctx, each_value, i));
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				text0 = createText(text0_value);
				text1 = createText(" ");
				if (if_block) if_block.c();
				text2 = createText("\n    ");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div0.className = "toolbar-caption";
				addLoc(div0, file$f, 1, 4, 57);
				div1.className = "toolbar-container web colorblind-check svelte-178rdj1";
				addLoc(div1, file$f, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, text0);
				append(div0, text1);
				if (if_block) if_block.m(div0, null);
				append(div1, text2);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div1, null);
				}
			},

			p: function update(changed, ctx) {
				if (ctx.testing) {
					if (!if_block) {
						if_block = create_if_block_1$5();
						if_block.c();
						if_block.m(div0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.warnings || changed.activeMode) {
					each_value = modes;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$7(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$7(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div1, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block) if_block.d();

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (3:37) {#if testing}
	function create_if_block_1$5(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-cog fa-spin prog-ress";
				addLoc(i, file$f, 2, 50, 137);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (14:21) {#if mode.info}
	function create_if_block$8(component, ctx) {
		var div, span, br, text_1, raw_value = ctx.mode.info, raw_before;

		return {
			c: function create() {
				div = createElement("div");
				span = createElement("span");
				span.textContent = "▲";
				br = createElement("br");
				text_1 = createText("\n            ");
				raw_before = createElement('noscript');
				span.className = "arrow";
				addLoc(span, file$f, 15, 12, 623);
				addLoc(br, file$f, 15, 40, 651);
				div.className = "more-info";
				addLoc(div, file$f, 14, 8, 587);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				append(div, br);
				append(div, text_1);
				append(div, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (5:4) {#each modes as mode}
	function create_each_block$7(component, ctx) {
		var div, img, text0, i, text1, text2_value = ctx.mode.label, text2, text3, text4;

		var if_block = (ctx.mode.info) && create_if_block$8(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				img = createElement("img");
				text0 = createText("\n        ");
				i = createElement("i");
				text1 = createText("\n        ");
				text2 = createText(text2_value);
				text3 = createText(" ");
				if (if_block) if_block.c();
				text4 = createText("\n    ");
				img.alt = ctx.mode.id;
				img.src = "/static/img/colorblind-check/" + ctx.mode.icon;
				addLoc(img, file$f, 11, 8, 393);
				i.className = "warning fa fa-exclamation-triangle svelte-178rdj1";
				setAttribute(i, "aria-hidden", "true");
				addLoc(i, file$f, 12, 8, 472);

				div._svelte = { component, ctx };

				addListener(div, "click", click_handler$3);
				div.className = "button svelte-178rdj1";
				toggleClass(div, "warning", ctx.warnings[ctx.mode.id]);
				toggleClass(div, "active", ctx.mode.id === ctx.activeMode);
				addLoc(div, file$f, 5, 4, 227);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, img);
				append(div, text0);
				append(div, i);
				append(div, text1);
				append(div, text2);
				append(div, text3);
				if (if_block) if_block.m(div, null);
				append(div, text4);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.mode.info) {
					if (!if_block) {
						if_block = create_if_block$8(component, ctx);
						if_block.c();
						if_block.m(div, text4);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				div._svelte.ctx = ctx;
				if (changed.warnings) {
					toggleClass(div, "warning", ctx.warnings[ctx.mode.id]);
				}

				if (changed.activeMode) {
					toggleClass(div, "active", ctx.mode.id === ctx.activeMode);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block) if_block.d();
				removeListener(div, "click", click_handler$3);
			}
		};
	}

	function ColorblindCheck(options) {
		this._debugName = '<ColorblindCheck>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$d(), options.data);
		if (!('testing' in this._state)) console.warn("<ColorblindCheck> was created without expected data property 'testing'");
		if (!('warnings' in this._state)) console.warn("<ColorblindCheck> was created without expected data property 'warnings'");
		if (!('activeMode' in this._state)) console.warn("<ColorblindCheck> was created without expected data property 'activeMode'");
		this._intro = true;

		this._fragment = create_main_fragment$j(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$4.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ColorblindCheck.prototype, protoDev);
	assign(ColorblindCheck.prototype, methods$6);

	ColorblindCheck.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* visualize/App.html generated by Svelte v2.16.1 */



	function showChartPicker({ namespace }) {
	    return namespace !== 'map';
	}
	function missingColumns({ $vis }) {
	    if (!$vis) return [];
	    return Object.keys($vis.meta.axes).reduce((missingCols, axis) => {
	        const isRequired = !$vis.meta.axes[axis].optional;
	        const isEmpty = !$vis.axes()[axis];
	        if (isEmpty && isRequired) {
	            missingCols.push({ axis, type: $vis.meta.axes[axis].accepts });
	        }
	        return missingCols;
	    }, []);
	}
	function columnNotifications({ missingColumns }) {
	    return missingColumns.map(({ type, axis }) => ({
	        type: 'error',
	        closeable: true,
	        message: __('visualize / notifications / missing-column')
	            .replace('[%s:type]', type.join(' / '))
	            .replace('[%s:axis]', axis)
	    }));
	}
	function data$e() {
	    return {
	        tab: 'refine',
	        Refine: Empty,
	        Annotate: Empty,
	        visualizations: [],
	        visArchive: [],
	        visLoading: false,
	        defaultVisType: '',
	        stickyTop: false,
	        stickyBottom: false,
	        namespace: 'chart',
	        notifications: [],
	        chartNotifications: []
	    };
	}
	var methods$7 = {
	    updateNotifications(chartNotifications = []) {
	        const { columnNotifications } = this.get();
	        this.set({ notifications: [...columnNotifications, ...chartNotifications] });
	    },
	    makePreviewSticky() {
	        const { top, bottom } = this.refs.wrapper.getBoundingClientRect();
	        const canvasHeight = this.refs.canvas.scrollHeight;
	        const sidebarHeight = this.refs.sidebar.scrollHeight;
	        const useSticky = canvasHeight < sidebarHeight;
	        this.set({
	            stickyTop: useSticky && top < 0 && bottom >= canvasHeight,
	            stickyBottom: useSticky && bottom < canvasHeight
	        });
	    },
	    loadVis(type) {
	        this.set({ visLoading: true });
	        this.store.set({ type });
	        this.loadControls(type);
	    },
	    loadControls(type) {
	        const chart = this.store;
	        const { visArchive, visualizations } = this.get();
	        const vis = [...visArchive, ...visualizations].find(v => v.id === type);
	        chart.set({ visualization: vis });

	        if (!vis.controls) {
	            console.error('This visualization does not define new svelte controls');
	            return;
	        }

	        Promise.all([
	            loadScript(`/static/plugins/${vis.controls.js}`),
	            loadScript(
	                `${window.location.protocol}//${window.dw.backend.__api_domain}/v3/visualizations/${vis.id}/script.js`
	            ),
	            loadStylesheet(`/static/plugins/${vis.controls.css}`)
	        ]).then(() => {
	            require([vis.controls.amd], mod => {
	                // initialize with empty Refine and Annotate panel
	                this.set({ Refine: Empty, Annotate: Empty });

	                // make sure all core metadata properties are set before loading controls
	                ['annotate', 'axes', 'data', 'describe', 'publish', 'visualize'].forEach(
	                    key => {
	                        if (chart.getMetadata(key) === undefined) {
	                            chart.setMetadata(key, {});
	                        }
	                    }
	                );

	                if (mod.migrate) {
	                    const { metadata } = chart.get();
	                    mod.migrate(type, metadata, chart.dataset());
	                    chart.set({ metadata });
	                }

	                // apply vis default metadata
	                const visualize = {
	                    ...(vis.controls.defaults || {}),
	                    ...chart.getMetadata('visualize', {})
	                };
	                chart.setMetadata('visualize', visualize);
	                chart.set({ visualization: vis });

	                // determine if we automaticall switch to refine tab
	                // const { tab, defaultVisType } = this.get();
	                // const chartTypeSet =
	                //     chart.getMetadata('visualize.chart-type-set', false) ||
	                //     id !== defaultVisType;

	                // this.set({
	                //     tab: tab === 'pick' && chartTypeSet ? 'refine' : tab
	                // });

	                const vis2 = dw.visualization(vis.id);
	                vis2.meta = vis;
	                vis2.lang = chart.get().language.substr(0, 2);

	                vis2.chart(chart);
	                chart.vis(vis2);

	                this.set({
	                    visLoading: false,
	                    Refine: mod.Refine || Empty,
	                    Annotate: mod.Annotate || Empty
	                });

	                // get initial notifications from refine control:
	                // (without, notifications will not be immediately displayed)
	                const { notifications } = this.refs.refine.get();
	                this.updateNotifications(notifications);
	            });
	        });
	    }
	};

	function oncreate$5() {
	    // update tab navigation based on URL hash:
	    if (['#pick', '#refine', '#annotate', '#design'].includes(window.location.hash)) {
	        this.set({ tab: window.location.hash.substr(1) });
	    }

	    // load visualization:
	    const { type } = this.store.get();
	    this.loadVis(type);

	    // add event handler for making the preview stick to the viewport:
	    const makePreviewSticky = () => this.makePreviewSticky();
	    window.addEventListener('scroll', makePreviewSticky);

	    // remove event handler when this component is destroyed:
	    this.on('destroy', () => {
	        window.removeEventListener('scroll', makePreviewSticky);
	    });

	    window.chart = this.store;
	}
	function onstate$3({ previous, current, changed }) {
	    if (previous && changed.chartNotifications) {
	        this.updateNotifications(current.chartNotifications);
	    }
	}
	const file$g = "visualize/App.html";

	function create_main_fragment$k(component, ctx) {
		var div10, div9, div3, div2, div1, text0, div0, text1, text2, div8, tabnav_updating = {}, text3, div7, text4, div4, text5, div5, text6, text7, div6, text8, buttonnav_updating = {};

		var chartpreview_initial_data = { src: "/preview/" + ctx.$id };
		var chartpreview = new ChartPreview({
			root: component.root,
			store: component.store,
			data: chartpreview_initial_data
		});

		chartpreview.on("resize", function(event) {
			component.makePreviewSticky();
		});

		var resizer = new Resizer({
			root: component.root,
			store: component.store
		});

		var colorblindcheck = new ColorblindCheck({
			root: component.root,
			store: component.store
		});

		var tabnav_initial_data = { showChartPicker: ctx.showChartPicker };
		if (ctx.tab  !== void 0) {
			tabnav_initial_data.tab = ctx.tab ;
			tabnav_updating.tab = true;
		}
		var tabnav = new TabNav({
			root: component.root,
			store: component.store,
			data: tabnav_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!tabnav_updating.tab && changed.tab) {
					newState.tab = childState.tab;
				}
				component._set(newState);
				tabnav_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			tabnav._bind({ tab: 1 }, tabnav.get());
		});

		var if_block0 = (ctx.showChartPicker) && create_if_block_2$2(component, ctx);

		function select_block_type(ctx) {
			if (ctx.visLoading) return create_if_block_1$6;
			return create_else_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type(component, ctx);

		var annotate = new Annotate({
			root: component.root,
			store: component.store
		});

		function select_block_type_1(ctx) {
			if (ctx.visLoading) return create_if_block$9;
			return create_else_block$1;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block2 = current_block_type_1(component, ctx);

		var design = new Design({
			root: component.root,
			store: component.store
		});

		var buttonnav_initial_data = { showChartPicker: ctx.showChartPicker };
		if (ctx.tab  !== void 0) {
			buttonnav_initial_data.tab = ctx.tab ;
			buttonnav_updating.tab = true;
		}
		var buttonnav = new ButtonNav({
			root: component.root,
			store: component.store,
			data: buttonnav_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!buttonnav_updating.tab && changed.tab) {
					newState.tab = childState.tab;
				}
				component._set(newState);
				buttonnav_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			buttonnav._bind({ tab: 1 }, buttonnav.get());
		});

		return {
			c: function create() {
				div10 = createElement("div");
				div9 = createElement("div");
				div3 = createElement("div");
				div2 = createElement("div");
				div1 = createElement("div");
				chartpreview._fragment.c();
				text0 = createText("\n\n                    ");
				div0 = createElement("div");
				resizer._fragment.c();
				text1 = createText("\n                        ");
				colorblindcheck._fragment.c();
				text2 = createText("\n\n        ");
				div8 = createElement("div");
				tabnav._fragment.c();
				text3 = createText("\n\n            ");
				div7 = createElement("div");
				if (if_block0) if_block0.c();
				text4 = createText("\n\n                \n                ");
				div4 = createElement("div");
				if_block1.c();
				text5 = createText("\n\n                \n                ");
				div5 = createElement("div");
				annotate._fragment.c();
				text6 = createText("\n                    ");
				if_block2.c();
				text7 = createText("\n\n                \n                ");
				div6 = createElement("div");
				design._fragment.c();
				text8 = createText("\n\n                ");
				buttonnav._fragment.c();
				div0.className = "toolbar";
				addLoc(div0, file$g, 12, 20, 440);
				div1.className = "vis-canvas svelte-q5bgnd";
				addLoc(div1, file$g, 9, 16, 302);
				div2.className = "container";
				addLoc(div2, file$g, 8, 12, 262);
				div3.className = "vis-main svelte-q5bgnd";
				toggleClass(div3, "stickyBottom", ctx.stickyBottom);
				toggleClass(div3, "stickyTop", ctx.stickyTop);
				addLoc(div3, file$g, 2, 8, 97);
				toggleClass(div4, "hide-smart", ctx.tab !== 'refine');
				addLoc(div4, file$g, 37, 16, 1233);
				toggleClass(div5, "hide-smart", ctx.tab !== 'annotate');
				addLoc(div5, file$g, 52, 16, 1756);
				toggleClass(div6, "hide-smart", ctx.tab !== 'design');
				addLoc(div6, file$g, 62, 16, 2093);
				div7.className = "form-horizontal vis-options";
				addLoc(div7, file$g, 23, 12, 746);
				div8.className = "visconfig vis-sidebar svelte-q5bgnd";
				addLoc(div8, file$g, 20, 8, 635);
				div9.className = "vis-wrapper svelte-q5bgnd";
				addLoc(div9, file$g, 1, 4, 51);
				div10.className = "dw-create-visualize chart-editor";
				addLoc(div10, file$g, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div10, anchor);
				append(div10, div9);
				append(div9, div3);
				append(div3, div2);
				append(div2, div1);
				chartpreview._mount(div1, null);
				append(div1, text0);
				append(div1, div0);
				resizer._mount(div0, null);
				append(div0, text1);
				colorblindcheck._mount(div0, null);
				component.refs.canvas = div3;
				append(div9, text2);
				append(div9, div8);
				tabnav._mount(div8, null);
				append(div8, text3);
				append(div8, div7);
				if (if_block0) if_block0.m(div7, null);
				append(div7, text4);
				append(div7, div4);
				if_block1.m(div4, null);
				append(div7, text5);
				append(div7, div5);
				annotate._mount(div5, null);
				append(div5, text6);
				if_block2.m(div5, null);
				append(div7, text7);
				append(div7, div6);
				design._mount(div6, null);
				append(div7, text8);
				buttonnav._mount(div7, null);
				component.refs.sidebar = div8;
				component.refs.wrapper = div9;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var chartpreview_changes = {};
				if (changed.$id) chartpreview_changes.src = "/preview/" + ctx.$id;
				chartpreview._set(chartpreview_changes);

				if (changed.stickyBottom) {
					toggleClass(div3, "stickyBottom", ctx.stickyBottom);
				}

				if (changed.stickyTop) {
					toggleClass(div3, "stickyTop", ctx.stickyTop);
				}

				var tabnav_changes = {};
				if (changed.showChartPicker) tabnav_changes.showChartPicker = ctx.showChartPicker;
				if (!tabnav_updating.tab && changed.tab) {
					tabnav_changes.tab = ctx.tab ;
					tabnav_updating.tab = ctx.tab  !== void 0;
				}
				tabnav._set(tabnav_changes);
				tabnav_updating = {};

				if (ctx.showChartPicker) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2$2(component, ctx);
						if_block0.c();
						if_block0.m(div7, text4);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(div4, null);
				}

				if (changed.tab) {
					toggleClass(div4, "hide-smart", ctx.tab !== 'refine');
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type_1(component, ctx);
					if_block2.c();
					if_block2.m(div5, null);
				}

				if (changed.tab) {
					toggleClass(div5, "hide-smart", ctx.tab !== 'annotate');
					toggleClass(div6, "hide-smart", ctx.tab !== 'design');
				}

				var buttonnav_changes = {};
				if (changed.showChartPicker) buttonnav_changes.showChartPicker = ctx.showChartPicker;
				if (!buttonnav_updating.tab && changed.tab) {
					buttonnav_changes.tab = ctx.tab ;
					buttonnav_updating.tab = ctx.tab  !== void 0;
				}
				buttonnav._set(buttonnav_changes);
				buttonnav_updating = {};
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div10);
				}

				chartpreview.destroy();
				resizer.destroy();
				colorblindcheck.destroy();
				if (component.refs.canvas === div3) component.refs.canvas = null;
				tabnav.destroy();
				if (if_block0) if_block0.d();
				if_block1.d();
				annotate.destroy();
				if_block2.d();
				design.destroy();
				buttonnav.destroy();
				if (component.refs.sidebar === div8) component.refs.sidebar = null;
				if (component.refs.wrapper === div9) component.refs.wrapper = null;
			}
		};
	}

	// (25:16) {#if showChartPicker}
	function create_if_block_2$2(component, ctx) {
		var div;

		var chartpicker_initial_data = {
		 	visualizations: ctx.visualizations,
		 	visArchive: ctx.visArchive,
		 	namespace: ctx.namespace
		 };
		var chartpicker = new ChartPicker({
			root: component.root,
			store: component.store,
			data: chartpicker_initial_data
		});

		chartpicker.on("change", function(event) {
			component.loadVis(event);
		});

		return {
			c: function create() {
				div = createElement("div");
				chartpicker._fragment.c();
				toggleClass(div, "hide-smart", ctx.tab !== 'pick');
				addLoc(div, file$g, 26, 16, 878);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				chartpicker._mount(div, null);
			},

			p: function update(changed, ctx) {
				var chartpicker_changes = {};
				if (changed.visualizations) chartpicker_changes.visualizations = ctx.visualizations;
				if (changed.visArchive) chartpicker_changes.visArchive = ctx.visArchive;
				if (changed.namespace) chartpicker_changes.namespace = ctx.namespace;
				chartpicker._set(chartpicker_changes);

				if (changed.tab) {
					toggleClass(div, "hide-smart", ctx.tab !== 'pick');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				chartpicker.destroy();
			}
		};
	}

	// (41:20) {:else}
	function create_else_block_1(component, ctx) {
		var text, switch_instance_updating = {}, switch_instance_anchor;

		var notifications_initial_data = { notifications: ctx.notifications };
		var notifications = new Notifications({
			root: component.root,
			store: component.store,
			data: notifications_initial_data
		});

		var switch_value = ctx.Refine;

		function switch_props(ctx) {
			var switch_instance_initial_data = { tab: ctx.tab };
			if (ctx.chartNotifications !== void 0) {
				switch_instance_initial_data.notifications = ctx.chartNotifications;
				switch_instance_updating.notifications = true;
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data,
				_bind(changed, childState) {
					var newState = {};
					if (!switch_instance_updating.notifications && changed.notifications) {
						newState.chartNotifications = childState.notifications;
					}
					component._set(newState);
					switch_instance_updating = {};
				}
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));

			component.root._beforecreate.push(() => {
				switch_instance._bind({ notifications: 1 }, switch_instance.get());
			});
		}

		return {
			c: function create() {
				notifications._fragment.c();
				text = createText("\n                    ");
				if (switch_instance) switch_instance._fragment.c();
				switch_instance_anchor = createComment();
			},

			m: function mount(target, anchor) {
				notifications._mount(target, anchor);
				insert(target, text, anchor);

				if (switch_instance) {
					switch_instance._mount(target, anchor);
					component.refs.refine = switch_instance;
				}

				insert(target, switch_instance_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var notifications_changes = {};
				if (changed.notifications) notifications_changes.notifications = ctx.notifications;
				notifications._set(notifications_changes);

				var switch_instance_changes = {};
				if (changed.tab) switch_instance_changes.tab = ctx.tab;
				if (!switch_instance_updating.notifications && changed.chartNotifications) {
					switch_instance_changes.notifications = ctx.chartNotifications;
					switch_instance_updating.notifications = ctx.chartNotifications !== void 0;
				}

				if (switch_value !== (switch_value = ctx.Refine)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));

						component.root._beforecreate.push(() => {
							const changed = {};
							if (ctx.chartNotifications === void 0) changed.notifications = 1;
							switch_instance._bind(changed, switch_instance.get());
						});
						switch_instance._fragment.c();
						switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);

						component.refs.refine = switch_instance;
					} else {
						switch_instance = null;
						if (component.refs.refine === switch_instance) {
							component.refs.refine = null;
						}
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
					switch_instance_updating = {};
				}
			},

			d: function destroy(detach) {
				notifications.destroy(detach);
				if (detach) {
					detachNode(text);
					detachNode(switch_instance_anchor);
				}

				if (switch_instance) switch_instance.destroy(detach);
			}
		};
	}

	// (39:20) {#if visLoading}
	function create_if_block_1$6(component, ctx) {

		var loading = new Loading({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				loading._fragment.c();
			},

			m: function mount(target, anchor) {
				loading._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				loading.destroy(detach);
			}
		};
	}

	// (57:20) {:else}
	function create_else_block$1(component, ctx) {
		var switch_instance_anchor;

		var switch_value = ctx.Annotate;

		function switch_props(ctx) {
			var switch_instance_initial_data = { tab: ctx.tab };
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));
		}

		return {
			c: function create() {
				if (switch_instance) switch_instance._fragment.c();
				switch_instance_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (switch_instance) {
					switch_instance._mount(target, anchor);
				}

				insert(target, switch_instance_anchor, anchor);
			},

			p: function update(changed, ctx) {
				var switch_instance_changes = {};
				if (changed.tab) switch_instance_changes.tab = ctx.tab;

				if (switch_value !== (switch_value = ctx.Annotate)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));
						switch_instance._fragment.c();
						switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(switch_instance_anchor);
				}

				if (switch_instance) switch_instance.destroy(detach);
			}
		};
	}

	// (55:20) {#if visLoading}
	function create_if_block$9(component, ctx) {

		var loading = new Loading({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				loading._fragment.c();
			},

			m: function mount(target, anchor) {
				loading._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				loading.destroy(detach);
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<App> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["vis","id"]), data$e()), options.data);
		this.store._add(this, ["vis","id"]);

		this._recompute({ namespace: 1, $vis: 1, missingColumns: 1 }, this._state);
		if (!('namespace' in this._state)) console.warn("<App> was created without expected data property 'namespace'");
		if (!('$vis' in this._state)) console.warn("<App> was created without expected data property '$vis'");

		if (!('stickyBottom' in this._state)) console.warn("<App> was created without expected data property 'stickyBottom'");
		if (!('stickyTop' in this._state)) console.warn("<App> was created without expected data property 'stickyTop'");
		if (!('$id' in this._state)) console.warn("<App> was created without expected data property '$id'");
		if (!('tab' in this._state)) console.warn("<App> was created without expected data property 'tab'");

		if (!('visualizations' in this._state)) console.warn("<App> was created without expected data property 'visualizations'");
		if (!('visArchive' in this._state)) console.warn("<App> was created without expected data property 'visArchive'");
		if (!('visLoading' in this._state)) console.warn("<App> was created without expected data property 'visLoading'");
		if (!('notifications' in this._state)) console.warn("<App> was created without expected data property 'notifications'");
		if (!('Refine' in this._state)) console.warn("<App> was created without expected data property 'Refine'");
		if (!('chartNotifications' in this._state)) console.warn("<App> was created without expected data property 'chartNotifications'");
		if (!('Annotate' in this._state)) console.warn("<App> expected to find 'Annotate' in `data`, but found it in `components` instead");
		this._intro = true;

		this._handlers.state = [onstate$3];

		this._handlers.destroy = [removeFromStore];

		onstate$3.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$k(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$5.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$7);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('showChartPicker' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'showChartPicker'");
		if ('missingColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'missingColumns'");
		if ('columnNotifications' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columnNotifications'");
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.namespace) {
			if (this._differs(state.showChartPicker, (state.showChartPicker = showChartPicker(state)))) changed.showChartPicker = true;
		}

		if (changed.$vis) {
			if (this._differs(state.missingColumns, (state.missingColumns = missingColumns(state)))) changed.missingColumns = true;
		}

		if (changed.missingColumns) {
			if (this._differs(state.columnNotifications, (state.columnNotifications = columnNotifications(state)))) changed.columnNotifications = true;
		}
	};

	function assign$1(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function blankObject$1() {
		return Object.create(null);
	}

	function _differs$1(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function _differsImmutable(a, b) {
		return a != a ? b == b : a !== b;
	}

	function fire$1(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function get$2() {
		return this._state;
	}

	function on$1(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function Store(state, options) {
		this._handlers = {};
		this._dependents = [];

		this._computed = blankObject$1();
		this._sortedComputedProperties = [];

		this._state = assign$1({}, state);
		this._differs = options && options.immutable ? _differsImmutable : _differs$1;
	}

	assign$1(Store.prototype, {
		_add(component, props) {
			this._dependents.push({
				component: component,
				props: props
			});
		},

		_init(props) {
			const state = {};
			for (let i = 0; i < props.length; i += 1) {
				const prop = props[i];
				state['$' + prop] = this._state[prop];
			}
			return state;
		},

		_remove(component) {
			let i = this._dependents.length;
			while (i--) {
				if (this._dependents[i].component === component) {
					this._dependents.splice(i, 1);
					return;
				}
			}
		},

		_set(newState, changed) {
			const previous = this._state;
			this._state = assign$1(assign$1({}, previous), newState);

			for (let i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this._sortedComputedProperties[i].update(this._state, changed);
			}

			this.fire('state', {
				changed,
				previous,
				current: this._state
			});

			this._dependents
				.filter(dependent => {
					const componentState = {};
					let dirty = false;

					for (let j = 0; j < dependent.props.length; j += 1) {
						const prop = dependent.props[j];
						if (prop in changed) {
							componentState['$' + prop] = this._state[prop];
							dirty = true;
						}
					}

					if (dirty) {
						dependent.component._stage(componentState);
						return true;
					}
				})
				.forEach(dependent => {
					dependent.component.set({});
				});

			this.fire('update', {
				changed,
				previous,
				current: this._state
			});
		},

		_sortComputedProperties() {
			const computed = this._computed;
			const sorted = this._sortedComputedProperties = [];
			const visited = blankObject$1();
			let currentKey;

			function visit(key) {
				const c = computed[key];

				if (c) {
					c.deps.forEach(dep => {
						if (dep === currentKey) {
							throw new Error(`Cyclical dependency detected between ${dep} <-> ${key}`);
						}

						visit(dep);
					});

					if (!visited[key]) {
						visited[key] = true;
						sorted.push(c);
					}
				}
			}

			for (const key in this._computed) {
				visit(currentKey = key);
			}
		},

		compute(key, deps, fn) {
			let value;

			const c = {
				deps,
				update: (state, changed, dirty) => {
					const values = deps.map(dep => {
						if (dep in changed) dirty = true;
						return state[dep];
					});

					if (dirty) {
						const newValue = fn.apply(null, values);
						if (this._differs(newValue, value)) {
							value = newValue;
							changed[key] = true;
							state[key] = value;
						}
					}
				}
			};

			this._computed[key] = c;
			this._sortComputedProperties();

			const state = assign$1({}, this._state);
			const changed = {};
			c.update(state, changed, true);
			this._set(state, changed);
		},

		fire: fire$1,

		get: get$2,

		on: on$1,

		set(newState) {
			const oldState = this._state;
			const changed = this._changed = {};
			let dirty = false;

			for (const key in newState) {
				if (this._computed[key]) throw new Error(`'${key}' is a read-only computed property`);
				if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
			}
			if (!dirty) return;

			this._set(newState, changed);
		}
	});

	function getNestedValue(obj, parts) {
	    for (var i = 0; i < parts.length; i += 1) {
	        if (!obj)
	            return undefined;
	        obj = obj[parts[i]];
	    }
	    return obj;
	}
	function observeDeep(keypath, callback, opts) {
	    var parts = keypath.replace(/\[(\d+)\]/g, '.$1').split('.');
	    var key = parts[0];
	    var fn = callback.bind(this);
	    var last = getNestedValue(this.get(), parts);
	    if (!opts || opts.init !== false)
	        fn(last);
	    return this.on(opts && opts.defer ? 'update' : 'state', function (_a) {
	        var changed = _a.changed, current = _a.current, previous = _a.previous;
	        if (changed[key]) {
	            var value = getNestedValue(current, parts);
	            if (value !== last ||
	                typeof value === 'object' ||
	                typeof value === 'function') {
	                fn(value, last);
	                last = value;
	            }
	        }
	    });
	}

	// Current version.
	var VERSION$1 = '1.11.0';

	// Establish the root object, `window` (`self`) in the browser, `global`
	// on the server, or `this` in some virtual machines. We use `self`
	// instead of `window` for `WebWorker` support.
	var root$1 = typeof self == 'object' && self.self === self && self ||
	          typeof global == 'object' && global.global === global && global ||
	          Function('return this')() ||
	          {};

	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype, ObjProto$1 = Object.prototype;
	var SymbolProto$1 = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

	// Create quick reference variables for speed access to core prototypes.
	var push = ArrayProto.push,
	    slice = ArrayProto.slice,
	    toString$1 = ObjProto$1.toString,
	    hasOwnProperty$1 = ObjProto$1.hasOwnProperty;

	// Modern feature detection.
	var supportsArrayBuffer$1 = typeof ArrayBuffer !== 'undefined';

	// All **ECMAScript 5+** native function implementations that we hope to use
	// are declared here.
	var nativeIsArray = Array.isArray,
	    nativeKeys$1 = Object.keys,
	    nativeCreate = Object.create,
	    nativeIsView$1 = supportsArrayBuffer$1 && ArrayBuffer.isView;

	// Create references to these builtin functions because we override them.
	var _isNaN = isNaN,
	    _isFinite = isFinite;

	// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	var hasEnumBug$1 = !{toString: null}.propertyIsEnumerable('toString');
	var nonEnumerableProps$1 = ['valueOf', 'isPrototypeOf', 'toString',
	  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	// The largest integer that can be represented exactly.
	var MAX_ARRAY_INDEX$1 = Math.pow(2, 53) - 1;

	// Some functions take a variable number of arguments, or a few expected
	// arguments at the beginning and then a variable number of values to operate
	// on. This helper accumulates all remaining arguments past the function’s
	// argument length (or an explicit `startIndex`), into an array that becomes
	// the last argument. Similar to ES6’s "rest parameter".
	function restArguments(func, startIndex) {
	  startIndex = startIndex == null ? func.length - 1 : +startIndex;
	  return function() {
	    var length = Math.max(arguments.length - startIndex, 0),
	        rest = Array(length),
	        index = 0;
	    for (; index < length; index++) {
	      rest[index] = arguments[index + startIndex];
	    }
	    switch (startIndex) {
	      case 0: return func.call(this, rest);
	      case 1: return func.call(this, arguments[0], rest);
	      case 2: return func.call(this, arguments[0], arguments[1], rest);
	    }
	    var args = Array(startIndex + 1);
	    for (index = 0; index < startIndex; index++) {
	      args[index] = arguments[index];
	    }
	    args[startIndex] = rest;
	    return func.apply(this, args);
	  };
	}

	// Is a given variable an object?
	function isObject$1(obj) {
	  var type = typeof obj;
	  return type === 'function' || type === 'object' && !!obj;
	}

	// Is a given value equal to null?
	function isNull(obj) {
	  return obj === null;
	}

	// Is a given variable undefined?
	function isUndefined(obj) {
	  return obj === void 0;
	}

	// Is a given value a boolean?
	function isBoolean(obj) {
	  return obj === true || obj === false || toString$1.call(obj) === '[object Boolean]';
	}

	// Is a given value a DOM element?
	function isElement(obj) {
	  return !!(obj && obj.nodeType === 1);
	}

	// Internal function for creating a `toString`-based type tester.
	function tagTester$1(name) {
	  return function(obj) {
	    return toString$1.call(obj) === '[object ' + name + ']';
	  };
	}

	var isString = tagTester$1('String');

	var isNumber = tagTester$1('Number');

	var isDate = tagTester$1('Date');

	var isRegExp = tagTester$1('RegExp');

	var isError = tagTester$1('Error');

	var isSymbol = tagTester$1('Symbol');

	var isMap = tagTester$1('Map');

	var isWeakMap = tagTester$1('WeakMap');

	var isSet = tagTester$1('Set');

	var isWeakSet = tagTester$1('WeakSet');

	var isArrayBuffer = tagTester$1('ArrayBuffer');

	var isDataView$1 = tagTester$1('DataView');

	// Is a given value an array?
	// Delegates to ECMA5's native `Array.isArray`.
	var isArray = nativeIsArray || tagTester$1('Array');

	var isFunction$2 = tagTester$1('Function');

	// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
	// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
	var nodelist$1 = root$1.document && root$1.document.childNodes;
	if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist$1 != 'function') {
	  isFunction$2 = function(obj) {
	    return typeof obj == 'function' || false;
	  };
	}

	var isFunction$3 = isFunction$2;

	// Internal function to check whether `key` is an own property name of `obj`.
	function has$1(obj, key) {
	  return obj != null && hasOwnProperty$1.call(obj, key);
	}

	var isArguments = tagTester$1('Arguments');

	// Define a fallback version of the method in browsers (ahem, IE < 9), where
	// there isn't any inspectable "Arguments" type.
	(function() {
	  if (!isArguments(arguments)) {
	    isArguments = function(obj) {
	      return has$1(obj, 'callee');
	    };
	  }
	}());

	var isArguments$1 = isArguments;

	// Is a given object a finite number?
	function isFinite$1(obj) {
	  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
	}

	// Is the given value `NaN`?
	function isNaN$1(obj) {
	  return isNumber(obj) && _isNaN(obj);
	}

	// Predicate-generating function. Often useful outside of Underscore.
	function constant$1(value) {
	  return function() {
	    return value;
	  };
	}

	// Common internal logic for `isArrayLike` and `isBufferLike`.
	function createSizePropertyCheck$1(getSizeProperty) {
	  return function(collection) {
	    var sizeProperty = getSizeProperty(collection);
	    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX$1;
	  }
	}

	// Internal helper to generate a function to obtain property `key` from `obj`.
	function shallowProperty$1(key) {
	  return function(obj) {
	    return obj == null ? void 0 : obj[key];
	  };
	}

	// Internal helper to obtain the `byteLength` property of an object.
	var getByteLength$1 = shallowProperty$1('byteLength');

	// Internal helper to determine whether we should spend extensive checks against
	// `ArrayBuffer` et al.
	var isBufferLike$1 = createSizePropertyCheck$1(getByteLength$1);

	// Is a given value a typed array?
	var typedArrayPattern$1 = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
	function isTypedArray$2(obj) {
	  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
	  // Otherwise, fall back on the above regular expression.
	  return nativeIsView$1 ? (nativeIsView$1(obj) && !isDataView$1(obj)) :
	                isBufferLike$1(obj) && typedArrayPattern$1.test(toString$1.call(obj));
	}

	var isTypedArray$3 = supportsArrayBuffer$1 ? isTypedArray$2 : constant$1(false);

	// Internal helper to obtain the `length` property of an object.
	var getLength = shallowProperty$1('length');

	// Internal helper for collection methods to determine whether a collection
	// should be iterated as an array or as an object.
	// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	var isArrayLike = createSizePropertyCheck$1(getLength);

	// Internal helper to create a simple lookup structure.
	// `collectNonEnumProps` used to depend on `_.contains`, but this led to
	// circular imports. `emulatedSet` is a one-off solution that only works for
	// arrays of strings.
	function emulatedSet$1(keys) {
	  var hash = {};
	  for (var l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
	  return {
	    contains: function(key) { return hash[key]; },
	    push: function(key) {
	      hash[key] = true;
	      return keys.push(key);
	    }
	  };
	}

	// Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
	// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
	// needed.
	function collectNonEnumProps$1(obj, keys) {
	  keys = emulatedSet$1(keys);
	  var nonEnumIdx = nonEnumerableProps$1.length;
	  var constructor = obj.constructor;
	  var proto = isFunction$3(constructor) && constructor.prototype || ObjProto$1;

	  // Constructor is a special case.
	  var prop = 'constructor';
	  if (has$1(obj, prop) && !keys.contains(prop)) keys.push(prop);

	  while (nonEnumIdx--) {
	    prop = nonEnumerableProps$1[nonEnumIdx];
	    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
	      keys.push(prop);
	    }
	  }
	}

	// Retrieve the names of an object's own properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`.
	function keys$1(obj) {
	  if (!isObject$1(obj)) return [];
	  if (nativeKeys$1) return nativeKeys$1(obj);
	  var keys = [];
	  for (var key in obj) if (has$1(obj, key)) keys.push(key);
	  // Ahem, IE < 9.
	  if (hasEnumBug$1) collectNonEnumProps$1(obj, keys);
	  return keys;
	}

	// Is a given array, string, or object empty?
	// An "empty" object has no enumerable own-properties.
	function isEmpty(obj) {
	  if (obj == null) return true;
	  // Skip the more expensive `toString`-based type checks if `obj` has no
	  // `.length`.
	  if (isArrayLike(obj) && (isArray(obj) || isString(obj) || isArguments$1(obj))) return obj.length === 0;
	  return keys$1(obj).length === 0;
	}

	// Returns whether an object has a given set of `key:value` pairs.
	function isMatch(object, attrs) {
	  var _keys = keys$1(attrs), length = _keys.length;
	  if (object == null) return !length;
	  var obj = Object(object);
	  for (var i = 0; i < length; i++) {
	    var key = _keys[i];
	    if (attrs[key] !== obj[key] || !(key in obj)) return false;
	  }
	  return true;
	}

	// If Underscore is called as a function, it returns a wrapped object that can
	// be used OO-style. This wrapper holds altered versions of all functions added
	// through `_.mixin`. Wrapped objects may be chained.
	function _$2(obj) {
	  if (obj instanceof _$2) return obj;
	  if (!(this instanceof _$2)) return new _$2(obj);
	  this._wrapped = obj;
	}

	_$2.VERSION = VERSION$1;

	// Extracts the result from a wrapped and chained object.
	_$2.prototype.value = function() {
	  return this._wrapped;
	};

	// Provide unwrapping proxies for some methods used in engine operations
	// such as arithmetic and JSON stringification.
	_$2.prototype.valueOf = _$2.prototype.toJSON = _$2.prototype.value;

	_$2.prototype.toString = function() {
	  return String(this._wrapped);
	};

	// Internal recursive comparison function for `_.isEqual`.
	function eq$1(a, b, aStack, bStack) {
	  // Identical objects are equal. `0 === -0`, but they aren't identical.
	  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
	  if (a === b) return a !== 0 || 1 / a === 1 / b;
	  // `null` or `undefined` only equal to itself (strict comparison).
	  if (a == null || b == null) return false;
	  // `NaN`s are equivalent, but non-reflexive.
	  if (a !== a) return b !== b;
	  // Exhaust primitive checks
	  var type = typeof a;
	  if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
	  return deepEq$1(a, b, aStack, bStack);
	}

	// Internal recursive comparison function for `_.isEqual`.
	function deepEq$1(a, b, aStack, bStack) {
	  // Unwrap any wrapped objects.
	  if (a instanceof _$2) a = a._wrapped;
	  if (b instanceof _$2) b = b._wrapped;
	  // Compare `[[Class]]` names.
	  var className = toString$1.call(a);
	  if (className !== toString$1.call(b)) return false;
	  switch (className) {
	    // These types are compared by value.
	    case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	    case '[object String]':
	      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	      // equivalent to `new String("5")`.
	      return '' + a === '' + b;
	    case '[object Number]':
	      // `NaN`s are equivalent, but non-reflexive.
	      // Object(NaN) is equivalent to NaN.
	      if (+a !== +a) return +b !== +b;
	      // An `egal` comparison is performed for other numeric values.
	      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	    case '[object Date]':
	    case '[object Boolean]':
	      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	      // millisecond representations. Note that invalid dates with millisecond representations
	      // of `NaN` are not equivalent.
	      return +a === +b;
	    case '[object Symbol]':
	      return SymbolProto$1.valueOf.call(a) === SymbolProto$1.valueOf.call(b);
	    case '[object ArrayBuffer]':
	      // Coerce to `DataView` so we can fall through to the next case.
	      return deepEq$1(new DataView(a), new DataView(b), aStack, bStack);
	    case '[object DataView]':
	      var byteLength = getByteLength$1(a);
	      if (byteLength !== getByteLength$1(b)) {
	        return false;
	      }
	      while (byteLength--) {
	        if (a.getUint8(byteLength) !== b.getUint8(byteLength)) {
	          return false;
	        }
	      }
	      return true;
	  }

	  if (isTypedArray$3(a)) {
	    // Coerce typed arrays to `DataView`.
	    return deepEq$1(new DataView(a.buffer), new DataView(b.buffer), aStack, bStack);
	  }

	  var areArrays = className === '[object Array]';
	  if (!areArrays) {
	    if (typeof a != 'object' || typeof b != 'object') return false;

	    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	    // from different frames are.
	    var aCtor = a.constructor, bCtor = b.constructor;
	    if (aCtor !== bCtor && !(isFunction$3(aCtor) && aCtor instanceof aCtor &&
	                             isFunction$3(bCtor) && bCtor instanceof bCtor)
	                        && ('constructor' in a && 'constructor' in b)) {
	      return false;
	    }
	  }
	  // Assume equality for cyclic structures. The algorithm for detecting cyclic
	  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	  // Initializing stack of traversed objects.
	  // It's done here since we only need them for objects and arrays comparison.
	  aStack = aStack || [];
	  bStack = bStack || [];
	  var length = aStack.length;
	  while (length--) {
	    // Linear search. Performance is inversely proportional to the number of
	    // unique nested structures.
	    if (aStack[length] === a) return bStack[length] === b;
	  }

	  // Add the first object to the stack of traversed objects.
	  aStack.push(a);
	  bStack.push(b);

	  // Recursively compare objects and arrays.
	  if (areArrays) {
	    // Compare array lengths to determine if a deep comparison is necessary.
	    length = a.length;
	    if (length !== b.length) return false;
	    // Deep compare the contents, ignoring non-numeric properties.
	    while (length--) {
	      if (!eq$1(a[length], b[length], aStack, bStack)) return false;
	    }
	  } else {
	    // Deep compare objects.
	    var _keys = keys$1(a), key;
	    length = _keys.length;
	    // Ensure that both objects contain the same number of properties before comparing deep equality.
	    if (keys$1(b).length !== length) return false;
	    while (length--) {
	      // Deep compare each member
	      key = _keys[length];
	      if (!(has$1(b, key) && eq$1(a[key], b[key], aStack, bStack))) return false;
	    }
	  }
	  // Remove the first object from the stack of traversed objects.
	  aStack.pop();
	  bStack.pop();
	  return true;
	}

	// Perform a deep comparison to check if two objects are equal.
	function isEqual$1(a, b) {
	  return eq$1(a, b);
	}

	// Retrieve all the enumerable property names of an object.
	function allKeys(obj) {
	  if (!isObject$1(obj)) return [];
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  // Ahem, IE < 9.
	  if (hasEnumBug$1) collectNonEnumProps$1(obj, keys);
	  return keys;
	}

	// Retrieve the values of an object's properties.
	function values(obj) {
	  var _keys = keys$1(obj);
	  var length = _keys.length;
	  var values = Array(length);
	  for (var i = 0; i < length; i++) {
	    values[i] = obj[_keys[i]];
	  }
	  return values;
	}

	// Convert an object into a list of `[key, value]` pairs.
	// The opposite of `_.object` with one argument.
	function pairs(obj) {
	  var _keys = keys$1(obj);
	  var length = _keys.length;
	  var pairs = Array(length);
	  for (var i = 0; i < length; i++) {
	    pairs[i] = [_keys[i], obj[_keys[i]]];
	  }
	  return pairs;
	}

	// Invert the keys and values of an object. The values must be serializable.
	function invert(obj) {
	  var result = {};
	  var _keys = keys$1(obj);
	  for (var i = 0, length = _keys.length; i < length; i++) {
	    result[obj[_keys[i]]] = _keys[i];
	  }
	  return result;
	}

	// Return a sorted list of the function names available on the object.
	function functions(obj) {
	  var names = [];
	  for (var key in obj) {
	    if (isFunction$3(obj[key])) names.push(key);
	  }
	  return names.sort();
	}

	// An internal function for creating assigner functions.
	function createAssigner(keysFunc, defaults) {
	  return function(obj) {
	    var length = arguments.length;
	    if (defaults) obj = Object(obj);
	    if (length < 2 || obj == null) return obj;
	    for (var index = 1; index < length; index++) {
	      var source = arguments[index],
	          keys = keysFunc(source),
	          l = keys.length;
	      for (var i = 0; i < l; i++) {
	        var key = keys[i];
	        if (!defaults || obj[key] === void 0) obj[key] = source[key];
	      }
	    }
	    return obj;
	  };
	}

	// Extend a given object with all the properties in passed-in object(s).
	var extend = createAssigner(allKeys);

	// Assigns a given object with all the own properties in the passed-in
	// object(s).
	// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	var extendOwn = createAssigner(keys$1);

	// Fill in a given object with default properties.
	var defaults = createAssigner(allKeys, true);

	// Create a naked function reference for surrogate-prototype-swapping.
	function ctor() {
	  return function(){};
	}

	// An internal function for creating a new object that inherits from another.
	function baseCreate(prototype) {
	  if (!isObject$1(prototype)) return {};
	  if (nativeCreate) return nativeCreate(prototype);
	  var Ctor = ctor();
	  Ctor.prototype = prototype;
	  var result = new Ctor;
	  Ctor.prototype = null;
	  return result;
	}

	// Creates an object that inherits from the given prototype object.
	// If additional properties are provided then they will be added to the
	// created object.
	function create(prototype, props) {
	  var result = baseCreate(prototype);
	  if (props) extendOwn(result, props);
	  return result;
	}

	// Create a (shallow-cloned) duplicate of an object.
	function clone$1(obj) {
	  if (!isObject$1(obj)) return obj;
	  return isArray(obj) ? obj.slice() : extend({}, obj);
	}

	// Invokes `interceptor` with the `obj` and then returns `obj`.
	// The primary purpose of this method is to "tap into" a method chain, in
	// order to perform operations on intermediate results within the chain.
	function tap(obj, interceptor) {
	  interceptor(obj);
	  return obj;
	}

	// Shortcut function for checking if an object has a given property directly on
	// itself (in other words, not on a prototype). Unlike the internal `has`
	// function, this public version can also traverse nested properties.
	function has$2(obj, path) {
	  if (!isArray(path)) {
	    return has$1(obj, path);
	  }
	  var length = path.length;
	  for (var i = 0; i < length; i++) {
	    var key = path[i];
	    if (obj == null || !hasOwnProperty$1.call(obj, key)) {
	      return false;
	    }
	    obj = obj[key];
	  }
	  return !!length;
	}

	// Keep the identity function around for default iteratees.
	function identity(value) {
	  return value;
	}

	// Returns a predicate for checking whether an object has a given set of
	// `key:value` pairs.
	function matcher(attrs) {
	  attrs = extendOwn({}, attrs);
	  return function(obj) {
	    return isMatch(obj, attrs);
	  };
	}

	// Internal function to obtain a nested property in `obj` along `path`.
	function deepGet(obj, path) {
	  var length = path.length;
	  for (var i = 0; i < length; i++) {
	    if (obj == null) return void 0;
	    obj = obj[path[i]];
	  }
	  return length ? obj : void 0;
	}

	// Creates a function that, when passed an object, will traverse that object’s
	// properties down the given `path`, specified as an array of keys or indices.
	function property(path) {
	  if (!isArray(path)) {
	    return shallowProperty$1(path);
	  }
	  return function(obj) {
	    return deepGet(obj, path);
	  };
	}

	// Internal function that returns an efficient (for current engines) version
	// of the passed-in callback, to be repeatedly applied in other Underscore
	// functions.
	function optimizeCb(func, context, argCount) {
	  if (context === void 0) return func;
	  switch (argCount == null ? 3 : argCount) {
	    case 1: return function(value) {
	      return func.call(context, value);
	    };
	    // The 2-argument case is omitted because we’re not using it.
	    case 3: return function(value, index, collection) {
	      return func.call(context, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(context, accumulator, value, index, collection);
	    };
	  }
	  return function() {
	    return func.apply(context, arguments);
	  };
	}

	// An internal function to generate callbacks that can be applied to each
	// element in a collection, returning the desired result — either `_.identity`,
	// an arbitrary callback, a property matcher, or a property accessor.
	function baseIteratee(value, context, argCount) {
	  if (value == null) return identity;
	  if (isFunction$3(value)) return optimizeCb(value, context, argCount);
	  if (isObject$1(value) && !isArray(value)) return matcher(value);
	  return property(value);
	}

	// External wrapper for our callback generator. Users may customize
	// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
	// This abstraction hides the internal-only `argCount` argument.
	function iteratee(value, context) {
	  return baseIteratee(value, context, Infinity);
	}
	_$2.iteratee = iteratee;

	// The function we call internally to generate a callback. It invokes
	// `_.iteratee` if overridden, otherwise `baseIteratee`.
	function cb(value, context, argCount) {
	  if (_$2.iteratee !== iteratee) return _$2.iteratee(value, context);
	  return baseIteratee(value, context, argCount);
	}

	// Returns the results of applying the `iteratee` to each element of `obj`.
	// In contrast to `_.map` it returns an object.
	function mapObject(obj, iteratee, context) {
	  iteratee = cb(iteratee, context);
	  var _keys = keys$1(obj),
	      length = _keys.length,
	      results = {};
	  for (var index = 0; index < length; index++) {
	    var currentKey = _keys[index];
	    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	  }
	  return results;
	}

	// Predicate-generating function. Often useful outside of Underscore.
	function noop$1(){}

	// Generates a function for a given object that returns a given property.
	function propertyOf(obj) {
	  if (obj == null) {
	    return function(){};
	  }
	  return function(path) {
	    return !isArray(path) ? obj[path] : deepGet(obj, path);
	  };
	}

	// Run a function **n** times.
	function times(n, iteratee, context) {
	  var accum = Array(Math.max(0, n));
	  iteratee = optimizeCb(iteratee, context, 1);
	  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	  return accum;
	}

	// Return a random integer between `min` and `max` (inclusive).
	function random(min, max) {
	  if (max == null) {
	    max = min;
	    min = 0;
	  }
	  return min + Math.floor(Math.random() * (max - min + 1));
	}

	// A (possibly faster) way to get the current timestamp as an integer.
	var now = Date.now || function() {
	  return new Date().getTime();
	};

	// Internal helper to generate functions for escaping and unescaping strings
	// to/from HTML interpolation.
	function createEscaper(map) {
	  var escaper = function(match) {
	    return map[match];
	  };
	  // Regexes for identifying a key that needs to be escaped.
	  var source = '(?:' + keys$1(map).join('|') + ')';
	  var testRegexp = RegExp(source);
	  var replaceRegexp = RegExp(source, 'g');
	  return function(string) {
	    string = string == null ? '' : '' + string;
	    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	  };
	}

	// Internal list of HTML entities for escaping.
	var escapeMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#x27;',
	  '`': '&#x60;'
	};

	// Function for escaping strings to HTML interpolation.
	var _escape = createEscaper(escapeMap);

	// Internal list of HTML entities for unescaping.
	var unescapeMap = invert(escapeMap);

	// Function for unescaping strings from HTML interpolation.
	var _unescape = createEscaper(unescapeMap);

	// By default, Underscore uses ERB-style template delimiters. Change the
	// following template settings to use alternative delimiters.
	var templateSettings = _$2.templateSettings = {
	  evaluate: /<%([\s\S]+?)%>/g,
	  interpolate: /<%=([\s\S]+?)%>/g,
	  escape: /<%-([\s\S]+?)%>/g
	};

	// When customizing `_.templateSettings`, if you don't want to define an
	// interpolation, evaluation or escaping regex, we need one that is
	// guaranteed not to match.
	var noMatch = /(.)^/;

	// Certain characters need to be escaped so that they can be put into a
	// string literal.
	var escapes = {
	  "'": "'",
	  '\\': '\\',
	  '\r': 'r',
	  '\n': 'n',
	  '\u2028': 'u2028',
	  '\u2029': 'u2029'
	};

	var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

	function escapeChar(match) {
	  return '\\' + escapes[match];
	}

	// JavaScript micro-templating, similar to John Resig's implementation.
	// Underscore templating handles arbitrary delimiters, preserves whitespace,
	// and correctly escapes quotes within interpolated code.
	// NB: `oldSettings` only exists for backwards compatibility.
	function template(text, settings, oldSettings) {
	  if (!settings && oldSettings) settings = oldSettings;
	  settings = defaults({}, settings, _$2.templateSettings);

	  // Combine delimiters into one regular expression via alternation.
	  var matcher = RegExp([
	    (settings.escape || noMatch).source,
	    (settings.interpolate || noMatch).source,
	    (settings.evaluate || noMatch).source
	  ].join('|') + '|$', 'g');

	  // Compile the template source, escaping string literals appropriately.
	  var index = 0;
	  var source = "__p+='";
	  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
	    index = offset + match.length;

	    if (escape) {
	      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	    } else if (interpolate) {
	      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	    } else if (evaluate) {
	      source += "';\n" + evaluate + "\n__p+='";
	    }

	    // Adobe VMs need the match returned to produce the correct offset.
	    return match;
	  });
	  source += "';\n";

	  // If a variable is not specified, place data values in local scope.
	  if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	  source = "var __t,__p='',__j=Array.prototype.join," +
	    "print=function(){__p+=__j.call(arguments,'');};\n" +
	    source + 'return __p;\n';

	  var render;
	  try {
	    render = new Function(settings.variable || 'obj', '_', source);
	  } catch (e) {
	    e.source = source;
	    throw e;
	  }

	  var template = function(data) {
	    return render.call(this, data, _$2);
	  };

	  // Provide the compiled source as a convenience for precompilation.
	  var argument = settings.variable || 'obj';
	  template.source = 'function(' + argument + '){\n' + source + '}';

	  return template;
	}

	// Traverses the children of `obj` along `path`. If a child is a function, it
	// is invoked with its parent as context. Returns the value of the final
	// child, or `fallback` if any child is undefined.
	function result(obj, path, fallback) {
	  if (!isArray(path)) path = [path];
	  var length = path.length;
	  if (!length) {
	    return isFunction$3(fallback) ? fallback.call(obj) : fallback;
	  }
	  for (var i = 0; i < length; i++) {
	    var prop = obj == null ? void 0 : obj[path[i]];
	    if (prop === void 0) {
	      prop = fallback;
	      i = length; // Ensure we don't continue iterating.
	    }
	    obj = isFunction$3(prop) ? prop.call(obj) : prop;
	  }
	  return obj;
	}

	// Generate a unique integer id (unique within the entire client session).
	// Useful for temporary DOM ids.
	var idCounter = 0;
	function uniqueId(prefix) {
	  var id = ++idCounter + '';
	  return prefix ? prefix + id : id;
	}

	// Start chaining a wrapped Underscore object.
	function chain(obj) {
	  var instance = _$2(obj);
	  instance._chain = true;
	  return instance;
	}

	// Internal function to execute `sourceFunc` bound to `context` with optional
	// `args`. Determines whether to execute a function as a constructor or as a
	// normal function.
	function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
	  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	  var self = baseCreate(sourceFunc.prototype);
	  var result = sourceFunc.apply(self, args);
	  if (isObject$1(result)) return result;
	  return self;
	}

	// Partially apply a function by creating a version that has had some of its
	// arguments pre-filled, without changing its dynamic `this` context. `_` acts
	// as a placeholder by default, allowing any combination of arguments to be
	// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
	var partial = restArguments(function(func, boundArgs) {
	  var placeholder = partial.placeholder;
	  var bound = function() {
	    var position = 0, length = boundArgs.length;
	    var args = Array(length);
	    for (var i = 0; i < length; i++) {
	      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
	    }
	    while (position < arguments.length) args.push(arguments[position++]);
	    return executeBound(func, bound, this, this, args);
	  };
	  return bound;
	});

	partial.placeholder = _$2;

	// Create a function bound to a given object (assigning `this`, and arguments,
	// optionally).
	var bind = restArguments(function(func, context, args) {
	  if (!isFunction$3(func)) throw new TypeError('Bind must be called on a function');
	  var bound = restArguments(function(callArgs) {
	    return executeBound(func, bound, context, this, args.concat(callArgs));
	  });
	  return bound;
	});

	// Internal implementation of a recursive `flatten` function.
	function flatten(input, depth, strict, output) {
	  output = output || [];
	  if (!depth && depth !== 0) {
	    depth = Infinity;
	  } else if (depth <= 0) {
	    return output.concat(input);
	  }
	  var idx = output.length;
	  for (var i = 0, length = getLength(input); i < length; i++) {
	    var value = input[i];
	    if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) {
	      // Flatten current level of array or arguments object.
	      if (depth > 1) {
	        flatten(value, depth - 1, strict, output);
	        idx = output.length;
	      } else {
	        var j = 0, len = value.length;
	        while (j < len) output[idx++] = value[j++];
	      }
	    } else if (!strict) {
	      output[idx++] = value;
	    }
	  }
	  return output;
	}

	// Bind a number of an object's methods to that object. Remaining arguments
	// are the method names to be bound. Useful for ensuring that all callbacks
	// defined on an object belong to it.
	var bindAll = restArguments(function(obj, keys) {
	  keys = flatten(keys, false, false);
	  var index = keys.length;
	  if (index < 1) throw new Error('bindAll must be passed function names');
	  while (index--) {
	    var key = keys[index];
	    obj[key] = bind(obj[key], obj);
	  }
	  return obj;
	});

	// Memoize an expensive function by storing its results.
	function memoize(func, hasher) {
	  var memoize = function(key) {
	    var cache = memoize.cache;
	    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	    if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
	    return cache[address];
	  };
	  memoize.cache = {};
	  return memoize;
	}

	// Delays a function for the given number of milliseconds, and then calls
	// it with the arguments supplied.
	var delay = restArguments(function(func, wait, args) {
	  return setTimeout(function() {
	    return func.apply(null, args);
	  }, wait);
	});

	// Defers a function, scheduling it to run after the current call stack has
	// cleared.
	var defer = partial(delay, _$2, 1);

	// Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.
	function throttle(func, wait, options) {
	  var timeout, context, args, result;
	  var previous = 0;
	  if (!options) options = {};

	  var later = function() {
	    previous = options.leading === false ? 0 : now();
	    timeout = null;
	    result = func.apply(context, args);
	    if (!timeout) context = args = null;
	  };

	  var throttled = function() {
	    var _now = now();
	    if (!previous && options.leading === false) previous = _now;
	    var remaining = wait - (_now - previous);
	    context = this;
	    args = arguments;
	    if (remaining <= 0 || remaining > wait) {
	      if (timeout) {
	        clearTimeout(timeout);
	        timeout = null;
	      }
	      previous = _now;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    } else if (!timeout && options.trailing !== false) {
	      timeout = setTimeout(later, remaining);
	    }
	    return result;
	  };

	  throttled.cancel = function() {
	    clearTimeout(timeout);
	    previous = 0;
	    timeout = context = args = null;
	  };

	  return throttled;
	}

	// When a sequence of calls of the returned function ends, the argument
	// function is triggered. The end of a sequence is defined by the `wait`
	// parameter. If `immediate` is passed, the argument function will be
	// triggered at the beginning of the sequence instead of at the end.
	function debounce(func, wait, immediate) {
	  var timeout, result;

	  var later = function(context, args) {
	    timeout = null;
	    if (args) result = func.apply(context, args);
	  };

	  var debounced = restArguments(function(args) {
	    if (timeout) clearTimeout(timeout);
	    if (immediate) {
	      var callNow = !timeout;
	      timeout = setTimeout(later, wait);
	      if (callNow) result = func.apply(this, args);
	    } else {
	      timeout = delay(later, wait, this, args);
	    }

	    return result;
	  });

	  debounced.cancel = function() {
	    clearTimeout(timeout);
	    timeout = null;
	  };

	  return debounced;
	}

	// Returns the first function passed as an argument to the second,
	// allowing you to adjust arguments, run code before and after, and
	// conditionally execute the original function.
	function wrap(func, wrapper) {
	  return partial(wrapper, func);
	}

	// Returns a negated version of the passed-in predicate.
	function negate(predicate) {
	  return function() {
	    return !predicate.apply(this, arguments);
	  };
	}

	// Returns a function that is the composition of a list of functions, each
	// consuming the return value of the function that follows.
	function compose() {
	  var args = arguments;
	  var start = args.length - 1;
	  return function() {
	    var i = start;
	    var result = args[start].apply(this, arguments);
	    while (i--) result = args[i].call(this, result);
	    return result;
	  };
	}

	// Returns a function that will only be executed on and after the Nth call.
	function after(times, func) {
	  return function() {
	    if (--times < 1) {
	      return func.apply(this, arguments);
	    }
	  };
	}

	// Returns a function that will only be executed up to (but not including) the
	// Nth call.
	function before(times, func) {
	  var memo;
	  return function() {
	    if (--times > 0) {
	      memo = func.apply(this, arguments);
	    }
	    if (times <= 1) func = null;
	    return memo;
	  };
	}

	// Returns a function that will be executed at most one time, no matter how
	// often you call it. Useful for lazy initialization.
	var once = partial(before, 2);

	// Returns the first key on an object that passes a truth test.
	function findKey(obj, predicate, context) {
	  predicate = cb(predicate, context);
	  var _keys = keys$1(obj), key;
	  for (var i = 0, length = _keys.length; i < length; i++) {
	    key = _keys[i];
	    if (predicate(obj[key], key, obj)) return key;
	  }
	}

	// Internal function to generate `_.findIndex` and `_.findLastIndex`.
	function createPredicateIndexFinder(dir) {
	  return function(array, predicate, context) {
	    predicate = cb(predicate, context);
	    var length = getLength(array);
	    var index = dir > 0 ? 0 : length - 1;
	    for (; index >= 0 && index < length; index += dir) {
	      if (predicate(array[index], index, array)) return index;
	    }
	    return -1;
	  };
	}

	// Returns the first index on an array-like that passes a truth test.
	var findIndex = createPredicateIndexFinder(1);

	// Returns the last index on an array-like that passes a truth test.
	var findLastIndex = createPredicateIndexFinder(-1);

	// Use a comparator function to figure out the smallest index at which
	// an object should be inserted so as to maintain order. Uses binary search.
	function sortedIndex(array, obj, iteratee, context) {
	  iteratee = cb(iteratee, context, 1);
	  var value = iteratee(obj);
	  var low = 0, high = getLength(array);
	  while (low < high) {
	    var mid = Math.floor((low + high) / 2);
	    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	  }
	  return low;
	}

	// Internal function to generate the `_.indexOf` and `_.lastIndexOf` functions.
	function createIndexFinder(dir, predicateFind, sortedIndex) {
	  return function(array, item, idx) {
	    var i = 0, length = getLength(array);
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
	      idx = predicateFind(slice.call(array, i, length), isNaN$1);
	      return idx >= 0 ? idx + i : -1;
	    }
	    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	      if (array[idx] === item) return idx;
	    }
	    return -1;
	  };
	}

	// Return the position of the first occurrence of an item in an array,
	// or -1 if the item is not included in the array.
	// If the array is large and already in sort order, pass `true`
	// for **isSorted** to use binary search.
	var indexOf = createIndexFinder(1, findIndex, sortedIndex);

	// Return the position of the last occurrence of an item in an array,
	// or -1 if the item is not included in the array.
	var lastIndexOf = createIndexFinder(-1, findLastIndex);

	// Return the first value which passes a truth test.
	function find(obj, predicate, context) {
	  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
	  var key = keyFinder(obj, predicate, context);
	  if (key !== void 0 && key !== -1) return obj[key];
	}

	// Convenience version of a common use case of `_.find`: getting the first
	// object containing specific `key:value` pairs.
	function findWhere(obj, attrs) {
	  return find(obj, matcher(attrs));
	}

	// The cornerstone for collection functions, an `each`
	// implementation, aka `forEach`.
	// Handles raw objects in addition to array-likes. Treats all
	// sparse array-likes as if they were dense.
	function each(obj, iteratee, context) {
	  iteratee = optimizeCb(iteratee, context);
	  var i, length;
	  if (isArrayLike(obj)) {
	    for (i = 0, length = obj.length; i < length; i++) {
	      iteratee(obj[i], i, obj);
	    }
	  } else {
	    var _keys = keys$1(obj);
	    for (i = 0, length = _keys.length; i < length; i++) {
	      iteratee(obj[_keys[i]], _keys[i], obj);
	    }
	  }
	  return obj;
	}

	// Return the results of applying the iteratee to each element.
	function map(obj, iteratee, context) {
	  iteratee = cb(iteratee, context);
	  var _keys = !isArrayLike(obj) && keys$1(obj),
	      length = (_keys || obj).length,
	      results = Array(length);
	  for (var index = 0; index < length; index++) {
	    var currentKey = _keys ? _keys[index] : index;
	    results[index] = iteratee(obj[currentKey], currentKey, obj);
	  }
	  return results;
	}

	// Internal helper to create a reducing function, iterating left or right.
	function createReduce(dir) {
	  // Wrap code that reassigns argument variables in a separate function than
	  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
	  var reducer = function(obj, iteratee, memo, initial) {
	    var _keys = !isArrayLike(obj) && keys$1(obj),
	        length = (_keys || obj).length,
	        index = dir > 0 ? 0 : length - 1;
	    if (!initial) {
	      memo = obj[_keys ? _keys[index] : index];
	      index += dir;
	    }
	    for (; index >= 0 && index < length; index += dir) {
	      var currentKey = _keys ? _keys[index] : index;
	      memo = iteratee(memo, obj[currentKey], currentKey, obj);
	    }
	    return memo;
	  };

	  return function(obj, iteratee, memo, context) {
	    var initial = arguments.length >= 3;
	    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
	  };
	}

	// **Reduce** builds up a single result from a list of values, aka `inject`,
	// or `foldl`.
	var reduce = createReduce(1);

	// The right-associative version of reduce, also known as `foldr`.
	var reduceRight = createReduce(-1);

	// Return all the elements that pass a truth test.
	function filter(obj, predicate, context) {
	  var results = [];
	  predicate = cb(predicate, context);
	  each(obj, function(value, index, list) {
	    if (predicate(value, index, list)) results.push(value);
	  });
	  return results;
	}

	// Return all the elements for which a truth test fails.
	function reject(obj, predicate, context) {
	  return filter(obj, negate(cb(predicate)), context);
	}

	// Determine whether all of the elements pass a truth test.
	function every(obj, predicate, context) {
	  predicate = cb(predicate, context);
	  var _keys = !isArrayLike(obj) && keys$1(obj),
	      length = (_keys || obj).length;
	  for (var index = 0; index < length; index++) {
	    var currentKey = _keys ? _keys[index] : index;
	    if (!predicate(obj[currentKey], currentKey, obj)) return false;
	  }
	  return true;
	}

	// Determine if at least one element in the object passes a truth test.
	function some(obj, predicate, context) {
	  predicate = cb(predicate, context);
	  var _keys = !isArrayLike(obj) && keys$1(obj),
	      length = (_keys || obj).length;
	  for (var index = 0; index < length; index++) {
	    var currentKey = _keys ? _keys[index] : index;
	    if (predicate(obj[currentKey], currentKey, obj)) return true;
	  }
	  return false;
	}

	// Determine if the array or object contains a given item (using `===`).
	function contains(obj, item, fromIndex, guard) {
	  if (!isArrayLike(obj)) obj = values(obj);
	  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	  return indexOf(obj, item, fromIndex) >= 0;
	}

	// Invoke a method (with arguments) on every item in a collection.
	var invoke = restArguments(function(obj, path, args) {
	  var contextPath, func;
	  if (isFunction$3(path)) {
	    func = path;
	  } else if (isArray(path)) {
	    contextPath = path.slice(0, -1);
	    path = path[path.length - 1];
	  }
	  return map(obj, function(context) {
	    var method = func;
	    if (!method) {
	      if (contextPath && contextPath.length) {
	        context = deepGet(context, contextPath);
	      }
	      if (context == null) return void 0;
	      method = context[path];
	    }
	    return method == null ? method : method.apply(context, args);
	  });
	});

	// Convenience version of a common use case of `_.map`: fetching a property.
	function pluck(obj, key) {
	  return map(obj, property(key));
	}

	// Convenience version of a common use case of `_.filter`: selecting only
	// objects containing specific `key:value` pairs.
	function where(obj, attrs) {
	  return filter(obj, matcher(attrs));
	}

	// Return the maximum element (or element-based computation).
	function max(obj, iteratee, context) {
	  var result = -Infinity, lastComputed = -Infinity,
	      value, computed;
	  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
	    obj = isArrayLike(obj) ? obj : values(obj);
	    for (var i = 0, length = obj.length; i < length; i++) {
	      value = obj[i];
	      if (value != null && value > result) {
	        result = value;
	      }
	    }
	  } else {
	    iteratee = cb(iteratee, context);
	    each(obj, function(v, index, list) {
	      computed = iteratee(v, index, list);
	      if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	        result = v;
	        lastComputed = computed;
	      }
	    });
	  }
	  return result;
	}

	// Return the minimum element (or element-based computation).
	function min(obj, iteratee, context) {
	  var result = Infinity, lastComputed = Infinity,
	      value, computed;
	  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
	    obj = isArrayLike(obj) ? obj : values(obj);
	    for (var i = 0, length = obj.length; i < length; i++) {
	      value = obj[i];
	      if (value != null && value < result) {
	        result = value;
	      }
	    }
	  } else {
	    iteratee = cb(iteratee, context);
	    each(obj, function(v, index, list) {
	      computed = iteratee(v, index, list);
	      if (computed < lastComputed || computed === Infinity && result === Infinity) {
	        result = v;
	        lastComputed = computed;
	      }
	    });
	  }
	  return result;
	}

	// Sample **n** random values from a collection using the modern version of the
	// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	// If **n** is not specified, returns a single random element.
	// The internal `guard` argument allows it to work with `_.map`.
	function sample(obj, n, guard) {
	  if (n == null || guard) {
	    if (!isArrayLike(obj)) obj = values(obj);
	    return obj[random(obj.length - 1)];
	  }
	  var sample = isArrayLike(obj) ? clone$1(obj) : values(obj);
	  var length = getLength(sample);
	  n = Math.max(Math.min(n, length), 0);
	  var last = length - 1;
	  for (var index = 0; index < n; index++) {
	    var rand = random(index, last);
	    var temp = sample[index];
	    sample[index] = sample[rand];
	    sample[rand] = temp;
	  }
	  return sample.slice(0, n);
	}

	// Shuffle a collection.
	function shuffle(obj) {
	  return sample(obj, Infinity);
	}

	// Sort the object's values by a criterion produced by an iteratee.
	function sortBy(obj, iteratee, context) {
	  var index = 0;
	  iteratee = cb(iteratee, context);
	  return pluck(map(obj, function(value, key, list) {
	    return {
	      value: value,
	      index: index++,
	      criteria: iteratee(value, key, list)
	    };
	  }).sort(function(left, right) {
	    var a = left.criteria;
	    var b = right.criteria;
	    if (a !== b) {
	      if (a > b || a === void 0) return 1;
	      if (a < b || b === void 0) return -1;
	    }
	    return left.index - right.index;
	  }), 'value');
	}

	// An internal function used for aggregate "group by" operations.
	function group(behavior, partition) {
	  return function(obj, iteratee, context) {
	    var result = partition ? [[], []] : {};
	    iteratee = cb(iteratee, context);
	    each(obj, function(value, index) {
	      var key = iteratee(value, index, obj);
	      behavior(result, value, key);
	    });
	    return result;
	  };
	}

	// Groups the object's values by a criterion. Pass either a string attribute
	// to group by, or a function that returns the criterion.
	var groupBy = group(function(result, value, key) {
	  if (has$1(result, key)) result[key].push(value); else result[key] = [value];
	});

	// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
	// when you know that your index values will be unique.
	var indexBy = group(function(result, value, key) {
	  result[key] = value;
	});

	// Counts instances of an object that group by a certain criterion. Pass
	// either a string attribute to count by, or a function that returns the
	// criterion.
	var countBy = group(function(result, value, key) {
	  if (has$1(result, key)) result[key]++; else result[key] = 1;
	});

	// Split a collection into two arrays: one whose elements all pass the given
	// truth test, and one whose elements all do not pass the truth test.
	var partition = group(function(result, value, pass) {
	  result[pass ? 0 : 1].push(value);
	}, true);

	// Safely create a real, live array from anything iterable.
	var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
	function toArray(obj) {
	  if (!obj) return [];
	  if (isArray(obj)) return slice.call(obj);
	  if (isString(obj)) {
	    // Keep surrogate pair characters together.
	    return obj.match(reStrSymbol);
	  }
	  if (isArrayLike(obj)) return map(obj, identity);
	  return values(obj);
	}

	// Return the number of elements in a collection.
	function size(obj) {
	  if (obj == null) return 0;
	  return isArrayLike(obj) ? obj.length : keys$1(obj).length;
	}

	// Internal `_.pick` helper function to determine whether `key` is an enumerable
	// property name of `obj`.
	function keyInObj(value, key, obj) {
	  return key in obj;
	}

	// Return a copy of the object only containing the allowed properties.
	var pick = restArguments(function(obj, keys) {
	  var result = {}, iteratee = keys[0];
	  if (obj == null) return result;
	  if (isFunction$3(iteratee)) {
	    if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
	    keys = allKeys(obj);
	  } else {
	    iteratee = keyInObj;
	    keys = flatten(keys, false, false);
	    obj = Object(obj);
	  }
	  for (var i = 0, length = keys.length; i < length; i++) {
	    var key = keys[i];
	    var value = obj[key];
	    if (iteratee(value, key, obj)) result[key] = value;
	  }
	  return result;
	});

	// Return a copy of the object without the disallowed properties.
	var omit = restArguments(function(obj, keys) {
	  var iteratee = keys[0], context;
	  if (isFunction$3(iteratee)) {
	    iteratee = negate(iteratee);
	    if (keys.length > 1) context = keys[1];
	  } else {
	    keys = map(flatten(keys, false, false), String);
	    iteratee = function(value, key) {
	      return !contains(keys, key);
	    };
	  }
	  return pick(obj, iteratee, context);
	});

	// Returns everything but the last entry of the array. Especially useful on
	// the arguments object. Passing **n** will return all the values in
	// the array, excluding the last N.
	function initial(array, n, guard) {
	  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	}

	// Get the first element of an array. Passing **n** will return the first N
	// values in the array. The **guard** check allows it to work with `_.map`.
	function first(array, n, guard) {
	  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
	  if (n == null || guard) return array[0];
	  return initial(array, array.length - n);
	}

	// Returns everything but the first entry of the `array`. Especially useful on
	// the `arguments` object. Passing an **n** will return the rest N values in the
	// `array`.
	function rest(array, n, guard) {
	  return slice.call(array, n == null || guard ? 1 : n);
	}

	// Get the last element of an array. Passing **n** will return the last N
	// values in the array.
	function last(array, n, guard) {
	  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
	  if (n == null || guard) return array[array.length - 1];
	  return rest(array, Math.max(0, array.length - n));
	}

	// Trim out all falsy values from an array.
	function compact(array) {
	  return filter(array, Boolean);
	}

	// Flatten out an array, either recursively (by default), or up to `depth`.
	// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
	function flatten$1(array, depth) {
	  return flatten(array, depth, false);
	}

	// Take the difference between one array and a number of other arrays.
	// Only the elements present in just the first array will remain.
	var difference$1 = restArguments(function(array, rest) {
	  rest = flatten(rest, true, true);
	  return filter(array, function(value){
	    return !contains(rest, value);
	  });
	});

	// Return a version of the array that does not contain the specified value(s).
	var without = restArguments(function(array, otherArrays) {
	  return difference$1(array, otherArrays);
	});

	// Produce a duplicate-free version of the array. If the array has already
	// been sorted, you have the option of using a faster algorithm.
	// The faster algorithm will not work with an iteratee if the iteratee
	// is not a one-to-one function, so providing an iteratee will disable
	// the faster algorithm.
	function uniq(array, isSorted, iteratee, context) {
	  if (!isBoolean(isSorted)) {
	    context = iteratee;
	    iteratee = isSorted;
	    isSorted = false;
	  }
	  if (iteratee != null) iteratee = cb(iteratee, context);
	  var result = [];
	  var seen = [];
	  for (var i = 0, length = getLength(array); i < length; i++) {
	    var value = array[i],
	        computed = iteratee ? iteratee(value, i, array) : value;
	    if (isSorted && !iteratee) {
	      if (!i || seen !== computed) result.push(value);
	      seen = computed;
	    } else if (iteratee) {
	      if (!contains(seen, computed)) {
	        seen.push(computed);
	        result.push(value);
	      }
	    } else if (!contains(result, value)) {
	      result.push(value);
	    }
	  }
	  return result;
	}

	// Produce an array that contains the union: each distinct element from all of
	// the passed-in arrays.
	var union = restArguments(function(arrays) {
	  return uniq(flatten(arrays, true, true));
	});

	// Produce an array that contains every item shared between all the
	// passed-in arrays.
	function intersection(array) {
	  var result = [];
	  var argsLength = arguments.length;
	  for (var i = 0, length = getLength(array); i < length; i++) {
	    var item = array[i];
	    if (contains(result, item)) continue;
	    var j;
	    for (j = 1; j < argsLength; j++) {
	      if (!contains(arguments[j], item)) break;
	    }
	    if (j === argsLength) result.push(item);
	  }
	  return result;
	}

	// Complement of zip. Unzip accepts an array of arrays and groups
	// each array's elements on shared indices.
	function unzip(array) {
	  var length = array && max(array, getLength).length || 0;
	  var result = Array(length);

	  for (var index = 0; index < length; index++) {
	    result[index] = pluck(array, index);
	  }
	  return result;
	}

	// Zip together multiple lists into a single array -- elements that share
	// an index go together.
	var zip = restArguments(unzip);

	// Converts lists into objects. Pass either a single array of `[key, value]`
	// pairs, or two parallel arrays of the same length -- one of keys, and one of
	// the corresponding values. Passing by pairs is the reverse of `_.pairs`.
	function object(list, values) {
	  var result = {};
	  for (var i = 0, length = getLength(list); i < length; i++) {
	    if (values) {
	      result[list[i]] = values[i];
	    } else {
	      result[list[i][0]] = list[i][1];
	    }
	  }
	  return result;
	}

	// Generate an integer Array containing an arithmetic progression. A port of
	// the native Python `range()` function. See
	// [the Python documentation](https://docs.python.org/library/functions.html#range).
	function range(start, stop, step) {
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

	// Chunk a single array into multiple arrays, each containing `count` or fewer
	// items.
	function chunk(array, count) {
	  if (count == null || count < 1) return [];
	  var result = [];
	  var i = 0, length = array.length;
	  while (i < length) {
	    result.push(slice.call(array, i, i += count));
	  }
	  return result;
	}

	// Helper function to continue chaining intermediate results.
	function chainResult(instance, obj) {
	  return instance._chain ? _$2(obj).chain() : obj;
	}

	// Add your own custom functions to the Underscore object.
	function mixin(obj) {
	  each(functions(obj), function(name) {
	    var func = _$2[name] = obj[name];
	    _$2.prototype[name] = function() {
	      var args = [this._wrapped];
	      push.apply(args, arguments);
	      return chainResult(this, func.apply(_$2, args));
	    };
	  });
	  return _$2;
	}

	// Add all mutator `Array` functions to the wrapper.
	each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	  var method = ArrayProto[name];
	  _$2.prototype[name] = function() {
	    var obj = this._wrapped;
	    if (obj != null) {
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
	        delete obj[0];
	      }
	    }
	    return chainResult(this, obj);
	  };
	});

	// Add all accessor `Array` functions to the wrapper.
	each(['concat', 'join', 'slice'], function(name) {
	  var method = ArrayProto[name];
	  _$2.prototype[name] = function() {
	    var obj = this._wrapped;
	    if (obj != null) obj = method.apply(obj, arguments);
	    return chainResult(this, obj);
	  };
	});

	// Named Exports

	var allExports = /*#__PURE__*/Object.freeze({
		__proto__: null,
		VERSION: VERSION$1,
		restArguments: restArguments,
		isObject: isObject$1,
		isNull: isNull,
		isUndefined: isUndefined,
		isBoolean: isBoolean,
		isElement: isElement,
		isString: isString,
		isNumber: isNumber,
		isDate: isDate,
		isRegExp: isRegExp,
		isError: isError,
		isSymbol: isSymbol,
		isMap: isMap,
		isWeakMap: isWeakMap,
		isSet: isSet,
		isWeakSet: isWeakSet,
		isArrayBuffer: isArrayBuffer,
		isDataView: isDataView$1,
		isArray: isArray,
		isFunction: isFunction$3,
		isArguments: isArguments$1,
		isFinite: isFinite$1,
		isNaN: isNaN$1,
		isTypedArray: isTypedArray$3,
		isEmpty: isEmpty,
		isMatch: isMatch,
		isEqual: isEqual$1,
		keys: keys$1,
		allKeys: allKeys,
		values: values,
		pairs: pairs,
		invert: invert,
		functions: functions,
		methods: functions,
		extend: extend,
		extendOwn: extendOwn,
		assign: extendOwn,
		defaults: defaults,
		create: create,
		clone: clone$1,
		tap: tap,
		has: has$2,
		mapObject: mapObject,
		identity: identity,
		constant: constant$1,
		noop: noop$1,
		property: property,
		propertyOf: propertyOf,
		matcher: matcher,
		matches: matcher,
		times: times,
		random: random,
		now: now,
		escape: _escape,
		unescape: _unescape,
		templateSettings: templateSettings,
		template: template,
		result: result,
		uniqueId: uniqueId,
		chain: chain,
		iteratee: iteratee,
		partial: partial,
		bind: bind,
		bindAll: bindAll,
		memoize: memoize,
		delay: delay,
		defer: defer,
		throttle: throttle,
		debounce: debounce,
		wrap: wrap,
		negate: negate,
		compose: compose,
		after: after,
		before: before,
		once: once,
		findKey: findKey,
		findIndex: findIndex,
		findLastIndex: findLastIndex,
		sortedIndex: sortedIndex,
		indexOf: indexOf,
		lastIndexOf: lastIndexOf,
		find: find,
		detect: find,
		findWhere: findWhere,
		each: each,
		forEach: each,
		map: map,
		collect: map,
		reduce: reduce,
		foldl: reduce,
		inject: reduce,
		reduceRight: reduceRight,
		foldr: reduceRight,
		filter: filter,
		select: filter,
		reject: reject,
		every: every,
		all: every,
		some: some,
		any: some,
		contains: contains,
		includes: contains,
		include: contains,
		invoke: invoke,
		pluck: pluck,
		where: where,
		max: max,
		min: min,
		shuffle: shuffle,
		sample: sample,
		sortBy: sortBy,
		groupBy: groupBy,
		indexBy: indexBy,
		countBy: countBy,
		partition: partition,
		toArray: toArray,
		size: size,
		pick: pick,
		omit: omit,
		first: first,
		head: first,
		take: first,
		initial: initial,
		last: last,
		rest: rest,
		tail: rest,
		drop: rest,
		compact: compact,
		flatten: flatten$1,
		without: without,
		uniq: uniq,
		unique: uniq,
		union: union,
		intersection: intersection,
		difference: difference$1,
		unzip: unzip,
		transpose: unzip,
		zip: zip,
		object: object,
		range: range,
		chunk: chunk,
		mixin: mixin,
		'default': _$2
	});

	// Default Export

	// Add all of the Underscore functions to the wrapper object.
	var _$3 = mixin(allExports);
	// Legacy Node.js API.
	_$3._ = _$3;

	/*
	 * Dataset class
	 * @class dw.Dataset
	 *
	 * @param {dw.Column[]} columns
	 */
	function dataset(columns) {
	    // make column names unique
	    let columnsByName = {};
	    const origColumns = columns.slice(0);

	    columns.forEach(col => {
	        uniqueName(col);
	        columnsByName[col.name()] = col;
	    });

	    // sets a unique name for a column
	    function uniqueName(col) {
	        const origColName = col.name();
	        let colName = origColName;
	        let appendix = 1;

	        while (columnsByName.hasOwnProperty(colName)) {
	            colName = origColName + '.' + appendix++;
	        }
	        if (colName !== origColName) col.name(colName); // rename column
	    }

	    // public interface
	    const dataset = {
	        /**
	         * returns all columns of the dataset
	         * @returns {dw.Column[]}
	         */
	        columns() {
	            return columns;
	        },

	        /**
	         * returns a specific column by name or index
	         *
	         * @param {string|number} nameOrIndex -- the name or index of the column to return
	         * @returns {dw.Column}
	         */
	        column(nameOrIndex) {
	            if (_$3.isString(nameOrIndex)) {
	                // single column by name
	                if (columnsByName[nameOrIndex] !== undefined) return columnsByName[nameOrIndex];
	                throw new Error('No column found with that name: "' + nameOrIndex + '"');
	            } else {
	                if (nameOrIndex < 0) {
	                    return;
	                }
	            }

	            // single column by index
	            if (columns[nameOrIndex] !== undefined) return columns[nameOrIndex];
	            throw new Error('No column found with that name or index: ' + nameOrIndex);
	        },

	        /**
	         * returns the number of columns in the dataset
	         * @returns {number}
	         */
	        numColumns() {
	            return columns.length;
	        },

	        /**
	         * returns the number of rows in the dataset
	         * @returns {number}
	         */
	        numRows() {
	            return columns[0].length;
	        },

	        /** calls a function for each column of the dataset */
	        eachColumn(func) {
	            columns.forEach(func);
	        },

	        /**
	         * tests if a column name or index exists
	         *
	         * @param {string|number} nameOrIndex -- the name or index of the column
	         * @returns {boolean}
	         */
	        hasColumn(nameOrIndex) {
	            return (
	                (_$3.isString(nameOrIndex) ? columnsByName[nameOrIndex] : columns[nameOrIndex]) !==
	                undefined
	            );
	        },

	        /**
	         * returns the index of a column
	         * @param {string} columnName
	         * @returns {number}
	         */
	        indexOf(columnName) {
	            if (!dataset.hasColumn(columnName)) return -1;
	            return columns.indexOf(columnsByName[columnName]);
	        },

	        /**
	         * returns a D3 friendly list of plain objects
	         * @returns {object[]}
	         */
	        list() {
	            return _$3.range(columns[0].length).map(function(r) {
	                var o = {};
	                columns.forEach(col => {
	                    o[col.name()] = col.val(r);
	                });
	                return o;
	            });
	        },

	        /**
	         * returns a CSV string representation of the dataset
	         * @returns {string}
	         */
	        csv() {
	            let csv = '';
	            const sep = ',';
	            const quote = '"';
	            // add header
	            columns.forEach((col, i) => {
	                var t = col.title();
	                if (t.indexOf(quote) > -1) t.replace(quote, '\\' + quote);
	                if (t.indexOf(sep) > -1) t = quote + t + quote;
	                csv += (i > 0 ? sep : '') + t;
	            });
	            // add values
	            _$3.range(dataset.numRows()).forEach(row => {
	                csv += '\n';
	                columns.forEach((col, i) => {
	                    var t = '' + (col.type() === 'date' ? col.raw(row) : col.val(row));
	                    if (t.indexOf(quote) > -1) t.replace(quote, '\\' + quote);
	                    if (t.indexOf(sep) > -1) t = quote + t + quote;
	                    csv += (i > 0 ? sep : '') + t;
	                });
	            });
	            return csv;
	        },

	        /**
	         * @alias csv
	         * @deprecated
	         */
	        toCSV() {
	            return this.csv();
	        },

	        /**
	         * removes ignored columns from dataset
	         * @param {object} ignore -- object of column names to ignore
	         */
	        filterColumns(ignore) {
	            columns = columns.filter(c => !ignore[c.name()]);
	            _$3.each(ignore, (ign, key) => {
	                if (ign && columnsByName[key]) delete columnsByName[key];
	            });
	            return dataset;
	        },

	        /**
	         * executes func for each row of the dataset
	         */
	        eachRow(func) {
	            var i;
	            for (i = 0; i < dataset.numRows(); i++) {
	                func(i);
	            }
	            return dataset;
	        },

	        /**
	         * adds a new column to the dataset
	         * @param {dw.Column} column
	         */
	        add(column) {
	            uniqueName(column);
	            columns.push(column);
	            columnsByName[column.name()] = column;
	            origColumns.push(column);
	            return dataset;
	        },

	        /**
	         * cuts each column in the dataset to a maximum number of rows
	         * @param {number} numRows
	         * @returns {dw.Dataset}
	         */
	        limitRows(numRows) {
	            columns.forEach(col => {
	                col.limitRows(numRows);
	            });
	            return dataset;
	        },

	        /**
	         * cuts the number of columns to a maximum value
	         * @param {number} numCols
	         * @returns {dw.Dataset}
	         */
	        limitColumns(numCols) {
	            if (columns.length > numCols) {
	                columns.length = numCols;
	                origColumns.length = numCols;
	            }
	            return dataset;
	        },

	        /**
	         * returns the columns in a given order
	         * @param {number[]} sortOrder -- array of indexes
	         */
	        columnOrder(sortOrder) {
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
	        }
	    };

	    return dataset;
	}

	function text() {
	    return {
	        parse: _$3.identity,
	        errors: function() {
	            return 0;
	        },
	        name: function() {
	            return 'text';
	        },
	        formatter: function() {
	            return _$3.identity;
	        },
	        isValid: function() {
	            return true;
	        },
	        format: function() {}
	    };
	}

	/**
	 * returns true if two numeric values are close enough
	 *
	 * @exports equalish
	 * @kind function
	 *
	 * @param {number} a
	 * @param {number} b
	 *
	 * @example
	 * // returns true
	 * equalish(0.333333, 1/3)
	 *
	 * @example
	 * // returns false
	 * equalish(0.333, 1/3)
	 *
	 * @export
	 * @returns {boolean}
	 */
	function equalish(a, b) {
	    return Math.abs(a - b) < 1e-6;
	}

	/* eslint no-irregular-whitespace: "off" */

	/* globals Globalize */

	/*
	 * A type for numbers:
	 *
	 * Usage:
	 * var parse = dw.type.number(sampleData);
	 * parse()
	 */
	function number(sample) {
	    function signDigitsDecimalPlaces(num, sig) {
	        if (num === 0) return 0;
	        return Math.round(sig - Math.ceil(Math.log(Math.abs(num)) / Math.LN10));
	    }

	    let format;
	    let errors = 0;
	    const knownFormats = {
	        '-.': /^ *[-–—−]?[0-9]*(\.[0-9]+)?(e[+-][0-9]+)?%? *$/,
	        '-,': /^ *[-–—−]?[0-9]*(,[0-9]+)?%? *$/,
	        ',.': /^ *[-–—−]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
	        '.,': /^ *[-–—−]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
	        ' .': /^ *[-–—−]?[0-9]{1,3}([   ][0-9]{3})*(\.[0-9]+)?%? *$/,
	        ' ,': /^ *[-–—−]?[0-9]{1,3}([   ][0-9]{3})*(,[0-9]+)?%? *$/,
	        // excel sometimes produces a strange white-space:
	        "'.": /^ *[-–—−]?[0-9]{1,3}('[0-9]{3})*(\.[0-9]+)?%? *$/
	    };
	    const formatLabels = {
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
	        ' ,': '1 234,56'
	    };
	    // a list of strings that are recognized as 'not available'
	    const naStrings = {
	        na: 1,
	        'n/a': 1,
	        '-': 1,
	        ':': 1
	    };

	    const matches = {};
	    const bestMatch = ['-.', 0];

	    sample = sample || [];

	    _$3.each(sample, function(n) {
	        _$3.each(knownFormats, function(regex, fmt) {
	            if (matches[fmt] === undefined) matches[fmt] = 0;
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
	            if (_$3.isNumber(raw) || _$3.isUndefined(raw) || _$3.isNull(raw)) return raw;
	            // replace percent sign, n-dash & m-dash, remove weird spaces
	            var number = raw
	                .replace('%', '')
	                .replace('−', '-')
	                .replace(/[   ]/g, '')
	                .replace('–', '-')
	                .replace('—', '-');
	            // normalize number
	            if (format[0] !== '-') {
	                // remove kilo seperator
	                number = number.replace(new RegExp(format[0] === '.' ? '\\.' : format[0], 'g'), '');
	            }
	            if (format[1] !== '.') {
	                // replace decimal char w/ point
	                number = number.replace(format[1], '.');
	            }
	            if (isNaN(number) || number === '') {
	                if (!naStrings[number.toLowerCase()] && number !== '') errors++;
	                return raw;
	            }
	            return Number(number);
	        },
	        toNum: function(i) {
	            return i;
	        },
	        fromNum: function(i) {
	            return i;
	        },
	        errors: function() {
	            return errors;
	        },
	        name: function() {
	            return 'number';
	        },

	        // returns a function for formatting numbers
	        formatter: function(config) {
	            let format = config['number-format'] || '-';
	            let div = Number(config['number-divisor'] || 0);
	            let append = (config['number-append'] || '').replace(/ /g, '\u00A0');
	            let prepend = (config['number-prepend'] || '').replace(/ /g, '\u00A0');
	            return function(val, full, round) {
	                if (isNaN(val)) return val;
	                var _fmt = format;
	                if (div !== 0 && _fmt === '-') _fmt = 'n1';
	                if (div !== 0) val = Number(val) / Math.pow(10, div);
	                if (_fmt.substr(0, 1) === 's') {
	                    // significant figures
	                    var sig = +_fmt.substr(1);
	                    _fmt = 'n' + Math.max(0, signDigitsDecimalPlaces(val, sig));
	                }
	                if (round) _fmt = 'n0';
	                if (_fmt === '-') {
	                    // guess number format based on single number
	                    _fmt = equalish(val, Math.round(val))
	                        ? 'n0'
	                        : equalish(val, Math.round(val * 10) * 0.1)
	                        ? 'n1'
	                        : equalish(val, Math.round(val * 100) * 0.01)
	                        ? 'n2'
	                        : equalish(val, Math.round(val * 1000) * 0.001)
	                        ? 'n3'
	                        : equalish(val, Math.round(val * 10000) * 0.0001)
	                        ? 'n4'
	                        : equalish(val, Math.round(val * 100000) * 0.00001)
	                        ? 'n5'
	                        : 'n6';
	                }
	                val = Globalize.format(val, _fmt !== '-' ? _fmt : null);
	                return full ? prepend + val + append : val;
	            };
	        },

	        isValid: function(val) {
	            return (
	                val === '' || naStrings[String(val).toLowerCase()] || _$3.isNumber(type.parse(val))
	            );
	        },

	        ambiguousFormats: function() {
	            var candidates = [];
	            _$3.each(matches, function(cnt, fmt) {
	                if (cnt === bestMatch[1]) {
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
	}

	/* globals Globalize */

	const begin = /^ */.source;
	const end = /[*']* *$/.source;
	const s0 = /[ \-/.]?/.source; // optional separator
	const s1 = /[ \-/.]/.source; // mandatory separator
	const s2 = /[ \-/.;,]/.source; // mandatory separator
	const s3 = /[ \-|T]/.source; // mandatory separator
	const sM = /[ \-/.m]/.source; // mandatory separator
	const rx = {
	    YY: { parse: /['’‘]?(\d{2})/ },
	    YYYY: { test: /([12]\d{3})/, parse: /(\d{4})/ },
	    YYYY2: { test: /(?:1[7-9]|20)\d{2}/, parse: /(\d{4})/ },
	    H: { parse: /h([12])/ },
	    Q: { parse: /q([1234])/ },
	    W: { parse: /w([0-5]?[0-9])/ },
	    MM: { test: /(0?[1-9]|1[0-2])/, parse: /(0?[1-9]|1[0-2])/ },
	    DD: { parse: /(0?[1-9]|[1-2][0-9]|3[01])/ },
	    DOW: { parse: /([0-7])/ },
	    HHMM: { parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(am|pm)?/ }
	};

	const MONTHS = {
	    // feel free to add more localized month names
	    0: [
	        'jan',
	        'january',
	        'januar',
	        'jänner',
	        'jän',
	        'janv',
	        'janvier',
	        'ene',
	        'enero',
	        'gen',
	        'gennaio',
	        'janeiro'
	    ],
	    1: [
	        'feb',
	        'february',
	        'febr',
	        'februar',
	        'fév',
	        'févr',
	        'février',
	        'febrero',
	        'febbraio',
	        'fev',
	        'fevereiro'
	    ],
	    2: ['mar', 'mär', 'march', 'mrz', 'märz', 'mars', 'mars', 'marzo', 'marzo', 'março'],
	    3: ['apr', 'april', 'apr', 'april', 'avr', 'avril', 'abr', 'abril', 'aprile'],
	    4: ['may', 'mai', 'mayo', 'mag', 'maggio', 'maio', 'maj'],
	    5: ['jun', 'june', 'juni', 'juin', 'junio', 'giu', 'giugno', 'junho'],
	    6: ['jul', 'july', 'juli', 'juil', 'juillet', 'julio', 'lug', 'luglio', 'julho'],
	    7: ['aug', 'august', 'août', 'ago', 'agosto'],
	    8: ['sep', 'september', 'sept', 'septembre', 'septiembre', 'set', 'settembre', 'setembro'],
	    9: [
	        'oct',
	        'october',
	        'okt',
	        'oktober',
	        'octobre',
	        'octubre',
	        'ott',
	        'ottobre',
	        'out',
	        'outubro'
	    ],
	    10: ['nov', 'november', 'november', 'novembre', 'noviembre', 'novembre', 'novembro'],
	    11: [
	        'dec',
	        'december',
	        'dez',
	        'des',
	        'dezember',
	        'déc',
	        'décembre',
	        'dic',
	        'diciembre',
	        'dicembre',
	        'desember',
	        'dezembro'
	    ]
	};
	const shortMonthKey = {};

	_$3.each(MONTHS, function(abbr, m) {
	    _$3.each(abbr, function(a) {
	        shortMonthKey[a] = m;
	    });
	});

	rx.MMM = { parse: new RegExp('(' + _$3.flatten(_$3.values(MONTHS)).join('|') + ')') };

	_$3.each(rx, function(r) {
	    r.parse = r.parse.source;
	    if (_$3.isRegExp(r.test)) r.test = r.test.source;
	    else r.test = r.parse;
	});

	var knownFormats = {
	    // each format has two regex, a strict one for format guessing
	    // based on a sample and a lazy one for parsing
	    YYYY: {
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
	        test: reg(rx.YYYY.test, sM, rx.MM.test),
	        parse: reg(rx.YYYY.parse, sM, rx.MM.parse),
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
	    MMM: {
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
	    'MM/DD/YY': {
	        test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YY.test),
	        parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YY.parse),
	        precision: 'day'
	    },
	    'DD/MM/YY': {
	        test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YY.test),
	        parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YY.parse),
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

	    'YYYY-WW-d': {
	        // year + ISO week + [day]
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
	        parse: reg(
	            rx.DD.parse,
	            '([\\-\\.\\/ ?])',
	            rx.MM.parse,
	            '\\2',
	            rx.YYYY.parse,
	            s3,
	            rx.HHMM.parse
	        ),
	        precision: 'day-minutes'
	    },
	    'YYYY-MM-DD HH:MM': {
	        test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test, s3, rx.HHMM.test),
	        parse: reg(
	            rx.YYYY.parse,
	            '([\\-\\.\\/ ?])',
	            rx.MM.parse,
	            '\\2',
	            rx.DD.parse,
	            s3,
	            rx.HHMM.parse
	        ),
	        precision: 'day-minutes'
	    },
	    ISO8601: {
	        test: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)/,
	        parse: function(str) {
	            return str;
	        },
	        precision: 'day-seconds'
	    }
	};

	function reg() {
	    return new RegExp(begin + Array.prototype.slice.call(arguments).join(' *') + end, 'i');
	}

	function test(str, key) {
	    var fmt = knownFormats[key];
	    if (_$3.isRegExp(fmt.test)) {
	        return fmt.test.test(str);
	    } else {
	        return fmt.test(str, key);
	    }
	}

	function parse(str, key) {
	    var fmt = knownFormats[key];
	    if (_$3.isRegExp(fmt.parse)) {
	        return str.match(fmt.parse);
	    } else {
	        return fmt.parse(str, key);
	    }
	}

	function dateFromIsoWeek(year, week, day) {
	    var d = new Date(Date.UTC(year, 0, 3));
	    d.setUTCDate(3 - d.getUTCDay() + (week - 1) * 7 + parseInt(day, 10));
	    return d;
	}

	function dateToIsoWeek(date) {
	    const d = date.getUTCDay();
	    const t = new Date(date.valueOf());
	    t.setDate(t.getDate() - ((d + 6) % 7) + 3);
	    const isoYear = t.getUTCFullYear();
	    const w = Math.floor((t.getTime() - new Date(isoYear, 0, 1, -6)) / 864e5);
	    return [isoYear, 1 + Math.floor(w / 7), d > 0 ? d : 7];
	}

	function hour(hr, amPm) {
	    if (hr !== 12) return hr + (amPm === 'pm' ? 12 : 0);
	    return amPm === 'am' ? 0 : 12;
	}

	function date(sample) {
	    let format;
	    let errors = 0;
	    const matches = {};
	    const bestMatch = ['', 0];

	    sample = sample || [];

	    _$3.each(knownFormats, function(format, key) {
	        _$3.each(sample, function(n) {
	            if (matches[key] === undefined) matches[key] = 0;
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
	    const type = {
	        parse: function(raw) {
	            if (_$3.isDate(raw) || _$3.isUndefined(raw)) return raw;
	            if (!format || !_$3.isString(raw)) {
	                errors++;
	                return raw;
	            }

	            var m = parse(raw.toLowerCase(), format);

	            if (!m) {
	                errors++;
	                return raw;
	            } else {
	                // increment errors anyway if string doesn't match strict format
	                if (!test(raw, format)) errors++;
	            }

	            function guessTwoDigitYear(yr) {
	                yr = +yr;
	                if (yr < 30) return 2000 + yr;
	                else return 1900 + yr;
	            }

	            var curYear = new Date().getFullYear();

	            switch (format) {
	                case 'YYYY':
	                    return new Date(m[1], 0, 1);
	                case 'YYYY-H':
	                    return new Date(m[1], (m[2] - 1) * 6, 1);
	                case 'H-YYYY':
	                    return new Date(m[2], (m[1] - 1) * 6, 1);
	                case 'YYYY-Q':
	                    return new Date(m[1], (m[2] - 1) * 3, 1);
	                case 'Q-YYYY':
	                    return new Date(m[2], (m[1] - 1) * 3, 1);
	                case 'YYYY-M':
	                    return new Date(m[1], m[2] - 1, 1);
	                case 'M-YYYY':
	                    return new Date(m[2], m[1] - 1, 1);

	                case 'YYYY-MMM':
	                    return new Date(+m[1], shortMonthKey[m[2]], 1);
	                case 'MMM-YYYY':
	                    return new Date(+m[2], shortMonthKey[m[1]], 1);
	                case 'MMM-YY':
	                    return new Date(guessTwoDigitYear(+m[2]), shortMonthKey[m[1]], 1);
	                case 'MMM':
	                    return new Date(curYear, shortMonthKey[m[1]], 1);

	                case 'YYYY-WW':
	                    return dateFromIsoWeek(m[1], m[2], 1);
	                case 'WW-YYYY':
	                    return dateFromIsoWeek(m[2], m[1], 1);

	                case 'YYYY-WW-d':
	                    return dateFromIsoWeek(m[1], m[2], m[3]);
	                case 'YYYY-MM-DD':
	                    return new Date(m[1], m[3] - 1, m[4]);
	                case 'DD/MM/YYYY':
	                    return new Date(m[4], m[3] - 1, m[1]);
	                case 'DD/MMM/YYYY':
	                    return new Date(m[4], shortMonthKey[m[3]], m[1]);
	                case 'DD/MMM/YY':
	                    return new Date(guessTwoDigitYear(m[4]), shortMonthKey[m[3]], m[1]);
	                case 'MM/DD/YYYY':
	                    return new Date(m[4], m[1] - 1, m[3]);
	                case 'MM/DD/YY':
	                    return new Date(guessTwoDigitYear(m[4]), m[1] - 1, m[3]);
	                case 'DD/MM/YY':
	                    return new Date(guessTwoDigitYear(m[4]), m[3] - 1, m[1]);
	                case 'MMM-DD-YYYY':
	                    return new Date(m[3], shortMonthKey[m[1]], m[2]);

	                case 'YYYY-MM-DD HH:MM':
	                    return new Date(
	                        +m[1],
	                        m[3] - 1,
	                        +m[4],
	                        hour(+m[5], m[8]),
	                        +m[6] || 0,
	                        +m[7] || 0
	                    );
	                case 'DD.MM.YYYY HH:MM':
	                    return new Date(
	                        +m[4],
	                        m[3] - 1,
	                        +m[1],
	                        hour(+m[5], m[8]),
	                        +m[6] || 0,
	                        +m[7] || 0
	                    );
	                case 'MM/DD/YYYY HH:MM':
	                    return new Date(
	                        +m[4],
	                        m[1] - 1,
	                        +m[3],
	                        hour(+m[5], m[8]),
	                        +m[6] || 0,
	                        +m[7] || 0
	                    );

	                case 'ISO8601':
	                    return new Date(m.toUpperCase());

	                default:
	                    console.warn('unknown format', format);
	            }
	            errors++;
	            return raw;
	        },
	        toNum: function(d) {
	            return _$3.isDate(d) ? d.getTime() : Number.NaN;
	        },
	        fromNum: function(i) {
	            return new Date(i);
	        },
	        errors: function() {
	            return errors;
	        },
	        name: function() {
	            return 'date';
	        },

	        format: function(fmt) {
	            if (arguments.length) {
	                format = fmt;
	                return type;
	            }
	            return format;
	        },

	        precision: function() {
	            return knownFormats[format].precision;
	        },

	        // returns a function for formatting dates
	        formatter: function() {
	            if (!format) return _$3.identity;
	            var monthPattern = Globalize.culture().calendar.patterns.M.replace('MMMM', 'MMM');
	            switch (knownFormats[format].precision) {
	                case 'year':
	                    return function(d) {
	                        return !_$3.isDate(d) ? d : d.getFullYear();
	                    };
	                case 'half':
	                    return function(d) {
	                        return !_$3.isDate(d) ? d : d.getFullYear() + ' H' + (d.getMonth() / 6 + 1);
	                    };
	                case 'quarter':
	                    return function(d) {
	                        return !_$3.isDate(d) ? d : d.getFullYear() + ' Q' + (d.getMonth() / 3 + 1);
	                    };
	                case 'month':
	                    return function(d) {
	                        return !_$3.isDate(d) ? d : Globalize.format(d, 'MMM yy');
	                    };
	                case 'week':
	                    return function(d) {
	                        return !_$3.isDate(d)
	                            ? d
	                            : dateToIsoWeek(d)
	                                  .slice(0, 2)
	                                  .join(' W');
	                    };
	                case 'day':
	                    return function(d, verbose) {
	                        return !_$3.isDate(d) ? d : Globalize.format(d, verbose ? 'D' : 'd');
	                    };
	                case 'day-minutes':
	                    return function(d) {
	                        return !_$3.isDate(d)
	                            ? d
	                            : Globalize.format(d, monthPattern).replace(' ', '&nbsp;') +
	                                  ' - ' +
	                                  Globalize.format(d, 't').replace(' ', '&nbsp;');
	                    };
	                case 'day-seconds':
	                    return function(d) {
	                        return !_$3.isDate(d) ? d : Globalize.format(d, 'T').replace(' ', '&nbsp;');
	                    };
	            }
	        },

	        isValid: function(val) {
	            return _$3.isDate(type.parse(val));
	        },

	        ambiguousFormats: function() {
	            var candidates = [];
	            _$3.each(matches, function(cnt, fmt) {
	                if (cnt === bestMatch[1]) {
	                    candidates.push([fmt, fmt]); // key, label
	                }
	            });
	            return candidates;
	        }
	    };
	    return type;
	}

	var columnTypes = {
	    text,
	    number,
	    date
	};

	const TAGS$1 = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	const COMMENTS_AND_PHP_TAGS$1 = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	const defaultAllowed$1 = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

	/**
	 * Remove all non-whitelisted html tags from the given string
	 *
	 * @exports purifyHTML
	 * @kind function
	 *
	 * @param {string} input - dirty html input
	 * @param {string} allowed - list of allowed tags, defaults to `<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>`
	 * @return {string} - the cleaned html output
	 */
	function purifyHTML$1(input, allowed) {
	    /*
	     * written by Kevin van Zonneveld et.al.
	     * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
	     */
	    if (input === null) return null;
	    if (input === undefined) return undefined;
	    input = String(input);
	    // strip tags
	    if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
	        return input;
	    }
	    input = stripTags$1(input, allowed);
	    // remove all event attributes
	    if (typeof document === 'undefined') return input;
	    var d = document.createElement('div');
	    d.innerHTML = input;
	    var sel = d.querySelectorAll('*');
	    for (var i = 0; i < sel.length; i++) {
	        if (sel[i].nodeName.toLowerCase() === 'a') {
	            // special treatment for <a> elements
	            if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
	            sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
	            if (
	                sel[i].getAttribute('href') &&
	                sel[i]
	                    .getAttribute('href')
	                    .trim()
	                    .startsWith('javascript:')
	            ) {
	                // remove entire href to be safe
	                sel[i].setAttribute('href', '');
	            }
	        }
	        for (var j = 0; j < sel[i].attributes.length; j++) {
	            var attrib = sel[i].attributes[j];
	            if (attrib.specified) {
	                if (attrib.name.substr(0, 2) === 'on') sel[i].removeAttribute(attrib.name);
	            }
	        }
	    }
	    return d.innerHTML;
	}

	function stripTags$1(input, allowed) {
	    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	    allowed = (
	        ((allowed !== undefined ? allowed || '' : defaultAllowed$1) + '')
	            .toLowerCase()
	            .match(/<[a-z][a-z0-9]*>/g) || []
	    ).join('');

	    var before = input;
	    var after = input;
	    // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
	    while (true) {
	        before = after;
	        after = before.replace(COMMENTS_AND_PHP_TAGS$1, '').replace(TAGS$1, function($0, $1) {
	            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	        });
	        // return once no more tags are removed
	        if (before === after) {
	            return after;
	        }
	    }
	}

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

	/**
	 * @class dw.Column
	 */
	function column(name, rows, type) {
	    function notEmpty(d) {
	        return d !== null && d !== undefined && d !== '';
	    }

	    function guessType(sample) {
	        if (_$3.every(rows, _$3.isNumber)) return columnTypes.number();
	        if (_$3.every(rows, _$3.isDate)) return columnTypes.date();
	        // guessing column type by counting parsing errors
	        // for every known type
	        const types = [columnTypes.date(sample), columnTypes.number(sample), columnTypes.text()];
	        let type;
	        const tolerance = 0.1 * rows.filter(notEmpty).length; // allowing 10% mis-parsed values

	        _$3.each(rows, function(val) {
	            _$3.each(types, function(t) {
	                t.parse(val);
	            });
	        });
	        _$3.every(types, function(t) {
	            if (t.errors() < tolerance) type = t;
	            return !type;
	        });
	        if (_$3.isUndefined(type)) type = types[2]; // default to text;
	        return type;
	    }

	    // we pick random 200 non-empty values for column type testing
	    const sample = _$3.shuffle(_$3.range(rows.length))
	        .filter(function(i) {
	            return notEmpty(rows[i]);
	        })
	        .slice(0, 200)
	        .map(function(i) {
	            return rows[i];
	        });

	    type = type ? columnTypes[type](sample) : guessType(sample);

	    let range, sum, mean, median;
	    const origRows = rows.slice(0);
	    let title;

	    // public interface
	    var column = {
	        // column name (used for reference in chart metadata)
	        name() {
	            if (arguments.length) {
	                name = arguments[0];
	                return column;
	            }
	            return purifyHTML$1(name);
	        },

	        // column title (used for presentation)
	        title() {
	            if (arguments.length) {
	                title = arguments[0];
	                return column;
	            }
	            return purifyHTML$1(title || name);
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
	        val(i, unfiltered) {
	            if (!arguments.length) return undefined;
	            var r = unfiltered ? origRows : rows;
	            if (i < 0) i += r.length;
	            return type.parse(_$3.isDate(r[i]) || _$3.isNumber(r[i]) ? r[i] : purifyHTML$1(r[i]));
	        },

	        /*
	         * returns an array of parsed values
	         */
	        values(unfiltered) {
	            var r = unfiltered ? origRows : rows;
	            r = _$3.map(r, function(d) {
	                return _$3.isDate(d) || _$3.isNumber(d) ? d : purifyHTML$1(d);
	            });
	            return _$3.map(r, type.parse);
	        },

	        /**
	         * apply function to each value
	         */
	        each(f) {
	            for (var i = 0; i < rows.length; i++) {
	                f(column.val(i), i);
	            }
	        },

	        // access to raw values
	        raw(i, val) {
	            if (!arguments.length)
	                return rows.map(d => (_$3.isDate(d) || _$3.isNumber(d) ? d : purifyHTML$1(d)));
	            if (arguments.length === 2) {
	                rows[i] = val;
	                return column;
	            }
	            return _$3.isDate(rows[i]) || _$3.isNumber(rows[i]) ? rows[i] : purifyHTML$1(rows[i]);
	        },

	        /**
	         * if called with no arguments, this returns the column type name
	         * if called with true as argument, this returns the column type (as object)
	         * if called with a string as argument, this sets a new column type
	         */
	        type(o) {
	            if (o === true) return type;
	            if (_$3.isString(o)) {
	                if (columnTypes[o]) {
	                    type = columnTypes[o](sample);
	                    return column;
	                } else {
	                    throw new Error('unknown column type: ' + o);
	                }
	            }
	            return type.name();
	        },

	        // [min,max] range
	        range() {
	            if (!type.toNum) return false;
	            if (!range) {
	                range = [Number.MAX_VALUE, -Number.MAX_VALUE];
	                column.each(function(v) {
	                    v = type.toNum(v);
	                    if (!_$3.isNumber(v) || _$3.isNaN(v)) return;
	                    if (v < range[0]) range[0] = v;
	                    if (v > range[1]) range[1] = v;
	                });
	                range[0] = type.fromNum(range[0]);
	                range[1] = type.fromNum(range[1]);
	            }
	            return range;
	        },
	        // sum of values
	        sum() {
	            if (!type.toNum) return false;
	            if (sum === undefined) {
	                sum = 0;
	                column.each(function(v) {
	                    const n = type.toNum(v);
	                    if (Number.isFinite(n)) {
	                        sum += n;
	                    }
	                });
	                sum = type.fromNum(sum);
	            }
	            return sum;
	        },

	        mean() {
	            if (!type.toNum) return false;
	            if (mean === undefined) {
	                mean = 0;
	                let count = 0;
	                column.each(function(v) {
	                    const n = type.toNum(v);
	                    if (Number.isFinite(n)) {
	                        mean += n;
	                        count++;
	                    }
	                });
	                mean = type.fromNum(mean / count);
	            }
	            return mean;
	        },

	        median() {
	            if (!type.toNum) return false;
	            if (median === undefined) {
	                const arr = column.values().map(type.toNum);
	                median = type.fromNum(d3Median(arr));
	            }
	            return median;
	        },

	        // remove rows from column, keep those whose index
	        // is within @r
	        filterRows(r) {
	            rows = [];
	            if (arguments.length) {
	                _$3.each(r, function(i) {
	                    rows.push(origRows[i]);
	                });
	            } else {
	                rows = origRows.slice(0);
	            }
	            column.length = rows.length;
	            // invalidate range and total
	            range = sum = mean = median = undefined;
	            return column;
	        },

	        toString() {
	            return name + ' (' + type.name() + ')';
	        },

	        indexOf(val) {
	            return _$3.find(_$3.range(rows.length), function(i) {
	                return column.val(i) === val;
	            });
	        },

	        limitRows(numRows) {
	            if (origRows.length > numRows) {
	                origRows.length = numRows;
	                rows.length = numRows;
	                column.length = numRows;
	            }
	        }
	    };
	    // backwards compatibility
	    column.total = column.sum;
	    return column;
	}

	// some d3 stuff
	function d3Median(array) {
	    var numbers = [];
	    var n = array.length;
	    var a;
	    var i = -1;
	    if (arguments.length === 1) {
	        while (++i < n) if (d3Numeric((a = d3Number(array[i])))) numbers.push(a);
	    }
	    if (numbers.length) return d3Quantile(numbers.sort(d3Ascending), 0.5);
	}
	function d3Quantile(values, p) {
	    var H = (values.length - 1) * p + 1;
	    var h = Math.floor(H);
	    var v = +values[h - 1];
	    var e = H - h;
	    return e ? v + e * (values[h] - v) : v;
	}
	function d3Number(x) {
	    return x === null ? NaN : +x;
	}
	function d3Numeric(x) {
	    return !isNaN(x);
	}
	function d3Ascending(a, b) {
	    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	/*
	 * dataset source for delimited files (CSV, TSV, ...)
	 */

	function delimited(opts) {
	    function loadAndParseCsv() {
	        if (opts.url) {
	            const ts = new Date().getTime();
	            const url = `${opts.url}${opts.url.indexOf('?') > -1 ? '&' : '?'}v=${
                opts.url.indexOf('//static.dwcdn.net') > -1 ? ts - (ts % 60000) : ts
            }`;
	            return window
	                .fetch(url)
	                .then(res => res.text())
	                .then(raw => {
	                    return new DelimitedParser(opts).parse(raw);
	                });
	        } else if (opts.csv || opts.csv === '') {
	            const dfd = new Promise(resolve => {
	                resolve(opts.csv);
	            });
	            const parsed = dfd.then(raw => {
	                return new DelimitedParser(opts).parse(raw);
	            });
	            return parsed;
	        }
	        throw new Error('you need to provide either an URL or CSV data.');
	    }

	    return {
	        dataset: loadAndParseCsv,
	        parse: function() {
	            return new DelimitedParser(opts).parse(opts.csv);
	        }
	    };
	}

	dataset.delimited = delimited;

	class DelimitedParser {
	    constructor(opts) {
	        opts = Object.assign(
	            {
	                delimiter: 'auto',
	                quoteChar: '"',
	                skipRows: 0,
	                emptyValue: null,
	                transpose: false,
	                firstRowIsHeader: true
	            },
	            opts
	        );

	        this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
	        this.opts = opts;
	    }

	    parse(data) {
	        this.__rawData = data;
	        const opts = this.opts;

	        if (opts.delimiter === 'auto') {
	            opts.delimiter = this.guessDelimiter(data, opts.skipRows);
	            this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
	        }
	        const closure = opts.delimiter !== '|' ? '|' : '#';
	        let arrData;

	        data = closure + '\n' + data.replace(/[ \r\n\f]+$/g, '') + closure;

	        function parseCSV(delimiterPattern, strData, strDelimiter) {
	            // implementation and regex borrowed from:
	            // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

	            // Check to see if the delimiter is defined. If not,
	            // then default to comma.
	            strDelimiter = strDelimiter || ',';

	            // Create an array to hold our data. Give the array
	            // a default empty first row.
	            let arrData = [[]];

	            // Create an array to hold our individual pattern
	            // matching groups.
	            let arrMatches = null;
	            let strMatchedValue;

	            // Keep looping over the regular expression matches
	            // until we can no longer find a match.
	            while ((arrMatches = delimiterPattern.exec(strData))) {
	                // Get the delimiter that was found.
	                var strMatchedDelimiter = arrMatches[1];

	                // Check to see if the given delimiter has a length
	                // (is not the start of string) and if it matches
	                // field delimiter. If id does not, then we know
	                // that this delimiter is a row delimiter.
	                if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
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
	                    strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
	                } else {
	                    // We found a non-quoted value.
	                    strMatchedValue = arrMatches[3];
	                }

	                // Now that we have our value string, let's add
	                // it to the data array.
	                arrData[arrData.length - 1].push(
	                    strMatchedValue === undefined ? '' : strMatchedValue
	                );
	            }

	            // remove closure
	            if (arrData[0][0].substr(0, 1) === closure) {
	                arrData[0][0] = arrData[0][0].substr(1);
	            }
	            const p = arrData.length - 1;
	            const q = arrData[p].length - 1;
	            const r = arrData[p][q].length - 1;
	            if (arrData[p][q].substr(r) === closure) {
	                arrData[p][q] = arrData[p][q].substr(0, r);
	            }

	            // Return the parsed data.
	            return arrData.slice(1);
	        } // end parseCSV

	        function transpose(arrMatrix) {
	            // borrowed from:
	            // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
	            const a = arrMatrix;
	            const w = a.length ? a.length : 0;
	            const h = a[0] instanceof Array ? a[0].length : 0;
	            if (h === 0 || w === 0) {
	                return [];
	            }
	            let i, j;
	            let t = [];
	            for (i = 0; i < h; i++) {
	                t[i] = [];
	                for (j = 0; j < w; j++) {
	                    t[i][j] = a[j][i];
	                }
	            }
	            return t;
	        }

	        function makeDataset(arrData) {
	            let columns = [];
	            const columnNames = {};
	            const rowCount = arrData.length;
	            const columnCount = arrData[0].length;
	            let rowIndex = opts.skipRows;

	            // compute series
	            var srcColumns = [];
	            if (opts.firstRowIsHeader) {
	                srcColumns = arrData[rowIndex];
	                rowIndex++;
	            }

	            // check that columns names are unique and not empty

	            for (var c = 0; c < columnCount; c++) {
	                let col = _$3.isString(srcColumns[c]) ? srcColumns[c].replace(/^\s+|\s+$/g, '') : '';
	                let suffix = col !== '' ? '' : 1;
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

	            _$3.range(rowIndex, rowCount).forEach(row => {
	                columns.forEach((c, i) => {
	                    c.data.push(arrData[row][i] !== '' ? arrData[row][i] : opts.emptyValue);
	                });
	            });

	            columns = columns.map(c => column(c.name, c.data));
	            return dataset(columns);
	        } // end makeDataset

	        arrData = parseCSV(this.__delimiterPatterns, data, opts.delimiter);
	        if (opts.transpose) {
	            arrData = transpose(arrData);
	        }
	        return makeDataset(arrData);
	    } // end parse

	    guessDelimiter(strData) {
	        // find delimiter which occurs most often
	        let maxMatchCount = 0;
	        let k = -1;
	        const me = this;
	        const delimiters = ['\t', ';', '|', ','];
	        delimiters.forEach((delimiter, i) => {
	            const regex = getDelimiterPatterns(delimiter, me.quoteChar);
	            let c = strData.match(regex).length;
	            if (delimiter === '\t') c *= 1.15; // give tab delimiters more weight
	            if (c > maxMatchCount) {
	                maxMatchCount = c;
	                k = i;
	            }
	        });
	        return delimiters[k];
	    }
	}

	function getDelimiterPatterns(delimiter, quoteChar) {
	    return new RegExp(
	        // Delimiters.
	        '(\\' +
	            delimiter +
	            '|\\r?\\n|\\r|^)' +
	            // Quoted fields.
	            '(?:' +
	            quoteChar +
	            '([^' +
	            quoteChar +
	            ']*(?:' +
	            quoteChar +
	            '"[^' +
	            quoteChar +
	            ']*)*)' +
	            quoteChar +
	            '|' +
	            // Standard fields.
	            '([^' +
	            quoteChar +
	            '\\' +
	            delimiter +
	            '\\r\\n]*))',
	        'gi'
	    );
	}

	/* globals fetch */

	/*
	 * dataset source for JSON data
	 */
	function json(opts) {
	    function loadAndParseJSON() {
	        if (opts.url) {
	            return fetch(opts.url)
	                .then(res => res.text())
	                .then(raw => {
	                    return JSON.parse(raw);
	                });
	        } else if (opts.csv) {
	            const dfd = new Promise(resolve => {
	                resolve(opts.csv);
	            });
	            const parsed = dfd.then(raw => {
	                return JSON.parse(raw);
	            });
	            return parsed;
	        }
	        throw new Error('you need to provide either an URL or CSV data.');
	    }

	    return {
	        dataset: loadAndParseJSON,
	        parse: function() {
	            return JSON.parse(opts.csv);
	        }
	    };
	}

	dataset.json = json;

	function reorderColumns(chart, dataset) {
	    var order = chart.getMetadata('data.column-order', []);
	    if (order.length && order.length === dataset.numColumns()) {
	        dataset.columnOrder(order);
	    }
	    return dataset;
	}

	function applyChanges(chart, dataset) {
	    var changes = chart.getMetadata('data.changes', []);
	    var transpose = chart.getMetadata('data.transpose', false);
	    // apply changes
	    changes.forEach(change => {
	        let row = 'row';
	        let column = 'column';
	        if (transpose) {
	            row = 'column';
	            column = 'row';
	        }

	        if (dataset.hasColumn(change[column])) {
	            change.ignored = false;
	            if (change[row] === 0) {
	                if (change.previous && change.previous !== 'undefined') {
	                    const oldTitle = dataset.column(change[column]).title();
	                    if (oldTitle !== change.previous) {
	                        // something is buggy about this, let's revisit later
	                        // change.ignored = true;
	                        return;
	                    }
	                }
	                dataset.column(change[column]).title(change.value);
	            } else {
	                if (change.previous && change.previous !== 'undefined') {
	                    const curValue = dataset.column(change[column]).raw(change[row] - 1);
	                    if (curValue !== change.previous) {
	                        // something is buggy about this, let's revisit later
	                        // change.ignored = true;
	                        return;
	                    }
	                }
	                dataset.column(change[column]).raw(change[row] - 1, change.value);
	            }
	        }
	    });

	    // overwrite column types
	    var columnFormats = chart.getMetadata('data.column-format', {});
	    _$3.each(columnFormats, (columnFormat, key) => {
	        if (columnFormat.type && dataset.hasColumn(key) && columnFormat.type !== 'auto') {
	            dataset.column(key).type(columnFormat.type);
	        }
	        if (columnFormat['input-format'] && dataset.hasColumn(key)) {
	            dataset
	                .column(key)
	                .type(true)
	                .format(columnFormat['input-format']);
	        }
	    });
	    return dataset;
	}

	/**
	 * converts a column name to a variable name that can be used in the custom
	 * column editor. variable names can't contain spaces and special characters
	 * and are also converted to lowercase.
	 *
	 * @exports columnNameToVariable
	 * @kind function
	 *
	 * @example
	 * import columnNameToVariable from '@datawrapper/shared/columnNameToVariable';
	 *
	 * columnNameToVariable('GDP (per cap.)') // gdp_per_cap
	 *
	 * @param {string} name -- name of the column
	 * @returns {string} -- variable name
	 */
	function columnNameToVariable(name) {
	    return name
	        .toString()
	        .toLowerCase()
	        .replace(/\s+/g, '_') // Replace spaces with _
	        .replace(/[^\w-]+/g, '') // Remove all non-word chars
	        .replace(/-/g, '_') // Replace multiple - with single -
	        .replace(/__+/g, '_') // Replace multiple - with single -
	        .replace(/^_+/, '') // Trim - from start of text
	        .replace(/_+$/, '') // Trim - from end of text
	        .replace(/^(\d)/, '_$1') // If first char is a number, prefix with _
	        .replace(/^(and|or|in|true|false)$/, '$1_'); // avoid reserved keywords
	}

	/**
	 * Safely access object properties without throwing nasty
	 * `cannot access X of undefined` errors if a property along the
	 * way doesn't exist.
	 *
	 * @exports get
	 * @kind function
	 *
	 *
	 * @param object - the object which properties you want to acccess
	 * @param {String} key - dot-separated keys aka "path" to the property
	 * @param {*} _default - the fallback value to be returned if key doesn't exist
	 *
	 * @returns the value
	 *
	 * @example
	 * import get from '@datawrapper/shared/get';
	 * const someObject = { key: { list: ['a', 'b', 'c']}};
	 * get(someObject, 'key.list[2]') // returns 'c'
	 * get(someObject, 'missing.key') // returns undefined
	 * get(someObject, 'missing.key', false) // returns false
	 */
	function get$3(object, key = null, _default = null) {
	    if (!key) return object;
	    // expand keys
	    const keys = key.split('.');
	    let pt = object;

	    for (let i = 0; i < keys.length; i++) {
	        if (pt === null || pt === undefined) break; // break out of the loop
	        // move one more level in
	        pt = pt[keys[i]];
	    }
	    return pt === undefined || pt === null ? _default : pt;
	}

	var TEOF = 'TEOF';
	var TOP = 'TOP';
	var TNUMBER = 'TNUMBER';
	var TSTRING = 'TSTRING';
	var TPAREN = 'TPAREN';
	var TBRACKET = 'TBRACKET';
	var TCOMMA = 'TCOMMA';
	var TNAME = 'TNAME';
	var TSEMICOLON = 'TSEMICOLON';

	function Token(type, value, index) {
	  this.type = type;
	  this.value = value;
	  this.index = index;
	}

	Token.prototype.toString = function () {
	  return this.type + ': ' + this.value;
	};

	function TokenStream(parser, expression) {
	  this.pos = 0;
	  this.current = null;
	  this.unaryOps = parser.unaryOps;
	  this.binaryOps = parser.binaryOps;
	  this.ternaryOps = parser.ternaryOps;
	  this.consts = parser.consts;
	  this.expression = expression;
	  this.savedPosition = 0;
	  this.savedCurrent = null;
	  this.options = parser.options;
	  this.parser = parser;
	}

	TokenStream.prototype.newToken = function (type, value, pos) {
	  return new Token(type, value, pos != null ? pos : this.pos);
	};

	TokenStream.prototype.save = function () {
	  this.savedPosition = this.pos;
	  this.savedCurrent = this.current;
	};

	TokenStream.prototype.restore = function () {
	  this.pos = this.savedPosition;
	  this.current = this.savedCurrent;
	};

	TokenStream.prototype.next = function () {
	  if (this.pos >= this.expression.length) {
	    return this.newToken(TEOF, 'EOF');
	  }

	  if (this.isWhitespace() || this.isComment()) {
	    return this.next();
	  } else if (this.isRadixInteger() ||
	      this.isNumber() ||
	      this.isOperator() ||
	      this.isString() ||
	      this.isParen() ||
	      this.isBracket() ||
	      this.isComma() ||
	      this.isSemicolon() ||
	      this.isNamedOp() ||
	      this.isConst() ||
	      this.isName()) {
	    return this.current;
	  } else {
	    this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
	  }
	};

	TokenStream.prototype.isString = function () {
	  var r = false;
	  var startPos = this.pos;
	  var quote = this.expression.charAt(startPos);

	  if (quote === '\'' || quote === '"') {
	    var index = this.expression.indexOf(quote, startPos + 1);
	    while (index >= 0 && this.pos < this.expression.length) {
	      this.pos = index + 1;
	      if (this.expression.charAt(index - 1) !== '\\') {
	        var rawString = this.expression.substring(startPos + 1, index);
	        this.current = this.newToken(TSTRING, this.unescape(rawString), startPos);
	        r = true;
	        break;
	      }
	      index = this.expression.indexOf(quote, index + 1);
	    }
	  }
	  return r;
	};

	TokenStream.prototype.isParen = function () {
	  var c = this.expression.charAt(this.pos);
	  if (c === '(' || c === ')') {
	    this.current = this.newToken(TPAREN, c);
	    this.pos++;
	    return true;
	  }
	  return false;
	};

	TokenStream.prototype.isBracket = function () {
	  var c = this.expression.charAt(this.pos);
	  if ((c === '[' || c === ']') && this.isOperatorEnabled('[')) {
	    this.current = this.newToken(TBRACKET, c);
	    this.pos++;
	    return true;
	  }
	  return false;
	};

	TokenStream.prototype.isComma = function () {
	  var c = this.expression.charAt(this.pos);
	  if (c === ',') {
	    this.current = this.newToken(TCOMMA, ',');
	    this.pos++;
	    return true;
	  }
	  return false;
	};

	TokenStream.prototype.isSemicolon = function () {
	  var c = this.expression.charAt(this.pos);
	  if (c === ';') {
	    this.current = this.newToken(TSEMICOLON, ';');
	    this.pos++;
	    return true;
	  }
	  return false;
	};

	TokenStream.prototype.isConst = function () {
	  var startPos = this.pos;
	  var i = startPos;
	  for (; i < this.expression.length; i++) {
	    var c = this.expression.charAt(i);
	    if (c.toUpperCase() === c.toLowerCase()) {
	      if (i === this.pos || (c !== '_' && c !== '.' && (c < '0' || c > '9'))) {
	        break;
	      }
	    }
	  }
	  if (i > startPos) {
	    var str = this.expression.substring(startPos, i);
	    if (str in this.consts) {
	      this.current = this.newToken(TNUMBER, this.consts[str]);
	      this.pos += str.length;
	      return true;
	    }
	  }
	  return false;
	};

	TokenStream.prototype.isNamedOp = function () {
	  var startPos = this.pos;
	  var i = startPos;
	  for (; i < this.expression.length; i++) {
	    var c = this.expression.charAt(i);
	    if (c.toUpperCase() === c.toLowerCase()) {
	      if (i === this.pos || (c !== '_' && (c < '0' || c > '9'))) {
	        break;
	      }
	    }
	  }
	  if (i > startPos) {
	    var str = this.expression.substring(startPos, i);
	    if (this.isOperatorEnabled(str) && (str in this.binaryOps || str in this.unaryOps || str in this.ternaryOps)) {
	      this.current = this.newToken(TOP, str);
	      this.pos += str.length;
	      return true;
	    }
	  }
	  return false;
	};

	TokenStream.prototype.isName = function () {
	  var startPos = this.pos;
	  var i = startPos;
	  var hasLetter = false;
	  for (; i < this.expression.length; i++) {
	    var c = this.expression.charAt(i);
	    if (c.toUpperCase() === c.toLowerCase()) {
	      if (i === this.pos && (c === '$' || c === '_')) {
	        if (c === '_') {
	          hasLetter = true;
	        }
	        continue;
	      } else if (i === this.pos || !hasLetter || (c !== '_' && (c < '0' || c > '9'))) {
	        break;
	      }
	    } else {
	      hasLetter = true;
	    }
	  }
	  if (hasLetter) {
	    var str = this.expression.substring(startPos, i);
	    this.current = this.newToken(TNAME, str);
	    this.pos += str.length;
	    return true;
	  }
	  return false;
	};

	TokenStream.prototype.isWhitespace = function () {
	  var r = false;
	  var c = this.expression.charAt(this.pos);
	  while (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
	    r = true;
	    this.pos++;
	    if (this.pos >= this.expression.length) {
	      break;
	    }
	    c = this.expression.charAt(this.pos);
	  }
	  return r;
	};

	var codePointPattern = /^[0-9a-f]{4}$/i;

	TokenStream.prototype.unescape = function (v) {
	  var index = v.indexOf('\\');
	  if (index < 0) {
	    return v;
	  }

	  var buffer = v.substring(0, index);
	  while (index >= 0) {
	    var c = v.charAt(++index);
	    switch (c) {
	      case '\'':
	        buffer += '\'';
	        break;
	      case '"':
	        buffer += '"';
	        break;
	      case '\\':
	        buffer += '\\';
	        break;
	      case '/':
	        buffer += '/';
	        break;
	      case 'b':
	        buffer += '\b';
	        break;
	      case 'f':
	        buffer += '\f';
	        break;
	      case 'n':
	        buffer += '\n';
	        break;
	      case 'r':
	        buffer += '\r';
	        break;
	      case 't':
	        buffer += '\t';
	        break;
	      case 'u':
	        // interpret the following 4 characters as the hex of the unicode code point
	        var codePoint = v.substring(index + 1, index + 5);
	        if (!codePointPattern.test(codePoint)) {
	          this.parseError('Illegal escape sequence: \\u' + codePoint);
	        }
	        buffer += String.fromCharCode(parseInt(codePoint, 16));
	        index += 4;
	        break;
	      default:
	        throw this.parseError('Illegal escape sequence: "\\' + c + '"');
	    }
	    ++index;
	    var backslash = v.indexOf('\\', index);
	    buffer += v.substring(index, backslash < 0 ? v.length : backslash);
	    index = backslash;
	  }

	  return buffer;
	};

	TokenStream.prototype.isComment = function () {
	  var c = this.expression.charAt(this.pos);
	  if (c === '/' && this.expression.charAt(this.pos + 1) === '*') {
	    this.pos = this.expression.indexOf('*/', this.pos) + 2;
	    if (this.pos === 1) {
	      this.pos = this.expression.length;
	    }
	    return true;
	  }
	  return false;
	};

	TokenStream.prototype.isRadixInteger = function () {
	  var pos = this.pos;

	  if (pos >= this.expression.length - 2 || this.expression.charAt(pos) !== '0') {
	    return false;
	  }
	  ++pos;

	  var radix;
	  var validDigit;
	  if (this.expression.charAt(pos) === 'x') {
	    radix = 16;
	    validDigit = /^[0-9a-f]$/i;
	    ++pos;
	  } else if (this.expression.charAt(pos) === 'b') {
	    radix = 2;
	    validDigit = /^[01]$/i;
	    ++pos;
	  } else {
	    return false;
	  }

	  var valid = false;
	  var startPos = pos;

	  while (pos < this.expression.length) {
	    var c = this.expression.charAt(pos);
	    if (validDigit.test(c)) {
	      pos++;
	      valid = true;
	    } else {
	      break;
	    }
	  }

	  if (valid) {
	    this.current = this.newToken(TNUMBER, parseInt(this.expression.substring(startPos, pos), radix));
	    this.pos = pos;
	  }
	  return valid;
	};

	TokenStream.prototype.isNumber = function () {
	  var valid = false;
	  var pos = this.pos;
	  var startPos = pos;
	  var resetPos = pos;
	  var foundDot = false;
	  var foundDigits = false;
	  var c;

	  while (pos < this.expression.length) {
	    c = this.expression.charAt(pos);
	    if ((c >= '0' && c <= '9') || (!foundDot && c === '.')) {
	      if (c === '.') {
	        foundDot = true;
	      } else {
	        foundDigits = true;
	      }
	      pos++;
	      valid = foundDigits;
	    } else {
	      break;
	    }
	  }

	  if (valid) {
	    resetPos = pos;
	  }

	  if (c === 'e' || c === 'E') {
	    pos++;
	    var acceptSign = true;
	    var validExponent = false;
	    while (pos < this.expression.length) {
	      c = this.expression.charAt(pos);
	      if (acceptSign && (c === '+' || c === '-')) {
	        acceptSign = false;
	      } else if (c >= '0' && c <= '9') {
	        validExponent = true;
	        acceptSign = false;
	      } else {
	        break;
	      }
	      pos++;
	    }

	    if (!validExponent) {
	      pos = resetPos;
	    }
	  }

	  if (valid) {
	    this.current = this.newToken(TNUMBER, parseFloat(this.expression.substring(startPos, pos)));
	    this.pos = pos;
	  } else {
	    this.pos = resetPos;
	  }
	  return valid;
	};

	TokenStream.prototype.isOperator = function () {
	  var startPos = this.pos;
	  var c = this.expression.charAt(this.pos);

	  if (c === '+' || c === '-' || c === '*' || c === '/' || c === '%' || c === '^' || c === '?' || c === ':' || c === '.') {
	    this.current = this.newToken(TOP, c);
	  } else if (c === '∙' || c === '•') {
	    this.current = this.newToken(TOP, '*');
	  } else if (c === '>') {
	    if (this.expression.charAt(this.pos + 1) === '=') {
	      this.current = this.newToken(TOP, '>=');
	      this.pos++;
	    } else {
	      this.current = this.newToken(TOP, '>');
	    }
	  } else if (c === '<') {
	    if (this.expression.charAt(this.pos + 1) === '=') {
	      this.current = this.newToken(TOP, '<=');
	      this.pos++;
	    } else {
	      this.current = this.newToken(TOP, '<');
	    }
	  } else if (c === '|') {
	    if (this.expression.charAt(this.pos + 1) === '|') {
	      this.current = this.newToken(TOP, '||');
	      this.pos++;
	    } else {
	      return false;
	    }
	  } else if (c === '=') {
	    if (this.expression.charAt(this.pos + 1) === '=') {
	      this.current = this.newToken(TOP, '==');
	      this.pos++;
	    } else {
	      this.current = this.newToken(TOP, c);
	    }
	  } else if (c === '!') {
	    if (this.expression.charAt(this.pos + 1) === '=') {
	      this.current = this.newToken(TOP, '!=');
	      this.pos++;
	    } else {
	      this.current = this.newToken(TOP, c);
	    }
	  } else {
	    return false;
	  }
	  this.pos++;

	  if (this.isOperatorEnabled(this.current.value)) {
	    return true;
	  } else {
	    this.pos = startPos;
	    return false;
	  }
	};

	TokenStream.prototype.isOperatorEnabled = function (op) {
	  return this.parser.isOperatorEnabled(op);
	};

	TokenStream.prototype.getCoordinates = function () {
	  var line = 0;
	  var column;
	  var newline = -1;
	  do {
	    line++;
	    column = this.pos - newline;
	    newline = this.expression.indexOf('\n', newline + 1);
	  } while (newline >= 0 && newline < this.pos);

	  return {
	    line: line,
	    column: column
	  };
	};

	TokenStream.prototype.parseError = function (msg) {
	  var coords = this.getCoordinates();
	  throw new Error('parse error [' + coords.line + ':' + coords.column + ']: ' + msg);
	};

	var INUMBER = 'INUMBER';
	var IOP1 = 'IOP1';
	var IOP2 = 'IOP2';
	var IOP3 = 'IOP3';
	var IVAR = 'IVAR';
	var IVARNAME = 'IVARNAME';
	var IFUNCALL = 'IFUNCALL';
	var IFUNDEF = 'IFUNDEF';
	var IEXPR = 'IEXPR';
	var IEXPREVAL = 'IEXPREVAL';
	var IMEMBER = 'IMEMBER';
	var IENDSTATEMENT = 'IENDSTATEMENT';
	var IARRAY = 'IARRAY';

	function Instruction(type, value) {
	  this.type = type;
	  this.value = (value !== undefined && value !== null) ? value : 0;
	}

	Instruction.prototype.toString = function () {
	  switch (this.type) {
	    case INUMBER:
	    case IOP1:
	    case IOP2:
	    case IOP3:
	    case IVAR:
	    case IVARNAME:
	    case IENDSTATEMENT:
	      return this.value;
	    case IFUNCALL:
	      return 'CALL ' + this.value;
	    case IFUNDEF:
	      return 'DEF ' + this.value;
	    case IARRAY:
	      return 'ARRAY ' + this.value;
	    case IMEMBER:
	      return '.' + this.value;
	    default:
	      return 'Invalid Instruction';
	  }
	};

	function unaryInstruction(value) {
	  return new Instruction(IOP1, value);
	}

	function binaryInstruction(value) {
	  return new Instruction(IOP2, value);
	}

	function ternaryInstruction(value) {
	  return new Instruction(IOP3, value);
	}

	function contains$1(array, obj) {
	  for (var i = 0; i < array.length; i++) {
	    if (array[i] === obj) {
	      return true;
	    }
	  }
	  return false;
	}

	function ParserState(parser, tokenStream, options) {
	  this.parser = parser;
	  this.tokens = tokenStream;
	  this.current = null;
	  this.nextToken = null;
	  this.next();
	  this.savedCurrent = null;
	  this.savedNextToken = null;
	  this.allowMemberAccess = options.allowMemberAccess !== false;
	}

	ParserState.prototype.next = function () {
	  this.current = this.nextToken;
	  return (this.nextToken = this.tokens.next());
	};

	ParserState.prototype.tokenMatches = function (token, value) {
	  if (typeof value === 'undefined') {
	    return true;
	  } else if (Array.isArray(value)) {
	    return contains$1(value, token.value);
	  } else if (typeof value === 'function') {
	    return value(token);
	  } else {
	    return token.value === value;
	  }
	};

	ParserState.prototype.save = function () {
	  this.savedCurrent = this.current;
	  this.savedNextToken = this.nextToken;
	  this.tokens.save();
	};

	ParserState.prototype.restore = function () {
	  this.tokens.restore();
	  this.current = this.savedCurrent;
	  this.nextToken = this.savedNextToken;
	};

	ParserState.prototype.accept = function (type, value) {
	  if (this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
	    this.next();
	    return true;
	  }
	  return false;
	};

	ParserState.prototype.expect = function (type, value) {
	  if (!this.accept(type, value)) {
	    var coords = this.tokens.getCoordinates();
	    throw new Error('parse error [' + coords.line + ':' + coords.column + ']: Expected ' + (value || type));
	  }
	};

	ParserState.prototype.parseAtom = function (instr) {
	  var unaryOps = this.tokens.unaryOps;
	  function isPrefixOperator(token) {
	    return token.value in unaryOps;
	  }

	  if (this.accept(TNAME) || this.accept(TOP, isPrefixOperator)) {
	    instr.push(new Instruction(IVAR, this.current.value));
	  } else if (this.accept(TNUMBER)) {
	    instr.push(new Instruction(INUMBER, this.current.value));
	  } else if (this.accept(TSTRING)) {
	    instr.push(new Instruction(INUMBER, this.current.value));
	  } else if (this.accept(TPAREN, '(')) {
	    this.parseExpression(instr);
	    this.expect(TPAREN, ')');
	  } else if (this.accept(TBRACKET, '[')) {
	    if (this.accept(TBRACKET, ']')) {
	      instr.push(new Instruction(IARRAY, 0));
	    } else {
	      var argCount = this.parseArrayList(instr);
	      instr.push(new Instruction(IARRAY, argCount));
	    }
	  } else {
	    throw new Error('unexpected ' + this.nextToken);
	  }
	};

	ParserState.prototype.parseExpression = function (instr) {
	  var exprInstr = [];
	  if (this.parseUntilEndStatement(instr, exprInstr)) {
	    return;
	  }
	  this.parseVariableAssignmentExpression(exprInstr);
	  if (this.parseUntilEndStatement(instr, exprInstr)) {
	    return;
	  }
	  this.pushExpression(instr, exprInstr);
	};

	ParserState.prototype.pushExpression = function (instr, exprInstr) {
	  for (var i = 0, len = exprInstr.length; i < len; i++) {
	    instr.push(exprInstr[i]);
	  }
	};

	ParserState.prototype.parseUntilEndStatement = function (instr, exprInstr) {
	  if (!this.accept(TSEMICOLON)) return false;
	  if (this.nextToken && this.nextToken.type !== TEOF && !(this.nextToken.type === TPAREN && this.nextToken.value === ')')) {
	    exprInstr.push(new Instruction(IENDSTATEMENT));
	  }
	  if (this.nextToken.type !== TEOF) {
	    this.parseExpression(exprInstr);
	  }
	  instr.push(new Instruction(IEXPR, exprInstr));
	  return true;
	};

	ParserState.prototype.parseArrayList = function (instr) {
	  var argCount = 0;

	  while (!this.accept(TBRACKET, ']')) {
	    this.parseExpression(instr);
	    ++argCount;
	    while (this.accept(TCOMMA)) {
	      this.parseExpression(instr);
	      ++argCount;
	    }
	  }

	  return argCount;
	};

	ParserState.prototype.parseVariableAssignmentExpression = function (instr) {
	  this.parseConditionalExpression(instr);
	  while (this.accept(TOP, '=')) {
	    var varName = instr.pop();
	    var varValue = [];
	    var lastInstrIndex = instr.length - 1;
	    if (varName.type === IFUNCALL) {
	      if (!this.tokens.isOperatorEnabled('()=')) {
	        throw new Error('function definition is not permitted');
	      }
	      for (var i = 0, len = varName.value + 1; i < len; i++) {
	        var index = lastInstrIndex - i;
	        if (instr[index].type === IVAR) {
	          instr[index] = new Instruction(IVARNAME, instr[index].value);
	        }
	      }
	      this.parseVariableAssignmentExpression(varValue);
	      instr.push(new Instruction(IEXPR, varValue));
	      instr.push(new Instruction(IFUNDEF, varName.value));
	      continue;
	    }
	    if (varName.type !== IVAR && varName.type !== IMEMBER) {
	      throw new Error('expected variable for assignment');
	    }
	    this.parseVariableAssignmentExpression(varValue);
	    instr.push(new Instruction(IVARNAME, varName.value));
	    instr.push(new Instruction(IEXPR, varValue));
	    instr.push(binaryInstruction('='));
	  }
	};

	ParserState.prototype.parseConditionalExpression = function (instr) {
	  this.parseOrExpression(instr);
	  while (this.accept(TOP, '?')) {
	    var trueBranch = [];
	    var falseBranch = [];
	    this.parseConditionalExpression(trueBranch);
	    this.expect(TOP, ':');
	    this.parseConditionalExpression(falseBranch);
	    instr.push(new Instruction(IEXPR, trueBranch));
	    instr.push(new Instruction(IEXPR, falseBranch));
	    instr.push(ternaryInstruction('?'));
	  }
	};

	ParserState.prototype.parseOrExpression = function (instr) {
	  this.parseAndExpression(instr);
	  while (this.accept(TOP, 'or')) {
	    var falseBranch = [];
	    this.parseAndExpression(falseBranch);
	    instr.push(new Instruction(IEXPR, falseBranch));
	    instr.push(binaryInstruction('or'));
	  }
	};

	ParserState.prototype.parseAndExpression = function (instr) {
	  this.parseComparison(instr);
	  while (this.accept(TOP, 'and')) {
	    var trueBranch = [];
	    this.parseComparison(trueBranch);
	    instr.push(new Instruction(IEXPR, trueBranch));
	    instr.push(binaryInstruction('and'));
	  }
	};

	var COMPARISON_OPERATORS = ['==', '!=', '<', '<=', '>=', '>', 'in'];

	ParserState.prototype.parseComparison = function (instr) {
	  this.parseAddSub(instr);
	  while (this.accept(TOP, COMPARISON_OPERATORS)) {
	    var op = this.current;
	    this.parseAddSub(instr);
	    instr.push(binaryInstruction(op.value));
	  }
	};

	var ADD_SUB_OPERATORS = ['+', '-', '||'];

	ParserState.prototype.parseAddSub = function (instr) {
	  this.parseTerm(instr);
	  while (this.accept(TOP, ADD_SUB_OPERATORS)) {
	    var op = this.current;
	    this.parseTerm(instr);
	    instr.push(binaryInstruction(op.value));
	  }
	};

	var TERM_OPERATORS = ['*', '/', '%'];

	ParserState.prototype.parseTerm = function (instr) {
	  this.parseFactor(instr);
	  while (this.accept(TOP, TERM_OPERATORS)) {
	    var op = this.current;
	    this.parseFactor(instr);
	    instr.push(binaryInstruction(op.value));
	  }
	};

	ParserState.prototype.parseFactor = function (instr) {
	  var unaryOps = this.tokens.unaryOps;
	  function isPrefixOperator(token) {
	    return token.value in unaryOps;
	  }

	  this.save();
	  if (this.accept(TOP, isPrefixOperator)) {
	    if (this.current.value !== '-' && this.current.value !== '+') {
	      if (this.nextToken.type === TPAREN && this.nextToken.value === '(') {
	        this.restore();
	        this.parseExponential(instr);
	        return;
	      } else if (this.nextToken.type === TSEMICOLON || this.nextToken.type === TCOMMA || this.nextToken.type === TEOF || (this.nextToken.type === TPAREN && this.nextToken.value === ')')) {
	        this.restore();
	        this.parseAtom(instr);
	        return;
	      }
	    }

	    var op = this.current;
	    this.parseFactor(instr);
	    instr.push(unaryInstruction(op.value));
	  } else {
	    this.parseExponential(instr);
	  }
	};

	ParserState.prototype.parseExponential = function (instr) {
	  this.parsePostfixExpression(instr);
	  while (this.accept(TOP, '^')) {
	    this.parseFactor(instr);
	    instr.push(binaryInstruction('^'));
	  }
	};

	ParserState.prototype.parsePostfixExpression = function (instr) {
	  this.parseFunctionCall(instr);
	  while (this.accept(TOP, '!')) {
	    instr.push(unaryInstruction('!'));
	  }
	};

	ParserState.prototype.parseFunctionCall = function (instr) {
	  var unaryOps = this.tokens.unaryOps;
	  function isPrefixOperator(token) {
	    return token.value in unaryOps;
	  }

	  if (this.accept(TOP, isPrefixOperator)) {
	    var op = this.current;
	    this.parseAtom(instr);
	    instr.push(unaryInstruction(op.value));
	  } else {
	    this.parseMemberExpression(instr);
	    while (this.accept(TPAREN, '(')) {
	      if (this.accept(TPAREN, ')')) {
	        instr.push(new Instruction(IFUNCALL, 0));
	      } else {
	        var argCount = this.parseArgumentList(instr);
	        instr.push(new Instruction(IFUNCALL, argCount));
	      }
	    }
	  }
	};

	ParserState.prototype.parseArgumentList = function (instr) {
	  var argCount = 0;

	  while (!this.accept(TPAREN, ')')) {
	    this.parseExpression(instr);
	    ++argCount;
	    while (this.accept(TCOMMA)) {
	      this.parseExpression(instr);
	      ++argCount;
	    }
	  }

	  return argCount;
	};

	ParserState.prototype.parseMemberExpression = function (instr) {
	  this.parseAtom(instr);
	  while (this.accept(TOP, '.') || this.accept(TBRACKET, '[')) {
	    var op = this.current;

	    if (op.value === '.') {
	      if (!this.allowMemberAccess) {
	        throw new Error('unexpected ".", member access is not permitted');
	      }

	      this.expect(TNAME);
	      instr.push(new Instruction(IMEMBER, this.current.value));
	    } else if (op.value === '[') {
	      if (!this.tokens.isOperatorEnabled('[')) {
	        throw new Error('unexpected "[]", arrays are disabled');
	      }

	      this.parseExpression(instr);
	      this.expect(TBRACKET, ']');
	      instr.push(binaryInstruction('['));
	    } else {
	      throw new Error('unexpected symbol: ' + op.value);
	    }
	  }
	};

	function add(a, b) {
	  return Number(a) + Number(b);
	}

	function sub(a, b) {
	  return a - b;
	}

	function mul(a, b) {
	  return a * b;
	}

	function div(a, b) {
	  return a / b;
	}

	function mod(a, b) {
	  return a % b;
	}

	function equal(a, b) {
	  return a === b;
	}

	function notEqual(a, b) {
	  return a !== b;
	}

	function greaterThan(a, b) {
	  return a > b;
	}

	function lessThan(a, b) {
	  return a < b;
	}

	function greaterThanEqual(a, b) {
	  return a >= b;
	}

	function lessThanEqual(a, b) {
	  return a <= b;
	}

	function andOperator(a, b) {
	  return Boolean(a && b);
	}

	function orOperator(a, b) {
	  return Boolean(a || b);
	}

	function log10(a) {
	  return Math.log(a) * Math.LOG10E;
	}

	function neg(a) {
	  return -a;
	}

	function not(a) {
	  return !a;
	}

	function trunc(a) {
	  return a < 0 ? Math.ceil(a) : Math.floor(a);
	}

	function random$1(a) {
	  return Math.random() * (a || 1);
	}

	function stringOrArrayLength(s) {
	  if (Array.isArray(s)) {
	    return s.length;
	  }
	  return String(s).length;
	}

	function condition(cond, yep, nope) {
	  return cond ? yep : nope;
	}

	/**
	* Decimal adjustment of a number.
	* From @escopecz.
	*
	* @param {Number} value The number.
	* @param {Integer} exp  The exponent (the 10 logarithm of the adjustment base).
	* @return {Number} The adjusted value.
	*/
	function roundTo(value, exp) {
	  // If the exp is undefined or zero...
	  if (typeof exp === 'undefined' || +exp === 0) {
	    return Math.round(value);
	  }
	  value = +value;
	  exp = -(+exp);
	  // If the value is not a number or the exp is not an integer...
	  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
	    return NaN;
	  }
	  // Shift
	  value = value.toString().split('e');
	  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
	  // Shift back
	  value = value.toString().split('e');
	  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
	}

	function arrayIndex(array, index) {
	  return array[index | 0];
	}

	function max$1(array) {
	  if (arguments.length === 1 && Array.isArray(array)) {
	    return Math.max.apply(Math, array);
	  } else {
	    return Math.max.apply(Math, arguments);
	  }
	}

	function min$1(array) {
	  if (arguments.length === 1 && Array.isArray(array)) {
	    return Math.min.apply(Math, array);
	  } else {
	    return Math.min.apply(Math, arguments);
	  }
	}

	function arrayMap(f, a) {
	  if (typeof f !== 'function') {
	    throw new Error('First argument to map is not a function');
	  }
	  if (!Array.isArray(a)) {
	    throw new Error('Second argument to map is not an array');
	  }
	  return a.map(function (x, i) {
	    return f(x, i);
	  });
	}

	function arrayFold(f, init, a) {
	  if (typeof f !== 'function') {
	    throw new Error('First argument to fold is not a function');
	  }
	  if (!Array.isArray(a)) {
	    throw new Error('Second argument to fold is not an array');
	  }
	  return a.reduce(function (acc, x, i) {
	    return f(acc, x, i);
	  }, init);
	}

	function arrayFilter(f, a) {
	  if (typeof f !== 'function') {
	    throw new Error('First argument to filter is not a function');
	  }
	  if (!Array.isArray(a)) {
	    throw new Error('Second argument to filter is not an array');
	  }
	  return a.filter(function (x, i) {
	    return f(x, i);
	  });
	}

	function sign(x) {
	  return ((x > 0) - (x < 0)) || +x;
	}

	function log1p(x) {
	  return Math.log(1 + x);
	}

	function log2(x) {
	  return Math.log(x) / Math.LN2;
	}

	function sum(array) {
	  if (!Array.isArray(array)) {
	    throw new Error('Sum argument is not an array');
	  }

	  return array.reduce(function (total, value) {
	    return total + Number(value);
	  }, 0);
	}

	function evaluate(tokens, expr, values) {
	  var nstack = [];
	  var n1, n2, n3;
	  var f, args, argCount;

	  if (isExpressionEvaluator(tokens)) {
	    return resolveExpression(tokens, values);
	  }

	  var numTokens = tokens.length;

	  for (var i = 0; i < numTokens; i++) {
	    var item = tokens[i];
	    var type = item.type;
	    if (type === INUMBER || type === IVARNAME) {
	      nstack.push(item.value);
	    } else if (type === IOP2) {
	      n2 = nstack.pop();
	      n1 = nstack.pop();
	      if (item.value === 'and') {
	        nstack.push(n1 ? !!evaluate(n2, expr, values) : false);
	      } else if (item.value === 'or') {
	        nstack.push(n1 ? true : !!evaluate(n2, expr, values));
	      } else if (item.value === '=') {
	        f = expr.binaryOps[item.value];
	        nstack.push(f(n1, evaluate(n2, expr, values), values));
	      } else {
	        f = expr.binaryOps[item.value];
	        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values)));
	      }
	    } else if (type === IOP3) {
	      n3 = nstack.pop();
	      n2 = nstack.pop();
	      n1 = nstack.pop();
	      if (item.value === '?') {
	        nstack.push(evaluate(n1 ? n2 : n3, expr, values));
	      } else {
	        f = expr.ternaryOps[item.value];
	        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values), resolveExpression(n3, values)));
	      }
	    } else if (type === IVAR) {
	      if (item.value in expr.functions) {
	        nstack.push(expr.functions[item.value]);
	      } else if (item.value in expr.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
	        nstack.push(expr.unaryOps[item.value]);
	      } else {
	        var v = values[item.value];
	        if (v !== undefined) {
	          nstack.push(v);
	        } else {
	          throw new Error('undefined variable: ' + item.value);
	        }
	      }
	    } else if (type === IOP1) {
	      n1 = nstack.pop();
	      f = expr.unaryOps[item.value];
	      nstack.push(f(resolveExpression(n1, values)));
	    } else if (type === IFUNCALL) {
	      argCount = item.value;
	      args = [];
	      while (argCount-- > 0) {
	        args.unshift(resolveExpression(nstack.pop(), values));
	      }
	      f = nstack.pop();
	      if (f.apply && f.call) {
	        nstack.push(f.apply(undefined, args));
	      } else {
	        throw new Error(f + ' is not a function');
	      }
	    } else if (type === IFUNDEF) {
	      // Create closure to keep references to arguments and expression
	      nstack.push((function () {
	        var n2 = nstack.pop();
	        var args = [];
	        var argCount = item.value;
	        while (argCount-- > 0) {
	          args.unshift(nstack.pop());
	        }
	        var n1 = nstack.pop();
	        var f = function () {
	          var scope = Object.assign({}, values);
	          for (var i = 0, len = args.length; i < len; i++) {
	            scope[args[i]] = arguments[i];
	          }
	          return evaluate(n2, expr, scope);
	        };
	        // f.name = n1
	        Object.defineProperty(f, 'name', {
	          value: n1,
	          writable: false
	        });
	        values[n1] = f;
	        return f;
	      })());
	    } else if (type === IEXPR) {
	      nstack.push(createExpressionEvaluator(item, expr));
	    } else if (type === IEXPREVAL) {
	      nstack.push(item);
	    } else if (type === IMEMBER) {
	      n1 = nstack.pop();
	      nstack.push(n1[item.value]);
	    } else if (type === IENDSTATEMENT) {
	      nstack.pop();
	    } else if (type === IARRAY) {
	      argCount = item.value;
	      args = [];
	      while (argCount-- > 0) {
	        args.unshift(nstack.pop());
	      }
	      nstack.push(args);
	    } else {
	      throw new Error('invalid Expression');
	    }
	  }
	  if (nstack.length > 1) {
	    throw new Error('invalid Expression (parity)');
	  }
	  // Explicitly return zero to avoid test issues caused by -0
	  return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values);
	}

	function createExpressionEvaluator(token, expr, values) {
	  if (isExpressionEvaluator(token)) return token;
	  return {
	    type: IEXPREVAL,
	    value: function (scope) {
	      return evaluate(token.value, expr, scope);
	    }
	  };
	}

	function isExpressionEvaluator(n) {
	  return n && n.type === IEXPREVAL;
	}

	function resolveExpression(n, values) {
	  return isExpressionEvaluator(n) ? n.value(values) : n;
	}

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
	function Parser(options) {
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
	    } catch (e) {}

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
	        RANDOM: random$1,
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
	            return min$1(v);
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
	            return max$1(filterNumbers.apply(this, arguments));
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
	            return arr.map(item => item[key]);
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

	function addComputedColumns(chart, dataset) {
	    let virtualColumns = get$3(chart.get(), 'metadata.describe.computed-columns', {});
	    if (!Array.isArray(virtualColumns)) {
	        // convert to array
	        virtualColumns = Object.keys(virtualColumns).reduce((acc, cur) => {
	            acc.push({
	                name: cur,
	                formula: virtualColumns[cur]
	            });
	            return acc;
	        }, []);
	    }

	    const data = applyChanges(chart, dataset).list();
	    const columnNameToVar = {};
	    const colAggregates = {};
	    const parser = new Parser();

	    dataset.eachColumn(function(col) {
	        if (col.isComputed) return;
	        columnNameToVar[col.name()] = columnNameToVariable(col.name());
	        if (col.type() === 'number') {
	            const [min, max] = col.range();
	            colAggregates[col.name()] = {
	                min,
	                max,
	                sum: col.sum(),
	                mean: col.mean(),
	                median: col.median()
	            };
	        } else if (col.type() === 'date') {
	            const [min, max] = col.range();
	            colAggregates[col.name()] = { min, max };
	        }
	    });

	    // initialize meta objects for each computed column
	    const vNamesToVar = virtualColumns.reduce((acc, val, idx) => {
	        const key = columnNameToVariable(val.name);
	        return acc.set(key, {
	            name: val.name,
	            index: dataset.numColumns() + idx,
	            key,
	            formula: val.formula,
	            visited: 0,
	            computed: false,
	            dependsOn: []
	        });
	    }, new Map());

	    // parse formulas to detect cross-column dependencies
	    virtualColumns.forEach(({ formula, name }) => {
	        const col = vNamesToVar.get(columnNameToVariable(name));
	        if (formula.trim()) {
	            try {
	                col.expr = parser.parse(formula.trim());
	                col.expr.variables().forEach(v => {
	                    v = v.split('__')[0];
	                    if (vNamesToVar.has(v)) {
	                        col.dependsOn.push(vNamesToVar.get(v));
	                    }
	                });
	            } catch (e) {
	                col.error = e.message;
	                // console.error('err', e);
	            }
	        } else {
	            col.expr = {
	                evaluate() {
	                    return '';
	                },
	                variables() {
	                    return [];
	                }
	            };
	        }
	    });

	    // sort computed columns in order of their dependency graph
	    // circular dependencies are not allowed and will result in
	    // errors
	    const computedColumns = [];

	    let curIter = 0;
	    while (vNamesToVar.size) {
	        if (curIter > 1000) break;
	        vNamesToVar.forEach(col => {
	            curIter++;
	            try {
	                visit(col, []);
	            } catch (e) {
	                if (e.message.startsWith('circular-dependency')) {
	                    col.error = e.message;
	                    // col.computed = true;
	                    vNamesToVar.delete(col.key);
	                    computedColumns.push(col);
	                } else {
	                    throw e;
	                }
	            }
	        });
	    }

	    // compute in order of dependencies
	    computedColumns.forEach(col => {
	        if (col.error) {
	            const errorCol = column(
	                col.name,
	                data.map(d => 'null')
	            );
	            errorCol.isComputed = true;
	            errorCol.formula = col.formula;
	            errorCol.errors = [
	                {
	                    message: col.error,
	                    row: 'all'
	                }
	            ];
	            col.column = errorCol;
	        } else {
	            col.column = addComputedColumn(col);
	        }
	    });

	    // add to dataset in original order
	    computedColumns.sort((a, b) => a.index - b.index).forEach(({ column }) => dataset.add(column));

	    return dataset;

	    function visit(col, stack) {
	        if (col.computed) return;
	        stack.push(col.name);
	        for (let i = 0; i < stack.length - 2; i++) {
	            if (col.name === stack[i]) {
	                throw new Error('circular-dependency: ' + stack.join(' ‣ '));
	            }
	        }
	        col.curIter = curIter;
	        let allComputed = true;
	        for (let i = 0; i < col.dependsOn.length; i++) {
	            allComputed = allComputed && col.dependsOn[i].computed;
	        }
	        if (allComputed) {
	            // no dependencies, we can compute this now
	            col.computed = true;
	            computedColumns.push(col);
	            vNamesToVar.delete(col.key);
	        } else {
	            if (stack.length < 10) {
	                col.dependsOn.forEach(c => {
	                    visit(c, stack.slice(0));
	                });
	            }
	        }
	    }

	    function addComputedColumn({ formula, name, expr, error, index }) {
	        const errors = [];
	        if (error) {
	            errors.push({ row: 'all', message: error });
	        }

	        // create a map of changes for this column
	        const changes = get$3(chart, 'metadata.data.changes', [])
	            .filter(change => change.column === index && change.row > 0)
	            .reduce((acc, cur) => {
	                const old = acc.get(cur.row - 1);
	                if (old) {
	                    // overwrite previous value
	                    cur.previous = old.previous;
	                }
	                acc.set(cur.row - 1, cur);
	                return acc;
	            }, new Map());

	        const values = data.map(function(row, index) {
	            const context = {
	                ROWNUMBER: index
	            };
	            _$3.each(row, function(val, key) {
	                if (!columnNameToVar[key]) return;
	                context[columnNameToVar[key]] = val;
	                if (colAggregates[key]) {
	                    Object.keys(colAggregates[key]).forEach(aggr => {
	                        context[`${columnNameToVar[key]}__${aggr}`] = colAggregates[key][aggr];
	                    });
	                }
	            });
	            let value;
	            try {
	                value = expr.evaluate(context);
	                if (typeof value === 'function') {
	                    errors.push({ message: 'formula returned function', row: index });
	                    value = null;
	                }
	            } catch (error) {
	                errors.push({ message: error.message, row: index });
	                value = null;
	            }
	            if (changes.has(index)) {
	                const change = changes.get(index);
	                if (change.previous === undefined || change.previous == value) {
	                    // we have a change and it's still valid
	                    return change.value;
	                }
	            }
	            return value;
	        });
	        columnNameToVar[name] = columnNameToVariable(name);
	        // apply values to rows so they can be used in formulas
	        values.forEach((val, i) => {
	            data[i][name] = val;
	        });
	        var virtualColumn = column(
	            name,
	            values.map(function(v) {
	                if (_$3.isBoolean(v)) return v ? 'yes' : 'no';
	                if (_$3.isDate(v)) return v.toISOString();
	                if (_$3.isNumber(v)) return String(v);
	                if (_$3.isNull(v)) return null;
	                return String(v);
	            })
	        );
	        // aggregate values
	        if (virtualColumn.type() === 'number') {
	            const [min, max] = virtualColumn.range();
	            colAggregates[name] = {
	                min,
	                max,
	                sum: virtualColumn.sum(),
	                mean: virtualColumn.mean(),
	                median: virtualColumn.median()
	            };
	        } else if (virtualColumn.type() === 'date') {
	            const [min, max] = virtualColumn.range();
	            colAggregates[name] = { min, max };
	        }
	        virtualColumn.isComputed = true;
	        virtualColumn.errors = errors;
	        virtualColumn.formula = formula;
	        return virtualColumn;
	    }
	}

	/**
	 * returns the length of the "tail" of a number, meaning the
	 * number of meaningful decimal places
	 *
	 * @exports tailLength
	 * @kind function
	 *
	 * @example
	 * // returns 3
	 * tailLength(3.123)
	 *
	 * @example
	 * // returns 2
	 * tailLength(3.12999999)
	 *
	 * @param {number} value
	 * @returns {number}
	 */
	function tailLength(value) {
	    return Math.max(
	        0,
	        String(value - Math.floor(value))
	            .replace(/00000*[0-9]+$/, '')
	            .replace(/33333*[0-9]+$/, '')
	            .replace(/99999*[0-9]+$/, '').length - 2
	    );
	}

	/**
	 * rounds a value to a certain number of decimals
	 *
	 * @exports round
	 * @kind function
	 *
	 * @example
	 * import round from '@datawrapper/shared/round';
	 * round(1.2345); // 1
	 * round(1.2345, 2); // 1.23
	 * round(12345, -2); // 12300
	 *
	 * @param {number} value - the value to be rounded
	 * @param {number} decimals - the number of decimals
	 * @returns {number} - rounded value
	 */
	function round(value, decimals = 0) {
	    const base = Math.pow(10, decimals);
	    return Math.round(value * base) / base;
	}

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root$2 = freeGlobal || freeSelf || Function('return this')();

	/** Built-in value references. */
	var Symbol$1 = root$2.Symbol;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty$2.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}

	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString$1 = objectProto$1.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString$1.call(value);
	}

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag$1 && symToStringTag$1 in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject$2(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction$4(value) {
	  if (!isObject$2(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root$2['__core-js_shared__'];

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	/** Used for built-in method references. */
	var funcProto = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto$1 = Function.prototype,
	    objectProto$2 = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString$1 = funcProto$1.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$2.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString$1.call(hasOwnProperty$3).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject$2(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction$4(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	/* Built-in method references that are verified to be native. */
	var nativeCreate$1 = getNative(Object, 'create');

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {};
	  this.size = 0;
	}

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$3.hasOwnProperty;

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate$1) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty$4.call(data, key) ? data[key] : undefined;
	}

	/** Used for built-in method references. */
	var objectProto$4 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$4.hasOwnProperty;

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$5.call(data, key);
	}

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = (nativeCreate$1 && value === undefined) ? HASH_UNDEFINED$1 : value;
	  return this;
	}

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq$2(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq$2(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	/* Built-in method references that are verified to be native. */
	var Map$1 = getNative(root$2, 'Map');

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map$1 || ListCache),
	    'string': new Hash
	  };
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  var result = getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;

	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED$2);
	  return this;
	}

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);

	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}

	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}

	/**
	 * A specialized version of `_.indexOf` which performs strict equality
	 * comparisons of values, i.e. `===`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function strictIndexOf(array, value, fromIndex) {
	  var index = fromIndex - 1,
	      length = array.length;

	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}

	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  return value === value
	    ? strictIndexOf(array, value, fromIndex)
	    : baseFindIndex(array, baseIsNaN, fromIndex);
	}

	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array == null ? 0 : array.length;
	  return !!length && baseIndexOf(array, value, 0) > -1;
	}

	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}

	/* Built-in method references that are verified to be native. */
	var Set$1 = getNative(root$2, 'Set');

	/**
	 * This method returns `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * _.times(2, _.noop);
	 * // => [undefined, undefined]
	 */
	function noop$2() {
	  // No operation performed.
	}

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/**
	 * Creates a set object of `values`.
	 *
	 * @private
	 * @param {Array} values The values to add to the set.
	 * @returns {Object} Returns the new set.
	 */
	var createSet = !(Set$1 && (1 / setToArray(new Set$1([,-0]))[1]) == INFINITY) ? noop$2 : function(values) {
	  return new Set$1(values);
	};

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseUniq(array, iteratee, comparator) {
	  var index = -1,
	      includes = arrayIncludes,
	      length = array.length,
	      isCommon = true,
	      result = [],
	      seen = result;

	  if (comparator) {
	    isCommon = false;
	    includes = arrayIncludesWith;
	  }
	  else if (length >= LARGE_ARRAY_SIZE) {
	    var set = iteratee ? null : createSet(array);
	    if (set) {
	      return setToArray(set);
	    }
	    isCommon = false;
	    includes = cacheHas;
	    seen = new SetCache;
	  }
	  else {
	    seen = iteratee ? [] : result;
	  }
	  outer:
	  while (++index < length) {
	    var value = array[index],
	        computed = iteratee ? iteratee(value) : value;

	    value = (comparator || value !== 0) ? value : 0;
	    if (isCommon && computed === computed) {
	      var seenIndex = seen.length;
	      while (seenIndex--) {
	        if (seen[seenIndex] === computed) {
	          continue outer;
	        }
	      }
	      if (iteratee) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	    else if (!includes(seen, computed, comparator)) {
	      if (seen !== result) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}

	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurrence of each element
	 * is kept. The order of result values is determined by the order they occur
	 * in the array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @returns {Array} Returns the new duplicate free array.
	 * @example
	 *
	 * _.uniq([2, 1, 2]);
	 * // => [2, 1]
	 */
	function uniq$1(array) {
	  return (array && array.length) ? baseUniq(array) : [];
	}

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsFinite = root$2.isFinite;

	/**
	 * Checks if `value` is a finite primitive number.
	 *
	 * **Note:** This method is based on
	 * [`Number.isFinite`](https://mdn.io/Number/isFinite).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
	 * @example
	 *
	 * _.isFinite(3);
	 * // => true
	 *
	 * _.isFinite(Number.MIN_VALUE);
	 * // => true
	 *
	 * _.isFinite(Infinity);
	 * // => false
	 *
	 * _.isFinite('3');
	 * // => false
	 */
	function isFinite$2(value) {
	  return typeof value == 'number' && nativeIsFinite(value);
	}

	/**
	 * computes the significant dimension for a list of numbers
	 * That's the number of decimals to which we can round the numbers
	 * without loosing information
	 *
	 * @exports significantDimension
	 * @kind function
	 *
	 * @example
	 * import {significantDimension} from '@datawrapper/shared/significantDimension';
	 * significantDimension([0,10,20,30]); // -1
	 *
	 * @param {number[]} values - list of input numbers
	 * @param {number} tolerance - percent of input values that we allow to "collide"
	 * @returns {number} - number of significant dimensions (= the number of decimals)
	 */
	function significantDimension(values, tolerance = 0.1) {
	    let result = [];
	    let decimals = 0;
	    const uniqValues = uniq$1(values.filter(isFinite$2));
	    const totalUniq = uniqValues.length;
	    let check, diff;

	    const accepted = Math.floor(totalUniq * (1 - tolerance));

	    if (uniqValues.length < 3) {
	        // special case if there are only 2 unique values
	        return Math.round(
	            uniqValues.reduce(function(acc, cur) {
	                if (!cur) return acc;
	                const exp = Math.log(Math.abs(cur)) / Math.LN10;
	                if (exp < 8 && exp > -3) {
	                    // use tail length for normal numbers
	                    return acc + Math.min(3, tailLength(uniqValues[0]));
	                } else {
	                    return acc + (exp > 0 ? (exp - 1) * -1 : exp * -1);
	                }
	            }, 0) / uniqValues.length
	        );
	    }

	    if (uniq$1(uniqValues.map(currentRound)).length > accepted) {
	        // we seem to have enough precision, but maybe it's too much?
	        check = function() {
	            return uniq$1(result).length === totalUniq;
	        };
	        diff = -1;
	    } else {
	        // if we end up here it means we're loosing too much information
	        // due to rounding, we need to increase precision
	        check = function() {
	            return uniq$1(result).length <= accepted;
	        };
	        diff = +1;
	    }
	    let maxIter = 100;
	    do {
	        result = uniqValues.map(currentRound);
	        decimals += diff;
	    } while (check() && maxIter-- > 0);
	    if (maxIter < 10) {
	        console.warn('maximum iteration reached', values, result, decimals);
	    }
	    if (diff < 0) decimals += 2;
	    else decimals--;
	    /* rounds to the current number of decimals */
	    function currentRound(v) {
	        return round(v, decimals);
	    }
	    return decimals;
	}

	/*
	 * simple event callbacks, mimicing the $.Callbacks API
	 */

	function events() {
	    const list = [];

	    return {
	        fire() {
	            for (var i = list.length - 1; i >= 0; i--) {
	                list[i].apply(this, arguments);
	            }
	        },
	        add(callback) {
	            list.push(callback);
	        }
	    };
	}

	var js_cookie$1 = createCommonjsModule(function (module, exports) {
	(function (factory) {
		var registeredInModuleLoader;
		{
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function decode (s) {
			return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
		}

		function init (converter) {
			function api() {}

			function set (key, value, attributes) {
				if (typeof document === 'undefined') {
					return;
				}

				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}

					// Considers RFC 6265 section 5.2:
					// ...
					// 3.  If the remaining unparsed-attributes contains a %x3B (";")
					//     character:
					// Consume the characters of the unparsed-attributes up to,
					// not including, the first %x3B (";") character.
					// ...
					stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
				}

				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			function get (key, json) {
				if (typeof document === 'undefined') {
					return;
				}

				var jar = {};
				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all.
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = decode(parts[0]);
						cookie = (converter.read || converter)(cookie, name) ||
							decode(cookie);

						if (json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						jar[name] = cookie;

						if (key === name) {
							break;
						}
					} catch (e) {}
				}

				return key ? jar[key] : jar;
			}

			api.set = set;
			api.get = function (key) {
				return get(key, false /* read as raw */);
			};
			api.getJSON = function (key) {
				return get(key, true /* read as json */);
			};
			api.remove = function (key, attributes) {
				set(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.defaults = {};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));
	});

	const CSRF_COOKIE_NAME$1 = 'crumb';
	const CSRF_TOKEN_HEADER$1 = 'X-CSRF-Token';
	const CSRF_SAFE_METHODS$1 = new Set(['get', 'head', 'options', 'trace']); // according to RFC7231

	/**
	 * The response body is automatically parsed according
	 * to the response content type.
	 *
	 * @exports httpReq
	 * @kind function
	 *
	 * @param {string} path               - the url path that gets appended to baseUrl
	 * @param {object} options.payload    - payload to be send with req
	 * @param {boolean} options.raw       - disable parsing of response body, returns raw response
	 * @param {string} options.baseUrl    - base for url, defaults to dw api domain
	 * @param {*} options                 - see documentation for window.fetch for additional options
	 *
	 * @returns {Promise} promise of parsed response body or raw response
	 *
	 * @example
	 *  import httpReq from '@datawrapper/shared/httpReq';
	 *  let res = await httpReq('/v3/charts', {
	 *      method: 'post',
	 *      payload: {
	 *          title: 'My new chart'
	 *      }
	 *  });
	 *  import { post } from '@datawrapper/shared/httpReq';
	 *  res = await post('/v3/charts', {
	 *      payload: {
	 *          title: 'My new chart'
	 *      }
	 *  });
	 */
	function httpReq$1(path, options = {}) {
	    if (!options.fetch) {
	        try {
	            options.fetch = window.fetch;
	        } catch (e) {
	            throw new Error('Neither options.fetch nor window.fetch is defined.');
	        }
	    }
	    if (!options.baseUrl) {
	        try {
	            options.baseUrl = `//${window.dw.backend.__api_domain}`;
	        } catch (e) {
	            throw new Error('Neither options.baseUrl nor window.dw is defined.');
	        }
	    }
	    const { payload, baseUrl, fetch, raw, ...opts } = {
	        payload: null,
	        raw: false,
	        method: 'GET',
	        mode: 'cors',
	        credentials: 'include',
	        ...options,
	        headers: {
	            'Content-Type': 'application/json',
	            ...options.headers
	        }
	    };
	    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
	    if (payload) {
	        // overwrite body
	        opts.body = JSON.stringify(payload);
	    }

	    let promise;
	    if (!CSRF_SAFE_METHODS$1.has(opts.method.toLowerCase())) {
	        let csrfCookieValue = js_cookie$1.get(CSRF_COOKIE_NAME$1);
	        if (csrfCookieValue) {
	            opts.headers[CSRF_TOKEN_HEADER$1] = csrfCookieValue;
	            promise = fetch(url, opts);
	        } else {
	            promise = httpReq$1('/v3/me', { fetch, baseUrl })
	                .then(() => {
	                    const csrfCookieValue = js_cookie$1.get(CSRF_COOKIE_NAME$1);
	                    if (csrfCookieValue) {
	                        opts.headers[CSRF_TOKEN_HEADER$1] = csrfCookieValue;
	                    }
	                })
	                .catch(() => {}) // Ignore errors from /v3/me. It probably means the user is not logged in.
	                .then(() => fetch(url, opts));
	        }
	    } else {
	        promise = fetch(url, opts);
	    }
	    // The variable `promise` and the repeated `fetch(url, opts)` could be replaced with `await
	    // httpReq('/v3/me'...)`, but then we would need to configure babel to transform async/await for
	    // all repositories that use @datawrapper/shared.

	    return promise.then(res => {
	        if (raw) return res;
	        if (!res.ok) throw new HttpReqError$1(res);
	        if (res.status === 204 || !res.headers.get('content-type')) return res; // no content
	        // trim away the ;charset=utf-8 from content-type
	        const contentType = res.headers.get('content-type').split(';')[0];
	        if (contentType === 'application/json') {
	            return res.json();
	        }
	        if (contentType === 'image/png' || contentType === 'application/pdf') {
	            return res.blob();
	        }
	        // default to text for all other content types
	        return res.text();
	    });
	}

	/**
	 * Like `httpReq` but with fixed http method GET
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.get
	 * @kind function
	 */
	const get$4 = (httpReq$1.get = httpReqVerb$1('GET'));

	/**
	 * Like `httpReq` but with fixed http method PATCH
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.patch
	 * @kind function
	 */
	const patch$1 = (httpReq$1.patch = httpReqVerb$1('PATCH'));

	/**
	 * Like `httpReq` but with fixed http method PUT
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.put
	 * @kind function
	 */
	const put$1 = (httpReq$1.put = httpReqVerb$1('PUT'));

	/**
	 * Like `httpReq` but with fixed http method POST
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.post
	 * @kind function
	 */
	const post$1 = (httpReq$1.post = httpReqVerb$1('POST'));

	/**
	 * Like `httpReq` but with fixed http method HEAD
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.head
	 * @kind function
	 */
	const head$1 = (httpReq$1.head = httpReqVerb$1('HEAD'));

	/**
	 * Like `httpReq` but with fixed http method DELETE
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.delete
	 * @kind function
	 */
	httpReq$1.delete = httpReqVerb$1('DELETE');

	function httpReqVerb$1(method) {
	    return (path, options) => {
	        if (options && options.method) {
	            throw new Error(
	                `Setting option.method is not allowed in httpReq.${method.toLowerCase()}()`
	            );
	        }
	        return httpReq$1(path, { ...options, method });
	    };
	}

	class HttpReqError$1 extends Error {
	    constructor(res) {
	        super();
	        this.name = 'HttpReqError';
	        this.status = res.status;
	        this.statusText = res.statusText;
	        this.message = `[${res.status}] ${res.statusText}`;
	        this.response = res;
	    }
	}

	/**
	 * Download and parse a remote JSON document. Use {@link httpReq} instead
	 *
	 * @deprecated
	 *
	 * @param {string} url
	 * @param {string} method - HTTP method, either GET, POST or PUT
	 * @param {string|undefined} credentials - set to "include" if cookies should be passed along CORS requests
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * import { fetchJSON } from '@datawrapper/shared/fetch';
	 * fetchJSON('http://api.example.org', 'GET', 'include');
	 */

	/**
	 * injects a `<script>` element to the page to load a new JS script
	 *
	 * @param {string} src
	 * @param {function} callback
	 *
	 * @example
	 * import { loadScript } from '@datawrapper/shared/fetch';
	 *
	 * loadScript('/static/js/library.js', () => {
	 *     console.log('library is loaded');
	 * })
	 */
	function loadScript$1(src, callback = null) {
	    return new Promise((resolve, reject) => {
	        const script = document.createElement('script');
	        script.src = src;
	        script.onload = () => {
	            if (callback) callback();
	            resolve();
	        };
	        script.onerror = reject;
	        document.body.appendChild(script);
	    });
	}

	const storeChanges = _$3.throttle((chart, callback) => {
	    const state = chart.serialize();

	    put$1(`/v3/charts/${state.id}`, { payload: state })
	        .then(attributes => {
	            chart.fire('save', attributes);
	            if (callback) callback();
	        })
	        .catch(e => {
	            console.error('Could not store chart changes', e);
	        });
	}, 1000);

	const storeData = _$3.throttle((chart, callback) => {
	    const data = chart.getMetadata('data.json') ? JSON.stringify(chart.dataset()) : chart.rawData();
	    // const data = chart.rawData();
	    put$1(`/v3/charts/${chart.get().id}/data`, {
	        body: data,
	        headers: {
	            'Content-Type': 'text/csv'
	        }
	    })
	        .then(() => {
	            if (callback) callback();
	        })
	        .catch(e => {
	            console.error('Could not store chart data', e);
	        });
	}, 1000);

	const changeCallbacks = events();

	class Chart extends Store {
	    /*
	     * load a csv or json dataset
	     */
	    load(csv, externalData) {
	        const dsopts = {
	            firstRowIsHeader: this.getMetadata('data.horizontal-header', true),
	            transpose: this.getMetadata('data.transpose', false)
	        };

	        if (csv && !externalData) dsopts.csv = csv;
	        else dsopts.url = externalData || 'data.csv';

	        if (dsopts.csv) this._rawData = dsopts.csv;

	        const datasource = this.getMetadata('data.json', false) ? json(dsopts) : delimited(dsopts);

	        return datasource
	            .dataset()
	            .then(ds => {
	                this.dataset(ds);
	                // this.dataset(ds);
	                // dataset_change_callbacks.fire(chart, ds);
	                return ds;
	            })
	            .catch(e => {
	                console.error('could not fetch datasource', e);
	            });
	    }

	    // sets or returns the dataset
	    dataset(ds) {
	        // set a new dataset, or reset the old one if ds===true
	        if (arguments.length) {
	            if (ds !== true) this._dataset_cache = ds;
	            else ds = this._dataset_cache;
	            const jsonData = typeof ds.list !== 'function';
	            this._dataset = jsonData
	                ? ds
	                : reorderColumns(this, applyChanges(this, addComputedColumns(this, ds)));
	            if (jsonData) this.set({ dataset: ds });
	            return this._dataset;
	        }
	        // return current dataset
	        return this._dataset;
	    }

	    // sets or gets the theme
	    theme(theme) {
	        if (arguments.length) {
	            // set new theme
	            this.set({ theme });
	            return this;
	        }
	        return this.get().theme;
	    }

	    // sets or gets the visualization
	    vis(vis) {
	        if (arguments.length) {
	            // set new visualization
	            this.set({ vis });
	            return this;
	        }
	        return this.get().vis;
	    }

	    locale(locale, callback) {
	        if (arguments.length) {
	            this._locale = locale = locale.replace('_', '-');
	            if (window.Globalize) {
	                loadGlobalizeLocale(locale, callback);
	            }
	            // todo: what about momentjs & numeraljs?
	        }
	        return this._locale;
	    }

	    getMetadata(key = null, _default = null) {
	        const { metadata } = this.get();
	        if (!key) return metadata;
	        // get metadata
	        const keys = key.split('.');
	        let pt = metadata;

	        _$3.some(keys, key => {
	            if (_$3.isUndefined(pt) || _$3.isNull(pt)) return true; // break out of the loop
	            pt = pt[key];
	            return false;
	        });
	        return _$3.isUndefined(pt) || _$3.isNull(pt) ? _default : pt;
	    }

	    setMetadata(key, value) {
	        const keys = key.split('.');
	        const lastKey = keys.pop();
	        const { metadata } = this.get();
	        let pt = metadata;

	        // resolve property until the parent dict
	        keys.forEach(key => {
	            if (_$3.isUndefined(pt[key]) || _$3.isNull(pt[key])) {
	                pt[key] = {};
	            }
	            pt = pt[key];
	        });

	        // check if new value is set
	        if (!_$3.isEqual(pt[lastKey], value)) {
	            pt[lastKey] = value;
	            this.set({ metadata });
	        }
	        return this;
	    }

	    // stores the state of this chart to server
	    store(callback) {
	        storeChanges(this, callback);
	    }

	    storeData(callback) {
	        storeData(this, callback);
	    }

	    onChange(c) {
	        changeCallbacks.add(c);
	    }

	    serialize() {
	        const state = this.get();
	        const keep = [
	            'id',
	            'title',
	            'theme',
	            'createdAt',
	            'lastModifiedAt',
	            'type',
	            'metadata',
	            'authorId',
	            'showInGallery',
	            'language',
	            'guestSession',
	            'lastEditStep',
	            'publishedAt',
	            'publicUrl',
	            'publicVersion',
	            'organizationId',
	            'forkedFrom',
	            'externalData',
	            'forkable',
	            'isFork',
	            'inFolder',
	            'author'
	        ];
	        const copy = {};
	        keep.forEach(k => {
	            copy[k] = state[k];
	        });
	        return copy;
	    }

	    columnFormatter(column) {
	        // pull output config from metadata
	        // return column.formatter(config);
	        var colFormat = get$3(this.get(), 'metadata.data.column-format', {});
	        colFormat = _$3.clone(colFormat[column.name()] || { type: 'auto', 'number-format': 'auto' });

	        if (
	            column.type() === 'number' &&
	            (colFormat === 'auto' ||
	                colFormat['number-format'] === undefined ||
	                colFormat['number-format'] === 'auto')
	        ) {
	            var values = column.values();
	            var dim = significantDimension(values);
	            colFormat['number-format'] = 'n' + Math.max(0, dim);
	        }
	        return column.type(true).formatter(colFormat);
	    }

	    passiveMode() {
	        this.set({ passiveMode: true });
	        setTimeout(() => this.set({ passiveMode: false }), 100);
	    }

	    isPassive() {
	        return this.get().passiveMode;
	    }

	    rawData() {
	        return this._rawData;
	    }
	}

	Chart.prototype.observeDeep = observeDeep;

	function loadGlobalizeLocale(locale, callback) {
	    if (Object.prototype.hasOwnProperty.call(window.Globalize.cultures, locale)) {
	        window.Globalize.culture(locale);
	        if (typeof callback === 'function') callback();
	    } else {
	        loadScript$1(`/static/vendor/globalize/cultures/globalize.culture.${locale}.js`, () => {
	            window.Globalize.culture(locale);
	            if (typeof callback === 'function') callback();
	        });
	    }
	}

	var main = { init: init$1 };

	/* globals dw,_ */

	function init$1({
	    target,
	    csv,
	    chartData,
	    namespace,
	    defaultVisType,
	    visualizations,
	    visArchive,
	    theme,
	    themes,
	    themeData
	}) {
	    const chart = new Chart(chartData);
	    let app;

	    const themeCache = {};
	    themeCache[theme] = themeData;
	    dw.theme.register(theme, themeData);

	    dw.backend.currentChart = chart;

	    chart.set({
	        writable: true,
	        themeData: themeData,
	        themes,
	        visualization: visualizations[chartData.type],
	        lastEditStep: 3
	    });

	    chart.compute('axes', ['visualization'], function (visualization) {
	        if (!visualization) {
	            return [];
	        }
	        return _.values(visualization.axes || {});
	    });

	    function initializeDataset(ds) {
	        // remove ignored columns
	        var columnFormat = chart.getMetadata('data.column-format', {});
	        var ignore = {};
	        _.each(columnFormat, function (format, key) {
	            ignore[key] = !!format.ignore;
	        });
	        if (ds.filterColumns) ds.filterColumns(ignore);

	        chart.set({ dataset: ds });
	    }

	    chart.load(csv).then(function (ds) {
	        initializeDataset(ds);

	        target.innerHTML = '';

	        app = new App({
	            store: chart,
	            target,
	            data: {
	                visualizations,
	                namespace,
	                visArchive,
	                defaultVisType
	            }
	        });
	    });

	    const editHistory = [];
	    let dontPush = false;
	    let historyPos = 0;

	    // Reload dataset when table is transposed
	    chart.observeDeep('metadata.data.transpose', (currentValue, previousValue) => {
	        if (previousValue === undefined) return;
	        chart.load(csv).then(initializeDataset);
	    });

	    chart.on('update', function ({ changed, current, previous }) {
	        // observe theme changes and load new theme data if needed
	        if (changed.theme) {
	            if (themeCache[current.theme]) {
	                // re-use cached theme
	                chart.set({ themeData: themeCache[current.theme] });
	            } else {
	                // load new theme data
	                getJSON(
	                    '//' + dw.backend.__api_domain + '/v3/themes/' + current.theme + '?extend=true',
	                    function (res) {
	                        themeCache[current.theme] = res.data;
	                        dw.theme.register(current.theme, res.data);
	                        chart.set({ themeData: res.data });
	                    }
	                );
	            }
	        }

	        if (
	            previous &&
	            (changed.title ||
	                changed.theme ||
	                changed.type ||
	                changed.metadata ||
	                changed.language ||
	                changed.lastEditStep)
	        ) {
	            chart.store();

	            if (!dontPush) {
	                var s = JSON.stringify(chart.serialize());
	                if (historyPos > 0) {
	                    // throw away edit history until the current pos
	                    editHistory.splice(0, historyPos);
	                }
	                if (editHistory[0] !== s) editHistory.unshift(s);
	                editHistory.length = Math.min(editHistory.length, 50);
	                historyPos = 0;
	            }
	        }
	    });

	    window.addEventListener('keypress', function (evt) {
	        if (evt.key === 'z' && evt.ctrlKey) {
	            var oldPos = historyPos;
	            historyPos += evt.altKey ? -1 : 1;
	            if (editHistory[historyPos]) {
	                dontPush = true;
	                chart.set(JSON.parse(editHistory[historyPos]));
	                dontPush = false;
	            } else {
	                historyPos = oldPos;
	            }
	        }
	    });

	    return {
	        app
	    };
	}

	return main;

})));
//# sourceMappingURL=visualize.js.map
