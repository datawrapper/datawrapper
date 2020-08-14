(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/visualize', factory) :
	(global = global || self, global.visualize = factory());
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

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) {
	    arr2[i] = arr[i];
	  }

	  return arr2;
	}

	var arrayLikeToArray = _arrayLikeToArray;

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
	}

	var unsupportedIterableToArray = _unsupportedIterableToArray;

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

	function detachBefore(after) {
	  while (after.previousSibling) {
	    after.parentNode.removeChild(after.previousSibling);
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

	/* visualize/TabNav.html generated by Svelte v2.16.1 */
	var allTabs = [{
	  id: 'pick',
	  title: __('Chart type')
	}, {
	  id: 'refine',
	  title: __('Refine')
	}, {
	  id: 'annotate',
	  title: __('Annotate')
	}, {
	  id: 'design',
	  title: __('Design')
	}];

	function tabs(_ref) {
	  var showChartPicker = _ref.showChartPicker;
	  return showChartPicker ? allTabs : allTabs.slice(1);
	}

	function data() {
	  return {
	    showChartPicker: true,
	    visLoading: false
	  };
	}

	function onstate(_ref2) {
	  var changed = _ref2.changed,
	      current = _ref2.current,
	      previous = _ref2.previous;

	  if (changed.tab && previous && current.tab) {
	    window.location.hash = '#' + current.tab;
	  }
	}
	var file = "visualize/TabNav.html";

	function click_handler(event) {
	  event.preventDefault();
	  var _this$_svelte = this._svelte,
	      component = _this$_svelte.component,
	      ctx = _this$_svelte.ctx;
	  component.set({
	    tab: ctx.t.id
	  });
	}

	function get_each_context(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.t = list[i];
	  return child_ctx;
	}

	function create_main_fragment(component, ctx) {
	  var div, ul;
	  var each_value = ctx.tabs;
	  var each_blocks = [];

	  for (var i = 0; i < each_value.length; i += 1) {
	    each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
	  }

	  return {
	    c: function create() {
	      div = createElement("div");
	      ul = createElement("ul");

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].c();
	      }

	      ul.className = "nav nav-tabs visualize-nav-tabs";
	      addLoc(ul, file, 1, 4, 39);
	      setStyle(div, "margin-bottom", "20px");
	      addLoc(div, file, 0, 0, 0);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);
	      append(div, ul);

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].m(ul, null);
	      }
	    },
	    p: function update(changed, ctx) {
	      if (changed.tab || changed.tabs) {
	        each_value = ctx.tabs;

	        for (var i = 0; i < each_value.length; i += 1) {
	          var child_ctx = get_each_context(ctx, each_value, i);

	          if (each_blocks[i]) {
	            each_blocks[i].p(changed, child_ctx);
	          } else {
	            each_blocks[i] = create_each_block(component, child_ctx);
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
	        detachNode(div);
	      }

	      destroyEach(each_blocks, detach);
	    }
	  };
	} // (3:8) {#each tabs as t}


	function create_each_block(component, ctx) {
	  var li,
	      a,
	      raw_value = ctx.t.title,
	      a_href_value,
	      text;
	  return {
	    c: function create() {
	      li = createElement("li");
	      a = createElement("a");
	      text = createText("\n        ");
	      a._svelte = {
	        component: component,
	        ctx: ctx
	      };
	      addListener(a, "click", click_handler);
	      a.href = a_href_value = "#" + ctx.t.id;
	      addLoc(a, file, 4, 12, 163);
	      toggleClass(li, "active", ctx.tab === ctx.t.id);
	      addLoc(li, file, 3, 8, 118);
	    },
	    m: function mount(target, anchor) {
	      insert(target, li, anchor);
	      append(li, a);
	      a.innerHTML = raw_value;
	      append(li, text);
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;

	      if (changed.tabs && raw_value !== (raw_value = ctx.t.title)) {
	        a.innerHTML = raw_value;
	      }

	      a._svelte.ctx = ctx;

	      if (changed.tabs && a_href_value !== (a_href_value = "#" + ctx.t.id)) {
	        a.href = a_href_value;
	      }

	      if (changed.tab || changed.tabs) {
	        toggleClass(li, "active", ctx.tab === ctx.t.id);
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(li);
	      }

	      removeListener(a, "click", click_handler);
	    }
	  };
	}

	function TabNav(options) {
	  var _this = this;

	  this._debugName = '<TabNav>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data(), options.data);

	  this._recompute({
	    showChartPicker: 1
	  }, this._state);

	  if (!('showChartPicker' in this._state)) console.warn("<TabNav> was created without expected data property 'showChartPicker'");
	  if (!('tab' in this._state)) console.warn("<TabNav> was created without expected data property 'tab'");
	  this._intro = true;
	  this._handlers.state = [onstate];
	  onstate.call(this, {
	    changed: assignTrue({}, this._state),
	    current: this._state
	  });
	  this._fragment = create_main_fragment(this, this._state);

	  this.root._oncreate.push(function () {
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

	assign(TabNav.prototype, protoDev);

	TabNav.prototype._checkReadOnly = function _checkReadOnly(newState) {
	  if ('tabs' in newState && !this._updatingReadonlyProperty) throw new Error("<TabNav>: Cannot set read-only property 'tabs'");
	};

	TabNav.prototype._recompute = function _recompute(changed, state) {
	  if (changed.showChartPicker) {
	    if (this._differs(state.tabs, state.tabs = tabs(state))) changed.tabs = true;
	  }
	};

	/* visualize/ButtonNav.html generated by Svelte v2.16.1 */

	function data$1() {
	  return {
	    showChartPicker: false
	  };
	}
	var methods = {
	  back: function back() {
	    var _this$get = this.get(),
	        tab = _this$get.tab,
	        showChartPicker = _this$get.showChartPicker;

	    if (tab === 'refine' && !showChartPicker || tab === 'pick') window.location.href = 'data';else if (tab === 'refine' && showChartPicker) this.set({
	      tab: 'pick'
	    });else if (tab === 'annotate') this.set({
	      tab: 'refine'
	    });else if (tab === 'design') this.set({
	      tab: 'annotate'
	    });
	  },
	  proceed: function proceed() {
	    var _this$get2 = this.get(),
	        tab = _this$get2.tab;

	    if (tab === 'design') window.location.href = 'publish';else if (tab === 'annotate') this.set({
	      tab: 'design'
	    });else if (tab === 'refine') this.set({
	      tab: 'annotate'
	    });else if (tab === 'pick') this.set({
	      tab: 'refine'
	    });
	  }
	};
	var file$1 = "visualize/ButtonNav.html";

	function create_main_fragment$1(component, ctx) {
	  var div,
	      a0,
	      i0,
	      text0,
	      text1_value = __("Back"),
	      text1,
	      text2,
	      a1,
	      text3_value = __("Proceed"),
	      text3,
	      text4,
	      i1;

	  function click_handler(event) {
	    event.preventDefault();
	    component.back();
	  }

	  function click_handler_1(event) {
	    event.preventDefault();
	    component.proceed();
	  }

	  return {
	    c: function create() {
	      div = createElement("div");
	      a0 = createElement("a");
	      i0 = createElement("i");
	      text0 = createText(" ");
	      text1 = createText(text1_value);
	      text2 = createText("\n    ");
	      a1 = createElement("a");
	      text3 = createText(text3_value);
	      text4 = createText(" ");
	      i1 = createElement("i");
	      i0.className = "fa fa-chevron-left fa-fw icon-btn-left";
	      addLoc(i0, file$1, 2, 9, 138);
	      addListener(a0, "click", click_handler);
	      a0.className = "btn submitk";
	      a0.href = "#back";
	      addLoc(a0, file$1, 1, 4, 60);
	      i1.className = "fa fa-chevron-right fa-fw icon-btn-right";
	      addLoc(i1, file$1, 5, 25, 332);
	      addListener(a1, "click", click_handler_1);
	      a1.className = "btn submit btn-primary";
	      a1.href = "#proceed";
	      addLoc(a1, file$1, 4, 4, 220);
	      div.className = "btn-group buttons";
	      setStyle(div, "margin", "20px 0");
	      addLoc(div, file$1, 0, 0, 0);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);
	      append(div, a0);
	      append(a0, i0);
	      append(a0, text0);
	      append(a0, text1);
	      append(div, text2);
	      append(div, a1);
	      append(a1, text3);
	      append(a1, text4);
	      append(a1, i1);
	    },
	    p: noop,
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div);
	      }

	      removeListener(a0, "click", click_handler);
	      removeListener(a1, "click", click_handler_1);
	    }
	  };
	}

	function ButtonNav(options) {
	  this._debugName = '<ButtonNav>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data$1(), options.data);
	  this._intro = true;
	  this._fragment = create_main_fragment$1(this, this._state);

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);
	  }
	}

	assign(ButtonNav.prototype, protoDev);
	assign(ButtonNav.prototype, methods);

	ButtonNav.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	/* visualize/Empty.html generated by Svelte v2.16.1 */

	function create_main_fragment$2(component, ctx) {
	  return {
	    c: noop,
	    m: noop,
	    p: noop,
	    d: noop
	  };
	}

	function Empty(options) {
	  this._debugName = '<Empty>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign({}, options.data);
	  this._intro = true;
	  this._fragment = create_main_fragment$2(this, this._state);

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);
	  }
	}

	assign(Empty.prototype, protoDev);

	Empty.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

	function data$2() {
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
	var file$2 = "node_modules/datawrapper/controls/ControlGroup.html";

	function create_main_fragment$3(component, ctx) {
	  var div1,
	      text0,
	      div0,
	      slot_content_default = component._slotted.default,
	      text1,
	      div1_class_value;
	  var if_block0 = ctx.label && create_if_block_1(component, ctx);
	  var if_block1 = ctx.help && create_if_block(component, ctx);
	  return {
	    c: function create() {
	      div1 = createElement("div");
	      if (if_block0) if_block0.c();
	      text0 = createText("\n    ");
	      div0 = createElement("div");
	      text1 = createText("\n    ");
	      if (if_block1) if_block1.c();
	      div0.className = "controls svelte-p72242";
	      setStyle(div0, "width", "calc(100% - " + (ctx.width || def.width) + " - 32px)");
	      toggleClass(div0, "form-inline", ctx.inline);
	      addLoc(div0, file$2, 4, 4, 218);
	      div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-p72242";
	      addLoc(div1, file$2, 0, 0, 0);
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
	    },
	    p: function update(changed, ctx) {
	      if (ctx.label) {
	        if (if_block0) {
	          if_block0.p(changed, ctx);
	        } else {
	          if_block0 = create_if_block_1(component, ctx);
	          if_block0.c();
	          if_block0.m(div1, text0);
	        }
	      } else if (if_block0) {
	        if_block0.d(1);
	        if_block0 = null;
	      }

	      if (changed.width) {
	        setStyle(div0, "width", "calc(100% - " + (ctx.width || def.width) + " - 32px)");
	      }

	      if (changed.inline) {
	        toggleClass(div0, "form-inline", ctx.inline);
	      }

	      if (ctx.help) {
	        if (if_block1) {
	          if_block1.p(changed, ctx);
	        } else {
	          if_block1 = create_if_block(component, ctx);
	          if_block1.c();
	          if_block1.m(div1, null);
	        }
	      } else if (if_block1) {
	        if_block1.d(1);
	        if_block1 = null;
	      }

	      if ((changed.type || changed.valign) && div1_class_value !== (div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-p72242")) {
	        div1.className = div1_class_value;
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
	    }
	  };
	} // (2:4) {#if label}


	function create_if_block_1(component, ctx) {
	  var label;
	  return {
	    c: function create() {
	      label = createElement("label");
	      setStyle(label, "width", ctx.width || def.width);
	      label.className = "control-label svelte-p72242";
	      toggleClass(label, "disabled", ctx.disabled);
	      addLoc(label, file$2, 2, 4, 104);
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
	} // (8:4) {#if help}


	function create_if_block(component, ctx) {
	  var p, p_class_value;
	  return {
	    c: function create() {
	      p = createElement("p");
	      setStyle(p, "padding-left", ctx.inline ? 0 : ctx.width || def.width);
	      p.className = p_class_value = "mini-help " + ctx.type + " svelte-p72242";
	      toggleClass(p, "mini-help-block", !ctx.inline);
	      addLoc(p, file$2, 8, 4, 369);
	    },
	    m: function mount(target, anchor) {
	      insert(target, p, anchor);
	      p.innerHTML = ctx.help;
	    },
	    p: function update(changed, ctx) {
	      if (changed.help) {
	        p.innerHTML = ctx.help;
	      }

	      if (changed.inline || changed.width) {
	        setStyle(p, "padding-left", ctx.inline ? 0 : ctx.width || def.width);
	      }

	      if (changed.type && p_class_value !== (p_class_value = "mini-help " + ctx.type + " svelte-p72242")) {
	        p.className = p_class_value;
	      }

	      if (changed.type || changed.inline) {
	        toggleClass(p, "mini-help-block", !ctx.inline);
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
	  this._state = assign(data$2(), options.data);
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

	function data$3() {
	  return {
	    disabled: false,
	    width: 'auto',
	    labelWidth: 'auto',
	    options: [],
	    optgroups: []
	  };
	}
	var file$3 = "node_modules/datawrapper/controls/BaseSelect.html";

	function get_each_context_2(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.opt = list[i];
	  return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
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
	  var if_block0 = ctx.options.length && create_if_block_1$1(component, ctx);
	  var if_block1 = ctx.optgroups.length && create_if_block$1(component, ctx);

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
	      addLoc(select, file$3, 0, 0, 0);
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
	          if_block0 = create_if_block_1$1(component, ctx);
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
	          if_block1 = create_if_block$1(component, ctx);
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


	function create_if_block_1$1(component, ctx) {
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
	      addLoc(option, file$3, 2, 4, 145);
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


	function create_if_block$1(component, ctx) {
	  var each_anchor;
	  var each_value_1 = ctx.optgroups;
	  var each_blocks = [];

	  for (var i = 0; i < each_value_1.length; i += 1) {
	    each_blocks[i] = create_each_block$1(component, get_each_context_1(ctx, each_value_1, i));
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
	          var child_ctx = get_each_context_1(ctx, each_value_1, i);

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


	function create_each_block_1(component, ctx) {
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
	      addLoc(option, file$3, 6, 8, 353);
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
	    each_blocks[i] = create_each_block_1(component, get_each_context_2(ctx, each_value_2, i));
	  }

	  return {
	    c: function create() {
	      optgroup = createElement("optgroup");

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].c();
	      }

	      setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
	      addLoc(optgroup, file$3, 4, 4, 269);
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
	            each_blocks[i] = create_each_block_1(component, child_ctx);
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
	  this._state = assign(data$3(), options.data);
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

	function controlWidth(_ref) {
	  var inline = _ref.inline,
	      width = _ref.width;
	  return inline ? width || 'auto' : width;
	}

	function labelWidth(_ref2) {
	  var inline = _ref2.inline,
	      labelWidth = _ref2.labelWidth;
	  return inline ? labelWidth || 'auto' : labelWidth;
	}

	function data$4() {
	  return {
	    disabled: false,
	    width: null,
	    labelWidth: null,
	    options: [],
	    optgroups: [],
	    valign: 'middle',
	    inline: true,
	    help: ''
	  };
	}

	function create_main_fragment$5(component, ctx) {
	  var baseselect_updating = {},
	      controlgroup_updating = {};
	  var baseselect_initial_data = {
	    width: ctx.controlWidth
	  };

	  if (ctx.value !== void 0) {
	    baseselect_initial_data.value = ctx.value;
	    baseselect_updating.value = true;
	  }

	  if (ctx.disabled !== void 0) {
	    baseselect_initial_data.disabled = ctx.disabled;
	    baseselect_updating.disabled = true;
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
	      options: 1,
	      optgroups: 1
	    }, baseselect.get());
	  });

	  var controlgroup_initial_data = {
	    width: ctx.labelWidth,
	    type: "select"
	  };

	  if (ctx.valign !== void 0) {
	    controlgroup_initial_data.valign = ctx.valign;
	    controlgroup_updating.valign = true;
	  }

	  if (ctx.label !== void 0) {
	    controlgroup_initial_data.label = ctx.label;
	    controlgroup_updating.label = true;
	  }

	  if (ctx.disabled !== void 0) {
	    controlgroup_initial_data.disabled = ctx.disabled;
	    controlgroup_updating.disabled = true;
	  }

	  if (ctx.help !== void 0) {
	    controlgroup_initial_data.help = ctx.help;
	    controlgroup_updating.help = true;
	  }

	  if (ctx.inline !== void 0) {
	    controlgroup_initial_data.inline = ctx.inline;
	    controlgroup_updating.inline = true;
	  }

	  var controlgroup = new ControlGroup({
	    root: component.root,
	    store: component.store,
	    slots: {
	      default: createFragment()
	    },
	    data: controlgroup_initial_data,
	    _bind: function _bind(changed, childState) {
	      var newState = {};

	      if (!controlgroup_updating.valign && changed.valign) {
	        newState.valign = childState.valign;
	      }

	      if (!controlgroup_updating.label && changed.label) {
	        newState.label = childState.label;
	      }

	      if (!controlgroup_updating.disabled && changed.disabled) {
	        newState.disabled = childState.disabled;
	      }

	      if (!controlgroup_updating.help && changed.help) {
	        newState.help = childState.help;
	      }

	      if (!controlgroup_updating.inline && changed.inline) {
	        newState.inline = childState.inline;
	      }

	      component._set(newState);

	      controlgroup_updating = {};
	    }
	  });

	  component.root._beforecreate.push(function () {
	    controlgroup._bind({
	      valign: 1,
	      label: 1,
	      disabled: 1,
	      help: 1,
	      inline: 1
	    }, controlgroup.get());
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
	      if (changed.controlWidth) baseselect_changes.width = ctx.controlWidth;

	      if (!baseselect_updating.value && changed.value) {
	        baseselect_changes.value = ctx.value;
	        baseselect_updating.value = ctx.value !== void 0;
	      }

	      if (!baseselect_updating.disabled && changed.disabled) {
	        baseselect_changes.disabled = ctx.disabled;
	        baseselect_updating.disabled = ctx.disabled !== void 0;
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

	      if (!controlgroup_updating.valign && changed.valign) {
	        controlgroup_changes.valign = ctx.valign;
	        controlgroup_updating.valign = ctx.valign !== void 0;
	      }

	      if (!controlgroup_updating.label && changed.label) {
	        controlgroup_changes.label = ctx.label;
	        controlgroup_updating.label = ctx.label !== void 0;
	      }

	      if (!controlgroup_updating.disabled && changed.disabled) {
	        controlgroup_changes.disabled = ctx.disabled;
	        controlgroup_updating.disabled = ctx.disabled !== void 0;
	      }

	      if (!controlgroup_updating.help && changed.help) {
	        controlgroup_changes.help = ctx.help;
	        controlgroup_updating.help = ctx.help !== void 0;
	      }

	      if (!controlgroup_updating.inline && changed.inline) {
	        controlgroup_changes.inline = ctx.inline;
	        controlgroup_updating.inline = ctx.inline !== void 0;
	      }

	      controlgroup._set(controlgroup_changes);

	      controlgroup_updating = {};
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
	  this._state = assign(data$4(), options.data);

	  this._recompute({
	    inline: 1,
	    width: 1,
	    labelWidth: 1
	  }, this._state);

	  if (!('inline' in this._state)) console.warn("<Select> was created without expected data property 'inline'");
	  if (!('width' in this._state)) console.warn("<Select> was created without expected data property 'width'");
	  if (!('valign' in this._state)) console.warn("<Select> was created without expected data property 'valign'");
	  if (!('label' in this._state)) console.warn("<Select> was created without expected data property 'label'");
	  if (!('disabled' in this._state)) console.warn("<Select> was created without expected data property 'disabled'");
	  if (!('help' in this._state)) console.warn("<Select> was created without expected data property 'help'");
	  if (!('value' in this._state)) console.warn("<Select> was created without expected data property 'value'");
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

	Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
	  if ('controlWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Select>: Cannot set read-only property 'controlWidth'");
	  if ('labelWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Select>: Cannot set read-only property 'labelWidth'");
	};

	Select.prototype._recompute = function _recompute(changed, state) {
	  if (changed.inline || changed.width) {
	    if (this._differs(state.controlWidth, state.controlWidth = controlWidth(state))) changed.controlWidth = true;
	  }

	  if (changed.inline || changed.labelWidth) {
	    if (this._differs(state.labelWidth, state.labelWidth = labelWidth(state))) changed.labelWidth = true;
	  }
	};

	/* visualize/Design.html generated by Svelte v2.16.1 */

	function themeOptions(_ref) {
	  var $themes = _ref.$themes;
	  return $themes.map(function (t) {
	    return {
	      value: t.id,
	      label: t.title
	    };
	  });
	}

	function data$5() {
	  return {
	    designBlocks: []
	  };
	}

	function oncreate() {
	  var chart = this.store;

	  var _dw$backend$hooks$cal = dw.backend.hooks.call('design-blocks', [chart]),
	      results = _dw$backend$hooks$cal.results;

	  this.set({
	    designBlocks: results.sort(function (a, b) {
	      return (b.priority || 0) - (a.priority || 0);
	    })
	  });
	}

	function get_each_context$2(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.b = list[i];
	  return child_ctx;
	}

	function create_main_fragment$6(component, ctx) {
	  var selectinput_updating = {},
	      text,
	      each_anchor;
	  var selectinput_initial_data = {
	    label: "Select layout:",
	    options: ctx.themeOptions,
	    labelWidth: "100px",
	    width: "200px"
	  };

	  if (ctx.$theme !== void 0) {
	    selectinput_initial_data.value = ctx.$theme;
	    selectinput_updating.value = true;
	  }

	  var selectinput = new Select({
	    root: component.root,
	    store: component.store,
	    data: selectinput_initial_data,
	    _bind: function _bind(changed, childState) {
	      var newStoreState = {};

	      if (!selectinput_updating.value && changed.value) {
	        newStoreState.theme = childState.value;
	      }

	      component.store.set(newStoreState);
	      selectinput_updating = {};
	    }
	  });

	  component.root._beforecreate.push(function () {
	    selectinput._bind({
	      value: 1
	    }, selectinput.get());
	  });

	  var each_value = ctx.designBlocks;
	  var each_blocks = [];

	  for (var i = 0; i < each_value.length; i += 1) {
	    each_blocks[i] = create_each_block$2(component, get_each_context$2(ctx, each_value, i));
	  }

	  return {
	    c: function create() {
	      selectinput._fragment.c();

	      text = createText("\n\n");

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].c();
	      }

	      each_anchor = createComment();
	    },
	    m: function mount(target, anchor) {
	      selectinput._mount(target, anchor);

	      insert(target, text, anchor);

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].m(target, anchor);
	      }

	      insert(target, each_anchor, anchor);
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;
	      var selectinput_changes = {};
	      if (changed.themeOptions) selectinput_changes.options = ctx.themeOptions;

	      if (!selectinput_updating.value && changed.$theme) {
	        selectinput_changes.value = ctx.$theme;
	        selectinput_updating.value = ctx.$theme !== void 0;
	      }

	      selectinput._set(selectinput_changes);

	      selectinput_updating = {};

	      if (changed.designBlocks) {
	        each_value = ctx.designBlocks;

	        for (var i = 0; i < each_value.length; i += 1) {
	          var child_ctx = get_each_context$2(ctx, each_value, i);

	          if (each_blocks[i]) {
	            each_blocks[i].p(changed, child_ctx);
	          } else {
	            each_blocks[i] = create_each_block$2(component, child_ctx);
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
	      selectinput.destroy(detach);

	      if (detach) {
	        detachNode(text);
	      }

	      destroyEach(each_blocks, detach);

	      if (detach) {
	        detachNode(each_anchor);
	      }
	    }
	  };
	} // (9:0) {#each designBlocks as b}


	function create_each_block$2(component, ctx) {
	  var switch_instance_anchor;
	  var switch_value = ctx.b.ui;

	  function switch_props(ctx) {
	    var switch_instance_initial_data = {
	      name: ctx.b.name,
	      data: ctx.b.data || {}
	    };
	    return {
	      root: component.root,
	      store: component.store,
	      data: switch_instance_initial_data
	    };
	  }

	  if (switch_value) {
	    var switch_instance = new switch_value(switch_props(ctx));
	  }

	  return {
	    c: function create() {
	      if (switch_instance) switch_instance._fragment.c();
	      switch_instance_anchor = createComment();
	    },
	    m: function mount(target, anchor) {
	      if (switch_instance) {
	        switch_instance._mount(target, anchor);
	      }

	      insert(target, switch_instance_anchor, anchor);
	    },
	    p: function update(changed, ctx) {
	      var switch_instance_changes = {};
	      if (changed.designBlocks) switch_instance_changes.name = ctx.b.name;
	      if (changed.designBlocks) switch_instance_changes.data = ctx.b.data || {};

	      if (switch_value !== (switch_value = ctx.b.ui)) {
	        if (switch_instance) {
	          switch_instance.destroy();
	        }

	        if (switch_value) {
	          switch_instance = new switch_value(switch_props(ctx));

	          switch_instance._fragment.c();

	          switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
	        } else {
	          switch_instance = null;
	        }
	      } else if (switch_value) {
	        switch_instance._set(switch_instance_changes);
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(switch_instance_anchor);
	      }

	      if (switch_instance) switch_instance.destroy(detach);
	    }
	  };
	}

	function Design(options) {
	  var _this = this;

	  this._debugName = '<Design>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  if (!options.store) {
	    throw new Error("<Design> references store properties, but no store was provided");
	  }

	  init(this, options);
	  this._state = assign(assign(this.store._init(["themes", "theme"]), data$5()), options.data);

	  this.store._add(this, ["themes", "theme"]);

	  this._recompute({
	    $themes: 1
	  }, this._state);

	  if (!('$themes' in this._state)) console.warn("<Design> was created without expected data property '$themes'");
	  if (!('$theme' in this._state)) console.warn("<Design> was created without expected data property '$theme'");
	  if (!('designBlocks' in this._state)) console.warn("<Design> was created without expected data property 'designBlocks'");
	  this._intro = true;
	  this._handlers.destroy = [removeFromStore];
	  this._fragment = create_main_fragment$6(this, this._state);

	  this.root._oncreate.push(function () {
	    oncreate.call(_this);

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

	assign(Design.prototype, protoDev);

	Design.prototype._checkReadOnly = function _checkReadOnly(newState) {
	  if ('themeOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<Design>: Cannot set read-only property 'themeOptions'");
	};

	Design.prototype._recompute = function _recompute(changed, state) {
	  if (changed.$themes) {
	    if (this._differs(state.themeOptions, state.themeOptions = themeOptions(state))) changed.themeOptions = true;
	  }
	};

	/* visualize/ChartPicker.html generated by Svelte v2.16.1 */

	function archiveOpts(_ref) {
	  var visArchive = _ref.visArchive;
	  return [{
	    value: null,
	    label: '---'
	  }].concat(visArchive.map(function (vis) {
	    return {
	      value: vis.id,
	      label: vis.title
	    };
	  }));
	}
	var methods$1 = {
	  loadVis: function loadVis(id) {
	    var _this$store$get = this.store.get(),
	        type = _this$store$get.type;

	    if (id !== type) {
	      this.fire('change', id);
	    }
	  }
	};
	var file$4 = "visualize/ChartPicker.html";

	function click_handler$1(event) {
	  var _this$_svelte = this._svelte,
	      component = _this$_svelte.component,
	      ctx = _this$_svelte.ctx;
	  component.loadVis(ctx.vis.id);
	}

	function get_each_context$3(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.vis = list[i];
	  return child_ctx;
	}

	function create_main_fragment$7(component, ctx) {
	  var div3,
	      div2,
	      div0,
	      text0,
	      div1,
	      text1,
	      p,
	      b,
	      text2_value = __("Hint"),
	      text2,
	      text3,
	      text4,
	      text5_value = __('visualize / transpose-hint'),
	      text5;

	  var each_value = ctx.visualizations;
	  var each_blocks = [];

	  for (var i = 0; i < each_value.length; i += 1) {
	    each_blocks[i] = create_each_block$3(component, get_each_context$3(ctx, each_value, i));
	  }

	  var selectinput_initial_data = {
	    options: ctx.archiveOpts,
	    label: __('visualize / vis archive')
	  };
	  var selectinput = new Select({
	    root: component.root,
	    store: component.store,
	    data: selectinput_initial_data
	  });
	  return {
	    c: function create() {
	      div3 = createElement("div");
	      div2 = createElement("div");
	      div0 = createElement("div");

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].c();
	      }

	      text0 = createText("\n\n        ");
	      div1 = createElement("div");

	      selectinput._fragment.c();

	      text1 = createText("\n\n        ");
	      p = createElement("p");
	      b = createElement("b");
	      text2 = createText(text2_value);
	      text3 = createText(":");
	      text4 = createText(" ");
	      text5 = createText(text5_value);
	      div0.className = "vis-thumbs";
	      addLoc(div0, file$4, 2, 8, 91);
	      div1.className = "vis-archive-select";
	      addLoc(div1, file$4, 11, 8, 408);
	      addLoc(b, file$4, 15, 11, 560);
	      addLoc(p, file$4, 15, 8, 557);
	      div2.className = "vis-selector-unfolded";
	      addLoc(div2, file$4, 1, 4, 47);
	      div3.className = "section select-visualization";
	      addLoc(div3, file$4, 0, 0, 0);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div3, anchor);
	      append(div3, div2);
	      append(div2, div0);

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].m(div0, null);
	      }

	      append(div2, text0);
	      append(div2, div1);

	      selectinput._mount(div1, null);

	      append(div2, text1);
	      append(div2, p);
	      append(p, b);
	      append(b, text2);
	      append(b, text3);
	      append(p, text4);
	      append(p, text5);
	    },
	    p: function update(changed, ctx) {
	      if (changed.visualizations || changed.$type) {
	        each_value = ctx.visualizations;

	        for (var i = 0; i < each_value.length; i += 1) {
	          var child_ctx = get_each_context$3(ctx, each_value, i);

	          if (each_blocks[i]) {
	            each_blocks[i].p(changed, child_ctx);
	          } else {
	            each_blocks[i] = create_each_block$3(component, child_ctx);
	            each_blocks[i].c();
	            each_blocks[i].m(div0, null);
	          }
	        }

	        for (; i < each_blocks.length; i += 1) {
	          each_blocks[i].d(1);
	        }

	        each_blocks.length = each_value.length;
	      }

	      var selectinput_changes = {};
	      if (changed.archiveOpts) selectinput_changes.options = ctx.archiveOpts;

	      selectinput._set(selectinput_changes);
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div3);
	      }

	      destroyEach(each_blocks, detach);
	      selectinput.destroy();
	    }
	  };
	} // (4:12) {#each visualizations as vis}


	function create_each_block$3(component, ctx) {
	  var div1,
	      raw0_value = ctx.vis.icon,
	      raw0_after,
	      text,
	      div0,
	      raw1_value = ctx.vis.title;
	  return {
	    c: function create() {
	      div1 = createElement("div");
	      raw0_after = createElement('noscript');
	      text = createText("\n                ");
	      div0 = createElement("div");
	      div0.className = "title";
	      addLoc(div0, file$4, 6, 16, 302);
	      div1._svelte = {
	        component: component,
	        ctx: ctx
	      };
	      addListener(div1, "click", click_handler$1);
	      div1.className = "vis-thumb";
	      toggleClass(div1, "active", ctx.vis.id === ctx.$type);
	      addLoc(div1, file$4, 4, 12, 170);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div1, anchor);
	      append(div1, raw0_after);
	      raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
	      append(div1, text);
	      append(div1, div0);
	      div0.innerHTML = raw1_value;
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;

	      if (changed.visualizations && raw0_value !== (raw0_value = ctx.vis.icon)) {
	        detachBefore(raw0_after);
	        raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
	      }

	      if (changed.visualizations && raw1_value !== (raw1_value = ctx.vis.title)) {
	        div0.innerHTML = raw1_value;
	      }

	      div1._svelte.ctx = ctx;

	      if (changed.visualizations || changed.$type) {
	        toggleClass(div1, "active", ctx.vis.id === ctx.$type);
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div1);
	      }

	      removeListener(div1, "click", click_handler$1);
	    }
	  };
	}

	function ChartPicker(options) {
	  this._debugName = '<ChartPicker>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  if (!options.store) {
	    throw new Error("<ChartPicker> references store properties, but no store was provided");
	  }

	  init(this, options);
	  this._state = assign(this.store._init(["type"]), options.data);

	  this.store._add(this, ["type"]);

	  this._recompute({
	    visArchive: 1
	  }, this._state);

	  if (!('visArchive' in this._state)) console.warn("<ChartPicker> was created without expected data property 'visArchive'");
	  if (!('visualizations' in this._state)) console.warn("<ChartPicker> was created without expected data property 'visualizations'");
	  if (!('$type' in this._state)) console.warn("<ChartPicker> was created without expected data property '$type'");
	  this._intro = true;
	  this._handlers.destroy = [removeFromStore];
	  this._fragment = create_main_fragment$7(this, this._state);

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);

	    flush(this);
	  }
	}

	assign(ChartPicker.prototype, protoDev);
	assign(ChartPicker.prototype, methods$1);

	ChartPicker.prototype._checkReadOnly = function _checkReadOnly(newState) {
	  if ('archiveOpts' in newState && !this._updatingReadonlyProperty) throw new Error("<ChartPicker>: Cannot set read-only property 'archiveOpts'");
	};

	ChartPicker.prototype._recompute = function _recompute(changed, state) {
	  if (changed.visArchive) {
	    if (this._differs(state.archiveOpts, state.archiveOpts = archiveOpts(state))) changed.archiveOpts = true;
	  }
	};

	/* visualize/Loading.html generated by Svelte v2.16.1 */
	var file$5 = "visualize/Loading.html";

	function create_main_fragment$8(component, ctx) {
	  var p,
	      i,
	      text0,
	      text1_value = __('svelte-option / loading'),
	      text1;

	  return {
	    c: function create() {
	      p = createElement("p");
	      i = createElement("i");
	      text0 = createText(" ");
	      text1 = createText(text1_value);
	      i.className = "fa fa-circle-o-notch fa-spin fa-cog";
	      addLoc(i, file$5, 1, 4, 29);
	      setStyle(p, "color", "#777");
	      addLoc(p, file$5, 0, 0, 0);
	    },
	    m: function mount(target, anchor) {
	      insert(target, p, anchor);
	      append(p, i);
	      append(p, text0);
	      append(p, text1);
	    },
	    p: noop,
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(p);
	      }
	    }
	  };
	}

	function Loading(options) {
	  this._debugName = '<Loading>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign({}, options.data);
	  this._intro = true;
	  this._fragment = create_main_fragment$8(this, this._state);

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);
	  }
	}

	assign(Loading.prototype, protoDev);

	Loading.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	/* globals dw */
	var __messages$1 = {};

	function initMessages$1() {
	  var scope = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'core';

	  // let's check if we're in a chart
	  if (scope === 'chart') {
	    if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
	      // use in-chart translations
	      __messages$1[scope] = window.__dw.vis.meta.locale || {};
	    }
	  } else {
	    // use backend translations
	    __messages$1[scope] = scope === 'core' ? dw.backend.__messages.core : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
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


	function __$1(key) {
	  var _arguments = arguments;
	  var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'core';
	  key = key.trim();
	  if (!__messages$1[scope]) initMessages$1(scope);
	  if (!__messages$1[scope][key]) return 'MISSING:' + key;
	  var translation = __messages$1[scope][key];

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

	/* node_modules/@datawrapper/controls/editor/ChartDescription.html generated by Svelte v2.16.1 */
	var file$6 = "node_modules/datawrapper/controls/editor/ChartDescription.html";

	function create_main_fragment$9(component, ctx) {
	  var div5,
	      div0,
	      label0,
	      input0,
	      text0,
	      text1_value = __$1('annotate / hide-title'),
	      text1,
	      text2,
	      label1,
	      text3_value = __$1('Title'),
	      text3,
	      text4,
	      input1,
	      input1_updating = false,
	      text5,
	      label2,
	      text6_value = __$1('Description'),
	      text6,
	      text7,
	      textarea,
	      textarea_updating = false,
	      text8,
	      label3,
	      text9_value = __$1('Notes'),
	      text9,
	      text10,
	      input2,
	      input2_updating = false,
	      text11,
	      div3,
	      div1,
	      label4,
	      text12_value = __$1('Source name'),
	      text12,
	      text13,
	      input3,
	      input3_updating = false,
	      text14,
	      div2,
	      label5,
	      text15_value = __$1('Source URL'),
	      text15,
	      text16,
	      input4,
	      input4_updating = false,
	      text17,
	      div4,
	      label6,
	      text18_value = __$1('visualize / annotate / byline'),
	      text18,
	      text19,
	      input5,
	      input5_updating = false;

	  function input0_change_handler() {
	    var $ = component.store.get();
	    ctx.$metadata.describe['hide-title'] = input0.checked;
	    component.store.set({
	      metadata: $.metadata
	    });
	  }

	  function input1_input_handler() {
	    input1_updating = true;
	    component.store.set({
	      title: input1.value
	    });
	    input1_updating = false;
	  }

	  function textarea_input_handler() {
	    var $ = component.store.get();
	    textarea_updating = true;
	    ctx.$metadata.describe.intro = textarea.value;
	    component.store.set({
	      metadata: $.metadata
	    });
	    textarea_updating = false;
	  }

	  function input2_input_handler() {
	    var $ = component.store.get();
	    input2_updating = true;
	    ctx.$metadata.annotate.notes = input2.value;
	    component.store.set({
	      metadata: $.metadata
	    });
	    input2_updating = false;
	  }

	  function input3_input_handler() {
	    var $ = component.store.get();
	    input3_updating = true;
	    ctx.$metadata.describe['source-name'] = input3.value;
	    component.store.set({
	      metadata: $.metadata
	    });
	    input3_updating = false;
	  }

	  function input4_input_handler() {
	    var $ = component.store.get();
	    input4_updating = true;
	    ctx.$metadata.describe['source-url'] = input4.value;
	    component.store.set({
	      metadata: $.metadata
	    });
	    input4_updating = false;
	  }

	  function input5_input_handler() {
	    var $ = component.store.get();
	    input5_updating = true;
	    ctx.$metadata.describe.byline = input5.value;
	    component.store.set({
	      metadata: $.metadata
	    });
	    input5_updating = false;
	  }

	  return {
	    c: function create() {
	      div5 = createElement("div");
	      div0 = createElement("div");
	      label0 = createElement("label");
	      input0 = createElement("input");
	      text0 = createText(" ");
	      text1 = createText(text1_value);
	      text2 = createText("\n\n        ");
	      label1 = createElement("label");
	      text3 = createText(text3_value);
	      text4 = createText("\n        ");
	      input1 = createElement("input");
	      text5 = createText("\n\n        ");
	      label2 = createElement("label");
	      text6 = createText(text6_value);
	      text7 = createText("\n        ");
	      textarea = createElement("textarea");
	      text8 = createText("\n\n        ");
	      label3 = createElement("label");
	      text9 = createText(text9_value);
	      text10 = createText("\n        ");
	      input2 = createElement("input");
	      text11 = createText("\n\n    ");
	      div3 = createElement("div");
	      div1 = createElement("div");
	      label4 = createElement("label");
	      text12 = createText(text12_value);
	      text13 = createText("\n            ");
	      input3 = createElement("input");
	      text14 = createText("\n        ");
	      div2 = createElement("div");
	      label5 = createElement("label");
	      text15 = createText(text15_value);
	      text16 = createText("\n            ");
	      input4 = createElement("input");
	      text17 = createText("\n\n    ");
	      div4 = createElement("div");
	      label6 = createElement("label");
	      text18 = createText(text18_value);
	      text19 = createText("\n        ");
	      input5 = createElement("input");
	      addListener(input0, "change", input0_change_handler);
	      setAttribute(input0, "type", "checkbox");
	      input0.className = "svelte-jsjdf7";
	      addLoc(input0, file$6, 3, 12, 143);
	      label0.className = "hide-title svelte-jsjdf7";
	      addLoc(label0, file$6, 2, 8, 104);
	      label1.className = "control-label";
	      label1.htmlFor = "text-title";
	      addLoc(label1, file$6, 6, 8, 279);
	      addListener(input1, "input", input1_input_handler);
	      input1.className = "input-xlarge span4";
	      input1.autocomplete = "off";
	      setAttribute(input1, "type", "text");
	      addLoc(input1, file$6, 7, 8, 355);
	      label2.className = "control-label";
	      label2.htmlFor = "text-intro";
	      addLoc(label2, file$6, 9, 8, 452);
	      addListener(textarea, "input", textarea_input_handler);
	      textarea.id = "text-intro";
	      textarea.className = "input-xlarge span4";
	      addLoc(textarea, file$6, 10, 8, 534);
	      label3.className = "control-label";
	      label3.htmlFor = "text-notes";
	      addLoc(label3, file$6, 12, 8, 646);
	      addListener(input2, "input", input2_input_handler);
	      input2.className = "input-xlarge span4";
	      setAttribute(input2, "type", "text");
	      addLoc(input2, file$6, 13, 8, 722);
	      div0.className = "pull-left";
	      setStyle(div0, "position", "relative");
	      addLoc(div0, file$6, 1, 4, 44);
	      label4.className = "control-label";
	      addLoc(label4, file$6, 18, 12, 883);
	      addListener(input3, "input", input3_input_handler);
	      input3.className = "span2";
	      input3.placeholder = __$1('name of the organisation');
	      setAttribute(input3, "type", "text");
	      addLoc(input3, file$6, 19, 12, 952);
	      div1.className = "span2";
	      addLoc(div1, file$6, 17, 8, 851);
	      label5.className = "control-label";
	      addLoc(label5, file$6, 22, 12, 1137);
	      addListener(input4, "input", input4_input_handler);
	      input4.className = "span2";
	      input4.placeholder = __$1('URL of the dataset');
	      setAttribute(input4, "type", "text");
	      addLoc(input4, file$6, 23, 12, 1205);
	      div2.className = "span2";
	      addLoc(div2, file$6, 21, 8, 1105);
	      div3.className = "row";
	      addLoc(div3, file$6, 16, 4, 825);
	      label6.className = "control-label";
	      addLoc(label6, file$6, 28, 8, 1394);
	      addListener(input5, "input", input5_input_handler);
	      input5.className = "input-xlarge span4";
	      input5.placeholder = __$1('visualize / annotate / byline / placeholder');
	      setAttribute(input5, "type", "text");
	      addLoc(input5, file$6, 29, 8, 1477);
	      div4.className = "chart-byline";
	      addLoc(div4, file$6, 27, 4, 1359);
	      div5.className = "story-title control-group";
	      addLoc(div5, file$6, 0, 0, 0);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div5, anchor);
	      append(div5, div0);
	      append(div0, label0);
	      append(label0, input0);
	      input0.checked = ctx.$metadata.describe['hide-title'];
	      append(label0, text0);
	      append(label0, text1);
	      append(div0, text2);
	      append(div0, label1);
	      append(label1, text3);
	      append(div0, text4);
	      append(div0, input1);
	      input1.value = ctx.$title;
	      append(div0, text5);
	      append(div0, label2);
	      append(label2, text6);
	      append(div0, text7);
	      append(div0, textarea);
	      textarea.value = ctx.$metadata.describe.intro;
	      append(div0, text8);
	      append(div0, label3);
	      append(label3, text9);
	      append(div0, text10);
	      append(div0, input2);
	      input2.value = ctx.$metadata.annotate.notes;
	      append(div5, text11);
	      append(div5, div3);
	      append(div3, div1);
	      append(div1, label4);
	      append(label4, text12);
	      append(div1, text13);
	      append(div1, input3);
	      input3.value = ctx.$metadata.describe['source-name'];
	      append(div3, text14);
	      append(div3, div2);
	      append(div2, label5);
	      append(label5, text15);
	      append(div2, text16);
	      append(div2, input4);
	      input4.value = ctx.$metadata.describe['source-url'];
	      append(div5, text17);
	      append(div5, div4);
	      append(div4, label6);
	      append(label6, text18);
	      append(div4, text19);
	      append(div4, input5);
	      input5.value = ctx.$metadata.describe.byline;
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;
	      if (changed.$metadata) input0.checked = ctx.$metadata.describe['hide-title'];
	      if (!input1_updating && changed.$title) input1.value = ctx.$title;
	      if (!textarea_updating && changed.$metadata) textarea.value = ctx.$metadata.describe.intro;
	      if (!input2_updating && changed.$metadata) input2.value = ctx.$metadata.annotate.notes;
	      if (!input3_updating && changed.$metadata) input3.value = ctx.$metadata.describe['source-name'];
	      if (!input4_updating && changed.$metadata) input4.value = ctx.$metadata.describe['source-url'];
	      if (!input5_updating && changed.$metadata) input5.value = ctx.$metadata.describe.byline;
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div5);
	      }

	      removeListener(input0, "change", input0_change_handler);
	      removeListener(input1, "input", input1_input_handler);
	      removeListener(textarea, "input", textarea_input_handler);
	      removeListener(input2, "input", input2_input_handler);
	      removeListener(input3, "input", input3_input_handler);
	      removeListener(input4, "input", input4_input_handler);
	      removeListener(input5, "input", input5_input_handler);
	    }
	  };
	}

	function ChartDescription(options) {
	  this._debugName = '<ChartDescription>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  if (!options.store) {
	    throw new Error("<ChartDescription> references store properties, but no store was provided");
	  }

	  init(this, options);
	  this._state = assign(this.store._init(["metadata", "title"]), options.data);

	  this.store._add(this, ["metadata", "title"]);

	  if (!('$metadata' in this._state)) console.warn("<ChartDescription> was created without expected data property '$metadata'");
	  if (!('$title' in this._state)) console.warn("<ChartDescription> was created without expected data property '$title'");
	  this._intro = true;
	  this._handlers.destroy = [removeFromStore];
	  this._fragment = create_main_fragment$9(this, this._state);

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);
	  }
	}

	assign(ChartDescription.prototype, protoDev);

	ChartDescription.prototype._checkReadOnly = function _checkReadOnly(newState) {};

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
	function fetchJSON(url, method, credentials, body, callback) {
	  var opts = {
	    method: method,
	    body: body,
	    mode: 'cors',
	    credentials: credentials
	  };
	  return window.fetch(url, opts).then(function (res) {
	    if (!res.ok) throw new Error(res.statusText);
	    return res.text();
	  }).then(function (text) {
	    try {
	      return JSON.parse(text);
	    } catch (Error) {
	      // could not parse json, so just return text
	      console.warn('malformed json input', text);
	      return text;
	    }
	  }).then(function (res) {
	    if (callback) callback(res);
	    return res;
	  }).catch(function (err) {
	    if (callback) {
	      console.error(err);
	    } else {
	      throw err;
	    }
	  });
	}
	/**
	 * Download and parse a JSON document via GET.
	 * Use {@link httpReq} or {@link httpReq.get} instead.
	 *
	 * @deprecated
	 *
	 * @param {string} url
	 * @param {string|undefined} credentials - optional, set to undefined to disable credentials
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * import { getJSON } from '@datawrapper/shared/fetch';
	 * // use it callback style
	 * getJSON('http://api.example.org', 'include', function(data) {
	 *     console.log(data);
	 * });
	 * // or promise-style
	 * getJSON('http://api.example.org')
	 *   .then(data => {
	 *      console.log(data);
	 *   });
	 */

	function getJSON(url, credentials, callback) {
	  if (arguments.length === 2 && typeof credentials === 'function') {
	    // swap callback and assume default credentials
	    callback = credentials;
	    credentials = 'include';
	  } else if (arguments.length === 1) {
	    credentials = 'include';
	  }

	  return fetchJSON(url, 'GET', credentials, null, callback);
	}
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

	/* visualize/App.html generated by Svelte v2.16.1 */

	function data$6() {
	  return {
	    tab: 'refine',
	    showChartPicker: true,
	    Refine: Empty,
	    Annotate: Empty,
	    visualizations: [],
	    visArchvive: [],
	    visLoading: false,
	    defaultVisType: ''
	  };
	}
	var methods$2 = {
	  loadVis: function loadVis(id) {
	    var _this = this;

	    var _this$get = this.get(),
	        visualizations = _this$get.visualizations;

	    var vis = visualizations.find(function (v) {
	      return v.id === id;
	    });
	    this.set({
	      visLoading: true
	    });

	    if (!vis.controls) {
	      console.error('This visualization does not define new svelte controls');
	      return;
	    }

	    Promise.all([loadScript("/static/plugins/".concat(vis.controls.js)), loadStylesheet("/static/plugins/".concat(vis.controls.css))]).then(function () {
	      /* crazy workaround:
	       * since only the first requirejs call will fail with an
	       * a Mismatched anonymous define() modules error
	       * we'll just load the module twice
	       */
	      try {
	        require([vis.controls.amd], function (mod) {});
	      } catch (e) {}

	      require([vis.controls.amd], function (mod) {
	        var _this$get2 = _this.get(),
	            tab = _this$get2.tab,
	            defaultVisType = _this$get2.defaultVisType;

	        var chartTypeSet = _this.store.getMetadata('metadata.visualize.chart-type-set', false) || id !== defaultVisType;

	        _this.set({
	          visLoading: false,
	          Refine: mod.Refine || Empty,
	          Annotate: mod.Annotate || Empty,
	          tab: tab === 'pick' && chartTypeSet ? 'refine' : tab
	        });
	      });
	    });
	  }
	};

	function oncreate$1() {
	  if (['#pick', '#refine', '#annotate', '#design'].includes(window.location.hash)) {
	    this.set({
	      tab: window.location.hash.substr(1)
	    });
	  } // load visualization


	  var _this$store$get = this.store.get(),
	      type = _this$store$get.type;

	  this.loadVis(type);
	}
	var file$7 = "visualize/App.html";

	function create_main_fragment$a(component, ctx) {
	  var tabnav_updating = {},
	      text0,
	      div3,
	      text1,
	      div0,
	      text2,
	      text3,
	      div1,
	      text4,
	      text5,
	      text6,
	      div2,
	      text7,
	      buttonnav_updating = {};
	  var tabnav_initial_data = {
	    showChartPicker: ctx.showChartPicker
	  };

	  if (ctx.tab !== void 0) {
	    tabnav_initial_data.tab = ctx.tab;
	    tabnav_updating.tab = true;
	  }

	  var tabnav = new TabNav({
	    root: component.root,
	    store: component.store,
	    data: tabnav_initial_data,
	    _bind: function _bind(changed, childState) {
	      var newState = {};

	      if (!tabnav_updating.tab && changed.tab) {
	        newState.tab = childState.tab;
	      }

	      component._set(newState);

	      tabnav_updating = {};
	    }
	  });

	  component.root._beforecreate.push(function () {
	    tabnav._bind({
	      tab: 1
	    }, tabnav.get());
	  });

	  var if_block0 = ctx.showChartPicker && create_if_block_2(component, ctx);
	  var if_block1 = ctx.visLoading && create_if_block_1$2(component);
	  var switch_value = ctx.Refine;

	  function switch_props(ctx) {
	    var switch_instance0_initial_data = {
	      tab: ctx.tab
	    };
	    return {
	      root: component.root,
	      store: component.store,
	      data: switch_instance0_initial_data
	    };
	  }

	  if (switch_value) {
	    var switch_instance0 = new switch_value(switch_props(ctx));
	  }

	  var chartdescription = new ChartDescription({
	    root: component.root,
	    store: component.store
	  });
	  var if_block2 = ctx.visLoading && create_if_block$2(component);
	  var switch_value_1 = ctx.Annotate;

	  function switch_props_1(ctx) {
	    var switch_instance1_initial_data = {
	      tab: ctx.tab
	    };
	    return {
	      root: component.root,
	      store: component.store,
	      data: switch_instance1_initial_data
	    };
	  }

	  if (switch_value_1) {
	    var switch_instance1 = new switch_value_1(switch_props_1(ctx));
	  }

	  var design = new Design({
	    root: component.root,
	    store: component.store
	  });
	  var buttonnav_initial_data = {
	    showChartPicker: ctx.showChartPicker
	  };

	  if (ctx.tab !== void 0) {
	    buttonnav_initial_data.tab = ctx.tab;
	    buttonnav_updating.tab = true;
	  }

	  var buttonnav = new ButtonNav({
	    root: component.root,
	    store: component.store,
	    data: buttonnav_initial_data,
	    _bind: function _bind(changed, childState) {
	      var newState = {};

	      if (!buttonnav_updating.tab && changed.tab) {
	        newState.tab = childState.tab;
	      }

	      component._set(newState);

	      buttonnav_updating = {};
	    }
	  });

	  component.root._beforecreate.push(function () {
	    buttonnav._bind({
	      tab: 1
	    }, buttonnav.get());
	  });

	  return {
	    c: function create() {
	      tabnav._fragment.c();

	      text0 = createText("\n\n");
	      div3 = createElement("div");
	      if (if_block0) if_block0.c();
	      text1 = createText("\n\n    \n    ");
	      div0 = createElement("div");
	      if (if_block1) if_block1.c();
	      text2 = createText("\n        ");
	      if (switch_instance0) switch_instance0._fragment.c();
	      text3 = createText("\n\n    \n    ");
	      div1 = createElement("div");

	      chartdescription._fragment.c();

	      text4 = createText("\n        ");
	      if (if_block2) if_block2.c();
	      text5 = createText("\n        ");
	      if (switch_instance1) switch_instance1._fragment.c();
	      text6 = createText("\n\n    \n    ");
	      div2 = createElement("div");

	      design._fragment.c();

	      text7 = createText("\n\n    ");

	      buttonnav._fragment.c();

	      toggleClass(div0, "hide-smart", ctx.tab !== 'refine');
	      addLoc(div0, file$7, 11, 4, 302);
	      toggleClass(div1, "hide-smart", ctx.tab !== 'annotate');
	      addLoc(div1, file$7, 19, 4, 492);
	      toggleClass(div2, "hide-smart", ctx.tab !== 'design');
	      addLoc(div2, file$7, 28, 4, 713);
	      div3.className = "form-horizontal vis-options";
	      addLoc(div3, file$7, 2, 0, 39);
	    },
	    m: function mount(target, anchor) {
	      tabnav._mount(target, anchor);

	      insert(target, text0, anchor);
	      insert(target, div3, anchor);
	      if (if_block0) if_block0.m(div3, null);
	      append(div3, text1);
	      append(div3, div0);
	      if (if_block1) if_block1.m(div0, null);
	      append(div0, text2);

	      if (switch_instance0) {
	        switch_instance0._mount(div0, null);
	      }

	      append(div3, text3);
	      append(div3, div1);

	      chartdescription._mount(div1, null);

	      append(div1, text4);
	      if (if_block2) if_block2.m(div1, null);
	      append(div1, text5);

	      if (switch_instance1) {
	        switch_instance1._mount(div1, null);
	      }

	      append(div3, text6);
	      append(div3, div2);

	      design._mount(div2, null);

	      append(div3, text7);

	      buttonnav._mount(div3, null);
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;
	      var tabnav_changes = {};
	      if (changed.showChartPicker) tabnav_changes.showChartPicker = ctx.showChartPicker;

	      if (!tabnav_updating.tab && changed.tab) {
	        tabnav_changes.tab = ctx.tab;
	        tabnav_updating.tab = ctx.tab !== void 0;
	      }

	      tabnav._set(tabnav_changes);

	      tabnav_updating = {};

	      if (ctx.showChartPicker) {
	        if (if_block0) {
	          if_block0.p(changed, ctx);
	        } else {
	          if_block0 = create_if_block_2(component, ctx);
	          if_block0.c();
	          if_block0.m(div3, text1);
	        }
	      } else if (if_block0) {
	        if_block0.d(1);
	        if_block0 = null;
	      }

	      if (ctx.visLoading) {
	        if (!if_block1) {
	          if_block1 = create_if_block_1$2(component);
	          if_block1.c();
	          if_block1.m(div0, text2);
	        }
	      } else if (if_block1) {
	        if_block1.d(1);
	        if_block1 = null;
	      }

	      var switch_instance0_changes = {};
	      if (changed.tab) switch_instance0_changes.tab = ctx.tab;

	      if (switch_value !== (switch_value = ctx.Refine)) {
	        if (switch_instance0) {
	          switch_instance0.destroy();
	        }

	        if (switch_value) {
	          switch_instance0 = new switch_value(switch_props(ctx));

	          switch_instance0._fragment.c();

	          switch_instance0._mount(div0, null);
	        } else {
	          switch_instance0 = null;
	        }
	      } else if (switch_value) {
	        switch_instance0._set(switch_instance0_changes);
	      }

	      if (changed.tab) {
	        toggleClass(div0, "hide-smart", ctx.tab !== 'refine');
	      }

	      if (ctx.visLoading) {
	        if (!if_block2) {
	          if_block2 = create_if_block$2(component);
	          if_block2.c();
	          if_block2.m(div1, text5);
	        }
	      } else if (if_block2) {
	        if_block2.d(1);
	        if_block2 = null;
	      }

	      var switch_instance1_changes = {};
	      if (changed.tab) switch_instance1_changes.tab = ctx.tab;

	      if (switch_value_1 !== (switch_value_1 = ctx.Annotate)) {
	        if (switch_instance1) {
	          switch_instance1.destroy();
	        }

	        if (switch_value_1) {
	          switch_instance1 = new switch_value_1(switch_props_1(ctx));

	          switch_instance1._fragment.c();

	          switch_instance1._mount(div1, null);
	        } else {
	          switch_instance1 = null;
	        }
	      } else if (switch_value_1) {
	        switch_instance1._set(switch_instance1_changes);
	      }

	      if (changed.tab) {
	        toggleClass(div1, "hide-smart", ctx.tab !== 'annotate');
	        toggleClass(div2, "hide-smart", ctx.tab !== 'design');
	      }

	      var buttonnav_changes = {};
	      if (changed.showChartPicker) buttonnav_changes.showChartPicker = ctx.showChartPicker;

	      if (!buttonnav_updating.tab && changed.tab) {
	        buttonnav_changes.tab = ctx.tab;
	        buttonnav_updating.tab = ctx.tab !== void 0;
	      }

	      buttonnav._set(buttonnav_changes);

	      buttonnav_updating = {};
	    },
	    d: function destroy(detach) {
	      tabnav.destroy(detach);

	      if (detach) {
	        detachNode(text0);
	        detachNode(div3);
	      }

	      if (if_block0) if_block0.d();
	      if (if_block1) if_block1.d();
	      if (switch_instance0) switch_instance0.destroy();
	      chartdescription.destroy();
	      if (if_block2) if_block2.d();
	      if (switch_instance1) switch_instance1.destroy();
	      design.destroy();
	      buttonnav.destroy();
	    }
	  };
	} // (4:4) {#if showChartPicker}


	function create_if_block_2(component, ctx) {
	  var div;
	  var chartpicker_initial_data = {
	    visualizations: ctx.visualizations,
	    visArchive: ctx.visArchive
	  };
	  var chartpicker = new ChartPicker({
	    root: component.root,
	    store: component.store,
	    data: chartpicker_initial_data
	  });
	  chartpicker.on("change", function (event) {
	    component.loadVis(event);
	  });
	  return {
	    c: function create() {
	      div = createElement("div");

	      chartpicker._fragment.c();

	      toggleClass(div, "hide-smart", ctx.tab !== 'pick');
	      addLoc(div, file$7, 5, 4, 135);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);

	      chartpicker._mount(div, null);
	    },
	    p: function update(changed, ctx) {
	      var chartpicker_changes = {};
	      if (changed.visualizations) chartpicker_changes.visualizations = ctx.visualizations;
	      if (changed.visArchive) chartpicker_changes.visArchive = ctx.visArchive;

	      chartpicker._set(chartpicker_changes);

	      if (changed.tab) {
	        toggleClass(div, "hide-smart", ctx.tab !== 'pick');
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div);
	      }

	      chartpicker.destroy();
	    }
	  };
	} // (13:8) {#if visLoading}


	function create_if_block_1$2(component, ctx) {
	  var loading = new Loading({
	    root: component.root,
	    store: component.store
	  });
	  return {
	    c: function create() {
	      loading._fragment.c();
	    },
	    m: function mount(target, anchor) {
	      loading._mount(target, anchor);
	    },
	    d: function destroy(detach) {
	      loading.destroy(detach);
	    }
	  };
	} // (22:8) {#if visLoading}


	function create_if_block$2(component, ctx) {
	  var loading = new Loading({
	    root: component.root,
	    store: component.store
	  });
	  return {
	    c: function create() {
	      loading._fragment.c();
	    },
	    m: function mount(target, anchor) {
	      loading._mount(target, anchor);
	    },
	    d: function destroy(detach) {
	      loading.destroy(detach);
	    }
	  };
	}

	function App(options) {
	  var _this2 = this;

	  this._debugName = '<App>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data$6(), options.data);
	  if (!('tab' in this._state)) console.warn("<App> was created without expected data property 'tab'");
	  if (!('showChartPicker' in this._state)) console.warn("<App> was created without expected data property 'showChartPicker'");
	  if (!('visualizations' in this._state)) console.warn("<App> was created without expected data property 'visualizations'");
	  if (!('visArchive' in this._state)) console.warn("<App> was created without expected data property 'visArchive'");
	  if (!('visLoading' in this._state)) console.warn("<App> was created without expected data property 'visLoading'");
	  if (!('Refine' in this._state)) console.warn("<App> was created without expected data property 'Refine'");
	  if (!('Annotate' in this._state)) console.warn("<App> was created without expected data property 'Annotate'");
	  this._intro = true;
	  this._fragment = create_main_fragment$a(this, this._state);

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

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$2);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	var classCallCheck = _classCallCheck;

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	var createClass = _createClass;

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

	function assign$1(tar, src) {
	  for (var k in src) {
	    tar[k] = src[k];
	  }

	  return tar;
	}

	function blankObject$1() {
	  return Object.create(null);
	}

	function _differs$1(a, b) {
	  return a != a ? b == b : a !== b || a && _typeof_1(a) === 'object' || typeof a === 'function';
	}

	function _differsImmutable(a, b) {
	  return a != a ? b == b : a !== b;
	}

	function fire$1(eventName, data) {
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

	function get$1() {
	  return this._state;
	}

	function on$1(eventName, handler) {
	  var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	  handlers.push(handler);
	  return {
	    cancel: function cancel() {
	      var index = handlers.indexOf(handler);
	      if (~index) handlers.splice(index, 1);
	    }
	  };
	}

	function Store(state, options) {
	  this._handlers = {};
	  this._dependents = [];
	  this._computed = blankObject$1();
	  this._sortedComputedProperties = [];
	  this._state = assign$1({}, state);
	  this._differs = options && options.immutable ? _differsImmutable : _differs$1;
	}

	assign$1(Store.prototype, {
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
	    this._state = assign$1(assign$1({}, previous), newState);

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
	    var visited = blankObject$1();
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

	    var state = assign$1({}, this._state);
	    var changed = {};
	    c.update(state, changed, true);

	    this._set(state, changed);
	  },
	  fire: fire$1,
	  get: get$1,
	  on: on$1,
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

	function getNestedValue(obj, parts) {
	  for (var i = 0; i < parts.length; i += 1) {
	    if (!obj) return undefined;
	    obj = obj[parts[i]];
	  }

	  return obj;
	}

	function observeDeep(keypath, callback, opts) {
	  var parts = keypath.replace(/\[(\d+)\]/g, '.$1').split('.');
	  var key = parts[0];
	  var fn = callback.bind(this);
	  var last = getNestedValue(this.get(), parts);
	  if (!opts || opts.init !== false) fn(last);
	  return this.on(opts && opts.defer ? 'update' : 'state', function (_a) {
	    var changed = _a.changed,
	        current = _a.current,
	        previous = _a.previous;

	    if (changed[key]) {
	      var value = getNestedValue(current, parts);

	      if (value !== last || _typeof_1(value) === 'object' || typeof value === 'function') {
	        fn(value, last);
	        last = value;
	      }
	    }
	  });
	}

	//     Underscore.js 1.10.2
	//     https://underscorejs.org
	//     (c) 2009-2020 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.
	// Baseline setup
	// --------------
	// Establish the root object, `window` (`self`) in the browser, `global`
	// on the server, or `this` in some virtual machines. We use `self`
	// instead of `window` for `WebWorker` support.
	var root = (typeof self === "undefined" ? "undefined" : _typeof_1(self)) == 'object' && self.self === self && self || (typeof global === "undefined" ? "undefined" : _typeof_1(global)) == 'object' && global.global === global && global || Function('return this')() || {}; // Save bytes in the minified (but not gzipped) version:

	var ArrayProto = Array.prototype,
	    ObjProto = Object.prototype;
	var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null; // Create quick reference variables for speed access to core prototypes.

	var push = ArrayProto.push,
	    slice = ArrayProto.slice,
	    toString = ObjProto.toString,
	    hasOwnProperty = ObjProto.hasOwnProperty; // All **ECMAScript 5** native function implementations that we hope to use
	// are declared here.

	var nativeIsArray = Array.isArray,
	    nativeKeys = Object.keys,
	    nativeCreate = Object.create; // Create references to these builtin functions because we override them.

	var _isNaN = root.isNaN,
	    _isFinite = root.isFinite; // Naked function reference for surrogate-prototype-swapping.

	var Ctor = function Ctor() {}; // The Underscore object. All exported functions below are added to it in the
	// modules/index-all.js using the mixin function.


	function _$1(obj) {
	  if (obj instanceof _$1) return obj;
	  if (!(this instanceof _$1)) return new _$1(obj);
	  this._wrapped = obj;
	} // Current version.

	var VERSION = _$1.VERSION = '1.10.2'; // Internal function that returns an efficient (for current engines) version
	// of the passed-in callback, to be repeatedly applied in other Underscore
	// functions.

	function optimizeCb(func, context, argCount) {
	  if (context === void 0) return func;

	  switch (argCount == null ? 3 : argCount) {
	    case 1:
	      return function (value) {
	        return func.call(context, value);
	      };
	    // The 2-argument case is omitted because we’re not using it.

	    case 3:
	      return function (value, index, collection) {
	        return func.call(context, value, index, collection);
	      };

	    case 4:
	      return function (accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	  }

	  return function () {
	    return func.apply(context, arguments);
	  };
	} // An internal function to generate callbacks that can be applied to each
	// element in a collection, returning the desired result — either `identity`,
	// an arbitrary callback, a property matcher, or a property accessor.


	function baseIteratee(value, context, argCount) {
	  if (value == null) return identity;
	  if (isFunction(value)) return optimizeCb(value, context, argCount);
	  if (isObject(value) && !isArray(value)) return matcher(value);
	  return property(value);
	} // External wrapper for our callback generator. Users may customize
	// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
	// This abstraction hides the internal-only argCount argument.


	_$1.iteratee = iteratee;
	function iteratee(value, context) {
	  return baseIteratee(value, context, Infinity);
	} // The function we actually call internally. It invokes _.iteratee if
	// overridden, otherwise baseIteratee.

	function cb(value, context, argCount) {
	  if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
	  return baseIteratee(value, context, argCount);
	} // Some functions take a variable number of arguments, or a few expected
	// arguments at the beginning and then a variable number of values to operate
	// on. This helper accumulates all remaining arguments past the function’s
	// argument length (or an explicit `startIndex`), into an array that becomes
	// the last argument. Similar to ES6’s "rest parameter".


	function restArguments(func, startIndex) {
	  startIndex = startIndex == null ? func.length - 1 : +startIndex;
	  return function () {
	    var length = Math.max(arguments.length - startIndex, 0),
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
	} // An internal function for creating a new object that inherits from another.

	function baseCreate(prototype) {
	  if (!isObject(prototype)) return {};
	  if (nativeCreate) return nativeCreate(prototype);
	  Ctor.prototype = prototype;
	  var result = new Ctor();
	  Ctor.prototype = null;
	  return result;
	}

	function shallowProperty(key) {
	  return function (obj) {
	    return obj == null ? void 0 : obj[key];
	  };
	}

	function _has(obj, path) {
	  return obj != null && hasOwnProperty.call(obj, path);
	}

	function deepGet(obj, path) {
	  var length = path.length;

	  for (var i = 0; i < length; i++) {
	    if (obj == null) return void 0;
	    obj = obj[path[i]];
	  }

	  return length ? obj : void 0;
	} // Helper for collection methods to determine whether a collection
	// should be iterated as an array or as an object.
	// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094


	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var getLength = shallowProperty('length');

	function isArrayLike(collection) {
	  var length = getLength(collection);
	  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	} // Collection Functions
	// --------------------
	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles raw objects in addition to array-likes. Treats all
	// sparse array-likes as if they were dense.


	function each(obj, iteratee, context) {
	  iteratee = optimizeCb(iteratee, context);
	  var i, length;

	  if (isArrayLike(obj)) {
	    for (i = 0, length = obj.length; i < length; i++) {
	      iteratee(obj[i], i, obj);
	    }
	  } else {
	    var _keys = keys(obj);

	    for (i = 0, length = _keys.length; i < length; i++) {
	      iteratee(obj[_keys[i]], _keys[i], obj);
	    }
	  }

	  return obj;
	}

	function map(obj, iteratee, context) {
	  iteratee = cb(iteratee, context);

	  var _keys = !isArrayLike(obj) && keys(obj),
	      length = (_keys || obj).length,
	      results = Array(length);

	  for (var index = 0; index < length; index++) {
	    var currentKey = _keys ? _keys[index] : index;
	    results[index] = iteratee(obj[currentKey], currentKey, obj);
	  }

	  return results;
	}

	function createReduce(dir) {
	  // Wrap code that reassigns argument variables in a separate function than
	  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
	  var reducer = function reducer(obj, iteratee, memo, initial) {
	    var _keys = !isArrayLike(obj) && keys(obj),
	        length = (_keys || obj).length,
	        index = dir > 0 ? 0 : length - 1;

	    if (!initial) {
	      memo = obj[_keys ? _keys[index] : index];
	      index += dir;
	    }

	    for (; index >= 0 && index < length; index += dir) {
	      var currentKey = _keys ? _keys[index] : index;
	      memo = iteratee(memo, obj[currentKey], currentKey, obj);
	    }

	    return memo;
	  };

	  return function (obj, iteratee, memo, context) {
	    var initial = arguments.length >= 3;
	    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
	  };
	} // **Reduce** builds up a single result from a list of values, aka `inject`,
	// or `foldl`.


	var reduce = createReduce(1);

	var reduceRight = createReduce(-1);

	function find(obj, predicate, context) {
	  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
	  var key = keyFinder(obj, predicate, context);
	  if (key !== void 0 && key !== -1) return obj[key];
	}

	function filter(obj, predicate, context) {
	  var results = [];
	  predicate = cb(predicate, context);
	  each(obj, function (value, index, list) {
	    if (predicate(value, index, list)) results.push(value);
	  });
	  return results;
	}

	function reject(obj, predicate, context) {
	  return filter(obj, negate(cb(predicate)), context);
	} // Determine whether all of the elements match a truth test.

	function every(obj, predicate, context) {
	  predicate = cb(predicate, context);

	  var _keys = !isArrayLike(obj) && keys(obj),
	      length = (_keys || obj).length;

	  for (var index = 0; index < length; index++) {
	    var currentKey = _keys ? _keys[index] : index;
	    if (!predicate(obj[currentKey], currentKey, obj)) return false;
	  }

	  return true;
	}

	function some(obj, predicate, context) {
	  predicate = cb(predicate, context);

	  var _keys = !isArrayLike(obj) && keys(obj),
	      length = (_keys || obj).length;

	  for (var index = 0; index < length; index++) {
	    var currentKey = _keys ? _keys[index] : index;
	    if (predicate(obj[currentKey], currentKey, obj)) return true;
	  }

	  return false;
	}

	function contains(obj, item, fromIndex, guard) {
	  if (!isArrayLike(obj)) obj = values(obj);
	  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	  return indexOf(obj, item, fromIndex) >= 0;
	}

	var invoke = restArguments(function (obj, path, args) {
	  var contextPath, func;

	  if (isFunction(path)) {
	    func = path;
	  } else if (isArray(path)) {
	    contextPath = path.slice(0, -1);
	    path = path[path.length - 1];
	  }

	  return map(obj, function (context) {
	    var method = func;

	    if (!method) {
	      if (contextPath && contextPath.length) {
	        context = deepGet(context, contextPath);
	      }

	      if (context == null) return void 0;
	      method = context[path];
	    }

	    return method == null ? method : method.apply(context, args);
	  });
	}); // Convenience version of a common use case of `map`: fetching a property.

	function pluck(obj, key) {
	  return map(obj, property(key));
	} // Convenience version of a common use case of `filter`: selecting only objects
	// containing specific `key:value` pairs.

	function where(obj, attrs) {
	  return filter(obj, matcher(attrs));
	} // Convenience version of a common use case of `find`: getting the first object
	// containing specific `key:value` pairs.

	function findWhere(obj, attrs) {
	  return find(obj, matcher(attrs));
	} // Return the maximum element (or element-based computation).

	function max(obj, iteratee, context) {
	  var result = -Infinity,
	      lastComputed = -Infinity,
	      value,
	      computed;

	  if (iteratee == null || typeof iteratee == 'number' && _typeof_1(obj[0]) != 'object' && obj != null) {
	    obj = isArrayLike(obj) ? obj : values(obj);

	    for (var i = 0, length = obj.length; i < length; i++) {
	      value = obj[i];

	      if (value != null && value > result) {
	        result = value;
	      }
	    }
	  } else {
	    iteratee = cb(iteratee, context);
	    each(obj, function (v, index, list) {
	      computed = iteratee(v, index, list);

	      if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	        result = v;
	        lastComputed = computed;
	      }
	    });
	  }

	  return result;
	} // Return the minimum element (or element-based computation).

	function min(obj, iteratee, context) {
	  var result = Infinity,
	      lastComputed = Infinity,
	      value,
	      computed;

	  if (iteratee == null || typeof iteratee == 'number' && _typeof_1(obj[0]) != 'object' && obj != null) {
	    obj = isArrayLike(obj) ? obj : values(obj);

	    for (var i = 0, length = obj.length; i < length; i++) {
	      value = obj[i];

	      if (value != null && value < result) {
	        result = value;
	      }
	    }
	  } else {
	    iteratee = cb(iteratee, context);
	    each(obj, function (v, index, list) {
	      computed = iteratee(v, index, list);

	      if (computed < lastComputed || computed === Infinity && result === Infinity) {
	        result = v;
	        lastComputed = computed;
	      }
	    });
	  }

	  return result;
	} // Shuffle a collection.

	function shuffle(obj) {
	  return sample(obj, Infinity);
	} // Sample **n** random values from a collection using the modern version of the
	// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	// If **n** is not specified, returns a single random element.
	// The internal `guard` argument allows it to work with `map`.

	function sample(obj, n, guard) {
	  if (n == null || guard) {
	    if (!isArrayLike(obj)) obj = values(obj);
	    return obj[random(obj.length - 1)];
	  }

	  var sample = isArrayLike(obj) ? clone(obj) : values(obj);
	  var length = getLength(sample);
	  n = Math.max(Math.min(n, length), 0);
	  var last = length - 1;

	  for (var index = 0; index < n; index++) {
	    var rand = random(index, last);
	    var temp = sample[index];
	    sample[index] = sample[rand];
	    sample[rand] = temp;
	  }

	  return sample.slice(0, n);
	} // Sort the object's values by a criterion produced by an iteratee.

	function sortBy(obj, iteratee, context) {
	  var index = 0;
	  iteratee = cb(iteratee, context);
	  return pluck(map(obj, function (value, key, list) {
	    return {
	      value: value,
	      index: index++,
	      criteria: iteratee(value, key, list)
	    };
	  }).sort(function (left, right) {
	    var a = left.criteria;
	    var b = right.criteria;

	    if (a !== b) {
	      if (a > b || a === void 0) return 1;
	      if (a < b || b === void 0) return -1;
	    }

	    return left.index - right.index;
	  }), 'value');
	} // An internal function used for aggregate "group by" operations.

	function group(behavior, partition) {
	  return function (obj, iteratee, context) {
	    var result = partition ? [[], []] : {};
	    iteratee = cb(iteratee, context);
	    each(obj, function (value, index) {
	      var key = iteratee(value, index, obj);
	      behavior(result, value, key);
	    });
	    return result;
	  };
	} // Groups the object's values by a criterion. Pass either a string attribute
	// to group by, or a function that returns the criterion.


	var groupBy = group(function (result, value, key) {
	  if (_has(result, key)) result[key].push(value);else result[key] = [value];
	}); // Indexes the object's values by a criterion, similar to `groupBy`, but for
	// when you know that your index values will be unique.

	var indexBy = group(function (result, value, key) {
	  result[key] = value;
	}); // Counts instances of an object that group by a certain criterion. Pass
	// either a string attribute to count by, or a function that returns the
	// criterion.

	var countBy = group(function (result, value, key) {
	  if (_has(result, key)) result[key]++;else result[key] = 1;
	});
	var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g; // Safely create a real, live array from anything iterable.

	function toArray(obj) {
	  if (!obj) return [];
	  if (isArray(obj)) return slice.call(obj);

	  if (isString(obj)) {
	    // Keep surrogate pair characters together
	    return obj.match(reStrSymbol);
	  }

	  if (isArrayLike(obj)) return map(obj, identity);
	  return values(obj);
	} // Return the number of elements in an object.

	function size(obj) {
	  if (obj == null) return 0;
	  return isArrayLike(obj) ? obj.length : keys(obj).length;
	} // Split a collection into two arrays: one whose elements all satisfy the given
	// predicate, and one whose elements all do not satisfy the predicate.

	var partition = group(function (result, value, pass) {
	  result[pass ? 0 : 1].push(value);
	}, true); // Array Functions
	// ---------------
	// Get the first element of an array. Passing **n** will return the first N
	// values in the array. The **guard** check allows it to work with `map`.

	function first(array, n, guard) {
	  if (array == null || array.length < 1) return n == null ? void 0 : [];
	  if (n == null || guard) return array[0];
	  return initial(array, array.length - n);
	}
	// the arguments object. Passing **n** will return all the values in
	// the array, excluding the last N.

	function initial(array, n, guard) {
	  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	} // Get the last element of an array. Passing **n** will return the last N
	// values in the array.

	function last(array, n, guard) {
	  if (array == null || array.length < 1) return n == null ? void 0 : [];
	  if (n == null || guard) return array[array.length - 1];
	  return rest(array, Math.max(0, array.length - n));
	} // Returns everything but the first entry of the array. Especially useful on
	// the arguments object. Passing an **n** will return the rest N values in the
	// array.

	function rest(array, n, guard) {
	  return slice.call(array, n == null || guard ? 1 : n);
	}

	function compact(array) {
	  return filter(array, Boolean);
	} // Internal implementation of a recursive `flatten` function.

	function _flatten(input, shallow, strict, output) {
	  output = output || [];
	  var idx = output.length;

	  for (var i = 0, length = getLength(input); i < length; i++) {
	    var value = input[i];

	    if (isArrayLike(value) && (isArray(value) || isArguments(value))) {
	      // Flatten current level of array or arguments object.
	      if (shallow) {
	        var j = 0,
	            len = value.length;

	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else {
	        _flatten(value, shallow, strict, output);

	        idx = output.length;
	      }
	    } else if (!strict) {
	      output[idx++] = value;
	    }
	  }

	  return output;
	} // Flatten out an array, either recursively (by default), or just one level.


	function flatten(array, shallow) {
	  return _flatten(array, shallow, false);
	} // Return a version of the array that does not contain the specified value(s).

	var without = restArguments(function (array, otherArrays) {
	  return difference(array, otherArrays);
	}); // Produce a duplicate-free version of the array. If the array has already
	// been sorted, you have the option of using a faster algorithm.
	// The faster algorithm will not work with an iteratee if the iteratee
	// is not a one-to-one function, so providing an iteratee will disable
	// the faster algorithm.

	function uniq(array, isSorted, iteratee, context) {
	  if (!isBoolean(isSorted)) {
	    context = iteratee;
	    iteratee = isSorted;
	    isSorted = false;
	  }

	  if (iteratee != null) iteratee = cb(iteratee, context);
	  var result = [];
	  var seen = [];

	  for (var i = 0, length = getLength(array); i < length; i++) {
	    var value = array[i],
	        computed = iteratee ? iteratee(value, i, array) : value;

	    if (isSorted && !iteratee) {
	      if (!i || seen !== computed) result.push(value);
	      seen = computed;
	    } else if (iteratee) {
	      if (!contains(seen, computed)) {
	        seen.push(computed);
	        result.push(value);
	      }
	    } else if (!contains(result, value)) {
	      result.push(value);
	    }
	  }

	  return result;
	}
	// the passed-in arrays.

	var union = restArguments(function (arrays) {
	  return uniq(_flatten(arrays, true, true));
	}); // Produce an array that contains every item shared between all the
	// passed-in arrays.

	function intersection(array) {
	  var result = [];
	  var argsLength = arguments.length;

	  for (var i = 0, length = getLength(array); i < length; i++) {
	    var item = array[i];
	    if (contains(result, item)) continue;
	    var j;

	    for (j = 1; j < argsLength; j++) {
	      if (!contains(arguments[j], item)) break;
	    }

	    if (j === argsLength) result.push(item);
	  }

	  return result;
	} // Take the difference between one array and a number of other arrays.
	// Only the elements present in just the first array will remain.

	var difference = restArguments(function (array, rest) {
	  rest = _flatten(rest, true, true);
	  return filter(array, function (value) {
	    return !contains(rest, value);
	  });
	}); // Complement of zip. Unzip accepts an array of arrays and groups
	// each array's elements on shared indices.

	function unzip(array) {
	  var length = array && max(array, getLength).length || 0;
	  var result = Array(length);

	  for (var index = 0; index < length; index++) {
	    result[index] = pluck(array, index);
	  }

	  return result;
	} // Zip together multiple lists into a single array -- elements that share
	// an index go together.

	var zip = restArguments(unzip); // Converts lists into objects. Pass either a single array of `[key, value]`
	// pairs, or two parallel arrays of the same length -- one of keys, and one of
	// the corresponding values. Passing by pairs is the reverse of pairs.

	function object(list, values) {
	  var result = {};

	  for (var i = 0, length = getLength(list); i < length; i++) {
	    if (values) {
	      result[list[i]] = values[i];
	    } else {
	      result[list[i][0]] = list[i][1];
	    }
	  }

	  return result;
	} // Generator function to create the findIndex and findLastIndex functions.

	function createPredicateIndexFinder(dir) {
	  return function (array, predicate, context) {
	    predicate = cb(predicate, context);
	    var length = getLength(array);
	    var index = dir > 0 ? 0 : length - 1;

	    for (; index >= 0 && index < length; index += dir) {
	      if (predicate(array[index], index, array)) return index;
	    }

	    return -1;
	  };
	} // Returns the first index on an array-like that passes a predicate test.


	var findIndex = createPredicateIndexFinder(1);
	var findLastIndex = createPredicateIndexFinder(-1); // Use a comparator function to figure out the smallest index at which
	// an object should be inserted so as to maintain order. Uses binary search.

	function sortedIndex(array, obj, iteratee, context) {
	  iteratee = cb(iteratee, context, 1);
	  var value = iteratee(obj);
	  var low = 0,
	      high = getLength(array);

	  while (low < high) {
	    var mid = Math.floor((low + high) / 2);
	    if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
	  }

	  return low;
	} // Generator function to create the indexOf and lastIndexOf functions.

	function createIndexFinder(dir, predicateFind, sortedIndex) {
	  return function (array, item, idx) {
	    var i = 0,
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
	      idx = predicateFind(slice.call(array, i, length), isNaN$1);
	      return idx >= 0 ? idx + i : -1;
	    }

	    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	      if (array[idx] === item) return idx;
	    }

	    return -1;
	  };
	} // Return the position of the first occurrence of an item in an array,
	// or -1 if the item is not included in the array.
	// If the array is large and already in sort order, pass `true`
	// for **isSorted** to use binary search.


	var indexOf = createIndexFinder(1, findIndex, sortedIndex);
	var lastIndexOf = createIndexFinder(-1, findLastIndex); // Generate an integer Array containing an arithmetic progression. A port of
	// the native Python `range()` function. See
	// [the Python documentation](https://docs.python.org/library/functions.html#range).

	function range(start, stop, step) {
	  if (stop == null) {
	    stop = start || 0;
	    start = 0;
	  }

	  if (!step) {
	    step = stop < start ? -1 : 1;
	  }

	  var length = Math.max(Math.ceil((stop - start) / step), 0);
	  var range = Array(length);

	  for (var idx = 0; idx < length; idx++, start += step) {
	    range[idx] = start;
	  }

	  return range;
	} // Chunk a single array into multiple arrays, each containing `count` or fewer
	// items.

	function chunk(array, count) {
	  if (count == null || count < 1) return [];
	  var result = [];
	  var i = 0,
	      length = array.length;

	  while (i < length) {
	    result.push(slice.call(array, i, i += count));
	  }

	  return result;
	} // Function (ahem) Functions
	// ------------------
	// Determines whether to execute a function as a constructor
	// or a normal function with the provided arguments.

	function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
	  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	  var self = baseCreate(sourceFunc.prototype);
	  var result = sourceFunc.apply(self, args);
	  if (isObject(result)) return result;
	  return self;
	} // Create a function bound to a given object (assigning `this`, and arguments,
	// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	// available.


	var bind = restArguments(function (func, context, args) {
	  if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
	  var bound = restArguments(function (callArgs) {
	    return executeBound(func, bound, context, this, args.concat(callArgs));
	  });
	  return bound;
	}); // Partially apply a function by creating a version that has had some of its
	// arguments pre-filled, without changing its dynamic `this` context. _ acts
	// as a placeholder by default, allowing any combination of arguments to be
	// pre-filled. Set `partial.placeholder` for a custom placeholder argument.

	var partial = restArguments(function (func, boundArgs) {
	  var placeholder = partial.placeholder;

	  var bound = function bound() {
	    var position = 0,
	        length = boundArgs.length;
	    var args = Array(length);

	    for (var i = 0; i < length; i++) {
	      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
	    }

	    while (position < arguments.length) {
	      args.push(arguments[position++]);
	    }

	    return executeBound(func, bound, this, this, args);
	  };

	  return bound;
	});
	partial.placeholder = _$1; // Bind a number of an object's methods to that object. Remaining arguments
	// are the method names to be bound. Useful for ensuring that all callbacks
	// defined on an object belong to it.

	var bindAll = restArguments(function (obj, _keys) {
	  _keys = _flatten(_keys, false, false);
	  var index = _keys.length;
	  if (index < 1) throw new Error('bindAll must be passed function names');

	  while (index--) {
	    var key = _keys[index];
	    obj[key] = bind(obj[key], obj);
	  }
	}); // Memoize an expensive function by storing its results.

	function memoize(func, hasher) {
	  var memoize = function memoize(key) {
	    var cache = memoize.cache;
	    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	    if (!_has(cache, address)) cache[address] = func.apply(this, arguments);
	    return cache[address];
	  };

	  memoize.cache = {};
	  return memoize;
	} // Delays a function for the given number of milliseconds, and then calls
	// it with the arguments supplied.

	var delay = restArguments(function (func, wait, args) {
	  return setTimeout(function () {
	    return func.apply(null, args);
	  }, wait);
	}); // Defers a function, scheduling it to run after the current call stack has
	// cleared.

	var defer = partial(delay, _$1, 1); // Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.

	function throttle(func, wait, options) {
	  var timeout, context, args, result;
	  var previous = 0;
	  if (!options) options = {};

	  var later = function later() {
	    previous = options.leading === false ? 0 : now();
	    timeout = null;
	    result = func.apply(context, args);
	    if (!timeout) context = args = null;
	  };

	  var throttled = function throttled() {
	    var _now = now();

	    if (!previous && options.leading === false) previous = _now;
	    var remaining = wait - (_now - previous);
	    context = this;
	    args = arguments;

	    if (remaining <= 0 || remaining > wait) {
	      if (timeout) {
	        clearTimeout(timeout);
	        timeout = null;
	      }

	      previous = _now;
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
	} // Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.

	function debounce(func, wait, immediate) {
	  var timeout, result;

	  var later = function later(context, args) {
	    timeout = null;
	    if (args) result = func.apply(context, args);
	  };

	  var debounced = restArguments(function (args) {
	    if (timeout) clearTimeout(timeout);

	    if (immediate) {
	      var callNow = !timeout;
	      timeout = setTimeout(later, wait);
	      if (callNow) result = func.apply(this, args);
	    } else {
	      timeout = delay(later, wait, this, args);
	    }

	    return result;
	  });

	  debounced.cancel = function () {
	    clearTimeout(timeout);
	    timeout = null;
	  };

	  return debounced;
	} // Returns the first function passed as an argument to the second,
	// allowing you to adjust arguments, run code before and after, and
	// conditionally execute the original function.

	function wrap(func, wrapper) {
	  return partial(wrapper, func);
	} // Returns a negated version of the passed-in predicate.

	function negate(predicate) {
	  return function () {
	    return !predicate.apply(this, arguments);
	  };
	} // Returns a function that is the composition of a list of functions, each
	// consuming the return value of the function that follows.

	function compose() {
	  var args = arguments;
	  var start = args.length - 1;
	  return function () {
	    var i = start;
	    var result = args[start].apply(this, arguments);

	    while (i--) {
	      result = args[i].call(this, result);
	    }

	    return result;
	  };
	} // Returns a function that will only be executed on and after the Nth call.

	function after(times, func) {
	  return function () {
	    if (--times < 1) {
	      return func.apply(this, arguments);
	    }
	  };
	} // Returns a function that will only be executed up to (but not including) the Nth call.

	function before(times, func) {
	  var memo;
	  return function () {
	    if (--times > 0) {
	      memo = func.apply(this, arguments);
	    }

	    if (times <= 1) func = null;
	    return memo;
	  };
	} // Returns a function that will be executed at most one time, no matter how
	// often you call it. Useful for lazy initialization.

	var once = partial(before, 2); // Object Functions
	// ----------------
	// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.

	var hasEnumBug = !{
	  toString: null
	}.propertyIsEnumerable('toString');
	var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	function collectNonEnumProps(obj, _keys) {
	  var nonEnumIdx = nonEnumerableProps.length;
	  var constructor = obj.constructor;
	  var proto = isFunction(constructor) && constructor.prototype || ObjProto; // Constructor is a special case.

	  var prop = 'constructor';
	  if (_has(obj, prop) && !contains(_keys, prop)) _keys.push(prop);

	  while (nonEnumIdx--) {
	    prop = nonEnumerableProps[nonEnumIdx];

	    if (prop in obj && obj[prop] !== proto[prop] && !contains(_keys, prop)) {
	      _keys.push(prop);
	    }
	  }
	} // Retrieve the names of an object's own properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`.


	function keys(obj) {
	  if (!isObject(obj)) return [];
	  if (nativeKeys) return nativeKeys(obj);
	  var _keys = [];

	  for (var key in obj) {
	    if (_has(obj, key)) _keys.push(key);
	  } // Ahem, IE < 9.


	  if (hasEnumBug) collectNonEnumProps(obj, _keys);
	  return _keys;
	} // Retrieve all the property names of an object.

	function allKeys(obj) {
	  if (!isObject(obj)) return [];
	  var _keys = [];

	  for (var key in obj) {
	    _keys.push(key);
	  } // Ahem, IE < 9.


	  if (hasEnumBug) collectNonEnumProps(obj, _keys);
	  return _keys;
	} // Retrieve the values of an object's properties.

	function values(obj) {
	  var _keys = keys(obj);

	  var length = _keys.length;
	  var values = Array(length);

	  for (var i = 0; i < length; i++) {
	    values[i] = obj[_keys[i]];
	  }

	  return values;
	} // Returns the results of applying the iteratee to each element of the object.
	// In contrast to map it returns an object.

	function mapObject(obj, iteratee, context) {
	  iteratee = cb(iteratee, context);

	  var _keys = keys(obj),
	      length = _keys.length,
	      results = {};

	  for (var index = 0; index < length; index++) {
	    var currentKey = _keys[index];
	    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	  }

	  return results;
	} // Convert an object into a list of `[key, value]` pairs.
	// The opposite of object.

	function pairs(obj) {
	  var _keys = keys(obj);

	  var length = _keys.length;
	  var pairs = Array(length);

	  for (var i = 0; i < length; i++) {
	    pairs[i] = [_keys[i], obj[_keys[i]]];
	  }

	  return pairs;
	} // Invert the keys and values of an object. The values must be serializable.

	function invert(obj) {
	  var result = {};

	  var _keys = keys(obj);

	  for (var i = 0, length = _keys.length; i < length; i++) {
	    result[obj[_keys[i]]] = _keys[i];
	  }

	  return result;
	} // Return a sorted list of the function names available on the object.

	function functions(obj) {
	  var names = [];

	  for (var key in obj) {
	    if (isFunction(obj[key])) names.push(key);
	  }

	  return names.sort();
	}

	function createAssigner(keysFunc, defaults) {
	  return function (obj) {
	    var length = arguments.length;
	    if (defaults) obj = Object(obj);
	    if (length < 2 || obj == null) return obj;

	    for (var index = 1; index < length; index++) {
	      var source = arguments[index],
	          _keys = keysFunc(source),
	          l = _keys.length;

	      for (var i = 0; i < l; i++) {
	        var key = _keys[i];
	        if (!defaults || obj[key] === void 0) obj[key] = source[key];
	      }
	    }

	    return obj;
	  };
	} // Extend a given object with all the properties in passed-in object(s).


	var extend = createAssigner(allKeys); // Assigns a given object with all the own properties in the passed-in object(s).
	// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

	var extendOwn = createAssigner(keys);

	function findKey(obj, predicate, context) {
	  predicate = cb(predicate, context);

	  var _keys = keys(obj),
	      key;

	  for (var i = 0, length = _keys.length; i < length; i++) {
	    key = _keys[i];
	    if (predicate(obj[key], key, obj)) return key;
	  }
	} // Internal pick helper function to determine if `obj` has key `key`.

	function keyInObj(value, key, obj) {
	  return key in obj;
	} // Return a copy of the object only containing the whitelisted properties.


	var pick = restArguments(function (obj, _keys) {
	  var result = {},
	      iteratee = _keys[0];
	  if (obj == null) return result;

	  if (isFunction(iteratee)) {
	    if (_keys.length > 1) iteratee = optimizeCb(iteratee, _keys[1]);
	    _keys = allKeys(obj);
	  } else {
	    iteratee = keyInObj;
	    _keys = _flatten(_keys, false, false);
	    obj = Object(obj);
	  }

	  for (var i = 0, length = _keys.length; i < length; i++) {
	    var key = _keys[i];
	    var value = obj[key];
	    if (iteratee(value, key, obj)) result[key] = value;
	  }

	  return result;
	}); // Return a copy of the object without the blacklisted properties.

	var omit = restArguments(function (obj, _keys) {
	  var iteratee = _keys[0],
	      context;

	  if (isFunction(iteratee)) {
	    iteratee = negate(iteratee);
	    if (_keys.length > 1) context = _keys[1];
	  } else {
	    _keys = map(_flatten(_keys, false, false), String);

	    iteratee = function iteratee(value, key) {
	      return !contains(_keys, key);
	    };
	  }

	  return pick(obj, iteratee, context);
	}); // Fill in a given object with default properties.

	var defaults = createAssigner(allKeys, true); // Creates an object that inherits from the given prototype object.
	// If additional properties are provided then they will be added to the
	// created object.

	function create(prototype, props) {
	  var result = baseCreate(prototype);
	  if (props) extendOwn(result, props);
	  return result;
	} // Create a (shallow-cloned) duplicate of an object.

	function clone(obj) {
	  if (!isObject(obj)) return obj;
	  return isArray(obj) ? obj.slice() : extend({}, obj);
	} // Invokes interceptor with the obj, and then returns obj.
	// The primary purpose of this method is to "tap into" a method chain, in
	// order to perform operations on intermediate results within the chain.

	function tap(obj, interceptor) {
	  interceptor(obj);
	  return obj;
	} // Returns whether an object has a given set of `key:value` pairs.

	function isMatch(object, attrs) {
	  var _keys = keys(attrs),
	      length = _keys.length;

	  if (object == null) return !length;
	  var obj = Object(object);

	  for (var i = 0; i < length; i++) {
	    var key = _keys[i];
	    if (attrs[key] !== obj[key] || !(key in obj)) return false;
	  }

	  return true;
	} // Internal recursive comparison function for `isEqual`.

	function eq(a, b, aStack, bStack) {
	  // Identical objects are equal. `0 === -0`, but they aren't identical.
	  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
	  if (a === b) return a !== 0 || 1 / a === 1 / b; // `null` or `undefined` only equal to itself (strict comparison).

	  if (a == null || b == null) return false; // `NaN`s are equivalent, but non-reflexive.

	  if (a !== a) return b !== b; // Exhaust primitive checks

	  var type = _typeof_1(a);

	  if (type !== 'function' && type !== 'object' && _typeof_1(b) != 'object') return false;
	  return deepEq(a, b, aStack, bStack);
	} // Internal recursive comparison function for `isEqual`.


	function deepEq(a, b, aStack, bStack) {
	  // Unwrap any wrapped objects.
	  if (a instanceof _$1) a = a._wrapped;
	  if (b instanceof _$1) b = b._wrapped; // Compare `[[Class]]` names.

	  var className = toString.call(a);
	  if (className !== toString.call(b)) return false;

	  switch (className) {
	    // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	    case '[object RegExp]': // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')

	    case '[object String]':
	      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	      // equivalent to `new String("5")`.
	      return '' + a === '' + b;

	    case '[object Number]':
	      // `NaN`s are equivalent, but non-reflexive.
	      // Object(NaN) is equivalent to NaN.
	      if (+a !== +a) return +b !== +b; // An `egal` comparison is performed for other numeric values.

	      return +a === 0 ? 1 / +a === 1 / b : +a === +b;

	    case '[object Date]':
	    case '[object Boolean]':
	      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	      // millisecond representations. Note that invalid dates with millisecond representations
	      // of `NaN` are not equivalent.
	      return +a === +b;

	    case '[object Symbol]':
	      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
	  }

	  var areArrays = className === '[object Array]';

	  if (!areArrays) {
	    if (_typeof_1(a) != 'object' || _typeof_1(b) != 'object') return false; // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	    // from different frames are.

	    var aCtor = a.constructor,
	        bCtor = b.constructor;

	    if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
	      return false;
	    }
	  } // Assume equality for cyclic structures. The algorithm for detecting cyclic
	  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	  // Initializing stack of traversed objects.
	  // It's done here since we only need them for objects and arrays comparison.


	  aStack = aStack || [];
	  bStack = bStack || [];
	  var length = aStack.length;

	  while (length--) {
	    // Linear search. Performance is inversely proportional to the number of
	    // unique nested structures.
	    if (aStack[length] === a) return bStack[length] === b;
	  } // Add the first object to the stack of traversed objects.


	  aStack.push(a);
	  bStack.push(b); // Recursively compare objects and arrays.

	  if (areArrays) {
	    // Compare array lengths to determine if a deep comparison is necessary.
	    length = a.length;
	    if (length !== b.length) return false; // Deep compare the contents, ignoring non-numeric properties.

	    while (length--) {
	      if (!eq(a[length], b[length], aStack, bStack)) return false;
	    }
	  } else {
	    // Deep compare objects.
	    var _keys = keys(a),
	        key;

	    length = _keys.length; // Ensure that both objects contain the same number of properties before comparing deep equality.

	    if (keys(b).length !== length) return false;

	    while (length--) {
	      // Deep compare each member
	      key = _keys[length];
	      if (!(_has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	    }
	  } // Remove the first object from the stack of traversed objects.


	  aStack.pop();
	  bStack.pop();
	  return true;
	} // Perform a deep comparison to check if two objects are equal.


	function isEqual(a, b) {
	  return eq(a, b);
	} // Is a given array, string, or object empty?
	// An "empty" object has no enumerable own-properties.

	function isEmpty(obj) {
	  if (obj == null) return true;
	  if (isArrayLike(obj) && (isArray(obj) || isString(obj) || isArguments(obj))) return obj.length === 0;
	  return keys(obj).length === 0;
	} // Is a given value a DOM element?

	function isElement(obj) {
	  return !!(obj && obj.nodeType === 1);
	} // Internal function for creating a toString-based type tester.

	function tagTester(name) {
	  return function (obj) {
	    return toString.call(obj) === '[object ' + name + ']';
	  };
	} // Is a given value an array?
	// Delegates to ECMA5's native Array.isArray


	var isArray = nativeIsArray || tagTester('Array'); // Is a given variable an object?

	function isObject(obj) {
	  var type = _typeof_1(obj);

	  return type === 'function' || type === 'object' && !!obj;
	} // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.

	var isArguments = tagTester('Arguments');
	var isFunction = tagTester('Function');
	var isString = tagTester('String');
	var isNumber = tagTester('Number');
	var isDate = tagTester('Date');
	var isRegExp = tagTester('RegExp');
	var isError = tagTester('Error');
	var isSymbol = tagTester('Symbol');
	var isMap = tagTester('Map');
	var isWeakMap = tagTester('WeakMap');
	var isSet = tagTester('Set');
	var isWeakSet = tagTester('WeakSet'); // Define a fallback version of the method in browsers (ahem, IE < 9), where
	// there isn't any inspectable "Arguments" type.

	(function () {
	  if (!isArguments(arguments)) {
	    isArguments = function isArguments(obj) {
	      return _has(obj, 'callee');
	    };
	  }
	})(); // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	// IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).


	var nodelist = root.document && root.document.childNodes;

	if (typeof /./ != 'function' && (typeof Int8Array === "undefined" ? "undefined" : _typeof_1(Int8Array)) != 'object' && typeof nodelist != 'function') {
	  isFunction = function isFunction(obj) {
	    return typeof obj == 'function' || false;
	  };
	} // Is a given object a finite number?


	function isFinite(obj) {
	  return !isSymbol(obj) && _isFinite(obj) && !_isNaN(parseFloat(obj));
	} // Is the given value `NaN`?

	function isNaN$1(obj) {
	  return isNumber(obj) && _isNaN(obj);
	} // Is a given value a boolean?

	function isBoolean(obj) {
	  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	} // Is a given value equal to null?

	function isNull(obj) {
	  return obj === null;
	} // Is a given variable undefined?

	function isUndefined(obj) {
	  return obj === void 0;
	} // Shortcut function for checking if an object has a given property directly
	// on itself (in other words, not on a prototype).

	function has(obj, path) {
	  if (!isArray(path)) {
	    return _has(obj, path);
	  }

	  var length = path.length;

	  for (var i = 0; i < length; i++) {
	    var key = path[i];

	    if (obj == null || !hasOwnProperty.call(obj, key)) {
	      return false;
	    }

	    obj = obj[key];
	  }

	  return !!length;
	} // Utility Functions
	// -----------------
	// Keep the identity function around for default iteratees.

	function identity(value) {
	  return value;
	} // Predicate-generating functions. Often useful outside of Underscore.

	function constant(value) {
	  return function () {
	    return value;
	  };
	}
	function noop$1() {} // Creates a function that, when passed an object, will traverse that object’s
	// properties down the given `path`, specified as an array of keys or indexes.

	function property(path) {
	  if (!isArray(path)) {
	    return shallowProperty(path);
	  }

	  return function (obj) {
	    return deepGet(obj, path);
	  };
	} // Generates a function for a given object that returns a given property.

	function propertyOf(obj) {
	  if (obj == null) {
	    return function () {};
	  }

	  return function (path) {
	    return !isArray(path) ? obj[path] : deepGet(obj, path);
	  };
	} // Returns a predicate for checking whether an object has a given set of
	// `key:value` pairs.

	function matcher(attrs) {
	  attrs = extendOwn({}, attrs);
	  return function (obj) {
	    return isMatch(obj, attrs);
	  };
	}

	function times(n, iteratee, context) {
	  var accum = Array(Math.max(0, n));
	  iteratee = optimizeCb(iteratee, context, 1);

	  for (var i = 0; i < n; i++) {
	    accum[i] = iteratee(i);
	  }

	  return accum;
	} // Return a random integer between min and max (inclusive).

	function random(min, max) {
	  if (max == null) {
	    max = min;
	    min = 0;
	  }

	  return min + Math.floor(Math.random() * (max - min + 1));
	} // A (possibly faster) way to get the current timestamp as an integer.

	var now = Date.now || function () {
	  return new Date().getTime();
	}; // List of HTML entities for escaping.

	var escapeMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#x27;',
	  '`': '&#x60;'
	};
	var unescapeMap = invert(escapeMap); // Functions for escaping and unescaping strings to/from HTML interpolation.

	function createEscaper(map) {
	  var escaper = function escaper(match) {
	    return map[match];
	  }; // Regexes for identifying a key that needs to be escaped.


	  var source = '(?:' + keys(map).join('|') + ')';
	  var testRegexp = RegExp(source);
	  var replaceRegexp = RegExp(source, 'g');
	  return function (string) {
	    string = string == null ? '' : '' + string;
	    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	  };
	}

	var escape = createEscaper(escapeMap);
	var unescape = createEscaper(unescapeMap); // Traverses the children of `obj` along `path`. If a child is a function, it
	// is invoked with its parent as context. Returns the value of the final
	// child, or `fallback` if any child is undefined.

	function result(obj, path, fallback) {
	  if (!isArray(path)) path = [path];
	  var length = path.length;

	  if (!length) {
	    return isFunction(fallback) ? fallback.call(obj) : fallback;
	  }

	  for (var i = 0; i < length; i++) {
	    var prop = obj == null ? void 0 : obj[path[i]];

	    if (prop === void 0) {
	      prop = fallback;
	      i = length; // Ensure we don't continue iterating.
	    }

	    obj = isFunction(prop) ? prop.call(obj) : prop;
	  }

	  return obj;
	} // Generate a unique integer id (unique within the entire client session).
	// Useful for temporary DOM ids.

	var idCounter = 0;
	function uniqueId(prefix) {
	  var id = ++idCounter + '';
	  return prefix ? prefix + id : id;
	} // By default, Underscore uses ERB-style template delimiters, change the
	// following template settings to use alternative delimiters.

	var templateSettings = _$1.templateSettings = {
	  evaluate: /<%([\s\S]+?)%>/g,
	  interpolate: /<%=([\s\S]+?)%>/g,
	  escape: /<%-([\s\S]+?)%>/g
	}; // When customizing `templateSettings`, if you don't want to define an
	// interpolation, evaluation or escaping regex, we need one that is
	// guaranteed not to match.

	var noMatch = /(.)^/; // Certain characters need to be escaped so that they can be put into a
	// string literal.

	var escapes = {
	  "'": "'",
	  '\\': '\\',
	  '\r': 'r',
	  '\n': 'n',
	  "\u2028": 'u2028',
	  "\u2029": 'u2029'
	};
	var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

	var escapeChar = function escapeChar(match) {
	  return '\\' + escapes[match];
	}; // JavaScript micro-templating, similar to John Resig's implementation.
	// Underscore templating handles arbitrary delimiters, preserves whitespace,
	// and correctly escapes quotes within interpolated code.
	// NB: `oldSettings` only exists for backwards compatibility.


	function template(text, settings, oldSettings) {
	  if (!settings && oldSettings) settings = oldSettings;
	  settings = defaults({}, settings, _$1.templateSettings); // Combine delimiters into one regular expression via alternation.

	  var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g'); // Compile the template source, escaping string literals appropriately.

	  var index = 0;
	  var source = "__p+='";
	  text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
	    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
	    index = offset + match.length;

	    if (escape) {
	      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	    } else if (interpolate) {
	      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	    } else if (evaluate) {
	      source += "';\n" + evaluate + "\n__p+='";
	    } // Adobe VMs need the match returned to produce the correct offset.


	    return match;
	  });
	  source += "';\n"; // If a variable is not specified, place data values in local scope.

	  if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
	  source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
	  var render;

	  try {
	    render = new Function(settings.variable || 'obj', '_', source);
	  } catch (e) {
	    e.source = source;
	    throw e;
	  }

	  var template = function template(data) {
	    return render.call(this, data, _$1);
	  }; // Provide the compiled source as a convenience for precompilation.


	  var argument = settings.variable || 'obj';
	  template.source = 'function(' + argument + '){\n' + source + '}';
	  return template;
	} // Add a "chain" function. Start chaining a wrapped Underscore object.

	function chain(obj) {
	  var instance = _$1(obj);

	  instance._chain = true;
	  return instance;
	} // OOP
	// ---------------
	// If Underscore is called as a function, it returns a wrapped object that
	// can be used OO-style. This wrapper holds altered versions of all the
	// underscore functions. Wrapped objects may be chained.
	// Helper function to continue chaining intermediate results.

	function chainResult(instance, obj) {
	  return instance._chain ? _$1(obj).chain() : obj;
	} // Add your own custom functions to the Underscore object.


	function mixin(obj) {
	  each(functions(obj), function (name) {
	    var func = _$1[name] = obj[name];

	    _$1.prototype[name] = function () {
	      var args = [this._wrapped];
	      push.apply(args, arguments);
	      return chainResult(this, func.apply(_$1, args));
	    };
	  });
	  return _$1;
	} // Add all mutator Array functions to the wrapper.

	each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
	  var method = ArrayProto[name];

	  _$1.prototype[name] = function () {
	    var obj = this._wrapped;
	    method.apply(obj, arguments);
	    if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	    return chainResult(this, obj);
	  };
	}); // Add all accessor Array functions to the wrapper.

	each(['concat', 'join', 'slice'], function (name) {
	  var method = ArrayProto[name];

	  _$1.prototype[name] = function () {
	    return chainResult(this, method.apply(this._wrapped, arguments));
	  };
	}); // Extracts the result from a wrapped and chained object.

	_$1.prototype.value = function () {
	  return this._wrapped;
	}; // Provide unwrapping proxy for some methods used in engine operations
	// such as arithmetic and JSON stringification.


	_$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value;

	_$1.prototype.toString = function () {
	  return String(this._wrapped);
	};

	var allExports = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': _$1,
		VERSION: VERSION,
		iteratee: iteratee,
		restArguments: restArguments,
		each: each,
		forEach: each,
		map: map,
		collect: map,
		reduce: reduce,
		foldl: reduce,
		inject: reduce,
		reduceRight: reduceRight,
		foldr: reduceRight,
		find: find,
		detect: find,
		filter: filter,
		select: filter,
		reject: reject,
		every: every,
		all: every,
		some: some,
		any: some,
		contains: contains,
		includes: contains,
		include: contains,
		invoke: invoke,
		pluck: pluck,
		where: where,
		findWhere: findWhere,
		max: max,
		min: min,
		shuffle: shuffle,
		sample: sample,
		sortBy: sortBy,
		groupBy: groupBy,
		indexBy: indexBy,
		countBy: countBy,
		toArray: toArray,
		size: size,
		partition: partition,
		first: first,
		head: first,
		take: first,
		initial: initial,
		last: last,
		rest: rest,
		tail: rest,
		drop: rest,
		compact: compact,
		flatten: flatten,
		without: without,
		uniq: uniq,
		unique: uniq,
		union: union,
		intersection: intersection,
		difference: difference,
		unzip: unzip,
		zip: zip,
		object: object,
		findIndex: findIndex,
		findLastIndex: findLastIndex,
		sortedIndex: sortedIndex,
		indexOf: indexOf,
		lastIndexOf: lastIndexOf,
		range: range,
		chunk: chunk,
		bind: bind,
		partial: partial,
		bindAll: bindAll,
		memoize: memoize,
		delay: delay,
		defer: defer,
		throttle: throttle,
		debounce: debounce,
		wrap: wrap,
		negate: negate,
		compose: compose,
		after: after,
		before: before,
		once: once,
		keys: keys,
		allKeys: allKeys,
		values: values,
		mapObject: mapObject,
		pairs: pairs,
		invert: invert,
		functions: functions,
		methods: functions,
		extend: extend,
		extendOwn: extendOwn,
		assign: extendOwn,
		findKey: findKey,
		pick: pick,
		omit: omit,
		defaults: defaults,
		create: create,
		clone: clone,
		tap: tap,
		isMatch: isMatch,
		isEqual: isEqual,
		isEmpty: isEmpty,
		isElement: isElement,
		isArray: isArray,
		isObject: isObject,
		get isArguments () { return isArguments; },
		get isFunction () { return isFunction; },
		isString: isString,
		isNumber: isNumber,
		isDate: isDate,
		isRegExp: isRegExp,
		isError: isError,
		isSymbol: isSymbol,
		isMap: isMap,
		isWeakMap: isWeakMap,
		isSet: isSet,
		isWeakSet: isWeakSet,
		isFinite: isFinite,
		isNaN: isNaN$1,
		isBoolean: isBoolean,
		isNull: isNull,
		isUndefined: isUndefined,
		has: has,
		identity: identity,
		constant: constant,
		noop: noop$1,
		property: property,
		propertyOf: propertyOf,
		matcher: matcher,
		matches: matcher,
		times: times,
		random: random,
		now: now,
		escape: escape,
		unescape: unescape,
		result: result,
		uniqueId: uniqueId,
		templateSettings: templateSettings,
		template: template,
		chain: chain,
		mixin: mixin
	});

	var _$2 = mixin(allExports); // Legacy Node.js API


	_$2._ = _$2; // Export the Underscore API.

	/*
	 * Dataset class
	 * @class dw.Dataset
	 *
	 * @param {dw.Column[]} columns
	 */

	function dataset (_columns) {
	  // make column names unique
	  var columnsByName = {};

	  var origColumns = _columns.slice(0);

	  _columns.forEach(function (col) {
	    uniqueName(col);
	    columnsByName[col.name()] = col;
	  }); // sets a unique name for a column


	  function uniqueName(col) {
	    var origColName = col.name();
	    var colName = origColName;
	    var appendix = 1;

	    while (columnsByName.hasOwnProperty(colName)) {
	      colName = origColName + '.' + appendix++;
	    }

	    if (colName !== origColName) col.name(colName); // rename column
	  } // public interface


	  var dataset = {
	    /**
	     * returns all columns of the dataset
	     * @returns {dw.Column[]}
	     */
	    columns: function columns() {
	      return _columns;
	    },

	    /**
	     * returns a specific column by name or index
	     *
	     * @param {string|number} nameOrIndex -- the name or index of the column to return
	     * @returns {dw.Column}
	     */
	    column: function column(nameOrIndex) {
	      if (_$2.isString(nameOrIndex)) {
	        // single column by name
	        if (columnsByName[nameOrIndex] !== undefined) return columnsByName[nameOrIndex];
	        throw new Error('No column found with that name: "' + nameOrIndex + '"');
	      } else {
	        if (nameOrIndex < 0) {
	          return;
	        }
	      } // single column by index


	      if (_columns[nameOrIndex] !== undefined) return _columns[nameOrIndex];
	      throw new Error('No column found with that name or index: ' + nameOrIndex);
	    },

	    /**
	     * returns the number of columns in the dataset
	     * @returns {number}
	     */
	    numColumns: function numColumns() {
	      return _columns.length;
	    },

	    /**
	     * returns the number of rows in the dataset
	     * @returns {number}
	     */
	    numRows: function numRows() {
	      return _columns[0].length;
	    },

	    /** calls a function for each column of the dataset */
	    eachColumn: function eachColumn(func) {
	      _columns.forEach(func);
	    },

	    /**
	     * tests if a column name or index exists
	     *
	     * @param {string|number} nameOrIndex -- the name or index of the column
	     * @returns {boolean}
	     */
	    hasColumn: function hasColumn(nameOrIndex) {
	      return (_$2.isString(nameOrIndex) ? columnsByName[nameOrIndex] : _columns[nameOrIndex]) !== undefined;
	    },

	    /**
	     * returns the index of a column
	     * @param {string} columnName
	     * @returns {number}
	     */
	    indexOf: function indexOf(columnName) {
	      if (!dataset.hasColumn(columnName)) return -1;
	      return _columns.indexOf(columnsByName[columnName]);
	    },

	    /**
	     * returns a D3 friendly list of plain objects
	     * @returns {object[]}
	     */
	    list: function list() {
	      return _$2.range(_columns[0].length).map(function (r) {
	        var o = {};

	        _columns.forEach(function (col) {
	          o[col.name()] = col.val(r);
	        });

	        return o;
	      });
	    },

	    /**
	     * returns a CSV string representation of the dataset
	     * @returns {string}
	     */
	    csv: function csv() {
	      var csv = '';
	      var sep = ',';
	      var quote = '"'; // add header

	      _columns.forEach(function (col, i) {
	        var t = col.title();
	        if (t.indexOf(quote) > -1) t.replace(quote, '\\' + quote);
	        if (t.indexOf(sep) > -1) t = quote + t + quote;
	        csv += (i > 0 ? sep : '') + t;
	      }); // add values


	      _$2.range(dataset.numRows()).forEach(function (row) {
	        csv += '\n';

	        _columns.forEach(function (col, i) {
	          var t = '' + (col.type() === 'date' ? col.raw(row) : col.val(row));
	          if (t.indexOf(quote) > -1) t.replace(quote, '\\' + quote);
	          if (t.indexOf(sep) > -1) t = quote + t + quote;
	          csv += (i > 0 ? sep : '') + t;
	        });
	      });

	      return csv;
	    },

	    /**
	     * @alias csv
	     * @deprecated
	     */
	    toCSV: function toCSV() {
	      return this.csv();
	    },

	    /**
	     * removes ignored columns from dataset
	     * @param {object} ignore -- object of column names to ignore
	     */
	    filterColumns: function filterColumns(ignore) {
	      _columns = _columns.filter(function (c) {
	        return !ignore[c.name()];
	      });

	      _$2.each(ignore, function (ign, key) {
	        if (ign && columnsByName[key]) delete columnsByName[key];
	      });

	      return dataset;
	    },

	    /**
	     * executes func for each row of the dataset
	     */
	    eachRow: function eachRow(func) {
	      var i;

	      for (i = 0; i < dataset.numRows(); i++) {
	        func(i);
	      }

	      return dataset;
	    },

	    /**
	     * adds a new column to the dataset
	     * @param {dw.Column} column
	     */
	    add: function add(column) {
	      uniqueName(column);

	      _columns.push(column);

	      columnsByName[column.name()] = column;
	      origColumns.push(column);
	      return dataset;
	    },

	    /**
	     * cuts each column in the dataset to a maximum number of rows
	     * @param {number} numRows
	     * @returns {dw.Dataset}
	     */
	    limitRows: function limitRows(numRows) {
	      _columns.forEach(function (col) {
	        col.limitRows(numRows);
	      });

	      return dataset;
	    },

	    /**
	     * cuts the number of columns to a maximum value
	     * @param {number} numCols
	     * @returns {dw.Dataset}
	     */
	    limitColumns: function limitColumns(numCols) {
	      if (_columns.length > numCols) {
	        _columns.length = numCols;
	        origColumns.length = numCols;
	      }

	      return dataset;
	    },

	    /**
	     * returns the columns in a given order
	     * @param {number[]} sortOrder -- array of indexes
	     */
	    columnOrder: function columnOrder(sortOrder) {
	      if (arguments.length) {
	        _columns.length = 0;
	        sortOrder.forEach(function (i) {
	          _columns.push(origColumns[i]);
	        });
	        return dataset;
	      }

	      return _columns.map(function (c) {
	        return origColumns.indexOf(c);
	      });
	    }
	  };
	  return dataset;
	}

	function text () {
	  return {
	    parse: _$2.identity,
	    errors: function errors() {
	      return 0;
	    },
	    name: function name() {
	      return 'text';
	    },
	    formatter: function formatter() {
	      return _$2.identity;
	    },
	    isValid: function isValid() {
	      return true;
	    },
	    format: function format() {}
	  };
	}

	/**
	 * returns true if two numeric values are close enough
	 *
	 * @exports equalish
	 * @kind function
	 *
	 * @param {number} a
	 * @param {number} b
	 *
	 * @example
	 * // returns true
	 * equalish(0.333333, 1/3)
	 *
	 * @example
	 * // returns false
	 * equalish(0.333, 1/3)
	 *
	 * @export
	 * @returns {boolean}
	 */
	function equalish(a, b) {
	  return Math.abs(a - b) < 1e-6;
	}

	/* eslint no-irregular-whitespace: "off" */
	/* globals Globalize */

	/*
	 * A type for numbers:
	 *
	 * Usage:
	 * var parse = dw.type.number(sampleData);
	 * parse()
	 */

	function number (sample) {
	  function signDigitsDecimalPlaces(num, sig) {
	    if (num === 0) return 0;
	    return Math.round(sig - Math.ceil(Math.log(Math.abs(num)) / Math.LN10));
	  }

	  var _format;

	  var _errors = 0;
	  var knownFormats = {
	    '-.': /^ *[-–—−]?[0-9]*(\.[0-9]+)?(e[+-][0-9]+)?%? *$/,
	    '-,': /^ *[-–—−]?[0-9]*(,[0-9]+)?%? *$/,
	    ',.': /^ *[-–—−]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
	    '.,': /^ *[-–—−]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
	    ' .': /^ *[-–—−]?[0-9]{1,3}([   ][0-9]{3})*(\.[0-9]+)?%? *$/,
	    ' ,': /^ *[-–—−]?[0-9]{1,3}([   ][0-9]{3})*(,[0-9]+)?%? *$/,
	    // excel sometimes produces a strange white-space:
	    "'.": /^ *[-–—−]?[0-9]{1,3}('[0-9]{3})*(\.[0-9]+)?%? *$/
	  };
	  var formatLabels = {
	    '-.': '1234.56',
	    '-,': '1234,56',
	    ',.': '1,234.56',
	    '.,': '1.234,56',
	    ' .': '1 234.56',
	    ' ,': '1 234,56',
	    // excel sometimes produces a strange white-space:
	    ' .': '1 234.56',
	    ' ,': '1 234,56',
	    ' .': '1 234.56',
	    ' ,': '1 234,56'
	  }; // a list of strings that are recognized as 'not available'

	  var naStrings = {
	    na: 1,
	    'n/a': 1,
	    '-': 1,
	    ':': 1
	  };
	  var matches = {};
	  var bestMatch = ['-.', 0];
	  sample = sample || [];

	  _$2.each(sample, function (n) {
	    _$2.each(knownFormats, function (regex, fmt) {
	      if (matches[fmt] === undefined) matches[fmt] = 0;

	      if (regex.test(n)) {
	        matches[fmt] += 1;

	        if (matches[fmt] > bestMatch[1]) {
	          bestMatch[0] = fmt;
	          bestMatch[1] = matches[fmt];
	        }
	      }
	    });
	  });

	  _format = bestMatch[0]; // public interface

	  var type = {
	    parse: function parse(raw) {
	      if (_$2.isNumber(raw) || _$2.isUndefined(raw) || _$2.isNull(raw)) return raw; // replace percent sign, n-dash & m-dash, remove weird spaces

	      var number = raw.replace('%', '').replace('−', '-').replace(/[   ]/g, '').replace('–', '-').replace('—', '-'); // normalize number

	      if (_format[0] !== '-') {
	        // remove kilo seperator
	        number = number.replace(new RegExp(_format[0] === '.' ? '\\.' : _format[0], 'g'), '');
	      }

	      if (_format[1] !== '.') {
	        // replace decimal char w/ point
	        number = number.replace(_format[1], '.');
	      }

	      if (isNaN(number) || number === '') {
	        if (!naStrings[number.toLowerCase()] && number !== '') _errors++;
	        return raw;
	      }

	      return Number(number);
	    },
	    toNum: function toNum(i) {
	      return i;
	    },
	    fromNum: function fromNum(i) {
	      return i;
	    },
	    errors: function errors() {
	      return _errors;
	    },
	    name: function name() {
	      return 'number';
	    },
	    // returns a function for formatting numbers
	    formatter: function formatter(config) {
	      var format = config['number-format'] || '-';
	      var div = Number(config['number-divisor'] || 0);
	      var append = (config['number-append'] || '').replace(/ /g, "\xA0");
	      var prepend = (config['number-prepend'] || '').replace(/ /g, "\xA0");
	      return function (val, full, round) {
	        if (isNaN(val)) return val;
	        var _fmt = format;
	        if (div !== 0 && _fmt === '-') _fmt = 'n1';
	        if (div !== 0) val = Number(val) / Math.pow(10, div);

	        if (_fmt.substr(0, 1) === 's') {
	          // significant figures
	          var sig = +_fmt.substr(1);
	          _fmt = 'n' + Math.max(0, signDigitsDecimalPlaces(val, sig));
	        }

	        if (round) _fmt = 'n0';

	        if (_fmt === '-') {
	          // guess number format based on single number
	          _fmt = equalish(val, Math.round(val)) ? 'n0' : equalish(val, Math.round(val * 10) * 0.1) ? 'n1' : equalish(val, Math.round(val * 100) * 0.01) ? 'n2' : equalish(val, Math.round(val * 1000) * 0.001) ? 'n3' : equalish(val, Math.round(val * 10000) * 0.0001) ? 'n4' : equalish(val, Math.round(val * 100000) * 0.00001) ? 'n5' : 'n6';
	        }

	        val = Globalize.format(val, _fmt !== '-' ? _fmt : null);
	        return full ? prepend + val + append : val;
	      };
	    },
	    isValid: function isValid(val) {
	      return val === '' || naStrings[String(val).toLowerCase()] || _$2.isNumber(type.parse(val));
	    },
	    ambiguousFormats: function ambiguousFormats() {
	      var candidates = [];

	      _$2.each(matches, function (cnt, fmt) {
	        if (cnt === bestMatch[1]) {
	          candidates.push([fmt, formatLabels[fmt]]); // key, label
	        }
	      });

	      return candidates;
	    },
	    format: function format(fmt) {
	      if (arguments.length) {
	        _format = fmt;
	        return type;
	      }

	      return _format;
	    }
	  };
	  return type;
	}

	/* globals Globalize */
	var begin = /^ */.source;
	var end = /[*']* *$/.source;
	var s0 = /[ \-/.]?/.source; // optional separator

	var s1 = /[ \-/.]/.source; // mandatory separator

	var s2 = /[ \-/.;,]/.source; // mandatory separator

	var s3 = /[ \-|T]/.source; // mandatory separator

	var sM = /[ \-/.m]/.source; // mandatory separator

	var rx = {
	  YY: {
	    parse: /['’‘]?(\d{2})/
	  },
	  YYYY: {
	    test: /([12]\d{3})/,
	    parse: /(\d{4})/
	  },
	  YYYY2: {
	    test: /(?:1[7-9]|20)\d{2}/,
	    parse: /(\d{4})/
	  },
	  H: {
	    parse: /h([12])/
	  },
	  Q: {
	    parse: /q([1234])/
	  },
	  W: {
	    parse: /w([0-5]?[0-9])/
	  },
	  MM: {
	    test: /(0?[1-9]|1[0-2])/,
	    parse: /(0?[1-9]|1[0-2])/
	  },
	  DD: {
	    parse: /(0?[1-9]|[1-2][0-9]|3[01])/
	  },
	  DOW: {
	    parse: /([0-7])/
	  },
	  HHMM: {
	    parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(am|pm)?/
	  }
	};
	var MONTHS = {
	  // feel free to add more localized month names
	  0: ['jan', 'january', 'januar', 'jänner', 'jän', 'janv', 'janvier', 'ene', 'enero', 'gen', 'gennaio', 'janeiro'],
	  1: ['feb', 'february', 'febr', 'februar', 'fév', 'févr', 'février', 'febrero', 'febbraio', 'fev', 'fevereiro'],
	  2: ['mar', 'mär', 'march', 'mrz', 'märz', 'mars', 'mars', 'marzo', 'marzo', 'março'],
	  3: ['apr', 'april', 'apr', 'april', 'avr', 'avril', 'abr', 'abril', 'aprile'],
	  4: ['may', 'mai', 'mayo', 'mag', 'maggio', 'maio', 'maj'],
	  5: ['jun', 'june', 'juni', 'juin', 'junio', 'giu', 'giugno', 'junho'],
	  6: ['jul', 'july', 'juli', 'juil', 'juillet', 'julio', 'lug', 'luglio', 'julho'],
	  7: ['aug', 'august', 'août', 'ago', 'agosto'],
	  8: ['sep', 'september', 'sept', 'septembre', 'septiembre', 'set', 'settembre', 'setembro'],
	  9: ['oct', 'october', 'okt', 'oktober', 'octobre', 'octubre', 'ott', 'ottobre', 'out', 'outubro'],
	  10: ['nov', 'november', 'november', 'novembre', 'noviembre', 'novembre', 'novembro'],
	  11: ['dec', 'december', 'dez', 'des', 'dezember', 'déc', 'décembre', 'dic', 'diciembre', 'dicembre', 'desember', 'dezembro']
	};
	var shortMonthKey = {};

	_$2.each(MONTHS, function (abbr, m) {
	  _$2.each(abbr, function (a) {
	    shortMonthKey[a] = m;
	  });
	});

	rx.MMM = {
	  parse: new RegExp('(' + _$2.flatten(_$2.values(MONTHS)).join('|') + ')')
	};

	_$2.each(rx, function (r) {
	  r.parse = r.parse.source;
	  if (_$2.isRegExp(r.test)) r.test = r.test.source;else r.test = r.parse;
	});

	var knownFormats = {
	  // each format has two regex, a strict one for format guessing
	  // based on a sample and a lazy one for parsing
	  YYYY: {
	    test: reg(rx.YYYY2.test),
	    parse: reg(rx.YYYY2.parse),
	    precision: 'year'
	  },
	  'YYYY-H': {
	    test: reg(rx.YYYY.test, s0, rx.H.test),
	    parse: reg(rx.YYYY.parse, s0, rx.H.parse),
	    precision: 'half'
	  },
	  'H-YYYY': {
	    test: reg(rx.H.test, s1, rx.YYYY.test),
	    parse: reg(rx.H.parse, s1, rx.YYYY.parse),
	    precision: 'half'
	  },
	  'YYYY-Q': {
	    test: reg(rx.YYYY.test, s0, rx.Q.test),
	    parse: reg(rx.YYYY.parse, s0, rx.Q.parse),
	    precision: 'quarter'
	  },
	  'Q-YYYY': {
	    test: reg(rx.Q.test, s1, rx.YYYY.test),
	    parse: reg(rx.Q.parse, s1, rx.YYYY.parse),
	    precision: 'quarter'
	  },
	  'YYYY-M': {
	    test: reg(rx.YYYY.test, sM, rx.MM.test),
	    parse: reg(rx.YYYY.parse, sM, rx.MM.parse),
	    precision: 'month'
	  },
	  'M-YYYY': {
	    test: reg(rx.MM.test, s1, rx.YYYY.test),
	    parse: reg(rx.MM.parse, s1, rx.YYYY.parse),
	    precision: 'month'
	  },
	  'YYYY-MMM': {
	    test: reg(rx.YYYY.test, s1, rx.MMM.parse),
	    parse: reg(rx.YYYY.parse, s1, rx.MMM.parse),
	    precision: 'month'
	  },
	  'MMM-YYYY': {
	    test: reg(rx.MMM.parse, s1, rx.YYYY.test),
	    parse: reg(rx.MMM.parse, s1, rx.YYYY.parse),
	    precision: 'month'
	  },
	  'MMM-YY': {
	    test: reg(rx.MMM.parse, s1, rx.YY.test),
	    parse: reg(rx.MMM.parse, s1, rx.YY.parse),
	    precision: 'month'
	  },
	  MMM: {
	    test: reg(rx.MMM.parse),
	    parse: reg(rx.MMM.parse),
	    precision: 'month'
	  },
	  'YYYY-WW': {
	    test: reg(rx.YYYY.test, s0, rx.W.test),
	    parse: reg(rx.YYYY.parse, s0, rx.W.parse),
	    precision: 'week'
	  },
	  'WW-YYYY': {
	    test: reg(rx.W.test, s1, rx.YYYY.test),
	    parse: reg(rx.W.parse, s1, rx.YYYY.parse),
	    precision: 'week'
	  },
	  'MM/DD/YYYY': {
	    test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test),
	    parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse),
	    precision: 'day'
	  },
	  'MM/DD/YY': {
	    test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YY.test),
	    parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YY.parse),
	    precision: 'day'
	  },
	  'DD/MM/YY': {
	    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YY.test),
	    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YY.parse),
	    precision: 'day'
	  },
	  'DD/MM/YYYY': {
	    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test),
	    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse),
	    precision: 'day'
	  },
	  'DD/MMM/YYYY': {
	    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YYYY.test),
	    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YYYY.parse),
	    precision: 'day'
	  },
	  'DD/MMM/YY': {
	    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MMM.test, '\\2', rx.YY.test),
	    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MMM.parse, '\\2', rx.YY.parse),
	    precision: 'day'
	  },
	  'YYYY-MM-DD': {
	    test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test),
	    parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse),
	    precision: 'day'
	  },
	  'MMM-DD-YYYY': {
	    test: reg(rx.MMM.test, s1, rx.DD.test, s2, rx.YYYY.test),
	    parse: reg(rx.MMM.parse, s1, rx.DD.parse, s2, rx.YYYY.parse),
	    precision: 'day'
	  },
	  'YYYY-WW-d': {
	    // year + ISO week + [day]
	    test: reg(rx.YYYY.test, s0, rx.W.test, s1, rx.DOW.test),
	    parse: reg(rx.YYYY.parse, s0, rx.W.parse, s1, rx.DOW.parse),
	    precision: 'day'
	  },
	  // dates with a time
	  'MM/DD/YYYY HH:MM': {
	    test: reg(rx.MM.test, '([\\-\\/])', rx.DD.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
	    parse: reg(rx.MM.parse, '([\\-\\/])', rx.DD.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
	    precision: 'day-minutes'
	  },
	  'DD.MM.YYYY HH:MM': {
	    test: reg(rx.DD.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.YYYY.test, s3, rx.HHMM.test),
	    parse: reg(rx.DD.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.YYYY.parse, s3, rx.HHMM.parse),
	    precision: 'day-minutes'
	  },
	  'YYYY-MM-DD HH:MM': {
	    test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test, s3, rx.HHMM.test),
	    parse: reg(rx.YYYY.parse, '([\\-\\.\\/ ?])', rx.MM.parse, '\\2', rx.DD.parse, s3, rx.HHMM.parse),
	    precision: 'day-minutes'
	  },
	  ISO8601: {
	    test: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)/,
	    parse: function parse(str) {
	      return str;
	    },
	    precision: 'day-seconds'
	  }
	};

	function reg() {
	  return new RegExp(begin + Array.prototype.slice.call(arguments).join(' *') + end, 'i');
	}

	function test(str, key) {
	  var fmt = knownFormats[key];

	  if (_$2.isRegExp(fmt.test)) {
	    return fmt.test.test(str);
	  } else {
	    return fmt.test(str, key);
	  }
	}

	function _parse(str, key) {
	  var fmt = knownFormats[key];

	  if (_$2.isRegExp(fmt.parse)) {
	    return str.match(fmt.parse);
	  } else {
	    return fmt.parse(str, key);
	  }
	}

	function dateFromIsoWeek(year, week, day) {
	  var d = new Date(Date.UTC(year, 0, 3));
	  d.setUTCDate(3 - d.getUTCDay() + (week - 1) * 7 + parseInt(day, 10));
	  return d;
	}

	function dateToIsoWeek(date) {
	  var d = date.getUTCDay();
	  var t = new Date(date.valueOf());
	  t.setDate(t.getDate() - (d + 6) % 7 + 3);
	  var isoYear = t.getUTCFullYear();
	  var w = Math.floor((t.getTime() - new Date(isoYear, 0, 1, -6)) / 864e5);
	  return [isoYear, 1 + Math.floor(w / 7), d > 0 ? d : 7];
	}

	function hour(hr, amPm) {
	  if (hr !== 12) return hr + (amPm === 'pm' ? 12 : 0);
	  return amPm === 'am' ? 0 : 12;
	}

	function date (sample) {
	  var _format;

	  var _errors = 0;
	  var matches = {};
	  var bestMatch = ['', 0];
	  sample = sample || [];

	  _$2.each(knownFormats, function (format, key) {
	    _$2.each(sample, function (n) {
	      if (matches[key] === undefined) matches[key] = 0;

	      if (test(n, key)) {
	        matches[key] += 1;

	        if (matches[key] > bestMatch[1]) {
	          bestMatch[0] = key;
	          bestMatch[1] = matches[key];
	        }
	      }
	    });
	  });

	  _format = bestMatch[0]; // public interface

	  var type = {
	    parse: function parse(raw) {
	      if (_$2.isDate(raw) || _$2.isUndefined(raw)) return raw;

	      if (!_format || !_$2.isString(raw)) {
	        _errors++;
	        return raw;
	      }

	      var m = _parse(raw.toLowerCase(), _format);

	      if (!m) {
	        _errors++;
	        return raw;
	      } else {
	        // increment errors anyway if string doesn't match strict format
	        if (!test(raw, _format)) _errors++;
	      }

	      function guessTwoDigitYear(yr) {
	        yr = +yr;
	        if (yr < 30) return 2000 + yr;else return 1900 + yr;
	      }

	      var curYear = new Date().getFullYear();

	      switch (_format) {
	        case 'YYYY':
	          return new Date(m[1], 0, 1);

	        case 'YYYY-H':
	          return new Date(m[1], (m[2] - 1) * 6, 1);

	        case 'H-YYYY':
	          return new Date(m[2], (m[1] - 1) * 6, 1);

	        case 'YYYY-Q':
	          return new Date(m[1], (m[2] - 1) * 3, 1);

	        case 'Q-YYYY':
	          return new Date(m[2], (m[1] - 1) * 3, 1);

	        case 'YYYY-M':
	          return new Date(m[1], m[2] - 1, 1);

	        case 'M-YYYY':
	          return new Date(m[2], m[1] - 1, 1);

	        case 'YYYY-MMM':
	          return new Date(+m[1], shortMonthKey[m[2]], 1);

	        case 'MMM-YYYY':
	          return new Date(+m[2], shortMonthKey[m[1]], 1);

	        case 'MMM-YY':
	          return new Date(guessTwoDigitYear(+m[2]), shortMonthKey[m[1]], 1);

	        case 'MMM':
	          return new Date(curYear, shortMonthKey[m[1]], 1);

	        case 'YYYY-WW':
	          return dateFromIsoWeek(m[1], m[2], 1);

	        case 'WW-YYYY':
	          return dateFromIsoWeek(m[2], m[1], 1);

	        case 'YYYY-WW-d':
	          return dateFromIsoWeek(m[1], m[2], m[3]);

	        case 'YYYY-MM-DD':
	          return new Date(m[1], m[3] - 1, m[4]);

	        case 'DD/MM/YYYY':
	          return new Date(m[4], m[3] - 1, m[1]);

	        case 'DD/MMM/YYYY':
	          return new Date(m[4], shortMonthKey[m[3]], m[1]);

	        case 'DD/MMM/YY':
	          return new Date(guessTwoDigitYear(m[4]), shortMonthKey[m[3]], m[1]);

	        case 'MM/DD/YYYY':
	          return new Date(m[4], m[1] - 1, m[3]);

	        case 'MM/DD/YY':
	          return new Date(guessTwoDigitYear(m[4]), m[1] - 1, m[3]);

	        case 'DD/MM/YY':
	          return new Date(guessTwoDigitYear(m[4]), m[3] - 1, m[1]);

	        case 'MMM-DD-YYYY':
	          return new Date(m[3], shortMonthKey[m[1]], m[2]);

	        case 'YYYY-MM-DD HH:MM':
	          return new Date(+m[1], m[3] - 1, +m[4], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);

	        case 'DD.MM.YYYY HH:MM':
	          return new Date(+m[4], m[3] - 1, +m[1], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);

	        case 'MM/DD/YYYY HH:MM':
	          return new Date(+m[4], m[1] - 1, +m[3], hour(+m[5], m[8]), +m[6] || 0, +m[7] || 0);

	        case 'ISO8601':
	          return new Date(m.toUpperCase());

	        default:
	          console.warn('unknown format', _format);
	      }

	      _errors++;
	      return raw;
	    },
	    toNum: function toNum(d) {
	      return _$2.isDate(d) ? d.getTime() : Number.NaN;
	    },
	    fromNum: function fromNum(i) {
	      return new Date(i);
	    },
	    errors: function errors() {
	      return _errors;
	    },
	    name: function name() {
	      return 'date';
	    },
	    format: function format(fmt) {
	      if (arguments.length) {
	        _format = fmt;
	        return type;
	      }

	      return _format;
	    },
	    precision: function precision() {
	      return knownFormats[_format].precision;
	    },
	    // returns a function for formatting dates
	    formatter: function formatter() {
	      if (!_format) return _$2.identity;
	      var monthPattern = Globalize.culture().calendar.patterns.M.replace('MMMM', 'MMM');

	      switch (knownFormats[_format].precision) {
	        case 'year':
	          return function (d) {
	            return !_$2.isDate(d) ? d : d.getFullYear();
	          };

	        case 'half':
	          return function (d) {
	            return !_$2.isDate(d) ? d : d.getFullYear() + ' H' + (d.getMonth() / 6 + 1);
	          };

	        case 'quarter':
	          return function (d) {
	            return !_$2.isDate(d) ? d : d.getFullYear() + ' Q' + (d.getMonth() / 3 + 1);
	          };

	        case 'month':
	          return function (d) {
	            return !_$2.isDate(d) ? d : Globalize.format(d, 'MMM yy');
	          };

	        case 'week':
	          return function (d) {
	            return !_$2.isDate(d) ? d : dateToIsoWeek(d).slice(0, 2).join(' W');
	          };

	        case 'day':
	          return function (d, verbose) {
	            return !_$2.isDate(d) ? d : Globalize.format(d, verbose ? 'D' : 'd');
	          };

	        case 'day-minutes':
	          return function (d) {
	            return !_$2.isDate(d) ? d : Globalize.format(d, monthPattern).replace(' ', '&nbsp;') + ' - ' + Globalize.format(d, 't').replace(' ', '&nbsp;');
	          };

	        case 'day-seconds':
	          return function (d) {
	            return !_$2.isDate(d) ? d : Globalize.format(d, 'T').replace(' ', '&nbsp;');
	          };
	      }
	    },
	    isValid: function isValid(val) {
	      return _$2.isDate(type.parse(val));
	    },
	    ambiguousFormats: function ambiguousFormats() {
	      var candidates = [];

	      _$2.each(matches, function (cnt, fmt) {
	        if (cnt === bestMatch[1]) {
	          candidates.push([fmt, fmt]); // key, label
	        }
	      });

	      return candidates;
	    }
	  };
	  return type;
	}

	var columnTypes = {
	  text: text,
	  number: number,
	  date: date
	};

	var TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	var COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	var defaultAllowed = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';
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

	      if (sel[i].getAttribute('href') && sel[i].getAttribute('href').trim().startsWith('javascript:')) {
	        // remove entire href to be safe
	        sel[i].setAttribute('href', '');
	      }
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

	/*
	 * column abstracts the functionality of each column
	 * of a dataset. A column has a type (text|number|date).
	 *
	 * API:
	 *
	 * column.name() ... returns the name (string)
	 * column.type() ... return column type (string)
	 * column.length ... number of rows (number)
	 * column.val(i) ... parsed value in row i
	 * column.each(func) ... apply function to each value
	 * column.raw() ... access raw, unparsed values
	 *
	 */
	/**
	 * @class dw.Column
	 */

	function column (_name, rows, _type) {
	  function notEmpty(d) {
	    return d !== null && d !== undefined && d !== '';
	  }

	  function guessType(sample) {
	    if (_$2.every(rows, _$2.isNumber)) return columnTypes.number();
	    if (_$2.every(rows, _$2.isDate)) return columnTypes.date(); // guessing column type by counting parsing errors
	    // for every known type

	    var types = [columnTypes.date(sample), columnTypes.number(sample), columnTypes.text()];
	    var type;
	    var tolerance = 0.1 * rows.filter(notEmpty).length; // allowing 10% mis-parsed values

	    _$2.each(rows, function (val) {
	      _$2.each(types, function (t) {
	        t.parse(val);
	      });
	    });

	    _$2.every(types, function (t) {
	      if (t.errors() < tolerance) type = t;
	      return !type;
	    });

	    if (_$2.isUndefined(type)) type = types[2]; // default to text;

	    return type;
	  } // we pick random 200 non-empty values for column type testing


	  var sample = _$2.shuffle(_$2.range(rows.length)).filter(function (i) {
	    return notEmpty(rows[i]);
	  }).slice(0, 200).map(function (i) {
	    return rows[i];
	  });

	  _type = _type ? columnTypes[_type](sample) : guessType(sample);

	  var _range;

	  var _total;

	  var origRows = rows.slice(0);

	  var _title; // public interface


	  var column = {
	    // column name (used for reference in chart metadata)
	    name: function name() {
	      if (arguments.length) {
	        _name = arguments[0];
	        return column;
	      }

	      return purifyHTML(_name);
	    },
	    // column title (used for presentation)
	    title: function title() {
	      if (arguments.length) {
	        _title = arguments[0];
	        return column;
	      }

	      return purifyHTML(_title || _name);
	    },

	    /**
	     * number of rows
	     */
	    length: rows.length,

	    /**
	     * returns ith row of the col, parsed
	     *
	     * @param i
	     * @param unfiltered  if set to true, precedent calls of filterRows are ignored
	     */
	    val: function val(i, unfiltered) {
	      if (!arguments.length) return undefined;
	      var r = unfiltered ? origRows : rows;
	      if (i < 0) i += r.length;
	      return _type.parse(_$2.isDate(r[i]) || _$2.isNumber(r[i]) ? r[i] : purifyHTML(r[i]));
	    },

	    /*
	     * returns an array of parsed values
	     */
	    values: function values(unfiltered) {
	      var r = unfiltered ? origRows : rows;
	      r = _$2.map(r, function (d) {
	        return _$2.isDate(d) || _$2.isNumber(d) ? d : purifyHTML(d);
	      });
	      return _$2.map(r, _type.parse);
	    },

	    /**
	     * apply function to each value
	     */
	    each: function each(f) {
	      for (var i = 0; i < rows.length; i++) {
	        f(column.val(i), i);
	      }
	    },
	    // access to raw values
	    raw: function raw(i, val) {
	      if (!arguments.length) return rows.map(function (d) {
	        return _$2.isDate(d) || _$2.isNumber(d) ? d : purifyHTML(d);
	      });

	      if (arguments.length === 2) {
	        rows[i] = val;
	        return column;
	      }

	      return _$2.isDate(rows[i]) || _$2.isNumber(rows[i]) ? rows[i] : purifyHTML(rows[i]);
	    },

	    /**
	     * if called with no arguments, this returns the column type name
	     * if called with true as argument, this returns the column type (as object)
	     * if called with a string as argument, this sets a new column type
	     */
	    type: function type(o) {
	      if (o === true) return _type;

	      if (_$2.isString(o)) {
	        if (columnTypes[o]) {
	          _type = columnTypes[o](sample);
	          return column;
	        } else {
	          throw new Error('unknown column type: ' + o);
	        }
	      }

	      return _type.name();
	    },
	    // [min,max] range
	    range: function range() {
	      if (!_type.toNum) return false;

	      if (!_range) {
	        _range = [Number.MAX_VALUE, -Number.MAX_VALUE];
	        column.each(function (v) {
	          v = _type.toNum(v);
	          if (!_$2.isNumber(v) || _$2.isNaN(v)) return;
	          if (v < _range[0]) _range[0] = v;
	          if (v > _range[1]) _range[1] = v;
	        });
	        _range[0] = _type.fromNum(_range[0]);
	        _range[1] = _type.fromNum(_range[1]);
	      }

	      return _range;
	    },
	    // sum of values
	    total: function total() {
	      if (!_type.toNum) return false;

	      if (!_total) {
	        _total = 0;
	        column.each(function (v) {
	          _total += _type.toNum(v);
	        });
	        _total = _type.fromNum(_total);
	      }

	      return _total;
	    },
	    // remove rows from column, keep those whose index
	    // is within @r
	    filterRows: function filterRows(r) {
	      rows = [];

	      if (arguments.length) {
	        _$2.each(r, function (i) {
	          rows.push(origRows[i]);
	        });
	      } else {
	        rows = origRows.slice(0);
	      }

	      column.length = rows.length; // invalidate range and total

	      _range = _total = false;
	      return column;
	    },
	    toString: function toString() {
	      return _name + ' (' + _type.name() + ')';
	    },
	    indexOf: function indexOf(val) {
	      return _$2.find(_$2.range(rows.length), function (i) {
	        return column.val(i) === val;
	      });
	    },
	    limitRows: function limitRows(numRows) {
	      if (origRows.length > numRows) {
	        origRows.length = numRows;
	        rows.length = numRows;
	        column.length = numRows;
	      }
	    }
	  };
	  return column;
	}

	function delimited(opts) {
	  function loadAndParseCsv() {
	    if (opts.url) {
	      var ts = new Date().getTime();
	      var url = "".concat(opts.url).concat(opts.url.indexOf('?') > -1 ? '&' : '?', "v=").concat(opts.url.indexOf('//static.dwcdn.net') > -1 ? ts - ts % 60000 : ts);
	      return window.fetch(url).then(function (res) {
	        return res.text();
	      }).then(function (raw) {
	        return new DelimitedParser(opts).parse(raw);
	      });
	    } else if (opts.csv || opts.csv === '') {
	      var dfd = new Promise(function (resolve) {
	        resolve(opts.csv);
	      });
	      var parsed = dfd.then(function (raw) {
	        return new DelimitedParser(opts).parse(raw);
	      });
	      return parsed;
	    }

	    throw new Error('you need to provide either an URL or CSV data.');
	  }

	  return {
	    dataset: loadAndParseCsv,
	    parse: function parse() {
	      return new DelimitedParser(opts).parse(opts.csv);
	    }
	  };
	}

	dataset.delimited = delimited;

	var DelimitedParser = /*#__PURE__*/function () {
	  function DelimitedParser(opts) {
	    classCallCheck(this, DelimitedParser);

	    opts = Object.assign({
	      delimiter: 'auto',
	      quoteChar: '"',
	      skipRows: 0,
	      emptyValue: null,
	      transpose: false,
	      firstRowIsHeader: true
	    }, opts);
	    this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
	    this.opts = opts;
	  }

	  createClass(DelimitedParser, [{
	    key: "parse",
	    value: function parse(data) {
	      this.__rawData = data;
	      var opts = this.opts;

	      if (opts.delimiter === 'auto') {
	        opts.delimiter = this.guessDelimiter(data, opts.skipRows);
	        this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
	      }

	      var closure = opts.delimiter !== '|' ? '|' : '#';
	      var arrData;
	      data = closure + '\n' + data.replace(/[ \r\n\f]+$/g, '') + closure;

	      function parseCSV(delimiterPattern, strData, strDelimiter) {
	        // implementation and regex borrowed from:
	        // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
	        // Check to see if the delimiter is defined. If not,
	        // then default to comma.
	        strDelimiter = strDelimiter || ','; // Create an array to hold our data. Give the array
	        // a default empty first row.

	        var arrData = [[]]; // Create an array to hold our individual pattern
	        // matching groups.

	        var arrMatches = null;
	        var strMatchedValue; // Keep looping over the regular expression matches
	        // until we can no longer find a match.

	        while (arrMatches = delimiterPattern.exec(strData)) {
	          // Get the delimiter that was found.
	          var strMatchedDelimiter = arrMatches[1]; // Check to see if the given delimiter has a length
	          // (is not the start of string) and if it matches
	          // field delimiter. If id does not, then we know
	          // that this delimiter is a row delimiter.

	          if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
	            // Since we have reached a new row of data,
	            // add an empty row to our data array.
	            arrData.push([]);
	          } // Now that we have our delimiter out of the way,
	          // let's check to see which kind of value we
	          // captured (quoted or unquoted).


	          if (arrMatches[2]) {
	            // We found a quoted value. When we capture
	            // this value, unescape any double quotes.
	            strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
	          } else {
	            // We found a non-quoted value.
	            strMatchedValue = arrMatches[3];
	          } // Now that we have our value string, let's add
	          // it to the data array.


	          arrData[arrData.length - 1].push(strMatchedValue === undefined ? '' : strMatchedValue);
	        } // remove closure


	        if (arrData[0][0].substr(0, 1) === closure) {
	          arrData[0][0] = arrData[0][0].substr(1);
	        }

	        var p = arrData.length - 1;
	        var q = arrData[p].length - 1;
	        var r = arrData[p][q].length - 1;

	        if (arrData[p][q].substr(r) === closure) {
	          arrData[p][q] = arrData[p][q].substr(0, r);
	        } // Return the parsed data.


	        return arrData.slice(1);
	      } // end parseCSV


	      function transpose(arrMatrix) {
	        // borrowed from:
	        // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
	        var a = arrMatrix;
	        var w = a.length ? a.length : 0;
	        var h = a[0] instanceof Array ? a[0].length : 0;

	        if (h === 0 || w === 0) {
	          return [];
	        }

	        var i, j;
	        var t = [];

	        for (i = 0; i < h; i++) {
	          t[i] = [];

	          for (j = 0; j < w; j++) {
	            t[i][j] = a[j][i];
	          }
	        }

	        return t;
	      }

	      function makeDataset(arrData) {
	        var columns = [];
	        var columnNames = {};
	        var rowCount = arrData.length;
	        var columnCount = arrData[0].length;
	        var rowIndex = opts.skipRows; // compute series

	        var srcColumns = [];

	        if (opts.firstRowIsHeader) {
	          srcColumns = arrData[rowIndex];
	          rowIndex++;
	        } // check that columns names are unique and not empty


	        for (var c = 0; c < columnCount; c++) {
	          var col = _$2.isString(srcColumns[c]) ? srcColumns[c].replace(/^\s+|\s+$/g, '') : '';
	          var suffix = col !== '' ? '' : 1;
	          col = col !== '' ? col : 'X.';

	          while (columnNames[col + suffix] !== undefined) {
	            suffix = suffix === '' ? 1 : suffix + 1;
	          }

	          columns.push({
	            name: col + suffix,
	            data: []
	          });
	          columnNames[col + suffix] = true;
	        }

	        _$2.range(rowIndex, rowCount).forEach(function (row) {
	          columns.forEach(function (c, i) {
	            c.data.push(arrData[row][i] !== '' ? arrData[row][i] : opts.emptyValue);
	          });
	        });

	        columns = columns.map(function (c) {
	          return column(c.name, c.data);
	        });
	        return dataset(columns);
	      } // end makeDataset


	      arrData = parseCSV(this.__delimiterPatterns, data, opts.delimiter);

	      if (opts.transpose) {
	        arrData = transpose(arrData);
	      }

	      return makeDataset(arrData);
	    } // end parse

	  }, {
	    key: "guessDelimiter",
	    value: function guessDelimiter(strData) {
	      // find delimiter which occurs most often
	      var maxMatchCount = 0;
	      var k = -1;
	      var me = this;
	      var delimiters = ['\t', ';', '|', ','];
	      delimiters.forEach(function (delimiter, i) {
	        var regex = getDelimiterPatterns(delimiter, me.quoteChar);
	        var c = strData.match(regex).length;
	        if (delimiter === '\t') c *= 1.15; // give tab delimiters more weight

	        if (c > maxMatchCount) {
	          maxMatchCount = c;
	          k = i;
	        }
	      });
	      return delimiters[k];
	    }
	  }]);

	  return DelimitedParser;
	}();

	function getDelimiterPatterns(delimiter, quoteChar) {
	  return new RegExp( // Delimiters.
	  '(\\' + delimiter + '|\\r?\\n|\\r|^)' + // Quoted fields.
	  '(?:' + quoteChar + '([^' + quoteChar + ']*(?:' + quoteChar + '"[^' + quoteChar + ']*)*)' + quoteChar + '|' + // Standard fields.
	  '([^' + quoteChar + '\\' + delimiter + '\\r\\n]*))', 'gi');
	}

	/* globals fetch */
	/*
	 * dataset source for JSON data
	 */

	function json(opts) {
	  function loadAndParseJSON() {
	    if (opts.url) {
	      return fetch(opts.url).then(function (res) {
	        return res.text();
	      }).then(function (raw) {
	        return JSON.parse(raw);
	      });
	    } else if (opts.csv) {
	      var dfd = new Promise(function (resolve) {
	        resolve(opts.csv);
	      });
	      var parsed = dfd.then(function (raw) {
	        return JSON.parse(raw);
	      });
	      return parsed;
	    }

	    throw new Error('you need to provide either an URL or CSV data.');
	  }

	  return {
	    dataset: loadAndParseJSON,
	    parse: function parse() {
	      return JSON.parse(opts.csv);
	    }
	  };
	}

	dataset.json = json;

	function reorderColumns (chart, dataset) {
	  var order = chart.getMetadata('data.column-order', []);

	  if (order.length && order.length === dataset.numColumns()) {
	    dataset.columnOrder(order);
	  }

	  return dataset;
	}

	function applyChanges (chart, dataset) {
	  var changes = chart.getMetadata('data.changes', []);
	  var transpose = chart.getMetadata('data.transpose', false); // apply changes

	  changes.forEach(function (change) {
	    var row = 'row';
	    var column = 'column';

	    if (transpose) {
	      row = 'column';
	      column = 'row';
	    }

	    if (dataset.hasColumn(change[column])) {
	      change.ignored = false;

	      if (change[row] === 0) {
	        if (change.previous && change.previous !== 'undefined') {
	          var oldTitle = dataset.column(change[column]).title();

	          if (oldTitle !== change.previous) {
	            // something is buggy about this, let's revisit later
	            // change.ignored = true;
	            return;
	          }
	        }

	        dataset.column(change[column]).title(change.value);
	      } else {
	        if (change.previous && change.previous !== 'undefined') {
	          var curValue = dataset.column(change[column]).raw(change[row] - 1);

	          if (curValue !== change.previous) {
	            // something is buggy about this, let's revisit later
	            // change.ignored = true;
	            return;
	          }
	        }

	        dataset.column(change[column]).raw(change[row] - 1, change.value);
	      }
	    }
	  }); // overwrite column types

	  var columnFormats = chart.getMetadata('data.column-format', {});

	  _$2.each(columnFormats, function (columnFormat, key) {
	    if (columnFormat.type && dataset.hasColumn(key) && columnFormat.type !== 'auto') {
	      dataset.column(key).type(columnFormat.type);
	    }

	    if (columnFormat['input-format'] && dataset.hasColumn(key)) {
	      dataset.column(key).type(true).format(columnFormat['input-format']);
	    }
	  });

	  return dataset;
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	var arrayWithHoles = _arrayWithHoles;

	function _iterableToArrayLimit(arr, i) {
	  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
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

	var iterableToArrayLimit = _iterableToArrayLimit;

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	var nonIterableRest = _nonIterableRest;

	function _slicedToArray(arr, i) {
	  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
	}

	var slicedToArray = _slicedToArray;

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
	  .replace(/^(and|or|in|true|false)$/, '$1_'); // avoid reserved keywords
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

	var TEOF = 'TEOF';
	var TOP = 'TOP';
	var TNUMBER = 'TNUMBER';
	var TSTRING = 'TSTRING';
	var TPAREN = 'TPAREN';
	var TBRACKET = 'TBRACKET';
	var TCOMMA = 'TCOMMA';
	var TNAME = 'TNAME';
	var TSEMICOLON = 'TSEMICOLON';
	function Token(type, value, index) {
	  this.type = type;
	  this.value = value;
	  this.index = index;
	}

	Token.prototype.toString = function () {
	  return this.type + ': ' + this.value;
	};

	function TokenStream(parser, expression) {
	  this.pos = 0;
	  this.current = null;
	  this.unaryOps = parser.unaryOps;
	  this.binaryOps = parser.binaryOps;
	  this.ternaryOps = parser.ternaryOps;
	  this.consts = parser.consts;
	  this.expression = expression;
	  this.savedPosition = 0;
	  this.savedCurrent = null;
	  this.options = parser.options;
	  this.parser = parser;
	}

	TokenStream.prototype.newToken = function (type, value, pos) {
	  return new Token(type, value, pos != null ? pos : this.pos);
	};

	TokenStream.prototype.save = function () {
	  this.savedPosition = this.pos;
	  this.savedCurrent = this.current;
	};

	TokenStream.prototype.restore = function () {
	  this.pos = this.savedPosition;
	  this.current = this.savedCurrent;
	};

	TokenStream.prototype.next = function () {
	  if (this.pos >= this.expression.length) {
	    return this.newToken(TEOF, 'EOF');
	  }

	  if (this.isWhitespace() || this.isComment()) {
	    return this.next();
	  } else if (this.isRadixInteger() || this.isNumber() || this.isOperator() || this.isString() || this.isParen() || this.isBracket() || this.isComma() || this.isSemicolon() || this.isNamedOp() || this.isConst() || this.isName()) {
	    return this.current;
	  } else {
	    this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
	  }
	};

	TokenStream.prototype.isString = function () {
	  var r = false;
	  var startPos = this.pos;
	  var quote = this.expression.charAt(startPos);

	  if (quote === '\'' || quote === '"') {
	    var index = this.expression.indexOf(quote, startPos + 1);

	    while (index >= 0 && this.pos < this.expression.length) {
	      this.pos = index + 1;

	      if (this.expression.charAt(index - 1) !== '\\') {
	        var rawString = this.expression.substring(startPos + 1, index);
	        this.current = this.newToken(TSTRING, this.unescape(rawString), startPos);
	        r = true;
	        break;
	      }

	      index = this.expression.indexOf(quote, index + 1);
	    }
	  }

	  return r;
	};

	TokenStream.prototype.isParen = function () {
	  var c = this.expression.charAt(this.pos);

	  if (c === '(' || c === ')') {
	    this.current = this.newToken(TPAREN, c);
	    this.pos++;
	    return true;
	  }

	  return false;
	};

	TokenStream.prototype.isBracket = function () {
	  var c = this.expression.charAt(this.pos);

	  if ((c === '[' || c === ']') && this.isOperatorEnabled('[')) {
	    this.current = this.newToken(TBRACKET, c);
	    this.pos++;
	    return true;
	  }

	  return false;
	};

	TokenStream.prototype.isComma = function () {
	  var c = this.expression.charAt(this.pos);

	  if (c === ',') {
	    this.current = this.newToken(TCOMMA, ',');
	    this.pos++;
	    return true;
	  }

	  return false;
	};

	TokenStream.prototype.isSemicolon = function () {
	  var c = this.expression.charAt(this.pos);

	  if (c === ';') {
	    this.current = this.newToken(TSEMICOLON, ';');
	    this.pos++;
	    return true;
	  }

	  return false;
	};

	TokenStream.prototype.isConst = function () {
	  var startPos = this.pos;
	  var i = startPos;

	  for (; i < this.expression.length; i++) {
	    var c = this.expression.charAt(i);

	    if (c.toUpperCase() === c.toLowerCase()) {
	      if (i === this.pos || c !== '_' && c !== '.' && (c < '0' || c > '9')) {
	        break;
	      }
	    }
	  }

	  if (i > startPos) {
	    var str = this.expression.substring(startPos, i);

	    if (str in this.consts) {
	      this.current = this.newToken(TNUMBER, this.consts[str]);
	      this.pos += str.length;
	      return true;
	    }
	  }

	  return false;
	};

	TokenStream.prototype.isNamedOp = function () {
	  var startPos = this.pos;
	  var i = startPos;

	  for (; i < this.expression.length; i++) {
	    var c = this.expression.charAt(i);

	    if (c.toUpperCase() === c.toLowerCase()) {
	      if (i === this.pos || c !== '_' && (c < '0' || c > '9')) {
	        break;
	      }
	    }
	  }

	  if (i > startPos) {
	    var str = this.expression.substring(startPos, i);

	    if (this.isOperatorEnabled(str) && (str in this.binaryOps || str in this.unaryOps || str in this.ternaryOps)) {
	      this.current = this.newToken(TOP, str);
	      this.pos += str.length;
	      return true;
	    }
	  }

	  return false;
	};

	TokenStream.prototype.isName = function () {
	  var startPos = this.pos;
	  var i = startPos;
	  var hasLetter = false;

	  for (; i < this.expression.length; i++) {
	    var c = this.expression.charAt(i);

	    if (c.toUpperCase() === c.toLowerCase()) {
	      if (i === this.pos && (c === '$' || c === '_')) {
	        if (c === '_') {
	          hasLetter = true;
	        }

	        continue;
	      } else if (i === this.pos || !hasLetter || c !== '_' && (c < '0' || c > '9')) {
	        break;
	      }
	    } else {
	      hasLetter = true;
	    }
	  }

	  if (hasLetter) {
	    var str = this.expression.substring(startPos, i);
	    this.current = this.newToken(TNAME, str);
	    this.pos += str.length;
	    return true;
	  }

	  return false;
	};

	TokenStream.prototype.isWhitespace = function () {
	  var r = false;
	  var c = this.expression.charAt(this.pos);

	  while (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
	    r = true;
	    this.pos++;

	    if (this.pos >= this.expression.length) {
	      break;
	    }

	    c = this.expression.charAt(this.pos);
	  }

	  return r;
	};

	var codePointPattern = /^[0-9a-f]{4}$/i;

	TokenStream.prototype.unescape = function (v) {
	  var index = v.indexOf('\\');

	  if (index < 0) {
	    return v;
	  }

	  var buffer = v.substring(0, index);

	  while (index >= 0) {
	    var c = v.charAt(++index);

	    switch (c) {
	      case '\'':
	        buffer += '\'';
	        break;

	      case '"':
	        buffer += '"';
	        break;

	      case '\\':
	        buffer += '\\';
	        break;

	      case '/':
	        buffer += '/';
	        break;

	      case 'b':
	        buffer += '\b';
	        break;

	      case 'f':
	        buffer += '\f';
	        break;

	      case 'n':
	        buffer += '\n';
	        break;

	      case 'r':
	        buffer += '\r';
	        break;

	      case 't':
	        buffer += '\t';
	        break;

	      case 'u':
	        // interpret the following 4 characters as the hex of the unicode code point
	        var codePoint = v.substring(index + 1, index + 5);

	        if (!codePointPattern.test(codePoint)) {
	          this.parseError("Illegal escape sequence: \\u" + codePoint);
	        }

	        buffer += String.fromCharCode(parseInt(codePoint, 16));
	        index += 4;
	        break;

	      default:
	        throw this.parseError('Illegal escape sequence: "\\' + c + '"');
	    }

	    ++index;
	    var backslash = v.indexOf('\\', index);
	    buffer += v.substring(index, backslash < 0 ? v.length : backslash);
	    index = backslash;
	  }

	  return buffer;
	};

	TokenStream.prototype.isComment = function () {
	  var c = this.expression.charAt(this.pos);

	  if (c === '/' && this.expression.charAt(this.pos + 1) === '*') {
	    this.pos = this.expression.indexOf('*/', this.pos) + 2;

	    if (this.pos === 1) {
	      this.pos = this.expression.length;
	    }

	    return true;
	  }

	  return false;
	};

	TokenStream.prototype.isRadixInteger = function () {
	  var pos = this.pos;

	  if (pos >= this.expression.length - 2 || this.expression.charAt(pos) !== '0') {
	    return false;
	  }

	  ++pos;
	  var radix;
	  var validDigit;

	  if (this.expression.charAt(pos) === 'x') {
	    radix = 16;
	    validDigit = /^[0-9a-f]$/i;
	    ++pos;
	  } else if (this.expression.charAt(pos) === 'b') {
	    radix = 2;
	    validDigit = /^[01]$/i;
	    ++pos;
	  } else {
	    return false;
	  }

	  var valid = false;
	  var startPos = pos;

	  while (pos < this.expression.length) {
	    var c = this.expression.charAt(pos);

	    if (validDigit.test(c)) {
	      pos++;
	      valid = true;
	    } else {
	      break;
	    }
	  }

	  if (valid) {
	    this.current = this.newToken(TNUMBER, parseInt(this.expression.substring(startPos, pos), radix));
	    this.pos = pos;
	  }

	  return valid;
	};

	TokenStream.prototype.isNumber = function () {
	  var valid = false;
	  var pos = this.pos;
	  var startPos = pos;
	  var resetPos = pos;
	  var foundDot = false;
	  var foundDigits = false;
	  var c;

	  while (pos < this.expression.length) {
	    c = this.expression.charAt(pos);

	    if (c >= '0' && c <= '9' || !foundDot && c === '.') {
	      if (c === '.') {
	        foundDot = true;
	      } else {
	        foundDigits = true;
	      }

	      pos++;
	      valid = foundDigits;
	    } else {
	      break;
	    }
	  }

	  if (valid) {
	    resetPos = pos;
	  }

	  if (c === 'e' || c === 'E') {
	    pos++;
	    var acceptSign = true;
	    var validExponent = false;

	    while (pos < this.expression.length) {
	      c = this.expression.charAt(pos);

	      if (acceptSign && (c === '+' || c === '-')) {
	        acceptSign = false;
	      } else if (c >= '0' && c <= '9') {
	        validExponent = true;
	        acceptSign = false;
	      } else {
	        break;
	      }

	      pos++;
	    }

	    if (!validExponent) {
	      pos = resetPos;
	    }
	  }

	  if (valid) {
	    this.current = this.newToken(TNUMBER, parseFloat(this.expression.substring(startPos, pos)));
	    this.pos = pos;
	  } else {
	    this.pos = resetPos;
	  }

	  return valid;
	};

	TokenStream.prototype.isOperator = function () {
	  var startPos = this.pos;
	  var c = this.expression.charAt(this.pos);

	  if (c === '+' || c === '-' || c === '*' || c === '/' || c === '%' || c === '^' || c === '?' || c === ':' || c === '.') {
	    this.current = this.newToken(TOP, c);
	  } else if (c === '∙' || c === '•') {
	    this.current = this.newToken(TOP, '*');
	  } else if (c === '>') {
	    if (this.expression.charAt(this.pos + 1) === '=') {
	      this.current = this.newToken(TOP, '>=');
	      this.pos++;
	    } else {
	      this.current = this.newToken(TOP, '>');
	    }
	  } else if (c === '<') {
	    if (this.expression.charAt(this.pos + 1) === '=') {
	      this.current = this.newToken(TOP, '<=');
	      this.pos++;
	    } else {
	      this.current = this.newToken(TOP, '<');
	    }
	  } else if (c === '|') {
	    if (this.expression.charAt(this.pos + 1) === '|') {
	      this.current = this.newToken(TOP, '||');
	      this.pos++;
	    } else {
	      return false;
	    }
	  } else if (c === '=') {
	    if (this.expression.charAt(this.pos + 1) === '=') {
	      this.current = this.newToken(TOP, '==');
	      this.pos++;
	    } else {
	      this.current = this.newToken(TOP, c);
	    }
	  } else if (c === '!') {
	    if (this.expression.charAt(this.pos + 1) === '=') {
	      this.current = this.newToken(TOP, '!=');
	      this.pos++;
	    } else {
	      this.current = this.newToken(TOP, c);
	    }
	  } else {
	    return false;
	  }

	  this.pos++;

	  if (this.isOperatorEnabled(this.current.value)) {
	    return true;
	  } else {
	    this.pos = startPos;
	    return false;
	  }
	};

	TokenStream.prototype.isOperatorEnabled = function (op) {
	  return this.parser.isOperatorEnabled(op);
	};

	TokenStream.prototype.getCoordinates = function () {
	  var line = 0;
	  var column;
	  var newline = -1;

	  do {
	    line++;
	    column = this.pos - newline;
	    newline = this.expression.indexOf('\n', newline + 1);
	  } while (newline >= 0 && newline < this.pos);

	  return {
	    line: line,
	    column: column
	  };
	};

	TokenStream.prototype.parseError = function (msg) {
	  var coords = this.getCoordinates();
	  throw new Error('parse error [' + coords.line + ':' + coords.column + ']: ' + msg);
	};

	var INUMBER = 'INUMBER';
	var IOP1 = 'IOP1';
	var IOP2 = 'IOP2';
	var IOP3 = 'IOP3';
	var IVAR = 'IVAR';
	var IVARNAME = 'IVARNAME';
	var IFUNCALL = 'IFUNCALL';
	var IFUNDEF = 'IFUNDEF';
	var IEXPR = 'IEXPR';
	var IEXPREVAL = 'IEXPREVAL';
	var IMEMBER = 'IMEMBER';
	var IENDSTATEMENT = 'IENDSTATEMENT';
	var IARRAY = 'IARRAY';
	function Instruction(type, value) {
	  this.type = type;
	  this.value = value !== undefined && value !== null ? value : 0;
	}

	Instruction.prototype.toString = function () {
	  switch (this.type) {
	    case INUMBER:
	    case IOP1:
	    case IOP2:
	    case IOP3:
	    case IVAR:
	    case IVARNAME:
	    case IENDSTATEMENT:
	      return this.value;

	    case IFUNCALL:
	      return 'CALL ' + this.value;

	    case IFUNDEF:
	      return 'DEF ' + this.value;

	    case IARRAY:
	      return 'ARRAY ' + this.value;

	    case IMEMBER:
	      return '.' + this.value;

	    default:
	      return 'Invalid Instruction';
	  }
	};

	function unaryInstruction(value) {
	  return new Instruction(IOP1, value);
	}
	function binaryInstruction(value) {
	  return new Instruction(IOP2, value);
	}
	function ternaryInstruction(value) {
	  return new Instruction(IOP3, value);
	}

	function contains$1(array, obj) {
	  for (var i = 0; i < array.length; i++) {
	    if (array[i] === obj) {
	      return true;
	    }
	  }

	  return false;
	}

	function ParserState(parser, tokenStream, options) {
	  this.parser = parser;
	  this.tokens = tokenStream;
	  this.current = null;
	  this.nextToken = null;
	  this.next();
	  this.savedCurrent = null;
	  this.savedNextToken = null;
	  this.allowMemberAccess = options.allowMemberAccess !== false;
	}

	ParserState.prototype.next = function () {
	  this.current = this.nextToken;
	  return this.nextToken = this.tokens.next();
	};

	ParserState.prototype.tokenMatches = function (token, value) {
	  if (typeof value === 'undefined') {
	    return true;
	  } else if (Array.isArray(value)) {
	    return contains$1(value, token.value);
	  } else if (typeof value === 'function') {
	    return value(token);
	  } else {
	    return token.value === value;
	  }
	};

	ParserState.prototype.save = function () {
	  this.savedCurrent = this.current;
	  this.savedNextToken = this.nextToken;
	  this.tokens.save();
	};

	ParserState.prototype.restore = function () {
	  this.tokens.restore();
	  this.current = this.savedCurrent;
	  this.nextToken = this.savedNextToken;
	};

	ParserState.prototype.accept = function (type, value) {
	  if (this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
	    this.next();
	    return true;
	  }

	  return false;
	};

	ParserState.prototype.expect = function (type, value) {
	  if (!this.accept(type, value)) {
	    var coords = this.tokens.getCoordinates();
	    throw new Error('parse error [' + coords.line + ':' + coords.column + ']: Expected ' + (value || type));
	  }
	};

	ParserState.prototype.parseAtom = function (instr) {
	  var unaryOps = this.tokens.unaryOps;

	  function isPrefixOperator(token) {
	    return token.value in unaryOps;
	  }

	  if (this.accept(TNAME) || this.accept(TOP, isPrefixOperator)) {
	    instr.push(new Instruction(IVAR, this.current.value));
	  } else if (this.accept(TNUMBER)) {
	    instr.push(new Instruction(INUMBER, this.current.value));
	  } else if (this.accept(TSTRING)) {
	    instr.push(new Instruction(INUMBER, this.current.value));
	  } else if (this.accept(TPAREN, '(')) {
	    this.parseExpression(instr);
	    this.expect(TPAREN, ')');
	  } else if (this.accept(TBRACKET, '[')) {
	    if (this.accept(TBRACKET, ']')) {
	      instr.push(new Instruction(IARRAY, 0));
	    } else {
	      var argCount = this.parseArrayList(instr);
	      instr.push(new Instruction(IARRAY, argCount));
	    }
	  } else {
	    throw new Error('unexpected ' + this.nextToken);
	  }
	};

	ParserState.prototype.parseExpression = function (instr) {
	  var exprInstr = [];

	  if (this.parseUntilEndStatement(instr, exprInstr)) {
	    return;
	  }

	  this.parseVariableAssignmentExpression(exprInstr);

	  if (this.parseUntilEndStatement(instr, exprInstr)) {
	    return;
	  }

	  this.pushExpression(instr, exprInstr);
	};

	ParserState.prototype.pushExpression = function (instr, exprInstr) {
	  for (var i = 0, len = exprInstr.length; i < len; i++) {
	    instr.push(exprInstr[i]);
	  }
	};

	ParserState.prototype.parseUntilEndStatement = function (instr, exprInstr) {
	  if (!this.accept(TSEMICOLON)) return false;

	  if (this.nextToken && this.nextToken.type !== TEOF && !(this.nextToken.type === TPAREN && this.nextToken.value === ')')) {
	    exprInstr.push(new Instruction(IENDSTATEMENT));
	  }

	  if (this.nextToken.type !== TEOF) {
	    this.parseExpression(exprInstr);
	  }

	  instr.push(new Instruction(IEXPR, exprInstr));
	  return true;
	};

	ParserState.prototype.parseArrayList = function (instr) {
	  var argCount = 0;

	  while (!this.accept(TBRACKET, ']')) {
	    this.parseExpression(instr);
	    ++argCount;

	    while (this.accept(TCOMMA)) {
	      this.parseExpression(instr);
	      ++argCount;
	    }
	  }

	  return argCount;
	};

	ParserState.prototype.parseVariableAssignmentExpression = function (instr) {
	  this.parseConditionalExpression(instr);

	  while (this.accept(TOP, '=')) {
	    var varName = instr.pop();
	    var varValue = [];
	    var lastInstrIndex = instr.length - 1;

	    if (varName.type === IFUNCALL) {
	      if (!this.tokens.isOperatorEnabled('()=')) {
	        throw new Error('function definition is not permitted');
	      }

	      for (var i = 0, len = varName.value + 1; i < len; i++) {
	        var index = lastInstrIndex - i;

	        if (instr[index].type === IVAR) {
	          instr[index] = new Instruction(IVARNAME, instr[index].value);
	        }
	      }

	      this.parseVariableAssignmentExpression(varValue);
	      instr.push(new Instruction(IEXPR, varValue));
	      instr.push(new Instruction(IFUNDEF, varName.value));
	      continue;
	    }

	    if (varName.type !== IVAR && varName.type !== IMEMBER) {
	      throw new Error('expected variable for assignment');
	    }

	    this.parseVariableAssignmentExpression(varValue);
	    instr.push(new Instruction(IVARNAME, varName.value));
	    instr.push(new Instruction(IEXPR, varValue));
	    instr.push(binaryInstruction('='));
	  }
	};

	ParserState.prototype.parseConditionalExpression = function (instr) {
	  this.parseOrExpression(instr);

	  while (this.accept(TOP, '?')) {
	    var trueBranch = [];
	    var falseBranch = [];
	    this.parseConditionalExpression(trueBranch);
	    this.expect(TOP, ':');
	    this.parseConditionalExpression(falseBranch);
	    instr.push(new Instruction(IEXPR, trueBranch));
	    instr.push(new Instruction(IEXPR, falseBranch));
	    instr.push(ternaryInstruction('?'));
	  }
	};

	ParserState.prototype.parseOrExpression = function (instr) {
	  this.parseAndExpression(instr);

	  while (this.accept(TOP, 'or')) {
	    var falseBranch = [];
	    this.parseAndExpression(falseBranch);
	    instr.push(new Instruction(IEXPR, falseBranch));
	    instr.push(binaryInstruction('or'));
	  }
	};

	ParserState.prototype.parseAndExpression = function (instr) {
	  this.parseComparison(instr);

	  while (this.accept(TOP, 'and')) {
	    var trueBranch = [];
	    this.parseComparison(trueBranch);
	    instr.push(new Instruction(IEXPR, trueBranch));
	    instr.push(binaryInstruction('and'));
	  }
	};

	var COMPARISON_OPERATORS = ['==', '!=', '<', '<=', '>=', '>', 'in'];

	ParserState.prototype.parseComparison = function (instr) {
	  this.parseAddSub(instr);

	  while (this.accept(TOP, COMPARISON_OPERATORS)) {
	    var op = this.current;
	    this.parseAddSub(instr);
	    instr.push(binaryInstruction(op.value));
	  }
	};

	var ADD_SUB_OPERATORS = ['+', '-', '||'];

	ParserState.prototype.parseAddSub = function (instr) {
	  this.parseTerm(instr);

	  while (this.accept(TOP, ADD_SUB_OPERATORS)) {
	    var op = this.current;
	    this.parseTerm(instr);
	    instr.push(binaryInstruction(op.value));
	  }
	};

	var TERM_OPERATORS = ['*', '/', '%'];

	ParserState.prototype.parseTerm = function (instr) {
	  this.parseFactor(instr);

	  while (this.accept(TOP, TERM_OPERATORS)) {
	    var op = this.current;
	    this.parseFactor(instr);
	    instr.push(binaryInstruction(op.value));
	  }
	};

	ParserState.prototype.parseFactor = function (instr) {
	  var unaryOps = this.tokens.unaryOps;

	  function isPrefixOperator(token) {
	    return token.value in unaryOps;
	  }

	  this.save();

	  if (this.accept(TOP, isPrefixOperator)) {
	    if (this.current.value !== '-' && this.current.value !== '+') {
	      if (this.nextToken.type === TPAREN && this.nextToken.value === '(') {
	        this.restore();
	        this.parseExponential(instr);
	        return;
	      } else if (this.nextToken.type === TSEMICOLON || this.nextToken.type === TCOMMA || this.nextToken.type === TEOF || this.nextToken.type === TPAREN && this.nextToken.value === ')') {
	        this.restore();
	        this.parseAtom(instr);
	        return;
	      }
	    }

	    var op = this.current;
	    this.parseFactor(instr);
	    instr.push(unaryInstruction(op.value));
	  } else {
	    this.parseExponential(instr);
	  }
	};

	ParserState.prototype.parseExponential = function (instr) {
	  this.parsePostfixExpression(instr);

	  while (this.accept(TOP, '^')) {
	    this.parseFactor(instr);
	    instr.push(binaryInstruction('^'));
	  }
	};

	ParserState.prototype.parsePostfixExpression = function (instr) {
	  this.parseFunctionCall(instr);

	  while (this.accept(TOP, '!')) {
	    instr.push(unaryInstruction('!'));
	  }
	};

	ParserState.prototype.parseFunctionCall = function (instr) {
	  var unaryOps = this.tokens.unaryOps;

	  function isPrefixOperator(token) {
	    return token.value in unaryOps;
	  }

	  if (this.accept(TOP, isPrefixOperator)) {
	    var op = this.current;
	    this.parseAtom(instr);
	    instr.push(unaryInstruction(op.value));
	  } else {
	    this.parseMemberExpression(instr);

	    while (this.accept(TPAREN, '(')) {
	      if (this.accept(TPAREN, ')')) {
	        instr.push(new Instruction(IFUNCALL, 0));
	      } else {
	        var argCount = this.parseArgumentList(instr);
	        instr.push(new Instruction(IFUNCALL, argCount));
	      }
	    }
	  }
	};

	ParserState.prototype.parseArgumentList = function (instr) {
	  var argCount = 0;

	  while (!this.accept(TPAREN, ')')) {
	    this.parseExpression(instr);
	    ++argCount;

	    while (this.accept(TCOMMA)) {
	      this.parseExpression(instr);
	      ++argCount;
	    }
	  }

	  return argCount;
	};

	ParserState.prototype.parseMemberExpression = function (instr) {
	  this.parseAtom(instr);

	  while (this.accept(TOP, '.') || this.accept(TBRACKET, '[')) {
	    var op = this.current;

	    if (op.value === '.') {
	      if (!this.allowMemberAccess) {
	        throw new Error('unexpected ".", member access is not permitted');
	      }

	      this.expect(TNAME);
	      instr.push(new Instruction(IMEMBER, this.current.value));
	    } else if (op.value === '[') {
	      if (!this.tokens.isOperatorEnabled('[')) {
	        throw new Error('unexpected "[]", arrays are disabled');
	      }

	      this.parseExpression(instr);
	      this.expect(TBRACKET, ']');
	      instr.push(binaryInstruction('['));
	    } else {
	      throw new Error('unexpected symbol: ' + op.value);
	    }
	  }
	};

	function add(a, b) {
	  return Number(a) + Number(b);
	}
	function sub(a, b) {
	  return a - b;
	}
	function mul(a, b) {
	  return a * b;
	}
	function div(a, b) {
	  return a / b;
	}
	function mod(a, b) {
	  return a % b;
	}
	function equal(a, b) {
	  return a === b;
	}
	function notEqual(a, b) {
	  return a !== b;
	}
	function greaterThan(a, b) {
	  return a > b;
	}
	function lessThan(a, b) {
	  return a < b;
	}
	function greaterThanEqual(a, b) {
	  return a >= b;
	}
	function lessThanEqual(a, b) {
	  return a <= b;
	}
	function andOperator(a, b) {
	  return Boolean(a && b);
	}
	function orOperator(a, b) {
	  return Boolean(a || b);
	}
	function log10(a) {
	  return Math.log(a) * Math.LOG10E;
	}
	function neg(a) {
	  return -a;
	}
	function not(a) {
	  return !a;
	}
	function trunc(a) {
	  return a < 0 ? Math.ceil(a) : Math.floor(a);
	}
	function random$1(a) {
	  return Math.random() * (a || 1);
	}
	function stringOrArrayLength(s) {
	  if (Array.isArray(s)) {
	    return s.length;
	  }

	  return String(s).length;
	}
	function condition(cond, yep, nope) {
	  return cond ? yep : nope;
	}
	/**
	* Decimal adjustment of a number.
	* From @escopecz.
	*
	* @param {Number} value The number.
	* @param {Integer} exp  The exponent (the 10 logarithm of the adjustment base).
	* @return {Number} The adjusted value.
	*/

	function roundTo(value, exp) {
	  // If the exp is undefined or zero...
	  if (typeof exp === 'undefined' || +exp === 0) {
	    return Math.round(value);
	  }

	  value = +value;
	  exp = -+exp; // If the value is not a number or the exp is not an integer...

	  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
	    return NaN;
	  } // Shift


	  value = value.toString().split('e');
	  value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp))); // Shift back

	  value = value.toString().split('e');
	  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
	}
	function arrayIndex(array, index) {
	  return array[index | 0];
	}
	function max$1(array) {
	  if (arguments.length === 1 && Array.isArray(array)) {
	    return Math.max.apply(Math, array);
	  } else {
	    return Math.max.apply(Math, arguments);
	  }
	}
	function min$1(array) {
	  if (arguments.length === 1 && Array.isArray(array)) {
	    return Math.min.apply(Math, array);
	  } else {
	    return Math.min.apply(Math, arguments);
	  }
	}
	function sign(x) {
	  return (x > 0) - (x < 0) || +x;
	}
	function log1p(x) {
	  return Math.log(1 + x);
	}
	function log2(x) {
	  return Math.log(x) / Math.LN2;
	}

	function evaluate(tokens, expr, values) {
	  var nstack = [];
	  var n1, n2, n3;
	  var f, args, argCount;

	  if (isExpressionEvaluator(tokens)) {
	    return resolveExpression(tokens, values);
	  }

	  var numTokens = tokens.length;

	  for (var i = 0; i < numTokens; i++) {
	    var item = tokens[i];
	    var type = item.type;

	    if (type === INUMBER || type === IVARNAME) {
	      nstack.push(item.value);
	    } else if (type === IOP2) {
	      n2 = nstack.pop();
	      n1 = nstack.pop();

	      if (item.value === 'and') {
	        nstack.push(n1 ? !!evaluate(n2, expr, values) : false);
	      } else if (item.value === 'or') {
	        nstack.push(n1 ? true : !!evaluate(n2, expr, values));
	      } else if (item.value === '=') {
	        f = expr.binaryOps[item.value];
	        nstack.push(f(n1, evaluate(n2, expr, values), values));
	      } else {
	        f = expr.binaryOps[item.value];
	        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values)));
	      }
	    } else if (type === IOP3) {
	      n3 = nstack.pop();
	      n2 = nstack.pop();
	      n1 = nstack.pop();

	      if (item.value === '?') {
	        nstack.push(evaluate(n1 ? n2 : n3, expr, values));
	      } else {
	        f = expr.ternaryOps[item.value];
	        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values), resolveExpression(n3, values)));
	      }
	    } else if (type === IVAR) {
	      if (item.value in expr.functions) {
	        nstack.push(expr.functions[item.value]);
	      } else if (item.value in expr.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
	        nstack.push(expr.unaryOps[item.value]);
	      } else {
	        var v = values[item.value];

	        if (v !== undefined) {
	          nstack.push(v);
	        } else {
	          throw new Error('undefined variable: ' + item.value);
	        }
	      }
	    } else if (type === IOP1) {
	      n1 = nstack.pop();
	      f = expr.unaryOps[item.value];
	      nstack.push(f(resolveExpression(n1, values)));
	    } else if (type === IFUNCALL) {
	      argCount = item.value;
	      args = [];

	      while (argCount-- > 0) {
	        args.unshift(resolveExpression(nstack.pop(), values));
	      }

	      f = nstack.pop();

	      if (f.apply && f.call) {
	        nstack.push(f.apply(undefined, args));
	      } else {
	        throw new Error(f + ' is not a function');
	      }
	    } else if (type === IFUNDEF) {
	      // Create closure to keep references to arguments and expression
	      nstack.push(function () {
	        var n2 = nstack.pop();
	        var args = [];
	        var argCount = item.value;

	        while (argCount-- > 0) {
	          args.unshift(nstack.pop());
	        }

	        var n1 = nstack.pop();

	        var f = function f() {
	          var scope = Object.assign({}, values);

	          for (var i = 0, len = args.length; i < len; i++) {
	            scope[args[i]] = arguments[i];
	          }

	          return evaluate(n2, expr, scope);
	        }; // f.name = n1


	        Object.defineProperty(f, 'name', {
	          value: n1,
	          writable: false
	        });
	        values[n1] = f;
	        return f;
	      }());
	    } else if (type === IEXPR) {
	      nstack.push(createExpressionEvaluator(item, expr));
	    } else if (type === IEXPREVAL) {
	      nstack.push(item);
	    } else if (type === IMEMBER) {
	      n1 = nstack.pop();
	      nstack.push(n1[item.value]);
	    } else if (type === IENDSTATEMENT) {
	      nstack.pop();
	    } else if (type === IARRAY) {
	      argCount = item.value;
	      args = [];

	      while (argCount-- > 0) {
	        args.unshift(nstack.pop());
	      }

	      nstack.push(args);
	    } else {
	      throw new Error('invalid Expression');
	    }
	  }

	  if (nstack.length > 1) {
	    throw new Error('invalid Expression (parity)');
	  } // Explicitly return zero to avoid test issues caused by -0


	  return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values);
	}

	function createExpressionEvaluator(token, expr, values) {
	  if (isExpressionEvaluator(token)) return token;
	  return {
	    type: IEXPREVAL,
	    value: function value(scope) {
	      return evaluate(token.value, expr, scope);
	    }
	  };
	}

	function isExpressionEvaluator(n) {
	  return n && n.type === IEXPREVAL;
	}

	function resolveExpression(n, values) {
	  return isExpressionEvaluator(n) ? n.value(values) : n;
	}

	function Expression(tokens, parser) {
	  this.tokens = tokens;
	  this.parser = parser;
	  this.unaryOps = parser.unaryOps;
	  this.binaryOps = parser.binaryOps;
	  this.ternaryOps = parser.ternaryOps;
	  this.functions = parser.functions;
	}

	Expression.prototype.evaluate = function (values) {
	  values = values || {};
	  return evaluate(this.tokens, this, values);
	};

	Expression.prototype.variables = function () {
	  return (this.tokens || []).filter(function (token) {
	    return token.type === 'IVAR';
	  }).map(function (token) {
	    return token.value;
	  });
	};

	function trim(s) {
	  return s.trim();
	} // parser


	function Parser(options) {
	  this.options = options || {};
	  this.unaryOps = {
	    SIN: Math.sin,
	    COS: Math.cos,
	    TAN: Math.tan,
	    ASIN: Math.asin,
	    ACOS: Math.acos,
	    ATAN: Math.atan,
	    SQRT: Math.sqrt,
	    LOG: Math.log,
	    LOG2: Math.log2 || log2,
	    LN: Math.log,
	    LG: Math.log10 || log10,
	    LOG10: Math.log10 || log10,
	    LOG1P: Math.log1p || log1p,
	    ABS: Math.abs,
	    CEIL: Math.ceil,
	    TRIM: trim,
	    FLOOR: Math.floor,
	    ISNULL: function ISNULL(a) {
	      return a === null;
	    },
	    TRUNC: Math.trunc || trunc,
	    '-': neg,
	    '+': Number,
	    EXP: Math.exp,
	    NOT: not,
	    LENGTH: stringOrArrayLength,
	    '!': not,
	    SIGN: Math.sign || sign,
	    TEXT: function TEXT(value) {
	      if (isDate(value)) {
	        return value.toISOString();
	      }

	      return String(value);
	    },
	    NUMBER: Number
	  };
	  this.binaryOps = {
	    '+': add,
	    '-': sub,
	    '*': mul,
	    '/': div,
	    '%': mod,
	    '^': Math.pow,
	    '==': equal,
	    '!=': notEqual,
	    '>': greaterThan,
	    '<': lessThan,
	    '>=': greaterThanEqual,
	    '<=': lessThanEqual,
	    and: andOperator,
	    or: orOperator,
	    in: function _in(needle, haystack) {
	      return Array.isArray(haystack) ? haystack.includes(needle) : String(haystack).includes(needle);
	    },
	    '[': arrayIndex
	  };
	  this.ternaryOps = {
	    '?': condition
	  };

	  var isDate = function isDate(d) {
	    return d instanceof Date && !isNaN(d);
	  };

	  var asDate = function asDate(d) {
	    if (isDate(d)) return d;

	    try {
	      var n = new Date(d);
	      if (isDate(n)) return n;
	      return null;
	    } catch (e) {
	      return null;
	    }
	  };

	  this.functions = {
	    RANDOM: random$1,
	    // fac: factorial,
	    MIN: min$1,
	    MAX: max$1,
	    POW: Math.pow,
	    ATAN2: Math.atan2,
	    IF: condition,
	    ROUND: roundTo,
	    INDEXOF: function INDEXOF(arr, target) {
	      if (!Array.isArray(arr)) arr = String(arr);
	      return arr.indexOf(target);
	    },
	    CONCAT: function CONCAT() {
	      return Array.from(arguments).join('');
	    },
	    DATE: function DATE() {
	      if (arguments.length > 1) {
	        // "correct" month argument (1=january, etc)
	        arguments[1] = arguments[1] - 1;
	      }

	      return construct(Date, Array.prototype.slice.call(arguments));
	    },
	    TRIM: trim,
	    SUBSTR: function SUBSTR(s, start, end) {
	      return s.substr(start, end);
	    },
	    YEAR: function YEAR(d) {
	      d = asDate(d);
	      return d ? d.getFullYear() : null;
	    },
	    MONTH: function MONTH(d) {
	      d = asDate(d);
	      return d ? d.getMonth() + 1 : null;
	    },
	    DAY: function DAY(d) {
	      d = asDate(d);
	      return d ? d.getDate() : null;
	    },
	    WEEKDAY: function WEEKDAY(d) {
	      d = asDate(d);
	      return d ? d.getDay() : null;
	    },
	    HOURS: function HOURS(d) {
	      d = asDate(d);
	      return d ? d.getHours() : null;
	    },
	    MINUTES: function MINUTES(d) {
	      d = asDate(d);
	      return d ? d.getMinutes() : null;
	    },
	    SECONDS: function SECONDS(d) {
	      d = asDate(d);
	      return d ? d.getSeconds() : null;
	    },
	    REPLACE: function REPLACE(str, search, replace) {
	      return str.replace(search, replace);
	    },
	    SPLIT: function SPLIT(str, sep) {
	      return String(str).split(sep);
	    },
	    JOIN: function JOIN(arr, sep) {
	      if (!Array.isArray(arr)) {
	        throw new Error('Second argument to join is not an array');
	      }

	      return arr.join(sep);
	    },
	    // the number of days between two dates
	    DATEDIFF: function DATEDIFF(d1, d2) {
	      d1 = asDate(d1);
	      d2 = asDate(d2);
	      return d1 && d2 ? (d2.getTime() - d1.getTime()) / 864e5 : null;
	    },
	    // the number of seconds between two dates
	    TIMEDIFF: function TIMEDIFF(d1, d2) {
	      d1 = asDate(d1);
	      d2 = asDate(d2);
	      return d1 && d2 ? (d2.getTime() - d1.getTime()) / 1000 : null;
	    }
	  };
	  this.consts = {
	    E: Math.E,
	    PI: Math.PI,
	    TRUE: true,
	    FALSE: false,
	    NA: Number.NaN,
	    NULL: Number.NaN
	  };
	}

	Parser.prototype.parse = function (expr) {
	  var instr = [];
	  var parserState = new ParserState(this, new TokenStream(this, expr), {
	    allowMemberAccess: false
	  });
	  parserState.parseExpression(instr);
	  parserState.expect(TEOF, 'EOF');
	  return new Expression(instr, this);
	};

	Parser.prototype.evaluate = function (expr, variables) {
	  return this.parse(expr).evaluate(variables);
	};

	var sharedParser = new Parser();

	Parser.parse = function (expr) {
	  return sharedParser.parse(expr);
	};

	Parser.evaluate = function (expr, variables) {
	  return sharedParser.parse(expr).evaluate(variables);
	};

	Parser.keywords = ['NOT', 'and', 'or', 'in', 'ABS', 'ACOS', 'ACOSH', 'ASIN', 'ASINH', 'ATAN', 'ATANH', 'CBRT', 'CEIL', 'COS', 'COSH', 'EXP', 'EXPM1', 'FLOOR', 'LENGTH', 'LN', 'LOG', 'LOG10', 'LOG2', 'LOG1P', 'NOT', 'ROUND', 'SIGN', 'SIN', 'SINH', 'SQRT', 'TAN', 'TANH', 'TRUNC', 'RANDOM', 'MIN', 'MAX', 'POW', 'ATAN2', 'IF', 'CONCAT', 'TRIM', 'SUBSTR', 'YEAR', 'MONTH', 'DAY', 'HOURS', 'MINUTES', 'SECONDS', 'WEEKDAY', 'SPLIT', 'JOIN', 'INDEXOF', 'ISNULL', 'REPLACE', 'PI', 'E', 'DATEDIFF', 'TIMEDIFF'];
	var optionNameMap = {
	  '+': 'add',
	  '-': 'subtract',
	  '*': 'multiply',
	  '/': 'divide',
	  '%': 'remainder',
	  '^': 'power',
	  '!': 'factorial',
	  '<': 'comparison',
	  '>': 'comparison',
	  '<=': 'comparison',
	  '>=': 'comparison',
	  '==': 'comparison',
	  '!=': 'comparison',
	  '||': 'concatenate',
	  AND: 'logical',
	  OR: 'logical',
	  NOT: 'logical',
	  IN: 'logical',
	  '?': 'conditional',
	  ':': 'conditional',
	  '=': 'assignment',
	  '[': 'array',
	  '()=': 'fndef'
	};

	function getOptionName(op) {
	  return Object.prototype.hasOwnProperty.call(optionNameMap, op) ? optionNameMap[op] : op;
	}

	Parser.prototype.isOperatorEnabled = function (op) {
	  var optionName = getOptionName(op);
	  var operators = this.options.operators || {};
	  return !(optionName in operators) || !!operators[optionName];
	};

	function addComputedColumns(chart, dataset) {
	  var virtualColumns = get$2(chart.get(), 'metadata.describe.computed-columns', {});

	  if (!Array.isArray(virtualColumns)) {
	    // convert to array
	    virtualColumns = Object.keys(virtualColumns).reduce(function (acc, cur) {
	      acc.push({
	        name: cur,
	        formula: virtualColumns[cur]
	      });
	      return acc;
	    }, []);
	  }

	  var data = applyChanges(chart, dataset).list();
	  var columnNameToVar = {};
	  var colAggregates = {};
	  var parser = new Parser();
	  dataset.eachColumn(function (col) {
	    if (col.isComputed) return;
	    columnNameToVar[col.name()] = columnNameToVariable(col.name());

	    if (col.type() === 'number') {
	      var _col$range = col.range(),
	          _col$range2 = slicedToArray(_col$range, 2),
	          _min = _col$range2[0],
	          _max = _col$range2[1];

	      colAggregates[col.name()] = {
	        min: _min,
	        max: _max,
	        sum: sum(col.values()),
	        mean: mean(col.values()),
	        median: median(col.values())
	      };
	    } else if (col.type() === 'date') {
	      var _col$range3 = col.range(),
	          _col$range4 = slicedToArray(_col$range3, 2),
	          _min2 = _col$range4[0],
	          _max2 = _col$range4[1];

	      colAggregates[col.name()] = {
	        min: _min2,
	        max: _max2
	      };
	    }
	  }); // initialize meta objects for each computed column

	  var vNamesToVar = virtualColumns.reduce(function (acc, val, idx) {
	    var key = columnNameToVariable(val.name);
	    return acc.set(key, {
	      name: val.name,
	      index: dataset.numColumns() + idx,
	      key: key,
	      formula: val.formula,
	      visited: 0,
	      computed: false,
	      dependsOn: []
	    });
	  }, new Map()); // parse formulas to detect cross-column dependencies

	  virtualColumns.forEach(function (_ref) {
	    var formula = _ref.formula,
	        name = _ref.name;
	    var col = vNamesToVar.get(columnNameToVariable(name));

	    if (formula.trim()) {
	      try {
	        col.expr = parser.parse(formula.trim());
	        col.expr.variables().forEach(function (v) {
	          v = v.split('__')[0];

	          if (vNamesToVar.has(v)) {
	            col.dependsOn.push(vNamesToVar.get(v));
	          }
	        });
	      } catch (e) {
	        col.error = e.message; // console.error('err', e);
	      }
	    } else {
	      col.expr = {
	        evaluate: function evaluate() {
	          return '';
	        },
	        variables: function variables() {
	          return [];
	        }
	      };
	    }
	  }); // sort computed columns in order of their dependency graph
	  // circular dependencies are not allowed and will result in
	  // errors

	  var computedColumns = [];
	  var curIter = 0;

	  while (vNamesToVar.size) {
	    if (curIter > 1000) break;
	    vNamesToVar.forEach(function (col) {
	      curIter++;

	      try {
	        visit(col, []);
	      } catch (e) {
	        if (e.message.startsWith('circular-dependency')) {
	          col.error = e.message; // col.computed = true;

	          vNamesToVar.delete(col.key);
	          computedColumns.push(col);
	        } else {
	          throw e;
	        }
	      }
	    });
	  } // compute in order of dependencies


	  computedColumns.forEach(function (col) {
	    if (col.error) {
	      var errorCol = column(col.name, data.map(function (d) {
	        return 'null';
	      }));
	      errorCol.isComputed = true;
	      errorCol.formula = col.formula;
	      errorCol.errors = [{
	        message: col.error,
	        row: 'all'
	      }];
	      col.column = errorCol;
	    } else {
	      col.column = addComputedColumn(col);
	    }
	  }); // add to dataset in original order

	  computedColumns.sort(function (a, b) {
	    return a.index - b.index;
	  }).forEach(function (_ref2) {
	    var column = _ref2.column;
	    return dataset.add(column);
	  });
	  return dataset;

	  function visit(col, stack) {
	    if (col.computed) return;
	    stack.push(col.name);

	    for (var i = 0; i < stack.length - 2; i++) {
	      if (col.name === stack[i]) {
	        throw new Error('circular-dependency: ' + stack.join(' ‣ '));
	      }
	    }

	    col.curIter = curIter;
	    var allComputed = true;

	    for (var _i = 0; _i < col.dependsOn.length; _i++) {
	      allComputed = allComputed && col.dependsOn[_i].computed;
	    }

	    if (allComputed) {
	      // no dependencies, we can compute this now
	      col.computed = true;
	      computedColumns.push(col);
	      vNamesToVar.delete(col.key);
	    } else {
	      if (stack.length < 10) {
	        col.dependsOn.forEach(function (c) {
	          visit(c, stack.slice(0));
	        });
	      }
	    }
	  }

	  function addComputedColumn(_ref3) {
	    var formula = _ref3.formula,
	        name = _ref3.name,
	        expr = _ref3.expr,
	        error = _ref3.error,
	        index = _ref3.index;

	    var errors = [];

	    if (error) {
	      errors.push({
	        row: 'all',
	        message: error
	      });
	    } // create a map of changes for this column


	    var changes = get$2(chart, 'metadata.data.changes', []).filter(function (change) {
	      return change.column === index && change.row > 0;
	    }).reduce(function (acc, cur) {
	      var old = acc.get(cur.row - 1);

	      if (old) {
	        // overwrite previous value
	        cur.previous = old.previous;
	      }

	      acc.set(cur.row - 1, cur);
	      return acc;
	    }, new Map());
	    var values = data.map(function (row, index) {
	      var context = {
	        ROWNUMBER: index
	      };

	      _$2.each(row, function (val, key) {
	        if (!columnNameToVar[key]) return;
	        context[columnNameToVar[key]] = val;

	        if (colAggregates[key]) {
	          Object.keys(colAggregates[key]).forEach(function (aggr) {
	            context["".concat(columnNameToVar[key], "__").concat(aggr)] = colAggregates[key][aggr];
	          });
	        }
	      });

	      var value;

	      try {
	        value = expr.evaluate(context);

	        if (typeof value === 'function') {
	          errors.push({
	            message: 'formula returned function',
	            row: index
	          });
	          value = null;
	        }
	      } catch (error) {
	        errors.push({
	          message: error.message,
	          row: index
	        });
	        value = null;
	      }

	      if (changes.has(index)) {
	        var change = changes.get(index);

	        if (change.previous === undefined || change.previous == value) {
	          // we have a change and it's still valid
	          return change.value;
	        }
	      }

	      return value;
	    });
	    columnNameToVar[name] = columnNameToVariable(name); // apply values to rows so they can be used in formulas

	    values.forEach(function (val, i) {
	      data[i][name] = val;
	    });
	    var virtualColumn = column(name, values.map(function (v) {
	      if (_$2.isBoolean(v)) return v ? 'yes' : 'no';
	      if (_$2.isDate(v)) return v.toISOString();
	      if (_$2.isNumber(v)) return String(v);
	      if (_$2.isNull(v)) return null;
	      return String(v);
	    })); // aggregate values

	    if (virtualColumn.type() === 'number') {
	      var _virtualColumn$range = virtualColumn.range(),
	          _virtualColumn$range2 = slicedToArray(_virtualColumn$range, 2),
	          _min3 = _virtualColumn$range2[0],
	          _max3 = _virtualColumn$range2[1];

	      colAggregates[name] = {
	        min: _min3,
	        max: _max3,
	        sum: sum(virtualColumn.values()),
	        mean: mean(virtualColumn.values()),
	        median: median(virtualColumn.values())
	      };
	    } else if (virtualColumn.type() === 'date') {
	      var _virtualColumn$range3 = virtualColumn.range(),
	          _virtualColumn$range4 = slicedToArray(_virtualColumn$range3, 2),
	          _min4 = _virtualColumn$range4[0],
	          _max4 = _virtualColumn$range4[1];

	      colAggregates[name] = {
	        min: _min4,
	        max: _max4
	      };
	    }

	    virtualColumn.isComputed = true;
	    virtualColumn.errors = errors;
	    virtualColumn.formula = formula;
	    return virtualColumn;
	  } // some d3 stuff

	  function sum(array) {
	    var s = 0;
	    var n = array.length;
	    var a;
	    var i = -1;

	    if (arguments.length === 1) {
	      while (++i < n) {
	        if (numeric(a = +array[i])) s += a;
	      }
	    }

	    return s;
	  }

	  function mean(array) {
	    var s = 0;
	    var n = array.length;
	    var a;
	    var i = -1;
	    var j = n;

	    while (++i < n) {
	      if (numeric(a = number(array[i]))) s += a;else --j;
	    }

	    if (j) return s / j;
	  }

	  function median(array) {
	    var numbers = [];
	    var n = array.length;
	    var a;
	    var i = -1;

	    if (arguments.length === 1) {
	      while (++i < n) {
	        if (numeric(a = number(array[i]))) numbers.push(a);
	      }
	    }

	    if (numbers.length) return quantile(numbers.sort(ascending), 0.5);
	  }

	  function quantile(values, p) {
	    var H = (values.length - 1) * p + 1;
	    var h = Math.floor(H);
	    var v = +values[h - 1];
	    var e = H - h;
	    return e ? v + e * (values[h] - v) : v;
	  }

	  function number(x) {
	    return x === null ? NaN : +x;
	  }

	  function numeric(x) {
	    return !isNaN(x);
	  }

	  function ascending(a, b) {
	    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	  }
	}

	function _isNativeFunction(fn) {
	  return Function.toString.call(fn).indexOf("[native code]") !== -1;
	}

	var isNativeFunction = _isNativeFunction;

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

	var get$3 = httpReq.get = httpReqVerb('GET');
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

	var storeChanges = _$2.debounce(function (chart, callback) {
	  var state = chart.serialize();
	  put("/v3/charts/".concat(state.id), {
	    payload: state
	  }).then(function () {
	    if (callback) callback();
	  }).catch(function (e) {
	    console.error('Could not store chart changes', e);
	  });
	}, 1000);

	var _storeData = _$2.debounce(function (chart, callback) {
	  var data = chart.getMetadata('data.json') ? JSON.stringify(chart.dataset()) : chart.rawData(); // const data = chart.rawData();

	  put("/v3/charts/".concat(chart.get().id, "/data"), {
	    body: data,
	    headers: {
	      'Content-Type': 'text/csv'
	    }
	  }).then(function () {
	    if (callback) callback();
	  }).catch(function (e) {
	    console.error('Could not store chart data', e);
	  });
	}, 1000);

	var Chart = /*#__PURE__*/function (_Store) {
	  inherits(Chart, _Store);

	  function Chart() {
	    classCallCheck(this, Chart);

	    return possibleConstructorReturn(this, getPrototypeOf(Chart).apply(this, arguments));
	  }

	  createClass(Chart, [{
	    key: "load",

	    /*
	     * load a csv or json dataset
	     */
	    value: function load(csv, externalData) {
	      var _this = this;

	      var dsopts = {
	        firstRowIsHeader: this.getMetadata('data.horizontal-header', true),
	        transpose: this.getMetadata('data.transpose', false)
	      };
	      if (csv && !externalData) dsopts.csv = csv;else dsopts.url = externalData || 'data.csv';
	      if (dsopts.csv) this._rawData = dsopts.csv;
	      var datasource = this.getMetadata('data.json', false) ? json(dsopts) : delimited(dsopts);
	      return datasource.dataset().then(function (ds) {
	        _this.dataset(ds); // this.dataset(ds);
	        // dataset_change_callbacks.fire(chart, ds);


	        return ds;
	      }).catch(function (e) {
	        console.error('could not fetch datasource', e);
	      });
	    } // sets or returns the dataset

	  }, {
	    key: "dataset",
	    value: function dataset(ds) {
	      // set a new dataset, or reset the old one if ds===true
	      if (arguments.length) {
	        if (ds !== true) this._dataset_cache = ds;
	        var jsonData = typeof ds.list !== 'function';
	        this._dataset = jsonData ? ds : reorderColumns(this, applyChanges(this, addComputedColumns(this, ds === true ? this._dataset_cache : ds)));
	        if (jsonData) this.set({
	          dataset: ds
	        });
	        return this._dataset;
	      } // return current dataset


	      return this._dataset;
	    } // sets or gets the theme

	  }, {
	    key: "theme",
	    value: function theme(_theme) {
	      if (arguments.length) {
	        // set new theme
	        this.set({
	          theme: _theme
	        });
	        return this;
	      }

	      return this.get().theme;
	    } // sets or gets the visualization

	  }, {
	    key: "vis",
	    value: function vis(_vis) {
	      if (arguments.length) {
	        // set new visualization
	        this.set({
	          vis: _vis
	        });
	        return this;
	      }

	      return this.get().vis;
	    }
	  }, {
	    key: "locale",
	    value: function locale(_locale, callback) {
	      if (arguments.length) {
	        this._locale = _locale = _locale.replace('_', '-');

	        if (window.Globalize) {
	          loadGlobalizeLocale(_locale, callback);
	        } // todo: what about momentjs & numeraljs?

	      }

	      return this._locale;
	    }
	  }, {
	    key: "getMetadata",
	    value: function getMetadata() {
	      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      var _default = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	      var _this$get = this.get(),
	          metadata = _this$get.metadata;

	      if (!key) return metadata; // get metadata

	      var keys = key.split('.');
	      var pt = metadata;

	      _$2.some(keys, function (key) {
	        if (_$2.isUndefined(pt) || _$2.isNull(pt)) return true; // break out of the loop

	        pt = pt[key];
	        return false;
	      });

	      return _$2.isUndefined(pt) || _$2.isNull(pt) ? _default : pt;
	    }
	  }, {
	    key: "setMetadata",
	    value: function setMetadata(key, value) {
	      var keys = key.split('.');
	      var lastKey = keys.pop();

	      var _this$get2 = this.get(),
	          metadata = _this$get2.metadata;

	      var pt = metadata; // resolve property until the parent dict

	      keys.forEach(function (key) {
	        if (_$2.isUndefined(pt[key]) || _$2.isNull(pt[key])) {
	          pt[key] = {};
	        }

	        pt = pt[key];
	      }); // check if new value is set

	      if (!deepEqual(pt[lastKey], value)) {
	        pt[lastKey] = value;
	        this.set({
	          metadata: metadata
	        });
	      }

	      return this;
	    } // stores the state of this chart to server

	  }, {
	    key: "store",
	    value: function store(callback) {
	      storeChanges(this, callback);
	    }
	  }, {
	    key: "storeData",
	    value: function storeData(callback) {
	      _storeData(this, callback);
	    }
	  }, {
	    key: "serialize",
	    value: function serialize() {
	      var state = this.get();
	      var keep = ['id', 'title', 'theme', 'createdAt', 'lastModifiedAt', 'type', 'metadata', 'authorId', 'showInGallery', 'language', 'guestSession', 'lastEditStep', 'publishedAt', 'publicUrl', 'publicVersion', 'organizationId', 'forkedFrom', 'externalData', 'forkable', 'isFork', 'inFolder', 'author'];
	      var copy = {};
	      keep.forEach(function (k) {
	        copy[k] = state[k];
	      });
	      return copy;
	    }
	  }, {
	    key: "passiveMode",
	    value: function passiveMode() {
	      var _this2 = this;

	      this.set({
	        passiveMode: true
	      });
	      setTimeout(function () {
	        return _this2.set({
	          passiveMode: false
	        });
	      }, 100);
	    }
	  }, {
	    key: "isPassive",
	    value: function isPassive() {
	      return this.get().passiveMode;
	    }
	  }, {
	    key: "rawData",
	    value: function rawData() {
	      return this._rawData;
	    }
	  }]);

	  return Chart;
	}(Store);

	Chart.prototype.observeDeep = observeDeep;

	function deepEqual(a, b) {
	  return JSON.stringify(a) === JSON.stringify(b);
	}

	function loadGlobalizeLocale(locale, callback) {
	  if (Object.prototype.hasOwnProperty.call(window.Globalize.cultures, locale)) {
	    window.Globalize.culture(locale);
	    if (typeof callback === 'function') callback();
	  } else {
	    loadScript("/static/vendor/globalize/cultures/globalize.culture.".concat(locale, ".js"), function () {
	      window.Globalize.culture(locale);
	      if (typeof callback === 'function') callback();
	    });
	  }
	}

	var main = {
	  init: init$1
	};
	/* globals dw, $, _ */

	function init$1(_ref2) {
	  var chartData = _ref2.chartData,
	      data = _ref2.data,
	      target = _ref2.target,
	      themeId = _ref2.themeId,
	      themeData = _ref2.themeData,
	      visData = _ref2.visData,
	      user = _ref2.user,
	      locales = _ref2.locales,
	      themes = _ref2.themes,
	      visualizations = _ref2.visualizations,
	      visArchive = _ref2.visArchive,
	      defaultVisType = _ref2.defaultVisType;
	  chartData.mode = getQueryVariable('mode') || 'web';
	  var chart = new Chart(chartData);
	  window.chart2 = chart;
	  var themeCache = {};
	  var visCache = {};
	  themeCache[themeId] = themeData;
	  visCache[visData.id] = visData;
	  chart.set({
	    writable: true,
	    themeData: themeData,
	    user: user,
	    locales: locales,
	    themes: themes,
	    visualization: visCache[visData.id]
	  });
	  chart.compute('axes', ['visualization'], function (visualization) {
	    if (!visualization) {
	      return [];
	    }

	    return _.values(visualization.axes || {});
	  });
	  var app, passiveMode;
	  chart.load(dw.backend.__currentData).then(function (ds) {
	    // remove ignored columns
	    var columnFormat = chart.getMetadata('data.column-format', {});
	    var ignore = {};

	    _.each(columnFormat, function (format, key) {
	      ignore[key] = !!format.ignore;
	    });

	    if (ds.filterColumns) ds.filterColumns(ignore);
	    chart.set({
	      dataset: ds
	    });
	    getContext(function (win, doc) {
	      chart.set({
	        vis: win.__dw.vis
	      });
	      target.innerHTML = '';
	      app = new App({
	        store: chart,
	        target: target,
	        data: {
	          visualizations: visualizations,
	          visArchive: visArchive,
	          defaultVisType: defaultVisType
	        }
	      }); // observe changes to old chart object

	      dw.backend.currentChart.onChange(function (ds, changed) {
	        passiveMode = true;
	        var attr = dw.backend.currentChart.attributes();
	        chart.set(attr); // if (changed == 'metadata.data.changes') {
	        //     const dataset = chart.dataset(true);
	        //     chart.set({ dataset });
	        // }

	        setTimeout(function () {
	          passiveMode = false;
	        }, 100);
	      });
	    });
	  });
	  var editHistory = [];
	  var dontPush = false;
	  var historyPos = 0;
	  chart.on('state', function (_ref) {
	    var changed = _ref.changed;
	    var current = _ref.current;
	    var previous = _ref.previous; // observe theme changes and load new theme data if needed

	    if (changed.theme) {
	      // console.log('theme has changed', current.theme);
	      if (themeCache[current.theme]) {
	        // re-use cached theme
	        chart.set({
	          themeData: themeCache[current.theme]
	        });
	      } else {
	        // load new theme data
	        getJSON('//' + dw.backend.__api_domain + '/v3/themes/' + current.theme + '?extend=true', function (res) {
	          themeCache[current.theme] = res.data;
	          chart.set({
	            themeData: res.data
	          });
	        });
	      }
	    }

	    if (changed.type) {
	      if (app && app.destroy) {
	        app.destroy();
	      }

	      if (visCache[current.type]) {
	        // re-use cached visualization
	        chart.set({
	          visualization: visCache[current.type]
	        });
	      } else {
	        // load new vis data
	        getJSON('/api/visualizations/' + current.type, function (res) {
	          if (res.status === 'ok') {
	            visCache[current.type] = res.data.data;
	            chart.set({
	              visualization: visCache[current.type]
	            });
	          } else {
	            console.warn('vis not loaded', res);
	          }
	        });
	      }
	    }

	    if (previous && changed.title || changed.theme || changed.type || changed.metadata || changed.language || changed.lastEditStep) {
	      chart.store(function () {
	        var iframe = document.querySelector('#iframe-vis');

	        if (iframe && iframe.contentWindow) {
	          var win = iframe.contentWindow;

	          if (win.__dw && win.__dw.saved) {
	            win.__dw.saved();
	          }
	        }
	      });

	      if (!dontPush) {
	        var s = JSON.stringify(chart.serialize());

	        if (historyPos > 0) {
	          // throw away edit history until the current pos
	          editHistory.splice(0, historyPos);
	        }

	        if (editHistory[0] !== s) editHistory.unshift(s);
	        editHistory.length = Math.min(editHistory.length, 50);
	        historyPos = 0;
	      }

	      if (!passiveMode && dw && dw.backend && dw.backend.currentChart) {
	        var iframe = document.querySelector('#iframe-vis');

	        if (iframe && iframe.contentWindow) {
	          var win = iframe.contentWindow;

	          if (win.__dw && win.__dw.attributes) {
	            win.__dw.attributes({
	              id: current.id,
	              title: current.title,
	              theme: current.theme,
	              type: current.type,
	              externalData: current.externalData,
	              language: current.language,
	              metadata: current.metadata
	            });
	          }
	        } // set metadata directly without saving again


	        dw.backend.currentChart.attributes().metadata = JSON.parse(JSON.stringify(current.metadata));
	      }
	    }
	  });
	  window.addEventListener('keypress', function (evt) {
	    if (evt.key === 'z' && evt.ctrlKey) {
	      var oldPos = historyPos;
	      historyPos += evt.altKey ? -1 : 1;

	      if (editHistory[historyPos]) {
	        dontPush = true;
	        chart.set(JSON.parse(editHistory[historyPos]));
	        dontPush = false;
	      } else {
	        historyPos = oldPos;
	      }
	    }
	  });
	}

	function getQueryVariable(variable) {
	  var query = window.location.search.substring(1);
	  var vars = query.split('&');

	  for (var i = 0; i < vars.length; i++) {
	    var pair = vars[i].split('=');

	    if (decodeURIComponent(pair[0]) === variable) {
	      return decodeURIComponent(pair[1]);
	    }
	  }
	}

	function getContext(callback) {
	  var win = $('#iframe-vis').get(0).contentWindow;
	  var doc = $('#iframe-vis').get(0).contentDocument;

	  if (!win || !win.__dw || !win.__dw.vis) {
	    return setTimeout(function () {
	      getContext(callback);
	    }, 200);
	  }

	  callback(win, doc);
	}

	return main;

}));
//# sourceMappingURL=visualize.js.map
