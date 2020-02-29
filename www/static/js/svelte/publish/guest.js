(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('svelte/publish/guest', factory) :
  (global = global || self, global['publish/guest'] = factory());
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

  function setAttribute(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);else node.setAttribute(attribute, value);
  }

  function setData(text, data) {
    text.data = '' + data;
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

  function data() {
    return {
      error: '',
      email: '',
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
  var file = "publish/guest/Guest.html";

  function create_main_fragment(component, ctx) {
    var div3,
        h2,
        raw0_value = __('publish / guest / h1'),
        text0,
        p,
        raw1_value = __('publish / guest / p'),
        text1,
        ul,
        li0,
        i0,
        text2,
        raw2_value = __('publish / guest / li1'),
        raw2_before,
        text3,
        li1,
        i1,
        text4,
        raw3_value = __('publish / guest / li2'),
        raw3_before,
        text5,
        li2,
        i2,
        text6,
        raw4_value = __('publish / guest / li3'),
        raw4_before,
        text7,
        fieldset,
        div1,
        label,
        raw5_value = __('publish / guest / e-mail'),
        text8,
        div0,
        input,
        input_updating = false,
        text9,
        div2,
        button0,
        i3,
        text10,
        raw6_value = __('publish / guest / back'),
        raw6_before,
        text11,
        button1,
        i4,
        i4_class_value,
        text12,
        raw7_value = __('publish / guest / cta'),
        raw7_before,
        text13;

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

    var if_block = ctx.error && create_if_block(component, ctx);
    return {
      c: function create() {
        div3 = createElement("div");
        h2 = createElement("h2");
        text0 = createText("\n\n    ");
        p = createElement("p");
        text1 = createText("\n\n    ");
        ul = createElement("ul");
        li0 = createElement("li");
        i0 = createElement("i");
        text2 = createText("  ");
        raw2_before = createElement('noscript');
        text3 = createText("\n        ");
        li1 = createElement("li");
        i1 = createElement("i");
        text4 = createText("  ");
        raw3_before = createElement('noscript');
        text5 = createText("\n        ");
        li2 = createElement("li");
        i2 = createElement("i");
        text6 = createText("  ");
        raw4_before = createElement('noscript');
        text7 = createText("\n\n    ");
        fieldset = createElement("fieldset");
        div1 = createElement("div");
        label = createElement("label");
        text8 = createText("\n\n            ");
        div0 = createElement("div");
        input = createElement("input");
        text9 = createText("\n       ");
        div2 = createElement("div");
        button0 = createElement("button");
        i3 = createElement("i");
        text10 = createText("  \n                ");
        raw6_before = createElement('noscript');
        text11 = createText("\n\n            ");
        button1 = createElement("button");
        i4 = createElement("i");
        text12 = createText("  \n                ");
        raw7_before = createElement('noscript');
        text13 = createText("\n\n            ");
        if (if_block) if_block.c();
        addLoc(h2, file, 1, 4, 47);
        addLoc(p, file, 3, 4, 96);
        i0.className = "fa fa-check";
        addLoc(i0, file, 6, 12, 260);
        addLoc(li0, file, 6, 8, 256);
        i1.className = "fa fa-check";
        addLoc(i1, file, 7, 12, 347);
        addLoc(li1, file, 7, 8, 343);
        i2.className = "fa fa-check";
        addLoc(i2, file, 8, 12, 434);
        addLoc(li2, file, 8, 8, 430);
        ul.className = "bullet-list";
        setStyle(ul, "list-style", "none");
        setStyle(ul, "margin-left", "0px");
        setStyle(ul, "font-weight", "lighter");
        setStyle(ul, "margin-top", "20px");
        addLoc(ul, file, 5, 4, 142);
        label.className = "control-label";
        setStyle(label, "width", "160px");
        label.htmlFor = "email";
        addLoc(label, file, 13, 12, 607);
        addListener(input, "input", input_input_handler);
        setAttribute(input, "type", "text");
        input.className = "input-xlarge";
        input.placeholder = __('publish / guest / example-email');
        addLoc(input, file, 18, 16, 825);
        div0.className = "controls";
        setStyle(div0, "margin-left", "180px");
        addLoc(div0, file, 17, 12, 759);
        div1.className = "control-group";
        setStyle(div1, "margin-top", "10px");
        addLoc(div1, file, 12, 8, 543);
        i3.className = "fa fa-chevron-left";
        addLoc(i3, file, 22, 62, 1072);
        button0.className = "btn btn-save btn-default btn-back";
        addLoc(button0, file, 22, 12, 1022);
        i4.className = i4_class_value = "fa " + (ctx.signedUp ? 'fa-circle-o-notch fa-spin' : 'fa-envelope');
        addLoc(i4, file, 27, 16, 1312);
        addListener(button1, "click", click_handler);
        button1.className = "btn btn-save btn-primary";
        setStyle(button1, "float", "right");
        addLoc(button1, file, 26, 12, 1202);
        setStyle(div2, "margin-top", "30px");
        addLoc(div2, file, 21, 7, 980);
        addLoc(fieldset, file, 11, 4, 524);
        div3.className = "form-horizontal publish-form";
        addLoc(div3, file, 0, 0, 0);
      },
      m: function mount(target, anchor) {
        insert(target, div3, anchor);
        append(div3, h2);
        h2.innerHTML = raw0_value;
        append(div3, text0);
        append(div3, p);
        p.innerHTML = raw1_value;
        append(div3, text1);
        append(div3, ul);
        append(ul, li0);
        append(li0, i0);
        append(li0, text2);
        append(li0, raw2_before);
        raw2_before.insertAdjacentHTML("afterend", raw2_value);
        append(ul, text3);
        append(ul, li1);
        append(li1, i1);
        append(li1, text4);
        append(li1, raw3_before);
        raw3_before.insertAdjacentHTML("afterend", raw3_value);
        append(ul, text5);
        append(ul, li2);
        append(li2, i2);
        append(li2, text6);
        append(li2, raw4_before);
        raw4_before.insertAdjacentHTML("afterend", raw4_value);
        append(div3, text7);
        append(div3, fieldset);
        append(fieldset, div1);
        append(div1, label);
        label.innerHTML = raw5_value;
        append(div1, text8);
        append(div1, div0);
        append(div0, input);
        input.value = ctx.email;
        append(fieldset, text9);
        append(fieldset, div2);
        append(div2, button0);
        append(button0, i3);
        append(button0, text10);
        append(button0, raw6_before);
        raw6_before.insertAdjacentHTML("afterend", raw6_value);
        append(div2, text11);
        append(div2, button1);
        append(button1, i4);
        append(button1, text12);
        append(button1, raw7_before);
        raw7_before.insertAdjacentHTML("afterend", raw7_value);
        append(div2, text13);
        if (if_block) if_block.m(div2, null);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
        if (!input_updating && changed.email) input.value = ctx.email;

        if (changed.signedUp && i4_class_value !== (i4_class_value = "fa " + (ctx.signedUp ? 'fa-circle-o-notch fa-spin' : 'fa-envelope'))) {
          i4.className = i4_class_value;
        }

        if (ctx.error) {
          if (if_block) {
            if_block.p(changed, ctx);
          } else {
            if_block = create_if_block(component, ctx);
            if_block.c();
            if_block.m(div2, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(div3);
        }

        removeListener(input, "input", input_input_handler);
        removeListener(button1, "click", click_handler);
        if (if_block) if_block.d();
      }
    };
  } // (32:12) {#if error}


  function create_if_block(component, ctx) {
    var div, text;
    return {
      c: function create() {
        div = createElement("div");
        text = createText(ctx.error);
        div.className = "alert alert-warning";
        addLoc(div, file, 32, 16, 1509);
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
    this._state = assign(data(), options.data);
    if (!('email' in this._state)) console.warn("<Guest> was created without expected data property 'email'");
    if (!('signedUp' in this._state)) console.warn("<Guest> was created without expected data property 'signedUp'");
    if (!('error' in this._state)) console.warn("<Guest> was created without expected data property 'error'");
    this._intro = true;
    this._fragment = create_main_fragment(this, this._state);

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);
    }
  }

  assign(Guest.prototype, protoDev);
  assign(Guest.prototype, methods);

  Guest.prototype._checkReadOnly = function _checkReadOnly(newState) {};

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
    App: Guest,
    store: store
  };

  return main;

}));
//# sourceMappingURL=guest.js.map
