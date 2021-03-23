(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../../../../../../../../../static/js/svelte/publish.js')) :
	typeof define === 'function' && define.amd ? define(['../../../../../../../../../static/js/svelte/publish.js'], factory) :
	(global = global || self, global['publish/sidebar'] = factory(global.publish_js));
}(this, (function (publish_js) { 'use strict';

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

	function detachBetween(before, after) {
		while (before.nextSibling && before.nextSibling !== after) {
			before.parentNode.removeChild(before.nextSibling);
		}
	}

	function reinsertChildren(parent, target) {
		while (parent.firstChild) target.appendChild(parent.firstChild);
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

	/**
	 * tracks a custom event in Matomo
	 *
	 *
	 * @param {string} category - the event category
	 * @param {string} category - the event action
	 * @param {string} category - the event name
	 * @param {string|number} category - the event value, optional
	 */
	function trackEvent(category, action, name, value) {
	    if (window._paq) {
	        window._paq.push(['trackEvent', category, action, name, value]);
	    }
	}

	/* publish/guest/Guest.html generated by Svelte v2.16.1 */



	function data$1() {
	    return {
	        error: '',
	        email: '',
	        guest_text_above: [],
	        guest_text_below: [],
	        signedUp: false
	    };
	}
	var methods = {
	    async createAccount(email) {
	        this.set({ signedUp: true });
	        trackEvent('Chart Editor', 'send-embed-code');
	        try {
	            const res = await post('/v3/auth/signup', {
	                payload: {
	                    email,
	                    invitation: true,
	                    chartId: window.chart.get().id
	                }
	            });

	            if (this.get().fromSvelte) {
	                // when in new chart editor, set user object
	                this.set({ signedUp: false, error: '' });
	                this.store.set({ user: res });
	            } else {
	                // otherwise, reload
	                window.location.reload();
	            }
	        } catch (e) {
	            if (e.name === 'HttpReqError') {
	                const res = await e.response.json();
	                this.set({ error: res.message || e });
	            } else {
	                this.set({ error: `Unknown error: ${e}` });
	            }
	        }
	    }
	};

	const file$1 = "publish/guest/Guest.html";

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.text = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.text = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var div4, div3, div0, text0, div1, input, input_updating = false, text1, button0, i0, i0_class_value, text2, raw0_value = __('publish / guest / cta'), raw0_before, text3, text4, div2, button1, i1, text5, raw1_value = __('publish / guest / back'), raw1_before, text6;

		function select_block_type(ctx) {
			if (ctx.guest_text_above) return create_if_block_2$1;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ email: input.value });
			input_updating = false;
		}

		function click_handler(event) {
			component.createAccount(ctx.email);
		}

		var formblock_initial_data = { label: __('publish / guest / e-mail'), help: __('publish / guest / example-email') };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		var if_block1 = (ctx.guest_text_below) && create_if_block_1$1(component, ctx);

		var if_block2 = (ctx.error) && create_if_block$1(component, ctx);

		return {
			c: function create() {
				div4 = createElement("div");
				div3 = createElement("div");
				div0 = createElement("div");
				if_block0.c();
				text0 = createText("\n\n        ");
				div1 = createElement("div");
				input = createElement("input");
				text1 = createText("\n\n                ");
				button0 = createElement("button");
				i0 = createElement("i");
				text2 = createText("\n                      ");
				raw0_before = createElement('noscript');
				formblock._fragment.c();
				text3 = createText("\n\n        ");
				if (if_block1) if_block1.c();
				text4 = createText("\n\n        ");
				div2 = createElement("div");
				button1 = createElement("button");
				i1 = createElement("i");
				text5 = createText("   ");
				raw1_before = createElement('noscript');
				text6 = createText("\n\n            ");
				if (if_block2) if_block2.c();
				setStyle(div0, "margin-bottom", "20px");
				addLoc(div0, file$1, 2, 8, 65);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "email");
				input.className = "input-xlarge";
				addLoc(input, file$1, 15, 16, 543);
				i0.className = i0_class_value = "fa " + (ctx.signedUp ? 'fa-circle-o-notch fa-spin': 'fa-envelope');
				addLoc(i0, file$1, 22, 20, 842);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-save btn-primary";
				setStyle(button0, "white-space", "nowrap");
				setStyle(button0, "margin-left", "10px");
				addLoc(button0, file$1, 17, 16, 623);
				setStyle(div1, "display", "flex");
				addLoc(div1, file$1, 14, 12, 498);
				i1.className = "fa fa-chevron-left";
				addLoc(i1, file$1, 32, 16, 1258);
				button1.className = "btn btn-save btn-default btn-back";
				addLoc(button1, file$1, 31, 12, 1191);
				setStyle(div2, "margin-top", "30px");
				addLoc(div2, file$1, 30, 8, 1147);
				div3.className = "span5";
				addLoc(div3, file$1, 1, 4, 37);
				div4.className = "row publish-signup";
				addLoc(div4, file$1, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div3);
				append(div3, div0);
				if_block0.m(div0, null);
				append(div3, text0);
				append(formblock._slotted.default, div1);
				append(div1, input);

				input.value = ctx.email;

				append(div1, text1);
				append(div1, button0);
				append(button0, i0);
				append(button0, text2);
				append(button0, raw0_before);
				raw0_before.insertAdjacentHTML("afterend", raw0_value);
				formblock._mount(div3, null);
				append(div3, text3);
				if (if_block1) if_block1.m(div3, null);
				append(div3, text4);
				append(div3, div2);
				append(div2, button1);
				append(button1, i1);
				append(button1, text5);
				append(button1, raw1_before);
				raw1_before.insertAdjacentHTML("afterend", raw1_value);
				append(div2, text6);
				if (if_block2) if_block2.m(div2, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(div0, null);
				}

				if (!input_updating && changed.email) input.value = ctx.email;
				if ((changed.signedUp) && i0_class_value !== (i0_class_value = "fa " + (ctx.signedUp ? 'fa-circle-o-notch fa-spin': 'fa-envelope'))) {
					i0.className = i0_class_value;
				}

				if (ctx.guest_text_below) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1$1(component, ctx);
						if_block1.c();
						if_block1.m(div3, text4);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.error) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$1(component, ctx);
						if_block2.c();
						if_block2.m(div2, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div4);
				}

				if_block0.d();
				removeListener(input, "input", input_input_handler);
				removeListener(button0, "click", click_handler);
				formblock.destroy();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
			}
		};
	}

	// (4:89) {:else}
	function create_else_block(component, ctx) {
		var h2, raw0_value = __('publish / guest / h1'), text, p, raw1_value = __('publish / guest / p');

		return {
			c: function create() {
				h2 = createElement("h2");
				text = createText("\n\n            ");
				p = createElement("p");
				addLoc(h2, file$1, 4, 12, 209);
				addLoc(p, file$1, 6, 12, 266);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				h2.innerHTML = raw0_value;
				insert(target, text, anchor);
				insert(target, p, anchor);
				p.innerHTML = raw1_value;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
					detachNode(text);
					detachNode(p);
				}
			}
		};
	}

	// (4:12) {#if guest_text_above}
	function create_if_block_2$1(component, ctx) {
		var each_anchor;

		var each_value = ctx.guest_text_above;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context(ctx, each_value, i));
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
				if (changed.guest_text_above) {
					each_value = ctx.guest_text_above;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
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

	// (4:35) {#each guest_text_above as text}
	function create_each_block_1(component, ctx) {
		var raw_value = ctx.text, raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.guest_text_above) && raw_value !== (raw_value = ctx.text)) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	// (29:8) {#if guest_text_below}
	function create_if_block_1$1(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.guest_text_below;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context_1(ctx, each_value_1, i));
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
				if (changed.guest_text_below) {
					each_value_1 = ctx.guest_text_below;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
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

	// (29:31) {#each guest_text_below as text}
	function create_each_block(component, ctx) {
		var raw_value = ctx.text, raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.guest_text_below) && raw_value !== (raw_value = ctx.text)) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	// (36:12) {#if error}
	function create_if_block$1(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.error);
				div.className = "alert alert-warning";
				addLoc(div, file$1, 36, 12, 1396);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.error) {
					setData(text, ctx.error);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function Guest(options) {
		this._debugName = '<Guest>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);
		if (!('guest_text_above' in this._state)) console.warn("<Guest> was created without expected data property 'guest_text_above'");
		if (!('email' in this._state)) console.warn("<Guest> was created without expected data property 'email'");
		if (!('signedUp' in this._state)) console.warn("<Guest> was created without expected data property 'signedUp'");
		if (!('guest_text_below' in this._state)) console.warn("<Guest> was created without expected data property 'guest_text_below'");
		if (!('error' in this._state)) console.warn("<Guest> was created without expected data property 'error'");
		this._intro = true;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Guest.prototype, protoDev);
	assign(Guest.prototype, methods);

	Guest.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* publish/pending-activation/PendingActivation.html generated by Svelte v2.16.1 */



	function data$2() {
	    return {
	        status: ''
	    };
	}
	var methods$1 = {
	    async resendActivation() {
	        this.set({
	            status: 'sending'
	        });

	        try {
	            await post('/v3/auth/resend-activation');
	            this.set({ status: 'success' });
	        } catch (err) {
	            this.set({ status: 'error' });
	        }
	    }
	};

	const file$2 = "publish/pending-activation/PendingActivation.html";

	function create_main_fragment$2(component, ctx) {
		var div1, h2, raw0_value = __("publish / pending-activation / h1"), text0, p, raw1_value = __("publish / pending-activation / p"), text1, div0;

		function select_block_type(ctx) {
			if (ctx.status == 'success') return create_if_block$2;
			if (ctx.status == 'error') return create_if_block_1$2;
			return create_else_block$1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				h2 = createElement("h2");
				text0 = createText("\n\n    ");
				p = createElement("p");
				text1 = createText("\n\n    ");
				div0 = createElement("div");
				if_block.c();
				addLoc(h2, file$2, 3, 4, 69);
				addLoc(p, file$2, 5, 4, 131);
				setStyle(div0, "margin-top", "20px");
				addLoc(div0, file$2, 7, 4, 190);
				addLoc(div1, file$2, 2, 0, 59);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, h2);
				h2.innerHTML = raw0_value;
				append(div1, text0);
				append(div1, p);
				p.innerHTML = raw1_value;
				append(div1, text1);
				append(div1, div0);
				if_block.m(div0, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div0, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if_block.d();
			}
		};
	}

	// (17:8) {:else}
	function create_else_block$1(component, ctx) {
		var button, i, i_class_value, text, raw_value = __("publish / pending-activation / resend"), raw_before;

		function click_handler(event) {
			component.resendActivation();
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text = createText("\n             \n            ");
				raw_before = createElement('noscript');
				i.className = i_class_value = "fa " + (ctx.status == 'sending' ? 'fa-spin fa-circle-o-notch' : 'fa-envelope');
				addLoc(i, file$2, 18, 12, 583);
				addListener(button, "click", click_handler);
				button.className = "btn btn-primary";
				addLoc(button, file$2, 17, 8, 508);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if ((changed.status) && i_class_value !== (i_class_value = "fa " + (ctx.status == 'sending' ? 'fa-spin fa-circle-o-notch' : 'fa-envelope'))) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (13:35) 
	function create_if_block_1$2(component, ctx) {
		var p, raw_value = __("publish / pending-activation / resend-error");

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 13, 8, 397);
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

	// (9:8) {#if status == 'success'}
	function create_if_block$2(component, ctx) {
		var p, raw_value = __("publish / pending-activation / resend-success");

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 9, 8, 264);
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

	function PendingActivation(options) {
		this._debugName = '<PendingActivation>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);
		if (!('status' in this._state)) console.warn("<PendingActivation> was created without expected data property 'status'");
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(PendingActivation.prototype, protoDev);
	assign(PendingActivation.prototype, methods$1);

	PendingActivation.prototype._checkReadOnly = function _checkReadOnly(newState) {
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

	/* publish/PublishLogic.html generated by Svelte v2.16.1 */



	function data$3() {
	    return {
	        embedTemplates: [],
	        embedType: 'responsive',
	        pluginShareurls: [],
	        shareurlType: 'default',
	        beforeExport: null,
	        guest_text_above: '',
	        guest_text_below: ''
	    };
	}
	function onstate({ current, changed }) {
	    if (changed.afterEmbed && current.afterEmbed) {
	        const p = current.afterEmbed[0];

	        Promise.all([loadStylesheet(p.css), loadScript(p.js)]).then(() => {
	            require([p.module], mod => {
	                this.set({
	                    beforeExport: mod.App
	                });
	            });
	        });
	    }
	}
	const file$3 = "publish/PublishLogic.html";

	function create_main_fragment$3(component, ctx) {
		var div;

		function select_block_type(ctx) {
			if (ctx.$user.isGuest) return create_if_block$3;
			if (!ctx.$user.isActivated) return create_if_block_1$3;
			return create_else_block$2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				addLoc(div, file$3, 2, 0, 88);
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
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block.d();
			}
		};
	}

	// (12:4) {:else}
	function create_else_block$2(component, ctx) {

		var publish_initial_data = {
		 	beforeExport: ctx.beforeExport,
		 	embed_templates: ctx.embedTemplates,
		 	embed_type: ctx.embedType,
		 	plugin_shareurls: ctx.pluginShareurls,
		 	shareurl_type: ctx.shareurlType
		 };
		var publish = new publish_js.Publish({
			root: component.root,
			store: component.store,
			data: publish_initial_data
		});

		return {
			c: function create() {
				publish._fragment.c();
			},

			m: function mount(target, anchor) {
				publish._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				var publish_changes = {};
				if (changed.beforeExport) publish_changes.beforeExport = ctx.beforeExport;
				if (changed.embedTemplates) publish_changes.embed_templates = ctx.embedTemplates;
				if (changed.embedType) publish_changes.embed_type = ctx.embedType;
				if (changed.pluginShareurls) publish_changes.plugin_shareurls = ctx.pluginShareurls;
				if (changed.shareurlType) publish_changes.shareurl_type = ctx.shareurlType;
				publish._set(publish_changes);
			},

			d: function destroy(detach) {
				publish.destroy(detach);
			}
		};
	}

	// (10:32) 
	function create_if_block_1$3(component, ctx) {

		var pendingactivation = new PendingActivation({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				pendingactivation._fragment.c();
			},

			m: function mount(target, anchor) {
				pendingactivation._mount(target, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				pendingactivation.destroy(detach);
			}
		};
	}

	// (4:4) {#if $user.isGuest}
	function create_if_block$3(component, ctx) {

		var guest_initial_data = {
		 	fromSvelte: "true",
		 	guest_text_above: ctx.guest_text_above,
		 	guest_text_below: ctx.guest_text_below
		 };
		var guest = new Guest({
			root: component.root,
			store: component.store,
			data: guest_initial_data
		});

		return {
			c: function create() {
				guest._fragment.c();
			},

			m: function mount(target, anchor) {
				guest._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				var guest_changes = {};
				if (changed.guest_text_above) guest_changes.guest_text_above = ctx.guest_text_above;
				if (changed.guest_text_below) guest_changes.guest_text_below = ctx.guest_text_below;
				guest._set(guest_changes);
			},

			d: function destroy(detach) {
				guest.destroy(detach);
			}
		};
	}

	function PublishLogic(options) {
		this._debugName = '<PublishLogic>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<PublishLogic> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign(this.store._init(["user"]), data$3()), options.data);
		this.store._add(this, ["user"]);
		if (!('$user' in this._state)) console.warn("<PublishLogic> was created without expected data property '$user'");
		if (!('guest_text_above' in this._state)) console.warn("<PublishLogic> was created without expected data property 'guest_text_above'");
		if (!('guest_text_below' in this._state)) console.warn("<PublishLogic> was created without expected data property 'guest_text_below'");
		if (!('beforeExport' in this._state)) console.warn("<PublishLogic> was created without expected data property 'beforeExport'");
		if (!('embedTemplates' in this._state)) console.warn("<PublishLogic> was created without expected data property 'embedTemplates'");
		if (!('embedType' in this._state)) console.warn("<PublishLogic> was created without expected data property 'embedType'");
		if (!('pluginShareurls' in this._state)) console.warn("<PublishLogic> was created without expected data property 'pluginShareurls'");
		if (!('shareurlType' in this._state)) console.warn("<PublishLogic> was created without expected data property 'shareurlType'");
		this._intro = true;

		this._handlers.state = [onstate];

		this._handlers.destroy = [removeFromStore];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$3(this, this._state);

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

	assign(PublishLogic.prototype, protoDev);

	PublishLogic.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	function observe(key, callback, opts) {
	    var fn = callback.bind(this);
	    if (!opts || opts.init !== false) {
	        fn(this.get()[key]);
	    }
	    return this.on(opts && opts.defer ? 'update' : 'state', function (_a) {
	        var changed = _a.changed, current = _a.current, previous = _a.previous;
	        if (changed[key])
	            fn(current[key], previous && previous[key]);
	    });
	}

	/* publish/PublishSidebar.html generated by Svelte v2.16.1 */



	function data$4() {
	    return {
	        PublishLogic
	    };
	}
	function oncreate() {
	    this.store.observe = observe;
	    this.store.observe('publishLogic', cfg => {
	        if (cfg && cfg.mod) {
	            loadStylesheet(cfg.css);
	            loadScript(cfg.src, () => {
	                require([cfg.mod], mod => {
	                    this.set({ PublishLogic: mod.App });
	                    this.refs.publish.set(cfg.data);
	                });
	            });
	        } else {
	            this.set({ PublishLogic });
	            this.refs.publish.set(cfg.data);
	        }
	    });
	}
	const file$4 = "publish/PublishSidebar.html";

	function create_main_fragment$4(component, ctx) {
		var div1, div0;

		var switch_value = ctx.PublishLogic;

		function switch_props(ctx) {
			return {
				root: component.root,
				store: component.store
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props());
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				if (switch_instance) switch_instance._fragment.c();
				div0.className = "publish-step is-published";
				addLoc(div0, file$4, 2, 4, 97);
				div1.className = "dw-create-publish";
				addLoc(div1, file$4, 1, 0, 61);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);

				if (switch_instance) {
					switch_instance._mount(div0, null);
					component.refs.publish = switch_instance;
				}
			},

			p: function update(changed, ctx) {
				if (switch_value !== (switch_value = ctx.PublishLogic)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						switch_instance._fragment.c();
						switch_instance._mount(div0, null);

						component.refs.publish = switch_instance;
					} else {
						switch_instance = null;
						if (component.refs.publish === switch_instance) {
							component.refs.publish = null;
						}
					}
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (switch_instance) switch_instance.destroy();
			}
		};
	}

	function PublishSidebar(options) {
		this._debugName = '<PublishSidebar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$4(), options.data);
		if (!('PublishLogic' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'PublishLogic'");
		this._intro = true;

		this._fragment = create_main_fragment$4(this, this._state);

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

	assign(PublishSidebar.prototype, protoDev);

	PublishSidebar.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	var main = { PublishSidebar };

	return main;

})));
//# sourceMappingURL=sidebar.js.map
