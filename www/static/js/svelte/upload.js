(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../../../../../../../../../static/vendor/jschardet/jschardet.min.js'), require('../../../../../../../../../static/vendor/xlsx/xlsx.full.min.js')) :
	typeof define === 'function' && define.amd ? define('svelte/upload', ['../../../../../../../../../static/vendor/jschardet/jschardet.min.js', '../../../../../../../../../static/vendor/xlsx/xlsx.full.min.js'], factory) :
	(global = global || self, global.upload = factory(global.jschardet));
}(this, function (jschardet) { 'use strict';

	jschardet = jschardet && jschardet.hasOwnProperty('default') ? jschardet['default'] : jschardet;

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
	 * Download and parse a remote JSON endpoint via PUT. credentials
	 * are included automatically
	 * Use {@link httpReq} or {@link httpReq.put} instead.
	 *
	 * @deprecated
	 *
	 * @param {string} url
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 * @example
	 * import { putJSON } from '@datawrapper/shared/fetch';
	 *
	 * putJSON('http://api.example.org', JSON.stringify({
	 *    query: 'foo',
	 *    page: 12
	 * }));
	 */

	function putJSON(url, body, callback) {
	  return fetchJSON(url, 'PUT', 'include', body, callback);
	}

	// `_now` : an utility's function
	// -------------------------------
	// A (possibly faster) way to get the current timestamp as an integer.
	var _now = Date.now || function () {
	  return new Date().getTime();
	};

	// `_throttle` : (ahem) a function's function
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.

	function _throttle (func, wait, options) {
	  var timeout, context, args, result;
	  var previous = 0;
	  if (!options) options = {};

	  var later = function later() {
	    previous = options.leading === false ? 0 : _now();
	    timeout = null;
	    result = func.apply(context, args);
	    if (!timeout) context = args = null;
	  };

	  var throttled = function throttled() {
	    var now = _now();

	    if (!previous && options.leading === false) previous = now;
	    var remaining = wait - (now - previous);
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

	/* upload/TextAreaUpload.html generated by Svelte v2.16.1 */
	var app;
	var chart = dw.backend.currentChart;

	var updateData = _throttle(function () {
	  var _app$get = app.get(),
	      chartData = _app$get.chartData;

	  putJSON("/api/charts/".concat(chart.get('id'), "/data"), chartData);
	}, 1000);

	function data() {
	  return {
	    placeholder: __('upload / paste here')
	  };
	}

	function oncreate() {
	  app = this;
	}

	function onupdate(_ref) {
	  var changed = _ref.changed,
	      current = _ref.current,
	      previous = _ref.previous;

	  if (changed.chartData && current.chartData && previous && previous.chartData !== current.chartData) {
	    updateData();
	  }
	}
	var file = "upload/TextAreaUpload.html";

	function create_main_fragment(component, ctx) {
	  var form,
	      div,
	      textarea,
	      textarea_updating = false;

	  function textarea_input_handler() {
	    textarea_updating = true;
	    component.set({
	      chartData: textarea.value
	    });
	    textarea_updating = false;
	  }

	  return {
	    c: function create() {
	      form = createElement("form");
	      div = createElement("div");
	      textarea = createElement("textarea");
	      addListener(textarea, "input", textarea_input_handler);
	      textarea.readOnly = ctx.readonly;
	      textarea.id = "upload-data-text";
	      setStyle(textarea, "resize", "none");
	      textarea.placeholder = ctx.placeholder;
	      textarea.className = "svelte-kl1kny";
	      addLoc(textarea, file, 2, 8, 67);
	      div.className = "control-group";
	      addLoc(div, file, 1, 4, 31);
	      form.className = "upload-form";
	      addLoc(form, file, 0, 0, 0);
	    },
	    m: function mount(target, anchor) {
	      insert(target, form, anchor);
	      append(form, div);
	      append(div, textarea);
	      textarea.value = ctx.chartData;
	    },
	    p: function update(changed, ctx) {
	      if (!textarea_updating && changed.chartData) textarea.value = ctx.chartData;

	      if (changed.readonly) {
	        textarea.readOnly = ctx.readonly;
	      }

	      if (changed.placeholder) {
	        textarea.placeholder = ctx.placeholder;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(form);
	      }

	      removeListener(textarea, "input", textarea_input_handler);
	    }
	  };
	}

	function TextAreaUpload(options) {
	  var _this = this;

	  this._debugName = '<TextAreaUpload>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data(), options.data);
	  if (!('chartData' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'chartData'");
	  if (!('readonly' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'readonly'");
	  if (!('placeholder' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'placeholder'");
	  this._intro = true;
	  this._handlers.update = [onupdate];
	  this._fragment = create_main_fragment(this, this._state);

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

	assign(TextAreaUpload.prototype, protoDev);

	TextAreaUpload.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	/* upload/UploadHelp.html generated by Svelte v2.16.1 */
	/* globals dw */

	function datasetsArray(_ref) {
	  var datasets = _ref.datasets;
	  return Object.keys(datasets).map(function (k) {
	    return datasets[k];
	  });
	}

	function data$1() {
	  return {
	    selectedDataset: '--'
	  };
	}

	function onupdate$1(_ref2) {
	  var changed = _ref2.changed,
	      current = _ref2.current;

	  if (changed.selectedDataset && current.selectedDataset !== '--') {
	    var sel = current.selectedDataset;
	    this.set({
	      chartData: sel.data
	    });

	    if (sel.presets) {
	      Object.keys(sel.presets).forEach(function (k) {
	        dw.backend.currentChart.set(k, sel.presets[k]);
	      });
	    }
	  }
	}
	var file$1 = "upload/UploadHelp.html";

	function get_each_context_1(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.dataset = list[i];
	  return child_ctx;
	}

	function get_each_context(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.group = list[i];
	  return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
	  var p0,
	      text0_value = __("upload / quick help"),
	      text0,
	      text1,
	      div,
	      p1,
	      text2_value = __("upload / try a dataset"),
	      text2,
	      text3,
	      select,
	      option,
	      text4_value = __("upload / sample dataset"),
	      text4,
	      select_updating = false;

	  var each_value = ctx.datasetsArray;
	  var each_blocks = [];

	  for (var i = 0; i < each_value.length; i += 1) {
	    each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
	  }

	  function select_change_handler() {
	    select_updating = true;
	    component.set({
	      selectedDataset: selectValue(select)
	    });
	    select_updating = false;
	  }

	  return {
	    c: function create() {
	      p0 = createElement("p");
	      text0 = createText(text0_value);
	      text1 = createText("\n\n");
	      div = createElement("div");
	      p1 = createElement("p");
	      text2 = createText(text2_value);
	      text3 = createText("\n    ");
	      select = createElement("select");
	      option = createElement("option");
	      text4 = createText(text4_value);

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].c();
	      }

	      addLoc(p0, file$1, 0, 0, 0);
	      addLoc(p1, file$1, 3, 4, 70);
	      option.__value = "--";
	      option.value = option.__value;
	      addLoc(option, file$1, 5, 8, 201);
	      addListener(select, "change", select_change_handler);
	      if (!('selectedDataset' in ctx)) component.root._beforecreate.push(select_change_handler);
	      select.disabled = ctx.readonly;
	      select.id = "demo-datasets";
	      select.className = "svelte-16u58l0";
	      addLoc(select, file$1, 4, 4, 114);
	      div.className = "demo-datasets";
	      addLoc(div, file$1, 2, 0, 38);
	    },
	    m: function mount(target, anchor) {
	      insert(target, p0, anchor);
	      append(p0, text0);
	      insert(target, text1, anchor);
	      insert(target, div, anchor);
	      append(div, p1);
	      append(p1, text2);
	      append(div, text3);
	      append(div, select);
	      append(select, option);
	      append(option, text4);

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].m(select, null);
	      }

	      selectOption(select, ctx.selectedDataset);
	    },
	    p: function update(changed, ctx) {
	      if (changed.datasetsArray) {
	        each_value = ctx.datasetsArray;

	        for (var i = 0; i < each_value.length; i += 1) {
	          var child_ctx = get_each_context(ctx, each_value, i);

	          if (each_blocks[i]) {
	            each_blocks[i].p(changed, child_ctx);
	          } else {
	            each_blocks[i] = create_each_block(component, child_ctx);
	            each_blocks[i].c();
	            each_blocks[i].m(select, null);
	          }
	        }

	        for (; i < each_blocks.length; i += 1) {
	          each_blocks[i].d(1);
	        }

	        each_blocks.length = each_value.length;
	      }

	      if (!select_updating && changed.selectedDataset) selectOption(select, ctx.selectedDataset);

	      if (changed.readonly) {
	        select.disabled = ctx.readonly;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(p0);
	        detachNode(text1);
	        detachNode(div);
	      }

	      destroyEach(each_blocks, detach);
	      removeListener(select, "change", select_change_handler);
	    }
	  };
	} // (9:12) {#each group.datasets as dataset}


	function create_each_block_1(component, ctx) {
	  var option,
	      text_value = ctx.dataset.title,
	      text,
	      option_value_value;
	  return {
	    c: function create() {
	      option = createElement("option");
	      text = createText(text_value);
	      option.__value = option_value_value = ctx.dataset;
	      option.value = option.__value;
	      option.className = "demo-dataset";
	      addLoc(option, file$1, 9, 12, 400);
	    },
	    m: function mount(target, anchor) {
	      insert(target, option, anchor);
	      append(option, text);
	    },
	    p: function update(changed, ctx) {
	      if (changed.datasetsArray && text_value !== (text_value = ctx.dataset.title)) {
	        setData(text, text_value);
	      }

	      if (changed.datasetsArray && option_value_value !== (option_value_value = ctx.dataset)) {
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
	} // (7:8) {#each datasetsArray as group}


	function create_each_block(component, ctx) {
	  var optgroup, optgroup_label_value;
	  var each_value_1 = ctx.group.datasets;
	  var each_blocks = [];

	  for (var i = 0; i < each_value_1.length; i += 1) {
	    each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
	  }

	  return {
	    c: function create() {
	      optgroup = createElement("optgroup");

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].c();
	      }

	      setAttribute(optgroup, "label", optgroup_label_value = ctx.group.type);
	      addLoc(optgroup, file$1, 7, 8, 310);
	    },
	    m: function mount(target, anchor) {
	      insert(target, optgroup, anchor);

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].m(optgroup, null);
	      }
	    },
	    p: function update(changed, ctx) {
	      if (changed.datasetsArray) {
	        each_value_1 = ctx.group.datasets;

	        for (var i = 0; i < each_value_1.length; i += 1) {
	          var child_ctx = get_each_context_1(ctx, each_value_1, i);

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

	        each_blocks.length = each_value_1.length;
	      }

	      if (changed.datasetsArray && optgroup_label_value !== (optgroup_label_value = ctx.group.type)) {
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

	function UploadHelp(options) {
	  var _this = this;

	  this._debugName = '<UploadHelp>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data$1(), options.data);

	  this._recompute({
	    datasets: 1
	  }, this._state);

	  if (!('datasets' in this._state)) console.warn("<UploadHelp> was created without expected data property 'datasets'");
	  if (!('readonly' in this._state)) console.warn("<UploadHelp> was created without expected data property 'readonly'");
	  if (!('selectedDataset' in this._state)) console.warn("<UploadHelp> was created without expected data property 'selectedDataset'");
	  this._intro = true;
	  this._handlers.update = [onupdate$1];
	  this._fragment = create_main_fragment$1(this, this._state);

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

	assign(UploadHelp.prototype, protoDev);

	UploadHelp.prototype._checkReadOnly = function _checkReadOnly(newState) {
	  if ('datasetsArray' in newState && !this._updatingReadonlyProperty) throw new Error("<UploadHelp>: Cannot set read-only property 'datasetsArray'");
	};

	UploadHelp.prototype._recompute = function _recompute(changed, state) {
	  if (changed.datasets) {
	    if (this._differs(state.datasetsArray, state.datasetsArray = datasetsArray(state))) changed.datasetsArray = true;
	  }
	};

	/* upload/SelectSheet.html generated by Svelte v2.16.1 */
	/* globals dw */

	function data$2() {
	  return {
	    selected: false,
	    sheets: []
	  };
	}

	function onupdate$2(_ref) {
	  var _this = this;

	  var changed = _ref.changed,
	      current = _ref.current;

	  if (changed.sheets && current.sheets.length > 1) {
	    setTimeout(function () {
	      _this.set({
	        selected: current.sheets[0]
	      });
	    }, 300);
	  } else if (changed.sheets && current.sheets.length === 1) {
	    putJSON("/api/charts/".concat(dw.backend.currentChart.get('id'), "/data"), current.sheets[0].csv, function () {
	      window.location.href = 'describe';
	    });
	  }

	  if (changed.selected) {
	    this.set({
	      chartData: current.selected.csv
	    });
	  }
	}
	var file$2 = "upload/SelectSheet.html";

	function get_each_context$1(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.sheet = list[i];
	  return child_ctx;
	}

	function create_main_fragment$2(component, ctx) {
	  var div;

	  function select_block_type(ctx) {
	    if (!ctx.sheets.length) return create_if_block;
	    if (ctx.sheets.length > 1) return create_if_block_1;
	    return create_else_block;
	  }

	  var current_block_type = select_block_type(ctx);
	  var if_block = current_block_type(component, ctx);
	  return {
	    c: function create() {
	      div = createElement("div");
	      if_block.c();
	      addLoc(div, file$2, 0, 0, 0);
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
	} // (11:4) {:else}


	function create_else_block(component, ctx) {
	  var p,
	      raw_value = __('upload / xls / uploading data');

	  return {
	    c: function create() {
	      p = createElement("p");
	      addLoc(p, file$2, 11, 4, 375);
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
	} // (4:29) 


	function create_if_block_1(component, ctx) {
	  var p,
	      text0_value = __("upload / select sheet"),
	      text0,
	      text1,
	      select,
	      select_updating = false,
	      select_disabled_value;

	  var each_value = ctx.sheets;
	  var each_blocks = [];

	  for (var i = 0; i < each_value.length; i += 1) {
	    each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
	  }

	  function select_change_handler() {
	    select_updating = true;
	    component.set({
	      selected: selectValue(select)
	    });
	    select_updating = false;
	  }

	  return {
	    c: function create() {
	      p = createElement("p");
	      text0 = createText(text0_value);
	      text1 = createText("\n    ");
	      select = createElement("select");

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].c();
	      }

	      addLoc(p, file$2, 4, 4, 141);
	      addListener(select, "change", select_change_handler);
	      if (!('selected' in ctx)) component.root._beforecreate.push(select_change_handler);
	      select.disabled = select_disabled_value = !ctx.sheets.length;
	      select.className = "svelte-16u58l0";
	      addLoc(select, file$2, 5, 4, 184);
	    },
	    m: function mount(target, anchor) {
	      insert(target, p, anchor);
	      append(p, text0);
	      insert(target, text1, anchor);
	      insert(target, select, anchor);

	      for (var i = 0; i < each_blocks.length; i += 1) {
	        each_blocks[i].m(select, null);
	      }

	      selectOption(select, ctx.selected);
	    },
	    p: function update(changed, ctx) {
	      if (changed.sheets) {
	        each_value = ctx.sheets;

	        for (var i = 0; i < each_value.length; i += 1) {
	          var child_ctx = get_each_context$1(ctx, each_value, i);

	          if (each_blocks[i]) {
	            each_blocks[i].p(changed, child_ctx);
	          } else {
	            each_blocks[i] = create_each_block$1(component, child_ctx);
	            each_blocks[i].c();
	            each_blocks[i].m(select, null);
	          }
	        }

	        for (; i < each_blocks.length; i += 1) {
	          each_blocks[i].d(1);
	        }

	        each_blocks.length = each_value.length;
	      }

	      if (!select_updating && changed.selected) selectOption(select, ctx.selected);

	      if (changed.sheets && select_disabled_value !== (select_disabled_value = !ctx.sheets.length)) {
	        select.disabled = select_disabled_value;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(p);
	        detachNode(text1);
	        detachNode(select);
	      }

	      destroyEach(each_blocks, detach);
	      removeListener(select, "change", select_change_handler);
	    }
	  };
	} // (2:4) {#if !sheets.length}


	function create_if_block(component, ctx) {
	  var div,
	      raw_value = __('upload / parsing-xls');

	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "alert alert-info";
	      addLoc(div, file$2, 2, 4, 35);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div, anchor);
	      div.innerHTML = raw_value;
	    },
	    p: noop,
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div);
	      }
	    }
	  };
	} // (7:8) {#each sheets as sheet}


	function create_each_block$1(component, ctx) {
	  var option,
	      text_value = ctx.sheet.name,
	      text,
	      option_value_value;
	  return {
	    c: function create() {
	      option = createElement("option");
	      text = createText(text_value);
	      option.__value = option_value_value = ctx.sheet;
	      option.value = option.__value;
	      addLoc(option, file$2, 7, 8, 283);
	    },
	    m: function mount(target, anchor) {
	      insert(target, option, anchor);
	      append(option, text);
	    },
	    p: function update(changed, ctx) {
	      if (changed.sheets && text_value !== (text_value = ctx.sheet.name)) {
	        setData(text, text_value);
	      }

	      if (changed.sheets && option_value_value !== (option_value_value = ctx.sheet)) {
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
	}

	function SelectSheet(options) {
	  var _this2 = this;

	  this._debugName = '<SelectSheet>';

	  if (!options || !options.target && !options.root) {
	    throw new Error("'target' is a required option");
	  }

	  init(this, options);
	  this._state = assign(data$2(), options.data);
	  if (!('sheets' in this._state)) console.warn("<SelectSheet> was created without expected data property 'sheets'");
	  if (!('selected' in this._state)) console.warn("<SelectSheet> was created without expected data property 'selected'");
	  this._intro = true;
	  this._handlers.update = [onupdate$2];
	  this._fragment = create_main_fragment$2(this, this._state);

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

	assign(SelectSheet.prototype, protoDev);

	SelectSheet.prototype._checkReadOnly = function _checkReadOnly(newState) {};

	/* global Uint8Array, FileReader */
	function readFile (file, callback) {
	  var reader = new FileReader();

	  reader.onload = function () {
	    try {
	      var array = new Uint8Array(reader.result);
	      var string = '';
	      var nonAscii = 0;

	      for (var i = 0; i < array.length; ++i) {
	        if (array[i] > 122) nonAscii++;
	        string += String.fromCharCode(array[i]);
	      }

	      var res = jschardet.detect(string); // jschardet performs poorly if there are not a lot of non-ascii characters
	      // in the input file, so we'll just ignore what it says and assume utf-8
	      // (unless jschardet is *really* sure ;)

	      if (res.confidence <= 0.95 && nonAscii < 10) res.encoding = 'utf-8';
	      reader = new FileReader();

	      reader.onload = function () {
	        return callback(null, reader.result);
	      };

	      reader.readAsText(file, res.encoding);
	    } catch (e) {
	      console.warn(e);
	      callback(null, reader.result);
	    }
	  };

	  reader.readAsArrayBuffer(file);
	}

	/* global XLSX , FileReader */
	/**
	 * parses an XLS spreadsheet file
	 */

	function readSpreadsheet (file, callback) {
	  var rABS = typeof FileReader !== 'undefined' && (FileReader.prototype || {}).readAsBinaryString;
	  var reader = new FileReader();

	  reader.onload = function () {
	    try {
	      var data = !rABS ? new Uint8Array(reader.result) : reader.result;
	      var wb = XLSX.read(data, {
	        type: rABS ? 'binary' : 'array'
	      });
	      callback(null, wb.SheetNames.map(function (n) {
	        return {
	          name: n,
	          sheet: wb.Sheets[n],
	          csv: XLSX.utils.sheet_to_csv(wb.Sheets[n])
	        };
	      }));
	    } catch (e) {
	      console.error(e);
	      callback(null, reader.result);
	    }
	  };

	  reader.readAsBinaryString(file);
	}

	/* upload/App.html generated by Svelte v2.16.1 */
	var app$1;
	var coreUploads = [{
	  id: 'copy',
	  title: __('upload / copy-paste'),
	  longTitle: __('upload / copy-paste / long'),
	  icon: 'fa fa-clipboard',
	  mainPanel: TextAreaUpload,
	  sidebar: UploadHelp,
	  action: function action() {}
	}, {
	  id: 'upload',
	  title: __('upload / upload-csv'),
	  longTitle: __('upload / upload-csv / long'),
	  icon: 'fa-file-excel-o fa',
	  mainPanel: TextAreaUpload,
	  sidebar: UploadHelp,
	  isFileUpload: true,
	  onFileUpload: function onFileUpload(event) {
	    var file = event.target.files[0];

	    if (file.type.substr(0, 5) === 'text/' || file.name.substr(file.name.length - 4) === '.csv') {
	      app$1.set({
	        Sidebar: UploadHelp
	      });
	      readFile(file, function (err, result) {
	        if (err) return console.error('could not read file', err);
	        putJSON("/api/charts/".concat(dw.backend.currentChart.get('id'), "/data"), result, function () {
	          window.location.href = 'describe';
	        });
	      });
	    } else if (file.type.substr(0, 12) === 'application/') {
	      app$1.set({
	        Sidebar: SelectSheet,
	        sheets: []
	      }); // reset

	      readSpreadsheet(file, function (err, sheets) {
	        if (err) return app$1.set({
	          error: err
	        });
	        app$1.set({
	          sheets: sheets
	        });
	      });
	    } else {
	      console.error(file.type);
	      console.error(file);
	      app$1.set({
	        error: __('upload / csv-required')
	      });
	    }
	  },
	  action: function action() {}
	}];

	function data$3() {
	  return {
	    dragover: false,
	    MainPanel: TextAreaUpload,
	    Sidebar: UploadHelp,
	    active: coreUploads[0],
	    buttons: coreUploads,
	    sheets: [],
	    chart: {
	      id: ''
	    },
	    readonly: false,
	    chartData: '',
	    transpose: false,
	    firstRowIsHeader: true,
	    skipRows: 0
	  };
	}
	var methods = {
	  addButton: function addButton(btn) {
	    coreUploads.push(btn);
	    this.set({
	      buttons: coreUploads
	    });

	    var _this$get = this.get(),
	        defaultMethod = _this$get.defaultMethod;

	    if (btn.id === defaultMethod) {
	      this.btnAction(btn);
	    }
	  },
	  btnAction: function btnAction(btn) {
	    this.set({
	      active: btn
	    });

	    if (btn.id === 'copy') {
	      // turn off externalData, if still set
	      var _this$store$get = this.store.get(),
	          _dw_chart = _this$store$get.dw_chart;

	      if (_dw_chart.get('externalData')) {
	        _dw_chart.set('externalData', '');

	        setTimeout(function () {
	          dw.backend.currentChart.save();
	        }, 1000);
	      }
	    }

	    var activeKey = btn.id;

	    if (btn.id === 'upload') {
	      activeKey = 'copy';
	      setTimeout(function () {// reset after 1sec
	        // this.set({active:coreUploads[0]});
	      }, 1000);
	    }

	    var _this$store$get2 = this.store.get(),
	        dw_chart = _this$store$get2.dw_chart;

	    dw_chart.set('metadata.data.upload-method', activeKey);
	    if (btn.action) btn.action();
	    if (btn.mainPanel) this.set({
	      MainPanel: btn.mainPanel
	    });
	    if (btn.sidebar) this.set({
	      Sidebar: btn.sidebar
	    });
	  },
	  btnUpload: function btnUpload(btn, event) {
	    if (btn.onFileUpload) btn.onFileUpload(event);
	  },
	  dragStart: function dragStart(event) {
	    var _this$get2 = this.get(),
	        active = _this$get2.active;

	    if (active.id === 'copy') {
	      event.preventDefault();
	      this.set({
	        dragover: true
	      });
	    }
	  },
	  resetDrag: function resetDrag() {
	    this.set({
	      dragover: false
	    });
	  },
	  onFileDrop: function onFileDrop(event) {
	    var _this$get3 = this.get(),
	        active = _this$get3.active;

	    if (active.id !== 'copy') return; // Prevent default behavior (Prevent file from being opened)

	    this.resetDrag();
	    event.preventDefault();
	    var files = [];

	    if (event.dataTransfer.items) {
	      // Use DataTransferItemList interface to access the file(s)
	      for (var i = 0; i < event.dataTransfer.items.length; i++) {
	        // If dropped items aren't files, reject them
	        if (event.dataTransfer.items[i].kind === 'file') {
	          files.push(event.dataTransfer.items[i].getAsFile());
	        }
	      }

	      event.dataTransfer.items.clear();
	    } else {
	      // Use DataTransfer interface to access the file(s)
	      for (var _i = 0; _i < event.dataTransfer.files.length; _i++) {
	        files.push(event.dataTransfer.files[_i]);
	      }

	      event.dataTransfer.items.clear();
	    }

	    for (var _i2 = 0; _i2 < files.length; _i2++) {
	      if (files[_i2].type.substr(0, 5) === 'text/') {
	        return readFile(files[_i2], function (err, result) {
	          if (err) return console.error('could not read file', err);
	          putJSON("/api/charts/".concat(dw.backend.currentChart.get('id'), "/data"), result, function () {
	            window.location.href = 'describe';
	          });
	        });
	      }
	    }
	  }
	};

	function oncreate$1() {
	  var _this = this;

	  app$1 = this;

	  var _this$store$get3 = this.store.get(),
	      dw_chart = _this$store$get3.dw_chart;

	  var method = dw_chart.get('metadata.data.upload-method', 'copy');
	  this.set({
	    defaultMethod: method
	  });
	  coreUploads.forEach(function (u) {
	    if (u.id === method) {
	      _this.set({
	        active: u
	      });
	    }
	  });
	}
	var file$3 = "upload/App.html";

	function click_handler(event) {
	  var _this$_svelte = this._svelte,
	      component = _this$_svelte.component,
	      ctx = _this$_svelte.ctx;
	  component.btnAction(ctx.btn);
	}

	function change_handler(event) {
	  var _this$_svelte2 = this._svelte,
	      component = _this$_svelte2.component,
	      ctx = _this$_svelte2.ctx;
	  component.btnUpload(ctx.btn, event);
	}

	function get_each_context$2(ctx, list, i) {
	  var child_ctx = Object.create(ctx);
	  child_ctx.btn = list[i];
	  return child_ctx;
	}

	function create_main_fragment$3(component, ctx) {
	  var div5,
	      text0,
	      div4,
	      div1,
	      div0,
	      h3,
	      raw_value = __('upload / title'),
	      text1,
	      ul,
	      text2,
	      text3,
	      h4,
	      text4_value = ctx.active.longTitle || ctx.active.title,
	      text4,
	      text5,
	      switch_instance0_updating = {},
	      text6,
	      div3,
	      switch_instance1_updating = {},
	      text7,
	      div2,
	      a,
	      text8_value = __("Proceed"),
	      text8,
	      text9,
	      i,
	      div4_style_value;

	  var if_block0 = ctx.dragover && create_if_block_2();
	  var each_value = ctx.buttons;
	  var each_blocks = [];

	  for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
	    each_blocks[i_1] = create_each_block$2(component, get_each_context$2(ctx, each_value, i_1));
	  }

	  var if_block1 = ctx.error && create_if_block$1(component, ctx);
	  var switch_value = ctx.Sidebar;

	  function switch_props(ctx) {
	    var switch_instance0_initial_data = {};

	    if (ctx.chartData !== void 0) {
	      switch_instance0_initial_data.chartData = ctx.chartData;
	      switch_instance0_updating.chartData = true;
	    }

	    if (ctx.readonly !== void 0) {
	      switch_instance0_initial_data.readonly = ctx.readonly;
	      switch_instance0_updating.readonly = true;
	    }

	    if (ctx.sheets !== void 0) {
	      switch_instance0_initial_data.sheets = ctx.sheets;
	      switch_instance0_updating.sheets = true;
	    }

	    if (ctx.datasets !== void 0) {
	      switch_instance0_initial_data.datasets = ctx.datasets;
	      switch_instance0_updating.datasets = true;
	    }

	    return {
	      root: component.root,
	      store: component.store,
	      data: switch_instance0_initial_data,
	      _bind: function _bind(changed, childState) {
	        var newState = {};

	        if (!switch_instance0_updating.chartData && changed.chartData) {
	          newState.chartData = childState.chartData;
	        }

	        if (!switch_instance0_updating.readonly && changed.readonly) {
	          newState.readonly = childState.readonly;
	        }

	        if (!switch_instance0_updating.sheets && changed.sheets) {
	          newState.sheets = childState.sheets;
	        }

	        if (!switch_instance0_updating.datasets && changed.datasets) {
	          newState.datasets = childState.datasets;
	        }

	        component._set(newState);

	        switch_instance0_updating = {};
	      }
	    };
	  }

	  if (switch_value) {
	    var switch_instance0 = new switch_value(switch_props(ctx));

	    component.root._beforecreate.push(function () {
	      switch_instance0._bind({
	        chartData: 1,
	        readonly: 1,
	        sheets: 1,
	        datasets: 1
	      }, switch_instance0.get());
	    });
	  }

	  var switch_value_1 = ctx.MainPanel;

	  function switch_props_1(ctx) {
	    var switch_instance1_initial_data = {};

	    if (ctx.chartData !== void 0) {
	      switch_instance1_initial_data.chartData = ctx.chartData;
	      switch_instance1_updating.chartData = true;
	    }

	    if (ctx.readonly !== void 0) {
	      switch_instance1_initial_data.readonly = ctx.readonly;
	      switch_instance1_updating.readonly = true;
	    }

	    return {
	      root: component.root,
	      store: component.store,
	      data: switch_instance1_initial_data,
	      _bind: function _bind(changed, childState) {
	        var newState = {};

	        if (!switch_instance1_updating.chartData && changed.chartData) {
	          newState.chartData = childState.chartData;
	        }

	        if (!switch_instance1_updating.readonly && changed.readonly) {
	          newState.readonly = childState.readonly;
	        }

	        component._set(newState);

	        switch_instance1_updating = {};
	      }
	    };
	  }

	  if (switch_value_1) {
	    var switch_instance1 = new switch_value_1(switch_props_1(ctx));

	    component.root._beforecreate.push(function () {
	      switch_instance1._bind({
	        chartData: 1,
	        readonly: 1
	      }, switch_instance1.get());
	    });
	  }

	  function drop_handler(event) {
	    component.onFileDrop(event);
	  }

	  function dragover_handler(event) {
	    component.dragStart(event);
	  }

	  function dragenter_handler(event) {
	    component.dragStart(event);
	  }

	  function dragend_handler(event) {
	    component.resetDrag();
	  }

	  function dragleave_handler(event) {
	    component.resetDrag();
	  }

	  return {
	    c: function create() {
	      div5 = createElement("div");
	      if (if_block0) if_block0.c();
	      text0 = createText("\n    ");
	      div4 = createElement("div");
	      div1 = createElement("div");
	      div0 = createElement("div");
	      h3 = createElement("h3");
	      text1 = createText("\n\n                ");
	      ul = createElement("ul");

	      for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
	        each_blocks[i_1].c();
	      }

	      text2 = createText("\n\n                ");
	      if (if_block1) if_block1.c();
	      text3 = createText("\n\n                ");
	      h4 = createElement("h4");
	      text4 = createText(text4_value);
	      text5 = createText("\n\n                ");
	      if (switch_instance0) switch_instance0._fragment.c();
	      text6 = createText("\n        ");
	      div3 = createElement("div");
	      if (switch_instance1) switch_instance1._fragment.c();
	      text7 = createText("\n\n            ");
	      div2 = createElement("div");
	      a = createElement("a");
	      text8 = createText(text8_value);
	      text9 = createText(" ");
	      i = createElement("i");
	      addLoc(h3, file$3, 16, 16, 527);
	      ul.className = "import-methods svelte-oe6wy4";
	      addLoc(ul, file$3, 18, 16, 582);
	      h4.className = "svelte-oe6wy4";
	      addLoc(h4, file$3, 44, 16, 1647);
	      div0.className = "sidebar";
	      addLoc(div0, file$3, 15, 12, 489);
	      div1.className = "span5";
	      addLoc(div1, file$3, 14, 8, 457);
	      i.className = "icon-chevron-right icon-white";
	      addLoc(i, file$3, 54, 36, 2115);
	      a.href = "describe";
	      a.className = "submit btn btn-primary svelte-oe6wy4";
	      a.id = "describe-proceed";
	      addLoc(a, file$3, 53, 16, 2006);
	      div2.className = "buttons pull-right";
	      addLoc(div2, file$3, 52, 12, 1957);
	      div3.className = "span7";
	      addLoc(div3, file$3, 49, 8, 1843);
	      div4.className = "row";
	      div4.style.cssText = div4_style_value = ctx.dragover ? 'opacity: 0.5;filter:blur(6px);background:white;pointer-events:none' : '';
	      addLoc(div4, file$3, 13, 4, 340);
	      addListener(div5, "drop", drop_handler);
	      addListener(div5, "dragover", dragover_handler);
	      addListener(div5, "dragenter", dragenter_handler);
	      addListener(div5, "dragend", dragend_handler);
	      addListener(div5, "dragleave", dragleave_handler);
	      div5.className = "chart-editor dw-create-upload upload-data";
	      addLoc(div5, file$3, 0, 0, 0);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div5, anchor);
	      if (if_block0) if_block0.m(div5, null);
	      append(div5, text0);
	      append(div5, div4);
	      append(div4, div1);
	      append(div1, div0);
	      append(div0, h3);
	      h3.innerHTML = raw_value;
	      append(div0, text1);
	      append(div0, ul);

	      for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
	        each_blocks[i_1].m(ul, null);
	      }

	      append(div0, text2);
	      if (if_block1) if_block1.m(div0, null);
	      append(div0, text3);
	      append(div0, h4);
	      append(h4, text4);
	      append(div0, text5);

	      if (switch_instance0) {
	        switch_instance0._mount(div0, null);
	      }

	      append(div4, text6);
	      append(div4, div3);

	      if (switch_instance1) {
	        switch_instance1._mount(div3, null);
	      }

	      append(div3, text7);
	      append(div3, div2);
	      append(div2, a);
	      append(a, text8);
	      append(a, text9);
	      append(a, i);
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;

	      if (ctx.dragover) {
	        if (!if_block0) {
	          if_block0 = create_if_block_2();
	          if_block0.c();
	          if_block0.m(div5, text0);
	        }
	      } else if (if_block0) {
	        if_block0.d(1);
	        if_block0 = null;
	      }

	      if (changed.active || changed.buttons) {
	        each_value = ctx.buttons;

	        for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
	          var child_ctx = get_each_context$2(ctx, each_value, i_1);

	          if (each_blocks[i_1]) {
	            each_blocks[i_1].p(changed, child_ctx);
	          } else {
	            each_blocks[i_1] = create_each_block$2(component, child_ctx);
	            each_blocks[i_1].c();
	            each_blocks[i_1].m(ul, null);
	          }
	        }

	        for (; i_1 < each_blocks.length; i_1 += 1) {
	          each_blocks[i_1].d(1);
	        }

	        each_blocks.length = each_value.length;
	      }

	      if (ctx.error) {
	        if (if_block1) {
	          if_block1.p(changed, ctx);
	        } else {
	          if_block1 = create_if_block$1(component, ctx);
	          if_block1.c();
	          if_block1.m(div0, text3);
	        }
	      } else if (if_block1) {
	        if_block1.d(1);
	        if_block1 = null;
	      }

	      if (changed.active && text4_value !== (text4_value = ctx.active.longTitle || ctx.active.title)) {
	        setData(text4, text4_value);
	      }

	      var switch_instance0_changes = {};

	      if (!switch_instance0_updating.chartData && changed.chartData) {
	        switch_instance0_changes.chartData = ctx.chartData;
	        switch_instance0_updating.chartData = ctx.chartData !== void 0;
	      }

	      if (!switch_instance0_updating.readonly && changed.readonly) {
	        switch_instance0_changes.readonly = ctx.readonly;
	        switch_instance0_updating.readonly = ctx.readonly !== void 0;
	      }

	      if (!switch_instance0_updating.sheets && changed.sheets) {
	        switch_instance0_changes.sheets = ctx.sheets;
	        switch_instance0_updating.sheets = ctx.sheets !== void 0;
	      }

	      if (!switch_instance0_updating.datasets && changed.datasets) {
	        switch_instance0_changes.datasets = ctx.datasets;
	        switch_instance0_updating.datasets = ctx.datasets !== void 0;
	      }

	      if (switch_value !== (switch_value = ctx.Sidebar)) {
	        if (switch_instance0) {
	          switch_instance0.destroy();
	        }

	        if (switch_value) {
	          switch_instance0 = new switch_value(switch_props(ctx));

	          component.root._beforecreate.push(function () {
	            var changed = {};
	            if (ctx.chartData === void 0) changed.chartData = 1;
	            if (ctx.readonly === void 0) changed.readonly = 1;
	            if (ctx.sheets === void 0) changed.sheets = 1;
	            if (ctx.datasets === void 0) changed.datasets = 1;

	            switch_instance0._bind(changed, switch_instance0.get());
	          });

	          switch_instance0._fragment.c();

	          switch_instance0._mount(div0, null);
	        } else {
	          switch_instance0 = null;
	        }
	      } else if (switch_value) {
	        switch_instance0._set(switch_instance0_changes);

	        switch_instance0_updating = {};
	      }

	      var switch_instance1_changes = {};

	      if (!switch_instance1_updating.chartData && changed.chartData) {
	        switch_instance1_changes.chartData = ctx.chartData;
	        switch_instance1_updating.chartData = ctx.chartData !== void 0;
	      }

	      if (!switch_instance1_updating.readonly && changed.readonly) {
	        switch_instance1_changes.readonly = ctx.readonly;
	        switch_instance1_updating.readonly = ctx.readonly !== void 0;
	      }

	      if (switch_value_1 !== (switch_value_1 = ctx.MainPanel)) {
	        if (switch_instance1) {
	          switch_instance1.destroy();
	        }

	        if (switch_value_1) {
	          switch_instance1 = new switch_value_1(switch_props_1(ctx));

	          component.root._beforecreate.push(function () {
	            var changed = {};
	            if (ctx.chartData === void 0) changed.chartData = 1;
	            if (ctx.readonly === void 0) changed.readonly = 1;

	            switch_instance1._bind(changed, switch_instance1.get());
	          });

	          switch_instance1._fragment.c();

	          switch_instance1._mount(div3, text7);
	        } else {
	          switch_instance1 = null;
	        }
	      } else if (switch_value_1) {
	        switch_instance1._set(switch_instance1_changes);

	        switch_instance1_updating = {};
	      }

	      if (changed.dragover && div4_style_value !== (div4_style_value = ctx.dragover ? 'opacity: 0.5;filter:blur(6px);background:white;pointer-events:none' : '')) {
	        div4.style.cssText = div4_style_value;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div5);
	      }

	      if (if_block0) if_block0.d();
	      destroyEach(each_blocks, detach);
	      if (if_block1) if_block1.d();
	      if (switch_instance0) switch_instance0.destroy();
	      if (switch_instance1) switch_instance1.destroy();
	      removeListener(div5, "drop", drop_handler);
	      removeListener(div5, "dragover", dragover_handler);
	      removeListener(div5, "dragenter", dragenter_handler);
	      removeListener(div5, "dragend", dragend_handler);
	      removeListener(div5, "dragleave", dragleave_handler);
	    }
	  };
	} // (9:4) {#if dragover}


	function create_if_block_2(component, ctx) {
	  var div,
	      raw_value = __('upload / drag-csv-here');

	  return {
	    c: function create() {
	      div = createElement("div");
	      div.className = "draginfo svelte-oe6wy4";
	      addLoc(div, file$3, 9, 4, 247);
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
	} // (23:28) {#if btn.isFileUpload}


	function create_if_block_1$1(component, ctx) {
	  var input;
	  return {
	    c: function create() {
	      input = createElement("input");
	      input._svelte = {
	        component: component,
	        ctx: ctx
	      };
	      addListener(input, "change", change_handler);
	      input.accept = ".csv, .tsv, .txt, .xlsx, .xls, .ods, .dbf";
	      input.className = "file-upload svelte-oe6wy4";
	      setAttribute(input, "type", "file");
	      addLoc(input, file$3, 23, 28, 856);
	    },
	    m: function mount(target, anchor) {
	      insert(target, input, anchor);
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;
	      input._svelte.ctx = ctx;
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(input);
	      }

	      removeListener(input, "change", change_handler);
	    }
	  };
	} // (20:20) {#each buttons as btn}


	function create_each_block$2(component, ctx) {
	  var li,
	      label,
	      text0,
	      i,
	      i_class_value,
	      text1,
	      span,
	      text2_value = ctx.btn.title,
	      text2,
	      li_class_value;
	  var if_block = ctx.btn.isFileUpload && create_if_block_1$1(component, ctx);
	  return {
	    c: function create() {
	      li = createElement("li");
	      label = createElement("label");
	      if (if_block) if_block.c();
	      text0 = createText("\n                            ");
	      i = createElement("i");
	      text1 = createText("\n                            ");
	      span = createElement("span");
	      text2 = createText(text2_value);
	      i.className = i_class_value = "" + ctx.btn.icon + " svelte-oe6wy4";
	      addLoc(i, file$3, 30, 28, 1201);
	      span.className = "svelte-oe6wy4";
	      addLoc(span, file$3, 31, 28, 1256);
	      label.className = "svelte-oe6wy4";
	      addLoc(label, file$3, 21, 24, 769);
	      li._svelte = {
	        component: component,
	        ctx: ctx
	      };
	      addListener(li, "click", click_handler);
	      li.className = li_class_value = "action " + (ctx.active == ctx.btn ? 'active' : '') + " svelte-oe6wy4";
	      addLoc(li, file$3, 20, 20, 673);
	    },
	    m: function mount(target, anchor) {
	      insert(target, li, anchor);
	      append(li, label);
	      if (if_block) if_block.m(label, null);
	      append(label, text0);
	      append(label, i);
	      append(label, text1);
	      append(label, span);
	      append(span, text2);
	    },
	    p: function update(changed, _ctx) {
	      ctx = _ctx;

	      if (ctx.btn.isFileUpload) {
	        if (if_block) {
	          if_block.p(changed, ctx);
	        } else {
	          if_block = create_if_block_1$1(component, ctx);
	          if_block.c();
	          if_block.m(label, text0);
	        }
	      } else if (if_block) {
	        if_block.d(1);
	        if_block = null;
	      }

	      if (changed.buttons && i_class_value !== (i_class_value = "" + ctx.btn.icon + " svelte-oe6wy4")) {
	        i.className = i_class_value;
	      }

	      if (changed.buttons && text2_value !== (text2_value = ctx.btn.title)) {
	        setData(text2, text2_value);
	      }

	      li._svelte.ctx = ctx;

	      if ((changed.active || changed.buttons) && li_class_value !== (li_class_value = "action " + (ctx.active == ctx.btn ? 'active' : '') + " svelte-oe6wy4")) {
	        li.className = li_class_value;
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(li);
	      }

	      if (if_block) if_block.d();
	      removeListener(li, "click", click_handler);
	    }
	  };
	} // (38:16) {#if error}


	function create_if_block$1(component, ctx) {
	  var div1, div0, text_1, raw_before;

	  function click_handler_1(event) {
	    component.set({
	      error: false
	    });
	  }

	  return {
	    c: function create() {
	      div1 = createElement("div");
	      div0 = createElement("div");
	      div0.textContent = "✕";
	      text_1 = createText("\n                    ");
	      raw_before = createElement('noscript');
	      addListener(div0, "click", click_handler_1);
	      div0.className = "action close";
	      addLoc(div0, file$3, 39, 20, 1487);
	      div1.className = "alert alert-error";
	      addLoc(div1, file$3, 38, 16, 1435);
	    },
	    m: function mount(target, anchor) {
	      insert(target, div1, anchor);
	      append(div1, div0);
	      append(div1, text_1);
	      append(div1, raw_before);
	      raw_before.insertAdjacentHTML("afterend", ctx.error);
	    },
	    p: function update(changed, ctx) {
	      if (changed.error) {
	        detachAfter(raw_before);
	        raw_before.insertAdjacentHTML("afterend", ctx.error);
	      }
	    },
	    d: function destroy(detach) {
	      if (detach) {
	        detachNode(div1);
	      }

	      removeListener(div0, "click", click_handler_1);
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
	  this._state = assign(data$3(), options.data);
	  if (!('dragover' in this._state)) console.warn("<App> was created without expected data property 'dragover'");
	  if (!('buttons' in this._state)) console.warn("<App> was created without expected data property 'buttons'");
	  if (!('active' in this._state)) console.warn("<App> was created without expected data property 'active'");
	  if (!('error' in this._state)) console.warn("<App> was created without expected data property 'error'");
	  if (!('Sidebar' in this._state)) console.warn("<App> was created without expected data property 'Sidebar'");
	  if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
	  if (!('readonly' in this._state)) console.warn("<App> was created without expected data property 'readonly'");
	  if (!('sheets' in this._state)) console.warn("<App> was created without expected data property 'sheets'");
	  if (!('datasets' in this._state)) console.warn("<App> was created without expected data property 'datasets'");
	  if (!('MainPanel' in this._state)) console.warn("<App> was created without expected data property 'MainPanel'");
	  this._intro = true;
	  this._fragment = create_main_fragment$3(this, this._state);

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
	assign(App.prototype, methods);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {};

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
	var data$4 = {
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
	  data: data$4,
	  store: store
	};

	return main;

}));
//# sourceMappingURL=upload.js.map
