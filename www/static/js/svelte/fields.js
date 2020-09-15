(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/fields', factory) :
	(global = global || self, global.fields = factory());
}(this, function () { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
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

	function reinsertChildren(parent, target) {
		while (parent.firstChild) target.appendChild(parent.firstChild);
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
		if (value == null) node.removeAttribute(attribute);
		else node.setAttribute(attribute, value);
	}

	function setData(text, data) {
		text.data = '' + data;
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
	}

	function toggleClass(element, name, toggle) {
		element.classList[toggle ? 'add' : 'remove'](name);
	}

	function linear(t) {
		return t;
	}

	function generateRule({ a, b, delta, duration }, ease, fn) {
		const step = 16.666 / duration;
		let keyframes = '{\n';

		for (let p = 0; p <= 1; p += step) {
			const t = a + delta * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}

		return keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	}

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
		let hash = 5381;
		let i = str.length;

		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	function wrapTransition(component, node, fn, params, intro) {
		let obj = fn.call(component, node, params);
		let duration;
		let ease;
		let cssText;

		let initialised = false;

		return {
			t: intro ? 0 : 1,
			running: false,
			program: null,
			pending: null,

			run(b, callback) {
				if (typeof obj === 'function') {
					transitionManager.wait().then(() => {
						obj = obj();
						this._run(b, callback);
					});
				} else {
					this._run(b, callback);
				}
			},

			_run(b, callback) {
				duration = obj.duration || 300;
				ease = obj.easing || linear;

				const program = {
					start: window.performance.now() + (obj.delay || 0),
					b,
					callback: callback || noop
				};

				if (intro && !initialised) {
					if (obj.css && obj.delay) {
						cssText = node.style.cssText;
						node.style.cssText += obj.css(0, 1);
					}

					if (obj.tick) obj.tick(0, 1);
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

			start(program) {
				component.fire(`${program.b ? 'intro' : 'outro'}.start`, { node });

				program.a = this.t;
				program.delta = program.b - program.a;
				program.duration = duration * Math.abs(program.b - program.a);
				program.end = program.start + program.duration;

				if (obj.css) {
					if (obj.delay) node.style.cssText = cssText;

					const rule = generateRule(program, ease, obj.css);
					transitionManager.addRule(rule, program.name = '__svelte_' + hash(rule));

					node.style.animation = (node.style.animation || '')
						.split(', ')
						.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
						.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
						.join(', ');
				}

				this.program = program;
				this.pending = null;
			},

			update(now) {
				const program = this.program;
				if (!program) return;

				const p = now - program.start;
				this.t = program.a + program.delta * ease(p / program.duration);
				if (obj.tick) obj.tick(this.t, 1 - this.t);
			},

			done() {
				const program = this.program;
				this.t = program.b;

				if (obj.tick) obj.tick(this.t, 1 - this.t);

				component.fire(`${program.b ? 'intro' : 'outro'}.end`, { node });

				if (!program.b && !program.invalidated) {
					program.group.callbacks.push(() => {
						program.callback();
						if (obj.css) transitionManager.deleteRule(node, program.name);
					});

					if (--program.group.remaining === 0) {
						program.group.callbacks.forEach(run);
					}
				} else {
					if (obj.css) transitionManager.deleteRule(node, program.name);
				}

				this.running = !!this.pending;
			},

			abort(reset) {
				if (this.program) {
					if (reset && obj.tick) obj.tick(1, 0);
					if (obj.css) transitionManager.deleteRule(node, this.program.name);
					this.program = this.pending = null;
					this.running = false;
				}
			},

			invalidate() {
				if (this.program) {
					this.program.invalidated = true;
				}
			}
		};
	}

	let outros = {};

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

		add(transition) {
			this.transitions.push(transition);

			if (!this.running) {
				this.running = true;
				requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
			}
		},

		addRule(rule, name) {
			if (!this.stylesheet) {
				const style = createElement('style');
				document.head.appendChild(style);
				transitionManager.stylesheet = style.sheet;
			}

			if (!this.activeRules[name]) {
				this.activeRules[name] = true;
				this.stylesheet.insertRule(`@keyframes ${name} ${rule}`, this.stylesheet.cssRules.length);
			}
		},

		next() {
			this.running = false;

			const now = window.performance.now();
			let i = this.transitions.length;

			while (i--) {
				const transition = this.transitions[i];

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
				let i = this.stylesheet.cssRules.length;
				while (i--) this.stylesheet.deleteRule(i);
				this.activeRules = {};
			}
		},

		deleteRule(node, name) {
			node.style.animation = node.style.animation
				.split(', ')
				.filter(anim => anim && anim.indexOf(name) === -1)
				.join(', ');
		},

		wait() {
			if (!transitionManager.promise) {
				transitionManager.promise = Promise.resolve();
				transitionManager.promise.then(() => {
					transitionManager.promise = null;
				});
			}

			return transitionManager.promise;
		}
	};

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
			cancel: function() {
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
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	var protoDev = {
		destroy: destroyDev,
		get,
		fire,
		on,
		set: setDev,
		_recompute: noop,
		_set,
		_stage,
		_mount,
		_differs
	};

	/* node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v2.16.1 */

	function data() {
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

	const file = "node_modules/datawrapper/controls/ControlGroup.html";

	function create_main_fragment(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_1(component, ctx);

		var if_block1 = (ctx.help) && create_if_block(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n    ");
				div0 = createElement("div");
				text1 = createText("\n    ");
				if (if_block1) if_block1.c();
				div0.className = "controls svelte-p72242";
				setStyle(div0, "width", "calc(100% - " + (ctx.width||def.width) + " - 32px)");
				toggleClass(div0, "form-inline", ctx.inline);
				addLoc(div0, file, 4, 4, 218);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-p72242";
				addLoc(div1, file, 0, 0, 0);
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
					setStyle(div0, "width", "calc(100% - " + (ctx.width||def.width) + " - 32px)");
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
	}

	// (2:4) {#if label}
	function create_if_block_1(component, ctx) {
		var label;

		return {
			c: function create() {
				label = createElement("label");
				setStyle(label, "width", (ctx.width||def.width));
				label.className = "control-label svelte-p72242";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file, 2, 4, 104);
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

	// (8:4) {#if help}
	function create_if_block(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.width||def.width));
				p.className = p_class_value = "mini-help " + ctx.type + " svelte-p72242";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file, 8, 4, 369);
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
					setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.width||def.width));
				}

				if ((changed.type) && p_class_value !== (p_class_value = "mini-help " + ctx.type + " svelte-p72242")) {
					p.className = p_class_value;
				}

				if ((changed.type || changed.inline)) {
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
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('type' in this._state)) console.warn("<ControlGroup> was created without expected data property 'type'");
		if (!('valign' in this._state)) console.warn("<ControlGroup> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<ControlGroup> was created without expected data property 'label'");
		if (!('width' in this._state)) console.warn("<ControlGroup> was created without expected data property 'width'");
		if (!('inline' in this._state)) console.warn("<ControlGroup> was created without expected data property 'inline'");
		if (!('help' in this._state)) console.warn("<ControlGroup> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* node_modules/@datawrapper/controls/TextArea.html generated by Svelte v2.16.1 */

	function data$1() {
	    return {
	        placeholder: '',
	        labelWidth: '100px',
	        width: '100%',
	        height: 'auto'
	    };
	}
	const file$1 = "node_modules/datawrapper/controls/TextArea.html";

	function create_main_fragment$1(component, ctx) {
		var div, textarea, textarea_updating = false;

		function textarea_input_handler() {
			textarea_updating = true;
			component.set({ value: textarea.value });
			textarea_updating = false;
		}

		var controlgroup_initial_data = {
		 	disabled: ctx.disabled,
		 	type: "textarea",
		 	width: ctx.labelWidth,
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
				div = createElement("div");
				textarea = createElement("textarea");
				controlgroup._fragment.c();
				addListener(textarea, "input", textarea_input_handler);
				textarea.placeholder = ctx.placeholder;
				textarea.disabled = ctx.disabled;
				setStyle(textarea, "height", ctx.height);
				textarea.className = "svelte-re24xs";
				addLoc(textarea, file$1, 2, 8, 156);
				div.className = "textarea-container svelte-re24xs";
				setStyle(div, "width", ctx.width);
				addLoc(div, file$1, 1, 4, 93);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);
				append(div, textarea);

				textarea.value = ctx.value;

				controlgroup._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (!textarea_updating && changed.value) textarea.value = ctx.value;
				if (changed.placeholder) {
					textarea.placeholder = ctx.placeholder;
				}

				if (changed.disabled) {
					textarea.disabled = ctx.disabled;
				}

				if (changed.height) {
					setStyle(textarea, "height", ctx.height);
				}

				if (changed.width) {
					setStyle(div, "width", ctx.width);
				}

				var controlgroup_changes = {};
				if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;
				if (changed.labelWidth) controlgroup_changes.width = ctx.labelWidth;
				if (changed.label) controlgroup_changes.label = ctx.label;
				if (changed.help) controlgroup_changes.help = ctx.help;
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
		this._state = assign(data$1(), options.data);
		if (!('disabled' in this._state)) console.warn("<TextArea> was created without expected data property 'disabled'");
		if (!('labelWidth' in this._state)) console.warn("<TextArea> was created without expected data property 'labelWidth'");
		if (!('label' in this._state)) console.warn("<TextArea> was created without expected data property 'label'");
		if (!('help' in this._state)) console.warn("<TextArea> was created without expected data property 'help'");
		if (!('width' in this._state)) console.warn("<TextArea> was created without expected data property 'width'");
		if (!('value' in this._state)) console.warn("<TextArea> was created without expected data property 'value'");
		if (!('placeholder' in this._state)) console.warn("<TextArea> was created without expected data property 'placeholder'");
		if (!('height' in this._state)) console.warn("<TextArea> was created without expected data property 'height'");
		this._intro = true;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(TextArea.prototype, protoDev);

	TextArea.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	function cubicOut(t) {
	  var f = t - 1.0;
	  return f * f * f + 1.0
	}

	function slide(
		node,
		ref
	) {
		var delay = ref.delay; if ( delay === void 0 ) delay = 0;
		var duration = ref.duration; if ( duration === void 0 ) duration = 400;
		var easing = ref.easing; if ( easing === void 0 ) easing = cubicOut;

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

	/* node_modules/@datawrapper/controls/Text.html generated by Svelte v2.16.1 */



	function data$2() {
	    return {
	        disabled: false,
	        disabled_msg: '',
	        width: '100px',
	        valign: 'middle',
	        help: '',
	        placeholder: '',
	        prepend: '',
	        append: ''
	    };
	}
	const file$2 = "node_modules/datawrapper/controls/Text.html";

	function create_main_fragment$2(component, ctx) {
		var div, text0, input, input_updating = false, text1, text2, if_block2_anchor;

		var if_block0 = (ctx.prepend) && create_if_block_2(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ value: input.value });
			input_updating = false;
		}

		var if_block1 = (ctx.append) && create_if_block_1$1(component, ctx);

		var controlgroup_initial_data = {
		 	disabled: ctx.disabled,
		 	type: "text",
		 	width: ctx.width,
		 	label: ctx.label,
		 	help: ctx.help,
		 	valign: ctx.valign
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block2 = (ctx.disabled && ctx.disabled_msg) && create_if_block$1(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n        ");
				input = createElement("input");
				text1 = createText("\n        ");
				if (if_block1) if_block1.c();
				controlgroup._fragment.c();
				text2 = createText("\n\n");
				if (if_block2) if_block2.c();
				if_block2_anchor = createComment();
				addListener(input, "input", input_input_handler);
				input.disabled = ctx.disabled;
				setAttribute(input, "type", "text");
				input.placeholder = ctx.placeholder;
				input.className = "svelte-o89ig2";
				addLoc(input, file$2, 5, 8, 225);
				div.className = "flex svelte-o89ig2";
				addLoc(div, file$2, 1, 4, 117);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				append(div, input);

				input.value = ctx.value ;

				append(div, text1);
				if (if_block1) if_block1.m(div, null);
				controlgroup._mount(target, anchor);
				insert(target, text2, anchor);
				if (if_block2) if_block2.i(target, anchor);
				insert(target, if_block2_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.prepend) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2(component, ctx);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!input_updating && changed.value) input.value = ctx.value ;
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
						if_block1 = create_if_block_1$1(component, ctx);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				var controlgroup_changes = {};
				if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;
				if (changed.width) controlgroup_changes.width = ctx.width;
				if (changed.label) controlgroup_changes.label = ctx.label;
				if (changed.help) controlgroup_changes.help = ctx.help;
				if (changed.valign) controlgroup_changes.valign = ctx.valign;
				controlgroup._set(controlgroup_changes);

				if (ctx.disabled && ctx.disabled_msg) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$1(component, ctx);
						if (if_block2) if_block2.c();
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
				if (if_block0) if_block0.d();
				removeListener(input, "input", input_input_handler);
				if (if_block1) if_block1.d();
				controlgroup.destroy(detach);
				if (detach) {
					detachNode(text2);
				}

				if (if_block2) if_block2.d(detach);
				if (detach) {
					detachNode(if_block2_anchor);
				}
			}
		};
	}

	// (3:8) {#if prepend}
	function create_if_block_2(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.prepend);
				div.className = "prepend";
				addLoc(div, file$2, 3, 8, 166);
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
	function create_if_block_1$1(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.append);
				div.className = "append";
				addLoc(div, file$2, 7, 8, 337);
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
	function create_if_block$1(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-o89ig2";
				addLoc(div0, file$2, 14, 4, 472);
				addLoc(div1, file$2, 13, 0, 445);
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
				if (current) return;
				if (component.root._intro) {
					if (div1_transition) div1_transition.invalidate();

					component.root._aftercreate.push(() => {
						if (!div1_transition) div1_transition = wrapTransition(component, div1, slide, {}, true);
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (!div1_transition) div1_transition = wrapTransition(component, div1, slide, {}, false);
				div1_transition.run(0, () => {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
					if (div1_transition) div1_transition.abort();
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
		this._state = assign(data$2(), options.data);
		if (!('disabled' in this._state)) console.warn("<Text> was created without expected data property 'disabled'");
		if (!('width' in this._state)) console.warn("<Text> was created without expected data property 'width'");
		if (!('label' in this._state)) console.warn("<Text> was created without expected data property 'label'");
		if (!('help' in this._state)) console.warn("<Text> was created without expected data property 'help'");
		if (!('valign' in this._state)) console.warn("<Text> was created without expected data property 'valign'");
		if (!('prepend' in this._state)) console.warn("<Text> was created without expected data property 'prepend'");
		if (!('placeholder' in this._state)) console.warn("<Text> was created without expected data property 'placeholder'");
		if (!('value' in this._state)) console.warn("<Text> was created without expected data property 'value'");
		if (!('append' in this._state)) console.warn("<Text> was created without expected data property 'append'");
		if (!('disabled_msg' in this._state)) console.warn("<Text> was created without expected data property 'disabled_msg'");
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Text.prototype, protoDev);

	Text.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

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
	    if (!o || typeof o !== 'object') return o;
	    try {
	        return JSON.parse(JSON.stringify(o));
	    } catch (e) {
	        return o;
	    }
	}

	/* fields/App.html generated by Svelte v2.16.1 */



	function data$3() {
	    return {
	        customFields: [],
	        custom: {},
	        initialized: false
	    };
	}
	function onstate({ changed, current }) {
	    const { dw_chart } = this.store.get();

	    if (changed.customFields && current.customFields) {
	        const custom = clone(dw_chart.get('metadata.custom', {}));

	        current.customFields.forEach(field => {
	            if (!custom[field.key]) custom[field.key] = '';
	        });

	        this.set({
	            custom: custom,
	            initialized: true
	        });
	    }

	    if (changed.custom && current.initialized) {
	        dw_chart.set(`metadata.custom`, clone(current.custom));
	        if (dw_chart.saveSoon) dw_chart.saveSoon();
	    }
	}
	const file$3 = "fields/App.html";

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.field = list[i];
		return child_ctx;
	}

	function create_main_fragment$3(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.customFields.length && ctx.initialized) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.customFields.length && ctx.initialized) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$2(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (1:0) {#if customFields.length && initialized}
	function create_if_block$2(component, ctx) {
		var div1, label, text0, text1, div0;

		var if_block = (!ctx.notoggle) && create_if_block_3();

		function click_handler(event) {
			component.toggle();
		}

		var each_value = ctx.customFields;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				div1 = createElement("div");
				label = createElement("label");
				if (if_block) if_block.c();
				text0 = createText(" Custom fields");
				text1 = createText("\n\n    ");
				div0 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addListener(label, "click", click_handler);
				label.className = "group-title";
				addLoc(label, file$3, 2, 4, 109);
				div0.className = "option-group-content vis-option-type-chart-description";
				addLoc(div0, file$3, 9, 4, 361);
				div1.className = "vis-option-type-group group-open svelte-11r7z9v svelte-ref-customfields";
				addLoc(div1, file$3, 1, 0, 41);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, label);
				if (if_block) if_block.m(label, null);
				append(label, text0);
				append(div1, text1);
				append(div1, div0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}

				component.refs.customfields = div1;
			},

			p: function update(changed, ctx) {
				if (!ctx.notoggle) {
					if (!if_block) {
						if_block = create_if_block_3();
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
						const child_ctx = get_each_context(ctx, each_value, i);

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

				if (if_block) if_block.d();
				removeListener(label, "click", click_handler);

				destroyEach(each_blocks, detach);

				if (component.refs.customfields === div1) component.refs.customfields = null;
			}
		};
	}

	// (4:8) {#if !notoggle}
	function create_if_block_3(component, ctx) {
		var i0, text, i1;

		return {
			c: function create() {
				i0 = createElement("i");
				text = createText("\n        ");
				i1 = createElement("i");
				i0.className = "fa fa-chevron-up expand-group pull-right";
				addLoc(i0, file$3, 4, 8, 189);
				i1.className = "fa fa-chevron-down collapse-group pull-right";
				addLoc(i1, file$3, 5, 8, 254);
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

	// (19:42) 
	function create_if_block_2$1(component, ctx) {
		var textarea_updating = {};

		var textarea_initial_data = {
		 	labelWidth: "auto",
		 	width: "120px",
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
			_bind(changed, childState) {
				var newState = {};
				if (!textarea_updating.value && changed.value) {
					ctx.custom[ctx.field.key] = childState.value;
					newState.custom = ctx.custom;
				}
				component._set(newState);
				textarea_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
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
				if (changed.customFields) textarea_changes.label = ctx.field.title;
				if (changed.customFields) textarea_changes.help = ctx.field.description;
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

	// (11:38) {#if field.type == "text"}
	function create_if_block_1$2(component, ctx) {
		var text_updating = {};

		var text_initial_data = {
		 	labelWidth: "auto",
		 	width: "120px",
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
			_bind(changed, childState) {
				var newState = {};
				if (!text_updating.value && changed.value) {
					ctx.custom[ctx.field.key] = childState.value;
					newState.custom = ctx.custom;
				}
				component._set(newState);
				text_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
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
				if (changed.customFields) text_changes.label = ctx.field.title;
				if (changed.customFields) text_changes.help = ctx.field.description;
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

	// (11:8) {#each customFields as field}
	function create_each_block(component, ctx) {
		var if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.field.type == "text") return create_if_block_1$2;
			if (ctx.field.type == "textArea") return create_if_block_2$1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type && current_block_type(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if (if_block) if_block.d(1);
					if_block = current_block_type && current_block_type(component, ctx);
					if (if_block) if_block.c();
					if (if_block) if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$3(), options.data);
		if (!('customFields' in this._state)) console.warn("<App> was created without expected data property 'customFields'");
		if (!('initialized' in this._state)) console.warn("<App> was created without expected data property 'initialized'");
		if (!('notoggle' in this._state)) console.warn("<App> was created without expected data property 'notoggle'");
		if (!('custom' in this._state)) console.warn("<App> was created without expected data property 'custom'");
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$3(this, this._state);

		this.root._oncreate.push(() => {
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
		_add(component, props) {
			this._dependents.push({
				component: component,
				props: props
			});
		},

		_init(props) {
			const state = {};
			for (let i = 0; i < props.length; i += 1) {
				const prop = props[i];
				state['$' + prop] = this._state[prop];
			}
			return state;
		},

		_remove(component) {
			let i = this._dependents.length;
			while (i--) {
				if (this._dependents[i].component === component) {
					this._dependents.splice(i, 1);
					return;
				}
			}
		},

		_set(newState, changed) {
			const previous = this._state;
			this._state = assign(assign({}, previous), newState);

			for (let i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this._sortedComputedProperties[i].update(this._state, changed);
			}

			this.fire('state', {
				changed,
				previous,
				current: this._state
			});

			this._dependents
				.filter(dependent => {
					const componentState = {};
					let dirty = false;

					for (let j = 0; j < dependent.props.length; j += 1) {
						const prop = dependent.props[j];
						if (prop in changed) {
							componentState['$' + prop] = this._state[prop];
							dirty = true;
						}
					}

					if (dirty) {
						dependent.component._stage(componentState);
						return true;
					}
				})
				.forEach(dependent => {
					dependent.component.set({});
				});

			this.fire('update', {
				changed,
				previous,
				current: this._state
			});
		},

		_sortComputedProperties() {
			const computed = this._computed;
			const sorted = this._sortedComputedProperties = [];
			const visited = blankObject();
			let currentKey;

			function visit(key) {
				const c = computed[key];

				if (c) {
					c.deps.forEach(dep => {
						if (dep === currentKey) {
							throw new Error(`Cyclical dependency detected between ${dep} <-> ${key}`);
						}

						visit(dep);
					});

					if (!visited[key]) {
						visited[key] = true;
						sorted.push(c);
					}
				}
			}

			for (const key in this._computed) {
				visit(currentKey = key);
			}
		},

		compute(key, deps, fn) {
			let value;

			const c = {
				deps,
				update: (state, changed, dirty) => {
					const values = deps.map(dep => {
						if (dep in changed) dirty = true;
						return state[dep];
					});

					if (dirty) {
						const newValue = fn.apply(null, values);
						if (this._differs(newValue, value)) {
							value = newValue;
							changed[key] = true;
							state[key] = value;
						}
					}
				}
			};

			this._computed[key] = c;
			this._sortComputedProperties();

			const state = assign({}, this._state);
			const changed = {};
			c.update(state, changed, true);
			this._set(state, changed);
		},

		fire,

		get,

		on,

		set(newState) {
			const oldState = this._state;
			const changed = this._changed = {};
			let dirty = false;

			for (const key in newState) {
				if (this._computed[key]) throw new Error(`'${key}' is a read-only computed property`);
				if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
			}
			if (!dirty) return;

			this._set(newState, changed);
		}
	});

	/* globals chart */

	const store = new Store({});

	const data$4 = {
	    chart: {
	        id: ''
	    }
	};

	function init$1(app) {
	    window.dw.backend
	        .on('dataset-loaded', function () {
	            app.store.set({ dataset: chart.dataset() });
	        })
	        .on('theme-changed-and-loaded', function () {
	            app.store.set({ theme: window.dw.theme(chart.get('theme')) });
	        })
	        .on('backend-vis-loaded', function (vis) {
	            app.store.set({ vis: vis });
	        });
	}

	var main = { App, data: data$4, store, init: init$1 };

	return main;

}));
//# sourceMappingURL=fields.js.map
