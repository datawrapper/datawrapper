(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('svelte/chart-breadcrumb', factory) :
  (global = global || self, global['chart-breadcrumb'] = factory());
}(this, function () { 'use strict';

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray = _arrayLikeToArray;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray(arr);
  }

  var arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  var iterableToArray = _iterableToArray;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray = _unsupportedIterableToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableSpread = _nonIterableSpread;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
  }

  var toConsumableArray = _toConsumableArray;

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

  function setData(text, data) {
    text.data = '' + data;
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

  /**
   * Shorten a string by removing characters from the middle
   *
   * @exports truncate
   * @kind function
   *
   * @example
   * import truncate from '@datawrapper/shared/truncate';
   * // returns 'This is a…tring'
   * truncate('This is a very very long string')
   *
   * @param {string} str
   * @param {number} start - characters to keep at start of string
   * @param {number} end - characters to keep at end off string
   * @returns {string}
   */
  function truncate(str) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 11;
    var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 7;
    if (typeof str !== 'string') return str;
    if (str.length < start + end + 3) return str;
    return str.substr(0, start).trim() + '…' + str.substr(str.length - end).trim();
  }

  function truncatedFolders(_ref) {
    var folders = _ref.folders;
    if (folders.length < 6) return folders;
    return [].concat(toConsumableArray(folders.slice(0, 3)), [{
      ellipsis: true
    }], toConsumableArray(folders.slice(-1)));
  }

  function data() {
    return {
      type: 'chart',
      folders: [],
      team: null
    };
  }
  var file = "chart-breadcrumb/App.html";

  function get_each_context(ctx, list, i) {
    var child_ctx = Object.create(ctx);
    child_ctx.folder = list[i];
    return child_ctx;
  }

  function create_main_fragment(component, ctx) {
    var div1,
        raw0_value = __('editor / chart-breadcrumb / ' + ctx.type),
        raw0_after,
        text0,
        raw1_value = __('editor / chart-breadcrumb / is-in-folder'),
        raw1_before,
        raw1_after,
        text1,
        div0;

    var each_value = ctx.truncatedFolders;
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
    }

    return {
      c: function create() {
        div1 = createElement("div");
        raw0_after = createElement('noscript');
        text0 = createText(" ");
        raw1_before = createElement('noscript');
        raw1_after = createElement('noscript');
        text1 = createText("\n    ");
        div0 = createElement("div");

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        div0.className = "parts svelte-1t62wad";
        addLoc(div0, file, 3, 4, 171);
        div1.className = "chart-breadcrumb svelte-1t62wad";
        addLoc(div1, file, 0, 0, 0);
      },
      m: function mount(target, anchor) {
        insert(target, div1, anchor);
        append(div1, raw0_after);
        raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
        append(div1, text0);
        append(div1, raw1_before);
        raw1_before.insertAdjacentHTML("afterend", raw1_value);
        append(div1, raw1_after);
        append(div1, text1);
        append(div1, div0);

        for (var i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div0, null);
        }
      },
      p: function update(changed, ctx) {
        if (changed.type && raw0_value !== (raw0_value = __('editor / chart-breadcrumb / ' + ctx.type))) {
          detachBefore(raw0_after);
          raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
        }

        if (changed.truncatedFolders) {
          each_value = ctx.truncatedFolders;

          for (var i = 0; i < each_value.length; i += 1) {
            var child_ctx = get_each_context(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(changed, child_ctx);
            } else {
              each_blocks[i] = create_each_block(component, child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(div0, null);
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
          detachNode(div1);
        }

        destroyEach(each_blocks, detach);
      }
    };
  } // (7:8) {:else}


  function create_else_block(component, ctx) {
    var a,
        i,
        i_class_value,
        text0,
        span,
        text1_value = truncate(ctx.folder.name),
        text1,
        a_href_value;
    return {
      c: function create() {
        a = createElement("a");
        i = createElement("i");
        text0 = createText(" ");
        span = createElement("span");
        text1 = createText(text1_value);
        i.className = i_class_value = "" + (ctx.folder.icon || 'im im-folder') + " svelte-1t62wad";
        addLoc(i, file, 8, 13, 339);
        span.className = "svelte-1t62wad";
        addLoc(span, file, 8, 61, 387);
        a.href = a_href_value = ctx.folder.url;
        a.className = "svelte-1t62wad";
        addLoc(a, file, 7, 8, 303);
      },
      m: function mount(target, anchor) {
        insert(target, a, anchor);
        append(a, i);
        append(a, text0);
        append(a, span);
        append(span, text1);
      },
      p: function update(changed, ctx) {
        if (changed.truncatedFolders && i_class_value !== (i_class_value = "" + (ctx.folder.icon || 'im im-folder') + " svelte-1t62wad")) {
          i.className = i_class_value;
        }

        if (changed.truncatedFolders && text1_value !== (text1_value = truncate(ctx.folder.name))) {
          setData(text1, text1_value);
        }

        if (changed.truncatedFolders && a_href_value !== (a_href_value = ctx.folder.url)) {
          a.href = a_href_value;
        }
      },
      d: function destroy(detach) {
        if (detach) {
          detachNode(a);
        }
      }
    };
  } // (5:43) {#if folder.ellipsis}


  function create_if_block(component, ctx) {
    var span;
    return {
      c: function create() {
        span = createElement("span");
        span.textContent = "…";
        span.className = "svelte-1t62wad";
        addLoc(span, file, 5, 8, 264);
      },
      m: function mount(target, anchor) {
        insert(target, span, anchor);
      },
      p: noop,
      d: function destroy(detach) {
        if (detach) {
          detachNode(span);
        }
      }
    };
  } // (5:8) {#each truncatedFolders as folder}


  function create_each_block(component, ctx) {
    var if_block_anchor;

    function select_block_type(ctx) {
      if (ctx.folder.ellipsis) return create_if_block;
      return create_else_block;
    }

    var current_block_type = select_block_type(ctx);
    var if_block = current_block_type(component, ctx);
    return {
      c: function create() {
        if_block.c();
        if_block_anchor = createComment();
      },
      m: function mount(target, anchor) {
        if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p: function update(changed, ctx) {
        if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
          if_block.p(changed, ctx);
        } else {
          if_block.d(1);
          if_block = current_block_type(component, ctx);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      },
      d: function destroy(detach) {
        if_block.d(detach);

        if (detach) {
          detachNode(if_block_anchor);
        }
      }
    };
  }

  function App(options) {
    this._debugName = '<App>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this._state = assign(data(), options.data);

    this._recompute({
      folders: 1
    }, this._state);

    if (!('folders' in this._state)) console.warn("<App> was created without expected data property 'folders'");
    if (!('type' in this._state)) console.warn("<App> was created without expected data property 'type'");
    this._intro = true;
    this._fragment = create_main_fragment(this, this._state);

    if (options.target) {
      if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

      this._fragment.c();

      this._mount(options.target, options.anchor);
    }
  }

  assign(App.prototype, protoDev);

  App.prototype._checkReadOnly = function _checkReadOnly(newState) {
    if ('truncatedFolders' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'truncatedFolders'");
  };

  App.prototype._recompute = function _recompute(changed, state) {
    if (changed.folders) {
      if (this._differs(state.truncatedFolders, state.truncatedFolders = truncatedFolders(state))) changed.truncatedFolders = true;
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
  var main = {
    App: App,
    store: store
  };

  return main;

}));
//# sourceMappingURL=chart-breadcrumb.js.map
