(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../../../../../../static/vendor/jschardet/jschardet.min.js'), require('../../../../../../static/vendor/xlsx/xlsx.full.min.js')) :
	typeof define === 'function' && define.amd ? define('svelte/upload', ['../../../../../../static/vendor/jschardet/jschardet.min.js', '../../../../../../static/vendor/xlsx/xlsx.full.min.js'], factory) :
	(global.upload = factory(global.jschardet));
}(this, (function (jschardet) { 'use strict';

jschardet = jschardet && jschardet.hasOwnProperty('default') ? jschardet['default'] : jschardet;

function noop() {}

function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
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

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d();
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
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
	this.set = this.get = noop;

	if (detach !== false) this._fragment.u();
	this._fragment.d();
	this._fragment = this._state = null;
}

function destroyDev(detach) {
	destroy.call(this, detach);
	this.destroy = function() {
		console.warn('Component was already destroyed');
	};
}

function _differs(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function _differsImmutable(a, b) {
	return a != a ? b == b : a !== b;
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			handler.__calling = true;
			handler.call(this, data);
			handler.__calling = false;
		}
	}
}

function getDev(key) {
	if (key) console.warn("`let x = component.get('x')` is deprecated. Use `let { x } = component.get()` instead");
	return get.call(this, key);
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function init(component, options) {
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
}

function observe(key, callback, options) {
	var fn = callback.bind(this);

	if (!options || options.init !== false) {
		fn(this.get()[key], undefined);
	}

	return this.on(options && options.defer ? 'update' : 'state', function(event) {
		if (event.changed[key]) fn(event.current[key], event.previous && event.previous[key]);
	});
}

function observeDev(key, callback, options) {
	console.warn("this.observe(key, (newValue, oldValue) => {...}) is deprecated. Use\n\n  // runs before DOM updates\n  this.on('state', ({ changed, current, previous }) => {...});\n\n  // runs after DOM updates\n  this.on('update', ...);\n\n...or add the observe method from the svelte-extras package");

	var c = (key = '' + key).search(/[.[]/);
	if (c > -1) {
		var message =
			'The first argument to component.observe(...) must be the name of a top-level property';
		if (c > 0)
			message += ", i.e. '" + key.slice(0, c) + "' rather than '" + key + "'";

		throw new Error(message);
	}

	return observe.call(this, key, callback, options);
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function onDev(eventName, handler) {
	if (eventName === 'teardown') {
		console.warn(
			"Use component.on('destroy', ...) instead of component.on('teardown', ...) which has been deprecated and will be unsupported in Svelte 2"
		);
		return this.on('destroy', handler);
	}

	return on.call(this, eventName, handler);
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) return;
	this.root._lock = true;
	callAll(this.root._beforecreate);
	callAll(this.root._oncreate);
	callAll(this.root._aftercreate);
	this.root._lock = false;
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		this.fire("state", { changed: changed, current: this._state, previous: oldState });
		this._fragment.p(changed, this._state);
		this.fire("update", { changed: changed, current: this._state, previous: oldState });
	}
}

function setDev(newState) {
	if (typeof newState !== 'object') {
		throw new Error(
			this._debugName + '.set was called without an object of data key-values to update.'
		);
	}

	this._checkReadOnly(newState);
	set.call(this, newState);
}

function callAll(fns) {
	while (fns && fns.length) fns.shift()();
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

function _unmount() {
	if (this._fragment) this._fragment.u();
}

var protoDev = {
	destroy: destroyDev,
	get: getDev,
	fire: fire,
	observe: observeDev,
	on: onDev,
	set: setDev,
	teardown: destroyDev,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount,
	_differs: _differs
};

// quick reference variables for speed access
//-------------------------------------------

// Save bytes in the minified (but not gzipped) version:




// Create quick reference variables for speed access to core prototypes.





// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.




// Naked function reference for surrogate-prototype-swapping.

// `_isArray` : an object's function
// ----------------------------------

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray

function fetchJSON(url, method, credentials, body, callback) {
    var opts = {
        method, body,
        mode: 'cors',
        credentials
    };

    window.fetch(url, opts)
    .then((res) => {
        // console.log('status', res);
        if (res.status != 200) return new Error(res.statusText);
        try {
            return res.json();
        } catch (Error) {
            // could not parse json, so just return text
            return res.text();
        }
    })
    .then(callback)
    .catch((err) => {
        console.error(err);
    });
}



function putJSON(url, body, callback) { return fetchJSON(url, 'PUT', "include", body, callback); }

// `_now` : an utility's function
// -------------------------------

// A (possibly faster) way to get the current timestamp as an integer.
var _now = Date.now || function () {
	return new Date().getTime();
};

// `_throttle` : (ahem) a function's function
// -------------------------------------------

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

/* globals dw */

function __(key, scope='core') {
    return dw.backend.__messages[scope][key] ||
        // fall back to core
        dw.backend.__messages.core[key] || key;
}

/* upload/TextAreaUpload.html generated by Svelte v1.64.0 */
let app$1;
const chart = dw.backend.currentChart;

const updateData = _throttle(() => {
    const {chartData} = app$1.get();
    putJSON(`/api/charts/${chart.get('id')}/data`, chartData);
}, 1000);


function data$2() {
    return {
        placeholder: __("upload / paste here"),
    }
}

function oncreate$1() {
    app$1 = this;
}

function onupdate({changed, current, previous}) {
    if (changed.chartData && current.chartData && previous && previous.chartData != current.chartData) {
        updateData();
    }
}

function create_main_fragment$1(component, state) {
	var form, div, textarea, textarea_updating = false;

	function textarea_input_handler() {
		textarea_updating = true;
		component.set({ chartData: textarea.value });
		textarea_updating = false;
	}

	return {
		c: function create() {
			form = createElement("form");
			div = createElement("div");
			textarea = createElement("textarea");
			this.h();
		},

		h: function hydrate() {
			addListener(textarea, "input", textarea_input_handler);
			textarea.readOnly = state.readonly;
			textarea.id = "upload-data-text";
			setStyle(textarea, "resize", "none");
			textarea.placeholder = state.placeholder;
			textarea.className = "svelte-h5ftni";
			div.className = "control-group";
			form.className = "upload-form";
		},

		m: function mount(target, anchor) {
			insertNode(form, target, anchor);
			appendNode(div, form);
			appendNode(textarea, div);

			textarea.value = state.chartData;
		},

		p: function update(changed, state) {
			if (!textarea_updating) textarea.value = state.chartData;
			if (changed.readonly) {
				textarea.readOnly = state.readonly;
			}

			if (changed.placeholder) {
				textarea.placeholder = state.placeholder;
			}
		},

		u: function unmount() {
			detachNode(form);
		},

		d: function destroy$$1() {
			removeListener(textarea, "input", textarea_input_handler);
		}
	};
}

function TextAreaUpload(options) {
	this._debugName = '<TextAreaUpload>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$2(), options.data);
	if (!('chartData' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'chartData'");
	if (!('readonly' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'readonly'");
	if (!('placeholder' in this._state)) console.warn("<TextAreaUpload> was created without expected data property 'placeholder'");
	this._handlers.update = [onupdate];

	var self = this;
	var _oncreate = function() {
		var changed = { chartData: 1, readonly: 1, placeholder: 1 };
		oncreate$1.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$1(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(TextAreaUpload.prototype, protoDev);

TextAreaUpload.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* upload/UploadHelp.html generated by Svelte v1.64.0 */
/* globals dw */
function datasetsArray({ datasets }) {
    return Object.keys(datasets).map(k => datasets[k]);
}

function data$3() {
    return {
        selectedDataset: '--'
    };
}

function onupdate$1({changed, current}) {
    if (changed.selectedDataset && current.selectedDataset != '--') {
        const sel = current.selectedDataset;
        this.set({chartData: sel.data});
        if (sel.presets) {
            Object.keys(sel.presets).forEach(k => {
                dw.backend.currentChart.set(k, sel.presets[k]);
            });
        }
    }
}

function create_main_fragment$2(component, state) {
	var p, text_value = __("upload / quick help"), text, text_1, div, p_1, text_2_value = __("upload / try a dataset"), text_2, text_3, select, option, text_4_value = __("upload / sample dataset"), text_4, select_updating = false;

	var each_value = state.datasetsArray;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(component, assign(assign({}, state), {
			each_value: each_value,
			group: each_value[i],
			group_index: i
		}));
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ selectedDataset: selectValue(select) });
		select_updating = false;
	}

	return {
		c: function create() {
			p = createElement("p");
			text = createText(text_value);
			text_1 = createText("\n\n");
			div = createElement("div");
			p_1 = createElement("p");
			text_2 = createText(text_2_value);
			text_3 = createText("\n    ");
			select = createElement("select");
			option = createElement("option");
			text_4 = createText(text_4_value);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			option.__value = "--";
			option.value = option.__value;
			addListener(select, "change", select_change_handler);
			if (!('selectedDataset' in state)) component.root._beforecreate.push(select_change_handler);
			select.disabled = state.readonly;
			select.id = "demo-datasets";
			select.className = "svelte-1jdst2k";
			div.className = "demo-datasets";
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			appendNode(text, p);
			insertNode(text_1, target, anchor);
			insertNode(div, target, anchor);
			appendNode(p_1, div);
			appendNode(text_2, p_1);
			appendNode(text_3, div);
			appendNode(select, div);
			appendNode(option, select);
			appendNode(text_4, option);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.selectedDataset);
		},

		p: function update(changed, state) {
			var each_value = state.datasetsArray;

			if (changed.datasetsArray) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						group: each_value[i],
						group_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$1(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) selectOption(select, state.selectedDataset);
			if (changed.readonly) {
				select.disabled = state.readonly;
			}
		},

		u: function unmount() {
			detachNode(p);
			detachNode(text_1);
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
		}
	};
}

// (7:8) {#each datasetsArray as group}
function create_each_block$1(component, state) {
	var group = state.group, each_value = state.each_value, group_index = state.group_index;
	var optgroup, optgroup_label_value;

	var each_value_1 = group.datasets;

	var each_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			dataset: each_value_1[i],
			dataset_index: i
		}));
	}

	return {
		c: function create() {
			optgroup = createElement("optgroup");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			setAttribute(optgroup, "label", optgroup_label_value = group.type);
		},

		m: function mount(target, anchor) {
			insertNode(optgroup, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(optgroup, null);
			}
		},

		p: function update(changed, state) {
			group = state.group;
			each_value = state.each_value;
			group_index = state.group_index;
			var each_value_1 = group.datasets;

			if (changed.datasetsArray) {
				for (var i = 0; i < each_value_1.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						dataset: each_value_1[i],
						dataset_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block_1(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(optgroup, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value_1.length;
			}

			if ((changed.datasetsArray) && optgroup_label_value !== (optgroup_label_value = group.type)) {
				setAttribute(optgroup, "label", optgroup_label_value);
			}
		},

		u: function unmount() {
			detachNode(optgroup);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (9:12) {#each group.datasets as dataset}
function create_each_block_1(component, state) {
	var group = state.group, each_value = state.each_value, group_index = state.group_index, dataset = state.dataset, each_value_1 = state.each_value_1, dataset_index = state.dataset_index;
	var option, text_value = dataset.title, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = dataset;
			option.value = option.__value;
			option.className = "demo-dataset";
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			group = state.group;
			each_value = state.each_value;
			group_index = state.group_index;
			dataset = state.dataset;
			each_value_1 = state.each_value_1;
			dataset_index = state.dataset_index;
			if ((changed.datasetsArray) && text_value !== (text_value = dataset.title)) {
				text.data = text_value;
			}

			if ((changed.datasetsArray) && option_value_value !== (option_value_value = dataset)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

function UploadHelp(options) {
	this._debugName = '<UploadHelp>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$3(), options.data);
	this._recompute({ datasets: 1 }, this._state);
	if (!('datasets' in this._state)) console.warn("<UploadHelp> was created without expected data property 'datasets'");
	if (!('readonly' in this._state)) console.warn("<UploadHelp> was created without expected data property 'readonly'");
	if (!('selectedDataset' in this._state)) console.warn("<UploadHelp> was created without expected data property 'selectedDataset'");
	this._handlers.update = [onupdate$1];

	var self = this;
	var _oncreate = function() {
		var changed = { datasets: 1, readonly: 1, selectedDataset: 1, datasetsArray: 1 };
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$2(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
		callAll(this._oncreate);
	}
}

assign(UploadHelp.prototype, protoDev);

UploadHelp.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('datasetsArray' in newState && !this._updatingReadonlyProperty) throw new Error("<UploadHelp>: Cannot set read-only property 'datasetsArray'");
};

UploadHelp.prototype._recompute = function _recompute(changed, state) {
	if (changed.datasets) {
		if (this._differs(state.datasetsArray, (state.datasetsArray = datasetsArray(state)))) changed.datasetsArray = true;
	}
};

/* upload/SelectSheet.html generated by Svelte v1.64.0 */
/* globals dw */
function data$4() {
    return {
        selected: false,
        sheets: []
    }
}

function onupdate$2({changed, current}) {
    if (changed.sheets && current.sheets.length > 1) {
        setTimeout(() => {
            this.set({selected:current.sheets[0]});
        }, 300);
    } else if (changed.sheets && current.sheets.length == 1) {
        putJSON(`/api/charts/${dw.backend.currentChart.get('id')}/data`, current.sheets[0].csv, () => {
            window.location.href = 'describe';
        });
    }
    if (changed.selected) {
        this.set({chartData: current.selected.csv});
    }
}

function create_main_fragment$3(component, state) {
	var div;

	function select_block_type(state) {
		if (!state.sheets.length) return create_if_block$1;
		if (state.sheets.length>1) return create_if_block_1$1;
		return create_if_block_2$1;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			div = createElement("div");
			if_block.c();
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if_block.m(div, null);
		},

		p: function update(changed, state) {
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(div, null);
			}
		},

		u: function unmount() {
			detachNode(div);
			if_block.u();
		},

		d: function destroy$$1() {
			if_block.d();
		}
	};
}

// (7:8) {#each sheets as sheet}
function create_each_block$2(component, state) {
	var sheet = state.sheet, each_value = state.each_value, sheet_index = state.sheet_index;
	var option, text_value = sheet.name, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = sheet;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			sheet = state.sheet;
			each_value = state.each_value;
			sheet_index = state.sheet_index;
			if ((changed.sheets) && text_value !== (text_value = sheet.name)) {
				text.data = text_value;
			}

			if ((changed.sheets) && option_value_value !== (option_value_value = sheet)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (2:4) {#if !sheets.length}
function create_if_block$1(component, state) {
	var div, raw_value = __('upload / parsing-xls');

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "alert alert-info";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			div.innerHTML = raw_value;
		},

		p: noop,

		u: function unmount() {
			div.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

// (4:29) 
function create_if_block_1$1(component, state) {
	var p, text_value = __("upload / select sheet"), text, text_1, select, select_updating = false, select_disabled_value;

	var each_value = state.sheets;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(component, assign(assign({}, state), {
			each_value: each_value,
			sheet: each_value[i],
			sheet_index: i
		}));
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ selected: selectValue(select) });
		select_updating = false;
	}

	return {
		c: function create() {
			p = createElement("p");
			text = createText(text_value);
			text_1 = createText("\n    ");
			select = createElement("select");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			addListener(select, "change", select_change_handler);
			if (!('selected' in state)) component.root._beforecreate.push(select_change_handler);
			select.disabled = select_disabled_value = !state.sheets.length;
			select.className = "svelte-1jdst2k";
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			appendNode(text, p);
			insertNode(text_1, target, anchor);
			insertNode(select, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.selected);
		},

		p: function update(changed, state) {
			var each_value = state.sheets;

			if (changed.sheets) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						sheet: each_value[i],
						sheet_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$2(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) selectOption(select, state.selected);
			if ((changed.sheets) && select_disabled_value !== (select_disabled_value = !state.sheets.length)) {
				select.disabled = select_disabled_value;
			}
		},

		u: function unmount() {
			detachNode(p);
			detachNode(text_1);
			detachNode(select);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
		}
	};
}

// (11:4) {:else}
function create_if_block_2$1(component, state) {
	var p, raw_value = __('upload / xls / uploading data');

	return {
		c: function create() {
			p = createElement("p");
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			p.innerHTML = raw_value;
		},

		p: noop,

		u: function unmount() {
			p.innerHTML = '';

			detachNode(p);
		},

		d: noop
	};
}

function SelectSheet(options) {
	this._debugName = '<SelectSheet>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$4(), options.data);
	if (!('sheets' in this._state)) console.warn("<SelectSheet> was created without expected data property 'sheets'");
	if (!('selected' in this._state)) console.warn("<SelectSheet> was created without expected data property 'selected'");
	this._handlers.update = [onupdate$2];

	var self = this;
	var _oncreate = function() {
		var changed = { sheets: 1, selected: 1 };
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$3(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
		callAll(this._oncreate);
	}
}

assign(SelectSheet.prototype, protoDev);

SelectSheet.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* global Uint8Array,jschardet */

function readFile(file, callback) {

    var reader = new FileReader();
    reader.onload = function() {
        try {
            var array = new Uint8Array(reader.result);
            var string = "";
            for (var i = 0; i < array.length; ++i) {
                string += String.fromCharCode(array[i]);
            }
            let res = jschardet.detect(string);
            reader = new FileReader();
            reader.onload = () => callback(null, reader.result);
            reader.readAsText(file, res.encoding);
        } catch (e) {
            console.warn(e);
            callback(null, reader.result);
        }
    };
    reader.readAsArrayBuffer(file);
}

/* global XLSX */
function readSpreadsheet(file, callback) {
    const rABS = typeof FileReader !== "undefined" && (FileReader.prototype||{}).readAsBinaryString;
    const reader = new FileReader();

    reader.onload = function() {
        try {
            const data = !rABS ? new Uint8Array(reader.result) : reader.result;
            const wb = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
            callback(null, wb.SheetNames.map(n => {
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

/* upload/App.html generated by Svelte v1.64.0 */
let app;

const coreUploads = [{
    id: 'copy',
    title: __('upload / copy-paste'),
    longTitle: __('upload / copy-paste / long'),
    icon: 'fa fa-clipboard',
    mainPanel: TextAreaUpload,
    sidebar: UploadHelp,
    action() {}
},{
    id: 'upload',
    title: __('upload / upload-csv'),
    longTitle: __('upload / upload-csv / long'),
    icon: 'fa-file-excel-o fa',
    mainPanel: TextAreaUpload,
    sidebar: UploadHelp,
    isFileUpload: true,
    onFileUpload(event) {
        const file = event.target.files[0];
        if (file.type.substr(0,5) == 'text/') {
            app.set({Sidebar: UploadHelp});
            readFile(file, (err, result) => {
                putJSON(`/api/charts/${dw.backend.currentChart.get('id')}/data`, result, () => {
                    window.location.href = 'describe';
                });
            });
        } else if (file.type.substr(0,12) == 'application/') {
            app.set({Sidebar: SelectSheet, sheets:[]}); // reset
            readSpreadsheet(file, (err, sheets) => {
                if (err) return app.set({error: err});
                app.set({sheets});
            });
        } else {
            app.set({error: __('upload / csv-required')});
        }
    },
    action() {}
}];

function data$1() {
    return {
        dragover: false,
        MainPanel: TextAreaUpload,
        Sidebar: UploadHelp,
        active: coreUploads[0],
        buttons: coreUploads,
        sheets: []
    }
}

var methods = {
    addButton (btn) {
        coreUploads.push(btn);
        this.set({buttons:coreUploads});
        const {defaultMethod} = this.get();
        if (btn.id == defaultMethod) {
            this.btnAction(btn);
        }
    },
    btnAction (btn) {
        this.set({active:btn});
        if (btn.id == 'copy') {
            // turn off externalData, if still set
            const {dw_chart} = this.store.get();
            if (dw_chart.get('externalData')) {
                dw_chart.set('externalData', '');
                setTimeout(() => {
                    dw.backend.currentChart.save();
                }, 1000);
            }
        }
        let activeKey = btn.id;
        if (btn.id == 'upload') {
            activeKey = 'copy';
            setTimeout(() => {
            // reset after 1sec
                // this.set({active:coreUploads[0]});
            }, 1000);
        }
        const {dw_chart} = this.store.get();
        dw_chart.set('metadata.data.upload-method', activeKey);
        if (btn.action) btn.action();
        if (btn.mainPanel) this.set({MainPanel:btn.mainPanel});
        if (btn.sidebar) this.set({Sidebar:btn.sidebar});
    },
    btnUpload (btn, event) {
        if (btn.onFileUpload) btn.onFileUpload(event);
    },
    dragStart (event) {
        const {active} = this.get();
        if (active.id == 'copy') {
            event.preventDefault();
            this.set({dragover:true});
        }
    },
    resetDrag () {
        this.set({dragover:false});
    },
    onFileDrop (event) {
        const {active} = this.get();
        if (active.id != 'copy') return;
        // Prevent default behavior (Prevent file from being opened)
        this.resetDrag();
        event.preventDefault();
        const files = [];
        if (event.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i=0; i<event.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (event.dataTransfer.items[i].kind === 'file') {
                    files.push(event.dataTransfer.items[i].getAsFile());
                }
            }
            event.dataTransfer.items.clear();
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i=0; i<event.dataTransfer.files.length; i++) {
                files.push(event.dataTransfer.files[i]);
            }
            event.dataTransfer.items.clear();
        }
        for (let i=0; i<files.length; i++) {
            if (files[i].type.substr(0,5) == 'text/') {
                return readFile(files[i], (err, result) => {
                    putJSON(`/api/charts/${dw.backend.currentChart.get('id')}/data`, result, () => {
                        window.location.href = 'describe';
                    });
                });
            }
        }
    }
};

function oncreate() {
    app = this;
    const {dw_chart} = this.store.get();
    const method = dw_chart.get('metadata.data.upload-method', 'copy');
    this.set({defaultMethod: method});
    coreUploads.forEach(u => {
        if (u.id == method) {
            this.set({active:u});
        }
    });
}

function create_main_fragment(component, state) {
	var div, text, div_1, div_2, div_3, h3, raw_value = __('upload / title'), text_1, ul, text_2, text_3, h4, text_4_value = state.active.longTitle || state.active.title, text_4, text_5, switch_instance_updating = {}, text_8, div_4, switch_instance_1_updating = {}, text_9, div_5, a, text_10_value = __("Proceed"), text_10, text_11, i, div_1_style_value;

	var if_block = (state.dragover) && create_if_block(component, state);

	var each_value = state.buttons;

	var each_blocks = [];

	for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
		each_blocks[i_1] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			btn: each_value[i_1],
			btn_index: i_1
		}));
	}

	var if_block_1 = (state.error) && create_if_block_2(component, state);

	var switch_value = state.Sidebar;

	function switch_props(state) {
		var switch_instance_initial_data = {};
		if ('chartData' in state) {
			switch_instance_initial_data.chartData = state.chartData
                    ;
			switch_instance_updating.chartData = true;
		}
		if ('readonly' in state) {
			switch_instance_initial_data.readonly = state.readonly
                    ;
			switch_instance_updating.readonly = true;
		}
		if ('sheets' in state) {
			switch_instance_initial_data.sheets = state.sheets
                    ;
			switch_instance_updating.sheets = true;
		}
		if ('datasets' in state) {
			switch_instance_initial_data.datasets = state.datasets ;
			switch_instance_updating.datasets = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!switch_instance_updating.chartData && changed.chartData) {
					newState.chartData = childState.chartData;
				}

				if (!switch_instance_updating.readonly && changed.readonly) {
					newState.readonly = childState.readonly;
				}

				if (!switch_instance_updating.sheets && changed.sheets) {
					newState.sheets = childState.sheets;
				}

				if (!switch_instance_updating.datasets && changed.datasets) {
					newState.datasets = childState.datasets;
				}
				component._set(newState);
				switch_instance_updating = {};
			}
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(state));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ chartData: 1, readonly: 1, sheets: 1, datasets: 1 }, switch_instance.get());
		});
	}

	var switch_value_1 = state.MainPanel;

	function switch_props_1(state) {
		var switch_instance_1_initial_data = {};
		if ('chartData' in state) {
			switch_instance_1_initial_data.chartData = state.chartData
                ;
			switch_instance_1_updating.chartData = true;
		}
		if ('readonly' in state) {
			switch_instance_1_initial_data.readonly = state.readonly ;
			switch_instance_1_updating.readonly = true;
		}
		return {
			root: component.root,
			data: switch_instance_1_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!switch_instance_1_updating.chartData && changed.chartData) {
					newState.chartData = childState.chartData;
				}

				if (!switch_instance_1_updating.readonly && changed.readonly) {
					newState.readonly = childState.readonly;
				}
				component._set(newState);
				switch_instance_1_updating = {};
			}
		};
	}

	if (switch_value_1) {
		var switch_instance_1 = new switch_value_1(switch_props_1(state));

		component.root._beforecreate.push(function() {
			switch_instance_1._bind({ chartData: 1, readonly: 1 }, switch_instance_1.get());
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
			div = createElement("div");
			if (if_block) if_block.c();
			text = createText("\n    ");
			div_1 = createElement("div");
			div_2 = createElement("div");
			div_3 = createElement("div");
			h3 = createElement("h3");
			text_1 = createText("\n\n                ");
			ul = createElement("ul");

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].c();
			}

			text_2 = createText("\n\n                ");
			if (if_block_1) if_block_1.c();
			text_3 = createText("\n\n                ");
			h4 = createElement("h4");
			text_4 = createText(text_4_value);
			text_5 = createText("\n\n                ");
			if (switch_instance) switch_instance._fragment.c();
			text_8 = createText("\n        ");
			div_4 = createElement("div");
			if (switch_instance_1) switch_instance_1._fragment.c();
			text_9 = createText("\n\n            ");
			div_5 = createElement("div");
			a = createElement("a");
			text_10 = createText(text_10_value);
			text_11 = createText(" ");
			i = createElement("i");
			this.h();
		},

		h: function hydrate() {
			ul.className = "import-methods svelte-oe6wy4";
			div_3.className = "sidebar";
			div_2.className = "span5";
			i.className = "icon-chevron-right icon-white";
			a.href = "describe";
			a.className = "submit btn btn-primary";
			a.id = "describe-proceed";
			div_5.className = "buttons pull-right";
			div_4.className = "span7";
			div_1.className = "row";
			div_1.style.cssText = div_1_style_value = state.dragover?'opacity: 0.5;filter:blur(6px);background:white;pointer-events:none':'';
			addListener(div, "drop", drop_handler);
			addListener(div, "dragover", dragover_handler);
			addListener(div, "dragenter", dragenter_handler);
			addListener(div, "dragend", dragend_handler);
			addListener(div, "dragleave", dragleave_handler);
			div.className = "chart-editor dw-create-upload upload-data";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) if_block.m(div, null);
			appendNode(text, div);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			appendNode(div_3, div_2);
			appendNode(h3, div_3);
			h3.innerHTML = raw_value;
			appendNode(text_1, div_3);
			appendNode(ul, div_3);

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].m(ul, null);
			}

			appendNode(text_2, div_3);
			if (if_block_1) if_block_1.m(div_3, null);
			appendNode(text_3, div_3);
			appendNode(h4, div_3);
			appendNode(text_4, h4);
			appendNode(text_5, div_3);

			if (switch_instance) {
				switch_instance._mount(div_3, null);
			}

			appendNode(text_8, div_1);
			appendNode(div_4, div_1);

			if (switch_instance_1) {
				switch_instance_1._mount(div_4, null);
			}

			appendNode(text_9, div_4);
			appendNode(div_5, div_4);
			appendNode(a, div_5);
			appendNode(text_10, a);
			appendNode(text_11, a);
			appendNode(i, a);
		},

		p: function update(changed, state) {
			if (state.dragover) {
				if (!if_block) {
					if_block = create_if_block(component, state);
					if_block.c();
					if_block.m(div, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			var each_value = state.buttons;

			if (changed.buttons || changed.active) {
				for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						btn: each_value[i_1],
						btn_index: i_1
					});

					if (each_blocks[i_1]) {
						each_blocks[i_1].p(changed, each_context);
					} else {
						each_blocks[i_1] = create_each_block(component, each_context);
						each_blocks[i_1].c();
						each_blocks[i_1].m(ul, null);
					}
				}

				for (; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].u();
					each_blocks[i_1].d();
				}
				each_blocks.length = each_value.length;
			}

			if (state.error) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_2(component, state);
					if_block_1.c();
					if_block_1.m(div_3, text_3);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			if ((changed.active) && text_4_value !== (text_4_value = state.active.longTitle || state.active.title)) {
				text_4.data = text_4_value;
			}

			if (switch_value !== (switch_value = state.Sidebar)) {
				if (switch_instance) switch_instance.destroy();

				if (switch_value) {
					switch_instance = new switch_value(switch_props(state));
					switch_instance._fragment.c();
					switch_instance._mount(div_3, null);
				}
			}

			else {
				var switch_instance_changes = {};
				if (!switch_instance_updating.chartData && changed.chartData) {
					switch_instance_changes.chartData = state.chartData
                    ;
					switch_instance_updating.chartData = true;
				}
				if (!switch_instance_updating.readonly && changed.readonly) {
					switch_instance_changes.readonly = state.readonly
                    ;
					switch_instance_updating.readonly = true;
				}
				if (!switch_instance_updating.sheets && changed.sheets) {
					switch_instance_changes.sheets = state.sheets
                    ;
					switch_instance_updating.sheets = true;
				}
				if (!switch_instance_updating.datasets && changed.datasets) {
					switch_instance_changes.datasets = state.datasets ;
					switch_instance_updating.datasets = true;
				}
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}

			if (switch_value_1 !== (switch_value_1 = state.MainPanel)) {
				if (switch_instance_1) switch_instance_1.destroy();

				if (switch_value_1) {
					switch_instance_1 = new switch_value_1(switch_props_1(state));
					switch_instance_1._fragment.c();
					switch_instance_1._mount(div_4, text_9);
				}
			}

			else {
				var switch_instance_1_changes = {};
				if (!switch_instance_1_updating.chartData && changed.chartData) {
					switch_instance_1_changes.chartData = state.chartData
                ;
					switch_instance_1_updating.chartData = true;
				}
				if (!switch_instance_1_updating.readonly && changed.readonly) {
					switch_instance_1_changes.readonly = state.readonly ;
					switch_instance_1_updating.readonly = true;
				}
				switch_instance_1._set(switch_instance_1_changes);
				switch_instance_1_updating = {};
			}

			if ((changed.dragover) && div_1_style_value !== (div_1_style_value = state.dragover?'opacity: 0.5;filter:blur(6px);background:white;pointer-events:none':'')) {
				div_1.style.cssText = div_1_style_value;
			}
		},

		u: function unmount() {
			h3.innerHTML = '';

			detachNode(div);
			if (if_block) if_block.u();

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].u();
			}

			if (if_block_1) if_block_1.u();
		},

		d: function destroy$$1() {
			if (if_block) if_block.d();

			destroyEach(each_blocks);

			if (if_block_1) if_block_1.d();
			if (switch_instance) switch_instance.destroy(false);
			if (switch_instance_1) switch_instance_1.destroy(false);
			removeListener(div, "drop", drop_handler);
			removeListener(div, "dragover", dragover_handler);
			removeListener(div, "dragenter", dragenter_handler);
			removeListener(div, "dragend", dragend_handler);
			removeListener(div, "dragleave", dragleave_handler);
		}
	};
}

