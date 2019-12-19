(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/editor', factory) :
	(global = global || self, global.editor = factory());
}(this, function () { 'use strict';

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

			d: function destroy() {
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

			d: function destroy() {
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

	function assign$1(tar, src) {
		for (var k in src) { tar[k] = src[k]; }
		return tar;
	}

	function blankObject$1() {
		return Object.create(null);
	}

	function _differs$1(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function _differsImmutable(a, b) {
		return a != a ? b == b : a !== b;
	}

	function fire$1(eventName, data) {
		var this$1 = this;

		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) { return; }

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this$1, data);
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
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) { handlers.splice(index, 1); }
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
			var this$1 = this;

			var state = {};
			for (var i = 0; i < props.length; i += 1) {
				var prop = props[i];
				state['$' + prop] = this$1._state[prop];
			}
			return state;
		},

		_remove: function _remove(component) {
			var this$1 = this;

			var i = this._dependents.length;
			while (i--) {
				if (this$1._dependents[i].component === component) {
					this$1._dependents.splice(i, 1);
					return;
				}
			}
		},

		_set: function _set(newState, changed) {
			var this$1 = this;

			var previous = this._state;
			this._state = assign$1(assign$1({}, previous), newState);

			for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this$1._sortedComputedProperties[i].update(this$1._state, changed);
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
			var this$1 = this;

			var computed = this._computed;
			var sorted = this._sortedComputedProperties = [];
			var visited = blankObject$1();
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

			for (var key in this$1._computed) {
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

			var state = assign$1({}, this._state);
			var changed = {};
			c.update(state, changed, true);
			this._set(state, changed);
		},

		fire: fire$1,

		get: get$1,

		on: on$1,

		set: function set(newState) {
			var this$1 = this;

			var oldState = this._state;
			var changed = this._changed = {};
			var dirty = false;

			for (var key in newState) {
				if (this$1._computed[key]) { throw new Error(("'" + key + "' is a read-only computed property")); }
				if (this$1._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
			}
			if (!dirty) { return; }

			this._set(newState, changed);
		}
	});

	function getNestedValue(obj, parts) {
	    for (var i = 0; i < parts.length; i += 1) {
	        if (!obj)
	            { return undefined; }
	        obj = obj[parts[i]];
	    }
	    return obj;
	}
	function observeDeep(keypath, callback, opts) {
	    var parts = keypath.replace(/\[(\d+)\]/g, '.$1').split('.');
	    var key = parts[0];
	    var fn = callback.bind(this);
	    var last = getNestedValue(this.get(), parts);
	    if (!opts || opts.init !== false)
	        { fn(last); }
	    return this.on(opts && opts.defer ? 'update' : 'state', function (_a) {
	        var changed = _a.changed, current = _a.current, previous = _a.previous;
	        if (changed[key]) {
	            var value = getNestedValue(current, parts);
	            if (value !== last ||
	                typeof value === 'object' ||
	                typeof value === 'function') {
	                fn(value, last);
	                last = value;
	            }
	        }
	    });
	}

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
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
	  if (!exports.nodeType) {
	    if (!module.nodeType && module.exports) {
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
	      var this$1 = this;

	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) { result = args[i].call(this$1, result); }
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
	  if (typeof Int8Array != 'object' && typeof nodelist != 'function') {
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

	/*
	 * Dataset class
	 * @class dw.Dataset
	 *
	 * @param {dw.Column[]} columns
	 */
	function dataset(columns) {
	    // make column names unique
	    var columnsByName = {};
	    var origColumns = columns.slice(0);

	    columns.forEach(function (col) {
	        uniqueName(col);
	        columnsByName[col.name()] = col;
	    });

	    // sets a unique name for a column
	    function uniqueName(col) {
	        var origColName = col.name();
	        var colName = origColName;
	        var appendix = 1;

	        while (columnsByName.hasOwnProperty(colName)) {
	            colName = origColName + '.' + appendix++;
	        }
	        if (colName !== origColName) { col.name(colName); } // rename column
	    }

	    // public interface
	    var dataset = {
	        /**
	         * returns all columns of the dataset
	         * @returns {dw.Column[]}
	         */
	        columns: function columns$1() {
	            return columns;
	        },

	        /**
	         * returns a specific column by name or index
	         *
	         * @param {string|number} nameOrIndex -- the name or index of the column to return
	         * @returns {dw.Column}
	         */
	        column: function column(nameOrIndex) {
	            if (underscore.isString(nameOrIndex)) {
	                // single column by name
	                if (columnsByName[nameOrIndex] !== undefined) { return columnsByName[nameOrIndex]; }
	                throw new Error('No column found with that name: "' + nameOrIndex + '"');
	            } else {
	                if (nameOrIndex < 0) {
	                    return;
	                }
	            }

	            // single column by index
	            if (columns[nameOrIndex] !== undefined) { return columns[nameOrIndex]; }
	            throw new Error('No column found with that name or index: ' + nameOrIndex);
	        },

	        /**
	         * returns the number of columns in the dataset
	         * @returns {number}
	         */
	        numColumns: function numColumns() {
	            return columns.length;
	        },

	        /**
	         * returns the number of rows in the dataset
	         * @returns {number}
	         */
	        numRows: function numRows() {
	            return columns[0].length;
	        },

	        /** calls a function for each column of the dataset */
	        eachColumn: function eachColumn(func) {
	            columns.forEach(func);
	        },

	        /**
	         * tests if a column name or index exists
	         *
	         * @param {string|number} nameOrIndex -- the name or index of the column
	         * @returns {boolean}
	         */
	        hasColumn: function hasColumn(nameOrIndex) {
	            return (
	                (underscore.isString(nameOrIndex) ? columnsByName[nameOrIndex] : columns[nameOrIndex]) !==
	                undefined
	            );
	        },

	        /**
	         * returns the index of a column
	         * @param {string} columnName
	         * @returns {number}
	         */
	        indexOf: function indexOf(columnName) {
	            if (!dataset.hasColumn(columnName)) { return -1; }
	            return columns.indexOf(columnsByName[columnName]);
	        },

	        /**
	         * returns a D3 friendly list of plain objects
	         * @returns {object[]}
	         */
	        list: function list() {
	            return underscore.range(columns[0].length).map(function(r) {
	                var o = {};
	                columns.forEach(function (col) {
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
	            var quote = '"';
	            // add header
	            columns.forEach(function (col, i) {
	                var t = col.title();
	                if (t.indexOf(quote) > -1) { t.replace(quote, '\\' + quote); }
	                if (t.indexOf(sep) > -1) { t = quote + t + quote; }
	                csv += (i > 0 ? sep : '') + t;
	            });
	            // add values
	            underscore.range(dataset.numRows()).forEach(function (row) {
	                csv += '\n';
	                columns.forEach(function (col, i) {
	                    var t = '' + (col.type() === 'date' ? col.raw(row) : col.val(row));
	                    if (t.indexOf(quote) > -1) { t.replace(quote, '\\' + quote); }
	                    if (t.indexOf(sep) > -1) { t = quote + t + quote; }
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
	            columns = columns.filter(function (c) { return !ignore[c.name()]; });
	            underscore.each(ignore, function (ign, key) {
	                if (ign && columnsByName[key]) { delete columnsByName[key]; }
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
	            columns.push(column);
	            columnsByName[column.name()] = column;
	            origColumns.push(column);
	            return dataset;
	        },

	        /**
	         * resets the datasets to its original columns
	         * @returns {dw.Dataset}
	         */
	        reset: function reset() {
	            columns = origColumns.slice(0);
	            columnsByName = {};
	            columns.forEach(function (col) {
	                columnsByName[col.name()] = col;
	            });
	            return dataset;
	        },

	        /**
	         * cuts each column in the dataset to a maximum number of rows
	         * @param {number} numRows
	         * @returns {dw.Dataset}
	         */
	        limitRows: function limitRows(numRows) {
	            columns.forEach(function (col) {
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
	            if (columns.length > numCols) {
	                columns.length = numCols;
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
	                columns.length = 0;
	                sortOrder.forEach(function(i) {
	                    columns.push(origColumns[i]);
	                });
	                return dataset;
	            }
	            return columns.map(function(c) {
	                return origColumns.indexOf(c);
	            });
	        }
	    };

	    return dataset;
	}

	function text() {
	    return {
	        parse: underscore.identity,
	        errors: function() {
	            return 0;
	        },
	        name: function() {
	            return 'text';
	        },
	        formatter: function() {
	            return underscore.identity;
	        },
	        isValid: function() {
	            return true;
	        },
	        format: function() {}
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
	function number(sample) {
	    function signDigitsDecimalPlaces(num, sig) {
	        if (num === 0) { return 0; }
	        return Math.round(sig - Math.ceil(Math.log(Math.abs(num)) / Math.LN10));
	    }

	    var format;
	    var errors = 0;
	    var knownFormats = {
	        '-.': /^ *[-–—−]?[0-9]*(\.[0-9]+)?(e[+-][0-9]+)?%? *$/,
	        '-,': /^ *[-–—−]?[0-9]*(,[0-9]+)?%? *$/,
	        ',.': /^ *[-–—−]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
	        '.,': /^ *[-–—−]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
	        ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
	        ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
	        // thin spaces
	        ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
	        ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
	        // excel sometimes produces a strange white-space:
	        ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
	        ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
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
	    };
	    // a list of strings that are recognized as 'not available'
	    var naStrings = {
	        na: 1,
	        'n/a': 1,
	        '-': 1,
	        ':': 1
	    };

	    var matches = {};
	    var bestMatch = ['-.', 0];

	    sample = sample || [];

	    underscore.each(sample, function(n) {
	        underscore.each(knownFormats, function(regex, fmt) {
	            if (matches[fmt] === undefined) { matches[fmt] = 0; }
	            if (regex.test(n)) {
	                matches[fmt] += 1;
	                if (matches[fmt] > bestMatch[1]) {
	                    bestMatch[0] = fmt;
	                    bestMatch[1] = matches[fmt];
	                }
	            }
	        });
	    });
	    format = bestMatch[0];

	    // public interface
	    var type = {
	        parse: function(raw) {
	            if (underscore.isNumber(raw) || underscore.isUndefined(raw) || underscore.isNull(raw)) { return raw; }
	            // replace percent sign, n-dash & m-dash
	            var number = raw
	                .replace('%', '')
	                .replace('−', '-')
	                .replace('–', '-')
	                .replace('—', '-');
	            // normalize number
	            if (format[0] !== '-') {
	                // remove kilo seperator
	                number = number.replace(new RegExp(format[0] === '.' ? '\\.' : format[0], 'g'), '');
	            }
	            if (format[1] !== '.') {
	                // replace decimal char w/ point
	                number = number.replace(format[1], '.');
	            }
	            if (isNaN(number) || number === '') {
	                if (!naStrings[number.toLowerCase()] && number !== '') { errors++; }
	                return raw;
	            }
	            return Number(number);
	        },
	        toNum: function(i) {
	            return i;
	        },
	        fromNum: function(i) {
	            return i;
	        },
	        errors: function() {
	            return errors;
	        },
	        name: function() {
	            return 'number';
	        },

	        // returns a function for formatting numbers
	        formatter: function(config) {
	            var format = config['number-format'] || '-';
	            var div = Number(config['number-divisor'] || 0);
	            var append = (config['number-append'] || '').replace(/ /g, '\u00A0');
	            var prepend = (config['number-prepend'] || '').replace(/ /g, '\u00A0');
	            return function(val, full, round) {
	                if (isNaN(val)) { return val; }
	                var _fmt = format;
	                if (div !== 0 && _fmt === '-') { _fmt = 'n1'; }
	                if (div !== 0) { val = Number(val) / Math.pow(10, div); }
	                if (_fmt.substr(0, 1) === 's') {
	                    // significant figures
	                    var sig = +_fmt.substr(1);
	                    _fmt = 'n' + Math.max(0, signDigitsDecimalPlaces(val, sig));
	                }
	                if (round) { _fmt = 'n0'; }
	                if (_fmt === '-') {
	                    // guess number format based on single number
	                    _fmt = equalish(val, Math.round(val))
	                        ? 'n0'
	                        : equalish(val, Math.round(val * 10) * 0.1)
	                        ? 'n1'
	                        : equalish(val, Math.round(val * 100) * 0.01)
	                        ? 'n2'
	                        : equalish(val, Math.round(val * 1000) * 0.001)
	                        ? 'n3'
	                        : equalish(val, Math.round(val * 10000) * 0.0001)
	                        ? 'n4'
	                        : equalish(val, Math.round(val * 100000) * 0.00001)
	                        ? 'n5'
	                        : 'n6';
	                }
	                val = Globalize.format(val, _fmt !== '-' ? _fmt : null);
	                return full ? prepend + val + append : val;
	            };
	        },

	        isValid: function(val) {
	            return (
	                val === '' || naStrings[String(val).toLowerCase()] || underscore.isNumber(type.parse(val))
	            );
	        },

	        ambiguousFormats: function() {
	            var candidates = [];
	            underscore.each(matches, function(cnt, fmt) {
	                if (cnt === bestMatch[1]) {
	                    candidates.push([fmt, formatLabels[fmt]]); // key, label
	                }
	            });
	            return candidates;
	        },

	        format: function(fmt) {
	            if (arguments.length) {
	                format = fmt;
	                return type;
	            }
	            return format;
	        }
	    };
	    return type;
	}

	/* globals Globalize */

	var begin = /^ */.source;
	var end = /[*']* *$/.source;
	var s0 = /[ \-/.]?/.source; // optional separator
	var s1 = /[ \-/.]/.source; // mandatory separator
	var s2 = /[ \-/.;]/.source; // mandatory separator
	var s3 = /[ \-|T]/.source; // mandatory separator
	var rx = {
	    YY: { parse: /['’‘]?(\d{2})/ },
	    YYYY: { test: /([12]\d{3})/, parse: /(\d{4})/ },
	    YYYY2: { test: /(?:1[7-9]|20)\d{2}/, parse: /(\d{4})/ },
	    H: { parse: /h([12])/ },
	    Q: { parse: /q([1234])/ },
	    W: { parse: /w([0-5]?[0-9])/ },
	    Mm: { test: /m?(0?[1-9]|1[0-2])/, parse: /m?(0?[1-9]|1[0-2])/ },
	    MM: { test: /(0?[1-9]|1[0-2])/, parse: /(0?[1-9]|1[0-2])/ },
	    DD: { parse: /(0?[1-9]|[1-2][0-9]|3[01])/ },
	    DOW: { parse: /([0-7])/ },
	    HHMM: { parse: /(0?\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))? *(am|pm)?/ }
	};

	var MONTHS = {
	    // feel free to add more localized month names
	    0: [
	        'jan',
	        'january',
	        'januar',
	        'jänner',
	        'jän',
	        'janv',
	        'janvier',
	        'ene',
	        'enero',
	        'gen',
	        'gennaio',
	        'janeiro'
	    ],
	    1: [
	        'feb',
	        'february',
	        'febr',
	        'februar',
	        'fév',
	        'févr',
	        'février',
	        'febrero',
	        'febbraio',
	        'fev',
	        'fevereiro'
	    ],
	    2: ['mar', 'mär', 'march', 'mrz', 'märz', 'mars', 'mars', 'marzo', 'marzo', 'março'],
	    3: ['apr', 'april', 'apr', 'april', 'avr', 'avril', 'abr', 'abril', 'aprile'],
	    4: ['may', 'mai', 'mayo', 'mag', 'maggio', 'maio', 'maj'],
	    5: ['jun', 'june', 'juni', 'juin', 'junio', 'giu', 'giugno', 'junho'],
	    6: ['jul', 'july', 'juli', 'juil', 'juillet', 'julio', 'lug', 'luglio', 'julho'],
	    7: ['aug', 'august', 'août', 'ago', 'agosto'],
	    8: ['sep', 'september', 'sept', 'septembre', 'septiembre', 'set', 'settembre', 'setembro'],
	    9: [
	        'oct',
	        'october',
	        'okt',
	        'oktober',
	        'octobre',
	        'octubre',
	        'ott',
	        'ottobre',
	        'out',
	        'outubro'
	    ],
	    10: ['nov', 'november', 'november', 'novembre', 'noviembre', 'novembre', 'novembro'],
	    11: [
	        'dec',
	        'december',
	        'dez',
	        'des',
	        'dezember',
	        'déc',
	        'décembre',
	        'dic',
	        'diciembre',
	        'dicembre',
	        'desember',
	        'dezembro'
	    ]
	};
	var shortMonthKey = {};

	underscore.each(MONTHS, function(abbr, m) {
	    underscore.each(abbr, function(a) {
	        shortMonthKey[a] = m;
	    });
	});

	rx.MMM = { parse: new RegExp('(' + underscore.flatten(underscore.values(MONTHS)).join('|') + ')') };

	underscore.each(rx, function(r) {
	    r.parse = r.parse.source;
	    if (underscore.isRegExp(r.test)) { r.test = r.test.source; }
	    else { r.test = r.parse; }
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
	        test: reg(rx.YYYY.test, s0, rx.Mm.test),
	        parse: reg(rx.YYYY.parse, s0, rx.Mm.parse),
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
	        parse: reg(
	            rx.DD.parse,
	            '([\\-\\.\\/ ?])',
	            rx.MM.parse,
	            '\\2',
	            rx.YYYY.parse,
	            s3,
	            rx.HHMM.parse
	        ),
	        precision: 'day-minutes'
	    },
	    'YYYY-MM-DD HH:MM': {
	        test: reg(rx.YYYY.test, '([\\-\\.\\/ ?])', rx.MM.test, '\\2', rx.DD.test, s3, rx.HHMM.test),
	        parse: reg(
	            rx.YYYY.parse,
	            '([\\-\\.\\/ ?])',
	            rx.MM.parse,
	            '\\2',
	            rx.DD.parse,
	            s3,
	            rx.HHMM.parse
	        ),
	        precision: 'day-minutes'
	    },
	    ISO8601: {
	        test: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
	        parse: function(str) {
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
	    if (underscore.isRegExp(fmt.test)) {
	        return fmt.test.test(str);
	    } else {
	        return fmt.test(str, key);
	    }
	}

	function parse(str, key) {
	    var fmt = knownFormats[key];
	    if (underscore.isRegExp(fmt.parse)) {
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
	    t.setDate(t.getDate() - ((d + 6) % 7) + 3);
	    var isoYear = t.getUTCFullYear();
	    var w = Math.floor((t.getTime() - new Date(isoYear, 0, 1, -6)) / 864e5);
	    return [isoYear, 1 + Math.floor(w / 7), d > 0 ? d : 7];
	}

	function hour(hr, amPm) {
	    if (hr !== 12) { return hr + (amPm === 'pm' ? 12 : 0); }
	    return amPm === 'am' ? 0 : 12;
	}

	function date(sample) {
	    var format;
	    var errors = 0;
	    var matches = {};
	    var bestMatch = ['', 0];

	    sample = sample || [];

	    underscore.each(knownFormats, function(format, key) {
	        underscore.each(sample, function(n) {
	            if (matches[key] === undefined) { matches[key] = 0; }
	            if (test(n, key)) {
	                matches[key] += 1;
	                if (matches[key] > bestMatch[1]) {
	                    bestMatch[0] = key;
	                    bestMatch[1] = matches[key];
	                }
	            }
	        });
	    });
	    format = bestMatch[0];

	    // public interface
	    var type = {
	        parse: function(raw) {
	            if (underscore.isDate(raw) || underscore.isUndefined(raw)) { return raw; }
	            if (!format || !underscore.isString(raw)) {
	                errors++;
	                return raw;
	            }

	            var m = parse(raw.toLowerCase(), format);

	            if (!m) {
	                errors++;
	                return raw;
	            } else {
	                // increment errors anyway if string doesn't match strict format
	                if (!test(raw, format)) { errors++; }
	            }

	            function guessTwoDigitYear(yr) {
	                yr = +yr;
	                if (yr < 20) { return 2000 + yr; }
	                else { return 1900 + yr; }
	            }

	            var curYear = new Date().getFullYear();

	            switch (format) {
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
	                case 'MMM-DD-YYYY':
	                    return new Date(m[3], shortMonthKey[m[1]], m[2]);

	                case 'YYYY-MM-DD HH:MM':
	                    return new Date(
	                        +m[1],
	                        m[3] - 1,
	                        +m[4],
	                        hour(+m[5], m[8]),
	                        +m[6] || 0,
	                        +m[7] || 0
	                    );
	                case 'DD.MM.YYYY HH:MM':
	                    return new Date(
	                        +m[4],
	                        m[3] - 1,
	                        +m[1],
	                        hour(+m[5], m[8]),
	                        +m[6] || 0,
	                        +m[7] || 0
	                    );
	                case 'MM/DD/YYYY HH:MM':
	                    return new Date(
	                        +m[4],
	                        m[1] - 1,
	                        +m[3],
	                        hour(+m[5], m[8]),
	                        +m[6] || 0,
	                        +m[7] || 0
	                    );

	                case 'ISO8601':
	                    return new Date(m.toUpperCase());

	                default:
	                    console.warn('unknown format', format);
	            }
	            errors++;
	            return raw;
	        },
	        toNum: function(d) {
	            return d.getTime();
	        },
	        fromNum: function(i) {
	            return new Date(i);
	        },
	        errors: function() {
	            return errors;
	        },
	        name: function() {
	            return 'date';
	        },

	        format: function(fmt) {
	            if (arguments.length) {
	                format = fmt;
	                return type;
	            }
	            return format;
	        },

	        precision: function() {
	            return knownFormats[format].precision;
	        },

	        // returns a function for formatting dates
	        formatter: function() {
	            if (!format) { return underscore.identity; }
	            var monthPattern = Globalize.culture().calendar.patterns.M.replace('MMMM', 'MMM');
	            switch (knownFormats[format].precision) {
	                case 'year':
	                    return function(d) {
	                        return !underscore.isDate(d) ? d : d.getFullYear();
	                    };
	                case 'half':
	                    return function(d) {
	                        return !underscore.isDate(d) ? d : d.getFullYear() + ' H' + (d.getMonth() / 6 + 1);
	                    };
	                case 'quarter':
	                    return function(d) {
	                        return !underscore.isDate(d) ? d : d.getFullYear() + ' Q' + (d.getMonth() / 3 + 1);
	                    };
	                case 'month':
	                    return function(d) {
	                        return !underscore.isDate(d) ? d : Globalize.format(d, 'MMM yy');
	                    };
	                case 'week':
	                    return function(d) {
	                        return !underscore.isDate(d)
	                            ? d
	                            : dateToIsoWeek(d)
	                                  .slice(0, 2)
	                                  .join(' W');
	                    };
	                case 'day':
	                    return function(d, verbose) {
	                        return !underscore.isDate(d) ? d : Globalize.format(d, verbose ? 'D' : 'd');
	                    };
	                case 'day-minutes':
	                    return function(d) {
	                        return !underscore.isDate(d)
	                            ? d
	                            : Globalize.format(d, monthPattern).replace(' ', '&nbsp;') +
	                                  ' - ' +
	                                  Globalize.format(d, 't').replace(' ', '&nbsp;');
	                    };
	                case 'day-seconds':
	                    return function(d) {
	                        return !underscore.isDate(d) ? d : Globalize.format(d, 'T').replace(' ', '&nbsp;');
	                    };
	            }
	        },

	        isValid: function(val) {
	            return underscore.isDate(type.parse(val));
	        },

	        ambiguousFormats: function() {
	            var candidates = [];
	            underscore.each(matches, function(cnt, fmt) {
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
	function column(name, rows, type) {
	    function notEmpty(d) {
	        return d !== null && d !== undefined && d !== '';
	    }

	    function guessType(sample) {
	        if (underscore.every(rows, underscore.isNumber)) { return columnTypes.number(); }
	        if (underscore.every(rows, underscore.isDate)) { return columnTypes.date(); }
	        // guessing column type by counting parsing errors
	        // for every known type
	        var types = [columnTypes.date(sample), columnTypes.number(sample), columnTypes.text()];
	        var type;
	        var tolerance = 0.1 * rows.filter(notEmpty).length; // allowing 10% mis-parsed values

	        underscore.each(rows, function(val) {
	            underscore.each(types, function(t) {
	                t.parse(val);
	            });
	        });
	        underscore.every(types, function(t) {
	            if (t.errors() < tolerance) { type = t; }
	            return !type;
	        });
	        if (underscore.isUndefined(type)) { type = types[2]; } // default to text;
	        return type;
	    }

	    // we pick random 200 non-empty values for column type testing
	    var sample = underscore.shuffle(underscore.range(rows.length))
	        .filter(function(i) {
	            return notEmpty(rows[i]);
	        })
	        .slice(0, 200)
	        .map(function(i) {
	            return rows[i];
	        });

	    type = type ? columnTypes[type](sample) : guessType(sample);

	    var range;
	    var total;
	    var origRows = rows.slice(0);
	    var title;

	    // public interface
	    var column = {
	        // column name (used for reference in chart metadata)
	        name: function() {
	            if (arguments.length) {
	                name = arguments[0];
	                return column;
	            }
	            return purifyHTML(name);
	        },

	        // column title (used for presentation)
	        title: function() {
	            if (arguments.length) {
	                title = arguments[0];
	                return column;
	            }
	            return purifyHTML(title || name);
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
	        val: function(i, unfiltered) {
	            if (!arguments.length) { return undefined; }
	            var r = unfiltered ? origRows : rows;
	            if (i < 0) { i += r.length; }
	            return type.parse(purifyHTML(r[i]));
	        },

	        /*
	         * returns an array of parsed values
	         */
	        values: function(unfiltered) {
	            var r = unfiltered ? origRows : rows;
	            r = underscore.map(r, function(d) {
	                return purifyHTML(d);
	            });
	            return underscore.map(r, type.parse);
	        },

	        /**
	         * apply function to each value
	         */
	        each: function(f) {
	            for (var i = 0; i < rows.length; i++) {
	                f(column.val(i), i);
	            }
	        },

	        // access to raw values
	        raw: function(i, val) {
	            if (!arguments.length) { return rows; }
	            if (arguments.length === 2) {
	                rows[i] = val;
	                return column;
	            }
	            return purifyHTML(rows[i]);
	        },

	        /**
	         * if called with no arguments, this returns the column type name
	         * if called with true as argument, this returns the column type (as object)
	         * if called with a string as argument, this sets a new column type
	         */
	        type: function(o) {
	            if (o === true) { return type; }
	            if (underscore.isString(o)) {
	                if (columnTypes[o]) {
	                    type = columnTypes[o](sample);
	                    return column;
	                } else {
	                    throw new Error('unknown column type: ' + o);
	                }
	            }
	            return type.name();
	        },

	        // [min,max] range
	        range: function() {
	            if (!type.toNum) { return false; }
	            if (!range) {
	                range = [Number.MAX_VALUE, -Number.MAX_VALUE];
	                column.each(function(v) {
	                    v = type.toNum(v);
	                    if (!underscore.isNumber(v) || underscore.isNaN(v)) { return; }
	                    if (v < range[0]) { range[0] = v; }
	                    if (v > range[1]) { range[1] = v; }
	                });
	                range[0] = type.fromNum(range[0]);
	                range[1] = type.fromNum(range[1]);
	            }
	            return range;
	        },
	        // sum of values
	        total: function() {
	            if (!type.toNum) { return false; }
	            if (!total) {
	                total = 0;
	                column.each(function(v) {
	                    total += type.toNum(v);
	                });
	                total = type.fromNum(total);
	            }
	            return total;
	        },
	        // remove rows from column, keep those whose index
	        // is within @r
	        filterRows: function(r) {
	            rows = [];
	            if (arguments.length) {
	                underscore.each(r, function(i) {
	                    rows.push(origRows[i]);
	                });
	            } else {
	                rows = origRows.slice(0);
	            }
	            column.length = rows.length;
	            // invalidate range and total
	            range = total = false;
	            return column;
	        },

	        toString: function() {
	            return name + ' (' + type.name() + ')';
	        },

	        indexOf: function(val) {
	            return underscore.find(underscore.range(rows.length), function(i) {
	                return column.val(i) === val;
	            });
	        },

	        limitRows: function(numRows) {
	            if (origRows.length > numRows) {
	                origRows.length = numRows;
	                rows.length = numRows;
	                column.length = numRows;
	            }
	        }
	    };
	    return column;
	}

	/*
	 * dataset source for delimited files (CSV, TSV, ...)
	 */

	function delimited(opts) {
	    function loadAndParseCsv() {
	        if (opts.url) ; else if (opts.csv) {
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
	        parse: function() {
	            return new DelimitedParser(opts).parse(opts.csv);
	        }
	    };
	}

	var DelimitedParser = function DelimitedParser(opts) {
	    opts = Object.assign(
	        {
	            delimiter: 'auto',
	            quoteChar: '"',
	            skipRows: 0,
	            emptyValue: null,
	            transpose: false,
	            firstRowIsHeader: true
	        },
	        opts
	    );

	    this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
	    this.opts = opts;
	};

	DelimitedParser.prototype.parse = function parse (data) {
	    this.__rawData = data;
	    var opts = this.opts;

	    if (opts.delimiter === 'auto') {
	        opts.delimiter = this.guessDelimiter(data, opts.skipRows);
	        this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
	    }
	    var closure = opts.delimiter !== '|' ? '|' : '#';
	    var arrData;

	    data = closure + '\n' + data.replace(/\s+$/g, '') + closure;

	    function parseCSV(delimiterPattern, strData, strDelimiter) {
	        // implementation and regex borrowed from:
	        // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

	        // Check to see if the delimiter is defined. If not,
	        // then default to comma.
	        strDelimiter = strDelimiter || ',';

	        // Create an array to hold our data. Give the array
	        // a default empty first row.
	        var arrData = [[]];

	        // Create an array to hold our individual pattern
	        // matching groups.
	        var arrMatches = null;
	        var strMatchedValue;

	        // Keep looping over the regular expression matches
	        // until we can no longer find a match.
	        while ((arrMatches = delimiterPattern.exec(strData))) {
	            // Get the delimiter that was found.
	            var strMatchedDelimiter = arrMatches[1];

	            // Check to see if the given delimiter has a length
	            // (is not the start of string) and if it matches
	            // field delimiter. If id does not, then we know
	            // that this delimiter is a row delimiter.
	            if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
	                // Since we have reached a new row of data,
	                // add an empty row to our data array.
	                arrData.push([]);
	            }

	            // Now that we have our delimiter out of the way,
	            // let's check to see which kind of value we
	            // captured (quoted or unquoted).
	            if (arrMatches[2]) {
	                // We found a quoted value. When we capture
	                // this value, unescape any double quotes.
	                strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
	            } else {
	                // We found a non-quoted value.
	                strMatchedValue = arrMatches[3];
	            }

	            // Now that we have our value string, let's add
	            // it to the data array.
	            arrData[arrData.length - 1].push(strMatchedValue);
	        }

	        // remove closure
	        if (arrData[0][0].substr(0, 1) === closure) {
	            arrData[0][0] = arrData[0][0].substr(1);
	        }
	        var p = arrData.length - 1;
	        var q = arrData[p].length - 1;
	        var r = arrData[p][q].length - 1;
	        if (arrData[p][q].substr(r) === closure) {
	            arrData[p][q] = arrData[p][q].substr(0, r);
	        }

	        // Return the parsed data.
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
	        var rowIndex = opts.skipRows;

	        // compute series
	        var srcColumns = [];
	        if (opts.firstRowIsHeader) {
	            srcColumns = arrData[rowIndex];
	            rowIndex++;
	        }

	        // check that columns names are unique and not empty

	        for (var c = 0; c < columnCount; c++) {
	            var col = underscore.isString(srcColumns[c]) ? srcColumns[c].replace(/^\s+|\s+$/g, '') : '';
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

	        underscore.range(rowIndex, rowCount).forEach(function (row) {
	            columns.forEach(function (c, i) {
	                c.data.push(arrData[row][i] !== '' ? arrData[row][i] : opts.emptyValue);
	            });
	        });

	        columns = columns.map(function (c) { return column(c.name, c.data); });
	        return dataset(columns);
	    } // end makeDataset

	    arrData = parseCSV(this.__delimiterPatterns, data, opts.delimiter);
	    if (opts.transpose) {
	        arrData = transpose(arrData);
	    }
	    return makeDataset(arrData);
	}; // end parse

	DelimitedParser.prototype.guessDelimiter = function guessDelimiter (strData) {
	    // find delimiter which occurs most often
	    var maxMatchCount = 0;
	    var k = -1;
	    var me = this;
	    var delimiters = ['\t', ';', '|', ','];
	    delimiters.forEach(function (delimiter, i) {
	        var regex = getDelimiterPatterns(delimiter, me.quoteChar);
	        var c = strData.match(regex).length;
	        if (delimiter === '\t') { c *= 1.15; } // give tab delimiters more weight
	        if (c > maxMatchCount) {
	            maxMatchCount = c;
	            k = i;
	        }
	    });
	    return delimiters[k];
	};

	function getDelimiterPatterns(delimiter, quoteChar) {
	    return new RegExp(
	        // Delimiters.
	        '(\\' +
	            delimiter +
	            '|\\r?\\n|\\r|^)' +
	            // Quoted fields.
	            '(?:' +
	            quoteChar +
	            '([^' +
	            quoteChar +
	            ']*(?:' +
	            quoteChar +
	            '"[^' +
	            quoteChar +
	            ']*)*)' +
	            quoteChar +
	            '|' +
	            // Standard fields.
	            '([^' +
	            quoteChar +
	            '\\' +
	            delimiter +
	            '\\r\\n]*))',
	        'gi'
	    );
	}

	/* globals fetch */

	/*
	 * dataset source for JSON data
	 */
	function json(opts) {
	    function loadAndParseJSON() {
	        if (opts.url) {
	            return fetch(opts.url)
	                .then(function (res) { return res.text(); })
	                .then(function (raw) {
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
	        parse: function() {
	            return JSON.parse(opts.csv);
	        }
	    };
	}

	function reorderColumns(chart, dataset) {
	    var order = chart.getMetadata('data.column-order', []);
	    if (order.length && order.length === dataset.numColumns()) {
	        dataset.columnOrder(order);
	    }
	    return dataset;
	}

	function applyChanges(chart, dataset) {
	    var changes = chart.getMetadata('data.changes', []);
	    var transpose = chart.getMetadata('data.transpose', false);
	    // apply changes
	    changes.forEach(function (change) {
	        var row = 'row';
	        var column = 'column';
	        if (transpose) {
	            row = 'column';
	            column = 'row';
	        }

	        if (dataset.hasColumn(change[column])) {
	            if (change[row] === 0) {
	                dataset.column(change[column]).title(change.value);
	            } else {
	                dataset.column(change[column]).raw(change[row] - 1, change.value);
	            }
	        }
	    });

	    // overwrite column types
	    var columnFormats = chart.getMetadata('data.column-format', {});
	    underscore.each(columnFormats, function (columnFormat, key) {
	        if (columnFormat.type && dataset.hasColumn(key) && columnFormat.type !== 'auto') {
	            dataset.column(key).type(columnFormat.type);
	        }
	        if (columnFormat['input-format'] && dataset.hasColumn(key)) {
	            dataset
	                .column(key)
	                .type(true)
	                .format(columnFormat['input-format']);
	        }
	    });
	    return dataset;
	}

	function arrayMin(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  return min;
	}

	function arrayMax(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  return max;
	}

	function arraySum(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (value = +values[i]) { sum += value; } // Note: zero and null are equivalent.
	    }
	  }

	  else {
	    while (++i < n) {
	      if (value = +valueof(values[i], i, values)) { sum += value; }
	    }
	  }

	  return sum;
	}

	function number$1(x) {
	  return x === null ? NaN : +x;
	}

	function arrayMean(values, valueof) {
	  var n = values.length,
	      m = n,
	      i = -1,
	      value,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number$1(values[i]))) { sum += value; }
	      else { --m; }
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number$1(valueof(values[i], i, values)))) { sum += value; }
	      else { --m; }
	    }
	  }

	  if (m) { return sum / m; }
	}

	function ascending(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function quantile(values, p, valueof) {
	  if (valueof == null) { valueof = number$1; }
	  if (!(n = values.length)) { return; }
	  if ((p = +p) <= 0 || n < 2) { return +valueof(values[0], 0, values); }
	  if (p >= 1) { return +valueof(values[n - 1], n - 1, values); }
	  var n,
	      i = (n - 1) * p,
	      i0 = Math.floor(i),
	      value0 = +valueof(values[i0], i0, values),
	      value1 = +valueof(values[i0 + 1], i0 + 1, values);
	  return value0 + (value1 - value0) * (i - i0);
	}

	function arrayMedian(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      numbers = [];

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number$1(values[i]))) {
	        numbers.push(value);
	      }
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number$1(valueof(values[i], i, values)))) {
	        numbers.push(value);
	      }
	    }
	  }

	  return quantile(numbers.sort(ascending), 0.5);
	}

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

	function addComputedColumns(chart, dataset) {
	    var virtualColumns = chart.getMetadata('describe.computed-columns', {});
	    var data = dataset.list();
	    var columnNameToVar = {};
	    var columnAggregates = {};

	    dataset.eachColumn(function(col) {
	        if (col.isComputed) { return; }
	        columnNameToVar[col.name()] = columnNameToVariable(col.name());
	        if (col.type() === 'number') {
	            columnAggregates[col.name()] = {
	                min: arrayMin(col.values()),
	                max: arrayMax(col.values()),
	                sum: arraySum(col.values()),
	                mean: arrayMean(col.values()),
	                median: arrayMedian(col.values())
	            };
	        }
	    });

	    underscore.each(virtualColumns, addComputedColumn);

	    return dataset;

	    function addComputedColumn(formula, name) {
	        var datefmt = function (d) {
	            return (
	                d.getFullYear() +
	                '-' +
	                leftPad(1 + d.getMonth(), 2, 0) +
	                '-' +
	                leftPad(1 + d.getDate(), 2, 0)
	            );
	        };
	        var values = data
	            .map(function (row, rowIndex) {
	                var context = [];
	                context.push('var __row = ' + rowIndex + ';');

	                Object.keys(row).forEach(function (key) {
	                    var val = row[key];

	                    if (!columnNameToVar[key]) { return; }
	                    context.push('var ' + columnNameToVar[key] + ' = ' + JSON.stringify(val) + ';');
	                    if (dataset.column(key).type() === 'number') {
	                        context.push(
	                            'var ' +
	                                columnNameToVar[key] +
	                                '__sum = ' +
	                                columnAggregates[key].sum +
	                                ';'
	                        );
	                        context.push(
	                            'var ' +
	                                columnNameToVar[key] +
	                                '__min = ' +
	                                columnAggregates[key].min +
	                                ';'
	                        );
	                        context.push(
	                            'var ' +
	                                columnNameToVar[key] +
	                                '__max = ' +
	                                columnAggregates[key].max +
	                                ';'
	                        );
	                        context.push(
	                            'var ' +
	                                columnNameToVar[key] +
	                                '__mean = ' +
	                                columnAggregates[key].mean +
	                                ';'
	                        );
	                        context.push(
	                            'var ' +
	                                columnNameToVar[key] +
	                                '__median = ' +
	                                columnAggregates[key].median +
	                                ';'
	                        );
	                    }
	                });

	                context.push('var max = Math.max, min = Math.min;');
	                // console.log(context.join('\n'));
	                return function() {
	                    try {
	                        return eval(this.context.join('\n') + '\n' + formula); // eslint-disable-line
	                    } catch (e) {
	                        console.warn(e);
	                        return 'n/a';
	                    }
	                }.call({ context: context });
	            })
	            .map(function(v) {
	                if (underscore.isBoolean(v)) { return v ? 'yes' : 'no'; }
	                if (underscore.isDate(v)) { return datefmt(v); }
	                if (underscore.isNumber(v)) { return '' + v; }
	                return String(v);
	            });
	        var virtualColumn = column(name, values);
	        virtualColumn.isComputed = true;
	        dataset.add(virtualColumn);
	    }

	    function leftPad(s, l, pad) {
	        s = String(s);
	        while (s.length < l) { s = String(pad) + s; }
	        return s;
	    }
	}

	/**
	 * Download and parse a remote JSON document
	 *
	 * @param {string} url
	 * @param {string} method - HTTP method, either GET, POST or PUT
	 * @param {string|undefined} credentials - set to "include" if cookies should be passed along CORS requests
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 */
	function fetchJSON(url, method, credentials, body, callback) {
	    var opts = {
	        method: method,
	        body: body,
	        mode: 'cors',
	        credentials: credentials
	    };

	    return window
	        .fetch(url, opts)
	        .then(function (res) {
	            if (!res.ok) { throw new Error(res.statusText); }
	            return res.text();
	        })
	        .then(function (text) {
	            try {
	                return JSON.parse(text);
	            } catch (Error) {
	                // could not parse json, so just return text
	                console.warn('malformed json input', text);
	                return text;
	            }
	        })
	        .then(function (res) {
	            if (callback) { callback(res); }
	            return res;
	        })
	        .catch(function (err) {
	            console.error(err);
	        });
	}

	/**
	 * Download and parse a remote JSON endpoint via PUT. credentials
	 * are included automatically
	 *
	 * @param {string} url
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 */
	function putJSON(url, body, callback) {
	    return fetchJSON(url, 'PUT', 'include', body, callback);
	}

	/**
	 * injects a `<script>` element to the page to load a new JS script
	 *
	 * @param {string} src
	 * @param {function} callback
	 */
	function loadScript(src, callback) {
	    var script = document.createElement('script');
	    script.src = src;
	    script.onload = function () {
	        if (callback) { callback(); }
	    };
	    document.body.appendChild(script);
	}

	var storeChanges = underscore.debounce(function (chart, callback) {
	    var state = chart.serialize();
	    putJSON(("/api/2/charts/" + (state.id)), JSON.stringify(state), function () {
	        if (callback) { callback(); }
	    });
	}, 1000);

	var storeData = underscore.debounce(function (chart, callback) {
	    var data = chart.getMetadata('data.json') ? JSON.stringify(chart.dataset()) : chart.rawData();
	    // const data = chart.rawData();
	    putJSON(("/api/2/charts/" + (chart.get('id')) + "/data"), data, function () {
	        if (callback) { callback(); }
	    });
	}, 1000);

	var Chart = (function (Store) {
	    function Chart () {
	        Store.apply(this, arguments);
	    }

	    if ( Store ) Chart.__proto__ = Store;
	    Chart.prototype = Object.create( Store && Store.prototype );
	    Chart.prototype.constructor = Chart;

	    Chart.prototype.load = function load (csv, externalData) {
	        var this$1 = this;

	        var dsopts = {
	            firstRowIsHeader: this.getMetadata('data.horizontal-header', true),
	            transpose: this.getMetadata('data.transpose', false)
	        };

	        if (csv && !externalData) { dsopts.csv = csv; }
	        else { dsopts.url = externalData || 'data.csv'; }

	        if (dsopts.csv) { this._rawData = dsopts.csv; }

	        var datasource = this.getMetadata('data.json', false) ? json(dsopts) : delimited(dsopts);

	        return datasource
	            .dataset()
	            .then(function (ds) {
	                this$1.dataset(ds);
	                // this.dataset(ds);
	                // dataset_change_callbacks.fire(chart, ds);
	                return ds;
	            })
	            .catch(function (e) {
	                console.error('could not fetch datasource', e);
	            });
	    };

	    // sets or returns the dataset
	    Chart.prototype.dataset = function dataset (ds) {
	        // set a new dataset, or reset the old one if ds===true
	        if (arguments.length) {
	            if (ds !== true) { this._dataset_cache = ds; }
	            var jsonData = typeof ds.list !== 'function';
	            this._dataset = jsonData
	                ? ds
	                : reorderColumns(
	                      this,
	                      applyChanges(
	                          this,
	                          addComputedColumns(this, ds === true ? this._dataset_cache : ds)
	                      )
	                  );
	            if (jsonData) { this.set({ dataset: ds }); }
	            return this._dataset;
	        }
	        // return current dataset
	        return this._dataset;
	    };

	    // sets or gets the theme
	    Chart.prototype.theme = function theme (theme$1) {
	        if (arguments.length) {
	            // set new theme
	            this.set({ theme: theme$1 });
	            return this;
	        }
	        return this.get().theme;
	    };

	    // sets or gets the visualization
	    Chart.prototype.vis = function vis (vis$1) {
	        if (arguments.length) {
	            // set new visualization
	            this.set({ vis: vis$1 });
	            return this;
	        }
	        return this.get().vis;
	    };

	    Chart.prototype.locale = function locale (locale$1, callback) {
	        if (arguments.length) {
	            this._locale = locale$1 = locale$1.replace('_', '-');
	            if (window.Globalize) {
	                loadGlobalizeLocale(locale$1, callback);
	            }
	            // todo: what about momentjs & numeraljs?
	        }
	        return this._locale;
	    };

	    Chart.prototype.getMetadata = function getMetadata (key, _default) {
	        if ( key === void 0 ) key = null;
	        if ( _default === void 0 ) _default = null;

	        var ref = this.get();
	        var metadata = ref.metadata;
	        if (!key) { return metadata; }
	        // get metadata
	        var keys = key.split('.');
	        var pt = metadata;

	        underscore.some(keys, function (key) {
	            if (underscore.isUndefined(pt) || underscore.isNull(pt)) { return true; } // break out of the loop
	            pt = pt[key];
	            return false;
	        });
	        return underscore.isUndefined(pt) || underscore.isNull(pt) ? _default : pt;
	    };

	    Chart.prototype.setMetadata = function setMetadata (key, value) {
	        var keys = key.split('.');
	        var lastKey = keys.pop();
	        var ref = this.get();
	        var metadata = ref.metadata;
	        var pt = metadata;

	        // resolve property until the parent dict
	        keys.forEach(function (key) {
	            if (underscore.isUndefined(pt[key]) || underscore.isNull(pt[key])) {
	                pt[key] = {};
	            }
	            pt = pt[key];
	        });

	        // check if new value is set
	        if (!deepEqual(pt[lastKey], value)) {
	            pt[lastKey] = value;
	            this.set({ metadata: metadata });
	        }
	        return this;
	    };

	    // stores the state of this chart to server
	    Chart.prototype.store = function store (callback) {
	        storeChanges(this, callback);
	    };

	    Chart.prototype.storeData = function storeData$1 (callback) {
	        storeData(this, callback);
	    };

	    Chart.prototype.serialize = function serialize () {
	        var state = this.get();
	        var keep = [
	            'id',
	            'title',
	            'theme',
	            'createdAt',
	            'lastModifiedAt',
	            'type',
	            'metadata',
	            'authorId',
	            'showInGallery',
	            'language',
	            'guestSession',
	            'lastEditStep',
	            'publishedAt',
	            'publicUrl',
	            'publicVersion',
	            'organizationId',
	            'forkedFrom',
	            'externalData',
	            'forkable',
	            'isFork',
	            'inFolder',
	            'author'
	        ];
	        var copy = {};
	        keep.forEach(function (k) {
	            copy[k] = state[k];
	        });
	        return copy;
	    };

	    Chart.prototype.passiveMode = function passiveMode () {
	        var this$1 = this;

	        this.set({ passiveMode: true });
	        setTimeout(function () { return this$1.set({ passiveMode: false }); }, 100);
	    };

	    Chart.prototype.isPassive = function isPassive () {
	        return this.get().passiveMode;
	    };

	    Chart.prototype.rawData = function rawData () {
	        return this._rawData;
	    };

	    return Chart;
	}(Store));

	Chart.prototype.observeDeep = observeDeep;

	function deepEqual(a, b) {
	    return JSON.stringify(a) === JSON.stringify(b);
	}

	function loadGlobalizeLocale(locale, callback) {
	    if (window.Globalize.cultures.hasOwnProperty(locale)) {
	        window.Globalize.culture(locale);
	        if (typeof callback === 'function') { callback(); }
	    } else {
	        loadScript(("/static/vendor/globalize/cultures/globalize.culture." + locale + ".js"), function () {
	            window.Globalize.culture(locale);
	            if (typeof callback === 'function') { callback(); }
	        });
	    }
	}

	var data$1 = {};

	var main = { App: ChartEditor, Chart: Chart, data: data$1 };

	return main;

}));
//# sourceMappingURL=editor.js.map
