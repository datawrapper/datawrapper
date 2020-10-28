<<<<<<< HEAD
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/team-settings', factory) :
	(global = global || self, global['team-settings'] = factory());
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

	function isPromise(value) {
		return value && typeof value.then === 'function';
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
		while (parent.firstChild) target.appendChild(parent.firstChild);
	}

	function reinsertAfter(before, target) {
		while (before.nextSibling) target.appendChild(before.nextSibling);
	}

	function reinsertBefore(after, target) {
		var parent = after.parentNode;
		while (parent.firstChild !== after) target.appendChild(parent.firstChild);
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

	function handlePromise(promise, info) {
		var token = info.token = {};

		function update(type, index, key, value) {
			if (info.token !== token) return;

			info.resolved = key && { [key]: value };

			const child_ctx = assign(assign({}, info.ctx), info.resolved);
			const block = type && (info.current = type)(info.component, child_ctx);

			if (info.block) {
				if (info.blocks) {
					info.blocks.forEach((block, i) => {
						if (i !== index && block) {
							groupOutros();
							block.o(() => {
								block.d(1);
								info.blocks[i] = null;
							});
						}
					});
				} else {
					info.block.d(1);
				}

				block.c();
				block[block.i ? 'i' : 'm'](info.mount(), info.anchor);

				info.component.root.set({}); // flush any handlers that were created
			}

			info.block = block;
			if (info.blocks) info.blocks[index] = block;
		}

		if (isPromise(promise)) {
			promise.then(value => {
				update(info.then, 1, info.value, value);
			}, error => {
				update(info.catch, 2, info.error, error);
			});

			// if we previously had a then/catch block, destroy it
			if (info.current !== info.pending) {
				update(info.pending, 0);
				return true;
			}
		} else {
			if (info.current !== info.then) {
				update(info.then, 1, info.value, promise);
				return true;
			}

			info.resolved = { [info.value]: promise };
		}
	}

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
					if (!(key in n)) to_null_out[key] = 1;
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
			if (!(key in update)) update[key] = undefined;
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

	/* globals dw */

	let __messages = {};

	function initMessages(scope = 'core') {
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
	function __(key, scope = 'core') {
	    key = key.trim();
	    if (!__messages[scope]) initMessages(scope);
	    if (!__messages[scope][key]) return 'MISSING:' + key;
	    var translation = __messages[scope][key];

	    if (typeof translation === 'string' && arguments.length > 2) {
	        // replace $0, $1 etc with remaining arguments
	        translation = translation.replace(/\$(\d)/g, (m, i) => {
	            i = 2 + Number(i);
	            if (arguments[i] === undefined) return m;
	            return arguments[i];
	        });
	    }
	    return translation;
	}

	/**
	 * Shorten a string by removing characters from the middle
	 *
	 * @exports truncate
	 * @kind function
	 *
	 * @example
	 * import truncate from '@datawrapper/shared/truncate';
	 * // returns 'This is a…tring'
	 * truncate('This is a very very long string')
	 *
	 * @param {string} str
	 * @param {number} start - characters to keep at start of string
	 * @param {number} end - characters to keep at end off string
	 * @returns {string}
	 */
	function truncate(str, start = 11, end = 7) {
	    if (typeof str !== 'string') return str;
	    if (str.length < start + end + 3) return str;
	    return str.substr(0, start).trim() + '…' + str.substr(str.length - end).trim();
	}

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

	/**
	 * injects a `<script>` element to the page to load a new JS script
	 *
	 * @param {string} src
	 * @param {function} callback
	 *
	 * @example
	 * import { loadScript } from '@datawrapper/shared/fetch';
	 *
	 * loadScript('/static/js/library.js', () => {
	 *     console.log('library is loaded');
	 * })
	 */
	function loadScript(src, callback = null) {
	    return new Promise((resolve, reject) => {
	        const script = document.createElement('script');
	        script.src = src;
	        script.onload = () => {
	            if (callback) callback();
	            resolve();
	        };
	        script.onerror = reject;
	        document.body.appendChild(script);
	    });
	}

	/**
	 * injects a `<link>` element to the page to load a new stylesheet
	 *
	 * @param {string} src
	 * @param {function} callback
	 *
	 * @example
	 * import { loadStylesheet } from '@datawrapper/shared/fetch';
	 *
	 * loadStylesheet('/static/css/library.css', () => {
	 *     console.log('library styles are loaded');
	 * })
	 */
	function loadStylesheet(src, callback = null) {
	    return new Promise((resolve, reject) => {
	        const link = document.createElement('link');
	        link.rel = 'stylesheet';
	        link.href = src;
	        link.onload = () => {
	            if (callback) callback();
	            resolve();
	        };
	        link.onerror = reject;
	        document.head.appendChild(link);
	    });
	}

	/* shared/NavTabs.html generated by Svelte v2.16.1 */

	function data() {
	    return {
	        groups: [],
	        basePath: '',
	        activeTab: null
	    };
	}
	var methods = {
	    activateTab(tab, event = null) {
	        if (tab.module) {
	            if (event) event.preventDefault();
	            Promise.all([loadStylesheet(tab.css), loadScript(tab.js || tab.src)]).then(
	                () => {
	                    require([tab.module], mod => {
	                        tab.ui = mod.App;
	                        tab.module = null;
	                        const { groups } = this.get();
	                        this.set({
	                            groups,
	                            activeTab: tab
	                        });
	                    });
	                }
	            );
	            return;
	        }
	        if (tab.ui) {
	            if (event) event.preventDefault();
	            this.set({ activeTab: tab });
	        }
	    },
	    onTabChange(tab, event) {
	        if (tab.onchange) {
	            tab.onchange(event, this.refs.currentTabUi);
	        }
	    }
	};

	const file = "shared/NavTabs.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.activateTab(ctx.tab, event);
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tab = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.group = list[i];
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var div1, div0, text0, slot_content_belowMenu = component._slotted.belowMenu, slot_content_belowMenu_before, text1;

		var each_value = ctx.groups;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		var if_block = (ctx.activeTab) && create_if_block(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text0 = createText("\n        ");
				text1 = createText("\n    ");
				if (if_block) if_block.c();
				div0.className = "span2 svelte-5we305";
				addLoc(div0, file, 1, 4, 22);
				div1.className = "row";
				addLoc(div1, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}

				append(div0, text0);

				if (slot_content_belowMenu) {
					append(div0, slot_content_belowMenu_before || (slot_content_belowMenu_before = createComment()));
					append(div0, slot_content_belowMenu);
				}

				append(div1, text1);
				if (if_block) if_block.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (changed.groups || changed.activeTab || changed.basePath) {
					each_value = ctx.groups;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div0, text0);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (ctx.activeTab) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block(component, ctx);
						if_block.c();
						if_block.m(div1, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				destroyEach(each_blocks, detach);

				if (slot_content_belowMenu) {
					reinsertAfter(slot_content_belowMenu_before, slot_content_belowMenu);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (7:12) {#each group.tabs as tab}
	function create_each_block_1(component, ctx) {
		var li, a, i, i_class_value, text0, text1_value = ctx.tab.title, text1, a_href_value;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i = createElement("i");
				text0 = createText("   ");
				text1 = createText(text1_value);
				i.className = i_class_value = "" + ctx.tab.icon + " svelte-5we305";
				addLoc(i, file, 9, 21, 399);

				a._svelte = { component, ctx };

				addListener(a, "click", click_handler);
				a.href = a_href_value = ctx.tab.url || `/${ctx.basePath}/${ctx.tab.id}`;
				a.className = "svelte-5we305";
				addLoc(a, file, 8, 16, 293);
				li.className = "svelte-5we305";
				toggleClass(li, "active", ctx.activeTab && ctx.activeTab.id === ctx.tab.id);
				addLoc(li, file, 7, 12, 220);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				append(a, i);
				append(a, text0);
				append(a, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.groups) && i_class_value !== (i_class_value = "" + ctx.tab.icon + " svelte-5we305")) {
					i.className = i_class_value;
				}

				if ((changed.groups) && text1_value !== (text1_value = ctx.tab.title)) {
					setData(text1, text1_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.groups || changed.basePath) && a_href_value !== (a_href_value = ctx.tab.url || `/${ctx.basePath}/${ctx.tab.id}`)) {
					a.href = a_href_value;
				}

				if ((changed.activeTab || changed.groups)) {
					toggleClass(li, "active", ctx.activeTab && ctx.activeTab.id === ctx.tab.id);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(a, "click", click_handler);
			}
		};
	}

	// (3:8) {#each groups as group}
	function create_each_block(component, ctx) {
		var div, text0_value = ctx.group.title, text0, text1, ul;

		var each_value_1 = ctx.group.tabs;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n\n        ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "group svelte-5we305";
				addLoc(div, file, 3, 8, 82);
				ul.className = "nav nav-stacked nav-tabs";
				addLoc(ul, file, 5, 8, 132);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text0);
				insert(target, text1, anchor);
				insert(target, ul, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if ((changed.groups) && text0_value !== (text0_value = ctx.group.title)) {
					setData(text0, text0_value);
				}

				if (changed.activeTab || changed.groups || changed.basePath) {
					each_value_1 = ctx.group.tabs;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
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
					detachNode(text1);
					detachNode(ul);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (18:4) {#if activeTab}
	function create_if_block(component, ctx) {
		var div, slot_content_aboveContent = component._slotted.aboveContent, slot_content_aboveContent_after, text0, text1, slot_content_belowContent = component._slotted.belowContent, slot_content_belowContent_before, div_class_value;

		var switch_instance_spread_levels = [
			ctx.activeTab.data
		];

		var switch_value = ctx.activeTab.ui;

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

		function switch_instance_change(event) {
			component.onTabChange(ctx.activeTab, event);
		}

		if (switch_instance) switch_instance.on("change", switch_instance_change);

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText("\n        ");
				if (switch_instance) switch_instance._fragment.c();
				text1 = createText("\n        ");
				div.className = div_class_value = "span10 account-page-content tab-" + ctx.activeTab.id + " svelte-5we305";
				addLoc(div, file, 18, 4, 607);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				if (slot_content_aboveContent) {
					append(div, slot_content_aboveContent);
					append(div, slot_content_aboveContent_after || (slot_content_aboveContent_after = createComment()));
				}

				append(div, text0);

				if (switch_instance) {
					switch_instance._mount(div, null);
					component.refs.currentTabUi = switch_instance;
				}

				append(div, text1);

				if (slot_content_belowContent) {
					append(div, slot_content_belowContent_before || (slot_content_belowContent_before = createComment()));
					append(div, slot_content_belowContent);
				}
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var switch_instance_changes = changed.activeTab ? getSpreadUpdate(switch_instance_spread_levels, [
					ctx.activeTab.data
				]) : {};

				if (switch_value !== (switch_value = ctx.activeTab.ui)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						switch_instance._fragment.c();
						switch_instance._mount(div, text1);

						switch_instance.on("change", switch_instance_change);

						component.refs.currentTabUi = switch_instance;
					} else {
						switch_instance = null;
						if (component.refs.currentTabUi === switch_instance) {
							component.refs.currentTabUi = null;
						}
					}
				}

				else if (switch_value) {
					switch_instance._set(switch_instance_changes);
				}

				if ((changed.activeTab) && div_class_value !== (div_class_value = "span10 account-page-content tab-" + ctx.activeTab.id + " svelte-5we305")) {
					div.className = div_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (slot_content_aboveContent) {
					reinsertBefore(slot_content_aboveContent_after, slot_content_aboveContent);
				}

				if (switch_instance) switch_instance.destroy();

				if (slot_content_belowContent) {
					reinsertAfter(slot_content_belowContent_before, slot_content_belowContent);
				}
			}
		};
	}

	function NavTabs(options) {
		this._debugName = '<NavTabs>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data(), options.data);
		if (!('groups' in this._state)) console.warn("<NavTabs> was created without expected data property 'groups'");
		if (!('activeTab' in this._state)) console.warn("<NavTabs> was created without expected data property 'activeTab'");
		if (!('basePath' in this._state)) console.warn("<NavTabs> was created without expected data property 'basePath'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(NavTabs.prototype, protoDev);
	assign(NavTabs.prototype, methods);

	NavTabs.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/Table.html generated by Svelte v2.16.1 */

	const ORDER = { true: 'ASC', false: 'DESC' };
	const DEFAULT_ORDER = ORDER.true;

	function isActive({ orderBy }) {
		return item => orderBy === item.orderBy;
	}

	function isAscending({ order }) {
		return order === DEFAULT_ORDER;
	}

	function data$1() {
		return {
	    order: DEFAULT_ORDER,
	    orderBy: ''
	};
	}

	var methods$1 = {
	    sort(event, orderBy) {
	        event.preventDefault();

	        // if `orderBy` didn't change, invert sort order:
	        const order = (current => {
	            if (orderBy === current.orderBy) {
	                return ORDER[current.order !== DEFAULT_ORDER];
	            } else {
	                return DEFAULT_ORDER;
	            }
	        })(this.get());

	        this.set({ orderBy, order });
	        this.fire('sort', { orderBy, order });
	    }
	};

	const file$1 = "home/david/Projects/core/libs/controls/v2/Table.html";

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.sort(event, ctx.item.orderBy);
	}

	function get_each1_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var div, table, colgroup, text0, thead, tr, text1, tbody, slot_content_default = component._slotted.default;

		var each0_value = ctx.columnHeaders;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_1$1(component, get_each0_context(ctx, each0_value, i));
		}

		var each1_value = ctx.columnHeaders;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block$1(component, get_each1_context(ctx, each1_value, i));
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
				addLoc(colgroup, file$1, 2, 8, 64);
				addLoc(tr, file$1, 9, 12, 234);
				addLoc(thead, file$1, 8, 8, 214);
				addLoc(tbody, file$1, 28, 8, 934);
				table.className = "table svelte-1ef3poq";
				addLoc(table, file$1, 1, 4, 34);
				div.className = "table-container svelte-1ef3poq";
				addLoc(div, file$1, 0, 0, 0);
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
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_1$1(component, child_ctx);
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
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block$1(component, child_ctx);
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
	function create_each_block_1$1(component, ctx) {
		var col;

		return {
			c: function create() {
				col = createElement("col");
				setStyle(col, "width", ctx.item.width);
				addLoc(col, file$1, 4, 12, 129);
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
	function create_else_block(component, ctx) {
		var span, text_value = ctx.item.title, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "col";
				addLoc(span, file$1, 21, 20, 780);
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
	function create_if_block$1(component, ctx) {
		var a, text_value = ctx.item.title, text, a_class_value, a_href_value;

		return {
			c: function create() {
				a = createElement("a");
				text = createText(text_value);
				a._svelte = { component, ctx };

				addListener(a, "click", click_handler$1);
				a.className = a_class_value = "sortable " + (ctx.isActive(ctx.item) ? ctx.isAscending ? 'sortable-asc' : 'sortable-desc' : '') + " svelte-1ef3poq";
				a.href = a_href_value = `?orderBy=${ctx.item.orderBy}`;
				addLoc(a, file$1, 13, 20, 412);
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

				if ((changed.columnHeaders) && a_href_value !== (a_href_value = `?orderBy=${ctx.item.orderBy}`)) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}

				removeListener(a, "click", click_handler$1);
			}
		};
	}

	// (11:16) {#each columnHeaders as item}
	function create_each_block$1(component, ctx) {
		var th, th_class_value;

		function select_block_type(ctx) {
			if (ctx.item.orderBy) return create_if_block$1;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				th = createElement("th");
				if_block.c();
				th.className = th_class_value = "" + (ctx.item.className ? ctx.item.className : '') + " svelte-1ef3poq";
				addLoc(th, file$1, 11, 16, 301);
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
		this._state = assign(data$1(), options.data);

		this._recompute({ orderBy: 1, order: 1 }, this._state);
		if (!('orderBy' in this._state)) console.warn("<Table> was created without expected data property 'orderBy'");
		if (!('order' in this._state)) console.warn("<Table> was created without expected data property 'order'");
		if (!('columnHeaders' in this._state)) console.warn("<Table> was created without expected data property 'columnHeaders'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Table.prototype, protoDev);
	assign(Table.prototype, methods$1);

	Table.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('isActive' in newState && !this._updatingReadonlyProperty) throw new Error("<Table>: Cannot set read-only property 'isActive'");
		if ('isAscending' in newState && !this._updatingReadonlyProperty) throw new Error("<Table>: Cannot set read-only property 'isAscending'");
	};

	Table.prototype._recompute = function _recompute(changed, state) {
		if (changed.orderBy) {
			if (this._differs(state.isActive, (state.isActive = isActive(state)))) changed.isActive = true;
		}

		if (changed.order) {
			if (this._differs(state.isAscending, (state.isAscending = isAscending(state)))) changed.isAscending = true;
		}
	};

	/* home/david/Projects/core/libs/controls/v2/ControlGroup.html generated by Svelte v2.16.1 */

	function data$2() {
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

	const file$2 = "home/david/Projects/core/libs/controls/v2/ControlGroup.html";

	function create_main_fragment$2(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, div1_class_value;

		var if_block0 = (ctx.label) && create_if_block_1(component, ctx);

		var if_block1 = (ctx.help) && create_if_block$2(component, ctx);

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
				addLoc(div0, file$2, 8, 4, 318);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-p72242";
				addLoc(div1, file$2, 0, 0, 0);
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
						if_block1 = create_if_block$2(component, ctx);
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
		var label, raw_after, text;

		var if_block = (ctx.labelHelp) && create_if_block_2(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				text = createText(" ");
				if (if_block) if_block.c();
				setStyle(label, "width", (ctx.width||def.width));
				label.className = "control-label svelte-p72242";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$2, 2, 4, 104);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, raw_after);
				raw_after.insertAdjacentHTML("beforebegin", ctx.label);
				append(label, text);
				if (if_block) if_block.m(label, null);
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					detachBefore(raw_after);
					raw_after.insertAdjacentHTML("beforebegin", ctx.label);
				}

				if (ctx.labelHelp) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_2(component, ctx);
						if_block.c();
						if_block.m(label, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
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

				if (if_block) if_block.d();
			}
		};
	}

	// (4:24) {#if labelHelp}
	function create_if_block_2(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help mt-1";
				addLoc(p, file$2, 4, 8, 229);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.labelHelp;
			},

			p: function update(changed, ctx) {
				if (changed.labelHelp) {
					p.innerHTML = ctx.labelHelp;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (12:4) {#if help}
	function create_if_block$2(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.width||def.width));
				p.className = p_class_value = "mini-help " + ctx.type + " svelte-p72242";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file$2, 12, 4, 469);
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
		this._state = assign(data$2(), options.data);
		if (!('type' in this._state)) console.warn("<ControlGroup> was created without expected data property 'type'");
		if (!('valign' in this._state)) console.warn("<ControlGroup> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<ControlGroup> was created without expected data property 'label'");
		if (!('width' in this._state)) console.warn("<ControlGroup> was created without expected data property 'width'");
		if (!('labelHelp' in this._state)) console.warn("<ControlGroup> was created without expected data property 'labelHelp'");
		if (!('inline' in this._state)) console.warn("<ControlGroup> was created without expected data property 'inline'");
		if (!('help' in this._state)) console.warn("<ControlGroup> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/BaseSelect.html generated by Svelte v2.16.1 */

	function data$3() {
	    return {
	        disabled: false,
	        width: 'auto',
	        labelWidth: 'auto',
	        options: [],
	        optgroups: [],
	        value: null
	    };
	}
	const file$3 = "home/david/Projects/core/libs/controls/v2/BaseSelect.html";

	function get_each_context_2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.optgroup = list[i];
		return child_ctx;
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$3(component, ctx) {
		var select, if_block0_anchor, select_updating = false;

		var if_block0 = (ctx.options.length) && create_if_block_1$1(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$3(component, ctx);

		function select_change_handler() {
			select_updating = true;
			component.set({ value: selectValue(select) });
			select_updating = false;
		}

		function change_handler(event) {
			component.fire('change', event);
		}

		return {
			c: function create() {
				select = createElement("select");
				if (if_block0) if_block0.c();
				if_block0_anchor = createComment();
				if (if_block1) if_block1.c();
				addListener(select, "change", select_change_handler);
				if (!('value' in ctx)) component.root._beforecreate.push(select_change_handler);
				addListener(select, "change", change_handler);
				select.className = "select-css svelte-v0oq4b";
				select.disabled = ctx.disabled;
				setStyle(select, "width", ctx.width);
				addLoc(select, file$3, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, select, anchor);
				if (if_block0) if_block0.m(select, null);
				append(select, if_block0_anchor);
				if (if_block1) if_block1.m(select, null);

				selectOption(select, ctx.value);
			},

			p: function update(changed, ctx) {
				if (ctx.options.length) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$1(component, ctx);
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
						if_block1 = create_if_block$3(component, ctx);
						if_block1.c();
						if_block1.m(select, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!select_updating && changed.value) selectOption(select, ctx.value);
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

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				removeListener(select, "change", select_change_handler);
				removeListener(select, "change", change_handler);
			}
		};
	}

	// (2:4) {#if options.length}
	function create_if_block_1$1(component, ctx) {
		var each_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context$1(ctx, each_value, i));
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
				if (changed.options || changed.value) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_2(component, child_ctx);
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
	function create_each_block_2(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$3, 2, 4, 179);
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
				if ((changed.options || changed.value) && option_selected_value !== (option_selected_value = ctx.opt.value === ctx.value)) {
					option.selected = option_selected_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(option);
				}
			}
		};
	}

	// (4:18) {#if optgroups.length}
	function create_if_block$3(component, ctx) {
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
				if (changed.optgroups || changed.value) {
					each_value_1 = ctx.optgroups;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

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
	function create_each_block_1$2(component, ctx) {
		var option, text_value = ctx.opt.label, text, option_value_value, option_selected_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt.value;
				option.value = option.__value;
				option.selected = option_selected_value = ctx.opt.value === ctx.value;
				addLoc(option, file$3, 6, 8, 420);
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
				if ((changed.optgroups || changed.value) && option_selected_value !== (option_selected_value = ctx.opt.value === ctx.value)) {
					option.selected = option_selected_value;
				}
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
			each_blocks[i] = create_each_block_1$2(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				optgroup = createElement("optgroup");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setAttribute(optgroup, "label", optgroup_label_value = ctx.optgroup.label);
				addLoc(optgroup, file$3, 4, 4, 336);
			},

			m: function mount(target, anchor) {
				insert(target, optgroup, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(optgroup, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.optgroups || changed.value) {
					each_value_2 = ctx.optgroup.options;

					for (var i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$2(component, child_ctx);
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
		this._state = assign(data$3(), options.data);
		if (!('disabled' in this._state)) console.warn("<BaseSelect> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<BaseSelect> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<BaseSelect> was created without expected data property 'width'");
		if (!('options' in this._state)) console.warn("<BaseSelect> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<BaseSelect> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$3(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(BaseSelect.prototype, protoDev);

	BaseSelect.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/Select.html generated by Svelte v2.16.1 */



	function controlWidth({ inline, width }) {
		return inline ? width || 'auto' : width;
	}

	function labelWidth({ inline, labelWidth }) {
		return inline ? labelWidth || 'auto' : labelWidth;
	}

	function data$4() {
	    return {
	        disabled: false,
	        width: null,
	        labelWidth: null,
	        options: [],
	        optgroups: [],
	        valign: 'middle',
	        inline: true,
	        help: ''
	    };
	}
	function create_main_fragment$4(component, ctx) {
		var baseselect_updating = {}, controlgroup_updating = {};

		var baseselect_initial_data = { width: ctx.controlWidth };
		if (ctx.value  !== void 0) {
			baseselect_initial_data.value = ctx.value ;
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
		if (ctx.optgroups  !== void 0) {
			baseselect_initial_data.optgroups = ctx.optgroups ;
			baseselect_updating.optgroups = true;
		}
		var baseselect = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!baseselect_updating.value && changed.value) {
					newState.value = childState.value;
				}

				if (!baseselect_updating.disabled && changed.disabled) {
					newState.disabled = childState.disabled;
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

		component.root._beforecreate.push(() => {
			baseselect._bind({ value: 1, disabled: 1, options: 1, optgroups: 1 }, baseselect.get());
		});

		baseselect.on("change", function(event) {
			component.fire('change', event);
		});

		var controlgroup_initial_data = { width: ctx.labelWidth, type: "select" };
		if (ctx.valign  !== void 0) {
			controlgroup_initial_data.valign = ctx.valign ;
			controlgroup_updating.valign = true;
		}
		if (ctx.label  !== void 0) {
			controlgroup_initial_data.label = ctx.label ;
			controlgroup_updating.label = true;
		}
		if (ctx.disabled  !== void 0) {
			controlgroup_initial_data.disabled = ctx.disabled ;
			controlgroup_updating.disabled = true;
		}
		if (ctx.help  !== void 0) {
			controlgroup_initial_data.help = ctx.help ;
			controlgroup_updating.help = true;
		}
		if (ctx.inline !== void 0) {
			controlgroup_initial_data.inline = ctx.inline;
			controlgroup_updating.inline = true;
		}
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!controlgroup_updating.valign && changed.valign) {
					newState.valign = childState.valign;
				}

				if (!controlgroup_updating.label && changed.label) {
					newState.label = childState.label;
				}

				if (!controlgroup_updating.disabled && changed.disabled) {
					newState.disabled = childState.disabled;
				}

				if (!controlgroup_updating.help && changed.help) {
					newState.help = childState.help;
				}

				if (!controlgroup_updating.inline && changed.inline) {
					newState.inline = childState.inline;
				}
				component._set(newState);
				controlgroup_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			controlgroup._bind({ valign: 1, label: 1, disabled: 1, help: 1, inline: 1 }, controlgroup.get());
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
				if (changed.controlWidth) baseselect_changes.width = ctx.controlWidth;
				if (!baseselect_updating.value && changed.value) {
					baseselect_changes.value = ctx.value ;
					baseselect_updating.value = ctx.value  !== void 0;
				}
				if (!baseselect_updating.disabled && changed.disabled) {
					baseselect_changes.disabled = ctx.disabled ;
					baseselect_updating.disabled = ctx.disabled  !== void 0;
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
				if (changed.labelWidth) controlgroup_changes.width = ctx.labelWidth;
				if (!controlgroup_updating.valign && changed.valign) {
					controlgroup_changes.valign = ctx.valign ;
					controlgroup_updating.valign = ctx.valign  !== void 0;
				}
				if (!controlgroup_updating.label && changed.label) {
					controlgroup_changes.label = ctx.label ;
					controlgroup_updating.label = ctx.label  !== void 0;
				}
				if (!controlgroup_updating.disabled && changed.disabled) {
					controlgroup_changes.disabled = ctx.disabled ;
					controlgroup_updating.disabled = ctx.disabled  !== void 0;
				}
				if (!controlgroup_updating.help && changed.help) {
					controlgroup_changes.help = ctx.help ;
					controlgroup_updating.help = ctx.help  !== void 0;
				}
				if (!controlgroup_updating.inline && changed.inline) {
					controlgroup_changes.inline = ctx.inline;
					controlgroup_updating.inline = ctx.inline !== void 0;
				}
				controlgroup._set(controlgroup_changes);
				controlgroup_updating = {};
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
		this._state = assign(data$4(), options.data);

		this._recompute({ inline: 1, width: 1, labelWidth: 1 }, this._state);
		if (!('inline' in this._state)) console.warn("<Select> was created without expected data property 'inline'");
		if (!('width' in this._state)) console.warn("<Select> was created without expected data property 'width'");

		if (!('valign' in this._state)) console.warn("<Select> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<Select> was created without expected data property 'label'");
		if (!('disabled' in this._state)) console.warn("<Select> was created without expected data property 'disabled'");
		if (!('help' in this._state)) console.warn("<Select> was created without expected data property 'help'");

		if (!('value' in this._state)) console.warn("<Select> was created without expected data property 'value'");
		if (!('options' in this._state)) console.warn("<Select> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<Select> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$4(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Select.prototype, protoDev);

	Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('controlWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Select>: Cannot set read-only property 'controlWidth'");
		if ('labelWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Select>: Cannot set read-only property 'labelWidth'");
	};

	Select.prototype._recompute = function _recompute(changed, state) {
		if (changed.inline || changed.width) {
			if (this._differs(state.controlWidth, (state.controlWidth = controlWidth(state)))) changed.controlWidth = true;
		}

		if (changed.inline || changed.labelWidth) {
			if (this._differs(state.labelWidth, (state.labelWidth = labelWidth(state)))) changed.labelWidth = true;
		}
	};

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

	var js_cookie = createCommonjsModule(function (module, exports) {
	(function (factory) {
		var registeredInModuleLoader;
		{
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function decode (s) {
			return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
		}

		function init (converter) {
			function api() {}

			function set (key, value, attributes) {
				if (typeof document === 'undefined') {
					return;
				}

				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}

					// Considers RFC 6265 section 5.2:
					// ...
					// 3.  If the remaining unparsed-attributes contains a %x3B (";")
					//     character:
					// Consume the characters of the unparsed-attributes up to,
					// not including, the first %x3B (";") character.
					// ...
					stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
				}

				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			function get (key, json) {
				if (typeof document === 'undefined') {
					return;
				}

				var jar = {};
				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all.
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = decode(parts[0]);
						cookie = (converter.read || converter)(cookie, name) ||
							decode(cookie);

						if (json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						jar[name] = cookie;

						if (key === name) {
							break;
						}
					} catch (e) {}
				}

				return key ? jar[key] : jar;
			}

			api.set = set;
			api.get = function (key) {
				return get(key, false /* read as raw */);
			};
			api.getJSON = function (key) {
				return get(key, true /* read as json */);
			};
			api.remove = function (key, attributes) {
				set(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.defaults = {};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));
	});

	const CSRF_COOKIE_NAME = 'crumb';
	const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
	const CSRF_SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']); // according to RFC7231

	/**
	 * The response body is automatically parsed according
	 * to the response content type.
	 *
	 * @exports httpReq
	 * @kind function
	 *
	 * @param {string} path               - the url path that gets appended to baseUrl
	 * @param {object} options.payload    - payload to be send with req
	 * @param {boolean} options.raw       - disable parsing of response body, returns raw response
	 * @param {string} options.baseUrl    - base for url, defaults to dw api domain
	 * @param {*} options                 - see documentation for window.fetch for additional options
	 *
	 * @returns {Promise} promise of parsed response body or raw response
	 *
	 * @example
	 *  import httpReq from '@datawrapper/shared/httpReq';
	 *  let res = await httpReq('/v3/charts', {
	 *      method: 'post',
	 *      payload: {
	 *          title: 'My new chart'
	 *      }
	 *  });
	 *  import { post } from '@datawrapper/shared/httpReq';
	 *  res = await post('/v3/charts', {
	 *      payload: {
	 *          title: 'My new chart'
	 *      }
	 *  });
	 */
	function httpReq(path, options = {}) {
	    if (!options.fetch) {
	        try {
	            options.fetch = window.fetch;
	        } catch (e) {
	            throw new Error('Neither options.fetch nor window.fetch is defined.');
	        }
	    }
	    if (!options.baseUrl) {
	        try {
	            options.baseUrl = `//${window.dw.backend.__api_domain}`;
	        } catch (e) {
	            throw new Error('Neither options.baseUrl nor window.dw is defined.');
	        }
	    }
	    const { payload, baseUrl, fetch, raw, ...opts } = {
	        payload: null,
	        raw: false,
	        method: 'GET',
	        mode: 'cors',
	        credentials: 'include',
	        ...options,
	        headers: {
	            'Content-Type': 'application/json',
	            ...options.headers
	        }
	    };
	    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
	    if (payload) {
	        // overwrite body
	        opts.body = JSON.stringify(payload);
	    }

	    let promise;
	    if (!CSRF_SAFE_METHODS.has(opts.method.toLowerCase())) {
	        let csrfCookieValue = js_cookie.get(CSRF_COOKIE_NAME);
	        if (csrfCookieValue) {
	            opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
	            promise = fetch(url, opts);
	        } else {
	            promise = httpReq('/v3/me', { fetch, baseUrl })
	                .then(() => {
	                    const csrfCookieValue = js_cookie.get(CSRF_COOKIE_NAME);
	                    if (csrfCookieValue) {
	                        opts.headers[CSRF_TOKEN_HEADER] = csrfCookieValue;
	                    }
	                })
	                .catch(() => {}) // Ignore errors from /v3/me. It probably means the user is not logged in.
	                .then(() => fetch(url, opts));
	        }
	    } else {
	        promise = fetch(url, opts);
	    }
	    // The variable `promise` and the repeated `fetch(url, opts)` could be replaced with `await
	    // httpReq('/v3/me'...)`, but then we would need to configure babel to transform async/await for
	    // all repositories that use @datawrapper/shared.

	    return promise.then(res => {
	        if (raw) return res;
	        if (!res.ok) throw new HttpReqError(res);
	        if (res.status === 204 || !res.headers.get('content-type')) return res; // no content
	        // trim away the ;charset=utf-8 from content-type
	        const contentType = res.headers.get('content-type').split(';')[0];
	        if (contentType === 'application/json') {
	            return res.json();
	        }
	        if (contentType === 'image/png' || contentType === 'application/pdf') {
	            return res.blob();
	        }
	        // default to text for all other content types
	        return res.text();
	    });
	}

	/**
	 * Like `httpReq` but with fixed http method GET
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.get
	 * @kind function
	 */
	const get$1 = (httpReq.get = httpReqVerb('GET'));

	/**
	 * Like `httpReq` but with fixed http method PATCH
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.patch
	 * @kind function
	 */
	const patch = (httpReq.patch = httpReqVerb('PATCH'));

	/**
	 * Like `httpReq` but with fixed http method PUT
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.put
	 * @kind function
	 */
	const put = (httpReq.put = httpReqVerb('PUT'));

	/**
	 * Like `httpReq` but with fixed http method POST
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.post
	 * @kind function
	 */
	const post = (httpReq.post = httpReqVerb('POST'));

	/**
	 * Like `httpReq` but with fixed http method HEAD
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.head
	 * @kind function
	 */
	const head = (httpReq.head = httpReqVerb('HEAD'));

	/**
	 * Like `httpReq` but with fixed http method DELETE
	 * @see {@link httpReq}
	 *
	 * @exports httpReq.delete
	 * @kind function
	 */
	httpReq.delete = httpReqVerb('DELETE');

	function httpReqVerb(method) {
	    return (path, options) => {
	        if (options && options.method) {
	            throw new Error(
	                `Setting option.method is not allowed in httpReq.${method.toLowerCase()}()`
	            );
	        }
	        return httpReq(path, { ...options, method });
	    };
	}

	class HttpReqError extends Error {
	    constructor(res) {
	        super();
	        this.name = 'HttpReqError';
	        this.status = res.status;
	        this.statusText = res.statusText;
	        this.message = `[${res.status}] ${res.statusText}`;
	        this.response = res;
	    }
	}

	/* team-settings/tabs/members/UserTable.html generated by Svelte v2.16.1 */



	const teamRoleOptions = [
	    { value: 'owner', label: __('teams / role / owner').replace('&shy;', '') },
	    { value: 'admin', label: __('teams / role / admin').replace('&shy;', '') },
	    { value: 'member', label: __('teams / role / member').replace('&shy;', '') }
	];

	var MemberTable = Table;

	function roles({ isAdmin, isTeamOwner }) {
	    return isAdmin || isTeamOwner ? teamRoleOptions : teamRoleOptions.slice(1);
	}
	function sortedUsers({ users, isAdmin }) {
	    return users
	        .sort((a, b) => {
	            const roles = ['owner', 'admin', 'member'];

	            if (roles.indexOf(a.role) > roles.indexOf(b.role)) {
	                return 1;
	            } else if (roles.indexOf(a.role) < roles.indexOf(b.role)) {
	                return -1;
	            } else {
	                return a.email > b.email ? 1 : a.email < b.email ? -1 : 0;
	            }
	        })
	        .filter(user => isAdmin || !user.isAdmin);
	}
	function userHeaders({ isAdmin }) {
	    const userHeaders = [
	        { title: __('teams / user'), width: '25%' },
	        { title: 'ID', width: '10%' },
	        { title: 'Charts', width: '15%' },
	        { title: __('teams / status'), width: '15%' },
	        { title: __('teams / actions'), width: '30%' }
	    ];

	    if (!isAdmin) userHeaders.splice(1, 1);

	    return userHeaders;
	}
	function numUsers({ users }) {
	    return users.length;
	}
	function numCharts({ users }) {
	    let total = 0;
	    users.forEach(user => {
	        total += user.charts;
	    });
	    return total;
	}
	function numChartsCaption({ numCharts, isAdmin, team }) {
	    if (numCharts === 1) {
	        return __('teams / charts-total / 1');
	    } else if (numCharts > 1) {
	        if (isAdmin) {
	            return __('teams / charts-total-admin')
	                .replace('%i%', numCharts)
	                .replace('%link%', `/admin/chart/by/${team.id}`);
	        } else {
	            return __('teams / charts-total').replace('%i%', numCharts);
	        }
	    } else {
	        return '';
	    }
	}
	function data$5() {
	    return {
	        editId: false,
	        updating: {},
	        users: []
	    };
	}
	function role(role) {
	    return {
	        member: __('teams / role / member'),
	        admin: __('teams / role / admin'),
	        owner: __('teams / role / owner')
	    }[role];
	}
	var methods$2 = {
	    toggleEdit(userId) {
	        if (this.get().editId === userId) {
	            this.set({ editId: false });
	            this.updateRole(userId);
	        } else {
	            this.set({
	                editId: userId
	            });
	        }
	    },
	    async removeUser(user) {
	        if (!window.confirm(__('teams / remove / alert'))) return;

	        await httpReq.delete(`/v3/teams/${this.get().team.id}/members/${user.id}`);

	        var { users } = this.get();
	        users = users.filter(el => el.id !== user.id);
	        this.set({ users });
	    },
	    async updateRole(userId) {
	        var { updating, users } = this.get();
	        const user = users.filter(u => u.id === userId)[0];
	        updating[user.id] = true;
	        this.set({ updating });

	        await httpReq.put(`/v3/teams/${this.get().team.id}/members/${user.id}/status`, {
	            payload: {
	                status: user.role
	            }
	        });

	        updating = this.get().updating;
	        updating[user.id] = false;
	        this.set({ updating });
	    }
	};

	const file$4 = "team-settings/tabs/members/UserTable.html";

	function click_handler_2(event) {
		const { component, ctx } = this._svelte;

		component.removeUser(ctx.user);
	}

	function click_handler_1(event) {
		const { component, ctx } = this._svelte;

		component.toggleEdit(ctx.user.id);
	}

	function click_handler$2(event) {
		const { component, ctx } = this._svelte;

		component.toggleEdit(ctx.user.id);
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.user = list[i];
		child_ctx.each_value = list;
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$5(component, ctx) {
		var p, text0, raw_before, text1, if_block1_anchor;

		function select_block_type(ctx) {
			if (ctx.numUsers === 1) return create_if_block_7;
			if (ctx.numUsers > 1) return create_if_block_8;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type && current_block_type(component, ctx);

		var if_block1 = (ctx.sortedUsers.length) && create_if_block$4(component, ctx);

		return {
			c: function create() {
				p = createElement("p");
				if (if_block0) if_block0.c();
				text0 = createText(" ");
				raw_before = createElement('noscript');
				text1 = createText("\n\n");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
				addLoc(p, file$4, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				if (if_block0) if_block0.m(p, null);
				append(p, text0);
				append(p, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.numChartsCaption);
				insert(target, text1, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if (if_block0) if_block0.d(1);
					if_block0 = current_block_type && current_block_type(component, ctx);
					if (if_block0) if_block0.c();
					if (if_block0) if_block0.m(p, text0);
				}

				if (changed.numChartsCaption) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.numChartsCaption);
				}

				if (ctx.sortedUsers.length) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$4(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}

				if (if_block0) if_block0.d();
				if (detach) {
					detachNode(text1);
				}

				if (if_block1) if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (2:75) 
	function create_if_block_8(component, ctx) {
		var text_value = __('teams / total').replace('%i%', ctx.numUsers), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.numUsers) && text_value !== (text_value = __('teams / total').replace('%i%', ctx.numUsers))) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (2:4) {#if numUsers === 1}
	function create_if_block_7(component, ctx) {
		var text_value = __('teams / total / 1'), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (7:0) {#if sortedUsers.length}
	function create_if_block$4(component, ctx) {
		var each_anchor;

		var each_value = ctx.sortedUsers;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, get_each_context$2(ctx, each_value, i));
		}

		var membertable_initial_data = { columnHeaders: ctx.userHeaders };
		var membertable = new MemberTable({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: membertable_initial_data
		});

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
				membertable._fragment.c();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(membertable._slotted.default, null);
				}

				append(membertable._slotted.default, each_anchor);
				membertable._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.isAdmin || changed.isTeamOwner || changed.sortedUsers || changed.editId || changed.updating || changed.roles) {
					each_value = ctx.sortedUsers;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

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

				var membertable_changes = {};
				if (changed.userHeaders) membertable_changes.columnHeaders = ctx.userHeaders;
				membertable._set(membertable_changes);
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				membertable.destroy(detach);
			}
		};
	}

	// (14:8) {#if isAdmin}
	function create_if_block_6(component, ctx) {
		var td, a, text_value = ctx.user.id, text, a_href_value;

		return {
			c: function create() {
				td = createElement("td");
				a = createElement("a");
				text = createText(text_value);
				a.href = a_href_value = "/admin/users/" + ctx.user.id;
				addLoc(a, file$4, 15, 12, 415);
				addLoc(td, file$4, 14, 8, 398);
			},

			m: function mount(target, anchor) {
				insert(target, td, anchor);
				append(td, a);
				append(a, text);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedUsers) && text_value !== (text_value = ctx.user.id)) {
					setData(text, text_value);
				}

				if ((changed.sortedUsers) && a_href_value !== (a_href_value = "/admin/users/" + ctx.user.id)) {
					a.href = a_href_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(td);
				}
			}
		};
	}

	// (26:12) {:else}
	function create_else_block_1(component, ctx) {
		var raw_value = role(ctx.user.role), raw_before, raw_after, text, if_block_anchor;

		var if_block = (ctx.user.token) && create_if_block_5();

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text = createText(" ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				insert(target, raw_before, anchor);
				raw_before.insertAdjacentHTML("afterend", raw_value);
				insert(target, raw_after, anchor);
				insert(target, text, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedUsers) && raw_value !== (raw_value = role(ctx.user.role))) {
					detachBetween(raw_before, raw_after);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}

				if (ctx.user.token) {
					if (!if_block) {
						if_block = create_if_block_5();
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
					detachBetween(raw_before, raw_after);
					detachNode(raw_before);
					detachNode(raw_after);
					detachNode(text);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (23:12) {#if editId === user.id }
	function create_if_block_4(component, ctx) {
		var select_updating = {};

		var select_initial_data = {
		 	label: "",
		 	width: "200px",
		 	labelWidth: "0px",
		 	help: __('teams / role / p' ),
		 	options: ctx.roles
		 };
		if (ctx.user.role !== void 0) {
			select_initial_data.value = ctx.user.role;
			select_updating.value = true;
		}
		var select = new Select({
			root: component.root,
			store: component.store,
			data: select_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!select_updating.value && changed.value) {
					ctx.user.role = childState.value;

					newState.sortedUsers = ctx.sortedUsers;
				}
				component._set(newState);
				select_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
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
				if (changed.roles) select_changes.options = ctx.roles;
				if (!select_updating.value && changed.sortedUsers) {
					select_changes.value = ctx.user.role;
					select_updating.value = ctx.user.role !== void 0;
				}
				select._set(select_changes);
				select_updating = {};
			},

			d: function destroy(detach) {
				select.destroy(detach);
			}
		};
	}

	// (26:45) {#if user.token}
	function create_if_block_5(component, ctx) {
		var i, text_value = __('teams / invite-pending' ), text;

		return {
			c: function create() {
				i = createElement("i");
				text = createText(text_value);
				addLoc(i, file$4, 26, 12, 848);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
				append(i, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (31:12) {#if isAdmin || isTeamOwner || (!isTeamOwner && user.role != 'owner')}
	function create_if_block_1$2(component, ctx) {
		var if_block_anchor;

		function select_block_type_2(ctx) {
			if (ctx.editId ===
	            ctx.user.id) return create_if_block_2$1;
			if (ctx.updating[ctx.user.id]) return create_if_block_3;
			return create_else_block$1;
		}

		var current_block_type = select_block_type_2(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (40:12) {:else}
	function create_else_block$1(component, ctx) {
		var button0, i0, text0, text1_value = __('teams / edit' ), text1, text2, button1, i1, text3, text4_value = __('teams / remove' ), text4;

		return {
			c: function create() {
				button0 = createElement("button");
				i0 = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				text2 = createText("\n\n            ");
				button1 = createElement("button");
				i1 = createElement("i");
				text3 = createText("  ");
				text4 = createText(text4_value);
				i0.className = "fa fa-edit";
				addLoc(i0, file$4, 41, 16, 1541);

				button0._svelte = { component, ctx };

				addListener(button0, "click", click_handler_1);
				button0.className = "btn";
				addLoc(button0, file$4, 40, 12, 1473);
				i1.className = "fa fa-times";
				addLoc(i1, file$4, 45, 16, 1698);

				button1._svelte = { component, ctx };

				addListener(button1, "click", click_handler_2);
				button1.className = "btn";
				addLoc(button1, file$4, 44, 12, 1633);
			},

			m: function mount(target, anchor) {
				insert(target, button0, anchor);
				append(button0, i0);
				append(button0, text0);
				append(button0, text1);
				insert(target, text2, anchor);
				insert(target, button1, anchor);
				append(button1, i1);
				append(button1, text3);
				append(button1, text4);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button0._svelte.ctx = ctx;
				button1._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler_1);
				if (detach) {
					detachNode(text2);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_2);
			}
		};
	}

	// (36:39) 
	function create_if_block_3(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-spin fa-circle-o-notch";
				addLoc(i, file$4, 37, 16, 1344);
				button.disabled = true;
				button.className = "btn btn-primary";
				addLoc(button, file$4, 36, 12, 1286);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}
			}
		};
	}

	// (31:83) {#if editId ===             user.id }
	function create_if_block_2$1(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-check";
				addLoc(i, file$4, 33, 16, 1154);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler$2);
				button.className = "btn btn-primary";
				addLoc(button, file$4, 32, 12, 1074);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler$2);
			}
		};
	}

	// (9:4) {#each sortedUsers as user, i}
	function create_each_block$3(component, ctx) {
		var tr, td0, text0_value = ctx.user.email, text0, text1, text2, td1, text3_value = ctx.user.charts, text3, text4, td2, text5, td3, text6;

		var if_block0 = (ctx.isAdmin) && create_if_block_6(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.editId === ctx.user.id) return create_if_block_4;
			return create_else_block_1;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block1 = current_block_type(component, ctx);

		var if_block2 = (ctx.isAdmin || ctx.isTeamOwner || (!ctx.isTeamOwner && ctx.user.role != 'owner')) && create_if_block_1$2(component, ctx);

		return {
			c: function create() {
				tr = createElement("tr");
				td0 = createElement("td");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				if (if_block0) if_block0.c();
				text2 = createText("\n        ");
				td1 = createElement("td");
				text3 = createText(text3_value);
				text4 = createText("\n        ");
				td2 = createElement("td");
				if_block1.c();
				text5 = createText("\n        ");
				td3 = createElement("td");
				if (if_block2) if_block2.c();
				text6 = createText("\n    ");
				addLoc(td0, file$4, 10, 8, 322);
				addLoc(td1, file$4, 18, 8, 500);
				addLoc(td2, file$4, 21, 8, 555);
				addLoc(td3, file$4, 29, 8, 936);
				addLoc(tr, file$4, 9, 4, 309);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				append(td0, text0);
				append(tr, text1);
				if (if_block0) if_block0.m(tr, null);
				append(tr, text2);
				append(tr, td1);
				append(td1, text3);
				append(tr, text4);
				append(tr, td2);
				if_block1.m(td2, null);
				append(tr, text5);
				append(tr, td3);
				if (if_block2) if_block2.m(td3, null);
				append(tr, text6);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedUsers) && text0_value !== (text0_value = ctx.user.email)) {
					setData(text0, text0_value);
				}

				if (ctx.isAdmin) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_6(component, ctx);
						if_block0.c();
						if_block0.m(tr, text2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if ((changed.sortedUsers) && text3_value !== (text3_value = ctx.user.charts)) {
					setData(text3, text3_value);
				}

				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(td2, null);
				}

				if (ctx.isAdmin || ctx.isTeamOwner || (!ctx.isTeamOwner && ctx.user.role != 'owner')) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_1$2(component, ctx);
						if_block2.c();
						if_block2.m(td3, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(tr);
				}

				if (if_block0) if_block0.d();
				if_block1.d();
				if (if_block2) if_block2.d();
			}
		};
	}

	function UserTable(options) {
		this._debugName = '<UserTable>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$5(), options.data);

		this._recompute({ isAdmin: 1, isTeamOwner: 1, users: 1, numCharts: 1, team: 1 }, this._state);
		if (!('isAdmin' in this._state)) console.warn("<UserTable> was created without expected data property 'isAdmin'");
		if (!('isTeamOwner' in this._state)) console.warn("<UserTable> was created without expected data property 'isTeamOwner'");
		if (!('users' in this._state)) console.warn("<UserTable> was created without expected data property 'users'");

		if (!('team' in this._state)) console.warn("<UserTable> was created without expected data property 'team'");




		if (!('editId' in this._state)) console.warn("<UserTable> was created without expected data property 'editId'");

		if (!('updating' in this._state)) console.warn("<UserTable> was created without expected data property 'updating'");
		this._intro = true;

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(UserTable.prototype, protoDev);
	assign(UserTable.prototype, methods$2);

	UserTable.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('roles' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'roles'");
		if ('sortedUsers' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'sortedUsers'");
		if ('userHeaders' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'userHeaders'");
		if ('numUsers' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'numUsers'");
		if ('numCharts' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'numCharts'");
		if ('numChartsCaption' in newState && !this._updatingReadonlyProperty) throw new Error("<UserTable>: Cannot set read-only property 'numChartsCaption'");
	};

	UserTable.prototype._recompute = function _recompute(changed, state) {
		if (changed.isAdmin || changed.isTeamOwner) {
			if (this._differs(state.roles, (state.roles = roles(state)))) changed.roles = true;
		}

		if (changed.users || changed.isAdmin) {
			if (this._differs(state.sortedUsers, (state.sortedUsers = sortedUsers(state)))) changed.sortedUsers = true;
		}

		if (changed.isAdmin) {
			if (this._differs(state.userHeaders, (state.userHeaders = userHeaders(state)))) changed.userHeaders = true;
		}

		if (changed.users) {
			if (this._differs(state.numUsers, (state.numUsers = numUsers(state)))) changed.numUsers = true;
			if (this._differs(state.numCharts, (state.numCharts = numCharts(state)))) changed.numCharts = true;
		}

		if (changed.numCharts || changed.isAdmin || changed.team) {
			if (this._differs(state.numChartsCaption, (state.numChartsCaption = numChartsCaption(state)))) changed.numChartsCaption = true;
		}
	};

	/* home/david/Projects/core/libs/controls/v2/BaseDropdown.html generated by Svelte v2.16.1 */

	function data$6() {
	    return {
	        visible: false,
	        disabled: false,
	        width: 'auto'
	    };
	}
	var methods$3 = {
	    toggle(event) {
	        event.preventDefault();
	        const { visible, disabled } = this.get();
	        if (disabled) return;
	        this.set({ visible: !visible });
	    },
	    windowClick(event) {
	        if (
	            !event.target ||
	            (this.refs && this.refs.button && (event.target === this.refs.button || this.refs.button.contains(event.target)))
	        )
	            return;
	        // this is a hack for the colorpicker, need to find out how to get rid of
	        if (event.target.classList.contains('hex')) return;
	        this.set({ visible: false });
	    }
	};

	const file$5 = "home/david/Projects/core/libs/controls/v2/BaseDropdown.html";

	function create_main_fragment$6(component, ctx) {
		var div, a, slot_content_button = component._slotted.button, button, i, i_class_value, text;

		function onwindowclick(event) {
			component.windowClick(event);	}
		window.addEventListener("click", onwindowclick);

		function click_handler(event) {
			component.toggle(event);
		}

		var if_block = (ctx.visible) && create_if_block$5(component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				a = createElement("a");
				if (!slot_content_button) {
					button = createElement("button");
					i = createElement("i");
				}
				text = createText("\n    ");
				if (if_block) if_block.c();
				if (!slot_content_button) {
					i.className = i_class_value = "fa fa-chevron-" + (ctx.visible ? 'up' : 'down') + " svelte-1jdtmzv";
					addLoc(i, file$5, 5, 42, 264);
					button.className = "btn btn-small";
					addLoc(button, file$5, 5, 12, 234);
				}
				addListener(a, "click", click_handler);
				a.href = "#dropdown-btn";
				a.className = "base-drop-btn svelte-1jdtmzv";
				addLoc(a, file$5, 3, 4, 110);
				setStyle(div, "position", "relative");
				setStyle(div, "display", "inline-block");
				addLoc(div, file$5, 2, 0, 49);
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
				if (if_block) if_block.m(div, null);
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
						if_block = create_if_block$5(component, ctx);
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
				if (component.refs.button === a) component.refs.button = null;
				if (if_block) if_block.d();
			}
		};
	}

	// (9:4) {#if visible}
	function create_if_block$5(component, ctx) {
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
					addLoc(div0, file$5, 11, 12, 490);
				}
				setStyle(div1, "width", ctx.width);
				div1.className = "dropdown-menu base-dropdown-content svelte-1jdtmzv";
				addLoc(div1, file$5, 9, 4, 376);
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
		this._state = assign(data$6(), options.data);
		if (!('visible' in this._state)) console.warn("<BaseDropdown> was created without expected data property 'visible'");
		if (!('width' in this._state)) console.warn("<BaseDropdown> was created without expected data property 'width'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(BaseDropdown.prototype, protoDev);
	assign(BaseDropdown.prototype, methods$3);

	BaseDropdown.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/DropdownMenu.html generated by Svelte v2.16.1 */

	function data$7() {
	    return {
	        label: '',
	        icon: false,
	        split: false,
	        items: [],
	        btnClass: 'btn'
	    };
	}
	var methods$4 = {
	    fireClick() {
	        this.fire('click');
	    },
	    action(item) {
	        if (!item.disabled) item.action(this);
	    }
	};

	const file$6 = "home/david/Projects/core/libs/controls/v2/DropdownMenu.html";

	function click_handler$3(event) {
		event.preventDefault();
		const { component, ctx } = this._svelte;

		component.action(ctx.item);
	}

	function get_each_context$3(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.item = list[i];
		return child_ctx;
	}

	function create_main_fragment$7(component, ctx) {
		var div, text0, button, text1, ul;

		var if_block0 = (ctx.split) && create_if_block_3$1(component, ctx);

		function select_block_type(ctx) {
			if (ctx.split) return create_if_block$6;
			return create_else_block$2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type(component, ctx);

		var each_value = ctx.items;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(component, get_each_context$3(ctx, each_value, i));
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
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n        ");
				button = createElement("button");
				if_block1.c();
				text1 = createText("\n\n    ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				basedropdown._fragment.c();
				button.disabled = ctx.disabled;
				button.className = "" + ctx.btnClass + " svelte-1qu0vk";
				addLoc(button, file$6, 67, 8, 1596);
				setAttribute(div, "slot", "button");
				div.className = "btn-group";
				addLoc(div, file$6, 61, 4, 1303);
				setAttribute(ul, "slot", "content");
				ul.className = "svelte-1qu0vk";
				addLoc(ul, file$6, 77, 4, 1940);
			},

			m: function mount(target, anchor) {
				append(basedropdown._slotted.button, div);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				append(div, button);
				if_block1.m(button, null);
				append(basedropdown._slotted.default, text1);
				append(basedropdown._slotted.content, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				basedropdown._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.split) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3$1(component, ctx);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(button, null);
				}

				if (changed.disabled) {
					button.disabled = ctx.disabled;
				}

				if (changed.btnClass) {
					button.className = "" + ctx.btnClass + " svelte-1qu0vk";
				}

				if (changed.items) {
					each_value = ctx.items;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$3(ctx, each_value, i);

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
				if (changed.disabled) basedropdown_changes.disabled = ctx.disabled;
				basedropdown._set(basedropdown_changes);
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d();
				if_block1.d();

				destroyEach(each_blocks, detach);

				basedropdown.destroy(detach);
			}
		};
	}

	// (63:8) {#if split}
	function create_if_block_3$1(component, ctx) {
		var button, text, raw_before, button_class_value;

		var if_block = (ctx.icon) && create_if_block_4$1(component, ctx);

		function click_handler(event) {
			event.preventDefault();
			event.stopPropagation();
			component.fireClick();
		}

		return {
			c: function create() {
				button = createElement("button");
				if (if_block) if_block.c();
				text = createText(" ");
				raw_before = createElement('noscript');
				addListener(button, "click", click_handler);
				button.disabled = ctx.disabled;
				button.className = button_class_value = "split-button-label " + ctx.btnClass + " svelte-1qu0vk";
				addLoc(button, file$6, 63, 8, 1369);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				if (if_block) if_block.m(button, null);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.label);
			},

			p: function update(changed, ctx) {
				if (ctx.icon) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_4$1(component, ctx);
						if_block.c();
						if_block.m(button, text);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.label) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.label);
				}

				if (changed.disabled) {
					button.disabled = ctx.disabled;
				}

				if ((changed.btnClass) && button_class_value !== (button_class_value = "split-button-label " + ctx.btnClass + " svelte-1qu0vk")) {
					button.className = button_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				if (if_block) if_block.d();
				removeListener(button, "click", click_handler);
			}
		};
	}

	// (65:12) {#if icon}
	function create_if_block_4$1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "" + ctx.icon + " svelte-1qu0vk";
				addLoc(i, file$6, 64, 22, 1514);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.icon) {
					i.className = "" + ctx.icon + " svelte-1qu0vk";
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (71:12) {:else}
	function create_else_block$2(component, ctx) {
		var text, if_block1_anchor;

		var if_block0 = (ctx.icon) && create_if_block_2$2(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.label) return create_if_block_1$3;
			return create_else_block_1$1;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block1 = current_block_type(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText(" ");
				if_block1.c();
				if_block1_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text, anchor);
				if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.icon) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2$2(component, ctx);
						if_block0.c();
						if_block0.m(text.parentNode, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text);
				}

				if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (69:12) {#if split}
	function create_if_block$6(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.className = "caret";
				addLoc(span, file$6, 69, 12, 1682);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	// (71:20) {#if icon}
	function create_if_block_2$2(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "" + ctx.icon + " svelte-1qu0vk";
				addLoc(i, file$6, 70, 30, 1740);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.icon) {
					i.className = "" + ctx.icon + " svelte-1qu0vk";
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (72:12) {:else}
	function create_else_block_1$1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "im im-menu-dot-h svelte-1qu0vk";
				addLoc(i, file$6, 72, 12, 1849);
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

	// (71:58) {#if label}
	function create_if_block_1$3(component, ctx) {
		var raw_before, raw_after, text, span;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text = createText(" ");
				span = createElement("span");
				span.className = "caret";
				addLoc(span, file$6, 70, 84, 1794);
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

	// (79:8) {#each items as item}
	function create_each_block$4(component, ctx) {
		var li, a, raw_value = ctx.item.label, text;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				text = createText("\n        ");
				a._svelte = { component, ctx };

				addListener(a, "click", click_handler$3);
				a.href = "#/action";
				a.className = "svelte-1qu0vk";
				toggleClass(a, "disabled", ctx.item.disabled);
				addLoc(a, file$6, 80, 12, 2015);
				li.className = "svelte-1qu0vk";
				addLoc(li, file$6, 79, 8, 1998);
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
		this._state = assign(data$7(), options.data);
		if (!('disabled' in this._state)) console.warn("<DropdownMenu> was created without expected data property 'disabled'");
		if (!('split' in this._state)) console.warn("<DropdownMenu> was created without expected data property 'split'");
		if (!('btnClass' in this._state)) console.warn("<DropdownMenu> was created without expected data property 'btnClass'");
		if (!('icon' in this._state)) console.warn("<DropdownMenu> was created without expected data property 'icon'");
		if (!('label' in this._state)) console.warn("<DropdownMenu> was created without expected data property 'label'");
		if (!('items' in this._state)) console.warn("<DropdownMenu> was created without expected data property 'items'");
		this._intro = true;

		this._fragment = create_main_fragment$7(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(DropdownMenu.prototype, protoDev);
	assign(DropdownMenu.prototype, methods$4);

	DropdownMenu.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/FormBlock.html generated by Svelte v2.16.1 */

	function data$8() {
	    return {
	        label: '',
	        help: '',
	        error: false,
	        success: false,
	        width: 'auto'
	    };
	}
	const file$7 = "home/david/Projects/core/libs/controls/v2/FormBlock.html";

	function create_main_fragment$8(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, text2, text3;

		var if_block0 = (ctx.label) && create_if_block_3$2(component, ctx);

		var if_block1 = (ctx.success) && create_if_block_2$3(component, ctx);

		var if_block2 = (ctx.error) && create_if_block_1$4(component, ctx);

		var if_block3 = (!ctx.success && !ctx.error && ctx.help) && create_if_block$7(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n    ");
				div0 = createElement("div");
				text1 = createText("\n    ");
				if (if_block1) if_block1.c();
				text2 = createText(" ");
				if (if_block2) if_block2.c();
				text3 = createText(" ");
				if (if_block3) if_block3.c();
				div0.className = "form-controls svelte-1nkiaxn";
				addLoc(div0, file$7, 4, 4, 158);
				div1.className = "form-block svelte-1nkiaxn";
				setStyle(div1, "width", ctx.width);
				toggleClass(div1, "success", ctx.success);
				toggleClass(div1, "error", ctx.error);
				addLoc(div1, file$7, 0, 0, 0);
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
				append(div1, text2);
				if (if_block2) if_block2.m(div1, null);
				append(div1, text3);
				if (if_block3) if_block3.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (ctx.label) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3$2(component, ctx);
						if_block0.c();
						if_block0.m(div1, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.success) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2$3(component, ctx);
						if_block1.c();
						if_block1.m(div1, text2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (ctx.error) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block_1$4(component, ctx);
						if_block2.c();
						if_block2.m(div1, text3);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (!ctx.success && !ctx.error && ctx.help) {
					if (if_block3) {
						if_block3.p(changed, ctx);
					} else {
						if_block3 = create_if_block$7(component, ctx);
						if_block3.c();
						if_block3.m(div1, null);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (changed.width) {
					setStyle(div1, "width", ctx.width);
				}

				if (changed.success) {
					toggleClass(div1, "success", ctx.success);
				}

				if (changed.error) {
					toggleClass(div1, "error", ctx.error);
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
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
			}
		};
	}

	// (2:4) {#if label}
	function create_if_block_3$2(component, ctx) {
		var label;

		return {
			c: function create() {
				label = createElement("label");
				label.className = "control-label svelte-1nkiaxn";
				addLoc(label, file$7, 2, 4, 93);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				label.innerHTML = ctx.label;
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					label.innerHTML = ctx.label;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}
			}
		};
	}

	// (8:4) {#if success}
	function create_if_block_2$3(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help success svelte-1nkiaxn";
				addLoc(div, file$7, 8, 4, 236);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.success;
			},

			p: function update(changed, ctx) {
				if (changed.success) {
					div.innerHTML = ctx.success;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (10:10) {#if error}
	function create_if_block_1$4(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help error svelte-1nkiaxn";
				addLoc(div, file$7, 10, 4, 310);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.error;
			},

			p: function update(changed, ctx) {
				if (changed.error) {
					div.innerHTML = ctx.error;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (12:10) {#if !success && !error && help}
	function create_if_block$7(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-1nkiaxn";
				addLoc(div, file$7, 12, 4, 401);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.help;
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function FormBlock(options) {
		this._debugName = '<FormBlock>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$8(), options.data);
		if (!('width' in this._state)) console.warn("<FormBlock> was created without expected data property 'width'");
		if (!('label' in this._state)) console.warn("<FormBlock> was created without expected data property 'label'");
		if (!('success' in this._state)) console.warn("<FormBlock> was created without expected data property 'success'");
		if (!('error' in this._state)) console.warn("<FormBlock> was created without expected data property 'error'");
		if (!('help' in this._state)) console.warn("<FormBlock> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$8(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(FormBlock.prototype, protoDev);

	FormBlock.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* team-settings/tabs/members/InviteUser.html generated by Svelte v2.16.1 */



	function successMessage({ inviteeEmail, currentAction }) {
	    const { isComplete, isError, type, role } = currentAction;
	    if (!isComplete || isError) return;

	    const message = __(`teams / invite-user / ${type} / success`);
	    return message
	        .replace('$1', inviteeEmail)
	        .replace('$2', __(`teams / role / ${role}`));
	}
	function errorMessage({ inviteeEmail, currentAction }) {
	    const { isComplete, isError, errorCode, responseData, type } = currentAction;
	    if (!isComplete || !isError) return;

	    // we only want to show specific error messages
	    // if an error code is known to us,
	    // otherwise we show a generic 'server error' message
	    const errorType = [400, 401, 406].includes(errorCode) ? errorCode : 'other';
	    const maxTeamInvites =
	        errorCode === 406 && responseData && responseData.maxTeamInvites
	            ? responseData.maxTeamInvites
	            : null;

	    const message = __(`teams / invite-user / ${type} / error / ${errorType}`);
	    return message.replace('$1', inviteeEmail).replace('$2', maxTeamInvites);
	}
	function isValidEmail({ inviteeEmail }) {
	    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
	        inviteeEmail
	    );
	}
	function inviteOptions({
	    isAdmin,
	    isTeamOwner,
	    inviteeEmail,
	    isValidEmail,
	    inviteeExistsLoading,
	    inviteeExists
	}) {
	    const options = [
	        {
	            label: `<i class="fa fa-envelope"></i> &nbsp;...${__(
                'teams / role / member'
            )}`,
	            disabled: !isValidEmail,
	            action() {
	                teamSettingsInvite.inviteUser('member');
	            }
	        },
	        {
	            label: `<i class="fa fa-envelope"></i> &nbsp;...${__(
                'teams / role / admin'
            )}`,
	            disabled: !isValidEmail,
	            action() {
	                teamSettingsInvite.inviteUser('admin');
	            }
	        }
	    ];

	    if (isAdmin || isTeamOwner) {
	        options.push({
	            label: `<i class="fa fa-envelope"></i> &nbsp;...${__(
                'teams / role / owner'
            )}`,
	            disabled: !isValidEmail,
	            action() {
	                teamSettingsInvite.inviteUser('owner');
	            }
	        });
	    }

	    if (isAdmin) {
	        options.push(
	            {
	                label: `<span class="red"><i class="fa ${
                    inviteeExistsLoading ? 'fa-spin fa-circle-o-notch' : 'fa-plus'
                }"></i> &nbsp;${__('teams / add-as').replace(
                    '%s',
                    __('teams / role / member')
                )}</span>`,
	                disabled: !inviteeExists,
	                action() {
	                    teamSettingsInvite.addUser('member');
	                }
	            },
	            {
	                label: `<span class="red"><i class="fa ${
                    inviteeExistsLoading ? 'fa-spin fa-circle-o-notch' : 'fa-plus'
                }"></i> &nbsp;${__('teams / add-as').replace(
                    '%s',
                    __('teams / role / admin')
                )}</span>`,
	                disabled: !inviteeExists,
	                action() {
	                    teamSettingsInvite.addUser('admin');
	                }
	            },
	            {
	                label: `<span class="red"><i class="fa ${
                    inviteeExistsLoading ? 'fa-spin fa-circle-o-notch' : 'fa-plus'
                }"></i> &nbsp;${__('teams / add-as').replace(
                    '%s',
                    __('teams / role / owner')
                )}</span>`,
	                disabled: !inviteeExists,
	                action() {
	                    teamSettingsInvite.addUser('owner');
	                }
	            }
	        );
	    }

	    return options;
	}
	function data$9() {
	    return {
	        inviteeEmail: '',
	        currentAction: {
	            updatingUsers: false,
	            isComplete: false,
	            isError: false,
	            errorCode: null,
	            responseData: null,
	            type: '',
	            role: ''
	        }
	    };
	}
	var methods$5 = {
	    async addUser(role) {
	        const { inviteeExists, inviteeUserId } = this.get();
	        if (!inviteeExists) return;

	        this.set({ currentAction: { updatingUsers: true, isComplete: false } });

	        const response = await post(`/v3/teams/${this.get().team.id}/members`, {
	            raw: true,
	            payload: {
	                userId: inviteeUserId,
	                role
	            }
	        });

	        const responseJSON = !response.ok ? await response.json() : null;

	        const currentAction = {
	            updatingUsers: false,
	            isComplete: true,
	            isError: !response.ok,
	            errorCode: !response.ok ? response.status : null,
	            responseData: responseJSON && responseJSON.data ? responseJSON.data : null,
	            type: 'add',
	            role
	        };

	        this.set({ currentAction });
	        this.fire('updateUsers');
	    },
	    async inviteUser(role) {
	        const { inviteeEmail } = this.get();

	        this.set({ currentAction: { updatingUsers: true, isComplete: false } });

	        const response = await post(`/v3/teams/${this.get().team.id}/invites`, {
	            raw: true,
	            payload: {
	                email: inviteeEmail,
	                role
	            }
	        });

	        const responseJSON = !response.ok ? await response.json() : null;

	        const currentAction = {
	            updatingUsers: false,
	            isComplete: true,
	            isError: !response.ok,
	            errorCode: !response.ok ? response.status : null,
	            responseData: responseJSON && responseJSON.data ? responseJSON.data : null,
	            type: 'invite',
	            role
	        };

	        this.set({ currentAction });
	        this.fire('updateUsers');
	    },
	    async debounceCheckUser() {
	        if (!this.get().isAdmin) return;

	        window.clearTimeout(window.checkUser);
	        this.set({ inviteeExistsLoading: true });
	        window.checkUser = setTimeout(() => {
	            this.checkUser();
	        }, 200);
	    },
	    async checkUser() {
	        let { inviteeEmail, isValidEmail } = this.get();
	        if (!isValidEmail) {
	            this.set({ inviteeExistsLoading: false });
	            return;
	        }

	        const json = await get$1(`/v3/users?search=${encodeURIComponent(inviteeEmail)}`);

	        this.set({ inviteeExistsLoading: false, inviteeExists: false });

	        if (json.list.length > 0) {
	            inviteeEmail = this.get().inviteeEmail;
	            json.list.forEach(el => {
	                if (el.email.toLowerCase() === inviteeEmail.toLowerCase()) {
	                    this.set({
	                        inviteeExists: true,
	                        inviteeUserId: el.id
	                    });
	                }
	            });
	        }
	    }
	};

	function oncreate() {
	    window.teamSettingsInvite = this;
	}
	function onstate({ changed, current, previous }) {
	    if (changed.inviteeEmail) {
	        this.set({ inviteeExists: false });
	        this.debounceCheckUser();
	    }
	}
	const file$8 = "team-settings/tabs/members/InviteUser.html";

	function create_main_fragment$9(component, ctx) {
		var div, input, input_updating = false, text;

		function input_input_handler() {
			input_updating = true;
			component.set({ inviteeEmail: input.value });
			input_updating = false;
		}

		var dropdownmenu_initial_data = {
		 	disabled: !ctx.isValidEmail,
		 	label: "<i class='fa " + (ctx.currentAction.updatingUsers ? 'fa-spin fa-circle-o-notch' : 'fa-envelope') + "'></i>  " + __('teams / invite' ),
		 	items: ctx.inviteOptions
		 };
		var dropdownmenu = new DropdownMenu({
			root: component.root,
			store: component.store,
			data: dropdownmenu_initial_data
		});

		var formblock_initial_data = {
		 	label: __('teams / invite-user' ),
		 	help: __('teams / invite-user / help' ),
		 	success: ctx.successMessage,
		 	error: ctx.errorMessage
		 };
		var formblock = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				input = createElement("input");
				text = createText(" \n        ");
				dropdownmenu._fragment.c();
				formblock._fragment.c();
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.width = "1px";
				input.placeholder = __('teams / invite-user / eg' );
				input.className = "svelte-m6ws61";
				addLoc(input, file$8, 7, 8, 190);
				div.className = "flex svelte-m6ws61";
				addLoc(div, file$8, 6, 4, 163);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, div);
				append(div, input);

				input.value = ctx.inviteeEmail;

				append(div, text);
				dropdownmenu._mount(div, null);
				formblock._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.inviteeEmail) input.value = ctx.inviteeEmail;

				var dropdownmenu_changes = {};
				if (changed.isValidEmail) dropdownmenu_changes.disabled = !ctx.isValidEmail;
				if (changed.currentAction) dropdownmenu_changes.label = "<i class='fa " + (ctx.currentAction.updatingUsers ? 'fa-spin fa-circle-o-notch' : 'fa-envelope') + "'></i>  " + __('teams / invite' );
				if (changed.inviteOptions) dropdownmenu_changes.items = ctx.inviteOptions;
				dropdownmenu._set(dropdownmenu_changes);

				var formblock_changes = {};
				if (changed.successMessage) formblock_changes.success = ctx.successMessage;
				if (changed.errorMessage) formblock_changes.error = ctx.errorMessage;
				formblock._set(formblock_changes);
			},

			d: function destroy(detach) {
				removeListener(input, "input", input_input_handler);
				dropdownmenu.destroy();
				formblock.destroy(detach);
			}
		};
	}

	function InviteUser(options) {
		this._debugName = '<InviteUser>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$9(), options.data);

		this._recompute({ inviteeEmail: 1, currentAction: 1, isAdmin: 1, isTeamOwner: 1, isValidEmail: 1, inviteeExistsLoading: 1, inviteeExists: 1 }, this._state);
		if (!('inviteeEmail' in this._state)) console.warn("<InviteUser> was created without expected data property 'inviteeEmail'");
		if (!('currentAction' in this._state)) console.warn("<InviteUser> was created without expected data property 'currentAction'");
		if (!('isAdmin' in this._state)) console.warn("<InviteUser> was created without expected data property 'isAdmin'");
		if (!('isTeamOwner' in this._state)) console.warn("<InviteUser> was created without expected data property 'isTeamOwner'");

		if (!('inviteeExistsLoading' in this._state)) console.warn("<InviteUser> was created without expected data property 'inviteeExistsLoading'");
		if (!('inviteeExists' in this._state)) console.warn("<InviteUser> was created without expected data property 'inviteeExists'");
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$9(this, this._state);

		this.root._oncreate.push(() => {
			oncreate.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(InviteUser.prototype, protoDev);
	assign(InviteUser.prototype, methods$5);

	InviteUser.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('successMessage' in newState && !this._updatingReadonlyProperty) throw new Error("<InviteUser>: Cannot set read-only property 'successMessage'");
		if ('errorMessage' in newState && !this._updatingReadonlyProperty) throw new Error("<InviteUser>: Cannot set read-only property 'errorMessage'");
		if ('isValidEmail' in newState && !this._updatingReadonlyProperty) throw new Error("<InviteUser>: Cannot set read-only property 'isValidEmail'");
		if ('inviteOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<InviteUser>: Cannot set read-only property 'inviteOptions'");
	};

	InviteUser.prototype._recompute = function _recompute(changed, state) {
		if (changed.inviteeEmail || changed.currentAction) {
			if (this._differs(state.successMessage, (state.successMessage = successMessage(state)))) changed.successMessage = true;
			if (this._differs(state.errorMessage, (state.errorMessage = errorMessage(state)))) changed.errorMessage = true;
		}

		if (changed.inviteeEmail) {
			if (this._differs(state.isValidEmail, (state.isValidEmail = isValidEmail(state)))) changed.isValidEmail = true;
		}

		if (changed.isAdmin || changed.isTeamOwner || changed.inviteeEmail || changed.isValidEmail || changed.inviteeExistsLoading || changed.inviteeExists) {
			if (this._differs(state.inviteOptions, (state.inviteOptions = inviteOptions(state)))) changed.inviteOptions = true;
		}
	};

	/* team-settings/tabs/Members.html generated by Svelte v2.16.1 */



	function role$1({ users, userId }) {
	    if (!users || !users.length || !userId) return false;
	    const user = users.find(el => el.id === userId);
	    if (user) return user.role;
	    else return 'admin';
	}
	function data$a() {
	    return {
	        editIndex: 0,
	        updating: {},
	        updatingUsers: false,
	        awaitLoadingUsers: false
	    };
	}
	var methods$6 = {
	    updateUsers() {
	        const { team } = this.get();
	        this.set({
	            awaitLoadingUsers: httpReq
	                .get(`/v3/teams/${team.id}/members?limit=1000`)
	                .then(res => {
	                    this.set({ users: res.list });
	                })
	        });
	    }
	};

	function oncreate$1() {
	    this.updateUsers();
	}
	const file$9 = "team-settings/tabs/Members.html";

	function create_main_fragment$a(component, ctx) {
		var p, raw0_value = __('teams / p'), text0, div2, div0, inviteuser_updating = {}, text1, div1, table, thead, tr0, td0, text2, th0, raw1_value = __('teams / role / member'), text3, th1, raw2_value = __('teams / role / admin'), text4, th2, raw3_value = __('teams / role / owner'), text5, tbody, tr1, td1, raw4_value = __('teams / roles / edit-charts' ), text6, td2, i0, text7, td3, i1, text8, td4, i2, text9, tr2, td5, raw5_value = __('teams / roles / edit-folders' ), text10, td6, i3, text11, td7, i4, text12, td8, i5, text13, tr3, td9, raw6_value = __('teams / roles / access-settings' ), text14, td10, i6, text15, td11, i7, text16, td12, i8, text17, tr4, td13, raw7_value = __('teams / roles / invite-users' ), text18, td14, i9, text19, td15, i10, text20, td16, i11, text21, tr5, td17, raw8_value = __('teams / roles / subscription-options' ), text22, td18, i12, text23, td19, i13, text24, td20, i14, text25, tr6, td21, raw9_value = __('teams / roles / remove-team' ), text26, td22, i15, text27, td23, i16, text28, td24, i17, text29, if_block_anchor;

		var inviteuser_initial_data = {
		 	isTeamOwner: ctx.isTeamOwner,
		 	isAdmin: ctx.isAdmin
		 };
		if (ctx.team
	             !== void 0) {
			inviteuser_initial_data.team = ctx.team
	            ;
			inviteuser_updating.team = true;
		}
		if (ctx.updatingUsers
	             !== void 0) {
			inviteuser_initial_data.updatingUsers = ctx.updatingUsers
	            ;
			inviteuser_updating.updatingUsers = true;
		}
		var inviteuser = new InviteUser({
			root: component.root,
			store: component.store,
			data: inviteuser_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!inviteuser_updating.team && changed.team) {
					newState.team = childState.team;
				}

				if (!inviteuser_updating.updatingUsers && changed.updatingUsers) {
					newState.updatingUsers = childState.updatingUsers;
				}
				component._set(newState);
				inviteuser_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			inviteuser._bind({ team: 1, updatingUsers: 1 }, inviteuser.get());
		});

		inviteuser.on("updateUsers", function(event) {
			component.updateUsers();
		});

		var if_block = (ctx.awaitLoadingUsers) && create_if_block$8(component, ctx);

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText("\n\n");
				div2 = createElement("div");
				div0 = createElement("div");
				inviteuser._fragment.c();
				text1 = createText("\n    ");
				div1 = createElement("div");
				table = createElement("table");
				thead = createElement("thead");
				tr0 = createElement("tr");
				td0 = createElement("td");
				text2 = createText("\n                    ");
				th0 = createElement("th");
				text3 = createText("\n                    ");
				th1 = createElement("th");
				text4 = createText("\n                    ");
				th2 = createElement("th");
				text5 = createText("\n            ");
				tbody = createElement("tbody");
				tr1 = createElement("tr");
				td1 = createElement("td");
				text6 = createText("\n                    ");
				td2 = createElement("td");
				i0 = createElement("i");
				text7 = createText("\n                    ");
				td3 = createElement("td");
				i1 = createElement("i");
				text8 = createText("\n                    ");
				td4 = createElement("td");
				i2 = createElement("i");
				text9 = createText("\n\n                ");
				tr2 = createElement("tr");
				td5 = createElement("td");
				text10 = createText("\n                    ");
				td6 = createElement("td");
				i3 = createElement("i");
				text11 = createText("\n                    ");
				td7 = createElement("td");
				i4 = createElement("i");
				text12 = createText("\n                    ");
				td8 = createElement("td");
				i5 = createElement("i");
				text13 = createText("\n\n                ");
				tr3 = createElement("tr");
				td9 = createElement("td");
				text14 = createText("\n                    ");
				td10 = createElement("td");
				i6 = createElement("i");
				text15 = createText("\n                    ");
				td11 = createElement("td");
				i7 = createElement("i");
				text16 = createText("\n                    ");
				td12 = createElement("td");
				i8 = createElement("i");
				text17 = createText("\n\n                ");
				tr4 = createElement("tr");
				td13 = createElement("td");
				text18 = createText("\n                    ");
				td14 = createElement("td");
				i9 = createElement("i");
				text19 = createText("\n                    ");
				td15 = createElement("td");
				i10 = createElement("i");
				text20 = createText("\n                    ");
				td16 = createElement("td");
				i11 = createElement("i");
				text21 = createText("\n\n                ");
				tr5 = createElement("tr");
				td17 = createElement("td");
				text22 = createText("\n                    ");
				td18 = createElement("td");
				i12 = createElement("i");
				text23 = createText("\n                    ");
				td19 = createElement("td");
				i13 = createElement("i");
				text24 = createText("\n                    ");
				td20 = createElement("td");
				i14 = createElement("i");
				text25 = createText("\n\n                ");
				tr6 = createElement("tr");
				td21 = createElement("td");
				text26 = createText("\n                    ");
				td22 = createElement("td");
				i15 = createElement("i");
				text27 = createText("\n                    ");
				td23 = createElement("td");
				i16 = createElement("i");
				text28 = createText("\n                    ");
				td24 = createElement("td");
				i17 = createElement("i");
				text29 = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				setStyle(p, "margin-bottom", "10px");
				addLoc(p, file$9, 0, 0, 0);
				div0.className = "span4";
				addLoc(div0, file$9, 5, 4, 118);
				td0.className = "svelte-hgmegl";
				addLoc(td0, file$9, 18, 20, 501);
				th0.className = "svelte-hgmegl";
				addLoc(th0, file$9, 19, 20, 528);
				th1.className = "svelte-hgmegl";
				addLoc(th1, file$9, 20, 20, 593);
				th2.className = "svelte-hgmegl";
				addLoc(th2, file$9, 21, 20, 657);
				addLoc(tr0, file$9, 17, 16, 476);
				addLoc(thead, file$9, 16, 12, 452);
				td1.className = "svelte-hgmegl";
				addLoc(td1, file$9, 26, 20, 805);
				i0.className = "im im-check-mark svelte-hgmegl";
				addLoc(i0, file$9, 27, 24, 883);
				td2.className = "svelte-hgmegl";
				addLoc(td2, file$9, 27, 20, 879);
				i1.className = "im im-check-mark svelte-hgmegl";
				addLoc(i1, file$9, 28, 24, 945);
				td3.className = "svelte-hgmegl";
				addLoc(td3, file$9, 28, 20, 941);
				i2.className = "im im-check-mark svelte-hgmegl";
				addLoc(i2, file$9, 29, 24, 1007);
				td4.className = "svelte-hgmegl";
				addLoc(td4, file$9, 29, 20, 1003);
				addLoc(tr1, file$9, 25, 16, 780);
				td5.className = "svelte-hgmegl";
				addLoc(td5, file$9, 33, 20, 1109);
				i3.className = "im im-check-mark svelte-hgmegl";
				addLoc(i3, file$9, 34, 24, 1188);
				td6.className = "svelte-hgmegl";
				addLoc(td6, file$9, 34, 20, 1184);
				i4.className = "im im-check-mark svelte-hgmegl";
				addLoc(i4, file$9, 35, 24, 1250);
				td7.className = "svelte-hgmegl";
				addLoc(td7, file$9, 35, 20, 1246);
				i5.className = "im im-check-mark svelte-hgmegl";
				addLoc(i5, file$9, 36, 24, 1312);
				td8.className = "svelte-hgmegl";
				addLoc(td8, file$9, 36, 20, 1308);
				addLoc(tr2, file$9, 32, 16, 1084);
				td9.className = "svelte-hgmegl";
				addLoc(td9, file$9, 40, 20, 1414);
				i6.className = "im im-x-mark svelte-hgmegl";
				addLoc(i6, file$9, 41, 24, 1496);
				td10.className = "svelte-hgmegl";
				addLoc(td10, file$9, 41, 20, 1492);
				i7.className = "im im-check-mark svelte-hgmegl";
				addLoc(i7, file$9, 42, 24, 1554);
				td11.className = "svelte-hgmegl";
				addLoc(td11, file$9, 42, 20, 1550);
				i8.className = "im im-check-mark svelte-hgmegl";
				addLoc(i8, file$9, 43, 24, 1616);
				td12.className = "svelte-hgmegl";
				addLoc(td12, file$9, 43, 20, 1612);
				addLoc(tr3, file$9, 39, 16, 1389);
				td13.className = "svelte-hgmegl";
				addLoc(td13, file$9, 47, 20, 1718);
				i9.className = "im im-x-mark svelte-hgmegl";
				addLoc(i9, file$9, 48, 24, 1797);
				td14.className = "svelte-hgmegl";
				addLoc(td14, file$9, 48, 20, 1793);
				i10.className = "im im-check-mark svelte-hgmegl";
				addLoc(i10, file$9, 49, 24, 1855);
				td15.className = "svelte-hgmegl";
				addLoc(td15, file$9, 49, 20, 1851);
				i11.className = "im im-check-mark svelte-hgmegl";
				addLoc(i11, file$9, 50, 24, 1917);
				td16.className = "svelte-hgmegl";
				addLoc(td16, file$9, 50, 20, 1913);
				addLoc(tr4, file$9, 46, 16, 1693);
				td17.className = "svelte-hgmegl";
				addLoc(td17, file$9, 54, 20, 2019);
				i12.className = "im im-x-mark svelte-hgmegl";
				addLoc(i12, file$9, 55, 24, 2106);
				td18.className = "svelte-hgmegl";
				addLoc(td18, file$9, 55, 20, 2102);
				i13.className = "im im-x-mark svelte-hgmegl";
				addLoc(i13, file$9, 56, 24, 2164);
				td19.className = "svelte-hgmegl";
				addLoc(td19, file$9, 56, 20, 2160);
				i14.className = "im im-check-mark svelte-hgmegl";
				addLoc(i14, file$9, 57, 24, 2222);
				td20.className = "svelte-hgmegl";
				addLoc(td20, file$9, 57, 20, 2218);
				addLoc(tr5, file$9, 53, 16, 1994);
				td21.className = "svelte-hgmegl";
				addLoc(td21, file$9, 61, 20, 2324);
				i15.className = "im im-x-mark svelte-hgmegl";
				addLoc(i15, file$9, 62, 24, 2402);
				td22.className = "svelte-hgmegl";
				addLoc(td22, file$9, 62, 20, 2398);
				i16.className = "im im-x-mark svelte-hgmegl";
				addLoc(i16, file$9, 63, 24, 2460);
				td23.className = "svelte-hgmegl";
				addLoc(td23, file$9, 63, 20, 2456);
				i17.className = "im im-check-mark svelte-hgmegl";
				addLoc(i17, file$9, 64, 24, 2518);
				td24.className = "svelte-hgmegl";
				addLoc(td24, file$9, 64, 20, 2514);
				addLoc(tr6, file$9, 60, 16, 2299);
				tbody.className = "svelte-hgmegl";
				addLoc(tbody, file$9, 24, 12, 756);
				table.className = "role-descriptions svelte-hgmegl";
				setStyle(table, "margin-left", "3em");
				addLoc(table, file$9, 15, 8, 380);
				div1.className = "span6";
				addLoc(div1, file$9, 14, 4, 352);
				div2.className = "row";
				setStyle(div2, "margin-bottom", "2em");
				addLoc(div2, file$9, 4, 0, 68);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw0_value;
				insert(target, text0, anchor);
				insert(target, div2, anchor);
				append(div2, div0);
				inviteuser._mount(div0, null);
				append(div2, text1);
				append(div2, div1);
				append(div1, table);
				append(table, thead);
				append(thead, tr0);
				append(tr0, td0);
				append(tr0, text2);
				append(tr0, th0);
				th0.innerHTML = raw1_value;
				append(tr0, text3);
				append(tr0, th1);
				th1.innerHTML = raw2_value;
				append(tr0, text4);
				append(tr0, th2);
				th2.innerHTML = raw3_value;
				append(table, text5);
				append(table, tbody);
				append(tbody, tr1);
				append(tr1, td1);
				td1.innerHTML = raw4_value;
				append(tr1, text6);
				append(tr1, td2);
				append(td2, i0);
				append(tr1, text7);
				append(tr1, td3);
				append(td3, i1);
				append(tr1, text8);
				append(tr1, td4);
				append(td4, i2);
				append(tbody, text9);
				append(tbody, tr2);
				append(tr2, td5);
				td5.innerHTML = raw5_value;
				append(tr2, text10);
				append(tr2, td6);
				append(td6, i3);
				append(tr2, text11);
				append(tr2, td7);
				append(td7, i4);
				append(tr2, text12);
				append(tr2, td8);
				append(td8, i5);
				append(tbody, text13);
				append(tbody, tr3);
				append(tr3, td9);
				td9.innerHTML = raw6_value;
				append(tr3, text14);
				append(tr3, td10);
				append(td10, i6);
				append(tr3, text15);
				append(tr3, td11);
				append(td11, i7);
				append(tr3, text16);
				append(tr3, td12);
				append(td12, i8);
				append(tbody, text17);
				append(tbody, tr4);
				append(tr4, td13);
				td13.innerHTML = raw7_value;
				append(tr4, text18);
				append(tr4, td14);
				append(td14, i9);
				append(tr4, text19);
				append(tr4, td15);
				append(td15, i10);
				append(tr4, text20);
				append(tr4, td16);
				append(td16, i11);
				append(tbody, text21);
				append(tbody, tr5);
				append(tr5, td17);
				td17.innerHTML = raw8_value;
				append(tr5, text22);
				append(tr5, td18);
				append(td18, i12);
				append(tr5, text23);
				append(tr5, td19);
				append(td19, i13);
				append(tr5, text24);
				append(tr5, td20);
				append(td20, i14);
				append(tbody, text25);
				append(tbody, tr6);
				append(tr6, td21);
				td21.innerHTML = raw9_value;
				append(tr6, text26);
				append(tr6, td22);
				append(td22, i15);
				append(tr6, text27);
				append(tr6, td23);
				append(td23, i16);
				append(tr6, text28);
				append(tr6, td24);
				append(td24, i17);
				insert(target, text29, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var inviteuser_changes = {};
				if (changed.isTeamOwner) inviteuser_changes.isTeamOwner = ctx.isTeamOwner;
				if (changed.isAdmin) inviteuser_changes.isAdmin = ctx.isAdmin;
				if (!inviteuser_updating.team && changed.team) {
					inviteuser_changes.team = ctx.team
	            ;
					inviteuser_updating.team = ctx.team
	             !== void 0;
				}
				if (!inviteuser_updating.updatingUsers && changed.updatingUsers) {
					inviteuser_changes.updatingUsers = ctx.updatingUsers
	            ;
					inviteuser_updating.updatingUsers = ctx.updatingUsers
	             !== void 0;
				}
				inviteuser._set(inviteuser_changes);
				inviteuser_updating = {};

				if (ctx.awaitLoadingUsers) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$8(component, ctx);
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
					detachNode(p);
					detachNode(text0);
					detachNode(div2);
				}

				inviteuser.destroy();
				if (detach) {
					detachNode(text29);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (72:0) {#if awaitLoadingUsers}
	function create_if_block$8(component, ctx) {
		var await_block_anchor, promise;

		let info = {
			component,
			ctx,
			current: null,
			pending: create_pending_block,
			then: create_then_block,
			catch: create_catch_block,
			value: 'null',
			error: 'null'
		};

		handlePromise(promise = ctx.awaitLoadingUsers, info);

		return {
			c: function create() {
				await_block_anchor = createComment();

				info.block.c();
			},

			m: function mount(target, anchor) {
				insert(target, await_block_anchor, anchor);

				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				info.ctx = ctx;

				if (('awaitLoadingUsers' in changed) && promise !== (promise = ctx.awaitLoadingUsers) && handlePromise(promise, info)) ; else {
					info.block.p(changed, assign(assign({}, ctx), info.resolved));
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(await_block_anchor);
				}

				info.block.d(detach);
				info = null;
			}
		};
	}

	// (83:0) {:catch}
	function create_catch_block(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("error!");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (74:0) {:then}
	function create_then_block(component, ctx) {
		var usertable_updating = {};

		var usertable_initial_data = {
		 	isAdmin: ctx.isAdmin,
		 	isTeamOwner: ctx.isTeamOwner,
		 	team: ctx.team
		 };
		if (ctx.users
	     !== void 0) {
			usertable_initial_data.users = ctx.users
	    ;
			usertable_updating.users = true;
		}
		if (ctx.editIndex
	     !== void 0) {
			usertable_initial_data.editIndex = ctx.editIndex
	    ;
			usertable_updating.editIndex = true;
		}
		if (ctx.updating
	 !== void 0) {
			usertable_initial_data.updating = ctx.updating
	;
			usertable_updating.updating = true;
		}
		var usertable = new UserTable({
			root: component.root,
			store: component.store,
			data: usertable_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!usertable_updating.users && changed.users) {
					newState.users = childState.users;
				}

				if (!usertable_updating.editIndex && changed.editIndex) {
					newState.editIndex = childState.editIndex;
				}

				if (!usertable_updating.updating && changed.updating) {
					newState.updating = childState.updating;
				}
				component._set(newState);
				usertable_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			usertable._bind({ users: 1, editIndex: 1, updating: 1 }, usertable.get());
		});

		return {
			c: function create() {
				usertable._fragment.c();
			},

			m: function mount(target, anchor) {
				usertable._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var usertable_changes = {};
				if (changed.isAdmin) usertable_changes.isAdmin = ctx.isAdmin;
				if (changed.isTeamOwner) usertable_changes.isTeamOwner = ctx.isTeamOwner;
				if (changed.team) usertable_changes.team = ctx.team;
				if (!usertable_updating.users && changed.users) {
					usertable_changes.users = ctx.users
	    ;
					usertable_updating.users = ctx.users
	     !== void 0;
				}
				if (!usertable_updating.editIndex && changed.editIndex) {
					usertable_changes.editIndex = ctx.editIndex
	    ;
					usertable_updating.editIndex = ctx.editIndex
	     !== void 0;
				}
				if (!usertable_updating.updating && changed.updating) {
					usertable_changes.updating = ctx.updating
	;
					usertable_updating.updating = ctx.updating
	 !== void 0;
				}
				usertable._set(usertable_changes);
				usertable_updating = {};
			},

			d: function destroy(detach) {
				usertable.destroy(detach);
			}
		};
	}

	// (72:50)  <p><i class="fa fa-circle-o-notch fa-spin"></i> &nbsp; { @html __('teams / loading' ) }
	function create_pending_block(component, ctx) {
		var p, i, text, raw_value = __('teams / loading' ), raw_before;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText("   ");
				raw_before = createElement('noscript');
				i.className = "fa fa-circle-o-notch fa-spin";
				addLoc(i, file$9, 72, 3, 2689);
				addLoc(p, file$9, 72, 0, 2686);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text);
				append(p, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function Members(options) {
		this._debugName = '<Members>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$a(), options.data);

		this._recompute({ users: 1, userId: 1 }, this._state);
		if (!('users' in this._state)) console.warn("<Members> was created without expected data property 'users'");
		if (!('userId' in this._state)) console.warn("<Members> was created without expected data property 'userId'");
		if (!('team' in this._state)) console.warn("<Members> was created without expected data property 'team'");
		if (!('isTeamOwner' in this._state)) console.warn("<Members> was created without expected data property 'isTeamOwner'");
		if (!('isAdmin' in this._state)) console.warn("<Members> was created without expected data property 'isAdmin'");
		if (!('updatingUsers' in this._state)) console.warn("<Members> was created without expected data property 'updatingUsers'");
		if (!('awaitLoadingUsers' in this._state)) console.warn("<Members> was created without expected data property 'awaitLoadingUsers'");
		if (!('editIndex' in this._state)) console.warn("<Members> was created without expected data property 'editIndex'");
		if (!('updating' in this._state)) console.warn("<Members> was created without expected data property 'updating'");
		this._intro = true;

		this._fragment = create_main_fragment$a(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$1.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Members.prototype, protoDev);
	assign(Members.prototype, methods$6);

	Members.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('role' in newState && !this._updatingReadonlyProperty) throw new Error("<Members>: Cannot set read-only property 'role'");
	};

	Members.prototype._recompute = function _recompute(changed, state) {
		if (changed.users || changed.userId) {
			if (this._differs(state.role, (state.role = role$1(state)))) changed.role = true;
		}
	};

	/* home/david/Projects/core/libs/controls/v2/Radio.html generated by Svelte v2.16.1 */

	function data$b() {
	    return {
	        value: null,
	        disabled: false,
	        disabled_msg: '',
	        indeterminate: false,
	        width: 'auto',
	        valign: 'top',
	        inline: true
	    };
	}
	function onstate$1({ changed, previous }) {
	    if (previous && changed.value) {
	        this.set({ indeterminate: false });
	    }
	}
	const file$a = "home/david/Projects/core/libs/controls/v2/Radio.html";

	function get_each_context$4(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		return child_ctx;
	}

	function create_main_fragment$b(component, ctx) {
		var div, text0, slot_content_default = component._slotted.default, slot_content_default_before, text1, if_block_anchor;

		var each_value = ctx.options;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(component, get_each_context$4(ctx, each_value, i));
		}

		var controlgroup_initial_data = {
		 	type: "radio",
		 	width: ctx.width,
		 	valign: ctx.valign,
		 	label: ctx.label,
		 	disabled: ctx.disabled
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block = (ctx.disabled && ctx.disabled_msg) && create_if_block$9(component, ctx);

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text0 = createText("\n    ");
				controlgroup._fragment.c();
				text1 = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				div.className = "svelte-1qlzejw";
				toggleClass(div, "inline", ctx.inline);
				toggleClass(div, "indeterminate", ctx.indeterminate);
				addLoc(div, file$a, 1, 4, 68);
			},

			m: function mount(target, anchor) {
				append(controlgroup._slotted.default, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				append(controlgroup._slotted.default, text0);

				if (slot_content_default) {
					append(controlgroup._slotted.default, slot_content_default_before || (slot_content_default_before = createComment()));
					append(controlgroup._slotted.default, slot_content_default);
				}

				controlgroup._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.options || changed.disabled || changed.value) {
					each_value = ctx.options;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);

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

				if (changed.inline) {
					toggleClass(div, "inline", ctx.inline);
				}

				if (changed.indeterminate) {
					toggleClass(div, "indeterminate", ctx.indeterminate);
				}

				var controlgroup_changes = {};
				if (changed.width) controlgroup_changes.width = ctx.width;
				if (changed.valign) controlgroup_changes.valign = ctx.valign;
				if (changed.label) controlgroup_changes.label = ctx.label;
				if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;
				controlgroup._set(controlgroup_changes);

				if (ctx.disabled && ctx.disabled_msg) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$9(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
				}

				controlgroup.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (9:12) {#if opt.help}
	function create_if_block_1$5(component, ctx) {
		var div, raw_value = ctx.opt.help;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-1qlzejw";
				addLoc(div, file$a, 9, 12, 475);
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
	function create_each_block$5(component, ctx) {
		var label, input, input_value_value, text0, span0, text1, span1, raw_value = ctx.opt.label, text2, label_title_value;

		function input_change_handler() {
			component.set({ value: input.__value });
		}

		var if_block = (ctx.opt.help) && create_if_block_1$5(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				text0 = createText("\n            ");
				span0 = createElement("span");
				text1 = createText(" ");
				span1 = createElement("span");
				text2 = createText("\n            ");
				if (if_block) if_block.c();
				component._bindingGroups[0].push(input);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "radio");
				input.__value = input_value_value = ctx.opt.value;
				input.value = input.__value;
				input.disabled = ctx.disabled;
				input.className = "svelte-1qlzejw";
				addLoc(input, file$a, 4, 12, 233);
				span0.className = "css-ui svelte-1qlzejw";
				addLoc(span0, file$a, 5, 12, 320);
				span1.className = "inner-label svelte-1qlzejw";
				addLoc(span1, file$a, 5, 46, 354);
				label.title = label_title_value = ctx.opt.tooltip||'';
				label.className = "svelte-1qlzejw";
				toggleClass(label, "disabled", ctx.disabled);
				toggleClass(label, "has-help", ctx.opt.help);
				addLoc(label, file$a, 3, 8, 146);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, input);

				input.checked = input.__value === ctx.value;

				append(label, text0);
				append(label, span0);
				append(label, text1);
				append(label, span1);
				span1.innerHTML = raw_value;
				append(label, text2);
				if (if_block) if_block.m(label, null);
			},

			p: function update(changed, ctx) {
				if (changed.value) input.checked = input.__value === ctx.value;
				if ((changed.options) && input_value_value !== (input_value_value = ctx.opt.value)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if ((changed.options) && raw_value !== (raw_value = ctx.opt.label)) {
					span1.innerHTML = raw_value;
				}

				if (ctx.opt.help) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$5(component, ctx);
						if_block.c();
						if_block.m(label, null);
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
				if (if_block) if_block.d();
			}
		};
	}

	// (20:0) {#if disabled && disabled_msg}
	function create_if_block$9(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "disabled-message svelte-1qlzejw";
				addLoc(div, file$a, 20, 0, 669);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.disabled_msg;
			},

			p: function update(changed, ctx) {
				if (changed.disabled_msg) {
					div.innerHTML = ctx.disabled_msg;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function Radio(options) {
		this._debugName = '<Radio>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$b(), options.data);
		if (!('width' in this._state)) console.warn("<Radio> was created without expected data property 'width'");
		if (!('valign' in this._state)) console.warn("<Radio> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<Radio> was created without expected data property 'label'");
		if (!('disabled' in this._state)) console.warn("<Radio> was created without expected data property 'disabled'");
		if (!('options' in this._state)) console.warn("<Radio> was created without expected data property 'options'");
		if (!('value' in this._state)) console.warn("<Radio> was created without expected data property 'value'");
		if (!('disabled_msg' in this._state)) console.warn("<Radio> was created without expected data property 'disabled_msg'");
		this._bindingGroups = [[]];
		this._intro = true;

		this._handlers.state = [onstate$1];

		this._slotted = options.slots || {};

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$b(this, this._state);

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

	assign(Radio.prototype, protoDev);

	Radio.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* team-settings/tabs/Settings.html generated by Svelte v2.16.1 */



	function localeOptions({ locales }) {
	    return [
	        {
	            value: null,
	            label: __('teams / defaults / none', 'organizations')
	        },
	        ...locales
	    ];
	}
	function data$c() {
	    return {
	        embedCodes: [
	            { value: 'responsive', label: __('teams / defaults / responsive-iframe') },
	            { value: 'iframe', label: __('teams / defaults / iframe') },
	            { value: 'custom', label: __('teams / defaults / custom') }
	        ],
	        themes: [],
	        folders: [],
	        locales: [],
	        defaultTheme: '',
	        settings: {},
	        team: {}
	    };
	}
	function onstate$2({ changed, current, previous }) {
	    if (current.settings && (changed.settings || changed.team || changed.defaultTheme)) {
	        this.fire('change', {
	            team: current.team,
	            settings: current.settings,
	            defaultTheme: current.defaultTheme
	        });
	    }
	}
	const file$b = "team-settings/tabs/Settings.html";

	function create_main_fragment$c(component, ctx) {
		var div1, div0, p, raw_value = __('teams / defaults / p'), text0, input, input_updating = false, text1, radio0_updating = {}, text2, h3, text4, baseselect0_updating = {}, text5, baseselect1_updating = {}, text6, baseselect2_updating = {}, text7, radio1_updating = {}, text8;

		function input_input_handler() {
			input_updating = true;
			ctx.team.name = input.value;
			component.set({ team: ctx.team });
			input_updating = false;
		}

		var formblock0_initial_data = { label: __('teams / name' ), help: __('teams / name / help' ) };
		var formblock0 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock0_initial_data
		});

		var radio0_initial_data = { label: "", options: [ {label: __('teams / defaults / expanded' ), value: 'expanded'}, {label: __('teams / defaults / collapsed' ), value: 'collapsed'}] };
		if (ctx.settings.folders !== void 0) {
			radio0_initial_data.value = ctx.settings.folders;
			radio0_updating.value = true;
		}
		var radio0 = new Radio({
			root: component.root,
			store: component.store,
			data: radio0_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!radio0_updating.value && changed.value) {
					ctx.settings.folders = childState.value;
					newState.settings = ctx.settings;
				}
				component._set(newState);
				radio0_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			radio0._bind({ value: 1 }, radio0.get());
		});

		var formblock1_initial_data = { label: __('teams / defaults / folder-status' ), help: __('teams / defaults / folder-status / p' ) };
		var formblock1 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock1_initial_data
		});

		var baseselect0_initial_data = { options: ctx.themes };
		if (ctx.defaultTheme !== void 0) {
			baseselect0_initial_data.value = ctx.defaultTheme;
			baseselect0_updating.value = true;
		}
		var baseselect0 = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect0_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!baseselect0_updating.value && changed.value) {
					newState.defaultTheme = childState.value;
				}
				component._set(newState);
				baseselect0_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			baseselect0._bind({ value: 1 }, baseselect0.get());
		});

		var formblock2_initial_data = { label: __('teams / defaults / theme' ), help: __('teams / defaults / theme / p' ) };
		var formblock2 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock2_initial_data
		});

		var baseselect1_initial_data = { options: ctx.folders };
		if (ctx.settings.default.folder !== void 0) {
			baseselect1_initial_data.value = ctx.settings.default.folder;
			baseselect1_updating.value = true;
		}
		var baseselect1 = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect1_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!baseselect1_updating.value && changed.value) {
					ctx.settings.default.folder = childState.value;
					newState.settings = ctx.settings;
				}
				component._set(newState);
				baseselect1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			baseselect1._bind({ value: 1 }, baseselect1.get());
		});

		var formblock3_initial_data = {
		 	label: __('teams / defaults / folder' ),
		 	help: __('teams / defaults / folder / p' )
		 };
		var formblock3 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock3_initial_data
		});

		var baseselect2_initial_data = { options: ctx.localeOptions };
		if (ctx.settings.default.locale !== void 0) {
			baseselect2_initial_data.value = ctx.settings.default.locale;
			baseselect2_updating.value = true;
		}
		var baseselect2 = new BaseSelect({
			root: component.root,
			store: component.store,
			data: baseselect2_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!baseselect2_updating.value && changed.value) {
					ctx.settings.default.locale = childState.value;
					newState.settings = ctx.settings;
				}
				component._set(newState);
				baseselect2_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			baseselect2._bind({ value: 1 }, baseselect2.get());
		});

		var formblock4_initial_data = {
		 	label: __('teams / defaults / locale' ),
		 	help: __('teams / defaults / locale / p' )
		 };
		var formblock4 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock4_initial_data
		});

		var radio1_initial_data = { label: "", options: ctx.embedCodes };
		if (ctx.settings.embed.preferred_embed !== void 0) {
			radio1_initial_data.value = ctx.settings.embed.preferred_embed;
			radio1_updating.value = true;
		}
		var radio1 = new Radio({
			root: component.root,
			store: component.store,
			data: radio1_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!radio1_updating.value && changed.value) {
					ctx.settings.embed.preferred_embed = childState.value;
					newState.settings = ctx.settings;
				}
				component._set(newState);
				radio1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			radio1._bind({ value: 1 }, radio1.get());
		});

		var formblock5_initial_data = {
		 	label: __('teams / defaults / embedcode' ),
		 	help: __('teams / defaults / embedcode / p' )
		 };
		var formblock5 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock5_initial_data
		});

		var if_block = (ctx.settings.embed.preferred_embed == "custom") && create_if_block$a(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				p = createElement("p");
				text0 = createText("\n\n        ");
				input = createElement("input");
				formblock0._fragment.c();
				text1 = createText("\n\n        ");
				radio0._fragment.c();
				formblock1._fragment.c();
				text2 = createText("\n\n        ");
				h3 = createElement("h3");
				h3.textContent = "Default settings for new visualizations";
				text4 = createText("\n\n        ");
				baseselect0._fragment.c();
				formblock2._fragment.c();
				text5 = createText("\n\n        ");
				baseselect1._fragment.c();
				formblock3._fragment.c();
				text6 = createText("\n\n        ");
				baseselect2._fragment.c();
				formblock4._fragment.c();
				text7 = createText("\n\n        ");
				radio1._fragment.c();
				formblock5._fragment.c();
				text8 = createText("\n\n        ");
				if (if_block) if_block.c();
				setStyle(p, "margin-bottom", "10px");
				addLoc(p, file$b, 2, 8, 50);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.placeholder = "";
				addLoc(input, file$b, 7, 12, 243);
				addLoc(h3, file$b, 21, 8, 781);
				div0.className = "span6";
				addLoc(div0, file$b, 1, 4, 22);
				div1.className = "row";
				addLoc(div1, file$b, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, p);
				p.innerHTML = raw_value;
				append(div0, text0);
				append(formblock0._slotted.default, input);

				input.value = ctx.team.name;

				formblock0._mount(div0, null);
				append(div0, text1);
				radio0._mount(formblock1._slotted.default, null);
				formblock1._mount(div0, null);
				append(div0, text2);
				append(div0, h3);
				append(div0, text4);
				baseselect0._mount(formblock2._slotted.default, null);
				formblock2._mount(div0, null);
				append(div0, text5);
				baseselect1._mount(formblock3._slotted.default, null);
				formblock3._mount(div0, null);
				append(div0, text6);
				baseselect2._mount(formblock4._slotted.default, null);
				formblock4._mount(div0, null);
				append(div0, text7);
				radio1._mount(formblock5._slotted.default, null);
				formblock5._mount(div0, null);
				append(div0, text8);
				if (if_block) if_block.m(div0, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input_updating && changed.team) input.value = ctx.team.name;

				var radio0_changes = {};
				if (!radio0_updating.value && changed.settings) {
					radio0_changes.value = ctx.settings.folders;
					radio0_updating.value = ctx.settings.folders !== void 0;
				}
				radio0._set(radio0_changes);
				radio0_updating = {};

				var baseselect0_changes = {};
				if (changed.themes) baseselect0_changes.options = ctx.themes;
				if (!baseselect0_updating.value && changed.defaultTheme) {
					baseselect0_changes.value = ctx.defaultTheme;
					baseselect0_updating.value = ctx.defaultTheme !== void 0;
				}
				baseselect0._set(baseselect0_changes);
				baseselect0_updating = {};

				var baseselect1_changes = {};
				if (changed.folders) baseselect1_changes.options = ctx.folders;
				if (!baseselect1_updating.value && changed.settings) {
					baseselect1_changes.value = ctx.settings.default.folder;
					baseselect1_updating.value = ctx.settings.default.folder !== void 0;
				}
				baseselect1._set(baseselect1_changes);
				baseselect1_updating = {};

				var baseselect2_changes = {};
				if (changed.localeOptions) baseselect2_changes.options = ctx.localeOptions;
				if (!baseselect2_updating.value && changed.settings) {
					baseselect2_changes.value = ctx.settings.default.locale;
					baseselect2_updating.value = ctx.settings.default.locale !== void 0;
				}
				baseselect2._set(baseselect2_changes);
				baseselect2_updating = {};

				var radio1_changes = {};
				if (changed.embedCodes) radio1_changes.options = ctx.embedCodes;
				if (!radio1_updating.value && changed.settings) {
					radio1_changes.value = ctx.settings.embed.preferred_embed;
					radio1_updating.value = ctx.settings.embed.preferred_embed !== void 0;
				}
				radio1._set(radio1_changes);
				radio1_updating = {};

				if (ctx.settings.embed.preferred_embed == "custom") {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$a(component, ctx);
						if_block.c();
						if_block.m(div0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(input, "input", input_input_handler);
				formblock0.destroy();
				radio0.destroy();
				formblock1.destroy();
				baseselect0.destroy();
				formblock2.destroy();
				baseselect1.destroy();
				formblock3.destroy();
				baseselect2.destroy();
				formblock4.destroy();
				radio1.destroy();
				formblock5.destroy();
				if (if_block) if_block.d();
			}
		};
	}

	// (56:8) {#if settings.embed.preferred_embed == "custom"}
	function create_if_block$a(component, ctx) {
		var h3, text1, input, input_updating = false, text2, textarea0, textarea0_updating = false, text3, textarea1, textarea1_updating = false, text4, hr;

		function input_input_handler() {
			input_updating = true;
			ctx.settings.embed.custom_embed.title = input.value;
			component.set({ settings: ctx.settings });
			input_updating = false;
		}

		var formblock0_initial_data = { label: __('teams / custom / title' ), help: "" };
		var formblock0 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock0_initial_data
		});

		function textarea0_input_handler() {
			textarea0_updating = true;
			ctx.settings.embed.custom_embed.text = textarea0.value;
			component.set({ settings: ctx.settings });
			textarea0_updating = false;
		}

		var formblock1_initial_data = { label: __('teams / custom / help' ), help: "" };
		var formblock1 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock1_initial_data
		});

		function textarea1_input_handler() {
			textarea1_updating = true;
			ctx.settings.embed.custom_embed.template = textarea1.value;
			component.set({ settings: ctx.settings });
			textarea1_updating = false;
		}

		var formblock2_initial_data = {
		 	label: __('teams / custom / embedcode' ),
		 	help: __('teams / custom / embedcode / help' )
		 };
		var formblock2 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock2_initial_data
		});

		return {
			c: function create() {
				h3 = createElement("h3");
				h3.textContent = "Custom Embed Code";
				text1 = createText("\n\n        ");
				input = createElement("input");
				formblock0._fragment.c();
				text2 = createText("\n\n        ");
				textarea0 = createElement("textarea");
				formblock1._fragment.c();
				text3 = createText("\n\n        ");
				textarea1 = createElement("textarea");
				formblock2._fragment.c();
				text4 = createText("\n        ");
				hr = createElement("hr");
				addLoc(h3, file$b, 56, 8, 1997);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.placeholder = "e.g. Custom CMS Embed";
				addLoc(input, file$b, 59, 12, 2107);
				addListener(textarea0, "input", textarea0_input_handler);
				textarea0.placeholder = "e.g. This is a custom embed code for our CMS";
				addLoc(textarea0, file$b, 67, 12, 2375);
				addListener(textarea1, "input", textarea1_input_handler);
				textarea1.className = "embedcode svelte-rgtu7e";
				textarea1.placeholder = "<iframe src=\"%chart_url%\" width=\"%chart_width%\" widthheight=\"%chart_height%\"></iframe>";
				addLoc(textarea1, file$b, 77, 12, 2722);
				addLoc(hr, file$b, 83, 8, 2993);
			},

			m: function mount(target, anchor) {
				insert(target, h3, anchor);
				insert(target, text1, anchor);
				append(formblock0._slotted.default, input);

				input.value = ctx.settings.embed.custom_embed.title;

				formblock0._mount(target, anchor);
				insert(target, text2, anchor);
				append(formblock1._slotted.default, textarea0);

				textarea0.value = ctx.settings.embed.custom_embed.text;

				formblock1._mount(target, anchor);
				insert(target, text3, anchor);
				append(formblock2._slotted.default, textarea1);

				textarea1.value = ctx.settings.embed.custom_embed.template;

				formblock2._mount(target, anchor);
				insert(target, text4, anchor);
				insert(target, hr, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input_updating && changed.settings) input.value = ctx.settings.embed.custom_embed.title;
				if (!textarea0_updating && changed.settings) textarea0.value = ctx.settings.embed.custom_embed.text;
				if (!textarea1_updating && changed.settings) textarea1.value = ctx.settings.embed.custom_embed.template;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h3);
					detachNode(text1);
				}

				removeListener(input, "input", input_input_handler);
				formblock0.destroy(detach);
				if (detach) {
					detachNode(text2);
				}

				removeListener(textarea0, "input", textarea0_input_handler);
				formblock1.destroy(detach);
				if (detach) {
					detachNode(text3);
				}

				removeListener(textarea1, "input", textarea1_input_handler);
				formblock2.destroy(detach);
				if (detach) {
					detachNode(text4);
					detachNode(hr);
				}
			}
		};
	}

	function Settings(options) {
		this._debugName = '<Settings>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$c(), options.data);

		this._recompute({ locales: 1 }, this._state);
		if (!('locales' in this._state)) console.warn("<Settings> was created without expected data property 'locales'");
		if (!('team' in this._state)) console.warn("<Settings> was created without expected data property 'team'");
		if (!('settings' in this._state)) console.warn("<Settings> was created without expected data property 'settings'");
		if (!('defaultTheme' in this._state)) console.warn("<Settings> was created without expected data property 'defaultTheme'");
		if (!('themes' in this._state)) console.warn("<Settings> was created without expected data property 'themes'");
		if (!('folders' in this._state)) console.warn("<Settings> was created without expected data property 'folders'");

		if (!('embedCodes' in this._state)) console.warn("<Settings> was created without expected data property 'embedCodes'");
		this._intro = true;

		this._handlers.state = [onstate$2];

		onstate$2.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$c(this, this._state);

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

	assign(Settings.prototype, protoDev);

	Settings.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('localeOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<Settings>: Cannot set read-only property 'localeOptions'");
	};

	Settings.prototype._recompute = function _recompute(changed, state) {
		if (changed.locales) {
			if (this._differs(state.localeOptions, (state.localeOptions = localeOptions(state)))) changed.localeOptions = true;
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

	/* home/david/Projects/core/libs/controls/v2/Help.html generated by Svelte v2.16.1 */

	function data$d() {
	    return {
	        visible: false
	    };
	}
	var methods$7 = {
	    show() {
	        const t = setTimeout(() => {
	            this.set({ visible: true });
	        }, 400);
	        this.set({ t });
	    },
	    hide() {
	        const { t } = this.get();
	        clearTimeout(t);
	        this.set({ visible: false });
	    }
	};

	const file$c = "home/david/Projects/core/libs/controls/v2/Help.html";

	function create_main_fragment$d(component, ctx) {
		var div, span, text_1;

		var if_block = (ctx.visible) && create_if_block$b(component);

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
				span.textContent = "?";
				text_1 = createText("\n    ");
				if (if_block) if_block.c();
				span.className = "help-icon svelte-9o0fpa";
				addLoc(span, file$c, 1, 4, 69);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = "help svelte-9o0fpa";
				addLoc(div, file$c, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				append(div, text_1);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.visible) {
					if (!if_block) {
						if_block = create_if_block$b(component);
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

				if (if_block) if_block.d();
				removeListener(div, "mouseenter", mouseenter_handler);
				removeListener(div, "mouseleave", mouseleave_handler);
			}
		};
	}

	// (3:4) {#if visible}
	function create_if_block$b(component, ctx) {
		var div, i, text, slot_content_default = component._slotted.default, slot_content_default_before;

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text = createText("\n        ");
				i.className = "hat-icon im im-graduation-hat svelte-9o0fpa";
				addLoc(i, file$c, 4, 8, 154);
				div.className = "content svelte-9o0fpa";
				addLoc(div, file$c, 3, 4, 124);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text);

				if (slot_content_default) {
					append(div, slot_content_default_before || (slot_content_default_before = createComment()));
					append(div, slot_content_default);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (slot_content_default) {
					reinsertAfter(slot_content_default_before, slot_content_default);
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
		this._state = assign(data$d(), options.data);
		if (!('visible' in this._state)) console.warn("<Help> was created without expected data property 'visible'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$d(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Help.prototype, protoDev);
	assign(Help.prototype, methods$7);

	Help.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/Switch.html generated by Svelte v2.16.1 */



	function data$e() {
	    return {
	        value: false,
	        help: '',
	        disabled_msg: '',
	        disabled_state: 'auto',
	        disabled: false,
	        highlight: false,
	        indeterminate: false
	    };
	}
	var methods$8 = {
	    toggle() {
	        const { disabled, indeterminate, value } = this.get();
	        const updatedState = { value: indeterminate ? true : !value, indeterminate: false };
	        if (disabled) return;
	        this.set(updatedState);
	        this.fire('change', updatedState);
	    }
	};

	const file$d = "home/david/Projects/core/libs/controls/v2/Switch.html";

	function create_main_fragment$e(component, ctx) {
		var div, text0, label, button, input, input_class_value, span, text1, raw_before, label_class_value, text2, current_block_type_index, if_block1;

		var if_block0 = (ctx.help) && create_if_block_2$4(component, ctx);

		function input_change_handler() {
			component.set({ value: input.checked, indeterminate: input.indeterminate });
		}

		function click_handler(event) {
			component.toggle();
		}

		var if_block_creators = [
			create_if_block$c,
			create_if_block_1$6
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.disabled && ctx.disabled_msg) return 0;
			if ((!ctx.disabled || ctx.disabled_state == 'on') && ctx.value && !ctx.indeterminate) return 1;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
		}

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n\n    ");
				label = createElement("label");
				button = createElement("button");
				input = createElement("input");
				span = createElement("span");
				text1 = createText("\n        ");
				raw_before = createElement('noscript');
				text2 = createText("\n\n    ");
				if (if_block1) if_block1.c();
				addListener(input, "change", input_change_handler);
				if (!('value' in ctx && 'indeterminate' in ctx)) component.root._beforecreate.push(input_change_handler);
				input.className = input_class_value = "" + (ctx.disabled && ctx.disabled_state == 'on' ? 'disabled-force-checked' : ctx.disabled && ctx.disabled_state == 'off' ? 'disabled-force-unchecked' : '') + " svelte-lppebe";
				input.disabled = ctx.disabled;
				setAttribute(input, "type", "checkbox");
				addLoc(input, file$d, 9, 12, 273);
				span.className = "slider round svelte-lppebe";
				addLoc(span, file$d, 15, 14, 596);
				addListener(button, "click", click_handler);
				button.className = "switch svelte-lppebe";
				addLoc(button, file$d, 8, 8, 217);
				label.className = label_class_value = "switch-outer " + (ctx.disabled? 'disabled' :'') + " svelte-lppebe";
				addLoc(label, file$d, 7, 4, 153);
				div.className = "control-group vis-option-group vis-option-type-switch svelte-lppebe";
				addLoc(div, file$d, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
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
				if (~current_block_type_index) if_blocks[current_block_type_index].i(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.help) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_2$4(component, ctx);
						if_block0.c();
						if_block0.m(div, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.value) input.checked = ctx.value;
				if (changed.indeterminate) input.indeterminate = ctx.indeterminate
	                ;
				if ((changed.disabled || changed.disabled_state) && input_class_value !== (input_class_value = "" + (ctx.disabled && ctx.disabled_state == 'on' ? 'disabled-force-checked' : ctx.disabled && ctx.disabled_state == 'off' ? 'disabled-force-unchecked' : '') + " svelte-lppebe")) {
					input.className = input_class_value;
				}

				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.label) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.label);
				}

				if ((changed.disabled) && label_class_value !== (label_class_value = "switch-outer " + (ctx.disabled? 'disabled' :'') + " svelte-lppebe")) {
					label.className = label_class_value;
				}

				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
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
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				removeListener(input, "change", input_change_handler);
				removeListener(button, "click", click_handler);
				if (~current_block_type_index) if_blocks[current_block_type_index].d();
			}
		};
	}

	// (2:4) {#if help}
	function create_if_block_2$4(component, ctx) {
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
				addLoc(div, file$d, 3, 8, 102);
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

	// (27:12) {#if (!disabled || disabled_state == 'on') && value && !indeterminate}
	function create_if_block_1$6(component, ctx) {
		var div1, div0, slot_content_default = component._slotted.default, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "switch-content svelte-lppebe";
				addLoc(div0, file$d, 28, 8, 982);
				setStyle(div1, "clear", "both");
				addLoc(div1, file$d, 27, 4, 948);
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
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

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

	// (21:4) {#if disabled && disabled_msg}
	function create_if_block$c(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-lppebe";
				addLoc(div0, file$d, 22, 8, 775);
				setStyle(div1, "clear", "both");
				addLoc(div1, file$d, 21, 4, 724);
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

	function Switch(options) {
		this._debugName = '<Switch>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$e(), options.data);
		if (!('help' in this._state)) console.warn("<Switch> was created without expected data property 'help'");
		if (!('disabled' in this._state)) console.warn("<Switch> was created without expected data property 'disabled'");
		if (!('disabled_state' in this._state)) console.warn("<Switch> was created without expected data property 'disabled_state'");
		if (!('value' in this._state)) console.warn("<Switch> was created without expected data property 'value'");
		if (!('indeterminate' in this._state)) console.warn("<Switch> was created without expected data property 'indeterminate'");
		if (!('label' in this._state)) console.warn("<Switch> was created without expected data property 'label'");
		if (!('disabled_msg' in this._state)) console.warn("<Switch> was created without expected data property 'disabled_msg'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$e(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Switch.prototype, protoDev);
	assign(Switch.prototype, methods$8);

	Switch.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/Checkbox.html generated by Svelte v2.16.1 */



	function data$f() {
	    return {
	        value: false,
	        disabled: false,
	        faded: false,
	        indeterminate: false,
	        disabled_msg: '',
	        help: false
	    };
	}
	const file$e = "home/david/Projects/core/libs/controls/v2/Checkbox.html";

	function create_main_fragment$f(component, ctx) {
		var text0, div, label, input, span, text1, text2, label_class_value, text3;

		var if_block0 = (ctx.help) && create_if_block_1$7(component, ctx);

		function input_change_handler() {
			component.set({ value: input.checked, indeterminate: input.indeterminate });
		}

		var if_block1 = (ctx.disabled && ctx.disabled_msg) && create_if_block$d(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n");
				div = createElement("div");
				label = createElement("label");
				input = createElement("input");
				span = createElement("span");
				text1 = createText("\n        ");
				text2 = createText(ctx.label);
				text3 = createText("\n    ");
				if (if_block1) if_block1.c();
				addListener(input, "change", input_change_handler);
				if (!('value' in ctx && 'indeterminate' in ctx)) component.root._beforecreate.push(input_change_handler);
				setAttribute(input, "type", "checkbox");
				input.disabled = ctx.disabled;
				input.className = "svelte-j55ba2";
				addLoc(input, file$e, 7, 8, 215);
				span.className = "css-ui svelte-j55ba2";
				addLoc(span, file$e, 7, 95, 302);
				label.className = label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-j55ba2";
				addLoc(label, file$e, 6, 4, 134);
				div.className = "control-group vis-option-group vis-option-type-checkbox svelte-j55ba2";
				addLoc(div, file$e, 5, 0, 60);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
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
				if (if_block1) if_block1.i(div, null);
			},

			p: function update(changed, ctx) {
				if (ctx.help) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_1$7(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (changed.value) input.checked = ctx.value;
				if (changed.indeterminate) input.indeterminate = ctx.indeterminate ;
				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.label) {
					setData(text2, ctx.label);
				}

				if ((changed.disabled || changed.faded) && label_class_value !== (label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-j55ba2")) {
					label.className = label_class_value;
				}

				if (ctx.disabled && ctx.disabled_msg) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block$d(component, ctx);
						if (if_block1) if_block1.c();
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
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div);
				}

				removeListener(input, "change", input_change_handler);
				if (if_block1) if_block1.d();
			}
		};
	}

	// (1:0) {#if help}
	function create_if_block_1$7(component, ctx) {
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
				addLoc(div, file$e, 2, 4, 22);
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
	function create_if_block$d(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-j55ba2";
				addLoc(div0, file$e, 12, 8, 432);
				addLoc(div1, file$e, 11, 4, 401);
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

	function Checkbox(options) {
		this._debugName = '<Checkbox>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$f(), options.data);
		if (!('help' in this._state)) console.warn("<Checkbox> was created without expected data property 'help'");
		if (!('disabled' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled'");
		if (!('faded' in this._state)) console.warn("<Checkbox> was created without expected data property 'faded'");
		if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
		if (!('indeterminate' in this._state)) console.warn("<Checkbox> was created without expected data property 'indeterminate'");
		if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");
		if (!('disabled_msg' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled_msg'");
		this._intro = true;

		this._fragment = create_main_fragment$f(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Checkbox.prototype, protoDev);

	Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* team-settings/tabs/DeleteTeam.html generated by Svelte v2.16.1 */



	function data$g() {
	    return {
	        deleteTeam: false,
	        deleteTeam2: false,
	        deleting: false
	    };
	}
	var methods$9 = {
	    async deleteTeam() {
	        this.set({ deleting: true });
	        await httpReq.delete(`/v3/teams/${this.get().team.id}`);
	        window.location = '/';
	    }
	};

	const file$f = "team-settings/tabs/DeleteTeam.html";

	function create_main_fragment$g(component, ctx) {
		var p, raw_value = __('teams / delete / p'), text, if_block_anchor, switch_1_updating = {};

		var if_block = (ctx.deleteTeam) && create_if_block$e(component, ctx);

		var switch_1_initial_data = { label: __('teams / delete / yes') };
		if (ctx.deleteTeam !== void 0) {
			switch_1_initial_data.value = ctx.deleteTeam;
			switch_1_updating.value = true;
		}
		var switch_1 = new Switch({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: switch_1_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!switch_1_updating.value && changed.value) {
					newState.deleteTeam = childState.value;
				}
				component._set(newState);
				switch_1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			switch_1._bind({ value: 1 }, switch_1.get());
		});

		return {
			c: function create() {
				p = createElement("p");
				text = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				switch_1._fragment.c();
				addLoc(p, file$f, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text, anchor);
				if (if_block) if_block.m(switch_1._slotted.default, null);
				append(switch_1._slotted.default, if_block_anchor);
				switch_1._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.deleteTeam) {
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

				var switch_1_changes = {};
				if (!switch_1_updating.value && changed.deleteTeam) {
					switch_1_changes.value = ctx.deleteTeam;
					switch_1_updating.value = ctx.deleteTeam !== void 0;
				}
				switch_1._set(switch_1_changes);
				switch_1_updating = {};
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
					detachNode(text);
				}

				if (if_block) if_block.d();
				switch_1.destroy(detach);
			}
		};
	}

	// (6:4) {#if deleteTeam}
	function create_if_block$e(component, ctx) {
		var p, raw_value = __('teams / delete / really'), text0, checkbox_updating = {}, text1, if_block_anchor;

		var checkbox_initial_data = { label: __('teams / delete / really-yes') };
		if (ctx.deleteTeam2 !== void 0) {
			checkbox_initial_data.value = ctx.deleteTeam2;
			checkbox_updating.value = true;
		}
		var checkbox = new Checkbox({
			root: component.root,
			store: component.store,
			data: checkbox_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkbox_updating.value && changed.value) {
					newState.deleteTeam2 = childState.value;
				}
				component._set(newState);
				checkbox_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkbox._bind({ value: 1 }, checkbox.get());
		});

		var if_block = (ctx.deleteTeam2) && create_if_block_1$8(component, ctx);

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText("\n\n    ");
				checkbox._fragment.c();
				text1 = createText("\n\n    ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				addLoc(p, file$f, 6, 4, 146);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text0, anchor);
				checkbox._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var checkbox_changes = {};
				if (!checkbox_updating.value && changed.deleteTeam2) {
					checkbox_changes.value = ctx.deleteTeam2;
					checkbox_updating.value = ctx.deleteTeam2 !== void 0;
				}
				checkbox._set(checkbox_changes);
				checkbox_updating = {};

				if (ctx.deleteTeam2) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$8(component, ctx);
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
					detachNode(p);
					detachNode(text0);
				}

				checkbox.destroy(detach);
				if (detach) {
					detachNode(text1);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (13:4) {#if deleteTeam2}
	function create_if_block_1$8(component, ctx) {
		var button, i, i_class_value, text, raw_value = __('teams / delete / action'), raw_before;

		function click_handler(event) {
			component.deleteTeam();
		}

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text = createText("  ");
				raw_before = createElement('noscript');
				i.className = i_class_value = "fa " + (ctx.deleting ? 'fa-spin fa-circle-o-notch' : 'fa-times');
				addLoc(i, file$f, 14, 8, 387);
				addListener(button, "click", click_handler);
				button.className = "btn btn-danger";
				addLoc(button, file$f, 13, 4, 323);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if ((changed.deleting) && i_class_value !== (i_class_value = "fa " + (ctx.deleting ? 'fa-spin fa-circle-o-notch' : 'fa-times'))) {
					i.className = i_class_value;
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

	function DeleteTeam(options) {
		this._debugName = '<DeleteTeam>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$g(), options.data);
		if (!('deleteTeam' in this._state)) console.warn("<DeleteTeam> was created without expected data property 'deleteTeam'");
		if (!('deleteTeam2' in this._state)) console.warn("<DeleteTeam> was created without expected data property 'deleteTeam2'");
		if (!('deleting' in this._state)) console.warn("<DeleteTeam> was created without expected data property 'deleting'");
		this._intro = true;

		this._fragment = create_main_fragment$g(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(DeleteTeam.prototype, protoDev);
	assign(DeleteTeam.prototype, methods$9);

	DeleteTeam.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* team-settings/tabs/ProductTable.html generated by Svelte v2.16.1 */



	var ProductTable = Table;

	function addableProducts({ products, allProducts }) {
	    if (!allProducts || !products) return [];

	    return allProducts
	        .filter(el => {
	            return !products.filter(pr => pr.id === el.id).length;
	        })
	        .map(el => {
	            return {
	                value: el.id,
	                label: el.name
	            };
	        });
	}
	function data$h() {
	    return {
	        productHeaders: [
	            { title: __('teams / products / id'), width: '10%' },
	            { title: __('teams / products / name'), width: '30%' },
	            { title: __('teams / products / expires'), width: '30%' },
	            { title: __('teams / products / actions'), width: '30%' }
	        ],
	        editId: false,
	        updating: {},
	        loadingTeamProducts: true,
	        loadingAllProducts: true
	    };
	}
	var methods$a = {
	    edit(productId) {
	        if (this.get().editId === productId) {
	            this.set({ editId: false });
	            this.update(productId);
	        } else {
	            this.set({
	                editId: productId
	            });
	        }
	    },
	    async addProduct() {
	        const { team, addProduct } = this.get();

	        this.set({ addingProduct: true });

	        await httpReq(`/v3/teams/${team.id}/products`, {
	            method: 'post',
	            payload: {
	                productId: addProduct
	            }
	        });

	        const products = await httpReq(`/v3/teams/${team.id}/products`);
	        this.set({ products: products.list, addingProduct: false });
	    },
	    async remove(product) {
	        if (!window.confirm('Are you sure you want to remove this product?')) return;

	        await httpReq(`/v3/teams/${this.get().team.id}/products/${product.id}`, {
	            method: 'delete'
	        });

	        var { products } = this.get();
	        products = products.filter(el => el.id !== product.id);
	        this.set({ products });
	    },
	    async update(productId) {
	        var { updating, products } = this.get();
	        const product = products.filter(u => u.id === productId)[0];
	        updating[product.id] = true;
	        this.set({ updating });

	        await httpReq(`/v3/teams/${this.get().team.id}/products/${product.id}`, {
	            method: 'put',
	            payload: {
	                expires: product.expires
	            }
	        });

	        updating = this.get().updating;
	        updating[product.id] = false;
	        this.set({ updating });
	    }
	};

	function oncreate$2() {
	    const current = this.get();

	    httpReq(`/v3/teams/${current.team.id}/products`).then(products =>
	        this.set({ loadingTeamProducts: false, products: products.list })
	    );

	    httpReq(`/v3/products`).then(allProducts =>
	        this.set({ loadingAllProducts: false, allProducts: allProducts.list })
	    );
	}
	const file$g = "team-settings/tabs/ProductTable.html";

	function click_handler_2$1(event) {
		const { component, ctx } = this._svelte;

		component.remove(ctx.product);
	}

	function click_handler_1$1(event) {
		const { component, ctx } = this._svelte;

		component.edit(ctx.product.id);
	}

	function click_handler$4(event) {
		const { component, ctx } = this._svelte;

		component.edit(ctx.product.id);
	}

	function get_each_context$5(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.product = list[i];
		child_ctx.each_value = list;
		child_ctx.i = i;
		return child_ctx;
	}

	function create_main_fragment$h(component, ctx) {
		var p, raw_value = __('teams / products / p'), text, if_block_anchor;

		var if_block = (ctx.isAdmin) && create_if_block$f(component, ctx);

		return {
			c: function create() {
				p = createElement("p");
				text = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				setStyle(p, "margin-bottom", "10px");
				addLoc(p, file$g, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.isAdmin) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$f(component, ctx);
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
					detachNode(p);
					detachNode(text);
				}

				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (5:0) {#if isAdmin}
	function create_if_block$f(component, ctx) {
		var if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.loadingTeamProducts || ctx.loadingAllProducts) return create_if_block_1$9;
			return create_else_block$3;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			d: function destroy(detach) {
				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (7:0) {:else}
	function create_else_block$3(component, ctx) {
		var text, if_block1_anchor;

		var if_block0 = (ctx.products.length > 0) && create_if_block_4$2(component, ctx);

		var if_block1 = (ctx.addableProducts.length) && create_if_block_2$5(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText(" ");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.products.length > 0) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_4$2(component, ctx);
						if_block0.c();
						if_block0.m(text.parentNode, text);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.addableProducts.length) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_2$5(component, ctx);
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text);
				}

				if (if_block1) if_block1.d(detach);
				if (detach) {
					detachNode(if_block1_anchor);
				}
			}
		};
	}

	// (5:14) {#if loadingTeamProducts || loadingAllProducts}
	function create_if_block_1$9(component, ctx) {
		var p, i, text, raw_value = __('teams / products / loading'), raw_before;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText("   ");
				raw_before = createElement('noscript');
				i.className = "fa fa-spin fa-circle-o-notch";
				addLoc(i, file$g, 5, 3, 144);
				addLoc(p, file$g, 5, 0, 141);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text);
				append(p, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (7:8) {#if products.length > 0}
	function create_if_block_4$2(component, ctx) {
		var each_anchor;

		var each_value = ctx.products;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$6(component, get_each_context$5(ctx, each_value, i));
		}

		var producttable_initial_data = { columnHeaders: ctx.productHeaders };
		var producttable = new ProductTable({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: producttable_initial_data
		});

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
				producttable._fragment.c();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(producttable._slotted.default, null);
				}

				append(producttable._slotted.default, each_anchor);
				producttable._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.editId || changed.products || changed.updating) {
					each_value = ctx.products;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$5(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$6(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				var producttable_changes = {};
				if (changed.productHeaders) producttable_changes.columnHeaders = ctx.productHeaders;
				producttable._set(producttable_changes);
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				producttable.destroy(detach);
			}
		};
	}

	// (20:12) {:else}
	function create_else_block_2(component, ctx) {
		var text_value = ctx.product.expires || __('teams / products / never'), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.products) && text_value !== (text_value = ctx.product.expires || __('teams / products / never'))) {
					setData(text, text_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (18:12) {#if editId === product.id }
	function create_if_block_7$1(component, ctx) {
		var input, input_updating = false;

		function input_input_handler() {
			input_updating = true;
			ctx.each_value[ctx.i].expires = input.value;
			component.set({ products: ctx.products });
			input_updating = false;
		}

		return {
			c: function create() {
				input = createElement("input");
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				addLoc(input, file$g, 18, 12, 544);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

				input.value = ctx.product.expires;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input_updating && changed.products) input.value = ctx.product.expires;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(input);
				}

				removeListener(input, "input", input_input_handler);
			}
		};
	}

	// (31:12) {:else}
	function create_else_block_1$2(component, ctx) {
		var button0, i0, text0, text1_value = __('teams / edit' ), text1, text2, button1, i1, text3, text4_value = __('teams / remove' ), text4;

		return {
			c: function create() {
				button0 = createElement("button");
				i0 = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				text2 = createText("\n\n            ");
				button1 = createElement("button");
				i1 = createElement("i");
				text3 = createText("  ");
				text4 = createText(text4_value);
				i0.className = "fa fa-edit";
				addLoc(i0, file$g, 32, 16, 1219);

				button0._svelte = { component, ctx };

				addListener(button0, "click", click_handler_1$1);
				button0.className = "btn";
				addLoc(button0, file$g, 31, 12, 1154);
				i1.className = "fa fa-times";
				addLoc(i1, file$g, 36, 16, 1375);

				button1._svelte = { component, ctx };

				addListener(button1, "click", click_handler_2$1);
				button1.className = "btn";
				addLoc(button1, file$g, 35, 12, 1311);
			},

			m: function mount(target, anchor) {
				insert(target, button0, anchor);
				append(button0, i0);
				append(button0, text0);
				append(button0, text1);
				insert(target, text2, anchor);
				insert(target, button1, anchor);
				append(button1, i1);
				append(button1, text3);
				append(button1, text4);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button0._svelte.ctx = ctx;
				button1._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button0);
				}

				removeListener(button0, "click", click_handler_1$1);
				if (detach) {
					detachNode(text2);
					detachNode(button1);
				}

				removeListener(button1, "click", click_handler_2$1);
			}
		};
	}

	// (27:42) 
	function create_if_block_6$1(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-spin fa-circle-o-notch";
				addLoc(i, file$g, 28, 16, 1025);
				button.disabled = true;
				button.className = "btn btn-primary";
				addLoc(button, file$g, 27, 12, 967);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}
			}
		};
	}

	// (23:12) {#if editId === product.id }
	function create_if_block_5$1(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-check";
				addLoc(i, file$g, 24, 16, 832);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler$4);
				button.className = "btn btn-primary";
				addLoc(button, file$g, 23, 12, 755);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, i);
				append(button, text0);
				append(button, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				button._svelte.ctx = ctx;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler$4);
			}
		};
	}

	// (9:4) {#each products as product, i}
	function create_each_block$6(component, ctx) {
		var tr, td0, text0_value = ctx.product.id, text0, text1, td1, text2_value = ctx.product.name, text2, text3, td2, text4, td3;

		function select_block_type_1(ctx) {
			if (ctx.editId === ctx.product.id) return create_if_block_7$1;
			return create_else_block_2;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block0 = current_block_type(component, ctx);

		function select_block_type_2(ctx) {
			if (ctx.editId === ctx.product.id) return create_if_block_5$1;
			if (ctx.updating[ctx.product.id]) return create_if_block_6$1;
			return create_else_block_1$2;
		}

		var current_block_type_1 = select_block_type_2(ctx);
		var if_block1 = current_block_type_1(component, ctx);

		return {
			c: function create() {
				tr = createElement("tr");
				td0 = createElement("td");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				td1 = createElement("td");
				text2 = createText(text2_value);
				text3 = createText("\n        ");
				td2 = createElement("td");
				if_block0.c();
				text4 = createText("\n        ");
				td3 = createElement("td");
				if_block1.c();
				addLoc(td0, file$g, 10, 8, 376);
				addLoc(td1, file$g, 13, 8, 430);
				addLoc(td2, file$g, 16, 8, 486);
				addLoc(td3, file$g, 21, 8, 697);
				addLoc(tr, file$g, 9, 4, 363);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);
				append(tr, td0);
				append(td0, text0);
				append(tr, text1);
				append(tr, td1);
				append(td1, text2);
				append(tr, text3);
				append(tr, td2);
				if_block0.m(td2, null);
				append(tr, text4);
				append(tr, td3);
				if_block1.m(td3, null);
			},

			p: function update(changed, ctx) {
				if ((changed.products) && text0_value !== (text0_value = ctx.product.id)) {
					setData(text0, text0_value);
				}

				if ((changed.products) && text2_value !== (text2_value = ctx.product.name)) {
					setData(text2, text2_value);
				}

				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(td2, null);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type_1(component, ctx);
					if_block1.c();
					if_block1.m(td3, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(tr);
				}

				if_block0.d();
				if_block1.d();
			}
		};
	}

	// (45:6) {#if addableProducts.length }
	function create_if_block_2$5(component, ctx) {
		var div1, div0, select_updating = {}, text;

		var select_initial_data = {
		 	label: __('teams / products / add-product'),
		 	options: ctx.addableProducts
		 };
		if (ctx.addProduct !== void 0) {
			select_initial_data.value = ctx.addProduct;
			select_updating.value = true;
		}
		var select = new Select({
			root: component.root,
			store: component.store,
			data: select_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!select_updating.value && changed.value) {
					newState.addProduct = childState.value;
				}
				component._set(newState);
				select_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			select._bind({ value: 1 }, select.get());
		});

		var if_block = (ctx.addProduct) && create_if_block_3$3(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				select._fragment.c();
				text = createText("\n\n    ");
				if (if_block) if_block.c();
				setStyle(div0, "display", "block");
				addLoc(div0, file$g, 46, 4, 1597);
				setStyle(div1, "display", "flex");
				addLoc(div1, file$g, 45, 0, 1564);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				select._mount(div0, null);
				append(div1, text);
				if (if_block) if_block.m(div1, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var select_changes = {};
				if (changed.addableProducts) select_changes.options = ctx.addableProducts;
				if (!select_updating.value && changed.addProduct) {
					select_changes.value = ctx.addProduct;
					select_updating.value = ctx.addProduct !== void 0;
				}
				select._set(select_changes);
				select_updating = {};

				if (ctx.addProduct) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_3$3(component, ctx);
						if_block.c();
						if_block.m(div1, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}

				select.destroy();
				if (if_block) if_block.d();
			}
		};
	}

	// (55:4) {#if addProduct}
	function create_if_block_3$3(component, ctx) {
		var div, button, i, i_class_value, text, raw_value = __('teams / products / add'), raw_before;

		function click_handler_3(event) {
			component.addProduct();
		}

		return {
			c: function create() {
				div = createElement("div");
				button = createElement("button");
				i = createElement("i");
				text = createText("\n            ");
				raw_before = createElement('noscript');
				i.className = i_class_value = "fa " + (ctx.addingProduct ? 'fa fa-spin fa-circle-o-notch' : 'fa-plus');
				addLoc(i, file$g, 57, 12, 2009);
				addListener(button, "click", click_handler_3);
				button.className = "btn btn-primary";
				setStyle(button, "margin-left", "10px");
				addLoc(button, file$g, 56, 8, 1913);
				setStyle(div, "display", "block");
				addLoc(div, file$g, 55, 4, 1875);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, button);
				append(button, i);
				append(button, text);
				append(button, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if ((changed.addingProduct) && i_class_value !== (i_class_value = "fa " + (ctx.addingProduct ? 'fa fa-spin fa-circle-o-notch' : 'fa-plus'))) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(button, "click", click_handler_3);
			}
		};
	}

	function ProductTable_1(options) {
		this._debugName = '<ProductTable_1>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$h(), options.data);

		this._recompute({ products: 1, allProducts: 1 }, this._state);
		if (!('products' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'products'");
		if (!('allProducts' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'allProducts'");
		if (!('isAdmin' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'isAdmin'");
		if (!('loadingTeamProducts' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'loadingTeamProducts'");
		if (!('loadingAllProducts' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'loadingAllProducts'");
		if (!('productHeaders' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'productHeaders'");
		if (!('editId' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'editId'");
		if (!('updating' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'updating'");

		if (!('addProduct' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'addProduct'");
		if (!('addingProduct' in this._state)) console.warn("<ProductTable_1> was created without expected data property 'addingProduct'");
		this._intro = true;

		this._fragment = create_main_fragment$h(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$2.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ProductTable_1.prototype, protoDev);
	assign(ProductTable_1.prototype, methods$a);

	ProductTable_1.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('addableProducts' in newState && !this._updatingReadonlyProperty) throw new Error("<ProductTable_1>: Cannot set read-only property 'addableProducts'");
	};

	ProductTable_1.prototype._recompute = function _recompute(changed, state) {
		if (changed.products || changed.allProducts) {
			if (this._differs(state.addableProducts, (state.addableProducts = addableProducts(state)))) changed.addableProducts = true;
		}
	};

	/* global setTimeout, clearTimeout */

	var dist = function debounce(fn) {
	  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	  var lastCallAt = void 0;
	  var deferred = void 0;
	  var timer = void 0;
	  var pendingArgs = [];
	  return function debounced() {
	    var currentWait = getWait(wait);
	    var currentTime = new Date().getTime();

	    var isCold = !lastCallAt || currentTime - lastCallAt > currentWait;

	    lastCallAt = currentTime;

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    if (isCold && options.leading) {
	      return options.accumulate ? Promise.resolve(fn.call(this, [args])).then(function (result) {
	        return result[0];
	      }) : Promise.resolve(fn.call.apply(fn, [this].concat(args)));
	    }

	    if (deferred) {
	      clearTimeout(timer);
	    } else {
	      deferred = defer();
	    }

	    pendingArgs.push(args);
	    timer = setTimeout(flush.bind(this), currentWait);

	    if (options.accumulate) {
	      var argsIndex = pendingArgs.length - 1;
	      return deferred.promise.then(function (results) {
	        return results[argsIndex];
	      });
	    }

	    return deferred.promise;
	  };

	  function flush() {
	    var thisDeferred = deferred;
	    clearTimeout(timer);

	    Promise.resolve(options.accumulate ? fn.call(this, pendingArgs) : fn.apply(this, pendingArgs[pendingArgs.length - 1])).then(thisDeferred.resolve, thisDeferred.reject);

	    pendingArgs = [];
	    deferred = null;
	  }
	};

	function getWait(wait) {
	  return typeof wait === 'function' ? wait() : wait;
	}

	function defer() {
	  var deferred = {};
	  deferred.promise = new Promise(function (resolve, reject) {
	    deferred.resolve = resolve;
	    deferred.reject = reject;
	  });
	  return deferred;
	}

	const cache = {};

	var storeTeamSettings = dist(function (team, settings, defaultTheme) {
	    const hash = JSON.stringify({ team, settings, defaultTheme });
	    if (cache[team.id] === hash) {
	        cache[team.id] = hash;
	        // nothing has changed since last call
	        return new Promise((resolve, reject) => {
	            resolve();
	        });
	    }
	    cache[team.id] = hash;
	    return patch(`/v3/teams/${team.id}`, {
	        payload: {
	            name: team.name,
	            defaultTheme,
	            settings: settings
	        }
	    });
	}, 500);

	/* team-settings/App.html generated by Svelte v2.16.1 */



	const SettingsTab = {
	    id: 'settings',
	    title: __('teams / tab / settings'),
	    icon: 'fa fa-gears',
	    group: __('teams / group / users'),
	    order: 10,
	    h1: __('teams / defaults / h1'),
	    ui: Settings,
	    data: {}
	};

	const MembersTab = {
	    id: 'members',
	    title: __('teams / tab / members'),
	    icon: 'im im-users',
	    group: __('teams / group / users'),
	    order: 20,
	    h1: __('teams / h1'),
	    ui: Members
	};

	let app;
	let popstate = false;

	function pageTitle({ team, activeTab }) {
	    return `${activeTab ? activeTab.h1 : ''} | ${truncate(team.name, 17, 8)}`;
	}
	function title({ team }) {
	    return `${truncate(team.name, 17, 8)} » ${__('nav / team / settings')}`;
	}
	function tabs({ allTabs, team, pluginTabs, isAdmin, role }) {
	    const tabs = [].concat(allTabs, pluginTabs);

	    return tabs
	        .filter(tab => {
	            if (tab.adminOnly && !isAdmin) return false;
	            if (tab.ownerOnly && !(isAdmin || role === 'owner')) return false;
	            return true;
	        })
	        .map(tab => ({ ...tab, h1: tab.h1.replace('%team%', team.name) }));
	}
	function groups({
	    tabs,
	    isAdmin,
	    role,
	    team,
	    users,
	    userId,
	    settings,
	    defaultTheme,
	    themes,
	    folders,
	    locales,
	    visualizations,
	    visualizationsArchive
	}) {
	    const groups = [];

	    function get(groups, groupId) {
	        const g = groups.filter(el => el.title === groupId);
	        if (g.length) return g[0];

	        groups.push({
	            title: groupId,
	            tabs: []
	        });

	        return groups[groups.length - 1];
	    }

	    tabs.forEach(tab => {
	        tab.data = {
	            isAdmin,
	            isTeamOwner: role === 'owner',
	            team,
	            users,
	            userId,
	            settings,
	            defaultTheme,
	            themes,
	            folders,
	            locales,
	            visualizations,
	            visualizationsArchive,
	            ...tab.data
	        };
	        tab.onchange = (data, tabApp) => {
	            app.onTabChange(data, tabApp);
	        };
	        get(groups, tab.group).tabs.push(tab);
	    });

	    groups.forEach(group => {
	        group.tabs.sort((a, b) => a.order - b.order);
	    });

	    return groups;
	}
	function data$i() {
	    return {
	        allTabs: [
	            SettingsTab,
	            MembersTab,
	            {
	                id: 'delete',
	                title: __('teams / tab / deleteTeam'),
	                icon: 'fa fa-times',
	                group: __('teams / group / advanced'),
	                order: 80,
	                h1: __('teams / delete / h1'),
	                ui: DeleteTeam,
	                ownerOnly: true
	            },
	            {
	                id: 'products',
	                title: __('teams / tab / adminProducts'),
	                icon: 'fa fa-list-alt',
	                group: __('teams / group / internal'),
	                order: 90,
	                h1: __('teams / products / h1'),
	                ui: ProductTable_1,
	                adminOnly: true
	            }
	        ],
	        pluginTabs: [],
	        activeTab: null,
	        ui: Settings,
	        team: {
	            name: ''
	        },
	        settings: {},
	        users: [],
	        userId: null,
	        visualizations: [],
	        visualizationsArchive: []
	    };
	}
	var methods$b = {
	    onTabChange({ team, settings, defaultTheme }, tab) {
	        storeTeamSettings(team, settings, defaultTheme).then(() => {
	            this.set({
	                team,
	                settings,
	                defaultTheme
	            });
	            if (tab && tab.saved) {
	                tab.saved();
	            }
	        });
	    },
	    setTab(id) {
	        const { groups } = this.get();
	        let foundTab = false;
	        groups.forEach(group => {
	            group.tabs.forEach(tab => {
	                if (tab.id === id) {
	                    this.refs.navTabs.activateTab(tab);
	                    foundTab = true;
	                }
	            });
	        });

	        if (!foundTab) {
	            this.set({
	                activeTab: SettingsTab
	            });
	        }
	    }
	};

	function oncreate$3() {
	    app = this;
	    const path = window.location.pathname.split('/').slice(-1);
	    const initialTab = path[0] || 'settings';
	    this.setTab(initialTab);

	    window.addEventListener('popstate', ({ state }) => {
	        popstate = true;
	        setTimeout(() => (popstate = false), 100);
	        this.setTab(state.id);
	    });
	}
	function onstate$3({ changed, current, previous }) {
	    if (changed.activeTab && current.activeTab && !popstate) {
	        window.history.pushState(
	            { id: current.activeTab.id },
	            '',
	            `/team/${current.team.id}/${current.activeTab.id}`
	        );
	    }
	}
	const file$h = "team-settings/App.html";

	function create_main_fragment$i(component, ctx) {
		var title_value, text0, div1, div0, h1, text1, text2, div5, div4, div2, text3, div3, hr, text4, ul, li0, a0, i0, text5, text6_value = __('account / my-teams'), text6, text7, li1, a1, i1, text8, text9_value = __('nav / team / charts'), text9, a1_href_value, navtabs_updating = {};

		document.title = title_value = "" + ctx.pageTitle + " | Datawrapper";

		var if_block = (ctx.activeTab && ctx.activeTab.h1) && create_if_block$g(component, ctx);

		var navtabs_initial_data = {
		 	basePath: "team/" + ctx.team.id,
		 	groups: ctx.groups
		 };
		if (ctx.activeTab !== void 0) {
			navtabs_initial_data.activeTab = ctx.activeTab;
			navtabs_updating.activeTab = true;
		}
		var navtabs = new NavTabs({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), belowMenu: createFragment(), aboveContent: createFragment() },
			data: navtabs_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!navtabs_updating.activeTab && changed.activeTab) {
					newState.activeTab = childState.activeTab;
				}
				component._set(newState);
				navtabs_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			navtabs._bind({ activeTab: 1 }, navtabs.get());
		});

		component.refs.navTabs = navtabs;

		return {
			c: function create() {
				text0 = createText("\n\n");
				div1 = createElement("div");
				div0 = createElement("div");
				h1 = createElement("h1");
				text1 = createText(ctx.title);
				text2 = createText("\n\n");
				div5 = createElement("div");
				div4 = createElement("div");
				div2 = createElement("div");
				if (if_block) if_block.c();
				text3 = createText("\n            ");
				div3 = createElement("div");
				hr = createElement("hr");
				text4 = createText("\n                ");
				ul = createElement("ul");
				li0 = createElement("li");
				a0 = createElement("a");
				i0 = createElement("i");
				text5 = createText(" ");
				text6 = createText(text6_value);
				text7 = createText("\n                    ");
				li1 = createElement("li");
				a1 = createElement("a");
				i1 = createElement("i");
				text8 = createText(" ");
				text9 = createText(text9_value);
				navtabs._fragment.c();
				h1.className = "title";
				setStyle(h1, "margin-bottom", "18px");
				addLoc(h1, file$h, 6, 8, 141);
				div0.className = "span12 admin svelte-kailtr";
				addLoc(div0, file$h, 5, 4, 106);
				div1.className = "row";
				addLoc(div1, file$h, 4, 0, 75);
				setAttribute(div2, "slot", "aboveContent");
				addLoc(div2, file$h, 13, 12, 436);
				addLoc(hr, file$h, 19, 16, 651);
				i0.className = "fa fa-fw fa-arrow-left";
				addLoc(i0, file$h, 23, 29, 799);
				a0.href = "/account/teams";
				addLoc(a0, file$h, 22, 24, 745);
				li0.className = "svelte-kailtr";
				addLoc(li0, file$h, 21, 20, 716);
				i1.className = "fa fa-fw fa-arrow-left";
				addLoc(i1, file$h, 28, 29, 1024);
				a1.href = a1_href_value = "/team/" + ctx.team.id;
				addLoc(a1, file$h, 27, 24, 969);
				li1.className = "svelte-kailtr";
				addLoc(li1, file$h, 26, 20, 940);
				ul.className = "unstyled svelte-kailtr";
				addLoc(ul, file$h, 20, 16, 674);
				setAttribute(div3, "slot", "belowMenu");
				addLoc(div3, file$h, 18, 12, 612);
				div4.className = "visconfig";
				addLoc(div4, file$h, 11, 4, 311);
				div5.className = "settings-section dw-create-visualize chart-editor chart-editor-web admin svelte-kailtr";
				addLoc(div5, file$h, 10, 0, 220);
			},

			m: function mount(target, anchor) {
				insert(target, text0, anchor);
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, h1);
				append(h1, text1);
				insert(target, text2, anchor);
				insert(target, div5, anchor);
				append(div5, div4);
				append(navtabs._slotted.aboveContent, div2);
				if (if_block) if_block.m(div2, null);
				append(navtabs._slotted.default, text3);
				append(navtabs._slotted.belowMenu, div3);
				append(div3, hr);
				append(div3, text4);
				append(div3, ul);
				append(ul, li0);
				append(li0, a0);
				append(a0, i0);
				append(a0, text5);
				append(a0, text6);
				append(ul, text7);
				append(ul, li1);
				append(li1, a1);
				append(a1, i1);
				append(a1, text8);
				append(a1, text9);
				navtabs._mount(div4, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.pageTitle) && title_value !== (title_value = "" + ctx.pageTitle + " | Datawrapper")) {
					document.title = title_value;
				}

				if (changed.title) {
					setData(text1, ctx.title);
				}

				if (ctx.activeTab && ctx.activeTab.h1) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$g(component, ctx);
						if_block.c();
						if_block.m(div2, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.team) && a1_href_value !== (a1_href_value = "/team/" + ctx.team.id)) {
					a1.href = a1_href_value;
				}

				var navtabs_changes = {};
				if (changed.team) navtabs_changes.basePath = "team/" + ctx.team.id;
				if (changed.groups) navtabs_changes.groups = ctx.groups;
				if (!navtabs_updating.activeTab && changed.activeTab) {
					navtabs_changes.activeTab = ctx.activeTab;
					navtabs_updating.activeTab = ctx.activeTab !== void 0;
				}
				navtabs._set(navtabs_changes);
				navtabs_updating = {};
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text0);
					detachNode(div1);
					detachNode(text2);
					detachNode(div5);
				}

				if (if_block) if_block.d();
				navtabs.destroy();
				if (component.refs.navTabs === navtabs) component.refs.navTabs = null;
			}
		};
	}

	// (15:16) {#if activeTab && activeTab.h1 }
	function create_if_block$g(component, ctx) {
		var h2, raw_value = ctx.activeTab.h1;

		return {
			c: function create() {
				h2 = createElement("h2");
				h2.className = "svelte-kailtr";
				addLoc(h2, file$h, 15, 16, 527);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				h2.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.activeTab) && raw_value !== (raw_value = ctx.activeTab.h1)) {
					h2.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
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
		this._state = assign(data$i(), options.data);

		this._recompute({ team: 1, activeTab: 1, allTabs: 1, pluginTabs: 1, isAdmin: 1, role: 1, tabs: 1, users: 1, userId: 1, settings: 1, defaultTheme: 1, themes: 1, folders: 1, locales: 1, visualizations: 1, visualizationsArchive: 1 }, this._state);
		if (!('team' in this._state)) console.warn("<App> was created without expected data property 'team'");
		if (!('activeTab' in this._state)) console.warn("<App> was created without expected data property 'activeTab'");
		if (!('allTabs' in this._state)) console.warn("<App> was created without expected data property 'allTabs'");
		if (!('pluginTabs' in this._state)) console.warn("<App> was created without expected data property 'pluginTabs'");
		if (!('isAdmin' in this._state)) console.warn("<App> was created without expected data property 'isAdmin'");
		if (!('role' in this._state)) console.warn("<App> was created without expected data property 'role'");

		if (!('users' in this._state)) console.warn("<App> was created without expected data property 'users'");
		if (!('userId' in this._state)) console.warn("<App> was created without expected data property 'userId'");
		if (!('settings' in this._state)) console.warn("<App> was created without expected data property 'settings'");
		if (!('defaultTheme' in this._state)) console.warn("<App> was created without expected data property 'defaultTheme'");
		if (!('themes' in this._state)) console.warn("<App> was created without expected data property 'themes'");
		if (!('folders' in this._state)) console.warn("<App> was created without expected data property 'folders'");
		if (!('locales' in this._state)) console.warn("<App> was created without expected data property 'locales'");
		if (!('visualizations' in this._state)) console.warn("<App> was created without expected data property 'visualizations'");
		if (!('visualizationsArchive' in this._state)) console.warn("<App> was created without expected data property 'visualizationsArchive'");
		this._intro = true;

		this._handlers.state = [onstate$3];

		onstate$3.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$i(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$3.call(this);
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
	assign(App.prototype, methods$b);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('pageTitle' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'pageTitle'");
		if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'title'");
		if ('tabs' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'tabs'");
		if ('groups' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'groups'");
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.team || changed.activeTab) {
			if (this._differs(state.pageTitle, (state.pageTitle = pageTitle(state)))) changed.pageTitle = true;
		}

		if (changed.team) {
			if (this._differs(state.title, (state.title = title(state)))) changed.title = true;
		}

		if (changed.allTabs || changed.team || changed.pluginTabs || changed.isAdmin || changed.role) {
			if (this._differs(state.tabs, (state.tabs = tabs(state)))) changed.tabs = true;
		}

		if (changed.tabs || changed.isAdmin || changed.role || changed.team || changed.users || changed.userId || changed.settings || changed.defaultTheme || changed.themes || changed.folders || changed.locales || changed.visualizations || changed.visualizationsArchive) {
			if (this._differs(state.groups, (state.groups = groups(state)))) changed.groups = true;
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

	const store = new Store({});

	var main = { App, store };

	return main;

}));
//# sourceMappingURL=team-settings.js.map
=======
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("svelte/team-settings",e):(t=t||self)["team-settings"]=e()}(this,(function(){"use strict";var t=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t};"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;function e(t,e,n){return t(n={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&n.path)}},n.exports),n.exports}var n=e((function(t){function e(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=e=function(t){return typeof t}:t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(n)}t.exports=e}));var r=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r};var i=function(t){if(Array.isArray(t))return r(t)};var o=function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)};var a=function(t,e){if(t){if("string"==typeof t)return r(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(t,e):void 0}};var s=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var l=function(t){return i(t)||o(t)||a(t)||s()};function c(){}function u(t,e){for(var n in e)t[n]=e[n];return t}function d(t,e){for(var n in e)t[n]=1;return t}function f(t){t()}function h(t,e){t.appendChild(e)}function p(t,e,n){t.insertBefore(e,n)}function v(t){t.parentNode.removeChild(t)}function m(t,e){for(;t.nextSibling&&t.nextSibling!==e;)t.parentNode.removeChild(t.nextSibling)}function g(t){for(;t.nextSibling;)t.parentNode.removeChild(t.nextSibling)}function b(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}function y(t,e){for(;t.nextSibling;)e.appendChild(t.nextSibling)}function w(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function x(){return document.createDocumentFragment()}function k(t){return document.createElement(t)}function N(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function T(t){return document.createTextNode(t)}function O(){return document.createComment("")}function C(t,e,n,r){t.addEventListener(e,n,r)}function M(t,e,n,r){t.removeEventListener(e,n,r)}function A(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function E(t){return""===t?void 0:+t}function S(t,e){t.data=""+e}function j(t,e,n){t.style.setProperty(e,n)}function I(t,e){for(var n=0;n<t.options.length;n+=1){var r=t.options[n];if(r.__value===e)return void(r.selected=!0)}}function L(t){var e=t.querySelector(":checked")||t.options[0];return e&&e.__value}function P(t,e,n){t.classList[n?"add":"remove"](e)}function R(t){return t}function D(t,e,n,r,i){var o,a,s,l=n.call(t,e,r),u=!1;return{t:i?0:1,running:!1,program:null,pending:null,run:function(t,e){var n=this;"function"==typeof l?H.wait().then((function(){l=l(),n._run(t,e)})):this._run(t,e)},_run:function(t,n){o=l.duration||300,a=l.easing||R;var r={start:window.performance.now()+(l.delay||0),b:t,callback:n||c};i&&!u&&(l.css&&l.delay&&(s=e.style.cssText,e.style.cssText+=l.css(0,1)),l.tick&&l.tick(0,1),u=!0),t||(r.group=z.current,z.current.remaining+=1),l.delay?this.pending=r:this.start(r),this.running||(this.running=!0,H.add(this))},start:function(n){if(t.fire("".concat(n.b?"intro":"outro",".start"),{node:e}),n.a=this.t,n.delta=n.b-n.a,n.duration=o*Math.abs(n.b-n.a),n.end=n.start+n.duration,l.css){l.delay&&(e.style.cssText=s);var r=function(t,e,n){for(var r=t.a,i=t.b,o=t.delta,a=16.666/t.duration,s="{\n",l=0;l<=1;l+=a){var c=r+o*e(l);s+=100*l+"%{".concat(n(c,1-c),"}\n")}return s+"100% {".concat(n(i,1-i),"}\n}")}(n,a,l.css);H.addRule(r,n.name="__svelte_"+function(t){for(var e=5381,n=t.length;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(r)),e.style.animation=(e.style.animation||"").split(", ").filter((function(t){return t&&(n.delta<0||!/__svelte/.test(t))})).concat("".concat(n.name," ").concat(n.duration,"ms linear 1 forwards")).join(", ")}this.program=n,this.pending=null},update:function(t){var e=this.program;if(e){var n=t-e.start;this.t=e.a+e.delta*a(n/e.duration),l.tick&&l.tick(this.t,1-this.t)}},done:function(){var n=this.program;this.t=n.b,l.tick&&l.tick(this.t,1-this.t),t.fire("".concat(n.b?"intro":"outro",".end"),{node:e}),n.b||n.invalidated?l.css&&H.deleteRule(e,n.name):(n.group.callbacks.push((function(){n.callback(),l.css&&H.deleteRule(e,n.name)})),0==--n.group.remaining&&n.group.callbacks.forEach(f)),this.running=!!this.pending},abort:function(t){this.program&&(t&&l.tick&&l.tick(1,0),l.css&&H.deleteRule(e,this.program.name),this.program=this.pending=null,this.running=!1)},invalidate:function(){this.program&&(this.program.invalidated=!0)}}}var z={};function U(){z.current={remaining:0,callbacks:[]}}var H={running:!1,transitions:[],bound:null,stylesheet:null,activeRules:{},promise:null,add:function(t){this.transitions.push(t),this.running||(this.running=!0,requestAnimationFrame(this.bound||(this.bound=this.next.bind(this))))},addRule:function(t,e){if(!this.stylesheet){var n=k("style");document.head.appendChild(n),H.stylesheet=n.sheet}this.activeRules[e]||(this.activeRules[e]=!0,this.stylesheet.insertRule("@keyframes ".concat(e," ").concat(t),this.stylesheet.cssRules.length))},next:function(){this.running=!1;for(var t=window.performance.now(),e=this.transitions.length;e--;){var n=this.transitions[e];n.program&&t>=n.program.end&&n.done(),n.pending&&t>=n.pending.start&&n.start(n.pending),n.running?(n.update(t),this.running=!0):n.pending||this.transitions.splice(e,1)}if(this.running)requestAnimationFrame(this.bound);else if(this.stylesheet){for(var r=this.stylesheet.cssRules.length;r--;)this.stylesheet.deleteRule(r);this.activeRules={}}},deleteRule:function(t,e){t.style.animation=t.style.animation.split(", ").filter((function(t){return t&&-1===t.indexOf(e)})).join(", ")},wait:function(){return H.promise||(H.promise=Promise.resolve(),H.promise.then((function(){H.promise=null}))),H.promise}};function F(e,n){var r,i=n.token={};function o(e,r,o,a){if(n.token===i){n.resolved=o&&t({},o,a);var s=u(u({},n.ctx),n.resolved),l=e&&(n.current=e)(n.component,s);n.block&&(n.blocks?n.blocks.forEach((function(t,e){e!==r&&t&&(U(),t.o((function(){t.d(1),n.blocks[e]=null})))})):n.block.d(1),l.c(),l[l.i?"i":"m"](n.mount(),n.anchor),n.component.root.set({})),n.block=l,n.blocks&&(n.blocks[r]=l)}}if((r=e)&&"function"==typeof r.then){if(e.then((function(t){o(n.then,1,n.value,t)}),(function(t){o(n.catch,2,n.error,t)})),n.current!==n.pending)return o(n.pending,0),!0}else{if(n.current!==n.then)return o(n.then,1,n.value,e),!0;n.resolved=t({},n.value,e)}}function B(t,e){for(var n={},r={},i={},o=t.length;o--;){var a=t[o],s=e[o];if(s){for(var l in a)l in s||(r[l]=1);for(var l in s)i[l]||(n[l]=s[l],i[l]=1);t[o]=s}else for(var l in a)i[l]=1}for(var l in r)l in n||(n[l]=void 0);return n}function q(){return Object.create(null)}function G(t,e){return t!=t?e==e:t!==e||t&&"object"===n(t)||"function"==typeof t}function V(t,e){return t!=t?e==e:t!==e}function W(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var r=0;r<n.length;r+=1){var i=n[r];if(!i.__calling)try{i.__calling=!0,i.call(this,e)}finally{i.__calling=!1}}}function Y(t){t._lock=!0,Q(t._beforecreate),Q(t._oncreate),Q(t._aftercreate),t._lock=!1}function K(){return this._state}function X(t,e){t._handlers=q(),t._slots=q(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function J(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}}function Q(t){for(;t&&t.length;)t.shift()()}function Z(){this.store._remove(this)}var tt={destroy:function(t){this.destroy=c,this.fire("destroy"),this.set=c,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:K,fire:W,on:J,set:function(t){this._set(u({},t)),this.root._lock||Y(this.root)},_recompute:c,_set:function(t){var e=this._state,n={},r=!1;for(var i in t=u(this._staged,t),this._staged={},t)this._differs(t[i],e[i])&&(n[i]=r=!0);r&&(this._state=u(u({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){u(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:G},et={};function nt(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(et[t]=window.__dw.vis.meta.locale||{}):et[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function rt(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),et[n]||nt(n),!et[n][t])return"MISSING:"+t;var r=et[n][t];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),r}function it(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:11,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:7;return"string"!=typeof t?t:t.length<e+n+3?t:t.substr(0,e).trim()+"…"+t.substr(t.length-n).trim()}function ot(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(n,r){var i=document.createElement("script");i.src=t,i.onload=function(){e&&e(),n()},i.onerror=r,document.body.appendChild(i)}))}function at(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(n,r){var i=document.createElement("link");i.rel="stylesheet",i.href=t,i.onload=function(){e&&e(),n()},i.onerror=r,document.head.appendChild(i)}))}var st={activateTab:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(t.module)return n&&n.preventDefault(),void Promise.all([at(t.css),ot(t.js||t.src)]).then((function(){require([t.module],(function(n){t.ui=n.App,t.module=null;var r=e.get().groups;e.set({groups:r,activeTab:t})}))}));t.ui&&(n&&n.preventDefault(),this.set({activeTab:t}))},onTabChange:function(t,e){t.onchange&&t.onchange(e,this.refs.currentTabUi)}};function lt(t){var e=this._svelte,n=e.component,r=e.ctx;n.activateTab(r.tab,t)}function ct(t,e,n){var r=Object.create(t);return r.tab=e[n],r}function ut(t,e,n){var r=Object.create(t);return r.group=e[n],r}function dt(t,e){var n,r,i,o,a,s,l,c=e.tab.title;return{c:function(){n=k("li"),r=k("a"),i=k("i"),a=T("   "),s=T(c),i.className=o=e.tab.icon+" svelte-5we305",r._svelte={component:t,ctx:e},C(r,"click",lt),r.href=l=e.tab.url||"/".concat(e.basePath,"/").concat(e.tab.id),r.className="svelte-5we305",n.className="svelte-5we305",P(n,"active",e.activeTab&&e.activeTab.id===e.tab.id)},m:function(t,e){p(t,n,e),h(n,r),h(r,i),h(r,a),h(r,s)},p:function(t,a){e=a,t.groups&&o!==(o=e.tab.icon+" svelte-5we305")&&(i.className=o),t.groups&&c!==(c=e.tab.title)&&S(s,c),r._svelte.ctx=e,(t.groups||t.basePath)&&l!==(l=e.tab.url||"/".concat(e.basePath,"/").concat(e.tab.id))&&(r.href=l),(t.activeTab||t.groups)&&P(n,"active",e.activeTab&&e.activeTab.id===e.tab.id)},d:function(t){t&&v(n),M(r,"click",lt)}}}function ft(t,e){for(var n,r,i,o,a=e.group.title,s=e.group.tabs,l=[],c=0;c<s.length;c+=1)l[c]=dt(t,ct(e,s,c));return{c:function(){n=k("div"),r=T(a),i=T("\n\n        "),o=k("ul");for(var t=0;t<l.length;t+=1)l[t].c();n.className="group svelte-5we305",o.className="nav nav-stacked nav-tabs"},m:function(t,e){p(t,n,e),h(n,r),p(t,i,e),p(t,o,e);for(var a=0;a<l.length;a+=1)l[a].m(o,null)},p:function(e,n){if(e.groups&&a!==(a=n.group.title)&&S(r,a),e.activeTab||e.groups||e.basePath){s=n.group.tabs;for(var i=0;i<s.length;i+=1){var c=ct(n,s,i);l[i]?l[i].p(e,c):(l[i]=dt(t,c),l[i].c(),l[i].m(o,null))}for(;i<l.length;i+=1)l[i].d(1);l.length=s.length}},d:function(t){t&&(v(n),v(i),v(o)),w(l,t)}}}function ht(t,e){var n,r,i,o,a,s,l=t._slotted.aboveContent,c=t._slotted.belowContent,d=[e.activeTab.data],f=e.activeTab.ui;function m(e){for(var n={},r=0;r<d.length;r+=1)n=u(n,d[r]);return{root:t.root,store:t.store,data:n}}if(f)var g=new f(m());function b(n){t.onTabChange(e.activeTab,n)}return g&&g.on("change",b),{c:function(){n=k("div"),i=T("\n        "),g&&g._fragment.c(),o=T("\n        "),n.className=s="span10 account-page-content tab-"+e.activeTab.id+" svelte-5we305"},m:function(e,s){p(e,n,s),l&&(h(n,l),h(n,r||(r=O()))),h(n,i),g&&(g._mount(n,null),t.refs.currentTabUi=g),h(n,o),c&&(h(n,a||(a=O())),h(n,c))},p:function(r,i){e=i;var a=r.activeTab?B(d,[e.activeTab.data]):{};f!==(f=e.activeTab.ui)?(g&&g.destroy(),f?((g=new f(m()))._fragment.c(),g._mount(n,o),g.on("change",b),t.refs.currentTabUi=g):(g=null,t.refs.currentTabUi===g&&(t.refs.currentTabUi=null))):f&&g._set(a),r.activeTab&&s!==(s="span10 account-page-content tab-"+e.activeTab.id+" svelte-5we305")&&(n.className=s)},d:function(t){t&&v(n),l&&function(t,e){for(var n=t.parentNode;n.firstChild!==t;)e.appendChild(n.firstChild)}(r,l),g&&g.destroy(),c&&y(a,c)}}}function pt(t){X(this,t),this.refs={},this._state=u({groups:[],basePath:"",activeTab:null},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){for(var n,r,i,o,a,s=t._slotted.belowMenu,l=e.groups,c=[],u=0;u<l.length;u+=1)c[u]=ft(t,ut(e,l,u));var d=e.activeTab&&ht(t,e);return{c:function(){n=k("div"),r=k("div");for(var t=0;t<c.length;t+=1)c[t].c();i=T("\n        "),a=T("\n    "),d&&d.c(),r.className="span2 svelte-5we305",n.className="row"},m:function(t,e){p(t,n,e),h(n,r);for(var l=0;l<c.length;l+=1)c[l].m(r,null);h(r,i),s&&(h(r,o||(o=O())),h(r,s)),h(n,a),d&&d.m(n,null)},p:function(e,o){if(e.groups||e.activeTab||e.basePath){l=o.groups;for(var a=0;a<l.length;a+=1){var s=ut(o,l,a);c[a]?c[a].p(e,s):(c[a]=ft(t,s),c[a].c(),c[a].m(r,i))}for(;a<c.length;a+=1)c[a].d(1);c.length=l.length}o.activeTab?d?d.p(e,o):((d=ht(t,o)).c(),d.m(n,null)):d&&(d.d(1),d=null)},d:function(t){t&&v(n),w(c,t),s&&y(o,s),d&&d.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(pt.prototype,tt),u(pt.prototype,st);function vt(t,e){var n,r,i,o,a=t._slotted.default,s=e.closeable&&mt(t);return{c:function(){n=k("div"),s&&s.c(),r=T("\n    "),a||(o=T("content")),n.className="alert svelte-9b8qew",P(n,"alert-success","success"===e.type),P(n,"alert-warning","warning"===e.type),P(n,"alert-error","error"===e.type)},m:function(t,e){p(t,n,e),s&&s.m(n,null),h(n,r),a?(h(n,i||(i=O())),h(n,a)):h(n,o)},p:function(e,i){i.closeable?s||((s=mt(t)).c(),s.m(n,r)):s&&(s.d(1),s=null),e.type&&(P(n,"alert-success","success"===i.type),P(n,"alert-warning","warning"===i.type),P(n,"alert-error","error"===i.type))},d:function(t){t&&v(n),s&&s.d(),a&&y(i,a)}}}function mt(t,e){var n;function r(e){t.close()}return{c:function(){(n=k("button")).textContent="×",C(n,"click",r),n.type="button",A(n,"aria-label","close"),n.className="close"},m:function(t,e){p(t,n,e)},d:function(t){t&&v(n),M(n,"click",r)}}}function gt(t){var e,n,r,i;X(this,t),this._state=u({visible:!1,type:"",closeable:!0},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,i=n.visible&&vt(e,n),{c:function(){i&&i.c(),r=O()},m:function(t,e){i&&i.m(t,e),p(t,r,e)},p:function(t,n){n.visible?i?i.p(t,n):((i=vt(e,n)).c(),i.m(r.parentNode,r)):i&&(i.d(1),i=null)},d:function(t){i&&i.d(t),t&&v(r)}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}u(gt.prototype,tt),u(gt.prototype,{close:function(){this.set({visible:!1}),this.fire("close")}});var bt={update:function(){var t,e=this.get(),n=e.value2,r=e.multiply_,i=e.step_,o=e.allowUndefined,a=Math.max(0,-Math.floor(Math.log(i*r)/Math.LN10));t=o&&void 0===n?void 0:n?+n.toFixed(a)/r:0,this.set({value:t})},refresh:function(){var t,e=this.get(),n=e.value,r=e.multiply_,i=e.step_,o=e.allowUndefined,a=Math.max(0,-Math.floor(Math.log(i*r)/Math.LN10));t=o&&void 0===n?void 0:+(n*r).toFixed(a),this.set({value2:t})}};function _t(){this.refresh()}function yt(t){var e=this,n=t.changed,r=(t.current,t.previous);if(!this.refs.input)return setTimeout((function(){e.refresh()}),0);!n.value&&r||this.refresh()}function wt(t,e){var n,r,i,o,a;function s(){t.set({value2:E(r.value)})}function l(e){t.update()}return{c:function(){n=k("div"),C(r=k("input"),"change",s),C(r,"input",s),C(r,"input",l),A(r,"type","range"),r.disabled=e.disabled,r.min=i=e.min_*e.multiply_,r.max=o=e.max_*e.multiply_,r.step=a=e.step_*e.multiply_,r.className="svelte-1hz22iy",n.className="slider svelte-1hz22iy"},m:function(t,i){p(t,n,i),h(n,r),r.value=e.value2},p:function(t,e){t.value2&&(r.value=e.value2),t.disabled&&(r.disabled=e.disabled),(t.min_||t.multiply_)&&i!==(i=e.min_*e.multiply_)&&(r.min=i),(t.max_||t.multiply_)&&o!==(o=e.max_*e.multiply_)&&(r.max=o),(t.step_||t.multiply_)&&a!==(a=e.step_*e.multiply_)&&(r.step=a)},d:function(t){t&&v(n),M(r,"change",s),M(r,"input",s),M(r,"input",l)}}}function xt(t,e){var n,r;return{c:function(){n=k("span"),r=T(e.unit_),n.className="unit svelte-1hz22iy"},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.unit_&&S(r,e.unit_)},d:function(t){t&&v(n)}}}function kt(t){var e=this;X(this,t),this.refs={},this._state=u({value2:null,width:"40px",unit:"",disabled:!1,multiply:1,min:0,max:100,step:1,allowUndefined:!1,placeholder:null},t.data),this._recompute({step:1,min:1,max:1,unit:1,slider:1,multiply:1},this._state),this._intro=!0,this._handlers.update=[yt],this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d=!1,f=e.slider_&&wt(t,e);function m(){d=!0,t.set({value2:E(a.value)}),d=!1}function g(e){t.update()}var b=e.unit_&&xt(t,e);return{c:function(){n=k("div"),r=k("div"),f&&f.c(),i=T("\n        "),o=k("div"),a=k("input"),u=T("\n            "),b&&b.c(),C(a,"input",m),C(a,"input",g),j(a,"width",e.width),A(a,"type","number"),a.disabled=e.disabled,a.min=s=e.min_*e.multiply_,a.max=l=e.max_*e.multiply_,a.step=c=e.step_*e.multiply_,a.placeholder=e.placeholder,a.className="svelte-1hz22iy",o.className="value",r.className="number-control-container svelte-1hz22iy",n.className="number-control svelte-1hz22iy"},m:function(s,l){p(s,n,l),h(n,r),f&&f.m(r,null),h(r,i),h(r,o),h(o,a),t.refs.input=a,a.value=e.value2,h(o,u),b&&b.m(o,null)},p:function(e,n){n.slider_?f?f.p(e,n):((f=wt(t,n)).c(),f.m(r,i)):f&&(f.d(1),f=null),!d&&e.value2&&(a.value=n.value2),e.width&&j(a,"width",n.width),e.disabled&&(a.disabled=n.disabled),(e.min_||e.multiply_)&&s!==(s=n.min_*n.multiply_)&&(a.min=s),(e.max_||e.multiply_)&&l!==(l=n.max_*n.multiply_)&&(a.max=l),(e.step_||e.multiply_)&&c!==(c=n.step_*n.multiply_)&&(a.step=c),e.placeholder&&(a.placeholder=n.placeholder),n.unit_?b?b.p(e,n):((b=xt(t,n)).c(),b.m(o,null)):b&&(b.d(1),b=null)},d:function(e){e&&v(n),f&&f.d(),M(a,"input",m),M(a,"input",g),t.refs.input===a&&(t.refs.input=null),b&&b.d()}}}(this,this._state),this.root._oncreate.push((function(){_t.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(kt.prototype,tt),u(kt.prototype,bt),kt.prototype._recompute=function(t,e){var n,r;t.step&&this._differs(e.step_,e.step_=e.step||1)&&(t.step_=!0),t.min&&this._differs(e.min_,e.min_=function(t){var e=t.min;return void 0!==e?e:0}(e))&&(t.min_=!0),t.max&&this._differs(e.max_,e.max_=function(t){var e=t.max;return void 0!==e?e:100}(e))&&(t.max_=!0),t.unit&&this._differs(e.unit_,e.unit_=void 0!==(n=e.unit)?n:"")&&(t.unit_=!0),t.slider&&this._differs(e.slider_,e.slider_=void 0===(r=e.slider)||r)&&(t.slider_=!0),t.multiply&&this._differs(e.multiply_,e.multiply_=e.multiply||1)&&(t.multiply_=!0)};function Nt(t,e){var n,r,i=t._slotted.content;return{c:function(){n=k("div"),i||((r=k("div")).textContent="Dropdown content"),i||(r.className="base-dropdown-inner svelte-1jdtmzv"),j(n,"width",e.width),n.className="dropdown-menu base-dropdown-content svelte-1jdtmzv"},m:function(t,e){p(t,n,e),h(n,i||r)},p:function(t,e){t.width&&j(n,"width",e.width)},d:function(t){t&&v(n),i&&b(n,i)}}}function Tt(t){X(this,t),this.refs={},this._state=u({visible:!1,disabled:!1,width:"auto"},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){var n,r,i,o,a,s,l=t._slotted.button;function c(e){t.windowClick(e)}function u(e){t.toggle(e)}window.addEventListener("click",c);var d=e.visible&&Nt(t,e);return{c:function(){n=k("div"),r=k("a"),l||(i=k("button"),o=k("i")),s=T("\n    "),d&&d.c(),l||(o.className=a="fa fa-chevron-"+(e.visible?"up":"down")+" svelte-1jdtmzv",i.className="btn btn-small"),C(r,"click",u),r.href="#dropdown-btn",r.className="base-drop-btn svelte-1jdtmzv",j(n,"position","relative"),j(n,"display","inline-block")},m:function(e,a){p(e,n,a),h(n,r),l?h(r,l):(h(r,i),h(i,o)),t.refs.button=r,h(n,s),d&&d.m(n,null)},p:function(e,r){l||e.visible&&a!==(a="fa fa-chevron-"+(r.visible?"up":"down")+" svelte-1jdtmzv")&&(o.className=a),r.visible?d?d.p(e,r):((d=Nt(t,r)).c(),d.m(n,null)):d&&(d.d(1),d=null)},d:function(e){window.removeEventListener("click",c),e&&v(n),l&&b(r,l),M(r,"click",u),t.refs.button===r&&(t.refs.button=null),d&&d.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}u(Tt.prototype,tt),u(Tt.prototype,{toggle:function(t){t.preventDefault();var e=this.get(),n=e.visible;e.disabled||this.set({visible:!n})},windowClick:function(t){!t.target||this.refs&&this.refs.button&&(t.target===this.refs.button||this.refs.button.contains(t.target))||t.target.classList.contains("hex")||this.set({visible:!1})}});var Ot,Ct,Mt,At,Et,St;function jt(t){X(this,t),this._state=u({value:!1,indeterminate:!1,notoggle:!1,disabled:!1},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){var n,r,i=t._slotted.default;function o(e){t.toggle()}return{c:function(){n=k("button"),i||(r=T("x")),C(n,"click",o),n.className="btn btn-s svelte-6n3kq9",n.disabled=e.disabled,P(n,"indeterminate",e.indeterminate),P(n,"btn-toggled",e.value&&!e.indeterminate)},m:function(t,e){p(t,n,e),h(n,i||r)},p:function(t,e){t.disabled&&(n.disabled=e.disabled),t.indeterminate&&P(n,"indeterminate",e.indeterminate),(t.value||t.indeterminate)&&P(n,"btn-toggled",e.value&&!e.indeterminate)},d:function(t){t&&v(n),i&&b(n,i),M(n,"click",o)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function It(t){var e=t.iframe,n=t.attrs,r=t.forceRender,i=void 0!==r&&r,o=t.callback,a=e.contentWindow;if(!a.__dw||!a.__dw.vis)return setTimeout((function(){It({iframe:e,attrs:n,forceRender:i,callback:o})}),100),!1;var s=i,l=!1;function c(t){if(!a.__dw)return!1;var e=a.__dw.old_attrs||{},r=n;return t=t.split("."),_.each(t,(function(t){e=e[t]||{},r=r[t]||{}})),JSON.stringify(e)!==JSON.stringify(r)}["type","theme","metadata.data.transpose","metadata.axes"].forEach((function(t){c(t)&&(l=!0)})),c("metadata.data.column-format")||c("metadata.data.changes")||c("metadata.data.column-order")||c("metadata.describe.computed-columns")?l=!0:(c("metadata.visualize")&&(s=!0),l?setTimeout((function(){a.location.reload()}),1e3):(n=JSON.parse(JSON.stringify(n)),a.__dw.vis.chart().attributes(n),a.__dw.old_attrs=$.extend(!0,{},n),a.__dw.vis.chart().load(a.__dw.params.data),s&&a.__dw.render(),o&&o()))}u(jt.prototype,tt),u(jt.prototype,{toggle:function(){this.fire("select");var t=this.get(),e=t.value;t.notoggle||this.set({value:!e,indeterminate:!1})}}),u(function(t){X(this,t),this._state=u(this.store._init(["metadata","title"]),t.data),this.store._add(this,["metadata","title"]),this._intro=!0,this._handlers.destroy=[Z],this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d,f,m,g,b,_,y,w,x,N,O,E,S,I,L,P,R,D,z,U,H,F,$,B,q,G,V,W,Y,K,X,J=rt("annotate / hide-title"),Q=rt("Title"),Z=!1,tt=rt("Description"),et=!1,nt=rt("Notes"),it=!1,ot=rt("Source name"),at=!1,st=rt("Source URL"),lt=!1,ct=rt("visualize / annotate / byline"),ut=!1;function dt(){var n=t.store.get();e.$metadata.describe["hide-title"]=o.checked,t.store.set({metadata:n.metadata})}function ft(){Z=!0,t.store.set({title:f.value}),Z=!1}function ht(){var n=t.store.get();et=!0,e.$metadata.describe.intro=y.value,t.store.set({metadata:n.metadata}),et=!1}function pt(){var n=t.store.get();it=!0,e.$metadata.annotate.notes=E.value,t.store.set({metadata:n.metadata}),it=!1}function vt(){var n=t.store.get();at=!0,e.$metadata.describe["source-name"]=z.value,t.store.set({metadata:n.metadata}),at=!1}function mt(){var n=t.store.get();lt=!0,e.$metadata.describe["source-url"]=q.value,t.store.set({metadata:n.metadata}),lt=!1}function gt(){var n=t.store.get();ut=!0,e.$metadata.describe.byline=X.value,t.store.set({metadata:n.metadata}),ut=!1}return{c:function(){n=k("div"),r=k("div"),i=k("label"),o=k("input"),a=T(" "),s=T(J),l=T("\n\n        "),c=k("label"),u=T(Q),d=T("\n        "),f=k("input"),m=T("\n\n        "),g=k("label"),b=T(tt),_=T("\n        "),y=k("textarea"),w=T("\n\n        "),x=k("label"),N=T(nt),O=T("\n        "),E=k("input"),S=T("\n\n    "),I=k("div"),L=k("div"),P=k("label"),R=T(ot),D=T("\n            "),z=k("input"),U=T("\n        "),H=k("div"),F=k("label"),$=T(st),B=T("\n            "),q=k("input"),G=T("\n\n    "),V=k("div"),W=k("label"),Y=T(ct),K=T("\n        "),X=k("input"),C(o,"change",dt),A(o,"type","checkbox"),o.className="svelte-jsjdf7",i.className="hide-title svelte-jsjdf7",c.className="control-label",c.htmlFor="text-title",C(f,"input",ft),f.className="input-xlarge span4",f.autocomplete="off",A(f,"type","text"),g.className="control-label",g.htmlFor="text-intro",C(y,"input",ht),y.id="text-intro",y.className="input-xlarge span4",x.className="control-label",x.htmlFor="text-notes",C(E,"input",pt),E.className="input-xlarge span4",A(E,"type","text"),r.className="pull-left",j(r,"position","relative"),P.className="control-label",C(z,"input",vt),z.className="span2",z.placeholder=rt("name of the organisation"),A(z,"type","text"),L.className="span2",F.className="control-label",C(q,"input",mt),q.className="span2",q.placeholder=rt("URL of the dataset"),A(q,"type","text"),H.className="span2",I.className="row",W.className="control-label",C(X,"input",gt),X.className="input-xlarge span4",X.placeholder=rt("visualize / annotate / byline / placeholder"),A(X,"type","text"),V.className="chart-byline",n.className="story-title control-group"},m:function(t,v){p(t,n,v),h(n,r),h(r,i),h(i,o),o.checked=e.$metadata.describe["hide-title"],h(i,a),h(i,s),h(r,l),h(r,c),h(c,u),h(r,d),h(r,f),f.value=e.$title,h(r,m),h(r,g),h(g,b),h(r,_),h(r,y),y.value=e.$metadata.describe.intro,h(r,w),h(r,x),h(x,N),h(r,O),h(r,E),E.value=e.$metadata.annotate.notes,h(n,S),h(n,I),h(I,L),h(L,P),h(P,R),h(L,D),h(L,z),z.value=e.$metadata.describe["source-name"],h(I,U),h(I,H),h(H,F),h(F,$),h(H,B),h(H,q),q.value=e.$metadata.describe["source-url"],h(n,G),h(n,V),h(V,W),h(W,Y),h(V,K),h(V,X),X.value=e.$metadata.describe.byline},p:function(t,n){e=n,t.$metadata&&(o.checked=e.$metadata.describe["hide-title"]),!Z&&t.$title&&(f.value=e.$title),!et&&t.$metadata&&(y.value=e.$metadata.describe.intro),!it&&t.$metadata&&(E.value=e.$metadata.annotate.notes),!at&&t.$metadata&&(z.value=e.$metadata.describe["source-name"]),!lt&&t.$metadata&&(q.value=e.$metadata.describe["source-url"]),!ut&&t.$metadata&&(X.value=e.$metadata.describe.byline)},d:function(t){t&&v(n),M(o,"change",dt),M(f,"input",ft),M(y,"input",ht),M(E,"input",pt),M(z,"input",vt),M(q,"input",mt),M(X,"input",gt)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}.prototype,tt);var Lt={iframeLoaded:function(){var t=this;this.get().editable&&this.getContext((function(e,n){!function(t,e){function n(t){return function(n){e.set({passiveMode:!0}),e.setMetadata(t,n),e.set({passiveMode:!1})}}function r(t){var e=t.el,n=t.onchange;if(e){var r=!1;e.setAttribute("contenteditable",!0),e.addEventListener("focus",(function(){r=e.innerHTML})),e.addEventListener("keyup",(function(t){27===t.keyCode&&(t.preventDefault(),e.innerHTML=r,e.blur()),e.innerHTML.match(/(<br>)+$/g)&&n(e.innerHTML.replace(/(<br>)+$/g,""))}))}}r({el:t.querySelector(".headline-block .block-inner"),onchange:function(t){e.set({passiveMode:!0}),e.set({title:t}),e.set({passiveMode:!1})}}),r({el:t.querySelector(".description-block .block-inner"),onchange:n("describe.intro")}),r({el:t.querySelector(".notes-block .block-inner"),onchange:n("annotate.notes")})}(n,t.store)})),this.fire("iframeLoaded")},saved:function(){var t=Ot.contentWindow;t.__dw&&t.__dw.saved&&t.__dw.saved()},getContext:function(t){var e=this,n=this.refs.iframe.contentWindow,r=this.refs.iframe.contentDocument;if(!n.__dw||!n.__dw.vis)return setTimeout((function(){e.getContext(t)}),200);setTimeout((function(){n.__dw&&n.__dw.vis?t(n,r):e.getContext(t)}),1e3)},forceRender:function(){var t=this,e=this.store.serialize();It({iframe:this.refs.iframe,attrs:e,forceRender:!0,callback:function(){t.set({loading:!1})}})},reload:function(){this.refs.iframe.contentWindow.location.reload()},dragStart:function(t){Mt=t.clientX,At=t.clientY,Et=this.get().width,St=this.get().height,this.set({resizing:!0}),this.fire("beforeResize"),window.document.addEventListener("mousemove",Dt),window.document.addEventListener("mouseup",zt)}};function Pt(){var t=this;Ot=this.refs.iframe,Ct=this,window.addEventListener("message",(function(e){var n=e.data;if(!t.get().resizing&&void 0!==n["datawrapper-height"]){var r;for(var i in n["datawrapper-height"])r=n["datawrapper-height"][i];t.set({height:r})}}));var e=this.store;e.on("state",(function(n){if(!n.current.passiveMode){var r=e.serialize();It({iframe:t.refs.iframe,attrs:r,callback:function(){t.set({loading:!1})}}),e.getMetadata("data.json")}}))}function Rt(t){var e=t.changed,n=t.current;e.width&&this.store.setMetadata("publish.embed-width",n.width),e.height&&this.store.setMetadata("publish.embed-height",n.height)}function Dt(t){return Ct.set({width:Et+2*(t.clientX-Mt),height:St+t.clientY-At}),t.preventDefault(),!1}function zt(){window.document.removeEventListener("mousemove",Dt),window.document.removeEventListener("mouseup",zt),Ct.set({resizing:!1});var t=Ct.get(),e=t.width,n=t.height,r=Ct.refs.iframe.contentDocument.querySelector(".dw-chart-body").getBoundingClientRect(),i=Ct.refs.iframe.contentWindow.dw.utils.getMaxChartHeight(),o=[r.width,i],a=o[0],s=o[1];Ct.fire("resize",{width:e,height:n,chartWidth:a,chartHeight:s})}function Ut(t,e){var n;function r(e){t.dragStart(e)}return{c:function(){(n=k("div")).innerHTML='<i class="fa fa-arrows-h"></i>',C(n,"mousedown",r),A(n,"ref","resizer"),n.className="resizer resizer-both"},m:function(t,e){p(t,n,e)},d:function(t){t&&v(n),M(n,"mousedown",r)}}}function Ht(t){var e=this;X(this,t),this.refs={},this._state=u(u(this.store._init(["id"]),{src:!1,loading:!0,width:500,height:500,border:10,resizable:!0,resizing:!1,editable:!0}),t.data),this.store._add(this,["id"]),this._recompute({$id:1,src:1},this._state),this._intro=!0,this._handlers.update=[Rt],this._handlers.destroy=[Z],this._fragment=function(t,e){var n,r,i,o,a,s;function l(e){t.iframeLoaded(e)}var c=e.resizable&&Ut(t);return{c:function(){n=k("div"),r=k("div"),i=k("iframe"),o=T("\n        "),c&&c.c(),a=T("\n\n    "),s=k("div"),C(i,"load",l),i.title="chart-preview",i.src=e.url,i.id="iframe-vis",i.allowFullscreen=!0,A(i,"webkitallowfullscreen",!0),A(i,"mozallowfullscreen",!0),A(i,"oallowfullscreen",!0),A(i,"msallowfullscreen",!0),i.className="svelte-q9b3tj",r.id="iframe-wrapper",j(r,"width",e.width+"px"),j(r,"height",e.height+"px"),j(r,"overflow","visible"),j(r,"padding",e.border+"px"),r.className="svelte-q9b3tj",P(r,"loading",e.loading),P(r,"resizable",e.resizable),P(r,"resizing",e.resizing),s.id="notifications",j(n,"position","relative")},m:function(e,l){p(e,n,l),h(n,r),h(r,i),t.refs.iframe=i,h(r,o),c&&c.m(r,null),h(n,a),h(n,s),t.refs.cont=n},p:function(e,n){e.url&&(i.src=n.url),n.resizable?c||((c=Ut(t)).c(),c.m(r,null)):c&&(c.d(1),c=null),e.width&&j(r,"width",n.width+"px"),e.height&&j(r,"height",n.height+"px"),e.border&&j(r,"padding",n.border+"px"),e.loading&&P(r,"loading",n.loading),e.resizable&&P(r,"resizable",n.resizable),e.resizing&&P(r,"resizing",n.resizing)},d:function(e){e&&v(n),M(i,"load",l),t.refs.iframe===i&&(t.refs.iframe=null),c&&c.d(),t.refs.cont===n&&(t.refs.cont=null)}}}(this,this._state),this.root._oncreate.push((function(){Pt.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function Ft(t){var e=t-1;return e*e*e+1}function $t(t,e){var n=e.delay;void 0===n&&(n=0);var r=e.duration;void 0===r&&(r=400);var i=e.easing;void 0===i&&(i=Ft);var o=getComputedStyle(t),a=+o.opacity,s=parseFloat(o.height),l=parseFloat(o.paddingTop),c=parseFloat(o.paddingBottom),u=parseFloat(o.marginTop),d=parseFloat(o.marginBottom),f=parseFloat(o.borderTopWidth),h=parseFloat(o.borderBottomWidth);return{delay:n,duration:r,easing:i,css:function(t){return"overflow: hidden;opacity: "+Math.min(20*t,1)*a+";height: "+t*s+"px;padding-top: "+t*l+"px;padding-bottom: "+t*c+"px;margin-top: "+t*u+"px;margin-bottom: "+t*d+"px;border-top-width: "+t*f+"px;border-bottom-width: "+t*h+"px;"}}}u(Ht.prototype,tt),u(Ht.prototype,Lt),Ht.prototype._recompute=function(t,e){var n,r;(t.$id||t.src)&&this._differs(e.url,e.url=(r=(n=e).$id,n.src||(r?"/chart/".concat(r,"/preview"):"")))&&(t.url=!0)};var Bt={show:function(){var t=this,e=setTimeout((function(){t.set({visible:!0})}),400);this.set({t:e})},hide:function(){var t=this.get().t;clearTimeout(t),this.set({visible:!1})}};function qt(t,e){var n,r,i,o,a=t._slotted.default;return{c:function(){n=k("div"),r=k("i"),i=T("\n        "),r.className="hat-icon im im-graduation-hat svelte-9o0fpa",n.className="content svelte-9o0fpa"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),a&&(h(n,o||(o=O())),h(n,a))},d:function(t){t&&v(n),a&&y(o,a)}}}function Gt(t){X(this,t),this._state=u({visible:!1},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){var n,r,i,o=e.visible&&qt(t);function a(e){t.show()}function s(e){t.hide()}return{c:function(){n=k("div"),(r=k("span")).textContent="?",i=T("\n    "),o&&o.c(),r.className="help-icon svelte-9o0fpa",C(n,"mouseenter",a),C(n,"mouseleave",s),n.className="help svelte-9o0fpa"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),o&&o.m(n,null)},p:function(e,r){r.visible?o||((o=qt(t)).c(),o.m(n,null)):o&&(o.d(1),o=null)},d:function(t){t&&v(n),o&&o.d(),M(n,"mouseenter",a),M(n,"mouseleave",s)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function Vt(t,e){var n,r=new Gt({root:t.root,store:t.store,slots:{default:x()}});return{c:function(){n=k("div"),r._fragment.c()},m:function(t,i){h(r._slotted.default,n),n.innerHTML=e.help,r._mount(t,i)},p:function(t,e){t.help&&(n.innerHTML=e.help)},d:function(t){r.destroy(t)}}}function Wt(t,e){var n,r,i,o;return{c:function(){n=k("div"),(r=k("div")).className="disabled-msg svelte-j55ba2"},m:function(t,i){p(t,n,i),h(n,r),r.innerHTML=e.disabled_msg,o=!0},p:function(t,e){o&&!t.disabled_msg||(r.innerHTML=e.disabled_msg)},i:function(e,r){o||(t.root._intro&&(i&&i.invalidate(),t.root._aftercreate.push((function(){i||(i=D(t,n,$t,{},!0)),i.run(1)}))),this.m(e,r))},o:function(e){o&&(i||(i=D(t,n,$t,{},!1)),i.run(0,(function(){e(),i=null})),o=!1)},d:function(t){t&&(v(n),i&&i.abort())}}}function Yt(t){X(this,t),this._state=u({value:!1,disabled:!1,faded:!1,indeterminate:!1,disabled_msg:"",help:!1},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d=e.help&&Vt(t,e);function f(){t.set({value:o.checked,indeterminate:o.indeterminate})}var m=e.disabled&&e.disabled_msg&&Wt(t,e);return{c:function(){d&&d.c(),n=T("\n"),r=k("div"),i=k("label"),o=k("input"),a=k("span"),s=T("\n        "),l=T(e.label),u=T("\n    "),m&&m.c(),C(o,"change",f),"value"in e&&"indeterminate"in e||t.root._beforecreate.push(f),A(o,"type","checkbox"),o.disabled=e.disabled,o.className="svelte-j55ba2",a.className="css-ui svelte-j55ba2",i.className=c="checkbox "+(e.disabled?"disabled":"")+" "+(e.faded?"faded":"")+" svelte-j55ba2",r.className="control-group vis-option-group vis-option-type-checkbox svelte-j55ba2"},m:function(t,c){d&&d.m(t,c),p(t,n,c),p(t,r,c),h(r,i),h(i,o),o.checked=e.value,o.indeterminate=e.indeterminate,h(i,a),h(i,s),h(i,l),h(r,u),m&&m.i(r,null)},p:function(e,a){a.help?d?d.p(e,a):((d=Vt(t,a)).c(),d.m(n.parentNode,n)):d&&(d.d(1),d=null),e.value&&(o.checked=a.value),e.indeterminate&&(o.indeterminate=a.indeterminate),e.disabled&&(o.disabled=a.disabled),e.label&&S(l,a.label),(e.disabled||e.faded)&&c!==(c="checkbox "+(a.disabled?"disabled":"")+" "+(a.faded?"faded":"")+" svelte-j55ba2")&&(i.className=c),a.disabled&&a.disabled_msg?(m?m.p(e,a):(m=Wt(t,a))&&m.c(),m.i(r,null)):m&&(U(),m.o((function(){m.d(1),m=null})))},d:function(t){d&&d.d(t),t&&(v(n),v(r)),M(o,"change",f),m&&m.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(Gt.prototype,tt),u(Gt.prototype,Bt),u(Yt.prototype,tt);var Kt=e((function(t,e){
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
t.exports=function(){for(var t=function(t,e,n){return void 0===e&&(e=0),void 0===n&&(n=1),t<e?e:t>n?n:t},e={},n=0,r=["Boolean","Number","String","Function","Array","Date","RegExp","Undefined","Null"];n<r.length;n+=1){var i=r[n];e["[object "+i+"]"]=i.toLowerCase()}var o=function(t){return e[Object.prototype.toString.call(t)]||"object"},a=Math.PI,s={clip_rgb:function(e){e._clipped=!1,e._unclipped=e.slice(0);for(var n=0;n<=3;n++)n<3?((e[n]<0||e[n]>255)&&(e._clipped=!0),e[n]=t(e[n],0,255)):3===n&&(e[n]=t(e[n],0,1));return e},limit:t,type:o,unpack:function(t,e){return void 0===e&&(e=null),t.length>=3?Array.prototype.slice.call(t):"object"==o(t[0])&&e?e.split("").filter((function(e){return void 0!==t[0][e]})).map((function(e){return t[0][e]})):t[0]},last:function(t){if(t.length<2)return null;var e=t.length-1;return"string"==o(t[e])?t[e].toLowerCase():null},PI:a,TWOPI:2*a,PITHIRD:a/3,DEG2RAD:a/180,RAD2DEG:180/a},l={format:{},autodetect:[]},c=s.last,u=s.clip_rgb,d=s.type,f=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=this;if("object"===d(t[0])&&t[0].constructor&&t[0].constructor===this.constructor)return t[0];var r=c(t),i=!1;if(!r){i=!0,l.sorted||(l.autodetect=l.autodetect.sort((function(t,e){return e.p-t.p})),l.sorted=!0);for(var o=0,a=l.autodetect;o<a.length;o+=1){var s=a[o];if(r=s.test.apply(s,t))break}}if(!l.format[r])throw new Error("unknown format: "+t);var f=l.format[r].apply(null,i?t:t.slice(0,-1));n._rgb=u(f),3===n._rgb.length&&n._rgb.push(1)};f.prototype.toString=function(){return"function"==d(this.hex)?this.hex():"["+this._rgb.join(",")+"]"};var h=f,p=function t(){for(var e=[],n=arguments.length;n--;)e[n]=arguments[n];return new(Function.prototype.bind.apply(t.Color,[null].concat(e)))};p.Color=h,p.version="2.0.6";var v=p,m=s.unpack,g=Math.max,b=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=m(t,"rgb"),r=n[0],i=n[1],o=n[2],a=1-g(r/=255,g(i/=255,o/=255)),s=a<1?1/(1-a):0,l=(1-r-a)*s,c=(1-i-a)*s,u=(1-o-a)*s;return[l,c,u,a]},_=s.unpack,y=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=(t=_(t,"cmyk"))[0],r=t[1],i=t[2],o=t[3],a=t.length>4?t[4]:1;return 1===o?[0,0,0,a]:[n>=1?0:255*(1-n)*(1-o),r>=1?0:255*(1-r)*(1-o),i>=1?0:255*(1-i)*(1-o),a]},w=s.unpack,x=s.type;h.prototype.cmyk=function(){return b(this._rgb)},v.cmyk=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["cmyk"])))},l.format.cmyk=y,l.autodetect.push({p:2,test:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];if(t=w(t,"cmyk"),"array"===x(t)&&4===t.length)return"cmyk"}});var k=s.unpack,N=s.last,T=function(t){return Math.round(100*t)/100},O=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=k(t,"hsla"),r=N(t)||"lsa";return n[0]=T(n[0]||0),n[1]=T(100*n[1])+"%",n[2]=T(100*n[2])+"%","hsla"===r||n.length>3&&n[3]<1?(n[3]=n.length>3?n[3]:1,r="hsla"):n.length=3,r+"("+n.join(",")+")"},C=s.unpack,M=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=(t=C(t,"rgba"))[0],r=t[1],i=t[2];n/=255,r/=255,i/=255;var o,a,s=Math.min(n,r,i),l=Math.max(n,r,i),c=(l+s)/2;return l===s?(o=0,a=Number.NaN):o=c<.5?(l-s)/(l+s):(l-s)/(2-l-s),n==l?a=(r-i)/(l-s):r==l?a=2+(i-n)/(l-s):i==l&&(a=4+(n-r)/(l-s)),(a*=60)<0&&(a+=360),t.length>3&&void 0!==t[3]?[a,o,c,t[3]]:[a,o,c]},A=s.unpack,E=s.last,S=Math.round,j=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=A(t,"rgba"),r=E(t)||"rgb";return"hsl"==r.substr(0,3)?O(M(n),r):(n[0]=S(n[0]),n[1]=S(n[1]),n[2]=S(n[2]),("rgba"===r||n.length>3&&n[3]<1)&&(n[3]=n.length>3?n[3]:1,r="rgba"),r+"("+n.slice(0,"rgb"===r?3:4).join(",")+")")},I=s.unpack,L=Math.round,P=function(){for(var t,e=[],n=arguments.length;n--;)e[n]=arguments[n];var r,i,o,a=(e=I(e,"hsl"))[0],s=e[1],l=e[2];if(0===s)r=i=o=255*l;else{var c=[0,0,0],u=[0,0,0],d=l<.5?l*(1+s):l+s-l*s,f=2*l-d,h=a/360;c[0]=h+1/3,c[1]=h,c[2]=h-1/3;for(var p=0;p<3;p++)c[p]<0&&(c[p]+=1),c[p]>1&&(c[p]-=1),6*c[p]<1?u[p]=f+6*(d-f)*c[p]:2*c[p]<1?u[p]=d:3*c[p]<2?u[p]=f+(d-f)*(2/3-c[p])*6:u[p]=f;r=(t=[L(255*u[0]),L(255*u[1]),L(255*u[2])])[0],i=t[1],o=t[2]}return e.length>3?[r,i,o,e[3]]:[r,i,o,1]},R=/^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/,D=/^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/,z=/^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/,U=/^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/,H=/^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/,F=/^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/,$=Math.round,B=function(t){var e;if(t=t.toLowerCase().trim(),l.format.named)try{return l.format.named(t)}catch(t){}if(e=t.match(R)){for(var n=e.slice(1,4),r=0;r<3;r++)n[r]=+n[r];return n[3]=1,n}if(e=t.match(D)){for(var i=e.slice(1,5),o=0;o<4;o++)i[o]=+i[o];return i}if(e=t.match(z)){for(var a=e.slice(1,4),s=0;s<3;s++)a[s]=$(2.55*a[s]);return a[3]=1,a}if(e=t.match(U)){for(var c=e.slice(1,5),u=0;u<3;u++)c[u]=$(2.55*c[u]);return c[3]=+c[3],c}if(e=t.match(H)){var d=e.slice(1,4);d[1]*=.01,d[2]*=.01;var f=P(d);return f[3]=1,f}if(e=t.match(F)){var h=e.slice(1,4);h[1]*=.01,h[2]*=.01;var p=P(h);return p[3]=+e[4],p}};B.test=function(t){return R.test(t)||D.test(t)||z.test(t)||U.test(t)||H.test(t)||F.test(t)};var q=B,G=s.type;h.prototype.css=function(t){return j(this._rgb,t)},v.css=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["css"])))},l.format.css=q,l.autodetect.push({p:5,test:function(t){for(var e=[],n=arguments.length-1;n-- >0;)e[n]=arguments[n+1];if(!e.length&&"string"===G(t)&&q.test(t))return"css"}});var V=s.unpack;l.format.gl=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=V(t,"rgba");return n[0]*=255,n[1]*=255,n[2]*=255,n},v.gl=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["gl"])))},h.prototype.gl=function(){var t=this._rgb;return[t[0]/255,t[1]/255,t[2]/255,t[3]]};var W=s.unpack,Y=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n,r=W(t,"rgb"),i=r[0],o=r[1],a=r[2],s=Math.min(i,o,a),l=Math.max(i,o,a),c=l-s,u=100*c/255,d=s/(255-c)*100;return 0===c?n=Number.NaN:(i===l&&(n=(o-a)/c),o===l&&(n=2+(a-i)/c),a===l&&(n=4+(i-o)/c),(n*=60)<0&&(n+=360)),[n,u,d]},K=s.unpack,X=Math.floor,J=function(){for(var t,e,n,r,i,o,a=[],s=arguments.length;s--;)a[s]=arguments[s];var l,c,u,d=(a=K(a,"hcg"))[0],f=a[1],h=a[2];h*=255;var p=255*f;if(0===f)l=c=u=h;else{360===d&&(d=0),d>360&&(d-=360),d<0&&(d+=360);var v=X(d/=60),m=d-v,g=h*(1-f),b=g+p*(1-m),_=g+p*m,y=g+p;switch(v){case 0:l=(t=[y,_,g])[0],c=t[1],u=t[2];break;case 1:l=(e=[b,y,g])[0],c=e[1],u=e[2];break;case 2:l=(n=[g,y,_])[0],c=n[1],u=n[2];break;case 3:l=(r=[g,b,y])[0],c=r[1],u=r[2];break;case 4:l=(i=[_,g,y])[0],c=i[1],u=i[2];break;case 5:l=(o=[y,g,b])[0],c=o[1],u=o[2]}}return[l,c,u,a.length>3?a[3]:1]},Q=s.unpack,Z=s.type;h.prototype.hcg=function(){return Y(this._rgb)},v.hcg=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["hcg"])))},l.format.hcg=J,l.autodetect.push({p:1,test:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];if(t=Q(t,"hcg"),"array"===Z(t)&&3===t.length)return"hcg"}});var tt=s.unpack,et=s.last,nt=Math.round,rt=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=tt(t,"rgba"),r=n[0],i=n[1],o=n[2],a=n[3],s=et(t)||"auto";void 0===a&&(a=1),"auto"===s&&(s=a<1?"rgba":"rgb");var l=(r=nt(r))<<16|(i=nt(i))<<8|(o=nt(o)),c="000000"+l.toString(16);c=c.substr(c.length-6);var u="0"+nt(255*a).toString(16);switch(u=u.substr(u.length-2),s.toLowerCase()){case"rgba":return"#"+c+u;case"argb":return"#"+u+c;default:return"#"+c}},it=/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,ot=/^#?([A-Fa-f0-9]{8})$/,at=function(t){if(t.match(it)){4!==t.length&&7!==t.length||(t=t.substr(1)),3===t.length&&(t=(t=t.split(""))[0]+t[0]+t[1]+t[1]+t[2]+t[2]);var e=parseInt(t,16);return[e>>16,e>>8&255,255&e,1]}if(t.match(ot)){9===t.length&&(t=t.substr(1));var n=parseInt(t,16);return[n>>24&255,n>>16&255,n>>8&255,Math.round((255&n)/255*100)/100]}throw new Error("unknown hex color: "+t)},st=s.type;h.prototype.hex=function(t){return rt(this._rgb,t)},v.hex=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["hex"])))},l.format.hex=at,l.autodetect.push({p:4,test:function(t){for(var e=[],n=arguments.length-1;n-- >0;)e[n]=arguments[n+1];if(!e.length&&"string"===st(t)&&[3,4,6,7,8,9].includes(t.length))return"hex"}});var lt=s.unpack,ct=s.TWOPI,ut=Math.min,dt=Math.sqrt,ft=Math.acos,ht=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n,r=lt(t,"rgb"),i=r[0],o=r[1],a=r[2],s=ut(i/=255,o/=255,a/=255),l=(i+o+a)/3,c=l>0?1-s/l:0;return 0===c?n=NaN:(n=(i-o+(i-a))/2,n/=dt((i-o)*(i-o)+(i-a)*(o-a)),n=ft(n),a>o&&(n=ct-n),n/=ct),[360*n,c,l]},pt=s.unpack,vt=s.limit,mt=s.TWOPI,gt=s.PITHIRD,bt=Math.cos,_t=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n,r,i,o=(t=pt(t,"hsi"))[0],a=t[1],s=t[2];return isNaN(o)&&(o=0),isNaN(a)&&(a=0),o>360&&(o-=360),o<0&&(o+=360),(o/=360)<1/3?r=1-((i=(1-a)/3)+(n=(1+a*bt(mt*o)/bt(gt-mt*o))/3)):o<2/3?i=1-((n=(1-a)/3)+(r=(1+a*bt(mt*(o-=1/3))/bt(gt-mt*o))/3)):n=1-((r=(1-a)/3)+(i=(1+a*bt(mt*(o-=2/3))/bt(gt-mt*o))/3)),[255*(n=vt(s*n*3)),255*(r=vt(s*r*3)),255*(i=vt(s*i*3)),t.length>3?t[3]:1]},yt=s.unpack,wt=s.type;h.prototype.hsi=function(){return ht(this._rgb)},v.hsi=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["hsi"])))},l.format.hsi=_t,l.autodetect.push({p:2,test:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];if(t=yt(t,"hsi"),"array"===wt(t)&&3===t.length)return"hsi"}});var xt=s.unpack,kt=s.type;h.prototype.hsl=function(){return M(this._rgb)},v.hsl=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["hsl"])))},l.format.hsl=P,l.autodetect.push({p:2,test:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];if(t=xt(t,"hsl"),"array"===kt(t)&&3===t.length)return"hsl"}});var Nt=s.unpack,Tt=Math.min,Ot=Math.max,Ct=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n,r,i,o=(t=Nt(t,"rgb"))[0],a=t[1],s=t[2],l=Tt(o,a,s),c=Ot(o,a,s),u=c-l;return i=c/255,0===c?(n=Number.NaN,r=0):(r=u/c,o===c&&(n=(a-s)/u),a===c&&(n=2+(s-o)/u),s===c&&(n=4+(o-a)/u),(n*=60)<0&&(n+=360)),[n,r,i]},Mt=s.unpack,At=Math.floor,Et=function(){for(var t,e,n,r,i,o,a=[],s=arguments.length;s--;)a[s]=arguments[s];var l,c,u,d=(a=Mt(a,"hsv"))[0],f=a[1],h=a[2];if(h*=255,0===f)l=c=u=h;else{360===d&&(d=0),d>360&&(d-=360),d<0&&(d+=360);var p=At(d/=60),v=d-p,m=h*(1-f),g=h*(1-f*v),b=h*(1-f*(1-v));switch(p){case 0:l=(t=[h,b,m])[0],c=t[1],u=t[2];break;case 1:l=(e=[g,h,m])[0],c=e[1],u=e[2];break;case 2:l=(n=[m,h,b])[0],c=n[1],u=n[2];break;case 3:l=(r=[m,g,h])[0],c=r[1],u=r[2];break;case 4:l=(i=[b,m,h])[0],c=i[1],u=i[2];break;case 5:l=(o=[h,m,g])[0],c=o[1],u=o[2]}}return[l,c,u,a.length>3?a[3]:1]},St=s.unpack,jt=s.type;h.prototype.hsv=function(){return Ct(this._rgb)},v.hsv=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["hsv"])))},l.format.hsv=Et,l.autodetect.push({p:2,test:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];if(t=St(t,"hsv"),"array"===jt(t)&&3===t.length)return"hsv"}});var It=18,Lt=.95047,Pt=1,Rt=1.08883,Dt=.137931034,zt=.206896552,Ut=.12841855,Ht=.008856452,Ft=s.unpack,$t=Math.pow,Bt=function(t){return(t/=255)<=.04045?t/12.92:$t((t+.055)/1.055,2.4)},qt=function(t){return t>Ht?$t(t,1/3):t/Ut+Dt},Gt=function(t,e,n){return t=Bt(t),e=Bt(e),n=Bt(n),[qt((.4124564*t+.3575761*e+.1804375*n)/Lt),qt((.2126729*t+.7151522*e+.072175*n)/Pt),qt((.0193339*t+.119192*e+.9503041*n)/Rt)]},Vt=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=Ft(t,"rgb"),r=n[0],i=n[1],o=n[2],a=Gt(r,i,o),s=a[0],l=a[1],c=a[2],u=116*l-16;return[u<0?0:u,500*(s-l),200*(l-c)]},Wt=s.unpack,Yt=Math.pow,Kt=function(t){return 255*(t<=.00304?12.92*t:1.055*Yt(t,1/2.4)-.055)},Xt=function(t){return t>zt?t*t*t:Ut*(t-Dt)},Jt=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n,r,i,o=(t=Wt(t,"lab"))[0],a=t[1],s=t[2];return r=(o+16)/116,n=isNaN(a)?r:r+a/500,i=isNaN(s)?r:r-s/200,r=Pt*Xt(r),n=Lt*Xt(n),i=Rt*Xt(i),[Kt(3.2404542*n-1.5371385*r-.4985314*i),Kt(-.969266*n+1.8760108*r+.041556*i),Kt(.0556434*n-.2040259*r+1.0572252*i),t.length>3?t[3]:1]},Qt=s.unpack,Zt=s.type;h.prototype.lab=function(){return Vt(this._rgb)},v.lab=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["lab"])))},l.format.lab=Jt,l.autodetect.push({p:2,test:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];if(t=Qt(t,"lab"),"array"===Zt(t)&&3===t.length)return"lab"}});var te=s.unpack,ee=s.RAD2DEG,ne=Math.sqrt,re=Math.atan2,ie=Math.round,oe=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=te(t,"lab"),r=n[0],i=n[1],o=n[2],a=ne(i*i+o*o),s=(re(o,i)*ee+360)%360;return 0===ie(1e4*a)&&(s=Number.NaN),[r,a,s]},ae=s.unpack,se=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=ae(t,"rgb"),r=n[0],i=n[1],o=n[2],a=Vt(r,i,o),s=a[0],l=a[1],c=a[2];return oe(s,l,c)},le=s.unpack,ce=s.DEG2RAD,ue=Math.sin,de=Math.cos,fe=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=le(t,"lch"),r=n[0],i=n[1],o=n[2];return isNaN(o)&&(o=0),[r,de(o*=ce)*i,ue(o)*i]},he=s.unpack,pe=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=(t=he(t,"lch"))[0],r=t[1],i=t[2],o=fe(n,r,i),a=o[0],s=o[1],l=o[2],c=Jt(a,s,l),u=c[0],d=c[1],f=c[2];return[u,d,f,t.length>3?t[3]:1]},ve=s.unpack,me=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=ve(t,"hcl").reverse();return pe.apply(void 0,n)},ge=s.unpack,be=s.type;h.prototype.lch=function(){return se(this._rgb)},h.prototype.hcl=function(){return se(this._rgb).reverse()},v.lch=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["lch"])))},v.hcl=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["hcl"])))},l.format.lch=pe,l.format.hcl=me,["lch","hcl"].forEach((function(t){return l.autodetect.push({p:2,test:function(){for(var e=[],n=arguments.length;n--;)e[n]=arguments[n];if(e=ge(e,t),"array"===be(e)&&3===e.length)return t}})}));var _e={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflower:"#6495ed",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",laserlemon:"#ffff54",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrod:"#fafad2",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",maroon2:"#7f0000",maroon3:"#b03060",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",purple2:"#7f007f",purple3:"#a020f0",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"},ye=s.type;h.prototype.name=function(){for(var t=rt(this._rgb,"rgb"),e=0,n=Object.keys(_e);e<n.length;e+=1){var r=n[e];if(_e[r]===t)return r.toLowerCase()}return t},l.format.named=function(t){if(t=t.toLowerCase(),_e[t])return at(_e[t]);throw new Error("unknown color name: "+t)},l.autodetect.push({p:5,test:function(t){for(var e=[],n=arguments.length-1;n-- >0;)e[n]=arguments[n+1];if(!e.length&&"string"===ye(t)&&_e[t.toLowerCase()])return"named"}});var we=s.unpack,xe=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=we(t,"rgb"),r=n[0],i=n[1],o=n[2];return(r<<16)+(i<<8)+o},ke=s.type,Ne=function(t){if("number"==ke(t)&&t>=0&&t<=16777215)return[t>>16,t>>8&255,255&t,1];throw new Error("unknown num color: "+t)},Te=s.type;h.prototype.num=function(){return xe(this._rgb)},v.num=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["num"])))},l.format.num=Ne,l.autodetect.push({p:5,test:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];if(1===t.length&&"number"===Te(t[0])&&t[0]>=0&&t[0]<=16777215)return"num"}});var Oe=s.unpack,Ce=s.type,Me=Math.round;h.prototype.rgb=function(t){return void 0===t&&(t=!0),!1===t?this._rgb.slice(0,3):this._rgb.slice(0,3).map(Me)},h.prototype.rgba=function(t){return void 0===t&&(t=!0),this._rgb.slice(0,4).map((function(e,n){return n<3?!1===t?e:Me(e):e}))},v.rgb=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["rgb"])))},l.format.rgb=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=Oe(t,"rgba");return void 0===n[3]&&(n[3]=1),n},l.autodetect.push({p:3,test:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];if(t=Oe(t,"rgba"),"array"===Ce(t)&&(3===t.length||4===t.length&&"number"==Ce(t[3])&&t[3]>=0&&t[3]<=1))return"rgb"}});var Ae=Math.log,Ee=function(t){var e,n,r,i=t/100;return i<66?(e=255,n=-155.25485562709179-.44596950469579133*(n=i-2)+104.49216199393888*Ae(n),r=i<20?0:.8274096064007395*(r=i-10)-254.76935184120902+115.67994401066147*Ae(r)):(e=351.97690566805693+.114206453784165*(e=i-55)-40.25366309332127*Ae(e),n=325.4494125711974+.07943456536662342*(n=i-50)-28.0852963507957*Ae(n),r=255),[e,n,r,1]},Se=s.unpack,je=Math.round,Ie=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];for(var n,r=Se(t,"rgb"),i=r[0],o=r[2],a=1e3,s=4e4,l=.4;s-a>l;){var c=Ee(n=.5*(s+a));c[2]/c[0]>=o/i?s=n:a=n}return je(n)};h.prototype.temp=h.prototype.kelvin=h.prototype.temperature=function(){return Ie(this._rgb)},v.temp=v.kelvin=v.temperature=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return new(Function.prototype.bind.apply(h,[null].concat(t,["temp"])))},l.format.temp=l.format.kelvin=l.format.temperature=Ee;var Le=s.type;h.prototype.alpha=function(t,e){return void 0===e&&(e=!1),void 0!==t&&"number"===Le(t)?e?(this._rgb[3]=t,this):new h([this._rgb[0],this._rgb[1],this._rgb[2],t],"rgb"):this._rgb[3]},h.prototype.clipped=function(){return this._rgb._clipped||!1},h.prototype.darken=function(t){void 0===t&&(t=1);var e=this.lab();return e[0]-=It*t,new h(e,"lab").alpha(this.alpha(),!0)},h.prototype.brighten=function(t){return void 0===t&&(t=1),this.darken(-t)},h.prototype.darker=h.prototype.darken,h.prototype.brighter=h.prototype.brighten,h.prototype.get=function(t){var e=t.split("."),n=e[0],r=e[1],i=this[n]();if(r){var o=n.indexOf(r);if(o>-1)return i[o];throw new Error("unknown channel "+r+" in mode "+n)}return i};var Pe=s.type,Re=Math.pow;h.prototype.luminance=function(t){if(void 0!==t&&"number"===Pe(t)){if(0===t)return new h([0,0,0,this._rgb[3]],"rgb");if(1===t)return new h([255,255,255,this._rgb[3]],"rgb");var e=this.luminance(),n=20,r=function e(r,i){var o=r.interpolate(i,.5,"rgb"),a=o.luminance();return Math.abs(t-a)<1e-7||!n--?o:a>t?e(r,o):e(o,i)},i=(e>t?r(new h([0,0,0]),this):r(this,new h([255,255,255]))).rgb();return new h(i.concat([this._rgb[3]]))}return De.apply(void 0,this._rgb.slice(0,3))};var De=function(t,e,n){return.2126*(t=ze(t))+.7152*(e=ze(e))+.0722*(n=ze(n))},ze=function(t){return(t/=255)<=.03928?t/12.92:Re((t+.055)/1.055,2.4)},Ue={},He=s.type,Fe=function(t,e,n){void 0===n&&(n=.5);for(var r=[],i=arguments.length-3;i-- >0;)r[i]=arguments[i+3];var o=r[0]||"lrgb";if(Ue[o]||r.length||(o=Object.keys(Ue)[0]),!Ue[o])throw new Error("interpolation mode "+o+" is not defined");return"object"!==He(t)&&(t=new h(t)),"object"!==He(e)&&(e=new h(e)),Ue[o](t,e,n).alpha(t.alpha()+n*(e.alpha()-t.alpha()))};h.prototype.mix=h.prototype.interpolate=function(t,e){void 0===e&&(e=.5);for(var n=[],r=arguments.length-2;r-- >0;)n[r]=arguments[r+2];return Fe.apply(void 0,[this,t,e].concat(n))},h.prototype.premultiply=function(t){void 0===t&&(t=!1);var e=this._rgb,n=e[3];return t?(this._rgb=[e[0]*n,e[1]*n,e[2]*n,n],this):new h([e[0]*n,e[1]*n,e[2]*n,n],"rgb")},h.prototype.saturate=function(t){void 0===t&&(t=1);var e=this.lch();return e[1]+=It*t,e[1]<0&&(e[1]=0),new h(e,"lch").alpha(this.alpha(),!0)},h.prototype.desaturate=function(t){return void 0===t&&(t=1),this.saturate(-t)};var $e=s.type;h.prototype.set=function(t,e,n){void 0===n&&(n=!1);var r=t.split("."),i=r[0],o=r[1],a=this[i]();if(o){var s=i.indexOf(o);if(s>-1){if("string"==$e(e))switch(e.charAt(0)){case"+":case"-":a[s]+=+e;break;case"*":a[s]*=+e.substr(1);break;case"/":a[s]/=+e.substr(1);break;default:a[s]=+e}else{if("number"!==$e(e))throw new Error("unsupported value for Color.set");a[s]=e}var l=new h(a,i);return n?(this._rgb=l._rgb,this):l}throw new Error("unknown channel "+o+" in mode "+i)}return a},Ue.rgb=function(t,e,n){var r=t._rgb,i=e._rgb;return new h(r[0]+n*(i[0]-r[0]),r[1]+n*(i[1]-r[1]),r[2]+n*(i[2]-r[2]),"rgb")};var Be=Math.sqrt,qe=Math.pow;Ue.lrgb=function(t,e,n){var r=t._rgb,i=r[0],o=r[1],a=r[2],s=e._rgb,l=s[0],c=s[1],u=s[2];return new h(Be(qe(i,2)*(1-n)+qe(l,2)*n),Be(qe(o,2)*(1-n)+qe(c,2)*n),Be(qe(a,2)*(1-n)+qe(u,2)*n),"rgb")},Ue.lab=function(t,e,n){var r=t.lab(),i=e.lab();return new h(r[0]+n*(i[0]-r[0]),r[1]+n*(i[1]-r[1]),r[2]+n*(i[2]-r[2]),"lab")};var Ge=function(t,e,n,r){var i,o,a,s,l,c,u,d,f,p,v,m;return"hsl"===r?(a=t.hsl(),s=e.hsl()):"hsv"===r?(a=t.hsv(),s=e.hsv()):"hcg"===r?(a=t.hcg(),s=e.hcg()):"hsi"===r?(a=t.hsi(),s=e.hsi()):"lch"!==r&&"hcl"!==r||(r="hcl",a=t.hcl(),s=e.hcl()),"h"===r.substr(0,1)&&(l=(i=a)[0],u=i[1],f=i[2],c=(o=s)[0],d=o[1],p=o[2]),isNaN(l)||isNaN(c)?isNaN(l)?isNaN(c)?m=Number.NaN:(m=c,1!=f&&0!=f||"hsv"==r||(v=d)):(m=l,1!=p&&0!=p||"hsv"==r||(v=u)):m=l+n*(c>l&&c-l>180?c-(l+360):c<l&&l-c>180?c+360-l:c-l),void 0===v&&(v=u+n*(d-u)),new h([m,v,f+n*(p-f)],r)},Ve=function(t,e,n){return Ge(t,e,n,"lch")};Ue.lch=Ve,Ue.hcl=Ve,Ue.num=function(t,e,n){var r=t.num(),i=e.num();return new h(r+n*(i-r),"num")},Ue.hcg=function(t,e,n){return Ge(t,e,n,"hcg")},Ue.hsi=function(t,e,n){return Ge(t,e,n,"hsi")},Ue.hsl=function(t,e,n){return Ge(t,e,n,"hsl")},Ue.hsv=function(t,e,n){return Ge(t,e,n,"hsv")};var We=s.clip_rgb,Ye=Math.pow,Ke=Math.sqrt,Xe=Math.PI,Je=Math.cos,Qe=Math.sin,Ze=Math.atan2,tn=function(t){for(var e=1/t.length,n=[0,0,0,0],r=0,i=t;r<i.length;r+=1){var o=i[r]._rgb;n[0]+=Ye(o[0],2)*e,n[1]+=Ye(o[1],2)*e,n[2]+=Ye(o[2],2)*e,n[3]+=o[3]*e}return n[0]=Ke(n[0]),n[1]=Ke(n[1]),n[2]=Ke(n[2]),n[3]>.9999999&&(n[3]=1),new h(We(n))},en=s.type,nn=Math.pow,rn=function(t){var e="rgb",n=v("#ccc"),r=0,i=[0,1],o=[],a=[0,0],s=!1,l=[],c=!1,u=0,d=1,f=!1,h={},p=!0,m=1,g=function(t){if((t=t||["#fff","#000"])&&"string"===en(t)&&v.brewer&&v.brewer[t.toLowerCase()]&&(t=v.brewer[t.toLowerCase()]),"array"===en(t)){1===t.length&&(t=[t[0],t[0]]),t=t.slice(0);for(var e=0;e<t.length;e++)t[e]=v(t[e]);o.length=0;for(var n=0;n<t.length;n++)o.push(n/(t.length-1))}return w(),l=t},b=function(t){return t},_=function(t){return t},y=function(t,r){var i,c;if(null==r&&(r=!1),isNaN(t)||null===t)return n;c=r?t:s&&s.length>2?function(t){if(null!=s){for(var e=s.length-1,n=0;n<e&&t>=s[n];)n++;return n-1}return 0}(t)/(s.length-2):d!==u?(t-u)/(d-u):1,c=_(c),r||(c=b(c)),1!==m&&(c=nn(c,m)),c=a[0]+c*(1-a[0]-a[1]),c=Math.min(1,Math.max(0,c));var f=Math.floor(1e4*c);if(p&&h[f])i=h[f];else{if("array"===en(l))for(var g=0;g<o.length;g++){var y=o[g];if(c<=y){i=l[g];break}if(c>=y&&g===o.length-1){i=l[g];break}if(c>y&&c<o[g+1]){c=(c-y)/(o[g+1]-y),i=v.interpolate(l[g],l[g+1],c,e);break}}else"function"===en(l)&&(i=l(c));p&&(h[f]=i)}return i},w=function(){return h={}};g(t);var x=function(t){var e=v(y(t));return c&&e[c]?e[c]():e};return x.classes=function(t){if(null!=t){if("array"===en(t))s=t,i=[t[0],t[t.length-1]];else{var e=v.analyze(i);s=0===t?[e.min,e.max]:v.limits(e,"e",t)}return x}return s},x.domain=function(t){if(!arguments.length)return i;u=t[0],d=t[t.length-1],o=[];var e=l.length;if(t.length===e&&u!==d)for(var n=0,r=Array.from(t);n<r.length;n+=1){var a=r[n];o.push((a-u)/(d-u))}else{for(var s=0;s<e;s++)o.push(s/(e-1));if(t.length>2){var c=t.map((function(e,n){return n/(t.length-1)})),f=t.map((function(t){return(t-u)/(d-u)}));f.every((function(t,e){return c[e]===t}))||(_=function(t){if(t<=0||t>=1)return t;for(var e=0;t>=f[e+1];)e++;var n=(t-f[e])/(f[e+1]-f[e]);return c[e]+n*(c[e+1]-c[e])})}}return i=[u,d],x},x.mode=function(t){return arguments.length?(e=t,w(),x):e},x.range=function(t,e){return g(t),x},x.out=function(t){return c=t,x},x.spread=function(t){return arguments.length?(r=t,x):r},x.correctLightness=function(t){return null==t&&(t=!0),f=t,w(),b=f?function(t){for(var e=y(0,!0).lab()[0],n=y(1,!0).lab()[0],r=e>n,i=y(t,!0).lab()[0],o=e+(n-e)*t,a=i-o,s=0,l=1,c=20;Math.abs(a)>.01&&c-- >0;)r&&(a*=-1),a<0?(s=t,t+=.5*(l-t)):(l=t,t+=.5*(s-t)),i=y(t,!0).lab()[0],a=i-o;return t}:function(t){return t},x},x.padding=function(t){return null!=t?("number"===en(t)&&(t=[t,t]),a=t,x):a},x.colors=function(e,n){arguments.length<2&&(n="hex");var r=[];if(0===arguments.length)r=l.slice(0);else if(1===e)r=[x(.5)];else if(e>1){var o=i[0],a=i[1]-o;r=on(0,e,!1).map((function(t){return x(o+t/(e-1)*a)}))}else{t=[];var c=[];if(s&&s.length>2)for(var u=1,d=s.length,f=1<=d;f?u<d:u>d;f?u++:u--)c.push(.5*(s[u-1]+s[u]));else c=i;r=c.map((function(t){return x(t)}))}return v[n]&&(r=r.map((function(t){return t[n]()}))),r},x.cache=function(t){return null!=t?(p=t,x):p},x.gamma=function(t){return null!=t?(m=t,x):m},x.nodata=function(t){return null!=t?(n=v(t),x):n},x};function on(t,e,n){for(var r=[],i=t<e,o=n?i?e+1:e-1:e,a=t;i?a<o:a>o;i?a++:a--)r.push(a);return r}var an=function t(e,n,r){if(!t[r])throw new Error("unknown blend mode "+r);return t[r](e,n)},sn=function(t){return function(e,n){var r=v(n).rgb(),i=v(e).rgb();return v.rgb(t(r,i))}},ln=function(t){return function(e,n){var r=[];return r[0]=t(e[0],n[0]),r[1]=t(e[1],n[1]),r[2]=t(e[2],n[2]),r}};an.normal=sn(ln((function(t){return t}))),an.multiply=sn(ln((function(t,e){return t*e/255}))),an.screen=sn(ln((function(t,e){return 255*(1-(1-t/255)*(1-e/255))}))),an.overlay=sn(ln((function(t,e){return e<128?2*t*e/255:255*(1-2*(1-t/255)*(1-e/255))}))),an.darken=sn(ln((function(t,e){return t>e?e:t}))),an.lighten=sn(ln((function(t,e){return t>e?t:e}))),an.dodge=sn(ln((function(t,e){return 255===t?255:(t=e/255*255/(1-t/255))>255?255:t}))),an.burn=sn(ln((function(t,e){return 255*(1-(1-e/255)/(t/255))})));for(var cn=an,un=s.type,dn=s.clip_rgb,fn=s.TWOPI,hn=Math.pow,pn=Math.sin,vn=Math.cos,mn=Math.floor,gn=Math.random,bn=Math.log,_n=Math.pow,yn=Math.floor,wn=Math.abs,xn=function(t,e){void 0===e&&(e=null);var n={min:Number.MAX_VALUE,max:-1*Number.MAX_VALUE,sum:0,values:[],count:0};return"object"===o(t)&&(t=Object.values(t)),t.forEach((function(t){e&&"object"===o(t)&&(t=t[e]),null==t||isNaN(t)||(n.values.push(t),n.sum+=t,t<n.min&&(n.min=t),t>n.max&&(n.max=t),n.count+=1)})),n.domain=[n.min,n.max],n.limits=function(t,e){return kn(n,t,e)},n},kn=function(t,e,n){void 0===e&&(e="equal"),void 0===n&&(n=7),"array"==o(t)&&(t=xn(t));var r=t.min,i=t.max,a=t.values.sort((function(t,e){return t-e}));if(1===n)return[r,i];var s=[];if("c"===e.substr(0,1)&&(s.push(r),s.push(i)),"e"===e.substr(0,1)){s.push(r);for(var l=1;l<n;l++)s.push(r+l/n*(i-r));s.push(i)}else if("l"===e.substr(0,1)){if(r<=0)throw new Error("Logarithmic scales are only possible for values > 0");var c=Math.LOG10E*bn(r),u=Math.LOG10E*bn(i);s.push(r);for(var d=1;d<n;d++)s.push(_n(10,c+d/n*(u-c)));s.push(i)}else if("q"===e.substr(0,1)){s.push(r);for(var f=1;f<n;f++){var h=(a.length-1)*f/n,p=yn(h);if(p===h)s.push(a[p]);else{var v=h-p;s.push(a[p]*(1-v)+a[p+1]*v)}}s.push(i)}else if("k"===e.substr(0,1)){var m,g=a.length,b=new Array(g),_=new Array(n),y=!0,w=0,x=null;(x=[]).push(r);for(var k=1;k<n;k++)x.push(r+k/n*(i-r));for(x.push(i);y;){for(var N=0;N<n;N++)_[N]=0;for(var T=0;T<g;T++)for(var O=a[T],C=Number.MAX_VALUE,M=void 0,A=0;A<n;A++){var E=wn(x[A]-O);E<C&&(C=E,M=A),_[M]++,b[T]=M}for(var S=new Array(n),j=0;j<n;j++)S[j]=null;for(var I=0;I<g;I++)null===S[m=b[I]]?S[m]=a[I]:S[m]+=a[I];for(var L=0;L<n;L++)S[L]*=1/_[L];y=!1;for(var P=0;P<n;P++)if(S[P]!==x[P]){y=!0;break}x=S,++w>200&&(y=!1)}for(var R={},D=0;D<n;D++)R[D]=[];for(var z=0;z<g;z++)R[m=b[z]].push(a[z]);for(var U=[],H=0;H<n;H++)U.push(R[H][0]),U.push(R[H][R[H].length-1]);U=U.sort((function(t,e){return t-e})),s.push(U[0]);for(var F=1;F<U.length;F+=2){var $=U[F];isNaN($)||-1!==s.indexOf($)||s.push($)}}return s},Nn={analyze:xn,limits:kn},Tn=Math.sqrt,On=Math.atan2,Cn=Math.abs,Mn=Math.cos,An=Math.PI,En={cool:function(){return rn([v.hsl(180,1,.9),v.hsl(250,.7,.4)])},hot:function(){return rn(["#000","#f00","#ff0","#fff"]).mode("rgb")}},Sn={OrRd:["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"],PuBu:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"],BuPu:["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"],Oranges:["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"],BuGn:["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"],YlOrBr:["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"],YlGn:["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"],Reds:["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"],RdPu:["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"],Greens:["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"],YlGnBu:["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],Purples:["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"],GnBu:["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"],Greys:["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"],YlOrRd:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"],PuRd:["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"],Blues:["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"],PuBuGn:["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"],Viridis:["#440154","#482777","#3f4a8a","#31678e","#26838f","#1f9d8a","#6cce5a","#b6de2b","#fee825"],Spectral:["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],RdYlGn:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],RdBu:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],PiYG:["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],PRGn:["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],RdYlBu:["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],BrBG:["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],RdGy:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],PuOr:["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],Set2:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"],Accent:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"],Set1:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"],Set3:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"],Dark2:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"],Paired:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"],Pastel2:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"],Pastel1:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]},jn=0,In=Object.keys(Sn);jn<In.length;jn+=1){var Ln=In[jn];Sn[Ln.toLowerCase()]=Sn[Ln]}var Pn=Sn;return v.average=function(t,e){void 0===e&&(e="lrgb");var n=t.length;if(t=t.map((function(t){return new h(t)})),"lrgb"===e)return tn(t);for(var r=t.shift(),i=r.get(e),o=[],a=0,s=0,l=0;l<i.length;l++)if(i[l]=i[l]||0,o.push(isNaN(i[l])?0:1),"h"===e.charAt(l)&&!isNaN(i[l])){var c=i[l]/180*Xe;a+=Je(c),s+=Qe(c)}var u=r.alpha();t.forEach((function(t){var n=t.get(e);u+=t.alpha();for(var r=0;r<i.length;r++)if(!isNaN(n[r]))if(o[r]++,"h"===e.charAt(r)){var l=n[r]/180*Xe;a+=Je(l),s+=Qe(l)}else i[r]+=n[r]}));for(var d=0;d<i.length;d++)if("h"===e.charAt(d)){for(var f=Ze(s/o[d],a/o[d])/Xe*180;f<0;)f+=360;for(;f>=360;)f-=360;i[d]=f}else i[d]=i[d]/o[d];return u/=n,new h(i,e).alpha(u>.99999?1:u,!0)},v.bezier=function(t){var e=function t(e){var n,r,i,o,a,s,l;if(2===(e=e.map((function(t){return new h(t)}))).length)n=e.map((function(t){return t.lab()})),a=n[0],s=n[1],o=function(t){var e=[0,1,2].map((function(e){return a[e]+t*(s[e]-a[e])}));return new h(e,"lab")};else if(3===e.length)r=e.map((function(t){return t.lab()})),a=r[0],s=r[1],l=r[2],o=function(t){var e=[0,1,2].map((function(e){return(1-t)*(1-t)*a[e]+2*(1-t)*t*s[e]+t*t*l[e]}));return new h(e,"lab")};else if(4===e.length){var c;i=e.map((function(t){return t.lab()})),a=i[0],s=i[1],l=i[2],c=i[3],o=function(t){var e=[0,1,2].map((function(e){return(1-t)*(1-t)*(1-t)*a[e]+3*(1-t)*(1-t)*t*s[e]+3*(1-t)*t*t*l[e]+t*t*t*c[e]}));return new h(e,"lab")}}else if(5===e.length){var u=t(e.slice(0,3)),d=t(e.slice(2,5));o=function(t){return t<.5?u(2*t):d(2*(t-.5))}}return o}(t);return e.scale=function(){return rn(e)},e},v.blend=cn,v.cubehelix=function(t,e,n,r,i){void 0===t&&(t=300),void 0===e&&(e=-1.5),void 0===n&&(n=1),void 0===r&&(r=1),void 0===i&&(i=[0,1]);var o,a=0;"array"===un(i)?o=i[1]-i[0]:(o=0,i=[i,i]);var s=function(s){var l=fn*((t+120)/360+e*s),c=hn(i[0]+o*s,r),u=(0!==a?n[0]+s*a:n)*c*(1-c)/2,d=vn(l),f=pn(l);return v(dn([255*(c+u*(-.14861*d+1.78277*f)),255*(c+u*(-.29227*d-.90649*f)),255*(c+u*(1.97294*d)),1]))};return s.start=function(e){return null==e?t:(t=e,s)},s.rotations=function(t){return null==t?e:(e=t,s)},s.gamma=function(t){return null==t?r:(r=t,s)},s.hue=function(t){return null==t?n:("array"===un(n=t)?0==(a=n[1]-n[0])&&(n=n[1]):a=0,s)},s.lightness=function(t){return null==t?i:("array"===un(t)?(i=t,o=t[1]-t[0]):(i=[t,t],o=0),s)},s.scale=function(){return v.scale(s)},s.hue(n),s},v.mix=v.interpolate=Fe,v.random=function(){for(var t="#",e=0;e<6;e++)t+="0123456789abcdef".charAt(mn(16*gn()));return new h(t,"hex")},v.scale=rn,v.analyze=Nn.analyze,v.contrast=function(t,e){t=new h(t),e=new h(e);var n=t.luminance(),r=e.luminance();return n>r?(n+.05)/(r+.05):(r+.05)/(n+.05)},v.deltaE=function(t,e,n,r){void 0===n&&(n=1),void 0===r&&(r=1),t=new h(t),e=new h(e);for(var i=Array.from(t.lab()),o=i[0],a=i[1],s=i[2],l=Array.from(e.lab()),c=l[0],u=l[1],d=l[2],f=Tn(a*a+s*s),p=Tn(u*u+d*d),v=o<16?.511:.040975*o/(1+.01765*o),m=.0638*f/(1+.0131*f)+.638,g=f<1e-6?0:180*On(s,a)/An;g<0;)g+=360;for(;g>=360;)g-=360;var b=g>=164&&g<=345?.56+Cn(.2*Mn(An*(g+168)/180)):.36+Cn(.4*Mn(An*(g+35)/180)),_=f*f*f*f,y=Tn(_/(_+1900)),w=m*(y*b+1-y),x=f-p,k=a-u,N=s-d,T=(o-c)/(n*v),O=x/(r*m);return Tn(T*T+O*O+(k*k+N*N-x*x)/(w*w))},v.distance=function(t,e,n){void 0===n&&(n="lab"),t=new h(t),e=new h(e);var r=t.get(n),i=e.get(n),o=0;for(var a in r){var s=(r[a]||0)-(i[a]||0);o+=s*s}return Math.sqrt(o)},v.limits=Nn.limits,v.valid=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];try{return new(Function.prototype.bind.apply(h,[null].concat(t))),!0}catch(t){return!1}},v.scales=En,v.colors=_e,v.brewer=Pn,v}()}));function Xt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(!e)return t;for(var r=e.split("."),i=t,o=0;o<r.length&&null!=i;o++)i=i[r[o]];return null==i?n:i}var Jt="object"==("undefined"==typeof self?"undefined":n(self))&&self.self===self&&self||"object"==("undefined"==typeof global?"undefined":n(global))&&global.global===global&&global||Function("return this")()||{},Qt=Array.prototype,Zt=Object.prototype,te="undefined"!=typeof Symbol?Symbol.prototype:null,ee=Qt.push,ne=Qt.slice,re=Zt.toString,ie=Zt.hasOwnProperty,oe="undefined"!=typeof ArrayBuffer,ae=Array.isArray,se=Object.keys,le=Object.create,ce=oe&&ArrayBuffer.isView,ue=isNaN,de=isFinite,fe=!{toString:null}.propertyIsEnumerable("toString"),he=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],pe=Math.pow(2,53)-1;function ve(t,e){return e=null==e?t.length-1:+e,function(){for(var n=Math.max(arguments.length-e,0),r=Array(n),i=0;i<n;i++)r[i]=arguments[i+e];switch(e){case 0:return t.call(this,r);case 1:return t.call(this,arguments[0],r);case 2:return t.call(this,arguments[0],arguments[1],r)}var o=Array(e+1);for(i=0;i<e;i++)o[i]=arguments[i];return o[e]=r,t.apply(this,o)}}function me(t){var e=n(t);return"function"===e||"object"===e&&!!t}function ge(t){return!0===t||!1===t||"[object Boolean]"===re.call(t)}function be(t){return function(e){return re.call(e)==="[object "+t+"]"}}var _e=be("String"),ye=be("Number"),we=be("Date"),xe=be("RegExp"),ke=be("Error"),Ne=be("Symbol"),Te=be("Map"),Oe=be("WeakMap"),Ce=be("Set"),Me=be("WeakSet"),Ae=be("ArrayBuffer"),Ee=be("DataView"),Se=ae||be("Array"),je=be("Function"),Ie=Jt.document&&Jt.document.childNodes;"function"!=typeof/./&&"object"!=("undefined"==typeof Int8Array?"undefined":n(Int8Array))&&"function"!=typeof Ie&&(je=function(t){return"function"==typeof t||!1});var Le=je;function Pe(t,e){return null!=t&&ie.call(t,e)}var Re=be("Arguments");!function(){Re(arguments)||(Re=function(t){return Pe(t,"callee")})}();var De=Re;function ze(t){return ye(t)&&ue(t)}function Ue(t){return function(){return t}}function He(t){return function(e){var n=t(e);return"number"==typeof n&&n>=0&&n<=pe}}function Fe(t){return function(e){return null==e?void 0:e[t]}}var $e=Fe("byteLength"),Be=He($e),qe=/\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;var Ge=oe?function(t){return ce?ce(t)&&!Ee(t):Be(t)&&qe.test(re.call(t))}:Ue(!1),Ve=Fe("length"),We=He(Ve);function Ye(t,e){e=function(t){for(var e={},n=t.length,r=0;r<n;++r)e[t[r]]=!0;return{contains:function(t){return e[t]},push:function(n){return e[n]=!0,t.push(n)}}}(e);var n=he.length,r=t.constructor,i=Le(r)&&r.prototype||Zt,o="constructor";for(Pe(t,o)&&!e.contains(o)&&e.push(o);n--;)(o=he[n])in t&&t[o]!==i[o]&&!e.contains(o)&&e.push(o)}function Ke(t){if(!me(t))return[];if(se)return se(t);var e=[];for(var n in t)Pe(t,n)&&e.push(n);return fe&&Ye(t,e),e}function Xe(t,e){var n=Ke(e),r=n.length;if(null==t)return!r;for(var i=Object(t),o=0;o<r;o++){var a=n[o];if(e[a]!==i[a]||!(a in i))return!1}return!0}function Je(t){return t instanceof Je?t:this instanceof Je?void(this._wrapped=t):new Je(t)}function Qe(t,e,r,i){if(t===e)return 0!==t||1/t==1/e;if(null==t||null==e)return!1;if(t!=t)return e!=e;var o=n(t);return("function"===o||"object"===o||"object"==n(e))&&function t(e,r,i,o){e instanceof Je&&(e=e._wrapped);r instanceof Je&&(r=r._wrapped);var a=re.call(e);if(a!==re.call(r))return!1;switch(a){case"[object RegExp]":case"[object String]":return""+e==""+r;case"[object Number]":return+e!=+e?+r!=+r:0==+e?1/+e==1/r:+e==+r;case"[object Date]":case"[object Boolean]":return+e==+r;case"[object Symbol]":return te.valueOf.call(e)===te.valueOf.call(r);case"[object ArrayBuffer]":return t(new DataView(e),new DataView(r),i,o);case"[object DataView]":var s=$e(e);if(s!==$e(r))return!1;for(;s--;)if(e.getUint8(s)!==r.getUint8(s))return!1;return!0}if(Ge(e))return t(new DataView(e.buffer),new DataView(r.buffer),i,o);var l="[object Array]"===a;if(!l){if("object"!=n(e)||"object"!=n(r))return!1;var c=e.constructor,u=r.constructor;if(c!==u&&!(Le(c)&&c instanceof c&&Le(u)&&u instanceof u)&&"constructor"in e&&"constructor"in r)return!1}o=o||[];var d=(i=i||[]).length;for(;d--;)if(i[d]===e)return o[d]===r;if(i.push(e),o.push(r),l){if((d=e.length)!==r.length)return!1;for(;d--;)if(!Qe(e[d],r[d],i,o))return!1}else{var f,h=Ke(e);if(d=h.length,Ke(r).length!==d)return!1;for(;d--;)if(f=h[d],!Pe(r,f)||!Qe(e[f],r[f],i,o))return!1}return i.pop(),o.pop(),!0}(t,e,r,i)}function Ze(t){if(!me(t))return[];var e=[];for(var n in t)e.push(n);return fe&&Ye(t,e),e}function tn(t){for(var e=Ke(t),n=e.length,r=Array(n),i=0;i<n;i++)r[i]=t[e[i]];return r}function en(t){for(var e={},n=Ke(t),r=0,i=n.length;r<i;r++)e[t[n[r]]]=n[r];return e}function nn(t){var e=[];for(var n in t)Le(t[n])&&e.push(n);return e.sort()}function rn(t,e){return function(n){var r=arguments.length;if(e&&(n=Object(n)),r<2||null==n)return n;for(var i=1;i<r;i++)for(var o=arguments[i],a=t(o),s=a.length,l=0;l<s;l++){var c=a[l];e&&void 0!==n[c]||(n[c]=o[c])}return n}}Je.VERSION="1.11.0",Je.prototype.value=function(){return this._wrapped},Je.prototype.valueOf=Je.prototype.toJSON=Je.prototype.value,Je.prototype.toString=function(){return String(this._wrapped)};var on=rn(Ze),an=rn(Ke),sn=rn(Ze,!0);function ln(t){if(!me(t))return{};if(le)return le(t);var e=function(){};e.prototype=t;var n=new e;return e.prototype=null,n}function cn(t){return me(t)?Se(t)?t.slice():on({},t):t}function un(t){return t}function dn(t){return t=an({},t),function(e){return Xe(e,t)}}function fn(t,e){for(var n=e.length,r=0;r<n;r++){if(null==t)return;t=t[e[r]]}return n?t:void 0}function hn(t){return Se(t)?function(e){return fn(e,t)}:Fe(t)}function pn(t,e,n){if(void 0===e)return t;switch(null==n?3:n){case 1:return function(n){return t.call(e,n)};case 3:return function(n,r,i){return t.call(e,n,r,i)};case 4:return function(n,r,i,o){return t.call(e,n,r,i,o)}}return function(){return t.apply(e,arguments)}}function vn(t,e,n){return null==t?un:Le(t)?pn(t,e,n):me(t)&&!Se(t)?dn(t):hn(t)}function mn(t,e){return vn(t,e,1/0)}function gn(t,e,n){return Je.iteratee!==mn?Je.iteratee(t,e):vn(t,e,n)}function bn(t,e){return null==e&&(e=t,t=0),t+Math.floor(Math.random()*(e-t+1))}Je.iteratee=mn;var _n=Date.now||function(){return(new Date).getTime()};function yn(t){var e=function(e){return t[e]},n="(?:"+Ke(t).join("|")+")",r=RegExp(n),i=RegExp(n,"g");return function(t){return t=null==t?"":""+t,r.test(t)?t.replace(i,e):t}}var wn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},xn=yn(wn),kn=yn(en(wn)),Nn=Je.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g},Tn=/(.)^/,On={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},Cn=/\\|'|\r|\n|\u2028|\u2029/g;function Mn(t){return"\\"+On[t]}var An=0;function En(t,e,n,r,i){if(!(r instanceof e))return t.apply(n,i);var o=ln(t.prototype),a=t.apply(o,i);return me(a)?a:o}var Sn=ve((function(t,e){var n=Sn.placeholder;return function r(){for(var i=0,o=e.length,a=Array(o),s=0;s<o;s++)a[s]=e[s]===n?arguments[i++]:e[s];for(;i<arguments.length;)a.push(arguments[i++]);return En(t,r,this,this,a)}}));Sn.placeholder=Je;var jn=ve((function(t,e,n){if(!Le(t))throw new TypeError("Bind must be called on a function");var r=ve((function(i){return En(t,r,e,this,n.concat(i))}));return r}));function In(t,e,n,r){if(r=r||[],e||0===e){if(e<=0)return r.concat(t)}else e=1/0;for(var i=r.length,o=0,a=Ve(t);o<a;o++){var s=t[o];if(We(s)&&(Se(s)||De(s)))if(e>1)In(s,e-1,n,r),i=r.length;else for(var l=0,c=s.length;l<c;)r[i++]=s[l++];else n||(r[i++]=s)}return r}var Ln=ve((function(t,e){var n=(e=In(e,!1,!1)).length;if(n<1)throw new Error("bindAll must be passed function names");for(;n--;){var r=e[n];t[r]=jn(t[r],t)}return t}));var Pn=ve((function(t,e,n){return setTimeout((function(){return t.apply(null,n)}),e)})),Rn=Sn(Pn,Je,1);function Dn(t,e,n){var r,i,o=function(e,n){r=null,n&&(i=t.apply(e,n))},a=ve((function(a){if(r&&clearTimeout(r),n){var s=!r;r=setTimeout(o,e),s&&(i=t.apply(this,a))}else r=Pn(o,e,this,a);return i}));return a.cancel=function(){clearTimeout(r),r=null},a}function zn(t){return function(){return!t.apply(this,arguments)}}function Un(t,e){var n;return function(){return--t>0&&(n=e.apply(this,arguments)),t<=1&&(e=null),n}}var Hn=Sn(Un,2);function Fn(t,e,n){e=gn(e,n);for(var r,i=Ke(t),o=0,a=i.length;o<a;o++)if(e(t[r=i[o]],r,t))return r}function $n(t){return function(e,n,r){n=gn(n,r);for(var i=Ve(e),o=t>0?0:i-1;o>=0&&o<i;o+=t)if(n(e[o],o,e))return o;return-1}}var Bn=$n(1),qn=$n(-1);function Gn(t,e,n,r){for(var i=(n=gn(n,r,1))(e),o=0,a=Ve(t);o<a;){var s=Math.floor((o+a)/2);n(t[s])<i?o=s+1:a=s}return o}function Vn(t,e,n){return function(r,i,o){var a=0,s=Ve(r);if("number"==typeof o)t>0?a=o>=0?o:Math.max(o+s,a):s=o>=0?Math.min(o+1,s):o+s+1;else if(n&&o&&s)return r[o=n(r,i)]===i?o:-1;if(i!=i)return(o=e(ne.call(r,a,s),ze))>=0?o+a:-1;for(o=t>0?a:s-1;o>=0&&o<s;o+=t)if(r[o]===i)return o;return-1}}var Wn=Vn(1,Bn,Gn),Yn=Vn(-1,qn);function Kn(t,e,n){var r=(We(t)?Bn:Fn)(t,e,n);if(void 0!==r&&-1!==r)return t[r]}function Xn(t,e,n){var r,i;if(e=pn(e,n),We(t))for(r=0,i=t.length;r<i;r++)e(t[r],r,t);else{var o=Ke(t);for(r=0,i=o.length;r<i;r++)e(t[o[r]],o[r],t)}return t}function Jn(t,e,n){e=gn(e,n);for(var r=!We(t)&&Ke(t),i=(r||t).length,o=Array(i),a=0;a<i;a++){var s=r?r[a]:a;o[a]=e(t[s],s,t)}return o}function Qn(t){var e=function(e,n,r,i){var o=!We(e)&&Ke(e),a=(o||e).length,s=t>0?0:a-1;for(i||(r=e[o?o[s]:s],s+=t);s>=0&&s<a;s+=t){var l=o?o[s]:s;r=n(r,e[l],l,e)}return r};return function(t,n,r,i){var o=arguments.length>=3;return e(t,pn(n,i,4),r,o)}}var Zn=Qn(1),tr=Qn(-1);function er(t,e,n){var r=[];return e=gn(e,n),Xn(t,(function(t,n,i){e(t,n,i)&&r.push(t)})),r}function nr(t,e,n){e=gn(e,n);for(var r=!We(t)&&Ke(t),i=(r||t).length,o=0;o<i;o++){var a=r?r[o]:o;if(!e(t[a],a,t))return!1}return!0}function rr(t,e,n){e=gn(e,n);for(var r=!We(t)&&Ke(t),i=(r||t).length,o=0;o<i;o++){var a=r?r[o]:o;if(e(t[a],a,t))return!0}return!1}function ir(t,e,n,r){return We(t)||(t=tn(t)),("number"!=typeof n||r)&&(n=0),Wn(t,e,n)>=0}var or=ve((function(t,e,n){var r,i;return Le(e)?i=e:Se(e)&&(r=e.slice(0,-1),e=e[e.length-1]),Jn(t,(function(t){var o=i;if(!o){if(r&&r.length&&(t=fn(t,r)),null==t)return;o=t[e]}return null==o?o:o.apply(t,n)}))}));function ar(t,e){return Jn(t,hn(e))}function sr(t,e,r){var i,o,a=-1/0,s=-1/0;if(null==e||"number"==typeof e&&"object"!=n(t[0])&&null!=t)for(var l=0,c=(t=We(t)?t:tn(t)).length;l<c;l++)null!=(i=t[l])&&i>a&&(a=i);else e=gn(e,r),Xn(t,(function(t,n,r){((o=e(t,n,r))>s||o===-1/0&&a===-1/0)&&(a=t,s=o)}));return a}function lr(t,e,n){if(null==e||n)return We(t)||(t=tn(t)),t[bn(t.length-1)];var r=We(t)?cn(t):tn(t),i=Ve(r);e=Math.max(Math.min(e,i),0);for(var o=i-1,a=0;a<e;a++){var s=bn(a,o),l=r[a];r[a]=r[s],r[s]=l}return r.slice(0,e)}function cr(t,e){return function(n,r,i){var o=e?[[],[]]:{};return r=gn(r,i),Xn(n,(function(e,i){var a=r(e,i,n);t(o,e,a)})),o}}var ur=cr((function(t,e,n){Pe(t,n)?t[n].push(e):t[n]=[e]})),dr=cr((function(t,e,n){t[n]=e})),fr=cr((function(t,e,n){Pe(t,n)?t[n]++:t[n]=1})),hr=cr((function(t,e,n){t[n?0:1].push(e)}),!0),pr=/[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;function vr(t,e,n){return e in n}var mr=ve((function(t,e){var n={},r=e[0];if(null==t)return n;Le(r)?(e.length>1&&(r=pn(r,e[1])),e=Ze(t)):(r=vr,e=In(e,!1,!1),t=Object(t));for(var i=0,o=e.length;i<o;i++){var a=e[i],s=t[a];r(s,a,t)&&(n[a]=s)}return n})),gr=ve((function(t,e){var n,r=e[0];return Le(r)?(r=zn(r),e.length>1&&(n=e[1])):(e=Jn(In(e,!1,!1),String),r=function(t,n){return!ir(e,n)}),mr(t,r,n)}));function br(t,e,n){return ne.call(t,0,Math.max(0,t.length-(null==e||n?1:e)))}function _r(t,e,n){return null==t||t.length<1?null==e||n?void 0:[]:null==e||n?t[0]:br(t,t.length-e)}function yr(t,e,n){return ne.call(t,null==e||n?1:e)}var wr=ve((function(t,e){return e=In(e,!0,!0),er(t,(function(t){return!ir(e,t)}))})),xr=ve((function(t,e){return wr(t,e)}));function kr(t,e,n,r){ge(e)||(r=n,n=e,e=!1),null!=n&&(n=gn(n,r));for(var i=[],o=[],a=0,s=Ve(t);a<s;a++){var l=t[a],c=n?n(l,a,t):l;e&&!n?(a&&o===c||i.push(l),o=c):n?ir(o,c)||(o.push(c),i.push(l)):ir(i,l)||i.push(l)}return i}var Nr=ve((function(t){return kr(In(t,!0,!0))}));function Tr(t){for(var e=t&&sr(t,Ve).length||0,n=Array(e),r=0;r<e;r++)n[r]=ar(t,r);return n}var Or=ve(Tr);function Cr(t,e){return t._chain?Je(e).chain():e}function Mr(t){return Xn(nn(t),(function(e){var n=Je[e]=t[e];Je.prototype[e]=function(){var t=[this._wrapped];return ee.apply(t,arguments),Cr(this,n.apply(Je,t))}})),Je}Xn(["pop","push","reverse","shift","sort","splice","unshift"],(function(t){var e=Qt[t];Je.prototype[t]=function(){var n=this._wrapped;return null!=n&&(e.apply(n,arguments),"shift"!==t&&"splice"!==t||0!==n.length||delete n[0]),Cr(this,n)}})),Xn(["concat","join","slice"],(function(t){var e=Qt[t];Je.prototype[t]=function(){var t=this._wrapped;return null!=t&&(t=e.apply(t,arguments)),Cr(this,t)}}));var Ar=Mr(Object.freeze({__proto__:null,VERSION:"1.11.0",restArguments:ve,isObject:me,isNull:function(t){return null===t},isUndefined:function(t){return void 0===t},isBoolean:ge,isElement:function(t){return!(!t||1!==t.nodeType)},isString:_e,isNumber:ye,isDate:we,isRegExp:xe,isError:ke,isSymbol:Ne,isMap:Te,isWeakMap:Oe,isSet:Ce,isWeakSet:Me,isArrayBuffer:Ae,isDataView:Ee,isArray:Se,isFunction:Le,isArguments:De,isFinite:function(t){return!Ne(t)&&de(t)&&!isNaN(parseFloat(t))},isNaN:ze,isTypedArray:Ge,isEmpty:function(t){return null==t||(We(t)&&(Se(t)||_e(t)||De(t))?0===t.length:0===Ke(t).length)},isMatch:Xe,isEqual:function(t,e){return Qe(t,e)},keys:Ke,allKeys:Ze,values:tn,pairs:function(t){for(var e=Ke(t),n=e.length,r=Array(n),i=0;i<n;i++)r[i]=[e[i],t[e[i]]];return r},invert:en,functions:nn,methods:nn,extend:on,extendOwn:an,assign:an,defaults:sn,create:function(t,e){var n=ln(t);return e&&an(n,e),n},clone:cn,tap:function(t,e){return e(t),t},has:function(t,e){if(!Se(e))return Pe(t,e);for(var n=e.length,r=0;r<n;r++){var i=e[r];if(null==t||!ie.call(t,i))return!1;t=t[i]}return!!n},mapObject:function(t,e,n){e=gn(e,n);for(var r=Ke(t),i=r.length,o={},a=0;a<i;a++){var s=r[a];o[s]=e(t[s],s,t)}return o},identity:un,constant:Ue,noop:function(){},property:hn,propertyOf:function(t){return null==t?function(){}:function(e){return Se(e)?fn(t,e):t[e]}},matcher:dn,matches:dn,times:function(t,e,n){var r=Array(Math.max(0,t));e=pn(e,n,1);for(var i=0;i<t;i++)r[i]=e(i);return r},random:bn,now:_n,escape:xn,unescape:kn,templateSettings:Nn,template:function(t,e,n){!e&&n&&(e=n),e=sn({},e,Je.templateSettings);var r,i=RegExp([(e.escape||Tn).source,(e.interpolate||Tn).source,(e.evaluate||Tn).source].join("|")+"|$","g"),o=0,a="__p+='";t.replace(i,(function(e,n,r,i,s){return a+=t.slice(o,s).replace(Cn,Mn),o=s+e.length,n?a+="'+\n((__t=("+n+"))==null?'':_.escape(__t))+\n'":r?a+="'+\n((__t=("+r+"))==null?'':__t)+\n'":i&&(a+="';\n"+i+"\n__p+='"),e})),a+="';\n",e.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{r=new Function(e.variable||"obj","_",a)}catch(t){throw t.source=a,t}var s=function(t){return r.call(this,t,Je)},l=e.variable||"obj";return s.source="function("+l+"){\n"+a+"}",s},result:function(t,e,n){Se(e)||(e=[e]);var r=e.length;if(!r)return Le(n)?n.call(t):n;for(var i=0;i<r;i++){var o=null==t?void 0:t[e[i]];void 0===o&&(o=n,i=r),t=Le(o)?o.call(t):o}return t},uniqueId:function(t){var e=++An+"";return t?t+e:e},chain:function(t){var e=Je(t);return e._chain=!0,e},iteratee:mn,partial:Sn,bind:jn,bindAll:Ln,memoize:function(t,e){var n=function n(r){var i=n.cache,o=""+(e?e.apply(this,arguments):r);return Pe(i,o)||(i[o]=t.apply(this,arguments)),i[o]};return n.cache={},n},delay:Pn,defer:Rn,throttle:function(t,e,n){var r,i,o,a,s=0;n||(n={});var l=function(){s=!1===n.leading?0:_n(),r=null,a=t.apply(i,o),r||(i=o=null)},c=function(){var c=_n();s||!1!==n.leading||(s=c);var u=e-(c-s);return i=this,o=arguments,u<=0||u>e?(r&&(clearTimeout(r),r=null),s=c,a=t.apply(i,o),r||(i=o=null)):r||!1===n.trailing||(r=setTimeout(l,u)),a};return c.cancel=function(){clearTimeout(r),s=0,r=i=o=null},c},debounce:Dn,wrap:function(t,e){return Sn(e,t)},negate:zn,compose:function(){var t=arguments,e=t.length-1;return function(){for(var n=e,r=t[e].apply(this,arguments);n--;)r=t[n].call(this,r);return r}},after:function(t,e){return function(){if(--t<1)return e.apply(this,arguments)}},before:Un,once:Hn,findKey:Fn,findIndex:Bn,findLastIndex:qn,sortedIndex:Gn,indexOf:Wn,lastIndexOf:Yn,find:Kn,detect:Kn,findWhere:function(t,e){return Kn(t,dn(e))},each:Xn,forEach:Xn,map:Jn,collect:Jn,reduce:Zn,foldl:Zn,inject:Zn,reduceRight:tr,foldr:tr,filter:er,select:er,reject:function(t,e,n){return er(t,zn(gn(e)),n)},every:nr,all:nr,some:rr,any:rr,contains:ir,includes:ir,include:ir,invoke:or,pluck:ar,where:function(t,e){return er(t,dn(e))},max:sr,min:function(t,e,r){var i,o,a=1/0,s=1/0;if(null==e||"number"==typeof e&&"object"!=n(t[0])&&null!=t)for(var l=0,c=(t=We(t)?t:tn(t)).length;l<c;l++)null!=(i=t[l])&&i<a&&(a=i);else e=gn(e,r),Xn(t,(function(t,n,r){((o=e(t,n,r))<s||o===1/0&&a===1/0)&&(a=t,s=o)}));return a},shuffle:function(t){return lr(t,1/0)},sample:lr,sortBy:function(t,e,n){var r=0;return e=gn(e,n),ar(Jn(t,(function(t,n,i){return{value:t,index:r++,criteria:e(t,n,i)}})).sort((function(t,e){var n=t.criteria,r=e.criteria;if(n!==r){if(n>r||void 0===n)return 1;if(n<r||void 0===r)return-1}return t.index-e.index})),"value")},groupBy:ur,indexBy:dr,countBy:fr,partition:hr,toArray:function(t){return t?Se(t)?ne.call(t):_e(t)?t.match(pr):We(t)?Jn(t,un):tn(t):[]},size:function(t){return null==t?0:We(t)?t.length:Ke(t).length},pick:mr,omit:gr,first:_r,head:_r,take:_r,initial:br,last:function(t,e,n){return null==t||t.length<1?null==e||n?void 0:[]:null==e||n?t[t.length-1]:yr(t,Math.max(0,t.length-e))},rest:yr,tail:yr,drop:yr,compact:function(t){return er(t,Boolean)},flatten:function(t,e){return In(t,e,!1)},without:xr,uniq:kr,unique:kr,union:Nr,intersection:function(t){for(var e=[],n=arguments.length,r=0,i=Ve(t);r<i;r++){var o=t[r];if(!ir(e,o)){var a;for(a=1;a<n&&ir(arguments[a],o);a++);a===n&&e.push(o)}}return e},difference:wr,unzip:Tr,transpose:Tr,zip:Or,object:function(t,e){for(var n={},r=0,i=Ve(t);r<i;r++)e?n[t[r]]=e[r]:n[t[r][0]]=t[r][1];return n},range:function(t,e,n){null==e&&(e=t||0,t=0),n||(n=e<t?-1:1);for(var r=Math.max(Math.ceil((e-t)/n),0),i=Array(r),o=0;o<r;o++,t+=n)i[o]=t;return i},chunk:function(t,e){if(null==e||e<1)return[];for(var n=[],r=0,i=t.length;r<i;)n.push(ne.call(t,r,r+=e));return n},mixin:Mr,default:Je}));Ar._=Ar;var Er="#00000000";function Sr(t){return Kt.valid(t)?t===Er?"#ddd":Kt(t).darker().alpha(1).hex():"#ccc"}function jr(t){return Kt.valid(t)?"#ffffff"===Kt(t).hex("rgb")?"#eeeeee":t:"#ccc"}function Ir(t){return Kt.valid(t)?Kt(t).alpha():0}var Lr={windowClick:function(t){if(!this.refs.picker.contains(t.target)&&!t.target.classList.contains("btn-color-reset")){var e=this.get(),n=e.open,r=e.color_;n&&this.setColor(r,!0,!0)}},windowKeydown:function(t){var e=this.get(),n=e.open,r=e.color_;n&&"Enter"===t.key&&this.setColor(r,!1,!0),n&&"Escape"===t.key&&this.set({open:!1})},setColor:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=this.get(),i=r.palette,o=r.returnPaletteIndex,a=t;if(n){var s=this.get(),l=s.inputColor;try{a=Kt(Hr(l,i)).hex()}catch(t){return}}this.set({color:zr(a,i,o),inputColor:Ur(a,i)}),e&&this.set({open:!1})},resetColor:function(){var t=this.get().initial;this.set({color_:Er}),this.fire("change",t),this.setColor(t,!0)}};function Pr(t){var e=this,n=t.changed,r=t.current,i=t.previous;if(n.color&&r.color!==Er&&!i){var o=Ur(r.color||0===r.color?r.color:Er,r.palette);setTimeout((function(){e.set({color_:o,inputColor:o})}),100)}else if(n.color&&!r.color&&0!==r.color)this.set({color_:Er,inputColor:Er});else if(n.color&&(r.color||0===r.color)&&i){r.open&&this.fire("change",r.color);var a=Ur(r.color,r.palette);this.set({color_:a,inputColor:a})}if(n.inputColor&&i){var s=Hr(r.inputColor,r.palette);try{this.set({lastValidInputColor:Kt(s).hex()})}catch(t){}}n.open&&r.open&&this.set({previousColor:r.color_})}function Rr(t,e){var n=-1,r=999999;return t[0]===t[1]?"-":(t.forEach((function(t,i){var o=Kt.distance(t,e,"lab");o<r&&(r=o,n=i)})),t[n])}function Dr(t,e,n,r,i){var o=[t],a=e/n,s=0;for(r=Ar.isUndefined(r)?n:r;n-- >0;)s+=a,o.unshift(t-s),r-- >0&&o.push(t+s);return o}function zr(t,e,r){if("object"===n(t)&&"function"==typeof t.hex&&(t=t.hex()),r){var i=e.indexOf(t);if(i>-1)return i}return t}function Ur(t,e){return"number"==typeof t?e[t%e.length]:t}function Hr(t,e){var n=parseInt(t,10);return!isNaN(n)&&(t=n),Ur(t,e)}function Fr(t){var e=this._svelte,n=e.component,r=e.ctx;n.setColor(r.c)}function $r(t,e,n){var r=Object.create(t);return r.c=e[n],r}function Br(t){var e=this._svelte,n=e.component,r=e.ctx;n.setColor(r.c)}function qr(t,e,n){var r=Object.create(t);return r.c=e[n],r}function Gr(t){var e=this._svelte,n=e.component,r=e.ctx;n.setColor(r.c)}function Vr(t,e,n){var r=Object.create(t);return r.c=e[n],r}function Wr(t){var e=this._svelte,n=e.component,r=e.ctx;n.setColor(r.c,!0)}function Yr(t){var e=this._svelte,n=e.component,r=e.ctx;n.setColor(r.c,!1)}function Kr(t,e,n){var r=Object.create(t);return r.c=e[n],r}function Xr(t,e,n){var r=Object.create(t);return r.row=e[n],r}function Jr(t,e,n){var r=Object.create(t);return r.group=e[n],r}function Qr(t,e){for(var n,r,i,o,a,s,l,c,u,d,f,m,g,b,_,y=!1,x=e.paletteGroups,N=[],O=0;O<x.length;O+=1)N[O]=ni(t,Jr(e,x,O));var E=e.colorAxesConfig.lightness&&ri(t,e),S=e.colorAxesConfig.saturation&&oi(t,e),I=e.colorAxesConfig.hue&&si(t,e),L=e.reset&&ci(t,e);function P(){y=!0,t.set({inputColor:u.value}),y=!1}function R(n){t.setColor(e.color_,!0,!0)}function D(n){t.setColor(e.previousColor)}function z(t){t.stopPropagation()}return{c:function(){n=k("div"),r=k("div");for(var t=0;t<N.length;t+=1)N[t].c();i=T("\n                "),E&&E.c(),o=T(" "),S&&S.c(),a=T(" "),I&&I.c(),s=T(" "),L&&L.c(),l=T("\n                "),c=k("div"),u=k("input"),f=T("\n                    "),(m=k("button")).innerHTML='<i class="icon-ok"></i>',g=T("\n                    "),b=k("div"),_=k("div"),r.className="palette svelte-15tiyev",C(u,"input",P),A(u,"type","text"),j(u,"background",e.inputBgColor),j(u,"border-color",Sr(e.inputBgColor)),j(u,"color",e.inputTextColor),u.className=d="hex "+e.readonly+" svelte-15tiyev",u.readOnly=e.readonly,C(m,"click",R),m.className="btn btn-small ok svelte-15tiyev",_.className="transparency svelte-15tiyev",j(_,"opacity",1-Ir(e.previousColor)),C(b,"click",D),b.className="color selected previous svelte-15tiyev",j(b,"border-color",Sr(e.previousColor)),j(b,"background",e.previousColor),c.className="footer svelte-15tiyev",C(n,"click",z),n.className="color-selector svelte-15tiyev"},m:function(t,d){p(t,n,d),h(n,r);for(var v=0;v<N.length;v+=1)N[v].m(r,null);h(n,i),E&&E.m(n,null),h(n,o),S&&S.m(n,null),h(n,a),I&&I.m(n,null),h(n,s),L&&L.m(n,null),h(n,l),h(n,c),h(c,u),u.value=e.inputColor,h(c,f),h(c,m),h(c,g),h(c,b),h(b,_)},p:function(i,c){if(e=c,i.paletteGroups||i.swatchDims||i.color_){x=e.paletteGroups;for(var f=0;f<x.length;f+=1){var h=Jr(e,x,f);N[f]?N[f].p(i,h):(N[f]=ni(t,h),N[f].c(),N[f].m(r,null))}for(;f<N.length;f+=1)N[f].d(1);N.length=x.length}e.colorAxesConfig.lightness?E?E.p(i,e):((E=ri(t,e)).c(),E.m(n,o)):E&&(E.d(1),E=null),e.colorAxesConfig.saturation?S?S.p(i,e):((S=oi(t,e)).c(),S.m(n,a)):S&&(S.d(1),S=null),e.colorAxesConfig.hue?I?I.p(i,e):((I=si(t,e)).c(),I.m(n,s)):I&&(I.d(1),I=null),e.reset?L?L.p(i,e):((L=ci(t,e)).c(),L.m(n,l)):L&&(L.d(1),L=null),!y&&i.inputColor&&(u.value=e.inputColor),i.inputBgColor&&(j(u,"background",e.inputBgColor),j(u,"border-color",Sr(e.inputBgColor))),i.inputTextColor&&j(u,"color",e.inputTextColor),i.readonly&&d!==(d="hex "+e.readonly+" svelte-15tiyev")&&(u.className=d),i.readonly&&(u.readOnly=e.readonly),i.previousColor&&(j(_,"opacity",1-Ir(e.previousColor)),j(b,"border-color",Sr(e.previousColor)),j(b,"background",e.previousColor))},d:function(t){t&&v(n),w(N,t),E&&E.d(),S&&S.d(),I&&I.d(),L&&L.d(),M(u,"input",P),M(m,"click",R),M(b,"click",D),M(n,"click",z)}}}function Zr(t,e){var n,r,i=e.group.name;return{c:function(){n=k("div"),r=T(i),n.className="name svelte-15tiyev"},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.paletteGroups&&i!==(i=e.group.name)&&S(r,i)},d:function(t){t&&v(n)}}}function ti(t,e){var n,r,i;return{c:function(){n=k("div"),(r=k("div")).className="transparency svelte-15tiyev",j(r,"opacity",1-Ir(e.c)),n._svelte={component:t,ctx:e},C(n,"click",Yr),C(n,"dblclick",Wr),n.className="color svelte-15tiyev",n.dataset.color=i=e.c,j(n,"background",e.c),j(n,"border-color",jr(e.c)),j(n,"width",e.swatchDims+"px"),j(n,"height",e.swatchDims+"px"),P(n,"selected",e.c===e.color_)},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,o){e=o,t.paletteGroups&&j(r,"opacity",1-Ir(e.c)),n._svelte.ctx=e,t.paletteGroups&&i!==(i=e.c)&&(n.dataset.color=i),t.paletteGroups&&(j(n,"background",e.c),j(n,"border-color",jr(e.c))),t.swatchDims&&(j(n,"width",e.swatchDims+"px"),j(n,"height",e.swatchDims+"px")),(t.paletteGroups||t.color_)&&P(n,"selected",e.c===e.color_)},d:function(t){t&&v(n),M(n,"click",Yr),M(n,"dblclick",Wr)}}}function ei(t,e){for(var n,r=e.row,i=[],o=0;o<r.length;o+=1)i[o]=ti(t,Kr(e,r,o));return{c:function(){n=k("div");for(var t=0;t<i.length;t+=1)i[t].c()},m:function(t,e){p(t,n,e);for(var r=0;r<i.length;r+=1)i[r].m(n,null)},p:function(e,o){if(e.paletteGroups||e.swatchDims||e.color_){r=o.row;for(var a=0;a<r.length;a+=1){var s=Kr(o,r,a);i[a]?i[a].p(e,s):(i[a]=ti(t,s),i[a].c(),i[a].m(n,null))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(t){t&&v(n),w(i,t)}}}function ni(t,e){for(var n,r,i=e.group.name&&Zr(0,e),o=e.group.colors,a=[],s=0;s<o.length;s+=1)a[s]=ei(t,Xr(e,o,s));return{c:function(){n=k("div"),i&&i.c(),r=T(" ");for(var t=0;t<a.length;t+=1)a[t].c();n.className="color-group svelte-15tiyev"},m:function(t,e){p(t,n,e),i&&i.m(n,null),h(n,r);for(var o=0;o<a.length;o+=1)a[o].m(n,null)},p:function(e,s){if(s.group.name?i?i.p(e,s):((i=Zr(0,s)).c(),i.m(n,r)):i&&(i.d(1),i=null),e.paletteGroups||e.swatchDims||e.color_){o=s.group.colors;for(var l=0;l<o.length;l+=1){var c=Xr(s,o,l);a[l]?a[l].p(e,c):(a[l]=ei(t,c),a[l].c(),a[l].m(n,null))}for(;l<a.length;l+=1)a[l].d(1);a.length=o.length}},d:function(t){t&&v(n),i&&i.d(),w(a,t)}}}function ri(t,e){for(var n,r=e.gradient_l,i=[],o=0;o<r.length;o+=1)i[o]=ii(t,Vr(e,r,o));return{c:function(){n=k("div");for(var t=0;t<i.length;t+=1)i[t].c();n.className="color-axis lightness svelte-15tiyev"},m:function(t,e){p(t,n,e);for(var r=0;r<i.length;r+=1)i[r].m(n,null)},p:function(e,o){if(e.gradient_l||e.nearest_l){r=o.gradient_l;for(var a=0;a<r.length;a+=1){var s=Vr(o,r,a);i[a]?i[a].p(e,s):(i[a]=ii(t,s),i[a].c(),i[a].m(n,null))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(t){t&&v(n),w(i,t)}}}function ii(t,e){var n,r,i;return{c:function(){(n=k("div"))._svelte={component:t,ctx:e},C(n,"click",Gr),n.className=r="color "+(e.c==e.nearest_l?"selected":"")+" svelte-15tiyev",n.dataset.color=i=e.c,j(n,"background",e.c)},m:function(t,e){p(t,n,e)},p:function(t,o){e=o,n._svelte.ctx=e,(t.gradient_l||t.nearest_l)&&r!==(r="color "+(e.c==e.nearest_l?"selected":"")+" svelte-15tiyev")&&(n.className=r),t.gradient_l&&i!==(i=e.c)&&(n.dataset.color=i),t.gradient_l&&j(n,"background",e.c)},d:function(t){t&&v(n),M(n,"click",Gr)}}}function oi(t,e){for(var n,r=e.gradient_c,i=[],o=0;o<r.length;o+=1)i[o]=ai(t,qr(e,r,o));return{c:function(){n=k("div");for(var t=0;t<i.length;t+=1)i[t].c();n.className="color-axis saturation svelte-15tiyev"},m:function(t,e){p(t,n,e);for(var r=0;r<i.length;r+=1)i[r].m(n,null)},p:function(e,o){if(e.gradient_c||e.nearest_c){r=o.gradient_c;for(var a=0;a<r.length;a+=1){var s=qr(o,r,a);i[a]?i[a].p(e,s):(i[a]=ai(t,s),i[a].c(),i[a].m(n,null))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(t){t&&v(n),w(i,t)}}}function ai(t,e){var n,r,i;return{c:function(){(n=k("div"))._svelte={component:t,ctx:e},C(n,"click",Br),n.className=r="color "+(e.c==e.nearest_c?"selected":"")+" svelte-15tiyev",n.dataset.color=i=e.c,j(n,"background",e.c)},m:function(t,e){p(t,n,e)},p:function(t,o){e=o,n._svelte.ctx=e,(t.gradient_c||t.nearest_c)&&r!==(r="color "+(e.c==e.nearest_c?"selected":"")+" svelte-15tiyev")&&(n.className=r),t.gradient_c&&i!==(i=e.c)&&(n.dataset.color=i),t.gradient_c&&j(n,"background",e.c)},d:function(t){t&&v(n),M(n,"click",Br)}}}function si(t,e){for(var n,r=e.gradient_h,i=[],o=0;o<r.length;o+=1)i[o]=li(t,$r(e,r,o));return{c:function(){n=k("div");for(var t=0;t<i.length;t+=1)i[t].c();n.className="color-axis hue svelte-15tiyev"},m:function(t,e){p(t,n,e);for(var r=0;r<i.length;r+=1)i[r].m(n,null)},p:function(e,o){if(e.gradient_h||e.nearest_h){r=o.gradient_h;for(var a=0;a<r.length;a+=1){var s=$r(o,r,a);i[a]?i[a].p(e,s):(i[a]=li(t,s),i[a].c(),i[a].m(n,null))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(t){t&&v(n),w(i,t)}}}function li(t,e){var n,r,i;return{c:function(){(n=k("div"))._svelte={component:t,ctx:e},C(n,"click",Fr),n.className=r="color "+(e.c==e.nearest_h?"selected":"")+" svelte-15tiyev",n.dataset.color=i=e.c,j(n,"background",e.c)},m:function(t,e){p(t,n,e)},p:function(t,o){e=o,n._svelte.ctx=e,(t.gradient_h||t.nearest_h)&&r!==(r="color "+(e.c==e.nearest_h?"selected":"")+" svelte-15tiyev")&&(n.className=r),t.gradient_h&&i!==(i=e.c)&&(n.dataset.color=i),t.gradient_h&&j(n,"background",e.c)},d:function(t){t&&v(n),M(n,"click",Fr)}}}function ci(t,e){var n,r,i,o;function a(e){t.resetColor()}return{c:function(){n=k("button"),r=k("i"),i=T(" "),o=k("noscript"),r.className="im im-drop svelte-15tiyev",C(n,"click",a),n.className="btn btn-small reset svelte-15tiyev"},m:function(t,a){p(t,n,a),h(n,r),h(n,i),h(n,o),o.insertAdjacentHTML("afterend",e.reset)},p:function(t,e){t.reset&&(g(o),o.insertAdjacentHTML("afterend",e.reset))},d:function(t){t&&v(n),M(n,"click",a)}}}function ui(t){var e=this;X(this,t),this.refs={},this._state=u(u(this.store._init(["themeData"]),{reset:!1,initial:!1,prepend:[],append:[],returnPaletteIndex:!1,color:!1,color_:Er,inputColor:Er,lastValidInputColor:Er,previousColor:Er,open:!1}),t.data),this.store._add(this,["themeData"]),this._recompute({$themeData:1,prepend:1,append:1,color_:1,palette:1,gradient_l:1,gradient_c:1,gradient_h:1,inputColor:1,lastValidInputColor:1,inputBgColor:1},this._state),this._intro=!0,this._handlers.update=[Pr],this._handlers.destroy=[Z],this._slotted=t.slots||{},this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d=t._slotted.default,f={};function m(e){t.windowKeydown(e)}function g(e){t.windowClick(e)}window.addEventListener("keydown",m),window.addEventListener("click",g);var _=e.color_&&Qr(t,e),y={};void 0!==e.open&&(y.visible=e.open,f.visible=!0);var w=new Tt({root:t.root,store:t.store,slots:{default:x(),content:x(),button:x()},data:y,_bind:function(e,n){var r={};!f.visible&&e.visible&&(r.open=n.visible),t._set(r),f={}}});return t.root._beforecreate.push((function(){w._bind({visible:1},w.get())})),{c:function(){n=k("div"),r=k("span"),d||(i=k("div"),o=k("div"),a=k("div"),s=T("\n                    "),l=k("span")),c=T("\n        "),u=k("span"),_&&_.c(),w._fragment.c(),d||(a.className="transparency svelte-15tiyev",j(a,"opacity",1-Ir(e.validColor)),j(o,"background",e.validColor+" none repeat scroll 0% 0%"),o.className="the-color svelte-15tiyev",l.className="caret svelte-15tiyev",i.className="base-color-picker color-picker svelte-15tiyev"),A(r,"slot","button"),A(u,"slot","content"),n.className="color-picker-cont svelte-15tiyev"},m:function(e,f){p(e,n,f),h(w._slotted.button,r),d?h(r,d):(h(r,i),h(i,o),h(o,a),h(i,s),h(i,l)),h(w._slotted.default,c),h(w._slotted.content,u),_&&_.m(u,null),w._mount(n,null),t.refs.picker=n},p:function(n,r){e=r,d||n.validColor&&(j(a,"opacity",1-Ir(e.validColor)),j(o,"background",e.validColor+" none repeat scroll 0% 0%")),e.color_?_?_.p(n,e):((_=Qr(t,e)).c(),_.m(u,null)):_&&(_.d(1),_=null);var i={};!f.visible&&n.open&&(i.visible=e.open,f.visible=void 0!==e.open),w._set(i),f={}},d:function(e){window.removeEventListener("keydown",m),window.removeEventListener("click",g),e&&v(n),d&&b(r,d),_&&_.d(),w.destroy(),t.refs.picker===n&&(t.refs.picker=null)}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(ui.prototype,tt),u(ui.prototype,Lr),ui.prototype._recompute=function(t,e){var n,r,i,o,a;(t.$themeData||t.prepend||t.append)&&(this._differs(e.paletteGroups,e.paletteGroups=function(t){var e,n=t.$themeData,r=t.prepend,i=t.append,o=Xt(n,"colors.groups",!1);if(r=!!r.length&&[{colors:[r]}],o)i=!!i.length&&[{colors:[i]}],e=o,r&&(e=r.concat(o)),i&&(e=e.concat(i));else{var a=Xt(n,"colors.picker.showDuplicates",!1)?n.colors.palette.concat(i):Ar.uniq(n.colors.palette.concat(i));e=r?r.concat([{colors:[a]}]):[{colors:[a]}]}return e}(e))&&(t.paletteGroups=!0),this._differs(e.palette,e.palette=(r=(n=e).$themeData,n.prepend,n.append,Xt(r,"colors.palette",[])))&&(t.palette=!0)),t.$themeData&&(this._differs(e.swatchDims,e.swatchDims=(157-2*(i=Xt(e.$themeData,"colors.picker.rowCount",6)))/i)&&(t.swatchDims=!0),this._differs(e.colorAxesConfig,e.colorAxesConfig=function(t){var e=t.$themeData;return{lightness:Xt(e,"colors.picker.controls.lightness",!0),saturation:Xt(e,"colors.picker.controls.saturation",!0),hue:Xt(e,"colors.picker.controls.hue",!0)}}(e))&&(t.colorAxesConfig=!0),this._differs(e.readonly,e.readonly=Xt(e.$themeData,"colors.picker.controls.hexEditable",!0)?"":"readonly")&&(t.readonly=!0)),t.color_&&(this._differs(e.validColor,e.validColor=function(t){var e=t.color_;try{return Kt(e).hex()}catch(t){return"#000000"}}(e))&&(t.validColor=!0),this._differs(e.gradient_l,e.gradient_l=function(t){var e=t.color_;if(!Kt.valid(e))return[];var n=Kt(e).lch(),r=Dr(70,55,7,6).map((function(t){return Kt.lch(t,n[1],n[2]).hex()}));return Kt.scale(["#000000"].concat(r).concat("#ffffff")).mode("lch").gamma(.8).padding(.1).colors(14)}(e))&&(t.gradient_l=!0)),(t.color_||t.palette)&&this._differs(e.gradient_c,e.gradient_c=function(t){var e=t.color_,n=t.palette;if(!Kt.valid(e))return[];var r=Kt(e).set("lch.c",120);isNaN(r.get("lch.h"))&&(r=Kt.lch(r.get("lch.l"),50,Kt(n[0]||"#d00").get("lch.h")));var i=Kt(e).set("lch.c",3);return Kt.scale([i,r]).mode("lch").gamma(1.2).colors(14)}(e))&&(t.gradient_c=!0),t.color_&&this._differs(e.gradient_h,e.gradient_h=function(t){var e=t.color_;if(!Kt.valid(e))return[];var n=Kt(e).lch(),r=Dr(n[2],75,7,6).map((function(t){return Kt.lch(n[0],n[1],t).hex()}));return Kt.scale(r).mode("lch").colors(14)}(e))&&(t.gradient_h=!0),(t.color_||t.gradient_l)&&this._differs(e.nearest_l,e.nearest_l=(a=(o=e).color_,Rr(o.gradient_l,a)))&&(t.nearest_l=!0),(t.color_||t.gradient_c)&&this._differs(e.nearest_c,e.nearest_c=function(t){var e=t.color_;return Rr(t.gradient_c,e)}(e))&&(t.nearest_c=!0),(t.color_||t.gradient_h)&&this._differs(e.nearest_h,e.nearest_h=function(t){var e=t.color_;return Rr(t.gradient_h,e)}(e))&&(t.nearest_h=!0),(t.inputColor||t.palette||t.lastValidInputColor)&&this._differs(e.inputBgColor,e.inputBgColor=function(t){var e=t.inputColor,n=t.palette,r=t.lastValidInputColor;e=Hr(e,n);try{return Kt(e).hex()}catch(t){return r}}(e))&&(t.inputBgColor=!0),(t.inputBgColor||t.$themeData)&&this._differs(e.inputTextColor,e.inputTextColor=function(t){var e=t.inputBgColor,n=Xt(t.$themeData,"colors.picker.controls.hexEditable",!0);if(e===Er)return"#000";var r=Kt(e);return r.luminance()>.6||r.alpha()<.3?"rgba(0,0,0,".concat(n?1:.3,")"):"rgba(255,255,255,".concat(n?1:.6,")")}(e))&&(t.inputTextColor=!0)};var di="100px";function fi(t,e){var n;return{c:function(){j(n=k("label"),"width",e.width||di),n.className="control-label svelte-p72242",P(n,"disabled",e.disabled)},m:function(t,r){p(t,n,r),n.innerHTML=e.label},p:function(t,e){t.label&&(n.innerHTML=e.label),t.width&&j(n,"width",e.width||di),t.disabled&&P(n,"disabled",e.disabled)},d:function(t){t&&v(n)}}}function hi(t,e){var n,r;return{c:function(){j(n=k("p"),"padding-left",e.inline?0:e.width||di),n.className=r="mini-help "+e.type+" svelte-p72242",P(n,"mini-help-block",!e.inline)},m:function(t,r){p(t,n,r),n.innerHTML=e.help},p:function(t,e){t.help&&(n.innerHTML=e.help),(t.inline||t.width)&&j(n,"padding-left",e.inline?0:e.width||di),t.type&&r!==(r="mini-help "+e.type+" svelte-p72242")&&(n.className=r),(t.type||t.inline)&&P(n,"mini-help-block",!e.inline)},d:function(t){t&&v(n)}}}function pi(t){var e,n,r,i,o,a,s,l,c,d;X(this,t),this._state=u({disabled:!1,help:!1,type:"default",valign:"baseline",inline:!1},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,l=e._slotted.default,c=n.label&&fi(0,n),d=n.help&&hi(0,n),{c:function(){r=k("div"),c&&c.c(),i=T("\n    "),o=k("div"),a=T("\n    "),d&&d.c(),o.className="controls svelte-p72242",j(o,"width","calc(100% - "+(n.width||di)+" - 32px)"),P(o,"form-inline",n.inline),r.className=s="control-group vis-option-group vis-option-group-"+n.type+" label-"+n.valign+" svelte-p72242"},m:function(t,e){p(t,r,e),c&&c.m(r,null),h(r,i),h(r,o),l&&h(o,l),h(r,a),d&&d.m(r,null)},p:function(t,e){e.label?c?c.p(t,e):((c=fi(0,e)).c(),c.m(r,i)):c&&(c.d(1),c=null),t.width&&j(o,"width","calc(100% - "+(e.width||di)+" - 32px)"),t.inline&&P(o,"form-inline",e.inline),e.help?d?d.p(t,e):((d=hi(0,e)).c(),d.m(r,null)):d&&(d.d(1),d=null),(t.type||t.valign)&&s!==(s="control-group vis-option-group vis-option-group-"+e.type+" label-"+e.valign+" svelte-p72242")&&(r.className=s)},d:function(t){t&&v(r),c&&c.d(),l&&b(o,l),d&&d.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}u(pi.prototype,tt);var vi=/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,mi=/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;function gi(t,e){if(null===t)return null;if(void 0!==t){if((t=String(t)).indexOf("<")<0||t.indexOf(">")<0)return t;if(t=function(t,e){e=(((void 0!==e?e||"":"<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>")+"").toLowerCase().match(/<[a-z][a-z0-9]*>/g)||[]).join("");var n=t,r=t;for(;;)if(r=(n=r).replace(mi,"").replace(vi,(function(t,n){return e.indexOf("<"+n.toLowerCase()+">")>-1?t:""})),n===r)return r}(t,e),"undefined"==typeof document)return t;var n=document.createElement("div");n.innerHTML=t;for(var r=n.querySelectorAll("*"),i=0;i<r.length;i++){"a"===r[i].nodeName.toLowerCase()&&("_self"!==r[i].getAttribute("target")&&r[i].setAttribute("target","_blank"),r[i].setAttribute("rel","nofollow noopener noreferrer"),r[i].getAttribute("href")&&r[i].getAttribute("href").trim().startsWith("javascript:")&&r[i].setAttribute("href",""));for(var o=0;o<r[i].attributes.length;o++){var a=r[i].attributes[o];a.specified&&"on"===a.name.substr(0,2)&&r[i].removeAttribute(a.name)}}return n.innerHTML}}function bi(t){if(!t||"object"!==n(t))return t;try{return JSON.parse(JSON.stringify(t))}catch(e){return t}}function _i(t){var e=t.$vis,n=t.keys,r=t.customizable,i=t.axis,o=t.custom,a=t.palette;return e&&r?(i?Ar.uniq("date"===e.axes(!0)[i].type()?e.axes(!0)[i].raw():e.axes(!0)[i].values()):n&&n.length?n:e.colorKeys?e.colorKeys():e.keys()).map((function(t){return{key:t=gi(t,""),defined:void 0!==o[t]&&!1!==o[t],color:void 0!==o[t]&&!1!==o[t]?ki(o[t],a):"#cccccc"}})):[]}var yi={update:function(t){var e=this.get().palette;this.set({value:xi(t,e)})},updateCustom:function(t){var e=this.get(),n=e.selected,r=e.palette,i=bi(e.custom);n.forEach((function(e){t?i[e]=xi(t,r):delete i[e]})),this.set({custom:i})},toggle:function(t){t.preventDefault();var e=this.get().expanded;this.set({expanded:!e})},toggleSelect:function(t,e){e.preventDefault();var n=this.get().selected,r=n.indexOf(t);e.shiftKey?r>-1?n.splice(r,1):n.push(t):(n.length=1,n[0]=t),this.set({selected:n})},getColor:function(t){return ki(t,this.get().palette)},reset:function(){var t=this.get(),e=t.selected,n=bi(t.custom);e.forEach((function(t){return delete n[t]})),this.set({custom:n})},resetAll:function(){this.set({custom:{}})},selectAll:function(t){t.preventDefault();var e=this.get(),n=e.selected;e.colorKeys.forEach((function(t){n.indexOf(t.key)<0&&n.push(t.key)})),this.set({selected:n})},selectNone:function(t){t.preventDefault();var e=this.get().selected;e.length=0,this.set({selected:e})},selectInvert:function(t){t.preventDefault();var e=this.get(),n=e.selected;e.colorKeys.forEach((function(t){var e=n.indexOf(t.key);e<0?n.push(t.key):n.splice(e,1)})),this.set({selected:n})}};function wi(t){var e=t.changed,n=t.current;if(e.custom&&n.custom){var r=n.custom;r&&0===r.length&&(r={}),this.set({custom:r})}}function xi(t,e){"object"===n(t)&&"function"==typeof t.hex&&(t=t.hex());var r=e.indexOf(t);return r>-1?r:t}function ki(t,e){return"number"==typeof t?e[t%e.length]:t}function Ni(t){var e=this._svelte,n=e.component,r=e.ctx;n.toggleSelect(r.k.key,t)}function Ti(t,e,n){var r=Object.create(t);return r.k=e[n],r}function Oi(t,e){var n={},r={color:e.hexColor,palette:e.palette};void 0!==e.open&&(r.visible=e.open,n.visible=!0);var i=new ui({root:t.root,store:t.store,data:r,_bind:function(e,r){var i={};!n.visible&&e.visible&&(i.open=r.visible),t._set(i),n={}}});return t.root._beforecreate.push((function(){i._bind({visible:1},i.get())})),i.on("change",(function(e){t.update(e)})),{c:function(){i._fragment.c()},m:function(t,e){i._mount(t,e)},p:function(t,r){e=r;var o={};t.hexColor&&(o.color=e.hexColor),t.palette&&(o.palette=e.palette),!n.visible&&t.open&&(o.visible=e.open,n.visible=void 0!==e.open),i._set(o),n={}},d:function(t){i.destroy(t)}}}function Ci(t,e){var n,r,i,o,a=rt("controls / color / customize-colors","core");function s(e){t.toggle(e)}return{c:function(){n=k("span"),r=k("a"),i=T(a),C(r,"click",s),r.href="#customize",r.className=o="btn btn-small custom "+(e.expanded?"btn-primary":"")+" svelte-1oxnzs4",A(r,"role","button"),n.className="custom-color-selector-head"},m:function(t,e){p(t,n,e),h(n,r),h(r,i)},p:function(t,e){t.expanded&&o!==(o="btn btn-small custom "+(e.expanded?"btn-primary":"")+" svelte-1oxnzs4")&&(r.className=o)},d:function(t){t&&v(n),M(r,"click",s)}}}function Mi(t,e){for(var n,r,i,o,a,s,l,c,u,d,f,m,g,b,_,y,x,N,O,A,E,j,I=rt("Select:","core"),L=rt("all","core"),P=rt("none","core"),R=rt("invert","core"),D=rt(e.compact?"controls / color / reset-all":"controls / color / reset-all-colors","core"),z=!e.compact&&Ai(),U=e.colorKeys,H=[],F=0;F<U.length;F+=1)H[F]=Ei(t,Ti(e,U,F));function $(e){t.selectAll(e)}function B(e){t.selectNone(e)}function q(e){t.selectInvert(e)}var G=!e.compact&&Si();function V(t){return t.selected.length?Ii:ji}var W=V(e),Y=W(t,e);function K(e){t.resetAll()}return{c:function(){n=k("div"),r=k("div"),z&&z.c(),i=T("\n        "),o=k("ul");for(var t=0;t<H.length;t+=1)H[t].c();a=T("\n        "),s=k("div"),l=T(I),c=T("\n            "),u=k("a"),d=T(L),f=T("\n            "),m=k("a"),g=T(P),b=T("\n            "),_=k("a"),y=T(R),x=T("\n    "),N=k("div"),G&&G.c(),O=T(" "),Y.c(),A=T("\n        "),E=k("button"),j=T(D),o.className="dataseries unstyled svelte-1oxnzs4",C(u,"click",$),u.href="#/select-all",u.className="svelte-1oxnzs4",C(m,"click",B),m.href="#/select-none",m.className="svelte-1oxnzs4",C(_,"click",q),_.href="#/select-invert",_.className="svelte-1oxnzs4",s.className="selection-controls svelte-1oxnzs4",r.className="custom-color-selector-list svelte-1oxnzs4",C(E,"click",K),E.className="btn btn-color-reset",N.className="custom-color-selector-aside svelte-1oxnzs4",n.className="custom-color-selector-body svelte-1oxnzs4"},m:function(t,e){p(t,n,e),h(n,r),z&&z.m(r,null),h(r,i),h(r,o);for(var v=0;v<H.length;v+=1)H[v].m(o,null);h(r,a),h(r,s),h(s,l),h(s,c),h(s,u),h(u,d),h(s,f),h(s,m),h(m,g),h(s,b),h(s,_),h(_,y),h(n,x),h(n,N),G&&G.m(N,null),h(N,O),Y.m(N,null),h(N,A),h(N,E),h(E,j)},p:function(e,n){if(n.compact?z&&(z.d(1),z=null):z||((z=Ai()).c(),z.m(r,i)),e.selected||e.colorKeys){U=n.colorKeys;for(var a=0;a<U.length;a+=1){var s=Ti(n,U,a);H[a]?H[a].p(e,s):(H[a]=Ei(t,s),H[a].c(),H[a].m(o,null))}for(;a<H.length;a+=1)H[a].d(1);H.length=U.length}n.compact?G&&(G.d(1),G=null):G||((G=Si()).c(),G.m(N,O)),W===(W=V(n))&&Y?Y.p(e,n):(Y.d(1),(Y=W(t,n)).c(),Y.m(N,A)),e.compact&&D!==(D=rt(n.compact?"controls / color / reset-all":"controls / color / reset-all-colors","core"))&&S(j,D)},d:function(t){t&&v(n),z&&z.d(),w(H,t),M(u,"click",$),M(m,"click",B),M(_,"click",q),G&&G.d(),Y.d(),M(E,"click",K)}}}function Ai(t,e){var n,r,i=rt("controls / color / select-elements","core");return{c:function(){n=k("h4"),r=T(i),n.className="svelte-1oxnzs4"},m:function(t,e){p(t,n,e),h(n,r)},d:function(t){t&&v(n)}}}function Ei(t,e){var n,r,i,o,a,s,l,c,u=e.k.defined?"":"×",d=e.k.key;return{c:function(){n=k("li"),r=k("div"),i=T(u),o=T("\n                "),a=k("label"),s=T(d),r.className="color svelte-1oxnzs4",j(r,"background",e.k.color),a.className="svelte-1oxnzs4",n._svelte={component:t,ctx:e},C(n,"click",Ni),n.className=l=(e.selected.indexOf(e.k.key)>-1?"selected":"")+" svelte-1oxnzs4",n.dataset.series=c=e.k.key},m:function(t,e){p(t,n,e),h(n,r),h(r,i),h(n,o),h(n,a),h(a,s)},p:function(t,o){e=o,t.colorKeys&&u!==(u=e.k.defined?"":"×")&&S(i,u),t.colorKeys&&j(r,"background",e.k.color),t.colorKeys&&d!==(d=e.k.key)&&S(s,d),n._svelte.ctx=e,(t.selected||t.colorKeys)&&l!==(l=(e.selected.indexOf(e.k.key)>-1?"selected":"")+" svelte-1oxnzs4")&&(n.className=l),t.colorKeys&&c!==(c=e.k.key)&&(n.dataset.series=c)},d:function(t){t&&v(n),M(n,"click",Ni)}}}function Si(t,e){var n,r,i=rt("controls / color / choose-color","core");return{c:function(){n=k("h4"),r=T(i),n.className="svelte-1oxnzs4"},m:function(t,e){p(t,n,e),h(n,r)},d:function(t){t&&v(n)}}}function ji(t,e){var n,r=rt("controls / color / customize-colors / info","core");return{c:function(){(n=k("p")).className="mini-help"},m:function(t,e){p(t,n,e),n.innerHTML=r},p:c,d:function(t){t&&v(n)}}}function Ii(t,e){var n,r,i={},o={initial:!1,reset:"Reset",color:e.customColor,palette:e.palette};void 0!==e.openCustom&&(o.visible=e.openCustom,i.visible=!0);var a=new ui({root:t.root,store:t.store,data:o,_bind:function(e,n){var r={};!i.visible&&e.visible&&(r.openCustom=n.visible),t._set(r),i={}}});t.root._beforecreate.push((function(){a._bind({visible:1},a.get())})),a.on("change",(function(e){t.updateCustom(e)}));var s=!e.compact&&Li(t);return{c:function(){n=k("div"),a._fragment.c(),r=T("\n            "),s&&s.c(),n.className="selection-color-picker svelte-1oxnzs4"},m:function(t,e){p(t,n,e),a._mount(n,null),h(n,r),s&&s.m(n,null)},p:function(r,o){e=o;var l={};r.customColor&&(l.color=e.customColor),r.palette&&(l.palette=e.palette),!i.visible&&r.openCustom&&(l.visible=e.openCustom,i.visible=void 0!==e.openCustom),a._set(l),i={},e.compact?s&&(s.d(1),s=null):s||((s=Li(t)).c(),s.m(n,null))},d:function(t){t&&v(n),a.destroy(),s&&s.d()}}}function Li(t,e){var n;function r(e){t.reset()}return{c:function(){(n=k("button")).textContent="Reset",C(n,"click",r),n.className="btn btn-color-reset"},m:function(t,e){p(t,n,e)},d:function(t){t&&v(n),M(n,"click",r)}}}function Pi(t){var e,n,r,i,o,a,s,l,c,f,m,g=this;X(this,t),this._state=u(u(this.store._init(["vis","themeData"]),{width:"100px",open:!1,openCustom:!1,customizable:!1,expanded:!1,keys:!1,compact:!1,axis:!1,selected:[],custom:{}}),t.data),this.store._add(this,["vis","themeData"]),this._recompute({$themeData:1,$vis:1,keys:1,customizable:1,axis:1,custom:1,palette:1,value:1,selected:1},this._state),this._intro=!0,this._handlers.update=[wi],this._handlers.destroy=[Z],this._fragment=(e=this,n=this._state,s=n.hexColor&&Oi(e,n),l=n.customizable&&Ci(e,n),c={label:n.label,width:n.width||"100px"},f=new pi({root:e.root,store:e.store,slots:{default:x()},data:c}),m=n.customizable&&n.expanded&&Mi(e,n),{c:function(){s&&s.c(),r=T(" "),l&&l.c(),i=O(),f._fragment.c(),o=T("\n\n"),m&&m.c(),a=O()},m:function(t,e){s&&s.m(f._slotted.default,null),h(f._slotted.default,r),l&&l.m(f._slotted.default,null),h(f._slotted.default,i),f._mount(t,e),p(t,o,e),m&&m.m(t,e),p(t,a,e)},p:function(t,n){n.hexColor?s?s.p(t,n):((s=Oi(e,n)).c(),s.m(r.parentNode,r)):s&&(s.d(1),s=null),n.customizable?l?l.p(t,n):((l=Ci(e,n)).c(),l.m(i.parentNode,i)):l&&(l.d(1),l=null);var o={};t.label&&(o.label=n.label),t.width&&(o.width=n.width||"100px"),f._set(o),n.customizable&&n.expanded?m?m.p(t,n):((m=Mi(e,n)).c(),m.m(a.parentNode,a)):m&&(m.d(1),m=null)},d:function(t){s&&s.d(),l&&l.d(),f.destroy(t),t&&v(o),m&&m.d(t),t&&v(a)}}),this.root._oncreate.push((function(){g.fire("update",{changed:d({},g._state),current:g._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function Ri(t,e,n){var r=Object.create(t);return r.opt=e[n],r}function Di(t,e,n){var r=Object.create(t);return r.optgroup=e[n],r}function zi(t,e,n){var r=Object.create(t);return r.opt=e[n],r}function Ui(t,e){for(var n,r=e.options,i=[],o=0;o<r.length;o+=1)i[o]=Hi(t,zi(e,r,o));return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=O()},m:function(t,e){for(var r=0;r<i.length;r+=1)i[r].m(t,e);p(t,n,e)},p:function(e,o){if(e.options){r=o.options;for(var a=0;a<r.length;a+=1){var s=zi(o,r,a);i[a]?i[a].p(e,s):(i[a]=Hi(t,s),i[a].c(),i[a].m(n.parentNode,n))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(t){w(i,t),t&&v(n)}}}function Hi(t,e){var n,r,i,o=e.opt.label;return{c:function(){n=k("option"),r=T(o),n.__value=i=e.opt.value,n.value=n.__value},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.options&&o!==(o=e.opt.label)&&S(r,o),t.options&&i!==(i=e.opt.value)&&(n.__value=i),n.value=n.__value},d:function(t){t&&v(n)}}}function Fi(t,e){for(var n,r=e.optgroups,i=[],o=0;o<r.length;o+=1)i[o]=Bi(t,Di(e,r,o));return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=O()},m:function(t,e){for(var r=0;r<i.length;r+=1)i[r].m(t,e);p(t,n,e)},p:function(e,o){if(e.optgroups){r=o.optgroups;for(var a=0;a<r.length;a+=1){var s=Di(o,r,a);i[a]?i[a].p(e,s):(i[a]=Bi(t,s),i[a].c(),i[a].m(n.parentNode,n))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(t){w(i,t),t&&v(n)}}}function $i(t,e){var n,r,i,o=e.opt.label;return{c:function(){n=k("option"),r=T(o),n.__value=i=e.opt.value,n.value=n.__value},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.optgroups&&o!==(o=e.opt.label)&&S(r,o),t.optgroups&&i!==(i=e.opt.value)&&(n.__value=i),n.value=n.__value},d:function(t){t&&v(n)}}}function Bi(t,e){for(var n,r,i=e.optgroup.options,o=[],a=0;a<i.length;a+=1)o[a]=$i(0,Ri(e,i,a));return{c:function(){n=k("optgroup");for(var t=0;t<o.length;t+=1)o[t].c();A(n,"label",r=e.optgroup.label)},m:function(t,e){p(t,n,e);for(var r=0;r<o.length;r+=1)o[r].m(n,null)},p:function(t,e){if(t.optgroups){i=e.optgroup.options;for(var a=0;a<i.length;a+=1){var s=Ri(e,i,a);o[a]?o[a].p(t,s):(o[a]=$i(0,s),o[a].c(),o[a].m(n,null))}for(;a<o.length;a+=1)o[a].d(1);o.length=i.length}t.optgroups&&r!==(r=e.optgroup.label)&&A(n,"label",r)},d:function(t){t&&v(n),w(o,t)}}}function qi(t){X(this,t),this._state=u({disabled:!1,width:"auto",labelWidth:"auto",options:[],optgroups:[]},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,i=!1,o=e.options.length&&Ui(t,e),a=e.optgroups.length&&Fi(t,e);function s(){i=!0,t.set({value:L(n)}),i=!1}function l(e){t.fire("change",e)}return{c:function(){n=k("select"),o&&o.c(),r=O(),a&&a.c(),C(n,"change",s),"value"in e||t.root._beforecreate.push(s),C(n,"change",l),n.className="select-css svelte-v0oq4b",n.disabled=e.disabled,j(n,"width",e.width)},m:function(t,i){p(t,n,i),o&&o.m(n,null),h(n,r),a&&a.m(n,null),I(n,e.value)},p:function(e,s){s.options.length?o?o.p(e,s):((o=Ui(t,s)).c(),o.m(n,r)):o&&(o.d(1),o=null),s.optgroups.length?a?a.p(e,s):((a=Fi(t,s)).c(),a.m(n,null)):a&&(a.d(1),a=null),!i&&e.value&&I(n,s.value),e.disabled&&(n.disabled=s.disabled),e.width&&j(n,"width",s.width)},d:function(t){t&&v(n),o&&o.d(),a&&a.d(),M(n,"change",s),M(n,"change",l)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function Gi(t){return"number"===t?[{l:"1,000[.00]",f:"0,0.[00]"},{l:"0",f:"0"},{l:"0.0",f:"0.0"},{l:"0.00",f:"0.00"},{l:"0.000",f:"0.000"},{l:"0.[0]",f:"0.[0]"},{l:"0.[00]",f:"0.[00]"},{l:"0%",f:"0%"},{l:"0.0%",f:"0.0%"},{l:"0.00%",f:"0.00%"},{l:"0.[0]%",f:"0.[0]%"},{l:"0.[00]%",f:"0.[00]%"},{l:"10,000",f:"0,0"},{l:"1st",f:"0o"},{l:"123k",f:"0a"},{l:"123.4k",f:"0.[0]a"},{l:"123.45k",f:"0.[00]a"}]:"date"===t?[{l:"2015, 2016",f:"YYYY"},{l:"2015 Q1, 2015 Q2",f:"YYYY [Q]Q"},{l:"2015, Q2, Q3",f:"YYYY|[Q]Q"},{l:"2015, Feb, Mar",f:"YYYY|MMM"},{l:"’15, ’16",f:"’YY"},{l:"April, May",f:"MMMM"},{l:"Apr, May",f:"MMM"},{l:"Apr ’15, May ’15",f:"MMM ’YY"},{l:"April, 2, 3",f:"MMM|DD"}]:[]}function Vi(){var t=this.get(),e=t.value,n=t.options;e&&(n.find((function(t){return t.value===e}))?this.set({selected:e,custom:""}):this.set({selected:"custom",custom:e}))}function Wi(t){var e=t.changed,n=t.previous,r=t.current,i=r.selected,o=r.custom,a=r.value,s=r.options;e.value&&a&&n&&(s.find((function(t){return t.value===a}))?this.set({selected:a,custom:""}):this.set({selected:"custom",custom:a}));e.selected&&i&&n&&this.set({value:"custom"!==i?i:o+" "}),e.custom&&o&&n&&this.set({value:o})}function Yi(t,e){var n,r=!1;function i(){r=!0,t.set({custom:n.value}),r=!1}return{c:function(){C(n=k("input"),"input",i),A(n,"type","text"),n.disabled=e.disabled,n.className="svelte-fwqzp4"},m:function(t,r){p(t,n,r),n.value=e.custom},p:function(t,e){!r&&t.custom&&(n.value=e.custom),t.disabled&&(n.disabled=e.disabled)},d:function(t){t&&v(n),M(n,"input",i)}}}function Ki(t,e){var n,r=e.disabled_msg||e.customFormatHelp;return{c:function(){(n=k("div")).className="message svelte-fwqzp4",j(n,"margin-left",e.width),P(n,"disabled",e.disabled&&!e.disabled_msg)},m:function(t,e){p(t,n,e),n.innerHTML=r},p:function(t,e){(t.disabled_msg||t.customFormatHelp)&&r!==(r=e.disabled_msg||e.customFormatHelp)&&(n.innerHTML=r),t.width&&j(n,"margin-left",e.width),(t.disabled||t.disabled_msg)&&P(n,"disabled",e.disabled&&!e.disabled_msg)},d:function(t){t&&v(n)}}}function Xi(t){var e=this;X(this,t),this._state=u(u(this.store._init(["vis","dataset"]),{auto:!1,axis:!1,value:"",custom:"",selected:null,type:!1,disabled:!1,width:"100px",valign:"middle",help:"",disabled_msg:""}),t.data),this.store._add(this,["vis","dataset"]),this._recompute({$vis:1,$dataset:1,axis:1,axisCol:1,type:1,columnType:1,auto:1},this._state),this._intro=!0,this._handlers.state=[Wi],this._handlers.destroy=[Z],Wi.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n,r,i,o,a,s,l={},c={width:"100%"};void 0!==e.selected&&(c.value=e.selected,l.value=!0),void 0!==e.disabled&&(c.disabled=e.disabled,l.disabled=!0),void 0!==e.options&&(c.options=e.options,l.options=!0);var u=new qi({root:t.root,store:t.store,data:c,_bind:function(e,n){var r={};!l.value&&e.value&&(r.selected=n.value),!l.disabled&&e.disabled&&(r.disabled=n.disabled),!l.options&&e.options&&(r.options=n.options),t._set(r),l={}}});t.root._beforecreate.push((function(){u._bind({value:1,disabled:1,options:1},u.get())}));var d="custom"===e.selected&&Yi(t,e),f={type:"custom-format",valign:e.valign,width:e.width,label:e.label,help:e.help,disabled:e.disabled},m=new pi({root:t.root,store:t.store,slots:{default:x()},data:f}),g=(e.disabled&&e.disabled_msg||"custom"===e.selected)&&Ki(t,e);return{c:function(){n=k("div"),r=k("div"),u._fragment.c(),i=T("\n        "),d&&d.c(),m._fragment.c(),a=T("\n\n"),g&&g.c(),s=O(),r.className="select svelte-fwqzp4",n.className=o=("custom"===e.selected?"split-container":"")+" svelte-fwqzp4"},m:function(t,e){h(m._slotted.default,n),h(n,r),u._mount(r,null),h(n,i),d&&d.m(n,null),m._mount(t,e),p(t,a,e),g&&g.m(t,e),p(t,s,e)},p:function(r,i){e=i;var a={};!l.value&&r.selected&&(a.value=e.selected,l.value=void 0!==e.selected),!l.disabled&&r.disabled&&(a.disabled=e.disabled,l.disabled=void 0!==e.disabled),!l.options&&r.options&&(a.options=e.options,l.options=void 0!==e.options),u._set(a),l={},"custom"===e.selected?d?d.p(r,e):((d=Yi(t,e)).c(),d.m(n,null)):d&&(d.d(1),d=null),r.selected&&o!==(o=("custom"===e.selected?"split-container":"")+" svelte-fwqzp4")&&(n.className=o);var c={};r.valign&&(c.valign=e.valign),r.width&&(c.width=e.width),r.label&&(c.label=e.label),r.help&&(c.help=e.help),r.disabled&&(c.disabled=e.disabled),m._set(c),e.disabled&&e.disabled_msg||"custom"===e.selected?g?g.p(r,e):((g=Ki(t,e)).c(),g.m(s.parentNode,s)):g&&(g.d(1),g=null)},d:function(t){u.destroy(),d&&d.d(),m.destroy(t),t&&v(a),g&&g.d(t),t&&v(s)}}}(this,this._state),this.root._oncreate.push((function(){Vi.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(Pi.prototype,tt),u(Pi.prototype,yi),Pi.prototype._recompute=function(t,e){var n;t.$themeData&&this._differs(e.palette,e.palette=Xt(e.$themeData,"colors.palette",[]))&&(t.palette=!0),(t.$vis||t.keys||t.customizable||t.axis||t.custom||t.palette)&&this._differs(e.colorKeys,e.colorKeys=_i(e))&&(t.colorKeys=!0),(t.value||t.palette)&&this._differs(e.hexColor,e.hexColor=ki((n=e).value,n.palette))&&(t.hexColor=!0),(t.selected||t.palette||t.custom)&&this._differs(e.customColor,e.customColor=function(t){var e=t.selected,n=t.palette,r=t.custom;if(void 0===r[e[0]])return null;var i=e.filter((function(t){return void 0!==r[t]})).map((function(t){return ki(r[t],n)}));return i.length?Kt.average(i,"lab"):null}(e))&&(t.customColor=!0)},u(qi.prototype,tt),u(Xi.prototype,tt),Xi.prototype._recompute=function(t,e){(t.$vis||t.$dataset||t.axis)&&this._differs(e.axisCol,e.axisCol=function(t){var e=t.$vis,r=t.$dataset,i=t.axis;if(!e||!i)return null;var o=e.axes()[i],a="object"===n(o)?o[0]:o;return r.hasColumn(a)?r.column(a):null}(e))&&(t.axisCol=!0),(t.axisCol||t.type)&&this._differs(e.columnType,e.columnType=function(t){var e=t.axisCol,n=t.type;return e?e.type():n||"number"}(e))&&(t.columnType=!0),t.columnType&&this._differs(e.customFormatHelp,e.customFormatHelp=function(t){switch(t.columnType){case"date":return rt("controls / custom-format / custom / date","core");case"number":return rt("controls / custom-format / custom / number","core")}}(e))&&(t.customFormatHelp=!0),(t.columnType||t.auto)&&this._differs(e.options,e.options=function(t){var e=t.columnType,n=t.auto,r=Gi(e).map((function(t){return{value:t.f,label:t.l}}));return n&&r.unshift({value:"auto",label:rt("controls / custom-format / auto","core")}),r.push({value:"custom",label:rt("controls / custom-format / custom","core")}),r}(e))&&(t.options=!0)};var Ji=["",""];function Qi(t){var e=t.changed,n=t.current;t.previous;e.value&&!Array.isArray(n.value)&&(n.value=Ji)}function Zi(t){var e,n,r,i;X(this,t),this._state=u({},t.data),this._intro=!0,this._fragment=(e=this._state,i=e.label||"",{c:function(){n=k("noscript"),r=k("noscript")},m:function(t,e){p(t,n,e),n.insertAdjacentHTML("afterend",i),p(t,r,e)},p:function(t,e){t.label&&i!==(i=e.label||"")&&(m(n,r),n.insertAdjacentHTML("afterend",i))},d:function(t){t&&(m(n,r),v(n),v(r))}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}u(function(t){var e=this;X(this,t),this._state=u({disabled:!1,value:Ji,help:"",width:"100px",valign:"middle",placeholder:{min:"min",max:"max"}},t.data),this._intro=!0,this._handlers.state=[Qi],Qi.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d,f=!1,p=!1;function v(){f=!0,e.value[0]=r.value,t.set({value:e.value}),f=!1}function m(){p=!0,e.value[1]=u.value,t.set({value:e.value}),p=!1}var g={type:"custom-axis-range",width:e.width,valign:e.valign,label:e.label,disabled:e.disabled,help:e.help},b=new pi({root:t.root,store:t.store,slots:{default:x()},data:g});return{c:function(){n=k("div"),r=k("input"),o=T("\n        "),a=k("span"),s=T("–"),c=T("\n        "),u=k("input"),b._fragment.c(),C(r,"input",v),A(r,"type","text"),r.placeholder=i=e.placeholder.min,r.disabled=e.disabled,r.className="svelte-1cv0z53",a.className=l="separator "+(e.disabled?"separator-disabled":"")+" svelte-1cv0z53",C(u,"input",m),A(u,"type","text"),u.placeholder=d=e.placeholder.max,u.disabled=e.disabled,u.className="svelte-1cv0z53",n.className="range-container svelte-1cv0z53"},m:function(t,i){h(b._slotted.default,n),h(n,r),r.value=e.value[0],h(n,o),h(n,a),h(a,s),h(n,c),h(n,u),u.value=e.value[1],b._mount(t,i)},p:function(t,n){e=n,!f&&t.value&&(r.value=e.value[0]),t.placeholder&&i!==(i=e.placeholder.min)&&(r.placeholder=i),t.disabled&&(r.disabled=e.disabled),t.disabled&&l!==(l="separator "+(e.disabled?"separator-disabled":"")+" svelte-1cv0z53")&&(a.className=l),!p&&t.value&&(u.value=e.value[1]),t.placeholder&&d!==(d=e.placeholder.max)&&(u.placeholder=d),t.disabled&&(u.disabled=e.disabled);var o={};t.width&&(o.width=e.width),t.valign&&(o.valign=e.valign),t.label&&(o.label=e.label),t.disabled&&(o.disabled=e.disabled),t.help&&(o.help=e.help),b._set(o)},d:function(t){M(r,"input",v),M(u,"input",m),b.destroy(t)}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}.prototype,tt),u(Zi.prototype,tt);function to(t){var e=this._svelte,n=e.component,r=e.ctx;n.select(t,r.opt)}function eo(t,e,n){var r=Object.create(t);return r.opt=e[n],r}function no(t,e){var n,r=[e.currentItem],i=e.itemRenderer;function o(e){for(var n={},i=0;i<r.length;i+=1)n=u(n,r[i]);return{root:t.root,store:t.store,data:n}}if(i)var a=new i(o());return{c:function(){a&&a._fragment.c(),n=O()},m:function(t,e){a&&a._mount(t,e),p(t,n,e)},p:function(t,e){var s=t.currentItem?B(r,[e.currentItem]):{};i!==(i=e.itemRenderer)?(a&&a.destroy(),i?((a=new i(o()))._fragment.c(),a._mount(n.parentNode,n)):a=null):i&&a._set(s)},d:function(t){t&&v(n),a&&a.destroy(t)}}}function ro(t,e){var n,r,i=e.currentItem.label;return{c:function(){n=k("noscript"),r=k("noscript")},m:function(t,e){p(t,n,e),n.insertAdjacentHTML("afterend",i),p(t,r,e)},p:function(t,e){t.currentItem&&i!==(i=e.currentItem.label)&&(m(n,r),n.insertAdjacentHTML("afterend",i))},d:function(t){t&&(m(n,r),v(n),v(r))}}}function io(t,e){for(var n,r=e.options,i=[],o=0;o<r.length;o+=1)i[o]=oo(t,eo(e,r,o));return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=O()},m:function(t,e){for(var r=0;r<i.length;r+=1)i[r].m(t,e);p(t,n,e)},p:function(e,o){if(e.value||e.options||e.itemRenderer){r=o.options;for(var a=0;a<r.length;a+=1){var s=eo(o,r,a);i[a]?i[a].p(e,s):(i[a]=oo(t,s),i[a].c(),i[a].m(n.parentNode,n))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(t){w(i,t),t&&v(n)}}}function oo(t,e){var n,r,i,o,a,s=[e.opt],l=e.itemRenderer;function c(e){for(var n={},r=0;r<s.length;r+=1)n=u(n,s[r]);return{root:t.root,store:t.store,data:n}}if(l)var d=new l(c());return{c:function(){n=k("li"),r=k("a"),d&&d._fragment.c(),o=T("\n                "),r._svelte={component:t,ctx:e},C(r,"click",to),r.href=i="#/"+e.opt.value,n.className=a=(e.value==e.opt.value?"selected":"")+" svelte-kh5nv7"},m:function(t,e){p(t,n,e),h(n,r),d&&d._mount(r,null),h(n,o)},p:function(t,o){e=o;var u=t.options?B(s,[e.opt]):{};l!==(l=e.itemRenderer)?(d&&d.destroy(),l?((d=new l(c()))._fragment.c(),d._mount(r,null)):d=null):l&&d._set(u),r._svelte.ctx=e,t.options&&i!==(i="#/"+e.opt.value)&&(r.href=i),(t.value||t.options)&&a!==(a=(e.value==e.opt.value?"selected":"")+" svelte-kh5nv7")&&(n.className=a)},d:function(t){t&&v(n),d&&d.destroy(),M(r,"click",to)}}}function ao(t){X(this,t),this._state=u({forcePlaceholder:!1,disabled:!1,width:"auto",options:[],optgroups:[],placeholder:"(select an item)",forceLabel:!1,passEvent:!1,itemRenderer:Zi,valign:"middle"},t.data),this._recompute({value:1,options:1,placeholder:1,forcePlaceholder:1,forceLabel:1},this._state),this._intro=!0,this._fragment=function(t,e){var n,r,i,o,a,s,l,c;function u(t){return t.currentItem.isPlaceholder?ro:no}var d=u(e),f=d(t,e);function p(e){t.keydown(e)}var v=e.options.length&&io(t,e),m={disabled:e.disabled},g=new Tt({root:t.root,store:t.store,slots:{default:x(),content:x(),button:x()},data:m}),b={width:e.width,inline:!0,valign:e.valign,label:e.label,disabled:e.disabled},_=new pi({root:t.root,store:t.store,slots:{default:x()},data:b});return{c:function(){n=k("span"),r=k("div"),i=k("button"),f.c(),o=T("\n                    "),a=k("span"),s=T("\n        "),l=k("span"),c=k("ul"),v&&v.c(),g._fragment.c(),_._fragment.c(),a.className="caret svelte-kh5nv7",C(i,"keydown",p),i.className="btn dropdown-toggle svelte-kh5nv7",P(i,"disabled",e.disabled),r.className="btn-group",A(n,"slot","button"),c.className="dropdown-menu svelte-kh5nv7",j(c,"display","block"),A(l,"slot","content")},m:function(t,e){h(g._slotted.button,n),h(n,r),h(r,i),f.m(i,null),h(i,o),h(i,a),h(g._slotted.default,s),h(g._slotted.content,l),h(l,c),v&&v.m(c,null),g._mount(_._slotted.default,null),_._mount(t,e)},p:function(e,n){d===(d=u(n))&&f?f.p(e,n):(f.d(1),(f=d(t,n)).c(),f.m(i,o)),e.disabled&&P(i,"disabled",n.disabled),n.options.length?v?v.p(e,n):((v=io(t,n)).c(),v.m(c,null)):v&&(v.d(1),v=null);var r={};e.disabled&&(r.disabled=n.disabled),g._set(r);var a={};e.width&&(a.width=n.width),e.valign&&(a.valign=n.valign),e.label&&(a.label=n.label),e.disabled&&(a.disabled=n.disabled),_._set(a)},d:function(t){f.d(),M(i,"keydown",p),v&&v.d(),g.destroy(),_.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(ao.prototype,tt),u(ao.prototype,{select:function(t,e){t.preventDefault();var n=this.get().passEvent;this.set({value:e.value}),this.fire("change",n?{value:e.value,event:t}:e.value)},keydown:function(t){"ArrowDown"===t.key?this.moveSelection(t,1):"ArrowUp"===t.key&&this.moveSelection(t,-1)},moveSelection:function(t,e){var n=this.get(),r=n.value,i=n.options,o=n.passEvent,a=i.map((function(t){return t.value})).indexOf(r);r<0?a=e>0?e:i.length+e:a+=e;var s=i[(a+i.length)%i.length].value;this.set({value:s}),this.fire("change",o?{value:s,event:t}:s)}}),ao.prototype._recompute=function(t,e){(t.value||t.options||t.placeholder||t.forcePlaceholder||t.forceLabel)&&this._differs(e.currentItem,e.currentItem=function(t){var e=t.value,n=t.options,r=t.placeholder,i=t.forcePlaceholder,o=t.forceLabel;if(o)return"string"==typeof o?{label:o}:o;if(!i)for(var a=0;a<n.length;a++)if(n[a].value===e)return n[a];return{isPlaceholder:!0,label:'<span style="color:#999;font-size:12px;">'.concat(r,"</span>")}}(e))&&(t.currentItem=!0)};function so(t){t.preventDefault();var e=this._svelte,n=e.component,r=e.ctx;n.action(r.item)}function lo(t,e,n){var r=Object.create(t);return r.item=e[n],r}function co(t,e){var n,r,i,o,a=e.icon&&uo(t,e);function s(e){e.preventDefault(),e.stopPropagation(),t.fireClick()}return{c:function(){n=k("button"),a&&a.c(),r=T(" "),i=k("noscript"),C(n,"click",s),n.disabled=e.disabled,n.className=o="split-button-label "+e.btnClass+" svelte-1qu0vk"},m:function(t,o){p(t,n,o),a&&a.m(n,null),h(n,r),h(n,i),i.insertAdjacentHTML("afterend",e.label)},p:function(e,s){s.icon?a?a.p(e,s):((a=uo(t,s)).c(),a.m(n,r)):a&&(a.d(1),a=null),e.label&&(g(i),i.insertAdjacentHTML("afterend",s.label)),e.disabled&&(n.disabled=s.disabled),e.btnClass&&o!==(o="split-button-label "+s.btnClass+" svelte-1qu0vk")&&(n.className=o)},d:function(t){t&&v(n),a&&a.d(),M(n,"click",s)}}}function uo(t,e){var n;return{c:function(){(n=k("i")).className=e.icon+" svelte-1qu0vk"},m:function(t,e){p(t,n,e)},p:function(t,e){t.icon&&(n.className=e.icon+" svelte-1qu0vk")},d:function(t){t&&v(n)}}}function fo(t,e){var n,r,i=e.icon&&po(t,e);function o(t){return t.label?mo:vo}var a=o(e),s=a(t,e);return{c:function(){i&&i.c(),n=T(" "),s.c(),r=O()},m:function(t,e){i&&i.m(t,e),p(t,n,e),s.m(t,e),p(t,r,e)},p:function(e,l){l.icon?i?i.p(e,l):((i=po(t,l)).c(),i.m(n.parentNode,n)):i&&(i.d(1),i=null),a===(a=o(l))&&s?s.p(e,l):(s.d(1),(s=a(t,l)).c(),s.m(r.parentNode,r))},d:function(t){i&&i.d(t),t&&v(n),s.d(t),t&&v(r)}}}function ho(t,e){var n;return{c:function(){(n=k("span")).className="caret"},m:function(t,e){p(t,n,e)},p:c,d:function(t){t&&v(n)}}}function po(t,e){var n;return{c:function(){(n=k("i")).className=e.icon+" svelte-1qu0vk"},m:function(t,e){p(t,n,e)},p:function(t,e){t.icon&&(n.className=e.icon+" svelte-1qu0vk")},d:function(t){t&&v(n)}}}function vo(t,e){var n;return{c:function(){(n=k("i")).className="im im-menu-dot-h svelte-1qu0vk"},m:function(t,e){p(t,n,e)},p:c,d:function(t){t&&v(n)}}}function mo(t,e){var n,r,i,o;return{c:function(){n=k("noscript"),r=k("noscript"),i=T(" "),(o=k("span")).className="caret"},m:function(t,a){p(t,n,a),n.insertAdjacentHTML("afterend",e.label),p(t,r,a),p(t,i,a),p(t,o,a)},p:function(t,e){t.label&&(m(n,r),n.insertAdjacentHTML("afterend",e.label))},d:function(t){t&&(m(n,r),v(n),v(r),v(i),v(o))}}}function go(t,e){var n,r,i,o=e.item.label;return{c:function(){n=k("li"),r=k("a"),i=T("\n        "),r._svelte={component:t,ctx:e},C(r,"click",so),r.href="#/action",r.className="svelte-1qu0vk",P(r,"disabled",e.item.disabled),n.className="svelte-1qu0vk"},m:function(t,e){p(t,n,e),h(n,r),r.innerHTML=o,h(n,i)},p:function(t,n){e=n,t.items&&o!==(o=e.item.label)&&(r.innerHTML=o),r._svelte.ctx=e,t.items&&P(r,"disabled",e.item.disabled)},d:function(t){t&&v(n),M(r,"click",so)}}}function bo(t){X(this,t),this._state=u({label:"",icon:!1,split:!1,items:[],btnClass:"btn"},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,i,o,a,s=e.split&&co(t,e);function l(t){return t.split?ho:fo}for(var c=l(e),u=c(t,e),d=e.items,f=[],p=0;p<d.length;p+=1)f[p]=go(t,lo(e,d,p));var v={disabled:e.disabled},m=new Tt({root:t.root,store:t.store,slots:{default:x(),content:x(),button:x()},data:v});return{c:function(){n=k("div"),s&&s.c(),r=T("\n        "),i=k("button"),u.c(),o=T("\n\n    "),a=k("ul");for(var t=0;t<f.length;t+=1)f[t].c();m._fragment.c(),i.disabled=e.disabled,i.className=e.btnClass+" svelte-1qu0vk",A(n,"slot","button"),n.className="btn-group",A(a,"slot","content"),a.className="svelte-1qu0vk"},m:function(t,e){h(m._slotted.button,n),s&&s.m(n,null),h(n,r),h(n,i),u.m(i,null),h(m._slotted.default,o),h(m._slotted.content,a);for(var l=0;l<f.length;l+=1)f[l].m(a,null);m._mount(t,e)},p:function(e,o){if(o.split?s?s.p(e,o):((s=co(t,o)).c(),s.m(n,r)):s&&(s.d(1),s=null),c===(c=l(o))&&u?u.p(e,o):(u.d(1),(u=c(t,o)).c(),u.m(i,null)),e.disabled&&(i.disabled=o.disabled),e.btnClass&&(i.className=o.btnClass+" svelte-1qu0vk"),e.items){d=o.items;for(var h=0;h<d.length;h+=1){var p=lo(o,d,h);f[h]?f[h].p(e,p):(f[h]=go(t,p),f[h].c(),f[h].m(a,null))}for(;h<f.length;h+=1)f[h].d(1);f.length=d.length}var v={};e.disabled&&(v.disabled=o.disabled),m._set(v)},d:function(t){s&&s.d(),u.d(),w(f,t),m.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(bo.prototype,tt),u(bo.prototype,{fireClick:function(){this.fire("click")},action:function(t){t.disabled||t.action(this)}});var _o,yo={select:function(t,e){if(!e.redirect&&(t.preventDefault(),!e.readonly&&(this.fire("select",e),"/edit/"===window.location.pathname.substr(0,6)))){var n=this.store.get().id;window.history.pushState({step:e,id:n},"","/edit/".concat(n,"/").concat(e.id))}}};function wo(t){var e=t.changed,n=t.current;if(e.activeIndex){var r=n.steps[n.activeIndex];if(r){var i=this.store.get(),o=i.id,a=i.title;window.document.title="".concat(a," - ").concat(o," - ").concat(r.title," | Datawrapper")}}}function xo(t,e){var n;return{c:function(){(n=k("i")).className="fa fa-check"},m:function(t,e){p(t,n,e)},d:function(t){t&&v(n)}}}function ko(t){var e=this;X(this,t),this._state=u(u(this.store._init(["lastEditStep"]),{step:{title:"",index:1},maxStep:1,active:1}),t.data),this.store._add(this,["lastEditStep"]),this._recompute({active:1,steps:1,index:1,activeIndex:1,maxStep:1,step:1,passed:1,$lastEditStep:1},this._state),this._intro=!0,this._handlers.update=[wo],this._handlers.destroy=[Z],this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d=e.step.title,f=e.passed&&xo();function m(n){t.select(n,e.step)}return{c:function(){n=k("a"),r=k("span"),i=T(e.index),o=T("\n    "),a=k("span"),s=T("\n    "),f&&f.c(),l=T("\n    "),c=k("div"),r.className="step",a.className="title",c.className="corner",C(n,"click",m),j(n,"width",95/e.steps.length+"%"),n.href=u=e.step.redirect?e.step.redirect:"#"+e.step.id,n.className=e.class_},m:function(t,e){p(t,n,e),h(n,r),h(r,i),h(n,o),h(n,a),a.innerHTML=d,h(n,s),f&&f.m(n,null),h(n,l),h(n,c)},p:function(t,r){e=r,t.index&&S(i,e.index),t.step&&d!==(d=e.step.title)&&(a.innerHTML=d),e.passed?f||((f=xo()).c(),f.m(n,l)):f&&(f.d(1),f=null),t.steps&&j(n,"width",95/e.steps.length+"%"),t.step&&u!==(u=e.step.redirect?e.step.redirect:"#"+e.step.id)&&(n.href=u),t.class_&&(n.className=e.class_)},d:function(t){t&&v(n),f&&f.d(),M(n,"click",m)}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function No(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;window._paq&&(_o&&window._paq.push(["setReferrerUrl",_o]),window._paq.push(["setGenerationTimeMs",t]),window._paq.push(["setCustomUrl",window.location.pathname]),window._paq.push(["setDocumentTitle",window.document.title]),window._paq.push(["trackPageView"]),_o=window.location.pathname)}u(ko.prototype,tt),u(ko.prototype,yo),ko.prototype._recompute=function(t,e){var n,r,i;(t.active||t.steps)&&this._differs(e.activeIndex,e.activeIndex=(r=(n=e).active,(i=n.steps).indexOf(Ar.findWhere(i,{id:r}))))&&(t.activeIndex=!0),(t.index||t.activeIndex||t.maxStep)&&this._differs(e.passed,e.passed=function(t){var e=t.index,n=t.activeIndex;return e<t.maxStep&&e!==n}(e))&&(t.passed=!0),(t.step||t.index||t.active||t.passed||t.$lastEditStep)&&this._differs(e.class_,e.class_=function(t){var e=t.step,n=t.index,r=t.active,i=t.passed,o=t.$lastEditStep,a=[];return e.readonly&&a.push("readonly"),r===e.id?a.push("active"):(n>o+1&&a.push("unseen"),i&&a.push("passed")),a.join(" ")}(e))&&(t.class_=!0)};var To,Oo={select:function(t,e){this.set({active:t.id});var n=this.store.get().lastEditStep;this.store.set({lastEditStep:Math.max(n,e+1)}),No()},popstate:function(t){if(t.state&&t.state.id&&t.state.step){var e=t.state,n=e.id,r=e.step;n===this.store.get().id?(this.set({active:r.id}),No()):window.location.href="/edit/".concat(n,"/").concat(r.id)}}};function Co(){var t=this.get(),e=t.active,n=t.steps,r=this.store.get(),i=r.lastEditStep,o=r.id,a=Ar.findWhere(n,{id:e});this.store.set({lastEditStep:Math.max(i,n.indexOf(a)+1)}),window.history.replaceState({step:a,id:o},a.title)}function Mo(t,e,n){var r=Object.create(t);return r.step=e[n],r.each_value=e,r.i=n,r}function Ao(t,e){var n={},r={index:e.i+1};void 0!==e.step&&(r.step=e.step,n.step=!0),void 0!==e.steps&&(r.steps=e.steps,n.steps=!0),void 0!==e.active&&(r.active=e.active,n.active=!0);var i=new ko({root:t.root,store:t.store,data:r,_bind:function(r,i){var o={};!n.step&&r.step&&(e.each_value[e.i]=i.step=i.step,o.steps=e.steps),!n.steps&&r.steps&&(o.steps=i.steps),!n.active&&r.active&&(o.active=i.active),t._set(o),n={}}});return t.root._beforecreate.push((function(){i._bind({step:1,steps:1,active:1},i.get())})),i.on("select",(function(n){t.select(e.step,e.i)})),{c:function(){i._fragment.c()},m:function(t,e){i._mount(t,e)},p:function(t,r){e=r;var o={};!n.step&&t.steps&&(o.step=e.step,n.step=void 0!==e.step),!n.steps&&t.steps&&(o.steps=e.steps,n.steps=void 0!==e.steps),!n.active&&t.active&&(o.active=e.active,n.active=void 0!==e.active),i._set(o),n={}},d:function(t){i.destroy(t)}}}function Eo(t,e){var n,r,i,o,a,s,l;return{c:function(){n=k("div"),r=T("This chart belongs to\n    "),i=k("a"),o=T("User "),a=T(e.$authorId),l=T(". Great power comes with great responsibility, so be careful with what\n    you're doing!"),i.target="_blank",i.href=s="/admin/chart/by/"+e.$authorId,n.className="alert alert-warning",j(n,"text-align","center"),j(n,"margin-top","10px")},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(i,o),h(i,a),h(n,l)},p:function(t,e){t.$authorId&&S(a,e.$authorId),t.$authorId&&s!==(s="/admin/chart/by/"+e.$authorId)&&(i.href=s)},d:function(t){t&&v(n)}}}function So(t){var e=this;X(this,t),this._state=u(u(this.store._init(["user","authorId"]),{steps:[]}),t.data),this.store._add(this,["user","authorId"]),this._intro=!0,this._handlers.destroy=[Z],this._fragment=function(t,e){var n,r,i;function o(e){t.popstate(e)}window.addEventListener("popstate",o);for(var a=e.steps,s=[],l=0;l<a.length;l+=1)s[l]=Ao(t,Mo(e,a,l));var c=e.$user.id!=e.$authorId&&e.$user.isAdmin&&Eo(t,e);return{c:function(){n=k("div");for(var t=0;t<s.length;t+=1)s[t].c();r=T("\n\n"),c&&c.c(),i=O(),n.className="create-nav svelte-nols97"},m:function(t,e){p(t,n,e);for(var o=0;o<s.length;o+=1)s[o].m(n,null);p(t,r,e),c&&c.m(t,e),p(t,i,e)},p:function(e,r){if(e.steps||e.active){a=r.steps;for(var o=0;o<a.length;o+=1){var l=Mo(r,a,o);s[o]?s[o].p(e,l):(s[o]=Ao(t,l),s[o].c(),s[o].m(n,null))}for(;o<s.length;o+=1)s[o].d(1);s.length=a.length}r.$user.id!=r.$authorId&&r.$user.isAdmin?c?c.p(e,r):((c=Eo(t,r)).c(),c.m(i.parentNode,i)):c&&(c.d(1),c=null)},d:function(t){window.removeEventListener("popstate",o),t&&v(n),w(s,t),t&&v(r),c&&c.d(t),t&&v(i)}}}(this,this._state),this.root._oncreate.push((function(){Co.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function jo(t,e){var n;return{c:function(){(n=k("label")).className="control-label svelte-1nkiaxn"},m:function(t,r){p(t,n,r),n.innerHTML=e.label},p:function(t,e){t.label&&(n.innerHTML=e.label)},d:function(t){t&&v(n)}}}function Io(t,e){var n;return{c:function(){(n=k("div")).className="help success svelte-1nkiaxn"},m:function(t,r){p(t,n,r),n.innerHTML=e.success},p:function(t,e){t.success&&(n.innerHTML=e.success)},d:function(t){t&&v(n)}}}function Lo(t,e){var n;return{c:function(){(n=k("div")).className="help error svelte-1nkiaxn"},m:function(t,r){p(t,n,r),n.innerHTML=e.error},p:function(t,e){t.error&&(n.innerHTML=e.error)},d:function(t){t&&v(n)}}}function Po(t,e){var n;return{c:function(){(n=k("div")).className="help svelte-1nkiaxn"},m:function(t,r){p(t,n,r),n.innerHTML=e.help},p:function(t,e){t.help&&(n.innerHTML=e.help)},d:function(t){t&&v(n)}}}function Ro(t){var e,n,r,i,o,a,s,l,c,d,f,m,g;X(this,t),this._state=u({label:"",help:"",error:!1,success:!1,width:"auto"},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,c=e._slotted.default,d=n.label&&jo(0,n),f=n.success&&Io(0,n),m=n.error&&Lo(0,n),g=!n.success&&!n.error&&n.help&&Po(0,n),{c:function(){r=k("div"),d&&d.c(),i=T("\n    "),o=k("div"),a=T("\n    "),f&&f.c(),s=T(" "),m&&m.c(),l=T(" "),g&&g.c(),o.className="form-controls svelte-1nkiaxn",r.className="form-block svelte-1nkiaxn",j(r,"width",n.width),P(r,"success",n.success),P(r,"error",n.error)},m:function(t,e){p(t,r,e),d&&d.m(r,null),h(r,i),h(r,o),c&&h(o,c),h(r,a),f&&f.m(r,null),h(r,s),m&&m.m(r,null),h(r,l),g&&g.m(r,null)},p:function(t,e){e.label?d?d.p(t,e):((d=jo(0,e)).c(),d.m(r,i)):d&&(d.d(1),d=null),e.success?f?f.p(t,e):((f=Io(0,e)).c(),f.m(r,s)):f&&(f.d(1),f=null),e.error?m?m.p(t,e):((m=Lo(0,e)).c(),m.m(r,l)):m&&(m.d(1),m=null),e.success||e.error||!e.help?g&&(g.d(1),g=null):g?g.p(t,e):((g=Po(0,e)).c(),g.m(r,null)),t.width&&j(r,"width",e.width),t.success&&P(r,"success",e.success),t.error&&P(r,"error",e.error)},d:function(t){t&&v(r),d&&d.d(),c&&b(o,c),f&&f.d(),m&&m.d(),g&&g.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function Do(){var t=this.get(),e=t.fontSizePercent,n=t.value;e&&13===n.fontSize&&(n.fontSize=1,this.set({value:n}))}function zo(t,e){var n,r={},i={disabled:e.disabled,indeterminate:e.indeterminate.underline};void 0!==e.value.underline&&(i.value=e.value.underline,r.value=!0);var o=new jt({root:t.root,store:t.store,slots:{default:x()},data:i,_bind:function(n,i){var o={};!r.value&&n.value&&(e.value.underline=i.value,o.value=e.value),t._set(o),r={}}});return t.root._beforecreate.push((function(){o._bind({value:1},o.get())})),{c:function(){n=k("i"),o._fragment.c(),n.className="fa fa-fw fa-underline"},m:function(t,e){h(o._slotted.default,n),o._mount(t,e)},p:function(t,n){e=n;var i={};t.disabled&&(i.disabled=e.disabled),t.indeterminate&&(i.indeterminate=e.indeterminate.underline),!r.value&&t.value&&(i.value=e.value.underline,r.value=void 0!==e.value.underline),o._set(i),r={}},d:function(t){o.destroy(t)}}}function Uo(t,e){var n,r,i={},o={disabled:e.disabled,indeterminate:e.indeterminate.wide};void 0!==e.value.wide&&(o.value=e.value.wide,i.value=!0);var a=new jt({root:t.root,store:t.store,slots:{default:x()},data:o,_bind:function(n,r){var o={};!i.value&&n.value&&(e.value.wide=r.value,o.value=e.value),t._set(o),i={}}});return t.root._beforecreate.push((function(){a._bind({value:1},a.get())})),{c:function(){n=k("i"),a._fragment.c(),r=T("\n        "),n.className="fa fa-text-width fa-fw ",A(n,"aria-hidden","true")},m:function(t,e){h(a._slotted.default,n),a._mount(t,e),p(t,r,e)},p:function(t,n){e=n;var r={};t.disabled&&(r.disabled=e.disabled),t.indeterminate&&(r.indeterminate=e.indeterminate.wide),!i.value&&t.value&&(r.value=e.value.wide,i.value=void 0!==e.value.wide),a._set(r),i={}},d:function(t){a.destroy(t),t&&v(r)}}}function Ho(t,e){var n,r,i,o,a={},s={disabled:e.disabled,reset:e.colorReset};void 0!==e.value.color&&(s.color=e.value.color,a.color=!0);var l=new ui({root:t.root,store:t.store,slots:{default:x()},data:s,_bind:function(n,r){var i={};!a.color&&n.color&&(e.value.color=r.color,i.value=e.value),t._set(i),a={}}});return t.root._beforecreate.push((function(){l._bind({color:1},l.get())})),{c:function(){n=k("button"),r=k("i"),i=T("\n                "),o=k("div"),l._fragment.c(),r.className="fa fa-font fa-fw svelte-s620at",A(r,"aria-hidden","true"),o.className="color-bar svelte-s620at",j(o,"background",e.value.color?e.value.color:e.defaultColor),n.disabled=e.disabled,n.className="btn-color btn btn-s svelte-s620at"},m:function(t,e){h(l._slotted.default,n),h(n,r),h(n,i),h(n,o),l._mount(t,e)},p:function(t,r){e=r,(t.value||t.defaultColor)&&j(o,"background",e.value.color?e.value.color:e.defaultColor),t.disabled&&(n.disabled=e.disabled);var i={};t.disabled&&(i.disabled=e.disabled),t.colorReset&&(i.reset=e.colorReset),!a.color&&t.value&&(i.color=e.value.color,a.color=void 0!==e.value.color),l._set(i),a={}},d:function(t){l.destroy(t)}}}function Fo(t,e){var n,r,i,o,a,s={},l={disabled:e.disabled,reset:e.backgroundReset};void 0!==e.value.background&&(l.color=e.value.background,s.color=!0);var c=new ui({root:t.root,store:t.store,slots:{default:x()},data:l,_bind:function(n,r){var i={};!s.color&&n.color&&(e.value.background=r.color,i.value=e.value),t._set(i),s={}}});return t.root._beforecreate.push((function(){c._bind({color:1},c.get())})),{c:function(){n=k("button"),r=N("svg"),i=N("path"),o=T("\n                "),a=k("div"),c._fragment.c(),A(i,"d","M21.143 9.667c-.733-1.392-1.914-3.05-3.617-4.753-2.977-2.978-5.478-3.914-6.785-3.914-.414 0-.708.094-.86.246l-1.361 1.36c-1.899-.236-3.42.106-4.294.983-.876.875-1.164 2.159-.792 3.523.492 1.806 2.305 4.049 5.905 5.375.038.323.157.638.405.885.588.588 1.535.586 2.121 0s.588-1.533.002-2.119c-.588-.587-1.537-.588-2.123-.001l-.17.256c-2.031-.765-3.395-1.828-4.232-2.9l3.879-3.875c.496 2.73 6.432 8.676 9.178 9.178l-7.115 7.107c-.234.153-2.798-.316-6.156-3.675-3.393-3.393-3.175-5.271-3.027-5.498l1.859-1.856c-.439-.359-.925-1.103-1.141-1.689l-2.134 2.131c-.445.446-.685 1.064-.685 1.82 0 1.634 1.121 3.915 3.713 6.506 2.764 2.764 5.58 4.243 7.432 4.243.648 0 1.18-.195 1.547-.562l8.086-8.078c.91.874-.778 3.538-.778 4.648 0 1.104.896 1.999 2 1.999 1.105 0 2-.896 2-2 0-3.184-1.425-6.81-2.857-9.34zm-16.209-5.371c.527-.53 1.471-.791 2.656-.761l-3.209 3.206c-.236-.978-.049-1.845.553-2.445zm9.292 4.079l-.03-.029c-1.292-1.292-3.803-4.356-3.096-5.063.715-.715 3.488 1.521 5.062 3.096.862.862 2.088 2.247 2.937 3.458-1.717-1.074-3.491-1.469-4.873-1.462z"),A(r,"xmlns","http://www.w3.org/2000/svg"),A(r,"width","18"),A(r,"height","14"),A(r,"viewBox","0 0 24 24"),a.className="color-bar svelte-s620at",j(a,"background",e.value.background?e.value.background:e.defaultBackground),n.disabled=e.disabled,n.className="btn-color btn btn-s svelte-s620at"},m:function(t,e){h(c._slotted.default,n),h(n,r),h(r,i),h(n,o),h(n,a),c._mount(t,e)},p:function(t,r){e=r,(t.value||t.defaultBackground)&&j(a,"background",e.value.background?e.value.background:e.defaultBackground),t.disabled&&(n.disabled=e.disabled);var i={};t.disabled&&(i.disabled=e.disabled),t.backgroundReset&&(i.reset=e.backgroundReset),!s.color&&t.value&&(i.color=e.value.background,s.color=void 0!==e.value.background),c._set(i),s={}},d:function(t){c.destroy(t)}}}function $o(t,e){var n={},r={width:e.fontSizePercent?"43px":"30px",slider:!1,disabled:e.disabled,unit:e.fontSizePercent?"%":"px",step:e.fontSizePercent?.01:1,multiply:e.fontSizePercent?100:1,min:"0",max:e.fontSizePercent?5:50};void 0!==e.value.fontSize&&(r.value=e.value.fontSize,n.value=!0);var i=new kt({root:t.root,store:t.store,data:r,_bind:function(r,i){var o={};!n.value&&r.value&&(e.value.fontSize=i.value,o.value=e.value),t._set(o),n={}}});return t.root._beforecreate.push((function(){i._bind({value:1},i.get())})),{c:function(){i._fragment.c()},m:function(t,e){i._mount(t,e)},p:function(t,r){e=r;var o={};t.fontSizePercent&&(o.width=e.fontSizePercent?"43px":"30px"),t.disabled&&(o.disabled=e.disabled),t.fontSizePercent&&(o.unit=e.fontSizePercent?"%":"px"),t.fontSizePercent&&(o.step=e.fontSizePercent?.01:1),t.fontSizePercent&&(o.multiply=e.fontSizePercent?100:1),t.fontSizePercent&&(o.max=e.fontSizePercent?5:50),!n.value&&t.value&&(o.value=e.value.fontSize,n.value=void 0!==e.value.fontSize),i._set(o),n={}},d:function(t){i.destroy(t)}}}function Bo(){var t=this;setTimeout((function(){t.set({id:"gradient-"+Math.floor(1e6*Math.random()).toString(36)})}))}function qo(t,e,n){var r=Object.create(t);return r.stop=e[n],r}function Go(t,e){var n,r,i;return{c:function(){A(n=N("stop"),"offset",r=(100*e.stop.offset).toFixed(2)+"%"),A(n,"stop-color",i=e.stop.color)},m:function(t,e){p(t,n,e)},p:function(t,e){t.stops&&r!==(r=(100*e.stop.offset).toFixed(2)+"%")&&A(n,"offset",r),t.stops&&i!==(i=e.stop.color)&&A(n,"stop-color",i)},d:function(t){t&&v(n)}}}function Vo(t,e){var n;return{c:function(){(n=k("button")).innerHTML='<i class="fa fa-fw fa-trash svelte-1m40moe"></i>',n.className="btn btn-mini btn-delete svelte-1m40moe"},m:function(t,e){p(t,n,e)},d:function(t){t&&v(n)}}}function Wo(t){var e=this;X(this,t),this._state=u({id:"gradient",width:105,height:22,canDelete:!1,stops:[]},t.data),this._intro=!0,this._fragment=function(t,e){for(var n,r,i,o,a,s,l=e.stops,c=[],u=0;u<l.length;u+=1)c[u]=Go(t,qo(e,l,u));var d=e.canDelete&&Vo();return{c:function(){n=N("svg"),r=N("defs"),i=N("linearGradient");for(var t=0;t<c.length;t+=1)c[t].c();o=N("rect"),a=T("\n"),d&&d.c(),s=O(),A(i,"id",e.id),A(i,"x2","1"),j(o,"fill","url(#"+e.id+")"),A(o,"width",e.width),A(o,"height",e.height),A(n,"width",e.width),A(n,"height",e.height),A(n,"class","svelte-1m40moe")},m:function(t,e){p(t,n,e),h(n,r),h(r,i);for(var l=0;l<c.length;l+=1)c[l].m(i,null);h(n,o),p(t,a,e),d&&d.m(t,e),p(t,s,e)},p:function(e,r){if(e.stops){l=r.stops;for(var a=0;a<l.length;a+=1){var u=qo(r,l,a);c[a]?c[a].p(e,u):(c[a]=Go(t,u),c[a].c(),c[a].m(i,null))}for(;a<c.length;a+=1)c[a].d(1);c.length=l.length}e.id&&(A(i,"id",r.id),j(o,"fill","url(#"+r.id+")")),e.width&&A(o,"width",r.width),e.height&&A(o,"height",r.height),e.width&&A(n,"width",r.width),e.height&&A(n,"height",r.height),r.canDelete?d||((d=Vo()).c(),d.m(s.parentNode,s)):d&&(d.d(1),d=null)},d:function(t){t&&v(n),w(c,t),t&&v(a),d&&d.d(t),t&&v(s)}}}(this,this._state),this.root._oncreate.push((function(){Bo.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function Yo(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function Ko(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?Yo(Object(r),!0).forEach((function(n){t(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Yo(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}u(So.prototype,tt),u(So.prototype,Oo),u(Ro.prototype,tt),u(function(t){var e=this;X(this,t),this._state=u({value:{bold:!1,italic:!1,underline:!1,wide:!1,color:"#000000",background:"#ffffff",fontSize:13,colorReset:!1,backgroundReset:!1},indeterminate:{bold:!1,italic:!1,underline:!1,wide:!1,color:!1,background:!1,fontSize:!1},disabled:!1,disabled_msg:"",width:"80px",help:"",placeholder:"",underline:!0,spacing:!1,color:!1,fontSize:!1,fontSizePercent:!1,background:!1,defaultColor:"transparent",defaultBackground:"transparent"},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d,f={},p={},v={disabled:e.disabled,indeterminate:e.indeterminate.bold};void 0!==e.value.bold&&(v.value=e.value.bold,f.value=!0);var m=new jt({root:t.root,store:t.store,slots:{default:x()},data:v,_bind:function(n,r){var i={};!f.value&&n.value&&(e.value.bold=r.value,i.value=e.value),t._set(i),f={}}});t.root._beforecreate.push((function(){m._bind({value:1},m.get())}));var g={disabled:e.disabled,indeterminate:e.indeterminate.italic};void 0!==e.value.italic&&(g.value=e.value.italic,p.value=!0);var b=new jt({root:t.root,store:t.store,slots:{default:x()},data:g,_bind:function(n,r){var i={};!p.value&&n.value&&(e.value.italic=r.value,i.value=e.value),t._set(i),p={}}});t.root._beforecreate.push((function(){b._bind({value:1},b.get())}));var _=e.underline&&zo(t,e),y=e.spacing&&Uo(t,e),w=e.color&&Ho(t,e),N=e.background&&Fo(t,e),C=e.fontSize&&$o(t,e),M={width:e.width,type:"radio",valign:"baseline",label:e.label,disabled:e.disabled},A=new pi({root:t.root,store:t.store,slots:{default:x()},data:M});return{c:function(){n=k("div"),r=k("i"),m._fragment.c(),i=T("\n        "),o=k("i"),b._fragment.c(),a=T("\n        "),_&&_.c(),s=T(" "),y&&y.c(),l=O(),w&&w.c(),c=T(" "),N&&N.c(),u=T("\n    "),C&&C.c(),d=O(),A._fragment.c(),r.className="fa fa-fw fa-bold",o.className="fa fa-fw fa-italic",n.className="btn-group svelte-l5q6v5 svelte-s620at"},m:function(t,e){h(A._slotted.default,n),h(m._slotted.default,r),m._mount(n,null),h(n,i),h(b._slotted.default,o),b._mount(n,null),h(n,a),_&&_.m(n,null),h(n,s),y&&y.m(n,null),h(n,l),w&&w.m(n,null),h(n,c),N&&N.m(n,null),h(A._slotted.default,u),C&&C.m(A._slotted.default,null),h(A._slotted.default,d),A._mount(t,e)},p:function(r,i){e=i;var o={};r.disabled&&(o.disabled=e.disabled),r.indeterminate&&(o.indeterminate=e.indeterminate.bold),!f.value&&r.value&&(o.value=e.value.bold,f.value=void 0!==e.value.bold),m._set(o),f={};var a={};r.disabled&&(a.disabled=e.disabled),r.indeterminate&&(a.indeterminate=e.indeterminate.italic),!p.value&&r.value&&(a.value=e.value.italic,p.value=void 0!==e.value.italic),b._set(a),p={},e.underline?_?_.p(r,e):((_=zo(t,e)).c(),_.m(n,s)):_&&(_.d(1),_=null),e.spacing?y?y.p(r,e):((y=Uo(t,e)).c(),y.m(n,l)):y&&(y.d(1),y=null),e.color?w?w.p(r,e):((w=Ho(t,e)).c(),w.m(n,c)):w&&(w.d(1),w=null),e.background?N?N.p(r,e):((N=Fo(t,e)).c(),N.m(n,null)):N&&(N.d(1),N=null),e.fontSize?C?C.p(r,e):((C=$o(t,e)).c(),C.m(d.parentNode,d)):C&&(C.d(1),C=null);var u={};r.width&&(u.width=e.width),r.label&&(u.label=e.label),r.disabled&&(u.disabled=e.disabled),A._set(u)},d:function(t){m.destroy(),b.destroy(),_&&_.d(),y&&y.d(),w&&w.d(),N&&N.d(),C&&C.d(),A.destroy(t)}}}(this,this._state),this.root._oncreate.push((function(){Do.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}.prototype,tt),u(Wo.prototype,tt);var Xo=[[{icon:'<i class="fa fa-undo fa-fw"></i>',label:rt("controls / gradient-editor / undo","core"),action:function(){To.undo()},disabled:function(t){return 0===t.undoStack.length}},{icon:'<i class="fa fa-undo fa-flip-horizontal fa-fw"></i>',label:rt("controls / gradient-editor / redo","core"),action:function(){To.redo()},disabled:function(t){return 0===t.redoStack.length}}],[{icon:'<i class="fa fa-random fa-fw"></i>',label:rt("controls / gradient-editor / reverse","core"),action:function(){To.reverse()}}],[{icon:'<i class="im im-wizard"></i> ',label:rt("controls / gradient-editor / autocorrect","core"),action:function(){To.autoCorrect()},disabled:function(t){return!t.lightnessFixable}},{icon:'<i class="contrast-up"></i> <span>+</span> ',label:rt("controls / gradient-editor / contrast-up","core"),action:function(){To.contrastUp()},disabled:function(t){return!t.lightnessFixable}},{icon:'<i class="contrast-down"></i> <span>−</span>',label:rt("controls / gradient-editor / contrast-down","core"),action:function(){To.contrastDown()},disabled:function(t){return!t.lightnessFixable}}],[{icon:'<i class="im im-floppy-disk"></i> ',label:rt("controls / gradient-editor / save","core"),action:function(){To.savePreset()}},{icon:'<i class="im im-sign-in"></i> ',label:rt("controls / gradient-editor / import","core"),action:function(){var t=window.prompt(rt("controls / gradient-editor / import / text","core")).split(/[, ]+/);To.select(t)}},{icon:'<i class="im im-sign-out"></i> ',label:rt("controls / gradient-editor / export","core"),action:function(){var t=To.get().colors;window.prompt(rt("controls / gradient-editor / export / text","core"),t.map((function(t){return t.color})))}}]];function Jo(t,e){return!!t.disabled&&t.disabled(e)}var Qo={select:function(t){this.set({dragging:!1,wouldDelete:!1,colors:"string"==typeof t[0]?t.map((function(e,n){return{color:e,position:n/(t.length-1)}})):bi(t)})},handleChange:function(t){var e=t.event,n=t.value;if(e.target.classList.contains("btn-delete")){var r=this.get().userPresets;r.splice(r.indexOf(n),1),window.dw&&window.dw.backend&&window.dw.backend.setUserData&&window.dw.backend.setUserData({"gradienteditor-presets":JSON.stringify(r)}),this.set({userPresets:r})}else this.select(n)},saveState:function(){var t=this.get(),e=t.colors,n=t.undoStack;n.push(bi(e)),this.set({undoStack:n})},undo:function(){var t=this.get(),e=t.undoStack,n=t.redoStack,r=t.colors;n.push(bi(r));var i=e.pop();this.set({colors:i,undoStack:e})},redo:function(){var t=this.get(),e=t.colors,n=t.undoStack,r=t.redoStack,i=r.pop();n.push(bi(e)),this.set({colors:i,redoStack:r})},reverse:function(){this.saveState();var t=this.get().colors;t.forEach((function(t){return t.position=1-t.position})),t.reverse(),this.set({colors:t})},contrastUp:function(){this.saveState();var t=this.get(),e=t.colors,n=t.scale,r=t.isMonotone,i=e.length,o=(e=n.padding(-.05).colors(i+2,null))[Math.floor(.5*i)].luminance();[0,i+1].forEach((function(t){var n=e[t].luminance()<o;e[t]=e[t].brighten(n?-.5:.5)})),this.select(e.map((function(t){return t.hex()}))),this.autoCorrect(Math.min(7,i+(r?1:2)))},contrastDown:function(){this.saveState();var t=this.get(),e=t.colors,n=t.scale,r=t.isDiverging,i=e.length;e=n.padding(.03).colors(i,"hex"),this.select(e),this.autoCorrect(Math.max(r?5:2,i-(r?2:1)))},autoCorrect:function(t){t||this.saveState();var e=this.get(),n=e.colors,r=e.scale,i=e.isMonotone,o=e.isDiverging,a=t||n.length;if(2===t)return this.select([n[0].color,n[n.length-1].color]);if(!(a<3)){var s=r.colors(a),l=s.map((function(t){return Kt(t).get("lab.l")}));if(i||o){if(o)for(var c=0;c<.5*a;c++){var u=.5*(l[c]+l[a-1-c]);s[c]=Kt(s[c]).set("lab.l",u).hex(),s[a-1-c]=Kt(s[a-1-c]).set("lab.l",u).hex()}else s=Kt.scale(r.correctLightness()).gamma(l[0]<l[1]?.73:1.3).colors(a,"hex");this.select(s)}}},savePreset:function(){var t=this.get(),e=t.userPresets,n=t.colors;e.push(n),window.dw&&window.dw.backend&&window.dw.backend.setUserData&&window.dw.backend.setUserData({"gradienteditor-presets":JSON.stringify(e)}),this.set({userPresets:e})},swatchClick:function(t,e){var n=this.get(),r=n.dragging,i=n.colorOpen;if(!r)return i?(this.focus(t),this.closePicker()):void this.set({editIndex:e,editColor:t.color,editPosition:t.position,colorOpen:!0})},closePicker:function(){this.set({editIndex:-1,editColor:"",colorOpen:!1,editPosition:0})},dragStart:function(t,e,n){this.saveState();var r=this.refs.gradient.getBoundingClientRect();this.set({dragging:e,wouldDelete:!1,dragStartAt:(new Date).getTime(),dragStartPos:t.clientX,dragStartDelta:e.position-Math.max(0,Math.min(1,(t.clientX-r.left)/r.width))})},handleMouseMove:function(t){var e=this.get(),n=e.dragging,r=e.colors,i=e.dragStartAt,o=e.dragStartPos,a=e.dragStartDelta,s=e.ticks,l=(new Date).getTime()-i,c=Math.abs(o-t.clientX);if(n&&(l>300||c>5)){var u=this.refs.gradient.getBoundingClientRect();n.position=+(a+Math.max(0,Math.min(1,(t.clientX-u.left)/u.width))).toFixed(4);var d=s.sort((function(t,e){return Math.abs(t-n.position)-Math.abs(e-n.position)}))[0];!t.shiftKey&&Math.abs(d-n.position)<.015&&(n.position=d);var f=Math.abs(t.clientY-u.top)>20&&r.length>2;this.set({colors:r,wouldDelete:f})}},handleMouseUp:function(t){var e=this,n=this.get(),r=n.dragging,i=n.wouldDelete,o=n.dragStartPos,a=n.dragStartAt,s=(new Date).getTime()-a,l=Math.abs(o-t.clientX);if(r&&s>300||l>5){setTimeout((function(){e.set({dragging:!1,wouldDelete:!1})})),t.preventDefault();var c=this.get().colors;i&&c.length>2&&(c.splice(c.indexOf(r),1),this.set({colors:c})),this.sortColors()}else this.set({dragging:!1,wouldDelete:!1});this.focus(r)},focus:function(t){var e=this.get().colors.indexOf(t);e>-1&&(this.set({focus:t}),this.refs.swatches.querySelector("a:nth-child(".concat(e+1,") path")).focus())},closeHelp:function(){this.set({gotIt:!0}),window.dw&&window.dw.backend&&window.dw.backend.setUserData&&window.dw.backend.setUserData({"gradienteditor-help":1})},handleGradientClick:function(t){var e=this.get(),n=e.dragging,r=e.scale,i=e.colors;if(!n){var o=this.refs.gradient.getBoundingClientRect(),a=Math.max(0,Math.min(1,(t.clientX-o.left)/o.width)),s=r(a).hex();i.push({color:s,position:a}),this.set({colors:i}),this.sortColors()}},sortColors:function(){var t=this.get().colors.sort((function(t,e){return t.position-e.position}));this.set({colors:t})},handleGradientMouseMove:function(t){var e=this.refs.gradient.getBoundingClientRect();this.set({mouseX:t.clientX-e.left})},handleKeyDown:function(t){var e=this.get(),n=e.focus,r=e.colors,i=e.width;if(!n||37!==t.keyCode&&39!==t.keyCode||(n.position=+(n.position+1/i*(t.shiftKey?10:1)*(37===t.keyCode?-1:1)).toFixed(5),this.set({colors:r})),n&&46===t.keyCode&&r.length>2&&(r.splice(r.indexOf(n),1),this.set({colors:r})),n&&61===t.keyCode){var o=this.get().scale,a=r.indexOf(n);a===r.length-1&&a--;var s=.5*(r[a].position+r[a+1].position),l={position:s,color:o(s).hex()};r.splice(a+1,0,l),this.set({colors:r})}},action:function(t){t.action()}};function Zo(){var t=this;setTimeout((function(){window.dw&&window.dw.backend&&window.dw.backend.__userData&&t.set({gotIt:window.dw.backend.__userData["gradienteditor-help"]||!1,userPresets:JSON.parse(window.dw.backend.__userData["gradienteditor-presets"]||"[]")});var e=t.get(),n=e.presets,r=e.colors;To=t,r.length||t.select(n[0])}))}function ta(t){var e=t.changed,n=t.current;e.editColor&&n.editColor&&(n.colors[n.editIndex].color=n.editColor,this.set({colors:n.colors}))}function ea(t,e,n,r){return t&&(!n||(r[1]>r[0]?r[n]>r[n-1]:r[n]<r[n-1]))}function na(t,e){if(!t.length)return{stops:[]};var n=Kt.scale("string"==typeof t[0]?t:t.map((function(t){return t.color}))).domain("string"==typeof t[0]?[0,10]:t.map((function(t){return 10*t.position}))).mode("lab");return{stops:[0,2,4,5,6,8,10].map((function(t){return{offset:t/10,color:n(t).hex()}})),canDelete:e}}function ra(t){var e=this._svelte,n=e.component,r=e.ctx;n.action(r.item)}function ia(t,e,n){var r=Object.create(t);return r.item=e[n],r}function oa(t,e,n){var r=Object.create(t);return r.group=e[n],r}function aa(t,e,n){var r=Object.create(t);return r.cl=e[n],r}function sa(t,e,n){var r=Object.create(t);return r.value=e[n],r}function la(t){var e=this._svelte,n=e.component,r=e.ctx;n.set({focus:r.c})}function ca(t){t.preventDefault(),t.stopPropagation();var e=this._svelte,n=e.component,r=e.ctx;n.swatchClick(r.c,r.i)}function ua(t){t.preventDefault();var e=this._svelte,n=e.component,r=e.ctx;n.dragStart(t,r.c,r.i)}function da(t,e,n){var r=Object.create(t);return r.c=e[n],r.i=n,r}function fa(t,e,n){var r=Object.create(t);return r.stop=e[n],r}function ha(t,e){var n,r=rt("controls / gradient-editor / help","core"),i=new Gt({root:t.root,store:t.store,slots:{default:x()}});return{c:function(){n=k("div"),i._fragment.c()},m:function(t,e){h(i._slotted.default,n),n.innerHTML=r,i._mount(t,e)},d:function(t){i.destroy(t)}}}function pa(t,e){for(var n,r,i,o,a,s,l,c,u,d,f,m,g,b,_,y={},O=!e.gotIt&&va(t),E=e.stops,S=[],I=0;I<E.length;I+=1)S[I]=ma(t,fa(e,E,I));function L(e){t.handleGradientClick(e)}function P(e){t.handleGradientMouseMove(e)}function R(e){t.set({mouseOverGradient:!0})}function z(e){t.set({mouseOverGradient:!1})}var U=!e.dragging&&e.mouseOverGradient&&ga(t,e),H=e.colors,F=[];for(I=0;I<H.length;I+=1)F[I]=ba(t,da(e,H,I));function $(e){t.set({focus:!1})}var B=e.ticks,q=[];for(I=0;I<B.length;I+=1)q[I]=_a(t,sa(e,B,I));var G=e.classColors,V=[];for(I=0;I<G.length;I+=1)V[I]=ya(t,aa(e,G,I));var W={};void 0!==e.colorOpen&&(W.open=e.colorOpen,y.open=!0),void 0!==e.editColor&&(W.color=e.editColor,y.color=!0);var Y=new ui({root:t.root,store:t.store,slots:{default:x()},data:W,_bind:function(e,n){var r={};!y.open&&e.open&&(r.colorOpen=n.open),!y.color&&e.color&&(r.editColor=n.color),t._set(r),y={}}});t.root._beforecreate.push((function(){Y._bind({open:1,color:1},Y.get())})),Y.on("close",(function(e){t.closePicker()}));var K=Xo,X=[];for(I=0;I<K.length;I+=1)X[I]=xa(t,oa(e,K,I));return{c:function(){n=k("div"),O&&O.c(),r=T("\n    "),i=k("div"),o=N("svg"),a=N("defs"),s=N("linearGradient");for(var t=0;t<S.length;t+=1)S[t].c();l=N("rect"),U&&U.c(),c=N("g");for(t=0;t<F.length;t+=1)F[t].c();u=N("g");for(t=0;t<q.length;t+=1)q[t].c();d=N("g");for(t=0;t<V.length;t+=1)V[t].c();f=T("\n        "),m=k("div"),Y._fragment.c(),g=T("\n    ");for(t=0;t<X.length;t+=1)X[t].c();A(s,"id","grad-main"),A(s,"x2","1"),C(l,"click",L),C(l,"mousemove",P),C(l,"mouseenter",R),C(l,"mouseleave",z),j(l,"fill","url(#grad-main)"),A(l,"width",e.width),A(l,"height","26"),C(c,"focusout",$),A(c,"class","swatches"),A(u,"class","ticks"),A(d,"class","classes"),A(o,"width",e.width),A(o,"height","35"),j(o,"position","relative"),j(o,"top","2px"),A(o,"class","svelte-n52i2y"),j(m,"left",e.editPosition*e.width+"px"),m.className="picker-cont svelte-n52i2y",i.className="preview svelte-n52i2y"},m:function(e,v){p(e,n,v),O&&O.m(n,null),h(n,r),h(n,i),h(i,o),h(o,a),h(a,s);for(var b=0;b<S.length;b+=1)S[b].m(s,null);h(o,l),t.refs.gradient=l,U&&U.m(o,null),h(o,c);for(b=0;b<F.length;b+=1)F[b].m(c,null);t.refs.swatches=c,h(o,u);for(b=0;b<q.length;b+=1)q[b].m(u,null);h(o,d);for(b=0;b<V.length;b+=1)V[b].m(d,null);h(i,f),h(i,m),Y._mount(m,null),h(n,g);for(b=0;b<X.length;b+=1)X[b].m(n,null);_=!0},p:function(i,a){if((e=a).gotIt?O&&(O.d(1),O=null):O||((O=va(t)).c(),O.m(n,r)),i.stops){E=e.stops;for(var f=0;f<E.length;f+=1){var h=fa(e,E,f);S[f]?S[f].p(i,h):(S[f]=ma(t,h),S[f].c(),S[f].m(s,null))}for(;f<S.length;f+=1)S[f].d(1);S.length=E.length}if(_&&!i.width||A(l,"width",e.width),!e.dragging&&e.mouseOverGradient?U?U.p(i,e):((U=ga(t,e)).c(),U.m(o,c)):U&&(U.d(1),U=null),i.colors||i.Math||i.width||i.focus||i.dragging||i.wouldDelete){H=e.colors;for(f=0;f<H.length;f+=1){var p=da(e,H,f);F[f]?F[f].p(i,p):(F[f]=ba(t,p),F[f].c(),F[f].m(c,null))}for(;f<F.length;f+=1)F[f].d(1);F.length=H.length}if(i.Math||i.width||i.ticks){B=e.ticks;for(f=0;f<B.length;f+=1){var v=sa(e,B,f);q[f]?q[f].p(i,v):(q[f]=_a(t,v),q[f].c(),q[f].m(u,null))}for(;f<q.length;f+=1)q[f].d(1);q.length=B.length}if(i.classColors||i.Math||i.width){G=e.classColors;for(f=0;f<G.length;f+=1){var g=aa(e,G,f);V[f]?V[f].p(i,g):(V[f]=ya(t,g),V[f].c(),V[f].m(d,null))}for(;f<V.length;f+=1)V[f].d(1);V.length=G.length}_&&!i.width||A(o,"width",e.width);var b={};if(!y.open&&i.colorOpen&&(b.open=e.colorOpen,y.open=void 0!==e.colorOpen),!y.color&&i.editColor&&(b.color=e.editColor,y.color=void 0!==e.editColor),Y._set(b),y={},(!_||i.editPosition||i.width)&&j(m,"left",e.editPosition*e.width+"px"),i.undoStack||i.redoStack||i.lightnessFixable){K=Xo;for(f=0;f<K.length;f+=1){var w=oa(e,K,f);X[f]?X[f].p(i,w):(X[f]=xa(t,w),X[f].c(),X[f].m(n,null))}for(;f<X.length;f+=1)X[f].d(1);X.length=K.length}},i:function(e,r){_||(t.root._intro&&(b&&b.invalidate(),t.root._aftercreate.push((function(){b||(b=D(t,n,$t,{},!0)),b.run(1)}))),this.m(e,r))},o:function(e){_&&(b||(b=D(t,n,$t,{},!1)),b.run(0,(function(){e(),b=null})),_=!1)},d:function(e){e&&v(n),O&&O.d(),w(S,e),M(l,"click",L),M(l,"mousemove",P),M(l,"mouseenter",R),M(l,"mouseleave",z),t.refs.gradient===l&&(t.refs.gradient=null),U&&U.d(),w(F,e),M(c,"focusout",$),t.refs.swatches===c&&(t.refs.swatches=null),w(q,e),w(V,e),Y.destroy(),w(X,e),e&&b&&b.abort()}}}function va(t,e){var n,r,i,o,a,s,l,c,u,d,f,m=rt("controls / gradient-editor / how-this-works","core"),g=rt("controls / gradient-editor / help","core"),b=rt("controls / gradient-editor / got-it","core");function _(e){e.preventDefault(),t.closeHelp()}return{c:function(){n=k("p"),r=k("b"),i=T(m),o=T(" "),a=k("noscript"),s=k("noscript"),l=T("\n        "),c=k("a"),u=k("i"),d=T(" "),f=T(b),u.className="fa fa-check",C(c,"click",_),c.href="#/closeHelp",j(n,"min-height","3em"),j(n,"margin-bottom","20px"),n.className="mini-help"},m:function(t,e){p(t,n,e),h(n,r),h(r,i),h(n,o),h(n,a),a.insertAdjacentHTML("afterend",g),h(n,s),h(n,l),h(n,c),h(c,u),h(c,d),h(c,f)},d:function(t){t&&v(n),M(c,"click",_)}}}function ma(t,e){var n,r,i;return{c:function(){A(n=N("stop"),"offset",r=(100*e.stop.offset).toFixed(2)+"%"),A(n,"stop-color",i=e.stop.color)},m:function(t,e){p(t,n,e)},p:function(t,e){t.stops&&r!==(r=(100*e.stop.offset).toFixed(2)+"%")&&A(n,"offset",r),t.stops&&i!==(i=e.stop.color)&&A(n,"stop-color",i)},d:function(t){t&&v(n)}}}function ga(t,e){var n,r,i,o,a;return{c:function(){n=N("g"),r=N("path"),i=N("text"),o=T("+"),A(r,"d","M-7,3 l7,7 l7,-7 v-12 h-14Z"),A(r,"class","svelte-n52i2y"),A(i,"y","4"),A(i,"class","svelte-n52i2y"),A(n,"class","line svelte-n52i2y"),A(n,"transform",a="translate("+(e.Math.round(e.mouseX)+.5)+",0)")},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(i,o)},p:function(t,e){(t.Math||t.mouseX)&&a!==(a="translate("+(e.Math.round(e.mouseX)+.5)+",0)")&&A(n,"transform",a)},d:function(t){t&&v(n)}}}function ba(t,e){var n,r,i;return{c:function(){var o,a,s;n=N("a"),(r=N("path"))._svelte={component:t,ctx:e},C(r,"mousedown",ua),C(r,"click",ca),A(r,"class","swatch svelte-n52i2y"),A(r,"tabindex",e.i+1),A(r,"d","M-7,3 l7,7 l7,-7 v-12 h-14Z"),A(r,"transform",i="translate("+(e.Math.round(e.width*e.c.position)+.5)+",0)"),j(r,"fill",e.c.color),j(r,"stroke",Kt(e.c.color).darken().hex()),P(r,"focus",e.focus===e.c),P(r,"delete",e.c===e.dragging&&e.wouldDelete),n._svelte={component:t,ctx:e},C(n,"focusin",la),o=n,a="xlink:href",s="#/color/"+e.i,o.setAttributeNS("http://www.w3.org/1999/xlink",a,s),A(n,"draggable",!1)},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,o){e=o,r._svelte.ctx=e,(t.Math||t.width||t.colors)&&i!==(i="translate("+(e.Math.round(e.width*e.c.position)+.5)+",0)")&&A(r,"transform",i),t.colors&&(j(r,"fill",e.c.color),j(r,"stroke",Kt(e.c.color).darken().hex())),(t.focus||t.colors)&&P(r,"focus",e.focus===e.c),(t.colors||t.dragging||t.wouldDelete)&&P(r,"delete",e.c===e.dragging&&e.wouldDelete),n._svelte.ctx=e},d:function(t){t&&v(n),M(r,"mousedown",ua),M(r,"click",ca),M(n,"focusin",la)}}}function _a(t,e){var n,r;return{c:function(){A(n=N("path"),"class","tick svelte-n52i2y"),A(n,"d","M0,26v4"),A(n,"transform",r="translate("+e.Math.round(e.width*e.value)+",0)")},m:function(t,e){p(t,n,e)},p:function(t,e){(t.Math||t.width||t.ticks)&&r!==(r="translate("+e.Math.round(e.width*e.value)+",0)")&&A(n,"transform",r)},d:function(t){t&&v(n)}}}function ya(t,e){var n,r;return{c:function(){A(n=N("circle"),"r","3"),j(n,"fill",e.cl.color),j(n,"stroke",Kt(e.cl.color).darken().hex()),A(n,"transform",r="translate("+(e.Math.round(e.width*e.cl.position)+.5)+",26)")},m:function(t,e){p(t,n,e)},p:function(t,e){t.classColors&&(j(n,"fill",e.cl.color),j(n,"stroke",Kt(e.cl.color).darken().hex())),(t.Math||t.width||t.classColors)&&r!==(r="translate("+(e.Math.round(e.width*e.cl.position)+.5)+",26)")&&A(n,"transform",r)},d:function(t){t&&v(n)}}}function wa(t,e){var n,r,i,o,a,s=e.item.icon,l=e.item.label;return{c:function(){n=k("button"),r=k("noscript"),i=T("\n            "),(o=k("div")).className="btn-help svelte-n52i2y",n._svelte={component:t,ctx:e},C(n,"click",ra),n.disabled=a=Jo(e.item,{undoStack:e.undoStack,redoStack:e.redoStack,lightnessFixable:e.lightnessFixable}),n.className="btn btn-small svelte-n52i2y"},m:function(t,e){p(t,n,e),h(n,r),r.insertAdjacentHTML("beforebegin",s),h(n,i),h(n,o),o.innerHTML=l},p:function(t,r){e=r,n._svelte.ctx=e,(t.undoStack||t.redoStack||t.lightnessFixable)&&a!==(a=Jo(e.item,{undoStack:e.undoStack,redoStack:e.redoStack,lightnessFixable:e.lightnessFixable}))&&(n.disabled=a)},d:function(t){t&&v(n),M(n,"click",ra)}}}function xa(t,e){for(var n,r,i=e.group,o=[],a=0;a<i.length;a+=1)o[a]=wa(t,ia(e,i,a));return{c:function(){n=k("div");for(var t=0;t<o.length;t+=1)o[t].c();r=T("\n    "),n.className="btn-group svelte-n52i2y",j(n,"margin-top","5px"),j(n,"margin-bottom","15px")},m:function(t,e){p(t,n,e);for(var i=0;i<o.length;i+=1)o[i].m(n,null);h(n,r)},p:function(e,a){if(e.undoStack||e.redoStack||e.lightnessFixable){i=a.group;for(var s=0;s<i.length;s+=1){var l=ia(a,i,s);o[s]?o[s].p(e,l):(o[s]=wa(t,l),o[s].c(),o[s].m(n,r))}for(;s<o.length;s+=1)o[s].d(1);o.length=i.length}},d:function(t){t&&v(n),w(o,t)}}}function ka(t){var e=this;X(this,t),this.refs={},this._state=u(u({Math:Math},{label:"",colors:[],width:318,classes:0,themePresets:[],userPresets:[],editIndex:-1,editColor:"",customize:!1,editPosition:0,colorOpen:!1,help:"",wouldDelete:!1,dragging:!1,dragStartAt:0,gotIt:!1,focus:!1,mouseOverGradient:!1,mouseX:0,undoStack:[],redoStack:[]}),t.data),this._recompute({themePresets:1,userPresets:1,colors:1,dragging:1,wouldDelete:1,activeColors:1,scale:1,stops:1,presets:1,classes:1,isMonotone:1,isDiverging:1},this._state),this._intro=!0,this._handlers.state=[ta],ta.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n,r,i,o,a,s,l,c;function u(e){t.handleKeyDown(e)}function d(e){t.handleMouseMove(e)}function f(e){t.handleMouseUp(e)}window.addEventListener("keydown",u),window.addEventListener("mousemove",d),window.addEventListener("mouseup",f);var m=e.gotIt&&ha(t),g={passEvent:!0,label:e.label,itemRenderer:Wo,forceLabel:e.selectedPreset,options:e.presetOptions,placeholder:rt("controls / gradient-editor / preset / placeholder","core"),width:"100px"},b=new ao({root:t.root,store:t.store,slots:{default:x()},data:g});function _(n){t.set({customize:!e.customize})}b.on("change",(function(e){t.handleChange(e)}));var y=e.customize&&pa(t,e);return{c:function(){n=k("div"),m&&m.c(),r=T("\n    "),i=k("div"),o=k("div"),b._fragment.c(),a=T("\n        "),(s=k("button")).innerHTML='<i class="fa fa-wrench fa-fw"></i>',l=T("\n"),y&&y.c(),c=O(),j(o,"display","inline-block"),o.className="svelte-n52i2y svelte-ref-gradientdropdown",C(s,"click",_),s.title="Customize",s.className="btn",P(s,"active",e.customize),j(i,"white-space","nowrap")},m:function(e,u){p(e,n,u),m&&m.m(n,null),h(n,r),h(n,i),h(i,o),b._mount(o,null),t.refs.gradientdropdown=o,h(i,a),h(i,s),p(e,l,u),y&&y.i(e,u),p(e,c,u)},p:function(i,o){(e=o).gotIt?m||((m=ha(t)).c(),m.m(n,r)):m&&(m.d(1),m=null);var a={};i.label&&(a.label=e.label),i.selectedPreset&&(a.forceLabel=e.selectedPreset),i.presetOptions&&(a.options=e.presetOptions),b._set(a),i.customize&&P(s,"active",e.customize),e.customize?(y?y.p(i,e):(y=pa(t,e))&&y.c(),y.i(c.parentNode,c)):y&&(U(),y.o((function(){y.d(1),y=null})))},d:function(e){window.removeEventListener("keydown",u),window.removeEventListener("mousemove",d),window.removeEventListener("mouseup",f),e&&v(n),m&&m.d(),b.destroy(),t.refs.gradientdropdown===o&&(t.refs.gradientdropdown=null),M(s,"click",_),e&&v(l),y&&y.d(e),e&&v(c)}}}(this,this._state),this.root._oncreate.push((function(){Zo.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function Na(){}u(ka.prototype,tt),u(ka.prototype,Qo),ka.prototype._recompute=function(t,e){var n,r,i,o,a,s,l;(t.themePresets||t.userPresets)&&this._differs(e.presets,e.presets=(r=(n=e).themePresets,i=n.userPresets,r.concat(i)))&&(t.presets=!0),(t.colors||t.dragging||t.wouldDelete)&&this._differs(e.activeColors,e.activeColors=(a=(o=e).colors,s=o.dragging,l=o.wouldDelete,a.filter((function(t){return!l||s!==t})).sort((function(t,e){return t.position-e.position}))))&&(t.activeColors=!0),t.activeColors&&this._differs(e.scale,e.scale=function(t){var e=t.activeColors.slice(0);return e.length&&(e[0].position>0&&e.unshift({position:0,color:e[0].color}),e[e.length-1].position<1&&e.push({position:1,color:e[e.length-1].color})),Kt.scale(e.map((function(t){return t.color}))).domain(e.map((function(t){return t.position})))}(e))&&(t.scale=!0),t.scale&&this._differs(e.stops,e.stops=e.scale.colors(80,"hex").map((function(t,e){return{color:t,offset:e/79}})))&&(t.stops=!0),t.stops&&this._differs(e.selectedPreset,e.selectedPreset=function(t){var e=t.stops.map((function(t){return t.color}));return Ko({value:e},na(e))}(e))&&(t.selectedPreset=!0),(t.presets||t.themePresets)&&this._differs(e.presetOptions,e.presetOptions=function(t){var e=t.presets,n=t.themePresets;return e.map((function(t,e){return Ko({value:t},na(t,e>=n.length))}))}(e))&&(t.presetOptions=!0),t.colors&&this._differs(e.ticks,e.ticks=function(t){var e=t.colors;return e.map((function(t,n){return n/(e.length-1)}))}(e))&&(t.ticks=!0),(t.scale||t.colors||t.classes)&&this._differs(e.classColors,e.classColors=function(t){var e=t.scale,n=t.colors,r=t.classes;if(!r||!n.length)return[];for(var i=[],o=0;o<r;o++)i.push({position:o/(r-1),color:e(o/(r-1)).hex()});return i}(e))&&(t.classColors=!0),(t.colors||t.scale)&&(this._differs(e.isMonotone,e.isMonotone=function(t){var e=t.colors,n=t.scale;return e.length<3||n.colors(e.length,null).map((function(t){return t.get("lab.l")})).reduce(ea,!0)}(e))&&(t.isMonotone=!0),this._differs(e.isDiverging,e.isDiverging=function(t){var e=t.colors,n=t.scale,r=e.length;if(r<3)return!1;var i=n.colors(e.length,null).map((function(t){return t.get("lab.l")}));return!i.reduce(ea,!0)&&(i.slice(0,Math.ceil(.5*r)).reduce(ea,!0)&&i.slice(Math.floor(.5*r)).reduce(ea,!0))}(e))&&(t.isDiverging=!0)),(t.isMonotone||t.isDiverging)&&this._differs(e.lightnessFixable,e.lightnessFixable=function(t){var e=t.isMonotone,n=t.isDiverging;return e||n}(e))&&(t.lightnessFixable=!0)},u(function(t){var e,n,r,i,o,a,s,l,c=this;X(this,t),this._state=u({id:!1},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,l=e._slotted.default,{c:function(){r=k("div"),i=k("label"),o=T("\n\n    "),a=k("div"),l||(s=T("content")),i.className="group-title svelte-1jas918",a.className="option-group-content vis-option-type-chart-description",r.className="vis-option-type-group svelte-group group-open svelte-1jas918"},m:function(t,e){p(t,r,e),h(r,i),i.innerHTML=n.label,h(r,o),h(r,a),h(a,l||s)},p:function(t,e){t.label&&(i.innerHTML=e.label)},d:function(t){t&&v(r),l&&b(a,l)}}),this.root._oncreate.push((function(){Na.call(c),c.fire("update",{changed:d({},c._state),current:c._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}.prototype,tt);var Ta="object"==("undefined"==typeof global?"undefined":n(global))&&global&&global.Object===Object&&global,Oa="object"==("undefined"==typeof self?"undefined":n(self))&&self&&self.Object===Object&&self,Ca=Ta||Oa||Function("return this")(),Ma=Ca.Symbol,Aa=Object.prototype,Ea=Aa.hasOwnProperty,Sa=Aa.toString,ja=Ma?Ma.toStringTag:void 0;var Ia=Object.prototype.toString;var La=Ma?Ma.toStringTag:void 0;function Pa(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":La&&La in Object(t)?function(t){var e=Ea.call(t,ja),n=t[ja];try{t[ja]=void 0;var r=!0}catch(t){}var i=Sa.call(t);return r&&(e?t[ja]=n:delete t[ja]),i}(t):function(t){return Ia.call(t)}(t)}function Ra(t){return null!=t&&"object"==n(t)}function Da(t){return"symbol"==n(t)||Ra(t)&&"[object Symbol]"==Pa(t)}var za=Array.isArray,Ua=Ma?Ma.prototype:void 0,Ha=Ua?Ua.toString:void 0;function Fa(t){if("string"==typeof t)return t;if(za(t))return function(t,e){for(var n=-1,r=null==t?0:t.length,i=Array(r);++n<r;)i[n]=e(t[n],n,t);return i}(t,Fa)+"";if(Da(t))return Ha?Ha.call(t):"";var e=t+"";return"0"==e&&1/t==-1/0?"-0":e}function $a(t){var e=n(t);return null!=t&&("object"==e||"function"==e)}function Ba(t){return t}function qa(t){if(!$a(t))return!1;var e=Pa(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e}var Ga,Va=Ca["__core-js_shared__"],Wa=(Ga=/[^.]+$/.exec(Va&&Va.keys&&Va.keys.IE_PROTO||""))?"Symbol(src)_1."+Ga:"";var Ya=Function.prototype.toString;function Ka(t){if(null!=t){try{return Ya.call(t)}catch(t){}try{return t+""}catch(t){}}return""}var Xa=/^\[object .+?Constructor\]$/,Ja=Function.prototype,Qa=Object.prototype,Za=Ja.toString,ts=Qa.hasOwnProperty,es=RegExp("^"+Za.call(ts).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function ns(t){return!(!$a(t)||(e=t,Wa&&Wa in e))&&(qa(t)?es:Xa).test(Ka(t));var e}function rs(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return ns(n)?n:void 0}var is=rs(Ca,"WeakMap"),os=function(){try{var t=rs(Object,"defineProperty");return t({},"",{}),t}catch(t){}}(),as=/^(?:0|[1-9]\d*)$/;function ss(t,e){var r=n(t);return!!(e=null==e?9007199254740991:e)&&("number"==r||"symbol"!=r&&as.test(t))&&t>-1&&t%1==0&&t<e}function ls(t,e){return t===e||t!=t&&e!=e}function cs(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991}function us(t){return null!=t&&cs(t.length)&&!qa(t)}var ds=Object.prototype;function fs(t){return Ra(t)&&"[object Arguments]"==Pa(t)}var hs=Object.prototype,ps=hs.hasOwnProperty,vs=hs.propertyIsEnumerable,ms=fs(function(){return arguments}())?fs:function(t){return Ra(t)&&ps.call(t,"callee")&&!vs.call(t,"callee")};var gs="object"==("undefined"==typeof exports?"undefined":n(exports))&&exports&&!exports.nodeType&&exports,bs=gs&&"object"==("undefined"==typeof module?"undefined":n(module))&&module&&!module.nodeType&&module,_s=bs&&bs.exports===gs?Ca.Buffer:void 0,ys=(_s?_s.isBuffer:void 0)||function(){return!1},ws={};ws["[object Float32Array]"]=ws["[object Float64Array]"]=ws["[object Int8Array]"]=ws["[object Int16Array]"]=ws["[object Int32Array]"]=ws["[object Uint8Array]"]=ws["[object Uint8ClampedArray]"]=ws["[object Uint16Array]"]=ws["[object Uint32Array]"]=!0,ws["[object Arguments]"]=ws["[object Array]"]=ws["[object ArrayBuffer]"]=ws["[object Boolean]"]=ws["[object DataView]"]=ws["[object Date]"]=ws["[object Error]"]=ws["[object Function]"]=ws["[object Map]"]=ws["[object Number]"]=ws["[object Object]"]=ws["[object RegExp]"]=ws["[object Set]"]=ws["[object String]"]=ws["[object WeakMap]"]=!1;var xs,ks="object"==("undefined"==typeof exports?"undefined":n(exports))&&exports&&!exports.nodeType&&exports,Ns=ks&&"object"==("undefined"==typeof module?"undefined":n(module))&&module&&!module.nodeType&&module,Ts=Ns&&Ns.exports===ks&&Ta.process,Os=function(){try{var t=Ns&&Ns.require&&Ns.require("util").types;return t||Ts&&Ts.binding&&Ts.binding("util")}catch(t){}}(),Cs=Os&&Os.isTypedArray,Ms=Cs?(xs=Cs,function(t){return xs(t)}):function(t){return Ra(t)&&cs(t.length)&&!!ws[Pa(t)]},As=Object.prototype.hasOwnProperty;function Es(t,e){var n=za(t),r=!n&&ms(t),i=!n&&!r&&ys(t),o=!n&&!r&&!i&&Ms(t),a=n||r||i||o,s=a?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],l=s.length;for(var c in t)!e&&!As.call(t,c)||a&&("length"==c||i&&("offset"==c||"parent"==c)||o&&("buffer"==c||"byteLength"==c||"byteOffset"==c)||ss(c,l))||s.push(c);return s}var Ss=function(t,e){return function(n){return t(e(n))}}(Object.keys,Object),js=Object.prototype.hasOwnProperty;function Is(t){if(n=(e=t)&&e.constructor,e!==("function"==typeof n&&n.prototype||ds))return Ss(t);var e,n,r=[];for(var i in Object(t))js.call(t,i)&&"constructor"!=i&&r.push(i);return r}function Ls(t){return us(t)?Es(t):Is(t)}var Ps=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Rs=/^\w*$/;function Ds(t,e){if(za(t))return!1;var r=n(t);return!("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!Da(t))||(Rs.test(t)||!Ps.test(t)||null!=e&&t in Object(e))}var zs=rs(Object,"create");var Us=Object.prototype.hasOwnProperty;var Hs=Object.prototype.hasOwnProperty;function Fs(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function $s(t,e){for(var n=t.length;n--;)if(ls(t[n][0],e))return n;return-1}Fs.prototype.clear=function(){this.__data__=zs?zs(null):{},this.size=0},Fs.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},Fs.prototype.get=function(t){var e=this.__data__;if(zs){var n=e[t];return"__lodash_hash_undefined__"===n?void 0:n}return Us.call(e,t)?e[t]:void 0},Fs.prototype.has=function(t){var e=this.__data__;return zs?void 0!==e[t]:Hs.call(e,t)},Fs.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=zs&&void 0===e?"__lodash_hash_undefined__":e,this};var Bs=Array.prototype.splice;function qs(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}qs.prototype.clear=function(){this.__data__=[],this.size=0},qs.prototype.delete=function(t){var e=this.__data__,n=$s(e,t);return!(n<0)&&(n==e.length-1?e.pop():Bs.call(e,n,1),--this.size,!0)},qs.prototype.get=function(t){var e=this.__data__,n=$s(e,t);return n<0?void 0:e[n][1]},qs.prototype.has=function(t){return $s(this.__data__,t)>-1},qs.prototype.set=function(t,e){var n=this.__data__,r=$s(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this};var Gs=rs(Ca,"Map");function Vs(t,e){var r,i,o=t.__data__;return("string"==(i=n(r=e))||"number"==i||"symbol"==i||"boolean"==i?"__proto__"!==r:null===r)?o["string"==typeof e?"string":"hash"]:o.map}function Ws(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}Ws.prototype.clear=function(){this.size=0,this.__data__={hash:new Fs,map:new(Gs||qs),string:new Fs}},Ws.prototype.delete=function(t){var e=Vs(this,t).delete(t);return this.size-=e?1:0,e},Ws.prototype.get=function(t){return Vs(this,t).get(t)},Ws.prototype.has=function(t){return Vs(this,t).has(t)},Ws.prototype.set=function(t,e){var n=Vs(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this};function Ys(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError("Expected a function");var n=function n(){var r=arguments,i=e?e.apply(this,r):r[0],o=n.cache;if(o.has(i))return o.get(i);var a=t.apply(this,r);return n.cache=o.set(i,a)||o,a};return n.cache=new(Ys.Cache||Ws),n}Ys.Cache=Ws;var Ks=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Xs=/\\(\\)?/g,Js=function(t){var e=Ys(t,(function(t){return 500===n.size&&n.clear(),t})),n=e.cache;return e}((function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(Ks,(function(t,n,r,i){e.push(r?i.replace(Xs,"$1"):n||t)})),e}));function Qs(t,e){return za(t)?t:Ds(t,e)?[t]:Js(function(t){return null==t?"":Fa(t)}(t))}function Zs(t){if("string"==typeof t||Da(t))return t;var e=t+"";return"0"==e&&1/t==-1/0?"-0":e}function tl(t,e){for(var n=0,r=(e=Qs(e,t)).length;null!=t&&n<r;)t=t[Zs(e[n++])];return n&&n==r?t:void 0}function el(t){var e=this.__data__=new qs(t);this.size=e.size}el.prototype.clear=function(){this.__data__=new qs,this.size=0},el.prototype.delete=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n},el.prototype.get=function(t){return this.__data__.get(t)},el.prototype.has=function(t){return this.__data__.has(t)},el.prototype.set=function(t,e){var n=this.__data__;if(n instanceof qs){var r=n.__data__;if(!Gs||r.length<199)return r.push([t,e]),this.size=++n.size,this;n=this.__data__=new Ws(r)}return n.set(t,e),this.size=n.size,this};var nl=Object.prototype.propertyIsEnumerable,rl=Object.getOwnPropertySymbols,il=rl?function(t){return null==t?[]:(t=Object(t),function(t,e){for(var n=-1,r=null==t?0:t.length,i=0,o=[];++n<r;){var a=t[n];e(a,n,t)&&(o[i++]=a)}return o}(rl(t),(function(e){return nl.call(t,e)})))}:function(){return[]};function ol(t){return function(t,e,n){var r=e(t);return za(t)?r:function(t,e){for(var n=-1,r=e.length,i=t.length;++n<r;)t[i+n]=e[n];return t}(r,n(t))}(t,Ls,il)}var al=rs(Ca,"DataView"),sl=rs(Ca,"Promise"),ll=rs(Ca,"Set"),cl=Ka(al),ul=Ka(Gs),dl=Ka(sl),fl=Ka(ll),hl=Ka(is),pl=Pa;(al&&"[object DataView]"!=pl(new al(new ArrayBuffer(1)))||Gs&&"[object Map]"!=pl(new Gs)||sl&&"[object Promise]"!=pl(sl.resolve())||ll&&"[object Set]"!=pl(new ll)||is&&"[object WeakMap]"!=pl(new is))&&(pl=function(t){var e=Pa(t),n="[object Object]"==e?t.constructor:void 0,r=n?Ka(n):"";if(r)switch(r){case cl:return"[object DataView]";case ul:return"[object Map]";case dl:return"[object Promise]";case fl:return"[object Set]";case hl:return"[object WeakMap]"}return e});var vl=pl,ml=Ca.Uint8Array;function gl(t){var e=-1,n=null==t?0:t.length;for(this.__data__=new Ws;++e<n;)this.add(t[e])}function bl(t,e){for(var n=-1,r=null==t?0:t.length;++n<r;)if(e(t[n],n,t))return!0;return!1}function _l(t,e){return t.has(e)}gl.prototype.add=gl.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},gl.prototype.has=function(t){return this.__data__.has(t)};function yl(t,e,n,r,i,o){var a=1&n,s=t.length,l=e.length;if(s!=l&&!(a&&l>s))return!1;var c=o.get(t);if(c&&o.get(e))return c==e;var u=-1,d=!0,f=2&n?new gl:void 0;for(o.set(t,e),o.set(e,t);++u<s;){var h=t[u],p=e[u];if(r)var v=a?r(p,h,u,e,t,o):r(h,p,u,t,e,o);if(void 0!==v){if(v)continue;d=!1;break}if(f){if(!bl(e,(function(t,e){if(!_l(f,e)&&(h===t||i(h,t,n,r,o)))return f.push(e)}))){d=!1;break}}else if(h!==p&&!i(h,p,n,r,o)){d=!1;break}}return o.delete(t),o.delete(e),d}function wl(t){var e=-1,n=Array(t.size);return t.forEach((function(t,r){n[++e]=[r,t]})),n}function xl(t){var e=-1,n=Array(t.size);return t.forEach((function(t){n[++e]=t})),n}var kl=Ma?Ma.prototype:void 0,Nl=kl?kl.valueOf:void 0;var Tl=Object.prototype.hasOwnProperty;var Ol=Object.prototype.hasOwnProperty;function Cl(t,e,n,r,i,o){var a=za(t),s=za(e),l=a?"[object Array]":vl(t),c=s?"[object Array]":vl(e),u="[object Object]"==(l="[object Arguments]"==l?"[object Object]":l),d="[object Object]"==(c="[object Arguments]"==c?"[object Object]":c),f=l==c;if(f&&ys(t)){if(!ys(e))return!1;a=!0,u=!1}if(f&&!u)return o||(o=new el),a||Ms(t)?yl(t,e,n,r,i,o):function(t,e,n,r,i,o,a){switch(n){case"[object DataView]":if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case"[object ArrayBuffer]":return!(t.byteLength!=e.byteLength||!o(new ml(t),new ml(e)));case"[object Boolean]":case"[object Date]":case"[object Number]":return ls(+t,+e);case"[object Error]":return t.name==e.name&&t.message==e.message;case"[object RegExp]":case"[object String]":return t==e+"";case"[object Map]":var s=wl;case"[object Set]":var l=1&r;if(s||(s=xl),t.size!=e.size&&!l)return!1;var c=a.get(t);if(c)return c==e;r|=2,a.set(t,e);var u=yl(s(t),s(e),r,i,o,a);return a.delete(t),u;case"[object Symbol]":if(Nl)return Nl.call(t)==Nl.call(e)}return!1}(t,e,l,n,r,i,o);if(!(1&n)){var h=u&&Ol.call(t,"__wrapped__"),p=d&&Ol.call(e,"__wrapped__");if(h||p){var v=h?t.value():t,m=p?e.value():e;return o||(o=new el),i(v,m,n,r,o)}}return!!f&&(o||(o=new el),function(t,e,n,r,i,o){var a=1&n,s=ol(t),l=s.length;if(l!=ol(e).length&&!a)return!1;for(var c=l;c--;){var u=s[c];if(!(a?u in e:Tl.call(e,u)))return!1}var d=o.get(t);if(d&&o.get(e))return d==e;var f=!0;o.set(t,e),o.set(e,t);for(var h=a;++c<l;){var p=t[u=s[c]],v=e[u];if(r)var m=a?r(v,p,u,e,t,o):r(p,v,u,t,e,o);if(!(void 0===m?p===v||i(p,v,n,r,o):m)){f=!1;break}h||(h="constructor"==u)}if(f&&!h){var g=t.constructor,b=e.constructor;g!=b&&"constructor"in t&&"constructor"in e&&!("function"==typeof g&&g instanceof g&&"function"==typeof b&&b instanceof b)&&(f=!1)}return o.delete(t),o.delete(e),f}(t,e,n,r,i,o))}function Ml(t,e,n,r,i){return t===e||(null==t||null==e||!Ra(t)&&!Ra(e)?t!=t&&e!=e:Cl(t,e,n,r,Ml,i))}function Al(t){return t==t&&!$a(t)}function El(t,e){return function(n){return null!=n&&(n[t]===e&&(void 0!==e||t in Object(n)))}}function Sl(t){var e=function(t){for(var e=Ls(t),n=e.length;n--;){var r=e[n],i=t[r];e[n]=[r,i,Al(i)]}return e}(t);return 1==e.length&&e[0][2]?El(e[0][0],e[0][1]):function(n){return n===t||function(t,e,n,r){var i=n.length,o=i,a=!r;if(null==t)return!o;for(t=Object(t);i--;){var s=n[i];if(a&&s[2]?s[1]!==t[s[0]]:!(s[0]in t))return!1}for(;++i<o;){var l=(s=n[i])[0],c=t[l],u=s[1];if(a&&s[2]){if(void 0===c&&!(l in t))return!1}else{var d=new el;if(r)var f=r(c,u,l,t,e,d);if(!(void 0===f?Ml(u,c,3,r,d):f))return!1}}return!0}(n,t,e)}}function jl(t,e){return null!=t&&e in Object(t)}function Il(t,e){return null!=t&&function(t,e,n){for(var r=-1,i=(e=Qs(e,t)).length,o=!1;++r<i;){var a=Zs(e[r]);if(!(o=null!=t&&n(t,a)))break;t=t[a]}return o||++r!=i?o:!!(i=null==t?0:t.length)&&cs(i)&&ss(a,i)&&(za(t)||ms(t))}(t,e,jl)}function Ll(t,e){return Ds(t)&&Al(e)?El(Zs(t),e):function(n){var r=function(t,e,n){var r=null==t?void 0:tl(t,e);return void 0===r?n:r}(n,t);return void 0===r&&r===e?Il(n,t):Ml(e,r,3)}}function Pl(t){return Ds(t)?(e=Zs(t),function(t){return null==t?void 0:t[e]}):function(t){return function(e){return tl(e,t)}}(t);var e}function Rl(t,e,n,r){for(var i=-1,o=null==t?0:t.length;++i<o;){var a=t[i];e(r,a,n(a),t)}return r}var Dl,zl=function(t,e,n){for(var r=-1,i=Object(t),o=n(t),a=o.length;a--;){var s=o[Dl?a:++r];if(!1===e(i[s],s,i))break}return t};var Ul=function(t,e){return function(n,r){if(null==n)return n;if(!us(n))return t(n,r);for(var i=n.length,o=e?i:-1,a=Object(n);(e?o--:++o<i)&&!1!==r(a[o],o,a););return n}}((function(t,e){return t&&zl(t,e,Ls)}));function Hl(t,e,n,r){return Ul(t,(function(t,i,o){e(r,t,n(t),o)})),r}var Fl,$l,Bl=(Fl=function(t,e,n){!function(t,e,n){"__proto__"==e&&os?os(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n}(t,n,e)},function(t,e){var r,i=za(t)?Rl:Hl,o=$l?$l():{};return i(t,Fl,"function"==typeof(r=e)?r:null==r?Ba:"object"==n(r)?za(r)?Ll(r[0],r[1]):Sl(r):Pl(r),o)});var ql={add:function(t){var e=this,n=this.get().highlighted;n.indexOf(t)<0&&((n=bi(n)).push(t),this.set({highlighted:n}),this.update(),setTimeout((function(){return e.set({selected:"---"})}),30))},remove:function(t){var e=this.get().highlighted;e.splice(e.indexOf(t),1),this.set({highlighted:e}),this.update()},update:function(){var t=this.get(),e=t.$vis,n=t.highlighted;e&&(JSON.stringify(e.get("highlighted-series"))!==JSON.stringify(n)&&e.chart().set("metadata.visualize.highlighted-series",bi(n)))}};function Gl(t){var e=this,n=t.changed,r=t.current;t.previous;n.$vis&&r.$vis&&(this.set({highlighted:bi(r.$vis.get("highlighted-series"))}),r.$vis.chart().onChange((function(t,n){"metadata.visualize.highlighted-series"===n&&e.set({highlighted:bi(r.$vis.get("highlighted-series"))})}))),n.selected&&r.selected&&"---"!==r.selected&&this.add(r.selected)}function Vl(t){var e=this._svelte,n=e.component,r=e.ctx;n.remove(r.el.key)}function Wl(t,e,n){var r=Object.create(t);return r.el=e[n],r}function Yl(t,e){var n,r,i,o,a,s,l=e.el.key;return{c:function(){n=k("li"),r=T(l),i=T("\n            "),o=k("button"),a=T("\n        "),o._svelte={component:t,ctx:e},C(o,"click",Vl),A(o,"aria-label","Remove"),o.className="fa fa-remove remove-highlight svelte-u6xm45",n.className=s="badge "+(e.el.valid?"badge-info":"")+" svelte-u6xm45"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o),h(n,a)},p:function(t,i){e=i,t.highlightedElements&&l!==(l=e.el.key)&&S(r,l),o._svelte.ctx=e,t.highlightedElements&&s!==(s="badge "+(e.el.valid?"badge-info":"")+" svelte-u6xm45")&&(n.className=s)},d:function(t){t&&v(n),M(o,"click",Vl)}}}function Kl(t){var e=this;X(this,t),this._state=u(u(this.store._init(["vis"]),{selected:"---",highlighted:[]}),t.data),this.store._add(this,["vis"]),this._recompute({$vis:1,elements:1,highlighted:1},this._state),this._intro=!0,this._handlers.state=[Gl],this._handlers.destroy=[Z],Gl.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n,r,i,o,a,s,l=rt("Highlight the most import elements (optional)"),c={},u={options:e.options,width:"100%"};void 0!==e.selected&&(u.value=e.selected,c.value=!0);var d=new qi({root:t.root,store:t.store,data:u,_bind:function(e,n){var r={};!c.value&&e.value&&(r.selected=n.value),t._set(r),c={}}});t.root._beforecreate.push((function(){d._bind({value:1},d.get())}));for(var f=e.highlightedElements,m=[],g=0;g<f.length;g+=1)m[g]=Yl(t,Wl(e,f,g));return{c:function(){n=k("div"),r=k("label"),i=T("\n    "),o=k("div"),d._fragment.c(),a=T("\n    "),s=k("ul");for(var t=0;t<m.length;t+=1)m[t].c();r.className="separator",s.className="highlighted-series svelte-u6xm45",n.className="story-highlight control-group",j(n,"clear","both")},m:function(t,e){p(t,n,e),h(n,r),r.innerHTML=l,h(n,i),h(n,o),d._mount(o,null),h(n,a),h(n,s);for(var c=0;c<m.length;c+=1)m[c].m(s,null)},p:function(n,r){e=r;var i={};if(n.options&&(i.options=e.options),!c.value&&n.selected&&(i.value=e.selected,c.value=void 0!==e.selected),d._set(i),c={},n.highlightedElements){f=e.highlightedElements;for(var o=0;o<f.length;o+=1){var a=Wl(e,f,o);m[o]?m[o].p(n,a):(m[o]=Yl(t,a),m[o].c(),m[o].m(s,null))}for(;o<m.length;o+=1)m[o].d(1);m.length=f.length}},d:function(t){t&&v(n),d.destroy(),w(m,t)}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function Xl(t){X(this,t),this._state=u({},t.data),this._intro=!0,this._fragment=function(t,e){var n,r=e.item.name||e.item.label||e.item.id;return{c:function(){n=k("div")},m:function(t,e){p(t,n,e),n.innerHTML=r},p:function(t,e){t.item&&r!==(r=e.item.name||e.item.label||e.item.id)&&(n.innerHTML=r)},d:function(t){t&&v(n)}}}(0,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}u(Kl.prototype,tt),u(Kl.prototype,ql),Kl.prototype._recompute=function(t,e){var n;t.$vis&&this._differs(e.elements,e.elements=(n=e.$vis)?n.keys().sort().map((function(t){var e=n.keyLabel(t);return{value:t,label:t+(t!==e?" (".concat(e,")"):"")}})):[])&&(t.elements=!0),t.elements&&this._differs(e.options,e.options=function(t){var e=t.elements;return[{label:"(".concat(rt("select element"),")"),value:"---"}].concat(l(e))}(e))&&(t.options=!0),(t.highlighted||t.elements)&&this._differs(e.highlightedElements,e.highlightedElements=function(t){var e=t.highlighted,n=t.elements,r=Bl(n,"value");return e.map((function(t){return{key:t,valid:r[t]}}))}(e))&&(t.highlightedElements=!0)},u(Xl.prototype,tt);var Jl={select:function(t,e,n){var r=this.get(),i=r.multiselectable,o=r.selectable,a=r.disabled;if(o&&!a)return t.stopPropagation(),i&&t.shiftKey?this.selectShift(t,e):i&&(t.ctrlKey||t.metaKey)?this.selectCtrl(t,e):void this.selectNormal(t,e)},selectNormal:function(t,e){var n=this.get(),r=n.selected;n.deselectable&&1===r.length&&e.id===r[0]?r.length=0:(r.length=1,r[0]=e.id),this.set({selected:r})},selectCtrl:function(t,e){var n=this.get().selected,r=n.indexOf(e.id);r>-1?n.splice(r,1):n.push(e.id),this.set({selected:n})},selectShift:function(t,e){var n=this.get(),r=n.selected,i=n.items,o=i.map((function(t){return t.id}));if(1===r.length){var a=o.indexOf(r[0]);if(a>-1){var s=i.indexOf(e);s>-1&&(r.length=0,r.push.apply(r,o.slice(Math.min(s,a),Math.max(s,a)+1)))}}else if(r.length>1){var l=o.indexOf(r[0]),c=o.indexOf(r[r.length-1]),u=i.indexOf(e);Math.abs(u-l)<Math.abs(u-c)?l=u:c=u,r.length=0,r.push.apply(r,o.slice(l,c+1))}this.set({selected:r})},dragstart:function(t,e){var n=this.get(),r=n.draggable,i=n.items,o=n.selected,a=n.disabled;r&&!a&&(o.length=1,o[0]=i[e].id,t.dataTransfer.setData("item",e),this.set({dragging:!0,selected:o}))},dragover:function(t){var e=this.get(),n=e.draggable,r=e.disabled;if(n&&!r){var i=t.target,o=i.parentElement===this.refs.list?+i.getAttribute("data-pos"):-1,a=i.getBoundingClientRect(),s=(t.clientY-a.top)/a.height;this.set({dragtarget:o,dropafter:s>.5}),t.dataTransfer.dropEffect="move"}},drop:function(t){var e=this.get(),n=e.draggable,r=e.disabled;if(n&&!r){var i=t.dataTransfer.getData("item"),o=this.get(),a=o.dragtarget,s=o.dropafter,l=o.items;if(i!==a){var c=l[a],u=l.splice(i,1)[0],d=l.indexOf(c);d||s?l.splice(d+(s?1:0),0,u):l.unshift(u)}this.set({dragging:!1,dragtarget:-1,hover:!1,items:l}),this.fire("itemDrag",{items:l})}},onChange:function(t){this.fire("change",t)}};function Ql(t){t.preventDefault();var e=this._svelte,n=e.component,r=e.ctx;n.select(t,r.item,r.index)}function Zl(t){var e=this._svelte,n=e.component,r=e.ctx;n.dragstart(t,r.index)}function tc(t){this._svelte.component.set({hover:null})}function ec(t){var e=this._svelte,n=e.component,r=e.ctx;n.set({hover:r.item.id})}function nc(t,e,n){var r=Object.create(t);return r.item=e[n],r.each_value=e,r.index=n,r}function rc(t,e){var n,r,i={},o=e.itemRenderer;function a(e){var n={draggable:e.draggable,index:e.index};return void 0!==e.item&&(n.item=e.item,i.item=!0),{root:t.root,store:t.store,data:n,_bind:function(n,r){var o={};!i.item&&n.item&&(e.each_value[e.index]=r.item=r.item,o.items=e.items),t._set(o),i={}}}}if(o){var s=new o(a(e));t.root._beforecreate.push((function(){s._bind({item:1},s.get())}))}function l(e){t.onChange(e)}return s&&s.on("change",l),{c:function(){n=k("li"),s&&s._fragment.c(),r=T("\n    "),n._svelte={component:t,ctx:e},C(n,"mouseenter",ec),C(n,"mouseleave",tc),C(n,"dragstart",Zl),C(n,"click",Ql),n.dataset.pos=e.index,n.draggable=e.draggable,n.className="svelte-32gqru",P(n,"selected",e.selected.indexOf(e.item.id)>-1),P(n,"dragtarget",e.dragtarget===e.index),P(n,"dropafter",e.dropafter),P(n,"dropbefore",!e.dropafter),P(n,"hover",e.hover===e.item.id)},m:function(t,e){p(t,n,e),s&&s._mount(n,null),h(n,r)},p:function(c,u){e=u;var d={};c.draggable&&(d.draggable=e.draggable),!i.item&&c.items&&(d.item=e.item,i.item=void 0!==e.item),o!==(o=e.itemRenderer)?(s&&s.destroy(),o?(s=new o(a(e)),t.root._beforecreate.push((function(){var t={};void 0===e.item&&(t.item=1),s._bind(t,s.get())})),s._fragment.c(),s._mount(n,r),s.on("change",l)):s=null):o&&(s._set(d),i={}),n._svelte.ctx=e,c.draggable&&(n.draggable=e.draggable),(c.selected||c.items)&&P(n,"selected",e.selected.indexOf(e.item.id)>-1),c.dragtarget&&P(n,"dragtarget",e.dragtarget===e.index),c.dropafter&&(P(n,"dropafter",e.dropafter),P(n,"dropbefore",!e.dropafter)),(c.hover||c.items)&&P(n,"hover",e.hover===e.item.id)},d:function(t){t&&v(n),s&&s.destroy(),M(n,"mouseenter",ec),M(n,"mouseleave",tc),M(n,"dragstart",Zl),M(n,"click",Ql)}}}function ic(t){X(this,t),this.refs={},this._state=u({items:[],itemRenderer:Xl,selected:[],selectable:!0,draggable:!1,compact:!1,multiselectable:!0,deselectable:!1,maxHeight:!1,className:"",dragging:!1,dragtarget:-1,dropafter:!1,disabled:!1,hover:null},t.data),this._intro=!0,this._fragment=function(t,e){for(var n,r,i=e.items,o=[],a=0;a<i.length;a+=1)o[a]=rc(t,nc(e,i,a));function s(e){e.preventDefault(),t.drop(e)}function l(e){e.preventDefault(),t.dragover(e)}return{c:function(){n=k("ul");for(var t=0;t<o.length;t+=1)o[t].c();C(n,"drop",s),C(n,"dragover",l),n.className=r="unstyled "+e.className+" svelte-32gqru",j(n,"max-height",e.maxHeight?e.maxHeight:e.compact?"120px":"220px"),P(n,"disabled",e.disabled),P(n,"draggable",e.draggable),P(n,"dragging",e.dragging),P(n,"compact",e.compact)},m:function(e,r){p(e,n,r);for(var i=0;i<o.length;i+=1)o[i].m(n,null);t.refs.list=n},p:function(e,a){if(e.draggable||e.selected||e.items||e.dragtarget||e.dropafter||e.hover||e.itemRenderer){i=a.items;for(var s=0;s<i.length;s+=1){var l=nc(a,i,s);o[s]?o[s].p(e,l):(o[s]=rc(t,l),o[s].c(),o[s].m(n,null))}for(;s<o.length;s+=1)o[s].d(1);o.length=i.length}e.className&&r!==(r="unstyled "+a.className+" svelte-32gqru")&&(n.className=r),(e.maxHeight||e.compact)&&j(n,"max-height",a.maxHeight?a.maxHeight:a.compact?"120px":"220px"),(e.className||e.disabled)&&P(n,"disabled",a.disabled),(e.className||e.draggable)&&P(n,"draggable",a.draggable),(e.className||e.dragging)&&P(n,"dragging",a.dragging),(e.className||e.compact)&&P(n,"compact",a.compact)},d:function(e){e&&v(n),w(o,e),M(n,"drop",s),M(n,"dragover",l),t.refs.list===n&&(t.refs.list=null)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function oc(t){X(this,t),this._state=u({disabled:!1,width:null,labelWidth:null,options:[],optgroups:[],valign:"middle",inline:!0,help:""},t.data),this._recompute({inline:1,width:1,labelWidth:1},this._state),this._intro=!0,this._fragment=function(t,e){var n={},r={},i={width:e.controlWidth};void 0!==e.value&&(i.value=e.value,n.value=!0),void 0!==e.disabled&&(i.disabled=e.disabled,n.disabled=!0),void 0!==e.options&&(i.options=e.options,n.options=!0),void 0!==e.optgroups&&(i.optgroups=e.optgroups,n.optgroups=!0);var o=new qi({root:t.root,store:t.store,data:i,_bind:function(e,r){var i={};!n.value&&e.value&&(i.value=r.value),!n.disabled&&e.disabled&&(i.disabled=r.disabled),!n.options&&e.options&&(i.options=r.options),!n.optgroups&&e.optgroups&&(i.optgroups=r.optgroups),t._set(i),n={}}});t.root._beforecreate.push((function(){o._bind({value:1,disabled:1,options:1,optgroups:1},o.get())})),o.on("change",(function(e){t.fire("change",e)}));var a={width:e.labelWidth,type:"select"};void 0!==e.valign&&(a.valign=e.valign,r.valign=!0),void 0!==e.label&&(a.label=e.label,r.label=!0),void 0!==e.disabled&&(a.disabled=e.disabled,r.disabled=!0),void 0!==e.help&&(a.help=e.help,r.help=!0),void 0!==e.inline&&(a.inline=e.inline,r.inline=!0);var s=new pi({root:t.root,store:t.store,slots:{default:x()},data:a,_bind:function(e,n){var i={};!r.valign&&e.valign&&(i.valign=n.valign),!r.label&&e.label&&(i.label=n.label),!r.disabled&&e.disabled&&(i.disabled=n.disabled),!r.help&&e.help&&(i.help=n.help),!r.inline&&e.inline&&(i.inline=n.inline),t._set(i),r={}}});return t.root._beforecreate.push((function(){s._bind({valign:1,label:1,disabled:1,help:1,inline:1},s.get())})),{c:function(){o._fragment.c(),s._fragment.c()},m:function(t,e){o._mount(s._slotted.default,null),s._mount(t,e)},p:function(t,i){e=i;var a={};t.controlWidth&&(a.width=e.controlWidth),!n.value&&t.value&&(a.value=e.value,n.value=void 0!==e.value),!n.disabled&&t.disabled&&(a.disabled=e.disabled,n.disabled=void 0!==e.disabled),!n.options&&t.options&&(a.options=e.options,n.options=void 0!==e.options),!n.optgroups&&t.optgroups&&(a.optgroups=e.optgroups,n.optgroups=void 0!==e.optgroups),o._set(a),n={};var l={};t.labelWidth&&(l.width=e.labelWidth),!r.valign&&t.valign&&(l.valign=e.valign,r.valign=void 0!==e.valign),!r.label&&t.label&&(l.label=e.label,r.label=void 0!==e.label),!r.disabled&&t.disabled&&(l.disabled=e.disabled,r.disabled=void 0!==e.disabled),!r.help&&t.help&&(l.help=e.help,r.help=void 0!==e.help),!r.inline&&t.inline&&(l.inline=e.inline,r.inline=void 0!==e.inline),s._set(l),r={}},d:function(t){o.destroy(),s.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function ac(){var t=this.store.get().language;t&&this.store.set({language:t.replace("_","-")})}function sc(t){var e=this;X(this,t),this._state=u(this.store._init(["locales","language"]),t.data),this.store._add(this,["locales","language"]),this._recompute({$locales:1},this._state),this._intro=!0,this._handlers.state=[ac],this._handlers.destroy=[Z],ac.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n={},r={label:rt("describe / locale-select / language"),options:e.options,width:"200px",labelWidth:"80px"};void 0!==e.$language&&(r.value=e.$language,n.value=!0);var i=new oc({root:t.root,store:t.store,data:r,_bind:function(e,r){var i={};!n.value&&e.value&&(i.language=r.value),t.store.set(i),n={}}});return t.root._beforecreate.push((function(){i._bind({value:1},i.get())})),{c:function(){i._fragment.c()},m:function(t,e){i._mount(t,e)},p:function(t,r){e=r;var o={};t.options&&(o.options=e.options),!n.value&&t.$language&&(o.value=e.$language,n.value=void 0!==e.$language),i._set(o),n={}},d:function(t){i.destroy(t)}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(ic.prototype,tt),u(ic.prototype,Jl),u(oc.prototype,tt),oc.prototype._recompute=function(t,e){var n,r,i;(t.inline||t.width)&&this._differs(e.controlWidth,e.controlWidth=(r=(n=e).inline,i=n.width,r?i||"auto":i))&&(t.controlWidth=!0),(t.inline||t.labelWidth)&&this._differs(e.labelWidth,e.labelWidth=function(t){var e=t.inline,n=t.labelWidth;return e?n||"auto":n}(e))&&(t.labelWidth=!0)},u(sc.prototype,tt),sc.prototype._recompute=function(t,e){t.$locales&&this._differs(e.options,e.options=e.$locales.map((function(t){return{value:t.value,label:"".concat(t.label," (").concat(t.value,")")}})))&&(t.options=!0)},u(function(t){X(this,t),this.refs={},this._state=u({slider:!0,width:"100px",unit:"",disabled:!1,multiply:1,min:0,max:100,step:1,allowUndefined:!1,placeholder:null},t.data),this._intro=!0,this._fragment=function(t,e){var n={},r={},i={slider:e.slider,unit:e.unit,disabled:e.disabled,multiply:e.multiply,min:e.min,max:e.max,step:e.step,allowUndefined:e.allowUndefined,placeholder:e.placeholder};void 0!==e.value&&(i.value=e.value,n.value=!0);var o=new kt({root:t.root,store:t.store,data:i,_bind:function(e,r){var i={};!n.value&&e.value&&(i.value=r.value),t._set(i),n={}}});t.root._beforecreate.push((function(){o._bind({value:1},o.get())})),t.refs.baseNumber=o;var a={disabled:e.disabled,type:"number",label:e.label,valign:"middle"};void 0!==e.width&&(a.width=e.width,r.width=!0);var s=new pi({root:t.root,store:t.store,slots:{default:x()},data:a,_bind:function(e,n){var i={};!r.width&&e.width&&(i.width=n.width),t._set(i),r={}}});return t.root._beforecreate.push((function(){s._bind({width:1},s.get())})),{c:function(){o._fragment.c(),s._fragment.c()},m:function(t,e){o._mount(s._slotted.default,null),s._mount(t,e)},p:function(t,i){e=i;var a={};t.slider&&(a.slider=e.slider),t.unit&&(a.unit=e.unit),t.disabled&&(a.disabled=e.disabled),t.multiply&&(a.multiply=e.multiply),t.min&&(a.min=e.min),t.max&&(a.max=e.max),t.step&&(a.step=e.step),t.allowUndefined&&(a.allowUndefined=e.allowUndefined),t.placeholder&&(a.placeholder=e.placeholder),!n.value&&t.value&&(a.value=e.value,n.value=void 0!==e.value),o._set(a),n={};var l={};t.disabled&&(l.disabled=e.disabled),t.label&&(l.label=e.label),!r.width&&t.width&&(l.width=e.width,r.width=void 0!==e.width),s._set(l),r={}},d:function(e){o.destroy(),t.refs.baseNumber===o&&(t.refs.baseNumber=null),s.destroy(e)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}.prototype,tt);var lc=function(t,e,n){var r=e+Math.floor(2.5),i=e-Math.floor(2.5);return i<0&&(i=0,r=4),r>=n&&(i=(r=n)-5+1),t<=r&&t>=i};function cc(t){var e=this._svelte,n=e.component,r=e.ctx;n.navigate(t,r.item.state)}function uc(t,e,n){var r=Object.create(t);return r.item=e[n],r}function dc(t,e){var n,r,i,o,a,s,l=e.item.text;return{c:function(){n=k("li"),r=k("a"),i=T(l),s=T("\n        "),r._svelte={component:t,ctx:e},C(r,"click",cc),r.href=o=e.getUrl(e.item.state),n.className=a=e.isActive(e.item.state)?"active":""},m:function(t,e){p(t,n,e),h(n,r),h(r,i),p(t,s,e)},p:function(t,s){e=s,t.displayItems&&l!==(l=e.item.text)&&S(i,l),r._svelte.ctx=e,(t.getUrl||t.displayItems)&&o!==(o=e.getUrl(e.item.state))&&(r.href=o),(t.isActive||t.displayItems)&&a!==(a=e.isActive(e.item.state)?"active":"")&&(n.className=a)},d:function(t){t&&v(n),M(r,"click",cc),t&&v(s)}}}function fc(t,e){var n,r=e.item.visible&&dc(t,e);return{c:function(){r&&r.c(),n=O()},m:function(t,e){r&&r.m(t,e),p(t,n,e)},p:function(e,i){i.item.visible?r?r.p(e,i):((r=dc(t,i)).c(),r.m(n.parentNode,n)):r&&(r.d(1),r=null)},d:function(t){r&&r.d(t),t&&v(n)}}}function hc(t){X(this,t),this._state=u({total:null,limit:10,offset:0},t.data),this._recompute({limit:1,offset:1,state:1,url:1,currentPage:1,total:1},this._state),this._intro=!0,this._fragment=function(t,e){for(var n,r,i=e.displayItems,o=[],a=0;a<i.length;a+=1)o[a]=fc(t,uc(e,i,a));return{c:function(){n=k("div"),r=k("ul");for(var t=0;t<o.length;t+=1)o[t].c();n.className="pagination"},m:function(t,e){p(t,n,e),h(n,r);for(var i=0;i<o.length;i+=1)o[i].m(r,null)},p:function(e,n){if(e.displayItems||e.isActive||e.getUrl){i=n.displayItems;for(var a=0;a<i.length;a+=1){var s=uc(n,i,a);o[a]?o[a].p(e,s):(o[a]=fc(t,s),o[a].c(),o[a].m(r,null))}for(;a<o.length;a+=1)o[a].d(1);o.length=i.length}},d:function(t){t&&v(n),w(o,t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}u(hc.prototype,tt),u(hc.prototype,{navigate:function(t,e){t.preventDefault(),this.set({offset:e.offset}),this.fire("navigate",e)}}),hc.prototype._recompute=function(t,e){var n,r,i;(t.limit||t.offset)&&this._differs(e.currentPage,e.currentPage=(r=(n=e).limit,i=n.offset,Math.ceil(+i/+r)||0))&&(t.currentPage=!0),(t.state||t.url)&&this._differs(e.getUrl,e.getUrl=function(t){t.state;var e=t.url;return function(t){return e?e(t):"#"}}(e))&&(t.getUrl=!0),t.currentPage&&this._differs(e.isActive,e.isActive=function(t){var e=t.currentPage;return function(t){return t.offset/t.limit===e}}(e))&&(t.isActive=!0),(t.total||t.limit||t.currentPage)&&this._differs(e.displayItems,e.displayItems=function(t){var e=t.total,n=t.limit,r=t.currentPage;if(!e)return[];var i=Array.from({length:Math.ceil(e/n)},(function(t,e){return{state:{limit:n,offset:e*n}}}));return[{text:"«",state:i[0].state,visible:!0}].concat(l(i.map((function(t,e){return{text:e+1,state:t.state,visible:lc(e,r,i.length-1)}}))),[{text:"»",state:i[i.length-1].state,visible:!0}])}(e))&&(t.displayItems=!0)};var pc={proceed:function(t){t.preventDefault();var e=this.get(),n=e.steps[e.activeIndex+1].id;this.set({active:n}),window.scrollTo(0,65);var r=this.store.get().id;window.history.pushState({step:n,id:r},"","/edit/".concat(r,"/").concat(n))},back:function(t){t.preventDefault();var e=this.get(),n=e.steps[e.activeIndex-1].id;this.set({active:n}),window.scrollTo(0,65);var r=this.store.get().id;window.history.pushState({step:n,id:r},"","/edit/".concat(r,"/").concat(n))}};function vc(t,e){var n,r,i,o,a=rt("Back");function s(e){t.back(e)}return{c:function(){n=k("a"),r=k("i"),i=T(" "),o=T(a),r.className="fa fa-chevron-left fa-fw icon-btn-left",C(n,"click",s),n.className="btn btn-tabback",n.href="#"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o)},d:function(t){t&&v(n),M(n,"click",s)}}}function mc(t,e){var n,r,i,o,a=rt("Proceed");function s(e){t.proceed(e)}return{c:function(){n=k("a"),r=T(a),i=T(" "),(o=k("i")).className="fa fa-chevron-right fa-fw icon-btn-right",C(n,"click",s),n.href="#proceed",n.className=" btn proceed-btn"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o)},d:function(t){t&&v(n),M(n,"click",s)}}}function gc(t){var e,n,r,i,o,a,s;X(this,t),this._state=u({},t.data),this._recompute({active:1,steps:1},this._state),this._intro=!0,this._fragment=(e=this,n=this._state,a=n.activeIndex>0&&vc(e),s=n.activeIndex<n.steps.length-1&&mc(e),{c:function(){r=k("div"),i=k("div"),a&&a.c(),o=T(" "),s&&s.c(),i.className="btn-group buttons",j(r,"margin-top","40px")},m:function(t,e){p(t,r,e),h(r,i),a&&a.m(i,null),h(i,o),s&&s.m(i,null)},p:function(t,n){n.activeIndex>0?a||((a=vc(e)).c(),a.m(i,o)):a&&(a.d(1),a=null),n.activeIndex<n.steps.length-1?s||((s=mc(e)).c(),s.m(i,null)):s&&(s.d(1),s=null)},d:function(t){t&&v(r),a&&a.d(),s&&s.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function bc(t,e){var n,r;return{c:function(){n=k("div"),(r=k("div")).className="bar svelte-14ji5mn",j(r,"width",e.status+"%"),n.className="progress svelte-14ji5mn",j(n,"height",e.height+"px")},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.status&&j(r,"width",e.status+"%"),t.height&&j(n,"height",e.height+"px")},d:function(t){t&&v(n)}}}function _c(t){var e=t.changed;t.previous&&e.value&&this.set({indeterminate:!1})}function yc(t,e,n){var r=Object.create(t);return r.opt=e[n],r}function wc(t,e){var n,r=e.opt.help;return{c:function(){(n=k("div")).className="help svelte-1qlzejw"},m:function(t,e){p(t,n,e),n.innerHTML=r},p:function(t,e){t.options&&r!==(r=e.opt.help)&&(n.innerHTML=r)},d:function(t){t&&v(n)}}}function xc(t,e){var n,r,i,o,a,s,l,c,u,d=e.opt.label;function f(){t.set({value:r.__value})}var m=e.opt.help&&wc(0,e);return{c:function(){n=k("label"),r=k("input"),o=T("\n            "),a=k("span"),s=T(" "),l=k("span"),c=T("\n            "),m&&m.c(),t._bindingGroups[0].push(r),C(r,"change",f),A(r,"type","radio"),r.__value=i=e.opt.value,r.value=r.__value,r.disabled=e.disabled,r.className="svelte-1qlzejw",a.className="css-ui svelte-1qlzejw",l.className="inner-label svelte-1qlzejw",n.title=u=e.opt.tooltip||"",n.className="svelte-1qlzejw",P(n,"disabled",e.disabled),P(n,"has-help",e.opt.help)},m:function(t,i){p(t,n,i),h(n,r),r.checked=r.__value===e.value,h(n,o),h(n,a),h(n,s),h(n,l),l.innerHTML=d,h(n,c),m&&m.m(n,null)},p:function(t,e){t.value&&(r.checked=r.__value===e.value),t.options&&i!==(i=e.opt.value)&&(r.__value=i),r.value=r.__value,t.disabled&&(r.disabled=e.disabled),t.options&&d!==(d=e.opt.label)&&(l.innerHTML=d),e.opt.help?m?m.p(t,e):((m=wc(0,e)).c(),m.m(n,null)):m&&(m.d(1),m=null),t.options&&u!==(u=e.opt.tooltip||"")&&(n.title=u),t.disabled&&P(n,"disabled",e.disabled),t.options&&P(n,"has-help",e.opt.help)},d:function(e){e&&v(n),t._bindingGroups[0].splice(t._bindingGroups[0].indexOf(r),1),M(r,"change",f),m&&m.d()}}}function kc(t,e){var n;return{c:function(){(n=k("div")).className="disabled-message svelte-1qlzejw"},m:function(t,r){p(t,n,r),n.innerHTML=e.disabled_msg},p:function(t,e){t.disabled_msg&&(n.innerHTML=e.disabled_msg)},d:function(t){t&&v(n)}}}function Nc(t){var e=this;X(this,t),this._state=u({value:null,disabled:!1,disabled_msg:"",indeterminate:!1,width:"auto",valign:"top",inline:!0},t.data),this._bindingGroups=[[]],this._intro=!0,this._handlers.state=[_c],this._slotted=t.slots||{},_c.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){for(var n,r,i,o,a,s=t._slotted.default,l=e.options,c=[],u=0;u<l.length;u+=1)c[u]=xc(t,yc(e,l,u));var d={type:"radio",width:e.width,valign:e.valign,label:e.label,disabled:e.disabled},f=new pi({root:t.root,store:t.store,slots:{default:x()},data:d}),m=e.disabled&&e.disabled_msg&&kc(t,e);return{c:function(){n=k("div");for(var t=0;t<c.length;t+=1)c[t].c();r=T("\n    "),f._fragment.c(),o=T("\n\n"),m&&m.c(),a=O(),n.className="svelte-1qlzejw",P(n,"inline",e.inline),P(n,"indeterminate",e.indeterminate)},m:function(t,e){h(f._slotted.default,n);for(var l=0;l<c.length;l+=1)c[l].m(n,null);h(f._slotted.default,r),s&&(h(f._slotted.default,i||(i=O())),h(f._slotted.default,s)),f._mount(t,e),p(t,o,e),m&&m.m(t,e),p(t,a,e)},p:function(e,r){if(e.options||e.disabled||e.value){l=r.options;for(var i=0;i<l.length;i+=1){var o=yc(r,l,i);c[i]?c[i].p(e,o):(c[i]=xc(t,o),c[i].c(),c[i].m(n,null))}for(;i<c.length;i+=1)c[i].d(1);c.length=l.length}e.inline&&P(n,"inline",r.inline),e.indeterminate&&P(n,"indeterminate",r.indeterminate);var s={};e.width&&(s.width=r.width),e.valign&&(s.valign=r.valign),e.label&&(s.label=r.label),e.disabled&&(s.disabled=r.disabled),f._set(s),r.disabled&&r.disabled_msg?m?m.p(e,r):((m=kc(t,r)).c(),m.m(a.parentNode,a)):m&&(m.d(1),m=null)},d:function(t){w(c,t),s&&y(i,s),f.destroy(t),t&&v(o),m&&m.d(t),t&&v(a)}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(gc.prototype,tt),u(gc.prototype,pc),gc.prototype._recompute=function(t,e){var n,r,i;(t.active||t.steps)&&this._differs(e.activeIndex,e.activeIndex=(r=(n=e).active,(i=n.steps).indexOf(Ar.findWhere(i,{id:r}))))&&(t.activeIndex=!0)},u(function(t){var e,n,r;X(this,t),this._state=u({visible:!0,status:0,height:20},t.data),this._intro=!0,this._fragment=(this,e=this._state,r=e.visible&&bc(0,e),{c:function(){r&&r.c(),n=O()},m:function(t,e){r&&r.m(t,e),p(t,n,e)},p:function(t,e){e.visible?r?r.p(t,e):((r=bc(0,e)).c(),r.m(n.parentNode,n)):r&&(r.d(1),r=null)},d:function(t){r&&r.d(t),t&&v(n)}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}.prototype,tt),u(Nc.prototype,tt);function Tc(t){X(this,t),this._state=u({defaultValue:0},t.data),this._intro=!0,this._fragment=function(t,e){var n;function r(e){t.onReset()}return{c:function(){(n=k("button")).innerHTML='<i class="fa fa-undo"></i>',C(n,"click",r),n.className="undo svelte-e12pgc",n.title="Reset",P(n,"inactive",e.value===e.defaultValue)},m:function(t,e){p(t,n,e)},p:function(t,e){(t.value||t.defaultValue)&&P(n,"inactive",e.value===e.defaultValue)},d:function(t){t&&v(n),M(n,"click",r)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function Oc(t,e){var n,r,i,o,a=t._slotted.default;return{c:function(){n=k("div"),r=k("fieldset"),(i=k("div")).className="control-group vis-option-group",r.id="visOptions",n.className=o="section "+e.id},m:function(t,e){p(t,n,e),h(n,r),h(r,i),a&&h(i,a)},p:function(t,e){t.id&&o!==(o="section "+e.id)&&(n.className=o)},d:function(t){t&&v(n),a&&b(i,a)}}}function Cc(){var t=this.get().axis,e=this.store.get().vis.axes(!1,!0)[t];this.set({selected:e,isInitialized:!0})}function Mc(t){var e=t.changed,n=t.current;if(t.previous&&e.selected&&n.selected&&n.isInitialized){var r=this.get(),i=r.axis,o=r.selected,a=function(t){if(Array.isArray(t)){var e={};return Object.keys(t).forEach((function(n){return e[n]=t[n]})),e}return t}(bi(this.store.get().metadata.axes))||{};"-"===o?delete a[i]:a[i]=o,this.store.setMetadata("axes",a)}}function Ac(t){var e=this;X(this,t),this._state=u(u(this.store._init(["visualization","dataset"]),{disabled:!1,width:"100px",valign:"middle",optional:!0,filter:!1,isInitialized:!1}),t.data),this.store._add(this,["visualization","dataset"]),this._recompute({axis:1,optional:1,$visualization:1,$dataset:1,filter:1},this._state),this._intro=!0,this._handlers.state=[Mc],this._handlers.destroy=[Z],Mc.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n={},r={disabled:e.disabled,options:e.columns,width:"100%"};void 0!==e.selected&&(r.value=e.selected,n.value=!0);var i=new qi({root:t.root,store:t.store,data:r,_bind:function(e,r){var i={};!n.value&&e.value&&(i.selected=r.value),t._set(i),n={}}});t.root._beforecreate.push((function(){i._bind({value:1},i.get())}));var o={type:"select-axis-column",width:e.width,valign:e.valign,label:e.label},a=new pi({root:t.root,store:t.store,slots:{default:x()},data:o});return{c:function(){i._fragment.c(),a._fragment.c()},m:function(t,e){i._mount(a._slotted.default,null),a._mount(t,e)},p:function(t,r){e=r;var o={};t.disabled&&(o.disabled=e.disabled),t.columns&&(o.options=e.columns),!n.value&&t.selected&&(o.value=e.selected,n.value=void 0!==e.selected),i._set(o),n={};var s={};t.width&&(s.width=e.width),t.valign&&(s.valign=e.valign),t.label&&(s.label=e.label),a._set(s)},d:function(t){i.destroy(),a.destroy(t)}}}(this,this._state),this.root._oncreate.push((function(){Cc.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(Tc.prototype,tt),u(Tc.prototype,{onReset:function(){var t=this.get().defaultValue;this.set({value:t})}}),u(function(t){var e,n,r,i;X(this,t),this._state=u({},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,i=n.id==n.active&&Oc(e,n),{c:function(){i&&i.c(),r=O()},m:function(t,e){i&&i.m(t,e),p(t,r,e)},p:function(t,n){n.id==n.active?i?i.p(t,n):((i=Oc(e,n)).c(),i.m(r.parentNode,r)):i&&(i.d(1),i=null)},d:function(t){i&&i.d(t),t&&v(r)}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}.prototype,tt),u(Ac.prototype,tt),Ac.prototype._recompute=function(t,e){(t.axis||t.optional||t.$visualization||t.$dataset||t.filter)&&this._differs(e.columns,e.columns=function(t){var e=t.axis,n=t.optional,r=t.$visualization,i=t.$dataset,o=t.filter,a=[],s=Xt(r,"axes",{})[e];return i&&s?(s.optional&&n&&a.push({value:"-",label:s["na-label"]||"--"}),i.eachColumn((function(t){s.accepts.indexOf(t.type())>-1&&a.push({value:t.name(),label:t.title().trim()||t.name()})})),"function"==typeof o?a.filter((function(t){return!!o(t)})):a):[]}(e))&&(t.columns=!0)};function Ec(t,e,n){var r=Object.create(t);return r.option=e[n],r}function Sc(t,e){var n,r=e.option.label;return{c:function(){n=k("span")},m:function(t,e){p(t,n,e),n.innerHTML=r},p:function(t,e){t.options&&r!==(r=e.option.label)&&(n.innerHTML=r)},d:function(t){t&&v(n)}}}function jc(t,e){var n,r,i;return{c:function(){n=N("svg"),j(r=N("path"),"stroke-width",e.option.stroke||0),A(r,"d",i=e.option.svg),A(r,"class","svelte-glvnmn"),P(r,"stroke",e.option.stroke),P(r,"crisp",e.option.crisp),P(r,"selected",e.value===e.option.value),A(n,"height","16"),A(n,"viewBox","0 0 24 24"),A(n,"xmlns","http://www.w3.org/2000/svg"),A(n,"fill-rule","evenodd"),A(n,"clip-rule","evenodd"),A(n,"class","svelte-glvnmn")},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.options&&j(r,"stroke-width",e.option.stroke||0),t.options&&i!==(i=e.option.svg)&&A(r,"d",i),t.options&&(P(r,"stroke",e.option.stroke),P(r,"crisp",e.option.crisp)),(t.value||t.options)&&P(r,"selected",e.value===e.option.value)},d:function(t){t&&v(n)}}}function Ic(t,e){var n,r,i=e.option.label&&Sc(0,e),o=e.option.svg&&jc(0,e),a={notoggle:"1",disabled:e.disabled,value:e.value===e.option.value},s=new jt({root:t.root,store:t.store,slots:{default:x()},data:a});return s.on("select",(function(n){t.select(e.option)})),{c:function(){i&&i.c(),n=T(" "),o&&o.c(),r=O(),s._fragment.c()},m:function(t,e){i&&i.m(s._slotted.default,null),h(s._slotted.default,n),o&&o.m(s._slotted.default,null),h(s._slotted.default,r),s._mount(t,e)},p:function(t,a){(e=a).option.label?i?i.p(t,e):((i=Sc(0,e)).c(),i.m(n.parentNode,n)):i&&(i.d(1),i=null),e.option.svg?o?o.p(t,e):((o=jc(0,e)).c(),o.m(r.parentNode,r)):o&&(o.d(1),o=null);var l={};t.disabled&&(l.disabled=e.disabled),(t.value||t.options)&&(l.value=e.value===e.option.value),s._set(l)},d:function(t){i&&i.d(),o&&o.d(),s.destroy(t)}}}function Lc(t){X(this,t),this._state=u({disabled:!1,width:"auto",value:"red",options:[],optgroups:[]},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){for(var n,r,i,o=t._slotted.default,a=e.options,s=[],l=0;l<a.length;l+=1)s[l]=Ic(t,Ec(e,a,l));var c={type:"select",width:e.width,valign:"middle",inline:!0,label:e.label,disabled:e.disabled},u=new pi({root:t.root,store:t.store,slots:{default:x()},data:c});return{c:function(){n=k("div");for(var t=0;t<s.length;t+=1)s[t].c();r=T("\n    "),u._fragment.c(),n.className="btn-group svelte-l5q6v5"},m:function(t,e){h(u._slotted.default,n);for(var a=0;a<s.length;a+=1)s[a].m(n,null);h(u._slotted.default,r),o&&(h(u._slotted.default,i||(i=O())),h(u._slotted.default,o)),u._mount(t,e)},p:function(e,r){if(e.disabled||e.value||e.options){a=r.options;for(var i=0;i<a.length;i+=1){var o=Ec(r,a,i);s[i]?s[i].p(e,o):(s[i]=Ic(t,o),s[i].c(),s[i].m(n,null))}for(;i<s.length;i+=1)s[i].d(1);s.length=a.length}var l={};e.width&&(l.width=r.width),e.label&&(l.label=r.label),e.disabled&&(l.disabled=r.disabled),u._set(l)},d:function(t){w(s,t),o&&y(i,o),u.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(Lc.prototype,tt),u(Lc.prototype,{select:function(t){this.set({value:t.value})}});function Pc(t,e){var n,r=new Gt({root:t.root,store:t.store,slots:{default:x()}});return{c:function(){n=k("div"),r._fragment.c()},m:function(t,i){h(r._slotted.default,n),n.innerHTML=e.help,r._mount(t,i)},p:function(t,e){t.help&&(n.innerHTML=e.help)},d:function(t){r.destroy(t)}}}function Rc(t,e){var n,r,i,o=t._slotted.default;return{c:function(){n=k("div"),(r=k("div")).className="switch-content svelte-lppebe",j(n,"clear","both")},m:function(t,e){p(t,n,e),h(n,r),o&&h(r,o),i=!0},p:c,i:function(t,e){i||this.m(t,e)},o:f,d:function(t){t&&v(n),o&&b(r,o)}}}function Dc(t,e){var n,r,i,o;return{c:function(){n=k("div"),(r=k("div")).className="disabled-msg svelte-lppebe",j(n,"clear","both")},m:function(t,i){p(t,n,i),h(n,r),r.innerHTML=e.disabled_msg,o=!0},p:function(t,e){o&&!t.disabled_msg||(r.innerHTML=e.disabled_msg)},i:function(e,r){o||(t.root._intro&&(i&&i.invalidate(),t.root._aftercreate.push((function(){i||(i=D(t,n,$t,{},!0)),i.run(1)}))),this.m(e,r))},o:function(e){o&&(i||(i=D(t,n,$t,{},!1)),i.run(0,(function(){e(),i=null})),o=!1)},d:function(t){t&&(v(n),i&&i.abort())}}}function zc(t){X(this,t),this._state=u({value:!1,help:"",disabled_msg:"",disabled_state:"auto",disabled:!1,highlight:!1,indeterminate:!1},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d,f,m,b,_=e.help&&Pc(t,e);function y(){t.set({value:a.checked,indeterminate:a.indeterminate})}function w(e){t.toggle()}var x=[Dc,Rc],N=[];function O(t){return t.disabled&&t.disabled_msg?0:t.disabled&&"on"!=t.disabled_state||!t.value||t.indeterminate?-1:1}return~(m=O(e))&&(b=N[m]=x[m](t,e)),{c:function(){n=k("div"),_&&_.c(),r=T("\n\n    "),i=k("label"),o=k("button"),a=k("input"),l=k("span"),c=T("\n        "),u=k("noscript"),f=T("\n\n    "),b&&b.c(),C(a,"change",y),"value"in e&&"indeterminate"in e||t.root._beforecreate.push(y),a.className=s=(e.disabled&&"on"==e.disabled_state?"disabled-force-checked":e.disabled&&"off"==e.disabled_state?"disabled-force-unchecked":"")+" svelte-lppebe",a.disabled=e.disabled,A(a,"type","checkbox"),l.className="slider round svelte-lppebe",C(o,"click",w),o.className="switch svelte-lppebe",i.className=d="switch-outer "+(e.disabled?"disabled":"")+" svelte-lppebe",n.className="control-group vis-option-group vis-option-type-switch svelte-lppebe"},m:function(t,s){p(t,n,s),_&&_.m(n,null),h(n,r),h(n,i),h(i,o),h(o,a),a.checked=e.value,a.indeterminate=e.indeterminate,h(o,l),h(i,c),h(i,u),u.insertAdjacentHTML("afterend",e.label),h(n,f),~m&&N[m].i(n,null)},p:function(e,o){o.help?_?_.p(e,o):((_=Pc(t,o)).c(),_.m(n,r)):_&&(_.d(1),_=null),e.value&&(a.checked=o.value),e.indeterminate&&(a.indeterminate=o.indeterminate),(e.disabled||e.disabled_state)&&s!==(s=(o.disabled&&"on"==o.disabled_state?"disabled-force-checked":o.disabled&&"off"==o.disabled_state?"disabled-force-unchecked":"")+" svelte-lppebe")&&(a.className=s),e.disabled&&(a.disabled=o.disabled),e.label&&(g(u),u.insertAdjacentHTML("afterend",o.label)),e.disabled&&d!==(d="switch-outer "+(o.disabled?"disabled":"")+" svelte-lppebe")&&(i.className=d);var l=m;(m=O(o))===l?~m&&N[m].p(e,o):(b&&(U(),b.o((function(){N[l].d(1),N[l]=null}))),~m?((b=N[m])||(b=N[m]=x[m](t,o)).c(),b.i(n,null)):b=null)},d:function(t){t&&v(n),_&&_.d(),M(a,"change",y),M(o,"click",w),~m&&N[m].d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(zc.prototype,tt),u(zc.prototype,{toggle:function(){var t=this.get(),e=t.disabled,n=t.indeterminate,r=t.value,i={value:!!n||!r,indeterminate:!1};e||(this.set(i),this.fire("change",i))}});var Uc={true:"ASC",false:"DESC"},Hc=Uc.true;var Fc={sort:function(t,e){t.preventDefault();var n,r=(n=this.get(),e===n.orderBy?Uc[n.order!==Hc]:Hc);this.set({orderBy:e,order:r}),this.fire("sort",{orderBy:e,order:r})}};function $c(t){var e=this._svelte,n=e.component,r=e.ctx;n.sort(t,r.item.orderBy)}function Bc(t,e,n){var r=Object.create(t);return r.item=e[n],r}function qc(t,e,n){var r=Object.create(t);return r.item=e[n],r}function Gc(t,e){var n;return{c:function(){j(n=k("col"),"width",e.item.width)},m:function(t,e){p(t,n,e)},p:function(t,e){t.columnHeaders&&j(n,"width",e.item.width)},d:function(t){t&&v(n)}}}function Vc(t,e){var n,r,i=e.item.title;return{c:function(){n=k("span"),r=T(i),n.className="col"},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.columnHeaders&&i!==(i=e.item.title)&&S(r,i)},d:function(t){t&&v(n)}}}function Wc(t,e){var n,r,i,o,a=e.item.title;return{c:function(){n=k("a"),r=T(a),n._svelte={component:t,ctx:e},C(n,"click",$c),n.className=i="sortable "+(e.isActive(e.item)?e.isAscending?"sortable-asc":"sortable-desc":"")+" svelte-1ef3poq",n.href=o="?orderBy=".concat(e.item.orderBy)},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,s){e=s,t.columnHeaders&&a!==(a=e.item.title)&&S(r,a),n._svelte.ctx=e,(t.isActive||t.columnHeaders||t.isAscending)&&i!==(i="sortable "+(e.isActive(e.item)?e.isAscending?"sortable-asc":"sortable-desc":"")+" svelte-1ef3poq")&&(n.className=i),t.columnHeaders&&o!==(o="?orderBy=".concat(e.item.orderBy))&&(n.href=o)},d:function(t){t&&v(n),M(n,"click",$c)}}}function Yc(t,e){var n,r;function i(t){return t.item.orderBy?Wc:Vc}var o=i(e),a=o(t,e);return{c:function(){n=k("th"),a.c(),n.className=r=(e.item.className?e.item.className:"")+" svelte-1ef3poq"},m:function(t,e){p(t,n,e),a.m(n,null)},p:function(e,s){o===(o=i(s))&&a?a.p(e,s):(a.d(1),(a=o(t,s)).c(),a.m(n,null)),e.columnHeaders&&r!==(r=(s.item.className?s.item.className:"")+" svelte-1ef3poq")&&(n.className=r)},d:function(t){t&&v(n),a.d()}}}function Kc(t){X(this,t),this._state=u({order:Hc,orderBy:""},t.data),this._recompute({orderBy:1,order:1},this._state),this._intro=!0,this._slotted=t.slots||{},this._fragment=function(t,e){for(var n,r,i,o,a,s,l,c,u=t._slotted.default,d=e.columnHeaders,f=[],m=0;m<d.length;m+=1)f[m]=Gc(t,qc(e,d,m));var g=e.columnHeaders,_=[];for(m=0;m<g.length;m+=1)_[m]=Yc(t,Bc(e,g,m));return{c:function(){n=k("div"),r=k("table"),i=k("colgroup");for(var t=0;t<f.length;t+=1)f[t].c();o=T("\n\n        "),a=k("thead"),s=k("tr");for(t=0;t<_.length;t+=1)_[t].c();l=T("\n\n        "),c=k("tbody"),r.className="table svelte-1ef3poq",n.className="table-container svelte-1ef3poq"},m:function(t,e){p(t,n,e),h(n,r),h(r,i);for(var d=0;d<f.length;d+=1)f[d].m(i,null);h(r,o),h(r,a),h(a,s);for(d=0;d<_.length;d+=1)_[d].m(s,null);h(r,l),h(r,c),u&&h(c,u)},p:function(e,n){if(e.columnHeaders){d=n.columnHeaders;for(var r=0;r<d.length;r+=1){var o=qc(n,d,r);f[r]?f[r].p(e,o):(f[r]=Gc(t,o),f[r].c(),f[r].m(i,null))}for(;r<f.length;r+=1)f[r].d(1);f.length=d.length}if(e.columnHeaders||e.isActive||e.isAscending){g=n.columnHeaders;for(r=0;r<g.length;r+=1){var a=Bc(n,g,r);_[r]?_[r].p(e,a):(_[r]=Yc(t,a),_[r].c(),_[r].m(s,null))}for(;r<_.length;r+=1)_[r].d(1);_.length=g.length}},d:function(t){t&&v(n),w(f,t),w(_,t),u&&b(c,u)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function Xc(t,e){var n,r;return{c:function(){n=k("div"),r=T(e.prepend),n.className="prepend"},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.prepend&&S(r,e.prepend)},d:function(t){t&&v(n)}}}function Jc(t,e){var n,r;return{c:function(){n=k("div"),r=T(e.append),n.className="append"},m:function(t,e){p(t,n,e),h(n,r)},p:function(t,e){t.append&&S(r,e.append)},d:function(t){t&&v(n)}}}function Qc(t,e){var n,r,i,o;return{c:function(){n=k("div"),(r=k("div")).className="disabled-msg svelte-o89ig2"},m:function(t,i){p(t,n,i),h(n,r),r.innerHTML=e.disabled_msg,o=!0},p:function(t,e){o&&!t.disabled_msg||(r.innerHTML=e.disabled_msg)},i:function(e,r){o||(t.root._intro&&(i&&i.invalidate(),t.root._aftercreate.push((function(){i||(i=D(t,n,$t,{},!0)),i.run(1)}))),this.m(e,r))},o:function(e){o&&(i||(i=D(t,n,$t,{},!1)),i.run(0,(function(){e(),i=null})),o=!1)},d:function(t){t&&(v(n),i&&i.abort())}}}function Zc(t){X(this,t),this._state=u(this.store._init(["themes","theme"]),t.data),this.store._add(this,["themes","theme"]),this._recompute({$themes:1},this._state),this._intro=!0,this._handlers.destroy=[Z],this._fragment=function(t,e){var n={},r={label:"Design",options:e.themeOptions,labelWidth:"80px",width:"200px"};void 0!==e.$theme&&(r.value=e.$theme,n.value=!0);var i=new oc({root:t.root,store:t.store,data:r,_bind:function(e,r){var i={};!n.value&&e.value&&(i.theme=r.value),t.store.set(i),n={}}});return t.root._beforecreate.push((function(){i._bind({value:1},i.get())})),{c:function(){i._fragment.c()},m:function(t,e){i._mount(t,e)},p:function(t,r){e=r;var o={};t.themeOptions&&(o.options=e.themeOptions),!n.value&&t.$theme&&(o.value=e.$theme,n.value=void 0!==e.$theme),i._set(o),n={}},d:function(t){i.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function tu(t){return t.toString().toLowerCase().replace(/\s+/g,"_").replace(/[^\w-]+/g,"").replace(/-/g,"_").replace(/__+/g,"_").replace(/^_+/,"").replace(/_+$/,"").replace(/^(\d)/,"_$1").replace(/^(and|or|in|true|false)$/,"$1_")}u(Kc.prototype,tt),u(Kc.prototype,Fc),Kc.prototype._recompute=function(t,e){var n;t.orderBy&&this._differs(e.isActive,e.isActive=(n=e.orderBy,function(t){return n===t.orderBy}))&&(t.isActive=!0),t.order&&this._differs(e.isAscending,e.isAscending=e.order===Hc)&&(t.isAscending=!0)},u(function(t){X(this,t),this._state=u({disabled:!1,disabled_msg:"",width:"100px",valign:"middle",help:"",placeholder:"",prepend:"",append:""},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,i,o,a,s,l=!1,c=e.prepend&&Xc(t,e);function u(){l=!0,t.set({value:i.value}),l=!1}var d=e.append&&Jc(t,e),f={disabled:e.disabled,type:"text",width:e.width,label:e.label,help:e.help,valign:e.valign},m=new pi({root:t.root,store:t.store,slots:{default:x()},data:f}),g=e.disabled&&e.disabled_msg&&Qc(t,e);return{c:function(){n=k("div"),c&&c.c(),r=T("\n        "),i=k("input"),o=T("\n        "),d&&d.c(),m._fragment.c(),a=T("\n\n"),g&&g.c(),s=O(),C(i,"input",u),i.disabled=e.disabled,A(i,"type","text"),i.placeholder=e.placeholder,i.className="svelte-o89ig2",n.className="flex svelte-o89ig2"},m:function(t,l){h(m._slotted.default,n),c&&c.m(n,null),h(n,r),h(n,i),i.value=e.value,h(n,o),d&&d.m(n,null),m._mount(t,l),p(t,a,l),g&&g.i(t,l),p(t,s,l)},p:function(e,o){o.prepend?c?c.p(e,o):((c=Xc(t,o)).c(),c.m(n,r)):c&&(c.d(1),c=null),!l&&e.value&&(i.value=o.value),e.disabled&&(i.disabled=o.disabled),e.placeholder&&(i.placeholder=o.placeholder),o.append?d?d.p(e,o):((d=Jc(t,o)).c(),d.m(n,null)):d&&(d.d(1),d=null);var a={};e.disabled&&(a.disabled=o.disabled),e.width&&(a.width=o.width),e.label&&(a.label=o.label),e.help&&(a.help=o.help),e.valign&&(a.valign=o.valign),m._set(a),o.disabled&&o.disabled_msg?(g?g.p(e,o):(g=Qc(t,o))&&g.c(),g.i(s.parentNode,s)):g&&(U(),g.o((function(){g.d(1),g=null})))},d:function(t){c&&c.d(),M(i,"input",u),d&&d.d(),m.destroy(t),t&&v(a),g&&g.d(t),t&&v(s)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}.prototype,tt),u(function(t){X(this,t),this._state=u({placeholder:"",labelWidth:"100px",width:"100%",height:"auto"},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,i=!1;function o(){i=!0,t.set({value:r.value}),i=!1}var a={disabled:e.disabled,type:"textarea",width:e.labelWidth,label:e.label,help:e.help},s=new pi({root:t.root,store:t.store,slots:{default:x()},data:a});return{c:function(){n=k("div"),r=k("textarea"),s._fragment.c(),C(r,"input",o),r.placeholder=e.placeholder,r.disabled=e.disabled,j(r,"height",e.height),r.className="svelte-re24xs",n.className="textarea-container svelte-re24xs",j(n,"width",e.width)},m:function(t,i){h(s._slotted.default,n),h(n,r),r.value=e.value,s._mount(t,i)},p:function(t,e){!i&&t.value&&(r.value=e.value),t.placeholder&&(r.placeholder=e.placeholder),t.disabled&&(r.disabled=e.disabled),t.height&&j(r,"height",e.height),t.width&&j(n,"width",e.width);var o={};t.disabled&&(o.disabled=e.disabled),t.labelWidth&&(o.width=e.labelWidth),t.label&&(o.label=e.label),t.help&&(o.help=e.help),s._set(o)},d:function(t){M(r,"input",o),s.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}.prototype,tt),u(Zc.prototype,tt),Zc.prototype._recompute=function(t,e){t.$themes&&this._differs(e.themeOptions,e.themeOptions=e.$themes.map((function(t){return{value:t.id,label:t.title}})))&&(t.themeOptions=!0)};var eu=e((function(t){function e(n,r){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},e(n,r)}t.exports=e}));var nu=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}},ru=e((function(t){function e(n,r,i){return nu()?t.exports=e=Reflect.construct:t.exports=e=function(t,e,n){var r=[null];r.push.apply(r,e);var i=new(Function.bind.apply(t,r));return n&&eu(i,n.prototype),i},e.apply(null,arguments)}t.exports=e})),iu="TOP",ou="TPAREN";function au(t,e,n){this.type=t,this.value=e,this.index=n}function su(t,e){this.pos=0,this.current=null,this.unaryOps=t.unaryOps,this.binaryOps=t.binaryOps,this.ternaryOps=t.ternaryOps,this.consts=t.consts,this.expression=e,this.savedPosition=0,this.savedCurrent=null,this.options=t.options,this.parser=t}au.prototype.toString=function(){return this.type+": "+this.value},su.prototype.newToken=function(t,e,n){return new au(t,e,null!=n?n:this.pos)},su.prototype.save=function(){this.savedPosition=this.pos,this.savedCurrent=this.current},su.prototype.restore=function(){this.pos=this.savedPosition,this.current=this.savedCurrent},su.prototype.next=function(){return this.pos>=this.expression.length?this.newToken("TEOF","EOF"):this.isWhitespace()||this.isComment()?this.next():this.isRadixInteger()||this.isNumber()||this.isOperator()||this.isString()||this.isParen()||this.isBracket()||this.isComma()||this.isSemicolon()||this.isNamedOp()||this.isConst()||this.isName()?this.current:void this.parseError('Unknown character "'+this.expression.charAt(this.pos)+'"')},su.prototype.isString=function(){var t=!1,e=this.pos,n=this.expression.charAt(e);if("'"===n||'"'===n)for(var r=this.expression.indexOf(n,e+1);r>=0&&this.pos<this.expression.length;){if(this.pos=r+1,"\\"!==this.expression.charAt(r-1)){var i=this.expression.substring(e+1,r);this.current=this.newToken("TSTRING",this.unescape(i),e),t=!0;break}r=this.expression.indexOf(n,r+1)}return t},su.prototype.isParen=function(){var t=this.expression.charAt(this.pos);return("("===t||")"===t)&&(this.current=this.newToken(ou,t),this.pos++,!0)},su.prototype.isBracket=function(){var t=this.expression.charAt(this.pos);return!("["!==t&&"]"!==t||!this.isOperatorEnabled("["))&&(this.current=this.newToken("TBRACKET",t),this.pos++,!0)},su.prototype.isComma=function(){return","===this.expression.charAt(this.pos)&&(this.current=this.newToken("TCOMMA",","),this.pos++,!0)},su.prototype.isSemicolon=function(){return";"===this.expression.charAt(this.pos)&&(this.current=this.newToken("TSEMICOLON",";"),this.pos++,!0)},su.prototype.isConst=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||"_"!==n&&"."!==n&&(n<"0"||n>"9")))break}if(e>t){var r=this.expression.substring(t,e);if(r in this.consts)return this.current=this.newToken("TNUMBER",this.consts[r]),this.pos+=r.length,!0}return!1},su.prototype.isNamedOp=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||"_"!==n&&(n<"0"||n>"9")))break}if(e>t){var r=this.expression.substring(t,e);if(this.isOperatorEnabled(r)&&(r in this.binaryOps||r in this.unaryOps||r in this.ternaryOps))return this.current=this.newToken(iu,r),this.pos+=r.length,!0}return!1},su.prototype.isName=function(){for(var t=this.pos,e=t,n=!1;e<this.expression.length;e++){var r=this.expression.charAt(e);if(r.toUpperCase()===r.toLowerCase()){if(e===this.pos&&("$"===r||"_"===r)){"_"===r&&(n=!0);continue}if(e===this.pos||!n||"_"!==r&&(r<"0"||r>"9"))break}else n=!0}if(n){var i=this.expression.substring(t,e);return this.current=this.newToken("TNAME",i),this.pos+=i.length,!0}return!1},su.prototype.isWhitespace=function(){for(var t=!1,e=this.expression.charAt(this.pos);!(" "!==e&&"\t"!==e&&"\n"!==e&&"\r"!==e||(t=!0,this.pos++,this.pos>=this.expression.length));)e=this.expression.charAt(this.pos);return t};var lu=/^[0-9a-f]{4}$/i;su.prototype.unescape=function(t){var e=t.indexOf("\\");if(e<0)return t;for(var n=t.substring(0,e);e>=0;){var r=t.charAt(++e);switch(r){case"'":n+="'";break;case'"':n+='"';break;case"\\":n+="\\";break;case"/":n+="/";break;case"b":n+="\b";break;case"f":n+="\f";break;case"n":n+="\n";break;case"r":n+="\r";break;case"t":n+="\t";break;case"u":var i=t.substring(e+1,e+5);lu.test(i)||this.parseError("Illegal escape sequence: \\u"+i),n+=String.fromCharCode(parseInt(i,16)),e+=4;break;default:throw this.parseError('Illegal escape sequence: "\\'+r+'"')}++e;var o=t.indexOf("\\",e);n+=t.substring(e,o<0?t.length:o),e=o}return n},su.prototype.isComment=function(){return"/"===this.expression.charAt(this.pos)&&"*"===this.expression.charAt(this.pos+1)&&(this.pos=this.expression.indexOf("*/",this.pos)+2,1===this.pos&&(this.pos=this.expression.length),!0)},su.prototype.isRadixInteger=function(){var t,e,n=this.pos;if(n>=this.expression.length-2||"0"!==this.expression.charAt(n))return!1;if(++n,"x"===this.expression.charAt(n))t=16,e=/^[0-9a-f]$/i,++n;else{if("b"!==this.expression.charAt(n))return!1;t=2,e=/^[01]$/i,++n}for(var r=!1,i=n;n<this.expression.length;){var o=this.expression.charAt(n);if(!e.test(o))break;n++,r=!0}return r&&(this.current=this.newToken("TNUMBER",parseInt(this.expression.substring(i,n),t)),this.pos=n),r},su.prototype.isNumber=function(){for(var t,e=!1,n=this.pos,r=n,i=n,o=!1,a=!1;n<this.expression.length&&((t=this.expression.charAt(n))>="0"&&t<="9"||!o&&"."===t);)"."===t?o=!0:a=!0,n++,e=a;if(e&&(i=n),"e"===t||"E"===t){n++;for(var s=!0,l=!1;n<this.expression.length;){if(t=this.expression.charAt(n),!s||"+"!==t&&"-"!==t){if(!(t>="0"&&t<="9"))break;l=!0,s=!1}else s=!1;n++}l||(n=i)}return e?(this.current=this.newToken("TNUMBER",parseFloat(this.expression.substring(r,n))),this.pos=n):this.pos=i,e},su.prototype.isOperator=function(){var t=this.pos,e=this.expression.charAt(this.pos);if("+"===e||"-"===e||"*"===e||"/"===e||"%"===e||"^"===e||"?"===e||":"===e||"."===e)this.current=this.newToken(iu,e);else if("∙"===e||"•"===e)this.current=this.newToken(iu,"*");else if(">"===e)"="===this.expression.charAt(this.pos+1)?(this.current=this.newToken(iu,">="),this.pos++):this.current=this.newToken(iu,">");else if("<"===e)"="===this.expression.charAt(this.pos+1)?(this.current=this.newToken(iu,"<="),this.pos++):this.current=this.newToken(iu,"<");else if("|"===e){if("|"!==this.expression.charAt(this.pos+1))return!1;this.current=this.newToken(iu,"||"),this.pos++}else if("="===e)"="===this.expression.charAt(this.pos+1)?(this.current=this.newToken(iu,"=="),this.pos++):this.current=this.newToken(iu,e);else{if("!"!==e)return!1;"="===this.expression.charAt(this.pos+1)?(this.current=this.newToken(iu,"!="),this.pos++):this.current=this.newToken(iu,e)}return this.pos++,!!this.isOperatorEnabled(this.current.value)||(this.pos=t,!1)},su.prototype.isOperatorEnabled=function(t){return this.parser.isOperatorEnabled(t)},su.prototype.getCoordinates=function(){var t,e=0,n=-1;do{e++,t=this.pos-n,n=this.expression.indexOf("\n",n+1)}while(n>=0&&n<this.pos);return{line:e,column:t}},su.prototype.parseError=function(t){var e=this.getCoordinates();throw new Error("parse error ["+e.line+":"+e.column+"]: "+t)};var cu="IEXPR";function uu(t,e){this.type=t,this.value=null!=e?e:0}function du(t){return new uu("IOP1",t)}function fu(t){return new uu("IOP2",t)}function hu(t,e,n){this.parser=t,this.tokens=e,this.current=null,this.nextToken=null,this.next(),this.savedCurrent=null,this.savedNextToken=null,this.allowMemberAccess=!1!==n.allowMemberAccess}uu.prototype.toString=function(){switch(this.type){case"INUMBER":case"IOP1":case"IOP2":case"IOP3":case"IVAR":case"IVARNAME":case"IENDSTATEMENT":return this.value;case"IFUNCALL":return"CALL "+this.value;case"IFUNDEF":return"DEF "+this.value;case"IARRAY":return"ARRAY "+this.value;case"IMEMBER":return"."+this.value;default:return"Invalid Instruction"}},hu.prototype.next=function(){return this.current=this.nextToken,this.nextToken=this.tokens.next()},hu.prototype.tokenMatches=function(t,e){return void 0===e||(Array.isArray(e)?function(t,e){for(var n=0;n<t.length;n++)if(t[n]===e)return!0;return!1}(e,t.value):"function"==typeof e?e(t):t.value===e)},hu.prototype.save=function(){this.savedCurrent=this.current,this.savedNextToken=this.nextToken,this.tokens.save()},hu.prototype.restore=function(){this.tokens.restore(),this.current=this.savedCurrent,this.nextToken=this.savedNextToken},hu.prototype.accept=function(t,e){return!(this.nextToken.type!==t||!this.tokenMatches(this.nextToken,e))&&(this.next(),!0)},hu.prototype.expect=function(t,e){if(!this.accept(t,e)){var n=this.tokens.getCoordinates();throw new Error("parse error ["+n.line+":"+n.column+"]: Expected "+(e||t))}},hu.prototype.parseAtom=function(t){var e=this.tokens.unaryOps;if(this.accept("TNAME")||this.accept(iu,(function(t){return t.value in e})))t.push(new uu("IVAR",this.current.value));else if(this.accept("TNUMBER"))t.push(new uu("INUMBER",this.current.value));else if(this.accept("TSTRING"))t.push(new uu("INUMBER",this.current.value));else if(this.accept(ou,"("))this.parseExpression(t),this.expect(ou,")");else{if(!this.accept("TBRACKET","["))throw new Error("unexpected "+this.nextToken);if(this.accept("TBRACKET","]"))t.push(new uu("IARRAY",0));else{var n=this.parseArrayList(t);t.push(new uu("IARRAY",n))}}},hu.prototype.parseExpression=function(t){var e=[];this.parseUntilEndStatement(t,e)||(this.parseVariableAssignmentExpression(e),this.parseUntilEndStatement(t,e)||this.pushExpression(t,e))},hu.prototype.pushExpression=function(t,e){for(var n=0,r=e.length;n<r;n++)t.push(e[n])},hu.prototype.parseUntilEndStatement=function(t,e){return!!this.accept("TSEMICOLON")&&(!this.nextToken||"TEOF"===this.nextToken.type||this.nextToken.type===ou&&")"===this.nextToken.value||e.push(new uu("IENDSTATEMENT")),"TEOF"!==this.nextToken.type&&this.parseExpression(e),t.push(new uu(cu,e)),!0)},hu.prototype.parseArrayList=function(t){for(var e=0;!this.accept("TBRACKET","]");)for(this.parseExpression(t),++e;this.accept("TCOMMA");)this.parseExpression(t),++e;return e},hu.prototype.parseVariableAssignmentExpression=function(t){for(this.parseConditionalExpression(t);this.accept(iu,"=");){var e=t.pop(),n=[],r=t.length-1;if("IFUNCALL"!==e.type){if("IVAR"!==e.type&&"IMEMBER"!==e.type)throw new Error("expected variable for assignment");this.parseVariableAssignmentExpression(n),t.push(new uu("IVARNAME",e.value)),t.push(new uu(cu,n)),t.push(fu("="))}else{if(!this.tokens.isOperatorEnabled("()="))throw new Error("function definition is not permitted");for(var i=0,o=e.value+1;i<o;i++){var a=r-i;"IVAR"===t[a].type&&(t[a]=new uu("IVARNAME",t[a].value))}this.parseVariableAssignmentExpression(n),t.push(new uu(cu,n)),t.push(new uu("IFUNDEF",e.value))}}},hu.prototype.parseConditionalExpression=function(t){for(this.parseOrExpression(t);this.accept(iu,"?");){var e=[],n=[];this.parseConditionalExpression(e),this.expect(iu,":"),this.parseConditionalExpression(n),t.push(new uu(cu,e)),t.push(new uu(cu,n)),t.push(new uu("IOP3","?"))}},hu.prototype.parseOrExpression=function(t){for(this.parseAndExpression(t);this.accept(iu,"or");){var e=[];this.parseAndExpression(e),t.push(new uu(cu,e)),t.push(fu("or"))}},hu.prototype.parseAndExpression=function(t){for(this.parseComparison(t);this.accept(iu,"and");){var e=[];this.parseComparison(e),t.push(new uu(cu,e)),t.push(fu("and"))}};var pu=["==","!=","<","<=",">=",">","in"];hu.prototype.parseComparison=function(t){for(this.parseAddSub(t);this.accept(iu,pu);){var e=this.current;this.parseAddSub(t),t.push(fu(e.value))}};var vu=["+","-","||"];hu.prototype.parseAddSub=function(t){for(this.parseTerm(t);this.accept(iu,vu);){var e=this.current;this.parseTerm(t),t.push(fu(e.value))}};var mu=["*","/","%"];function gu(t,e){return Number(t)+Number(e)}function bu(t,e){return t-e}function _u(t,e){return t*e}function yu(t,e){return t/e}function wu(t,e){return t%e}function xu(t,e){return t===e}function ku(t,e){return t!==e}function Nu(t,e){return t>e}function Tu(t,e){return t<e}function Ou(t,e){return t>=e}function Cu(t,e){return t<=e}function Mu(t,e){return Boolean(t&&e)}function Au(t,e){return Boolean(t||e)}function Eu(t){return Math.log(t)*Math.LOG10E}function Su(t){return-t}function ju(t){return!t}function Iu(t){return t<0?Math.ceil(t):Math.floor(t)}function Lu(t){return Math.random()*(t||1)}function Pu(t){return Array.isArray(t)?t.length:String(t).length}function Ru(t,e,n){return t?e:n}function Du(t,e){return void 0===e||0==+e?Math.round(t):(t=+t,e=-+e,isNaN(t)||"number"!=typeof e||e%1!=0?NaN:(t=t.toString().split("e"),+((t=(t=Math.round(+(t[0]+"e"+(t[1]?+t[1]-e:-e)))).toString().split("e"))[0]+"e"+(t[1]?+t[1]+e:e))))}function zu(t,e){return t[0|e]}function Uu(t){return 1===arguments.length&&Array.isArray(t)?Math.max.apply(Math,t):Math.max.apply(Math,arguments)}function Hu(t){return 1===arguments.length&&Array.isArray(t)?Math.min.apply(Math,t):Math.min.apply(Math,arguments)}function Fu(t,e){if("function"!=typeof t)throw new Error("First argument to map is not a function");if(!Array.isArray(e))throw new Error("Second argument to map is not an array");return e.map((function(e,n){return t(e,n)}))}function $u(t,e,n){if("function"!=typeof t)throw new Error("First argument to fold is not a function");if(!Array.isArray(n))throw new Error("Second argument to fold is not an array");return n.reduce((function(e,n,r){return t(e,n,r)}),e)}function Bu(t,e){if("function"!=typeof t)throw new Error("First argument to filter is not a function");if(!Array.isArray(e))throw new Error("Second argument to filter is not an array");return e.filter((function(e,n){return t(e,n)}))}function qu(t){return(t>0)-(t<0)||+t}function Gu(t){return Math.log(1+t)}function Vu(t){return Math.log(t)/Math.LN2}function Wu(t){if(!Array.isArray(t))throw new Error("Sum argument is not an array");return t.reduce((function(t,e){return t+Number(e)}),0)}function Yu(t,e,n){var r,i,o,a,s,l,c=[];if(Xu(t))return Ju(t,n);for(var u=t.length,d=0;d<u;d++){var f=t[d],h=f.type;if("INUMBER"===h||"IVARNAME"===h)c.push(f.value);else if("IOP2"===h)i=c.pop(),r=c.pop(),"and"===f.value?c.push(!!r&&!!Yu(i,e,n)):"or"===f.value?c.push(!!r||!!Yu(i,e,n)):"="===f.value?(a=e.binaryOps[f.value],c.push(a(r,Yu(i,e,n),n))):(a=e.binaryOps[f.value],c.push(a(Ju(r,n),Ju(i,n))));else if("IOP3"===h)o=c.pop(),i=c.pop(),r=c.pop(),"?"===f.value?c.push(Yu(r?i:o,e,n)):(a=e.ternaryOps[f.value],c.push(a(Ju(r,n),Ju(i,n),Ju(o,n))));else if("IVAR"===h)if(f.value in e.functions)c.push(e.functions[f.value]);else if(f.value in e.unaryOps&&e.parser.isOperatorEnabled(f.value))c.push(e.unaryOps[f.value]);else{var p=n[f.value];if(void 0===p)throw new Error("undefined variable: "+f.value);c.push(p)}else if("IOP1"===h)r=c.pop(),a=e.unaryOps[f.value],c.push(a(Ju(r,n)));else if("IFUNCALL"===h){for(l=f.value,s=[];l-- >0;)s.unshift(Ju(c.pop(),n));if(!(a=c.pop()).apply||!a.call)throw new Error(a+" is not a function");c.push(a.apply(void 0,s))}else if("IFUNDEF"===h)c.push(function(){for(var t=c.pop(),r=[],i=f.value;i-- >0;)r.unshift(c.pop());var o=c.pop(),a=function(){for(var i=Object.assign({},n),o=0,a=r.length;o<a;o++)i[r[o]]=arguments[o];return Yu(t,e,i)};return Object.defineProperty(a,"name",{value:o,writable:!1}),n[o]=a,a}());else if(h===cu)c.push(Ku(f,e));else if("IEXPREVAL"===h)c.push(f);else if("IMEMBER"===h)r=c.pop(),c.push(r[f.value]);else if("IENDSTATEMENT"===h)c.pop();else{if("IARRAY"!==h)throw new Error("invalid Expression");for(l=f.value,s=[];l-- >0;)s.unshift(c.pop());c.push(s)}}if(c.length>1)throw new Error("invalid Expression (parity)");return 0===c[0]?0:Ju(c[0],n)}function Ku(t,e,n){return Xu(t)?t:{type:"IEXPREVAL",value:function(n){return Yu(t.value,e,n)}}}function Xu(t){return t&&"IEXPREVAL"===t.type}function Ju(t,e){return Xu(t)?t.value(e):t}function Qu(t,e){this.tokens=t,this.parser=e,this.unaryOps=e.unaryOps,this.binaryOps=e.binaryOps,this.ternaryOps=e.ternaryOps,this.functions=e.functions}function Zu(t){return t.trim()}function td(t){this.options=t||{},this.unaryOps={SIN:Math.sin,COS:Math.cos,TAN:Math.tan,ASIN:Math.asin,ACOS:Math.acos,ATAN:Math.atan,SQRT:Math.sqrt,LOG:Math.log,LOG2:Math.log2||Vu,LN:Math.log,LOG10:Math.log10||Eu,LG:Math.log10||Eu,LOG1P:Math.log1p||Gu,ABS:Math.abs,CEIL:Math.ceil,FLOOR:Math.floor,ISNULL:function(t){return null===t},TRUNC:Math.trunc||Iu,"-":Su,"+":Number,EXP:Math.exp,NOT:ju,LENGTH:Pu,"!":ju,SIGN:Math.sign||qu,TEXT:function(t){return e(t)?t.toISOString():String(t)},NUMBER:Number},this.binaryOps={"+":gu,"-":bu,"*":_u,"/":yu,"%":wu,"^":Math.pow,"==":xu,"!=":ku,">":Nu,"<":Tu,">=":Ou,"<=":Cu,and:Mu,or:Au,in:function(t,e){return Array.isArray(e)?e.includes(t):String(e).includes(t)},"[":zu},this.ternaryOps={"?":Ru};var e=function(t){return t instanceof Date&&!isNaN(t)},n=function(t){if(e(t))return t;try{var n=new Date(t);return e(n)?n:null}catch(t){return null}};function r(t){return(1===arguments.length&&Array.isArray(t)?t:Array.from(arguments)).slice(0).filter((function(t){return!isNaN(t)&&Number.isFinite(t)}))}var i=/\w*/g,o=/\w\S*/g,a=/[\\^$*+?.()|[\]{}]/g;try{i=new RegExp("\\p{L}*","ug"),o=new RegExp("[\\p{L}\\p{N}]\\S*","ug")}catch(t){}this.functions={IF:Ru,RANDOM:Lu,MIN:function(){var t=r.apply(this,arguments);return Hu(t)},MAX:function(){return Uu(r.apply(this,arguments))},SUM:function(){return Wu(r.apply(this,arguments))},MEAN:function(){var t=r.apply(this,arguments);return Wu(t)/t.length},MEDIAN:function(){var t=r.apply(this,arguments).sort((function(t,e){return t-e})),e=Math.floor(t.length/2);return t.length%2==1?t[e]:.5*(t[e-1]+t[e])},POW:Math.pow,ATAN2:Math.atan2,ROUND:Du,CONCAT:function(){return Array.from(arguments).join("")},TRIM:Zu,SUBSTR:function(t,e,n){return t.substr(e,n)},REPLACE:function(t,e,n){return t.replace(new RegExp(String(e).replace(a,"\\$&"),"g"),n)},REPLACE_REGEX:function(t,e,n){return t.replace(new RegExp(e,"g"),n)},SPLIT:function(t,e){return String(t).split(e)},LOWER:function(t){return String(t).toLowerCase()},UPPER:function(t){return String(t).toUpperCase()},PROPER:function(t){return String(t).replace(i,(function(t){return t.charAt(0).toUpperCase()+t.substr(1).toLowerCase()}))},TITLE:function(t){return String(t).replace(o,(function(t){return t.charAt(0).toUpperCase()+t.substr(1).toLowerCase()}))},SORT:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(!Array.isArray(t))throw new Error("First argument to SORT is not an array");return t.slice(0).sort((function(t,r){return((t="string"==typeof n?t[n]:"function"==typeof n?n(t):t)>(r="string"==typeof n?r[n]:"function"==typeof n?n(r):r)?1:t<r?-1:0)*(e?1:-1)}))},SLICE:function(t,e,n){if(!Array.isArray(t))throw new Error("First argument to SLICE is not an array");return t.slice(e,n)},JOIN:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(!Array.isArray(t))throw new Error("First argument to JOIN is not an array");return n?[t.slice(0,t.length-1).join(e),t[t.length-1]].join(n):t.join(e)},MAP:Fu,FOLD:$u,FILTER:Bu,PLUCK:function(t,e){if(!Array.isArray(t))throw new Error("First argument to PLUCK is not an array");return t.map((function(t){return t[e]}))},INDEXOF:function(t,e){return Array.isArray(t)||(t=String(t)),t.indexOf(e)},FIND:function(t,e){if(!Array.isArray(t))throw new Error("First argument to FIND is not an array");if("function"!=typeof e)throw new Error("Second argument to FIND is not a function");for(var n=t.length,r=0;r<n;r++)if(e(t[r]))return t[r];return null},RANGE:function(t,e,n){null==e&&(e=t||0,t=0),n||(n=e<t?-1:1);for(var r=Math.max(Math.ceil((e-t)/n),0),i=Array(r),o=0;o<r;o++,t+=n)i[o]=t;return i},EVERY:function(t,e){if(!Array.isArray(t))throw new Error("First argument to EVERY is not an array");if("function"!=typeof e)throw new Error("Second argument to EVERY is not a function");for(var n=t.length,r=!0,i=0;i<n;i++)if(!(r=r&&e(t[i])))return!1;return!0},SOME:function(t,e){if(!Array.isArray(t))throw new Error("First argument to SOME is not an array");if("function"!=typeof e)throw new Error("Second argument to SOME is not a function");for(var n=t.length,r=!1,i=0;i<n;i++)if(r=r||e(t[i]))return!0;return!1},DATE:function(){return arguments.length>1&&(arguments[1]=arguments[1]-1),ru(Date,Array.prototype.slice.call(arguments))},YEAR:function(t){return(t=n(t))?t.getFullYear():null},MONTH:function(t){return(t=n(t))?t.getMonth()+1:null},DAY:function(t){return(t=n(t))?t.getDate():null},WEEKDAY:function(t){return(t=n(t))?t.getDay():null},HOURS:function(t){return(t=n(t))?t.getHours():null},MINUTES:function(t){return(t=n(t))?t.getMinutes():null},SECONDS:function(t){return(t=n(t))?t.getSeconds():null},DATEDIFF:function(t,e){return t=n(t),e=n(e),t&&e?(e.getTime()-t.getTime())/864e5:null},TIMEDIFF:function(t,e){return t=n(t),e=n(e),t&&e?(e.getTime()-t.getTime())/1e3:null}},this.unaryOps.LOWER=this.functions.LOWER,this.unaryOps.UPPER=this.functions.UPPER,this.unaryOps.PROPER=this.functions.PROPER,this.unaryOps.TITLE=this.functions.TITLE,this.unaryOps.TRIM=this.functions.TRIM,this.unaryOps.YEAR=this.functions.YEAR,this.unaryOps.MONTH=this.functions.MONTH,this.unaryOps.DAY=this.functions.DAY,this.unaryOps.WEEKDAY=this.functions.WEEKDAY,this.unaryOps.HOURS=this.functions.HOURS,this.unaryOps.MINUTES=this.functions.MINUTES,this.unaryOps.SECONDS=this.functions.SECONDS,this.consts={E:Math.E,PI:Math.PI,TRUE:!0,FALSE:!1,NA:Number.NaN,NULL:Number.NaN}}hu.prototype.parseTerm=function(t){for(this.parseFactor(t);this.accept(iu,mu);){var e=this.current;this.parseFactor(t),t.push(fu(e.value))}},hu.prototype.parseFactor=function(t){var e=this.tokens.unaryOps;if(this.save(),this.accept(iu,(function(t){return t.value in e}))){if("-"!==this.current.value&&"+"!==this.current.value){if(this.nextToken.type===ou&&"("===this.nextToken.value)return this.restore(),void this.parseExponential(t);if("TSEMICOLON"===this.nextToken.type||"TCOMMA"===this.nextToken.type||"TEOF"===this.nextToken.type||this.nextToken.type===ou&&")"===this.nextToken.value)return this.restore(),void this.parseAtom(t)}var n=this.current;this.parseFactor(t),t.push(du(n.value))}else this.parseExponential(t)},hu.prototype.parseExponential=function(t){for(this.parsePostfixExpression(t);this.accept(iu,"^");)this.parseFactor(t),t.push(fu("^"))},hu.prototype.parsePostfixExpression=function(t){for(this.parseFunctionCall(t);this.accept(iu,"!");)t.push(du("!"))},hu.prototype.parseFunctionCall=function(t){var e=this.tokens.unaryOps;if(this.accept(iu,(function(t){return t.value in e}))){var n=this.current;this.parseAtom(t),t.push(du(n.value))}else for(this.parseMemberExpression(t);this.accept(ou,"(");)if(this.accept(ou,")"))t.push(new uu("IFUNCALL",0));else{var r=this.parseArgumentList(t);t.push(new uu("IFUNCALL",r))}},hu.prototype.parseArgumentList=function(t){for(var e=0;!this.accept(ou,")");)for(this.parseExpression(t),++e;this.accept("TCOMMA");)this.parseExpression(t),++e;return e},hu.prototype.parseMemberExpression=function(t){for(this.parseAtom(t);this.accept(iu,".")||this.accept("TBRACKET","[");){var e=this.current;if("."===e.value){if(!this.allowMemberAccess)throw new Error('unexpected ".", member access is not permitted');this.expect("TNAME"),t.push(new uu("IMEMBER",this.current.value))}else{if("["!==e.value)throw new Error("unexpected symbol: "+e.value);if(!this.tokens.isOperatorEnabled("["))throw new Error('unexpected "[]", arrays are disabled');this.parseExpression(t),this.expect("TBRACKET","]"),t.push(fu("["))}}},Qu.prototype.evaluate=function(t){return t=t||{},Yu(this.tokens,this,t)},Qu.prototype.variables=function(){return(this.tokens||[]).filter((function(t){return"IVAR"===t.type})).map((function(t){return t.value}))},td.prototype.parse=function(t){var e=[],n=new hu(this,new su(this,t),{allowMemberAccess:!0});return n.parseExpression(e),n.expect("TEOF","EOF"),new Qu(e,this)},td.prototype.evaluate=function(t,e){return this.parse(t).evaluate(e)};var ed=new td;td.parse=function(t){return ed.parse(t)},td.evaluate=function(t,e){return ed.parse(t).evaluate(e)},td.keywords=["ABS","ACOS","ACOSH","and","ASIN","ASINH","ATAN","ATAN2","ATANH","CBRT","CEIL","CONCAT","COS","COSH","DATEDIFF","DAY","E","EVERY","EXP","EXPM1","FIND","FLOOR","HOURS","IF","in","INDEXOF","ISNULL","JOIN","LENGTH","LN","LOG","LOG10","LOG1P","LOG2","LOWER","MAP","MAX","MEAN","MEDIAN","MIN","MINUTES","MONTH","NOT","NOT","or","PI","PLUCK","POW","PROPER","RANDOM","RANGE","REPLACE","REPLACE_REGEX","ROUND","SECONDS","SIGN","SIN","SINH","SLICE","SOME","SORT","SPLIT","SQRT","SUBSTR","SUM","TAN","TANH","TIMEDIFF","TITLE","TRIM","TRUNC","UPPER","WEEKDAY","YEAR"];var nd={"+":"add","-":"subtract","*":"multiply","/":"divide","%":"remainder","^":"power","!":"factorial","<":"comparison",">":"comparison","<=":"comparison",">=":"comparison","==":"comparison","!=":"comparison","||":"concatenate",AND:"logical",OR:"logical",NOT:"logical",IN:"logical","?":"conditional",":":"conditional","=":"assignment","[":"array","()=":"fndef"};td.prototype.isOperatorEnabled=function(t){var e=function(t){return Object.prototype.hasOwnProperty.call(nd,t)?nd[t]:t}(t),n=this.options.operators||{};return!(e in n&&!n[e])};var rd=/\{\{(.+?)\}\}/g;var id=/{{[^}]*}}/g;function od(t,e){return function(t){var e=t.type();if("text"===e)return[{l:"UPPERCASE",f:"UPPER(%x)"},{l:"lowercase",f:"LOWER(%x)"},{l:"TitleCase",f:"TITLE(%x)"},{l:"ProperCase",f:"PROPER(%x)"}];if("array"===e){var r=t.val(0)[0],i=[];return"object"===n(r)&&(i.push({l:"Blocks",f:'JOIN(MAP(TOOLTIP, %x), "")'}),Object.keys(r).forEach((function(t,e){i.push("number"==typeof r[t]?{l:"SUM $.".concat(t),f:'SUM(PLUCK(%x, "'.concat(t,'"))')}:"object"===n(r[t])&&r[t].getTime?{l:"JOIN $.".concat(t),f:"JOIN(MAP(f(x) = FORMAT(x.".concat(t,', "YYYY-MM"), %x), ", ")')}:{l:"JOIN $.".concat(t),f:'JOIN(PLUCK(%x, "'.concat(t,'"), ", ")')})}))),[{l:"Count",f:"LENGTH(%x)"}].concat(i)}return"object"===e?Object.keys(t.val(0)).map((function(t){return{l:"$.".concat(t),f:"%x.".concat(t)}})):Gi(e).map((function(t){var e=t.l,n=t.f;return{l:e,f:'FORMAT(%x, "'.concat(n,'")')}}))}(t).map((function(t){var e=t.l,n=t.f;return{label:e,action:function(t){t.fire("select",n)}}}))}var ad={acceptMigrationWarning:function(){var t=this.get().value;delete t.migrated,this.set({value:t})},handleScroll:function(t,e){this.refs[e?"coloredBody":"coloredTitle"].scrollTop=t.target.scrollTop,this.refs[e?"coloredBody":"coloredTitle"].scrollLeft=t.target.scrollLeft},handleCursorChange:function(t){var e=t.target,n=[];void 0!==e.selectionStart&&(n=[e.selectionStart,e.selectionEnd]),this.set({lastCursorPosition:n})},addColumn:function(t,e){var n=this.get(),r=n.lastFocus,i=n.lastCursorPosition,o=n.value;if(t){var a=tu(t.name()),s="{{ ".concat(e?e.replace("%x",a):a," }}"),l=i[0]<0?o[r].length:i[0],c=i[1]-i[0],u=o[r].substr(0,l),d=o[r].substr(l+c);o[r]="".concat(u).concat(s).concat(d),this.set({value:o})}}};function sd(){var t=this,e=this.get().value;this.set({scrollbarSize:ud(),internalTitle:e.title||"",internalBody:e.body||"",_updateValue:Dn((function(e){var n=e.title,r=e.body,i=t.get().value;i.title=n,i.body=r,t.set({value:i})}),500)})}function ld(t){var e=t.changed,n=t.current,r=t.previous;n._updateValue&&(e.internalTitle||e.internalBody)&&r&&n._updateValue({title:n.internalTitle,body:n.internalBody}),(e.title||e.body)&&r&&(n.title!==n.internalTitle&&this.set({internalTitle:n.title}),n.body!==n.internalBody&&this.set({internalBody:n.body}))}function cd(t,e,n,r){var i={FORMAT:function(t,e){return String(t)}};r&&(i.TOOLTIP=function(t){return String(t)});var o=[],a="";return""!==t&&(e.forEach((function(t){i[tu(t.name())]=t.val(0)})),a=t.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(id,(function(t){var e=t.substr(2,t.length-4).trim(),n=function(t,e){try{return function(t){var e={},n=new td;return t.replace(rd,(function(t,r){(r=r.trim())&&!e[r]&&(e[r]=n.parse(r))})),function(n){return gi(t.replace(rd,(function(t,r){var i=r.trim()?e[r.trim()].evaluate(n):"";return null===i?"":i})),"<a><abbr><address><b><big><blockquote><br/><br><caption><cite><code><col><colgroup><dd><del><details><dfn><div><dl><dt><em><figure><font><h1><h2><h3><h4><h5><h6><hr><hgroup><i><img><ins><kbd><li><mark><meter><ol><p><pre><q><s><small><span><strike><strong><sub><summary><sup><table><tbody><td><th><thead><tfoot><tr><tt><u><ul><wbr>")}}("{{ ".concat(e," }}"))(t),null}catch(t){return t.message}}(i,e);return n&&o.push(n),'<span class="var '.concat(n?"in":"",'valid">').concat(t,"</span>")}))),{text:a,errors:o}}function ud(){var t=document.createElement("div"),e=document.createElement("div");t.appendChild(e),t.style.position="absolute",t.style.visibility="hidden",t.style.width="100px",e.style.width="100%",document.body.appendChild(t);var n=e.getBoundingClientRect().width;t.style.overflowY="scroll";var r=e.getBoundingClientRect().width;return document.body.removeChild(t),n-r}function dd(t,e,n){var r=Object.create(t);return r.col=e[n],r}function fd(t,e,n){var r=Object.create(t);return r.err=e[n],r}function hd(t,e){var n;return{c:function(){(n=k("i")).className="fa fa-exclamation-triangle",j(n,"color","#c71e1d"),j(n,"margin-left","1ex"),A(n,"aria-hidden","true")},m:function(t,e){p(t,n,e)},d:function(t){t&&v(n)}}}function pd(t,e){var n,r,i,o,a,s,l,c,u,d,f,m,g,b,_,y,x,N,O=e.titleColors.text,E=!1,S=e.bodyColors.text,I=!1,L=rt("controls / tooltip-editor / mini-help","core");function R(){E=!0,t.set({internalTitle:s.value}),E=!1}function D(e){t.handleScroll(e,!1)}function z(e){t.handleCursorChange(e)}function U(e){t.handleCursorChange(e)}function H(e){t.handleCursorChange(e)}function F(e){t.handleCursorChange(e)}function $(e){t.set({lastFocus:"title"})}function B(){I=!0,t.set({internalBody:m.value}),I=!1}function q(e){t.handleScroll(e,!0)}function G(e){t.handleCursorChange(e)}function V(e){t.handleCursorChange(e)}function W(e){t.handleCursorChange(e)}function Y(e){t.handleCursorChange(e)}function K(e){t.set({lastFocus:"body"})}for(var X=e.errors.length&&vd(t,e),J=e.showAllColumns?e.columns:e.columns.slice(0,8),Q=[],Z=0;Z<J.length;Z+=1)Q[Z]=gd(t,dd(e,J,Z));var tt=e.columns.length>8&&bd(t,e);return{c:function(){n=k("div"),r=k("div"),i=k("div"),o=k("div"),a=T("\n            "),s=k("input"),l=T("\n        "),c=k("div"),u=k("div"),d=k("div"),f=T("\n            "),m=k("textarea"),g=T("\n        "),X&&X.c(),b=T("\n\n        "),_=k("p"),y=T("\n\n        "),x=k("div");for(var t=0;t<Q.length;t+=1)Q[t].c();N=T(" "),tt&&tt.c(),o.className="inner svelte-plb5xa",i.className="textarea single-line svelte-plb5xa",C(s,"input",R),C(s,"scroll",D),C(s,"input",z),C(s,"propertychange",U),C(s,"click",H),C(s,"keyup",F),C(s,"focus",$),s.placeholder=e.placeholderTitle,A(s,"type","text"),s.className="svelte-plb5xa",r.className="title svelte-plb5xa",j(d,"right",7+e.scrollbarSize+"px"),d.className="inner svelte-plb5xa",u.className="textarea svelte-plb5xa",C(m,"input",B),C(m,"scroll",q),C(m,"input",G),C(m,"propertychange",V),C(m,"click",W),C(m,"keyup",Y),C(m,"focus",K),m.rows="8",m.placeholder=e.placeholderBody,m.className="svelte-plb5xa",c.className="body svelte-plb5xa",_.className="mt-1 svelte-plb5xa",x.className="form form-horizontal insert-columns svelte-plb5xa",j(n,"margin-top","10px"),n.className="svelte-plb5xa",P(n,"disable-highlighting-on-focus",e.noSyntaxHighlighting)},m:function(v,w){p(v,n,w),h(n,r),h(r,i),h(i,o),o.innerHTML=O,t.refs.coloredTitle=o,h(r,a),h(r,s),s.value=e.internalTitle,h(n,l),h(n,c),h(c,u),h(u,d),d.innerHTML=S,t.refs.coloredBody=d,h(c,f),h(c,m),m.value=e.internalBody,h(n,g),X&&X.m(n,null),h(n,b),h(n,_),_.innerHTML=L,h(n,y),h(n,x);for(var k=0;k<Q.length;k+=1)Q[k].m(x,null);h(x,N),tt&&tt.m(x,null)},p:function(e,r){if(e.titleColors&&O!==(O=r.titleColors.text)&&(o.innerHTML=O),!E&&e.internalTitle&&(s.value=r.internalTitle),e.placeholderTitle&&(s.placeholder=r.placeholderTitle),e.bodyColors&&S!==(S=r.bodyColors.text)&&(d.innerHTML=S),e.scrollbarSize&&j(d,"right",7+r.scrollbarSize+"px"),!I&&e.internalBody&&(m.value=r.internalBody),e.placeholderBody&&(m.placeholder=r.placeholderBody),r.errors.length?X?X.p(e,r):((X=vd(t,r)).c(),X.m(n,b)):X&&(X.d(1),X=null),e.showAllColumns||e.columns){J=r.showAllColumns?r.columns:r.columns.slice(0,8);for(var i=0;i<J.length;i+=1){var a=dd(r,J,i);Q[i]?Q[i].p(e,a):(Q[i]=gd(t,a),Q[i].c(),Q[i].m(x,N))}for(;i<Q.length;i+=1)Q[i].d(1);Q.length=J.length}r.columns.length>8?tt?tt.p(e,r):((tt=bd(t,r)).c(),tt.m(x,null)):tt&&(tt.d(1),tt=null),e.noSyntaxHighlighting&&P(n,"disable-highlighting-on-focus",r.noSyntaxHighlighting)},d:function(e){e&&v(n),t.refs.coloredTitle===o&&(t.refs.coloredTitle=null),M(s,"input",R),M(s,"scroll",D),M(s,"input",z),M(s,"propertychange",U),M(s,"click",H),M(s,"keyup",F),M(s,"focus",$),t.refs.coloredBody===d&&(t.refs.coloredBody=null),M(m,"input",B),M(m,"scroll",q),M(m,"input",G),M(m,"propertychange",V),M(m,"click",W),M(m,"keyup",Y),M(m,"focus",K),X&&X.d(),w(Q,e),tt&&tt.d()}}}function vd(t,e){for(var n,r=e.errors,i=[],o=0;o<r.length;o+=1)i[o]=md(t,fd(e,r,o));return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=O()},m:function(t,e){for(var r=0;r<i.length;r+=1)i[r].m(t,e);p(t,n,e)},p:function(e,o){if(e.errors){r=o.errors;for(var a=0;a<r.length;a+=1){var s=fd(o,r,a);i[a]?i[a].p(e,s):(i[a]=md(t,s),i[a].c(),i[a].m(n.parentNode,n))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(t){w(i,t),t&&v(n)}}}function md(t,e){var n,r,i,o,a=rt("controls / tooltip-editor / err","core"),s=e.err;return{c:function(){n=k("p"),r=k("b"),i=T(" "),o=T(s),n.className="mini-help error svelte-plb5xa"},m:function(t,e){p(t,n,e),h(n,r),r.innerHTML=a,h(n,i),h(n,o)},p:function(t,e){t.errors&&s!==(s=e.err)&&S(o,s)},d:function(t){t&&v(n)}}}function gd(t,e){var n={split:!0,icon:"im im-plus",btnClass:"btn btn-mini btn-primary",label:it(e.col.name(),15),items:od(e.col)},r=new bo({root:t.root,store:t.store,data:n});return r.on("click",(function(n){t.addColumn(e.col)})),r.on("select",(function(n){t.addColumn(e.col,n)})),{c:function(){r._fragment.c()},m:function(t,e){r._mount(t,e)},p:function(t,n){e=n;var i={};(t.showAllColumns||t.columns)&&(i.label=it(e.col.name(),15)),(t.showAllColumns||t.columns)&&(i.items=od(e.col)),r._set(i)},d:function(t){r.destroy(t)}}}function bd(t,e){var n,r,i,o,a=e.showAllColumns?"fewer":"more";function s(n){n.preventDefault(),t.set({showAllColumns:!e.showAllColumns})}return{c:function(){n=k("a"),r=T("show "),i=T(a),o=T(" columns"),C(n,"click",s),n.href="#/show-all"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o)},p:function(t,n){e=n,t.showAllColumns&&a!==(a=e.showAllColumns?"fewer":"more")&&S(i,a)},d:function(t){t&&v(n),M(n,"click",s)}}}function _d(t,e){var n,r,i=rt("controls / tooltip-editor / migrated","core"),o={closeable:!0,type:"warning",visible:e.value.migrated},a=new gt({root:t.root,store:t.store,slots:{default:x()},data:o});return a.on("close",(function(e){t.acceptMigrationWarning()})),{c:function(){n=k("div"),r=k("div"),a._fragment.c(),n.className="mt-1 svelte-plb5xa",j(n,"margin-bottom","-1ex")},m:function(t,e){p(t,n,e),h(a._slotted.default,r),r.innerHTML=i,a._mount(n,null)},p:function(t,e){var n={};t.value&&(n.visible=e.value.migrated),a._set(n)},d:function(t){t&&v(n),a.destroy()}}}function yd(t){var e=this;X(this,t),this.refs={},this._state=u({open:!1,value:{enabled:!1,title:"",body:"",sticky:!1,migrated:!1},internalTitle:"",internalBody:"",_updateValue:null,isCluster:!1,showAllColumns:!1,disabled:!1,width:"100px",label:rt("controls / tooltip-editor / label","core"),columns:[],lastFocus:"title",lastCursorPosition:[-1,-1],placeholderTitle:rt("controls / tooltip-editor / title-placeholder","core"),placeholderBody:rt("controls / tooltip-editor / body-placeholder","core"),scrollbarSize:0,noSyntaxHighlighting:!0,help:rt("controls / tooltip-editor / help","core")},t.data),this._recompute({value:1,columns:1,title:1,placeholderTitle:1,isCluster:1,body:1,placeholderBody:1,bodyColors:1,titleColors:1},this._state),this._intro=!0,this._handlers.state=[ld],ld.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d=rt("controls / tooltip-editor / customize","core"),f={},p={};function v(n){t.set({open:!e.open})}var m=e.errors.length&&hd(),g=e.open&&pd(t,e),b=e.value.migrated&&e.errors.length&&_d(t,e),_={label:rt("controls / tooltip-editor / sticky","core"),help:rt("controls / tooltip-editor / sticky / help","core")};void 0!==e.value.sticky&&(_.value=e.value.sticky,f.value=!0);var y=new Yt({root:t.root,store:t.store,data:_,_bind:function(n,r){var i={};!f.value&&n.value&&(e.value.sticky=r.value,i.value=e.value),t._set(i),f={}}});t.root._beforecreate.push((function(){y._bind({value:1},y.get())}));var w={disabled:e.disabled,label:e.label,help:e.help};void 0!==e.value.enabled&&(w.value=e.value.enabled,p.value=!0);var N=new zc({root:t.root,store:t.store,slots:{default:x()},data:w,_bind:function(n,r){var i={};!p.value&&n.value&&(e.value.enabled=r.value,i.value=e.value),t._set(i),p={}}});return t.root._beforecreate.push((function(){N._bind({value:1},N.get())})),{c:function(){n=k("button"),r=k("noscript"),i=T("\n        "),o=k("i"),a=T("\n    "),m&&m.c(),s=T(" "),g&&g.c(),l=T(" "),b&&b.c(),c=T("\n    "),u=k("div"),y._fragment.c(),N._fragment.c(),o.className="fa",A(o,"aria-hidden","true"),j(o,"margin-left",".5ex"),P(o,"fa-angle-double-down",!e.open),P(o,"fa-angle-double-up",e.open),C(n,"click",v),n.className="btn mt-1 mb-1 svelte-plb5xa",P(n,"btn-active",e.open),u.className="mt-1 mb-3 svelte-plb5xa"},m:function(t,e){h(N._slotted.default,n),h(n,r),r.insertAdjacentHTML("beforebegin",d),h(n,i),h(n,o),h(N._slotted.default,a),m&&m.m(N._slotted.default,null),h(N._slotted.default,s),g&&g.m(N._slotted.default,null),h(N._slotted.default,l),b&&b.m(N._slotted.default,null),h(N._slotted.default,c),h(N._slotted.default,u),y._mount(u,null),N._mount(t,e)},p:function(r,i){e=i,r.open&&(P(o,"fa-angle-double-down",!e.open),P(o,"fa-angle-double-up",e.open),P(n,"btn-active",e.open)),e.errors.length?m||((m=hd()).c(),m.m(s.parentNode,s)):m&&(m.d(1),m=null),e.open?g?g.p(r,e):((g=pd(t,e)).c(),g.m(l.parentNode,l)):g&&(g.d(1),g=null),e.value.migrated&&e.errors.length?b?b.p(r,e):((b=_d(t,e)).c(),b.m(c.parentNode,c)):b&&(b.d(1),b=null);var a={};!f.value&&r.value&&(a.value=e.value.sticky,f.value=void 0!==e.value.sticky),y._set(a),f={};var u={};r.disabled&&(u.disabled=e.disabled),r.label&&(u.label=e.label),r.help&&(u.help=e.help),!p.value&&r.value&&(u.value=e.value.enabled,p.value=void 0!==e.value.enabled),N._set(u),p={}},d:function(t){M(n,"click",v),m&&m.d(),g&&g.d(),b&&b.d(),y.destroy(),N.destroy(t)}}}(this,this._state),this.root._oncreate.push((function(){sd.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(yd.prototype,tt),u(yd.prototype,ad),yd.prototype._recompute=function(t,e){var n,r;t.value&&(this._differs(e.title,e.title=e.value.title)&&(t.title=!0),this._differs(e.body,e.body=e.value.body)&&(t.body=!0)),t.columns&&this._differs(e.variables,e.variables=e.columns.map((function(t){return tu(t.name())})))&&(t.variables=!0),(t.title||t.columns||t.placeholderTitle||t.isCluster)&&this._differs(e.titleColors,e.titleColors=cd((n=e).title,n.columns,n.placeholderTitle,n.isCluster))&&(t.titleColors=!0),(t.body||t.columns||t.placeholderBody||t.isCluster)&&this._differs(e.bodyColors,e.bodyColors=cd((r=e).body,r.columns,r.placeholderBody,r.isCluster))&&(t.bodyColors=!0),(t.bodyColors||t.titleColors)&&this._differs(e.errors,e.errors=function(t){var e=t.bodyColors,n=t.titleColors;return[].concat(l(e.errors),l(n.errors)).map((function(t){return t.replace(/(\w+) is not defined/,(function(t,e){return'"'.concat(e,'" ')+rt("controls / tooltip-editor / err / not-defined","core")})).replace("unexpected token",rt("controls / tooltip-editor / err / unexpected-token","core"))}))}(e))&&(t.errors=!0)};var wd={focus:function(){this.refs.searchInput.focus()},blur:function(){this.refs.searchInput.blur()},onClick:function(t){this.set({open:!0}),this.fire("focus",t)},search:function(t){this.set({open:!0}),this.fire("search",{query:t})},select:function(t,e){this.set({selectedItem:t,query:t.title||t.display||t.name,open:!1}),e&&e.stopPropagation(),this.fire("select",{item:t}),this.hover(null)},hover:function(t){this.fire("hover",{item:t})},keyup:function(t){if(t){if(13===t.keyCode){var e=this.get().selectedItem;this.select(e)}if(38===t.keyCode||40===t.keyCode){var n=this.get(),r=n.selectedIndex,i=n.matches;isNaN(r)&&(r=-1);var o=i.length||0;38===t.keyCode&&(r=(r-1+o)%o),40===t.keyCode&&(r=(r+1)%o),this.set({selectedIndex:r,selectedItem:i[r]})}27===t.keyCode&&(this.set({open:!1}),this.blur())}}};function xd(t){var e=t.changed,n=t.current;if(e.selectedIndex&&this.refs.dropdown){var r=this.refs.dropdown,i=n.selectedIndex,o=r.children[i].getBoundingClientRect(),a=r.getBoundingClientRect();o.y+o.height-a.y>a.height?r.scrollBy(0,o.y+o.height-a.y-a.height+5):o.y-a.y<0&&r.scrollBy(0,o.y-a.y-5)}}function kd(t){var e=this._svelte,n=e.component,r=e.ctx;n.hover(r.item)}function Nd(t){var e=this._svelte,n=e.component,r=e.ctx;n.select(r.item,t)}function Td(t,e,n){var r=Object.create(t);return r.item=e[n],r.i=n,r}function Od(t,e){var n,r;return{c:function(){(n=k("i")).className=r="icon "+e.icon+" svelte-6lqhz6"},m:function(t,e){p(t,n,e)},p:function(t,e){t.icon&&r!==(r="icon "+e.icon+" svelte-6lqhz6")&&(n.className=r)},d:function(t){t&&v(n)}}}function Cd(t,e){for(var n,r=e.matches,i=[],o=0;o<r.length;o+=1)i[o]=Md(t,Td(e,r,o));return{c:function(){n=k("ul");for(var t=0;t<i.length;t+=1)i[t].c();n.className="dropdown-results svelte-6lqhz6"},m:function(e,r){p(e,n,r);for(var o=0;o<i.length;o+=1)i[o].m(n,null);t.refs.dropdown=n},p:function(e,o){if(e.selectedIndex||e.matches){r=o.matches;for(var a=0;a<r.length;a+=1){var s=Td(o,r,a);i[a]?i[a].p(e,s):(i[a]=Md(t,s),i[a].c(),i[a].m(n,null))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(e){e&&v(n),w(i,e),t.refs.dropdown===n&&(t.refs.dropdown=null)}}}function Md(t,e){var n,r,i,o,a,s=e.item.display||e.item.title||e.item.name;return{c:function(){n=k("li"),r=k("noscript"),i=T("\n            "),n._svelte={component:t,ctx:e},C(n,"click",Nd),C(n,"mouseenter",kd),n.className=o=(e.i==e.selectedIndex?"selected":"")+" svelte-6lqhz6",n.style.cssText=a=e.item.style||""},m:function(t,e){p(t,n,e),h(n,r),r.insertAdjacentHTML("beforebegin",s),h(n,i)},p:function(t,i){e=i,t.matches&&s!==(s=e.item.display||e.item.title||e.item.name)&&(!function(t){for(;t.previousSibling;)t.parentNode.removeChild(t.previousSibling)}(r),r.insertAdjacentHTML("beforebegin",s)),n._svelte.ctx=e,t.selectedIndex&&o!==(o=(e.i==e.selectedIndex?"selected":"")+" svelte-6lqhz6")&&(n.className=o),t.matches&&a!==(a=e.item.style||"")&&(n.style.cssText=a)},d:function(t){t&&v(n),M(n,"click",Nd),M(n,"mouseenter",kd)}}}function Ad(t){var e=this;X(this,t),this.refs={},this._state=u({selection:"",query:"",icon:!1,placeholder:"",filter:"indexOf",selectedItem:void 0,selectedIndex:void 0,searching:!1,open:!1,items:[]},t.data),this._recompute({query:1,items:1,filter:1},this._state),this._intro=!0,this._handlers.update=[xd],this._slotted=t.slots||{},this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d,f=!1,m=t._slotted.button;function g(e){t.set({open:!1})}function _(){f=!0,t.set({query:i.value}),f=!1}function y(e){t.keyup(e)}function w(n){t.search(e.query)}window.addEventListener("click",g);var x=e.icon&&Od(t,e);function N(e){t.set({open:!0})}var O=e.open&&e.matches.length&&Cd(t,e);function E(e){t.onClick(e)}function S(t){t.stopPropagation()}function j(e){t.hover(null)}return{c:function(){n=k("div"),r=k("div"),i=k("input"),a=T("\n\n        "),x&&x.c(),s=T("\n\n        "),l=k("div"),m||((c=k("button")).innerHTML='<span class="caret"></span>'),u=T("\n\n        "),O&&O.c(),C(i,"input",_),C(i,"keydown",y),C(i,"input",w),A(i,"type","search"),i.placeholder=o=e.open?e.placeholder:e.selection||e.placeholder,i.className="svelte-6lqhz6",m||(C(c,"click",N),c.className="btn btn-small btn-primary svelte-6lqhz6"),l.className="btn-wrap svelte-6lqhz6",C(r,"click",E),r.className=d="dropdown "+(e.icon?"icon":"")+" "+(!e.open&&e.selection?"selection":"")+" svelte-6lqhz6",C(n,"click",S),C(n,"mouseleave",j),n.className="control-group vis-option-group vis-option-type-select"},m:function(o,d){p(o,n,d),h(n,r),h(r,i),t.refs.searchInput=i,i.value=e.query,h(r,a),x&&x.m(r,null),h(r,s),h(r,l),h(l,m||c),h(r,u),O&&O.m(r,null)},p:function(n,a){e=a,!f&&n.query&&(i.value=e.query),(n.open||n.placeholder||n.selection)&&o!==(o=e.open?e.placeholder:e.selection||e.placeholder)&&(i.placeholder=o),e.icon?x?x.p(n,e):((x=Od(t,e)).c(),x.m(r,s)):x&&(x.d(1),x=null),e.open&&e.matches.length?O?O.p(n,e):((O=Cd(t,e)).c(),O.m(r,null)):O&&(O.d(1),O=null),(n.icon||n.open||n.selection)&&d!==(d="dropdown "+(e.icon?"icon":"")+" "+(!e.open&&e.selection?"selection":"")+" svelte-6lqhz6")&&(r.className=d)},d:function(e){window.removeEventListener("click",g),e&&v(n),M(i,"input",_),M(i,"keydown",y),M(i,"input",w),t.refs.searchInput===i&&(t.refs.searchInput=null),x&&x.d(),m?b(l,m):M(c,"click",N),O&&O.d(),M(r,"click",E),M(n,"click",S),M(n,"mouseleave",j)}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(Ad.prototype,tt),u(Ad.prototype,wd),Ad.prototype._recompute=function(t,e){var n,r,i;(t.query||t.items||t.filter)&&this._differs(e.matches,e.matches=(r=(n=e).query,i=n.items,n.filter&&r?i&&i.filter?i.filter((function(t){return(t.search||t.title||t.name).toLowerCase().indexOf(r.toLowerCase())>-1})):[]:i))&&(t.matches=!0)};var Ed=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")};var Sd=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t};var jd=function(t,e){return!e||"object"!==n(e)&&"function"!=typeof e?Sd(t):e},Id=e((function(t){function e(n){return t.exports=e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},e(n)}t.exports=e}));var Ld=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&eu(t,e)};var Pd=function(t){return-1!==Function.toString.call(t).indexOf("[native code]")},Rd=e((function(t){function e(n){var r="function"==typeof Map?new Map:void 0;return t.exports=e=function(t){if(null===t||!Pd(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,e)}function e(){return ru(t,arguments,Id(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),eu(e,t)},e(n)}t.exports=e}));var Dd=function(t,e){if(null==t)return{};var n,r,i={},o=Object.keys(t);for(r=0;r<o.length;r++)n=o[r],e.indexOf(n)>=0||(i[n]=t[n]);return i};var zd=function(t,e){if(null==t)return{};var n,r,i=Dd(t,e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(r=0;r<o.length;r++)n=o[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(i[n]=t[n])}return i},Ud=e((function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function i(){}function o(e,n,o){if("undefined"!=typeof document){"number"==typeof(o=t({path:"/"},i.defaults,o)).expires&&(o.expires=new Date(1*new Date+864e5*o.expires)),o.expires=o.expires?o.expires.toUTCString():"";try{var a=JSON.stringify(n);/^[\{\[]/.test(a)&&(n=a)}catch(t){}n=r.write?r.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var l in o)o[l]&&(s+="; "+l,!0!==o[l]&&(s+="="+o[l].split(";")[0]));return document.cookie=e+"="+n+s}}function a(t,n){if("undefined"!=typeof document){for(var i={},o=document.cookie?document.cookie.split("; "):[],a=0;a<o.length;a++){var s=o[a].split("="),l=s.slice(1).join("=");n||'"'!==l.charAt(0)||(l=l.slice(1,-1));try{var c=e(s[0]);if(l=(r.read||r)(l,c)||e(l),n)try{l=JSON.parse(l)}catch(t){}if(i[c]=l,t===c)break}catch(t){}}return t?i[t]:i}}return i.set=o,i.get=function(t){return a(t,!1)},i.getJSON=function(t){return a(t,!0)},i.remove=function(e,n){o(e,"",t(n,{expires:-1}))},i.defaults={},i.withConverter=n,i}((function(){}))},t.exports=n()}));function Hd(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function Fd(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?Hd(Object(r),!0).forEach((function(n){t(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Hd(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var $d=new Set(["get","head","options","trace"]);function Bd(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=Fd({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e,{headers:Fd({"Content-Type":"application/json"},e.headers)}),i=r.payload,o=r.baseUrl,a=r.fetch,s=r.raw,l=zd(r,["payload","baseUrl","fetch","raw"]),c="".concat(o.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(i&&(l.body=JSON.stringify(i)),$d.has(l.method.toLowerCase()))n=a(c,l);else{var u=Ud.get("crumb");u?(l.headers["X-CSRF-Token"]=u,n=a(c,l)):n=Bd("/v3/me",{fetch:a,baseUrl:o}).then((function(){var t=Ud.get("crumb");t&&(l.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return a(c,l)}))}return n.then((function(t){if(s)return t;if(!t.ok)throw new Yd(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}var qd=Bd.get=Wd("GET"),Gd=Bd.patch=Wd("PATCH"),Vd=(Bd.put=Wd("PUT"),Bd.post=Wd("POST"));Bd.head=Wd("HEAD");function Wd(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return Bd(e,Fd({},n,{method:t}))}}Bd.delete=Wd("DELETE");var Yd=function(t){function e(t){var n;return Ed(this,e),(n=jd(this,Id(e).call(this))).name="HttpReqError",n.status=t.status,n.statusText=t.statusText,n.message="[".concat(t.status,"] ").concat(t.statusText),n.response=t,n}return Ld(e,t),e}(Rd(Error));function Kd(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}var Xd=[{value:"owner",label:rt("teams / role / owner").replace("&shy;","")},{value:"admin",label:rt("teams / role / admin").replace("&shy;","")},{value:"member",label:rt("teams / role / member").replace("&shy;","")}],Jd=Kc;function Qd(t){return{member:rt("teams / role / member"),admin:rt("teams / role / admin"),owner:rt("teams / role / owner")}[t]}var Zd={toggleEdit:function(t){this.get().editId===t?(this.set({editId:!1}),this.updateRole(t)):this.set({editId:t})},removeUser:function(t){try{var e=this;if(!window.confirm(rt("teams / remove / alert")))return;return Kd(Bd.delete("/v3/teams/".concat(e.get().team.id,"/members/").concat(t.id)),(function(){var n=e.get().users;n=n.filter((function(e){return e.id!==t.id})),e.set({users:n})}))}catch(t){return Promise.reject(t)}},updateRole:function(t){try{var e=this,n=e.get(),r=n.updating,i=n.users.filter((function(e){return e.id===t}))[0];return r[i.id]=!0,e.set({updating:r}),Kd(Bd.put("/v3/teams/".concat(e.get().team.id,"/members/").concat(i.id,"/status"),{payload:{status:i.role}}),(function(){(r=e.get().updating)[i.id]=!1,e.set({updating:r})}))}catch(t){return Promise.reject(t)}}};function tf(t){var e=this._svelte,n=e.component,r=e.ctx;n.removeUser(r.user)}function ef(t){var e=this._svelte,n=e.component,r=e.ctx;n.toggleEdit(r.user.id)}function nf(t){var e=this._svelte,n=e.component,r=e.ctx;n.toggleEdit(r.user.id)}function rf(t,e,n){var r=Object.create(t);return r.user=e[n],r.each_value=e,r.i=n,r}function of(t,e){var n,r=rt("teams / total").replace("%i%",e.numUsers);return{c:function(){n=T(r)},m:function(t,e){p(t,n,e)},p:function(t,e){t.numUsers&&r!==(r=rt("teams / total").replace("%i%",e.numUsers))&&S(n,r)},d:function(t){t&&v(n)}}}function af(t,e){var n,r=rt("teams / total / 1");return{c:function(){n=T(r)},m:function(t,e){p(t,n,e)},p:c,d:function(t){t&&v(n)}}}function sf(t,e){for(var n,r=e.sortedUsers,i=[],o=0;o<r.length;o+=1)i[o]=mf(t,rf(e,r,o));var a={columnHeaders:e.userHeaders},s=new Jd({root:t.root,store:t.store,slots:{default:x()},data:a});return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=O(),s._fragment.c()},m:function(t,e){for(var r=0;r<i.length;r+=1)i[r].m(s._slotted.default,null);h(s._slotted.default,n),s._mount(t,e)},p:function(e,o){if(e.isAdmin||e.isTeamOwner||e.sortedUsers||e.editId||e.updating||e.roles){r=o.sortedUsers;for(var a=0;a<r.length;a+=1){var l=rf(o,r,a);i[a]?i[a].p(e,l):(i[a]=mf(t,l),i[a].c(),i[a].m(n.parentNode,n))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}var c={};e.userHeaders&&(c.columnHeaders=o.userHeaders),s._set(c)},d:function(t){w(i,t),s.destroy(t)}}}function lf(t,e){var n,r,i,o,a=e.user.id;return{c:function(){n=k("td"),r=k("a"),i=T(a),r.href=o="/admin/users/"+e.user.id},m:function(t,e){p(t,n,e),h(n,r),h(r,i)},p:function(t,e){t.sortedUsers&&a!==(a=e.user.id)&&S(i,a),t.sortedUsers&&o!==(o="/admin/users/"+e.user.id)&&(r.href=o)},d:function(t){t&&v(n)}}}function cf(t,e){var n,r,i,o,a=Qd(e.user.role),s=e.user.token&&df();return{c:function(){n=k("noscript"),r=k("noscript"),i=T(" "),s&&s.c(),o=O()},m:function(t,e){p(t,n,e),n.insertAdjacentHTML("afterend",a),p(t,r,e),p(t,i,e),s&&s.m(t,e),p(t,o,e)},p:function(t,e){t.sortedUsers&&a!==(a=Qd(e.user.role))&&(m(n,r),n.insertAdjacentHTML("afterend",a)),e.user.token?s||((s=df()).c(),s.m(o.parentNode,o)):s&&(s.d(1),s=null)},d:function(t){t&&(m(n,r),v(n),v(r),v(i)),s&&s.d(t),t&&v(o)}}}function uf(t,e){var n={},r={label:"",width:"200px",labelWidth:"0px",help:rt("teams / role / p"),options:e.roles};void 0!==e.user.role&&(r.value=e.user.role,n.value=!0);var i=new oc({root:t.root,store:t.store,data:r,_bind:function(r,i){var o={};!n.value&&r.value&&(e.user.role=i.value,o.sortedUsers=e.sortedUsers),t._set(o),n={}}});return t.root._beforecreate.push((function(){i._bind({value:1},i.get())})),{c:function(){i._fragment.c()},m:function(t,e){i._mount(t,e)},p:function(t,r){e=r;var o={};t.roles&&(o.options=e.roles),!n.value&&t.sortedUsers&&(o.value=e.user.role,n.value=void 0!==e.user.role),i._set(o),n={}},d:function(t){i.destroy(t)}}}function df(t,e){var n,r,i=rt("teams / invite-pending");return{c:function(){n=k("i"),r=T(i)},m:function(t,e){p(t,n,e),h(n,r)},d:function(t){t&&v(n)}}}function ff(t,e){var n;function r(t){return t.editId===t.user.id?vf:t.updating[t.user.id]?pf:hf}var i=r(e),o=i(t,e);return{c:function(){o.c(),n=O()},m:function(t,e){o.m(t,e),p(t,n,e)},p:function(e,a){i===(i=r(a))&&o?o.p(e,a):(o.d(1),(o=i(t,a)).c(),o.m(n.parentNode,n))},d:function(t){o.d(t),t&&v(n)}}}function hf(t,e){var n,r,i,o,a,s,l,c,u,d=rt("teams / edit"),f=rt("teams / remove");return{c:function(){n=k("button"),r=k("i"),i=T("  "),o=T(d),a=T("\n\n            "),s=k("button"),l=k("i"),c=T("  "),u=T(f),r.className="fa fa-edit",n._svelte={component:t,ctx:e},C(n,"click",ef),n.className="btn",l.className="fa fa-times",s._svelte={component:t,ctx:e},C(s,"click",tf),s.className="btn"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o),p(t,a,e),p(t,s,e),h(s,l),h(s,c),h(s,u)},p:function(t,r){e=r,n._svelte.ctx=e,s._svelte.ctx=e},d:function(t){t&&v(n),M(n,"click",ef),t&&(v(a),v(s)),M(s,"click",tf)}}}function pf(t,e){var n,r,i,o,a=rt("teams / save");return{c:function(){n=k("button"),r=k("i"),i=T("  "),o=T(a),r.className="fa fa-spin fa-circle-o-notch",n.disabled=!0,n.className="btn btn-primary"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o)},p:c,d:function(t){t&&v(n)}}}function vf(t,e){var n,r,i,o,a=rt("teams / save");return{c:function(){n=k("button"),r=k("i"),i=T("  "),o=T(a),r.className="fa fa-check",n._svelte={component:t,ctx:e},C(n,"click",nf),n.className="btn btn-primary"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o)},p:function(t,r){e=r,n._svelte.ctx=e},d:function(t){t&&v(n),M(n,"click",nf)}}}function mf(t,e){var n,r,i,o,a,s,l,c,u,d,f,m,g=e.user.email,b=e.user.charts,_=e.isAdmin&&lf(0,e);function y(t){return t.editId===t.user.id?uf:cf}var w=y(e),x=w(t,e),N=(e.isAdmin||e.isTeamOwner||!e.isTeamOwner&&"owner"!=e.user.role)&&ff(t,e);return{c:function(){n=k("tr"),r=k("td"),i=T(g),o=T("\n        "),_&&_.c(),a=T("\n        "),s=k("td"),l=T(b),c=T("\n        "),u=k("td"),x.c(),d=T("\n        "),f=k("td"),N&&N.c(),m=T("\n    ")},m:function(t,e){p(t,n,e),h(n,r),h(r,i),h(n,o),_&&_.m(n,null),h(n,a),h(n,s),h(s,l),h(n,c),h(n,u),x.m(u,null),h(n,d),h(n,f),N&&N.m(f,null),h(n,m)},p:function(e,r){e.sortedUsers&&g!==(g=r.user.email)&&S(i,g),r.isAdmin?_?_.p(e,r):((_=lf(0,r)).c(),_.m(n,a)):_&&(_.d(1),_=null),e.sortedUsers&&b!==(b=r.user.charts)&&S(l,b),w===(w=y(r))&&x?x.p(e,r):(x.d(1),(x=w(t,r)).c(),x.m(u,null)),r.isAdmin||r.isTeamOwner||!r.isTeamOwner&&"owner"!=r.user.role?N?N.p(e,r):((N=ff(t,r)).c(),N.m(f,null)):N&&(N.d(1),N=null)},d:function(t){t&&v(n),_&&_.d(),x.d(),N&&N.d()}}}function gf(t){X(this,t),this._state=u({editId:!1,updating:{},users:[]},t.data),this._recompute({isAdmin:1,isTeamOwner:1,users:1,numCharts:1,team:1},this._state),this._intro=!0,this._fragment=function(t,e){var n,r,i,o,a;function s(t){return 1===t.numUsers?af:t.numUsers>1?of:void 0}var l=s(e),c=l&&l(t,e),u=e.sortedUsers.length&&sf(t,e);return{c:function(){n=k("p"),c&&c.c(),r=T(" "),i=k("noscript"),o=T("\n\n"),u&&u.c(),a=O()},m:function(t,s){p(t,n,s),c&&c.m(n,null),h(n,r),h(n,i),i.insertAdjacentHTML("afterend",e.numChartsCaption),p(t,o,s),u&&u.m(t,s),p(t,a,s)},p:function(e,o){l===(l=s(o))&&c?c.p(e,o):(c&&c.d(1),(c=l&&l(t,o))&&c.c(),c&&c.m(n,r)),e.numChartsCaption&&(g(i),i.insertAdjacentHTML("afterend",o.numChartsCaption)),o.sortedUsers.length?u?u.p(e,o):((u=sf(t,o)).c(),u.m(a.parentNode,a)):u&&(u.d(1),u=null)},d:function(t){t&&v(n),c&&c.d(),t&&v(o),u&&u.d(t),t&&v(a)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function bf(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}u(gf.prototype,tt),u(gf.prototype,Zd),gf.prototype._recompute=function(t,e){var n,r,i,o,a;(t.isAdmin||t.isTeamOwner)&&this._differs(e.roles,e.roles=(r=(n=e).isAdmin,i=n.isTeamOwner,r||i?Xd:Xd.slice(1)))&&(t.roles=!0),(t.users||t.isAdmin)&&this._differs(e.sortedUsers,e.sortedUsers=function(t){var e=t.users,n=t.isAdmin;return e.sort((function(t,e){var n=["owner","admin","member"];return n.indexOf(t.role)>n.indexOf(e.role)?1:n.indexOf(t.role)<n.indexOf(e.role)?-1:t.email>e.email?1:t.email<e.email?-1:0})).filter((function(t){return n||!t.isAdmin}))}(e))&&(t.sortedUsers=!0),t.isAdmin&&this._differs(e.userHeaders,e.userHeaders=function(t){var e=t.isAdmin,n=[{title:rt("teams / user"),width:"25%"},{title:"ID",width:"10%"},{title:"Charts",width:"15%"},{title:rt("teams / status"),width:"15%"},{title:rt("teams / actions"),width:"30%"}];return e||n.splice(1,1),n}(e))&&(t.userHeaders=!0),t.users&&(this._differs(e.numUsers,e.numUsers=e.users.length)&&(t.numUsers=!0),this._differs(e.numCharts,e.numCharts=(o=e.users,a=0,o.forEach((function(t){a+=t.charts})),a))&&(t.numCharts=!0)),(t.numCharts||t.isAdmin||t.team)&&this._differs(e.numChartsCaption,e.numChartsCaption=function(t){var e=t.numCharts,n=t.isAdmin,r=t.team;return 1===e?rt("teams / charts-total / 1"):e>1?n?rt("teams / charts-total-admin").replace("%i%",e).replace("%link%","/admin/chart/by/".concat(r.id)):rt("teams / charts-total").replace("%i%",e):""}(e))&&(t.numChartsCaption=!0)};var _f={addUser:function(t){try{var e=this,n=e.get(),r=n.inviteeExists,i=n.inviteeUserId;if(!r)return;return e.set({currentAction:{updatingUsers:!0,isComplete:!1}}),bf(Vd("/v3/teams/".concat(e.get().team.id,"/members"),{raw:!0,payload:{userId:i,role:t}}),(function(n){var r=!n.ok;return bf(r?n.json():null,(function(r){var i={updatingUsers:!1,isComplete:!0,isError:!n.ok,errorCode:n.ok?null:n.status,responseData:r&&r.data?r.data:null,type:"add",role:t};e.set({currentAction:i}),e.fire("updateUsers")}),!r)}))}catch(t){return Promise.reject(t)}},inviteUser:function(t){try{var e=this,n=e.get().inviteeEmail;return e.set({currentAction:{updatingUsers:!0,isComplete:!1}}),bf(Vd("/v3/teams/".concat(e.get().team.id,"/invites"),{raw:!0,payload:{email:n,role:t}}),(function(n){var r=!n.ok;return bf(r?n.json():null,(function(r){var i={updatingUsers:!1,isComplete:!0,isError:!n.ok,errorCode:n.ok?null:n.status,responseData:r&&r.data?r.data:null,type:"invite",role:t};e.set({currentAction:i}),e.fire("updateUsers")}),!r)}))}catch(t){return Promise.reject(t)}},debounceCheckUser:function(){try{var t=this;if(!t.get().isAdmin)return;return window.clearTimeout(window.checkUser),t.set({inviteeExistsLoading:!0}),window.checkUser=setTimeout((function(){t.checkUser()}),200),bf()}catch(t){return Promise.reject(t)}},checkUser:function(){try{var t=this,e=t.get(),n=e.inviteeEmail;return e.isValidEmail?bf(qd("/v3/users?search=".concat(encodeURIComponent(n))),(function(e){t.set({inviteeExistsLoading:!1,inviteeExists:!1}),e.list.length>0&&(n=t.get().inviteeEmail,e.list.forEach((function(e){e.email.toLowerCase()===n.toLowerCase()&&t.set({inviteeExists:!0,inviteeUserId:e.id})})))})):void t.set({inviteeExistsLoading:!1})}catch(t){return Promise.reject(t)}}};function yf(){window.teamSettingsInvite=this}function wf(t){var e=t.changed;t.current,t.previous;e.inviteeEmail&&(this.set({inviteeExists:!1}),this.debounceCheckUser())}function xf(t){var e=this;X(this,t),this._state=u({inviteeEmail:"",currentAction:{updatingUsers:!1,isComplete:!1,isError:!1,errorCode:null,responseData:null,type:"",role:""}},t.data),this._recompute({inviteeEmail:1,currentAction:1,isAdmin:1,isTeamOwner:1,isValidEmail:1,inviteeExistsLoading:1,inviteeExists:1},this._state),this._intro=!0,this._handlers.state=[wf],wf.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n,r,i,o=!1;function a(){o=!0,t.set({inviteeEmail:r.value}),o=!1}var s={disabled:!e.isValidEmail,label:"<i class='fa "+(e.currentAction.updatingUsers?"fa-spin fa-circle-o-notch":"fa-envelope")+"'></i>  "+rt("teams / invite"),items:e.inviteOptions},l=new bo({root:t.root,store:t.store,data:s}),c={label:rt("teams / invite-user"),help:rt("teams / invite-user / help"),success:e.successMessage,error:e.errorMessage},u=new Ro({root:t.root,store:t.store,slots:{default:x()},data:c});return{c:function(){n=k("div"),r=k("input"),i=T(" \n        "),l._fragment.c(),u._fragment.c(),C(r,"input",a),A(r,"type","text"),r.width="1px",r.placeholder=rt("teams / invite-user / eg"),r.className="svelte-m6ws61",n.className="flex svelte-m6ws61"},m:function(t,o){h(u._slotted.default,n),h(n,r),r.value=e.inviteeEmail,h(n,i),l._mount(n,null),u._mount(t,o)},p:function(t,e){!o&&t.inviteeEmail&&(r.value=e.inviteeEmail);var n={};t.isValidEmail&&(n.disabled=!e.isValidEmail),t.currentAction&&(n.label="<i class='fa "+(e.currentAction.updatingUsers?"fa-spin fa-circle-o-notch":"fa-envelope")+"'></i>  "+rt("teams / invite")),t.inviteOptions&&(n.items=e.inviteOptions),l._set(n);var i={};t.successMessage&&(i.success=e.successMessage),t.errorMessage&&(i.error=e.errorMessage),u._set(i)},d:function(t){M(r,"input",a),l.destroy(),u.destroy(t)}}}(this,this._state),this.root._oncreate.push((function(){yf.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(xf.prototype,tt),u(xf.prototype,_f),xf.prototype._recompute=function(t,e){var n;(t.inviteeEmail||t.currentAction)&&(this._differs(e.successMessage,e.successMessage=function(t){var e=t.inviteeEmail,n=t.currentAction,r=n.isComplete,i=n.isError,o=n.type,a=n.role;if(r&&!i)return rt("teams / invite-user / ".concat(o," / success")).replace("$1",e).replace("$2",rt("teams / role / ".concat(a)))}(e))&&(t.successMessage=!0),this._differs(e.errorMessage,e.errorMessage=function(t){var e=t.inviteeEmail,n=t.currentAction,r=n.isComplete,i=n.isError,o=n.errorCode,a=n.responseData,s=n.type;if(r&&i){var l=[400,401,406].includes(o)?o:"other",c=406===o&&a&&a.maxTeamInvites?a.maxTeamInvites:null;return rt("teams / invite-user / ".concat(s," / error / ").concat(l)).replace("$1",e).replace("$2",c)}}(e))&&(t.errorMessage=!0)),t.inviteeEmail&&this._differs(e.isValidEmail,e.isValidEmail=(n=e.inviteeEmail,/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(n)))&&(t.isValidEmail=!0),(t.isAdmin||t.isTeamOwner||t.inviteeEmail||t.isValidEmail||t.inviteeExistsLoading||t.inviteeExists)&&this._differs(e.inviteOptions,e.inviteOptions=function(t){var e=t.isAdmin,n=t.isTeamOwner,r=(t.inviteeEmail,t.isValidEmail),i=t.inviteeExistsLoading,o=t.inviteeExists,a=[{label:'<i class="fa fa-envelope"></i> &nbsp;...'.concat(rt("teams / role / member")),disabled:!r,action:function(){teamSettingsInvite.inviteUser("member")}},{label:'<i class="fa fa-envelope"></i> &nbsp;...'.concat(rt("teams / role / admin")),disabled:!r,action:function(){teamSettingsInvite.inviteUser("admin")}}];return(e||n)&&a.push({label:'<i class="fa fa-envelope"></i> &nbsp;...'.concat(rt("teams / role / owner")),disabled:!r,action:function(){teamSettingsInvite.inviteUser("owner")}}),e&&a.push({label:'<span class="red"><i class="fa '.concat(i?"fa-spin fa-circle-o-notch":"fa-plus",'"></i> &nbsp;').concat(rt("teams / add-as").replace("%s",rt("teams / role / member")),"</span>"),disabled:!o,action:function(){teamSettingsInvite.addUser("member")}},{label:'<span class="red"><i class="fa '.concat(i?"fa-spin fa-circle-o-notch":"fa-plus",'"></i> &nbsp;').concat(rt("teams / add-as").replace("%s",rt("teams / role / admin")),"</span>"),disabled:!o,action:function(){teamSettingsInvite.addUser("admin")}},{label:'<span class="red"><i class="fa '.concat(i?"fa-spin fa-circle-o-notch":"fa-plus",'"></i> &nbsp;').concat(rt("teams / add-as").replace("%s",rt("teams / role / owner")),"</span>"),disabled:!o,action:function(){teamSettingsInvite.addUser("owner")}}),a}(e))&&(t.inviteOptions=!0)};var kf={updateUsers:function(){var t=this,e=this.get().team;this.set({awaitLoadingUsers:Bd.get("/v3/teams/".concat(e.id,"/members?limit=1000")).then((function(e){t.set({users:e.list})}))})}};function Nf(){this.updateUsers()}function Tf(t,e){var n,r,i={component:t,ctx:e,current:null,pending:Mf,then:Cf,catch:Of,value:"null",error:"null"};return F(r=e.awaitLoadingUsers,i),{c:function(){n=O(),i.block.c()},m:function(t,e){p(t,n,e),i.block.m(t,i.anchor=e),i.mount=function(){return n.parentNode},i.anchor=n},p:function(t,n){e=n,i.ctx=e,"awaitLoadingUsers"in t&&r!==(r=e.awaitLoadingUsers)&&F(r,i)||i.block.p(t,u(u({},e),i.resolved))},d:function(t){t&&v(n),i.block.d(t),i=null}}}function Of(t,e){var n;return{c:function(){n=T("error!")},m:function(t,e){p(t,n,e)},p:c,d:function(t){t&&v(n)}}}function Cf(t,e){var n={},r={isAdmin:e.isAdmin,isTeamOwner:e.isTeamOwner,team:e.team};void 0!==e.users&&(r.users=e.users,n.users=!0),void 0!==e.editIndex&&(r.editIndex=e.editIndex,n.editIndex=!0),void 0!==e.updating&&(r.updating=e.updating,n.updating=!0);var i=new gf({root:t.root,store:t.store,data:r,_bind:function(e,r){var i={};!n.users&&e.users&&(i.users=r.users),!n.editIndex&&e.editIndex&&(i.editIndex=r.editIndex),!n.updating&&e.updating&&(i.updating=r.updating),t._set(i),n={}}});return t.root._beforecreate.push((function(){i._bind({users:1,editIndex:1,updating:1},i.get())})),{c:function(){i._fragment.c()},m:function(t,e){i._mount(t,e)},p:function(t,r){e=r;var o={};t.isAdmin&&(o.isAdmin=e.isAdmin),t.isTeamOwner&&(o.isTeamOwner=e.isTeamOwner),t.team&&(o.team=e.team),!n.users&&t.users&&(o.users=e.users,n.users=void 0!==e.users),!n.editIndex&&t.editIndex&&(o.editIndex=e.editIndex,n.editIndex=void 0!==e.editIndex),!n.updating&&t.updating&&(o.updating=e.updating,n.updating=void 0!==e.updating),i._set(o),n={}},d:function(t){i.destroy(t)}}}function Mf(t,e){var n,r,i,o,a=rt("teams / loading");return{c:function(){n=k("p"),r=k("i"),i=T("   "),o=k("noscript"),r.className="fa fa-circle-o-notch fa-spin"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o),o.insertAdjacentHTML("afterend",a)},p:c,d:function(t){t&&v(n)}}}function Af(t){var e=this;X(this,t),this._state=u({editIndex:0,updating:{},updatingUsers:!1,awaitLoadingUsers:!1},t.data),this._recompute({users:1,userId:1},this._state),this._intro=!0,this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d,f,m,g,b,_,y,w,x,N,C,M,A,E,S,I,L,P,R,D,z,U,H,F,$,B,q,G,V,W,Y,K,X,J,Q,Z,tt,et,nt,it,ot,at,st,lt,ct,ut,dt,ft,ht,pt,vt,mt,gt,bt,_t,yt,wt,xt,kt,Nt,Tt,Ot,Ct,Mt,At=rt("teams / p"),Et={},St=rt("teams / role / member"),jt=rt("teams / role / admin"),It=rt("teams / role / owner"),Lt=rt("teams / roles / edit-charts"),Pt=rt("teams / roles / edit-folders"),Rt=rt("teams / roles / access-settings"),Dt=rt("teams / roles / invite-users"),zt=rt("teams / roles / subscription-options"),Ut=rt("teams / roles / remove-team"),Ht={isTeamOwner:e.isTeamOwner,isAdmin:e.isAdmin};void 0!==e.team&&(Ht.team=e.team,Et.team=!0),void 0!==e.updatingUsers&&(Ht.updatingUsers=e.updatingUsers,Et.updatingUsers=!0);var Ft=new xf({root:t.root,store:t.store,data:Ht,_bind:function(e,n){var r={};!Et.team&&e.team&&(r.team=n.team),!Et.updatingUsers&&e.updatingUsers&&(r.updatingUsers=n.updatingUsers),t._set(r),Et={}}});t.root._beforecreate.push((function(){Ft._bind({team:1,updatingUsers:1},Ft.get())})),Ft.on("updateUsers",(function(e){t.updateUsers()}));var $t=e.awaitLoadingUsers&&Tf(t,e);return{c:function(){n=k("p"),r=T("\n\n"),i=k("div"),o=k("div"),Ft._fragment.c(),a=T("\n    "),s=k("div"),l=k("table"),c=k("thead"),u=k("tr"),d=k("td"),f=T("\n                    "),m=k("th"),g=T("\n                    "),b=k("th"),_=T("\n                    "),y=k("th"),w=T("\n            "),x=k("tbody"),N=k("tr"),C=k("td"),M=T("\n                    "),(A=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',E=T("\n                    "),(S=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',I=T("\n                    "),(L=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',P=T("\n\n                "),R=k("tr"),D=k("td"),z=T("\n                    "),(U=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',H=T("\n                    "),(F=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',$=T("\n                    "),(B=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',q=T("\n\n                "),G=k("tr"),V=k("td"),W=T("\n                    "),(Y=k("td")).innerHTML='<i class="im im-x-mark svelte-hgmegl"></i>',K=T("\n                    "),(X=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',J=T("\n                    "),(Q=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',Z=T("\n\n                "),tt=k("tr"),et=k("td"),nt=T("\n                    "),(it=k("td")).innerHTML='<i class="im im-x-mark svelte-hgmegl"></i>',ot=T("\n                    "),(at=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',st=T("\n                    "),(lt=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',ct=T("\n\n                "),ut=k("tr"),dt=k("td"),ft=T("\n                    "),(ht=k("td")).innerHTML='<i class="im im-x-mark svelte-hgmegl"></i>',pt=T("\n                    "),(vt=k("td")).innerHTML='<i class="im im-x-mark svelte-hgmegl"></i>',mt=T("\n                    "),(gt=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',bt=T("\n\n                "),_t=k("tr"),yt=k("td"),wt=T("\n                    "),(xt=k("td")).innerHTML='<i class="im im-x-mark svelte-hgmegl"></i>',kt=T("\n                    "),(Nt=k("td")).innerHTML='<i class="im im-x-mark svelte-hgmegl"></i>',Tt=T("\n                    "),(Ot=k("td")).innerHTML='<i class="im im-check-mark svelte-hgmegl"></i>',Ct=T("\n\n"),$t&&$t.c(),Mt=O(),j(n,"margin-bottom","10px"),o.className="span4",d.className="svelte-hgmegl",m.className="svelte-hgmegl",b.className="svelte-hgmegl",y.className="svelte-hgmegl",C.className="svelte-hgmegl",A.className="svelte-hgmegl",S.className="svelte-hgmegl",L.className="svelte-hgmegl",D.className="svelte-hgmegl",U.className="svelte-hgmegl",F.className="svelte-hgmegl",B.className="svelte-hgmegl",V.className="svelte-hgmegl",Y.className="svelte-hgmegl",X.className="svelte-hgmegl",Q.className="svelte-hgmegl",et.className="svelte-hgmegl",it.className="svelte-hgmegl",at.className="svelte-hgmegl",lt.className="svelte-hgmegl",dt.className="svelte-hgmegl",ht.className="svelte-hgmegl",vt.className="svelte-hgmegl",gt.className="svelte-hgmegl",yt.className="svelte-hgmegl",xt.className="svelte-hgmegl",Nt.className="svelte-hgmegl",Ot.className="svelte-hgmegl",x.className="svelte-hgmegl",l.className="role-descriptions svelte-hgmegl",j(l,"margin-left","3em"),s.className="span6",i.className="row",j(i,"margin-bottom","2em")},m:function(t,e){p(t,n,e),n.innerHTML=At,p(t,r,e),p(t,i,e),h(i,o),Ft._mount(o,null),h(i,a),h(i,s),h(s,l),h(l,c),h(c,u),h(u,d),h(u,f),h(u,m),m.innerHTML=St,h(u,g),h(u,b),b.innerHTML=jt,h(u,_),h(u,y),y.innerHTML=It,h(l,w),h(l,x),h(x,N),h(N,C),C.innerHTML=Lt,h(N,M),h(N,A),h(N,E),h(N,S),h(N,I),h(N,L),h(x,P),h(x,R),h(R,D),D.innerHTML=Pt,h(R,z),h(R,U),h(R,H),h(R,F),h(R,$),h(R,B),h(x,q),h(x,G),h(G,V),V.innerHTML=Rt,h(G,W),h(G,Y),h(G,K),h(G,X),h(G,J),h(G,Q),h(x,Z),h(x,tt),h(tt,et),et.innerHTML=Dt,h(tt,nt),h(tt,it),h(tt,ot),h(tt,at),h(tt,st),h(tt,lt),h(x,ct),h(x,ut),h(ut,dt),dt.innerHTML=zt,h(ut,ft),h(ut,ht),h(ut,pt),h(ut,vt),h(ut,mt),h(ut,gt),h(x,bt),h(x,_t),h(_t,yt),yt.innerHTML=Ut,h(_t,wt),h(_t,xt),h(_t,kt),h(_t,Nt),h(_t,Tt),h(_t,Ot),p(t,Ct,e),$t&&$t.m(t,e),p(t,Mt,e)},p:function(n,r){e=r;var i={};n.isTeamOwner&&(i.isTeamOwner=e.isTeamOwner),n.isAdmin&&(i.isAdmin=e.isAdmin),!Et.team&&n.team&&(i.team=e.team,Et.team=void 0!==e.team),!Et.updatingUsers&&n.updatingUsers&&(i.updatingUsers=e.updatingUsers,Et.updatingUsers=void 0!==e.updatingUsers),Ft._set(i),Et={},e.awaitLoadingUsers?$t?$t.p(n,e):(($t=Tf(t,e)).c(),$t.m(Mt.parentNode,Mt)):$t&&($t.d(1),$t=null)},d:function(t){t&&(v(n),v(r),v(i)),Ft.destroy(),t&&v(Ct),$t&&$t.d(t),t&&v(Mt)}}}(this,this._state),this.root._oncreate.push((function(){Nf.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function Ef(t){var e=t.changed,n=t.current;t.previous;n.settings&&(e.settings||e.team||e.defaultTheme)&&this.fire("change",{team:n.team,settings:n.settings,defaultTheme:n.defaultTheme})}function Sf(t,e){var n,r,i,o,a,s,l,c,u,d=!1,f=!1,m=!1;function g(){d=!0,e.settings.embed.custom_embed.title=i.value,t.set({settings:e.settings}),d=!1}var b={label:rt("teams / custom / title"),help:""},_=new Ro({root:t.root,store:t.store,slots:{default:x()},data:b});function y(){f=!0,e.settings.embed.custom_embed.text=a.value,t.set({settings:e.settings}),f=!1}var w={label:rt("teams / custom / help"),help:""},N=new Ro({root:t.root,store:t.store,slots:{default:x()},data:w});function O(){m=!0,e.settings.embed.custom_embed.template=l.value,t.set({settings:e.settings}),m=!1}var E={label:rt("teams / custom / embedcode"),help:rt("teams / custom / embedcode / help")},S=new Ro({root:t.root,store:t.store,slots:{default:x()},data:E});return{c:function(){(n=k("h3")).textContent="Custom Embed Code",r=T("\n\n        "),i=k("input"),_._fragment.c(),o=T("\n\n        "),a=k("textarea"),N._fragment.c(),s=T("\n\n        "),l=k("textarea"),S._fragment.c(),c=T("\n        "),u=k("hr"),C(i,"input",g),A(i,"type","text"),i.placeholder="e.g. Custom CMS Embed",C(a,"input",y),a.placeholder="e.g. This is a custom embed code for our CMS",C(l,"input",O),l.className="embedcode svelte-rgtu7e",l.placeholder='<iframe src="%chart_url%" width="%chart_width%" widthheight="%chart_height%"></iframe>'},m:function(t,d){p(t,n,d),p(t,r,d),h(_._slotted.default,i),i.value=e.settings.embed.custom_embed.title,_._mount(t,d),p(t,o,d),h(N._slotted.default,a),a.value=e.settings.embed.custom_embed.text,N._mount(t,d),p(t,s,d),h(S._slotted.default,l),l.value=e.settings.embed.custom_embed.template,S._mount(t,d),p(t,c,d),p(t,u,d)},p:function(t,n){e=n,!d&&t.settings&&(i.value=e.settings.embed.custom_embed.title),!f&&t.settings&&(a.value=e.settings.embed.custom_embed.text),!m&&t.settings&&(l.value=e.settings.embed.custom_embed.template)},d:function(t){t&&(v(n),v(r)),M(i,"input",g),_.destroy(t),t&&v(o),M(a,"input",y),N.destroy(t),t&&v(s),M(l,"input",O),S.destroy(t),t&&(v(c),v(u))}}}function jf(t){var e=this;X(this,t),this._state=u({embedCodes:[{value:"responsive",label:rt("teams / defaults / responsive-iframe")},{value:"iframe",label:rt("teams / defaults / iframe")},{value:"custom",label:rt("teams / defaults / custom")}],themes:[],folders:[],locales:[],defaultTheme:"",settings:{},team:{}},t.data),this._recompute({locales:1},this._state),this._intro=!0,this._handlers.state=[Ef],Ef.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d,f,m,g,b=rt("teams / defaults / p"),_=!1,y={},w={},N={},O={},E={};function S(){_=!0,e.team.name=a.value,t.set({team:e.team}),_=!1}var I={label:rt("teams / name"),help:rt("teams / name / help")},L=new Ro({root:t.root,store:t.store,slots:{default:x()},data:I}),P={label:"",options:[{label:rt("teams / defaults / expanded"),value:"expanded"},{label:rt("teams / defaults / collapsed"),value:"collapsed"}]};void 0!==e.settings.folders&&(P.value=e.settings.folders,y.value=!0);var R=new Nc({root:t.root,store:t.store,data:P,_bind:function(n,r){var i={};!y.value&&n.value&&(e.settings.folders=r.value,i.settings=e.settings),t._set(i),y={}}});t.root._beforecreate.push((function(){R._bind({value:1},R.get())}));var D={label:rt("teams / defaults / folder-status"),help:rt("teams / defaults / folder-status / p")},z=new Ro({root:t.root,store:t.store,slots:{default:x()},data:D}),U={options:e.themes};void 0!==e.defaultTheme&&(U.value=e.defaultTheme,w.value=!0);var H=new qi({root:t.root,store:t.store,data:U,_bind:function(e,n){var r={};!w.value&&e.value&&(r.defaultTheme=n.value),t._set(r),w={}}});t.root._beforecreate.push((function(){H._bind({value:1},H.get())}));var F={label:rt("teams / defaults / theme"),help:rt("teams / defaults / theme / p")},$=new Ro({root:t.root,store:t.store,slots:{default:x()},data:F}),B={options:e.folders};void 0!==e.settings.default.folder&&(B.value=e.settings.default.folder,N.value=!0);var q=new qi({root:t.root,store:t.store,data:B,_bind:function(n,r){var i={};!N.value&&n.value&&(e.settings.default.folder=r.value,i.settings=e.settings),t._set(i),N={}}});t.root._beforecreate.push((function(){q._bind({value:1},q.get())}));var G={label:rt("teams / defaults / folder"),help:rt("teams / defaults / folder / p")},V=new Ro({root:t.root,store:t.store,slots:{default:x()},data:G}),W={options:e.localeOptions};void 0!==e.settings.default.locale&&(W.value=e.settings.default.locale,O.value=!0);var Y=new qi({root:t.root,store:t.store,data:W,_bind:function(n,r){var i={};!O.value&&n.value&&(e.settings.default.locale=r.value,i.settings=e.settings),t._set(i),O={}}});t.root._beforecreate.push((function(){Y._bind({value:1},Y.get())}));var K={label:rt("teams / defaults / locale"),help:rt("teams / defaults / locale / p")},X=new Ro({root:t.root,store:t.store,slots:{default:x()},data:K}),J={label:"",options:e.embedCodes};void 0!==e.settings.embed.preferred_embed&&(J.value=e.settings.embed.preferred_embed,E.value=!0);var Q=new Nc({root:t.root,store:t.store,data:J,_bind:function(n,r){var i={};!E.value&&n.value&&(e.settings.embed.preferred_embed=r.value,i.settings=e.settings),t._set(i),E={}}});t.root._beforecreate.push((function(){Q._bind({value:1},Q.get())}));var Z={label:rt("teams / defaults / embedcode"),help:rt("teams / defaults / embedcode / p")},tt=new Ro({root:t.root,store:t.store,slots:{default:x()},data:Z}),et="custom"==e.settings.embed.preferred_embed&&Sf(t,e);return{c:function(){n=k("div"),r=k("div"),i=k("p"),o=T("\n\n        "),a=k("input"),L._fragment.c(),s=T("\n\n        "),R._fragment.c(),z._fragment.c(),l=T("\n\n        "),(c=k("h3")).textContent="Default settings for new visualizations",u=T("\n\n        "),H._fragment.c(),$._fragment.c(),d=T("\n\n        "),q._fragment.c(),V._fragment.c(),f=T("\n\n        "),Y._fragment.c(),X._fragment.c(),m=T("\n\n        "),Q._fragment.c(),tt._fragment.c(),g=T("\n\n        "),et&&et.c(),j(i,"margin-bottom","10px"),C(a,"input",S),A(a,"type","text"),a.placeholder="",r.className="span6",n.className="row"},m:function(t,v){p(t,n,v),h(n,r),h(r,i),i.innerHTML=b,h(r,o),h(L._slotted.default,a),a.value=e.team.name,L._mount(r,null),h(r,s),R._mount(z._slotted.default,null),z._mount(r,null),h(r,l),h(r,c),h(r,u),H._mount($._slotted.default,null),$._mount(r,null),h(r,d),q._mount(V._slotted.default,null),V._mount(r,null),h(r,f),Y._mount(X._slotted.default,null),X._mount(r,null),h(r,m),Q._mount(tt._slotted.default,null),tt._mount(r,null),h(r,g),et&&et.m(r,null)},p:function(n,i){e=i,!_&&n.team&&(a.value=e.team.name);var o={};!y.value&&n.settings&&(o.value=e.settings.folders,y.value=void 0!==e.settings.folders),R._set(o),y={};var s={};n.themes&&(s.options=e.themes),!w.value&&n.defaultTheme&&(s.value=e.defaultTheme,w.value=void 0!==e.defaultTheme),H._set(s),w={};var l={};n.folders&&(l.options=e.folders),!N.value&&n.settings&&(l.value=e.settings.default.folder,N.value=void 0!==e.settings.default.folder),q._set(l),N={};var c={};n.localeOptions&&(c.options=e.localeOptions),!O.value&&n.settings&&(c.value=e.settings.default.locale,O.value=void 0!==e.settings.default.locale),Y._set(c),O={};var u={};n.embedCodes&&(u.options=e.embedCodes),!E.value&&n.settings&&(u.value=e.settings.embed.preferred_embed,E.value=void 0!==e.settings.embed.preferred_embed),Q._set(u),E={},"custom"==e.settings.embed.preferred_embed?et?et.p(n,e):((et=Sf(t,e)).c(),et.m(r,null)):et&&(et.d(1),et=null)},d:function(t){t&&v(n),M(a,"input",S),L.destroy(),R.destroy(),z.destroy(),H.destroy(),$.destroy(),q.destroy(),V.destroy(),Y.destroy(),X.destroy(),Q.destroy(),tt.destroy(),et&&et.d()}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(Af.prototype,tt),u(Af.prototype,kf),Af.prototype._recompute=function(t,e){(t.users||t.userId)&&this._differs(e.role,e.role=function(t){var e=t.users,n=t.userId;if(!e||!e.length||!n)return!1;var r=e.find((function(t){return t.id===n}));return r?r.role:"admin"}(e))&&(t.role=!0)},u(jf.prototype,tt),jf.prototype._recompute=function(t,e){var n;t.locales&&this._differs(e.localeOptions,e.localeOptions=(n=e.locales,[{value:null,label:rt("teams / defaults / none","organizations")}].concat(l(n))))&&(t.localeOptions=!0)};var If={deleteTeam:function(){try{return this.set({deleting:!0}),t=Bd.delete("/v3/teams/".concat(this.get().team.id)),e=function(){window.location="/"},n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}catch(t){return Promise.reject(t)}var t,e,n}};function Lf(t,e){var n,r,i,o,a=rt("teams / delete / really"),s={},l={label:rt("teams / delete / really-yes")};void 0!==e.deleteTeam2&&(l.value=e.deleteTeam2,s.value=!0);var c=new Yt({root:t.root,store:t.store,data:l,_bind:function(e,n){var r={};!s.value&&e.value&&(r.deleteTeam2=n.value),t._set(r),s={}}});t.root._beforecreate.push((function(){c._bind({value:1},c.get())}));var u=e.deleteTeam2&&Pf(t,e);return{c:function(){n=k("p"),r=T("\n\n    "),c._fragment.c(),i=T("\n\n    "),u&&u.c(),o=O()},m:function(t,e){p(t,n,e),n.innerHTML=a,p(t,r,e),c._mount(t,e),p(t,i,e),u&&u.m(t,e),p(t,o,e)},p:function(n,r){e=r;var i={};!s.value&&n.deleteTeam2&&(i.value=e.deleteTeam2,s.value=void 0!==e.deleteTeam2),c._set(i),s={},e.deleteTeam2?u?u.p(n,e):((u=Pf(t,e)).c(),u.m(o.parentNode,o)):u&&(u.d(1),u=null)},d:function(t){t&&(v(n),v(r)),c.destroy(t),t&&v(i),u&&u.d(t),t&&v(o)}}}function Pf(t,e){var n,r,i,o,a,s=rt("teams / delete / action");function l(e){t.deleteTeam()}return{c:function(){n=k("button"),r=k("i"),o=T("  "),a=k("noscript"),r.className=i="fa "+(e.deleting?"fa-spin fa-circle-o-notch":"fa-times"),C(n,"click",l),n.className="btn btn-danger"},m:function(t,e){p(t,n,e),h(n,r),h(n,o),h(n,a),a.insertAdjacentHTML("afterend",s)},p:function(t,e){t.deleting&&i!==(i="fa "+(e.deleting?"fa-spin fa-circle-o-notch":"fa-times"))&&(r.className=i)},d:function(t){t&&v(n),M(n,"click",l)}}}function Rf(t){X(this,t),this._state=u({deleteTeam:!1,deleteTeam2:!1,deleting:!1},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,i,o=rt("teams / delete / p"),a={},s=e.deleteTeam&&Lf(t,e),l={label:rt("teams / delete / yes")};void 0!==e.deleteTeam&&(l.value=e.deleteTeam,a.value=!0);var c=new zc({root:t.root,store:t.store,slots:{default:x()},data:l,_bind:function(e,n){var r={};!a.value&&e.value&&(r.deleteTeam=n.value),t._set(r),a={}}});return t.root._beforecreate.push((function(){c._bind({value:1},c.get())})),{c:function(){n=k("p"),r=T("\n\n"),s&&s.c(),i=O(),c._fragment.c()},m:function(t,e){p(t,n,e),n.innerHTML=o,p(t,r,e),s&&s.m(c._slotted.default,null),h(c._slotted.default,i),c._mount(t,e)},p:function(n,r){(e=r).deleteTeam?s?s.p(n,e):((s=Lf(t,e)).c(),s.m(i.parentNode,i)):s&&(s.d(1),s=null);var o={};!a.value&&n.deleteTeam&&(o.value=e.deleteTeam,a.value=void 0!==e.deleteTeam),c._set(o),a={}},d:function(t){t&&(v(n),v(r)),s&&s.d(),c.destroy(t)}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function Df(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}u(Rf.prototype,tt),u(Rf.prototype,If);var zf=Kc;var Uf={edit:function(t){this.get().editId===t?(this.set({editId:!1}),this.update(t)):this.set({editId:t})},addProduct:function(){try{var t=this,e=t.get(),n=e.team,r=e.addProduct;return t.set({addingProduct:!0}),Df(Bd("/v3/teams/".concat(n.id,"/products"),{method:"post",payload:{productId:r}}),(function(){return Df(Bd("/v3/teams/".concat(n.id,"/products")),(function(e){t.set({products:e.list,addingProduct:!1})}))}))}catch(t){return Promise.reject(t)}},remove:function(t){try{var e=this;if(!window.confirm("Are you sure you want to remove this product?"))return;return Df(Bd("/v3/teams/".concat(e.get().team.id,"/products/").concat(t.id),{method:"delete"}),(function(){var n=e.get().products;n=n.filter((function(e){return e.id!==t.id})),e.set({products:n})}))}catch(t){return Promise.reject(t)}},update:function(t){try{var e=this,n=e.get(),r=n.updating,i=n.products.filter((function(e){return e.id===t}))[0];return r[i.id]=!0,e.set({updating:r}),Df(Bd("/v3/teams/".concat(e.get().team.id,"/products/").concat(i.id),{method:"put",payload:{expires:i.expires}}),(function(){(r=e.get().updating)[i.id]=!1,e.set({updating:r})}))}catch(t){return Promise.reject(t)}}};function Hf(){var t=this,e=this.get();Bd("/v3/teams/".concat(e.team.id,"/products")).then((function(e){return t.set({loadingTeamProducts:!1,products:e.list})})),Bd("/v3/products").then((function(e){return t.set({loadingAllProducts:!1,allProducts:e.list})}))}function Ff(t){var e=this._svelte,n=e.component,r=e.ctx;n.remove(r.product)}function $f(t){var e=this._svelte,n=e.component,r=e.ctx;n.edit(r.product.id)}function Bf(t){var e=this._svelte,n=e.component,r=e.ctx;n.edit(r.product.id)}function qf(t,e,n){var r=Object.create(t);return r.product=e[n],r.each_value=e,r.i=n,r}function Gf(t,e){var n;function r(t){return t.loadingTeamProducts||t.loadingAllProducts?Wf:Vf}var i=r(e),o=i(t,e);return{c:function(){o.c(),n=O()},m:function(t,e){o.m(t,e),p(t,n,e)},p:function(e,a){i===(i=r(a))&&o?o.p(e,a):(o.d(1),(o=i(t,a)).c(),o.m(n.parentNode,n))},d:function(t){o.d(t),t&&v(n)}}}function Vf(t,e){var n,r,i=e.products.length>0&&Yf(t,e),o=e.addableProducts.length&&eh(t,e);return{c:function(){i&&i.c(),n=T(" "),o&&o.c(),r=O()},m:function(t,e){i&&i.m(t,e),p(t,n,e),o&&o.m(t,e),p(t,r,e)},p:function(e,a){a.products.length>0?i?i.p(e,a):((i=Yf(t,a)).c(),i.m(n.parentNode,n)):i&&(i.d(1),i=null),a.addableProducts.length?o?o.p(e,a):((o=eh(t,a)).c(),o.m(r.parentNode,r)):o&&(o.d(1),o=null)},d:function(t){i&&i.d(t),t&&v(n),o&&o.d(t),t&&v(r)}}}function Wf(t,e){var n,r,i,o,a=rt("teams / products / loading");return{c:function(){n=k("p"),r=k("i"),i=T("   "),o=k("noscript"),r.className="fa fa-spin fa-circle-o-notch"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o),o.insertAdjacentHTML("afterend",a)},p:c,d:function(t){t&&v(n)}}}function Yf(t,e){for(var n,r=e.products,i=[],o=0;o<r.length;o+=1)i[o]=th(t,qf(e,r,o));var a={columnHeaders:e.productHeaders},s=new zf({root:t.root,store:t.store,slots:{default:x()},data:a});return{c:function(){for(var t=0;t<i.length;t+=1)i[t].c();n=O(),s._fragment.c()},m:function(t,e){for(var r=0;r<i.length;r+=1)i[r].m(s._slotted.default,null);h(s._slotted.default,n),s._mount(t,e)},p:function(e,o){if(e.editId||e.products||e.updating){r=o.products;for(var a=0;a<r.length;a+=1){var l=qf(o,r,a);i[a]?i[a].p(e,l):(i[a]=th(t,l),i[a].c(),i[a].m(n.parentNode,n))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}var c={};e.productHeaders&&(c.columnHeaders=o.productHeaders),s._set(c)},d:function(t){w(i,t),s.destroy(t)}}}function Kf(t,e){var n,r=e.product.expires||rt("teams / products / never");return{c:function(){n=T(r)},m:function(t,e){p(t,n,e)},p:function(t,e){t.products&&r!==(r=e.product.expires||rt("teams / products / never"))&&S(n,r)},d:function(t){t&&v(n)}}}function Xf(t,e){var n,r=!1;function i(){r=!0,e.each_value[e.i].expires=n.value,t.set({products:e.products}),r=!1}return{c:function(){C(n=k("input"),"input",i),A(n,"type","text")},m:function(t,r){p(t,n,r),n.value=e.product.expires},p:function(t,i){e=i,!r&&t.products&&(n.value=e.product.expires)},d:function(t){t&&v(n),M(n,"input",i)}}}function Jf(t,e){var n,r,i,o,a,s,l,c,u,d=rt("teams / edit"),f=rt("teams / remove");return{c:function(){n=k("button"),r=k("i"),i=T("  "),o=T(d),a=T("\n\n            "),s=k("button"),l=k("i"),c=T("  "),u=T(f),r.className="fa fa-edit",n._svelte={component:t,ctx:e},C(n,"click",$f),n.className="btn",l.className="fa fa-times",s._svelte={component:t,ctx:e},C(s,"click",Ff),s.className="btn"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o),p(t,a,e),p(t,s,e),h(s,l),h(s,c),h(s,u)},p:function(t,r){e=r,n._svelte.ctx=e,s._svelte.ctx=e},d:function(t){t&&v(n),M(n,"click",$f),t&&(v(a),v(s)),M(s,"click",Ff)}}}function Qf(t,e){var n,r,i,o,a=rt("teams / save");return{c:function(){n=k("button"),r=k("i"),i=T("  "),o=T(a),r.className="fa fa-spin fa-circle-o-notch",n.disabled=!0,n.className="btn btn-primary"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o)},p:c,d:function(t){t&&v(n)}}}function Zf(t,e){var n,r,i,o,a=rt("teams / save");return{c:function(){n=k("button"),r=k("i"),i=T("  "),o=T(a),r.className="fa fa-check",n._svelte={component:t,ctx:e},C(n,"click",Bf),n.className="btn btn-primary"},m:function(t,e){p(t,n,e),h(n,r),h(n,i),h(n,o)},p:function(t,r){e=r,n._svelte.ctx=e},d:function(t){t&&v(n),M(n,"click",Bf)}}}function th(t,e){var n,r,i,o,a,s,l,c,u,d,f=e.product.id,m=e.product.name;function g(t){return t.editId===t.product.id?Xf:Kf}var b=g(e),_=b(t,e);function y(t){return t.editId===t.product.id?Zf:t.updating[t.product.id]?Qf:Jf}var w=y(e),x=w(t,e);return{c:function(){n=k("tr"),r=k("td"),i=T(f),o=T("\n        "),a=k("td"),s=T(m),l=T("\n        "),c=k("td"),_.c(),u=T("\n        "),d=k("td"),x.c()},m:function(t,e){p(t,n,e),h(n,r),h(r,i),h(n,o),h(n,a),h(a,s),h(n,l),h(n,c),_.m(c,null),h(n,u),h(n,d),x.m(d,null)},p:function(e,n){e.products&&f!==(f=n.product.id)&&S(i,f),e.products&&m!==(m=n.product.name)&&S(s,m),b===(b=g(n))&&_?_.p(e,n):(_.d(1),(_=b(t,n)).c(),_.m(c,null)),w===(w=y(n))&&x?x.p(e,n):(x.d(1),(x=w(t,n)).c(),x.m(d,null))},d:function(t){t&&v(n),_.d(),x.d()}}}function eh(t,e){var n,r,i,o={},a={label:rt("teams / products / add-product"),options:e.addableProducts};void 0!==e.addProduct&&(a.value=e.addProduct,o.value=!0);var s=new oc({root:t.root,store:t.store,data:a,_bind:function(e,n){var r={};!o.value&&e.value&&(r.addProduct=n.value),t._set(r),o={}}});t.root._beforecreate.push((function(){s._bind({value:1},s.get())}));var l=e.addProduct&&nh(t,e);return{c:function(){n=k("div"),r=k("div"),s._fragment.c(),i=T("\n\n    "),l&&l.c(),j(r,"display","block"),j(n,"display","flex")},m:function(t,e){p(t,n,e),h(n,r),s._mount(r,null),h(n,i),l&&l.m(n,null)},p:function(r,i){e=i;var a={};r.addableProducts&&(a.options=e.addableProducts),!o.value&&r.addProduct&&(a.value=e.addProduct,o.value=void 0!==e.addProduct),s._set(a),o={},e.addProduct?l?l.p(r,e):((l=nh(t,e)).c(),l.m(n,null)):l&&(l.d(1),l=null)},d:function(t){t&&v(n),s.destroy(),l&&l.d()}}}function nh(t,e){var n,r,i,o,a,s,l=rt("teams / products / add");function c(e){t.addProduct()}return{c:function(){n=k("div"),r=k("button"),i=k("i"),a=T("\n            "),s=k("noscript"),i.className=o="fa "+(e.addingProduct?"fa fa-spin fa-circle-o-notch":"fa-plus"),C(r,"click",c),r.className="btn btn-primary",j(r,"margin-left","10px"),j(n,"display","block")},m:function(t,e){p(t,n,e),h(n,r),h(r,i),h(r,a),h(r,s),s.insertAdjacentHTML("afterend",l)},p:function(t,e){t.addingProduct&&o!==(o="fa "+(e.addingProduct?"fa fa-spin fa-circle-o-notch":"fa-plus"))&&(i.className=o)},d:function(t){t&&v(n),M(r,"click",c)}}}function rh(t){var e,n,r,i,o,a,s,l=this;X(this,t),this._state=u({productHeaders:[{title:rt("teams / products / id"),width:"10%"},{title:rt("teams / products / name"),width:"30%"},{title:rt("teams / products / expires"),width:"30%"},{title:rt("teams / products / actions"),width:"30%"}],editId:!1,updating:{},loadingTeamProducts:!0,loadingAllProducts:!0},t.data),this._recompute({products:1,allProducts:1},this._state),this._intro=!0,this._fragment=(e=this,n=this._state,a=rt("teams / products / p"),s=n.isAdmin&&Gf(e,n),{c:function(){r=k("p"),i=T("\n\n"),s&&s.c(),o=O(),j(r,"margin-bottom","10px")},m:function(t,e){p(t,r,e),r.innerHTML=a,p(t,i,e),s&&s.m(t,e),p(t,o,e)},p:function(t,n){n.isAdmin?s?s.p(t,n):((s=Gf(e,n)).c(),s.m(o.parentNode,o)):s&&(s.d(1),s=null)},d:function(t){t&&(v(r),v(i)),s&&s.d(t),t&&v(o)}}),this.root._oncreate.push((function(){Hf.call(l),l.fire("update",{changed:d({},l._state),current:l._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}u(rh.prototype,tt),u(rh.prototype,Uf),rh.prototype._recompute=function(t,e){var n,r,i;(t.products||t.allProducts)&&this._differs(e.addableProducts,e.addableProducts=(r=(n=e).products,(i=n.allProducts)&&r?i.filter((function(t){return!r.filter((function(e){return e.id===t.id})).length})).map((function(t){return{value:t.id,label:t.name}})):[]))&&(t.addableProducts=!0)},u(function(t){var e,n,r,i;X(this,t),this._state=u({},t.data),this._intro=!0,this._fragment=(this._state,i=rt("teams / loading-page"),{c:function(){e=k("i"),n=T("  "),r=T(i),e.className="fa fa-circle-o-notch fa-spin"},m:function(t,i){p(t,e,i),p(t,n,i),p(t,r,i)},p:c,d:function(t){t&&(v(e),v(n),v(r))}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}.prototype,tt);function ih(t){return"function"==typeof t?t():t}function oh(){var t={};return t.promise=new Promise((function(e,n){t.resolve=e,t.reject=n})),t}var ah={},sh=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=void 0,i=void 0,o=void 0,a=[];return function(){var l=ih(e),c=(new Date).getTime(),u=!r||c-r>l;r=c;for(var d=arguments.length,f=Array(d),h=0;h<d;h++)f[h]=arguments[h];if(u&&n.leading)return n.accumulate?Promise.resolve(t.call(this,[f])).then((function(t){return t[0]})):Promise.resolve(t.call.apply(t,[this].concat(f)));if(i?clearTimeout(o):i=oh(),a.push(f),o=setTimeout(s.bind(this),l),n.accumulate){var p=a.length-1;return i.promise.then((function(t){return t[p]}))}return i.promise};function s(){var e=i;clearTimeout(o),Promise.resolve(n.accumulate?t.call(this,a):t.apply(this,a[a.length-1])).then(e.resolve,e.reject),a=[],i=null}}((function(t,e,n){var r=JSON.stringify({team:t,settings:e,defaultTheme:n});return ah[t.id]===r?(ah[t.id]=r,new Promise((function(t,e){t()}))):(ah[t.id]=r,Gd("/v3/teams/".concat(t.id),{payload:{name:t.name,defaultTheme:n,settings:e}}))}),500);function lh(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function ch(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?lh(Object(r),!0).forEach((function(n){t(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):lh(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var uh,dh={id:"settings",title:rt("teams / tab / settings"),icon:"fa fa-gears",group:rt("teams / group / users"),order:10,h1:rt("teams / defaults / h1"),ui:jf,data:{}},fh={id:"members",title:rt("teams / tab / members"),icon:"im im-users",group:rt("teams / group / users"),order:20,h1:rt("teams / h1"),ui:Af},hh=!1;var ph={onTabChange:function(t,e){var n=this,r=t.team,i=t.settings,o=t.defaultTheme;sh(r,i,o).then((function(){n.set({team:r,settings:i,defaultTheme:o}),e&&e.saved&&e.saved()}))},setTab:function(t){var e=this,n=this.get().groups,r=!1;n.forEach((function(n){n.tabs.forEach((function(n){n.id===t&&(e.refs.navTabs.activateTab(n),r=!0)}))})),r||this.set({activeTab:dh})}};function vh(){var t=this;uh=this;var e=window.location.pathname.split("/").slice(-1)[0]||"settings";this.setTab(e),window.addEventListener("popstate",(function(e){var n=e.state;hh=!0,setTimeout((function(){return hh=!1}),100),t.setTab(n.id)}))}function mh(t){var e=t.changed,n=t.current;t.previous;e.activeTab&&n.activeTab&&!hh&&window.history.pushState({id:n.activeTab.id},"","/team/".concat(n.team.id,"/").concat(n.activeTab.id))}function gh(t,e){var n,r=e.activeTab.h1;return{c:function(){(n=k("h2")).className="svelte-kailtr"},m:function(t,e){p(t,n,e),n.innerHTML=r},p:function(t,e){t.activeTab&&r!==(r=e.activeTab.h1)&&(n.innerHTML=r)},d:function(t){t&&v(n)}}}function bh(t){var e=this;X(this,t),this.refs={},this._state=u({allTabs:[dh,fh,{id:"delete",title:rt("teams / tab / deleteTeam"),icon:"fa fa-times",group:rt("teams / group / advanced"),order:80,h1:rt("teams / delete / h1"),ui:Rf,ownerOnly:!0},{id:"products",title:rt("teams / tab / adminProducts"),icon:"fa fa-list-alt",group:rt("teams / group / internal"),order:90,h1:rt("teams / products / h1"),ui:rh,adminOnly:!0}],pluginTabs:[],activeTab:null,ui:jf,team:{name:""},settings:{},users:[],userId:null,visualizations:[],visualizationsArchive:[]},t.data),this._recompute({team:1,activeTab:1,allTabs:1,pluginTabs:1,isAdmin:1,role:1,tabs:1,users:1,userId:1,settings:1,defaultTheme:1,themes:1,folders:1,locales:1,visualizations:1,visualizationsArchive:1},this._state),this._intro=!0,this._handlers.state=[mh],mh.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n,r,i,o,a,s,l,c,u,d,f,m,g,b,_,y,w,N,O,C,M,E,I,L,P,R,D,z=rt("account / my-teams"),U=rt("nav / team / charts"),H={};document.title=n=e.pageTitle+" | Datawrapper";var F=e.activeTab&&e.activeTab.h1&&gh(t,e),$={basePath:"team/"+e.team.id,groups:e.groups};void 0!==e.activeTab&&($.activeTab=e.activeTab,H.activeTab=!0);var B=new pt({root:t.root,store:t.store,slots:{default:x(),belowMenu:x(),aboveContent:x()},data:$,_bind:function(e,n){var r={};!H.activeTab&&e.activeTab&&(r.activeTab=n.activeTab),t._set(r),H={}}});return t.root._beforecreate.push((function(){B._bind({activeTab:1},B.get())})),t.refs.navTabs=B,{c:function(){r=T("\n\n"),i=k("div"),o=k("div"),a=k("h1"),s=T(e.title),l=T("\n\n"),c=k("div"),u=k("div"),d=k("div"),F&&F.c(),f=T("\n            "),m=k("div"),g=k("hr"),b=T("\n                "),_=k("ul"),y=k("li"),w=k("a"),N=k("i"),O=T(" "),C=T(z),M=T("\n                    "),E=k("li"),I=k("a"),L=k("i"),P=T(" "),R=T(U),B._fragment.c(),a.className="title",j(a,"margin-bottom","18px"),o.className="span12 admin svelte-kailtr",i.className="row",A(d,"slot","aboveContent"),N.className="fa fa-fw fa-arrow-left",w.href="/account/teams",y.className="svelte-kailtr",L.className="fa fa-fw fa-arrow-left",I.href=D="/team/"+e.team.id,E.className="svelte-kailtr",_.className="unstyled svelte-kailtr",A(m,"slot","belowMenu"),u.className="visconfig",c.className="settings-section dw-create-visualize chart-editor chart-editor-web admin svelte-kailtr"},m:function(t,e){p(t,r,e),p(t,i,e),h(i,o),h(o,a),h(a,s),p(t,l,e),p(t,c,e),h(c,u),h(B._slotted.aboveContent,d),F&&F.m(d,null),h(B._slotted.default,f),h(B._slotted.belowMenu,m),h(m,g),h(m,b),h(m,_),h(_,y),h(y,w),h(w,N),h(w,O),h(w,C),h(_,M),h(_,E),h(E,I),h(I,L),h(I,P),h(I,R),B._mount(u,null)},p:function(r,i){e=i,r.pageTitle&&n!==(n=e.pageTitle+" | Datawrapper")&&(document.title=n),r.title&&S(s,e.title),e.activeTab&&e.activeTab.h1?F?F.p(r,e):((F=gh(t,e)).c(),F.m(d,null)):F&&(F.d(1),F=null),r.team&&D!==(D="/team/"+e.team.id)&&(I.href=D);var o={};r.team&&(o.basePath="team/"+e.team.id),r.groups&&(o.groups=e.groups),!H.activeTab&&r.activeTab&&(o.activeTab=e.activeTab,H.activeTab=void 0!==e.activeTab),B._set(o),H={}},d:function(e){e&&(v(r),v(i),v(l),v(c)),F&&F.d(),B.destroy(),t.refs.navTabs===B&&(t.refs.navTabs=null)}}}(this,this._state),this.root._oncreate.push((function(){vh.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),Y(this))}function _h(t,e){this._handlers={},this._dependents=[],this._computed=q(),this._sortedComputedProperties=[],this._state=u({},t),this._differs=e&&e.immutable?V:G}return u(bh.prototype,tt),u(bh.prototype,ph),bh.prototype._recompute=function(t,e){var n,r,i;(t.team||t.activeTab)&&this._differs(e.pageTitle,e.pageTitle=(r=(n=e).team,i=n.activeTab,"".concat(i?i.h1:""," | ").concat(it(r.name,17,8))))&&(t.pageTitle=!0),t.team&&this._differs(e.title,e.title=function(t){var e=t.team;return"".concat(it(e.name,17,8)," » ").concat(rt("nav / team / settings"))}(e))&&(t.title=!0),(t.allTabs||t.team||t.pluginTabs||t.isAdmin||t.role)&&this._differs(e.tabs,e.tabs=function(t){var e=t.allTabs,n=t.team,r=t.pluginTabs,i=t.isAdmin,o=t.role;return[].concat(e,r).filter((function(t){return!(t.adminOnly&&!i)&&!(t.ownerOnly&&!i&&"owner"!==o)})).map((function(t){return ch({},t,{h1:t.h1.replace("%team%",n.name)})}))}(e))&&(t.tabs=!0),(t.tabs||t.isAdmin||t.role||t.team||t.users||t.userId||t.settings||t.defaultTheme||t.themes||t.folders||t.locales||t.visualizations||t.visualizationsArchive)&&this._differs(e.groups,e.groups=function(t){var e=t.tabs,n=t.isAdmin,r=t.role,i=t.team,o=t.users,a=t.userId,s=t.settings,l=t.defaultTheme,c=t.themes,u=t.folders,d=t.locales,f=t.visualizations,h=t.visualizationsArchive,p=[];return e.forEach((function(t){t.data=ch({isAdmin:n,isTeamOwner:"owner"===r,team:i,users:o,userId:a,settings:s,defaultTheme:l,themes:c,folders:u,locales:d,visualizations:f,visualizationsArchive:h},t.data),t.onchange=function(t,e){uh.onTabChange(t,e)},function(t,e){var n=t.filter((function(t){return t.title===e}));return n.length?n[0]:(t.push({title:e,tabs:[]}),t[t.length-1])}(p,t.group).tabs.push(t)})),p.forEach((function(t){t.tabs.sort((function(t,e){return t.order-e.order}))})),p}(e))&&(t.groups=!0)},u(_h.prototype,{_add:function(t,e){this._dependents.push({component:t,props:e})},_init:function(t){for(var e={},n=0;n<t.length;n+=1){var r=t[n];e["$"+r]=this._state[r]}return e},_remove:function(t){for(var e=this._dependents.length;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set:function(t,e){var n=this,r=this._state;this._state=u(u({},r),t);for(var i=0;i<this._sortedComputedProperties.length;i+=1)this._sortedComputedProperties[i].update(this._state,e);this.fire("state",{changed:e,previous:r,current:this._state}),this._dependents.filter((function(t){for(var r={},i=!1,o=0;o<t.props.length;o+=1){var a=t.props[o];a in e&&(r["$"+a]=n._state[a],i=!0)}if(i)return t.component._stage(r),!0})).forEach((function(t){t.component.set({})})),this.fire("update",{changed:e,previous:r,current:this._state})},_sortComputedProperties:function(){var t,e=this._computed,n=this._sortedComputedProperties=[],r=q();function i(o){var a=e[o];a&&(a.deps.forEach((function(e){if(e===t)throw new Error("Cyclical dependency detected between ".concat(e," <-> ").concat(o));i(e)})),r[o]||(r[o]=!0,n.push(a)))}for(var o in this._computed)i(t=o)},compute:function(t,e,n){var r,i=this,o={deps:e,update:function(o,a,s){var l=e.map((function(t){return t in a&&(s=!0),o[t]}));if(s){var c=n.apply(null,l);i._differs(c,r)&&(r=c,a[t]=!0,o[t]=r)}}};this._computed[t]=o,this._sortComputedProperties();var a=u({},this._state),s={};o.update(a,s,!0),this._set(a,s)},fire:W,get:K,on:J,set:function(t){var e=this._state,n=this._changed={},r=!1;for(var i in t){if(this._computed[i])throw new Error("'".concat(i,"' is a read-only computed property"));this._differs(t[i],e[i])&&(n[i]=r=!0)}r&&this._set(t,n)}}),{App:bh,store:new _h({})}}));
>>>>>>> master