// (2:4) {#if dragover}
function create_if_block(component, state) {
	var div, raw_value = __('upload / drag-csv-here');

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "draginfo svelte-oe6wy4";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			div.innerHTML = raw_value;
		},

		u: function unmount() {
			div.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

// (13:20) {#each buttons as btn}
function create_each_block(component, state) {
	var btn = state.btn, each_value = state.each_value, btn_index = state.btn_index;
	var li, label, text, i, i_class_value, text_1, span, text_2_value = btn.title, text_2, li_class_value;

	var if_block = (btn.isFileUpload) && create_if_block_1(component, state);

	return {
		c: function create() {
			li = createElement("li");
			label = createElement("label");
			if (if_block) if_block.c();
			text = createText("\n                            ");
			i = createElement("i");
			text_1 = createText("\n                            ");
			span = createElement("span");
			text_2 = createText(text_2_value);
			this.h();
		},

		h: function hydrate() {
			i.className = i_class_value = "" + btn.icon + " svelte-oe6wy4";
			span.className = "svelte-oe6wy4";
			label.className = "svelte-oe6wy4";
			addListener(li, "click", click_handler);
			li.className = li_class_value = "action " + (state.active==btn?'active':'') + " svelte-oe6wy4";

			li._svelte = {
				component: component,
				each_value: state.each_value,
				btn_index: state.btn_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(label, li);
			if (if_block) if_block.m(label, null);
			appendNode(text, label);
			appendNode(i, label);
			appendNode(text_1, label);
			appendNode(span, label);
			appendNode(text_2, span);
		},

		p: function update(changed, state) {
			btn = state.btn;
			each_value = state.each_value;
			btn_index = state.btn_index;
			if (btn.isFileUpload) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block_1(component, state);
					if_block.c();
					if_block.m(label, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if ((changed.buttons) && i_class_value !== (i_class_value = "" + btn.icon + " svelte-oe6wy4")) {
				i.className = i_class_value;
			}

			if ((changed.buttons) && text_2_value !== (text_2_value = btn.title)) {
				text_2.data = text_2_value;
			}

			if ((changed.active || changed.buttons) && li_class_value !== (li_class_value = "action " + (state.active==btn?'active':'') + " svelte-oe6wy4")) {
				li.className = li_class_value;
			}

			li._svelte.each_value = state.each_value;
			li._svelte.btn_index = state.btn_index;
		},

		u: function unmount() {
			detachNode(li);
			if (if_block) if_block.u();
		},

		d: function destroy$$1() {
			if (if_block) if_block.d();
			removeListener(li, "click", click_handler);
		}
	};
}

// (16:28) {#if btn.isFileUpload}
function create_if_block_1(component, state) {
	var btn = state.btn, each_value = state.each_value, btn_index = state.btn_index;
	var input;

	return {
		c: function create() {
			input = createElement("input");
			this.h();
		},

		h: function hydrate() {
			addListener(input, "change", change_handler);
			input.accept = ".csv, .tsv, .txt, .xlsx, .xls, .ods, .dbf";
			input.className = "file-upload svelte-oe6wy4";
			setAttribute(input, "type", "file");

			input._svelte = {
				component: component,
				each_value: state.each_value,
				btn_index: state.btn_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
		},

		p: function update(changed, state) {
			btn = state.btn;
			each_value = state.each_value;
			btn_index = state.btn_index;
			input._svelte.each_value = state.each_value;
			input._svelte.btn_index = state.btn_index;
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "change", change_handler);
		}
	};
}

// (26:16) {#if error}
function create_if_block_2(component, state) {
	var div, div_1, text_1, raw_before;

	function click_handler_1(event) {
		component.set({error:false});
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_1.textContent = "✕";
			text_1 = createText("\n                    ");
			raw_before = createElement('noscript');
			this.h();
		},

		h: function hydrate() {
			addListener(div_1, "click", click_handler_1);
			div_1.className = "action close";
			div.className = "alert alert-error";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(text_1, div);
			appendNode(raw_before, div);
			raw_before.insertAdjacentHTML("afterend", state.error);
		},

		p: function update(changed, state) {
			if (changed.error) {
				detachAfter(raw_before);
				raw_before.insertAdjacentHTML("afterend", state.error);
			}
		},

		u: function unmount() {
			detachAfter(raw_before);

			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div_1, "click", click_handler_1);
		}
	};
}

function change_handler(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, btn_index = this._svelte.btn_index, btn = each_value[btn_index];
	component.btnUpload(btn, event);
}

function click_handler(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, btn_index = this._svelte.btn_index, btn = each_value[btn_index];
	component.btnAction(btn);
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$1(), options.data);
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

	var self = this;
	var _oncreate = function() {
		var changed = { dragover: 1, buttons: 1, active: 1, error: 1, Sidebar: 1, chartData: 1, readonly: 1, sheets: 1, datasets: 1, MainPanel: 1 };
		oncreate.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(App.prototype, protoDev);
assign(App.prototype, methods);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

function Store(state, options) {
	this._observers = { pre: blankObject(), post: blankObject() };
	this._handlers = {};
	this._dependents = [];

	this._computed = blankObject();
	this._sortedComputedProperties = [];

	this._state = assign({}, state);
	this._differs = options && options.immutable ? _differsImmutable : _differs;
}

assign(Store.prototype, {
	_add: function(component, props) {
		this._dependents.push({
			component: component,
			props: props
		});
	},

	_init: function(props) {
		var state = {};
		for (var i = 0; i < props.length; i += 1) {
			var prop = props[i];
			state['$' + prop] = this._state[prop];
		}
		return state;
	},

	_remove: function(component) {
		var i = this._dependents.length;
		while (i--) {
			if (this._dependents[i].component === component) {
				this._dependents.splice(i, 1);
				return;
			}
		}
	},

	_sortComputedProperties: function() {
		var computed = this._computed;
		var sorted = this._sortedComputedProperties = [];
		var cycles;
		var visited = blankObject();

		function visit(key) {
			if (cycles[key]) {
				throw new Error('Cyclical dependency detected');
			}

			if (visited[key]) return;
			visited[key] = true;

			var c = computed[key];

			if (c) {
				cycles[key] = true;
				c.deps.forEach(visit);
				sorted.push(c);
			}
		}

		for (var key in this._computed) {
			cycles = blankObject();
			visit(key);
		}
	},

	compute: function(key, deps, fn) {
		var store = this;
		var value;

		var c = {
			deps: deps,
			update: function(state, changed, dirty) {
				var values = deps.map(function(dep) {
					if (dep in changed) dirty = true;
					return state[dep];
				});

				if (dirty) {
					var newValue = fn.apply(null, values);
					if (store._differs(newValue, value)) {
						value = newValue;
						changed[key] = true;
						state[key] = value;
					}
				}
			}
		};

		c.update(this._state, {}, true);

		this._computed[key] = c;
		this._sortComputedProperties();
	},

	fire: fire,

	get: get,

	// TODO remove this method
	observe: observe,

	on: on,

	onchange: function(callback) {
		// TODO remove this method
		console.warn("store.onchange is deprecated in favour of store.on('state', event => {...})");

		return this.on('state', function(event) {
			callback(event.current, event.changed);
		});
	},

	set: function(newState) {
		var oldState = this._state,
			changed = this._changed = {},
			dirty = false;

		for (var key in newState) {
			if (this._computed[key]) throw new Error("'" + key + "' is a read-only property");
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);

		for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
			this._sortedComputedProperties[i].update(this._state, changed);
		}

		this.fire('state', {
			changed: changed,
			current: this._state,
			previous: oldState
		});

		var dependents = this._dependents.slice(); // guard against mutations
		for (var i = 0; i < dependents.length; i += 1) {
			var dependent = dependents[i];
			var componentState = {};
			dirty = false;

			for (var j = 0; j < dependent.props.length; j += 1) {
				var prop = dependent.props[j];
				if (prop in changed) {
					componentState['$' + prop] = this._state[prop];
					dirty = true;
				}
			}

			if (dirty) dependent.component.set(componentState);
		}

		this.fire('update', {
			changed: changed,
			current: this._state,
			previous: oldState
		});
	}
});

const store = new Store({});

const data = {
    chart: {
        id: ''
    },
    readonly: false,
    chartData: '',
    transpose: false,
    firstRowIsHeader: true,
    skipRows: 0
};

var main = { App, store, data };

return main;

})));
