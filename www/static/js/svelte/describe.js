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
	        SIN: Math.sin,
	        COS: Math.cos,
	        TAN: Math.tan,
	        ASIN: Math.asin,
	        ACOS: Math.acos,
	        ATAN: Math.atan,
	        SQRT: Math.sqrt,
	        LOG: Math.log,
	        LOG2: Math.log2 || log2,
	        LN: Math.log,
	        LG: Math.log10 || log10,
	        LOG10: Math.log10 || log10,
	        LOG1P: Math.log1p || log1p,
	        ABS: Math.abs,
	        CEIL: Math.ceil,
	        TRIM: trim,
	        FLOOR: Math.floor,
	        ISNULL(a) {
	            return a === null;
	        },
	        TRUNC: Math.trunc || trunc,
	        '-': neg,
	        '+': Number,
	        EXP: Math.exp,
	        NOT: not,
	        LENGTH: stringOrArrayLength,
	        '!': not,
	        SIGN: Math.sign || sign,
	        TEXT(value) {
	            if (isDate(value)) {
	                return value.toISOString();
	            }
	            return String(value);
	        },
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

	    try {
	        PROPER_REGEX = new RegExp('\\p{L}*', 'ug');
	        TITLE_REGEX = new RegExp('[\\p{L}\\p{N}]\\S*', 'ug');
	    } catch (e) {}

	    this.functions = {
	        // ---- LOGICAL FUNCTIONS ----
	        IF: condition,

	        // ---- MATH FUNCTIONS ----
	        RANDOM: random,
	        // fac: factorial,
	        MIN() {
	            const v = filterNumbers.apply(this, arguments);
	            return min(v);
	        },
	        MAX() {
	            return max(filterNumbers.apply(this, arguments));
	        },
	        SUM() {
	            return sum(filterNumbers.apply(this, arguments));
	        },
	        MEAN() {
	            const v = filterNumbers.apply(this, arguments);
	            return sum(v) / v.length;
	        },
	        MEDIAN() {
	            const v = filterNumbers.apply(this, arguments).sort((a, b) => a - b);
	            const i = Math.floor(v.length / 2);
	            return v.length % 2 === 1 ? v[i] : (v[i - 1] + v[i]) * 0.5;
	        },
	        POW: Math.pow,
	        ATAN2: Math.atan2,
	        ROUND: roundTo,

	        // ---- STRING FUNCTIONS ----
	        CONCAT() {
	            return Array.from(arguments).join('');
	        },
	        TRIM: trim,
	        SUBSTR(s, start, end) {
	            return s.substr(start, end);
	        },

	        REPLACE(str, search, replace) {
	            return str.replace(search, replace);
	        },
	        SPLIT(str, sep) {
	            return String(str).split(sep);
	        },
	        LOWER(str) {
	            return String(str).toLowerCase();
	        },
	        UPPER(str) {
	            return String(str).toUpperCase();
	        },
	        PROPER(str) {
	            return String(str).replace(
	                PROPER_REGEX,
	                txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	            );
	        },
	        TITLE(str) {
	            return String(str).replace(
	                TITLE_REGEX,
	                txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	            );
	        },

	        // ARRAY FUNCTIONS
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
	        SLICE(arr, start, end) {
	            if (!Array.isArray(arr)) {
	                throw new Error('First argument to SLICE is not an array');
	            }
	            return arr.slice(start, end);
	        },
	        JOIN(arr, sep, sepLast = null) {
	            if (!Array.isArray(arr)) {
	                throw new Error('First argument to JOIN is not an array');
	            }
	            return sepLast
	                ? [arr.slice(0, arr.length - 1).join(sep), arr[arr.length - 1]].join(sepLast)
	                : arr.join(sep);
	        },
	        MAP: arrayMap$1,
	        FOLD: arrayFold,
	        FILTER: arrayFilter$1,
	        PLUCK(arr, key) {
	            if (!Array.isArray(arr)) throw new Error('First argument to PLUCK is not an array');
	            return arr.map(item => item[key]);
	        },
	        INDEXOF(arr, target) {
	            if (!Array.isArray(arr)) arr = String(arr);
	            return arr.indexOf(target);
	        },
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
	        DATE() {
	            if (arguments.length > 1) {
	                // "correct" month argument (1=january, etc)
	                arguments[1] = arguments[1] - 1;
	            }
	            return new Date(...arguments);
	        },
	        YEAR(d) {
	            d = asDate(d);
	            return d ? d.getFullYear() : null;
	        },
	        MONTH(d) {
	            d = asDate(d);
	            return d ? d.getMonth() + 1 : null;
	        },
	        DAY(d) {
	            d = asDate(d);
	            return d ? d.getDate() : null;
	        },
	        WEEKDAY(d) {
	            d = asDate(d);
	            return d ? d.getDay() : null;
	        },
	        HOURS(d) {
	            d = asDate(d);
	            return d ? d.getHours() : null;
	        },
	        MINUTES(d) {
	            d = asDate(d);
	            return d ? d.getMinutes() : null;
	        },
	        SECONDS(d) {
	            d = asDate(d);
	            return d ? d.getSeconds() : null;
	        },
	        // the number of days between two dates
	        DATEDIFF(d1, d2) {
	            d1 = asDate(d1);
	            d2 = asDate(d2);
	            return d1 && d2 ? (d2.getTime() - d1.getTime()) / 864e5 : null;
	        },
	        // the number of seconds between two dates
	        TIMEDIFF(d1, d2) {
	            d1 = asDate(d1);
	            d2 = asDate(d2);
	            return d1 && d2 ? (d2.getTime() - d1.getTime()) / 1000 : null;
	        }
	    };

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

	/* node_modules/@datawrapper/controls/Help.html generated by Svelte v2.16.1 */

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

	const file = "node_modules/datawrapper/controls/Help.html";

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

	/* node_modules/@datawrapper/controls/Checkbox.html generated by Svelte v2.16.1 */



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
	const file$2 = "node_modules/datawrapper/controls/Checkbox.html";

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

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

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

	const file$3 = "node_modules/datawrapper/controls/ControlGroup.html";

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
				addLoc(div0, file$3, 4, 4, 218);
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
		var label;

		return {
			c: function create() {
				label = createElement("label");
				setStyle(label, "width", (ctx.width||def.width));
				label.className = "control-label svelte-p72242";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$3, 2, 4, 104);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				label.innerHTML = ctx.label;
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					label.innerHTML = ctx.label;
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
			}
		};
	}

	// (8:4) {#if help}
	function create_if_block$3(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.width||def.width));
				p.className = p_class_value = "mini-help " + ctx.type + " svelte-p72242";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file$3, 8, 4, 369);
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

	/* node_modules/@datawrapper/controls/BaseSelect.html generated by Svelte v2.16.1 */

	function data$4() {
	    return {
	        disabled: false,
	        width: 'auto',
	        labelWidth: 'auto',
	        options: [],
	        optgroups: []
	    };
	}
	const file$4 = "node_modules/datawrapper/controls/BaseSelect.html";

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
				if (changed.options) {
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
		var option, text_value = ctx.opt.label, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
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
				if (changed.optgroups) {
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
		var option, text_value = ctx.opt.label, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				addLoc(option, file$4, 6, 8, 387);
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
				addLoc(optgroup, file$4, 4, 4, 303);
			},

			m: function mount(target, anchor) {
				insert(target, optgroup, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(optgroup, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.optgroups) {
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

	/* node_modules/@datawrapper/controls/Select.html generated by Svelte v2.16.1 */



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
	        chart.set('metadata.data.changes', []);
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
	        chart.set('metadata.describe.computed-columns', computed);
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
	        chart.set('metadata.data.column-format', colFmt);
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
			if (ctx.activeColumn) return create_if_block_2$1;
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
	function create_if_block_2$1(component, ctx) {
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
