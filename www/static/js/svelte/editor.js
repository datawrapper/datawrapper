(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@datawrapper/shared/chart')) :
	typeof define === 'function' && define.amd ? define('svelte/editor', ['@datawrapper/shared/chart'], factory) :
	(global.editor = factory(global.Chart));
}(this, (function (Chart) { 'use strict';

Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;

function noop() {}

function assign(tar, src) {
	for (var k in src) { tar[k] = src[k]; }
	return tar;
}

function insertNode(node, target, anchor) {
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

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = this.get = noop;

	if (detach !== false) { this._fragment.u(); }
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

function fire(eventName, data) {
	var this$1 = this;

	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) { return; }

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			handler.__calling = true;
			handler.call(this$1, data);
			handler.__calling = false;
		}
	}
}

function getDev(key) {
	if (key) { console.warn("`let x = component.get('x')` is deprecated. Use `let { x } = component.get()` instead"); }
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
		if (event.changed[key]) { fn(event.current[key], event.previous && event.previous[key]); }
	});
}

function observeDev(key, callback, options) {
	console.warn("this.observe(key, (newValue, oldValue) => {...}) is deprecated. Use\n\n  // runs before DOM updates\n  this.on('state', ({ changed, current, previous }) => {...});\n\n  // runs after DOM updates\n  this.on('update', ...);\n\n...or add the observe method from the svelte-extras package");

	var c = (key = '' + key).search(/[.[]/);
	if (c > -1) {
		var message =
			'The first argument to component.observe(...) must be the name of a top-level property';
		if (c > 0)
			{ message += ", i.e. '" + key.slice(0, c) + "' rather than '" + key + "'"; }

		throw new Error(message);
	}

	return observe.call(this, key, callback, options);
}

function on(eventName, handler) {
	if (eventName === 'teardown') { return this.on('destroy', handler); }

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) { handlers.splice(index, 1); }
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
	if (this.root._lock) { return; }
	this.root._lock = true;
	callAll(this.root._beforecreate);
	callAll(this.root._oncreate);
	callAll(this.root._aftercreate);
	this.root._lock = false;
}

function _set(newState) {
	var this$1 = this;

	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (this$1._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
	}
	if (!dirty) { return; }

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) { this._bind(changed, this._state); }

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
	while (fns && fns.length) { fns.shift()(); }
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

function _unmount() {
	if (this._fragment) { this._fragment.u(); }
}

function removeFromStore() {
	this.store._remove(this);
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

/* @DEPRECATED: plase use @datawrapper/shared instead */

/* globals dw */

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
 * @export
 * @param {string} key -- the key to be translated, e.g. "signup / hed"
 * @param {string} scope -- the translation scope, e.g. "core" or a plugin name
 * @returns {string} -- the translated text
 */

var dw = window.dw;

function __(key, scope) {
    var arguments$1 = arguments;
    if ( scope === void 0 ) scope = 'core';

    key = key.trim();
    if (!dw.backend.__messages[scope]) { return 'MISSING:' + key; }
    var translation = dw.backend.__messages[scope][key] || dw.backend.__messages.core[key] || key;

    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            var index = i - 1;
            translation = translation.replace('$' + index, arguments$1[i]);
        }
    }

    return translation;
}

/* editor/ChartEditor.html generated by Svelte v1.64.0 */

var EditorNav = './EditorNav.html';

var PublishSidebar = '../publish/PublishSidebar.html';

