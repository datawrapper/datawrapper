(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chroma')) :
	typeof define === 'function' && define.amd ? define(['chroma'], factory) :
	(global = global || self, global.controls = factory(global.chroma));
}(this, function (chroma) { 'use strict';

	chroma = chroma && chroma.hasOwnProperty('default') ? chroma['default'] : chroma;

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

	function detachBefore(after) {
		while (after.previousSibling) {
			after.parentNode.removeChild(after.previousSibling);
		}
	}

	function detachAfter(before) {
		while (before.nextSibling) {
			before.parentNode.removeChild(before.nextSibling);
		}
	}

	function reinsertBetween(before, after, target) {
		while (before.nextSibling && before.nextSibling !== after) {
			target.appendChild(before.parentNode.removeChild(before.nextSibling));
		}
	}

	function reinsertChildren(parent, target) {
		while (parent.firstChild) { target.appendChild(parent.firstChild); }
	}

	function reinsertBefore(after, target) {
		var parent = after.parentNode;
		while (parent.firstChild !== after) { target.appendChild(parent.firstChild); }
	}

	function destroyEach(iterations) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) { iterations[i].d(); }
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

	function addListener(node, event, handler) {
		node.addEventListener(event, handler, false);
	}

	function removeListener(node, event, handler) {
		node.removeEventListener(event, handler, false);
	}

	function setAttribute(node, attribute, value) {
		node.setAttribute(attribute, value);
	}

	function toNumber(value) {
		return value === '' ? undefined : +value;
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

	function linear(t) {
		return t;
	}

	function generateRule(
		a,
		b,
		delta,
		duration,
		ease,
		fn
	) {
		var keyframes = '{\n';

		for (var p = 0; p <= 1; p += 16.666 / duration) {
			var t = a + delta * ease(p);
			keyframes += p * 100 + '%{' + fn(t) + '}\n';
		}

		return keyframes + '100% {' + fn(b) + '}\n}';
	}

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
		var hash = 5381;
		var i = str.length;

		while (i--) { hash = ((hash << 5) - hash) ^ str.charCodeAt(i); }
		return hash >>> 0;
	}

	function wrapTransition(component, node, fn, params, intro, outgroup) {
		var obj = fn(node, params);
		var duration = obj.duration || 300;
		var ease = obj.easing || linear;
		var cssText;

		// TODO share <style> tag between all transitions?
		if (obj.css && !transitionManager.stylesheet) {
			var style = createElement('style');
			document.head.appendChild(style);
			transitionManager.stylesheet = style.sheet;
		}

		if (intro) {
			if (obj.css && obj.delay) {
				cssText = node.style.cssText;
				node.style.cssText += obj.css(0);
			}

			if (obj.tick) { obj.tick(0); }
		}

		return {
			t: intro ? 0 : 1,
			running: false,
			program: null,
			pending: null,
			run: function(intro, callback) {
				var program = {
					start: window.performance.now() + (obj.delay || 0),
					intro: intro,
					callback: callback
				};

				if (obj.delay) {
					this.pending = program;
				} else {
					this.start(program);
				}

				if (!this.running) {
					this.running = true;
					transitionManager.add(this);
				}
			},
			start: function(program) {
				component.fire(program.intro ? 'intro.start' : 'outro.start', { node: node });

				program.a = this.t;
				program.b = program.intro ? 1 : 0;
				program.delta = program.b - program.a;
				program.duration = duration * Math.abs(program.b - program.a);
				program.end = program.start + program.duration;

				if (obj.css) {
					if (obj.delay) { node.style.cssText = cssText; }

					program.rule = generateRule(
						program.a,
						program.b,
						program.delta,
						program.duration,
						ease,
						obj.css
					);

					transitionManager.addRule(program.rule, program.name = '__svelte_' + hash(program.rule));

					node.style.animation = (node.style.animation || '')
						.split(', ')
						.filter(function(anim) {
							// when introing, discard old animations if there are any
							return anim && (program.delta < 0 || !/__svelte/.test(anim));
						})
						.concat(program.name + ' ' + program.duration + 'ms linear 1 forwards')
						.join(', ');
				}

				this.program = program;
				this.pending = null;
			},
			update: function(now) {
				var program = this.program;
				if (!program) { return; }

				var p = now - program.start;
				this.t = program.a + program.delta * ease(p / program.duration);
				if (obj.tick) { obj.tick(this.t); }
			},
			done: function() {
				var program = this.program;
				this.t = program.b;
				if (obj.tick) { obj.tick(this.t); }
				if (obj.css) { transitionManager.deleteRule(node, program.name); }
				program.callback();
				program = null;
				this.running = !!this.pending;
			},
			abort: function() {
				if (obj.tick) { obj.tick(1); }
				if (obj.css) { transitionManager.deleteRule(node, this.program.name); }
				this.program = this.pending = null;
				this.running = false;
			}
		};
	}

	var transitionManager = {
		running: false,
		transitions: [],
		bound: null,
		stylesheet: null,
		activeRules: {},

		add: function(transition) {
			this.transitions.push(transition);

			if (!this.running) {
				this.running = true;
				requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
			}
		},

		addRule: function(rule, name) {
			if (!this.activeRules[name]) {
				this.activeRules[name] = true;
				this.stylesheet.insertRule('@keyframes ' + name + ' ' + rule, this.stylesheet.cssRules.length);
			}
		},

		next: function() {
			var this$1 = this;

			this.running = false;

			var now = window.performance.now();
			var i = this.transitions.length;

			while (i--) {
				var transition = this$1.transitions[i];

				if (transition.program && now >= transition.program.end) {
					transition.done();
				}

				if (transition.pending && now >= transition.pending.start) {
					transition.start(transition.pending);
				}

				if (transition.running) {
					transition.update(now);
					this$1.running = true;
				} else if (!transition.pending) {
					this$1.transitions.splice(i, 1);
				}
			}

			if (this.running) {
				requestAnimationFrame(this.bound);
			} else if (this.stylesheet) {
				var i = this.stylesheet.cssRules.length;
				while (i--) { this$1.stylesheet.deleteRule(i); }
				this.activeRules = {};
			}
		},

		deleteRule: function(node, name) {
			node.style.animation = node.style.animation
				.split(', ')
				.filter(function(anim) {
					return anim.indexOf(name) === -1;
				})
				.join(', ');
		}
	};

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

	/* controls/Checkbox.html generated by Svelte v1.64.0 */

	function data() {
	    return {
	        disabled: false,
	        faded: false
	    };
	}
	function create_main_fragment(component, state) {
		var div, label, input, span, text, text_1, label_class_value;

		function input_change_handler() {
			component.set({ value: input.checked });
		}

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				input = createElement("input");
				span = createElement("span");
				text = createText("\n         ");
				text_1 = createText(state.label);
				this.h();
			},

			h: function hydrate() {
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "checkbox");
				input.disabled = state.disabled;
				input.className = "svelte-vnsjtu";
				span.className = "css-ui svelte-vnsjtu";
				label.className = label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " " + (state.faded? 'faded' :'') + " svelte-vnsjtu";
				div.className = "control-group vis-option-group vis-option-type-checkbox";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				appendNode(input, label);

				input.checked = state.value;

				appendNode(span, label);
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

				if ((changed.disabled || changed.faded) && label_class_value !== (label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " " + (state.faded? 'faded' :'') + " svelte-vnsjtu")) {
					label.className = label_class_value;
				}
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				removeListener(input, "change", input_change_handler);
			}
		};
	}

	function Checkbox(options) {
		this._debugName = '<Checkbox>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data(), options.data);
		if (!('disabled' in this._state)) { console.warn("<Checkbox> was created without expected data property 'disabled'"); }
		if (!('faded' in this._state)) { console.warn("<Checkbox> was created without expected data property 'faded'"); }
		if (!('value' in this._state)) { console.warn("<Checkbox> was created without expected data property 'value'"); }
		if (!('label' in this._state)) { console.warn("<Checkbox> was created without expected data property 'label'"); }

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Checkbox.prototype, protoDev);

	Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	// `_isUndefined` : an object's function
	// --------------------------------------

	// Is a given variable undefined?
	function _isUndefined (obj) {
		return obj === void 0;
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

	// `_isBoolean` : an object's function

	// Is a given value a boolean?
	function _isBoolean (obj) {
		return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	}

	// `_isObject` : an object's function
	// -----------------------------------

	// Is a given variable an object?
	function _isObject (obj) {
		var type = typeof obj;
		return type === 'function' || type === 'object' && !!obj;
	}

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

	// `_each` : a collection's function

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

	// `_unique` : an array's function

	// Produce a duplicate-free version of the array. If the array has already
	// been sorted, you have the option of using a faster algorithm.
	function _uniq (array, isSorted, iteratee, context) {
		if (!_isBoolean(isSorted)) {
			context = iteratee;
			iteratee = isSorted;
			isSorted = false;
		}
		if (iteratee != null) { iteratee = cb(iteratee, context); }
		var result = [];
		var seen = [];
		for (var i = 0, length = getLength(array); i < length; i++) {
			var value = array[i],
				computed = iteratee ? iteratee(value, i, array) : value;
			if (isSorted) {
				if (!i || seen !== computed) { result.push(value); }
				seen = computed;
			} else if (iteratee) {
				if (!_contains(seen, computed)) {
					seen.push(computed);
					result.push(value);
				}
			} else if (!_contains(result, value)) {
				result.push(value);
			}
		}
		return result;
	}

	// `_uniq` : an array's function

	/* controls/BaseDropdown.html generated by Svelte v1.64.0 */

	function data$1() {
	    return { visible: false };
	}
	var methods = {
	    toggle: function toggle() {
	        var ref = this.get();
	        var visible = ref.visible;
	        this.set({ visible: !visible });
	    },
	    windowClick: function windowClick(event) {
	        if (!event.target || event.target === this.refs.button) { return; }
	        // this is a hack for the colorpicker, need to find out how to get rid of
	        if (event.target.classList.contains('hex')) { return; }
	        this.set({ visible: false });
	    }
	};

	function create_main_fragment$1(component, state) {
		var div, div_1, slot_content_button = component._slotted.button, text, text_2;

		function onwindowclick(event) {
			component.windowClick(event);
		}
		window.addEventListener("click", onwindowclick);

		function click_handler(event) {
			component.toggle();
		}

		var if_block = (state.visible) && create_if_block(component, state);

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				if (!slot_content_button) {
					text = createText("Button");
				}
				text_2 = createText("\n    ");
				if (if_block) { if_block.c(); }
				this.h();
			},

			h: function hydrate() {
				addListener(div_1, "click", click_handler);
				div_1.className = "base-drop-btn svelte-1e7v6nx";
				setStyle(div, "position", "relative");
				setStyle(div, "display", "inline-block");
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				if (!slot_content_button) {
					appendNode(text, div_1);
				}

				else {
					appendNode(slot_content_button, div_1);
				}

				component.refs.button = div_1;
				appendNode(text_2, div);
				if (if_block) { if_block.m(div, null); }
			},

			p: function update(changed, state) {
				if (state.visible) {
					if (!if_block) {
						if_block = create_if_block(component, state);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}
			},

			u: function unmount() {
				detachNode(div);

				if (slot_content_button) {
					reinsertChildren(div_1, slot_content_button);
				}

				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				window.removeEventListener("click", onwindowclick);

				removeListener(div_1, "click", click_handler);
				if (component.refs.button === div_1) { component.refs.button = null; }
				if (if_block) { if_block.d(); }
			}
		};
	}

	// (8:4) {#if visible}
	function create_if_block(component, state) {
		var slot_content_content = component._slotted.content, slot_content_content_before, slot_content_content_after, text;

		return {
			c: function create() {
				if (!slot_content_content) {
					text = createText("Content");
				}
			},

			m: function mount(target, anchor) {
				if (!slot_content_content) {
					insertNode(text, target, anchor);
				}

				else {
					insertNode(slot_content_content_before || (slot_content_content_before = createComment()), target, anchor);
					insertNode(slot_content_content, target, anchor);
					insertNode(slot_content_content_after || (slot_content_content_after = createComment()), target, anchor);
				}
			},

			u: function unmount() {
				if (!slot_content_content) {
					detachNode(text);
				}

				else {
					reinsertBetween(slot_content_content_before, slot_content_content_after, slot_content_content);
					detachNode(slot_content_content_before);
					detachNode(slot_content_content_after);
				}
			},

			d: noop
		};
	}

	function BaseDropdown(options) {
		this._debugName = '<BaseDropdown>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this.refs = {};
		this._state = assign(data$1(), options.data);
		if (!('visible' in this._state)) { console.warn("<BaseDropdown> was created without expected data property 'visible'"); }

		this._slotted = options.slots || {};

		this.slots = {};

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(BaseDropdown.prototype, protoDev);
	assign(BaseDropdown.prototype, methods);

	BaseDropdown.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/ColorPicker.html generated by Svelte v1.64.0 */

	function palette(ref) {
	    var $themeData = ref.$themeData;
	    var prepend = ref.prepend;
	    var append = ref.append;

	    return _uniq(prepend.concat($themeData.colors.palette).concat(append));
	}
	function validColor(ref) {
	    var color = ref.color;

	    try {
	        return chroma(color).hex();
	    } catch (e) {
	        return '#000000';
	    }
	}
	function gradient_l(ref) {
	    var color = ref.color;

	    var lch = chroma(color).lch();
	    var sample = spread(70, 55, 7, 6).map(function (l) { return chroma.lch(l, lch[1], lch[2]).hex(); });
	    return chroma
	        .scale(['#000000'].concat(sample).concat('#ffffff'))
	        .mode('lch')
	        .gamma(0.8)
	        .padding(0.1)
	        .colors(14);
	}
	function gradient_c(ref) {
	    var color = ref.color;
	    var palette = ref.palette;

	    var high = chroma(color).set('lch.c', 120);
	    if (isNaN(high.get('lch.h'))) {
	        high = chroma.lch(high.get('lch.l'), 50, chroma(palette[0] || '#d00').get('lch.h'));
	    }
	    var low = chroma(color).set('lch.c', 3);
	    return chroma
	        .scale([low, high])
	        .mode('lch')
	        .gamma(1.2)
	        .colors(14);
	}
	function gradient_h(ref) {
	    var color = ref.color;

	    var lch = chroma(color).lch();
	    var sample = spread(lch[2], 75, 7, 6).map(function (h) { return chroma.lch(lch[0], lch[1], h).hex(); });
	    return chroma
	        .scale(sample)
	        .mode('lch')
	        .colors(14);
	}
	function nearest_l(ref) {
	    var color = ref.color;
	    var gradient_l = ref.gradient_l;

	    return findNearest(gradient_l, color);
	}
	function nearest_c(ref) {
	    var color = ref.color;
	    var gradient_c = ref.gradient_c;

	    return findNearest(gradient_c, color);
	}
	function nearest_h(ref) {
	    var color = ref.color;
	    var gradient_h = ref.gradient_h;

	    return findNearest(gradient_h, color);
	}
	function textColor(ref) {
	    var color = ref.color;

	    return chroma(color).get('lab.l') > 60 ? 'black' : 'white';
	}
	function borderColor(ref) {
	    var color = ref.color;

	    return chroma(color)
	        .darker()
	        .hex();
	}
	function data$2() {
	    return {
	        palette: [],
	        prepend: [],
	        append: [],
	        color: '#63c0de'
	    };
	}
	function borderColor_1(c) {
	    return chroma(c).hex('rgb') === '#ffffff' ? '#eeeeee' : c;
	}
	function alpha(c) {
	    return chroma(c).alpha();
	}
	var methods$1 = {
	    setColor: function setColor(color, close) {
	        this.set({ color: color });
	        if (close) {
	            this.refs.dropdown.set({ visible: false });
	        }
	    }
	};

	function onstate(ref) {
	    var this$1 = this;
	    var changed = ref.changed;
	    var current = ref.current;
	    var previous = ref.previous;

	    if (changed.color) {
	        try {
	            var niceHex = chroma(current.color).hex();
	            // eslint-disable-next-line
	            var ref$1 = this.refs.dropdown.get();
	            var visible = ref$1.visible;
	            if (visible && niceHex !== previous.color) {
	                this.fire('change', current.validColor);
	            }
	            if (current.validColor !== current.color) {
	                setTimeout(function () {
	                    this$1.set({ color: current.validColor });
	                }, 100);
	            }
	        } catch (e) {}
	    }
	}
	function findNearest(colors, color) {
	    var nearestIndex = -1;
	    var nearestDistance = 999999;
	    if (colors[0] === colors[1]) { return '-'; }
	    colors.forEach(function (c, i) {
	        var dist = chroma.distance(c, color, 'lab');
	        if (dist < nearestDistance) {
	            nearestDistance = dist;
	            nearestIndex = i;
	        }
	    });
	    return colors[nearestIndex];
	}

	function spread(center, width, num, num2, exp) {
	    var r = [center];
	    var s = width / num;
	    var a = 0;
	    num2 = _isUndefined(num2) ? num : num2;
	    exp = exp || 1;
	    while (num-- > 0) {
	        a += s;
	        r.unshift(center - a);
	        if (num2-- > 0) { r.push(center + a); }
	    }
	    return r;
	}

	function create_main_fragment$2(component, state) {
		var div, text, span, slot_content_default = component._slotted.default, div_1, div_2, div_3, text_2, span_1, text_6, span_2, text_8;

		var if_block = (state.color) && create_if_block$1(component, state);

		var basedropdown = new BaseDropdown({
			root: component.root,
			slots: { default: createFragment(), button: createFragment(), content: createFragment() }
		});

		component.refs.dropdown = basedropdown;

		return {
			c: function create() {
				div = createElement("div");
				text = createText("\n        ");
				span = createElement("span");
				if (!slot_content_default) {
					div_1 = createElement("div");
					div_2 = createElement("div");
					div_3 = createElement("div");
					text_2 = createText("\n                    ");
					span_1 = createElement("span");
				}
				text_6 = createText("\n        ");
				span_2 = createElement("span");
				if (if_block) { if_block.c(); }
				text_8 = createText("\n    ");
				basedropdown._fragment.c();
				this.h();
			},

			h: function hydrate() {
				if (!slot_content_default) {
					div_3.className = "transparency svelte-g14qzo";
					setStyle(div_3, "opacity", ( 1-alpha(state.validColor) ));
					setStyle(div_2, "background", "" + state.validColor + " none repeat scroll 0% 0%");
					div_2.className = "the-color svelte-g14qzo";
					span_1.className = "caret svelte-g14qzo";
					div_1.className = "base-color-picker color-picker svelte-g14qzo";
				}
				setAttribute(span, "slot", "button");
				setAttribute(span_2, "slot", "content");
				div.className = "color-picker-cont svelte-g14qzo";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(text, basedropdown._slotted.default);
				appendNode(span, basedropdown._slotted.button);
				if (!slot_content_default) {
					appendNode(div_1, span);
					appendNode(div_2, div_1);
					appendNode(div_3, div_2);
					appendNode(text_2, div_1);
					appendNode(span_1, div_1);
				}

				else {
					appendNode(slot_content_default, span);
				}

				appendNode(text_6, basedropdown._slotted.default);
				appendNode(span_2, basedropdown._slotted.content);
				if (if_block) { if_block.m(span_2, null); }
				appendNode(text_8, basedropdown._slotted.default);
				basedropdown._mount(div, null);
			},

			p: function update(changed, state) {
				if (!slot_content_default) {
					if (changed.validColor) {
						setStyle(div_3, "opacity", ( 1-alpha(state.validColor) ));
						setStyle(div_2, "background", "" + state.validColor + " none repeat scroll 0% 0%");
				}

				}

				if (state.color) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$1(component, state);
						if_block.c();
						if_block.m(span_2, null);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}
			},

			u: function unmount() {
				detachNode(div);

				if (slot_content_default) {
					reinsertChildren(span, slot_content_default);
				}

				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				basedropdown.destroy(false);
				if (component.refs.dropdown === basedropdown) { component.refs.dropdown = null; }
			}
		};
	}

	// (18:20) {#each palette as c}
	function create_each_block(component, state) {
		var c = state.c, each_value = state.each_value, c_index = state.c_index;
		var div, div_1, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div_1.className = "transparency svelte-g14qzo";
				setStyle(div_1, "opacity", ( 1-alpha(c) ));
				addListener(div, "click", click_handler);
				addListener(div, "dblclick", dblclick_handler);
				div.className = "color svelte-g14qzo";
				div.dataset.color = div_data_color_value = c;
				setStyle(div, "background", c);
				setStyle(div, "border-color", borderColor_1(c));

				div._svelte = {
					component: component,
					each_value: state.each_value,
					c_index: state.c_index
				};
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
			},

			p: function update(changed, state) {
				c = state.c;
				each_value = state.each_value;
				c_index = state.c_index;
				if (changed.palette) {
					setStyle(div_1, "opacity", ( 1-alpha(c) ));
				}

				if ((changed.palette) && div_data_color_value !== (div_data_color_value = c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.palette) {
					setStyle(div, "background", c);
					setStyle(div, "border-color", borderColor_1(c));
				}

				div._svelte.each_value = state.each_value;
				div._svelte.c_index = state.c_index;
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				removeListener(div, "click", click_handler);
				removeListener(div, "dblclick", dblclick_handler);
			}
		};
	}

	// (32:20) {#each gradient_l as c}
	function create_each_block_1(component, state) {
		var c = state.c, each_value_1 = state.each_value_1, c_index_1 = state.c_index_1;
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				addListener(div, "click", click_handler_1);
				div.className = div_class_value = "color " + (c == state.nearest_l?'selected':'') + " svelte-g14qzo";
				div.dataset.color = div_data_color_value = c;
				setStyle(div, "background", c);

				div._svelte = {
					component: component,
					each_value_1: state.each_value_1,
					c_index_1: state.c_index_1
				};
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			p: function update(changed, state) {
				c = state.c;
				each_value_1 = state.each_value_1;
				c_index_1 = state.c_index_1;
				if ((changed.gradient_l || changed.nearest_l) && div_class_value !== (div_class_value = "color " + (c == state.nearest_l?'selected':'') + " svelte-g14qzo")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_l) && div_data_color_value !== (div_data_color_value = c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_l) {
					setStyle(div, "background", c);
				}

				div._svelte.each_value_1 = state.each_value_1;
				div._svelte.c_index_1 = state.c_index_1;
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				removeListener(div, "click", click_handler_1);
			}
		};
	}

	// (37:20) {#each gradient_c as c}
	function create_each_block_2(component, state) {
		var c = state.c, each_value_2 = state.each_value_2, c_index_2 = state.c_index_2;
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				addListener(div, "click", click_handler_2);
				div.className = div_class_value = "color " + (c == state.nearest_c?'selected':'') + " svelte-g14qzo";
				div.dataset.color = div_data_color_value = c;
				setStyle(div, "background", c);

				div._svelte = {
					component: component,
					each_value_2: state.each_value_2,
					c_index_2: state.c_index_2
				};
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			p: function update(changed, state) {
				c = state.c;
				each_value_2 = state.each_value_2;
				c_index_2 = state.c_index_2;
				if ((changed.gradient_c || changed.nearest_c) && div_class_value !== (div_class_value = "color " + (c == state.nearest_c?'selected':'') + " svelte-g14qzo")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_c) && div_data_color_value !== (div_data_color_value = c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_c) {
					setStyle(div, "background", c);
				}

				div._svelte.each_value_2 = state.each_value_2;
				div._svelte.c_index_2 = state.c_index_2;
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				removeListener(div, "click", click_handler_2);
			}
		};
	}

	// (42:20) {#each gradient_h as c}
	function create_each_block_3(component, state) {
		var c = state.c, each_value_3 = state.each_value_3, c_index_3 = state.c_index_3;
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				addListener(div, "click", click_handler_3);
				div.className = div_class_value = "color " + (c == state.nearest_h?'selected':'') + " svelte-g14qzo";
				div.dataset.color = div_data_color_value = c;
				setStyle(div, "background", c);

				div._svelte = {
					component: component,
					each_value_3: state.each_value_3,
					c_index_3: state.c_index_3
				};
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			p: function update(changed, state) {
				c = state.c;
				each_value_3 = state.each_value_3;
				c_index_3 = state.c_index_3;
				if ((changed.gradient_h || changed.nearest_h) && div_class_value !== (div_class_value = "color " + (c == state.nearest_h?'selected':'') + " svelte-g14qzo")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_h) && div_data_color_value !== (div_data_color_value = c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_h) {
					setStyle(div, "background", c);
				}

				div._svelte.each_value_3 = state.each_value_3;
				div._svelte.c_index_3 = state.c_index_3;
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				removeListener(div, "click", click_handler_3);
			}
		};
	}

	// (15:12) {#if color}
	function create_if_block$1(component, state) {
		var div, div_1, text_1, div_2, text_3, div_3, text_5, div_4, text_7, div_5, input, input_updating = false, text_8, button, text_10, div_6, div_7;

		var each_value = state.palette;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block(component, assign(assign({}, state), {
				each_value: each_value,
				c: each_value[i_1],
				c_index: i_1
			}));
		}

		var each_value_1 = state.gradient_l;

		var each_1_blocks = [];

		for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
			each_1_blocks[i_1] = create_each_block_1(component, assign(assign({}, state), {
				each_value_1: each_value_1,
				c: each_value_1[i_1],
				c_index_1: i_1
			}));
		}

		var each_value_2 = state.gradient_c;

		var each_2_blocks = [];

		for (var i_1 = 0; i_1 < each_value_2.length; i_1 += 1) {
			each_2_blocks[i_1] = create_each_block_2(component, assign(assign({}, state), {
				each_value_2: each_value_2,
				c: each_value_2[i_1],
				c_index_2: i_1
			}));
		}

		var each_value_3 = state.gradient_h;

		var each_3_blocks = [];

		for (var i_1 = 0; i_1 < each_value_3.length; i_1 += 1) {
			each_3_blocks[i_1] = create_each_block_3(component, assign(assign({}, state), {
				each_value_3: each_value_3,
				c: each_value_3[i_1],
				c_index_3: i_1
			}));
		}

		function input_input_handler() {
			input_updating = true;
			component.set({ color: input.value });
			input_updating = false;
		}

		function click_handler_4(event) {
			var state = component.get();
			component.setColor(state.color, true);
		}

		function click_handler_5(event) {
			event.stopPropagation();
		}

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}

				text_1 = createText("\n\n                ");
				div_2 = createElement("div");

				for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
					each_1_blocks[i_1].c();
				}

				text_3 = createText("\n                ");
				div_3 = createElement("div");

				for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
					each_2_blocks[i_1].c();
				}

				text_5 = createText("\n                ");
				div_4 = createElement("div");

				for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
					each_3_blocks[i_1].c();
				}

				text_7 = createText("\n\n                ");
				div_5 = createElement("div");
				input = createElement("input");
				text_8 = createText("\n                    ");
				button = createElement("button");
				button.innerHTML = "<i class=\"icon-ok\"></i>";
				text_10 = createText("\n                    ");
				div_6 = createElement("div");
				div_7 = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div_1.className = "palette svelte-g14qzo";
				div_2.className = "color-axis lightness";
				div_3.className = "color-axis saturation";
				div_4.className = "color-axis hue";
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				setStyle(input, "background", state.color);
				setStyle(input, "border-color", borderColor_1);
				setStyle(input, "color", state.textColor);
				input.className = "hex svelte-g14qzo";
				addListener(button, "click", click_handler_4);
				button.className = "btn btn-small ok";
				div_7.className = "transparency svelte-g14qzo";
				setStyle(div_7, "opacity", ( 1-alpha(state.color) ));
				div_6.className = "color selected";
				setStyle(div_6, "background", state.color);
				div_5.className = "footer svelte-g14qzo";
				addListener(div, "click", click_handler_5);
				div.className = "color-selector svelte-g14qzo";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(div_1, null);
				}

				appendNode(text_1, div);
				appendNode(div_2, div);

				for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
					each_1_blocks[i_1].m(div_2, null);
				}

				appendNode(text_3, div);
				appendNode(div_3, div);

				for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
					each_2_blocks[i_1].m(div_3, null);
				}

				appendNode(text_5, div);
				appendNode(div_4, div);

				for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
					each_3_blocks[i_1].m(div_4, null);
				}

				appendNode(text_7, div);
				appendNode(div_5, div);
				appendNode(input, div_5);

				input.value = state.color;

				appendNode(text_8, div_5);
				appendNode(button, div_5);
				appendNode(text_10, div_5);
				appendNode(div_6, div_5);
				appendNode(div_7, div_6);
			},

			p: function update(changed, state) {
				var each_value = state.palette;

				if (changed.palette) {
					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							c: each_value[i_1],
							c_index: i_1
						});

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, each_context);
						} else {
							each_blocks[i_1] = create_each_block(component, each_context);
							each_blocks[i_1].c();
							each_blocks[i_1].m(div_1, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].u();
						each_blocks[i_1].d();
					}
					each_blocks.length = each_value.length;
				}

				var each_value_1 = state.gradient_l;

				if (changed.gradient_l || changed.nearest_l) {
					for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
						var each_1_context = assign(assign({}, state), {
							each_value_1: each_value_1,
							c: each_value_1[i_1],
							c_index_1: i_1
						});

						if (each_1_blocks[i_1]) {
							each_1_blocks[i_1].p(changed, each_1_context);
						} else {
							each_1_blocks[i_1] = create_each_block_1(component, each_1_context);
							each_1_blocks[i_1].c();
							each_1_blocks[i_1].m(div_2, null);
						}
					}

					for (; i_1 < each_1_blocks.length; i_1 += 1) {
						each_1_blocks[i_1].u();
						each_1_blocks[i_1].d();
					}
					each_1_blocks.length = each_value_1.length;
				}

				var each_value_2 = state.gradient_c;

				if (changed.gradient_c || changed.nearest_c) {
					for (var i_1 = 0; i_1 < each_value_2.length; i_1 += 1) {
						var each_2_context = assign(assign({}, state), {
							each_value_2: each_value_2,
							c: each_value_2[i_1],
							c_index_2: i_1
						});

						if (each_2_blocks[i_1]) {
							each_2_blocks[i_1].p(changed, each_2_context);
						} else {
							each_2_blocks[i_1] = create_each_block_2(component, each_2_context);
							each_2_blocks[i_1].c();
							each_2_blocks[i_1].m(div_3, null);
						}
					}

					for (; i_1 < each_2_blocks.length; i_1 += 1) {
						each_2_blocks[i_1].u();
						each_2_blocks[i_1].d();
					}
					each_2_blocks.length = each_value_2.length;
				}

				var each_value_3 = state.gradient_h;

				if (changed.gradient_h || changed.nearest_h) {
					for (var i_1 = 0; i_1 < each_value_3.length; i_1 += 1) {
						var each_3_context = assign(assign({}, state), {
							each_value_3: each_value_3,
							c: each_value_3[i_1],
							c_index_3: i_1
						});

						if (each_3_blocks[i_1]) {
							each_3_blocks[i_1].p(changed, each_3_context);
						} else {
							each_3_blocks[i_1] = create_each_block_3(component, each_3_context);
							each_3_blocks[i_1].c();
							each_3_blocks[i_1].m(div_4, null);
						}
					}

					for (; i_1 < each_3_blocks.length; i_1 += 1) {
						each_3_blocks[i_1].u();
						each_3_blocks[i_1].d();
					}
					each_3_blocks.length = each_value_3.length;
				}

				if (!input_updating) { input.value = state.color; }
				if (changed.color) {
					setStyle(input, "background", state.color);
				}

				if (changed.textColor) {
					setStyle(input, "color", state.textColor);
				}

				if (changed.color) {
					setStyle(div_7, "opacity", ( 1-alpha(state.color) ));
					setStyle(div_6, "background", state.color);
				}
			},

			u: function unmount() {
				detachNode(div);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].u();
				}

				for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
					each_1_blocks[i_1].u();
				}

				for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
					each_2_blocks[i_1].u();
				}

				for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
					each_3_blocks[i_1].u();
				}
			},

			d: function destroy() {
				destroyEach(each_blocks);

				destroyEach(each_1_blocks);

				destroyEach(each_2_blocks);

				destroyEach(each_3_blocks);

				removeListener(input, "input", input_input_handler);
				removeListener(button, "click", click_handler_4);
				removeListener(div, "click", click_handler_5);
			}
		};
	}

	function click_handler(event) {
		var component = this._svelte.component;
		var each_value = this._svelte.each_value, c_index = this._svelte.c_index, c = each_value[c_index];
		component.setColor(c, false);
	}

	function dblclick_handler(event) {
		var component = this._svelte.component;
		var each_value = this._svelte.each_value, c_index = this._svelte.c_index, c = each_value[c_index];
		component.setColor(c, true);
	}

	function click_handler_1(event) {
		var component = this._svelte.component;
		var each_value_1 = this._svelte.each_value_1, c_index_1 = this._svelte.c_index_1, c = each_value_1[c_index_1];
		component.setColor(c, false);
	}

	function click_handler_2(event) {
		var component = this._svelte.component;
		var each_value_2 = this._svelte.each_value_2, c_index_2 = this._svelte.c_index_2, c = each_value_2[c_index_2];
		component.setColor(c, false);
	}

	function click_handler_3(event) {
		var component = this._svelte.component;
		var each_value_3 = this._svelte.each_value_3, c_index_3 = this._svelte.c_index_3, c = each_value_3[c_index_3];
		component.setColor(c, false);
	}

	function ColorPicker(options) {
		this._debugName = '<ColorPicker>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["themeData"]), data$2()), options.data);
		this.store._add(this, ["themeData"]);
		this._recompute({ $themeData: 1, prepend: 1, append: 1, color: 1, palette: 1, gradient_l: 1, gradient_c: 1, gradient_h: 1 }, this._state);
		if (!('$themeData' in this._state)) { console.warn("<ColorPicker> was created without expected data property '$themeData'"); }
		if (!('prepend' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'prepend'"); }
		if (!('append' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'append'"); }
		if (!('color' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'color'"); }

		this._handlers.state = [onstate];

		this._handlers.destroy = [removeFromStore];

		this._slotted = options.slots || {};

		var self = this;
		var _oncreate = function() {
			var changed = { $themeData: 1, prepend: 1, append: 1, color: 1, palette: 1, gradient_l: 1, gradient_c: 1, gradient_h: 1, validColor: 1, nearest_l: 1, nearest_c: 1, nearest_h: 1, textColor: 1 };
			onstate.call(self, { changed: changed, current: self._state });
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this.slots = {};

		this._fragment = create_main_fragment$2(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(ColorPicker.prototype, protoDev);
	assign(ColorPicker.prototype, methods$1);

	ColorPicker.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('palette' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'palette'"); }
		if ('validColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'validColor'"); }
		if ('gradient_l' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_l'"); }
		if ('gradient_c' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_c'"); }
		if ('gradient_h' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_h'"); }
		if ('nearest_l' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_l'"); }
		if ('nearest_c' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_c'"); }
		if ('nearest_h' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_h'"); }
		if ('textColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'textColor'"); }
		if ('borderColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'borderColor'"); }
	};

	ColorPicker.prototype._recompute = function _recompute(changed, state) {
		if (changed.$themeData || changed.prepend || changed.append) {
			if (this._differs(state.palette, (state.palette = palette(state)))) { changed.palette = true; }
		}

		if (changed.color) {
			if (this._differs(state.validColor, (state.validColor = validColor(state)))) { changed.validColor = true; }
			if (this._differs(state.gradient_l, (state.gradient_l = gradient_l(state)))) { changed.gradient_l = true; }
		}

		if (changed.color || changed.palette) {
			if (this._differs(state.gradient_c, (state.gradient_c = gradient_c(state)))) { changed.gradient_c = true; }
		}

		if (changed.color) {
			if (this._differs(state.gradient_h, (state.gradient_h = gradient_h(state)))) { changed.gradient_h = true; }
		}

		if (changed.color || changed.gradient_l) {
			if (this._differs(state.nearest_l, (state.nearest_l = nearest_l(state)))) { changed.nearest_l = true; }
		}

		if (changed.color || changed.gradient_c) {
			if (this._differs(state.nearest_c, (state.nearest_c = nearest_c(state)))) { changed.nearest_c = true; }
		}

		if (changed.color || changed.gradient_h) {
			if (this._differs(state.nearest_h, (state.nearest_h = nearest_h(state)))) { changed.nearest_h = true; }
		}

		if (changed.color) {
			if (this._differs(state.textColor, (state.textColor = textColor(state)))) { changed.textColor = true; }
			if (this._differs(state.borderColor, (state.borderColor = borderColor(state)))) { changed.borderColor = true; }
		}
	};

	/* controls/ControlGroup.html generated by Svelte v1.64.0 */

	var def = {
	    width: '100px',
	    valign: 'baseline'
	};

	function create_main_fragment$3(component, state) {
		var div, text, div_1, slot_content_default = component._slotted.default, slot_content_default_after, text_1, div_class_value;

		var if_block = (state.label) && create_if_block$2(component, state);

		var if_block_1 = (state.help) && create_if_block_1(component, state);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block) { if_block.c(); }
				text = createText("\n    ");
				div_1 = createElement("div");
				text_1 = createText("\n        ");
				if (if_block_1) { if_block_1.c(); }
				this.h();
			},

			h: function hydrate() {
				div_1.className = "controls";
				setStyle(div_1, "width", "calc(100% - " + ( state.width||def.width ) + " - 40px)");
				div.className = div_class_value = "control-group vis-option-group vis-option-type-number label-" + (state.valign||def.valign) + " svelte-1c2jnzb";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				if (if_block) { if_block.m(div, null); }
				appendNode(text, div);
				appendNode(div_1, div);

				if (slot_content_default) {
					appendNode(slot_content_default, div_1);
					appendNode(slot_content_default_after || (slot_content_default_after = createComment()), div_1);
				}

				appendNode(text_1, div_1);
				if (if_block_1) { if_block_1.m(div_1, null); }
			},

			p: function update(changed, state) {
				if (state.label) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$2(component, state);
						if_block.c();
						if_block.m(div, text);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (state.help) {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1(component, state);
						if_block_1.c();
						if_block_1.m(div_1, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				if (changed.width) {
					setStyle(div_1, "width", "calc(100% - " + ( state.width||def.width ) + " - 40px)");
				}

				if ((changed.valign) && div_class_value !== (div_class_value = "control-group vis-option-group vis-option-type-number label-" + (state.valign||def.valign) + " svelte-1c2jnzb")) {
					div.className = div_class_value;
				}
			},

			u: function unmount() {
				detachNode(div);
				if (if_block) { if_block.u(); }

				if (slot_content_default) {
					reinsertBefore(slot_content_default_after, slot_content_default);
				}

				if (if_block_1) { if_block_1.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				if (if_block_1) { if_block_1.d(); }
			}
		};
	}

	// (3:4) {#if label}
	function create_if_block$2(component, state) {
		var label, label_class_value;

		return {
			c: function create() {
				label = createElement("label");
				this.h();
			},

			h: function hydrate() {
				setStyle(label, "width", ( state.width||def.width ));
				label.className = label_class_value = "control-label " + (state.disabled ? 'disabled' : '') + " svelte-1c2jnzb";
			},

			m: function mount(target, anchor) {
				insertNode(label, target, anchor);
				label.innerHTML = state.label;
			},

			p: function update(changed, state) {
				if (changed.label) {
					label.innerHTML = state.label;
				}

				if (changed.width) {
					setStyle(label, "width", ( state.width||def.width ));
				}

				if ((changed.disabled) && label_class_value !== (label_class_value = "control-label " + (state.disabled ? 'disabled' : '') + " svelte-1c2jnzb")) {
					label.className = label_class_value;
				}
			},

			u: function unmount() {
				label.innerHTML = '';

				detachNode(label);
			},

			d: noop
		};
	}

	// (8:8) {#if help}
	function create_if_block_1(component, state) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				this.h();
			},

			h: function hydrate() {
				p.className = "mini-help svelte-1c2jnzb";
			},

			m: function mount(target, anchor) {
				insertNode(p, target, anchor);
				p.innerHTML = state.help;
			},

			p: function update(changed, state) {
				if (changed.help) {
					p.innerHTML = state.help;
				}
			},

			u: function unmount() {
				p.innerHTML = '';

				detachNode(p);
			},

			d: noop
		};
	}

	function ControlGroup(options) {
		this._debugName = '<ControlGroup>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign({}, options.data);
		if (!('valign' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'valign'"); }
		if (!('label' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'label'"); }
		if (!('width' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'width'"); }
		if (!('disabled' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'disabled'"); }
		if (!('help' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'help'"); }

		this._slotted = options.slots || {};

		this.slots = {};

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* @DEPRECATED: plase use @datawrapper/shared instead */

	/**
	 * Remove all html tags from the given string
	 *
	 * written by Kevin van Zonneveld et.al.
	 * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
	 */
	var TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	var COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	var defaultAllowed = '<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

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
	    if (typeof document === 'undefined') { return input; }
	    var d = document.createElement('div');
	    d.innerHTML = input;
	    var sel = d.querySelectorAll('*');
	    for (var i = 0; i < sel.length; i++) {
	        for (var j = 0; j < sel[i].attributes.length; j++) {
	            var attrib = sel[i].attributes[j];
	            if (attrib.specified) {
	                if (attrib.name.substr(0, 2) === 'on') { sel[i].removeAttribute(attrib.name); }
	            }
	        }
	    }
	    return d.innerHTML;
	}

	function stripTags(input, allowed) {
	    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	    allowed = (((allowed !== undefined ? allowed || '' : defaultAllowed) + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

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

	/* controls/Color.html generated by Svelte v1.64.0 */

	function palette_1(ref) {
	    var $themeData = ref.$themeData;

	    return $themeData.colors.palette;
	}
	function colorKeys(ref) {
	    var $vis = ref.$vis;
	    var customizable = ref.customizable;
	    var axis = ref.axis;
	    var custom = ref.custom;
	    var palette = ref.palette;

	    if (!$vis || !customizable) { return []; }
	    return (axis
	        ? _uniq(
	              $vis.axes(true)[axis].type() === 'date'
	                  ? $vis.axes(true)[axis].raw() // raw values for date cols
	                  : $vis.axes(true)[axis].values() // fmt values else
	          )
	        : $vis.colorKeys
	        ? $vis.colorKeys()
	        : $vis.keys()
	    ).map(function (k) {
	        k = stripTags$1(k);
	        return {
	            key: k,
	            defined: custom[k] !== undefined,
	            color: custom[k] !== undefined ? getColor(custom[k], palette) : '#cccccc'
	        };
	    });
	}
	function hexColor(ref) {
	    var value = ref.value;
	    var palette = ref.palette;

	    return getColor(value, palette);
	}
	function customColor(ref) {
	    var selected = ref.selected;
	    var palette = ref.palette;
	    var custom = ref.custom;

	    if (custom[selected[0]] === undefined) { return '#ccc'; }
	    var realColors = selected.filter(function (s) { return custom[s] !== undefined; }).map(function (s) { return getColor(custom[s], palette); });
	    if (!realColors.length) { return '#ccc'; }
	    // if (realColors.length == 1) return realColors[0];
	    return chroma.average(realColors, 'lab');
	}
	function data$3() {
	    return {
	        open: false,
	        openCustom: false,
	        customizable: false,
	        expanded: false,
	        selected: [],
	        custom: {}
	    };
	}
	var methods$2 = {
	    update: function update(color) {
	        var ref = this.get();
	        var palette = ref.palette;
	        this.set({ value: storeColor(color, palette) });
	    },
	    updateCustom: function updateCustom(color) {
	        var ref = this.get();
	        var selected = ref.selected;
	        var palette = ref.palette;
	        var custom = ref.custom;
	        selected.forEach(function (k) { return (custom[k] = storeColor(color, palette)); });
	        this.set({ custom: custom });
	    },
	    toggle: function toggle(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var expanded = ref.expanded;
	        this.set({ expanded: !expanded });
	    },
	    toggleSelect: function toggleSelect(k, event) {
	        event.preventDefault();
	        var ref = this.get();
	        var selected = ref.selected;
	        var i = selected.indexOf(k);
	        if (event.shiftKey) {
	            if (i > -1) { selected.splice(i, 1); }
	            else { selected.push(k); }
	        } else {
	            selected.length = 1;
	            selected[0] = k;
	        }
	        this.set({ selected: selected });
	    },
	    getColor: function getColor$1(color) {
	        var ref = this.get();
	        var palette = ref.palette;
	        return getColor(color, palette);
	    },
	    reset: function reset() {
	        var ref = this.get();
	        var selected = ref.selected;
	        var custom = ref.custom;
	        selected.forEach(function (k) { return delete custom[k]; });
	        this.set({ custom: custom });
	    },
	    resetAll: function resetAll() {
	        var ref = this.get();
	        var custom = ref.custom;
	        Object.keys(custom).forEach(function (k) { return delete custom[k]; });
	        this.set({ custom: custom });
	    },
	    selectAll: function selectAll(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var selected = ref.selected;
	        var colorKeys = ref.colorKeys;
	        colorKeys.forEach(function (k) {
	            if (selected.indexOf(k.key) < 0) { selected.push(k.key); }
	        });
	        this.set({ selected: selected });
	    },
	    selectNone: function selectNone(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var selected = ref.selected;
	        selected.length = 0;
	        this.set({ selected: selected });
	    },
	    selectInvert: function selectInvert(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var selected = ref.selected;
	        var colorKeys = ref.colorKeys;
	        colorKeys.forEach(function (k) {
	            var i = selected.indexOf(k.key);
	            if (i < 0) { selected.push(k.key); }
	            else { selected.splice(i, 1); }
	        });
	        this.set({ selected: selected });
	    }
	};

	function oncreate() {
	    var this$1 = this;

	    this.observe('custom', function (c) {
	        if (c && c.length === 0) {
	            c = {};
	        }
	        this$1.set({ custom: c });
	    });
	}
	function storeColor(color, palette) {
	    var pi = palette.indexOf(color);
	    if (pi > -1) { return pi; }
	    return color;
	}

	function getColor(color, palette) {
	    return typeof color === 'number' ? palette[color % palette.length] : color;
	}

	function stripTags$1(s) {
	    return purifyHtml(s, '');
	}

	function create_main_fragment$4(component, state) {
		var text, if_block_anchor, text_1, if_block_1_anchor, text_2, text_3, if_block_2_anchor;

		var if_block = (state.hexColor) && create_if_block$3(component, state);

		var if_block_1 = (state.customizable) && create_if_block_1$1(component, state);

		var controlgroup_initial_data = { label: state.label, width: state.width||'100px' };
		var controlgroup = new ControlGroup({
			root: component.root,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block_2 = (state.customizable && state.expanded) && create_if_block_2(component, state);

		return {
			c: function create() {
				text = createText("\n    ");
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
				text_1 = createText(" ");
				if (if_block_1) { if_block_1.c(); }
				if_block_1_anchor = createComment();
				text_2 = createText("\n");
				controlgroup._fragment.c();
				text_3 = createText("\n\n");
				if (if_block_2) { if_block_2.c(); }
				if_block_2_anchor = createComment();
			},

			m: function mount(target, anchor) {
				appendNode(text, controlgroup._slotted.default);
				if (if_block) { if_block.m(controlgroup._slotted.default, null); }
				appendNode(if_block_anchor, controlgroup._slotted.default);
				appendNode(text_1, controlgroup._slotted.default);
				if (if_block_1) { if_block_1.m(controlgroup._slotted.default, null); }
				appendNode(if_block_1_anchor, controlgroup._slotted.default);
				appendNode(text_2, controlgroup._slotted.default);
				controlgroup._mount(target, anchor);
				insertNode(text_3, target, anchor);
				if (if_block_2) { if_block_2.m(target, anchor); }
				insertNode(if_block_2_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (state.hexColor) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$3(component, state);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (state.customizable) {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1$1(component, state);
						if_block_1.c();
						if_block_1.m(if_block_1_anchor.parentNode, if_block_1_anchor);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				var controlgroup_changes = {};
				if (changed.label) { controlgroup_changes.label = state.label; }
				if (changed.width) { controlgroup_changes.width = state.width||'100px'; }
				controlgroup._set(controlgroup_changes);

				if (state.customizable && state.expanded) {
					if (if_block_2) {
						if_block_2.p(changed, state);
					} else {
						if_block_2 = create_if_block_2(component, state);
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
				if (if_block) { if_block.u(); }
				if (if_block_1) { if_block_1.u(); }
				controlgroup._unmount();
				detachNode(text_3);
				if (if_block_2) { if_block_2.u(); }
				detachNode(if_block_2_anchor);
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				if (if_block_1) { if_block_1.d(); }
				controlgroup.destroy(false);
				if (if_block_2) { if_block_2.d(); }
			}
		};
	}

	// (3:4) {#if hexColor}
	function create_if_block$3(component, state) {
		var colorpicker_updating = {};

		var colorpicker_initial_data = { color: state.hexColor, palette: state.palette };
		if ('open' in state) {
			colorpicker_initial_data.visible = state.open;
			colorpicker_updating.visible = true;
		}
		var colorpicker = new ColorPicker({
			root: component.root,
			data: colorpicker_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!colorpicker_updating.visible && changed.visible) {
					newState.open = childState.visible;
				}
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			colorpicker._bind({ visible: 1 }, colorpicker.get());
		});

		colorpicker.on("change", function(event) {
			component.update(event);
		});

		return {
			c: function create() {
				colorpicker._fragment.c();
			},

			m: function mount(target, anchor) {
				colorpicker._mount(target, anchor);
			},

			p: function update(changed, state) {
				var colorpicker_changes = {};
				if (changed.hexColor) { colorpicker_changes.color = state.hexColor; }
				if (changed.palette) { colorpicker_changes.palette = state.palette; }
				if (!colorpicker_updating.visible && changed.open) {
					colorpicker_changes.visible = state.open;
					colorpicker_updating.visible = true;
				}
				colorpicker._set(colorpicker_changes);
				colorpicker_updating = {};
			},

			u: function unmount() {
				colorpicker._unmount();
			},

			d: function destroy() {
				colorpicker.destroy(false);
			}
		};
	}

	// (5:10) {#if customizable}
	function create_if_block_1$1(component, state) {
		var span, a, a_class_value;

		function click_handler(event) {
			component.toggle(event);
		}

		return {
			c: function create() {
				span = createElement("span");
				a = createElement("a");
				a.textContent = "customize colors...";
				this.h();
			},

			h: function hydrate() {
				addListener(a, "click", click_handler);
				a.href = "#customize";
				a.className = a_class_value = "btn btn-small custom " + (state.expanded?'btn-primary':'');
				setAttribute(a, "role", "button");
				span.className = "custom-color-selector-head";
			},

			m: function mount(target, anchor) {
				insertNode(span, target, anchor);
				appendNode(a, span);
			},

			p: function update(changed, state) {
				if ((changed.expanded) && a_class_value !== (a_class_value = "btn btn-small custom " + (state.expanded?'btn-primary':''))) {
					a.className = a_class_value;
				}
			},

			u: function unmount() {
				detachNode(span);
			},

			d: function destroy() {
				removeListener(a, "click", click_handler);
			}
		};
	}

	// (18:16) {#each colorKeys as k}
	function create_each_block$1(component, state) {
		var k = state.k, each_value = state.each_value, k_index = state.k_index;
		var li, div, text_value = !k.defined ? '×' : '', text, text_1, label, text_2_value = k.key, text_2, li_class_value, li_data_series_value;

		return {
			c: function create() {
				li = createElement("li");
				div = createElement("div");
				text = createText(text_value);
				text_1 = createText("\n                    ");
				label = createElement("label");
				text_2 = createText(text_2_value);
				this.h();
			},

			h: function hydrate() {
				div.className = "color";
				setStyle(div, "background", k.color);
				addListener(li, "click", click_handler$1);
				li.className = li_class_value = state.selected.indexOf(k.key) > -1 ? 'selected':'';
				li.dataset.series = li_data_series_value = k.key;

				li._svelte = {
					component: component,
					each_value: state.each_value,
					k_index: state.k_index
				};
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				appendNode(div, li);
				appendNode(text, div);
				appendNode(text_1, li);
				appendNode(label, li);
				appendNode(text_2, label);
			},

			p: function update(changed, state) {
				k = state.k;
				each_value = state.each_value;
				k_index = state.k_index;
				if ((changed.colorKeys) && text_value !== (text_value = !k.defined ? '×' : '')) {
					text.data = text_value;
				}

				if (changed.colorKeys) {
					setStyle(div, "background", k.color);
				}

				if ((changed.colorKeys) && text_2_value !== (text_2_value = k.key)) {
					text_2.data = text_2_value;
				}

				if ((changed.selected || changed.colorKeys) && li_class_value !== (li_class_value = state.selected.indexOf(k.key) > -1 ? 'selected':'')) {
					li.className = li_class_value;
				}

				if ((changed.colorKeys) && li_data_series_value !== (li_data_series_value = k.key)) {
					li.dataset.series = li_data_series_value;
				}

				li._svelte.each_value = state.each_value;
				li._svelte.k_index = state.k_index;
			},

			u: function unmount() {
				detachNode(li);
			},

			d: function destroy() {
				removeListener(li, "click", click_handler$1);
			}
		};
	}

	// (33:12) {#if selected.length}
	function create_if_block_3(component, state) {
		var div, colorpicker_updating = {}, text, button;

		var colorpicker_initial_data = {
		 	color: state.customColor,
		 	palette: state.palette
		 };
		if ('openCustom' in state) {
			colorpicker_initial_data.visible = state.openCustom;
			colorpicker_updating.visible = true;
		}
		var colorpicker = new ColorPicker({
			root: component.root,
			data: colorpicker_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!colorpicker_updating.visible && changed.visible) {
					newState.openCustom = childState.visible;
				}
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			colorpicker._bind({ visible: 1 }, colorpicker.get());
		});

		colorpicker.on("change", function(event) {
			component.updateCustom(event);
		});

		function click_handler_1(event) {
			component.reset();
		}

		return {
			c: function create() {
				div = createElement("div");
				colorpicker._fragment.c();
				text = createText("\n                ");
				button = createElement("button");
				button.textContent = "Reset";
				this.h();
			},

			h: function hydrate() {
				addListener(button, "click", click_handler_1);
				button.className = "btn";
				div.className = "select";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				colorpicker._mount(div, null);
				appendNode(text, div);
				appendNode(button, div);
			},

			p: function update(changed, state) {
				var colorpicker_changes = {};
				if (changed.customColor) { colorpicker_changes.color = state.customColor; }
				if (changed.palette) { colorpicker_changes.palette = state.palette; }
				if (!colorpicker_updating.visible && changed.openCustom) {
					colorpicker_changes.visible = state.openCustom;
					colorpicker_updating.visible = true;
				}
				colorpicker._set(colorpicker_changes);
				colorpicker_updating = {};
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				colorpicker.destroy(false);
				removeListener(button, "click", click_handler_1);
			}
		};
	}

	// (38:12) {:else}
	function create_if_block_4(component, state) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.textContent = "Please select an element on the left to change colors for individual elements...";
				this.h();
			},

			h: function hydrate() {
				div.className = "info";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			p: noop,

			u: function unmount() {
				detachNode(div);
			},

			d: noop
		};
	}

	// (12:0) {#if customizable && expanded}
	function create_if_block_2(component, state) {
		var div, div_1, div_2, h4, text_1, ul, text_2, div_3, text_3, a, text_5, a_1, text_7, a_2, text_11, div_4, h4_1, text_13, text_14, button;

		var each_value = state.colorKeys;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, assign(assign({}, state), {
				each_value: each_value,
				k: each_value[i],
				k_index: i
			}));
		}

		function click_handler_1(event) {
			component.selectAll(event);
		}

		function click_handler_2(event) {
			component.selectNone(event);
		}

		function click_handler_3(event) {
			component.selectInvert(event);
		}

		function select_block_type(state) {
			if (state.selected.length) { return create_if_block_3; }
			return create_if_block_4;
		}

		var current_block_type = select_block_type(state);
		var if_block = current_block_type(component, state);

		function click_handler_4(event) {
			component.resetAll();
		}

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				div_2 = createElement("div");
				h4 = createElement("h4");
				h4.textContent = "Select element(s):";
				text_1 = createText("\n            ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text_2 = createText("\n            ");
				div_3 = createElement("div");
				text_3 = createText("Select:  \n                ");
				a = createElement("a");
				a.textContent = "all";
				text_5 = createText("   ");
				a_1 = createElement("a");
				a_1.textContent = "none";
				text_7 = createText("  \n                ");
				a_2 = createElement("a");
				a_2.textContent = "invert";
				text_11 = createText("\n        ");
				div_4 = createElement("div");
				h4_1 = createElement("h4");
				h4_1.textContent = "Choose a color:";
				text_13 = createText("\n            ");
				if_block.c();
				text_14 = createText("\n            ");
				button = createElement("button");
				button.textContent = "Reset all colors";
				this.h();
			},

			h: function hydrate() {
				ul.className = "dataseries unstyled";
				addListener(a, "click", click_handler_1);
				a.href = "#/select-all";
				addListener(a_1, "click", click_handler_2);
				a_1.href = "#/select-none";
				addListener(a_2, "click", click_handler_3);
				a_2.href = "#/select-invert";
				setStyle(div_3, "font-size", "12px");
				setStyle(div_3, "text-align", "center");
				setStyle(div_3, "margin-bottom", "10px");
				div_2.className = "span2";
				setStyle(div_2, "width", "43%");
				addListener(button, "click", click_handler_4);
				setStyle(button, "margin-top", "20px");
				button.className = "btn";
				div_4.className = "span2";
				setStyle(div_4, "width", "42%");
				div_1.className = "row";
				div.className = "custom-color-selector-body";
				setStyle(div, "display", "block");
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(div_2, div_1);
				appendNode(h4, div_2);
				appendNode(text_1, div_2);
				appendNode(ul, div_2);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				appendNode(text_2, div_2);
				appendNode(div_3, div_2);
				appendNode(text_3, div_3);
				appendNode(a, div_3);
				appendNode(text_5, div_3);
				appendNode(a_1, div_3);
				appendNode(text_7, div_3);
				appendNode(a_2, div_3);
				appendNode(text_11, div_1);
				appendNode(div_4, div_1);
				appendNode(h4_1, div_4);
				appendNode(text_13, div_4);
				if_block.m(div_4, null);
				appendNode(text_14, div_4);
				appendNode(button, div_4);
			},

			p: function update(changed, state) {
				var each_value = state.colorKeys;

				if (changed.colorKeys || changed.selected) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							k: each_value[i],
							k_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$1(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}

				if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
					if_block.p(changed, state);
				} else {
					if_block.u();
					if_block.d();
					if_block = current_block_type(component, state);
					if_block.c();
					if_block.m(div_4, text_14);
				}
			},

			u: function unmount() {
				detachNode(div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				if_block.u();
			},

			d: function destroy() {
				destroyEach(each_blocks);

				removeListener(a, "click", click_handler_1);
				removeListener(a_1, "click", click_handler_2);
				removeListener(a_2, "click", click_handler_3);
				if_block.d();
				removeListener(button, "click", click_handler_4);
			}
		};
	}

	function click_handler$1(event) {
		var component = this._svelte.component;
		var each_value = this._svelte.each_value, k_index = this._svelte.k_index, k = each_value[k_index];
		component.toggleSelect(k.key, event);
	}

	function Color(options) {
		this._debugName = '<Color>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(assign(this.store._init(["vis","themeData"]), data$3()), options.data);
		this.store._add(this, ["vis","themeData"]);
		this._recompute({ $themeData: 1, $vis: 1, customizable: 1, axis: 1, custom: 1, palette: 1, value: 1, selected: 1 }, this._state);
		if (!('$vis' in this._state)) { console.warn("<Color> was created without expected data property '$vis'"); }
		if (!('customizable' in this._state)) { console.warn("<Color> was created without expected data property 'customizable'"); }
		if (!('axis' in this._state)) { console.warn("<Color> was created without expected data property 'axis'"); }
		if (!('custom' in this._state)) { console.warn("<Color> was created without expected data property 'custom'"); }

		if (!('$themeData' in this._state)) { console.warn("<Color> was created without expected data property '$themeData'"); }
		if (!('value' in this._state)) { console.warn("<Color> was created without expected data property 'value'"); }
		if (!('selected' in this._state)) { console.warn("<Color> was created without expected data property 'selected'"); }
		if (!('label' in this._state)) { console.warn("<Color> was created without expected data property 'label'"); }
		if (!('width' in this._state)) { console.warn("<Color> was created without expected data property 'width'"); }

		if (!('open' in this._state)) { console.warn("<Color> was created without expected data property 'open'"); }
		if (!('expanded' in this._state)) { console.warn("<Color> was created without expected data property 'expanded'"); }


		if (!('openCustom' in this._state)) { console.warn("<Color> was created without expected data property 'openCustom'"); }

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { $vis: 1, customizable: 1, axis: 1, custom: 1, palette: 1, $themeData: 1, value: 1, selected: 1, label: 1, width: 1, hexColor: 1, open: 1, expanded: 1, colorKeys: 1, customColor: 1, openCustom: 1 };
			oncreate.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$4(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Color.prototype, protoDev);
	assign(Color.prototype, methods$2);

	Color.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('palette' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'palette'"); }
		if ('colorKeys' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'colorKeys'"); }
		if ('hexColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'hexColor'"); }
		if ('customColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'customColor'"); }
	};

	Color.prototype._recompute = function _recompute(changed, state) {
		if (changed.$themeData) {
			if (this._differs(state.palette, (state.palette = palette_1(state)))) { changed.palette = true; }
		}

		if (changed.$vis || changed.customizable || changed.axis || changed.custom || changed.palette) {
			if (this._differs(state.colorKeys, (state.colorKeys = colorKeys(state)))) { changed.colorKeys = true; }
		}

		if (changed.value || changed.palette) {
			if (this._differs(state.hexColor, (state.hexColor = hexColor(state)))) { changed.hexColor = true; }
		}

		if (changed.selected || changed.palette || changed.custom) {
			if (this._differs(state.customColor, (state.customColor = customColor(state)))) { changed.customColor = true; }
		}
	};

	/* controls/CustomFormat.html generated by Svelte v1.64.0 */

	function axisCol(ref) {
	    var $vis = ref.$vis;
	    var $dataset = ref.$dataset;
	    var axis = ref.axis;

	    if (!$vis || !axis) { return null; }
	    var colids = $vis.axes()[axis];
	    return $dataset.column(typeof colids === 'object' ? colids[0] : colids);
	}
	function customFormatHelp(ref) {
	    var axisCol = ref.axisCol;
	    var disabled = ref.disabled;

	    if (!axisCol) { return; }
	    if (axisCol.type() === 'date')
	        { return ((disabled ? '' : '<a href="http://momentjs.com/docs/#/displaying/format/" target="_blank">') + "moment.js documentation" + (disabled ? '' : '</a>')); }
	    if (axisCol.type() === 'number')
	        { return ((disabled ? '' : '<a href="http://numeraljs.com/#format" target="_blank">') + "numeral.js documentation" + (disabled ? '' : '</a>')); }
	    return '';
	}
	function options(ref) {
	    var axisCol = ref.axisCol;

	    if (!axisCol) { return []; }
	    if (axisCol.type() === 'number') {
	        // todo: translate labels
	        return [
	            { l: '1,000[.00]', f: '0,0.[00]' },
	            { l: '0', f: '0' },
	            { l: '0.0', f: '0.0' },
	            { l: '0.00', f: '0.00' },
	            { l: '0.000', f: '0.000' },
	            { l: '0.[0]', f: '0.[0]' },
	            { l: '0.[00]', f: '0.[00]' },
	            { l: '0%', f: '0%' },
	            { l: '0.0%', f: '0.0%' },
	            { l: '0.00%', f: '0.00%' },
	            { l: '0.[0]%', f: '0.[0]%' },
	            { l: '0.[00]%', f: '0.[00]%' },
	            { l: '10,000', f: '0,0' },
	            { l: '1st', f: '0o' },
	            { l: '123k', f: '0a' },
	            { l: '123.4k', f: '0.[0]a' },
	            { l: '123.45k', f: '0.[00]a' }
	        ];
	    }
	    if (axisCol.type() === 'date') {
	        // todo translate
	        return [
	            { l: '2015, 2016', f: 'YYYY' },
	            { l: '2015 Q1, 2015 Q2', f: 'YYYY [Q]Q' },
	            { l: '2015, Q2, Q3', f: 'YYYY|\\QQ' },
	            { l: '2015, Feb, Mar', f: 'YYYY|MMM' },
	            { l: '’15, ’16', f: '’YY' },
	            { l: 'April, May', f: 'MMMM' },
	            { l: 'Apr, May', f: 'MMM' },
	            { l: 'Apr ’15, May ’15', f: 'MMM ’YY' },
	            { l: 'April, 2, 3', f: 'MMM|DD' }
	        ];
	    }
	}
	function data$4() {
	    return {
	        axis: false,
	        value: '',
	        custom: '',
	        selected: null,
	        disabled: false
	    };
	}
	function oncreate$1() {
	    var this$1 = this;

	    // watch select input
	    this.observe('selected', function (sel, old) {
	        if (sel === old || !sel || !old) { return; }
	        var ref = this$1.get();
	        var custom = ref.custom;
	        this$1.set({ value: sel !== 'custom' ? sel : custom });
	    });
	    // watch external value changes
	    this.observe('value', function (val, old) {
	        if (val === old) { return; }
	        var ref = this$1.get();
	        var options = ref.options;
	        var selected = ref.selected;
	        for (var i = 0, list = options; i < list.length; i += 1) {
	            var o = list[i];

	        	if (o.f === val && selected !== 'custom') { return this$1.set({ selected: val }); }
	        }
	        this$1.set({ selected: 'custom', custom: val });
	    });
	    this.observe('custom', function (val, old) {
	        if (val === old) { return; }
	        var ref = this$1.get();
	        var selected = ref.selected;
	        if (selected === 'custom') { this$1.set({ value: val }); }
	    });
	}
	function create_main_fragment$5(component, state) {
		var div, label, text_1, div_1, text_2, select, option, text_3, select_updating = false, text_4, div_class_value;

		var if_block = (state.selected == 'custom') && create_if_block$4(component, state);

		var each_value = state.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, assign(assign({}, state), {
				each_value: each_value,
				opt: each_value[i],
				opt_index: i
			}));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ selected: selectValue(select) });
			select_updating = false;
		}

		var if_block_1 = (state.selected == 'custom') && create_if_block_1$2(component, state);

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text_1 = createText("\n\n    ");
				div_1 = createElement("div");
				if (if_block) { if_block.c(); }
				text_2 = createText("\n\n        ");
				select = createElement("select");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				option = createElement("option");
				text_3 = createText("(custom)");
				text_4 = createText("\n        ");
				if (if_block_1) { if_block_1.c(); }
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label svelte-1e8rja6";
				option.__value = "custom";
				option.value = option.__value;
				addListener(select, "change", select_change_handler);
				if (!('selected' in state)) { component.root._beforecreate.push(select_change_handler); }
				select.disabled = state.disabled;
				select.className = "svelte-1e8rja6";
				div_1.className = "controls form-inline";
				div.className = div_class_value = "control-group vis-option-custom-format " + (state.disabled ? 'disabled' : '') + " svelte-1e8rja6";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				label.innerHTML = state.label;
				appendNode(text_1, div);
				appendNode(div_1, div);
				if (if_block) { if_block.m(div_1, null); }
				appendNode(text_2, div_1);
				appendNode(select, div_1);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				appendNode(option, select);
				appendNode(text_3, option);

				selectOption(select, state.selected);

				appendNode(text_4, div_1);
				if (if_block_1) { if_block_1.m(div_1, null); }
			},

			p: function update(changed, state) {
				if (changed.label) {
					label.innerHTML = state.label;
				}

				if (state.selected == 'custom') {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$4(component, state);
						if_block.c();
						if_block.m(div_1, text_2);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

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
							each_blocks[i] = create_each_block$2(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(select, option);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}

				if (!select_updating) { selectOption(select, state.selected); }
				if (changed.disabled) {
					select.disabled = state.disabled;
				}

				if (state.selected == 'custom') {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1$2(component, state);
						if_block_1.c();
						if_block_1.m(div_1, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				if ((changed.disabled) && div_class_value !== (div_class_value = "control-group vis-option-custom-format " + (state.disabled ? 'disabled' : '') + " svelte-1e8rja6")) {
					div.className = div_class_value;
				}
			},

			u: function unmount() {
				label.innerHTML = '';

				detachNode(div);
				if (if_block) { if_block.u(); }

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				if (if_block_1) { if_block_1.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }

				destroyEach(each_blocks);

				removeListener(select, "change", select_change_handler);
				if (if_block_1) { if_block_1.d(); }
			}
		};
	}

	// (8:8) {#if selected == 'custom'}
	function create_if_block$4(component, state) {
		var div, text, raw_before, raw_after, text_1;

		return {
			c: function create() {
				div = createElement("div");
				text = createText("For help on custom formats, check the ");
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text_1 = createText(".");
				this.h();
			},

			h: function hydrate() {
				div.className = "small svelte-1e8rja6";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(text, div);
				appendNode(raw_before, div);
				raw_before.insertAdjacentHTML("afterend", state.customFormatHelp);
				appendNode(raw_after, div);
				appendNode(text_1, div);
			},

			p: function update(changed, state) {
				if (changed.customFormatHelp) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", state.customFormatHelp);
				}
			},

			u: function unmount() {
				detachBetween(raw_before, raw_after);

				detachNode(div);
			},

			d: noop
		};
	}

	// (15:12) {#each options as opt}
	function create_each_block$2(component, state) {
		var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
		var option, text_value = opt.l, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				this.h();
			},

			h: function hydrate() {
				option.__value = option_value_value = opt.f;
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
				if ((changed.options) && text_value !== (text_value = opt.l)) {
					text.data = text_value;
				}

				if ((changed.options) && option_value_value !== (option_value_value = opt.f)) {
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

	// (20:8) {#if selected == 'custom'}
	function create_if_block_1$2(component, state) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ custom: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				this.h();
			},

			h: function hydrate() {
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.disabled = state.disabled;
				input.className = "svelte-1e8rja6";
			},

			m: function mount(target, anchor) {
				insertNode(input, target, anchor);

				input.value = state.custom;
			},

			p: function update(changed, state) {
				if (!input_updating) { input.value = state.custom; }
				if (changed.disabled) {
					input.disabled = state.disabled;
				}
			},

			u: function unmount() {
				detachNode(input);
			},

			d: function destroy() {
				removeListener(input, "input", input_input_handler);
			}
		};
	}

	function CustomFormat(options) {
		this._debugName = '<CustomFormat>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(assign(this.store._init(["vis","dataset"]), data$4()), options.data);
		this.store._add(this, ["vis","dataset"]);
		this._recompute({ $vis: 1, $dataset: 1, axis: 1, axisCol: 1, disabled: 1 }, this._state);

		if (!('disabled' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'disabled'"); }
		if (!('$vis' in this._state)) { console.warn("<CustomFormat> was created without expected data property '$vis'"); }
		if (!('$dataset' in this._state)) { console.warn("<CustomFormat> was created without expected data property '$dataset'"); }
		if (!('axis' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'axis'"); }
		if (!('label' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'label'"); }
		if (!('selected' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'selected'"); }


		if (!('custom' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'custom'"); }

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { axisCol: 1, disabled: 1, $vis: 1, $dataset: 1, axis: 1, label: 1, selected: 1, customFormatHelp: 1, options: 1, custom: 1 };
			oncreate$1.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
		}

		this._fragment = create_main_fragment$5(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._beforecreate);
			callAll(this._oncreate);
		}
	}

	assign(CustomFormat.prototype, protoDev);

	CustomFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('axisCol' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'axisCol'"); }
		if ('customFormatHelp' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'customFormatHelp'"); }
		if ('options' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'options'"); }
	};

	CustomFormat.prototype._recompute = function _recompute(changed, state) {
		if (changed.$vis || changed.$dataset || changed.axis) {
			if (this._differs(state.axisCol, (state.axisCol = axisCol(state)))) { changed.axisCol = true; }
		}

		if (changed.axisCol || changed.disabled) {
			if (this._differs(state.customFormatHelp, (state.customFormatHelp = customFormatHelp(state)))) { changed.customFormatHelp = true; }
		}

		if (changed.axisCol) {
			if (this._differs(state.options, (state.options = options(state)))) { changed.options = true; }
		}
	};

	/* controls/BaseNumber.html generated by Svelte v1.64.0 */

	function step_(ref) {
	    var step = ref.step;

	    return step || 1;
	}
	function min_(ref) {
	    var min = ref.min;

	    return min !== undefined ? min : 0;
	}
	function max_(ref) {
	    var max = ref.max;

	    return max !== undefined ? max : 100;
	}
	function unit_(ref) {
	    var unit = ref.unit;

	    return unit !== undefined ? unit : '';
	}
	function slider_(ref) {
	    var slider = ref.slider;

	    return slider !== undefined ? slider : true;
	}
	function multiply_(ref) {
	    var multiply = ref.multiply;

	    return multiply || 1;
	}
	var methods$3 = {
	    update: function update() {
	        // update outside world value
	        var ref = this.get();
	        var value2 = ref.value2;
	        var multiply_ = ref.multiply_;
	        var step_ = ref.step_;
	        var value = +value2.toFixed(-Math.round(Math.log(step_ * multiply_) / Math.LN10)) / multiply_;
	        this.set({ value: value });
	    }
	};

	function onstate$1(ref) {
	    var changed = ref.changed;
	    var current = ref.current;
	    var previous = ref.previous;

	    if (changed.value || !previous) {
	        var value2 = +(current.value * current.multiply_).toFixed(-Math.round(Math.log(current.step_ * current.multiply_) / Math.LN10));
	        this.set({ value2: value2 });
	    }
	}
	function create_main_fragment$6(component, state) {
		var input, input_updating = false, input_min_value, input_max_value, input_step_value, input_style_value, text, if_block_1_anchor;

		var if_block = (state.slider_) && create_if_block$5(component, state);

		function input_input_handler() {
			input_updating = true;
			component.set({ value2: toNumber(input.value) });
			input_updating = false;
		}

		function input_handler(event) {
			component.update();
		}

		var if_block_1 = (state.unit_) && create_if_block_1$3(component, state);

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				input = createElement("input");
				text = createText("\n");
				if (if_block_1) { if_block_1.c(); }
				if_block_1_anchor = createComment();
				this.h();
			},

			h: function hydrate() {
				addListener(input, "input", input_input_handler);
				addListener(input, "input", input_handler);
				setAttribute(input, "type", "number");
				input.min = input_min_value = state.min_*state.multiply_;
				input.max = input_max_value = state.max_*state.multiply_;
				input.step = input_step_value = state.step_*state.multiply_;
				input.style.cssText = input_style_value = state.slider_?'margin-left:10px':'';
				input.className = "svelte-r8qnxy";
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insertNode(input, target, anchor);

				input.value = state.value2;

				insertNode(text, target, anchor);
				if (if_block_1) { if_block_1.m(target, anchor); }
				insertNode(if_block_1_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (state.slider_) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$5(component, state);
						if_block.c();
						if_block.m(input.parentNode, input);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (!input_updating) { input.value = state.value2; }
				if ((changed.min_ || changed.multiply_) && input_min_value !== (input_min_value = state.min_*state.multiply_)) {
					input.min = input_min_value;
				}

				if ((changed.max_ || changed.multiply_) && input_max_value !== (input_max_value = state.max_*state.multiply_)) {
					input.max = input_max_value;
				}

				if ((changed.step_ || changed.multiply_) && input_step_value !== (input_step_value = state.step_*state.multiply_)) {
					input.step = input_step_value;
				}

				if ((changed.slider_) && input_style_value !== (input_style_value = state.slider_?'margin-left:10px':'')) {
					input.style.cssText = input_style_value;
				}

				if (state.unit_) {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1$3(component, state);
						if_block_1.c();
						if_block_1.m(if_block_1_anchor.parentNode, if_block_1_anchor);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}
			},

			u: function unmount() {
				if (if_block) { if_block.u(); }
				detachNode(input);
				detachNode(text);
				if (if_block_1) { if_block_1.u(); }
				detachNode(if_block_1_anchor);
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				removeListener(input, "input", input_input_handler);
				removeListener(input, "input", input_handler);
				if (if_block_1) { if_block_1.d(); }
			}
		};
	}

	// (2:0) {#if slider_}
	function create_if_block$5(component, state) {
		var input, input_min_value, input_max_value, input_step_value, text;

		function input_input_handler() {
			component.set({ value2: toNumber(input.value) });
		}

		function input_change_handler() {
			component.set({ value2: toNumber(input.value) });
		}

		function input_handler(event) {
			component.update();
		}

		return {
			c: function create() {
				input = createElement("input");
				text = createText("  ");
				this.h();
			},

			h: function hydrate() {
				addListener(input, "input", input_input_handler);
				addListener(input, "change", input_change_handler);
				addListener(input, "input", input_handler);
				setAttribute(input, "type", "range");
				input.min = input_min_value = state.min_*state.multiply_;
				input.max = input_max_value = state.max_*state.multiply_;
				input.step = input_step_value = state.step_*state.multiply_;
				input.className = "svelte-r8qnxy";
			},

			m: function mount(target, anchor) {
				insertNode(input, target, anchor);

				input.value = state.value2;

				insertNode(text, target, anchor);
			},

			p: function update(changed, state) {
				input.value = state.value2;
				input.value = state.value2;
				if ((changed.min_ || changed.multiply_) && input_min_value !== (input_min_value = state.min_*state.multiply_)) {
					input.min = input_min_value;
				}

				if ((changed.max_ || changed.multiply_) && input_max_value !== (input_max_value = state.max_*state.multiply_)) {
					input.max = input_max_value;
				}

				if ((changed.step_ || changed.multiply_) && input_step_value !== (input_step_value = state.step_*state.multiply_)) {
					input.step = input_step_value;
				}
			},

			u: function unmount() {
				detachNode(input);
				detachNode(text);
			},

			d: function destroy() {
				removeListener(input, "input", input_input_handler);
				removeListener(input, "change", input_change_handler);
				removeListener(input, "input", input_handler);
			}
		};
	}

	// (18:0) {#if unit_}
	function create_if_block_1$3(component, state) {
		var span, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(state.unit_);
				this.h();
			},

			h: function hydrate() {
				span.className = "unit svelte-r8qnxy";
			},

			m: function mount(target, anchor) {
				insertNode(span, target, anchor);
				appendNode(text, span);
			},

			p: function update(changed, state) {
				if (changed.unit_) {
					text.data = state.unit_;
				}
			},

			u: function unmount() {
				detachNode(span);
			},

			d: noop
		};
	}

	function BaseNumber(options) {
		this._debugName = '<BaseNumber>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign({}, options.data);
		this._recompute({ step: 1, min: 1, max: 1, unit: 1, slider: 1, multiply: 1 }, this._state);
		if (!('step' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'step'"); }
		if (!('min' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'min'"); }
		if (!('max' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'max'"); }
		if (!('unit' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'unit'"); }
		if (!('slider' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'slider'"); }
		if (!('multiply' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'multiply'"); }





		if (!('value2' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'value2'"); }

		this._handlers.state = [onstate$1];

		var self = this;
		var _oncreate = function() {
			var changed = { step: 1, min: 1, max: 1, unit: 1, slider: 1, multiply: 1, slider_: 1, min_: 1, multiply_: 1, max_: 1, step_: 1, value2: 1, unit_: 1 };
			onstate$1.call(self, { changed: changed, current: self._state });
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment$6(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(BaseNumber.prototype, protoDev);
	assign(BaseNumber.prototype, methods$3);

	BaseNumber.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('step_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'step_'"); }
		if ('min_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'min_'"); }
		if ('max_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'max_'"); }
		if ('unit_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'unit_'"); }
		if ('slider_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'slider_'"); }
		if ('multiply_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'multiply_'"); }
	};

	BaseNumber.prototype._recompute = function _recompute(changed, state) {
		if (changed.step) {
			if (this._differs(state.step_, (state.step_ = step_(state)))) { changed.step_ = true; }
		}

		if (changed.min) {
			if (this._differs(state.min_, (state.min_ = min_(state)))) { changed.min_ = true; }
		}

		if (changed.max) {
			if (this._differs(state.max_, (state.max_ = max_(state)))) { changed.max_ = true; }
		}

		if (changed.unit) {
			if (this._differs(state.unit_, (state.unit_ = unit_(state)))) { changed.unit_ = true; }
		}

		if (changed.slider) {
			if (this._differs(state.slider_, (state.slider_ = slider_(state)))) { changed.slider_ = true; }
		}

		if (changed.multiply) {
			if (this._differs(state.multiply_, (state.multiply_ = multiply_(state)))) { changed.multiply_ = true; }
		}
	};

	/* controls/Number.html generated by Svelte v1.64.0 */



	function create_main_fragment$7(component, state) {
		var text, basenumber_updating = {}, text_1, controlgroup_updating = {};

		var basenumber_initial_data = {
		 	unit: state.unit,
		 	multiply: state.multiply,
		 	step: state.step,
		 	min: state.min,
		 	max: state.max,
		 	slider: state.slider
		 };
		if ('value' in state) {
			basenumber_initial_data.value = state.value ;
			basenumber_updating.value = true;
		}
		var basenumber = new BaseNumber({
			root: component.root,
			data: basenumber_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!basenumber_updating.value && changed.value) {
					newState.value = childState.value;
				}
				component._set(newState);
				basenumber_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			basenumber._bind({ value: 1 }, basenumber.get());
		});

		component.refs.baseNumber = basenumber;

		var controlgroup_initial_data = { label: state.label };
		if ('width' in state) {
			controlgroup_initial_data.width = state.width ;
			controlgroup_updating.width = true;
		}
		if ('valign' in state) {
			controlgroup_initial_data.valign = state.valign ;
			controlgroup_updating.valign = true;
		}
		var controlgroup = new ControlGroup({
			root: component.root,
			slots: { default: createFragment() },
			data: controlgroup_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!controlgroup_updating.width && changed.width) {
					newState.width = childState.width;
				}

				if (!controlgroup_updating.valign && changed.valign) {
					newState.valign = childState.valign;
				}
				component._set(newState);
				controlgroup_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			controlgroup._bind({ width: 1, valign: 1 }, controlgroup.get());
		});

		return {
			c: function create() {
				text = createText("\n    ");
				basenumber._fragment.c();
				text_1 = createText("\n");
				controlgroup._fragment.c();
			},

			m: function mount(target, anchor) {
				appendNode(text, controlgroup._slotted.default);
				basenumber._mount(controlgroup._slotted.default, null);
				appendNode(text_1, controlgroup._slotted.default);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, state) {
				var basenumber_changes = {};
				if (changed.unit) { basenumber_changes.unit = state.unit; }
				if (changed.multiply) { basenumber_changes.multiply = state.multiply; }
				if (changed.step) { basenumber_changes.step = state.step; }
				if (changed.min) { basenumber_changes.min = state.min; }
				if (changed.max) { basenumber_changes.max = state.max; }
				if (changed.slider) { basenumber_changes.slider = state.slider; }
				if (!basenumber_updating.value && changed.value) {
					basenumber_changes.value = state.value ;
					basenumber_updating.value = true;
				}
				basenumber._set(basenumber_changes);
				basenumber_updating = {};

				var controlgroup_changes = {};
				if (changed.label) { controlgroup_changes.label = state.label; }
				if (!controlgroup_updating.width && changed.width) {
					controlgroup_changes.width = state.width ;
					controlgroup_updating.width = true;
				}
				if (!controlgroup_updating.valign && changed.valign) {
					controlgroup_changes.valign = state.valign ;
					controlgroup_updating.valign = true;
				}
				controlgroup._set(controlgroup_changes);
				controlgroup_updating = {};
			},

			u: function unmount() {
				controlgroup._unmount();
			},

			d: function destroy() {
				basenumber.destroy(false);
				if (component.refs.baseNumber === basenumber) { component.refs.baseNumber = null; }
				controlgroup.destroy(false);
			}
		};
	}

	function Number(options) {
		this._debugName = '<Number>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this.refs = {};
		this._state = assign({}, options.data);
		if (!('width' in this._state)) { console.warn("<Number> was created without expected data property 'width'"); }
		if (!('valign' in this._state)) { console.warn("<Number> was created without expected data property 'valign'"); }
		if (!('label' in this._state)) { console.warn("<Number> was created without expected data property 'label'"); }
		if (!('value' in this._state)) { console.warn("<Number> was created without expected data property 'value'"); }
		if (!('unit' in this._state)) { console.warn("<Number> was created without expected data property 'unit'"); }
		if (!('multiply' in this._state)) { console.warn("<Number> was created without expected data property 'multiply'"); }
		if (!('step' in this._state)) { console.warn("<Number> was created without expected data property 'step'"); }
		if (!('min' in this._state)) { console.warn("<Number> was created without expected data property 'min'"); }
		if (!('max' in this._state)) { console.warn("<Number> was created without expected data property 'max'"); }
		if (!('slider' in this._state)) { console.warn("<Number> was created without expected data property 'slider'"); }

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$7(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Number.prototype, protoDev);

	Number.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Radio.html generated by Svelte v1.64.0 */

	function data$5() {
	    return {
	        disabled: false,
	        width: 'auto',
	        valign: 'top',
	        inline: true
	    };
	}
	function create_main_fragment$8(component, state) {
		var text, div, div_class_value, text_2;

		var each_value = state.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, assign(assign({}, state), {
				each_value: each_value,
				opt: each_value[i],
				opt_index: i
			}));
		}

		var controlgroup_initial_data = {
		 	width: state.width,
		 	valign: state.valign,
		 	label: state.label
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				text = createText("\n    ");
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text_2 = createText("\n");
				controlgroup._fragment.c();
				this.h();
			},

			h: function hydrate() {
				div.className = div_class_value = "" + (state.inline?'inline':'') + " svelte-udgzmt";
			},

			m: function mount(target, anchor) {
				appendNode(text, controlgroup._slotted.default);
				appendNode(div, controlgroup._slotted.default);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				appendNode(text_2, controlgroup._slotted.default);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, state) {
				var each_value = state.options;

				if (changed.options || changed.disabled || changed.value) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							opt: each_value[i],
							opt_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$3(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}

				if ((changed.inline) && div_class_value !== (div_class_value = "" + (state.inline?'inline':'') + " svelte-udgzmt")) {
					div.className = div_class_value;
				}

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = state.width; }
				if (changed.valign) { controlgroup_changes.valign = state.valign; }
				if (changed.label) { controlgroup_changes.label = state.label; }
				controlgroup._set(controlgroup_changes);
			},

			u: function unmount() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				controlgroup._unmount();
			},

			d: function destroy() {
				destroyEach(each_blocks);

				controlgroup.destroy(false);
			}
		};
	}

	// (4:8) {#each options as opt}
	function create_each_block$3(component, state) {
		var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
		var label, input, input_value_value, span, text, span_1, text_1_value = opt.label, text_1, text_2, label_title_value, label_class_value;

		function input_change_handler() {
			component.set({ value: input.__value });
		}

		var if_block = (opt.help) && create_if_block$6(component, state);

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				span = createElement("span");
				text = createText(" ");
				span_1 = createElement("span");
				text_1 = createText(text_1_value);
				text_2 = createText("\n            ");
				if (if_block) { if_block.c(); }
				this.h();
			},

			h: function hydrate() {
				component._bindingGroups[0].push(input);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "radio");
				input.__value = input_value_value = opt.value;
				input.value = input.__value;
				input.disabled = state.disabled;
				input.className = "svelte-udgzmt";
				span.className = "css-ui svelte-udgzmt";
				span_1.className = "svelte-udgzmt";
				label.title = label_title_value = opt.tooltip||'';
				label.className = label_class_value = "" + (state.disabled? 'disabled' :'') + " " + (opt.help?'has-help':'') + " svelte-udgzmt";
			},

			m: function mount(target, anchor) {
				insertNode(label, target, anchor);
				appendNode(input, label);

				input.checked = input.__value === state.value;

				appendNode(span, label);
				appendNode(text, label);
				appendNode(span_1, label);
				appendNode(text_1, span_1);
				appendNode(text_2, label);
				if (if_block) { if_block.m(label, null); }
			},

			p: function update(changed, state) {
				opt = state.opt;
				each_value = state.each_value;
				opt_index = state.opt_index;
				input.checked = input.__value === state.value;
				if ((changed.options) && input_value_value !== (input_value_value = opt.value)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if (changed.disabled) {
					input.disabled = state.disabled;
				}

				if ((changed.options) && text_1_value !== (text_1_value = opt.label)) {
					text_1.data = text_1_value;
				}

				if (opt.help) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$6(component, state);
						if_block.c();
						if_block.m(label, null);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if ((changed.options) && label_title_value !== (label_title_value = opt.tooltip||'')) {
					label.title = label_title_value;
				}

				if ((changed.disabled || changed.options) && label_class_value !== (label_class_value = "" + (state.disabled? 'disabled' :'') + " " + (opt.help?'has-help':'') + " svelte-udgzmt")) {
					label.className = label_class_value;
				}
			},

			u: function unmount() {
				detachNode(label);
				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);
				if (if_block) { if_block.d(); }
			}
		};
	}

	// (9:12) {#if opt.help}
	function create_if_block$6(component, state) {
		var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
		var div, raw_value = opt.help;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div.className = "help svelte-udgzmt";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, state) {
				opt = state.opt;
				each_value = state.each_value;
				opt_index = state.opt_index;
				if ((changed.options) && raw_value !== (raw_value = opt.help)) {
					div.innerHTML = raw_value;
				}
			},

			u: function unmount() {
				div.innerHTML = '';

				detachNode(div);
			},

			d: noop
		};
	}

	function Radio(options) {
		this._debugName = '<Radio>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data$5(), options.data);
		if (!('width' in this._state)) { console.warn("<Radio> was created without expected data property 'width'"); }
		if (!('valign' in this._state)) { console.warn("<Radio> was created without expected data property 'valign'"); }
		if (!('label' in this._state)) { console.warn("<Radio> was created without expected data property 'label'"); }
		if (!('inline' in this._state)) { console.warn("<Radio> was created without expected data property 'inline'"); }
		if (!('options' in this._state)) { console.warn("<Radio> was created without expected data property 'options'"); }
		if (!('disabled' in this._state)) { console.warn("<Radio> was created without expected data property 'disabled'"); }
		if (!('value' in this._state)) { console.warn("<Radio> was created without expected data property 'value'"); }
		this._bindingGroups = [[]];

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$8(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Radio.prototype, protoDev);

	Radio.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Select.html generated by Svelte v1.64.0 */

	function data$6() {
	    return {
	        disabled: false,
	        width: 'auto',
	        labelWidth: 'auto',
	        options: [],
	        optgroups: []
	    };
	}
	function create_main_fragment$9(component, state) {
		var div, label, label_class_value, text_1, div_1, select, if_block_anchor, select_updating = false, div_1_class_value;

		var if_block = (state.options.length) && create_if_block$7(component, state);

		var if_block_1 = (state.optgroups.length) && create_if_block_1$4(component, state);

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
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
				if (if_block_1) { if_block_1.c(); }
				this.h();
			},

			h: function hydrate() {
				setStyle(label, "width", state.labelWidth);
				label.className = label_class_value = "control-label " + (state.disabled? 'disabled' :'') + " svelte-jp3jqj";
				addListener(select, "change", select_change_handler);
				if (!('value' in state)) { component.root._beforecreate.push(select_change_handler); }
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
				if (if_block) { if_block.m(select, null); }
				appendNode(if_block_anchor, select);
				if (if_block_1) { if_block_1.m(select, null); }

				selectOption(select, state.value);
			},

			p: function update(changed, state) {
				if (changed.label) {
					label.innerHTML = state.label;
				}

				if (changed.labelWidth) {
					setStyle(label, "width", state.labelWidth);
				}

				if ((changed.disabled) && label_class_value !== (label_class_value = "control-label " + (state.disabled? 'disabled' :'') + " svelte-jp3jqj")) {
					label.className = label_class_value;
				}

				if (state.options.length) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$7(component, state);
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
						if_block_1 = create_if_block_1$4(component, state);
						if_block_1.c();
						if_block_1.m(select, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				if (!select_updating) { selectOption(select, state.value); }
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
				if (if_block) { if_block.u(); }
				if (if_block_1) { if_block_1.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				if (if_block_1) { if_block_1.d(); }
				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (9:33) {#each options as opt}
	function create_each_block$4(component, state) {
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

	// (9:12) {#if options.length}
	function create_if_block$7(component, state) {
		var each_anchor;

		var each_value = state.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(component, assign(assign({}, state), {
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
							each_blocks[i] = create_each_block$4(component, each_context);
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

			d: function destroy() {
				destroyEach(each_blocks);
			}
		};
	}

	// (11:49) {#each optgroups as optgroup}
	function create_each_block_1$1(component, state) {
		var optgroup = state.optgroup, each_value_1 = state.each_value_1, optgroup_index = state.optgroup_index;
		var optgroup_1, optgroup_1_label_value;

		var each_value_2 = optgroup.options;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2$1(component, assign(assign({}, state), {
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
							each_blocks[i] = create_each_block_2$1(component, each_context);
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

			d: function destroy() {
				destroyEach(each_blocks);
			}
		};
	}

	// (13:16) {#each optgroup.options as opt}
	function create_each_block_2$1(component, state) {
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

	// (11:26) {#if optgroups.length}
	function create_if_block_1$4(component, state) {
		var each_anchor;

		var each_value_1 = state.optgroups;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(component, assign(assign({}, state), {
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
							each_blocks[i] = create_each_block_1$1(component, each_context);
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

			d: function destroy() {
				destroyEach(each_blocks);
			}
		};
	}

	function Select(options) {
		this._debugName = '<Select>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data$6(), options.data);
		if (!('labelWidth' in this._state)) { console.warn("<Select> was created without expected data property 'labelWidth'"); }
		if (!('disabled' in this._state)) { console.warn("<Select> was created without expected data property 'disabled'"); }
		if (!('label' in this._state)) { console.warn("<Select> was created without expected data property 'label'"); }
		if (!('value' in this._state)) { console.warn("<Select> was created without expected data property 'value'"); }
		if (!('width' in this._state)) { console.warn("<Select> was created without expected data property 'width'"); }
		if (!('options' in this._state)) { console.warn("<Select> was created without expected data property 'options'"); }
		if (!('optgroups' in this._state)) { console.warn("<Select> was created without expected data property 'optgroups'"); }

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
		}

		this._fragment = create_main_fragment$9(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._beforecreate);
		}
	}

	assign(Select.prototype, protoDev);

	Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Dropdown.html generated by Svelte v1.64.0 */

	function currentLabel(ref) {
	    var value = ref.value;
	    var options = ref.options;
	    var placeholder = ref.placeholder;
	    var forcePlaceholder = ref.forcePlaceholder;

	    if (!forcePlaceholder) {
	        for (var i = 0; i < options.length; i++) {
	            if (options[i].value === value) { return options[i].label; }
	        }
	    }
	    return ("<span style=\"color:#999;font-size:12px;\">" + placeholder + "</span>");
	}
	function data$7() {
	    return {
	        forcePlaceholder: false,
	        disabled: false,
	        width: 'auto',
	        options: [],
	        optgroups: [],
	        placeholder: '(select an item)'
	    };
	}
	var methods$4 = {
	    select: function select(event, opt) {
	        event.preventDefault();
	        this.set({ value: opt.value });
	        this.fire('change', opt.value);
	    }
	};

	function create_main_fragment$a(component, state) {
		var div, label, text_1, div_1, text_2, span, div_2, button, raw_1_after, text_3, span_1, text_7, span_2, ul, text_9, div_1_class_value;

		var if_block = (state.options.length) && create_if_block$8(component, state);

		var basedropdown = new BaseDropdown({
			root: component.root,
			slots: { default: createFragment(), button: createFragment(), content: createFragment() }
		});

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text_1 = createText("\n\n    ");
				div_1 = createElement("div");
				text_2 = createText("\n            ");
				span = createElement("span");
				div_2 = createElement("div");
				button = createElement("button");
				raw_1_after = createElement('noscript');
				text_3 = createText("\n                        ");
				span_1 = createElement("span");
				text_7 = createText("\n            ");
				span_2 = createElement("span");
				ul = createElement("ul");
				if (if_block) { if_block.c(); }
				text_9 = createText("\n        ");
				basedropdown._fragment.c();
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label";
				span_1.className = "caret svelte-c4b0rh";
				button.className = "btn dropdown-toggle svelte-c4b0rh";
				div_2.className = "btn-group";
				setAttribute(span, "slot", "button");
				ul.className = "dropdown-menu svelte-c4b0rh";
				setStyle(ul, "display", "block");
				setAttribute(span_2, "slot", "content");
				div_1.className = div_1_class_value = "controls form-inline " + (state.disabled? 'disabled' :'') + " svelte-c4b0rh";
				div.className = "control-group vis-option-type-select";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				label.innerHTML = state.label;
				appendNode(text_1, div);
				appendNode(div_1, div);
				appendNode(text_2, basedropdown._slotted.default);
				appendNode(span, basedropdown._slotted.button);
				appendNode(div_2, span);
				appendNode(button, div_2);
				appendNode(raw_1_after, button);
				raw_1_after.insertAdjacentHTML("beforebegin", state.currentLabel);
				appendNode(text_3, button);
				appendNode(span_1, button);
				appendNode(text_7, basedropdown._slotted.default);
				appendNode(span_2, basedropdown._slotted.content);
				appendNode(ul, span_2);
				if (if_block) { if_block.m(ul, null); }
				appendNode(text_9, basedropdown._slotted.default);
				basedropdown._mount(div_1, null);
			},

			p: function update(changed, state) {
				if (changed.label) {
					label.innerHTML = state.label;
				}

				if (changed.currentLabel) {
					detachBefore(raw_1_after);
					raw_1_after.insertAdjacentHTML("beforebegin", state.currentLabel);
				}

				if (state.options.length) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$8(component, state);
						if_block.c();
						if_block.m(ul, null);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if ((changed.disabled) && div_1_class_value !== (div_1_class_value = "controls form-inline " + (state.disabled? 'disabled' :'') + " svelte-c4b0rh")) {
					div_1.className = div_1_class_value;
				}
			},

			u: function unmount() {
				label.innerHTML = '';

				detachBefore(raw_1_after);

				detachNode(div);
				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				basedropdown.destroy(false);
			}
		};
	}

	// (19:41) {#each options as opt}
	function create_each_block$5(component, state) {
		var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
		var li, a, raw_value = opt.label, a_href_value, li_class_value;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				this.h();
			},

			h: function hydrate() {
				addListener(a, "click", click_handler$2);
				a.href = a_href_value = "#/" + opt.value;

				a._svelte = {
					component: component,
					each_value: state.each_value,
					opt_index: state.opt_index
				};

				li.className = li_class_value = "" + (state.value==opt.value?'selected':'') + " svelte-c4b0rh";
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				appendNode(a, li);
				a.innerHTML = raw_value;
			},

			p: function update(changed, state) {
				opt = state.opt;
				each_value = state.each_value;
				opt_index = state.opt_index;
				if ((changed.options) && raw_value !== (raw_value = opt.label)) {
					a.innerHTML = raw_value;
				}

				if ((changed.options) && a_href_value !== (a_href_value = "#/" + opt.value)) {
					a.href = a_href_value;
				}

				a._svelte.each_value = state.each_value;
				a._svelte.opt_index = state.opt_index;

				if ((changed.value || changed.options) && li_class_value !== (li_class_value = "" + (state.value==opt.value?'selected':'') + " svelte-c4b0rh")) {
					li.className = li_class_value;
				}
			},

			u: function unmount() {
				a.innerHTML = '';

				detachNode(li);
			},

			d: function destroy() {
				removeListener(a, "click", click_handler$2);
			}
		};
	}

	// (19:20) {#if options.length}
	function create_if_block$8(component, state) {
		var each_anchor;

		var each_value = state.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(component, assign(assign({}, state), {
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

				if (changed.value || changed.options) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							opt: each_value[i],
							opt_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$5(component, each_context);
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

			d: function destroy() {
				destroyEach(each_blocks);
			}
		};
	}

	function click_handler$2(event) {
		var component = this._svelte.component;
		var each_value = this._svelte.each_value, opt_index = this._svelte.opt_index, opt = each_value[opt_index];
		component.select(event, opt);
	}

	function Dropdown(options) {
		this._debugName = '<Dropdown>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data$7(), options.data);
		this._recompute({ value: 1, options: 1, placeholder: 1, forcePlaceholder: 1 }, this._state);
		if (!('value' in this._state)) { console.warn("<Dropdown> was created without expected data property 'value'"); }
		if (!('options' in this._state)) { console.warn("<Dropdown> was created without expected data property 'options'"); }
		if (!('placeholder' in this._state)) { console.warn("<Dropdown> was created without expected data property 'placeholder'"); }
		if (!('forcePlaceholder' in this._state)) { console.warn("<Dropdown> was created without expected data property 'forcePlaceholder'"); }
		if (!('label' in this._state)) { console.warn("<Dropdown> was created without expected data property 'label'"); }
		if (!('disabled' in this._state)) { console.warn("<Dropdown> was created without expected data property 'disabled'"); }

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$a(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Dropdown.prototype, protoDev);
	assign(Dropdown.prototype, methods$4);

	Dropdown.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentLabel' in newState && !this._updatingReadonlyProperty) { throw new Error("<Dropdown>: Cannot set read-only property 'currentLabel'"); }
	};

	Dropdown.prototype._recompute = function _recompute(changed, state) {
		if (changed.value || changed.options || changed.placeholder || changed.forcePlaceholder) {
			if (this._differs(state.currentLabel, (state.currentLabel = currentLabel(state)))) { changed.currentLabel = true; }
		}
	};

	function cubicOut(t) {
	  var f = t - 1.0;
	  return f * f * f + 1.0
	}

	function slide(
		node,
		ref
	) {
		var delay = ref.delay; if ( delay === void 0 ) { delay = 0; }
		var duration = ref.duration; if ( duration === void 0 ) { duration = 400; }
		var easing = ref.easing; if ( easing === void 0 ) { easing = cubicOut; }

		var style = getComputedStyle(node);
		var opacity = +style.opacity;
		var height = parseFloat(style.height);
		var paddingTop = parseFloat(style.paddingTop);
		var paddingBottom = parseFloat(style.paddingBottom);
		var marginTop = parseFloat(style.marginTop);
		var marginBottom = parseFloat(style.marginBottom);
		var borderTopWidth = parseFloat(style.borderTopWidth);
		var borderBottomWidth = parseFloat(style.borderBottomWidth);

		return {
			delay: delay,
			duration: duration,
			easing: easing,
			css: function (t) { return "overflow: hidden;" +
				"opacity: " + (Math.min(t * 20, 1) * opacity) + ";" +
				"height: " + (t * height) + "px;" +
				"padding-top: " + (t * paddingTop) + "px;" +
				"padding-bottom: " + (t * paddingBottom) + "px;" +
				"margin-top: " + (t * marginTop) + "px;" +
				"margin-bottom: " + (t * marginBottom) + "px;" +
				"border-top-width: " + (t * borderTopWidth) + "px;" +
				"border-bottom-width: " + (t * borderBottomWidth) + "px;"; }
		};
	}

	/* editor/Help.html generated by Svelte v1.64.0 */

	function data$8() {
	    return {
	        visible: false
	    };
	}
	var methods$5 = {
	    show: function show() {
	        var this$1 = this;

	        var t = setTimeout(function () {
	            this$1.set({ visible: true });
	        }, 400);
	        this.set({ t: t });
	    },
	    hide: function hide() {
	        var ref = this.get();
	        var t = ref.t;
	        clearTimeout(t);
	        this.set({ visible: false });
	    }
	};

	function create_main_fragment$b(component, state) {
		var div, span, text;

		function select_block_type(state) {
			if (state.visible) { return create_if_block$9; }
			return create_if_block_1$5;
		}

		var current_block_type = select_block_type(state);
		var if_block = current_block_type(component, state);

		var if_block_1 = (state.visible) && create_if_block_2$1(component, state);

		function mouseenter_handler(event) {
			component.show();
		}

		function mouseleave_handler(event) {
			component.hide();
		}

		return {
			c: function create() {
				div = createElement("div");
				span = createElement("span");
				if_block.c();
				text = createText("\n    ");
				if (if_block_1) { if_block_1.c(); }
				this.h();
			},

			h: function hydrate() {
				span.className = "svelte-1mkn8ur";
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = "help svelte-1mkn8ur";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(span, div);
				if_block.m(span, null);
				appendNode(text, div);
				if (if_block_1) { if_block_1.m(div, null); }
			},

			p: function update(changed, state) {
				if (current_block_type !== (current_block_type = select_block_type(state))) {
					if_block.u();
					if_block.d();
					if_block = current_block_type(component, state);
					if_block.c();
					if_block.m(span, null);
				}

				if (state.visible) {
					if (!if_block_1) {
						if_block_1 = create_if_block_2$1(component, state);
						if_block_1.c();
						if_block_1.m(div, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}
			},

			u: function unmount() {
				detachNode(div);
				if_block.u();
				if (if_block_1) { if_block_1.u(); }
			},

			d: function destroy() {
				if_block.d();
				if (if_block_1) { if_block_1.d(); }
				removeListener(div, "mouseenter", mouseenter_handler);
				removeListener(div, "mouseleave", mouseleave_handler);
			}
		};
	}

	// (2:10) {#if visible}
	function create_if_block$9(component, state) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				this.h();
			},

			h: function hydrate() {
				i.className = "im im-graduation-hat svelte-1mkn8ur";
			},

			m: function mount(target, anchor) {
				insertNode(i, target, anchor);
			},

			u: function unmount() {
				detachNode(i);
			},

			d: noop
		};
	}

	// (2:59) {:else}
	function create_if_block_1$5(component, state) {
		var text;

		return {
			c: function create() {
				text = createText("?");
			},

			m: function mount(target, anchor) {
				insertNode(text, target, anchor);
			},

			u: function unmount() {
				detachNode(text);
			},

			d: noop
		};
	}

	// (3:4) {#if visible}
	function create_if_block_2$1(component, state) {
		var div, slot_content_default = component._slotted.default;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div.className = "content svelte-1mkn8ur";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);

				if (slot_content_default) {
					appendNode(slot_content_default, div);
				}
			},

			u: function unmount() {
				detachNode(div);

				if (slot_content_default) {
					reinsertChildren(div, slot_content_default);
				}
			},

			d: noop
		};
	}

	function Help(options) {
		this._debugName = '<Help>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data$8(), options.data);
		if (!('visible' in this._state)) { console.warn("<Help> was created without expected data property 'visible'"); }

		this._slotted = options.slots || {};

		this.slots = {};

		this._fragment = create_main_fragment$b(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Help.prototype, protoDev);
	assign(Help.prototype, methods$5);

	Help.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Switch.html generated by Svelte v1.64.0 */

	function data$9() {
	    return {
	        hasHelp: false,
	        disabled_msg: '',
	        disabled_state: 'auto',
	        disabled: false,
	        highlight: false
	    };
	}
	function oncreate$2() {
	    this.set({
	        hasHelp: this.options && this.options.slots ? !!this.options.slots.help : false
	    });
	}
	function onstate$2(ref) {
	    var this$1 = this;
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.value && current.value) {
	        this.set({ highlight: true });
	        setTimeout(function () {
	            this$1.set({ highlight: false });
	        }, 300);
	    }
	}
	function create_main_fragment$c(component, state) {
		var div, text, label, label_1, input, input_class_value, span, text_2, raw_before, label_class_value, text_4, current_block_type_index, if_block_1, div_class_value;

		var if_block = (state.hasHelp) && create_if_block$a(component, state);

		function input_change_handler() {
			component.set({ value: input.checked });
		}

		var if_block_creators = [
			create_if_block_1$6,
			create_if_block_2$2 ];

		var if_blocks = [];

		function select_block_type(state) {
			if (state.disabled && state.disabled_msg) { return 0; }
			if ((!state.disabled || state.disabled_state == 'on') && state.value) { return 1; }
			return -1;
		}

		if (~(current_block_type_index = select_block_type(state))) {
			if_block_1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, state);
		}

		return {
			c: function create() {
				div = createElement("div");
				if (if_block) { if_block.c(); }
				text = createText("\n    ");
				label = createElement("label");
				label_1 = createElement("label");
				input = createElement("input");
				span = createElement("span");
				text_2 = createText("\n        ");
				raw_before = createElement('noscript');
				text_4 = createText("\n    ");
				if (if_block_1) { if_block_1.c(); }
				this.h();
			},

			h: function hydrate() {
				addListener(input, "change", input_change_handler);
				input.className = input_class_value = "" + (state.disabled && state.disabled_state == 'on' ? 'disabled-force-checked' : state.disabled && state.disabled_state == 'off' ? 'disabled-force-unchecked' : '') + " svelte-bp6vvu";
				input.disabled = state.disabled;
				setAttribute(input, "type", "checkbox");
				span.className = "slider round svelte-bp6vvu";
				label_1.className = "switch svelte-bp6vvu";
				label.className = label_class_value = "switch-outer " + (state.disabled? 'disabled' :'') + " svelte-bp6vvu";
				setStyle(label, "padding-left", "40px");
				div.className = div_class_value = "control-group vis-option-group vis-option-type-switch " + (state.highlight?'highlight':'') + " svelte-bp6vvu";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				if (if_block) { if_block.m(div, null); }
				appendNode(text, div);
				appendNode(label, div);
				appendNode(label_1, label);
				appendNode(input, label_1);

				input.checked = state.value;

				appendNode(span, label_1);
				appendNode(text_2, label);
				appendNode(raw_before, label);
				raw_before.insertAdjacentHTML("afterend", state.label);
				appendNode(text_4, div);
				if (~current_block_type_index) { if_blocks[current_block_type_index].i(div, null); }
			},

			p: function update(changed, state) {
				if (state.hasHelp) {
					if (!if_block) {
						if_block = create_if_block$a(component, state);
						if_block.c();
						if_block.m(div, text);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				input.checked = state.value;
				if ((changed.disabled || changed.disabled_state) && input_class_value !== (input_class_value = "" + (state.disabled && state.disabled_state == 'on' ? 'disabled-force-checked' : state.disabled && state.disabled_state == 'off' ? 'disabled-force-unchecked' : '') + " svelte-bp6vvu")) {
					input.className = input_class_value;
				}

				if (changed.disabled) {
					input.disabled = state.disabled;
				}

				if (changed.label) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", state.label);
				}

				if ((changed.disabled) && label_class_value !== (label_class_value = "switch-outer " + (state.disabled? 'disabled' :'') + " svelte-bp6vvu")) {
					label.className = label_class_value;
				}

				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(state);
				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) { if_blocks[current_block_type_index].p(changed, state); }
				} else {
					if (if_block_1) {
						if_block_1.o(function() {
							if_blocks[ previous_block_index ].u();
							if_blocks[ previous_block_index ].d();
							if_blocks[ previous_block_index ] = null;
						});
					}

					if (~current_block_type_index) {
						if_block_1 = if_blocks[current_block_type_index];
						if (!if_block_1) {
							if_block_1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, state);
							if_block_1.c();
						}
						if_block_1.i(div, null);
					} else {
						if_block_1 = null;
					}
				}

				if ((changed.highlight) && div_class_value !== (div_class_value = "control-group vis-option-group vis-option-type-switch " + (state.highlight?'highlight':'') + " svelte-bp6vvu")) {
					div.className = div_class_value;
				}
			},

			u: function unmount() {
				detachAfter(raw_before);

				detachNode(div);
				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				removeListener(input, "change", input_change_handler);
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].u();
					if_blocks[current_block_type_index].d();
				}
			}
		};
	}

	// (42:4) {#if hasHelp}
	function create_if_block$a(component, state) {
		var text, slot_content_help = component._slotted.help, text_1;

		var help = new Help({
			root: component.root,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				text = createText("\n        ");
				text_1 = createText("\n    ");
				help._fragment.c();
			},

			m: function mount(target, anchor) {
				appendNode(text, help._slotted.default);

				if (slot_content_help) {
					appendNode(slot_content_help, help._slotted.default);
				}

				appendNode(text_1, help._slotted.default);
				help._mount(target, anchor);
			},

			u: function unmount() {
				if (slot_content_help) {
					reinsertChildren(help._slotted.default, slot_content_help);
				}

				help._unmount();
			},

			d: function destroy() {
				help.destroy(false);
			}
		};
	}

	// (58:4) {#if disabled && disabled_msg}
	function create_if_block_1$6(component, state) {
		var div, div_1, div_transition, introing, outroing;

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div_1.className = "disabled-msg svelte-bp6vvu";
				div.className = "svelte-bp6vvu";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				div_1.innerHTML = state.disabled_msg;
			},

			p: function update(changed, state) {
				if (outroing || changed.disabled_msg) {
					div_1.innerHTML = state.disabled_msg;
				}
			},

			i: function intro(target, anchor) {
				if (introing) { return; }
				introing = true;
				outroing = false;

				component.root._aftercreate.push(function() {
					if (!div_transition) { div_transition = wrapTransition(component, div, slide, {}, true, null); }
					div_transition.run(true, function() {
						component.fire("intro.end", { node: div });
					});
				});

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (outroing) { return; }
				outroing = true;
				introing = false;

				var outros = 1;

				div_transition.run(false, function() {
					component.fire("outro.end", { node: div });
					if (--outros === 0) { outrocallback(); }
					div_transition = null;
				});
			},

			u: function unmount() {
				div_1.innerHTML = '';

				detachNode(div);
			},

			d: noop
		};
	}

	// (64:12) {#if (!disabled || disabled_state == 'on') && value}
	function create_if_block_2$2(component, state) {
		var div, div_1, slot_content_default = component._slotted.default, div_transition, introing, outroing;

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div_1.className = "switch-content svelte-bp6vvu";
				div.className = "svelte-bp6vvu";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);

				if (slot_content_default) {
					appendNode(slot_content_default, div_1);
				}
			},

			p: noop,

			i: function intro(target, anchor) {
				if (introing) { return; }
				introing = true;
				outroing = false;

				component.root._aftercreate.push(function() {
					if (!div_transition) { div_transition = wrapTransition(component, div, slide, {}, true, null); }
					div_transition.run(true, function() {
						component.fire("intro.end", { node: div });
					});
				});

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (outroing) { return; }
				outroing = true;
				introing = false;

				var outros = 1;

				div_transition.run(false, function() {
					component.fire("outro.end", { node: div });
					if (--outros === 0) { outrocallback(); }
					div_transition = null;
				});
			},

			u: function unmount() {
				detachNode(div);

				if (slot_content_default) {
					reinsertChildren(div_1, slot_content_default);
				}
			},

			d: noop
		};
	}

	function Switch(options) {
		this._debugName = '<Switch>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data$9(), options.data);
		if (!('highlight' in this._state)) { console.warn("<Switch> was created without expected data property 'highlight'"); }
		if (!('hasHelp' in this._state)) { console.warn("<Switch> was created without expected data property 'hasHelp'"); }
		if (!('disabled' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled'"); }
		if (!('disabled_state' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled_state'"); }
		if (!('value' in this._state)) { console.warn("<Switch> was created without expected data property 'value'"); }
		if (!('label' in this._state)) { console.warn("<Switch> was created without expected data property 'label'"); }
		if (!('disabled_msg' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled_msg'"); }

		this._handlers.state = [onstate$2];

		this._slotted = options.slots || {};

		var self = this;
		var _oncreate = function() {
			var changed = { highlight: 1, hasHelp: 1, disabled: 1, disabled_state: 1, value: 1, label: 1, disabled_msg: 1 };
			onstate$2.call(self, { changed: changed, current: self._state });
			oncreate$2.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this.slots = {};

		this._fragment = create_main_fragment$c(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Switch.prototype, protoDev);

	Switch.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/TextArea.html generated by Svelte v1.64.0 */

	function data$a() {
	    return {
	        placeholder: ''
	    };
	}
	function create_main_fragment$d(component, state) {
		var div, label, text, text_1, div_1, textarea, textarea_updating = false;

		function textarea_input_handler() {
			textarea_updating = true;
			component.set({ value: textarea.value });
			textarea_updating = false;
		}

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text = createText(state.label);
				text_1 = createText("\n    ");
				div_1 = createElement("div");
				textarea = createElement("textarea");
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label";
				addListener(textarea, "input", textarea_input_handler);
				textarea.placeholder = state.placeholder;
				setStyle(textarea, "width", ( state.width || 'auto' ));
				div_1.className = "controls";
				div.className = "control-group vis-option-group vis-option-type-textarea";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				appendNode(text, label);
				appendNode(text_1, div);
				appendNode(div_1, div);
				appendNode(textarea, div_1);

				textarea.value = state.value;
			},

			p: function update(changed, state) {
				if (changed.label) {
					text.data = state.label;
				}

				if (!textarea_updating) { textarea.value = state.value; }
				if (changed.placeholder) {
					textarea.placeholder = state.placeholder;
				}

				if (changed.width) {
					setStyle(textarea, "width", ( state.width || 'auto' ));
				}
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				removeListener(textarea, "input", textarea_input_handler);
			}
		};
	}

	function TextArea(options) {
		this._debugName = '<TextArea>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data$a(), options.data);
		if (!('label' in this._state)) { console.warn("<TextArea> was created without expected data property 'label'"); }
		if (!('value' in this._state)) { console.warn("<TextArea> was created without expected data property 'value'"); }
		if (!('placeholder' in this._state)) { console.warn("<TextArea> was created without expected data property 'placeholder'"); }
		if (!('width' in this._state)) { console.warn("<TextArea> was created without expected data property 'width'"); }

		this._fragment = create_main_fragment$d(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(TextArea.prototype, protoDev);

	TextArea.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

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

	/* controls/SelectAxisColumn.html generated by Svelte v1.64.0 */

	function columns(ref) {
	    var axis = ref.axis;
	    var $visualization = ref.$visualization;
	    var $dataset = ref.$dataset;

	    var columns = [];
	    // const axisMeta =
	    if (!$dataset || !$visualization || !axis) { return []; }
	    $dataset.eachColumn(function (column) {
	        if (_indexOf($visualization.axes[axis].accepts, column.type()) > -1) {
	            columns.push({
	                name: column.name()
	            });
	        }
	    });
	    return columns;
	}
	function data$b() {
	    return {
	        selected: false,
	        width: '200px',
	        valign: 'baseline'
	    };
	}
	function oncreate$3() {
	    var this$1 = this;

	    this.store.observe('visualization', function (visualization) {
	        if (!this$1.get) { return; }
	        var state = this$1.get();
	        if (!state) { return; }

	        // initialize if state is not yet set
	        if (!state.selected && visualization) {
	            var selected = this$1.store.getMetadata('axes', {})[this$1.get().axis];
	            this$1.set({ selected: selected });
	        }
	    });
	}
	function onstate$3(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.selected) {
	        if (current.selected) {
	            var ref$1 = this.get();
	            var axis = ref$1.axis;
	            var axes = _clone(this.store.getMetadata('axes', {}));
	            if (current.selected === '-') { delete axes[axis]; }
	            else { axes[axis] = current.selected; }
	            this.store.setMetadata('axes', axes);
	        }
	    }
	}
	function create_main_fragment$e(component, state) {
		var text, select, if_block_anchor, select_updating = false, text_1;

		var if_block = (state.$visualization && state.$visualization.axes[state.axis].optional) && create_if_block$b(component, state);

		var each_value = state.columns;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$6(component, assign(assign({}, state), {
				each_value: each_value,
				column: each_value[i],
				column_index: i
			}));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ selected: selectValue(select) });
			select_updating = false;
		}

		var controlgroup_initial_data = {
		 	width: state.width,
		 	valign: state.valign,
		 	label: state.label
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				text = createText("\n    ");
				select = createElement("select");
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text_1 = createText("\n");
				controlgroup._fragment.c();
				this.h();
			},

			h: function hydrate() {
				addListener(select, "change", select_change_handler);
				if (!('selected' in state)) { component.root._beforecreate.push(select_change_handler); }
				setStyle(select, "width", "calc(100% - 50px)");
			},

			m: function mount(target, anchor) {
				appendNode(text, controlgroup._slotted.default);
				appendNode(select, controlgroup._slotted.default);
				if (if_block) { if_block.m(select, null); }
				appendNode(if_block_anchor, select);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, state.selected);

				appendNode(text_1, controlgroup._slotted.default);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, state) {
				if (state.$visualization && state.$visualization.axes[state.axis].optional) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$b(component, state);
						if_block.c();
						if_block.m(select, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				var each_value = state.columns;

				if (changed.columns) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							column: each_value[i],
							column_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$6(component, each_context);
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

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = state.width; }
				if (changed.valign) { controlgroup_changes.valign = state.valign; }
				if (changed.label) { controlgroup_changes.label = state.label; }
				controlgroup._set(controlgroup_changes);
			},

			u: function unmount() {
				if (if_block) { if_block.u(); }

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				controlgroup._unmount();
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }

				destroyEach(each_blocks);

				removeListener(select, "change", select_change_handler);
				controlgroup.destroy(false);
			}
		};
	}

	// (4:8) {#if $visualization && $visualization.axes[axis].optional}
	function create_if_block$b(component, state) {
		var option, text_value = state.axis['na-label']||'--', text;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				this.h();
			},

			h: function hydrate() {
				option.__value = "-";
				option.value = option.__value;
			},

			m: function mount(target, anchor) {
				insertNode(option, target, anchor);
				appendNode(text, option);
			},

			p: function update(changed, state) {
				if ((changed.axis) && text_value !== (text_value = state.axis['na-label']||'--')) {
					text.data = text_value;
				}
			},

			u: function unmount() {
				detachNode(option);
			},

			d: noop
		};
	}

	// (6:14) {#each columns as column}
	function create_each_block$6(component, state) {
		var column = state.column, each_value = state.each_value, column_index = state.column_index;
		var option, text_value = column.name, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				this.h();
			},

			h: function hydrate() {
				option.__value = option_value_value = column.name;
				option.value = option.__value;
			},

			m: function mount(target, anchor) {
				insertNode(option, target, anchor);
				appendNode(text, option);
			},

			p: function update(changed, state) {
				column = state.column;
				each_value = state.each_value;
				column_index = state.column_index;
				if ((changed.columns) && text_value !== (text_value = column.name)) {
					text.data = text_value;
				}

				if ((changed.columns) && option_value_value !== (option_value_value = column.name)) {
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

	function SelectAxisColumn(options) {
		this._debugName = '<SelectAxisColumn>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(assign(this.store._init(["visualization","dataset"]), data$b()), options.data);
		this.store._add(this, ["visualization","dataset"]);
		this._recompute({ axis: 1, $visualization: 1, $dataset: 1 }, this._state);
		if (!('axis' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'axis'"); }
		if (!('$visualization' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property '$visualization'"); }
		if (!('$dataset' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property '$dataset'"); }
		if (!('width' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'width'"); }
		if (!('valign' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'valign'"); }
		if (!('label' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'label'"); }
		if (!('selected' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'selected'"); }

		this._handlers.state = [onstate$3];

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { axis: 1, $visualization: 1, $dataset: 1, width: 1, valign: 1, label: 1, selected: 1, columns: 1 };
			onstate$3.call(self, { changed: changed, current: self._state });
			oncreate$3.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$e(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(SelectAxisColumn.prototype, protoDev);

	SelectAxisColumn.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('columns' in newState && !this._updatingReadonlyProperty) { throw new Error("<SelectAxisColumn>: Cannot set read-only property 'columns'"); }
	};

	SelectAxisColumn.prototype._recompute = function _recompute(changed, state) {
		if (changed.axis || changed.$visualization || changed.$dataset) {
			if (this._differs(state.columns, (state.columns = columns(state)))) { changed.columns = true; }
		}
	};

	/* controls/Text.html generated by Svelte v1.64.0 */

	function data$c() {
	    return {
	        disabled: false,
	        disabled_msg: '',
	        unit: '',
	        width: '100px',
	        help: '',
	        placeholder: ''
	    };
	}
	function create_main_fragment$f(component, state) {
		var text, input, input_updating = false, text_1, text_2, if_block_anchor;

		function input_input_handler() {
			input_updating = true;
			component.set({ value: input.value });
			input_updating = false;
		}

		var controlgroup_initial_data = {
		 	disabled: state.disabled,
		 	width: state.width,
		 	label: state.label,
		 	help: state.help
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block = (state.disabled && state.disabled_msg) && create_if_block$c(component, state);

		return {
			c: function create() {
				text = createText("\n    ");
				input = createElement("input");
				text_1 = createText("\n");
				controlgroup._fragment.c();
				text_2 = createText("\n\n");
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
				this.h();
			},

			h: function hydrate() {
				addListener(input, "input", input_input_handler);
				input.disabled = state.disabled;
				setAttribute(input, "type", "text");
				input.className = "input-large";
				input.placeholder = state.placeholder;
			},

			m: function mount(target, anchor) {
				appendNode(text, controlgroup._slotted.default);
				appendNode(input, controlgroup._slotted.default);

				input.value = state.value ;

				appendNode(text_1, controlgroup._slotted.default);
				controlgroup._mount(target, anchor);
				insertNode(text_2, target, anchor);
				if (if_block) { if_block.i(target, anchor); }
				insertNode(if_block_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (!input_updating) { input.value = state.value ; }
				if (changed.disabled) {
					input.disabled = state.disabled;
				}

				if (changed.placeholder) {
					input.placeholder = state.placeholder;
				}

				var controlgroup_changes = {};
				if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
				if (changed.width) { controlgroup_changes.width = state.width; }
				if (changed.label) { controlgroup_changes.label = state.label; }
				if (changed.help) { controlgroup_changes.help = state.help; }
				controlgroup._set(controlgroup_changes);

				if (state.disabled && state.disabled_msg) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$c(component, state);
						if (if_block) { if_block.c(); }
					}

					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					if_block.o(function() {
						if_block.u();
						if_block.d();
						if_block = null;
					});
				}
			},

			u: function unmount() {
				controlgroup._unmount();
				detachNode(text_2);
				if (if_block) { if_block.u(); }
				detachNode(if_block_anchor);
			},

			d: function destroy() {
				removeListener(input, "input", input_input_handler);
				controlgroup.destroy(false);
				if (if_block) { if_block.d(); }
			}
		};
	}

	// (6:0) {#if disabled && disabled_msg}
	function create_if_block$c(component, state) {
		var div, div_1, div_transition, introing, outroing;

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div_1.className = "disabled-msg svelte-rcpckl";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				div_1.innerHTML = state.disabled_msg;
			},

			p: function update(changed, state) {
				if (outroing || changed.disabled_msg) {
					div_1.innerHTML = state.disabled_msg;
				}
			},

			i: function intro(target, anchor) {
				if (introing) { return; }
				introing = true;
				outroing = false;

				component.root._aftercreate.push(function() {
					if (!div_transition) { div_transition = wrapTransition(component, div, slide, {}, true, null); }
					div_transition.run(true, function() {
						component.fire("intro.end", { node: div });
					});
				});

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (outroing) { return; }
				outroing = true;
				introing = false;

				var outros = 1;

				div_transition.run(false, function() {
					component.fire("outro.end", { node: div });
					if (--outros === 0) { outrocallback(); }
					div_transition = null;
				});
			},

			u: function unmount() {
				div_1.innerHTML = '';

				detachNode(div);
			},

			d: noop
		};
	}

	function Text(options) {
		this._debugName = '<Text>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data$c(), options.data);
		if (!('disabled' in this._state)) { console.warn("<Text> was created without expected data property 'disabled'"); }
		if (!('width' in this._state)) { console.warn("<Text> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<Text> was created without expected data property 'label'"); }
		if (!('help' in this._state)) { console.warn("<Text> was created without expected data property 'help'"); }
		if (!('placeholder' in this._state)) { console.warn("<Text> was created without expected data property 'placeholder'"); }
		if (!('value' in this._state)) { console.warn("<Text> was created without expected data property 'value'"); }
		if (!('disabled_msg' in this._state)) { console.warn("<Text> was created without expected data property 'disabled_msg'"); }

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$f(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Text.prototype, protoDev);

	Text.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/TypeAhead.html generated by Svelte v1.64.0 */

	function matches(ref) {
	    var query = ref.query;
	    var items = ref.items;
	    var filter = ref.filter;

	    if (!filter) { return items; }
	    if (!query) { return items; }
	    // check if items is an array
	    if (!items || !items.filter) { return []; }
	    return items.filter(function (item) {
	        return (item.search || item.title).toLowerCase().indexOf(query.toLowerCase()) > -1;
	    });
	}
	function data$d() {
	    return {
	        selection: '',
	        query: '',
	        icon: false,
	        placeholder: '',
	        filter: 'indexOf',
	        selectedItem: undefined,
	        selectedIndex: undefined,
	        searching: false,
	        open: false,
	        items: [] // items look like this {id: "foo", title: "", "display": "..."}
	    };
	}
	var methods$6 = {
	    focus: function focus() {
	        this.refs.searchInput.focus();
	    },

	    blur: function blur() {
	        this.refs.searchInput.blur();
	    },

	    onClick: function onClick(event) {
	        this.set({ open: true });
	        this.fire('focus', event);
	    },

	    search: function search(query) {
	        this.set({ open: true });
	        // we're firing the "search" event so that the
	        // parent component can update the "items" list
	        this.fire('search', { query: query });
	    },

	    select: function select(item, event) {
	        this.set({
	            selectedItem: item,
	            query: item.title,
	            open: false
	        });
	        if (event) { event.stopPropagation(); }
	        this.fire('select', { item: item });
	    },

	    keyup: function keyup(event) {
	        if (!event) { return; }
	        if (event.keyCode === 13) {
	            // RETURN key
	            var ref = this.get();
	            var selectedItem = ref.selectedItem;
	            this.select(selectedItem);
	        }
	        if (event.keyCode === 38 || event.keyCode === 40) {
	            // ARROW UP/DOWN
	            var ref$1 = this.get();
	            var selectedIndex = ref$1.selectedIndex;
	            var matches = ref$1.matches;
	            if (isNaN(selectedIndex)) { selectedIndex = -1; }
	            var len = matches.length || 0;
	            if (event.keyCode === 38) {
	                selectedIndex = (selectedIndex - 1 + len) % len;
	            }
	            if (event.keyCode === 40) {
	                selectedIndex = (selectedIndex + 1) % len;
	            }

	            this.set({
	                selectedIndex: selectedIndex,
	                selectedItem: matches[selectedIndex]
	            });
	        }
	        if (event.keyCode === 27) {
	            // ESCAPE
	            this.set({ open: false });
	            this.blur();
	        }
	    }
	};

	function onupdate(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.selectedIndex && this.refs.dropdown) {
	        var dd = this.refs.dropdown;
	        var i = current.selectedIndex;
	        var liBox = dd.children[i].getBoundingClientRect();
	        var ulBox = dd.getBoundingClientRect();
	        if (liBox.y + liBox.height - ulBox.y > ulBox.height) {
	            // li is out of bottom view
	            dd.scrollBy(0, liBox.y + liBox.height - ulBox.y - ulBox.height + 5);
	        } else if (liBox.y - ulBox.y < 0) {
	            // li is out of top view
	            dd.scrollBy(0, liBox.y - ulBox.y - 5);
	        }
	    }
	}
	function create_main_fragment$g(component, state) {
		var div, div_1, input, input_updating = false, input_placeholder_value, text, text_1, div_2, slot_content_button = component._slotted.button, button, text_5, div_1_class_value;

		function onwindowclick(event) {
			component.set({open:false});
		}
		window.addEventListener("click", onwindowclick);

		function input_input_handler() {
			input_updating = true;
			component.set({ query: input.value });
			input_updating = false;
		}

		function keypress_handler(event) {
			component.keyup(event);
		}

		function input_handler(event) {
			var state = component.get();
			component.search(state.query);
		}

		var if_block = (state.icon) && create_if_block$d(component, state);

		function click_handler(event) {
			component.set({open:true});
		}

		var if_block_1 = (state.open && state.matches.length) && create_if_block_1$7(component, state);

		function click_handler_1(event) {
			component.onClick(event);
		}

		function click_handler_2(event) {
			event.stopPropagation();
		}

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				input = createElement("input");
				text = createText("\n\n        ");
				if (if_block) { if_block.c(); }
				text_1 = createText("\n\n        ");
				div_2 = createElement("div");
				if (!slot_content_button) {
					button = createElement("button");
					button.innerHTML = "<span class=\"caret\"></span>";
				}
				text_5 = createText("\n\n        ");
				if (if_block_1) { if_block_1.c(); }
				this.h();
			},

			h: function hydrate() {
				addListener(input, "input", input_input_handler);
				addListener(input, "keypress", keypress_handler);
				addListener(input, "input", input_handler);
				setAttribute(input, "type", "search");
				input.placeholder = input_placeholder_value = state.open ? state.placeholder : state.selection||state.placeholder;
				input.className = "svelte-kljjr2";
				if (!slot_content_button) {
					addListener(button, "click", click_handler);
					button.className = "btn btn-small btn-primary svelte-kljjr2";
				}
				div_2.className = "btn-wrap svelte-kljjr2";
				addListener(div_1, "click", click_handler_1);
				div_1.className = div_1_class_value = "dropdown " + (state.icon?'icon':'') + " " + (!state.open && state.selection ? 'selection' : '') + " svelte-kljjr2";
				addListener(div, "click", click_handler_2);
				div.className = "control-group vis-option-group vis-option-type-select";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(input, div_1);
				component.refs.searchInput = input;

				input.value = state.query;

				appendNode(text, div_1);
				if (if_block) { if_block.m(div_1, null); }
				appendNode(text_1, div_1);
				appendNode(div_2, div_1);
				if (!slot_content_button) {
					appendNode(button, div_2);
				}

				else {
					appendNode(slot_content_button, div_2);
				}

				appendNode(text_5, div_1);
				if (if_block_1) { if_block_1.m(div_1, null); }
			},

			p: function update(changed, state) {
				if (!input_updating) { input.value = state.query; }
				if ((changed.open || changed.placeholder || changed.selection) && input_placeholder_value !== (input_placeholder_value = state.open ? state.placeholder : state.selection||state.placeholder)) {
					input.placeholder = input_placeholder_value;
				}

				if (state.icon) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$d(component, state);
						if_block.c();
						if_block.m(div_1, text_1);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (state.open && state.matches.length) {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1$7(component, state);
						if_block_1.c();
						if_block_1.m(div_1, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				if ((changed.icon || changed.open || changed.selection) && div_1_class_value !== (div_1_class_value = "dropdown " + (state.icon?'icon':'') + " " + (!state.open && state.selection ? 'selection' : '') + " svelte-kljjr2")) {
					div_1.className = div_1_class_value;
				}
			},

			u: function unmount() {
				detachNode(div);
				if (if_block) { if_block.u(); }

				if (slot_content_button) {
					reinsertChildren(div_2, slot_content_button);
				}

				if (if_block_1) { if_block_1.u(); }
			},

			d: function destroy() {
				window.removeEventListener("click", onwindowclick);

				removeListener(input, "input", input_input_handler);
				removeListener(input, "keypress", keypress_handler);
				removeListener(input, "input", input_handler);
				if (component.refs.searchInput === input) { component.refs.searchInput = null; }
				if (if_block) { if_block.d(); }
				if (!slot_content_button) {
					removeListener(button, "click", click_handler);
				}
				if (if_block_1) { if_block_1.d(); }
				removeListener(div_1, "click", click_handler_1);
				removeListener(div, "click", click_handler_2);
			}
		};
	}

	// (15:8) {#if icon}
	function create_if_block$d(component, state) {
		var i, i_class_value;

		return {
			c: function create() {
				i = createElement("i");
				this.h();
			},

			h: function hydrate() {
				i.className = i_class_value = "icon " + state.icon + " svelte-kljjr2";
			},

			m: function mount(target, anchor) {
				insertNode(i, target, anchor);
			},

			p: function update(changed, state) {
				if ((changed.icon) && i_class_value !== (i_class_value = "icon " + state.icon + " svelte-kljjr2")) {
					i.className = i_class_value;
				}
			},

			u: function unmount() {
				detachNode(i);
			},

			d: noop
		};
	}

	// (29:12) {#each matches as item,i}
	function create_each_block$7(component, state) {
		var item = state.item, each_value = state.each_value, i = state.i;
		var li, raw_value = item.display || item.title, li_class_value, li_style_value;

		return {
			c: function create() {
				li = createElement("li");
				this.h();
			},

			h: function hydrate() {
				addListener(li, "click", click_handler$3);
				li.className = li_class_value = "" + (i==state.selectedIndex?'selected':'') + " svelte-kljjr2";
				li.style.cssText = li_style_value = item.style||'';

				li._svelte = {
					component: component,
					each_value: state.each_value,
					i: state.i
				};
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, state) {
				item = state.item;
				each_value = state.each_value;
				i = state.i;
				if ((changed.matches) && raw_value !== (raw_value = item.display || item.title)) {
					li.innerHTML = raw_value;
				}

				if ((changed.selectedIndex) && li_class_value !== (li_class_value = "" + (i==state.selectedIndex?'selected':'') + " svelte-kljjr2")) {
					li.className = li_class_value;
				}

				if ((changed.matches) && li_style_value !== (li_style_value = item.style||'')) {
					li.style.cssText = li_style_value;
				}

				li._svelte.each_value = state.each_value;
				li._svelte.i = state.i;
			},

			u: function unmount() {
				li.innerHTML = '';

				detachNode(li);
			},

			d: function destroy() {
				removeListener(li, "click", click_handler$3);
			}
		};
	}

	// (27:8) {#if open && matches.length}
	function create_if_block_1$7(component, state) {
		var ul;

		var each_value = state.matches;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$7(component, assign(assign({}, state), {
				each_value: each_value,
				item: each_value[i],
				i: i
			}));
		}

		return {
			c: function create() {
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				this.h();
			},

			h: function hydrate() {
				ul.className = "dropdown-results svelte-kljjr2";
			},

			m: function mount(target, anchor) {
				insertNode(ul, target, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				component.refs.dropdown = ul;
			},

			p: function update(changed, state) {
				var each_value = state.matches;

				if (changed.selectedIndex || changed.matches) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							item: each_value[i],
							i: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$7(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
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
				detachNode(ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy() {
				destroyEach(each_blocks);

				if (component.refs.dropdown === ul) { component.refs.dropdown = null; }
			}
		};
	}

	function click_handler$3(event) {
		var component = this._svelte.component;
		var each_value = this._svelte.each_value, i = this._svelte.i, item = each_value[i];
		component.select(item, event);
	}

	function TypeAhead(options) {
		this._debugName = '<TypeAhead>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this.refs = {};
		this._state = assign(data$d(), options.data);
		this._recompute({ query: 1, items: 1, filter: 1 }, this._state);
		if (!('query' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'query'"); }
		if (!('items' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'items'"); }
		if (!('filter' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'filter'"); }
		if (!('icon' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'icon'"); }
		if (!('open' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'open'"); }
		if (!('selection' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'selection'"); }
		if (!('placeholder' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'placeholder'"); }

		if (!('selectedIndex' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'selectedIndex'"); }
		this._handlers.update = [onupdate];

		this._slotted = options.slots || {};

		var self = this;
		var _oncreate = function() {
			var changed = { query: 1, items: 1, filter: 1, icon: 1, open: 1, selection: 1, placeholder: 1, matches: 1, selectedIndex: 1 };
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this.slots = {};

		this._fragment = create_main_fragment$g(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(TypeAhead.prototype, protoDev);
	assign(TypeAhead.prototype, methods$6);

	TypeAhead.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('matches' in newState && !this._updatingReadonlyProperty) { throw new Error("<TypeAhead>: Cannot set read-only property 'matches'"); }
	};

	TypeAhead.prototype._recompute = function _recompute(changed, state) {
		if (changed.query || changed.items || changed.filter) {
			if (this._differs(state.matches, (state.matches = matches(state)))) { changed.matches = true; }
		}
	};

	/* editor/Section.html generated by Svelte v1.64.0 */

	function create_main_fragment$h(component, state) {
		var if_block_anchor;

		var if_block = (state.id==state.active) && create_if_block$e(component, state);

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insertNode(if_block_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (state.id==state.active) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$e(component, state);
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
				if (if_block) { if_block.u(); }
				detachNode(if_block_anchor);
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
			}
		};
	}

	// (1:0) {#if id==active}
	function create_if_block$e(component, state) {
		var div, fieldset, div_1, slot_content_default = component._slotted.default, div_class_value;

		return {
			c: function create() {
				div = createElement("div");
				fieldset = createElement("fieldset");
				div_1 = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div_1.className = "control-group vis-option-group";
				fieldset.id = "visOptions";
				div.className = div_class_value = "section " + state.id;
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(fieldset, div);
				appendNode(div_1, fieldset);

				if (slot_content_default) {
					appendNode(slot_content_default, div_1);
				}
			},

			p: function update(changed, state) {
				if ((changed.id) && div_class_value !== (div_class_value = "section " + state.id)) {
					div.className = div_class_value;
				}
			},

			u: function unmount() {
				detachNode(div);

				if (slot_content_default) {
					reinsertChildren(div_1, slot_content_default);
				}
			},

			d: noop
		};
	}

	function Section(options) {
		this._debugName = '<Section>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign({}, options.data);
		if (!('id' in this._state)) { console.warn("<Section> was created without expected data property 'id'"); }
		if (!('active' in this._state)) { console.warn("<Section> was created without expected data property 'active'"); }

		this._slotted = options.slots || {};

		this.slots = {};

		this._fragment = create_main_fragment$h(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Section.prototype, protoDev);

	Section.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* editor/Group.html generated by Svelte v1.64.0 */

	function data$e() {
	    return {
	        notoggle: false,
	        id: false,
	        open: true
	    };
	}
	var methods$7 = {
	    toggle: function toggle() {
	        if (this.get().notoggle) { return; }
	        var ref = this.get();
	        var open = ref.open;
	        var id = ref.id;
	        if (id) {
	            var visGroups = JSON.parse(window.localStorage.getItem('dw-vis-groups')) || {};
	            if (!visGroups['locator-map']) { visGroups['locator-map'] = {}; }
	            visGroups['locator-map'][id] = visGroups['locator-map'][id] === 'open' ? 'closed' : 'open';
	            window.localStorage.setItem('dw-vis-groups', JSON.stringify(visGroups));
	        }
	        this.set({ open: !open });
	    }
	};

	function oncreate$4() {
	    var ref = this.get() || {};
	    var id = ref.id;
	    var notoggle = ref.notoggle;
	    if (notoggle) { return; }
	    if (id) {
	        var visGroups = JSON.parse(window.localStorage.getItem('dw-vis-groups')) || {};
	        if (visGroups['locator-map'] && visGroups['locator-map'][id]) {
	            this.set({ open: visGroups['locator-map'][id] !== 'closed' });
	        }
	    }
	}
	function create_main_fragment$i(component, state) {
		var div, label, text, raw_before, text_1, div_class_value;

		var if_block = (!state.notoggle) && create_if_block$f(component, state);

		function click_handler(event) {
			component.toggle();
		}

		var if_block_1 = (state.open) && create_if_block_1$8(component, state);

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				if (if_block) { if_block.c(); }
				text = createText(" ");
				raw_before = createElement('noscript');
				text_1 = createText("\n\n    ");
				if (if_block_1) { if_block_1.c(); }
				this.h();
			},

			h: function hydrate() {
				addListener(label, "click", click_handler);
				label.className = "group-title svelte-1jbn84t";
				div.className = div_class_value = "vis-option-type-group " + (state.open?'group-open':'') + " " + (state.notoggle?'notoggle':'') + " svelte-1jbn84t";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				if (if_block) { if_block.m(label, null); }
				appendNode(text, label);
				appendNode(raw_before, label);
				raw_before.insertAdjacentHTML("afterend", state.label);
				appendNode(text_1, div);
				if (if_block_1) { if_block_1.m(div, null); }
			},

			p: function update(changed, state) {
				if (!state.notoggle) {
					if (!if_block) {
						if_block = create_if_block$f(component, state);
						if_block.c();
						if_block.m(label, text);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (changed.label) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", state.label);
				}

				if (state.open) {
					if (!if_block_1) {
						if_block_1 = create_if_block_1$8(component, state);
						if_block_1.c();
						if_block_1.m(div, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				if ((changed.open || changed.notoggle) && div_class_value !== (div_class_value = "vis-option-type-group " + (state.open?'group-open':'') + " " + (state.notoggle?'notoggle':'') + " svelte-1jbn84t")) {
					div.className = div_class_value;
				}
			},

			u: function unmount() {
				detachAfter(raw_before);

				detachNode(div);
				if (if_block) { if_block.u(); }
				if (if_block_1) { if_block_1.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				removeListener(label, "click", click_handler);
				if (if_block_1) { if_block_1.d(); }
			}
		};
	}

	// (3:8) {#if !notoggle}
	function create_if_block$f(component, state) {
		var i, text, i_1;

		return {
			c: function create() {
				i = createElement("i");
				text = createText("\n        ");
				i_1 = createElement("i");
				this.h();
			},

			h: function hydrate() {
				i.className = "fa fa-chevron-up expand-group pull-right";
				i_1.className = "fa fa-chevron-down collapse-group pull-right";
			},

			m: function mount(target, anchor) {
				insertNode(i, target, anchor);
				insertNode(text, target, anchor);
				insertNode(i_1, target, anchor);
			},

			u: function unmount() {
				detachNode(i);
				detachNode(text);
				detachNode(i_1);
			},

			d: noop
		};
	}

	// (9:4) {#if open}
	function create_if_block_1$8(component, state) {
		var div, slot_content_default = component._slotted.default;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div.className = "option-group-content vis-option-type-chart-description";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);

				if (slot_content_default) {
					appendNode(slot_content_default, div);
				}
			},

			u: function unmount() {
				detachNode(div);

				if (slot_content_default) {
					reinsertChildren(div, slot_content_default);
				}
			},

			d: noop
		};
	}

	function Group(options) {
		this._debugName = '<Group>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data$e(), options.data);
		if (!('open' in this._state)) { console.warn("<Group> was created without expected data property 'open'"); }
		if (!('notoggle' in this._state)) { console.warn("<Group> was created without expected data property 'notoggle'"); }
		if (!('label' in this._state)) { console.warn("<Group> was created without expected data property 'label'"); }

		this._slotted = options.slots || {};

		var self = this;
		var _oncreate = function() {
			var changed = { open: 1, notoggle: 1, label: 1 };
			oncreate$4.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this.slots = {};

		this._fragment = create_main_fragment$i(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(Group.prototype, protoDev);
	assign(Group.prototype, methods$7);

	Group.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

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

	// `_findWhere` : a collection's function

	// Convenience version of a common use case of `find`: getting the first object
	// containing specific `key:value` pairs.
	function _findWhere (obj, attrs) {
		return _find(obj, _matcher(attrs));
	}

	/* editor/EditorNavStep.html generated by Svelte v1.64.0 */

	function activeIndex(ref) {
	    var active = ref.active;
	    var steps = ref.steps;

	    return steps.indexOf(_findWhere(steps, { id: active }));
	}
	function passed(ref) {
	    var index = ref.index;
	    var activeIndex = ref.activeIndex;
	    var maxStep = ref.maxStep;

	    return index < maxStep && index !== activeIndex;
	}
	function class_(ref) {
	    var step = ref.step;
	    var index = ref.index;
	    var active = ref.active;
	    var passed = ref.passed;
	    var $lastEditStep = ref.$lastEditStep;

	    var list = [];
	    if (step.readonly) { list.push('readonly'); }
	    if (active === step.id) { list.push('active'); }
	    else {
	        if (index > $lastEditStep + 1) { list.push('unseen'); }
	        if (passed) { list.push('passed'); }
	    }
	    return list.join(' ');
	}
	function data$f() {
	    return {
	        step: {
	            title: '',
	            index: 1
	        },
	        maxStep: 1,
	        active: 1
	    };
	}
	var methods$8 = {
	    select: function select(event, step) {
	        if (step.redirect) { return; }
	        event.preventDefault();
	        if (step.readonly) { return; }
	        this.fire('select', step);
	        if (window.location.pathname.substr(0, 6) === '/edit/') {
	            var ref = this.store.get();
	            var id = ref.id;
	            window.history.pushState({ step: step, id: id }, '', ("/edit/" + id + "/" + (step.id)));
	        }
	    }
	};

	function onupdate$1(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.activeIndex) {
	        var step = current.steps[current.activeIndex];
	        if (step) {
	            var ref$1 = this.store.get();
	            var id = ref$1.id;
	            var title = ref$1.title;
	            window.document.title = title + " - " + id + " - " + (step.title) + " | Datawrapper";
	        }
	    }
	}
	function create_main_fragment$j(component, state) {
		var a, span, text, text_1, span_1, raw_value = state.step.title, text_2, text_3, div, a_href_value;

		var if_block = (state.passed) && create_if_block$g(component, state);

		function click_handler(event) {
			var state = component.get();
			component.select(event, state.step);
		}

		return {
			c: function create() {
				a = createElement("a");
				span = createElement("span");
				text = createText(state.index);
				text_1 = createText("\n    ");
				span_1 = createElement("span");
				text_2 = createText("\n    ");
				if (if_block) { if_block.c(); }
				text_3 = createText("\n    ");
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				span.className = "step";
				span_1.className = "title";
				div.className = "corner";
				addListener(a, "click", click_handler);
				setStyle(a, "width", "" + 95/state.steps.length + "%");
				a.href = a_href_value = state.step.redirect?state.step.redirect:'#'+state.step.id;
				a.className = state.class_;
			},

			m: function mount(target, anchor) {
				insertNode(a, target, anchor);
				appendNode(span, a);
				appendNode(text, span);
				appendNode(text_1, a);
				appendNode(span_1, a);
				span_1.innerHTML = raw_value;
				appendNode(text_2, a);
				if (if_block) { if_block.m(a, null); }
				appendNode(text_3, a);
				appendNode(div, a);
			},

			p: function update(changed, state) {
				if (changed.index) {
					text.data = state.index;
				}

				if ((changed.step) && raw_value !== (raw_value = state.step.title)) {
					span_1.innerHTML = raw_value;
				}

				if (state.passed) {
					if (!if_block) {
						if_block = create_if_block$g(component, state);
						if_block.c();
						if_block.m(a, text_3);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (changed.steps) {
					setStyle(a, "width", "" + 95/state.steps.length + "%");
				}

				if ((changed.step) && a_href_value !== (a_href_value = state.step.redirect?state.step.redirect:'#'+state.step.id)) {
					a.href = a_href_value;
				}

				if (changed.class_) {
					a.className = state.class_;
				}
			},

			u: function unmount() {
				span_1.innerHTML = '';

				detachNode(a);
				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				removeListener(a, "click", click_handler);
			}
		};
	}

	// (4:4) {#if passed }
	function create_if_block$g(component, state) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				this.h();
			},

			h: function hydrate() {
				i.className = "fa fa-check";
			},

			m: function mount(target, anchor) {
				insertNode(i, target, anchor);
			},

			u: function unmount() {
				detachNode(i);
			},

			d: noop
		};
	}

	function EditorNavStep(options) {
		this._debugName = '<EditorNavStep>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(assign(this.store._init(["lastEditStep"]), data$f()), options.data);
		this.store._add(this, ["lastEditStep"]);
		this._recompute({ active: 1, steps: 1, index: 1, activeIndex: 1, maxStep: 1, step: 1, passed: 1, $lastEditStep: 1 }, this._state);
		if (!('active' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'active'"); }
		if (!('steps' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'steps'"); }
		if (!('index' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'index'"); }

		if (!('maxStep' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'maxStep'"); }
		if (!('step' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'step'"); }

		if (!('$lastEditStep' in this._state)) { console.warn("<EditorNavStep> was created without expected data property '$lastEditStep'"); }
		this._handlers.update = [onupdate$1];

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { active: 1, steps: 1, index: 1, activeIndex: 1, maxStep: 1, step: 1, passed: 1, $lastEditStep: 1, class_: 1 };
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment$j(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(EditorNavStep.prototype, protoDev);
	assign(EditorNavStep.prototype, methods$8);

	EditorNavStep.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('activeIndex' in newState && !this._updatingReadonlyProperty) { throw new Error("<EditorNavStep>: Cannot set read-only property 'activeIndex'"); }
		if ('passed' in newState && !this._updatingReadonlyProperty) { throw new Error("<EditorNavStep>: Cannot set read-only property 'passed'"); }
		if ('class_' in newState && !this._updatingReadonlyProperty) { throw new Error("<EditorNavStep>: Cannot set read-only property 'class_'"); }
	};

	EditorNavStep.prototype._recompute = function _recompute(changed, state) {
		if (changed.active || changed.steps) {
			if (this._differs(state.activeIndex, (state.activeIndex = activeIndex(state)))) { changed.activeIndex = true; }
		}

		if (changed.index || changed.activeIndex || changed.maxStep) {
			if (this._differs(state.passed, (state.passed = passed(state)))) { changed.passed = true; }
		}

		if (changed.step || changed.index || changed.active || changed.passed || changed.$lastEditStep) {
			if (this._differs(state.class_, (state.class_ = class_(state)))) { changed.class_ = true; }
		}
	};

	/* @DEPRECATED: plase use @datawrapper/shared instead */

	var previousPageUrl;

	function trackPageView(loadTime) {
	    if ( loadTime === void 0 ) loadTime = 0;

	    if (window._paq) {
	        if (previousPageUrl) {
	            window._paq.push(['setReferrerUrl', previousPageUrl]);
	        }
	        window._paq.push(['setGenerationTimeMs', loadTime]);
	        window._paq.push(['setCustomUrl', window.location.pathname]);
	        window._paq.push(['setDocumentTitle', window.document.title]);
	        window._paq.push(['trackPageView']);
	        previousPageUrl = window.location.pathname;
	    }
	}

	/* editor/EditorNav.html generated by Svelte v1.64.0 */

	function data$g() {
	    return {
	        steps: []
	    };
	}
	var methods$9 = {
	    select: function select(step, index) {
	        this.set({ active: step.id });
	        var ref = this.store.get();
	        var lastEditStep = ref.lastEditStep;
	        this.store.set({ lastEditStep: Math.max(lastEditStep, index + 1) });
	        trackPageView();
	    },
	    popstate: function popstate(event) {
	        if (event.state && event.state.id && event.state.step) {
	            var ref = event.state;
	            var id = ref.id;
	            var step = ref.step;
	            if (id === this.store.get().id) {
	                // same chart id
	                this.set({ active: step.id });
	                trackPageView();
	            } else {
	                // need to reload
	                window.location.href = "/edit/" + id + "/" + (step.id);
	            }
	        }
	    }
	};

	function oncreate$5() {
	    var ref = this.get();
	    var active = ref.active;
	    var steps = ref.steps;
	    var ref$1 = this.store.get();
	    var lastEditStep = ref$1.lastEditStep;
	    var id = ref$1.id;
	    var step = _findWhere(steps, { id: active });
	    this.store.set({ lastEditStep: Math.max(lastEditStep, steps.indexOf(step) + 1) });
	    // make sure the initial state is stored
	    window.history.replaceState({ step: step, id: id }, step.title);
	}
	function create_main_fragment$k(component, state) {
		var div, text_1, if_block_anchor;

		function onwindowpopstate(event) {
			component.popstate(event);
		}
		window.addEventListener("popstate", onwindowpopstate);

		var each_value = state.steps;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$8(component, assign(assign({}, state), {
				each_value: each_value,
				step: each_value[i],
				i: i
			}));
		}

		var if_block = (state.$user.id != state.$authorId && state.$user.isAdmin) && create_if_block$h(component, state);

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text_1 = createText("\n\n");
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
				this.h();
			},

			h: function hydrate() {
				div.className = "create-nav svelte-nols97";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				insertNode(text_1, target, anchor);
				if (if_block) { if_block.m(target, anchor); }
				insertNode(if_block_anchor, target, anchor);
			},

			p: function update(changed, state) {
				var each_value = state.steps;

				if (changed.steps || changed.active) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							step: each_value[i],
							i: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$8(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}

				if (state.$user.id != state.$authorId && state.$user.isAdmin) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$h(component, state);
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
				detachNode(div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				detachNode(text_1);
				if (if_block) { if_block.u(); }
				detachNode(if_block_anchor);
			},

			d: function destroy() {
				window.removeEventListener("popstate", onwindowpopstate);

				destroyEach(each_blocks);

				if (if_block) { if_block.d(); }
			}
		};
	}

	// (4:4) {#each steps as step,i}
	function create_each_block$8(component, state) {
		var step = state.step, each_value = state.each_value, i = state.i;
		var editornavstep_updating = {};

		var editornavstep_initial_data = { index: i+1 };
		if (i in state.each_value) {
			editornavstep_initial_data.step = step ;
			editornavstep_updating.step = true;
		}
		if ('steps' in state) {
			editornavstep_initial_data.steps = state.steps ;
			editornavstep_updating.steps = true;
		}
		if ('active' in state) {
			editornavstep_initial_data.active = state.active ;
			editornavstep_updating.active = true;
		}
		var editornavstep = new EditorNavStep({
			root: component.root,
			data: editornavstep_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!editornavstep_updating.step && changed.step) {
					each_value[i] = childState.step;

					newState.steps = state.steps;
				}

				if (!editornavstep_updating.steps && changed.steps) {
					newState.steps = childState.steps;
				}

				if (!editornavstep_updating.active && changed.active) {
					newState.active = childState.active;
				}
				component._set(newState);
				editornavstep_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			editornavstep._bind({ step: 1, steps: 1, active: 1 }, editornavstep.get());
		});

		editornavstep.on("select", function(event) {
			component.select(step, i);
		});

		return {
			c: function create() {
				editornavstep._fragment.c();
			},

			m: function mount(target, anchor) {
				editornavstep._mount(target, anchor);
			},

			p: function update(changed, state) {
				step = state.step;
				each_value = state.each_value;
				i = state.i;
				var editornavstep_changes = {};
				editornavstep_changes.index = i+1;
				if (!editornavstep_updating.step && changed.steps) {
					editornavstep_changes.step = step ;
					editornavstep_updating.step = true;
				}
				if (!editornavstep_updating.steps && changed.steps) {
					editornavstep_changes.steps = state.steps ;
					editornavstep_updating.steps = true;
				}
				if (!editornavstep_updating.active && changed.active) {
					editornavstep_changes.active = state.active ;
					editornavstep_updating.active = true;
				}
				editornavstep._set(editornavstep_changes);
				editornavstep_updating = {};
			},

			u: function unmount() {
				editornavstep._unmount();
			},

			d: function destroy() {
				editornavstep.destroy(false);
			}
		};
	}

	// (9:0) {#if $user.id != $authorId && $user.isAdmin}
	function create_if_block$h(component, state) {
		var div, text, a, text_1, text_2, a_href_value, text_3;

		return {
			c: function create() {
				div = createElement("div");
				text = createText("This chart belongs to\n    ");
				a = createElement("a");
				text_1 = createText("User ");
				text_2 = createText(state.$authorId);
				text_3 = createText(". Great power comes with great responsibility, so be careful with what\n    you're doing!");
				this.h();
			},

			h: function hydrate() {
				a.target = "_blank";
				a.href = a_href_value = "/admin/chart/by/" + state.$authorId;
				div.className = "alert alert-warning";
				setStyle(div, "text-align", "center");
				setStyle(div, "margin-top", "10px");
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(text, div);
				appendNode(a, div);
				appendNode(text_1, a);
				appendNode(text_2, a);
				appendNode(text_3, div);
			},

			p: function update(changed, state) {
				if (changed.$authorId) {
					text_2.data = state.$authorId;
				}

				if ((changed.$authorId) && a_href_value !== (a_href_value = "/admin/chart/by/" + state.$authorId)) {
					a.href = a_href_value;
				}
			},

			u: function unmount() {
				detachNode(div);
			},

			d: noop
		};
	}

	function EditorNav(options) {
		this._debugName = '<EditorNav>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(assign(this.store._init(["user","authorId"]), data$g()), options.data);
		this.store._add(this, ["user","authorId"]);
		if (!('steps' in this._state)) { console.warn("<EditorNav> was created without expected data property 'steps'"); }
		if (!('active' in this._state)) { console.warn("<EditorNav> was created without expected data property 'active'"); }
		if (!('$user' in this._state)) { console.warn("<EditorNav> was created without expected data property '$user'"); }
		if (!('$authorId' in this._state)) { console.warn("<EditorNav> was created without expected data property '$authorId'"); }

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { steps: 1, active: 1, $user: 1, $authorId: 1 };
			oncreate$5.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$k(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(EditorNav.prototype, protoDev);
	assign(EditorNav.prototype, methods$9);

	EditorNav.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	var main = {
	    Checkbox: Checkbox,
	    Color: Color,
	    ColorPicker: ColorPicker,
	    Group: Group,
	    NumberInput: Number,
	    Switch: Switch,
	    Dropdown: Dropdown,
	    Radio: Radio,
	    Select: Select,
	    SelectAxisColumn: SelectAxisColumn,
	    CustomFormat: CustomFormat,
	    Section: Section,
	    TextArea: TextArea,
	    Help: Help,
	    Text: Text,
	    TypeAhead: TypeAhead,
	    EditorNav: EditorNav,
	    BaseNumber: BaseNumber,
	    ControlGroup: ControlGroup
	};

	return main;

}));
//# sourceMappingURL=controls.js.map
