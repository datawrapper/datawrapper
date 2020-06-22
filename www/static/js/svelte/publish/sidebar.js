(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../../../../../../../../../../static/js/svelte/publish.js')) :
	typeof define === 'function' && define.amd ? define(['../../../../../../../../../../static/js/svelte/publish.js'], factory) :
	(global = global || self, global['publish/sidebar'] = factory(global.publish_js));
}(this, function (publish_js) { 'use strict';

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

	function assignTrue(tar, src) {
	  for (var k in src) {
	    tar[k] = 1;
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

	function detachBetween(before, after) {
	  while (before.nextSibling && before.nextSibling !== after) {
	    before.parentNode.removeChild(before.nextSibling);
	  }
	}

	function reinsertChildren(parent, target) {
	  while (parent.firstChild) {
	    target.appendChild(parent.firstChild);
	  }
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
	  if (value == null) node.removeAttribute(attribute);else node.setAttribute(attribute, value);
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

	  this.destroy = function () {
	    console.warn('Component was already destroyed');
	  };
	}

	function _differs(a, b) {
	  return a != a ? b == b : a !== b || a && _typeof_1(a) === 'object' || typeof a === 'function';
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

	function removeFromStore() {
	  this.store._remove(this);
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

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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

	  /* globals dw */
	  var _payload$raw$method$b = _objectSpread({
	    payload: null,
	    raw: false,
	    method: 'GET',
	    baseUrl: "//".concat(dw.backend.__api_domain),
	    mode: 'cors',
	    credentials: 'include'
	  }, options, {
	    headers: _objectSpread({
	      'Content-Type': 'application/json'
	    }, options.headers)
	  }),
	      payload = _payload$raw$method$b.payload,
	      baseUrl = _payload$raw$method$b.baseUrl,
	      raw = _payload$raw$method$b.raw,
	      opts = objectWithoutProperties(_payload$raw$method$b, ["payload", "baseUrl", "raw"]);

	  var url = "".concat(baseUrl.replace(/\/$/, ''), "/").concat(path.replace(/^\//, ''));

	  if (payload) {
	    // overwrite body
	    opts.body = JSON.stringify(payload);
	  }

	  return window.fetch(url, opts).then(function (res) {
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

	/* node_modules/@datawrapper/controls/FormBlock.html generated by Svelte v2.16.1 */

	function data() {
	  return {
	    label: '',
	    help: '',
	    error: false,
	    success: false,
	    width: 'auto'
	  };
	}
	var file = "node_modules/datawrapper/controls/FormBlock.html";

	function create_main_fragment(component, ctx) {
	  var div1,
	      text0,
	      div0,
	      slot_content_default = component._slotted.default,
	      text1,
	      text2,
	      text3;
	  var if_block0 = ctx.label && create_if_block_3(component, ctx);
	  var if_block1 = ctx.success && create_if_block_2(component, ctx);
	  var if_block2 = ctx.error && create_if_block_1(component, ctx);
	  var if_block3 = !ctx.success && !ctx.error && ctx.help && create_if_block(component, ctx);
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
	      div0.className = "form-controls svelte-4hqcdn";
	      addLoc(div0, file, 4, 4, 158);
	      div1.className = "form-block svelte-4hqcdn";
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
	} // (2:4) {#if label}


	function create_if_block_3(component, ctx) {
	  var label;
	  return {
	    c: function create() {
	      label = createElement("label");
	      label.className = "control-label svelte-4hqcdn";
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
	} // (8:4) {#if success}


	function create_if_block_2(component, ctx) {
	  var div;
	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "help success svelte-4hqcdn";
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
	} // (10:10) {#if error}


	function create_if_block_1(component, ctx) {
	  var div;
	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "help error svelte-4hqcdn";
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
	} // (12:10) {#if !success && !error && help}


	function create_if_block(component, ctx) {
	  var div;
	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "help svelte-4hqcdn";
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

	  if (!options || !options.target && !options.root) {
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

	FormBlock.prototype._checkReadOnly = function _checkReadOnly(newState) {};

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

	function _await(value, then, direct) {
	  if (direct) {
	    return then ? then(value) : value;
	  }

	  if (!value || !value.then) {
	    value = Promise.resolve(value);
	  }

	  return then ? value.then(then) : value;
	}

	function _empty() {}

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

	function _continueIgnored(value) {
	  if (value && value.then) {
	    return value.then(_empty);
	  }
	}

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
	  createAccount: function createAccount(email) {
	    try {
	      var _this2 = this;

	      _this2.set({
	        signedUp: true
	      });

	      trackEvent('Chart Editor', 'send-embed-code');
	      return _continueIgnored(_catch(function () {
	        return _await(post('/v3/auth/signup', {
	          payload: {
	            email: email,
	            invitation: true,
	            chartId: _this2.store.get().id
	          }
	        }), function (res) {
	          if (_this2.get().fromSvelte) {
	            // when in new chart editor, set user object
	            _this2.set({
	              signedUp: false,
	              error: ''
	            });

	            _this2.store.set({
	              user: res
	            });
	          } else {
	            // otherwise, reload
	            window.location.reload();
	          }
	        });
	      }, function (e) {
	        return _invokeIgnored(function () {
	          if (e.name === 'HttpReqError') {
	            return _await(e.response.json(), function (res) {
	              _this2.set({
	                error: res.message || e
	              });
	            });
	          } else {
	            _this2.set({
	              error: "Unknown error: ".concat(e)
	            });
	          }
	        });
	      }));
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }
	};
	var file$1 = "publish/guest/Guest.html";

	function get_each_context_1(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.text = list[i];
	  return child_ctx;
	}

	function get_each_context(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.text = list[i];
	  return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
	  var div4,
	      div3,
	      div0,
	      text0,
	      div1,
	      input,
	      input_updating = false,
	      text1,
	      button0,
	      i0,
	      i0_class_value,
	      text2,
	      raw0_value = __('publish / guest / cta'),
	      raw0_before,
	      text3,
	      text4,
	      div2,
	      button1,
	      i1,
	      text5,
	      raw1_value = __('publish / guest / back'),
	      raw1_before,
	      text6;

	  function select_block_type(ctx) {
	    if (ctx.guest_text_above) return create_if_block_2$1;
	    return create_else_block;
	  }

	  var current_block_type = select_block_type(ctx);
	  var if_block0 = current_block_type(component, ctx);

	  function input_input_handler() {
	    input_updating = true;
	    component.set({
	      email: input.value
	    });
	    input_updating = false;
	  }

	  function click_handler(event) {
	    component.createAccount(ctx.email);
	  }

	  var formblock_initial_data = {
	    label: __('publish / guest / e-mail'),
	    help: __('publish / guest / example-email')
	  };
	  var formblock = new FormBlock({
	    root: component.root,
	    store: component.store,
	    slots: {
	      default: createFragment()
	    },
	    data: formblock_initial_data
	  });
	  var if_block1 = ctx.guest_text_below && create_if_block_1$1(component, ctx);
	  var if_block2 = ctx.error && create_if_block$1(component, ctx);
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
	      text2 = createText("   ");
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
	      addLoc(input, file$1, 12, 16, 506);
	      i0.className = i0_class_value = "fa " + (ctx.signedUp ? 'fa-circle-o-notch fa-spin' : 'fa-envelope');
	      addLoc(i0, file$1, 15, 20, 727);
	      addListener(button0, "click", click_handler);
	      button0.className = "btn btn-save btn-primary";
	      setStyle(button0, "white-space", "nowrap");
	      setStyle(button0, "margin-left", "10px");
	      addLoc(button0, file$1, 14, 16, 586);
	      setStyle(div1, "display", "flex");
	      addLoc(div1, file$1, 11, 12, 463);
	      i1.className = "fa fa-chevron-left";
	      addLoc(i1, file$1, 23, 62, 1104);
	      button1.className = "btn btn-save btn-default btn-back";
	      addLoc(button1, file$1, 23, 12, 1054);
	      setStyle(div2, "margin-top", "30px");
	      addLoc(div2, file$1, 22, 8, 1012);
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

	      if (changed.signedUp && i0_class_value !== (i0_class_value = "fa " + (ctx.signedUp ? 'fa-circle-o-notch fa-spin' : 'fa-envelope'))) {
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
	} // (4:89) {:else}


	function create_else_block(component, ctx) {
	  var h2,
	      raw0_value = __('publish / guest / h1'),
	      text,
	      p,
	      raw1_value = __('publish / guest / p');

	  return {
	    c: function create() {
	      h2 = createElement("h2");
	      text = createText("\n\n            ");
	      p = createElement("p");
	      addLoc(h2, file$1, 4, 12, 207);
	      addLoc(p, file$1, 6, 12, 264);
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
	} // (4:12) {#if guest_text_above}


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
	          var child_ctx = get_each_context(ctx, each_value, i);

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
	} // (4:35) {#each guest_text_above as text}


	function create_each_block_1(component, ctx) {
	  var raw_value = ctx.text,
	      raw_before,
	      raw_after;
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
	      if (changed.guest_text_above && raw_value !== (raw_value = ctx.text)) {
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
	} // (21:8) {#if guest_text_below}


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
	          var child_ctx = get_each_context_1(ctx, each_value_1, i);

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
	} // (21:31) {#each guest_text_below as text}


	function create_each_block(component, ctx) {
	  var raw_value = ctx.text,
	      raw_before,
	      raw_after;
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
	      if (changed.guest_text_below && raw_value !== (raw_value = ctx.text)) {
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
	} // (26:12) {#if error}


	function create_if_block$1(component, ctx) {
	  var div, text;
	  return {
	    c: function create() {
	      div = createElement("div");
	      text = createText(ctx.error);
	      div.className = "alert alert-warning";
	      addLoc(div, file$1, 26, 12, 1229);
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

	  if (!options || !options.target && !options.root) {
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

	Guest.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	/* publish/pending-activation/PendingActivation.html generated by Svelte v2.16.1 */

	function _await$1(value, then, direct) {
	  if (direct) {
	    return then ? then(value) : value;
	  }

	  if (!value || !value.then) {
	    value = Promise.resolve(value);
	  }

	  return then ? value.then(then) : value;
	}

	function _catch$1(body, recover) {
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

	function _empty$1() {}

	function _continueIgnored$1(value) {
	  if (value && value.then) {
	    return value.then(_empty$1);
	  }
	}

	function data$2() {
	  return {
	    status: ''
	  };
	}
	var methods$1 = {
	  resendActivation: function resendActivation() {
	    try {
	      var _this2 = this;

	      _this2.set({
	        status: 'sending'
	      });

	      return _continueIgnored$1(_catch$1(function () {
	        return _await$1(post('/v3/auth/resend-activation'), function () {
	          _this2.set({
	            status: 'success'
	          });
	        });
	      }, function () {
	        _this2.set({
	          status: 'error'
	        });
	      }));
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }
	};
	var file$2 = "publish/pending-activation/PendingActivation.html";

	function create_main_fragment$2(component, ctx) {
	  var div1,
	      h2,
	      raw0_value = __("publish / pending-activation / h1"),
	      text0,
	      p,
	      raw1_value = __("publish / pending-activation / p"),
	      text1,
	      div0;

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
	} // (17:8) {:else}


	function create_else_block$1(component, ctx) {
	  var button,
	      i,
	      i_class_value,
	      text,
	      raw_value = __("publish / pending-activation / resend"),
	      raw_before;

	  function click_handler(event) {
	    component.resendActivation();
	  }

	  return {
	    c: function create() {
	      button = createElement("button");
	      i = createElement("i");
	      text = createText("  \n            ");
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
	      if (changed.status && i_class_value !== (i_class_value = "fa " + (ctx.status == 'sending' ? 'fa-spin fa-circle-o-notch' : 'fa-envelope'))) {
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
	} // (13:35) 


	function create_if_block_1$2(component, ctx) {
	  var p,
	      raw_value = __("publish / pending-activation / resend-error");

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
	} // (9:8) {#if status == 'success'}


	function create_if_block$2(component, ctx) {
	  var p,
	      raw_value = __("publish / pending-activation / resend-success");

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

	  if (!options || !options.target && !options.root) {
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

	PendingActivation.prototype._checkReadOnly = function _checkReadOnly(newState) {};

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

	function loadScript(src) {
	  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	  return new Promise(function (resolve, reject) {
	    var script = document.createElement('script');
	    script.src = src;

	    script.onload = function () {
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

	function loadStylesheet(src) {
	  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	  return new Promise(function (resolve, reject) {
	    var link = document.createElement('link');
	    link.rel = 'stylesheet';
	    link.href = src;

	    link.onload = function () {
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

	function onstate(_ref) {
	  var _this = this;

	  var current = _ref.current,
	      changed = _ref.changed;

	  if (changed.afterEmbed && current.afterEmbed) {
	    var p = current.afterEmbed[0];
	    Promise.all([loadStylesheet(p.css), loadScript(p.js)]).then(function () {
	      require([p.module], function (mod) {
	        _this.set({
	          beforeExport: mod.App
	        });
	      });
	    });
	  }
	}
	var file$3 = "publish/PublishLogic.html";

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
	} // (8:4) {:else}


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
	} // (6:32) 


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
	} // (4:4) {#if $user.isGuest}


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
	  var _this2 = this;

	  this._debugName = '<PublishLogic>';

	  if (!options || !options.target && !options.root) {
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
	  onstate.call(this, {
	    changed: assignTrue({}, this._state),
	    current: this._state
	  });
	  this._fragment = create_main_fragment$3(this, this._state);

	  this.root._oncreate.push(function () {
	    _this2.fire("update", {
	      changed: assignTrue({}, _this2._state),
	      current: _this2._state
	    });
	  });

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);

	    flush(this);
	  }
	}

	assign(PublishLogic.prototype, protoDev);

	PublishLogic.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	function observe(key, callback, opts) {
	  var fn = callback.bind(this);

	  if (!opts || opts.init !== false) {
	    fn(this.get()[key]);
	  }

	  return this.on(opts && opts.defer ? 'update' : 'state', function (_a) {
	    var changed = _a.changed,
	        current = _a.current,
	        previous = _a.previous;
	    if (changed[key]) fn(current[key], previous && previous[key]);
	  });
	}

	/* publish/PublishSidebar.html generated by Svelte v2.16.1 */

	function data$4() {
	  return {
	    PublishLogic: PublishLogic
	  };
	}

	function oncreate() {
	  var _this = this;

	  this.store.observe = observe;
	  this.store.observe('publishLogic', function (cfg) {
	    if (cfg && cfg.mod) {
	      loadStylesheet(cfg.css);
	      loadScript(cfg.src, function () {
	        require([cfg.mod], function (mod) {
	          _this.set({
	            PublishLogic: mod.App
	          });

	          _this.refs.publish.set(cfg.data);
	        });
	      });
	    } else {
	      _this.set({
	        PublishLogic: PublishLogic
	      });

	      _this.refs.publish.set(cfg.data);
	    }
	  });
	}
	var file$4 = "publish/PublishSidebar.html";

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
	  var _this2 = this;

	  this._debugName = '<PublishSidebar>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this.refs = {};
	  this._state = assign(data$4(), options.data);
	  if (!('PublishLogic' in this._state)) console.warn("<PublishSidebar> was created without expected data property 'PublishLogic'");
	  this._intro = true;
	  this._fragment = create_main_fragment$4(this, this._state);

	  this.root._oncreate.push(function () {
	    oncreate.call(_this2);

	    _this2.fire("update", {
	      changed: assignTrue({}, _this2._state),
	      current: _this2._state
	    });
	  });

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);

	    flush(this);
	  }
	}

	assign(PublishSidebar.prototype, protoDev);

	PublishSidebar.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	var main = {
	  PublishSidebar: PublishSidebar
	};

	return main;

}));
//# sourceMappingURL=sidebar.js.map
