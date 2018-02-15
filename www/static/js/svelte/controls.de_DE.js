(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chroma')) :
	typeof define === 'function' && define.amd ? define(['chroma'], factory) :
	(global.controls = factory(global.chroma));
}(this, (function (chroma) { 'use strict';

chroma = chroma && chroma.hasOwnProperty('default') ? chroma['default'] : chroma;

function noop() {}

function assign(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
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

function reinsertChildren(parent, target) {
	while (parent.firstChild) target.appendChild(parent.firstChild);
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

function createComment() {
	return document.createComment('');
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

function toNumber(value) {
	return value === '' ? undefined : +value;
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

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function init(component, options) {
	component._observers = { pre: blankObject(), post: blankObject() };
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function observeDev(key, callback, options) {
	var c = (key = '' + key).search(/[^\w]/);
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
		if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign({}, oldState, newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
		this._fragment.p(changed, this._state);
		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
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
	while (fns && fns.length) fns.pop()();
}

function _mount(target, anchor) {
	this._fragment.m(target, anchor);
}

function _unmount() {
	if (this._fragment) this._fragment.u();
}

function removeFromStore() {
	this.store._remove(this);
}

var protoDev = {
	destroy: destroyDev,
	get: get,
	fire: fire,
	observe: observeDev,
	on: onDev,
	set: setDev,
	teardown: destroyDev,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount
};

/* controls/Checkbox.html generated by Svelte v1.53.0 */
function create_main_fragment(state, component) {
	var div, label, input, text, text_1;

	function input_change_handler() {
		component.set({ value: input.checked });
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			input = createElement("input");
			text = createText(" ");
			text_1 = createText(state.label);
			this.h();
		},

		h: function hydrate() {
			addListener(input, "change", input_change_handler);
			input.type = "checkbox";
			label.className = "checkbox";
			setStyle(label, "text-align", "left");
			setStyle(label, "width", "100%");
			setStyle(label, "position", "relative");
			setStyle(label, "left", "0");
			div.className = "control-group vis-option-group vis-option-type-checkbox";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			appendNode(input, label);

			input.checked = state.value;

			appendNode(text, label);
			appendNode(text_1, label);
		},

		p: function update(changed, state) {
			input.checked = state.value;
			if (changed.label) {
				text_1.data = state.label;
			}
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(input, "change", input_change_handler);
		}
	};
}

function Checkbox(options) {
	this._debugName = '<Checkbox>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign({}, options.data);
	if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
	if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);
	}
}

assign(Checkbox.prototype, protoDev);

Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* controls/ColorPicker.html generated by Svelte v1.53.0 */
let ref;

function gradient_l(color) {
    const lch = chroma(color).lch();
    const sample = spread(70, 55, 7, 6).map((l) => chroma.lch(l, lch[1], lch[2]).hex());
    return chroma.scale(['#000000'].concat(sample).concat('#ffffff'))
        .mode('lch')
        .gamma(0.8)
        .padding(0.1)
        .colors(14);
}

function gradient_c(color, palette) {
    let high = chroma(color).set('lch.c', 120);
    if (isNaN(high.get('lch.h'))) {
        high = chroma.lch(high.get('lch.l'), 50, chroma(palette[0]).get('lch.h'));
    }
    const low = chroma(color).set('lch.c', 3);
    return chroma.scale([low, high])
        .mode('lch')
        .gamma(1.2)
        .colors(14);
}

function gradient_h(color) {
    const lch = chroma(color).lch();
    const sample = spread(lch[2], 75, 7, 6)
        .map((h) => chroma.lch(lch[0], lch[1], h).hex());
    return chroma.scale(sample)
        .mode('lch')
        .colors(14);
}

function nearest_l(color, gradient_l) { return findNearest(gradient_l, color); }

function nearest_c(color, gradient_c) { return findNearest(gradient_c, color); }

function nearest_h(color, gradient_h) { return findNearest(gradient_h, color); }

function textColor(color) {
    return chroma(color).get('lab.l') > 60 ? 'black' : 'white';
}

function borderColor(color) {
    return chroma(color).darker().hex();
}

function data() {
    return {
        palette: [],
        color: '#63c0de',
        visible: false
    };
}

var methods = {
    bodyClick (event) {
        if (!ref.get) return;
        const {visible} = ref.get();
        let el = event.target;
        if (visible) {
            while (!el.classList.contains('color-picker-cont') &&
                el.nodeName.toLowerCase() != 'body') {
                el = el.parentNode;
            }
            ref.set({visible: el != window.document.body});
        }
    }
};

function oncreate() {
    const me = this;
    me.observe('color', (color) => {
        me.fire('change', color);
    });
    ref = this;
    window.document.body.addEventListener('click', this.bodyClick);
}

function ondestroy() {
    window.document.body.removeEventListener('click', this.bodyClick);
}

function findNearest(colors, color) {
    let nearest_i = -1;
    let nearest_dist = 999999;
    if (colors[0] == colors[1]) return '-';
    colors.forEach((c,i) => {
        const dist = chroma.distance(c, color, 'lab');
        if (dist < nearest_dist) {
            nearest_dist = dist;
            nearest_i = i;
        }
    });
    return colors[nearest_i];
}

function spread(center, width, num, num2, exp) {
    var r = [center], s = width / num, a = 0;
    num2 = _.isUndefined(num2) ? num : num2;
    exp = exp || 1;
    while (num-- > 0) {
        a += s;
        r.unshift(center - a);
        if (num2-- > 0) r.push(center + a);
    }
    return r;
}

function encapsulateStyles(node) {
	setAttribute(node, "svelte-1718989465", "");
}

function create_main_fragment$1(state, component) {
	var div, div_1, text_1;

	function click_handler(event) {
		component.set({visible:true});
	}

	var if_block = (state.visible && state.color) && create_if_block(state, component);

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_1.innerHTML = "<div class=\"arrow\"></div>";
			text_1 = createText("\n    ");
			if (if_block) if_block.c();
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(div);
			div_1.className = "base-color-picker color-picker";
			setStyle(div_1, "background", "" + state.color + " none repeat scroll 0% 0%");
			addListener(div_1, "click", click_handler);
			div.className = "color-picker-cont";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(text_1, div);
			if (if_block) if_block.m(div, null);
		},

		p: function update(changed, state) {
			if (changed.color) {
				setStyle(div_1, "background", "" + state.color + " none repeat scroll 0% 0%");
			}

			if (state.visible && state.color) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block(state, component);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) if_block.u();
		},

		d: function destroy$$1() {
			removeListener(div_1, "click", click_handler);
			if (if_block) if_block.d();
		}
	};
}

// (8:12) {{#each palette as c}}
function create_each_block(state, palette, c, c_index, component) {
	var div, div_data_color_value;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "color";
			div.dataset.color = div_data_color_value = c;
			setStyle(div, "background", c);
			addListener(div, "click", click_handler);
			addListener(div, "dblclick", dblclick_handler);

			div._svelte = {
				component: component,
				palette: palette,
				c_index: c_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		p: function update(changed, state, palette, c, c_index) {
			if ((changed.palette) && div_data_color_value !== (div_data_color_value = c)) {
				div.dataset.color = div_data_color_value;
			}

			if (changed.palette) {
				setStyle(div, "background", c);
			}

			div._svelte.palette = palette;
			div._svelte.c_index = c_index;
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div, "click", click_handler);
			removeListener(div, "dblclick", dblclick_handler);
		}
	};
}

// (14:12) {{#each gradient_l as c}}
function create_each_block_1(state, gradient_l_1, c_1, c_index_1, component) {
	var div, div_class_value, div_data_color_value;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(div);
			div.className = div_class_value = "color " + (c_1 == state.nearest_l?'selected':'');
			div.dataset.color = div_data_color_value = c_1;
			setStyle(div, "background", c_1);
			addListener(div, "click", click_handler_1);

			div._svelte = {
				component: component,
				gradient_l_1: gradient_l_1,
				c_index_1: c_index_1
			};
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		p: function update(changed, state, gradient_l_1, c_1, c_index_1) {
			if ((changed.gradient_l || changed.nearest_l) && div_class_value !== (div_class_value = "color " + (c_1 == state.nearest_l?'selected':''))) {
				div.className = div_class_value;
			}

			if ((changed.gradient_l) && div_data_color_value !== (div_data_color_value = c_1)) {
				div.dataset.color = div_data_color_value;
			}

			if (changed.gradient_l) {
				setStyle(div, "background", c_1);
			}

			div._svelte.gradient_l_1 = gradient_l_1;
			div._svelte.c_index_1 = c_index_1;
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div, "click", click_handler_1);
		}
	};
}

