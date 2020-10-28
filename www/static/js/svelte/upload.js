<<<<<<< HEAD
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../../../../../../../../static/vendor/jschardet/jschardet.min.js'), require('../../../../../../../../static/vendor/xlsx/xlsx.full.min.js')) :
	typeof define === 'function' && define.amd ? define('svelte/upload', ['../../../../../../../../static/vendor/jschardet/jschardet.min.js', '../../../../../../../../static/vendor/xlsx/xlsx.full.min.js'], factory) :
	(global = global || self, global.upload = factory(global.jschardet));
}(this, function (jschardet) { 'use strict';

	jschardet = jschardet && jschardet.hasOwnProperty('default') ? jschardet['default'] : jschardet;

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

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
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

	/* upload/TextAreaUpload.html generated by Svelte v2.16.1 */



	let app;
	const chart = dw.backend.currentChart;

	const updateData = _throttle(() => {
	    const { chartData } = app.get();
	    httpReq.put(`/v3/charts/${chart.get('id')}/data`, {
	        body: chartData,
	        headers: {
	            'Content-Type': 'text/csv'
	        }
	    });
	}, 1000);

	function data() {
	    return {
	        placeholder: __('upload / paste here')
	    };
	}
	function oncreate() {
	    app = this;
	}
	function onupdate({ changed, current, previous }) {
	    if (
	        changed.chartData &&
	        current.chartData &&
	        previous &&
	        previous.chartData !== current.chartData
	    ) {
	        updateData();
	    }
	}
	const file = "upload/TextAreaUpload.html";

	function create_main_fragment(component, ctx) {
		var form, div, textarea, textarea_updating = false;

		function textarea_input_handler() {
			textarea_updating = true;
			component.set({ chartData: textarea.value });
			textarea_updating = false;
		}

		return {
			c: function create() {
				form = createElement("form");
				div = createElement("div");
				textarea = createElement("textarea");
				addListener(textarea, "input", textarea_input_handler);
				textarea.readOnly = ctx.readonly;
				textarea.id = "upload-data-text";
				setStyle(textarea, "resize", "none");
				textarea.placeholder = ctx.placeholder;
				textarea.className = "svelte-kl1kny";
				addLoc(textarea, file, 2, 8, 67);
				div.className = "control-group";
				addLoc(div, file, 1, 4, 31);
				form.className = "upload-form";
				addLoc(form, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, form, anchor);
				append(form, div);
				append(div, textarea);

				textarea.value = ctx.chartData;
			},

			p: function update(changed, ctx) {
				if (!textarea_updating && changed.chartData) textarea.value = ctx.chartData;
				if (changed.readonly) {
					textarea.readOnly = ctx.readonly;
				}

				if (changed.placeholder) {
					textarea.placeholder = ctx.placeholder;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(form);
				}

				removeListener(textarea, "input", textarea_input_handler);
			}
		};
	}

	function TextAreaUpload(options) {
		this._debugName = '<TextAreaUpload>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('chartData' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'chartData'");
		if (!('readonly' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'readonly'");
		if (!('placeholder' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'placeholder'");
		this._intro = true;
		this._handlers.update = [onupdate];

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

	assign(TextAreaUpload.prototype, protoDev);

	TextAreaUpload.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* upload/UploadHelp.html generated by Svelte v2.16.1 */

	/* globals dw */
	function datasetsArray({ datasets }) {
	    return Object.keys(datasets).map(k => datasets[k]);
	}
	function data$1() {
	    return {
	        selectedDataset: '--'
	    };
	}
	function onupdate$1({ changed, current }) {
	    if (changed.selectedDataset && current.selectedDataset !== '--') {
	        const sel = current.selectedDataset;
	        this.set({ chartData: sel.data });
	        if (sel.presets) {
	            Object.keys(sel.presets).forEach(k => {
	                dw.backend.currentChart.set(k, sel.presets[k]);
	            });
	        }
	    }
	}
	const file$1 = "upload/UploadHelp.html";

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.dataset = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.group = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var p0, text0_value = __("upload / quick help"), text0, text1, div, p1, text2_value = __("upload / try a dataset"), text2, text3, select, option, text4_value = __("upload / sample dataset"), text4, select_updating = false;

		var each_value = ctx.datasetsArray;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ selectedDataset: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				p0 = createElement("p");
				text0 = createText(text0_value);
				text1 = createText("\n\n");
				div = createElement("div");
				p1 = createElement("p");
				text2 = createText(text2_value);
				text3 = createText("\n    ");
				select = createElement("select");
				option = createElement("option");
				text4 = createText(text4_value);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addLoc(p0, file$1, 0, 0, 0);
				addLoc(p1, file$1, 3, 4, 70);
				option.__value = "--";
				option.value = option.__value;
				addLoc(option, file$1, 5, 8, 201);
				addListener(select, "change", select_change_handler);
				if (!('selectedDataset' in ctx)) component.root._beforecreate.push(select_change_handler);
				select.disabled = ctx.readonly;
				select.id = "demo-datasets";
				select.className = "svelte-16u58l0";
				addLoc(select, file$1, 4, 4, 114);
				div.className = "demo-datasets";
				addLoc(div, file$1, 2, 0, 38);
			},

			m: function mount(target, anchor) {
				insert(target, p0, anchor);
				append(p0, text0);
				insert(target, text1, anchor);
				insert(target, div, anchor);
				append(div, p1);
				append(p1, text2);
				append(div, text3);
				append(div, select);
				append(select, option);
				append(option, text4);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, ctx.selectedDataset);
			},

			p: function update(changed, ctx) {
				if (changed.datasetsArray) {
					each_value = ctx.datasetsArray;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (!select_updating && changed.selectedDataset) selectOption(select, ctx.selectedDataset);
				if (changed.readonly) {
					select.disabled = ctx.readonly;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p0);
					detachNode(text1);
					detachNode(div);
				}

				destroyEach(each_blocks, detach);

				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (9:12) {#each group.datasets as dataset}
	function create_each_block_1(component, ctx) {
		var option, text_value = ctx.dataset.title, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.dataset;
				option.value = option.__value;
				option.className = "demo-dataset";
				addLoc(option, file$1, 9, 12, 400);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.datasetsArray) && text_value !== (text_value = ctx.dataset.title)) {
					setData(text, text_value);
				}

				if ((changed.datasetsArray) && option_value_value !== (option_value_value = ctx.dataset)) {
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

	// (7:8) {#each datasetsArray as group}
	function create_each_block(component, ctx) {
		var optgroup, optgroup_label_value;

		var each_value_1 = ctx.group.datasets;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.group.type);
				addLoc(optgroup, file$1, 7, 8, 310);
			},

			m: function mount(target, anchor) {
				insert(target, optgroup, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(optgroup, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.datasetsArray) {
					each_value_1 = ctx.group.datasets;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

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
					each_blocks.length = each_value_1.length;
				}

				if ((changed.datasetsArray) && optgroup_label_value !== (optgroup_label_value = ctx.group.type)) {
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

	function UploadHelp(options) {
		this._debugName = '<UploadHelp>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);

		this._recompute({ datasets: 1 }, this._state);
		if (!('datasets' in this._state)) console.warn("<UploadHelp> was created without expected data property 'datasets'");
		if (!('readonly' in this._state)) console.warn("<UploadHelp> was created without expected data property 'readonly'");
		if (!('selectedDataset' in this._state)) console.warn("<UploadHelp> was created without expected data property 'selectedDataset'");
		this._intro = true;
		this._handlers.update = [onupdate$1];

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

	assign(UploadHelp.prototype, protoDev);

	UploadHelp.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('datasetsArray' in newState && !this._updatingReadonlyProperty) throw new Error("<UploadHelp>: Cannot set read-only property 'datasetsArray'");
	};

	UploadHelp.prototype._recompute = function _recompute(changed, state) {
		if (changed.datasets) {
			if (this._differs(state.datasetsArray, (state.datasetsArray = datasetsArray(state)))) changed.datasetsArray = true;
		}
	};

	/* upload/SelectSheet.html generated by Svelte v2.16.1 */



	/* globals dw */
	function data$2() {
	    return {
	        selected: false,
	        sheets: []
	    };
	}
	async function onupdate$2({ changed, current }) {
	    if (changed.sheets && current.sheets.length > 1) {
	        setTimeout(() => {
	            this.set({ selected: current.sheets[0] });
	        }, 300);
	    } else if (changed.sheets && current.sheets.length === 1) {
	        await httpReq.put(`/v3/charts/${dw.backend.currentChart.get('id')}/data`, {
	            body: current.sheets[0].csv,
	            headers: {
	                'Content-Type': 'text/csv'
	            }
	        });
	        window.location.href = 'describe';
	    }
	    if (changed.selected) {
	        this.set({ chartData: current.selected.csv });
	    }
	}
	const file$2 = "upload/SelectSheet.html";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.sheet = list[i];
		return child_ctx;
	}

	function create_main_fragment$2(component, ctx) {
		var div;

		function select_block_type(ctx) {
			if (!ctx.sheets.length) return create_if_block;
			if (ctx.sheets.length>1) return create_if_block_1;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				addLoc(div, file$2, 0, 0, 0);
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

	// (11:4) {:else}
	function create_else_block(component, ctx) {
		var p, raw_value = __('upload / xls / uploading data');

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 11, 4, 375);
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

	// (4:29) 
	function create_if_block_1(component, ctx) {
		var p, text0_value = __("upload / select sheet"), text0, text1, select, select_updating = false, select_disabled_value;

		var each_value = ctx.sheets;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ selected: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText(text0_value);
				text1 = createText("\n    ");
				select = createElement("select");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addLoc(p, file$2, 4, 4, 141);
				addListener(select, "change", select_change_handler);
				if (!('selected' in ctx)) component.root._beforecreate.push(select_change_handler);
				select.disabled = select_disabled_value = !ctx.sheets.length;
				select.className = "svelte-16u58l0";
				addLoc(select, file$2, 5, 4, 184);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, text0);
				insert(target, text1, anchor);
				insert(target, select, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, ctx.selected);
			},

			p: function update(changed, ctx) {
				if (changed.sheets) {
					each_value = ctx.sheets;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (!select_updating && changed.selected) selectOption(select, ctx.selected);
				if ((changed.sheets) && select_disabled_value !== (select_disabled_value = !ctx.sheets.length)) {
					select.disabled = select_disabled_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
					detachNode(text1);
					detachNode(select);
				}

				destroyEach(each_blocks, detach);

				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (2:4) {#if !sheets.length}
	function create_if_block(component, ctx) {
		var div, raw_value = __('upload / parsing-xls');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-info";
				addLoc(div, file$2, 2, 4, 35);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (7:8) {#each sheets as sheet}
	function create_each_block$1(component, ctx) {
		var option, text_value = ctx.sheet.name, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.sheet;
				option.value = option.__value;
				addLoc(option, file$2, 7, 8, 283);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.sheets) && text_value !== (text_value = ctx.sheet.name)) {
					setData(text, text_value);
				}

				if ((changed.sheets) && option_value_value !== (option_value_value = ctx.sheet)) {
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

	function SelectSheet(options) {
		this._debugName = '<SelectSheet>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);
		if (!('sheets' in this._state)) console.warn("<SelectSheet> was created without expected data property 'sheets'");
		if (!('selected' in this._state)) console.warn("<SelectSheet> was created without expected data property 'selected'");
		this._intro = true;
		this._handlers.update = [onupdate$2];

		this._fragment = create_main_fragment$2(this, this._state);

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

	assign(SelectSheet.prototype, protoDev);

	SelectSheet.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* global Uint8Array, FileReader */

	function readFile (file, callback) {
	    var reader = new FileReader();
	    reader.onload = function () {
	        try {
	            var array = new Uint8Array(reader.result);
	            var string = '';
	            let nonAscii = 0;
	            for (var i = 0; i < array.length; ++i) {
	                if (array[i] > 122) nonAscii++;
	                string += String.fromCharCode(array[i]);
	            }
	            // eslint-disable-next-line
	            let res = jschardet.detect(string);
	            // jschardet performs poorly if there are not a lot of non-ascii characters
	            // in the input file, so we'll just ignore what it says and assume utf-8
	            // (unless jschardet is *really* sure ;)
	            if (res.confidence <= 0.95 && nonAscii < 10) res.encoding = 'utf-8';
	            reader = new FileReader();
	            reader.onload = () => callback(null, reader.result);
	            reader.readAsText(file, res.encoding);
	        } catch (e) {
	            console.warn(e);
	            callback(null, reader.result);
	        }
	    };
	    reader.readAsArrayBuffer(file);
	}

	/* global XLSX , FileReader */

	/**
	 * parses an XLS spreadsheet file
	 */
	function readSpreadsheet (file, callback) {
	    const rABS =
	        typeof FileReader !== 'undefined' && (FileReader.prototype || {}).readAsBinaryString;
	    const reader = new FileReader();

	    reader.onload = function () {
	        try {
	            const data = !rABS ? new Uint8Array(reader.result) : reader.result;
	            const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
	            callback(
	                null,
	                wb.SheetNames.map(n => {
	                    return {
	                        name: n,
	                        sheet: wb.Sheets[n],
	                        csv: XLSX.utils.sheet_to_csv(wb.Sheets[n])
	                    };
	                })
	            );
	        } catch (e) {
	            console.error(e);
	            callback(null, reader.result);
	        }
	    };
	    reader.readAsBinaryString(file);
	}

	/* upload/App.html generated by Svelte v2.16.1 */



	let app$1;

	const coreUploads = [
	    {
	        id: 'copy',
	        title: __('upload / copy-paste'),
	        longTitle: __('upload / copy-paste / long'),
	        icon: 'fa fa-clipboard',
	        mainPanel: TextAreaUpload,
	        sidebar: UploadHelp,
	        action() {}
	    },
	    {
	        id: 'upload',
	        title: __('upload / upload-csv'),
	        longTitle: __('upload / upload-csv / long'),
	        icon: 'fa-file-excel-o fa',
	        mainPanel: TextAreaUpload,
	        sidebar: UploadHelp,
	        isFileUpload: true,
	        async onFileUpload(event) {
	            const file = event.target.files[0];
	            if (
	                file.type.substr(0, 5) === 'text/' ||
	                file.name.substr(file.name.length - 4) === '.csv'
	            ) {
	                app$1.set({ Sidebar: UploadHelp });
	                readFile(file, async (err, result) => {
	                    if (err) return console.error('could not read file', err);
	                    await httpReq.put(`/v3/charts/${dw.backend.currentChart.get('id')}/data`, {
	                        body: result,
	                        headers: {
	                            'Content-Type': 'text/csv'
	                        }
	                    });
	                    window.location.href = 'describe';
	                });
	            } else if (file.type.substr(0, 12) === 'application/') {
	                app$1.set({ Sidebar: SelectSheet, sheets: [] }); // reset
	                readSpreadsheet(file, (err, sheets) => {
	                    if (err) return app$1.set({ error: err });
	                    app$1.set({ sheets });
	                });
	            } else {
	                console.error(file.type);
	                console.error(file);
	                app$1.set({ error: __('upload / csv-required') });
	            }
	        },
	        action() {}
	    }
	];

	function data$3() {
	    return {
	        dragover: false,
	        MainPanel: TextAreaUpload,
	        Sidebar: UploadHelp,
	        active: coreUploads[0],
	        buttons: coreUploads,
	        sheets: [],
	        chart: {
	            id: ''
	        },
	        readonly: false,
	        chartData: '',
	        transpose: false,
	        firstRowIsHeader: true,
	        skipRows: 0
	    };
	}
	var methods = {
	    addButton(btn) {
	        coreUploads.push(btn);
	        this.set({ buttons: coreUploads });
	        const { defaultMethod } = this.get();
	        if (btn.id === defaultMethod) {
	            this.btnAction(btn);
	        }
	    },
	    btnAction(btn) {
	        this.set({ active: btn });
	        if (btn.id === 'copy') {
	            // turn off externalData, if still set
	            const { dw_chart } = this.store.get();
	            if (dw_chart.get('externalData')) {
	                dw_chart.set('externalData', '');
	                setTimeout(() => {
	                    dw.backend.currentChart.save();
	                }, 1000);
	            }
	        }
	        let activeKey = btn.id;
	        if (btn.id === 'upload') {
	            activeKey = 'copy';
	            setTimeout(() => {
	                // reset after 1sec
	                // this.set({active:coreUploads[0]});
	            }, 1000);
	        }
	        const { dw_chart } = this.store.get();
	        dw_chart.set('metadata.data.upload-method', activeKey);
	        if (btn.action) btn.action();
	        if (btn.mainPanel) this.set({ MainPanel: btn.mainPanel });
	        if (btn.sidebar) this.set({ Sidebar: btn.sidebar });
	    },
	    btnUpload(btn, event) {
	        if (btn.onFileUpload) btn.onFileUpload(event);
	    },
	    dragStart(event) {
	        const { active } = this.get();
	        if (active.id === 'copy') {
	            event.preventDefault();
	            this.set({ dragover: true });
	        }
	    },
	    resetDrag() {
	        this.set({ dragover: false });
	    },
	    onFileDrop(event) {
	        const { active } = this.get();
	        if (active.id !== 'copy') return;
	        // Prevent default behavior (Prevent file from being opened)
	        this.resetDrag();
	        event.preventDefault();
	        const files = [];
	        if (event.dataTransfer.items) {
	            // Use DataTransferItemList interface to access the file(s)
	            for (let i = 0; i < event.dataTransfer.items.length; i++) {
	                // If dropped items aren't files, reject them
	                if (event.dataTransfer.items[i].kind === 'file') {
	                    files.push(event.dataTransfer.items[i].getAsFile());
	                }
	            }
	            event.dataTransfer.items.clear();
	        } else {
	            // Use DataTransfer interface to access the file(s)
	            for (let i = 0; i < event.dataTransfer.files.length; i++) {
	                files.push(event.dataTransfer.files[i]);
	            }
	            event.dataTransfer.items.clear();
	        }
	        for (let i = 0; i < files.length; i++) {
	            if (files[i].type.substr(0, 5) === 'text/') {
	                return readFile(files[i], async (err, result) => {
	                    if (err) return console.error('could not read file', err);

	                    await httpReq.put(
	                        `/v3/charts/${dw.backend.currentChart.get('id')}/data`,
	                        {
	                            body: result,
	                            headers: {
	                                'Content-Type': 'text/csv'
	                            }
	                        }
	                    );

	                    window.location.href = 'describe';
	                });
	            }
	        }
	    }
	};

	function oncreate$1() {
	    app$1 = this;
	    const { dw_chart } = this.store.get();
	    const method = dw_chart.get('metadata.data.upload-method', 'copy');
	    this.set({ defaultMethod: method });
	    coreUploads.forEach(u => {
	        if (u.id === method) {
	            this.set({ active: u });
	        }
	    });
	}
	const file$3 = "upload/App.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.btnAction(ctx.btn);
	}

	function change_handler(event) {
		const { component, ctx } = this._svelte;

		component.btnUpload(ctx.btn, event);
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.btn = list[i];
		return child_ctx;
	}

	function create_main_fragment$3(component, ctx) {
		var div5, text0, div4, div1, div0, h3, raw_value = __('upload / title'), text1, ul, text2, text3, h4, text4_value = ctx.active.longTitle || ctx.active.title, text4, text5, switch_instance0_updating = {}, text6, div3, switch_instance1_updating = {}, text7, div2, a, text8_value = __("Proceed"), text8, text9, i, div4_style_value;

		var if_block0 = (ctx.dragover) && create_if_block_2();

		var each_value = ctx.buttons;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block$2(component, get_each_context$2(ctx, each_value, i_1));
		}

		var if_block1 = (ctx.error) && create_if_block$1(component, ctx);

		var switch_value = ctx.Sidebar;

		function switch_props(ctx) {
			var switch_instance0_initial_data = {};
			if (ctx.chartData
	                     !== void 0) {
				switch_instance0_initial_data.chartData = ctx.chartData
	                    ;
				switch_instance0_updating.chartData = true;
			}
			if (ctx.readonly
	                     !== void 0) {
				switch_instance0_initial_data.readonly = ctx.readonly
	                    ;
				switch_instance0_updating.readonly = true;
			}
			if (ctx.sheets
	                     !== void 0) {
				switch_instance0_initial_data.sheets = ctx.sheets
	                    ;
				switch_instance0_updating.sheets = true;
			}
			if (ctx.datasets
	                 !== void 0) {
				switch_instance0_initial_data.datasets = ctx.datasets
	                ;
				switch_instance0_updating.datasets = true;
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance0_initial_data,
				_bind(changed, childState) {
					var newState = {};
					if (!switch_instance0_updating.chartData && changed.chartData) {
						newState.chartData = childState.chartData;
					}

					if (!switch_instance0_updating.readonly && changed.readonly) {
						newState.readonly = childState.readonly;
					}

					if (!switch_instance0_updating.sheets && changed.sheets) {
						newState.sheets = childState.sheets;
					}

					if (!switch_instance0_updating.datasets && changed.datasets) {
						newState.datasets = childState.datasets;
					}
					component._set(newState);
					switch_instance0_updating = {};
				}
			};
		}

		if (switch_value) {
			var switch_instance0 = new switch_value(switch_props(ctx));

			component.root._beforecreate.push(() => {
				switch_instance0._bind({ chartData: 1, readonly: 1, sheets: 1, datasets: 1 }, switch_instance0.get());
			});
		}

		var switch_value_1 = ctx.MainPanel;

		function switch_props_1(ctx) {
			var switch_instance1_initial_data = {};
			if (ctx.chartData  !== void 0) {
				switch_instance1_initial_data.chartData = ctx.chartData ;
				switch_instance1_updating.chartData = true;
			}
			if (ctx.readonly  !== void 0) {
				switch_instance1_initial_data.readonly = ctx.readonly ;
				switch_instance1_updating.readonly = true;
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance1_initial_data,
				_bind(changed, childState) {
					var newState = {};
					if (!switch_instance1_updating.chartData && changed.chartData) {
						newState.chartData = childState.chartData;
					}

					if (!switch_instance1_updating.readonly && changed.readonly) {
						newState.readonly = childState.readonly;
					}
					component._set(newState);
					switch_instance1_updating = {};
				}
			};
		}

		if (switch_value_1) {
			var switch_instance1 = new switch_value_1(switch_props_1(ctx));

			component.root._beforecreate.push(() => {
				switch_instance1._bind({ chartData: 1, readonly: 1 }, switch_instance1.get());
			});
		}

		function drop_handler(event) {
			component.onFileDrop(event);
		}

		function dragover_handler(event) {
			component.dragStart(event);
		}

		function dragenter_handler(event) {
			component.dragStart(event);
		}

		function dragend_handler(event) {
			component.resetDrag();
		}

		function dragleave_handler(event) {
			component.resetDrag();
		}

		return {
			c: function create() {
				div5 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n\n    \n    ");
				div4 = createElement("div");
				div1 = createElement("div");
				div0 = createElement("div");
				h3 = createElement("h3");
				text1 = createText("\n\n                ");
				ul = createElement("ul");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}

				text2 = createText("\n\n                ");
				if (if_block1) if_block1.c();
				text3 = createText("\n\n                ");
				h4 = createElement("h4");
				text4 = createText(text4_value);
				text5 = createText("\n\n                ");
				if (switch_instance0) switch_instance0._fragment.c();
				text6 = createText("\n        ");
				div3 = createElement("div");
				if (switch_instance1) switch_instance1._fragment.c();
				text7 = createText("\n\n            ");
				div2 = createElement("div");
				a = createElement("a");
				text8 = createText(text8_value);
				text9 = createText(" ");
				i = createElement("i");
				addLoc(h3, file$3, 18, 16, 560);
				ul.className = "import-methods svelte-oe6wy4";
				addLoc(ul, file$3, 20, 16, 615);
				h4.className = "svelte-oe6wy4";
				addLoc(h4, file$3, 46, 16, 1680);
				div0.className = "sidebar";
				addLoc(div0, file$3, 17, 12, 522);
				div1.className = "span5";
				addLoc(div1, file$3, 16, 8, 490);
				i.className = "icon-chevron-right icon-white";
				addLoc(i, file$3, 62, 36, 2264);
				a.href = "describe";
				a.className = "submit btn btn-primary svelte-oe6wy4";
				a.id = "describe-proceed";
				addLoc(a, file$3, 61, 16, 2155);
				div2.className = "buttons pull-right";
				addLoc(div2, file$3, 60, 12, 2106);
				div3.className = "span7";
				addLoc(div3, file$3, 57, 8, 1992);
				div4.className = "row";
				div4.style.cssText = div4_style_value = ctx.dragover?'opacity: 0.5;filter:blur(6px);background:white;pointer-events:none': '';
				addLoc(div4, file$3, 15, 4, 370);
				addListener(div5, "drop", drop_handler);
				addListener(div5, "dragover", dragover_handler);
				addListener(div5, "dragenter", dragenter_handler);
				addListener(div5, "dragend", dragend_handler);
				addListener(div5, "dragleave", dragleave_handler);
				div5.className = "chart-editor dw-create-upload upload-data";
				addLoc(div5, file$3, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div5, anchor);
				if (if_block0) if_block0.m(div5, null);
				append(div5, text0);
				append(div5, div4);
				append(div4, div1);
				append(div1, div0);
				append(div0, h3);
				h3.innerHTML = raw_value;
				append(div0, text1);
				append(div0, ul);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(ul, null);
				}

				append(div0, text2);
				if (if_block1) if_block1.m(div0, null);
				append(div0, text3);
				append(div0, h4);
				append(h4, text4);
				append(div0, text5);

				if (switch_instance0) {
					switch_instance0._mount(div0, null);
				}

				append(div4, text6);
				append(div4, div3);

				if (switch_instance1) {
					switch_instance1._mount(div3, null);
				}

				append(div3, text7);
				append(div3, div2);
				append(div2, a);
				append(a, text8);
				append(a, text9);
				append(a, i);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.dragover) {
					if (!if_block0) {
						if_block0 = create_if_block_2();
						if_block0.c();
						if_block0.m(div5, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.active || changed.buttons) {
					each_value = ctx.buttons;

					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i_1);

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, child_ctx);
						} else {
							each_blocks[i_1] = create_each_block$2(component, child_ctx);
							each_blocks[i_1].c();
							each_blocks[i_1].m(ul, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (ctx.error) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$1(component, ctx);
						if_block1.c();
						if_block1.m(div0, text3);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if ((changed.active) && text4_value !== (text4_value = ctx.active.longTitle || ctx.active.title)) {
					setData(text4, text4_value);
				}

				var switch_instance0_changes = {};
				if (!switch_instance0_updating.chartData && changed.chartData) {
					switch_instance0_changes.chartData = ctx.chartData
	                    ;
					switch_instance0_updating.chartData = ctx.chartData
	                     !== void 0;
				}
				if (!switch_instance0_updating.readonly && changed.readonly) {
					switch_instance0_changes.readonly = ctx.readonly
	                    ;
					switch_instance0_updating.readonly = ctx.readonly
	                     !== void 0;
				}
				if (!switch_instance0_updating.sheets && changed.sheets) {
					switch_instance0_changes.sheets = ctx.sheets
	                    ;
					switch_instance0_updating.sheets = ctx.sheets
	                     !== void 0;
				}
				if (!switch_instance0_updating.datasets && changed.datasets) {
					switch_instance0_changes.datasets = ctx.datasets
	                ;
					switch_instance0_updating.datasets = ctx.datasets
	                 !== void 0;
				}

				if (switch_value !== (switch_value = ctx.Sidebar)) {
					if (switch_instance0) {
						switch_instance0.destroy();
					}

					if (switch_value) {
						switch_instance0 = new switch_value(switch_props(ctx));

						component.root._beforecreate.push(() => {
							const changed = {};
							if (ctx.chartData
	                     === void 0) changed.chartData = 1;
							if (ctx.readonly
	                     === void 0) changed.readonly = 1;
							if (ctx.sheets
	                     === void 0) changed.sheets = 1;
							if (ctx.datasets
	                 === void 0) changed.datasets = 1;
							switch_instance0._bind(changed, switch_instance0.get());
						});
						switch_instance0._fragment.c();
						switch_instance0._mount(div0, null);
					} else {
						switch_instance0 = null;
					}
				}

				else if (switch_value) {
					switch_instance0._set(switch_instance0_changes);
					switch_instance0_updating = {};
				}

				var switch_instance1_changes = {};
				if (!switch_instance1_updating.chartData && changed.chartData) {
					switch_instance1_changes.chartData = ctx.chartData ;
					switch_instance1_updating.chartData = ctx.chartData  !== void 0;
				}
				if (!switch_instance1_updating.readonly && changed.readonly) {
					switch_instance1_changes.readonly = ctx.readonly ;
					switch_instance1_updating.readonly = ctx.readonly  !== void 0;
				}

				if (switch_value_1 !== (switch_value_1 = ctx.MainPanel)) {
					if (switch_instance1) {
						switch_instance1.destroy();
					}

					if (switch_value_1) {
						switch_instance1 = new switch_value_1(switch_props_1(ctx));

						component.root._beforecreate.push(() => {
							const changed = {};
							if (ctx.chartData  === void 0) changed.chartData = 1;
							if (ctx.readonly  === void 0) changed.readonly = 1;
							switch_instance1._bind(changed, switch_instance1.get());
						});
						switch_instance1._fragment.c();
						switch_instance1._mount(div3, text7);
					} else {
						switch_instance1 = null;
					}
				}

				else if (switch_value_1) {
					switch_instance1._set(switch_instance1_changes);
					switch_instance1_updating = {};
				}

				if ((changed.dragover) && div4_style_value !== (div4_style_value = ctx.dragover?'opacity: 0.5;filter:blur(6px);background:white;pointer-events:none': '')) {
					div4.style.cssText = div4_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div5);
				}

				if (if_block0) if_block0.d();

				destroyEach(each_blocks, detach);

				if (if_block1) if_block1.d();
				if (switch_instance0) switch_instance0.destroy();
				if (switch_instance1) switch_instance1.destroy();
				removeListener(div5, "drop", drop_handler);
				removeListener(div5, "dragover", dragover_handler);
				removeListener(div5, "dragenter", dragenter_handler);
				removeListener(div5, "dragend", dragend_handler);
				removeListener(div5, "dragleave", dragleave_handler);
			}
		};
	}

	// (9:4) {#if dragover}
	function create_if_block_2(component, ctx) {
		var div, raw_value = __('upload / drag-csv-here');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "draginfo svelte-oe6wy4";
				addLoc(div, file$3, 9, 4, 247);
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

	// (25:28) {#if btn.isFileUpload}
	function create_if_block_1$1(component, ctx) {
		var input;

		return {
			c: function create() {
				input = createElement("input");
				input._svelte = { component, ctx };

				addListener(input, "change", change_handler);
				input.accept = ".csv, .tsv, .txt, .xlsx, .xls, .ods, .dbf";
				input.className = "file-upload svelte-oe6wy4";
				setAttribute(input, "type", "file");
				addLoc(input, file$3, 25, 28, 889);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				input._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "change", change_handler);
			}
		};
	}

	// (22:20) {#each buttons as btn}
	function create_each_block$2(component, ctx) {
		var li, label, text0, i, i_class_value, text1, span, text2_value = ctx.btn.title, text2, li_class_value;

		var if_block = (ctx.btn.isFileUpload) && create_if_block_1$1(component, ctx);

		return {
			c: function create() {
				li = createElement("li");
				label = createElement("label");
				if (if_block) if_block.c();
				text0 = createText("\n                            ");
				i = createElement("i");
				text1 = createText("\n                            ");
				span = createElement("span");
				text2 = createText(text2_value);
				i.className = i_class_value = "" + ctx.btn.icon + " svelte-oe6wy4";
				addLoc(i, file$3, 32, 28, 1234);
				span.className = "svelte-oe6wy4";
				addLoc(span, file$3, 33, 28, 1289);
				label.className = "svelte-oe6wy4";
				addLoc(label, file$3, 23, 24, 802);

				li._svelte = { component, ctx };

				addListener(li, "click", click_handler);
				li.className = li_class_value = "action " + (ctx.active==ctx.btn?'active':'') + " svelte-oe6wy4";
				addLoc(li, file$3, 22, 20, 706);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, label);
				if (if_block) if_block.m(label, null);
				append(label, text0);
				append(label, i);
				append(label, text1);
				append(label, span);
				append(span, text2);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.btn.isFileUpload) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$1(component, ctx);
						if_block.c();
						if_block.m(label, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.buttons) && i_class_value !== (i_class_value = "" + ctx.btn.icon + " svelte-oe6wy4")) {
					i.className = i_class_value;
				}

				if ((changed.buttons) && text2_value !== (text2_value = ctx.btn.title)) {
					setData(text2, text2_value);
				}

				li._svelte.ctx = ctx;
				if ((changed.active || changed.buttons) && li_class_value !== (li_class_value = "action " + (ctx.active==ctx.btn?'active':'') + " svelte-oe6wy4")) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				if (if_block) if_block.d();
				removeListener(li, "click", click_handler);
			}
		};
	}

	// (40:16) {#if error}
	function create_if_block$1(component, ctx) {
		var div1, div0, text_1, raw_before;

		function click_handler_1(event) {
			component.set({error:false});
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.textContent = "✕";
				text_1 = createText("\n                    ");
				raw_before = createElement('noscript');
				addListener(div0, "click", click_handler_1);
				div0.className = "action close";
				addLoc(div0, file$3, 41, 20, 1520);
				div1.className = "alert alert-error";
				addLoc(div1, file$3, 40, 16, 1468);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div1, text_1);
				append(div1, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.error);
			},

			p: function update(changed, ctx) {
				if (changed.error) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.error);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(div0, "click", click_handler_1);
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$3(), options.data);
		if (!('dragover' in this._state)) console.warn("<App> was created without expected data property 'dragover'");
		if (!('buttons' in this._state)) console.warn("<App> was created without expected data property 'buttons'");
		if (!('active' in this._state)) console.warn("<App> was created without expected data property 'active'");
		if (!('error' in this._state)) console.warn("<App> was created without expected data property 'error'");
		if (!('Sidebar' in this._state)) console.warn("<App> was created without expected data property 'Sidebar'");
		if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
		if (!('readonly' in this._state)) console.warn("<App> was created without expected data property 'readonly'");
		if (!('sheets' in this._state)) console.warn("<App> was created without expected data property 'sheets'");
		if (!('datasets' in this._state)) console.warn("<App> was created without expected data property 'datasets'");
		if (!('MainPanel' in this._state)) console.warn("<App> was created without expected data property 'MainPanel'");
		this._intro = true;

		this._fragment = create_main_fragment$3(this, this._state);

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

	assign(App.prototype, protoDev);
	assign(App.prototype, methods);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
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

	const data$4 = {
	    chart: {
	        id: ''
	    },
	    readonly: false,
	    chartData: '',
	    transpose: false,
	    firstRowIsHeader: true,
	    skipRows: 0
	};

	var main = { App, data: data$4, store };

	return main;

}));
//# sourceMappingURL=upload.js.map
=======
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("../../../../../../../../static/vendor/jschardet/jschardet.min.js"),require("../../../../../../../../static/vendor/xlsx/xlsx.full.min.js")):"function"==typeof define&&define.amd?define("svelte/upload",["../../../../../../../../static/vendor/jschardet/jschardet.min.js","../../../../../../../../static/vendor/xlsx/xlsx.full.min.js"],e):(t=t||self).upload=e(t.jschardet)}(this,(function(t){"use strict";function e(t,e,n){return t(n={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&n.path)}},n.exports),n.exports}t=t&&t.hasOwnProperty("default")?t.default:t;var n=e((function(t){function e(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=e=function(t){return typeof t}:t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(n)}t.exports=e}));var r=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t};function a(){}function o(t,e){for(var n in e)t[n]=e[n];return t}function i(t,e){for(var n in e)t[n]=1;return t}function s(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n)}function u(t){t.parentNode.removeChild(t)}function l(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function d(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function h(t,e,n,r){t.addEventListener(e,n,r)}function p(t,e,n,r){t.removeEventListener(e,n,r)}function v(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function g(t,e){t.data=""+e}function m(t,e){for(var n=0;n<t.options.length;n+=1){var r=t.options[n];if(r.__value===e)return void(r.selected=!0)}}function y(t){var e=t.querySelector(":checked")||t.options[0];return e&&e.__value}function _(){return Object.create(null)}function b(t,e){return t!=t?e==e:t!==e||t&&"object"===n(t)||"function"==typeof t}function w(t,e){return t!=t?e==e:t!==e}function D(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var r=0;r<n.length;r+=1){var a=n[r];if(!a.__calling)try{a.__calling=!0,a.call(this,e)}finally{a.__calling=!1}}}function x(t){t._lock=!0,S(t._beforecreate),S(t._oncreate),S(t._aftercreate),t._lock=!1}function O(){return this._state}function j(t,e){t._handlers=_(),t._slots=_(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function T(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}}function S(t){for(;t&&t.length;)t.shift()()}var P={destroy:function(t){this.destroy=a,this.fire("destroy"),this.set=a,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:O,fire:D,on:T,set:function(t){this._set(o({},t)),this.root._lock||x(this.root)},_recompute:a,_set:function(t){var e=this._state,n={},r=!1;for(var a in t=o(this._staged,t),this._staged={},t)this._differs(t[a],e[a])&&(n[a]=r=!0);r&&(this._state=o(o({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){o(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:b};var C=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")};var N=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t};var k=function(t,e){return!e||"object"!==n(e)&&"function"!=typeof e?N(t):e},A=e((function(t){function e(n){return t.exports=e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},e(n)}t.exports=e})),E=e((function(t){function e(n,r){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},e(n,r)}t.exports=e}));var R=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&E(t,e)};var U=function(t){return-1!==Function.toString.call(t).indexOf("[native code]")};var F=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}},M=e((function(t){function e(n,r,a){return F()?t.exports=e=Reflect.construct:t.exports=e=function(t,e,n){var r=[null];r.push.apply(r,e);var a=new(Function.bind.apply(t,r));return n&&E(a,n.prototype),a},e.apply(null,arguments)}t.exports=e})),L=e((function(t){function e(n){var r="function"==typeof Map?new Map:void 0;return t.exports=e=function(t){if(null===t||!U(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,e)}function e(){return M(t,arguments,A(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),E(e,t)},e(n)}t.exports=e}));var H=function(t,e){if(null==t)return{};var n,r,a={},o=Object.keys(t);for(r=0;r<o.length;r++)n=o[r],e.indexOf(n)>=0||(a[n]=t[n]);return a};var I=function(t,e){if(null==t)return{};var n,r,a=H(t,e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(r=0;r<o.length;r++)n=o[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(a[n]=t[n])}return a},q=e((function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function a(){}function o(e,n,o){if("undefined"!=typeof document){"number"==typeof(o=t({path:"/"},a.defaults,o)).expires&&(o.expires=new Date(1*new Date+864e5*o.expires)),o.expires=o.expires?o.expires.toUTCString():"";try{var i=JSON.stringify(n);/^[\{\[]/.test(i)&&(n=i)}catch(t){}n=r.write?r.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var c in o)o[c]&&(s+="; "+c,!0!==o[c]&&(s+="="+o[c].split(";")[0]));return document.cookie=e+"="+n+s}}function i(t,n){if("undefined"!=typeof document){for(var a={},o=document.cookie?document.cookie.split("; "):[],i=0;i<o.length;i++){var s=o[i].split("="),c=s.slice(1).join("=");n||'"'!==c.charAt(0)||(c=c.slice(1,-1));try{var u=e(s[0]);if(c=(r.read||r)(c,u)||e(c),n)try{c=JSON.parse(c)}catch(t){}if(a[u]=c,t===u)break}catch(t){}}return t?a[t]:a}}return a.set=o,a.get=function(t){return i(t,!1)},a.getJSON=function(t){return i(t,!0)},a.remove=function(e,n){o(e,"",t(n,{expires:-1}))},a.defaults={},a.withConverter=n,a}((function(){}))},t.exports=n()}));function B(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function X(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?B(Object(n),!0).forEach((function(e){r(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):B(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var J=new Set(["get","head","options","trace"]);function $(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=X({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e,{headers:X({"Content-Type":"application/json"},e.headers)}),a=r.payload,o=r.baseUrl,i=r.fetch,s=r.raw,c=I(r,["payload","baseUrl","fetch","raw"]),u="".concat(o.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(a&&(c.body=JSON.stringify(a)),J.has(c.method.toLowerCase()))n=i(u,c);else{var l=q.get("crumb");l?(c.headers["X-CSRF-Token"]=l,n=i(u,c)):n=$("/v3/me",{fetch:i,baseUrl:o}).then((function(){var t=q.get("crumb");t&&(c.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return i(u,c)}))}return n.then((function(t){if(s)return t;if(!t.ok)throw new z(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}$.get=G("GET"),$.patch=G("PATCH"),$.put=G("PUT"),$.post=G("POST"),$.head=G("HEAD");function G(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return $(e,X({},n,{method:t}))}}$.delete=G("DELETE");var z=function(t){function e(t){var n;return C(this,e),(n=k(this,A(e).call(this))).name="HttpReqError",n.status=t.status,n.statusText=t.statusText,n.message="[".concat(t.status,"] ").concat(t.statusText),n.response=t,n}return R(e,t),e}(L(Error)),Z=Date.now||function(){return(new Date).getTime()};var K,Q={};function V(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(Q[t]=window.__dw.vis.meta.locale||{}):Q[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function W(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),Q[n]||V(n),!Q[n][t])return"MISSING:"+t;var r=Q[n][t];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),r}var Y=dw.backend.currentChart,tt=function(t,e,n){var r,a,o,i,s=0;n||(n={});var c=function(){s=!1===n.leading?0:Z(),r=null,i=t.apply(a,o),r||(a=o=null)},u=function(){var u=Z();s||!1!==n.leading||(s=u);var l=e-(u-s);return a=this,o=arguments,l<=0||l>e?(r&&(clearTimeout(r),r=null),s=u,i=t.apply(a,o),r||(a=o=null)):r||!1===n.trailing||(r=setTimeout(c,l)),i};return u.cancel=function(){clearTimeout(r),s=0,r=a=o=null},u}((function(){var t=K.get().chartData;$.put("/v3/charts/".concat(Y.get("id"),"/data"),{body:t,headers:{"Content-Type":"text/csv"}})}),1e3);function et(){K=this}function nt(t){var e=t.changed,n=t.current,r=t.previous;e.chartData&&n.chartData&&r&&r.chartData!==n.chartData&&tt()}function rt(t){var e=this;j(this,t),this._state=o({placeholder:W("upload / paste here")},t.data),this._intro=!0,this._handlers.update=[nt],this._fragment=function(t,e){var n,r,a,o=!1;function i(){o=!0,t.set({chartData:a.value}),o=!1}return{c:function(){var t,o;n=d("form"),r=d("div"),h(a=d("textarea"),"input",i),a.readOnly=e.readonly,a.id="upload-data-text",t="resize",o="none",a.style.setProperty(t,o),a.placeholder=e.placeholder,a.className="svelte-kl1kny",r.className="control-group",n.className="upload-form"},m:function(t,o){c(t,n,o),s(n,r),s(r,a),a.value=e.chartData},p:function(t,e){!o&&t.chartData&&(a.value=e.chartData),t.readonly&&(a.readOnly=e.readonly),t.placeholder&&(a.placeholder=e.placeholder)},d:function(t){t&&u(n),p(a,"input",i)}}}(this,this._state),this.root._oncreate.push((function(){et.call(e),e.fire("update",{changed:i({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),x(this))}function at(t){var e=t.changed,n=t.current;if(e.selectedDataset&&"--"!==n.selectedDataset){var r=n.selectedDataset;this.set({chartData:r.data}),r.presets&&Object.keys(r.presets).forEach((function(t){dw.backend.currentChart.set(t,r.presets[t])}))}}function ot(t,e,n){var r=Object.create(t);return r.dataset=e[n],r}function it(t,e,n){var r=Object.create(t);return r.group=e[n],r}function st(t,e){var n,r,a,o=e.dataset.title;return{c:function(){n=d("option"),r=f(o),n.__value=a=e.dataset,n.value=n.__value,n.className="demo-dataset"},m:function(t,e){c(t,n,e),s(n,r)},p:function(t,e){t.datasetsArray&&o!==(o=e.dataset.title)&&g(r,o),t.datasetsArray&&a!==(a=e.dataset)&&(n.__value=a),n.value=n.__value},d:function(t){t&&u(n)}}}function ct(t,e){for(var n,r,a=e.group.datasets,o=[],i=0;i<a.length;i+=1)o[i]=st(0,ot(e,a,i));return{c:function(){n=d("optgroup");for(var t=0;t<o.length;t+=1)o[t].c();v(n,"label",r=e.group.type)},m:function(t,e){c(t,n,e);for(var r=0;r<o.length;r+=1)o[r].m(n,null)},p:function(t,e){if(t.datasetsArray){a=e.group.datasets;for(var i=0;i<a.length;i+=1){var s=ot(e,a,i);o[i]?o[i].p(t,s):(o[i]=st(0,s),o[i].c(),o[i].m(n,null))}for(;i<o.length;i+=1)o[i].d(1);o.length=a.length}t.datasetsArray&&r!==(r=e.group.type)&&v(n,"label",r)},d:function(t){t&&u(n),l(o,t)}}}function ut(t){var e=this;j(this,t),this._state=o({selectedDataset:"--"},t.data),this._recompute({datasets:1},this._state),this._intro=!0,this._handlers.update=[at],this._fragment=function(t,e){for(var n,r,a,o,i,v,g,_,b,w,D=W("upload / quick help"),x=W("upload / try a dataset"),O=W("upload / sample dataset"),j=!1,T=e.datasetsArray,S=[],P=0;P<T.length;P+=1)S[P]=ct(t,it(e,T,P));function C(){j=!0,t.set({selectedDataset:y(_)}),j=!1}return{c:function(){n=d("p"),r=f(D),a=f("\n\n"),o=d("div"),i=d("p"),v=f(x),g=f("\n    "),_=d("select"),b=d("option"),w=f(O);for(var s=0;s<S.length;s+=1)S[s].c();b.__value="--",b.value=b.__value,h(_,"change",C),"selectedDataset"in e||t.root._beforecreate.push(C),_.disabled=e.readonly,_.id="demo-datasets",_.className="svelte-16u58l0",o.className="demo-datasets"},m:function(t,u){c(t,n,u),s(n,r),c(t,a,u),c(t,o,u),s(o,i),s(i,v),s(o,g),s(o,_),s(_,b),s(b,w);for(var l=0;l<S.length;l+=1)S[l].m(_,null);m(_,e.selectedDataset)},p:function(e,n){if(e.datasetsArray){T=n.datasetsArray;for(var r=0;r<T.length;r+=1){var a=it(n,T,r);S[r]?S[r].p(e,a):(S[r]=ct(t,a),S[r].c(),S[r].m(_,null))}for(;r<S.length;r+=1)S[r].d(1);S.length=T.length}!j&&e.selectedDataset&&m(_,n.selectedDataset),e.readonly&&(_.disabled=n.readonly)},d:function(t){t&&(u(n),u(a),u(o)),l(S,t),p(_,"change",C)}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:i({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),x(this))}function lt(){}o(rt.prototype,P),o(ut.prototype,P),ut.prototype._recompute=function(t,e){var n;t.datasets&&this._differs(e.datasetsArray,e.datasetsArray=(n=e.datasets,Object.keys(n).map((function(t){return n[t]}))))&&(t.datasetsArray=!0)};var dt,ft,ht=(dt=function(t){var e,n,r,a=this,o=t.changed,i=t.current;return e=function(){if(!(o.sheets&&i.sheets.length>1))return function(t){var e=t();if(e&&e.then)return e.then(lt)}((function(){if(o.sheets&&1===i.sheets.length)return t=$.put("/v3/charts/".concat(dw.backend.currentChart.get("id"),"/data"),{body:i.sheets[0].csv,headers:{"Content-Type":"text/csv"}}),e=function(){window.location.href="describe"},n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t);var t,e,n}));setTimeout((function(){a.set({selected:i.sheets[0]})}),300)},n=function(){o.selected&&a.set({chartData:i.selected.csv})},(r=e())&&r.then?r.then(n):n(r)},function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];try{return Promise.resolve(dt.apply(this,t))}catch(t){return Promise.reject(t)}});function pt(t,e,n){var r=Object.create(t);return r.sheet=e[n],r}function vt(t,e){var n,r=W("upload / xls / uploading data");return{c:function(){n=d("p")},m:function(t,e){c(t,n,e),n.innerHTML=r},p:a,d:function(t){t&&u(n)}}}function gt(t,e){for(var n,r,a,o,i,v=W("upload / select sheet"),g=!1,_=e.sheets,b=[],w=0;w<_.length;w+=1)b[w]=yt(t,pt(e,_,w));function D(){g=!0,t.set({selected:y(o)}),g=!1}return{c:function(){n=d("p"),r=f(v),a=f("\n    "),o=d("select");for(var s=0;s<b.length;s+=1)b[s].c();h(o,"change",D),"selected"in e||t.root._beforecreate.push(D),o.disabled=i=!e.sheets.length,o.className="svelte-16u58l0"},m:function(t,i){c(t,n,i),s(n,r),c(t,a,i),c(t,o,i);for(var u=0;u<b.length;u+=1)b[u].m(o,null);m(o,e.selected)},p:function(e,n){if(e.sheets){_=n.sheets;for(var r=0;r<_.length;r+=1){var a=pt(n,_,r);b[r]?b[r].p(e,a):(b[r]=yt(t,a),b[r].c(),b[r].m(o,null))}for(;r<b.length;r+=1)b[r].d(1);b.length=_.length}!g&&e.selected&&m(o,n.selected),e.sheets&&i!==(i=!n.sheets.length)&&(o.disabled=i)},d:function(t){t&&(u(n),u(a),u(o)),l(b,t),p(o,"change",D)}}}function mt(t,e){var n,r=W("upload / parsing-xls");return{c:function(){(n=d("div")).className="alert alert-info"},m:function(t,e){c(t,n,e),n.innerHTML=r},p:a,d:function(t){t&&u(n)}}}function yt(t,e){var n,r,a,o=e.sheet.name;return{c:function(){n=d("option"),r=f(o),n.__value=a=e.sheet,n.value=n.__value},m:function(t,e){c(t,n,e),s(n,r)},p:function(t,e){t.sheets&&o!==(o=e.sheet.name)&&g(r,o),t.sheets&&a!==(a=e.sheet)&&(n.__value=a),n.value=n.__value},d:function(t){t&&u(n)}}}function _t(t){var e=this;j(this,t),this._state=o({selected:!1,sheets:[]},t.data),this._intro=!0,this._handlers.update=[ht],this._fragment=function(t,e){var n;function r(t){return t.sheets.length?t.sheets.length>1?gt:vt:mt}var a=r(e),o=a(t,e);return{c:function(){n=d("div"),o.c()},m:function(t,e){c(t,n,e),o.m(n,null)},p:function(e,i){a===(a=r(i))&&o?o.p(e,i):(o.d(1),(o=a(t,i)).c(),o.m(n,null))},d:function(t){t&&u(n),o.d()}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:i({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),x(this))}function bt(e,n){var r=new FileReader;r.onload=function(){try{for(var a=new Uint8Array(r.result),o="",i=0,s=0;s<a.length;++s)a[s]>122&&i++,o+=String.fromCharCode(a[s]);var c=t.detect(o);c.confidence<=.95&&i<10&&(c.encoding="utf-8"),(r=new FileReader).onload=function(){return n(null,r.result)},r.readAsText(e,c.encoding)}catch(t){console.warn(t),n(null,r.result)}},r.readAsArrayBuffer(e)}function wt(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function Dt(t){return function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];try{return Promise.resolve(t.apply(this,e))}catch(t){return Promise.reject(t)}}}o(_t.prototype,P);var xt=[{id:"copy",title:W("upload / copy-paste"),longTitle:W("upload / copy-paste / long"),icon:"fa fa-clipboard",mainPanel:rt,sidebar:ut,action:function(){}},{id:"upload",title:W("upload / upload-csv"),longTitle:W("upload / upload-csv / long"),icon:"fa-file-excel-o fa",mainPanel:rt,sidebar:ut,isFileUpload:!0,onFileUpload:function(t){try{var e=t.target.files[0];return"text/"===e.type.substr(0,5)||".csv"===e.name.substr(e.name.length-4)?(ft.set({Sidebar:ut}),bt(e,Dt((function(t,e){return t?console.error("could not read file",t):wt($.put("/v3/charts/".concat(dw.backend.currentChart.get("id"),"/data"),{body:e,headers:{"Content-Type":"text/csv"}}),(function(){window.location.href="describe"}))})))):"application/"===e.type.substr(0,12)?(ft.set({Sidebar:_t,sheets:[]}),function(t,e){var n="undefined"!=typeof FileReader&&(FileReader.prototype||{}).readAsBinaryString,r=new FileReader;r.onload=function(){try{var t=n?r.result:new Uint8Array(r.result),a=XLSX.read(t,{type:n?"binary":"array"});e(null,a.SheetNames.map((function(t){return{name:t,sheet:a.Sheets[t],csv:XLSX.utils.sheet_to_csv(a.Sheets[t])}})))}catch(t){console.error(t),e(null,r.result)}},r.readAsBinaryString(t)}(e,(function(t,e){if(t)return ft.set({error:t});ft.set({sheets:e})}))):(console.error(e.type),console.error(e),ft.set({error:W("upload / csv-required")})),wt()}catch(t){return Promise.reject(t)}},action:function(){}}];var Ot={addButton:function(t){xt.push(t),this.set({buttons:xt});var e=this.get().defaultMethod;t.id===e&&this.btnAction(t)},btnAction:function(t){if(this.set({active:t}),"copy"===t.id){var e=this.store.get().dw_chart;e.get("externalData")&&(e.set("externalData",""),setTimeout((function(){dw.backend.currentChart.save()}),1e3))}var n=t.id;"upload"===t.id&&(n="copy",setTimeout((function(){}),1e3)),this.store.get().dw_chart.set("metadata.data.upload-method",n),t.action&&t.action(),t.mainPanel&&this.set({MainPanel:t.mainPanel}),t.sidebar&&this.set({Sidebar:t.sidebar})},btnUpload:function(t,e){t.onFileUpload&&t.onFileUpload(e)},dragStart:function(t){"copy"===this.get().active.id&&(t.preventDefault(),this.set({dragover:!0}))},resetDrag:function(){this.set({dragover:!1})},onFileDrop:function(t){if("copy"===this.get().active.id){this.resetDrag(),t.preventDefault();var e=[];if(t.dataTransfer.items){for(var n=0;n<t.dataTransfer.items.length;n++)"file"===t.dataTransfer.items[n].kind&&e.push(t.dataTransfer.items[n].getAsFile());t.dataTransfer.items.clear()}else{for(var r=0;r<t.dataTransfer.files.length;r++)e.push(t.dataTransfer.files[r]);t.dataTransfer.items.clear()}for(var a=0;a<e.length;a++)if("text/"===e[a].type.substr(0,5))return bt(e[a],Dt((function(t,e){return t?console.error("could not read file",t):wt($.put("/v3/charts/".concat(dw.backend.currentChart.get("id"),"/data"),{body:e,headers:{"Content-Type":"text/csv"}}),(function(){window.location.href="describe"}))})))}}};function jt(){var t=this;ft=this;var e=this.store.get().dw_chart.get("metadata.data.upload-method","copy");this.set({defaultMethod:e}),xt.forEach((function(n){n.id===e&&t.set({active:n})}))}function Tt(t){var e=this._svelte,n=e.component,r=e.ctx;n.btnAction(r.btn)}function St(t){var e=this._svelte,n=e.component,r=e.ctx;n.btnUpload(r.btn,t)}function Pt(t,e,n){var r=Object.create(t);return r.btn=e[n],r}function Ct(t,e){var n,r=W("upload / drag-csv-here");return{c:function(){(n=d("div")).className="draginfo svelte-oe6wy4"},m:function(t,e){c(t,n,e),n.innerHTML=r},d:function(t){t&&u(n)}}}function Nt(t,e){var n;return{c:function(){(n=d("input"))._svelte={component:t,ctx:e},h(n,"change",St),n.accept=".csv, .tsv, .txt, .xlsx, .xls, .ods, .dbf",n.className="file-upload svelte-oe6wy4",v(n,"type","file")},m:function(t,e){c(t,n,e)},p:function(t,r){e=r,n._svelte.ctx=e},d:function(t){t&&u(n),p(n,"change",St)}}}function kt(t,e){var n,r,a,o,i,l,v,m,y,_=e.btn.title,b=e.btn.isFileUpload&&Nt(t,e);return{c:function(){n=d("li"),r=d("label"),b&&b.c(),a=f("\n                            "),o=d("i"),l=f("\n                            "),v=d("span"),m=f(_),o.className=i=e.btn.icon+" svelte-oe6wy4",v.className="svelte-oe6wy4",r.className="svelte-oe6wy4",n._svelte={component:t,ctx:e},h(n,"click",Tt),n.className=y="action "+(e.active==e.btn?"active":"")+" svelte-oe6wy4"},m:function(t,e){c(t,n,e),s(n,r),b&&b.m(r,null),s(r,a),s(r,o),s(r,l),s(r,v),s(v,m)},p:function(s,c){(e=c).btn.isFileUpload?b?b.p(s,e):((b=Nt(t,e)).c(),b.m(r,a)):b&&(b.d(1),b=null),s.buttons&&i!==(i=e.btn.icon+" svelte-oe6wy4")&&(o.className=i),s.buttons&&_!==(_=e.btn.title)&&g(m,_),n._svelte.ctx=e,(s.active||s.buttons)&&y!==(y="action "+(e.active==e.btn?"active":"")+" svelte-oe6wy4")&&(n.className=y)},d:function(t){t&&u(n),b&&b.d(),p(n,"click",Tt)}}}function At(t,e){var n,r,a,o;function i(e){t.set({error:!1})}return{c:function(){n=d("div"),(r=d("div")).textContent="✕",a=f("\n                    "),o=d("noscript"),h(r,"click",i),r.className="action close",n.className="alert alert-error"},m:function(t,i){c(t,n,i),s(n,r),s(n,a),s(n,o),o.insertAdjacentHTML("afterend",e.error)},p:function(t,e){t.error&&(!function(t){for(;t.nextSibling;)t.parentNode.removeChild(t.nextSibling)}(o),o.insertAdjacentHTML("afterend",e.error))},d:function(t){t&&u(n),p(r,"click",i)}}}function Et(t){var e=this;j(this,t),this._state=o({dragover:!1,MainPanel:rt,Sidebar:ut,active:xt[0],buttons:xt,sheets:[],chart:{id:""},readonly:!1,chartData:"",transpose:!1,firstRowIsHeader:!0,skipRows:0},t.data),this._intro=!0,this._fragment=function(t,e){for(var n,r,a,o,i,v,m,y,_,b,w,D,x,O,j,T,S,P,C,N,k,A,E=W("upload / title"),R=e.active.longTitle||e.active.title,U={},F={},M=W("Proceed"),L=e.dragover&&Ct(),H=e.buttons,I=[],q=0;q<H.length;q+=1)I[q]=kt(t,Pt(e,H,q));var B=e.error&&At(t,e),X=e.Sidebar;function J(e){var n={};return void 0!==e.chartData&&(n.chartData=e.chartData,U.chartData=!0),void 0!==e.readonly&&(n.readonly=e.readonly,U.readonly=!0),void 0!==e.sheets&&(n.sheets=e.sheets,U.sheets=!0),void 0!==e.datasets&&(n.datasets=e.datasets,U.datasets=!0),{root:t.root,store:t.store,data:n,_bind:function(e,n){var r={};!U.chartData&&e.chartData&&(r.chartData=n.chartData),!U.readonly&&e.readonly&&(r.readonly=n.readonly),!U.sheets&&e.sheets&&(r.sheets=n.sheets),!U.datasets&&e.datasets&&(r.datasets=n.datasets),t._set(r),U={}}}}if(X){var $=new X(J(e));t.root._beforecreate.push((function(){$._bind({chartData:1,readonly:1,sheets:1,datasets:1},$.get())}))}var G=e.MainPanel;function z(e){var n={};return void 0!==e.chartData&&(n.chartData=e.chartData,F.chartData=!0),void 0!==e.readonly&&(n.readonly=e.readonly,F.readonly=!0),{root:t.root,store:t.store,data:n,_bind:function(e,n){var r={};!F.chartData&&e.chartData&&(r.chartData=n.chartData),!F.readonly&&e.readonly&&(r.readonly=n.readonly),t._set(r),F={}}}}if(G){var Z=new G(z(e));t.root._beforecreate.push((function(){Z._bind({chartData:1,readonly:1},Z.get())}))}function K(e){t.onFileDrop(e)}function Q(e){t.dragStart(e)}function V(e){t.dragStart(e)}function Y(e){t.resetDrag()}function tt(e){t.resetDrag()}return{c:function(){n=d("div"),L&&L.c(),r=f("\n\n    \n    "),a=d("div"),o=d("div"),i=d("div"),v=d("h3"),m=f("\n\n                "),y=d("ul");for(var t=0;t<I.length;t+=1)I[t].c();_=f("\n\n                "),B&&B.c(),b=f("\n\n                "),w=d("h4"),D=f(R),x=f("\n\n                "),$&&$._fragment.c(),O=f("\n        "),j=d("div"),Z&&Z._fragment.c(),T=f("\n\n            "),S=d("div"),P=d("a"),C=f(M),N=f(" "),k=d("i"),y.className="import-methods svelte-oe6wy4",w.className="svelte-oe6wy4",i.className="sidebar",o.className="span5",k.className="icon-chevron-right icon-white",P.href="describe",P.className="submit btn btn-primary svelte-oe6wy4",P.id="describe-proceed",S.className="buttons pull-right",j.className="span7",a.className="row",a.style.cssText=A=e.dragover?"opacity: 0.5;filter:blur(6px);background:white;pointer-events:none":"",h(n,"drop",K),h(n,"dragover",Q),h(n,"dragenter",V),h(n,"dragend",Y),h(n,"dragleave",tt),n.className="chart-editor dw-create-upload upload-data"},m:function(t,e){c(t,n,e),L&&L.m(n,null),s(n,r),s(n,a),s(a,o),s(o,i),s(i,v),v.innerHTML=E,s(i,m),s(i,y);for(var u=0;u<I.length;u+=1)I[u].m(y,null);s(i,_),B&&B.m(i,null),s(i,b),s(i,w),s(w,D),s(i,x),$&&$._mount(i,null),s(a,O),s(a,j),Z&&Z._mount(j,null),s(j,T),s(j,S),s(S,P),s(P,C),s(P,N),s(P,k)},p:function(o,s){if((e=s).dragover?L||((L=Ct()).c(),L.m(n,r)):L&&(L.d(1),L=null),o.active||o.buttons){H=e.buttons;for(var c=0;c<H.length;c+=1){var u=Pt(e,H,c);I[c]?I[c].p(o,u):(I[c]=kt(t,u),I[c].c(),I[c].m(y,null))}for(;c<I.length;c+=1)I[c].d(1);I.length=H.length}e.error?B?B.p(o,e):((B=At(t,e)).c(),B.m(i,b)):B&&(B.d(1),B=null),o.active&&R!==(R=e.active.longTitle||e.active.title)&&g(D,R);var l={};!U.chartData&&o.chartData&&(l.chartData=e.chartData,U.chartData=void 0!==e.chartData),!U.readonly&&o.readonly&&(l.readonly=e.readonly,U.readonly=void 0!==e.readonly),!U.sheets&&o.sheets&&(l.sheets=e.sheets,U.sheets=void 0!==e.sheets),!U.datasets&&o.datasets&&(l.datasets=e.datasets,U.datasets=void 0!==e.datasets),X!==(X=e.Sidebar)?($&&$.destroy(),X?($=new X(J(e)),t.root._beforecreate.push((function(){var t={};void 0===e.chartData&&(t.chartData=1),void 0===e.readonly&&(t.readonly=1),void 0===e.sheets&&(t.sheets=1),void 0===e.datasets&&(t.datasets=1),$._bind(t,$.get())})),$._fragment.c(),$._mount(i,null)):$=null):X&&($._set(l),U={});var d={};!F.chartData&&o.chartData&&(d.chartData=e.chartData,F.chartData=void 0!==e.chartData),!F.readonly&&o.readonly&&(d.readonly=e.readonly,F.readonly=void 0!==e.readonly),G!==(G=e.MainPanel)?(Z&&Z.destroy(),G?(Z=new G(z(e)),t.root._beforecreate.push((function(){var t={};void 0===e.chartData&&(t.chartData=1),void 0===e.readonly&&(t.readonly=1),Z._bind(t,Z.get())})),Z._fragment.c(),Z._mount(j,T)):Z=null):G&&(Z._set(d),F={}),o.dragover&&A!==(A=e.dragover?"opacity: 0.5;filter:blur(6px);background:white;pointer-events:none":"")&&(a.style.cssText=A)},d:function(t){t&&u(n),L&&L.d(),l(I,t),B&&B.d(),$&&$.destroy(),Z&&Z.destroy(),p(n,"drop",K),p(n,"dragover",Q),p(n,"dragenter",V),p(n,"dragend",Y),p(n,"dragleave",tt)}}}(this,this._state),this.root._oncreate.push((function(){jt.call(e),e.fire("update",{changed:i({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),x(this))}function Rt(t,e){this._handlers={},this._dependents=[],this._computed=_(),this._sortedComputedProperties=[],this._state=o({},t),this._differs=e&&e.immutable?w:b}o(Et.prototype,P),o(Et.prototype,Ot),o(Rt.prototype,{_add:function(t,e){this._dependents.push({component:t,props:e})},_init:function(t){for(var e={},n=0;n<t.length;n+=1){var r=t[n];e["$"+r]=this._state[r]}return e},_remove:function(t){for(var e=this._dependents.length;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set:function(t,e){var n=this,r=this._state;this._state=o(o({},r),t);for(var a=0;a<this._sortedComputedProperties.length;a+=1)this._sortedComputedProperties[a].update(this._state,e);this.fire("state",{changed:e,previous:r,current:this._state}),this._dependents.filter((function(t){for(var r={},a=!1,o=0;o<t.props.length;o+=1){var i=t.props[o];i in e&&(r["$"+i]=n._state[i],a=!0)}if(a)return t.component._stage(r),!0})).forEach((function(t){t.component.set({})})),this.fire("update",{changed:e,previous:r,current:this._state})},_sortComputedProperties:function(){var t,e=this._computed,n=this._sortedComputedProperties=[],r=_();function a(o){var i=e[o];i&&(i.deps.forEach((function(e){if(e===t)throw new Error("Cyclical dependency detected between ".concat(e," <-> ").concat(o));a(e)})),r[o]||(r[o]=!0,n.push(i)))}for(var o in this._computed)a(t=o)},compute:function(t,e,n){var r,a=this,i={deps:e,update:function(o,i,s){var c=e.map((function(t){return t in i&&(s=!0),o[t]}));if(s){var u=n.apply(null,c);a._differs(u,r)&&(r=u,i[t]=!0,o[t]=r)}}};this._computed[t]=i,this._sortComputedProperties();var s=o({},this._state),c={};i.update(s,c,!0),this._set(s,c)},fire:D,get:O,on:T,set:function(t){var e=this._state,n=this._changed={},r=!1;for(var a in t){if(this._computed[a])throw new Error("'".concat(a,"' is a read-only computed property"));this._differs(t[a],e[a])&&(n[a]=r=!0)}r&&this._set(t,n)}});return{App:Et,data:{chart:{id:""},readonly:!1,chartData:"",transpose:!1,firstRowIsHeader:!0,skipRows:0},store:new Rt({})}}));
>>>>>>> master
