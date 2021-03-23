(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/signin', factory) :
	(global = global || self, global.signin = factory());
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
	function data() {
		return {
	    password: ''
	};
	}

	function create_main_fragment(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.password.length>=MIN_CHARACTERS) && create_if_block();

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
						if_block = create_if_block();
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
	function create_if_block(component, ctx) {

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
		this._state = assign(data(), options.data);

		this._recompute({ password: 1, passwordStrength: 1, passwordTooShort: 1, passwordHelp: 1 }, this._state);
		if (!('password' in this._state)) console.warn("<CheckPassword> was created without expected data property 'password'");
		this._intro = true;

		this._fragment = create_main_fragment(this, this._state);

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

	/* signin/SignIn.html generated by Svelte v2.16.1 */



	// eslint-disable-next-line
	const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	function isValidEmail(s) {
	    return emailRegex.test(s);
	}

	function invalidLoginEmail({ loginEmail, forgotPassword }) {
	    return !isValidEmail(loginEmail) && !(loginEmail === '' && !forgotPassword);
	}
	function invalidLoginForm({ loggingIn, loginEmail, loginPassword }) {
	    if (loggingIn) return true;
	    return !isValidEmail(loginEmail) || loginPassword === '';
	}
	function invalidSignupForm({
	    signupWithoutPassword,
	    signingUp,
	    signupEmail,
	    signupPassword,
	    signupPasswordOk
	}) {
	    if (signingUp) return true;
	    if (!isValidEmail(signupEmail)) return true;
	    if (!signupWithoutPassword && !signupPasswordOk) return true;
	}
	function invalidSignupEmail({ signupEmail, forgotPassword }) {
	    return !isValidEmail(signupEmail) && signupEmail !== '';
	}
	function data$1() {
		return {
	    noSignup: false,
	    noSignin: false,
	    signupWithoutPassword: false,
	    alternativeSignIn: [],
	    // login
	    forgotPassword: false,
	    loginEmail: '',
	    loginPassword: '',
	    loginOTP: '',
	    rememberLogin: true,
	    loginEmailError: false,
	    loginError: '',
	    loginSuccess: '',
	    // signup
	    signupEmail: '',
	    signupPassword: '',
	    signupPasswordOk: false,
	    passwordHelp: false,
	    passwordSuccess: false,
	    passwordError: false,
	    showPasswordAsClearText: false,
	    // progressIndicators
	    requestingPassword: false,
	    loggingIn: false,
	    signingUp: false,
	    otpPrompt: false
	};
	}

	var methods = {
	    async doLogIn() {
	        const { loginEmail, loginPassword, rememberLogin, loginOTP } = this.get();
	        this.set({
	            loggingIn: true,
	            otpPrompt: !!loginOTP,
	            loginOTP: '',
	            loginError: '',
	            loginSuccess: ''
	        });
	        try {
	            await httpReq.post('/v3/auth/login', {
	                payload: {
	                    email: loginEmail,
	                    password: loginPassword,
	                    keepSession: rememberLogin,
	                    ...(loginOTP ? { otp: loginOTP } : {})
	                }
	            });
	            this.set({
	                loginSuccess: 'Login successful, reloading page',
	                otpPrompt: false
	            });
	            setTimeout(() => {
	                window.window.location.href = '/';
	            }, 2000);
	        } catch (error) {
	            if (error.name === 'HttpReqError') {
	                const body = await error.response.json();
	                if (body.statusCode === 401 && body.message === 'Need OTP') {
	                    this.set({ otpPrompt: true, loginOTP: '', loggingIn: false });
	                    return;
	                }
	                this.set({ loginError: body ? body.message : error.message });
	            } else {
	                this.set({ loginError: error });
	            }
	        }
	        this.set({ loggingIn: false });
	    },
	    async doSignUp() {
	        const {
	            signupWithoutPassword,
	            signupEmail,
	            signupPassword,
	            signingUp
	        } = this.get();
	        if (signingUp) return;
	        this.set({
	            signingUp: true,
	            signupError: '',
	            signupSuccess: ''
	        });
	        try {
	            await httpReq.post('/v3/auth/signup', {
	                payload: {
	                    email: signupEmail,
	                    invitation: signupWithoutPassword,
	                    password: !signupWithoutPassword ? signupPassword : undefined
	                }
	            });

	            trackEvent('App', 'sign-up');

	            if (!signupWithoutPassword) {
	                this.set({
	                    signupSuccess: 'Sign up successful. Redirecting to user dashboard.'
	                });
	                setTimeout(() => {
	                    window.location.href = '/';
	                }, 2000);
	            } else {
	                this.set({
	                    signupSuccess:
	                        'Please check your e-mail inbox to proceed on your desktop computer.',
	                    signingUp: false
	                });
	            }
	        } catch (error) {
	            if (error.name === 'HttpReqError') {
	                const body = await error.response.json();
	                this.set({ signupError: body ? body.message : error.message });
	            } else {
	                this.set({ signupError: error });
	            }

	            this.set({ signingUp: false });
	        }
	    },
	    async requestNewPassword() {
	        const { loginEmail } = this.get();
	        this.set({
	            requestingPassword: true,
	            loginError: '',
	            loginSuccess: ''
	        });
	        try {
	            await httpReq.post('/v3/auth/reset-password', {
	                payload: {
	                    email: loginEmail
	                }
	            });
	            this.set({ loginSuccess: __('signin / password-reset / success') });
	        } catch (error) {
	            if (error.name === 'HttpReqError') {
	                const body = await error.response.json();
	                this.set({
	                    loginError: body.message
	                        ? __(`signin / password-reset / error / ${body.message}`)
	                        : error.message
	                });
	            } else {
	                this.set({ loginError: error });
	            }
	        }
	        this.set({ requestingPassword: false });
	    }
	};

	function oncreate() {
	    if (window.innerWidth < 740) {
	        this.set({
	            noSignin: true,
	            signupWithoutPassword: true
	        });
	    }
	}
	const file = "signin/SignIn.html";

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.signin = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var div4, button0, text1, div0, text2, text3, text4, div3, div2, raw0_value = __("login / signup / confirmation-email"), raw0_after, text5, div1, raw1_value = __("login / signup / confirmation-email-hint"), text6, button1, raw2_value = __("login / signup / confirm");

		var if_block0 = (!ctx.noSignin) && create_if_block_14(component, ctx);

		function select_block_type_2(ctx) {
			if (!ctx.noSignup) return create_if_block_2;
			return create_else_block_3;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block1 = current_block_type(component, ctx);

		var if_block2 = (!ctx.noSignin && ctx.alternativeSignIn.length) && create_if_block$1(component, ctx);

		function keyup_handler(event) {
			event.stopPropagation();
			component.fire("keyup", event);
		}

		return {
			c: function create() {
				div4 = createElement("div");
				button0 = createElement("button");
				button0.textContent = "×";
				text1 = createText("\n    ");
				div0 = createElement("div");
				if (if_block0) if_block0.c();
				text2 = createText(" ");
				if_block1.c();
				text3 = createText("\n\n    ");
				if (if_block2) if_block2.c();
				text4 = createText("\n\n    ");
				div3 = createElement("div");
				div2 = createElement("div");
				raw0_after = createElement('noscript');
				text5 = createText("\n\n            ");
				div1 = createElement("div");
				text6 = createText("\n\n            ");
				button1 = createElement("button");
				button0.type = "button";
				button0.className = "close";
				button0.dataset.dismiss = "modal";
				addLoc(button0, file, 1, 4, 70);
				div0.className = "row login-signup";
				addLoc(div0, file, 2, 4, 142);
				div1.className = "sub";
				addLoc(div1, file, 232, 12, 9596);
				button1.className = "button btn btn-got-it";
				addLoc(button1, file, 234, 12, 9687);
				div2.className = "jumbo-text";
				addLoc(div2, file, 229, 8, 9496);
				div3.className = "signup-confirm hidden";
				addLoc(div3, file, 228, 4, 9452);
				addListener(div4, "keyup", keyup_handler);
				div4.className = "modal-body svelte-1x6vgwk";
				div4.dataset.piwikMask = true;
				addLoc(div4, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, button0);
				append(div4, text1);
				append(div4, div0);
				if (if_block0) if_block0.m(div0, null);
				append(div0, text2);
				if_block1.m(div0, null);
				append(div4, text3);
				if (if_block2) if_block2.m(div4, null);
				append(div4, text4);
				append(div4, div3);
				append(div3, div2);
				append(div2, raw0_after);
				raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
				append(div2, text5);
				append(div2, div1);
				div1.innerHTML = raw1_value;
				append(div2, text6);
				append(div2, button1);
				button1.innerHTML = raw2_value;
			},

			p: function update(changed, ctx) {
				if (!ctx.noSignin) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_14(component, ctx);
						if_block0.c();
						if_block0.m(div0, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(div0, null);
				}

				if (!ctx.noSignin && ctx.alternativeSignIn.length) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$1(component, ctx);
						if_block2.c();
						if_block2.m(div4, text4);
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

				if (if_block0) if_block0.d();
				if_block1.d();
				if (if_block2) if_block2.d();
				removeListener(div4, "keyup", keyup_handler);
			}
		};
	}

	// (4:8) {#if !noSignin}
	function create_if_block_14(component, ctx) {
		var div3, h3, raw_value = __("login / login / headline"), text0, text1, text2, text3, form, div0, text4, text5, div2, text6, div1, div3_class_value;

		var if_block0 = (!ctx.otpPrompt) && create_if_block_24();

		var if_block1 = (ctx.loginSuccess) && create_if_block_23(component, ctx);

		var if_block2 = (ctx.loginError) && create_if_block_22(component, ctx);

		function select_block_type(ctx) {
			if (!ctx.otpPrompt) return create_if_block_20;
			return create_else_block_5;
		}

		var current_block_type = select_block_type(ctx);
		var if_block3 = current_block_type(component, ctx);

		var if_block4 = (!ctx.forgotPassword) && create_if_block_18(component, ctx);

		var if_block5 = (ctx.forgotPassword) && create_if_block_16(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.forgotPassword) return create_if_block_15;
			return create_else_block_4;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block6 = current_block_type_1(component, ctx);

		return {
			c: function create() {
				div3 = createElement("div");
				h3 = createElement("h3");
				text0 = createText("\n\n            ");
				if (if_block0) if_block0.c();
				text1 = createText(" ");
				if (if_block1) if_block1.c();
				text2 = createText(" ");
				if (if_block2) if_block2.c();
				text3 = createText("\n\n            ");
				form = createElement("form");
				div0 = createElement("div");
				if_block3.c();
				text4 = createText("\n                ");
				if (if_block4) if_block4.c();
				text5 = createText("\n\n            ");
				div2 = createElement("div");
				if (if_block5) if_block5.c();
				text6 = createText("\n                ");
				div1 = createElement("div");
				if_block6.c();
				h3.className = "svelte-1x6vgwk";
				addLoc(h3, file, 5, 12, 264);
				div0.className = "svelte-1x6vgwk";
				addLoc(div0, file, 20, 16, 756);
				form.className = "login-form form-vertical";
				addLoc(form, file, 19, 12, 700);
				div1.className = "svelte-1x6vgwk";
				addLoc(div1, file, 87, 16, 3654);
				div2.className = "svelte-1x6vgwk";
				addLoc(div2, file, 74, 12, 3078);
				div3.className = div3_class_value = "span" + (ctx.noSignup ? 4 : 3) + " row-login" + " svelte-1x6vgwk";
				addLoc(div3, file, 4, 8, 205);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(div3, h3);
				h3.innerHTML = raw_value;
				append(div3, text0);
				if (if_block0) if_block0.m(div3, null);
				append(div3, text1);
				if (if_block1) if_block1.m(div3, null);
				append(div3, text2);
				if (if_block2) if_block2.m(div3, null);
				append(div3, text3);
				append(div3, form);
				append(form, div0);
				if_block3.m(div0, null);
				append(form, text4);
				if (if_block4) if_block4.m(form, null);
				append(div3, text5);
				append(div3, div2);
				if (if_block5) if_block5.m(div2, null);
				append(div2, text6);
				append(div2, div1);
				if_block6.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (!ctx.otpPrompt) {
					if (!if_block0) {
						if_block0 = create_if_block_24();
						if_block0.c();
						if_block0.m(div3, text1);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.loginSuccess) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_23(component, ctx);
						if_block1.c();
						if_block1.m(div3, text2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.loginError) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_22(component, ctx);
						if_block2.c();
						if_block2.m(div3, text3);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3.d(1);
					if_block3 = current_block_type(component, ctx);
					if_block3.c();
					if_block3.m(div0, null);
				}

				if (!ctx.forgotPassword) {
					if (if_block4) {
						if_block4.p(changed, ctx);
					} else {
						if_block4 = create_if_block_18(component, ctx);
						if_block4.c();
						if_block4.m(form, null);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if (ctx.forgotPassword) {
					if (if_block5) {
						if_block5.p(changed, ctx);
					} else {
						if_block5 = create_if_block_16(component, ctx);
						if_block5.c();
						if_block5.m(div2, text6);
					}
				} else if (if_block5) {
					if_block5.d(1);
					if_block5 = null;
				}

				if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
					if_block6.d(1);
					if_block6 = current_block_type_1(component, ctx);
					if_block6.c();
					if_block6.m(div1, null);
				}

				if ((changed.noSignup) && div3_class_value !== (div3_class_value = "span" + (ctx.noSignup ? 4 : 3) + " row-login" + " svelte-1x6vgwk")) {
					div3.className = div3_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div3);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if_block3.d();
				if (if_block4) if_block4.d();
				if (if_block5) if_block5.d();
				if_block6.d();
			}
		};
	}

	// (8:12) {#if !otpPrompt}
	function create_if_block_24(component, ctx) {
		var p, raw_value = __("login / login / intro");

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file, 8, 12, 354);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (10:18) {#if loginSuccess}
	function create_if_block_23(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-success svelte-1x6vgwk";
				addLoc(div, file, 10, 12, 446);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.loginSuccess;
			},

			p: function update(changed, ctx) {
				if (changed.loginSuccess) {
					div.innerHTML = ctx.loginSuccess;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (14:18) {#if loginError}
	function create_if_block_22(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-error svelte-1x6vgwk";
				addLoc(div, file, 14, 12, 583);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.loginError;
			},

			p: function update(changed, ctx) {
				if (changed.loginError) {
					div.innerHTML = ctx.loginError;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (42:26) {:else}
	function create_else_block_5(component, ctx) {
		var p, text_1, input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ loginOTP: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				p = createElement("p");
				p.textContent = "Please insert your OTP device and click its button, or enter a code from\n                        your configured OTP app.";
				text_1 = createText("\n                    ");
				input = createElement("input");
				addLoc(p, file, 43, 20, 1780);
				addListener(input, "input", input_input_handler);
				input.className = "login-pwd input-xxlarge span3 svelte-1x6vgwk";
				input.autocomplete = "off";
				setAttribute(input, "type", "password");
				input.dataset.lpignore = "true";
				input.autofocus = true;
				addLoc(input, file, 47, 20, 1975);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				insert(target, text_1, anchor);
				insert(target, input, anchor);

				input.value = ctx.loginOTP;

				input.focus();
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.loginOTP) input.value = ctx.loginOTP;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
					detachNode(text_1);
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (22:20) {#if !otpPrompt}
	function create_if_block_20(component, ctx) {
		var div, label, text0_value = __('email'), text0, text1, input, input_updating = false, text2, if_block_anchor;

		function input_input_handler() {
			input_updating = true;
			component.set({ loginEmail: input.value });
			input_updating = false;
		}

		var if_block = (!ctx.forgotPassword) && create_if_block_21(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text0 = createText(text0_value);
				text1 = createText("\n                        ");
				input = createElement("input");
				text2 = createText("\n                    ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				label.className = "svelte-1x6vgwk";
				addLoc(label, file, 23, 24, 903);
				addListener(input, "input", input_input_handler);
				input.className = "login-email input-xxlarge span3 svelte-1x6vgwk";
				input.autocomplete = "username";
				setAttribute(input, "type", "email");
				addLoc(input, file, 24, 24, 956);
				div.className = "control-group svelte-1x6vgwk";
				toggleClass(div, "error", ctx.invalidLoginEmail);
				addLoc(div, file, 22, 20, 819);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, label);
				append(label, text0);
				append(div, text1);
				append(div, input);

				input.value = ctx.loginEmail;

				insert(target, text2, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.loginEmail) input.value = ctx.loginEmail;
				if (changed.invalidLoginEmail) {
					toggleClass(div, "error", ctx.invalidLoginEmail);
				}

				if (!ctx.forgotPassword) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_21(component, ctx);
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
					detachNode(div);
				}

				removeListener(input, "input", input_input_handler);
				if (detach) {
					detachNode(text2);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (32:20) {#if !forgotPassword}
	function create_if_block_21(component, ctx) {
		var div, label, text0_value = __('password'), text0, text1, input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ loginPassword: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text0 = createText(text0_value);
				text1 = createText("\n                        ");
				input = createElement("input");
				label.className = "svelte-1x6vgwk";
				addLoc(label, file, 33, 24, 1344);
				addListener(input, "input", input_input_handler);
				input.className = "login-pwd input-xxlarge span3 svelte-1x6vgwk";
				input.autocomplete = "current-password";
				setAttribute(input, "type", "password");
				addLoc(input, file, 34, 24, 1400);
				div.className = "control-group svelte-1x6vgwk";
				addLoc(div, file, 32, 20, 1292);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, label);
				append(label, text0);
				append(div, text1);
				append(div, input);

				input.value = ctx.loginPassword;
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.loginPassword) input.value = ctx.loginPassword;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (58:16) {#if !forgotPassword}
	function create_if_block_18(component, ctx) {
		var div, label, input, text0, raw_value = __("Remember login?"), raw_before, text1, button, text2;

		function input_change_handler() {
			component.set({ rememberLogin: input.checked });
		}

		var if_block = (ctx.loggingIn) && create_if_block_19();

		function click_handler(event) {
			event.preventDefault();
			component.doLogIn();
		}

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				input = createElement("input");
				text0 = createText("\n                        ");
				raw_before = createElement('noscript');
				text1 = createText("\n                    ");
				button = createElement("button");
				if (if_block) if_block.c();
				text2 = createText(" Login");
				addListener(input, "change", input_change_handler);
				input.className = "keep-login svelte-1x6vgwk";
				setAttribute(input, "type", "checkbox");
				addLoc(input, file, 60, 24, 2496);
				label.className = "checkbox svelte-1x6vgwk";
				label.htmlFor = "keep-login";
				setStyle(label, "margin-top", "10px");
				addLoc(label, file, 59, 20, 2404);
				addListener(button, "click", click_handler);
				button.disabled = ctx.invalidLoginForm;
				button.className = "btn btn-login btn-primary svelte-1x6vgwk";
				addLoc(button, file, 63, 20, 2673);
				div.className = "svelte-1x6vgwk";
				addLoc(div, file, 58, 16, 2378);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, label);
				append(label, input);

				input.checked = ctx.rememberLogin;

				append(label, text0);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				append(div, text1);
				append(div, button);
				if (if_block) if_block.m(button, null);
				append(button, text2);
			},

			p: function update(changed, ctx) {
				if (changed.rememberLogin) input.checked = ctx.rememberLogin;

				if (ctx.loggingIn) {
					if (!if_block) {
						if_block = create_if_block_19();
						if_block.c();
						if_block.m(button, text2);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.invalidLoginForm) {
					button.disabled = ctx.invalidLoginForm;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(input, "change", input_change_handler);
				if (if_block) if_block.d();
				removeListener(button, "click", click_handler);
			}
		};
	}

	// (69:24) {#if loggingIn}
	function create_if_block_19(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-fw fa-spinner fa-pulse";
				addLoc(i, file, 68, 39, 2914);
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

	// (76:16) {#if forgotPassword}
	function create_if_block_16(component, ctx) {
		var div, button, text, raw_value = __("Send new password"), raw_before;

		var if_block = (ctx.requestingPassword) && create_if_block_17();

		function click_handler(event) {
			event.preventDefault();
			component.requestNewPassword();
		}

		return {
			c: function create() {
				div = createElement("div");
				button = createElement("button");
				if (if_block) if_block.c();
				text = createText("\n                        ");
				raw_before = createElement('noscript');
				addListener(button, "click", click_handler);
				button.disabled = ctx.invalidLoginEmail;
				button.className = "btn btn-send-pw btn-primary";
				addLoc(button, file, 77, 20, 3193);
				setStyle(div, "padding-bottom", "10px");
				div.className = "svelte-1x6vgwk";
				addLoc(div, file, 76, 16, 3137);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, button);
				if (if_block) if_block.m(button, null);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if (ctx.requestingPassword) {
					if (!if_block) {
						if_block = create_if_block_17();
						if_block.c();
						if_block.m(button, text);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.invalidLoginEmail) {
					button.disabled = ctx.invalidLoginEmail;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block) if_block.d();
				removeListener(button, "click", click_handler);
			}
		};
	}

	// (83:24) {#if requestingPassword}
	function create_if_block_17(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-fw fa-spinner fa-pulse";
				addLoc(i, file, 82, 48, 3457);
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

	// (93:20) {:else}
	function create_else_block_4(component, ctx) {
		var a, raw_value = __("Can't recall your password?");

		function click_handler(event) {
			event.preventDefault();
			component.set({forgotPassword:true});
		}

		return {
			c: function create() {
				a = createElement("a");
				addListener(a, "click", click_handler);
				a.href = "#/forgot-password";
				addLoc(a, file, 93, 20, 3925);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				a.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	// (89:20) {#if forgotPassword}
	function create_if_block_15(component, ctx) {
		var a, raw_value = __("Return to login...");

		function click_handler(event) {
			event.preventDefault();
			component.set({forgotPassword:false});
		}

		return {
			c: function create() {
				a = createElement("a");
				addListener(a, "click", click_handler);
				a.href = "#/return";
				addLoc(a, file, 89, 20, 3721);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				a.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	// (202:8) {:else}
	function create_else_block_3(component, ctx) {
		var style;

		return {
			c: function create() {
				style = createElement("style");
				style.textContent = "#dwLoginForm {\n                width: 420px;\n                margin-left: -210px;\n                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);\n                border: 0;\n                position: relative;\n            }";
				addLoc(style, file, 202, 8, 8683);
			},

			m: function mount(target, anchor) {
				insert(target, style, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(style);
				}
			}
		};
	}

	// (101:14) {#if !noSignup}
	function create_if_block_2(component, ctx) {
		var div, h3, raw_value = __("login / signup / headline"), text0, text1, text2, text3, text4, div_class_value;

		function select_block_type_3(ctx) {
			if (ctx.signupWithoutPassword) return create_if_block_13;
			return create_else_block_2;
		}

		var current_block_type = select_block_type_3(ctx);
		var if_block0 = current_block_type(component, ctx);

		var if_block1 = (ctx.signupSuccess) && create_if_block_12(component, ctx);

		var if_block2 = (ctx.signupError) && create_if_block_11(component, ctx);

		var if_block3 = (!ctx.signupSuccess || !ctx.signupWithoutPassword) && create_if_block_4(component, ctx);

		var if_block4 = (ctx.signupWithoutPassword && !ctx.signupSuccess) && create_if_block_3(component);

		return {
			c: function create() {
				div = createElement("div");
				h3 = createElement("h3");
				text0 = createText("\n\n            ");
				if_block0.c();
				text1 = createText(" ");
				if (if_block1) if_block1.c();
				text2 = createText(" ");
				if (if_block2) if_block2.c();
				text3 = createText(" ");
				if (if_block3) if_block3.c();
				text4 = createText(" ");
				if (if_block4) if_block4.c();
				h3.className = "svelte-1x6vgwk";
				addLoc(h3, file, 102, 12, 4279);
				div.className = div_class_value = "span" + (ctx.noSignin ? 4 : 3) + " row-signup" + " svelte-1x6vgwk";
				addLoc(div, file, 101, 8, 4219);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, h3);
				h3.innerHTML = raw_value;
				append(div, text0);
				if_block0.m(div, null);
				append(div, text1);
				if (if_block1) if_block1.m(div, null);
				append(div, text2);
				if (if_block2) if_block2.m(div, null);
				append(div, text3);
				if (if_block3) if_block3.m(div, null);
				append(div, text4);
				if (if_block4) if_block4.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(div, text1);
				}

				if (ctx.signupSuccess) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_12(component, ctx);
						if_block1.c();
						if_block1.m(div, text2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.signupError) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_11(component, ctx);
						if_block2.c();
						if_block2.m(div, text3);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (!ctx.signupSuccess || !ctx.signupWithoutPassword) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block_4(component, ctx);
						if_block3.c();
						if_block3.m(div, text4);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (ctx.signupWithoutPassword && !ctx.signupSuccess) {
					if (!if_block4) {
						if_block4 = create_if_block_3(component);
						if_block4.c();
						if_block4.m(div, null);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if ((changed.noSignin) && div_class_value !== (div_class_value = "span" + (ctx.noSignin ? 4 : 3) + " row-signup" + " svelte-1x6vgwk")) {
					div.className = div_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();
			}
		};
	}

	// (112:12) {:else}
	function create_else_block_2(component, ctx) {
		var p, raw_value = __("login / signup / intro");

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file, 112, 12, 4561);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (105:12) {#if signupWithoutPassword}
	function create_if_block_13(component, ctx) {
		var p0, text0_value = __('signup / mobile / p1'), text0, text1, p1, text2_value = __('signup / mobile / p2'), text2;

		return {
			c: function create() {
				p0 = createElement("p");
				text0 = createText(text0_value);
				text1 = createText("\n            ");
				p1 = createElement("p");
				text2 = createText(text2_value);
				addLoc(p0, file, 105, 12, 4381);
				addLoc(p1, file, 108, 12, 4461);
			},

			m: function mount(target, anchor) {
				insert(target, p0, anchor);
				append(p0, text0);
				insert(target, text1, anchor);
				insert(target, p1, anchor);
				append(p1, text2);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p0);
					detachNode(text1);
					detachNode(p1);
				}
			}
		};
	}

	// (114:18) {#if signupSuccess}
	function create_if_block_12(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-success svelte-1x6vgwk";
				addLoc(div, file, 114, 12, 4655);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.signupSuccess;
			},

			p: function update(changed, ctx) {
				if (changed.signupSuccess) {
					div.innerHTML = ctx.signupSuccess;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (118:18) {#if signupError}
	function create_if_block_11(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-error svelte-1x6vgwk";
				addLoc(div, file, 118, 12, 4794);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.signupError;
			},

			p: function update(changed, ctx) {
				if (changed.signupError) {
					div.innerHTML = ctx.signupError;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (122:18) {#if !signupSuccess || !signupWithoutPassword}
	function create_if_block_4(component, ctx) {
		var div1, form, div0, label, text0_value = __('email'), text0, text1, input, input_updating = false, text2, text3, button, text4, raw_value = __('Sign Up'), raw_before;

		function input_input_handler() {
			input_updating = true;
			component.set({ signupEmail: input.value });
			input_updating = false;
		}

		var if_block0 = (!ctx.signupWithoutPassword) && create_if_block_6(component, ctx);

		function select_block_type_6(ctx) {
			if (ctx.signingUp) return create_if_block_5;
			return create_else_block;
		}

		var current_block_type = select_block_type_6(ctx);
		var if_block1 = current_block_type(component, ctx);

		function click_handler(event) {
			event.preventDefault();
			component.doSignUp();
		}

		return {
			c: function create() {
				div1 = createElement("div");
				form = createElement("form");
				div0 = createElement("div");
				label = createElement("label");
				text0 = createText(text0_value);
				text1 = createText("\n                        ");
				input = createElement("input");
				text2 = createText("\n                    ");
				if (if_block0) if_block0.c();
				text3 = createText("\n                    ");
				button = createElement("button");
				if_block1.c();
				text4 = createText("\n                        \n                        ");
				raw_before = createElement('noscript');
				label.className = "svelte-1x6vgwk";
				addLoc(label, file, 125, 24, 5125);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "email");
				input.autocomplete = "username";
				input.className = "span3 input-xlarge register-email svelte-1x6vgwk";
				addLoc(input, file, 126, 24, 5178);
				div0.className = "control-group svelte-1x6vgwk";
				toggleClass(div0, "error", ctx.invalidSignupEmail);
				addLoc(div0, file, 124, 20, 5040);
				addListener(button, "click", click_handler);
				button.disabled = ctx.invalidSignupForm;
				button.className = "btn btn-default";
				addLoc(button, file, 181, 20, 7837);
				addLoc(form, file, 123, 16, 5013);
				div1.className = "signup-form form-vertcal svelte-1x6vgwk";
				addLoc(div1, file, 122, 12, 4958);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, form);
				append(form, div0);
				append(div0, label);
				append(label, text0);
				append(div0, text1);
				append(div0, input);

				input.value = ctx.signupEmail;

				append(form, text2);
				if (if_block0) if_block0.m(form, null);
				append(form, text3);
				append(form, button);
				if_block1.m(button, null);
				append(button, text4);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.signupEmail) input.value = ctx.signupEmail;
				if (changed.invalidSignupEmail) {
					toggleClass(div0, "error", ctx.invalidSignupEmail);
				}

				if (!ctx.signupWithoutPassword) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_6(component, ctx);
						if_block0.c();
						if_block0.m(form, text3);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type !== (current_block_type = select_block_type_6(ctx))) {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(button, text4);
				}

				if (changed.invalidSignupForm) {
					button.disabled = ctx.invalidSignupForm;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(input, "input", input_input_handler);
				if (if_block0) if_block0.d();
				if_block1.d();
				removeListener(button, "click", click_handler);
			}
		};
	}

	// (134:20) {#if !signupWithoutPassword}
	function create_if_block_6(component, ctx) {
		var div1, label0, text0_value = __('password'), text0, text1, text2, div0, checkpassword_updating = {}, text3, text4, div2, label1, input, text5, raw_value = __("account / invite / password-clear-text"), raw_before;

		function select_block_type_4(ctx) {
			if (ctx.showPasswordAsClearText) return create_if_block_10;
			return create_else_block_1;
		}

		var current_block_type = select_block_type_4(ctx);
		var if_block0 = current_block_type(component, ctx);

		var checkpassword_initial_data = {};
		if (ctx.signupPassword !== void 0) {
			checkpassword_initial_data.password = ctx.signupPassword;
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
		if (ctx.signupPasswordOk !== void 0) {
			checkpassword_initial_data.passwordOk = ctx.signupPasswordOk;
			checkpassword_updating.passwordOk = true;
		}
		var checkpassword = new CheckPassword({
			root: component.root,
			store: component.store,
			data: checkpassword_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkpassword_updating.password && changed.password) {
					newState.signupPassword = childState.password;
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
					newState.signupPasswordOk = childState.passwordOk;
				}
				component._set(newState);
				checkpassword_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkpassword._bind({ password: 1, passwordHelp: 1, passwordSuccess: 1, passwordError: 1, passwordOk: 1 }, checkpassword.get());
		});

		function select_block_type_5(ctx) {
			if (ctx.passwordError) return create_if_block_7;
			if (ctx.passwordSuccess) return create_if_block_8;
			if (ctx.passwordHelp) return create_if_block_9;
		}

		var current_block_type_1 = select_block_type_5(ctx);
		var if_block1 = current_block_type_1 && current_block_type_1(component, ctx);

		function input_change_handler() {
			component.set({ showPasswordAsClearText: input.checked });
		}

		return {
			c: function create() {
				div1 = createElement("div");
				label0 = createElement("label");
				text0 = createText(text0_value);
				text1 = createText("\n                        ");
				if_block0.c();
				text2 = createText("\n                        ");
				div0 = createElement("div");
				checkpassword._fragment.c();
				text3 = createText("\n                            ");
				if (if_block1) if_block1.c();
				text4 = createText("\n                    ");
				div2 = createElement("div");
				label1 = createElement("label");
				input = createElement("input");
				text5 = createText("\n                            ");
				raw_before = createElement('noscript');
				label0.className = "svelte-1x6vgwk";
				addLoc(label0, file, 139, 24, 5731);
				setStyle(div0, "width", "270px");
				div0.className = "svelte-1x6vgwk";
				addLoc(div0, file, 157, 24, 6543);
				div1.className = "control-group svelte-1x6vgwk";
				toggleClass(div1, "warning", ctx.passwordError);
				toggleClass(div1, "success", ctx.passwordSuccess);
				addLoc(div1, file, 134, 20, 5524);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "checkbox");
				input.className = "svelte-1x6vgwk";
				addLoc(input, file, 176, 28, 7585);
				label1.className = "checkbox svelte-1x6vgwk";
				label1.htmlFor = "keep-login";
				setStyle(label1, "margin-top", "10px");
				addLoc(label1, file, 175, 24, 7489);
				div2.className = "control-group svelte-1x6vgwk";
				addLoc(div2, file, 174, 20, 7437);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, label0);
				append(label0, text0);
				append(div1, text1);
				if_block0.m(div1, null);
				append(div1, text2);
				append(div1, div0);
				checkpassword._mount(div0, null);
				append(div0, text3);
				if (if_block1) if_block1.m(div0, null);
				insert(target, text4, anchor);
				insert(target, div2, anchor);
				append(div2, label1);
				append(label1, input);

				input.checked = ctx.showPasswordAsClearText;

				append(label1, text5);
				append(label1, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(div1, text2);
				}

				var checkpassword_changes = {};
				if (!checkpassword_updating.password && changed.signupPassword) {
					checkpassword_changes.password = ctx.signupPassword;
					checkpassword_updating.password = ctx.signupPassword !== void 0;
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
				if (!checkpassword_updating.passwordOk && changed.signupPasswordOk) {
					checkpassword_changes.passwordOk = ctx.signupPasswordOk;
					checkpassword_updating.passwordOk = ctx.signupPasswordOk !== void 0;
				}
				checkpassword._set(checkpassword_changes);
				checkpassword_updating = {};

				if (current_block_type_1 === (current_block_type_1 = select_block_type_5(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if (if_block1) if_block1.d(1);
					if_block1 = current_block_type_1 && current_block_type_1(component, ctx);
					if (if_block1) if_block1.c();
					if (if_block1) if_block1.m(div0, null);
				}

				if (changed.passwordError) {
					toggleClass(div1, "warning", ctx.passwordError);
				}

				if (changed.passwordSuccess) {
					toggleClass(div1, "success", ctx.passwordSuccess);
				}

				if (changed.showPasswordAsClearText) input.checked = ctx.showPasswordAsClearText;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if_block0.d();
				checkpassword.destroy();
				if (if_block1) if_block1.d();
				if (detach) {
					detachNode(text4);
					detachNode(div2);
				}

				removeListener(input, "change", input_change_handler);
			}
		};
	}

	// (149:24) {:else}
	function create_else_block_1(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ signupPassword: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				input.dataset.lpignore = "true";
				input.autocomplete = "off";
				setAttribute(input, "type", "password");
				input.className = "span3 input-xlarge register-pwd svelte-1x6vgwk";
				addLoc(input, file, 149, 24, 6191);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.signupPassword;
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.signupPassword) input.value = ctx.signupPassword;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (141:24) {#if showPasswordAsClearText}
	function create_if_block_10(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ signupPassword: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				input.dataset.lpignore = "true";
				input.autocomplete = "off";
				setAttribute(input, "type", "text");
				input.className = "span3 input-xlarge register-pwd svelte-1x6vgwk";
				addLoc(input, file, 141, 24, 5841);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.signupPassword;
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.signupPassword) input.value = ctx.signupPassword;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (170:50) 
	function create_if_block_9(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "help muted svelte-1x6vgwk";
				addLoc(p, file, 170, 28, 7278);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.passwordHelp;
			},

			p: function update(changed, ctx) {
				if (changed.passwordHelp) {
					p.innerHTML = ctx.passwordHelp;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (168:53) 
	function create_if_block_8(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "help text-success svelte-1x6vgwk";
				addLoc(p, file, 168, 28, 7142);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.passwordSuccess;
			},

			p: function update(changed, ctx) {
				if (changed.passwordSuccess) {
					p.innerHTML = ctx.passwordSuccess;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (166:28) {#if passwordError}
	function create_if_block_7(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "help text-warning svelte-1x6vgwk";
				addLoc(p, file, 166, 28, 7005);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.passwordError;
			},

			p: function update(changed, ctx) {
				if (changed.passwordError) {
					p.innerHTML = ctx.passwordError;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (187:83) {:else}
	function create_else_block(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-fw fa-pencil";
				addLoc(i, file, 186, 90, 8121);
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

	// (187:24) {#if signingUp}
	function create_if_block_5(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-fw fa-spinner fa-pulse";
				addLoc(i, file, 186, 39, 8070);
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

	// (196:18) {#if signupWithoutPassword && !signupSuccess}
	function create_if_block_3(component, ctx) {
		var a, text_value = __('signup / mobile / back'), text;

		function click_handler(event) {
			component.set({signupWithoutPassword: false, noSignin: false});
		}

		return {
			c: function create() {
				a = createElement("a");
				text = createText(text_value);
				addListener(a, "click", click_handler);
				a.href = "#";
				addLoc(a, file, 196, 12, 8483);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	// (215:4) {#if !noSignin && alternativeSignIn.length}
	function create_if_block$1(component, ctx) {
		var div2, div0, raw0_value = __("login / alternative signin"), raw0_after, text0, text1, text2, div1, raw1_value = __("login / agree-terms");

		var each_value = ctx.alternativeSignIn;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				raw0_after = createElement('noscript');
				text0 = createText(" ");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text1 = createText(".");
				text2 = createText("\n        ");
				div1 = createElement("div");
				div0.className = "svelte-1x6vgwk";
				addLoc(div0, file, 216, 8, 9055);
				div1.className = "svelte-1x6vgwk";
				addLoc(div1, file, 222, 8, 9359);
				div2.className = "alternative-signin svelte-1x6vgwk";
				addLoc(div2, file, 215, 4, 9014);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div0, raw0_after);
				raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
				append(div0, text0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}

				append(div0, text1);
				append(div2, text2);
				append(div2, div1);
				div1.innerHTML = raw1_value;
			},

			p: function update(changed, ctx) {
				if (changed.alternativeSignIn) {
					each_value = ctx.alternativeSignIn;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div0, text1);
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

	// (220:17) {#if signin.icon}
	function create_if_block_1(component, ctx) {
		var i, i_class_value;

		return {
			c: function create() {
				i = createElement("i");
				i.className = i_class_value = "" + ctx.signin.icon + " svelte-1x6vgwk";
				addLoc(i, file, 219, 34, 9253);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.alternativeSignIn) && i_class_value !== (i_class_value = "" + ctx.signin.icon + " svelte-1x6vgwk")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (218:53) {#each alternativeSignIn as signin}
	function create_each_block(component, ctx) {
		var a, text, raw_value = ctx.signin.label, raw_before, a_href_value;

		var if_block = (ctx.signin.icon) && create_if_block_1(component, ctx);

		return {
			c: function create() {
				a = createElement("a");
				if (if_block) if_block.c();
				text = createText(" ");
				raw_before = createElement('noscript');
				a.href = a_href_value = ctx.signin.url;
				a.className = "alternative-signin-link svelte-1x6vgwk";
				addLoc(a, file, 218, 12, 9162);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				if (if_block) if_block.m(a, null);
				append(a, text);
				append(a, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if (ctx.signin.icon) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1(component, ctx);
						if_block.c();
						if_block.m(a, text);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.alternativeSignIn) && raw_value !== (raw_value = ctx.signin.label)) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}

				if ((changed.alternativeSignIn) && a_href_value !== (a_href_value = ctx.signin.url)) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				if (if_block) if_block.d();
			}
		};
	}

	function SignIn(options) {
		this._debugName = '<SignIn>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);

		this._recompute({ loginEmail: 1, forgotPassword: 1, loggingIn: 1, loginPassword: 1, signupWithoutPassword: 1, signingUp: 1, signupEmail: 1, signupPassword: 1, signupPasswordOk: 1 }, this._state);
		if (!('loginEmail' in this._state)) console.warn("<SignIn> was created without expected data property 'loginEmail'");
		if (!('forgotPassword' in this._state)) console.warn("<SignIn> was created without expected data property 'forgotPassword'");
		if (!('loggingIn' in this._state)) console.warn("<SignIn> was created without expected data property 'loggingIn'");
		if (!('loginPassword' in this._state)) console.warn("<SignIn> was created without expected data property 'loginPassword'");
		if (!('signupWithoutPassword' in this._state)) console.warn("<SignIn> was created without expected data property 'signupWithoutPassword'");
		if (!('signingUp' in this._state)) console.warn("<SignIn> was created without expected data property 'signingUp'");
		if (!('signupEmail' in this._state)) console.warn("<SignIn> was created without expected data property 'signupEmail'");
		if (!('signupPassword' in this._state)) console.warn("<SignIn> was created without expected data property 'signupPassword'");
		if (!('signupPasswordOk' in this._state)) console.warn("<SignIn> was created without expected data property 'signupPasswordOk'");
		if (!('noSignin' in this._state)) console.warn("<SignIn> was created without expected data property 'noSignin'");
		if (!('noSignup' in this._state)) console.warn("<SignIn> was created without expected data property 'noSignup'");
		if (!('otpPrompt' in this._state)) console.warn("<SignIn> was created without expected data property 'otpPrompt'");
		if (!('loginSuccess' in this._state)) console.warn("<SignIn> was created without expected data property 'loginSuccess'");
		if (!('loginError' in this._state)) console.warn("<SignIn> was created without expected data property 'loginError'");

		if (!('loginOTP' in this._state)) console.warn("<SignIn> was created without expected data property 'loginOTP'");
		if (!('rememberLogin' in this._state)) console.warn("<SignIn> was created without expected data property 'rememberLogin'");

		if (!('requestingPassword' in this._state)) console.warn("<SignIn> was created without expected data property 'requestingPassword'");
		if (!('signupSuccess' in this._state)) console.warn("<SignIn> was created without expected data property 'signupSuccess'");
		if (!('signupError' in this._state)) console.warn("<SignIn> was created without expected data property 'signupError'");

		if (!('passwordError' in this._state)) console.warn("<SignIn> was created without expected data property 'passwordError'");
		if (!('passwordSuccess' in this._state)) console.warn("<SignIn> was created without expected data property 'passwordSuccess'");
		if (!('showPasswordAsClearText' in this._state)) console.warn("<SignIn> was created without expected data property 'showPasswordAsClearText'");
		if (!('passwordHelp' in this._state)) console.warn("<SignIn> was created without expected data property 'passwordHelp'");

		if (!('alternativeSignIn' in this._state)) console.warn("<SignIn> was created without expected data property 'alternativeSignIn'");
		this._intro = true;

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

	assign(SignIn.prototype, protoDev);
	assign(SignIn.prototype, methods);

	SignIn.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('invalidLoginEmail' in newState && !this._updatingReadonlyProperty) throw new Error("<SignIn>: Cannot set read-only property 'invalidLoginEmail'");
		if ('invalidLoginForm' in newState && !this._updatingReadonlyProperty) throw new Error("<SignIn>: Cannot set read-only property 'invalidLoginForm'");
		if ('invalidSignupForm' in newState && !this._updatingReadonlyProperty) throw new Error("<SignIn>: Cannot set read-only property 'invalidSignupForm'");
		if ('invalidSignupEmail' in newState && !this._updatingReadonlyProperty) throw new Error("<SignIn>: Cannot set read-only property 'invalidSignupEmail'");
	};

	SignIn.prototype._recompute = function _recompute(changed, state) {
		if (changed.loginEmail || changed.forgotPassword) {
			if (this._differs(state.invalidLoginEmail, (state.invalidLoginEmail = invalidLoginEmail(state)))) changed.invalidLoginEmail = true;
		}

		if (changed.loggingIn || changed.loginEmail || changed.loginPassword) {
			if (this._differs(state.invalidLoginForm, (state.invalidLoginForm = invalidLoginForm(state)))) changed.invalidLoginForm = true;
		}

		if (changed.signupWithoutPassword || changed.signingUp || changed.signupEmail || changed.signupPassword || changed.signupPasswordOk) {
			if (this._differs(state.invalidSignupForm, (state.invalidSignupForm = invalidSignupForm(state)))) changed.invalidSignupForm = true;
		}

		if (changed.signupEmail || changed.forgotPassword) {
			if (this._differs(state.invalidSignupEmail, (state.invalidSignupEmail = invalidSignupEmail(state)))) changed.invalidSignupEmail = true;
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

	const data$2 = {};

	function init$1(app) {}

	var main = { App: SignIn, data: data$2, store, init: init$1 };

	return main;

})));
//# sourceMappingURL=signin.js.map
