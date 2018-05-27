(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/highlight', factory) :
	(global.highlight = factory());
}(this, (function () { 'use strict';

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

function detachBetween(before, after) {
	while (before.nextSibling && before.nextSibling !== after) {
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

function init$1(component, options) {
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

/* globals dw */

function __(key, scope='core') {
    return dw.backend.__messages[scope][key] ||
        // fall back to core
        dw.backend.__messages.core[key] || key;
}

/* highlight/App.html generated by Svelte v1.64.0 */
function elements({ $vis }) {
    if (!$vis) return [];
    return $vis.keys().sort().map((key) => {
        const keyLbl = $vis.keyLabel(key);
        return {
            key,
            label: key + (key != keyLbl ? ` (${keyLbl})` : '')
        };
    });
}

function highlightedElements({ highlighted, elements }) {
    const els = _.indexBy(elements, 'key');
    return highlighted.map((k) => {
        return {
            key: k,
            valid: els[k]
        };
    });
}

function data$1() {
    return {
        selected: '---',
        highlighted: []
    };
}

var methods = {
    add (element) {
        const {highlighted} = this.get();
        if (highlighted.indexOf(element) < 0) highlighted.push(element);
        this.set({highlighted});
        setTimeout(() => this.set({selected:'---'}), 30);
    },
    remove (element) {
        const {highlighted} = this.get();
        highlighted.splice(highlighted.indexOf(element), 1);
        this.set({highlighted});
    }
};

function oncreate() {
    this.store.observe('vis', (vis) => {
        if (!vis) return;
        this.set({highlighted: clone(vis.get('highlighted-series')) });
        vis.chart().onChange((chart, key) => {
            if (key == 'metadata.visualize.highlighted-series') {
                this.set({highlighted: clone(vis.get('highlighted-series')) });
            }
        });
    });
    this.observe('highlighted', (hl) => {
        const {vis} = this.store.get();
        if (!vis) return;
        const old = JSON.stringify(vis.get('highlighted-series'));
        if (old != JSON.stringify(hl) && vis) {
            vis.chart().set('metadata.visualize.highlighted-series', clone(hl));
        }
    });
    this.observe('selected', (sel) => {
        if (sel && sel != '---') {
            this.add(sel);
        }
    });
}

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

function create_main_fragment(component, state) {
	var div, label, raw_value = __("Highlight the most import elements (optional)"), text, div_1, select, option, text_1, raw_1_value = __("select element"), raw_1_before, raw_1_after, text_2, select_updating = false, text_4, p;

	var each_value = state.elements;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			element: each_value[i],
			element_index: i
		}));
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ selected: selectValue(select) });
		select_updating = false;
	}

	var each_value_1 = state.highlightedElements;

	var each_1_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_1_blocks[i] = create_each_block_1(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			el: each_value_1[i],
			el_index: i
		}));
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text = createText("\n    ");
			div_1 = createElement("div");
			select = createElement("select");
			option = createElement("option");
			text_1 = createText("- ");
			raw_1_before = createElement('noscript');
			raw_1_after = createElement('noscript');
			text_2 = createText(" -");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_4 = createText("\n    ");
			p = createElement("p");

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			label.className = "separator";
			option.__value = "---";
			option.value = option.__value;
			addListener(select, "change", select_change_handler);
			if (!('selected' in state)) component.root._beforecreate.push(select_change_handler);
			select.id = "highlight-series";
			select.className = "span2";
			p.className = "highlighted-series";
			setStyle(p, "margin-top", "5px");
			div.className = "story-highlight control-group";
			setStyle(div, "clear", "both");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			label.innerHTML = raw_value;
			appendNode(text, div);
			appendNode(div_1, div);
			appendNode(select, div_1);
			appendNode(option, select);
			appendNode(text_1, option);
			appendNode(raw_1_before, option);
			raw_1_before.insertAdjacentHTML("afterend", raw_1_value);
			appendNode(raw_1_after, option);
			appendNode(text_2, option);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.selected);

			appendNode(text_4, div);
			appendNode(p, div);

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].m(p, null);
			}
		},

		p: function update(changed, state) {
			var each_value = state.elements;

			if (changed.elements) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						element: each_value[i],
						element_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block(component, each_context);
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

			var each_value_1 = state.highlightedElements;

			if (changed.highlightedElements) {
				for (var i = 0; i < each_value_1.length; i += 1) {
					var each_1_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						el: each_value_1[i],
						el_index: i
					});

					if (each_1_blocks[i]) {
						each_1_blocks[i].p(changed, each_1_context);
					} else {
						each_1_blocks[i] = create_each_block_1(component, each_1_context);
						each_1_blocks[i].c();
						each_1_blocks[i].m(p, null);
					}
				}

				for (; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].u();
					each_1_blocks[i].d();
				}
				each_1_blocks.length = each_value_1.length;
			}
		},

		u: function unmount() {
			label.innerHTML = '';

			detachBetween(raw_1_before, raw_1_after);

			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);

			destroyEach(each_1_blocks);
		}
	};
}

