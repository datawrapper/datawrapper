(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/invite', factory) :
	(global = global || self, global.invite = factory());
}(this, function () { 'use strict';

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

	var _typeof_1 = createCommonjsModule(function (module) {
	  function _typeof(obj) {
	    "@babel/helpers - typeof";

	    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	      module.exports = _typeof = function _typeof(obj) {
	        return typeof obj;
	      };
	    } else {
	      module.exports = _typeof = function _typeof(obj) {
	        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	      };
	    }

	    return _typeof(obj);
	  }

	  module.exports = _typeof;
	});

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	var defineProperty = _defineProperty;

	function noop() {}

	function assign(tar, src) {
	  for (var k in src) {
	    tar[k] = src[k];
	  }

	  return tar;
	}

	function addLoc(element, file, line, column, char) {
	  element.__svelte_meta = {
	    loc: {
	      file: file,
	      line: line,
	      column: column,
	      char: char
	    }
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
	  if (value == null) node.removeAttribute(attribute);else node.setAttribute(attribute, value);
	}

	function setStyle(node, key, value) {
	  node.style.setProperty(key, value);
	}

	function addResizeListener(element, fn) {
	  if (getComputedStyle(element).position === 'static') {
	    element.style.position = 'relative';
	  }

	  var object = document.createElement('object');
	  object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
	  object.type = 'text/html';
	  var win;

	  object.onload = function () {
	    win = object.contentDocument.defaultView;
	    win.addEventListener('resize', fn);
	  };

	  if (/Trident/.test(navigator.userAgent)) {
	    element.appendChild(object);
	    object.data = 'about:blank';
	  } else {
	    object.data = 'about:blank';
	    element.appendChild(object);
	  }

	  return {
	    cancel: function cancel() {
	      win && win.removeEventListener && win.removeEventListener('resize', fn);
	      element.removeChild(object);
	    }
	  };
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

	  this.destroy = function () {
	    console.warn('Component was already destroyed');
	  };
	}

	function _differs(a, b) {
	  return a != a ? b == b : a !== b || a && _typeof_1(a) === 'object' || typeof a === 'function';
	}

	function _differsImmutable(a, b) {
	  return a != a ? b == b : a !== b;
	}

	function fire(eventName, data) {
	  var handlers = eventName in this._handlers && this._handlers[eventName].slice();

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
	    cancel: function cancel() {
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
	    this.fire("state", {
	      changed: changed,
	      current: this._state,
	      previous: oldState
	    });

	    this._fragment.p(changed, this._state);

	    this.fire("update", {
	      changed: changed,
	      current: this._state,
	      previous: oldState
	    });
	  }
	}

	function _stage(newState) {
	  assign(this._staged, newState);
	}

	function setDev(newState) {
	  if (_typeof_1(newState) !== 'object') {
	    throw new Error(this._debugName + '.set was called without an object of data key-values to update.');
	  }

	  this._checkReadOnly(newState);

	  set.call(this, newState);
	}

	function callAll(fns) {
	  while (fns && fns.length) {
	    fns.shift()();
	  }
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

	function initMessages() {
	  var scope = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'core';

	  // let's check if we're in a chart
	  if (scope === 'chart') {
	    if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
	      // use in-chart translations
	      __messages[scope] = window.__dw.vis.meta.locale || {};
	    }
	  } else {
	    // use backend translations
	    __messages[scope] = scope === 'core' ? dw.backend.__messages.core : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
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


	function __(key) {
	  var _arguments = arguments;
	  var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'core';
	  key = key.trim();
	  if (!__messages[scope]) initMessages(scope);
	  if (!__messages[scope][key]) return 'MISSING:' + key;
	  var translation = __messages[scope][key];

	  if (typeof translation === 'string' && arguments.length > 2) {
	    // replace $0, $1 etc with remaining arguments
	    translation = translation.replace(/\$(\d)/g, function (m, i) {
	      i = 2 + Number(i);
	      if (_arguments[i] === undefined) return m;
	      return _arguments[i];
	    });
	  }

	  return translation;
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	var classCallCheck = _classCallCheck;

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	var assertThisInitialized = _assertThisInitialized;

	function _possibleConstructorReturn(self, call) {
	  if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
	    return call;
	  }

	  return assertThisInitialized(self);
	}

	var possibleConstructorReturn = _possibleConstructorReturn;

	var getPrototypeOf = createCommonjsModule(function (module) {
	  function _getPrototypeOf(o) {
	    module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	      return o.__proto__ || Object.getPrototypeOf(o);
	    };
	    return _getPrototypeOf(o);
	  }

	  module.exports = _getPrototypeOf;
	});

	var setPrototypeOf = createCommonjsModule(function (module) {
	  function _setPrototypeOf(o, p) {
	    module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	      o.__proto__ = p;
	      return o;
	    };

	    return _setPrototypeOf(o, p);
	  }

	  module.exports = _setPrototypeOf;
	});

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) setPrototypeOf(subClass, superClass);
	}

	var inherits = _inherits;

	function _isNativeFunction(fn) {
	  return Function.toString.call(fn).indexOf("[native code]") !== -1;
	}

	var isNativeFunction = _isNativeFunction;

	function _isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	var isNativeReflectConstruct = _isNativeReflectConstruct;

	var construct = createCommonjsModule(function (module) {
	  function _construct(Parent, args, Class) {
	    if (isNativeReflectConstruct()) {
	      module.exports = _construct = Reflect.construct;
	    } else {
	      module.exports = _construct = function _construct(Parent, args, Class) {
	        var a = [null];
	        a.push.apply(a, args);
	        var Constructor = Function.bind.apply(Parent, a);
	        var instance = new Constructor();
	        if (Class) setPrototypeOf(instance, Class.prototype);
	        return instance;
	      };
	    }

	    return _construct.apply(null, arguments);
	  }

	  module.exports = _construct;
	});

	var wrapNativeSuper = createCommonjsModule(function (module) {
	  function _wrapNativeSuper(Class) {
	    var _cache = typeof Map === "function" ? new Map() : undefined;

	    module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
	      if (Class === null || !isNativeFunction(Class)) return Class;

	      if (typeof Class !== "function") {
	        throw new TypeError("Super expression must either be null or a function");
	      }

	      if (typeof _cache !== "undefined") {
	        if (_cache.has(Class)) return _cache.get(Class);

	        _cache.set(Class, Wrapper);
	      }

	      function Wrapper() {
	        return construct(Class, arguments, getPrototypeOf(this).constructor);
	      }

	      Wrapper.prototype = Object.create(Class.prototype, {
	        constructor: {
	          value: Wrapper,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	      return setPrototypeOf(Wrapper, Class);
	    };

	    return _wrapNativeSuper(Class);
	  }

	  module.exports = _wrapNativeSuper;
	});

	function _objectWithoutPropertiesLoose(source, excluded) {
	  if (source == null) return {};
	  var target = {};
	  var sourceKeys = Object.keys(source);
	  var key, i;

	  for (i = 0; i < sourceKeys.length; i++) {
	    key = sourceKeys[i];
	    if (excluded.indexOf(key) >= 0) continue;
	    target[key] = source[key];
	  }

	  return target;
	}

	var objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose;

	function _objectWithoutProperties(source, excluded) {
	  if (source == null) return {};
	  var target = objectWithoutPropertiesLoose(source, excluded);
	  var key, i;

	  if (Object.getOwnPropertySymbols) {
	    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

	    for (i = 0; i < sourceSymbolKeys.length; i++) {
	      key = sourceSymbolKeys[i];
	      if (excluded.indexOf(key) >= 0) continue;
	      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
	      target[key] = source[key];
	    }
	  }

	  return target;
	}

	var objectWithoutProperties = _objectWithoutProperties;

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
	  })(function () {
	    function extend() {
	      var i = 0;
	      var result = {};

	      for (; i < arguments.length; i++) {
	        var attributes = arguments[i];

	        for (var key in attributes) {
	          result[key] = attributes[key];
	        }
	      }

	      return result;
	    }

	    function decode(s) {
	      return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	    }

	    function init(converter) {
	      function api() {}

	      function set(key, value, attributes) {
	        if (typeof document === 'undefined') {
	          return;
	        }

	        attributes = extend({
	          path: '/'
	        }, api.defaults, attributes);

	        if (typeof attributes.expires === 'number') {
	          attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
	        } // We're using "expires" because "max-age" is not supported by IE


	        attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

	        try {
	          var result = JSON.stringify(value);

	          if (/^[\{\[]/.test(result)) {
	            value = result;
	          }
	        } catch (e) {}

	        value = converter.write ? converter.write(value, key) : encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
	        key = encodeURIComponent(String(key)).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/[\(\)]/g, escape);
	        var stringifiedAttributes = '';

	        for (var attributeName in attributes) {
	          if (!attributes[attributeName]) {
	            continue;
	          }

	          stringifiedAttributes += '; ' + attributeName;

	          if (attributes[attributeName] === true) {
	            continue;
	          } // Considers RFC 6265 section 5.2:
	          // ...
	          // 3.  If the remaining unparsed-attributes contains a %x3B (";")
	          //     character:
	          // Consume the characters of the unparsed-attributes up to,
	          // not including, the first %x3B (";") character.
	          // ...


	          stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
	        }

	        return document.cookie = key + '=' + value + stringifiedAttributes;
	      }

	      function get(key, json) {
	        if (typeof document === 'undefined') {
	          return;
	        }

	        var jar = {}; // To prevent the for loop in the first place assign an empty array
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
	            cookie = (converter.read || converter)(cookie, name) || decode(cookie);

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
	        return get(key, false
	        /* read as raw */
	        );
	      };

	      api.getJSON = function (key) {
	        return get(key, true
	        /* read as json */
	        );
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
	  });
	});

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
	var CSRF_COOKIE_NAME = 'crumb';
	var CSRF_TOKEN_HEADER = 'X-CSRF-Token';
	var CSRF_SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']); // according to RFC7231

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

	function httpReq(path) {
	  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	  if (!options.fetch) {
	    try {
	      options.fetch = window.fetch;
	    } catch (e) {
	      throw new Error('Neither options.fetch nor window.fetch is defined.');
	    }
	  }

	  if (!options.baseUrl) {
	    try {
	      options.baseUrl = "//".concat(window.dw.backend.__api_domain);
	    } catch (e) {
	      throw new Error('Neither options.baseUrl nor window.dw is defined.');
	    }
	  }

	  var _payload$raw$method$m = _objectSpread({
	    payload: null,
	    raw: false,
	    method: 'GET',
	    mode: 'cors',
	    credentials: 'include'
	  }, options, {
	    headers: _objectSpread({
	      'Content-Type': 'application/json'
	    }, options.headers)
	  }),
	      payload = _payload$raw$method$m.payload,
	      baseUrl = _payload$raw$method$m.baseUrl,
	      fetch = _payload$raw$method$m.fetch,
	      raw = _payload$raw$method$m.raw,
	      opts = objectWithoutProperties(_payload$raw$method$m, ["payload", "baseUrl", "fetch", "raw"]);

	  var url = "".concat(baseUrl.replace(/\/$/, ''), "/").concat(path.replace(/^\//, ''));

	  if (payload) {
	    // overwrite body
	    opts.body = JSON.stringify(payload);
	  }

	  var promise;

	  if (!CSRF_SAFE_METHODS.has(opts.method.toLowerCase())) {
	    var csrfCookieValue = js_cookie.get(CSRF_COOKIE_NAME);

	    if (csrfCookieValue) {
	      opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
	      promise = fetch(url, opts);
	    } else {
	      promise = httpReq('/v3/me', {
	        fetch: fetch,
	        baseUrl: baseUrl
	      }).then(function () {
	        var csrfCookieValue = js_cookie.get(CSRF_COOKIE_NAME);

	        if (csrfCookieValue) {
	          opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
	        }
	      }).catch(function () {}) // Ignore errors from /v3/me. It probably means the user is not logged in.
	      .then(function () {
	        return fetch(url, opts);
	      });
	    }
	  } else {
	    promise = fetch(url, opts);
	  } // The variable `promise` and the repeated `fetch(url, opts)` could be replaced with `await
	  // httpReq('/v3/me'...)`, but then we would need to configure babel to transform async/await for
	  // all repositories that use @datawrapper/shared.


	  return promise.then(function (res) {
	    if (raw) return res;
	    if (!res.ok) throw new HttpReqError(res);
	    if (res.status === 204 || !res.headers.get('content-type')) return res; // no content
	    // trim away the ;charset=utf-8 from content-type

	    var contentType = res.headers.get('content-type').split(';')[0];

	    if (contentType === 'application/json') {
	      return res.json();
	    }

	    if (contentType === 'image/png' || contentType === 'application/pdf') {
	      return res.blob();
	    } // default to text for all other content types


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

	var get$1 = httpReq.get = httpReqVerb('GET');
	/**
	 * Like `httpReq` but with fixed http method PATCH
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.patch
	 * @kind function
	 */

	var patch = httpReq.patch = httpReqVerb('PATCH');
	/**
	 * Like `httpReq` but with fixed http method PUT
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.put
	 * @kind function
	 */

	var put = httpReq.put = httpReqVerb('PUT');
	/**
	 * Like `httpReq` but with fixed http method POST
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.post
	 * @kind function
	 */

	var post = httpReq.post = httpReqVerb('POST');
	/**
	 * Like `httpReq` but with fixed http method HEAD
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.head
	 * @kind function
	 */

	var head = httpReq.head = httpReqVerb('HEAD');
	/**
	 * Like `httpReq` but with fixed http method DELETE
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.delete
	 * @kind function
	 */

	httpReq.delete = httpReqVerb('DELETE');

	function httpReqVerb(method) {
	  return function (path, options) {
	    if (options && options.method) {
	      throw new Error("Setting option.method is not allowed in httpReq.".concat(method.toLowerCase(), "()"));
	    }

	    return httpReq(path, _objectSpread({}, options, {
	      method: method
	    }));
	  };
	}

	var HttpReqError = /*#__PURE__*/function (_Error) {
	  inherits(HttpReqError, _Error);

	  function HttpReqError(res) {
	    var _this;

	    classCallCheck(this, HttpReqError);

	    _this = possibleConstructorReturn(this, getPrototypeOf(HttpReqError).call(this));
	    _this.name = 'HttpReqError';
	    _this.status = res.status;
	    _this.statusText = res.statusText;
	    _this.message = "[".concat(res.status, "] ").concat(res.statusText);
	    _this.response = res;
	    return _this;
	  }

	  return HttpReqError;
	}(wrapNativeSuper(Error));

	/* shared/CheckPassword.html generated by Svelte v2.16.1 */
	var MIN_CHARACTERS = 8;
	var zxcvbn;
	var zxcvbnLoading = false;

	function loadZxcvbn() {
	  zxcvbnLoading = true;

	  require(['zxcvbn'], function (pkg) {
	    zxcvbn = pkg;
	  });
	}

	function passwordTooShort(_ref) {
	  var password = _ref.password;
	  return password.length < MIN_CHARACTERS;
	}

	function passwordStrength(_ref2) {
	  var password = _ref2.password;

	  if (!zxcvbn) {
	    if (!zxcvbnLoading && password.length > 4) {
	      loadZxcvbn();
	    }

	    return false;
	  }

	  return zxcvbn(password);
	}

	function passwordHelp(_ref3) {
	  var password = _ref3.password,
	      passwordStrength = _ref3.passwordStrength;

	  if (password === '' || !passwordStrength) {
	    return __('account / pwd-too-short').replace('%num', MIN_CHARACTERS);
	  }

	  var score = ['bad', 'weak', 'ok', 'good', 'excellent'][passwordStrength.score];
	  return __("account / password / ".concat(score));
	}

	function passwordError(_ref4) {
	  var password = _ref4.password,
	      passwordTooShort = _ref4.passwordTooShort,
	      passwordStrength = _ref4.passwordStrength,
	      passwordHelp = _ref4.passwordHelp;
	  if (!password) return false;
	  if (passwordTooShort) return __('account / pwd-too-short').replace('%num', MIN_CHARACTERS);
	  if (passwordStrength && passwordStrength.score < 2) return passwordHelp;
	  return false;
	}

	function passwordSuccess(_ref5) {
	  var passwordStrength = _ref5.passwordStrength,
	      passwordHelp = _ref5.passwordHelp;
	  return passwordStrength && passwordStrength.score > 2 ? passwordHelp : false;
	}

	function passwordOk(_ref6) {
	  var password = _ref6.password,
	      passwordTooShort = _ref6.passwordTooShort;
	  return password && !passwordTooShort;
	}

	function data() {
	  return {
	    password: ''
	  };
	}

	function create_main_fragment(component, ctx) {
	  var if_block_anchor;
	  var if_block = ctx.password.length >= MIN_CHARACTERS && create_if_block();
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
	      if (ctx.password.length >= MIN_CHARACTERS) {
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
	} // (1:0) {#if password.length>=MIN_CHARACTERS}


	function create_if_block(component, ctx) {
	  return {
	    c: noop,
	    m: noop,
	    d: noop
	  };
	}

	function CheckPassword(options) {
	  this._debugName = '<CheckPassword>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data(), options.data);

	  this._recompute({
	    password: 1,
	    passwordStrength: 1,
	    passwordTooShort: 1,
	    passwordHelp: 1
	  }, this._state);

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
	    if (this._differs(state.passwordTooShort, state.passwordTooShort = passwordTooShort(state))) changed.passwordTooShort = true;
	    if (this._differs(state.passwordStrength, state.passwordStrength = passwordStrength(state))) changed.passwordStrength = true;
	  }

	  if (changed.password || changed.passwordStrength) {
	    if (this._differs(state.passwordHelp, state.passwordHelp = passwordHelp(state))) changed.passwordHelp = true;
	  }

	  if (changed.password || changed.passwordTooShort || changed.passwordStrength || changed.passwordHelp) {
	    if (this._differs(state.passwordError, state.passwordError = passwordError(state))) changed.passwordError = true;
	  }

	  if (changed.passwordStrength || changed.passwordHelp) {
	    if (this._differs(state.passwordSuccess, state.passwordSuccess = passwordSuccess(state))) changed.passwordSuccess = true;
	  }

	  if (changed.password || changed.passwordTooShort) {
	    if (this._differs(state.passwordOk, state.passwordOk = passwordOk(state))) changed.passwordOk = true;
	  }
	};

	/* invite/Invite.html generated by Svelte v2.16.1 */

	function _empty() {}

	function _awaitIgnored(value, direct) {
	  if (!direct) {
	    return value && value.then ? value.then(_empty) : Promise.resolve();
	  }
	}

	function _invoke(body, then) {
	  var result = body();

	  if (result && result.then) {
	    return result.then(then);
	  }

	  return then(result);
	}

	function _await(value, then, direct) {
	  if (direct) {
	    return then ? then(value) : value;
	  }

	  if (!value || !value.then) {
	    value = Promise.resolve(value);
	  }

	  return then ? value.then(then) : value;
	}

	function _invokeIgnored(body) {
	  var result = body();

	  if (result && result.then) {
	    return result.then(_empty);
	  }
	}

	function _catch(body, recover) {
	  try {
	    var result = body();
	  } catch (e) {
	    return recover(e);
	  }

	  if (result && result.then) {
	    return result.then(void 0, recover);
	  }

	  return result;
	}

	function _continue(value, then) {
	  return value && value.then ? value.then(then) : then(value);
	}

	function marginTop(_ref) {
	  var windowHeight = _ref.windowHeight,
	      modalHeight = _ref.modalHeight;
	  return (windowHeight - modalHeight) * 0.5;
	}

	function data$1() {
	  return {
	    redirect: '/',
	    password: '',
	    passwordOk: false,
	    passwordHelp: false,
	    passwordSuccess: false,
	    passwordError: false,
	    passwordRepeatError: false,
	    // progressIndicators
	    loggingIn: false,
	    activateSuccess: false,
	    activateError: false,
	    windowHeight: 1000,
	    modalHeight: 300,
	    clearText: false,
	    // texts
	    headline: '',
	    intro: '',
	    email: '',
	    button: 'Set password',
	    isPasswordReset: false
	  };
	}

	var methods = {
	  doSignUp: function doSignUp() {
	    try {
	      var _this2 = this;

	      var token = window.location.pathname.split('/').pop();

	      var _this2$get = _this2.get(),
	          password = _this2$get.password,
	          redirect = _this2$get.redirect,
	          isPasswordReset = _this2$get.isPasswordReset;

	      _this2.set({
	        loggingIn: true
	      });

	      return _continue(_catch(function () {
	        return _invoke(function () {
	          if (isPasswordReset) {
	            return _awaitIgnored(httpReq.post("/v3/auth/change-password", {
	              payload: {
	                token: token,
	                password: password
	              }
	            }));
	          } else {
	            return _awaitIgnored(httpReq.post("/v3/auth/activate/".concat(token), {
	              payload: {
	                password: password
	              }
	            }));
	          }
	        }, function () {
	          _this2.set({
	            activateSuccess: 'Password was set up successfully!'
	          });

	          setTimeout(function () {
	            window.location.href = redirect;
	          }, 1000);
	        });
	      }, function (error) {
	        return _invokeIgnored(function () {
	          if (error.name === 'HttpReqError') {
	            return _await(error.response.json(), function (body) {
	              _this2.set({
	                activateError: body ? body.message : error.message
	              });
	            });
	          } else {
	            _this2.set({
	              activateError: error
	            });
	          }
	        });
	      }), function () {
	        _this2.set({
	          loggingIn: false
	        });
	      });
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }
	};
	var file = "invite/Invite.html";

	function create_main_fragment$1(component, ctx) {
	  var text0,
	      div5,
	      div4,
	      h3,
	      text1,
	      p,
	      text2,
	      div3,
	      div1,
	      div0,
	      label0,
	      text3_value = __('password'),
	      text3,
	      text4,
	      text5,
	      checkpassword_updating = {},
	      text6,
	      text7,
	      div2,
	      label1,
	      input,
	      text8,
	      text9_value = __('account / invite / password-clear-text'),
	      text9,
	      text10,
	      text11,
	      text12,
	      text13,
	      button,
	      raw2_after,
	      text14,
	      button_disabled_value,
	      div5_resize_listener;

	  function onwindowresize(event) {
	    component._updatingReadonlyProperty = true;
	    component.set({
	      windowHeight: this.innerHeight
	    });
	    component._updatingReadonlyProperty = false;
	  }

	  window.addEventListener("resize", onwindowresize);
	  var if_block0 = ctx.customLogo && create_if_block_8(component, ctx);

	  function select_block_type(ctx) {
	    if (ctx.clearText) return create_if_block_7;
	    return create_else_block_1;
	  }

	  var current_block_type = select_block_type(ctx);
	  var if_block1 = current_block_type(component, ctx);
	  var checkpassword_initial_data = {};

	  if (ctx.password !== void 0) {
	    checkpassword_initial_data.password = ctx.password;
	    checkpassword_updating.password = true;
	  }

	  if (ctx.password !== void 0) {
	    checkpassword_initial_data.passwordRepeat = ctx.password;
	    checkpassword_updating.passwordRepeat = true;
	  }

	  if (ctx.passwordHelp !== void 0) {
	    checkpassword_initial_data.passwordHelp = ctx.passwordHelp;
	    checkpassword_updating.passwordHelp = true;
	  }

	  if (ctx.passwordSuccess !== void 0) {
	    checkpassword_initial_data.passwordSuccess = ctx.passwordSuccess;
	    checkpassword_updating.passwordSuccess = true;
	  }

	  if (ctx.passwordError !== void 0) {
	    checkpassword_initial_data.passwordError = ctx.passwordError;
	    checkpassword_updating.passwordError = true;
	  }

	  if (ctx.passwordRepeatError !== void 0) {
	    checkpassword_initial_data.passwordRepeatError = ctx.passwordRepeatError;
	    checkpassword_updating.passwordRepeatError = true;
	  }

	  if (ctx.passwordOk !== void 0) {
	    checkpassword_initial_data.passwordOk = ctx.passwordOk;
	    checkpassword_updating.passwordOk = true;
	  }

	  var checkpassword = new CheckPassword({
	    root: component.root,
	    store: component.store,
	    data: checkpassword_initial_data,
	    _bind: function _bind(changed, childState) {
	      var newState = {};

	      if (!checkpassword_updating.password && changed.password) {
	        newState.password = childState.password;
	      }

	      if (!checkpassword_updating.passwordRepeat && changed.passwordRepeat) {
	        newState.password = childState.passwordRepeat;
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

	      if (!checkpassword_updating.passwordRepeatError && changed.passwordRepeatError) {
	        newState.passwordRepeatError = childState.passwordRepeatError;
	      }

	      if (!checkpassword_updating.passwordOk && changed.passwordOk) {
	        newState.passwordOk = childState.passwordOk;
	      }

	      component._set(newState);

	      checkpassword_updating = {};
	    }
	  });

	  component.root._beforecreate.push(function () {
	    checkpassword._bind({
	      password: 1,
	      passwordRepeat: 1,
	      passwordHelp: 1,
	      passwordSuccess: 1,
	      passwordError: 1,
	      passwordRepeatError: 1,
	      passwordOk: 1
	    }, checkpassword.get());
	  });

	  function select_block_type_1(ctx) {
	    if (ctx.passwordError) return create_if_block_4;
	    if (ctx.passwordSuccess) return create_if_block_5;
	    if (ctx.passwordHelp) return create_if_block_6;
	  }

	  var current_block_type_1 = select_block_type_1(ctx);
	  var if_block2 = current_block_type_1 && current_block_type_1(component, ctx);

	  function input_change_handler() {
	    component.set({
	      clearText: input.checked
	    });
	  }

	  var if_block3 = ctx.activateError && create_if_block_3(component, ctx);
	  var if_block4 = ctx.activateSuccess && create_if_block_2(component, ctx);
	  var if_block5 = ctx.email && create_if_block_1(component, ctx);

	  function select_block_type_2(ctx) {
	    if (ctx.signingUp) return create_if_block$1;
	    return create_else_block;
	  }

	  var current_block_type_2 = select_block_type_2(ctx);
	  var if_block6 = current_block_type_2(component, ctx);

	  function click_handler(event) {
	    component.doSignUp();
	  }

	  function div5_resize_handler() {
	    component.set({
	      modalHeight: div5.clientHeight
	    });
	  }

	  return {
	    c: function create() {
	      if (if_block0) if_block0.c();
	      text0 = createText("\n\n\n\n");
	      div5 = createElement("div");
	      div4 = createElement("div");
	      h3 = createElement("h3");
	      text1 = createText("\n        ");
	      p = createElement("p");
	      text2 = createText("\n\n        ");
	      div3 = createElement("div");
	      div1 = createElement("div");
	      div0 = createElement("div");
	      label0 = createElement("label");
	      text3 = createText(text3_value);
	      text4 = createText("\n                    ");
	      if_block1.c();
	      text5 = createText("\n                    ");

	      checkpassword._fragment.c();

	      text6 = createText("\n                    ");
	      if (if_block2) if_block2.c();
	      text7 = createText("\n            ");
	      div2 = createElement("div");
	      label1 = createElement("label");
	      input = createElement("input");
	      text8 = createText(" ");
	      text9 = createText(text9_value);
	      text10 = createText("\n            ");
	      if (if_block3) if_block3.c();
	      text11 = createText(" ");
	      if (if_block4) if_block4.c();
	      text12 = createText(" ");
	      if (if_block5) if_block5.c();
	      text13 = createText("\n\n        ");
	      button = createElement("button");
	      raw2_after = createElement('noscript');
	      text14 = createText("   ");
	      if_block6.c();
	      h3.className = "svelte-1dqizzw";
	      addLoc(h3, file, 10, 8, 309);
	      addLoc(p, file, 11, 8, 344);
	      label0.className = "svelte-1dqizzw";
	      addLoc(label0, file, 20, 20, 636);
	      div0.className = "controls";
	      addLoc(div0, file, 19, 16, 593);
	      div1.className = "control-group svelte-1dqizzw";
	      toggleClass(div1, "warning", ctx.passwordError);
	      toggleClass(div1, "success", ctx.passwordSuccess);
	      addLoc(div1, file, 14, 12, 426);
	      addListener(input, "change", input_change_handler);
	      setAttribute(input, "type", "checkbox");
	      input.className = "pwd-clear";
	      addLoc(input, file, 56, 20, 2125);
	      label1.className = "checkbox svelte-1dqizzw";
	      addLoc(label1, file, 55, 16, 2080);
	      div2.className = "control-group svelte-1dqizzw";
	      addLoc(div2, file, 54, 12, 2036);
	      div3.className = "login-form form-vertical";
	      addLoc(div3, file, 13, 8, 375);
	      addListener(button, "click", click_handler);
	      button.disabled = button_disabled_value = !ctx.passwordOk;
	      button.className = "btn btn-primary btn-large login";
	      addLoc(button, file, 77, 8, 2883);
	      div4.className = "modal-body svelte-1dqizzw";
	      addLoc(div4, file, 9, 4, 276);

	      component.root._aftercreate.push(div5_resize_handler);

	      div5.className = "modal svelte-1dqizzw";
	      setStyle(div5, "margin-top", "" + ctx.marginTop + "px");
	      addLoc(div5, file, 8, 0, 186);
	    },
	    m: function mount(target, anchor) {
	      if (if_block0) if_block0.m(target, anchor);
	      insert(target, text0, anchor);
	      insert(target, div5, anchor);
	      append(div5, div4);
	      append(div4, h3);
	      h3.innerHTML = ctx.headline;
	      append(div4, text1);
	      append(div4, p);
	      p.innerHTML = ctx.intro;
	      append(div4, text2);
	      append(div4, div3);
	      append(div3, div1);
	      append(div1, div0);
	      append(div0, label0);
	      append(label0, text3);
	      append(div0, text4);
	      if_block1.m(div0, null);
	      append(div0, text5);

	      checkpassword._mount(div0, null);

	      append(div0, text6);
	      if (if_block2) if_block2.m(div0, null);
	      append(div3, text7);
	      append(div3, div2);
	      append(div2, label1);
	      append(label1, input);
	      input.checked = ctx.clearText;
	      append(label1, text8);
	      append(label1, text9);
	      append(div3, text10);
	      if (if_block3) if_block3.m(div3, null);
	      append(div3, text11);
	      if (if_block4) if_block4.m(div3, null);
	      append(div3, text12);
	      if (if_block5) if_block5.m(div3, null);
	      append(div4, text13);
	      append(div4, button);
	      append(button, raw2_after);
	      raw2_after.insertAdjacentHTML("beforebegin", ctx.button);
	      append(button, text14);
	      if_block6.m(button, null);
	      div5_resize_listener = addResizeListener(div5, div5_resize_handler);
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;

	      if (ctx.customLogo) {
	        if (if_block0) {
	          if_block0.p(changed, ctx);
	        } else {
	          if_block0 = create_if_block_8(component, ctx);
	          if_block0.c();
	          if_block0.m(text0.parentNode, text0);
	        }
	      } else if (if_block0) {
	        if_block0.d(1);
	        if_block0 = null;
	      }

	      if (changed.headline) {
	        h3.innerHTML = ctx.headline;
	      }

	      if (changed.intro) {
	        p.innerHTML = ctx.intro;
	      }

	      if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
	        if_block1.p(changed, ctx);
	      } else {
	        if_block1.d(1);
	        if_block1 = current_block_type(component, ctx);
	        if_block1.c();
	        if_block1.m(div0, text5);
	      }

	      var checkpassword_changes = {};

	      if (!checkpassword_updating.password && changed.password) {
	        checkpassword_changes.password = ctx.password;
	        checkpassword_updating.password = ctx.password !== void 0;
	      }

	      if (!checkpassword_updating.passwordRepeat && changed.password) {
	        checkpassword_changes.passwordRepeat = ctx.password;
	        checkpassword_updating.passwordRepeat = ctx.password !== void 0;
	      }

	      if (!checkpassword_updating.passwordHelp && changed.passwordHelp) {
	        checkpassword_changes.passwordHelp = ctx.passwordHelp;
	        checkpassword_updating.passwordHelp = ctx.passwordHelp !== void 0;
	      }

	      if (!checkpassword_updating.passwordSuccess && changed.passwordSuccess) {
	        checkpassword_changes.passwordSuccess = ctx.passwordSuccess;
	        checkpassword_updating.passwordSuccess = ctx.passwordSuccess !== void 0;
	      }

	      if (!checkpassword_updating.passwordError && changed.passwordError) {
	        checkpassword_changes.passwordError = ctx.passwordError;
	        checkpassword_updating.passwordError = ctx.passwordError !== void 0;
	      }

	      if (!checkpassword_updating.passwordRepeatError && changed.passwordRepeatError) {
	        checkpassword_changes.passwordRepeatError = ctx.passwordRepeatError;
	        checkpassword_updating.passwordRepeatError = ctx.passwordRepeatError !== void 0;
	      }

	      if (!checkpassword_updating.passwordOk && changed.passwordOk) {
	        checkpassword_changes.passwordOk = ctx.passwordOk;
	        checkpassword_updating.passwordOk = ctx.passwordOk !== void 0;
	      }

	      checkpassword._set(checkpassword_changes);

	      checkpassword_updating = {};

	      if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
	        if_block2.p(changed, ctx);
	      } else {
	        if (if_block2) if_block2.d(1);
	        if_block2 = current_block_type_1 && current_block_type_1(component, ctx);
	        if (if_block2) if_block2.c();
	        if (if_block2) if_block2.m(div0, null);
	      }

	      if (changed.passwordError) {
	        toggleClass(div1, "warning", ctx.passwordError);
	      }

	      if (changed.passwordSuccess) {
	        toggleClass(div1, "success", ctx.passwordSuccess);
	      }

	      if (changed.clearText) input.checked = ctx.clearText;

	      if (ctx.activateError) {
	        if (if_block3) {
	          if_block3.p(changed, ctx);
	        } else {
	          if_block3 = create_if_block_3(component, ctx);
	          if_block3.c();
	          if_block3.m(div3, text11);
	        }
	      } else if (if_block3) {
	        if_block3.d(1);
	        if_block3 = null;
	      }

	      if (ctx.activateSuccess) {
	        if (if_block4) {
	          if_block4.p(changed, ctx);
	        } else {
	          if_block4 = create_if_block_2(component, ctx);
	          if_block4.c();
	          if_block4.m(div3, text12);
	        }
	      } else if (if_block4) {
	        if_block4.d(1);
	        if_block4 = null;
	      }

	      if (ctx.email) {
	        if (if_block5) {
	          if_block5.p(changed, ctx);
	        } else {
	          if_block5 = create_if_block_1(component, ctx);
	          if_block5.c();
	          if_block5.m(div3, null);
	        }
	      } else if (if_block5) {
	        if_block5.d(1);
	        if_block5 = null;
	      }

	      if (changed.button) {
	        detachBefore(raw2_after);
	        raw2_after.insertAdjacentHTML("beforebegin", ctx.button);
	      }

	      if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
	        if_block6.d(1);
	        if_block6 = current_block_type_2(component, ctx);
	        if_block6.c();
	        if_block6.m(button, null);
	      }

	      if (changed.passwordOk && button_disabled_value !== (button_disabled_value = !ctx.passwordOk)) {
	        button.disabled = button_disabled_value;
	      }

	      if (changed.marginTop) {
	        setStyle(div5, "margin-top", "" + ctx.marginTop + "px");
	      }
	    },
	    d: function destroy(detach) {
	      window.removeEventListener("resize", onwindowresize);
	      if (if_block0) if_block0.d(detach);

	      if (detach) {
	        detachNode(text0);
	        detachNode(div5);
	      }

	      if_block1.d();
	      checkpassword.destroy();
	      if (if_block2) if_block2.d();
	      removeListener(input, "change", input_change_handler);
	      if (if_block3) if_block3.d();
	      if (if_block4) if_block4.d();
	      if (if_block5) if_block5.d();
	      if_block6.d();
	      removeListener(button, "click", click_handler);
	      div5_resize_listener.cancel();
	    }
	  };
	} // (1:0) {#if customLogo}


	function create_if_block_8(component, ctx) {
	  var div, img, img_src_value;
	  return {
	    c: function create() {
	      div = createElement("div");
	      img = createElement("img");
	      img.src = img_src_value = "/static/custom/" + {
	        customLogo: ctx.customLogo
	      } + "}";
	      setStyle(img, "height", "50px");
	      img.alt = "logo";
	      addLoc(img, file, 2, 4, 41);
	      div.className = "brand";
	      addLoc(div, file, 1, 0, 17);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);
	      append(div, img);
	    },
	    p: function update(changed, ctx) {
	      if (changed.customLogo && img_src_value !== (img_src_value = "/static/custom/" + {
	        customLogo: ctx.customLogo
	      } + "}")) {
	        img.src = img_src_value;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div);
	      }
	    }
	  };
	} // (29:20) {:else}


	function create_else_block_1(component, ctx) {
	  var input,
	      input_updating = false;

	  function input_input_handler() {
	    input_updating = true;
	    component.set({
	      password: input.value
	    });
	    input_updating = false;
	  }

	  return {
	    c: function create() {
	      input = createElement("input");
	      addListener(input, "input", input_input_handler);
	      input.dataset.lpignore = "true";
	      input.className = "login-pwd input-xlarge span3 svelte-1dqizzw";
	      setAttribute(input, "type", "password");
	      addLoc(input, file, 29, 20, 990);
	    },
	    m: function mount(target, anchor) {
	      insert(target, input, anchor);
	      input.value = ctx.password;
	    },
	    p: function update(changed, ctx) {
	      if (!input_updating && changed.password) input.value = ctx.password;
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(input);
	      }

	      removeListener(input, "input", input_input_handler);
	    }
	  };
	} // (22:20) {#if clearText}


	function create_if_block_7(component, ctx) {
	  var input,
	      input_updating = false;

	  function input_input_handler() {
	    input_updating = true;
	    component.set({
	      password: input.value
	    });
	    input_updating = false;
	  }

	  return {
	    c: function create() {
	      input = createElement("input");
	      addListener(input, "input", input_input_handler);
	      input.dataset.lpignore = "true";
	      input.className = "login-pwd input-xlarge span3 svelte-1dqizzw";
	      setAttribute(input, "type", "text");
	      addLoc(input, file, 22, 20, 724);
	    },
	    m: function mount(target, anchor) {
	      insert(target, input, anchor);
	      input.value = ctx.password;
	    },
	    p: function update(changed, ctx) {
	      if (!input_updating && changed.password) input.value = ctx.password;
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(input);
	      }

	      removeListener(input, "input", input_input_handler);
	    }
	  };
	} // (50:42) 


	function create_if_block_6(component, ctx) {
	  var p;
	  return {
	    c: function create() {
	      p = createElement("p");
	      p.className = "help muted svelte-1dqizzw";
	      addLoc(p, file, 50, 20, 1909);
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
	} // (48:45) 


	function create_if_block_5(component, ctx) {
	  var p;
	  return {
	    c: function create() {
	      p = createElement("p");
	      p.className = "help text-success svelte-1dqizzw";
	      addLoc(p, file, 48, 20, 1789);
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
	} // (46:20) {#if passwordError}


	function create_if_block_4(component, ctx) {
	  var p;
	  return {
	    c: function create() {
	      p = createElement("p");
	      p.className = "help text-warning svelte-1dqizzw";
	      addLoc(p, file, 46, 20, 1668);
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
	} // (61:12) {#if activateError}


	function create_if_block_3(component, ctx) {
	  var div;
	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "alert alert-warning";
	      addLoc(div, file, 61, 12, 2351);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);
	      div.innerHTML = ctx.activateError;
	    },
	    p: function update(changed, ctx) {
	      if (changed.activateError) {
	        div.innerHTML = ctx.activateError;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div);
	      }
	    }
	  };
	} // (65:18) {#if activateSuccess}


	function create_if_block_2(component, ctx) {
	  var div;
	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "alert alert-success";
	      addLoc(div, file, 65, 12, 2494);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);
	      div.innerHTML = ctx.activateSuccess;
	    },
	    p: function update(changed, ctx) {
	      if (changed.activateSuccess) {
	        div.innerHTML = ctx.activateSuccess;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div);
	      }
	    }
	  };
	} // (69:18) {#if email}


	function create_if_block_1(component, ctx) {
	  var div,
	      raw_value = __('account / invite / your-login-is').replace('%s', "<span class=\"email\"\n                    >".concat(ctx.email, "</span\n                >"));

	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "control-group login-help svelte-1dqizzw";
	      addLoc(div, file, 69, 12, 2629);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);
	      div.innerHTML = raw_value;
	    },
	    p: function update(changed, ctx) {
	      if (changed.email && raw_value !== (raw_value = __('account / invite / your-login-is').replace('%s', "<span class=\"email\"\n                    >".concat(ctx.email, "</span\n                >")))) {
	        div.innerHTML = raw_value;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div);
	      }
	    }
	  };
	} // (84:13) {:else}


	function create_else_block(component, ctx) {
	  var i;
	  return {
	    c: function create() {
	      i = createElement("i");
	      i.className = "fa fa-fw fa-chevron-right";
	      addLoc(i, file, 83, 20, 3141);
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
	} // (83:36) {#if signingUp}


	function create_if_block$1(component, ctx) {
	  var i;
	  return {
	    c: function create() {
	      i = createElement("i");
	      i.className = "fa fa-fw fa-spinner fa-pulse";
	      addLoc(i, file, 82, 51, 3077);
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

	function Invite(options) {
	  this._debugName = '<Invite>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data$1(), options.data);
	  this._state.windowHeight = window.innerHeight;

	  this._recompute({
	    windowHeight: 1,
	    modalHeight: 1
	  }, this._state);

	  if (!('windowHeight' in this._state)) console.warn("<Invite> was created without expected data property 'windowHeight'");
	  if (!('modalHeight' in this._state)) console.warn("<Invite> was created without expected data property 'modalHeight'");
	  if (!('customLogo' in this._state)) console.warn("<Invite> was created without expected data property 'customLogo'");
	  if (!('headline' in this._state)) console.warn("<Invite> was created without expected data property 'headline'");
	  if (!('intro' in this._state)) console.warn("<Invite> was created without expected data property 'intro'");
	  if (!('passwordError' in this._state)) console.warn("<Invite> was created without expected data property 'passwordError'");
	  if (!('passwordSuccess' in this._state)) console.warn("<Invite> was created without expected data property 'passwordSuccess'");
	  if (!('clearText' in this._state)) console.warn("<Invite> was created without expected data property 'clearText'");
	  if (!('password' in this._state)) console.warn("<Invite> was created without expected data property 'password'");
	  if (!('passwordHelp' in this._state)) console.warn("<Invite> was created without expected data property 'passwordHelp'");
	  if (!('passwordRepeatError' in this._state)) console.warn("<Invite> was created without expected data property 'passwordRepeatError'");
	  if (!('passwordOk' in this._state)) console.warn("<Invite> was created without expected data property 'passwordOk'");
	  if (!('activateError' in this._state)) console.warn("<Invite> was created without expected data property 'activateError'");
	  if (!('activateSuccess' in this._state)) console.warn("<Invite> was created without expected data property 'activateSuccess'");
	  if (!('email' in this._state)) console.warn("<Invite> was created without expected data property 'email'");
	  if (!('button' in this._state)) console.warn("<Invite> was created without expected data property 'button'");
	  if (!('signingUp' in this._state)) console.warn("<Invite> was created without expected data property 'signingUp'");
	  this._intro = true;
	  this._fragment = create_main_fragment$1(this, this._state);

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);

	    flush(this);
	  }
	}

	assign(Invite.prototype, protoDev);
	assign(Invite.prototype, methods);

	Invite.prototype._checkReadOnly = function _checkReadOnly(newState) {
	  if ('windowHeight' in newState && !this._updatingReadonlyProperty) throw new Error("<Invite>: Cannot set read-only property 'windowHeight'");
	  if ('marginTop' in newState && !this._updatingReadonlyProperty) throw new Error("<Invite>: Cannot set read-only property 'marginTop'");
	};

	Invite.prototype._recompute = function _recompute(changed, state) {
	  if (changed.windowHeight || changed.modalHeight) {
	    if (this._differs(state.marginTop, state.marginTop = marginTop(state))) changed.marginTop = true;
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
	    var _this = this;

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

	    this._dependents.filter(function (dependent) {
	      var componentState = {};
	      var dirty = false;

	      for (var j = 0; j < dependent.props.length; j += 1) {
	        var prop = dependent.props[j];

	        if (prop in changed) {
	          componentState['$' + prop] = _this._state[prop];
	          dirty = true;
	        }
	      }

	      if (dirty) {
	        dependent.component._stage(componentState);

	        return true;
	      }
	    }).forEach(function (dependent) {
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
	            throw new Error("Cyclical dependency detected between ".concat(dep, " <-> ").concat(key));
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
	    var _this2 = this;

	    var value;
	    var c = {
	      deps: deps,
	      update: function update(state, changed, dirty) {
	        var values = deps.map(function (dep) {
	          if (dep in changed) dirty = true;
	          return state[dep];
	        });

	        if (dirty) {
	          var newValue = fn.apply(null, values);

	          if (_this2._differs(newValue, value)) {
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
	      if (this._computed[key]) throw new Error("'".concat(key, "' is a read-only computed property"));
	      if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
	    }

	    if (!dirty) return;

	    this._set(newState, changed);
	  }
	});

	var store = new Store({});
	var data$2 = {};

	function init$1(app) {}

	var main = {
	  App: Invite,
	  data: data$2,
	  store: store,
	  init: init$1
	};

	return main;

}));
//# sourceMappingURL=invite.js.map
