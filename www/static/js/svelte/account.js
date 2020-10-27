(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/account', factory) :
	(global = global || self, global.account = factory());
}(this, function () { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function isPromise(value) {
		return value && typeof value.then === 'function';
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

	function reinsertBefore(after, target) {
		var parent = after.parentNode;
		while (parent.firstChild !== after) target.appendChild(parent.firstChild);
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

	function handlePromise(promise, info) {
		var token = info.token = {};

		function update(type, index, key, value) {
			if (info.token !== token) return;

			info.resolved = key && { [key]: value };

			const child_ctx = assign(assign({}, info.ctx), info.resolved);
			const block = type && (info.current = type)(info.component, child_ctx);

			if (info.block) {
				if (info.blocks) {
					info.blocks.forEach((block, i) => {
						if (i !== index && block) {
							block.o(() => {
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
			if (info.blocks) info.blocks[index] = block;
		}

		if (isPromise(promise)) {
			promise.then(value => {
				update(info.then, 1, info.value, value);
			}, error => {
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

			info.resolved = { [info.value]: promise };
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
					if (!(key in n)) to_null_out[key] = 1;
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
			if (!(key in update)) update[key] = undefined;
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
	function truncate(str, start = 11, end = 7) {
	    if (typeof str !== 'string') return str;
	    if (str.length < start + end + 3) return str;
	    return str.substr(0, start).trim() + '…' + str.substr(str.length - end).trim();
	}

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

	/* home/david/Projects/core/libs/controls/v2/FormBlock.html generated by Svelte v2.16.1 */

	function data() {
	    return {
	        label: '',
	        help: '',
	        error: false,
	        success: false,
	        width: 'auto'
	    };
	}
	const file = "home/david/Projects/core/libs/controls/v2/FormBlock.html";

	function create_main_fragment(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, text2, text3;

		var if_block0 = (ctx.label) && create_if_block_3(component, ctx);

		var if_block1 = (ctx.success) && create_if_block_2(component, ctx);

		var if_block2 = (ctx.error) && create_if_block_1(component, ctx);

		var if_block3 = (!ctx.success && !ctx.error && ctx.help) && create_if_block(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n    ");
				div0 = createElement("div");
				text1 = createText("\n    ");
				if (if_block1) if_block1.c();
				text2 = createText(" ");
				if (if_block2) if_block2.c();
				text3 = createText(" ");
				if (if_block3) if_block3.c();
				div0.className = "form-controls svelte-1nkiaxn";
				addLoc(div0, file, 4, 4, 158);
				div1.className = "form-block svelte-1nkiaxn";
				setStyle(div1, "width", ctx.width);
				toggleClass(div1, "success", ctx.success);
				toggleClass(div1, "error", ctx.error);
				addLoc(div1, file, 0, 0, 0);
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
				append(div1, text2);
				if (if_block2) if_block2.m(div1, null);
				append(div1, text3);
				if (if_block3) if_block3.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (ctx.label) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3(component, ctx);
						if_block0.c();
						if_block0.m(div1, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.success) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2(component, ctx);
						if_block1.c();
						if_block1.m(div1, text2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.error) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_1(component, ctx);
						if_block2.c();
						if_block2.m(div1, text3);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (!ctx.success && !ctx.error && ctx.help) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block(component, ctx);
						if_block3.c();
						if_block3.m(div1, null);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (changed.width) {
					setStyle(div1, "width", ctx.width);
				}

				if (changed.success) {
					toggleClass(div1, "success", ctx.success);
				}

				if (changed.error) {
					toggleClass(div1, "error", ctx.error);
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
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
			}
		};
	}

	// (2:4) {#if label}
	function create_if_block_3(component, ctx) {
		var label;

		return {
			c: function create() {
				label = createElement("label");
				label.className = "control-label svelte-1nkiaxn";
				addLoc(label, file, 2, 4, 93);
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

	// (8:4) {#if success}
	function create_if_block_2(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help success svelte-1nkiaxn";
				addLoc(div, file, 8, 4, 236);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.success;
			},

			p: function update(changed, ctx) {
				if (changed.success) {
					div.innerHTML = ctx.success;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (10:10) {#if error}
	function create_if_block_1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help error svelte-1nkiaxn";
				addLoc(div, file, 10, 4, 310);
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

	// (12:10) {#if !success && !error && help}
	function create_if_block(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-1nkiaxn";
				addLoc(div, file, 12, 4, 401);
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
		if (!('width' in this._state)) console.warn("<FormBlock> was created without expected data property 'width'");
		if (!('label' in this._state)) console.warn("<FormBlock> was created without expected data property 'label'");
		if (!('success' in this._state)) console.warn("<FormBlock> was created without expected data property 'success'");
		if (!('error' in this._state)) console.warn("<FormBlock> was created without expected data property 'error'");
		if (!('help' in this._state)) console.warn("<FormBlock> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(FormBlock.prototype, protoDev);

	FormBlock.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* shared/CheckPassword.html generated by Svelte v2.16.1 */

	const MIN_CHARACTERS = 8;

	let zxcvbn;
	let zxcvbnLoading = false;

	function loadZxcvbn() {
	    zxcvbnLoading = true;
	    require(['zxcvbn'], pkg => {
	        zxcvbn = pkg;
	    });
	}

	function passwordTooShort({ password }) {
	    return password.length < MIN_CHARACTERS;
	}
	function passwordStrength({ password }) {
	    if (!zxcvbn) {
	        if (!zxcvbnLoading && password.length > 4) {
	            loadZxcvbn();
	        }
	        return false;
	    }
	    return zxcvbn(password);
	}
	function passwordHelp({ password, passwordStrength }) {
	    if (password === '' || !passwordStrength) {
	        return __('account / pwd-too-short').replace('%num', MIN_CHARACTERS);
	    }
	    const score = ['bad', 'weak', 'ok', 'good', 'excellent'][passwordStrength.score];
	    return __(`account / password / ${score}`);
	}
	function passwordError({ password, passwordTooShort, passwordStrength, passwordHelp }) {
	    if (!password) return false;
	    if (passwordTooShort)
	        return __('account / pwd-too-short').replace('%num', MIN_CHARACTERS);
	    if (passwordStrength && passwordStrength.score < 2) return passwordHelp;
	    return false;
	}
	function passwordSuccess({ passwordStrength, passwordHelp }) {
	    return passwordStrength && passwordStrength.score > 2 ? passwordHelp : false;
	}
	function passwordOk({ password, passwordTooShort }) {
	    return password && !passwordTooShort;
	}
	function data$1() {
		return {
	    password: ''
	};
	}

	function create_main_fragment$1(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.password.length>=MIN_CHARACTERS) && create_if_block$1();

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
				if (ctx.password.length>=MIN_CHARACTERS) {
					if (!if_block) {
						if_block = create_if_block$1();
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

	// (1:0) {#if password.length>=MIN_CHARACTERS}
	function create_if_block$1(component, ctx) {

		return {
			c: noop,

			m: noop,

			d: noop
		};
	}

	function CheckPassword(options) {
		this._debugName = '<CheckPassword>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);

		this._recompute({ password: 1, passwordStrength: 1, passwordTooShort: 1, passwordHelp: 1 }, this._state);
		if (!('password' in this._state)) console.warn("<CheckPassword> was created without expected data property 'password'");
		this._intro = true;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(CheckPassword.prototype, protoDev);

	CheckPassword.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('passwordTooShort' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordTooShort'");
		if ('passwordStrength' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordStrength'");
		if ('passwordHelp' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordHelp'");
		if ('passwordError' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordError'");
		if ('passwordSuccess' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordSuccess'");
		if ('passwordOk' in newState && !this._updatingReadonlyProperty) throw new Error("<CheckPassword>: Cannot set read-only property 'passwordOk'");
	};

	CheckPassword.prototype._recompute = function _recompute(changed, state) {
		if (changed.password) {
			if (this._differs(state.passwordTooShort, (state.passwordTooShort = passwordTooShort(state)))) changed.passwordTooShort = true;
			if (this._differs(state.passwordStrength, (state.passwordStrength = passwordStrength(state)))) changed.passwordStrength = true;
		}

		if (changed.password || changed.passwordStrength) {
			if (this._differs(state.passwordHelp, (state.passwordHelp = passwordHelp(state)))) changed.passwordHelp = true;
		}

		if (changed.password || changed.passwordTooShort || changed.passwordStrength || changed.passwordHelp) {
			if (this._differs(state.passwordError, (state.passwordError = passwordError(state)))) changed.passwordError = true;
		}

		if (changed.passwordStrength || changed.passwordHelp) {
			if (this._differs(state.passwordSuccess, (state.passwordSuccess = passwordSuccess(state)))) changed.passwordSuccess = true;
		}

		if (changed.password || changed.passwordTooShort) {
			if (this._differs(state.passwordOk, (state.passwordOk = passwordOk(state)))) changed.passwordOk = true;
		}
	};

	/* account/EditProfile.html generated by Svelte v2.16.1 */



	function data$2() {
	    return {
	        changePassword: false,
	        changeEmail: false,
	        deleteAccount: false,
	        deleteAccount2: false,
	        deleteAccount3: false,
	        deletingAccount: false,
	        showPasswordInPlaintext: false,
	        messages: [],
	        currentPassword: '',
	        newPassword: '',
	        newPasswordOk: false,
	        passwordError: false,
	        passwordHelp: false,
	        passwordSuccess: false,
	        confirmEmail: '',
	        confirmPassword: '',
	        email: '',
	        savingEmail: false,
	        savingPassword: false,
	        showPasswordAsClearText: false,
	        errors: [],
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
	    async changeEmail() {
	        var { email } = this.get();

	        this.set({ savingEmail: true });

	        const messages = [];
	        const errors = [];

	        try {
	            const res = await httpReq.patch('/v3/me', {
	                payload: { email }
	            });
	            messages.push(
	                'Your email has been changed successfully. You will receive an email with a confirmation link.'
	            );
	            // for now, let's set it back to the previous email
	            this.set({ email: res.email });
	        } catch (e) {
	            if (e.name === 'HttpReqError') {
	                const res = await e.response.json();
	                if (res.message === 'Invalid request payload input') {
	                    errors.push(__('account / change-email / error / invalid-email'));
	                } else {
	                    errors.push(
	                        res.message
	                            ? __(`account / change-email / error / ${res.message}`)
	                            : e.message
	                    );
	                }
	            } else {
	                errors.push('Unknown error: ' + e);
	            }
	        }

	        this.set({ savingEmail: false });

	        if (!errors.length) {
	            this.set({
	                changeEmail: false,
	                messages,
	                errors: []
	            });
	        } else {
	            this.set({ errors });
	        }
	    },
	    async changePassword() {
	        const { currentPassword, newPassword } = this.get();

	        this.set({ savingPassword: true });

	        const payload = {
	            password: newPassword,
	            oldPassword: currentPassword
	        };

	        const messages = [];
	        const errors = [];

	        try {
	            await httpReq.patch('/v3/me', { payload });
	            messages.push('Your password has been changed!');
	        } catch (e) {
	            if (e.name === 'HttpReqError') {
	                const res = await e.response.json();
	                errors.push(res.message || e.message);
	            } else {
	                errors.push('Unknown error: ' + e);
	            }
	        }

	        if (errors.length === 0) {
	            this.set({
	                changePassword: false,
	                currentPassword: '',
	                newPassword: '',
	                messages,
	                errors: []
	            });
	        } else {
	            this.set({
	                errors
	            });
	        }
	        this.set({
	            savingPassword: false
	        });
	    },
	    async deleteAccount() {
	        const { confirmPassword, confirmEmail } = this.get();

	        this.set({ deletingAccount: true });

	        const errors = [];

	        try {
	            await httpReq.delete('/v3/me', {
	                payload: {
	                    password: confirmPassword,
	                    email: confirmEmail
	                }
	            });
	        } catch (e) {
	            if (e.name === 'HttpReqError') {
	                const res = await e.response.json();

	                if (res.message === 'delete-or-transfer-teams-first') {
	                    errors.push(__('account / delete / team-conflict'));
	                } else {
	                    errors.push(res.message || e.message);
	                }
	            } else {
	                errors.push('Unknown error: ' + e);
	            }
	        }

	        this.set({ deletingAccount: false });

	        if (!errors.length) {
	            this.set({ deleteAccount2: false, deleteAccount3: true });
	        } else {
	            this.set({ errors });
	        }
	    }
	};

	const file$1 = "account/EditProfile.html";

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function create_main_fragment$2(component, ctx) {
		var h2, text0_value = __("Edit profile"), text0, text1, text2, div2, div0, text3, input, input_updating = false, input_disabled_value, text4, if_block2_anchor, text5, text6, text7, div1, p, text8_value = __("account / change-login"), text8;

		var if_block0 = (ctx.messages && ctx.messages.length) && create_if_block_8(component, ctx);

		var if_block1 = (ctx.changeEmail && ctx.errors.length) && create_if_block_7(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ email: input.value });
			input_updating = false;
		}

		function select_block_type(ctx) {
			if (ctx.changeEmail) return create_if_block_6;
			return create_else_block_3;
		}

		var current_block_type = select_block_type(ctx);
		var if_block2 = current_block_type(component, ctx);

		var formblock_initial_data = { label: __('E-Mail'), help: ctx.changeEmail ? __('account / confirm-email-change') : '' };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		function select_block_type_1(ctx) {
			if (!ctx.changePassword) return create_if_block_3$1;
			return create_else_block_1;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block3 = current_block_type_1(component, ctx);

		function select_block_type_3(ctx) {
			if (ctx.deleteAccount3) return create_if_block$2;
			if (ctx.deleteAccount2) return create_if_block_1$1;
			if (ctx.deleteAccount) return create_if_block_2$1;
			return create_else_block;
		}

		var current_block_type_2 = select_block_type_3(ctx);
		var if_block4 = current_block_type_2(component, ctx);

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n\n");
				if (if_block0) if_block0.c();
				text2 = createText("\n\n");
				div2 = createElement("div");
				div0 = createElement("div");
				if (if_block1) if_block1.c();
				text3 = createText("\n        ");
				input = createElement("input");
				text4 = createText("\n            ");
				if_block2.c();
				if_block2_anchor = createComment();
				formblock._fragment.c();
				text5 = createText("\n\n        ");
				if_block3.c();
				text6 = createText(" ");
				if_block4.c();
				text7 = createText("\n    ");
				div1 = createElement("div");
				p = createElement("p");
				text8 = createText(text8_value);
				addLoc(h2, file$1, 0, 0, 0);
				addListener(input, "input", input_input_handler);
				input.disabled = input_disabled_value = !ctx.changeEmail;
				setAttribute(input, "type", "email");
				addLoc(input, file$1, 25, 12, 738);
				div0.className = "span6";
				addLoc(div0, file$1, 15, 4, 413);
				p.className = "help";
				addLoc(p, file$1, 184, 8, 6987);
				div1.className = "span4";
				addLoc(div1, file$1, 183, 4, 6959);
				div2.className = "row edit-account";
				setStyle(div2, "margin-top", "" + (ctx.messages && ctx.messages.length ? 0 : 20) + "px");
				addLoc(div2, file$1, 14, 0, 314);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				append(h2, text0);
				insert(target, text1, anchor);
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text2, anchor);
				insert(target, div2, anchor);
				append(div2, div0);
				if (if_block1) if_block1.m(div0, null);
				append(div0, text3);
				append(formblock._slotted.default, input);

				input.value = ctx.email;

				append(formblock._slotted.default, text4);
				if_block2.m(formblock._slotted.default, null);
				append(formblock._slotted.default, if_block2_anchor);
				formblock._mount(div0, null);
				append(div0, text5);
				if_block3.m(div0, null);
				append(div0, text6);
				if_block4.m(div0, null);
				append(div2, text7);
				append(div2, div1);
				append(div1, p);
				append(p, text8);
			},

			p: function update(changed, ctx) {
				if (ctx.messages && ctx.messages.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_8(component, ctx);
						if_block0.c();
						if_block0.m(text2.parentNode, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.changeEmail && ctx.errors.length) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_7(component, ctx);
						if_block1.c();
						if_block1.m(div0, text3);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!input_updating && changed.email) input.value = ctx.email;
				if ((changed.changeEmail) && input_disabled_value !== (input_disabled_value = !ctx.changeEmail)) {
					input.disabled = input_disabled_value;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type(component, ctx);
					if_block2.c();
					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
				}

				var formblock_changes = {};
				if (changed.changeEmail) formblock_changes.help = ctx.changeEmail ? __('account / confirm-email-change') : '';
				formblock._set(formblock_changes);

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3.d(1);
					if_block3 = current_block_type_1(component, ctx);
					if_block3.c();
					if_block3.m(div0, text6);
				}

				if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx)) && if_block4) {
					if_block4.p(changed, ctx);
				} else {
					if_block4.d(1);
					if_block4 = current_block_type_2(component, ctx);
					if_block4.c();
					if_block4.m(div0, null);
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

				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text2);
					detachNode(div2);
				}

				if (if_block1) if_block1.d();
				removeListener(input, "input", input_input_handler);
				if_block2.d();
				formblock.destroy();
				if_block3.d();
				if_block4.d();
			}
		};
	}

	// (3:0) {#if messages && messages.length }
	function create_if_block_8(component, ctx) {
		var div2, div1, div0;

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

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div0.className = "alert alert-success svelte-1uqq9ww";
				addLoc(div0, file$1, 5, 8, 144);
				div1.className = "span6";
				addLoc(div1, file$1, 4, 4, 116);
				div2.className = "row";
				setStyle(div2, "margin-top", "20px");
				addLoc(div2, file$1, 3, 0, 68);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, div0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.messages) {
					each_value = ctx.messages;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div0, null);
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

	// (7:12) {#each messages as message}
	function create_each_block_1(component, ctx) {
		var p, raw_value = ctx.message;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "svelte-1uqq9ww";
				addLoc(p, file$1, 7, 12, 230);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.messages) && raw_value !== (raw_value = ctx.message)) {
					p.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (17:8) {#if changeEmail && errors.length}
	function create_if_block_7(component, ctx) {
		var div, raw_value = ctx.errors.join('');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-warning";
				addLoc(div, file$1, 17, 8, 484);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && raw_value !== (raw_value = ctx.errors.join(''))) {
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

	// (35:12) {:else}
	function create_else_block_3(component, ctx) {
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
				addLoc(button, file$1, 35, 12, 1243);
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

	// (27:12) {#if changeEmail}
	function create_if_block_6(component, ctx) {
		var button0, text0_value = __( "Back"), text0, text1, button1, i, i_class_value, text2, text3_value = __(
	                "account / email"), text3;

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
				addLoc(button0, file$1, 27, 12, 850);
				i.className = i_class_value = "fa " + (ctx.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww";
				addLoc(i, file$1, 31, 16, 1069);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-save btn-primary";
				addLoc(button1, file$1, 30, 12, 986);
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
				if ((changed.savingEmail) && i_class_value !== (i_class_value = "fa " + (ctx.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww")) {
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

	// (49:8) {:else}
	function create_else_block_1(component, ctx) {
		var h3, text0_value = __("account / password"), text0, text1, button0, text2_value = __("Back"), text2, text3, text4, input0, input0_updating = false, text5, text6, div0, checkpassword_updating = {}, text7, div1, label, input1, text8, raw_value = __("account / invite / password-clear-text"), raw_before, text9, button1, i, i_class_value, text10, text11_value = __("account / password"), text11, button1_disabled_value, text12, hr;

		function click_handler(event) {
			component.set({changePassword: false});
		}

		var if_block0 = (ctx.changePassword && ctx.errors && ctx.errors.length) && create_if_block_5(component, ctx);

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

		function select_block_type_2(ctx) {
			if (ctx.showPasswordAsClearText) return create_if_block_4;
			return create_else_block_2;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block1 = current_block_type(component, ctx);

		var checkpassword_initial_data = {};
		if (ctx.newPassword !== void 0) {
			checkpassword_initial_data.password = ctx.newPassword;
			checkpassword_updating.password = true;
		}
		if (ctx.passwordHelp
	                     !== void 0) {
			checkpassword_initial_data.passwordHelp = ctx.passwordHelp
	                    ;
			checkpassword_updating.passwordHelp = true;
		}
		if (ctx.passwordSuccess
	                     !== void 0) {
			checkpassword_initial_data.passwordSuccess = ctx.passwordSuccess
	                    ;
			checkpassword_updating.passwordSuccess = true;
		}
		if (ctx.passwordError
	                     !== void 0) {
			checkpassword_initial_data.passwordError = ctx.passwordError
	                    ;
			checkpassword_updating.passwordError = true;
		}
		if (ctx.newPasswordOk !== void 0) {
			checkpassword_initial_data.passwordOk = ctx.newPasswordOk;
			checkpassword_updating.passwordOk = true;
		}
		var checkpassword = new CheckPassword({
			root: component.root,
			store: component.store,
			data: checkpassword_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkpassword_updating.password && changed.password) {
					newState.newPassword = childState.password;
				}

				if (!checkpassword_updating.passwordHelp && changed.passwordHelp) {
					newState.passwordHelp = childState.passwordHelp;
				}

				if (!checkpassword_updating.passwordSuccess && changed.passwordSuccess) {
					newState.passwordSuccess = childState.passwordSuccess;
				}

				if (!checkpassword_updating.passwordError && changed.passwordError) {
					newState.passwordError = childState.passwordError;
				}

				if (!checkpassword_updating.passwordOk && changed.passwordOk) {
					newState.newPasswordOk = childState.passwordOk;
				}
				component._set(newState);
				checkpassword_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkpassword._bind({ password: 1, passwordHelp: 1, passwordSuccess: 1, passwordError: 1, passwordOk: 1 }, checkpassword.get());
		});

		var formblock1_initial_data = {
		 	error: ctx.passwordError,
		 	label: __('New Password'),
		 	success: ctx.passwordSuccess,
		 	help: ctx.passwordHelp
		 };
		var formblock1 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock1_initial_data
		});

		function input1_change_handler() {
			component.set({ showPasswordAsClearText: input1.checked });
		}

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
				if (if_block0) if_block0.c();
				text4 = createText("\n        ");
				input0 = createElement("input");
				formblock0._fragment.c();
				text5 = createText("\n\n        ");
				if_block1.c();
				text6 = createText("\n            ");
				div0 = createElement("div");
				checkpassword._fragment.c();
				formblock1._fragment.c();
				text7 = createText("\n        ");
				div1 = createElement("div");
				label = createElement("label");
				input1 = createElement("input");
				text8 = createText("\n                ");
				raw_before = createElement('noscript');
				text9 = createText("\n\n        ");
				button1 = createElement("button");
				i = createElement("i");
				text10 = createText("  ");
				text11 = createText(text11_value);
				text12 = createText("\n        ");
				hr = createElement("hr");
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-save btn-default btn-back";
				addLoc(button0, file$1, 51, 12, 1838);
				addLoc(h3, file$1, 49, 8, 1780);
				addListener(input0, "input", input0_input_handler);
				setAttribute(input0, "type", "password");
				input0.className = "input-xlarge";
				addLoc(input0, file$1, 69, 12, 2409);
				setStyle(div0, "width", "287px");
				addLoc(div0, file$1, 88, 12, 3063);
				addListener(input1, "change", input1_change_handler);
				setAttribute(input1, "type", "checkbox");
				addLoc(input1, file$1, 100, 16, 3536);
				label.className = "checkbox";
				addLoc(label, file$1, 99, 12, 3495);
				div1.className = "control-group";
				setStyle(div1, "margin-top", "-10px");
				setStyle(div1, "margin-bottom", "20px");
				addLoc(div1, file$1, 98, 8, 3407);
				i.className = i_class_value = "fa " + (ctx.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww";
				addLoc(i, file$1, 110, 12, 3884);
				addListener(button1, "click", click_handler_1);
				button1.disabled = button1_disabled_value = !(ctx.newPasswordOk && ctx.currentPassword);
				button1.className = "btn btn-primary";
				addLoc(button1, file$1, 105, 8, 3715);
				addLoc(hr, file$1, 113, 8, 4031);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				append(h3, text0);
				append(h3, text1);
				append(h3, button0);
				append(button0, text2);
				insert(target, text3, anchor);
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text4, anchor);
				append(formblock0._slotted.default, input0);

				input0.value = ctx.currentPassword;

				formblock0._mount(target, anchor);
				insert(target, text5, anchor);
				if_block1.m(formblock1._slotted.default, null);
				append(formblock1._slotted.default, text6);
				append(formblock1._slotted.default, div0);
				checkpassword._mount(div0, null);
				formblock1._mount(target, anchor);
				insert(target, text7, anchor);
				insert(target, div1, anchor);
				append(div1, label);
				append(label, input1);

				input1.checked = ctx.showPasswordAsClearText;

				append(label, text8);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, text9, anchor);
				insert(target, button1, anchor);
				append(button1, i);
				append(button1, text10);
				append(button1, text11);
				insert(target, text12, anchor);
				insert(target, hr, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.changePassword && ctx.errors && ctx.errors.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_5(component, ctx);
						if_block0.c();
						if_block0.m(text4.parentNode, text4);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!input0_updating && changed.currentPassword) input0.value = ctx.currentPassword;

				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(text6.parentNode, text6);
				}

				var checkpassword_changes = {};
				if (!checkpassword_updating.password && changed.newPassword) {
					checkpassword_changes.password = ctx.newPassword;
					checkpassword_updating.password = ctx.newPassword !== void 0;
				}
				if (!checkpassword_updating.passwordHelp && changed.passwordHelp) {
					checkpassword_changes.passwordHelp = ctx.passwordHelp
	                    ;
					checkpassword_updating.passwordHelp = ctx.passwordHelp
	                     !== void 0;
				}
				if (!checkpassword_updating.passwordSuccess && changed.passwordSuccess) {
					checkpassword_changes.passwordSuccess = ctx.passwordSuccess
	                    ;
					checkpassword_updating.passwordSuccess = ctx.passwordSuccess
	                     !== void 0;
				}
				if (!checkpassword_updating.passwordError && changed.passwordError) {
					checkpassword_changes.passwordError = ctx.passwordError
	                    ;
					checkpassword_updating.passwordError = ctx.passwordError
	                     !== void 0;
				}
				if (!checkpassword_updating.passwordOk && changed.newPasswordOk) {
					checkpassword_changes.passwordOk = ctx.newPasswordOk;
					checkpassword_updating.passwordOk = ctx.newPasswordOk !== void 0;
				}
				checkpassword._set(checkpassword_changes);
				checkpassword_updating = {};

				var formblock1_changes = {};
				if (changed.passwordError) formblock1_changes.error = ctx.passwordError;
				if (changed.passwordSuccess) formblock1_changes.success = ctx.passwordSuccess;
				if (changed.passwordHelp) formblock1_changes.help = ctx.passwordHelp;
				formblock1._set(formblock1_changes);

				if (changed.showPasswordAsClearText) input1.checked = ctx.showPasswordAsClearText;
				if ((changed.savingPassword) && i_class_value !== (i_class_value = "fa " + (ctx.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww")) {
					i.className = i_class_value;
				}

				if ((changed.newPasswordOk || changed.currentPassword) && button1_disabled_value !== (button1_disabled_value = !(ctx.newPasswordOk && ctx.currentPassword))) {
					button1.disabled = button1_disabled_value;
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

				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text4);
				}

				removeListener(input0, "input", input0_input_handler);
				formblock0.destroy(detach);
				if (detach) {
					detachNode(text5);
				}

				if_block1.d();
				checkpassword.destroy();
				formblock1.destroy(detach);
				if (detach) {
					detachNode(text7);
					detachNode(div1);
				}

				removeListener(input1, "change", input1_change_handler);
				if (detach) {
					detachNode(text9);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_1);
				if (detach) {
					detachNode(text12);
					detachNode(hr);
				}
			}
		};
	}

	// (42:8) {#if !changePassword}
	function create_if_block_3$1(component, ctx) {
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
				addLoc(input, file$1, 43, 12, 1523);
				addListener(button, "click", click_handler);
				button.className = "btn btn-save btn-default";
				addLoc(button, file$1, 44, 12, 1587);
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

	// (59:8) {#if changePassword && errors && errors.length }
	function create_if_block_5(component, ctx) {
		var div;

		var each_value_1 = ctx.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "alert svelte-1uqq9ww";
				addLoc(div, file$1, 59, 8, 2106);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.errors) {
					each_value_1 = ctx.errors;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
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

	// (61:12) {#each errors as message}
	function create_each_block(component, ctx) {
		var p, raw_value = ctx.message;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "svelte-1uqq9ww";
				addLoc(p, file$1, 61, 12, 2176);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && raw_value !== (raw_value = ctx.message)) {
					p.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (81:12) {:else}
	function create_else_block_2(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ newPassword: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				input.dataset.lpignore = "true";
				setAttribute(input, "type", "password");
				input.className = "input-xlarge";
				addLoc(input, file$1, 81, 12, 2864);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.newPassword;
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.newPassword) input.value = ctx.newPassword;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (79:12) {#if showPasswordAsClearText}
	function create_if_block_4(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ newPassword: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				input.dataset.lpignore = "true";
				setAttribute(input, "type", "text");
				input.className = "input-xlarge";
				addLoc(input, file$1, 79, 12, 2743);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.newPassword;
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.newPassword) input.value = ctx.newPassword;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (176:8) {:else}
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
				addLoc(button, file$1, 177, 12, 6765);
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

	// (161:31) 
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
				text3 = createText("\n              ");
				text4 = createText(text4_value);
				text5 = createText("\n\n        ");
				text6 = createText(text6_value);
				text7 = createText("\n\n        ");
				button1 = createElement("button");
				i2 = createElement("i");
				text8 = createText("   ");
				text9 = createText(text9_value);
				i0.className = "fa fa-times svelte-1uqq9ww";
				addLoc(i0, file$1, 161, 12, 6101);
				h3.className = "svelte-1uqq9ww";
				addLoc(h3, file$1, 161, 8, 6097);
				i1.className = "fa fa-chevron-left";
				addLoc(i1, file$1, 163, 12, 6280);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-back btn-primary";
				addLoc(button0, file$1, 162, 8, 6187);
				i2.className = "fa fa-times";
				addLoc(i2, file$1, 173, 12, 6582);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-default";
				addLoc(button1, file$1, 169, 8, 6443);
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

	// (122:32) 
	function create_if_block_1$1(component, ctx) {
		var h2, text0_value = __("account / delete / hed"), text0, text1, div1, p0, text2_value = __("account / delete / really"), text2, text3, ul, li0, text4_value = __("account / confirm-account-deletion / free"), text4, text5, li1, text6_value = __("You cannot login and logout anymore."), text6, text7, li2, text8_value = __("You cannot edit or remove your charts anymore."), text8, text9, p1, text10_value = __("account / delete / charts-stay-online"), text10, text11, input0, input0_updating = false, text12, input1, input1_updating = false, text13, p2, raw_value = __("account / delete / really-really"), text14, div0, button0, i0, text15, text16_value = __("No, I changed my mind.."), text16, text17, button1, i1, i1_class_value, text18, text19_value = __("Yes, delete it!"), text19;

		function input0_input_handler() {
			input0_updating = true;
			component.set({ confirmEmail: input0.value });
			input0_updating = false;
		}

		function input1_input_handler() {
			input1_updating = true;
			component.set({ confirmPassword: input1.value });
			input1_updating = false;
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
				input0 = createElement("input");
				text12 = createText("\n                ");
				input1 = createElement("input");
				formblock._fragment.c();
				text13 = createText("\n            ");
				p2 = createElement("p");
				text14 = createText("\n            ");
				div0 = createElement("div");
				button0 = createElement("button");
				i0 = createElement("i");
				text15 = createText("  ");
				text16 = createText(text16_value);
				text17 = createText("\n                ");
				button1 = createElement("button");
				i1 = createElement("i");
				text18 = createText(" \n                    ");
				text19 = createText(text19_value);
				setStyle(h2, "margin-bottom", "20px");
				addLoc(h2, file$1, 122, 8, 4351);
				addLoc(p0, file$1, 124, 12, 4471);
				addLoc(li0, file$1, 128, 16, 4577);
				addLoc(li1, file$1, 129, 16, 4654);
				addLoc(li2, file$1, 130, 16, 4726);
				addLoc(ul, file$1, 127, 12, 4556);
				addLoc(p1, file$1, 132, 12, 4822);
				addListener(input0, "input", input0_input_handler);
				setAttribute(input0, "type", "email");
				input0.placeholder = __('E-Mail');
				addLoc(input0, file$1, 140, 16, 5133);
				addListener(input1, "input", input1_input_handler);
				setAttribute(input1, "type", "password");
				input1.placeholder = __('Password');
				addLoc(input1, file$1, 141, 16, 5229);
				p2.className = "lead";
				addLoc(p2, file$1, 147, 12, 5430);
				i0.className = "fa fa-chevron-left";
				addLoc(i0, file$1, 152, 20, 5674);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-info";
				addLoc(button0, file$1, 151, 16, 5584);
				i1.className = i1_class_value = "fa " + (ctx.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww";
				addLoc(i1, file$1, 155, 20, 5870);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-danger";
				addLoc(button1, file$1, 154, 16, 5791);
				div0.className = "control-group";
				addLoc(div0, file$1, 150, 12, 5540);
				div1.className = "delete-account";
				addLoc(div1, file$1, 123, 8, 4430);
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
				append(formblock._slotted.default, input0);

				input0.value = ctx.confirmEmail;

				append(formblock._slotted.default, text12);
				append(formblock._slotted.default, input1);

				input1.value = ctx.confirmPassword;

				formblock._mount(div1, null);
				append(div1, text13);
				append(div1, p2);
				p2.innerHTML = raw_value;
				append(div1, text14);
				append(div1, div0);
				append(div0, button0);
				append(button0, i0);
				append(button0, text15);
				append(button0, text16);
				append(div0, text17);
				append(div0, button1);
				append(button1, i1);
				append(button1, text18);
				append(button1, text19);
			},

			p: function update(changed, ctx) {
				if (!input0_updating && changed.confirmEmail) input0.value = ctx.confirmEmail;
				if (!input1_updating && changed.confirmPassword) input1.value = ctx.confirmPassword;

				var formblock_changes = {};
				if (changed.errors) formblock_changes.error = ctx.errors && ctx.errors.length ? ctx.errors.join('. ') : false;
				formblock._set(formblock_changes);

				if ((changed.deletingAccount) && i1_class_value !== (i1_class_value = "fa " + (ctx.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1uqq9ww")) {
					i1.className = i1_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text1);
					detachNode(div1);
				}

				removeListener(input0, "input", input0_input_handler);
				removeListener(input1, "input", input1_input_handler);
				formblock.destroy();
				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (115:14) {#if deleteAccount3}
	function create_if_block$2(component, ctx) {
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
				addLoc(h2, file$1, 115, 8, 4081);
				addLoc(h3, file$1, 116, 8, 4160);
				a.href = "/";
				a.className = "btn btn-primary btn-large";
				addLoc(a, file$1, 119, 8, 4240);
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
		this._debugName = '<EditProfile>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);
		if (!('messages' in this._state)) console.warn("<EditProfile> was created without expected data property 'messages'");
		if (!('changeEmail' in this._state)) console.warn("<EditProfile> was created without expected data property 'changeEmail'");
		if (!('errors' in this._state)) console.warn("<EditProfile> was created without expected data property 'errors'");
		if (!('email' in this._state)) console.warn("<EditProfile> was created without expected data property 'email'");
		if (!('savingEmail' in this._state)) console.warn("<EditProfile> was created without expected data property 'savingEmail'");
		if (!('changePassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'changePassword'");
		if (!('currentPassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'currentPassword'");
		if (!('passwordError' in this._state)) console.warn("<EditProfile> was created without expected data property 'passwordError'");
		if (!('passwordSuccess' in this._state)) console.warn("<EditProfile> was created without expected data property 'passwordSuccess'");
		if (!('passwordHelp' in this._state)) console.warn("<EditProfile> was created without expected data property 'passwordHelp'");
		if (!('showPasswordAsClearText' in this._state)) console.warn("<EditProfile> was created without expected data property 'showPasswordAsClearText'");
		if (!('newPassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'newPassword'");
		if (!('newPasswordOk' in this._state)) console.warn("<EditProfile> was created without expected data property 'newPasswordOk'");
		if (!('savingPassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'savingPassword'");
		if (!('deleteAccount3' in this._state)) console.warn("<EditProfile> was created without expected data property 'deleteAccount3'");
		if (!('deleteAccount2' in this._state)) console.warn("<EditProfile> was created without expected data property 'deleteAccount2'");
		if (!('confirmEmail' in this._state)) console.warn("<EditProfile> was created without expected data property 'confirmEmail'");
		if (!('confirmPassword' in this._state)) console.warn("<EditProfile> was created without expected data property 'confirmPassword'");
		if (!('deletingAccount' in this._state)) console.warn("<EditProfile> was created without expected data property 'deletingAccount'");
		if (!('deleteAccount' in this._state)) console.warn("<EditProfile> was created without expected data property 'deleteAccount'");
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(EditProfile.prototype, protoDev);
	assign(EditProfile.prototype, methods);

	EditProfile.prototype._checkReadOnly = function _checkReadOnly(newState) {
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

	/* shared/NavTabs.html generated by Svelte v2.16.1 */

	function data$3() {
	    return {
	        groups: [],
	        basePath: '',
	        activeTab: null
	    };
	}
	var methods$1 = {
	    activateTab(tab, event = null) {
	        if (tab.module) {
	            if (event) event.preventDefault();
	            Promise.all([loadStylesheet(tab.css), loadScript(tab.js || tab.src)]).then(
	                () => {
	                    require([tab.module], mod => {
	                        tab.ui = mod.App;
	                        tab.module = null;
	                        const { groups } = this.get();
	                        this.set({
	                            groups,
	                            activeTab: tab
	                        });
	                    });
	                }
	            );
	            return;
	        }
	        if (tab.ui) {
	            if (event) event.preventDefault();
	            this.set({ activeTab: tab });
	        }
	    },
	    onTabChange(tab, event) {
	        if (tab.onchange) {
	            tab.onchange(event, this.refs.currentTabUi);
	        }
	    }
	};

	const file$2 = "shared/NavTabs.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.activateTab(ctx.tab, event);
	}

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tab = list[i];
		return child_ctx;
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.group = list[i];
		return child_ctx;
	}

	function create_main_fragment$3(component, ctx) {
		var div1, div0, text0, slot_content_belowMenu = component._slotted.belowMenu, slot_content_belowMenu_before, text1;

		var each_value = ctx.groups;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		var if_block = (ctx.activeTab) && create_if_block$3(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text0 = createText("\n        ");
				text1 = createText("\n    ");
				if (if_block) if_block.c();
				div0.className = "span2 svelte-5we305";
				addLoc(div0, file$2, 1, 4, 22);
				div1.className = "row";
				addLoc(div1, file$2, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}

				append(div0, text0);

				if (slot_content_belowMenu) {
					append(div0, slot_content_belowMenu_before || (slot_content_belowMenu_before = createComment()));
					append(div0, slot_content_belowMenu);
				}

				append(div1, text1);
				if (if_block) if_block.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (changed.groups || changed.activeTab || changed.basePath) {
					each_value = ctx.groups;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div0, text0);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (ctx.activeTab) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$3(component, ctx);
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
					detachNode(div1);
				}

				destroyEach(each_blocks, detach);

				if (slot_content_belowMenu) {
					reinsertAfter(slot_content_belowMenu_before, slot_content_belowMenu);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (7:12) {#each group.tabs as tab}
	function create_each_block_1$1(component, ctx) {
		var li, a, i, i_class_value, text0, text1_value = ctx.tab.title, text1, a_href_value;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i = createElement("i");
				text0 = createText("   ");
				text1 = createText(text1_value);
				i.className = i_class_value = "" + ctx.tab.icon + " svelte-5we305";
				addLoc(i, file$2, 9, 21, 399);

				a._svelte = { component, ctx };

				addListener(a, "click", click_handler);
				a.href = a_href_value = ctx.tab.url || `/${ctx.basePath}/${ctx.tab.id}`;
				a.className = "svelte-5we305";
				addLoc(a, file$2, 8, 16, 293);
				li.className = "svelte-5we305";
				toggleClass(li, "active", ctx.activeTab && ctx.activeTab.id === ctx.tab.id);
				addLoc(li, file$2, 7, 12, 220);
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
				if ((changed.groups) && i_class_value !== (i_class_value = "" + ctx.tab.icon + " svelte-5we305")) {
					i.className = i_class_value;
				}

				if ((changed.groups) && text1_value !== (text1_value = ctx.tab.title)) {
					setData(text1, text1_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.groups || changed.basePath) && a_href_value !== (a_href_value = ctx.tab.url || `/${ctx.basePath}/${ctx.tab.id}`)) {
					a.href = a_href_value;
				}

				if ((changed.activeTab || changed.groups)) {
					toggleClass(li, "active", ctx.activeTab && ctx.activeTab.id === ctx.tab.id);
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

	// (3:8) {#each groups as group}
	function create_each_block$1(component, ctx) {
		var div, text0_value = ctx.group.title, text0, text1, ul;

		var each_value_1 = ctx.group.tabs;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(component, get_each_context_1$1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n\n        ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "group svelte-5we305";
				addLoc(div, file$2, 3, 8, 82);
				ul.className = "nav nav-stacked nav-tabs";
				addLoc(ul, file$2, 5, 8, 132);
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

				if (changed.activeTab || changed.groups || changed.basePath) {
					each_value_1 = ctx.group.tabs;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$1(component, child_ctx);
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
					detachNode(text1);
					detachNode(ul);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (18:4) {#if activeTab}
	function create_if_block$3(component, ctx) {
		var div, slot_content_aboveContent = component._slotted.aboveContent, slot_content_aboveContent_after, text0, text1, slot_content_belowContent = component._slotted.belowContent, slot_content_belowContent_before, div_class_value;

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

		function switch_instance_change(event) {
			component.onTabChange(ctx.activeTab, event);
		}

		if (switch_instance) switch_instance.on("change", switch_instance_change);

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText("\n        ");
				if (switch_instance) switch_instance._fragment.c();
				text1 = createText("\n        ");
				div.className = div_class_value = "span10 account-page-content tab-" + ctx.activeTab.id + " svelte-5we305";
				addLoc(div, file$2, 18, 4, 607);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				if (slot_content_aboveContent) {
					append(div, slot_content_aboveContent);
					append(div, slot_content_aboveContent_after || (slot_content_aboveContent_after = createComment()));
				}

				append(div, text0);

				if (switch_instance) {
					switch_instance._mount(div, null);
					component.refs.currentTabUi = switch_instance;
				}

				append(div, text1);

				if (slot_content_belowContent) {
					append(div, slot_content_belowContent_before || (slot_content_belowContent_before = createComment()));
					append(div, slot_content_belowContent);
				}
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
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
						switch_instance._mount(div, text1);

						switch_instance.on("change", switch_instance_change);

						component.refs.currentTabUi = switch_instance;
					} else {
						switch_instance = null;
						if (component.refs.currentTabUi === switch_instance) {
							component.refs.currentTabUi = null;
						}
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}

				if ((changed.activeTab) && div_class_value !== (div_class_value = "span10 account-page-content tab-" + ctx.activeTab.id + " svelte-5we305")) {
					div.className = div_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (slot_content_aboveContent) {
					reinsertBefore(slot_content_aboveContent_after, slot_content_aboveContent);
				}

				if (switch_instance) switch_instance.destroy();

				if (slot_content_belowContent) {
					reinsertAfter(slot_content_belowContent_before, slot_content_belowContent);
				}
			}
		};
	}

	function NavTabs(options) {
		this._debugName = '<NavTabs>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$3(), options.data);
		if (!('groups' in this._state)) console.warn("<NavTabs> was created without expected data property 'groups'");
		if (!('activeTab' in this._state)) console.warn("<NavTabs> was created without expected data property 'activeTab'");
		if (!('basePath' in this._state)) console.warn("<NavTabs> was created without expected data property 'basePath'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(NavTabs.prototype, protoDev);
	assign(NavTabs.prototype, methods$1);

	NavTabs.prototype._checkReadOnly = function _checkReadOnly(newState) {
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
	const file$3 = "home/david/Projects/core/libs/controls/v2/BaseSelect.html";

	function get_each_context_2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function get_each_context_1$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.optgroup = list[i];
		return child_ctx;
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$4(component, ctx) {
		var select, if_block0_anchor, select_updating = false;

		var if_block0 = (ctx.options.length) && create_if_block_1$2(component, ctx);

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
				addLoc(select, file$3, 0, 0, 0);
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
						if_block0 = create_if_block_1$2(component, ctx);
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
	function create_if_block_1$2(component, ctx) {
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
				addLoc(option, file$3, 2, 4, 179);
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
			each_blocks[i] = create_each_block$2(component, get_each_context_1$2(ctx, each_value_1, i));
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
						const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

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
	function create_each_block_1$2(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$3, 6, 8, 420);
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
			each_blocks[i] = create_each_block_1$2(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
				addLoc(optgroup, file$3, 4, 4, 336);
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
							each_blocks[i] = create_each_block_1$2(component, child_ctx);
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

	/* account/MyTeams.html generated by Svelte v2.16.1 */


	let initialCurrentTeam = null;

	function teamOptions({ teams }) {
	    return teams
	        .map(({ id, name }) => ({
	            value: id,
	            label: name
	        }))
	        .concat({
	            value: null,
	            label: __('nav / no-team')
	        });
	}
	function autoslug({ newTeamName }) {
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
	var methods$2 = {
	    createTeam(name, slug) {
	        const { user } = this.get();
	        const payload = { name };
	        if (user.isAdmin && slug) {
	            payload.id = String(slug).trim().toLowerCase();
	        }
	        this.set({
	            awaitCreateTeam: httpReq(`/v3/teams`, {
	                method: 'post',
	                payload
	            }).then(team => {
	                window.location.href = `/team/${team.id}/settings`;
	            })
	        });
	    },
	    leaveTeam(team) {
	        const { user, teams } = this.get();
	        if (
	            window.confirm(
	                __('account / my-teams / leave-team / confirm').replace('%team%', team.name)
	            )
	        ) {
	            httpReq(`/v3/teams/${team.id}/members/${user.id}`, { method: 'delete' })
	                .then(res => {
	                    window.alert(__('account / my-teams / leave-team / done'));
	                    teams.splice(
	                        teams.findIndex(t => t.id === team.id),
	                        1
	                    );
	                    this.set({ teams });
	                })
	                .catch(error => {
	                    window.alert(
	                        'There was a problem with your request. Please contact support@datawrapper.de'
	                    );
	                    console.error(error);
	                });
	        }
	    }
	};

	function onstate({ changed, current }) {
	    if (changed.currentTeam && current.currentTeam !== undefined) {
	        if (!initialCurrentTeam) initialCurrentTeam = current.currentTeam;
	        else if (current.currentTeam !== initialCurrentTeam) {
	            initialCurrentTeam = current.currentTeam;
	            this.set({
	                awaitActiveTeam: httpReq(`/v3/me/settings`, {
	                    method: 'patch',
	                    payload: {
	                        activeTeam: current.currentTeam || null
	                    }
	                })
	            });
	        }
	    }
	}
	const file$4 = "account/MyTeams.html";

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.leaveTeam(ctx.team);
	}

	function get_each_context$3(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.team = list[i];
		return child_ctx;
	}

	function create_main_fragment$5(component, ctx) {
		var h2, raw0_value = __("account / my-teams"), text0, text1, div1, div0, h3, raw1_value = __('account / my-teams / create'), text2, text3;

		function select_block_type(ctx) {
			if (ctx.teams.length) return create_if_block_5$1;
			return create_else_block_5;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		function select_block_type_4(ctx) {
			if (!ctx.createTeam) return create_if_block_2$2;
			return create_else_block$1;
		}

		var current_block_type_1 = select_block_type_4(ctx);
		var if_block1 = current_block_type_1(component, ctx);

		var if_block2 = (ctx.teams.length > 0) && create_if_block$5(component, ctx);

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText("\n\n");
				if_block0.c();
				text1 = createText("\n\n");
				div1 = createElement("div");
				div0 = createElement("div");
				h3 = createElement("h3");
				text2 = createText("\n        ");
				if_block1.c();
				text3 = createText("\n    ");
				if (if_block2) if_block2.c();
				addLoc(h2, file$4, 0, 0, 0);
				h3.className = "svelte-t3x94h";
				addLoc(h3, file$4, 64, 8, 2262);
				div0.className = "span5";
				addLoc(div0, file$4, 63, 4, 2234);
				div1.className = "row";
				addLoc(div1, file$4, 62, 0, 2212);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				h2.innerHTML = raw0_value;
				insert(target, text0, anchor);
				if_block0.m(target, anchor);
				insert(target, text1, anchor);
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, h3);
				h3.innerHTML = raw1_value;
				append(div0, text2);
				if_block1.m(div0, null);
				append(div1, text3);
				if (if_block2) if_block2.m(div1, null);
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

				if (current_block_type_1 === (current_block_type_1 = select_block_type_4(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type_1(component, ctx);
					if_block1.c();
					if_block1.m(div0, null);
				}

				if (ctx.teams.length > 0) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$5(component, ctx);
						if_block2.c();
						if_block2.m(div1, null);
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
					detachNode(div1);
				}

				if_block1.d();
				if (if_block2) if_block2.d();
			}
		};
	}

	// (59:0) {:else}
	function create_else_block_5(component, ctx) {
		var p, raw_value = __('account / my-teams / no-teams-yet');

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$4, 59, 0, 2150);
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
	function create_if_block_5$1(component, ctx) {
		var p, raw_value = __('account / my-teams / your-teams'), text0, table, thead, tr, th0, text1_value = __('account / my-teams / name'), text1, text2, text3, th1, text4_value = __('account / my-teams / your-role'), text4, text5, th2, text6_value = __('account / my-teams / num-charts'), text6, text7, th3, text8_value = __('account / my-teams / num-members'), text8, text9, th4, text10_value = __('account / my-teams / leave-team'), text10, text11, tbody;

		var if_block = (ctx.user.isAdmin) && create_if_block_12();

		var each_value = ctx.teams;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, get_each_context$3(ctx, each_value, i));
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
				if (if_block) if_block.c();
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
				addLoc(p, file$4, 3, 0, 63);
				addLoc(th0, file$4, 8, 12, 176);
				addLoc(th1, file$4, 12, 12, 333);
				addLoc(th2, file$4, 13, 12, 393);
				addLoc(th3, file$4, 14, 12, 454);
				addLoc(th4, file$4, 15, 12, 516);
				addLoc(tr, file$4, 7, 8, 159);
				addLoc(thead, file$4, 6, 4, 143);
				addLoc(tbody, file$4, 18, 4, 596);
				table.className = "table";
				addLoc(table, file$4, 5, 0, 117);
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
				if (if_block) if_block.m(tr, null);
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
						if_block = create_if_block_12();
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
						const child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$3(component, child_ctx);
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

				if (if_block) if_block.d();

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (10:12) {#if user.isAdmin}
	function create_if_block_12(component, ctx) {
		var th, text_value = __('account / my-teams / id'), text;

		return {
			c: function create() {
				th = createElement("th");
				text = createText(text_value);
				addLoc(th, file$4, 10, 12, 262);
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

	// (23:90) {:else}
	function create_else_block_4(component, ctx) {
		var a, text_value = truncate(ctx.team.name, 20, 10), text, a_href_value;

		return {
			c: function create() {
				a = createElement("a");
				text = createText(text_value);
				a.href = a_href_value = "/team/" + ctx.team.id + "/settings";
				addLoc(a, file$4, 22, 97, 801);
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

	// (23:16) {#if team.role === 'member' && !user.isAdmin}
	function create_if_block_11(component, ctx) {
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

	// (26:23) {#if team.id === currentTeam}
	function create_if_block_10(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-check-circle";
				addLoc(i, file$4, 26, 16, 979);
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

	// (30:12) {#if user.isAdmin}
	function create_if_block_9(component, ctx) {
		var td, text_value = ctx.team.id, text;

		return {
			c: function create() {
				td = createElement("td");
				text = createText(text_value);
				td.className = "slug svelte-t3x94h";
				addLoc(td, file$4, 30, 12, 1097);
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

	// (36:60) {:else}
	function create_else_block_3$1(component, ctx) {
		var a, text0_value = ctx.team.members, text0, a_href_value, text1, if_block_anchor;

		var if_block = (ctx.team.invites) && create_if_block_8$1(component, ctx);

		return {
			c: function create() {
				a = createElement("a");
				text0 = createText(text0_value);
				text1 = createText(" ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				a.href = a_href_value = "/team/" + ctx.team.id + "/members";
				addLoc(a, file$4, 36, 16, 1374);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, text0);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.teams) && text0_value !== (text0_value = ctx.team.members)) {
					setData(text0, text0_value);
				}

				if ((changed.teams) && a_href_value !== (a_href_value = "/team/" + ctx.team.id + "/members")) {
					a.href = a_href_value;
				}

				if (ctx.team.invites) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_8$1(component, ctx);
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

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (36:16) {#if team.role === 'member'}
	function create_if_block_7$1(component, ctx) {
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

	// (37:69) {#if team.invites}
	function create_if_block_8$1(component, ctx) {
		var span, text0, text1_value = ctx.team.invites, text1, text2;

		return {
			c: function create() {
				span = createElement("span");
				text0 = createText("(+");
				text1 = createText(text1_value);
				text2 = createText(")");
				span.className = "invites svelte-t3x94h";
				addLoc(span, file$4, 36, 87, 1445);
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

	// (48:16) {:else}
	function create_else_block_2$1(component, ctx) {
		var a, i, text0, text1_value = __('account / my-teams / delete-team'), text1, a_href_value;

		return {
			c: function create() {
				a = createElement("a");
				i = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				i.className = "fa fa-trash";
				addLoc(i, file$4, 49, 21, 1959);
				a.href = a_href_value = "/team/" + ctx.team.id + "/delete";
				a.className = "btn btn-small btn-danger";
				addLoc(a, file$4, 48, 16, 1872);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, i);
				append(a, text0);
				append(a, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.teams) && a_href_value !== (a_href_value = "/team/" + ctx.team.id + "/delete")) {
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

	// (44:16) {#if team.role !== 'owner'}
	function create_if_block_6$1(component, ctx) {
		var button, i, text0, text1_value = __('account / my-teams / leave-team'), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				i.className = "fa fa-sign-out";
				addLoc(i, file$4, 45, 20, 1735);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler$1);
				button.className = "btn btn-small";
				addLoc(button, file$4, 44, 16, 1657);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler$1);
			}
		};
	}

	// (20:8) {#each teams as team}
	function create_each_block$3(component, ctx) {
		var tr, td0, text0, text1, text2, td1, raw_value = __('teams / role / '+ctx.team.role), text3, td2, a, text4_value = ctx.team.charts, text4, a_href_value, text5, td3, text6, td4;

		function select_block_type_1(ctx) {
			if (ctx.team.role === 'member' && !ctx.user.isAdmin) return create_if_block_11;
			return create_else_block_4;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block0 = current_block_type(component, ctx);

		var if_block1 = (ctx.team.id === ctx.currentTeam) && create_if_block_10();

		var if_block2 = (ctx.user.isAdmin) && create_if_block_9(component, ctx);

		function select_block_type_2(ctx) {
			if (ctx.team.role === 'member') return create_if_block_7$1;
			return create_else_block_3$1;
		}

		var current_block_type_1 = select_block_type_2(ctx);
		var if_block3 = current_block_type_1(component, ctx);

		function select_block_type_3(ctx) {
			if (ctx.team.role !== 'owner') return create_if_block_6$1;
			return create_else_block_2$1;
		}

		var current_block_type_2 = select_block_type_3(ctx);
		var if_block4 = current_block_type_2(component, ctx);

		return {
			c: function create() {
				tr = createElement("tr");
				td0 = createElement("td");
				if_block0.c();
				text0 = createText(" ");
				if (if_block1) if_block1.c();
				text1 = createText("\n            ");
				if (if_block2) if_block2.c();
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
				if_block4.c();
				addLoc(td0, file$4, 21, 12, 699);
				addLoc(td1, file$4, 32, 12, 1159);
				a.href = a_href_value = "/team/" + ctx.team.id;
				addLoc(a, file$4, 33, 16, 1224);
				addLoc(td2, file$4, 33, 12, 1220);
				addLoc(td3, file$4, 34, 12, 1285);
				addLoc(td4, file$4, 42, 12, 1592);
				toggleClass(tr, "current", ctx.team.id === ctx.currentTeam);
				addLoc(tr, file$4, 20, 8, 642);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				if_block0.m(td0, null);
				append(td0, text0);
				if (if_block1) if_block1.m(td0, null);
				append(tr, text1);
				if (if_block2) if_block2.m(tr, null);
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
				if_block4.m(td4, null);
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
						if_block1 = create_if_block_10();
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
						if_block2 = create_if_block_9(component, ctx);
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

				if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx)) && if_block4) {
					if_block4.p(changed, ctx);
				} else {
					if_block4.d(1);
					if_block4 = current_block_type_2(component, ctx);
					if_block4.c();
					if_block4.m(td4, null);
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
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if_block3.d();
				if_block4.d();
			}
		};
	}

	// (79:8) {:else}
	function create_else_block$1(component, ctx) {
		var p, raw_value = __('team-create / p'), text0, input, input_updating = false, input_maxlength_value, text1, text2, button0, text3, text4_value = __('team-create / button'), text4, button0_disabled_value, text5, button1, text6_value = __('team-create / return'), text6;

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

		var if_block0 = (ctx.user.isAdmin) && create_if_block_4$1(component, ctx);

		function select_block_type_5(ctx) {
			if (ctx.awaitCreateTeam) return create_if_block_3$2;
			return create_else_block_1$1;
		}

		var current_block_type = select_block_type_5(ctx);
		var if_block1 = current_block_type(component, ctx);

		function click_handler_1(event) {
			component.createTeam(ctx.newTeamName, ctx.newTeamSlug);
		}

		function click_handler_2(event) {
			component.set({createTeam:false});
		}

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText("\n\n        ");
				input = createElement("input");
				formblock._fragment.c();
				text1 = createText("\n        ");
				if (if_block0) if_block0.c();
				text2 = createText("\n\n        ");
				button0 = createElement("button");
				if_block1.c();
				text3 = createText("   ");
				text4 = createText(text4_value);
				text5 = createText("\n        ");
				button1 = createElement("button");
				text6 = createText(text6_value);
				addLoc(p, file$4, 79, 8, 2787);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.placeholder = __('team-create / untitled');
				input.maxLength = input_maxlength_value = ctx.user.isAdmin ? 80 : 50;
				addLoc(input, file$4, 84, 12, 2954);
				addListener(button0, "click", click_handler_1);
				button0.className = "btn btn-primary";
				button0.disabled = button0_disabled_value = !ctx.newTeamName.length;
				addLoc(button0, file$4, 97, 8, 3435);
				addListener(button1, "click", click_handler_2);
				button1.className = "btn";
				addLoc(button1, file$4, 114, 8, 4112);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text0, anchor);
				append(formblock._slotted.default, input);

				input.value = ctx.newTeamName;

				formblock._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block0) if_block0.m(target, anchor);
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
				if (!input_updating && changed.newTeamName) input.value = ctx.newTeamName;
				if ((changed.user) && input_maxlength_value !== (input_maxlength_value = ctx.user.isAdmin ? 80 : 50)) {
					input.maxLength = input_maxlength_value;
				}

				if (ctx.user.isAdmin) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_4$1(component, ctx);
						if_block0.c();
						if_block0.m(text2.parentNode, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block1) {
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

				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text2);
					detachNode(button0);
				}

				if_block1.d();
				removeListener(button0, "click", click_handler_1);
				if (detach) {
					detachNode(text5);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_2);
			}
		};
	}

	// (66:8) {#if !createTeam}
	function create_if_block_2$2(component, ctx) {
		var div, p, raw0_value = __('account / my-teams / why-teams'), text0, button, i, text1, raw1_value = __('account / my-teams / create-btn'), raw1_before;

		function click_handler_1(event) {
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
				addLoc(p, file$4, 67, 12, 2377);
				i.className = "fa fa-plus fa-fw";
				addLoc(i, file$4, 75, 16, 2647);
				addListener(button, "click", click_handler_1);
				button.className = "btn btn-large";
				toggleClass(button, "btn-primary", !ctx.teams.length);
				addLoc(button, file$4, 70, 12, 2471);
				div.className = "hed svelte-t3x94h";
				addLoc(div, file$4, 66, 8, 2347);
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

				removeListener(button, "click", click_handler_1);
			}
		};
	}

	// (92:8) {#if user.isAdmin}
	function create_if_block_4$1(component, ctx) {
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
				addLoc(input, file$4, 93, 12, 3319);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, input);

				input.value = ctx.newTeamSlug;

				formblock._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.newTeamSlug) input.value = ctx.newTeamSlug;
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

	// (113:12) {:else}
	function create_else_block_1$1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-plus fa-fw";
				addLoc(i, file$4, 112, 19, 4010);
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

	// (104:12) {#if awaitCreateTeam}
	function create_if_block_3$2(component, ctx) {
		var await_block_anchor, promise;

		let info = {
			component,
			ctx,
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
				info.mount = () => await_block_anchor.parentNode;
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

	// (108:52) {:catch}
	function create_catch_block_1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-exclamation-triangle";
				addLoc(i, file$4, 107, 60, 3861);
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

	// (108:12) {:then}
	function create_then_block_1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-check fa-fw";
				addLoc(i, file$4, 107, 19, 3820);
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

	// (104:57)  &nbsp;<i                 class="fa fa-spinner fa-spin"             ></i>             <!-- prettier-ignore -->             {:then}
	function create_pending_block_1(component, ctx) {
		var text, i;

		return {
			c: function create() {
				text = createText(" ");
				i = createElement("i");
				i.className = "fa fa-spinner fa-spin";
				addLoc(i, file$4, 103, 64, 3697);
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

	// (118:4) {#if teams.length > 0}
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
			_bind(changed, childState) {
				var newState = {};
				if (!baseselect_updating.value && changed.value) {
					newState.currentTeam = childState.value;
				}
				component._set(newState);
				baseselect_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			baseselect._bind({ value: 1 }, baseselect.get());
		});

		var if_block = (ctx.awaitActiveTeam) && create_if_block_1$3(component, ctx);

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
				if (if_block) if_block.c();
				formblock._fragment.c();
				h3.className = "svelte-t3x94h";
				addLoc(h3, file$4, 119, 8, 4289);
				addLoc(p, file$4, 120, 8, 4355);
				div0.className = "flex";
				addLoc(div0, file$4, 122, 12, 4506);
				div1.className = "span5";
				addLoc(div1, file$4, 118, 4, 4261);
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
				if (if_block) if_block.m(div0, null);
				formblock._mount(div1, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var baseselect_changes = {};
				if (changed.teamOptions) baseselect_changes.options = ctx.teamOptions;
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
					detachNode(div1);
				}

				baseselect.destroy();
				if (if_block) if_block.d();
				formblock.destroy();
			}
		};
	}

	// (126:16) {#if awaitActiveTeam}
	function create_if_block_1$3(component, ctx) {
		var await_block_anchor, promise;

		let info = {
			component,
			ctx,
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
				info.mount = () => await_block_anchor.parentNode;
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

	// (129:56) {:catch}
	function create_catch_block(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-exclamation-triangle";
				addLoc(i, file$4, 128, 64, 4868);
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

	// (129:16) {:then}
	function create_then_block(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-check fa-fw";
				addLoc(i, file$4, 128, 23, 4827);
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

	// (126:62)  &nbsp;<i                     class="fa fa-spinner fa-spin"                 ></i>                 {:then}
	function create_pending_block(component, ctx) {
		var text, i;

		return {
			c: function create() {
				text = createText(" ");
				i = createElement("i");
				i.className = "fa fa-spinner fa-spin";
				addLoc(i, file$4, 125, 69, 4729);
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
		this._debugName = '<MyTeams>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$5(), options.data);

		this._recompute({ teams: 1, newTeamName: 1 }, this._state);
		if (!('teams' in this._state)) console.warn("<MyTeams> was created without expected data property 'teams'");
		if (!('newTeamName' in this._state)) console.warn("<MyTeams> was created without expected data property 'newTeamName'");
		if (!('user' in this._state)) console.warn("<MyTeams> was created without expected data property 'user'");
		if (!('currentTeam' in this._state)) console.warn("<MyTeams> was created without expected data property 'currentTeam'");
		if (!('createTeam' in this._state)) console.warn("<MyTeams> was created without expected data property 'createTeam'");

		if (!('newTeamSlug' in this._state)) console.warn("<MyTeams> was created without expected data property 'newTeamSlug'");
		if (!('awaitCreateTeam' in this._state)) console.warn("<MyTeams> was created without expected data property 'awaitCreateTeam'");

		if (!('awaitActiveTeam' in this._state)) console.warn("<MyTeams> was created without expected data property 'awaitActiveTeam'");
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$5(this, this._state);

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

	assign(MyTeams.prototype, protoDev);
	assign(MyTeams.prototype, methods$2);

	MyTeams.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('teamOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<MyTeams>: Cannot set read-only property 'teamOptions'");
		if ('autoslug' in newState && !this._updatingReadonlyProperty) throw new Error("<MyTeams>: Cannot set read-only property 'autoslug'");
	};

	MyTeams.prototype._recompute = function _recompute(changed, state) {
		if (changed.teams) {
			if (this._differs(state.teamOptions, (state.teamOptions = teamOptions(state)))) changed.teamOptions = true;
		}

		if (changed.newTeamName) {
			if (this._differs(state.autoslug, (state.autoslug = autoslug(state)))) changed.autoslug = true;
		}
	};

	/* account/App.html generated by Svelte v2.16.1 */



	/**
	 * @see https://stackoverflow.com/a/22706073
	 */
	function escapeHTML(s) {
	    return new Option(s).innerHTML;
	}

	const EditProfileTab = {
	    title: __('account / profile'),
	    id: 'profile',
	    icon: 'im im-user-settings',
	    ui: EditProfile,
	    data: {}
	};

	const MyTeamsTab = {
	    title: __('account / my-teams'),
	    id: 'teams',
	    icon: 'im im-users',
	    ui: MyTeams,
	    data: {}
	};

	let popstate = false;

	function data$6({ email, user, userId, teams, currentTeam }) {
	    return { user, email, userId, teams, currentTeam };
	}
	function pageTitle({ activeTab }) {
	    return activeTab ? activeTab.title : '';
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
	var methods$3 = {
	    setTab(id) {
	        const { groups } = this.get();
	        let foundTab = false;
	        groups.forEach(group => {
	            group.tabs.forEach(tab => {
	                if (tab.id === id) {
	                    this.refs.navTabs.activateTab(tab);
	                    foundTab = true;
	                }
	            });
	        });
	        if (!foundTab) {
	            this.set({
	                activeTab: EditProfileTab
	            });
	        }
	    }
	};

	function oncreate() {
	    const path = window.location.pathname.split('/').slice(1);
	    const initialTab = path[1] || 'profile';

	    dw.backend.__svelteApps.account = this;

	    const {
	        email,
	        user,
	        userId,
	        groups,
	        teams,
	        adminTeams,
	        pages,
	        currentTeam
	    } = this.get();

	    if (pages.length) {
	        groups[0].tabs.push.apply(groups[0].tabs, pages);
	        this.set({ groups });
	    }

	    groups[0].tabs.splice(1, 0, MyTeamsTab);
	    this.set({ groups });

	    if (adminTeams.length) {
	        groups.push({
	            title: __('account / settings / team'),
	            tabs: []
	        });
	        adminTeams.forEach(({ Id, Name }) => {
	            groups[1].tabs.push({
	                title: truncate(Name, 10, 4),
	                url: `/team/${Id}/settings`,
	                icon: 'im im-users'
	            });
	        });
	        this.set({ groups });
	    }

	    EditProfileTab.data = { email, userId, user };
	    MyTeamsTab.data = { teams, currentTeam, user };

	    this.setTab(initialTab);

	    window.addEventListener('popstate', ({ state }) => {
	        popstate = true;
	        setTimeout(() => (popstate = false), 100);
	        this.setTab(state.id);
	    });
	}
	function onstate$1({ changed, current, previous }) {
	    if (changed.activeTab && current.activeTab && !popstate) {
	        window.history.pushState(
	            { id: current.activeTab.id },
	            '',
	            `/account/${current.activeTab.id}`
	        );
	    }
	}
	const file$5 = "account/App.html";

	function get_each_context$4(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.team = list[i];
		return child_ctx;
	}

	function create_main_fragment$6(component, ctx) {
		var title_value, text0, div, h1, text1_value = __('account / settings'), text1, text2, text3, navtabs_updating = {};

		document.title = title_value = "" + ctx.pageTitle + " | " + __('account / settings') + " | Datawrapper";
		var each_value = ctx.invitations;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(component, get_each_context$4(ctx, each_value, i));
		}

		var navtabs_initial_data = { basePath: "account", groups: ctx.groups };
		if (ctx.activeTab  !== void 0) {
			navtabs_initial_data.activeTab = ctx.activeTab ;
			navtabs_updating.activeTab = true;
		}
		var navtabs = new NavTabs({
			root: component.root,
			store: component.store,
			data: navtabs_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!navtabs_updating.activeTab && changed.activeTab) {
					newState.activeTab = childState.activeTab;
				}
				component._set(newState);
				navtabs_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			navtabs._bind({ activeTab: 1 }, navtabs.get());
		});

		component.refs.navTabs = navtabs;

		return {
			c: function create() {
				text0 = createText("\n\n");
				div = createElement("div");
				h1 = createElement("h1");
				text1 = createText(text1_value);
				text2 = createText("\n    ");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text3 = createText("\n    ");
				navtabs._fragment.c();
				h1.className = "title";
				addLoc(h1, file$5, 5, 4, 128);
				div.className = "admin svelte-dmpd5k";
				addLoc(div, file$5, 4, 0, 104);
			},

			m: function mount(target, anchor) {
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, h1);
				append(h1, text1);
				append(div, text2);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				append(div, text3);
				navtabs._mount(div, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.pageTitle) && title_value !== (title_value = "" + ctx.pageTitle + " | " + __('account / settings') + " | Datawrapper")) {
					document.title = title_value;
				}

				if (changed.invitations) {
					each_value = ctx.invitations;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$4(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, text3);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				var navtabs_changes = {};
				if (changed.groups) navtabs_changes.groups = ctx.groups;
				if (!navtabs_updating.activeTab && changed.activeTab) {
					navtabs_changes.activeTab = ctx.activeTab ;
					navtabs_updating.activeTab = ctx.activeTab  !== void 0;
				}
				navtabs._set(navtabs_changes);
				navtabs_updating = {};
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text0);
					detachNode(div);
				}

				destroyEach(each_blocks, detach);

				navtabs.destroy();
				if (component.refs.navTabs === navtabs) component.refs.navTabs = null;
			}
		};
	}

	// (7:4) {#each invitations as team}
	function create_each_block$4(component, ctx) {
		var div, raw_value = __('account / team-invite').replace('%s', escapeHTML(truncate(ctx.team.name, 20, 10))), raw_after, text0, a0, text1_value = __('account / team-invite / accept'), text1, a0_href_value, text2, text3_value = __('account / or'), text3, text4, a1, text5_value = __('account / team-invite / reject'), text5, a1_href_value, text6;

		return {
			c: function create() {
				div = createElement("div");
				raw_after = createElement('noscript');
				text0 = createText("\n        \n        ");
				a0 = createElement("a");
				text1 = createText(text1_value);
				text2 = createText("\n        \n          ");
				text3 = createText(text3_value);
				text4 = createText("\n        ");
				a1 = createElement("a");
				text5 = createText(text5_value);
				text6 = createText(".");
				a0.href = a0_href_value = "/team/" + ctx.team.id + "/invite/" + ctx.team.token + "/accept";
				a0.className = "btn btn-primary svelte-dmpd5k";
				addLoc(a0, file$5, 10, 8, 385);
				a1.href = a1_href_value = "/team/" + ctx.team.id + "/invite/" + ctx.team.token + "/reject";
				a1.className = "svelte-dmpd5k";
				addLoc(a1, file$5, 13, 8, 586);
				div.className = "alert alert-info svelte-dmpd5k";
				addLoc(div, file$5, 7, 4, 214);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, raw_after);
				raw_after.insertAdjacentHTML("beforebegin", raw_value);
				append(div, text0);
				append(div, a0);
				append(a0, text1);
				append(div, text2);
				append(div, text3);
				append(div, text4);
				append(div, a1);
				append(a1, text5);
				append(div, text6);
			},

			p: function update(changed, ctx) {
				if ((changed.invitations) && raw_value !== (raw_value = __('account / team-invite').replace('%s', escapeHTML(truncate(ctx.team.name, 20, 10))))) {
					detachBefore(raw_after);
					raw_after.insertAdjacentHTML("beforebegin", raw_value);
				}

				if ((changed.invitations) && a0_href_value !== (a0_href_value = "/team/" + ctx.team.id + "/invite/" + ctx.team.token + "/accept")) {
					a0.href = a0_href_value;
				}

				if ((changed.invitations) && a1_href_value !== (a1_href_value = "/team/" + ctx.team.id + "/invite/" + ctx.team.token + "/reject")) {
					a1.href = a1_href_value;
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

		init(this, options);
		this.refs = {};
		this._state = assign(data_1(), options.data);

		this._recompute({ email: 1, user: 1, userId: 1, teams: 1, currentTeam: 1, activeTab: 1 }, this._state);
		if (!('email' in this._state)) console.warn("<App> was created without expected data property 'email'");
		if (!('user' in this._state)) console.warn("<App> was created without expected data property 'user'");
		if (!('userId' in this._state)) console.warn("<App> was created without expected data property 'userId'");
		if (!('teams' in this._state)) console.warn("<App> was created without expected data property 'teams'");
		if (!('currentTeam' in this._state)) console.warn("<App> was created without expected data property 'currentTeam'");
		if (!('activeTab' in this._state)) console.warn("<App> was created without expected data property 'activeTab'");

		if (!('invitations' in this._state)) console.warn("<App> was created without expected data property 'invitations'");
		if (!('groups' in this._state)) console.warn("<App> was created without expected data property 'groups'");
		this._intro = true;

		this._handlers.state = [onstate$1];

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$6(this, this._state);

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

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$3);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('data' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'data'");
		if ('pageTitle' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'pageTitle'");
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.email || changed.user || changed.userId || changed.teams || changed.currentTeam) {
			if (this._differs(state.data, (state.data = data$6(state)))) changed.data = true;
		}

		if (changed.activeTab) {
			if (this._differs(state.pageTitle, (state.pageTitle = pageTitle(state)))) changed.pageTitle = true;
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

	var main = { App, data: data$7, store };

	return main;

}));
//# sourceMappingURL=account.js.map
