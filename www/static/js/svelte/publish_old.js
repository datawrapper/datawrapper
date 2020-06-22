(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/publish_old', factory) :
	(global = global || self, global.publish = factory());
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

	function detachAfter(before) {
	  while (before.nextSibling) {
	    before.parentNode.removeChild(before.nextSibling);
	  }
	}

	function reinsertAfter(before, target) {
	  while (before.nextSibling) {
	    target.appendChild(before.nextSibling);
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

	/* node_modules/@datawrapper/controls/Help.html generated by Svelte v2.16.1 */

	function data() {
	  return {
	    visible: false
	  };
	}
	var methods = {
	  show: function show() {
	    var _this = this;

	    var t = setTimeout(function () {
	      _this.set({
	        visible: true
	      });
	    }, 400);
	    this.set({
	      t: t
	    });
	  },
	  hide: function hide() {
	    var _this$get = this.get(),
	        t = _this$get.t;

	    clearTimeout(t);
	    this.set({
	      visible: false
	    });
	  }
	};
	var file = "node_modules/datawrapper/controls/Help.html";

	function create_main_fragment(component, ctx) {
	  var div, span, text_1;
	  var if_block = ctx.visible && create_if_block(component);

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
	      span.className = "help-icon svelte-19xfki7";
	      addLoc(span, file, 1, 4, 69);
	      addListener(div, "mouseenter", mouseenter_handler);
	      addListener(div, "mouseleave", mouseleave_handler);
	      div.className = "help svelte-19xfki7";
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
	} // (3:4) {#if visible}


	function create_if_block(component, ctx) {
	  var div,
	      i,
	      text,
	      slot_content_default = component._slotted.default,
	      slot_content_default_before;
	  return {
	    c: function create() {
	      div = createElement("div");
	      i = createElement("i");
	      text = createText("\n        ");
	      i.className = "hat-icon im im-graduation-hat svelte-19xfki7";
	      addLoc(i, file, 4, 8, 154);
	      div.className = "content svelte-19xfki7";
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

	  if (!options || !options.target && !options.root) {
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

	Help.prototype._checkReadOnly = function _checkReadOnly(newState) {};

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
	function get$2(object) {
	  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	  var _default = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	  if (!key) return object; // expand keys

	  var keys = key.split('.');
	  var pt = object;

	  for (var i = 0; i < keys.length; i++) {
	    if (pt === null || pt === undefined) break; // break out of the loop
	    // move one more level in

	    pt = pt[keys[i]];
	  }

	  return pt === undefined || pt === null ? _default : pt;
	}

	var widths = [100, 200, 300, 400, 500, 700, 800, 900, 1000];
	function computeEmbedHeights () {
	  var embedHeights = {}; // compute embed deltas

	  var $ = window.$;
	  var previewChart = $($('#iframe-vis')[0].contentDocument); // find out default heights

	  var defaultHeight = $('h1', previewChart).height() + $('.chart-intro', previewChart).height() + $('.dw-chart-notes', previewChart).height();
	  var totalHeight = $('#iframe-vis').height();
	  widths.forEach(function (width) {
	    // now we resize headline, intro and footer
	    previewChart.find('h1,.chart-intro,.dw-chart-notes').css('width', width + 'px');
	    var height = $('h1', previewChart).height() + $('.chart-intro', previewChart).height() + $('.dw-chart-notes', previewChart).height();
	    embedHeights[width] = totalHeight + (height - defaultHeight);
	  });
	  previewChart.find('h1,.chart-intro,.dw-chart-notes').css('width', 'auto');
	  return embedHeights;
	}

	/* publish/App.html generated by Svelte v2.16.1 */
	var initial_auto_publish = true;

	function shareUrl(_ref) {
	  var shareurl_type = _ref.shareurl_type,
	      chart = _ref.chart,
	      plugin_shareurls = _ref.plugin_shareurls,
	      published = _ref.published;
	  if (!published) return 'https://www.datawrapper.de/...';
	  if (shareurl_type === 'default') return chart.publicUrl;
	  var url = '';
	  plugin_shareurls.forEach(function (t) {
	    if (t.id === shareurl_type) {
	      url = t.url.replace(/%chart_id%/g, chart.id);
	      url = url.replace(/%(.*?)%/g, function (match, path) {
	        return get$2({
	          id: chart.id,
	          metadata: chart.metadata
	        }, path);
	      });
	    }
	  });
	  return url;
	}

	function embedCode(_ref2) {
	  var embed_type = _ref2.embed_type,
	      chart = _ref2.chart;
	  if (!chart.metadata) return '';
	  if (chart.metadata.publish && !chart.metadata.publish['embed-codes']) return "<iframe src=\"".concat(chart.publicUrl, "\" width=\"100%\" height=\"").concat(chart.metadata.publish['embed-height'], "\" scrolling=\"no\" frameborder=\"0\" allowtransparency=\"true\"></iframe>");

	  if (chart.metadata.publish['embed-codes']['embed-method-' + embed_type]) {
	    return chart.metadata.publish['embed-codes']['embed-method-' + embed_type];
	  } else {
	    return '';
	  }
	}

	function publishWait(_ref3) {
	  var publishStarted = _ref3.publishStarted,
	      now = _ref3.now;
	  return publishStarted > 0 ? now - publishStarted : 0;
	}

	function data$1() {
	  return {
	    chart: {
	      id: ''
	    },
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
	    statusUrl: false
	  };
	}
	var methods$1 = {
	  publish: function publish() {
	    var _this = this;

	    var me = this; // wait another 100ms until the page is ready

	    if (!window.chart.save) {
	      setTimeout(function () {
	        me.publish();
	      }, 100);
	      return;
	    }

	    var _me$get = me.get(),
	        chart = _me$get.chart;

	    me.set({
	      publishing: true,
	      publishStarted: new Date().getTime(),
	      now: new Date().getTime(),
	      progress: [],
	      publish_error: false
	    }); // generate embed codes

	    chart.metadata.publish['embed-heights'] = computeEmbedHeights(chart, me.get().embed_templates); // update charts

	    me.set({
	      chart: chart
	    }); // save embed heights and wait until it's done before
	    // we start to publish the chart

	    trackEvent('Chart Editor', 'publish');
	    window.chart.attributes(chart).save().then(function (d) {
	      _this.set({
	        statusUrl: "/v3/charts/".concat(chart.id, "/publish/status/").concat(chart.publicVersion)
	      }); // publish chart


	      httpReq.post("/v3/charts/".concat(chart.id, "/publish")).then(function (res) {
	        _this.set({
	          published: true,
	          progress: ['done']
	        });

	        httpReq.get("/v3/charts/".concat(chart.id)).then(function (res) {
	          trackEvent('Chart Editor', 'publish-success');
	          me.publishFinished(res);
	        });
	      }).catch(function (error) {
	        trackEvent('Chart Editor', 'publish-error', error.message);
	      });
	      setTimeout(function () {
	        var _me$get2 = me.get(),
	            publishing = _me$get2.publishing;

	        if (publishing) me.updateStatus();
	      }, 1000);
	    });
	  },
	  updateStatus: function updateStatus() {
	    var _this2 = this;

	    var me = this;

	    var _me$get3 = me.get(),
	        statusUrl = _me$get3.statusUrl;

	    if (!statusUrl) return;
	    httpReq.get(statusUrl).then(function (res) {
	      _this2.set({
	        progress: res.progress || [],
	        now: new Date().getTime()
	      });

	      var _this2$get = _this2.get(),
	          publishing = _this2$get.publishing;

	      if (publishing) {
	        setTimeout(function () {
	          _this2.updateStatus();
	        }, 500);
	      }
	    });
	  },
	  publishFinished: function publishFinished(chartInfo) {
	    var _this3 = this;

	    this.set({
	      progress: ['done'],
	      published: true,
	      publishStarted: 0,
	      needs_republish: false
	    }); // give user 1s to read the success message

	    setTimeout(function () {
	      return _this3.set({
	        publishing: false
	      });
	    }, 1000);
	    this.set({
	      chart: chartInfo
	    });
	    window.parent.postMessage({
	      source: 'datawrapper',
	      type: 'chart-publish',
	      chartId: chartInfo.id
	    }, '*');
	    window.chart.attributes(chartInfo);
	  },
	  copy: function copy(embedCode) {
	    var me = this;
	    me.refs.embedInput.select();

	    try {
	      var successful = document.execCommand('copy');

	      if (successful) {
	        trackEvent('Chart Editor', 'embedcode-copy');
	        me.set({
	          copy_success: true
	        });
	        setTimeout(function () {
	          return me.set({
	            copy_success: false
	          });
	        }, 300);
	      }
	    } catch (err) {// console.log('Oops, unable to copy');
	    }
	  }
	};

	function onstate(_ref4) {
	  var changed = _ref4.changed,
	      current = _ref4.current;
	  var userDataReady = window.dw && window.dw.backend && window.dw.backend.setUserData;

	  if (changed.embed_type && userDataReady) {
	    var _data = window.dw.backend.__userData;
	    if (!current.embed_type || !_data) return;
	    _data.embed_type = current.embed_type;
	    window.dw.backend.setUserData(_data);
	  }

	  if (changed.shareurl_type && userDataReady) {
	    var _data2 = window.dw.backend.__userData;
	    if (!current.shareurl_type || !_data2) return;
	    _data2.shareurl_type = current.shareurl_type;
	    window.dw.backend.setUserData(_data2);
	  }

	  if (changed.published) {
	    window.document.querySelector('.dw-create-publish .publish-step').classList[current.published ? 'add' : 'remove']('is-published');
	  }

	  if (changed.auto_publish) {
	    if (current.auto_publish && initial_auto_publish) {
	      this.publish();
	      initial_auto_publish = false;
	      window.history.replaceState('', '', window.location.pathname);
	    }
	  }
	}
	var file$1 = "publish/App.html";

	function get_each2_context(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.tpl = list[i];
	  return child_ctx;
	}

	function get_each1_context(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.tpl = list[i];
	  return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.tpl = list[i];
	  return child_ctx;
	}

	function get_each_context(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.step = list[i];
	  child_ctx.i = i;
	  return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
	  var text0,
	      button0,
	      button0_class_value,
	      text1,
	      text2,
	      text3,
	      text4,
	      text5,
	      text6,
	      div13,
	      h2,
	      raw0_value = __('publish / share-embed'),
	      text7,
	      div5,
	      i0,
	      text8,
	      div3,
	      div1,
	      b0,
	      raw1_value = __('publish / share-url'),
	      text9,
	      div0,
	      label,
	      input,
	      text10,
	      raw2_value = __('publish / share-url / fullscreen'),
	      raw2_before,
	      text11,
	      text12,
	      div2,
	      a,
	      text13,
	      text14,
	      div4,
	      raw3_value = __('publish / help / share-url'),
	      text15,
	      div12,
	      i1,
	      text16,
	      div10,
	      div7,
	      b1,
	      raw4_value = __('publish / embed'),
	      text17,
	      div6,
	      text18,
	      div9,
	      textarea,
	      text19,
	      button1,
	      i2,
	      text20,
	      text21_value = __('publish / copy'),
	      text21,
	      text22,
	      div8,
	      text23_value = __('publish / copy-success'),
	      text23,
	      div8_class_value,
	      text24,
	      div11,
	      raw5_value = __('publish / embed / help'),
	      raw5_after,
	      text25,
	      div13_class_value;

	  function select_block_type(ctx) {
	    if (ctx.published) return create_if_block_7;
	    return create_else_block_1;
	  }

	  var current_block_type = select_block_type(ctx);
	  var if_block0 = current_block_type(component, ctx);

	  function select_block_type_1(ctx) {
	    if (ctx.published) return create_if_block_6;
	    return create_else_block;
	  }

	  var current_block_type_1 = select_block_type_1(ctx);
	  var if_block1 = current_block_type_1(component, ctx);

	  function click_handler(event) {
	    component.publish();
	  }

	  var if_block2 = !ctx.published && create_if_block_5();
	  var if_block3 = ctx.needs_republish && !ctx.publishing && create_if_block_4();
	  var if_block4 = ctx.published && !ctx.needs_republish && ctx.progress && ctx.progress.includes('done') && !ctx.publishing && create_if_block_3();
	  var if_block5 = ctx.publish_error && create_if_block_2(component, ctx);
	  var if_block6 = ctx.publishing && create_if_block$1(component, ctx);

	  function input_change_handler() {
	    component.set({
	      shareurl_type: input.__value
	    });
	  }

	  var each0_value = ctx.plugin_shareurls;
	  var each0_blocks = [];

	  for (var i = 0; i < each0_value.length; i += 1) {
	    each0_blocks[i] = create_each_block_2(component, get_each0_context(ctx, each0_value, i));
	  }

	  var help0 = new Help({
	    root: component.root,
	    store: component.store,
	    slots: {
	      default: createFragment()
	    }
	  });
	  var each1_value = ctx.embed_templates;
	  var each1_blocks = [];

	  for (var i = 0; i < each1_value.length; i += 1) {
	    each1_blocks[i] = create_each_block_1(component, get_each1_context(ctx, each1_value, i));
	  }

	  function click_handler_1(event) {
	    component.copy(ctx.embedCode);
	  }

	  var each2_value = ctx.embed_templates.slice(2);
	  var each2_blocks = [];

	  for (var i = 0; i < each2_value.length; i += 1) {
	    each2_blocks[i] = create_each_block(component, get_each2_context(ctx, each2_value, i));
	  }

	  var help1 = new Help({
	    root: component.root,
	    store: component.store,
	    slots: {
	      default: createFragment()
	    }
	  });
	  return {
	    c: function create() {
	      if_block0.c();
	      text0 = createText("\n\n");
	      button0 = createElement("button");
	      if_block1.c();
	      text1 = createText("\n\n");
	      if (if_block2) if_block2.c();
	      text2 = createText(" ");
	      if (if_block3) if_block3.c();
	      text3 = createText(" ");
	      if (if_block4) if_block4.c();
	      text4 = createText(" ");
	      if (if_block5) if_block5.c();
	      text5 = createText(" ");
	      if (if_block6) if_block6.c();
	      text6 = createText("\n\n");
	      div13 = createElement("div");
	      h2 = createElement("h2");
	      text7 = createText("\n    ");
	      div5 = createElement("div");
	      i0 = createElement("i");
	      text8 = createText("\n        ");
	      div3 = createElement("div");
	      div1 = createElement("div");
	      b0 = createElement("b");
	      text9 = createText("\n                ");
	      div0 = createElement("div");
	      label = createElement("label");
	      input = createElement("input");
	      text10 = createText("\n                        ");
	      raw2_before = createElement('noscript');
	      text11 = createText("\n                    ");

	      for (var i = 0; i < each0_blocks.length; i += 1) {
	        each0_blocks[i].c();
	      }

	      text12 = createText("\n            ");
	      div2 = createElement("div");
	      a = createElement("a");
	      text13 = createText(ctx.shareUrl);
	      text14 = createText("\n        ");
	      div4 = createElement("div");

	      help0._fragment.c();

	      text15 = createText("\n\n    ");
	      div12 = createElement("div");
	      i1 = createElement("i");
	      text16 = createText("\n        ");
	      div10 = createElement("div");
	      div7 = createElement("div");
	      b1 = createElement("b");
	      text17 = createText("\n                ");
	      div6 = createElement("div");

	      for (var i = 0; i < each1_blocks.length; i += 1) {
	        each1_blocks[i].c();
	      }

	      text18 = createText("\n            ");
	      div9 = createElement("div");
	      textarea = createElement("textarea");
	      text19 = createText("\n                ");
	      button1 = createElement("button");
	      i2 = createElement("i");
	      text20 = createText(" ");
	      text21 = createText(text21_value);
	      text22 = createText("\n                ");
	      div8 = createElement("div");
	      text23 = createText(text23_value);
	      text24 = createText("\n        ");
	      div11 = createElement("div");
	      raw5_after = createElement('noscript');
	      text25 = createText(" ");

	      for (var i = 0; i < each2_blocks.length; i += 1) {
	        each2_blocks[i].c();
	      }

	      help1._fragment.c();

	      addListener(button0, "click", click_handler);
	      button0.disabled = ctx.publishing;
	      button0.className = button0_class_value = "btn-publish btn btn-primary btn-large " + (ctx.published ? '' : 'btn-first-publish') + " svelte-1wigpa8";
	      addLoc(button0, file$1, 6, 0, 153);
	      addLoc(h2, file$1, 56, 4, 1911);
	      i0.className = "icon fa fa-link fa-fw";
	      addLoc(i0, file$1, 58, 8, 1989);
	      addLoc(b0, file$1, 61, 16, 2099);

	      component._bindingGroups[0].push(input);

	      addListener(input, "change", input_change_handler);
	      input.__value = "default";
	      input.value = input.__value;
	      setAttribute(input, "type", "radio");
	      input.name = "url-type";
	      input.className = "svelte-1wigpa8";
	      addLoc(input, file$1, 64, 24, 2251);
	      label.className = "radio";
	      addLoc(label, file$1, 63, 20, 2205);
	      div0.className = "embed-options svelte-1wigpa8";
	      addLoc(div0, file$1, 62, 16, 2157);
	      div1.className = "h";
	      addLoc(div1, file$1, 60, 12, 2067);
	      a.target = "_blank";
	      a.className = "share-url svelte-1wigpa8";
	      a.href = ctx.shareUrl;
	      addLoc(a, file$1, 73, 16, 2754);
	      div2.className = "inpt";
	      addLoc(div2, file$1, 72, 12, 2719);
	      div3.className = "ctrls";
	      addLoc(div3, file$1, 59, 8, 2035);
	      addLoc(div4, file$1, 77, 12, 2885);
	      div5.className = "block";
	      addLoc(div5, file$1, 57, 4, 1961);
	      i1.className = "icon fa fa-code fa-fw";
	      addLoc(i1, file$1, 82, 8, 2998);
	      addLoc(b1, file$1, 85, 16, 3108);
	      div6.className = "embed-options svelte-1wigpa8";
	      addLoc(div6, file$1, 86, 16, 3162);
	      div7.className = "h";
	      addLoc(div7, file$1, 84, 12, 3076);
	      setAttribute(textarea, "type", "text");
	      textarea.className = "input embed-code svelte-1wigpa8";
	      textarea.readOnly = true;
	      textarea.value = ctx.embedCode;
	      addLoc(textarea, file$1, 93, 16, 3490);
	      i2.className = "fa fa-copy";
	      addLoc(i2, file$1, 94, 85, 3678);
	      addListener(button1, "click", click_handler_1);
	      button1.className = "btn btn-copy";
	      button1.title = "copy";
	      addLoc(button1, file$1, 94, 16, 3609);
	      div8.className = div8_class_value = "copy-success " + (ctx.copy_success ? 'show' : '') + " svelte-1wigpa8";
	      addLoc(div8, file$1, 95, 16, 3755);
	      div9.className = "inpt";
	      addLoc(div9, file$1, 92, 12, 3455);
	      div10.className = "ctrls";
	      addLoc(div10, file$1, 83, 8, 3044);
	      addLoc(div11, file$1, 101, 12, 3946);
	      div12.className = "block";
	      addLoc(div12, file$1, 81, 4, 2970);
	      setStyle(div13, "margin-top", "20px");
	      div13.className = div13_class_value = ctx.published ? '' : 'inactive';
	      addLoc(div13, file$1, 55, 0, 1843);
	    },
	    m: function mount(target, anchor) {
	      if_block0.m(target, anchor);
	      insert(target, text0, anchor);
	      insert(target, button0, anchor);
	      if_block1.m(button0, null);
	      insert(target, text1, anchor);
	      if (if_block2) if_block2.m(target, anchor);
	      insert(target, text2, anchor);
	      if (if_block3) if_block3.m(target, anchor);
	      insert(target, text3, anchor);
	      if (if_block4) if_block4.m(target, anchor);
	      insert(target, text4, anchor);
	      if (if_block5) if_block5.m(target, anchor);
	      insert(target, text5, anchor);
	      if (if_block6) if_block6.m(target, anchor);
	      insert(target, text6, anchor);
	      insert(target, div13, anchor);
	      append(div13, h2);
	      h2.innerHTML = raw0_value;
	      append(div13, text7);
	      append(div13, div5);
	      append(div5, i0);
	      append(div5, text8);
	      append(div5, div3);
	      append(div3, div1);
	      append(div1, b0);
	      b0.innerHTML = raw1_value;
	      append(div1, text9);
	      append(div1, div0);
	      append(div0, label);
	      append(label, input);
	      input.checked = input.__value === ctx.shareurl_type;
	      append(label, text10);
	      append(label, raw2_before);
	      raw2_before.insertAdjacentHTML("afterend", raw2_value);
	      append(div0, text11);

	      for (var i = 0; i < each0_blocks.length; i += 1) {
	        each0_blocks[i].m(div0, null);
	      }

	      append(div3, text12);
	      append(div3, div2);
	      append(div2, a);
	      append(a, text13);
	      append(div5, text14);
	      append(help0._slotted.default, div4);
	      div4.innerHTML = raw3_value;

	      help0._mount(div5, null);

	      append(div13, text15);
	      append(div13, div12);
	      append(div12, i1);
	      append(div12, text16);
	      append(div12, div10);
	      append(div10, div7);
	      append(div7, b1);
	      b1.innerHTML = raw4_value;
	      append(div7, text17);
	      append(div7, div6);

	      for (var i = 0; i < each1_blocks.length; i += 1) {
	        each1_blocks[i].m(div6, null);
	      }

	      append(div10, text18);
	      append(div10, div9);
	      append(div9, textarea);
	      component.refs.embedInput = textarea;
	      append(div9, text19);
	      append(div9, button1);
	      append(button1, i2);
	      append(button1, text20);
	      append(button1, text21);
	      append(div9, text22);
	      append(div9, div8);
	      append(div8, text23);
	      append(div12, text24);
	      append(help1._slotted.default, div11);
	      append(div11, raw5_after);
	      raw5_after.insertAdjacentHTML("beforebegin", raw5_value);
	      append(div11, text25);

	      for (var i = 0; i < each2_blocks.length; i += 1) {
	        each2_blocks[i].m(div11, null);
	      }

	      help1._mount(div12, null);
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;

	      if (current_block_type !== (current_block_type = select_block_type(ctx))) {
	        if_block0.d(1);
	        if_block0 = current_block_type(component, ctx);
	        if_block0.c();
	        if_block0.m(text0.parentNode, text0);
	      }

	      if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
	        if_block1.p(changed, ctx);
	      } else {
	        if_block1.d(1);
	        if_block1 = current_block_type_1(component, ctx);
	        if_block1.c();
	        if_block1.m(button0, null);
	      }

	      if (changed.publishing) {
	        button0.disabled = ctx.publishing;
	      }

	      if (changed.published && button0_class_value !== (button0_class_value = "btn-publish btn btn-primary btn-large " + (ctx.published ? '' : 'btn-first-publish') + " svelte-1wigpa8")) {
	        button0.className = button0_class_value;
	      }

	      if (!ctx.published) {
	        if (!if_block2) {
	          if_block2 = create_if_block_5();
	          if_block2.c();
	          if_block2.m(text2.parentNode, text2);
	        }
	      } else if (if_block2) {
	        if_block2.d(1);
	        if_block2 = null;
	      }

	      if (ctx.needs_republish && !ctx.publishing) {
	        if (!if_block3) {
	          if_block3 = create_if_block_4();
	          if_block3.c();
	          if_block3.m(text3.parentNode, text3);
	        }
	      } else if (if_block3) {
	        if_block3.d(1);
	        if_block3 = null;
	      }

	      if (ctx.published && !ctx.needs_republish && ctx.progress && ctx.progress.includes('done') && !ctx.publishing) {
	        if (!if_block4) {
	          if_block4 = create_if_block_3();
	          if_block4.c();
	          if_block4.m(text4.parentNode, text4);
	        }
	      } else if (if_block4) {
	        if_block4.d(1);
	        if_block4 = null;
	      }

	      if (ctx.publish_error) {
	        if (if_block5) {
	          if_block5.p(changed, ctx);
	        } else {
	          if_block5 = create_if_block_2(component, ctx);
	          if_block5.c();
	          if_block5.m(text5.parentNode, text5);
	        }
	      } else if (if_block5) {
	        if_block5.d(1);
	        if_block5 = null;
	      }

	      if (ctx.publishing) {
	        if (if_block6) {
	          if_block6.p(changed, ctx);
	        } else {
	          if_block6 = create_if_block$1(component, ctx);
	          if_block6.c();
	          if_block6.m(text6.parentNode, text6);
	        }
	      } else if (if_block6) {
	        if_block6.d(1);
	        if_block6 = null;
	      }

	      if (changed.shareurl_type) input.checked = input.__value === ctx.shareurl_type;

	      if (changed.plugin_shareurls || changed.shareurl_type) {
	        each0_value = ctx.plugin_shareurls;

	        for (var i = 0; i < each0_value.length; i += 1) {
	          var child_ctx = get_each0_context(ctx, each0_value, i);

	          if (each0_blocks[i]) {
	            each0_blocks[i].p(changed, child_ctx);
	          } else {
	            each0_blocks[i] = create_each_block_2(component, child_ctx);
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
	        setData(text13, ctx.shareUrl);
	        a.href = ctx.shareUrl;
	      }

	      if (changed.embed_templates || changed.embed_type) {
	        each1_value = ctx.embed_templates;

	        for (var i = 0; i < each1_value.length; i += 1) {
	          var _child_ctx = get_each1_context(ctx, each1_value, i);

	          if (each1_blocks[i]) {
	            each1_blocks[i].p(changed, _child_ctx);
	          } else {
	            each1_blocks[i] = create_each_block_1(component, _child_ctx);
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

	      if (changed.copy_success && div8_class_value !== (div8_class_value = "copy-success " + (ctx.copy_success ? 'show' : '') + " svelte-1wigpa8")) {
	        div8.className = div8_class_value;
	      }

	      if (changed.embed_templates) {
	        each2_value = ctx.embed_templates.slice(2);

	        for (var i = 0; i < each2_value.length; i += 1) {
	          var _child_ctx2 = get_each2_context(ctx, each2_value, i);

	          if (each2_blocks[i]) {
	            each2_blocks[i].p(changed, _child_ctx2);
	          } else {
	            each2_blocks[i] = create_each_block(component, _child_ctx2);
	            each2_blocks[i].c();
	            each2_blocks[i].m(div11, null);
	          }
	        }

	        for (; i < each2_blocks.length; i += 1) {
	          each2_blocks[i].d(1);
	        }

	        each2_blocks.length = each2_value.length;
	      }

	      if (changed.published && div13_class_value !== (div13_class_value = ctx.published ? '' : 'inactive')) {
	        div13.className = div13_class_value;
	      }
	    },
	    d: function destroy(detach) {
	      if_block0.d(detach);

	      if (detach) {
	        detachNode(text0);
	        detachNode(button0);
	      }

	      if_block1.d();
	      removeListener(button0, "click", click_handler);

	      if (detach) {
	        detachNode(text1);
	      }

	      if (if_block2) if_block2.d(detach);

	      if (detach) {
	        detachNode(text2);
	      }

	      if (if_block3) if_block3.d(detach);

	      if (detach) {
	        detachNode(text3);
	      }

	      if (if_block4) if_block4.d(detach);

	      if (detach) {
	        detachNode(text4);
	      }

	      if (if_block5) if_block5.d(detach);

	      if (detach) {
	        detachNode(text5);
	      }

	      if (if_block6) if_block6.d(detach);

	      if (detach) {
	        detachNode(text6);
	        detachNode(div13);
	      }

	      component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);

	      removeListener(input, "change", input_change_handler);
	      destroyEach(each0_blocks, detach);
	      help0.destroy();
	      destroyEach(each1_blocks, detach);
	      if (component.refs.embedInput === textarea) component.refs.embedInput = null;
	      removeListener(button1, "click", click_handler_1);
	      destroyEach(each2_blocks, detach);
	      help1.destroy();
	    }
	  };
	} // (3:0) {:else}


	function create_else_block_1(component, ctx) {
	  var p,
	      raw_value = __('publish / publish-intro');

	  return {
	    c: function create() {
	      p = createElement("p");
	      setStyle(p, "margin-bottom", "20px");
	      addLoc(p, file$1, 3, 0, 72);
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
	} // (1:0) {#if published}


	function create_if_block_7(component, ctx) {
	  var p,
	      raw_value = __('publish / republish-intro');

	  return {
	    c: function create() {
	      p = createElement("p");
	      addLoc(p, file$1, 1, 0, 16);
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
	} // (12:4) {:else}


	function create_else_block(component, ctx) {
	  var span1,
	      i,
	      i_class_value,
	      text0,
	      span0,
	      text1_value = __('publish / publish-btn'),
	      text1;

	  return {
	    c: function create() {
	      span1 = createElement("span");
	      i = createElement("i");
	      text0 = createText("\n        ");
	      span0 = createElement("span");
	      text1 = createText(text1_value);
	      i.className = i_class_value = "fa fa-fw " + (ctx.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-1wigpa8";
	      addLoc(i, file$1, 13, 9, 534);
	      span0.className = "title svelte-1wigpa8";
	      addLoc(span0, file$1, 14, 8, 623);
	      span1.className = "publish";
	      addLoc(span1, file$1, 12, 4, 503);
	    },
	    m: function mount(target, anchor) {
	      insert(target, span1, anchor);
	      append(span1, i);
	      append(span1, text0);
	      append(span1, span0);
	      append(span0, text1);
	    },
	    p: function update(changed, ctx) {
	      if (changed.publishing && i_class_value !== (i_class_value = "fa fa-fw " + (ctx.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-1wigpa8")) {
	        i.className = i_class_value;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(span1);
	      }
	    }
	  };
	} // (8:4) {#if published}


	function create_if_block_6(component, ctx) {
	  var span1,
	      i,
	      i_class_value,
	      text0,
	      span0,
	      text1_value = __('publish / republish-btn'),
	      text1;

	  return {
	    c: function create() {
	      span1 = createElement("span");
	      i = createElement("i");
	      text0 = createText(" ");
	      span0 = createElement("span");
	      text1 = createText(text1_value);
	      i.className = i_class_value = "fa fa-fw fa-refresh " + (ctx.publishing ? 'fa-spin' : '') + " svelte-1wigpa8";
	      addLoc(i, file$1, 9, 9, 348);
	      span0.className = "title svelte-1wigpa8";
	      addLoc(span0, file$1, 9, 75, 414);
	      span1.className = "re-publish";
	      addLoc(span1, file$1, 8, 4, 314);
	    },
	    m: function mount(target, anchor) {
	      insert(target, span1, anchor);
	      append(span1, i);
	      append(span1, text0);
	      append(span1, span0);
	      append(span0, text1);
	    },
	    p: function update(changed, ctx) {
	      if (changed.publishing && i_class_value !== (i_class_value = "fa fa-fw fa-refresh " + (ctx.publishing ? 'fa-spin' : '') + " svelte-1wigpa8")) {
	        i.className = i_class_value;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(span1);
	      }
	    }
	  };
	} // (20:0) {#if !published}


	function create_if_block_5(component, ctx) {
	  var div2,
	      div0,
	      i,
	      text,
	      div1,
	      raw_value = __('publish / publish-btn-intro');

	  return {
	    c: function create() {
	      div2 = createElement("div");
	      div0 = createElement("div");
	      i = createElement("i");
	      text = createText("\n    ");
	      div1 = createElement("div");
	      i.className = "fa fa-chevron-left";
	      addLoc(i, file$1, 22, 8, 792);
	      div0.className = "arrow svelte-1wigpa8";
	      addLoc(div0, file$1, 21, 4, 764);
	      div1.className = "text svelte-1wigpa8";
	      addLoc(div1, file$1, 24, 4, 842);
	      div2.className = "publish-intro svelte-1wigpa8";
	      addLoc(div2, file$1, 20, 0, 732);
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
	} // (29:6) {#if needs_republish && !publishing}


	function create_if_block_4(component, ctx) {
	  var div,
	      raw_value = __('publish / republish-alert');

	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "btn-aside alert svelte-1wigpa8";
	      addLoc(div, file$1, 29, 0, 973);
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
	} // (33:6) {#if published && !needs_republish && progress && progress.includes('done') && !publishing}


	function create_if_block_3(component, ctx) {
	  var div,
	      raw_value = __('publish / publish-success');

	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "alert alert-success";
	      addLoc(div, file$1, 33, 0, 1153);
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
	} // (37:6) {#if publish_error}


	function create_if_block_2(component, ctx) {
	  var div;
	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "alert alert-error";
	      addLoc(div, file$1, 37, 0, 1265);
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
	} // (41:6) {#if publishing}


	function create_if_block$1(component, ctx) {
	  var div,
	      text0_value = __("publish / progress / please-wait"),
	      text0,
	      text1;

	  var if_block = ctx.publishWait > 3000 && create_if_block_1(component, ctx);
	  return {
	    c: function create() {
	      div = createElement("div");
	      text0 = createText(text0_value);
	      text1 = createText(" ");
	      if (if_block) if_block.c();
	      div.className = "alert alert-info publishing";
	      addLoc(div, file$1, 41, 0, 1354);
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
	          if_block = create_if_block_1(component, ctx);
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
	} // (43:47) {#if publishWait > 3000}


	function create_if_block_1(component, ctx) {
	  var ul;
	  var each_value = ctx.progress;
	  var each_blocks = [];

	  for (var i = 0; i < each_value.length; i += 1) {
	    each_blocks[i] = create_each_block_3(component, get_each_context(ctx, each_value, i));
	  }

	  return {
	    c: function create() {
	      ul = createElement("ul");

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].c();
	      }

	      ul.className = "publish-progress unstyled svelte-1wigpa8";
	      addLoc(ul, file$1, 44, 4, 1520);
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
	          var child_ctx = get_each_context(ctx, each_value, i);

	          if (each_blocks[i]) {
	            each_blocks[i].p(changed, child_ctx);
	          } else {
	            each_blocks[i] = create_each_block_3(component, child_ctx);
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
	} // (46:8) {#each progress as step,i}


	function create_each_block_3(component, ctx) {
	  var li,
	      i_1,
	      i_1_class_value,
	      text,
	      raw_value = __('publish / status / ' + ctx.step),
	      raw_before;

	  return {
	    c: function create() {
	      li = createElement("li");
	      i_1 = createElement("i");
	      text = createText(" ");
	      raw_before = createElement('noscript');
	      i_1.className = i_1_class_value = "fa fa-fw " + (ctx.i < ctx.progress.length - 1 ? 'fa-check' : 'fa-spinner fa-pulse') + " svelte-1wigpa8";
	      addLoc(i_1, file$1, 47, 12, 1654);
	      li.className = "svelte-1wigpa8";
	      toggleClass(li, "done", ctx.i < ctx.progress.length - 1);
	      addLoc(li, file$1, 46, 8, 1602);
	    },
	    m: function mount(target, anchor) {
	      insert(target, li, anchor);
	      append(li, i_1);
	      append(li, text);
	      append(li, raw_before);
	      raw_before.insertAdjacentHTML("afterend", raw_value);
	    },
	    p: function update(changed, ctx) {
	      if (changed.progress && i_1_class_value !== (i_1_class_value = "fa fa-fw " + (ctx.i < ctx.progress.length - 1 ? 'fa-check' : 'fa-spinner fa-pulse') + " svelte-1wigpa8")) {
	        i_1.className = i_1_class_value;
	      }

	      if (changed.progress && raw_value !== (raw_value = __('publish / status / ' + ctx.step))) {
	        detachAfter(raw_before);
	        raw_before.insertAdjacentHTML("afterend", raw_value);
	      }

	      if (changed.progress) {
	        toggleClass(li, "done", ctx.i < ctx.progress.length - 1);
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(li);
	      }
	    }
	  };
	} // (68:20) {#each plugin_shareurls as tpl}


	function create_each_block_2(component, ctx) {
	  var label,
	      input,
	      input_value_value,
	      text,
	      raw_value = ctx.tpl.name,
	      raw_before;

	  function input_change_handler() {
	    component.set({
	      shareurl_type: input.__value
	    });
	  }

	  return {
	    c: function create() {
	      label = createElement("label");
	      input = createElement("input");
	      text = createText(" ");
	      raw_before = createElement('noscript');

	      component._bindingGroups[0].push(input);

	      addListener(input, "change", input_change_handler);
	      input.__value = input_value_value = ctx.tpl.id;
	      input.value = input.__value;
	      setAttribute(input, "type", "radio");
	      input.name = "url-type";
	      input.className = "svelte-1wigpa8";
	      addLoc(input, file$1, 68, 42, 2528);
	      label.className = "radio";
	      addLoc(label, file$1, 68, 20, 2506);
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

	      if (changed.plugin_shareurls && input_value_value !== (input_value_value = ctx.tpl.id)) {
	        input.__value = input_value_value;
	      }

	      input.value = input.__value;

	      if (changed.plugin_shareurls && raw_value !== (raw_value = ctx.tpl.name)) {
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
	} // (88:20) {#each embed_templates as tpl}


	function create_each_block_1(component, ctx) {
	  var label,
	      input,
	      input_value_value,
	      text,
	      raw_value = ctx.tpl.title,
	      raw_before;

	  function input_change_handler() {
	    component.set({
	      embed_type: input.__value
	    });
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
	      input.className = "svelte-1wigpa8";
	      addLoc(input, file$1, 88, 41, 3282);
	      label.className = "radio";
	      addLoc(label, file$1, 88, 20, 3261);
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

	      if (changed.embed_templates && input_value_value !== (input_value_value = ctx.tpl.id)) {
	        input.__value = input_value_value;
	      }

	      input.value = input.__value;

	      if (changed.embed_templates && raw_value !== (raw_value = ctx.tpl.title)) {
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
	} // (103:54) {#each embed_templates.slice(2) as tpl}


	function create_each_block(component, ctx) {
	  var div,
	      b,
	      text0_value = ctx.tpl.title,
	      text0,
	      text1,
	      text2,
	      raw_value = ctx.tpl.text,
	      raw_before;
	  return {
	    c: function create() {
	      div = createElement("div");
	      b = createElement("b");
	      text0 = createText(text0_value);
	      text1 = createText(":");
	      text2 = createText(" ");
	      raw_before = createElement('noscript');
	      addLoc(b, file$1, 103, 21, 4067);
	      addLoc(div, file$1, 103, 16, 4062);
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
	      if (changed.embed_templates && text0_value !== (text0_value = ctx.tpl.title)) {
	        setData(text0, text0_value);
	      }

	      if (changed.embed_templates && raw_value !== (raw_value = ctx.tpl.text)) {
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

	function App(options) {
	  var _this4 = this;

	  this._debugName = '<App>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this.refs = {};
	  this._state = assign(data$1(), options.data);

	  this._recompute({
	    shareurl_type: 1,
	    chart: 1,
	    plugin_shareurls: 1,
	    published: 1,
	    embed_type: 1,
	    publishStarted: 1,
	    now: 1
	  }, this._state);

	  if (!('shareurl_type' in this._state)) console.warn("<App> was created without expected data property 'shareurl_type'");
	  if (!('chart' in this._state)) console.warn("<App> was created without expected data property 'chart'");
	  if (!('plugin_shareurls' in this._state)) console.warn("<App> was created without expected data property 'plugin_shareurls'");
	  if (!('published' in this._state)) console.warn("<App> was created without expected data property 'published'");
	  if (!('embed_type' in this._state)) console.warn("<App> was created without expected data property 'embed_type'");
	  if (!('publishStarted' in this._state)) console.warn("<App> was created without expected data property 'publishStarted'");
	  if (!('now' in this._state)) console.warn("<App> was created without expected data property 'now'");
	  if (!('publishing' in this._state)) console.warn("<App> was created without expected data property 'publishing'");
	  if (!('needs_republish' in this._state)) console.warn("<App> was created without expected data property 'needs_republish'");
	  if (!('progress' in this._state)) console.warn("<App> was created without expected data property 'progress'");
	  if (!('publish_error' in this._state)) console.warn("<App> was created without expected data property 'publish_error'");
	  if (!('embed_templates' in this._state)) console.warn("<App> was created without expected data property 'embed_templates'");
	  if (!('copy_success' in this._state)) console.warn("<App> was created without expected data property 'copy_success'");
	  this._bindingGroups = [[], []];
	  this._intro = true;
	  this._handlers.state = [onstate];
	  onstate.call(this, {
	    changed: assignTrue({}, this._state),
	    current: this._state
	  });
	  this._fragment = create_main_fragment$1(this, this._state);

	  this.root._oncreate.push(function () {
	    _this4.fire("update", {
	      changed: assignTrue({}, _this4._state),
	      current: _this4._state
	    });
	  });

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);

	    flush(this);
	  }
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$1);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	  if ('shareUrl' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'shareUrl'");
	  if ('embedCode' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'embedCode'");
	  if ('publishWait' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'publishWait'");
	};

	App.prototype._recompute = function _recompute(changed, state) {
	  if (changed.shareurl_type || changed.chart || changed.plugin_shareurls || changed.published) {
	    if (this._differs(state.shareUrl, state.shareUrl = shareUrl(state))) changed.shareUrl = true;
	  }

	  if (changed.embed_type || changed.chart) {
	    if (this._differs(state.embedCode, state.embedCode = embedCode(state))) changed.embedCode = true;
	  }

	  if (changed.publishStarted || changed.now) {
	    if (this._differs(state.publishWait, state.publishWait = publishWait(state))) changed.publishWait = true;
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

	/* eslint camelcase: "off" */
	var store = new Store({});
	var data$2 = {
	  chart: {
	    id: ''
	  },
	  embed_templates: [],
	  plugin_shareurls: [],
	  published: false,
	  publishing: false,
	  needs_republish: false,
	  publish_error: false,
	  auto_publish: false,
	  progress: [],
	  shareurl_type: 'default',
	  embed_type: 'responsive',
	  copy_success: false
	};
	var main = {
	  App: App,
	  data: data$2,
	  store: store
	};

	return main;

}));
//# sourceMappingURL=publish_old.js.map
