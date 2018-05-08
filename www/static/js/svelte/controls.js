(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chroma')) :
	typeof define === 'function' && define.amd ? define(['chroma'], factory) :
	(global.controls = factory(null));
}(this, (function (chroma) { 'use strict';

	chroma = chroma && chroma.hasOwnProperty('default') ? chroma['default'] : chroma;

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

	function _differs(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
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

	/* controls/Checkbox.html generated by Svelte v1.64.0 */

	function data() {
	    return {
	        disabled: false
	    }
	}
	function create_main_fragment(component, state) {
		var div, label, input, text, text_1, label_class_value;

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
				setAttribute(input, "type", "checkbox");
				input.disabled = state.disabled;
				input.className = "svelte-llolt7";
				label.className = label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " svelte-llolt7";
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
				if (changed.disabled) {
					input.disabled = state.disabled;
				}

				if (changed.label) {
					text_1.data = state.label;
				}

				if ((changed.disabled) && label_class_value !== (label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " svelte-llolt7")) {
					label.className = label_class_value;
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
		this._state = assign(data(), options.data);
		if (!('disabled' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
		if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Checkbox.prototype, protoDev);

	Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/ColorPicker.html generated by Svelte v1.64.0 */

	let ref;

	function palette({$theme}) {
	    return $theme.colors.palette;
	}
	function gradient_l({ color }) {
	    const lch = chroma(color).lch();
	    const sample = spread(70, 55, 7, 6).map((l) => chroma.lch(l, lch[1], lch[2]).hex());
	    return chroma.scale(['#000000'].concat(sample).concat('#ffffff'))
	        .mode('lch')
	        .gamma(0.8)
	        .padding(0.1)
	        .colors(14);
	}
	function gradient_c({ color, palette }) {
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
	function gradient_h({ color }) {
	    const lch = chroma(color).lch();
	    const sample = spread(lch[2], 75, 7, 6)
	        .map((h) => chroma.lch(lch[0], lch[1], h).hex());
	    return chroma.scale(sample)
	        .mode('lch')
	        .colors(14);
	}
	function nearest_l({ color, gradient_l }) { return findNearest(gradient_l, color); }
	function nearest_c({ color, gradient_c }) { return findNearest(gradient_c, color); }
	function nearest_h({ color, gradient_h }) { return findNearest(gradient_h, color); }
	function textColor({ color }) {
	    return chroma(color).get('lab.l') > 60 ? 'black' : 'white';
	}
	function borderColor({ color }) {
	    return chroma(color).darker().hex();
	}
	function data$1() {
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
	    me.observe('color', (color, old_color) => {
	        const {visible} = me.get();
	        if (visible && color != old_color) me.fire('change', color);
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

	function create_main_fragment$1(component, state) {
		var div, div_1, slot_content_default = component._slotted.default, div_2, text_3;

		function click_handler(event) {
			component.set({visible:true});
		}

		var if_block = (state.visible && state.color) && create_if_block(component, state);

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				if (!slot_content_default) {
					div_2 = createElement("div");
					div_2.innerHTML = "<div class=\"arrow\"></div>";
				}
				text_3 = createText("\n    ");
				if (if_block) if_block.c();
				this.h();
			},

			h: function hydrate() {
				if (!slot_content_default) {
					div_2.className = "base-color-picker color-picker";
					setStyle(div_2, "background", "" + state.color + " none repeat scroll 0% 0%");
				}
				addListener(div_1, "click", click_handler);
				div.className = "color-picker-cont svelte-sffwrd";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				if (!slot_content_default) {
					appendNode(div_2, div_1);
				}

				else {
					appendNode(slot_content_default, div_1);
				}

				appendNode(text_3, div);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, state) {
				if (!slot_content_default) {
					if (changed.color) {
						setStyle(div_2, "background", "" + state.color + " none repeat scroll 0% 0%");
				}

				}

				if (state.visible && state.color) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block(component, state);
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

				if (slot_content_default) {
					reinsertChildren(div_1, slot_content_default);
				}

				if (if_block) if_block.u();
			},

			d: function destroy$$1() {
				removeListener(div_1, "click", click_handler);
				if (if_block) if_block.d();
			}
		};
	}

	// (12:12) {#each palette as c}
	function create_each_block(component, state) {
		var c = state.c, each_value = state.each_value, c_index = state.c_index;
		var div, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				addListener(div, "click", click_handler);
				addListener(div, "dblclick", dblclick_handler);
				div.className = "color";
				div.dataset.color = div_data_color_value = c;
				setStyle(div, "background", c);

				div._svelte = {
					component: component,
					each_value: state.each_value,
					c_index: state.c_index
				};
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			p: function update(changed, state) {
				c = state.c;
				each_value = state.each_value;
				c_index = state.c_index;
				if ((changed.palette) && div_data_color_value !== (div_data_color_value = c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.palette) {
					setStyle(div, "background", c);
				}

				div._svelte.each_value = state.each_value;
				div._svelte.c_index = state.c_index;
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

	// (18:12) {#each gradient_l as c}
	function create_each_block_1(component, state) {
		var c = state.c, each_value_1 = state.each_value_1, c_index_1 = state.c_index_1;
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				addListener(div, "click", click_handler_1);
				div.className = div_class_value = "color " + (c == state.nearest_l?'selected':'') + " svelte-sffwrd";
				div.dataset.color = div_data_color_value = c;
				setStyle(div, "background", c);

				div._svelte = {
					component: component,
					each_value_1: state.each_value_1,
					c_index_1: state.c_index_1
				};
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			p: function update(changed, state) {
				c = state.c;
				each_value_1 = state.each_value_1;
				c_index_1 = state.c_index_1;
				if ((changed.gradient_l || changed.nearest_l) && div_class_value !== (div_class_value = "color " + (c == state.nearest_l?'selected':'') + " svelte-sffwrd")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_l) && div_data_color_value !== (div_data_color_value = c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_l) {
					setStyle(div, "background", c);
				}

				div._svelte.each_value_1 = state.each_value_1;
				div._svelte.c_index_1 = state.c_index_1;
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy$$1() {
				removeListener(div, "click", click_handler_1);
			}
		};
	}

	// (23:12) {#each gradient_c as c}
	function create_each_block_2(component, state) {
		var c = state.c, each_value_2 = state.each_value_2, c_index_2 = state.c_index_2;
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				addListener(div, "click", click_handler_2);
				div.className = div_class_value = "color " + (c == state.nearest_c?'selected':'') + " svelte-sffwrd";
				div.dataset.color = div_data_color_value = c;
				setStyle(div, "background", c);

				div._svelte = {
					component: component,
					each_value_2: state.each_value_2,
					c_index_2: state.c_index_2
				};
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			p: function update(changed, state) {
				c = state.c;
				each_value_2 = state.each_value_2;
				c_index_2 = state.c_index_2;
				if ((changed.gradient_c || changed.nearest_c) && div_class_value !== (div_class_value = "color " + (c == state.nearest_c?'selected':'') + " svelte-sffwrd")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_c) && div_data_color_value !== (div_data_color_value = c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_c) {
					setStyle(div, "background", c);
				}

				div._svelte.each_value_2 = state.each_value_2;
				div._svelte.c_index_2 = state.c_index_2;
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy$$1() {
				removeListener(div, "click", click_handler_2);
			}
		};
	}

	// (28:12) {#each gradient_h as c}
	function create_each_block_3(component, state) {
		var c = state.c, each_value_3 = state.each_value_3, c_index_3 = state.c_index_3;
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				this.h();
			},

			h: function hydrate() {
				addListener(div, "click", click_handler_3);
				div.className = div_class_value = "color " + (c == state.nearest_h?'selected':'') + " svelte-sffwrd";
				div.dataset.color = div_data_color_value = c;
				setStyle(div, "background", c);

				div._svelte = {
					component: component,
					each_value_3: state.each_value_3,
					c_index_3: state.c_index_3
				};
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
			},

			p: function update(changed, state) {
				c = state.c;
				each_value_3 = state.each_value_3;
				c_index_3 = state.c_index_3;
				if ((changed.gradient_h || changed.nearest_h) && div_class_value !== (div_class_value = "color " + (c == state.nearest_h?'selected':'') + " svelte-sffwrd")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_h) && div_data_color_value !== (div_data_color_value = c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_h) {
					setStyle(div, "background", c);
				}

				div._svelte.each_value_3 = state.each_value_3;
				div._svelte.c_index_3 = state.c_index_3;
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy$$1() {
				removeListener(div, "click", click_handler_3);
			}
		};
	}

	// (9:4) {#if visible && color}
	function create_if_block(component, state) {
		var div, div_1, text_1, div_2, text_3, div_3, text_5, div_4, text_7, div_5, input, input_updating = false, text_8, button, text_9, div_6;

		var each_value = state.palette;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block(component, assign(assign({}, state), {
				each_value: each_value,
				c: each_value[i_1],
				c_index: i_1
			}));
		}

		var each_value_1 = state.gradient_l;

		var each_1_blocks = [];

		for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
			each_1_blocks[i_1] = create_each_block_1(component, assign(assign({}, state), {
				each_value_1: each_value_1,
				c: each_value_1[i_1],
				c_index_1: i_1
			}));
		}

		var each_value_2 = state.gradient_c;

		var each_2_blocks = [];

		for (var i_1 = 0; i_1 < each_value_2.length; i_1 += 1) {
			each_2_blocks[i_1] = create_each_block_2(component, assign(assign({}, state), {
				each_value_2: each_value_2,
				c: each_value_2[i_1],
				c_index_2: i_1
			}));
		}

		var each_value_3 = state.gradient_h;

		var each_3_blocks = [];

		for (var i_1 = 0; i_1 < each_value_3.length; i_1 += 1) {
			each_3_blocks[i_1] = create_each_block_3(component, assign(assign({}, state), {
				each_value_3: each_value_3,
				c: each_value_3[i_1],
				c_index_3: i_1
			}));
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
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				setStyle(input, "background", state.color);
				setStyle(input, "border-color", state.borderColor);
				setStyle(input, "color", state.textColor);
				input.className = "hex svelte-sffwrd";
				addListener(button, "click", click_handler_4);
				button.className = "btn btn-small ok";
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
				var each_value = state.palette;

				if (changed.palette) {
					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							c: each_value[i_1],
							c_index: i_1
						});

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, each_context);
						} else {
							each_blocks[i_1] = create_each_block(component, each_context);
							each_blocks[i_1].c();
							each_blocks[i_1].m(div_1, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].u();
						each_blocks[i_1].d();
					}
					each_blocks.length = each_value.length;
				}

				var each_value_1 = state.gradient_l;

				if (changed.gradient_l || changed.nearest_l) {
					for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
						var each_1_context = assign(assign({}, state), {
							each_value_1: each_value_1,
							c: each_value_1[i_1],
							c_index_1: i_1
						});

						if (each_1_blocks[i_1]) {
							each_1_blocks[i_1].p(changed, each_1_context);
						} else {
							each_1_blocks[i_1] = create_each_block_1(component, each_1_context);
							each_1_blocks[i_1].c();
							each_1_blocks[i_1].m(div_2, null);
						}
					}

					for (; i_1 < each_1_blocks.length; i_1 += 1) {
						each_1_blocks[i_1].u();
						each_1_blocks[i_1].d();
					}
					each_1_blocks.length = each_value_1.length;
				}

				var each_value_2 = state.gradient_c;

				if (changed.gradient_c || changed.nearest_c) {
					for (var i_1 = 0; i_1 < each_value_2.length; i_1 += 1) {
						var each_2_context = assign(assign({}, state), {
							each_value_2: each_value_2,
							c: each_value_2[i_1],
							c_index_2: i_1
						});

						if (each_2_blocks[i_1]) {
							each_2_blocks[i_1].p(changed, each_2_context);
						} else {
							each_2_blocks[i_1] = create_each_block_2(component, each_2_context);
							each_2_blocks[i_1].c();
							each_2_blocks[i_1].m(div_3, null);
						}
					}

					for (; i_1 < each_2_blocks.length; i_1 += 1) {
						each_2_blocks[i_1].u();
						each_2_blocks[i_1].d();
					}
					each_2_blocks.length = each_value_2.length;
				}

				var each_value_3 = state.gradient_h;

				if (changed.gradient_h || changed.nearest_h) {
					for (var i_1 = 0; i_1 < each_value_3.length; i_1 += 1) {
						var each_3_context = assign(assign({}, state), {
							each_value_3: each_value_3,
							c: each_value_3[i_1],
							c_index_3: i_1
						});

						if (each_3_blocks[i_1]) {
							each_3_blocks[i_1].p(changed, each_3_context);
						} else {
							each_3_blocks[i_1] = create_each_block_3(component, each_3_context);
							each_3_blocks[i_1].c();
							each_3_blocks[i_1].m(div_4, null);
						}
					}

					for (; i_1 < each_3_blocks.length; i_1 += 1) {
						each_3_blocks[i_1].u();
						each_3_blocks[i_1].d();
					}
					each_3_blocks.length = each_value_3.length;
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
		var each_value = this._svelte.each_value, c_index = this._svelte.c_index, c = each_value[c_index];
		component.set({color:c});
	}

	function dblclick_handler(event) {
		var component = this._svelte.component;
		var each_value = this._svelte.each_value, c_index = this._svelte.c_index, c = each_value[c_index];
		component.set({color:c, visible:false});
	}

	function click_handler_1(event) {
		var component = this._svelte.component;
		var each_value_1 = this._svelte.each_value_1, c_index_1 = this._svelte.c_index_1, c = each_value_1[c_index_1];
		component.set({color:c});
	}

	function click_handler_2(event) {
		var component = this._svelte.component;
		var each_value_2 = this._svelte.each_value_2, c_index_2 = this._svelte.c_index_2, c = each_value_2[c_index_2];
		component.set({color:c});
	}

	function click_handler_3(event) {
		var component = this._svelte.component;
		var each_value_3 = this._svelte.each_value_3, c_index_3 = this._svelte.c_index_3, c = each_value_3[c_index_3];
		component.set({color:c});
	}

	function ColorPicker(options) {
		this._debugName = '<ColorPicker>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(assign(this.store._init(["theme"]), data$1()), options.data);
		this.store._add(this, ["theme"]);
		this._recompute({ $theme: 1, color: 1, palette: 1, gradient_l: 1, gradient_c: 1, gradient_h: 1 }, this._state);
		if (!('$theme' in this._state)) console.warn("<ColorPicker> was created without expected data property '$theme'");
		if (!('color' in this._state)) console.warn("<ColorPicker> was created without expected data property 'color'");




		if (!('visible' in this._state)) console.warn("<ColorPicker> was created without expected data property 'visible'");

		this._handlers.destroy = [ondestroy, removeFromStore];

		this._slotted = options.slots || {};

		var self = this;
		var _oncreate = function() {
			var changed = { $theme: 1, color: 1, palette: 1, gradient_l: 1, gradient_c: 1, gradient_h: 1, visible: 1, nearest_l: 1, nearest_c: 1, nearest_h: 1, borderColor: 1, textColor: 1 };
			oncreate.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this.slots = {};

		this._fragment = create_main_fragment$1(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(ColorPicker.prototype, protoDev);
	assign(ColorPicker.prototype, methods);

	ColorPicker.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('palette' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorPicker>: Cannot set read-only property 'palette'");
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
		if (changed.$theme) {
			if (this._differs(state.palette, (state.palette = palette(state)))) changed.palette = true;
		}

		if (changed.color) {
			if (this._differs(state.gradient_l, (state.gradient_l = gradient_l(state)))) changed.gradient_l = true;
		}

		if (changed.color || changed.palette) {
			if (this._differs(state.gradient_c, (state.gradient_c = gradient_c(state)))) changed.gradient_c = true;
		}

		if (changed.color) {
			if (this._differs(state.gradient_h, (state.gradient_h = gradient_h(state)))) changed.gradient_h = true;
		}

		if (changed.color || changed.gradient_l) {
			if (this._differs(state.nearest_l, (state.nearest_l = nearest_l(state)))) changed.nearest_l = true;
		}

		if (changed.color || changed.gradient_c) {
			if (this._differs(state.nearest_c, (state.nearest_c = nearest_c(state)))) changed.nearest_c = true;
		}

		if (changed.color || changed.gradient_h) {
			if (this._differs(state.nearest_h, (state.nearest_h = nearest_h(state)))) changed.nearest_h = true;
		}

		if (changed.color) {
			if (this._differs(state.textColor, (state.textColor = textColor(state)))) changed.textColor = true;
			if (this._differs(state.borderColor, (state.borderColor = borderColor(state)))) changed.borderColor = true;
		}
	};

	/* controls/Color.html generated by Svelte v1.64.0 */

	function palette_1({ $theme }) {
	    return $theme.colors.palette; //.concat($theme.colors.secondary || []);
	}
	function colorKeys({ $vis, customizable, axis, custom, palette }) {
	    if (!$vis || !customizable) return [];
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
	function hexColor({ value, palette }) {
	    return getColor(value, palette);
	}
	function customColor({ selected, palette, custom }) {
	    if (custom[selected[0]] === undefined) return '#ccc';
	    const realColors = selected
	        .filter(s => custom[s] !== undefined)
	        .map(s => getColor(custom[s], palette));
	    if (!realColors.length) return '#ccc';
	    // if (realColors.length == 1) return realColors[0];
	    return chroma.average(realColors, 'lab');
	}
	function data$2() {
	    return {
	        open: false,
	        openCustom: false,
	        customizable: false,
	        expanded: false,
	        selected: [],
	        custom: {}
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
	        const {expanded} = this.get();
	        this.set({expanded:!expanded});
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
	    },
	    selectAll(event) {
	        event.preventDefault();
	        const {selected, colorKeys} = this.get();
	        colorKeys.forEach(k => {
	            if (selected.indexOf(k.key) < 0) selected.push(k.key);
	        });
	        this.set({selected});
	    },
	    selectNone(event) {
	        event.preventDefault();
	        const {selected} = this.get();
	        selected.length = 0;
	        this.set({selected});
	    },
	    selectInvert(event) {
	        event.preventDefault();
	        const {selected, colorKeys} = this.get();
	        console.log(selected);
	        colorKeys.forEach(k => {
	            const i = selected.indexOf(k.key);
	            if (i < 0) selected.push(k.key);
	            else selected.splice(i, 1);
	        });
	        console.log(selected);
	        this.set({selected});
	    }
	};

	function oncreate$1() {
	    this.observe('custom', (c) => {
	        if (c && c.length === 0) {
	            c = {};
	        }
	        this.set({custom:c});
	    });
	}
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

	function create_main_fragment$2(component, state) {
		var div, label, text, div_1, text_1, text_4, if_block_2_anchor;

		var if_block = (state.hexColor) && create_if_block$1(component, state);

		var if_block_1 = (state.customizable) && create_if_block_1(component, state);

		var if_block_2 = (state.customizable && state.expanded) && create_if_block_2(component, state);

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
						if_block = create_if_block$1(component, state);
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
						if_block_1 = create_if_block_1(component, state);
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
						if_block_2 = create_if_block_2(component, state);
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

	// (4:8) {#if hexColor}
	function create_if_block$1(component, state) {
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
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			colorpicker._bind({ visible: 1 }, colorpicker.get());
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

	// (8:8) {#if customizable}
	function create_if_block_1(component, state) {
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
				addListener(a, "click", click_handler);
				a.href = "#customize";
				a.className = a_class_value = "btn btn-small custom " + (state.expanded?'btn-primary':'');
				setAttribute(a, "role", "button");
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

	// (22:16) {#each colorKeys as k}
	function create_each_block$1(component, state) {
		var k = state.k, each_value = state.each_value, k_index = state.k_index;
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
				addListener(li, "click", click_handler$1);
				li.className = li_class_value = state.selected.indexOf(k.key) > -1 ? 'selected':'';
				li.dataset.series = li_data_series_value = k.key;

				li._svelte = {
					component: component,
					each_value: state.each_value,
					k_index: state.k_index
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

			p: function update(changed, state) {
				k = state.k;
				each_value = state.each_value;
				k_index = state.k_index;
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

				li._svelte.each_value = state.each_value;
				li._svelte.k_index = state.k_index;
			},

			u: function unmount() {
				detachNode(li);
			},

			d: function destroy$$1() {
				removeListener(li, "click", click_handler$1);
			}
		};
	}

	// (39:12) {#if selected.length}
	function create_if_block_3(component, state) {
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
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			colorpicker._bind({ visible: 1 }, colorpicker.get());
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
				addListener(button, "click", click_handler_1);
				button.className = "btn";
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

	// (44:12) {:else}
	function create_if_block_4(component, state) {
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

	// (16:0) {#if customizable && expanded}
	function create_if_block_2(component, state) {
		var div, div_1, div_2, h4, text_1, ul, text_2, div_3, text_3, a, text_5, a_1, text_7, a_2, text_11, div_4, h4_1, text_13, text_14, button;

		var each_value = state.colorKeys;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, assign(assign({}, state), {
				each_value: each_value,
				k: each_value[i],
				k_index: i
			}));
		}

		function click_handler_1(event) {
			component.selectAll(event);
		}

		function click_handler_2(event) {
			component.selectNone(event);
		}

		function click_handler_3(event) {
			component.selectInvert(event);
		}

		function select_block_type(state) {
			if (state.selected.length) return create_if_block_3;
			return create_if_block_4;
		}

		var current_block_type = select_block_type(state);
		var if_block = current_block_type(component, state);

		function click_handler_4(event) {
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
				text_3 = createText("Select:  \n                ");
				a = createElement("a");
				a.textContent = "all";
				text_5 = createText("  \n                ");
				a_1 = createElement("a");
				a_1.textContent = "none";
				text_7 = createText("  \n                ");
				a_2 = createElement("a");
				a_2.textContent = "invert";
				text_11 = createText("\n        ");
				div_4 = createElement("div");
				h4_1 = createElement("h4");
				h4_1.textContent = "Choose a color:";
				text_13 = createText("\n            ");
				if_block.c();
				text_14 = createText("\n            ");
				button = createElement("button");
				button.textContent = "Reset all colors";
				this.h();
			},

			h: function hydrate() {
				ul.className = "dataseries unstyled";
				addListener(a, "click", click_handler_1);
				a.href = "#/select-all";
				addListener(a_1, "click", click_handler_2);
				a_1.href = "#/select-none";
				addListener(a_2, "click", click_handler_3);
				a_2.href = "#/select-invert";
				setStyle(div_3, "font-size", "12px");
				setStyle(div_3, "text-align", "center");
				setStyle(div_3, "margin-bottom", "10px");
				div_2.className = "span2";
				setStyle(div_2, "width", "43%");
				addListener(button, "click", click_handler_4);
				setStyle(button, "margin-top", "20px");
				button.className = "btn";
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
				appendNode(text_3, div_3);
				appendNode(a, div_3);
				appendNode(text_5, div_3);
				appendNode(a_1, div_3);
				appendNode(text_7, div_3);
				appendNode(a_2, div_3);
				appendNode(text_11, div_1);
				appendNode(div_4, div_1);
				appendNode(h4_1, div_4);
				appendNode(text_13, div_4);
				if_block.m(div_4, null);
				appendNode(text_14, div_4);
				appendNode(button, div_4);
			},

			p: function update(changed, state) {
				var each_value = state.colorKeys;

				if (changed.colorKeys || changed.selected) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							k: each_value[i],
							k_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$1(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}

				if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
					if_block.p(changed, state);
				} else {
					if_block.u();
					if_block.d();
					if_block = current_block_type(component, state);
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

				removeListener(a, "click", click_handler_1);
				removeListener(a_1, "click", click_handler_2);
				removeListener(a_2, "click", click_handler_3);
				if_block.d();
				removeListener(button, "click", click_handler_4);
			}
		};
	}

	function click_handler$1(event) {
		var component = this._svelte.component;
		var each_value = this._svelte.each_value, k_index = this._svelte.k_index, k = each_value[k_index];
		component.toggleSelect(k.key, event);
	}

	function Color(options) {
		this._debugName = '<Color>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(assign(this.store._init(["vis","theme"]), data$2()), options.data);
		this.store._add(this, ["vis","theme"]);
		this._recompute({ $theme: 1, $vis: 1, customizable: 1, axis: 1, custom: 1, palette: 1, value: 1, selected: 1 }, this._state);
		if (!('$vis' in this._state)) console.warn("<Color> was created without expected data property '$vis'");
		if (!('customizable' in this._state)) console.warn("<Color> was created without expected data property 'customizable'");
		if (!('axis' in this._state)) console.warn("<Color> was created without expected data property 'axis'");
		if (!('custom' in this._state)) console.warn("<Color> was created without expected data property 'custom'");

		if (!('$theme' in this._state)) console.warn("<Color> was created without expected data property '$theme'");
		if (!('value' in this._state)) console.warn("<Color> was created without expected data property 'value'");
		if (!('selected' in this._state)) console.warn("<Color> was created without expected data property 'selected'");
		if (!('label' in this._state)) console.warn("<Color> was created without expected data property 'label'");

		if (!('open' in this._state)) console.warn("<Color> was created without expected data property 'open'");
		if (!('expanded' in this._state)) console.warn("<Color> was created without expected data property 'expanded'");


		if (!('openCustom' in this._state)) console.warn("<Color> was created without expected data property 'openCustom'");

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { $vis: 1, customizable: 1, axis: 1, custom: 1, palette: 1, $theme: 1, value: 1, selected: 1, label: 1, hexColor: 1, open: 1, expanded: 1, colorKeys: 1, customColor: 1, openCustom: 1 };
			oncreate$1.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$2(this, this._state);

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

	assign(Color.prototype, protoDev);
	assign(Color.prototype, methods$1);

	Color.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('palette' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'palette'");
		if ('colorKeys' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'colorKeys'");
		if ('hexColor' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'hexColor'");
		if ('customColor' in newState && !this._updatingReadonlyProperty) throw new Error("<Color>: Cannot set read-only property 'customColor'");
	};

	Color.prototype._recompute = function _recompute(changed, state) {
		if (changed.$theme) {
			if (this._differs(state.palette, (state.palette = palette_1(state)))) changed.palette = true;
		}

		if (changed.$vis || changed.customizable || changed.axis || changed.custom || changed.palette) {
			if (this._differs(state.colorKeys, (state.colorKeys = colorKeys(state)))) changed.colorKeys = true;
		}

		if (changed.value || changed.palette) {
			if (this._differs(state.hexColor, (state.hexColor = hexColor(state)))) changed.hexColor = true;
		}

		if (changed.selected || changed.palette || changed.custom) {
			if (this._differs(state.customColor, (state.customColor = customColor(state)))) changed.customColor = true;
		}
	};

	/* controls/ColorSimple.html generated by Svelte v1.64.0 */

	function palette_1$1({ $theme }) {
	    return $theme.colors.palette; //.concat($theme.colors.secondary || []);
	}
	function hexColor$1({ value, palette }) {
	    return getColor$1(value, palette);
	}
	function data$3() {
	    return {
	        open: false,
	        custom: {}
	    };
	}
	var methods$2 = {
	    update (color) {
	        const {palette} = this.get();
	        console.log('update', color);
	        this.set({value: storeColor$1(color, palette)});
	    },
	    getColor (color) {
	        const {palette} = this.get();
	        return getColor$1(color, palette);
	    },
	};

	function storeColor$1(color, palette) {
	    const pi = palette.indexOf(color);
	    if (pi > -1) return pi;
	    return color;
	}

	function getColor$1(color, palette) {
	    return typeof color == 'number' ? palette[color%palette.length] : color;
	}

	function create_main_fragment$3(component, state) {
		var if_block_anchor;

		var if_block = (state.hexColor) && create_if_block$2(component, state);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insertNode(if_block_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (state.hexColor) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$2(component, state);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}
			},

			u: function unmount() {
				if (if_block) if_block.u();
				detachNode(if_block_anchor);
			},

			d: function destroy$$1() {
				if (if_block) if_block.d();
			}
		};
	}

	// (1:0) {#if hexColor}
	function create_if_block$2(component, state) {
		var colorpicker_updating = {};

		var colorpicker_initial_data = { color: state.hexColor };
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
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function() {
			colorpicker._bind({ visible: 1 }, colorpicker.get());
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

	function ColorSimple(options) {
		this._debugName = '<ColorSimple>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(assign(this.store._init(["theme"]), data$3()), options.data);
		this.store._add(this, ["theme"]);
		this._recompute({ $theme: 1, value: 1, palette: 1 }, this._state);
		if (!('$theme' in this._state)) console.warn("<ColorSimple> was created without expected data property '$theme'");
		if (!('value' in this._state)) console.warn("<ColorSimple> was created without expected data property 'value'");


		if (!('open' in this._state)) console.warn("<ColorSimple> was created without expected data property 'open'");

		this._handlers.destroy = [removeFromStore];

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$3(this, this._state);

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

	assign(ColorSimple.prototype, protoDev);
	assign(ColorSimple.prototype, methods$2);

	ColorSimple.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('palette' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorSimple>: Cannot set read-only property 'palette'");
		if ('hexColor' in newState && !this._updatingReadonlyProperty) throw new Error("<ColorSimple>: Cannot set read-only property 'hexColor'");
	};

	ColorSimple.prototype._recompute = function _recompute(changed, state) {
		if (changed.$theme) {
			if (this._differs(state.palette, (state.palette = palette_1$1(state)))) changed.palette = true;
		}

		if (changed.value || changed.palette) {
			if (this._differs(state.hexColor, (state.hexColor = hexColor$1(state)))) changed.hexColor = true;
		}
	};

	/* controls/CustomFormat.html generated by Svelte v1.64.0 */

	function axisCol({ $vis, $dataset, axis }) {
	    if (!$vis || !axis) return null;
	    const colids = $vis.axes()[axis];
	    return $dataset.column(typeof colids == 'object' ? colids[0] : colids);
	}
	function customFormatHelp({ axisCol }) {
	    if (!axisCol) return;
	    if (axisCol.type() == 'date') return '<a href="http://momentjs.com/docs/#/displaying/format/" target="_blank">moment.js documentation</a>';
	    if (axisCol.type() == 'number') return '<a href="http://numeraljs.com/#format" target="_blank">numeral.js documentation</a>';
	    return '';
	}
	function options({ axisCol }) {
	    if (!axisCol) return [];
	    if (axisCol.type() == 'number') {
	        // todo: translate labels
	        return [
	            { l: '1,000[.00]', f: '0,0.[00]' },
	            { l: '0', f: '0' },
	            { l: '0.0', f: '0.0' },
	            { l: '0.00', f: '0.00' },
	            { l: '0.000', f: '0.000' },
	            { l: '0.[0]', f: '0.[0]' },
	            { l: '0.[00]', f: '0.[00]' },
	            { l: '0%', f: '0%' },
	            { l: '0.0%', f: '0.0%' },
	            { l: '0.00%', f: '0.00%' },
	            { l: '0.[0]%', f: '0.[0]%' },
	            { l: '0.[00]%', f: '0.[00]%' },
	            { l: '10,000', f: '0,0' },
	            { l: '1st', f: '0o' },
	            { l: '123k', f: '0a' },
	            { l: '123.4k', f: '0.[0]a' },
	            { l: '123.45k', f: '0.[00]a' },
	        ];
	    }
	    if (axisCol.type() == 'date') {
	        // todo translate
	        return [
	            { l: '2015, 2016', f: 'YYYY' },
	            { l: '2015 Q1, 2015 Q2', f: 'YYYY [Q]Q' },
	            { l: '2015, Q2, Q3', f: 'YYYY|\\QQ' },
	            { l: '2015, Feb, Mar', f: 'YYYY|MMM' },
	            { l: '’15, ’16', f: '’YY' },
	            { l: 'April, May', f: 'MMMM' },
	            { l: 'Apr, May', f: 'MMM' },
	            { l: 'Apr ’15, May ’15', f: 'MMM ’YY' },
	            { l: 'April, 2, 3', f: 'MMM|DD' },
	        ];
	    }
	}
	function data$4() {
	    return {
	        axis: false,
	        value: '',
	        custom: '',
	        selected: null
	    }
	}
	function oncreate$2() {
	    // watch select input
	    this.observe('selected', (sel, old) => {
	        if (sel == old) return;
	        const {custom} = this.get();
	        this.set({value: sel != 'custom' ? sel : custom+' '});
	    });
	    // watch external value changes
	    this.observe('value', (val, old) => {
	        if (val == old) return;
	        const {options} = this.get();
	        for (let o of options) {
	            if (o.f == val) return this.set({selected: val});
	        }
	        this.set({selected: 'custom', custom: val});
	    });
	    this.observe('custom', (val, old) => {
	        if (val == old) return;
	        const {selected} = this.get();
	        if (selected == 'custom') this.set({value:val});
	    });
	}
	function create_main_fragment$4(component, state) {
		var div, label, text_1, div_1, text_2, select, option, text_3, select_updating = false, text_4;

		var if_block = (state.selected == 'custom') && create_if_block$3(component, state);

		var each_value = state.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, assign(assign({}, state), {
				each_value: each_value,
				opt: each_value[i],
				opt_index: i
			}));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ selected: selectValue(select) });
			select_updating = false;
		}

		var if_block_1 = (state.selected == 'custom') && create_if_block_1$1(component, state);

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text_1 = createText("\n\n    ");
				div_1 = createElement("div");
				if (if_block) if_block.c();
				text_2 = createText("\n\n        ");
				select = createElement("select");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				option = createElement("option");
				text_3 = createText("(custom)");
				text_4 = createText("\n        ");
				if (if_block_1) if_block_1.c();
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label svelte-h47p2z";
				option.__value = "custom";
				option.value = option.__value;
				addListener(select, "change", select_change_handler);
				if (!('selected' in state)) component.root._beforecreate.push(select_change_handler);
				select.className = "svelte-h47p2z";
				div_1.className = "controls form-inline";
				div.className = "control-group vis-option-custom-format";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				label.innerHTML = state.label;
				appendNode(text_1, div);
				appendNode(div_1, div);
				if (if_block) if_block.m(div_1, null);
				appendNode(text_2, div_1);
				appendNode(select, div_1);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				appendNode(option, select);
				appendNode(text_3, option);

				selectOption(select, state.selected);

				appendNode(text_4, div_1);
				if (if_block_1) if_block_1.m(div_1, null);
			},

			p: function update(changed, state) {
				if (changed.label) {
					label.innerHTML = state.label;
				}

				if (state.selected == 'custom') {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$3(component, state);
						if_block.c();
						if_block.m(div_1, text_2);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				var each_value = state.options;

				if (changed.options) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							opt: each_value[i],
							opt_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$2(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(select, option);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}

				if (!select_updating) selectOption(select, state.selected);

				if (state.selected == 'custom') {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1$1(component, state);
						if_block_1.c();
						if_block_1.m(div_1, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}
			},

			u: function unmount() {
				label.innerHTML = '';

				detachNode(div);
				if (if_block) if_block.u();

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				if (if_block_1) if_block_1.u();
			},

			d: function destroy$$1() {
				if (if_block) if_block.d();

				destroyEach(each_blocks);

				removeListener(select, "change", select_change_handler);
				if (if_block_1) if_block_1.d();
			}
		};
	}

	// (8:8) {#if selected == 'custom'}
	function create_if_block$3(component, state) {
		var div, text, raw_before, raw_after, text_1;

		return {
			c: function create() {
				div = createElement("div");
				text = createText("For help on custom formats, check the ");
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text_1 = createText(".");
				this.h();
			},

			h: function hydrate() {
				div.className = "small svelte-h47p2z";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(text, div);
				appendNode(raw_before, div);
				raw_before.insertAdjacentHTML("afterend", state.customFormatHelp);
				appendNode(raw_after, div);
				appendNode(text_1, div);
			},

			p: function update(changed, state) {
				if (changed.customFormatHelp) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", state.customFormatHelp);
				}
			},

			u: function unmount() {
				detachBetween(raw_before, raw_after);

				detachNode(div);
			},

			d: noop
		};
	}

	// (15:8) {#each options as opt}
	function create_each_block$2(component, state) {
		var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
		var option, text_value = opt.l, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				this.h();
			},

			h: function hydrate() {
				option.__value = option_value_value = opt.f;
				option.value = option.__value;
			},

			m: function mount(target, anchor) {
				insertNode(option, target, anchor);
				appendNode(text, option);
			},

			p: function update(changed, state) {
				opt = state.opt;
				each_value = state.each_value;
				opt_index = state.opt_index;
				if ((changed.options) && text_value !== (text_value = opt.l)) {
					text.data = text_value;
				}

				if ((changed.options) && option_value_value !== (option_value_value = opt.f)) {
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

	// (20:8) {#if selected == 'custom'}
	function create_if_block_1$1(component, state) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			component.set({ custom: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				this.h();
			},

			h: function hydrate() {
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.className = "svelte-h47p2z";
			},

			m: function mount(target, anchor) {
				insertNode(input, target, anchor);

				input.value = state.custom;
			},

			p: function update(changed, state) {
				if (!input_updating) input.value = state.custom;
			},

			u: function unmount() {
				detachNode(input);
			},

			d: function destroy$$1() {
				removeListener(input, "input", input_input_handler);
			}
		};
	}

	function CustomFormat(options) {
		this._debugName = '<CustomFormat>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(assign(this.store._init(["vis","dataset"]), data$4()), options.data);
		this.store._add(this, ["vis","dataset"]);
		this._recompute({ $vis: 1, $dataset: 1, axis: 1, axisCol: 1 }, this._state);

		if (!('$vis' in this._state)) console.warn("<CustomFormat> was created without expected data property '$vis'");
		if (!('$dataset' in this._state)) console.warn("<CustomFormat> was created without expected data property '$dataset'");
		if (!('axis' in this._state)) console.warn("<CustomFormat> was created without expected data property 'axis'");
		if (!('label' in this._state)) console.warn("<CustomFormat> was created without expected data property 'label'");
		if (!('selected' in this._state)) console.warn("<CustomFormat> was created without expected data property 'selected'");


		if (!('custom' in this._state)) console.warn("<CustomFormat> was created without expected data property 'custom'");

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { axisCol: 1, $vis: 1, $dataset: 1, axis: 1, label: 1, selected: 1, customFormatHelp: 1, options: 1, custom: 1 };
			oncreate$2.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
		}

		this._fragment = create_main_fragment$4(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._beforecreate);
			callAll(this._oncreate);
		}
	}

	assign(CustomFormat.prototype, protoDev);

	CustomFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('axisCol' in newState && !this._updatingReadonlyProperty) throw new Error("<CustomFormat>: Cannot set read-only property 'axisCol'");
		if ('customFormatHelp' in newState && !this._updatingReadonlyProperty) throw new Error("<CustomFormat>: Cannot set read-only property 'customFormatHelp'");
		if ('options' in newState && !this._updatingReadonlyProperty) throw new Error("<CustomFormat>: Cannot set read-only property 'options'");
	};

	CustomFormat.prototype._recompute = function _recompute(changed, state) {
		if (changed.$vis || changed.$dataset || changed.axis) {
			if (this._differs(state.axisCol, (state.axisCol = axisCol(state)))) changed.axisCol = true;
		}

		if (changed.axisCol) {
			if (this._differs(state.customFormatHelp, (state.customFormatHelp = customFormatHelp(state)))) changed.customFormatHelp = true;
			if (this._differs(state.options, (state.options = options(state)))) changed.options = true;
		}
	};

	/* controls/Group.html generated by Svelte v1.64.0 */

	function create_main_fragment$5(component, state) {
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

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Group.prototype, protoDev);

	Group.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Number.html generated by Svelte v1.64.0 */

	function data$5() {
	    return {
	        unit: '',
	        width: '100px'
	    };
	}
	function create_main_fragment$6(component, state) {
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
				addListener(input, "input", input_input_handler);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "range");
				input.min = state.min;
				input.max = state.max;
				input.step = state.step;
				input.className = "svelte-l16hlj";
				addListener(input_1, "input", input_1_input_handler);
				setAttribute(input_1, "type", "number");
				input_1.min = state.min;
				input_1.max = state.max;
				input_1.step = state.step;
				input_1.className = "svelte-l16hlj";
				span.className = "unit svelte-l16hlj";
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
		this._state = assign(data$5(), options.data);
		if (!('width' in this._state)) console.warn("<Number> was created without expected data property 'width'");
		if (!('label' in this._state)) console.warn("<Number> was created without expected data property 'label'");
		if (!('min' in this._state)) console.warn("<Number> was created without expected data property 'min'");
		if (!('max' in this._state)) console.warn("<Number> was created without expected data property 'max'");
		if (!('step' in this._state)) console.warn("<Number> was created without expected data property 'step'");
		if (!('value' in this._state)) console.warn("<Number> was created without expected data property 'value'");
		if (!('unit' in this._state)) console.warn("<Number> was created without expected data property 'unit'");

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Number.prototype, protoDev);

	Number.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Radio.html generated by Svelte v1.64.0 */

	function create_main_fragment$7(component, state) {
		var div, label, text_1, div_1;

		var each_value = state.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, assign(assign({}, state), {
				each_value: each_value,
				opt: each_value[i],
				opt_index: i
			}));
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

				var each_value = state.options;

				if (changed.options || changed.value) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							opt: each_value[i],
							opt_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$3(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(div_1, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
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

	// (7:8) {#each options as opt}
	function create_each_block$3(component, state) {
		var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
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
				setAttribute(input, "type", "radio");
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

			p: function update(changed, state) {
				opt = state.opt;
				each_value = state.each_value;
				opt_index = state.opt_index;
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

		this._fragment = create_main_fragment$7(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Radio.prototype, protoDev);

	Radio.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Select.html generated by Svelte v1.64.0 */

	function data$6() {
	    return {
	        disabled: false,
	        width: 'auto',
	        options: [],
	        optgroups: [],
	    };
	}
	function create_main_fragment$8(component, state) {
		var div, label, text_1, div_1, select, if_block_anchor, select_updating = false, div_1_class_value;

		var if_block = (state.options.length) && create_if_block$4(component, state);

		var if_block_1 = (state.optgroups.length) && create_if_block_1$2(component, state);

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
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				if (if_block_1) if_block_1.c();
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label";
				addListener(select, "change", select_change_handler);
				if (!('value' in state)) component.root._beforecreate.push(select_change_handler);
				select.disabled = state.disabled;
				setStyle(select, "width", state.width);
				div_1.className = div_1_class_value = "controls form-inline " + (state.disabled? 'disabled' :'');
				div.className = "control-group vis-option-type-select";
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
				if (if_block_1) if_block_1.m(select, null);

				selectOption(select, state.value);
			},

			p: function update(changed, state) {
				if (changed.label) {
					label.innerHTML = state.label;
				}

				if (state.options.length) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$4(component, state);
						if_block.c();
						if_block.m(select, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (state.optgroups.length) {
					if (if_block_1) {
						if_block_1.p(changed, state);
					} else {
						if_block_1 = create_if_block_1$2(component, state);
						if_block_1.c();
						if_block_1.m(select, null);
					}
				} else if (if_block_1) {
					if_block_1.u();
					if_block_1.d();
					if_block_1 = null;
				}

				if (!select_updating) selectOption(select, state.value);
				if (changed.disabled) {
					select.disabled = state.disabled;
				}

				if (changed.width) {
					setStyle(select, "width", state.width);
				}

				if ((changed.disabled) && div_1_class_value !== (div_1_class_value = "controls form-inline " + (state.disabled? 'disabled' :''))) {
					div_1.className = div_1_class_value;
				}
			},

			u: function unmount() {
				label.innerHTML = '';

				detachNode(div);
				if (if_block) if_block.u();
				if (if_block_1) if_block_1.u();
			},

			d: function destroy$$1() {
				if (if_block) if_block.d();
				if (if_block_1) if_block_1.d();
				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (9:12) {#each options as opt}
	function create_each_block$4(component, state) {
		var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
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

			p: function update(changed, state) {
				opt = state.opt;
				each_value = state.each_value;
				opt_index = state.opt_index;
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

	// (8:8) {#if options.length}
	function create_if_block$4(component, state) {
		var each_anchor;

		var each_value = state.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(component, assign(assign({}, state), {
				each_value: each_value,
				opt: each_value[i],
				opt_index: i
			}));
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

				insertNode(each_anchor, target, anchor);
			},

			p: function update(changed, state) {
				var each_value = state.options;

				if (changed.options) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							opt: each_value[i],
							opt_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$4(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value.length;
				}
			},

			u: function unmount() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				detachNode(each_anchor);
			},

			d: function destroy$$1() {
				destroyEach(each_blocks);
			}
		};
	}

	// (14:12) {#each optgroups as optgroup}
	function create_each_block_1$1(component, state) {
		var optgroup = state.optgroup, each_value_1 = state.each_value_1, optgroup_index = state.optgroup_index;
		var optgroup_1, optgroup_1_label_value;

		var each_value_2 = optgroup.options;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2$1(component, assign(assign({}, state), {
				each_value_2: each_value_2,
				opt: each_value_2[i],
				opt_index_1: i
			}));
		}

		return {
			c: function create() {
				optgroup_1 = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				this.h();
			},

			h: function hydrate() {
				setAttribute(optgroup_1, "label", optgroup_1_label_value = optgroup.label);
			},

			m: function mount(target, anchor) {
				insertNode(optgroup_1, target, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(optgroup_1, null);
				}
			},

			p: function update(changed, state) {
				optgroup = state.optgroup;
				each_value_1 = state.each_value_1;
				optgroup_index = state.optgroup_index;
				var each_value_2 = optgroup.options;

				if (changed.optgroups) {
					for (var i = 0; i < each_value_2.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value_2: each_value_2,
							opt: each_value_2[i],
							opt_index_1: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block_2$1(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(optgroup_1, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value_2.length;
				}

				if ((changed.optgroups) && optgroup_1_label_value !== (optgroup_1_label_value = optgroup.label)) {
					setAttribute(optgroup_1, "label", optgroup_1_label_value);
				}
			},

			u: function unmount() {
				detachNode(optgroup_1);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy$$1() {
				destroyEach(each_blocks);
			}
		};
	}

	// (16:16) {#each optgroup.options as opt}
	function create_each_block_2$1(component, state) {
		var optgroup = state.optgroup, each_value_1 = state.each_value_1, optgroup_index = state.optgroup_index, opt = state.opt, each_value_2 = state.each_value_2, opt_index_1 = state.opt_index_1;
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

			p: function update(changed, state) {
				optgroup = state.optgroup;
				each_value_1 = state.each_value_1;
				optgroup_index = state.optgroup_index;
				opt = state.opt;
				each_value_2 = state.each_value_2;
				opt_index_1 = state.opt_index_1;
				if ((changed.optgroups) && text_value !== (text_value = opt.label)) {
					text.data = text_value;
				}

				if ((changed.optgroups) && option_value_value !== (option_value_value = opt.value)) {
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

	// (13:8) {#if optgroups.length}
	function create_if_block_1$2(component, state) {
		var each_anchor;

		var each_value_1 = state.optgroups;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(component, assign(assign({}, state), {
				each_value_1: each_value_1,
				optgroup: each_value_1[i],
				optgroup_index: i
			}));
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

				insertNode(each_anchor, target, anchor);
			},

			p: function update(changed, state) {
				var each_value_1 = state.optgroups;

				if (changed.optgroups) {
					for (var i = 0; i < each_value_1.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value_1: each_value_1,
							optgroup: each_value_1[i],
							optgroup_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block_1$1(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value_1.length;
				}
			},

			u: function unmount() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				detachNode(each_anchor);
			},

			d: function destroy$$1() {
				destroyEach(each_blocks);
			}
		};
	}

	function Select(options) {
		this._debugName = '<Select>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(data$6(), options.data);
		if (!('label' in this._state)) console.warn("<Select> was created without expected data property 'label'");
		if (!('disabled' in this._state)) console.warn("<Select> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<Select> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<Select> was created without expected data property 'width'");
		if (!('options' in this._state)) console.warn("<Select> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<Select> was created without expected data property 'optgroups'");

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
		}

		this._fragment = create_main_fragment$8(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._beforecreate);
		}
	}

	assign(Select.prototype, protoDev);

	Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/Section.html generated by Svelte v1.64.0 */

	function create_main_fragment$9(component, state) {
		var if_block_anchor;

		var if_block = (state.id==state.active) && create_if_block$5(component, state);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insertNode(if_block_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (state.id==state.active) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block$5(component, state);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}
			},

			u: function unmount() {
				if (if_block) if_block.u();
				detachNode(if_block_anchor);
			},

			d: function destroy$$1() {
				if (if_block) if_block.d();
			}
		};
	}

	// (1:0) {#if id==active}
	function create_if_block$5(component, state) {
		var div, fieldset, div_1, slot_content_default = component._slotted.default, div_class_value;

		return {
			c: function create() {
				div = createElement("div");
				fieldset = createElement("fieldset");
				div_1 = createElement("div");
				this.h();
			},

			h: function hydrate() {
				div_1.className = "control-group vis-option-group";
				fieldset.id = "visOptions";
				div.className = div_class_value = "section " + state.id;
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(fieldset, div);
				appendNode(div_1, fieldset);

				if (slot_content_default) {
					appendNode(slot_content_default, div_1);
				}
			},

			p: function update(changed, state) {
				if ((changed.id) && div_class_value !== (div_class_value = "section " + state.id)) {
					div.className = div_class_value;
				}
			},

			u: function unmount() {
				detachNode(div);

				if (slot_content_default) {
					reinsertChildren(div_1, slot_content_default);
				}
			},

			d: noop
		};
	}

	function Section(options) {
		this._debugName = '<Section>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign({}, options.data);
		if (!('id' in this._state)) console.warn("<Section> was created without expected data property 'id'");
		if (!('active' in this._state)) console.warn("<Section> was created without expected data property 'active'");

		this._slotted = options.slots || {};

		this.slots = {};

		this._fragment = create_main_fragment$9(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Section.prototype, protoDev);

	Section.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/TextArea.html generated by Svelte v1.64.0 */

	function data$7() {
	    return {
	        placeholder: ''
	    }
	}
	function create_main_fragment$10(component, state) {
		var div, label, text, text_1, div_1, textarea, textarea_updating = false;

		function textarea_input_handler() {
			textarea_updating = true;
			component.set({ value: textarea.value });
			textarea_updating = false;
		}

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text = createText(state.label);
				text_1 = createText("\n    ");
				div_1 = createElement("div");
				textarea = createElement("textarea");
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label";
				addListener(textarea, "input", textarea_input_handler);
				textarea.placeholder = state.placeholder;
				setStyle(textarea, "width", ( state.width || 'auto' ));
				div_1.className = "controls";
				div.className = "control-group vis-option-group vis-option-type-textarea";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				appendNode(text, label);
				appendNode(text_1, div);
				appendNode(div_1, div);
				appendNode(textarea, div_1);

				textarea.value = state.value;
			},

			p: function update(changed, state) {
				if (changed.label) {
					text.data = state.label;
				}

				if (!textarea_updating) textarea.value = state.value;
				if (changed.placeholder) {
					textarea.placeholder = state.placeholder;
				}

				if (changed.width) {
					setStyle(textarea, "width", ( state.width || 'auto' ));
				}
			},

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy$$1() {
				removeListener(textarea, "input", textarea_input_handler);
			}
		};
	}

	function TextArea(options) {
		this._debugName = '<TextArea>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this._state = assign(data$7(), options.data);
		if (!('label' in this._state)) console.warn("<TextArea> was created without expected data property 'label'");
		if (!('value' in this._state)) console.warn("<TextArea> was created without expected data property 'value'");
		if (!('placeholder' in this._state)) console.warn("<TextArea> was created without expected data property 'placeholder'");
		if (!('width' in this._state)) console.warn("<TextArea> was created without expected data property 'width'");

		this._fragment = create_main_fragment$10(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(TextArea.prototype, protoDev);

	TextArea.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* controls/SelectAxisColumn.html generated by Svelte v1.64.0 */

	function columns({ axis, $visMeta, $dataset }) {
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
	function data$8() {
	    return {
	        selected: false
	    };
	}
	function oncreate$3() {
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
	function create_main_fragment$11(component, state) {
		var div, label, text_1, div_1, select, if_block_anchor, select_updating = false;

		var if_block = (state.$visMeta && state.$visMeta.axes[state.axis].optional) && create_if_block$6(component, state);

		var each_value = state.columns;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(component, assign(assign({}, state), {
				each_value: each_value,
				column: each_value[i],
				column_index: i
			}));
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
				label.className = "control-label svelte-7khi8i";
				addListener(select, "change", select_change_handler);
				if (!('selected' in state)) component.root._beforecreate.push(select_change_handler);
				select.className = "svelte-7khi8i";
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
						if_block = create_if_block$6(component, state);
						if_block.c();
						if_block.m(select, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				var each_value = state.columns;

				if (changed.columns) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							column: each_value[i],
							column_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block$5(component, each_context);
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

	// (8:12) {#if $visMeta && $visMeta.axes[axis].optional}
	function create_if_block$6(component, state) {
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

	// (11:12) {#each columns as column}
	function create_each_block$5(component, state) {
		var column = state.column, each_value = state.each_value, column_index = state.column_index;
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

			p: function update(changed, state) {
				column = state.column;
				each_value = state.each_value;
				column_index = state.column_index;
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
		this._state = assign(assign(this.store._init(["visMeta","dataset"]), data$8()), options.data);
		this.store._add(this, ["visMeta","dataset"]);
		this._recompute({ axis: 1, $visMeta: 1, $dataset: 1 }, this._state);
		if (!('axis' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property 'axis'");
		if (!('$visMeta' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property '$visMeta'");
		if (!('$dataset' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property '$dataset'");
		if (!('label' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property 'label'");
		if (!('selected' in this._state)) console.warn("<SelectAxisColumn> was created without expected data property 'selected'");

		this._handlers.destroy = [removeFromStore];

		var self = this;
		var _oncreate = function() {
			var changed = { axis: 1, $visMeta: 1, $dataset: 1, label: 1, selected: 1, columns: 1 };
			oncreate$3.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
		}

		this._fragment = create_main_fragment$11(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

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
			if (this._differs(state.columns, (state.columns = columns(state)))) changed.columns = true;
		}
	};

	var main = {
	    Checkbox, Color, ColorSimple, ColorPicker, Group, NumberInput: Number,
	    Radio, Select, SelectAxisColumn, CustomFormat, Section, TextArea
	};

	return main;

})));
