(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/account', factory) :
	(global = global || self, global.account = factory());
}(this, function () { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) { tar[k] = src[k]; }
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) { tar[k] = 1; }
		return tar;
	}

	function isPromise(value) {
		return value && typeof value.then === 'function';
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file: file, line: line, column: column, char: char }
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

	function reinsertChildren(parent, target) {
		while (parent.firstChild) { target.appendChild(parent.firstChild); }
	}

	function reinsertBefore(after, target) {
		var parent = after.parentNode;
		while (parent.firstChild !== after) { target.appendChild(parent.firstChild); }
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) { iterations[i].d(detach); }
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
		if (value == null) { node.removeAttribute(attribute); }
		else { node.setAttribute(attribute, value); }
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

	function generateRule(ref, ease, fn) {
		var a = ref.a;
		var b = ref.b;
		var delta = ref.delta;
		var duration = ref.duration;

		var step = 16.666 / duration;
		var keyframes = '{\n';

		for (var p = 0; p <= 1; p += step) {
			var t = a + delta * ease(p);
			keyframes += p * 100 + "%{" + (fn(t, 1 - t)) + "}\n";
		}

		return keyframes + "100% {" + (fn(b, 1 - b)) + "}\n}";
	}

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
		var hash = 5381;
		var i = str.length;

		while (i--) { hash = ((hash << 5) - hash) ^ str.charCodeAt(i); }
		return hash >>> 0;
	}

	function wrapTransition(component, node, fn, params, intro) {
		var obj = fn.call(component, node, params);
		var duration;
		var ease;
		var cssText;

		var initialised = false;

		return {
			t: intro ? 0 : 1,
			running: false,
			program: null,
			pending: null,

			run: function run(b, callback) {
				var this$1 = this;

				if (typeof obj === 'function') {
					transitionManager.wait().then(function () {
						obj = obj();
						this$1._run(b, callback);
					});
				} else {
					this._run(b, callback);
				}
			},

			_run: function _run(b, callback) {
				duration = obj.duration || 300;
				ease = obj.easing || linear;

				var program = {
					start: window.performance.now() + (obj.delay || 0),
					b: b,
					callback: callback || noop
				};

				if (intro && !initialised) {
					if (obj.css && obj.delay) {
						cssText = node.style.cssText;
						node.style.cssText += obj.css(0, 1);
					}

					if (obj.tick) { obj.tick(0, 1); }
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

			start: function start(program) {
				component.fire(((program.b ? 'intro' : 'outro') + ".start"), { node: node });

				program.a = this.t;
				program.delta = program.b - program.a;
				program.duration = duration * Math.abs(program.b - program.a);
				program.end = program.start + program.duration;

				if (obj.css) {
					if (obj.delay) { node.style.cssText = cssText; }

					var rule = generateRule(program, ease, obj.css);
					transitionManager.addRule(rule, program.name = '__svelte_' + hash(rule));

					node.style.animation = (node.style.animation || '')
						.split(', ')
						.filter(function (anim) { return anim && (program.delta < 0 || !/__svelte/.test(anim)); })
						.concat(((program.name) + " " + (program.duration) + "ms linear 1 forwards"))
						.join(', ');
				}

				this.program = program;
				this.pending = null;
			},

			update: function update(now) {
				var program = this.program;
				if (!program) { return; }

				var p = now - program.start;
				this.t = program.a + program.delta * ease(p / program.duration);
				if (obj.tick) { obj.tick(this.t, 1 - this.t); }
			},

			done: function done() {
				var program = this.program;
				this.t = program.b;

				if (obj.tick) { obj.tick(this.t, 1 - this.t); }

				component.fire(((program.b ? 'intro' : 'outro') + ".end"), { node: node });

				if (!program.b && !program.invalidated) {
					program.group.callbacks.push(function () {
						program.callback();
						if (obj.css) { transitionManager.deleteRule(node, program.name); }
					});

					if (--program.group.remaining === 0) {
						program.group.callbacks.forEach(run);
					}
				} else {
					if (obj.css) { transitionManager.deleteRule(node, program.name); }
				}

				this.running = !!this.pending;
			},

			abort: function abort(reset) {
				if (this.program) {
					if (reset && obj.tick) { obj.tick(1, 0); }
					if (obj.css) { transitionManager.deleteRule(node, this.program.name); }
					this.program = this.pending = null;
					this.running = false;
				}
			},

			invalidate: function invalidate() {
				if (this.program) {
					this.program.invalidated = true;
				}
			}
		};
	}

	var outros = {};

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

		add: function add(transition) {
			this.transitions.push(transition);

			if (!this.running) {
				this.running = true;
				requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
			}
		},

		addRule: function addRule(rule, name) {
			if (!this.stylesheet) {
				var style = createElement('style');
				document.head.appendChild(style);
				transitionManager.stylesheet = style.sheet;
			}

			if (!this.activeRules[name]) {
				this.activeRules[name] = true;
				this.stylesheet.insertRule(("@keyframes " + name + " " + rule), this.stylesheet.cssRules.length);
			}
		},

		next: function next() {
			this.running = false;

			var now = window.performance.now();
			var i = this.transitions.length;

			while (i--) {
				var transition = this.transitions[i];

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
				var i$1 = this.stylesheet.cssRules.length;
				while (i$1--) { this.stylesheet.deleteRule(i$1); }
				this.activeRules = {};
			}
		},

		deleteRule: function deleteRule(node, name) {
			node.style.animation = node.style.animation
				.split(', ')
				.filter(function (anim) { return anim && anim.indexOf(name) === -1; })
				.join(', ');
		},

		wait: function wait() {
			if (!transitionManager.promise) {
				transitionManager.promise = Promise.resolve();
				transitionManager.promise.then(function () {
					transitionManager.promise = null;
				});
			}

			return transitionManager.promise;
		}
	};

	function handlePromise(promise, info) {
		var obj;

		var token = info.token = {};

		function update(type, index, key, value) {
			var obj;

			if (info.token !== token) { return; }

			info.resolved = key && ( obj = {}, obj[key] = value, obj );

			var child_ctx = assign(assign({}, info.ctx), info.resolved);
			var block = type && (info.current = type)(info.component, child_ctx);

			if (info.block) {
				if (info.blocks) {
					info.blocks.forEach(function (block, i) {
						if (i !== index && block) {
							groupOutros();
							block.o(function () {
								block.d(1);
								info.blocks[i] = null;
							});
						}
					});
				} else {
					info.block.d(1);
				}

				block.c();
				block[block.i ? 'i' : 'm'](info.mount(), info.anchor);

				info.component.root.set({}); // flush any handlers that were created
			}

			info.block = block;
			if (info.blocks) { info.blocks[index] = block; }
		}

		if (isPromise(promise)) {
			promise.then(function (value) {
				update(info.then, 1, info.value, value);
			}, function (error) {
				update(info.catch, 2, info.error, error);
			});

			// if we previously had a then/catch block, destroy it
			if (info.current !== info.pending) {
				update(info.pending, 0);
				return true;
			}
		} else {
			if (info.current !== info.then) {
				update(info.then, 1, info.value, promise);
				return true;
			}

			info.resolved = ( obj = {}, obj[info.value] = promise, obj );
		}
	}

	function getSpreadUpdate(levels, updates) {
		var update = {};

		var to_null_out = {};
		var accounted_for = {};

		var i = levels.length;
		while (i--) {
			var o = levels[i];
			var n = updates[i];

			if (n) {
				for (var key in o) {
					if (!(key in n)) { to_null_out[key] = 1; }
				}

				for (var key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}

				levels[i] = n;
			} else {
				for (var key in o) {
					accounted_for[key] = 1;
				}
			}
		}

		for (var key in to_null_out) {
			if (!(key in update)) { update[key] = undefined; }
		}

		return update;
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

	function _differsImmutable(a, b) {
		return a != a ? b == b : a !== b;
	}

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) { return; }

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
				if (~index) { handlers.splice(index, 1); }
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) { return; }
		flush(this.root);
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		newState = assign(this._staged, newState);
		this._staged = {};

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
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
		while (fns && fns.length) { fns.shift()(); }
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	var protoDev = {
		destroy: destroyDev,
		get: get,
		fire: fire,
		on: on,
		set: setDev,
		_recompute: noop,
		_set: _set,
		_stage: _stage,
		_mount: _mount,
		_differs: _differs
	};

	/* globals dw */

	var __messages = {};

	function initMessages(scope) {
	    if ( scope === void 0 ) scope = 'core';

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
	function __(key, scope) {
	    var arguments$1 = arguments;
	    if ( scope === void 0 ) scope = 'core';

	    key = key.trim();
	    if (!__messages[scope]) { initMessages(scope); }
	    if (!__messages[scope][key]) { return 'MISSING:' + key; }
	    var translation = __messages[scope][key];

	    if (typeof translation === 'string' && arguments.length > 2) {
	        // replace $0, $1 etc with remaining arguments
	        translation = translation.replace(/\$(\d)/g, function (m, i) {
	            i = 2 + Number(i);
	            if (arguments$1[i] === undefined) { return m; }
	            return arguments$1[i];
	        });
	    }
	    return translation;
	}

	/**
	 * Shorten a string by removing characters from the middle
	 *
	 * @exports truncate
	 * @kind function
	 *
	 * @example
	 * import truncate from '@datawrapper/shared/truncate';
	 * // returns 'This is a…tring'
	 * truncate('This is a very very long string')
	 *
	 * @param {string} str
	 * @param {number} start - characters to keep at start of string
	 * @param {number} end - characters to keep at end off string
	 * @returns {string}
	 */
	function truncate(str, start, end) {
	    if ( start === void 0 ) start = 11;
	    if ( end === void 0 ) end = 7;

	    if (typeof str !== 'string') { return str; }
	    if (str.length < start + end + 3) { return str; }
	    return str.substr(0, start).trim() + '…' + str.substr(str.length - end).trim();
	}

	/**
	 * Download and parse a remote JSON document
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
	        method: method,
	        body: body,
	        mode: 'cors',
	        credentials: credentials
	    };

	    return window
	        .fetch(url, opts)
	        .then(function (res) {
	            if (!res.ok) { throw new Error(res.statusText); }
	            return res.text();
	        })
	        .then(function (text) {
	            try {
	                return JSON.parse(text);
	            } catch (Error) {
	                // could not parse json, so just return text
	                console.warn('malformed json input', text);
	                return text;
	            }
	        })
	        .then(function (res) {
	            if (callback) { callback(res); }
	            return res;
	        })
	        .catch(function (err) {
	            console.error(err);
	        });
	}

	/**
	 * Download and parse a JSON document via GET
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
	    if (arguments.length === 2) {
	        callback = credentials;
	        credentials = 'include';
	    }

	    return fetchJSON(url, 'GET', credentials, null, callback);
	}

	/**
	 * Download and parse a remote JSON endpoint via POST. credentials
	 * are included automatically
	 *
	 * @param {string} url
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 * @example
	 * import { postJSON } from '@datawrapper/shared/fetch';
	 *
	 * postJSON('http://api.example.org', JSON.stringify({
	 *    query: 'foo',
	 *    page: 12
	 * }));
	 */
	function postJSON(url, body, callback) {
	    return fetchJSON(url, 'POST', 'include', body, callback);
	}

	/**
	 * Download and parse a remote JSON endpoint via PUT. credentials
	 * are included automatically
	 *
	 * @param {string} url
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 * @example
	 * import { putJSON } from '@datawrapper/shared/fetch';
	 *
	 * putJSON('http://api.example.org', JSON.stringify({
	 *    query: 'foo',
	 *    page: 12
	 * }));
	 */
	function putJSON(url, body, callback) {
	    return fetchJSON(url, 'PUT', 'include', body, callback);
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
	function loadScript(src, callback) {
	    if ( callback === void 0 ) callback = null;

	    return new Promise(function (resolve, reject) {
	        var script = document.createElement('script');
	        script.src = src;
	        script.onload = function () {
	            if (callback) { callback(); }
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
	function loadStylesheet(src, callback) {
	    if ( callback === void 0 ) callback = null;

	    return new Promise(function (resolve, reject) {
	        var link = document.createElement('link');
	        link.rel = 'stylesheet';
	        link.href = src;
	        link.onload = function () {
	            if (callback) { callback(); }
	            resolve();
	        };
	        link.onerror = reject;
	        document.head.appendChild(link);
	    });
	}

	/* global dw */
	var MIN_PASSWORD_LENGTH = 10;

	function checkPassword(curPwd, pwd, pwd2) {
	    var msg;
	    if (curPwd === '') {
	        msg = dw.backend.messages.provideCurPwd;
	    } else if (pwd.length < MIN_PASSWORD_LENGTH) {
	        msg = dw.backend.messages.pwdTooShort.replace('%num', MIN_PASSWORD_LENGTH);
	    } else if (pwd !== pwd2) {
	        msg = dw.backend.messages.pwdMismatch;
	    }
	    if (msg) {
	        return msg;
	    }
	    return false;
	}

	/* shared/FormBlock.html generated by Svelte v2.16.1 */

	function data() {
	    return {
	        label: '',
	        help: '',
	        error: false,
	        width: 'auto'
	    };
	}
	var file = "shared/FormBlock.html";

	function create_main_fragment(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, text2;

		var if_block0 = (ctx.label) && create_if_block_2(component, ctx);

		var if_block1 = (ctx.error) && create_if_block_1(component, ctx);

		var if_block2 = (!ctx.error && ctx.help) && create_if_block(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n    ");
				div0 = createElement("div");
				text1 = createText("\n    ");
				if (if_block1) { if_block1.c(); }
				text2 = createText(" ");
				if (if_block2) { if_block2.c(); }
				div0.className = "form-controls svelte-183h2q3";
				addLoc(div0, file, 4, 4, 144);
				div1.className = "form-block svelte-183h2q3";
				setStyle(div1, "width", ctx.width);
				toggleClass(div1, "error", ctx.error);
				addLoc(div1, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				if (if_block0) { if_block0.m(div1, null); }
				append(div1, text0);
				append(div1, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
				}

				append(div1, text1);
				if (if_block1) { if_block1.m(div1, null); }
				append(div1, text2);
				if (if_block2) { if_block2.m(div1, null); }
			},

			p: function update(changed, ctx) {
				if (ctx.label) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2(component, ctx);
						if_block0.c();
						if_block0.m(div1, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.error) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1(component, ctx);
						if_block1.c();
						if_block1.m(div1, text2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!ctx.error && ctx.help) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block(component, ctx);
						if_block2.c();
						if_block2.m(div1, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (changed.width) {
					setStyle(div1, "width", ctx.width);
				}

				if (changed.error) {
					toggleClass(div1, "error", ctx.error);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block0) { if_block0.d(); }

				if (slot_content_default) {
					reinsertChildren(div0, slot_content_default);
				}

				if (if_block1) { if_block1.d(); }
				if (if_block2) { if_block2.d(); }
			}
		};
	}

	// (2:4) {#if label}
	function create_if_block_2(component, ctx) {
		var label;

		return {
			c: function create() {
				label = createElement("label");
				label.className = "control-label svelte-183h2q3";
				addLoc(label, file, 2, 4, 79);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				label.innerHTML = ctx.label;
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					label.innerHTML = ctx.label;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}
			}
		};
	}

	// (8:4) {#if error}
	function create_if_block_1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help error svelte-183h2q3";
				addLoc(div, file, 8, 4, 220);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.error;
			},

			p: function update(changed, ctx) {
				if (changed.error) {
					div.innerHTML = ctx.error;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (10:10) {#if !error && help}
	function create_if_block(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-183h2q3";
				addLoc(div, file, 10, 4, 299);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.help;
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function FormBlock(options) {
		this._debugName = '<FormBlock>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('width' in this._state)) { console.warn("<FormBlock> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<FormBlock> was created without expected data property 'label'"); }
		if (!('error' in this._state)) { console.warn("<FormBlock> was created without expected data property 'error'"); }
		if (!('help' in this._state)) { console.warn("<FormBlock> was created without expected data property 'help'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(FormBlock.prototype, protoDev);

	FormBlock.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* account/EditProfile.html generated by Svelte v2.16.1 */



	function data$1() {
	    return {
	        changePassword: false,
	        changeEmail: false,
	        deleteAccount: false,
	        showPasswordInPlaintext: false,
	        messages: [],
	        currentPassword: '',
	        newPassword1: '',
	        newPassword2: '',
	        confirmPassword: '',
	        groups: [
	            {
	                title: 'Account settings',
	                tabs: [
	                    {
	                        title: 'Profile',
	                        icon: 'fa fa-fw fa-user'
	                    }
	                ]
	            },
	            {
	                title: 'Team settings',
	                tabs: []
	            }
	        ]
	    };
	}
	var methods = {
	    changeEmail: function changeEmail() {
	        var this$1 = this;

	        var ref = this.get();
	        var email = ref.email;
	        var userId = ref.userId;

	        this.set({ savingEmail: true });

	        putJSON('/api/users/' + userId, JSON.stringify({ email: email }), function (res) {
	            this$1.set({ savingEmail: false });

	            var messages = [];
	            var errors = [];

	            if (res.status === 'error') {
	                errors.push(res.message);
	            }

	            if (res.data && res.data.messages) {
	                res.data.messages.forEach(function (msg) {
	                    messages.push(msg);
	                });
	            }

	            if (res.data && res.data.errors) {
	                res.data.errors.forEach(function (msg) {
	                    errors.push(msg);
	                });
	            }

	            if (errors.length === 0) {
	                this$1.set({
	                    originalEmail: email,
	                    changeEmail: false,
	                    messages: messages,
	                    errors: []
	                });
	            } else {
	                this$1.set({ errors: errors });
	            }
	        });
	    },
	    changePassword: function changePassword() {
	        var this$1 = this;

	        var ref = this.get();
	        var currentPassword = ref.currentPassword;
	        var newPassword1 = ref.newPassword1;
	        var newPassword2 = ref.newPassword2;
	        var userId = ref.userId;
	        var check = checkPassword(currentPassword, newPassword1, newPassword2);

	        if (check === false) {
	            this.set({ savingPassword: true });

	            getJSON('/api/auth/salt', function (res) {
	                if (res.status !== 'ok') {
	                    this$1.set({
	                        errors: ['Could not load salt.'],
	                        savingPassword: false
	                    });

	                    return;
	                }

	                var salt = res.data.salt;
	                var payload = {
	                    oldpwhash: CryptoJS.HmacSHA256(currentPassword, salt).toString(),
	                    pwd: CryptoJS.HmacSHA256(newPassword1, salt).toString()
	                };

	                putJSON('/api/users/' + userId, JSON.stringify(payload), function (res) {
	                    this$1.set({
	                        savingPassword: false,
	                        currentPassword: '',
	                        newPassword1: '',
	                        newPassword2: ''
	                    });

	                    var messages = [];
	                    var errors = [];

	                    if (res.status === 'error') {
	                        errors.push(res.message);
	                    }

	                    if (res.data && res.data.messages) {
	                        res.data.messages.forEach(function (msg) {
	                            messages.push(msg);
	                        });
	                    }

	                    if (res.data && res.data.errors) {
	                        res.data.errors.forEach(function (msg) {
	                            errors.push(msg);
	                        });
	                    }

	                    if (errors.length === 0) {
	                        messages.push('Your password was changed sucessfully');
	                        this$1.set({ changePassword: false, messages: messages, errors: [] });
	                    } else {
	                        this$1.set({ errors: errors });
	                    }
	                });
	            });
	        } else {
	            var errors = [check];
	            this.set({ errors: errors });
	        }
	    },
	    deleteAccount: function deleteAccount() {
	        var this$1 = this;

	        var ref = this.get();
	        var confirmPassword = ref.confirmPassword;

	        this.set({ deletingAccount: true });

	        getJSON('/api/auth/salt', function (res) {
	            if (res.status !== 'ok') {
	                this$1.set({
	                    errors: ['Could not load salt.'],
	                    deletingAccount: false
	                });

	                return;
	            }

	            var passwordHash = CryptoJS.HmacSHA256(confirmPassword, res.data.salt).toString();

	            fetchJSON('/api/users/current?pwd=' + passwordHash, 'DELETE', 'include', JSON.stringify({ pwd: passwordHash }), function (res) {
	                this$1.set({ deletingAccount: false });
	                var errors = [];

	                if (res.status === 'error') {
	                    errors.push(res.message);
	                }

	                if (res.data && res.data.messages) {
	                    res.data.messages.forEach(function (msg) {
	                    });
	                }

	                if (res.data && res.data.errors) {
	                    res.data.errors.forEach(function (msg) {
	                        errors.push(msg);
	                    });
	                }

	                if (errors.length === 0) {
	                    this$1.set({ deleteAccount2: false, deleteAccount3: true });
	                } else {
	                    this$1.set({ errors: errors });
	                }
	            });
	        });
	    }
	};

	function onstate(ref) {
	    var changed = ref.changed;
	    var current = ref.current;
	    var previous = ref.previous;

	    if (changed.email && !previous) {
	        this.set({ originalEmail: current.email });
	    }
	}
	var file$1 = "account/EditProfile.html";

	function get_each_context_1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var h2, text0_value = __("Edit profile"), text0, text1, text2, div2, div0, input, input_disabled_value, text3, if_block1_anchor, text4, text5, text6, div1, p, text7_value = __("account / change-login"), text7;

		var if_block0 = (ctx.messages && ctx.messages.length) && create_if_block_6(component, ctx);

		function select_block_type(ctx) {
			if (ctx.changeEmail) { return create_if_block_5; }
			return create_else_block_2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type(component, ctx);

		var formblock_initial_data = { label: __('E-Mail'), help: ctx.changeEmail ? __('account / confirm-email-change') : '' };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		function select_block_type_1(ctx) {
			if (!ctx.changePassword) { return create_if_block_3; }
			return create_else_block_1;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block2 = current_block_type_1(component, ctx);

		function select_block_type_2(ctx) {
			if (ctx.deleteAccount3) { return create_if_block$1; }
			if (ctx.deleteAccount2) { return create_if_block_1$1; }
			if (ctx.deleteAccount) { return create_if_block_2$1; }
			return create_else_block;
		}

		var current_block_type_2 = select_block_type_2(ctx);
		var if_block3 = current_block_type_2(component, ctx);

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n\n");
				if (if_block0) { if_block0.c(); }
				text2 = createText("\n\n");
				div2 = createElement("div");
				div0 = createElement("div");
				input = createElement("input");
				text3 = createText("\n            ");
				if_block1.c();
				if_block1_anchor = createComment();
				formblock._fragment.c();
				text4 = createText("\n\n        ");
				if_block2.c();
				text5 = createText(" ");
				if_block3.c();
				text6 = createText("\n    ");
				div1 = createElement("div");
				p = createElement("p");
				text7 = createText(text7_value);
				addLoc(h2, file$1, 0, 0, 0);
				input.disabled = input_disabled_value = !ctx.changeEmail;
				input.value = ctx.originalEmail;
				setAttribute(input, "type", "text");
				addLoc(input, file$1, 19, 12, 638);
				div0.className = "span6";
				addLoc(div0, file$1, 17, 4, 496);
				p.className = "help";
				addLoc(p, file$1, 133, 8, 5901);
				div1.className = "span4";
				addLoc(div1, file$1, 132, 4, 5873);
				div2.className = "row edit-account";
				setStyle(div2, "margin-top", "" + (ctx.messages && ctx.messages.length ? 0 : 20) + "px");
				addLoc(div2, file$1, 16, 0, 397);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				append(h2, text0);
				insert(target, text1, anchor);
				if (if_block0) { if_block0.m(target, anchor); }
				insert(target, text2, anchor);
				insert(target, div2, anchor);
				append(div2, div0);
				append(formblock._slotted.default, input);
				append(formblock._slotted.default, text3);
				if_block1.m(formblock._slotted.default, null);
				append(formblock._slotted.default, if_block1_anchor);
				formblock._mount(div0, null);
				append(div0, text4);
				if_block2.m(div0, null);
				append(div0, text5);
				if_block3.m(div0, null);
				append(div2, text6);
				append(div2, div1);
				append(div1, p);
				append(p, text7);
			},

			p: function update(changed, ctx) {
				if (ctx.messages && ctx.messages.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_6(component, ctx);
						if_block0.c();
						if_block0.m(text2.parentNode, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if ((changed.changeEmail) && input_disabled_value !== (input_disabled_value = !ctx.changeEmail)) {
					input.disabled = input_disabled_value;
				}

				if (changed.originalEmail) {
					input.value = ctx.originalEmail;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}

				var formblock_changes = {};
				if (changed.changeEmail) { formblock_changes.help = ctx.changeEmail ? __('account / confirm-email-change') : ''; }
				formblock._set(formblock_changes);

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type_1(component, ctx);
					if_block2.c();
					if_block2.m(div0, text5);
				}

				if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3.d(1);
					if_block3 = current_block_type_2(component, ctx);
					if_block3.c();
					if_block3.m(div0, null);
				}

				if (changed.messages) {
					setStyle(div2, "margin-top", "" + (ctx.messages && ctx.messages.length ? 0 : 20) + "px");
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text1);
				}

				if (if_block0) { if_block0.d(detach); }
				if (detach) {
					detachNode(text2);
					detachNode(div2);
				}

				if_block1.d();
				formblock.destroy();
				if_block2.d();
				if_block3.d();
			}
		};
	}

	// (3:0) {#if messages && messages.length }
	function create_if_block_6(component, ctx) {
		var div2, div1, div0, ul;

		var each_value = ctx.messages;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div1 = createElement("div");
				div0 = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setStyle(ul, "margin-bottom", "0");
				addLoc(ul, file$1, 6, 12, 198);
				div0.className = "alert alert-success";
				addLoc(div0, file$1, 5, 8, 152);
				div1.className = "span6 offset3";
				addLoc(div1, file$1, 4, 4, 116);
				div2.className = "row";
				setStyle(div2, "margin-top", "20px");
				addLoc(div2, file$1, 3, 0, 68);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, div0);
				append(div0, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.messages) {
					each_value = ctx.messages;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
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
					detachNode(div2);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (8:16) {#each messages as message}
	function create_each_block_1(component, ctx) {
		var li, raw_value = ctx.message;

		return {
			c: function create() {
				li = createElement("li");
				addLoc(li, file$1, 8, 16, 289);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.messages) && raw_value !== (raw_value = ctx.message)) {
					li.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	// (28:12) {:else}
	function create_else_block_2(component, ctx) {
		var button, text_value = __( "account / email"), text;

		function click_handler(event) {
			component.set({changeEmail: true});
		}

		return {
			c: function create() {
				button = createElement("button");
				text = createText(text_value);
				addListener(button, "click", click_handler);
				button.className = "btn btn-save btn-default";
				addLoc(button, file$1, 28, 12, 1133);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, text);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (21:12) {#if changeEmail}
	function create_if_block_5(component, ctx) {
		var button0, text0_value = __( "Back"), text0, text1, button1, i, i_class_value, text2, text3_value = __( "account / email"), text3;

		function click_handler(event) {
			component.set({changeEmail: false});
		}

		function click_handler_1(event) {
			component.changeEmail();
		}

		return {
			c: function create() {
				button0 = createElement("button");
				text0 = createText(text0_value);
				text1 = createText("\n            ");
				button1 = createElement("button");
				i = createElement("i");
				text2 = createText("  ");
				text3 = createText(text3_value);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-default";
				addLoc(button0, file$1, 21, 12, 756);
				i.className = i_class_value = "fa " + (ctx.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-19q3a7q";
				addLoc(i, file$1, 25, 16, 975);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-save btn-primary";
				addLoc(button1, file$1, 24, 12, 892);
			},

			m: function mount(target, anchor) {
				insert(target, button0, anchor);
				append(button0, text0);
				insert(target, text1, anchor);
				insert(target, button1, anchor);
				append(button1, i);
				append(button1, text2);
				append(button1, text3);
			},

			p: function update(changed, ctx) {
				if ((changed.savingEmail) && i_class_value !== (i_class_value = "fa " + (ctx.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-19q3a7q")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text1);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (42:8) {:else}
	function create_else_block_1(component, ctx) {
		var h3, text0_value = __("account / password"), text0, text1, button0, text2_value = __("Back"), text2, text3, text4, input0, input0_updating = false, text5, input1, input1_updating = false, text6, input2, input2_updating = false, text7, button1, i, i_class_value, text8, text9_value = __("account / password"), text9, text10, hr;

		function click_handler(event) {
			component.set({changePassword: false});
		}

		var if_block = (ctx.changePassword && ctx.errors && ctx.errors.length) && create_if_block_4(component, ctx);

		function input0_input_handler() {
			input0_updating = true;
			component.set({ currentPassword: input0.value });
			input0_updating = false;
		}

		var formblock0_initial_data = {
		 	label: __('Current Password'),
		 	help: __('account / password / current-password-note')
		 };
		var formblock0 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock0_initial_data
		});

		function input1_input_handler() {
			input1_updating = true;
			component.set({ newPassword1: input1.value });
			input1_updating = false;
		}

		var formblock1_initial_data = {
		 	error: ctx.currentPassword ? checkPassword(ctx.currentPassword, ctx.newPassword1, ctx.newPassword2) : false,
		 	label: __('New Password'),
		 	help: "Your password must have at least 4 characters"
		 };
		var formblock1 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock1_initial_data
		});

		function input2_input_handler() {
			input2_updating = true;
			component.set({ newPassword2: input2.value });
			input2_updating = false;
		}

		var formblock2_initial_data = {
		 	error: ctx.currentPassword ? checkPassword(ctx.currentPassword, ctx.newPassword1, ctx.newPassword2) : false,
		 	label: __('(repeat)'),
		 	help: ""
		 };
		var formblock2 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock2_initial_data
		});

		function click_handler_1(event) {
			component.changePassword();
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				text0 = createText(text0_value);
				text1 = createText("\n            ");
				button0 = createElement("button");
				text2 = createText(text2_value);
				text3 = createText("\n        ");
				if (if_block) { if_block.c(); }
				text4 = createText("\n        ");
				input0 = createElement("input");
				formblock0._fragment.c();
				text5 = createText("\n        ");
				input1 = createElement("input");
				formblock1._fragment.c();
				text6 = createText("\n        ");
				input2 = createElement("input");
				formblock2._fragment.c();
				text7 = createText("\n\n        ");
				button1 = createElement("button");
				i = createElement("i");
				text8 = createText("  ");
				text9 = createText(text9_value);
				text10 = createText("\n        ");
				hr = createElement("hr");
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-save btn-default btn-back";
				addLoc(button0, file$1, 44, 12, 1728);
				addLoc(h3, file$1, 42, 8, 1670);
				addListener(input0, "input", input0_input_handler);
				setAttribute(input0, "type", "password");
				input0.className = "input-xlarge";
				addLoc(input0, file$1, 58, 12, 2296);
				addListener(input1, "input", input1_input_handler);
				setAttribute(input1, "type", "password");
				input1.className = "input-xlarge";
				addLoc(input1, file$1, 65, 12, 2649);
				addListener(input2, "input", input2_input_handler);
				setAttribute(input2, "type", "password");
				input2.className = "input-xlarge";
				addLoc(input2, file$1, 68, 12, 2905);
				i.className = i_class_value = "fa " + (ctx.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-19q3a7q";
				addLoc(i, file$1, 72, 12, 3081);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-primary";
				addLoc(button1, file$1, 71, 8, 3008);
				addLoc(hr, file$1, 74, 8, 3216);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				append(h3, text1);
				append(h3, button0);
				append(button0, text2);
				insert(target, text3, anchor);
				if (if_block) { if_block.m(target, anchor); }
				insert(target, text4, anchor);
				append(formblock0._slotted.default, input0);

				input0.value = ctx.currentPassword;

				formblock0._mount(target, anchor);
				insert(target, text5, anchor);
				append(formblock1._slotted.default, input1);

				input1.value = ctx.newPassword1;

				formblock1._mount(target, anchor);
				insert(target, text6, anchor);
				append(formblock2._slotted.default, input2);

				input2.value = ctx.newPassword2;

				formblock2._mount(target, anchor);
				insert(target, text7, anchor);
				insert(target, button1, anchor);
				append(button1, i);
				append(button1, text8);
				append(button1, text9);
				insert(target, text10, anchor);
				insert(target, hr, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.changePassword && ctx.errors && ctx.errors.length) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_4(component, ctx);
						if_block.c();
						if_block.m(text4.parentNode, text4);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (!input0_updating && changed.currentPassword) { input0.value = ctx.currentPassword; }
				if (!input1_updating && changed.newPassword1) { input1.value = ctx.newPassword1; }

				var formblock1_changes = {};
				if (changed.currentPassword || changed.newPassword1 || changed.newPassword2) { formblock1_changes.error = ctx.currentPassword ? checkPassword(ctx.currentPassword, ctx.newPassword1, ctx.newPassword2) : false; }
				formblock1._set(formblock1_changes);

				if (!input2_updating && changed.newPassword2) { input2.value = ctx.newPassword2; }

				var formblock2_changes = {};
				if (changed.currentPassword || changed.newPassword1 || changed.newPassword2) { formblock2_changes.error = ctx.currentPassword ? checkPassword(ctx.currentPassword, ctx.newPassword1, ctx.newPassword2) : false; }
				formblock2._set(formblock2_changes);

				if ((changed.savingPassword) && i_class_value !== (i_class_value = "fa " + (ctx.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-19q3a7q")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
				}

				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text3);
				}

				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(text4);
				}

				removeListener(input0, "input", input0_input_handler);
				formblock0.destroy(detach);
				if (detach) {
					detachNode(text5);
				}

				removeListener(input1, "input", input1_input_handler);
				formblock1.destroy(detach);
				if (detach) {
					detachNode(text6);
				}

				removeListener(input2, "input", input2_input_handler);
				formblock2.destroy(detach);
				if (detach) {
					detachNode(text7);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
				if (detach) {
					detachNode(text10);
					detachNode(hr);
				}
			}
		};
	}

	// (35:8) {#if !changePassword}
	function create_if_block_3(component, ctx) {
		var input, text0, button, text1_value = __("account / password"), text1;

		function click_handler(event) {
			component.set({changePassword: true});
		}

		var formblock_initial_data = { label: __('Password'), help: "" };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		return {
			c: function create() {
				input = createElement("input");
				text0 = createText("\n            ");
				button = createElement("button");
				text1 = createText(text1_value);
				formblock._fragment.c();
				input.disabled = true;
				input.value = "abcdefgh";
				setAttribute(input, "type", "password");
				addLoc(input, file$1, 36, 12, 1413);
				addListener(button, "click", click_handler);
				button.className = "btn btn-save btn-default";
				addLoc(button, file$1, 37, 12, 1477);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, input);
				append(formblock._slotted.default, text0);
				append(formblock._slotted.default, button);
				append(button, text1);
				formblock._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				removeListener(button, "click", click_handler);
				formblock.destroy(detach);
			}
		};
	}

	// (49:8) {#if changePassword && errors && errors.length }
	function create_if_block_4(component, ctx) {
		var div, ul;

		var each_value_1 = ctx.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setStyle(ul, "margin-bottom", "0");
				addLoc(ul, file$1, 50, 12, 1983);
				div.className = "alert";
				addLoc(div, file$1, 49, 8, 1951);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.errors) {
					each_value_1 = ctx.errors;

					for (var i = 0; i < each_value_1.length; i += 1) {
						var child_ctx = get_each_context_1(ctx, each_value_1, i);

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
					each_blocks.length = each_value_1.length;
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

	// (52:16) {#each errors as message}
	function create_each_block(component, ctx) {
		var li, raw_value = ctx.message;

		return {
			c: function create() {
				li = createElement("li");
				addLoc(li, file$1, 52, 16, 2072);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && raw_value !== (raw_value = ctx.message)) {
					li.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	// (127:8) {:else}
	function create_else_block(component, ctx) {
		var button, text_value = __("account / delete"), text;

		function click_handler(event) {
			component.set({deleteAccount: true});
		}

		var formblock_initial_data = { label: "Delete account", help: "" };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		return {
			c: function create() {
				button = createElement("button");
				text = createText(text_value);
				formblock._fragment.c();
				addListener(button, "click", click_handler);
				button.className = "btn btn-danger";
				setAttribute(button, "href", "#");
				addLoc(button, file$1, 128, 12, 5709);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, button);
				append(button, text);
				formblock._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				removeListener(button, "click", click_handler);
				formblock.destroy(detach);
			}
		};
	}

	// (116:31) 
	function create_if_block_2$1(component, ctx) {
		var h3, i0, text0, text1_value = __("account / confirm-account-deletion"), text1, text2, button0, i1, text3, text4_value = __("account / confirm-account-deletion / no"), text4, text5, text6_value = __("account / or"), text6, text7, button1, i2, text8, text9_value = __("account / confirm-account-deletion / yes"), text9;

		function click_handler(event) {
			component.set({deleteAccount: false});
		}

		function click_handler_1(event) {
			component.set({deleteAccount: false, deleteAccount2: true});
		}

		return {
			c: function create() {
				h3 = createElement("h3");
				i0 = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				text2 = createText("\n        ");
				button0 = createElement("button");
				i1 = createElement("i");
				text3 = createText("   ");
				text4 = createText(text4_value);
				text5 = createText("\n\n        ");
				text6 = createText(text6_value);
				text7 = createText("\n\n        ");
				button1 = createElement("button");
				i2 = createElement("i");
				text8 = createText("   ");
				text9 = createText(text9_value);
				i0.className = "fa fa-times svelte-19q3a7q";
				addLoc(i0, file$1, 116, 12, 5090);
				h3.className = "svelte-19q3a7q";
				addLoc(h3, file$1, 116, 8, 5086);
				i1.className = "fa fa-chevron-left";
				addLoc(i1, file$1, 118, 12, 5269);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-back btn-primary";
				addLoc(button0, file$1, 117, 8, 5176);
				i2.className = "fa fa-times";
				addLoc(i2, file$1, 124, 12, 5526);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-default";
				addLoc(button1, file$1, 123, 8, 5420);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, i0);
				append(h3, text0);
				append(h3, text1);
				insert(target, text2, anchor);
				insert(target, button0, anchor);
				append(button0, i1);
				append(button0, text3);
				append(button0, text4);
				insert(target, text5, anchor);
				insert(target, text6, anchor);
				insert(target, text7, anchor);
				insert(target, button1, anchor);
				append(button1, i2);
				append(button1, text8);
				append(button1, text9);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text2);
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text5);
					detachNode(text6);
					detachNode(text7);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (83:32) 
	function create_if_block_1$1(component, ctx) {
		var h2, text0_value = __("account / delete / hed"), text0, text1, div1, p0, text2_value = __("account / delete / really"), text2, text3, ul, li0, text4_value = __("account / confirm-account-deletion / free"), text4, text5, li1, text6_value = __("You cannot login and logout anymore."), text6, text7, li2, text8_value = __("You cannot edit or remove your charts anymore."), text8, text9, p1, text10_value = __("account / delete / charts-stay-online"), text10, text11, input, input_updating = false, text12, p2, raw_value = __("account / delete / really-really"), text13, div0, button0, i0, text14, text15_value = __("No, I changed my mind.."), text15, text16, button1, i1, i1_class_value, text17, text18_value = __("Yes, delete it!"), text18;

		function input_input_handler() {
			input_updating = true;
			component.set({ confirmPassword: input.value });
			input_updating = false;
		}

		var formblock_initial_data = {
		 	label: __('Please enter your password to confirm the deletion request:'),
		 	error: ctx.errors && ctx.errors.length ? ctx.errors.join('. ') : false
		 };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		function click_handler(event) {
			component.set({deleteAccount2: false});
		}

		function click_handler_1(event) {
			component.deleteAccount();
		}

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				div1 = createElement("div");
				p0 = createElement("p");
				text2 = createText(text2_value);
				text3 = createText("\n            ");
				ul = createElement("ul");
				li0 = createElement("li");
				text4 = createText(text4_value);
				text5 = createText("\n                ");
				li1 = createElement("li");
				text6 = createText(text6_value);
				text7 = createText("\n                ");
				li2 = createElement("li");
				text8 = createText(text8_value);
				text9 = createText("\n            ");
				p1 = createElement("p");
				text10 = createText(text10_value);
				text11 = createText("\n\n            ");
				input = createElement("input");
				formblock._fragment.c();
				text12 = createText("\n            ");
				p2 = createElement("p");
				text13 = createText("\n            ");
				div0 = createElement("div");
				button0 = createElement("button");
				i0 = createElement("i");
				text14 = createText("  ");
				text15 = createText(text15_value);
				text16 = createText("\n                ");
				button1 = createElement("button");
				i1 = createElement("i");
				text17 = createText("  ");
				text18 = createText(text18_value);
				setStyle(h2, "margin-bottom", "20px");
				addLoc(h2, file$1, 83, 8, 3534);
				addLoc(p0, file$1, 85, 12, 3652);
				addLoc(li0, file$1, 89, 16, 3758);
				addLoc(li1, file$1, 90, 16, 3835);
				addLoc(li2, file$1, 91, 16, 3907);
				addLoc(ul, file$1, 88, 12, 3737);
				addLoc(p1, file$1, 93, 12, 4003);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "password");
				input.placeholder = __("Password");
				addLoc(input, file$1, 101, 16, 4314);
				p2.className = "lead";
				addLoc(p2, file$1, 103, 12, 4439);
				i0.className = "fa fa-chevron-left";
				addLoc(i0, file$1, 108, 20, 4683);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-info";
				addLoc(button0, file$1, 107, 16, 4593);
				i1.className = i1_class_value = "fa " + (ctx.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-19q3a7q";
				addLoc(i1, file$1, 111, 20, 4879);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-danger";
				addLoc(button1, file$1, 110, 16, 4800);
				div0.className = "control-group";
				addLoc(div0, file$1, 106, 12, 4549);
				div1.className = "delete-account";
				addLoc(div1, file$1, 84, 8, 3611);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				append(h2, text0);
				insert(target, text1, anchor);
				insert(target, div1, anchor);
				append(div1, p0);
				append(p0, text2);
				append(div1, text3);
				append(div1, ul);
				append(ul, li0);
				append(li0, text4);
				append(ul, text5);
				append(ul, li1);
				append(li1, text6);
				append(ul, text7);
				append(ul, li2);
				append(li2, text8);
				append(div1, text9);
				append(div1, p1);
				append(p1, text10);
				append(div1, text11);
				append(formblock._slotted.default, input);

				input.value = ctx.confirmPassword;

				formblock._mount(div1, null);
				append(div1, text12);
				append(div1, p2);
				p2.innerHTML = raw_value;
				append(div1, text13);
				append(div1, div0);
				append(div0, button0);
				append(button0, i0);
				append(button0, text14);
				append(button0, text15);
				append(div0, text16);
				append(div0, button1);
				append(button1, i1);
				append(button1, text17);
				append(button1, text18);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.confirmPassword) { input.value = ctx.confirmPassword; }

				var formblock_changes = {};
				if (changed.errors) { formblock_changes.error = ctx.errors && ctx.errors.length ? ctx.errors.join('. ') : false; }
				formblock._set(formblock_changes);

				if ((changed.deletingAccount) && i1_class_value !== (i1_class_value = "fa " + (ctx.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-19q3a7q")) {
					i1.className = i1_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text1);
					detachNode(div1);
				}

				removeListener(input, "input", input_input_handler);
				formblock.destroy();
				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (76:14) {#if deleteAccount3}
	function create_if_block$1(component, ctx) {
		var h2, text0_value = __("account / delete / hed"), text0, text1, h3, text2_value = __("Your account has been deleted."), text2, text3, a, text4_value = __("Goodbye!"), text4;

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				h3 = createElement("h3");
				text2 = createText(text2_value);
				text3 = createText("\n        ");
				a = createElement("a");
				text4 = createText(text4_value);
				setStyle(h2, "margin-bottom", "20px");
				addLoc(h2, file$1, 76, 8, 3266);
				addLoc(h3, file$1, 77, 8, 3343);
				a.href = "/";
				a.className = "btn btn-primary btn-large";
				addLoc(a, file$1, 80, 8, 3423);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				append(h2, text0);
				insert(target, text1, anchor);
				insert(target, h3, anchor);
				append(h3, text2);
				insert(target, text3, anchor);
				insert(target, a, anchor);
				append(a, text4);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text1);
					detachNode(h3);
					detachNode(text3);
					detachNode(a);
				}
			}
		};
	}

	function EditProfile(options) {
		var this$1 = this;

		this._debugName = '<EditProfile>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);
		if (!('messages' in this._state)) { console.warn("<EditProfile> was created without expected data property 'messages'"); }
		if (!('changeEmail' in this._state)) { console.warn("<EditProfile> was created without expected data property 'changeEmail'"); }
		if (!('originalEmail' in this._state)) { console.warn("<EditProfile> was created without expected data property 'originalEmail'"); }
		if (!('savingEmail' in this._state)) { console.warn("<EditProfile> was created without expected data property 'savingEmail'"); }
		if (!('changePassword' in this._state)) { console.warn("<EditProfile> was created without expected data property 'changePassword'"); }
		if (!('errors' in this._state)) { console.warn("<EditProfile> was created without expected data property 'errors'"); }
		if (!('currentPassword' in this._state)) { console.warn("<EditProfile> was created without expected data property 'currentPassword'"); }
		if (!('newPassword1' in this._state)) { console.warn("<EditProfile> was created without expected data property 'newPassword1'"); }
		if (!('newPassword2' in this._state)) { console.warn("<EditProfile> was created without expected data property 'newPassword2'"); }
		if (!('savingPassword' in this._state)) { console.warn("<EditProfile> was created without expected data property 'savingPassword'"); }
		if (!('deleteAccount3' in this._state)) { console.warn("<EditProfile> was created without expected data property 'deleteAccount3'"); }
		if (!('deleteAccount2' in this._state)) { console.warn("<EditProfile> was created without expected data property 'deleteAccount2'"); }
		if (!('confirmPassword' in this._state)) { console.warn("<EditProfile> was created without expected data property 'confirmPassword'"); }
		if (!('deletingAccount' in this._state)) { console.warn("<EditProfile> was created without expected data property 'deletingAccount'"); }
		if (!('deleteAccount' in this._state)) { console.warn("<EditProfile> was created without expected data property 'deleteAccount'"); }
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$1(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(EditProfile.prototype, protoDev);
	assign(EditProfile.prototype, methods);

	EditProfile.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

	function data$2() {
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

	var file$2 = "node_modules/datawrapper/controls/ControlGroup.html";

	function create_main_fragment$2(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, slot_content_default_after, text1, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_1$2(component, ctx);

		var if_block1 = (ctx.help) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n    ");
				div0 = createElement("div");
				text1 = createText("\n        ");
				if (if_block1) { if_block1.c(); }
				div0.className = "controls svelte-xyokw0";
				setStyle(div0, "width", "calc(100% - " + (ctx.width||def.width) + " - 40px)");
				toggleClass(div0, "form-inline", ctx.inline);
				addLoc(div0, file$2, 4, 4, 219);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-xyokw0";
				addLoc(div1, file$2, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				if (if_block0) { if_block0.m(div1, null); }
				append(div1, text0);
				append(div1, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
					append(div0, slot_content_default_after || (slot_content_default_after = createComment()));
				}

				append(div0, text1);
				if (if_block1) { if_block1.m(div0, null); }
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

				if (ctx.help) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$2(component, ctx);
						if_block1.c();
						if_block1.m(div0, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.width) {
					setStyle(div0, "width", "calc(100% - " + (ctx.width||def.width) + " - 40px)");
				}

				if (changed.inline) {
					toggleClass(div0, "form-inline", ctx.inline);
				}

				if ((changed.type || changed.valign) && div1_class_value !== (div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-xyokw0")) {
					div1.className = div1_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block0) { if_block0.d(); }

				if (slot_content_default) {
					reinsertBefore(slot_content_default_after, slot_content_default);
				}

				if (if_block1) { if_block1.d(); }
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
				label.className = "control-label svelte-xyokw0";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$2, 2, 4, 104);
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

	// (7:8) {#if help}
	function create_if_block$2(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				p.className = p_class_value = "mini-help " + ctx.type + " svelte-xyokw0";
				addLoc(p, file$2, 7, 8, 368);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.help;
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					p.innerHTML = ctx.help;
				}

				if ((changed.type) && p_class_value !== (p_class_value = "mini-help " + ctx.type + " svelte-xyokw0")) {
					p.className = p_class_value;
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
		this._state = assign(data$2(), options.data);
		if (!('type' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'type'"); }
		if (!('valign' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'valign'"); }
		if (!('label' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'label'"); }
		if (!('width' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'width'"); }
		if (!('inline' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'inline'"); }
		if (!('help' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'help'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
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

	/* node_modules/@datawrapper/controls/Text.html generated by Svelte v2.16.1 */



	function data$3() {
	    return {
	        disabled: false,
	        disabled_msg: '',
	        width: '100px',
	        help: '',
	        placeholder: '',
	        prepend: '',
	        append: ''
	    };
	}
	var file$3 = "node_modules/datawrapper/controls/Text.html";

	function create_main_fragment$3(component, ctx) {
		var div, text0, input, input_updating = false, text1, text2, if_block2_anchor;

		var if_block0 = (ctx.prepend) && create_if_block_2$2(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ value: input.value });
			input_updating = false;
		}

		var if_block1 = (ctx.append) && create_if_block_1$3(component, ctx);

		var controlgroup_initial_data = {
		 	disabled: ctx.disabled,
		 	type: "text",
		 	width: ctx.width,
		 	label: ctx.label,
		 	help: ctx.help
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block2 = (ctx.disabled && ctx.disabled_msg) && create_if_block$3(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n        ");
				input = createElement("input");
				text1 = createText("\n        ");
				if (if_block1) { if_block1.c(); }
				controlgroup._fragment.c();
				text2 = createText("\n\n");
				if (if_block2) { if_block2.c(); }
				if_block2_anchor = createComment();
				addListener(input, "input", input_input_handler);
				input.disabled = ctx.disabled;
				setAttribute(input, "type", "text");
				input.className = "input-large svelte-lyrczp";
				input.placeholder = ctx.placeholder;
				addLoc(input, file$3, 5, 8, 207);
				div.className = "flex svelte-lyrczp";
				addLoc(div, file$3, 1, 4, 99);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);
				if (if_block0) { if_block0.m(div, null); }
				append(div, text0);
				append(div, input);

				input.value = ctx.value ;

				append(div, text1);
				if (if_block1) { if_block1.m(div, null); }
				controlgroup._mount(target, anchor);
				insert(target, text2, anchor);
				if (if_block2) { if_block2.i(target, anchor); }
				insert(target, if_block2_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.prepend) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2$2(component, ctx);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!input_updating && changed.value) { input.value = ctx.value ; }
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.placeholder) {
					input.placeholder = ctx.placeholder;
				}

				if (ctx.append) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1$3(component, ctx);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				var controlgroup_changes = {};
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.help) { controlgroup_changes.help = ctx.help; }
				controlgroup._set(controlgroup_changes);

				if (ctx.disabled && ctx.disabled_msg) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$3(component, ctx);
						if (if_block2) { if_block2.c(); }
					}

					if_block2.i(if_block2_anchor.parentNode, if_block2_anchor);
				} else if (if_block2) {
					groupOutros();
					if_block2.o(function() {
						if_block2.d(1);
						if_block2 = null;
					});
				}
			},

			d: function destroy(detach) {
				if (if_block0) { if_block0.d(); }
				removeListener(input, "input", input_input_handler);
				if (if_block1) { if_block1.d(); }
				controlgroup.destroy(detach);
				if (detach) {
					detachNode(text2);
				}

				if (if_block2) { if_block2.d(detach); }
				if (detach) {
					detachNode(if_block2_anchor);
				}
			}
		};
	}

	// (3:8) {#if prepend}
	function create_if_block_2$2(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.prepend);
				div.className = "prepend";
				addLoc(div, file$3, 3, 8, 148);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.prepend) {
					setData(text, ctx.prepend);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (7:8) {#if append}
	function create_if_block_1$3(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.append);
				div.className = "append";
				addLoc(div, file$3, 7, 8, 339);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.append) {
					setData(text, ctx.append);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (13:0) {#if disabled && disabled_msg}
	function create_if_block$3(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-lyrczp";
				addLoc(div0, file$3, 14, 4, 474);
				addLoc(div1, file$3, 13, 0, 447);
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
				if (current) { return; }
				if (component.root._intro) {
					if (div1_transition) { div1_transition.invalidate(); }

					component.root._aftercreate.push(function () {
						if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, true); }
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) { return; }

				if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, false); }
				div1_transition.run(0, function () {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
					if (div1_transition) { div1_transition.abort(); }
				}
			}
		};
	}

	function Text(options) {
		this._debugName = '<Text>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$3(), options.data);
		if (!('disabled' in this._state)) { console.warn("<Text> was created without expected data property 'disabled'"); }
		if (!('width' in this._state)) { console.warn("<Text> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<Text> was created without expected data property 'label'"); }
		if (!('help' in this._state)) { console.warn("<Text> was created without expected data property 'help'"); }
		if (!('prepend' in this._state)) { console.warn("<Text> was created without expected data property 'prepend'"); }
		if (!('placeholder' in this._state)) { console.warn("<Text> was created without expected data property 'placeholder'"); }
		if (!('value' in this._state)) { console.warn("<Text> was created without expected data property 'value'"); }
		if (!('append' in this._state)) { console.warn("<Text> was created without expected data property 'append'"); }
		if (!('disabled_msg' in this._state)) { console.warn("<Text> was created without expected data property 'disabled_msg'"); }
		this._intro = true;

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Text.prototype, protoDev);

	Text.prototype._checkReadOnly = function _checkReadOnly(newState) {
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
	var file$4 = "node_modules/datawrapper/controls/BaseSelect.html";

	function get_each_context_2(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function get_each_context_1$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.optgroup = list[i];
		return child_ctx;
	}

	function get_each_context$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$4(component, ctx) {
		var select, if_block0_anchor, select_updating = false;

		var if_block0 = (ctx.options.length) && create_if_block_1$4(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$4(component, ctx);

		function select_change_handler() {
			select_updating = true;
			component.set({ value: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				select = createElement("select");
				if (if_block0) { if_block0.c(); }
				if_block0_anchor = createComment();
				if (if_block1) { if_block1.c(); }
				addListener(select, "change", select_change_handler);
				if (!('value' in ctx)) { component.root._beforecreate.push(select_change_handler); }
				select.className = "select-css svelte-v0oq4b";
				select.disabled = ctx.disabled;
				setStyle(select, "width", ctx.width);
				addLoc(select, file$4, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, select, anchor);
				if (if_block0) { if_block0.m(select, null); }
				append(select, if_block0_anchor);
				if (if_block1) { if_block1.m(select, null); }

				selectOption(select, ctx.value);
			},

			p: function update(changed, ctx) {
				if (ctx.options.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$4(component, ctx);
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

				if (!select_updating && changed.value) { selectOption(select, ctx.value); }
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

				if (if_block0) { if_block0.d(); }
				if (if_block1) { if_block1.d(); }
				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (2:4) {#if options.length}
	function create_if_block_1$4(component, ctx) {
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
						var child_ctx = get_each_context$1(ctx, each_value, i);

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
				addLoc(option, file$4, 2, 4, 145);
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
			each_blocks[i] = create_each_block$1(component, get_each_context_1$1(ctx, each_value_1, i));
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
						var child_ctx = get_each_context_1$1(ctx, each_value_1, i);

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
	function create_each_block_1$1(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				addLoc(option, file$4, 6, 8, 353);
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
			each_blocks[i] = create_each_block_1$1(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
				addLoc(optgroup, file$4, 4, 4, 269);
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
						var child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$1(component, child_ctx);
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
		if (!('disabled' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'disabled'"); }
		if (!('value' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'value'"); }
		if (!('width' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'width'"); }
		if (!('options' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'options'"); }
		if (!('optgroups' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'optgroups'"); }
		this._intro = true;

		this._fragment = create_main_fragment$4(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(BaseSelect.prototype, protoDev);

	BaseSelect.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* account/MyTeams.html generated by Svelte v2.16.1 */


	var initialCurrentTeam = null;

	function teamOptions(ref) {
	    var teams = ref.teams;

	    return teams
	        .map(function (ref) {
	        	var id = ref.id;
	        	var name = ref.name;

	        	return ({
	            value: id,
	            label: name
	        });
	    })
	        .concat({
	            value: null,
	            label: __('nav / no-team')
	        });
	}
	function autoslug(ref) {
	    var newTeamName = ref.newTeamName;

	    return newTeamName.toLowerCase().replace(/\W/g, '');
	}
	function data$5() {
	    return {
	        teams: [],
	        awaitActiveTeam: null,
	        awaitCreateTeam: null,
	        currentTeam: '',
	        createTeam: false,
	        newTeamName: '',
	        newTeamSlug: ''
	    };
	}
	var methods$1 = {
	    createTeam: function createTeam(name, slug) {
	        var ref = this.get();
	        var user = ref.user;
	        var payload = { name: name };
	        if (user.isAdmin && slug) {
	            payload.id = String(slug)
	                .trim()
	                .toLowerCase();
	        }
	        this.set({
	            awaitCreateTeam: postJSON(((window.location.protocol) + "//" + (dw.backend.__api_domain) + "/v3/teams"), JSON.stringify(payload)).then(
	                function (team) {
	                    window.location.href = "/team/" + (team.id) + "/settings";
	                }
	            )
	        });
	    }
	};

	function onstate$1(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.currentTeam && current.currentTeam !== undefined) {
	        if (!initialCurrentTeam) { initialCurrentTeam = current.currentTeam; }
	        else if (current.currentTeam !== initialCurrentTeam) {
	            initialCurrentTeam = current.currentTeam;
	            this.set({
	                awaitActiveTeam: putJSON(("/team/" + (current.currentTeam || '@none') + "/activate"), {})
	            });
	        }
	    }
	}
	var file$5 = "account/MyTeams.html";

	function get_each_context$2(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.team = list[i];
		return child_ctx;
	}

	function create_main_fragment$5(component, ctx) {
		var h2, raw_value = __("account / my-teams"), text0, text1, div, text2;

		function select_block_type(ctx) {
			if (ctx.teams.length) { return create_if_block_6$1; }
			return create_else_block_4;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		var if_block1 = (ctx.user.isAdmin) && create_if_block_2$3(component, ctx);

		var if_block2 = (ctx.teams.length > 0) && create_if_block$5(component, ctx);

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText("\n\n");
				if_block0.c();
				text1 = createText("\n\n");
				div = createElement("div");
				if (if_block1) { if_block1.c(); }
				text2 = createText(" ");
				if (if_block2) { if_block2.c(); }
				addLoc(h2, file$5, 0, 0, 0);
				div.className = "row";
				addLoc(div, file$5, 51, 0, 1833);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				h2.innerHTML = raw_value;
				insert(target, text0, anchor);
				if_block0.m(target, anchor);
				insert(target, text1, anchor);
				insert(target, div, anchor);
				if (if_block1) { if_block1.m(div, null); }
				append(div, text2);
				if (if_block2) { if_block2.m(div, null); }
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(text1.parentNode, text1);
				}

				if (ctx.user.isAdmin) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2$3(component, ctx);
						if_block1.c();
						if_block1.m(div, text2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.teams.length > 0) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$5(component, ctx);
						if_block2.c();
						if_block2.m(div, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text0);
				}

				if_block0.d(detach);
				if (detach) {
					detachNode(text1);
					detachNode(div);
				}

				if (if_block1) { if_block1.d(); }
				if (if_block2) { if_block2.d(); }
			}
		};
	}

	// (48:0) {:else}
	function create_else_block_4(component, ctx) {
		var p, raw_value = __('account / my-teams / no-teams-yet');

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$5, 48, 0, 1771);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (3:0) {#if teams.length}
	function create_if_block_6$1(component, ctx) {
		var p, raw_value = __('account / my-teams / your-teams'), text0, table, thead, tr, th0, text1_value = __('account / my-teams / name'), text1, text2, text3, th1, text4_value = __('account / my-teams / your-role'), text4, text5, th2, text6_value = __('account / my-teams / num-charts'), text6, text7, th3, text8_value = __('account / my-teams / num-members'), text8, text9, th4, text10_value = __('account / my-teams / leave-team'), text10, text11, tbody;

		var if_block = (ctx.user.isAdmin) && create_if_block_13();

		var each_value = ctx.teams;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context$2(ctx, each_value, i));
		}

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText("\n\n");
				table = createElement("table");
				thead = createElement("thead");
				tr = createElement("tr");
				th0 = createElement("th");
				text1 = createText(text1_value);
				text2 = createText("\n            ");
				if (if_block) { if_block.c(); }
				text3 = createText("\n            ");
				th1 = createElement("th");
				text4 = createText(text4_value);
				text5 = createText("\n            ");
				th2 = createElement("th");
				text6 = createText(text6_value);
				text7 = createText("\n            ");
				th3 = createElement("th");
				text8 = createText(text8_value);
				text9 = createText("\n            ");
				th4 = createElement("th");
				text10 = createText(text10_value);
				text11 = createText("\n    ");
				tbody = createElement("tbody");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addLoc(p, file$5, 3, 0, 63);
				addLoc(th0, file$5, 8, 12, 176);
				addLoc(th1, file$5, 12, 12, 333);
				addLoc(th2, file$5, 13, 12, 393);
				addLoc(th3, file$5, 14, 12, 454);
				addLoc(th4, file$5, 15, 12, 516);
				addLoc(tr, file$5, 7, 8, 159);
				addLoc(thead, file$5, 6, 4, 143);
				addLoc(tbody, file$5, 18, 4, 596);
				table.className = "table";
				addLoc(table, file$5, 5, 0, 117);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text0, anchor);
				insert(target, table, anchor);
				append(table, thead);
				append(thead, tr);
				append(tr, th0);
				append(th0, text1);
				append(tr, text2);
				if (if_block) { if_block.m(tr, null); }
				append(tr, text3);
				append(tr, th1);
				append(th1, text4);
				append(tr, text5);
				append(tr, th2);
				append(th2, text6);
				append(tr, text7);
				append(tr, th3);
				append(th3, text8);
				append(tr, text9);
				append(tr, th4);
				append(th4, text10);
				append(table, text11);
				append(table, tbody);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(tbody, null);
				}
			},

			p: function update(changed, ctx) {
				if (ctx.user.isAdmin) {
					if (!if_block) {
						if_block = create_if_block_13();
						if_block.c();
						if_block.m(tr, text3);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.teams || changed.currentTeam || changed.user) {
					each_value = ctx.teams;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(tbody, null);
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
					detachNode(p);
					detachNode(text0);
					detachNode(table);
				}

				if (if_block) { if_block.d(); }

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (10:12) {#if user.isAdmin}
	function create_if_block_13(component, ctx) {
		var th, text_value = __('account / my-teams / id'), text;

		return {
			c: function create() {
				th = createElement("th");
				text = createText(text_value);
				addLoc(th, file$5, 10, 12, 262);
			},

			m: function mount(target, anchor) {
				insert(target, th, anchor);
				append(th, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(th);
				}
			}
		};
	}

	// (23:73) {:else}
	function create_else_block_3(component, ctx) {
		var a, text_value = truncate(ctx.team.name, 20, 10), text, a_href_value;

		return {
			c: function create() {
				a = createElement("a");
				text = createText(text_value);
				a.href = a_href_value = "/team/" + ctx.team.id + "/settings";
				addLoc(a, file$5, 22, 80, 784);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, text);
			},

			p: function update(changed, ctx) {
				if ((changed.teams) && text_value !== (text_value = truncate(ctx.team.name, 20, 10))) {
					setData(text, text_value);
				}

				if ((changed.teams) && a_href_value !== (a_href_value = "/team/" + ctx.team.id + "/settings")) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}
			}
		};
	}

	// (23:16) {#if team.role === 'member'}
	function create_if_block_12(component, ctx) {
		var text_value = truncate(ctx.team.name, 20, 10), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.teams) && text_value !== (text_value = truncate(ctx.team.name, 20, 10))) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (23:154) {#if team.id === currentTeam}
	function create_if_block_11(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-check-circle";
				addLoc(i, file$5, 23, 16, 904);
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

	// (27:12) {#if user.isAdmin}
	function create_if_block_10(component, ctx) {
		var td, text_value = ctx.team.id, text;

		return {
			c: function create() {
				td = createElement("td");
				text = createText(text_value);
				td.className = "slug svelte-t3x94h";
				addLoc(td, file$5, 27, 12, 1022);
			},

			m: function mount(target, anchor) {
				insert(target, td, anchor);
				append(td, text);
			},

			p: function update(changed, ctx) {
				if ((changed.teams) && text_value !== (text_value = ctx.team.id)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(td);
				}
			}
		};
	}

	// (33:60) {:else}
	function create_else_block_2$1(component, ctx) {
		var a, text0_value = ctx.team.members, text0, a_href_value, text1, if_block_anchor;

		var if_block = (ctx.team.invites) && create_if_block_9(component, ctx);

		return {
			c: function create() {
				a = createElement("a");
				text0 = createText(text0_value);
				text1 = createText(" ");
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
				a.href = a_href_value = "/team/" + ctx.team.id + "/settings#members";
				addLoc(a, file$5, 33, 16, 1299);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, text0);
				insert(target, text1, anchor);
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.teams) && text0_value !== (text0_value = ctx.team.members)) {
					setData(text0, text0_value);
				}

				if ((changed.teams) && a_href_value !== (a_href_value = "/team/" + ctx.team.id + "/settings#members")) {
					a.href = a_href_value;
				}

				if (ctx.team.invites) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_9(component, ctx);
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
					detachNode(a);
					detachNode(text1);
				}

				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (33:16) {#if team.role === 'member'}
	function create_if_block_8(component, ctx) {
		var text_value = ctx.team.members, text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.teams) && text_value !== (text_value = ctx.team.members)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (34:78) {#if team.invites}
	function create_if_block_9(component, ctx) {
		var span, text0, text1_value = ctx.team.invites, text1, text2;

		return {
			c: function create() {
				span = createElement("span");
				text0 = createText("(+");
				text1 = createText(text1_value);
				text2 = createText(")");
				span.className = "invites svelte-t3x94h";
				addLoc(span, file$5, 33, 96, 1379);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text0);
				append(span, text1);
				append(span, text2);
			},

			p: function update(changed, ctx) {
				if ((changed.teams) && text1_value !== (text1_value = ctx.team.invites)) {
					setData(text1, text1_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (39:16) {#if team.role !== 'owner'}
	function create_if_block_7(component, ctx) {
		var button, i, text0, text1_value = __('account / my-teams / leave-team'), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				i.className = "fa fa-sign-out";
				addLoc(i, file$5, 39, 57, 1590);
				button.className = "btn btn-small btn-danger";
				addLoc(button, file$5, 39, 16, 1549);
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
			}
		};
	}

	// (20:8) {#each teams as team}
	function create_each_block$2(component, ctx) {
		var tr, td0, text0, text1, text2, td1, raw_value = __('teams / role / '+ctx.team.role), text3, td2, a, text4_value = ctx.team.charts, text4, a_href_value, text5, td3, text6, td4;

		function select_block_type_1(ctx) {
			if (ctx.team.role === 'member') { return create_if_block_12; }
			return create_else_block_3;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block0 = current_block_type(component, ctx);

		var if_block1 = (ctx.team.id === ctx.currentTeam) && create_if_block_11();

		var if_block2 = (ctx.user.isAdmin) && create_if_block_10(component, ctx);

		function select_block_type_2(ctx) {
			if (ctx.team.role === 'member') { return create_if_block_8; }
			return create_else_block_2$1;
		}

		var current_block_type_1 = select_block_type_2(ctx);
		var if_block3 = current_block_type_1(component, ctx);

		var if_block4 = (ctx.team.role !== 'owner') && create_if_block_7();

		return {
			c: function create() {
				tr = createElement("tr");
				td0 = createElement("td");
				if_block0.c();
				text0 = createText(" ");
				if (if_block1) { if_block1.c(); }
				text1 = createText("\n            ");
				if (if_block2) { if_block2.c(); }
				text2 = createText("\n            ");
				td1 = createElement("td");
				text3 = createText("\n            ");
				td2 = createElement("td");
				a = createElement("a");
				text4 = createText(text4_value);
				text5 = createText("\n            ");
				td3 = createElement("td");
				if_block3.c();
				text6 = createText("\n\n            ");
				td4 = createElement("td");
				if (if_block4) { if_block4.c(); }
				addLoc(td0, file$5, 21, 12, 699);
				addLoc(td1, file$5, 29, 12, 1084);
				a.href = a_href_value = "/team/" + ctx.team.id;
				addLoc(a, file$5, 30, 16, 1149);
				addLoc(td2, file$5, 30, 12, 1145);
				addLoc(td3, file$5, 31, 12, 1210);
				addLoc(td4, file$5, 37, 12, 1484);
				toggleClass(tr, "current", ctx.team.id === ctx.currentTeam);
				addLoc(tr, file$5, 20, 8, 642);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				if_block0.m(td0, null);
				append(td0, text0);
				if (if_block1) { if_block1.m(td0, null); }
				append(tr, text1);
				if (if_block2) { if_block2.m(tr, null); }
				append(tr, text2);
				append(tr, td1);
				td1.innerHTML = raw_value;
				append(tr, text3);
				append(tr, td2);
				append(td2, a);
				append(a, text4);
				append(tr, text5);
				append(tr, td3);
				if_block3.m(td3, null);
				append(tr, text6);
				append(tr, td4);
				if (if_block4) { if_block4.m(td4, null); }
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(td0, text0);
				}

				if (ctx.team.id === ctx.currentTeam) {
					if (!if_block1) {
						if_block1 = create_if_block_11();
						if_block1.c();
						if_block1.m(td0, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.user.isAdmin) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_10(component, ctx);
						if_block2.c();
						if_block2.m(tr, text2);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if ((changed.teams) && raw_value !== (raw_value = __('teams / role / '+ctx.team.role))) {
					td1.innerHTML = raw_value;
				}

				if ((changed.teams) && text4_value !== (text4_value = ctx.team.charts)) {
					setData(text4, text4_value);
				}

				if ((changed.teams) && a_href_value !== (a_href_value = "/team/" + ctx.team.id)) {
					a.href = a_href_value;
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3.d(1);
					if_block3 = current_block_type_1(component, ctx);
					if_block3.c();
					if_block3.m(td3, null);
				}

				if (ctx.team.role !== 'owner') {
					if (!if_block4) {
						if_block4 = create_if_block_7();
						if_block4.c();
						if_block4.m(td4, null);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if ((changed.teams || changed.currentTeam)) {
					toggleClass(tr, "current", ctx.team.id === ctx.currentTeam);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(tr);
				}

				if_block0.d();
				if (if_block1) { if_block1.d(); }
				if (if_block2) { if_block2.d(); }
				if_block3.d();
				if (if_block4) { if_block4.d(); }
			}
		};
	}

	// (53:4) {#if user.isAdmin}
	function create_if_block_2$3(component, ctx) {
		var div, h3, raw_value = __('account / my-teams / create'), text;

		function select_block_type_3(ctx) {
			if (!ctx.createTeam) { return create_if_block_3$1; }
			return create_else_block$1;
		}

		var current_block_type = select_block_type_3(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				h3 = createElement("h3");
				text = createText("\n        ");
				if_block.c();
				h3.className = "svelte-t3x94h";
				addLoc(h3, file$5, 54, 8, 1906);
				div.className = "span5";
				addLoc(div, file$5, 53, 4, 1878);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h3);
				h3.innerHTML = raw_value;
				append(div, text);
				if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div, null);
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

	// (65:8) {:else}
	function create_else_block$1(component, ctx) {
		var p, raw_value = __('team-create / p'), text0, input, input_updating = false, text1, text2, button0, text3, text4_value = __('team-create / button'), text4, button0_disabled_value, text5, button1, text6_value = __('Return'), text6;

		function input_input_handler() {
			input_updating = true;
			component.set({ newTeamName: input.value });
			input_updating = false;
		}

		var formblock_initial_data = {
		 	label: __('team-create / name'),
		 	help: __('team-create / help')
		 };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		var if_block0 = (ctx.user.isAdmin) && create_if_block_5$1(component, ctx);

		function select_block_type_4(ctx) {
			if (ctx.awaitCreateTeam) { return create_if_block_4$1; }
			return create_else_block_1$1;
		}

		var current_block_type = select_block_type_4(ctx);
		var if_block1 = current_block_type(component, ctx);

		function click_handler(event) {
			component.createTeam(ctx.newTeamName, ctx.newTeamSlug);
		}

		function click_handler_1(event) {
			component.set({createTeam:false});
		}

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText("\n\n        ");
				input = createElement("input");
				formblock._fragment.c();
				text1 = createText("\n        ");
				if (if_block0) { if_block0.c(); }
				text2 = createText("\n\n        ");
				button0 = createElement("button");
				if_block1.c();
				text3 = createText("   ");
				text4 = createText(text4_value);
				text5 = createText("\n        ");
				button1 = createElement("button");
				text6 = createText(text6_value);
				addLoc(p, file$5, 65, 8, 2370);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.placeholder = __('team-create / untitled');
				addLoc(input, file$5, 70, 12, 2537);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-primary";
				button0.disabled = button0_disabled_value = !ctx.newTeamName.length;
				addLoc(button0, file$5, 78, 8, 2905);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn";
				addLoc(button1, file$5, 82, 8, 3302);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text0, anchor);
				append(formblock._slotted.default, input);

				input.value = ctx.newTeamName;

				formblock._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block0) { if_block0.m(target, anchor); }
				insert(target, text2, anchor);
				insert(target, button0, anchor);
				if_block1.m(button0, null);
				append(button0, text3);
				append(button0, text4);
				insert(target, text5, anchor);
				insert(target, button1, anchor);
				append(button1, text6);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input_updating && changed.newTeamName) { input.value = ctx.newTeamName; }

				if (ctx.user.isAdmin) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_5$1(component, ctx);
						if_block0.c();
						if_block0.m(text2.parentNode, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(button0, text3);
				}

				if ((changed.newTeamName) && button0_disabled_value !== (button0_disabled_value = !ctx.newTeamName.length)) {
					button0.disabled = button0_disabled_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
					detachNode(text0);
				}

				removeListener(input, "input", input_input_handler);
				formblock.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				if (if_block0) { if_block0.d(detach); }
				if (detach) {
					detachNode(text2);
					detachNode(button0);
				}

				if_block1.d();
				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text5);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (56:8) {#if !createTeam}
	function create_if_block_3$1(component, ctx) {
		var div, p, raw0_value = __('account / my-teams / why-teams'), text0, button, i, text1, raw1_value = __('account / my-teams / create-btn'), raw1_before;

		function click_handler(event) {
			component.set({createTeam:true});
		}

		return {
			c: function create() {
				div = createElement("div");
				p = createElement("p");
				text0 = createText("\n            ");
				button = createElement("button");
				i = createElement("i");
				text1 = createText(" ");
				raw1_before = createElement('noscript');
				addLoc(p, file$5, 57, 12, 2021);
				i.className = "fa fa-plus fa-fw";
				addLoc(i, file$5, 61, 16, 2230);
				addListener(button, "click", click_handler);
				button.className = "btn btn-large";
				toggleClass(button, "btn-primary", !ctx.teams.length);
				addLoc(button, file$5, 60, 12, 2115);
				div.className = "hed svelte-t3x94h";
				addLoc(div, file$5, 56, 8, 1991);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, p);
				p.innerHTML = raw0_value;
				append(div, text0);
				append(div, button);
				append(button, i);
				append(button, text1);
				append(button, raw1_before);
				raw1_before.insertAdjacentHTML("afterend", raw1_value);
			},

			p: function update(changed, ctx) {
				if (changed.teams) {
					toggleClass(button, "btn-primary", !ctx.teams.length);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (73:8) {#if user.isAdmin}
	function create_if_block_5$1(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ newTeamSlug: input.value });
			input_updating = false;
		}

		var formblock_initial_data = {
		 	label: __('team-create / slug'),
		 	help: __('team-create / slug-help')
		 };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		return {
			c: function create() {
				input = createElement("input");
				formblock._fragment.c();
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.placeholder = ctx.autoslug;
				addLoc(input, file$5, 74, 12, 2789);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, input);

				input.value = ctx.newTeamSlug;

				formblock._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.newTeamSlug) { input.value = ctx.newTeamSlug; }
				if (changed.autoslug) {
					input.placeholder = ctx.autoslug;
				}
			},

			d: function destroy(detach) {
				removeListener(input, "input", input_input_handler);
				formblock.destroy(detach);
			}
		};
	}

	// (81:29) {:else}
	function create_else_block_1$1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-plus fa-fw";
				addLoc(i, file$5, 80, 36, 3200);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (80:12) {#if awaitCreateTeam}
	function create_if_block_4$1(component, ctx) {
		var await_block_anchor, promise;

		var info = {
			component: component,
			ctx: ctx,
			current: null,
			pending: create_pending_block_1,
			then: create_then_block_1,
			catch: create_catch_block_1,
			value: 'null',
			error: 'null'
		};

		handlePromise(promise = ctx.awaitCreateTeam, info);

		return {
			c: function create() {
				await_block_anchor = createComment();

				info.block.c();
			},

			m: function mount(target, anchor) {
				insert(target, await_block_anchor, anchor);

				info.block.m(target, info.anchor = anchor);
				info.mount = function () { return await_block_anchor.parentNode; };
				info.anchor = await_block_anchor;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				info.ctx = ctx;

				('awaitCreateTeam' in changed) && promise !== (promise = ctx.awaitCreateTeam) && handlePromise(promise, info);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(await_block_anchor);
				}

				info.block.d(detach);
				info = null;
			}
		};
	}

	// (81:13) {:catch}
	function create_catch_block_1(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	// (80:103) {:then}
	function create_then_block_1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-check fa-fw";
				addLoc(i, file$5, 79, 110, 3131);
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

	// (80:58)  &nbsp;<i class="fa fa-spinner fa-spin"></i> {:then}
	function create_pending_block_1(component, ctx) {
		var text, i;

		return {
			c: function create() {
				text = createText(" ");
				i = createElement("i");
				i.className = "fa fa-spinner fa-spin";
				addLoc(i, file$5, 79, 65, 3086);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
				insert(target, i, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
					detachNode(i);
				}
			}
		};
	}

	// (86:10) {#if teams.length > 0}
	function create_if_block$5(component, ctx) {
		var div1, h3, raw0_value = __('account / my-teams / select-active'), text0, p, raw1_value = __('account / my-teams / what-is-active'), text1, div0, baseselect_updating = {}, text2;

		var baseselect_initial_data = { width: "250px", options: ctx.teamOptions };
		if (ctx.currentTeam !== void 0) {
			baseselect_initial_data.value = ctx.currentTeam;
			baseselect_updating.value = true;
		}
		var baseselect = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!baseselect_updating.value && changed.value) {
					newState.currentTeam = childState.value;
				}
				component._set(newState);
				baseselect_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			baseselect._bind({ value: 1 }, baseselect.get());
		});

		var if_block = (ctx.awaitActiveTeam) && create_if_block_1$5(component, ctx);

		var formblock_initial_data = { width: "350px", help: __('account / my-teams / active-hint') };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		return {
			c: function create() {
				div1 = createElement("div");
				h3 = createElement("h3");
				text0 = createText("\n        ");
				p = createElement("p");
				text1 = createText("\n        ");
				div0 = createElement("div");
				baseselect._fragment.c();
				text2 = createText("\n                ");
				if (if_block) { if_block.c(); }
				formblock._fragment.c();
				h3.className = "svelte-t3x94h";
				addLoc(h3, file$5, 87, 8, 3471);
				addLoc(p, file$5, 88, 8, 3537);
				div0.className = "flex";
				addLoc(div0, file$5, 90, 12, 3688);
				div1.className = "span5";
				addLoc(div1, file$5, 86, 4, 3443);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, h3);
				h3.innerHTML = raw0_value;
				append(div1, text0);
				append(div1, p);
				p.innerHTML = raw1_value;
				append(div1, text1);
				append(formblock._slotted.default, div0);
				baseselect._mount(div0, null);
				append(div0, text2);
				if (if_block) { if_block.m(div0, null); }
				formblock._mount(div1, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var baseselect_changes = {};
				if (changed.teamOptions) { baseselect_changes.options = ctx.teamOptions; }
				if (!baseselect_updating.value && changed.currentTeam) {
					baseselect_changes.value = ctx.currentTeam;
					baseselect_updating.value = ctx.currentTeam !== void 0;
				}
				baseselect._set(baseselect_changes);
				baseselect_updating = {};

				if (ctx.awaitActiveTeam) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$5(component, ctx);
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

				baseselect.destroy();
				if (if_block) { if_block.d(); }
				formblock.destroy();
			}
		};
	}

	// (94:16) {#if awaitActiveTeam}
	function create_if_block_1$5(component, ctx) {
		var await_block_anchor, promise;

		var info = {
			component: component,
			ctx: ctx,
			current: null,
			pending: create_pending_block,
			then: create_then_block,
			catch: create_catch_block,
			value: 'null',
			error: 'null'
		};

		handlePromise(promise = ctx.awaitActiveTeam, info);

		return {
			c: function create() {
				await_block_anchor = createComment();

				info.block.c();
			},

			m: function mount(target, anchor) {
				insert(target, await_block_anchor, anchor);

				info.block.m(target, info.anchor = anchor);
				info.mount = function () { return await_block_anchor.parentNode; };
				info.anchor = await_block_anchor;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				info.ctx = ctx;

				('awaitActiveTeam' in changed) && promise !== (promise = ctx.awaitActiveTeam) && handlePromise(promise, info);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(await_block_anchor);
				}

				info.block.d(detach);
				info = null;
			}
		};
	}

	// (95:24) {:catch}
	function create_catch_block(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	// (95:16) {:then}
	function create_then_block(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	// (94:62)  &nbsp;<i class="fa fa-spinner fa-spin"></i>                 {:then}
	function create_pending_block(component, ctx) {
		var text, i;

		return {
			c: function create() {
				text = createText(" ");
				i = createElement("i");
				i.className = "fa fa-spinner fa-spin";
				addLoc(i, file$5, 93, 69, 3911);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
				insert(target, i, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
					detachNode(i);
				}
			}
		};
	}

	function MyTeams(options) {
		var this$1 = this;

		this._debugName = '<MyTeams>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$5(), options.data);

		this._recompute({ teams: 1, newTeamName: 1 }, this._state);
		if (!('teams' in this._state)) { console.warn("<MyTeams> was created without expected data property 'teams'"); }
		if (!('newTeamName' in this._state)) { console.warn("<MyTeams> was created without expected data property 'newTeamName'"); }
		if (!('user' in this._state)) { console.warn("<MyTeams> was created without expected data property 'user'"); }
		if (!('currentTeam' in this._state)) { console.warn("<MyTeams> was created without expected data property 'currentTeam'"); }
		if (!('createTeam' in this._state)) { console.warn("<MyTeams> was created without expected data property 'createTeam'"); }

		if (!('newTeamSlug' in this._state)) { console.warn("<MyTeams> was created without expected data property 'newTeamSlug'"); }
		if (!('awaitCreateTeam' in this._state)) { console.warn("<MyTeams> was created without expected data property 'awaitCreateTeam'"); }

		if (!('awaitActiveTeam' in this._state)) { console.warn("<MyTeams> was created without expected data property 'awaitActiveTeam'"); }
		this._intro = true;

		this._handlers.state = [onstate$1];

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$5(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(MyTeams.prototype, protoDev);
	assign(MyTeams.prototype, methods$1);

	MyTeams.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('teamOptions' in newState && !this._updatingReadonlyProperty) { throw new Error("<MyTeams>: Cannot set read-only property 'teamOptions'"); }
		if ('autoslug' in newState && !this._updatingReadonlyProperty) { throw new Error("<MyTeams>: Cannot set read-only property 'autoslug'"); }
	};

	MyTeams.prototype._recompute = function _recompute(changed, state) {
		if (changed.teams) {
			if (this._differs(state.teamOptions, (state.teamOptions = teamOptions(state)))) { changed.teamOptions = true; }
		}

		if (changed.newTeamName) {
			if (this._differs(state.autoslug, (state.autoslug = autoslug(state)))) { changed.autoslug = true; }
		}
	};

	/* account/App.html generated by Svelte v2.16.1 */



	var EditProfileTab = {
	    title: __('account / profile'),
	    id: 'profile',
	    icon: 'im im-user-settings',
	    ui: EditProfile
	};

	var MyTeamsTab = {
	    title: __('account / my-teams'),
	    id: 'teams',
	    icon: 'im im-users',
	    ui: MyTeams
	};

	function data$6(ref) {
	    var email = ref.email;
	    var user = ref.user;
	    var userId = ref.userId;
	    var teams = ref.teams;
	    var currentTeam = ref.currentTeam;

	    return { user: user, email: email, userId: userId, teams: teams, currentTeam: currentTeam };
	}
	function data_1() {
	    return {
	        hash: 'profile',
	        activeTab: null,
	        activeData: {},
	        groups: [
	            {
	                title: __('account / settings / personal'),
	                tabs: [EditProfileTab]
	            }
	        ]
	    };
	}
	var methods$2 = {
	    activateTab: function activateTab(tab, event) {
	        var this$1 = this;
	        if ( event === void 0 ) event = null;

	        if (tab.module) {
	            if (event) { event.preventDefault(); }
	            Promise.all([loadStylesheet(tab.css), loadScript(tab.js)]).then(function () {
	                require([tab.module], function (mod) {
	                    tab.ui = mod.App;
	                    tab.module = null;
	                    var ref = this$1.get();
	                    var groups = ref.groups;
	                    this$1.set({
	                        groups: groups,
	                        activeTab: tab
	                    });
	                });
	            });
	            return;
	        }
	        if (tab.ui) {
	            if (event) { event.preventDefault(); }
	            if (tab.id === 'teams') {
	                var ref = this.get();
	                var teams = ref.teams;
	                var currentTeam = ref.currentTeam;
	                var user = ref.user;
	                tab.data = { teams: teams, currentTeam: currentTeam, user: user };
	            } else if (tab.id === 'profile') {
	                var ref$1 = this.get();
	                var email = ref$1.email;
	                var userId = ref$1.userId;
	                tab.data = { email: email, userId: userId };
	            }
	            this.set({ activeTab: tab });
	        }
	    }
	};

	function oncreate() {
	    var this$1 = this;

	    var path = window.location.pathname.split('/').slice(1);
	    var initialTab = path[1] || 'profile';

	    dw.backend.__svelteApps.account = this;

	    var ref = this.get();
	    var groups = ref.groups;
	    var teams = ref.teams;
	    var adminTeams = ref.adminTeams;
	    var pages = ref.pages;

	    if (pages.length) {
	        groups[0].tabs.push.apply(groups[0].tabs, pages);
	        this.set({ groups: groups });
	    }

	    if (teams.length) {
	        groups[0].tabs.splice(1, 0, MyTeamsTab);
	        this.set({ groups: groups });
	    }

	    if (adminTeams.length) {
	        groups.push({
	            title: __('account / settings / team'),
	            tabs: []
	        });
	        adminTeams.forEach(function (ref) {
	            var Id = ref.Id;
	            var Name = ref.Name;

	            groups[1].tabs.push({
	                title: truncate(Name, 10, 4),
	                url: ("/team/" + Id + "/settings"),
	                icon: 'im im-users'
	            });
	        });
	        this.set({ groups: groups });
	    }

	    var foundTab = false;
	    groups.forEach(function (group) {
	        group.tabs.forEach(function (tab) {
	            if (tab.id === initialTab) {
	                this$1.activateTab(tab);
	                foundTab = true;
	            }
	        });
	    });
	    if (!foundTab) {
	        this.set({
	            activeTab: EditProfileTab,
	            wasLookingFor: initialTab
	        });
	    }
	}
	function onstate$2(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.activeTab && current.activeTab) {
	        window.history.pushState({ id: current.activeTab.id }, '', ("/account/" + (current.activeTab.id)));
	    }
	}
	var file$6 = "account/App.html";

	function click_handler(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.activateTab(ctx.tab, event);
	}

	function get_each_context$3(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.tab = list[i];
		return child_ctx;
	}

	function get_each1_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.group = list[i];
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.team = list[i];
		return child_ctx;
	}

	function create_main_fragment$6(component, ctx) {
		var div2, h1, text0_value = __('account / settings'), text0, text1, text2, div1, div0, text3;

		var each0_value = ctx.invitations;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_2$1(component, get_each0_context(ctx, each0_value, i));
		}

		var each1_value = ctx.groups;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block$3(component, get_each1_context(ctx, each1_value, i));
		}

		var if_block = (ctx.activeTab) && create_if_block$6(component, ctx);

		return {
			c: function create() {
				div2 = createElement("div");
				h1 = createElement("h1");
				text0 = createText(text0_value);
				text1 = createText("\n    ");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text2 = createText("\n    ");
				div1 = createElement("div");
				div0 = createElement("div");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text3 = createText("\n        ");
				if (if_block) { if_block.c(); }
				h1.className = "title";
				addLoc(h1, file$6, 1, 4, 24);
				div0.className = "span2 svelte-1yvqupy";
				addLoc(div0, file$6, 8, 8, 387);
				div1.className = "row";
				addLoc(div1, file$6, 7, 4, 361);
				div2.className = "admin";
				addLoc(div2, file$6, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, h1);
				append(h1, text0);
				append(div2, text1);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(div2, null);
				}

				append(div2, text2);
				append(div2, div1);
				append(div1, div0);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(div0, null);
				}

				append(div1, text3);
				if (if_block) { if_block.m(div1, null); }
			},

			p: function update(changed, ctx) {
				if (changed.invitations) {
					each0_value = ctx.invitations;

					for (var i = 0; i < each0_value.length; i += 1) {
						var child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_2$1(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(div2, text2);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (changed.groups || changed.activeTab) {
					each1_value = ctx.groups;

					for (var i = 0; i < each1_value.length; i += 1) {
						var child_ctx$1 = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx$1);
						} else {
							each1_blocks[i] = create_each_block$3(component, child_ctx$1);
							each1_blocks[i].c();
							each1_blocks[i].m(div0, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				if (ctx.activeTab) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$6(component, ctx);
						if_block.c();
						if_block.m(div1, null);
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

				destroyEach(each0_blocks, detach);

				destroyEach(each1_blocks, detach);

				if (if_block) { if_block.d(); }
			}
		};
	}

	// (3:4) {#each invitations as team}
	function create_each_block_2$1(component, ctx) {
		var div, text0, b, text1_value = truncate(ctx.team.name, 20, 10), text1, text2, a, text3, a_href_value;

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText("You have been invited to join the team ");
				b = createElement("b");
				text1 = createText(text1_value);
				text2 = createText(". Click here to ");
				a = createElement("a");
				text3 = createText("accept the invitation");
				addLoc(b, file$6, 4, 47, 188);
				a.href = a_href_value = "/organization-invite/" + ctx.team.token;
				a.className = "btn btn-primary";
				addLoc(a, file$6, 4, 99, 240);
				div.className = "alert alert-info";
				addLoc(div, file$6, 3, 4, 110);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				append(div, b);
				append(b, text1);
				append(div, text2);
				append(div, a);
				append(a, text3);
			},

			p: function update(changed, ctx) {
				if ((changed.invitations) && text1_value !== (text1_value = truncate(ctx.team.name, 20, 10))) {
					setData(text1, text1_value);
				}

				if ((changed.invitations) && a_href_value !== (a_href_value = "/organization-invite/" + ctx.team.token)) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (14:16) {#each group.tabs as tab}
	function create_each_block_1$2(component, ctx) {
		var li, a, i, i_class_value, text0, text1_value = ctx.tab.title, text1, a_href_value;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i = createElement("i");
				text0 = createText("   ");
				text1 = createText(text1_value);
				i.className = i_class_value = "" + ctx.tab.icon + " svelte-1yvqupy";
				addLoc(i, file$6, 16, 25, 769);

				a._svelte = { component: component, ctx: ctx };

				addListener(a, "click", click_handler);
				a.href = a_href_value = ctx.tab.url || ("/account/" + (ctx.tab.id));
				a.className = "svelte-1yvqupy";
				addLoc(a, file$6, 15, 20, 663);
				li.className = "svelte-1yvqupy";
				toggleClass(li, "active", ctx.activeTab === ctx.tab);
				addLoc(li, file$6, 14, 16, 605);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				append(a, i);
				append(a, text0);
				append(a, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.groups) && i_class_value !== (i_class_value = "" + ctx.tab.icon + " svelte-1yvqupy")) {
					i.className = i_class_value;
				}

				if ((changed.groups) && text1_value !== (text1_value = ctx.tab.title)) {
					setData(text1, text1_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.groups) && a_href_value !== (a_href_value = ctx.tab.url || ("/account/" + (ctx.tab.id)))) {
					a.href = a_href_value;
				}

				if ((changed.activeTab || changed.groups)) {
					toggleClass(li, "active", ctx.activeTab === ctx.tab);
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

	// (10:12) {#each groups as group}
	function create_each_block$3(component, ctx) {
		var div, text0_value = ctx.group.title, text0, text1, ul;

		var each_value = ctx.group.tabs;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_1$2(component, get_each_context$3(ctx, each_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n\n            ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "group svelte-1yvqupy";
				addLoc(div, file$6, 10, 12, 455);
				ul.className = "nav nav-stacked nav-tabs";
				addLoc(ul, file$6, 12, 12, 509);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				insert(target, text1, anchor);
				insert(target, ul, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if ((changed.groups) && text0_value !== (text0_value = ctx.group.title)) {
					setData(text0, text0_value);
				}

				if (changed.activeTab || changed.groups) {
					each_value = ctx.group.tabs;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$2(component, child_ctx);
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
					detachNode(text1);
					detachNode(ul);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (24:8) {#if activeTab}
	function create_if_block$6(component, ctx) {
		var div, div_class_value;

		var switch_instance_spread_levels = [
			ctx.activeTab.data
		];

		var switch_value = ctx.activeTab.ui;

		function switch_props(ctx) {
			var switch_instance_initial_data = {};
			for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props());
		}

		return {
			c: function create() {
				div = createElement("div");
				if (switch_instance) { switch_instance._fragment.c(); }
				div.className = div_class_value = "span10 account-page-content tab-" + ctx.activeTab.id + " svelte-1yvqupy";
				addLoc(div, file$6, 24, 8, 975);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				if (switch_instance) {
					switch_instance._mount(div, null);
				}
			},

			p: function update(changed, ctx) {
				var switch_instance_changes = changed.activeTab ? getSpreadUpdate(switch_instance_spread_levels, [
					ctx.activeTab.data
				]) : {};

				if (switch_value !== (switch_value = ctx.activeTab.ui)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						switch_instance._fragment.c();
						switch_instance._mount(div, null);
					} else {
						switch_instance = null;
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}

				if ((changed.activeTab) && div_class_value !== (div_class_value = "span10 account-page-content tab-" + ctx.activeTab.id + " svelte-1yvqupy")) {
					div.className = div_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (switch_instance) { switch_instance.destroy(); }
			}
		};
	}

	function App(options) {
		var this$1 = this;

		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data_1(), options.data);

		this._recompute({ email: 1, user: 1, userId: 1, teams: 1, currentTeam: 1 }, this._state);
		if (!('email' in this._state)) { console.warn("<App> was created without expected data property 'email'"); }
		if (!('user' in this._state)) { console.warn("<App> was created without expected data property 'user'"); }
		if (!('userId' in this._state)) { console.warn("<App> was created without expected data property 'userId'"); }
		if (!('teams' in this._state)) { console.warn("<App> was created without expected data property 'teams'"); }
		if (!('currentTeam' in this._state)) { console.warn("<App> was created without expected data property 'currentTeam'"); }
		if (!('invitations' in this._state)) { console.warn("<App> was created without expected data property 'invitations'"); }
		if (!('groups' in this._state)) { console.warn("<App> was created without expected data property 'groups'"); }
		if (!('activeTab' in this._state)) { console.warn("<App> was created without expected data property 'activeTab'"); }
		this._intro = true;

		this._handlers.state = [onstate$2];

		onstate$2.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$6(this, this._state);

		this.root._oncreate.push(function () {
			oncreate.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$2);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('data' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'data'"); }
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.email || changed.user || changed.userId || changed.teams || changed.currentTeam) {
			if (this._differs(state.data, (state.data = data$6(state)))) { changed.data = true; }
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
		_add: function _add(component, props) {
			this._dependents.push({
				component: component,
				props: props
			});
		},

		_init: function _init(props) {
			var state = {};
			for (var i = 0; i < props.length; i += 1) {
				var prop = props[i];
				state['$' + prop] = this._state[prop];
			}
			return state;
		},

		_remove: function _remove(component) {
			var i = this._dependents.length;
			while (i--) {
				if (this._dependents[i].component === component) {
					this._dependents.splice(i, 1);
					return;
				}
			}
		},

		_set: function _set(newState, changed) {
			var this$1 = this;

			var previous = this._state;
			this._state = assign(assign({}, previous), newState);

			for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this._sortedComputedProperties[i].update(this._state, changed);
			}

			this.fire('state', {
				changed: changed,
				previous: previous,
				current: this._state
			});

			this._dependents
				.filter(function (dependent) {
					var componentState = {};
					var dirty = false;

					for (var j = 0; j < dependent.props.length; j += 1) {
						var prop = dependent.props[j];
						if (prop in changed) {
							componentState['$' + prop] = this$1._state[prop];
							dirty = true;
						}
					}

					if (dirty) {
						dependent.component._stage(componentState);
						return true;
					}
				})
				.forEach(function (dependent) {
					dependent.component.set({});
				});

			this.fire('update', {
				changed: changed,
				previous: previous,
				current: this._state
			});
		},

		_sortComputedProperties: function _sortComputedProperties() {
			var computed = this._computed;
			var sorted = this._sortedComputedProperties = [];
			var visited = blankObject();
			var currentKey;

			function visit(key) {
				var c = computed[key];

				if (c) {
					c.deps.forEach(function (dep) {
						if (dep === currentKey) {
							throw new Error(("Cyclical dependency detected between " + dep + " <-> " + key));
						}

						visit(dep);
					});

					if (!visited[key]) {
						visited[key] = true;
						sorted.push(c);
					}
				}
			}

			for (var key in this._computed) {
				visit(currentKey = key);
			}
		},

		compute: function compute(key, deps, fn) {
			var this$1 = this;

			var value;

			var c = {
				deps: deps,
				update: function (state, changed, dirty) {
					var values = deps.map(function (dep) {
						if (dep in changed) { dirty = true; }
						return state[dep];
					});

					if (dirty) {
						var newValue = fn.apply(null, values);
						if (this$1._differs(newValue, value)) {
							value = newValue;
							changed[key] = true;
							state[key] = value;
						}
					}
				}
			};

			this._computed[key] = c;
			this._sortComputedProperties();

			var state = assign({}, this._state);
			var changed = {};
			c.update(state, changed, true);
			this._set(state, changed);
		},

		fire: fire,

		get: get,

		on: on,

		set: function set(newState) {
			var oldState = this._state;
			var changed = this._changed = {};
			var dirty = false;

			for (var key in newState) {
				if (this._computed[key]) { throw new Error(("'" + key + "' is a read-only computed property")); }
				if (this._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
			}
			if (!dirty) { return; }

			this._set(newState, changed);
		}
	});

	var store = new Store({});

	var data$7 = {
	    chart: {
	        id: ''
	    },
	    readonly: false,
	    chartData: '',
	    transpose: false,
	    firstRowIsHeader: true,
	    skipRows: 0
	};

	var main = { App: App, data: data$7, store: store };

	return main;

}));
//# sourceMappingURL=account.js.map
