(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../../../../../../../../../static/vendor/jschardet/jschardet.min.js'), require('../../../../../../../../../static/vendor/xlsx/xlsx.full.min.js')) :
	typeof define === 'function' && define.amd ? define('svelte/upload', ['../../../../../../../../../static/vendor/jschardet/jschardet.min.js', '../../../../../../../../../static/vendor/xlsx/xlsx.full.min.js'], factory) :
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