// (6:12) {#each elements as element}
function create_each_block(component, state) {
	var element = state.element, each_value = state.each_value, element_index = state.element_index;
	var option, text_value = element.label, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = element.key;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			element = state.element;
			each_value = state.each_value;
			element_index = state.element_index;
			if ((changed.elements) && text_value !== (text_value = element.label)) {
				text.data = text_value;
			}

			if ((changed.elements) && option_value_value !== (option_value_value = element.key)) {
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

// (12:8) {#each highlightedElements as el}
function create_each_block_1(component, state) {
	var el = state.el, each_value_1 = state.each_value_1, el_index = state.el_index;
	var span, i, text, text_1_value = el.key, text_1, span_data_series_value, span_class_value, text_2;

	return {
		c: function create() {
			span = createElement("span");
			i = createElement("i");
			text = createText(" ");
			text_1 = createText(text_1_value);
			text_2 = createText("  ");
			this.h();
		},

		h: function hydrate() {
			addListener(i, "click", click_handler);
			i.className = "fa fa-remove";

			i._svelte = {
				component: component,
				each_value_1: state.each_value_1,
				el_index: state.el_index
			};

			span.dataset.series = span_data_series_value = el.key;
			span.className = span_class_value = "badge " + (el.valid ? 'badge-info' : '');
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(i, span);
			appendNode(text, span);
			appendNode(text_1, span);
			insertNode(text_2, target, anchor);
		},

		p: function update(changed, state) {
			el = state.el;
			each_value_1 = state.each_value_1;
			el_index = state.el_index;
			i._svelte.each_value_1 = state.each_value_1;
			i._svelte.el_index = state.el_index;

			if ((changed.highlightedElements) && text_1_value !== (text_1_value = el.key)) {
				text_1.data = text_1_value;
			}

			if ((changed.highlightedElements) && span_data_series_value !== (span_data_series_value = el.key)) {
				span.dataset.series = span_data_series_value;
			}

			if ((changed.highlightedElements) && span_class_value !== (span_class_value = "badge " + (el.valid ? 'badge-info' : ''))) {
				span.className = span_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
			detachNode(text_2);
		},

		d: function destroy$$1() {
			removeListener(i, "click", click_handler);
		}
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var each_value_1 = this._svelte.each_value_1, el_index = this._svelte.el_index, el = each_value_1[el_index];
	component.remove(el.key);
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init$1(this, options);
	this._state = assign(assign(this.store._init(["vis"]), data$1()), options.data);
	this.store._add(this, ["vis"]);
	this._recompute({ $vis: 1, highlighted: 1, elements: 1 }, this._state);
	if (!('highlighted' in this._state)) console.warn("<App> was created without expected data property 'highlighted'");

	if (!('$vis' in this._state)) console.warn("<App> was created without expected data property '$vis'");
	if (!('selected' in this._state)) console.warn("<App> was created without expected data property 'selected'");

	this._handlers.destroy = [removeFromStore];

	var self = this;
	var _oncreate = function() {
		var changed = { highlighted: 1, elements: 1, $vis: 1, selected: 1, highlightedElements: 1 };
		oncreate.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
		callAll(this._oncreate);
	}
}

assign(App.prototype, protoDev);
assign(App.prototype, methods);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('elements' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'elements'");
	if ('highlightedElements' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'highlightedElements'");
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.$vis) {
		if (this._differs(state.elements, (state.elements = elements(state)))) changed.elements = true;
	}

	if (changed.highlighted || changed.elements) {
		if (this._differs(state.highlightedElements, (state.highlightedElements = highlightedElements(state)))) changed.highlightedElements = true;
	}
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
    }
};

function init(app) {
    window.dw.backend
        .on('dataset-loaded', function() {
            app.store.set({dataset: chart.dataset()});
        })
        .on('theme-changed-and-loaded', function() {
            app.store.set({theme: window.dw.theme(chart.get('theme')) });
        })
        .on('backend-vis-loaded', function(vis) {
            app.store.set({vis: vis});
        });
}

var main = { App, store, data, init };

return main;

})));
