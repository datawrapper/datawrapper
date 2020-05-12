(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('cm/lib/codemirror'), require('cm/mode/javascript/javascript'), require('cm/addon/mode/simple'), require('cm/addon/hint/show-hint'), require('cm/addon/edit/matchbrackets'), require('cm/addon/display/placeholder'), require('Handsontable')) :
  typeof define === 'function' && define.amd ? define('svelte/describe', ['cm/lib/codemirror', 'cm/mode/javascript/javascript', 'cm/addon/mode/simple', 'cm/addon/hint/show-hint', 'cm/addon/edit/matchbrackets', 'cm/addon/display/placeholder', 'Handsontable'], factory) :
  (global = global || self, global.describe = factory(global.CodeMirror, null, null, null, null, null, global.HOT));
}(this, function (CodeMirror, javascript, simple, showHint, matchbrackets, placeholder, HOT) { 'use strict';

  CodeMirror = CodeMirror && CodeMirror.hasOwnProperty('default') ? CodeMirror['default'] : CodeMirror;
  HOT = HOT && HOT.hasOwnProperty('default') ? HOT['default'] : HOT;

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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

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

  function run(fn) {
    fn();
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

  function reinsertAfter(before, target) {
    while (before.nextSibling) {
      target.appendChild(before.nextSibling);
    }
  }

  function reinsertBefore(after, target) {
    var parent = after.parentNode;

    while (parent.firstChild !== after) {
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

  function createSvgElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
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

  function toggleClass(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
  }

  function linear(t) {
    return t;
  }

  function generateRule(_ref, ease, fn) {
    var a = _ref.a,
        b = _ref.b,
        delta = _ref.delta,
        duration = _ref.duration;
    var step = 16.666 / duration;
    var keyframes = '{\n';

    for (var p = 0; p <= 1; p += step) {
      var t = a + delta * ease(p);
      keyframes += p * 100 + "%{".concat(fn(t, 1 - t), "}\n");
    }

    return keyframes + "100% {".concat(fn(b, 1 - b), "}\n}");
  } // https://github.com/darkskyapp/string-hash/blob/master/index.js


  function hash(str) {
    var hash = 5381;
    var i = str.length;

    while (i--) {
      hash = (hash << 5) - hash ^ str.charCodeAt(i);
    }

    return hash >>> 0;
  }

  function wrapTransition(component, node, fn, params, intro) {
    var obj = fn.call(component, node, params);
    var duration;
    var ease;
    var cssText;
    var initialised = false;
    return {
      t: intro ? 0 : 1,
      running: false,
      program: null,
      pending: null,
      run: function run(b, callback) {
        var _this = this;

        if (typeof obj === 'function') {
          transitionManager.wait().then(function () {
            obj = obj();

            _this._run(b, callback);
          });
        } else {
          this._run(b, callback);
        }
      },
      _run: function _run(b, callback) {
        duration = obj.duration || 300;
        ease = obj.easing || linear;
        var program = {
          start: window.performance.now() + (obj.delay || 0),
          b: b,
          callback: callback || noop
        };

        if (intro && !initialised) {
          if (obj.css && obj.delay) {
            cssText = node.style.cssText;
            node.style.cssText += obj.css(0, 1);
          }

          if (obj.tick) obj.tick(0, 1);
          initialised = true;
        }

        if (!b) {
          program.group = outros.current;
          outros.current.remaining += 1;
        }

        if (obj.delay) {
          this.pending = program;
        } else {
          this.start(program);
        }

        if (!this.running) {
          this.running = true;
          transitionManager.add(this);
        }
      },
      start: function start(program) {
        component.fire("".concat(program.b ? 'intro' : 'outro', ".start"), {
          node: node
        });
        program.a = this.t;
        program.delta = program.b - program.a;
        program.duration = duration * Math.abs(program.b - program.a);
        program.end = program.start + program.duration;

        if (obj.css) {
          if (obj.delay) node.style.cssText = cssText;
          var rule = generateRule(program, ease, obj.css);
          transitionManager.addRule(rule, program.name = '__svelte_' + hash(rule));
          node.style.animation = (node.style.animation || '').split(', ').filter(function (anim) {
            return anim && (program.delta < 0 || !/__svelte/.test(anim));
          }).concat("".concat(program.name, " ").concat(program.duration, "ms linear 1 forwards")).join(', ');
        }

        this.program = program;
        this.pending = null;
      },
      update: function update(now) {
        var program = this.program;
        if (!program) return;
        var p = now - program.start;
        this.t = program.a + program.delta * ease(p / program.duration);
        if (obj.tick) obj.tick(this.t, 1 - this.t);
      },
      done: function done() {
        var program = this.program;
        this.t = program.b;
        if (obj.tick) obj.tick(this.t, 1 - this.t);
        component.fire("".concat(program.b ? 'intro' : 'outro', ".end"), {
          node: node
        });

        if (!program.b && !program.invalidated) {
          program.group.callbacks.push(function () {
            program.callback();
            if (obj.css) transitionManager.deleteRule(node, program.name);
          });

          if (--program.group.remaining === 0) {
            program.group.callbacks.forEach(run);
          }
        } else {
          if (obj.css) transitionManager.deleteRule(node, program.name);
        }

        this.running = !!this.pending;
      },
      abort: function abort(reset) {
        if (this.program) {
          if (reset && obj.tick) obj.tick(1, 0);
          if (obj.css) transitionManager.deleteRule(node, this.program.name);
          this.program = this.pending = null;
          this.running = false;
        }
      },
      invalidate: function invalidate() {
        if (this.program) {
          this.program.invalidated = true;
        }
      }
    };
  }

  var outros = {};

  function groupOutros() {
    outros.current = {
      remaining: 0,
      callbacks: []
    };
  }

  var transitionManager = {
    running: false,
    transitions: [],
    bound: null,
    stylesheet: null,
    activeRules: {},
    promise: null,
    add: function add(transition) {
      this.transitions.push(transition);

      if (!this.running) {
        this.running = true;
        requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
      }
    },
    addRule: function addRule(rule, name) {
      if (!this.stylesheet) {
        var style = createElement('style');
        document.head.appendChild(style);
        transitionManager.stylesheet = style.sheet;
      }

      if (!this.activeRules[name]) {
        this.activeRules[name] = true;
        this.stylesheet.insertRule("@keyframes ".concat(name, " ").concat(rule), this.stylesheet.cssRules.length);
      }
    },
    next: function next() {
      this.running = false;
      var now = window.performance.now();
      var i = this.transitions.length;

      while (i--) {
        var transition = this.transitions[i];

        if (transition.program && now >= transition.program.end) {
          transition.done();
        }

        if (transition.pending && now >= transition.pending.start) {
          transition.start(transition.pending);
        }

        if (transition.running) {
          transition.update(now);
          this.running = true;
        } else if (!transition.pending) {
          this.transitions.splice(i, 1);
        }
      }

      if (this.running) {
        requestAnimationFrame(this.bound);
      } else if (this.stylesheet) {
        var _i = this.stylesheet.cssRules.length;

        while (_i--) {
          this.stylesheet.deleteRule(_i);
        }

        this.activeRules = {};
      }
    },
    deleteRule: function deleteRule(node, name) {
      node.style.animation = node.style.animation.split(', ').filter(function (anim) {
        return anim && anim.indexOf(name) === -1;
      }).join(', ');
    },
    wait: function wait() {
      if (!transitionManager.promise) {
        transitionManager.promise = Promise.resolve();
        transitionManager.promise.then(function () {
          transitionManager.promise = null;
        });
      }

      return transitionManager.promise;
    }
  };

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

  // `_isObject` : an object's function
  // -----------------------------------

  // Is a given variable an object?
  function _isObject (obj) {
  	var type = typeof obj;
  	return type === 'function' || type === 'object' && !!obj;
  }

  // quick reference variables for speed access
  //-------------------------------------------

  // Save bytes in the minified (but not gzipped) version:
  const ArrayProto = Array.prototype;
  const ObjProto = Object.prototype;
  const slice = ArrayProto.slice;
  const toString = ObjProto.toString;
  const hasOwnProperty = ObjProto.hasOwnProperty;
  const nativeKeys = Object.keys;

  // `_has` : an object's function

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  function _has (obj, key) {
  	return obj != null && hasOwnProperty.call(obj, key);
  }

  // `_keys` : an object's function

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  function _keys (obj) {
  	if (!_isObject(obj)) return [];
  	if (nativeKeys) return nativeKeys(obj);
  	let keys = [];
  	for (let key in obj)
  		if (_has(obj, key)) keys.push(key);
  		// Ahem, IE < 9.
  	if (hasEnumBug) collectNonEnumProps(obj, keys);
  	return keys;
  }

  // `_forEach` : a collection's function

  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  function _each (obj, iteratee, context) {
  	iteratee = optimizeCb(iteratee, context);
  	let i, length;
  	if (isArrayLike(obj)) {
  		for (i = 0, length = obj.length; i < length; i++) {
  			iteratee(obj[i], i, obj);
  		}
  	} else {
  		var keys = _keys(obj);
  		for (i = 0, length = keys.length; i < length; i++) {
  			iteratee(obj[keys[i]], keys[i], obj);
  		}
  	}
  	return obj;
  }

  // `_findIndex` : an array's function

  // Returns the first index on an array-like that passes a predicate test.
  var _findIndex = createPredicateIndexFinder(1);

  // `_sortedIndex` : an array's function

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  function _sortedIndex (array, obj, iteratee, context) {
  	iteratee = cb(iteratee, context, 1);
  	let value = iteratee(obj);
  	let low = 0,
  		high = getLength(array);
  	while (low < high) {
  		let mid = Math.floor((low + high) / 2);
  		if (iteratee(array[mid]) < value) low = mid + 1;
  		else high = mid;
  	}
  	return low;
  }

  // `_indexOf` : an array's function

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  var _indexOf = createIndexFinder(1, _findIndex, _sortedIndex);

  // `_values` : an object's function

  // Retrieve the values of an object's properties.
  function _values (obj) {
  	let keys = _keys(obj);
  	let length = keys.length;
  	let values = Array(length);
  	for (let i = 0; i < length; i++) {
  		values[i] = obj[keys[i]];
  	}
  	return values;
  }

  // `_include` : a collection's function

  // Determine if the array or object contains a given item (using `===`).
  function _contains (obj, item, fromIndex, guard) {
  	if (!isArrayLike(obj)) obj = _values(obj);
  	if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  	return _indexOf(obj, item, fromIndex) >= 0;
  }

  // `_isFunction` : an object's function

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  function customFunction() {
  	if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof document !== 'undefined' && typeof document.childNodes != 'function') {
  		return (obj) => typeof obj == 'function' || false;
  	}
  	return null;
  }

  // Is a given value a function?
  var _isFunction = customFunction() || function (obj) {
  	return toString.call(obj) === '[object Function]';
  };

  // `_isArguments` : an object's function

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  function customArguments () {
  	if (toString.call(arguments) === '[object Arguments]') return null;
  	return (obj) => _has(obj, 'callee');
  }

  // Is a given value an arguments object?
  var _isArguments = customArguments() || function (obj) {
  	return toString.call(obj) === '[object Arguments]';
  };

  // `_isNumber` : an object's function

  // Is a given value a number?
  function _isNumber (obj) {
  	return toString.call(obj) === '[object Number]';
  }

  // `_isNaN` : an object's function

  // Is the given value `NaN`?
  function _isNaN (obj) {
  	return _isNumber(obj) && isNaN(obj);
  }

  // `_invert` : an object's function

  // Invert the keys and values of an object. The values must be serializable.
  function _invert (obj) {
  	let result = {};
  	let keys = _keys(obj);
  	for (let i = 0, length = keys.length; i < length; i++) {
  		result[obj[keys[i]]] = keys[i];
  	}
  	return result;
  }

  // `_iteratee` : an utility's function

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  var _iteratee = builtinIteratee;

  // `_identity` : an utility's function
  // ------------------------------------

  // Keep the identity function around for default iteratees.
  function _identity (value) {
  	return value;
  }

  // `_extendOwn` : an object's function

  // Extend a given object with the properties in passed-in object(s).
  var _extendOwn = createAssigner(_keys);

  // `_isMatch` : an object's function

  // Returns whether an object has a given set of `key:value` pairs.
  function _isMatch (object, attrs) {
  	let keys = _keys(attrs),
  		length = keys.length;
  	if (object == null) return !length;
  	let obj = Object(object);
  	for (let i = 0; i < length; i++) {
  		let key = keys[i];
  		if (attrs[key] !== obj[key] || !(key in obj)) return false;
  	}
  	return true;
  }

  // `_matches` : an utility's function

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  function _matcher (attrs) {
  	attrs = _extendOwn({}, attrs);
  	return (obj) => _isMatch(obj, attrs);
  }

  // Internal functions


  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  function optimizeCb (func, context, argCount) {
  	if (context === void 0) return func;
  	switch (argCount == null ? 3 : argCount) {
  		case 1: return (value) => func.call(context, value);
  			// The 2-parameter case has been omitted only because no current consumers
  			// made use of it.
  		case 3: return (value, index, collection) =>  func.call(context, value, index, collection);
  		case 4: return (accumulator, value, index, collection) => func.call(context, accumulator, value, index, collection);
  	}
  	return function () {
  		return func.apply(context, arguments);
  	};
  }

  // for callback generator.
  // This abstraction is use to hide the internal-only argCount argument.
  function builtinIteratee (value, context) {
  	return cb(value, context, Infinity);
  }

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  function cb (value, context, argCount) {
  	if (_iteratee !== builtinIteratee) return _iteratee(value, context);
  	if (value == null) return _identity;
  	if (_isFunction(value)) return optimizeCb(value, context, argCount);
  	if (_isObject(value)) return _matcher(value);
  	return property(value);
  }

  // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
  // This accumulates the arguments passed into an array, after a given index.
  function restArgs (func, startIndex) {
  	startIndex = startIndex == null ? func.length - 1 : +startIndex;
  	return function () {
  		let length = Math.max(arguments.length - startIndex, 0),
  			rest = Array(length),
  			index = 0;
  		for (; index < length; index++) {
  			rest[index] = arguments[index + startIndex];
  		}
  		switch (startIndex) {
  			case 0:
  				return func.call(this, rest);
  			case 1:
  				return func.call(this, arguments[0], rest);
  			case 2:
  				return func.call(this, arguments[0], arguments[1], rest);
  		}
  		var args = Array(startIndex + 1);
  		for (index = 0; index < startIndex; index++) {
  			args[index] = arguments[index];
  		}
  		args[startIndex] = rest;
  		return func.apply(this, args);
  	};
  }

  // An internal function used for get key's value from an object.
  function property (key) {
  	return (obj) => obj == null ? void 0 : obj[key];
  }

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) { // @TODO simplify to function
  	let length = getLength(collection);
  	return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // An internal function used for aggregate "group by" operations.
  function group (behavior, partition) {
  	return function (obj, iteratee, context) {
  		let result = partition ? [[], []] : {};
  		iteratee = cb(iteratee, context);
  		_each(obj, (value, index) => {
  			let key = iteratee(value, index, obj);
  			behavior(result, value, key);
  		});
  		return result;
  	};
  }

  // Generator function to create the findIndex and findLastIndex functions.
  function createPredicateIndexFinder (dir) {
  	return function (array, predicate, context) {
  		predicate = cb(predicate, context);
  		let length = getLength(array);
  		let index = dir > 0 ? 0 : length - 1;
  		for (; index >= 0 && index < length; index += dir) {
  			if (predicate(array[index], index, array)) return index;
  		}
  		return -1;
  	};
  }

  // Generator function to create the indexOf and lastIndexOf functions.
  function createIndexFinder (dir, predicateFind, sortedIndex) {
  	return function (array, item, idx) {
  		let i = 0,
  			length = getLength(array);
  		if (typeof idx == 'number') {
  			if (dir > 0) {
  				i = idx >= 0 ? idx : Math.max(idx + length, i);
  			} else {
  				length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
  			}
  		} else if (sortedIndex && idx && length) {
  			idx = sortedIndex(array, item);
  			return array[idx] === item ? idx : -1;
  		}
  		if (item !== item) {
  			idx = predicateFind(slice.call(array, i, length), _isNaN);
  			return idx >= 0 ? idx + i : -1;
  		}
  		for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
  			if (array[idx] === item) return idx;
  		}
  		return -1;
  	};
  }

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  // @TODO move to _quickaccess to prevent inappropriate cyclic dependency with `keys` and `allkeys`
  // @FUTURE remove this hack when the will ignore IE<9 since the goal is now ES6 and beyond.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                        'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
  // hack for enumerating bug
  function collectNonEnumProps (obj, keys) {
  	let nonEnumIdx = nonEnumerableProps.length;
  	let constructor = obj.constructor;
  	let proto = _isFunction(constructor) && constructor.prototype || ObjProto;

  	// Constructor is a special case.
  	let prop = 'constructor';
  	if (_has(obj, prop) && !_contains(keys, prop)) keys.push(prop);

  	while (nonEnumIdx--) {
  		prop = nonEnumerableProps[nonEnumIdx];
  		if (prop in obj && obj[prop] !== proto[prop] && !_contains(keys, prop)) {
  			keys.push(prop);
  		}
  	}
  }

  // An internal function for creating assigner functions.
  function createAssigner (keysFunc, defaults) {
  	return function (obj) {
  		let length = arguments.length;
  		if (defaults) obj = Object(obj);
  		if (length < 2 || obj == null) return obj;
  		for (let index = 1; index < length; index++) {
  			let source = arguments[index],
  				keys = keysFunc(source),
  				l = keys.length;
  			for (let i = 0; i < l; i++) {
  				let key = keys[i];
  				if (_isObject(obj) && (!defaults || obj[key] === void 0)) obj[key] = source[key];
  			}
  		}
  		return obj;
  	};
  }

  // List of HTML entities for escaping.
  var escapeMap = {
  	'&': '&amp;',
  	'<': '&lt;',
  	'>': '&gt;',
  	'"': '&quot;',
  	"'": '&#x27;',
  	'`': '&#x60;'
  };
  var unescapeMap = _invert(escapeMap);

  // `_delay` : (ahem) a function's function

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  var _delay = restArgs( (func, wait, args) => {
    return setTimeout( () => {
      return func.apply(null, args);
    }, wait);
  });

  // `_debounce` : (ahem) a function's function

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function _debounce (func, wait, immediate) {
    let timeout, result;

    let later = function (context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    let debounced = restArgs(function (args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function () {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  }

  // `_isBoolean` : an object's function

  // Is a given value a boolean?
  function _isBoolean (obj) {
  	return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  }

  // `_unique` : an array's function

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  function _unique (array, isSorted, iteratee, context) {
  	if (!_isBoolean(isSorted)) {
  		context = iteratee;
  		iteratee = isSorted;
  		isSorted = false;
  	}
  	if (iteratee != null) iteratee = cb(iteratee, context);
  	let result = [];
  	let seen = [];
  	for (let i = 0, length = getLength(array); i < length; i++) {
  		let value = array[i],
  			computed = iteratee ? iteratee(value, i, array) : value;
  		if (isSorted) {
  			if (!i || seen !== computed) result.push(value);
  			seen = computed;
  		} else if (iteratee) {
  			if (!_contains(seen, computed)) {
  				seen.push(computed);
  				result.push(value);
  			}
  		} else if (!_contains(result, value)) {
  			result.push(value);
  		}
  	}
  	return result;
  }

  /**
   * Clones an object
   *
   * @exports clone
   * @kind function
   *
   * @param {*} object - the thing that should be cloned
   * @returns {*} - the cloned thing
   */
  function clone(o) {
    if (!o || _typeof(o) !== 'object') return o;

    try {
      return JSON.parse(JSON.stringify(o));
    } catch (e) {
      return o;
    }
  }

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
   * converts a column name to a variable name that can be used in the custom
   * column editor. variable names can't contain spaces and special characters
   * and are also converted to lowercase.
   *
   * @exports columnNameToVariable
   * @kind function
   *
   * @example
   * import columnNameToVariable from '@datawrapper/shared/columnNameToVariable';
   *
   * columnNameToVariable('GDP (per cap.)') // gdp_per_cap
   *
   * @param {string} name -- name of the column
   * @returns {string} -- variable name
   */
  function columnNameToVariable(name) {
    return name.toString().toLowerCase().replace(/\s+/g, '_') // Replace spaces with _
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/-/g, '_') // Replace multiple - with single -
    .replace(/__+/g, '_') // Replace multiple - with single -
    .replace(/^_+/, '') // Trim - from start of text
    .replace(/_+$/, '') // Trim - from end of text
    .replace(/^(\d)/, '_$1') // If first char is a number, prefix with _
    .replace(/^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/, '$1_'); // avoid reserved keywords
  }

  var functions = 'NOT|and|or|in|ABS|ACOS|ACOSH|ASIN|ASINH|ATAN|ATANH|CBRT|CEIL|COS|COSH|EXP|EXPM1|FLOOR|LENGTH|LN|LOG|LOG10|LOG2|LOG1P|NOT|ROUND|SIGN|SIN|SINH|SQRT|TAN|TANH|TRUNC|RANDOM|MIN|MAX|POW|ATAN2|ROUNDTO|IF|CONCAT|TRIM|SUBSTR|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|SPLIT|JOIN|INDEXOF|ISNULL|REPLACE'.split('|');

  function title(_ref) {
    var column = _ref.column;

    var s = __('describe / edit-column');

    return s.replace('%s', "\"".concat(column ? column.title() || column.name() : '--', "\""));
  }

  function metaColumns(_ref2) {
    var columns = _ref2.columns;
    if (!columns) return [];
    return columns.map(function (col) {
      return {
        key: columnNameToVariable(col.name()),
        title: col.title(),
        type: col.type()
      };
    });
  }

  function keywords(_ref3) {
    var metaColumns = _ref3.metaColumns;
    var keywords = ['sum', 'round', 'min', 'max', 'median', 'mean'];
    metaColumns.forEach(function (col) {
      keywords.push(col.key);

      if (col.type === 'number') {
        keywords.push(col.key + '__sum');
        keywords.push(col.key + '__min');
        keywords.push(col.key + '__max');
        keywords.push(col.key + '__mean');
        keywords.push(col.key + '__median');
      }
    });
    return keywords;
  }

  function data() {
    return {
      name: '',
      formula: '',
      parserErrors: []
    };
  }
  var methods = {
    insert: function insert(column) {
      var _this$get = this.get(),
          cm = _this$get.cm;

      cm.replaceSelection(column.key);
      cm.focus();
    },
    removeColumn: function removeColumn() {
      var _this$get2 = this.get(),
          column = _this$get2.column;

      var _this$store$get = this.store.get(),
          dw_chart = _this$store$get.dw_chart;

      var ds = dw_chart.dataset();
      var customCols = clone(dw_chart.get('metadata.describe.computed-columns', {}));
      delete customCols[column.name()];
      var colIndex = ds.columnOrder()[ds.indexOf(column.name())]; // delete all changes that have been made to this column

      var changes = dw_chart.get('metadata.data.changes', []);
      var newChanges = [];
      changes.forEach(function (c) {
        if (c.column === colIndex) return; // skip

        if (c.column > colIndex) c.column--;
        newChanges.push(c);
      });
      dw_chart.set('metadata.describe.computed-columns', customCols);
      dw_chart.set('metadata.data.changes', newChanges);
      dw_chart.saveSoon();
      this.fire('updateTable');
      this.fire('unselect');
    }
  };

  function oncreate() {
    var _this = this;

    var app = this;

    var _this$get3 = this.get(),
        column = _this$get3.column;

    var _this$store$get2 = this.store.get(),
        dw_chart = _this$store$get2.dw_chart;

    var customCols = dw_chart.get('metadata.describe.computed-columns', {});
    this.set({
      formula: customCols[column.name()] || '',
      name: column.title(),
      parserErrors: _unique(dw_chart.__parserErrors)
    });

    function scriptHint(editor) {
      // Find the token at the cursor
      var cur = editor.getCursor();
      var token = editor.getTokenAt(cur);
      var match = [];
      var keywords = app.get('keywords');

      if (token.type === 'variable') {
        match = keywords.filter(function (chk) {
          return chk.toLowerCase().indexOf(token.string.toLowerCase()) === 0;
        });
      }

      if (token.type === 'keyword-x') {
        match = functions.filter(function (chk) {
          return chk.toLowerCase().indexOf(token.string.toLowerCase()) === 0;
        });
      }

      return {
        list: match,
        from: CodeMirror.Pos(cur.line, token.start),
        to: CodeMirror.Pos(cur.line, token.end)
      };
    } // CodeMirror.registerHelper("hint", "javascript", function(editor, options) {
    //     return scriptHint(editor, options);
    // });


    console.log(customCols[column.name()] || '');
    console.log(this.get().formula);
    var cm = CodeMirror.fromTextArea(this.refs.code, {
      value: this.get().formula || '',
      mode: 'simple',
      indentUnit: 2,
      tabSize: 2,
      lineWrapping: true,
      matchBrackets: true,
      placeholder: '',
      continueComments: 'Enter',
      extraKeys: {
        Tab: 'autocomplete'
      },
      hintOptions: {
        hint: scriptHint
      }
    });
    window.CodeMirror = CodeMirror;
    this.set({
      cm: cm
    });

    var updateTable = _debounce(function () {
      return _this.fire('updateTable');
    }, 1500);

    cmInit(this.get().keywords);
    setFormula(this.get().formula);
    this.on('state', function (_ref4) {
      var changed = _ref4.changed,
          current = _ref4.current;

      // update if column changes
      if (changed.column) {
        console.log('change col', current.column);
        var col = current.column;

        if (col) {
          var _customCols = dw_chart.get('metadata.describe.computed-columns', {});

          console.log('change col 2', _customCols[col.name()]);

          _this.set({
            formula: _customCols[col.name()] || '',
            name: col.title()
          });
        }
      }

      if (changed.formula) {
        console.log('change formula', current.formula);
        setFormula(current.formula);
      }

      if (changed.name) {
        var name = current.name;

        var _this$get4 = _this.get(),
            _column = _this$get4.column;

        var changes = clone(dw_chart.get('metadata.data.changes', []));
        var ds = dw_chart.dataset();
        var _col = ds.columnOrder()[ds.indexOf(_column.name())];
        var lastColNameChangeIndex = -1;
        changes.forEach(function (change, i) {
          if (change.column === _col && change.row === 0) {
            lastColNameChangeIndex = i;
          }
        });

        if (lastColNameChangeIndex > -1) {
          // update last change of that cell
          changes[lastColNameChangeIndex].value = name;
          changes[lastColNameChangeIndex].time = new Date().getTime();
        } else {
          // add new change
          changes.push({
            column: _col,
            row: 0,
            value: name,
            time: new Date().getTime()
          });
        }

        dw_chart.set('metadata.data.changes', changes);
        if (dw_chart.saveSoon) dw_chart.saveSoon();
        updateTable();
      }

      if (changed.metaColumns) {
        console.log('changed metaColumns');
        cmInit(current.keywords);
      }
    });

    function setFormula(formula) {
      // update codemirror
      if (formula !== cm.getValue()) {
        cm.setValue(formula);
      } // update dw.chart


      var _app$get = app.get(),
          column = _app$get.column;

      var customCols = clone(dw_chart.get('metadata.describe.computed-columns', {}));

      if (customCols[column.name()] !== formula) {
        customCols[column.name()] = formula;
        dw_chart.set('metadata.describe.computed-columns', _objectSpread2({}, customCols));
        if (dw_chart.saveSoon) dw_chart.saveSoon();
        updateTable();
        setTimeout(function () {
          app.set({
            parserErrors: _unique(dw_chart.__parserErrors) || []
          });
        });
      }
    }

    function cmInit(keywords) {
      console.log('cmInit');
      var columnsRegex = new RegExp("(?:".concat(keywords.join('|'), ")"));
      var functionRegex = new RegExp("(?:".concat(functions.join('|'), ")"));
      CodeMirror.defineSimpleMode('simplemode', {
        // The start state contains the rules that are intially used
        start: [// The regex matches the token, the token property contains the type
        {
          regex: /"(?:[^\\]|\\.)*?(?:"|$)/,
          token: 'string'
        }, {
          regex: /'(?:[^\\]|\\.)*?(?:'|$)/,
          token: 'string'
        }, // You can match multiple tokens at once. Note that the captured
        // groups must span the whole string in this case
        // {
        //     regex: /(function)(\s+)([a-z$][\w$]*)/,
        //     token: ['keyword', null, 'keyword']
        // },
        // Rules are matched in the order in which they appear, so there is
        // no ambiguity between this one and the one above
        {
          regex: functionRegex,
          token: 'keyword'
        }, {
          regex: /true|false|PI|E/,
          token: 'atom'
        }, {
          regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
          token: 'number'
        }, // { regex: /\/\/.*/, token: 'comment' },
        {
          regex: /\/(?:[^\\]|\\.)*?\//,
          token: 'variable-3'
        }, // A next property will cause the mode to move to a different state
        // { regex: /\/\*/, token: 'comment', next: 'comment' },
        {
          regex: /[-+/*=<>!^]+/,
          token: 'operator'
        }, // indent and dedent properties guide autoindentation
        {
          regex: /[[(]/,
          indent: true
        }, {
          regex: /[\])]/,
          dedent: true
        }, {
          regex: columnsRegex,
          token: 'variable-2'
        }, {
          regex: /[a-z$][\w$]*/,
          token: 'variable'
        }, {
          regex: /[A-Z_][\w$]*/,
          token: 'keyword-x'
        }],
        // The meta property contains global information about the mode. It
        // can contain properties like lineComment, which are supported by
        // all modes, and also directives like dontIndentStates, which are
        // specific to simple modes.
        meta: {}
      });
      cm.setOption('mode', 'simplemode');
    }

    cm.on('change', function (cm) {
      app.set({
        formula: cm.getValue()
      });
    });
  }
  var file = "describe/ComputedColumnEditor.html";

  function click_handler(event) {
    var _this$_svelte = this._svelte,
        component = _this$_svelte.component,
        ctx = _this$_svelte.ctx;
    component.insert(ctx.col);
  }

  function get_each_context_1(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.col = list[i];
    return child_ctx;
  }

  function get_each_context(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.err = list[i];
    return child_ctx;
  }

  function create_main_fragment(component, ctx) {
    var div,
        h3,
        text0,
        text1,
        p0,
        text2_value = __('computed columns / modal / intro'),
        text2,
        text3,
        label0,
        text4_value = __('computed columns / modal / name'),
        text4,
        text5,
        input,
        input_updating = false,
        text6,
        label1,
        text7_value = __('computed columns / modal / formula'),
        text7,
        text8,
        textarea,
        text9,
        text10,
        p1,
        text11_value = __('computed columns / modal / available columns'),
        text11,
        text12,
        text13,
        ul,
        text14,
        button,
        i,
        text15,
        text16_value = __('computed columns / modal / remove'),
        text16;

    function input_input_handler() {
      input_updating = true;
      component.set({
        name: input.value
      });
      input_updating = false;
    }

    var if_block = ctx.parserErrors.length && create_if_block(component, ctx);
    var each_value_1 = ctx.metaColumns;
    var each_blocks = [];

    for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
      each_blocks[i_1] = create_each_block(component, get_each_context_1(ctx, each_value_1, i_1));
    }

    function click_handler_1(event) {
      component.removeColumn();
    }

    return {
      c: function create() {
        div = createElement("div");
        h3 = createElement("h3");
        text0 = createText(ctx.title);
        text1 = createText("\n    ");
        p0 = createElement("p");
        text2 = createText(text2_value);
        text3 = createText("\n\n    ");
        label0 = createElement("label");
        text4 = createText(text4_value);
        text5 = createText("\n    ");
        input = createElement("input");
        text6 = createText("\n\n    ");
        label1 = createElement("label");
        text7 = createText(text7_value);
        text8 = createText("\n    ");
        textarea = createElement("textarea");
        text9 = createText("\n    ");
        if (if_block) if_block.c();
        text10 = createText("\n\n    ");
        p1 = createElement("p");
        text11 = createText(text11_value);
        text12 = createText(":");
        text13 = createText("\n\n    ");
        ul = createElement("ul");

        for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
          each_blocks[i_1].c();
        }

        text14 = createText("\n\n");
        button = createElement("button");
        i = createElement("i");
        text15 = createText(" ");
        text16 = createText(text16_value);
        h3.className = "first";
        addLoc(h3, file, 1, 4, 38);
        addLoc(p0, file, 2, 4, 73);
        label0.className = "svelte-pre384";
        addLoc(label0, file, 4, 4, 126);
        addListener(input, "input", input_input_handler);
        setAttribute(input, "type", "text");
        addLoc(input, file, 5, 4, 185);
        label1.className = "svelte-pre384";
        addLoc(label1, file, 7, 4, 230);
        textarea.className = "code";
        addLoc(textarea, file, 8, 4, 292);
        setStyle(p1, "margin-top", "1em");
        addLoc(p1, file, 17, 4, 506);
        ul.className = "col-select svelte-pre384";
        addLoc(ul, file, 19, 4, 596);
        setStyle(div, "margin-bottom", "15px");
        addLoc(div, file, 0, 0, 0);
        i.className = "fa fa-trash";
        addLoc(i, file, 26, 57, 796);
        addListener(button, "click", click_handler_1);
        button.className = "btn btn-danger";
        addLoc(button, file, 26, 0, 739);
      },
      m: function mount(target, anchor) {
        insert(target, div, anchor);
        append(div, h3);
        append(h3, text0);
        append(div, text1);
        append(div, p0);
        append(p0, text2);
        append(div, text3);
        append(div, label0);
        append(label0, text4);
        append(div, text5);
        append(div, input);
        input.value = ctx.name;
        append(div, text6);
        append(div, label1);
        append(label1, text7);
        append(div, text8);
        append(div, textarea);
        component.refs.code = textarea;
        append(div, text9);
        if (if_block) if_block.m(div, null);
        append(div, text10);
        append(div, p1);
        append(p1, text11);
        append(p1, text12);
        append(div, text13);
        append(div, ul);

        for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
          each_blocks[i_1].m(ul, null);
        }

        insert(target, text14, anchor);
        insert(target, button, anchor);
        append(button, i);
        append(button, text15);
        append(button, text16);
      },
      p: function update(changed, ctx) {
        if (changed.title) {
          setData(text0, ctx.title);
        }

        if (!input_updating && changed.name) input.value = ctx.name;

        if (ctx.parserErrors.length) {
          if (if_block) {
            if_block.p(changed, ctx);
          } else {
            if_block = create_if_block(component, ctx);
            if_block.c();
            if_block.m(div, text10);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }

        if (changed.metaColumns) {
          each_value_1 = ctx.metaColumns;

          for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
            var child_ctx = get_each_context_1(ctx, each_value_1, i_1);

            if (each_blocks[i_1]) {
              each_blocks[i_1].p(changed, child_ctx);
            } else {
              each_blocks[i_1] = create_each_block(component, child_ctx);
              each_blocks[i_1].c();
              each_blocks[i_1].m(ul, null);
            }
          }

          for (; i_1 < each_blocks.length; i_1 += 1) {
            each_blocks[i_1].d(1);
          }

          each_blocks.length = each_value_1.length;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(div);
        }

        removeListener(input, "input", input_input_handler);
        if (component.refs.code === textarea) component.refs.code = null;
        if (if_block) if_block.d();
        destroyEach(each_blocks, detach);

        if (detach) {
          detachNode(text14);
          detachNode(button);
        }

        removeListener(button, "click", click_handler_1);
      }
    };
  } // (10:4) {#if parserErrors.length}


  function create_if_block(component, ctx) {
    var p;
    var each_value = ctx.parserErrors;
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block_1(component, get_each_context(ctx, each_value, i));
    }

    return {
      c: function create() {
        p = createElement("p");

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        p.className = "mini-help errors svelte-pre384";
        addLoc(p, file, 10, 4, 370);
      },
      m: function mount(target, anchor) {
        insert(target, p, anchor);

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(p, null);
        }
      },
      p: function update(changed, ctx) {
        if (changed.parserErrors) {
          each_value = ctx.parserErrors;

          for (var i = 0; i < each_value.length; i += 1) {
            var child_ctx = get_each_context(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(changed, child_ctx);
            } else {
              each_blocks[i] = create_each_block_1(component, child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(p, null);
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
          detachNode(p);
        }

        destroyEach(each_blocks, detach);
      }
    };
  } // (12:8) {#each parserErrors as err}


  function create_each_block_1(component, ctx) {
    var div,
        raw_value = ctx.err;
    return {
      c: function create() {
        div = createElement("div");
        addLoc(div, file, 12, 8, 443);
      },
      m: function mount(target, anchor) {
        insert(target, div, anchor);
        div.innerHTML = raw_value;
      },
      p: function update(changed, ctx) {
        if (changed.parserErrors && raw_value !== (raw_value = ctx.err)) {
          div.innerHTML = raw_value;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(div);
        }
      }
    };
  } // (21:8) {#each metaColumns as col}


  function create_each_block(component, ctx) {
    var li,
        text_value = ctx.col.key,
        text;
    return {
      c: function create() {
        li = createElement("li");
        text = createText(text_value);
        li._svelte = {
          component: component,
          ctx: ctx
        };
        addListener(li, "click", click_handler);
        li.className = "svelte-pre384";
        addLoc(li, file, 21, 8, 663);
      },
      m: function mount(target, anchor) {
        insert(target, li, anchor);
        append(li, text);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;

        if (changed.metaColumns && text_value !== (text_value = ctx.col.key)) {
          setData(text, text_value);
        }

        li._svelte.ctx = ctx;
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(li);
        }

        removeListener(li, "click", click_handler);
      }
    };
  }

  function ComputedColumnEditor(options) {
    var _this2 = this;

    this._debugName = '<ComputedColumnEditor>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this.refs = {};
    this._state = assign(data(), options.data);

    this._recompute({
      column: 1,
      columns: 1,
      metaColumns: 1
    }, this._state);

    if (!('column' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'column'");
    if (!('columns' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'columns'");
    if (!('name' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'name'");
    if (!('parserErrors' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'parserErrors'");
    this._intro = true;
    this._fragment = create_main_fragment(this, this._state);

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

  assign(ComputedColumnEditor.prototype, protoDev);
  assign(ComputedColumnEditor.prototype, methods);

  ComputedColumnEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
    if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'title'");
    if ('metaColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'metaColumns'");
    if ('keywords' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'keywords'");
  };

  ComputedColumnEditor.prototype._recompute = function _recompute(changed, state) {
    if (changed.column) {
      if (this._differs(state.title, state.title = title(state))) changed.title = true;
    }

    if (changed.columns) {
      if (this._differs(state.metaColumns, state.metaColumns = metaColumns(state))) changed.metaColumns = true;
    }

    if (changed.metaColumns) {
      if (this._differs(state.keywords, state.keywords = keywords(state))) changed.keywords = true;
    }
  };

  function cubicOut(t) {
    var f = t - 1.0;
    return f * f * f + 1.0
  }

  function slide(
  	node,
  	ref
  ) {
  	var delay = ref.delay; if ( delay === void 0 ) delay = 0;
  	var duration = ref.duration; if ( duration === void 0 ) duration = 400;
  	var easing = ref.easing; if ( easing === void 0 ) easing = cubicOut;

  	var style = getComputedStyle(node);
  	var opacity = +style.opacity;
  	var height = parseFloat(style.height);
  	var paddingTop = parseFloat(style.paddingTop);
  	var paddingBottom = parseFloat(style.paddingBottom);
  	var marginTop = parseFloat(style.marginTop);
  	var marginBottom = parseFloat(style.marginBottom);
  	var borderTopWidth = parseFloat(style.borderTopWidth);
  	var borderBottomWidth = parseFloat(style.borderBottomWidth);

  	return {
  		delay: delay,
  		duration: duration,
  		easing: easing,
  		css: function (t) { return "overflow: hidden;" +
  			"opacity: " + (Math.min(t * 20, 1) * opacity) + ";" +
  			"height: " + (t * height) + "px;" +
  			"padding-top: " + (t * paddingTop) + "px;" +
  			"padding-bottom: " + (t * paddingBottom) + "px;" +
  			"margin-top: " + (t * marginTop) + "px;" +
  			"margin-bottom: " + (t * marginBottom) + "px;" +
  			"border-top-width: " + (t * borderTopWidth) + "px;" +
  			"border-bottom-width: " + (t * borderBottomWidth) + "px;"; }
  	};
  }

  /* node_modules/@datawrapper/controls/Help.html generated by Svelte v2.16.1 */

  function data$1() {
    return {
      visible: false
    };
  }
  var methods$1 = {
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
  var file$1 = "node_modules/datawrapper/controls/Help.html";

  function create_main_fragment$1(component, ctx) {
    var div, span, text_1;
    var if_block = ctx.visible && create_if_block$1(component);

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
        addLoc(span, file$1, 1, 4, 69);
        addListener(div, "mouseenter", mouseenter_handler);
        addListener(div, "mouseleave", mouseleave_handler);
        div.className = "help svelte-19xfki7";
        addLoc(div, file$1, 0, 0, 0);
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
            if_block = create_if_block$1(component);
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


  function create_if_block$1(component, ctx) {
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
        addLoc(i, file$1, 4, 8, 154);
        div.className = "content svelte-19xfki7";
        addLoc(div, file$1, 3, 4, 124);
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
    this._state = assign(data$1(), options.data);
    if (!('visible' in this._state)) console.warn("<Help> was created without expected data property 'visible'");
    this._intro = true;
    this._slotted = options.slots || {};
    this._fragment = create_main_fragment$1(this, this._state);

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);
    }
  }

  assign(Help.prototype, protoDev);
  assign(Help.prototype, methods$1);

  Help.prototype._checkReadOnly = function _checkReadOnly(newState) {};

  /* node_modules/@datawrapper/controls/Checkbox.html generated by Svelte v2.16.1 */

  function data$2() {
    return {
      value: false,
      disabled: false,
      faded: false,
      indeterminate: false,
      disabled_msg: '',
      help: false
    };
  }
  var file$2 = "node_modules/datawrapper/controls/Checkbox.html";

  function create_main_fragment$2(component, ctx) {
    var text0, div, label, input, span, text1, text2, label_class_value, text3;
    var if_block0 = ctx.help && create_if_block_1(component, ctx);

    function input_change_handler() {
      component.set({
        value: input.checked,
        indeterminate: input.indeterminate
      });
    }

    var if_block1 = ctx.disabled && ctx.disabled_msg && create_if_block$2(component, ctx);
    return {
      c: function create() {
        if (if_block0) if_block0.c();
        text0 = createText("\n");
        div = createElement("div");
        label = createElement("label");
        input = createElement("input");
        span = createElement("span");
        text1 = createText("\n        ");
        text2 = createText(ctx.label);
        text3 = createText("\n    ");
        if (if_block1) if_block1.c();
        addListener(input, "change", input_change_handler);
        if (!('value' in ctx && 'indeterminate' in ctx)) component.root._beforecreate.push(input_change_handler);
        setAttribute(input, "type", "checkbox");
        input.disabled = ctx.disabled;
        input.className = "svelte-1c2xjv6";
        addLoc(input, file$2, 7, 8, 215);
        span.className = "css-ui svelte-1c2xjv6";
        addLoc(span, file$2, 7, 95, 302);
        label.className = label_class_value = "checkbox " + (ctx.disabled ? 'disabled' : '') + " " + (ctx.faded ? 'faded' : '') + " svelte-1c2xjv6";
        addLoc(label, file$2, 6, 4, 134);
        div.className = "control-group vis-option-group vis-option-type-checkbox svelte-1c2xjv6";
        addLoc(div, file$2, 5, 0, 60);
      },
      m: function mount(target, anchor) {
        if (if_block0) if_block0.m(target, anchor);
        insert(target, text0, anchor);
        insert(target, div, anchor);
        append(div, label);
        append(label, input);
        input.checked = ctx.value;
        input.indeterminate = ctx.indeterminate;
        append(label, span);
        append(label, text1);
        append(label, text2);
        append(div, text3);
        if (if_block1) if_block1.i(div, null);
      },
      p: function update(changed, ctx) {
        if (ctx.help) {
          if (if_block0) {
            if_block0.p(changed, ctx);
          } else {
            if_block0 = create_if_block_1(component, ctx);
            if_block0.c();
            if_block0.m(text0.parentNode, text0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (changed.value) input.checked = ctx.value;
        if (changed.indeterminate) input.indeterminate = ctx.indeterminate;

        if (changed.disabled) {
          input.disabled = ctx.disabled;
        }

        if (changed.label) {
          setData(text2, ctx.label);
        }

        if ((changed.disabled || changed.faded) && label_class_value !== (label_class_value = "checkbox " + (ctx.disabled ? 'disabled' : '') + " " + (ctx.faded ? 'faded' : '') + " svelte-1c2xjv6")) {
          label.className = label_class_value;
        }

        if (ctx.disabled && ctx.disabled_msg) {
          if (if_block1) {
            if_block1.p(changed, ctx);
          } else {
            if_block1 = create_if_block$2(component, ctx);
            if (if_block1) if_block1.c();
          }

          if_block1.i(div, null);
        } else if (if_block1) {
          groupOutros();
          if_block1.o(function () {
            if_block1.d(1);
            if_block1 = null;
          });
        }
      },
      d: function destroy(detach) {
        if (if_block0) if_block0.d(detach);

        if (detach) {
          detachNode(text0);
          detachNode(div);
        }

        removeListener(input, "change", input_change_handler);
        if (if_block1) if_block1.d();
      }
    };
  } // (1:0) {#if help}


  function create_if_block_1(component, ctx) {
    var div;
    var help = new Help({
      root: component.root,
      store: component.store,
      slots: {
        default: createFragment()
      }
    });
    return {
      c: function create() {
        div = createElement("div");

        help._fragment.c();

        addLoc(div, file$2, 2, 4, 22);
      },
      m: function mount(target, anchor) {
        append(help._slotted.default, div);
        div.innerHTML = ctx.help;

        help._mount(target, anchor);
      },
      p: function update(changed, ctx) {
        if (changed.help) {
          div.innerHTML = ctx.help;
        }
      },
      d: function destroy(detach) {
        help.destroy(detach);
      }
    };
  } // (11:4) {#if disabled && disabled_msg}


  function create_if_block$2(component, ctx) {
    var div1, div0, div1_transition, current;
    return {
      c: function create() {
        div1 = createElement("div");
        div0 = createElement("div");
        div0.className = "disabled-msg svelte-1c2xjv6";
        addLoc(div0, file$2, 12, 8, 432);
        addLoc(div1, file$2, 11, 4, 401);
      },
      m: function mount(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        div0.innerHTML = ctx.disabled_msg;
        current = true;
      },
      p: function update(changed, ctx) {
        if (!current || changed.disabled_msg) {
          div0.innerHTML = ctx.disabled_msg;
        }
      },
      i: function intro(target, anchor) {
        if (current) return;

        if (component.root._intro) {
          if (div1_transition) div1_transition.invalidate();

          component.root._aftercreate.push(function () {
            if (!div1_transition) div1_transition = wrapTransition(component, div1, slide, {}, true);
            div1_transition.run(1);
          });
        }

        this.m(target, anchor);
      },
      o: function outro(outrocallback) {
        if (!current) return;
        if (!div1_transition) div1_transition = wrapTransition(component, div1, slide, {}, false);
        div1_transition.run(0, function () {
          outrocallback();
          div1_transition = null;
        });
        current = false;
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(div1);
          if (div1_transition) div1_transition.abort();
        }
      }
    };
  }

  function Checkbox(options) {
    this._debugName = '<Checkbox>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this._state = assign(data$2(), options.data);
    if (!('help' in this._state)) console.warn("<Checkbox> was created without expected data property 'help'");
    if (!('disabled' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled'");
    if (!('faded' in this._state)) console.warn("<Checkbox> was created without expected data property 'faded'");
    if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
    if (!('indeterminate' in this._state)) console.warn("<Checkbox> was created without expected data property 'indeterminate'");
    if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");
    if (!('disabled_msg' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled_msg'");
    this._intro = true;
    this._fragment = create_main_fragment$2(this, this._state);

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);

      flush(this);
    }
  }

  assign(Checkbox.prototype, protoDev);

  Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {};

  /* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

  function data$3() {
    return {
      disabled: false,
      help: false,
      type: 'default',
      valign: 'baseline',
      inline: false
    };
  }
  var def = {
    width: '100px'
  };
  var file$3 = "node_modules/datawrapper/controls/ControlGroup.html";

  function create_main_fragment$3(component, ctx) {
    var div1,
        text0,
        div0,
        slot_content_default = component._slotted.default,
        slot_content_default_after,
        text1,
        div1_class_value;
    var if_block0 = ctx.label && create_if_block_1$1(component, ctx);
    var if_block1 = ctx.help && create_if_block$3(component, ctx);
    return {
      c: function create() {
        div1 = createElement("div");
        if (if_block0) if_block0.c();
        text0 = createText("\n    ");
        div0 = createElement("div");
        text1 = createText("\n        ");
        if (if_block1) if_block1.c();
        div0.className = "controls svelte-nf911z";
        setStyle(div0, "width", "calc(100% - " + (ctx.width || def.width) + " - 32px)");
        toggleClass(div0, "form-inline", ctx.inline);
        addLoc(div0, file$3, 4, 4, 219);
        div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-nf911z";
        addLoc(div1, file$3, 0, 0, 0);
      },
      m: function mount(target, anchor) {
        insert(target, div1, anchor);
        if (if_block0) if_block0.m(div1, null);
        append(div1, text0);
        append(div1, div0);

        if (slot_content_default) {
          append(div0, slot_content_default);
          append(div0, slot_content_default_after || (slot_content_default_after = createComment()));
        }

        append(div0, text1);
        if (if_block1) if_block1.m(div0, null);
      },
      p: function update(changed, ctx) {
        if (ctx.label) {
          if (if_block0) {
            if_block0.p(changed, ctx);
          } else {
            if_block0 = create_if_block_1$1(component, ctx);
            if_block0.c();
            if_block0.m(div1, text0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (ctx.help) {
          if (if_block1) {
            if_block1.p(changed, ctx);
          } else {
            if_block1 = create_if_block$3(component, ctx);
            if_block1.c();
            if_block1.m(div0, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (changed.width) {
          setStyle(div0, "width", "calc(100% - " + (ctx.width || def.width) + " - 32px)");
        }

        if (changed.inline) {
          toggleClass(div0, "form-inline", ctx.inline);
        }

        if ((changed.type || changed.valign) && div1_class_value !== (div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-nf911z")) {
          div1.className = div1_class_value;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(div1);
        }

        if (if_block0) if_block0.d();

        if (slot_content_default) {
          reinsertBefore(slot_content_default_after, slot_content_default);
        }

        if (if_block1) if_block1.d();
      }
    };
  } // (2:4) {#if label}


  function create_if_block_1$1(component, ctx) {
    var label;
    return {
      c: function create() {
        label = createElement("label");
        setStyle(label, "width", ctx.width || def.width);
        label.className = "control-label svelte-nf911z";
        toggleClass(label, "disabled", ctx.disabled);
        addLoc(label, file$3, 2, 4, 104);
      },
      m: function mount(target, anchor) {
        insert(target, label, anchor);
        label.innerHTML = ctx.label;
      },
      p: function update(changed, ctx) {
        if (changed.label) {
          label.innerHTML = ctx.label;
        }

        if (changed.width) {
          setStyle(label, "width", ctx.width || def.width);
        }

        if (changed.disabled) {
          toggleClass(label, "disabled", ctx.disabled);
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(label);
        }
      }
    };
  } // (7:8) {#if help}


  function create_if_block$3(component, ctx) {
    var p, p_class_value;
    return {
      c: function create() {
        p = createElement("p");
        p.className = p_class_value = "mini-help " + ctx.type + " svelte-nf911z";
        addLoc(p, file$3, 7, 8, 368);
      },
      m: function mount(target, anchor) {
        insert(target, p, anchor);
        p.innerHTML = ctx.help;
      },
      p: function update(changed, ctx) {
        if (changed.help) {
          p.innerHTML = ctx.help;
        }

        if (changed.type && p_class_value !== (p_class_value = "mini-help " + ctx.type + " svelte-nf911z")) {
          p.className = p_class_value;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(p);
        }
      }
    };
  }

  function ControlGroup(options) {
    this._debugName = '<ControlGroup>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this._state = assign(data$3(), options.data);
    if (!('type' in this._state)) console.warn("<ControlGroup> was created without expected data property 'type'");
    if (!('valign' in this._state)) console.warn("<ControlGroup> was created without expected data property 'valign'");
    if (!('label' in this._state)) console.warn("<ControlGroup> was created without expected data property 'label'");
    if (!('width' in this._state)) console.warn("<ControlGroup> was created without expected data property 'width'");
    if (!('inline' in this._state)) console.warn("<ControlGroup> was created without expected data property 'inline'");
    if (!('help' in this._state)) console.warn("<ControlGroup> was created without expected data property 'help'");
    this._intro = true;
    this._slotted = options.slots || {};
    this._fragment = create_main_fragment$3(this, this._state);

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);
    }
  }

  assign(ControlGroup.prototype, protoDev);

  ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {};

  /* node_modules/@datawrapper/controls/BaseSelect.html generated by Svelte v2.16.1 */

  function data$4() {
    return {
      disabled: false,
      width: 'auto',
      labelWidth: 'auto',
      options: [],
      optgroups: []
    };
  }
  var file$4 = "node_modules/datawrapper/controls/BaseSelect.html";

  function get_each_context_2(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.opt = list[i];
    return child_ctx;
  }

  function get_each_context_1$1(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.optgroup = list[i];
    return child_ctx;
  }

  function get_each_context$1(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.opt = list[i];
    return child_ctx;
  }

  function create_main_fragment$4(component, ctx) {
    var select,
        if_block0_anchor,
        select_updating = false;
    var if_block0 = ctx.options.length && create_if_block_1$2(component, ctx);
    var if_block1 = ctx.optgroups.length && create_if_block$4(component, ctx);

    function select_change_handler() {
      select_updating = true;
      component.set({
        value: selectValue(select)
      });
      select_updating = false;
    }

    return {
      c: function create() {
        select = createElement("select");
        if (if_block0) if_block0.c();
        if_block0_anchor = createComment();
        if (if_block1) if_block1.c();
        addListener(select, "change", select_change_handler);
        if (!('value' in ctx)) component.root._beforecreate.push(select_change_handler);
        select.className = "select-css svelte-v0oq4b";
        select.disabled = ctx.disabled;
        setStyle(select, "width", ctx.width);
        addLoc(select, file$4, 0, 0, 0);
      },
      m: function mount(target, anchor) {
        insert(target, select, anchor);
        if (if_block0) if_block0.m(select, null);
        append(select, if_block0_anchor);
        if (if_block1) if_block1.m(select, null);
        selectOption(select, ctx.value);
      },
      p: function update(changed, ctx) {
        if (ctx.options.length) {
          if (if_block0) {
            if_block0.p(changed, ctx);
          } else {
            if_block0 = create_if_block_1$2(component, ctx);
            if_block0.c();
            if_block0.m(select, if_block0_anchor);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (ctx.optgroups.length) {
          if (if_block1) {
            if_block1.p(changed, ctx);
          } else {
            if_block1 = create_if_block$4(component, ctx);
            if_block1.c();
            if_block1.m(select, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (!select_updating && changed.value) selectOption(select, ctx.value);

        if (changed.disabled) {
          select.disabled = ctx.disabled;
        }

        if (changed.width) {
          setStyle(select, "width", ctx.width);
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(select);
        }

        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
        removeListener(select, "change", select_change_handler);
      }
    };
  } // (2:4) {#if options.length}


  function create_if_block_1$2(component, ctx) {
    var each_anchor;
    var each_value = ctx.options;
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block_2(component, get_each_context$1(ctx, each_value, i));
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
        if (changed.options) {
          each_value = ctx.options;

          for (var i = 0; i < each_value.length; i += 1) {
            var child_ctx = get_each_context$1(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(changed, child_ctx);
            } else {
              each_blocks[i] = create_each_block_2(component, child_ctx);
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
  } // (2:25) {#each options as opt}


  function create_each_block_2(component, ctx) {
    var option,
        text_value = ctx.opt.label,
        text,
        option_value_value;
    return {
      c: function create() {
        option = createElement("option");
        text = createText(text_value);
        option.__value = option_value_value = ctx.opt.value;
        option.value = option.__value;
        addLoc(option, file$4, 2, 4, 145);
      },
      m: function mount(target, anchor) {
        insert(target, option, anchor);
        append(option, text);
      },
      p: function update(changed, ctx) {
        if (changed.options && text_value !== (text_value = ctx.opt.label)) {
          setData(text, text_value);
        }

        if (changed.options && option_value_value !== (option_value_value = ctx.opt.value)) {
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
  } // (4:18) {#if optgroups.length}


  function create_if_block$4(component, ctx) {
    var each_anchor;
    var each_value_1 = ctx.optgroups;
    var each_blocks = [];

    for (var i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block$1(component, get_each_context_1$1(ctx, each_value_1, i));
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
        if (changed.optgroups) {
          each_value_1 = ctx.optgroups;

          for (var i = 0; i < each_value_1.length; i += 1) {
            var child_ctx = get_each_context_1$1(ctx, each_value_1, i);

            if (each_blocks[i]) {
              each_blocks[i].p(changed, child_ctx);
            } else {
              each_blocks[i] = create_each_block$1(component, child_ctx);
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
  } // (6:8) {#each optgroup.options as opt}


  function create_each_block_1$1(component, ctx) {
    var option,
        text_value = ctx.opt.label,
        text,
        option_value_value;
    return {
      c: function create() {
        option = createElement("option");
        text = createText(text_value);
        option.__value = option_value_value = ctx.opt.value;
        option.value = option.__value;
        addLoc(option, file$4, 6, 8, 353);
      },
      m: function mount(target, anchor) {
        insert(target, option, anchor);
        append(option, text);
      },
      p: function update(changed, ctx) {
        if (changed.optgroups && text_value !== (text_value = ctx.opt.label)) {
          setData(text, text_value);
        }

        if (changed.optgroups && option_value_value !== (option_value_value = ctx.opt.value)) {
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
  } // (4:41) {#each optgroups as optgroup}


  function create_each_block$1(component, ctx) {
    var optgroup, optgroup_label_value;
    var each_value_2 = ctx.optgroup.options;
    var each_blocks = [];

    for (var i = 0; i < each_value_2.length; i += 1) {
      each_blocks[i] = create_each_block_1$1(component, get_each_context_2(ctx, each_value_2, i));
    }

    return {
      c: function create() {
        optgroup = createElement("optgroup");

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
        addLoc(optgroup, file$4, 4, 4, 269);
      },
      m: function mount(target, anchor) {
        insert(target, optgroup, anchor);

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(optgroup, null);
        }
      },
      p: function update(changed, ctx) {
        if (changed.optgroups) {
          each_value_2 = ctx.optgroup.options;

          for (var i = 0; i < each_value_2.length; i += 1) {
            var child_ctx = get_each_context_2(ctx, each_value_2, i);

            if (each_blocks[i]) {
              each_blocks[i].p(changed, child_ctx);
            } else {
              each_blocks[i] = create_each_block_1$1(component, child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(optgroup, null);
            }
          }

          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }

          each_blocks.length = each_value_2.length;
        }

        if (changed.optgroups && optgroup_label_value !== (optgroup_label_value = ctx.optgroup.label)) {
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

  function BaseSelect(options) {
    this._debugName = '<BaseSelect>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this._state = assign(data$4(), options.data);
    if (!('disabled' in this._state)) console.warn("<BaseSelect> was created without expected data property 'disabled'");
    if (!('value' in this._state)) console.warn("<BaseSelect> was created without expected data property 'value'");
    if (!('width' in this._state)) console.warn("<BaseSelect> was created without expected data property 'width'");
    if (!('options' in this._state)) console.warn("<BaseSelect> was created without expected data property 'options'");
    if (!('optgroups' in this._state)) console.warn("<BaseSelect> was created without expected data property 'optgroups'");
    this._intro = true;
    this._fragment = create_main_fragment$4(this, this._state);

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);

      flush(this);
    }
  }

  assign(BaseSelect.prototype, protoDev);

  BaseSelect.prototype._checkReadOnly = function _checkReadOnly(newState) {};

  /* node_modules/@datawrapper/controls/Select.html generated by Svelte v2.16.1 */

  function data$5() {
    return {
      disabled: false,
      width: 'auto',
      labelWidth: 'auto',
      options: [],
      optgroups: []
    };
  }

  function create_main_fragment$5(component, ctx) {
    var baseselect_updating = {};
    var baseselect_initial_data = {};

    if (ctx.value !== void 0) {
      baseselect_initial_data.value = ctx.value;
      baseselect_updating.value = true;
    }

    if (ctx.disabled !== void 0) {
      baseselect_initial_data.disabled = ctx.disabled;
      baseselect_updating.disabled = true;
    }

    if (ctx.width !== void 0) {
      baseselect_initial_data.width = ctx.width;
      baseselect_updating.width = true;
    }

    if (ctx.options !== void 0) {
      baseselect_initial_data.options = ctx.options;
      baseselect_updating.options = true;
    }

    if (ctx.optgroups !== void 0) {
      baseselect_initial_data.optgroups = ctx.optgroups;
      baseselect_updating.optgroups = true;
    }

    var baseselect = new BaseSelect({
      root: component.root,
      store: component.store,
      data: baseselect_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!baseselect_updating.value && changed.value) {
          newState.value = childState.value;
        }

        if (!baseselect_updating.disabled && changed.disabled) {
          newState.disabled = childState.disabled;
        }

        if (!baseselect_updating.width && changed.width) {
          newState.width = childState.width;
        }

        if (!baseselect_updating.options && changed.options) {
          newState.options = childState.options;
        }

        if (!baseselect_updating.optgroups && changed.optgroups) {
          newState.optgroups = childState.optgroups;
        }

        component._set(newState);

        baseselect_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      baseselect._bind({
        value: 1,
        disabled: 1,
        width: 1,
        options: 1,
        optgroups: 1
      }, baseselect.get());
    });

    var controlgroup_initial_data = {
      type: "select",
      width: ctx.labelWidth,
      valign: "baseline",
      inline: true,
      label: ctx.label,
      help: ctx.help,
      disabled: ctx.disabled
    };
    var controlgroup = new ControlGroup({
      root: component.root,
      store: component.store,
      slots: {
        default: createFragment()
      },
      data: controlgroup_initial_data
    });
    return {
      c: function create() {
        baseselect._fragment.c();

        controlgroup._fragment.c();
      },
      m: function mount(target, anchor) {
        baseselect._mount(controlgroup._slotted.default, null);

        controlgroup._mount(target, anchor);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
        var baseselect_changes = {};

        if (!baseselect_updating.value && changed.value) {
          baseselect_changes.value = ctx.value;
          baseselect_updating.value = ctx.value !== void 0;
        }

        if (!baseselect_updating.disabled && changed.disabled) {
          baseselect_changes.disabled = ctx.disabled;
          baseselect_updating.disabled = ctx.disabled !== void 0;
        }

        if (!baseselect_updating.width && changed.width) {
          baseselect_changes.width = ctx.width;
          baseselect_updating.width = ctx.width !== void 0;
        }

        if (!baseselect_updating.options && changed.options) {
          baseselect_changes.options = ctx.options;
          baseselect_updating.options = ctx.options !== void 0;
        }

        if (!baseselect_updating.optgroups && changed.optgroups) {
          baseselect_changes.optgroups = ctx.optgroups;
          baseselect_updating.optgroups = ctx.optgroups !== void 0;
        }

        baseselect._set(baseselect_changes);

        baseselect_updating = {};
        var controlgroup_changes = {};
        if (changed.labelWidth) controlgroup_changes.width = ctx.labelWidth;
        if (changed.label) controlgroup_changes.label = ctx.label;
        if (changed.help) controlgroup_changes.help = ctx.help;
        if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;

        controlgroup._set(controlgroup_changes);
      },
      d: function destroy(detach) {
        baseselect.destroy();
        controlgroup.destroy(detach);
      }
    };
  }

  function Select(options) {
    this._debugName = '<Select>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this._state = assign(data$5(), options.data);
    if (!('labelWidth' in this._state)) console.warn("<Select> was created without expected data property 'labelWidth'");
    if (!('label' in this._state)) console.warn("<Select> was created without expected data property 'label'");
    if (!('help' in this._state)) console.warn("<Select> was created without expected data property 'help'");
    if (!('disabled' in this._state)) console.warn("<Select> was created without expected data property 'disabled'");
    if (!('value' in this._state)) console.warn("<Select> was created without expected data property 'value'");
    if (!('width' in this._state)) console.warn("<Select> was created without expected data property 'width'");
    if (!('options' in this._state)) console.warn("<Select> was created without expected data property 'options'");
    if (!('optgroups' in this._state)) console.warn("<Select> was created without expected data property 'optgroups'");
    this._intro = true;
    this._fragment = create_main_fragment$5(this, this._state);

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);

      flush(this);
    }
  }

  assign(Select.prototype, protoDev);

  Select.prototype._checkReadOnly = function _checkReadOnly(newState) {};

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

  /**
   * Converts an array with properties back to a normal object.
   *
   * @exports arrayToObject
   * @kind function
   *
   * @description
   * This function fixes an uglyness when working with PHP backends.
   * in PHP, there is no distiction between arrays and objects, so
   * PHP converts an empty object {} to a empty array [].
   * When this empty array then ends up in client-side JS functions which
   * might start to assign values to the array using `arr.foo = "bar"`
   * which results in a data structure like this:
   *
   * @example
   * console.log(arr);
   * []
   *   foo: "bar"
   *   length: 0
   *   <prototype>: Array []
   *
   * console.log(arrayToObject(arr));
   * Object { foo: "bar" }
   *
   * @param {array} o - the input
   * @returns {object}
   */
  function arrayToObject(o) {
    if (Array.isArray(o)) {
      var obj = {};
      Object.keys(o).forEach(function (k) {
        return obj[k] = o[k];
      });
      return obj;
    }

    return o;
  }

  /* describe/CustomColumnFormat.html generated by Svelte v2.16.1 */

  function title$1(_ref) {
    var column = _ref.column;

    var s = __('describe / edit-column');

    return s.replace('%s', "\"".concat(column ? column.title() || column.name() : '--', "\""));
  }

  function data$6() {
    return {
      columnFormat: {
        type: 'auto',
        ignore: false,
        'number-divisor': 0,
        'number-format': 'auto',
        'number-prepend': '',
        'number-append': ''
      },
      colTypes: [],
      divisors_opts: [{
        value: 0,
        label: __('describe / column-format / no-change')
      }, {
        value: 'auto',
        label: __('describe / column-format / automatic')
      }],
      divisors: [{
        label: __('describe / column-format / divide-by'),
        options: [{
          value: 3,
          label: '1000'
        }, {
          value: 6,
          label: '1 million'
        }, {
          value: 9,
          label: '1 billion'
        }]
      }, {
        label: __('describe / column-format / multiply-by'),
        options: [{
          value: -2,
          label: '100'
        }, {
          value: -3,
          label: '1000'
        }, {
          value: -6,
          label: '1 million'
        }, {
          value: -9,
          label: '1 billion'
        }, {
          value: -12,
          label: '1 trillion'
        }]
      }],
      numberFormats: [{
        label: __('Decimal places'),
        options: [{
          value: 'n3',
          label: '3 (1,234.568)'
        }, {
          value: 'n2',
          label: '2 (1,234.57)'
        }, {
          value: 'n1',
          label: '1 (1,234.6)'
        }, {
          value: 'n0',
          label: '0 (1,235)'
        }]
      }, {
        label: __('Significant digits'),
        options: [{
          value: 's6',
          label: '6 (1,234.57)'
        }, {
          value: 's5',
          label: '5 (123.45)'
        }, {
          value: 's4',
          label: '4 (12.34)'
        }, {
          value: 's3',
          label: '3 (1.23)'
        }, {
          value: 's2',
          label: '2 (0.12)'
        }, {
          value: 's1',
          label: '1 (0.01)'
        }]
      }],
      roundOptions: [{
        value: '-',
        label: __('describe / column-format / individual')
      }, {
        value: 'auto',
        label: __('describe / column-format / auto-detect')
      }]
    };
  }
  var methods$2 = {
    autoDivisor: function autoDivisor() {
      var _this$store$get = this.store.get(),
          dw_chart = _this$store$get.dw_chart;

      var _this$get = this.get(),
          column = _this$get.column;

      var mtrSuf = dw.utils.metricSuffix(dw_chart.locale());
      var values = column.values();
      var dim = dw.utils.significantDimension(values);
      var div = dim < -2 ? Math.round(dim * -1 / 3) * 3 : dim > 4 ? dim * -1 : 0;
      var nvalues = values.map(function (v) {
        return v / Math.pow(10, div);
      });
      var ndim = dw.utils.significantDimension(nvalues);
      if (ndim <= 0) ndim = nvalues.reduce(function (acc, cur) {
        return Math.max(acc, Math.min(3, dw.utils.tailLength(cur)));
      }, 0);

      if (ndim === div) {
        div = 0;
        ndim = 0;
      }

      if (div > 15) {
        div = 0;
        ndim = 0;
      }

      this.set({
        columnFormat: {
          'number-divisor': div,
          'number-format': 'n' + Math.max(0, ndim),
          'number-prepend': '',
          'number-append': div ? mtrSuf[div] || ' × 10<sup>' + div + '</sup>' : ''
        }
      });
    },
    getColumnFormat: function getColumnFormat(column) {
      var _this$store$get2 = this.store.get(),
          dw_chart = _this$store$get2.dw_chart;

      var columnFormats = arrayToObject(dw_chart.get('metadata.data.column-format', {}));
      var columnFormat = clone(columnFormats[column.name()]);

      if (!columnFormat || columnFormat === 'auto' || columnFormat.length !== undefined) {
        // no valid column format
        columnFormat = {
          type: 'auto',
          ignore: false,
          'number-divisor': 0,
          'number-prepend': '',
          'number-append': '',
          'number-format': 'auto'
        };
      }

      return columnFormat;
    }
  };

  function oncreate$1() {
    var _this = this;

    var updateTable = _throttle(function () {
      _this.fire('updateTable');
    }, 100, {
      leading: false
    });

    var renderTable = _throttle(function () {
      _this.fire('updateTable');
    }, 100, {
      leading: false
    });

    var _this$get2 = this.get(),
        column = _this$get2.column;

    this.set({
      colTypes: [{
        value: 'auto',
        label: 'auto (' + column.type() + ')'
      }, {
        value: 'text',
        label: 'Text'
      }, {
        value: 'number',
        label: 'Number'
      }, {
        value: 'date',
        label: 'Date'
      }]
    });
    this.set({
      columnFormat: this.getColumnFormat(column)
    });
    this.on('state', function (_ref2) {
      var changed = _ref2.changed,
          current = _ref2.current;

      if (changed.column) {
        var col = current.column;

        _this.set({
          columnFormat: _this.getColumnFormat(col)
        });

        var _this$get3 = _this.get(),
            colTypes = _this$get3.colTypes;

        colTypes[0].label = 'auto (' + column.type() + ')';
      }

      if (changed.columnFormat) {
        var colFormat = current.columnFormat;

        var _this$store$get3 = _this.store.get(),
            dw_chart = _this$store$get3.dw_chart;

        var _column = current.column;
        var columnFormats = arrayToObject(clone(dw_chart.get('metadata.data.column-format', {})));

        var oldFormat = columnFormats[_column.name()];

        if (!oldFormat || JSON.stringify(oldFormat) !== JSON.stringify(colFormat)) {
          if (colFormat['number-divisor'] === 'auto') {
            // stop here and compute divisor automatically
            setTimeout(function () {
              return _this.autoDivisor();
            }, 100);
            return;
          }

          columnFormats[_column.name()] = clone(colFormat);
          dw_chart.set('metadata.data.column-format', columnFormats);
          if (dw_chart.saveSoon) dw_chart.saveSoon();
          if (!oldFormat || oldFormat.type !== colFormat.type) updateTable();else renderTable();
        }
      }
    });
  }
  var file$5 = "describe/CustomColumnFormat.html";

  function create_main_fragment$6(component, ctx) {
    var div1,
        h3,
        text0,
        text1,
        div0,
        select_updating = {},
        text2,
        checkbox_updating = {},
        text3,
        hr,
        text4;
    var select_initial_data = {
      label: __('Column type'),
      options: ctx.colTypes,
      width: "180px"
    };

    if (ctx.columnFormat.type !== void 0) {
      select_initial_data.value = ctx.columnFormat.type;
      select_updating.value = true;
    }

    var select = new Select({
      root: component.root,
      store: component.store,
      data: select_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!select_updating.value && changed.value) {
          ctx.columnFormat.type = childState.value;
          newState.columnFormat = ctx.columnFormat;
        }

        component._set(newState);

        select_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      select._bind({
        value: 1
      }, select.get());
    });

    var checkbox_initial_data = {
      label: __('Hide column from visualization')
    };

    if (ctx.columnFormat.ignore !== void 0) {
      checkbox_initial_data.value = ctx.columnFormat.ignore;
      checkbox_updating.value = true;
    }

    var checkbox = new Checkbox({
      root: component.root,
      store: component.store,
      data: checkbox_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!checkbox_updating.value && changed.value) {
          ctx.columnFormat.ignore = childState.value;
          newState.columnFormat = ctx.columnFormat;
        }

        component._set(newState);

        checkbox_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      checkbox._bind({
        value: 1
      }, checkbox.get());
    });

    var if_block = ctx.column && ctx.column.type() == 'number' && create_if_block$5(component, ctx);
    return {
      c: function create() {
        div1 = createElement("div");
        h3 = createElement("h3");
        text0 = createText(ctx.title);
        text1 = createText("\n\n    ");
        div0 = createElement("div");

        select._fragment.c();

        text2 = createText("\n\n        ");

        checkbox._fragment.c();

        text3 = createText("\n\n        ");
        hr = createElement("hr");
        text4 = createText("\n\n        ");
        if (if_block) if_block.c();
        h3.className = "first";
        addLoc(h3, file$5, 1, 4, 10);
        addLoc(hr, file$5, 9, 8, 335);
        div0.className = "form-horizontal";
        addLoc(div0, file$5, 3, 4, 46);
        addLoc(div1, file$5, 0, 0, 0);
      },
      m: function mount(target, anchor) {
        insert(target, div1, anchor);
        append(div1, h3);
        append(h3, text0);
        append(div1, text1);
        append(div1, div0);

        select._mount(div0, null);

        append(div0, text2);

        checkbox._mount(div0, null);

        append(div0, text3);
        append(div0, hr);
        append(div0, text4);
        if (if_block) if_block.m(div0, null);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;

        if (changed.title) {
          setData(text0, ctx.title);
        }

        var select_changes = {};
        if (changed.colTypes) select_changes.options = ctx.colTypes;

        if (!select_updating.value && changed.columnFormat) {
          select_changes.value = ctx.columnFormat.type;
          select_updating.value = ctx.columnFormat.type !== void 0;
        }

        select._set(select_changes);

        select_updating = {};
        var checkbox_changes = {};

        if (!checkbox_updating.value && changed.columnFormat) {
          checkbox_changes.value = ctx.columnFormat.ignore;
          checkbox_updating.value = ctx.columnFormat.ignore !== void 0;
        }

        checkbox._set(checkbox_changes);

        checkbox_updating = {};

        if (ctx.column && ctx.column.type() == 'number') {
          if (if_block) {
            if_block.p(changed, ctx);
          } else {
            if_block = create_if_block$5(component, ctx);
            if_block.c();
            if_block.m(div0, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(div1);
        }

        select.destroy();
        checkbox.destroy();
        if (if_block) if_block.d();
      }
    };
  } // (12:8) {#if column && column.type() == 'number'}


  function create_if_block$5(component, ctx) {
    var select0_updating = {},
        text0,
        select1_updating = {},
        text1,
        div1,
        label,
        text2_value = __("Prepend/Append"),
        text2,
        text3,
        div0,
        input0,
        input0_updating = false,
        text4,
        input1,
        input1_updating = false;

    var select0_initial_data = {
      label: __('Round numbers to'),
      options: ctx.roundOptions,
      optgroups: ctx.numberFormats,
      width: "180px"
    };

    if (ctx.columnFormat['number-format'] !== void 0) {
      select0_initial_data.value = ctx.columnFormat['number-format'];
      select0_updating.value = true;
    }

    var select0 = new Select({
      root: component.root,
      store: component.store,
      data: select0_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!select0_updating.value && changed.value) {
          ctx.columnFormat['number-format'] = childState.value;
          newState.columnFormat = ctx.columnFormat;
        }

        component._set(newState);

        select0_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      select0._bind({
        value: 1
      }, select0.get());
    });

    var select1_initial_data = {
      label: __('Divide numbers by'),
      options: ctx.divisors_opts,
      optgroups: ctx.divisors,
      width: "180px"
    };

    if (ctx.columnFormat['number-divisor'] !== void 0) {
      select1_initial_data.value = ctx.columnFormat['number-divisor'];
      select1_updating.value = true;
    }

    var select1 = new Select({
      root: component.root,
      store: component.store,
      data: select1_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!select1_updating.value && changed.value) {
          ctx.columnFormat['number-divisor'] = childState.value;
          newState.columnFormat = ctx.columnFormat;
        }

        component._set(newState);

        select1_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      select1._bind({
        value: 1
      }, select1.get());
    });

    function input0_input_handler() {
      input0_updating = true;
      ctx.columnFormat['number-prepend'] = input0.value;
      component.set({
        columnFormat: ctx.columnFormat
      });
      input0_updating = false;
    }

    function input1_input_handler() {
      input1_updating = true;
      ctx.columnFormat['number-append'] = input1.value;
      component.set({
        columnFormat: ctx.columnFormat
      });
      input1_updating = false;
    }

    return {
      c: function create() {
        select0._fragment.c();

        text0 = createText("\n\n        \n        ");

        select1._fragment.c();

        text1 = createText("\n\n        ");
        div1 = createElement("div");
        label = createElement("label");
        text2 = createText(text2_value);
        text3 = createText("\n            ");
        div0 = createElement("div");
        input0 = createElement("input");
        text4 = createText("\n                #\n                ");
        input1 = createElement("input");
        label.className = "control-label svelte-1qp115j";
        addLoc(label, file$5, 31, 12, 990);
        addListener(input0, "input", input0_input_handler);
        input0.autocomplete = "screw-you-google-chrome";
        setStyle(input0, "width", "6ex");
        setStyle(input0, "text-align", "right");
        input0.dataset.lpignore = "true";
        input0.name = "prepend";
        setAttribute(input0, "type", "text");
        addLoc(input0, file$5, 35, 16, 1143);
        addListener(input1, "input", input1_input_handler);
        input1.autocomplete = "screw-you-google-chrome";
        setStyle(input1, "width", "6ex");
        input1.dataset.lpignore = "true";
        input1.name = "append";
        setAttribute(input1, "type", "text");
        addLoc(input1, file$5, 44, 16, 1490);
        div0.className = "controls form-inline svelte-1qp115j";
        addLoc(div0, file$5, 34, 12, 1092);
        div1.className = "control-group vis-option-type-select";
        addLoc(div1, file$5, 30, 8, 927);
      },
      m: function mount(target, anchor) {
        select0._mount(target, anchor);

        insert(target, text0, anchor);

        select1._mount(target, anchor);

        insert(target, text1, anchor);
        insert(target, div1, anchor);
        append(div1, label);
        append(label, text2);
        append(div1, text3);
        append(div1, div0);
        append(div0, input0);
        input0.value = ctx.columnFormat['number-prepend'];
        append(div0, text4);
        append(div0, input1);
        input1.value = ctx.columnFormat['number-append'];
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
        var select0_changes = {};
        if (changed.roundOptions) select0_changes.options = ctx.roundOptions;
        if (changed.numberFormats) select0_changes.optgroups = ctx.numberFormats;

        if (!select0_updating.value && changed.columnFormat) {
          select0_changes.value = ctx.columnFormat['number-format'];
          select0_updating.value = ctx.columnFormat['number-format'] !== void 0;
        }

        select0._set(select0_changes);

        select0_updating = {};
        var select1_changes = {};
        if (changed.divisors_opts) select1_changes.options = ctx.divisors_opts;
        if (changed.divisors) select1_changes.optgroups = ctx.divisors;

        if (!select1_updating.value && changed.columnFormat) {
          select1_changes.value = ctx.columnFormat['number-divisor'];
          select1_updating.value = ctx.columnFormat['number-divisor'] !== void 0;
        }

        select1._set(select1_changes);

        select1_updating = {};
        if (!input0_updating && changed.columnFormat) input0.value = ctx.columnFormat['number-prepend'];
        if (!input1_updating && changed.columnFormat) input1.value = ctx.columnFormat['number-append'];
      },
      d: function destroy(detach) {
        select0.destroy(detach);

        if (detach) {
          detachNode(text0);
        }

        select1.destroy(detach);

        if (detach) {
          detachNode(text1);
          detachNode(div1);
        }

        removeListener(input0, "input", input0_input_handler);
        removeListener(input1, "input", input1_input_handler);
      }
    };
  }

  function CustomColumnFormat(options) {
    var _this2 = this;

    this._debugName = '<CustomColumnFormat>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this._state = assign(data$6(), options.data);

    this._recompute({
      column: 1
    }, this._state);

    if (!('column' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'column'");
    if (!('colTypes' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'colTypes'");
    if (!('columnFormat' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'columnFormat'");
    if (!('roundOptions' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'roundOptions'");
    if (!('numberFormats' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'numberFormats'");
    if (!('divisors_opts' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors_opts'");
    if (!('divisors' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors'");
    this._intro = true;
    this._fragment = create_main_fragment$6(this, this._state);

    this.root._oncreate.push(function () {
      oncreate$1.call(_this2);

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

  assign(CustomColumnFormat.prototype, protoDev);
  assign(CustomColumnFormat.prototype, methods$2);

  CustomColumnFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
    if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<CustomColumnFormat>: Cannot set read-only property 'title'");
  };

  CustomColumnFormat.prototype._recompute = function _recompute(changed, state) {
    if (changed.column) {
      if (this._differs(state.title, state.title = title$1(state))) changed.title = true;
    }
  };

  // `_range` : an array's function
  // -------------------------------

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  function _range (start, stop, step) {
  	if (stop == null) {
  		stop = start || 0;
  		start = 0;
  	}
  	if (!step) {
  		step = stop < start ? -1 : 1;
  	}
  	let length = Math.max(Math.ceil((stop - start) / step), 0);
  	let range = Array(length);
  	for (let idx = 0; idx < length; idx++, start += step) {
  		range[idx] = start;
  	}
  	return range;
  }

  // `_countBy` : a collection's function

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  var _countBy = group( (result, value, key) => {
  	if (_has(result, key)) result[key]++;
  	else result[key] = 1;
  });

  /**
   * returns the length of the "tail" of a number, meaning the
   * number of meaningful decimal places
   *
   * @exports tailLength
   * @kind function
   *
   * @example
   * // returns 3
   * tailLength(3.123)
   *
   * @example
   * // returns 2
   * tailLength(3.12999999)
   *
   * @param {number} value
   * @returns {number}
   */
  function tailLength(value) {
    return Math.max(0, String(value - Math.floor(value)).replace(/00000*[0-9]+$/, '').replace(/99999*[0-9]+$/, '').length - 2);
  }

  /**
   * Automatically converts a numeric value to a string. this is better
   * than the default number to string conversion in JS which sometimes
   * produces ugly strings like "3.999999998"
   *
   * @exports toFixed
   * @kind function
   *
   * @example
   * import toFixed from '@datawrapper/shared/toFixed';
   * // returns '3.1'
   * toFixed(3.100001)
   *
   * @param {number} value
   * @returns {string}
   */

  function toFixed(value) {
    return (+value).toFixed(tailLength(value));
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(compare) {
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
      left: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }
    };
  }

  function ascendingComparator(f) {
    return function(d, x) {
      return ascending(f(d), x);
    };
  }

  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;

  function number(x) {
    return x === null ? NaN : +x;
  }

  function extent(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        min,
        max;

    if (valueof == null) {
      while (++i < n) { // Find the first comparable value.
        if ((value = values[i]) != null && value >= value) {
          min = max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = values[i]) != null) {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
    }

    else {
      while (++i < n) { // Find the first comparable value.
        if ((value = valueof(values[i], i, values)) != null && value >= value) {
          min = max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = valueof(values[i], i, values)) != null) {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
    }

    return [min, max];
  }

  var array = Array.prototype;

  var slice$1 = array.slice;

  function constant(x) {
    return function() {
      return x;
    };
  }

  function identity(x) {
    return x;
  }

  function sequence(start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

    var i = -1,
        n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
        range = new Array(n);

    while (++i < n) {
      range[i] = start + i * step;
    }

    return range;
  }

  var e10 = Math.sqrt(50),
      e5 = Math.sqrt(10),
      e2 = Math.sqrt(2);

  function ticks(start, stop, count) {
    var reverse,
        i = -1,
        n,
        ticks,
        step;

    stop = +stop, start = +start, count = +count;
    if (start === stop && count > 0) return [start];
    if (reverse = stop < start) n = start, start = stop, stop = n;
    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

    if (step > 0) {
      start = Math.ceil(start / step);
      stop = Math.floor(stop / step);
      ticks = new Array(n = Math.ceil(stop - start + 1));
      while (++i < n) ticks[i] = (start + i) * step;
    } else {
      start = Math.floor(start * step);
      stop = Math.ceil(stop * step);
      ticks = new Array(n = Math.ceil(start - stop + 1));
      while (++i < n) ticks[i] = (start - i) / step;
    }

    if (reverse) ticks.reverse();

    return ticks;
  }

  function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
  }

  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  function thresholdSturges(values) {
    return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
  }

  function histogram() {
    var value = identity,
        domain = extent,
        threshold = thresholdSturges;

    function histogram(data) {
      var i,
          n = data.length,
          x,
          values = new Array(n);

      for (i = 0; i < n; ++i) {
        values[i] = value(data[i], i, data);
      }

      var xz = domain(values),
          x0 = xz[0],
          x1 = xz[1],
          tz = threshold(values, x0, x1);

      // Convert number of thresholds into uniform thresholds.
      if (!Array.isArray(tz)) {
        tz = tickStep(x0, x1, tz);
        tz = sequence(Math.ceil(x0 / tz) * tz, x1, tz); // exclusive
      }

      // Remove any thresholds outside the domain.
      var m = tz.length;
      while (tz[0] <= x0) tz.shift(), --m;
      while (tz[m - 1] > x1) tz.pop(), --m;

      var bins = new Array(m + 1),
          bin;

      // Initialize bins.
      for (i = 0; i <= m; ++i) {
        bin = bins[i] = [];
        bin.x0 = i > 0 ? tz[i - 1] : x0;
        bin.x1 = i < m ? tz[i] : x1;
      }

      // Assign data to bins by value, ignoring any outside the domain.
      for (i = 0; i < n; ++i) {
        x = values[i];
        if (x0 <= x && x <= x1) {
          bins[bisectRight(tz, x, 0, m)].push(data[i]);
        }
      }

      return bins;
    }

    histogram.value = function(_) {
      return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
    };

    histogram.domain = function(_) {
      return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
    };

    histogram.thresholds = function(_) {
      return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice$1.call(_)) : constant(_), histogram) : threshold;
    };

    return histogram;
  }

  function quantile(values, p, valueof) {
    if (valueof == null) valueof = number;
    if (!(n = values.length)) return;
    if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
    if (p >= 1) return +valueof(values[n - 1], n - 1, values);
    var n,
        i = (n - 1) * p,
        i0 = Math.floor(i),
        value0 = +valueof(values[i0], i0, values),
        value1 = +valueof(values[i0 + 1], i0 + 1, values);
    return value0 + (value1 - value0) * (i - i0);
  }

  function max(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        max;

    if (valueof == null) {
      while (++i < n) { // Find the first comparable value.
        if ((value = values[i]) != null && value >= value) {
          max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = values[i]) != null && value > max) {
              max = value;
            }
          }
        }
      }
    }

    else {
      while (++i < n) { // Find the first comparable value.
        if ((value = valueof(values[i], i, values)) != null && value >= value) {
          max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = valueof(values[i], i, values)) != null && value > max) {
              max = value;
            }
          }
        }
      }
    }

    return max;
  }

  function mean(values, valueof) {
    var n = values.length,
        m = n,
        i = -1,
        value,
        sum = 0;

    if (valueof == null) {
      while (++i < n) {
        if (!isNaN(value = number(values[i]))) sum += value;
        else --m;
      }
    }

    else {
      while (++i < n) {
        if (!isNaN(value = number(valueof(values[i], i, values)))) sum += value;
        else --m;
      }
    }

    if (m) return sum / m;
  }

  function median(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        numbers = [];

    if (valueof == null) {
      while (++i < n) {
        if (!isNaN(value = number(values[i]))) {
          numbers.push(value);
        }
      }
    }

    else {
      while (++i < n) {
        if (!isNaN(value = number(valueof(values[i], i, values)))) {
          numbers.push(value);
        }
      }
    }

    return quantile(numbers.sort(ascending), 0.5);
  }

  function min(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        min;

    if (valueof == null) {
      while (++i < n) { // Find the first comparable value.
        if ((value = values[i]) != null && value >= value) {
          min = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = values[i]) != null && min > value) {
              min = value;
            }
          }
        }
      }
    }

    else {
      while (++i < n) { // Find the first comparable value.
        if ((value = valueof(values[i], i, values)) != null && value >= value) {
          min = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = valueof(values[i], i, values)) != null && min > value) {
              min = value;
            }
          }
        }
      }
    }

    return min;
  }

  function initRange(domain, range) {
    switch (arguments.length) {
      case 0: break;
      case 1: this.range(domain); break;
      default: this.range(range).domain(domain); break;
    }
    return this;
  }

  const implicit = Symbol("implicit");

  function ordinal() {
    var index = new Map(),
        domain = [],
        range = [],
        unknown = implicit;

    function scale(d) {
      var key = d + "", i = index.get(key);
      if (!i) {
        if (unknown !== implicit) return unknown;
        index.set(key, i = domain.push(d));
      }
      return range[(i - 1) % range.length];
    }

    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [], index = new Map();
      for (const value of _) {
        const key = value + "";
        if (index.has(key)) continue;
        index.set(key, domain.push(value));
      }
      return scale;
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), scale) : range.slice();
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    scale.copy = function() {
      return ordinal(domain, range).unknown(unknown);
    };

    initRange.apply(scale, arguments);

    return scale;
  }

  function band() {
    var scale = ordinal().unknown(undefined),
        domain = scale.domain,
        ordinalRange = scale.range,
        r0 = 0,
        r1 = 1,
        step,
        bandwidth,
        round = false,
        paddingInner = 0,
        paddingOuter = 0,
        align = 0.5;

    delete scale.unknown;

    function rescale() {
      var n = domain().length,
          reverse = r1 < r0,
          start = reverse ? r1 : r0,
          stop = reverse ? r0 : r1;
      step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
      if (round) step = Math.floor(step);
      start += (stop - start - step * (n - paddingInner)) * align;
      bandwidth = step * (1 - paddingInner);
      if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
      var values = sequence(n).map(function(i) { return start + step * i; });
      return ordinalRange(reverse ? values.reverse() : values);
    }

    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };

    scale.range = function(_) {
      return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
    };

    scale.rangeRound = function(_) {
      return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
    };

    scale.bandwidth = function() {
      return bandwidth;
    };

    scale.step = function() {
      return step;
    };

    scale.round = function(_) {
      return arguments.length ? (round = !!_, rescale()) : round;
    };

    scale.padding = function(_) {
      return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
    };

    scale.paddingInner = function(_) {
      return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
    };

    scale.paddingOuter = function(_) {
      return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
    };

    scale.align = function(_) {
      return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
    };

    scale.copy = function() {
      return band(domain(), [r0, r1])
          .round(round)
          .paddingInner(paddingInner)
          .paddingOuter(paddingOuter)
          .align(align);
    };

    return initRange.apply(rescale(), arguments);
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    copy: function(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable: function() {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
        : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
        : l === 8 ? new Rgb(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
        : l === 4 ? new Rgb((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
        : null) // invalid hex
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (-0.5 <= this.r && this.r < 255.5)
          && (-0.5 <= this.g && this.g < 255.5)
          && (-0.5 <= this.b && this.b < 255.5)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex, // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  function rgb_formatRgb() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "hsl(" : "hsla(")
          + (this.h || 0) + ", "
          + (this.s || 0) * 100 + "%, "
          + (this.l || 0) * 100 + "%"
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  function constant$1(x) {
    return function() {
      return x;
    };
  }

  function linear$1(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear$1(a, d) : constant$1(isNaN(a) ? b : a);
  }

  var rgb$1 = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb$1(start, end) {
      var r = color((start = rgb(start)).r, (end = rgb(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$1.gamma = rgbGamma;

    return rgb$1;
  })(1);

  function numberArray(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0,
        c = b.slice(),
        i;
    return function(t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }

  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  function genericArray(a, b) {
    var nb = b ? b.length : 0,
        na = a ? Math.min(nb, a.length) : 0,
        x = new Array(na),
        c = new Array(nb),
        i;

    for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];

    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function date(a, b) {
    var d = new Date;
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  function object(a, b) {
    var i = {},
        c = {},
        k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in b) {
      if (k in a) {
        i[k] = interpolate(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }

    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function string(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  function interpolate(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant$1(b)
        : (t === "number" ? interpolateNumber
        : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
        : b instanceof color ? rgb$1
        : b instanceof Date ? date
        : isNumberArray(b) ? numberArray
        : Array.isArray(b) ? genericArray
        : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
        : interpolateNumber)(a, b);
  }

  function interpolateRound(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  function constant$2(x) {
    return function() {
      return x;
    };
  }

  function number$1(x) {
    return +x;
  }

  var unit = [0, 1];

  function identity$1(x) {
    return x;
  }

  function normalize(a, b) {
    return (b -= (a = +a))
        ? function(x) { return (x - a) / b; }
        : constant$2(isNaN(b) ? NaN : 0.5);
  }

  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function(x) { return Math.max(a, Math.min(b, x)); };
  }

  // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
  function bimap(domain, range, interpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function(x) { return r0(d0(x)); };
  }

  function polymap(domain, range, interpolate) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range[i], range[i + 1]);
    }

    return function(x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target
        .domain(source.domain())
        .range(source.range())
        .interpolate(source.interpolate())
        .clamp(source.clamp())
        .unknown(source.unknown());
  }

  function transformer() {
    var domain = unit,
        range = unit,
        interpolate$1 = interpolate,
        transform,
        untransform,
        unknown,
        clamp = identity$1,
        piecewise,
        output,
        input;

    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
    }

    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
    };

    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
    };

    scale.interpolate = function(_) {
      return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }

  function continuous() {
    return transformer()(identity$1, identity$1);
  }

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimal(1.23) returns ["123", 0].
  function formatDecimal(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i, coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  function exponent(x) {
    return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i = value.length,
          t = [],
          j = 0,
          g = grouping[0],
          length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatNumerals(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }

  formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
    this.align = specifier.align === undefined ? ">" : specifier.align + "";
    this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? "" : specifier.type + "";
  }

  FormatSpecifier.prototype.toString = function() {
    return this.fill
        + this.align
        + this.sign
        + this.symbol
        + (this.zero ? "0" : "")
        + (this.width === undefined ? "" : Math.max(1, this.width | 0))
        + (this.comma ? "," : "")
        + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
        + (this.trim ? "~" : "")
        + this.type;
  };

  // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
  function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".": i0 = i1 = i; break;
        case "0": if (i0 === 0) i0 = i; i1 = i; break;
        default: if (i0 > 0) { if (!+s[i]) break out; i0 = 0; } break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient
        : i > n ? coefficient + new Array(i - n + 1).join("0")
        : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
        : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
        : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "%": function(x, p) { return (x * 100).toFixed(p); },
    "b": function(x) { return Math.round(x).toString(2); },
    "c": function(x) { return x + ""; },
    "d": function(x) { return Math.round(x).toString(10); },
    "e": function(x, p) { return x.toExponential(p); },
    "f": function(x, p) { return x.toFixed(p); },
    "g": function(x, p) { return x.toPrecision(p); },
    "o": function(x) { return Math.round(x).toString(8); },
    "p": function(x, p) { return formatRounded(x * 100, p); },
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
    "x": function(x) { return Math.round(x).toString(16); }
  };

  function identity$2(x) {
    return x;
  }

  var map = Array.prototype.map,
      prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function formatLocale(locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
        currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
        currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
        decimal = locale.decimal === undefined ? "." : locale.decimal + "",
        numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
        percent = locale.percent === undefined ? "%" : locale.percent + "",
        minus = locale.minus === undefined ? "-" : locale.minus + "",
        nan = locale.nan === undefined ? "NaN" : locale.nan + "";

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
          align = specifier.align,
          sign = specifier.sign,
          symbol = specifier.symbol,
          zero = specifier.zero,
          width = specifier.width,
          comma = specifier.comma,
          precision = specifier.precision,
          trim = specifier.trim,
          type = specifier.type;

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // The "" type, and any invalid type, is an alias for ".12~g".
      else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
          suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
          maybeSuffix = /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision === undefined ? 6
          : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
            valueSuffix = suffix,
            i, n, c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Perform the initial formatting.
          var valueNegative = value < 0;
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

          // Trim insignificant zeros.
          if (trim) value = formatTrim(value);

          // If a negative value rounds to zero during formatting, treat as positive.
          if (valueNegative && +value === 0) valueNegative = false;

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;

          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
            padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<": value = valuePrefix + value + valueSuffix + padding; break;
          case "=": value = valuePrefix + padding + value + valueSuffix; break;
          case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
          default: value = padding + valuePrefix + value + valueSuffix; break;
        }

        return numerals(value);
      }

      format.toString = function() {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
          e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
          k = Math.pow(10, -e),
          prefix = prefixes[8 + e / 3];
      return function(value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var locale;
  var format;
  var formatPrefix;

  defaultLocale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""],
    minus: "-"
  });

  function defaultLocale(definition) {
    locale = formatLocale(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count),
        precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.nice = function(count) {
      if (count == null) count = 10;

      var d = domain(),
          i0 = 0,
          i1 = d.length - 1,
          start = d[i0],
          stop = d[i1],
          step;

      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }

      step = tickIncrement(start, stop, count);

      if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
        step = tickIncrement(start, stop, count);
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
        step = tickIncrement(start, stop, count);
      }

      if (step > 0) {
        d[i0] = Math.floor(start / step) * step;
        d[i1] = Math.ceil(stop / step) * step;
        domain(d);
      } else if (step < 0) {
        d[i0] = Math.ceil(start * step) / step;
        d[i1] = Math.floor(stop * step) / step;
        domain(d);
      }

      return scale;
    };

    return scale;
  }

  function linear$2() {
    var scale = continuous();

    scale.copy = function() {
      return copy(scale, linear$2());
    };

    initRange.apply(scale, arguments);

    return linearish(scale);
  }

  /* describe/Histogram.html generated by Svelte v2.16.1 */
  var xScale_ = linear$2();
  var xScaleBand_ = band();
  var yScale_ = linear$2();

  var pct = function pct(val) {
    if (!val) return '0%';
    if (val < 0.01) return '<1%';
    return (val * 100).toFixed(0) + '%';
  };

  function NAs(_ref) {
    var values = _ref.values;
    return values.filter(function (d) {
      return typeof d === 'string' || Number.isNaN(d);
    }).length;
  }

  function stats(_ref2) {
    var validValues = _ref2.validValues,
        format = _ref2.format;
    var xmin = min(validValues);
    var xmax = max(validValues);
    var xmean = mean(validValues);
    var xmed = median(validValues);
    return [{
      x: xmin,
      label: format(xmin),
      name: 'Min'
    }, {
      x: xmax,
      label: format(xmax),
      name: 'Max'
    }, {
      x: xmean,
      label: format(xmean),
      name: __('describe / histogram / mean')
    }, {
      x: xmed,
      label: format(xmed),
      name: __('describe / histogram / median')
    }];
  }

  function validValues(_ref3) {
    var values = _ref3.values;
    return values.filter(function (d) {
      return typeof d === 'number' && !Number.isNaN(d);
    });
  }

  function ticks$1(_ref4) {
    var xScale = _ref4.xScale,
        format = _ref4.format;
    return xScale.ticks(4).map(function (x) {
      return {
        x: x,
        label: format(x)
      };
    });
  }

  function bins(_ref5) {
    var niceDomain = _ref5.niceDomain,
        validValues = _ref5.validValues;
    // const tickCnt = Math.min(_uniq(validValues).length, 14);
    var dom = niceDomain; // const classw = (s[1]-s[0]);

    var bins = histogram().domain(dom).thresholds(thresholdSturges)(validValues);

    var binWidths = _countBy(bins.map(function (b) {
      return b.x1 - b.x0;
    }));

    if (bins.length > 2 && _keys(binWidths).length > 1) {
      // check first and last bin
      var binw = bins[1].x1 - bins[1].x0;
      var lst = dom[0] + Math.ceil((dom[1] - dom[0]) / binw) * binw;
      return histogram().domain([dom[0], lst]).thresholds(_range(dom[0], lst + binw * 0.4, binw))(validValues);
    }

    return bins;
  }

  function niceDomain(_ref6) {
    var validValues = _ref6.validValues;
    return linear$2().domain(extent(validValues)).nice().domain();
  }

  function xScaleBand(_ref7) {
    var bins = _ref7.bins,
        innerWidth = _ref7.innerWidth;
    return xScaleBand_.domain(bins.map(function (d) {
      return d.x0;
    })).paddingInner(0.1).rangeRound([0, innerWidth]).align(0);
  }

  function xScale(_ref8) {
    var niceDomain = _ref8.niceDomain,
        bins = _ref8.bins,
        xScaleBand = _ref8.xScaleBand;
    return xScale_.domain(niceDomain).rangeRound([0, xScaleBand.step() * bins.length]);
  }

  function yScale(_ref9) {
    var innerHeight = _ref9.innerHeight,
        bins = _ref9.bins;
    return yScale_.domain([0, max(bins, function (d) {
      return d.length;
    })]).range([innerHeight, 0]);
  }

  function barWidth(_ref10) {
    var bins = _ref10.bins,
        xScale = _ref10.xScale;
    return xScale(bins[0].x1) - xScale(bins[0].x0) - 1;
  }

  function innerWidth(_ref11) {
    var width = _ref11.width,
        padding = _ref11.padding;
    return width - padding.left - padding.right;
  }

  function innerHeight(_ref12) {
    var height = _ref12.height,
        padding = _ref12.padding;
    return height - padding.bottom - padding.top;
  }

  function data$7() {
    return {
      format: function format(d) {
        return d;
      },
      t: 0,
      padding: {
        top: 10,
        right: 65,
        bottom: 20,
        left: 5
      },
      height: 200,
      width: 500,
      values: [],
      highlight: false
    };
  }

  function tooltip(bin, i, bins, len) {
    var tt = i === 0 ? __('describe / histogram / tooltip / first') : i === bins.length - 1 ? __('describe / histogram / tooltip / last') : __('describe / histogram / tooltip');
    return tt.replace('$1', bin.length).replace('$2', pct(bin.length / len)).replace('$3', toFixed(bin.x0)).replace('$4', toFixed(bin.x1));
  }
  var methods$3 = {
    show: function show(value) {
      this.set({
        highlight: value
      });
    },
    resize: function resize() {
      var bcr = this.refs.svg.getBoundingClientRect();
      this.set({
        width: bcr.right - bcr.left,
        height: bcr.bottom - bcr.top
      });
    }
  };

  function oncreate$2() {
    this.resize();
  }
  var file$6 = "describe/Histogram.html";

  function mouseenter_handler(event) {
    var _this$_svelte = this._svelte,
        component = _this$_svelte.component,
        ctx = _this$_svelte.ctx;
    component.show(ctx.s);
  }

  function mouseleave_handler(event) {
    var component = this._svelte.component;
    component.show(false);
  }

  function get_each2_context(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.s = list[i];
    return child_ctx;
  }

  function get_each1_context(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.bin = list[i];
    child_ctx.i = i;
    return child_ctx;
  }

  function get_each0_context(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.tick = list[i];
    return child_ctx;
  }

  function create_main_fragment$7(component, ctx) {
    var h3,
        text0_value = __('describe / histogram'),
        text0,
        text1,
        svg,
        g2,
        g0,
        each0_anchor,
        g0_transform_value,
        g1,
        g2_transform_value,
        text2,
        ul,
        text3,
        text4,
        p,
        raw_value = __("describe / histogram / learn-more");

    var each0_value = ctx.ticks;
    var each0_blocks = [];

    for (var i = 0; i < each0_value.length; i += 1) {
      each0_blocks[i] = create_each_block_2$1(component, get_each0_context(ctx, each0_value, i));
    }

    var if_block0 = ctx.highlight && create_if_block_1$3(component, ctx);
    var each1_value = ctx.bins;
    var each1_blocks = [];

    for (var i = 0; i < each1_value.length; i += 1) {
      each1_blocks[i] = create_each_block_1$2(component, get_each1_context(ctx, each1_value, i));
    }

    var each2_value = ctx.stats;
    var each2_blocks = [];

    for (var i = 0; i < each2_value.length; i += 1) {
      each2_blocks[i] = create_each_block$2(component, get_each2_context(ctx, each2_value, i));
    }

    var if_block1 = ctx.NAs > 0 && create_if_block$6(component, ctx);
    return {
      c: function create() {
        h3 = createElement("h3");
        text0 = createText(text0_value);
        text1 = createText("\n");
        svg = createSvgElement("svg");
        g2 = createSvgElement("g");
        g0 = createSvgElement("g");

        for (var i = 0; i < each0_blocks.length; i += 1) {
          each0_blocks[i].c();
        }

        each0_anchor = createComment();
        if (if_block0) if_block0.c();
        g1 = createSvgElement("g");

        for (var i = 0; i < each1_blocks.length; i += 1) {
          each1_blocks[i].c();
        }

        text2 = createText("\n");
        ul = createElement("ul");

        for (var i = 0; i < each2_blocks.length; i += 1) {
          each2_blocks[i].c();
        }

        text3 = createText(" ");
        if (if_block1) if_block1.c();
        text4 = createText("\n");
        p = createElement("p");
        h3.className = "svelte-p5ucpx";
        addLoc(h3, file$6, 0, 0, 0);
        setAttribute(g0, "class", "axis x-axis svelte-p5ucpx");
        setAttribute(g0, "transform", g0_transform_value = "translate(0, " + ctx.innerHeight + ")");
        addLoc(g0, file$6, 4, 8, 140);
        setAttribute(g1, "class", "bars svelte-p5ucpx");
        addLoc(g1, file$6, 27, 8, 1085);
        setAttribute(g2, "transform", g2_transform_value = "translate(" + [ctx.padding.left, ctx.padding.top] + ")");
        addLoc(g2, file$6, 3, 4, 76);
        setAttribute(svg, "class", "svelte-p5ucpx");
        addLoc(svg, file$6, 1, 0, 38);
        ul.className = "svelte-p5ucpx";
        addLoc(ul, file$6, 37, 0, 1503);
        p.className = "learn-more";
        addLoc(p, file$6, 47, 0, 1804);
      },
      m: function mount(target, anchor) {
        insert(target, h3, anchor);
        append(h3, text0);
        insert(target, text1, anchor);
        insert(target, svg, anchor);
        append(svg, g2);
        append(g2, g0);

        for (var i = 0; i < each0_blocks.length; i += 1) {
          each0_blocks[i].m(g0, null);
        }

        append(g0, each0_anchor);
        if (if_block0) if_block0.m(g0, null);
        append(g2, g1);

        for (var i = 0; i < each1_blocks.length; i += 1) {
          each1_blocks[i].m(g1, null);
        }

        component.refs.svg = svg;
        insert(target, text2, anchor);
        insert(target, ul, anchor);

        for (var i = 0; i < each2_blocks.length; i += 1) {
          each2_blocks[i].m(ul, null);
        }

        append(ul, text3);
        if (if_block1) if_block1.m(ul, null);
        insert(target, text4, anchor);
        insert(target, p, anchor);
        p.innerHTML = raw_value;
      },
      p: function update(changed, ctx) {
        if (changed.xScale || changed.ticks) {
          each0_value = ctx.ticks;

          for (var i = 0; i < each0_value.length; i += 1) {
            var child_ctx = get_each0_context(ctx, each0_value, i);

            if (each0_blocks[i]) {
              each0_blocks[i].p(changed, child_ctx);
            } else {
              each0_blocks[i] = create_each_block_2$1(component, child_ctx);
              each0_blocks[i].c();
              each0_blocks[i].m(g0, each0_anchor);
            }
          }

          for (; i < each0_blocks.length; i += 1) {
            each0_blocks[i].d(1);
          }

          each0_blocks.length = each0_value.length;
        }

        if (ctx.highlight) {
          if (if_block0) {
            if_block0.p(changed, ctx);
          } else {
            if_block0 = create_if_block_1$3(component, ctx);
            if_block0.c();
            if_block0.m(g0, null);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (changed.innerHeight && g0_transform_value !== (g0_transform_value = "translate(0, " + ctx.innerHeight + ")")) {
          setAttribute(g0, "transform", g0_transform_value);
        }

        if (changed.xScaleBand || changed.bins || changed.yScale || changed.innerHeight || changed.validValues) {
          each1_value = ctx.bins;

          for (var i = 0; i < each1_value.length; i += 1) {
            var _child_ctx = get_each1_context(ctx, each1_value, i);

            if (each1_blocks[i]) {
              each1_blocks[i].p(changed, _child_ctx);
            } else {
              each1_blocks[i] = create_each_block_1$2(component, _child_ctx);
              each1_blocks[i].c();
              each1_blocks[i].m(g1, null);
            }
          }

          for (; i < each1_blocks.length; i += 1) {
            each1_blocks[i].d(1);
          }

          each1_blocks.length = each1_value.length;
        }

        if (changed.padding && g2_transform_value !== (g2_transform_value = "translate(" + [ctx.padding.left, ctx.padding.top] + ")")) {
          setAttribute(g2, "transform", g2_transform_value);
        }

        if (changed.stats) {
          each2_value = ctx.stats;

          for (var i = 0; i < each2_value.length; i += 1) {
            var _child_ctx2 = get_each2_context(ctx, each2_value, i);

            if (each2_blocks[i]) {
              each2_blocks[i].p(changed, _child_ctx2);
            } else {
              each2_blocks[i] = create_each_block$2(component, _child_ctx2);
              each2_blocks[i].c();
              each2_blocks[i].m(ul, text3);
            }
          }

          for (; i < each2_blocks.length; i += 1) {
            each2_blocks[i].d(1);
          }

          each2_blocks.length = each2_value.length;
        }

        if (ctx.NAs > 0) {
          if (if_block1) {
            if_block1.p(changed, ctx);
          } else {
            if_block1 = create_if_block$6(component, ctx);
            if_block1.c();
            if_block1.m(ul, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(h3);
          detachNode(text1);
          detachNode(svg);
        }

        destroyEach(each0_blocks, detach);
        if (if_block0) if_block0.d();
        destroyEach(each1_blocks, detach);
        if (component.refs.svg === svg) component.refs.svg = null;

        if (detach) {
          detachNode(text2);
          detachNode(ul);
        }

        destroyEach(each2_blocks, detach);
        if (if_block1) if_block1.d();

        if (detach) {
          detachNode(text4);
          detachNode(p);
        }
      }
    };
  } // (6:12) {#each ticks as tick}


  function create_each_block_2$1(component, ctx) {
    var g,
        line,
        text1,
        text0_value = ctx.tick.label,
        text0,
        g_transform_value;
    return {
      c: function create() {
        g = createSvgElement("g");
        line = createSvgElement("line");
        text1 = createSvgElement("text");
        text0 = createText(text0_value);
        setAttribute(line, "y2", "3");
        setAttribute(line, "class", "svelte-p5ucpx");
        addLoc(line, file$6, 7, 16, 325);
        setAttribute(text1, "y", "5");
        setAttribute(text1, "class", "svelte-p5ucpx");
        addLoc(text1, file$6, 8, 16, 357);
        setAttribute(g, "class", "tick svelte-p5ucpx");
        setAttribute(g, "transform", g_transform_value = "translate(" + ctx.xScale(ctx.tick.x) + ",0)");
        addLoc(g, file$6, 6, 12, 250);
      },
      m: function mount(target, anchor) {
        insert(target, g, anchor);
        append(g, line);
        append(g, text1);
        append(text1, text0);
      },
      p: function update(changed, ctx) {
        if (changed.ticks && text0_value !== (text0_value = ctx.tick.label)) {
          setData(text0, text0_value);
        }

        if ((changed.xScale || changed.ticks) && g_transform_value !== (g_transform_value = "translate(" + ctx.xScale(ctx.tick.x) + ",0)")) {
          setAttribute(g, "transform", g_transform_value);
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(g);
        }
      }
    };
  } // (11:20) {#if highlight}


  function create_if_block_1$3(component, ctx) {
    var polygon, polygon_transform_value;
    return {
      c: function create() {
        polygon = createSvgElement("polygon");
        setAttribute(polygon, "transform", polygon_transform_value = "translate(" + ctx.xScale(ctx.highlight.x) + ",0)");
        setAttribute(polygon, "points", "0,0,4,6,-4,6");
        addLoc(polygon, file$6, 11, 12, 454);
      },
      m: function mount(target, anchor) {
        insert(target, polygon, anchor);
      },
      p: function update(changed, ctx) {
        if ((changed.xScale || changed.highlight) && polygon_transform_value !== (polygon_transform_value = "translate(" + ctx.xScale(ctx.highlight.x) + ",0)")) {
          setAttribute(polygon, "transform", polygon_transform_value);
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(polygon);
        }
      }
    };
  } // (29:12) {#each bins as bin, i}


  function create_each_block_1$2(component, ctx) {
    var g,
        title,
        text_value = tooltip(ctx.bin, ctx.i, ctx.bins, ctx.validValues.length),
        text,
        rect,
        rect_width_value,
        rect_height_value,
        g_transform_value;
    return {
      c: function create() {
        g = createSvgElement("g");
        title = createSvgElement("title");
        text = createText(text_value);
        rect = createSvgElement("rect");
        addLoc(title, file$6, 30, 16, 1246);
        setAttribute(rect, "width", rect_width_value = ctx.bin.x1 != ctx.bin.x0 ? ctx.xScaleBand.bandwidth() : 20);
        setAttribute(rect, "height", rect_height_value = ctx.innerHeight - ctx.yScale(ctx.bin.length));
        setAttribute(rect, "class", "svelte-p5ucpx");
        addLoc(rect, file$6, 31, 16, 1318);
        setAttribute(g, "class", "bar");
        setAttribute(g, "transform", g_transform_value = "translate(" + ctx.xScaleBand(ctx.bin.x0) + "," + ctx.yScale(ctx.bin.length) + ")");
        addLoc(g, file$6, 29, 12, 1149);
      },
      m: function mount(target, anchor) {
        insert(target, g, anchor);
        append(g, title);
        append(title, text);
        append(g, rect);
      },
      p: function update(changed, ctx) {
        if ((changed.bins || changed.validValues) && text_value !== (text_value = tooltip(ctx.bin, ctx.i, ctx.bins, ctx.validValues.length))) {
          setData(text, text_value);
        }

        if ((changed.bins || changed.xScaleBand) && rect_width_value !== (rect_width_value = ctx.bin.x1 != ctx.bin.x0 ? ctx.xScaleBand.bandwidth() : 20)) {
          setAttribute(rect, "width", rect_width_value);
        }

        if ((changed.innerHeight || changed.yScale || changed.bins) && rect_height_value !== (rect_height_value = ctx.innerHeight - ctx.yScale(ctx.bin.length))) {
          setAttribute(rect, "height", rect_height_value);
        }

        if ((changed.xScaleBand || changed.bins || changed.yScale) && g_transform_value !== (g_transform_value = "translate(" + ctx.xScaleBand(ctx.bin.x0) + "," + ctx.yScale(ctx.bin.length) + ")")) {
          setAttribute(g, "transform", g_transform_value);
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(g);
        }
      }
    };
  } // (39:4) {#each stats as s}


  function create_each_block$2(component, ctx) {
    var li,
        text0_value = ctx.s.name,
        text0,
        text1,
        tt,
        text2_value = ctx.s.label,
        text2;
    return {
      c: function create() {
        li = createElement("li");
        text0 = createText(text0_value);
        text1 = createText(": ");
        tt = createElement("tt");
        text2 = createText(text2_value);
        tt._svelte = {
          component: component,
          ctx: ctx
        };
        addListener(tt, "mouseleave", mouseleave_handler);
        addListener(tt, "mouseenter", mouseenter_handler);
        tt.className = "svelte-p5ucpx";
        addLoc(tt, file$6, 39, 18, 1549);
        li.className = "svelte-p5ucpx";
        addLoc(li, file$6, 39, 4, 1535);
      },
      m: function mount(target, anchor) {
        insert(target, li, anchor);
        append(li, text0);
        append(li, text1);
        append(li, tt);
        append(tt, text2);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;

        if (changed.stats && text0_value !== (text0_value = ctx.s.name)) {
          setData(text0, text0_value);
        }

        if (changed.stats && text2_value !== (text2_value = ctx.s.label)) {
          setData(text2, text2_value);
        }

        tt._svelte.ctx = ctx;
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(li);
        }

        removeListener(tt, "mouseleave", mouseleave_handler);
        removeListener(tt, "mouseenter", mouseenter_handler);
      }
    };
  } // (41:12) {#if NAs>0}


  function create_if_block$6(component, ctx) {
    var li,
        text0_value = __('describe / histogram / invalid'),
        text0,
        text1,
        tt,
        text2,
        text3,
        text4_value = pct(ctx.NAs / ctx.values.length),
        text4,
        text5;

    return {
      c: function create() {
        li = createElement("li");
        text0 = createText(text0_value);
        text1 = createText(":\n        ");
        tt = createElement("tt");
        text2 = createText(ctx.NAs);
        text3 = createText(" (");
        text4 = createText(text4_value);
        text5 = createText(")");
        setStyle(tt, "color", "#c71e1d");
        tt.className = "svelte-p5ucpx";
        addLoc(tt, file$6, 43, 8, 1714);
        li.className = "svelte-p5ucpx";
        addLoc(li, file$6, 41, 4, 1653);
      },
      m: function mount(target, anchor) {
        insert(target, li, anchor);
        append(li, text0);
        append(li, text1);
        append(li, tt);
        append(tt, text2);
        append(li, text3);
        append(li, text4);
        append(li, text5);
      },
      p: function update(changed, ctx) {
        if (changed.NAs) {
          setData(text2, ctx.NAs);
        }

        if ((changed.NAs || changed.values) && text4_value !== (text4_value = pct(ctx.NAs / ctx.values.length))) {
          setData(text4, text4_value);
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(li);
        }
      }
    };
  }

  function Histogram(options) {
    var _this = this;

    this._debugName = '<Histogram>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this.refs = {};
    this._state = assign(data$7(), options.data);

    this._recompute({
      values: 1,
      validValues: 1,
      format: 1,
      niceDomain: 1,
      width: 1,
      padding: 1,
      bins: 1,
      innerWidth: 1,
      xScaleBand: 1,
      xScale: 1,
      height: 1,
      innerHeight: 1
    }, this._state);

    if (!('values' in this._state)) console.warn("<Histogram> was created without expected data property 'values'");
    if (!('format' in this._state)) console.warn("<Histogram> was created without expected data property 'format'");
    if (!('width' in this._state)) console.warn("<Histogram> was created without expected data property 'width'");
    if (!('padding' in this._state)) console.warn("<Histogram> was created without expected data property 'padding'");
    if (!('height' in this._state)) console.warn("<Histogram> was created without expected data property 'height'");
    if (!('highlight' in this._state)) console.warn("<Histogram> was created without expected data property 'highlight'");
    this._intro = true;
    this._fragment = create_main_fragment$7(this, this._state);

    this.root._oncreate.push(function () {
      oncreate$2.call(_this);

      _this.fire("update", {
        changed: assignTrue({}, _this._state),
        current: _this._state
      });
    });

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);

      flush(this);
    }
  }

  assign(Histogram.prototype, protoDev);
  assign(Histogram.prototype, methods$3);

  Histogram.prototype._checkReadOnly = function _checkReadOnly(newState) {
    if ('NAs' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'NAs'");
    if ('validValues' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'validValues'");
    if ('stats' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'stats'");
    if ('niceDomain' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'niceDomain'");
    if ('bins' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'bins'");
    if ('innerWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'innerWidth'");
    if ('xScaleBand' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'xScaleBand'");
    if ('xScale' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'xScale'");
    if ('ticks' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'ticks'");
    if ('innerHeight' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'innerHeight'");
    if ('yScale' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'yScale'");
    if ('barWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Histogram>: Cannot set read-only property 'barWidth'");
  };

  Histogram.prototype._recompute = function _recompute(changed, state) {
    if (changed.values) {
      if (this._differs(state.NAs, state.NAs = NAs(state))) changed.NAs = true;
      if (this._differs(state.validValues, state.validValues = validValues(state))) changed.validValues = true;
    }

    if (changed.validValues || changed.format) {
      if (this._differs(state.stats, state.stats = stats(state))) changed.stats = true;
    }

    if (changed.validValues) {
      if (this._differs(state.niceDomain, state.niceDomain = niceDomain(state))) changed.niceDomain = true;
    }

    if (changed.niceDomain || changed.validValues) {
      if (this._differs(state.bins, state.bins = bins(state))) changed.bins = true;
    }

    if (changed.width || changed.padding) {
      if (this._differs(state.innerWidth, state.innerWidth = innerWidth(state))) changed.innerWidth = true;
    }

    if (changed.bins || changed.innerWidth) {
      if (this._differs(state.xScaleBand, state.xScaleBand = xScaleBand(state))) changed.xScaleBand = true;
    }

    if (changed.niceDomain || changed.bins || changed.xScaleBand) {
      if (this._differs(state.xScale, state.xScale = xScale(state))) changed.xScale = true;
    }

    if (changed.xScale || changed.format) {
      if (this._differs(state.ticks, state.ticks = ticks$1(state))) changed.ticks = true;
    }

    if (changed.height || changed.padding) {
      if (this._differs(state.innerHeight, state.innerHeight = innerHeight(state))) changed.innerHeight = true;
    }

    if (changed.innerHeight || changed.bins) {
      if (this._differs(state.yScale, state.yScale = yScale(state))) changed.yScale = true;
    }

    if (changed.bins || changed.xScale) {
      if (this._differs(state.barWidth, state.barWidth = barWidth(state))) changed.barWidth = true;
    }
  };

  var TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  var COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  var defaultAllowed = '<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';
  /**
   * Remove all non-whitelisted html tags from the given string
   *
   * @exports purifyHTML
   * @kind function
   *
   * @param {string} input - dirty html input
   * @param {string} allowed - list of allowed tags, defaults to `<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>`
   * @return {string} - the cleaned html output
   */

  function purifyHTML(input, allowed) {
    /*
     * written by Kevin van Zonneveld et.al.
     * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
     */
    if (input === null) return null;
    if (input === undefined) return undefined;
    input = String(input); // strip tags

    if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
      return input;
    }

    input = stripTags(input, allowed); // remove all event attributes

    if (typeof document === 'undefined') return input;
    var d = document.createElement('div');
    d.innerHTML = input;
    var sel = d.querySelectorAll('*');

    for (var i = 0; i < sel.length; i++) {
      if (sel[i].nodeName.toLowerCase() === 'a') {
        // special treatment for <a> elements
        if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
        sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
      }

      for (var j = 0; j < sel[i].attributes.length; j++) {
        var attrib = sel[i].attributes[j];

        if (attrib.specified) {
          if (attrib.name.substr(0, 2) === 'on') sel[i].removeAttribute(attrib.name);
        }
      }
    }

    return d.innerHTML;
  }

  function stripTags(input, allowed) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = (((allowed !== undefined ? allowed || '' : defaultAllowed) + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    var before = input;
    var after = input; // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')

    while (true) {
      before = after;
      after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
      }); // return once no more tags are removed

      if (before === after) {
        return after;
      }
    }
  }

  /**
   * getCellRenderer defines what classes are set on each HOT cell
   */

  function getCellRenderer (app, chart, dataset, Handsontable) {
    var colTypeIcons = {
      date: 'fa fa-clock-o'
    };

    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
      var escaped = purifyHTML(Handsontable.helper.stringify(value));
      TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
    }

    return function (instance, td, row, col, prop, value, cellProperties) {
      if (dataset.numColumns() <= col || !dataset.hasColumn(col)) return;
      var column = dataset.column(col);

      var _app$get = app.get(),
          searchResults = _app$get.searchResults,
          currentResult = _app$get.currentResult,
          activeColumn = _app$get.activeColumn;

      var colFormat = app.getColumnFormat(column.name());
      row = instance.toPhysicalRow(row);

      if (row > 0) {
        var formatter = chart.columnFormatter(column);
        value = formatter(column.val(row - 1), true);
      }

      if (parseInt(value) < 0) {
        // if row contains negative number
        td.classList.add('negative');
      }

      td.classList.add(column.type() + 'Type');
      td.dataset.column = col;

      if (column.type() === 'text' && value && value.length > 70) {
        value = value.substr(0, 60) + '…';
      }

      if (row === 0) {
        td.classList.add('firstRow');

        if (colTypeIcons[column.type()]) {
          value = '<i class="' + colTypeIcons[column.type()] + '"></i> ' + value;
        }
      } else {
        td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
      }

      if (colFormat.ignore) {
        td.classList.add('ignored');
      }

      if (activeColumn && activeColumn.name() === column.name()) {
        td.classList.add('active');
      }

      var rowPosition = Handsontable.hooks.run(instance, 'modifyRow', row); // const rowPosition = row; // instance.getPlugin('columnSorting').untranslateRow(row);

      searchResults.forEach(function (res) {
        if (res.row === rowPosition && res.col === col) {
          td.classList.add('htSearchResult');
        }
      });

      if (currentResult && currentResult.row === rowPosition && currentResult.col === col) {
        td.classList.add('htCurrentSearchResult');
      }

      if (row > 0 && !column.type(true).isValid(column.val(row - 1))) {
        td.classList.add('parsingError');
      }

      if (cellProperties.readOnly) td.classList.add('readOnly');

      if (chart.dataCellChanged(col, row)) {
        td.classList.add('changed');
      }

      HtmlCellRender(instance, td, row, col, prop, value); // Reflect.apply(HtmlCellRender, this, arguments);
    };
  }

  var app = null;
  var searchTimer = null;

  function currentResult(_ref) {
    var searchResults = _ref.searchResults,
        searchIndex = _ref.searchIndex;
    if (!searchResults || !searchResults.length) return null;
    var l = searchResults.length;

    if (searchIndex < 0 || searchIndex >= l) {
      while (searchIndex < 0) {
        searchIndex += l;
      }

      if (searchIndex > l) searchIndex %= l;
    }

    return searchResults[searchIndex];
  }

  function data$8() {
    return {
      hot: null,
      data: '',
      readonly: false,
      skipRows: 0,
      firstRowIsHeader: true,
      fixedColumnsLeft: 0,
      searchIndex: 0,
      sortBy: '-',
      transpose: false,
      activeColumn: null,
      search: '',
      searchResults: []
    };
  }
  var methods$4 = {
    render: function render() {
      var _this$get = this.get(),
          hot = _this$get.hot;

      hot.render();
    },
    doSearch: function doSearch() {
      var _this = this;

      var _this$get2 = this.get(),
          hot = _this$get2.hot,
          search = _this$get2.search;

      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        if (!hot || !search) {
          _this.set({
            searchResults: []
          });
        } else {
          var searchPlugin = hot.getPlugin('search');
          var searchResults = searchPlugin.query(search);

          _this.set({
            searchResults: searchResults
          });
        }
      }, 300);
    },
    update: function update() {
      var _this2 = this;

      var _this$get3 = this.get(),
          data = _this$get3.data,
          transpose = _this$get3.transpose,
          firstRowIsHeader = _this$get3.firstRowIsHeader,
          skipRows = _this$get3.skipRows,
          hot = _this$get3.hot;

      if (!data) return; // get chart

      var _this$store$get = this.store.get(),
          dw_chart = _this$store$get.dw_chart; // pass dataset through chart to apply changes and computed columns


      var ds = dw_chart.dataset(dw.datasource.delimited({
        csv: data,
        transpose: transpose,
        firstRowIsHeader: firstRowIsHeader,
        skipRows: skipRows
      }).parse()).dataset();
      this.set({
        columnOrder: ds.columnOrder()
      }); // construct HoT data array

      var hotData = [[]];
      ds.eachColumn(function (c) {
        return hotData[0].push(c.title());
      });
      ds.eachRow(function (r) {
        var row = [];
        ds.eachColumn(function (col) {
          return row.push(col.raw(r));
        });
        hotData.push(row);
      }); // pass data to hot

      hot.loadData(hotData);
      var cellRenderer = getCellRenderer(this, dw_chart, ds, HOT);
      hot.updateSettings({
        cells: function cells(row, col) {
          var _this2$get = _this2.get(),
              readonly = _this2$get.readonly;

          return {
            readOnly: readonly || ds.hasColumn(col) && ds.column(col).isComputed && row === 0,
            renderer: cellRenderer
          };
        },
        manualColumnMove: []
      });
      this.set({
        ds: ds
      });
      this.set({
        has_changes: clone(chart.get('metadata.data.changes', [])).length > 0
      });
      HOT.hooks.once('afterRender', function () {
        return _this2.initCustomEvents();
      });
      hot.render();
    },
    dataChanged: function dataChanged(cells) {
      var _this3 = this;

      var _this$get4 = this.get(),
          hot = _this$get4.hot;

      var changed = false;
      cells.forEach(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 4),
            row = _ref3[0],
            col = _ref3[1],
            oldValue = _ref3[2],
            newValue = _ref3[3];

        if (oldValue !== newValue) {
          var _chart = _this3.store.get().dw_chart;

          var _this3$get = _this3.get(),
              transpose = _this3$get.transpose;

          var changes = clone(_chart.get('metadata.data.changes', []));
          row = hot.toPhysicalRow(row);
          col = _chart.dataset().columnOrder()[col];

          if (transpose) {
            // swap row and col
            var tmp = row;
            row = col;
            col = tmp;
          } // store new change


          changes.push({
            column: col,
            row: row,
            value: newValue,
            previous: oldValue,
            time: new Date().getTime()
          });

          _chart.set('metadata.data.changes', changes);

          changed = true;
        }
      });

      if (changed) {
        setTimeout(function () {
          _this3.update();

          chart.save();
        }, 100);
      }
    },
    columnMoved: function columnMoved(srcColumns, tgtIndex) {
      var _this4 = this;

      var _this$get5 = this.get(),
          hot = _this$get5.hot;

      if (!srcColumns.length) return;

      var _this$get6 = this.get(),
          columnOrder = _this$get6.columnOrder;

      var newOrder = columnOrder.slice(0);
      var after = columnOrder[tgtIndex];
      var elements = newOrder.splice(srcColumns[0], srcColumns.length);
      var insertAt = after === undefined ? newOrder.length : after ? newOrder.indexOf(after) : 0;
      newOrder.splice.apply(newOrder, [insertAt, 0].concat(_toConsumableArray(elements)));
      this.store.get().dw_chart.set('metadata.data.column-order', newOrder.slice(0));
      this.set({
        columnOrder: newOrder
      }); // update selection

      HOT.hooks.once('afterRender', function () {
        setTimeout(function () {
          _this4.fire('resetSort');

          hot.selectCell(0, insertAt, hot.countRows() - 1, insertAt + elements.length - 1);
        }, 10);
      });
      this.update();
    },
    updateHeight: function updateHeight() {
      var h = document.querySelector('.ht_master.handsontable .wtHolder .wtHider').getBoundingClientRect().height;
      this.refs.hot.style.height = Math.min(500, h + 10) + 'px';
    },
    checkRange: function checkRange(r, c, r2, c2) {
      // check if
      // 1. only a single column is selected, and
      // 2. the range starts at the first row, and
      // 3. the range extends through he last row
      var _this$get7 = this.get(),
          hot = _this$get7.hot;

      var _this$get8 = this.get(),
          ds = _this$get8.ds;

      if (c === c2 && r === 0 && r2 === hot.countRows() - 1) {
        // const chart = this.store.get('dw_chart');
        // this.set({activeColumn: chart.dataset().column(c)});
        return;
      }

      if (c !== c2 && r === 0 && r2 === hot.countRows() - 1) {
        var sel = [];

        for (var i = Math.min(c, c2); i <= Math.max(c, c2); i++) {
          sel.push(+document.querySelector("#data-preview .htCore tbody tr:first-child td:nth-child(".concat(i + 2, ")")).dataset.column);
        }

        this.set({
          multiSelection: sel.map(function (i) {
            return ds.column(i);
          }),
          activeColumn: null
        });
        return;
      }

      this.set({
        activeColumn: null,
        multiSelection: false
      });
    },
    initCustomEvents: function initCustomEvents() {
      var _this5 = this;

      // wait a bit to make sure HoT is rendered
      setTimeout(function () {
        // catch click events on A,B,C,D... header row
        _this5.refs.hot.querySelectorAll('.htCore thead th:first-child').forEach(function (th) {
          th.removeEventListener('click', topLeftCornerClick);
          th.addEventListener('click', topLeftCornerClick);
        }); // const cellHeaderClickHandler = cellHeaderClick(app);


        _this5.refs.hot.querySelectorAll('.htCore thead th+th').forEach(function (th) {
          th.removeEventListener('click', cellHeaderClick);
          th.addEventListener('click', cellHeaderClick);
        });
      }, 500);
    },
    getColumnFormat: function getColumnFormat(name) {
      var _this$store$get2 = this.store.get(),
          dw_chart = _this$store$get2.dw_chart;

      var colFormats = dw_chart.get('metadata.data.column-format', {});
      return colFormats[name] || {
        type: 'auto',
        ignore: false
      };
    }
  };

  function oncreate$3() {
    var _this6 = this;

    app = this;
    HOT.hooks.once('afterRender', function () {
      return _this6.initCustomEvents();
    });
    window.addEventListener('keyup', function (evt) {
      var _this6$get = _this6.get(),
          activeColumn = _this6$get.activeColumn,
          ds = _this6$get.ds;

      if (!activeColumn) return;
      if (evt.target.tagName.toLowerCase() === 'input' || evt.target.tagName.toLowerCase() === 'textarea') return;

      if (evt.key === 'ArrowRight' || evt.key === 'ArrowLeft') {
        evt.preventDefault();
        evt.stopPropagation();
        var currentIndex = ds.indexOf(activeColumn.name());

        if (evt.key === 'ArrowRight') {
          // select next column
          _this6.set({
            activeColumn: ds.column((currentIndex + 1) % ds.numColumns())
          });
        } else {
          // select prev column
          _this6.set({
            activeColumn: ds.column((currentIndex - 1 + ds.numColumns()) % ds.numColumns())
          });
        }
      }
    });

    var _this$store$get3 = this.store.get(),
        dw_chart = _this$store$get3.dw_chart;

    console.log(this.refs.hot);
    var hot = new HOT(this.refs.hot, {
      data: [],
      rowHeaders: function rowHeaders(i) {
        var ti = HOT.hooks.run(hot, 'modifyRow', i); // const ti = hot.getPlugin('ColumnSorting').translateRow(i);

        return ti + 1;
      },
      colHeaders: true,
      fixedRowsTop: 1,
      fixedColumnsLeft: this.get().fixedColumnsLeft,
      filters: true,
      // dropdownMenu: true,
      startRows: 13,
      startCols: 8,
      fillHandle: false,
      stretchH: 'all',
      height: 500,
      manualColumnMove: true,
      selectionMode: 'range',
      autoColumnSize: {
        useHeaders: true,
        syncLimit: 5
      },
      // // sorting
      sortIndicator: true,
      columnSorting: true,
      sortFunction: function sortFunction(sortOrder, columnMeta) {
        console.log('compareFunctionFactory', {
          sortOrder: sortOrder,
          columnMeta: columnMeta
        });

        if (columnMeta.col > -1) {
          var column = dw_chart.dataset().column(columnMeta.col);
          var colType = column.type();
          var plugin = hot.getPlugin('columnSorting');
          return function (a, b) {
            if (a[0] === 0) return -1; // replace with values

            a[1] = column.val(a[0] - 1);
            b[1] = column.val(b[0] - 1);

            if (colType === 'number') {
              // sort NaNs at bottom
              if (isNaN(a[1])) a[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
              if (isNaN(b[1])) b[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
            }

            if (colType === 'date') {
              if (typeof a[1] === 'string') a[1] = new Date(110, 0, 1);
              if (typeof b[1] === 'string') b[1] = new Date(110, 0, 1);
            }

            return (sortOrder === 'desc' ? -1 : 1) * (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0);
          };
        }

        return function (a, b) {
          return a[0] - b[0];
        };
      },
      afterGetColHeader: function afterGetColHeader(col, th) {
        var _this6$get2 = _this6.get(),
            activeColumn = _this6$get2.activeColumn,
            ds = _this6$get2.ds;

        if (!ds || !ds.hasColumn(col)) return;

        if ((col === 0 || col) && activeColumn && ds.column(col).name() === activeColumn.name()) {
          th.classList.add('selected');
        }

        if (col === 0 || col) {
          if (_this6.getColumnFormat(ds.column(col).name()).ignore) {
            th.classList.add('ignored');
          } else {
            th.classList.remove('ignored');
          }
        }
      },
      // // search
      search: 'search'
    });
    window.HT = hot;
    this.set({
      hot: hot
    });
    console.log('done', hot.getPlugin('ColumnSorting'));
    HOT.hooks.add('afterSetDataAtCell', function (a) {
      return _this6.dataChanged(a);
    });
    HOT.hooks.add('afterColumnMove', function (a, b) {
      return _this6.columnMoved(a, b);
    });
    HOT.hooks.add('afterRender', function () {
      return _this6.updateHeight();
    });
    HOT.hooks.add('afterSelection', function (r, c, r2, c2) {
      return _this6.checkRange(r, c, r2, c2);
    });
  }

  function onstate(_ref4) {
    var changed = _ref4.changed,
        current = _ref4.current,
        previous = _ref4.previous;
    var hot = current.hot;
    if (!hot) return;

    if (changed.data) {
      this.update();
    }

    if (changed.firstRowIsHeader && previous && previous.firstRowIsHeader !== undefined) {
      this.update();
    }

    if (changed.hot) {
      this.update();
    }

    if (changed.search && previous) {
      this.doSearch();
      this.set({
        searchIndex: 0
      });
    }

    if (changed.searchResults) {
      hot.render();
    }

    if (changed.currentResult && current.currentResult) {
      hot.render();
      var res = current.currentResult;
      hot.scrollViewportTo(res.row, res.col);
      setTimeout(function () {
        // one more time
        hot.scrollViewportTo(res.row, res.col);
      }, 100);
    }

    if (changed.activeColumn) {
      setTimeout(function () {
        return hot.render();
      }, 10);
    }

    if (changed.fixedColumnsLeft) {
      hot.updateSettings({
        fixedColumnsLeft: current.fixedColumnsLeft
      });
    }

    if (changed.sorting) {
      console.log('changed sorting!', {
        column: chart.dataset().indexOf(current.sorting.sortBy),
        sortOrder: current.sorting.sortDir
      });
      hot.getPlugin('columnSorting').sort(chart.dataset().indexOf(current.sorting.sortBy), current.sorting.sortDir ? 'asc' : 'desc');
    }
  }

  function cellHeaderClick(evt) {
    var th = this; // reset the HoT selection
    // find out which data column we're in

    var k = th.parentNode.children.length;
    var thIndex = -1; // (stupid HTMLCollection has no indexOf)

    for (var i = 0; i < k; i++) {
      if (th.parentNode.children.item(i) === th) {
        thIndex = i;
        break;
      }
    } // find column index


    var colIndex = +app.refs.hot.querySelector(".htCore tbody tr:first-child td:nth-child(".concat(thIndex + 1, ")")).dataset.column;

    var _app$store$get = app.store.get(),
        dw_chart = _app$store$get.dw_chart;

    var _app$get = app.get(),
        activeColumn = _app$get.activeColumn,
        hot = _app$get.hot;

    if (dw_chart.dataset().hasColumn(colIndex)) {
      var newActive = dw_chart.dataset().column(+colIndex); // set active column (or unset if it's already set)

      if (activeColumn && activeColumn.name() === newActive.name()) {
        evt.target.parentNode.classList.remove('selected');
        app.set({
          activeColumn: false
        });
        hot.deselectCell();
      } else {
        evt.target.parentNode.classList.add('selected');
        app.set({
          activeColumn: newActive
        });
      }
    }
  }

  function topLeftCornerClick(evt) {
    evt.preventDefault();

    var _app$get2 = app.get(),
        transpose = _app$get2.transpose;

    app.set({
      transpose: !transpose
    });
    app.update();
  }

  var file$7 = "describe/hot/Handsontable.html";

  function create_main_fragment$8(component, ctx) {
    var div;
    return {
      c: function create() {
        div = createElement("div");
        div.id = "data-preview";
        addLoc(div, file$7, 0, 0, 0);
      },
      m: function mount(target, anchor) {
        insert(target, div, anchor);
        component.refs.hot = div;
      },
      p: noop,
      d: function destroy(detach) {
        if (detach) {
          detachNode(div);
        }

        if (component.refs.hot === div) component.refs.hot = null;
      }
    };
  }

  function Handsontable(options) {
    var _this7 = this;

    this._debugName = '<Handsontable>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this.refs = {};
    this._state = assign(data$8(), options.data);

    this._recompute({
      searchResults: 1,
      searchIndex: 1
    }, this._state);

    if (!('searchResults' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchResults'");
    if (!('searchIndex' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchIndex'");
    this._intro = true;
    this._handlers.state = [onstate];
    onstate.call(this, {
      changed: assignTrue({}, this._state),
      current: this._state
    });
    this._fragment = create_main_fragment$8(this, this._state);

    this.root._oncreate.push(function () {
      oncreate$3.call(_this7);

      _this7.fire("update", {
        changed: assignTrue({}, _this7._state),
        current: _this7._state
      });
    });

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);

      flush(this);
    }
  }

  assign(Handsontable.prototype, protoDev);
  assign(Handsontable.prototype, methods$4);

  Handsontable.prototype._checkReadOnly = function _checkReadOnly(newState) {
    if ('currentResult' in newState && !this._updatingReadonlyProperty) throw new Error("<Handsontable>: Cannot set read-only property 'currentResult'");
  };

  Handsontable.prototype._recompute = function _recompute(changed, state) {
    if (changed.searchResults || changed.searchIndex) {
      if (this._differs(state.currentResult, state.currentResult = currentResult(state))) changed.currentResult = true;
    }
  };

  /* describe/App.html generated by Svelte v2.16.1 */

  function searchIndexSafe(_ref) {
    var searchIndex = _ref.searchIndex,
        searchResults = _ref.searchResults;
    if (searchIndex < 0) searchIndex += searchResults.length;
    searchIndex = searchIndex % searchResults.length;
    return searchIndex;
  }

  function customColumn(_ref2) {
    var activeColumn = _ref2.activeColumn,
        forceColumnFormat = _ref2.forceColumnFormat;
    return activeColumn && !forceColumnFormat && activeColumn.isComputed ? activeColumn : false;
  }

  function columnFormat(_ref3) {
    var activeColumn = _ref3.activeColumn,
        forceColumnFormat = _ref3.forceColumnFormat;
    return activeColumn && (!activeColumn.isComputed || forceColumnFormat) ? activeColumn : false;
  }

  function activeValues(_ref4) {
    var activeColumn = _ref4.activeColumn;
    return activeColumn ? activeColumn.values() : [];
  }

  function activeFormat(_ref5) {
    var activeColumn = _ref5.activeColumn,
        $dw_chart = _ref5.$dw_chart;
    return activeColumn ? $dw_chart.columnFormatter(activeColumn) : function (d) {
      return d;
    };
  }

  function columns(_ref6) {
    var activeColumn = _ref6.activeColumn;
    var ds = chart.dataset();
    if (!activeColumn) return ds ? ds.columns() : [];

    try {
      return ds.columns().filter(function (col) {
        return !col.isComputed;
      });
    } catch (e) {
      return [];
    }
  }

  function sorting(_ref7) {
    var sortBy = _ref7.sortBy,
        sortDir = _ref7.sortDir;
    return {
      sortBy: sortBy,
      sortDir: sortDir
    };
  }

  function resultsDisplay(_ref8) {
    var searchResults = _ref8.searchResults,
        searchIndexSafe = _ref8.searchIndexSafe;

    if (searchResults.length > 0) {
      return "".concat(searchIndexSafe + 1, " ").concat(__('describe / search / of'), " ").concat(searchResults.length, " ").concat(__('describe / search / results'));
    } else {
      return __('describe / search / no-matches');
    }
  }

  function data$9() {
    return {
      locale: 'en-US',
      search: '',
      chartData: '',
      readonly: false,
      transpose: false,
      firstRowIsHeader: true,
      fixedColumnsLeft: 0,
      searchIndex: 0,
      activeColumn: false,
      customColumn: false,
      columnFormat: false,
      multiSelection: false,
      forceColumnFormat: false,
      searchResults: [],
      sortBy: '-',
      sortDir: true
    };
  }
  var methods$5 = {
    nextResult: function nextResult(diff) {
      var _this$get = this.get(),
          searchIndex = _this$get.searchIndex,
          searchResults = _this$get.searchResults;

      searchIndex += diff;
      if (searchIndex < 0) searchIndex += searchResults.length;
      searchIndex = searchIndex % searchResults.length;
      this.set({
        searchIndex: searchIndex
      });
    },
    keyPress: function keyPress(event) {
      if (event.key === 'F3' || event.key === 'Enter') {
        this.nextResult(event.shiftKey ? -1 : 1);
      }
    },
    toggleTranspose: function toggleTranspose() {
      var _this = this;

      this.set({
        activeColumn: false
      });
      this.set({
        transpose: !this.get().transpose
      });
      setTimeout(function () {
        return _this.refs.hot.update();
      }, 500); // ;
    },
    revertChanges: function revertChanges() {
      var chart = this.store.get().dw_chart;
      chart.set('metadata.data.changes', []);
      chart.saveSoon();
      this.refs.hot.update();
    },
    cmFocus: function cmFocus() {
      var _this2 = this;

      setTimeout(function () {
        _this2.refs.hot.get().hot.render();
      }, 100);
    },
    addComputedColumn: function addComputedColumn() {
      var chart = this.store.get().dw_chart;
      var ds = chart.dataset();
      var computed = arrayToObject(chart.get('metadata.describe.computed-columns', {})); // find new id

      var i = 1;

      while (ds.hasColumn("Column ".concat(i))) {
        i++;
      }

      var id = "Column ".concat(i);
      computed[id] = '';
      chart.set('metadata.describe.computed-columns', computed);
      chart.saveSoon();
      var ds2 = chart.dataset(true);
      this.refs.hot.update();
      this.set({
        activeColumn: ds2.column(id)
      });
    },
    sort: function sort(event, col, ascending) {
      event.preventDefault();
      event.stopPropagation();
      this.set({
        sortBy: col,
        sortDir: ascending
      }); // hide the dropdown menu

      this.refs.sortDropdownGroup.classList.remove('open');
    },
    force: function force(event) {
      var val = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      event.preventDefault();
      this.set({
        forceColumnFormat: val
      });
    },
    hideMultiple: function hideMultiple(columns, hide) {
      var _this3 = this;

      var chart = this.store.get().dw_chart;
      var colFmt = clone(chart.get('metadata.data.column-format', {}));
      columns.forEach(function (col) {
        if (colFmt[col.name()]) colFmt[col.name()].ignore = hide;else {
          colFmt[col.name()] = {
            type: 'auto',
            ignore: hide
          };
        }
      });
      chart.set('metadata.data.column-format', colFmt);
      chart.saveSoon();
      setTimeout(function () {
        _this3.refs.hot.get().hot.render();
      }, 10);
      this.set({
        multiSelection: false
      });
    }
  };

  function oncreate$4() {
    var _this4 = this;

    window.addEventListener('keypress', function (event) {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();

        if (_this4.refs.search !== window.document.activeElement) {
          _this4.refs.search.focus();
        } else {
          _this4.nextResult(+1);
        }
      }
    });
  }

  function onupdate(_ref9) {
    var _this5 = this;

    var changed = _ref9.changed,
        current = _ref9.current;

    if (changed.activeColumn && !current.activeColumn) {
      this.set({
        forceColumnFormat: false
      });
    }

    var sync = {
      transpose: 'metadata.data.transpose',
      firstRowIsHeader: 'metadata.data.horizontal-header',
      locale: 'language'
    };
    Object.keys(sync).forEach(function (svelteKey) {
      if (changed[svelteKey]) {
        var svelteValue = current[svelteKey];
        var metadataKey = sync[svelteKey];

        _this5.store.get().dw_chart.set("".concat(metadataKey), svelteValue);

        if (svelteKey === 'locale') {
          if (!svelteValue) return;

          _this5.store.get().dw_chart.locale(svelteValue, function () {
            _this5.refs.hot.render();
          });
        }
      }
    });
  }
  var file$8 = "describe/App.html";

  function click_handler_2(event) {
    var _this$_svelte = this._svelte,
        component = _this$_svelte.component,
        ctx = _this$_svelte.ctx;
    component.sort(event, ctx.col.name(), true);
  }

  function click_handler_1(event) {
    var _this$_svelte2 = this._svelte,
        component = _this$_svelte2.component,
        ctx = _this$_svelte2.ctx;
    component.sort(event, ctx.col.name(), false);
  }

  function click_handler$1(event) {
    var _this$_svelte3 = this._svelte,
        component = _this$_svelte3.component,
        ctx = _this$_svelte3.ctx;
    component.sort(event, ctx.col.name(), true);
  }

  function get_each_context_1$2(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.col = list[i];
    return child_ctx;
  }

  function get_each_context$2(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.locale = list[i];
    return child_ctx;
  }

  function create_main_fragment$9(component, ctx) {
    var div12,
        div11,
        div2,
        div1,
        text0,
        hr,
        text1,
        div0,
        a0,
        i0,
        text2,
        text3_value = __('Back'),
        text3,
        text4,
        a1,
        text5_value = __('Proceed'),
        text5,
        text6,
        i1,
        text7,
        div10,
        div3,
        raw0_value = __('describe / info-table-header'),
        raw0_after,
        text8,
        img0,
        text9,
        div8,
        div5,
        div4,
        button0,
        raw1_value = __('describe / sort-by'),
        raw1_after,
        text10,
        span,
        text11,
        ul,
        li,
        a2,
        raw2_value = __('describe / no-sorting'),
        li_class_value,
        text12,
        text13,
        div7,
        i2,
        text14,
        div6,
        input,
        input_updating = false,
        input_class_value,
        text15,
        div6_class_value,
        text16,
        text17,
        handsontable_updating = {},
        text18,
        div9,
        button1,
        img1,
        text19,
        text20_value = __("describe / transpose-long"),
        text20,
        text21,
        button2,
        i3,
        text22,
        text23_value = __("computed columns / add-btn"),
        text23,
        text24,
        text25,
        button3,
        i4,
        text26,
        text27_value = __("Revert changes"),
        text27,
        text28,
        button3_class_value;

    function select_block_type(ctx) {
      if (ctx.activeColumn) return create_if_block_2;
      if (ctx.multiSelection) return create_if_block_7;
      return create_else_block;
    }

    var current_block_type = select_block_type(ctx);
    var if_block0 = current_block_type(component, ctx);

    function click_handler(event) {
      component.sort(event, '-');
    }

    var each_value_1 = ctx.columns;
    var each_blocks = [];

    for (var i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block$3(component, get_each_context_1$2(ctx, each_value_1, i));
    }

    function input_input_handler() {
      input_updating = true;
      component.set({
        search: input.value
      });
      input_updating = false;
    }

    function keypress_handler(event) {
      component.keyPress(event);
    }

    var if_block1 = ctx.searchResults.length > 0 && create_if_block_1$4(component);
    var if_block2 = ctx.search && create_if_block$7(component, ctx);
    var handsontable_initial_data = {};

    if (ctx.chartData !== void 0) {
      handsontable_initial_data.data = ctx.chartData;
      handsontable_updating.data = true;
    }

    if (ctx.transpose !== void 0) {
      handsontable_initial_data.transpose = ctx.transpose;
      handsontable_updating.transpose = true;
    }

    if (ctx.firstRowIsHeader !== void 0) {
      handsontable_initial_data.firstRowIsHeader = ctx.firstRowIsHeader;
      handsontable_updating.firstRowIsHeader = true;
    }

    if (ctx.fixedColumnsLeft !== void 0) {
      handsontable_initial_data.fixedColumnsLeft = ctx.fixedColumnsLeft;
      handsontable_updating.fixedColumnsLeft = true;
    }

    if (ctx.activeColumn !== void 0) {
      handsontable_initial_data.activeColumn = ctx.activeColumn;
      handsontable_updating.activeColumn = true;
    }

    if (ctx.readonly !== void 0) {
      handsontable_initial_data.readonly = ctx.readonly;
      handsontable_updating.readonly = true;
    }

    if (ctx.sorting !== void 0) {
      handsontable_initial_data.sorting = ctx.sorting;
      handsontable_updating.sorting = true;
    }

    if (ctx.search !== void 0) {
      handsontable_initial_data.search = ctx.search;
      handsontable_updating.search = true;
    }

    if (ctx.searchResults !== void 0) {
      handsontable_initial_data.searchResults = ctx.searchResults;
      handsontable_updating.searchResults = true;
    }

    if (ctx.searchIndex !== void 0) {
      handsontable_initial_data.searchIndex = ctx.searchIndex;
      handsontable_updating.searchIndex = true;
    }

    if (ctx.multiSelection !== void 0) {
      handsontable_initial_data.multiSelection = ctx.multiSelection;
      handsontable_updating.multiSelection = true;
    }

    var handsontable = new Handsontable({
      root: component.root,
      store: component.store,
      data: handsontable_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!handsontable_updating.data && changed.data) {
          newState.chartData = childState.data;
        }

        if (!handsontable_updating.transpose && changed.transpose) {
          newState.transpose = childState.transpose;
        }

        if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
          newState.firstRowIsHeader = childState.firstRowIsHeader;
        }

        if (!handsontable_updating.fixedColumnsLeft && changed.fixedColumnsLeft) {
          newState.fixedColumnsLeft = childState.fixedColumnsLeft;
        }

        if (!handsontable_updating.activeColumn && changed.activeColumn) {
          newState.activeColumn = childState.activeColumn;
        }

        if (!handsontable_updating.readonly && changed.readonly) {
          newState.readonly = childState.readonly;
        }

        if (!handsontable_updating.sorting && changed.sorting) {
          newState.sorting = childState.sorting;
        }

        if (!handsontable_updating.search && changed.search) {
          newState.search = childState.search;
        }

        if (!handsontable_updating.searchResults && changed.searchResults) {
          newState.searchResults = childState.searchResults;
        }

        if (!handsontable_updating.searchIndex && changed.searchIndex) {
          newState.searchIndex = childState.searchIndex;
        }

        if (!handsontable_updating.multiSelection && changed.multiSelection) {
          newState.multiSelection = childState.multiSelection;
        }

        component._set(newState);

        handsontable_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      handsontable._bind({
        data: 1,
        transpose: 1,
        firstRowIsHeader: 1,
        fixedColumnsLeft: 1,
        activeColumn: 1,
        readonly: 1,
        sorting: 1,
        search: 1,
        searchResults: 1,
        searchIndex: 1,
        multiSelection: 1
      }, handsontable.get());
    });

    handsontable.on("resetSort", function (event) {
      component.set({
        sortBy: '-'
      });
    });
    component.refs.hot = handsontable;

    function click_handler_3(event) {
      component.toggleTranspose();
    }

    function click_handler_4(event) {
      component.addComputedColumn();
    }

    function click_handler_5(event) {
      component.revertChanges();
    }

    return {
      c: function create() {
        div12 = createElement("div");
        div11 = createElement("div");
        div2 = createElement("div");
        div1 = createElement("div");
        if_block0.c();
        text0 = createText("\n\n                ");
        hr = createElement("hr");
        text1 = createText("\n\n                ");
        div0 = createElement("div");
        a0 = createElement("a");
        i0 = createElement("i");
        text2 = createText(" ");
        text3 = createText(text3_value);
        text4 = createText("\n                    ");
        a1 = createElement("a");
        text5 = createText(text5_value);
        text6 = createText(" ");
        i1 = createElement("i");
        text7 = createText("\n        ");
        div10 = createElement("div");
        div3 = createElement("div");
        raw0_after = createElement('noscript');
        text8 = createText(" ");
        img0 = createElement("img");
        text9 = createText("\n            ");
        div8 = createElement("div");
        div5 = createElement("div");
        div4 = createElement("div");
        button0 = createElement("button");
        raw1_after = createElement('noscript');
        text10 = createText("… ");
        span = createElement("span");
        text11 = createText("\n                        ");
        ul = createElement("ul");
        li = createElement("li");
        a2 = createElement("a");
        text12 = createText("\n                            ");

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        text13 = createText("\n\n                ");
        div7 = createElement("div");
        i2 = createElement("i");
        text14 = createText("\n                    ");
        div6 = createElement("div");
        input = createElement("input");
        text15 = createText("\n                        ");
        if (if_block1) if_block1.c();
        text16 = createText("\n\n                    ");
        if (if_block2) if_block2.c();
        text17 = createText("\n\n            ");

        handsontable._fragment.c();

        text18 = createText("\n\n            ");
        div9 = createElement("div");
        button1 = createElement("button");
        img1 = createElement("img");
        text19 = createText(" ");
        text20 = createText(text20_value);
        text21 = createText("\n\n                ");
        button2 = createElement("button");
        i3 = createElement("i");
        text22 = createText(" ");
        text23 = createText(text23_value);
        text24 = createText("…");
        text25 = createText("\n\n                ");
        button3 = createElement("button");
        i4 = createElement("i");
        text26 = createText(" ");
        text27 = createText(text27_value);
        text28 = createText("…");
        addLoc(hr, file$8, 61, 16, 2597);
        i0.className = "icon-chevron-left";
        addLoc(i0, file$8, 64, 56, 2701);
        a0.className = "btn submit";
        a0.href = "upload";
        addLoc(a0, file$8, 64, 20, 2665);
        i1.className = "icon-chevron-right icon-white";
        addLoc(i1, file$8, 66, 40, 2886);
        a1.href = "visualize";
        a1.className = "submit btn btn-primary";
        a1.id = "describe-proceed";
        addLoc(a1, file$8, 65, 20, 2772);
        div0.className = "btn-group";
        addLoc(div0, file$8, 63, 16, 2621);
        div1.className = "sidebar";
        addLoc(div1, file$8, 3, 12, 89);
        div2.className = "span4";
        addLoc(div2, file$8, 2, 8, 57);
        img0.src = "/static/img/arrow.svg";
        addLoc(img0, file$8, 72, 73, 3115);
        div3.className = "help svelte-1ymbvw3";
        addLoc(div3, file$8, 72, 12, 3054);
        span.className = "caret";
        addLoc(span, file$8, 77, 62, 3473);
        button0.className = "btn dropdown-toggle";
        button0.dataset.toggle = "dropdown";
        addLoc(button0, file$8, 76, 24, 3351);
        addListener(a2, "click", click_handler);
        a2.href = "#s";
        a2.className = "svelte-1ymbvw3";
        addLoc(a2, file$8, 81, 32, 3695);
        li.className = li_class_value = '-' == ctx.sortBy ? 'active' : '';
        addLoc(li, file$8, 80, 28, 3624);
        ul.className = "dropdown-menu sort-menu";
        addLoc(ul, file$8, 79, 24, 3559);
        div4.className = "btn-group";
        addLoc(div4, file$8, 75, 20, 3281);
        div5.className = "sort-box svelte-1ymbvw3";
        addLoc(div5, file$8, 74, 16, 3238);
        i2.className = "im im-magnifier svelte-1ymbvw3";
        addLoc(i2, file$8, 103, 20, 4903);
        addListener(input, "input", input_input_handler);
        addListener(input, "keypress", keypress_handler);
        input.autocomplete = "screw-you-google-chrome";
        setAttribute(input, "type", "search");
        input.placeholder = __('describe / search / placeholder');
        input.className = input_class_value = "" + (ctx.searchResults.length > 0 ? 'with-results' : '') + " search-query" + " svelte-1ymbvw3";
        addLoc(input, file$8, 105, 24, 5042);
        div6.className = div6_class_value = ctx.searchResults.length > 0 ? 'input-append' : '';
        addLoc(div6, file$8, 104, 20, 4955);
        div7.className = "search-box form-search svelte-1ymbvw3";
        addLoc(div7, file$8, 102, 16, 4846);
        div8.className = "pull-right";
        setStyle(div8, "margin-bottom", "10px");
        addLoc(div8, file$8, 73, 12, 3169);
        img1.src = "/static/css/chart-editor/transpose.png";
        img1.className = "svelte-1ymbvw3";
        addLoc(img1, file$8, 152, 20, 6906);
        addListener(button1, "click", click_handler_3);
        button1.className = "btn transpose svelte-1ymbvw3";
        addLoc(button1, file$8, 151, 16, 6826);
        i3.className = "fa fa-calculator";
        addLoc(i3, file$8, 156, 20, 7125);
        addListener(button2, "click", click_handler_4);
        button2.className = "btn computed-columns";
        addLoc(button2, file$8, 155, 16, 7036);
        i4.className = "fa fa-undo";
        addLoc(i4, file$8, 160, 20, 7357);
        addListener(button3, "click", click_handler_5);
        button3.className = button3_class_value = "btn " + (ctx.has_changes ? '' : 'disabled') + " svelte-1ymbvw3";
        button3.id = "reset-data-changes";
        addLoc(button3, file$8, 159, 16, 7237);
        div9.className = "buttons below-table pull-right svelte-1ymbvw3";
        addLoc(div9, file$8, 150, 12, 6765);
        div10.className = "span8 svelte-1ymbvw3";
        addLoc(div10, file$8, 71, 8, 3022);
        div11.className = "row";
        addLoc(div11, file$8, 1, 4, 31);
        div12.className = "chart-editor";
        addLoc(div12, file$8, 0, 0, 0);
      },
      m: function mount(target, anchor) {
        insert(target, div12, anchor);
        append(div12, div11);
        append(div11, div2);
        append(div2, div1);
        if_block0.m(div1, null);
        append(div1, text0);
        append(div1, hr);
        append(div1, text1);
        append(div1, div0);
        append(div0, a0);
        append(a0, i0);
        append(a0, text2);
        append(a0, text3);
        append(div0, text4);
        append(div0, a1);
        append(a1, text5);
        append(a1, text6);
        append(a1, i1);
        append(div11, text7);
        append(div11, div10);
        append(div10, div3);
        append(div3, raw0_after);
        raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
        append(div3, text8);
        append(div3, img0);
        append(div10, text9);
        append(div10, div8);
        append(div8, div5);
        append(div5, div4);
        append(div4, button0);
        append(button0, raw1_after);
        raw1_after.insertAdjacentHTML("beforebegin", raw1_value);
        append(button0, text10);
        append(button0, span);
        append(div4, text11);
        append(div4, ul);
        append(ul, li);
        append(li, a2);
        a2.innerHTML = raw2_value;
        append(ul, text12);

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }

        component.refs.sortDropdownGroup = div4;
        append(div8, text13);
        append(div8, div7);
        append(div7, i2);
        append(div7, text14);
        append(div7, div6);
        append(div6, input);
        component.refs.search = input;
        input.value = ctx.search;
        append(div6, text15);
        if (if_block1) if_block1.m(div6, null);
        append(div7, text16);
        if (if_block2) if_block2.m(div7, null);
        append(div10, text17);

        handsontable._mount(div10, null);

        append(div10, text18);
        append(div10, div9);
        append(div9, button1);
        append(button1, img1);
        append(button1, text19);
        append(button1, text20);
        append(div9, text21);
        append(div9, button2);
        append(button2, i3);
        append(button2, text22);
        append(button2, text23);
        append(button2, text24);
        append(div9, text25);
        append(div9, button3);
        append(button3, i4);
        append(button3, text26);
        append(button3, text27);
        append(button3, text28);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;

        if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
          if_block0.p(changed, ctx);
        } else {
          if_block0.d(1);
          if_block0 = current_block_type(component, ctx);
          if_block0.c();
          if_block0.m(div1, text0);
        }

        if (changed.sortBy && li_class_value !== (li_class_value = '-' == ctx.sortBy ? 'active' : '')) {
          li.className = li_class_value;
        }

        if (changed.columns || changed.sortBy) {
          each_value_1 = ctx.columns;

          for (var i = 0; i < each_value_1.length; i += 1) {
            var child_ctx = get_each_context_1$2(ctx, each_value_1, i);

            if (each_blocks[i]) {
              each_blocks[i].p(changed, child_ctx);
            } else {
              each_blocks[i] = create_each_block$3(component, child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(ul, null);
            }
          }

          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }

          each_blocks.length = each_value_1.length;
        }

        if (!input_updating && changed.search) input.value = ctx.search;

        if (changed.searchResults && input_class_value !== (input_class_value = "" + (ctx.searchResults.length > 0 ? 'with-results' : '') + " search-query" + " svelte-1ymbvw3")) {
          input.className = input_class_value;
        }

        if (ctx.searchResults.length > 0) {
          if (!if_block1) {
            if_block1 = create_if_block_1$4(component);
            if_block1.c();
            if_block1.m(div6, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (changed.searchResults && div6_class_value !== (div6_class_value = ctx.searchResults.length > 0 ? 'input-append' : '')) {
          div6.className = div6_class_value;
        }

        if (ctx.search) {
          if (if_block2) {
            if_block2.p(changed, ctx);
          } else {
            if_block2 = create_if_block$7(component, ctx);
            if_block2.c();
            if_block2.m(div7, null);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }

        var handsontable_changes = {};

        if (!handsontable_updating.data && changed.chartData) {
          handsontable_changes.data = ctx.chartData;
          handsontable_updating.data = ctx.chartData !== void 0;
        }

        if (!handsontable_updating.transpose && changed.transpose) {
          handsontable_changes.transpose = ctx.transpose;
          handsontable_updating.transpose = ctx.transpose !== void 0;
        }

        if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
          handsontable_changes.firstRowIsHeader = ctx.firstRowIsHeader;
          handsontable_updating.firstRowIsHeader = ctx.firstRowIsHeader !== void 0;
        }

        if (!handsontable_updating.fixedColumnsLeft && changed.fixedColumnsLeft) {
          handsontable_changes.fixedColumnsLeft = ctx.fixedColumnsLeft;
          handsontable_updating.fixedColumnsLeft = ctx.fixedColumnsLeft !== void 0;
        }

        if (!handsontable_updating.activeColumn && changed.activeColumn) {
          handsontable_changes.activeColumn = ctx.activeColumn;
          handsontable_updating.activeColumn = ctx.activeColumn !== void 0;
        }

        if (!handsontable_updating.readonly && changed.readonly) {
          handsontable_changes.readonly = ctx.readonly;
          handsontable_updating.readonly = ctx.readonly !== void 0;
        }

        if (!handsontable_updating.sorting && changed.sorting) {
          handsontable_changes.sorting = ctx.sorting;
          handsontable_updating.sorting = ctx.sorting !== void 0;
        }

        if (!handsontable_updating.search && changed.search) {
          handsontable_changes.search = ctx.search;
          handsontable_updating.search = ctx.search !== void 0;
        }

        if (!handsontable_updating.searchResults && changed.searchResults) {
          handsontable_changes.searchResults = ctx.searchResults;
          handsontable_updating.searchResults = ctx.searchResults !== void 0;
        }

        if (!handsontable_updating.searchIndex && changed.searchIndex) {
          handsontable_changes.searchIndex = ctx.searchIndex;
          handsontable_updating.searchIndex = ctx.searchIndex !== void 0;
        }

        if (!handsontable_updating.multiSelection && changed.multiSelection) {
          handsontable_changes.multiSelection = ctx.multiSelection;
          handsontable_updating.multiSelection = ctx.multiSelection !== void 0;
        }

        handsontable._set(handsontable_changes);

        handsontable_updating = {};

        if (changed.has_changes && button3_class_value !== (button3_class_value = "btn " + (ctx.has_changes ? '' : 'disabled') + " svelte-1ymbvw3")) {
          button3.className = button3_class_value;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(div12);
        }

        if_block0.d();
        removeListener(a2, "click", click_handler);
        destroyEach(each_blocks, detach);
        if (component.refs.sortDropdownGroup === div4) component.refs.sortDropdownGroup = null;
        removeListener(input, "input", input_input_handler);
        removeListener(input, "keypress", keypress_handler);
        if (component.refs.search === input) component.refs.search = null;
        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
        handsontable.destroy();
        if (component.refs.hot === handsontable) component.refs.hot = null;
        removeListener(button1, "click", click_handler_3);
        removeListener(button2, "click", click_handler_4);
        removeListener(button3, "click", click_handler_5);
      }
    };
  } // (44:16) {:else}


  function create_else_block(component, ctx) {
    var h3,
        text0_value = __("Make sure the data looks right"),
        text0,
        text1,
        p,
        raw_value = __("describe / data-looks-right"),
        text2,
        checkbox_updating = {},
        text3,
        if_block_anchor;

    var checkbox_initial_data = {
      label: __("First row as label")
    };

    if (ctx.firstRowIsHeader !== void 0) {
      checkbox_initial_data.value = ctx.firstRowIsHeader;
      checkbox_updating.value = true;
    }

    var checkbox = new Checkbox({
      root: component.root,
      store: component.store,
      data: checkbox_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!checkbox_updating.value && changed.value) {
          newState.firstRowIsHeader = childState.value;
        }

        component._set(newState);

        checkbox_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      checkbox._bind({
        value: 1
      }, checkbox.get());
    });

    var if_block = ctx.showLocale && create_if_block_8(component, ctx);
    return {
      c: function create() {
        h3 = createElement("h3");
        text0 = createText(text0_value);
        text1 = createText("\n\n                ");
        p = createElement("p");
        text2 = createText("\n\n                ");

        checkbox._fragment.c();

        text3 = createText(" ");
        if (if_block) if_block.c();
        if_block_anchor = createComment();
        h3.className = "first";
        addLoc(h3, file$8, 45, 16, 1934);
        addLoc(p, file$8, 47, 16, 2015);
      },
      m: function mount(target, anchor) {
        insert(target, h3, anchor);
        append(h3, text0);
        insert(target, text1, anchor);
        insert(target, p, anchor);
        p.innerHTML = raw_value;
        insert(target, text2, anchor);

        checkbox._mount(target, anchor);

        insert(target, text3, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
        var checkbox_changes = {};

        if (!checkbox_updating.value && changed.firstRowIsHeader) {
          checkbox_changes.value = ctx.firstRowIsHeader;
          checkbox_updating.value = ctx.firstRowIsHeader !== void 0;
        }

        checkbox._set(checkbox_changes);

        checkbox_updating = {};

        if (ctx.showLocale) {
          if (if_block) {
            if_block.p(changed, ctx);
          } else {
            if_block = create_if_block_8(component, ctx);
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
          detachNode(h3);
          detachNode(text1);
          detachNode(p);
          detachNode(text2);
        }

        checkbox.destroy(detach);

        if (detach) {
          detachNode(text3);
        }

        if (if_block) if_block.d(detach);

        if (detach) {
          detachNode(if_block_anchor);
        }
      }
    };
  } // (27:46) 


  function create_if_block_7(component, ctx) {
    var h3,
        text0_value = __('describe / show-hide-multi'),
        text0,
        text1,
        ul,
        li0,
        button0,
        i0,
        text2,
        text3_value = __('describe / show-selected'),
        text3,
        text4,
        li1,
        button1,
        i1,
        text5,
        text6_value = __('describe / hide-selected'),
        text6;

    function click_handler(event) {
      component.hideMultiple(ctx.multiSelection, false);
    }

    function click_handler_1(event) {
      component.hideMultiple(ctx.multiSelection, true);
    }

    return {
      c: function create() {
        h3 = createElement("h3");
        text0 = createText(text0_value);
        text1 = createText("\n\n                ");
        ul = createElement("ul");
        li0 = createElement("li");
        button0 = createElement("button");
        i0 = createElement("i");
        text2 = createText(" ");
        text3 = createText(text3_value);
        text4 = createText("\n                    ");
        li1 = createElement("li");
        button1 = createElement("button");
        i1 = createElement("i");
        text5 = createText(" ");
        text6 = createText(text6_value);
        h3.className = "first";
        addLoc(h3, file$8, 28, 16, 1213);
        i0.className = "fa fa-eye";
        addLoc(i0, file$8, 33, 28, 1482);
        addListener(button0, "click", click_handler);
        button0.className = "btn";
        addLoc(button0, file$8, 32, 24, 1386);
        setStyle(li0, "margin-bottom", "5px");
        addLoc(li0, file$8, 31, 20, 1330);
        i1.className = "fa fa-eye-slash";
        addLoc(i1, file$8, 38, 28, 1745);
        addListener(button1, "click", click_handler_1);
        button1.className = "btn";
        addLoc(button1, file$8, 37, 24, 1650);
        addLoc(li1, file$8, 36, 20, 1621);
        ul.className = "unstyled";
        addLoc(ul, file$8, 30, 16, 1288);
      },
      m: function mount(target, anchor) {
        insert(target, h3, anchor);
        append(h3, text0);
        insert(target, text1, anchor);
        insert(target, ul, anchor);
        append(ul, li0);
        append(li0, button0);
        append(button0, i0);
        append(button0, text2);
        append(button0, text3);
        append(ul, text4);
        append(ul, li1);
        append(li1, button1);
        append(button1, i1);
        append(button1, text5);
        append(button1, text6);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(h3);
          detachNode(text1);
          detachNode(ul);
        }

        removeListener(button0, "click", click_handler);
        removeListener(button1, "click", click_handler_1);
      }
    };
  } // (5:16) {#if activeColumn}


  function create_if_block_2(component, ctx) {
    var text, if_block1_anchor;

    function select_block_type_1(ctx) {
      if (ctx.customColumn) return create_if_block_4;
      if (ctx.columnFormat) return create_if_block_5;
    }

    var current_block_type = select_block_type_1(ctx);
    var if_block0 = current_block_type && current_block_type(component, ctx);
    var if_block1 = ctx.activeColumn.type() == 'number' && create_if_block_3(component, ctx);
    return {
      c: function create() {
        if (if_block0) if_block0.c();
        text = createText(" ");
        if (if_block1) if_block1.c();
        if_block1_anchor = createComment();
      },
      m: function mount(target, anchor) {
        if (if_block0) if_block0.m(target, anchor);
        insert(target, text, anchor);
        if (if_block1) if_block1.m(target, anchor);
        insert(target, if_block1_anchor, anchor);
      },
      p: function update(changed, ctx) {
        if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
          if_block0.p(changed, ctx);
        } else {
          if (if_block0) if_block0.d(1);
          if_block0 = current_block_type && current_block_type(component, ctx);
          if (if_block0) if_block0.c();
          if (if_block0) if_block0.m(text.parentNode, text);
        }

        if (ctx.activeColumn.type() == 'number') {
          if (if_block1) {
            if_block1.p(changed, ctx);
          } else {
            if_block1 = create_if_block_3(component, ctx);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      d: function destroy(detach) {
        if (if_block0) if_block0.d(detach);

        if (detach) {
          detachNode(text);
        }

        if (if_block1) if_block1.d(detach);

        if (detach) {
          detachNode(if_block1_anchor);
        }
      }
    };
  } // (50:96) {#if showLocale }


  function create_if_block_8(component, ctx) {
    var h4,
        text0_value = __("describe / locale-select / hed"),
        text0,
        text1,
        p,
        raw_value = __("describe / locale-select / body"),
        text2,
        select,
        select_updating = false;

    var each_value = ctx.locales;
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block_1$3(component, get_each_context$2(ctx, each_value, i));
    }

    function select_change_handler() {
      select_updating = true;
      component.set({
        locale: selectValue(select)
      });
      select_updating = false;
    }

    return {
      c: function create() {
        h4 = createElement("h4");
        text0 = createText(text0_value);
        text1 = createText("\n\n                ");
        p = createElement("p");
        text2 = createText("\n\n                ");
        select = createElement("select");

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        addLoc(h4, file$8, 50, 16, 2196);
        addLoc(p, file$8, 52, 16, 2261);
        addListener(select, "change", select_change_handler);
        if (!('locale' in ctx)) component.root._beforecreate.push(select_change_handler);
        addLoc(select, file$8, 54, 16, 2331);
      },
      m: function mount(target, anchor) {
        insert(target, h4, anchor);
        append(h4, text0);
        insert(target, text1, anchor);
        insert(target, p, anchor);
        p.innerHTML = raw_value;
        insert(target, text2, anchor);
        insert(target, select, anchor);

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(select, null);
        }

        selectOption(select, ctx.locale);
      },
      p: function update(changed, ctx) {
        if (changed.locales) {
          each_value = ctx.locales;

          for (var i = 0; i < each_value.length; i += 1) {
            var child_ctx = get_each_context$2(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(changed, child_ctx);
            } else {
              each_blocks[i] = create_each_block_1$3(component, child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(select, null);
            }
          }

          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }

          each_blocks.length = each_value.length;
        }

        if (!select_updating && changed.locale) selectOption(select, ctx.locale);
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(h4);
          detachNode(text1);
          detachNode(p);
          detachNode(text2);
          detachNode(select);
        }

        destroyEach(each_blocks, detach);
        removeListener(select, "change", select_change_handler);
      }
    };
  } // (56:20) {#each locales as locale}


  function create_each_block_1$3(component, ctx) {
    var option,
        text0_value = ctx.locale.label,
        text0,
        text1,
        text2_value = ctx.locale.value,
        text2,
        text3,
        option_value_value;
    return {
      c: function create() {
        option = createElement("option");
        text0 = createText(text0_value);
        text1 = createText(" (");
        text2 = createText(text2_value);
        text3 = createText(")");
        option.__value = option_value_value = ctx.locale.value;
        option.value = option.__value;
        addLoc(option, file$8, 56, 20, 2426);
      },
      m: function mount(target, anchor) {
        insert(target, option, anchor);
        append(option, text0);
        append(option, text1);
        append(option, text2);
        append(option, text3);
      },
      p: function update(changed, ctx) {
        if (changed.locales && text0_value !== (text0_value = ctx.locale.label)) {
          setData(text0, text0_value);
        }

        if (changed.locales && text2_value !== (text2_value = ctx.locale.value)) {
          setData(text2, text2_value);
        }

        if (changed.locales && option_value_value !== (option_value_value = ctx.locale.value)) {
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
  } // (19:38) 


  function create_if_block_5(component, ctx) {
    var customcolumnformat_updating = {},
        text,
        if_block_anchor;
    var customcolumnformat_initial_data = {};

    if (ctx.columnFormat !== void 0) {
      customcolumnformat_initial_data.column = ctx.columnFormat;
      customcolumnformat_updating.column = true;
    }

    if (ctx.columns !== void 0) {
      customcolumnformat_initial_data.columns = ctx.columns;
      customcolumnformat_updating.columns = true;
    }

    var customcolumnformat = new CustomColumnFormat({
      root: component.root,
      store: component.store,
      data: customcolumnformat_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!customcolumnformat_updating.column && changed.column) {
          newState.columnFormat = childState.column;
        }

        if (!customcolumnformat_updating.columns && changed.columns) {
          newState.columns = childState.columns;
        }

        component._set(newState);

        customcolumnformat_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      customcolumnformat._bind({
        column: 1,
        columns: 1
      }, customcolumnformat.get());
    });

    customcolumnformat.on("updateTable", function (event) {
      component.refs.hot.update();
    });
    customcolumnformat.on("renderTable", function (event) {
      component.refs.hot.render();
    });
    var if_block = ctx.columnFormat.isComputed && create_if_block_6(component);
    return {
      c: function create() {
        customcolumnformat._fragment.c();

        text = createText("\n\n                ");
        if (if_block) if_block.c();
        if_block_anchor = createComment();
      },
      m: function mount(target, anchor) {
        customcolumnformat._mount(target, anchor);

        insert(target, text, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
        var customcolumnformat_changes = {};

        if (!customcolumnformat_updating.column && changed.columnFormat) {
          customcolumnformat_changes.column = ctx.columnFormat;
          customcolumnformat_updating.column = ctx.columnFormat !== void 0;
        }

        if (!customcolumnformat_updating.columns && changed.columns) {
          customcolumnformat_changes.columns = ctx.columns;
          customcolumnformat_updating.columns = ctx.columns !== void 0;
        }

        customcolumnformat._set(customcolumnformat_changes);

        customcolumnformat_updating = {};

        if (ctx.columnFormat.isComputed) {
          if (!if_block) {
            if_block = create_if_block_6(component);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d: function destroy(detach) {
        customcolumnformat.destroy(detach);

        if (detach) {
          detachNode(text);
        }

        if (if_block) if_block.d(detach);

        if (detach) {
          detachNode(if_block_anchor);
        }
      }
    };
  } // (5:35) {#if customColumn}


  function create_if_block_4(component, ctx) {
    var computedcolumneditor_updating = {},
        text0,
        button,
        text1_value = __('describe / edit-format'),
        text1;

    var computedcolumneditor_initial_data = {};

    if (ctx.customColumn !== void 0) {
      computedcolumneditor_initial_data.column = ctx.customColumn;
      computedcolumneditor_updating.column = true;
    }

    if (ctx.columns !== void 0) {
      computedcolumneditor_initial_data.columns = ctx.columns;
      computedcolumneditor_updating.columns = true;
    }

    var computedcolumneditor = new ComputedColumnEditor({
      root: component.root,
      store: component.store,
      data: computedcolumneditor_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!computedcolumneditor_updating.column && changed.column) {
          newState.customColumn = childState.column;
        }

        if (!computedcolumneditor_updating.columns && changed.columns) {
          newState.columns = childState.columns;
        }

        component._set(newState);

        computedcolumneditor_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      computedcolumneditor._bind({
        column: 1,
        columns: 1
      }, computedcolumneditor.get());
    });

    computedcolumneditor.on("updateTable", function (event) {
      component.refs.hot.update();
    });
    computedcolumneditor.on("renderTable", function (event) {
      component.refs.hot.render();
    });
    computedcolumneditor.on("unselect", function (event) {
      component.set({
        activeColumn: false
      });
    });

    function click_handler(event) {
      component.force(event, true);
    }

    return {
      c: function create() {
        computedcolumneditor._fragment.c();

        text0 = createText("\n\n                ");
        button = createElement("button");
        text1 = createText(text1_value);
        addListener(button, "click", click_handler);
        button.className = "btn";
        addLoc(button, file$8, 14, 16, 490);
      },
      m: function mount(target, anchor) {
        computedcolumneditor._mount(target, anchor);

        insert(target, text0, anchor);
        insert(target, button, anchor);
        append(button, text1);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
        var computedcolumneditor_changes = {};

        if (!computedcolumneditor_updating.column && changed.customColumn) {
          computedcolumneditor_changes.column = ctx.customColumn;
          computedcolumneditor_updating.column = ctx.customColumn !== void 0;
        }

        if (!computedcolumneditor_updating.columns && changed.columns) {
          computedcolumneditor_changes.columns = ctx.columns;
          computedcolumneditor_updating.columns = ctx.columns !== void 0;
        }

        computedcolumneditor._set(computedcolumneditor_changes);

        computedcolumneditor_updating = {};
      },
      d: function destroy(detach) {
        computedcolumneditor.destroy(detach);

        if (detach) {
          detachNode(text0);
          detachNode(button);
        }

        removeListener(button, "click", click_handler);
      }
    };
  } // (23:16) {#if columnFormat.isComputed}


  function create_if_block_6(component, ctx) {
    var button,
        i,
        text0,
        text1_value = __('describe / edit-formula'),
        text1;

    function click_handler(event) {
      component.force(event, false);
    }

    return {
      c: function create() {
        button = createElement("button");
        i = createElement("i");
        text0 = createText(" ");
        text1 = createText(text1_value);
        i.className = "fa  fa-chevron-left";
        addLoc(i, file$8, 23, 67, 922);
        addListener(button, "click", click_handler);
        button.className = "btn";
        addLoc(button, file$8, 23, 16, 871);
      },
      m: function mount(target, anchor) {
        insert(target, button, anchor);
        append(button, i);
        append(button, text0);
        append(button, text1);
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(button);
        }

        removeListener(button, "click", click_handler);
      }
    };
  } // (25:28) {#if activeColumn.type() == 'number'}


  function create_if_block_3(component, ctx) {
    var histogram_updating = {};
    var histogram_initial_data = {};

    if (ctx.activeValues !== void 0) {
      histogram_initial_data.values = ctx.activeValues;
      histogram_updating.values = true;
    }

    if (ctx.activeFormat !== void 0) {
      histogram_initial_data.format = ctx.activeFormat;
      histogram_updating.format = true;
    }

    var histogram = new Histogram({
      root: component.root,
      store: component.store,
      data: histogram_initial_data,
      _bind: function _bind(changed, childState) {
        var newState = {};

        if (!histogram_updating.values && changed.values) {
          newState.activeValues = childState.values;
        }

        if (!histogram_updating.format && changed.format) {
          newState.activeFormat = childState.format;
        }

        component._set(newState);

        histogram_updating = {};
      }
    });

    component.root._beforecreate.push(function () {
      histogram._bind({
        values: 1,
        format: 1
      }, histogram.get());
    });

    return {
      c: function create() {
        histogram._fragment.c();
      },
      m: function mount(target, anchor) {
        histogram._mount(target, anchor);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
        var histogram_changes = {};

        if (!histogram_updating.values && changed.activeValues) {
          histogram_changes.values = ctx.activeValues;
          histogram_updating.values = ctx.activeValues !== void 0;
        }

        if (!histogram_updating.format && changed.activeFormat) {
          histogram_changes.format = ctx.activeFormat;
          histogram_updating.format = ctx.activeFormat !== void 0;
        }

        histogram._set(histogram_changes);

        histogram_updating = {};
      },
      d: function destroy(detach) {
        histogram.destroy(detach);
      }
    };
  } // (84:28) {#each columns as col}


  function create_each_block$3(component, ctx) {
    var li,
        a,
        i0,
        i0_class_value,
        text0,
        i1,
        i1_class_value,
        text1,
        text2_value = ctx.col.title(),
        text2,
        a_href_value,
        li_class_value;
    return {
      c: function create() {
        li = createElement("li");
        a = createElement("a");
        i0 = createElement("i");
        text0 = createText("\n                                    ");
        i1 = createElement("i");
        text1 = createText("   ");
        text2 = createText(text2_value);
        i0._svelte = {
          component: component,
          ctx: ctx
        };
        addListener(i0, "click", click_handler$1);
        i0.className = i0_class_value = "fa fa-sort-" + (ctx.col.type() == 'text' ? 'alpha' : 'amount') + "-asc fa-fw" + " svelte-1ymbvw3";
        addLoc(i0, file$8, 86, 36, 4070);
        i1._svelte = {
          component: component,
          ctx: ctx
        };
        addListener(i1, "click", click_handler_1);
        i1.className = i1_class_value = "fa fa-sort-" + (ctx.col.type() == 'text' ? 'alpha' : 'amount') + "-desc fa-fw" + " svelte-1ymbvw3";
        addLoc(i1, file$8, 90, 36, 4339);
        a._svelte = {
          component: component,
          ctx: ctx
        };
        addListener(a, "click", click_handler_2);
        a.href = a_href_value = "#/" + ctx.col.name();
        a.className = "svelte-1ymbvw3";
        addLoc(a, file$8, 85, 32, 3967);
        li.className = li_class_value = ctx.col.name() == ctx.sortBy ? 'active' : '';
        addLoc(li, file$8, 84, 28, 3889);
      },
      m: function mount(target, anchor) {
        insert(target, li, anchor);
        append(li, a);
        append(a, i0);
        append(a, text0);
        append(a, i1);
        append(a, text1);
        append(a, text2);
      },
      p: function update(changed, _ctx) {
        ctx = _ctx;
        i0._svelte.ctx = ctx;

        if (changed.columns && i0_class_value !== (i0_class_value = "fa fa-sort-" + (ctx.col.type() == 'text' ? 'alpha' : 'amount') + "-asc fa-fw" + " svelte-1ymbvw3")) {
          i0.className = i0_class_value;
        }

        i1._svelte.ctx = ctx;

        if (changed.columns && i1_class_value !== (i1_class_value = "fa fa-sort-" + (ctx.col.type() == 'text' ? 'alpha' : 'amount') + "-desc fa-fw" + " svelte-1ymbvw3")) {
          i1.className = i1_class_value;
        }

        if (changed.columns && text2_value !== (text2_value = ctx.col.title())) {
          setData(text2, text2_value);
        }

        a._svelte.ctx = ctx;

        if (changed.columns && a_href_value !== (a_href_value = "#/" + ctx.col.name())) {
          a.href = a_href_value;
        }

        if ((changed.columns || changed.sortBy) && li_class_value !== (li_class_value = ctx.col.name() == ctx.sortBy ? 'active' : '')) {
          li.className = li_class_value;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(li);
        }

        removeListener(i0, "click", click_handler$1);
        removeListener(i1, "click", click_handler_1);
        removeListener(a, "click", click_handler_2);
      }
    };
  } // (115:24) {#if searchResults.length > 0}


  function create_if_block_1$4(component, ctx) {
    var div, button0, i0, text, button1, i1;

    function click_handler_3(event) {
      component.nextResult(-1);
    }

    function click_handler_4(event) {
      component.nextResult(+1);
    }

    return {
      c: function create() {
        div = createElement("div");
        button0 = createElement("button");
        i0 = createElement("i");
        text = createText("\n                            ");
        button1 = createElement("button");
        i1 = createElement("i");
        i0.className = "fa fa-chevron-up";
        addLoc(i0, file$8, 117, 32, 5716);
        addListener(button0, "click", click_handler_3);
        button0.className = "btn svelte-1ymbvw3";
        addLoc(button0, file$8, 116, 28, 5637);
        i1.className = "fa fa-chevron-down";
        addLoc(i1, file$8, 120, 32, 5894);
        addListener(button1, "click", click_handler_4);
        button1.className = "btn svelte-1ymbvw3";
        addLoc(button1, file$8, 119, 28, 5815);
        div.className = "btn-group";
        addLoc(div, file$8, 115, 24, 5585);
      },
      m: function mount(target, anchor) {
        insert(target, div, anchor);
        append(div, button0);
        append(button0, i0);
        append(div, text);
        append(div, button1);
        append(button1, i1);
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(div);
        }

        removeListener(button0, "click", click_handler_3);
        removeListener(button1, "click", click_handler_4);
      }
    };
  } // (127:20) {#if search}


  function create_if_block$7(component, ctx) {
    var div, text;
    return {
      c: function create() {
        div = createElement("div");
        text = createText(ctx.resultsDisplay);
        div.className = "results svelte-1ymbvw3";
        addLoc(div, file$8, 127, 20, 6109);
      },
      m: function mount(target, anchor) {
        insert(target, div, anchor);
        append(div, text);
      },
      p: function update(changed, ctx) {
        if (changed.resultsDisplay) {
          setData(text, ctx.resultsDisplay);
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
    var _this6 = this;

    this._debugName = '<App>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    if (!options.store) {
      throw new Error("<App> references store properties, but no store was provided");
    }

    init(this, options);
    this.refs = {};
    this._state = assign(assign(this.store._init(["dw_chart"]), data$9()), options.data);

    this.store._add(this, ["dw_chart"]);

    this._recompute({
      searchIndex: 1,
      searchResults: 1,
      activeColumn: 1,
      forceColumnFormat: 1,
      $dw_chart: 1,
      sortBy: 1,
      sortDir: 1,
      searchIndexSafe: 1
    }, this._state);

    if (!('searchIndex' in this._state)) console.warn("<App> was created without expected data property 'searchIndex'");
    if (!('searchResults' in this._state)) console.warn("<App> was created without expected data property 'searchResults'");
    if (!('activeColumn' in this._state)) console.warn("<App> was created without expected data property 'activeColumn'");
    if (!('forceColumnFormat' in this._state)) console.warn("<App> was created without expected data property 'forceColumnFormat'");
    if (!('$dw_chart' in this._state)) console.warn("<App> was created without expected data property '$dw_chart'");
    if (!('sortBy' in this._state)) console.warn("<App> was created without expected data property 'sortBy'");
    if (!('sortDir' in this._state)) console.warn("<App> was created without expected data property 'sortDir'");
    if (!('multiSelection' in this._state)) console.warn("<App> was created without expected data property 'multiSelection'");
    if (!('firstRowIsHeader' in this._state)) console.warn("<App> was created without expected data property 'firstRowIsHeader'");
    if (!('showLocale' in this._state)) console.warn("<App> was created without expected data property 'showLocale'");
    if (!('locale' in this._state)) console.warn("<App> was created without expected data property 'locale'");
    if (!('locales' in this._state)) console.warn("<App> was created without expected data property 'locales'");
    if (!('search' in this._state)) console.warn("<App> was created without expected data property 'search'");
    if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
    if (!('transpose' in this._state)) console.warn("<App> was created without expected data property 'transpose'");
    if (!('fixedColumnsLeft' in this._state)) console.warn("<App> was created without expected data property 'fixedColumnsLeft'");
    if (!('readonly' in this._state)) console.warn("<App> was created without expected data property 'readonly'");
    if (!('has_changes' in this._state)) console.warn("<App> was created without expected data property 'has_changes'");
    this._intro = true;
    this._handlers.update = [onupdate];
    this._handlers.destroy = [removeFromStore];
    this._fragment = create_main_fragment$9(this, this._state);

    this.root._oncreate.push(function () {
      oncreate$4.call(_this6);

      _this6.fire("update", {
        changed: assignTrue({}, _this6._state),
        current: _this6._state
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
  assign(App.prototype, methods$5);

  App.prototype._checkReadOnly = function _checkReadOnly(newState) {
    if ('searchIndexSafe' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'searchIndexSafe'");
    if ('customColumn' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'customColumn'");
    if ('columnFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columnFormat'");
    if ('activeValues' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'activeValues'");
    if ('activeFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'activeFormat'");
    if ('columns' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columns'");
    if ('sorting' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'sorting'");
    if ('resultsDisplay' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'resultsDisplay'");
  };

  App.prototype._recompute = function _recompute(changed, state) {
    if (changed.searchIndex || changed.searchResults) {
      if (this._differs(state.searchIndexSafe, state.searchIndexSafe = searchIndexSafe(state))) changed.searchIndexSafe = true;
    }

    if (changed.activeColumn || changed.forceColumnFormat) {
      if (this._differs(state.customColumn, state.customColumn = customColumn(state))) changed.customColumn = true;
      if (this._differs(state.columnFormat, state.columnFormat = columnFormat(state))) changed.columnFormat = true;
    }

    if (changed.activeColumn) {
      if (this._differs(state.activeValues, state.activeValues = activeValues(state))) changed.activeValues = true;
    }

    if (changed.activeColumn || changed.$dw_chart) {
      if (this._differs(state.activeFormat, state.activeFormat = activeFormat(state))) changed.activeFormat = true;
    }

    if (changed.activeColumn) {
      if (this._differs(state.columns, state.columns = columns(state))) changed.columns = true;
    }

    if (changed.sortBy || changed.sortDir) {
      if (this._differs(state.sorting, state.sorting = sorting(state))) changed.sorting = true;
    }

    if (changed.searchResults || changed.searchIndexSafe) {
      if (this._differs(state.resultsDisplay, state.resultsDisplay = resultsDisplay(state))) changed.resultsDisplay = true;
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
  var data$a = {
    chart: {
      id: ''
    },
    readonly: false,
    chartData: '',
    transpose: false,
    firstRowIsHeader: true,
    skipRows: 0
  };
  var main = {
    App: App,
    data: data$a,
    store: store
  };

  return main;

}));
//# sourceMappingURL=describe.js.map