// (19:12) {{#each gradient_c as c}}
function create_each_block_2(state, gradient_c_1, c_2, c_index_2, component) {
	var div, div_class_value, div_data_color_value;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(div);
			div.className = div_class_value = "color " + (c_2 == state.nearest_c?'selected':'');
			div.dataset.color = div_data_color_value = c_2;
			setStyle(div, "background", c_2);
			addListener(div, "click", click_handler_2);

			div._svelte = {
				component: component,
				gradient_c_1: gradient_c_1,
				c_index_2: c_index_2
			};
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		p: function update(changed, state, gradient_c_1, c_2, c_index_2) {
			if ((changed.gradient_c || changed.nearest_c) && div_class_value !== (div_class_value = "color " + (c_2 == state.nearest_c?'selected':''))) {
				div.className = div_class_value;
			}

			if ((changed.gradient_c) && div_data_color_value !== (div_data_color_value = c_2)) {
				div.dataset.color = div_data_color_value;
			}

			if (changed.gradient_c) {
				setStyle(div, "background", c_2);
			}

			div._svelte.gradient_c_1 = gradient_c_1;
			div._svelte.c_index_2 = c_index_2;
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div, "click", click_handler_2);
		}
	};
}

// (24:12) {{#each gradient_h as c}}
function create_each_block_3(state, gradient_h_1, c_3, c_index_3, component) {
	var div, div_class_value, div_data_color_value;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(div);
			div.className = div_class_value = "color " + (c_3 == state.nearest_h?'selected':'');
			div.dataset.color = div_data_color_value = c_3;
			setStyle(div, "background", c_3);
			addListener(div, "click", click_handler_3);

			div._svelte = {
				component: component,
				gradient_h_1: gradient_h_1,
				c_index_3: c_index_3
			};
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		p: function update(changed, state, gradient_h_1, c_3, c_index_3) {
			if ((changed.gradient_h || changed.nearest_h) && div_class_value !== (div_class_value = "color " + (c_3 == state.nearest_h?'selected':''))) {
				div.className = div_class_value;
			}

			if ((changed.gradient_h) && div_data_color_value !== (div_data_color_value = c_3)) {
				div.dataset.color = div_data_color_value;
			}

			if (changed.gradient_h) {
				setStyle(div, "background", c_3);
			}

			div._svelte.gradient_h_1 = gradient_h_1;
			div._svelte.c_index_3 = c_index_3;
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div, "click", click_handler_3);
		}
	};
}

