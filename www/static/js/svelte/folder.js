(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/folder', factory) :
	(global = global || self, global.folder = factory());
}(this, function () { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) { tar[k] = src[k]; }
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

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) { iterations[i].d(detach); }
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

	function setData(text, data) {
		text.data = '' + data;
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
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
	 * Download and parse a remote JSON document
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
	 * Download and parse a JSON document via GET
	 *
	 * @param {string} url
	 * @param {string|undefined} credentials - optional, set to undefined to disable credentials
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * import { getJSON } from '@datawrapper/shared/fetch';
	 * // use it callback style
	 * getJSON('http://api.example.org', 'include', function(data) {
	 *     console.log(data);
	 * });
	 * // or promise-style
	 * getJSON('http://api.example.org')
	 *   .then(data => {
	 *      console.log(data);
	 *   });
	 */
	function getJSON(url, credentials, callback) {
	    if (arguments.length === 2) {
	        callback = credentials;
	        credentials = 'include';
	    }

	    return fetchJSON(url, 'GET', credentials, null, callback);
	}

	function cubicOut(t) {
	  var f = t - 1.0;
	  return f * f * f + 1.0
	}

	function fade ( node, ref ) {
		var delay = ref.delay; if ( delay === void 0 ) { delay = 0; }
		var duration = ref.duration; if ( duration === void 0 ) { duration = 400; }

		var o = +getComputedStyle( node ).opacity;

		return {
			delay: delay,
			duration: duration,
			css: function (t) { return ("opacity: " + (t * o)); }
		};
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

	/* folder/App.html generated by Svelte v2.16.1 */



	var find = function (folders, position, returnParent, parent) {
		if (returnParent) {
			if (position.type == "root") { return null; }
			if (["user", "team"].indexOf(position.type) > -1) { return { type: "root", id: null }; }
		}

		for (var i=0;i<folders.length;i++) {
			if ((!folders[i].type || folders[i].type == position.type)
				&& folders[i].id == position.id) { return returnParent ? parent : folders[i]; }
			var child = find(folders[i].folders, position, returnParent, folders[i]);
			if (child) { return child; }
		}
	};

	function isRoot(ref) {
		var position = ref.position;

		return position.type == "root";
	}
	function folderList(ref) {
		var position = ref.position;
		var folders = ref.folders;

		if (!folders || !folders.length) { return []; }
		return position.type == "root" ? folders : find(folders, position).folders;
	}
	function chartList(ref) {
		var position = ref.position;
		var folders = ref.folders;

		if (!folders || !folders.length) { return []; }
		return position.type == "root" ? [] : find(folders, position).charts;
	}
	function data() {
		return {
			position: {
				type: "root", // root | user | team | folder
				id: null
			},
			folderName: ""
		}
	}
	function icon(type) {
		return {
			"user": "fa fa-user",
			"team": "fa fa-users"
		}[type] || "im im-folder";
	}
	function label(element) {
		if (element.type == "root") { return "All"; }
		if (element.type == "user") { return "My Charts"; }
		else { return element.name; }
	}
	var methods = {
		add: function add() {

		},
		up: function up() {
			var ref = this.get();
			var position = ref.position;
			var folders = ref.folders;
			var creating = ref.creating;
			if (creating) { this.set({creating:false}); return; }
			var folder = find(folders, position, true);
			this.set({position: folder});
		},
		loadFolders: async function loadFolders() {
			var this$1 = this;

			this.set({loading: true});

			getJSON(((window.location.protocol) + "//" + (dw.backend.__api_domain) + "/v3/folders"), 'include', function (folders) {
				this$1.set({folders: folders, loading: false});

				var ref = this$1.get();
				var current = ref.current;
				this$1.set({position: find(folders, current )});
			});
		}
	};

	var file = "folder/App.html";

	function get_each1_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.element = list[i];
		return child_ctx;
	}

	function click_handler(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.set({ position: ctx.element });
	}

	function get_each0_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.element = list[i];
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.show) && create_if_block(component, ctx);

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
				if (ctx.show) {
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

	// (1:0) {#if show}
	function create_if_block(component, ctx) {
		var div, current_block_type_index, if_block;

		var if_block_creators = [
			create_if_block_1,
			create_if_block_2,
			create_else_block
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.loading) { return 0; }
			if (ctx.creating) { return 1; }
			return 2;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				div.className = "cont svelte-zl0k9i";
				addLoc(div, file, 1, 1, 12);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if_blocks[current_block_type_index].i(div, null);
			},

			p: function update(changed, ctx) {
				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					groupOutros();
					if_block.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block = if_blocks[current_block_type_index];
					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block.c();
					}
					if_block.i(div, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_blocks[current_block_type_index].d();
			}
		};
	}

	// (27:2) {:else}
	function create_else_block(component, ctx) {
		var div2, div0, i0, div0_style_value, text0, div1, text1_value = label(ctx.position), text1, text2, div3, text3, text4, text5, div4, button0, i1, text6, button1, i2, text7, current;

		function click_handler(event) {
			component.up();
		}

		var each0_value = ctx.folderList;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_1(component, get_each0_context(ctx, each0_value, i));
		}

		function outroBlock(i, detach, fn) {
			if (each0_blocks[i]) {
				each0_blocks[i].o(function () {
					if (detach) {
						each0_blocks[i].d(detach);
						each0_blocks[i] = null;
					}
					if (fn) { fn(); }
				});
			}
		}

		var each1_value = ctx.chartList;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block(component, get_each1_context(ctx, each1_value, i));
		}

		function outroBlock_1(i, detach, fn) {
			if (each1_blocks[i]) {
				each1_blocks[i].o(function () {
					if (detach) {
						each1_blocks[i].d(detach);
						each1_blocks[i] = null;
					}
					if (fn) { fn(); }
				});
			}
		}

		var if_block = (ctx.chartList.length == 0 && ctx.folderList.length == 0) && create_if_block_3();

		function click_handler_1(event) {
			component.set({creating: true});
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				i0 = createElement("i");
				text0 = createText("\n\n\t\t\t\t");
				div1 = createElement("div");
				text1 = createText(text1_value);
				text2 = createText("\n\t\t\t");
				div3 = createElement("div");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text3 = createText("\n\n\t\t\t\t");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text4 = createText("\n\n\t\t\t\t");
				if (if_block) { if_block.c(); }
				text5 = createText("\n\t\t\t");
				div4 = createElement("div");
				button0 = createElement("button");
				i1 = createElement("i");
				text6 = createText("\n\n\t\t\t\t");
				button1 = createElement("button");
				i2 = createElement("i");
				text7 = createText("\n\t\t\t\t\tMove Here");
				i0.className = "im im-angle-left svelte-zl0k9i";
				addLoc(i0, file, 29, 5, 904);
				addListener(div0, "click", click_handler);
				div0.className = "up svelte-zl0k9i";
				div0.style.cssText = div0_style_value = ctx.isRoot ? 'visibility: hidden' : '';
				addLoc(div0, file, 28, 4, 819);
				div1.className = "title svelte-zl0k9i";
				addLoc(div1, file, 32, 4, 953);
				div2.className = "header svelte-zl0k9i";
				addLoc(div2, file, 27, 3, 794);
				div3.className = "body svelte-zl0k9i";
				addLoc(div3, file, 36, 3, 1022);
				i1.className = "im im-folder-add";
				addLoc(i1, file, 64, 5, 1806);
				addListener(button0, "click", click_handler_1);
				button0.className = "btn";
				button0.disabled = ctx.isRoot;
				addLoc(button0, file, 63, 4, 1729);
				i2.className = "im im-check-mark-circle-o";
				addLoc(i2, file, 68, 5, 1914);
				button1.className = "btn btn-primary";
				button1.disabled = ctx.isRoot;
				addLoc(button1, file, 67, 4, 1858);
				div4.className = "footer svelte-zl0k9i";
				addLoc(div4, file, 62, 3, 1704);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div0, i0);
				append(div2, text0);
				append(div2, div1);
				append(div1, text1);
				insert(target, text2, anchor);
				insert(target, div3, anchor);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].i(div3, null);
				}

				append(div3, text3);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].i(div3, null);
				}

				append(div3, text4);
				if (if_block) { if_block.m(div3, null); }
				insert(target, text5, anchor);
				insert(target, div4, anchor);
				append(div4, button0);
				append(button0, i1);
				append(div4, text6);
				append(div4, button1);
				append(button1, i2);
				append(button1, text7);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((!current || changed.isRoot) && div0_style_value !== (div0_style_value = ctx.isRoot ? 'visibility: hidden' : '')) {
					div0.style.cssText = div0_style_value;
				}

				if ((!current || changed.position) && text1_value !== (text1_value = label(ctx.position))) {
					setData(text1, text1_value);
				}

				if (changed.folderList) {
					each0_value = ctx.folderList;

					for (var i = 0; i < each0_value.length; i += 1) {
						var child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_1(component, child_ctx);
							each0_blocks[i].c();
						}
						each0_blocks[i].i(div3, text3);
					}

					groupOutros();
					for (; i < each0_blocks.length; i += 1) { outroBlock(i, 1); }
				}

				if (changed.chartList) {
					each1_value = ctx.chartList;

					for (var i = 0; i < each1_value.length; i += 1) {
						var child_ctx$1 = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx$1);
						} else {
							each1_blocks[i] = create_each_block(component, child_ctx$1);
							each1_blocks[i].c();
						}
						each1_blocks[i].i(div3, text4);
					}

					groupOutros();
					for (; i < each1_blocks.length; i += 1) { outroBlock_1(i, 1); }
				}

				if (ctx.chartList.length == 0 && ctx.folderList.length == 0) {
					if (!if_block) {
						if_block = create_if_block_3();
						if_block.c();
						if_block.m(div3, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (!current || changed.isRoot) {
					button0.disabled = ctx.isRoot;
					button1.disabled = ctx.isRoot;
				}
			},

			i: function intro(target, anchor) {
				if (current) { return; }

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				removeListener(div0, "click", click_handler);
				if (detach) {
					detachNode(text2);
					detachNode(div3);
				}

				destroyEach(each0_blocks, detach);

				destroyEach(each1_blocks, detach);

				if (if_block) { if_block.d(); }
				if (detach) {
					detachNode(text5);
					detachNode(div4);
				}

				removeListener(button0, "click", click_handler_1);
			}
		};
	}

	// (8:20) 
	function create_if_block_2(component, ctx) {
		var div1, div0, i0, div0_style_value, text0, input, input_updating = false, text1, button, i1, text2, div3, div2, text3, text4_value = label(ctx.position), text4, text5, div3_intro, text6, div4, current;

		function click_handler(event) {
			component.up();
		}

		function input_input_handler() {
			input_updating = true;
			component.set({ folderName: input.value });
			input_updating = false;
		}

		function click_handler_1(event) {
			component.add();
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				i0 = createElement("i");
				text0 = createText("\n\n\t\t\t\t");
				input = createElement("input");
				text1 = createText("\n\n\t\t\t\t");
				button = createElement("button");
				i1 = createElement("i");
				text2 = createText("\n\t\t\t");
				div3 = createElement("div");
				div2 = createElement("div");
				text3 = createText("Create a new folder in ");
				text4 = createText(text4_value);
				text5 = createText(".");
				text6 = createText("\n\t\t\t");
				div4 = createElement("div");
				i0.className = "im im-angle-left svelte-zl0k9i";
				addLoc(i0, file, 10, 5, 353);
				addListener(div0, "click", click_handler);
				div0.className = "up svelte-zl0k9i";
				div0.style.cssText = div0_style_value = ctx.isRoot ? 'visibility: hidden' : '';
				addLoc(div0, file, 9, 4, 268);
				addListener(input, "input", input_input_handler);
				input.autofocus = true;
				input.placeholder = "Untitled folder";
				setAttribute(input, "type", "text");
				input.className = "svelte-zl0k9i";
				addLoc(input, file, 13, 4, 402);
				i1.className = "im im-plus-circle svelte-zl0k9i";
				addLoc(i1, file, 16, 5, 548);
				addListener(button, "click", click_handler_1);
				button.className = "btn btn-primary svelte-zl0k9i";
				addLoc(button, file, 15, 4, 493);
				div1.className = "header svelte-zl0k9i";
				addLoc(div1, file, 8, 3, 243);
				div2.className = "empty svelte-zl0k9i";
				addLoc(div2, file, 20, 4, 657);
				div3.className = "body svelte-zl0k9i";
				addLoc(div3, file, 19, 3, 609);
				div4.className = "footer svelte-zl0k9i";
				addLoc(div4, file, 24, 3, 750);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, i0);
				append(div1, text0);
				append(div1, input);

				input.value = ctx.folderName;

				append(div1, text1);
				append(div1, button);
				append(button, i1);
				insert(target, text2, anchor);
				insert(target, div3, anchor);
				append(div3, div2);
				append(div2, text3);
				append(div2, text4);
				append(div2, text5);
				insert(target, text6, anchor);
				insert(target, div4, anchor);
				current = true;
				input.focus();
			},

			p: function update(changed, ctx) {
				if ((changed.isRoot) && div0_style_value !== (div0_style_value = ctx.isRoot ? 'visibility: hidden' : '')) {
					div0.style.cssText = div0_style_value;
				}

				if (!input_updating && changed.folderName) { input.value = ctx.folderName; }
				if ((changed.position) && text4_value !== (text4_value = label(ctx.position))) {
					setData(text4, text4_value);
				}
			},

			i: function intro(target, anchor) {
				if (current) { return; }
				if (component.root._intro) {
					component.root._aftercreate.push(function () {
						div3_intro = wrapTransition(component, div3, fade, {duration:200}, true);
						div3_intro.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(div0, "click", click_handler);
				removeListener(input, "input", input_input_handler);
				removeListener(button, "click", click_handler_1);
				if (detach) {
					detachNode(text2);
					detachNode(div3);
					detachNode(text6);
					detachNode(div4);
				}
			}
		};
	}

	// (3:2) {#if loading}
	function create_if_block_1(component, ctx) {
		var div, i, text, current;

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text = createText("  \n\t\t\t\tLoading folders…");
				setStyle(i, "margin", "0px 6px 0px 10px");
				i.className = "fa fa-circle-o-notch fa-spin svelte-zl0k9i";
				addLoc(i, file, 4, 4, 103);
				div.className = "header svelte-zl0k9i";
				setStyle(div, "border-bottom", "none");
				addLoc(div, file, 3, 3, 50);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text);
				current = true;
			},

			p: noop,

			i: function intro(target, anchor) {
				if (current) { return; }

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (38:4) {#each folderList as element}
	function create_each_block_1(component, ctx) {
		var div1, i0, i0_class_value, text0, div0, text1_value = label(ctx.element), text1, text2, i1, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				i0 = createElement("i");
				text0 = createText("  \n\t\t\t\t\t\t");
				div0 = createElement("div");
				text1 = createText(text1_value);
				text2 = createText("\n\t\t\t\t\t\t");
				i1 = createElement("i");
				i0.className = i0_class_value = "" + icon(ctx.element.type) + " svelte-zl0k9i";
				addLoc(i0, file, 39, 6, 1182);
				div0.className = "svelte-zl0k9i";
				addLoc(div0, file, 40, 6, 1234);
				i1.className = "im im-angle-right svelte-zl0k9i";
				addLoc(i1, file, 43, 6, 1285);

				div1._svelte = { component: component, ctx: ctx };

				addListener(div1, "click", click_handler);
				div1.className = "li folder svelte-zl0k9i";
				addLoc(div1, file, 38, 5, 1080);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, i0);
				append(div1, text0);
				append(div1, div0);
				append(div0, text1);
				append(div1, text2);
				append(div1, i1);
				current = true;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((!current || changed.folderList) && i0_class_value !== (i0_class_value = "" + icon(ctx.element.type) + " svelte-zl0k9i")) {
					i0.className = i0_class_value;
				}

				if ((!current || changed.folderList) && text1_value !== (text1_value = label(ctx.element))) {
					setData(text1, text1_value);
				}

				div1._svelte.ctx = ctx;
			},

			i: function intro(target, anchor) {
				if (current) { return; }
				if (component.root._intro) {
					if (div1_transition) { div1_transition.invalidate(); }

					component.root._aftercreate.push(function () {
						if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {duration:200}, true); }
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) { return; }

				if (!div1_transition) { div1_transition = wrapTransition(component, div1, slide, {duration:200}, false); }
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

				removeListener(div1, "click", click_handler);
				if (detach) {
					if (div1_transition) { div1_transition.abort(); }
				}
			}
		};
	}

	// (48:4) {#each chartList as element}
	function create_each_block(component, ctx) {
		var div1, i, text0, div0, text1_value = ctx.element.title, text1, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				i = createElement("i");
				text0 = createText("  \n\t\t\t\t\t\t");
				div0 = createElement("div");
				text1 = createText(text1_value);
				i.className = "fa fa-bar-chart svelte-zl0k9i";
				addLoc(i, file, 49, 6, 1444);
				div0.className = "svelte-zl0k9i";
				addLoc(div0, file, 50, 6, 1489);
				div1.className = "li chart svelte-zl0k9i";
				addLoc(div1, file, 48, 5, 1382);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, i);
				append(div1, text0);
				append(div1, div0);
				append(div0, text1);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((!current || changed.chartList) && text1_value !== (text1_value = ctx.element.title)) {
					setData(text1, text1_value);
				}
			},

			i: function intro(target, anchor) {
				if (current) { return; }
				if (component.root._intro) {
					if (div1_transition) { div1_transition.invalidate(); }

					component.root._aftercreate.push(function () {
						if (!div1_transition) { div1_transition = wrapTransition(component, div1, fade, {duration:200}, true); }
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) { return; }

				if (!div1_transition) { div1_transition = wrapTransition(component, div1, fade, {duration:200}, false); }
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

	// (57:4) {#if chartList.length == 0 && folderList.length == 0}
	function create_if_block_3(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.textContent = "This folder is empty.";
				div.className = "empty svelte-zl0k9i";
				addLoc(div, file, 57, 5, 1621);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
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
		this._state = assign(data(), options.data);

		this._recompute({ position: 1, folders: 1 }, this._state);
		if (!('position' in this._state)) { console.warn("<App> was created without expected data property 'position'"); }
		if (!('folders' in this._state)) { console.warn("<App> was created without expected data property 'folders'"); }
		if (!('show' in this._state)) { console.warn("<App> was created without expected data property 'show'"); }
		if (!('loading' in this._state)) { console.warn("<App> was created without expected data property 'loading'"); }
		if (!('creating' in this._state)) { console.warn("<App> was created without expected data property 'creating'"); }

		if (!('folderName' in this._state)) { console.warn("<App> was created without expected data property 'folderName'"); }
		this._intro = true;

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('isRoot' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'isRoot'"); }
		if ('folderList' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'folderList'"); }
		if ('chartList' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'chartList'"); }
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.position) {
			if (this._differs(state.isRoot, (state.isRoot = isRoot(state)))) { changed.isRoot = true; }
		}

		if (changed.position || changed.folders) {
			if (this._differs(state.folderList, (state.folderList = folderList(state)))) { changed.folderList = true; }
			if (this._differs(state.chartList, (state.chartList = chartList(state)))) { changed.chartList = true; }
		}
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

	var store = new Store({});

	var data$1 = {
	    chart: {
	        id: ''
	    }
	};

	var main = { App: App, data: data$1, store: store };

	return main;

}));
//# sourceMappingURL=folder.js.map