function data() {
    return {
        datasets: [],
        steps: [
            { id: 'upload', title: __('Upload Data') },
            { id: 'describe', title: __('Check & Describe') },
            { id: 'visualize', title: __('Visualize') },
            { id: 'publish', title: __('Publish & Embed') }
        ]
    };
}
function oncreate() {
    // const {step} = this.get();
    // const { chartJSON } = this.store.get();
    // const chart = new Chart(chartJSON);
    // chart.set({ writable: true });
    // this.store.set({ chart });
}
function create_main_fragment(component, state) {
	var editornav_updating = {}, text, div;

	var editornav_initial_data = {};
	if ('step' in state) {
		editornav_initial_data.active = state.step;
		editornav_updating.active = true;
	}
	if ('maxStep' in state) {
		editornav_initial_data.maxStep = state.maxStep ;
		editornav_updating.maxStep = true;
	}
	if ('steps' in state) {
		editornav_initial_data.steps = state.steps ;
		editornav_updating.steps = true;
	}
	if ('$chart' in state) {
		editornav_initial_data.chart = state.$chart;
		editornav_updating.chart = true;
	}
	var editornav = new EditorNav({
		root: component.root,
		data: editornav_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {}, newStoreState = {};
			if (!editornav_updating.active && changed.active) {
				newState.step = childState.active;
			}

			if (!editornav_updating.maxStep && changed.maxStep) {
				newState.maxStep = childState.maxStep;
			}

			if (!editornav_updating.steps && changed.steps) {
				newState.steps = childState.steps;
			}

			if (!editornav_updating.chart && changed.chart) {
				newStoreState.chart = childState.chart;
			}
			component.store.set(newStoreState);
			component._set(newState);
			editornav_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		editornav._bind({ active: 1, maxStep: 1, steps: 1, chart: 1 }, editornav.get());
	});

	function select_block_type(state) {
		if (state.step=='upload') { return create_if_block; }
		if (state.step=='describe') { return create_if_block_1; }
		if (state.step=='visualize') { return create_if_block_2; }
		if (state.step=='publish') { return create_if_block_3; }
		return create_if_block_4;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			editornav._fragment.c();
			text = createText("\n\n");
			div = createElement("div");
			if_block.c();
		},

		m: function mount(target, anchor) {
			editornav._mount(target, anchor);
			insertNode(text, target, anchor);
			insertNode(div, target, anchor);
			if_block.m(div, null);
		},

		p: function update(changed, state) {
			var editornav_changes = {};
			if (!editornav_updating.active && changed.step) {
				editornav_changes.active = state.step;
				editornav_updating.active = true;
			}
			if (!editornav_updating.maxStep && changed.maxStep) {
				editornav_changes.maxStep = state.maxStep ;
				editornav_updating.maxStep = true;
			}
			if (!editornav_updating.steps && changed.steps) {
				editornav_changes.steps = state.steps ;
				editornav_updating.steps = true;
			}
			if (!editornav_updating.chart && changed.$chart) {
				editornav_changes.chart = state.$chart;
				editornav_updating.chart = true;
			}
			editornav._set(editornav_changes);
			editornav_updating = {};

			if (current_block_type !== (current_block_type = select_block_type(state))) {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(div, null);
			}
		},

		u: function unmount() {
			editornav._unmount();
			detachNode(text);
			detachNode(div);
			if_block.u();
		},

		d: function destroy$$1() {
			editornav.destroy(false);
			if_block.d();
		}
	};
}

// (4:4) {#if step=='upload'}
function create_if_block(component, state) {
	var text;

	return {
		c: function create() {
			text = createText("UPLOAD");
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		u: function unmount() {
			detachNode(text);
		},

		d: noop
	};
}

// (9:30) 
function create_if_block_1(component, state) {
	var text;

	return {
		c: function create() {
			text = createText("DESCRIBE");
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		u: function unmount() {
			detachNode(text);
		},

		d: noop
	};
}

// (9:67) 
function create_if_block_2(component, state) {
	var text;

	return {
		c: function create() {
			text = createText("VISUALIZE");
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		u: function unmount() {
			detachNode(text);
		},

		d: noop
	};
}

// (9:103) 
function create_if_block_3(component, state) {

	var publishsidebar = new PublishSidebar({
		root: component.root
	});

	return {
		c: function create() {
			publishsidebar._fragment.c();
		},

		m: function mount(target, anchor) {
			publishsidebar._mount(target, anchor);
		},

		u: function unmount() {
			publishsidebar._unmount();
		},

		d: function destroy$$1() {
			publishsidebar.destroy(false);
		}
	};
}

// (11:4) {:else}
function create_if_block_4(component, state) {
	var text;

	return {
		c: function create() {
			text = createText(":(");
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		u: function unmount() {
			detachNode(text);
		},

		d: noop
	};
}

function ChartEditor(options) {
	this._debugName = '<ChartEditor>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(assign(this.store._init(["chart"]), data()), options.data);
	this.store._add(this, ["chart"]);
	if (!('step' in this._state)) { console.warn("<ChartEditor> was created without expected data property 'step'"); }
	if (!('maxStep' in this._state)) { console.warn("<ChartEditor> was created without expected data property 'maxStep'"); }
	if (!('steps' in this._state)) { console.warn("<ChartEditor> was created without expected data property 'steps'"); }
	if (!('$chart' in this._state)) { console.warn("<ChartEditor> was created without expected data property '$chart'"); }

	this._handlers.destroy = [removeFromStore];

	var self = this;
	var _oncreate = function() {
		var changed = { step: 1, maxStep: 1, steps: 1, $chart: 1 };
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
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(ChartEditor.prototype, protoDev);

ChartEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

var data$1 = {};

var main = { App: ChartEditor, Chart: Chart, data: data$1 };

return main;

})));
//# sourceMappingURL=editor.js.map