// (5:4) {{#if visible && color}}
function create_if_block(state, component) {
	var div, div_1, text_1, div_2, text_3, div_3, text_5, div_4, text_7, div_5, input, input_updating = false, text_8, button, text_9, div_6;

	var palette = state.palette;

	var each_blocks = [];

	for (var i_1 = 0; i_1 < palette.length; i_1 += 1) {
		each_blocks[i_1] = create_each_block(state, palette, palette[i_1], i_1, component);
	}

	var gradient_l_1 = state.gradient_l;

	var each_1_blocks = [];

	for (var i_1 = 0; i_1 < gradient_l_1.length; i_1 += 1) {
		each_1_blocks[i_1] = create_each_block_1(state, gradient_l_1, gradient_l_1[i_1], i_1, component);
	}

	var gradient_c_1 = state.gradient_c;

	var each_2_blocks = [];

	for (var i_1 = 0; i_1 < gradient_c_1.length; i_1 += 1) {
		each_2_blocks[i_1] = create_each_block_2(state, gradient_c_1, gradient_c_1[i_1], i_1, component);
	}

	var gradient_h_1 = state.gradient_h;

	var each_3_blocks = [];

	for (var i_1 = 0; i_1 < gradient_h_1.length; i_1 += 1) {
		each_3_blocks[i_1] = create_each_block_3(state, gradient_h_1, gradient_h_1[i_1], i_1, component);
	}

	function input_input_handler() {
		input_updating = true;
		component.set({ color: input.value });
		input_updating = false;
	}

	function click_handler_4(event) {
		component.set({visible:false});
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].c();
			}

			text_1 = createText("\n\n        ");
			div_2 = createElement("div");

			for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
				each_1_blocks[i_1].c();
			}

			text_3 = createText("\n        ");
			div_3 = createElement("div");

			for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
				each_2_blocks[i_1].c();
			}

			text_5 = createText("\n        ");
			div_4 = createElement("div");

			for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
				each_3_blocks[i_1].c();
			}

			text_7 = createText("\n\n        ");
			div_5 = createElement("div");
			input = createElement("input");
			text_8 = createText("\n            ");
			button = createElement("button");
			button.innerHTML = "<i class=\"icon-ok\"></i>";
			text_9 = createText("\n            ");
			div_6 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "palette";
			div_2.className = "color-axis lightness";
			div_3.className = "color-axis saturation";
			div_4.className = "color-axis hue";
			encapsulateStyles(input);
			addListener(input, "input", input_input_handler);
			input.type = "text";
			setStyle(input, "background", state.color);
			setStyle(input, "border-color", state.borderColor);
			setStyle(input, "color", state.textColor);
			input.className = "hex";
			button.className = "btn btn-small ok";
			addListener(button, "click", click_handler_4);
			div_6.className = "color selected";
			setStyle(div_6, "background", state.color);
			div_5.className = "footer";
			div.className = "color-selector";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].m(div_1, null);
			}

			appendNode(text_1, div);
			appendNode(div_2, div);

			for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
				each_1_blocks[i_1].m(div_2, null);
			}

			appendNode(text_3, div);
			appendNode(div_3, div);

			for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
				each_2_blocks[i_1].m(div_3, null);
			}

			appendNode(text_5, div);
			appendNode(div_4, div);

			for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
				each_3_blocks[i_1].m(div_4, null);
			}

			appendNode(text_7, div);
			appendNode(div_5, div);
			appendNode(input, div_5);

			input.value = state.color;

			appendNode(text_8, div_5);
			appendNode(button, div_5);
			appendNode(text_9, div_5);
			appendNode(div_6, div_5);
		},

		p: function update(changed, state) {
			var palette = state.palette;

			if (changed.palette) {
				for (var i_1 = 0; i_1 < palette.length; i_1 += 1) {
					if (each_blocks[i_1]) {
						each_blocks[i_1].p(changed, state, palette, palette[i_1], i_1);
					} else {
						each_blocks[i_1] = create_each_block(state, palette, palette[i_1], i_1, component);
						each_blocks[i_1].c();
						each_blocks[i_1].m(div_1, null);
					}
				}

				for (; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].u();
					each_blocks[i_1].d();
				}
				each_blocks.length = palette.length;
			}

			var gradient_l_1 = state.gradient_l;

			if (changed.gradient_l || changed.nearest_l) {
				for (var i_1 = 0; i_1 < gradient_l_1.length; i_1 += 1) {
					if (each_1_blocks[i_1]) {
						each_1_blocks[i_1].p(changed, state, gradient_l_1, gradient_l_1[i_1], i_1);
					} else {
						each_1_blocks[i_1] = create_each_block_1(state, gradient_l_1, gradient_l_1[i_1], i_1, component);
						each_1_blocks[i_1].c();
						each_1_blocks[i_1].m(div_2, null);
					}
				}

				for (; i_1 < each_1_blocks.length; i_1 += 1) {
					each_1_blocks[i_1].u();
					each_1_blocks[i_1].d();
				}
				each_1_blocks.length = gradient_l_1.length;
			}

			var gradient_c_1 = state.gradient_c;

			if (changed.gradient_c || changed.nearest_c) {
				for (var i_1 = 0; i_1 < gradient_c_1.length; i_1 += 1) {
					if (each_2_blocks[i_1]) {
						each_2_blocks[i_1].p(changed, state, gradient_c_1, gradient_c_1[i_1], i_1);
					} else {
						each_2_blocks[i_1] = create_each_block_2(state, gradient_c_1, gradient_c_1[i_1], i_1, component);
						each_2_blocks[i_1].c();
						each_2_blocks[i_1].m(div_3, null);
					}
				}

				for (; i_1 < each_2_blocks.length; i_1 += 1) {
					each_2_blocks[i_1].u();
					each_2_blocks[i_1].d();
				}
				each_2_blocks.length = gradient_c_1.length;
			}

			var gradient_h_1 = state.gradient_h;

			if (changed.gradient_h || changed.nearest_h) {
				for (var i_1 = 0; i_1 < gradient_h_1.length; i_1 += 1) {
					if (each_3_blocks[i_1]) {
						each_3_blocks[i_1].p(changed, state, gradient_h_1, gradient_h_1[i_1], i_1);
					} else {
						each_3_blocks[i_1] = create_each_block_3(state, gradient_h_1, gradient_h_1[i_1], i_1, component);
						each_3_blocks[i_1].c();
						each_3_blocks[i_1].m(div_4, null);
					}
				}

				for (; i_1 < each_3_blocks.length; i_1 += 1) {
					each_3_blocks[i_1].u();
					each_3_blocks[i_1].d();
				}
				each_3_blocks.length = gradient_h_1.length;
			}

			if (!input_updating) input.value = state.color;
			if (changed.color) {
				setStyle(input, "background", state.color);
			}

			if (changed.borderColor) {
				setStyle(input, "border-color", state.borderColor);
			}

			if (changed.textColor) {
				setStyle(input, "color", state.textColor);
			}

			if (changed.color) {
				setStyle(div_6, "background", state.color);
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].u();
			}

			for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
				each_1_blocks[i_1].u();
			}

			for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
				each_2_blocks[i_1].u();
			}

			for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
				each_3_blocks[i_1].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			destroyEach(each_1_blocks);

			destroyEach(each_2_blocks);

			destroyEach(each_3_blocks);

			removeListener(input, "input", input_input_handler);
			removeListener(button, "click", click_handler_4);
		}
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var palette = this._svelte.palette, c_index = this._svelte.c_index, c = palette[c_index];
	component.set({color:c});
}

function dblclick_handler(event) {
	var component = this._svelte.component;
	var palette = this._svelte.palette, c_index = this._svelte.c_index, c = palette[c_index];
	component.set({color:c, visible:false});
}

function click_handler_1(event) {
	var component = this._svelte.component;
	var gradient_l_1 = this._svelte.gradient_l_1, c_index_1 = this._svelte.c_index_1, c_1 = gradient_l_1[c_index_1];
	component.set({color:c_1});
}

function click_handler_2(event) {
	var component = this._svelte.component;
	var gradient_c_1 = this._svelte.gradient_c_1, c_index_2 = this._svelte.c_index_2, c_2 = gradient_c_1[c_index_2];
	component.set({color:c_2});
}

function click_handler_3(event) {
	var component = this._svelte.component;
	var gradient_h_1 = this._svelte.gradient_h_1, c_index_3 = this._svelte.c_index_3, c_3 = gradient_h_1[c_index_3];
	component.set({color:c_3});
}

function ColorPicker(options) {
	this._debugName = '<ColorPicker>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data(), options.data);
	this._recompute({ color: 1, palette: 1, gradient_l: 1, gradient_c: 1, gradient_h: 1 }, this._state);
	if (!('color' in this._state)) console.warn("<ColorPicker> was created without expected data property 'color'");
	if (!('palette' in this._state)) console.warn("<ColorPicker> was created without expected data property 'palette'");
	if (!('gradient_l' in this._state)) console.warn("<ColorPicker> was created without expected data property 'gradient_l'");
	if (!('gradient_c' in this._state)) console.warn("<ColorPicker> was created without expected data property 'gradient_c'");
	if (!('gradient_h' in this._state)) console.warn("<ColorPicker> was created without expected data property 'gradient_h'");
	if (!('visible' in this._state)) console.warn("<ColorPicker> was created without expected data property 'visible'");
	if (!('nearest_l' in this._state)) console.warn("<ColorPicker> was created without expected data property 'nearest_l'");
	if (!('nearest_c' in this._state)) console.warn("<ColorPicker> was created without expected data property 'nearest_c'");
	if (!('nearest_h' in this._state)) console.warn("<ColorPicker> was created without expected data property 'nearest_h'");
	if (!('borderColor' in this._state)) console.warn("<ColorPicker> was created without expected data property 'borderColor'");
	if (!('textColor' in this._state)) console.warn("<ColorPicker> was created without expected data property 'textColor'");

	this._handlers.destroy = [ondestroy];

	var _oncreate = oncreate.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment$1(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._oncreate);
	}
}

assign(ColorPicker.prototype, methods, protoDev);

