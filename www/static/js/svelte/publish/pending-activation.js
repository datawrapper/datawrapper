(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('svelte/publish/pending-activation', factory) :
  (global = global || self, global['publish/pending-activation'] = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

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

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

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
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
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

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

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

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = _objectWithoutPropertiesLoose(source, excluded);

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

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

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

  function setStyle(node, key, value) {
    node.style.setProperty(key, value);
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
    return a != a ? b == b : a !== b || a && _typeof(a) === 'object' || typeof a === 'function';
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
    if (_typeof(newState) !== 'object') {
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
    var _payload$raw$method$b = _objectSpread2({
      payload: null,
      raw: false,
      method: 'GET',
      baseUrl: "//".concat(dw.backend.__api_domain),
      mode: 'cors',
      credentials: 'include'
    }, options, {
      headers: _objectSpread2({
        'Content-Type': 'application/json'
      }, options.headers)
    }),
        payload = _payload$raw$method$b.payload,
        baseUrl = _payload$raw$method$b.baseUrl,
        raw = _payload$raw$method$b.raw,
        opts = _objectWithoutProperties(_payload$raw$method$b, ["payload", "baseUrl", "raw"]);

    var url = "".concat(baseUrl.replace(/\/$/, ''), "/").concat(path.replace(/^\//, ''));

    if (payload) {
      // overwrite body
      opts.body = JSON.stringify(payload);
    }

    return window.fetch(url, opts).then(function (res) {
      if (raw) return res;
      if (!res.ok) throw new HttpReqError(res);
      if (res.status === 204) return; // no content
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

      return httpReq(path, _objectSpread2({}, options, {
        method: method
      }));
    };
  }

  var HttpReqError =
  /*#__PURE__*/
  function (_Error) {
    _inherits(HttpReqError, _Error);

    function HttpReqError(res) {
      var _this;

      _classCallCheck(this, HttpReqError);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(HttpReqError).call(this));
      _this.name = 'HttpReqError';
      _this.status = res.status;
      _this.statusText = res.statusText;
      _this.message = "[".concat(res.status, "] ").concat(res.statusText);
      _this.response = res;
      return _this;
    }

    return HttpReqError;
  }(_wrapNativeSuper(Error));

  /* publish/pending-activation/PendingActivation.html generated by Svelte v2.16.1 */

  function _await(value, then, direct) {
    if (direct) {
      return then ? then(value) : value;
    }

    if (!value || !value.then) {
      value = Promise.resolve(value);
    }

    return then ? value.then(then) : value;
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

  function _empty() {}

  function _continueIgnored(value) {
    if (value && value.then) {
      return value.then(_empty);
    }
  }

  function data() {
    return {
      status: ''
    };
  }
  var methods = {
    resendActivation: function resendActivation() {
      try {
        var _this2 = this;

        _this2.set({
          status: 'sending'
        });

        return _continueIgnored(_catch(function () {
          return _await(post('/v3/auth/resend-activation'), function () {
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
  var file = "publish/pending-activation/PendingActivation.html";

  function create_main_fragment(component, ctx) {
    var div1,
        h2,
        raw0_value = __("publish / pending-activation / h1"),
        text0,
        p,
        raw1_value = __("publish / pending-activation / p"),
        text1,
        div0;

    function select_block_type(ctx) {
      if (ctx.status == 'success') return create_if_block;
      if (ctx.status == 'error') return create_if_block_1;
      return create_else_block;
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
        addLoc(h2, file, 3, 4, 102);
        addLoc(p, file, 5, 4, 164);
        setStyle(div0, "margin-top", "20px");
        addLoc(div0, file, 7, 4, 223);
        div1.className = "publish-form";
        div1.id = "step-2";
        addLoc(div1, file, 2, 0, 59);
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


  function create_else_block(component, ctx) {
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
        text = createText("  \n                ");
        raw_before = createElement('noscript');
        i.className = i_class_value = "fa " + (ctx.status == 'sending' ? 'fa-spin fa-circle-o-notch' : 'fa-envelope');
        addLoc(i, file, 18, 16, 648);
        addListener(button, "click", click_handler);
        button.className = "btn btn-primary";
        addLoc(button, file, 17, 12, 569);
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


  function create_if_block_1(component, ctx) {
    var p,
        raw_value = __("publish / pending-activation / resend-error");

    return {
      c: function create() {
        p = createElement("p");
        addLoc(p, file, 13, 12, 446);
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


  function create_if_block(component, ctx) {
    var p,
        raw_value = __("publish / pending-activation / resend-success");

    return {
      c: function create() {
        p = createElement("p");
        addLoc(p, file, 9, 12, 301);
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
    this._state = assign(data(), options.data);
    if (!('status' in this._state)) console.warn("<PendingActivation> was created without expected data property 'status'");
    this._intro = true;
    this._fragment = create_main_fragment(this, this._state);

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);
    }
  }

  assign(PendingActivation.prototype, protoDev);
  assign(PendingActivation.prototype, methods);

  PendingActivation.prototype._checkReadOnly = function _checkReadOnly(newState) {};

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
  var main = {
    App: PendingActivation,
    store: store
  };

  return main;

}));
//# sourceMappingURL=pending-activation.js.map
