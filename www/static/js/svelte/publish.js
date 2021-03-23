(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.publish = factory());
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

	function detachAfter(before) {
		while (before.nextSibling) {
			before.parentNode.removeChild(before.nextSibling);
		}
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

	/* home/david/Projects/core/libs/controls/v2/HelpDisplay.html generated by Svelte v2.16.1 */

	function data() {
	    return {
	        visible: false,
	        class: ''
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

	const file = "home/david/Projects/core/libs/controls/v2/HelpDisplay.html";

	function create_main_fragment(component, ctx) {
		var div, span, text_1, div_class_value;

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
				addLoc(span, file, 1, 4, 77);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = div_class_value = "help " + ctx.class + " svelte-9o0fpa";
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

				if ((changed.class) && div_class_value !== (div_class_value = "help " + ctx.class + " svelte-9o0fpa")) {
					div.className = div_class_value;
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
				addLoc(i, file, 4, 8, 162);
				div.className = "content svelte-9o0fpa";
				addLoc(div, file, 3, 4, 132);
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

	function HelpDisplay(options) {
		this._debugName = '<HelpDisplay>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('class' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'class'");
		if (!('visible' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'visible'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(HelpDisplay.prototype, protoDev);
	assign(HelpDisplay.prototype, methods);

	HelpDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
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
	function get$2(object, key = null, _default = null) {
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

	/* publish/Action.html generated by Svelte v2.16.1 */

	function data$1() {
	    return { loading: false };
	}
	const file$1 = "publish/Action.html";

	function create_main_fragment$1(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.loading) && create_if_block$1();

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
				if (ctx.loading) {
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

	// (2:0) {#if loading}
	function create_if_block$1(component, ctx) {
		var p, i, text;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText(" loading...");
				i.className = "fa fa-spinner fa-pulse fa-fw";
				addLoc(i, file$1, 2, 21, 60);
				p.className = "mini-help";
				addLoc(p, file$1, 2, 0, 39);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function Action(options) {
		this._debugName = '<Action>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);
		if (!('loading' in this._state)) console.warn("<Action> was created without expected data property 'loading'");
		this._intro = true;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Action.prototype, protoDev);

	Action.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* publish/Publish.html generated by Svelte v2.16.1 */



	let initial_auto_publish = true;

	function shareUrl({ shareurl_type, $id, $publicUrl, $metadata, plugin_shareurls, published }) {
	    if (!published) return 'https://www.datawrapper.de/...';
	    if (shareurl_type === 'default') return $publicUrl;
	    let url = '';

	    plugin_shareurls.forEach(t => {
	        if (t.id === shareurl_type) {
	            url = t.url.replace(/%chart_id%/g, $id);

	            url = url.replace(/%(.*?)%/g, (match, path) => {
	                return get$2(
	                    {
	                        id: $id,
	                        metadata: $metadata
	                    },
	                    path
	                );
	            });
	        }
	    });
	    return url;
	}
	function sortedChartActions({ chartActions, $actions }) {
	    return chartActions
	        .concat($actions)
	        .filter(a => a.id !== 'publish-s3')
	        .sort((a, b) => a.order - b.order);
	}
	function publishWait({ publishStarted, now }) {
	    return publishStarted > 0 ? now - publishStarted : 0;
	}
	function data$2() {
	    return {
	        active_action: '',
	        embed_templates: [],
	        plugin_shareurls: [],
	        published: false,
	        publishing: false,
	        publishStarted: 0,
	        needs_republish: false,
	        publish_error: false,
	        auto_publish: false,
	        progress: [],
	        shareurl_type: 'default',
	        embed_type: 'responsive',
	        copy_success: false,
	        Action,
	        chartActions: [
	            {
	                id: 'duplicate',
	                icon: 'code-fork',
	                title: __('Duplicate'),
	                order: 500,
	                action: 'duplicate'
	            }
	        ],
	        publishHed: '',
	        publishIntro: '',
	        beforeExport: null,
	        exportHed: __('publish / export-duplicate'),
	        exportIntro: __('publish / export-duplicate / intro'),
	        embedCode: '',
	        statusUrl: false
	    };
	}
	var methods$1 = {
	    publish() {
	        this.set({
	            publishing: true,
	            publishStarted: new Date().getTime(),
	            now: new Date().getTime(),
	            progress: [],
	            publish_error: false
	        });

	        const chart = this.store;

	        trackEvent('Chart Editor', 'publish');

	        const chartId = chart.get().id;

	        chart.store(() => {
	            this.set({
	                statusUrl: `/v3/charts/${chartId}/publish/status/${
                    chart.get().publicVersion
                }`
	            });
	            // publish chart
	            httpReq
	                .post(`/v3/charts/${chartId}/publish`)
	                .then(res => {
	                    this.set({
	                        published: true,
	                        progress: ['done']
	                    });
	                    httpReq.get(`/v3/charts/${chartId}`).then(res => {
	                        trackEvent('Chart Editor', 'publish-success');
	                        this.publishFinished(res);
	                    });
	                })
	                .catch(error => {
	                    this.set({
	                        publish_error: error.message
	                    });
	                    trackEvent('Chart Editor', 'publish-error', error.message);
	                });

	            setTimeout(() => {
	                const { publishing } = this.get();
	                if (publishing) this.updateStatus();
	            }, 1000);
	        });
	    },

	    updateStatus() {
	        const { statusUrl } = this.get();
	        if (!statusUrl) return;
	        httpReq.get(statusUrl).then(res => {
	            this.set({
	                progress: res.progress || [],
	                now: new Date().getTime()
	            });
	            const { publishing } = this.get();
	            if (publishing) {
	                setTimeout(() => {
	                    this.updateStatus();
	                }, 500);
	            }
	        });
	    },

	    publishFinished(chartInfo) {
	        this.set({
	            progress: ['done'],
	            published: true,
	            publishStarted: 0,
	            needs_republish: false
	        });
	        this.store.set({
	            lastEditStep: 5
	        });

	        window.parent.postMessage(
	            {
	                source: 'datawrapper',
	                type: 'chart-publish',
	                chartId: chartInfo.id
	            },
	            '*'
	        );

	        // give user 1s to read the success message
	        setTimeout(() => this.set({ publishing: false }), 1000);
	        this.store.set(chartInfo);
	    },

	    setEmbedCode() {
	        const chart = this.store;
	        const state = this.get();
	        if (!state) return;
	        const embedType = state.embed_type ? `embed-method-${state.embed_type}` : null;

	        const { publicUrl } = chart.get();
	        const embedCodes = chart.getMetadata('publish.embed-codes');
	        const embedHeight = chart.getMetadata('publish.embed-height');

	        this.set({
	            embedCode:
	                embedCodes && embedCodes[embedType]
	                    ? embedCodes[embedType]
	                    : embedType === 'custom'
	                    ? ''
	                    : `<iframe src="${publicUrl}" width="100%" height="${embedHeight}" scrolling="no" frameborder="0" allowtransparency="true"></iframe>`
	        });
	    },

	    copy() {
	        const me = this;
	        me.refs.embedInput.select();
	        try {
	            var successful = document.execCommand('copy');
	            if (successful) {
	                trackEvent('Chart Editor', 'embedcode-copy');
	                me.set({ copy_success: true });
	                setTimeout(() => me.set({ copy_success: false }), 300);
	            }
	        } catch (err) {
	            // console.log('Oops, unable to copy');
	        }
	    },

	    select(action, event) {
	        event.preventDefault();
	        // set hash which is used to show the action module
	        window.location.hash = action.id;

	        const { active_action } = this.get();
	        if (action.id === active_action) {
	            // unselect current action
	            this.refs.action.set({ show: false });
	            return this.set({ active_action: '', Action });
	        }
	        this.set({ active_action: action.id });
	        if (action.mod) {
	            if (action.mod.App) {
	                this.refs.action.set({ show: false });
	                this.set({ Action: action.mod.App });
	                if (action.mod.data) this.refs.action.set(action.mod.data);
	                this.refs.action.set({ show: true });
	            } else {
	                // todo: show loading indicator
	                this.set({ Action });
	                this.refs.action.set({ loading: true });
	                if (action.mod.css) {
	                    loadStylesheet(action.mod.css);
	                }
	                loadScript(action.mod.src, () => {
	                    setTimeout(() => {
	                        require([action.mod.id], mod => {
	                            // todo: HIDE loading indicator
	                            Object.assign(action.mod, mod);
	                            this.set({ Action: action.mod.App });
	                            this.refs.action.set({ show: true });
	                            if (mod.init) mod.init(this.refs.action);
	                            if (action.mod.data) this.refs.action.set(action.mod.data);
	                        });
	                    }, 200);
	                });
	            }
	        } else if (action.action && this[action.action]) {
	            this.set({ Action });
	            this[action.action]();
	        } else if (typeof action.action === 'function') {
	            this.set({ Action });
	            action.action();
	        }
	    },

	    duplicate() {
	        const { id } = this.store.get();
	        trackEvent('Chart Editor', 'duplicate');
	        httpReq.post(`/v3/charts/${id}/copy`).then(res => {
	            // redirect to copied chart
	            window.location.href = `/edit/${res.id}/visualize`;
	        });
	    }
	};

	function oncreate() {
	    const { lastEditStep } = this.store.get();
	    this.set({ published: lastEditStep > 4 });
	    // store reference to publish step
	    window.dw.backend.fire('edit.publish.oncreate', this);
	    // watch changes
	    this.setEmbedCode();
	    const chart = this.store;
	    chart.observeDeep('metadata.publish.embed-codes', () => this.setEmbedCode());
	    chart.observeDeep('metadata.publish.embed-height', () => this.setEmbedCode());
	    chart.observeDeep('publicUrl', () => this.setEmbedCode());
	}
	function onstate({ changed, current }) {
	    const userDataReady = window.dw && window.dw.backend && window.dw.backend.setUserData;
	    if (changed.embed_type && userDataReady) {
	        const data = window.dw.backend.__userData;
	        if (!current.embed_type || !data) return;
	        data.embed_type = current.embed_type;
	        window.dw.backend.setUserData(data);
	    }
	    if (changed.embed_type) {
	        this.setEmbedCode();
	    }
	    if (changed.shareurl_type && userDataReady) {
	        const data = window.dw.backend.__userData;
	        if (!current.shareurl_type || !data) return;
	        data.shareurl_type = current.shareurl_type;
	        window.dw.backend.setUserData(data);
	    }
	    if (changed.published) {
	        const publishStep = window.document.querySelector(
	            '.dw-create-publish .publish-step'
	        );
	        if (publishStep) {
	            publishStep.classList[current.published ? 'add' : 'remove']('is-published');
	        }
	    }
	    if (changed.auto_publish) {
	        if (current.auto_publish && initial_auto_publish) {
	            this.publish();
	            initial_auto_publish = false;
	            window.history.replaceState('', '', window.location.pathname);
	        }
	    }
	}
	const file$2 = "publish/Publish.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.select(ctx.action, event);
	}

	function get_each3_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.action = list[i];
		return child_ctx;
	}

	function get_each2_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tpl = list[i];
		return child_ctx;
	}

	function get_each1_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tpl = list[i];
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tpl = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.step = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$2(component, ctx) {
		var div16, text0, text1, button0, button0_class_value, text2, text3, text4, text5, text6, text7, div13, h20, raw0_value = __('publish / share-embed'), text8, div5, i0, text9, div3, div1, b0, raw1_value = __('publish / share-url'), text10, div0, label, input, text11, raw2_value = __('publish / share-url / fullscreen'), raw2_before, text12, text13, div2, a, text14, text15, div4, raw3_value = __('publish / help / share-url'), text16, div12, i1, text17, div10, div7, b1, raw4_value = __('publish / embed'), text18, div6, text19, div9, textarea, text20, button1, i2, text21, text22_value = __('publish / copy'), text22, text23, div8, text24_value = __('publish / copy-success'), text24, div8_class_value, text25, div11, raw5_value = __('publish / embed / help'), raw5_after, text26, div13_class_value, text27, text28, div15, div14, h21, text29, text30, ul, text31;

		var if_block0 = (ctx.publishHed) && create_if_block_12(component, ctx);

		function select_block_type(ctx) {
			if (ctx.publishIntro) return create_if_block_10;
			if (ctx.published) return create_if_block_11;
			return create_else_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.published) return create_if_block_9;
			return create_else_block;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block2 = current_block_type_1(component, ctx);

		function click_handler(event) {
			component.publish();
		}

		var if_block3 = (!ctx.published) && create_if_block_8();

		var if_block4 = (ctx.needs_republish && !ctx.publishing) && create_if_block_7();

		var if_block5 = (ctx.published && !ctx.needs_republish && ctx.progress && ctx.progress.includes('done') &&
	    !ctx.publishing) && create_if_block_6();

		var if_block6 = (ctx.publish_error) && create_if_block_5(component, ctx);

		var if_block7 = (ctx.publishing) && create_if_block_3(component, ctx);

		function input_change_handler() {
			component.set({ shareurl_type: input.__value });
		}

		var each0_value = ctx.plugin_shareurls;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_3(component, get_each0_context(ctx, each0_value, i));
		}

		var helpdisplay0 = new HelpDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		var each1_value = ctx.embed_templates;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block_2(component, get_each1_context(ctx, each1_value, i));
		}

		function click_handler_1(event) {
			component.copy(ctx.embedCode);
		}

		var each2_value = ctx.embed_templates.slice(2);

		var each2_blocks = [];

		for (var i = 0; i < each2_value.length; i += 1) {
			each2_blocks[i] = create_each_block_1(component, get_each2_context(ctx, each2_value, i));
		}

		var helpdisplay1 = new HelpDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		var switch_value = ctx.beforeExport;

		function switch_props(ctx) {
			return {
				root: component.root,
				store: component.store
			};
		}

		if (switch_value) {
			var switch_instance0 = new switch_value(switch_props());
		}

		var if_block8 = (ctx.exportIntro) && create_if_block_2(component, ctx);

		var each3_value = ctx.sortedChartActions;

		var each3_blocks = [];

		for (var i = 0; i < each3_value.length; i += 1) {
			each3_blocks[i] = create_each_block(component, get_each3_context(ctx, each3_value, i));
		}

		var switch_value_1 = ctx.Action;

		function switch_props_1(ctx) {
			var switch_instance1_initial_data = {
			 	visible: true,
			 	show: false
			 };
			return {
				root: component.root,
				store: component.store,
				data: switch_instance1_initial_data
			};
		}

		if (switch_value_1) {
			var switch_instance1 = new switch_value_1(switch_props_1());
		}

		return {
			c: function create() {
				div16 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText(" ");
				if_block1.c();
				text1 = createText("\n\n    ");
				button0 = createElement("button");
				if_block2.c();
				text2 = createText("\n\n    ");
				if (if_block3) if_block3.c();
				text3 = createText(" ");
				if (if_block4) if_block4.c();
				text4 = createText(" ");
				if (if_block5) if_block5.c();
				text5 = createText(" ");
				if (if_block6) if_block6.c();
				text6 = createText(" ");
				if (if_block7) if_block7.c();
				text7 = createText("\n\n    ");
				div13 = createElement("div");
				h20 = createElement("h2");
				text8 = createText("\n        ");
				div5 = createElement("div");
				i0 = createElement("i");
				text9 = createText("\n            ");
				div3 = createElement("div");
				div1 = createElement("div");
				b0 = createElement("b");
				text10 = createText("\n                    ");
				div0 = createElement("div");
				label = createElement("label");
				input = createElement("input");
				text11 = createText("\n                            ");
				raw2_before = createElement('noscript');
				text12 = createText("\n                        ");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text13 = createText("\n                ");
				div2 = createElement("div");
				a = createElement("a");
				text14 = createText(ctx.shareUrl);
				text15 = createText("\n            ");
				div4 = createElement("div");
				helpdisplay0._fragment.c();
				text16 = createText("\n\n        ");
				div12 = createElement("div");
				i1 = createElement("i");
				text17 = createText("\n            ");
				div10 = createElement("div");
				div7 = createElement("div");
				b1 = createElement("b");
				text18 = createText("\n                    ");
				div6 = createElement("div");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text19 = createText("\n                ");
				div9 = createElement("div");
				textarea = createElement("textarea");
				text20 = createText("\n                    ");
				button1 = createElement("button");
				i2 = createElement("i");
				text21 = createText(" ");
				text22 = createText(text22_value);
				text23 = createText("\n                    ");
				div8 = createElement("div");
				text24 = createText(text24_value);
				text25 = createText("\n            ");
				div11 = createElement("div");
				raw5_after = createElement('noscript');
				text26 = createText(" ");

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].c();
				}

				helpdisplay1._fragment.c();
				text27 = createText("\n\n    \n    ");
				if (switch_instance0) switch_instance0._fragment.c();
				text28 = createText("\n\n    \n    ");
				div15 = createElement("div");
				div14 = createElement("div");
				h21 = createElement("h2");
				text29 = createText("\n            ");
				if (if_block8) if_block8.c();
				text30 = createText("\n\n        ");
				ul = createElement("ul");

				for (var i = 0; i < each3_blocks.length; i += 1) {
					each3_blocks[i].c();
				}

				text31 = createText("\n\n        ");
				if (switch_instance1) switch_instance1._fragment.c();
				addListener(button0, "click", click_handler);
				button0.disabled = ctx.publishing;
				button0.className = button0_class_value = "btn-publish btn btn-primary btn-large " + (ctx.published?'':'btn-first-publish') + " svelte-77tncr";
				addLoc(button0, file$2, 12, 4, 354);
				addLoc(h20, file$2, 71, 8, 2404);
				i0.className = "icon fa fa-link fa-fw";
				addLoc(i0, file$2, 73, 12, 2490);
				addLoc(b0, file$2, 76, 20, 2612);
				component._bindingGroups[0].push(input);
				addListener(input, "change", input_change_handler);
				input.__value = "default";
				input.value = input.__value;
				setAttribute(input, "type", "radio");
				input.name = "url-type";
				input.className = "svelte-77tncr";
				addLoc(input, file$2, 79, 28, 2776);
				label.className = "radio";
				addLoc(label, file$2, 78, 24, 2726);
				div0.className = "embed-options svelte-77tncr";
				addLoc(div0, file$2, 77, 20, 2674);
				div1.className = "h";
				addLoc(div1, file$2, 75, 16, 2576);
				a.target = "_blank";
				a.className = "share-url svelte-77tncr";
				a.href = ctx.shareUrl;
				addLoc(a, file$2, 101, 20, 3707);
				div2.className = "inpt";
				addLoc(div2, file$2, 100, 16, 3668);
				div3.className = "ctrls";
				addLoc(div3, file$2, 74, 12, 2540);
				addLoc(div4, file$2, 105, 16, 3861);
				div5.className = "block";
				addLoc(div5, file$2, 72, 8, 2458);
				i1.className = "icon fa fa-code fa-fw";
				addLoc(i1, file$2, 110, 12, 3997);
				addLoc(b1, file$2, 113, 20, 4119);
				div6.className = "embed-options svelte-77tncr";
				addLoc(div6, file$2, 114, 20, 4177);
				div7.className = "h";
				addLoc(div7, file$2, 112, 16, 4083);
				setAttribute(textarea, "type", "text");
				textarea.className = "input embed-code svelte-77tncr";
				textarea.readOnly = true;
				textarea.value = ctx.embedCode;
				addLoc(textarea, file$2, 124, 20, 4615);
				i2.className = "fa fa-copy";
				addLoc(i2, file$2, 132, 24, 4973);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-copy";
				button1.title = "copy";
				addLoc(button1, file$2, 131, 20, 4879);
				div8.className = div8_class_value = "copy-success " + (ctx.copy_success ? 'show':'') + " svelte-77tncr";
				addLoc(div8, file$2, 134, 20, 5075);
				div9.className = "inpt";
				addLoc(div9, file$2, 123, 16, 4576);
				div10.className = "ctrls";
				addLoc(div10, file$2, 111, 12, 4047);
				addLoc(div11, file$2, 140, 16, 5297);
				div12.className = "block";
				addLoc(div12, file$2, 109, 8, 3965);
				setStyle(div13, "margin-top", "30px");
				div13.className = div13_class_value = ctx.published?'':'inactive';
				addLoc(div13, file$2, 70, 4, 2330);
				h21.className = "pad-top";
				addLoc(h21, file$2, 155, 12, 5734);
				addLoc(div14, file$2, 154, 8, 5716);
				ul.className = "chart-actions";
				addLoc(ul, file$2, 161, 8, 5888);
				div15.className = "export-and-duplicate";
				addLoc(div15, file$2, 153, 4, 5673);
				addLoc(div16, file$2, 1, 0, 26);
			},

			m: function mount(target, anchor) {
				insert(target, div16, anchor);
				if (if_block0) if_block0.m(div16, null);
				append(div16, text0);
				if_block1.m(div16, null);
				append(div16, text1);
				append(div16, button0);
				if_block2.m(button0, null);
				append(div16, text2);
				if (if_block3) if_block3.m(div16, null);
				append(div16, text3);
				if (if_block4) if_block4.m(div16, null);
				append(div16, text4);
				if (if_block5) if_block5.m(div16, null);
				append(div16, text5);
				if (if_block6) if_block6.m(div16, null);
				append(div16, text6);
				if (if_block7) if_block7.m(div16, null);
				append(div16, text7);
				append(div16, div13);
				append(div13, h20);
				h20.innerHTML = raw0_value;
				append(div13, text8);
				append(div13, div5);
				append(div5, i0);
				append(div5, text9);
				append(div5, div3);
				append(div3, div1);
				append(div1, b0);
				b0.innerHTML = raw1_value;
				append(div1, text10);
				append(div1, div0);
				append(div0, label);
				append(label, input);

				input.checked = input.__value === ctx.shareurl_type;

				append(label, text11);
				append(label, raw2_before);
				raw2_before.insertAdjacentHTML("afterend", raw2_value);
				append(div0, text12);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(div0, null);
				}

				append(div3, text13);
				append(div3, div2);
				append(div2, a);
				append(a, text14);
				append(div5, text15);
				append(helpdisplay0._slotted.default, div4);
				div4.innerHTML = raw3_value;
				helpdisplay0._mount(div5, null);
				append(div13, text16);
				append(div13, div12);
				append(div12, i1);
				append(div12, text17);
				append(div12, div10);
				append(div10, div7);
				append(div7, b1);
				b1.innerHTML = raw4_value;
				append(div7, text18);
				append(div7, div6);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(div6, null);
				}

				append(div10, text19);
				append(div10, div9);
				append(div9, textarea);
				component.refs.embedInput = textarea;
				append(div9, text20);
				append(div9, button1);
				append(button1, i2);
				append(button1, text21);
				append(button1, text22);
				append(div9, text23);
				append(div9, div8);
				append(div8, text24);
				append(div12, text25);
				append(helpdisplay1._slotted.default, div11);
				append(div11, raw5_after);
				raw5_after.insertAdjacentHTML("beforebegin", raw5_value);
				append(div11, text26);

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].m(div11, null);
				}

				helpdisplay1._mount(div12, null);
				append(div16, text27);

				if (switch_instance0) {
					switch_instance0._mount(div16, null);
				}

				append(div16, text28);
				append(div16, div15);
				append(div15, div14);
				append(div14, h21);
				h21.innerHTML = ctx.exportHed;
				append(div14, text29);
				if (if_block8) if_block8.m(div14, null);
				append(div15, text30);
				append(div15, ul);

				for (var i = 0; i < each3_blocks.length; i += 1) {
					each3_blocks[i].m(ul, null);
				}

				append(div15, text31);

				if (switch_instance1) {
					switch_instance1._mount(div15, null);
					component.refs.action = switch_instance1;
				}
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.publishHed) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_12(component, ctx);
						if_block0.c();
						if_block0.m(div16, text0);
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
					if_block1.m(div16, text1);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type_1(component, ctx);
					if_block2.c();
					if_block2.m(button0, null);
				}

				if (changed.publishing) {
					button0.disabled = ctx.publishing;
				}

				if ((changed.published) && button0_class_value !== (button0_class_value = "btn-publish btn btn-primary btn-large " + (ctx.published?'':'btn-first-publish') + " svelte-77tncr")) {
					button0.className = button0_class_value;
				}

				if (!ctx.published) {
					if (!if_block3) {
						if_block3 = create_if_block_8();
						if_block3.c();
						if_block3.m(div16, text3);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (ctx.needs_republish && !ctx.publishing) {
					if (!if_block4) {
						if_block4 = create_if_block_7();
						if_block4.c();
						if_block4.m(div16, text4);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if (ctx.published && !ctx.needs_republish && ctx.progress && ctx.progress.includes('done') &&
	    !ctx.publishing) {
					if (!if_block5) {
						if_block5 = create_if_block_6();
						if_block5.c();
						if_block5.m(div16, text5);
					}
				} else if (if_block5) {
					if_block5.d(1);
					if_block5 = null;
				}

				if (ctx.publish_error) {
					if (if_block6) {
						if_block6.p(changed, ctx);
					} else {
						if_block6 = create_if_block_5(component, ctx);
						if_block6.c();
						if_block6.m(div16, text6);
					}
				} else if (if_block6) {
					if_block6.d(1);
					if_block6 = null;
				}

				if (ctx.publishing) {
					if (if_block7) {
						if_block7.p(changed, ctx);
					} else {
						if_block7 = create_if_block_3(component, ctx);
						if_block7.c();
						if_block7.m(div16, text7);
					}
				} else if (if_block7) {
					if_block7.d(1);
					if_block7 = null;
				}

				if (changed.shareurl_type) input.checked = input.__value === ctx.shareurl_type;

				if (changed.plugin_shareurls || changed.shareurl_type) {
					each0_value = ctx.plugin_shareurls;

					for (var i = 0; i < each0_value.length; i += 1) {
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_3(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(div0, null);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (changed.shareUrl) {
					setData(text14, ctx.shareUrl);
					a.href = ctx.shareUrl;
				}

				if (changed.embed_templates || changed.embed_type) {
					each1_value = ctx.embed_templates;

					for (var i = 0; i < each1_value.length; i += 1) {
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block_2(component, child_ctx);
							each1_blocks[i].c();
							each1_blocks[i].m(div6, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				if (changed.embedCode) {
					textarea.value = ctx.embedCode;
				}

				if ((changed.copy_success) && div8_class_value !== (div8_class_value = "copy-success " + (ctx.copy_success ? 'show':'') + " svelte-77tncr")) {
					div8.className = div8_class_value;
				}

				if (changed.embed_templates) {
					each2_value = ctx.embed_templates.slice(2);

					for (var i = 0; i < each2_value.length; i += 1) {
						const child_ctx = get_each2_context(ctx, each2_value, i);

						if (each2_blocks[i]) {
							each2_blocks[i].p(changed, child_ctx);
						} else {
							each2_blocks[i] = create_each_block_1(component, child_ctx);
							each2_blocks[i].c();
							each2_blocks[i].m(div11, null);
						}
					}

					for (; i < each2_blocks.length; i += 1) {
						each2_blocks[i].d(1);
					}
					each2_blocks.length = each2_value.length;
				}

				if ((changed.published) && div13_class_value !== (div13_class_value = ctx.published?'':'inactive')) {
					div13.className = div13_class_value;
				}

				if (switch_value !== (switch_value = ctx.beforeExport)) {
					if (switch_instance0) {
						switch_instance0.destroy();
					}

					if (switch_value) {
						switch_instance0 = new switch_value(switch_props());
						switch_instance0._fragment.c();
						switch_instance0._mount(div16, text28);
					} else {
						switch_instance0 = null;
					}
				}

				if (changed.exportHed) {
					h21.innerHTML = ctx.exportHed;
				}

				if (ctx.exportIntro) {
					if (if_block8) {
						if_block8.p(changed, ctx);
					} else {
						if_block8 = create_if_block_2(component, ctx);
						if_block8.c();
						if_block8.m(div14, null);
					}
				} else if (if_block8) {
					if_block8.d(1);
					if_block8 = null;
				}

				if (changed.sortedChartActions || changed.active_action) {
					each3_value = ctx.sortedChartActions;

					for (var i = 0; i < each3_value.length; i += 1) {
						const child_ctx = get_each3_context(ctx, each3_value, i);

						if (each3_blocks[i]) {
							each3_blocks[i].p(changed, child_ctx);
						} else {
							each3_blocks[i] = create_each_block(component, child_ctx);
							each3_blocks[i].c();
							each3_blocks[i].m(ul, null);
						}
					}

					for (; i < each3_blocks.length; i += 1) {
						each3_blocks[i].d(1);
					}
					each3_blocks.length = each3_value.length;
				}

				if (switch_value_1 !== (switch_value_1 = ctx.Action)) {
					if (switch_instance1) {
						switch_instance1.destroy();
					}

					if (switch_value_1) {
						switch_instance1 = new switch_value_1(switch_props_1());
						switch_instance1._fragment.c();
						switch_instance1._mount(div15, null);

						component.refs.action = switch_instance1;
					} else {
						switch_instance1 = null;
						if (component.refs.action === switch_instance1) {
							component.refs.action = null;
						}
					}
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div16);
				}

				if (if_block0) if_block0.d();
				if_block1.d();
				if_block2.d();
				removeListener(button0, "click", click_handler);
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();
				if (if_block5) if_block5.d();
				if (if_block6) if_block6.d();
				if (if_block7) if_block7.d();
				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);

				destroyEach(each0_blocks, detach);

				helpdisplay0.destroy();

				destroyEach(each1_blocks, detach);

				if (component.refs.embedInput === textarea) component.refs.embedInput = null;
				removeListener(button1, "click", click_handler_1);

				destroyEach(each2_blocks, detach);

				helpdisplay1.destroy();
				if (switch_instance0) switch_instance0.destroy();
				if (if_block8) if_block8.d();

				destroyEach(each3_blocks, detach);

				if (switch_instance1) switch_instance1.destroy();
			}
		};
	}

	// (3:4) {#if publishHed}
	function create_if_block_12(component, ctx) {
		var h2;

		return {
			c: function create() {
				h2 = createElement("h2");
				h2.className = "pad-top";
				addLoc(h2, file$2, 3, 4, 57);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				h2.innerHTML = ctx.publishHed;
			},

			p: function update(changed, ctx) {
				if (changed.publishHed) {
					h2.innerHTML = ctx.publishHed;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
				}
			}
		};
	}

	// (9:4) {:else}
	function create_else_block_1(component, ctx) {
		var p, raw_value = __('publish / publish-intro');

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "margin-bottom", "20px");
				addLoc(p, file$2, 9, 4, 258);
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

	// (7:12) {#if published}
	function create_if_block_11(component, ctx) {
		var p, raw_value = __('publish / republish-intro');

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 7, 4, 194);
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

	// (5:10) {#if publishIntro}
	function create_if_block_10(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 5, 4, 134);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.publishIntro;
			},

			p: function update(changed, ctx) {
				if (changed.publishIntro) {
					p.innerHTML = ctx.publishIntro;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (23:8) {:else}
	function create_else_block(component, ctx) {
		var span1, i, i_class_value, text0, span0, text1_value = __('publish / publish-btn'), text1;

		return {
			c: function create() {
				span1 = createElement("span");
				i = createElement("i");
				text0 = createText("\n            ");
				span0 = createElement("span");
				text1 = createText(text1_value);
				i.className = i_class_value = "fa fa-fw " + (ctx.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-77tncr";
				addLoc(i, file$2, 24, 13, 804);
				span0.className = "title svelte-77tncr";
				addLoc(span0, file$2, 25, 12, 897);
				span1.className = "publish";
				addLoc(span1, file$2, 23, 8, 769);
			},

			m: function mount(target, anchor) {
				insert(target, span1, anchor);
				append(span1, i);
				append(span1, text0);
				append(span1, span0);
				append(span0, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw " + (ctx.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-77tncr")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span1);
				}
			}
		};
	}

	// (18:8) {#if published}
	function create_if_block_9(component, ctx) {
		var span1, i, i_class_value, text0, span0, text1_value = __('publish / republish-btn'), text1;

		return {
			c: function create() {
				span1 = createElement("span");
				i = createElement("i");
				text0 = createText("\n            ");
				span0 = createElement("span");
				text1 = createText(text1_value);
				i.className = i_class_value = "fa fa-fw fa-refresh " + (ctx.publishing ? 'fa-spin' : '') + " svelte-77tncr";
				addLoc(i, file$2, 19, 13, 590);
				span0.className = "title svelte-77tncr";
				addLoc(span0, file$2, 20, 12, 668);
				span1.className = "re-publish";
				addLoc(span1, file$2, 18, 8, 552);
			},

			m: function mount(target, anchor) {
				insert(target, span1, anchor);
				append(span1, i);
				append(span1, text0);
				append(span1, span0);
				append(span0, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw fa-refresh " + (ctx.publishing ? 'fa-spin' : '') + " svelte-77tncr")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span1);
				}
			}
		};
	}

	// (31:4) {#if !published}
	function create_if_block_8(component, ctx) {
		var div2, div0, i, text, div1, raw_value = __('publish / publish-btn-intro');

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				i = createElement("i");
				text = createText("\n        ");
				div1 = createElement("div");
				i.className = "fa fa-chevron-left svelte-77tncr";
				addLoc(i, file$2, 33, 12, 1094);
				div0.className = "arrow svelte-77tncr";
				addLoc(div0, file$2, 32, 8, 1062);
				div1.className = "text svelte-77tncr";
				addLoc(div1, file$2, 35, 8, 1152);
				div2.className = "publish-intro svelte-77tncr";
				addLoc(div2, file$2, 31, 4, 1026);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div0, i);
				append(div2, text);
				append(div2, div1);
				div1.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}
			}
		};
	}

	// (40:10) {#if needs_republish && !publishing}
	function create_if_block_7(component, ctx) {
		var div, raw_value = __('publish / republish-alert');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "btn-aside alert svelte-77tncr";
				addLoc(div, file$2, 40, 4, 1303);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (44:10) {#if published && !needs_republish && progress && progress.includes('done') &&     !publishing}
	function create_if_block_6(component, ctx) {
		var div, raw_value = __('publish / publish-success');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-success svelte-77tncr";
				addLoc(div, file$2, 45, 4, 1503);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (49:10) {#if publish_error}
	function create_if_block_5(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-error svelte-77tncr";
				addLoc(div, file$2, 49, 4, 1631);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.publish_error;
			},

			p: function update(changed, ctx) {
				if (changed.publish_error) {
					div.innerHTML = ctx.publish_error;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (53:10) {#if publishing}
	function create_if_block_3(component, ctx) {
		var div, text0_value = __("publish / progress / please-wait"), text0, text1;

		var if_block = (ctx.publishWait > 3000) && create_if_block_4(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText(text0_value);
				text1 = createText(" ");
				if (if_block) if_block.c();
				div.className = "alert alert-info publishing svelte-77tncr";
				addLoc(div, file$2, 53, 4, 1736);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				append(div, text1);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.publishWait > 3000) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_4(component, ctx);
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
			}
		};
	}

	// (55:51) {#if publishWait > 3000}
	function create_if_block_4(component, ctx) {
		var ul;

		var each_value = ctx.progress;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_4(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				ul.className = "publish-progress unstyled svelte-77tncr";
				addLoc(ul, file$2, 56, 8, 1914);
			},

			m: function mount(target, anchor) {
				insert(target, ul, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.progress) {
					each_value = ctx.progress;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_4(component, child_ctx);
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
					detachNode(ul);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (58:12) {#each progress as step,i}
	function create_each_block_4(component, ctx) {
		var li, i_1, i_1_class_value, text, raw_value = __('publish / status / '+ctx.step), raw_before;

		return {
			c: function create() {
				li = createElement("li");
				i_1 = createElement("i");
				text = createText("\n                ");
				raw_before = createElement('noscript');
				i_1.className = i_1_class_value = "fa fa-fw " + (ctx.i < ctx.progress.length-1 ? 'fa-check' : 'fa-spinner fa-pulse') + " svelte-77tncr";
				addLoc(i_1, file$2, 59, 16, 2060);
				li.className = "svelte-77tncr";
				toggleClass(li, "done", ctx.i < ctx.progress.length-1);
				addLoc(li, file$2, 58, 12, 2004);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, i_1);
				append(li, text);
				append(li, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if ((changed.progress) && i_1_class_value !== (i_1_class_value = "fa fa-fw " + (ctx.i < ctx.progress.length-1 ? 'fa-check' : 'fa-spinner fa-pulse') + " svelte-77tncr")) {
					i_1.className = i_1_class_value;
				}

				if ((changed.progress) && raw_value !== (raw_value = __('publish / status / '+ctx.step))) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}

				if (changed.progress) {
					toggleClass(li, "done", ctx.i < ctx.progress.length-1);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	// (88:24) {#each plugin_shareurls as tpl}
	function create_each_block_3(component, ctx) {
		var label, input, input_value_value, text, raw_value = ctx.tpl.name, raw_before;

		function input_change_handler() {
			component.set({ shareurl_type: input.__value });
		}

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				text = createText("\n                            ");
				raw_before = createElement('noscript');
				component._bindingGroups[0].push(input);
				addListener(input, "change", input_change_handler);
				input.__value = input_value_value = ctx.tpl.id;
				input.value = input.__value;
				setAttribute(input, "type", "radio");
				input.name = "url-type";
				input.className = "svelte-77tncr";
				addLoc(input, file$2, 89, 29, 3253);
				label.className = "radio";
				addLoc(label, file$2, 88, 24, 3203);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, input);

				input.checked = input.__value === ctx.shareurl_type;

				append(label, text);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if (changed.shareurl_type) input.checked = input.__value === ctx.shareurl_type;
				if ((changed.plugin_shareurls) && input_value_value !== (input_value_value = ctx.tpl.id)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if ((changed.plugin_shareurls) && raw_value !== (raw_value = ctx.tpl.name)) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);
			}
		};
	}

	// (116:24) {#each embed_templates as tpl}
	function create_each_block_2(component, ctx) {
		var label, input, input_value_value, text, raw_value = ctx.tpl.title, raw_before;

		function input_change_handler() {
			component.set({ embed_type: input.__value });
		}

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				text = createText(" ");
				raw_before = createElement('noscript');
				component._bindingGroups[1].push(input);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "radio");
				input.__value = input_value_value = ctx.tpl.id;
				input.value = input.__value;
				input.className = "svelte-77tncr";
				addLoc(input, file$2, 117, 29, 4334);
				label.className = "radio";
				addLoc(label, file$2, 116, 24, 4284);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, input);

				input.checked = input.__value === ctx.embed_type;

				append(label, text);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if (changed.embed_type) input.checked = input.__value === ctx.embed_type;
				if ((changed.embed_templates) && input_value_value !== (input_value_value = ctx.tpl.id)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if ((changed.embed_templates) && raw_value !== (raw_value = ctx.tpl.title)) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				component._bindingGroups[1].splice(component._bindingGroups[1].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);
			}
		};
	}

	// (142:58) {#each embed_templates.slice(2) as tpl}
	function create_each_block_1(component, ctx) {
		var div, b, text0_value = ctx.tpl.title, text0, text1, text2, raw_value = ctx.tpl.text, raw_before;

		return {
			c: function create() {
				div = createElement("div");
				b = createElement("b");
				text0 = createText(text0_value);
				text1 = createText(":");
				text2 = createText(" ");
				raw_before = createElement('noscript');
				addLoc(b, file$2, 142, 25, 5426);
				addLoc(div, file$2, 142, 20, 5421);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, b);
				append(b, text0);
				append(b, text1);
				append(div, text2);
				append(div, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if ((changed.embed_templates) && text0_value !== (text0_value = ctx.tpl.title)) {
					setData(text0, text0_value);
				}

				if ((changed.embed_templates) && raw_value !== (raw_value = ctx.tpl.text)) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (157:12) {#if exportIntro}
	function create_if_block_2(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 157, 12, 5819);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.exportIntro;
			},

			p: function update(changed, ctx) {
				if (changed.exportIntro) {
					p.innerHTML = ctx.exportIntro;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (163:49) {#if action}
	function create_if_block$2(component, ctx) {
		var li, a, i, i_class_value, span, raw_value = ctx.action.title, a_href_value, text, li_class_value;

		var if_block = (ctx.action.banner && ctx.action.banner.text != "FALSE" && ctx.action.banner.text != "-") && create_if_block_1(component, ctx);

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i = createElement("i");
				span = createElement("span");
				text = createText("\n                ");
				if (if_block) if_block.c();
				i.className = i_class_value = "fa fa-" + ctx.action.icon + " svelte-77tncr";
				addLoc(i, file$2, 171, 20, 6332);
				span.className = "title svelte-77tncr";
				addLoc(span, file$2, 172, 21, 6388);

				a._svelte = { component, ctx };

				addListener(a, "click", click_handler);
				setAttribute(a, "role", "button");
				a.href = a_href_value = ctx.action.url ? ctx.action.url : '#'+ctx.action.id;
				addLoc(a, file$2, 166, 16, 6135);
				li.className = li_class_value = "action action-" + ctx.action.id + " " + (ctx.action.class||'') + " " + (ctx.action.id == ctx.active_action ? 'active':'') + " svelte-77tncr";
				addLoc(li, file$2, 163, 12, 5989);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				append(a, i);
				append(a, span);
				span.innerHTML = raw_value;
				append(li, text);
				if (if_block) if_block.m(li, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.sortedChartActions) && i_class_value !== (i_class_value = "fa fa-" + ctx.action.icon + " svelte-77tncr")) {
					i.className = i_class_value;
				}

				if ((changed.sortedChartActions) && raw_value !== (raw_value = ctx.action.title)) {
					span.innerHTML = raw_value;
				}

				a._svelte.ctx = ctx;
				if ((changed.sortedChartActions) && a_href_value !== (a_href_value = ctx.action.url ? ctx.action.url : '#'+ctx.action.id)) {
					a.href = a_href_value;
				}

				if (ctx.action.banner && ctx.action.banner.text != "FALSE" && ctx.action.banner.text != "-") {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1(component, ctx);
						if_block.c();
						if_block.m(li, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.sortedChartActions || changed.active_action) && li_class_value !== (li_class_value = "action action-" + ctx.action.id + " " + (ctx.action.class||'') + " " + (ctx.action.id == ctx.active_action ? 'active':'') + " svelte-77tncr")) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(a, "click", click_handler);
				if (if_block) if_block.d();
			}
		};
	}

	// (175:16) {#if action.banner && action.banner.text != "FALSE" && action.banner.text != "-"}
	function create_if_block_1(component, ctx) {
		var div, text_value = ctx.action.banner.text, text, div_style_value;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "banner";
				div.style.cssText = div_style_value = ctx.action.banner.style;
				addLoc(div, file$2, 175, 16, 6571);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedChartActions) && text_value !== (text_value = ctx.action.banner.text)) {
					setData(text, text_value);
				}

				if ((changed.sortedChartActions) && div_style_value !== (div_style_value = ctx.action.banner.style)) {
					div.style.cssText = div_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (163:12) {#each sortedChartActions as action}
	function create_each_block(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.action) && create_if_block$2(component, ctx);

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
				if (ctx.action) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$2(component, ctx);
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

	function Publish(options) {
		this._debugName = '<Publish>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Publish> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["id","publicUrl","metadata","actions"]), data$2()), options.data);
		this.store._add(this, ["id","publicUrl","metadata","actions"]);

		this._recompute({ shareurl_type: 1, $id: 1, $publicUrl: 1, $metadata: 1, plugin_shareurls: 1, published: 1, chartActions: 1, $actions: 1, publishStarted: 1, now: 1 }, this._state);
		if (!('shareurl_type' in this._state)) console.warn("<Publish> was created without expected data property 'shareurl_type'");
		if (!('$id' in this._state)) console.warn("<Publish> was created without expected data property '$id'");
		if (!('$publicUrl' in this._state)) console.warn("<Publish> was created without expected data property '$publicUrl'");
		if (!('$metadata' in this._state)) console.warn("<Publish> was created without expected data property '$metadata'");
		if (!('plugin_shareurls' in this._state)) console.warn("<Publish> was created without expected data property 'plugin_shareurls'");
		if (!('published' in this._state)) console.warn("<Publish> was created without expected data property 'published'");
		if (!('chartActions' in this._state)) console.warn("<Publish> was created without expected data property 'chartActions'");
		if (!('$actions' in this._state)) console.warn("<Publish> was created without expected data property '$actions'");
		if (!('publishStarted' in this._state)) console.warn("<Publish> was created without expected data property 'publishStarted'");
		if (!('now' in this._state)) console.warn("<Publish> was created without expected data property 'now'");
		if (!('publishHed' in this._state)) console.warn("<Publish> was created without expected data property 'publishHed'");
		if (!('publishIntro' in this._state)) console.warn("<Publish> was created without expected data property 'publishIntro'");
		if (!('publishing' in this._state)) console.warn("<Publish> was created without expected data property 'publishing'");
		if (!('needs_republish' in this._state)) console.warn("<Publish> was created without expected data property 'needs_republish'");
		if (!('progress' in this._state)) console.warn("<Publish> was created without expected data property 'progress'");
		if (!('publish_error' in this._state)) console.warn("<Publish> was created without expected data property 'publish_error'");


		if (!('embed_templates' in this._state)) console.warn("<Publish> was created without expected data property 'embed_templates'");
		if (!('embed_type' in this._state)) console.warn("<Publish> was created without expected data property 'embed_type'");
		if (!('embedCode' in this._state)) console.warn("<Publish> was created without expected data property 'embedCode'");
		if (!('copy_success' in this._state)) console.warn("<Publish> was created without expected data property 'copy_success'");
		if (!('beforeExport' in this._state)) console.warn("<Publish> was created without expected data property 'beforeExport'");
		if (!('exportHed' in this._state)) console.warn("<Publish> was created without expected data property 'exportHed'");
		if (!('exportIntro' in this._state)) console.warn("<Publish> was created without expected data property 'exportIntro'");

		if (!('active_action' in this._state)) console.warn("<Publish> was created without expected data property 'active_action'");
		if (!('Action' in this._state)) console.warn("<Publish> was created without expected data property 'Action'");
		this._bindingGroups = [[], []];
		this._intro = true;

		this._handlers.state = [onstate];

		this._handlers.destroy = [removeFromStore];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$2(this, this._state);

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

	assign(Publish.prototype, protoDev);
	assign(Publish.prototype, methods$1);

	Publish.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('shareUrl' in newState && !this._updatingReadonlyProperty) throw new Error("<Publish>: Cannot set read-only property 'shareUrl'");
		if ('sortedChartActions' in newState && !this._updatingReadonlyProperty) throw new Error("<Publish>: Cannot set read-only property 'sortedChartActions'");
		if ('publishWait' in newState && !this._updatingReadonlyProperty) throw new Error("<Publish>: Cannot set read-only property 'publishWait'");
	};

	Publish.prototype._recompute = function _recompute(changed, state) {
		if (changed.shareurl_type || changed.$id || changed.$publicUrl || changed.$metadata || changed.plugin_shareurls || changed.published) {
			if (this._differs(state.shareUrl, (state.shareUrl = shareUrl(state)))) changed.shareUrl = true;
		}

		if (changed.chartActions || changed.$actions) {
			if (this._differs(state.sortedChartActions, (state.sortedChartActions = sortedChartActions(state)))) changed.sortedChartActions = true;
		}

		if (changed.publishStarted || changed.now) {
			if (this._differs(state.publishWait, (state.publishWait = publishWait(state)))) changed.publishWait = true;
		}
	};

	var index = { Publish };

	return index;

})));
//# sourceMappingURL=publish.js.map