ColorPicker.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('gradient_l' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_l'");
	if ('gradient_c' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_c'");
	if ('gradient_h' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_h'");
	if ('nearest_l' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_l'");
	if ('nearest_c' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_c'");
	if ('nearest_h' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_h'");
	if ('textColor' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'textColor'");
	if ('borderColor' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'borderColor'");
};

ColorPicker.prototype._recompute = function _recompute(changed, state) {
	if (changed.color) {
		if (differs(state.gradient_l, (state.gradient_l = gradient_l(state.color)))) changed.gradient_l = true;
	}

	if (changed.color || changed.palette) {
		if (differs(state.gradient_c, (state.gradient_c = gradient_c(state.color, state.palette)))) changed.gradient_c = true;
	}

	if (changed.color) {
		if (differs(state.gradient_h, (state.gradient_h = gradient_h(state.color)))) changed.gradient_h = true;
	}

	if (changed.color || changed.gradient_l) {
		if (differs(state.nearest_l, (state.nearest_l = nearest_l(state.color, state.gradient_l)))) changed.nearest_l = true;
	}

	if (changed.color || changed.gradient_c) {
		if (differs(state.nearest_c, (state.nearest_c = nearest_c(state.color, state.gradient_c)))) changed.nearest_c = true;
	}

	if (changed.color || changed.gradient_h) {
		if (differs(state.nearest_h, (state.nearest_h = nearest_h(state.color, state.gradient_h)))) changed.nearest_h = true;
	}

	if (changed.color) {
		if (differs(state.textColor, (state.textColor = textColor(state.color)))) changed.textColor = true;
		if (differs(state.borderColor, (state.borderColor = borderColor(state.color)))) changed.borderColor = true;
	}
};

/* controls/Color.html generated by Svelte v1.53.0 */
function palette_1($theme) {
    console.log($theme);
    return $theme.colors.palette; //.concat($theme.colors.secondary || []);
}

function colorKeys($vis, axis, custom, palette) {
    if (!$vis) return [];
    return (
        axis ? _.unique($vis.axes(true)[axis].values()) :
        $vis.colorKeys ? $vis.colorKeys() : $vis.keys()
    ).map((k) => {
        k = stripTags(k);
        return {
            key: k,
            defined: custom[k] !== undefined,
            color: custom[k] !== undefined ?
                getColor(custom[k],palette) : '#cccccc'
        };
    });
}

function hexColor(value, palette) {
    return getColor(value, palette);
}

function customColor(selected, palette, custom) {
    return getColor(custom[selected[0]] || 0, palette);
}

function customizable(custom) {
    return custom !== false;
}

function data$1() {
    return {
        open: false,
        openCustom: false,
        customizable: false,
        expanded: false,
        selected: [],
        custom: false
    };
}

var methods$1 = {
    update (color) {
        const {palette} = this.get();
        this.set({value: storeColor(color, palette)});
    },
    updateCustom (color) {
        const {selected, palette, custom} = this.get();
        selected.forEach((k) => custom[k] = storeColor(color, palette));
        this.set({custom});
    },
    toggle (event) {
        event.preventDefault();
        this.set({expanded:!this.get('expanded')});
    },
    toggleSelect (k, event) {
        event.preventDefault();
        const {selected} = this.get();
        const i = selected.indexOf(k);
        if (event.shiftKey) {
            if (i > -1) selected.splice(i,1);
            else selected.push(k);
        } else {
            selected.length = 1;
            selected[0] = k;
        }
        this.set({selected});
    },
    getColor (color) {
        const {palette} = this.get();
        return getColor(color, palette);
    },
    reset () {
        const {selected, custom} = this.get();
        selected.forEach(k => delete custom[k]);
        this.set({custom});
    },
    resetAll () {
        const {custom} = this.get();
        Object.keys(custom).forEach(k => delete custom[k]);
        this.set({custom});
    }
};

function storeColor(color, palette) {
    const pi = palette.indexOf(color);
    if (pi > -1) return pi;
    return color;
}

function getColor(color, palette) {
    return typeof color == 'number' ? palette[color%palette.length] : color;
}

function stripTags(s) {
    return dw.utils.purifyHtml(s, '');
}

function create_main_fragment$2(state, component) {
	var div, label, text, div_1, text_1, text_4, if_block_2_anchor;

	var if_block = (state.hexColor) && create_if_block$1(state, component);

	var if_block_1 = (state.customizable) && create_if_block_1(state, component);

	var if_block_2 = (state.customizable && state.expanded) && create_if_block_2(state, component);

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text = createText("\n    ");
			div_1 = createElement("div");
			if (if_block) if_block.c();
			text_1 = createText("\n\n        ");
			if (if_block_1) if_block_1.c();
			text_4 = createText("\n\n");
			if (if_block_2) if_block_2.c();
			if_block_2_anchor = createComment();
			this.h();
		},

		h: function hydrate() {
			label.className = "control-label";
			setStyle(label, "width", "100px");
			div_1.className = "controls";
			div.className = "control-group vis-option-type-color";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			label.innerHTML = state.label;
			appendNode(text, div);
			appendNode(div_1, div);
			if (if_block) if_block.m(div_1, null);
			appendNode(text_1, div_1);
			if (if_block_1) if_block_1.m(div_1, null);
			insertNode(text_4, target, anchor);
			if (if_block_2) if_block_2.m(target, anchor);
			insertNode(if_block_2_anchor, target, anchor);
		},

		p: function update(changed, state) {
			if (changed.label) {
				label.innerHTML = state.label;
			}

			if (state.hexColor) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$1(state, component);
					if_block.c();
					if_block.m(div_1, text_1);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (state.customizable) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1(state, component);
					if_block_1.c();
					if_block_1.m(div_1, null);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			if (state.customizable && state.expanded) {
				if (if_block_2) {
					if_block_2.p(changed, state);
				} else {
					if_block_2 = create_if_block_2(state, component);
					if_block_2.c();
					if_block_2.m(if_block_2_anchor.parentNode, if_block_2_anchor);
				}
			} else if (if_block_2) {
				if_block_2.u();
				if_block_2.d();
				if_block_2 = null;
			}
		},

		u: function unmount() {
			label.innerHTML = '';

			detachNode(div);
			if (if_block) if_block.u();
			if (if_block_1) if_block_1.u();
			detachNode(text_4);
			if (if_block_2) if_block_2.u();
			detachNode(if_block_2_anchor);
		},

		d: function destroy$$1() {
			if (if_block) if_block.d();
			if (if_block_1) if_block_1.d();
			if (if_block_2) if_block_2.d();
		}
	};
}

// (4:8) {{#if hexColor}}
function create_if_block$1(state, component) {
	var colorpicker_updating = {};

	var colorpicker_initial_data = { color: state.hexColor, palette: state.palette };
	if ('open' in state) {
		colorpicker_initial_data.visible = state.open;
		colorpicker_updating.visible = true;
	}
	var colorpicker = new ColorPicker({
		root: component.root,
		data: colorpicker_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!colorpicker_updating.visible && changed.visible) {
				newState.open = childState.visible;
			}
			colorpicker_updating = assign({}, changed);
			component._set(newState);
			colorpicker_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		var state = component.get(), childState = colorpicker.get(), newState = {};
		if (!childState) return;
		if (!colorpicker_updating.visible) {
			newState.open = childState.visible;
		}
		colorpicker_updating = { visible: true };
		component._set(newState);
		colorpicker_updating = {};
	});

	colorpicker.on("change", function(event) {
		component.update(event);
	});

	return {
		c: function create() {
			colorpicker._fragment.c();
		},

		m: function mount(target, anchor) {
			colorpicker._mount(target, anchor);
		},

		p: function update(changed, state) {
			var colorpicker_changes = {};
			if (changed.hexColor) colorpicker_changes.color = state.hexColor;
			if (changed.palette) colorpicker_changes.palette = state.palette;
			if (!colorpicker_updating.visible && changed.open) {
				colorpicker_changes.visible = state.open;
				colorpicker_updating.visible = true;
			}
			colorpicker._set(colorpicker_changes);
			colorpicker_updating = {};

			
		},

		u: function unmount() {
			colorpicker._unmount();
		},

		d: function destroy$$1() {
			colorpicker.destroy(false);
		}
	};
}

// (8:8) {{#if customizable}}
function create_if_block_1(state, component) {
	var span, a, a_class_value;

	function click_handler(event) {
		component.toggle(event);
	}

	return {
		c: function create() {
			span = createElement("span");
			a = createElement("a");
			a.textContent = "customize colors...";
			this.h();
		},

		h: function hydrate() {
			a.href = "#customize";
			a.className = a_class_value = "btn btn-small custom " + (state.expanded?'btn-primary':'');
			setAttribute(a, "role", "button");
			addListener(a, "click", click_handler);
			span.className = "custom-color-selector-head";
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(a, span);
		},

		p: function update(changed, state) {
			if ((changed.expanded) && a_class_value !== (a_class_value = "btn btn-small custom " + (state.expanded?'btn-primary':''))) {
				a.className = a_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler);
		}
	};
}

// (22:16) {{#each colorKeys as k}}
function create_each_block$1(state, colorKeys_1, k, k_index, component) {
	var li, div, text_value = !k.defined ? '×' : '', text, text_1, label, text_2_value = k.key, text_2, li_class_value, li_data_series_value;

	return {
		c: function create() {
			li = createElement("li");
			div = createElement("div");
			text = createText(text_value);
			text_1 = createText("\n                    ");
			label = createElement("label");
			text_2 = createText(text_2_value);
			this.h();
		},

		h: function hydrate() {
			div.className = "color";
			setStyle(div, "background", k.color);
			li.className = li_class_value = state.selected.indexOf(k.key) > -1 ? 'selected':'';
			li.dataset.series = li_data_series_value = k.key;
			addListener(li, "click", click_handler$1);

			li._svelte = {
				component: component,
				colorKeys_1: colorKeys_1,
				k_index: k_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(div, li);
			appendNode(text, div);
			appendNode(text_1, li);
			appendNode(label, li);
			appendNode(text_2, label);
		},

		p: function update(changed, state, colorKeys_1, k, k_index) {
			if ((changed.colorKeys) && text_value !== (text_value = !k.defined ? '×' : '')) {
				text.data = text_value;
			}

			if (changed.colorKeys) {
				setStyle(div, "background", k.color);
			}

			if ((changed.colorKeys) && text_2_value !== (text_2_value = k.key)) {
				text_2.data = text_2_value;
			}

			if ((changed.selected || changed.colorKeys) && li_class_value !== (li_class_value = state.selected.indexOf(k.key) > -1 ? 'selected':'')) {
				li.className = li_class_value;
			}

			if ((changed.colorKeys) && li_data_series_value !== (li_data_series_value = k.key)) {
				li.dataset.series = li_data_series_value;
			}

			li._svelte.colorKeys_1 = colorKeys_1;
			li._svelte.k_index = k_index;
		},

		u: function unmount() {
			detachNode(li);
		},

		d: function destroy$$1() {
			removeListener(li, "click", click_handler$1);
		}
	};
}

// (39:12) {{#if selected.length}}
function create_if_block_3(state, component) {
	var div, colorpicker_updating = {}, text, button;

	var colorpicker_initial_data = {
		color: state.customColor,
		palette: state.palette
	};
	if ('openCustom' in state) {
		colorpicker_initial_data.visible = state.openCustom;
		colorpicker_updating.visible = true;
	}
	var colorpicker = new ColorPicker({
		root: component.root,
		data: colorpicker_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!colorpicker_updating.visible && changed.visible) {
				newState.openCustom = childState.visible;
			}
			colorpicker_updating = assign({}, changed);
			component._set(newState);
			colorpicker_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		var state = component.get(), childState = colorpicker.get(), newState = {};
		if (!childState) return;
		if (!colorpicker_updating.visible) {
			newState.openCustom = childState.visible;
		}
		colorpicker_updating = { visible: true };
		component._set(newState);
		colorpicker_updating = {};
	});

	colorpicker.on("change", function(event) {
		component.updateCustom(event);
	});

	function click_handler_1(event) {
		component.reset();
	}

	return {
		c: function create() {
			div = createElement("div");
			colorpicker._fragment.c();
			text = createText("\n                ");
			button = createElement("button");
			button.textContent = "Reset";
			this.h();
		},

		h: function hydrate() {
			button.className = "btn";
			addListener(button, "click", click_handler_1);
			div.className = "select";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			colorpicker._mount(div, null);
			appendNode(text, div);
			appendNode(button, div);
		},

		p: function update(changed, state) {
			var colorpicker_changes = {};
			if (changed.customColor) colorpicker_changes.color = state.customColor;
			if (changed.palette) colorpicker_changes.palette = state.palette;
			if (!colorpicker_updating.visible && changed.openCustom) {
				colorpicker_changes.visible = state.openCustom;
				colorpicker_updating.visible = true;
			}
			colorpicker._set(colorpicker_changes);
			colorpicker_updating = {};

			
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			colorpicker.destroy(false);
			removeListener(button, "click", click_handler_1);
		}
	};
}

// (44:12) {{else}}
function create_if_block_4(state, component) {
	var div;

	return {
		c: function create() {
			div = createElement("div");
			div.textContent = "Please select an element on the left to change colors for individual elements...";
			this.h();
		},

		h: function hydrate() {
			div.className = "info";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		p: noop,

		u: function unmount() {
			detachNode(div);
		},

		d: noop
	};
}

// (16:0) {{#if customizable && expanded}}
function create_if_block_2(state, component) {
	var div, div_1, div_2, h4, text_1, ul, text_2, div_3, text_11, div_4, h4_1, text_13, text_14, button, text_18, hr;

	var colorKeys_1 = state.colorKeys;

	var each_blocks = [];

	for (var i = 0; i < colorKeys_1.length; i += 1) {
		each_blocks[i] = create_each_block$1(state, colorKeys_1, colorKeys_1[i], i, component);
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(state, component);

	function click_handler_1(event) {
		component.resetAll();
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_2 = createElement("div");
			h4 = createElement("h4");
			h4.textContent = "Select element(s):";
			text_1 = createText("\n            ");
			ul = createElement("ul");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_2 = createText("\n            ");
			div_3 = createElement("div");
			div_3.innerHTML = "Select:  \n                <a href=\"#/select-all\" class=\"select-all\">all</a>  \n                <a href=\"#/select-none\" class=\"select-none\" onclick=\"$('.dataseries li').removeClass('selected')\">none</a>  \n                <a href=\"#/select-invert\" class=\"select-invert\" onclick=\"$('.dataseries li').toggleClass('selected')\">invert</a>";
			text_11 = createText("\n        ");
			div_4 = createElement("div");
			h4_1 = createElement("h4");
			h4_1.textContent = "Choose a color:";
			text_13 = createText("\n            ");
			if_block.c();
			text_14 = createText("\n            ");
			button = createElement("button");
			button.textContent = "Reset all colors";
			text_18 = createText("\n    ");
			hr = createElement("hr");
			this.h();
		},

		h: function hydrate() {
			ul.className = "dataseries unstyled";
			setStyle(div_3, "font-size", "12px");
			setStyle(div_3, "text-align", "center");
			setStyle(div_3, "margin-bottom", "10px");
			div_2.className = "span2";
			setStyle(div_2, "width", "43%");
			setStyle(button, "margin-top", "20px");
			button.className = "btn";
			addListener(button, "click", click_handler_1);
			div_4.className = "span2";
			setStyle(div_4, "width", "42%");
			div_1.className = "row";
			div.className = "custom-color-selector-body";
			setStyle(div, "display", "block");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			appendNode(h4, div_2);
			appendNode(text_1, div_2);
			appendNode(ul, div_2);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			appendNode(text_2, div_2);
			appendNode(div_3, div_2);
			appendNode(text_11, div_1);
			appendNode(div_4, div_1);
			appendNode(h4_1, div_4);
			appendNode(text_13, div_4);
			if_block.m(div_4, null);
			appendNode(text_14, div_4);
			appendNode(button, div_4);
			appendNode(text_18, div);
			appendNode(hr, div);
		},

		p: function update(changed, state) {
			var colorKeys_1 = state.colorKeys;

			if (changed.colorKeys || changed.selected) {
				for (var i = 0; i < colorKeys_1.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, colorKeys_1, colorKeys_1[i], i);
					} else {
						each_blocks[i] = create_each_block$1(state, colorKeys_1, colorKeys_1[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(ul, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = colorKeys_1.length;
			}

			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(state, component);
				if_block.c();
				if_block.m(div_4, text_14);
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			if_block.u();
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			if_block.d();
			removeListener(button, "click", click_handler_1);
		}
	};
}

function click_handler$1(event) {
	var component = this._svelte.component;
	var colorKeys_1 = this._svelte.colorKeys_1, k_index = this._svelte.k_index, k = colorKeys_1[k_index];
	component.toggleSelect(k.key, event);
}

function select_block_type(state) {
	if (state.selected.length) return create_if_block_3;
	return create_if_block_4;
}

function Color(options) {
	this._debugName = '<Color>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(this.store._init(["vis","theme"]), data$1(), options.data);
	this.store._add(this, ["vis","theme"]);
	this._recompute({ $theme: 1, $vis: 1, axis: 1, custom: 1, palette: 1, value: 1, selected: 1 }, this._state);
	if (!('$vis' in this._state)) console.warn("<Color> was created without expected data property '$vis'");
	if (!('axis' in this._state)) console.warn("<Color> was created without expected data property 'axis'");
	if (!('custom' in this._state)) console.warn("<Color> was created without expected data property 'custom'");
	if (!('palette' in this._state)) console.warn("<Color> was created without expected data property 'palette'");
	if (!('$theme' in this._state)) console.warn("<Color> was created without expected data property '$theme'");
	if (!('value' in this._state)) console.warn("<Color> was created without expected data property 'value'");
	if (!('selected' in this._state)) console.warn("<Color> was created without expected data property 'selected'");
	if (!('label' in this._state)) console.warn("<Color> was created without expected data property 'label'");
	if (!('hexColor' in this._state)) console.warn("<Color> was created without expected data property 'hexColor'");
	if (!('open' in this._state)) console.warn("<Color> was created without expected data property 'open'");
	if (!('customizable' in this._state)) console.warn("<Color> was created without expected data property 'customizable'");
	if (!('expanded' in this._state)) console.warn("<Color> was created without expected data property 'expanded'");
	if (!('colorKeys' in this._state)) console.warn("<Color> was created without expected data property 'colorKeys'");
	if (!('customColor' in this._state)) console.warn("<Color> was created without expected data property 'customColor'");
	if (!('openCustom' in this._state)) console.warn("<Color> was created without expected data property 'openCustom'");

	this._handlers.destroy = [removeFromStore];

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$2(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(Color.prototype, methods$1, protoDev);

Color.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('palette' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'palette'");
	if ('colorKeys' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'colorKeys'");
	if ('hexColor' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'hexColor'");
	if ('customColor' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'customColor'");
	if ('customizable' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'customizable'");
};

Color.prototype._recompute = function _recompute(changed, state) {
	if (changed.$theme) {
		if (differs(state.palette, (state.palette = palette_1(state.$theme)))) changed.palette = true;
	}

	if (changed.$vis || changed.axis || changed.custom || changed.palette) {
		if (differs(state.colorKeys, (state.colorKeys = colorKeys(state.$vis, state.axis, state.custom, state.palette)))) changed.colorKeys = true;
	}

	if (changed.value || changed.palette) {
		if (differs(state.hexColor, (state.hexColor = hexColor(state.value, state.palette)))) changed.hexColor = true;
	}

	if (changed.selected || changed.palette || changed.custom) {
		if (differs(state.customColor, (state.customColor = customColor(state.selected, state.palette, state.custom)))) changed.customColor = true;
	}

	if (changed.custom) {
		if (differs(state.customizable, (state.customizable = customizable(state.custom)))) changed.customizable = true;
	}
};

/* controls/Group.html generated by Svelte v1.53.0 */
function create_main_fragment$3(state, component) {
	var div, label, i, text, i_1, text_1, raw_before, text_2, div_1, slot_content_default = component._slotted.default;

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			i = createElement("i");
			text = createText("\n        ");
			i_1 = createElement("i");
			text_1 = createText("\n        ");
			raw_before = createElement('noscript');
			text_2 = createText("\n\n    ");
			div_1 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			i.className = "fa fa-chevron-up expand-group pull-right";
			i_1.className = "fa fa-chevron-down collapse-group pull-right";
			label.className = "group-title";
			div_1.className = "option-group-content vis-option-type-chart-description";
			div.className = "vis-option-type-group group-open";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			appendNode(i, label);
			appendNode(text, label);
			appendNode(i_1, label);
			appendNode(text_1, label);
			appendNode(raw_before, label);
			raw_before.insertAdjacentHTML("afterend", state.label);
			appendNode(text_2, div);
			appendNode(div_1, div);

			if (slot_content_default) {
				appendNode(slot_content_default, div_1);
			}
		},

		p: function update(changed, state) {
			if (changed.label) {
				detachAfter(raw_before);
				raw_before.insertAdjacentHTML("afterend", state.label);
			}
		},

		u: function unmount() {
			detachAfter(raw_before);

			detachNode(div);

			if (slot_content_default) {
				reinsertChildren(div_1, slot_content_default);
			}
		},

		d: noop
	};
}

function Group(options) {
	this._debugName = '<Group>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign({}, options.data);
	if (!('label' in this._state)) console.warn("<Group> was created without expected data property 'label'");

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment$3(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);
	}
}

assign(Group.prototype, protoDev);

Group.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* controls/Number.html generated by Svelte v1.53.0 */
function data$2() {
    return {
        unit: '',
        width: '100px'
    };
}

function encapsulateStyles$1(node) {
	setAttribute(node, "svelte-1271772055", "");
}

function create_main_fragment$4(state, component) {
	var div, label, text, div_1, input, text_1, input_1, input_1_updating = false, text_2, span, text_3;

	function input_input_handler() {
		component.set({ value: toNumber(input.value) });
	}

	function input_change_handler() {
		component.set({ value: toNumber(input.value) });
	}

	function input_1_input_handler() {
		input_1_updating = true;
		component.set({ value: toNumber(input_1.value) });
		input_1_updating = false;
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text = createText("\n    ");
			div_1 = createElement("div");
			input = createElement("input");
			text_1 = createText("  ");
			input_1 = createElement("input");
			text_2 = createText(" ");
			span = createElement("span");
			text_3 = createText(state.unit);
			this.h();
		},

		h: function hydrate() {
			setStyle(label, "width", state.width);
			label.className = "control-label";
			encapsulateStyles$1(input);
			addListener(input, "input", input_input_handler);
			addListener(input, "change", input_change_handler);
			input.type = "range";
			input.min = state.min;
			input.max = state.max;
			input.step = state.step;
			encapsulateStyles$1(input_1);
			addListener(input_1, "input", input_1_input_handler);
			input_1.type = "number";
			input_1.min = state.min;
			input_1.max = state.max;
			input_1.step = state.step;
			encapsulateStyles$1(span);
			span.className = "unit";
			div_1.className = "controls";
			div.className = "control-group vis-option-group vis-option-type-number";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			label.innerHTML = state.label;
			appendNode(text, div);
			appendNode(div_1, div);
			appendNode(input, div_1);

			input.value = state.value ;

			appendNode(text_1, div_1);
			appendNode(input_1, div_1);

			input_1.value = state.value;

			appendNode(text_2, div_1);
			appendNode(span, div_1);
			appendNode(text_3, span);
		},

		p: function update(changed, state) {
			if (changed.label) {
				label.innerHTML = state.label;
			}

			if (changed.width) {
				setStyle(label, "width", state.width);
			}

			input.value = state.value ;
			input.value = state.value ;
			if (changed.min) {
				input.min = state.min;
			}

			if (changed.max) {
				input.max = state.max;
			}

			if (changed.step) {
				input.step = state.step;
			}

			if (!input_1_updating) input_1.value = state.value;
			if (changed.min) {
				input_1.min = state.min;
			}

			if (changed.max) {
				input_1.max = state.max;
			}

			if (changed.step) {
				input_1.step = state.step;
			}

			if (changed.unit) {
				text_3.data = state.unit;
			}
		},

		u: function unmount() {
			label.innerHTML = '';

			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input, "change", input_change_handler);
			removeListener(input_1, "input", input_1_input_handler);
		}
	};
}

function Number(options) {
	this._debugName = '<Number>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$2(), options.data);
	if (!('width' in this._state)) console.warn("<Number> was created without expected data property 'width'");
	if (!('label' in this._state)) console.warn("<Number> was created without expected data property 'label'");
	if (!('min' in this._state)) console.warn("<Number> was created without expected data property 'min'");
	if (!('max' in this._state)) console.warn("<Number> was created without expected data property 'max'");
	if (!('step' in this._state)) console.warn("<Number> was created without expected data property 'step'");
	if (!('value' in this._state)) console.warn("<Number> was created without expected data property 'value'");
	if (!('unit' in this._state)) console.warn("<Number> was created without expected data property 'unit'");

	this._fragment = create_main_fragment$4(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);
	}
}

assign(Number.prototype, protoDev);

Number.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* controls/Radio.html generated by Svelte v1.53.0 */
function create_main_fragment$5(state, component) {
	var div, label, text_1, div_1;

	var options = state.options;

	var each_blocks = [];

	for (var i = 0; i < options.length; i += 1) {
		each_blocks[i] = create_each_block$2(state, options, options[i], i, component);
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text_1 = createText("\n\n    ");
			div_1 = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			label.className = "control-label";
			div_1.className = "controls form-inline";
			div.className = "control-group vis-option-group vis-option-type-radio";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			label.innerHTML = state.label;
			appendNode(text_1, div);
			appendNode(div_1, div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div_1, null);
			}
		},

		p: function update(changed, state) {
			if (changed.label) {
				label.innerHTML = state.label;
			}

			var options = state.options;

			if (changed.options || changed.value) {
				for (var i = 0; i < options.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, options, options[i], i);
					} else {
						each_blocks[i] = create_each_block$2(state, options, options[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(div_1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = options.length;
			}
		},

		u: function unmount() {
			label.innerHTML = '';

			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (7:8) {{#each options as opt}}
function create_each_block$2(state, options, opt, opt_index, component) {
	var label, input, input_value_value, text, text_1_value = opt.label, text_1;

	function input_change_handler() {
		component.set({ value: input.__value });
	}

	return {
		c: function create() {
			label = createElement("label");
			input = createElement("input");
			text = createText(" ");
			text_1 = createText(text_1_value);
			this.h();
		},

		h: function hydrate() {
			component._bindingGroups[0].push(input);
			addListener(input, "change", input_change_handler);
			input.type = "radio";
			input.__value = input_value_value = opt.value;
			input.value = input.__value;
			label.className = "radio";
		},

		m: function mount(target, anchor) {
			insertNode(label, target, anchor);
			appendNode(input, label);

			input.checked = input.__value === state.value;

			appendNode(text, label);
			appendNode(text_1, label);
		},

		p: function update(changed, state, options, opt, opt_index) {
			input.checked = input.__value === state.value;
			if ((changed.options) && input_value_value !== (input_value_value = opt.value)) {
				input.__value = input_value_value;
			}

			input.value = input.__value;
			if ((changed.options) && text_1_value !== (text_1_value = opt.label)) {
				text_1.data = text_1_value;
			}
		},

		u: function unmount() {
			detachNode(label);
		},

		d: function destroy$$1() {
			component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
			removeListener(input, "change", input_change_handler);
		}
	};
}

function Radio(options) {
	this._debugName = '<Radio>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign({}, options.data);
	if (!('label' in this._state)) console.warn("<Radio> was created without expected data property 'label'");
	if (!('options' in this._state)) console.warn("<Radio> was created without expected data property 'options'");
	if (!('value' in this._state)) console.warn("<Radio> was created without expected data property 'value'");
	this._bindingGroups = [[]];

	this._fragment = create_main_fragment$5(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);
	}
}

assign(Radio.prototype, protoDev);

Radio.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* controls/Select.html generated by Svelte v1.53.0 */
function data$3() {
    return {
        width: 'auto'
    };
}

function create_main_fragment$6(state, component) {
	var div, label, text_1, div_1, select, select_updating = false;

	var options = state.options;

	var each_blocks = [];

	for (var i = 0; i < options.length; i += 1) {
		each_blocks[i] = create_each_block$3(state, options, options[i], i, component);
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ value: selectValue(select) });
		select_updating = false;
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text_1 = createText("\n\n    ");
			div_1 = createElement("div");
			select = createElement("select");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			label.className = "control-label";
			addListener(select, "change", select_change_handler);
			if (!('value' in state)) component.root._beforecreate.push(select_change_handler);
			setStyle(select, "width", state.width);
			div_1.className = "controls form-inline";
			div.className = "control-group vis-option-type-select";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			label.innerHTML = state.label;
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(select, div_1);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.value);
		},

		p: function update(changed, state) {
			if (changed.label) {
				label.innerHTML = state.label;
			}

			var options = state.options;

			if (changed.options) {
				for (var i = 0; i < options.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, options, options[i], i);
					} else {
						each_blocks[i] = create_each_block$3(state, options, options[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = options.length;
			}

			if (!select_updating) selectOption(select, state.value);
			if (changed.width) {
				setStyle(select, "width", state.width);
			}
		},

		u: function unmount() {
			label.innerHTML = '';

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

// (8:8) {{#each options as opt}}
function create_each_block$3(state, options, opt, opt_index, component) {
	var option, text_value = opt.label, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = opt.value;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state, options, opt, opt_index) {
			if ((changed.options) && text_value !== (text_value = opt.label)) {
				text.data = text_value;
			}

			if ((changed.options) && option_value_value !== (option_value_value = opt.value)) {
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

function Select(options) {
	this._debugName = '<Select>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$3(), options.data);
	if (!('label' in this._state)) console.warn("<Select> was created without expected data property 'label'");
	if (!('value' in this._state)) console.warn("<Select> was created without expected data property 'value'");
	if (!('width' in this._state)) console.warn("<Select> was created without expected data property 'width'");
	if (!('options' in this._state)) console.warn("<Select> was created without expected data property 'options'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$6(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._beforecreate);
	}
}

assign(Select.prototype, protoDev);

Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* controls/SelectAxisColumn.html generated by Svelte v1.53.0 */
function columns(axis, $visMeta, $dataset) {
    const columns = [];
    // const axisMeta =
    if (!$dataset || !$visMeta || !axis) return [];
    $dataset.eachColumn((column) => {
        if (_.indexOf($visMeta.axes[axis].accepts, column.type()) > -1) {
            columns.push({
                name: column.name()
            });
        }
    });
    return columns;
}

function data$4() {
    return {
        selected: false
    };
}

function oncreate$1() {
    const me = this;
    me.observe('selected', (sel) => {
        if (sel) {
            const {axis} = me.get();
            var axes = _.clone(window.chart.get('metadata.axes', {}));
            if (sel == '-') delete axes[axis];
            else axes[axis] = sel;
            window.chart.set('metadata.axes', axes);
        }
    });
    me.store.observe('visMeta', (visMeta) => {
        let {selected, axis} = me.get();
        if (!selected && visMeta) {
            // initialize!
            selected = window.chart.get('metadata.axes')[axis];
            me.set({selected});
        }
    });
}

function encapsulateStyles$2(node) {
	setAttribute(node, "svelte-457672338", "");
}

function create_main_fragment$7(state, component) {
	var div, label, text_1, div_1, select, if_block_anchor, select_updating = false;

	var if_block = (state.$visMeta && state.$visMeta.axes[state.axis].optional) && create_if_block$2(state, component);

	var columns_1 = state.columns;

	var each_blocks = [];

	for (var i = 0; i < columns_1.length; i += 1) {
		each_blocks[i] = create_each_block$4(state, columns_1, columns_1[i], i, component);
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ selected: selectValue(select) });
		select_updating = false;
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text_1 = createText("\n\n    ");
			div_1 = createElement("div");
			select = createElement("select");
			if (if_block) if_block.c();
			if_block_anchor = createComment();

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles$2(label);
			label.className = "control-label";
			encapsulateStyles$2(select);
			addListener(select, "change", select_change_handler);
			if (!('selected' in state)) component.root._beforecreate.push(select_change_handler);
			div_1.className = "controls form-inline";
			div.className = "control-group vis-option-group";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			label.innerHTML = state.label;
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(select, div_1);
			if (if_block) if_block.m(select, null);
			appendNode(if_block_anchor, select);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.selected);
		},

		p: function update(changed, state) {
			if (changed.label) {
				label.innerHTML = state.label;
			}

			if (state.$visMeta && state.$visMeta.axes[state.axis].optional) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$2(state, component);
					if_block.c();
					if_block.m(select, if_block_anchor);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			var columns_1 = state.columns;

			if (changed.columns) {
				for (var i = 0; i < columns_1.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, columns_1, columns_1[i], i);
					} else {
						each_blocks[i] = create_each_block$4(state, columns_1, columns_1[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = columns_1.length;
			}

			if (!select_updating) selectOption(select, state.selected);
		},

		u: function unmount() {
			label.innerHTML = '';

			detachNode(div);
			if (if_block) if_block.u();

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			if (if_block) if_block.d();

			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
		}
	};
}

// (8:12) {{#if $visMeta && $visMeta.axes[axis].optional}}
function create_if_block$2(state, component) {
	var option, text_value = state.axis['na-label']||'--', text;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = "-";
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			if ((changed.axis) && text_value !== (text_value = state.axis['na-label']||'--')) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (11:12) {{#each columns as column}}
function create_each_block$4(state, columns_1, column, column_index, component) {
	var option, text_value = column.name, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = column.name;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state, columns_1, column, column_index) {
			if ((changed.columns) && text_value !== (text_value = column.name)) {
				text.data = text_value;
			}

			if ((changed.columns) && option_value_value !== (option_value_value = column.name)) {
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

function SelectAxisColumn(options) {
	this._debugName = '<SelectAxisColumn>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(this.store._init(["visMeta","dataset"]), data$4(), options.data);
	this.store._add(this, ["visMeta","dataset"]);
	this._recompute({ axis: 1, $visMeta: 1, $dataset: 1 }, this._state);
	if (!('axis' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property 'axis'");
	if (!('$visMeta' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property '$visMeta'");
	if (!('$dataset' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property '$dataset'");
	if (!('label' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property 'label'");
	if (!('selected' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property 'selected'");
	if (!('columns' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property 'columns'");

	this._handlers.destroy = [removeFromStore];

	var _oncreate = oncreate$1.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
		this._beforecreate = [];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment$7(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._beforecreate);
		callAll(this._oncreate);
	}
}

assign(SelectAxisColumn.prototype, protoDev);

SelectAxisColumn.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('columns' in newState && !this._updatingReadonlyProperty) throw new Error("<SelectAxisColumn>: Cannot set read-only property 'columns'");
};

SelectAxisColumn.prototype._recompute = function _recompute(changed, state) {
	if (changed.axis || changed.$visMeta || changed.$dataset) {
		if (differs(state.columns, (state.columns = columns(state.axis, state.$visMeta, state.$dataset)))) changed.columns = true;
	}
};

var main = {
    Checkbox, Color, ColorPicker, Group, NumberInput: Number,
    Radio, Select, SelectAxisColumn
};

return main;

})));
