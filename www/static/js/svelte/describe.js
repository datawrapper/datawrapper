<<<<<<< HEAD
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('cm/lib/codemirror'), require('cm/mode/javascript/javascript'), require('cm/addon/mode/simple'), require('cm/addon/hint/show-hint'), require('cm/addon/edit/matchbrackets'), require('cm/addon/display/placeholder'), require('Handsontable')) :
	typeof define === 'function' && define.amd ? define('svelte/describe', ['cm/lib/codemirror', 'cm/mode/javascript/javascript', 'cm/addon/mode/simple', 'cm/addon/hint/show-hint', 'cm/addon/edit/matchbrackets', 'cm/addon/display/placeholder', 'Handsontable'], factory) :
	(global = global || self, global.describe = factory(global.CodeMirror, null, null, null, null, null, global.HOT));
}(this, function (CodeMirror, javascript, simple, showHint, matchbrackets, placeholder, HOT) { 'use strict';

	CodeMirror = CodeMirror && CodeMirror.hasOwnProperty('default') ? CodeMirror['default'] : CodeMirror;
	HOT = HOT && HOT.hasOwnProperty('default') ? HOT['default'] : HOT;

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

	function run(fn) {
		fn();
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

	function detachAfter(before) {
		while (before.nextSibling) {
			before.parentNode.removeChild(before.nextSibling);
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

	function createSvgElement(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
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

	function linear(t) {
		return t;
	}

	function generateRule({ a, b, delta, duration }, ease, fn) {
		const step = 16.666 / duration;
		let keyframes = '{\n';

		for (let p = 0; p <= 1; p += step) {
			const t = a + delta * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}

		return keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	}

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
		let hash = 5381;
		let i = str.length;

		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	function wrapTransition(component, node, fn, params, intro) {
		let obj = fn.call(component, node, params);
		let duration;
		let ease;
		let cssText;

		let initialised = false;

		return {
			t: intro ? 0 : 1,
			running: false,
			program: null,
			pending: null,

			run(b, callback) {
				if (typeof obj === 'function') {
					transitionManager.wait().then(() => {
						obj = obj();
						this._run(b, callback);
					});
				} else {
					this._run(b, callback);
				}
			},

			_run(b, callback) {
				duration = obj.duration || 300;
				ease = obj.easing || linear;

				const program = {
					start: window.performance.now() + (obj.delay || 0),
					b,
					callback: callback || noop
				};

				if (intro && !initialised) {
					if (obj.css && obj.delay) {
						cssText = node.style.cssText;
						node.style.cssText += obj.css(0, 1);
					}

					if (obj.tick) obj.tick(0, 1);
					initialised = true;
				}

				if (!b) {
					program.group = outros.current;
					outros.current.remaining += 1;
				}

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

			start(program) {
				component.fire(`${program.b ? 'intro' : 'outro'}.start`, { node });

				program.a = this.t;
				program.delta = program.b - program.a;
				program.duration = duration * Math.abs(program.b - program.a);
				program.end = program.start + program.duration;

				if (obj.css) {
					if (obj.delay) node.style.cssText = cssText;

					const rule = generateRule(program, ease, obj.css);
					transitionManager.addRule(rule, program.name = '__svelte_' + hash(rule));

					node.style.animation = (node.style.animation || '')
						.split(', ')
						.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
						.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
						.join(', ');
				}

				this.program = program;
				this.pending = null;
			},

			update(now) {
				const program = this.program;
				if (!program) return;

				const p = now - program.start;
				this.t = program.a + program.delta * ease(p / program.duration);
				if (obj.tick) obj.tick(this.t, 1 - this.t);
			},

			done() {
				const program = this.program;
				this.t = program.b;

				if (obj.tick) obj.tick(this.t, 1 - this.t);

				component.fire(`${program.b ? 'intro' : 'outro'}.end`, { node });

				if (!program.b && !program.invalidated) {
					program.group.callbacks.push(() => {
						program.callback();
						if (obj.css) transitionManager.deleteRule(node, program.name);
					});

					if (--program.group.remaining === 0) {
						program.group.callbacks.forEach(run);
					}
				} else {
					if (obj.css) transitionManager.deleteRule(node, program.name);
				}

				this.running = !!this.pending;
			},

			abort(reset) {
				if (this.program) {
					if (reset && obj.tick) obj.tick(1, 0);
					if (obj.css) transitionManager.deleteRule(node, this.program.name);
					this.program = this.pending = null;
					this.running = false;
				}
			},

			invalidate() {
				if (this.program) {
					this.program.invalidated = true;
				}
			}
		};
	}

	let outros = {};

	function groupOutros() {
		outros.current = {
			remaining: 0,
			callbacks: []
		};
	}

	var transitionManager = {
		running: false,
		transitions: [],
		bound: null,
		stylesheet: null,
		activeRules: {},
		promise: null,

		add(transition) {
			this.transitions.push(transition);

			if (!this.running) {
				this.running = true;
				requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
			}
		},

		addRule(rule, name) {
			if (!this.stylesheet) {
				const style = createElement('style');
				document.head.appendChild(style);
				transitionManager.stylesheet = style.sheet;
			}

			if (!this.activeRules[name]) {
				this.activeRules[name] = true;
				this.stylesheet.insertRule(`@keyframes ${name} ${rule}`, this.stylesheet.cssRules.length);
			}
		},

		next() {
			this.running = false;

			const now = window.performance.now();
			let i = this.transitions.length;

			while (i--) {
				const transition = this.transitions[i];

				if (transition.program && now >= transition.program.end) {
					transition.done();
				}

				if (transition.pending && now >= transition.pending.start) {
					transition.start(transition.pending);
				}

				if (transition.running) {
					transition.update(now);
					this.running = true;
				} else if (!transition.pending) {
					this.transitions.splice(i, 1);
				}
			}

			if (this.running) {
				requestAnimationFrame(this.bound);
			} else if (this.stylesheet) {
				let i = this.stylesheet.cssRules.length;
				while (i--) this.stylesheet.deleteRule(i);
				this.activeRules = {};
			}
		},

		deleteRule(node, name) {
			node.style.animation = node.style.animation
				.split(', ')
				.filter(anim => anim && anim.indexOf(name) === -1)
				.join(', ');
		},

		wait() {
			if (!transitionManager.promise) {
				transitionManager.promise = Promise.resolve();
				transitionManager.promise.then(() => {
					transitionManager.promise = null;
				});
			}

			return transitionManager.promise;
		}
	};

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
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	var isObject_1 = isObject;

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

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	var _freeGlobal = freeGlobal;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = _freeGlobal || freeSelf || Function('return this')();

	var _root = root;

	/**
	 * Gets the timestamp of the number of milliseconds that have elapsed since
	 * the Unix epoch (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Date
	 * @returns {number} Returns the timestamp.
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => Logs the number of milliseconds it took for the deferred invocation.
	 */
	var now = function() {
	  return _root.Date.now();
	};

	var now_1 = now;

	/** Built-in value references. */
	var Symbol$1 = _root.Symbol;

	var _Symbol = Symbol$1;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
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

	var _getRawTag = getRawTag;

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

	var _objectToString = objectToString;

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

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
	    ? _getRawTag(value)
	    : _objectToString(value);
	}

	var _baseGetTag = baseGetTag;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}

	var isObjectLike_1 = isObjectLike;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
	}

	var isSymbol_1 = isSymbol;

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol_1(value)) {
	    return NAN;
	  }
	  if (isObject_1(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject_1(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	var toNumber_1 = toNumber;

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max,
	    nativeMin = Math.min;

	/**
	 * Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide `options` to indicate whether `func` should be invoked on the
	 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent
	 * calls to the debounced function return the result of the last `func`
	 * invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the debounced function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.debounce` and `_.throttle`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to debounce.
	 * @param {number} [wait=0] The number of milliseconds to delay.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=false]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {number} [options.maxWait]
	 *  The maximum time `func` is allowed to be delayed before it's invoked.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new debounced function.
	 * @example
	 *
	 * // Avoid costly calculations while the window size is in flux.
	 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	 *
	 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	 * jQuery(element).on('click', _.debounce(sendMail, 300, {
	 *   'leading': true,
	 *   'trailing': false
	 * }));
	 *
	 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	 * var source = new EventSource('/stream');
	 * jQuery(source).on('message', debounced);
	 *
	 * // Cancel the trailing debounced invocation.
	 * jQuery(window).on('popstate', debounced.cancel);
	 */
	function debounce(func, wait, options) {
	  var lastArgs,
	      lastThis,
	      maxWait,
	      result,
	      timerId,
	      lastCallTime,
	      lastInvokeTime = 0,
	      leading = false,
	      maxing = false,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  wait = toNumber_1(wait) || 0;
	  if (isObject_1(options)) {
	    leading = !!options.leading;
	    maxing = 'maxWait' in options;
	    maxWait = maxing ? nativeMax(toNumber_1(options.maxWait) || 0, wait) : maxWait;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }

	  function invokeFunc(time) {
	    var args = lastArgs,
	        thisArg = lastThis;

	    lastArgs = lastThis = undefined;
	    lastInvokeTime = time;
	    result = func.apply(thisArg, args);
	    return result;
	  }

	  function leadingEdge(time) {
	    // Reset any `maxWait` timer.
	    lastInvokeTime = time;
	    // Start the timer for the trailing edge.
	    timerId = setTimeout(timerExpired, wait);
	    // Invoke the leading edge.
	    return leading ? invokeFunc(time) : result;
	  }

	  function remainingWait(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime,
	        timeWaiting = wait - timeSinceLastCall;

	    return maxing
	      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
	      : timeWaiting;
	  }

	  function shouldInvoke(time) {
	    var timeSinceLastCall = time - lastCallTime,
	        timeSinceLastInvoke = time - lastInvokeTime;

	    // Either this is the first call, activity has stopped and we're at the
	    // trailing edge, the system time has gone backwards and we're treating
	    // it as the trailing edge, or we've hit the `maxWait` limit.
	    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
	      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
	  }

	  function timerExpired() {
	    var time = now_1();
	    if (shouldInvoke(time)) {
	      return trailingEdge(time);
	    }
	    // Restart the timer.
	    timerId = setTimeout(timerExpired, remainingWait(time));
	  }

	  function trailingEdge(time) {
	    timerId = undefined;

	    // Only invoke if we have `lastArgs` which means `func` has been
	    // debounced at least once.
	    if (trailing && lastArgs) {
	      return invokeFunc(time);
	    }
	    lastArgs = lastThis = undefined;
	    return result;
	  }

	  function cancel() {
	    if (timerId !== undefined) {
	      clearTimeout(timerId);
	    }
	    lastInvokeTime = 0;
	    lastArgs = lastCallTime = lastThis = timerId = undefined;
	  }

	  function flush() {
	    return timerId === undefined ? result : trailingEdge(now_1());
	  }

	  function debounced() {
	    var time = now_1(),
	        isInvoking = shouldInvoke(time);

	    lastArgs = arguments;
	    lastThis = this;
	    lastCallTime = time;

	    if (isInvoking) {
	      if (timerId === undefined) {
	        return leadingEdge(lastCallTime);
	      }
	      if (maxing) {
	        // Handle invocations in a tight loop.
	        clearTimeout(timerId);
	        timerId = setTimeout(timerExpired, wait);
	        return invokeFunc(lastCallTime);
	      }
	    }
	    if (timerId === undefined) {
	      timerId = setTimeout(timerExpired, wait);
	    }
	    return result;
	  }
	  debounced.cancel = cancel;
	  debounced.flush = flush;
	  return debounced;
	}

	var debounce_1 = debounce;

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
	function isFunction(value) {
	  if (!isObject_1(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = _baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	var isFunction_1 = isFunction;

	/** Used to detect overreaching core-js shims. */
	var coreJsData = _root['__core-js_shared__'];

	var _coreJsData = coreJsData;

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
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

	var _isMasked = isMasked;

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

	var _toSource = toSource;

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
	var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
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
	  if (!isObject_1(value) || _isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(_toSource(value));
	}

	var _baseIsNative = baseIsNative;

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

	var _getValue = getValue;

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = _getValue(object, key);
	  return _baseIsNative(value) ? value : undefined;
	}

	var _getNative = getNative;

	var defineProperty = (function() {
	  try {
	    var func = _getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

	var _defineProperty = defineProperty;

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue(object, key, value) {
	  if (key == '__proto__' && _defineProperty) {
	    _defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	var _baseAssignValue = baseAssignValue;

	/**
	 * A specialized version of `baseAggregator` for arrays.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform keys.
	 * @param {Object} accumulator The initial aggregated object.
	 * @returns {Function} Returns `accumulator`.
	 */
	function arrayAggregator(array, setter, iteratee, accumulator) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    var value = array[index];
	    setter(accumulator, value, iteratee(value), array);
	  }
	  return accumulator;
	}

	var _arrayAggregator = arrayAggregator;

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	var _createBaseFor = createBaseFor;

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = _createBaseFor();

	var _baseFor = baseFor;

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	var _baseTimes = baseTimes;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments(value) {
	  return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
	}

	var _baseIsArguments = baseIsArguments;

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
	  return isObjectLike_1(value) && hasOwnProperty$2.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
	};

	var isArguments_1 = isArguments;

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	var isArray_1 = isArray;

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	var stubFalse_1 = stubFalse;

	var isBuffer_1 = createCommonjsModule(function (module, exports) {
	/** Detect free variable `exports`. */
	var freeExports =  exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? _root.Buffer : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse_1;

	module.exports = isBuffer;
	});

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER : length;

	  return !!length &&
	    (type == 'number' ||
	      (type != 'symbol' && reIsUint.test(value))) &&
	        (value > -1 && value % 1 == 0 && value < length);
	}

	var _isIndex = isIndex;

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER$1 = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
	}

	var isLength_1 = isLength;

	/** `Object#toString` result references. */
	var argsTag$1 = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag$1 = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike_1(value) &&
	    isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
	}

	var _baseIsTypedArray = baseIsTypedArray;

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	var _baseUnary = baseUnary;

	var _nodeUtil = createCommonjsModule(function (module, exports) {
	/** Detect free variable `exports`. */
	var freeExports =  exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && _freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule && freeModule.require && freeModule.require('util').types;

	    if (types) {
	      return types;
	    }

	    // Legacy `process.binding('util')` for Node.js < 10.
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	module.exports = nodeUtil;
	});

	/* Node.js helper references. */
	var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

	var isTypedArray_1 = isTypedArray;

	/** Used for built-in method references. */
	var objectProto$4 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray_1(value),
	      isArg = !isArr && isArguments_1(value),
	      isBuff = !isArr && !isArg && isBuffer_1(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? _baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty$3.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           _isIndex(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _arrayLikeKeys = arrayLikeKeys;

	/** Used for built-in method references. */
	var objectProto$5 = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

	  return value === proto;
	}

	var _isPrototype = isPrototype;

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	var _overArg = overArg;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = _overArg(Object.keys, Object);

	var _nativeKeys = nativeKeys;

	/** Used for built-in method references. */
	var objectProto$6 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!_isPrototype(object)) {
	    return _nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty$4.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _baseKeys = baseKeys;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength_1(value.length) && !isFunction_1(value);
	}

	var isArrayLike_1 = isArrayLike;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
	}

	var keys_1 = keys;

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && _baseFor(object, iteratee, keys_1);
	}

	var _baseForOwn = baseForOwn;

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike_1(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	var _createBaseEach = createBaseEach;

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = _createBaseEach(_baseForOwn);

	var _baseEach = baseEach;

	/**
	 * Aggregates elements of `collection` on `accumulator` with keys transformed
	 * by `iteratee` and values set by `setter`.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform keys.
	 * @param {Object} accumulator The initial aggregated object.
	 * @returns {Function} Returns `accumulator`.
	 */
	function baseAggregator(collection, setter, iteratee, accumulator) {
	  _baseEach(collection, function(value, key, collection) {
	    setter(accumulator, value, iteratee(value), collection);
	  });
	  return accumulator;
	}

	var _baseAggregator = baseAggregator;

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

	var _listCacheClear = listCacheClear;

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
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	var eq_1 = eq;

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
	    if (eq_1(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	var _assocIndexOf = assocIndexOf;

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
	      index = _assocIndexOf(data, key);

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

	var _listCacheDelete = listCacheDelete;

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
	      index = _assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	var _listCacheGet = listCacheGet;

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
	  return _assocIndexOf(this.__data__, key) > -1;
	}

	var _listCacheHas = listCacheHas;

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
	      index = _assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	var _listCacheSet = listCacheSet;

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
	ListCache.prototype.clear = _listCacheClear;
	ListCache.prototype['delete'] = _listCacheDelete;
	ListCache.prototype.get = _listCacheGet;
	ListCache.prototype.has = _listCacheHas;
	ListCache.prototype.set = _listCacheSet;

	var _ListCache = ListCache;

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new _ListCache;
	  this.size = 0;
	}

	var _stackClear = stackClear;

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      result = data['delete'](key);

	  this.size = data.size;
	  return result;
	}

	var _stackDelete = stackDelete;

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}

	var _stackGet = stackGet;

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}

	var _stackHas = stackHas;

	/* Built-in method references that are verified to be native. */
	var Map$1 = _getNative(_root, 'Map');

	var _Map = Map$1;

	/* Built-in method references that are verified to be native. */
	var nativeCreate = _getNative(Object, 'create');

	var _nativeCreate = nativeCreate;

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
	  this.size = 0;
	}

	var _hashClear = hashClear;

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

	var _hashDelete = hashDelete;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto$7 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

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
	  if (_nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty$5.call(data, key) ? data[key] : undefined;
	}

	var _hashGet = hashGet;

	/** Used for built-in method references. */
	var objectProto$8 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

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
	  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
	}

	var _hashHas = hashHas;

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
	  data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
	  return this;
	}

	var _hashSet = hashSet;

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
	Hash.prototype.clear = _hashClear;
	Hash.prototype['delete'] = _hashDelete;
	Hash.prototype.get = _hashGet;
	Hash.prototype.has = _hashHas;
	Hash.prototype.set = _hashSet;

	var _Hash = Hash;

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
	    'hash': new _Hash,
	    'map': new (_Map || _ListCache),
	    'string': new _Hash
	  };
	}

	var _mapCacheClear = mapCacheClear;

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

	var _isKeyable = isKeyable;

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
	  return _isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	var _getMapData = getMapData;

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
	  var result = _getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _mapCacheDelete = mapCacheDelete;

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
	  return _getMapData(this, key).get(key);
	}

	var _mapCacheGet = mapCacheGet;

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
	  return _getMapData(this, key).has(key);
	}

	var _mapCacheHas = mapCacheHas;

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
	  var data = _getMapData(this, key),
	      size = data.size;

	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	var _mapCacheSet = mapCacheSet;

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
	MapCache.prototype.clear = _mapCacheClear;
	MapCache.prototype['delete'] = _mapCacheDelete;
	MapCache.prototype.get = _mapCacheGet;
	MapCache.prototype.has = _mapCacheHas;
	MapCache.prototype.set = _mapCacheSet;

	var _MapCache = MapCache;

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var data = this.__data__;
	  if (data instanceof _ListCache) {
	    var pairs = data.__data__;
	    if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new _MapCache(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	var _stackSet = stackSet;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  var data = this.__data__ = new _ListCache(entries);
	  this.size = data.size;
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = _stackClear;
	Stack.prototype['delete'] = _stackDelete;
	Stack.prototype.get = _stackGet;
	Stack.prototype.has = _stackHas;
	Stack.prototype.set = _stackSet;

	var _Stack = Stack;

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

	var _setCacheAdd = setCacheAdd;

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

	var _setCacheHas = setCacheHas;

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

	  this.__data__ = new _MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
	SetCache.prototype.has = _setCacheHas;

	var _SetCache = SetCache;

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	var _arraySome = arraySome;

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

	var _cacheHas = cacheHas;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new _SetCache : undefined;

	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!_arraySome(other, function(othValue, othIndex) {
	            if (!_cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	var _equalArrays = equalArrays;

	/** Built-in value references. */
	var Uint8Array = _root.Uint8Array;

	var _Uint8Array = Uint8Array;

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	var _mapToArray = mapToArray;

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

	var _setToArray = setToArray;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$1 = 1,
	    COMPARE_UNORDERED_FLAG$1 = 2;

	/** `Object#toString` result references. */
	var boolTag$1 = '[object Boolean]',
	    dateTag$1 = '[object Date]',
	    errorTag$1 = '[object Error]',
	    mapTag$1 = '[object Map]',
	    numberTag$1 = '[object Number]',
	    regexpTag$1 = '[object RegExp]',
	    setTag$1 = '[object Set]',
	    stringTag$1 = '[object String]',
	    symbolTag$1 = '[object Symbol]';

	var arrayBufferTag$1 = '[object ArrayBuffer]',
	    dataViewTag$1 = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = _Symbol ? _Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag$1:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag$1:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag$1:
	    case dateTag$1:
	    case numberTag$1:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq_1(+object, +other);

	    case errorTag$1:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag$1:
	    case stringTag$1:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag$1:
	      var convert = _mapToArray;

	    case setTag$1:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
	      convert || (convert = _setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG$1;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag$1:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	var _equalByTag = equalByTag;

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	var _arrayPush = arrayPush;

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
	}

	var _baseGetAllKeys = baseGetAllKeys;

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}

	var _arrayFilter = arrayFilter;

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}

	var stubArray_1 = stubArray;

	/** Used for built-in method references. */
	var objectProto$9 = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable$1 = objectProto$9.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return _arrayFilter(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable$1.call(object, symbol);
	  });
	};

	var _getSymbols = getSymbols;

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return _baseGetAllKeys(object, keys_1, _getSymbols);
	}

	var _getAllKeys = getAllKeys;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$2 = 1;

	/** Used for built-in method references. */
	var objectProto$a = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$7 = objectProto$a.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
	      objProps = _getAllKeys(object),
	      objLength = objProps.length,
	      othProps = _getAllKeys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty$7.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	var _equalObjects = equalObjects;

	/* Built-in method references that are verified to be native. */
	var DataView$1 = _getNative(_root, 'DataView');

	var _DataView = DataView$1;

	/* Built-in method references that are verified to be native. */
	var Promise$1 = _getNative(_root, 'Promise');

	var _Promise = Promise$1;

	/* Built-in method references that are verified to be native. */
	var Set$1 = _getNative(_root, 'Set');

	var _Set = Set$1;

	/* Built-in method references that are verified to be native. */
	var WeakMap = _getNative(_root, 'WeakMap');

	var _WeakMap = WeakMap;

	/** `Object#toString` result references. */
	var mapTag$2 = '[object Map]',
	    objectTag$1 = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag$2 = '[object Set]',
	    weakMapTag$1 = '[object WeakMap]';

	var dataViewTag$2 = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = _toSource(_DataView),
	    mapCtorString = _toSource(_Map),
	    promiseCtorString = _toSource(_Promise),
	    setCtorString = _toSource(_Set),
	    weakMapCtorString = _toSource(_WeakMap);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = _baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
	    (_Map && getTag(new _Map) != mapTag$2) ||
	    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
	    (_Set && getTag(new _Set) != setTag$2) ||
	    (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
	  getTag = function(value) {
	    var result = _baseGetTag(value),
	        Ctor = result == objectTag$1 ? value.constructor : undefined,
	        ctorString = Ctor ? _toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag$2;
	        case mapCtorString: return mapTag$2;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag$2;
	        case weakMapCtorString: return weakMapTag$1;
	      }
	    }
	    return result;
	  };
	}

	var _getTag = getTag;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$3 = 1;

	/** `Object#toString` result references. */
	var argsTag$2 = '[object Arguments]',
	    arrayTag$1 = '[object Array]',
	    objectTag$2 = '[object Object]';

	/** Used for built-in method references. */
	var objectProto$b = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$8 = objectProto$b.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray_1(object),
	      othIsArr = isArray_1(other),
	      objTag = objIsArr ? arrayTag$1 : _getTag(object),
	      othTag = othIsArr ? arrayTag$1 : _getTag(other);

	  objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
	  othTag = othTag == argsTag$2 ? objectTag$2 : othTag;

	  var objIsObj = objTag == objectTag$2,
	      othIsObj = othTag == objectTag$2,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer_1(object)) {
	    if (!isBuffer_1(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new _Stack);
	    return (objIsArr || isTypedArray_1(object))
	      ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
	    var objIsWrapped = objIsObj && hasOwnProperty$8.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty$8.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new _Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new _Stack);
	  return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	var _baseIsEqualDeep = baseIsEqualDeep;

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike_1(value) && !isObjectLike_1(other))) {
	    return value !== value && other !== other;
	  }
	  return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}

	var _baseIsEqual = baseIsEqual;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$4 = 1,
	    COMPARE_UNORDERED_FLAG$2 = 2;

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new _Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	var _baseIsMatch = baseIsMatch;

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject_1(value);
	}

	var _isStrictComparable = isStrictComparable;

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys_1(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];

	    result[length] = [key, value, _isStrictComparable(value)];
	  }
	  return result;
	}

	var _getMatchData = getMatchData;

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}

	var _matchesStrictComparable = matchesStrictComparable;

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = _getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || _baseIsMatch(object, source, matchData);
	  };
	}

	var _baseMatches = baseMatches;

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray_1(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol_1(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	var _isKey = isKey;

	/** Error message constants. */
	var FUNC_ERROR_TEXT$1 = 'Expected a function';

	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT$1);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;

	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || _MapCache);
	  return memoized;
	}

	// Expose `MapCache`.
	memoize.Cache = _MapCache;

	var memoize_1 = memoize;

	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;

	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped(func) {
	  var result = memoize_1(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });

	  var cache = result.cache;
	  return result;
	}

	var _memoizeCapped = memoizeCapped;

	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = _memoizeCapped(function(string) {
	  var result = [];
	  if (string.charCodeAt(0) === 46 /* . */) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});

	var _stringToPath = stringToPath;

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	var _arrayMap = arrayMap;

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
	    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray_1(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return _arrayMap(value, baseToString) + '';
	  }
	  if (isSymbol_1(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	var _baseToString = baseToString;

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : _baseToString(value);
	}

	var toString_1 = toString;

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value, object) {
	  if (isArray_1(value)) {
	    return value;
	  }
	  return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
	}

	var _castPath = castPath;

	/** Used as references for various `Number` constants. */
	var INFINITY$1 = 1 / 0;

	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol_1(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
	}

	var _toKey = toKey;

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = _castPath(path, object);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[_toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	var _baseGet = baseGet;

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get$1(object, path, defaultValue) {
	  var result = object == null ? undefined : _baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}

	var get_1 = get$1;

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}

	var _baseHasIn = baseHasIn;

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = _castPath(path, object);

	  var index = -1,
	      length = path.length,
	      result = false;

	  while (++index < length) {
	    var key = _toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength_1(length) && _isIndex(key, length) &&
	    (isArray_1(object) || isArguments_1(object));
	}

	var _hasPath = hasPath;

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && _hasPath(object, path, _baseHasIn);
	}

	var hasIn_1 = hasIn;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$5 = 1,
	    COMPARE_UNORDERED_FLAG$3 = 2;

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (_isKey(path) && _isStrictComparable(srcValue)) {
	    return _matchesStrictComparable(_toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get_1(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn_1(object, path)
	      : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
	  };
	}

	var _baseMatchesProperty = baseMatchesProperty;

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	var identity_1 = identity;

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	var _baseProperty = baseProperty;

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return _baseGet(object, path);
	  };
	}

	var _basePropertyDeep = basePropertyDeep;

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
	}

	var property_1 = property;

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity_1;
	  }
	  if (typeof value == 'object') {
	    return isArray_1(value)
	      ? _baseMatchesProperty(value[0], value[1])
	      : _baseMatches(value);
	  }
	  return property_1(value);
	}

	var _baseIteratee = baseIteratee;

	/**
	 * Creates a function like `_.groupBy`.
	 *
	 * @private
	 * @param {Function} setter The function to set accumulator values.
	 * @param {Function} [initializer] The accumulator object initializer.
	 * @returns {Function} Returns the new aggregator function.
	 */
	function createAggregator(setter, initializer) {
	  return function(collection, iteratee) {
	    var func = isArray_1(collection) ? _arrayAggregator : _baseAggregator,
	        accumulator = initializer ? initializer() : {};

	    return func(collection, setter, _baseIteratee(iteratee), accumulator);
	  };
	}

	var _createAggregator = createAggregator;

	/** Used for built-in method references. */
	var objectProto$c = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$9 = objectProto$c.hasOwnProperty;

	/**
	 * Creates an object composed of keys generated from the results of running
	 * each element of `collection` thru `iteratee`. The order of grouped values
	 * is determined by the order they occur in `collection`. The corresponding
	 * value of each key is an array of elements responsible for generating the
	 * key. The iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
	 * @returns {Object} Returns the composed aggregate object.
	 * @example
	 *
	 * _.groupBy([6.1, 4.2, 6.3], Math.floor);
	 * // => { '4': [4.2], '6': [6.1, 6.3] }
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.groupBy(['one', 'two', 'three'], 'length');
	 * // => { '3': ['one', 'two'], '5': ['three'] }
	 */
	var groupBy = _createAggregator(function(result, value, key) {
	  if (hasOwnProperty$9.call(result, key)) {
	    result[key].push(value);
	  } else {
	    _baseAssignValue(result, key, [value]);
	  }
	});

	var groupBy_1 = groupBy;

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

	function contains(array, obj) {
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
	    return contains(value, token.value);
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

	function random(a) {
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

	function max(array) {
	  if (arguments.length === 1 && Array.isArray(array)) {
	    return Math.max.apply(Math, array);
	  } else {
	    return Math.max.apply(Math, arguments);
	  }
	}

	function min(array) {
	  if (arguments.length === 1 && Array.isArray(array)) {
	    return Math.min.apply(Math, array);
	  } else {
	    return Math.min.apply(Math, arguments);
	  }
	}

	function arrayMap$1(f, a) {
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

	function arrayFilter$1(f, a) {
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
	        MAP: arrayMap$1,
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
	        FILTER: arrayFilter$1,
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

	function getComputedColumns(chart) {
	    let virtualColumns = chart.get('metadata.describe.computed-columns', []);
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
	    return virtualColumns;
	}

	/* home/david/Projects/core/libs/controls/v2/Help.html generated by Svelte v2.16.1 */

	function data() {
	    return {
	        visible: false
	    };
	}
	var methods = {
	    show() {
	        const t = setTimeout(() => {
	            this.set({ visible: true });
	        }, 400);
	        this.set({ t });
	    },
	    hide() {
	        const { t } = this.get();
	        clearTimeout(t);
	        this.set({ visible: false });
	    }
	};

	const file = "home/david/Projects/core/libs/controls/v2/Help.html";

	function create_main_fragment(component, ctx) {
		var div, span, text_1;

		var if_block = (ctx.visible) && create_if_block(component);

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
				span.textContent = "?";
				text_1 = createText("\n    ");
				if (if_block) if_block.c();
				span.className = "help-icon svelte-9o0fpa";
				addLoc(span, file, 1, 4, 69);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = "help svelte-9o0fpa";
				addLoc(div, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				append(div, text_1);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.visible) {
					if (!if_block) {
						if_block = create_if_block(component);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block) if_block.d();
				removeListener(div, "mouseenter", mouseenter_handler);
				removeListener(div, "mouseleave", mouseleave_handler);
			}
		};
	}

	// (3:4) {#if visible}
	function create_if_block(component, ctx) {
		var div, i, text, slot_content_default = component._slotted.default, slot_content_default_before;

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text = createText("\n        ");
				i.className = "hat-icon im im-graduation-hat svelte-9o0fpa";
				addLoc(i, file, 4, 8, 154);
				div.className = "content svelte-9o0fpa";
				addLoc(div, file, 3, 4, 124);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text);

				if (slot_content_default) {
					append(div, slot_content_default_before || (slot_content_default_before = createComment()));
					append(div, slot_content_default);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}
			}
		};
	}

	function Help(options) {
		this._debugName = '<Help>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('visible' in this._state)) console.warn("<Help> was created without expected data property 'visible'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Help.prototype, protoDev);
	assign(Help.prototype, methods);

	Help.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

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
	const get$2 = (httpReq.get = httpReqVerb('GET'));

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

	/* describe/ComputedColumnEditor.html generated by Svelte v2.16.1 */



	let updateTable = () => {};
	/* globals dw */

	function formatRows(rows) {
	    let curSpanStart = 0;
	    const parts = [];
	    for (let i = 1; i < rows.length; i++) {
	        if (rows[i] - rows[curSpanStart] > i - curSpanStart) {
	            // we skipped a row, finish current span
	            parts.push(
	                i > curSpanStart + 1
	                    ? `${rows[curSpanStart]}-${rows[i - 1]}`
	                    : rows[curSpanStart]
	            );
	            curSpanStart = i;
	        }
	    }
	    parts.push(
	        rows.length > curSpanStart + 1
	            ? `${rows[curSpanStart]}-${rows[rows.length - 1]}`
	            : rows[curSpanStart]
	    );
	    return parts.join(', ');
	}

	function title({ column, name }) {
	    var s = __('describe / edit-column');
	    return s.replace('%s', `"${name}"`);
	}
	function metaColumns({ columns, column, computedColumns }) {
	    if (!columns) return [];
	    const res = columns.map(col => {
	        return {
	            key: columnNameToVariable(col.name()),
	            title: col.title(),
	            type: col.type()
	        };
	    });
	    // allow using computed columns in computed columns
	    const keys = computedColumns.map(d => d.name);
	    const thisI = keys.indexOf(column.name());
	    keys.forEach((ccKey, i) => {
	        if (thisI !== i) {
	            res.push({
	                key: columnNameToVariable(ccKey),
	                title: ccKey,
	                type: 'computed'
	            });
	        }
	    });
	    return res;
	}
	function keywords({ metaColumns }) {
	    const keywords = [];
	    metaColumns.forEach(function (col) {
	        if (col.type === 'number' || col.type === 'computed') {
	            keywords.push(col.key + '__sum');
	            keywords.push(col.key + '__min');
	            keywords.push(col.key + '__max');
	            keywords.push(col.key + '__mean');
	            keywords.push(col.key + '__median');
	        } else if (col.type === 'date') {
	            keywords.push(col.key + '__min');
	            keywords.push(col.key + '__max');
	        }
	        keywords.push(col.key);
	    });
	    return keywords.sort((a, b) => b.length - a.length);
	}
	function context({ metaColumns }) {
	    const res = { ROWNUMBER: 1 };
	    const keywords = ['sum', 'round', 'min', 'max', 'median', 'mean'];
	    metaColumns.forEach(function (col) {
	        res[col.key] =
	            col.type === 'number' ? 42 : col.type === 'text' ? 'answer' : new Date();
	        if (col.type === 'number' || col.type === 'computed') {
	            keywords.forEach(kw => {
	                res[`${col.key}__${kw}`] = 42;
	            });
	        }
	    });
	    return res;
	}
	function looksLikeColumnData({ formula, error }) {
	    const lines = formula.split('\n');
	    if (lines.length > 4 && !formula.includes('(')) {
	        if (error) {
	            return true;
	        }
	    }
	    return false;
	}
	function computedColumns({ $dw_chart }) {
	    return getComputedColumns($dw_chart);
	}
	function error({ formula, context }) {
	    try {
	        if (formula.trim() !== '') {
	            Parser.evaluate(formula, context);
	        }
	        return null;
	    } catch (e) {
	        return e.message;
	    }
	}
	function errDisplay({ error, parserErrors }) {
	    if (parserErrors.length) {
	        return Object.entries(groupBy_1(parserErrors, d => d.message))
	            .map(([message, err]) => {
	                return (
	                    message +
	                    (err[0].row !== 'all'
	                        ? ` (rows ${formatRows(err.map(d => d.row + 2))})`
	                        : '')
	                );
	            })
	            .join('<br />');
	    }
	    return error || false;
	}
	function errNiceDisplay({ errDisplay }) {
	    if (!errDisplay) return errDisplay;
	    return errDisplay
	        .replace('unexpected TOP', __('cc / formula / error / unexpected top'))
	        .replace(': Expected EOF', '')
	        .replace('unexpected TPAREN', __('cc / formula / error / unexpected tparen'))
	        .replace('unexpected TBRACKET', __('cc / formula / error / unexpected tparen'))
	        .replace('unexpected TEOF: EOF', __('cc / formula / error / unexpected teof'))
	        .replace('unexpected TCOMMA', __('cc / formula / error / unexpected tcomma'))
	        .replace(
	            'unexpected TSEMICOLON',
	            __('cc / formula / error / unexpected tsemicolon')
	        )
	        .replace('undefined variable', __('cc / formula / error / undefined variable'))
	        .replace('parse error', __('cc / formula / error / parser error'))
	        .replace('Unknown character', __('cc / formula / error / unknown-character'))
	        .replace('unexpected', __('cc / formula / error / unexpected'))
	        .replace(
	            'member access is not permitted',
	            __('cc / formula / error / member-access')
	        );
	}
	function formulaHint({ errDisplay, formula }) {
	    if (formula.trim().charAt(0) === '=') {
	        return __('cc / formula / hint / equal-sign');
	    }
	    if (!errDisplay || typeof errDisplay !== 'string') return '';
	    const errors = errDisplay.split('<br />');
	    for (let i = 0; i < errors.length; i++) {
	        if (errors[i].startsWith('undefined variable:')) {
	            // let's see if we know this variable
	            const name = errors[i].split(': ')[1].split('(row')[0].trim();
	            if (
	                Parser.keywords.includes(name.toUpperCase()) &&
	                !Parser.keywords.includes(name)
	            ) {
	                return `${__(
                    'cc / formula / hint / use'
                )} <tt>${name.toUpperCase()}</tt> ${__(
                    'cc / formula / hint / instead-of'
                )} <tt>${name}</tt>`;
	            }
	            if (name === 'row') {
	                return `${__('cc / formula / hint / use')} <tt>ROWNUMBER</tt> ${__(
                    'cc / formula / hint / instead-of'
                )} <tt>row</tt>`;
	            }
	        }
	    }
	    // check for Math.X
	    const m = (formula || '').match(/Math\.([a-zA-Z0-9]+)/);
	    if (m && Parser.keywords.includes(m[1].toUpperCase())) {
	        return `${__('cc / formula / hint / use')} <tt>${m[1].toUpperCase()}</tt> ${__(
            'cc / formula / hint / instead-of'
        )} <tt>${m[0]}</tt>`;
	    }
	    // check for some other functions string
	    const hints = [
	        { s: 'substr', h: 'SUBSTR(x, start, length)' },
	        { s: 'substring', h: 'SUBSTR(x, start, length)' },
	        { s: 'replace', h: 'REPLACE(x, old, new)' },
	        { s: 'indexOf', h: 'INDEXOF(x, search)' },
	        { s: 'toFixed', h: 'ROUND(x, decimals)' },
	        { s: 'length', h: 'LENGTH(x)' },
	        { s: 'trim', h: 'TRIM(x)' },
	        { s: 'split', h: 'SPLIT(x, sep)' },
	        { s: 'join', h: 'JOIN(x, sep)' },
	        { s: 'getFullYear', h: 'YEAR(x)' },
	        { s: 'getMonth', h: 'MONTH(x)' },
	        { s: 'getDate', h: 'DAY(x)' },
	        { s: 'includes', h: 'y in x' }
	    ];
	    for (let i = 0; i < hints.length; i++) {
	        const { s, h } = hints[i];
	        const reg = new RegExp('([a-z0-9_]+)\\.' + s + '\\(');
	        const m = formula.match(reg);
	        if (m) {
	            return `${__('cc / formula / hint / use')} <tt>${h.replace(
                '%x',
                m[1]
            )}</tt> ${__('cc / formula / hint / instead-of')}<tt>x.${s}()</tt>`;
	        }
	    }
	    if (errDisplay.includes('"&"') && formula.includes('&&')) {
	        return `${__('cc / formula / hint / use')} <tt>x and y</tt> ${__(
            'cc / formula / hint / instead-of'
        )} <tt>x && y</tt>`;
	    }
	    if (errDisplay.includes('is not a function') && formula.includes('||')) {
	        return `${__('cc / formula / hint / use')} <tt>x or y</tt> ${__(
            'cc / formula / hint / instead-of'
        )} <tt>x || y</tt>`;
	    }
	    return '';
	}
	function data$1() {
	    return {
	        name: '',
	        formula: '',
	        parserErrors: [],
	        checking: false,
	        didYouKnow: true
	    };
	}
	var methods$1 = {
	    insert(column) {
	        const { cm } = this.get();
	        cm.replaceSelection(column.key);
	        cm.focus();
	    },
	    unmarkErrors() {
	        window.document
	            .querySelectorAll('span.parser-error')
	            .forEach(node => node.classList.remove('parser-error'));
	    },
	    removeColumn() {
	        const { column } = this.get();
	        const { dw_chart } = this.store.get();
	        const ds = dw_chart.dataset();
	        const customCols = clone(getComputedColumns(dw_chart)).filter(
	            col => col.name !== column.name()
	        );
	        // get old column index
	        const colIndex = ds.columnOrder()[ds.indexOf(column.name())];
	        // delete all changes that have been made to this column
	        const changes = dw_chart.get('metadata.data.changes', []);
	        const newChanges = [];
	        changes.forEach(c => {
	            if (c.column === colIndex) return; // skip
	            // move changes for succeeding columns
	            if (c.column > colIndex) c.column--;
	            newChanges.push(c);
	        });
	        dw_chart.set('metadata.describe.computed-columns', customCols);
	        dw_chart.set('metadata.data.changes', newChanges);
	        dw_chart.saveSoon();
	        this.fire('updateTable');
	        this.fire('unselect');
	    },
	    copyFormulaToData() {
	        const { formula, name } = this.get();
	        const col = dw.column('', formula.split('\n'));
	        // remove existing data changes for this column
	        const newFormula = `[${col
            .values()
            .map((d, i) =>
                (d instanceof Date && !isNaN(d)) || typeof d === 'string'
                    ? JSON.stringify(col.raw(i))
                    : d
            )
            .join(',\n')}][ROWNUMBER]`;
	        // apply new changes
	        this.set({ formula: newFormula, parserErrors: [] });
	        this.setFormula(newFormula, name);
	    },
	    setFormula(formula, name) {
	        if (formula === undefined) return;
	        const { dw_chart } = this.store.get();
	        // try out formula first
	        const { cm } = this.get();
	        this.set({ formula });
	        const parserErrors = [];
	        // update codemirror
	        if (formula !== cm.getValue()) {
	            cm.setValue(formula);
	        }
	        // remove custom error marks
	        setTimeout(() => this.unmarkErrors());
	        // update dw.chart
	        const customCols = clone(getComputedColumns(dw_chart));
	        const thisCol = customCols.find(d => d.name === name);
	        if (!thisCol) {
	            // try again later
	            return setTimeout(() => {
	                this.setFormula(formula, name);
	            }, 100);
	        }
	        if (thisCol.formula !== formula) {
	            thisCol.formula = formula;
	            dw_chart.set('metadata.describe.computed-columns', customCols);
	            // check for errors later
	            this.set({ checking: true });
	            if (dw_chart.saveSoon) dw_chart.saveSoon();
	            this.store.set({
	                dw_chart
	            });
	            updateTable();
	        } else {
	            (dw_chart.dataset().column(name).errors || []).forEach(err => {
	                parserErrors.push(err);
	            });
	        }

	        this.set({ parserErrors });
	    },
	    async closeDidYouKnow() {
	        await patch('/v3/me/data', {
	            payload: {
	                'new-computed-columns-syntax': 1
	            }
	        });
	        window.dw.backend.__userData['new-computed-columns-syntax'] = 1;
	        this.set({ didYouKnow: false });
	    }
	};

	function oncreate() {
	    const app = this;
	    const { column, computedColumns } = this.get();

	    const { dw_chart } = this.store.get();

	    const thisCol = computedColumns.find(d => d.name === column.name());

	    if (window.dw.backend.__userData['new-computed-columns-syntax']) {
	        this.set({
	            didYouKnow: !JSON.parse(
	                window.dw.backend.__userData['new-computed-columns-syntax'] || 'false'
	            )
	        });
	    }

	    this.set({
	        formula: thisCol.formula || '',
	        name: column.name()
	    });

	    const errReg = /(?:parse error) \[(\d+):(\d+)\]:/;

	    this.on('hotRendered', () => {
	        const { checking, name, formula } = this.get();
	        if (!checking) return;

	        const parserErrors = [];
	        const col = dw_chart.dataset().column(name);
	        if (col.formula === formula) {
	            (col.errors || []).forEach(err => {
	                parserErrors.push(err);
	            });
	        }
	        this.unmarkErrors();
	        this.set({ parserErrors, checking: false });
	    });

	    function scriptHint(editor) {
	        // Find the token at the cursor
	        const cur = editor.getCursor();
	        const token = editor.getTokenAt(cur);
	        let match = [];

	        const { keywords } = app.get();
	        if (token.type === 'variable-x') {
	            match = keywords.filter(function (chk) {
	                return chk.toLowerCase().indexOf(token.string.toLowerCase()) === 0;
	            });
	        } else if (token.type === 'keyword-x') {
	            match = Parser.keywords.filter(function (chk) {
	                return chk.toLowerCase().indexOf(token.string.toLowerCase()) === 0;
	            });
	        }

	        return {
	            list: match.sort(),
	            from: CodeMirror.Pos(cur.line, token.start),
	            to: CodeMirror.Pos(cur.line, token.end)
	        };
	    }

	    // CodeMirror.registerHelper("hint", "javascript", function(editor, options) {
	    //     return scriptHint(editor, options);
	    // });

	    const cm = CodeMirror.fromTextArea(this.refs.code, {
	        value: this.get().formula || '',
	        mode: 'simple',
	        indentUnit: 2,
	        tabSize: 2,
	        lineWrapping: true,
	        matchBrackets: true,
	        placeholder: '',
	        continueComments: 'Enter',
	        extraKeys: {
	            Tab: 'autocomplete'
	        },
	        hintOptions: {
	            hint: scriptHint
	        }
	    });

	    window.CodeMirror = CodeMirror;

	    this.set({ cm });

	    updateTable = debounce_1(() => app.fire('updateTable'), 1500);

	    let changeNameTimer;
	    const changeName = name => {
	        clearTimeout(changeNameTimer);
	        changeNameTimer = setTimeout(() => {
	            const { column } = this.get();
	            let { computedColumns } = this.get();
	            computedColumns = clone(computedColumns);
	            computedColumns.find(d => d.name === column.name()).name = name;
	            column.name(name);
	            dw_chart.set('metadata.describe.computed-columns', computedColumns);
	            this.store.set({ dw_chart });
	            if (dw_chart.saveSoon) dw_chart.saveSoon();
	            updateTable();
	        }, 1500);
	    };

	    const { name, formula, keywords } = this.get();

	    cmInit(keywords);
	    this.setFormula(formula, name);

	    this.on('state', ({ changed, current, previous }) => {
	        // update if column changes
	        if (changed.column) {
	            const col = current.column;

	            if (col && current.computedColumns) {
	                const theCol = current.computedColumns.find(d => d.name === col.name());
	                const formula = theCol ? theCol.formula : '';
	                const name = col.name();
	                this.set({ formula, name });
	                this.setFormula(formula, name);
	                cm.setValue(formula);
	            }
	        }

	        if (changed.name && previous.name) {
	            changeName(current.name);
	        }

	        if (changed.metaColumns) {
	            cmInit(current.keywords);
	        }

	        if (changed.errDisplay) {
	            // check for new error
	            if (current.errDisplay && errReg.test(current.errDisplay)) {
	                const m = current.errDisplay.match(errReg);
	                const line = Number(m[1]) - 1;
	                const ch = Number(m[2]) - 1;
	                cm.markText(
	                    { line, ch },
	                    { line, ch: ch + 1 },
	                    {
	                        className: 'parser-error'
	                    }
	                );
	            }
	        }
	    });

	    function cmInit(keywords) {
	        const columnsRegex = new RegExp(`(?:${keywords.join('|')})`);
	        const functionRegex = new RegExp(`(?:${Parser.keywords.join('|')})`);
	        CodeMirror.defineSimpleMode('simplemode', {
	            // The start state contains the rules that are intially used
	            start: [
	                // The regex matches the token, the token property contains the type
	                { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: 'string' },
	                { regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: 'string' },
	                // You can match multiple tokens at once. Note that the captured
	                // groups must span the whole string in this case
	                // {
	                //     regex: /(function)(\s+)([a-z$][\w$]*)/,
	                //     token: ['keyword', null, 'keyword']
	                // },
	                // Rules are matched in the order in which they appear, so there is
	                // no ambiguity between this one and the one above
	                { regex: functionRegex, token: 'keyword' },
	                { regex: /true|false|PI|E/, token: 'atom' },
	                {
	                    regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
	                    token: 'number'
	                },
	                // { regex: /\/\/.*/, token: 'comment' },
	                { regex: columnsRegex, token: 'variable-2' },
	                { regex: /\/(?:[^\\]|\\.)*?\//, token: 'variable-3' },
	                // A next property will cause the mode to move to a different state
	                // { regex: /\/\*/, token: 'comment', next: 'comment' },
	                { regex: /[-+/*=<>!^%]+/, token: 'operator' },
	                // indent and dedent properties guide autoindentation
	                { regex: /[[(]/, indent: true },
	                { regex: /[\])]/, dedent: true },
	                { regex: /[a-z$][\w$]*/, token: 'variable-x' },
	                { regex: /[A-Z_][\w$]*/, token: 'keyword-x' }
	            ],
	            // The meta property contains global information about the mode. It
	            // can contain properties like lineComment, which are supported by
	            // all modes, and also directives like dontIndentStates, which are
	            // specific to simple modes.
	            meta: {}
	        });

	        cm.setOption('mode', 'simplemode');
	    }

	    cm.on('change', cm => {
	        const { name } = app.get();
	        // update internal state
	        // app.set({ formula: cm.getValue() });
	        // update chart + table
	        this.setFormula(cm.getValue(), name);
	    });
	}
	const file$1 = "describe/ComputedColumnEditor.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.insert(ctx.col);
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.col = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var div, text0, h3, text1, text2, p0, text3_value = __('computed columns / modal / intro'), text3, text4, label0, text5_value = __('computed columns / modal / name'), text5, text6, input, input_updating = false, text7, label1, text8_value = __('computed columns / modal / formula'), text8, text9, if_block1_anchor, span, raw_value = __('cc / formula / help'), text10, textarea, text11, text12, text13, text14, p1, text15_value = __('computed columns / modal / available columns'), text15, text16, text17, ul, text18, button, i, text19, text20_value = __('computed columns / modal / remove'), text20;

		var if_block0 = (ctx.didYouKnow) && create_if_block_4(component);

		function input_input_handler() {
			input_updating = true;
			component.set({ name: input.value });
			input_updating = false;
		}

		var if_block1 = (ctx.checking && !ctx.error) && create_if_block_3();

		var help = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		var if_block2 = (ctx.errDisplay) && create_if_block_2(component, ctx);

		var if_block3 = (ctx.formulaHint) && create_if_block_1(component, ctx);

		var if_block4 = (ctx.looksLikeColumnData) && create_if_block$1(component);

		var each_value = ctx.metaColumns;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block(component, get_each_context(ctx, each_value, i_1));
		}

		function click_handler_1(event) {
			component.removeColumn();
		}

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n\n    ");
				h3 = createElement("h3");
				text1 = createText(ctx.title);
				text2 = createText("\n    ");
				p0 = createElement("p");
				text3 = createText(text3_value);
				text4 = createText("\n\n    ");
				label0 = createElement("label");
				text5 = createText(text5_value);
				text6 = createText("\n    ");
				input = createElement("input");
				text7 = createText("\n\n    ");
				label1 = createElement("label");
				text8 = createText(text8_value);
				text9 = createText(" ");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
				span = createElement("span");
				help._fragment.c();
				text10 = createText("\n    ");
				textarea = createElement("textarea");
				text11 = createText("\n\n    ");
				if (if_block2) if_block2.c();
				text12 = createText(" ");
				if (if_block3) if_block3.c();
				text13 = createText(" ");
				if (if_block4) if_block4.c();
				text14 = createText("\n\n    ");
				p1 = createElement("p");
				text15 = createText(text15_value);
				text16 = createText(":");
				text17 = createText("\n\n    ");
				ul = createElement("ul");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}

				text18 = createText("\n\n");
				button = createElement("button");
				i = createElement("i");
				text19 = createText(" ");
				text20 = createText(text20_value);
				h3.className = "first";
				addLoc(h3, file$1, 22, 4, 768);
				addLoc(p0, file$1, 23, 4, 803);
				label0.className = "svelte-1cx0ai0";
				addLoc(label0, file$1, 25, 4, 856);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				addLoc(input, file$1, 26, 4, 915);
				addLoc(span, file$1, 33, 20, 1150);
				label1.className = "svelte-1cx0ai0";
				addLoc(label1, file$1, 28, 4, 960);
				textarea.className = "code svelte-1cx0ai0";
				toggleClass(textarea, "error", ctx.errDisplay);
				addLoc(textarea, file$1, 35, 4, 1221);
				setStyle(p1, "margin-top", "1em");
				addLoc(p1, file$1, 57, 4, 1960);
				ul.className = "col-select svelte-1cx0ai0";
				addLoc(ul, file$1, 59, 4, 2051);
				setStyle(div, "margin-bottom", "15px");
				addLoc(div, file$1, 0, 0, 0);
				i.className = "fa fa-trash";
				addLoc(i, file$1, 67, 4, 2256);
				addListener(button, "click", click_handler_1);
				button.className = "btn btn-danger";
				addLoc(button, file$1, 66, 0, 2194);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				append(div, h3);
				append(h3, text1);
				append(div, text2);
				append(div, p0);
				append(p0, text3);
				append(div, text4);
				append(div, label0);
				append(label0, text5);
				append(div, text6);
				append(div, input);

				input.value = ctx.name;

				append(div, text7);
				append(div, label1);
				append(label1, text8);
				append(label1, text9);
				if (if_block1) if_block1.m(label1, null);
				append(label1, if_block1_anchor);
				append(help._slotted.default, span);
				span.innerHTML = raw_value;
				help._mount(label1, null);
				append(div, text10);
				append(div, textarea);
				component.refs.code = textarea;
				append(div, text11);
				if (if_block2) if_block2.m(div, null);
				append(div, text12);
				if (if_block3) if_block3.m(div, null);
				append(div, text13);
				if (if_block4) if_block4.m(div, null);
				append(div, text14);
				append(div, p1);
				append(p1, text15);
				append(p1, text16);
				append(div, text17);
				append(div, ul);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(ul, null);
				}

				insert(target, text18, anchor);
				insert(target, button, anchor);
				append(button, i);
				append(button, text19);
				append(button, text20);
			},

			p: function update(changed, ctx) {
				if (ctx.didYouKnow) {
					if (!if_block0) {
						if_block0 = create_if_block_4(component);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.title) {
					setData(text1, ctx.title);
				}

				if (!input_updating && changed.name) input.value = ctx.name;

				if (ctx.checking && !ctx.error) {
					if (!if_block1) {
						if_block1 = create_if_block_3();
						if_block1.c();
						if_block1.m(label1, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.errDisplay) {
					toggleClass(textarea, "error", ctx.errDisplay);
				}

				if (ctx.errDisplay) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_2(component, ctx);
						if_block2.c();
						if_block2.m(div, text12);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (ctx.formulaHint) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block_1(component, ctx);
						if_block3.c();
						if_block3.m(div, text13);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (ctx.looksLikeColumnData) {
					if (!if_block4) {
						if_block4 = create_if_block$1(component);
						if_block4.c();
						if_block4.m(div, text14);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if (changed.metaColumns) {
					each_value = ctx.metaColumns;

					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						const child_ctx = get_each_context(ctx, each_value, i_1);

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, child_ctx);
						} else {
							each_blocks[i_1] = create_each_block(component, child_ctx);
							each_blocks[i_1].c();
							each_blocks[i_1].m(ul, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				removeListener(input, "input", input_input_handler);
				if (if_block1) if_block1.d();
				help.destroy();
				if (component.refs.code === textarea) component.refs.code = null;
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();

				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(text18);
					detachNode(button);
				}

				removeListener(button, "click", click_handler_1);
			}
		};
	}

	// (2:4) {#if didYouKnow}
	function create_if_block_4(component, ctx) {
		var div1, div0, i0, text0, h3, text1_value = __('cc / formula / did-you-know / title'), text1, text2, p0, text3_value = __('cc / formula / did-you-know / text'), text3, text4, p1, text5_value = __('cc / formula / did-you-know / link'), text5, text6, i1, text7, a, text8_value = __('cc / formula / did-you-know / link2'), text8;

		function click_handler(event) {
			component.closeDidYouKnow();
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				i0 = createElement("i");
				text0 = createText("\n        ");
				h3 = createElement("h3");
				text1 = createText(text1_value);
				text2 = createText("\n\n        ");
				p0 = createElement("p");
				text3 = createText(text3_value);
				text4 = createText("\n\n        ");
				p1 = createElement("p");
				text5 = createText(text5_value);
				text6 = createText(" ");
				i1 = createElement("i");
				text7 = createText("\n            ");
				a = createElement("a");
				text8 = createText(text8_value);
				i0.className = "im im-check-mark-circle";
				addLoc(i0, file$1, 4, 12, 202);
				addListener(div0, "click", click_handler);
				div0.className = "close";
				addLoc(div0, file$1, 3, 8, 141);
				addLoc(h3, file$1, 6, 8, 265);
				addLoc(p0, file$1, 8, 8, 327);
				i1.className = "im im-graduation-hat svelte-1cx0ai0";
				addLoc(i1, file$1, 11, 55, 445);
				a.href = "https://academy.datawrapper.de/article/249-calculations-in-added-columns-and-tooltips";
				a.target = "_blank";
				addLoc(a, file$1, 12, 12, 494);
				addLoc(p1, file$1, 10, 8, 386);
				div1.className = "did-you-know svelte-1cx0ai0";
				setStyle(div1, "margin-top", "10px");
				setStyle(div1, "margin-bottom", "1em");
				addLoc(div1, file$1, 2, 4, 60);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, i0);
				append(div1, text0);
				append(div1, h3);
				append(h3, text1);
				append(div1, text2);
				append(div1, p0);
				append(p0, text3);
				append(div1, text4);
				append(div1, p1);
				append(p1, text5);
				append(p1, text6);
				append(p1, i1);
				append(p1, text7);
				append(p1, a);
				append(a, text8);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(div0, "click", click_handler);
			}
		};
	}

	// (30:52) {#if checking && !error}
	function create_if_block_3(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				setStyle(i, "color", "#ccc");
				i.className = "fa fa-cog fa-spin";
				addLoc(i, file$1, 29, 76, 1043);
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

	// (38:4) {#if errDisplay}
	function create_if_block_2(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help errors svelte-1cx0ai0";
				addLoc(p, file$1, 38, 4, 1316);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.errNiceDisplay;
			},

			p: function update(changed, ctx) {
				if (changed.errNiceDisplay) {
					p.innerHTML = ctx.errNiceDisplay;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (42:10) {#if formulaHint}
	function create_if_block_1(component, ctx) {
		var p, i, text, raw_before;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText(" ");
				raw_before = createElement('noscript');
				i.className = "hat-icon im im-graduation-hat svelte-1cx0ai0";
				addLoc(i, file$1, 43, 8, 1460);
				p.className = "mini-help formula-hint svelte-1cx0ai0";
				addLoc(p, file$1, 42, 4, 1417);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text);
				append(p, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.formulaHint);
			},

			p: function update(changed, ctx) {
				if (changed.formulaHint) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.formulaHint);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (46:10) {#if looksLikeColumnData}
	function create_if_block$1(component, ctx) {
		var div, i, text0, text1_value = __('cc / formula / hint / insert-data'), text1, text2, a, text3_value = __('cc / formula / hint / insert-data / action'), text3;

		function click_handler(event) {
			event.preventDefault();
			component.copyFormulaToData();
		}

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				text2 = createText("\n        ");
				a = createElement("a");
				text3 = createText(text3_value);
				i.className = "hat-icon im im-graduation-hat svelte-1cx0ai0";
				addLoc(i, file$1, 47, 8, 1620);
				addListener(a, "click", click_handler);
				setStyle(a, "color", "white");
				setStyle(a, "font-weight", "bold");
				a.href = "/#apply";
				addLoc(a, file$1, 48, 8, 1716);
				div.className = "mini-help formula-hint svelte-1cx0ai0";
				addLoc(div, file$1, 46, 4, 1575);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text0);
				append(div, text1);
				append(div, text2);
				append(div, a);
				append(a, text3);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	// (61:8) {#each metaColumns as col}
	function create_each_block(component, ctx) {
		var li, text_value = ctx.col.key, text;

		return {
			c: function create() {
				li = createElement("li");
				text = createText(text_value);
				li._svelte = { component, ctx };

				addListener(li, "click", click_handler);
				li.className = "svelte-1cx0ai0";
				addLoc(li, file$1, 61, 8, 2118);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.metaColumns) && text_value !== (text_value = ctx.col.key)) {
					setData(text, text_value);
				}

				li._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(li, "click", click_handler);
			}
		};
	}

	function ComputedColumnEditor(options) {
		this._debugName = '<ComputedColumnEditor>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ComputedColumnEditor> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["dw_chart"]), data$1()), options.data);
		this.store._add(this, ["dw_chart"]);

		this._recompute({ column: 1, name: 1, $dw_chart: 1, columns: 1, computedColumns: 1, metaColumns: 1, formula: 1, context: 1, error: 1, parserErrors: 1, errDisplay: 1 }, this._state);
		if (!('column' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'column'");
		if (!('name' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'name'");
		if (!('columns' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'columns'");


		if (!('formula' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'formula'");

		if (!('$dw_chart' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property '$dw_chart'");

		if (!('parserErrors' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'parserErrors'");

		if (!('didYouKnow' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'didYouKnow'");

		if (!('checking' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'checking'");
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$1(this, this._state);

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

	assign(ComputedColumnEditor.prototype, protoDev);
	assign(ComputedColumnEditor.prototype, methods$1);

	ComputedColumnEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'title'");
		if ('computedColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'computedColumns'");
		if ('metaColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'metaColumns'");
		if ('keywords' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'keywords'");
		if ('context' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'context'");
		if ('error' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'error'");
		if ('looksLikeColumnData' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'looksLikeColumnData'");
		if ('errDisplay' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'errDisplay'");
		if ('errNiceDisplay' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'errNiceDisplay'");
		if ('formulaHint' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'formulaHint'");
	};

	ComputedColumnEditor.prototype._recompute = function _recompute(changed, state) {
		if (changed.column || changed.name) {
			if (this._differs(state.title, (state.title = title(state)))) changed.title = true;
		}

		if (changed.$dw_chart) {
			if (this._differs(state.computedColumns, (state.computedColumns = computedColumns(state)))) changed.computedColumns = true;
		}

		if (changed.columns || changed.column || changed.computedColumns) {
			if (this._differs(state.metaColumns, (state.metaColumns = metaColumns(state)))) changed.metaColumns = true;
		}

		if (changed.metaColumns) {
			if (this._differs(state.keywords, (state.keywords = keywords(state)))) changed.keywords = true;
			if (this._differs(state.context, (state.context = context(state)))) changed.context = true;
		}

		if (changed.formula || changed.context) {
			if (this._differs(state.error, (state.error = error(state)))) changed.error = true;
		}

		if (changed.formula || changed.error) {
			if (this._differs(state.looksLikeColumnData, (state.looksLikeColumnData = looksLikeColumnData(state)))) changed.looksLikeColumnData = true;
		}

		if (changed.error || changed.parserErrors) {
			if (this._differs(state.errDisplay, (state.errDisplay = errDisplay(state)))) changed.errDisplay = true;
		}

		if (changed.errDisplay) {
			if (this._differs(state.errNiceDisplay, (state.errNiceDisplay = errNiceDisplay(state)))) changed.errNiceDisplay = true;
		}

		if (changed.errDisplay || changed.formula) {
			if (this._differs(state.formulaHint, (state.formulaHint = formulaHint(state)))) changed.formulaHint = true;
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
		var delay = ref.delay; if ( delay === void 0 ) delay = 0;
		var duration = ref.duration; if ( duration === void 0 ) duration = 400;
		var easing = ref.easing; if ( easing === void 0 ) easing = cubicOut;

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

	/* home/david/Projects/core/libs/controls/v2/Checkbox.html generated by Svelte v2.16.1 */



	function data$2() {
	    return {
	        value: false,
	        disabled: false,
	        faded: false,
	        indeterminate: false,
	        disabled_msg: '',
	        help: false
	    };
	}
	const file$2 = "home/david/Projects/core/libs/controls/v2/Checkbox.html";

	function create_main_fragment$2(component, ctx) {
		var text0, div, label, input, span, text1, text2, label_class_value, text3;

		var if_block0 = (ctx.help) && create_if_block_1$1(component, ctx);

		function input_change_handler() {
			component.set({ value: input.checked, indeterminate: input.indeterminate });
		}

		var if_block1 = (ctx.disabled && ctx.disabled_msg) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n");
				div = createElement("div");
				label = createElement("label");
				input = createElement("input");
				span = createElement("span");
				text1 = createText("\n        ");
				text2 = createText(ctx.label);
				text3 = createText("\n    ");
				if (if_block1) if_block1.c();
				addListener(input, "change", input_change_handler);
				if (!('value' in ctx && 'indeterminate' in ctx)) component.root._beforecreate.push(input_change_handler);
				setAttribute(input, "type", "checkbox");
				input.disabled = ctx.disabled;
				input.className = "svelte-j55ba2";
				addLoc(input, file$2, 7, 8, 215);
				span.className = "css-ui svelte-j55ba2";
				addLoc(span, file$2, 7, 95, 302);
				label.className = label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-j55ba2";
				addLoc(label, file$2, 6, 4, 134);
				div.className = "control-group vis-option-group vis-option-type-checkbox svelte-j55ba2";
				addLoc(div, file$2, 5, 0, 60);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, label);
				append(label, input);

				input.checked = ctx.value;
				input.indeterminate = ctx.indeterminate ;

				append(label, span);
				append(label, text1);
				append(label, text2);
				append(div, text3);
				if (if_block1) if_block1.i(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.help) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$1(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.value) input.checked = ctx.value;
				if (changed.indeterminate) input.indeterminate = ctx.indeterminate ;
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.label) {
					setData(text2, ctx.label);
				}

				if ((changed.disabled || changed.faded) && label_class_value !== (label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-j55ba2")) {
					label.className = label_class_value;
				}

				if (ctx.disabled && ctx.disabled_msg) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$2(component, ctx);
						if (if_block1) if_block1.c();
					}

					if_block1.i(div, null);
				} else if (if_block1) {
					groupOutros();
					if_block1.o(function() {
						if_block1.d(1);
						if_block1 = null;
					});
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div);
				}

				removeListener(input, "change", input_change_handler);
				if (if_block1) if_block1.d();
			}
		};
	}

	// (1:0) {#if help}
	function create_if_block_1$1(component, ctx) {
		var div;

		var help = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				div = createElement("div");
				help._fragment.c();
				addLoc(div, file$2, 2, 4, 22);
			},

			m: function mount(target, anchor) {
				append(help._slotted.default, div);
				div.innerHTML = ctx.help;
				help._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}
			},

			d: function destroy(detach) {
				help.destroy(detach);
			}
		};
	}

	// (11:4) {#if disabled && disabled_msg}
	function create_if_block$2(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-j55ba2";
				addLoc(div0, file$2, 12, 8, 432);
				addLoc(div1, file$2, 11, 4, 401);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				div0.innerHTML = ctx.disabled_msg;
				current = true;
			},

			p: function update(changed, ctx) {
				if (!current || changed.disabled_msg) {
					div0.innerHTML = ctx.disabled_msg;
				}
			},

			i: function intro(target, anchor) {
				if (current) return;
				if (component.root._intro) {
					if (div1_transition) div1_transition.invalidate();

					component.root._aftercreate.push(() => {
						if (!div1_transition) div1_transition = wrapTransition(component, div1, slide, {}, true);
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (!div1_transition) div1_transition = wrapTransition(component, div1, slide, {}, false);
				div1_transition.run(0, () => {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
					if (div1_transition) div1_transition.abort();
				}
			}
		};
	}

	function Checkbox(options) {
		this._debugName = '<Checkbox>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);
		if (!('help' in this._state)) console.warn("<Checkbox> was created without expected data property 'help'");
		if (!('disabled' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled'");
		if (!('faded' in this._state)) console.warn("<Checkbox> was created without expected data property 'faded'");
		if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
		if (!('indeterminate' in this._state)) console.warn("<Checkbox> was created without expected data property 'indeterminate'");
		if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");
		if (!('disabled_msg' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled_msg'");
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Checkbox.prototype, protoDev);

	Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/ControlGroup.html generated by Svelte v2.16.1 */

	function data$3() {
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

	const file$3 = "home/david/Projects/core/libs/controls/v2/ControlGroup.html";

	function create_main_fragment$3(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_1$2(component, ctx);

		var if_block1 = (ctx.help) && create_if_block$3(component, ctx);

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
				addLoc(div0, file$3, 8, 4, 318);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-p72242";
				addLoc(div1, file$3, 0, 0, 0);
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
						if_block0 = create_if_block_1$2(component, ctx);
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
						if_block1 = create_if_block$3(component, ctx);
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
	function create_if_block_1$2(component, ctx) {
		var label, raw_after, text;

		var if_block = (ctx.labelHelp) && create_if_block_2$1(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				text = createText(" ");
				if (if_block) if_block.c();
				setStyle(label, "width", (ctx.width||def.width));
				label.className = "control-label svelte-p72242";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$3, 2, 4, 104);
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
						if_block = create_if_block_2$1(component, ctx);
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
	function create_if_block_2$1(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help mt-1";
				addLoc(p, file$3, 4, 8, 229);
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
	function create_if_block$3(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.width||def.width));
				p.className = p_class_value = "mini-help " + ctx.type + " svelte-p72242";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file$3, 12, 4, 469);
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
		this._state = assign(data$3(), options.data);
		if (!('type' in this._state)) console.warn("<ControlGroup> was created without expected data property 'type'");
		if (!('valign' in this._state)) console.warn("<ControlGroup> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<ControlGroup> was created without expected data property 'label'");
		if (!('width' in this._state)) console.warn("<ControlGroup> was created without expected data property 'width'");
		if (!('labelHelp' in this._state)) console.warn("<ControlGroup> was created without expected data property 'labelHelp'");
		if (!('inline' in this._state)) console.warn("<ControlGroup> was created without expected data property 'inline'");
		if (!('help' in this._state)) console.warn("<ControlGroup> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/BaseSelect.html generated by Svelte v2.16.1 */

	function data$4() {
	    return {
	        disabled: false,
	        width: 'auto',
	        labelWidth: 'auto',
	        options: [],
	        optgroups: [],
	        value: null
	    };
	}
	const file$4 = "home/david/Projects/core/libs/controls/v2/BaseSelect.html";

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

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$4(component, ctx) {
		var select, if_block0_anchor, select_updating = false;

		var if_block0 = (ctx.options.length) && create_if_block_1$3(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$4(component, ctx);

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
				addLoc(select, file$4, 0, 0, 0);
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
						if_block0 = create_if_block_1$3(component, ctx);
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
						if_block1 = create_if_block$4(component, ctx);
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
	function create_if_block_1$3(component, ctx) {
		var each_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context$1(ctx, each_value, i));
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
						const child_ctx = get_each_context$1(ctx, each_value, i);

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
				addLoc(option, file$4, 2, 4, 179);
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
	function create_if_block$4(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.optgroups;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context_1(ctx, each_value_1, i));
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
							each_blocks[i] = create_each_block$1(component, child_ctx);
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
				addLoc(option, file$4, 6, 8, 420);
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
	function create_each_block$1(component, ctx) {
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
				addLoc(optgroup, file$4, 4, 4, 336);
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
		this._state = assign(data$4(), options.data);
		if (!('disabled' in this._state)) console.warn("<BaseSelect> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<BaseSelect> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<BaseSelect> was created without expected data property 'width'");
		if (!('options' in this._state)) console.warn("<BaseSelect> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<BaseSelect> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$4(this, this._state);

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

	/* home/david/Projects/core/libs/controls/v2/Select.html generated by Svelte v2.16.1 */



	function controlWidth({ inline, width }) {
		return inline ? width || 'auto' : width;
	}

	function labelWidth({ inline, labelWidth }) {
		return inline ? labelWidth || 'auto' : labelWidth;
	}

	function data$5() {
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
	function create_main_fragment$5(component, ctx) {
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
		this._state = assign(data$5(), options.data);

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

		this._fragment = create_main_fragment$5(this, this._state);

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

	/** Error message constants. */
	var FUNC_ERROR_TEXT$2 = 'Expected a function';

	/**
	 * Creates a throttled function that only invokes `func` at most once per
	 * every `wait` milliseconds. The throttled function comes with a `cancel`
	 * method to cancel delayed `func` invocations and a `flush` method to
	 * immediately invoke them. Provide `options` to indicate whether `func`
	 * should be invoked on the leading and/or trailing edge of the `wait`
	 * timeout. The `func` is invoked with the last arguments provided to the
	 * throttled function. Subsequent calls to the throttled function return the
	 * result of the last `func` invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the throttled function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	 * for details over the differences between `_.throttle` and `_.debounce`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to throttle.
	 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
	 * @param {Object} [options={}] The options object.
	 * @param {boolean} [options.leading=true]
	 *  Specify invoking on the leading edge of the timeout.
	 * @param {boolean} [options.trailing=true]
	 *  Specify invoking on the trailing edge of the timeout.
	 * @returns {Function} Returns the new throttled function.
	 * @example
	 *
	 * // Avoid excessively updating the position while scrolling.
	 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	 *
	 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
	 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
	 * jQuery(element).on('click', throttled);
	 *
	 * // Cancel the trailing throttled invocation.
	 * jQuery(window).on('popstate', throttled.cancel);
	 */
	function throttle(func, wait, options) {
	  var leading = true,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT$2);
	  }
	  if (isObject_1(options)) {
	    leading = 'leading' in options ? !!options.leading : leading;
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }
	  return debounce_1(func, wait, {
	    'leading': leading,
	    'maxWait': wait,
	    'trailing': trailing
	  });
	}

	var throttle_1 = throttle;

	/**
	 * Converts an array with properties back to a normal object.
	 *
	 * @exports arrayToObject
	 * @kind function
	 *
	 * @description
	 * This function fixes an uglyness when working with PHP backends.
	 * in PHP, there is no distiction between arrays and objects, so
	 * PHP converts an empty object {} to a empty array [].
	 * When this empty array then ends up in client-side JS functions which
	 * might start to assign values to the array using `arr.foo = "bar"`
	 * which results in a data structure like this:
	 *
	 * @example
	 * console.log(arr);
	 * []
	 *   foo: "bar"
	 *   length: 0
	 *   <prototype>: Array []
	 *
	 * console.log(arrayToObject(arr));
	 * Object { foo: "bar" }
	 *
	 * @param {array} o - the input
	 * @returns {object}
	 */
	function arrayToObject(o) {
	    if (Array.isArray(o)) {
	        const obj = {};
	        Object.keys(o).forEach(k => (obj[k] = o[k]));
	        return obj;
	    }
	    return o;
	}

	/* describe/CustomColumnFormat.html generated by Svelte v2.16.1 */



	function title$1({ column }) {
	    var s = __('describe / edit-column');
	    return s.replace('%s', `"${column ? column.title() || column.name() : '--'}"`);
	}
	function data$6() {
	    return {
	        columnFormat: {
	            type: 'auto',
	            ignore: false,
	            'number-divisor': 0,
	            'number-format': 'auto',
	            'number-prepend': '',
	            'number-append': ''
	        },
	        colTypes: [],
	        divisors_opts: [
	            { value: 0, label: __('describe / column-format / no-change') },
	            { value: 'auto', label: __('describe / column-format / automatic') }
	        ],
	        divisors: [
	            {
	                label: __('describe / column-format / divide-by'),
	                options: [
	                    { value: 3, label: '1000' },
	                    { value: 6, label: '1 million' },
	                    { value: 9, label: '1 billion' }
	                ]
	            },
	            {
	                label: __('describe / column-format / multiply-by'),
	                options: [
	                    { value: -2, label: '100' },
	                    { value: -3, label: '1000' },
	                    { value: -6, label: '1 million' },
	                    { value: -9, label: '1 billion' },
	                    { value: -12, label: '1 trillion' }
	                ]
	            }
	        ],
	        numberFormats: [
	            {
	                label: __('Decimal places'),
	                options: [
	                    { value: 'n3', label: '3 (1,234.568)' },
	                    { value: 'n2', label: '2 (1,234.57)' },
	                    { value: 'n1', label: '1 (1,234.6)' },
	                    { value: 'n0', label: '0 (1,235)' }
	                ]
	            },
	            {
	                label: __('Significant digits'),
	                options: [
	                    { value: 's6', label: '6 (1,234.57)' },
	                    { value: 's5', label: '5 (123.45)' },
	                    { value: 's4', label: '4 (12.34)' },
	                    { value: 's3', label: '3 (1.23)' },
	                    { value: 's2', label: '2 (0.12)' },
	                    { value: 's1', label: '1 (0.01)' }
	                ]
	            }
	        ],
	        roundOptions: [
	            { value: '-', label: __('describe / column-format / individual') },
	            { value: 'auto', label: __('describe / column-format / auto-detect') }
	        ]
	    };
	}
	var methods$2 = {
	    autoDivisor() {
	        const { dw_chart } = this.store.get();
	        const { column } = this.get();
	        const mtrSuf = dw.utils.metricSuffix(dw_chart.locale());
	        const values = column.values();
	        const dim = dw.utils.significantDimension(values);
	        let div = dim < -2 ? Math.round((dim * -1) / 3) * 3 : dim > 4 ? dim * -1 : 0;
	        const nvalues = values.map(function (v) {
	            return v / Math.pow(10, div);
	        });
	        let ndim = dw.utils.significantDimension(nvalues);
	        if (ndim <= 0)
	            ndim = nvalues.reduce(function (acc, cur) {
	                return Math.max(acc, Math.min(3, dw.utils.tailLength(cur)));
	            }, 0);

	        if (ndim === div) {
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
	                'number-format': 'n' + Math.max(0, ndim),
	                'number-prepend': '',
	                'number-append': div ? mtrSuf[div] || ' × 10<sup>' + div + '</sup>' : ''
	            }
	        });
	    },
	    getColumnFormat(column) {
	        const { dw_chart } = this.store.get();
	        const columnFormats = arrayToObject(
	            dw_chart.get('metadata.data.column-format', {})
	        );
	        let columnFormat = clone(columnFormats[column.name()]);
	        if (!columnFormat || columnFormat === 'auto' || columnFormat.length !== undefined) {
	            // no valid column format
	            columnFormat = {
	                type: 'auto',
	                ignore: false,
	                'number-divisor': 0,
	                'number-prepend': '',
	                'number-append': '',
	                'number-format': 'auto'
	            };
	        }
	        return columnFormat;
	    }
	};

	function oncreate$1() {
	    const updateTable = throttle_1(
	        () => {
	            this.fire('updateTable');
	        },
	        100,
	        { leading: false }
	    );
	    const renderTable = throttle_1(
	        () => {
	            this.fire('updateTable');
	        },
	        100,
	        { leading: false }
	    );

	    const { column } = this.get();

	    this.set({
	        colTypes: [
	            { value: 'auto', label: 'auto (' + column.type() + ')' },
	            { value: 'text', label: 'Text' },
	            { value: 'number', label: 'Number' },
	            { value: 'date', label: 'Date' }
	        ]
	    });

	    this.set({ columnFormat: this.getColumnFormat(column) });

	    this.on('state', ({ changed, current }) => {
	        if (changed.column) {
	            const col = current.column;
	            this.set({ columnFormat: this.getColumnFormat(col) });
	            const { colTypes } = this.get();
	            colTypes[0].label = 'auto (' + column.type() + ')';
	        }

	        if (changed.columnFormat) {
	            const colFormat = current.columnFormat;
	            const { dw_chart } = this.store.get();
	            const column = current.column;
	            const columnFormats = arrayToObject(
	                clone(dw_chart.get('metadata.data.column-format', {}))
	            );
	            const oldFormat = columnFormats[column.name()];
	            if (!oldFormat || JSON.stringify(oldFormat) !== JSON.stringify(colFormat)) {
	                if (colFormat['number-divisor'] === 'auto') {
	                    // stop here and compute divisor automatically
	                    setTimeout(() => this.autoDivisor(), 100);
	                    return;
	                }
	                columnFormats[column.name()] = clone(colFormat);
	                dw_chart.set('metadata.data.column-format', columnFormats);
	                if (dw_chart.saveSoon) dw_chart.saveSoon();
	                if (!oldFormat || oldFormat.type !== colFormat.type) updateTable();
	                else renderTable();
	            }
	        }
	    });
	}
	const file$5 = "describe/CustomColumnFormat.html";

	function create_main_fragment$6(component, ctx) {
		var div1, h3, text0, text1, div0, select_updating = {}, text2, checkbox_updating = {}, text3, hr, text4;

		var select_initial_data = {
		 	label: __('Column type'),
		 	options: ctx.colTypes,
		 	width: "180px"
		 };
		if (ctx.columnFormat.type !== void 0) {
			select_initial_data.value = ctx.columnFormat.type;
			select_updating.value = true;
		}
		var select = new Select({
			root: component.root,
			store: component.store,
			data: select_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!select_updating.value && changed.value) {
					ctx.columnFormat.type = childState.value;
					newState.columnFormat = ctx.columnFormat;
				}
				component._set(newState);
				select_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			select._bind({ value: 1 }, select.get());
		});

		var checkbox_initial_data = { label: __('Hide column from visualization') };
		if (ctx.columnFormat.ignore !== void 0) {
			checkbox_initial_data.value = ctx.columnFormat.ignore;
			checkbox_updating.value = true;
		}
		var checkbox = new Checkbox({
			root: component.root,
			store: component.store,
			data: checkbox_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkbox_updating.value && changed.value) {
					ctx.columnFormat.ignore = childState.value;
					newState.columnFormat = ctx.columnFormat;
				}
				component._set(newState);
				checkbox_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkbox._bind({ value: 1 }, checkbox.get());
		});

		var if_block = (ctx.column && ctx.column.type() == 'number') && create_if_block$5(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				h3 = createElement("h3");
				text0 = createText(ctx.title);
				text1 = createText("\n\n    ");
				div0 = createElement("div");
				select._fragment.c();
				text2 = createText("\n\n        ");
				checkbox._fragment.c();
				text3 = createText("\n\n        ");
				hr = createElement("hr");
				text4 = createText("\n\n        ");
				if (if_block) if_block.c();
				h3.className = "first";
				addLoc(h3, file$5, 1, 4, 10);
				addLoc(hr, file$5, 12, 8, 367);
				div0.className = "form-horizontal";
				addLoc(div0, file$5, 3, 4, 46);
				addLoc(div1, file$5, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, h3);
				append(h3, text0);
				append(div1, text1);
				append(div1, div0);
				select._mount(div0, null);
				append(div0, text2);
				checkbox._mount(div0, null);
				append(div0, text3);
				append(div0, hr);
				append(div0, text4);
				if (if_block) if_block.m(div0, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.title) {
					setData(text0, ctx.title);
				}

				var select_changes = {};
				if (changed.colTypes) select_changes.options = ctx.colTypes;
				if (!select_updating.value && changed.columnFormat) {
					select_changes.value = ctx.columnFormat.type;
					select_updating.value = ctx.columnFormat.type !== void 0;
				}
				select._set(select_changes);
				select_updating = {};

				var checkbox_changes = {};
				if (!checkbox_updating.value && changed.columnFormat) {
					checkbox_changes.value = ctx.columnFormat.ignore;
					checkbox_updating.value = ctx.columnFormat.ignore !== void 0;
				}
				checkbox._set(checkbox_changes);
				checkbox_updating = {};

				if (ctx.column && ctx.column.type() == 'number') {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$5(component, ctx);
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
					detachNode(div1);
				}

				select.destroy();
				checkbox.destroy();
				if (if_block) if_block.d();
			}
		};
	}

	// (15:8) {#if column && column.type() == 'number'}
	function create_if_block$5(component, ctx) {
		var select0_updating = {}, text0, select1_updating = {}, text1, div1, label, text2_value = __("Prepend/Append"), text2, text3, div0, input0, input0_updating = false, text4, input1, input1_updating = false;

		var select0_initial_data = {
		 	label: __('Round numbers to'),
		 	options: ctx.roundOptions,
		 	optgroups: ctx.numberFormats,
		 	width: "180px"
		 };
		if (ctx.columnFormat['number-format'] !== void 0) {
			select0_initial_data.value = ctx.columnFormat['number-format'];
			select0_updating.value = true;
		}
		var select0 = new Select({
			root: component.root,
			store: component.store,
			data: select0_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!select0_updating.value && changed.value) {
					ctx.columnFormat['number-format'] = childState.value;
					newState.columnFormat = ctx.columnFormat;
				}
				component._set(newState);
				select0_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			select0._bind({ value: 1 }, select0.get());
		});

		var select1_initial_data = {
		 	label: __('Divide numbers by'),
		 	options: ctx.divisors_opts,
		 	optgroups: ctx.divisors,
		 	width: "180px"
		 };
		if (ctx.columnFormat['number-divisor'] !== void 0) {
			select1_initial_data.value = ctx.columnFormat['number-divisor'];
			select1_updating.value = true;
		}
		var select1 = new Select({
			root: component.root,
			store: component.store,
			data: select1_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!select1_updating.value && changed.value) {
					ctx.columnFormat['number-divisor'] = childState.value;
					newState.columnFormat = ctx.columnFormat;
				}
				component._set(newState);
				select1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			select1._bind({ value: 1 }, select1.get());
		});

		function input0_input_handler() {
			input0_updating = true;
			ctx.columnFormat['number-prepend'] = input0.value;
			component.set({ columnFormat: ctx.columnFormat });
			input0_updating = false;
		}

		function input1_input_handler() {
			input1_updating = true;
			ctx.columnFormat['number-append'] = input1.value;
			component.set({ columnFormat: ctx.columnFormat });
			input1_updating = false;
		}

		return {
			c: function create() {
				select0._fragment.c();
				text0 = createText("\n\n        \n        ");
				select1._fragment.c();
				text1 = createText("\n\n        ");
				div1 = createElement("div");
				label = createElement("label");
				text2 = createText(text2_value);
				text3 = createText("\n            ");
				div0 = createElement("div");
				input0 = createElement("input");
				text4 = createText("\n                #\n                ");
				input1 = createElement("input");
				label.className = "control-label svelte-1qp115j";
				addLoc(label, file$5, 34, 12, 1022);
				addListener(input0, "input", input0_input_handler);
				input0.autocomplete = "screw-you-google-chrome";
				setStyle(input0, "width", "6ex");
				setStyle(input0, "text-align", "right");
				input0.dataset.lpignore = "true";
				input0.name = "prepend";
				setAttribute(input0, "type", "text");
				addLoc(input0, file$5, 38, 16, 1175);
				addListener(input1, "input", input1_input_handler);
				input1.autocomplete = "screw-you-google-chrome";
				setStyle(input1, "width", "6ex");
				input1.dataset.lpignore = "true";
				input1.name = "append";
				setAttribute(input1, "type", "text");
				addLoc(input1, file$5, 47, 16, 1525);
				div0.className = "controls form-inline svelte-1qp115j";
				addLoc(div0, file$5, 37, 12, 1124);
				div1.className = "control-group vis-option-type-select";
				addLoc(div1, file$5, 33, 8, 959);
			},

			m: function mount(target, anchor) {
				select0._mount(target, anchor);
				insert(target, text0, anchor);
				select1._mount(target, anchor);
				insert(target, text1, anchor);
				insert(target, div1, anchor);
				append(div1, label);
				append(label, text2);
				append(div1, text3);
				append(div1, div0);
				append(div0, input0);

				input0.value = ctx.columnFormat['number-prepend'];

				append(div0, text4);
				append(div0, input1);

				input1.value = ctx.columnFormat['number-append'];
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var select0_changes = {};
				if (changed.roundOptions) select0_changes.options = ctx.roundOptions;
				if (changed.numberFormats) select0_changes.optgroups = ctx.numberFormats;
				if (!select0_updating.value && changed.columnFormat) {
					select0_changes.value = ctx.columnFormat['number-format'];
					select0_updating.value = ctx.columnFormat['number-format'] !== void 0;
				}
				select0._set(select0_changes);
				select0_updating = {};

				var select1_changes = {};
				if (changed.divisors_opts) select1_changes.options = ctx.divisors_opts;
				if (changed.divisors) select1_changes.optgroups = ctx.divisors;
				if (!select1_updating.value && changed.columnFormat) {
					select1_changes.value = ctx.columnFormat['number-divisor'];
					select1_updating.value = ctx.columnFormat['number-divisor'] !== void 0;
				}
				select1._set(select1_changes);
				select1_updating = {};

				if (!input0_updating && changed.columnFormat) input0.value = ctx.columnFormat['number-prepend'];
				if (!input1_updating && changed.columnFormat) input1.value = ctx.columnFormat['number-append'];
			},

			d: function destroy(detach) {
				select0.destroy(detach);
				if (detach) {
					detachNode(text0);
				}

				select1.destroy(detach);
				if (detach) {
					detachNode(text1);
					detachNode(div1);
				}

				removeListener(input0, "input", input0_input_handler);
				removeListener(input1, "input", input1_input_handler);
			}
		};
	}

	function CustomColumnFormat(options) {
		this._debugName = '<CustomColumnFormat>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$6(), options.data);

		this._recompute({ column: 1 }, this._state);
		if (!('column' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'column'");

		if (!('colTypes' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'colTypes'");
		if (!('columnFormat' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'columnFormat'");
		if (!('roundOptions' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'roundOptions'");
		if (!('numberFormats' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'numberFormats'");
		if (!('divisors_opts' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors_opts'");
		if (!('divisors' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors'");
		this._intro = true;

		this._fragment = create_main_fragment$6(this, this._state);

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

	assign(CustomColumnFormat.prototype, protoDev);
	assign(CustomColumnFormat.prototype, methods$2);

	CustomColumnFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<CustomColumnFormat>: Cannot set read-only property 'title'");
	};

	CustomColumnFormat.prototype._recompute = function _recompute(changed, state) {
		if (changed.column) {
			if (this._differs(state.title, (state.title = title$1(state)))) changed.title = true;
		}
	};

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeCeil = Math.ceil,
	    nativeMax$1 = Math.max;

	/**
	 * The base implementation of `_.range` and `_.rangeRight` which doesn't
	 * coerce arguments.
	 *
	 * @private
	 * @param {number} start The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} step The value to increment or decrement by.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Array} Returns the range of numbers.
	 */
	function baseRange(start, end, step, fromRight) {
	  var index = -1,
	      length = nativeMax$1(nativeCeil((end - start) / (step || 1)), 0),
	      result = Array(length);

	  while (length--) {
	    result[fromRight ? length : ++index] = start;
	    start += step;
	  }
	  return result;
	}

	var _baseRange = baseRange;

	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject_1(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike_1(object) && _isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq_1(object[index], value);
	  }
	  return false;
	}

	var _isIterateeCall = isIterateeCall;

	/** Used as references for various `Number` constants. */
	var INFINITY$2 = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber_1(value);
	  if (value === INFINITY$2 || value === -INFINITY$2) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	var toFinite_1 = toFinite;

	/**
	 * Creates a `_.range` or `_.rangeRight` function.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new range function.
	 */
	function createRange(fromRight) {
	  return function(start, end, step) {
	    if (step && typeof step != 'number' && _isIterateeCall(start, end, step)) {
	      end = step = undefined;
	    }
	    // Ensure the sign of `-0` is preserved.
	    start = toFinite_1(start);
	    if (end === undefined) {
	      end = start;
	      start = 0;
	    } else {
	      end = toFinite_1(end);
	    }
	    step = step === undefined ? (start < end ? 1 : -1) : toFinite_1(step);
	    return _baseRange(start, end, step, fromRight);
	  };
	}

	var _createRange = createRange;

	/**
	 * Creates an array of numbers (positive and/or negative) progressing from
	 * `start` up to, but not including, `end`. A step of `-1` is used if a negative
	 * `start` is specified without an `end` or `step`. If `end` is not specified,
	 * it's set to `start` with `start` then set to `0`.
	 *
	 * **Note:** JavaScript follows the IEEE-754 standard for resolving
	 * floating-point values which can produce unexpected results.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {number} [start=0] The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} [step=1] The value to increment or decrement by.
	 * @returns {Array} Returns the range of numbers.
	 * @see _.inRange, _.rangeRight
	 * @example
	 *
	 * _.range(4);
	 * // => [0, 1, 2, 3]
	 *
	 * _.range(-4);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 5);
	 * // => [1, 2, 3, 4]
	 *
	 * _.range(0, 20, 5);
	 * // => [0, 5, 10, 15]
	 *
	 * _.range(0, -4, -1);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 4, 0);
	 * // => [1, 1, 1]
	 *
	 * _.range(0);
	 * // => []
	 */
	var range = _createRange();

	var range_1 = range;

	/** Used for built-in method references. */
	var objectProto$d = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$a = objectProto$d.hasOwnProperty;

	/**
	 * Creates an object composed of keys generated from the results of running
	 * each element of `collection` thru `iteratee`. The corresponding value of
	 * each key is the number of times the key was returned by `iteratee`. The
	 * iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.5.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
	 * @returns {Object} Returns the composed aggregate object.
	 * @example
	 *
	 * _.countBy([6.1, 4.2, 6.3], Math.floor);
	 * // => { '4': 1, '6': 2 }
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.countBy(['one', 'two', 'three'], 'length');
	 * // => { '3': 2, '5': 1 }
	 */
	var countBy = _createAggregator(function(result, value, key) {
	  if (hasOwnProperty$a.call(result, key)) {
	    ++result[key];
	  } else {
	    _baseAssignValue(result, key, 1);
	  }
	});

	var countBy_1 = countBy;

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
	 * Automatically converts a numeric value to a string. this is better
	 * than the default number to string conversion in JS which sometimes
	 * produces ugly strings like "3.999999998"
	 *
	 * @exports toFixed
	 * @kind function
	 *
	 * @example
	 * import toFixed from '@datawrapper/shared/toFixed';
	 * // returns '3.1'
	 * toFixed(3.100001)
	 *
	 * @param {number} value
	 * @returns {string}
	 */
	function toFixed(value) {
	    return (+value).toFixed(tailLength(value));
	}

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

	function count(values, valueof) {
	  let count = 0;
	  if (valueof === undefined) {
	    for (let value of values) {
	      if (value != null && (value = +value) >= value) {
	        ++count;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
	        ++count;
	      }
	    }
	  }
	  return count;
	}

	function extent(values, valueof) {
	  let min;
	  let max;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null) {
	        if (min === undefined) {
	          if (value >= value) min = max = value;
	        } else {
	          if (min > value) min = value;
	          if (max < value) max = value;
	        }
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null) {
	        if (min === undefined) {
	          if (value >= value) min = max = value;
	        } else {
	          if (min > value) min = value;
	          if (max < value) max = value;
	        }
	      }
	    }
	  }
	  return [min, max];
	}

	function identity$1(x) {
	  return x;
	}

	var array = Array.prototype;

	var slice = array.slice;

	function constant(x) {
	  return function() {
	    return x;
	  };
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

	function thresholdSturges(values) {
	  return Math.ceil(Math.log(count(values)) / Math.LN2) + 1;
	}

	function histogram() {
	  var value = identity$1,
	      domain = extent,
	      threshold = thresholdSturges;

	  function histogram(data) {
	    if (!Array.isArray(data)) data = Array.from(data);

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
	      tz = sequence(Math.ceil(x0 / tz) * tz, x1, tz); // exclusive
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
	    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), histogram) : threshold;
	  };

	  return histogram;
	}

	function max$1(values, valueof) {
	  let max;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null
	          && (max < value || (max === undefined && value >= value))) {
	        max = value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null
	          && (max < value || (max === undefined && value >= value))) {
	        max = value;
	      }
	    }
	  }
	  return max;
	}

	function min$1(values, valueof) {
	  let min;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null
	          && (min > value || (min === undefined && value >= value))) {
	        min = value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null
	          && (min > value || (min === undefined && value >= value))) {
	        min = value;
	      }
	    }
	  }
	  return min;
	}

	// Based on https://github.com/mourner/quickselect
	// ISC license, Copyright 2018 Vladimir Agafonkin.
	function quickselect(array, k, left = 0, right = array.length - 1, compare = ascending) {
	  while (right > left) {
	    if (right - left > 600) {
	      const n = right - left + 1;
	      const m = k - left + 1;
	      const z = Math.log(n);
	      const s = 0.5 * Math.exp(2 * z / 3);
	      const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
	      const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
	      const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
	      quickselect(array, k, newLeft, newRight, compare);
	    }

	    const t = array[k];
	    let i = left;
	    let j = right;

	    swap(array, left, k);
	    if (compare(array[right], t) > 0) swap(array, left, right);

	    while (i < j) {
	      swap(array, i, j), ++i, --j;
	      while (compare(array[i], t) < 0) ++i;
	      while (compare(array[j], t) > 0) --j;
	    }

	    if (compare(array[left], t) === 0) swap(array, left, j);
	    else ++j, swap(array, j, right);

	    if (j <= k) left = j + 1;
	    if (k <= j) right = j - 1;
	  }
	  return array;
	}

	function swap(array, i, j) {
	  const t = array[i];
	  array[i] = array[j];
	  array[j] = t;
	}

	function* numbers(values, valueof) {
	  if (valueof === undefined) {
	    for (let value of values) {
	      if (value != null && (value = +value) >= value) {
	        yield value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
	        yield value;
	      }
	    }
	  }
	}

	function quantile(values, p, valueof) {
	  values = Float64Array.from(numbers(values, valueof));
	  if (!(n = values.length)) return;
	  if ((p = +p) <= 0 || n < 2) return min$1(values);
	  if (p >= 1) return max$1(values);
	  var n,
	      i = (n - 1) * p,
	      i0 = Math.floor(i),
	      value0 = max$1(quickselect(values, i0).subarray(0, i0 + 1)),
	      value1 = min$1(values.subarray(i0 + 1));
	  return value0 + (value1 - value0) * (i - i0);
	}

	function mean(values, valueof) {
	  let count = 0;
	  let sum = 0;
	  if (valueof === undefined) {
	    for (let value of values) {
	      if (value != null && (value = +value) >= value) {
	        ++count, sum += value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
	        ++count, sum += value;
	      }
	    }
	  }
	  if (count) return sum / count;
	}

	function median(values, valueof) {
	  return quantile(values, 0.5, valueof);
	}

	function initRange(domain, range) {
	  switch (arguments.length) {
	    case 0: break;
	    case 1: this.range(domain); break;
	    default: this.range(range).domain(domain); break;
	  }
	  return this;
	}

	const implicit = Symbol("implicit");

	function ordinal() {
	  var index = new Map(),
	      domain = [],
	      range = [],
	      unknown = implicit;

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
	    domain = [], index = new Map();
	    for (const value of _) {
	      const key = value + "";
	      if (index.has(key)) continue;
	      index.set(key, domain.push(value));
	    }
	    return scale;
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = Array.from(_), scale) : range.slice();
	  };

	  scale.unknown = function(_) {
	    return arguments.length ? (unknown = _, scale) : unknown;
	  };

	  scale.copy = function() {
	    return ordinal(domain, range).unknown(unknown);
	  };

	  initRange.apply(scale, arguments);

	  return scale;
	}

	function band() {
	  var scale = ordinal().unknown(undefined),
	      domain = scale.domain,
	      ordinalRange = scale.range,
	      r0 = 0,
	      r1 = 1,
	      step,
	      bandwidth,
	      round = false,
	      paddingInner = 0,
	      paddingOuter = 0,
	      align = 0.5;

	  delete scale.unknown;

	  function rescale() {
	    var n = domain().length,
	        reverse = r1 < r0,
	        start = reverse ? r1 : r0,
	        stop = reverse ? r0 : r1;
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
	    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
	  };

	  scale.rangeRound = function(_) {
	    return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
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
	    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
	  };

	  scale.paddingInner = function(_) {
	    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
	  };

	  scale.paddingOuter = function(_) {
	    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
	  };

	  scale.align = function(_) {
	    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
	  };

	  scale.copy = function() {
	    return band(domain(), [r0, r1])
	        .round(round)
	        .paddingInner(paddingInner)
	        .paddingOuter(paddingOuter)
	        .align(align);
	  };

	  return initRange.apply(rescale(), arguments);
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
	    reHex = /^#([0-9a-f]{3,8})$/,
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
	  copy: function(channels) {
	    return Object.assign(new this.constructor, this, channels);
	  },
	  displayable: function() {
	    return this.rgb().displayable();
	  },
	  hex: color_formatHex, // Deprecated! Use color.formatHex.
	  formatHex: color_formatHex,
	  formatHsl: color_formatHsl,
	  formatRgb: color_formatRgb,
	  toString: color_formatRgb
	});

	function color_formatHex() {
	  return this.rgb().formatHex();
	}

	function color_formatHsl() {
	  return hslConvert(this).formatHsl();
	}

	function color_formatRgb() {
	  return this.rgb().formatRgb();
	}

	function color(format) {
	  var m, l;
	  format = (format + "").trim().toLowerCase();
	  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
	      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
	      : l === 8 ? new Rgb(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
	      : l === 4 ? new Rgb((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
	      : null) // invalid hex
	      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
	      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
	      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
	      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
	      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
	      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
	      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
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
	    return (-0.5 <= this.r && this.r < 255.5)
	        && (-0.5 <= this.g && this.g < 255.5)
	        && (-0.5 <= this.b && this.b < 255.5)
	        && (0 <= this.opacity && this.opacity <= 1);
	  },
	  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
	  formatHex: rgb_formatHex,
	  formatRgb: rgb_formatRgb,
	  toString: rgb_formatRgb
	}));

	function rgb_formatHex() {
	  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
	}

	function rgb_formatRgb() {
	  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	  return (a === 1 ? "rgb(" : "rgba(")
	      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
	      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
	      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
	      + (a === 1 ? ")" : ", " + a + ")");
	}

	function hex(value) {
	  value = Math.max(0, Math.min(255, Math.round(value) || 0));
	  return (value < 16 ? "0" : "") + value.toString(16);
	}

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
	  },
	  formatHsl: function() {
	    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	    return (a === 1 ? "hsl(" : "hsla(")
	        + (this.h || 0) + ", "
	        + (this.s || 0) * 100 + "%, "
	        + (this.l || 0) * 100 + "%"
	        + (a === 1 ? ")" : ", " + a + ")");
	  }
	}));

	/* From FvD 13.37, CSS Color Module Level 3 */
	function hsl2rgb(h, m1, m2) {
	  return (h < 60 ? m1 + (m2 - m1) * h / 60
	      : h < 180 ? m2
	      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
	      : m1) * 255;
	}

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
	  var color = gamma(y);

	  function rgb$1(start, end) {
	    var r = color((start = rgb(start)).r, (end = rgb(end)).r),
	        g = color(start.g, end.g),
	        b = color(start.b, end.b),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.r = r(t);
	      start.g = g(t);
	      start.b = b(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }

	  rgb$1.gamma = rgbGamma;

	  return rgb$1;
	})(1);

	function numberArray(a, b) {
	  if (!b) b = [];
	  var n = a ? Math.min(b.length, a.length) : 0,
	      c = b.slice(),
	      i;
	  return function(t) {
	    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
	    return c;
	  };
	}

	function isNumberArray(x) {
	  return ArrayBuffer.isView(x) && !(x instanceof DataView);
	}

	function genericArray(a, b) {
	  var nb = b ? b.length : 0,
	      na = a ? Math.min(nb, a.length) : 0,
	      x = new Array(na),
	      c = new Array(nb),
	      i;

	  for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
	  for (; i < nb; ++i) c[i] = b[i];

	  return function(t) {
	    for (i = 0; i < na; ++i) c[i] = x[i](t);
	    return c;
	  };
	}

	function date(a, b) {
	  var d = new Date;
	  return a = +a, b = +b, function(t) {
	    return d.setTime(a * (1 - t) + b * t), d;
	  };
	}

	function interpolateNumber(a, b) {
	  return a = +a, b = +b, function(t) {
	    return a * (1 - t) + b * t;
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
	      i[k] = interpolate(a[k], b[k]);
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
	      q.push({i: i, x: interpolateNumber(am, bm)});
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

	function interpolate(a, b) {
	  var t = typeof b, c;
	  return b == null || t === "boolean" ? constant$1(b)
	      : (t === "number" ? interpolateNumber
	      : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
	      : b instanceof color ? rgb$1
	      : b instanceof Date ? date
	      : isNumberArray(b) ? numberArray
	      : Array.isArray(b) ? genericArray
	      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
	      : interpolateNumber)(a, b);
	}

	function interpolateRound(a, b) {
	  return a = +a, b = +b, function(t) {
	    return Math.round(a * (1 - t) + b * t);
	  };
	}

	function constant$2(x) {
	  return function() {
	    return x;
	  };
	}

	function number(x) {
	  return +x;
	}

	var unit = [0, 1];

	function identity$2(x) {
	  return x;
	}

	function normalize(a, b) {
	  return (b -= (a = +a))
	      ? function(x) { return (x - a) / b; }
	      : constant$2(isNaN(b) ? NaN : 0.5);
	}

	function clamper(a, b) {
	  var t;
	  if (a > b) t = a, a = b, b = t;
	  return function(x) { return Math.max(a, Math.min(b, x)); };
	}

	// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
	// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
	function bimap(domain, range, interpolate) {
	  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
	  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
	  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
	  return function(x) { return r0(d0(x)); };
	}

	function polymap(domain, range, interpolate) {
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
	    d[i] = normalize(domain[i], domain[i + 1]);
	    r[i] = interpolate(range[i], range[i + 1]);
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
	      .clamp(source.clamp())
	      .unknown(source.unknown());
	}

	function transformer() {
	  var domain = unit,
	      range = unit,
	      interpolate$1 = interpolate,
	      transform,
	      untransform,
	      unknown,
	      clamp = identity$2,
	      piecewise,
	      output,
	      input;

	  function rescale() {
	    var n = Math.min(domain.length, range.length);
	    if (clamp !== identity$2) clamp = clamper(domain[0], domain[n - 1]);
	    piecewise = n > 2 ? polymap : bimap;
	    output = input = null;
	    return scale;
	  }

	  function scale(x) {
	    return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
	  }

	  scale.invert = function(y) {
	    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
	  };

	  scale.domain = function(_) {
	    return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = _ ? true : identity$2, rescale()) : clamp !== identity$2;
	  };

	  scale.interpolate = function(_) {
	    return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
	  };

	  scale.unknown = function(_) {
	    return arguments.length ? (unknown = _, scale) : unknown;
	  };

	  return function(t, u) {
	    transform = t, untransform = u;
	    return rescale();
	  };
	}

	function continuous() {
	  return transformer()(identity$2, identity$2);
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

	// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
	var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

	function formatSpecifier(specifier) {
	  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
	  var match;
	  return new FormatSpecifier({
	    fill: match[1],
	    align: match[2],
	    sign: match[3],
	    symbol: match[4],
	    zero: match[5],
	    width: match[6],
	    comma: match[7],
	    precision: match[8] && match[8].slice(1),
	    trim: match[9],
	    type: match[10]
	  });
	}

	formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

	function FormatSpecifier(specifier) {
	  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
	  this.align = specifier.align === undefined ? ">" : specifier.align + "";
	  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
	  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
	  this.zero = !!specifier.zero;
	  this.width = specifier.width === undefined ? undefined : +specifier.width;
	  this.comma = !!specifier.comma;
	  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
	  this.trim = !!specifier.trim;
	  this.type = specifier.type === undefined ? "" : specifier.type + "";
	}

	FormatSpecifier.prototype.toString = function() {
	  return this.fill
	      + this.align
	      + this.sign
	      + this.symbol
	      + (this.zero ? "0" : "")
	      + (this.width === undefined ? "" : Math.max(1, this.width | 0))
	      + (this.comma ? "," : "")
	      + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
	      + (this.trim ? "~" : "")
	      + this.type;
	};

	// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
	function formatTrim(s) {
	  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
	    switch (s[i]) {
	      case ".": i0 = i1 = i; break;
	      case "0": if (i0 === 0) i0 = i; i1 = i; break;
	      default: if (i0 > 0) { if (!+s[i]) break out; i0 = 0; } break;
	    }
	  }
	  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
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

	function identity$3(x) {
	  return x;
	}

	var map = Array.prototype.map,
	    prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

	function formatLocale(locale) {
	  var group = locale.grouping === undefined || locale.thousands === undefined ? identity$3 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
	      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
	      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
	      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
	      numerals = locale.numerals === undefined ? identity$3 : formatNumerals(map.call(locale.numerals, String)),
	      percent = locale.percent === undefined ? "%" : locale.percent + "",
	      minus = locale.minus === undefined ? "-" : locale.minus + "",
	      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

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
	        trim = specifier.trim,
	        type = specifier.type;

	    // The "n" type is an alias for ",g".
	    if (type === "n") comma = true, type = "g";

	    // The "" type, and any invalid type, is an alias for ".12~g".
	    else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

	    // If zero fill is specified, padding goes after sign and before digits.
	    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

	    // Compute the prefix and suffix.
	    // For SI-prefix, the suffix is lazily computed.
	    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
	        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

	    // What format function should we use?
	    // Is this an integer type?
	    // Can this type generate exponential notation?
	    var formatType = formatTypes[type],
	        maybeSuffix = /[defgprs%]/.test(type);

	    // Set the default precision if not specified,
	    // or clamp the specified precision to the supported range.
	    // For significant precision, it must be in [1, 21].
	    // For fixed precision, it must be in [0, 20].
	    precision = precision === undefined ? 6
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
	        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

	        // Trim insignificant zeros.
	        if (trim) value = formatTrim(value);

	        // If a negative value rounds to zero during formatting, treat as positive.
	        if (valueNegative && +value === 0) valueNegative = false;

	        // Compute the prefix and suffix.
	        valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;

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
	  currency: ["$", ""],
	  minus: "-"
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

	function tickFormat(start, stop, count, specifier) {
	  var step = tickStep(start, stop, count),
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
	    var d = domain();
	    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
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
	  var scale = continuous();

	  scale.copy = function() {
	    return copy(scale, linear$2());
	  };

	  initRange.apply(scale, arguments);

	  return linearish(scale);
	}

	/* describe/Histogram.html generated by Svelte v2.16.1 */



	var xScale_ = linear$2();
	var xScaleBand_ = band();
	var yScale_ = linear$2();

	const pct = val => {
	    if (!val) return '0%';
	    if (val < 0.01) return '<1%';
	    return (val * 100).toFixed(0) + '%';
	};

	function NAs({ values }) {
	    return values.filter(d => typeof d === 'string' || Number.isNaN(d)).length;
	}
	function stats({ validValues, format }) {
	    const xmin = min$1(validValues);
	    const xmax = max$1(validValues);
	    const xmean = mean(validValues);
	    const xmed = median(validValues);
	    return [
	        { x: xmin, label: format(xmin), name: 'Min' },
	        { x: xmax, label: format(xmax), name: 'Max' },
	        { x: xmean, label: format(xmean), name: __('describe / histogram / mean') },
	        { x: xmed, label: format(xmed), name: __('describe / histogram / median') }
	    ];
	}
	function validValues({ values }) {
	    return values.filter(d => typeof d === 'number' && !Number.isNaN(d));
	}
	function ticks$1({ xScale, format }) {
	    return xScale.ticks(4).map(x => {
	        return { x, label: format(x) };
	    });
	}
	function bins({ niceDomain, validValues }) {
	    // const tickCnt = Math.min(_uniq(validValues).length, 14);
	    const dom = niceDomain;
	    // const classw = (s[1]-s[0]);
	    const bins = histogram().domain(dom).thresholds(thresholdSturges)(validValues);
	    const binWidths = countBy_1(bins.map(b => b.x1 - b.x0));
	    if (bins.length > 2 && Object.keys(binWidths).length > 1) {
	        // check first and last bin
	        const binw = bins[1].x1 - bins[1].x0;
	        const lst = dom[0] + Math.ceil((dom[1] - dom[0]) / binw) * binw;
	        return histogram()
	            .domain([dom[0], lst])
	            .thresholds(range_1(dom[0], lst + binw * 0.4, binw))(validValues);
	    }
	    return bins;
	}
	function niceDomain({ validValues }) {
	    return linear$2().domain(extent(validValues)).nice().domain();
	}
	function xScaleBand({ bins, innerWidth }) {
	    return xScaleBand_
	        .domain(bins.map(d => d.x0))
	        .paddingInner(0.1)
	        .rangeRound([0, innerWidth])
	        .align(0);
	}
	function xScale({ niceDomain, bins, xScaleBand }) {
	    return xScale_.domain(niceDomain).rangeRound([0, xScaleBand.step() * bins.length]);
	}
	function yScale({ innerHeight, bins }) {
	    return yScale_
	        .domain([
	            0,
	            max$1(bins, function (d) {
	                return d.length;
	            })
	        ])
	        .range([innerHeight, 0]);
	}
	function barWidth({ bins, xScale }) {
	    return xScale(bins[0].x1) - xScale(bins[0].x0) - 1;
	}
	function innerWidth({ width, padding }) {
	    return width - padding.left - padding.right;
	}
	function innerHeight({ height, padding }) {
	    return height - padding.bottom - padding.top;
	}
	function data$7() {
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
	    const tt =
	        i === 0
	            ? __('describe / histogram / tooltip / first')
	            : i === bins.length - 1
	            ? __('describe / histogram / tooltip / last')
	            : __('describe / histogram / tooltip');
	    return tt
	        .replace('$1', bin.length)
	        .replace('$2', pct(bin.length / len))
	        .replace('$3', toFixed(bin.x0))
	        .replace('$4', toFixed(bin.x1));
	}
	var methods$3 = {
	    show(value) {
	        this.set({ highlight: value });
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
	const file$6 = "describe/Histogram.html";

	function mouseenter_handler(event) {
		const { component, ctx } = this._svelte;

		component.show(ctx.s);
	}

	function mouseleave_handler(event) {
		const { component } = this._svelte;

		component.show(false);
	}

	function get_each2_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.s = list[i];
		return child_ctx;
	}

	function get_each1_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.bin = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tick = list[i];
		return child_ctx;
	}

	function create_main_fragment$7(component, ctx) {
		var h3, text0_value = __('describe / histogram'), text0, text1, svg, g2, g0, each0_anchor, g0_transform_value, g1, g2_transform_value, text2, ul, text3, text4, p, raw_value = __("describe / histogram / learn-more");

		var each0_value = ctx.ticks;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_2$1(component, get_each0_context(ctx, each0_value, i));
		}

		var if_block0 = (ctx.highlight) && create_if_block_1$4(component, ctx);

		var each1_value = ctx.bins;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block_1$1(component, get_each1_context(ctx, each1_value, i));
		}

		var each2_value = ctx.stats;

		var each2_blocks = [];

		for (var i = 0; i < each2_value.length; i += 1) {
			each2_blocks[i] = create_each_block$2(component, get_each2_context(ctx, each2_value, i));
		}

		var if_block1 = (ctx.NAs>0) && create_if_block$6(component, ctx);

		return {
			c: function create() {
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n");
				svg = createSvgElement("svg");
				g2 = createSvgElement("g");
				g0 = createSvgElement("g");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				each0_anchor = createComment();
				if (if_block0) if_block0.c();
				g1 = createSvgElement("g");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text2 = createText("\n");
				ul = createElement("ul");

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].c();
				}

				text3 = createText(" ");
				if (if_block1) if_block1.c();
				text4 = createText("\n");
				p = createElement("p");
				h3.className = "svelte-p5ucpx";
				addLoc(h3, file$6, 0, 0, 0);
				setAttribute(g0, "class", "axis x-axis svelte-p5ucpx");
				setAttribute(g0, "transform", g0_transform_value = "translate(0, " + ctx.innerHeight + ")");
				addLoc(g0, file$6, 4, 8, 140);
				setAttribute(g1, "class", "bars svelte-p5ucpx");
				addLoc(g1, file$6, 27, 8, 1085);
				setAttribute(g2, "transform", g2_transform_value = "translate(" + ([ctx.padding.left,ctx.padding.top]) + ")");
				addLoc(g2, file$6, 3, 4, 76);
				setAttribute(svg, "class", "svelte-p5ucpx");
				addLoc(svg, file$6, 1, 0, 38);
				ul.className = "svelte-p5ucpx";
				addLoc(ul, file$6, 40, 0, 1560);
				p.className = "learn-more";
				addLoc(p, file$6, 50, 0, 1863);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				insert(target, text1, anchor);
				insert(target, svg, anchor);
				append(svg, g2);
				append(g2, g0);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(g0, null);
				}

				append(g0, each0_anchor);
				if (if_block0) if_block0.m(g0, null);
				append(g2, g1);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(g1, null);
				}

				component.refs.svg = svg;
				insert(target, text2, anchor);
				insert(target, ul, anchor);

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].m(ul, null);
				}

				append(ul, text3);
				if (if_block1) if_block1.m(ul, null);
				insert(target, text4, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if (changed.xScale || changed.ticks) {
					each0_value = ctx.ticks;

					for (var i = 0; i < each0_value.length; i += 1) {
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_2$1(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(g0, each0_anchor);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (ctx.highlight) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$4(component, ctx);
						if_block0.c();
						if_block0.m(g0, null);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if ((changed.innerHeight) && g0_transform_value !== (g0_transform_value = "translate(0, " + ctx.innerHeight + ")")) {
					setAttribute(g0, "transform", g0_transform_value);
				}

				if (changed.xScaleBand || changed.bins || changed.yScale || changed.innerHeight || changed.validValues) {
					each1_value = ctx.bins;

					for (var i = 0; i < each1_value.length; i += 1) {
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block_1$1(component, child_ctx);
							each1_blocks[i].c();
							each1_blocks[i].m(g1, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				if ((changed.padding) && g2_transform_value !== (g2_transform_value = "translate(" + ([ctx.padding.left,ctx.padding.top]) + ")")) {
					setAttribute(g2, "transform", g2_transform_value);
				}

				if (changed.stats) {
					each2_value = ctx.stats;

					for (var i = 0; i < each2_value.length; i += 1) {
						const child_ctx = get_each2_context(ctx, each2_value, i);

						if (each2_blocks[i]) {
							each2_blocks[i].p(changed, child_ctx);
						} else {
							each2_blocks[i] = create_each_block$2(component, child_ctx);
							each2_blocks[i].c();
							each2_blocks[i].m(ul, text3);
						}
					}

					for (; i < each2_blocks.length; i += 1) {
						each2_blocks[i].d(1);
					}
					each2_blocks.length = each2_value.length;
				}

				if (ctx.NAs>0) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$6(component, ctx);
						if_block1.c();
						if_block1.m(ul, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text1);
					detachNode(svg);
				}

				destroyEach(each0_blocks, detach);

				if (if_block0) if_block0.d();

				destroyEach(each1_blocks, detach);

				if (component.refs.svg === svg) component.refs.svg = null;
				if (detach) {
					detachNode(text2);
					detachNode(ul);
				}

				destroyEach(each2_blocks, detach);

				if (if_block1) if_block1.d();
				if (detach) {
					detachNode(text4);
					detachNode(p);
				}
			}
		};
	}

	// (6:12) {#each ticks as tick}
	function create_each_block_2$1(component, ctx) {
		var g, line, text1, text0_value = ctx.tick.label, text0, g_transform_value;

		return {
			c: function create() {
				g = createSvgElement("g");
				line = createSvgElement("line");
				text1 = createSvgElement("text");
				text0 = createText(text0_value);
				setAttribute(line, "y2", "3");
				setAttribute(line, "class", "svelte-p5ucpx");
				addLoc(line, file$6, 7, 16, 325);
				setAttribute(text1, "y", "5");
				setAttribute(text1, "class", "svelte-p5ucpx");
				addLoc(text1, file$6, 8, 16, 357);
				setAttribute(g, "class", "tick svelte-p5ucpx");
				setAttribute(g, "transform", g_transform_value = "translate(" + ctx.xScale(ctx.tick.x) + ",0)");
				addLoc(g, file$6, 6, 12, 250);
			},

			m: function mount(target, anchor) {
				insert(target, g, anchor);
				append(g, line);
				append(g, text1);
				append(text1, text0);
			},

			p: function update(changed, ctx) {
				if ((changed.ticks) && text0_value !== (text0_value = ctx.tick.label)) {
					setData(text0, text0_value);
				}

				if ((changed.xScale || changed.ticks) && g_transform_value !== (g_transform_value = "translate(" + ctx.xScale(ctx.tick.x) + ",0)")) {
					setAttribute(g, "transform", g_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(g);
				}
			}
		};
	}

	// (11:20) {#if highlight}
	function create_if_block_1$4(component, ctx) {
		var polygon, polygon_transform_value;

		return {
			c: function create() {
				polygon = createSvgElement("polygon");
				setAttribute(polygon, "transform", polygon_transform_value = "translate(" + ctx.xScale(ctx.highlight.x) + ",0)");
				setAttribute(polygon, "points", "0,0,4,6,-4,6");
				addLoc(polygon, file$6, 11, 12, 454);
			},

			m: function mount(target, anchor) {
				insert(target, polygon, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.xScale || changed.highlight) && polygon_transform_value !== (polygon_transform_value = "translate(" + ctx.xScale(ctx.highlight.x) + ",0)")) {
					setAttribute(polygon, "transform", polygon_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(polygon);
				}
			}
		};
	}

	// (29:12) {#each bins as bin, i}
	function create_each_block_1$1(component, ctx) {
		var g, title, text_value = tooltip(ctx.bin,ctx.i,ctx.bins,ctx.validValues.length), text, rect, rect_width_value, rect_height_value, g_transform_value;

		return {
			c: function create() {
				g = createSvgElement("g");
				title = createSvgElement("title");
				text = createText(text_value);
				rect = createSvgElement("rect");
				addLoc(title, file$6, 30, 16, 1246);
				setAttribute(rect, "width", rect_width_value = ctx.bin.x1 != ctx.bin.x0 ? ctx.xScaleBand.bandwidth() : 20);
				setAttribute(rect, "height", rect_height_value = ctx.innerHeight - ctx.yScale(ctx.bin.length));
				setAttribute(rect, "class", "svelte-p5ucpx");
				addLoc(rect, file$6, 31, 16, 1318);
				setAttribute(g, "class", "bar");
				setAttribute(g, "transform", g_transform_value = "translate(" + ctx.xScaleBand(ctx.bin.x0) + "," + ctx.yScale(ctx.bin.length) + ")");
				addLoc(g, file$6, 29, 12, 1149);
			},

			m: function mount(target, anchor) {
				insert(target, g, anchor);
				append(g, title);
				append(title, text);
				append(g, rect);
			},

			p: function update(changed, ctx) {
				if ((changed.bins || changed.validValues) && text_value !== (text_value = tooltip(ctx.bin,ctx.i,ctx.bins,ctx.validValues.length))) {
					setData(text, text_value);
				}

				if ((changed.bins || changed.xScaleBand) && rect_width_value !== (rect_width_value = ctx.bin.x1 != ctx.bin.x0 ? ctx.xScaleBand.bandwidth() : 20)) {
					setAttribute(rect, "width", rect_width_value);
				}

				if ((changed.innerHeight || changed.yScale || changed.bins) && rect_height_value !== (rect_height_value = ctx.innerHeight - ctx.yScale(ctx.bin.length))) {
					setAttribute(rect, "height", rect_height_value);
				}

				if ((changed.xScaleBand || changed.bins || changed.yScale) && g_transform_value !== (g_transform_value = "translate(" + ctx.xScaleBand(ctx.bin.x0) + "," + ctx.yScale(ctx.bin.length) + ")")) {
					setAttribute(g, "transform", g_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(g);
				}
			}
		};
	}

	// (42:4) {#each stats as s}
	function create_each_block$2(component, ctx) {
		var li, text0_value = ctx.s.name, text0, text1, tt, text2_value = ctx.s.label, text2;

		return {
			c: function create() {
				li = createElement("li");
				text0 = createText(text0_value);
				text1 = createText(": ");
				tt = createElement("tt");
				text2 = createText(text2_value);
				tt._svelte = { component, ctx };

				addListener(tt, "mouseleave", mouseleave_handler);
				addListener(tt, "mouseenter", mouseenter_handler);
				tt.className = "svelte-p5ucpx";
				addLoc(tt, file$6, 42, 18, 1606);
				li.className = "svelte-p5ucpx";
				addLoc(li, file$6, 42, 4, 1592);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, text0);
				append(li, text1);
				append(li, tt);
				append(tt, text2);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.stats) && text0_value !== (text0_value = ctx.s.name)) {
					setData(text0, text0_value);
				}

				if ((changed.stats) && text2_value !== (text2_value = ctx.s.label)) {
					setData(text2, text2_value);
				}

				tt._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(tt, "mouseleave", mouseleave_handler);
				removeListener(tt, "mouseenter", mouseenter_handler);
			}
		};
	}

	// (44:12) {#if NAs>0}
	function create_if_block$6(component, ctx) {
		var li, text0_value = __('describe / histogram / invalid'), text0, text1, tt, text2, text3, text4_value = pct(ctx.NAs/ctx.values.length), text4, text5;

		return {
			c: function create() {
				li = createElement("li");
				text0 = createText(text0_value);
				text1 = createText(":\n        ");
				tt = createElement("tt");
				text2 = createText(ctx.NAs);
				text3 = createText(" (");
				text4 = createText(text4_value);
				text5 = createText(")");
				setStyle(tt, "color", "#c71e1d");
				tt.className = "svelte-p5ucpx";
				addLoc(tt, file$6, 46, 8, 1771);
				li.className = "svelte-p5ucpx";
				addLoc(li, file$6, 44, 4, 1710);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, text0);
				append(li, text1);
				append(li, tt);
				append(tt, text2);
				append(li, text3);
				append(li, text4);
				append(li, text5);
			},

			p: function update(changed, ctx) {
				if (changed.NAs) {
					setData(text2, ctx.NAs);
				}

				if ((changed.NAs || changed.values) && text4_value !== (text4_value = pct(ctx.NAs/ctx.values.length))) {
					setData(text4, text4_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	function Histogram(options) {
		this._debugName = '<Histogram>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$7(), options.data);

		this._recompute({ values: 1, validValues: 1, format: 1, niceDomain: 1, width: 1, padding: 1, bins: 1, innerWidth: 1, xScaleBand: 1, xScale: 1, height: 1, innerHeight: 1 }, this._state);
		if (!('values' in this._state)) console.warn("<Histogram> was created without expected data property 'values'");

		if (!('format' in this._state)) console.warn("<Histogram> was created without expected data property 'format'");






		if (!('width' in this._state)) console.warn("<Histogram> was created without expected data property 'width'");
		if (!('padding' in this._state)) console.warn("<Histogram> was created without expected data property 'padding'");
		if (!('height' in this._state)) console.warn("<Histogram> was created without expected data property 'height'");

		if (!('highlight' in this._state)) console.warn("<Histogram> was created without expected data property 'highlight'");
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

	assign(Histogram.prototype, protoDev);
	assign(Histogram.prototype, methods$3);

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

	const TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	const COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	const defaultAllowed = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

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
	 * getCellRenderer defines what classes are set on each HOT cell
	 */
	function getCellRenderer (app, chart, dataset, Handsontable) {
	    const colTypeIcons = {
	        date: 'fa fa-clock-o'
	    };
	    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
	        var escaped = purifyHTML(Handsontable.helper.stringify(value));
	        TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
	    }
	    return function (instance, td, row, col, prop, value, cellProperties) {
	        if (dataset.numColumns() <= col || !dataset.hasColumn(col)) return;
	        const column = dataset.column(col);
	        const { searchResults, currentResult, activeColumn } = app.get();
	        const colFormat = app.getColumnFormat(column.name());
	        row = instance.toPhysicalRow(row);
	        if (row > 0) {
	            var formatter = chart.columnFormatter(column);
	            value =
	                column.val(row - 1) === null || column.val(row - 1) === ''
	                    ? '–'
	                    : formatter(column.val(row - 1), true);
	        }
	        if (parseInt(value) < 0) {
	            // if row contains negative number
	            td.classList.add('negative');
	        }
	        td.classList.add(column.type() + 'Type');
	        td.dataset.column = col;

	        if (column.type() === 'text' && value && value.length > 70) {
	            value = value.substr(0, 60) + '…';
	        }

	        if (row === 0) {
	            td.classList.add('firstRow');
	            if (colTypeIcons[column.type()]) {
	                value = '<i class="' + colTypeIcons[column.type()] + '"></i> ' + value;
	            }
	        } else {
	            td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
	        }
	        if (colFormat.ignore) {
	            td.classList.add('ignored');
	        }
	        if (activeColumn && activeColumn.name() === column.name()) {
	            td.classList.add('active');
	        }
	        const rowPosition = Handsontable.hooks.run(instance, 'modifyRow', row);
	        // const rowPosition = row; // instance.getPlugin('columnSorting').untranslateRow(row);
	        searchResults.forEach(res => {
	            if (res.row === rowPosition && res.col === col) {
	                td.classList.add('htSearchResult');
	            }
	        });
	        if (currentResult && currentResult.row === rowPosition && currentResult.col === col) {
	            td.classList.add('htCurrentSearchResult');
	        }
	        if (
	            row > 0 &&
	            !column.type(true).isValid(column.val(row - 1)) &&
	            column.val(row - 1) !== null &&
	            column.val(row - 1) !== ''
	        ) {
	            td.classList.add('parsingError');
	        }
	        if (row > 0 && (column.val(row - 1) === null || column.val(row - 1) === '')) {
	            td.classList.add('noData');
	        }
	        if (
	            column.isComputed &&
	            column.errors.length &&
	            column.errors.find(err => err.row === 'all' || err.row === row - 1)
	        ) {
	            td.classList.add('parsingError');
	        }
	        if (cellProperties.readOnly) td.classList.add('readOnly');

	        if (chart.dataCellChanged(col, row)) {
	            td.classList.add('changed');
	        }
	        HtmlCellRender(instance, td, row, col, prop, value);
	        // Reflect.apply(HtmlCellRender, this, arguments);
	    };
	}

	/* describe/hot/Handsontable.html generated by Svelte v2.16.1 */



	let app = null;
	let searchTimer = null;

	function currentResult({ searchResults, searchIndex }) {
	    if (!searchResults || !searchResults.length) return null;
	    const l = searchResults.length;
	    if (searchIndex < 0 || searchIndex >= l) {
	        while (searchIndex < 0) searchIndex += l;
	        if (searchIndex > l) searchIndex %= l;
	    }
	    return searchResults[searchIndex];
	}
	function data$8() {
	    return {
	        hot: null,
	        data: '',
	        readonly: false,
	        skipRows: 0,
	        firstRowIsHeader: true,
	        fixedColumnsLeft: 0,
	        searchIndex: 0,
	        sortBy: '-',
	        transpose: false,
	        activeColumn: null,
	        search: '',
	        searchResults: []
	    };
	}
	var methods$4 = {
	    render() {
	        const { hot } = this.get();
	        hot.render();
	    },
	    doSearch() {
	        const { hot, search } = this.get();
	        clearTimeout(searchTimer);
	        searchTimer = setTimeout(() => {
	            if (!hot || !search) {
	                this.set({ searchResults: [] });
	            } else {
	                const searchPlugin = hot.getPlugin('search');
	                const searchResults = searchPlugin.query(search);
	                this.set({ searchResults });
	            }
	        }, 300);
	    },
	    update() {
	        const { data, transpose, firstRowIsHeader, skipRows, hot } = this.get();

	        if (!data) return;

	        // get chart
	        const { dw_chart } = this.store.get();

	        // pass dataset through chart to apply changes and computed columns
	        const ds = dw_chart
	            .dataset(
	                dw.datasource
	                    .delimited({
	                        csv: data,
	                        transpose,
	                        firstRowIsHeader,
	                        skipRows
	                    })
	                    .parse()
	            )
	            .dataset();

	        this.set({ columnOrder: ds.columnOrder() });

	        // construct HoT data array
	        const hotData = [[]];
	        ds.eachColumn(c => hotData[0].push(c.title()));

	        ds.eachRow(r => {
	            const row = [];
	            ds.eachColumn(col => row.push(col.raw(r)));
	            hotData.push(row);
	        });

	        // pass data to hot
	        hot.loadData(hotData);

	        const cellRenderer = getCellRenderer(this, dw_chart, ds, HOT);

	        hot.updateSettings({
	            cells: (row, col) => {
	                const { readonly } = this.get();
	                return {
	                    readOnly:
	                        readonly ||
	                        (ds.hasColumn(col) && ds.column(col).isComputed && row === 0),
	                    renderer: cellRenderer
	                };
	            },
	            manualColumnMove: []
	        });

	        this.set({ ds });
	        this.set({ has_changes: clone(chart.get('metadata.data.changes', [])).length > 0 });

	        HOT.hooks.once('afterRender', () => this.initCustomEvents());
	        HOT.hooks.once('afterRender', () => this.fire('afterRender'));
	        hot.render();
	    },
	    dataChanged(cells) {
	        const { hot } = this.get();
	        let changed = false;
	        cells.forEach(([row, col, oldValue, newValue]) => {
	            if (oldValue !== newValue) {
	                const chart = this.store.get().dw_chart;
	                const { transpose } = this.get();
	                const changes = clone(chart.get('metadata.data.changes', []));
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
	                    column: col,
	                    row,
	                    value: newValue,
	                    previous: oldValue,
	                    time: new Date().getTime()
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
	    columnMoved(srcColumns, tgtIndex) {
	        const { hot } = this.get();
	        if (!srcColumns.length) return;
	        const { columnOrder } = this.get();
	        const newOrder = columnOrder.slice(0);
	        const after = columnOrder[tgtIndex];
	        const elements = newOrder.splice(srcColumns[0], srcColumns.length);
	        const insertAt =
	            after === undefined ? newOrder.length : after ? newOrder.indexOf(after) : 0;
	        newOrder.splice(insertAt, 0, ...elements);
	        this.store.get().dw_chart.set('metadata.data.column-order', newOrder.slice(0));
	        this.set({ columnOrder: newOrder });
	        // update selection
	        HOT.hooks.once('afterRender', () => {
	            setTimeout(() => {
	                this.fire('resetSort');
	                hot.selectCell(
	                    0,
	                    insertAt,
	                    hot.countRows() - 1,
	                    insertAt + elements.length - 1
	                );
	            }, 10);
	        });
	        this.update();
	    },
	    updateHeight() {
	        const h = document
	            .querySelector('.ht_master.handsontable .wtHolder .wtHider')
	            .getBoundingClientRect().height;
	        this.refs.hot.style.height = Math.min(500, h + 10) + 'px';
	    },
	    checkRange(r, c, r2, c2) {
	        // check if
	        // 1. only a single column is selected, and
	        // 2. the range starts at the first row, and
	        // 3. the range extends through he last row
	        const { hot } = this.get();
	        const { ds } = this.get();

	        if (c === c2 && r === 0 && r2 === hot.countRows() - 1) {
	            // const chart = this.store.get('dw_chart');
	            // this.set({activeColumn: chart.dataset().column(c)});
	            return;
	        }
	        if (c !== c2 && r === 0 && r2 === hot.countRows() - 1) {
	            const sel = [];
	            for (let i = Math.min(c, c2); i <= Math.max(c, c2); i++) {
	                sel.push(
	                    +document.querySelector(
	                        `#data-preview .htCore tbody tr:first-child td:nth-child(${i + 2})`
	                    ).dataset.column
	                );
	            }
	            this.set({ multiSelection: sel.map(i => ds.column(i)), activeColumn: null });
	            return;
	        }
	        this.set({ activeColumn: null, multiSelection: false });
	    },
	    initCustomEvents() {
	        // wait a bit to make sure HoT is rendered
	        setTimeout(() => {
	            // catch click events on A,B,C,D... header row
	            this.refs.hot.querySelectorAll('.htCore thead th:first-child').forEach(th => {
	                th.removeEventListener('click', topLeftCornerClick);
	                th.addEventListener('click', topLeftCornerClick);
	            });
	            // const cellHeaderClickHandler = cellHeaderClick(app);
	            this.refs.hot.querySelectorAll('.htCore thead th+th').forEach(th => {
	                th.removeEventListener('click', cellHeaderClick);
	                th.addEventListener('click', cellHeaderClick);
	            });
	        }, 500);
	    },

	    getColumnFormat(name) {
	        const { dw_chart } = this.store.get();
	        const colFormats = dw_chart.get('metadata.data.column-format', {});
	        return colFormats[name] || { type: 'auto', ignore: false };
	    }
	};

	function oncreate$3() {
	    app = this;
	    HOT.hooks.once('afterRender', () => this.initCustomEvents());

	    window.addEventListener('keyup', evt => {
	        const { activeColumn, ds } = this.get();
	        if (!activeColumn) return;

	        if (
	            evt.target.tagName.toLowerCase() === 'input' ||
	            evt.target.tagName.toLowerCase() === 'textarea'
	        )
	            return;

	        if (evt.key === 'ArrowRight' || evt.key === 'ArrowLeft') {
	            evt.preventDefault();
	            evt.stopPropagation();
	            const currentIndex = ds.indexOf(activeColumn.name());
	            if (evt.key === 'ArrowRight') {
	                // select next column
	                this.set({ activeColumn: ds.column((currentIndex + 1) % ds.numColumns()) });
	            } else {
	                // select prev column
	                this.set({
	                    activeColumn: ds.column(
	                        (currentIndex - 1 + ds.numColumns()) % ds.numColumns()
	                    )
	                });
	            }
	        }
	    });

	    const { dw_chart } = this.store.get();
	    const hot = new HOT(this.refs.hot, {
	        data: [],
	        rowHeaders: i => {
	            const ti = HOT.hooks.run(hot, 'modifyRow', i);
	            // const ti = hot.getPlugin('ColumnSorting').translateRow(i);
	            return ti + 1;
	        },
	        colHeaders: true,
	        fixedRowsTop: 1,
	        fixedColumnsLeft: this.get().fixedColumnsLeft,
	        filters: true,
	        // dropdownMenu: true,
	        startRows: 13,
	        startCols: 8,
	        fillHandle: false,
	        stretchH: 'all',
	        height: 500,
	        manualColumnMove: true,
	        selectionMode: 'range',
	        autoColumnSize: { useHeaders: true, syncLimit: 5 },

	        // // sorting
	        sortIndicator: true,
	        columnSorting: true,
	        sortFunction: function (sortOrder, columnMeta) {
	            if (columnMeta.col > -1) {
	                const column = dw_chart.dataset().column(columnMeta.col);
	                const colType = column.type();
	                return (a, b) => {
	                    if (a[0] === 0) return -1;
	                    // replace with values
	                    a[1] = column.val(a[0] - 1);
	                    b[1] = column.val(b[0] - 1);
	                    if (colType === 'number') {
	                        // sort NaNs at bottom
	                        if (isNaN(a[1]))
	                            a[1] = !sortOrder
	                                ? Number.NEGATIVE_INFINITY
	                                : Number.POSITIVE_INFINITY;
	                        if (isNaN(b[1]))
	                            b[1] = !sortOrder
	                                ? Number.NEGATIVE_INFINITY
	                                : Number.POSITIVE_INFINITY;
	                    }
	                    if (colType === 'date') {
	                        if (typeof a[1] === 'string') a[1] = new Date(110, 0, 1);
	                        if (typeof b[1] === 'string') b[1] = new Date(110, 0, 1);
	                    }
	                    return (
	                        (sortOrder === 'desc' ? -1 : 1) *
	                        (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0)
	                    );
	                };
	            }
	            return (a, b) => a[0] - b[0];
	        },
	        afterGetColHeader: (col, th) => {
	            const { activeColumn, ds } = this.get();
	            if (!ds || !ds.hasColumn(col)) return;
	            if (
	                (col === 0 || col) &&
	                activeColumn &&
	                ds.column(col).name() === activeColumn.name()
	            ) {
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
	        // // search
	        search: 'search'
	    });

	    window.HT = hot;
	    this.set({ hot });

	    HOT.hooks.add('afterSetDataAtCell', a => this.dataChanged(a));
	    HOT.hooks.add('afterColumnMove', (a, b) => this.columnMoved(a, b));
	    HOT.hooks.add('afterRender', () => this.updateHeight());
	    HOT.hooks.add('afterSelection', (r, c, r2, c2) => this.checkRange(r, c, r2, c2));
	}
	function onstate({ changed, current, previous }) {
	    const hot = current.hot;
	    if (!hot) return;

	    if (changed.data) {
	        this.update();
	    }
	    if (changed.firstRowIsHeader && previous && previous.firstRowIsHeader !== undefined) {
	        this.update();
	    }
	    if (changed.hot) {
	        this.update();
	    }
	    if (changed.search && previous) {
	        this.doSearch();
	        this.set({ searchIndex: 0 });
	    }

	    if (changed.searchResults) {
	        hot.render();
	    }
	    if (changed.currentResult && current.currentResult) {
	        hot.render();
	        const res = current.currentResult;
	        hot.scrollViewportTo(res.row, res.col);
	        setTimeout(() => {
	            // one more time
	            hot.scrollViewportTo(res.row, res.col);
	        }, 100);
	    }
	    if (changed.activeColumn) {
	        setTimeout(() => hot.render(), 10);
	    }
	    if (changed.fixedColumnsLeft) {
	        hot.updateSettings({ fixedColumnsLeft: current.fixedColumnsLeft });
	    }
	    if (changed.sorting) {
	        hot.getPlugin('columnSorting').sort(
	            chart.dataset().indexOf(current.sorting.sortBy),
	            current.sorting.sortDir ? 'asc' : 'desc'
	        );
	    }
	}
	function cellHeaderClick(evt) {
	    const th = this;
	    // reset the HoT selection
	    // find out which data column we're in
	    const k = th.parentNode.children.length;
	    let thIndex = -1;
	    // (stupid HTMLCollection has no indexOf)
	    for (let i = 0; i < k; i++) {
	        if (th.parentNode.children.item(i) === th) {
	            thIndex = i;
	            break;
	        }
	    }
	    // find column index
	    const colIndex = +app.refs.hot.querySelector(
	        `.htCore tbody tr:first-child td:nth-child(${thIndex + 1})`
	    ).dataset.column;
	    const { dw_chart } = app.store.get();
	    const { activeColumn, hot } = app.get();
	    if (dw_chart.dataset().hasColumn(colIndex)) {
	        const newActive = dw_chart.dataset().column(+colIndex);
	        // set active column (or unset if it's already set)
	        if (activeColumn && activeColumn.name() === newActive.name()) {
	            evt.target.parentNode.classList.remove('selected');
	            app.set({ activeColumn: false });
	            hot.deselectCell();
	        } else {
	            evt.target.parentNode.classList.add('selected');
	            app.set({ activeColumn: newActive });
	        }
	    }
	}

	function topLeftCornerClick(evt) {
	    evt.preventDefault();
	    const { transpose } = app.get();
	    app.set({ transpose: !transpose });
	    app.update();
	}

	const file$7 = "describe/hot/Handsontable.html";

	function create_main_fragment$8(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.id = "data-preview";
				addLoc(div, file$7, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				component.refs.hot = div;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (component.refs.hot === div) component.refs.hot = null;
			}
		};
	}

	function Handsontable(options) {
		this._debugName = '<Handsontable>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$8(), options.data);

		this._recompute({ searchResults: 1, searchIndex: 1 }, this._state);
		if (!('searchResults' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchResults'");
		if (!('searchIndex' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchIndex'");
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$8(this, this._state);

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

	assign(Handsontable.prototype, protoDev);
	assign(Handsontable.prototype, methods$4);

	Handsontable.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentResult' in newState && !this._updatingReadonlyProperty) throw new Error("<Handsontable>: Cannot set read-only property 'currentResult'");
	};

	Handsontable.prototype._recompute = function _recompute(changed, state) {
		if (changed.searchResults || changed.searchIndex) {
			if (this._differs(state.currentResult, (state.currentResult = currentResult(state)))) changed.currentResult = true;
		}
	};

	/* describe/App.html generated by Svelte v2.16.1 */



	function searchIndexSafe({ searchIndex, searchResults }) {
	    if (searchIndex < 0) searchIndex += searchResults.length;
	    searchIndex = searchIndex % searchResults.length;
	    return searchIndex;
	}
	function customColumn({ activeColumn, forceColumnFormat }) {
	    return activeColumn && !forceColumnFormat && activeColumn.isComputed
	        ? activeColumn
	        : false;
	}
	function columnFormat({ activeColumn, forceColumnFormat }) {
	    return activeColumn && (!activeColumn.isComputed || forceColumnFormat)
	        ? activeColumn
	        : false;
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
	    } catch (e) {
	        return [];
	    }
	}
	function sorting({ sortBy, sortDir }) {
	    return { sortBy, sortDir };
	}
	function resultsDisplay({ searchResults, searchIndexSafe }) {
	    if (searchResults.length > 0) {
	        return `${searchIndexSafe + 1} ${__('describe / search / of')} ${
            searchResults.length
        } ${__('describe / search / results')}`;
	    } else {
	        return __('describe / search / no-matches');
	    }
	}
	function data$9() {
	    return {
	        locale: 'en-US',
	        search: '',
	        chartData: '',
	        readonly: false,
	        transpose: false,
	        firstRowIsHeader: true,
	        fixedColumnsLeft: 0,
	        searchIndex: 0,
	        activeColumn: false,
	        customColumn: false,
	        columnFormat: false,
	        multiSelection: false,
	        forceColumnFormat: false,
	        searchResults: [],
	        sortBy: '-',
	        sortDir: true
	    };
	}
	var methods$5 = {
	    nextResult(diff) {
	        let { searchIndex, searchResults } = this.get();
	        searchIndex += diff;
	        if (searchIndex < 0) searchIndex += searchResults.length;
	        searchIndex = searchIndex % searchResults.length;
	        this.set({ searchIndex });
	    },
	    keyPress(event) {
	        if (event.key === 'F3' || event.key === 'Enter') {
	            this.nextResult(event.shiftKey ? -1 : 1);
	        }
	    },
	    toggleTranspose() {
	        this.set({ activeColumn: false });
	        this.set({ transpose: !this.get().transpose });
	        setTimeout(() => this.refs.hot.update(), 500);
	        // ;
	    },
	    revertChanges() {
	        const chart = this.store.get().dw_chart;
	        chart.setMetadata('data.changes', []);
	        chart.saveSoon();
	        this.refs.hot.update();
	    },
	    cmFocus() {
	        setTimeout(() => {
	            this.refs.hot.get().hot.render();
	        }, 100);
	    },
	    addComputedColumn() {
	        const chart = this.store.get().dw_chart;
	        const ds = chart.dataset();
	        const computed = getComputedColumns(chart);
	        // find new id
	        let i = 1;
	        while (ds.hasColumn(`Column ${i}`)) {
	            i++;
	        }
	        const id = `Column ${i}`;
	        computed.push({
	            name: id,
	            formula: ''
	        });
	        chart.setMetadata('describe.computed-columns', computed);
	        chart.saveSoon();
	        const ds2 = chart.dataset(true);
	        this.refs.hot.update();
	        this.set({ activeColumn: ds2.column(id) });
	        this.store.set({ dw_chart: chart });
	    },
	    sort(event, col, ascending) {
	        event.preventDefault();
	        event.stopPropagation();
	        this.set({ sortBy: col, sortDir: ascending });
	        // hide the dropdown menu
	        this.refs.sortDropdownGroup.classList.remove('open');
	    },
	    force(event, val = true) {
	        event.preventDefault();
	        this.set({ forceColumnFormat: val });
	    },
	    hideMultiple(columns, hide) {
	        const chart = this.store.get().dw_chart;
	        const colFmt = clone(chart.get('metadata.data.column-format', {}));
	        columns.forEach(col => {
	            if (colFmt[col.name()]) colFmt[col.name()].ignore = hide;
	            else {
	                colFmt[col.name()] = { type: 'auto', ignore: hide };
	            }
	        });
	        chart.setMetadata('data.column-format', colFmt);
	        chart.saveSoon();
	        setTimeout(() => {
	            this.refs.hot.get().hot.render();
	        }, 10);
	        this.set({ multiSelection: false });
	    },
	    afterRender() {
	        // called once the hot is done rendering
	        if (this.refs.ccEd) {
	            this.refs.ccEd.fire('hotRendered');
	        }
	    }
	};

	function oncreate$4() {
	    window.addEventListener('keypress', event => {
	        if (event.ctrlKey && event.key === 'f') {
	            event.preventDefault();
	            if (this.refs.search !== window.document.activeElement) {
	                this.refs.search.focus();
	            } else {
	                this.nextResult(+1);
	            }
	        }
	    });
	}
	function onupdate({ changed, current }) {
	    if (changed.activeColumn && !current.activeColumn) {
	        this.set({ forceColumnFormat: false });
	    }
	    const sync = {
	        transpose: 'metadata.data.transpose',
	        firstRowIsHeader: 'metadata.data.horizontal-header',
	        locale: 'language'
	    };
	    Object.keys(sync).forEach(svelteKey => {
	        if (changed[svelteKey]) {
	            const svelteValue = current[svelteKey];
	            const metadataKey = sync[svelteKey];
	            this.store.get().dw_chart.set(`${metadataKey}`, svelteValue);
	            if (svelteKey === 'locale') {
	                if (!svelteValue) return;
	                this.store.get().dw_chart.locale(svelteValue, () => {
	                    this.refs.hot.render();
	                });
	            }
	        }
	    });
	}
	const file$8 = "describe/App.html";

	function click_handler_2(event) {
		const { component, ctx } = this._svelte;

		component.sort(event, ctx.col.name(), true);
	}

	function click_handler_1(event) {
		const { component, ctx } = this._svelte;

		component.sort(event, ctx.col.name(), false);
	}

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.sort(event, ctx.col.name(), true);
	}

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.col = list[i];
		return child_ctx;
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.locale = list[i];
		return child_ctx;
	}

	function create_main_fragment$9(component, ctx) {
		var div12, div11, div2, div1, text0, hr, text1, div0, a0, i0, text2, text3_value = __('Back'), text3, text4, a1, text5_value = __('Proceed'), text5, text6, i1, text7, div10, div3, raw0_value = __('describe / info-table-header'), raw0_after, text8, img0, text9, div8, div5, div4, button0, raw1_value = __('describe / sort-by'), raw1_after, text10, span, text11, ul, li, a2, raw2_value = __('describe / no-sorting'), li_class_value, text12, text13, div7, i2, text14, div6, input, input_updating = false, input_class_value, text15, div6_class_value, text16, text17, handsontable_updating = {}, text18, div9, button1, img1, text19, text20_value = __(`describe / transpose-long`), text20, text21, button2, i3, text22, text23_value = __(`computed columns / add-btn`), text23, text24, text25, button3, i4, text26, text27_value = __(`Revert changes`), text27, text28, button3_class_value;

		function select_block_type(ctx) {
			if (ctx.activeColumn) return create_if_block_2$2;
			if (ctx.multiSelection) return create_if_block_7;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		function click_handler(event) {
			component.sort(event, '-');
		}

		var each_value_1 = ctx.columns;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, get_each_context_1$1(ctx, each_value_1, i));
		}

		function input_input_handler() {
			input_updating = true;
			component.set({ search: input.value });
			input_updating = false;
		}

		function keypress_handler(event) {
			component.keyPress(event);
		}

		var if_block1 = (ctx.searchResults.length > 0) && create_if_block_1$5(component);

		var if_block2 = (ctx.search) && create_if_block$7(component, ctx);

		var handsontable_initial_data = {};
		if (ctx.chartData !== void 0) {
			handsontable_initial_data.data = ctx.chartData;
			handsontable_updating.data = true;
		}
		if (ctx.transpose
	                 !== void 0) {
			handsontable_initial_data.transpose = ctx.transpose
	                ;
			handsontable_updating.transpose = true;
		}
		if (ctx.firstRowIsHeader
	                 !== void 0) {
			handsontable_initial_data.firstRowIsHeader = ctx.firstRowIsHeader
	                ;
			handsontable_updating.firstRowIsHeader = true;
		}
		if (ctx.fixedColumnsLeft
	                 !== void 0) {
			handsontable_initial_data.fixedColumnsLeft = ctx.fixedColumnsLeft
	                ;
			handsontable_updating.fixedColumnsLeft = true;
		}
		if (ctx.activeColumn
	                 !== void 0) {
			handsontable_initial_data.activeColumn = ctx.activeColumn
	                ;
			handsontable_updating.activeColumn = true;
		}
		if (ctx.readonly
	                 !== void 0) {
			handsontable_initial_data.readonly = ctx.readonly
	                ;
			handsontable_updating.readonly = true;
		}
		if (ctx.sorting
	                 !== void 0) {
			handsontable_initial_data.sorting = ctx.sorting
	                ;
			handsontable_updating.sorting = true;
		}
		if (ctx.search
	                 !== void 0) {
			handsontable_initial_data.search = ctx.search
	                ;
			handsontable_updating.search = true;
		}
		if (ctx.searchResults
	                 !== void 0) {
			handsontable_initial_data.searchResults = ctx.searchResults
	                ;
			handsontable_updating.searchResults = true;
		}
		if (ctx.searchIndex
	                 !== void 0) {
			handsontable_initial_data.searchIndex = ctx.searchIndex
	                ;
			handsontable_updating.searchIndex = true;
		}
		if (ctx.multiSelection
	                 !== void 0) {
			handsontable_initial_data.multiSelection = ctx.multiSelection
	                ;
			handsontable_updating.multiSelection = true;
		}
		var handsontable = new Handsontable({
			root: component.root,
			store: component.store,
			data: handsontable_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!handsontable_updating.data && changed.data) {
					newState.chartData = childState.data;
				}

				if (!handsontable_updating.transpose && changed.transpose) {
					newState.transpose = childState.transpose;
				}

				if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
					newState.firstRowIsHeader = childState.firstRowIsHeader;
				}

				if (!handsontable_updating.fixedColumnsLeft && changed.fixedColumnsLeft) {
					newState.fixedColumnsLeft = childState.fixedColumnsLeft;
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

		component.root._beforecreate.push(() => {
			handsontable._bind({ data: 1, transpose: 1, firstRowIsHeader: 1, fixedColumnsLeft: 1, activeColumn: 1, readonly: 1, sorting: 1, search: 1, searchResults: 1, searchIndex: 1, multiSelection: 1 }, handsontable.get());
		});

		handsontable.on("resetSort", function(event) {
			component.set({sortBy:'-'});
		});
		handsontable.on("afterRender", function(event) {
			component.afterRender();
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
				div12 = createElement("div");
				div11 = createElement("div");
				div2 = createElement("div");
				div1 = createElement("div");
				if_block0.c();
				text0 = createText("\n\n                ");
				hr = createElement("hr");
				text1 = createText("\n\n                ");
				div0 = createElement("div");
				a0 = createElement("a");
				i0 = createElement("i");
				text2 = createText(" ");
				text3 = createText(text3_value);
				text4 = createText("\n                    ");
				a1 = createElement("a");
				text5 = createText(text5_value);
				text6 = createText(" ");
				i1 = createElement("i");
				text7 = createText("\n        ");
				div10 = createElement("div");
				div3 = createElement("div");
				raw0_after = createElement('noscript');
				text8 = createText("\n                ");
				img0 = createElement("img");
				text9 = createText("\n            ");
				div8 = createElement("div");
				div5 = createElement("div");
				div4 = createElement("div");
				button0 = createElement("button");
				raw1_after = createElement('noscript');
				text10 = createText("… ");
				span = createElement("span");
				text11 = createText("\n                        ");
				ul = createElement("ul");
				li = createElement("li");
				a2 = createElement("a");
				text12 = createText("\n                            ");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text13 = createText("\n\n                ");
				div7 = createElement("div");
				i2 = createElement("i");
				text14 = createText("\n                    ");
				div6 = createElement("div");
				input = createElement("input");
				text15 = createText("\n                        ");
				if (if_block1) if_block1.c();
				text16 = createText("\n\n                    ");
				if (if_block2) if_block2.c();
				text17 = createText("\n\n            ");
				handsontable._fragment.c();
				text18 = createText("\n\n            ");
				div9 = createElement("div");
				button1 = createElement("button");
				img1 = createElement("img");
				text19 = createText("\n                    ");
				text20 = createText(text20_value);
				text21 = createText("\n\n                ");
				button2 = createElement("button");
				i3 = createElement("i");
				text22 = createText(" ");
				text23 = createText(text23_value);
				text24 = createText("…");
				text25 = createText("\n\n                ");
				button3 = createElement("button");
				i4 = createElement("i");
				text26 = createText(" ");
				text27 = createText(text27_value);
				text28 = createText("…");
				addLoc(hr, file$8, 70, 16, 2776);
				i0.className = "icon-chevron-left";
				addLoc(i0, file$8, 74, 25, 2905);
				a0.className = "btn submit";
				a0.href = "upload";
				addLoc(a0, file$8, 73, 20, 2844);
				i1.className = "icon-chevron-right icon-white";
				addLoc(i1, file$8, 77, 40, 3111);
				a1.href = "visualize";
				a1.className = "submit btn btn-primary";
				a1.id = "describe-proceed";
				addLoc(a1, file$8, 76, 20, 2997);
				div0.className = "btn-group";
				addLoc(div0, file$8, 72, 16, 2800);
				div1.className = "sidebar";
				addLoc(div1, file$8, 3, 12, 89);
				div2.className = "span4";
				addLoc(div2, file$8, 2, 8, 57);
				img0.alt = "arrow";
				img0.src = "/static/img/arrow.svg";
				addLoc(img0, file$8, 85, 16, 3373);
				div3.className = "help svelte-1ymbvw3";
				addLoc(div3, file$8, 83, 12, 3279);
				span.className = "caret";
				addLoc(span, file$8, 91, 62, 3757);
				button0.className = "btn dropdown-toggle";
				button0.dataset.toggle = "dropdown";
				addLoc(button0, file$8, 90, 24, 3635);
				addListener(a2, "click", click_handler);
				a2.href = "#s";
				a2.className = "svelte-1ymbvw3";
				addLoc(a2, file$8, 95, 32, 3979);
				li.className = li_class_value = '-'==ctx.sortBy?'active':'';
				addLoc(li, file$8, 94, 28, 3908);
				ul.className = "dropdown-menu sort-menu";
				addLoc(ul, file$8, 93, 24, 3843);
				div4.className = "btn-group";
				addLoc(div4, file$8, 89, 20, 3565);
				div5.className = "sort-box svelte-1ymbvw3";
				addLoc(div5, file$8, 88, 16, 3522);
				i2.className = "im im-magnifier svelte-1ymbvw3";
				addLoc(i2, file$8, 119, 20, 5257);
				addListener(input, "input", input_input_handler);
				addListener(input, "keypress", keypress_handler);
				input.autocomplete = "screw-you-google-chrome";
				setAttribute(input, "type", "search");
				input.placeholder = __('describe / search / placeholder');
				input.className = input_class_value = "" + (ctx.searchResults.length > 0?'with-results':'') + " search-query" + " svelte-1ymbvw3";
				addLoc(input, file$8, 121, 24, 5396);
				div6.className = div6_class_value = ctx.searchResults.length > 0 ? 'input-append' : '';
				addLoc(div6, file$8, 120, 20, 5309);
				div7.className = "search-box form-search svelte-1ymbvw3";
				addLoc(div7, file$8, 118, 16, 5200);
				div8.className = "pull-right";
				setStyle(div8, "margin-bottom", "10px");
				addLoc(div8, file$8, 87, 12, 3452);
				img1.alt = "transpose";
				img1.src = "/static/css/chart-editor/transpose.png";
				img1.className = "svelte-1ymbvw3";
				addLoc(img1, file$8, 169, 20, 7307);
				addListener(button1, "click", click_handler_3);
				button1.className = "btn transpose svelte-1ymbvw3";
				addLoc(button1, file$8, 168, 16, 7227);
				i3.className = "fa fa-calculator";
				addLoc(i3, file$8, 174, 20, 7562);
				addListener(button2, "click", click_handler_4);
				button2.className = "btn computed-columns";
				addLoc(button2, file$8, 173, 16, 7473);
				i4.className = "fa fa-undo";
				addLoc(i4, file$8, 182, 20, 7871);
				addListener(button3, "click", click_handler_5);
				button3.className = button3_class_value = "btn " + (ctx.has_changes?'':'disabled') + " svelte-1ymbvw3";
				button3.id = "reset-data-changes";
				addLoc(button3, file$8, 177, 16, 7674);
				div9.className = "buttons below-table pull-right svelte-1ymbvw3";
				addLoc(div9, file$8, 167, 12, 7166);
				div10.className = "span8 svelte-1ymbvw3";
				addLoc(div10, file$8, 82, 8, 3247);
				div11.className = "row";
				addLoc(div11, file$8, 1, 4, 31);
				div12.className = "chart-editor";
				addLoc(div12, file$8, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div12, anchor);
				append(div12, div11);
				append(div11, div2);
				append(div2, div1);
				if_block0.m(div1, null);
				append(div1, text0);
				append(div1, hr);
				append(div1, text1);
				append(div1, div0);
				append(div0, a0);
				append(a0, i0);
				append(a0, text2);
				append(a0, text3);
				append(div0, text4);
				append(div0, a1);
				append(a1, text5);
				append(a1, text6);
				append(a1, i1);
				append(div11, text7);
				append(div11, div10);
				append(div10, div3);
				append(div3, raw0_after);
				raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
				append(div3, text8);
				append(div3, img0);
				append(div10, text9);
				append(div10, div8);
				append(div8, div5);
				append(div5, div4);
				append(div4, button0);
				append(button0, raw1_after);
				raw1_after.insertAdjacentHTML("beforebegin", raw1_value);
				append(button0, text10);
				append(button0, span);
				append(div4, text11);
				append(div4, ul);
				append(ul, li);
				append(li, a2);
				a2.innerHTML = raw2_value;
				append(ul, text12);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				component.refs.sortDropdownGroup = div4;
				append(div8, text13);
				append(div8, div7);
				append(div7, i2);
				append(div7, text14);
				append(div7, div6);
				append(div6, input);
				component.refs.search = input;

				input.value = ctx.search;

				append(div6, text15);
				if (if_block1) if_block1.m(div6, null);
				append(div7, text16);
				if (if_block2) if_block2.m(div7, null);
				append(div10, text17);
				handsontable._mount(div10, null);
				append(div10, text18);
				append(div10, div9);
				append(div9, button1);
				append(button1, img1);
				append(button1, text19);
				append(button1, text20);
				append(div9, text21);
				append(div9, button2);
				append(button2, i3);
				append(button2, text22);
				append(button2, text23);
				append(button2, text24);
				append(div9, text25);
				append(div9, button3);
				append(button3, i4);
				append(button3, text26);
				append(button3, text27);
				append(button3, text28);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(div1, text0);
				}

				if ((changed.sortBy) && li_class_value !== (li_class_value = '-'==ctx.sortBy?'active':'')) {
					li.className = li_class_value;
				}

				if (changed.columns || changed.sortBy) {
					each_value_1 = ctx.columns;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$3(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}

				if (!input_updating && changed.search) input.value = ctx.search;
				if ((changed.searchResults) && input_class_value !== (input_class_value = "" + (ctx.searchResults.length > 0?'with-results':'') + " search-query" + " svelte-1ymbvw3")) {
					input.className = input_class_value;
				}

				if (ctx.searchResults.length > 0) {
					if (!if_block1) {
						if_block1 = create_if_block_1$5(component);
						if_block1.c();
						if_block1.m(div6, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if ((changed.searchResults) && div6_class_value !== (div6_class_value = ctx.searchResults.length > 0 ? 'input-append' : '')) {
					div6.className = div6_class_value;
				}

				if (ctx.search) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$7(component, ctx);
						if_block2.c();
						if_block2.m(div7, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				var handsontable_changes = {};
				if (!handsontable_updating.data && changed.chartData) {
					handsontable_changes.data = ctx.chartData;
					handsontable_updating.data = ctx.chartData !== void 0;
				}
				if (!handsontable_updating.transpose && changed.transpose) {
					handsontable_changes.transpose = ctx.transpose
	                ;
					handsontable_updating.transpose = ctx.transpose
	                 !== void 0;
				}
				if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
					handsontable_changes.firstRowIsHeader = ctx.firstRowIsHeader
	                ;
					handsontable_updating.firstRowIsHeader = ctx.firstRowIsHeader
	                 !== void 0;
				}
				if (!handsontable_updating.fixedColumnsLeft && changed.fixedColumnsLeft) {
					handsontable_changes.fixedColumnsLeft = ctx.fixedColumnsLeft
	                ;
					handsontable_updating.fixedColumnsLeft = ctx.fixedColumnsLeft
	                 !== void 0;
				}
				if (!handsontable_updating.activeColumn && changed.activeColumn) {
					handsontable_changes.activeColumn = ctx.activeColumn
	                ;
					handsontable_updating.activeColumn = ctx.activeColumn
	                 !== void 0;
				}
				if (!handsontable_updating.readonly && changed.readonly) {
					handsontable_changes.readonly = ctx.readonly
	                ;
					handsontable_updating.readonly = ctx.readonly
	                 !== void 0;
				}
				if (!handsontable_updating.sorting && changed.sorting) {
					handsontable_changes.sorting = ctx.sorting
	                ;
					handsontable_updating.sorting = ctx.sorting
	                 !== void 0;
				}
				if (!handsontable_updating.search && changed.search) {
					handsontable_changes.search = ctx.search
	                ;
					handsontable_updating.search = ctx.search
	                 !== void 0;
				}
				if (!handsontable_updating.searchResults && changed.searchResults) {
					handsontable_changes.searchResults = ctx.searchResults
	                ;
					handsontable_updating.searchResults = ctx.searchResults
	                 !== void 0;
				}
				if (!handsontable_updating.searchIndex && changed.searchIndex) {
					handsontable_changes.searchIndex = ctx.searchIndex
	                ;
					handsontable_updating.searchIndex = ctx.searchIndex
	                 !== void 0;
				}
				if (!handsontable_updating.multiSelection && changed.multiSelection) {
					handsontable_changes.multiSelection = ctx.multiSelection
	                ;
					handsontable_updating.multiSelection = ctx.multiSelection
	                 !== void 0;
				}
				handsontable._set(handsontable_changes);
				handsontable_updating = {};

				if ((changed.has_changes) && button3_class_value !== (button3_class_value = "btn " + (ctx.has_changes?'':'disabled') + " svelte-1ymbvw3")) {
					button3.className = button3_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div12);
				}

				if_block0.d();
				removeListener(a2, "click", click_handler);

				destroyEach(each_blocks, detach);

				if (component.refs.sortDropdownGroup === div4) component.refs.sortDropdownGroup = null;
				removeListener(input, "input", input_input_handler);
				removeListener(input, "keypress", keypress_handler);
				if (component.refs.search === input) component.refs.search = null;
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				handsontable.destroy();
				if (component.refs.hot === handsontable) component.refs.hot = null;
				removeListener(button1, "click", click_handler_3);
				removeListener(button2, "click", click_handler_4);
				removeListener(button3, "click", click_handler_5);
			}
		};
	}

	// (52:16) {:else}
	function create_else_block(component, ctx) {
		var h3, text0_value = __(`Make sure the data looks right`), text0, text1, p, raw_value = __(`describe / data-looks-right`), text2, checkbox_updating = {}, text3, if_block_anchor;

		var checkbox_initial_data = { label: __("First row as label") };
		if (ctx.firstRowIsHeader !== void 0) {
			checkbox_initial_data.value = ctx.firstRowIsHeader;
			checkbox_updating.value = true;
		}
		var checkbox = new Checkbox({
			root: component.root,
			store: component.store,
			data: checkbox_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkbox_updating.value && changed.value) {
					newState.firstRowIsHeader = childState.value;
				}
				component._set(newState);
				checkbox_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkbox._bind({ value: 1 }, checkbox.get());
		});

		var if_block = (ctx.showLocale) && create_if_block_8(component, ctx);

		return {
			c: function create() {
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n\n                ");
				p = createElement("p");
				text2 = createText("\n\n                ");
				checkbox._fragment.c();
				text3 = createText(" ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				h3.className = "first";
				addLoc(h3, file$8, 53, 16, 2097);
				addLoc(p, file$8, 55, 16, 2178);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				insert(target, text1, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text2, anchor);
				checkbox._mount(target, anchor);
				insert(target, text3, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var checkbox_changes = {};
				if (!checkbox_updating.value && changed.firstRowIsHeader) {
					checkbox_changes.value = ctx.firstRowIsHeader;
					checkbox_updating.value = ctx.firstRowIsHeader !== void 0;
				}
				checkbox._set(checkbox_changes);
				checkbox_updating = {};

				if (ctx.showLocale) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_8(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text1);
					detachNode(p);
					detachNode(text2);
				}

				checkbox.destroy(detach);
				if (detach) {
					detachNode(text3);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (35:46) 
	function create_if_block_7(component, ctx) {
		var h3, text0_value = __('describe / show-hide-multi'), text0, text1, ul, li0, button0, i0, text2, text3_value = __('describe / show-selected'), text3, text4, li1, button1, i1, text5, text6_value = __('describe / hide-selected'), text6;

		function click_handler(event) {
			component.hideMultiple(ctx.multiSelection, false);
		}

		function click_handler_1(event) {
			component.hideMultiple(ctx.multiSelection, true);
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n\n                ");
				ul = createElement("ul");
				li0 = createElement("li");
				button0 = createElement("button");
				i0 = createElement("i");
				text2 = createText(" ");
				text3 = createText(text3_value);
				text4 = createText("\n                    ");
				li1 = createElement("li");
				button1 = createElement("button");
				i1 = createElement("i");
				text5 = createText(" ");
				text6 = createText(text6_value);
				h3.className = "first";
				addLoc(h3, file$8, 36, 16, 1375);
				i0.className = "fa fa-eye";
				addLoc(i0, file$8, 41, 28, 1645);
				addListener(button0, "click", click_handler);
				button0.className = "btn";
				addLoc(button0, file$8, 40, 24, 1549);
				setStyle(li0, "margin-bottom", "5px");
				addLoc(li0, file$8, 39, 20, 1492);
				i1.className = "fa fa-eye-slash";
				addLoc(i1, file$8, 46, 28, 1908);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn";
				addLoc(button1, file$8, 45, 24, 1813);
				addLoc(li1, file$8, 44, 20, 1784);
				ul.className = "unstyled";
				addLoc(ul, file$8, 38, 16, 1450);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				insert(target, text1, anchor);
				insert(target, ul, anchor);
				append(ul, li0);
				append(li0, button0);
				append(button0, i0);
				append(button0, text2);
				append(button0, text3);
				append(ul, text4);
				append(ul, li1);
				append(li1, button1);
				append(button1, i1);
				append(button1, text5);
				append(button1, text6);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;

			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text1);
					detachNode(ul);
				}

				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (5:16) {#if activeColumn}
	function create_if_block_2$2(component, ctx) {
		var text, if_block1_anchor;

		function select_block_type_1(ctx) {
			if (ctx.customColumn) return create_if_block_4$1;
			if (ctx.columnFormat) return create_if_block_5;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block0 = current_block_type && current_block_type(component, ctx);

		var if_block1 = (ctx.activeColumn.type() == 'number') && create_if_block_3$1(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText(" ");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if (if_block0) if_block0.d(1);
					if_block0 = current_block_type && current_block_type(component, ctx);
					if (if_block0) if_block0.c();
					if (if_block0) if_block0.m(text.parentNode, text);
				}

				if (ctx.activeColumn.type() == 'number') {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_3$1(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block1) if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (58:96) {#if                 showLocale }
	function create_if_block_8(component, ctx) {
		var h4, text0_value = __(`describe / locale-select / hed`), text0, text1, p, raw_value = __(`describe / locale-select / body`), text2, select, select_updating = false;

		var each_value = ctx.locales;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_1$2(component, get_each_context$2(ctx, each_value, i));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ locale: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				h4 = createElement("h4");
				text0 = createText(text0_value);
				text1 = createText("\n\n                ");
				p = createElement("p");
				text2 = createText("\n\n                ");
				select = createElement("select");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addLoc(h4, file$8, 59, 16, 2375);
				addLoc(p, file$8, 61, 16, 2440);
				addListener(select, "change", select_change_handler);
				if (!('locale' in ctx)) component.root._beforecreate.push(select_change_handler);
				addLoc(select, file$8, 63, 16, 2510);
			},

			m: function mount(target, anchor) {
				insert(target, h4, anchor);
				append(h4, text0);
				insert(target, text1, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text2, anchor);
				insert(target, select, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, ctx.locale);
			},

			p: function update(changed, ctx) {
				if (changed.locales) {
					each_value = ctx.locales;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (!select_updating && changed.locale) selectOption(select, ctx.locale);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h4);
					detachNode(text1);
					detachNode(p);
					detachNode(text2);
					detachNode(select);
				}

				destroyEach(each_blocks, detach);

				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (65:20) {#each locales as locale}
	function create_each_block_1$2(component, ctx) {
		var option, text0_value = ctx.locale.label, text0, text1, text2_value = ctx.locale.value, text2, text3, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text0 = createText(text0_value);
				text1 = createText(" (");
				text2 = createText(text2_value);
				text3 = createText(")");
				option.__value = option_value_value = ctx.locale.value;
				option.value = option.__value;
				addLoc(option, file$8, 65, 20, 2605);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text0);
				append(option, text1);
				append(option, text2);
				append(option, text3);
			},

			p: function update(changed, ctx) {
				if ((changed.locales) && text0_value !== (text0_value = ctx.locale.label)) {
					setData(text0, text0_value);
				}

				if ((changed.locales) && text2_value !== (text2_value = ctx.locale.value)) {
					setData(text2, text2_value);
				}

				if ((changed.locales) && option_value_value !== (option_value_value = ctx.locale.value)) {
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

	// (20:38) 
	function create_if_block_5(component, ctx) {
		var customcolumnformat_updating = {}, text, if_block_anchor;

		var customcolumnformat_initial_data = {};
		if (ctx.columnFormat !== void 0) {
			customcolumnformat_initial_data.column = ctx.columnFormat;
			customcolumnformat_updating.column = true;
		}
		if (ctx.columns
	                 !== void 0) {
			customcolumnformat_initial_data.columns = ctx.columns
	                ;
			customcolumnformat_updating.columns = true;
		}
		var customcolumnformat = new CustomColumnFormat({
			root: component.root,
			store: component.store,
			data: customcolumnformat_initial_data,
			_bind(changed, childState) {
				var newState = {};
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

		component.root._beforecreate.push(() => {
			customcolumnformat._bind({ column: 1, columns: 1 }, customcolumnformat.get());
		});

		customcolumnformat.on("updateTable", function(event) {
			component.refs.hot.update();
		});
		customcolumnformat.on("renderTable", function(event) {
			component.refs.hot.render();
		});

		var if_block = (ctx.columnFormat.isComputed) && create_if_block_6(component);

		return {
			c: function create() {
				customcolumnformat._fragment.c();
				text = createText("\n\n                ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				customcolumnformat._mount(target, anchor);
				insert(target, text, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var customcolumnformat_changes = {};
				if (!customcolumnformat_updating.column && changed.columnFormat) {
					customcolumnformat_changes.column = ctx.columnFormat;
					customcolumnformat_updating.column = ctx.columnFormat !== void 0;
				}
				if (!customcolumnformat_updating.columns && changed.columns) {
					customcolumnformat_changes.columns = ctx.columns
	                ;
					customcolumnformat_updating.columns = ctx.columns
	                 !== void 0;
				}
				customcolumnformat._set(customcolumnformat_changes);
				customcolumnformat_updating = {};

				if (ctx.columnFormat.isComputed) {
					if (!if_block) {
						if_block = create_if_block_6(component);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				customcolumnformat.destroy(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (5:35) {#if customColumn}
	function create_if_block_4$1(component, ctx) {
		var computedcolumneditor_updating = {}, text0, button, text1_value = __('describe / edit-format'), text1;

		var computedcolumneditor_initial_data = {};
		if (ctx.customColumn !== void 0) {
			computedcolumneditor_initial_data.column = ctx.customColumn;
			computedcolumneditor_updating.column = true;
		}
		if (ctx.columns
	                 !== void 0) {
			computedcolumneditor_initial_data.columns = ctx.columns
	                ;
			computedcolumneditor_updating.columns = true;
		}
		var computedcolumneditor = new ComputedColumnEditor({
			root: component.root,
			store: component.store,
			data: computedcolumneditor_initial_data,
			_bind(changed, childState) {
				var newState = {};
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

		component.root._beforecreate.push(() => {
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

		component.refs.ccEd = computedcolumneditor;

		function click_handler(event) {
			component.force(event, true);
		}

		return {
			c: function create() {
				computedcolumneditor._fragment.c();
				text0 = createText("\n\n                ");
				button = createElement("button");
				text1 = createText(text1_value);
				addListener(button, "click", click_handler);
				button.className = "btn";
				addLoc(button, file$8, 15, 16, 519);
			},

			m: function mount(target, anchor) {
				computedcolumneditor._mount(target, anchor);
				insert(target, text0, anchor);
				insert(target, button, anchor);
				append(button, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var computedcolumneditor_changes = {};
				if (!computedcolumneditor_updating.column && changed.customColumn) {
					computedcolumneditor_changes.column = ctx.customColumn;
					computedcolumneditor_updating.column = ctx.customColumn !== void 0;
				}
				if (!computedcolumneditor_updating.columns && changed.columns) {
					computedcolumneditor_changes.columns = ctx.columns
	                ;
					computedcolumneditor_updating.columns = ctx.columns
	                 !== void 0;
				}
				computedcolumneditor._set(computedcolumneditor_changes);
				computedcolumneditor_updating = {};
			},

			d: function destroy(detach) {
				computedcolumneditor.destroy(detach);
				if (component.refs.ccEd === computedcolumneditor) component.refs.ccEd = null;
				if (detach) {
					detachNode(text0);
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (29:16) {#if columnFormat.isComputed}
	function create_if_block_6(component, ctx) {
		var button, i, text0, text1_value = __('describe / edit-formula'), text1;

		function click_handler(event) {
			component.force(event, false);
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				i.className = "fa fa-chevron-left";
				addLoc(i, file$8, 30, 20, 1068);
				addListener(button, "click", click_handler);
				button.className = "btn";
				addLoc(button, file$8, 29, 16, 996);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (33:28) {#if activeColumn.type() == 'number'}
	function create_if_block_3$1(component, ctx) {
		var histogram_updating = {};

		var histogram_initial_data = {};
		if (ctx.activeValues !== void 0) {
			histogram_initial_data.values = ctx.activeValues;
			histogram_updating.values = true;
		}
		if (ctx.activeFormat !== void 0) {
			histogram_initial_data.format = ctx.activeFormat;
			histogram_updating.format = true;
		}
		var histogram = new Histogram({
			root: component.root,
			store: component.store,
			data: histogram_initial_data,
			_bind(changed, childState) {
				var newState = {};
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

		component.root._beforecreate.push(() => {
			histogram._bind({ values: 1, format: 1 }, histogram.get());
		});

		return {
			c: function create() {
				histogram._fragment.c();
			},

			m: function mount(target, anchor) {
				histogram._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var histogram_changes = {};
				if (!histogram_updating.values && changed.activeValues) {
					histogram_changes.values = ctx.activeValues;
					histogram_updating.values = ctx.activeValues !== void 0;
				}
				if (!histogram_updating.format && changed.activeFormat) {
					histogram_changes.format = ctx.activeFormat;
					histogram_updating.format = ctx.activeFormat !== void 0;
				}
				histogram._set(histogram_changes);
				histogram_updating = {};
			},

			d: function destroy(detach) {
				histogram.destroy(detach);
			}
		};
	}

	// (100:28) {#each columns as col}
	function create_each_block$3(component, ctx) {
		var li, a, i0, i0_class_value, text0, i1, i1_class_value, text1, text2_value = ctx.col.title(), text2, a_href_value, li_class_value;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i0 = createElement("i");
				text0 = createText("\n                                    ");
				i1 = createElement("i");
				text1 = createText("   ");
				text2 = createText(text2_value);
				i0._svelte = { component, ctx };

				addListener(i0, "click", click_handler$1);
				i0.className = i0_class_value = "fa fa-sort-" + (ctx.col.type()=='text'?'alpha':'amount') + "-asc fa-fw" + " svelte-1ymbvw3";
				addLoc(i0, file$8, 102, 36, 4424);

				i1._svelte = { component, ctx };

				addListener(i1, "click", click_handler_1);
				i1.className = i1_class_value = "fa fa-sort-" + (ctx.col.type()=='text'?'alpha':'amount') + "-desc fa-fw" + " svelte-1ymbvw3";
				addLoc(i1, file$8, 106, 36, 4693);

				a._svelte = { component, ctx };

				addListener(a, "click", click_handler_2);
				a.href = a_href_value = "#/" + ctx.col.name();
				a.className = "svelte-1ymbvw3";
				addLoc(a, file$8, 101, 32, 4321);
				li.className = li_class_value = ctx.col.name()==ctx.sortBy?'active':'';
				addLoc(li, file$8, 100, 28, 4243);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				append(a, i0);
				append(a, text0);
				append(a, i1);
				append(a, text1);
				append(a, text2);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				i0._svelte.ctx = ctx;
				if ((changed.columns) && i0_class_value !== (i0_class_value = "fa fa-sort-" + (ctx.col.type()=='text'?'alpha':'amount') + "-asc fa-fw" + " svelte-1ymbvw3")) {
					i0.className = i0_class_value;
				}

				i1._svelte.ctx = ctx;
				if ((changed.columns) && i1_class_value !== (i1_class_value = "fa fa-sort-" + (ctx.col.type()=='text'?'alpha':'amount') + "-desc fa-fw" + " svelte-1ymbvw3")) {
					i1.className = i1_class_value;
				}

				if ((changed.columns) && text2_value !== (text2_value = ctx.col.title())) {
					setData(text2, text2_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.columns) && a_href_value !== (a_href_value = "#/" + ctx.col.name())) {
					a.href = a_href_value;
				}

				if ((changed.columns || changed.sortBy) && li_class_value !== (li_class_value = ctx.col.name()==ctx.sortBy?'active':'')) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(i0, "click", click_handler$1);
				removeListener(i1, "click", click_handler_1);
				removeListener(a, "click", click_handler_2);
			}
		};
	}

	// (131:24) {#if searchResults.length > 0}
	function create_if_block_1$5(component, ctx) {
		var div, button0, i0, text, button1, i1;

		function click_handler_3(event) {
			component.nextResult(-1);
		}

		function click_handler_4(event) {
			component.nextResult(+1);
		}

		return {
			c: function create() {
				div = createElement("div");
				button0 = createElement("button");
				i0 = createElement("i");
				text = createText("\n                            ");
				button1 = createElement("button");
				i1 = createElement("i");
				i0.className = "fa fa-chevron-up";
				addLoc(i0, file$8, 133, 32, 6070);
				addListener(button0, "click", click_handler_3);
				button0.className = "btn svelte-1ymbvw3";
				addLoc(button0, file$8, 132, 28, 5991);
				i1.className = "fa fa-chevron-down";
				addLoc(i1, file$8, 136, 32, 6248);
				addListener(button1, "click", click_handler_4);
				button1.className = "btn svelte-1ymbvw3";
				addLoc(button1, file$8, 135, 28, 6169);
				div.className = "btn-group";
				addLoc(div, file$8, 131, 24, 5939);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, button0);
				append(button0, i0);
				append(div, text);
				append(div, button1);
				append(button1, i1);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(button0, "click", click_handler_3);
				removeListener(button1, "click", click_handler_4);
			}
		};
	}

	// (143:20) {#if search}
	function create_if_block$7(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.resultsDisplay);
				div.className = "results svelte-1ymbvw3";
				addLoc(div, file$8, 143, 20, 6463);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.resultsDisplay) {
					setData(text, ctx.resultsDisplay);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
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
		this._state = assign(assign(this.store._init(["dw_chart"]), data$9()), options.data);
		this.store._add(this, ["dw_chart"]);

		this._recompute({ searchIndex: 1, searchResults: 1, activeColumn: 1, forceColumnFormat: 1, $dw_chart: 1, sortBy: 1, sortDir: 1, searchIndexSafe: 1 }, this._state);
		if (!('searchIndex' in this._state)) console.warn("<App> was created without expected data property 'searchIndex'");
		if (!('searchResults' in this._state)) console.warn("<App> was created without expected data property 'searchResults'");
		if (!('activeColumn' in this._state)) console.warn("<App> was created without expected data property 'activeColumn'");
		if (!('forceColumnFormat' in this._state)) console.warn("<App> was created without expected data property 'forceColumnFormat'");
		if (!('$dw_chart' in this._state)) console.warn("<App> was created without expected data property '$dw_chart'");
		if (!('sortBy' in this._state)) console.warn("<App> was created without expected data property 'sortBy'");
		if (!('sortDir' in this._state)) console.warn("<App> was created without expected data property 'sortDir'");






		if (!('multiSelection' in this._state)) console.warn("<App> was created without expected data property 'multiSelection'");
		if (!('firstRowIsHeader' in this._state)) console.warn("<App> was created without expected data property 'firstRowIsHeader'");
		if (!('showLocale' in this._state)) console.warn("<App> was created without expected data property 'showLocale'");
		if (!('locale' in this._state)) console.warn("<App> was created without expected data property 'locale'");
		if (!('locales' in this._state)) console.warn("<App> was created without expected data property 'locales'");
		if (!('search' in this._state)) console.warn("<App> was created without expected data property 'search'");

		if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
		if (!('transpose' in this._state)) console.warn("<App> was created without expected data property 'transpose'");
		if (!('fixedColumnsLeft' in this._state)) console.warn("<App> was created without expected data property 'fixedColumnsLeft'");
		if (!('readonly' in this._state)) console.warn("<App> was created without expected data property 'readonly'");

		if (!('has_changes' in this._state)) console.warn("<App> was created without expected data property 'has_changes'");
		this._intro = true;
		this._handlers.update = [onupdate];

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$9(this, this._state);

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

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$5);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('searchIndexSafe' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'searchIndexSafe'");
		if ('customColumn' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'customColumn'");
		if ('columnFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columnFormat'");
		if ('activeValues' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'activeValues'");
		if ('activeFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'activeFormat'");
		if ('columns' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columns'");
		if ('sorting' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'sorting'");
		if ('resultsDisplay' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'resultsDisplay'");
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

		if (changed.searchResults || changed.searchIndexSafe) {
			if (this._differs(state.resultsDisplay, (state.resultsDisplay = resultsDisplay(state)))) changed.resultsDisplay = true;
		}
	};

	function Store(state, options) {
		this._handlers = {};
		this._dependents = [];

		this._computed = blankObject();
		this._sortedComputedProperties = [];

		this._state = assign({}, state);
		this._differs = options && options.immutable ? _differsImmutable : _differs;
	}

	assign(Store.prototype, {
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
			this._state = assign(assign({}, previous), newState);

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
			const visited = blankObject();
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

			const state = assign({}, this._state);
			const changed = {};
			c.update(state, changed, true);
			this._set(state, changed);
		},

		fire,

		get,

		on,

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

	const store = new Store({});

	const data$a = {
	    chart: {
	        id: ''
	    },
	    readonly: false,
	    chartData: '',
	    transpose: false,
	    firstRowIsHeader: true,
	    skipRows: 0
	};

	var main = { App, data: data$a, store };

	return main;

}));
//# sourceMappingURL=describe.js.map
=======
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("cm/lib/codemirror"),require("cm/mode/javascript/javascript"),require("cm/addon/mode/simple"),require("cm/addon/hint/show-hint"),require("cm/addon/edit/matchbrackets"),require("cm/addon/display/placeholder"),require("Handsontable")):"function"==typeof define&&define.amd?define("svelte/describe",["cm/lib/codemirror","cm/mode/javascript/javascript","cm/addon/mode/simple","cm/addon/hint/show-hint","cm/addon/edit/matchbrackets","cm/addon/display/placeholder","Handsontable"],e):(t=t||self).describe=e(t.CodeMirror,null,null,null,null,null,t.HOT)}(this,(function(t,e,n,r,o,i,a){"use strict";t=t&&t.hasOwnProperty("default")?t.default:t,a=a&&a.hasOwnProperty("default")?a.default:a;var s="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function u(t,e,n){return t(n={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&n.path)}},n.exports),n.exports}var c=u((function(t){function e(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=e=function(t){return typeof t}:t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(n)}t.exports=e}));var l=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r};var f=function(t){if(Array.isArray(t))return l(t)};var h=function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)};var p=function(t,e){if(t){if("string"==typeof t)return l(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?l(t,e):void 0}};var d=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var m=function(t){return f(t)||h(t)||p(t)||d()};var v=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t};function g(){}function y(t,e){for(var n in e)t[n]=e[n];return t}function b(t,e){for(var n in e)t[n]=1;return t}function w(t){t()}function _(t,e){t.appendChild(e)}function x(t,e,n){t.insertBefore(e,n)}function N(t){t.parentNode.removeChild(t)}function E(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function k(){return document.createDocumentFragment()}function O(t){return document.createElement(t)}function A(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function M(t){return document.createTextNode(t)}function C(){return document.createComment("")}function S(t,e,n,r){t.addEventListener(e,n,r)}function T(t,e,n,r){t.removeEventListener(e,n,r)}function R(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function I(t,e){t.data=""+e}function L(t,e,n){t.style.setProperty(e,n)}function j(t,e){for(var n=0;n<t.options.length;n+=1){var r=t.options[n];if(r.__value===e)return void(r.selected=!0)}}function F(t){var e=t.querySelector(":checked")||t.options[0];return e&&e.__value}function D(t,e,n){t.classList[n?"add":"remove"](e)}function P(t){return t}function H(t,e,n,r,o){var i,a,s,u=n.call(t,e,r),c=!1;return{t:o?0:1,running:!1,program:null,pending:null,run:function(t,e){var n=this;"function"==typeof u?B.wait().then((function(){u=u(),n._run(t,e)})):this._run(t,e)},_run:function(t,n){i=u.duration||300,a=u.easing||P;var r={start:window.performance.now()+(u.delay||0),b:t,callback:n||g};o&&!c&&(u.css&&u.delay&&(s=e.style.cssText,e.style.cssText+=u.css(0,1)),u.tick&&u.tick(0,1),c=!0),t||(r.group=U.current,U.current.remaining+=1),u.delay?this.pending=r:this.start(r),this.running||(this.running=!0,B.add(this))},start:function(n){if(t.fire("".concat(n.b?"intro":"outro",".start"),{node:e}),n.a=this.t,n.delta=n.b-n.a,n.duration=i*Math.abs(n.b-n.a),n.end=n.start+n.duration,u.css){u.delay&&(e.style.cssText=s);var r=function(t,e,n){for(var r=t.a,o=t.b,i=t.delta,a=16.666/t.duration,s="{\n",u=0;u<=1;u+=a){var c=r+i*e(u);s+=100*u+"%{".concat(n(c,1-c),"}\n")}return s+"100% {".concat(n(o,1-o),"}\n}")}(n,a,u.css);B.addRule(r,n.name="__svelte_"+function(t){for(var e=5381,n=t.length;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(r)),e.style.animation=(e.style.animation||"").split(", ").filter((function(t){return t&&(n.delta<0||!/__svelte/.test(t))})).concat("".concat(n.name," ").concat(n.duration,"ms linear 1 forwards")).join(", ")}this.program=n,this.pending=null},update:function(t){var e=this.program;if(e){var n=t-e.start;this.t=e.a+e.delta*a(n/e.duration),u.tick&&u.tick(this.t,1-this.t)}},done:function(){var n=this.program;this.t=n.b,u.tick&&u.tick(this.t,1-this.t),t.fire("".concat(n.b?"intro":"outro",".end"),{node:e}),n.b||n.invalidated?u.css&&B.deleteRule(e,n.name):(n.group.callbacks.push((function(){n.callback(),u.css&&B.deleteRule(e,n.name)})),0==--n.group.remaining&&n.group.callbacks.forEach(w)),this.running=!!this.pending},abort:function(t){this.program&&(t&&u.tick&&u.tick(1,0),u.css&&B.deleteRule(e,this.program.name),this.program=this.pending=null,this.running=!1)},invalidate:function(){this.program&&(this.program.invalidated=!0)}}}var U={};var B={running:!1,transitions:[],bound:null,stylesheet:null,activeRules:{},promise:null,add:function(t){this.transitions.push(t),this.running||(this.running=!0,requestAnimationFrame(this.bound||(this.bound=this.next.bind(this))))},addRule:function(t,e){if(!this.stylesheet){var n=O("style");document.head.appendChild(n),B.stylesheet=n.sheet}this.activeRules[e]||(this.activeRules[e]=!0,this.stylesheet.insertRule("@keyframes ".concat(e," ").concat(t),this.stylesheet.cssRules.length))},next:function(){this.running=!1;for(var t=window.performance.now(),e=this.transitions.length;e--;){var n=this.transitions[e];n.program&&t>=n.program.end&&n.done(),n.pending&&t>=n.pending.start&&n.start(n.pending),n.running?(n.update(t),this.running=!0):n.pending||this.transitions.splice(e,1)}if(this.running)requestAnimationFrame(this.bound);else if(this.stylesheet){for(var r=this.stylesheet.cssRules.length;r--;)this.stylesheet.deleteRule(r);this.activeRules={}}},deleteRule:function(t,e){t.style.animation=t.style.animation.split(", ").filter((function(t){return t&&-1===t.indexOf(e)})).join(", ")},wait:function(){return B.promise||(B.promise=Promise.resolve(),B.promise.then((function(){B.promise=null}))),B.promise}};function V(){return Object.create(null)}function $(t,e){return t!=t?e==e:t!==e||t&&"object"===c(t)||"function"==typeof t}function W(t,e){return t!=t?e==e:t!==e}function z(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var r=0;r<n.length;r+=1){var o=n[r];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}}function q(t){t._lock=!0,X(t._beforecreate),X(t._oncreate),X(t._aftercreate),t._lock=!1}function G(){return this._state}function Y(t,e){t._handlers=V(),t._slots=V(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function K(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}}function X(t){for(;t&&t.length;)t.shift()()}function J(){this.store._remove(this)}var Z={destroy:function(t){this.destroy=g,this.fire("destroy"),this.set=g,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:G,fire:z,on:K,set:function(t){this._set(y({},t)),this.root._lock||q(this.root)},_recompute:g,_set:function(t){var e=this._state,n={},r=!1;for(var o in t=y(this._staged,t),this._staged={},t)this._differs(t[o],e[o])&&(n[o]=r=!0);r&&(this._state=y(y({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){y(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:$};var Q=function(t){if(Array.isArray(t))return t};var tt=function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}return n}};var et=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var nt=function(t,e){return Q(t)||tt(t,e)||p(t,e)||et()};var rt=function(t){var e=c(t);return null!=t&&("object"==e||"function"==e)},ot="object"==c(s)&&s&&s.Object===Object&&s,it="object"==("undefined"==typeof self?"undefined":c(self))&&self&&self.Object===Object&&self,at=ot||it||Function("return this")(),st=function(){return at.Date.now()},ut=at.Symbol,ct=Object.prototype,lt=ct.hasOwnProperty,ft=ct.toString,ht=ut?ut.toStringTag:void 0;var pt=function(t){var e=lt.call(t,ht),n=t[ht];try{t[ht]=void 0;var r=!0}catch(t){}var o=ft.call(t);return r&&(e?t[ht]=n:delete t[ht]),o},dt=Object.prototype.toString;var mt=function(t){return dt.call(t)},vt=ut?ut.toStringTag:void 0;var gt=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":vt&&vt in Object(t)?pt(t):mt(t)};var yt=function(t){return null!=t&&"object"==c(t)};var bt=function(t){return"symbol"==c(t)||yt(t)&&"[object Symbol]"==gt(t)},wt=/^\s+|\s+$/g,_t=/^[-+]0x[0-9a-f]+$/i,xt=/^0b[01]+$/i,Nt=/^0o[0-7]+$/i,Et=parseInt;var kt=function(t){if("number"==typeof t)return t;if(bt(t))return NaN;if(rt(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=rt(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(wt,"");var n=xt.test(t);return n||Nt.test(t)?Et(t.slice(2),n?2:8):_t.test(t)?NaN:+t},Ot=Math.max,At=Math.min;var Mt=function(t,e,n){var r,o,i,a,s,u,c=0,l=!1,f=!1,h=!0;if("function"!=typeof t)throw new TypeError("Expected a function");function p(e){var n=r,i=o;return r=o=void 0,c=e,a=t.apply(i,n)}function d(t){return c=t,s=setTimeout(v,e),l?p(t):a}function m(t){var n=t-u;return void 0===u||n>=e||n<0||f&&t-c>=i}function v(){var t=st();if(m(t))return g(t);s=setTimeout(v,function(t){var n=e-(t-u);return f?At(n,i-(t-c)):n}(t))}function g(t){return s=void 0,h&&r?p(t):(r=o=void 0,a)}function y(){var t=st(),n=m(t);if(r=arguments,o=this,u=t,n){if(void 0===s)return d(u);if(f)return clearTimeout(s),s=setTimeout(v,e),p(u)}return void 0===s&&(s=setTimeout(v,e)),a}return e=kt(e)||0,rt(n)&&(l=!!n.leading,i=(f="maxWait"in n)?Ot(kt(n.maxWait)||0,e):i,h="trailing"in n?!!n.trailing:h),y.cancel=function(){void 0!==s&&clearTimeout(s),c=0,r=u=o=s=void 0},y.flush=function(){return void 0===s?a:g(st())},y};var Ct,St=function(t){if(!rt(t))return!1;var e=gt(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e},Tt=at["__core-js_shared__"],Rt=(Ct=/[^.]+$/.exec(Tt&&Tt.keys&&Tt.keys.IE_PROTO||""))?"Symbol(src)_1."+Ct:"";var It=function(t){return!!Rt&&Rt in t},Lt=Function.prototype.toString;var jt=function(t){if(null!=t){try{return Lt.call(t)}catch(t){}try{return t+""}catch(t){}}return""},Ft=/^\[object .+?Constructor\]$/,Dt=Function.prototype,Pt=Object.prototype,Ht=Dt.toString,Ut=Pt.hasOwnProperty,Bt=RegExp("^"+Ht.call(Ut).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var Vt=function(t){return!(!rt(t)||It(t))&&(St(t)?Bt:Ft).test(jt(t))};var $t=function(t,e){return null==t?void 0:t[e]};var Wt=function(t,e){var n=$t(t,e);return Vt(n)?n:void 0},zt=function(){try{var t=Wt(Object,"defineProperty");return t({},"",{}),t}catch(t){}}();var qt=function(t,e,n){"__proto__"==e&&zt?zt(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n};var Gt=function(t,e,n,r){for(var o=-1,i=null==t?0:t.length;++o<i;){var a=t[o];e(r,a,n(a),t)}return r};var Yt=function(t){return function(e,n,r){for(var o=-1,i=Object(e),a=r(e),s=a.length;s--;){var u=a[t?s:++o];if(!1===n(i[u],u,i))break}return e}}();var Kt=function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r};var Xt=function(t){return yt(t)&&"[object Arguments]"==gt(t)},Jt=Object.prototype,Zt=Jt.hasOwnProperty,Qt=Jt.propertyIsEnumerable,te=Xt(function(){return arguments}())?Xt:function(t){return yt(t)&&Zt.call(t,"callee")&&!Qt.call(t,"callee")},ee=Array.isArray;var ne=function(){return!1},re=u((function(t,e){var n=e&&!e.nodeType&&e,r=n&&t&&!t.nodeType&&t,o=r&&r.exports===n?at.Buffer:void 0,i=(o?o.isBuffer:void 0)||ne;t.exports=i})),oe=/^(?:0|[1-9]\d*)$/;var ie=function(t,e){var n=c(t);return!!(e=null==e?9007199254740991:e)&&("number"==n||"symbol"!=n&&oe.test(t))&&t>-1&&t%1==0&&t<e};var ae=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991},se={};se["[object Float32Array]"]=se["[object Float64Array]"]=se["[object Int8Array]"]=se["[object Int16Array]"]=se["[object Int32Array]"]=se["[object Uint8Array]"]=se["[object Uint8ClampedArray]"]=se["[object Uint16Array]"]=se["[object Uint32Array]"]=!0,se["[object Arguments]"]=se["[object Array]"]=se["[object ArrayBuffer]"]=se["[object Boolean]"]=se["[object DataView]"]=se["[object Date]"]=se["[object Error]"]=se["[object Function]"]=se["[object Map]"]=se["[object Number]"]=se["[object Object]"]=se["[object RegExp]"]=se["[object Set]"]=se["[object String]"]=se["[object WeakMap]"]=!1;var ue=function(t){return yt(t)&&ae(t.length)&&!!se[gt(t)]};var ce=function(t){return function(e){return t(e)}},le=u((function(t,e){var n=e&&!e.nodeType&&e,r=n&&t&&!t.nodeType&&t,o=r&&r.exports===n&&ot.process,i=function(){try{var t=r&&r.require&&r.require("util").types;return t||o&&o.binding&&o.binding("util")}catch(t){}}();t.exports=i})),fe=le&&le.isTypedArray,he=fe?ce(fe):ue,pe=Object.prototype.hasOwnProperty;var de=function(t,e){var n=ee(t),r=!n&&te(t),o=!n&&!r&&re(t),i=!n&&!r&&!o&&he(t),a=n||r||o||i,s=a?Kt(t.length,String):[],u=s.length;for(var c in t)!e&&!pe.call(t,c)||a&&("length"==c||o&&("offset"==c||"parent"==c)||i&&("buffer"==c||"byteLength"==c||"byteOffset"==c)||ie(c,u))||s.push(c);return s},me=Object.prototype;var ve=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||me)};var ge=function(t,e){return function(n){return t(e(n))}}(Object.keys,Object),ye=Object.prototype.hasOwnProperty;var be=function(t){if(!ve(t))return ge(t);var e=[];for(var n in Object(t))ye.call(t,n)&&"constructor"!=n&&e.push(n);return e};var we=function(t){return null!=t&&ae(t.length)&&!St(t)};var _e=function(t){return we(t)?de(t):be(t)};var xe=function(t,e){return function(n,r){if(null==n)return n;if(!we(n))return t(n,r);for(var o=n.length,i=e?o:-1,a=Object(n);(e?i--:++i<o)&&!1!==r(a[i],i,a););return n}}((function(t,e){return t&&Yt(t,e,_e)}));var Ne=function(t,e,n,r){return xe(t,(function(t,o,i){e(r,t,n(t),i)})),r};var Ee=function(){this.__data__=[],this.size=0};var ke=function(t,e){return t===e||t!=t&&e!=e};var Oe=function(t,e){for(var n=t.length;n--;)if(ke(t[n][0],e))return n;return-1},Ae=Array.prototype.splice;var Me=function(t){var e=this.__data__,n=Oe(e,t);return!(n<0)&&(n==e.length-1?e.pop():Ae.call(e,n,1),--this.size,!0)};var Ce=function(t){var e=this.__data__,n=Oe(e,t);return n<0?void 0:e[n][1]};var Se=function(t){return Oe(this.__data__,t)>-1};var Te=function(t,e){var n=this.__data__,r=Oe(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this};function Re(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}Re.prototype.clear=Ee,Re.prototype.delete=Me,Re.prototype.get=Ce,Re.prototype.has=Se,Re.prototype.set=Te;var Ie=Re;var Le=function(){this.__data__=new Ie,this.size=0};var je=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n};var Fe=function(t){return this.__data__.get(t)};var De=function(t){return this.__data__.has(t)},Pe=Wt(at,"Map"),He=Wt(Object,"create");var Ue=function(){this.__data__=He?He(null):{},this.size=0};var Be=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},Ve=Object.prototype.hasOwnProperty;var $e=function(t){var e=this.__data__;if(He){var n=e[t];return"__lodash_hash_undefined__"===n?void 0:n}return Ve.call(e,t)?e[t]:void 0},We=Object.prototype.hasOwnProperty;var ze=function(t){var e=this.__data__;return He?void 0!==e[t]:We.call(e,t)};var qe=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=He&&void 0===e?"__lodash_hash_undefined__":e,this};function Ge(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}Ge.prototype.clear=Ue,Ge.prototype.delete=Be,Ge.prototype.get=$e,Ge.prototype.has=ze,Ge.prototype.set=qe;var Ye=Ge;var Ke=function(){this.size=0,this.__data__={hash:new Ye,map:new(Pe||Ie),string:new Ye}};var Xe=function(t){var e=c(t);return"string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t};var Je=function(t,e){var n=t.__data__;return Xe(e)?n["string"==typeof e?"string":"hash"]:n.map};var Ze=function(t){var e=Je(this,t).delete(t);return this.size-=e?1:0,e};var Qe=function(t){return Je(this,t).get(t)};var tn=function(t){return Je(this,t).has(t)};var en=function(t,e){var n=Je(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this};function nn(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}nn.prototype.clear=Ke,nn.prototype.delete=Ze,nn.prototype.get=Qe,nn.prototype.has=tn,nn.prototype.set=en;var rn=nn;var on=function(t,e){var n=this.__data__;if(n instanceof Ie){var r=n.__data__;if(!Pe||r.length<199)return r.push([t,e]),this.size=++n.size,this;n=this.__data__=new rn(r)}return n.set(t,e),this.size=n.size,this};function an(t){var e=this.__data__=new Ie(t);this.size=e.size}an.prototype.clear=Le,an.prototype.delete=je,an.prototype.get=Fe,an.prototype.has=De,an.prototype.set=on;var sn=an;var un=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this};var cn=function(t){return this.__data__.has(t)};function ln(t){var e=-1,n=null==t?0:t.length;for(this.__data__=new rn;++e<n;)this.add(t[e])}ln.prototype.add=ln.prototype.push=un,ln.prototype.has=cn;var fn=ln;var hn=function(t,e){for(var n=-1,r=null==t?0:t.length;++n<r;)if(e(t[n],n,t))return!0;return!1};var pn=function(t,e){return t.has(e)};var dn=function(t,e,n,r,o,i){var a=1&n,s=t.length,u=e.length;if(s!=u&&!(a&&u>s))return!1;var c=i.get(t);if(c&&i.get(e))return c==e;var l=-1,f=!0,h=2&n?new fn:void 0;for(i.set(t,e),i.set(e,t);++l<s;){var p=t[l],d=e[l];if(r)var m=a?r(d,p,l,e,t,i):r(p,d,l,t,e,i);if(void 0!==m){if(m)continue;f=!1;break}if(h){if(!hn(e,(function(t,e){if(!pn(h,e)&&(p===t||o(p,t,n,r,i)))return h.push(e)}))){f=!1;break}}else if(p!==d&&!o(p,d,n,r,i)){f=!1;break}}return i.delete(t),i.delete(e),f},mn=at.Uint8Array;var vn=function(t){var e=-1,n=Array(t.size);return t.forEach((function(t,r){n[++e]=[r,t]})),n};var gn=function(t){var e=-1,n=Array(t.size);return t.forEach((function(t){n[++e]=t})),n},yn=ut?ut.prototype:void 0,bn=yn?yn.valueOf:void 0;var wn=function(t,e,n,r,o,i,a){switch(n){case"[object DataView]":if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case"[object ArrayBuffer]":return!(t.byteLength!=e.byteLength||!i(new mn(t),new mn(e)));case"[object Boolean]":case"[object Date]":case"[object Number]":return ke(+t,+e);case"[object Error]":return t.name==e.name&&t.message==e.message;case"[object RegExp]":case"[object String]":return t==e+"";case"[object Map]":var s=vn;case"[object Set]":var u=1&r;if(s||(s=gn),t.size!=e.size&&!u)return!1;var c=a.get(t);if(c)return c==e;r|=2,a.set(t,e);var l=dn(s(t),s(e),r,o,i,a);return a.delete(t),l;case"[object Symbol]":if(bn)return bn.call(t)==bn.call(e)}return!1};var _n=function(t,e){for(var n=-1,r=e.length,o=t.length;++n<r;)t[o+n]=e[n];return t};var xn=function(t,e,n){var r=e(t);return ee(t)?r:_n(r,n(t))};var Nn=function(t,e){for(var n=-1,r=null==t?0:t.length,o=0,i=[];++n<r;){var a=t[n];e(a,n,t)&&(i[o++]=a)}return i};var En=function(){return[]},kn=Object.prototype.propertyIsEnumerable,On=Object.getOwnPropertySymbols,An=On?function(t){return null==t?[]:(t=Object(t),Nn(On(t),(function(e){return kn.call(t,e)})))}:En;var Mn=function(t){return xn(t,_e,An)},Cn=Object.prototype.hasOwnProperty;var Sn=function(t,e,n,r,o,i){var a=1&n,s=Mn(t),u=s.length;if(u!=Mn(e).length&&!a)return!1;for(var c=u;c--;){var l=s[c];if(!(a?l in e:Cn.call(e,l)))return!1}var f=i.get(t);if(f&&i.get(e))return f==e;var h=!0;i.set(t,e),i.set(e,t);for(var p=a;++c<u;){var d=t[l=s[c]],m=e[l];if(r)var v=a?r(m,d,l,e,t,i):r(d,m,l,t,e,i);if(!(void 0===v?d===m||o(d,m,n,r,i):v)){h=!1;break}p||(p="constructor"==l)}if(h&&!p){var g=t.constructor,y=e.constructor;g!=y&&"constructor"in t&&"constructor"in e&&!("function"==typeof g&&g instanceof g&&"function"==typeof y&&y instanceof y)&&(h=!1)}return i.delete(t),i.delete(e),h},Tn=Wt(at,"DataView"),Rn=Wt(at,"Promise"),In=Wt(at,"Set"),Ln=Wt(at,"WeakMap"),jn=jt(Tn),Fn=jt(Pe),Dn=jt(Rn),Pn=jt(In),Hn=jt(Ln),Un=gt;(Tn&&"[object DataView]"!=Un(new Tn(new ArrayBuffer(1)))||Pe&&"[object Map]"!=Un(new Pe)||Rn&&"[object Promise]"!=Un(Rn.resolve())||In&&"[object Set]"!=Un(new In)||Ln&&"[object WeakMap]"!=Un(new Ln))&&(Un=function(t){var e=gt(t),n="[object Object]"==e?t.constructor:void 0,r=n?jt(n):"";if(r)switch(r){case jn:return"[object DataView]";case Fn:return"[object Map]";case Dn:return"[object Promise]";case Pn:return"[object Set]";case Hn:return"[object WeakMap]"}return e});var Bn=Un,Vn=Object.prototype.hasOwnProperty;var $n=function(t,e,n,r,o,i){var a=ee(t),s=ee(e),u=a?"[object Array]":Bn(t),c=s?"[object Array]":Bn(e),l="[object Object]"==(u="[object Arguments]"==u?"[object Object]":u),f="[object Object]"==(c="[object Arguments]"==c?"[object Object]":c),h=u==c;if(h&&re(t)){if(!re(e))return!1;a=!0,l=!1}if(h&&!l)return i||(i=new sn),a||he(t)?dn(t,e,n,r,o,i):wn(t,e,u,n,r,o,i);if(!(1&n)){var p=l&&Vn.call(t,"__wrapped__"),d=f&&Vn.call(e,"__wrapped__");if(p||d){var m=p?t.value():t,v=d?e.value():e;return i||(i=new sn),o(m,v,n,r,i)}}return!!h&&(i||(i=new sn),Sn(t,e,n,r,o,i))};var Wn=function t(e,n,r,o,i){return e===n||(null==e||null==n||!yt(e)&&!yt(n)?e!=e&&n!=n:$n(e,n,r,o,t,i))};var zn=function(t,e,n,r){var o=n.length,i=o,a=!r;if(null==t)return!i;for(t=Object(t);o--;){var s=n[o];if(a&&s[2]?s[1]!==t[s[0]]:!(s[0]in t))return!1}for(;++o<i;){var u=(s=n[o])[0],c=t[u],l=s[1];if(a&&s[2]){if(void 0===c&&!(u in t))return!1}else{var f=new sn;if(r)var h=r(c,l,u,t,e,f);if(!(void 0===h?Wn(l,c,3,r,f):h))return!1}}return!0};var qn=function(t){return t==t&&!rt(t)};var Gn=function(t){for(var e=_e(t),n=e.length;n--;){var r=e[n],o=t[r];e[n]=[r,o,qn(o)]}return e};var Yn=function(t,e){return function(n){return null!=n&&(n[t]===e&&(void 0!==e||t in Object(n)))}};var Kn=function(t){var e=Gn(t);return 1==e.length&&e[0][2]?Yn(e[0][0],e[0][1]):function(n){return n===t||zn(n,t,e)}},Xn=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Jn=/^\w*$/;var Zn=function(t,e){if(ee(t))return!1;var n=c(t);return!("number"!=n&&"symbol"!=n&&"boolean"!=n&&null!=t&&!bt(t))||(Jn.test(t)||!Xn.test(t)||null!=e&&t in Object(e))};function Qn(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError("Expected a function");var n=function n(){var r=arguments,o=e?e.apply(this,r):r[0],i=n.cache;if(i.has(o))return i.get(o);var a=t.apply(this,r);return n.cache=i.set(o,a)||i,a};return n.cache=new(Qn.Cache||rn),n}Qn.Cache=rn;var tr=Qn;var er=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,nr=/\\(\\)?/g,rr=function(t){var e=tr(t,(function(t){return 500===n.size&&n.clear(),t})),n=e.cache;return e}((function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(er,(function(t,n,r,o){e.push(r?o.replace(nr,"$1"):n||t)})),e}));var or=function(t,e){for(var n=-1,r=null==t?0:t.length,o=Array(r);++n<r;)o[n]=e(t[n],n,t);return o},ir=ut?ut.prototype:void 0,ar=ir?ir.toString:void 0;var sr=function t(e){if("string"==typeof e)return e;if(ee(e))return or(e,t)+"";if(bt(e))return ar?ar.call(e):"";var n=e+"";return"0"==n&&1/e==-1/0?"-0":n};var ur=function(t){return null==t?"":sr(t)};var cr=function(t,e){return ee(t)?t:Zn(t,e)?[t]:rr(ur(t))};var lr=function(t){if("string"==typeof t||bt(t))return t;var e=t+"";return"0"==e&&1/t==-1/0?"-0":e};var fr=function(t,e){for(var n=0,r=(e=cr(e,t)).length;null!=t&&n<r;)t=t[lr(e[n++])];return n&&n==r?t:void 0};var hr=function(t,e,n){var r=null==t?void 0:fr(t,e);return void 0===r?n:r};var pr=function(t,e){return null!=t&&e in Object(t)};var dr=function(t,e,n){for(var r=-1,o=(e=cr(e,t)).length,i=!1;++r<o;){var a=lr(e[r]);if(!(i=null!=t&&n(t,a)))break;t=t[a]}return i||++r!=o?i:!!(o=null==t?0:t.length)&&ae(o)&&ie(a,o)&&(ee(t)||te(t))};var mr=function(t,e){return null!=t&&dr(t,e,pr)};var vr=function(t,e){return Zn(t)&&qn(e)?Yn(lr(t),e):function(n){var r=hr(n,t);return void 0===r&&r===e?mr(n,t):Wn(e,r,3)}};var gr=function(t){return t};var yr=function(t){return function(e){return null==e?void 0:e[t]}};var br=function(t){return function(e){return fr(e,t)}};var wr=function(t){return Zn(t)?yr(lr(t)):br(t)};var _r=function(t){return"function"==typeof t?t:null==t?gr:"object"==c(t)?ee(t)?vr(t[0],t[1]):Kn(t):wr(t)};var xr=function(t,e){return function(n,r){var o=ee(n)?Gt:Ne,i=e?e():{};return o(n,t,_r(r),i)}},Nr=Object.prototype.hasOwnProperty,Er=xr((function(t,e,n){Nr.call(t,n)?t[n].push(e):qt(t,n,[e])}));function kr(t){if(!t||"object"!==c(t))return t;try{return JSON.parse(JSON.stringify(t))}catch(e){return t}}var Or={};function Ar(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(Or[t]=window.__dw.vis.meta.locale||{}):Or[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function Mr(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),Or[n]||Ar(n),!Or[n][t])return"MISSING:"+t;var r=Or[n][t];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),r}var Cr=u((function(t){function e(n,r){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},e(n,r)}t.exports=e}));var Sr=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}},Tr=u((function(t){function e(n,r,o){return Sr()?t.exports=e=Reflect.construct:t.exports=e=function(t,e,n){var r=[null];r.push.apply(r,e);var o=new(Function.bind.apply(t,r));return n&&Cr(o,n.prototype),o},e.apply(null,arguments)}t.exports=e})),Rr="TOP",Ir="TPAREN";function Lr(t,e,n){this.type=t,this.value=e,this.index=n}function jr(t,e){this.pos=0,this.current=null,this.unaryOps=t.unaryOps,this.binaryOps=t.binaryOps,this.ternaryOps=t.ternaryOps,this.consts=t.consts,this.expression=e,this.savedPosition=0,this.savedCurrent=null,this.options=t.options,this.parser=t}Lr.prototype.toString=function(){return this.type+": "+this.value},jr.prototype.newToken=function(t,e,n){return new Lr(t,e,null!=n?n:this.pos)},jr.prototype.save=function(){this.savedPosition=this.pos,this.savedCurrent=this.current},jr.prototype.restore=function(){this.pos=this.savedPosition,this.current=this.savedCurrent},jr.prototype.next=function(){return this.pos>=this.expression.length?this.newToken("TEOF","EOF"):this.isWhitespace()||this.isComment()?this.next():this.isRadixInteger()||this.isNumber()||this.isOperator()||this.isString()||this.isParen()||this.isBracket()||this.isComma()||this.isSemicolon()||this.isNamedOp()||this.isConst()||this.isName()?this.current:void this.parseError('Unknown character "'+this.expression.charAt(this.pos)+'"')},jr.prototype.isString=function(){var t=!1,e=this.pos,n=this.expression.charAt(e);if("'"===n||'"'===n)for(var r=this.expression.indexOf(n,e+1);r>=0&&this.pos<this.expression.length;){if(this.pos=r+1,"\\"!==this.expression.charAt(r-1)){var o=this.expression.substring(e+1,r);this.current=this.newToken("TSTRING",this.unescape(o),e),t=!0;break}r=this.expression.indexOf(n,r+1)}return t},jr.prototype.isParen=function(){var t=this.expression.charAt(this.pos);return("("===t||")"===t)&&(this.current=this.newToken(Ir,t),this.pos++,!0)},jr.prototype.isBracket=function(){var t=this.expression.charAt(this.pos);return!("["!==t&&"]"!==t||!this.isOperatorEnabled("["))&&(this.current=this.newToken("TBRACKET",t),this.pos++,!0)},jr.prototype.isComma=function(){return","===this.expression.charAt(this.pos)&&(this.current=this.newToken("TCOMMA",","),this.pos++,!0)},jr.prototype.isSemicolon=function(){return";"===this.expression.charAt(this.pos)&&(this.current=this.newToken("TSEMICOLON",";"),this.pos++,!0)},jr.prototype.isConst=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||"_"!==n&&"."!==n&&(n<"0"||n>"9")))break}if(e>t){var r=this.expression.substring(t,e);if(r in this.consts)return this.current=this.newToken("TNUMBER",this.consts[r]),this.pos+=r.length,!0}return!1},jr.prototype.isNamedOp=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||"_"!==n&&(n<"0"||n>"9")))break}if(e>t){var r=this.expression.substring(t,e);if(this.isOperatorEnabled(r)&&(r in this.binaryOps||r in this.unaryOps||r in this.ternaryOps))return this.current=this.newToken(Rr,r),this.pos+=r.length,!0}return!1},jr.prototype.isName=function(){for(var t=this.pos,e=t,n=!1;e<this.expression.length;e++){var r=this.expression.charAt(e);if(r.toUpperCase()===r.toLowerCase()){if(e===this.pos&&("$"===r||"_"===r)){"_"===r&&(n=!0);continue}if(e===this.pos||!n||"_"!==r&&(r<"0"||r>"9"))break}else n=!0}if(n){var o=this.expression.substring(t,e);return this.current=this.newToken("TNAME",o),this.pos+=o.length,!0}return!1},jr.prototype.isWhitespace=function(){for(var t=!1,e=this.expression.charAt(this.pos);!(" "!==e&&"\t"!==e&&"\n"!==e&&"\r"!==e||(t=!0,this.pos++,this.pos>=this.expression.length));)e=this.expression.charAt(this.pos);return t};var Fr=/^[0-9a-f]{4}$/i;jr.prototype.unescape=function(t){var e=t.indexOf("\\");if(e<0)return t;for(var n=t.substring(0,e);e>=0;){var r=t.charAt(++e);switch(r){case"'":n+="'";break;case'"':n+='"';break;case"\\":n+="\\";break;case"/":n+="/";break;case"b":n+="\b";break;case"f":n+="\f";break;case"n":n+="\n";break;case"r":n+="\r";break;case"t":n+="\t";break;case"u":var o=t.substring(e+1,e+5);Fr.test(o)||this.parseError("Illegal escape sequence: \\u"+o),n+=String.fromCharCode(parseInt(o,16)),e+=4;break;default:throw this.parseError('Illegal escape sequence: "\\'+r+'"')}++e;var i=t.indexOf("\\",e);n+=t.substring(e,i<0?t.length:i),e=i}return n},jr.prototype.isComment=function(){return"/"===this.expression.charAt(this.pos)&&"*"===this.expression.charAt(this.pos+1)&&(this.pos=this.expression.indexOf("*/",this.pos)+2,1===this.pos&&(this.pos=this.expression.length),!0)},jr.prototype.isRadixInteger=function(){var t,e,n=this.pos;if(n>=this.expression.length-2||"0"!==this.expression.charAt(n))return!1;if(++n,"x"===this.expression.charAt(n))t=16,e=/^[0-9a-f]$/i,++n;else{if("b"!==this.expression.charAt(n))return!1;t=2,e=/^[01]$/i,++n}for(var r=!1,o=n;n<this.expression.length;){var i=this.expression.charAt(n);if(!e.test(i))break;n++,r=!0}return r&&(this.current=this.newToken("TNUMBER",parseInt(this.expression.substring(o,n),t)),this.pos=n),r},jr.prototype.isNumber=function(){for(var t,e=!1,n=this.pos,r=n,o=n,i=!1,a=!1;n<this.expression.length&&((t=this.expression.charAt(n))>="0"&&t<="9"||!i&&"."===t);)"."===t?i=!0:a=!0,n++,e=a;if(e&&(o=n),"e"===t||"E"===t){n++;for(var s=!0,u=!1;n<this.expression.length;){if(t=this.expression.charAt(n),!s||"+"!==t&&"-"!==t){if(!(t>="0"&&t<="9"))break;u=!0,s=!1}else s=!1;n++}u||(n=o)}return e?(this.current=this.newToken("TNUMBER",parseFloat(this.expression.substring(r,n))),this.pos=n):this.pos=o,e},jr.prototype.isOperator=function(){var t=this.pos,e=this.expression.charAt(this.pos);if("+"===e||"-"===e||"*"===e||"/"===e||"%"===e||"^"===e||"?"===e||":"===e||"."===e)this.current=this.newToken(Rr,e);else if("∙"===e||"•"===e)this.current=this.newToken(Rr,"*");else if(">"===e)"="===this.expression.charAt(this.pos+1)?(this.current=this.newToken(Rr,">="),this.pos++):this.current=this.newToken(Rr,">");else if("<"===e)"="===this.expression.charAt(this.pos+1)?(this.current=this.newToken(Rr,"<="),this.pos++):this.current=this.newToken(Rr,"<");else if("|"===e){if("|"!==this.expression.charAt(this.pos+1))return!1;this.current=this.newToken(Rr,"||"),this.pos++}else if("="===e)"="===this.expression.charAt(this.pos+1)?(this.current=this.newToken(Rr,"=="),this.pos++):this.current=this.newToken(Rr,e);else{if("!"!==e)return!1;"="===this.expression.charAt(this.pos+1)?(this.current=this.newToken(Rr,"!="),this.pos++):this.current=this.newToken(Rr,e)}return this.pos++,!!this.isOperatorEnabled(this.current.value)||(this.pos=t,!1)},jr.prototype.isOperatorEnabled=function(t){return this.parser.isOperatorEnabled(t)},jr.prototype.getCoordinates=function(){var t,e=0,n=-1;do{e++,t=this.pos-n,n=this.expression.indexOf("\n",n+1)}while(n>=0&&n<this.pos);return{line:e,column:t}},jr.prototype.parseError=function(t){var e=this.getCoordinates();throw new Error("parse error ["+e.line+":"+e.column+"]: "+t)};var Dr="IEXPR";function Pr(t,e){this.type=t,this.value=null!=e?e:0}function Hr(t){return new Pr("IOP1",t)}function Ur(t){return new Pr("IOP2",t)}function Br(t,e,n){this.parser=t,this.tokens=e,this.current=null,this.nextToken=null,this.next(),this.savedCurrent=null,this.savedNextToken=null,this.allowMemberAccess=!1!==n.allowMemberAccess}Pr.prototype.toString=function(){switch(this.type){case"INUMBER":case"IOP1":case"IOP2":case"IOP3":case"IVAR":case"IVARNAME":case"IENDSTATEMENT":return this.value;case"IFUNCALL":return"CALL "+this.value;case"IFUNDEF":return"DEF "+this.value;case"IARRAY":return"ARRAY "+this.value;case"IMEMBER":return"."+this.value;default:return"Invalid Instruction"}},Br.prototype.next=function(){return this.current=this.nextToken,this.nextToken=this.tokens.next()},Br.prototype.tokenMatches=function(t,e){return void 0===e||(Array.isArray(e)?function(t,e){for(var n=0;n<t.length;n++)if(t[n]===e)return!0;return!1}(e,t.value):"function"==typeof e?e(t):t.value===e)},Br.prototype.save=function(){this.savedCurrent=this.current,this.savedNextToken=this.nextToken,this.tokens.save()},Br.prototype.restore=function(){this.tokens.restore(),this.current=this.savedCurrent,this.nextToken=this.savedNextToken},Br.prototype.accept=function(t,e){return!(this.nextToken.type!==t||!this.tokenMatches(this.nextToken,e))&&(this.next(),!0)},Br.prototype.expect=function(t,e){if(!this.accept(t,e)){var n=this.tokens.getCoordinates();throw new Error("parse error ["+n.line+":"+n.column+"]: Expected "+(e||t))}},Br.prototype.parseAtom=function(t){var e=this.tokens.unaryOps;if(this.accept("TNAME")||this.accept(Rr,(function(t){return t.value in e})))t.push(new Pr("IVAR",this.current.value));else if(this.accept("TNUMBER"))t.push(new Pr("INUMBER",this.current.value));else if(this.accept("TSTRING"))t.push(new Pr("INUMBER",this.current.value));else if(this.accept(Ir,"("))this.parseExpression(t),this.expect(Ir,")");else{if(!this.accept("TBRACKET","["))throw new Error("unexpected "+this.nextToken);if(this.accept("TBRACKET","]"))t.push(new Pr("IARRAY",0));else{var n=this.parseArrayList(t);t.push(new Pr("IARRAY",n))}}},Br.prototype.parseExpression=function(t){var e=[];this.parseUntilEndStatement(t,e)||(this.parseVariableAssignmentExpression(e),this.parseUntilEndStatement(t,e)||this.pushExpression(t,e))},Br.prototype.pushExpression=function(t,e){for(var n=0,r=e.length;n<r;n++)t.push(e[n])},Br.prototype.parseUntilEndStatement=function(t,e){return!!this.accept("TSEMICOLON")&&(!this.nextToken||"TEOF"===this.nextToken.type||this.nextToken.type===Ir&&")"===this.nextToken.value||e.push(new Pr("IENDSTATEMENT")),"TEOF"!==this.nextToken.type&&this.parseExpression(e),t.push(new Pr(Dr,e)),!0)},Br.prototype.parseArrayList=function(t){for(var e=0;!this.accept("TBRACKET","]");)for(this.parseExpression(t),++e;this.accept("TCOMMA");)this.parseExpression(t),++e;return e},Br.prototype.parseVariableAssignmentExpression=function(t){for(this.parseConditionalExpression(t);this.accept(Rr,"=");){var e=t.pop(),n=[],r=t.length-1;if("IFUNCALL"!==e.type){if("IVAR"!==e.type&&"IMEMBER"!==e.type)throw new Error("expected variable for assignment");this.parseVariableAssignmentExpression(n),t.push(new Pr("IVARNAME",e.value)),t.push(new Pr(Dr,n)),t.push(Ur("="))}else{if(!this.tokens.isOperatorEnabled("()="))throw new Error("function definition is not permitted");for(var o=0,i=e.value+1;o<i;o++){var a=r-o;"IVAR"===t[a].type&&(t[a]=new Pr("IVARNAME",t[a].value))}this.parseVariableAssignmentExpression(n),t.push(new Pr(Dr,n)),t.push(new Pr("IFUNDEF",e.value))}}},Br.prototype.parseConditionalExpression=function(t){for(this.parseOrExpression(t);this.accept(Rr,"?");){var e=[],n=[];this.parseConditionalExpression(e),this.expect(Rr,":"),this.parseConditionalExpression(n),t.push(new Pr(Dr,e)),t.push(new Pr(Dr,n)),t.push(new Pr("IOP3","?"))}},Br.prototype.parseOrExpression=function(t){for(this.parseAndExpression(t);this.accept(Rr,"or");){var e=[];this.parseAndExpression(e),t.push(new Pr(Dr,e)),t.push(Ur("or"))}},Br.prototype.parseAndExpression=function(t){for(this.parseComparison(t);this.accept(Rr,"and");){var e=[];this.parseComparison(e),t.push(new Pr(Dr,e)),t.push(Ur("and"))}};var Vr=["==","!=","<","<=",">=",">","in"];Br.prototype.parseComparison=function(t){for(this.parseAddSub(t);this.accept(Rr,Vr);){var e=this.current;this.parseAddSub(t),t.push(Ur(e.value))}};var $r=["+","-","||"];Br.prototype.parseAddSub=function(t){for(this.parseTerm(t);this.accept(Rr,$r);){var e=this.current;this.parseTerm(t),t.push(Ur(e.value))}};var Wr=["*","/","%"];function zr(t,e){return Number(t)+Number(e)}function qr(t,e){return t-e}function Gr(t,e){return t*e}function Yr(t,e){return t/e}function Kr(t,e){return t%e}function Xr(t,e){return t===e}function Jr(t,e){return t!==e}function Zr(t,e){return t>e}function Qr(t,e){return t<e}function to(t,e){return t>=e}function eo(t,e){return t<=e}function no(t,e){return Boolean(t&&e)}function ro(t,e){return Boolean(t||e)}function oo(t){return Math.log(t)*Math.LOG10E}function io(t){return-t}function ao(t){return!t}function so(t){return t<0?Math.ceil(t):Math.floor(t)}function uo(t){return Math.random()*(t||1)}function co(t){return Array.isArray(t)?t.length:String(t).length}function lo(t,e,n){return t?e:n}function fo(t,e){return void 0===e||0==+e?Math.round(t):(t=+t,e=-+e,isNaN(t)||"number"!=typeof e||e%1!=0?NaN:(t=t.toString().split("e"),+((t=(t=Math.round(+(t[0]+"e"+(t[1]?+t[1]-e:-e)))).toString().split("e"))[0]+"e"+(t[1]?+t[1]+e:e))))}function ho(t,e){return t[0|e]}function po(t){return 1===arguments.length&&Array.isArray(t)?Math.max.apply(Math,t):Math.max.apply(Math,arguments)}function mo(t){return 1===arguments.length&&Array.isArray(t)?Math.min.apply(Math,t):Math.min.apply(Math,arguments)}function vo(t,e){if("function"!=typeof t)throw new Error("First argument to map is not a function");if(!Array.isArray(e))throw new Error("Second argument to map is not an array");return e.map((function(e,n){return t(e,n)}))}function go(t,e,n){if("function"!=typeof t)throw new Error("First argument to fold is not a function");if(!Array.isArray(n))throw new Error("Second argument to fold is not an array");return n.reduce((function(e,n,r){return t(e,n,r)}),e)}function yo(t,e){if("function"!=typeof t)throw new Error("First argument to filter is not a function");if(!Array.isArray(e))throw new Error("Second argument to filter is not an array");return e.filter((function(e,n){return t(e,n)}))}function bo(t){return(t>0)-(t<0)||+t}function wo(t){return Math.log(1+t)}function _o(t){return Math.log(t)/Math.LN2}function xo(t){if(!Array.isArray(t))throw new Error("Sum argument is not an array");return t.reduce((function(t,e){return t+Number(e)}),0)}function No(t,e,n){var r,o,i,a,s,u,c=[];if(ko(t))return Oo(t,n);for(var l=t.length,f=0;f<l;f++){var h=t[f],p=h.type;if("INUMBER"===p||"IVARNAME"===p)c.push(h.value);else if("IOP2"===p)o=c.pop(),r=c.pop(),"and"===h.value?c.push(!!r&&!!No(o,e,n)):"or"===h.value?c.push(!!r||!!No(o,e,n)):"="===h.value?(a=e.binaryOps[h.value],c.push(a(r,No(o,e,n),n))):(a=e.binaryOps[h.value],c.push(a(Oo(r,n),Oo(o,n))));else if("IOP3"===p)i=c.pop(),o=c.pop(),r=c.pop(),"?"===h.value?c.push(No(r?o:i,e,n)):(a=e.ternaryOps[h.value],c.push(a(Oo(r,n),Oo(o,n),Oo(i,n))));else if("IVAR"===p)if(h.value in e.functions)c.push(e.functions[h.value]);else if(h.value in e.unaryOps&&e.parser.isOperatorEnabled(h.value))c.push(e.unaryOps[h.value]);else{var d=n[h.value];if(void 0===d)throw new Error("undefined variable: "+h.value);c.push(d)}else if("IOP1"===p)r=c.pop(),a=e.unaryOps[h.value],c.push(a(Oo(r,n)));else if("IFUNCALL"===p){for(u=h.value,s=[];u-- >0;)s.unshift(Oo(c.pop(),n));if(!(a=c.pop()).apply||!a.call)throw new Error(a+" is not a function");c.push(a.apply(void 0,s))}else if("IFUNDEF"===p)c.push(function(){for(var t=c.pop(),r=[],o=h.value;o-- >0;)r.unshift(c.pop());var i=c.pop(),a=function(){for(var o=Object.assign({},n),i=0,a=r.length;i<a;i++)o[r[i]]=arguments[i];return No(t,e,o)};return Object.defineProperty(a,"name",{value:i,writable:!1}),n[i]=a,a}());else if(p===Dr)c.push(Eo(h,e));else if("IEXPREVAL"===p)c.push(h);else if("IMEMBER"===p)r=c.pop(),c.push(r[h.value]);else if("IENDSTATEMENT"===p)c.pop();else{if("IARRAY"!==p)throw new Error("invalid Expression");for(u=h.value,s=[];u-- >0;)s.unshift(c.pop());c.push(s)}}if(c.length>1)throw new Error("invalid Expression (parity)");return 0===c[0]?0:Oo(c[0],n)}function Eo(t,e,n){return ko(t)?t:{type:"IEXPREVAL",value:function(n){return No(t.value,e,n)}}}function ko(t){return t&&"IEXPREVAL"===t.type}function Oo(t,e){return ko(t)?t.value(e):t}function Ao(t,e){this.tokens=t,this.parser=e,this.unaryOps=e.unaryOps,this.binaryOps=e.binaryOps,this.ternaryOps=e.ternaryOps,this.functions=e.functions}function Mo(t){return t.trim()}function Co(t){this.options=t||{},this.unaryOps={SIN:Math.sin,COS:Math.cos,TAN:Math.tan,ASIN:Math.asin,ACOS:Math.acos,ATAN:Math.atan,SQRT:Math.sqrt,LOG:Math.log,LOG2:Math.log2||_o,LN:Math.log,LOG10:Math.log10||oo,LG:Math.log10||oo,LOG1P:Math.log1p||wo,ABS:Math.abs,CEIL:Math.ceil,FLOOR:Math.floor,ISNULL:function(t){return null===t},TRUNC:Math.trunc||so,"-":io,"+":Number,EXP:Math.exp,NOT:ao,LENGTH:co,"!":ao,SIGN:Math.sign||bo,TEXT:function(t){return e(t)?t.toISOString():String(t)},NUMBER:Number},this.binaryOps={"+":zr,"-":qr,"*":Gr,"/":Yr,"%":Kr,"^":Math.pow,"==":Xr,"!=":Jr,">":Zr,"<":Qr,">=":to,"<=":eo,and:no,or:ro,in:function(t,e){return Array.isArray(e)?e.includes(t):String(e).includes(t)},"[":ho},this.ternaryOps={"?":lo};var e=function(t){return t instanceof Date&&!isNaN(t)},n=function(t){if(e(t))return t;try{var n=new Date(t);return e(n)?n:null}catch(t){return null}};function r(t){return(1===arguments.length&&Array.isArray(t)?t:Array.from(arguments)).slice(0).filter((function(t){return!isNaN(t)&&Number.isFinite(t)}))}var o=/\w*/g,i=/\w\S*/g,a=/[\\^$*+?.()|[\]{}]/g;try{o=new RegExp("\\p{L}*","ug"),i=new RegExp("[\\p{L}\\p{N}]\\S*","ug")}catch(t){}this.functions={IF:lo,RANDOM:uo,MIN:function(){var t=r.apply(this,arguments);return mo(t)},MAX:function(){return po(r.apply(this,arguments))},SUM:function(){return xo(r.apply(this,arguments))},MEAN:function(){var t=r.apply(this,arguments);return xo(t)/t.length},MEDIAN:function(){var t=r.apply(this,arguments).sort((function(t,e){return t-e})),e=Math.floor(t.length/2);return t.length%2==1?t[e]:.5*(t[e-1]+t[e])},POW:Math.pow,ATAN2:Math.atan2,ROUND:fo,CONCAT:function(){return Array.from(arguments).join("")},TRIM:Mo,SUBSTR:function(t,e,n){return t.substr(e,n)},REPLACE:function(t,e,n){return t.replace(new RegExp(String(e).replace(a,"\\$&"),"g"),n)},REPLACE_REGEX:function(t,e,n){return t.replace(new RegExp(e,"g"),n)},SPLIT:function(t,e){return String(t).split(e)},LOWER:function(t){return String(t).toLowerCase()},UPPER:function(t){return String(t).toUpperCase()},PROPER:function(t){return String(t).replace(o,(function(t){return t.charAt(0).toUpperCase()+t.substr(1).toLowerCase()}))},TITLE:function(t){return String(t).replace(i,(function(t){return t.charAt(0).toUpperCase()+t.substr(1).toLowerCase()}))},SORT:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(!Array.isArray(t))throw new Error("First argument to SORT is not an array");return t.slice(0).sort((function(t,r){return((t="string"==typeof n?t[n]:"function"==typeof n?n(t):t)>(r="string"==typeof n?r[n]:"function"==typeof n?n(r):r)?1:t<r?-1:0)*(e?1:-1)}))},SLICE:function(t,e,n){if(!Array.isArray(t))throw new Error("First argument to SLICE is not an array");return t.slice(e,n)},JOIN:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(!Array.isArray(t))throw new Error("First argument to JOIN is not an array");return n?[t.slice(0,t.length-1).join(e),t[t.length-1]].join(n):t.join(e)},MAP:vo,FOLD:go,FILTER:yo,PLUCK:function(t,e){if(!Array.isArray(t))throw new Error("First argument to PLUCK is not an array");return t.map((function(t){return t[e]}))},INDEXOF:function(t,e){return Array.isArray(t)||(t=String(t)),t.indexOf(e)},FIND:function(t,e){if(!Array.isArray(t))throw new Error("First argument to FIND is not an array");if("function"!=typeof e)throw new Error("Second argument to FIND is not a function");for(var n=t.length,r=0;r<n;r++)if(e(t[r]))return t[r];return null},RANGE:function(t,e,n){null==e&&(e=t||0,t=0),n||(n=e<t?-1:1);for(var r=Math.max(Math.ceil((e-t)/n),0),o=Array(r),i=0;i<r;i++,t+=n)o[i]=t;return o},EVERY:function(t,e){if(!Array.isArray(t))throw new Error("First argument to EVERY is not an array");if("function"!=typeof e)throw new Error("Second argument to EVERY is not a function");for(var n=t.length,r=!0,o=0;o<n;o++)if(!(r=r&&e(t[o])))return!1;return!0},SOME:function(t,e){if(!Array.isArray(t))throw new Error("First argument to SOME is not an array");if("function"!=typeof e)throw new Error("Second argument to SOME is not a function");for(var n=t.length,r=!1,o=0;o<n;o++)if(r=r||e(t[o]))return!0;return!1},DATE:function(){return arguments.length>1&&(arguments[1]=arguments[1]-1),Tr(Date,Array.prototype.slice.call(arguments))},YEAR:function(t){return(t=n(t))?t.getFullYear():null},MONTH:function(t){return(t=n(t))?t.getMonth()+1:null},DAY:function(t){return(t=n(t))?t.getDate():null},WEEKDAY:function(t){return(t=n(t))?t.getDay():null},HOURS:function(t){return(t=n(t))?t.getHours():null},MINUTES:function(t){return(t=n(t))?t.getMinutes():null},SECONDS:function(t){return(t=n(t))?t.getSeconds():null},DATEDIFF:function(t,e){return t=n(t),e=n(e),t&&e?(e.getTime()-t.getTime())/864e5:null},TIMEDIFF:function(t,e){return t=n(t),e=n(e),t&&e?(e.getTime()-t.getTime())/1e3:null}},this.unaryOps.LOWER=this.functions.LOWER,this.unaryOps.UPPER=this.functions.UPPER,this.unaryOps.PROPER=this.functions.PROPER,this.unaryOps.TITLE=this.functions.TITLE,this.unaryOps.TRIM=this.functions.TRIM,this.unaryOps.YEAR=this.functions.YEAR,this.unaryOps.MONTH=this.functions.MONTH,this.unaryOps.DAY=this.functions.DAY,this.unaryOps.WEEKDAY=this.functions.WEEKDAY,this.unaryOps.HOURS=this.functions.HOURS,this.unaryOps.MINUTES=this.functions.MINUTES,this.unaryOps.SECONDS=this.functions.SECONDS,this.consts={E:Math.E,PI:Math.PI,TRUE:!0,FALSE:!1,NA:Number.NaN,NULL:Number.NaN}}Br.prototype.parseTerm=function(t){for(this.parseFactor(t);this.accept(Rr,Wr);){var e=this.current;this.parseFactor(t),t.push(Ur(e.value))}},Br.prototype.parseFactor=function(t){var e=this.tokens.unaryOps;if(this.save(),this.accept(Rr,(function(t){return t.value in e}))){if("-"!==this.current.value&&"+"!==this.current.value){if(this.nextToken.type===Ir&&"("===this.nextToken.value)return this.restore(),void this.parseExponential(t);if("TSEMICOLON"===this.nextToken.type||"TCOMMA"===this.nextToken.type||"TEOF"===this.nextToken.type||this.nextToken.type===Ir&&")"===this.nextToken.value)return this.restore(),void this.parseAtom(t)}var n=this.current;this.parseFactor(t),t.push(Hr(n.value))}else this.parseExponential(t)},Br.prototype.parseExponential=function(t){for(this.parsePostfixExpression(t);this.accept(Rr,"^");)this.parseFactor(t),t.push(Ur("^"))},Br.prototype.parsePostfixExpression=function(t){for(this.parseFunctionCall(t);this.accept(Rr,"!");)t.push(Hr("!"))},Br.prototype.parseFunctionCall=function(t){var e=this.tokens.unaryOps;if(this.accept(Rr,(function(t){return t.value in e}))){var n=this.current;this.parseAtom(t),t.push(Hr(n.value))}else for(this.parseMemberExpression(t);this.accept(Ir,"(");)if(this.accept(Ir,")"))t.push(new Pr("IFUNCALL",0));else{var r=this.parseArgumentList(t);t.push(new Pr("IFUNCALL",r))}},Br.prototype.parseArgumentList=function(t){for(var e=0;!this.accept(Ir,")");)for(this.parseExpression(t),++e;this.accept("TCOMMA");)this.parseExpression(t),++e;return e},Br.prototype.parseMemberExpression=function(t){for(this.parseAtom(t);this.accept(Rr,".")||this.accept("TBRACKET","[");){var e=this.current;if("."===e.value){if(!this.allowMemberAccess)throw new Error('unexpected ".", member access is not permitted');this.expect("TNAME"),t.push(new Pr("IMEMBER",this.current.value))}else{if("["!==e.value)throw new Error("unexpected symbol: "+e.value);if(!this.tokens.isOperatorEnabled("["))throw new Error('unexpected "[]", arrays are disabled');this.parseExpression(t),this.expect("TBRACKET","]"),t.push(Ur("["))}}},Ao.prototype.evaluate=function(t){return t=t||{},No(this.tokens,this,t)},Ao.prototype.variables=function(){return(this.tokens||[]).filter((function(t){return"IVAR"===t.type})).map((function(t){return t.value}))},Co.prototype.parse=function(t){var e=[],n=new Br(this,new jr(this,t),{allowMemberAccess:!0});return n.parseExpression(e),n.expect("TEOF","EOF"),new Ao(e,this)},Co.prototype.evaluate=function(t,e){return this.parse(t).evaluate(e)};var So=new Co;Co.parse=function(t){return So.parse(t)},Co.evaluate=function(t,e){return So.parse(t).evaluate(e)},Co.keywords=["ABS","ACOS","ACOSH","and","ASIN","ASINH","ATAN","ATAN2","ATANH","CBRT","CEIL","CONCAT","COS","COSH","DATEDIFF","DAY","E","EVERY","EXP","EXPM1","FIND","FLOOR","HOURS","IF","in","INDEXOF","ISNULL","JOIN","LENGTH","LN","LOG","LOG10","LOG1P","LOG2","LOWER","MAP","MAX","MEAN","MEDIAN","MIN","MINUTES","MONTH","NOT","NOT","or","PI","PLUCK","POW","PROPER","RANDOM","RANGE","REPLACE","REPLACE_REGEX","ROUND","SECONDS","SIGN","SIN","SINH","SLICE","SOME","SORT","SPLIT","SQRT","SUBSTR","SUM","TAN","TANH","TIMEDIFF","TITLE","TRIM","TRUNC","UPPER","WEEKDAY","YEAR"];var To={"+":"add","-":"subtract","*":"multiply","/":"divide","%":"remainder","^":"power","!":"factorial","<":"comparison",">":"comparison","<=":"comparison",">=":"comparison","==":"comparison","!=":"comparison","||":"concatenate",AND:"logical",OR:"logical",NOT:"logical",IN:"logical","?":"conditional",":":"conditional","=":"assignment","[":"array","()=":"fndef"};function Ro(t){return t.toString().toLowerCase().replace(/\s+/g,"_").replace(/[^\w-]+/g,"").replace(/-/g,"_").replace(/__+/g,"_").replace(/^_+/,"").replace(/_+$/,"").replace(/^(\d)/,"_$1").replace(/^(and|or|in|true|false)$/,"$1_")}function Io(t){var e=t.get("metadata.describe.computed-columns",[]);return Array.isArray(e)||(e=Object.keys(e).reduce((function(t,n){return t.push({name:n,formula:e[n]}),t}),[])),e}Co.prototype.isOperatorEnabled=function(t){var e=function(t){return Object.prototype.hasOwnProperty.call(To,t)?To[t]:t}(t),n=this.options.operators||{};return!(e in n&&!n[e])};var Lo={show:function(){var t=this,e=setTimeout((function(){t.set({visible:!0})}),400);this.set({t:e})},hide:function(){var t=this.get().t;clearTimeout(t),this.set({visible:!1})}};function jo(t,e){var n,r,o,i,a=t._slotted.default;return{c:function(){n=O("div"),r=O("i"),o=M("\n        "),r.className="hat-icon im im-graduation-hat svelte-9o0fpa",n.className="content svelte-9o0fpa"},m:function(t,e){x(t,n,e),_(n,r),_(n,o),a&&(_(n,i||(i=C())),_(n,a))},d:function(t){t&&N(n),a&&function(t,e){for(;t.nextSibling;)e.appendChild(t.nextSibling)}(i,a)}}}function Fo(t){Y(this,t),this._state=y({visible:!1},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){var n,r,o,i=e.visible&&jo(t);function a(e){t.show()}function s(e){t.hide()}return{c:function(){n=O("div"),(r=O("span")).textContent="?",o=M("\n    "),i&&i.c(),r.className="help-icon svelte-9o0fpa",S(n,"mouseenter",a),S(n,"mouseleave",s),n.className="help svelte-9o0fpa"},m:function(t,e){x(t,n,e),_(n,r),_(n,o),i&&i.m(n,null)},p:function(e,r){r.visible?i||((i=jo(t)).c(),i.m(n,null)):i&&(i.d(1),i=null)},d:function(t){t&&N(n),i&&i.d(),T(n,"mouseenter",a),T(n,"mouseleave",s)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}y(Fo.prototype,Z),y(Fo.prototype,Lo);var Do=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")};var Po=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t};var Ho=function(t,e){return!e||"object"!==c(e)&&"function"!=typeof e?Po(t):e},Uo=u((function(t){function e(n){return t.exports=e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},e(n)}t.exports=e}));var Bo=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&Cr(t,e)};var Vo=function(t){return-1!==Function.toString.call(t).indexOf("[native code]")},$o=u((function(t){function e(n){var r="function"==typeof Map?new Map:void 0;return t.exports=e=function(t){if(null===t||!Vo(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,e)}function e(){return Tr(t,arguments,Uo(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),Cr(e,t)},e(n)}t.exports=e}));var Wo=function(t,e){if(null==t)return{};var n,r,o={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(o[n]=t[n]);return o};var zo=function(t,e){if(null==t)return{};var n,r,o=Wo(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o},qo=u((function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(e,n,i){if("undefined"!=typeof document){"number"==typeof(i=t({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var a=JSON.stringify(n);/^[\{\[]/.test(a)&&(n=a)}catch(t){}n=r.write?r.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var u in i)i[u]&&(s+="; "+u,!0!==i[u]&&(s+="="+i[u].split(";")[0]));return document.cookie=e+"="+n+s}}function a(t,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],a=0;a<i.length;a++){var s=i[a].split("="),u=s.slice(1).join("=");n||'"'!==u.charAt(0)||(u=u.slice(1,-1));try{var c=e(s[0]);if(u=(r.read||r)(u,c)||e(u),n)try{u=JSON.parse(u)}catch(t){}if(o[c]=u,t===c)break}catch(t){}}return t?o[t]:o}}return o.set=i,o.get=function(t){return a(t,!1)},o.getJSON=function(t){return a(t,!0)},o.remove=function(e,n){i(e,"",t(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},t.exports=n()}));function Go(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function Yo(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?Go(Object(n),!0).forEach((function(e){v(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):Go(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var Ko=new Set(["get","head","options","trace"]);function Xo(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=Yo({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e,{headers:Yo({"Content-Type":"application/json"},e.headers)}),o=r.payload,i=r.baseUrl,a=r.fetch,s=r.raw,u=zo(r,["payload","baseUrl","fetch","raw"]),c="".concat(i.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(o&&(u.body=JSON.stringify(o)),Ko.has(u.method.toLowerCase()))n=a(c,u);else{var l=qo.get("crumb");l?(u.headers["X-CSRF-Token"]=l,n=a(c,u)):n=Xo("/v3/me",{fetch:a,baseUrl:i}).then((function(){var t=qo.get("crumb");t&&(u.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return a(c,u)}))}return n.then((function(t){if(s)return t;if(!t.ok)throw new Qo(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}Xo.get=Zo("GET");var Jo=Xo.patch=Zo("PATCH");Xo.put=Zo("PUT"),Xo.post=Zo("POST"),Xo.head=Zo("HEAD");function Zo(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return Xo(e,Yo({},n,{method:t}))}}Xo.delete=Zo("DELETE");var Qo=function(t){function e(t){var n;return Do(this,e),(n=Ho(this,Uo(e).call(this))).name="HttpReqError",n.status=t.status,n.statusText=t.statusText,n.message="[".concat(t.status,"] ").concat(t.statusText),n.response=t,n}return Bo(e,t),e}($o(Error));var ti=function(){};var ei={insert:function(t){var e=this.get().cm;e.replaceSelection(t.key),e.focus()},unmarkErrors:function(){window.document.querySelectorAll("span.parser-error").forEach((function(t){return t.classList.remove("parser-error")}))},removeColumn:function(){var t=this.get().column,e=this.store.get().dw_chart,n=e.dataset(),r=kr(Io(e)).filter((function(e){return e.name!==t.name()})),o=n.columnOrder()[n.indexOf(t.name())],i=e.get("metadata.data.changes",[]),a=[];i.forEach((function(t){t.column!==o&&(t.column>o&&t.column--,a.push(t))})),e.set("metadata.describe.computed-columns",r),e.set("metadata.data.changes",a),e.saveSoon(),this.fire("updateTable"),this.fire("unselect")},copyFormulaToData:function(){var t=this.get(),e=t.formula,n=t.name,r=dw.column("",e.split("\n")),o="[".concat(r.values().map((function(t,e){return t instanceof Date&&!isNaN(t)||"string"==typeof t?JSON.stringify(r.raw(e)):t})).join(",\n"),"][ROWNUMBER]");this.set({formula:o,parserErrors:[]}),this.setFormula(o,n)},setFormula:function(t,e){var n=this;if(void 0!==t){var r=this.store.get().dw_chart,o=this.get().cm;this.set({formula:t});var i=[];t!==o.getValue()&&o.setValue(t),setTimeout((function(){return n.unmarkErrors()}));var a=kr(Io(r)),s=a.find((function(t){return t.name===e}));if(!s)return setTimeout((function(){n.setFormula(t,e)}),100);s.formula!==t?(s.formula=t,r.set("metadata.describe.computed-columns",a),this.set({checking:!0}),r.saveSoon&&r.saveSoon(),this.store.set({dw_chart:r}),ti()):(r.dataset().column(e).errors||[]).forEach((function(t){i.push(t)})),this.set({parserErrors:i})}},closeDidYouKnow:function(){try{var t=this;return e=Jo("/v3/me/data",{payload:{"new-computed-columns-syntax":1}}),n=function(){window.dw.backend.__userData["new-computed-columns-syntax"]=1,t.set({didYouKnow:!1})},r?n?n(e):e:(e&&e.then||(e=Promise.resolve(e)),n?e.then(n):e)}catch(t){return Promise.reject(t)}var e,n,r}};function ni(){var e=this,n=this,r=this.get(),o=r.column,i=r.computedColumns,a=this.store.get().dw_chart,s=i.find((function(t){return t.name===o.name()}));window.dw.backend.__userData["new-computed-columns-syntax"]&&this.set({didYouKnow:!JSON.parse(window.dw.backend.__userData["new-computed-columns-syntax"]||"false")}),this.set({formula:s.formula||"",name:o.name()});var u=/(?:parse error) \[(\d+):(\d+)\]:/;this.on("hotRendered",(function(){var t=e.get(),n=t.checking,r=t.name,o=t.formula;if(n){var i=[],s=a.dataset().column(r);s.formula===o&&(s.errors||[]).forEach((function(t){i.push(t)})),e.unmarkErrors(),e.set({parserErrors:i,checking:!1})}}));var c,l=t.fromTextArea(this.refs.code,{value:this.get().formula||"",mode:"simple",indentUnit:2,tabSize:2,lineWrapping:!0,matchBrackets:!0,placeholder:"",continueComments:"Enter",extraKeys:{Tab:"autocomplete"},hintOptions:{hint:function(e){var r=e.getCursor(),o=e.getTokenAt(r),i=[],a=n.get().keywords;return"variable-x"===o.type?i=a.filter((function(t){return 0===t.toLowerCase().indexOf(o.string.toLowerCase())})):"keyword-x"===o.type&&(i=Co.keywords.filter((function(t){return 0===t.toLowerCase().indexOf(o.string.toLowerCase())}))),{list:i.sort(),from:t.Pos(r.line,o.start),to:t.Pos(r.line,o.end)}}}});window.CodeMirror=t,this.set({cm:l}),ti=Mt((function(){return n.fire("updateTable")}),1500);var f=this.get(),h=f.name,p=f.formula;function d(e){var n=new RegExp("(?:".concat(e.join("|"),")")),r=new RegExp("(?:".concat(Co.keywords.join("|"),")"));t.defineSimpleMode("simplemode",{start:[{regex:/"(?:[^\\]|\\.)*?(?:"|$)/,token:"string"},{regex:/'(?:[^\\]|\\.)*?(?:'|$)/,token:"string"},{regex:r,token:"keyword"},{regex:/true|false|PI|E/,token:"atom"},{regex:/0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,token:"number"},{regex:n,token:"variable-2"},{regex:/\/(?:[^\\]|\\.)*?\//,token:"variable-3"},{regex:/[-+/*=<>!^%]+/,token:"operator"},{regex:/[[(]/,indent:!0},{regex:/[\])]/,dedent:!0},{regex:/[a-z$][\w$]*/,token:"variable-x"},{regex:/[A-Z_][\w$]*/,token:"keyword-x"}],meta:{}}),l.setOption("mode","simplemode")}d(f.keywords),this.setFormula(p,h),this.on("state",(function(t){var n=t.changed,r=t.current,o=t.previous;if(n.column){var i=r.column;if(i&&r.computedColumns){var s=r.computedColumns.find((function(t){return t.name===i.name()})),f=s?s.formula:"",h=i.name();e.set({formula:f,name:h}),e.setFormula(f,h),l.setValue(f)}}if(n.name&&o.name&&function(t){clearTimeout(c),c=setTimeout((function(){var n=e.get().column,r=e.get().computedColumns;(r=kr(r)).find((function(t){return t.name===n.name()})).name=t,n.name(t),a.set("metadata.describe.computed-columns",r),e.store.set({dw_chart:a}),a.saveSoon&&a.saveSoon(),ti()}),1500)}(r.name),n.metaColumns&&d(r.keywords),n.errDisplay&&r.errDisplay&&u.test(r.errDisplay)){var p=r.errDisplay.match(u),m=Number(p[1])-1,v=Number(p[2])-1;l.markText({line:m,ch:v},{line:m,ch:v+1},{className:"parser-error"})}})),l.on("change",(function(t){var r=n.get().name;e.setFormula(t.getValue(),r)}))}function ri(t){var e=this._svelte,n=e.component,r=e.ctx;n.insert(r.col)}function oi(t,e,n){var r=Object.create(t);return r.col=e[n],r}function ii(t,e){var n,r,o,i,a,s,u,c,l,f,h,p,d,m,v,g,y=Mr("cc / formula / did-you-know / title"),b=Mr("cc / formula / did-you-know / text"),w=Mr("cc / formula / did-you-know / link"),E=Mr("cc / formula / did-you-know / link2");function k(e){t.closeDidYouKnow()}return{c:function(){n=O("div"),(r=O("div")).innerHTML='<i class="im im-check-mark-circle"></i>',o=M("\n        "),i=O("h3"),a=M(y),s=M("\n\n        "),u=O("p"),c=M(b),l=M("\n\n        "),f=O("p"),h=M(w),p=M(" "),d=O("i"),m=M("\n            "),v=O("a"),g=M(E),S(r,"click",k),r.className="close",d.className="im im-graduation-hat svelte-1cx0ai0",v.href="https://academy.datawrapper.de/article/249-calculations-in-added-columns-and-tooltips",v.target="_blank",n.className="did-you-know svelte-1cx0ai0",L(n,"margin-top","10px"),L(n,"margin-bottom","1em")},m:function(t,e){x(t,n,e),_(n,r),_(n,o),_(n,i),_(i,a),_(n,s),_(n,u),_(u,c),_(n,l),_(n,f),_(f,h),_(f,p),_(f,d),_(f,m),_(f,v),_(v,g)},d:function(t){t&&N(n),T(r,"click",k)}}}function ai(t,e){var n;return{c:function(){L(n=O("i"),"color","#ccc"),n.className="fa fa-cog fa-spin"},m:function(t,e){x(t,n,e)},d:function(t){t&&N(n)}}}function si(t,e){var n;return{c:function(){(n=O("p")).className="mini-help errors svelte-1cx0ai0"},m:function(t,r){x(t,n,r),n.innerHTML=e.errNiceDisplay},p:function(t,e){t.errNiceDisplay&&(n.innerHTML=e.errNiceDisplay)},d:function(t){t&&N(n)}}}function ui(t,e){var n,r,o,i;return{c:function(){n=O("p"),r=O("i"),o=M(" "),i=O("noscript"),r.className="hat-icon im im-graduation-hat svelte-1cx0ai0",n.className="mini-help formula-hint svelte-1cx0ai0"},m:function(t,a){x(t,n,a),_(n,r),_(n,o),_(n,i),i.insertAdjacentHTML("afterend",e.formulaHint)},p:function(t,e){t.formulaHint&&(!function(t){for(;t.nextSibling;)t.parentNode.removeChild(t.nextSibling)}(i),i.insertAdjacentHTML("afterend",e.formulaHint))},d:function(t){t&&N(n)}}}function ci(t,e){var n,r,o,i,a,s,u,c=Mr("cc / formula / hint / insert-data"),l=Mr("cc / formula / hint / insert-data / action");function f(e){e.preventDefault(),t.copyFormulaToData()}return{c:function(){n=O("div"),r=O("i"),o=M(" "),i=M(c),a=M("\n        "),s=O("a"),u=M(l),r.className="hat-icon im im-graduation-hat svelte-1cx0ai0",S(s,"click",f),L(s,"color","white"),L(s,"font-weight","bold"),s.href="/#apply",n.className="mini-help formula-hint svelte-1cx0ai0"},m:function(t,e){x(t,n,e),_(n,r),_(n,o),_(n,i),_(n,a),_(n,s),_(s,u)},d:function(t){t&&N(n),T(s,"click",f)}}}function li(t,e){var n,r,o=e.col.key;return{c:function(){n=O("li"),r=M(o),n._svelte={component:t,ctx:e},S(n,"click",ri),n.className="svelte-1cx0ai0"},m:function(t,e){x(t,n,e),_(n,r)},p:function(t,i){e=i,t.metaColumns&&o!==(o=e.col.key)&&I(r,o),n._svelte.ctx=e},d:function(t){t&&N(n),T(n,"click",ri)}}}function fi(t){var e=this;Y(this,t),this.refs={},this._state=y(y(this.store._init(["dw_chart"]),{name:"",formula:"",parserErrors:[],checking:!1,didYouKnow:!0}),t.data),this.store._add(this,["dw_chart"]),this._recompute({column:1,name:1,$dw_chart:1,columns:1,computedColumns:1,metaColumns:1,formula:1,context:1,error:1,parserErrors:1,errDisplay:1},this._state),this._intro=!0,this._handlers.destroy=[J],this._fragment=function(t,e){var n,r,o,i,a,s,u,c,l,f,h,p,d,m,v,g,y,b,w,A,j,F,P,H,U,B,V,$,W,z,q,G,Y,K,X=Mr("computed columns / modal / intro"),J=Mr("computed columns / modal / name"),Z=!1,Q=Mr("computed columns / modal / formula"),tt=Mr("cc / formula / help"),et=Mr("computed columns / modal / available columns"),nt=Mr("computed columns / modal / remove"),rt=e.didYouKnow&&ii(t);function ot(){Z=!0,t.set({name:p.value}),Z=!1}for(var it=e.checking&&!e.error&&ai(),at=new Fo({root:t.root,store:t.store,slots:{default:k()}}),st=e.errDisplay&&si(t,e),ut=e.formulaHint&&ui(t,e),ct=e.looksLikeColumnData&&ci(t),lt=e.metaColumns,ft=[],ht=0;ht<lt.length;ht+=1)ft[ht]=li(t,oi(e,lt,ht));function pt(e){t.removeColumn()}return{c:function(){n=O("div"),rt&&rt.c(),r=M("\n\n    "),o=O("h3"),i=M(e.title),a=M("\n    "),s=O("p"),u=M(X),c=M("\n\n    "),l=O("label"),f=M(J),h=M("\n    "),p=O("input"),d=M("\n\n    "),m=O("label"),v=M(Q),g=M(" "),it&&it.c(),y=C(),b=O("span"),at._fragment.c(),w=M("\n    "),A=O("textarea"),j=M("\n\n    "),st&&st.c(),F=M(" "),ut&&ut.c(),P=M(" "),ct&&ct.c(),H=M("\n\n    "),U=O("p"),B=M(et),V=M(":"),$=M("\n\n    "),W=O("ul");for(var t=0;t<ft.length;t+=1)ft[t].c();z=M("\n\n"),q=O("button"),G=O("i"),Y=M(" "),K=M(nt),o.className="first",l.className="svelte-1cx0ai0",S(p,"input",ot),R(p,"type","text"),m.className="svelte-1cx0ai0",A.className="code svelte-1cx0ai0",D(A,"error",e.errDisplay),L(U,"margin-top","1em"),W.className="col-select svelte-1cx0ai0",L(n,"margin-bottom","15px"),G.className="fa fa-trash",S(q,"click",pt),q.className="btn btn-danger"},m:function(N,E){x(N,n,E),rt&&rt.m(n,null),_(n,r),_(n,o),_(o,i),_(n,a),_(n,s),_(s,u),_(n,c),_(n,l),_(l,f),_(n,h),_(n,p),p.value=e.name,_(n,d),_(n,m),_(m,v),_(m,g),it&&it.m(m,null),_(m,y),_(at._slotted.default,b),b.innerHTML=tt,at._mount(m,null),_(n,w),_(n,A),t.refs.code=A,_(n,j),st&&st.m(n,null),_(n,F),ut&&ut.m(n,null),_(n,P),ct&&ct.m(n,null),_(n,H),_(n,U),_(U,B),_(U,V),_(n,$),_(n,W);for(var k=0;k<ft.length;k+=1)ft[k].m(W,null);x(N,z,E),x(N,q,E),_(q,G),_(q,Y),_(q,K)},p:function(e,o){if(o.didYouKnow?rt||((rt=ii(t)).c(),rt.m(n,r)):rt&&(rt.d(1),rt=null),e.title&&I(i,o.title),!Z&&e.name&&(p.value=o.name),o.checking&&!o.error?it||((it=ai()).c(),it.m(m,y)):it&&(it.d(1),it=null),e.errDisplay&&D(A,"error",o.errDisplay),o.errDisplay?st?st.p(e,o):((st=si(t,o)).c(),st.m(n,F)):st&&(st.d(1),st=null),o.formulaHint?ut?ut.p(e,o):((ut=ui(t,o)).c(),ut.m(n,P)):ut&&(ut.d(1),ut=null),o.looksLikeColumnData?ct||((ct=ci(t)).c(),ct.m(n,H)):ct&&(ct.d(1),ct=null),e.metaColumns){lt=o.metaColumns;for(var a=0;a<lt.length;a+=1){var s=oi(o,lt,a);ft[a]?ft[a].p(e,s):(ft[a]=li(t,s),ft[a].c(),ft[a].m(W,null))}for(;a<ft.length;a+=1)ft[a].d(1);ft.length=lt.length}},d:function(e){e&&N(n),rt&&rt.d(),T(p,"input",ot),it&&it.d(),at.destroy(),t.refs.code===A&&(t.refs.code=null),st&&st.d(),ut&&ut.d(),ct&&ct.d(),E(ft,e),e&&(N(z),N(q)),T(q,"click",pt)}}}(this,this._state),this.root._oncreate.push((function(){ni.call(e),e.fire("update",{changed:b({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),q(this))}function hi(t){var e=t-1;return e*e*e+1}function pi(t,e){var n=e.delay;void 0===n&&(n=0);var r=e.duration;void 0===r&&(r=400);var o=e.easing;void 0===o&&(o=hi);var i=getComputedStyle(t),a=+i.opacity,s=parseFloat(i.height),u=parseFloat(i.paddingTop),c=parseFloat(i.paddingBottom),l=parseFloat(i.marginTop),f=parseFloat(i.marginBottom),h=parseFloat(i.borderTopWidth),p=parseFloat(i.borderBottomWidth);return{delay:n,duration:r,easing:o,css:function(t){return"overflow: hidden;opacity: "+Math.min(20*t,1)*a+";height: "+t*s+"px;padding-top: "+t*u+"px;padding-bottom: "+t*c+"px;margin-top: "+t*l+"px;margin-bottom: "+t*f+"px;border-top-width: "+t*h+"px;border-bottom-width: "+t*p+"px;"}}}function di(t,e){var n,r,o,i,a,s,u,c,l,f=e.help&&mi(t,e);function h(){t.set({value:i.checked,indeterminate:i.indeterminate})}var p=e.disabled&&e.disabled_msg&&vi(t,e);return{c:function(){f&&f.c(),n=M("\n"),r=O("div"),o=O("label"),i=O("input"),a=O("span"),s=M("\n        "),u=M(e.label),l=M("\n    "),p&&p.c(),S(i,"change",h),"value"in e&&"indeterminate"in e||t.root._beforecreate.push(h),R(i,"type","checkbox"),i.disabled=e.disabled,i.className="svelte-j55ba2",a.className="css-ui svelte-j55ba2",o.className=c="checkbox "+(e.disabled?"disabled":"")+" "+(e.faded?"faded":"")+" svelte-j55ba2",r.className="control-group vis-option-group vis-option-type-checkbox svelte-j55ba2"},m:function(t,c){f&&f.m(t,c),x(t,n,c),x(t,r,c),_(r,o),_(o,i),i.checked=e.value,i.indeterminate=e.indeterminate,_(o,a),_(o,s),_(o,u),_(r,l),p&&p.i(r,null)},p:function(e,a){a.help?f?f.p(e,a):((f=mi(t,a)).c(),f.m(n.parentNode,n)):f&&(f.d(1),f=null),e.value&&(i.checked=a.value),e.indeterminate&&(i.indeterminate=a.indeterminate),e.disabled&&(i.disabled=a.disabled),e.label&&I(u,a.label),(e.disabled||e.faded)&&c!==(c="checkbox "+(a.disabled?"disabled":"")+" "+(a.faded?"faded":"")+" svelte-j55ba2")&&(o.className=c),a.disabled&&a.disabled_msg?(p?p.p(e,a):(p=vi(t,a))&&p.c(),p.i(r,null)):p&&(U.current={remaining:0,callbacks:[]},p.o((function(){p.d(1),p=null})))},d:function(t){f&&f.d(t),t&&(N(n),N(r)),T(i,"change",h),p&&p.d()}}}function mi(t,e){var n,r=new Fo({root:t.root,store:t.store,slots:{default:k()}});return{c:function(){n=O("div"),r._fragment.c()},m:function(t,o){_(r._slotted.default,n),n.innerHTML=e.help,r._mount(t,o)},p:function(t,e){t.help&&(n.innerHTML=e.help)},d:function(t){r.destroy(t)}}}function vi(t,e){var n,r,o,i;return{c:function(){n=O("div"),(r=O("div")).className="disabled-msg svelte-j55ba2"},m:function(t,o){x(t,n,o),_(n,r),r.innerHTML=e.disabled_msg,i=!0},p:function(t,e){i&&!t.disabled_msg||(r.innerHTML=e.disabled_msg)},i:function(e,r){i||(t.root._intro&&(o&&o.invalidate(),t.root._aftercreate.push((function(){o||(o=H(t,n,pi,{},!0)),o.run(1)}))),this.m(e,r))},o:function(e){i&&(o||(o=H(t,n,pi,{},!1)),o.run(0,(function(){e(),o=null})),i=!1)},d:function(t){t&&(N(n),o&&o.abort())}}}function gi(t){Y(this,t),this._state=y({value:!1,disabled:!1,faded:!1,indeterminate:!1,disabled_msg:"",help:!1},t.data),this._intro=!0,this._fragment=di(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),q(this))}y(fi.prototype,Z),y(fi.prototype,ei),fi.prototype._recompute=function(t,e){(t.column||t.name)&&this._differs(e.title,e.title=function(t){t.column;var e=t.name;return Mr("describe / edit-column").replace("%s",'"'.concat(e,'"'))}(e))&&(t.title=!0),t.$dw_chart&&this._differs(e.computedColumns,e.computedColumns=Io(e.$dw_chart))&&(t.computedColumns=!0),(t.columns||t.column||t.computedColumns)&&this._differs(e.metaColumns,e.metaColumns=function(t){var e=t.columns,n=t.column,r=t.computedColumns;if(!e)return[];var o=e.map((function(t){return{key:Ro(t.name()),title:t.title(),type:t.type()}})),i=r.map((function(t){return t.name})),a=i.indexOf(n.name());return i.forEach((function(t,e){a!==e&&o.push({key:Ro(t),title:t,type:"computed"})})),o}(e))&&(t.metaColumns=!0),t.metaColumns&&(this._differs(e.keywords,e.keywords=function(t){var e=t.metaColumns,n=[];return e.forEach((function(t){"number"===t.type||"computed"===t.type?(n.push(t.key+"__sum"),n.push(t.key+"__min"),n.push(t.key+"__max"),n.push(t.key+"__mean"),n.push(t.key+"__median")):"date"===t.type&&(n.push(t.key+"__min"),n.push(t.key+"__max")),n.push(t.key)})),n.sort((function(t,e){return e.length-t.length}))}(e))&&(t.keywords=!0),this._differs(e.context,e.context=function(t){var e=t.metaColumns,n={ROWNUMBER:1},r=["sum","round","min","max","median","mean"];return e.forEach((function(t){n[t.key]="number"===t.type?42:"text"===t.type?"answer":new Date,"number"!==t.type&&"computed"!==t.type||r.forEach((function(e){n["".concat(t.key,"__").concat(e)]=42}))})),n}(e))&&(t.context=!0)),(t.formula||t.context)&&this._differs(e.error,e.error=function(t){var e=t.formula,n=t.context;try{return""!==e.trim()&&Co.evaluate(e,n),null}catch(t){return t.message}}(e))&&(t.error=!0),(t.formula||t.error)&&this._differs(e.looksLikeColumnData,e.looksLikeColumnData=function(t){var e=t.formula,n=t.error;return!!(e.split("\n").length>4&&!e.includes("(")&&n)}(e))&&(t.looksLikeColumnData=!0),(t.error||t.parserErrors)&&this._differs(e.errDisplay,e.errDisplay=function(t){var e=t.error,n=t.parserErrors;return n.length?Object.entries(Er(n,(function(t){return t.message}))).map((function(t){var e=nt(t,2),n=e[0],r=e[1];return n+("all"!==r[0].row?" (rows ".concat(function(t){for(var e=0,n=[],r=1;r<t.length;r++)t[r]-t[e]>r-e&&(n.push(r>e+1?"".concat(t[e],"-").concat(t[r-1]):t[e]),e=r);return n.push(t.length>e+1?"".concat(t[e],"-").concat(t[t.length-1]):t[e]),n.join(", ")}(r.map((function(t){return t.row+2}))),")"):"")})).join("<br />"):e||!1}(e))&&(t.errDisplay=!0),t.errDisplay&&this._differs(e.errNiceDisplay,e.errNiceDisplay=function(t){var e=t.errDisplay;return e?e.replace("unexpected TOP",Mr("cc / formula / error / unexpected top")).replace(": Expected EOF","").replace("unexpected TPAREN",Mr("cc / formula / error / unexpected tparen")).replace("unexpected TBRACKET",Mr("cc / formula / error / unexpected tparen")).replace("unexpected TEOF: EOF",Mr("cc / formula / error / unexpected teof")).replace("unexpected TCOMMA",Mr("cc / formula / error / unexpected tcomma")).replace("unexpected TSEMICOLON",Mr("cc / formula / error / unexpected tsemicolon")).replace("undefined variable",Mr("cc / formula / error / undefined variable")).replace("parse error",Mr("cc / formula / error / parser error")).replace("Unknown character",Mr("cc / formula / error / unknown-character")).replace("unexpected",Mr("cc / formula / error / unexpected")).replace("member access is not permitted",Mr("cc / formula / error / member-access")):e}(e))&&(t.errNiceDisplay=!0),(t.errDisplay||t.formula)&&this._differs(e.formulaHint,e.formulaHint=function(t){var e=t.errDisplay,n=t.formula;if("="===n.trim().charAt(0))return Mr("cc / formula / hint / equal-sign");if(!e||"string"!=typeof e)return"";for(var r=e.split("<br />"),o=0;o<r.length;o++)if(r[o].startsWith("undefined variable:")){var i=r[o].split(": ")[1].split("(row")[0].trim();if(Co.keywords.includes(i.toUpperCase())&&!Co.keywords.includes(i))return"".concat(Mr("cc / formula / hint / use")," <tt>").concat(i.toUpperCase(),"</tt> ").concat(Mr("cc / formula / hint / instead-of")," <tt>").concat(i,"</tt>");if("row"===i)return"".concat(Mr("cc / formula / hint / use")," <tt>ROWNUMBER</tt> ").concat(Mr("cc / formula / hint / instead-of")," <tt>row</tt>")}var a=(n||"").match(/Math\.([a-zA-Z0-9]+)/);if(a&&Co.keywords.includes(a[1].toUpperCase()))return"".concat(Mr("cc / formula / hint / use")," <tt>").concat(a[1].toUpperCase(),"</tt> ").concat(Mr("cc / formula / hint / instead-of")," <tt>").concat(a[0],"</tt>");for(var s=[{s:"substr",h:"SUBSTR(x, start, length)"},{s:"substring",h:"SUBSTR(x, start, length)"},{s:"replace",h:"REPLACE(x, old, new)"},{s:"indexOf",h:"INDEXOF(x, search)"},{s:"toFixed",h:"ROUND(x, decimals)"},{s:"length",h:"LENGTH(x)"},{s:"trim",h:"TRIM(x)"},{s:"split",h:"SPLIT(x, sep)"},{s:"join",h:"JOIN(x, sep)"},{s:"getFullYear",h:"YEAR(x)"},{s:"getMonth",h:"MONTH(x)"},{s:"getDate",h:"DAY(x)"},{s:"includes",h:"y in x"}],u=0;u<s.length;u++){var c=s[u],l=c.s,f=c.h,h=new RegExp("([a-z0-9_]+)\\."+l+"\\("),p=n.match(h);if(p)return"".concat(Mr("cc / formula / hint / use")," <tt>").concat(f.replace("%x",p[1]),"</tt> ").concat(Mr("cc / formula / hint / instead-of"),"<tt>x.").concat(l,"()</tt>")}return e.includes('"&"')&&n.includes("&&")?"".concat(Mr("cc / formula / hint / use")," <tt>x and y</tt> ").concat(Mr("cc / formula / hint / instead-of")," <tt>x && y</tt>"):e.includes("is not a function")&&n.includes("||")?"".concat(Mr("cc / formula / hint / use")," <tt>x or y</tt> ").concat(Mr("cc / formula / hint / instead-of")," <tt>x || y</tt>"):""}(e))&&(t.formulaHint=!0)},y(gi.prototype,Z);var yi="100px";function bi(t,e){var n;return{c:function(){L(n=O("label"),"width",e.width||yi),n.className="control-label svelte-p72242",D(n,"disabled",e.disabled)},m:function(t,r){x(t,n,r),n.innerHTML=e.label},p:function(t,e){t.label&&(n.innerHTML=e.label),t.width&&L(n,"width",e.width||yi),t.disabled&&D(n,"disabled",e.disabled)},d:function(t){t&&N(n)}}}function wi(t,e){var n,r;return{c:function(){L(n=O("p"),"padding-left",e.inline?0:e.width||yi),n.className=r="mini-help "+e.type+" svelte-p72242",D(n,"mini-help-block",!e.inline)},m:function(t,r){x(t,n,r),n.innerHTML=e.help},p:function(t,e){t.help&&(n.innerHTML=e.help),(t.inline||t.width)&&L(n,"padding-left",e.inline?0:e.width||yi),t.type&&r!==(r="mini-help "+e.type+" svelte-p72242")&&(n.className=r),(t.type||t.inline)&&D(n,"mini-help-block",!e.inline)},d:function(t){t&&N(n)}}}function _i(t){var e,n,r,o,i,a,s,u,c,l;Y(this,t),this._state=y({disabled:!1,help:!1,type:"default",valign:"baseline",inline:!1},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,u=e._slotted.default,c=n.label&&bi(0,n),l=n.help&&wi(0,n),{c:function(){r=O("div"),c&&c.c(),o=M("\n    "),i=O("div"),a=M("\n    "),l&&l.c(),i.className="controls svelte-p72242",L(i,"width","calc(100% - "+(n.width||yi)+" - 32px)"),D(i,"form-inline",n.inline),r.className=s="control-group vis-option-group vis-option-group-"+n.type+" label-"+n.valign+" svelte-p72242"},m:function(t,e){x(t,r,e),c&&c.m(r,null),_(r,o),_(r,i),u&&_(i,u),_(r,a),l&&l.m(r,null)},p:function(t,e){e.label?c?c.p(t,e):((c=bi(0,e)).c(),c.m(r,o)):c&&(c.d(1),c=null),t.width&&L(i,"width","calc(100% - "+(e.width||yi)+" - 32px)"),t.inline&&D(i,"form-inline",e.inline),e.help?l?l.p(t,e):((l=wi(0,e)).c(),l.m(r,null)):l&&(l.d(1),l=null),(t.type||t.valign)&&s!==(s="control-group vis-option-group vis-option-group-"+e.type+" label-"+e.valign+" svelte-p72242")&&(r.className=s)},d:function(t){t&&N(r),c&&c.d(),u&&function(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}(i,u),l&&l.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function xi(t,e,n){var r=Object.create(t);return r.opt=e[n],r}function Ni(t,e,n){var r=Object.create(t);return r.optgroup=e[n],r}function Ei(t,e,n){var r=Object.create(t);return r.opt=e[n],r}function ki(t,e){for(var n,r=e.options,o=[],i=0;i<r.length;i+=1)o[i]=Oi(t,Ei(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=C()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);x(t,n,e)},p:function(e,i){if(e.options){r=i.options;for(var a=0;a<r.length;a+=1){var s=Ei(i,r,a);o[a]?o[a].p(e,s):(o[a]=Oi(t,s),o[a].c(),o[a].m(n.parentNode,n))}for(;a<o.length;a+=1)o[a].d(1);o.length=r.length}},d:function(t){E(o,t),t&&N(n)}}}function Oi(t,e){var n,r,o,i=e.opt.label;return{c:function(){n=O("option"),r=M(i),n.__value=o=e.opt.value,n.value=n.__value},m:function(t,e){x(t,n,e),_(n,r)},p:function(t,e){t.options&&i!==(i=e.opt.label)&&I(r,i),t.options&&o!==(o=e.opt.value)&&(n.__value=o),n.value=n.__value},d:function(t){t&&N(n)}}}function Ai(t,e){for(var n,r=e.optgroups,o=[],i=0;i<r.length;i+=1)o[i]=Ci(t,Ni(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=C()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);x(t,n,e)},p:function(e,i){if(e.optgroups){r=i.optgroups;for(var a=0;a<r.length;a+=1){var s=Ni(i,r,a);o[a]?o[a].p(e,s):(o[a]=Ci(t,s),o[a].c(),o[a].m(n.parentNode,n))}for(;a<o.length;a+=1)o[a].d(1);o.length=r.length}},d:function(t){E(o,t),t&&N(n)}}}function Mi(t,e){var n,r,o,i=e.opt.label;return{c:function(){n=O("option"),r=M(i),n.__value=o=e.opt.value,n.value=n.__value},m:function(t,e){x(t,n,e),_(n,r)},p:function(t,e){t.optgroups&&i!==(i=e.opt.label)&&I(r,i),t.optgroups&&o!==(o=e.opt.value)&&(n.__value=o),n.value=n.__value},d:function(t){t&&N(n)}}}function Ci(t,e){for(var n,r,o=e.optgroup.options,i=[],a=0;a<o.length;a+=1)i[a]=Mi(0,xi(e,o,a));return{c:function(){n=O("optgroup");for(var t=0;t<i.length;t+=1)i[t].c();R(n,"label",r=e.optgroup.label)},m:function(t,e){x(t,n,e);for(var r=0;r<i.length;r+=1)i[r].m(n,null)},p:function(t,e){if(t.optgroups){o=e.optgroup.options;for(var a=0;a<o.length;a+=1){var s=xi(e,o,a);i[a]?i[a].p(t,s):(i[a]=Mi(0,s),i[a].c(),i[a].m(n,null))}for(;a<i.length;a+=1)i[a].d(1);i.length=o.length}t.optgroups&&r!==(r=e.optgroup.label)&&R(n,"label",r)},d:function(t){t&&N(n),E(i,t)}}}function Si(t){Y(this,t),this._state=y({disabled:!1,width:"auto",labelWidth:"auto",options:[],optgroups:[]},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o=!1,i=e.options.length&&ki(t,e),a=e.optgroups.length&&Ai(t,e);function s(){o=!0,t.set({value:F(n)}),o=!1}function u(e){t.fire("change",e)}return{c:function(){n=O("select"),i&&i.c(),r=C(),a&&a.c(),S(n,"change",s),"value"in e||t.root._beforecreate.push(s),S(n,"change",u),n.className="select-css svelte-v0oq4b",n.disabled=e.disabled,L(n,"width",e.width)},m:function(t,o){x(t,n,o),i&&i.m(n,null),_(n,r),a&&a.m(n,null),j(n,e.value)},p:function(e,s){s.options.length?i?i.p(e,s):((i=ki(t,s)).c(),i.m(n,r)):i&&(i.d(1),i=null),s.optgroups.length?a?a.p(e,s):((a=Ai(t,s)).c(),a.m(n,null)):a&&(a.d(1),a=null),!o&&e.value&&j(n,s.value),e.disabled&&(n.disabled=s.disabled),e.width&&L(n,"width",s.width)},d:function(t){t&&N(n),i&&i.d(),a&&a.d(),T(n,"change",s),T(n,"change",u)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),q(this))}function Ti(t){Y(this,t),this._state=y({disabled:!1,width:null,labelWidth:null,options:[],optgroups:[],valign:"middle",inline:!0,help:""},t.data),this._recompute({inline:1,width:1,labelWidth:1},this._state),this._intro=!0,this._fragment=function(t,e){var n={},r={},o={width:e.controlWidth};void 0!==e.value&&(o.value=e.value,n.value=!0),void 0!==e.disabled&&(o.disabled=e.disabled,n.disabled=!0),void 0!==e.options&&(o.options=e.options,n.options=!0),void 0!==e.optgroups&&(o.optgroups=e.optgroups,n.optgroups=!0);var i=new Si({root:t.root,store:t.store,data:o,_bind:function(e,r){var o={};!n.value&&e.value&&(o.value=r.value),!n.disabled&&e.disabled&&(o.disabled=r.disabled),!n.options&&e.options&&(o.options=r.options),!n.optgroups&&e.optgroups&&(o.optgroups=r.optgroups),t._set(o),n={}}});t.root._beforecreate.push((function(){i._bind({value:1,disabled:1,options:1,optgroups:1},i.get())})),i.on("change",(function(e){t.fire("change",e)}));var a={width:e.labelWidth,type:"select"};void 0!==e.valign&&(a.valign=e.valign,r.valign=!0),void 0!==e.label&&(a.label=e.label,r.label=!0),void 0!==e.disabled&&(a.disabled=e.disabled,r.disabled=!0),void 0!==e.help&&(a.help=e.help,r.help=!0),void 0!==e.inline&&(a.inline=e.inline,r.inline=!0);var s=new _i({root:t.root,store:t.store,slots:{default:k()},data:a,_bind:function(e,n){var o={};!r.valign&&e.valign&&(o.valign=n.valign),!r.label&&e.label&&(o.label=n.label),!r.disabled&&e.disabled&&(o.disabled=n.disabled),!r.help&&e.help&&(o.help=n.help),!r.inline&&e.inline&&(o.inline=n.inline),t._set(o),r={}}});return t.root._beforecreate.push((function(){s._bind({valign:1,label:1,disabled:1,help:1,inline:1},s.get())})),{c:function(){i._fragment.c(),s._fragment.c()},m:function(t,e){i._mount(s._slotted.default,null),s._mount(t,e)},p:function(t,o){e=o;var a={};t.controlWidth&&(a.width=e.controlWidth),!n.value&&t.value&&(a.value=e.value,n.value=void 0!==e.value),!n.disabled&&t.disabled&&(a.disabled=e.disabled,n.disabled=void 0!==e.disabled),!n.options&&t.options&&(a.options=e.options,n.options=void 0!==e.options),!n.optgroups&&t.optgroups&&(a.optgroups=e.optgroups,n.optgroups=void 0!==e.optgroups),i._set(a),n={};var u={};t.labelWidth&&(u.width=e.labelWidth),!r.valign&&t.valign&&(u.valign=e.valign,r.valign=void 0!==e.valign),!r.label&&t.label&&(u.label=e.label,r.label=void 0!==e.label),!r.disabled&&t.disabled&&(u.disabled=e.disabled,r.disabled=void 0!==e.disabled),!r.help&&t.help&&(u.help=e.help,r.help=void 0!==e.help),!r.inline&&t.inline&&(u.inline=e.inline,r.inline=void 0!==e.inline),s._set(u),r={}},d:function(t){i.destroy(),s.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),q(this))}y(_i.prototype,Z),y(Si.prototype,Z),y(Ti.prototype,Z),Ti.prototype._recompute=function(t,e){var n,r,o;(t.inline||t.width)&&this._differs(e.controlWidth,e.controlWidth=(r=(n=e).inline,o=n.width,r?o||"auto":o))&&(t.controlWidth=!0),(t.inline||t.labelWidth)&&this._differs(e.labelWidth,e.labelWidth=function(t){var e=t.inline,n=t.labelWidth;return e?n||"auto":n}(e))&&(t.labelWidth=!0)};var Ri=function(t,e,n){var r=!0,o=!0;if("function"!=typeof t)throw new TypeError("Expected a function");return rt(n)&&(r="leading"in n?!!n.leading:r,o="trailing"in n?!!n.trailing:o),Mt(t,e,{leading:r,maxWait:e,trailing:o})};function Ii(t){if(Array.isArray(t)){var e={};return Object.keys(t).forEach((function(n){return e[n]=t[n]})),e}return t}var Li={autoDivisor:function(){var t=this.store.get().dw_chart,e=this.get().column,n=dw.utils.metricSuffix(t.locale()),r=e.values(),o=dw.utils.significantDimension(r),i=o<-2?3*Math.round(-1*o/3):o>4?-1*o:0,a=r.map((function(t){return t/Math.pow(10,i)})),s=dw.utils.significantDimension(a);s<=0&&(s=a.reduce((function(t,e){return Math.max(t,Math.min(3,dw.utils.tailLength(e)))}),0)),s===i&&(i=0,s=0),i>15&&(i=0,s=0),this.set({columnFormat:{"number-divisor":i,"number-format":"n"+Math.max(0,s),"number-prepend":"","number-append":i?n[i]||" × 10<sup>"+i+"</sup>":""}})},getColumnFormat:function(t){var e=kr(Ii(this.store.get().dw_chart.get("metadata.data.column-format",{}))[t.name()]);return e&&"auto"!==e&&void 0===e.length||(e={type:"auto",ignore:!1,"number-divisor":0,"number-prepend":"","number-append":"","number-format":"auto"}),e}};function ji(){var t=this,e=Ri((function(){t.fire("updateTable")}),100,{leading:!1}),n=Ri((function(){t.fire("updateTable")}),100,{leading:!1}),r=this.get().column;this.set({colTypes:[{value:"auto",label:"auto ("+r.type()+")"},{value:"text",label:"Text"},{value:"number",label:"Number"},{value:"date",label:"Date"}]}),this.set({columnFormat:this.getColumnFormat(r)}),this.on("state",(function(o){var i=o.changed,a=o.current;if(i.column){var s=a.column;t.set({columnFormat:t.getColumnFormat(s)}),t.get().colTypes[0].label="auto ("+r.type()+")"}if(i.columnFormat){var u=a.columnFormat,c=t.store.get().dw_chart,l=a.column,f=Ii(kr(c.get("metadata.data.column-format",{}))),h=f[l.name()];if(!h||JSON.stringify(h)!==JSON.stringify(u)){if("auto"===u["number-divisor"])return void setTimeout((function(){return t.autoDivisor()}),100);f[l.name()]=kr(u),c.set("metadata.data.column-format",f),c.saveSoon&&c.saveSoon(),h&&h.type===u.type?n():e()}}}))}function Fi(t,e){var n,r,o,i,a,s,u,c,l,f,h={},p={},d=Mr("Prepend/Append"),m=!1,v=!1,g={label:Mr("Round numbers to"),options:e.roundOptions,optgroups:e.numberFormats,width:"180px"};void 0!==e.columnFormat["number-format"]&&(g.value=e.columnFormat["number-format"],h.value=!0);var y=new Ti({root:t.root,store:t.store,data:g,_bind:function(n,r){var o={};!h.value&&n.value&&(e.columnFormat["number-format"]=r.value,o.columnFormat=e.columnFormat),t._set(o),h={}}});t.root._beforecreate.push((function(){y._bind({value:1},y.get())}));var b={label:Mr("Divide numbers by"),options:e.divisors_opts,optgroups:e.divisors,width:"180px"};void 0!==e.columnFormat["number-divisor"]&&(b.value=e.columnFormat["number-divisor"],p.value=!0);var w=new Ti({root:t.root,store:t.store,data:b,_bind:function(n,r){var o={};!p.value&&n.value&&(e.columnFormat["number-divisor"]=r.value,o.columnFormat=e.columnFormat),t._set(o),p={}}});function E(){m=!0,e.columnFormat["number-prepend"]=c.value,t.set({columnFormat:e.columnFormat}),m=!1}function k(){v=!0,e.columnFormat["number-append"]=f.value,t.set({columnFormat:e.columnFormat}),v=!1}return t.root._beforecreate.push((function(){w._bind({value:1},w.get())})),{c:function(){y._fragment.c(),n=M("\n\n        \n        "),w._fragment.c(),r=M("\n\n        "),o=O("div"),i=O("label"),a=M(d),s=M("\n            "),u=O("div"),c=O("input"),l=M("\n                #\n                "),f=O("input"),i.className="control-label svelte-1qp115j",S(c,"input",E),c.autocomplete="screw-you-google-chrome",L(c,"width","6ex"),L(c,"text-align","right"),c.dataset.lpignore="true",c.name="prepend",R(c,"type","text"),S(f,"input",k),f.autocomplete="screw-you-google-chrome",L(f,"width","6ex"),f.dataset.lpignore="true",f.name="append",R(f,"type","text"),u.className="controls form-inline svelte-1qp115j",o.className="control-group vis-option-type-select"},m:function(t,h){y._mount(t,h),x(t,n,h),w._mount(t,h),x(t,r,h),x(t,o,h),_(o,i),_(i,a),_(o,s),_(o,u),_(u,c),c.value=e.columnFormat["number-prepend"],_(u,l),_(u,f),f.value=e.columnFormat["number-append"]},p:function(t,n){e=n;var r={};t.roundOptions&&(r.options=e.roundOptions),t.numberFormats&&(r.optgroups=e.numberFormats),!h.value&&t.columnFormat&&(r.value=e.columnFormat["number-format"],h.value=void 0!==e.columnFormat["number-format"]),y._set(r),h={};var o={};t.divisors_opts&&(o.options=e.divisors_opts),t.divisors&&(o.optgroups=e.divisors),!p.value&&t.columnFormat&&(o.value=e.columnFormat["number-divisor"],p.value=void 0!==e.columnFormat["number-divisor"]),w._set(o),p={},!m&&t.columnFormat&&(c.value=e.columnFormat["number-prepend"]),!v&&t.columnFormat&&(f.value=e.columnFormat["number-append"])},d:function(t){y.destroy(t),t&&N(n),w.destroy(t),t&&(N(r),N(o)),T(c,"input",E),T(f,"input",k)}}}function Di(t){var e=this;Y(this,t),this._state=y({columnFormat:{type:"auto",ignore:!1,"number-divisor":0,"number-format":"auto","number-prepend":"","number-append":""},colTypes:[],divisors_opts:[{value:0,label:Mr("describe / column-format / no-change")},{value:"auto",label:Mr("describe / column-format / automatic")}],divisors:[{label:Mr("describe / column-format / divide-by"),options:[{value:3,label:"1000"},{value:6,label:"1 million"},{value:9,label:"1 billion"}]},{label:Mr("describe / column-format / multiply-by"),options:[{value:-2,label:"100"},{value:-3,label:"1000"},{value:-6,label:"1 million"},{value:-9,label:"1 billion"},{value:-12,label:"1 trillion"}]}],numberFormats:[{label:Mr("Decimal places"),options:[{value:"n3",label:"3 (1,234.568)"},{value:"n2",label:"2 (1,234.57)"},{value:"n1",label:"1 (1,234.6)"},{value:"n0",label:"0 (1,235)"}]},{label:Mr("Significant digits"),options:[{value:"s6",label:"6 (1,234.57)"},{value:"s5",label:"5 (123.45)"},{value:"s4",label:"4 (12.34)"},{value:"s3",label:"3 (1.23)"},{value:"s2",label:"2 (0.12)"},{value:"s1",label:"1 (0.01)"}]}],roundOptions:[{value:"-",label:Mr("describe / column-format / individual")},{value:"auto",label:Mr("describe / column-format / auto-detect")}]},t.data),this._recompute({column:1},this._state),this._intro=!0,this._fragment=function(t,e){var n,r,o,i,a,s,u,c,l,f={},h={},p={label:Mr("Column type"),options:e.colTypes,width:"180px"};void 0!==e.columnFormat.type&&(p.value=e.columnFormat.type,f.value=!0);var d=new Ti({root:t.root,store:t.store,data:p,_bind:function(n,r){var o={};!f.value&&n.value&&(e.columnFormat.type=r.value,o.columnFormat=e.columnFormat),t._set(o),f={}}});t.root._beforecreate.push((function(){d._bind({value:1},d.get())}));var m={label:Mr("Hide column from visualization")};void 0!==e.columnFormat.ignore&&(m.value=e.columnFormat.ignore,h.value=!0);var v=new gi({root:t.root,store:t.store,data:m,_bind:function(n,r){var o={};!h.value&&n.value&&(e.columnFormat.ignore=r.value,o.columnFormat=e.columnFormat),t._set(o),h={}}});t.root._beforecreate.push((function(){v._bind({value:1},v.get())}));var g=e.column&&"number"==e.column.type()&&Fi(t,e);return{c:function(){n=O("div"),r=O("h3"),o=M(e.title),i=M("\n\n    "),a=O("div"),d._fragment.c(),s=M("\n\n        "),v._fragment.c(),u=M("\n\n        "),c=O("hr"),l=M("\n\n        "),g&&g.c(),r.className="first",a.className="form-horizontal"},m:function(t,e){x(t,n,e),_(n,r),_(r,o),_(n,i),_(n,a),d._mount(a,null),_(a,s),v._mount(a,null),_(a,u),_(a,c),_(a,l),g&&g.m(a,null)},p:function(n,r){e=r,n.title&&I(o,e.title);var i={};n.colTypes&&(i.options=e.colTypes),!f.value&&n.columnFormat&&(i.value=e.columnFormat.type,f.value=void 0!==e.columnFormat.type),d._set(i),f={};var s={};!h.value&&n.columnFormat&&(s.value=e.columnFormat.ignore,h.value=void 0!==e.columnFormat.ignore),v._set(s),h={},e.column&&"number"==e.column.type()?g?g.p(n,e):((g=Fi(t,e)).c(),g.m(a,null)):g&&(g.d(1),g=null)},d:function(t){t&&N(n),d.destroy(),v.destroy(),g&&g.d()}}}(this,this._state),this.root._oncreate.push((function(){ji.call(e),e.fire("update",{changed:b({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),q(this))}y(Di.prototype,Z),y(Di.prototype,Li),Di.prototype._recompute=function(t,e){var n;t.column&&this._differs(e.title,e.title=(n=e.column,Mr("describe / edit-column").replace("%s",'"'.concat(n?n.title()||n.name():"--",'"'))))&&(t.title=!0)};var Pi=Math.ceil,Hi=Math.max;var Ui=function(t,e,n,r){for(var o=-1,i=Hi(Pi((e-t)/(n||1)),0),a=Array(i);i--;)a[r?i:++o]=t,t+=n;return a};var Bi=function(t,e,n){if(!rt(n))return!1;var r=c(e);return!!("number"==r?we(n)&&ie(e,n.length):"string"==r&&e in n)&&ke(n[e],t)};var Vi=function(t){return t?(t=kt(t))===1/0||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0};var $i=function(t){return function(e,n,r){return r&&"number"!=typeof r&&Bi(e,n,r)&&(n=r=void 0),e=Vi(e),void 0===n?(n=e,e=0):n=Vi(n),r=void 0===r?e<n?1:-1:Vi(r),Ui(e,n,r,t)}}(),Wi=Object.prototype.hasOwnProperty,zi=xr((function(t,e,n){Wi.call(t,n)?++t[n]:qt(t,n,1)}));function qi(t){return(+t).toFixed(function(t){return Math.max(0,String(t-Math.floor(t)).replace(/00000*[0-9]+$/,"").replace(/33333*[0-9]+$/,"").replace(/99999*[0-9]+$/,"").length-2)}(t))}function Gi(t,e){return t<e?-1:t>e?1:t>=e?0:NaN}var Yi,Ki,Xi=(1===(Yi=Gi).length&&(Ki=Yi,Yi=function(t,e){return Gi(Ki(t),e)}),{left:function(t,e,n,r){for(null==n&&(n=0),null==r&&(r=t.length);n<r;){var o=n+r>>>1;Yi(t[o],e)<0?n=o+1:r=o}return n},right:function(t,e,n,r){for(null==n&&(n=0),null==r&&(r=t.length);n<r;){var o=n+r>>>1;Yi(t[o],e)>0?r=o:n=o+1}return n}}).right;function Ji(t,e){var n,r;if(void 0===e){var o=!0,i=!1,a=void 0;try{for(var s,u=t[Symbol.iterator]();!(o=(s=u.next()).done);o=!0){var c=s.value;null!=c&&(void 0===n?c>=c&&(n=r=c):(n>c&&(n=c),r<c&&(r=c)))}}catch(t){i=!0,a=t}finally{try{o||null==u.return||u.return()}finally{if(i)throw a}}}else{var l=-1,f=!0,h=!1,p=void 0;try{for(var d,m=t[Symbol.iterator]();!(f=(d=m.next()).done);f=!0){var v=d.value;null!=(v=e(v,++l,t))&&(void 0===n?v>=v&&(n=r=v):(n>v&&(n=v),r<v&&(r=v)))}}catch(t){h=!0,p=t}finally{try{f||null==m.return||m.return()}finally{if(h)throw p}}}return[n,r]}function Zi(t){return t}var Qi=Array.prototype.slice;function ta(t){return function(){return t}}function ea(t,e,n){t=+t,e=+e,n=(o=arguments.length)<2?(e=t,t=0,1):o<3?1:+n;for(var r=-1,o=0|Math.max(0,Math.ceil((e-t)/n)),i=new Array(o);++r<o;)i[r]=t+r*n;return i}var na=Math.sqrt(50),ra=Math.sqrt(10),oa=Math.sqrt(2);function ia(t,e,n){var r=(e-t)/Math.max(0,n),o=Math.floor(Math.log(r)/Math.LN10),i=r/Math.pow(10,o);return o>=0?(i>=na?10:i>=ra?5:i>=oa?2:1)*Math.pow(10,o):-Math.pow(10,-o)/(i>=na?10:i>=ra?5:i>=oa?2:1)}function aa(t,e,n){var r=Math.abs(e-t)/Math.max(0,n),o=Math.pow(10,Math.floor(Math.log(r)/Math.LN10)),i=r/o;return i>=na?o*=10:i>=ra?o*=5:i>=oa&&(o*=2),e<t?-o:o}function sa(t){return Math.ceil(Math.log(function(t,e){var n=0;if(void 0===e){var r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done);r=!0){var u=a.value;null!=u&&(u=+u)>=u&&++n}}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}}else{var c=-1,l=!0,f=!1,h=void 0;try{for(var p,d=t[Symbol.iterator]();!(l=(p=d.next()).done);l=!0){var m=p.value;null!=(m=e(m,++c,t))&&(m=+m)>=m&&++n}}catch(t){f=!0,h=t}finally{try{l||null==d.return||d.return()}finally{if(f)throw h}}}return n}(t))/Math.LN2)+1}function ua(){var t=Zi,e=Ji,n=sa;function r(r){Array.isArray(r)||(r=Array.from(r));var o,i,a=r.length,s=new Array(a);for(o=0;o<a;++o)s[o]=t(r[o],o,r);var u=e(s),c=u[0],l=u[1],f=n(s,c,l);Array.isArray(f)||(f=aa(c,l,f),f=ea(Math.ceil(c/f)*f,l,f));for(var h=f.length;f[0]<=c;)f.shift(),--h;for(;f[h-1]>l;)f.pop(),--h;var p,d=new Array(h+1);for(o=0;o<=h;++o)(p=d[o]=[]).x0=o>0?f[o-1]:c,p.x1=o<h?f[o]:l;for(o=0;o<a;++o)c<=(i=s[o])&&i<=l&&d[Xi(f,i,0,h)].push(r[o]);return d}return r.value=function(e){return arguments.length?(t="function"==typeof e?e:ta(e),r):t},r.domain=function(t){return arguments.length?(e="function"==typeof t?t:ta([t[0],t[1]]),r):e},r.thresholds=function(t){return arguments.length?(n="function"==typeof t?t:Array.isArray(t)?ta(Qi.call(t)):ta(t),r):n},r}function ca(t,e){var n;if(void 0===e){var r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done);r=!0){var u=a.value;null!=u&&(n<u||void 0===n&&u>=u)&&(n=u)}}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}}else{var c=-1,l=!0,f=!1,h=void 0;try{for(var p,d=t[Symbol.iterator]();!(l=(p=d.next()).done);l=!0){var m=p.value;null!=(m=e(m,++c,t))&&(n<m||void 0===n&&m>=m)&&(n=m)}}catch(t){f=!0,h=t}finally{try{l||null==d.return||d.return()}finally{if(f)throw h}}}return n}function la(t,e){var n;if(void 0===e){var r=!0,o=!1,i=void 0;try{for(var a,s=t[Symbol.iterator]();!(r=(a=s.next()).done);r=!0){var u=a.value;null!=u&&(n>u||void 0===n&&u>=u)&&(n=u)}}catch(t){o=!0,i=t}finally{try{r||null==s.return||s.return()}finally{if(o)throw i}}}else{var c=-1,l=!0,f=!1,h=void 0;try{for(var p,d=t[Symbol.iterator]();!(l=(p=d.next()).done);l=!0){var m=p.value;null!=(m=e(m,++c,t))&&(n>m||void 0===n&&m>=m)&&(n=m)}}catch(t){f=!0,h=t}finally{try{l||null==d.return||d.return()}finally{if(f)throw h}}}return n}function fa(t,e,n){var r=t[e];t[e]=t[n],t[n]=r}var ha=u((function(t){var e=function(t){var e=Object.prototype,n=e.hasOwnProperty,r="function"==typeof Symbol?Symbol:{},o=r.iterator||"@@iterator",i=r.asyncIterator||"@@asyncIterator",a=r.toStringTag||"@@toStringTag";function s(t,e,n,r){var o=e&&e.prototype instanceof f?e:f,i=Object.create(o.prototype),a=new N(r||[]);return i._invoke=function(t,e,n){var r="suspendedStart";return function(o,i){if("executing"===r)throw new Error("Generator is already running");if("completed"===r){if("throw"===o)throw i;return k()}for(n.method=o,n.arg=i;;){var a=n.delegate;if(a){var s=w(a,n);if(s){if(s===l)continue;return s}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===r)throw r="completed",n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);r="executing";var c=u(t,e,n);if("normal"===c.type){if(r=n.done?"completed":"suspendedYield",c.arg===l)continue;return{value:c.arg,done:n.done}}"throw"===c.type&&(r="completed",n.method="throw",n.arg=c.arg)}}}(t,n,a),i}function u(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}t.wrap=s;var l={};function f(){}function h(){}function p(){}var d={};d[o]=function(){return this};var m=Object.getPrototypeOf,v=m&&m(m(E([])));v&&v!==e&&n.call(v,o)&&(d=v);var g=p.prototype=f.prototype=Object.create(d);function y(t){["next","throw","return"].forEach((function(e){t[e]=function(t){return this._invoke(e,t)}}))}function b(t,e){var r;this._invoke=function(o,i){function a(){return new e((function(r,a){!function r(o,i,a,s){var l=u(t[o],t,i);if("throw"!==l.type){var f=l.arg,h=f.value;return h&&"object"===c(h)&&n.call(h,"__await")?e.resolve(h.__await).then((function(t){r("next",t,a,s)}),(function(t){r("throw",t,a,s)})):e.resolve(h).then((function(t){f.value=t,a(f)}),(function(t){return r("throw",t,a,s)}))}s(l.arg)}(o,i,r,a)}))}return r=r?r.then(a,a):a()}}function w(t,e){var n=t.iterator[e.method];if(void 0===n){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=void 0,w(t,e),"throw"===e.method))return l;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return l}var r=u(n,t.iterator,e.arg);if("throw"===r.type)return e.method="throw",e.arg=r.arg,e.delegate=null,l;var o=r.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,l):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,l)}function _(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function x(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function N(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(_,this),this.reset(!0)}function E(t){if(t){var e=t[o];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,i=function e(){for(;++r<t.length;)if(n.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=void 0,e.done=!0,e};return i.next=i}}return{next:k}}function k(){return{value:void 0,done:!0}}return h.prototype=g.constructor=p,p.constructor=h,p[a]=h.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===h||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,p):(t.__proto__=p,a in t||(t[a]="GeneratorFunction")),t.prototype=Object.create(g),t},t.awrap=function(t){return{__await:t}},y(b.prototype),b.prototype[i]=function(){return this},t.AsyncIterator=b,t.async=function(e,n,r,o,i){void 0===i&&(i=Promise);var a=new b(s(e,n,r,o),i);return t.isGeneratorFunction(n)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},y(g),g[a]="Generator",g[o]=function(){return this},g.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var r=e.pop();if(r in t)return n.value=r,n.done=!1,n}return n.done=!0,n}},t.values=E,N.prototype={constructor:N,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(x),!t)for(var e in this)"t"===e.charAt(0)&&n.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function r(n,r){return a.type="throw",a.arg=t,e.next=n,r&&(e.method="next",e.arg=void 0),!!r}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return r("end");if(i.tryLoc<=this.prev){var s=n.call(i,"catchLoc"),u=n.call(i,"finallyLoc");if(s&&u){if(this.prev<i.catchLoc)return r(i.catchLoc,!0);if(this.prev<i.finallyLoc)return r(i.finallyLoc)}else if(s){if(this.prev<i.catchLoc)return r(i.catchLoc,!0)}else{if(!u)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return r(i.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,l):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),l},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),x(n),l}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r=n.completion;if("throw"===r.type){var o=r.arg;x(n)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:E(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=void 0),l}},t}(t.exports);try{regeneratorRuntime=e}catch(t){Function("r","regeneratorRuntime = r")(e)}})),pa=ha.mark(da);function da(t,e){var n,r,o,i,a,s,u,c,l,f,h,p,d;return ha.wrap((function(m){for(;;)switch(m.prev=m.next){case 0:if(void 0!==e){m.next=30;break}n=!0,r=!1,o=void 0,m.prev=4,i=t[Symbol.iterator]();case 6:if(n=(a=i.next()).done){m.next=14;break}if(!(null!=(s=a.value)&&(s=+s)>=s)){m.next=11;break}return m.next=11,s;case 11:n=!0,m.next=6;break;case 14:m.next=20;break;case 16:m.prev=16,m.t0=m.catch(4),r=!0,o=m.t0;case 20:m.prev=20,m.prev=21,n||null==i.return||i.return();case 23:if(m.prev=23,!r){m.next=26;break}throw o;case 26:return m.finish(23);case 27:return m.finish(20);case 28:m.next=58;break;case 30:u=-1,c=!0,l=!1,f=void 0,m.prev=34,h=t[Symbol.iterator]();case 36:if(c=(p=h.next()).done){m.next=44;break}if(d=p.value,!(null!=(d=e(d,++u,t))&&(d=+d)>=d)){m.next=41;break}return m.next=41,d;case 41:c=!0,m.next=36;break;case 44:m.next=50;break;case 46:m.prev=46,m.t1=m.catch(34),l=!0,f=m.t1;case 50:m.prev=50,m.prev=51,c||null==h.return||h.return();case 53:if(m.prev=53,!l){m.next=56;break}throw f;case 56:return m.finish(53);case 57:return m.finish(50);case 58:case"end":return m.stop()}}),pa,null,[[4,16,20,28],[21,,23,27],[34,46,50,58],[51,,53,57]])}function ma(t,e,n){if(r=(t=Float64Array.from(da(t,n))).length){if((e=+e)<=0||r<2)return la(t);if(e>=1)return ca(t);var r,o=(r-1)*e,i=Math.floor(o),a=ca(function t(e,n){for(var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:e.length-1,i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:Gi;o>r;){if(o-r>600){var a=o-r+1,s=n-r+1,u=Math.log(a),c=.5*Math.exp(2*u/3),l=.5*Math.sqrt(u*c*(a-c)/a)*(s-a/2<0?-1:1),f=Math.max(r,Math.floor(n-s*c/a+l)),h=Math.min(o,Math.floor(n+(a-s)*c/a+l));t(e,n,f,h,i)}var p=e[n],d=r,m=o;for(fa(e,r,n),i(e[o],p)>0&&fa(e,r,o);d<m;){for(fa(e,d,m),++d,--m;i(e[d],p)<0;)++d;for(;i(e[m],p)>0;)--m}0===i(e[r],p)?fa(e,r,m):fa(e,++m,o),m<=n&&(r=m+1),n<=m&&(o=m-1)}return e}(t,i).subarray(0,i+1));return a+(la(t.subarray(i+1))-a)*(o-i)}}function va(t,e){switch(arguments.length){case 0:break;case 1:this.range(t);break;default:this.range(e).domain(t)}return this}var ga=Symbol("implicit");function ya(){var t=new Map,e=[],n=[],r=ga;function o(o){var i=o+"",a=t.get(i);if(!a){if(r!==ga)return r;t.set(i,a=e.push(o))}return n[(a-1)%n.length]}return o.domain=function(n){if(!arguments.length)return e.slice();e=[],t=new Map;var r=!0,i=!1,a=void 0;try{for(var s,u=n[Symbol.iterator]();!(r=(s=u.next()).done);r=!0){var c=s.value,l=c+"";t.has(l)||t.set(l,e.push(c))}}catch(t){i=!0,a=t}finally{try{r||null==u.return||u.return()}finally{if(i)throw a}}return o},o.range=function(t){return arguments.length?(n=Array.from(t),o):n.slice()},o.unknown=function(t){return arguments.length?(r=t,o):r},o.copy=function(){return ya(e,n).unknown(r)},va.apply(o,arguments),o}function ba(t,e,n){t.prototype=e.prototype=n,n.constructor=t}function wa(t,e){var n=Object.create(t.prototype);for(var r in e)n[r]=e[r];return n}function _a(){}var xa="\\s*([+-]?\\d+)\\s*",Na="\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",Ea="\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",ka=/^#([0-9a-f]{3,8})$/,Oa=new RegExp("^rgb\\("+[xa,xa,xa]+"\\)$"),Aa=new RegExp("^rgb\\("+[Ea,Ea,Ea]+"\\)$"),Ma=new RegExp("^rgba\\("+[xa,xa,xa,Na]+"\\)$"),Ca=new RegExp("^rgba\\("+[Ea,Ea,Ea,Na]+"\\)$"),Sa=new RegExp("^hsl\\("+[Na,Ea,Ea]+"\\)$"),Ta=new RegExp("^hsla\\("+[Na,Ea,Ea,Na]+"\\)$"),Ra={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};function Ia(){return this.rgb().formatHex()}function La(){return this.rgb().formatRgb()}function ja(t){var e,n;return t=(t+"").trim().toLowerCase(),(e=ka.exec(t))?(n=e[1].length,e=parseInt(e[1],16),6===n?Fa(e):3===n?new Ua(e>>8&15|e>>4&240,e>>4&15|240&e,(15&e)<<4|15&e,1):8===n?new Ua(e>>24&255,e>>16&255,e>>8&255,(255&e)/255):4===n?new Ua(e>>12&15|e>>8&240,e>>8&15|e>>4&240,e>>4&15|240&e,((15&e)<<4|15&e)/255):null):(e=Oa.exec(t))?new Ua(e[1],e[2],e[3],1):(e=Aa.exec(t))?new Ua(255*e[1]/100,255*e[2]/100,255*e[3]/100,1):(e=Ma.exec(t))?Da(e[1],e[2],e[3],e[4]):(e=Ca.exec(t))?Da(255*e[1]/100,255*e[2]/100,255*e[3]/100,e[4]):(e=Sa.exec(t))?Wa(e[1],e[2]/100,e[3]/100,1):(e=Ta.exec(t))?Wa(e[1],e[2]/100,e[3]/100,e[4]):Ra.hasOwnProperty(t)?Fa(Ra[t]):"transparent"===t?new Ua(NaN,NaN,NaN,0):null}function Fa(t){return new Ua(t>>16&255,t>>8&255,255&t,1)}function Da(t,e,n,r){return r<=0&&(t=e=n=NaN),new Ua(t,e,n,r)}function Pa(t){return t instanceof _a||(t=ja(t)),t?new Ua((t=t.rgb()).r,t.g,t.b,t.opacity):new Ua}function Ha(t,e,n,r){return 1===arguments.length?Pa(t):new Ua(t,e,n,null==r?1:r)}function Ua(t,e,n,r){this.r=+t,this.g=+e,this.b=+n,this.opacity=+r}function Ba(){return"#"+$a(this.r)+$a(this.g)+$a(this.b)}function Va(){var t=this.opacity;return(1===(t=isNaN(t)?1:Math.max(0,Math.min(1,t)))?"rgb(":"rgba(")+Math.max(0,Math.min(255,Math.round(this.r)||0))+", "+Math.max(0,Math.min(255,Math.round(this.g)||0))+", "+Math.max(0,Math.min(255,Math.round(this.b)||0))+(1===t?")":", "+t+")")}function $a(t){return((t=Math.max(0,Math.min(255,Math.round(t)||0)))<16?"0":"")+t.toString(16)}function Wa(t,e,n,r){return r<=0?t=e=n=NaN:n<=0||n>=1?t=e=NaN:e<=0&&(t=NaN),new qa(t,e,n,r)}function za(t){if(t instanceof qa)return new qa(t.h,t.s,t.l,t.opacity);if(t instanceof _a||(t=ja(t)),!t)return new qa;if(t instanceof qa)return t;var e=(t=t.rgb()).r/255,n=t.g/255,r=t.b/255,o=Math.min(e,n,r),i=Math.max(e,n,r),a=NaN,s=i-o,u=(i+o)/2;return s?(a=e===i?(n-r)/s+6*(n<r):n===i?(r-e)/s+2:(e-n)/s+4,s/=u<.5?i+o:2-i-o,a*=60):s=u>0&&u<1?0:a,new qa(a,s,u,t.opacity)}function qa(t,e,n,r){this.h=+t,this.s=+e,this.l=+n,this.opacity=+r}function Ga(t,e,n){return 255*(t<60?e+(n-e)*t/60:t<180?n:t<240?e+(n-e)*(240-t)/60:e)}function Ya(t){return function(){return t}}function Ka(t){return 1==(t=+t)?Xa:function(e,n){return n-e?function(t,e,n){return t=Math.pow(t,n),e=Math.pow(e,n)-t,n=1/n,function(r){return Math.pow(t+r*e,n)}}(e,n,t):Ya(isNaN(e)?n:e)}}function Xa(t,e){var n=e-t;return n?function(t,e){return function(n){return t+n*e}}(t,n):Ya(isNaN(t)?e:t)}ba(_a,ja,{copy:function(t){return Object.assign(new this.constructor,this,t)},displayable:function(){return this.rgb().displayable()},hex:Ia,formatHex:Ia,formatHsl:function(){return za(this).formatHsl()},formatRgb:La,toString:La}),ba(Ua,Ha,wa(_a,{brighter:function(t){return t=null==t?1/.7:Math.pow(1/.7,t),new Ua(this.r*t,this.g*t,this.b*t,this.opacity)},darker:function(t){return t=null==t?.7:Math.pow(.7,t),new Ua(this.r*t,this.g*t,this.b*t,this.opacity)},rgb:function(){return this},displayable:function(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:Ba,formatHex:Ba,formatRgb:Va,toString:Va})),ba(qa,(function(t,e,n,r){return 1===arguments.length?za(t):new qa(t,e,n,null==r?1:r)}),wa(_a,{brighter:function(t){return t=null==t?1/.7:Math.pow(1/.7,t),new qa(this.h,this.s,this.l*t,this.opacity)},darker:function(t){return t=null==t?.7:Math.pow(.7,t),new qa(this.h,this.s,this.l*t,this.opacity)},rgb:function(){var t=this.h%360+360*(this.h<0),e=isNaN(t)||isNaN(this.s)?0:this.s,n=this.l,r=n+(n<.5?n:1-n)*e,o=2*n-r;return new Ua(Ga(t>=240?t-240:t+120,o,r),Ga(t,o,r),Ga(t<120?t+240:t-120,o,r),this.opacity)},displayable:function(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl:function(){var t=this.opacity;return(1===(t=isNaN(t)?1:Math.max(0,Math.min(1,t)))?"hsl(":"hsla(")+(this.h||0)+", "+100*(this.s||0)+"%, "+100*(this.l||0)+"%"+(1===t?")":", "+t+")")}}));var Ja=function t(e){var n=Ka(e);function r(t,e){var r=n((t=Ha(t)).r,(e=Ha(e)).r),o=n(t.g,e.g),i=n(t.b,e.b),a=Xa(t.opacity,e.opacity);return function(e){return t.r=r(e),t.g=o(e),t.b=i(e),t.opacity=a(e),t+""}}return r.gamma=t,r}(1);function Za(t,e){e||(e=[]);var n,r=t?Math.min(e.length,t.length):0,o=e.slice();return function(i){for(n=0;n<r;++n)o[n]=t[n]*(1-i)+e[n]*i;return o}}function Qa(t,e){var n,r=e?e.length:0,o=t?Math.min(r,t.length):0,i=new Array(o),a=new Array(r);for(n=0;n<o;++n)i[n]=as(t[n],e[n]);for(;n<r;++n)a[n]=e[n];return function(t){for(n=0;n<o;++n)a[n]=i[n](t);return a}}function ts(t,e){var n=new Date;return t=+t,e=+e,function(r){return n.setTime(t*(1-r)+e*r),n}}function es(t,e){return t=+t,e=+e,function(n){return t*(1-n)+e*n}}function ns(t,e){var n,r={},o={};for(n in null!==t&&"object"===c(t)||(t={}),null!==e&&"object"===c(e)||(e={}),e)n in t?r[n]=as(t[n],e[n]):o[n]=e[n];return function(t){for(n in r)o[n]=r[n](t);return o}}var rs=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,os=new RegExp(rs.source,"g");function is(t,e){var n,r,o,i=rs.lastIndex=os.lastIndex=0,a=-1,s=[],u=[];for(t+="",e+="";(n=rs.exec(t))&&(r=os.exec(e));)(o=r.index)>i&&(o=e.slice(i,o),s[a]?s[a]+=o:s[++a]=o),(n=n[0])===(r=r[0])?s[a]?s[a]+=r:s[++a]=r:(s[++a]=null,u.push({i:a,x:es(n,r)})),i=os.lastIndex;return i<e.length&&(o=e.slice(i),s[a]?s[a]+=o:s[++a]=o),s.length<2?u[0]?function(t){return function(e){return t(e)+""}}(u[0].x):function(t){return function(){return t}}(e):(e=u.length,function(t){for(var n,r=0;r<e;++r)s[(n=u[r]).i]=n.x(t);return s.join("")})}function as(t,e){var n,r,o=c(e);return null==e||"boolean"===o?Ya(e):("number"===o?es:"string"===o?(n=ja(e))?(e=n,Ja):is:e instanceof ja?Ja:e instanceof Date?ts:(r=e,!ArrayBuffer.isView(r)||r instanceof DataView?Array.isArray(e)?Qa:"function"!=typeof e.valueOf&&"function"!=typeof e.toString||isNaN(e)?ns:es:Za))(t,e)}function ss(t,e){return t=+t,e=+e,function(n){return Math.round(t*(1-n)+e*n)}}function us(t){return+t}var cs=[0,1];function ls(t){return t}function fs(t,e){return(e-=t=+t)?function(n){return(n-t)/e}:(n=isNaN(e)?NaN:.5,function(){return n});var n}function hs(t,e,n){var r=t[0],o=t[1],i=e[0],a=e[1];return o<r?(r=fs(o,r),i=n(a,i)):(r=fs(r,o),i=n(i,a)),function(t){return i(r(t))}}function ps(t,e,n){var r=Math.min(t.length,e.length)-1,o=new Array(r),i=new Array(r),a=-1;for(t[r]<t[0]&&(t=t.slice().reverse(),e=e.slice().reverse());++a<r;)o[a]=fs(t[a],t[a+1]),i[a]=n(e[a],e[a+1]);return function(e){var n=Xi(t,e,1,r)-1;return i[n](o[n](e))}}function ds(t,e){return e.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp()).unknown(t.unknown())}function ms(){var t,e,n,r,o,i,a=cs,s=cs,u=as,c=ls;function l(){var t,e,n,u=Math.min(a.length,s.length);return c!==ls&&(t=a[0],e=a[u-1],t>e&&(n=t,t=e,e=n),c=function(n){return Math.max(t,Math.min(e,n))}),r=u>2?ps:hs,o=i=null,f}function f(e){return isNaN(e=+e)?n:(o||(o=r(a.map(t),s,u)))(t(c(e)))}return f.invert=function(n){return c(e((i||(i=r(s,a.map(t),es)))(n)))},f.domain=function(t){return arguments.length?(a=Array.from(t,us),l()):a.slice()},f.range=function(t){return arguments.length?(s=Array.from(t),l()):s.slice()},f.rangeRound=function(t){return s=Array.from(t),u=ss,l()},f.clamp=function(t){return arguments.length?(c=!!t||ls,l()):c!==ls},f.interpolate=function(t){return arguments.length?(u=t,l()):u},f.unknown=function(t){return arguments.length?(n=t,f):n},function(n,r){return t=n,e=r,l()}}function vs(){return ms()(ls,ls)}function gs(t,e){if((n=(t=e?t.toExponential(e-1):t.toExponential()).indexOf("e"))<0)return null;var n,r=t.slice(0,n);return[r.length>1?r[0]+r.slice(2):r,+t.slice(n+1)]}function ys(t){return(t=gs(Math.abs(t)))?t[1]:NaN}var bs,ws=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function _s(t){if(!(e=ws.exec(t)))throw new Error("invalid format: "+t);var e;return new xs({fill:e[1],align:e[2],sign:e[3],symbol:e[4],zero:e[5],width:e[6],comma:e[7],precision:e[8]&&e[8].slice(1),trim:e[9],type:e[10]})}function xs(t){this.fill=void 0===t.fill?" ":t.fill+"",this.align=void 0===t.align?">":t.align+"",this.sign=void 0===t.sign?"-":t.sign+"",this.symbol=void 0===t.symbol?"":t.symbol+"",this.zero=!!t.zero,this.width=void 0===t.width?void 0:+t.width,this.comma=!!t.comma,this.precision=void 0===t.precision?void 0:+t.precision,this.trim=!!t.trim,this.type=void 0===t.type?"":t.type+""}function Ns(t,e){var n=gs(t,e);if(!n)return t+"";var r=n[0],o=n[1];return o<0?"0."+new Array(-o).join("0")+r:r.length>o+1?r.slice(0,o+1)+"."+r.slice(o+1):r+new Array(o-r.length+2).join("0")}_s.prototype=xs.prototype,xs.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(void 0===this.width?"":Math.max(1,0|this.width))+(this.comma?",":"")+(void 0===this.precision?"":"."+Math.max(0,0|this.precision))+(this.trim?"~":"")+this.type};var Es={"%":function(t,e){return(100*t).toFixed(e)},b:function(t){return Math.round(t).toString(2)},c:function(t){return t+""},d:function(t){return Math.round(t).toString(10)},e:function(t,e){return t.toExponential(e)},f:function(t,e){return t.toFixed(e)},g:function(t,e){return t.toPrecision(e)},o:function(t){return Math.round(t).toString(8)},p:function(t,e){return Ns(100*t,e)},r:Ns,s:function(t,e){var n=gs(t,e);if(!n)return t+"";var r=n[0],o=n[1],i=o-(bs=3*Math.max(-8,Math.min(8,Math.floor(o/3))))+1,a=r.length;return i===a?r:i>a?r+new Array(i-a+1).join("0"):i>0?r.slice(0,i)+"."+r.slice(i):"0."+new Array(1-i).join("0")+gs(t,Math.max(0,e+i-1))[0]},X:function(t){return Math.round(t).toString(16).toUpperCase()},x:function(t){return Math.round(t).toString(16)}};function ks(t){return t}var Os,As,Ms,Cs=Array.prototype.map,Ss=["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];function Ts(t){var e,n,r=void 0===t.grouping||void 0===t.thousands?ks:(e=Cs.call(t.grouping,Number),n=t.thousands+"",function(t,r){for(var o=t.length,i=[],a=0,s=e[0],u=0;o>0&&s>0&&(u+s+1>r&&(s=Math.max(1,r-u)),i.push(t.substring(o-=s,o+s)),!((u+=s+1)>r));)s=e[a=(a+1)%e.length];return i.reverse().join(n)}),o=void 0===t.currency?"":t.currency[0]+"",i=void 0===t.currency?"":t.currency[1]+"",a=void 0===t.decimal?".":t.decimal+"",s=void 0===t.numerals?ks:function(t){return function(e){return e.replace(/[0-9]/g,(function(e){return t[+e]}))}}(Cs.call(t.numerals,String)),u=void 0===t.percent?"%":t.percent+"",c=void 0===t.minus?"-":t.minus+"",l=void 0===t.nan?"NaN":t.nan+"";function f(t){var e=(t=_s(t)).fill,n=t.align,f=t.sign,h=t.symbol,p=t.zero,d=t.width,m=t.comma,v=t.precision,g=t.trim,y=t.type;"n"===y?(m=!0,y="g"):Es[y]||(void 0===v&&(v=12),g=!0,y="g"),(p||"0"===e&&"="===n)&&(p=!0,e="0",n="=");var b="$"===h?o:"#"===h&&/[boxX]/.test(y)?"0"+y.toLowerCase():"",w="$"===h?i:/[%p]/.test(y)?u:"",_=Es[y],x=/[defgprs%]/.test(y);function N(t){var o,i,u,h=b,N=w;if("c"===y)N=_(t)+N,t="";else{var E=(t=+t)<0;if(t=isNaN(t)?l:_(Math.abs(t),v),g&&(t=function(t){t:for(var e,n=t.length,r=1,o=-1;r<n;++r)switch(t[r]){case".":o=e=r;break;case"0":0===o&&(o=r),e=r;break;default:if(o>0){if(!+t[r])break t;o=0}}return o>0?t.slice(0,o)+t.slice(e+1):t}(t)),E&&0==+t&&(E=!1),h=(E?"("===f?f:c:"-"===f||"("===f?"":f)+h,N=("s"===y?Ss[8+bs/3]:"")+N+(E&&"("===f?")":""),x)for(o=-1,i=t.length;++o<i;)if(48>(u=t.charCodeAt(o))||u>57){N=(46===u?a+t.slice(o+1):t.slice(o))+N,t=t.slice(0,o);break}}m&&!p&&(t=r(t,1/0));var k=h.length+t.length+N.length,O=k<d?new Array(d-k+1).join(e):"";switch(m&&p&&(t=r(O+t,O.length?d-N.length:1/0),O=""),n){case"<":t=h+t+N+O;break;case"=":t=h+O+t+N;break;case"^":t=O.slice(0,k=O.length>>1)+h+t+N+O.slice(k);break;default:t=O+h+t+N}return s(t)}return v=void 0===v?6:/[gprs]/.test(y)?Math.max(1,Math.min(21,v)):Math.max(0,Math.min(20,v)),N.toString=function(){return t+""},N}return{format:f,formatPrefix:function(t,e){var n=f(((t=_s(t)).type="f",t)),r=3*Math.max(-8,Math.min(8,Math.floor(ys(e)/3))),o=Math.pow(10,-r),i=Ss[8+r/3];return function(t){return n(o*t)+i}}}}function Rs(t,e,n,r){var o,i=aa(t,e,n);switch((r=_s(null==r?",f":r)).type){case"s":var a=Math.max(Math.abs(t),Math.abs(e));return null!=r.precision||isNaN(o=function(t,e){return Math.max(0,3*Math.max(-8,Math.min(8,Math.floor(ys(e)/3)))-ys(Math.abs(t)))}(i,a))||(r.precision=o),Ms(r,a);case"":case"e":case"g":case"p":case"r":null!=r.precision||isNaN(o=function(t,e){return t=Math.abs(t),e=Math.abs(e)-t,Math.max(0,ys(e)-ys(t))+1}(i,Math.max(Math.abs(t),Math.abs(e))))||(r.precision=o-("e"===r.type));break;case"f":case"%":null!=r.precision||isNaN(o=function(t){return Math.max(0,-ys(Math.abs(t)))}(i))||(r.precision=o-2*("%"===r.type))}return As(r)}function Is(t){var e=t.domain;return t.ticks=function(t){var n=e();return function(t,e,n){var r,o,i,a,s=-1;if(n=+n,(t=+t)===(e=+e)&&n>0)return[t];if((r=e<t)&&(o=t,t=e,e=o),0===(a=ia(t,e,n))||!isFinite(a))return[];if(a>0)for(t=Math.ceil(t/a),e=Math.floor(e/a),i=new Array(o=Math.ceil(e-t+1));++s<o;)i[s]=(t+s)*a;else for(t=Math.floor(t*a),e=Math.ceil(e*a),i=new Array(o=Math.ceil(t-e+1));++s<o;)i[s]=(t-s)/a;return r&&i.reverse(),i}(n[0],n[n.length-1],null==t?10:t)},t.tickFormat=function(t,n){var r=e();return Rs(r[0],r[r.length-1],null==t?10:t,n)},t.nice=function(n){null==n&&(n=10);var r,o=e(),i=0,a=o.length-1,s=o[i],u=o[a];return u<s&&(r=s,s=u,u=r,r=i,i=a,a=r),(r=ia(s,u,n))>0?r=ia(s=Math.floor(s/r)*r,u=Math.ceil(u/r)*r,n):r<0&&(r=ia(s=Math.ceil(s*r)/r,u=Math.floor(u*r)/r,n)),r>0?(o[i]=Math.floor(s/r)*r,o[a]=Math.ceil(u/r)*r,e(o)):r<0&&(o[i]=Math.ceil(s*r)/r,o[a]=Math.floor(u*r)/r,e(o)),t},t}function Ls(){var t=vs();return t.copy=function(){return ds(t,Ls())},va.apply(t,arguments),Is(t)}Os=Ts({decimal:".",thousands:",",grouping:[3],currency:["$",""],minus:"-"}),As=Os.format,Ms=Os.formatPrefix;var js=Ls(),Fs=function t(){var e,n,r=ya().unknown(void 0),o=r.domain,i=r.range,a=0,s=1,u=!1,c=0,l=0,f=.5;function h(){var t=o().length,r=s<a,h=r?s:a,p=r?a:s;e=(p-h)/Math.max(1,t-c+2*l),u&&(e=Math.floor(e)),h+=(p-h-e*(t-c))*f,n=e*(1-c),u&&(h=Math.round(h),n=Math.round(n));var d=ea(t).map((function(t){return h+e*t}));return i(r?d.reverse():d)}return delete r.unknown,r.domain=function(t){return arguments.length?(o(t),h()):o()},r.range=function(t){var e;return arguments.length?(e=nt(t,2),a=e[0],s=e[1],a=+a,s=+s,h()):[a,s]},r.rangeRound=function(t){var e;return e=nt(t,2),a=e[0],s=e[1],a=+a,s=+s,u=!0,h()},r.bandwidth=function(){return n},r.step=function(){return e},r.round=function(t){return arguments.length?(u=!!t,h()):u},r.padding=function(t){return arguments.length?(c=Math.min(1,l=+t),h()):c},r.paddingInner=function(t){return arguments.length?(c=Math.min(1,t),h()):c},r.paddingOuter=function(t){return arguments.length?(l=+t,h()):l},r.align=function(t){return arguments.length?(f=Math.max(0,Math.min(1,t)),h()):f},r.copy=function(){return t(o(),[a,s]).round(u).paddingInner(c).paddingOuter(l).align(f)},va.apply(h(),arguments)}(),Ds=Ls(),Ps=function(t){return t?t<.01?"<1%":(100*t).toFixed(0)+"%":"0%"};function Hs(t){var e,n=t.validValues,r=t.format,o=la(n),i=ca(n),a=function(t,e){var n=0,r=0;if(void 0===e){var o=!0,i=!1,a=void 0;try{for(var s,u=t[Symbol.iterator]();!(o=(s=u.next()).done);o=!0){var c=s.value;null!=c&&(c=+c)>=c&&(++n,r+=c)}}catch(t){i=!0,a=t}finally{try{o||null==u.return||u.return()}finally{if(i)throw a}}}else{var l=-1,f=!0,h=!1,p=void 0;try{for(var d,m=t[Symbol.iterator]();!(f=(d=m.next()).done);f=!0){var v=d.value;null!=(v=e(v,++l,t))&&(v=+v)>=v&&(++n,r+=v)}}catch(t){h=!0,p=t}finally{try{f||null==m.return||m.return()}finally{if(h)throw p}}}if(n)return r/n}(n),s=ma(n,.5,e);return[{x:o,label:r(o),name:"Min"},{x:i,label:r(i),name:"Max"},{x:a,label:r(a),name:Mr("describe / histogram / mean")},{x:s,label:r(s),name:Mr("describe / histogram / median")}]}function Us(t,e,n,r){return(0===e?Mr("describe / histogram / tooltip / first"):e===n.length-1?Mr("describe / histogram / tooltip / last"):Mr("describe / histogram / tooltip")).replace("$1",t.length).replace("$2",Ps(t.length/r)).replace("$3",qi(t.x0)).replace("$4",qi(t.x1))}function Bs(){this.resize()}function Vs(t){var e=this._svelte,n=e.component,r=e.ctx;n.show(r.s)}function $s(t){this._svelte.component.show(!1)}function Ws(t,e,n){var r=Object.create(t);return r.s=e[n],r}function zs(t,e,n){var r=Object.create(t);return r.bin=e[n],r.i=n,r}function qs(t,e,n){var r=Object.create(t);return r.tick=e[n],r}function Gs(t,e){var n,r,o,i,a,s=e.tick.label;return{c:function(){n=A("g"),r=A("line"),o=A("text"),i=M(s),R(r,"y2","3"),R(r,"class","svelte-p5ucpx"),R(o,"y","5"),R(o,"class","svelte-p5ucpx"),R(n,"class","tick svelte-p5ucpx"),R(n,"transform",a="translate("+e.xScale(e.tick.x)+",0)")},m:function(t,e){x(t,n,e),_(n,r),_(n,o),_(o,i)},p:function(t,e){t.ticks&&s!==(s=e.tick.label)&&I(i,s),(t.xScale||t.ticks)&&a!==(a="translate("+e.xScale(e.tick.x)+",0)")&&R(n,"transform",a)},d:function(t){t&&N(n)}}}function Ys(t,e){var n,r;return{c:function(){R(n=A("polygon"),"transform",r="translate("+e.xScale(e.highlight.x)+",0)"),R(n,"points","0,0,4,6,-4,6")},m:function(t,e){x(t,n,e)},p:function(t,e){(t.xScale||t.highlight)&&r!==(r="translate("+e.xScale(e.highlight.x)+",0)")&&R(n,"transform",r)},d:function(t){t&&N(n)}}}function Ks(t,e){var n,r,o,i,a,s,u,c=Us(e.bin,e.i,e.bins,e.validValues.length);return{c:function(){n=A("g"),r=A("title"),o=M(c),R(i=A("rect"),"width",a=e.bin.x1!=e.bin.x0?e.xScaleBand.bandwidth():20),R(i,"height",s=e.innerHeight-e.yScale(e.bin.length)),R(i,"class","svelte-p5ucpx"),R(n,"class","bar"),R(n,"transform",u="translate("+e.xScaleBand(e.bin.x0)+","+e.yScale(e.bin.length)+")")},m:function(t,e){x(t,n,e),_(n,r),_(r,o),_(n,i)},p:function(t,e){(t.bins||t.validValues)&&c!==(c=Us(e.bin,e.i,e.bins,e.validValues.length))&&I(o,c),(t.bins||t.xScaleBand)&&a!==(a=e.bin.x1!=e.bin.x0?e.xScaleBand.bandwidth():20)&&R(i,"width",a),(t.innerHeight||t.yScale||t.bins)&&s!==(s=e.innerHeight-e.yScale(e.bin.length))&&R(i,"height",s),(t.xScaleBand||t.bins||t.yScale)&&u!==(u="translate("+e.xScaleBand(e.bin.x0)+","+e.yScale(e.bin.length)+")")&&R(n,"transform",u)},d:function(t){t&&N(n)}}}function Xs(t,e){var n,r,o,i,a,s=e.s.name,u=e.s.label;return{c:function(){n=O("li"),r=M(s),o=M(": "),i=O("tt"),a=M(u),i._svelte={component:t,ctx:e},S(i,"mouseleave",$s),S(i,"mouseenter",Vs),i.className="svelte-p5ucpx",n.className="svelte-p5ucpx"},m:function(t,e){x(t,n,e),_(n,r),_(n,o),_(n,i),_(i,a)},p:function(t,n){e=n,t.stats&&s!==(s=e.s.name)&&I(r,s),t.stats&&u!==(u=e.s.label)&&I(a,u),i._svelte.ctx=e},d:function(t){t&&N(n),T(i,"mouseleave",$s),T(i,"mouseenter",Vs)}}}function Js(t,e){var n,r,o,i,a,s,u,c,l=Mr("describe / histogram / invalid"),f=Ps(e.NAs/e.values.length);return{c:function(){n=O("li"),r=M(l),o=M(":\n        "),i=O("tt"),a=M(e.NAs),s=M(" ("),u=M(f),c=M(")"),L(i,"color","#c71e1d"),i.className="svelte-p5ucpx",n.className="svelte-p5ucpx"},m:function(t,e){x(t,n,e),_(n,r),_(n,o),_(n,i),_(i,a),_(n,s),_(n,u),_(n,c)},p:function(t,e){t.NAs&&I(a,e.NAs),(t.NAs||t.values)&&f!==(f=Ps(e.NAs/e.values.length))&&I(u,f)},d:function(t){t&&N(n)}}}function Zs(t){var e=this;Y(this,t),this.refs={},this._state=y({format:function(t){return t},t:0,padding:{top:10,right:65,bottom:20,left:5},height:200,width:500,values:[],highlight:!1},t.data),this._recompute({values:1,validValues:1,format:1,niceDomain:1,width:1,padding:1,bins:1,innerWidth:1,xScaleBand:1,xScale:1,height:1,innerHeight:1},this._state),this._intro=!0,this._fragment=function(t,e){for(var n,r,o,i,a,s,u,c,l,f,h,p,d,m,v,g=Mr("describe / histogram"),y=Mr("describe / histogram / learn-more"),b=e.ticks,w=[],k=0;k<b.length;k+=1)w[k]=Gs(t,qs(e,b,k));var S=e.highlight&&Ys(t,e),T=e.bins,I=[];for(k=0;k<T.length;k+=1)I[k]=Ks(t,zs(e,T,k));var L=e.stats,j=[];for(k=0;k<L.length;k+=1)j[k]=Xs(t,Ws(e,L,k));var F=e.NAs>0&&Js(t,e);return{c:function(){n=O("h3"),r=M(g),o=M("\n"),i=A("svg"),a=A("g"),s=A("g");for(var t=0;t<w.length;t+=1)w[t].c();u=C(),S&&S.c(),l=A("g");for(t=0;t<I.length;t+=1)I[t].c();h=M("\n"),p=O("ul");for(t=0;t<j.length;t+=1)j[t].c();d=M(" "),F&&F.c(),m=M("\n"),v=O("p"),n.className="svelte-p5ucpx",R(s,"class","axis x-axis svelte-p5ucpx"),R(s,"transform",c="translate(0, "+e.innerHeight+")"),R(l,"class","bars svelte-p5ucpx"),R(a,"transform",f="translate("+[e.padding.left,e.padding.top]+")"),R(i,"class","svelte-p5ucpx"),p.className="svelte-p5ucpx",v.className="learn-more"},m:function(e,c){x(e,n,c),_(n,r),x(e,o,c),x(e,i,c),_(i,a),_(a,s);for(var f=0;f<w.length;f+=1)w[f].m(s,null);_(s,u),S&&S.m(s,null),_(a,l);for(f=0;f<I.length;f+=1)I[f].m(l,null);t.refs.svg=i,x(e,h,c),x(e,p,c);for(f=0;f<j.length;f+=1)j[f].m(p,null);_(p,d),F&&F.m(p,null),x(e,m,c),x(e,v,c),v.innerHTML=y},p:function(e,n){if(e.xScale||e.ticks){b=n.ticks;for(var r=0;r<b.length;r+=1){var o=qs(n,b,r);w[r]?w[r].p(e,o):(w[r]=Gs(t,o),w[r].c(),w[r].m(s,u))}for(;r<w.length;r+=1)w[r].d(1);w.length=b.length}if(n.highlight?S?S.p(e,n):((S=Ys(t,n)).c(),S.m(s,null)):S&&(S.d(1),S=null),e.innerHeight&&c!==(c="translate(0, "+n.innerHeight+")")&&R(s,"transform",c),e.xScaleBand||e.bins||e.yScale||e.innerHeight||e.validValues){T=n.bins;for(r=0;r<T.length;r+=1){var i=zs(n,T,r);I[r]?I[r].p(e,i):(I[r]=Ks(t,i),I[r].c(),I[r].m(l,null))}for(;r<I.length;r+=1)I[r].d(1);I.length=T.length}if(e.padding&&f!==(f="translate("+[n.padding.left,n.padding.top]+")")&&R(a,"transform",f),e.stats){L=n.stats;for(r=0;r<L.length;r+=1){var h=Ws(n,L,r);j[r]?j[r].p(e,h):(j[r]=Xs(t,h),j[r].c(),j[r].m(p,d))}for(;r<j.length;r+=1)j[r].d(1);j.length=L.length}n.NAs>0?F?F.p(e,n):((F=Js(t,n)).c(),F.m(p,null)):F&&(F.d(1),F=null)},d:function(e){e&&(N(n),N(o),N(i)),E(w,e),S&&S.d(),E(I,e),t.refs.svg===i&&(t.refs.svg=null),e&&(N(h),N(p)),E(j,e),F&&F.d(),e&&(N(m),N(v))}}}(this,this._state),this.root._oncreate.push((function(){Bs.call(e),e.fire("update",{changed:b({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),q(this))}y(Zs.prototype,Z),y(Zs.prototype,{show:function(t){this.set({highlight:t})},resize:function(){var t=this.refs.svg.getBoundingClientRect();this.set({width:t.right-t.left,height:t.bottom-t.top})}}),Zs.prototype._recompute=function(t,e){var n,r,o;t.values&&(this._differs(e.NAs,e.NAs=e.values.filter((function(t){return"string"==typeof t||Number.isNaN(t)})).length)&&(t.NAs=!0),this._differs(e.validValues,e.validValues=e.values.filter((function(t){return"number"==typeof t&&!Number.isNaN(t)})))&&(t.validValues=!0)),(t.validValues||t.format)&&this._differs(e.stats,e.stats=Hs(e))&&(t.stats=!0),t.validValues&&this._differs(e.niceDomain,e.niceDomain=function(t){var e=t.validValues;return Ls().domain(Ji(e)).nice().domain()}(e))&&(t.niceDomain=!0),(t.niceDomain||t.validValues)&&this._differs(e.bins,e.bins=function(t){var e=t.niceDomain,n=t.validValues,r=e,o=ua().domain(r).thresholds(sa)(n),i=zi(o.map((function(t){return t.x1-t.x0})));if(o.length>2&&Object.keys(i).length>1){var a=o[1].x1-o[1].x0,s=r[0]+Math.ceil((r[1]-r[0])/a)*a;return ua().domain([r[0],s]).thresholds($i(r[0],s+.4*a,a))(n)}return o}(e))&&(t.bins=!0),(t.width||t.padding)&&this._differs(e.innerWidth,e.innerWidth=(r=(n=e).width,o=n.padding,r-o.left-o.right))&&(t.innerWidth=!0),(t.bins||t.innerWidth)&&this._differs(e.xScaleBand,e.xScaleBand=function(t){var e=t.bins,n=t.innerWidth;return Fs.domain(e.map((function(t){return t.x0}))).paddingInner(.1).rangeRound([0,n]).align(0)}(e))&&(t.xScaleBand=!0),(t.niceDomain||t.bins||t.xScaleBand)&&this._differs(e.xScale,e.xScale=function(t){var e=t.niceDomain,n=t.bins,r=t.xScaleBand;return js.domain(e).rangeRound([0,r.step()*n.length])}(e))&&(t.xScale=!0),(t.xScale||t.format)&&this._differs(e.ticks,e.ticks=function(t){var e=t.xScale,n=t.format;return e.ticks(4).map((function(t){return{x:t,label:n(t)}}))}(e))&&(t.ticks=!0),(t.height||t.padding)&&this._differs(e.innerHeight,e.innerHeight=function(t){var e=t.height,n=t.padding;return e-n.bottom-n.top}(e))&&(t.innerHeight=!0),(t.innerHeight||t.bins)&&this._differs(e.yScale,e.yScale=function(t){var e=t.innerHeight,n=t.bins;return Ds.domain([0,ca(n,(function(t){return t.length}))]).range([e,0])}(e))&&(t.yScale=!0),(t.bins||t.xScale)&&this._differs(e.barWidth,e.barWidth=function(t){var e=t.bins,n=t.xScale;return n(e[0].x1)-n(e[0].x0)-1}(e))&&(t.barWidth=!0)};var Qs=/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,tu=/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;function eu(t,e){if(null===t)return null;if(void 0!==t){if((t=String(t)).indexOf("<")<0||t.indexOf(">")<0)return t;if(t=function(t,e){e=(((void 0!==e?e||"":"<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>")+"").toLowerCase().match(/<[a-z][a-z0-9]*>/g)||[]).join("");var n=t,r=t;for(;;)if(r=(n=r).replace(tu,"").replace(Qs,(function(t,n){return e.indexOf("<"+n.toLowerCase()+">")>-1?t:""})),n===r)return r}(t,e),"undefined"==typeof document)return t;var n=document.createElement("div");n.innerHTML=t;for(var r=n.querySelectorAll("*"),o=0;o<r.length;o++){"a"===r[o].nodeName.toLowerCase()&&("_self"!==r[o].getAttribute("target")&&r[o].setAttribute("target","_blank"),r[o].setAttribute("rel","nofollow noopener noreferrer"),r[o].getAttribute("href")&&r[o].getAttribute("href").trim().startsWith("javascript:")&&r[o].setAttribute("href",""));for(var i=0;i<r[o].attributes.length;i++){var a=r[o].attributes[i];a.specified&&"on"===a.name.substr(0,2)&&r[o].removeAttribute(a.name)}}return n.innerHTML}}function nu(t,e,n,r){var o={date:"fa fa-clock-o"};return function(i,a,s,u,c,l,f){if(!(n.numColumns()<=u)&&n.hasColumn(u)){var h=n.column(u),p=t.get(),d=p.searchResults,m=p.currentResult,v=p.activeColumn,g=t.getColumnFormat(h.name());if((s=i.toPhysicalRow(s))>0){var y=e.columnFormatter(h);l=null===h.val(s-1)||""===h.val(s-1)?"–":y(h.val(s-1),!0)}parseInt(l)<0&&a.classList.add("negative"),a.classList.add(h.type()+"Type"),a.dataset.column=u,"text"===h.type()&&l&&l.length>70&&(l=l.substr(0,60)+"…"),0===s?(a.classList.add("firstRow"),o[h.type()]&&(l='<i class="'+o[h.type()]+'"></i> '+l)):a.classList.add(s%2?"oddRow":"evenRow"),g.ignore&&a.classList.add("ignored"),v&&v.name()===h.name()&&a.classList.add("active");var b=r.hooks.run(i,"modifyRow",s);d.forEach((function(t){t.row===b&&t.col===u&&a.classList.add("htSearchResult")})),m&&m.row===b&&m.col===u&&a.classList.add("htCurrentSearchResult"),s>0&&!h.type(!0).isValid(h.val(s-1))&&null!==h.val(s-1)&&""!==h.val(s-1)&&a.classList.add("parsingError"),s>0&&(null===h.val(s-1)||""===h.val(s-1))&&a.classList.add("noData"),h.isComputed&&h.errors.length&&h.errors.find((function(t){return"all"===t.row||t.row===s-1}))&&a.classList.add("parsingError"),f.readOnly&&a.classList.add("readOnly"),e.dataCellChanged(u,s)&&a.classList.add("changed"),function(t,e,n,o,i,a,s){var u=eu(r.helper.stringify(a));e.innerHTML=u}(0,a,0,0,0,l)}}}var ru=null,ou=null;var iu={render:function(){this.get().hot.render()},doSearch:function(){var t=this,e=this.get(),n=e.hot,r=e.search;clearTimeout(ou),ou=setTimeout((function(){if(n&&r){var e=n.getPlugin("search").query(r);t.set({searchResults:e})}else t.set({searchResults:[]})}),300)},update:function(){var t=this,e=this.get(),n=e.data,r=e.transpose,o=e.firstRowIsHeader,i=e.skipRows,s=e.hot;if(n){var u=this.store.get().dw_chart,c=u.dataset(dw.datasource.delimited({csv:n,transpose:r,firstRowIsHeader:o,skipRows:i}).parse()).dataset();this.set({columnOrder:c.columnOrder()});var l=[[]];c.eachColumn((function(t){return l[0].push(t.title())})),c.eachRow((function(t){var e=[];c.eachColumn((function(n){return e.push(n.raw(t))})),l.push(e)})),s.loadData(l);var f=nu(this,u,c,a);s.updateSettings({cells:function(e,n){return{readOnly:t.get().readonly||c.hasColumn(n)&&c.column(n).isComputed&&0===e,renderer:f}},manualColumnMove:[]}),this.set({ds:c}),this.set({has_changes:kr(chart.get("metadata.data.changes",[])).length>0}),a.hooks.once("afterRender",(function(){return t.initCustomEvents()})),a.hooks.once("afterRender",(function(){return t.fire("afterRender")})),s.render()}},dataChanged:function(t){var e=this,n=this.get().hot,r=!1;t.forEach((function(t){var o=nt(t,4),i=o[0],a=o[1],s=o[2],u=o[3];if(s!==u){var c=e.store.get().dw_chart,l=e.get().transpose,f=kr(c.get("metadata.data.changes",[]));if(i=n.toPhysicalRow(i),a=c.dataset().columnOrder()[a],l){var h=i;i=a,a=h}f.push({column:a,row:i,value:u,previous:s,time:(new Date).getTime()}),c.set("metadata.data.changes",f),r=!0}})),r&&setTimeout((function(){e.update(),chart.save()}),100)},columnMoved:function(t,e){var n=this,r=this.get().hot;if(t.length){var o=this.get().columnOrder,i=o.slice(0),s=o[e],u=i.splice(t[0],t.length),c=void 0===s?i.length:s?i.indexOf(s):0;i.splice.apply(i,[c,0].concat(m(u))),this.store.get().dw_chart.set("metadata.data.column-order",i.slice(0)),this.set({columnOrder:i}),a.hooks.once("afterRender",(function(){setTimeout((function(){n.fire("resetSort"),r.selectCell(0,c,r.countRows()-1,c+u.length-1)}),10)})),this.update()}},updateHeight:function(){var t=document.querySelector(".ht_master.handsontable .wtHolder .wtHider").getBoundingClientRect().height;this.refs.hot.style.height=Math.min(500,t+10)+"px"},checkRange:function(t,e,n,r){var o=this.get().hot,i=this.get().ds;if(e!==r||0!==t||n!==o.countRows()-1)if(e===r||0!==t||n!==o.countRows()-1)this.set({activeColumn:null,multiSelection:!1});else{for(var a=[],s=Math.min(e,r);s<=Math.max(e,r);s++)a.push(+document.querySelector("#data-preview .htCore tbody tr:first-child td:nth-child(".concat(s+2,")")).dataset.column);this.set({multiSelection:a.map((function(t){return i.column(t)})),activeColumn:null})}},initCustomEvents:function(){var t=this;setTimeout((function(){t.refs.hot.querySelectorAll(".htCore thead th:first-child").forEach((function(t){t.removeEventListener("click",cu),t.addEventListener("click",cu)})),t.refs.hot.querySelectorAll(".htCore thead th+th").forEach((function(t){t.removeEventListener("click",uu),t.addEventListener("click",uu)}))}),500)},getColumnFormat:function(t){return this.store.get().dw_chart.get("metadata.data.column-format",{})[t]||{type:"auto",ignore:!1}}};function au(){var t=this;ru=this,a.hooks.once("afterRender",(function(){return t.initCustomEvents()})),window.addEventListener("keyup",(function(e){var n=t.get(),r=n.activeColumn,o=n.ds;if(r&&"input"!==e.target.tagName.toLowerCase()&&"textarea"!==e.target.tagName.toLowerCase()&&("ArrowRight"===e.key||"ArrowLeft"===e.key)){e.preventDefault(),e.stopPropagation();var i=o.indexOf(r.name());"ArrowRight"===e.key?t.set({activeColumn:o.column((i+1)%o.numColumns())}):t.set({activeColumn:o.column((i-1+o.numColumns())%o.numColumns())})}}));var e=this.store.get().dw_chart,n=new a(this.refs.hot,{data:[],rowHeaders:function(t){return a.hooks.run(n,"modifyRow",t)+1},colHeaders:!0,fixedRowsTop:1,fixedColumnsLeft:this.get().fixedColumnsLeft,filters:!0,startRows:13,startCols:8,fillHandle:!1,stretchH:"all",height:500,manualColumnMove:!0,selectionMode:"range",autoColumnSize:{useHeaders:!0,syncLimit:5},sortIndicator:!0,columnSorting:!0,sortFunction:function(t,n){if(n.col>-1){var r=e.dataset().column(n.col),o=r.type();return function(e,n){return 0===e[0]?-1:(e[1]=r.val(e[0]-1),n[1]=r.val(n[0]-1),"number"===o&&(isNaN(e[1])&&(e[1]=t?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY),isNaN(n[1])&&(n[1]=t?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY)),"date"===o&&("string"==typeof e[1]&&(e[1]=new Date(110,0,1)),"string"==typeof n[1]&&(n[1]=new Date(110,0,1))),("desc"===t?-1:1)*(e[1]>n[1]?1:e[1]<n[1]?-1:0))}}return function(t,e){return t[0]-e[0]}},afterGetColHeader:function(e,n){var r=t.get(),o=r.activeColumn,i=r.ds;i&&i.hasColumn(e)&&((0===e||e)&&o&&i.column(e).name()===o.name()&&n.classList.add("selected"),(0===e||e)&&(t.getColumnFormat(i.column(e).name()).ignore?n.classList.add("ignored"):n.classList.remove("ignored")))},search:"search"});window.HT=n,this.set({hot:n}),a.hooks.add("afterSetDataAtCell",(function(e){return t.dataChanged(e)})),a.hooks.add("afterColumnMove",(function(e,n){return t.columnMoved(e,n)})),a.hooks.add("afterRender",(function(){return t.updateHeight()})),a.hooks.add("afterSelection",(function(e,n,r,o){return t.checkRange(e,n,r,o)}))}function su(t){var e=t.changed,n=t.current,r=t.previous,o=n.hot;if(o){if(e.data&&this.update(),e.firstRowIsHeader&&r&&void 0!==r.firstRowIsHeader&&this.update(),e.hot&&this.update(),e.search&&r&&(this.doSearch(),this.set({searchIndex:0})),e.searchResults&&o.render(),e.currentResult&&n.currentResult){o.render();var i=n.currentResult;o.scrollViewportTo(i.row,i.col),setTimeout((function(){o.scrollViewportTo(i.row,i.col)}),100)}e.activeColumn&&setTimeout((function(){return o.render()}),10),e.fixedColumnsLeft&&o.updateSettings({fixedColumnsLeft:n.fixedColumnsLeft}),e.sorting&&o.getPlugin("columnSorting").sort(chart.dataset().indexOf(n.sorting.sortBy),n.sorting.sortDir?"asc":"desc")}}function uu(t){for(var e=this.parentNode.children.length,n=-1,r=0;r<e;r++)if(this.parentNode.children.item(r)===this){n=r;break}var o=+ru.refs.hot.querySelector(".htCore tbody tr:first-child td:nth-child(".concat(n+1,")")).dataset.column,i=ru.store.get().dw_chart,a=ru.get(),s=a.activeColumn,u=a.hot;if(i.dataset().hasColumn(o)){var c=i.dataset().column(+o);s&&s.name()===c.name()?(t.target.parentNode.classList.remove("selected"),ru.set({activeColumn:!1}),u.deselectCell()):(t.target.parentNode.classList.add("selected"),ru.set({activeColumn:c}))}}function cu(t){t.preventDefault();var e=ru.get().transpose;ru.set({transpose:!e}),ru.update()}function lu(t){var e=this;Y(this,t),this.refs={},this._state=y({hot:null,data:"",readonly:!1,skipRows:0,firstRowIsHeader:!0,fixedColumnsLeft:0,searchIndex:0,sortBy:"-",transpose:!1,activeColumn:null,search:"",searchResults:[]},t.data),this._recompute({searchResults:1,searchIndex:1},this._state),this._intro=!0,this._handlers.state=[su],su.call(this,{changed:b({},this._state),current:this._state}),this._fragment=function(t,e){var n;return{c:function(){(n=O("div")).id="data-preview"},m:function(e,r){x(e,n,r),t.refs.hot=n},p:g,d:function(e){e&&N(n),t.refs.hot===n&&(t.refs.hot=null)}}}(this,this._state),this.root._oncreate.push((function(){au.call(e),e.fire("update",{changed:b({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),q(this))}y(lu.prototype,Z),y(lu.prototype,iu),lu.prototype._recompute=function(t,e){(t.searchResults||t.searchIndex)&&this._differs(e.currentResult,e.currentResult=function(t){var e=t.searchResults,n=t.searchIndex;if(!e||!e.length)return null;var r=e.length;if(n<0||n>=r){for(;n<0;)n+=r;n>r&&(n%=r)}return e[n]}(e))&&(t.currentResult=!0)};var fu={nextResult:function(t){var e=this.get(),n=e.searchIndex,r=e.searchResults;(n+=t)<0&&(n+=r.length),n%=r.length,this.set({searchIndex:n})},keyPress:function(t){"F3"!==t.key&&"Enter"!==t.key||this.nextResult(t.shiftKey?-1:1)},toggleTranspose:function(){var t=this;this.set({activeColumn:!1}),this.set({transpose:!this.get().transpose}),setTimeout((function(){return t.refs.hot.update()}),500)},revertChanges:function(){var t=this.store.get().dw_chart;t.set("metadata.data.changes",[]),t.saveSoon(),this.refs.hot.update()},cmFocus:function(){var t=this;setTimeout((function(){t.refs.hot.get().hot.render()}),100)},addComputedColumn:function(){for(var t=this.store.get().dw_chart,e=t.dataset(),n=Io(t),r=1;e.hasColumn("Column ".concat(r));)r++;var o="Column ".concat(r);n.push({name:o,formula:""}),t.set("metadata.describe.computed-columns",n),t.saveSoon();var i=t.dataset(!0);this.refs.hot.update(),this.set({activeColumn:i.column(o)}),this.store.set({dw_chart:t})},sort:function(t,e,n){t.preventDefault(),t.stopPropagation(),this.set({sortBy:e,sortDir:n}),this.refs.sortDropdownGroup.classList.remove("open")},force:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];t.preventDefault(),this.set({forceColumnFormat:e})},hideMultiple:function(t,e){var n=this,r=this.store.get().dw_chart,o=kr(r.get("metadata.data.column-format",{}));t.forEach((function(t){o[t.name()]?o[t.name()].ignore=e:o[t.name()]={type:"auto",ignore:e}})),r.set("metadata.data.column-format",o),r.saveSoon(),setTimeout((function(){n.refs.hot.get().hot.render()}),10),this.set({multiSelection:!1})},afterRender:function(){this.refs.ccEd&&this.refs.ccEd.fire("hotRendered")}};function hu(){var t=this;window.addEventListener("keypress",(function(e){e.ctrlKey&&"f"===e.key&&(e.preventDefault(),t.refs.search!==window.document.activeElement?t.refs.search.focus():t.nextResult(1))}))}function pu(t){var e=this,n=t.changed,r=t.current;n.activeColumn&&!r.activeColumn&&this.set({forceColumnFormat:!1});var o={transpose:"metadata.data.transpose",firstRowIsHeader:"metadata.data.horizontal-header",locale:"language"};Object.keys(o).forEach((function(t){if(n[t]){var i=r[t],a=o[t];if(e.store.get().dw_chart.set("".concat(a),i),"locale"===t){if(!i)return;e.store.get().dw_chart.locale(i,(function(){e.refs.hot.render()}))}}}))}function du(t){var e=this._svelte,n=e.component,r=e.ctx;n.sort(t,r.col.name(),!0)}function mu(t){var e=this._svelte,n=e.component,r=e.ctx;n.sort(t,r.col.name(),!1)}function vu(t){var e=this._svelte,n=e.component,r=e.ctx;n.sort(t,r.col.name(),!0)}function gu(t,e,n){var r=Object.create(t);return r.col=e[n],r}function yu(t,e,n){var r=Object.create(t);return r.locale=e[n],r}function bu(t,e){var n,r,o,i,a,s,u,c=Mr("Make sure the data looks right"),l=Mr("describe / data-looks-right"),f={},h={label:Mr("First row as label")};void 0!==e.firstRowIsHeader&&(h.value=e.firstRowIsHeader,f.value=!0);var p=new gi({root:t.root,store:t.store,data:h,_bind:function(e,n){var r={};!f.value&&e.value&&(r.firstRowIsHeader=n.value),t._set(r),f={}}});t.root._beforecreate.push((function(){p._bind({value:1},p.get())}));var d=e.showLocale&&xu(t,e);return{c:function(){n=O("h3"),r=M(c),o=M("\n\n                "),i=O("p"),a=M("\n\n                "),p._fragment.c(),s=M(" "),d&&d.c(),u=C(),n.className="first"},m:function(t,e){x(t,n,e),_(n,r),x(t,o,e),x(t,i,e),i.innerHTML=l,x(t,a,e),p._mount(t,e),x(t,s,e),d&&d.m(t,e),x(t,u,e)},p:function(n,r){e=r;var o={};!f.value&&n.firstRowIsHeader&&(o.value=e.firstRowIsHeader,f.value=void 0!==e.firstRowIsHeader),p._set(o),f={},e.showLocale?d?d.p(n,e):((d=xu(t,e)).c(),d.m(u.parentNode,u)):d&&(d.d(1),d=null)},d:function(t){t&&(N(n),N(o),N(i),N(a)),p.destroy(t),t&&N(s),d&&d.d(t),t&&N(u)}}}function wu(t,e){var n,r,o,i,a,s,u,c,l,f,h,p,d,m,v,g=Mr("describe / show-hide-multi"),y=Mr("describe / show-selected"),b=Mr("describe / hide-selected");function w(n){t.hideMultiple(e.multiSelection,!1)}function E(n){t.hideMultiple(e.multiSelection,!0)}return{c:function(){n=O("h3"),r=M(g),o=M("\n\n                "),i=O("ul"),a=O("li"),s=O("button"),u=O("i"),c=M(" "),l=M(y),f=M("\n                    "),h=O("li"),p=O("button"),d=O("i"),m=M(" "),v=M(b),n.className="first",u.className="fa fa-eye",S(s,"click",w),s.className="btn",L(a,"margin-bottom","5px"),d.className="fa fa-eye-slash",S(p,"click",E),p.className="btn",i.className="unstyled"},m:function(t,e){x(t,n,e),_(n,r),x(t,o,e),x(t,i,e),_(i,a),_(a,s),_(s,u),_(s,c),_(s,l),_(i,f),_(i,h),_(h,p),_(p,d),_(p,m),_(p,v)},p:function(t,n){e=n},d:function(t){t&&(N(n),N(o),N(i)),T(s,"click",w),T(p,"click",E)}}}function _u(t,e){var n,r;function o(t){return t.customColumn?ku:t.columnFormat?Eu:void 0}var i=o(e),a=i&&i(t,e),s="number"==e.activeColumn.type()&&Au(t,e);return{c:function(){a&&a.c(),n=M(" "),s&&s.c(),r=C()},m:function(t,e){a&&a.m(t,e),x(t,n,e),s&&s.m(t,e),x(t,r,e)},p:function(e,u){i===(i=o(u))&&a?a.p(e,u):(a&&a.d(1),(a=i&&i(t,u))&&a.c(),a&&a.m(n.parentNode,n)),"number"==u.activeColumn.type()?s?s.p(e,u):((s=Au(t,u)).c(),s.m(r.parentNode,r)):s&&(s.d(1),s=null)},d:function(t){a&&a.d(t),t&&N(n),s&&s.d(t),t&&N(r)}}}function xu(t,e){for(var n,r,o,i,a,s,u=Mr("describe / locale-select / hed"),c=Mr("describe / locale-select / body"),l=!1,f=e.locales,h=[],p=0;p<f.length;p+=1)h[p]=Nu(t,yu(e,f,p));function d(){l=!0,t.set({locale:F(s)}),l=!1}return{c:function(){n=O("h4"),r=M(u),o=M("\n\n                "),i=O("p"),a=M("\n\n                "),s=O("select");for(var c=0;c<h.length;c+=1)h[c].c();S(s,"change",d),"locale"in e||t.root._beforecreate.push(d)},m:function(t,u){x(t,n,u),_(n,r),x(t,o,u),x(t,i,u),i.innerHTML=c,x(t,a,u),x(t,s,u);for(var l=0;l<h.length;l+=1)h[l].m(s,null);j(s,e.locale)},p:function(e,n){if(e.locales){f=n.locales;for(var r=0;r<f.length;r+=1){var o=yu(n,f,r);h[r]?h[r].p(e,o):(h[r]=Nu(t,o),h[r].c(),h[r].m(s,null))}for(;r<h.length;r+=1)h[r].d(1);h.length=f.length}!l&&e.locale&&j(s,n.locale)},d:function(t){t&&(N(n),N(o),N(i),N(a),N(s)),E(h,t),T(s,"change",d)}}}function Nu(t,e){var n,r,o,i,a,s,u=e.locale.label,c=e.locale.value;return{c:function(){n=O("option"),r=M(u),o=M(" ("),i=M(c),a=M(")"),n.__value=s=e.locale.value,n.value=n.__value},m:function(t,e){x(t,n,e),_(n,r),_(n,o),_(n,i),_(n,a)},p:function(t,e){t.locales&&u!==(u=e.locale.label)&&I(r,u),t.locales&&c!==(c=e.locale.value)&&I(i,c),t.locales&&s!==(s=e.locale.value)&&(n.__value=s),n.value=n.__value},d:function(t){t&&N(n)}}}function Eu(t,e){var n,r,o={},i={};void 0!==e.columnFormat&&(i.column=e.columnFormat,o.column=!0),void 0!==e.columns&&(i.columns=e.columns,o.columns=!0);var a=new Di({root:t.root,store:t.store,data:i,_bind:function(e,n){var r={};!o.column&&e.column&&(r.columnFormat=n.column),!o.columns&&e.columns&&(r.columns=n.columns),t._set(r),o={}}});t.root._beforecreate.push((function(){a._bind({column:1,columns:1},a.get())})),a.on("updateTable",(function(e){t.refs.hot.update()})),a.on("renderTable",(function(e){t.refs.hot.render()}));var s=e.columnFormat.isComputed&&Ou(t);return{c:function(){a._fragment.c(),n=M("\n\n                "),s&&s.c(),r=C()},m:function(t,e){a._mount(t,e),x(t,n,e),s&&s.m(t,e),x(t,r,e)},p:function(n,i){e=i;var u={};!o.column&&n.columnFormat&&(u.column=e.columnFormat,o.column=void 0!==e.columnFormat),!o.columns&&n.columns&&(u.columns=e.columns,o.columns=void 0!==e.columns),a._set(u),o={},e.columnFormat.isComputed?s||((s=Ou(t)).c(),s.m(r.parentNode,r)):s&&(s.d(1),s=null)},d:function(t){a.destroy(t),t&&N(n),s&&s.d(t),t&&N(r)}}}function ku(t,e){var n,r,o,i={},a=Mr("describe / edit-format"),s={};void 0!==e.customColumn&&(s.column=e.customColumn,i.column=!0),void 0!==e.columns&&(s.columns=e.columns,i.columns=!0);var u=new fi({root:t.root,store:t.store,data:s,_bind:function(e,n){var r={};!i.column&&e.column&&(r.customColumn=n.column),!i.columns&&e.columns&&(r.columns=n.columns),t._set(r),i={}}});function c(e){t.force(e,!0)}return t.root._beforecreate.push((function(){u._bind({column:1,columns:1},u.get())})),u.on("updateTable",(function(e){t.refs.hot.update()})),u.on("renderTable",(function(e){t.refs.hot.render()})),u.on("unselect",(function(e){t.set({activeColumn:!1})})),t.refs.ccEd=u,{c:function(){u._fragment.c(),n=M("\n\n                "),r=O("button"),o=M(a),S(r,"click",c),r.className="btn"},m:function(t,e){u._mount(t,e),x(t,n,e),x(t,r,e),_(r,o)},p:function(t,n){e=n;var r={};!i.column&&t.customColumn&&(r.column=e.customColumn,i.column=void 0!==e.customColumn),!i.columns&&t.columns&&(r.columns=e.columns,i.columns=void 0!==e.columns),u._set(r),i={}},d:function(e){u.destroy(e),t.refs.ccEd===u&&(t.refs.ccEd=null),e&&(N(n),N(r)),T(r,"click",c)}}}function Ou(t,e){var n,r,o,i,a=Mr("describe / edit-formula");function s(e){t.force(e,!1)}return{c:function(){n=O("button"),r=O("i"),o=M(" "),i=M(a),r.className="fa fa-chevron-left",S(n,"click",s),n.className="btn"},m:function(t,e){x(t,n,e),_(n,r),_(n,o),_(n,i)},d:function(t){t&&N(n),T(n,"click",s)}}}function Au(t,e){var n={},r={};void 0!==e.activeValues&&(r.values=e.activeValues,n.values=!0),void 0!==e.activeFormat&&(r.format=e.activeFormat,n.format=!0);var o=new Zs({root:t.root,store:t.store,data:r,_bind:function(e,r){var o={};!n.values&&e.values&&(o.activeValues=r.values),!n.format&&e.format&&(o.activeFormat=r.format),t._set(o),n={}}});return t.root._beforecreate.push((function(){o._bind({values:1,format:1},o.get())})),{c:function(){o._fragment.c()},m:function(t,e){o._mount(t,e)},p:function(t,r){e=r;var i={};!n.values&&t.activeValues&&(i.values=e.activeValues,n.values=void 0!==e.activeValues),!n.format&&t.activeFormat&&(i.format=e.activeFormat,n.format=void 0!==e.activeFormat),o._set(i),n={}},d:function(t){o.destroy(t)}}}function Mu(t,e){var n,r,o,i,a,s,u,c,l,f,h,p=e.col.title();return{c:function(){n=O("li"),r=O("a"),o=O("i"),a=M("\n                                    "),s=O("i"),c=M("   "),l=M(p),o._svelte={component:t,ctx:e},S(o,"click",vu),o.className=i="fa fa-sort-"+("text"==e.col.type()?"alpha":"amount")+"-asc fa-fw svelte-1ymbvw3",s._svelte={component:t,ctx:e},S(s,"click",mu),s.className=u="fa fa-sort-"+("text"==e.col.type()?"alpha":"amount")+"-desc fa-fw svelte-1ymbvw3",r._svelte={component:t,ctx:e},S(r,"click",du),r.href=f="#/"+e.col.name(),r.className="svelte-1ymbvw3",n.className=h=e.col.name()==e.sortBy?"active":""},m:function(t,e){x(t,n,e),_(n,r),_(r,o),_(r,a),_(r,s),_(r,c),_(r,l)},p:function(t,a){e=a,o._svelte.ctx=e,t.columns&&i!==(i="fa fa-sort-"+("text"==e.col.type()?"alpha":"amount")+"-asc fa-fw svelte-1ymbvw3")&&(o.className=i),s._svelte.ctx=e,t.columns&&u!==(u="fa fa-sort-"+("text"==e.col.type()?"alpha":"amount")+"-desc fa-fw svelte-1ymbvw3")&&(s.className=u),t.columns&&p!==(p=e.col.title())&&I(l,p),r._svelte.ctx=e,t.columns&&f!==(f="#/"+e.col.name())&&(r.href=f),(t.columns||t.sortBy)&&h!==(h=e.col.name()==e.sortBy?"active":"")&&(n.className=h)},d:function(t){t&&N(n),T(o,"click",vu),T(s,"click",mu),T(r,"click",du)}}}function Cu(t,e){var n,r,o,i;function a(e){t.nextResult(-1)}function s(e){t.nextResult(1)}return{c:function(){n=O("div"),(r=O("button")).innerHTML='<i class="fa fa-chevron-up"></i>',o=M("\n                            "),(i=O("button")).innerHTML='<i class="fa fa-chevron-down"></i>',S(r,"click",a),r.className="btn svelte-1ymbvw3",S(i,"click",s),i.className="btn svelte-1ymbvw3",n.className="btn-group"},m:function(t,e){x(t,n,e),_(n,r),_(n,o),_(n,i)},d:function(t){t&&N(n),T(r,"click",a),T(i,"click",s)}}}function Su(t,e){var n,r;return{c:function(){n=O("div"),r=M(e.resultsDisplay),n.className="results svelte-1ymbvw3"},m:function(t,e){x(t,n,e),_(n,r)},p:function(t,e){t.resultsDisplay&&I(r,e.resultsDisplay)},d:function(t){t&&N(n)}}}function Tu(t){var e=this;Y(this,t),this.refs={},this._state=y(y(this.store._init(["dw_chart"]),{locale:"en-US",search:"",chartData:"",readonly:!1,transpose:!1,firstRowIsHeader:!0,fixedColumnsLeft:0,searchIndex:0,activeColumn:!1,customColumn:!1,columnFormat:!1,multiSelection:!1,forceColumnFormat:!1,searchResults:[],sortBy:"-",sortDir:!0}),t.data),this.store._add(this,["dw_chart"]),this._recompute({searchIndex:1,searchResults:1,activeColumn:1,forceColumnFormat:1,$dw_chart:1,sortBy:1,sortDir:1,searchIndexSafe:1},this._state),this._intro=!0,this._handlers.update=[pu],this._handlers.destroy=[J],this._fragment=function(t,e){var n,r,o,i,a,s,u,c,l,f,h,p,d,m,v,g,y,b,w,k,A,C,I,j,F,D,P,H,U,B,V,$,W,z,q,G,Y,K,X,J,Z,Q,tt,et,nt,rt,ot,it,at,st,ut,ct,lt,ft,ht,pt,dt,mt,vt,gt,yt,bt,wt,_t,xt,Nt,Et,kt=Mr("Back"),Ot=Mr("Proceed"),At=Mr("describe / info-table-header"),Mt=Mr("describe / sort-by"),Ct=Mr("describe / no-sorting"),St=!1,Tt={},Rt=Mr("describe / transpose-long"),It=Mr("computed columns / add-btn"),Lt=Mr("Revert changes");function jt(t){return t.activeColumn?_u:t.multiSelection?wu:bu}var Ft=jt(e),Dt=Ft(t,e);function Pt(e){t.sort(e,"-")}for(var Ht=e.columns,Ut=[],Bt=0;Bt<Ht.length;Bt+=1)Ut[Bt]=Mu(t,gu(e,Ht,Bt));function Vt(){St=!0,t.set({search:tt.value}),St=!1}function $t(e){t.keyPress(e)}var Wt=e.searchResults.length>0&&Cu(t),zt=e.search&&Su(t,e),qt={};void 0!==e.chartData&&(qt.data=e.chartData,Tt.data=!0),void 0!==e.transpose&&(qt.transpose=e.transpose,Tt.transpose=!0),void 0!==e.firstRowIsHeader&&(qt.firstRowIsHeader=e.firstRowIsHeader,Tt.firstRowIsHeader=!0),void 0!==e.fixedColumnsLeft&&(qt.fixedColumnsLeft=e.fixedColumnsLeft,Tt.fixedColumnsLeft=!0),void 0!==e.activeColumn&&(qt.activeColumn=e.activeColumn,Tt.activeColumn=!0),void 0!==e.readonly&&(qt.readonly=e.readonly,Tt.readonly=!0),void 0!==e.sorting&&(qt.sorting=e.sorting,Tt.sorting=!0),void 0!==e.search&&(qt.search=e.search,Tt.search=!0),void 0!==e.searchResults&&(qt.searchResults=e.searchResults,Tt.searchResults=!0),void 0!==e.searchIndex&&(qt.searchIndex=e.searchIndex,Tt.searchIndex=!0),void 0!==e.multiSelection&&(qt.multiSelection=e.multiSelection,Tt.multiSelection=!0);var Gt=new lu({root:t.root,store:t.store,data:qt,_bind:function(e,n){var r={};!Tt.data&&e.data&&(r.chartData=n.data),!Tt.transpose&&e.transpose&&(r.transpose=n.transpose),!Tt.firstRowIsHeader&&e.firstRowIsHeader&&(r.firstRowIsHeader=n.firstRowIsHeader),!Tt.fixedColumnsLeft&&e.fixedColumnsLeft&&(r.fixedColumnsLeft=n.fixedColumnsLeft),!Tt.activeColumn&&e.activeColumn&&(r.activeColumn=n.activeColumn),!Tt.readonly&&e.readonly&&(r.readonly=n.readonly),!Tt.sorting&&e.sorting&&(r.sorting=n.sorting),!Tt.search&&e.search&&(r.search=n.search),!Tt.searchResults&&e.searchResults&&(r.searchResults=n.searchResults),!Tt.searchIndex&&e.searchIndex&&(r.searchIndex=n.searchIndex),!Tt.multiSelection&&e.multiSelection&&(r.multiSelection=n.multiSelection),t._set(r),Tt={}}});function Yt(e){t.toggleTranspose()}function Kt(e){t.addComputedColumn()}function Xt(e){t.revertChanges()}return t.root._beforecreate.push((function(){Gt._bind({data:1,transpose:1,firstRowIsHeader:1,fixedColumnsLeft:1,activeColumn:1,readonly:1,sorting:1,search:1,searchResults:1,searchIndex:1,multiSelection:1},Gt.get())})),Gt.on("resetSort",(function(e){t.set({sortBy:"-"})})),Gt.on("afterRender",(function(e){t.afterRender()})),t.refs.hot=Gt,{c:function(){n=O("div"),r=O("div"),o=O("div"),i=O("div"),Dt.c(),a=M("\n\n                "),s=O("hr"),u=M("\n\n                "),c=O("div"),l=O("a"),f=O("i"),h=M(" "),p=M(kt),d=M("\n                    "),m=O("a"),v=M(Ot),g=M(" "),y=O("i"),b=M("\n        "),w=O("div"),k=O("div"),A=O("noscript"),C=M("\n                "),I=O("img"),j=M("\n            "),F=O("div"),D=O("div"),P=O("div"),H=O("button"),U=O("noscript"),B=M("… "),V=O("span"),$=M("\n                        "),W=O("ul"),z=O("li"),q=O("a"),Y=M("\n                            ");for(var t=0;t<Ut.length;t+=1)Ut[t].c();K=M("\n\n                "),X=O("div"),J=O("i"),Z=M("\n                    "),Q=O("div"),tt=O("input"),nt=M("\n                        "),Wt&&Wt.c(),ot=M("\n\n                    "),zt&&zt.c(),it=M("\n\n            "),Gt._fragment.c(),at=M("\n\n            "),st=O("div"),ut=O("button"),ct=O("img"),lt=M("\n                    "),ft=M(Rt),ht=M("\n\n                "),pt=O("button"),dt=O("i"),mt=M(" "),vt=M(It),gt=M("…"),yt=M("\n\n                "),bt=O("button"),wt=O("i"),_t=M(" "),xt=M(Lt),Nt=M("…"),f.className="icon-chevron-left",l.className="btn submit",l.href="upload",y.className="icon-chevron-right icon-white",m.href="visualize",m.className="submit btn btn-primary",m.id="describe-proceed",c.className="btn-group",i.className="sidebar",o.className="span4",I.alt="arrow",I.src="/static/img/arrow.svg",k.className="help svelte-1ymbvw3",V.className="caret",H.className="btn dropdown-toggle",H.dataset.toggle="dropdown",S(q,"click",Pt),q.href="#s",q.className="svelte-1ymbvw3",z.className=G="-"==e.sortBy?"active":"",W.className="dropdown-menu sort-menu",P.className="btn-group",D.className="sort-box svelte-1ymbvw3",J.className="im im-magnifier svelte-1ymbvw3",S(tt,"input",Vt),S(tt,"keypress",$t),tt.autocomplete="screw-you-google-chrome",R(tt,"type","search"),tt.placeholder=Mr("describe / search / placeholder"),tt.className=et=(e.searchResults.length>0?"with-results":"")+" search-query svelte-1ymbvw3",Q.className=rt=e.searchResults.length>0?"input-append":"",X.className="search-box form-search svelte-1ymbvw3",F.className="pull-right",L(F,"margin-bottom","10px"),ct.alt="transpose",ct.src="/static/css/chart-editor/transpose.png",ct.className="svelte-1ymbvw3",S(ut,"click",Yt),ut.className="btn transpose svelte-1ymbvw3",dt.className="fa fa-calculator",S(pt,"click",Kt),pt.className="btn computed-columns",wt.className="fa fa-undo",S(bt,"click",Xt),bt.className=Et="btn "+(e.has_changes?"":"disabled")+" svelte-1ymbvw3",bt.id="reset-data-changes",st.className="buttons below-table pull-right svelte-1ymbvw3",w.className="span8 svelte-1ymbvw3",r.className="row",n.className="chart-editor"},m:function(N,E){x(N,n,E),_(n,r),_(r,o),_(o,i),Dt.m(i,null),_(i,a),_(i,s),_(i,u),_(i,c),_(c,l),_(l,f),_(l,h),_(l,p),_(c,d),_(c,m),_(m,v),_(m,g),_(m,y),_(r,b),_(r,w),_(w,k),_(k,A),A.insertAdjacentHTML("beforebegin",At),_(k,C),_(k,I),_(w,j),_(w,F),_(F,D),_(D,P),_(P,H),_(H,U),U.insertAdjacentHTML("beforebegin",Mt),_(H,B),_(H,V),_(P,$),_(P,W),_(W,z),_(z,q),q.innerHTML=Ct,_(W,Y);for(var O=0;O<Ut.length;O+=1)Ut[O].m(W,null);t.refs.sortDropdownGroup=P,_(F,K),_(F,X),_(X,J),_(X,Z),_(X,Q),_(Q,tt),t.refs.search=tt,tt.value=e.search,_(Q,nt),Wt&&Wt.m(Q,null),_(X,ot),zt&&zt.m(X,null),_(w,it),Gt._mount(w,null),_(w,at),_(w,st),_(st,ut),_(ut,ct),_(ut,lt),_(ut,ft),_(st,ht),_(st,pt),_(pt,dt),_(pt,mt),_(pt,vt),_(pt,gt),_(st,yt),_(st,bt),_(bt,wt),_(bt,_t),_(bt,xt),_(bt,Nt)},p:function(n,r){if(Ft===(Ft=jt(e=r))&&Dt?Dt.p(n,e):(Dt.d(1),(Dt=Ft(t,e)).c(),Dt.m(i,a)),n.sortBy&&G!==(G="-"==e.sortBy?"active":"")&&(z.className=G),n.columns||n.sortBy){Ht=e.columns;for(var o=0;o<Ht.length;o+=1){var s=gu(e,Ht,o);Ut[o]?Ut[o].p(n,s):(Ut[o]=Mu(t,s),Ut[o].c(),Ut[o].m(W,null))}for(;o<Ut.length;o+=1)Ut[o].d(1);Ut.length=Ht.length}!St&&n.search&&(tt.value=e.search),n.searchResults&&et!==(et=(e.searchResults.length>0?"with-results":"")+" search-query svelte-1ymbvw3")&&(tt.className=et),e.searchResults.length>0?Wt||((Wt=Cu(t)).c(),Wt.m(Q,null)):Wt&&(Wt.d(1),Wt=null),n.searchResults&&rt!==(rt=e.searchResults.length>0?"input-append":"")&&(Q.className=rt),e.search?zt?zt.p(n,e):((zt=Su(t,e)).c(),zt.m(X,null)):zt&&(zt.d(1),zt=null);var u={};!Tt.data&&n.chartData&&(u.data=e.chartData,Tt.data=void 0!==e.chartData),!Tt.transpose&&n.transpose&&(u.transpose=e.transpose,Tt.transpose=void 0!==e.transpose),!Tt.firstRowIsHeader&&n.firstRowIsHeader&&(u.firstRowIsHeader=e.firstRowIsHeader,Tt.firstRowIsHeader=void 0!==e.firstRowIsHeader),!Tt.fixedColumnsLeft&&n.fixedColumnsLeft&&(u.fixedColumnsLeft=e.fixedColumnsLeft,Tt.fixedColumnsLeft=void 0!==e.fixedColumnsLeft),!Tt.activeColumn&&n.activeColumn&&(u.activeColumn=e.activeColumn,Tt.activeColumn=void 0!==e.activeColumn),!Tt.readonly&&n.readonly&&(u.readonly=e.readonly,Tt.readonly=void 0!==e.readonly),!Tt.sorting&&n.sorting&&(u.sorting=e.sorting,Tt.sorting=void 0!==e.sorting),!Tt.search&&n.search&&(u.search=e.search,Tt.search=void 0!==e.search),!Tt.searchResults&&n.searchResults&&(u.searchResults=e.searchResults,Tt.searchResults=void 0!==e.searchResults),!Tt.searchIndex&&n.searchIndex&&(u.searchIndex=e.searchIndex,Tt.searchIndex=void 0!==e.searchIndex),!Tt.multiSelection&&n.multiSelection&&(u.multiSelection=e.multiSelection,Tt.multiSelection=void 0!==e.multiSelection),Gt._set(u),Tt={},n.has_changes&&Et!==(Et="btn "+(e.has_changes?"":"disabled")+" svelte-1ymbvw3")&&(bt.className=Et)},d:function(e){e&&N(n),Dt.d(),T(q,"click",Pt),E(Ut,e),t.refs.sortDropdownGroup===P&&(t.refs.sortDropdownGroup=null),T(tt,"input",Vt),T(tt,"keypress",$t),t.refs.search===tt&&(t.refs.search=null),Wt&&Wt.d(),zt&&zt.d(),Gt.destroy(),t.refs.hot===Gt&&(t.refs.hot=null),T(ut,"click",Yt),T(pt,"click",Kt),T(bt,"click",Xt)}}}(this,this._state),this.root._oncreate.push((function(){hu.call(e),e.fire("update",{changed:b({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),q(this))}function Ru(t,e){this._handlers={},this._dependents=[],this._computed=V(),this._sortedComputedProperties=[],this._state=y({},t),this._differs=e&&e.immutable?W:$}y(Tu.prototype,Z),y(Tu.prototype,fu),Tu.prototype._recompute=function(t,e){var n,r,o,i,a,s,u;(t.searchIndex||t.searchResults)&&this._differs(e.searchIndexSafe,e.searchIndexSafe=(r=(n=e).searchIndex,o=n.searchResults,r<0&&(r+=o.length),r%=o.length))&&(t.searchIndexSafe=!0),(t.activeColumn||t.forceColumnFormat)&&(this._differs(e.customColumn,e.customColumn=(a=(i=e).activeColumn,s=i.forceColumnFormat,!(!a||s||!a.isComputed)&&a))&&(t.customColumn=!0),this._differs(e.columnFormat,e.columnFormat=function(t){var e=t.activeColumn,n=t.forceColumnFormat;return!(!e||e.isComputed&&!n)&&e}(e))&&(t.columnFormat=!0)),t.activeColumn&&this._differs(e.activeValues,e.activeValues=function(t){var e=t.activeColumn;return e?e.values():[]}(e))&&(t.activeValues=!0),(t.activeColumn||t.$dw_chart)&&this._differs(e.activeFormat,e.activeFormat=function(t){var e=t.activeColumn,n=t.$dw_chart;return e?n.columnFormatter(e):function(t){return t}}(e))&&(t.activeFormat=!0),t.activeColumn&&this._differs(e.columns,e.columns=function(t){var e=t.activeColumn,n=chart.dataset();if(!e)return n?n.columns():[];try{return n.columns().filter((function(t){return!t.isComputed}))}catch(t){return[]}}(e))&&(t.columns=!0),(t.sortBy||t.sortDir)&&this._differs(e.sorting,e.sorting={sortBy:(u=e).sortBy,sortDir:u.sortDir})&&(t.sorting=!0),(t.searchResults||t.searchIndexSafe)&&this._differs(e.resultsDisplay,e.resultsDisplay=function(t){var e=t.searchResults,n=t.searchIndexSafe;return e.length>0?"".concat(n+1," ").concat(Mr("describe / search / of")," ").concat(e.length," ").concat(Mr("describe / search / results")):Mr("describe / search / no-matches")}(e))&&(t.resultsDisplay=!0)},y(Ru.prototype,{_add:function(t,e){this._dependents.push({component:t,props:e})},_init:function(t){for(var e={},n=0;n<t.length;n+=1){var r=t[n];e["$"+r]=this._state[r]}return e},_remove:function(t){for(var e=this._dependents.length;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set:function(t,e){var n=this,r=this._state;this._state=y(y({},r),t);for(var o=0;o<this._sortedComputedProperties.length;o+=1)this._sortedComputedProperties[o].update(this._state,e);this.fire("state",{changed:e,previous:r,current:this._state}),this._dependents.filter((function(t){for(var r={},o=!1,i=0;i<t.props.length;i+=1){var a=t.props[i];a in e&&(r["$"+a]=n._state[a],o=!0)}if(o)return t.component._stage(r),!0})).forEach((function(t){t.component.set({})})),this.fire("update",{changed:e,previous:r,current:this._state})},_sortComputedProperties:function(){var t,e=this._computed,n=this._sortedComputedProperties=[],r=V();function o(i){var a=e[i];a&&(a.deps.forEach((function(e){if(e===t)throw new Error("Cyclical dependency detected between ".concat(e," <-> ").concat(i));o(e)})),r[i]||(r[i]=!0,n.push(a)))}for(var i in this._computed)o(t=i)},compute:function(t,e,n){var r,o=this,i={deps:e,update:function(i,a,s){var u=e.map((function(t){return t in a&&(s=!0),i[t]}));if(s){var c=n.apply(null,u);o._differs(c,r)&&(r=c,a[t]=!0,i[t]=r)}}};this._computed[t]=i,this._sortComputedProperties();var a=y({},this._state),s={};i.update(a,s,!0),this._set(a,s)},fire:z,get:G,on:K,set:function(t){var e=this._state,n=this._changed={},r=!1;for(var o in t){if(this._computed[o])throw new Error("'".concat(o,"' is a read-only computed property"));this._differs(t[o],e[o])&&(n[o]=r=!0)}r&&this._set(t,n)}});return{App:Tu,data:{chart:{id:""},readonly:!1,chartData:"",transpose:!1,firstRowIsHeader:!0,skipRows:0},store:new Ru({})}}));
>>>>>>> master
