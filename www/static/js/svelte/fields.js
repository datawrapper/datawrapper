(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/fields', factory) :
	(global = global || self, global.fields = factory());
}(this, function () { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) { tar[k] = src[k]; }
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) { tar[k] = 1; }
		return tar;
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file: file, line: line, column: column, char: char }
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

	function detachBetween(before, after) {
		while (before.nextSibling && before.nextSibling !== after) {
			before.parentNode.removeChild(before.nextSibling);
		}
	}

	function detachBefore(after) {
		while (after.previousSibling) {
			after.parentNode.removeChild(after.previousSibling);
		}
	}

	function detachAfter(before) {
		while (before.nextSibling) {
			before.parentNode.removeChild(before.nextSibling);
		}
	}

	function reinsertChildren(parent, target) {
		while (parent.firstChild) { target.appendChild(parent.firstChild); }
	}

	function reinsertAfter(before, target) {
		while (before.nextSibling) { target.appendChild(before.nextSibling); }
	}

	function reinsertBefore(after, target) {
		var parent = after.parentNode;
		while (parent.firstChild !== after) { target.appendChild(parent.firstChild); }
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) { iterations[i].d(detach); }
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
		if (value == null) { node.removeAttribute(attribute); }
		else { node.setAttribute(attribute, value); }
	}

	function setXlinkAttribute(node, attribute, value) {
		node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
	}

	function toNumber(value) {
		return value === '' ? undefined : +value;
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

	function generateRule(ref, ease, fn) {
		var a = ref.a;
		var b = ref.b;
		var delta = ref.delta;
		var duration = ref.duration;

		var step = 16.666 / duration;
		var keyframes = '{\n';

		for (var p = 0; p <= 1; p += step) {
			var t = a + delta * ease(p);
			keyframes += p * 100 + "%{" + (fn(t, 1 - t)) + "}\n";
		}

		return keyframes + "100% {" + (fn(b, 1 - b)) + "}\n}";
	}

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
		var hash = 5381;
		var i = str.length;

		while (i--) { hash = ((hash << 5) - hash) ^ str.charCodeAt(i); }
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
				var this$1 = this;

				if (typeof obj === 'function') {
					transitionManager.wait().then(function () {
						obj = obj();
						this$1._run(b, callback);
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

					if (obj.tick) { obj.tick(0, 1); }
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
				component.fire(((program.b ? 'intro' : 'outro') + ".start"), { node: node });

				program.a = this.t;
				program.delta = program.b - program.a;
				program.duration = duration * Math.abs(program.b - program.a);
				program.end = program.start + program.duration;

				if (obj.css) {
					if (obj.delay) { node.style.cssText = cssText; }

					var rule = generateRule(program, ease, obj.css);
					transitionManager.addRule(rule, program.name = '__svelte_' + hash(rule));

					node.style.animation = (node.style.animation || '')
						.split(', ')
						.filter(function (anim) { return anim && (program.delta < 0 || !/__svelte/.test(anim)); })
						.concat(((program.name) + " " + (program.duration) + "ms linear 1 forwards"))
						.join(', ');
				}

				this.program = program;
				this.pending = null;
			},

			update: function update(now) {
				var program = this.program;
				if (!program) { return; }

				var p = now - program.start;
				this.t = program.a + program.delta * ease(p / program.duration);
				if (obj.tick) { obj.tick(this.t, 1 - this.t); }
			},

			done: function done() {
				var program = this.program;
				this.t = program.b;

				if (obj.tick) { obj.tick(this.t, 1 - this.t); }

				component.fire(((program.b ? 'intro' : 'outro') + ".end"), { node: node });

				if (!program.b && !program.invalidated) {
					program.group.callbacks.push(function () {
						program.callback();
						if (obj.css) { transitionManager.deleteRule(node, program.name); }
					});

					if (--program.group.remaining === 0) {
						program.group.callbacks.forEach(run);
					}
				} else {
					if (obj.css) { transitionManager.deleteRule(node, program.name); }
				}

				this.running = !!this.pending;
			},

			abort: function abort(reset) {
				if (this.program) {
					if (reset && obj.tick) { obj.tick(1, 0); }
					if (obj.css) { transitionManager.deleteRule(node, this.program.name); }
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
				this.stylesheet.insertRule(("@keyframes " + name + " " + rule), this.stylesheet.cssRules.length);
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
				var i$1 = this.stylesheet.cssRules.length;
				while (i$1--) { this.stylesheet.deleteRule(i$1); }
				this.activeRules = {};
			}
		},

		deleteRule: function deleteRule(node, name) {
			node.style.animation = node.style.animation
				.split(', ')
				.filter(function (anim) { return anim && anim.indexOf(name) === -1; })
				.join(', ');
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

	function getSpreadUpdate(levels, updates) {
		var update = {};

		var to_null_out = {};
		var accounted_for = {};

		var i = levels.length;
		while (i--) {
			var o = levels[i];
			var n = updates[i];

			if (n) {
				for (var key in o) {
					if (!(key in n)) { to_null_out[key] = 1; }
				}

				for (var key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}

				levels[i] = n;
			} else {
				for (var key in o) {
					accounted_for[key] = 1;
				}
			}
		}

		for (var key in to_null_out) {
			if (!(key in update)) { update[key] = undefined; }
		}

		return update;
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
		if (!handlers) { return; }

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
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) { handlers.splice(index, 1); }
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) { return; }
		flush(this.root);
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		newState = assign(this._staged, newState);
		this._staged = {};

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
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

	function _stage(newState) {
		assign(this._staged, newState);
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

	/* node_modules/@datawrapper/controls/Alert.html generated by Svelte v2.16.1 */

	function data() {
	    return {
	        visible: false,
	        type: '',
	        closeable: true
	    };
	}
	var file = "node_modules/datawrapper/controls/Alert.html";

	function create_main_fragment(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.visible) && create_if_block(component, ctx);

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.visible) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if visible}
	function create_if_block(component, ctx) {
		var div, text0, slot_content_default = component._slotted.default, slot_content_default_before, text1;

		var if_block = (ctx.closeable) && create_if_block_1(component);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block) { if_block.c(); }
				text0 = createText("\n    ");
				if (!slot_content_default) {
					text1 = createText("content");
				}
				div.className = "alert svelte-9b8qew";
				toggleClass(div, "alert-success", ctx.type==='success');
				toggleClass(div, "alert-warning", ctx.type==='warning');
				toggleClass(div, "alert-error", ctx.type==='error');
				addLoc(div, file, 1, 0, 14);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block) { if_block.m(div, null); }
				append(div, text0);
				if (!slot_content_default) {
					append(div, text1);
				}

				else {
					append(div, slot_content_default_before || (slot_content_default_before = createComment()));
					append(div, slot_content_default);
				}
			},

			p: function update(changed, ctx) {
				if (ctx.closeable) {
					if (!if_block) {
						if_block = create_if_block_1(component);
						if_block.c();
						if_block.m(div, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.type) {
					toggleClass(div, "alert-success", ctx.type==='success');
					toggleClass(div, "alert-warning", ctx.type==='warning');
					toggleClass(div, "alert-error", ctx.type==='error');
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block) { if_block.d(); }

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}
			}
		};
	}

	// (3:4) {#if closeable}
	function create_if_block_1(component, ctx) {
		var button;

		function click_handler(event) {
			component.set({ visible: false });
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "×";
				addListener(button, "click", click_handler);
				button.type = "button";
				button.className = "close";
				addLoc(button, file, 3, 4, 171);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	function Alert(options) {
		this._debugName = '<Alert>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('visible' in this._state)) { console.warn("<Alert> was created without expected data property 'visible'"); }
		if (!('type' in this._state)) { console.warn("<Alert> was created without expected data property 'type'"); }
		if (!('closeable' in this._state)) { console.warn("<Alert> was created without expected data property 'closeable'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Alert.prototype, protoDev);

	Alert.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/BaseNumber.html generated by Svelte v2.16.1 */

	function step_(ref) {
	    var step = ref.step;

	    return step || 1;
	}
	function min_(ref) {
	    var min = ref.min;

	    return min !== undefined ? min : 0;
	}
	function max_(ref) {
	    var max = ref.max;

	    return max !== undefined ? max : 100;
	}
	function unit_(ref) {
	    var unit = ref.unit;

	    return unit !== undefined ? unit : '';
	}
	function slider_(ref) {
	    var slider = ref.slider;

	    return slider !== undefined ? slider : true;
	}
	function multiply_(ref) {
	    var multiply = ref.multiply;

	    return multiply || 1;
	}
	function data$1() {
	    return {
	        value2: null,
	        unit: '',
	        multiply: 1,
	        width: '40px',
	        min: 0,
	        max: 100,
	        disabled: false,
	        step: 1
	    };
	}
	var methods = {
	    update: function update() {
	        // update outside world value
	        var ref = this.get();
	        var value2 = ref.value2;
	        var multiply_ = ref.multiply_;
	        var step_ = ref.step_;
	        var decimals = Math.max(0, -Math.floor(Math.log(step_ * multiply_) / Math.LN10));
	        var value = value2 ? +value2.toFixed(decimals) / multiply_ : 0;
	        this.set({ value: value });
	    },
	    refresh: function refresh() {
	        var ref = this.get();
	        var value = ref.value;
	        var multiply_ = ref.multiply_;
	        var step_ = ref.step_;
	        var decimals = Math.max(0, -Math.floor(Math.log(step_ * multiply_) / Math.LN10));
	        var value2 = +(value * multiply_).toFixed(decimals);
	        this.set({ value2: value2 });
	    }
	};

	function onupdate(ref) {
	    var this$1 = this;
	    var changed = ref.changed;
	    var current = ref.current;
	    var previous = ref.previous;

	    if (!this.refs.input) {
	        // this is a workaround for a bug whereby the value is not initially set
	        // in Number component which is wrapped in an if statement
	        return setTimeout(function () {
	            this$1.refresh();
	        }, 0);
	    }

	    if (changed.value || !previous) {
	        this.refresh();
	    }
	}
	var file$1 = "node_modules/datawrapper/controls/BaseNumber.html";

	function create_main_fragment$1(component, ctx) {
		var input, input_updating = false, input_min_value, input_max_value, input_step_value, text, if_block1_anchor;

		var if_block0 = (ctx.slider_) && create_if_block_1$1(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ value2: toNumber(input.value) });
			input_updating = false;
		}

		function input_handler(event) {
			component.update();
		}

		var if_block1 = (ctx.unit_) && create_if_block$1(component, ctx);

		return {
			c: function create() {
				if (if_block0) { if_block0.c(); }
				input = createElement("input");
				text = createText("\n");
				if (if_block1) { if_block1.c(); }
				if_block1_anchor = createComment();
				addListener(input, "input", input_input_handler);
				addListener(input, "input", input_handler);
				setAttribute(input, "type", "number");
				input.min = input_min_value = ctx.min_*ctx.multiply_;
				input.disabled = ctx.disabled;
				input.max = input_max_value = ctx.max_*ctx.multiply_;
				input.step = input_step_value = ctx.step_*ctx.multiply_;
				setStyle(input, "width", "" + ctx.width + (ctx.slider_?'margin-left:10px':''));
				input.className = "svelte-1ton5as";
				addLoc(input, file$1, 8, 19, 213);
			},

			m: function mount(target, anchor) {
				if (if_block0) { if_block0.m(target, anchor); }
				insert(target, input, anchor);
				component.refs.input = input;

				input.value = ctx.value2;

				insert(target, text, anchor);
				if (if_block1) { if_block1.m(target, anchor); }
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.slider_) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$1(component, ctx);
						if_block0.c();
						if_block0.m(input.parentNode, input);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!input_updating && changed.value2) { input.value = ctx.value2; }
				if ((changed.min_ || changed.multiply_) && input_min_value !== (input_min_value = ctx.min_*ctx.multiply_)) {
					input.min = input_min_value;
				}

				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if ((changed.max_ || changed.multiply_) && input_max_value !== (input_max_value = ctx.max_*ctx.multiply_)) {
					input.max = input_max_value;
				}

				if ((changed.step_ || changed.multiply_) && input_step_value !== (input_step_value = ctx.step_*ctx.multiply_)) {
					input.step = input_step_value;
				}

				if (changed.width || changed.slider_) {
					setStyle(input, "width", "" + ctx.width + (ctx.slider_?'margin-left:10px':''));
				}

				if (ctx.unit_) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$1(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (if_block0) { if_block0.d(detach); }
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
				removeListener(input, "input", input_handler);
				if (component.refs.input === input) { component.refs.input = null; }
				if (detach) {
					detachNode(text);
				}

				if (if_block1) { if_block1.d(detach); }
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (1:0) {#if slider_}
	function create_if_block_1$1(component, ctx) {
		var input, input_min_value, input_max_value, input_step_value, text;

		function input_change_input_handler() {
			component.set({ value2: toNumber(input.value) });
		}

		function input_handler(event) {
			component.update();
		}

		return {
			c: function create() {
				input = createElement("input");
				text = createText("  ");
				addListener(input, "change", input_change_input_handler);
				addListener(input, "input", input_change_input_handler);
				addListener(input, "input", input_handler);
				setAttribute(input, "type", "range");
				input.min = input_min_value = ctx.min_*ctx.multiply_;
				input.max = input_max_value = ctx.max_*ctx.multiply_;
				input.step = input_step_value = ctx.step_*ctx.multiply_;
				input.disabled = ctx.disabled;
				input.className = "svelte-1ton5as";
				addLoc(input, file$1, 0, 13, 13);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.value2;

				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.value2) { input.value = ctx.value2; }
				if ((changed.min_ || changed.multiply_) && input_min_value !== (input_min_value = ctx.min_*ctx.multiply_)) {
					input.min = input_min_value;
				}

				if ((changed.max_ || changed.multiply_) && input_max_value !== (input_max_value = ctx.max_*ctx.multiply_)) {
					input.max = input_max_value;
				}

				if ((changed.step_ || changed.multiply_) && input_step_value !== (input_step_value = ctx.step_*ctx.multiply_)) {
					input.step = input_step_value;
				}

				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "change", input_change_input_handler);
				removeListener(input, "input", input_change_input_handler);
				removeListener(input, "input", input_handler);
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (20:0) {#if unit_}
	function create_if_block$1(component, ctx) {
		var span, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(ctx.unit_);
				span.className = "unit svelte-1ton5as";
				addLoc(span, file$1, 19, 11, 481);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if (changed.unit_) {
					setData(text, ctx.unit_);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	function BaseNumber(options) {
		var this$1 = this;

		this._debugName = '<BaseNumber>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$1(), options.data);

		this._recompute({ step: 1, min: 1, max: 1, unit: 1, slider: 1, multiply: 1 }, this._state);
		if (!('step' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'step'"); }
		if (!('min' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'min'"); }
		if (!('max' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'max'"); }
		if (!('unit' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'unit'"); }
		if (!('slider' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'slider'"); }
		if (!('multiply' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'multiply'"); }





		if (!('disabled' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'disabled'"); }
		if (!('value2' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'value2'"); }
		if (!('width' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'width'"); }
		this._intro = true;
		this._handlers.update = [onupdate];

		this._fragment = create_main_fragment$1(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(BaseNumber.prototype, protoDev);
	assign(BaseNumber.prototype, methods);

	BaseNumber.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('step_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'step_'"); }
		if ('min_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'min_'"); }
		if ('max_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'max_'"); }
		if ('unit_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'unit_'"); }
		if ('slider_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'slider_'"); }
		if ('multiply_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'multiply_'"); }
	};

	BaseNumber.prototype._recompute = function _recompute(changed, state) {
		if (changed.step) {
			if (this._differs(state.step_, (state.step_ = step_(state)))) { changed.step_ = true; }
		}

		if (changed.min) {
			if (this._differs(state.min_, (state.min_ = min_(state)))) { changed.min_ = true; }
		}

		if (changed.max) {
			if (this._differs(state.max_, (state.max_ = max_(state)))) { changed.max_ = true; }
		}

		if (changed.unit) {
			if (this._differs(state.unit_, (state.unit_ = unit_(state)))) { changed.unit_ = true; }
		}

		if (changed.slider) {
			if (this._differs(state.slider_, (state.slider_ = slider_(state)))) { changed.slider_ = true; }
		}

		if (changed.multiply) {
			if (this._differs(state.multiply_, (state.multiply_ = multiply_(state)))) { changed.multiply_ = true; }
		}
	};

	/* node_modules/@datawrapper/controls/BaseDropdown.html generated by Svelte v2.16.1 */

	function data$2() {
	    return {
	        visible: false,
	        disabled: false,
	        width: 'auto'
	    };
	}
	var methods$1 = {
	    toggle: function toggle(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var visible = ref.visible;
	        var disabled = ref.disabled;
	        if (disabled) { return; }
	        this.set({ visible: !visible });
	    },
	    windowClick: function windowClick(event) {
	        if (
	            !event.target ||
	            (this.refs && this.refs.button && (event.target === this.refs.button || this.refs.button.contains(event.target)))
	        )
	            { return; }
	        // this is a hack for the colorpicker, need to find out how to get rid of
	        if (event.target.classList.contains('hex')) { return; }
	        this.set({ visible: false });
	    }
	};

	var file$2 = "node_modules/datawrapper/controls/BaseDropdown.html";

	function create_main_fragment$2(component, ctx) {
		var div, a, slot_content_button = component._slotted.button, button, i, i_class_value, text;

		function onwindowclick(event) {
			component.windowClick(event);	}
		window.addEventListener("click", onwindowclick);

		function click_handler(event) {
			component.toggle(event);
		}

		var if_block = (ctx.visible) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				a = createElement("a");
				if (!slot_content_button) {
					button = createElement("button");
					i = createElement("i");
				}
				text = createText("\n    ");
				if (if_block) { if_block.c(); }
				if (!slot_content_button) {
					i.className = i_class_value = "fa fa-chevron-" + (ctx.visible ? 'up' : 'down') + " svelte-1jdtmzv";
					addLoc(i, file$2, 5, 42, 264);
					button.className = "btn btn-small";
					addLoc(button, file$2, 5, 12, 234);
				}
				addListener(a, "click", click_handler);
				a.href = "#dropdown-btn";
				a.className = "base-drop-btn svelte-1jdtmzv";
				addLoc(a, file$2, 3, 4, 110);
				setStyle(div, "position", "relative");
				setStyle(div, "display", "inline-block");
				addLoc(div, file$2, 2, 0, 49);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, a);
				if (!slot_content_button) {
					append(a, button);
					append(button, i);
				}

				else {
					append(a, slot_content_button);
				}

				component.refs.button = a;
				append(div, text);
				if (if_block) { if_block.m(div, null); }
			},

			p: function update(changed, ctx) {
				if (!slot_content_button) {
					if ((changed.visible) && i_class_value !== (i_class_value = "fa fa-chevron-" + (ctx.visible ? 'up' : 'down') + " svelte-1jdtmzv")) {
						i.className = i_class_value;
				}

				}

				if (ctx.visible) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$2(component, ctx);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				window.removeEventListener("click", onwindowclick);

				if (detach) {
					detachNode(div);
				}

				if (slot_content_button) {
					reinsertChildren(a, slot_content_button);
				}

				removeListener(a, "click", click_handler);
				if (component.refs.button === a) { component.refs.button = null; }
				if (if_block) { if_block.d(); }
			}
		};
	}

	// (9:4) {#if visible}
	function create_if_block$2(component, ctx) {
		var div1, slot_content_content = component._slotted.content, div0;

		return {
			c: function create() {
				div1 = createElement("div");
				if (!slot_content_content) {
					div0 = createElement("div");
					div0.textContent = "Dropdown content";
				}
				if (!slot_content_content) {
					div0.className = "base-dropdown-inner svelte-1jdtmzv";
					addLoc(div0, file$2, 11, 12, 490);
				}
				setStyle(div1, "width", ctx.width);
				div1.className = "dropdown-menu base-dropdown-content svelte-1jdtmzv";
				addLoc(div1, file$2, 9, 4, 376);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				if (!slot_content_content) {
					append(div1, div0);
				}

				else {
					append(div1, slot_content_content);
				}
			},

			p: function update(changed, ctx) {
				if (changed.width) {
					setStyle(div1, "width", ctx.width);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (slot_content_content) {
					reinsertChildren(div1, slot_content_content);
				}
			}
		};
	}

	function BaseDropdown(options) {
		this._debugName = '<BaseDropdown>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$2(), options.data);
		if (!('visible' in this._state)) { console.warn("<BaseDropdown> was created without expected data property 'visible'"); }
		if (!('width' in this._state)) { console.warn("<BaseDropdown> was created without expected data property 'width'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(BaseDropdown.prototype, protoDev);
	assign(BaseDropdown.prototype, methods$1);

	BaseDropdown.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/BaseToggleButton.html generated by Svelte v2.16.1 */

	function data$3() {
	    return {
	        value: false,
	        indeterminate: false,
	        notoggle: false,
	        disabled: false
	    };
	}
	var methods$2 = {
	    toggle: function toggle() {
	        this.fire('select');
	        var ref = this.get();
	        var value = ref.value;
	        var notoggle = ref.notoggle;
	        if (!notoggle) {
	            this.set({ value: !value, indeterminate: false });
	        }
	    }
	};

	var file$3 = "node_modules/datawrapper/controls/BaseToggleButton.html";

	function create_main_fragment$3(component, ctx) {
		var button, slot_content_default = component._slotted.default, text;

		function click_handler(event) {
			component.toggle();
		}

		return {
			c: function create() {
				button = createElement("button");
				if (!slot_content_default) {
					text = createText("x");
				}
				addListener(button, "click", click_handler);
				button.className = "btn btn-s svelte-6n3kq9";
				button.disabled = ctx.disabled;
				toggleClass(button, "indeterminate", ctx.indeterminate);
				toggleClass(button, "btn-toggled", ctx.value && !ctx.indeterminate);
				addLoc(button, file$3, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				if (!slot_content_default) {
					append(button, text);
				}

				else {
					append(button, slot_content_default);
				}
			},

			p: function update(changed, ctx) {
				if (changed.disabled) {
					button.disabled = ctx.disabled;
				}

				if (changed.indeterminate) {
					toggleClass(button, "indeterminate", ctx.indeterminate);
				}

				if ((changed.value || changed.indeterminate)) {
					toggleClass(button, "btn-toggled", ctx.value && !ctx.indeterminate);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				if (slot_content_default) {
					reinsertChildren(button, slot_content_default);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	function BaseToggleButton(options) {
		this._debugName = '<BaseToggleButton>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$3(), options.data);
		if (!('value' in this._state)) { console.warn("<BaseToggleButton> was created without expected data property 'value'"); }
		if (!('indeterminate' in this._state)) { console.warn("<BaseToggleButton> was created without expected data property 'indeterminate'"); }
		if (!('disabled' in this._state)) { console.warn("<BaseToggleButton> was created without expected data property 'disabled'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(BaseToggleButton.prototype, protoDev);
	assign(BaseToggleButton.prototype, methods$2);

	BaseToggleButton.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* globals dw */

	var __messages = {};

	function initMessages(scope) {
	    if ( scope === void 0 ) scope = 'core';

	    // let's check if we're in a chart
	    if (scope === 'chart') {
	        if (window.__dw && window.__dw.vis && window.__dw.vis.meta) {
	            // use in-chart translations
	            __messages[scope] = window.__dw.vis.meta.locale || {};
	        }
	    } else {
	        // use backend translations
	        __messages[scope] =
	            scope === 'core'
	                ? dw.backend.__messages.core
	                : Object.assign({}, dw.backend.__messages.core, dw.backend.__messages[scope]);
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
	function __(key, scope) {
	    var arguments$1 = arguments;
	    if ( scope === void 0 ) scope = 'core';

	    key = key.trim();
	    if (!__messages[scope]) { initMessages(scope); }
	    if (!__messages[scope][key]) { return 'MISSING:' + key; }
	    var translation = __messages[scope][key];

	    if (typeof translation === 'string' && arguments.length > 2) {
	        // replace $0, $1 etc with remaining arguments
	        translation = translation.replace(/\$(\d)/g, function (m, i) {
	            i = 2 + Number(i);
	            if (arguments$1[i] === undefined) { return m; }
	            return arguments$1[i];
	        });
	    }
	    return translation;
	}

	/* node_modules/@datawrapper/controls/editor/ChartDescription.html generated by Svelte v2.16.1 */



	var file$4 = "node_modules/datawrapper/controls/editor/ChartDescription.html";

	function create_main_fragment$4(component, ctx) {
		var div5, div0, label0, text0_value = __('Title'), text0, text1, input0, input0_updating = false, text2, label1, text3_value = __('Description'), text3, text4, textarea, textarea_updating = false, text5, label2, text6_value = __('Notes'), text6, text7, input1, input1_updating = false, text8, div3, div1, label3, text9_value = __('Source name'), text9, text10, input2, input2_updating = false, text11, div2, label4, text12_value = __('Source URL'), text12, text13, input3, input3_updating = false, text14, div4, label5, text15_value = __('visualize / annotate / byline'), text15, text16, input4, input4_updating = false;

		function input0_input_handler() {
			input0_updating = true;
			component.store.set({ title: input0.value });
			input0_updating = false;
		}

		function textarea_input_handler() {
			var $ = component.store.get();
			textarea_updating = true;
			ctx.$metadata.describe.intro = textarea.value;
			component.store.set({ metadata: $.metadata });
			textarea_updating = false;
		}

		function input1_input_handler() {
			var $ = component.store.get();
			input1_updating = true;
			ctx.$metadata.annotate.notes = input1.value;
			component.store.set({ metadata: $.metadata });
			input1_updating = false;
		}

		function input2_input_handler() {
			var $ = component.store.get();
			input2_updating = true;
			ctx.$metadata.describe['source-name'] = input2.value;
			component.store.set({ metadata: $.metadata });
			input2_updating = false;
		}

		function input3_input_handler() {
			var $ = component.store.get();
			input3_updating = true;
			ctx.$metadata.describe['source-url'] = input3.value;
			component.store.set({ metadata: $.metadata });
			input3_updating = false;
		}

		function input4_input_handler() {
			var $ = component.store.get();
			input4_updating = true;
			ctx.$metadata.describe.byline = input4.value;
			component.store.set({ metadata: $.metadata });
			input4_updating = false;
		}

		return {
			c: function create() {
				div5 = createElement("div");
				div0 = createElement("div");
				label0 = createElement("label");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				input0 = createElement("input");
				text2 = createText("\n\n        ");
				label1 = createElement("label");
				text3 = createText(text3_value);
				text4 = createText("\n        ");
				textarea = createElement("textarea");
				text5 = createText("\n\n        ");
				label2 = createElement("label");
				text6 = createText(text6_value);
				text7 = createText("\n        ");
				input1 = createElement("input");
				text8 = createText("\n\n    ");
				div3 = createElement("div");
				div1 = createElement("div");
				label3 = createElement("label");
				text9 = createText(text9_value);
				text10 = createText("\n            ");
				input2 = createElement("input");
				text11 = createText("\n        ");
				div2 = createElement("div");
				label4 = createElement("label");
				text12 = createText(text12_value);
				text13 = createText("\n            ");
				input3 = createElement("input");
				text14 = createText("\n\n    ");
				div4 = createElement("div");
				label5 = createElement("label");
				text15 = createText(text15_value);
				text16 = createText("\n        ");
				input4 = createElement("input");
				label0.className = "control-label";
				label0.htmlFor = "text-title";
				addLoc(label0, file$4, 2, 8, 76);
				addListener(input0, "input", input0_input_handler);
				input0.className = "input-xlarge span4";
				input0.autocomplete = "off";
				setAttribute(input0, "type", "text");
				addLoc(input0, file$4, 3, 8, 152);
				label1.className = "control-label";
				label1.htmlFor = "text-intro";
				addLoc(label1, file$4, 5, 8, 249);
				addListener(textarea, "input", textarea_input_handler);
				textarea.id = "text-intro";
				textarea.className = "input-xlarge span4";
				addLoc(textarea, file$4, 6, 8, 331);
				label2.className = "control-label";
				label2.htmlFor = "text-notes";
				addLoc(label2, file$4, 8, 8, 443);
				addListener(input1, "input", input1_input_handler);
				input1.className = "input-xlarge span4";
				setAttribute(input1, "type", "text");
				addLoc(input1, file$4, 9, 8, 519);
				div0.className = "pull-left";
				addLoc(div0, file$4, 1, 4, 44);
				label3.className = "control-label";
				addLoc(label3, file$4, 14, 12, 680);
				addListener(input2, "input", input2_input_handler);
				input2.className = "span2";
				input2.placeholder = __('name of the organisation');
				setAttribute(input2, "type", "text");
				addLoc(input2, file$4, 15, 12, 749);
				div1.className = "span2";
				addLoc(div1, file$4, 13, 8, 648);
				label4.className = "control-label";
				addLoc(label4, file$4, 18, 12, 934);
				addListener(input3, "input", input3_input_handler);
				input3.className = "span2";
				input3.placeholder = __('URL of the dataset');
				setAttribute(input3, "type", "text");
				addLoc(input3, file$4, 19, 12, 1002);
				div2.className = "span2";
				addLoc(div2, file$4, 17, 8, 902);
				div3.className = "row";
				addLoc(div3, file$4, 12, 4, 622);
				label5.className = "control-label";
				addLoc(label5, file$4, 24, 8, 1191);
				addListener(input4, "input", input4_input_handler);
				input4.className = "input-xlarge span4";
				input4.placeholder = __('visualize / annotate / byline / placeholder');
				setAttribute(input4, "type", "text");
				addLoc(input4, file$4, 25, 8, 1274);
				div4.className = "chart-byline";
				addLoc(div4, file$4, 23, 4, 1156);
				div5.className = "story-title control-group";
				addLoc(div5, file$4, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div5, anchor);
				append(div5, div0);
				append(div0, label0);
				append(label0, text0);
				append(div0, text1);
				append(div0, input0);

				input0.value = ctx.$title;

				append(div0, text2);
				append(div0, label1);
				append(label1, text3);
				append(div0, text4);
				append(div0, textarea);

				textarea.value = ctx.$metadata.describe.intro;

				append(div0, text5);
				append(div0, label2);
				append(label2, text6);
				append(div0, text7);
				append(div0, input1);

				input1.value = ctx.$metadata.annotate.notes;

				append(div5, text8);
				append(div5, div3);
				append(div3, div1);
				append(div1, label3);
				append(label3, text9);
				append(div1, text10);
				append(div1, input2);

				input2.value = ctx.$metadata.describe['source-name'];

				append(div3, text11);
				append(div3, div2);
				append(div2, label4);
				append(label4, text12);
				append(div2, text13);
				append(div2, input3);

				input3.value = ctx.$metadata.describe['source-url'];

				append(div5, text14);
				append(div5, div4);
				append(div4, label5);
				append(label5, text15);
				append(div4, text16);
				append(div4, input4);

				input4.value = ctx.$metadata.describe.byline;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input0_updating && changed.$title) { input0.value = ctx.$title; }
				if (!textarea_updating && changed.$metadata) { textarea.value = ctx.$metadata.describe.intro; }
				if (!input1_updating && changed.$metadata) { input1.value = ctx.$metadata.annotate.notes; }
				if (!input2_updating && changed.$metadata) { input2.value = ctx.$metadata.describe['source-name']; }
				if (!input3_updating && changed.$metadata) { input3.value = ctx.$metadata.describe['source-url']; }
				if (!input4_updating && changed.$metadata) { input4.value = ctx.$metadata.describe.byline; }
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div5);
				}

				removeListener(input0, "input", input0_input_handler);
				removeListener(textarea, "input", textarea_input_handler);
				removeListener(input1, "input", input1_input_handler);
				removeListener(input2, "input", input2_input_handler);
				removeListener(input3, "input", input3_input_handler);
				removeListener(input4, "input", input4_input_handler);
			}
		};
	}

	function ChartDescription(options) {
		this._debugName = '<ChartDescription>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ChartDescription> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["title","metadata"]), options.data);
		this.store._add(this, ["title","metadata"]);
		if (!('$title' in this._state)) { console.warn("<ChartDescription> was created without expected data property '$title'"); }
		if (!('$metadata' in this._state)) { console.warn("<ChartDescription> was created without expected data property '$metadata'"); }
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$4(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ChartDescription.prototype, protoDev);

	ChartDescription.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* globals $, _ */

	function updateChartAttributes(ref) {
	    var iframe = ref.iframe;
	    var attrs = ref.attrs;
	    var forceRender = ref.forceRender; if ( forceRender === void 0 ) forceRender = false;
	    var callback = ref.callback;

	    var win = iframe.contentWindow;

	    if (!win.__dw || !win.__dw.vis) {
	        // iframe is not ready yet, try again in 100ms
	        setTimeout(function () {
	            updateChartAttributes({ iframe: iframe, attrs: attrs, forceRender: forceRender, callback: callback });
	        }, 100);
	        return false;
	    }

	    var render = forceRender;
	    var needReload = false;

	    var requiresReload = ['type', 'theme', 'metadata.data.transpose', 'metadata.axes'];

	    requiresReload.forEach(function(key) {
	        if (changed(key)) {
	            needReload = true;
	        }
	    });

	    if (
	        changed('metadata.data.column-format') ||
	        changed('metadata.data.changes') ||
	        changed('metadata.data.column-order') ||
	        changed('metadata.describe.computed-columns')
	    ) {
	        needReload = true;
	        return;
	    }

	    // check if we need to update chart
	    if (changed('metadata.visualize')) {
	        // win.__dw.vis.chart().attributes(attrs);
	        render = true;
	    }

	    if (needReload) {
	        setTimeout(function () {
	            win.location.reload();
	        }, 1000);
	        return;
	    }

	    // make a copy
	    attrs = JSON.parse(JSON.stringify(attrs));

	    win.__dw.vis.chart().attributes(attrs);
	    win.__dw.old_attrs = $.extend(true, {}, attrs);
	    // update dataset to reflect changes
	    win.__dw.vis.chart().load(win.__dw.params.data);

	    if (render) { win.__dw.render(); }

	    if (callback) { callback(); }

	    function changed(key) {
	        if (!win.__dw) { return false; }
	        var p0 = win.__dw.old_attrs || {};
	        var p1 = attrs;
	        key = key.split('.');
	        _.each(key, function(k) {
	            p0 = p0[k] || {};
	            p1 = p1[k] || {};
	        });
	        return JSON.stringify(p0) !== JSON.stringify(p1);
	    }
	}

	/* node_modules/@datawrapper/controls/editor/ChartPreview.html generated by Svelte v2.16.1 */

	var iframe;
	var preview;
	var startX;
	var startY;
	var startWidth;
	var startHeight;

	function url(ref) {
	    var $id = ref.$id;
	    var src = ref.src;

	    // eslint-disable-next-line
	    return src ? src : $id ? ("/chart/" + $id + "/preview") : '';
	}
	function data$4() {
	    return {
	        src: false,
	        loading: true,
	        // resize logic
	        width: 500,
	        height: 500,
	        resizable: true,
	        resizing: false,
	        // inline editing
	        editable: true
	    };
	}
	var methods$3 = {
	    iframeLoaded: function iframeLoaded() {
	        var this$1 = this;

	        var ref = this.get();
	        var editable = ref.editable;
	        if (editable) {
	            this.getContext(function (win, doc) {
	                activateInlineEditing(doc, this$1.store);
	            });
	        }
	        this.fire('iframeLoaded');
	    },
	    saved: function saved() {
	        var win = iframe.contentWindow;
	        if (win.__dw && win.__dw.saved) {
	            win.__dw.saved();
	        }
	    },
	    getContext: function getContext(callback) {
	        var this$1 = this;

	        var win = this.refs.iframe.contentWindow;
	        var doc = this.refs.iframe.contentDocument;

	        if (!win.__dw || !win.__dw.vis) {
	            return setTimeout(function () {
	                this$1.getContext(callback);
	            }, 200);
	        }
	        setTimeout(function () {
	            callback(win, doc);
	        }, 1000);
	    },
	    forceRender: function forceRender() {
	        var this$1 = this;

	        var state = this.store.serialize();
	        updateChartAttributes({
	            iframe: this.refs.iframe,
	            attrs: state,
	            forceRender: true,
	            callback: function () {
	                this$1.set({ loading: false });
	            }
	        });
	    },
	    reload: function reload() {
	        this.refs.iframe.contentWindow.location.reload();
	    },
	    dragStart: function dragStart(event) {
	        startX = event.clientX;
	        startY = event.clientY;
	        startWidth = this.get().width;
	        startHeight = this.get().height;
	        this.set({ resizing: true });
	        this.fire('beforeResize');
	        window.document.addEventListener('mousemove', doDrag);
	        window.document.addEventListener('mouseup', stopDrag);
	    }
	};

	function oncreate() {
	    var this$1 = this;

	    iframe = this.refs.iframe;
	    preview = this;

	    // 5. Resize when chart wants to resize itself
	    window.addEventListener('message', function (e) {
	        var message = e.data;
	        var ref = this$1.get();
	        var resizing = ref.resizing;
	        if (resizing) { return; }

	        if (typeof message['datawrapper-height'] !== 'undefined') {
	            var h;

	            for (var chartId in message['datawrapper-height']) {
	                h = message['datawrapper-height'][chartId];
	            }

	            this$1.set({ height: h });
	        }
	    });

	    var chart = this.store;

	    chart.on('state', function (ref) {
	        var current = ref.current;

	        if (current.passiveMode) {
	            // no update of chart in iframe when in passiveMode
	            return;
	        }

	        var attrs = chart.serialize();
	        updateChartAttributes({
	            // eslint-disable-next-line
	            iframe: this$1.refs.iframe,
	            attrs: attrs,
	            callback: function () {
	                this$1.set({ loading: false });
	            }
	        });
	        if (chart.getMetadata('data.json')) ;
	    });
	}
	function onupdate$1(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    // sync embed height and width
	    if (changed.width) {
	        this.store.setMetadata('publish.embed-width', current.width);
	    }
	    if (changed.height) {
	        this.store.setMetadata('publish.embed-height', current.height);
	    }
	}
	function doDrag(event) {
	    preview.set({
	        width: startWidth + (event.clientX - startX) * 2,
	        height: startHeight + event.clientY - startY
	    });
	    event.preventDefault();
	    return false;
	}

	function stopDrag() {
	    window.document.removeEventListener('mousemove', doDrag);
	    window.document.removeEventListener('mouseup', stopDrag);
	    preview.set({ resizing: false });
	    var ref = preview.get();
	    var width = ref.width;
	    var height = ref.height;
	    var bbox = preview.refs.iframe.contentDocument.querySelector('.dw-chart-body').getBoundingClientRect();
	    var maxH = preview.refs.iframe.contentWindow.dw.utils.getMaxChartHeight();
	    var ref$1 = [bbox.width, maxH];
	    var chartWidth = ref$1[0];
	    var chartHeight = ref$1[1];
	    preview.fire('resize', { width: width, height: height, chartWidth: chartWidth, chartHeight: chartHeight });
	}

	function activateInlineEditing(doc, chart) {
	    makeElementEditable({
	        el: doc.querySelector('.chart-title'),
	        onchange: function onchange(lbl) {
	            chart.set({ passiveMode: true });
	            chart.set({ title: lbl });
	            chart.set({ passiveMode: false });
	        }
	    });

	    makeElementEditable({
	        el: doc.querySelector('.chart-intro'),
	        onchange: sync('describe.intro')
	    });

	    makeElementEditable({
	        el: doc.querySelector('.dw-chart-notes'),
	        onchange: sync('annotate.notes')
	    });

	    function sync(key) {
	        return function(txt) {
	            chart.set({ passiveMode: true });
	            chart.setMetadata(key, txt);
	            chart.set({ passiveMode: false });
	        };
	    }

	    function makeElementEditable(ref) {
	        var el = ref.el;
	        var onchange = ref.onchange;

	        if (!el) { return; }
	        var lastValue = false;

	        el.setAttribute('contenteditable', true);

	        el.addEventListener('focus', function () {
	            // save old value for ESC key
	            lastValue = el.innerHTML;
	        });

	        el.addEventListener('keyup', function (evt) {
	            if (evt.keyCode === 27) {
	                evt.preventDefault();
	                // escape key, revert last value
	                el.innerHTML = lastValue;
	                el.blur();
	            }
	            onchange(el.innerHTML.replace(/(<br>)+$/g, ''));
	        });
	    }
	}

	var file$5 = "node_modules/datawrapper/controls/editor/ChartPreview.html";

	function create_main_fragment$5(component, ctx) {
		var div2, div0, iframe_1, text0, text1, div1;

		function load_handler(event) {
			component.iframeLoaded(event);
		}

		var if_block = (ctx.resizable) && create_if_block$3(component);

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				iframe_1 = createElement("iframe");
				text0 = createText("\n        ");
				if (if_block) { if_block.c(); }
				text1 = createText("\n\n    ");
				div1 = createElement("div");
				addListener(iframe_1, "load", load_handler);
				iframe_1.title = "chart-preview";
				iframe_1.src = ctx.url;
				iframe_1.id = "iframe-vis";
				iframe_1.allowFullscreen = true;
				setAttribute(iframe_1, "webkitallowfullscreen", true);
				setAttribute(iframe_1, "mozallowfullscreen", true);
				setAttribute(iframe_1, "oallowfullscreen", true);
				setAttribute(iframe_1, "msallowfullscreen", true);
				iframe_1.className = "svelte-q9b3tj";
				addLoc(iframe_1, file$5, 6, 8, 257);
				div0.id = "iframe-wrapper";
				setStyle(div0, "width", "" + ctx.width + "px");
				setStyle(div0, "height", "" + ctx.height + "px");
				setStyle(div0, "overflow", "visible");
				div0.className = "svelte-q9b3tj";
				toggleClass(div0, "loading", ctx.loading);
				toggleClass(div0, "resizable", ctx.resizable);
				toggleClass(div0, "resizing", ctx.resizing);
				addLoc(div0, file$5, 5, 4, 117);
				div1.id = "notifications";
				addLoc(div1, file$5, 25, 4, 788);
				setStyle(div2, "position", "relative");
				addLoc(div2, file$5, 4, 0, 71);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div0, iframe_1);
				component.refs.iframe = iframe_1;
				append(div0, text0);
				if (if_block) { if_block.m(div0, null); }
				append(div2, text1);
				append(div2, div1);
				component.refs.cont = div2;
			},

			p: function update(changed, ctx) {
				if (changed.url) {
					iframe_1.src = ctx.url;
				}

				if (ctx.resizable) {
					if (!if_block) {
						if_block = create_if_block$3(component);
						if_block.c();
						if_block.m(div0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.width) {
					setStyle(div0, "width", "" + ctx.width + "px");
				}

				if (changed.height) {
					setStyle(div0, "height", "" + ctx.height + "px");
				}

				if (changed.loading) {
					toggleClass(div0, "loading", ctx.loading);
				}

				if (changed.resizable) {
					toggleClass(div0, "resizable", ctx.resizable);
				}

				if (changed.resizing) {
					toggleClass(div0, "resizing", ctx.resizing);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				removeListener(iframe_1, "load", load_handler);
				if (component.refs.iframe === iframe_1) { component.refs.iframe = null; }
				if (if_block) { if_block.d(); }
				if (component.refs.cont === div2) { component.refs.cont = null; }
			}
		};
	}

	// (19:8) {#if resizable}
	function create_if_block$3(component, ctx) {
		var div, i;

		function mousedown_handler(event) {
			component.dragStart(event);
		}

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				i.className = "fa fa-arrows-h";
				addLoc(i, file$5, 20, 12, 712);
				addListener(div, "mousedown", mousedown_handler);
				setAttribute(div, "ref", "resizer");
				div.className = "resizer resizer-both";
				addLoc(div, file$5, 19, 8, 619);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(div, "mousedown", mousedown_handler);
			}
		};
	}

	function ChartPreview(options) {
		var this$1 = this;

		this._debugName = '<ChartPreview>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ChartPreview> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["id"]), data$4()), options.data);
		this.store._add(this, ["id"]);

		this._recompute({ $id: 1, src: 1 }, this._state);
		if (!('$id' in this._state)) { console.warn("<ChartPreview> was created without expected data property '$id'"); }
		if (!('src' in this._state)) { console.warn("<ChartPreview> was created without expected data property 'src'"); }
		if (!('width' in this._state)) { console.warn("<ChartPreview> was created without expected data property 'width'"); }
		if (!('height' in this._state)) { console.warn("<ChartPreview> was created without expected data property 'height'"); }

		if (!('resizable' in this._state)) { console.warn("<ChartPreview> was created without expected data property 'resizable'"); }
		this._intro = true;
		this._handlers.update = [onupdate$1];

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$5(this, this._state);

		this.root._oncreate.push(function () {
			oncreate.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ChartPreview.prototype, protoDev);
	assign(ChartPreview.prototype, methods$3);

	ChartPreview.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('url' in newState && !this._updatingReadonlyProperty) { throw new Error("<ChartPreview>: Cannot set read-only property 'url'"); }
	};

	ChartPreview.prototype._recompute = function _recompute(changed, state) {
		if (changed.$id || changed.src) {
			if (this._differs(state.url, (state.url = url(state)))) { changed.url = true; }
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
		var delay = ref.delay; if ( delay === void 0 ) { delay = 0; }
		var duration = ref.duration; if ( duration === void 0 ) { duration = 400; }
		var easing = ref.easing; if ( easing === void 0 ) { easing = cubicOut; }

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

	function data$5() {
	    return {
	        visible: false
	    };
	}
	var methods$4 = {
	    show: function show() {
	        var this$1 = this;

	        var t = setTimeout(function () {
	            this$1.set({ visible: true });
	        }, 400);
	        this.set({ t: t });
	    },
	    hide: function hide() {
	        var ref = this.get();
	        var t = ref.t;
	        clearTimeout(t);
	        this.set({ visible: false });
	    }
	};

	var file$6 = "node_modules/datawrapper/controls/Help.html";

	function create_main_fragment$6(component, ctx) {
		var div, span, text;

		function select_block_type(ctx) {
			if (ctx.visible) { return create_if_block_1$2; }
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		var if_block1 = (ctx.visible) && create_if_block$4(component);

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
				if_block0.c();
				text = createText("\n    ");
				if (if_block1) { if_block1.c(); }
				span.className = "svelte-cbanml";
				addLoc(span, file$6, 1, 4, 69);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = "help svelte-cbanml";
				addLoc(div, file$6, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				if_block0.m(span, null);
				append(div, text);
				if (if_block1) { if_block1.m(div, null); }
			},

			p: function update(changed, ctx) {
				if (current_block_type !== (current_block_type = select_block_type(ctx))) {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(span, null);
				}

				if (ctx.visible) {
					if (!if_block1) {
						if_block1 = create_if_block$4(component);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block0.d();
				if (if_block1) { if_block1.d(); }
				removeListener(div, "mouseenter", mouseenter_handler);
				removeListener(div, "mouseleave", mouseleave_handler);
			}
		};
	}

	// (2:59) {:else}
	function create_else_block(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("?");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (2:10) {#if visible}
	function create_if_block_1$2(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "im im-graduation-hat svelte-cbanml";
				addLoc(i, file$6, 1, 23, 88);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (3:4) {#if visible}
	function create_if_block$4(component, ctx) {
		var div, slot_content_default = component._slotted.default;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "content svelte-cbanml";
				addLoc(div, file$6, 3, 4, 167);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				if (slot_content_default) {
					append(div, slot_content_default);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (slot_content_default) {
					reinsertChildren(div, slot_content_default);
				}
			}
		};
	}

	function Help(options) {
		this._debugName = '<Help>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$5(), options.data);
		if (!('visible' in this._state)) { console.warn("<Help> was created without expected data property 'visible'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Help.prototype, protoDev);
	assign(Help.prototype, methods$4);

	Help.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Checkbox.html generated by Svelte v2.16.1 */



	function data$6() {
	    return {
	        value: false,
	        disabled: false,
	        faded: false,
	        indeterminate: false,
	        disabled_msg: '',
	        help: false
	    };
	}
	var file$7 = "node_modules/datawrapper/controls/Checkbox.html";

	function create_main_fragment$7(component, ctx) {
		var text0, div, label, input, span, text1, text2, label_class_value, text3;

		var if_block0 = (ctx.help) && create_if_block_1$3(component, ctx);

		function input_change_handler() {
			component.set({ value: input.checked, indeterminate: input.indeterminate });
		}

		var if_block1 = (ctx.disabled && ctx.disabled_msg) && create_if_block$5(component, ctx);

		return {
			c: function create() {
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n");
				div = createElement("div");
				label = createElement("label");
				input = createElement("input");
				span = createElement("span");
				text1 = createText("\n         ");
				text2 = createText(ctx.label);
				text3 = createText("\n    ");
				if (if_block1) { if_block1.c(); }
				addListener(input, "change", input_change_handler);
				if (!('value' in ctx && 'indeterminate' in ctx)) { component.root._beforecreate.push(input_change_handler); }
				setAttribute(input, "type", "checkbox");
				input.disabled = ctx.disabled;
				input.className = "svelte-1cqlw6c";
				addLoc(input, file$7, 7, 8, 215);
				span.className = "css-ui svelte-1cqlw6c";
				addLoc(span, file$7, 7, 95, 302);
				label.className = label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-1cqlw6c";
				addLoc(label, file$7, 6, 4, 134);
				div.className = "control-group vis-option-group vis-option-type-checkbox";
				addLoc(div, file$7, 5, 0, 60);
			},

			m: function mount(target, anchor) {
				if (if_block0) { if_block0.m(target, anchor); }
				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, label);
				append(label, input);

				input.checked = ctx.value;
				input.indeterminate = ctx.indeterminate ;

				append(label, span);
				append(label, text1);
				append(label, text2);
				append(div, text3);
				if (if_block1) { if_block1.i(div, null); }
			},

			p: function update(changed, ctx) {
				if (ctx.help) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$3(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.value) { input.checked = ctx.value; }
				if (changed.indeterminate) { input.indeterminate = ctx.indeterminate ; }
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.label) {
					setData(text2, ctx.label);
				}

				if ((changed.disabled || changed.faded) && label_class_value !== (label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-1cqlw6c")) {
					label.className = label_class_value;
				}

				if (ctx.disabled && ctx.disabled_msg) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$5(component, ctx);
						if (if_block1) { if_block1.c(); }
					}

					if_block1.i(div, null);
				} else if (if_block1) {
					groupOutros();
					if_block1.o(function() {
						if_block1.d(1);
						if_block1 = null;
					});
				}
			},

			d: function destroy(detach) {
				if (if_block0) { if_block0.d(detach); }
				if (detach) {
					detachNode(text0);
					detachNode(div);
				}

				removeListener(input, "change", input_change_handler);
				if (if_block1) { if_block1.d(); }
			}
		};
	}

	// (1:0) {#if help}
	function create_if_block_1$3(component, ctx) {
		var div;

		var help = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				div = createElement("div");
				help._fragment.c();
				addLoc(div, file$7, 2, 4, 22);
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
	}

	// (11:4) {#if disabled && disabled_msg}
	function create_if_block$5(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-1cqlw6c";
				addLoc(div0, file$7, 12, 8, 438);
				addLoc(div1, file$7, 11, 4, 407);
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
				if (current) { return; }
				if (component.root._intro) {
					if (div1_transition) { div1_transition.invalidate(); }

					component.root._aftercreate.push(function () {
						if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, true); }
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) { return; }

				if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, false); }
				div1_transition.run(0, function () {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
					if (div1_transition) { div1_transition.abort(); }
				}
			}
		};
	}

	function Checkbox(options) {
		this._debugName = '<Checkbox>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$6(), options.data);
		if (!('help' in this._state)) { console.warn("<Checkbox> was created without expected data property 'help'"); }
		if (!('disabled' in this._state)) { console.warn("<Checkbox> was created without expected data property 'disabled'"); }
		if (!('faded' in this._state)) { console.warn("<Checkbox> was created without expected data property 'faded'"); }
		if (!('value' in this._state)) { console.warn("<Checkbox> was created without expected data property 'value'"); }
		if (!('indeterminate' in this._state)) { console.warn("<Checkbox> was created without expected data property 'indeterminate'"); }
		if (!('label' in this._state)) { console.warn("<Checkbox> was created without expected data property 'label'"); }
		if (!('disabled_msg' in this._state)) { console.warn("<Checkbox> was created without expected data property 'disabled_msg'"); }
		this._intro = true;

		this._fragment = create_main_fragment$7(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Checkbox.prototype, protoDev);

	Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var chroma = createCommonjsModule(function (module, exports) {
	/**
	 * chroma.js - JavaScript library for color conversions
	 *
	 * Copyright (c) 2011-2019, Gregor Aisch
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are met:
	 *
	 * 1. Redistributions of source code must retain the above copyright notice, this
	 * list of conditions and the following disclaimer.
	 *
	 * 2. Redistributions in binary form must reproduce the above copyright notice,
	 * this list of conditions and the following disclaimer in the documentation
	 * and/or other materials provided with the distribution.
	 *
	 * 3. The name Gregor Aisch may not be used to endorse or promote products
	 * derived from this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
	 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 *
	 * -------------------------------------------------------
	 *
	 * chroma.js includes colors from colorbrewer2.org, which are released under
	 * the following license:
	 *
	 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
	 * and The Pennsylvania State University.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing,
	 * software distributed under the License is distributed on an
	 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
	 * either express or implied. See the License for the specific
	 * language governing permissions and limitations under the License.
	 *
	 * ------------------------------------------------------
	 *
	 * Named colors are taken from X11 Color Names.
	 * http://www.w3.org/TR/css3-color/#svg-color
	 *
	 * @preserve
	 */

	(function (global, factory) {
	     module.exports = factory() ;
	}(commonjsGlobal, (function () {
	    var limit = function (x, min, max) {
	        if ( min === void 0 ) { min=0; }
	        if ( max === void 0 ) { max=1; }

	        return x < min ? min : x > max ? max : x;
	    };

	    var clip_rgb = function (rgb) {
	        rgb._clipped = false;
	        rgb._unclipped = rgb.slice(0);
	        for (var i=0; i<=3; i++) {
	            if (i < 3) {
	                if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
	                rgb[i] = limit(rgb[i], 0, 255);
	            } else if (i === 3) {
	                rgb[i] = limit(rgb[i], 0, 1);
	            }
	        }
	        return rgb;
	    };

	    // ported from jQuery's $.type
	    var classToType = {};
	    for (var i = 0, list = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i < list.length; i += 1) {
	        var name = list[i];

	        classToType[("[object " + name + "]")] = name.toLowerCase();
	    }
	    var type = function(obj) {
	        return classToType[Object.prototype.toString.call(obj)] || "object";
	    };

	    var unpack = function (args, keyOrder) {
	        if ( keyOrder === void 0 ) { keyOrder=null; }

	    	// if called with more than 3 arguments, we return the arguments
	        if (args.length >= 3) { return Array.prototype.slice.call(args); }
	        // with less than 3 args we check if first arg is object
	        // and use the keyOrder string to extract and sort properties
	    	if (type(args[0]) == 'object' && keyOrder) {
	    		return keyOrder.split('')
	    			.filter(function (k) { return args[0][k] !== undefined; })
	    			.map(function (k) { return args[0][k]; });
	    	}
	    	// otherwise we just return the first argument
	    	// (which we suppose is an array of args)
	        return args[0];
	    };

	    var last = function (args) {
	        if (args.length < 2) { return null; }
	        var l = args.length-1;
	        if (type(args[l]) == 'string') { return args[l].toLowerCase(); }
	        return null;
	    };

	    var PI = Math.PI;

	    var utils = {
	    	clip_rgb: clip_rgb,
	    	limit: limit,
	    	type: type,
	    	unpack: unpack,
	    	last: last,
	    	PI: PI,
	    	TWOPI: PI*2,
	    	PITHIRD: PI/3,
	    	DEG2RAD: PI / 180,
	    	RAD2DEG: 180 / PI
	    };

	    var input = {
	    	format: {},
	    	autodetect: []
	    };

	    var last$1 = utils.last;
	    var clip_rgb$1 = utils.clip_rgb;
	    var type$1 = utils.type;


	    var Color = function Color() {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var me = this;
	        if (type$1(args[0]) === 'object' &&
	            args[0].constructor &&
	            args[0].constructor === this.constructor) {
	            // the argument is already a Color instance
	            return args[0];
	        }

	        // last argument could be the mode
	        var mode = last$1(args);
	        var autodetect = false;

	        if (!mode) {
	            autodetect = true;
	            if (!input.sorted) {
	                input.autodetect = input.autodetect.sort(function (a,b) { return b.p - a.p; });
	                input.sorted = true;
	            }
	            // auto-detect format
	            for (var i = 0, list = input.autodetect; i < list.length; i += 1) {
	                var chk = list[i];

	                mode = chk.test.apply(chk, args);
	                if (mode) { break; }
	            }
	        }

	        if (input.format[mode]) {
	            var rgb = input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
	            me._rgb = clip_rgb$1(rgb);
	        } else {
	            throw new Error('unknown format: '+args);
	        }

	        // add alpha channel
	        if (me._rgb.length === 3) { me._rgb.push(1); }
	    };

	    Color.prototype.toString = function toString () {
	        if (type$1(this.hex) == 'function') { return this.hex(); }
	        return ("[" + (this._rgb.join(',')) + "]");
	    };

	    var Color_1 = Color;

	    var chroma = function () {
	    	var arguments$1 = arguments;

	    	var args = [], len = arguments.length;
	    	while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	    	return new (Function.prototype.bind.apply( chroma.Color, [ null ].concat( args) ));
	    };

	    chroma.Color = Color_1;
	    chroma.version = '2.0.6';

	    var chroma_1 = chroma;

	    var unpack$1 = utils.unpack;
	    var max = Math.max;

	    var rgb2cmyk = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var ref = unpack$1(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        r = r / 255;
	        g = g / 255;
	        b = b / 255;
	        var k = 1 - max(r,max(g,b));
	        var f = k < 1 ? 1 / (1-k) : 0;
	        var c = (1-r-k) * f;
	        var m = (1-g-k) * f;
	        var y = (1-b-k) * f;
	        return [c,m,y,k];
	    };

	    var rgb2cmyk_1 = rgb2cmyk;

	    var unpack$2 = utils.unpack;

	    var cmyk2rgb = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        args = unpack$2(args, 'cmyk');
	        var c = args[0];
	        var m = args[1];
	        var y = args[2];
	        var k = args[3];
	        var alpha = args.length > 4 ? args[4] : 1;
	        if (k === 1) { return [0,0,0,alpha]; }
	        return [
	            c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
	            m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
	            y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
	            alpha
	        ];
	    };

	    var cmyk2rgb_1 = cmyk2rgb;

	    var unpack$3 = utils.unpack;
	    var type$2 = utils.type;



	    Color_1.prototype.cmyk = function() {
	        return rgb2cmyk_1(this._rgb);
	    };

	    chroma_1.cmyk = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['cmyk']) ));
	    };

	    input.format.cmyk = cmyk2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            args = unpack$3(args, 'cmyk');
	            if (type$2(args) === 'array' && args.length === 4) {
	                return 'cmyk';
	            }
	        }
	    });

	    var unpack$4 = utils.unpack;
	    var last$2 = utils.last;
	    var rnd = function (a) { return Math.round(a*100)/100; };

	    /*
	     * supported arguments:
	     * - hsl2css(h,s,l)
	     * - hsl2css(h,s,l,a)
	     * - hsl2css([h,s,l], mode)
	     * - hsl2css([h,s,l,a], mode)
	     * - hsl2css({h,s,l,a}, mode)
	     */
	    var hsl2css = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var hsla = unpack$4(args, 'hsla');
	        var mode = last$2(args) || 'lsa';
	        hsla[0] = rnd(hsla[0] || 0);
	        hsla[1] = rnd(hsla[1]*100) + '%';
	        hsla[2] = rnd(hsla[2]*100) + '%';
	        if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
	            hsla[3] = hsla.length > 3 ? hsla[3] : 1;
	            mode = 'hsla';
	        } else {
	            hsla.length = 3;
	        }
	        return (mode + "(" + (hsla.join(',')) + ")");
	    };

	    var hsl2css_1 = hsl2css;

	    var unpack$5 = utils.unpack;

	    /*
	     * supported arguments:
	     * - rgb2hsl(r,g,b)
	     * - rgb2hsl(r,g,b,a)
	     * - rgb2hsl([r,g,b])
	     * - rgb2hsl([r,g,b,a])
	     * - rgb2hsl({r,g,b,a})
	     */
	    var rgb2hsl = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        args = unpack$5(args, 'rgba');
	        var r = args[0];
	        var g = args[1];
	        var b = args[2];

	        r /= 255;
	        g /= 255;
	        b /= 255;

	        var min = Math.min(r, g, b);
	        var max = Math.max(r, g, b);

	        var l = (max + min) / 2;
	        var s, h;

	        if (max === min){
	            s = 0;
	            h = Number.NaN;
	        } else {
	            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
	        }

	        if (r == max) { h = (g - b) / (max - min); }
	        else if (g == max) { h = 2 + (b - r) / (max - min); }
	        else if (b == max) { h = 4 + (r - g) / (max - min); }

	        h *= 60;
	        if (h < 0) { h += 360; }
	        if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
	        return [h,s,l];
	    };

	    var rgb2hsl_1 = rgb2hsl;

	    var unpack$6 = utils.unpack;
	    var last$3 = utils.last;


	    var round = Math.round;

	    /*
	     * supported arguments:
	     * - rgb2css(r,g,b)
	     * - rgb2css(r,g,b,a)
	     * - rgb2css([r,g,b], mode)
	     * - rgb2css([r,g,b,a], mode)
	     * - rgb2css({r,g,b,a}, mode)
	     */
	    var rgb2css = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var rgba = unpack$6(args, 'rgba');
	        var mode = last$3(args) || 'rgb';
	        if (mode.substr(0,3) == 'hsl') {
	            return hsl2css_1(rgb2hsl_1(rgba), mode);
	        }
	        rgba[0] = round(rgba[0]);
	        rgba[1] = round(rgba[1]);
	        rgba[2] = round(rgba[2]);
	        if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
	            rgba[3] = rgba.length > 3 ? rgba[3] : 1;
	            mode = 'rgba';
	        }
	        return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
	    };

	    var rgb2css_1 = rgb2css;

	    var unpack$7 = utils.unpack;
	    var round$1 = Math.round;

	    var hsl2rgb = function () {
	        var arguments$1 = arguments;

	        var assign;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }
	        args = unpack$7(args, 'hsl');
	        var h = args[0];
	        var s = args[1];
	        var l = args[2];
	        var r,g,b;
	        if (s === 0) {
	            r = g = b = l*255;
	        } else {
	            var t3 = [0,0,0];
	            var c = [0,0,0];
	            var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
	            var t1 = 2 * l - t2;
	            var h_ = h / 360;
	            t3[0] = h_ + 1/3;
	            t3[1] = h_;
	            t3[2] = h_ - 1/3;
	            for (var i=0; i<3; i++) {
	                if (t3[i] < 0) { t3[i] += 1; }
	                if (t3[i] > 1) { t3[i] -= 1; }
	                if (6 * t3[i] < 1)
	                    { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
	                else if (2 * t3[i] < 1)
	                    { c[i] = t2; }
	                else if (3 * t3[i] < 2)
	                    { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
	                else
	                    { c[i] = t1; }
	            }
	            (assign = [round$1(c[0]*255),round$1(c[1]*255),round$1(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
	        }
	        if (args.length > 3) {
	            // keep alpha channel
	            return [r,g,b,args[3]];
	        }
	        return [r,g,b,1];
	    };

	    var hsl2rgb_1 = hsl2rgb;

	    var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
	    var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
	    var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
	    var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
	    var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
	    var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

	    var round$2 = Math.round;

	    var css2rgb = function (css) {
	        css = css.toLowerCase().trim();
	        var m;

	        if (input.format.named) {
	            try {
	                return input.format.named(css);
	            } catch (e) {
	                // eslint-disable-next-line
	            }
	        }

	        // rgb(250,20,0)
	        if ((m = css.match(RE_RGB))) {
	            var rgb = m.slice(1,4);
	            for (var i=0; i<3; i++) {
	                rgb[i] = +rgb[i];
	            }
	            rgb[3] = 1;  // default alpha
	            return rgb;
	        }

	        // rgba(250,20,0,0.4)
	        if ((m = css.match(RE_RGBA))) {
	            var rgb$1 = m.slice(1,5);
	            for (var i$1=0; i$1<4; i$1++) {
	                rgb$1[i$1] = +rgb$1[i$1];
	            }
	            return rgb$1;
	        }

	        // rgb(100%,0%,0%)
	        if ((m = css.match(RE_RGB_PCT))) {
	            var rgb$2 = m.slice(1,4);
	            for (var i$2=0; i$2<3; i$2++) {
	                rgb$2[i$2] = round$2(rgb$2[i$2] * 2.55);
	            }
	            rgb$2[3] = 1;  // default alpha
	            return rgb$2;
	        }

	        // rgba(100%,0%,0%,0.4)
	        if ((m = css.match(RE_RGBA_PCT))) {
	            var rgb$3 = m.slice(1,5);
	            for (var i$3=0; i$3<3; i$3++) {
	                rgb$3[i$3] = round$2(rgb$3[i$3] * 2.55);
	            }
	            rgb$3[3] = +rgb$3[3];
	            return rgb$3;
	        }

	        // hsl(0,100%,50%)
	        if ((m = css.match(RE_HSL))) {
	            var hsl = m.slice(1,4);
	            hsl[1] *= 0.01;
	            hsl[2] *= 0.01;
	            var rgb$4 = hsl2rgb_1(hsl);
	            rgb$4[3] = 1;
	            return rgb$4;
	        }

	        // hsla(0,100%,50%,0.5)
	        if ((m = css.match(RE_HSLA))) {
	            var hsl$1 = m.slice(1,4);
	            hsl$1[1] *= 0.01;
	            hsl$1[2] *= 0.01;
	            var rgb$5 = hsl2rgb_1(hsl$1);
	            rgb$5[3] = +m[4];  // default alpha = 1
	            return rgb$5;
	        }
	    };

	    css2rgb.test = function (s) {
	        return RE_RGB.test(s) ||
	            RE_RGBA.test(s) ||
	            RE_RGB_PCT.test(s) ||
	            RE_RGBA_PCT.test(s) ||
	            RE_HSL.test(s) ||
	            RE_HSLA.test(s);
	    };

	    var css2rgb_1 = css2rgb;

	    var type$3 = utils.type;




	    Color_1.prototype.css = function(mode) {
	        return rgb2css_1(this._rgb, mode);
	    };

	    chroma_1.css = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['css']) ));
	    };

	    input.format.css = css2rgb_1;

	    input.autodetect.push({
	        p: 5,
	        test: function (h) {
	            var arguments$1 = arguments;

	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 1 ]; }

	            if (!rest.length && type$3(h) === 'string' && css2rgb_1.test(h)) {
	                return 'css';
	            }
	        }
	    });

	    var unpack$8 = utils.unpack;

	    input.format.gl = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var rgb = unpack$8(args, 'rgba');
	        rgb[0] *= 255;
	        rgb[1] *= 255;
	        rgb[2] *= 255;
	        return rgb;
	    };

	    chroma_1.gl = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['gl']) ));
	    };

	    Color_1.prototype.gl = function() {
	        var rgb = this._rgb;
	        return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
	    };

	    var unpack$9 = utils.unpack;

	    var rgb2hcg = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var ref = unpack$9(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var min = Math.min(r, g, b);
	        var max = Math.max(r, g, b);
	        var delta = max - min;
	        var c = delta * 100 / 255;
	        var _g = min / (255 - delta) * 100;
	        var h;
	        if (delta === 0) {
	            h = Number.NaN;
	        } else {
	            if (r === max) { h = (g - b) / delta; }
	            if (g === max) { h = 2+(b - r) / delta; }
	            if (b === max) { h = 4+(r - g) / delta; }
	            h *= 60;
	            if (h < 0) { h += 360; }
	        }
	        return [h, c, _g];
	    };

	    var rgb2hcg_1 = rgb2hcg;

	    var unpack$a = utils.unpack;
	    var floor = Math.floor;

	    /*
	     * this is basically just HSV with some minor tweaks
	     *
	     * hue.. [0..360]
	     * chroma .. [0..1]
	     * grayness .. [0..1]
	     */

	    var hcg2rgb = function () {
	        var arguments$1 = arguments;

	        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }
	        args = unpack$a(args, 'hcg');
	        var h = args[0];
	        var c = args[1];
	        var _g = args[2];
	        var r,g,b;
	        _g = _g * 255;
	        var _c = c * 255;
	        if (c === 0) {
	            r = g = b = _g;
	        } else {
	            if (h === 360) { h = 0; }
	            if (h > 360) { h -= 360; }
	            if (h < 0) { h += 360; }
	            h /= 60;
	            var i = floor(h);
	            var f = h - i;
	            var p = _g * (1 - c);
	            var q = p + _c * (1 - f);
	            var t = p + _c * f;
	            var v = p + _c;
	            switch (i) {
	                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
	                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
	                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
	                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
	                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
	                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
	            }
	        }
	        return [r, g, b, args.length > 3 ? args[3] : 1];
	    };

	    var hcg2rgb_1 = hcg2rgb;

	    var unpack$b = utils.unpack;
	    var type$4 = utils.type;






	    Color_1.prototype.hcg = function() {
	        return rgb2hcg_1(this._rgb);
	    };

	    chroma_1.hcg = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcg']) ));
	    };

	    input.format.hcg = hcg2rgb_1;

	    input.autodetect.push({
	        p: 1,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            args = unpack$b(args, 'hcg');
	            if (type$4(args) === 'array' && args.length === 3) {
	                return 'hcg';
	            }
	        }
	    });

	    var unpack$c = utils.unpack;
	    var last$4 = utils.last;
	    var round$3 = Math.round;

	    var rgb2hex = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var ref = unpack$c(args, 'rgba');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var a = ref[3];
	        var mode = last$4(args) || 'auto';
	        if (a === undefined) { a = 1; }
	        if (mode === 'auto') {
	            mode = a < 1 ? 'rgba' : 'rgb';
	        }
	        r = round$3(r);
	        g = round$3(g);
	        b = round$3(b);
	        var u = r << 16 | g << 8 | b;
	        var str = "000000" + u.toString(16); //#.toUpperCase();
	        str = str.substr(str.length - 6);
	        var hxa = '0' + round$3(a * 255).toString(16);
	        hxa = hxa.substr(hxa.length - 2);
	        switch (mode.toLowerCase()) {
	            case 'rgba': return ("#" + str + hxa);
	            case 'argb': return ("#" + hxa + str);
	            default: return ("#" + str);
	        }
	    };

	    var rgb2hex_1 = rgb2hex;

	    var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	    var RE_HEXA = /^#?([A-Fa-f0-9]{8})$/;

	    var hex2rgb = function (hex) {
	        if (hex.match(RE_HEX)) {
	            // remove optional leading #
	            if (hex.length === 4 || hex.length === 7) {
	                hex = hex.substr(1);
	            }
	            // expand short-notation to full six-digit
	            if (hex.length === 3) {
	                hex = hex.split('');
	                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	            }
	            var u = parseInt(hex, 16);
	            var r = u >> 16;
	            var g = u >> 8 & 0xFF;
	            var b = u & 0xFF;
	            return [r,g,b,1];
	        }

	        // match rgba hex format, eg #FF000077
	        if (hex.match(RE_HEXA)) {
	            if (hex.length === 9) {
	                // remove optional leading #
	                hex = hex.substr(1);
	            }
	            var u$1 = parseInt(hex, 16);
	            var r$1 = u$1 >> 24 & 0xFF;
	            var g$1 = u$1 >> 16 & 0xFF;
	            var b$1 = u$1 >> 8 & 0xFF;
	            var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
	            return [r$1,g$1,b$1,a];
	        }

	        // we used to check for css colors here
	        // if _input.css? and rgb = _input.css hex
	        //     return rgb

	        throw new Error(("unknown hex color: " + hex));
	    };

	    var hex2rgb_1 = hex2rgb;

	    var type$5 = utils.type;




	    Color_1.prototype.hex = function(mode) {
	        return rgb2hex_1(this._rgb, mode);
	    };

	    chroma_1.hex = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hex']) ));
	    };

	    input.format.hex = hex2rgb_1;
	    input.autodetect.push({
	        p: 4,
	        test: function (h) {
	            var arguments$1 = arguments;

	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 1 ]; }

	            if (!rest.length && type$5(h) === 'string' && [3,4,6,7,8,9].includes(h.length)) {
	                return 'hex';
	            }
	        }
	    });

	    var unpack$d = utils.unpack;
	    var TWOPI = utils.TWOPI;
	    var min = Math.min;
	    var sqrt = Math.sqrt;
	    var acos = Math.acos;

	    var rgb2hsi = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        /*
	        borrowed from here:
	        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
	        */
	        var ref = unpack$d(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        r /= 255;
	        g /= 255;
	        b /= 255;
	        var h;
	        var min_ = min(r,g,b);
	        var i = (r+g+b) / 3;
	        var s = i > 0 ? 1 - min_/i : 0;
	        if (s === 0) {
	            h = NaN;
	        } else {
	            h = ((r-g)+(r-b)) / 2;
	            h /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
	            h = acos(h);
	            if (b > g) {
	                h = TWOPI - h;
	            }
	            h /= TWOPI;
	        }
	        return [h*360,s,i];
	    };

	    var rgb2hsi_1 = rgb2hsi;

	    var unpack$e = utils.unpack;
	    var limit$1 = utils.limit;
	    var TWOPI$1 = utils.TWOPI;
	    var PITHIRD = utils.PITHIRD;
	    var cos = Math.cos;

	    /*
	     * hue [0..360]
	     * saturation [0..1]
	     * intensity [0..1]
	     */
	    var hsi2rgb = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        /*
	        borrowed from here:
	        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
	        */
	        args = unpack$e(args, 'hsi');
	        var h = args[0];
	        var s = args[1];
	        var i = args[2];
	        var r,g,b;

	        if (isNaN(h)) { h = 0; }
	        if (isNaN(s)) { s = 0; }
	        // normalize hue
	        if (h > 360) { h -= 360; }
	        if (h < 0) { h += 360; }
	        h /= 360;
	        if (h < 1/3) {
	            b = (1-s)/3;
	            r = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
	            g = 1 - (b+r);
	        } else if (h < 2/3) {
	            h -= 1/3;
	            r = (1-s)/3;
	            g = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
	            b = 1 - (r+g);
	        } else {
	            h -= 2/3;
	            g = (1-s)/3;
	            b = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
	            r = 1 - (g+b);
	        }
	        r = limit$1(i*r*3);
	        g = limit$1(i*g*3);
	        b = limit$1(i*b*3);
	        return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
	    };

	    var hsi2rgb_1 = hsi2rgb;

	    var unpack$f = utils.unpack;
	    var type$6 = utils.type;






	    Color_1.prototype.hsi = function() {
	        return rgb2hsi_1(this._rgb);
	    };

	    chroma_1.hsi = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsi']) ));
	    };

	    input.format.hsi = hsi2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            args = unpack$f(args, 'hsi');
	            if (type$6(args) === 'array' && args.length === 3) {
	                return 'hsi';
	            }
	        }
	    });

	    var unpack$g = utils.unpack;
	    var type$7 = utils.type;






	    Color_1.prototype.hsl = function() {
	        return rgb2hsl_1(this._rgb);
	    };

	    chroma_1.hsl = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsl']) ));
	    };

	    input.format.hsl = hsl2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            args = unpack$g(args, 'hsl');
	            if (type$7(args) === 'array' && args.length === 3) {
	                return 'hsl';
	            }
	        }
	    });

	    var unpack$h = utils.unpack;
	    var min$1 = Math.min;
	    var max$1 = Math.max;

	    /*
	     * supported arguments:
	     * - rgb2hsv(r,g,b)
	     * - rgb2hsv([r,g,b])
	     * - rgb2hsv({r,g,b})
	     */
	    var rgb2hsl$1 = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        args = unpack$h(args, 'rgb');
	        var r = args[0];
	        var g = args[1];
	        var b = args[2];
	        var min_ = min$1(r, g, b);
	        var max_ = max$1(r, g, b);
	        var delta = max_ - min_;
	        var h,s,v;
	        v = max_ / 255.0;
	        if (max_ === 0) {
	            h = Number.NaN;
	            s = 0;
	        } else {
	            s = delta / max_;
	            if (r === max_) { h = (g - b) / delta; }
	            if (g === max_) { h = 2+(b - r) / delta; }
	            if (b === max_) { h = 4+(r - g) / delta; }
	            h *= 60;
	            if (h < 0) { h += 360; }
	        }
	        return [h, s, v]
	    };

	    var rgb2hsv = rgb2hsl$1;

	    var unpack$i = utils.unpack;
	    var floor$1 = Math.floor;

	    var hsv2rgb = function () {
	        var arguments$1 = arguments;

	        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }
	        args = unpack$i(args, 'hsv');
	        var h = args[0];
	        var s = args[1];
	        var v = args[2];
	        var r,g,b;
	        v *= 255;
	        if (s === 0) {
	            r = g = b = v;
	        } else {
	            if (h === 360) { h = 0; }
	            if (h > 360) { h -= 360; }
	            if (h < 0) { h += 360; }
	            h /= 60;

	            var i = floor$1(h);
	            var f = h - i;
	            var p = v * (1 - s);
	            var q = v * (1 - s * f);
	            var t = v * (1 - s * (1 - f));

	            switch (i) {
	                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
	                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
	                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
	                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
	                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
	                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
	            }
	        }
	        return [r,g,b,args.length > 3?args[3]:1];
	    };

	    var hsv2rgb_1 = hsv2rgb;

	    var unpack$j = utils.unpack;
	    var type$8 = utils.type;






	    Color_1.prototype.hsv = function() {
	        return rgb2hsv(this._rgb);
	    };

	    chroma_1.hsv = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsv']) ));
	    };

	    input.format.hsv = hsv2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            args = unpack$j(args, 'hsv');
	            if (type$8(args) === 'array' && args.length === 3) {
	                return 'hsv';
	            }
	        }
	    });

	    var labConstants = {
	        // Corresponds roughly to RGB brighter/darker
	        Kn: 18,

	        // D65 standard referent
	        Xn: 0.950470,
	        Yn: 1,
	        Zn: 1.088830,

	        t0: 0.137931034,  // 4 / 29
	        t1: 0.206896552,  // 6 / 29
	        t2: 0.12841855,   // 3 * t1 * t1
	        t3: 0.008856452,  // t1 * t1 * t1
	    };

	    var unpack$k = utils.unpack;
	    var pow = Math.pow;

	    var rgb2lab = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var ref = unpack$k(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var ref$1 = rgb2xyz(r,g,b);
	        var x = ref$1[0];
	        var y = ref$1[1];
	        var z = ref$1[2];
	        var l = 116 * y - 16;
	        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
	    };

	    var rgb_xyz = function (r) {
	        if ((r /= 255) <= 0.04045) { return r / 12.92; }
	        return pow((r + 0.055) / 1.055, 2.4);
	    };

	    var xyz_lab = function (t) {
	        if (t > labConstants.t3) { return pow(t, 1 / 3); }
	        return t / labConstants.t2 + labConstants.t0;
	    };

	    var rgb2xyz = function (r,g,b) {
	        r = rgb_xyz(r);
	        g = rgb_xyz(g);
	        b = rgb_xyz(b);
	        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / labConstants.Xn);
	        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / labConstants.Yn);
	        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / labConstants.Zn);
	        return [x,y,z];
	    };

	    var rgb2lab_1 = rgb2lab;

	    var unpack$l = utils.unpack;
	    var pow$1 = Math.pow;

	    /*
	     * L* [0..100]
	     * a [-100..100]
	     * b [-100..100]
	     */
	    var lab2rgb = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        args = unpack$l(args, 'lab');
	        var l = args[0];
	        var a = args[1];
	        var b = args[2];
	        var x,y,z, r,g,b_;

	        y = (l + 16) / 116;
	        x = isNaN(a) ? y : y + a / 500;
	        z = isNaN(b) ? y : y - b / 200;

	        y = labConstants.Yn * lab_xyz(y);
	        x = labConstants.Xn * lab_xyz(x);
	        z = labConstants.Zn * lab_xyz(z);

	        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
	        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
	        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

	        return [r,g,b_,args.length > 3 ? args[3] : 1];
	    };

	    var xyz_rgb = function (r) {
	        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$1(r, 1 / 2.4) - 0.055)
	    };

	    var lab_xyz = function (t) {
	        return t > labConstants.t1 ? t * t * t : labConstants.t2 * (t - labConstants.t0)
	    };

	    var lab2rgb_1 = lab2rgb;

	    var unpack$m = utils.unpack;
	    var type$9 = utils.type;






	    Color_1.prototype.lab = function() {
	        return rgb2lab_1(this._rgb);
	    };

	    chroma_1.lab = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lab']) ));
	    };

	    input.format.lab = lab2rgb_1;

	    input.autodetect.push({
	        p: 2,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            args = unpack$m(args, 'lab');
	            if (type$9(args) === 'array' && args.length === 3) {
	                return 'lab';
	            }
	        }
	    });

	    var unpack$n = utils.unpack;
	    var RAD2DEG = utils.RAD2DEG;
	    var sqrt$1 = Math.sqrt;
	    var atan2 = Math.atan2;
	    var round$4 = Math.round;

	    var lab2lch = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var ref = unpack$n(args, 'lab');
	        var l = ref[0];
	        var a = ref[1];
	        var b = ref[2];
	        var c = sqrt$1(a * a + b * b);
	        var h = (atan2(b, a) * RAD2DEG + 360) % 360;
	        if (round$4(c*10000) === 0) { h = Number.NaN; }
	        return [l, c, h];
	    };

	    var lab2lch_1 = lab2lch;

	    var unpack$o = utils.unpack;



	    var rgb2lch = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var ref = unpack$o(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var ref$1 = rgb2lab_1(r,g,b);
	        var l = ref$1[0];
	        var a = ref$1[1];
	        var b_ = ref$1[2];
	        return lab2lch_1(l,a,b_);
	    };

	    var rgb2lch_1 = rgb2lch;

	    var unpack$p = utils.unpack;
	    var DEG2RAD = utils.DEG2RAD;
	    var sin = Math.sin;
	    var cos$1 = Math.cos;

	    var lch2lab = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        /*
	        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
	        These formulas were invented by David Dalrymple to obtain maximum contrast without going
	        out of gamut if the parameters are in the range 0-1.

	        A saturation multiplier was added by Gregor Aisch
	        */
	        var ref = unpack$p(args, 'lch');
	        var l = ref[0];
	        var c = ref[1];
	        var h = ref[2];
	        if (isNaN(h)) { h = 0; }
	        h = h * DEG2RAD;
	        return [l, cos$1(h) * c, sin(h) * c]
	    };

	    var lch2lab_1 = lch2lab;

	    var unpack$q = utils.unpack;



	    var lch2rgb = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        args = unpack$q(args, 'lch');
	        var l = args[0];
	        var c = args[1];
	        var h = args[2];
	        var ref = lch2lab_1 (l,c,h);
	        var L = ref[0];
	        var a = ref[1];
	        var b_ = ref[2];
	        var ref$1 = lab2rgb_1 (L,a,b_);
	        var r = ref$1[0];
	        var g = ref$1[1];
	        var b = ref$1[2];
	        return [r, g, b, args.length > 3 ? args[3] : 1];
	    };

	    var lch2rgb_1 = lch2rgb;

	    var unpack$r = utils.unpack;


	    var hcl2rgb = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var hcl = unpack$r(args, 'hcl').reverse();
	        return lch2rgb_1.apply(void 0, hcl);
	    };

	    var hcl2rgb_1 = hcl2rgb;

	    var unpack$s = utils.unpack;
	    var type$a = utils.type;






	    Color_1.prototype.lch = function() { return rgb2lch_1(this._rgb); };
	    Color_1.prototype.hcl = function() { return rgb2lch_1(this._rgb).reverse(); };

	    chroma_1.lch = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lch']) ));
	    };
	    chroma_1.hcl = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcl']) ));
	    };

	    input.format.lch = lch2rgb_1;
	    input.format.hcl = hcl2rgb_1;

	    ['lch','hcl'].forEach(function (m) { return input.autodetect.push({
	        p: 2,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            args = unpack$s(args, m);
	            if (type$a(args) === 'array' && args.length === 3) {
	                return m;
	            }
	        }
	    }); });

	    /**
	    	X11 color names

	    	http://www.w3.org/TR/css3-color/#svg-color
	    */

	    var w3cx11 = {
	        aliceblue: '#f0f8ff',
	        antiquewhite: '#faebd7',
	        aqua: '#00ffff',
	        aquamarine: '#7fffd4',
	        azure: '#f0ffff',
	        beige: '#f5f5dc',
	        bisque: '#ffe4c4',
	        black: '#000000',
	        blanchedalmond: '#ffebcd',
	        blue: '#0000ff',
	        blueviolet: '#8a2be2',
	        brown: '#a52a2a',
	        burlywood: '#deb887',
	        cadetblue: '#5f9ea0',
	        chartreuse: '#7fff00',
	        chocolate: '#d2691e',
	        coral: '#ff7f50',
	        cornflower: '#6495ed',
	        cornflowerblue: '#6495ed',
	        cornsilk: '#fff8dc',
	        crimson: '#dc143c',
	        cyan: '#00ffff',
	        darkblue: '#00008b',
	        darkcyan: '#008b8b',
	        darkgoldenrod: '#b8860b',
	        darkgray: '#a9a9a9',
	        darkgreen: '#006400',
	        darkgrey: '#a9a9a9',
	        darkkhaki: '#bdb76b',
	        darkmagenta: '#8b008b',
	        darkolivegreen: '#556b2f',
	        darkorange: '#ff8c00',
	        darkorchid: '#9932cc',
	        darkred: '#8b0000',
	        darksalmon: '#e9967a',
	        darkseagreen: '#8fbc8f',
	        darkslateblue: '#483d8b',
	        darkslategray: '#2f4f4f',
	        darkslategrey: '#2f4f4f',
	        darkturquoise: '#00ced1',
	        darkviolet: '#9400d3',
	        deeppink: '#ff1493',
	        deepskyblue: '#00bfff',
	        dimgray: '#696969',
	        dimgrey: '#696969',
	        dodgerblue: '#1e90ff',
	        firebrick: '#b22222',
	        floralwhite: '#fffaf0',
	        forestgreen: '#228b22',
	        fuchsia: '#ff00ff',
	        gainsboro: '#dcdcdc',
	        ghostwhite: '#f8f8ff',
	        gold: '#ffd700',
	        goldenrod: '#daa520',
	        gray: '#808080',
	        green: '#008000',
	        greenyellow: '#adff2f',
	        grey: '#808080',
	        honeydew: '#f0fff0',
	        hotpink: '#ff69b4',
	        indianred: '#cd5c5c',
	        indigo: '#4b0082',
	        ivory: '#fffff0',
	        khaki: '#f0e68c',
	        laserlemon: '#ffff54',
	        lavender: '#e6e6fa',
	        lavenderblush: '#fff0f5',
	        lawngreen: '#7cfc00',
	        lemonchiffon: '#fffacd',
	        lightblue: '#add8e6',
	        lightcoral: '#f08080',
	        lightcyan: '#e0ffff',
	        lightgoldenrod: '#fafad2',
	        lightgoldenrodyellow: '#fafad2',
	        lightgray: '#d3d3d3',
	        lightgreen: '#90ee90',
	        lightgrey: '#d3d3d3',
	        lightpink: '#ffb6c1',
	        lightsalmon: '#ffa07a',
	        lightseagreen: '#20b2aa',
	        lightskyblue: '#87cefa',
	        lightslategray: '#778899',
	        lightslategrey: '#778899',
	        lightsteelblue: '#b0c4de',
	        lightyellow: '#ffffe0',
	        lime: '#00ff00',
	        limegreen: '#32cd32',
	        linen: '#faf0e6',
	        magenta: '#ff00ff',
	        maroon: '#800000',
	        maroon2: '#7f0000',
	        maroon3: '#b03060',
	        mediumaquamarine: '#66cdaa',
	        mediumblue: '#0000cd',
	        mediumorchid: '#ba55d3',
	        mediumpurple: '#9370db',
	        mediumseagreen: '#3cb371',
	        mediumslateblue: '#7b68ee',
	        mediumspringgreen: '#00fa9a',
	        mediumturquoise: '#48d1cc',
	        mediumvioletred: '#c71585',
	        midnightblue: '#191970',
	        mintcream: '#f5fffa',
	        mistyrose: '#ffe4e1',
	        moccasin: '#ffe4b5',
	        navajowhite: '#ffdead',
	        navy: '#000080',
	        oldlace: '#fdf5e6',
	        olive: '#808000',
	        olivedrab: '#6b8e23',
	        orange: '#ffa500',
	        orangered: '#ff4500',
	        orchid: '#da70d6',
	        palegoldenrod: '#eee8aa',
	        palegreen: '#98fb98',
	        paleturquoise: '#afeeee',
	        palevioletred: '#db7093',
	        papayawhip: '#ffefd5',
	        peachpuff: '#ffdab9',
	        peru: '#cd853f',
	        pink: '#ffc0cb',
	        plum: '#dda0dd',
	        powderblue: '#b0e0e6',
	        purple: '#800080',
	        purple2: '#7f007f',
	        purple3: '#a020f0',
	        rebeccapurple: '#663399',
	        red: '#ff0000',
	        rosybrown: '#bc8f8f',
	        royalblue: '#4169e1',
	        saddlebrown: '#8b4513',
	        salmon: '#fa8072',
	        sandybrown: '#f4a460',
	        seagreen: '#2e8b57',
	        seashell: '#fff5ee',
	        sienna: '#a0522d',
	        silver: '#c0c0c0',
	        skyblue: '#87ceeb',
	        slateblue: '#6a5acd',
	        slategray: '#708090',
	        slategrey: '#708090',
	        snow: '#fffafa',
	        springgreen: '#00ff7f',
	        steelblue: '#4682b4',
	        tan: '#d2b48c',
	        teal: '#008080',
	        thistle: '#d8bfd8',
	        tomato: '#ff6347',
	        turquoise: '#40e0d0',
	        violet: '#ee82ee',
	        wheat: '#f5deb3',
	        white: '#ffffff',
	        whitesmoke: '#f5f5f5',
	        yellow: '#ffff00',
	        yellowgreen: '#9acd32'
	    };

	    var w3cx11_1 = w3cx11;

	    var type$b = utils.type;





	    Color_1.prototype.name = function() {
	        var hex = rgb2hex_1(this._rgb, 'rgb');
	        for (var i = 0, list = Object.keys(w3cx11_1); i < list.length; i += 1) {
	            var n = list[i];

	            if (w3cx11_1[n] === hex) { return n.toLowerCase(); }
	        }
	        return hex;
	    };

	    input.format.named = function (name) {
	        name = name.toLowerCase();
	        if (w3cx11_1[name]) { return hex2rgb_1(w3cx11_1[name]); }
	        throw new Error('unknown color name: '+name);
	    };

	    input.autodetect.push({
	        p: 5,
	        test: function (h) {
	            var arguments$1 = arguments;

	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 1 ]; }

	            if (!rest.length && type$b(h) === 'string' && w3cx11_1[h.toLowerCase()]) {
	                return 'named';
	            }
	        }
	    });

	    var unpack$t = utils.unpack;

	    var rgb2num = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var ref = unpack$t(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        return (r << 16) + (g << 8) + b;
	    };

	    var rgb2num_1 = rgb2num;

	    var type$c = utils.type;

	    var num2rgb = function (num) {
	        if (type$c(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
	            var r = num >> 16;
	            var g = (num >> 8) & 0xFF;
	            var b = num & 0xFF;
	            return [r,g,b,1];
	        }
	        throw new Error("unknown num color: "+num);
	    };

	    var num2rgb_1 = num2rgb;

	    var type$d = utils.type;



	    Color_1.prototype.num = function() {
	        return rgb2num_1(this._rgb);
	    };

	    chroma_1.num = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['num']) ));
	    };

	    input.format.num = num2rgb_1;

	    input.autodetect.push({
	        p: 5,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            if (args.length === 1 && type$d(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
	                return 'num';
	            }
	        }
	    });

	    var unpack$u = utils.unpack;
	    var type$e = utils.type;
	    var round$5 = Math.round;

	    Color_1.prototype.rgb = function(rnd) {
	        if ( rnd === void 0 ) { rnd=true; }

	        if (rnd === false) { return this._rgb.slice(0,3); }
	        return this._rgb.slice(0,3).map(round$5);
	    };

	    Color_1.prototype.rgba = function(rnd) {
	        if ( rnd === void 0 ) { rnd=true; }

	        return this._rgb.slice(0,4).map(function (v,i) {
	            return i<3 ? (rnd === false ? v : round$5(v)) : v;
	        });
	    };

	    chroma_1.rgb = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['rgb']) ));
	    };

	    input.format.rgb = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var rgba = unpack$u(args, 'rgba');
	        if (rgba[3] === undefined) { rgba[3] = 1; }
	        return rgba;
	    };

	    input.autodetect.push({
	        p: 3,
	        test: function () {
	            var arguments$1 = arguments;

	            var args = [], len = arguments.length;
	            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	            args = unpack$u(args, 'rgba');
	            if (type$e(args) === 'array' && (args.length === 3 ||
	                args.length === 4 && type$e(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
	                return 'rgb';
	            }
	        }
	    });

	    /*
	     * Based on implementation by Neil Bartlett
	     * https://github.com/neilbartlett/color-temperature
	     */

	    var log = Math.log;

	    var temperature2rgb = function (kelvin) {
	        var temp = kelvin / 100;
	        var r,g,b;
	        if (temp < 66) {
	            r = 255;
	            g = -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log(g);
	            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log(b);
	        } else {
	            r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log(r);
	            g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log(g);
	            b = 255;
	        }
	        return [r,g,b,1];
	    };

	    var temperature2rgb_1 = temperature2rgb;

	    /*
	     * Based on implementation by Neil Bartlett
	     * https://github.com/neilbartlett/color-temperature
	     **/


	    var unpack$v = utils.unpack;
	    var round$6 = Math.round;

	    var rgb2temperature = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        var rgb = unpack$v(args, 'rgb');
	        var r = rgb[0], b = rgb[2];
	        var minTemp = 1000;
	        var maxTemp = 40000;
	        var eps = 0.4;
	        var temp;
	        while (maxTemp - minTemp > eps) {
	            temp = (maxTemp + minTemp) * 0.5;
	            var rgb$1 = temperature2rgb_1(temp);
	            if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
	                maxTemp = temp;
	            } else {
	                minTemp = temp;
	            }
	        }
	        return round$6(temp);
	    };

	    var rgb2temperature_1 = rgb2temperature;

	    Color_1.prototype.temp =
	    Color_1.prototype.kelvin =
	    Color_1.prototype.temperature = function() {
	        return rgb2temperature_1(this._rgb);
	    };

	    chroma_1.temp =
	    chroma_1.kelvin =
	    chroma_1.temperature = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['temp']) ));
	    };

	    input.format.temp =
	    input.format.kelvin =
	    input.format.temperature = temperature2rgb_1;

	    var type$f = utils.type;

	    Color_1.prototype.alpha = function(a, mutate) {
	        if ( mutate === void 0 ) { mutate=false; }

	        if (a !== undefined && type$f(a) === 'number') {
	            if (mutate) {
	                this._rgb[3] = a;
	                return this;
	            }
	            return new Color_1([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
	        }
	        return this._rgb[3];
	    };

	    Color_1.prototype.clipped = function() {
	        return this._rgb._clipped || false;
	    };

	    Color_1.prototype.darken = function(amount) {
	    	if ( amount === void 0 ) { amount=1; }

	    	var me = this;
	    	var lab = me.lab();
	    	lab[0] -= labConstants.Kn * amount;
	    	return new Color_1(lab, 'lab').alpha(me.alpha(), true);
	    };

	    Color_1.prototype.brighten = function(amount) {
	    	if ( amount === void 0 ) { amount=1; }

	    	return this.darken(-amount);
	    };

	    Color_1.prototype.darker = Color_1.prototype.darken;
	    Color_1.prototype.brighter = Color_1.prototype.brighten;

	    Color_1.prototype.get = function(mc) {
	        var ref = mc.split('.');
	        var mode = ref[0];
	        var channel = ref[1];
	        var src = this[mode]();
	        if (channel) {
	            var i = mode.indexOf(channel);
	            if (i > -1) { return src[i]; }
	            throw new Error(("unknown channel " + channel + " in mode " + mode));
	        } else {
	            return src;
	        }
	    };

	    var type$g = utils.type;
	    var pow$2 = Math.pow;

	    var EPS = 1e-7;
	    var MAX_ITER = 20;

	    Color_1.prototype.luminance = function(lum) {
	        if (lum !== undefined && type$g(lum) === 'number') {
	            if (lum === 0) {
	                // return pure black
	                return new Color_1([0,0,0,this._rgb[3]], 'rgb');
	            }
	            if (lum === 1) {
	                // return pure white
	                return new Color_1([255,255,255,this._rgb[3]], 'rgb');
	            }
	            // compute new color using...
	            var cur_lum = this.luminance();
	            var mode = 'rgb';
	            var max_iter = MAX_ITER;

	            var test = function (low, high) {
	                var mid = low.interpolate(high, 0.5, mode);
	                var lm = mid.luminance();
	                if (Math.abs(lum - lm) < EPS || !max_iter--) {
	                    // close enough
	                    return mid;
	                }
	                return lm > lum ? test(low, mid) : test(mid, high);
	            };

	            var rgb = (cur_lum > lum ? test(new Color_1([0,0,0]), this) : test(this, new Color_1([255,255,255]))).rgb();
	            return new Color_1(rgb.concat( [this._rgb[3]]));
	        }
	        return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
	    };


	    var rgb2luminance = function (r,g,b) {
	        // relative luminance
	        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	        r = luminance_x(r);
	        g = luminance_x(g);
	        b = luminance_x(b);
	        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	    };

	    var luminance_x = function (x) {
	        x /= 255;
	        return x <= 0.03928 ? x/12.92 : pow$2((x+0.055)/1.055, 2.4);
	    };

	    var interpolator = {};

	    var type$h = utils.type;


	    var mix = function (col1, col2, f) {
	        var arguments$1 = arguments;

	        if ( f === void 0 ) { f=0.5; }
	        var rest = [], len = arguments.length - 3;
	        while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 3 ]; }

	        var mode = rest[0] || 'lrgb';
	        if (!interpolator[mode] && !rest.length) {
	            // fall back to the first supported mode
	            mode = Object.keys(interpolator)[0];
	        }
	        if (!interpolator[mode]) {
	            throw new Error(("interpolation mode " + mode + " is not defined"));
	        }
	        if (type$h(col1) !== 'object') { col1 = new Color_1(col1); }
	        if (type$h(col2) !== 'object') { col2 = new Color_1(col2); }
	        return interpolator[mode](col1, col2, f)
	            .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
	    };

	    Color_1.prototype.mix =
	    Color_1.prototype.interpolate = function(col2, f) {
	    	var arguments$1 = arguments;

	    	if ( f === void 0 ) { f=0.5; }
	    	var rest = [], len = arguments.length - 2;
	    	while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 2 ]; }

	    	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
	    };

	    Color_1.prototype.premultiply = function(mutate) {
	    	if ( mutate === void 0 ) { mutate=false; }

	    	var rgb = this._rgb;
	    	var a = rgb[3];
	    	if (mutate) {
	    		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
	    		return this;
	    	} else {
	    		return new Color_1([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
	    	}
	    };

	    Color_1.prototype.saturate = function(amount) {
	    	if ( amount === void 0 ) { amount=1; }

	    	var me = this;
	    	var lch = me.lch();
	    	lch[1] += labConstants.Kn * amount;
	    	if (lch[1] < 0) { lch[1] = 0; }
	    	return new Color_1(lch, 'lch').alpha(me.alpha(), true);
	    };

	    Color_1.prototype.desaturate = function(amount) {
	    	if ( amount === void 0 ) { amount=1; }

	    	return this.saturate(-amount);
	    };

	    var type$i = utils.type;

	    Color_1.prototype.set = function(mc, value, mutate) {
	        if ( mutate === void 0 ) { mutate=false; }

	        var ref = mc.split('.');
	        var mode = ref[0];
	        var channel = ref[1];
	        var src = this[mode]();
	        if (channel) {
	            var i = mode.indexOf(channel);
	            if (i > -1) {
	                if (type$i(value) == 'string') {
	                    switch(value.charAt(0)) {
	                        case '+': src[i] += +value; break;
	                        case '-': src[i] += +value; break;
	                        case '*': src[i] *= +(value.substr(1)); break;
	                        case '/': src[i] /= +(value.substr(1)); break;
	                        default: src[i] = +value;
	                    }
	                } else if (type$i(value) === 'number') {
	                    src[i] = value;
	                } else {
	                    throw new Error("unsupported value for Color.set");
	                }
	                var out = new Color_1(src, mode);
	                if (mutate) {
	                    this._rgb = out._rgb;
	                    return this;
	                }
	                return out;
	            }
	            throw new Error(("unknown channel " + channel + " in mode " + mode));
	        } else {
	            return src;
	        }
	    };

	    var rgb$1 = function (col1, col2, f) {
	        var xyz0 = col1._rgb;
	        var xyz1 = col2._rgb;
	        return new Color_1(
	            xyz0[0] + f * (xyz1[0]-xyz0[0]),
	            xyz0[1] + f * (xyz1[1]-xyz0[1]),
	            xyz0[2] + f * (xyz1[2]-xyz0[2]),
	            'rgb'
	        )
	    };

	    // register interpolator
	    interpolator.rgb = rgb$1;

	    var sqrt$2 = Math.sqrt;
	    var pow$3 = Math.pow;

	    var lrgb = function (col1, col2, f) {
	        var ref = col1._rgb;
	        var x1 = ref[0];
	        var y1 = ref[1];
	        var z1 = ref[2];
	        var ref$1 = col2._rgb;
	        var x2 = ref$1[0];
	        var y2 = ref$1[1];
	        var z2 = ref$1[2];
	        return new Color_1(
	            sqrt$2(pow$3(x1,2) * (1-f) + pow$3(x2,2) * f),
	            sqrt$2(pow$3(y1,2) * (1-f) + pow$3(y2,2) * f),
	            sqrt$2(pow$3(z1,2) * (1-f) + pow$3(z2,2) * f),
	            'rgb'
	        )
	    };

	    // register interpolator
	    interpolator.lrgb = lrgb;

	    var lab$1 = function (col1, col2, f) {
	        var xyz0 = col1.lab();
	        var xyz1 = col2.lab();
	        return new Color_1(
	            xyz0[0] + f * (xyz1[0]-xyz0[0]),
	            xyz0[1] + f * (xyz1[1]-xyz0[1]),
	            xyz0[2] + f * (xyz1[2]-xyz0[2]),
	            'lab'
	        )
	    };

	    // register interpolator
	    interpolator.lab = lab$1;

	    var _hsx = function (col1, col2, f, m) {
	        var assign, assign$1;

	        var xyz0, xyz1;
	        if (m === 'hsl') {
	            xyz0 = col1.hsl();
	            xyz1 = col2.hsl();
	        } else if (m === 'hsv') {
	            xyz0 = col1.hsv();
	            xyz1 = col2.hsv();
	        } else if (m === 'hcg') {
	            xyz0 = col1.hcg();
	            xyz1 = col2.hcg();
	        } else if (m === 'hsi') {
	            xyz0 = col1.hsi();
	            xyz1 = col2.hsi();
	        } else if (m === 'lch' || m === 'hcl') {
	            m = 'hcl';
	            xyz0 = col1.hcl();
	            xyz1 = col2.hcl();
	        }

	        var hue0, hue1, sat0, sat1, lbv0, lbv1;
	        if (m.substr(0, 1) === 'h') {
	            (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
	            (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
	        }

	        var sat, hue, lbv, dh;

	        if (!isNaN(hue0) && !isNaN(hue1)) {
	            // both colors have hue
	            if (hue1 > hue0 && hue1 - hue0 > 180) {
	                dh = hue1-(hue0+360);
	            } else if (hue1 < hue0 && hue0 - hue1 > 180) {
	                dh = hue1+360-hue0;
	            } else{
	                dh = hue1 - hue0;
	            }
	            hue = hue0 + f * dh;
	        } else if (!isNaN(hue0)) {
	            hue = hue0;
	            if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
	        } else if (!isNaN(hue1)) {
	            hue = hue1;
	            if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
	        } else {
	            hue = Number.NaN;
	        }

	        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
	        lbv = lbv0 + f * (lbv1-lbv0);
	        return new Color_1([hue, sat, lbv], m);
	    };

	    var lch$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'lch');
	    };

	    // register interpolator
	    interpolator.lch = lch$1;
	    interpolator.hcl = lch$1;

	    var num$1 = function (col1, col2, f) {
	        var c1 = col1.num();
	        var c2 = col2.num();
	        return new Color_1(c1 + f * (c2-c1), 'num')
	    };

	    // register interpolator
	    interpolator.num = num$1;

	    var hcg$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'hcg');
	    };

	    // register interpolator
	    interpolator.hcg = hcg$1;

	    var hsi$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'hsi');
	    };

	    // register interpolator
	    interpolator.hsi = hsi$1;

	    var hsl$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'hsl');
	    };

	    // register interpolator
	    interpolator.hsl = hsl$1;

	    var hsv$1 = function (col1, col2, f) {
	    	return _hsx(col1, col2, f, 'hsv');
	    };

	    // register interpolator
	    interpolator.hsv = hsv$1;

	    var clip_rgb$2 = utils.clip_rgb;
	    var pow$4 = Math.pow;
	    var sqrt$3 = Math.sqrt;
	    var PI$1 = Math.PI;
	    var cos$2 = Math.cos;
	    var sin$1 = Math.sin;
	    var atan2$1 = Math.atan2;

	    var average = function (colors, mode) {
	        if ( mode === void 0 ) { mode='lrgb'; }

	        var l = colors.length;
	        // convert colors to Color objects
	        colors = colors.map(function (c) { return new Color_1(c); });
	        if (mode === 'lrgb') {
	            return _average_lrgb(colors)
	        }
	        var first = colors.shift();
	        var xyz = first.get(mode);
	        var cnt = [];
	        var dx = 0;
	        var dy = 0;
	        // initial color
	        for (var i=0; i<xyz.length; i++) {
	            xyz[i] = xyz[i] || 0;
	            cnt.push(isNaN(xyz[i]) ? 0 : 1);
	            if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
	                var A = xyz[i] / 180 * PI$1;
	                dx += cos$2(A);
	                dy += sin$1(A);
	            }
	        }

	        var alpha = first.alpha();
	        colors.forEach(function (c) {
	            var xyz2 = c.get(mode);
	            alpha += c.alpha();
	            for (var i=0; i<xyz.length; i++) {
	                if (!isNaN(xyz2[i])) {
	                    cnt[i]++;
	                    if (mode.charAt(i) === 'h') {
	                        var A = xyz2[i] / 180 * PI$1;
	                        dx += cos$2(A);
	                        dy += sin$1(A);
	                    } else {
	                        xyz[i] += xyz2[i];
	                    }
	                }
	            }
	        });

	        for (var i$1=0; i$1<xyz.length; i$1++) {
	            if (mode.charAt(i$1) === 'h') {
	                var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
	                while (A$1 < 0) { A$1 += 360; }
	                while (A$1 >= 360) { A$1 -= 360; }
	                xyz[i$1] = A$1;
	            } else {
	                xyz[i$1] = xyz[i$1]/cnt[i$1];
	            }
	        }
	        alpha /= l;
	        return (new Color_1(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
	    };


	    var _average_lrgb = function (colors) {
	        var l = colors.length;
	        var f = 1/l;
	        var xyz = [0,0,0,0];
	        for (var i = 0, list = colors; i < list.length; i += 1) {
	            var col = list[i];

	            var rgb = col._rgb;
	            xyz[0] += pow$4(rgb[0],2) * f;
	            xyz[1] += pow$4(rgb[1],2) * f;
	            xyz[2] += pow$4(rgb[2],2) * f;
	            xyz[3] += rgb[3] * f;
	        }
	        xyz[0] = sqrt$3(xyz[0]);
	        xyz[1] = sqrt$3(xyz[1]);
	        xyz[2] = sqrt$3(xyz[2]);
	        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
	        return new Color_1(clip_rgb$2(xyz));
	    };

	    // minimal multi-purpose interface

	    // @requires utils color analyze


	    var type$j = utils.type;

	    var pow$5 = Math.pow;

	    var scale = function(colors) {

	        // constructor
	        var _mode = 'rgb';
	        var _nacol = chroma_1('#ccc');
	        var _spread = 0;
	        // const _fixed = false;
	        var _domain = [0, 1];
	        var _pos = [];
	        var _padding = [0,0];
	        var _classes = false;
	        var _colors = [];
	        var _out = false;
	        var _min = 0;
	        var _max = 1;
	        var _correctLightness = false;
	        var _colorCache = {};
	        var _useCache = true;
	        var _gamma = 1;

	        // private methods

	        var setColors = function(colors) {
	            colors = colors || ['#fff', '#000'];
	            if (colors && type$j(colors) === 'string' && chroma_1.brewer &&
	                chroma_1.brewer[colors.toLowerCase()]) {
	                colors = chroma_1.brewer[colors.toLowerCase()];
	            }
	            if (type$j(colors) === 'array') {
	                // handle single color
	                if (colors.length === 1) {
	                    colors = [colors[0], colors[0]];
	                }
	                // make a copy of the colors
	                colors = colors.slice(0);
	                // convert to chroma classes
	                for (var c=0; c<colors.length; c++) {
	                    colors[c] = chroma_1(colors[c]);
	                }
	                // auto-fill color position
	                _pos.length = 0;
	                for (var c$1=0; c$1<colors.length; c$1++) {
	                    _pos.push(c$1/(colors.length-1));
	                }
	            }
	            resetCache();
	            return _colors = colors;
	        };

	        var getClass = function(value) {
	            if (_classes != null) {
	                var n = _classes.length-1;
	                var i = 0;
	                while (i < n && value >= _classes[i]) {
	                    i++;
	                }
	                return i-1;
	            }
	            return 0;
	        };

	        var tMapLightness = function (t) { return t; };
	        var tMapDomain = function (t) { return t; };

	        // const classifyValue = function(value) {
	        //     let val = value;
	        //     if (_classes.length > 2) {
	        //         const n = _classes.length-1;
	        //         const i = getClass(value);
	        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
	        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
	        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
	        //     }
	        //     return val;
	        // };

	        var getColor = function(val, bypassMap) {
	            var col, t;
	            if (bypassMap == null) { bypassMap = false; }
	            if (isNaN(val) || (val === null)) { return _nacol; }
	            if (!bypassMap) {
	                if (_classes && (_classes.length > 2)) {
	                    // find the class
	                    var c = getClass(val);
	                    t = c / (_classes.length-2);
	                } else if (_max !== _min) {
	                    // just interpolate between min/max
	                    t = (val - _min) / (_max - _min);
	                } else {
	                    t = 1;
	                }
	            } else {
	                t = val;
	            }

	            // domain map
	            t = tMapDomain(t);

	            if (!bypassMap) {
	                t = tMapLightness(t);  // lightness correction
	            }

	            if (_gamma !== 1) { t = pow$5(t, _gamma); }

	            t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

	            t = Math.min(1, Math.max(0, t));

	            var k = Math.floor(t * 10000);

	            if (_useCache && _colorCache[k]) {
	                col = _colorCache[k];
	            } else {
	                if (type$j(_colors) === 'array') {
	                    //for i in [0.._pos.length-1]
	                    for (var i=0; i<_pos.length; i++) {
	                        var p = _pos[i];
	                        if (t <= p) {
	                            col = _colors[i];
	                            break;
	                        }
	                        if ((t >= p) && (i === (_pos.length-1))) {
	                            col = _colors[i];
	                            break;
	                        }
	                        if (t > p && t < _pos[i+1]) {
	                            t = (t-p)/(_pos[i+1]-p);
	                            col = chroma_1.interpolate(_colors[i], _colors[i+1], t, _mode);
	                            break;
	                        }
	                    }
	                } else if (type$j(_colors) === 'function') {
	                    col = _colors(t);
	                }
	                if (_useCache) { _colorCache[k] = col; }
	            }
	            return col;
	        };

	        var resetCache = function () { return _colorCache = {}; };

	        setColors(colors);

	        // public interface

	        var f = function(v) {
	            var c = chroma_1(getColor(v));
	            if (_out && c[_out]) { return c[_out](); } else { return c; }
	        };

	        f.classes = function(classes) {
	            if (classes != null) {
	                if (type$j(classes) === 'array') {
	                    _classes = classes;
	                    _domain = [classes[0], classes[classes.length-1]];
	                } else {
	                    var d = chroma_1.analyze(_domain);
	                    if (classes === 0) {
	                        _classes = [d.min, d.max];
	                    } else {
	                        _classes = chroma_1.limits(d, 'e', classes);
	                    }
	                }
	                return f;
	            }
	            return _classes;
	        };


	        f.domain = function(domain) {
	            if (!arguments.length) {
	                return _domain;
	            }
	            _min = domain[0];
	            _max = domain[domain.length-1];
	            _pos = [];
	            var k = _colors.length;
	            if ((domain.length === k) && (_min !== _max)) {
	                // update positions
	                for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
	                    var d = list[i];

	                  _pos.push((d-_min) / (_max-_min));
	                }
	            } else {
	                for (var c=0; c<k; c++) {
	                    _pos.push(c/(k-1));
	                }
	                if (domain.length > 2) {
	                    // set domain map
	                    var tOut = domain.map(function (d,i) { return i/(domain.length-1); });
	                    var tBreaks = domain.map(function (d) { return (d - _min) / (_max - _min); });
	                    if (!tBreaks.every(function (val, i) { return tOut[i] === val; })) {
	                        tMapDomain = function (t) {
	                            if (t <= 0 || t >= 1) { return t; }
	                            var i = 0;
	                            while (t >= tBreaks[i+1]) { i++; }
	                            var f = (t - tBreaks[i]) / (tBreaks[i+1] - tBreaks[i]);
	                            var out = tOut[i] + f * (tOut[i+1] - tOut[i]);
	                            return out;
	                        };
	                    }

	                }
	            }
	            _domain = [_min, _max];
	            return f;
	        };

	        f.mode = function(_m) {
	            if (!arguments.length) {
	                return _mode;
	            }
	            _mode = _m;
	            resetCache();
	            return f;
	        };

	        f.range = function(colors, _pos) {
	            setColors(colors);
	            return f;
	        };

	        f.out = function(_o) {
	            _out = _o;
	            return f;
	        };

	        f.spread = function(val) {
	            if (!arguments.length) {
	                return _spread;
	            }
	            _spread = val;
	            return f;
	        };

	        f.correctLightness = function(v) {
	            if (v == null) { v = true; }
	            _correctLightness = v;
	            resetCache();
	            if (_correctLightness) {
	                tMapLightness = function(t) {
	                    var L0 = getColor(0, true).lab()[0];
	                    var L1 = getColor(1, true).lab()[0];
	                    var pol = L0 > L1;
	                    var L_actual = getColor(t, true).lab()[0];
	                    var L_ideal = L0 + ((L1 - L0) * t);
	                    var L_diff = L_actual - L_ideal;
	                    var t0 = 0;
	                    var t1 = 1;
	                    var max_iter = 20;
	                    while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
	                        (function() {
	                            if (pol) { L_diff *= -1; }
	                            if (L_diff < 0) {
	                                t0 = t;
	                                t += (t1 - t) * 0.5;
	                            } else {
	                                t1 = t;
	                                t += (t0 - t) * 0.5;
	                            }
	                            L_actual = getColor(t, true).lab()[0];
	                            return L_diff = L_actual - L_ideal;
	                        })();
	                    }
	                    return t;
	                };
	            } else {
	                tMapLightness = function (t) { return t; };
	            }
	            return f;
	        };

	        f.padding = function(p) {
	            if (p != null) {
	                if (type$j(p) === 'number') {
	                    p = [p,p];
	                }
	                _padding = p;
	                return f;
	            } else {
	                return _padding;
	            }
	        };

	        f.colors = function(numColors, out) {
	            // If no arguments are given, return the original colors that were provided
	            if (arguments.length < 2) { out = 'hex'; }
	            var result = [];

	            if (arguments.length === 0) {
	                result = _colors.slice(0);

	            } else if (numColors === 1) {
	                result = [f(0.5)];

	            } else if (numColors > 1) {
	                var dm = _domain[0];
	                var dd = _domain[1] - dm;
	                result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

	            } else { // returns all colors based on the defined classes
	                colors = [];
	                var samples = [];
	                if (_classes && (_classes.length > 2)) {
	                    for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
	                        samples.push((_classes[i-1]+_classes[i])*0.5);
	                    }
	                } else {
	                    samples = _domain;
	                }
	                result = samples.map(function (v) { return f(v); });
	            }

	            if (chroma_1[out]) {
	                result = result.map(function (c) { return c[out](); });
	            }
	            return result;
	        };

	        f.cache = function(c) {
	            if (c != null) {
	                _useCache = c;
	                return f;
	            } else {
	                return _useCache;
	            }
	        };

	        f.gamma = function(g) {
	            if (g != null) {
	                _gamma = g;
	                return f;
	            } else {
	                return _gamma;
	            }
	        };

	        f.nodata = function(d) {
	            if (d != null) {
	                _nacol = chroma_1(d);
	                return f;
	            } else {
	                return _nacol;
	            }
	        };

	        return f;
	    };

	    function __range__(left, right, inclusive) {
	      var range = [];
	      var ascending = left < right;
	      var end = !inclusive ? right : ascending ? right + 1 : right - 1;
	      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
	        range.push(i);
	      }
	      return range;
	    }

	    //
	    // interpolates between a set of colors uzing a bezier spline
	    //

	    // @requires utils lab




	    var bezier = function(colors) {
	        var assign, assign$1, assign$2;

	        var I, lab0, lab1, lab2;
	        colors = colors.map(function (c) { return new Color_1(c); });
	        if (colors.length === 2) {
	            // linear interpolation
	            (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
	                return new Color_1(lab, 'lab');
	            };
	        } else if (colors.length === 3) {
	            // quadratic bezier interpolation
	            (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
	                return new Color_1(lab, 'lab');
	            };
	        } else if (colors.length === 4) {
	            // cubic bezier interpolation
	            var lab3;
	            (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
	                return new Color_1(lab, 'lab');
	            };
	        } else if (colors.length === 5) {
	            var I0 = bezier(colors.slice(0, 3));
	            var I1 = bezier(colors.slice(2, 5));
	            I = function(t) {
	                if (t < 0.5) {
	                    return I0(t*2);
	                } else {
	                    return I1((t-0.5)*2);
	                }
	            };
	        }
	        return I;
	    };

	    var bezier_1 = function (colors) {
	        var f = bezier(colors);
	        f.scale = function () { return scale(f); };
	        return f;
	    };

	    /*
	     * interpolates between a set of colors uzing a bezier spline
	     * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
	     */




	    var blend = function (bottom, top, mode) {
	        if (!blend[mode]) {
	            throw new Error('unknown blend mode ' + mode);
	        }
	        return blend[mode](bottom, top);
	    };

	    var blend_f = function (f) { return function (bottom,top) {
	            var c0 = chroma_1(top).rgb();
	            var c1 = chroma_1(bottom).rgb();
	            return chroma_1.rgb(f(c0, c1));
	        }; };

	    var each = function (f) { return function (c0, c1) {
	            var out = [];
	            out[0] = f(c0[0], c1[0]);
	            out[1] = f(c0[1], c1[1]);
	            out[2] = f(c0[2], c1[2]);
	            return out;
	        }; };

	    var normal = function (a) { return a; };
	    var multiply = function (a,b) { return a * b / 255; };
	    var darken$1 = function (a,b) { return a > b ? b : a; };
	    var lighten = function (a,b) { return a > b ? a : b; };
	    var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
	    var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
	    var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
	    var dodge = function (a,b) {
	        if (a === 255) { return 255; }
	        a = 255 * (b / 255) / (1 - a / 255);
	        return a > 255 ? 255 : a
	    };

	    // # add = (a,b) ->
	    // #     if (a + b > 255) then 255 else a + b

	    blend.normal = blend_f(each(normal));
	    blend.multiply = blend_f(each(multiply));
	    blend.screen = blend_f(each(screen));
	    blend.overlay = blend_f(each(overlay));
	    blend.darken = blend_f(each(darken$1));
	    blend.lighten = blend_f(each(lighten));
	    blend.dodge = blend_f(each(dodge));
	    blend.burn = blend_f(each(burn));
	    // blend.add = blend_f(each(add));

	    var blend_1 = blend;

	    // cubehelix interpolation
	    // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
	    // http://astron-soc.in/bulletin/11June/289392011.pdf

	    var type$k = utils.type;
	    var clip_rgb$3 = utils.clip_rgb;
	    var TWOPI$2 = utils.TWOPI;
	    var pow$6 = Math.pow;
	    var sin$2 = Math.sin;
	    var cos$3 = Math.cos;


	    var cubehelix = function(start, rotations, hue, gamma, lightness) {
	        if ( start === void 0 ) { start=300; }
	        if ( rotations === void 0 ) { rotations=-1.5; }
	        if ( hue === void 0 ) { hue=1; }
	        if ( gamma === void 0 ) { gamma=1; }
	        if ( lightness === void 0 ) { lightness=[0,1]; }

	        var dh = 0, dl;
	        if (type$k(lightness) === 'array') {
	            dl = lightness[1] - lightness[0];
	        } else {
	            dl = 0;
	            lightness = [lightness, lightness];
	        }

	        var f = function(fract) {
	            var a = TWOPI$2 * (((start+120)/360) + (rotations * fract));
	            var l = pow$6(lightness[0] + (dl * fract), gamma);
	            var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
	            var amp = (h * l * (1-l)) / 2;
	            var cos_a = cos$3(a);
	            var sin_a = sin$2(a);
	            var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
	            var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
	            var b = l + (amp * (+1.97294 * cos_a));
	            return chroma_1(clip_rgb$3([r*255,g*255,b*255,1]));
	        };

	        f.start = function(s) {
	            if ((s == null)) { return start; }
	            start = s;
	            return f;
	        };

	        f.rotations = function(r) {
	            if ((r == null)) { return rotations; }
	            rotations = r;
	            return f;
	        };

	        f.gamma = function(g) {
	            if ((g == null)) { return gamma; }
	            gamma = g;
	            return f;
	        };

	        f.hue = function(h) {
	            if ((h == null)) { return hue; }
	            hue = h;
	            if (type$k(hue) === 'array') {
	                dh = hue[1] - hue[0];
	                if (dh === 0) { hue = hue[1]; }
	            } else {
	                dh = 0;
	            }
	            return f;
	        };

	        f.lightness = function(h) {
	            if ((h == null)) { return lightness; }
	            if (type$k(h) === 'array') {
	                lightness = h;
	                dl = h[1] - h[0];
	            } else {
	                lightness = [h,h];
	                dl = 0;
	            }
	            return f;
	        };

	        f.scale = function () { return chroma_1.scale(f); };

	        f.hue(hue);

	        return f;
	    };

	    var digits = '0123456789abcdef';

	    var floor$2 = Math.floor;
	    var random = Math.random;

	    var random_1 = function () {
	        var code = '#';
	        for (var i=0; i<6; i++) {
	            code += digits.charAt(floor$2(random() * 16));
	        }
	        return new Color_1(code, 'hex');
	    };

	    var log$1 = Math.log;
	    var pow$7 = Math.pow;
	    var floor$3 = Math.floor;
	    var abs = Math.abs;


	    var analyze = function (data, key) {
	        if ( key === void 0 ) { key=null; }

	        var r = {
	            min: Number.MAX_VALUE,
	            max: Number.MAX_VALUE*-1,
	            sum: 0,
	            values: [],
	            count: 0
	        };
	        if (type(data) === 'object') {
	            data = Object.values(data);
	        }
	        data.forEach(function (val) {
	            if (key && type(val) === 'object') { val = val[key]; }
	            if (val !== undefined && val !== null && !isNaN(val)) {
	                r.values.push(val);
	                r.sum += val;
	                if (val < r.min) { r.min = val; }
	                if (val > r.max) { r.max = val; }
	                r.count += 1;
	            }
	        });

	        r.domain = [r.min, r.max];

	        r.limits = function (mode, num) { return limits(r, mode, num); };

	        return r;
	    };


	    var limits = function (data, mode, num) {
	        if ( mode === void 0 ) { mode='equal'; }
	        if ( num === void 0 ) { num=7; }

	        if (type(data) == 'array') {
	            data = analyze(data);
	        }
	        var min = data.min;
	        var max = data.max;
	        var values = data.values.sort(function (a,b) { return a-b; });

	        if (num === 1) { return [min,max]; }

	        var limits = [];

	        if (mode.substr(0,1) === 'c') { // continuous
	            limits.push(min);
	            limits.push(max);
	        }

	        if (mode.substr(0,1) === 'e') { // equal interval
	            limits.push(min);
	            for (var i=1; i<num; i++) {
	                limits.push(min+((i/num)*(max-min)));
	            }
	            limits.push(max);
	        }

	        else if (mode.substr(0,1) === 'l') { // log scale
	            if (min <= 0) {
	                throw new Error('Logarithmic scales are only possible for values > 0');
	            }
	            var min_log = Math.LOG10E * log$1(min);
	            var max_log = Math.LOG10E * log$1(max);
	            limits.push(min);
	            for (var i$1=1; i$1<num; i$1++) {
	                limits.push(pow$7(10, min_log + ((i$1/num) * (max_log - min_log))));
	            }
	            limits.push(max);
	        }

	        else if (mode.substr(0,1) === 'q') { // quantile scale
	            limits.push(min);
	            for (var i$2=1; i$2<num; i$2++) {
	                var p = ((values.length-1) * i$2)/num;
	                var pb = floor$3(p);
	                if (pb === p) {
	                    limits.push(values[pb]);
	                } else { // p > pb
	                    var pr = p - pb;
	                    limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
	                }
	            }
	            limits.push(max);

	        }

	        else if (mode.substr(0,1) === 'k') { // k-means clustering
	            /*
	            implementation based on
	            http://code.google.com/p/figue/source/browse/trunk/figue.js#336
	            simplified for 1-d input values
	            */
	            var cluster;
	            var n = values.length;
	            var assignments = new Array(n);
	            var clusterSizes = new Array(num);
	            var repeat = true;
	            var nb_iters = 0;
	            var centroids = null;

	            // get seed values
	            centroids = [];
	            centroids.push(min);
	            for (var i$3=1; i$3<num; i$3++) {
	                centroids.push(min + ((i$3/num) * (max-min)));
	            }
	            centroids.push(max);

	            while (repeat) {
	                // assignment step
	                for (var j=0; j<num; j++) {
	                    clusterSizes[j] = 0;
	                }
	                for (var i$4=0; i$4<n; i$4++) {
	                    var value = values[i$4];
	                    var mindist = Number.MAX_VALUE;
	                    var best = (void 0);
	                    for (var j$1=0; j$1<num; j$1++) {
	                        var dist = abs(centroids[j$1]-value);
	                        if (dist < mindist) {
	                            mindist = dist;
	                            best = j$1;
	                        }
	                        clusterSizes[best]++;
	                        assignments[i$4] = best;
	                    }
	                }

	                // update centroids step
	                var newCentroids = new Array(num);
	                for (var j$2=0; j$2<num; j$2++) {
	                    newCentroids[j$2] = null;
	                }
	                for (var i$5=0; i$5<n; i$5++) {
	                    cluster = assignments[i$5];
	                    if (newCentroids[cluster] === null) {
	                        newCentroids[cluster] = values[i$5];
	                    } else {
	                        newCentroids[cluster] += values[i$5];
	                    }
	                }
	                for (var j$3=0; j$3<num; j$3++) {
	                    newCentroids[j$3] *= 1/clusterSizes[j$3];
	                }

	                // check convergence
	                repeat = false;
	                for (var j$4=0; j$4<num; j$4++) {
	                    if (newCentroids[j$4] !== centroids[j$4]) {
	                        repeat = true;
	                        break;
	                    }
	                }

	                centroids = newCentroids;
	                nb_iters++;

	                if (nb_iters > 200) {
	                    repeat = false;
	                }
	            }

	            // finished k-means clustering
	            // the next part is borrowed from gabrielflor.it
	            var kClusters = {};
	            for (var j$5=0; j$5<num; j$5++) {
	                kClusters[j$5] = [];
	            }
	            for (var i$6=0; i$6<n; i$6++) {
	                cluster = assignments[i$6];
	                kClusters[cluster].push(values[i$6]);
	            }
	            var tmpKMeansBreaks = [];
	            for (var j$6=0; j$6<num; j$6++) {
	                tmpKMeansBreaks.push(kClusters[j$6][0]);
	                tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
	            }
	            tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
	            limits.push(tmpKMeansBreaks[0]);
	            for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
	                var v = tmpKMeansBreaks[i$7];
	                if (!isNaN(v) && (limits.indexOf(v) === -1)) {
	                    limits.push(v);
	                }
	            }
	        }
	        return limits;
	    };

	    var analyze_1 = {analyze: analyze, limits: limits};

	    var contrast = function (a, b) {
	        // WCAG contrast ratio
	        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
	        a = new Color_1(a);
	        b = new Color_1(b);
	        var l1 = a.luminance();
	        var l2 = b.luminance();
	        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
	    };

	    var sqrt$4 = Math.sqrt;
	    var atan2$2 = Math.atan2;
	    var abs$1 = Math.abs;
	    var cos$4 = Math.cos;
	    var PI$2 = Math.PI;

	    var deltaE = function(a, b, L, C) {
	        if ( L === void 0 ) { L=1; }
	        if ( C === void 0 ) { C=1; }

	        // Delta E (CMC)
	        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CMC.html
	        a = new Color_1(a);
	        b = new Color_1(b);
	        var ref = Array.from(a.lab());
	        var L1 = ref[0];
	        var a1 = ref[1];
	        var b1 = ref[2];
	        var ref$1 = Array.from(b.lab());
	        var L2 = ref$1[0];
	        var a2 = ref$1[1];
	        var b2 = ref$1[2];
	        var c1 = sqrt$4((a1 * a1) + (b1 * b1));
	        var c2 = sqrt$4((a2 * a2) + (b2 * b2));
	        var sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + (0.01765 * L1));
	        var sc = ((0.0638 * c1) / (1.0 + (0.0131 * c1))) + 0.638;
	        var h1 = c1 < 0.000001 ? 0.0 : (atan2$2(b1, a1) * 180.0) / PI$2;
	        while (h1 < 0) { h1 += 360; }
	        while (h1 >= 360) { h1 -= 360; }
	        var t = (h1 >= 164.0) && (h1 <= 345.0) ? (0.56 + abs$1(0.2 * cos$4((PI$2 * (h1 + 168.0)) / 180.0))) : (0.36 + abs$1(0.4 * cos$4((PI$2 * (h1 + 35.0)) / 180.0)));
	        var c4 = c1 * c1 * c1 * c1;
	        var f = sqrt$4(c4 / (c4 + 1900.0));
	        var sh = sc * (((f * t) + 1.0) - f);
	        var delL = L1 - L2;
	        var delC = c1 - c2;
	        var delA = a1 - a2;
	        var delB = b1 - b2;
	        var dH2 = ((delA * delA) + (delB * delB)) - (delC * delC);
	        var v1 = delL / (L * sl);
	        var v2 = delC / (C * sc);
	        var v3 = sh;
	        return sqrt$4((v1 * v1) + (v2 * v2) + (dH2 / (v3 * v3)));
	    };

	    // simple Euclidean distance
	    var distance = function(a, b, mode) {
	        if ( mode === void 0 ) { mode='lab'; }

	        // Delta E (CIE 1976)
	        // see http://www.brucelindbloom.com/index.html?Equations.html
	        a = new Color_1(a);
	        b = new Color_1(b);
	        var l1 = a.get(mode);
	        var l2 = b.get(mode);
	        var sum_sq = 0;
	        for (var i in l1) {
	            var d = (l1[i] || 0) - (l2[i] || 0);
	            sum_sq += d*d;
	        }
	        return Math.sqrt(sum_sq);
	    };

	    var valid = function () {
	        var arguments$1 = arguments;

	        var args = [], len = arguments.length;
	        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

	        try {
	            new (Function.prototype.bind.apply( Color_1, [ null ].concat( args) ));
	            return true;
	        } catch (e) {
	            return false;
	        }
	    };

	    // some pre-defined color scales:




	    var scales = {
	    	cool: function cool() { return scale([chroma_1.hsl(180,1,.9), chroma_1.hsl(250,.7,.4)]) },
	    	hot: function hot() { return scale(['#000','#f00','#ff0','#fff']).mode('rgb') }
	    };

	    /**
	        ColorBrewer colors for chroma.js

	        Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
	        Pennsylvania State University.

	        Licensed under the Apache License, Version 2.0 (the "License");
	        you may not use this file except in compliance with the License.
	        You may obtain a copy of the License at
	        http://www.apache.org/licenses/LICENSE-2.0

	        Unless required by applicable law or agreed to in writing, software distributed
	        under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	        CONDITIONS OF ANY KIND, either express or implied. See the License for the
	        specific language governing permissions and limitations under the License.
	    */

	    var colorbrewer = {
	        // sequential
	        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
	        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
	        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
	        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
	        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
	        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
	        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
	        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
	        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
	        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
	        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
	        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
	        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
	        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
	        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
	        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
	        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
	        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
	        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

	        // diverging

	        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
	        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
	        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
	        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
	        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
	        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
	        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
	        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
	        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

	        // qualitative

	        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
	        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
	        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
	        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
	        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
	        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
	        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
	        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
	    };

	    // add lowercase aliases for case-insensitive matches
	    for (var i$1 = 0, list$1 = Object.keys(colorbrewer); i$1 < list$1.length; i$1 += 1) {
	        var key = list$1[i$1];

	        colorbrewer[key.toLowerCase()] = colorbrewer[key];
	    }

	    var colorbrewer_1 = colorbrewer;

	    // feel free to comment out anything to rollup
	    // a smaller chroma.js built

	    // io --> convert colors















	    // operators --> modify existing Colors










	    // interpolators










	    // generators -- > create new colors
	    chroma_1.average = average;
	    chroma_1.bezier = bezier_1;
	    chroma_1.blend = blend_1;
	    chroma_1.cubehelix = cubehelix;
	    chroma_1.mix = chroma_1.interpolate = mix;
	    chroma_1.random = random_1;
	    chroma_1.scale = scale;

	    // other utility methods
	    chroma_1.analyze = analyze_1.analyze;
	    chroma_1.contrast = contrast;
	    chroma_1.deltaE = deltaE;
	    chroma_1.distance = distance;
	    chroma_1.limits = analyze_1.limits;
	    chroma_1.valid = valid;

	    // scale
	    chroma_1.scales = scales;

	    // colors
	    chroma_1.colors = w3cx11_1;
	    chroma_1.brewer = colorbrewer_1;

	    var chroma_js = chroma_1;

	    return chroma_js;

	})));
	});

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
	function get$1(object, key, _default) {
	    if ( key === void 0 ) key = null;
	    if ( _default === void 0 ) _default = null;

	    if (!key) { return object; }
	    // expand keys
	    var keys = key.split('.');
	    var pt = object;

	    for (var i = 0; i < keys.length; i++) {
	        if (pt === null || pt === undefined) { break; } // break out of the loop
	        // move one more level in
	        pt = pt[keys[i]];
	    }
	    return pt === undefined || pt === null ? _default : pt;
	}

	var underscore = createCommonjsModule(function (module, exports) {
	//     Underscore.js 1.9.1
	//     http://underscorejs.org
	//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` (`self`) in the browser, `global`
	  // on the server, or `this` in some virtual machines. We use `self`
	  // instead of `window` for `WebWorker` support.
	  var root = typeof self == 'object' && self.self === self && self ||
	            typeof commonjsGlobal == 'object' && commonjsGlobal.global === commonjsGlobal && commonjsGlobal ||
	            this ||
	            {};

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
	  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

	  // Create quick reference variables for speed access to core prototypes.
	  var push = ArrayProto.push,
	      slice = ArrayProto.slice,
	      toString = ObjProto.toString,
	      hasOwnProperty = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var nativeIsArray = Array.isArray,
	      nativeKeys = Object.keys,
	      nativeCreate = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) { return obj; }
	    if (!(this instanceof _)) { return new _(obj); }
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for their old module API. If we're in
	  // the browser, add `_` as a global object.
	  // (`nodeType` is checked to ensure that `module`
	  // and `exports` are not HTML elements.)
	  if ( !exports.nodeType) {
	    if ( !module.nodeType && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.9.1';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) { return func; }
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      // The 2-argument case is omitted because we’re not using it.
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  var builtinIteratee;

	  // An internal function to generate callbacks that can be applied to each
	  // element in a collection, returning the desired result — either `identity`,
	  // an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (_.iteratee !== builtinIteratee) { return _.iteratee(value, context); }
	    if (value == null) { return _.identity; }
	    if (_.isFunction(value)) { return optimizeCb(value, context, argCount); }
	    if (_.isObject(value) && !_.isArray(value)) { return _.matcher(value); }
	    return _.property(value);
	  };

	  // External wrapper for our callback generator. Users may customize
	  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
	  // This abstraction hides the internal-only argCount argument.
	  _.iteratee = builtinIteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // Some functions take a variable number of arguments, or a few expected
	  // arguments at the beginning and then a variable number of values to operate
	  // on. This helper accumulates all remaining arguments past the function’s
	  // argument length (or an explicit `startIndex`), into an array that becomes
	  // the last argument. Similar to ES6’s "rest parameter".
	  var restArguments = function(func, startIndex) {
	    startIndex = startIndex == null ? func.length - 1 : +startIndex;
	    return function() {
	      var arguments$1 = arguments;

	      var length = Math.max(arguments.length - startIndex, 0),
	          rest = Array(length),
	          index = 0;
	      for (; index < length; index++) {
	        rest[index] = arguments$1[index + startIndex];
	      }
	      switch (startIndex) {
	        case 0: return func.call(this, rest);
	        case 1: return func.call(this, arguments[0], rest);
	        case 2: return func.call(this, arguments[0], arguments[1], rest);
	      }
	      var args = Array(startIndex + 1);
	      for (index = 0; index < startIndex; index++) {
	        args[index] = arguments$1[index];
	      }
	      args[startIndex] = rest;
	      return func.apply(this, args);
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) { return {}; }
	    if (nativeCreate) { return nativeCreate(prototype); }
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var shallowProperty = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  var has = function(obj, path) {
	    return obj != null && hasOwnProperty.call(obj, path);
	  };

	  var deepGet = function(obj, path) {
	    var length = path.length;
	    for (var i = 0; i < length; i++) {
	      if (obj == null) { return void 0; }
	      obj = obj[path[i]];
	    }
	    return length ? obj : void 0;
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object.
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = shallowProperty('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  var createReduce = function(dir) {
	    // Wrap code that reassigns argument variables in a separate function than
	    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
	    var reducer = function(obj, iteratee, memo, initial) {
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      if (!initial) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    };

	    return function(obj, iteratee, memo, context) {
	      var initial = arguments.length >= 3;
	      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
	    };
	  };

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
	    var key = keyFinder(obj, predicate, context);
	    if (key !== void 0 && key !== -1) { return obj[key]; }
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) { results.push(value); }
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) { return false; }
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) { return true; }
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) { obj = _.values(obj); }
	    if (typeof fromIndex != 'number' || guard) { fromIndex = 0; }
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = restArguments(function(obj, path, args) {
	    var contextPath, func;
	    if (_.isFunction(path)) {
	      func = path;
	    } else if (_.isArray(path)) {
	      contextPath = path.slice(0, -1);
	      path = path[path.length - 1];
	    }
	    return _.map(obj, function(context) {
	      var method = func;
	      if (!method) {
	        if (contextPath && contextPath.length) {
	          context = deepGet(context, contextPath);
	        }
	        if (context == null) { return void 0; }
	        method = context[path];
	      }
	      return method == null ? method : method.apply(context, args);
	    });
	  });

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value != null && value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(v, index, list) {
	        computed = iteratee(v, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = v;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value != null && value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(v, index, list) {
	        computed = iteratee(v, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = v;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection.
	  _.shuffle = function(obj) {
	    return _.sample(obj, Infinity);
	  };

	  // Sample **n** random values from a collection using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) { obj = _.values(obj); }
	      return obj[_.random(obj.length - 1)];
	    }
	    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
	    var length = getLength(sample);
	    n = Math.max(Math.min(n, length), 0);
	    var last = length - 1;
	    for (var index = 0; index < n; index++) {
	      var rand = _.random(index, last);
	      var temp = sample[index];
	      sample[index] = sample[rand];
	      sample[rand] = temp;
	    }
	    return sample.slice(0, n);
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    var index = 0;
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, key, list) {
	      return {
	        value: value,
	        index: index++,
	        criteria: iteratee(value, key, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) { return 1; }
	        if (a < b || b === void 0) { return -1; }
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior, partition) {
	    return function(obj, iteratee, context) {
	      var result = partition ? [[], []] : {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (has(result, key)) { result[key].push(value); } else { result[key] = [value]; }
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (has(result, key)) { result[key]++; } else { result[key] = 1; }
	  });

	  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) { return []; }
	    if (_.isArray(obj)) { return slice.call(obj); }
	    if (_.isString(obj)) {
	      // Keep surrogate pair characters together
	      return obj.match(reStrSymbol);
	    }
	    if (isArrayLike(obj)) { return _.map(obj, _.identity); }
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) { return 0; }
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = group(function(result, value, pass) {
	    result[pass ? 0 : 1].push(value);
	  }, true);

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null || array.length < 1) { return n == null ? void 0 : []; }
	    if (n == null || guard) { return array[0]; }
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null || array.length < 1) { return n == null ? void 0 : []; }
	    if (n == null || guard) { return array[array.length - 1]; }
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, Boolean);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, output) {
	    output = output || [];
	    var idx = output.length;
	    for (var i = 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        // Flatten current level of array or arguments object.
	        if (shallow) {
	          var j = 0, len = value.length;
	          while (j < len) { output[idx++] = value[j++]; }
	        } else {
	          flatten(value, shallow, strict, output);
	          idx = output.length;
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = restArguments(function(array, otherArrays) {
	    return _.difference(array, otherArrays);
	  });

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // The faster algorithm will not work with an iteratee if the iteratee
	  // is not a one-to-one function, so providing an iteratee will disable
	  // the faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) { iteratee = cb(iteratee, context); }
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted && !iteratee) {
	        if (!i || seen !== computed) { result.push(value); }
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = restArguments(function(arrays) {
	    return _.uniq(flatten(arrays, true, true));
	  });

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var arguments$1 = arguments;

	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) { continue; }
	      var j;
	      for (j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments$1[j], item)) { break; }
	      }
	      if (j === argsLength) { result.push(item); }
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = restArguments(function(array, rest) {
	    rest = flatten(rest, true, true);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  });

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices.
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = restArguments(_.unzip);

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values. Passing by pairs is the reverse of _.pairs.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions.
	  var createPredicateIndexFinder = function(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) { return index; }
	      }
	      return -1;
	    };
	  };

	  // Returns the first index on an array-like that passes a predicate test.
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) { low = mid + 1; } else { high = mid; }
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions.
	  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
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
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) { return idx; }
	      }
	      return -1;
	    };
	  };

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
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
	  };

	  // Chunk a single array into multiple arrays, each containing `count` or fewer
	  // items.
	  _.chunk = function(array, count) {
	    if (count == null || count < 1) { return []; }
	    var result = [];
	    var i = 0, length = array.length;
	    while (i < length) {
	      result.push(slice.call(array, i, i += count));
	    }
	    return result;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments.
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) { return sourceFunc.apply(context, args); }
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) { return result; }
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = restArguments(function(func, context, args) {
	    if (!_.isFunction(func)) { throw new TypeError('Bind must be called on a function'); }
	    var bound = restArguments(function(callArgs) {
	      return executeBound(func, bound, context, this, args.concat(callArgs));
	    });
	    return bound;
	  });

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder by default, allowing any combination of arguments to be
	  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
	  _.partial = restArguments(function(func, boundArgs) {
	    var placeholder = _.partial.placeholder;
	    var bound = function() {
	      var arguments$1 = arguments;

	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === placeholder ? arguments$1[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) { args.push(arguments$1[position++]); }
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  });

	  _.partial.placeholder = _;

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = restArguments(function(obj, keys) {
	    keys = flatten(keys, false, false);
	    var index = keys.length;
	    if (index < 1) { throw new Error('bindAll must be passed function names'); }
	    while (index--) {
	      var key = keys[index];
	      obj[key] = _.bind(obj[key], obj);
	    }
	  });

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!has(cache, address)) { cache[address] = func.apply(this, arguments); }
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = restArguments(function(func, wait, args) {
	    return setTimeout(function() {
	      return func.apply(null, args);
	    }, wait);
	  });

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var timeout, context, args, result;
	    var previous = 0;
	    if (!options) { options = {}; }

	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) { context = args = null; }
	    };

	    var throttled = function() {
	      var now = _.now();
	      if (!previous && options.leading === false) { previous = now; }
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
	        if (!timeout) { context = args = null; }
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };

	    throttled.cancel = function() {
	      clearTimeout(timeout);
	      previous = 0;
	      timeout = context = args = null;
	    };

	    return throttled;
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, result;

	    var later = function(context, args) {
	      timeout = null;
	      if (args) { result = func.apply(context, args); }
	    };

	    var debounced = restArguments(function(args) {
	      if (timeout) { clearTimeout(timeout); }
	      if (immediate) {
	        var callNow = !timeout;
	        timeout = setTimeout(later, wait);
	        if (callNow) { result = func.apply(this, args); }
	      } else {
	        timeout = _.delay(later, wait, this, args);
	      }

	      return result;
	    });

	    debounced.cancel = function() {
	      clearTimeout(timeout);
	      timeout = null;
	    };

	    return debounced;
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) { result = args[i].call(this, result); }
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) { func = null; }
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  _.restArguments = restArguments;

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  var collectNonEnumProps = function(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (has(obj, prop) && !_.contains(keys, prop)) { keys.push(prop); }

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  };

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`.
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) { return []; }
	    if (nativeKeys) { return nativeKeys(obj); }
	    var keys = [];
	    for (var key in obj) { if (has(obj, key)) { keys.push(key); } }
	    // Ahem, IE < 9.
	    if (hasEnumBug) { collectNonEnumProps(obj, keys); }
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) { return []; }
	    var keys = [];
	    for (var key in obj) { keys.push(key); }
	    // Ahem, IE < 9.
	    if (hasEnumBug) { collectNonEnumProps(obj, keys); }
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object.
	  // In contrast to _.map it returns an object.
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = _.keys(obj),
	        length = keys.length,
	        results = {};
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys[index];
	      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  // The opposite of _.object.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`.
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) { names.push(key); }
	    }
	    return names.sort();
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, defaults) {
	    return function(obj) {
	      var arguments$1 = arguments;

	      var length = arguments.length;
	      if (defaults) { obj = Object(obj); }
	      if (length < 2 || obj == null) { return obj; }
	      for (var index = 1; index < length; index++) {
	        var source = arguments$1[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!defaults || obj[key] === void 0) { obj[key] = source[key]; }
	        }
	      }
	      return obj;
	    };
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s).
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test.
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) { return key; }
	    }
	  };

	  // Internal pick helper function to determine if `obj` has key `key`.
	  var keyInObj = function(value, key, obj) {
	    return key in obj;
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = restArguments(function(obj, keys) {
	    var result = {}, iteratee = keys[0];
	    if (obj == null) { return result; }
	    if (_.isFunction(iteratee)) {
	      if (keys.length > 1) { iteratee = optimizeCb(iteratee, keys[1]); }
	      keys = _.allKeys(obj);
	    } else {
	      iteratee = keyInObj;
	      keys = flatten(keys, false, false);
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) { result[key] = value; }
	    }
	    return result;
	  });

	  // Return a copy of the object without the blacklisted properties.
	  _.omit = restArguments(function(obj, keys) {
	    var iteratee = keys[0], context;
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	      if (keys.length > 1) { context = keys[1]; }
	    } else {
	      keys = _.map(flatten(keys, false, false), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  });

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) { _.extendOwn(result, props); }
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) { return obj; }
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) { return !length; }
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) { return false; }
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq, deepEq;
	  eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) { return a !== 0 || 1 / a === 1 / b; }
	    // `null` or `undefined` only equal to itself (strict comparison).
	    if (a == null || b == null) { return false; }
	    // `NaN`s are equivalent, but non-reflexive.
	    if (a !== a) { return b !== b; }
	    // Exhaust primitive checks
	    var type = typeof a;
	    if (type !== 'function' && type !== 'object' && typeof b != 'object') { return false; }
	    return deepEq(a, b, aStack, bStack);
	  };

	  // Internal recursive comparison function for `isEqual`.
	  deepEq = function(a, b, aStack, bStack) {
	    // Unwrap any wrapped objects.
	    if (a instanceof _) { a = a._wrapped; }
	    if (b instanceof _) { b = b._wrapped; }
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) { return false; }
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN.
	        if (+a !== +a) { return +b !== +b; }
	        // An `egal` comparison is performed for other numeric values.
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
	      if (typeof a != 'object' || typeof b != 'object') { return false; }

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) { return bStack[length] === b; }
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) { return false; }
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) { return false; }
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) { return false; }
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) { return false; }
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) { return true; }
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) { return obj.length === 0; }
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
	  var nodelist = root.document && root.document.childNodes;
	  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`?
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && isNaN(obj);
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, path) {
	    if (!_.isArray(path)) {
	      return has(obj, path);
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
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  // Creates a function that, when passed an object, will traverse that object’s
	  // properties down the given `path`, specified as an array of keys or indexes.
	  _.property = function(path) {
	    if (!_.isArray(path)) {
	      return shallowProperty(path);
	    }
	    return function(obj) {
	      return deepGet(obj, path);
	    };
	  };

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    if (obj == null) {
	      return function(){};
	    }
	    return function(path) {
	      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) { accum[i] = iteratee(i); }
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	  // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped.
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // Traverses the children of `obj` along `path`. If a child is a function, it
	  // is invoked with its parent as context. Returns the value of the final
	  // child, or `fallback` if any child is undefined.
	  _.result = function(obj, path, fallback) {
	    if (!_.isArray(path)) { path = [path]; }
	    var length = path.length;
	    if (!length) {
	      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
	    }
	    for (var i = 0; i < length; i++) {
	      var prop = obj == null ? void 0 : obj[path[i]];
	      if (prop === void 0) {
	        prop = fallback;
	        i = length; // Ensure we don't continue iterating.
	      }
	      obj = _.isFunction(prop) ? prop.call(obj) : prop;
	    }
	    return obj;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate: /<%([\s\S]+?)%>/g,
	    interpolate: /<%=([\s\S]+?)%>/g,
	    escape: /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'": "'",
	    '\\': '\\',
	    '\r': 'r',
	    '\n': 'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) { settings = oldSettings; }
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offset.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) { source = 'with(obj||{}){\n' + source + '}\n'; }

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    var render;
	    try {
	      render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var chainResult = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return chainResult(this, func.apply(_, args));
	      };
	    });
	    return _;
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) { delete obj[0]; }
	      return chainResult(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return chainResult(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return String(this._wrapped);
	  };
	}());
	});
	var underscore_1 = underscore._;

	/* node_modules/@datawrapper/controls/ColorPicker.html generated by Svelte v2.16.1 */



	var noColor = '#00000000';

	function palette(ref) {
	    var $themeData = ref.$themeData;
	    var prepend = ref.prepend;
	    var append = ref.append;

	    var showDuplicates = get$1($themeData, 'colors.picker.showDuplicates', false);
	    var paletteColors = prepend.concat($themeData.colors.palette).concat(append);
	    return showDuplicates ? paletteColors : underscore.uniq(paletteColors);
	}
	function swatchDims(ref) {
	    var $themeData = ref.$themeData;

	    var rowCount = get$1($themeData, 'colors.picker.rowCount', 6);
	    return (157 - 2 * rowCount) / rowCount;
	}
	function colorAxesConfig(ref) {
	    var $themeData = ref.$themeData;

	    var lightness = get$1($themeData, 'colors.picker.controls.lightness', true);
	    var saturation = get$1($themeData, 'colors.picker.controls.saturation', true);
	    var hue = get$1($themeData, 'colors.picker.controls.hue', true);
	    return { lightness: lightness, saturation: saturation, hue: hue };
	}
	function readonly(ref) {
	    var $themeData = ref.$themeData;

	    var hexEditable = get$1($themeData, 'colors.picker.controls.hexEditable', true);
	    return hexEditable ? '' : 'readonly';
	}
	function validColor(ref) {
	    var color_ = ref.color_;

	    try {
	        return chroma(color_).hex();
	    } catch (e) {
	        return '#000000';
	    }
	}
	function gradient_l(ref) {
	    var color_ = ref.color_;

	    if (!chroma.valid(color_)) { return []; }
	    var lch = chroma(color_).lch();
	    var sample = spread(70, 55, 7, 6).map(function (l) { return chroma.lch(l, lch[1], lch[2]).hex(); });
	    return chroma
	        .scale(['#000000'].concat(sample).concat('#ffffff'))
	        .mode('lch')
	        .gamma(0.8)
	        .padding(0.1)
	        .colors(14);
	}
	function gradient_c(ref) {
	    var color_ = ref.color_;
	    var palette = ref.palette;

	    if (!chroma.valid(color_)) { return []; }
	    var high = chroma(color_).set('lch.c', 120);
	    if (isNaN(high.get('lch.h'))) {
	        high = chroma.lch(high.get('lch.l'), 50, chroma(palette[0] || '#d00').get('lch.h'));
	    }
	    var low = chroma(color_).set('lch.c', 3);
	    return chroma
	        .scale([low, high])
	        .mode('lch')
	        .gamma(1.2)
	        .colors(14);
	}
	function gradient_h(ref) {
	    var color_ = ref.color_;

	    if (!chroma.valid(color_)) { return []; }
	    var lch = chroma(color_).lch();
	    var sample = spread(lch[2], 75, 7, 6).map(function (h) { return chroma.lch(lch[0], lch[1], h).hex(); });
	    return chroma
	        .scale(sample)
	        .mode('lch')
	        .colors(14);
	}
	function nearest_l(ref) {
	    var color_ = ref.color_;
	    var gradient_l = ref.gradient_l;

	    return findNearest(gradient_l, color_);
	}
	function nearest_c(ref) {
	    var color_ = ref.color_;
	    var gradient_c = ref.gradient_c;

	    return findNearest(gradient_c, color_);
	}
	function nearest_h(ref) {
	    var color_ = ref.color_;
	    var gradient_h = ref.gradient_h;

	    return findNearest(gradient_h, color_);
	}
	function textColor(ref) {
	    var color_ = ref.color_;
	    var $themeData = ref.$themeData;

	    var hexEditable = get$1($themeData, 'colors.picker.controls.hexEditable', true);
	    if (!chroma.valid(color_) || color_ === noColor) { return '#000'; }
	    var c = chroma(color_);
	    return c.luminance() > 0.6 || c.alpha() < 0.3 ? ("rgba(0,0,0," + (hexEditable ? 1 : 0.3) + ")") : ("rgba(255,255,255," + (hexEditable ? 1 : 0.6) + ")");
	}
	function data$7() {
	    return {
	        reset: false,
	        initial: false,
	        palette: [],
	        prepend: [],
	        append: [],
	        // the public color
	        color: false,
	        // the internal color
	        color_: noColor,
	        open: false
	    };
	}
	function borderColor(c) {
	    if (!chroma.valid(c)) { return '#ccc'; }
	    return c === noColor
	        ? '#ddd'
	        : chroma(c)
	              .darker()
	              .alpha(1)
	              .hex();
	}
	function borderColor2(c) {
	    if (!chroma.valid(c)) { return '#ccc'; }
	    return chroma(c).hex('rgb') === '#ffffff' ? '#eeeeee' : c;
	}
	function alpha(c) {
	    if (!chroma.valid(c)) { return 0; }
	    return chroma(c).alpha();
	}
	var methods$5 = {
	    setColor: function setColor(color, close) {
	        this.set({ color: color });
	        if (close) {
	            this.refs.dropdown.set({ visible: false });
	        }
	    },
	    resetColor: function resetColor() {
	        var ref = this.get();
	        var initial = ref.initial;
	        this.set({ color_: noColor });
	        this.fire('change', initial);
	        this.setColor(initial, true);
	    }
	};

	function onupdate$2(ref) {
	    var this$1 = this;
	    var changed = ref.changed;
	    var current = ref.current;
	    var previous = ref.previous;

	    if (changed.color_ && previous) {
	        try {
	            var niceHex = chroma(current.color_).hex();
	            this.set({ color: current.color_ });
	            // update external color
	            if (current.open && niceHex !== previous.color_) {
	                this.fire('change', current.validColor);
	            }
	            if (current.validColor !== current.color_) {
	                setTimeout(function () {
	                    this$1.set({ color_: current.validColor });
	                }, 100);
	            }
	        } catch (e) {}
	    }
	    // update internal color if external color changes
	    if (changed.color && current.color !== noColor && !previous) {
	        setTimeout(function () {
	            this$1.set({ color_: current.color || noColor });
	        }, 100);
	    } else if (changed.color && !current.color) {
	        this.set({ color_: noColor });
	    } else if (changed.color && current.color && previous) {
	        if (current.open) {
	            this.fire('change', current.color);
	        }
	        this.set({ color_: current.color });
	    }
	    if (changed.open) {
	        this.fire(current.open ? 'open' : 'close');
	    }
	}
	function findNearest(colors, color) {
	    var nearestIndex = -1;
	    var nearestDistance = 999999;
	    if (colors[0] === colors[1]) { return '-'; }
	    colors.forEach(function (c, i) {
	        var dist = chroma.distance(c, color, 'lab');
	        if (dist < nearestDistance) {
	            nearestDistance = dist;
	            nearestIndex = i;
	        }
	    });
	    return colors[nearestIndex];
	}

	function spread(center, width, num, num2, exp) {
	    var r = [center];
	    var s = width / num;
	    var a = 0;
	    num2 = underscore.isUndefined(num2) ? num : num2;
	    while (num-- > 0) {
	        a += s;
	        r.unshift(center - a);
	        if (num2-- > 0) { r.push(center + a); }
	    }
	    return r;
	}

	var file$8 = "node_modules/datawrapper/controls/ColorPicker.html";

	function click_handler_3(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.setColor(ctx.c, false);
	}

	function get_each_context_3(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.c = list[i];
		return child_ctx;
	}

	function click_handler_2(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.setColor(ctx.c, false);
	}

	function get_each_context_2(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.c = list[i];
		return child_ctx;
	}

	function click_handler_1(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.setColor(ctx.c, false);
	}

	function get_each_context_1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.c = list[i];
		return child_ctx;
	}

	function dblclick_handler(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.setColor(ctx.c, true);
	}

	function click_handler(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.setColor(ctx.c, false);
	}

	function get_each_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.c = list[i];
		return child_ctx;
	}

	function create_main_fragment$8(component, ctx) {
		var div3, span1, slot_content_default = component._slotted.default, div2, div1, div0, text0, span0, text1, span2, basedropdown_updating = {};

		var if_block = (ctx.color_) && create_if_block$6(component, ctx);

		var basedropdown_initial_data = {};
		if (ctx.open !== void 0) {
			basedropdown_initial_data.visible = ctx.open;
			basedropdown_updating.visible = true;
		}
		var basedropdown = new BaseDropdown({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), content: createFragment(), button: createFragment() },
			data: basedropdown_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!basedropdown_updating.visible && changed.visible) {
					newState.open = childState.visible;
				}
				component._set(newState);
				basedropdown_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			basedropdown._bind({ visible: 1 }, basedropdown.get());
		});

		component.refs.dropdown = basedropdown;

		return {
			c: function create() {
				div3 = createElement("div");
				span1 = createElement("span");
				if (!slot_content_default) {
					div2 = createElement("div");
					div1 = createElement("div");
					div0 = createElement("div");
					text0 = createText("\n                    ");
					span0 = createElement("span");
				}
				text1 = createText("\n        ");
				span2 = createElement("span");
				if (if_block) { if_block.c(); }
				basedropdown._fragment.c();
				if (!slot_content_default) {
					div0.className = "transparency svelte-1p59mnc";
					setStyle(div0, "opacity", (1-alpha(ctx.validColor)));
					addLoc(div0, file$8, 6, 24, 320);
					setStyle(div1, "background", "" + ctx.validColor + " none repeat scroll 0% 0%");
					div1.className = "the-color svelte-1p59mnc";
					addLoc(div1, file$8, 5, 20, 213);
					span0.className = "caret svelte-1p59mnc";
					addLoc(span0, file$8, 8, 20, 439);
					div2.className = "base-color-picker color-picker svelte-1p59mnc";
					addLoc(div2, file$8, 4, 16, 148);
				}
				setAttribute(span1, "slot", "button");
				addLoc(span1, file$8, 2, 8, 92);
				setAttribute(span2, "slot", "content");
				addLoc(span2, file$8, 12, 8, 534);
				div3.className = "color-picker-cont svelte-1p59mnc";
				addLoc(div3, file$8, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(basedropdown._slotted.button, span1);
				if (!slot_content_default) {
					append(span1, div2);
					append(div2, div1);
					append(div1, div0);
					append(div2, text0);
					append(div2, span0);
				}

				else {
					append(span1, slot_content_default);
				}

				append(basedropdown._slotted.default, text1);
				append(basedropdown._slotted.content, span2);
				if (if_block) { if_block.m(span2, null); }
				basedropdown._mount(div3, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!slot_content_default) {
					if (changed.validColor) {
						setStyle(div0, "opacity", (1-alpha(ctx.validColor)));
						setStyle(div1, "background", "" + ctx.validColor + " none repeat scroll 0% 0%");
				}

				}

				if (ctx.color_) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$6(component, ctx);
						if_block.c();
						if_block.m(span2, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				var basedropdown_changes = {};
				if (!basedropdown_updating.visible && changed.open) {
					basedropdown_changes.visible = ctx.open;
					basedropdown_updating.visible = ctx.open !== void 0;
				}
				basedropdown._set(basedropdown_changes);
				basedropdown_updating = {};
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div3);
				}

				if (slot_content_default) {
					reinsertChildren(span1, slot_content_default);
				}

				if (if_block) { if_block.d(); }
				basedropdown.destroy();
				if (component.refs.dropdown === basedropdown) { component.refs.dropdown = null; }
			}
		};
	}

	// (14:12) {#if color_}
	function create_if_block$6(component, ctx) {
		var div4, div0, text0, text1, text2, text3, text4, div3, input, input_updating = false, input_class_value, text5, button, i, text6, div2, div1;

		var each_value = ctx.palette;

		var each_blocks = [];

		for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
			each_blocks[i_1] = create_each_block_3(component, get_each_context(ctx, each_value, i_1));
		}

		var if_block0 = (ctx.colorAxesConfig.lightness) && create_if_block_4(component, ctx);

		var if_block1 = (ctx.colorAxesConfig.saturation) && create_if_block_3(component, ctx);

		var if_block2 = (ctx.colorAxesConfig.hue) && create_if_block_2(component, ctx);

		var if_block3 = (ctx.reset) && create_if_block_1$4(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ color_: input.value });
			input_updating = false;
		}

		function click_handler_4(event) {
			component.setColor(ctx.color_, true);
		}

		function click_handler_5(event) {
			event.stopPropagation();
		}

		return {
			c: function create() {
				div4 = createElement("div");
				div0 = createElement("div");

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].c();
				}

				text0 = createText("\n                ");
				if (if_block0) { if_block0.c(); }
				text1 = createText(" ");
				if (if_block1) { if_block1.c(); }
				text2 = createText(" ");
				if (if_block2) { if_block2.c(); }
				text3 = createText(" ");
				if (if_block3) { if_block3.c(); }
				text4 = createText("\n                ");
				div3 = createElement("div");
				input = createElement("input");
				text5 = createText("\n                    ");
				button = createElement("button");
				i = createElement("i");
				text6 = createText("\n                    ");
				div2 = createElement("div");
				div1 = createElement("div");
				div0.className = "palette svelte-1p59mnc";
				addLoc(div0, file$8, 15, 16, 673);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				setStyle(input, "background", ctx.color_);
				setStyle(input, "border-color", borderColor(ctx.color_));
				setStyle(input, "color", ctx.textColor);
				input.className = input_class_value = "hex " + ctx.readonly + " svelte-1p59mnc";
				input.readOnly = ctx.readonly;
				addLoc(input, file$8, 54, 20, 2713);
				i.className = "icon-ok";
				addLoc(i, file$8, 62, 24, 3127);
				addListener(button, "click", click_handler_4);
				button.className = "btn btn-small ok svelte-1p59mnc";
				addLoc(button, file$8, 61, 20, 3035);
				div1.className = "transparency svelte-1p59mnc";
				setStyle(div1, "opacity", (1-alpha(ctx.color_)));
				addLoc(div1, file$8, 65, 24, 3320);
				div2.className = "color selected svelte-1p59mnc";
				setStyle(div2, "border-color", borderColor(ctx.color_));
				setStyle(div2, "background", ctx.color_);
				addLoc(div2, file$8, 64, 20, 3201);
				div3.className = "footer svelte-1p59mnc";
				addLoc(div3, file$8, 53, 16, 2672);
				addListener(div4, "click", click_handler_5);
				div4.className = "color-selector svelte-1p59mnc";
				addLoc(div4, file$8, 14, 12, 593);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div0);

				for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].m(div0, null);
				}

				append(div4, text0);
				if (if_block0) { if_block0.m(div4, null); }
				append(div4, text1);
				if (if_block1) { if_block1.m(div4, null); }
				append(div4, text2);
				if (if_block2) { if_block2.m(div4, null); }
				append(div4, text3);
				if (if_block3) { if_block3.m(div4, null); }
				append(div4, text4);
				append(div4, div3);
				append(div3, input);

				input.value = ctx.color_;

				append(div3, text5);
				append(div3, button);
				append(button, i);
				append(div3, text6);
				append(div3, div2);
				append(div2, div1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.palette || changed.swatchDims || changed.color_) {
					each_value = ctx.palette;

					for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
						var child_ctx = get_each_context(ctx, each_value, i_1);

						if (each_blocks[i_1]) {
							each_blocks[i_1].p(changed, child_ctx);
						} else {
							each_blocks[i_1] = create_each_block_3(component, child_ctx);
							each_blocks[i_1].c();
							each_blocks[i_1].m(div0, null);
						}
					}

					for (; i_1 < each_blocks.length; i_1 += 1) {
						each_blocks[i_1].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (ctx.colorAxesConfig.lightness) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_4(component, ctx);
						if_block0.c();
						if_block0.m(div4, text1);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.colorAxesConfig.saturation) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_3(component, ctx);
						if_block1.c();
						if_block1.m(div4, text2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.colorAxesConfig.hue) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_2(component, ctx);
						if_block2.c();
						if_block2.m(div4, text3);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (ctx.reset) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block_1$4(component, ctx);
						if_block3.c();
						if_block3.m(div4, text4);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (!input_updating && changed.color_) { input.value = ctx.color_; }
				if (changed.color_) {
					setStyle(input, "background", ctx.color_);
					setStyle(input, "border-color", borderColor(ctx.color_));
				}

				if (changed.textColor) {
					setStyle(input, "color", ctx.textColor);
				}

				if ((changed.readonly) && input_class_value !== (input_class_value = "hex " + ctx.readonly + " svelte-1p59mnc")) {
					input.className = input_class_value;
				}

				if (changed.readonly) {
					input.readOnly = ctx.readonly;
				}

				if (changed.color_) {
					setStyle(div1, "opacity", (1-alpha(ctx.color_)));
					setStyle(div2, "border-color", borderColor(ctx.color_));
					setStyle(div2, "background", ctx.color_);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div4);
				}

				destroyEach(each_blocks, detach);

				if (if_block0) { if_block0.d(); }
				if (if_block1) { if_block1.d(); }
				if (if_block2) { if_block2.d(); }
				if (if_block3) { if_block3.d(); }
				removeListener(input, "input", input_input_handler);
				removeListener(button, "click", click_handler_4);
				removeListener(div4, "click", click_handler_5);
			}
		};
	}

	// (17:20) {#each palette as c}
	function create_each_block_3(component, ctx) {
		var div1, div0, div1_data_color_value;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "transparency svelte-1p59mnc";
				setStyle(div0, "opacity", (1-alpha(ctx.c)));
				addLoc(div0, file$8, 28, 24, 1302);

				div1._svelte = { component: component, ctx: ctx };

				addListener(div1, "click", click_handler);
				addListener(div1, "dblclick", dblclick_handler);
				div1.className = "color svelte-1p59mnc";
				div1.dataset.color = div1_data_color_value = ctx.c;
				setStyle(div1, "background", ctx.c);
				setStyle(div1, "border-color", borderColor2(ctx.c));
				setStyle(div1, "width", "" + ctx.swatchDims + "px");
				setStyle(div1, "height", "" + ctx.swatchDims + "px");
				toggleClass(div1, "selected", ctx.c === ctx.color_);
				addLoc(div1, file$8, 17, 20, 756);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.palette) {
					setStyle(div0, "opacity", (1-alpha(ctx.c)));
				}

				div1._svelte.ctx = ctx;
				if ((changed.palette) && div1_data_color_value !== (div1_data_color_value = ctx.c)) {
					div1.dataset.color = div1_data_color_value;
				}

				if (changed.palette) {
					setStyle(div1, "background", ctx.c);
					setStyle(div1, "border-color", borderColor2(ctx.c));
				}

				if (changed.swatchDims) {
					setStyle(div1, "width", "" + ctx.swatchDims + "px");
					setStyle(div1, "height", "" + ctx.swatchDims + "px");
				}

				if ((changed.palette || changed.color_)) {
					toggleClass(div1, "selected", ctx.c === ctx.color_);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(div1, "click", click_handler);
				removeListener(div1, "dblclick", dblclick_handler);
			}
		};
	}

	// (33:16) {#if colorAxesConfig.lightness }
	function create_if_block_4(component, ctx) {
		var div;

		var each_value_1 = ctx.gradient_l;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "color-axis lightness svelte-1p59mnc";
				addLoc(div, file$8, 33, 16, 1508);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.gradient_l || changed.nearest_l) {
					each_value_1 = ctx.gradient_l;

					for (var i = 0; i < each_value_1.length; i += 1) {
						var child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (35:20) {#each gradient_l as c}
	function create_each_block_2(component, ctx) {
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				div._svelte = { component: component, ctx: ctx };

				addListener(div, "click", click_handler_1);
				div.className = div_class_value = "color " + (ctx.c == ctx.nearest_l?'selected':'') + " svelte-1p59mnc";
				div.dataset.color = div_data_color_value = ctx.c;
				setStyle(div, "background", ctx.c);
				addLoc(div, file$8, 35, 20, 1607);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				div._svelte.ctx = ctx;
				if ((changed.gradient_l || changed.nearest_l) && div_class_value !== (div_class_value = "color " + (ctx.c == ctx.nearest_l?'selected':'') + " svelte-1p59mnc")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_l) && div_data_color_value !== (div_data_color_value = ctx.c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_l) {
					setStyle(div, "background", ctx.c);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(div, "click", click_handler_1);
			}
		};
	}

	// (39:22) {#if colorAxesConfig.saturation }
	function create_if_block_3(component, ctx) {
		var div;

		var each_value_2 = ctx.gradient_c;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "color-axis saturation svelte-1p59mnc";
				addLoc(div, file$8, 39, 16, 1858);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.gradient_c || changed.nearest_c) {
					each_value_2 = ctx.gradient_c;

					for (var i = 0; i < each_value_2.length; i += 1) {
						var child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_2.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (41:20) {#each gradient_c as c}
	function create_each_block_1(component, ctx) {
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				div._svelte = { component: component, ctx: ctx };

				addListener(div, "click", click_handler_2);
				div.className = div_class_value = "color " + (ctx.c == ctx.nearest_c?'selected':'') + " svelte-1p59mnc";
				div.dataset.color = div_data_color_value = ctx.c;
				setStyle(div, "background", ctx.c);
				addLoc(div, file$8, 41, 20, 1958);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				div._svelte.ctx = ctx;
				if ((changed.gradient_c || changed.nearest_c) && div_class_value !== (div_class_value = "color " + (ctx.c == ctx.nearest_c?'selected':'') + " svelte-1p59mnc")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_c) && div_data_color_value !== (div_data_color_value = ctx.c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_c) {
					setStyle(div, "background", ctx.c);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(div, "click", click_handler_2);
			}
		};
	}

	// (45:22) {#if colorAxesConfig.hue }
	function create_if_block_2(component, ctx) {
		var div;

		var each_value_3 = ctx.gradient_h;

		var each_blocks = [];

		for (var i = 0; i < each_value_3.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context_3(ctx, each_value_3, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "color-axis hue svelte-1p59mnc";
				addLoc(div, file$8, 45, 16, 2202);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.gradient_h || changed.nearest_h) {
					each_value_3 = ctx.gradient_h;

					for (var i = 0; i < each_value_3.length; i += 1) {
						var child_ctx = get_each_context_3(ctx, each_value_3, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_3.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (47:20) {#each gradient_h as c}
	function create_each_block(component, ctx) {
		var div, div_class_value, div_data_color_value;

		return {
			c: function create() {
				div = createElement("div");
				div._svelte = { component: component, ctx: ctx };

				addListener(div, "click", click_handler_3);
				div.className = div_class_value = "color " + (ctx.c == ctx.nearest_h?'selected':'') + " svelte-1p59mnc";
				div.dataset.color = div_data_color_value = ctx.c;
				setStyle(div, "background", ctx.c);
				addLoc(div, file$8, 47, 20, 2295);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				div._svelte.ctx = ctx;
				if ((changed.gradient_h || changed.nearest_h) && div_class_value !== (div_class_value = "color " + (ctx.c == ctx.nearest_h?'selected':'') + " svelte-1p59mnc")) {
					div.className = div_class_value;
				}

				if ((changed.gradient_h) && div_data_color_value !== (div_data_color_value = ctx.c)) {
					div.dataset.color = div_data_color_value;
				}

				if (changed.gradient_h) {
					setStyle(div, "background", ctx.c);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(div, "click", click_handler_3);
			}
		};
	}

	// (51:22) {#if reset}
	function create_if_block_1$4(component, ctx) {
		var button, i, text, raw_before;

		function click_handler_4(event) {
			component.resetColor();
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text = createText(" ");
				raw_before = createElement('noscript');
				i.className = "im im-drop svelte-1p59mnc";
				addLoc(i, file$8, 51, 76, 2584);
				addListener(button, "click", click_handler_4);
				button.className = "btn btn-small reset svelte-1p59mnc";
				addLoc(button, file$8, 51, 16, 2524);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.reset);
			},

			p: function update(changed, ctx) {
				if (changed.reset) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.reset);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler_4);
			}
		};
	}

	function ColorPicker(options) {
		var this$1 = this;

		this._debugName = '<ColorPicker>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ColorPicker> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["themeData"]), data$7()), options.data);
		this.store._add(this, ["themeData"]);

		this._recompute({ $themeData: 1, prepend: 1, append: 1, color_: 1, palette: 1, gradient_l: 1, gradient_c: 1, gradient_h: 1 }, this._state);
		if (!('$themeData' in this._state)) { console.warn("<ColorPicker> was created without expected data property '$themeData'"); }
		if (!('prepend' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'prepend'"); }
		if (!('append' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'append'"); }
		if (!('color_' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'color_'"); }




		if (!('open' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'open'"); }






		if (!('reset' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'reset'"); }
		this._intro = true;
		this._handlers.update = [onupdate$2];

		this._handlers.destroy = [removeFromStore];

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$8(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ColorPicker.prototype, protoDev);
	assign(ColorPicker.prototype, methods$5);

	ColorPicker.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('palette' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'palette'"); }
		if ('swatchDims' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'swatchDims'"); }
		if ('colorAxesConfig' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'colorAxesConfig'"); }
		if ('readonly' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'readonly'"); }
		if ('validColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'validColor'"); }
		if ('gradient_l' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_l'"); }
		if ('gradient_c' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_c'"); }
		if ('gradient_h' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_h'"); }
		if ('nearest_l' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_l'"); }
		if ('nearest_c' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_c'"); }
		if ('nearest_h' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_h'"); }
		if ('textColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'textColor'"); }
	};

	ColorPicker.prototype._recompute = function _recompute(changed, state) {
		if (changed.$themeData || changed.prepend || changed.append) {
			if (this._differs(state.palette, (state.palette = palette(state)))) { changed.palette = true; }
		}

		if (changed.$themeData) {
			if (this._differs(state.swatchDims, (state.swatchDims = swatchDims(state)))) { changed.swatchDims = true; }
			if (this._differs(state.colorAxesConfig, (state.colorAxesConfig = colorAxesConfig(state)))) { changed.colorAxesConfig = true; }
			if (this._differs(state.readonly, (state.readonly = readonly(state)))) { changed.readonly = true; }
		}

		if (changed.color_) {
			if (this._differs(state.validColor, (state.validColor = validColor(state)))) { changed.validColor = true; }
			if (this._differs(state.gradient_l, (state.gradient_l = gradient_l(state)))) { changed.gradient_l = true; }
		}

		if (changed.color_ || changed.palette) {
			if (this._differs(state.gradient_c, (state.gradient_c = gradient_c(state)))) { changed.gradient_c = true; }
		}

		if (changed.color_) {
			if (this._differs(state.gradient_h, (state.gradient_h = gradient_h(state)))) { changed.gradient_h = true; }
		}

		if (changed.color_ || changed.gradient_l) {
			if (this._differs(state.nearest_l, (state.nearest_l = nearest_l(state)))) { changed.nearest_l = true; }
		}

		if (changed.color_ || changed.gradient_c) {
			if (this._differs(state.nearest_c, (state.nearest_c = nearest_c(state)))) { changed.nearest_c = true; }
		}

		if (changed.color_ || changed.gradient_h) {
			if (this._differs(state.nearest_h, (state.nearest_h = nearest_h(state)))) { changed.nearest_h = true; }
		}

		if (changed.color_ || changed.$themeData) {
			if (this._differs(state.textColor, (state.textColor = textColor(state)))) { changed.textColor = true; }
		}
	};

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

	function data$8() {
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

	var file$9 = "node_modules/datawrapper/controls/ControlGroup.html";

	function create_main_fragment$9(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, slot_content_default_after, text1, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_1$5(component, ctx);

		var if_block1 = (ctx.help) && create_if_block$7(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n    ");
				div0 = createElement("div");
				text1 = createText("\n        ");
				if (if_block1) { if_block1.c(); }
				div0.className = "controls svelte-xyokw0";
				setStyle(div0, "width", "calc(100% - " + (ctx.width||def.width) + " - 40px)");
				toggleClass(div0, "form-inline", ctx.inline);
				addLoc(div0, file$9, 4, 4, 219);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-xyokw0";
				addLoc(div1, file$9, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				if (if_block0) { if_block0.m(div1, null); }
				append(div1, text0);
				append(div1, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
					append(div0, slot_content_default_after || (slot_content_default_after = createComment()));
				}

				append(div0, text1);
				if (if_block1) { if_block1.m(div0, null); }
			},

			p: function update(changed, ctx) {
				if (ctx.label) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$5(component, ctx);
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
						if_block1 = create_if_block$7(component, ctx);
						if_block1.c();
						if_block1.m(div0, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.width) {
					setStyle(div0, "width", "calc(100% - " + (ctx.width||def.width) + " - 40px)");
				}

				if (changed.inline) {
					toggleClass(div0, "form-inline", ctx.inline);
				}

				if ((changed.type || changed.valign) && div1_class_value !== (div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-xyokw0")) {
					div1.className = div1_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block0) { if_block0.d(); }

				if (slot_content_default) {
					reinsertBefore(slot_content_default_after, slot_content_default);
				}

				if (if_block1) { if_block1.d(); }
			}
		};
	}

	// (2:4) {#if label}
	function create_if_block_1$5(component, ctx) {
		var label;

		return {
			c: function create() {
				label = createElement("label");
				setStyle(label, "width", (ctx.width||def.width));
				label.className = "control-label svelte-xyokw0";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$9, 2, 4, 104);
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
					setStyle(label, "width", (ctx.width||def.width));
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
	}

	// (7:8) {#if help}
	function create_if_block$7(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				p.className = p_class_value = "mini-help " + ctx.type + " svelte-xyokw0";
				addLoc(p, file$9, 7, 8, 368);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.help;
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					p.innerHTML = ctx.help;
				}

				if ((changed.type) && p_class_value !== (p_class_value = "mini-help " + ctx.type + " svelte-xyokw0")) {
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
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$8(), options.data);
		if (!('type' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'type'"); }
		if (!('valign' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'valign'"); }
		if (!('label' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'label'"); }
		if (!('width' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'width'"); }
		if (!('inline' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'inline'"); }
		if (!('help' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'help'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$9(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
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
	    if (input === null) { return null; }
	    if (input === undefined) { return undefined; }
	    input = String(input);
	    // strip tags
	    if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
	        return input;
	    }
	    input = stripTags(input, allowed);
	    // remove all event attributes
	    if (typeof document === 'undefined') { return input; }
	    var d = document.createElement('div');
	    d.innerHTML = input;
	    var sel = d.querySelectorAll('*');
	    for (var i = 0; i < sel.length; i++) {
	        if (sel[i].nodeName.toLowerCase() === 'a') {
	            // special treatment for <a> elements
	            if (sel[i].getAttribute('target') !== '_self') { sel[i].setAttribute('target', '_blank'); }
	            sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
	        }
	        for (var j = 0; j < sel[i].attributes.length; j++) {
	            var attrib = sel[i].attributes[j];
	            if (attrib.specified) {
	                if (attrib.name.substr(0, 2) === 'on') { sel[i].removeAttribute(attrib.name); }
	            }
	        }
	    }
	    return d.innerHTML;
	}

	function stripTags(input, allowed) {
	    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	    allowed = (
	        ((allowed !== undefined ? allowed || '' : defaultAllowed) + '')
	            .toLowerCase()
	            .match(/<[a-z][a-z0-9]*>/g) || []
	    ).join('');

	    var before = input;
	    var after = input;
	    // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
	    while (true) {
	        before = after;
	        after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function($0, $1) {
	            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	        });
	        // return once no more tags are removed
	        if (before === after) {
	            return after;
	        }
	    }
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
	    if (!o || typeof o !== 'object') { return o; }
	    try {
	        return JSON.parse(JSON.stringify(o));
	    } catch (e) {
	        return o;
	    }
	}

	/* node_modules/@datawrapper/controls/Color.html generated by Svelte v2.16.1 */



	function colorKeys(ref) {
	    var $vis = ref.$vis;
	    var keys = ref.keys;
	    var customizable = ref.customizable;
	    var axis = ref.axis;
	    var custom = ref.custom;
	    var palette = ref.palette;

	    if (!$vis || !customizable) { return []; }
	    return (axis
	        ? underscore.uniq(
	              $vis.axes(true)[axis].type() === 'date'
	                  ? $vis.axes(true)[axis].raw() // raw values for date cols
	                  : $vis.axes(true)[axis].values() // fmt values else
	          )
	        : keys && keys.length
	        ? keys
	        : $vis.colorKeys
	        ? $vis.colorKeys()
	        : $vis.keys()
	    ).map(function (k) {
	        k = stripTags$1(k);
	        return {
	            key: k,
	            defined: custom[k] !== undefined && custom[k] !== false,
	            color: custom[k] !== undefined && custom[k] !== false ? getColor(custom[k], palette) : '#cccccc'
	        };
	    });
	}
	function palette_1(ref) {
	    var $themeData = ref.$themeData;

	    return $themeData.colors.palette;
	}
	function hexColor(ref) {
	    var value = ref.value;
	    var palette = ref.palette;

	    return getColor(value, palette);
	}
	function customColor(ref) {
	    var selected = ref.selected;
	    var palette = ref.palette;
	    var custom = ref.custom;

	    if (custom[selected[0]] === undefined) { return null; } // return null to reset the current color
	    var realColors = selected.filter(function (s) { return custom[s] !== undefined; }).map(function (s) { return getColor(custom[s], palette); });
	    if (!realColors.length) { return null; } // return null to reset the current color
	    return chroma.average(realColors, 'lab'); // return a color value to set the current color
	}
	function data$9() {
	    return {
	        width: '100px',
	        open: false,
	        openCustom: false,
	        customizable: false,
	        expanded: false,
	        keys: false,
	        compact: false,
	        axis: false,
	        selected: [],
	        custom: {}
	    };
	}
	var methods$6 = {
	    update: function update(color) {
	        var ref = this.get();
	        var palette = ref.palette;
	        this.set({ value: storeColor(color, palette) });
	    },
	    updateCustom: function updateCustom(color) {
	        var ref = this.get();
	        var selected = ref.selected;
	        var palette = ref.palette;
	        var custom = ref.custom;
	        var custom2 = clone(custom);
	        selected.forEach(function (k) {
	            if (color) {
	                custom2[k] = storeColor(color, palette);
	            } else {
	                delete custom2[k];
	            }
	        });
	        this.set({ custom: custom2 });
	    },
	    toggle: function toggle(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var expanded = ref.expanded;
	        this.set({ expanded: !expanded });
	    },
	    toggleSelect: function toggleSelect(k, event) {
	        event.preventDefault();
	        var ref = this.get();
	        var selected = ref.selected;
	        var i = selected.indexOf(k);
	        if (event.shiftKey) {
	            if (i > -1) { selected.splice(i, 1); }
	            else { selected.push(k); }
	        } else {
	            selected.length = 1;
	            selected[0] = k;
	        }
	        this.set({ selected: selected });
	    },
	    getColor: function getColor$1(color) {
	        var ref = this.get();
	        var palette = ref.palette;
	        return getColor(color, palette);
	    },
	    reset: function reset() {
	        var ref = this.get();
	        var selected = ref.selected;
	        var custom = ref.custom;
	        var custom2 = clone(custom);
	        selected.forEach(function (k) { return delete custom2[k]; });
	        this.set({ custom: custom2 });
	    },
	    resetAll: function resetAll() {
	        this.set({ custom: {} });
	    },
	    selectAll: function selectAll(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var selected = ref.selected;
	        var colorKeys = ref.colorKeys;
	        colorKeys.forEach(function (k) {
	            if (selected.indexOf(k.key) < 0) { selected.push(k.key); }
	        });
	        this.set({ selected: selected });
	    },
	    selectNone: function selectNone(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var selected = ref.selected;
	        selected.length = 0;
	        this.set({ selected: selected });
	    },
	    selectInvert: function selectInvert(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var selected = ref.selected;
	        var colorKeys = ref.colorKeys;
	        colorKeys.forEach(function (k) {
	            var i = selected.indexOf(k.key);
	            if (i < 0) { selected.push(k.key); }
	            else { selected.splice(i, 1); }
	        });
	        this.set({ selected: selected });
	    }
	};

	function onupdate$3(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.custom && current.custom) {
	        var c = current.custom;
	        if (c && c.length === 0) {
	            c = {};
	        }
	        this.set({ custom: c });
	    }
	}
	function storeColor(color, palette) {
	    if (typeof color === 'object' && typeof color.hex === 'function') {
	        // color is a chroma.js instance
	        color = color.hex();
	    }
	    var pi = palette.indexOf(color);
	    if (pi > -1) { return pi; }
	    return color;
	}

	function getColor(color, palette) {
	    return typeof color === 'number' ? palette[color % palette.length] : color;
	}

	function stripTags$1(s) {
	    return purifyHTML(s, '');
	}

	var file$a = "node_modules/datawrapper/controls/Color.html";

	function click_handler$1(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.toggleSelect(ctx.k.key, event);
	}

	function get_each_context$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.k = list[i];
		return child_ctx;
	}

	function create_main_fragment$a(component, ctx) {
		var text0, if_block1_anchor, text1, if_block2_anchor;

		var if_block0 = (ctx.hexColor) && create_if_block_6(component, ctx);

		var if_block1 = (ctx.customizable) && create_if_block_5(component, ctx);

		var controlgroup_initial_data = { label: ctx.label, width: ctx.width||'100px' };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block2 = (ctx.customizable && ctx.expanded) && create_if_block$8(component, ctx);

		return {
			c: function create() {
				if (if_block0) { if_block0.c(); }
				text0 = createText(" ");
				if (if_block1) { if_block1.c(); }
				if_block1_anchor = createComment();
				controlgroup._fragment.c();
				text1 = createText("\n\n");
				if (if_block2) { if_block2.c(); }
				if_block2_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) { if_block0.m(controlgroup._slotted.default, null); }
				append(controlgroup._slotted.default, text0);
				if (if_block1) { if_block1.m(controlgroup._slotted.default, null); }
				append(controlgroup._slotted.default, if_block1_anchor);
				controlgroup._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block2) { if_block2.m(target, anchor); }
				insert(target, if_block2_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.hexColor) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_6(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.customizable) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_5(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				var controlgroup_changes = {};
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.width) { controlgroup_changes.width = ctx.width||'100px'; }
				controlgroup._set(controlgroup_changes);

				if (ctx.customizable && ctx.expanded) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$8(component, ctx);
						if_block2.c();
						if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},

			d: function destroy(detach) {
				if (if_block0) { if_block0.d(); }
				if (if_block1) { if_block1.d(); }
				controlgroup.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				if (if_block2) { if_block2.d(detach); }
				if (detach) {
					detachNode(if_block2_anchor);
				}
			}
		};
	}

	// (2:4) {#if hexColor}
	function create_if_block_6(component, ctx) {
		var colorpicker_updating = {};

		var colorpicker_initial_data = { color: ctx.hexColor, palette: ctx.palette };
		if (ctx.open !== void 0) {
			colorpicker_initial_data.visible = ctx.open;
			colorpicker_updating.visible = true;
		}
		var colorpicker = new ColorPicker({
			root: component.root,
			store: component.store,
			data: colorpicker_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!colorpicker_updating.visible && changed.visible) {
					newState.open = childState.visible;
				}
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
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

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var colorpicker_changes = {};
				if (changed.hexColor) { colorpicker_changes.color = ctx.hexColor; }
				if (changed.palette) { colorpicker_changes.palette = ctx.palette; }
				if (!colorpicker_updating.visible && changed.open) {
					colorpicker_changes.visible = ctx.open;
					colorpicker_updating.visible = ctx.open !== void 0;
				}
				colorpicker._set(colorpicker_changes);
				colorpicker_updating = {};
			},

			d: function destroy(detach) {
				colorpicker.destroy(detach);
			}
		};
	}

	// (4:10) {#if customizable}
	function create_if_block_5(component, ctx) {
		var span, a, text_value = __('controls / color / customize-colors', 'core'), text, a_class_value;

		function click_handler(event) {
			component.toggle(event);
		}

		return {
			c: function create() {
				span = createElement("span");
				a = createElement("a");
				text = createText(text_value);
				addListener(a, "click", click_handler);
				a.href = "#customize";
				a.className = a_class_value = "btn btn-small custom " + (ctx.expanded?'btn-primary':'');
				setAttribute(a, "role", "button");
				addLoc(a, file$a, 5, 8, 263);
				span.className = "custom-color-selector-head";
				addLoc(span, file$a, 4, 4, 213);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, a);
				append(a, text);
			},

			p: function update(changed, ctx) {
				if ((changed.expanded) && a_class_value !== (a_class_value = "btn btn-small custom " + (ctx.expanded?'btn-primary':''))) {
					a.className = a_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	// (13:0) {#if customizable && expanded}
	function create_if_block$8(component, ctx) {
		var div4, div3, div1, text0, ul, text1, div0, text2, a0, text4, a1, text6, a2, text8, div2, text9, text10, button, text11_value = __(ctx.compact ? 'controls / color / reset-all' : 'controls / color / reset-all-colors', 'core'), text11;

		var if_block0 = (!ctx.compact) && create_if_block_4$1();

		var each_value = ctx.colorKeys;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
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

		var if_block1 = (!ctx.compact) && create_if_block_3$1();

		function select_block_type(ctx) {
			if (ctx.selected.length) { return create_if_block_1$6; }
			return create_else_block$1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block2 = current_block_type(component, ctx);

		function click_handler_4(event) {
			component.resetAll();
		}

		return {
			c: function create() {
				div4 = createElement("div");
				div3 = createElement("div");
				div1 = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n            ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text1 = createText("\n            ");
				div0 = createElement("div");
				text2 = createText("Select:  \n                ");
				a0 = createElement("a");
				a0.textContent = "all";
				text4 = createText("   ");
				a1 = createElement("a");
				a1.textContent = "none";
				text6 = createText("  \n                ");
				a2 = createElement("a");
				a2.textContent = "invert";
				text8 = createText("\n        ");
				div2 = createElement("div");
				if (if_block1) { if_block1.c(); }
				text9 = createText(" ");
				if_block2.c();
				text10 = createText("\n            ");
				button = createElement("button");
				text11 = createText(text11_value);
				ul.className = "dataseries unstyled svelte-1efltvt";
				addLoc(ul, file$a, 19, 12, 790);
				addListener(a0, "click", click_handler_1);
				a0.href = "#/select-all";
				addLoc(a0, file$a, 29, 16, 1327);
				addListener(a1, "click", click_handler_2);
				a1.href = "#/select-none";
				addLoc(a1, file$a, 29, 82, 1393);
				addListener(a2, "click", click_handler_3);
				a2.href = "#/select-invert";
				addLoc(a2, file$a, 30, 16, 1478);
				setStyle(div0, "font-size", "12px");
				setStyle(div0, "text-align", "left");
				setStyle(div0, "margin-bottom", "10px");
				addLoc(div0, file$a, 27, 12, 1215);
				div1.className = "span2";
				setStyle(div1, "width", "43%");
				addLoc(div1, file$a, 15, 8, 623);
				addListener(button, "click", click_handler_4);
				button.className = "btn";
				addLoc(button, file$a, 53, 12, 2436);
				div2.className = "span2";
				setStyle(div2, "width", (ctx.compact ? '35%' : '42%'));
				addLoc(div2, file$a, 33, 8, 1588);
				div3.className = "row";
				addLoc(div3, file$a, 14, 4, 597);
				div4.className = "custom-color-selector-body svelte-1efltvt";
				setStyle(div4, "display", "block");
				addLoc(div4, file$a, 13, 0, 528);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div3);
				append(div3, div1);
				if (if_block0) { if_block0.m(div1, null); }
				append(div1, text0);
				append(div1, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				append(div1, text1);
				append(div1, div0);
				append(div0, text2);
				append(div0, a0);
				append(div0, text4);
				append(div0, a1);
				append(div0, text6);
				append(div0, a2);
				append(div3, text8);
				append(div3, div2);
				if (if_block1) { if_block1.m(div2, null); }
				append(div2, text9);
				if_block2.m(div2, null);
				append(div2, text10);
				append(div2, button);
				append(button, text11);
			},

			p: function update(changed, ctx) {
				if (!ctx.compact) {
					if (!if_block0) {
						if_block0 = create_if_block_4$1();
						if_block0.c();
						if_block0.m(div1, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.selected || changed.colorKeys) {
					each_value = ctx.colorKeys;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (!ctx.compact) {
					if (!if_block1) {
						if_block1 = create_if_block_3$1();
						if_block1.c();
						if_block1.m(div2, text9);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type(component, ctx);
					if_block2.c();
					if_block2.m(div2, text10);
				}

				if ((changed.compact) && text11_value !== (text11_value = __(ctx.compact ? 'controls / color / reset-all' : 'controls / color / reset-all-colors', 'core'))) {
					setData(text11, text11_value);
				}

				if (changed.compact) {
					setStyle(div2, "width", (ctx.compact ? '35%' : '42%'));
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div4);
				}

				if (if_block0) { if_block0.d(); }

				destroyEach(each_blocks, detach);

				removeListener(a0, "click", click_handler_1);
				removeListener(a1, "click", click_handler_2);
				removeListener(a2, "click", click_handler_3);
				if (if_block1) { if_block1.d(); }
				if_block2.d();
				removeListener(button, "click", click_handler_4);
			}
		};
	}

	// (17:12) {#if !compact}
	function create_if_block_4$1(component, ctx) {
		var h4, text_value = __('controls / color / select-elements', 'core'), text;

		return {
			c: function create() {
				h4 = createElement("h4");
				text = createText(text_value);
				h4.className = "svelte-1efltvt";
				addLoc(h4, file$a, 17, 12, 700);
			},

			m: function mount(target, anchor) {
				insert(target, h4, anchor);
				append(h4, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h4);
				}
			}
		};
	}

	// (21:16) {#each colorKeys as k}
	function create_each_block$1(component, ctx) {
		var li, div, text0_value = !ctx.k.defined ? '×' : '', text0, text1, label, text2_value = ctx.k.key, text2, li_class_value, li_data_series_value;

		return {
			c: function create() {
				li = createElement("li");
				div = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n                    ");
				label = createElement("label");
				text2 = createText(text2_value);
				div.className = "color svelte-1efltvt";
				setStyle(div, "background", ctx.k.color);
				addLoc(div, file$a, 22, 20, 1018);
				label.className = "svelte-1efltvt";
				addLoc(label, file$a, 23, 20, 1116);

				li._svelte = { component: component, ctx: ctx };

				addListener(li, "click", click_handler$1);
				li.className = li_class_value = "" + (ctx.selected.indexOf(ctx.k.key) > -1 ? 'selected':'') + " svelte-1efltvt";
				li.dataset.series = li_data_series_value = ctx.k.key;
				addLoc(li, file$a, 21, 16, 878);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, div);
				append(div, text0);
				append(li, text1);
				append(li, label);
				append(label, text2);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.colorKeys) && text0_value !== (text0_value = !ctx.k.defined ? '×' : '')) {
					setData(text0, text0_value);
				}

				if (changed.colorKeys) {
					setStyle(div, "background", ctx.k.color);
				}

				if ((changed.colorKeys) && text2_value !== (text2_value = ctx.k.key)) {
					setData(text2, text2_value);
				}

				li._svelte.ctx = ctx;
				if ((changed.selected || changed.colorKeys) && li_class_value !== (li_class_value = "" + (ctx.selected.indexOf(ctx.k.key) > -1 ? 'selected':'') + " svelte-1efltvt")) {
					li.className = li_class_value;
				}

				if ((changed.colorKeys) && li_data_series_value !== (li_data_series_value = ctx.k.key)) {
					li.dataset.series = li_data_series_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(li, "click", click_handler$1);
			}
		};
	}

	// (35:12) {#if !compact}
	function create_if_block_3$1(component, ctx) {
		var h4, text_value = __('controls / color / choose-color', 'core'), text;

		return {
			c: function create() {
				h4 = createElement("h4");
				text = createText(text_value);
				h4.className = "svelte-1efltvt";
				addLoc(h4, file$a, 35, 12, 1688);
			},

			m: function mount(target, anchor) {
				insert(target, h4, anchor);
				append(h4, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h4);
				}
			}
		};
	}

	// (49:12) {:else}
	function create_else_block$1(component, ctx) {
		var p, raw_value = __('controls / color / customize-colors / info', 'core');

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help";
				addLoc(p, file$a, 49, 12, 2286);
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
	}

	// (37:18) {#if selected.length}
	function create_if_block_1$6(component, ctx) {
		var div, colorpicker_updating = {}, text;

		var colorpicker_initial_data = {
		 	initial: false,
		 	reset: "Reset",
		 	color: ctx.customColor,
		 	palette: ctx.palette
		 };
		if (ctx.openCustom !== void 0) {
			colorpicker_initial_data.visible = ctx.openCustom;
			colorpicker_updating.visible = true;
		}
		var colorpicker = new ColorPicker({
			root: component.root,
			store: component.store,
			data: colorpicker_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!colorpicker_updating.visible && changed.visible) {
					newState.openCustom = childState.visible;
				}
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			colorpicker._bind({ visible: 1 }, colorpicker.get());
		});

		colorpicker.on("change", function(event) {
			component.updateCustom(event);
		});

		var if_block = (!ctx.compact) && create_if_block_2$1(component);

		return {
			c: function create() {
				div = createElement("div");
				colorpicker._fragment.c();
				text = createText("\n                ");
				if (if_block) { if_block.c(); }
				div.className = "select";
				setStyle(div, "margin-bottom", "20px");
				addLoc(div, file$a, 37, 12, 1797);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				colorpicker._mount(div, null);
				append(div, text);
				if (if_block) { if_block.m(div, null); }
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var colorpicker_changes = {};
				if (changed.customColor) { colorpicker_changes.color = ctx.customColor; }
				if (changed.palette) { colorpicker_changes.palette = ctx.palette; }
				if (!colorpicker_updating.visible && changed.openCustom) {
					colorpicker_changes.visible = ctx.openCustom;
					colorpicker_updating.visible = ctx.openCustom !== void 0;
				}
				colorpicker._set(colorpicker_changes);
				colorpicker_updating = {};

				if (!ctx.compact) {
					if (!if_block) {
						if_block = create_if_block_2$1(component);
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

				colorpicker.destroy();
				if (if_block) { if_block.d(); }
			}
		};
	}

	// (47:16) {#if !compact}
	function create_if_block_2$1(component, ctx) {
		var button;

		function click_handler_1(event) {
			component.reset();
		}

		return {
			c: function create() {
				button = createElement("button");
				button.textContent = "Reset";
				addListener(button, "click", click_handler_1);
				button.className = "btn";
				addLoc(button, file$a, 46, 30, 2176);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler_1);
			}
		};
	}

	function Color(options) {
		var this$1 = this;

		this._debugName = '<Color>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Color> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign(this.store._init(["vis","themeData"]), data$9()), options.data);
		this.store._add(this, ["vis","themeData"]);

		this._recompute({ $themeData: 1, $vis: 1, keys: 1, customizable: 1, axis: 1, custom: 1, palette: 1, value: 1, selected: 1 }, this._state);
		if (!('$vis' in this._state)) { console.warn("<Color> was created without expected data property '$vis'"); }
		if (!('keys' in this._state)) { console.warn("<Color> was created without expected data property 'keys'"); }
		if (!('customizable' in this._state)) { console.warn("<Color> was created without expected data property 'customizable'"); }
		if (!('axis' in this._state)) { console.warn("<Color> was created without expected data property 'axis'"); }
		if (!('custom' in this._state)) { console.warn("<Color> was created without expected data property 'custom'"); }

		if (!('$themeData' in this._state)) { console.warn("<Color> was created without expected data property '$themeData'"); }
		if (!('value' in this._state)) { console.warn("<Color> was created without expected data property 'value'"); }
		if (!('selected' in this._state)) { console.warn("<Color> was created without expected data property 'selected'"); }
		if (!('label' in this._state)) { console.warn("<Color> was created without expected data property 'label'"); }
		if (!('width' in this._state)) { console.warn("<Color> was created without expected data property 'width'"); }

		if (!('open' in this._state)) { console.warn("<Color> was created without expected data property 'open'"); }
		if (!('expanded' in this._state)) { console.warn("<Color> was created without expected data property 'expanded'"); }
		if (!('compact' in this._state)) { console.warn("<Color> was created without expected data property 'compact'"); }


		if (!('openCustom' in this._state)) { console.warn("<Color> was created without expected data property 'openCustom'"); }
		this._intro = true;
		this._handlers.update = [onupdate$3];

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$a(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Color.prototype, protoDev);
	assign(Color.prototype, methods$6);

	Color.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('palette' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'palette'"); }
		if ('colorKeys' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'colorKeys'"); }
		if ('hexColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'hexColor'"); }
		if ('customColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'customColor'"); }
	};

	Color.prototype._recompute = function _recompute(changed, state) {
		if (changed.$themeData) {
			if (this._differs(state.palette, (state.palette = palette_1(state)))) { changed.palette = true; }
		}

		if (changed.$vis || changed.keys || changed.customizable || changed.axis || changed.custom || changed.palette) {
			if (this._differs(state.colorKeys, (state.colorKeys = colorKeys(state)))) { changed.colorKeys = true; }
		}

		if (changed.value || changed.palette) {
			if (this._differs(state.hexColor, (state.hexColor = hexColor(state)))) { changed.hexColor = true; }
		}

		if (changed.selected || changed.palette || changed.custom) {
			if (this._differs(state.customColor, (state.customColor = customColor(state)))) { changed.customColor = true; }
		}
	};

	/* node_modules/@datawrapper/controls/BaseSelect.html generated by Svelte v2.16.1 */

	function data$a() {
	    return {
	        disabled: false,
	        width: 'auto',
	        labelWidth: 'auto',
	        options: [],
	        optgroups: []
	    };
	}
	var file$b = "node_modules/datawrapper/controls/BaseSelect.html";

	function get_each_context_2$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function get_each_context_1$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.optgroup = list[i];
		return child_ctx;
	}

	function get_each_context$2(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$b(component, ctx) {
		var select, if_block0_anchor, select_updating = false;

		var if_block0 = (ctx.options.length) && create_if_block_1$7(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$9(component, ctx);

		function select_change_handler() {
			select_updating = true;
			component.set({ value: selectValue(select) });
			select_updating = false;
		}

		return {
			c: function create() {
				select = createElement("select");
				if (if_block0) { if_block0.c(); }
				if_block0_anchor = createComment();
				if (if_block1) { if_block1.c(); }
				addListener(select, "change", select_change_handler);
				if (!('value' in ctx)) { component.root._beforecreate.push(select_change_handler); }
				select.className = "select-css svelte-v0oq4b";
				select.disabled = ctx.disabled;
				setStyle(select, "width", ctx.width);
				addLoc(select, file$b, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, select, anchor);
				if (if_block0) { if_block0.m(select, null); }
				append(select, if_block0_anchor);
				if (if_block1) { if_block1.m(select, null); }

				selectOption(select, ctx.value);
			},

			p: function update(changed, ctx) {
				if (ctx.options.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$7(component, ctx);
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
						if_block1 = create_if_block$9(component, ctx);
						if_block1.c();
						if_block1.m(select, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!select_updating && changed.value) { selectOption(select, ctx.value); }
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

				if (if_block0) { if_block0.d(); }
				if (if_block1) { if_block1.d(); }
				removeListener(select, "change", select_change_handler);
			}
		};
	}

	// (2:4) {#if options.length}
	function create_if_block_1$7(component, ctx) {
		var each_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_2$1(component, get_each_context$2(ctx, each_value, i));
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
						var child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_2$1(component, child_ctx);
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
	}

	// (2:25) {#each options as opt}
	function create_each_block_2$1(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				addLoc(option, file$b, 2, 4, 145);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.options) && text_value !== (text_value = ctx.opt.label)) {
					setData(text, text_value);
				}

				if ((changed.options) && option_value_value !== (option_value_value = ctx.opt.value)) {
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

	// (4:18) {#if optgroups.length}
	function create_if_block$9(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.optgroups;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context_1$1(ctx, each_value_1, i));
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
							each_blocks[i] = create_each_block$2(component, child_ctx);
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
	}

	// (6:8) {#each optgroup.options as opt}
	function create_each_block_1$1(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				addLoc(option, file$b, 6, 8, 353);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.optgroups) && text_value !== (text_value = ctx.opt.label)) {
					setData(text, text_value);
				}

				if ((changed.optgroups) && option_value_value !== (option_value_value = ctx.opt.value)) {
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

	// (4:41) {#each optgroups as optgroup}
	function create_each_block$2(component, ctx) {
		var optgroup, optgroup_label_value;

		var each_value_2 = ctx.optgroup.options;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(component, get_each_context_2$1(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
				addLoc(optgroup, file$b, 4, 4, 269);
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
						var child_ctx = get_each_context_2$1(ctx, each_value_2, i);

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

				if ((changed.optgroups) && optgroup_label_value !== (optgroup_label_value = ctx.optgroup.label)) {
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
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$a(), options.data);
		if (!('disabled' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'disabled'"); }
		if (!('value' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'value'"); }
		if (!('width' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'width'"); }
		if (!('options' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'options'"); }
		if (!('optgroups' in this._state)) { console.warn("<BaseSelect> was created without expected data property 'optgroups'"); }
		this._intro = true;

		this._fragment = create_main_fragment$b(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(BaseSelect.prototype, protoDev);

	BaseSelect.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	function formats(columnType) {
	    if (columnType === 'number') {
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
	            { l: '123.45k', f: '0.[00]a' }
	        ];
	    }
	    if (columnType === 'date') {
	        // todo translate
	        return [
	            { l: '2015, 2016', f: 'YYYY' },
	            { l: '2015 Q1, 2015 Q2', f: 'YYYY [Q]Q' },
	            { l: '2015, Q2, Q3', f: 'YYYY|[Q]Q' },
	            { l: '2015, Feb, Mar', f: 'YYYY|MMM' },
	            { l: '’15, ’16', f: '’YY' },
	            { l: 'April, May', f: 'MMMM' },
	            { l: 'Apr, May', f: 'MMM' },
	            { l: 'Apr ’15, May ’15', f: 'MMM ’YY' },
	            { l: 'April, 2, 3', f: 'MMM|DD' }
	        ];
	    }
	    return [];
	}

	/* node_modules/@datawrapper/controls/CustomFormat.html generated by Svelte v2.16.1 */



	function customFormatHelp(ref) {
	    var columnType = ref.columnType;
	    var disabled = ref.disabled;

	    if (columnType === 'date')
	        { return ((disabled ? '' : '<a href="http://momentjs.com/docs/#/displaying/format/" target="_blank">') + "moment.js documentation" + (disabled ? '' : '</a>')); }
	    if (columnType === 'number')
	        { return ((disabled ? '' : '<a href="http://numeraljs.com/#format" target="_blank">') + "numeral.js documentation" + (disabled ? '' : '</a>')); }
	    return '';
	}
	function columnType(ref) {
	    var axisCol = ref.axisCol;
	    var type = ref.type;

	    if (axisCol) { return axisCol.type(); }
	    if (type) { return type; }
	    return 'number';
	}
	function axisCol(ref) {
	    var $vis = ref.$vis;
	    var $dataset = ref.$dataset;
	    var axis = ref.axis;

	    if (!$vis || !axis) { return null; }
	    var colids = $vis.axes()[axis];
	    return $dataset.column(typeof colids === 'object' ? colids[0] : colids);
	}
	function options(ref) {
	    var columnType = ref.columnType;

	    var formatOptions = formats(columnType).map(function (ref) {
	    	var f = ref.f;
	    	var l = ref.l;

	    	return ({
	        value: f,
	        label: l
	    });
	    });
	    formatOptions.push({ value: 'custom', label: '(custom)' });
	    return formatOptions;
	}
	function data$b() {
	    return {
	        axis: false,
	        value: '',
	        custom: '',
	        selected: null,
	        type: false,
	        disabled: false,
	        width: '100px'
	    };
	}
	function onstate(ref) {
	    var changed = ref.changed;
	    var ref_current = ref.current;
	    var selected = ref_current.selected;
	    var custom = ref_current.custom;
	    var value = ref_current.value;
	    var options = ref_current.options;

	    // watch external value changes
	    if (changed.value && value) {
	        var selectedOption = options.find(function (o) { return o.value === value; });
	        if (selectedOption) {
	            this.set({ selected: selectedOption.value, custom: '' });
	        } else {
	            this.set({ selected: 'custom', custom: value });
	        }
	    }

	    // watch select changes
	    if (changed.selected && selected) {
	        this.set({ value: selected !== 'custom' ? selected : custom + ' ' });
	    }

	    // watch input text changes
	    if (changed.custom && custom !== null) {
	        this.set({ value: custom });
	    }
	}
	var file$c = "node_modules/datawrapper/controls/CustomFormat.html";

	function create_main_fragment$c(component, ctx) {
		var div1, div0, baseselect_updating = {}, text, div1_class_value;

		var baseselect_initial_data = { width: "100%" };
		if (ctx.selected !== void 0) {
			baseselect_initial_data.value = ctx.selected;
			baseselect_updating.value = true;
		}
		if (ctx.disabled  !== void 0) {
			baseselect_initial_data.disabled = ctx.disabled ;
			baseselect_updating.disabled = true;
		}
		if (ctx.options  !== void 0) {
			baseselect_initial_data.options = ctx.options ;
			baseselect_updating.options = true;
		}
		var baseselect = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!baseselect_updating.value && changed.value) {
					newState.selected = childState.value;
				}

				if (!baseselect_updating.disabled && changed.disabled) {
					newState.disabled = childState.disabled;
				}

				if (!baseselect_updating.options && changed.options) {
					newState.options = childState.options;
				}
				component._set(newState);
				baseselect_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			baseselect._bind({ value: 1, disabled: 1, options: 1 }, baseselect.get());
		});

		var if_block = (ctx.selected === 'custom') && create_if_block$a(component, ctx);

		var controlgroup_initial_data = {
		 	type: "custom-format",
		 	valign: "top",
		 	width: ctx.width,
		 	label: ctx.label,
		 	disabled: ctx.disabled
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				baseselect._fragment.c();
				text = createText("\n        ");
				if (if_block) { if_block.c(); }
				controlgroup._fragment.c();
				div0.className = "select svelte-1gqmo73";
				addLoc(div0, file$c, 2, 8, 178);
				div1.className = div1_class_value = "" + (ctx.selected === 'custom' ? 'split-container' : '') + " svelte-1gqmo73";
				addLoc(div1, file$c, 1, 4, 107);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div1);
				append(div1, div0);
				baseselect._mount(div0, null);
				append(div1, text);
				if (if_block) { if_block.m(div1, null); }
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var baseselect_changes = {};
				if (!baseselect_updating.value && changed.selected) {
					baseselect_changes.value = ctx.selected;
					baseselect_updating.value = ctx.selected !== void 0;
				}
				if (!baseselect_updating.disabled && changed.disabled) {
					baseselect_changes.disabled = ctx.disabled ;
					baseselect_updating.disabled = ctx.disabled  !== void 0;
				}
				if (!baseselect_updating.options && changed.options) {
					baseselect_changes.options = ctx.options ;
					baseselect_updating.options = ctx.options  !== void 0;
				}
				baseselect._set(baseselect_changes);
				baseselect_updating = {};

				if (ctx.selected === 'custom') {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$a(component, ctx);
						if_block.c();
						if_block.m(div1, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.selected) && div1_class_value !== (div1_class_value = "" + (ctx.selected === 'custom' ? 'split-container' : '') + " svelte-1gqmo73")) {
					div1.className = div1_class_value;
				}

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				baseselect.destroy();
				if (if_block) { if_block.d(); }
				controlgroup.destroy(detach);
			}
		};
	}

	// (6:8) {#if selected === 'custom'}
	function create_if_block$a(component, ctx) {
		var input, input_updating = false, text0, div, text1, raw_before, raw_after, text2;

		function input_input_handler() {
			input_updating = true;
			component.set({ custom: input.value });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				text0 = createText("\n        ");
				div = createElement("div");
				text1 = createText("For help on custom formats, check the ");
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text2 = createText(".");
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.disabled = ctx.disabled;
				input.className = "svelte-1gqmo73";
				addLoc(input, file$c, 6, 8, 358);
				div.className = "small svelte-1gqmo73";
				addLoc(div, file$c, 7, 8, 430);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.custom;

				insert(target, text0, anchor);
				insert(target, div, anchor);
				append(div, text1);
				append(div, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.customFormatHelp);
				append(div, raw_after);
				append(div, text2);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.custom) { input.value = ctx.custom; }
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.customFormatHelp) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", ctx.customFormatHelp);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
				if (detach) {
					detachNode(text0);
					detachNode(div);
				}
			}
		};
	}

	function CustomFormat(options) {
		var this$1 = this;

		this._debugName = '<CustomFormat>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<CustomFormat> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign(this.store._init(["vis","dataset"]), data$b()), options.data);
		this.store._add(this, ["vis","dataset"]);

		this._recompute({ $vis: 1, $dataset: 1, axis: 1, axisCol: 1, type: 1, columnType: 1, disabled: 1 }, this._state);

		if (!('disabled' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'disabled'"); }

		if (!('type' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'type'"); }
		if (!('$vis' in this._state)) { console.warn("<CustomFormat> was created without expected data property '$vis'"); }
		if (!('$dataset' in this._state)) { console.warn("<CustomFormat> was created without expected data property '$dataset'"); }
		if (!('axis' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'axis'"); }
		if (!('width' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'label'"); }
		if (!('selected' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'selected'"); }

		if (!('custom' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'custom'"); }
		this._intro = true;

		this._handlers.state = [onstate];

		this._handlers.destroy = [removeFromStore];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$c(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(CustomFormat.prototype, protoDev);

	CustomFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('axisCol' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'axisCol'"); }
		if ('columnType' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'columnType'"); }
		if ('customFormatHelp' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'customFormatHelp'"); }
		if ('options' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'options'"); }
	};

	CustomFormat.prototype._recompute = function _recompute(changed, state) {
		if (changed.$vis || changed.$dataset || changed.axis) {
			if (this._differs(state.axisCol, (state.axisCol = axisCol(state)))) { changed.axisCol = true; }
		}

		if (changed.axisCol || changed.type) {
			if (this._differs(state.columnType, (state.columnType = columnType(state)))) { changed.columnType = true; }
		}

		if (changed.columnType || changed.disabled) {
			if (this._differs(state.customFormatHelp, (state.customFormatHelp = customFormatHelp(state)))) { changed.customFormatHelp = true; }
		}

		if (changed.columnType) {
			if (this._differs(state.options, (state.options = options(state)))) { changed.options = true; }
		}
	};

	/* node_modules/@datawrapper/controls/CustomAxisRange.html generated by Svelte v2.16.1 */

	function data$c() {
	    return {
	        disabled: false,
	        value: ['', ''],
	        help: '',
	        width: '100px',
	        placeholder: {
	            min: 'min',
	            max: 'max'
	        }
	    };
	}
	var file$d = "node_modules/datawrapper/controls/CustomAxisRange.html";

	function create_main_fragment$d(component, ctx) {
		var input0, input0_updating = false, input0_placeholder_value, text0, span, text1, span_class_value, text2, input1, input1_updating = false, input1_placeholder_value;

		function input0_input_handler() {
			input0_updating = true;
			ctx.value[0] = input0.value;
			component.set({ value: ctx.value });
			input0_updating = false;
		}

		function input1_input_handler() {
			input1_updating = true;
			ctx.value[1] = input1.value;
			component.set({ value: ctx.value });
			input1_updating = false;
		}

		var controlgroup_initial_data = {
		 	type: "custom-axis-range",
		 	valign: "top",
		 	width: ctx.width,
		 	label: ctx.label,
		 	disabled: ctx.disabled,
		 	help: ctx.help
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				input0 = createElement("input");
				text0 = createText("\n    ");
				span = createElement("span");
				text1 = createText("–");
				text2 = createText("\n    ");
				input1 = createElement("input");
				controlgroup._fragment.c();
				addListener(input0, "input", input0_input_handler);
				setAttribute(input0, "type", "text");
				input0.placeholder = input0_placeholder_value = ctx.placeholder.min;
				input0.disabled = ctx.disabled;
				input0.className = "svelte-c19koz";
				addLoc(input0, file$d, 1, 4, 125);
				span.className = span_class_value = "separator " + (ctx.disabled ? 'separator-disabled' : '') + " svelte-c19koz";
				addLoc(span, file$d, 2, 4, 227);
				addListener(input1, "input", input1_input_handler);
				setAttribute(input1, "type", "text");
				input1.placeholder = input1_placeholder_value = ctx.placeholder.max;
				input1.disabled = ctx.disabled;
				input1.className = "svelte-c19koz";
				addLoc(input1, file$d, 3, 4, 303);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, input0);

				input0.value = ctx.value[0];

				append(controlgroup._slotted.default, text0);
				append(controlgroup._slotted.default, span);
				append(span, text1);
				append(controlgroup._slotted.default, text2);
				append(controlgroup._slotted.default, input1);

				input1.value = ctx.value[1];

				controlgroup._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input0_updating && changed.value) { input0.value = ctx.value[0]; }
				if ((changed.placeholder) && input0_placeholder_value !== (input0_placeholder_value = ctx.placeholder.min)) {
					input0.placeholder = input0_placeholder_value;
				}

				if (changed.disabled) {
					input0.disabled = ctx.disabled;
				}

				if ((changed.disabled) && span_class_value !== (span_class_value = "separator " + (ctx.disabled ? 'separator-disabled' : '') + " svelte-c19koz")) {
					span.className = span_class_value;
				}

				if (!input1_updating && changed.value) { input1.value = ctx.value[1]; }
				if ((changed.placeholder) && input1_placeholder_value !== (input1_placeholder_value = ctx.placeholder.max)) {
					input1.placeholder = input1_placeholder_value;
				}

				if (changed.disabled) {
					input1.disabled = ctx.disabled;
				}

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				if (changed.help) { controlgroup_changes.help = ctx.help; }
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				removeListener(input0, "input", input0_input_handler);
				removeListener(input1, "input", input1_input_handler);
				controlgroup.destroy(detach);
			}
		};
	}

	function CustomAxisRange(options) {
		this._debugName = '<CustomAxisRange>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$c(), options.data);
		if (!('width' in this._state)) { console.warn("<CustomAxisRange> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<CustomAxisRange> was created without expected data property 'label'"); }
		if (!('disabled' in this._state)) { console.warn("<CustomAxisRange> was created without expected data property 'disabled'"); }
		if (!('help' in this._state)) { console.warn("<CustomAxisRange> was created without expected data property 'help'"); }
		if (!('placeholder' in this._state)) { console.warn("<CustomAxisRange> was created without expected data property 'placeholder'"); }
		if (!('value' in this._state)) { console.warn("<CustomAxisRange> was created without expected data property 'value'"); }
		this._intro = true;

		this._fragment = create_main_fragment$d(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(CustomAxisRange.prototype, protoDev);

	CustomAxisRange.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/DropdownItem.html generated by Svelte v2.16.1 */

	function create_main_fragment$e(component, ctx) {
		var raw_value = ctx.label || '', raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.label) && raw_value !== (raw_value = ctx.label || '')) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	function DropdownItem(options) {
		this._debugName = '<DropdownItem>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('label' in this._state)) { console.warn("<DropdownItem> was created without expected data property 'label'"); }
		this._intro = true;

		this._fragment = create_main_fragment$e(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(DropdownItem.prototype, protoDev);

	DropdownItem.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Dropdown.html generated by Svelte v2.16.1 */



	function currentItem(ref) {
	    var value = ref.value;
	    var options = ref.options;
	    var placeholder = ref.placeholder;
	    var forcePlaceholder = ref.forcePlaceholder;
	    var forceLabel = ref.forceLabel;

	    if (forceLabel) { return typeof forceLabel === 'string' ? { label: forceLabel } : forceLabel; }
	    if (!forcePlaceholder) {
	        for (var i = 0; i < options.length; i++) {
	            if (options[i].value === value) {
	                return options[i];
	            }
	        }
	    }
	    return {
	        isPlaceholder: true,
	        label: ("<span style=\"color:#999;font-size:12px;\">" + placeholder + "</span>")
	    };
	}
	function data$d() {
	    return {
	        forcePlaceholder: false,
	        disabled: false,
	        width: 'auto',
	        options: [],
	        optgroups: [],
	        placeholder: '(select an item)',
	        forceLabel: false,
	        passEvent: false,
	        itemRenderer: DropdownItem
	    };
	}
	var methods$7 = {
	    select: function select(event, opt) {
	        event.preventDefault();
	        var ref = this.get();
	        var passEvent = ref.passEvent;
	        this.set({ value: opt.value });
	        this.fire('change', passEvent ? { value: opt.value, event: event } : opt.value);
	    },
	    keydown: function keydown(event) {
	        if (event.key === 'ArrowDown') {
	            this.moveSelection(event, 1);
	        } else if (event.key === 'ArrowUp') {
	            this.moveSelection(event, -1);
	        }
	    },
	    moveSelection: function moveSelection(event, diff) {
	        var ref = this.get();
	        var value = ref.value;
	        var options = ref.options;
	        var passEvent = ref.passEvent;
	        var selIndex = options.map(function (o) { return o.value; }).indexOf(value);
	        if (value < 0) { selIndex = diff > 0 ? diff : options.length + diff; }
	        else { selIndex += diff; }
	        var newVal = options[(selIndex + options.length) % options.length].value;
	        this.set({ value: newVal });
	        this.fire('change', passEvent ? { value: newVal, event: event } : newVal);
	    }
	};

	var file$e = "node_modules/datawrapper/controls/Dropdown.html";

	function click_handler$2(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.select(event, ctx.opt);
	}

	function get_each_context$3(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$f(component, ctx) {
		var span1, div, button, text0, span0, text1, span2, ul;

		function select_block_type(ctx) {
			if (ctx.currentItem.isPlaceholder) { return create_if_block_1$8; }
			return create_else_block$2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		function keydown_handler(event) {
			component.keydown(event);
		}

		var if_block1 = (ctx.options.length) && create_if_block$b(component, ctx);

		var basedropdown_initial_data = { disabled: ctx.disabled };
		var basedropdown = new BaseDropdown({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), content: createFragment(), button: createFragment() },
			data: basedropdown_initial_data
		});

		var controlgroup_initial_data = {
		 	width: ctx.width,
		 	inline: true,
		 	label: ctx.label,
		 	disabled: ctx.disabled
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				span1 = createElement("span");
				div = createElement("div");
				button = createElement("button");
				if_block0.c();
				text0 = createText("\n                    ");
				span0 = createElement("span");
				text1 = createText("\n        ");
				span2 = createElement("span");
				ul = createElement("ul");
				if (if_block1) { if_block1.c(); }
				basedropdown._fragment.c();
				controlgroup._fragment.c();
				span0.className = "caret svelte-kh5nv7";
				addLoc(span0, file$e, 8, 20, 499);
				addListener(button, "keydown", keydown_handler);
				button.className = "btn dropdown-toggle svelte-kh5nv7";
				toggleClass(button, "disabled", ctx.disabled);
				addLoc(button, file$e, 4, 16, 207);
				div.className = "btn-group";
				addLoc(div, file$e, 3, 12, 167);
				setAttribute(span1, "slot", "button");
				addLoc(span1, file$e, 2, 8, 134);
				ul.className = "dropdown-menu svelte-kh5nv7";
				setStyle(ul, "display", "block");
				addLoc(ul, file$e, 13, 12, 630);
				setAttribute(span2, "slot", "content");
				addLoc(span2, file$e, 12, 8, 596);
			},

			m: function mount(target, anchor) {
				append(basedropdown._slotted.button, span1);
				append(span1, div);
				append(div, button);
				if_block0.m(button, null);
				append(button, text0);
				append(button, span0);
				append(basedropdown._slotted.default, text1);
				append(basedropdown._slotted.content, span2);
				append(span2, ul);
				if (if_block1) { if_block1.m(ul, null); }
				basedropdown._mount(controlgroup._slotted.default, null);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(button, text0);
				}

				if (changed.disabled) {
					toggleClass(button, "disabled", ctx.disabled);
				}

				if (ctx.options.length) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$b(component, ctx);
						if_block1.c();
						if_block1.m(ul, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				var basedropdown_changes = {};
				if (changed.disabled) { basedropdown_changes.disabled = ctx.disabled; }
				basedropdown._set(basedropdown_changes);

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				if_block0.d();
				removeListener(button, "keydown", keydown_handler);
				if (if_block1) { if_block1.d(); }
				basedropdown.destroy();
				controlgroup.destroy(detach);
			}
		};
	}

	// (6:78) {:else}
	function create_else_block$2(component, ctx) {
		var switch_instance_anchor;

		var switch_instance_spread_levels = [
			ctx.currentItem
		];

		var switch_value = ctx.itemRenderer;

		function switch_props(ctx) {
			var switch_instance_initial_data = {};
			for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props());
		}

		return {
			c: function create() {
				if (switch_instance) { switch_instance._fragment.c(); }
				switch_instance_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (switch_instance) {
					switch_instance._mount(target, anchor);
				}

				insert(target, switch_instance_anchor, anchor);
			},

			p: function update(changed, ctx) {
				var switch_instance_changes = changed.currentItem ? getSpreadUpdate(switch_instance_spread_levels, [
					ctx.currentItem
				]) : {};

				if (switch_value !== (switch_value = ctx.itemRenderer)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						switch_instance._fragment.c();
						switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(switch_instance_anchor);
				}

				if (switch_instance) { switch_instance.destroy(detach); }
			}
		};
	}

	// (6:20) {#if currentItem.isPlaceholder}
	function create_if_block_1$8(component, ctx) {
		var raw_value = ctx.currentItem.label, raw_before, raw_after;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.currentItem) && raw_value !== (raw_value = ctx.currentItem.label)) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
				}
			}
		};
	}

	// (15:16) {#if options.length}
	function create_if_block$b(component, ctx) {
		var each_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, get_each_context$3(ctx, each_value, i));
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
				if (changed.value || changed.options || changed.itemRenderer) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$3(component, child_ctx);
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
	}

	// (15:37) {#each options as opt}
	function create_each_block$3(component, ctx) {
		var li, a, a_href_value, text, li_class_value;

		var switch_instance_spread_levels = [
			ctx.opt
		];

		var switch_value = ctx.itemRenderer;

		function switch_props(ctx) {
			var switch_instance_initial_data = {};
			for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props());
		}

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				if (switch_instance) { switch_instance._fragment.c(); }
				text = createText("\n                ");
				a._svelte = { component: component, ctx: ctx };

				addListener(a, "click", click_handler$2);
				a.href = a_href_value = "#/" + ctx.opt.value;
				addLoc(a, file$e, 16, 20, 822);
				li.className = li_class_value = "" + (ctx.value==ctx.opt.value?'selected':'') + " svelte-kh5nv7";
				addLoc(li, file$e, 15, 16, 756);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);

				if (switch_instance) {
					switch_instance._mount(a, null);
				}

				append(li, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var switch_instance_changes = changed.options ? getSpreadUpdate(switch_instance_spread_levels, [
					ctx.opt
				]) : {};

				if (switch_value !== (switch_value = ctx.itemRenderer)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						switch_instance._fragment.c();
						switch_instance._mount(a, null);
					} else {
						switch_instance = null;
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}

				a._svelte.ctx = ctx;
				if ((changed.options) && a_href_value !== (a_href_value = "#/" + ctx.opt.value)) {
					a.href = a_href_value;
				}

				if ((changed.value || changed.options) && li_class_value !== (li_class_value = "" + (ctx.value==ctx.opt.value?'selected':'') + " svelte-kh5nv7")) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				if (switch_instance) { switch_instance.destroy(); }
				removeListener(a, "click", click_handler$2);
			}
		};
	}

	function Dropdown(options) {
		this._debugName = '<Dropdown>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$d(), options.data);

		this._recompute({ value: 1, options: 1, placeholder: 1, forcePlaceholder: 1, forceLabel: 1 }, this._state);
		if (!('value' in this._state)) { console.warn("<Dropdown> was created without expected data property 'value'"); }
		if (!('options' in this._state)) { console.warn("<Dropdown> was created without expected data property 'options'"); }
		if (!('placeholder' in this._state)) { console.warn("<Dropdown> was created without expected data property 'placeholder'"); }
		if (!('forcePlaceholder' in this._state)) { console.warn("<Dropdown> was created without expected data property 'forcePlaceholder'"); }
		if (!('forceLabel' in this._state)) { console.warn("<Dropdown> was created without expected data property 'forceLabel'"); }
		if (!('width' in this._state)) { console.warn("<Dropdown> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<Dropdown> was created without expected data property 'label'"); }
		if (!('disabled' in this._state)) { console.warn("<Dropdown> was created without expected data property 'disabled'"); }

		if (!('itemRenderer' in this._state)) { console.warn("<Dropdown> was created without expected data property 'itemRenderer'"); }
		this._intro = true;

		this._fragment = create_main_fragment$f(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Dropdown.prototype, protoDev);
	assign(Dropdown.prototype, methods$7);

	Dropdown.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentItem' in newState && !this._updatingReadonlyProperty) { throw new Error("<Dropdown>: Cannot set read-only property 'currentItem'"); }
	};

	Dropdown.prototype._recompute = function _recompute(changed, state) {
		if (changed.value || changed.options || changed.placeholder || changed.forcePlaceholder || changed.forceLabel) {
			if (this._differs(state.currentItem, (state.currentItem = currentItem(state)))) { changed.currentItem = true; }
		}
	};

	/* node_modules/@datawrapper/controls/DropdownMenu.html generated by Svelte v2.16.1 */

	function data$e() {
	    return {
	        label: '',
	        items: [],
	        btnClass: 'btn'
	    };
	}
	var methods$8 = {
	    action: function action(item) {
	        if (!item.disabled) { item.action(); }
	    }
	};

	var file$f = "node_modules/datawrapper/controls/DropdownMenu.html";

	function click_handler$3(event) {
		event.preventDefault();
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.action(ctx.item);
	}

	function get_each_context$4(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function create_main_fragment$g(component, ctx) {
		var button, text, ul;

		function select_block_type(ctx) {
			if (ctx.label) { return create_if_block$c; }
			return create_else_block$3;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		var each_value = ctx.items;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(component, get_each_context$4(ctx, each_value, i));
		}

		var basedropdown_initial_data = { disabled: ctx.disabled };
		var basedropdown = new BaseDropdown({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), content: createFragment(), button: createFragment() },
			data: basedropdown_initial_data
		});

		return {
			c: function create() {
				button = createElement("button");
				if_block.c();
				text = createText("\n    ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				basedropdown._fragment.c();
				setAttribute(button, "slot", "button");
				button.disabled = ctx.disabled;
				button.className = ctx.btnClass;
				addLoc(button, file$f, 50, 4, 1027);
				setAttribute(ul, "slot", "content");
				ul.className = "svelte-asmu9z";
				addLoc(ul, file$f, 56, 4, 1237);
			},

			m: function mount(target, anchor) {
				append(basedropdown._slotted.button, button);
				if_block.m(button, null);
				append(basedropdown._slotted.default, text);
				append(basedropdown._slotted.content, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				basedropdown._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(button, null);
				}

				if (changed.disabled) {
					button.disabled = ctx.disabled;
				}

				if (changed.btnClass) {
					button.className = ctx.btnClass;
				}

				if (changed.items) {
					each_value = ctx.items;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$4(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$4(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				var basedropdown_changes = {};
				if (changed.disabled) { basedropdown_changes.disabled = ctx.disabled; }
				basedropdown._set(basedropdown_changes);
			},

			d: function destroy(detach) {
				if_block.d();

				destroyEach(each_blocks, detach);

				basedropdown.destroy(detach);
			}
		};
	}

	// (53:8) {:else}
	function create_else_block$3(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "im im-menu-dot-h";
				addLoc(i, file$f, 53, 8, 1172);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (52:8) {#if label}
	function create_if_block$c(component, ctx) {
		var raw_before, raw_after, text, span;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text = createText(" ");
				span = createElement("span");
				span.className = "caret";
				addLoc(span, file$f, 51, 34, 1125);
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", ctx.label);
				insert(target, raw_after, anchor);
				insert(target, text, anchor);
				insert(target, span, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", ctx.label);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
					detachNode(text);
					detachNode(span);
				}
			}
		};
	}

	// (58:8) {#each items as item}
	function create_each_block$4(component, ctx) {
		var li, a, raw_value = ctx.item.label, text;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				text = createText("\n        ");
				a._svelte = { component: component, ctx: ctx };

				addListener(a, "click", click_handler$3);
				a.href = "#/action";
				a.className = "svelte-asmu9z";
				toggleClass(a, "disabled", ctx.item.disabled);
				addLoc(a, file$f, 59, 12, 1312);
				li.className = "svelte-asmu9z";
				addLoc(li, file$f, 58, 8, 1295);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				a.innerHTML = raw_value;
				append(li, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.items) && raw_value !== (raw_value = ctx.item.label)) {
					a.innerHTML = raw_value;
				}

				a._svelte.ctx = ctx;
				if (changed.items) {
					toggleClass(a, "disabled", ctx.item.disabled);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(a, "click", click_handler$3);
			}
		};
	}

	function DropdownMenu(options) {
		this._debugName = '<DropdownMenu>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$e(), options.data);
		if (!('disabled' in this._state)) { console.warn("<DropdownMenu> was created without expected data property 'disabled'"); }
		if (!('btnClass' in this._state)) { console.warn("<DropdownMenu> was created without expected data property 'btnClass'"); }
		if (!('label' in this._state)) { console.warn("<DropdownMenu> was created without expected data property 'label'"); }
		if (!('items' in this._state)) { console.warn("<DropdownMenu> was created without expected data property 'items'"); }
		this._intro = true;

		this._fragment = create_main_fragment$g(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(DropdownMenu.prototype, protoDev);
	assign(DropdownMenu.prototype, methods$8);

	DropdownMenu.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/editor/EditorNavStep.html generated by Svelte v2.16.1 */

	function activeIndex(ref) {
	    var active = ref.active;
	    var steps = ref.steps;

	    return steps.indexOf(underscore.findWhere(steps, { id: active }));
	}
	function passed(ref) {
	    var index = ref.index;
	    var activeIndex = ref.activeIndex;
	    var maxStep = ref.maxStep;

	    return index < maxStep && index !== activeIndex;
	}
	function class_(ref) {
	    var step = ref.step;
	    var index = ref.index;
	    var active = ref.active;
	    var passed = ref.passed;
	    var $lastEditStep = ref.$lastEditStep;

	    var list = [];
	    if (step.readonly) { list.push('readonly'); }
	    if (active === step.id) { list.push('active'); }
	    else {
	        if (index > $lastEditStep + 1) { list.push('unseen'); }
	        if (passed) { list.push('passed'); }
	    }
	    return list.join(' ');
	}
	function data$f() {
	    return {
	        step: {
	            title: '',
	            index: 1
	        },
	        maxStep: 1,
	        active: 1
	    };
	}
	var methods$9 = {
	    select: function select(event, step) {
	        if (step.redirect) { return; }
	        event.preventDefault();
	        if (step.readonly) { return; }
	        this.fire('select', step);
	        if (window.location.pathname.substr(0, 6) === '/edit/') {
	            var ref = this.store.get();
	            var id = ref.id;
	            window.history.pushState({ step: step, id: id }, '', ("/edit/" + id + "/" + (step.id)));
	        }
	    }
	};

	function onupdate$4(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.activeIndex) {
	        var step = current.steps[current.activeIndex];
	        if (step) {
	            var ref$1 = this.store.get();
	            var id = ref$1.id;
	            var title = ref$1.title;
	            window.document.title = title + " - " + id + " - " + (step.title) + " | Datawrapper";
	        }
	    }
	}
	var file$g = "node_modules/datawrapper/controls/editor/EditorNavStep.html";

	function create_main_fragment$h(component, ctx) {
		var a, span0, text0, text1, span1, raw_value = ctx.step.title, text2, text3, div, a_href_value;

		var if_block = (ctx.passed) && create_if_block$d();

		function click_handler(event) {
			component.select(event, ctx.step);
		}

		return {
			c: function create() {
				a = createElement("a");
				span0 = createElement("span");
				text0 = createText(ctx.index);
				text1 = createText("\n    ");
				span1 = createElement("span");
				text2 = createText("\n    ");
				if (if_block) { if_block.c(); }
				text3 = createText("\n    ");
				div = createElement("div");
				span0.className = "step";
				addLoc(span0, file$g, 1, 4, 138);
				span1.className = "title";
				addLoc(span1, file$g, 2, 4, 176);
				div.className = "corner";
				addLoc(div, file$g, 4, 4, 276);
				addListener(a, "click", click_handler);
				setStyle(a, "width", "" + 95/ctx.steps.length + "%");
				a.href = a_href_value = ctx.step.redirect?ctx.step.redirect:'#'+ctx.step.id;
				a.className = ctx.class_;
				addLoc(a, file$g, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, span0);
				append(span0, text0);
				append(a, text1);
				append(a, span1);
				span1.innerHTML = raw_value;
				append(a, text2);
				if (if_block) { if_block.m(a, null); }
				append(a, text3);
				append(a, div);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.index) {
					setData(text0, ctx.index);
				}

				if ((changed.step) && raw_value !== (raw_value = ctx.step.title)) {
					span1.innerHTML = raw_value;
				}

				if (ctx.passed) {
					if (!if_block) {
						if_block = create_if_block$d();
						if_block.c();
						if_block.m(a, text3);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.steps) {
					setStyle(a, "width", "" + 95/ctx.steps.length + "%");
				}

				if ((changed.step) && a_href_value !== (a_href_value = ctx.step.redirect?ctx.step.redirect:'#'+ctx.step.id)) {
					a.href = a_href_value;
				}

				if (changed.class_) {
					a.className = ctx.class_;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				if (if_block) { if_block.d(); }
				removeListener(a, "click", click_handler);
			}
		};
	}

	// (4:4) {#if passed }
	function create_if_block$d(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "fa fa-check";
				addLoc(i, file$g, 3, 17, 239);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	function EditorNavStep(options) {
		var this$1 = this;

		this._debugName = '<EditorNavStep>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<EditorNavStep> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign(this.store._init(["lastEditStep"]), data$f()), options.data);
		this.store._add(this, ["lastEditStep"]);

		this._recompute({ active: 1, steps: 1, index: 1, activeIndex: 1, maxStep: 1, step: 1, passed: 1, $lastEditStep: 1 }, this._state);
		if (!('active' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'active'"); }
		if (!('steps' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'steps'"); }
		if (!('index' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'index'"); }

		if (!('maxStep' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'maxStep'"); }
		if (!('step' in this._state)) { console.warn("<EditorNavStep> was created without expected data property 'step'"); }

		if (!('$lastEditStep' in this._state)) { console.warn("<EditorNavStep> was created without expected data property '$lastEditStep'"); }
		this._intro = true;
		this._handlers.update = [onupdate$4];

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$h(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(EditorNavStep.prototype, protoDev);
	assign(EditorNavStep.prototype, methods$9);

	EditorNavStep.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('activeIndex' in newState && !this._updatingReadonlyProperty) { throw new Error("<EditorNavStep>: Cannot set read-only property 'activeIndex'"); }
		if ('passed' in newState && !this._updatingReadonlyProperty) { throw new Error("<EditorNavStep>: Cannot set read-only property 'passed'"); }
		if ('class_' in newState && !this._updatingReadonlyProperty) { throw new Error("<EditorNavStep>: Cannot set read-only property 'class_'"); }
	};

	EditorNavStep.prototype._recompute = function _recompute(changed, state) {
		if (changed.active || changed.steps) {
			if (this._differs(state.activeIndex, (state.activeIndex = activeIndex(state)))) { changed.activeIndex = true; }
		}

		if (changed.index || changed.activeIndex || changed.maxStep) {
			if (this._differs(state.passed, (state.passed = passed(state)))) { changed.passed = true; }
		}

		if (changed.step || changed.index || changed.active || changed.passed || changed.$lastEditStep) {
			if (this._differs(state.class_, (state.class_ = class_(state)))) { changed.class_ = true; }
		}
	};

	/**
	 * tracks a custom event in Matomo
	 *
	 *
	 * @param {string} category - the event category
	 * @param {string} category - the event action
	 * @param {string} category - the event name
	 * @param {string|number} category - the event value, optional
	 */

	var previousPageUrl;

	/**
	 * tracks a custom page view in Matomo. Useful for single page
	 * apps in Datawrapper, such as the locator maps UI. The page title
	 * and URL are automatically detected using the window object.
	 *
	 * @param {number} loadTime - optional page load time, has to be measured
	 *    manually
	 */
	function trackPageView(loadTime) {
	    if ( loadTime === void 0 ) loadTime = 0;

	    if (window._paq) {
	        if (previousPageUrl) {
	            window._paq.push(['setReferrerUrl', previousPageUrl]);
	        }
	        window._paq.push(['setGenerationTimeMs', loadTime]);
	        window._paq.push(['setCustomUrl', window.location.pathname]);
	        window._paq.push(['setDocumentTitle', window.document.title]);
	        window._paq.push(['trackPageView']);
	        previousPageUrl = window.location.pathname;
	    }
	}

	/* node_modules/@datawrapper/controls/editor/EditorNav.html generated by Svelte v2.16.1 */



	function data$g() {
	    return {
	        steps: []
	    };
	}
	var methods$a = {
	    select: function select(step, index) {
	        this.set({ active: step.id });
	        var ref = this.store.get();
	        var lastEditStep = ref.lastEditStep;
	        this.store.set({ lastEditStep: Math.max(lastEditStep, index + 1) });
	        trackPageView();
	    },
	    popstate: function popstate(event) {
	        if (event.state && event.state.id && event.state.step) {
	            var ref = event.state;
	            var id = ref.id;
	            var step = ref.step;
	            if (id === this.store.get().id) {
	                // same chart id
	                this.set({ active: step.id });
	                trackPageView();
	            } else {
	                // need to reload
	                window.location.href = "/edit/" + id + "/" + (step.id);
	            }
	        }
	    }
	};

	function oncreate$1() {
	    var ref = this.get();
	    var active = ref.active;
	    var steps = ref.steps;
	    var ref$1 = this.store.get();
	    var lastEditStep = ref$1.lastEditStep;
	    var id = ref$1.id;
	    var step = underscore.findWhere(steps, { id: active });
	    this.store.set({ lastEditStep: Math.max(lastEditStep, steps.indexOf(step) + 1) });
	    // make sure the initial state is stored
	    window.history.replaceState({ step: step, id: id }, step.title);
	}
	var file$h = "node_modules/datawrapper/controls/editor/EditorNav.html";

	function get_each_context$5(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.step = list[i];
		child_ctx.each_value = list;
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$i(component, ctx) {
		var div, text, if_block_anchor;

		function onwindowpopstate(event) {
			component.popstate(event);	}
		window.addEventListener("popstate", onwindowpopstate);

		var each_value = ctx.steps;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(component, get_each_context$5(ctx, each_value, i));
		}

		var if_block = (ctx.$user.id != ctx.$authorId && ctx.$user.isAdmin) && create_if_block$e(component, ctx);

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text = createText("\n\n");
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
				div.className = "create-nav svelte-nols97";
				addLoc(div, file$h, 2, 0, 49);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				insert(target, text, anchor);
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.steps || changed.active) {
					each_value = ctx.steps;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$5(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$5(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (ctx.$user.id != ctx.$authorId && ctx.$user.isAdmin) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$e(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				window.removeEventListener("popstate", onwindowpopstate);

				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(text);
				}

				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (4:4) {#each steps as step,i}
	function create_each_block$5(component, ctx) {
		var editornavstep_updating = {};

		var editornavstep_initial_data = { index: ctx.i+1 };
		if (ctx.step  !== void 0) {
			editornavstep_initial_data.step = ctx.step ;
			editornavstep_updating.step = true;
		}
		if (ctx.steps  !== void 0) {
			editornavstep_initial_data.steps = ctx.steps ;
			editornavstep_updating.steps = true;
		}
		if (ctx.active  !== void 0) {
			editornavstep_initial_data.active = ctx.active ;
			editornavstep_updating.active = true;
		}
		var editornavstep = new EditorNavStep({
			root: component.root,
			store: component.store,
			data: editornavstep_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!editornavstep_updating.step && changed.step) {
					ctx.each_value[ctx.i] = childState.step = childState.step;

					newState.steps = ctx.steps;
				}

				if (!editornavstep_updating.steps && changed.steps) {
					newState.steps = childState.steps;
				}

				if (!editornavstep_updating.active && changed.active) {
					newState.active = childState.active;
				}
				component._set(newState);
				editornavstep_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			editornavstep._bind({ step: 1, steps: 1, active: 1 }, editornavstep.get());
		});

		editornavstep.on("select", function(event) {
			component.select(ctx.step, ctx.i);
		});

		return {
			c: function create() {
				editornavstep._fragment.c();
			},

			m: function mount(target, anchor) {
				editornavstep._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var editornavstep_changes = {};
				if (!editornavstep_updating.step && changed.steps) {
					editornavstep_changes.step = ctx.step ;
					editornavstep_updating.step = ctx.step  !== void 0;
				}
				if (!editornavstep_updating.steps && changed.steps) {
					editornavstep_changes.steps = ctx.steps ;
					editornavstep_updating.steps = ctx.steps  !== void 0;
				}
				if (!editornavstep_updating.active && changed.active) {
					editornavstep_changes.active = ctx.active ;
					editornavstep_updating.active = ctx.active  !== void 0;
				}
				editornavstep._set(editornavstep_changes);
				editornavstep_updating = {};
			},

			d: function destroy(detach) {
				editornavstep.destroy(detach);
			}
		};
	}

	// (9:0) {#if $user.id != $authorId && $user.isAdmin}
	function create_if_block$e(component, ctx) {
		var div, text0, a, text1, text2, a_href_value, text3;

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText("This chart belongs to\n    ");
				a = createElement("a");
				text1 = createText("User ");
				text2 = createText(ctx.$authorId);
				text3 = createText(". Great power comes with great responsibility, so be careful with what\n    you're doing!");
				a.target = "_blank";
				a.href = a_href_value = "/admin/chart/by/" + ctx.$authorId;
				addLoc(a, file$h, 11, 4, 371);
				div.className = "alert alert-warning";
				setStyle(div, "text-align", "center");
				setStyle(div, "margin-top", "10px");
				addLoc(div, file$h, 9, 0, 264);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				append(div, a);
				append(a, text1);
				append(a, text2);
				append(div, text3);
			},

			p: function update(changed, ctx) {
				if (changed.$authorId) {
					setData(text2, ctx.$authorId);
				}

				if ((changed.$authorId) && a_href_value !== (a_href_value = "/admin/chart/by/" + ctx.$authorId)) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function EditorNav(options) {
		var this$1 = this;

		this._debugName = '<EditorNav>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<EditorNav> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign(this.store._init(["user","authorId"]), data$g()), options.data);
		this.store._add(this, ["user","authorId"]);
		if (!('steps' in this._state)) { console.warn("<EditorNav> was created without expected data property 'steps'"); }
		if (!('active' in this._state)) { console.warn("<EditorNav> was created without expected data property 'active'"); }
		if (!('$user' in this._state)) { console.warn("<EditorNav> was created without expected data property '$user'"); }
		if (!('$authorId' in this._state)) { console.warn("<EditorNav> was created without expected data property '$authorId'"); }
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$i(this, this._state);

		this.root._oncreate.push(function () {
			oncreate$1.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(EditorNav.prototype, protoDev);
	assign(EditorNav.prototype, methods$a);

	EditorNav.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/FontStyle.html generated by Svelte v2.16.1 */



	function data$h() {
	    return {
	        value: {
	            bold: false,
	            italic: false,
	            underline: false,
	            wide: false,
	            color: '#000000',
	            background: '#ffffff',
	            fontSize: 13,
	            colorReset: false,
	            backgroundReset: false
	        },
	        indeterminate: {
	            bold: false,
	            italic: false,
	            underline: false,
	            wide: false,
	            color: false,
	            background: false,
	            fontSize: false
	        },
	        disabled: false,
	        disabled_msg: '',
	        width: '80px',
	        help: '',
	        placeholder: '',
	        underline: true,
	        spacing: false,
	        color: false,
	        fontSize: false,
	        fontSizePercent: false,
	        background: false,
	        defaultColor: 'transparent',
	        defaultBackground: 'transparent'
	    };
	}
	function oncreate$2() {
	    // fix default value for font size
	    var ref = this.get();
	    var fontSizePercent = ref.fontSizePercent;
	    var value = ref.value;
	    if (fontSizePercent && value.fontSize === 13) {
	        value.fontSize = 1;
	        this.set({ value: value });
	    }
	}
	var file$i = "node_modules/datawrapper/controls/FontStyle.html";

	function create_main_fragment$j(component, ctx) {
		var div, i0, basetogglebutton0_updating = {}, text0, i1, basetogglebutton1_updating = {}, text1, text2, if_block1_anchor, text3, text4, if_block4_anchor;

		var basetogglebutton0_initial_data = {
		 	disabled: ctx.disabled,
		 	indeterminate: ctx.indeterminate.bold
		 };
		if (ctx.value.bold !== void 0) {
			basetogglebutton0_initial_data.value = ctx.value.bold;
			basetogglebutton0_updating.value = true;
		}
		var basetogglebutton0 = new BaseToggleButton({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: basetogglebutton0_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!basetogglebutton0_updating.value && changed.value) {
					ctx.value.bold = childState.value;
					newState.value = ctx.value;
				}
				component._set(newState);
				basetogglebutton0_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			basetogglebutton0._bind({ value: 1 }, basetogglebutton0.get());
		});

		var basetogglebutton1_initial_data = {
		 	disabled: ctx.disabled,
		 	indeterminate: ctx.indeterminate.italic
		 };
		if (ctx.value.italic !== void 0) {
			basetogglebutton1_initial_data.value = ctx.value.italic;
			basetogglebutton1_updating.value = true;
		}
		var basetogglebutton1 = new BaseToggleButton({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: basetogglebutton1_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!basetogglebutton1_updating.value && changed.value) {
					ctx.value.italic = childState.value;
					newState.value = ctx.value;
				}
				component._set(newState);
				basetogglebutton1_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			basetogglebutton1._bind({ value: 1 }, basetogglebutton1.get());
		});

		var if_block0 = (ctx.underline) && create_if_block_4$2(component, ctx);

		var if_block1 = (ctx.spacing) && create_if_block_3$2(component, ctx);

		var if_block2 = (ctx.color) && create_if_block_2$2(component, ctx);

		var if_block3 = (ctx.background) && create_if_block_1$9(component, ctx);

		var if_block4 = (ctx.fontSize) && create_if_block$f(component, ctx);

		var controlgroup_initial_data = {
		 	width: ctx.width,
		 	type: "radio",
		 	valign: "baseline",
		 	label: ctx.label,
		 	disabled: ctx.disabled
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				i0 = createElement("i");
				basetogglebutton0._fragment.c();
				text0 = createText("\n        ");
				i1 = createElement("i");
				basetogglebutton1._fragment.c();
				text1 = createText("\n        ");
				if (if_block0) { if_block0.c(); }
				text2 = createText(" ");
				if (if_block1) { if_block1.c(); }
				if_block1_anchor = createComment();
				if (if_block2) { if_block2.c(); }
				text3 = createText(" ");
				if (if_block3) { if_block3.c(); }
				text4 = createText("\n    ");
				if (if_block4) { if_block4.c(); }
				if_block4_anchor = createComment();
				controlgroup._fragment.c();
				i0.className = "fa fa-fw fa-bold";
				addLoc(i0, file$i, 3, 12, 264);
				i1.className = "fa fa-fw fa-italic";
				addLoc(i1, file$i, 6, 12, 451);
				div.className = "btn-group svelte-l5q6v5 svelte-s620at";
				addLoc(div, file$i, 1, 4, 104);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);
				append(basetogglebutton0._slotted.default, i0);
				basetogglebutton0._mount(div, null);
				append(div, text0);
				append(basetogglebutton1._slotted.default, i1);
				basetogglebutton1._mount(div, null);
				append(div, text1);
				if (if_block0) { if_block0.m(div, null); }
				append(div, text2);
				if (if_block1) { if_block1.m(div, null); }
				append(div, if_block1_anchor);
				if (if_block2) { if_block2.m(div, null); }
				append(div, text3);
				if (if_block3) { if_block3.m(div, null); }
				append(controlgroup._slotted.default, text4);
				if (if_block4) { if_block4.m(controlgroup._slotted.default, null); }
				append(controlgroup._slotted.default, if_block4_anchor);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var basetogglebutton0_changes = {};
				if (changed.disabled) { basetogglebutton0_changes.disabled = ctx.disabled; }
				if (changed.indeterminate) { basetogglebutton0_changes.indeterminate = ctx.indeterminate.bold; }
				if (!basetogglebutton0_updating.value && changed.value) {
					basetogglebutton0_changes.value = ctx.value.bold;
					basetogglebutton0_updating.value = ctx.value.bold !== void 0;
				}
				basetogglebutton0._set(basetogglebutton0_changes);
				basetogglebutton0_updating = {};

				var basetogglebutton1_changes = {};
				if (changed.disabled) { basetogglebutton1_changes.disabled = ctx.disabled; }
				if (changed.indeterminate) { basetogglebutton1_changes.indeterminate = ctx.indeterminate.italic; }
				if (!basetogglebutton1_updating.value && changed.value) {
					basetogglebutton1_changes.value = ctx.value.italic;
					basetogglebutton1_updating.value = ctx.value.italic !== void 0;
				}
				basetogglebutton1._set(basetogglebutton1_changes);
				basetogglebutton1_updating = {};

				if (ctx.underline) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_4$2(component, ctx);
						if_block0.c();
						if_block0.m(div, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.spacing) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_3$2(component, ctx);
						if_block1.c();
						if_block1.m(div, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.color) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_2$2(component, ctx);
						if_block2.c();
						if_block2.m(div, text3);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (ctx.background) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block_1$9(component, ctx);
						if_block3.c();
						if_block3.m(div, null);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (ctx.fontSize) {
					if (if_block4) {
						if_block4.p(changed, ctx);
					} else {
						if_block4 = create_if_block$f(component, ctx);
						if_block4.c();
						if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				basetogglebutton0.destroy();
				basetogglebutton1.destroy();
				if (if_block0) { if_block0.d(); }
				if (if_block1) { if_block1.d(); }
				if (if_block2) { if_block2.d(); }
				if (if_block3) { if_block3.d(); }
				if (if_block4) { if_block4.d(); }
				controlgroup.destroy(detach);
			}
		};
	}

	// (9:8) {#if underline}
	function create_if_block_4$2(component, ctx) {
		var i, basetogglebutton_updating = {};

		var basetogglebutton_initial_data = {
		 	disabled: ctx.disabled,
		 	indeterminate: ctx.indeterminate.underline
		 };
		if (ctx.value.underline !== void 0) {
			basetogglebutton_initial_data.value = ctx.value.underline;
			basetogglebutton_updating.value = true;
		}
		var basetogglebutton = new BaseToggleButton({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: basetogglebutton_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!basetogglebutton_updating.value && changed.value) {
					ctx.value.underline = childState.value;
					newState.value = ctx.value;
				}
				component._set(newState);
				basetogglebutton_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			basetogglebutton._bind({ value: 1 }, basetogglebutton.get());
		});

		return {
			c: function create() {
				i = createElement("i");
				basetogglebutton._fragment.c();
				i.className = "fa fa-fw fa-underline";
				addLoc(i, file$i, 10, 12, 670);
			},

			m: function mount(target, anchor) {
				append(basetogglebutton._slotted.default, i);
				basetogglebutton._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var basetogglebutton_changes = {};
				if (changed.disabled) { basetogglebutton_changes.disabled = ctx.disabled; }
				if (changed.indeterminate) { basetogglebutton_changes.indeterminate = ctx.indeterminate.underline; }
				if (!basetogglebutton_updating.value && changed.value) {
					basetogglebutton_changes.value = ctx.value.underline;
					basetogglebutton_updating.value = ctx.value.underline !== void 0;
				}
				basetogglebutton._set(basetogglebutton_changes);
				basetogglebutton_updating = {};
			},

			d: function destroy(detach) {
				basetogglebutton.destroy(detach);
			}
		};
	}

	// (13:14) {#if spacing}
	function create_if_block_3$2(component, ctx) {
		var i, basetogglebutton_updating = {}, text;

		var basetogglebutton_initial_data = {
		 	disabled: ctx.disabled,
		 	indeterminate: ctx.indeterminate.wide
		 };
		if (ctx.value.wide !== void 0) {
			basetogglebutton_initial_data.value = ctx.value.wide;
			basetogglebutton_updating.value = true;
		}
		var basetogglebutton = new BaseToggleButton({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: basetogglebutton_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!basetogglebutton_updating.value && changed.value) {
					ctx.value.wide = childState.value;
					newState.value = ctx.value;
				}
				component._set(newState);
				basetogglebutton_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			basetogglebutton._bind({ value: 1 }, basetogglebutton.get());
		});

		return {
			c: function create() {
				i = createElement("i");
				basetogglebutton._fragment.c();
				text = createText("\n        ");
				i.className = "fa fa-text-width fa-fw ";
				setAttribute(i, "aria-hidden", "true");
				addLoc(i, file$i, 14, 12, 886);
			},

			m: function mount(target, anchor) {
				append(basetogglebutton._slotted.default, i);
				basetogglebutton._mount(target, anchor);
				insert(target, text, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var basetogglebutton_changes = {};
				if (changed.disabled) { basetogglebutton_changes.disabled = ctx.disabled; }
				if (changed.indeterminate) { basetogglebutton_changes.indeterminate = ctx.indeterminate.wide; }
				if (!basetogglebutton_updating.value && changed.value) {
					basetogglebutton_changes.value = ctx.value.wide;
					basetogglebutton_updating.value = ctx.value.wide !== void 0;
				}
				basetogglebutton._set(basetogglebutton_changes);
				basetogglebutton_updating = {};
			},

			d: function destroy(detach) {
				basetogglebutton.destroy(detach);
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (17:13) {#if color}
	function create_if_block_2$2(component, ctx) {
		var button, i, text, div, colorpicker_updating = {};

		var colorpicker_initial_data = {
		 	disabled: ctx.disabled,
		 	reset: ctx.colorReset
		 };
		if (ctx.value.color !== void 0) {
			colorpicker_initial_data.color = ctx.value.color;
			colorpicker_updating.color = true;
		}
		var colorpicker = new ColorPicker({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: colorpicker_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!colorpicker_updating.color && changed.color) {
					ctx.value.color = childState.color;
					newState.value = ctx.value;
				}
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			colorpicker._bind({ color: 1 }, colorpicker.get());
		});

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text = createText("\n                ");
				div = createElement("div");
				colorpicker._fragment.c();
				i.className = "fa fa-font fa-fw svelte-s620at";
				setAttribute(i, "aria-hidden", "true");
				addLoc(i, file$i, 19, 16, 1175);
				div.className = "color-bar svelte-s620at";
				setStyle(div, "background", (ctx.value.color ? ctx.value.color : ctx.defaultColor));
				addLoc(div, file$i, 20, 16, 1243);
				button.disabled = ctx.disabled;
				button.className = "btn-color btn btn-s svelte-s620at";
				addLoc(button, file$i, 18, 12, 1100);
			},

			m: function mount(target, anchor) {
				append(colorpicker._slotted.default, button);
				append(button, i);
				append(button, text);
				append(button, div);
				colorpicker._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.value || changed.defaultColor) {
					setStyle(div, "background", (ctx.value.color ? ctx.value.color : ctx.defaultColor));
				}

				if (changed.disabled) {
					button.disabled = ctx.disabled;
				}

				var colorpicker_changes = {};
				if (changed.disabled) { colorpicker_changes.disabled = ctx.disabled; }
				if (changed.colorReset) { colorpicker_changes.reset = ctx.colorReset; }
				if (!colorpicker_updating.color && changed.value) {
					colorpicker_changes.color = ctx.value.color;
					colorpicker_updating.color = ctx.value.color !== void 0;
				}
				colorpicker._set(colorpicker_changes);
				colorpicker_updating = {};
			},

			d: function destroy(detach) {
				colorpicker.destroy(detach);
			}
		};
	}

	// (24:14) {#if background}
	function create_if_block_1$9(component, ctx) {
		var button, svg, path, text, div, colorpicker_updating = {};

		var colorpicker_initial_data = {
		 	disabled: ctx.disabled,
		 	reset: ctx.backgroundReset
		 };
		if (ctx.value.background !== void 0) {
			colorpicker_initial_data.color = ctx.value.background;
			colorpicker_updating.color = true;
		}
		var colorpicker = new ColorPicker({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: colorpicker_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!colorpicker_updating.color && changed.color) {
					ctx.value.background = childState.color;
					newState.value = ctx.value;
				}
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			colorpicker._bind({ color: 1 }, colorpicker.get());
		});

		return {
			c: function create() {
				button = createElement("button");
				svg = createSvgElement("svg");
				path = createSvgElement("path");
				text = createText("\n                ");
				div = createElement("div");
				colorpicker._fragment.c();
				setAttribute(path, "d", "M21.143 9.667c-.733-1.392-1.914-3.05-3.617-4.753-2.977-2.978-5.478-3.914-6.785-3.914-.414 0-.708.094-.86.246l-1.361 1.36c-1.899-.236-3.42.106-4.294.983-.876.875-1.164 2.159-.792 3.523.492 1.806 2.305 4.049 5.905 5.375.038.323.157.638.405.885.588.588 1.535.586 2.121 0s.588-1.533.002-2.119c-.588-.587-1.537-.588-2.123-.001l-.17.256c-2.031-.765-3.395-1.828-4.232-2.9l3.879-3.875c.496 2.73 6.432 8.676 9.178 9.178l-7.115 7.107c-.234.153-2.798-.316-6.156-3.675-3.393-3.393-3.175-5.271-3.027-5.498l1.859-1.856c-.439-.359-.925-1.103-1.141-1.689l-2.134 2.131c-.445.446-.685 1.064-.685 1.82 0 1.634 1.121 3.915 3.713 6.506 2.764 2.764 5.58 4.243 7.432 4.243.648 0 1.18-.195 1.547-.562l8.086-8.078c.91.874-.778 3.538-.778 4.648 0 1.104.896 1.999 2 1.999 1.105 0 2-.896 2-2 0-3.184-1.425-6.81-2.857-9.34zm-16.209-5.371c.527-.53 1.471-.791 2.656-.761l-3.209 3.206c-.236-.978-.049-1.845.553-2.445zm9.292 4.079l-.03-.029c-1.292-1.292-3.803-4.356-3.096-5.063.715-.715 3.488 1.521 5.062 3.096.862.862 2.088 2.247 2.937 3.458-1.717-1.074-3.491-1.469-4.873-1.462z");
				addLoc(path, file$i, 27, 20, 1704);
				setAttribute(svg, "xmlns", "http://www.w3.org/2000/svg");
				setAttribute(svg, "width", "18");
				setAttribute(svg, "height", "14");
				setAttribute(svg, "viewBox", "0 0 24 24");
				addLoc(svg, file$i, 26, 16, 1600);
				div.className = "color-bar svelte-s620at";
				setStyle(div, "background", (ctx.value.background ? ctx.value.background : ctx.defaultBackground));
				addLoc(div, file$i, 31, 16, 2847);
				button.disabled = ctx.disabled;
				button.className = "btn-color btn btn-s svelte-s620at";
				addLoc(button, file$i, 25, 12, 1525);
			},

			m: function mount(target, anchor) {
				append(colorpicker._slotted.default, button);
				append(button, svg);
				append(svg, path);
				append(button, text);
				append(button, div);
				colorpicker._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.value || changed.defaultBackground) {
					setStyle(div, "background", (ctx.value.background ? ctx.value.background : ctx.defaultBackground));
				}

				if (changed.disabled) {
					button.disabled = ctx.disabled;
				}

				var colorpicker_changes = {};
				if (changed.disabled) { colorpicker_changes.disabled = ctx.disabled; }
				if (changed.backgroundReset) { colorpicker_changes.reset = ctx.backgroundReset; }
				if (!colorpicker_updating.color && changed.value) {
					colorpicker_changes.color = ctx.value.background;
					colorpicker_updating.color = ctx.value.background !== void 0;
				}
				colorpicker._set(colorpicker_changes);
				colorpicker_updating = {};
			},

			d: function destroy(detach) {
				colorpicker.destroy(detach);
			}
		};
	}

	// (37:4) {#if fontSize}
	function create_if_block$f(component, ctx) {
		var basenumber_updating = {};

		var basenumber_initial_data = {
		 	width: ctx.fontSizePercent ? '43px' : '30px',
		 	slider: false,
		 	disabled: ctx.disabled,
		 	unit: ctx.fontSizePercent ? '%' : 'px',
		 	step: ctx.fontSizePercent ? 0.01 : 1,
		 	multiply: ctx.fontSizePercent ? 100 : 1,
		 	min: "0",
		 	max: ctx.fontSizePercent ? 5 : 50
		 };
		if (ctx.value.fontSize !== void 0) {
			basenumber_initial_data.value = ctx.value.fontSize;
			basenumber_updating.value = true;
		}
		var basenumber = new BaseNumber({
			root: component.root,
			store: component.store,
			data: basenumber_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!basenumber_updating.value && changed.value) {
					ctx.value.fontSize = childState.value;
					newState.value = ctx.value;
				}
				component._set(newState);
				basenumber_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			basenumber._bind({ value: 1 }, basenumber.get());
		});

		return {
			c: function create() {
				basenumber._fragment.c();
			},

			m: function mount(target, anchor) {
				basenumber._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var basenumber_changes = {};
				if (changed.fontSizePercent) { basenumber_changes.width = ctx.fontSizePercent ? '43px' : '30px'; }
				if (changed.disabled) { basenumber_changes.disabled = ctx.disabled; }
				if (changed.fontSizePercent) { basenumber_changes.unit = ctx.fontSizePercent ? '%' : 'px'; }
				if (changed.fontSizePercent) { basenumber_changes.step = ctx.fontSizePercent ? 0.01 : 1; }
				if (changed.fontSizePercent) { basenumber_changes.multiply = ctx.fontSizePercent ? 100 : 1; }
				if (changed.fontSizePercent) { basenumber_changes.max = ctx.fontSizePercent ? 5 : 50; }
				if (!basenumber_updating.value && changed.value) {
					basenumber_changes.value = ctx.value.fontSize;
					basenumber_updating.value = ctx.value.fontSize !== void 0;
				}
				basenumber._set(basenumber_changes);
				basenumber_updating = {};
			},

			d: function destroy(detach) {
				basenumber.destroy(detach);
			}
		};
	}

	function FontStyle(options) {
		var this$1 = this;

		this._debugName = '<FontStyle>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$h(), options.data);
		if (!('width' in this._state)) { console.warn("<FontStyle> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<FontStyle> was created without expected data property 'label'"); }
		if (!('disabled' in this._state)) { console.warn("<FontStyle> was created without expected data property 'disabled'"); }
		if (!('indeterminate' in this._state)) { console.warn("<FontStyle> was created without expected data property 'indeterminate'"); }
		if (!('value' in this._state)) { console.warn("<FontStyle> was created without expected data property 'value'"); }
		if (!('underline' in this._state)) { console.warn("<FontStyle> was created without expected data property 'underline'"); }
		if (!('spacing' in this._state)) { console.warn("<FontStyle> was created without expected data property 'spacing'"); }
		if (!('color' in this._state)) { console.warn("<FontStyle> was created without expected data property 'color'"); }
		if (!('colorReset' in this._state)) { console.warn("<FontStyle> was created without expected data property 'colorReset'"); }
		if (!('defaultColor' in this._state)) { console.warn("<FontStyle> was created without expected data property 'defaultColor'"); }
		if (!('background' in this._state)) { console.warn("<FontStyle> was created without expected data property 'background'"); }
		if (!('backgroundReset' in this._state)) { console.warn("<FontStyle> was created without expected data property 'backgroundReset'"); }
		if (!('defaultBackground' in this._state)) { console.warn("<FontStyle> was created without expected data property 'defaultBackground'"); }
		if (!('fontSize' in this._state)) { console.warn("<FontStyle> was created without expected data property 'fontSize'"); }
		if (!('fontSizePercent' in this._state)) { console.warn("<FontStyle> was created without expected data property 'fontSizePercent'"); }
		this._intro = true;

		this._fragment = create_main_fragment$j(this, this._state);

		this.root._oncreate.push(function () {
			oncreate$2.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(FontStyle.prototype, protoDev);

	FontStyle.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Gradient.html generated by Svelte v2.16.1 */

	function data$i() {
	    return {
	        id: '',
	        width: 105,
	        height: 22,
	        canDelete: false,
	        stops: []
	    };
	}
	function oncreate$3() {
	    this.set({
	        id: 'gradient-' + Math.floor(Math.random() * 1e6).toString(36)
	    });
	}
	var file$j = "node_modules/datawrapper/controls/Gradient.html";

	function get_each_context$6(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.stop = list[i];
		return child_ctx;
	}

	function create_main_fragment$k(component, ctx) {
		var svg, defs, linearGradient, rect, text, if_block_anchor;

		var each_value = ctx.stops;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$6(component, get_each_context$6(ctx, each_value, i));
		}

		var if_block = (ctx.canDelete) && create_if_block$g();

		return {
			c: function create() {
				svg = createSvgElement("svg");
				defs = createSvgElement("defs");
				linearGradient = createSvgElement("linearGradient");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				rect = createSvgElement("rect");
				text = createText("\n");
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
				setAttribute(linearGradient, "id", ctx.id);
				setAttribute(linearGradient, "x2", "1");
				addLoc(linearGradient, file$j, 2, 8, 59);
				addLoc(defs, file$j, 1, 4, 44);
				setStyle(rect, "fill", "url(#" + ctx.id + ")");
				setAttribute(rect, "width", ctx.width);
				setAttribute(rect, "height", ctx.height);
				addLoc(rect, file$j, 8, 4, 277);
				setAttribute(svg, "width", ctx.width);
				setAttribute(svg, "height", ctx.height);
				setAttribute(svg, "class", "svelte-1m40moe");
				addLoc(svg, file$j, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, svg, anchor);
				append(svg, defs);
				append(defs, linearGradient);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(linearGradient, null);
				}

				append(svg, rect);
				insert(target, text, anchor);
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.stops) {
					each_value = ctx.stops;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$6(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$6(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(linearGradient, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (changed.id) {
					setAttribute(linearGradient, "id", ctx.id);
					setStyle(rect, "fill", "url(#" + ctx.id + ")");
				}

				if (changed.width) {
					setAttribute(rect, "width", ctx.width);
				}

				if (changed.height) {
					setAttribute(rect, "height", ctx.height);
				}

				if (changed.width) {
					setAttribute(svg, "width", ctx.width);
				}

				if (changed.height) {
					setAttribute(svg, "height", ctx.height);
				}

				if (ctx.canDelete) {
					if (!if_block) {
						if_block = create_if_block$g();
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
					detachNode(svg);
				}

				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(text);
				}

				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (4:12) {#each stops as stop}
	function create_each_block$6(component, ctx) {
		var stop, stop_offset_value, stop_stop_color_value;

		return {
			c: function create() {
				stop = createSvgElement("stop");
				setAttribute(stop, "offset", stop_offset_value = "" + (ctx.stop.offset*100).toFixed(2) + "%");
				setAttribute(stop, "stop-color", stop_stop_color_value = ctx.stop.color);
				addLoc(stop, file$j, 4, 12, 139);
			},

			m: function mount(target, anchor) {
				insert(target, stop, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.stops) && stop_offset_value !== (stop_offset_value = "" + (ctx.stop.offset*100).toFixed(2) + "%")) {
					setAttribute(stop, "offset", stop_offset_value);
				}

				if ((changed.stops) && stop_stop_color_value !== (stop_stop_color_value = ctx.stop.color)) {
					setAttribute(stop, "stop-color", stop_stop_color_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(stop);
				}
			}
		};
	}

	// (11:0) {#if canDelete}
	function create_if_block$g(component, ctx) {
		var button, i;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				i.className = "fa fa-fw fa-trash svelte-1m40moe";
				addLoc(i, file$j, 12, 4, 412);
				button.className = "btn btn-mini btn-delete svelte-1m40moe";
				addLoc(button, file$j, 11, 0, 367);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}
			}
		};
	}

	function Gradient(options) {
		var this$1 = this;

		this._debugName = '<Gradient>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$i(), options.data);
		if (!('width' in this._state)) { console.warn("<Gradient> was created without expected data property 'width'"); }
		if (!('height' in this._state)) { console.warn("<Gradient> was created without expected data property 'height'"); }
		if (!('id' in this._state)) { console.warn("<Gradient> was created without expected data property 'id'"); }
		if (!('stops' in this._state)) { console.warn("<Gradient> was created without expected data property 'stops'"); }
		if (!('canDelete' in this._state)) { console.warn("<Gradient> was created without expected data property 'canDelete'"); }
		this._intro = true;

		this._fragment = create_main_fragment$k(this, this._state);

		this.root._oncreate.push(function () {
			oncreate$3.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Gradient.prototype, protoDev);

	Gradient.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/GradientEditor.html generated by Svelte v2.16.1 */



	var app;

	function presets(ref) {
	    var themePresets = ref.themePresets;
	    var userPresets = ref.userPresets;

	    return themePresets.concat(userPresets);
	}
	function activeColors(ref) {
	    var colors = ref.colors;
	    var dragging = ref.dragging;
	    var wouldDelete = ref.wouldDelete;

	    return colors
	        .filter(function (color) {
	            return !wouldDelete || dragging !== color;
	        })
	        .sort(function (a, b) { return a.position - b.position; });
	}
	function selectedPreset(ref) {
	    var stops = ref.stops;

	    var colors = stops.map(function (c) { return c.color; });
	    return Object.assign({}, {value: colors},
	        presetAttributes(colors));
	}
	function scale(ref) {
	    var activeColors = ref.activeColors;

	    var colors = activeColors.slice(0);
	    if (colors.length) {
	        if (colors[0].position > 0)
	            { colors.unshift({
	                position: 0,
	                color: colors[0].color
	            }); }
	        if (colors[colors.length - 1].position < 1)
	            { colors.push({
	                position: 1,
	                color: colors[colors.length - 1].color
	            }); }
	    }
	    return chroma.scale(colors.map(function (c) { return c.color; })).domain(colors.map(function (c) { return c.position; }));
	}
	function presetOptions(ref) {
	    var presets = ref.presets;
	    var themePresets = ref.themePresets;

	    return presets.map(function (colors, i) {
	        return Object.assign({}, {value: colors},
	            presetAttributes(colors, i >= themePresets.length));
	    });
	}
	function stops(ref) {
	    var scale = ref.scale;

	    var num = 80;
	    return scale.colors(num, 'hex').map(function (color, i) {
	        return {
	            color: color,
	            offset: i / (num - 1)
	        };
	    });
	}
	function ticks(ref) {
	    var colors = ref.colors;

	    return colors.map(function (color, i) { return i / (colors.length - 1); });
	}
	function classColors(ref) {
	    var scale = ref.scale;
	    var colors = ref.colors;
	    var classes = ref.classes;

	    if (!classes || !colors.length) { return []; }
	    var out = [];
	    for (var i = 0; i < classes; i++) {
	        out.push({
	            position: i / (classes - 1),
	            color: scale(i / (classes - 1)).hex()
	        });
	    }
	    return out;
	}
	function isMonotone(ref) {
	    var colors = ref.colors;
	    var scale = ref.scale;

	    var numColors = colors.length;
	    if (numColors < 3) { return true; }
	    var sample = scale.colors(colors.length, null);
	    var sampleL = sample.map(function (s) { return s.get('lab.l'); });
	    return sampleL.reduce(checkMonotone, true);
	}
	function isDiverging(ref) {
	    var colors = ref.colors;
	    var scale = ref.scale;

	    var numColors = colors.length;
	    if (numColors < 3) { return false; }
	    var sample = scale.colors(colors.length, null);
	    var sampleL = sample.map(function (s) { return s.get('lab.l'); });
	    if (sampleL.reduce(checkMonotone, true)) { return false; }
	    return (
	        sampleL.slice(0, Math.ceil(numColors * 0.5)).reduce(checkMonotone, true) &&
	        sampleL.slice(Math.floor(numColors * 0.5)).reduce(checkMonotone, true)
	    );
	}
	function lightnessFixable(ref) {
	    var isMonotone = ref.isMonotone;
	    var isDiverging = ref.isDiverging;

	    return isMonotone || isDiverging;
	}
	function data$j() {
	    return {
	        // public properties
	        label: '',
	        colors: [],
	        width: 318,
	        classes: 0,
	        themePresets: [],
	        userPresets: [],
	        // private
	        editIndex: -1,
	        editColor: '',
	        customize: false,
	        editPosition: 0,
	        colorOpen: false,
	        help: '',
	        wouldDelete: false,
	        dragging: false,
	        dragStartAt: 0,
	        gotIt: false,
	        focus: false,
	        mouseOverGradient: false,
	        mouseX: 0,
	        undoStack: [],
	        redoStack: []
	    };
	}
	var menuItems = [
	    [
	        {
	            icon: '<i class="fa fa-undo fa-fw"></i>',
	            label: __('controls / gradient-editor / undo', 'core'),
	            action: function action() {
	                app.undo();
	            },
	            disabled: function disabled(ref) {
	                var undoStack = ref.undoStack;

	                return undoStack.length === 0;
	            }
	        },
	        {
	            icon: '<i class="fa fa-undo fa-flip-horizontal fa-fw"></i>',
	            label: __('controls / gradient-editor / redo', 'core'),
	            action: function action() {
	                app.redo();
	            },
	            disabled: function disabled(ref) {
	                var redoStack = ref.redoStack;

	                return redoStack.length === 0;
	            }
	        }
	    ],
	    [
	        {
	            icon: '<i class="fa fa-random fa-fw"></i>',
	            label: __('controls / gradient-editor / reverse', 'core'),
	            action: function action() {
	                app.reverse();
	            }
	        }
	    ],
	    [
	        {
	            icon: '<i class="im im-wizard"></i> ',
	            label: __('controls / gradient-editor / autocorrect', 'core'),
	            action: function action() {
	                app.autoCorrect();
	            },
	            disabled: function disabled(ref) {
	                var lightnessFixable = ref.lightnessFixable;

	                return !lightnessFixable;
	            }
	        },
	        {
	            icon: '<i class="contrast-up"></i> <span>+</span> ',
	            label: __('controls / gradient-editor / contrast-up', 'core'),
	            action: function action() {
	                app.contrastUp();
	            },
	            disabled: function disabled(ref) {
	                var lightnessFixable = ref.lightnessFixable;

	                return !lightnessFixable;
	            }
	        },
	        {
	            icon: '<i class="contrast-down"></i> <span>−</span>',
	            label: __('controls / gradient-editor / contrast-down', 'core'),
	            action: function action() {
	                app.contrastDown();
	            },
	            disabled: function disabled(ref) {
	                var lightnessFixable = ref.lightnessFixable;

	                return !lightnessFixable;
	            }
	        }
	    ],
	    [
	        {
	            icon: '<i class="im im-floppy-disk"></i> ',
	            label: __('controls / gradient-editor / save', 'core'),
	            action: function action() {
	                app.savePreset();
	            }
	        },
	        {
	            icon: '<i class="im im-sign-in"></i> ',
	            label: __('controls / gradient-editor / import', 'core'),
	            action: function action() {
	                var colors = window.prompt(__('controls / gradient-editor / import / text', 'core')).split(/[, ]+/);
	                app.select(colors);
	            }
	        },
	        {
	            icon: '<i class="im im-sign-out"></i> ',
	            label: __('controls / gradient-editor / export', 'core'),
	            action: function action() {
	                var ref = app.get();
	                var colors = ref.colors;
	                window.prompt(__('controls / gradient-editor / export / text', 'core'), colors.map(function (c) { return c.color; }));
	            }
	        }
	    ]
	];

	function isDisabled(item, state) {
	    return item.disabled ? item.disabled(state) : false;
	}
	var methods$b = {
	    select: function select(preset) {
	        this.set({
	            dragging: false,
	            wouldDelete: false,
	            colors:
	                typeof preset[0] === 'string'
	                    ? preset.map(function (color, i) {
	                          return {
	                              color: color,
	                              position: i / (preset.length - 1)
	                          };
	                      })
	                    : clone(preset)
	            // selectedPreset: preset
	        });
	    },
	    handleChange: function handleChange(ref) {
	        var event = ref.event;
	        var value = ref.value;

	        // this is a wrapper around select() to detect when a user
	        // presses the delete button next to a user preset in the dropdown
	        if (event.target.classList.contains('btn-delete')) {
	            var ref$1 = this.get();
	            var userPresets = ref$1.userPresets;
	            userPresets.splice(userPresets.indexOf(value), 1);
	            if (window.dw && window.dw.backend && window.dw.backend.setUserData) {
	                window.dw.backend.setUserData('gradienteditor-presets', JSON.stringify(userPresets));
	            }
	            this.set({ userPresets: userPresets });
	        } else {
	            this.select(value);
	        }
	    },
	    saveState: function saveState() {
	        var ref = this.get();
	        var colors = ref.colors;
	        var undoStack = ref.undoStack;
	        undoStack.push(clone(colors));
	        this.set({ undoStack: undoStack });
	    },
	    undo: function undo() {
	        var ref = this.get();
	        var undoStack = ref.undoStack;
	        var redoStack = ref.redoStack;
	        var colors = ref.colors;
	        redoStack.push(clone(colors));
	        var last = undoStack.pop();
	        this.set({ colors: last, undoStack: undoStack });
	    },
	    redo: function redo() {
	        var ref = this.get();
	        var colors = ref.colors;
	        var undoStack = ref.undoStack;
	        var redoStack = ref.redoStack;
	        var last = redoStack.pop();
	        undoStack.push(clone(colors));
	        this.set({ colors: last, redoStack: redoStack });
	    },
	    reverse: function reverse() {
	        this.saveState();
	        var ref = this.get();
	        var colors = ref.colors;
	        colors.forEach(function (c) { return (c.position = 1 - c.position); });
	        colors.reverse();
	        this.set({ colors: colors });
	    },
	    contrastUp: function contrastUp() {
	        this.saveState();
	        var ref = this.get();
	        var colors = ref.colors;
	        var scale = ref.scale;
	        var isMonotone = ref.isMonotone;
	        var numColors = colors.length;
	        colors = scale.padding(-0.05).colors(numColors + 2, null);
	        var centerL = colors[Math.floor(numColors * 0.5)].luminance();
	        [0, numColors + 1].forEach(function (pos) {
	            var darker = colors[pos].luminance() < centerL;
	            colors[pos] = colors[pos].brighten(darker ? -0.5 : 0.5);
	        });
	        this.select(colors.map(function (c) { return c.hex(); }));
	        this.autoCorrect(Math.min(7, numColors + (isMonotone ? 1 : 2)));
	    },
	    contrastDown: function contrastDown() {
	        this.saveState();
	        var ref = this.get();
	        var colors = ref.colors;
	        var scale = ref.scale;
	        var isDiverging = ref.isDiverging;
	        var numColors = colors.length;

	        colors = scale.padding(0.03).colors(numColors, 'hex');
	        this.select(colors);
	        this.autoCorrect(Math.max(isDiverging ? 5 : 2, numColors - (isDiverging ? 2 : 1)));
	    },
	    autoCorrect: function autoCorrect(forceNumColors) {
	        if (!forceNumColors) { this.saveState(); }
	        var ref = this.get();
	        var colors = ref.colors;
	        var scale = ref.scale;
	        var isMonotone = ref.isMonotone;
	        var isDiverging = ref.isDiverging;
	        var numColors = forceNumColors || colors.length;
	        if (forceNumColors === 2) {
	            return this.select([colors[0].color, colors[colors.length - 1].color]);
	        }
	        if (numColors < 3) { return; }

	        var sample = scale.colors(numColors);
	        var sampleL = sample.map(function (s) { return chroma(s).get('lab.l'); });
	        // no need to autoCorrect if not monotone or diverging
	        if (!isMonotone && !isDiverging) { return; }

	        if (isDiverging) {
	            // autoCorrect lightness left and right
	            for (var i = 0; i < numColors * 0.5; i++) {
	                var avgL = 0.5 * (sampleL[i] + sampleL[numColors - 1 - i]);
	                sample[i] = chroma(sample[i])
	                    .set('lab.l', avgL)
	                    .hex();
	                sample[numColors - 1 - i] = chroma(sample[numColors - 1 - i])
	                    .set('lab.l', avgL)
	                    .hex();
	            }
	        } else {
	            sample = chroma
	                .scale(scale.correctLightness())
	                .gamma(sampleL[0] < sampleL[1] ? 0.73 : 1.3)
	                .colors(numColors, 'hex');
	        }
	        this.select(sample);
	    },
	    savePreset: function savePreset() {
	        var ref = this.get();
	        var userPresets = ref.userPresets;
	        var colors = ref.colors;
	        userPresets.push(colors);
	        if (window.dw && window.dw.backend && window.dw.backend.setUserData) {
	            window.dw.backend.setUserData('gradienteditor-presets', JSON.stringify(userPresets));
	        }
	        this.set({ userPresets: userPresets });
	    },
	    swatchClick: function swatchClick(color, index) {
	        var ref = this.get();
	        var dragging = ref.dragging;
	        var colorOpen = ref.colorOpen;
	        if (dragging) { return; }
	        if (colorOpen) {
	            this.focus(color);
	            return this.closePicker();
	        }
	        this.set({
	            editIndex: index,
	            editColor: color.color,
	            editPosition: color.position,
	            colorOpen: true
	        });
	    },
	    closePicker: function closePicker() {
	        this.set({
	            editIndex: -1,
	            editColor: '',
	            colorOpen: false,
	            editPosition: 0
	        });
	    },
	    dragStart: function dragStart(event, item, index) {
	        this.saveState();
	        var bbox = this.refs.gradient.getBoundingClientRect();
	        this.set({
	            dragging: item,
	            wouldDelete: false,
	            dragStartAt: new Date().getTime(),
	            dragStartPos: event.clientX,
	            dragStartDelta: item.position - Math.max(0, Math.min(1, (event.clientX - bbox.left) / bbox.width))
	        });
	    },
	    handleMouseMove: function handleMouseMove(event) {
	        var ref = this.get();
	        var dragging = ref.dragging;
	        var colors = ref.colors;
	        var dragStartAt = ref.dragStartAt;
	        var dragStartPos = ref.dragStartPos;
	        var dragStartDelta = ref.dragStartDelta;
	        var ticks = ref.ticks;
	        var delay = new Date().getTime() - dragStartAt;
	        var distance = Math.abs(dragStartPos - event.clientX);

	        if (dragging && (delay > 300 || distance > 5)) {
	            var bbox = this.refs.gradient.getBoundingClientRect();
	            dragging.position = +(dragStartDelta + Math.max(0, Math.min(1, (event.clientX - bbox.left) / bbox.width))).toFixed(4);
	            var closest = ticks.sort(function (a, b) { return Math.abs(a - dragging.position) - Math.abs(b - dragging.position); })[0];
	            if (!event.shiftKey && Math.abs(closest - dragging.position) < 0.015) { dragging.position = closest; }
	            var wouldDelete = Math.abs(event.clientY - bbox.top) > 20 && colors.length > 2;
	            this.set({ colors: colors, wouldDelete: wouldDelete });
	        }
	    },
	    handleMouseUp: function handleMouseUp(event) {
	        var this$1 = this;

	        var ref = this.get();
	        var dragging = ref.dragging;
	        var wouldDelete = ref.wouldDelete;
	        var dragStartPos = ref.dragStartPos;
	        var dragStartAt = ref.dragStartAt;
	        var delay = new Date().getTime() - dragStartAt;
	        var distance = Math.abs(dragStartPos - event.clientX);
	        if ((dragging && delay > 300) || distance > 5) {
	            setTimeout(function () {
	                this$1.set({ dragging: false, wouldDelete: false });
	            });
	            event.preventDefault();
	            var ref$1 = this.get();
	            var colors = ref$1.colors;
	            if (wouldDelete && colors.length > 2) {
	                // remove color
	                colors.splice(colors.indexOf(dragging), 1);
	                this.set({ colors: colors });
	            }
	            this.sortColors();
	        } else {
	            this.set({ dragging: false, wouldDelete: false });
	        }
	        this.focus(dragging);
	    },
	    focus: function focus(color) {
	        var ref = this.get();
	        var colors = ref.colors;
	        var index = colors.indexOf(color);
	        if (index > -1) {
	            this.set({ focus: color });
	            this.refs.swatches.querySelector(("a:nth-child(" + (index + 1) + ") path")).focus();
	        }
	    },
	    closeHelp: function closeHelp() {
	        this.set({ gotIt: true });
	        if (window.dw && window.dw.backend && window.dw.backend.setUserData) {
	            window.dw.backend.setUserData('gradienteditor-help', 1);
	        }
	    },
	    handleGradientClick: function handleGradientClick(event) {
	        // add new color stop to gradient
	        var ref = this.get();
	        var dragging = ref.dragging;
	        var scale = ref.scale;
	        var colors = ref.colors;
	        if (!dragging) {
	            var bbox = this.refs.gradient.getBoundingClientRect();
	            var position = Math.max(0, Math.min(1, (event.clientX - bbox.left) / bbox.width));
	            var color = scale(position).hex();
	            colors.push({ color: color, position: position });
	            this.set({ colors: colors });
	            this.sortColors();
	        }
	    },
	    sortColors: function sortColors() {
	        var ref = this.get();
	        var colors = ref.colors;
	        var sorted = colors.sort(function (a, b) { return a.position - b.position; });
	        this.set({ colors: sorted });
	    },
	    handleGradientMouseMove: function handleGradientMouseMove(event) {
	        // set mouse Xpgosition
	        var bbox = this.refs.gradient.getBoundingClientRect();
	        this.set({ mouseX: event.clientX - bbox.left });
	    },
	    handleKeyDown: function handleKeyDown(event) {
	        var ref = this.get();
	        var focus = ref.focus;
	        var colors = ref.colors;
	        var width = ref.width;
	        if (focus && (event.keyCode === 37 || event.keyCode === 39)) {
	            focus.position = +(focus.position + (1 / width) * (event.shiftKey ? 10 : 1) * (event.keyCode === 37 ? -1 : 1)).toFixed(5);
	            this.set({ colors: colors });
	        }
	        if (focus && event.keyCode === 46 && colors.length > 2) {
	            colors.splice(colors.indexOf(focus), 1);
	            this.set({ colors: colors });
	        }
	        if (focus && event.keyCode === 61) {
	            var ref$1 = this.get();
	            var scale = ref$1.scale;
	            var i = colors.indexOf(focus);
	            if (i === colors.length - 1) { i--; }
	            var insertAt = (colors[i].position + colors[i + 1].position) * 0.5;
	            var inserted = {
	                position: insertAt,
	                color: scale(insertAt).hex()
	            };
	            colors.splice(i + 1, 0, inserted);
	            this.set({ colors: colors });
	        }
	    },
	    action: function action(item) {
	        item.action();
	    }
	};

	function oncreate$4() {
	    if (window.dw && window.dw.backend && window.dw.backend.__userData) {
	        this.set({
	            gotIt: window.dw.backend.__userData['gradienteditor-help'] || false,
	            userPresets: JSON.parse(window.dw.backend.__userData['gradienteditor-presets'] || '[]')
	        });
	    }
	    var ref = this.get();
	    var presets = ref.presets;
	    var colors = ref.colors;
	    app = this;
	    if (!colors.length) {
	        this.select(presets[0]);
	    }
	}
	function onstate$1(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.editColor && current.editColor) {
	        current.colors[current.editIndex].color = current.editColor;
	        this.set({ colors: current.colors });
	    }
	}
	function checkMonotone(acc, cur, idx, a) {
	    return acc && (idx ? (a[1] > a[0] ? a[idx] > a[idx - 1] : a[idx] < a[idx - 1]) : true);
	}

	function presetAttributes(colors, isUserPreset) {
	    if (!colors.length)
	        { return {
	            stops: []
	        }; }
	    var color = chroma
	        .scale(typeof colors[0] === 'string' ? colors : colors.map(function (c) { return c.color; }))
	        .domain(typeof colors[0] === 'string' ? [0, 10] : colors.map(function (c) { return c.position * 10; }))
	        .mode('lab');
	    return {
	        stops: [0, 2, 4, 5, 6, 8, 10].map(function (i) {
	            return { offset: i / 10, color: color(i).hex() };
	        }),
	        canDelete: isUserPreset
	    };
	}

	var file$k = "node_modules/datawrapper/controls/GradientEditor.html";

	function click_handler_1$1(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.action(ctx.item);
	}

	function get_each_context$7(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function get_each4_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.group = list[i];
		return child_ctx;
	}

	function get_each3_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.cl = list[i];
		return child_ctx;
	}

	function get_each2_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.value = list[i];
		return child_ctx;
	}

	function focusin_handler(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.set({focus:ctx.c});
	}

	function click_handler$4(event) {
		event.preventDefault();
		event.stopPropagation();
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.swatchClick(ctx.c,ctx.i);
	}

	function mousedown_handler(event) {
		event.preventDefault();
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.dragStart(event, ctx.c, ctx.i);
	}

	function get_each1_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.c = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.stop = list[i];
		return child_ctx;
	}

	function create_main_fragment$l(component, ctx) {
		var div2, text0, div1, div0, text1, button, i, text2, if_block1_anchor;

		function onwindowkeydown(event) {
			component.handleKeyDown(event);	}
		window.addEventListener("keydown", onwindowkeydown);

		function onwindowmousemove(event) {
			component.handleMouseMove(event);	}
		window.addEventListener("mousemove", onwindowmousemove);

		function onwindowmouseup(event) {
			component.handleMouseUp(event);	}
		window.addEventListener("mouseup", onwindowmouseup);

		var if_block0 = (ctx.gotIt) && create_if_block_3$3(component);

		var dropdown_initial_data = {
		 	passEvent: true,
		 	label: ctx.label,
		 	itemRenderer: Gradient,
		 	forceLabel: ctx.selectedPreset,
		 	options: ctx.presetOptions,
		 	placeholder: __('controls / gradient-editor / preset / placeholder', 'core'),
		 	width: "100px"
		 };
		var dropdown = new Dropdown({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: dropdown_initial_data
		});

		dropdown.on("change", function(event) {
			component.handleChange(event);
		});

		function click_handler(event) {
			component.set({customize:!ctx.customize});
		}

		var if_block1 = (ctx.customize) && create_if_block$h(component, ctx);

		return {
			c: function create() {
				div2 = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n    ");
				div1 = createElement("div");
				div0 = createElement("div");
				dropdown._fragment.c();
				text1 = createText("\n        ");
				button = createElement("button");
				i = createElement("i");
				text2 = createText("\n");
				if (if_block1) { if_block1.c(); }
				if_block1_anchor = createComment();
				setStyle(div0, "display", "inline-block");
				addLoc(div0, file$k, 656, 8, 25336);
				i.className = "fa fa-wrench fa-fw";
				addLoc(i, file$k, 670, 12, 25942);
				addListener(button, "click", click_handler);
				button.title = "Customize";
				button.className = "btn";
				toggleClass(button, "active", ctx.customize);
				addLoc(button, file$k, 669, 8, 25827);
				setStyle(div1, "white-space", "nowrap");
				addLoc(div1, file$k, 655, 4, 25293);
				addLoc(div2, file$k, 649, 0, 25159);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				if (if_block0) { if_block0.m(div2, null); }
				append(div2, text0);
				append(div2, div1);
				append(div1, div0);
				dropdown._mount(div0, null);
				append(div1, text1);
				append(div1, button);
				append(button, i);
				insert(target, text2, anchor);
				if (if_block1) { if_block1.i(target, anchor); }
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.gotIt) {
					if (!if_block0) {
						if_block0 = create_if_block_3$3(component);
						if_block0.c();
						if_block0.m(div2, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				var dropdown_changes = {};
				if (changed.label) { dropdown_changes.label = ctx.label; }
				if (changed.selectedPreset) { dropdown_changes.forceLabel = ctx.selectedPreset; }
				if (changed.presetOptions) { dropdown_changes.options = ctx.presetOptions; }
				dropdown._set(dropdown_changes);

				if (changed.customize) {
					toggleClass(button, "active", ctx.customize);
				}

				if (ctx.customize) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$h(component, ctx);
						if (if_block1) { if_block1.c(); }
					}

					if_block1.i(if_block1_anchor.parentNode, if_block1_anchor);
				} else if (if_block1) {
					groupOutros();
					if_block1.o(function() {
						if_block1.d(1);
						if_block1 = null;
					});
				}
			},

			d: function destroy(detach) {
				window.removeEventListener("keydown", onwindowkeydown);

				window.removeEventListener("mousemove", onwindowmousemove);

				window.removeEventListener("mouseup", onwindowmouseup);

				if (detach) {
					detachNode(div2);
				}

				if (if_block0) { if_block0.d(); }
				dropdown.destroy();
				removeListener(button, "click", click_handler);
				if (detach) {
					detachNode(text2);
				}

				if (if_block1) { if_block1.d(detach); }
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (651:4) {#if gotIt}
	function create_if_block_3$3(component, ctx) {
		var div, raw_value = __('controls / gradient-editor / help', 'core');

		var help = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				div = createElement("div");
				help._fragment.c();
				addLoc(div, file$k, 652, 8, 25200);
			},

			m: function mount(target, anchor) {
				append(help._slotted.default, div);
				div.innerHTML = raw_value;
				help._mount(target, anchor);
			},

			d: function destroy(detach) {
				help.destroy(detach);
			}
		};
	}

	// (675:0) {#if customize}
	function create_if_block$h(component, ctx) {
		var div2, text0, div1, svg, defs, linearGradient, rect, g0, g1, g2, text1, div0, colorpicker_updating = {}, text2, div2_transition, current;

		var if_block0 = (!ctx.gotIt) && create_if_block_2$3(component);

		var each0_value = ctx.stops;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_5(component, get_each0_context(ctx, each0_value, i));
		}

		function click_handler(event) {
			component.handleGradientClick(event);
		}

		function mousemove_handler(event) {
			component.handleGradientMouseMove(event);
		}

		function mouseenter_handler(event) {
			component.set({mouseOverGradient:true});
		}

		function mouseleave_handler(event) {
			component.set({mouseOverGradient:false});
		}

		var if_block1 = (!ctx.dragging && ctx.mouseOverGradient) && create_if_block_1$a(component, ctx);

		var each1_value = ctx.colors;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block_4(component, get_each1_context(ctx, each1_value, i));
		}

		function focusout_handler(event) {
			component.set({focus:false});
		}

		var each2_value = ctx.ticks;

		var each2_blocks = [];

		for (var i = 0; i < each2_value.length; i += 1) {
			each2_blocks[i] = create_each_block_3$1(component, get_each2_context(ctx, each2_value, i));
		}

		var each3_value = ctx.classColors;

		var each3_blocks = [];

		for (var i = 0; i < each3_value.length; i += 1) {
			each3_blocks[i] = create_each_block_2$2(component, get_each3_context(ctx, each3_value, i));
		}

		var colorpicker_initial_data = {};
		if (ctx.colorOpen !== void 0) {
			colorpicker_initial_data.open = ctx.colorOpen;
			colorpicker_updating.open = true;
		}
		if (ctx.editColor !== void 0) {
			colorpicker_initial_data.color = ctx.editColor;
			colorpicker_updating.color = true;
		}
		var colorpicker = new ColorPicker({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: colorpicker_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!colorpicker_updating.open && changed.open) {
					newState.colorOpen = childState.open;
				}

				if (!colorpicker_updating.color && changed.color) {
					newState.editColor = childState.color;
				}
				component._set(newState);
				colorpicker_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			colorpicker._bind({ open: 1, color: 1 }, colorpicker.get());
		});

		colorpicker.on("close", function(event) {
			component.closePicker();
		});

		var each4_value = menuItems;

		var each4_blocks = [];

		for (var i = 0; i < each4_value.length; i += 1) {
			each4_blocks[i] = create_each_block$7(component, get_each4_context(ctx, each4_value, i));
		}

		return {
			c: function create() {
				div2 = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n    ");
				div1 = createElement("div");
				svg = createSvgElement("svg");
				defs = createSvgElement("defs");
				linearGradient = createSvgElement("linearGradient");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				rect = createSvgElement("rect");
				if (if_block1) { if_block1.c(); }
				g0 = createSvgElement("g");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				g1 = createSvgElement("g");

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].c();
				}

				g2 = createSvgElement("g");

				for (var i = 0; i < each3_blocks.length; i += 1) {
					each3_blocks[i].c();
				}

				text1 = createText("\n        ");
				div0 = createElement("div");
				colorpicker._fragment.c();
				text2 = createText("\n    ");

				for (var i = 0; i < each4_blocks.length; i += 1) {
					each4_blocks[i].c();
				}
				setAttribute(linearGradient, "id", "grad-main");
				setAttribute(linearGradient, "x2", "1");
				addLoc(linearGradient, file$k, 687, 16, 26600);
				addLoc(defs, file$k, 686, 12, 26577);
				addListener(rect, "click", click_handler);
				addListener(rect, "mousemove", mousemove_handler);
				addListener(rect, "mouseenter", mouseenter_handler);
				addListener(rect, "mouseleave", mouseleave_handler);
				setStyle(rect, "fill", "url(#grad-main)");
				setAttribute(rect, "width", ctx.width);
				setAttribute(rect, "height", "26");
				addLoc(rect, file$k, 693, 12, 26871);
				addListener(g0, "focusout", focusout_handler);
				setAttribute(g0, "class", "swatches");
				addLoc(g0, file$k, 709, 12, 27536);
				setAttribute(g1, "class", "ticks");
				addLoc(g1, file$k, 726, 12, 28446);
				setAttribute(g2, "class", "classes");
				addLoc(g2, file$k, 731, 12, 28657);
				setAttribute(svg, "width", ctx.width);
				setAttribute(svg, "height", "35");
				setStyle(svg, "position", "relative");
				setStyle(svg, "top", "2px");
				setAttribute(svg, "class", "svelte-nq6dhz");
				addLoc(svg, file$k, 685, 8, 26497);
				setStyle(div0, "left", "" + ctx.editPosition*ctx.width + "px");
				div0.className = "picker-cont svelte-nq6dhz";
				addLoc(div0, file$k, 741, 8, 29020);
				div1.className = "preview svelte-nq6dhz";
				addLoc(div1, file$k, 684, 4, 26467);
				addLoc(div2, file$k, 675, 0, 26029);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				if (if_block0) { if_block0.m(div2, null); }
				append(div2, text0);
				append(div2, div1);
				append(div1, svg);
				append(svg, defs);
				append(defs, linearGradient);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(linearGradient, null);
				}

				append(svg, rect);
				component.refs.gradient = rect;
				if (if_block1) { if_block1.m(svg, null); }
				append(svg, g0);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(g0, null);
				}

				component.refs.swatches = g0;
				append(svg, g1);

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].m(g1, null);
				}

				append(svg, g2);

				for (var i = 0; i < each3_blocks.length; i += 1) {
					each3_blocks[i].m(g2, null);
				}

				append(div1, text1);
				append(div1, div0);
				colorpicker._mount(div0, null);
				append(div2, text2);

				for (var i = 0; i < each4_blocks.length; i += 1) {
					each4_blocks[i].m(div2, null);
				}

				current = true;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!ctx.gotIt) {
					if (!if_block0) {
						if_block0 = create_if_block_2$3(component);
						if_block0.c();
						if_block0.m(div2, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.stops) {
					each0_value = ctx.stops;

					for (var i = 0; i < each0_value.length; i += 1) {
						var child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_5(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(linearGradient, null);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (!current || changed.width) {
					setAttribute(rect, "width", ctx.width);
				}

				if (!ctx.dragging && ctx.mouseOverGradient) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1$a(component, ctx);
						if_block1.c();
						if_block1.m(svg, g0);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.colors || changed.Math || changed.width || changed.focus || changed.dragging || changed.wouldDelete) {
					each1_value = ctx.colors;

					for (var i = 0; i < each1_value.length; i += 1) {
						var child_ctx$1 = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx$1);
						} else {
							each1_blocks[i] = create_each_block_4(component, child_ctx$1);
							each1_blocks[i].c();
							each1_blocks[i].m(g0, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				if (changed.Math || changed.width || changed.ticks) {
					each2_value = ctx.ticks;

					for (var i = 0; i < each2_value.length; i += 1) {
						var child_ctx$2 = get_each2_context(ctx, each2_value, i);

						if (each2_blocks[i]) {
							each2_blocks[i].p(changed, child_ctx$2);
						} else {
							each2_blocks[i] = create_each_block_3$1(component, child_ctx$2);
							each2_blocks[i].c();
							each2_blocks[i].m(g1, null);
						}
					}

					for (; i < each2_blocks.length; i += 1) {
						each2_blocks[i].d(1);
					}
					each2_blocks.length = each2_value.length;
				}

				if (changed.classColors || changed.Math || changed.width) {
					each3_value = ctx.classColors;

					for (var i = 0; i < each3_value.length; i += 1) {
						var child_ctx$3 = get_each3_context(ctx, each3_value, i);

						if (each3_blocks[i]) {
							each3_blocks[i].p(changed, child_ctx$3);
						} else {
							each3_blocks[i] = create_each_block_2$2(component, child_ctx$3);
							each3_blocks[i].c();
							each3_blocks[i].m(g2, null);
						}
					}

					for (; i < each3_blocks.length; i += 1) {
						each3_blocks[i].d(1);
					}
					each3_blocks.length = each3_value.length;
				}

				if (!current || changed.width) {
					setAttribute(svg, "width", ctx.width);
				}

				var colorpicker_changes = {};
				if (!colorpicker_updating.open && changed.colorOpen) {
					colorpicker_changes.open = ctx.colorOpen;
					colorpicker_updating.open = ctx.colorOpen !== void 0;
				}
				if (!colorpicker_updating.color && changed.editColor) {
					colorpicker_changes.color = ctx.editColor;
					colorpicker_updating.color = ctx.editColor !== void 0;
				}
				colorpicker._set(colorpicker_changes);
				colorpicker_updating = {};

				if (!current || changed.editPosition || changed.width) {
					setStyle(div0, "left", "" + ctx.editPosition*ctx.width + "px");
				}

				if (changed.undoStack || changed.redoStack || changed.lightnessFixable) {
					each4_value = menuItems;

					for (var i = 0; i < each4_value.length; i += 1) {
						var child_ctx$4 = get_each4_context(ctx, each4_value, i);

						if (each4_blocks[i]) {
							each4_blocks[i].p(changed, child_ctx$4);
						} else {
							each4_blocks[i] = create_each_block$7(component, child_ctx$4);
							each4_blocks[i].c();
							each4_blocks[i].m(div2, null);
						}
					}

					for (; i < each4_blocks.length; i += 1) {
						each4_blocks[i].d(1);
					}
					each4_blocks.length = each4_value.length;
				}
			},

			i: function intro(target, anchor) {
				if (current) { return; }
				if (component.root._intro) {
					if (div2_transition) { div2_transition.invalidate(); }

					component.root._aftercreate.push(function () {
						if (!div2_transition) { div2_transition = wrapTransition(component, div2, slide, {}, true); }
						div2_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) { return; }

				if (!div2_transition) { div2_transition = wrapTransition(component, div2, slide, {}, false); }
				div2_transition.run(0, function () {
					outrocallback();
					div2_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				if (if_block0) { if_block0.d(); }

				destroyEach(each0_blocks, detach);

				removeListener(rect, "click", click_handler);
				removeListener(rect, "mousemove", mousemove_handler);
				removeListener(rect, "mouseenter", mouseenter_handler);
				removeListener(rect, "mouseleave", mouseleave_handler);
				if (component.refs.gradient === rect) { component.refs.gradient = null; }
				if (if_block1) { if_block1.d(); }

				destroyEach(each1_blocks, detach);

				removeListener(g0, "focusout", focusout_handler);
				if (component.refs.swatches === g0) { component.refs.swatches = null; }

				destroyEach(each2_blocks, detach);

				destroyEach(each3_blocks, detach);

				colorpicker.destroy();

				destroyEach(each4_blocks, detach);

				if (detach) {
					if (div2_transition) { div2_transition.abort(); }
				}
			}
		};
	}

	// (677:4) {#if !gotIt}
	function create_if_block_2$3(component, ctx) {
		var p, b, text0_value = __('controls / gradient-editor / how-this-works', 'core'), text0, text1, raw_value = __('controls / gradient-editor / help', 'core'), raw_before, raw_after, text2, a_1, i, text3, text4_value = __('controls / gradient-editor / got-it', 'core'), text4;

		function click_handler(event) {
			event.preventDefault();
			component.closeHelp();
		}

		return {
			c: function create() {
				p = createElement("p");
				b = createElement("b");
				text0 = createText(text0_value);
				text1 = createText(" ");
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text2 = createText("\n        ");
				a_1 = createElement("a");
				i = createElement("i");
				text3 = createText(" ");
				text4 = createText(text4_value);
				addLoc(b, file$k, 678, 8, 26147);
				i.className = "fa fa-check";
				addLoc(i, file$k, 680, 13, 26351);
				addListener(a_1, "click", click_handler);
				a_1.href = "#/closeHelp";
				addLoc(a_1, file$k, 679, 8, 26278);
				setStyle(p, "min-height", "3em");
				setStyle(p, "margin-bottom", "20px");
				p.className = "mini-help";
				addLoc(p, file$k, 677, 4, 26073);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, b);
				append(b, text0);
				append(p, text1);
				append(p, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				append(p, raw_after);
				append(p, text2);
				append(p, a_1);
				append(a_1, i);
				append(a_1, text3);
				append(a_1, text4);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}

				removeListener(a_1, "click", click_handler);
			}
		};
	}

	// (689:20) {#each stops as stop}
	function create_each_block_5(component, ctx) {
		var stop, stop_offset_value, stop_stop_color_value;

		return {
			c: function create() {
				stop = createSvgElement("stop");
				setAttribute(stop, "offset", stop_offset_value = "" + (ctx.stop.offset*100).toFixed(2) + "%");
				setAttribute(stop, "stop-color", stop_stop_color_value = ctx.stop.color);
				addLoc(stop, file$k, 689, 20, 26701);
			},

			m: function mount(target, anchor) {
				insert(target, stop, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.stops) && stop_offset_value !== (stop_offset_value = "" + (ctx.stop.offset*100).toFixed(2) + "%")) {
					setAttribute(stop, "offset", stop_offset_value);
				}

				if ((changed.stops) && stop_stop_color_value !== (stop_stop_color_value = ctx.stop.color)) {
					setAttribute(stop, "stop-color", stop_stop_color_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(stop);
				}
			}
		};
	}

	// (704:12) {#if !dragging && mouseOverGradient}
	function create_if_block_1$a(component, ctx) {
		var g, path, text_1, text, g_transform_value;

		return {
			c: function create() {
				g = createSvgElement("g");
				path = createSvgElement("path");
				text_1 = createSvgElement("text");
				text = createText("+");
				setAttribute(path, "d", "M-7,3 l7,7 l7,-7 v-12 h-14Z");
				setAttribute(path, "class", "svelte-nq6dhz");
				addLoc(path, file$k, 705, 16, 27411);
				setAttribute(text_1, "y", "4");
				setAttribute(text_1, "class", "svelte-nq6dhz");
				addLoc(text_1, file$k, 706, 16, 27468);
				setAttribute(g, "class", "line svelte-nq6dhz");
				setAttribute(g, "transform", g_transform_value = "translate(" + (ctx.Math.round(ctx.mouseX)+0.5) + ",0)");
				addLoc(g, file$k, 704, 12, 27328);
			},

			m: function mount(target, anchor) {
				insert(target, g, anchor);
				append(g, path);
				append(g, text_1);
				append(text_1, text);
			},

			p: function update(changed, ctx) {
				if ((changed.Math || changed.mouseX) && g_transform_value !== (g_transform_value = "translate(" + (ctx.Math.round(ctx.mouseX)+0.5) + ",0)")) {
					setAttribute(g, "transform", g_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(g);
				}
			}
		};
	}

	// (711:16) {#each colors as c,i}
	function create_each_block_4(component, ctx) {
		var a_1, path, path_transform_value;

		return {
			c: function create() {
				a_1 = createSvgElement("a");
				path = createSvgElement("path");
				path._svelte = { component: component, ctx: ctx };

				addListener(path, "mousedown", mousedown_handler);
				addListener(path, "click", click_handler$4);
				setAttribute(path, "class", "swatch svelte-nq6dhz");
				setAttribute(path, "tabindex", ctx.i+1);
				setAttribute(path, "d", "M-7,3 l7,7 l7,-7 v-12 h-14Z");
				setAttribute(path, "transform", path_transform_value = "translate(" + (ctx.Math.round(ctx.width*ctx.c.position)+0.5) + ",0)");
				setStyle(path, "fill", ctx.c.color);
				setStyle(path, "stroke", chroma(ctx.c.color).darken().hex());
				toggleClass(path, "focus", ctx.focus === ctx.c);
				toggleClass(path, "delete", ctx.c === ctx.dragging && ctx.wouldDelete);
				addLoc(path, file$k, 712, 20, 27754);

				a_1._svelte = { component: component, ctx: ctx };

				addListener(a_1, "focusin", focusin_handler);
				setXlinkAttribute(a_1, "xlink:href", "#/color/" + ctx.i);
				setAttribute(a_1, "draggable", false);
				addLoc(a_1, file$k, 711, 16, 27657);
			},

			m: function mount(target, anchor) {
				insert(target, a_1, anchor);
				append(a_1, path);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				path._svelte.ctx = ctx;
				if ((changed.Math || changed.width || changed.colors) && path_transform_value !== (path_transform_value = "translate(" + (ctx.Math.round(ctx.width*ctx.c.position)+0.5) + ",0)")) {
					setAttribute(path, "transform", path_transform_value);
				}

				if (changed.colors) {
					setStyle(path, "fill", ctx.c.color);
					setStyle(path, "stroke", chroma(ctx.c.color).darken().hex());
				}

				if ((changed.focus || changed.colors)) {
					toggleClass(path, "focus", ctx.focus === ctx.c);
				}

				if ((changed.colors || changed.dragging || changed.wouldDelete)) {
					toggleClass(path, "delete", ctx.c === ctx.dragging && ctx.wouldDelete);
				}

				a_1._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a_1);
				}

				removeListener(path, "mousedown", mousedown_handler);
				removeListener(path, "click", click_handler$4);
				removeListener(a_1, "focusin", focusin_handler);
			}
		};
	}

	// (728:16) {#each ticks as value}
	function create_each_block_3$1(component, ctx) {
		var path, path_transform_value;

		return {
			c: function create() {
				path = createSvgElement("path");
				setAttribute(path, "class", "tick svelte-nq6dhz");
				setAttribute(path, "d", "M0,26v4");
				setAttribute(path, "transform", path_transform_value = "translate(" + ctx.Math.round(ctx.width*ctx.value) + ",0)");
				addLoc(path, file$k, 728, 16, 28519);
			},

			m: function mount(target, anchor) {
				insert(target, path, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.Math || changed.width || changed.ticks) && path_transform_value !== (path_transform_value = "translate(" + ctx.Math.round(ctx.width*ctx.value) + ",0)")) {
					setAttribute(path, "transform", path_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(path);
				}
			}
		};
	}

	// (733:16) {#each classColors as cl}
	function create_each_block_2$2(component, ctx) {
		var circle, circle_transform_value;

		return {
			c: function create() {
				circle = createSvgElement("circle");
				setAttribute(circle, "r", "3");
				setStyle(circle, "fill", ctx.cl.color);
				setStyle(circle, "stroke", chroma(ctx.cl.color).darken().hex());
				setAttribute(circle, "transform", circle_transform_value = "translate(" + (ctx.Math.round(ctx.width*ctx.cl.position)+0.5) + ",26)");
				addLoc(circle, file$k, 733, 16, 28735);
			},

			m: function mount(target, anchor) {
				insert(target, circle, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.classColors) {
					setStyle(circle, "fill", ctx.cl.color);
					setStyle(circle, "stroke", chroma(ctx.cl.color).darken().hex());
				}

				if ((changed.Math || changed.width || changed.classColors) && circle_transform_value !== (circle_transform_value = "translate(" + (ctx.Math.round(ctx.width*ctx.cl.position)+0.5) + ",26)")) {
					setAttribute(circle, "transform", circle_transform_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(circle);
				}
			}
		};
	}

	// (750:8) {#each group as item}
	function create_each_block_1$2(component, ctx) {
		var button, raw0_value = ctx.item.icon, raw0_after, text, div, raw1_value = ctx.item.label, button_disabled_value;

		return {
			c: function create() {
				button = createElement("button");
				raw0_after = createElement('noscript');
				text = createText("\n            ");
				div = createElement("div");
				div.className = "btn-help svelte-nq6dhz";
				addLoc(div, file$k, 752, 12, 29590);

				button._svelte = { component: component, ctx: ctx };

				addListener(button, "click", click_handler_1$1);
				button.disabled = button_disabled_value = isDisabled(ctx.item, {undoStack: ctx.undoStack, redoStack: ctx.redoStack, lightnessFixable: ctx.lightnessFixable});
				button.className = "btn btn-small svelte-nq6dhz";
				addLoc(button, file$k, 750, 8, 29421);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, raw0_after);
				raw0_after.insertAdjacentHTML("beforebegin", raw0_value);
				append(button, text);
				append(button, div);
				div.innerHTML = raw1_value;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button._svelte.ctx = ctx;
				if ((changed.undoStack || changed.redoStack || changed.lightnessFixable) && button_disabled_value !== (button_disabled_value = isDisabled(ctx.item, {undoStack: ctx.undoStack, redoStack: ctx.redoStack, lightnessFixable: ctx.lightnessFixable}))) {
					button.disabled = button_disabled_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler_1$1);
			}
		};
	}

	// (748:4) {#each menuItems as group}
	function create_each_block$7(component, ctx) {
		var div, text;

		var each_value = ctx.group;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_1$2(component, get_each_context$7(ctx, each_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text = createText("\n    ");
				div.className = "btn-group svelte-nq6dhz";
				setStyle(div, "margin-top", "5px");
				setStyle(div, "margin-bottom", "15px");
				addLoc(div, file$k, 748, 4, 29315);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.undoStack || changed.redoStack || changed.lightnessFixable) {
					each_value = ctx.group;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$7(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, text);
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
	}

	function GradientEditor(options) {
		var this$1 = this;

		this._debugName = '<GradientEditor>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign({ Math : Math }, data$j()), options.data);

		this._recompute({ themePresets: 1, userPresets: 1, colors: 1, dragging: 1, wouldDelete: 1, activeColors: 1, scale: 1, stops: 1, presets: 1, classes: 1, isMonotone: 1, isDiverging: 1 }, this._state);
		if (!('themePresets' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'themePresets'"); }
		if (!('userPresets' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'userPresets'"); }
		if (!('colors' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'colors'"); }
		if (!('dragging' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'dragging'"); }
		if (!('wouldDelete' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'wouldDelete'"); }




		if (!('classes' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'classes'"); }


		if (!('gotIt' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'gotIt'"); }
		if (!('label' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'label'"); }


		if (!('customize' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'customize'"); }
		if (!('width' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'width'"); }
		if (!('mouseOverGradient' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'mouseOverGradient'"); }

		if (!('mouseX' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'mouseX'"); }
		if (!('focus' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'focus'"); }


		if (!('editPosition' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'editPosition'"); }
		if (!('colorOpen' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'colorOpen'"); }
		if (!('editColor' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'editColor'"); }
		if (!('undoStack' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'undoStack'"); }
		if (!('redoStack' in this._state)) { console.warn("<GradientEditor> was created without expected data property 'redoStack'"); }
		this._intro = true;

		this._handlers.state = [onstate$1];

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$l(this, this._state);

		this.root._oncreate.push(function () {
			oncreate$4.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(GradientEditor.prototype, protoDev);
	assign(GradientEditor.prototype, methods$b);

	GradientEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('presets' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'presets'"); }
		if ('activeColors' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'activeColors'"); }
		if ('scale' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'scale'"); }
		if ('stops' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'stops'"); }
		if ('selectedPreset' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'selectedPreset'"); }
		if ('presetOptions' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'presetOptions'"); }
		if ('ticks' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'ticks'"); }
		if ('classColors' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'classColors'"); }
		if ('isMonotone' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'isMonotone'"); }
		if ('isDiverging' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'isDiverging'"); }
		if ('lightnessFixable' in newState && !this._updatingReadonlyProperty) { throw new Error("<GradientEditor>: Cannot set read-only property 'lightnessFixable'"); }
	};

	GradientEditor.prototype._recompute = function _recompute(changed, state) {
		if (changed.themePresets || changed.userPresets) {
			if (this._differs(state.presets, (state.presets = presets(state)))) { changed.presets = true; }
		}

		if (changed.colors || changed.dragging || changed.wouldDelete) {
			if (this._differs(state.activeColors, (state.activeColors = activeColors(state)))) { changed.activeColors = true; }
		}

		if (changed.activeColors) {
			if (this._differs(state.scale, (state.scale = scale(state)))) { changed.scale = true; }
		}

		if (changed.scale) {
			if (this._differs(state.stops, (state.stops = stops(state)))) { changed.stops = true; }
		}

		if (changed.stops) {
			if (this._differs(state.selectedPreset, (state.selectedPreset = selectedPreset(state)))) { changed.selectedPreset = true; }
		}

		if (changed.presets || changed.themePresets) {
			if (this._differs(state.presetOptions, (state.presetOptions = presetOptions(state)))) { changed.presetOptions = true; }
		}

		if (changed.colors) {
			if (this._differs(state.ticks, (state.ticks = ticks(state)))) { changed.ticks = true; }
		}

		if (changed.scale || changed.colors || changed.classes) {
			if (this._differs(state.classColors, (state.classColors = classColors(state)))) { changed.classColors = true; }
		}

		if (changed.colors || changed.scale) {
			if (this._differs(state.isMonotone, (state.isMonotone = isMonotone(state)))) { changed.isMonotone = true; }
			if (this._differs(state.isDiverging, (state.isDiverging = isDiverging(state)))) { changed.isDiverging = true; }
		}

		if (changed.isMonotone || changed.isDiverging) {
			if (this._differs(state.lightnessFixable, (state.lightnessFixable = lightnessFixable(state)))) { changed.lightnessFixable = true; }
		}
	};

	/* node_modules/@datawrapper/controls/Group.html generated by Svelte v2.16.1 */

	function data$k() {
	    return {
	        notoggle: false,
	        id: false,
	        open: true
	    };
	}
	var methods$c = {
	    toggle: function toggle() {
	        if (this.get().notoggle) { return; }
	        var ref = this.get();
	        var open = ref.open;
	        var id = ref.id;
	        if (id) {
	            var visGroups = JSON.parse(window.localStorage.getItem('dw-vis-groups')) || {};
	            visGroups[id] = open ? 'closed' : 'open';
	            window.localStorage.setItem('dw-vis-groups', JSON.stringify(visGroups));
	        }
	        this.set({ open: !open });
	    }
	};

	function oncreate$5() {
	    var ref = this.get() || {};
	    var id = ref.id;
	    var notoggle = ref.notoggle;
	    if (notoggle) { return; }
	    if (id) {
	        var visGroups = JSON.parse(window.localStorage.getItem('dw-vis-groups')) || {};
	        if (visGroups && visGroups[id]) {
	            this.set({ open: visGroups[id] !== 'closed' });
	        }
	    }
	}
	var file$l = "node_modules/datawrapper/controls/Group.html";

	function create_main_fragment$m(component, ctx) {
		var div, label, text0, raw_before, text1;

		var if_block0 = (!ctx.notoggle) && create_if_block_1$b();

		function click_handler(event) {
			component.toggle();
		}

		var if_block1 = (ctx.open) && create_if_block$i(component);

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				if (if_block0) { if_block0.c(); }
				text0 = createText(" ");
				raw_before = createElement('noscript');
				text1 = createText("\n\n    ");
				if (if_block1) { if_block1.c(); }
				addListener(label, "click", click_handler);
				label.className = "group-title svelte-pc2zap";
				addLoc(label, file$l, 1, 4, 79);
				div.className = "vis-option-type-group svelte-pc2zap";
				toggleClass(div, "group-open", ctx.open);
				toggleClass(div, "notoggle", ctx.notoggle);
				addLoc(div, file$l, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, label);
				if (if_block0) { if_block0.m(label, null); }
				append(label, text0);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.label);
				append(div, text1);
				if (if_block1) { if_block1.m(div, null); }
			},

			p: function update(changed, ctx) {
				if (!ctx.notoggle) {
					if (!if_block0) {
						if_block0 = create_if_block_1$b();
						if_block0.c();
						if_block0.m(label, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.label) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.label);
				}

				if (ctx.open) {
					if (!if_block1) {
						if_block1 = create_if_block$i(component);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.open) {
					toggleClass(div, "group-open", ctx.open);
				}

				if (changed.notoggle) {
					toggleClass(div, "notoggle", ctx.notoggle);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) { if_block0.d(); }
				removeListener(label, "click", click_handler);
				if (if_block1) { if_block1.d(); }
			}
		};
	}

	// (3:8) {#if !notoggle}
	function create_if_block_1$b(component, ctx) {
		var i0, text, i1;

		return {
			c: function create() {
				i0 = createElement("i");
				text = createText("\n        ");
				i1 = createElement("i");
				i0.className = "fa fa-chevron-up expand-group pull-right";
				addLoc(i0, file$l, 3, 8, 159);
				i1.className = "fa fa-chevron-down collapse-group pull-right";
				addLoc(i1, file$l, 4, 8, 224);
			},

			m: function mount(target, anchor) {
				insert(target, i0, anchor);
				insert(target, text, anchor);
				insert(target, i1, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i0);
					detachNode(text);
					detachNode(i1);
				}
			}
		};
	}

	// (9:4) {#if open}
	function create_if_block$i(component, ctx) {
		var div, slot_content_default = component._slotted.default, text;

		return {
			c: function create() {
				div = createElement("div");
				if (!slot_content_default) {
					text = createText("content");
				}
				div.className = "option-group-content vis-option-type-chart-description";
				addLoc(div, file$l, 9, 4, 347);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (!slot_content_default) {
					append(div, text);
				}

				else {
					append(div, slot_content_default);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (slot_content_default) {
					reinsertChildren(div, slot_content_default);
				}
			}
		};
	}

	function Group(options) {
		var this$1 = this;

		this._debugName = '<Group>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$k(), options.data);
		if (!('open' in this._state)) { console.warn("<Group> was created without expected data property 'open'"); }
		if (!('notoggle' in this._state)) { console.warn("<Group> was created without expected data property 'notoggle'"); }
		if (!('label' in this._state)) { console.warn("<Group> was created without expected data property 'label'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$m(this, this._state);

		this.root._oncreate.push(function () {
			oncreate$5.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Group.prototype, protoDev);
	assign(Group.prototype, methods$c);

	Group.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/ListItem.html generated by Svelte v2.16.1 */

	var file$m = "node_modules/datawrapper/controls/ListItem.html";

	function create_main_fragment$n(component, ctx) {
		var div, raw_value = ctx.item.name || ctx.item.label || ctx.item.id;

		return {
			c: function create() {
				div = createElement("div");
				addLoc(div, file$m, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.item) && raw_value !== (raw_value = ctx.item.name || ctx.item.label || ctx.item.id)) {
					div.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function ListItem(options) {
		this._debugName = '<ListItem>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('item' in this._state)) { console.warn("<ListItem> was created without expected data property 'item'"); }
		this._intro = true;

		this._fragment = create_main_fragment$n(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ListItem.prototype, protoDev);

	ListItem.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/List.html generated by Svelte v2.16.1 */

	function data$l() {
	    return {
	        items: [],
	        itemRenderer: ListItem,
	        selected: [],
	        selectable: true,
	        draggable: false,
	        compact: false,
	        multiselectable: true,
	        deselectable: false,
	        maxHeight: false,
	        // internal state
	        dragging: false,
	        dragtarget: -1,
	        dropafter: false,
	        disabled: false
	    };
	}
	var methods$d = {
	    select: function select(event, item, index) {
	        var ref = this.get();
	        var multiselectable = ref.multiselectable;
	        var selectable = ref.selectable;
	        var disabled = ref.disabled;
	        if (!selectable || disabled) { return; }
	        event.stopPropagation();
	        // if (event.__ignoreSelect) return;
	        if (multiselectable && event.shiftKey) {
	            // shift-select for selecting ranges
	            return this.selectShift(event, item);
	        }
	        if (multiselectable && (event.ctrlKey || event.metaKey)) {
	            // ctrl-select for multi-selection
	            return this.selectCtrl(event, item);
	        }
	        // normal single item selection
	        this.selectNormal(event, item);
	    },

	    /*
	     * the normal selection unselects the previously selected
	     * item and selects the new one
	     */
	    selectNormal: function selectNormal(event, item) {
	        var ref = this.get();
	        var selected = ref.selected;
	        var deselectable = ref.deselectable;
	        var isSelected = deselectable && selected.length === 1 && item.id === selected[0];
	        if (isSelected) {
	            selected.length = 0;
	        } else {
	            selected.length = 1;
	            selected[0] = item.id;
	        }
	        this.set({
	            selected: selected
	        });
	    },

	    /*
	     * multiple selection using control key toggles the
	     * selection status for each item indiviually
	     */
	    selectCtrl: function selectCtrl(event, item) {
	        var ref = this.get();
	        var selected = ref.selected;
	        // check if item is already in selection
	        var pos = selected.indexOf(item.id);
	        if (pos > -1) {
	            // item is already in selection, so let's remove it
	            selected.splice(pos, 1);
	        } else {
	            // item is not in selection, let's add it
	            selected.push(item.id);
	        }
	        // save selection
	        this.set({ selected: selected });
	    },

	    /*
	     * multi-selection using shift key selects everything between
	     * the first selected item and the last selected item
	     */
	    selectShift: function selectShift(event, item) {
	        var ref = this.get();
	        var selected = ref.selected;
	        var items = ref.items;
	        // shift --> select range
	        var itemIds = items.map(function (m) { return m.id; });

	        if (selected.length === 1) {
	            // find index of activeItem
	            var activeIndex = itemIds.indexOf(selected[0]);
	            if (activeIndex > -1) {
	                // find index of the newly selected item
	                var newIndex = items.indexOf(item);
	                if (newIndex > -1) {
	                    // now select everything between the two items
	                    selected.length = 0;
	                    selected.push.apply(selected, itemIds.slice(Math.min(newIndex, activeIndex), Math.max(newIndex, activeIndex) + 1));
	                }
	            }
	        } else if (selected.length > 1) {
	            // extend selection either down or up
	            var selMin = itemIds.indexOf(selected[0]);
	            var selMax = itemIds.indexOf(selected[selected.length - 1]);
	            var newIndex$1 = items.indexOf(item);

	            if (Math.abs(newIndex$1 - selMin) < Math.abs(newIndex$1 - selMax)) {
	                // new index is closer to lower end
	                selMin = newIndex$1;
	            } else {
	                selMax = newIndex$1;
	            }

	            // now select everything between the two items
	            selected.length = 0;
	            selected.push.apply(selected, itemIds.slice(selMin, selMax + 1));
	        }
	        // save selection
	        this.set({ selected: selected });
	    },

	    dragstart: function dragstart(ev, itemIndex) {
	        var ref = this.get();
	        var draggable = ref.draggable;
	        var items = ref.items;
	        var selected = ref.selected;
	        var disabled = ref.disabled;
	        if (!draggable || disabled) { return; }
	        selected.length = 1;
	        selected[0] = items[itemIndex].id;
	        // store the item to the drag event data
	        ev.dataTransfer.setData('item', itemIndex);
	        this.set({ dragging: true, selected: selected });
	    },

	    dragover: function dragover(ev) {
	        var ref = this.get();
	        var draggable = ref.draggable;
	        var disabled = ref.disabled;
	        if (!draggable || disabled) { return; }
	        var li = ev.target;
	        var target = li.parentElement === this.refs.list ? +li.getAttribute('data-pos') : -1;
	        var liBbox = li.getBoundingClientRect();
	        var y = (ev.clientY - liBbox.top) / liBbox.height;

	        this.set({
	            dragtarget: target,
	            dropafter: y > 0.5
	        });
	        ev.dataTransfer.dropEffect = 'move';
	    },

	    drop: function drop(ev) {
	        var ref = this.get();
	        var draggable = ref.draggable;
	        var disabled = ref.disabled;
	        if (!draggable || disabled) { return; }
	        var i = ev.dataTransfer.getData('item');
	        // const ds = this.store.dataset();
	        var ref$1 = this.get();
	        var dragtarget = ref$1.dragtarget;
	        var dropafter = ref$1.dropafter;
	        var items = ref$1.items;
	        if (i !== dragtarget) {
	            var tgt = items[dragtarget];
	            var item = items.splice(i, 1)[0];
	            var newTargetPos = items.indexOf(tgt);
	            if (!newTargetPos && !dropafter) {
	                // move to beginning of list
	                items.unshift(item);
	            } else {
	                items.splice(newTargetPos + (dropafter ? 1 : 0), 0, item);
	            }
	        }

	        this.set({
	            dragging: false,
	            dragtarget: -1,
	            items: items
	        });
	        this.fire('itemDrag', { items: items });
	    }
	};

	var file$n = "node_modules/datawrapper/controls/List.html";

	function click_handler_1$2(event) {
		event.preventDefault();
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.select(event, ctx.item, ctx.index);
	}

	function dragstart_handler(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.dragstart(event, ctx.index);
	}

	function click_handler$5(event) {
		event.preventDefault();
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.select(event, ctx.item, ctx.index);
	}

	function get_each_context$8(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		child_ctx.each_value = list;
		child_ctx.index = i;
		return child_ctx;
	}

	function create_main_fragment$o(component, ctx) {
		var ul;

		var each_value = ctx.items;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$8(component, get_each_context$8(ctx, each_value, i));
		}

		function drop_handler(event) {
			event.preventDefault();
			component.drop(event);
		}

		function dragover_handler(event) {
			event.preventDefault();
			component.dragover(event);
		}

		return {
			c: function create() {
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addListener(ul, "drop", drop_handler);
				addListener(ul, "dragover", dragover_handler);
				ul.className = "unstyled svelte-1m7tulf";
				setStyle(ul, "max-height", (ctx.maxHeight ? ctx.maxHeight : ctx.compact ? '120px' : '220px'));
				toggleClass(ul, "disabled", ctx.disabled);
				toggleClass(ul, "dragging", ctx.dragging);
				toggleClass(ul, "compact", ctx.compact);
				addLoc(ul, file$n, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, ul, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				component.refs.list = ul;
			},

			p: function update(changed, ctx) {
				if (changed.draggable || changed.selected || changed.items || changed.dragtarget || changed.dropafter || changed.itemRenderer) {
					each_value = ctx.items;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$8(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$8(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (changed.maxHeight || changed.compact) {
					setStyle(ul, "max-height", (ctx.maxHeight ? ctx.maxHeight : ctx.compact ? '120px' : '220px'));
				}

				if (changed.disabled) {
					toggleClass(ul, "disabled", ctx.disabled);
				}

				if (changed.dragging) {
					toggleClass(ul, "dragging", ctx.dragging);
				}

				if (changed.compact) {
					toggleClass(ul, "compact", ctx.compact);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(ul);
				}

				destroyEach(each_blocks, detach);

				removeListener(ul, "drop", drop_handler);
				removeListener(ul, "dragover", dragover_handler);
				if (component.refs.list === ul) { component.refs.list = null; }
			}
		};
	}

	// (11:4) {#each items as item, index}
	function create_each_block$8(component, ctx) {
		var li, a, switch_instance_updating = {}, text;

		var switch_value = ctx.itemRenderer;

		function switch_props(ctx) {
			var switch_instance_initial_data = {};
			if (ctx.item  !== void 0) {
				switch_instance_initial_data.item = ctx.item ;
				switch_instance_updating.item = true;
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data,
				_bind: function _bind(changed, childState) {
					var newState = {};
					if (!switch_instance_updating.item && changed.item) {
						ctx.each_value[ctx.index] = childState.item = childState.item;

						newState.items = ctx.items;
					}
					component._set(newState);
					switch_instance_updating = {};
				}
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));

			component.root._beforecreate.push(function () {
				switch_instance._bind({ item: 1 }, switch_instance.get());
			});
		}

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				if (switch_instance) { switch_instance._fragment.c(); }
				text = createText("\n    ");
				a._svelte = { component: component, ctx: ctx };

				addListener(a, "click", click_handler$5);
				a.href = "#item-" + ctx.index;
				a.className = "svelte-1m7tulf";
				addLoc(a, file$n, 21, 8, 686);

				li._svelte = { component: component, ctx: ctx };

				addListener(li, "dragstart", dragstart_handler);
				addListener(li, "click", click_handler_1$2);
				li.dataset.pos = ctx.index;
				li.draggable = ctx.draggable;
				li.className = "svelte-1m7tulf";
				toggleClass(li, "selected", ctx.selected.indexOf(ctx.item.id ) > -1);
				toggleClass(li, "dragtarget", ctx.dragtarget === ctx.index);
				toggleClass(li, "dropafter", ctx.dropafter);
				toggleClass(li, "dropbefore", !ctx.dropafter);
				addLoc(li, file$n, 11, 4, 322);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);

				if (switch_instance) {
					switch_instance._mount(a, null);
				}

				append(li, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var switch_instance_changes = {};
				if (!switch_instance_updating.item && changed.items) {
					switch_instance_changes.item = ctx.item ;
					switch_instance_updating.item = ctx.item  !== void 0;
				}

				if (switch_value !== (switch_value = ctx.itemRenderer)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));

						component.root._beforecreate.push(function () {
							var changed = {};
							if (ctx.item  === void 0) { changed.item = 1; }
							switch_instance._bind(changed, switch_instance.get());
						});
						switch_instance._fragment.c();
						switch_instance._mount(a, null);
					} else {
						switch_instance = null;
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
					switch_instance_updating = {};
				}

				a._svelte.ctx = ctx;
				li._svelte.ctx = ctx;
				if (changed.draggable) {
					li.draggable = ctx.draggable;
				}

				if ((changed.selected || changed.items)) {
					toggleClass(li, "selected", ctx.selected.indexOf(ctx.item.id ) > -1);
				}

				if (changed.dragtarget) {
					toggleClass(li, "dragtarget", ctx.dragtarget === ctx.index);
				}

				if (changed.dropafter) {
					toggleClass(li, "dropafter", ctx.dropafter);
					toggleClass(li, "dropbefore", !ctx.dropafter);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				if (switch_instance) { switch_instance.destroy(); }
				removeListener(a, "click", click_handler$5);
				removeListener(li, "dragstart", dragstart_handler);
				removeListener(li, "click", click_handler_1$2);
			}
		};
	}

	function List(options) {
		this._debugName = '<List>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$l(), options.data);
		if (!('dragging' in this._state)) { console.warn("<List> was created without expected data property 'dragging'"); }
		if (!('compact' in this._state)) { console.warn("<List> was created without expected data property 'compact'"); }
		if (!('maxHeight' in this._state)) { console.warn("<List> was created without expected data property 'maxHeight'"); }
		if (!('items' in this._state)) { console.warn("<List> was created without expected data property 'items'"); }
		if (!('selected' in this._state)) { console.warn("<List> was created without expected data property 'selected'"); }
		if (!('dragtarget' in this._state)) { console.warn("<List> was created without expected data property 'dragtarget'"); }
		if (!('dropafter' in this._state)) { console.warn("<List> was created without expected data property 'dropafter'"); }
		if (!('draggable' in this._state)) { console.warn("<List> was created without expected data property 'draggable'"); }
		if (!('itemRenderer' in this._state)) { console.warn("<List> was created without expected data property 'itemRenderer'"); }
		this._intro = true;

		this._fragment = create_main_fragment$o(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(List.prototype, protoDev);
	assign(List.prototype, methods$d);

	List.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Select.html generated by Svelte v2.16.1 */



	function data$m() {
	    return {
	        disabled: false,
	        width: 'auto',
	        labelWidth: 'auto',
	        options: [],
	        optgroups: []
	    };
	}
	function create_main_fragment$p(component, ctx) {
		var baseselect_updating = {};

		var baseselect_initial_data = {};
		if (ctx.value  !== void 0) {
			baseselect_initial_data.value = ctx.value ;
			baseselect_updating.value = true;
		}
		if (ctx.disabled  !== void 0) {
			baseselect_initial_data.disabled = ctx.disabled ;
			baseselect_updating.disabled = true;
		}
		if (ctx.width  !== void 0) {
			baseselect_initial_data.width = ctx.width ;
			baseselect_updating.width = true;
		}
		if (ctx.options  !== void 0) {
			baseselect_initial_data.options = ctx.options ;
			baseselect_updating.options = true;
		}
		if (ctx.optgroups  !== void 0) {
			baseselect_initial_data.optgroups = ctx.optgroups ;
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
			baseselect._bind({ value: 1, disabled: 1, width: 1, options: 1, optgroups: 1 }, baseselect.get());
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
			slots: { default: createFragment() },
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
					baseselect_changes.value = ctx.value ;
					baseselect_updating.value = ctx.value  !== void 0;
				}
				if (!baseselect_updating.disabled && changed.disabled) {
					baseselect_changes.disabled = ctx.disabled ;
					baseselect_updating.disabled = ctx.disabled  !== void 0;
				}
				if (!baseselect_updating.width && changed.width) {
					baseselect_changes.width = ctx.width ;
					baseselect_updating.width = ctx.width  !== void 0;
				}
				if (!baseselect_updating.options && changed.options) {
					baseselect_changes.options = ctx.options ;
					baseselect_updating.options = ctx.options  !== void 0;
				}
				if (!baseselect_updating.optgroups && changed.optgroups) {
					baseselect_changes.optgroups = ctx.optgroups ;
					baseselect_updating.optgroups = ctx.optgroups  !== void 0;
				}
				baseselect._set(baseselect_changes);
				baseselect_updating = {};

				var controlgroup_changes = {};
				if (changed.labelWidth) { controlgroup_changes.width = ctx.labelWidth; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.help) { controlgroup_changes.help = ctx.help; }
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
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
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$m(), options.data);
		if (!('labelWidth' in this._state)) { console.warn("<Select> was created without expected data property 'labelWidth'"); }
		if (!('label' in this._state)) { console.warn("<Select> was created without expected data property 'label'"); }
		if (!('help' in this._state)) { console.warn("<Select> was created without expected data property 'help'"); }
		if (!('disabled' in this._state)) { console.warn("<Select> was created without expected data property 'disabled'"); }
		if (!('value' in this._state)) { console.warn("<Select> was created without expected data property 'value'"); }
		if (!('width' in this._state)) { console.warn("<Select> was created without expected data property 'width'"); }
		if (!('options' in this._state)) { console.warn("<Select> was created without expected data property 'options'"); }
		if (!('optgroups' in this._state)) { console.warn("<Select> was created without expected data property 'optgroups'"); }
		this._intro = true;

		this._fragment = create_main_fragment$p(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Select.prototype, protoDev);

	Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/editor/LocaleSelect.html generated by Svelte v2.16.1 */



	function options$1(ref) {
	    var $locales = ref.$locales;

	    return $locales.map(function (t) {
	        return {
	            value: t.value,
	            label: ((t.label) + " (" + (t.value) + ")")
	        };
	    });
	}
	function create_main_fragment$q(component, ctx) {
		var select_updating = {};

		var select_initial_data = {
		 	label: __('describe / locale-select / language'),
		 	options: ctx.options,
		 	width: "200px",
		 	labelWidth: "80px"
		 };
		if (ctx.$language !== void 0) {
			select_initial_data.value = ctx.$language;
			select_updating.value = true;
		}
		var select = new Select({
			root: component.root,
			store: component.store,
			data: select_initial_data,
			_bind: function _bind(changed, childState) {
				var newStoreState = {};
				if (!select_updating.value && changed.value) {
					newStoreState.language = childState.value;
				}
				component.store.set(newStoreState);
				select_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			select._bind({ value: 1 }, select.get());
		});

		return {
			c: function create() {
				select._fragment.c();
			},

			m: function mount(target, anchor) {
				select._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var select_changes = {};
				if (changed.options) { select_changes.options = ctx.options; }
				if (!select_updating.value && changed.$language) {
					select_changes.value = ctx.$language;
					select_updating.value = ctx.$language !== void 0;
				}
				select._set(select_changes);
				select_updating = {};
			},

			d: function destroy(detach) {
				select.destroy(detach);
			}
		};
	}

	function LocaleSelect(options) {
		this._debugName = '<LocaleSelect>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<LocaleSelect> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["locales","language"]), options.data);
		this.store._add(this, ["locales","language"]);

		this._recompute({ $locales: 1 }, this._state);
		if (!('$locales' in this._state)) { console.warn("<LocaleSelect> was created without expected data property '$locales'"); }

		if (!('$language' in this._state)) { console.warn("<LocaleSelect> was created without expected data property '$language'"); }
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$q(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(LocaleSelect.prototype, protoDev);

	LocaleSelect.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('options' in newState && !this._updatingReadonlyProperty) { throw new Error("<LocaleSelect>: Cannot set read-only property 'options'"); }
	};

	LocaleSelect.prototype._recompute = function _recompute(changed, state) {
		if (changed.$locales) {
			if (this._differs(state.options, (state.options = options$1(state)))) { changed.options = true; }
		}
	};

	/* node_modules/@datawrapper/controls/Number.html generated by Svelte v2.16.1 */



	function data$n() {
	    return {
	        width: '100px',
	        multiply: 1,
	        unit: '',
	        slider: true,
	        min: 0,
	        max: 100,
	        disabled: false,
	        step: 1
	    };
	}
	function create_main_fragment$r(component, ctx) {
		var basenumber_updating = {}, controlgroup_updating = {};

		var basenumber_initial_data = {
		 	disabled: ctx.disabled,
		 	unit: ctx.unit,
		 	multiply: ctx.multiply,
		 	step: ctx.step,
		 	min: ctx.min,
		 	max: ctx.max,
		 	slider: ctx.slider
		 };
		if (ctx.value
	         !== void 0) {
			basenumber_initial_data.value = ctx.value
	        ;
			basenumber_updating.value = true;
		}
		var basenumber = new BaseNumber({
			root: component.root,
			store: component.store,
			data: basenumber_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!basenumber_updating.value && changed.value) {
					newState.value = childState.value;
				}
				component._set(newState);
				basenumber_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			basenumber._bind({ value: 1 }, basenumber.get());
		});

		component.refs.baseNumber = basenumber;

		var controlgroup_initial_data = {
		 	disabled: ctx.disabled,
		 	type: "number",
		 	label: ctx.label,
		 	valign: "middle"
		 };
		if (ctx.width  !== void 0) {
			controlgroup_initial_data.width = ctx.width ;
			controlgroup_updating.width = true;
		}
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!controlgroup_updating.width && changed.width) {
					newState.width = childState.width;
				}
				component._set(newState);
				controlgroup_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			controlgroup._bind({ width: 1 }, controlgroup.get());
		});

		return {
			c: function create() {
				basenumber._fragment.c();
				controlgroup._fragment.c();
			},

			m: function mount(target, anchor) {
				basenumber._mount(controlgroup._slotted.default, null);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var basenumber_changes = {};
				if (changed.disabled) { basenumber_changes.disabled = ctx.disabled; }
				if (changed.unit) { basenumber_changes.unit = ctx.unit; }
				if (changed.multiply) { basenumber_changes.multiply = ctx.multiply; }
				if (changed.step) { basenumber_changes.step = ctx.step; }
				if (changed.min) { basenumber_changes.min = ctx.min; }
				if (changed.max) { basenumber_changes.max = ctx.max; }
				if (changed.slider) { basenumber_changes.slider = ctx.slider; }
				if (!basenumber_updating.value && changed.value) {
					basenumber_changes.value = ctx.value
	        ;
					basenumber_updating.value = ctx.value
	         !== void 0;
				}
				basenumber._set(basenumber_changes);
				basenumber_updating = {};

				var controlgroup_changes = {};
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (!controlgroup_updating.width && changed.width) {
					controlgroup_changes.width = ctx.width ;
					controlgroup_updating.width = ctx.width  !== void 0;
				}
				controlgroup._set(controlgroup_changes);
				controlgroup_updating = {};
			},

			d: function destroy(detach) {
				basenumber.destroy();
				if (component.refs.baseNumber === basenumber) { component.refs.baseNumber = null; }
				controlgroup.destroy(detach);
			}
		};
	}

	function Number$1(options) {
		this._debugName = '<Number>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$n(), options.data);
		if (!('disabled' in this._state)) { console.warn("<Number> was created without expected data property 'disabled'"); }
		if (!('width' in this._state)) { console.warn("<Number> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<Number> was created without expected data property 'label'"); }
		if (!('value' in this._state)) { console.warn("<Number> was created without expected data property 'value'"); }
		if (!('unit' in this._state)) { console.warn("<Number> was created without expected data property 'unit'"); }
		if (!('multiply' in this._state)) { console.warn("<Number> was created without expected data property 'multiply'"); }
		if (!('step' in this._state)) { console.warn("<Number> was created without expected data property 'step'"); }
		if (!('min' in this._state)) { console.warn("<Number> was created without expected data property 'min'"); }
		if (!('max' in this._state)) { console.warn("<Number> was created without expected data property 'max'"); }
		if (!('slider' in this._state)) { console.warn("<Number> was created without expected data property 'slider'"); }
		this._intro = true;

		this._fragment = create_main_fragment$r(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Number$1.prototype, protoDev);

	Number$1.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Pagination.html generated by Svelte v2.16.1 */

	var VISIBLE_RANGE = 5;

	var isInVisibleRange = function (index, currentPage, maxPageNum) {
	    var top = currentPage + Math.floor(VISIBLE_RANGE / 2);
	    var bottom = currentPage - Math.floor(VISIBLE_RANGE / 2);

	    // handle boundaries where bottom < 0:
	    if (bottom < 0) {
	        bottom = 0;
	        top = VISIBLE_RANGE - 1;
	    }

	    // handle boundaries where top > page.length:
	    if (top >= maxPageNum) {
	        top = maxPageNum;
	        bottom = top - VISIBLE_RANGE + 1;
	    }

	    if (index <= top && index >= bottom) {
	        return true;
	    } else {
	        return false;
	    }
	};

	function currentPage(ref) {
		var limit = ref.limit;
		var offset = ref.offset;

		return Math.ceil(+offset / +limit) || 0;
	}

	function getUrl(ref) {
		var state = ref.state;
		var url = ref.url;

		return function (state) { return (url ? url(state) : '#'); };
	}

	function isActive(ref) {
		var currentPage = ref.currentPage;

		return function (ref) {
			var offset = ref.offset;
			var limit = ref.limit;

			return offset / limit === currentPage;
		};
	}

	function displayItems(ref) {
	    var total = ref.total;
	    var limit = ref.limit;
	    var currentPage = ref.currentPage;

	    // do not render pagination items if `total` isn't set:
	    if (!total) { return []; }

	    // generate an item for every page based on `total`, `limit`, and `offset`:
	    var pages = Array.from({ length: Math.ceil(total / limit) }, function (v, i) { return ({
	        state: { limit: limit, offset: i * limit }
	    }); });

	    return [
	        {
	            text: '«',
	            state: pages[0].state,
	            visible: true
	        } ].concat( pages.map(function (ref, index) {
	            var state = ref.state;

	            return {
	                text: index + 1,
	                state: state,
	                visible: isInVisibleRange(index, currentPage, pages.length - 1)
	            };
	        }),
	        [{
	            text: '»',
	            state: pages[pages.length - 1].state,
	            visible: true
	        }]
	    );
	}

	function data$o() {
	    return {
	        total: null,
	        limit: 10,
	        offset: 0
	    };
	}
	var methods$e = {
	    navigate: function navigate(event, state) {
	        event.preventDefault();
	        this.set({ offset: state.offset });
	        this.fire('navigate', state);
	    }
	};

	var file$o = "node_modules/datawrapper/controls/Pagination.html";

	function click_handler$6(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.navigate(event, ctx.item.state);
	}

	function get_each_context$9(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function create_main_fragment$s(component, ctx) {
		var div, ul;

		var each_value = ctx.displayItems;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$9(component, get_each_context$9(ctx, each_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addLoc(ul, file$o, 1, 4, 29);
				div.className = "pagination";
				addLoc(div, file$o, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.displayItems || changed.isActive || changed.getUrl) {
					each_value = ctx.displayItems;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$9(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$9(component, child_ctx);
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
	}

	// (3:36) {#if item.visible}
	function create_if_block$j(component, ctx) {
		var li, a, text0_value = ctx.item.text, text0, a_href_value, li_class_value, text1;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				a._svelte = { component: component, ctx: ctx };

				addListener(a, "click", click_handler$6);
				a.href = a_href_value = ctx.getUrl(ctx.item.state);
				addLoc(a, file$o, 4, 12, 161);
				li.className = li_class_value = ctx.isActive(ctx.item.state) ? 'active' : '';
				addLoc(li, file$o, 3, 8, 97);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				append(a, text0);
				insert(target, text1, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.displayItems) && text0_value !== (text0_value = ctx.item.text)) {
					setData(text0, text0_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.getUrl || changed.displayItems) && a_href_value !== (a_href_value = ctx.getUrl(ctx.item.state))) {
					a.href = a_href_value;
				}

				if ((changed.isActive || changed.displayItems) && li_class_value !== (li_class_value = ctx.isActive(ctx.item.state) ? 'active' : '')) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(a, "click", click_handler$6);
				if (detach) {
					detachNode(text1);
				}
			}
		};
	}

	// (3:8) {#each displayItems as item}
	function create_each_block$9(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.item.visible) && create_if_block$j(component, ctx);

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.item.visible) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$j(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	function Pagination(options) {
		this._debugName = '<Pagination>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$o(), options.data);

		this._recompute({ limit: 1, offset: 1, state: 1, url: 1, currentPage: 1, total: 1 }, this._state);
		if (!('limit' in this._state)) { console.warn("<Pagination> was created without expected data property 'limit'"); }
		if (!('offset' in this._state)) { console.warn("<Pagination> was created without expected data property 'offset'"); }
		if (!('state' in this._state)) { console.warn("<Pagination> was created without expected data property 'state'"); }
		if (!('url' in this._state)) { console.warn("<Pagination> was created without expected data property 'url'"); }

		if (!('total' in this._state)) { console.warn("<Pagination> was created without expected data property 'total'"); }
		this._intro = true;

		this._fragment = create_main_fragment$s(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Pagination.prototype, protoDev);
	assign(Pagination.prototype, methods$e);

	Pagination.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentPage' in newState && !this._updatingReadonlyProperty) { throw new Error("<Pagination>: Cannot set read-only property 'currentPage'"); }
		if ('getUrl' in newState && !this._updatingReadonlyProperty) { throw new Error("<Pagination>: Cannot set read-only property 'getUrl'"); }
		if ('isActive' in newState && !this._updatingReadonlyProperty) { throw new Error("<Pagination>: Cannot set read-only property 'isActive'"); }
		if ('displayItems' in newState && !this._updatingReadonlyProperty) { throw new Error("<Pagination>: Cannot set read-only property 'displayItems'"); }
	};

	Pagination.prototype._recompute = function _recompute(changed, state) {
		if (changed.limit || changed.offset) {
			if (this._differs(state.currentPage, (state.currentPage = currentPage(state)))) { changed.currentPage = true; }
		}

		if (changed.state || changed.url) {
			if (this._differs(state.getUrl, (state.getUrl = getUrl(state)))) { changed.getUrl = true; }
		}

		if (changed.currentPage) {
			if (this._differs(state.isActive, (state.isActive = isActive(state)))) { changed.isActive = true; }
		}

		if (changed.total || changed.limit || changed.currentPage) {
			if (this._differs(state.displayItems, (state.displayItems = displayItems(state)))) { changed.displayItems = true; }
		}
	};

	/* node_modules/@datawrapper/controls/editor/ProceedButtonNav.html generated by Svelte v2.16.1 */



	function activeIndex$1(ref) {
	    var active = ref.active;
	    var steps = ref.steps;

	    return steps.indexOf(underscore.findWhere(steps, { id: active }));
	}
	var methods$f = {
	    proceed: function proceed(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var steps = ref.steps;
	        var activeIndex = ref.activeIndex;
	        var step = steps[activeIndex + 1].id;
	        this.set({ active: step });
	        window.scrollTo(0, 65);
	        var ref$1 = this.store.get();
	        var id = ref$1.id;
	        window.history.pushState({ step: step, id: id }, '', ("/edit/" + id + "/" + step));
	    },
	    back: function back(event) {
	        event.preventDefault();
	        var ref = this.get();
	        var steps = ref.steps;
	        var activeIndex = ref.activeIndex;
	        var step = steps[activeIndex - 1].id;
	        this.set({ active: step });
	        window.scrollTo(0, 65);
	        var ref$1 = this.store.get();
	        var id = ref$1.id;
	        window.history.pushState({ step: step, id: id }, '', ("/edit/" + id + "/" + step));
	    }
	};

	var file$p = "node_modules/datawrapper/controls/editor/ProceedButtonNav.html";

	function create_main_fragment$t(component, ctx) {
		var div1, div0, text;

		var if_block0 = (ctx.activeIndex > 0) && create_if_block_1$c(component);

		var if_block1 = (ctx.activeIndex < ctx.steps.length-1) && create_if_block$k(component);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				if (if_block0) { if_block0.c(); }
				text = createText(" ");
				if (if_block1) { if_block1.c(); }
				div0.className = "btn-group buttons";
				addLoc(div0, file$p, 1, 4, 35);
				setStyle(div1, "margin-top", "40px");
				addLoc(div1, file$p, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				if (if_block0) { if_block0.m(div0, null); }
				append(div0, text);
				if (if_block1) { if_block1.m(div0, null); }
			},

			p: function update(changed, ctx) {
				if (ctx.activeIndex > 0) {
					if (!if_block0) {
						if_block0 = create_if_block_1$c(component);
						if_block0.c();
						if_block0.m(div0, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.activeIndex < ctx.steps.length-1) {
					if (!if_block1) {
						if_block1 = create_if_block$k(component);
						if_block1.c();
						if_block1.m(div0, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (if_block0) { if_block0.d(); }
				if (if_block1) { if_block1.d(); }
			}
		};
	}

	// (3:8) {#if activeIndex > 0}
	function create_if_block_1$c(component, ctx) {
		var a, i, text0, text1_value = __('Back'), text1;

		function click_handler(event) {
			component.back(event);
		}

		return {
			c: function create() {
				a = createElement("a");
				i = createElement("i");
				text0 = createText(" ");
				text1 = createText(text1_value);
				i.className = "fa fa-chevron-left fa-fw icon-btn-left";
				addLoc(i, file$p, 3, 68, 165);
				addListener(a, "click", click_handler);
				a.className = "btn btn-tabback";
				a.href = "#";
				addLoc(a, file$p, 3, 8, 105);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, i);
				append(a, text0);
				append(a, text1);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	// (5:14) {#if activeIndex < steps.length-1}
	function create_if_block$k(component, ctx) {
		var a, text0_value = __('Proceed'), text0, text1, i;

		function click_handler(event) {
			component.proceed(event);
		}

		return {
			c: function create() {
				a = createElement("a");
				text0 = createText(text0_value);
				text1 = createText(" ");
				i = createElement("i");
				i.className = "fa fa-chevron-right fa-fw icon-btn-right";
				addLoc(i, file$p, 6, 28, 394);
				addListener(a, "click", click_handler);
				a.href = "#proceed";
				a.className = " btn proceed-btn";
				addLoc(a, file$p, 5, 8, 295);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, text0);
				append(a, text1);
				append(a, i);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	function ProceedButtonNav(options) {
		this._debugName = '<ProceedButtonNav>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);

		this._recompute({ active: 1, steps: 1 }, this._state);
		if (!('active' in this._state)) { console.warn("<ProceedButtonNav> was created without expected data property 'active'"); }
		if (!('steps' in this._state)) { console.warn("<ProceedButtonNav> was created without expected data property 'steps'"); }
		this._intro = true;

		this._fragment = create_main_fragment$t(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ProceedButtonNav.prototype, protoDev);
	assign(ProceedButtonNav.prototype, methods$f);

	ProceedButtonNav.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('activeIndex' in newState && !this._updatingReadonlyProperty) { throw new Error("<ProceedButtonNav>: Cannot set read-only property 'activeIndex'"); }
	};

	ProceedButtonNav.prototype._recompute = function _recompute(changed, state) {
		if (changed.active || changed.steps) {
			if (this._differs(state.activeIndex, (state.activeIndex = activeIndex$1(state)))) { changed.activeIndex = true; }
		}
	};

	/* node_modules/@datawrapper/controls/ProgressBar.html generated by Svelte v2.16.1 */

	function data$p() {
	    return {
	        visible: true,
	        status: 0,
	        height: 20
	    };
	}
	var file$q = "node_modules/datawrapper/controls/ProgressBar.html";

	function create_main_fragment$u(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.visible) && create_if_block$l(component, ctx);

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.visible) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$l(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if visible}
	function create_if_block$l(component, ctx) {
		var div1, div0;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "bar svelte-14ji5mn";
				setStyle(div0, "width", "" + ctx.status + "%");
				addLoc(div0, file$q, 2, 4, 69);
				div1.className = "progress svelte-14ji5mn";
				setStyle(div1, "height", "" + ctx.height + "px");
				addLoc(div1, file$q, 1, 0, 14);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
			},

			p: function update(changed, ctx) {
				if (changed.status) {
					setStyle(div0, "width", "" + ctx.status + "%");
				}

				if (changed.height) {
					setStyle(div1, "height", "" + ctx.height + "px");
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}
			}
		};
	}

	function ProgressBar(options) {
		this._debugName = '<ProgressBar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$p(), options.data);
		if (!('visible' in this._state)) { console.warn("<ProgressBar> was created without expected data property 'visible'"); }
		if (!('height' in this._state)) { console.warn("<ProgressBar> was created without expected data property 'height'"); }
		if (!('status' in this._state)) { console.warn("<ProgressBar> was created without expected data property 'status'"); }
		this._intro = true;

		this._fragment = create_main_fragment$u(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ProgressBar.prototype, protoDev);

	ProgressBar.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Radio.html generated by Svelte v2.16.1 */

	function data$q() {
	    return {
	        value: null,
	        disabled: false,
	        indeterminate: false,
	        width: 'auto',
	        valign: 'top',
	        inline: true
	    };
	}
	function onstate$2(ref) {
	    var changed = ref.changed;
	    var previous = ref.previous;

	    if (previous && changed.value) {
	        this.set({ indeterminate: false });
	    }
	}
	var file$r = "node_modules/datawrapper/controls/Radio.html";

	function get_each_context$a(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$v(component, ctx) {
		var div;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$a(component, get_each_context$a(ctx, each_value, i));
		}

		var controlgroup_initial_data = {
		 	width: ctx.width,
		 	type: "radio",
		 	valign: "top",
		 	label: ctx.label,
		 	disabled: ctx.disabled
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				controlgroup._fragment.c();
				div.className = "svelte-dra0qn";
				toggleClass(div, "inline", ctx.inline);
				toggleClass(div, "indeterminate", ctx.indeterminate);
				addLoc(div, file$r, 1, 4, 99);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				controlgroup._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.options || changed.disabled || changed.value) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$a(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$a(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (changed.inline) {
					toggleClass(div, "inline", ctx.inline);
				}

				if (changed.indeterminate) {
					toggleClass(div, "indeterminate", ctx.indeterminate);
				}

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				controlgroup.destroy(detach);
			}
		};
	}

	// (8:12) {#if opt.help}
	function create_if_block$m(component, ctx) {
		var div, raw_value = ctx.opt.help;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-dra0qn";
				addLoc(div, file$r, 8, 12, 479);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.options) && raw_value !== (raw_value = ctx.opt.help)) {
					div.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (3:8) {#each options as opt}
	function create_each_block$a(component, ctx) {
		var label, input, input_value_value, span0, text0, span1, text1_value = ctx.opt.label, text1, text2, text3, label_title_value;

		function input_change_handler() {
			component.set({ value: input.__value });
		}

		var if_block = (ctx.opt.help) && create_if_block$m(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				span0 = createElement("span");
				text0 = createText(" ");
				span1 = createElement("span");
				text1 = createText(text1_value);
				text2 = createText("\n            ");
				if (if_block) { if_block.c(); }
				text3 = createText("\n        ");
				component._bindingGroups[0].push(input);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "radio");
				input.__value = input_value_value = ctx.opt.value;
				input.value = input.__value;
				input.disabled = ctx.disabled;
				input.className = "svelte-dra0qn";
				addLoc(input, file$r, 4, 12, 264);
				span0.className = "css-ui svelte-dra0qn";
				addLoc(span0, file$r, 4, 97, 349);
				span1.className = "svelte-dra0qn";
				addLoc(span1, file$r, 4, 131, 383);
				label.title = label_title_value = ctx.opt.tooltip||'';
				label.className = "svelte-dra0qn";
				toggleClass(label, "disabled", ctx.disabled);
				toggleClass(label, "has-help", ctx.opt.help);
				addLoc(label, file$r, 3, 8, 177);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, input);

				input.checked = input.__value === ctx.value;

				append(label, span0);
				append(label, text0);
				append(label, span1);
				append(span1, text1);
				append(label, text2);
				if (if_block) { if_block.m(label, null); }
				append(label, text3);
			},

			p: function update(changed, ctx) {
				if (changed.value) { input.checked = input.__value === ctx.value; }
				if ((changed.options) && input_value_value !== (input_value_value = ctx.opt.value)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if ((changed.options) && text1_value !== (text1_value = ctx.opt.label)) {
					setData(text1, text1_value);
				}

				if (ctx.opt.help) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$m(component, ctx);
						if_block.c();
						if_block.m(label, text3);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.options) && label_title_value !== (label_title_value = ctx.opt.tooltip||'')) {
					label.title = label_title_value;
				}

				if (changed.disabled) {
					toggleClass(label, "disabled", ctx.disabled);
				}

				if (changed.options) {
					toggleClass(label, "has-help", ctx.opt.help);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);
				if (if_block) { if_block.d(); }
			}
		};
	}

	function Radio(options) {
		var this$1 = this;

		this._debugName = '<Radio>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$q(), options.data);
		if (!('width' in this._state)) { console.warn("<Radio> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<Radio> was created without expected data property 'label'"); }
		if (!('disabled' in this._state)) { console.warn("<Radio> was created without expected data property 'disabled'"); }
		if (!('options' in this._state)) { console.warn("<Radio> was created without expected data property 'options'"); }
		if (!('value' in this._state)) { console.warn("<Radio> was created without expected data property 'value'"); }
		this._bindingGroups = [[]];
		this._intro = true;

		this._handlers.state = [onstate$2];

		onstate$2.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$v(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Radio.prototype, protoDev);

	Radio.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Reset.html generated by Svelte v2.16.1 */

	function data$r() {
	    return {
	        defaultValue: 0
	    };
	}
	var methods$g = {
	    onReset: function onReset() {
	        var ref = this.get();
	        var defaultValue = ref.defaultValue;
	        this.set({ value: defaultValue });
	    }
	};

	var file$s = "node_modules/datawrapper/controls/Reset.html";

	function create_main_fragment$w(component, ctx) {
		var button, i;

		function click_handler(event) {
			component.onReset();
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				i.className = "fa fa-undo";
				addLoc(i, file$s, 0, 96, 96);
				addListener(button, "click", click_handler);
				button.className = "undo svelte-e12pgc";
				button.title = "Reset";
				toggleClass(button, "inactive", ctx.value === ctx.defaultValue);
				addLoc(button, file$s, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
			},

			p: function update(changed, ctx) {
				if ((changed.value || changed.defaultValue)) {
					toggleClass(button, "inactive", ctx.value === ctx.defaultValue);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	function Reset(options) {
		this._debugName = '<Reset>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$r(), options.data);
		if (!('value' in this._state)) { console.warn("<Reset> was created without expected data property 'value'"); }
		if (!('defaultValue' in this._state)) { console.warn("<Reset> was created without expected data property 'defaultValue'"); }
		this._intro = true;

		this._fragment = create_main_fragment$w(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Reset.prototype, protoDev);
	assign(Reset.prototype, methods$g);

	Reset.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Section.html generated by Svelte v2.16.1 */

	var file$t = "node_modules/datawrapper/controls/Section.html";

	function create_main_fragment$x(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.id==ctx.active) && create_if_block$n(component, ctx);

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.id==ctx.active) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$n(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if id==active}
	function create_if_block$n(component, ctx) {
		var div1, fieldset, div0, slot_content_default = component._slotted.default, div1_class_value;

		return {
			c: function create() {
				div1 = createElement("div");
				fieldset = createElement("fieldset");
				div0 = createElement("div");
				div0.className = "control-group vis-option-group";
				addLoc(div0, file$t, 3, 8, 83);
				fieldset.id = "visOptions";
				addLoc(fieldset, file$t, 2, 4, 48);
				div1.className = div1_class_value = "section " + ctx.id;
				addLoc(div1, file$t, 1, 0, 17);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, fieldset);
				append(fieldset, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
				}
			},

			p: function update(changed, ctx) {
				if ((changed.id) && div1_class_value !== (div1_class_value = "section " + ctx.id)) {
					div1.className = div1_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (slot_content_default) {
					reinsertChildren(div0, slot_content_default);
				}
			}
		};
	}

	function Section(options) {
		this._debugName = '<Section>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('id' in this._state)) { console.warn("<Section> was created without expected data property 'id'"); }
		if (!('active' in this._state)) { console.warn("<Section> was created without expected data property 'active'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$x(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Section.prototype, protoDev);

	Section.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/SelectAxisColumn.html generated by Svelte v2.16.1 */



	function columns(ref) {
	    var axis = ref.axis;
	    var $visualization = ref.$visualization;
	    var $dataset = ref.$dataset;

	    var columns = [];
	    // const axisMeta =
	    if (!$dataset || !$visualization || !axis) { return []; }
	    $dataset.eachColumn(function (column) {
	        if ($visualization.axes[axis].accepts.indexOf(column.type()) > -1) {
	            columns.push({
	                name: column.name()
	            });
	        }
	    });
	    return columns;
	}
	function data$s() {
	    return {
	        selected: false,
	        width: '200px',
	        valign: 'baseline'
	    };
	}
	function oncreate$6() {
	    var this$1 = this;

	    this.store.on('state', function (ref) {
	        var current = ref.current;
	        var changed = ref.changed;

	        if (changed.visualization) {
	            if (!this$1.get) { return; }
	            var state = this$1.get();
	            if (!state) { return; }

	            // initialize if state is not yet set
	            if (!state.selected && current.visualization) {
	                var selected = this$1.store.getMetadata('axes', {})[this$1.get().axis];
	                this$1.set({ selected: selected });
	            }
	        }
	    });
	}
	function onstate$3(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.selected) {
	        if (current.selected) {
	            var ref$1 = this.get();
	            var axis = ref$1.axis;
	            var axes = clone(this.store.getMetadata('axes', {}));
	            if (current.selected === '-') { delete axes[axis]; }
	            else { axes[axis] = current.selected; }
	            this.store.setMetadata('axes', axes);
	        }
	    }
	}
	var file$u = "node_modules/datawrapper/controls/SelectAxisColumn.html";

	function get_each_context$b(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.column = list[i];
		return child_ctx;
	}

	function create_main_fragment$y(component, ctx) {
		var select, if_block_anchor, select_updating = false;

		var if_block = (ctx.$visualization && ctx.$visualization.axes[ctx.axis].optional) && create_if_block$o(component, ctx);

		var each_value = ctx.columns;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$b(component, get_each_context$b(ctx, each_value, i));
		}

		function select_change_handler() {
			select_updating = true;
			component.set({ selected: selectValue(select) });
			select_updating = false;
		}

		var controlgroup_initial_data = {
		 	width: ctx.width,
		 	valign: ctx.valign,
		 	label: ctx.label
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				select = createElement("select");
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				controlgroup._fragment.c();
				addListener(select, "change", select_change_handler);
				if (!('selected' in ctx)) { component.root._beforecreate.push(select_change_handler); }
				select.className = "select-css";
				setStyle(select, "width", "calc(100% - 50px)");
				addLoc(select, file$u, 1, 4, 69);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, select);
				if (if_block) { if_block.m(select, null); }
				append(select, if_block_anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(select, null);
				}

				selectOption(select, ctx.selected);

				controlgroup._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.$visualization && ctx.$visualization.axes[ctx.axis].optional) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$o(component, ctx);
						if_block.c();
						if_block.m(select, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.columns) {
					each_value = ctx.columns;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$b(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$b(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (!select_updating && changed.selected) { selectOption(select, ctx.selected); }

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.valign) { controlgroup_changes.valign = ctx.valign; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(); }

				destroyEach(each_blocks, detach);

				removeListener(select, "change", select_change_handler);
				controlgroup.destroy(detach);
			}
		};
	}

	// (3:8) {#if $visualization && $visualization.axes[axis].optional}
	function create_if_block$o(component, ctx) {
		var option, text_value = ctx.axis['na-label']||'--', text;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = "-";
				option.value = option.__value;
				addLoc(option, file$u, 3, 8, 227);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.axis) && text_value !== (text_value = ctx.axis['na-label']||'--')) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	// (5:14) {#each columns as column}
	function create_each_block$b(component, ctx) {
		var option, text_value = ctx.column.name, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.column.name;
				option.value = option.__value;
				addLoc(option, file$u, 5, 8, 327);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.columns) && text_value !== (text_value = ctx.column.name)) {
					setData(text, text_value);
				}

				if ((changed.columns) && option_value_value !== (option_value_value = ctx.column.name)) {
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

	function SelectAxisColumn(options) {
		var this$1 = this;

		this._debugName = '<SelectAxisColumn>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<SelectAxisColumn> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(assign(this.store._init(["visualization","dataset"]), data$s()), options.data);
		this.store._add(this, ["visualization","dataset"]);

		this._recompute({ axis: 1, $visualization: 1, $dataset: 1 }, this._state);
		if (!('axis' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'axis'"); }
		if (!('$visualization' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property '$visualization'"); }
		if (!('$dataset' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property '$dataset'"); }
		if (!('width' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'width'"); }
		if (!('valign' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'valign'"); }
		if (!('label' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'label'"); }
		if (!('selected' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'selected'"); }
		this._intro = true;

		this._handlers.state = [onstate$3];

		this._handlers.destroy = [removeFromStore];

		onstate$3.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$y(this, this._state);

		this.root._oncreate.push(function () {
			oncreate$6.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(SelectAxisColumn.prototype, protoDev);

	SelectAxisColumn.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('columns' in newState && !this._updatingReadonlyProperty) { throw new Error("<SelectAxisColumn>: Cannot set read-only property 'columns'"); }
	};

	SelectAxisColumn.prototype._recompute = function _recompute(changed, state) {
		if (changed.axis || changed.$visualization || changed.$dataset) {
			if (this._differs(state.columns, (state.columns = columns(state)))) { changed.columns = true; }
		}
	};

	/* node_modules/@datawrapper/controls/SelectButtons.html generated by Svelte v2.16.1 */



	function data$t() {
	    return {
	        disabled: false,
	        width: 'auto',
	        value: 'red',
	        options: [],
	        optgroups: []
	    };
	}
	var methods$h = {
	    select: function select(option) {
	        this.set({ value: option.value });
	    }
	};

	var file$v = "node_modules/datawrapper/controls/SelectButtons.html";

	function get_each_context$c(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.option = list[i];
		return child_ctx;
	}

	function create_main_fragment$z(component, ctx) {
		var div, text, slot_content_default = component._slotted.default, slot_content_default_before;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$c(component, get_each_context$c(ctx, each_value, i));
		}

		var controlgroup_initial_data = {
		 	type: "select",
		 	width: ctx.width,
		 	valign: "middle",
		 	inline: true,
		 	label: ctx.label,
		 	disabled: ctx.disabled
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text = createText("\n    ");
				controlgroup._fragment.c();
				div.className = "btn-group svelte-l5q6v5";
				addLoc(div, file$v, 1, 4, 119);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				append(controlgroup._slotted.default, text);

				if (slot_content_default) {
					append(controlgroup._slotted.default, slot_content_default_before || (slot_content_default_before = createComment()));
					append(controlgroup._slotted.default, slot_content_default);
				}

				controlgroup._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.disabled || changed.value || changed.options) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$c(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$c(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				var controlgroup_changes = {};
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}

				controlgroup.destroy(detach);
			}
		};
	}

	// (5:12) {#if option.label}
	function create_if_block_1$d(component, ctx) {
		var span, raw_value = ctx.option.label;

		return {
			c: function create() {
				span = createElement("span");
				addLoc(span, file$v, 5, 12, 356);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				span.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.options) && raw_value !== (raw_value = ctx.option.label)) {
					span.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (7:18) {#if option.svg}
	function create_if_block$p(component, ctx) {
		var svg, path, path_d_value;

		return {
			c: function create() {
				svg = createSvgElement("svg");
				path = createSvgElement("path");
				setStyle(path, "stroke-width", (ctx.option.stroke || 0));
				setAttribute(path, "d", path_d_value = ctx.option.svg);
				setAttribute(path, "class", "svelte-glvnmn");
				toggleClass(path, "stroke", ctx.option.stroke);
				toggleClass(path, "crisp", ctx.option.crisp);
				toggleClass(path, "selected", ctx.value === ctx.option.value);
				addLoc(path, file$v, 8, 16, 566);
				setAttribute(svg, "height", "16");
				setAttribute(svg, "viewBox", "0 0 24 24");
				setAttribute(svg, "xmlns", "http://www.w3.org/2000/svg");
				setAttribute(svg, "fill-rule", "evenodd");
				setAttribute(svg, "clip-rule", "evenodd");
				setAttribute(svg, "class", "svelte-glvnmn");
				addLoc(svg, file$v, 7, 12, 437);
			},

			m: function mount(target, anchor) {
				insert(target, svg, anchor);
				append(svg, path);
			},

			p: function update(changed, ctx) {
				if (changed.options) {
					setStyle(path, "stroke-width", (ctx.option.stroke || 0));
				}

				if ((changed.options) && path_d_value !== (path_d_value = ctx.option.svg)) {
					setAttribute(path, "d", path_d_value);
				}

				if (changed.options) {
					toggleClass(path, "stroke", ctx.option.stroke);
					toggleClass(path, "crisp", ctx.option.crisp);
				}

				if ((changed.value || changed.options)) {
					toggleClass(path, "selected", ctx.value === ctx.option.value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(svg);
				}
			}
		};
	}

	// (3:8) {#each options as option}
	function create_each_block$c(component, ctx) {
		var text, if_block1_anchor;

		var if_block0 = (ctx.option.label) && create_if_block_1$d(component, ctx);

		var if_block1 = (ctx.option.svg) && create_if_block$p(component, ctx);

		var basetogglebutton_initial_data = {
		 	notoggle: "1",
		 	disabled: ctx.disabled,
		 	value: ctx.value === ctx.option.value
		 };
		var basetogglebutton = new BaseToggleButton({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: basetogglebutton_initial_data
		});

		basetogglebutton.on("select", function(event) {
			component.select(ctx.option);
		});

		return {
			c: function create() {
				if (if_block0) { if_block0.c(); }
				text = createText(" ");
				if (if_block1) { if_block1.c(); }
				if_block1_anchor = createComment();
				basetogglebutton._fragment.c();
			},

			m: function mount(target, anchor) {
				if (if_block0) { if_block0.m(basetogglebutton._slotted.default, null); }
				append(basetogglebutton._slotted.default, text);
				if (if_block1) { if_block1.m(basetogglebutton._slotted.default, null); }
				append(basetogglebutton._slotted.default, if_block1_anchor);
				basetogglebutton._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.option.label) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$d(component, ctx);
						if_block0.c();
						if_block0.m(text.parentNode, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.option.svg) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$p(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				var basetogglebutton_changes = {};
				if (changed.disabled) { basetogglebutton_changes.disabled = ctx.disabled; }
				if (changed.value || changed.options) { basetogglebutton_changes.value = ctx.value === ctx.option.value; }
				basetogglebutton._set(basetogglebutton_changes);
			},

			d: function destroy(detach) {
				if (if_block0) { if_block0.d(); }
				if (if_block1) { if_block1.d(); }
				basetogglebutton.destroy(detach);
			}
		};
	}

	function SelectButtons(options) {
		this._debugName = '<SelectButtons>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$t(), options.data);
		if (!('width' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'label'"); }
		if (!('disabled' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'disabled'"); }
		if (!('options' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'options'"); }
		if (!('value' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'value'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$z(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(SelectButtons.prototype, protoDev);
	assign(SelectButtons.prototype, methods$h);

	SelectButtons.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Switch.html generated by Svelte v2.16.1 */



	function data$u() {
	    return {
	        value: false,
	        hasHelp: false,
	        disabled_msg: '',
	        disabled_state: 'auto',
	        disabled: false,
	        highlight: false,
	        indeterminate: false
	    };
	}
	var methods$i = {
	    toggle: function toggle() {
	        var ref = this.get();
	        var disabled = ref.disabled;
	        var indeterminate = ref.indeterminate;
	        if (disabled) { return; }
	        this.set({ value: indeterminate ? true : !this.get().value, indeterminate: false });
	    }
	};

	function oncreate$7() {
	    this.set({
	        hasHelp: this.options && this.options.slots ? !!this.options.slots.help : false
	    });
	}
	function onstate$4(ref) {
	    var this$1 = this;
	    var changed = ref.changed;
	    var current = ref.current;
	    var previous = ref.previous;

	    if (changed.value && current.value) {
	        this.set({ highlight: true });
	        setTimeout(function () {
	            this$1.set({ highlight: false });
	        }, 300);
	    }
	}
	var file$w = "node_modules/datawrapper/controls/Switch.html";

	function create_main_fragment$A(component, ctx) {
		var div, text0, label, button, input, input_class_value, span, text1, raw_before, label_class_value, text2, current_block_type_index, if_block1;

		var if_block0 = (ctx.hasHelp) && create_if_block_2$4(component);

		function input_change_handler() {
			component.set({ value: input.checked, indeterminate: input.indeterminate });
		}

		function click_handler(event) {
			component.toggle();
		}

		var if_block_creators = [
			create_if_block$q,
			create_if_block_1$e
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.disabled && ctx.disabled_msg) { return 0; }
			if ((!ctx.disabled || ctx.disabled_state == 'on') && ctx.value && !ctx.indeterminate) { return 1; }
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
		}

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n    ");
				label = createElement("label");
				button = createElement("button");
				input = createElement("input");
				span = createElement("span");
				text1 = createText("\n        ");
				raw_before = createElement('noscript');
				text2 = createText("\n    ");
				if (if_block1) { if_block1.c(); }
				addListener(input, "change", input_change_handler);
				if (!('value' in ctx && 'indeterminate' in ctx)) { component.root._beforecreate.push(input_change_handler); }
				input.className = input_class_value = "" + (ctx.disabled && ctx.disabled_state == 'on' ? 'disabled-force-checked' : ctx.disabled && ctx.disabled_state == 'off' ? 'disabled-force-unchecked' : '') + " svelte-f43ms8";
				input.disabled = ctx.disabled;
				setAttribute(input, "type", "checkbox");
				addLoc(input, file$w, 8, 12, 320);
				span.className = "slider round svelte-f43ms8";
				addLoc(span, file$w, 14, 14, 643);
				addListener(button, "click", click_handler);
				button.className = "switch svelte-f43ms8";
				addLoc(button, file$w, 7, 8, 264);
				label.className = label_class_value = "switch-outer " + (ctx.disabled? 'disabled' :'') + " svelte-f43ms8";
				setStyle(label, "padding-left", "40px");
				addLoc(label, file$w, 6, 4, 173);
				div.className = "control-group vis-option-group vis-option-type-switch svelte-f43ms8";
				toggleClass(div, "highlight", ctx.highlight);
				addLoc(div, file$w, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) { if_block0.m(div, null); }
				append(div, text0);
				append(div, label);
				append(label, button);
				append(button, input);

				input.checked = ctx.value;
				input.indeterminate = ctx.indeterminate
	                ;

				append(button, span);
				append(label, text1);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.label);
				append(div, text2);
				if (~current_block_type_index) { if_blocks[current_block_type_index].i(div, null); }
			},

			p: function update(changed, ctx) {
				if (ctx.hasHelp) {
					if (!if_block0) {
						if_block0 = create_if_block_2$4(component);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.value) { input.checked = ctx.value; }
				if (changed.indeterminate) { input.indeterminate = ctx.indeterminate
	                ; }
				if ((changed.disabled || changed.disabled_state) && input_class_value !== (input_class_value = "" + (ctx.disabled && ctx.disabled_state == 'on' ? 'disabled-force-checked' : ctx.disabled && ctx.disabled_state == 'off' ? 'disabled-force-unchecked' : '') + " svelte-f43ms8")) {
					input.className = input_class_value;
				}

				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.label) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.label);
				}

				if ((changed.disabled) && label_class_value !== (label_class_value = "switch-outer " + (ctx.disabled? 'disabled' :'') + " svelte-f43ms8")) {
					label.className = label_class_value;
				}

				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) { if_blocks[current_block_type_index].p(changed, ctx); }
				} else {
					if (if_block1) {
						groupOutros();
						if_block1.o(function() {
							if_blocks[previous_block_index].d(1);
							if_blocks[previous_block_index] = null;
						});
					}

					if (~current_block_type_index) {
						if_block1 = if_blocks[current_block_type_index];
						if (!if_block1) {
							if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
							if_block1.c();
						}
						if_block1.i(div, null);
					} else {
						if_block1 = null;
					}
				}

				if (changed.highlight) {
					toggleClass(div, "highlight", ctx.highlight);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) { if_block0.d(); }
				removeListener(input, "change", input_change_handler);
				removeListener(button, "click", click_handler);
				if (~current_block_type_index) { if_blocks[current_block_type_index].d(); }
			}
		};
	}

	// (2:4) {#if hasHelp}
	function create_if_block_2$4(component, ctx) {
		var slot_content_help = component._slotted.help;

		var help = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				help._fragment.c();
			},

			m: function mount(target, anchor) {
				if (slot_content_help) {
					append(help._slotted.default, slot_content_help);
				}

				help._mount(target, anchor);
			},

			d: function destroy(detach) {
				if (slot_content_help) {
					reinsertChildren(help._slotted.default, slot_content_help);
				}

				help.destroy(detach);
			}
		};
	}

	// (25:12) {#if (!disabled || disabled_state == 'on') && value && !indeterminate}
	function create_if_block_1$e(component, ctx) {
		var div1, div0, slot_content_default = component._slotted.default, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "switch-content svelte-f43ms8";
				addLoc(div0, file$w, 26, 8, 1046);
				setStyle(div1, "clear", "both");
				addLoc(div1, file$w, 25, 4, 995);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
				}

				current = true;
			},

			p: noop,

			i: function intro(target, anchor) {
				if (current) { return; }
				if (component.root._intro) {
					if (div1_transition) { div1_transition.invalidate(); }

					component.root._aftercreate.push(function () {
						if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, true); }
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) { return; }

				if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, false); }
				div1_transition.run(0, function () {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				if (slot_content_default) {
					reinsertChildren(div0, slot_content_default);
				}

				if (detach) {
					if (div1_transition) { div1_transition.abort(); }
				}
			}
		};
	}

	// (19:4) {#if disabled && disabled_msg}
	function create_if_block$q(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-f43ms8";
				addLoc(div0, file$w, 20, 8, 822);
				setStyle(div1, "clear", "both");
				addLoc(div1, file$w, 19, 4, 771);
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
				if (current) { return; }
				if (component.root._intro) {
					if (div1_transition) { div1_transition.invalidate(); }

					component.root._aftercreate.push(function () {
						if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, true); }
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) { return; }

				if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, false); }
				div1_transition.run(0, function () {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
					if (div1_transition) { div1_transition.abort(); }
				}
			}
		};
	}

	function Switch(options) {
		var this$1 = this;

		this._debugName = '<Switch>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$u(), options.data);
		if (!('hasHelp' in this._state)) { console.warn("<Switch> was created without expected data property 'hasHelp'"); }
		if (!('disabled' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled'"); }
		if (!('disabled_state' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled_state'"); }
		if (!('value' in this._state)) { console.warn("<Switch> was created without expected data property 'value'"); }
		if (!('indeterminate' in this._state)) { console.warn("<Switch> was created without expected data property 'indeterminate'"); }
		if (!('label' in this._state)) { console.warn("<Switch> was created without expected data property 'label'"); }
		if (!('disabled_msg' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled_msg'"); }
		this._intro = true;

		this._handlers.state = [onstate$4];

		this._slotted = options.slots || {};

		onstate$4.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$A(this, this._state);

		this.root._oncreate.push(function () {
			oncreate$7.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Switch.prototype, protoDev);
	assign(Switch.prototype, methods$i);

	Switch.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/Table.html generated by Svelte v2.16.1 */

	var ORDER = { true: 'ASC', false: 'DESC' };
	var DEFAULT_ORDER = ORDER.true;

	function isActive$1(ref) {
		var orderBy = ref.orderBy;

		return function (item) { return orderBy === item.orderBy; };
	}

	function isAscending(ref) {
		var order = ref.order;

		return order === DEFAULT_ORDER;
	}

	function data$v() {
		return {
	    order: DEFAULT_ORDER,
	    orderBy: ''
	};
	}

	var methods$j = {
	    sort: function sort(event, orderBy) {
	        event.preventDefault();

	        // if `orderBy` didn't change, invert sort order:
	        var order = (function (current) {
	            if (orderBy === current.orderBy) {
	                return ORDER[current.order !== DEFAULT_ORDER];
	            } else {
	                return DEFAULT_ORDER;
	            }
	        })(this.get());

	        this.set({ orderBy: orderBy, order: order });
	        this.fire('sort', { orderBy: orderBy, order: order });
	    }
	};

	var file$x = "node_modules/datawrapper/controls/Table.html";

	function click_handler$7(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.sort(event, ctx.item.orderBy);
	}

	function get_each1_context$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function get_each0_context$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function create_main_fragment$B(component, ctx) {
		var div, table, colgroup, text0, thead, tr, text1, tbody, slot_content_default = component._slotted.default;

		var each0_value = ctx.columnHeaders;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_1$3(component, get_each0_context$1(ctx, each0_value, i));
		}

		var each1_value = ctx.columnHeaders;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block$d(component, get_each1_context$1(ctx, each1_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				table = createElement("table");
				colgroup = createElement("colgroup");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text0 = createText("\n\n        ");
				thead = createElement("thead");
				tr = createElement("tr");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text1 = createText("\n\n        ");
				tbody = createElement("tbody");
				addLoc(colgroup, file$x, 2, 8, 64);
				addLoc(tr, file$x, 9, 12, 234);
				addLoc(thead, file$x, 8, 8, 214);
				addLoc(tbody, file$x, 28, 8, 934);
				table.className = "table svelte-1ef3poq";
				addLoc(table, file$x, 1, 4, 34);
				div.className = "table-container svelte-1ef3poq";
				addLoc(div, file$x, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, table);
				append(table, colgroup);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(colgroup, null);
				}

				append(table, text0);
				append(table, thead);
				append(thead, tr);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(tr, null);
				}

				append(table, text1);
				append(table, tbody);

				if (slot_content_default) {
					append(tbody, slot_content_default);
				}
			},

			p: function update(changed, ctx) {
				if (changed.columnHeaders) {
					each0_value = ctx.columnHeaders;

					for (var i = 0; i < each0_value.length; i += 1) {
						var child_ctx = get_each0_context$1(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_1$3(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(colgroup, null);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (changed.columnHeaders || changed.isActive || changed.isAscending) {
					each1_value = ctx.columnHeaders;

					for (var i = 0; i < each1_value.length; i += 1) {
						var child_ctx$1 = get_each1_context$1(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx$1);
						} else {
							each1_blocks[i] = create_each_block$d(component, child_ctx$1);
							each1_blocks[i].c();
							each1_blocks[i].m(tr, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each0_blocks, detach);

				destroyEach(each1_blocks, detach);

				if (slot_content_default) {
					reinsertChildren(tbody, slot_content_default);
				}
			}
		};
	}

	// (4:12) {#each columnHeaders as item}
	function create_each_block_1$3(component, ctx) {
		var col;

		return {
			c: function create() {
				col = createElement("col");
				setStyle(col, "width", ctx.item.width);
				addLoc(col, file$x, 4, 12, 129);
			},

			m: function mount(target, anchor) {
				insert(target, col, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.columnHeaders) {
					setStyle(col, "width", ctx.item.width);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(col);
				}
			}
		};
	}

	// (21:20) {:else}
	function create_else_block$4(component, ctx) {
		var span, text_value = ctx.item.title, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "col";
				addLoc(span, file$x, 21, 20, 780);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.columnHeaders) && text_value !== (text_value = ctx.item.title)) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (13:20) {#if item.orderBy}
	function create_if_block$r(component, ctx) {
		var a, text_value = ctx.item.title, text, a_class_value, a_href_value;

		return {
			c: function create() {
				a = createElement("a");
				text = createText(text_value);
				a._svelte = { component: component, ctx: ctx };

				addListener(a, "click", click_handler$7);
				a.className = a_class_value = "sortable " + (ctx.isActive(ctx.item) ? ctx.isAscending ? 'sortable-asc' : 'sortable-desc' : '') + " svelte-1ef3poq";
				a.href = a_href_value = "?orderBy=" + (ctx.item.orderBy);
				addLoc(a, file$x, 13, 20, 412);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.columnHeaders) && text_value !== (text_value = ctx.item.title)) {
					setData(text, text_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.isActive || changed.columnHeaders || changed.isAscending) && a_class_value !== (a_class_value = "sortable " + (ctx.isActive(ctx.item) ? ctx.isAscending ? 'sortable-asc' : 'sortable-desc' : '') + " svelte-1ef3poq")) {
					a.className = a_class_value;
				}

				if ((changed.columnHeaders) && a_href_value !== (a_href_value = "?orderBy=" + (ctx.item.orderBy))) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler$7);
			}
		};
	}

	// (11:16) {#each columnHeaders as item}
	function create_each_block$d(component, ctx) {
		var th, th_class_value;

		function select_block_type(ctx) {
			if (ctx.item.orderBy) { return create_if_block$r; }
			return create_else_block$4;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				th = createElement("th");
				if_block.c();
				th.className = th_class_value = "" + (ctx.item.className ? ctx.item.className : '') + " svelte-1ef3poq";
				addLoc(th, file$x, 11, 16, 301);
			},

			m: function mount(target, anchor) {
				insert(target, th, anchor);
				if_block.m(th, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(th, null);
				}

				if ((changed.columnHeaders) && th_class_value !== (th_class_value = "" + (ctx.item.className ? ctx.item.className : '') + " svelte-1ef3poq")) {
					th.className = th_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(th);
				}

				if_block.d();
			}
		};
	}

	function Table(options) {
		this._debugName = '<Table>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$v(), options.data);

		this._recompute({ orderBy: 1, order: 1 }, this._state);
		if (!('orderBy' in this._state)) { console.warn("<Table> was created without expected data property 'orderBy'"); }
		if (!('order' in this._state)) { console.warn("<Table> was created without expected data property 'order'"); }
		if (!('columnHeaders' in this._state)) { console.warn("<Table> was created without expected data property 'columnHeaders'"); }
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$B(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Table.prototype, protoDev);
	assign(Table.prototype, methods$j);

	Table.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('isActive' in newState && !this._updatingReadonlyProperty) { throw new Error("<Table>: Cannot set read-only property 'isActive'"); }
		if ('isAscending' in newState && !this._updatingReadonlyProperty) { throw new Error("<Table>: Cannot set read-only property 'isAscending'"); }
	};

	Table.prototype._recompute = function _recompute(changed, state) {
		if (changed.orderBy) {
			if (this._differs(state.isActive, (state.isActive = isActive$1(state)))) { changed.isActive = true; }
		}

		if (changed.order) {
			if (this._differs(state.isAscending, (state.isAscending = isAscending(state)))) { changed.isAscending = true; }
		}
	};

	/* node_modules/@datawrapper/controls/Text.html generated by Svelte v2.16.1 */



	function data$w() {
	    return {
	        disabled: false,
	        disabled_msg: '',
	        width: '100px',
	        help: '',
	        placeholder: '',
	        prepend: '',
	        append: ''
	    };
	}
	var file$y = "node_modules/datawrapper/controls/Text.html";

	function create_main_fragment$C(component, ctx) {
		var div, text0, input, input_updating = false, text1, text2, if_block2_anchor;

		var if_block0 = (ctx.prepend) && create_if_block_2$5(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ value: input.value });
			input_updating = false;
		}

		var if_block1 = (ctx.append) && create_if_block_1$f(component, ctx);

		var controlgroup_initial_data = {
		 	disabled: ctx.disabled,
		 	type: "text",
		 	width: ctx.width,
		 	label: ctx.label,
		 	help: ctx.help
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block2 = (ctx.disabled && ctx.disabled_msg) && create_if_block$s(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) { if_block0.c(); }
				text0 = createText("\n        ");
				input = createElement("input");
				text1 = createText("\n        ");
				if (if_block1) { if_block1.c(); }
				controlgroup._fragment.c();
				text2 = createText("\n\n");
				if (if_block2) { if_block2.c(); }
				if_block2_anchor = createComment();
				addListener(input, "input", input_input_handler);
				input.disabled = ctx.disabled;
				setAttribute(input, "type", "text");
				input.className = "input-large svelte-lyrczp";
				input.placeholder = ctx.placeholder;
				addLoc(input, file$y, 5, 8, 207);
				div.className = "flex svelte-lyrczp";
				addLoc(div, file$y, 1, 4, 99);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);
				if (if_block0) { if_block0.m(div, null); }
				append(div, text0);
				append(div, input);

				input.value = ctx.value ;

				append(div, text1);
				if (if_block1) { if_block1.m(div, null); }
				controlgroup._mount(target, anchor);
				insert(target, text2, anchor);
				if (if_block2) { if_block2.i(target, anchor); }
				insert(target, if_block2_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.prepend) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2$5(component, ctx);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!input_updating && changed.value) { input.value = ctx.value ; }
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.placeholder) {
					input.placeholder = ctx.placeholder;
				}

				if (ctx.append) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1$f(component, ctx);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				var controlgroup_changes = {};
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.help) { controlgroup_changes.help = ctx.help; }
				controlgroup._set(controlgroup_changes);

				if (ctx.disabled && ctx.disabled_msg) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$s(component, ctx);
						if (if_block2) { if_block2.c(); }
					}

					if_block2.i(if_block2_anchor.parentNode, if_block2_anchor);
				} else if (if_block2) {
					groupOutros();
					if_block2.o(function() {
						if_block2.d(1);
						if_block2 = null;
					});
				}
			},

			d: function destroy(detach) {
				if (if_block0) { if_block0.d(); }
				removeListener(input, "input", input_input_handler);
				if (if_block1) { if_block1.d(); }
				controlgroup.destroy(detach);
				if (detach) {
					detachNode(text2);
				}

				if (if_block2) { if_block2.d(detach); }
				if (detach) {
					detachNode(if_block2_anchor);
				}
			}
		};
	}

	// (3:8) {#if prepend}
	function create_if_block_2$5(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.prepend);
				div.className = "prepend";
				addLoc(div, file$y, 3, 8, 148);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.prepend) {
					setData(text, ctx.prepend);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (7:8) {#if append}
	function create_if_block_1$f(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.append);
				div.className = "append";
				addLoc(div, file$y, 7, 8, 339);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.append) {
					setData(text, ctx.append);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (13:0) {#if disabled && disabled_msg}
	function create_if_block$s(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-lyrczp";
				addLoc(div0, file$y, 14, 4, 474);
				addLoc(div1, file$y, 13, 0, 447);
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
				if (current) { return; }
				if (component.root._intro) {
					if (div1_transition) { div1_transition.invalidate(); }

					component.root._aftercreate.push(function () {
						if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, true); }
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) { return; }

				if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {}, false); }
				div1_transition.run(0, function () {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
					if (div1_transition) { div1_transition.abort(); }
				}
			}
		};
	}

	function Text(options) {
		this._debugName = '<Text>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$w(), options.data);
		if (!('disabled' in this._state)) { console.warn("<Text> was created without expected data property 'disabled'"); }
		if (!('width' in this._state)) { console.warn("<Text> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<Text> was created without expected data property 'label'"); }
		if (!('help' in this._state)) { console.warn("<Text> was created without expected data property 'help'"); }
		if (!('prepend' in this._state)) { console.warn("<Text> was created without expected data property 'prepend'"); }
		if (!('placeholder' in this._state)) { console.warn("<Text> was created without expected data property 'placeholder'"); }
		if (!('value' in this._state)) { console.warn("<Text> was created without expected data property 'value'"); }
		if (!('append' in this._state)) { console.warn("<Text> was created without expected data property 'append'"); }
		if (!('disabled_msg' in this._state)) { console.warn("<Text> was created without expected data property 'disabled_msg'"); }
		this._intro = true;

		this._fragment = create_main_fragment$C(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Text.prototype, protoDev);

	Text.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/TextArea.html generated by Svelte v2.16.1 */

	function data$x() {
	    return {
	        placeholder: ''
	    };
	}
	var file$z = "node_modules/datawrapper/controls/TextArea.html";

	function create_main_fragment$D(component, ctx) {
		var textarea, textarea_updating = false;

		function textarea_input_handler() {
			textarea_updating = true;
			component.set({ value: textarea.value });
			textarea_updating = false;
		}

		var controlgroup_initial_data = {
		 	disabled: ctx.disabled,
		 	type: "textarea",
		 	width: ctx.width,
		 	label: ctx.label,
		 	help: ctx.help
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				textarea = createElement("textarea");
				controlgroup._fragment.c();
				addListener(textarea, "input", textarea_input_handler);
				textarea.placeholder = ctx.placeholder;
				setStyle(textarea, "width", (ctx.width || 'auto'));
				addLoc(textarea, file$z, 1, 4, 103);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, textarea);

				textarea.value = ctx.value;

				controlgroup._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (!textarea_updating && changed.value) { textarea.value = ctx.value; }
				if (changed.placeholder) {
					textarea.placeholder = ctx.placeholder;
				}

				if (changed.width) {
					setStyle(textarea, "width", (ctx.width || 'auto'));
				}

				var controlgroup_changes = {};
				if (changed.disabled) { controlgroup_changes.disabled = ctx.disabled; }
				if (changed.width) { controlgroup_changes.width = ctx.width; }
				if (changed.label) { controlgroup_changes.label = ctx.label; }
				if (changed.help) { controlgroup_changes.help = ctx.help; }
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				removeListener(textarea, "input", textarea_input_handler);
				controlgroup.destroy(detach);
			}
		};
	}

	function TextArea(options) {
		this._debugName = '<TextArea>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$x(), options.data);
		if (!('disabled' in this._state)) { console.warn("<TextArea> was created without expected data property 'disabled'"); }
		if (!('width' in this._state)) { console.warn("<TextArea> was created without expected data property 'width'"); }
		if (!('label' in this._state)) { console.warn("<TextArea> was created without expected data property 'label'"); }
		if (!('help' in this._state)) { console.warn("<TextArea> was created without expected data property 'help'"); }
		if (!('value' in this._state)) { console.warn("<TextArea> was created without expected data property 'value'"); }
		if (!('placeholder' in this._state)) { console.warn("<TextArea> was created without expected data property 'placeholder'"); }
		this._intro = true;

		this._fragment = create_main_fragment$D(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(TextArea.prototype, protoDev);

	TextArea.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/editor/ThemeSelect.html generated by Svelte v2.16.1 */

	function themeOptions(ref) {
	    var $themes = ref.$themes;

	    return $themes.map(function (t) {
	        return { value: t.id, label: t.title };
	    });
	}
	function create_main_fragment$E(component, ctx) {
		var select_updating = {};

		var select_initial_data = {
		 	label: "Design",
		 	options: ctx.themeOptions,
		 	labelWidth: "80px",
		 	width: "200px"
		 };
		if (ctx.$theme !== void 0) {
			select_initial_data.value = ctx.$theme;
			select_updating.value = true;
		}
		var select = new Select({
			root: component.root,
			store: component.store,
			data: select_initial_data,
			_bind: function _bind(changed, childState) {
				var newStoreState = {};
				if (!select_updating.value && changed.value) {
					newStoreState.theme = childState.value;
				}
				component.store.set(newStoreState);
				select_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			select._bind({ value: 1 }, select.get());
		});

		return {
			c: function create() {
				select._fragment.c();
			},

			m: function mount(target, anchor) {
				select._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var select_changes = {};
				if (changed.themeOptions) { select_changes.options = ctx.themeOptions; }
				if (!select_updating.value && changed.$theme) {
					select_changes.value = ctx.$theme;
					select_updating.value = ctx.$theme !== void 0;
				}
				select._set(select_changes);
				select_updating = {};
			},

			d: function destroy(detach) {
				select.destroy(detach);
			}
		};
	}

	function ThemeSelect(options) {
		this._debugName = '<ThemeSelect>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<ThemeSelect> references store properties, but no store was provided");
		}

		init(this, options);
		this._state = assign(this.store._init(["themes","theme"]), options.data);
		this.store._add(this, ["themes","theme"]);

		this._recompute({ $themes: 1 }, this._state);
		if (!('$themes' in this._state)) { console.warn("<ThemeSelect> was created without expected data property '$themes'"); }

		if (!('$theme' in this._state)) { console.warn("<ThemeSelect> was created without expected data property '$theme'"); }
		this._intro = true;

		this._handlers.destroy = [removeFromStore];

		this._fragment = create_main_fragment$E(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ThemeSelect.prototype, protoDev);

	ThemeSelect.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('themeOptions' in newState && !this._updatingReadonlyProperty) { throw new Error("<ThemeSelect>: Cannot set read-only property 'themeOptions'"); }
	};

	ThemeSelect.prototype._recompute = function _recompute(changed, state) {
		if (changed.$themes) {
			if (this._differs(state.themeOptions, (state.themeOptions = themeOptions(state)))) { changed.themeOptions = true; }
		}
	};

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
	    return name
	        .toString()
	        .toLowerCase()
	        .replace(/\s+/g, '_') // Replace spaces with _
	        .replace(/[^\w-]+/g, '') // Remove all non-word chars
	        .replace(/-/g, '_') // Replace multiple - with single -
	        .replace(/__+/g, '_') // Replace multiple - with single -
	        .replace(/^_+/, '') // Trim - from start of text
	        .replace(/_+$/, '') // Trim - from end of text
	        .replace(/^(\d)/, '_$1') // If first char is a number, prefix with _
	        .replace(
	            /^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/,
	            '$1_'
	        ); // avoid reserved keywords
	}

	function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

	/**
	 * @copyright 2017- commenthol
	 * @license MIT
	 */
	var lib = clones;
	/**
	 * A Deep-Clone of object `source`
	 *
	 * @static
	 * @param {Object} source - clone source
	 * @param {Object} [bind] - bind functions to this context
	 * @return {Any} deep clone of `source`
	 * @example
	 * const clones = require('clones')
	 *
	 * const source = [
	 *   {a: {b: 1}},
	 *   {c: {d: 2}},
	 *   '3',
	 *   function () { return 4 }
	 * ]
	 * // adding circularities
	 * source[0].a.e = source[0].a
	 *
	 * const dest = clones(source)
	 * // => [{ a: { b: 1, e: [Circular] } },
	 * //     { c: { d: 2 } },
	 * //     '3',
	 * //     [Function] ]
	 */

	function clones(source, bind, target) {
	  var opts = {
	    bind: bind,
	    visited: [],
	    cloned: []
	  };
	  return _clone(opts, source, target);
	}
	/**
	 * clones prototype function / class
	 * @static
	 * @param {Object} source - clone source
	 * @return {Any} deep clone of `source`
	 * @example
	 * const clones = require('clones')
	 * // clone built in `Array`
	 * const C = clones.classes(Array)
	 *
	 * let c = new C(1,2,3)
	 * // => [1, 2, 3]
	 * c.reverse()
	 * // => [3, 2, 1]
	 */


	clones.classes = function (source) {
	  var target = function target(a, b, c, d, e, f, g, h, i) {
	    try {
	      return new (Function.prototype.bind.apply(source, [null].concat([].slice.call(arguments))))();
	    } catch (e) {
	      // Safari throws TypeError for typed Arrays
	      return new source(a, b, c, d, e, f, g, h, i); // eslint-disable-line new-cap
	    }
	  };

	  return clones(source, source, target);
	};
	/**
	 * Recursively clone source
	 *
	 * @static
	 * @private
	 * @param {Object} opts - options
	 * @param {Object} [opts.bind] - optional bind for function clones
	 * @param {Array} opts.visited - visited references to detect circularities
	 * @param {Array} opts.cloned - visited references of clones to assign circularities
	 * @param {Any} source - The object to clone
	 * @return {Any} deep clone of `source`
	 */


	function _clone(opts, source, target) {
	  var type = toType(source);

	  switch (type) {
	    case 'String':
	    case 'Number':
	    case 'Boolean':
	    case 'Null':
	    case 'Undefined':
	    case 'Symbol':
	    case 'DOMPrototype': // (browser)

	    case 'process':
	      // (node) cloning this is not a good idea
	      target = source;
	      break;

	    case 'Function':
	      if (!target) {
	        var _bind = opts.bind === null ? null : opts.bind || source;

	        if (opts.wrapFn) {
	          target = function target() {
	            return source.apply(_bind, arguments);
	          };
	        } else {
	          target = source.bind(_bind);
	        }
	      }

	      target = _props(opts, source, target);
	      break;

	    case 'Int8Array':
	    case 'Uint8Array':
	    case 'Uint8ClampedArray':
	    case 'Int16Array':
	    case 'Uint16Array':
	    case 'Int32Array':
	    case 'Uint32Array':
	    case 'Float32Array':
	    case 'Float64Array':
	      target = new source.constructor(source);
	      break;

	    case 'Array':
	      target = source.map(function (item) {
	        return _clone(opts, item);
	      });
	      target = _props(opts, source, target);
	      break;

	    case 'Date':
	      target = new Date(source);
	      break;

	    case 'Error':
	    case 'EvalError':
	    case 'InternalError':
	    case 'RangeError':
	    case 'ReferenceError':
	    case 'SyntaxError':
	    case 'TypeError':
	    case 'URIError':
	      target = new source.constructor(source.message);
	      target = _props(opts, source, target);
	      target.stack = source.stack;
	      break;

	    case 'RegExp':
	      var flags = source.flags || (source.global ? 'g' : '') + (source.ignoreCase ? 'i' : '') + (source.multiline ? 'm' : '');
	      target = new RegExp(source.source, flags);
	      break;

	    case 'Buffer':
	      target = new source.constructor(source);
	      break;

	    case 'Window': // clone of global object

	    case 'global':
	      opts.wrapFn = true;
	      target = _props(opts, source, target || {});
	      break;

	    case 'Math':
	    case 'JSON':
	    case 'Console':
	    case 'Navigator':
	    case 'Screen':
	    case 'Object':
	      target = _props(opts, source, target || {});
	      break;

	    default:
	      if (/^HTML/.test(type)) {
	        // handle HTMLElements
	        if (source.cloneNode) {
	          target = source.cloneNode(true);
	        } else {
	          target = source;
	        }
	      } else if (_typeof(source) === 'object') {
	        // handle other object based types
	        target = _props(opts, source, target || {});
	      } else {
	        // anything else should be a primitive
	        target = source;
	      }

	  }

	  return target;
	}
	/**
	 * Clone property while cloning circularities
	 *
	 * @static
	 * @private
	 * @param {Object} opts - options
	 * @param {Any} source - source object
	 * @param {Any} [target] - target object
	 * @returns {Any} target
	 */


	function _props(opts, source, target) {
	  var idx = opts.visited.indexOf(source); // check for circularities

	  if (idx === -1) {
	    opts.visited.push(source);
	    opts.cloned.push(target);
	    Object.getOwnPropertyNames(source).forEach(function (key) {
	      if (key === 'prototype') {
	        target[key] = Object.create(source[key]);
	        Object.getOwnPropertyNames(source[key]).forEach(function (p) {
	          if (p !== 'constructor') {
	            _descriptor(opts, source[key], target[key], p); // } else {
	            //   target[key][p] = target
	            //   Safari may throw here with TypeError: Attempted to assign to readonly property.

	          }
	        });
	      } else {
	        _descriptor(opts, source, target, key);
	      }
	    });
	    opts.visited.pop();
	    opts.cloned.pop();
	  } else {
	    target = opts.cloned[idx]; // add reference of circularity
	  }

	  return target;
	}
	/**
	 * assign descriptor with property `key` from source to target
	 * @private
	 */


	function _descriptor(opts, source, target, key) {
	  var desc = Object.getOwnPropertyDescriptor(source, key);

	  if (desc) {
	    if (desc.writable) {
	      desc.value = _clone(opts, desc.value);
	    }

	    try {
	      Object.defineProperty(target, key, desc);
	    } catch (e) {
	      // Safari throws with TypeError:
	      //  Attempting to change access mechanism for an unconfigurable property.
	      //  Attempting to change value of a readonly property.
	      if (!'Attempting to change'.indexOf(e.message)) {
	        throw e;
	      }
	    }
	  }
	}
	/**
	 * @private
	 */


	function toType(o) {
	  return toString.call(o).replace(/^\[[a-z]+ (.*)\]$/, '$1');
	}

	var hasWindow = (typeof window !== 'undefined');
	var hasWindow_1 = hasWindow;

	var hasGlobal = (typeof commonjsGlobal !== 'undefined');
	var hasGlobal_1 = hasGlobal;

	var FN_NOOP = 'function () {}';

	var NON_IDENTIFIER = /^\d|-|^(break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with|class|const|enum|export|extends|import|super|implements|interface|let|package|private|protected|public|static|yield|null|true|false)$/;

	var isIdentifier = function (key) { return !NON_IDENTIFIER.test(key); };
	var isIdentifier_1 = isIdentifier;

	/**
	* create a fresh context where nearly nothing is allowed
	* @private
	*/
	var createContext = function () {
	  // protection might not be complete!
	  var context = {
	    // disallowed
	    global: undefined,
	    process: undefined,
	    module: undefined,
	    require: undefined,
	    document: undefined,
	    window: undefined,
	    Window: undefined,
	    // no evil...
	    eval: undefined,
	    Function: undefined
	  };

	  var fillContext = function (root) {
	    Object.keys(root).forEach(function (key) {
	      if (isIdentifier(key)) {
	        context[key] = undefined;
	      }
	    });
	  };

	  // locally define all potential global vars
	  if (hasGlobal) {
	    fillContext(commonjsGlobal);
	    cloneFunctions(context);
	    context.Buffer = _protect('Buffer');
	    context.console = lib(console, console); // console needs special treatment
	    context.console.constructor.constructor = FN_NOOP;
	  }
	  if (hasWindow) {
	    fillContext(window);
	    cloneFunctions(context);
	    protectBuiltInObjects(context);
	    context.console = lib(console, console); // console needs special treatment
	    try {
	      context.Object.constructor.constructor = FN_NOOP;
	    } catch (e) {
	    }
	  }

	  return context
	};

	/**
	* Apply allowed context properties
	* @private
	*/
	var allow = function (context, newContext) {
	  Object.keys(context || {}).forEach(function (key) {
	    if (isIdentifier(key)) {
	      newContext[key] = context[key]; // this is harmful - objects can be overwritten
	    }
	  });
	};

	/**
	* clone global functions
	* @private
	*/
	function cloneFunctions (context) {
	[
	    'clearImmediate',
	    'clearInterval',
	    'clearTimeout'
	  ].forEach(function (str) {
	    try {
	      var fn = new Function(("return " + str))(); // eslint-disable-line no-new-func
	      context[str] = fn
	        ? function () {
	          return fn.apply(null, [].slice.call(arguments))
	        }
	        : undefined;
	    } catch (e) {}
	  })

	  ;[
	    'setImmediate',
	    'setInterval',
	    'setTimeout'
	  ].forEach(function (str) {
	    try {
	      var fn = new Function(("return " + str))(); // eslint-disable-line no-new-func
	      context[str] = fn
	        ? function (f) {
	          if (typeof f === 'function') {
	            return fn.apply(null, [].slice.call(arguments))
	          } else {
	            throw new Error(str + ' requires function as argument')
	          }
	        }
	        : undefined;
	    } catch (e) {}
	  });
	}

	/**
	* wraps up build-in objects using a cloned copy
	* protect object against overwriting
	* @private
	*/
	function protectBuiltInObjects (context) {
	[
	    'Object',
	    'Boolean',
	    'Symbol',
	    'Error',
	    'EvalError',
	    'InternalError',
	    'RangeError',
	    'ReferenceError',
	    'SyntaxError',
	    'TypeError',
	    'URIError',
	    'Number',
	    'Math',
	    'Date',
	    'String',
	    'RegExp',
	    'Array',
	    'Int8Array',
	    'Uint8Array',
	    'Uint8ClampedArray',
	    'Int16Array',
	    'Uint16Array',
	    'Int32Array',
	    'Uint32Array',
	    'Float32Array',
	    'Float64Array',
	    'Map',
	    'Set',
	    'WeakMap',
	    'WeakSet',
	    'ArrayBuffer',
	    'SharedArrayBuffer',
	    'Atomics',
	    'DataView',
	    'JSON',
	    'Promise',
	    'Generator',
	    'GeneratorFunction',
	    'Reflect',
	    'Proxy',
	    'Intl',
	    'Buffer'
	  ].forEach(function (str) {
	    try {
	      context[str] = _protect(str);
	      new context[str](); // eslint-disable-line no-new
	    } catch (e) {
	    }
	  });
	}

	/**
	* @private
	*/
	function _protect (str) {
	  try {
	    var type = new Function(("return " + str))(); // eslint-disable-line no-new-func
	    return type
	      ? lib.classes(type)
	      : undefined
	  } catch (e) {}
	}

	var common = {
		hasWindow: hasWindow_1,
		hasGlobal: hasGlobal_1,
		isIdentifier: isIdentifier_1,
		createContext: createContext,
		allow: allow
	};

	var createContext$1 = common.createContext;
	var allow$1 = common.allow;

	/**
	* reuse saferEval context
	* @class
	* @example
	* const {SaferEval} = require('safer-eval')
	* const safer = new SaferEval()
	* let res1 = safer.runInContext('new Date('1970-01-01')')
	* let res2 = safer.runInContext('new Date('1970-07-01')')
	*/
	var SaferEval = function SaferEval (context) {
	  // define disallowed objects in context
	  var __context = createContext$1();
	  // apply "allowed" context vars
	  allow$1(context, __context);

	  this._context = __context;
	};

	/**
	* @param {String} code - a string containing javascript code
	* @return {Any} evaluated code
	*/
	SaferEval.prototype.runInContext = function runInContext (code) {
	  if (typeof code !== 'string') {
	    throw new TypeError('not a string')
	  }
	  var __context = this._context;

	  var src = 'this.constructor.constructor = function () {};\n';
	  // set local scope vars from each context property
	  Object.keys(__context).forEach(function (key) {
	    src += 'var ' + key + ' = __context[\'' + key + '\'];\n';
	  });
	  src += 'return ' + code + ';\n';

	  return Function('__context', src).call(null, __context) // eslint-disable-line
	};

	/**
	* A safer approach for eval. (Browser)
	*
	* This might not be as safe as the nodeJs version as there is no real sandboxing
	* available in the browser.
	*
	* **Warning: This function might be harmful - so you are warned!**
	*
	* `context` allows the definition of passed in Objects into the sandbox.
	* Take care, injected `code` can overwrite those passed context props!
	* Check the tests under "harmful context"!
	*
	* @static
	* @throws Error
	* @param {String} code - a string containing javascript code
	* @param {Object} [context] - define globals, properties for evaluation context
	* @param {Object} [opts] - options
	* @param {Object} [opts.freeze=true] - freeze all native objects
	* @return {Any} evaluated code
	* @example
	* var code = `{d: new Date('1970-01-01'), b: function () { return navigator.userAgent }`
	* var res = saferEval(code, {navigator: window.navigator})
	* // => toString.call(res.d) = '[object Date]'
	* // => toString.call(res.b) = '[object Function]'
	*/
	function saferEval (code, context, opts) {

	  return new SaferEval(context).runInContext(code)
	}

	var browser = saferEval;
	var SaferEval_1 = SaferEval;
	browser.SaferEval = SaferEval_1;

	/* node_modules/@datawrapper/controls/TooltipEditor.html generated by Svelte v2.16.1 */



	var COL_REG = /{{[^}]*}}/g;

	function title(ref) {
	    var value = ref.value;

	    return value.title;
	}
	function body(ref) {
	    var value = ref.value;

	    return value.body;
	}
	function variables(ref) {
	    var columns = ref.columns;

	    return columns.map(function (col) { return columnNameToVariable(col.name()); });
	}
	function titleColors(ref) {
	    var title = ref.title;
	    var columns = ref.columns;
	    var placeholderTitle = ref.placeholderTitle;

	    return toColors(title, columns);
	}
	function bodyColors(ref) {
	    var body = ref.body;
	    var columns = ref.columns;
	    var placeholderBody = ref.placeholderBody;

	    return toColors(body, columns);
	}
	function errors(ref) {
	    var bodyColors = ref.bodyColors;
	    var titleColors = ref.titleColors;

	    var errors = [].concat( (bodyColors + titleColors).matchAll(/data-error="([^"]+)"/g) );
	    return errors.map(function (m) { return m[1]
	            .replace(/(\w+) is not defined/, function (a, b) { return "\"" + b + "\" " + __('controls / tooltip-editor / err / not-defined', 'core'); })
	            .replace('unexpected token', __('controls / tooltip-editor / err / unexpected-token', 'core')); }
	    );
	}
	function selectColumnOptions(ref) {
	    var columns = ref.columns;

	    return [
	        { value: null, label: __('controls / tooltip-editor / add-column', 'core') } ].concat( columns.map(function (col) { return ({ value: col, label: col.name() }); })
	    );
	}
	function columnFormats(ref) {
	    var selectedColumn = ref.selectedColumn;

	    if (!selectedColumn) { return []; }
	    var options = formats(selectedColumn.type()).map(function (ref) {
	    	var l = ref.l;
	    	var f = ref.f;

	    	return ({ label: l, value: f });
	    });
	    if (options.length) {
	        return [{ value: null, label: __('controls / tooltip-editor / select-format', 'core') } ].concat( options);
	    }
	    return [];
	}
	function data$y() {
	    return {
	        value: {
	            enabled: false,
	            title: '',
	            body: ''
	        },
	        selectedColumn: null,
	        disabled: false,
	        width: '100px',
	        label: __('controls / tooltip-editor / label', 'core'),
	        columns: [],
	        lastFocus: 'title',
	        lastCursorPosition: [-1, -1],
	        placeholderTitle: __('controls / tooltip-editor / title-placeholder', 'core'),
	        placeholderBody: __('controls / tooltip-editor / body-placeholder', 'core'),
	        scrollbarSize: 0,
	        noSyntaxHighlighting: true
	    };
	}
	var methods$k = {
	    handleScroll: function handleScroll(event, syncWithBody) {
	        this.refs[syncWithBody ? 'coloredBody' : 'coloredTitle'].scrollTop = event.target.scrollTop;
	        this.refs[syncWithBody ? 'coloredBody' : 'coloredTitle'].scrollLeft = event.target.scrollLeft;
	    },
	    handleCursorChange: function handleCursorChange(event) {
	        var input = event.target;
	        var selection = [];
	        if (input.selectionStart !== undefined) {
	            selection = [input.selectionStart, input.selectionEnd];
	        }
	        this.set({ lastCursorPosition: selection });
	    },
	    addColumn: function addColumn() {
	        var ref = this.get();
	        var selectedColumn = ref.selectedColumn;
	        var selectedFormat = ref.selectedFormat;
	        var lastFocus = ref.lastFocus;
	        var lastCursorPosition = ref.lastCursorPosition;
	        var value = ref.value;
	        if (!selectedColumn) { return; }
	        var varName = columnNameToVariable(selectedColumn.name());
	        var insert = selectedFormat ? ("{{ format(" + varName + ", \"" + selectedFormat + "\") }}") : ("{{ " + varName + " }}");
	        var insertAt = lastCursorPosition[0] < 0 ? value[lastFocus].length : lastCursorPosition[0];
	        var removeChars = lastCursorPosition[1] - lastCursorPosition[0];
	        var before = value[lastFocus].substr(0, insertAt);
	        var after = value[lastFocus].substr(insertAt + removeChars);
	        value[lastFocus] = "" + before + insert + after;
	        this.set({ value: value, selectedColumn: null, selectedFormat: null });
	    }
	};

	function oncreate$8() {
	    this.set({ scrollbarSize: getScrollbarSize() });
	    // const isIE = !!window.MSInputMethodContext && !!document.documentMode;
	    // const isEdge = !isIE && !!window.StyleMedia;
	    // this.set({ noSyntaxHighlighting: isIE || isEdge });
	}
	function toColors(str, columns, placeholder) {
	    if (str === '') { return ''; }
	    // `<span class="placeholder">${placeholder}</span>`;
	    var context = {};
	    columns.forEach(function (col) {
	        context[columnNameToVariable(col.name())] = col.val(0);
	    });
	    return str
	        .replace(/</g, '&lt;')
	        .replace(/>/g, '&gt;')
	        .replace(COL_REG, function (s) {
	            var expr = s.substr(2, s.length - 4).trim();
	            var error = testExpression(context, expr);
	            return ("<span " + (error ? 'data-error="' + error + '"' : '') + " class=\"var " + (!error ? '' : 'in') + "valid\">" + s + "</span>");
	        });
	}

	function testExpression(___context___, ___expr___) {
	    try {
	        ___context___.format = function (val, fmt) { return String(val); };
	        browser(___expr___, ___context___);
	        return null;
	    } catch (e) {
	        console.error('caught error', e);
	        return e.message;
	    }
	}

	function getScrollbarSize() {
	    var outer = document.createElement('div');
	    var inner = document.createElement('div');
	    outer.appendChild(inner);
	    outer.style.position = 'absolute';
	    outer.style.visibility = 'hidden';
	    outer.style.width = '100px';
	    inner.style.width = '100%';
	    document.body.appendChild(outer);
	    var before = inner.getBoundingClientRect().width;
	    outer.style.overflowY = 'scroll';
	    var after = inner.getBoundingClientRect().width;
	    document.body.removeChild(outer);
	    return before - after;
	}

	var file$A = "node_modules/datawrapper/controls/TooltipEditor.html";

	function get_each_context$d(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.err = list[i];
		return child_ctx;
	}

	function create_main_fragment$F(component, ctx) {
		var div0, raw0_value = __('controls / tooltip-editor / help', 'core'), text0, div8, div3, div2, div1, text1, input, input_updating = false, text2, div6, div5, div4, text3, textarea, textarea_updating = false, text4, text5, div7, baseselect_updating = {}, text6, switch_1_updating = {};

		function input_input_handler() {
			input_updating = true;
			ctx.value.title = input.value;
			component.set({ value: ctx.value });
			input_updating = false;
		}

		function scroll_handler(event) {
			component.handleScroll(event, false);
		}

		function input_handler(event) {
			component.handleCursorChange(event);
		}

		function propertychange_handler(event) {
			component.handleCursorChange(event);
		}

		function click_handler(event) {
			component.handleCursorChange(event);
		}

		function keyup_handler(event) {
			component.handleCursorChange(event);
		}

		function focus_handler(event) {
			component.set({lastFocus:'title'});
		}

		function textarea_input_handler() {
			textarea_updating = true;
			ctx.value.body = textarea.value;
			component.set({ value: ctx.value });
			textarea_updating = false;
		}

		function scroll_handler_1(event) {
			component.handleScroll(event, true);
		}

		function input_handler_1(event) {
			component.handleCursorChange(event);
		}

		function propertychange_handler_1(event) {
			component.handleCursorChange(event);
		}

		function click_handler_1(event) {
			component.handleCursorChange(event);
		}

		function keyup_handler_1(event) {
			component.handleCursorChange(event);
		}

		function focus_handler_1(event) {
			component.set({lastFocus:'body'});
		}

		function select_block_type(ctx) {
			if (ctx.errors.length) { return create_if_block_2$6; }
			return create_else_block$5;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		var baseselect_initial_data = { options: ctx.selectColumnOptions };
		if (ctx.selectedColumn !== void 0) {
			baseselect_initial_data.value = ctx.selectedColumn;
			baseselect_updating.value = true;
		}
		var baseselect = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!baseselect_updating.value && changed.value) {
					newState.selectedColumn = childState.value;
				}
				component._set(newState);
				baseselect_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			baseselect._bind({ value: 1 }, baseselect.get());
		});

		var if_block1 = (ctx.selectedColumn) && create_if_block$t(component, ctx);

		var switch_1_initial_data = { disabled: ctx.disabled, label: ctx.label };
		if (ctx.value.enabled !== void 0) {
			switch_1_initial_data.value = ctx.value.enabled;
			switch_1_updating.value = true;
		}
		var switch_1 = new Switch({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), help: createFragment() },
			data: switch_1_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!switch_1_updating.value && changed.value) {
					ctx.value.enabled = childState.value;
					newState.value = ctx.value;
				}
				component._set(newState);
				switch_1_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			switch_1._bind({ value: 1 }, switch_1.get());
		});

		return {
			c: function create() {
				div0 = createElement("div");
				text0 = createText("\n    ");
				div8 = createElement("div");
				div3 = createElement("div");
				div2 = createElement("div");
				div1 = createElement("div");
				text1 = createText("\n            ");
				input = createElement("input");
				text2 = createText("\n        ");
				div6 = createElement("div");
				div5 = createElement("div");
				div4 = createElement("div");
				text3 = createText("\n            ");
				textarea = createElement("textarea");
				text4 = createText("\n        ");
				if_block0.c();
				text5 = createText("\n        ");
				div7 = createElement("div");
				baseselect._fragment.c();
				text6 = createText("\n            ");
				if (if_block1) { if_block1.c(); }
				switch_1._fragment.c();
				setAttribute(div0, "slot", "help");
				addLoc(div0, file$A, 1, 4, 78);
				div1.className = "inner svelte-1cmkzix";
				addLoc(div1, file$A, 7, 16, 353);
				div2.className = "textarea single-line svelte-1cmkzix";
				addLoc(div2, file$A, 6, 12, 302);
				addListener(input, "input", input_input_handler);
				addListener(input, "scroll", scroll_handler);
				addListener(input, "input", input_handler);
				addListener(input, "propertychange", propertychange_handler);
				addListener(input, "click", click_handler);
				addListener(input, "keyup", keyup_handler);
				addListener(input, "focus", focus_handler);
				input.placeholder = ctx.placeholderTitle;
				setAttribute(input, "type", "text");
				input.className = "svelte-1cmkzix";
				addLoc(input, file$A, 9, 12, 446);
				div3.className = "title svelte-1cmkzix";
				addLoc(div3, file$A, 5, 8, 270);
				setStyle(div4, "right", "" + (7+ctx.scrollbarSize) + "px");
				div4.className = "inner svelte-1cmkzix";
				addLoc(div4, file$A, 23, 16, 1007);
				div5.className = "textarea svelte-1cmkzix";
				addLoc(div5, file$A, 22, 12, 968);
				addListener(textarea, "input", textarea_input_handler);
				addListener(textarea, "scroll", scroll_handler_1);
				addListener(textarea, "input", input_handler_1);
				addListener(textarea, "propertychange", propertychange_handler_1);
				addListener(textarea, "click", click_handler_1);
				addListener(textarea, "keyup", keyup_handler_1);
				addListener(textarea, "focus", focus_handler_1);
				textarea.rows = "8";
				textarea.placeholder = ctx.placeholderBody;
				textarea.className = "svelte-1cmkzix";
				addLoc(textarea, file$A, 25, 12, 1133);
				div6.className = "body svelte-1cmkzix";
				addLoc(div6, file$A, 21, 8, 937);
				div7.className = "form form-horizontal";
				addLoc(div7, file$A, 42, 8, 1917);
				setStyle(div8, "margin-top", "5px");
				div8.className = "svelte-1cmkzix";
				toggleClass(div8, "disable-highlighting-on-focus", ctx.noSyntaxHighlighting);
				addLoc(div8, file$A, 4, 4, 174);
			},

			m: function mount(target, anchor) {
				append(switch_1._slotted.help, div0);
				div0.innerHTML = raw0_value;
				append(switch_1._slotted.default, text0);
				append(switch_1._slotted.default, div8);
				append(div8, div3);
				append(div3, div2);
				append(div2, div1);
				div1.innerHTML = ctx.titleColors;
				component.refs.coloredTitle = div1;
				append(div3, text1);
				append(div3, input);

				input.value = ctx.value.title;

				append(div8, text2);
				append(div8, div6);
				append(div6, div5);
				append(div5, div4);
				div4.innerHTML = ctx.bodyColors;
				component.refs.coloredBody = div4;
				append(div6, text3);
				append(div6, textarea);

				textarea.value = ctx.value.body;

				append(div8, text4);
				if_block0.m(div8, null);
				append(div8, text5);
				append(div8, div7);
				baseselect._mount(div7, null);
				append(div7, text6);
				if (if_block1) { if_block1.m(div7, null); }
				switch_1._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.titleColors) {
					div1.innerHTML = ctx.titleColors;
				}

				if (!input_updating && changed.value) { input.value = ctx.value.title; }
				if (changed.placeholderTitle) {
					input.placeholder = ctx.placeholderTitle;
				}

				if (changed.bodyColors) {
					div4.innerHTML = ctx.bodyColors;
				}

				if (changed.scrollbarSize) {
					setStyle(div4, "right", "" + (7+ctx.scrollbarSize) + "px");
				}

				if (!textarea_updating && changed.value) { textarea.value = ctx.value.body; }
				if (changed.placeholderBody) {
					textarea.placeholder = ctx.placeholderBody;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(div8, text5);
				}

				var baseselect_changes = {};
				if (changed.selectColumnOptions) { baseselect_changes.options = ctx.selectColumnOptions; }
				if (!baseselect_updating.value && changed.selectedColumn) {
					baseselect_changes.value = ctx.selectedColumn;
					baseselect_updating.value = ctx.selectedColumn !== void 0;
				}
				baseselect._set(baseselect_changes);
				baseselect_updating = {};

				if (ctx.selectedColumn) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$t(component, ctx);
						if_block1.c();
						if_block1.m(div7, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.noSyntaxHighlighting) {
					toggleClass(div8, "disable-highlighting-on-focus", ctx.noSyntaxHighlighting);
				}

				var switch_1_changes = {};
				if (changed.disabled) { switch_1_changes.disabled = ctx.disabled; }
				if (changed.label) { switch_1_changes.label = ctx.label; }
				if (!switch_1_updating.value && changed.value) {
					switch_1_changes.value = ctx.value.enabled;
					switch_1_updating.value = ctx.value.enabled !== void 0;
				}
				switch_1._set(switch_1_changes);
				switch_1_updating = {};
			},

			d: function destroy(detach) {
				if (component.refs.coloredTitle === div1) { component.refs.coloredTitle = null; }
				removeListener(input, "input", input_input_handler);
				removeListener(input, "scroll", scroll_handler);
				removeListener(input, "input", input_handler);
				removeListener(input, "propertychange", propertychange_handler);
				removeListener(input, "click", click_handler);
				removeListener(input, "keyup", keyup_handler);
				removeListener(input, "focus", focus_handler);
				if (component.refs.coloredBody === div4) { component.refs.coloredBody = null; }
				removeListener(textarea, "input", textarea_input_handler);
				removeListener(textarea, "scroll", scroll_handler_1);
				removeListener(textarea, "input", input_handler_1);
				removeListener(textarea, "propertychange", propertychange_handler_1);
				removeListener(textarea, "click", click_handler_1);
				removeListener(textarea, "keyup", keyup_handler_1);
				removeListener(textarea, "focus", focus_handler_1);
				if_block0.d();
				baseselect.destroy();
				if (if_block1) { if_block1.d(); }
				switch_1.destroy(detach);
			}
		};
	}

	// (40:16) {:else}
	function create_else_block$5(component, ctx) {
		var p, raw_value = __('controls / tooltip-editor / mini-help', 'core');

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help";
				addLoc(p, file$A, 40, 8, 1810);
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
	}

	// (38:8) {#if errors.length}
	function create_if_block_2$6(component, ctx) {
		var each_anchor;

		var each_value = ctx.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$e(component, get_each_context$d(ctx, each_value, i));
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
				if (changed.errors) {
					each_value = ctx.errors;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$d(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$e(component, child_ctx);
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
	}

	// (38:28) {#each errors as err}
	function create_each_block$e(component, ctx) {
		var p, b, raw_value = __('controls / tooltip-editor / err', 'core'), text0, text1_value = ctx.err, text1;

		return {
			c: function create() {
				p = createElement("p");
				b = createElement("b");
				text0 = createText(" ");
				text1 = createText(text1_value);
				addLoc(b, file$A, 38, 35, 1707);
				p.className = "mini-help error svelte-1cmkzix";
				addLoc(p, file$A, 38, 8, 1680);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, b);
				b.innerHTML = raw_value;
				append(p, text0);
				append(p, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && text1_value !== (text1_value = ctx.err)) {
					setData(text1, text1_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (45:12) {#if selectedColumn}
	function create_if_block$t(component, ctx) {
		var text0, button, i, text1;

		var if_block = (ctx.columnFormats.length) && create_if_block_1$g(component, ctx);

		function click_handler(event) {
			component.addColumn();
		}

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				text0 = createText("\n            ");
				button = createElement("button");
				i = createElement("i");
				text1 = createText(" add");
				i.className = "fa fa-plus";
				addLoc(i, file$A, 47, 77, 2275);
				addListener(button, "click", click_handler);
				button.className = "btn btn-small btn-primary";
				addLoc(button, file$A, 47, 12, 2210);
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insert(target, text0, anchor);
				insert(target, button, anchor);
				append(button, i);
				append(button, text1);
			},

			p: function update(changed, ctx) {
				if (ctx.columnFormats.length) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$g(component, ctx);
						if_block.c();
						if_block.m(text0.parentNode, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(text0);
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
			}
		};
	}

	// (45:33) {#if columnFormats.length}
	function create_if_block_1$g(component, ctx) {
		var baseselect_updating = {};

		var baseselect_initial_data = { options: ctx.columnFormats };
		if (ctx.selectedFormat !== void 0) {
			baseselect_initial_data.value = ctx.selectedFormat;
			baseselect_updating.value = true;
		}
		var baseselect = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!baseselect_updating.value && changed.value) {
					newState.selectedFormat = childState.value;
				}
				component._set(newState);
				baseselect_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			baseselect._bind({ value: 1 }, baseselect.get());
		});

		return {
			c: function create() {
				baseselect._fragment.c();
			},

			m: function mount(target, anchor) {
				baseselect._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var baseselect_changes = {};
				if (changed.columnFormats) { baseselect_changes.options = ctx.columnFormats; }
				if (!baseselect_updating.value && changed.selectedFormat) {
					baseselect_changes.value = ctx.selectedFormat;
					baseselect_updating.value = ctx.selectedFormat !== void 0;
				}
				baseselect._set(baseselect_changes);
				baseselect_updating = {};
			},

			d: function destroy(detach) {
				baseselect.destroy(detach);
			}
		};
	}

	function TooltipEditor(options) {
		var this$1 = this;

		this._debugName = '<TooltipEditor>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$y(), options.data);

		this._recompute({ value: 1, columns: 1, title: 1, placeholderTitle: 1, body: 1, placeholderBody: 1, bodyColors: 1, titleColors: 1, selectedColumn: 1 }, this._state);
		if (!('value' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'value'"); }
		if (!('columns' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'columns'"); }

		if (!('placeholderTitle' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'placeholderTitle'"); }

		if (!('placeholderBody' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'placeholderBody'"); }


		if (!('selectedColumn' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'selectedColumn'"); }
		if (!('disabled' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'disabled'"); }
		if (!('label' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'label'"); }
		if (!('noSyntaxHighlighting' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'noSyntaxHighlighting'"); }
		if (!('scrollbarSize' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'scrollbarSize'"); }



		if (!('selectedFormat' in this._state)) { console.warn("<TooltipEditor> was created without expected data property 'selectedFormat'"); }
		this._intro = true;

		this._fragment = create_main_fragment$F(this, this._state);

		this.root._oncreate.push(function () {
			oncreate$8.call(this$1);
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(TooltipEditor.prototype, protoDev);
	assign(TooltipEditor.prototype, methods$k);

	TooltipEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('title' in newState && !this._updatingReadonlyProperty) { throw new Error("<TooltipEditor>: Cannot set read-only property 'title'"); }
		if ('body' in newState && !this._updatingReadonlyProperty) { throw new Error("<TooltipEditor>: Cannot set read-only property 'body'"); }
		if ('variables' in newState && !this._updatingReadonlyProperty) { throw new Error("<TooltipEditor>: Cannot set read-only property 'variables'"); }
		if ('titleColors' in newState && !this._updatingReadonlyProperty) { throw new Error("<TooltipEditor>: Cannot set read-only property 'titleColors'"); }
		if ('bodyColors' in newState && !this._updatingReadonlyProperty) { throw new Error("<TooltipEditor>: Cannot set read-only property 'bodyColors'"); }
		if ('errors' in newState && !this._updatingReadonlyProperty) { throw new Error("<TooltipEditor>: Cannot set read-only property 'errors'"); }
		if ('selectColumnOptions' in newState && !this._updatingReadonlyProperty) { throw new Error("<TooltipEditor>: Cannot set read-only property 'selectColumnOptions'"); }
		if ('columnFormats' in newState && !this._updatingReadonlyProperty) { throw new Error("<TooltipEditor>: Cannot set read-only property 'columnFormats'"); }
	};

	TooltipEditor.prototype._recompute = function _recompute(changed, state) {
		if (changed.value) {
			if (this._differs(state.title, (state.title = title(state)))) { changed.title = true; }
			if (this._differs(state.body, (state.body = body(state)))) { changed.body = true; }
		}

		if (changed.columns) {
			if (this._differs(state.variables, (state.variables = variables(state)))) { changed.variables = true; }
		}

		if (changed.title || changed.columns || changed.placeholderTitle) {
			if (this._differs(state.titleColors, (state.titleColors = titleColors(state)))) { changed.titleColors = true; }
		}

		if (changed.body || changed.columns || changed.placeholderBody) {
			if (this._differs(state.bodyColors, (state.bodyColors = bodyColors(state)))) { changed.bodyColors = true; }
		}

		if (changed.bodyColors || changed.titleColors) {
			if (this._differs(state.errors, (state.errors = errors(state)))) { changed.errors = true; }
		}

		if (changed.columns) {
			if (this._differs(state.selectColumnOptions, (state.selectColumnOptions = selectColumnOptions(state)))) { changed.selectColumnOptions = true; }
		}

		if (changed.selectedColumn) {
			if (this._differs(state.columnFormats, (state.columnFormats = columnFormats(state)))) { changed.columnFormats = true; }
		}
	};

	/* node_modules/@datawrapper/controls/TypeAhead.html generated by Svelte v2.16.1 */

	function matches(ref) {
	    var query = ref.query;
	    var items = ref.items;
	    var filter = ref.filter;

	    if (!filter) { return items; }
	    if (!query) { return items; }
	    // check if items is an array
	    if (!items || !items.filter) { return []; }
	    return items.filter(function (item) {
	        return (item.search || item.title || item.name).toLowerCase().indexOf(query.toLowerCase()) > -1;
	    });
	}
	function data$z() {
	    return {
	        selection: '',
	        query: '',
	        icon: false,
	        placeholder: '',
	        filter: 'indexOf',
	        selectedItem: undefined,
	        selectedIndex: undefined,
	        searching: false,
	        open: false,
	        items: [] // items look like this {id: "foo", title: "", "display": "..."}
	    };
	}
	var methods$l = {
	    focus: function focus() {
	        this.refs.searchInput.focus();
	    },

	    blur: function blur() {
	        this.refs.searchInput.blur();
	    },

	    onClick: function onClick(event) {
	        this.set({ open: true });
	        this.fire('focus', event);
	    },

	    search: function search(query) {
	        this.set({ open: true });
	        // we're firing the "search" event so that the
	        // parent component can update the "items" list
	        this.fire('search', { query: query });
	    },

	    select: function select(item, event) {
	        this.set({
	            selectedItem: item,
	            query: item.display || item.title || item.name,
	            open: false
	        });
	        if (event) { event.stopPropagation(); }
	        this.fire('select', { item: item });
	    },

	    keyup: function keyup(event) {
	        if (!event) { return; }
	        if (event.keyCode === 13) {
	            // RETURN key
	            var ref = this.get();
	            var selectedItem = ref.selectedItem;
	            this.select(selectedItem);
	        }
	        if (event.keyCode === 38 || event.keyCode === 40) {
	            // ARROW UP/DOWN
	            var ref$1 = this.get();
	            var selectedIndex = ref$1.selectedIndex;
	            var matches = ref$1.matches;
	            if (isNaN(selectedIndex)) { selectedIndex = -1; }
	            var len = matches.length || 0;
	            if (event.keyCode === 38) {
	                selectedIndex = (selectedIndex - 1 + len) % len;
	            }
	            if (event.keyCode === 40) {
	                selectedIndex = (selectedIndex + 1) % len;
	            }

	            this.set({
	                selectedIndex: selectedIndex,
	                selectedItem: matches[selectedIndex]
	            });
	        }
	        if (event.keyCode === 27) {
	            // ESCAPE
	            this.set({ open: false });
	            this.blur();
	        }
	    }
	};

	function onupdate$5(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.selectedIndex && this.refs.dropdown) {
	        var dd = this.refs.dropdown;
	        var i = current.selectedIndex;
	        var liBox = dd.children[i].getBoundingClientRect();
	        var ulBox = dd.getBoundingClientRect();
	        if (liBox.y + liBox.height - ulBox.y > ulBox.height) {
	            // li is out of bottom view
	            dd.scrollBy(0, liBox.y + liBox.height - ulBox.y - ulBox.height + 5);
	        } else if (liBox.y - ulBox.y < 0) {
	            // li is out of top view
	            dd.scrollBy(0, liBox.y - ulBox.y - 5);
	        }
	    }
	}
	var file$B = "node_modules/datawrapper/controls/TypeAhead.html";

	function click_handler$8(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.select(ctx.item, event);
	}

	function get_each_context$e(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$G(component, ctx) {
		var div2, div1, input, input_updating = false, input_placeholder_value, text0, text1, div0, slot_content_button = component._slotted.button, button, span, text2, div1_class_value;

		function onwindowclick(event) {
			component.set({open:false});	}
		window.addEventListener("click", onwindowclick);

		function input_input_handler() {
			input_updating = true;
			component.set({ query: input.value });
			input_updating = false;
		}

		function keydown_handler(event) {
			component.keyup(event);
		}

		function input_handler(event) {
			component.search(ctx.query);
		}

		var if_block0 = (ctx.icon) && create_if_block_1$h(component, ctx);

		function click_handler(event) {
			component.set({open:true});
		}

		var if_block1 = (ctx.open && ctx.matches.length) && create_if_block$u(component, ctx);

		function click_handler_1(event) {
			component.onClick(event);
		}

		function click_handler_2(event) {
			event.stopPropagation();
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div1 = createElement("div");
				input = createElement("input");
				text0 = createText("\n\n        ");
				if (if_block0) { if_block0.c(); }
				text1 = createText("\n\n        ");
				div0 = createElement("div");
				if (!slot_content_button) {
					button = createElement("button");
					span = createElement("span");
				}
				text2 = createText("\n\n        ");
				if (if_block1) { if_block1.c(); }
				addListener(input, "input", input_input_handler);
				addListener(input, "keydown", keydown_handler);
				addListener(input, "input", input_handler);
				setAttribute(input, "type", "search");
				input.placeholder = input_placeholder_value = ctx.open ? ctx.placeholder : ctx.selection||ctx.placeholder;
				input.className = "svelte-6lqhz6";
				addLoc(input, file$B, 4, 8, 269);
				if (!slot_content_button) {
					span.className = "caret";
					addLoc(span, file$B, 20, 20, 761);
					addListener(button, "click", click_handler);
					button.className = "btn btn-small btn-primary svelte-6lqhz6";
					addLoc(button, file$B, 19, 16, 670);
				}
				div0.className = "btn-wrap svelte-6lqhz6";
				addLoc(div0, file$B, 17, 8, 598);
				addListener(div1, "click", click_handler_1);
				div1.className = div1_class_value = "dropdown " + (ctx.icon?'icon':'') + " " + (!ctx.open && ctx.selection ? 'selection' : '') + " svelte-6lqhz6";
				addLoc(div1, file$B, 3, 4, 155);
				addListener(div2, "click", click_handler_2);
				div2.className = "control-group vis-option-group vis-option-type-select";
				addLoc(div2, file$B, 2, 0, 48);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, input);
				component.refs.searchInput = input;

				input.value = ctx.query;

				append(div1, text0);
				if (if_block0) { if_block0.m(div1, null); }
				append(div1, text1);
				append(div1, div0);
				if (!slot_content_button) {
					append(div0, button);
					append(button, span);
				}

				else {
					append(div0, slot_content_button);
				}

				append(div1, text2);
				if (if_block1) { if_block1.m(div1, null); }
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input_updating && changed.query) { input.value = ctx.query; }
				if ((changed.open || changed.placeholder || changed.selection) && input_placeholder_value !== (input_placeholder_value = ctx.open ? ctx.placeholder : ctx.selection||ctx.placeholder)) {
					input.placeholder = input_placeholder_value;
				}

				if (ctx.icon) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$h(component, ctx);
						if_block0.c();
						if_block0.m(div1, text1);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.open && ctx.matches.length) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$u(component, ctx);
						if_block1.c();
						if_block1.m(div1, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if ((changed.icon || changed.open || changed.selection) && div1_class_value !== (div1_class_value = "dropdown " + (ctx.icon?'icon':'') + " " + (!ctx.open && ctx.selection ? 'selection' : '') + " svelte-6lqhz6")) {
					div1.className = div1_class_value;
				}
			},

			d: function destroy(detach) {
				window.removeEventListener("click", onwindowclick);

				if (detach) {
					detachNode(div2);
				}

				removeListener(input, "input", input_input_handler);
				removeListener(input, "keydown", keydown_handler);
				removeListener(input, "input", input_handler);
				if (component.refs.searchInput === input) { component.refs.searchInput = null; }
				if (if_block0) { if_block0.d(); }
				if (!slot_content_button) {
					removeListener(button, "click", click_handler);
				}

				else {
					reinsertChildren(div0, slot_content_button);
				}

				if (if_block1) { if_block1.d(); }
				removeListener(div1, "click", click_handler_1);
				removeListener(div2, "click", click_handler_2);
			}
		};
	}

	// (14:8) {#if icon}
	function create_if_block_1$h(component, ctx) {
		var i, i_class_value;

		return {
			c: function create() {
				i = createElement("i");
				i.className = i_class_value = "icon " + ctx.icon + " svelte-6lqhz6";
				addLoc(i, file$B, 14, 8, 547);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.icon) && i_class_value !== (i_class_value = "icon " + ctx.icon + " svelte-6lqhz6")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (26:8) {#if open && matches.length}
	function create_if_block$u(component, ctx) {
		var ul;

		var each_value = ctx.matches;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$f(component, get_each_context$e(ctx, each_value, i));
		}

		return {
			c: function create() {
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				ul.className = "dropdown-results svelte-6lqhz6";
				addLoc(ul, file$B, 26, 8, 896);
			},

			m: function mount(target, anchor) {
				insert(target, ul, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				component.refs.dropdown = ul;
			},

			p: function update(changed, ctx) {
				if (changed.selectedIndex || changed.matches) {
					each_value = ctx.matches;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$e(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$f(component, child_ctx);
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
					detachNode(ul);
				}

				destroyEach(each_blocks, detach);

				if (component.refs.dropdown === ul) { component.refs.dropdown = null; }
			}
		};
	}

	// (28:12) {#each matches as item,i}
	function create_each_block$f(component, ctx) {
		var li, raw_value = ctx.item.display || ctx.item.title || ctx.item.name, raw_after, text, li_class_value, li_style_value;

		return {
			c: function create() {
				li = createElement("li");
				raw_after = createElement('noscript');
				text = createText("\n            ");
				li._svelte = { component: component, ctx: ctx };

				addListener(li, "click", click_handler$8);
				li.className = li_class_value = "" + (ctx.i==ctx.selectedIndex?'selected':'') + " svelte-6lqhz6";
				li.style.cssText = li_style_value = ctx.item.style||'';
				addLoc(li, file$B, 29, 12, 990);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, raw_after);
				raw_after.insertAdjacentHTML("beforebegin", raw_value);
				append(li, text);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.matches) && raw_value !== (raw_value = ctx.item.display || ctx.item.title || ctx.item.name)) {
					detachBefore(raw_after);
					raw_after.insertAdjacentHTML("beforebegin", raw_value);
				}

				li._svelte.ctx = ctx;
				if ((changed.selectedIndex) && li_class_value !== (li_class_value = "" + (ctx.i==ctx.selectedIndex?'selected':'') + " svelte-6lqhz6")) {
					li.className = li_class_value;
				}

				if ((changed.matches) && li_style_value !== (li_style_value = ctx.item.style||'')) {
					li.style.cssText = li_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(li, "click", click_handler$8);
			}
		};
	}

	function TypeAhead(options) {
		var this$1 = this;

		this._debugName = '<TypeAhead>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$z(), options.data);

		this._recompute({ query: 1, items: 1, filter: 1 }, this._state);
		if (!('query' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'query'"); }
		if (!('items' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'items'"); }
		if (!('filter' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'filter'"); }
		if (!('icon' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'icon'"); }
		if (!('open' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'open'"); }
		if (!('selection' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'selection'"); }
		if (!('placeholder' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'placeholder'"); }

		if (!('selectedIndex' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'selectedIndex'"); }
		this._intro = true;
		this._handlers.update = [onupdate$5];

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$G(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(TypeAhead.prototype, protoDev);
	assign(TypeAhead.prototype, methods$l);

	TypeAhead.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('matches' in newState && !this._updatingReadonlyProperty) { throw new Error("<TypeAhead>: Cannot set read-only property 'matches'"); }
	};

	TypeAhead.prototype._recompute = function _recompute(changed, state) {
		if (changed.query || changed.items || changed.filter) {
			if (this._differs(state.matches, (state.matches = matches(state)))) { changed.matches = true; }
		}
	};

	/* fields/App.html generated by Svelte v2.16.1 */



	function data$A() {
	    return {
	        customFields: [],
	        custom: {},
	        initialized: false
	    };
	}
	function onstate$5(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    var ref$1 = this.store.get();
	    var dw_chart = ref$1.dw_chart;

	    if (changed.customFields && current.customFields) {
	        var custom = dw_chart.get('metadata.custom', {});

	        current.customFields.forEach(function (field) {
	            if (!custom[field.key]) { custom[field.key] = ''; }
	        });

	        this.set({
	            custom: custom,
	            initialized: true
	        });
	    }

	    if (changed.custom && current.initialized) {
	        dw_chart.set("metadata.custom", current.custom);
	        if (dw_chart.saveSoon) { dw_chart.saveSoon(); }
	    }
	}
	var file$C = "fields/App.html";

	function get_each_context$f(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.field = list[i];
		return child_ctx;
	}

	function create_main_fragment$H(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.customFields.length && ctx.initialized) && create_if_block$v(component, ctx);

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.customFields.length && ctx.initialized) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$v(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if customFields.length && initialized}
	function create_if_block$v(component, ctx) {
		var div2, label, text0, text1, div1, div0;

		var if_block = (!ctx.notoggle) && create_if_block_3$4();

		function click_handler(event) {
			component.toggle();
		}

		var each_value = ctx.customFields;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$g(component, get_each_context$f(ctx, each_value, i));
		}

		return {
			c: function create() {
				div2 = createElement("div");
				label = createElement("label");
				if (if_block) { if_block.c(); }
				text0 = createText(" Custom fields");
				text1 = createText("\n\n    ");
				div1 = createElement("div");
				div0 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addListener(label, "click", click_handler);
				label.className = "group-title";
				addLoc(label, file$C, 2, 4, 92);
				addLoc(div0, file$C, 10, 8, 421);
				div1.className = "option-group-content vis-option-type-chart-description";
				addLoc(div1, file$C, 9, 4, 344);
				div2.className = "vis-option-type-group group-open";
				addLoc(div2, file$C, 1, 0, 41);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, label);
				if (if_block) { if_block.m(label, null); }
				append(label, text0);
				append(div2, text1);
				append(div2, div1);
				append(div1, div0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}

				component.refs.customFields = div0;
			},

			p: function update(changed, ctx) {
				if (!ctx.notoggle) {
					if (!if_block) {
						if_block = create_if_block_3$4();
						if_block.c();
						if_block.m(label, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.customFields || changed.custom) {
					each_value = ctx.customFields;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$f(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$g(component, child_ctx);
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
					detachNode(div2);
				}

				if (if_block) { if_block.d(); }
				removeListener(label, "click", click_handler);

				destroyEach(each_blocks, detach);

				if (component.refs.customFields === div0) { component.refs.customFields = null; }
			}
		};
	}

	// (4:8) {#if !notoggle}
	function create_if_block_3$4(component, ctx) {
		var i0, text, i1;

		return {
			c: function create() {
				i0 = createElement("i");
				text = createText("\n        ");
				i1 = createElement("i");
				i0.className = "fa fa-chevron-up expand-group pull-right";
				addLoc(i0, file$C, 4, 8, 172);
				i1.className = "fa fa-chevron-down collapse-group pull-right";
				addLoc(i1, file$C, 5, 8, 237);
			},

			m: function mount(target, anchor) {
				insert(target, i0, anchor);
				insert(target, text, anchor);
				insert(target, i1, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i0);
					detachNode(text);
					detachNode(i1);
				}
			}
		};
	}

	// (14:46) 
	function create_if_block_2$7(component, ctx) {
		var textarea_updating = {};

		var textarea_initial_data = {
		 	labelWidth: "auto",
		 	label: ctx.field.title,
		 	help: ctx.field.description
		 };
		if (ctx.custom[ctx.field.key] !== void 0) {
			textarea_initial_data.value = ctx.custom[ctx.field.key];
			textarea_updating.value = true;
		}
		var textarea = new TextArea({
			root: component.root,
			store: component.store,
			data: textarea_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!textarea_updating.value && changed.value) {
					ctx.custom[ctx.field.key] = childState.value;
					newState.custom = ctx.custom;
				}
				component._set(newState);
				textarea_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			textarea._bind({ value: 1 }, textarea.get());
		});

		return {
			c: function create() {
				textarea._fragment.c();
			},

			m: function mount(target, anchor) {
				textarea._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var textarea_changes = {};
				if (changed.customFields) { textarea_changes.label = ctx.field.title; }
				if (changed.customFields) { textarea_changes.help = ctx.field.description; }
				if (!textarea_updating.value && changed.custom || changed.customFields) {
					textarea_changes.value = ctx.custom[ctx.field.key];
					textarea_updating.value = ctx.custom[ctx.field.key] !== void 0;
				}
				textarea._set(textarea_changes);
				textarea_updating = {};
			},

			d: function destroy(detach) {
				textarea.destroy(detach);
			}
		};
	}

	// (12:42) {#if field.type == "text"}
	function create_if_block_1$i(component, ctx) {
		var text_updating = {};

		var text_initial_data = {
		 	labelWidth: "auto",
		 	label: ctx.field.title,
		 	help: ctx.field.description
		 };
		if (ctx.custom[ctx.field.key] !== void 0) {
			text_initial_data.value = ctx.custom[ctx.field.key];
			text_updating.value = true;
		}
		var text = new Text({
			root: component.root,
			store: component.store,
			data: text_initial_data,
			_bind: function _bind(changed, childState) {
				var newState = {};
				if (!text_updating.value && changed.value) {
					ctx.custom[ctx.field.key] = childState.value;
					newState.custom = ctx.custom;
				}
				component._set(newState);
				text_updating = {};
			}
		});

		component.root._beforecreate.push(function () {
			text._bind({ value: 1 }, text.get());
		});

		return {
			c: function create() {
				text._fragment.c();
			},

			m: function mount(target, anchor) {
				text._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var text_changes = {};
				if (changed.customFields) { text_changes.label = ctx.field.title; }
				if (changed.customFields) { text_changes.help = ctx.field.description; }
				if (!text_updating.value && changed.custom || changed.customFields) {
					text_changes.value = ctx.custom[ctx.field.key];
					text_updating.value = ctx.custom[ctx.field.key] !== void 0;
				}
				text._set(text_changes);
				text_updating = {};
			},

			d: function destroy(detach) {
				text.destroy(detach);
			}
		};
	}

	// (12:12) {#each customFields as field}
	function create_each_block$g(component, ctx) {
		var if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.field.type == "text") { return create_if_block_1$i; }
			if (ctx.field.type == "textArea") { return create_if_block_2$7; }
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type && current_block_type(component, ctx);

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if (if_block) { if_block.d(1); }
					if_block = current_block_type && current_block_type(component, ctx);
					if (if_block) { if_block.c(); }
					if (if_block) { if_block.m(if_block_anchor.parentNode, if_block_anchor); }
				}
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	function App(options) {
		var this$1 = this;

		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$A(), options.data);
		if (!('customFields' in this._state)) { console.warn("<App> was created without expected data property 'customFields'"); }
		if (!('initialized' in this._state)) { console.warn("<App> was created without expected data property 'initialized'"); }
		if (!('notoggle' in this._state)) { console.warn("<App> was created without expected data property 'notoggle'"); }
		if (!('custom' in this._state)) { console.warn("<App> was created without expected data property 'custom'"); }
		this._intro = true;

		this._handlers.state = [onstate$5];

		onstate$5.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$H(this, this._state);

		this.root._oncreate.push(function () {
			this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
		});

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(App.prototype, protoDev);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
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
			var this$1 = this;

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

			this._dependents
				.filter(function (dependent) {
					var componentState = {};
					var dirty = false;

					for (var j = 0; j < dependent.props.length; j += 1) {
						var prop = dependent.props[j];
						if (prop in changed) {
							componentState['$' + prop] = this$1._state[prop];
							dirty = true;
						}
					}

					if (dirty) {
						dependent.component._stage(componentState);
						return true;
					}
				})
				.forEach(function (dependent) {
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
							throw new Error(("Cyclical dependency detected between " + dep + " <-> " + key));
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
			var this$1 = this;

			var value;

			var c = {
				deps: deps,
				update: function (state, changed, dirty) {
					var values = deps.map(function (dep) {
						if (dep in changed) { dirty = true; }
						return state[dep];
					});

					if (dirty) {
						var newValue = fn.apply(null, values);
						if (this$1._differs(newValue, value)) {
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
				if (this._computed[key]) { throw new Error(("'" + key + "' is a read-only computed property")); }
				if (this._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
			}
			if (!dirty) { return; }

			this._set(newState, changed);
		}
	});

	/* globals chart */

	var store = new Store({});

	var data$B = {
	    chart: {
	        id: ''
	    }
	};

	function init$1(app) {
	    window.dw.backend
	        .on('dataset-loaded', function() {
	            app.store.set({ dataset: chart.dataset() });
	        })
	        .on('theme-changed-and-loaded', function() {
	            app.store.set({ theme: window.dw.theme(chart.get('theme')) });
	        })
	        .on('backend-vis-loaded', function(vis) {
	            app.store.set({ vis: vis });
	        });
	}

	var main = { App: App, data: data$B, store: store, init: init$1 };

	return main;

}));
//# sourceMappingURL=fields.js.map
