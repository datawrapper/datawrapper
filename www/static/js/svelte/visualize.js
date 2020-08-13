(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@datawrapper/chart-core/lib/dw/svelteChart')) :
	typeof define === 'function' && define.amd ? define('svelte/visualize', ['@datawrapper/chart-core/lib/dw/svelteChart'], factory) :
	(global = global || self, global.visualize = factory(global.Chart));
}(this, function (Chart) { 'use strict';

	Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;

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
	    showChartPicker: true
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
	      addLoc(ul, file, 1, 4, 38);
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
	      a_href_value;
	  return {
	    c: function create() {
	      li = createElement("li");
	      a = createElement("a");
	      a._svelte = {
	        component: component,
	        ctx: ctx
	      };
	      addListener(a, "click", click_handler);
	      a.href = a_href_value = "#" + ctx.t.id;
	      addLoc(a, file, 3, 40, 149);
	      toggleClass(li, "active", ctx.tab === ctx.t.id);
	      addLoc(li, file, 3, 8, 117);
	    },
	    m: function mount(target, anchor) {
	      insert(target, li, anchor);
	      append(li, a);
	      a.innerHTML = raw_value;
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

	    if (tab === 'refine' && !showChartPicker || tab === 'pick') location.href = 'data';else if (tab === 'refine' && showChartPicker) this.set({
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

	    if (tab === 'design') location.href = 'publish';else if (tab === 'annotate') this.set({
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
	      addLoc(i0, file$1, 1, 73, 129);
	      addListener(a0, "click", click_handler);
	      a0.className = "btn submitk";
	      a0.href = "#back";
	      addLoc(a0, file$1, 1, 4, 60);
	      i1.className = "fa fa-chevron-right fa-fw icon-btn-right";
	      addLoc(i1, file$1, 2, 108, 310);
	      addListener(a1, "click", click_handler_1);
	      a1.className = "btn submit btn-primary";
	      a1.href = "#proceed";
	      addLoc(a1, file$1, 2, 4, 206);
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
	var file$2 = "visualize/Empty.html";

	function create_main_fragment$2(component, ctx) {
	  var p;
	  return {
	    c: function create() {
	      p = createElement("p");
	      p.textContent = "nothing here";
	      p.className = "mini-help";
	      addLoc(p, file$2, 0, 0, 0);
	    },
	    m: function mount(target, anchor) {
	      insert(target, p, anchor);
	    },
	    p: noop,
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(p);
	      }
	    }
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
	var file$3 = "node_modules/datawrapper/controls/ControlGroup.html";

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
	      addLoc(div0, file$3, 4, 4, 218);
	      div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-p72242";
	      addLoc(div1, file$3, 0, 0, 0);
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
	} // (8:4) {#if help}


	function create_if_block(component, ctx) {
	  var p, p_class_value;
	  return {
	    c: function create() {
	      p = createElement("p");
	      setStyle(p, "padding-left", ctx.inline ? 0 : ctx.width || def.width);
	      p.className = p_class_value = "mini-help " + ctx.type + " svelte-p72242";
	      toggleClass(p, "mini-help-block", !ctx.inline);
	      addLoc(p, file$3, 8, 4, 369);
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
	var file$4 = "node_modules/datawrapper/controls/BaseSelect.html";

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
	    each_blocks[i] = create_each_block_1(component, get_each_context_2(ctx, each_value_2, i));
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
	} // (3:0) {#each designBlocks as b}


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
	var file$5 = "node_modules/datawrapper/controls/editor/ChartDescription.html";

	function create_main_fragment$7(component, ctx) {
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
	      addLoc(input0, file$5, 3, 12, 143);
	      label0.className = "hide-title svelte-jsjdf7";
	      addLoc(label0, file$5, 2, 8, 104);
	      label1.className = "control-label";
	      label1.htmlFor = "text-title";
	      addLoc(label1, file$5, 6, 8, 279);
	      addListener(input1, "input", input1_input_handler);
	      input1.className = "input-xlarge span4";
	      input1.autocomplete = "off";
	      setAttribute(input1, "type", "text");
	      addLoc(input1, file$5, 7, 8, 355);
	      label2.className = "control-label";
	      label2.htmlFor = "text-intro";
	      addLoc(label2, file$5, 9, 8, 452);
	      addListener(textarea, "input", textarea_input_handler);
	      textarea.id = "text-intro";
	      textarea.className = "input-xlarge span4";
	      addLoc(textarea, file$5, 10, 8, 534);
	      label3.className = "control-label";
	      label3.htmlFor = "text-notes";
	      addLoc(label3, file$5, 12, 8, 646);
	      addListener(input2, "input", input2_input_handler);
	      input2.className = "input-xlarge span4";
	      setAttribute(input2, "type", "text");
	      addLoc(input2, file$5, 13, 8, 722);
	      div0.className = "pull-left";
	      setStyle(div0, "position", "relative");
	      addLoc(div0, file$5, 1, 4, 44);
	      label4.className = "control-label";
	      addLoc(label4, file$5, 18, 12, 883);
	      addListener(input3, "input", input3_input_handler);
	      input3.className = "span2";
	      input3.placeholder = __$1('name of the organisation');
	      setAttribute(input3, "type", "text");
	      addLoc(input3, file$5, 19, 12, 952);
	      div1.className = "span2";
	      addLoc(div1, file$5, 17, 8, 851);
	      label5.className = "control-label";
	      addLoc(label5, file$5, 22, 12, 1137);
	      addListener(input4, "input", input4_input_handler);
	      input4.className = "span2";
	      input4.placeholder = __$1('URL of the dataset');
	      setAttribute(input4, "type", "text");
	      addLoc(input4, file$5, 23, 12, 1205);
	      div2.className = "span2";
	      addLoc(div2, file$5, 21, 8, 1105);
	      div3.className = "row";
	      addLoc(div3, file$5, 16, 4, 825);
	      label6.className = "control-label";
	      addLoc(label6, file$5, 28, 8, 1394);
	      addListener(input5, "input", input5_input_handler);
	      input5.className = "input-xlarge span4";
	      input5.placeholder = __$1('visualize / annotate / byline / placeholder');
	      setAttribute(input5, "type", "text");
	      addLoc(input5, file$5, 29, 8, 1477);
	      div4.className = "chart-byline";
	      addLoc(div4, file$5, 27, 4, 1359);
	      div5.className = "story-title control-group";
	      addLoc(div5, file$5, 0, 0, 0);
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
	  this._fragment = create_main_fragment$7(this, this._state);

	  if (options.target) {
	    if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");

	    this._fragment.c();

	    this._mount(options.target, options.anchor);
	  }
	}

	assign(ChartDescription.prototype, protoDev);

	ChartDescription.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	/* visualize/App.html generated by Svelte v2.16.1 */

	function data$6() {
	  return {
	    tab: 'refine',
	    showChartPicker: true,
	    Refine: Empty,
	    Annotate: Empty
	  };
	}

	function oncreate$1() {
	  if (['#pick', '#refine', '#annotate', '#design'].includes(window.location.hash)) {
	    console.log(window.location.hash);
	    this.set({
	      tab: window.location.hash.substr(1)
	    });
	  }
	}
	var file$6 = "visualize/App.html";

	function create_main_fragment$8(component, ctx) {
	  var tabnav_updating = {},
	      text0,
	      div3,
	      text1,
	      div0,
	      text2,
	      div1,
	      text3,
	      text4,
	      div2,
	      text5,
	      buttonnav_updating = {},
	      text6,
	      input,
	      text7;
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

	  var if_block = ctx.showChartPicker && create_if_block$2(component, ctx);
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

	  function input_change_handler() {
	    component.set({
	      showChartPicker: input.checked
	    });
	  }

	  return {
	    c: function create() {
	      tabnav._fragment.c();

	      text0 = createText("\n\n");
	      div3 = createElement("div");
	      if (if_block) if_block.c();
	      text1 = createText("\n\n    \n    ");
	      div0 = createElement("div");
	      if (switch_instance0) switch_instance0._fragment.c();
	      text2 = createText("\n\n    \n    ");
	      div1 = createElement("div");

	      chartdescription._fragment.c();

	      text3 = createText("\n        ");
	      if (switch_instance1) switch_instance1._fragment.c();
	      text4 = createText("\n\n    \n    ");
	      div2 = createElement("div");

	      design._fragment.c();

	      text5 = createText("\n\n    ");

	      buttonnav._fragment.c();

	      text6 = createText("\n\n");
	      input = createElement("input");
	      text7 = createText(" show chart picker");
	      toggleClass(div0, "hide-smart", ctx.tab !== 'refine');
	      addLoc(div0, file$6, 11, 4, 243);
	      toggleClass(div1, "hide-smart", ctx.tab !== 'annotate');
	      addLoc(div1, file$6, 16, 4, 374);
	      toggleClass(div2, "hide-smart", ctx.tab !== 'design');
	      addLoc(div2, file$6, 22, 4, 536);
	      div3.className = "form-horizontal vis-options";
	      addLoc(div3, file$6, 2, 0, 39);
	      addListener(input, "change", input_change_handler);
	      setAttribute(input, "type", "checkbox");
	      addLoc(input, file$6, 29, 0, 662);
	    },
	    m: function mount(target, anchor) {
	      tabnav._mount(target, anchor);

	      insert(target, text0, anchor);
	      insert(target, div3, anchor);
	      if (if_block) if_block.m(div3, null);
	      append(div3, text1);
	      append(div3, div0);

	      if (switch_instance0) {
	        switch_instance0._mount(div0, null);
	      }

	      append(div3, text2);
	      append(div3, div1);

	      chartdescription._mount(div1, null);

	      append(div1, text3);

	      if (switch_instance1) {
	        switch_instance1._mount(div1, null);
	      }

	      append(div3, text4);
	      append(div3, div2);

	      design._mount(div2, null);

	      append(div3, text5);

	      buttonnav._mount(div3, null);

	      insert(target, text6, anchor);
	      insert(target, input, anchor);
	      input.checked = ctx.showChartPicker;
	      insert(target, text7, anchor);
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
	        if (if_block) {
	          if_block.p(changed, ctx);
	        } else {
	          if_block = create_if_block$2(component, ctx);
	          if_block.c();
	          if_block.m(div3, text1);
	        }
	      } else if (if_block) {
	        if_block.d(1);
	        if_block = null;
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
	      if (changed.showChartPicker) input.checked = ctx.showChartPicker;
	    },
	    d: function destroy(detach) {
	      tabnav.destroy(detach);

	      if (detach) {
	        detachNode(text0);
	        detachNode(div3);
	      }

	      if (if_block) if_block.d();
	      if (switch_instance0) switch_instance0.destroy();
	      chartdescription.destroy();
	      if (switch_instance1) switch_instance1.destroy();
	      design.destroy();
	      buttonnav.destroy();

	      if (detach) {
	        detachNode(text6);
	        detachNode(input);
	      }

	      removeListener(input, "change", input_change_handler);

	      if (detach) {
	        detachNode(text7);
	      }
	    }
	  };
	} // (4:4) {#if showChartPicker}


	function create_if_block$2(component, ctx) {
	  var div;
	  return {
	    c: function create() {
	      div = createElement("div");
	      div.textContent = "Chart picker!";
	      toggleClass(div, "hide-smart", ctx.tab !== 'pick');
	      addLoc(div, file$6, 5, 4, 135);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);
	    },
	    p: function update(changed, ctx) {
	      if (changed.tab) {
	        toggleClass(div, "hide-smart", ctx.tab !== 'pick');
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
	  var _this = this;

	  this._debugName = '<App>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data$6(), options.data);
	  if (!('tab' in this._state)) console.warn("<App> was created without expected data property 'tab'");
	  if (!('showChartPicker' in this._state)) console.warn("<App> was created without expected data property 'showChartPicker'");
	  if (!('Refine' in this._state)) console.warn("<App> was created without expected data property 'Refine'");
	  if (!('Annotate' in this._state)) console.warn("<App> was created without expected data property 'Annotate'");
	  this._intro = true;
	  this._fragment = create_main_fragment$8(this, this._state);

	  this.root._oncreate.push(function () {
	    oncreate$1.call(_this);

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

	assign(App.prototype, protoDev);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	var main = {
	  init: init$1
	};
	/* globals dw, $, _ */

	function init$1(_ref) {
	  var chartData = _ref.chartData,
	      data = _ref.data,
	      target = _ref.target,
	      themeId = _ref.themeId,
	      themeData = _ref.themeData,
	      visData = _ref.visData,
	      user = _ref.user,
	      locales = _ref.locales,
	      themes = _ref.themes;
	  chartData.mode = getQueryVariable("mode") || "web";
	  var chart = new Chart(chartData);
	  window.chart2 = chart;
	  var visCache = {};
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
	  var app;
	  chart.load(dw.backend.__currentData).then(function (ds) {
	    console.log('chart loaded', ds); // remove ignored columns

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
	        target: target // data: data

	      }); // observe changes to old chart object

	      dw.backend.currentChart.onChange(function (ds, changed) {
	        var attr = dw.backend.currentChart.attributes();
	        chart.set(attr); // if (changed == 'metadata.data.changes') {
	        //     const dataset = chart.dataset(true);
	        //     chart.set({ dataset });
	        // }

	        setTimeout(function () {
	        }, 100);
	      });
	    });
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
