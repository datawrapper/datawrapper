(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/team-settings', factory) :
	(global = global || self, global['team-settings'] = factory());
}(this, (function () { 'use strict';

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

	/* home/david/Projects/core/libs/controls/v2/TableDisplay.html generated by Svelte v2.16.1 */

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

	const file$1 = "home/david/Projects/core/libs/controls/v2/TableDisplay.html";

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

	function TableDisplay(options) {
		this._debugName = '<TableDisplay>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);

		this._recompute({ orderBy: 1, order: 1 }, this._state);
		if (!('orderBy' in this._state)) console.warn("<TableDisplay> was created without expected data property 'orderBy'");
		if (!('order' in this._state)) console.warn("<TableDisplay> was created without expected data property 'order'");
		if (!('columnHeaders' in this._state)) console.warn("<TableDisplay> was created without expected data property 'columnHeaders'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(TableDisplay.prototype, protoDev);
	assign(TableDisplay.prototype, methods$1);

	TableDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('isActive' in newState && !this._updatingReadonlyProperty) throw new Error("<TableDisplay>: Cannot set read-only property 'isActive'");
		if ('isAscending' in newState && !this._updatingReadonlyProperty) throw new Error("<TableDisplay>: Cannot set read-only property 'isAscending'");
	};

	TableDisplay.prototype._recompute = function _recompute(changed, state) {
		if (changed.orderBy) {
			if (this._differs(state.isActive, (state.isActive = isActive(state)))) changed.isActive = true;
		}

		if (changed.order) {
			if (this._differs(state.isAscending, (state.isAscending = isAscending(state)))) changed.isAscending = true;
		}
	};

	/* home/david/Projects/core/libs/controls/v2/SelectInput.html generated by Svelte v2.16.1 */

	function data$2() {
	    return {
	        disabled: false,
	        width: 'auto',
	        labelWidth: 'auto',
	        options: [],
	        optgroups: [],
	        value: null,
	        class: ''
	    };
	}
	const file$2 = "home/david/Projects/core/libs/controls/v2/SelectInput.html";

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

	function create_main_fragment$2(component, ctx) {
		var select, if_block0_anchor, select_updating = false, select_class_value;

		var if_block0 = (ctx.options.length) && create_if_block_1(component, ctx);

		var if_block1 = (ctx.optgroups.length) && create_if_block$2(component, ctx);

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
				select.className = select_class_value = "select-css " + ctx.class + " svelte-v0oq4b";
				select.disabled = ctx.disabled;
				setStyle(select, "width", ctx.width);
				addLoc(select, file$2, 0, 0, 0);
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
						if_block0 = create_if_block_1(component, ctx);
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
						if_block1 = create_if_block$2(component, ctx);
						if_block1.c();
						if_block1.m(select, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!select_updating && changed.value) selectOption(select, ctx.value);
				if ((changed.class) && select_class_value !== (select_class_value = "select-css " + ctx.class + " svelte-v0oq4b")) {
					select.className = select_class_value;
				}

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
	function create_if_block_1(component, ctx) {
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
				addLoc(option, file$2, 2, 4, 187);
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
	function create_if_block$2(component, ctx) {
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
				addLoc(option, file$2, 6, 8, 428);
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
				addLoc(optgroup, file$2, 4, 4, 344);
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

	function SelectInput(options) {
		this._debugName = '<SelectInput>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$2(), options.data);
		if (!('class' in this._state)) console.warn("<SelectInput> was created without expected data property 'class'");
		if (!('disabled' in this._state)) console.warn("<SelectInput> was created without expected data property 'disabled'");
		if (!('value' in this._state)) console.warn("<SelectInput> was created without expected data property 'value'");
		if (!('width' in this._state)) console.warn("<SelectInput> was created without expected data property 'width'");
		if (!('options' in this._state)) console.warn("<SelectInput> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<SelectInput> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(SelectInput.prototype, protoDev);

	SelectInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
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
	function numUsers({ sortedUsers }) {
	    return sortedUsers.length;
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
	function data$3() {
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

	const file$3 = "team-settings/tabs/members/UserTable.html";

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

	function create_main_fragment$3(component, ctx) {
		var p, text0, raw_before, text1, if_block1_anchor;

		function select_block_type(ctx) {
			if (ctx.numUsers === 1) return create_if_block_7;
			if (ctx.numUsers > 1) return create_if_block_8;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type && current_block_type(component, ctx);

		var if_block1 = (ctx.sortedUsers.length) && create_if_block$3(component, ctx);

		return {
			c: function create() {
				p = createElement("p");
				if (if_block0) if_block0.c();
				text0 = createText(" ");
				raw_before = createElement('noscript');
				text1 = createText("\n\n");
				if (if_block1) if_block1.c();
				if_block1_anchor = createComment();
				addLoc(p, file$3, 0, 0, 0);
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
						if_block1 = create_if_block$3(component, ctx);
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
	function create_if_block$3(component, ctx) {
		var each_anchor;

		var each_value = ctx.sortedUsers;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, get_each_context$2(ctx, each_value, i));
		}

		var tabledisplay_initial_data = { columnHeaders: ctx.userHeaders };
		var tabledisplay = new TableDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: tabledisplay_initial_data
		});

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
				tabledisplay._fragment.c();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(tabledisplay._slotted.default, null);
				}

				append(tabledisplay._slotted.default, each_anchor);
				tabledisplay._mount(target, anchor);
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

				var tabledisplay_changes = {};
				if (changed.userHeaders) tabledisplay_changes.columnHeaders = ctx.userHeaders;
				tabledisplay._set(tabledisplay_changes);
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				tabledisplay.destroy(detach);
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
				addLoc(a, file$3, 15, 12, 416);
				addLoc(td, file$3, 14, 8, 399);
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
		var selectinput_updating = {}, text0, p, text1_value = __('teams / role / p' ), text1;

		var selectinput_initial_data = { width: "200px", options: ctx.roles };
		if (ctx.user.role !== void 0) {
			selectinput_initial_data.value = ctx.user.role;
			selectinput_updating.value = true;
		}
		var selectinput = new SelectInput({
			root: component.root,
			store: component.store,
			data: selectinput_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectinput_updating.value && changed.value) {
					ctx.user.role = childState.value;

					newState.sortedUsers = ctx.sortedUsers;
				}
				component._set(newState);
				selectinput_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput._bind({ value: 1 }, selectinput.get());
		});

		return {
			c: function create() {
				selectinput._fragment.c();
				text0 = createText("\n            ");
				p = createElement("p");
				text1 = createText(text1_value);
				p.className = "mini-help";
				addLoc(p, file$3, 24, 12, 694);
			},

			m: function mount(target, anchor) {
				selectinput._mount(target, anchor);
				insert(target, text0, anchor);
				insert(target, p, anchor);
				append(p, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectinput_changes = {};
				if (changed.roles) selectinput_changes.options = ctx.roles;
				if (!selectinput_updating.value && changed.sortedUsers) {
					selectinput_changes.value = ctx.user.role;
					selectinput_updating.value = ctx.user.role !== void 0;
				}
				selectinput._set(selectinput_changes);
				selectinput_updating = {};
			},

			d: function destroy(detach) {
				selectinput.destroy(detach);
				if (detach) {
					detachNode(text0);
					detachNode(p);
				}
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
				addLoc(i, file$3, 26, 12, 821);
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
	function create_if_block_1$1(component, ctx) {
		var if_block_anchor;

		function select_block_type_2(ctx) {
			if (ctx.editId ===
	            ctx.user.id) return create_if_block_2;
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
				addLoc(i0, file$3, 41, 16, 1514);

				button0._svelte = { component, ctx };

				addListener(button0, "click", click_handler_1);
				button0.className = "btn";
				addLoc(button0, file$3, 40, 12, 1446);
				i1.className = "fa fa-times";
				addLoc(i1, file$3, 45, 16, 1671);

				button1._svelte = { component, ctx };

				addListener(button1, "click", click_handler_2);
				button1.className = "btn";
				addLoc(button1, file$3, 44, 12, 1606);
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
				addLoc(i, file$3, 37, 16, 1317);
				button.disabled = true;
				button.className = "btn btn-primary";
				addLoc(button, file$3, 36, 12, 1259);
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
	function create_if_block_2(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-check";
				addLoc(i, file$3, 33, 16, 1127);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler$2);
				button.className = "btn btn-primary";
				addLoc(button, file$3, 32, 12, 1047);
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

		var if_block2 = (ctx.isAdmin || ctx.isTeamOwner || (!ctx.isTeamOwner && ctx.user.role != 'owner')) && create_if_block_1$1(component, ctx);

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
				addLoc(td0, file$3, 10, 8, 323);
				addLoc(td1, file$3, 18, 8, 501);
				addLoc(td2, file$3, 21, 8, 556);
				addLoc(td3, file$3, 29, 8, 909);
				addLoc(tr, file$3, 9, 4, 310);
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
						if_block2 = create_if_block_1$1(component, ctx);
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
		this._state = assign(data$3(), options.data);

		this._recompute({ isAdmin: 1, isTeamOwner: 1, users: 1, sortedUsers: 1, numCharts: 1, team: 1 }, this._state);
		if (!('isAdmin' in this._state)) console.warn("<UserTable> was created without expected data property 'isAdmin'");
		if (!('isTeamOwner' in this._state)) console.warn("<UserTable> was created without expected data property 'isTeamOwner'");
		if (!('users' in this._state)) console.warn("<UserTable> was created without expected data property 'users'");


		if (!('team' in this._state)) console.warn("<UserTable> was created without expected data property 'team'");



		if (!('editId' in this._state)) console.warn("<UserTable> was created without expected data property 'editId'");

		if (!('updating' in this._state)) console.warn("<UserTable> was created without expected data property 'updating'");
		this._intro = true;

		this._fragment = create_main_fragment$3(this, this._state);

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

		if (changed.sortedUsers) {
			if (this._differs(state.numUsers, (state.numUsers = numUsers(state)))) changed.numUsers = true;
		}

		if (changed.users) {
			if (this._differs(state.numCharts, (state.numCharts = numCharts(state)))) changed.numCharts = true;
		}

		if (changed.numCharts || changed.isAdmin || changed.team) {
			if (this._differs(state.numChartsCaption, (state.numChartsCaption = numChartsCaption(state)))) changed.numChartsCaption = true;
		}
	};

	/* home/david/Projects/core/libs/controls/v2/DropdownInput.html generated by Svelte v2.16.1 */

	function data$4() {
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

	const file$4 = "home/david/Projects/core/libs/controls/v2/DropdownInput.html";

	function create_main_fragment$4(component, ctx) {
		var div, a, slot_content_button = component._slotted.button, button, i, i_class_value, text;

		function onwindowclick(event) {
			component.windowClick(event);	}
		window.addEventListener("click", onwindowclick);

		function click_handler(event) {
			component.toggle(event);
		}

		var if_block = (ctx.visible) && create_if_block$4(component, ctx);

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
					addLoc(i, file$4, 5, 42, 264);
					button.className = "btn btn-small";
					addLoc(button, file$4, 5, 12, 234);
				}
				addListener(a, "click", click_handler);
				a.href = "#dropdown-btn";
				a.className = "base-drop-btn svelte-1jdtmzv";
				addLoc(a, file$4, 3, 4, 110);
				setStyle(div, "position", "relative");
				setStyle(div, "display", "inline-block");
				addLoc(div, file$4, 2, 0, 49);
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
						if_block = create_if_block$4(component, ctx);
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
	function create_if_block$4(component, ctx) {
		var div1, slot_content_content = component._slotted.content, div0;

		return {
			c: function create() {
				div1 = createElement("div");
				if (!slot_content_content) {
					div0 = createElement("div");
					div0.textContent = "DropdownControl content";
				}
				if (!slot_content_content) {
					div0.className = "base-dropdown-inner svelte-1jdtmzv";
					addLoc(div0, file$4, 11, 12, 490);
				}
				setStyle(div1, "width", ctx.width);
				div1.className = "dropdown-menu base-dropdown-content svelte-1jdtmzv";
				addLoc(div1, file$4, 9, 4, 376);
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

	function DropdownInput(options) {
		this._debugName = '<DropdownInput>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$4(), options.data);
		if (!('visible' in this._state)) console.warn("<DropdownInput> was created without expected data property 'visible'");
		if (!('width' in this._state)) console.warn("<DropdownInput> was created without expected data property 'width'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$4(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(DropdownInput.prototype, protoDev);
	assign(DropdownInput.prototype, methods$3);

	DropdownInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/DropdownListInput.html generated by Svelte v2.16.1 */

	function data$5() {
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

	const file$5 = "home/david/Projects/core/libs/controls/v2/DropdownListInput.html";

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

	function create_main_fragment$5(component, ctx) {
		var div, text0, button, text1, ul;

		var if_block0 = (ctx.split) && create_if_block_3$1(component, ctx);

		function select_block_type(ctx) {
			if (ctx.split) return create_if_block$5;
			return create_else_block$2;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type(component, ctx);

		var each_value = ctx.items;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(component, get_each_context$3(ctx, each_value, i));
		}

		var dropdowninput_initial_data = { disabled: ctx.disabled };
		var dropdowninput = new DropdownInput({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), content: createFragment(), button: createFragment() },
			data: dropdowninput_initial_data
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

				dropdowninput._fragment.c();
				button.disabled = ctx.disabled;
				button.className = "" + ctx.btnClass + " svelte-1qu0vk";
				addLoc(button, file$5, 67, 8, 1600);
				setAttribute(div, "slot", "button");
				div.className = "btn-group";
				addLoc(div, file$5, 61, 4, 1307);
				setAttribute(ul, "slot", "content");
				ul.className = "svelte-1qu0vk";
				addLoc(ul, file$5, 77, 4, 1944);
			},

			m: function mount(target, anchor) {
				append(dropdowninput._slotted.button, div);
				if (if_block0) if_block0.m(div, null);
				append(div, text0);
				append(div, button);
				if_block1.m(button, null);
				append(dropdowninput._slotted.default, text1);
				append(dropdowninput._slotted.content, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				dropdowninput._mount(target, anchor);
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

				var dropdowninput_changes = {};
				if (changed.disabled) dropdowninput_changes.disabled = ctx.disabled;
				dropdowninput._set(dropdowninput_changes);
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d();
				if_block1.d();

				destroyEach(each_blocks, detach);

				dropdowninput.destroy(detach);
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
				addLoc(button, file$5, 63, 8, 1373);
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
				addLoc(i, file$5, 64, 22, 1518);
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

		var if_block0 = (ctx.icon) && create_if_block_2$1(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.label) return create_if_block_1$2;
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
						if_block0 = create_if_block_2$1(component, ctx);
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
	function create_if_block$5(component, ctx) {
		var span;

		return {
			c: function create() {
				span = createElement("span");
				span.className = "caret";
				addLoc(span, file$5, 69, 12, 1686);
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
	function create_if_block_2$1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "" + ctx.icon + " svelte-1qu0vk";
				addLoc(i, file$5, 70, 30, 1744);
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
				addLoc(i, file$5, 72, 12, 1853);
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
	function create_if_block_1$2(component, ctx) {
		var raw_before, raw_after, text, span;

		return {
			c: function create() {
				raw_before = createElement('noscript');
				raw_after = createElement('noscript');
				text = createText(" ");
				span = createElement("span");
				span.className = "caret";
				addLoc(span, file$5, 70, 84, 1798);
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
				addLoc(a, file$5, 80, 12, 2019);
				li.className = "svelte-1qu0vk";
				addLoc(li, file$5, 79, 8, 2002);
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

	function DropdownListInput(options) {
		this._debugName = '<DropdownListInput>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$5(), options.data);
		if (!('disabled' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'disabled'");
		if (!('split' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'split'");
		if (!('btnClass' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'btnClass'");
		if (!('icon' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'icon'");
		if (!('label' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'label'");
		if (!('items' in this._state)) console.warn("<DropdownListInput> was created without expected data property 'items'");
		this._intro = true;

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(DropdownListInput.prototype, protoDev);
	assign(DropdownListInput.prototype, methods$4);

	DropdownListInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/FormBlock.html generated by Svelte v2.16.1 */

	function data$6() {
	    return {
	        label: '',
	        help: '',
	        error: false,
	        success: false,
	        width: 'auto'
	    };
	}
	const file$6 = "home/david/Projects/core/libs/controls/v2/FormBlock.html";

	function create_main_fragment$6(component, ctx) {
		var div1, text0, div0, slot_content_default = component._slotted.default, text1, text2, text3;

		var if_block0 = (ctx.label) && create_if_block_3$2(component, ctx);

		var if_block1 = (ctx.success) && create_if_block_2$2(component, ctx);

		var if_block2 = (ctx.error) && create_if_block_1$3(component, ctx);

		var if_block3 = (!ctx.success && !ctx.error && ctx.help) && create_if_block$6(component, ctx);

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
				addLoc(div0, file$6, 4, 4, 158);
				div1.className = "form-block svelte-1nkiaxn";
				setStyle(div1, "width", ctx.width);
				toggleClass(div1, "success", ctx.success);
				toggleClass(div1, "error", ctx.error);
				addLoc(div1, file$6, 0, 0, 0);
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
						if_block1 = create_if_block_2$2(component, ctx);
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
						if_block2 = create_if_block_1$3(component, ctx);
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
						if_block3 = create_if_block$6(component, ctx);
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
				addLoc(label, file$6, 2, 4, 93);
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
	function create_if_block_2$2(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help success svelte-1nkiaxn";
				addLoc(div, file$6, 8, 4, 236);
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
	function create_if_block_1$3(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help error svelte-1nkiaxn";
				addLoc(div, file$6, 10, 4, 310);
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
	function create_if_block$6(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "help svelte-1nkiaxn";
				addLoc(div, file$6, 12, 4, 401);
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
		this._state = assign(data$6(), options.data);
		if (!('width' in this._state)) console.warn("<FormBlock> was created without expected data property 'width'");
		if (!('label' in this._state)) console.warn("<FormBlock> was created without expected data property 'label'");
		if (!('success' in this._state)) console.warn("<FormBlock> was created without expected data property 'success'");
		if (!('error' in this._state)) console.warn("<FormBlock> was created without expected data property 'error'");
		if (!('help' in this._state)) console.warn("<FormBlock> was created without expected data property 'help'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$6(this, this._state);

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
	function data$7() {
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
	const file$7 = "team-settings/tabs/members/InviteUser.html";

	function create_main_fragment$7(component, ctx) {
		var div, input, input_updating = false, text;

		function input_input_handler() {
			input_updating = true;
			component.set({ inviteeEmail: input.value });
			input_updating = false;
		}

		var dropdownlistinput_initial_data = {
		 	disabled: !ctx.isValidEmail,
		 	label: "<i class='fa " + (ctx.currentAction.updatingUsers ? 'fa-spin fa-circle-o-notch' : 'fa-envelope') + "'></i>  " + __('teams / invite' ),
		 	items: ctx.inviteOptions
		 };
		var dropdownlistinput = new DropdownListInput({
			root: component.root,
			store: component.store,
			data: dropdownlistinput_initial_data
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
				dropdownlistinput._fragment.c();
				formblock._fragment.c();
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.width = "1px";
				input.placeholder = __('teams / invite-user / eg' );
				input.className = "svelte-m6ws61";
				addLoc(input, file$7, 7, 8, 190);
				div.className = "flex svelte-m6ws61";
				addLoc(div, file$7, 6, 4, 163);
			},

			m: function mount(target, anchor) {
				append(formblock._slotted.default, div);
				append(div, input);

				input.value = ctx.inviteeEmail;

				append(div, text);
				dropdownlistinput._mount(div, null);
				formblock._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (!input_updating && changed.inviteeEmail) input.value = ctx.inviteeEmail;

				var dropdownlistinput_changes = {};
				if (changed.isValidEmail) dropdownlistinput_changes.disabled = !ctx.isValidEmail;
				if (changed.currentAction) dropdownlistinput_changes.label = "<i class='fa " + (ctx.currentAction.updatingUsers ? 'fa-spin fa-circle-o-notch' : 'fa-envelope') + "'></i>  " + __('teams / invite' );
				if (changed.inviteOptions) dropdownlistinput_changes.items = ctx.inviteOptions;
				dropdownlistinput._set(dropdownlistinput_changes);

				var formblock_changes = {};
				if (changed.successMessage) formblock_changes.success = ctx.successMessage;
				if (changed.errorMessage) formblock_changes.error = ctx.errorMessage;
				formblock._set(formblock_changes);
			},

			d: function destroy(detach) {
				removeListener(input, "input", input_input_handler);
				dropdownlistinput.destroy();
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
		this._state = assign(data$7(), options.data);

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

		this._fragment = create_main_fragment$7(this, this._state);

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
	function data$8() {
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
	const file$8 = "team-settings/tabs/Members.html";

	function create_main_fragment$8(component, ctx) {
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

		var if_block = (ctx.awaitLoadingUsers) && create_if_block$7(component, ctx);

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
				addLoc(p, file$8, 0, 0, 0);
				div0.className = "span4";
				addLoc(div0, file$8, 5, 4, 118);
				td0.className = "svelte-hgmegl";
				addLoc(td0, file$8, 18, 20, 501);
				th0.className = "svelte-hgmegl";
				addLoc(th0, file$8, 19, 20, 528);
				th1.className = "svelte-hgmegl";
				addLoc(th1, file$8, 20, 20, 593);
				th2.className = "svelte-hgmegl";
				addLoc(th2, file$8, 21, 20, 657);
				addLoc(tr0, file$8, 17, 16, 476);
				addLoc(thead, file$8, 16, 12, 452);
				td1.className = "svelte-hgmegl";
				addLoc(td1, file$8, 26, 20, 805);
				i0.className = "im im-check-mark svelte-hgmegl";
				addLoc(i0, file$8, 27, 24, 883);
				td2.className = "svelte-hgmegl";
				addLoc(td2, file$8, 27, 20, 879);
				i1.className = "im im-check-mark svelte-hgmegl";
				addLoc(i1, file$8, 28, 24, 945);
				td3.className = "svelte-hgmegl";
				addLoc(td3, file$8, 28, 20, 941);
				i2.className = "im im-check-mark svelte-hgmegl";
				addLoc(i2, file$8, 29, 24, 1007);
				td4.className = "svelte-hgmegl";
				addLoc(td4, file$8, 29, 20, 1003);
				addLoc(tr1, file$8, 25, 16, 780);
				td5.className = "svelte-hgmegl";
				addLoc(td5, file$8, 33, 20, 1109);
				i3.className = "im im-check-mark svelte-hgmegl";
				addLoc(i3, file$8, 34, 24, 1188);
				td6.className = "svelte-hgmegl";
				addLoc(td6, file$8, 34, 20, 1184);
				i4.className = "im im-check-mark svelte-hgmegl";
				addLoc(i4, file$8, 35, 24, 1250);
				td7.className = "svelte-hgmegl";
				addLoc(td7, file$8, 35, 20, 1246);
				i5.className = "im im-check-mark svelte-hgmegl";
				addLoc(i5, file$8, 36, 24, 1312);
				td8.className = "svelte-hgmegl";
				addLoc(td8, file$8, 36, 20, 1308);
				addLoc(tr2, file$8, 32, 16, 1084);
				td9.className = "svelte-hgmegl";
				addLoc(td9, file$8, 40, 20, 1414);
				i6.className = "im im-x-mark svelte-hgmegl";
				addLoc(i6, file$8, 41, 24, 1496);
				td10.className = "svelte-hgmegl";
				addLoc(td10, file$8, 41, 20, 1492);
				i7.className = "im im-check-mark svelte-hgmegl";
				addLoc(i7, file$8, 42, 24, 1554);
				td11.className = "svelte-hgmegl";
				addLoc(td11, file$8, 42, 20, 1550);
				i8.className = "im im-check-mark svelte-hgmegl";
				addLoc(i8, file$8, 43, 24, 1616);
				td12.className = "svelte-hgmegl";
				addLoc(td12, file$8, 43, 20, 1612);
				addLoc(tr3, file$8, 39, 16, 1389);
				td13.className = "svelte-hgmegl";
				addLoc(td13, file$8, 47, 20, 1718);
				i9.className = "im im-x-mark svelte-hgmegl";
				addLoc(i9, file$8, 48, 24, 1797);
				td14.className = "svelte-hgmegl";
				addLoc(td14, file$8, 48, 20, 1793);
				i10.className = "im im-check-mark svelte-hgmegl";
				addLoc(i10, file$8, 49, 24, 1855);
				td15.className = "svelte-hgmegl";
				addLoc(td15, file$8, 49, 20, 1851);
				i11.className = "im im-check-mark svelte-hgmegl";
				addLoc(i11, file$8, 50, 24, 1917);
				td16.className = "svelte-hgmegl";
				addLoc(td16, file$8, 50, 20, 1913);
				addLoc(tr4, file$8, 46, 16, 1693);
				td17.className = "svelte-hgmegl";
				addLoc(td17, file$8, 54, 20, 2019);
				i12.className = "im im-x-mark svelte-hgmegl";
				addLoc(i12, file$8, 55, 24, 2106);
				td18.className = "svelte-hgmegl";
				addLoc(td18, file$8, 55, 20, 2102);
				i13.className = "im im-x-mark svelte-hgmegl";
				addLoc(i13, file$8, 56, 24, 2164);
				td19.className = "svelte-hgmegl";
				addLoc(td19, file$8, 56, 20, 2160);
				i14.className = "im im-check-mark svelte-hgmegl";
				addLoc(i14, file$8, 57, 24, 2222);
				td20.className = "svelte-hgmegl";
				addLoc(td20, file$8, 57, 20, 2218);
				addLoc(tr5, file$8, 53, 16, 1994);
				td21.className = "svelte-hgmegl";
				addLoc(td21, file$8, 61, 20, 2324);
				i15.className = "im im-x-mark svelte-hgmegl";
				addLoc(i15, file$8, 62, 24, 2402);
				td22.className = "svelte-hgmegl";
				addLoc(td22, file$8, 62, 20, 2398);
				i16.className = "im im-x-mark svelte-hgmegl";
				addLoc(i16, file$8, 63, 24, 2460);
				td23.className = "svelte-hgmegl";
				addLoc(td23, file$8, 63, 20, 2456);
				i17.className = "im im-check-mark svelte-hgmegl";
				addLoc(i17, file$8, 64, 24, 2518);
				td24.className = "svelte-hgmegl";
				addLoc(td24, file$8, 64, 20, 2514);
				addLoc(tr6, file$8, 60, 16, 2299);
				tbody.className = "svelte-hgmegl";
				addLoc(tbody, file$8, 24, 12, 756);
				table.className = "role-descriptions svelte-hgmegl";
				setStyle(table, "margin-left", "3em");
				addLoc(table, file$8, 15, 8, 380);
				div1.className = "span6";
				addLoc(div1, file$8, 14, 4, 352);
				div2.className = "row";
				setStyle(div2, "margin-bottom", "2em");
				addLoc(div2, file$8, 4, 0, 68);
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
						if_block = create_if_block$7(component, ctx);
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
	function create_if_block$7(component, ctx) {
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
				addLoc(i, file$8, 72, 3, 2689);
				addLoc(p, file$8, 72, 0, 2686);
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
		this._state = assign(data$8(), options.data);

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

		this._fragment = create_main_fragment$8(this, this._state);

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

	/* home/david/Projects/core/libs/controls/v2/HelpDisplay.html generated by Svelte v2.16.1 */

	function data$9() {
	    return {
	        visible: false,
	        class: ''
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

	const file$9 = "home/david/Projects/core/libs/controls/v2/HelpDisplay.html";

	function create_main_fragment$9(component, ctx) {
		var div, span, text_1, div_class_value;

		var if_block = (ctx.visible) && create_if_block$8(component);

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
				addLoc(span, file$9, 1, 4, 77);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = div_class_value = "help " + ctx.class + " svelte-9o0fpa";
				addLoc(div, file$9, 0, 0, 0);
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
						if_block = create_if_block$8(component);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.class) && div_class_value !== (div_class_value = "help " + ctx.class + " svelte-9o0fpa")) {
					div.className = div_class_value;
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
	function create_if_block$8(component, ctx) {
		var div, i, text, slot_content_default = component._slotted.default, slot_content_default_before;

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text = createText("\n        ");
				i.className = "hat-icon im im-graduation-hat svelte-9o0fpa";
				addLoc(i, file$9, 4, 8, 162);
				div.className = "content svelte-9o0fpa";
				addLoc(div, file$9, 3, 4, 132);
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

	function HelpDisplay(options) {
		this._debugName = '<HelpDisplay>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$9(), options.data);
		if (!('class' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'class'");
		if (!('visible' in this._state)) console.warn("<HelpDisplay> was created without expected data property 'visible'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$9(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(HelpDisplay.prototype, protoDev);
	assign(HelpDisplay.prototype, methods$7);

	HelpDisplay.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/ControlGroup.html generated by Svelte v2.16.1 */

	function data$a() {
	    return {
	        disabled: false,
	        help: false,
	        helpClass: false,
	        miniHelp: false,
	        label: false,
	        labelHelp: false,
	        inline: false,
	        labelWidth: false,
	        type: 'default',
	        valign: 'baseline'
	    };
	}
	var def = {
	    labelWidth: '100px'
	};

	const file$a = "home/david/Projects/core/libs/controls/v2/ControlGroup.html";

	function create_main_fragment$a(component, ctx) {
		var text0, div1, text1, div0, slot_content_default = component._slotted.default, text2, div1_class_value;

		var if_block0 = (ctx.help) && create_if_block_3$3(component, ctx);

		var if_block1 = (ctx.label) && create_if_block_1$4(component, ctx);

		var if_block2 = (ctx.miniHelp) && create_if_block$9(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text0 = createText("\n\n");
				div1 = createElement("div");
				if (if_block1) if_block1.c();
				text1 = createText("\n    ");
				div0 = createElement("div");
				text2 = createText("\n    ");
				if (if_block2) if_block2.c();
				div0.className = "controls svelte-1ykzs2h";
				setStyle(div0, "width", "calc(100% - " + (ctx.labelWidth||def.labelWidth) + " - 32px)");
				toggleClass(div0, "form-inline", ctx.inline);
				addLoc(div0, file$a, 14, 4, 423);
				div1.className = div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-1ykzs2h";
				addLoc(div1, file$a, 6, 0, 95);
			},

			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, div1, anchor);
				if (if_block1) if_block1.m(div1, null);
				append(div1, text1);
				append(div1, div0);

				if (slot_content_default) {
					append(div0, slot_content_default);
				}

				append(div1, text2);
				if (if_block2) if_block2.m(div1, null);
			},

			p: function update(changed, ctx) {
				if (ctx.help) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_3$3(component, ctx);
						if_block0.c();
						if_block0.m(text0.parentNode, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (ctx.label) {
					if (if_block1) {
						if_block1.p(changed, ctx);
					} else {
						if_block1 = create_if_block_1$4(component, ctx);
						if_block1.c();
						if_block1.m(div1, text1);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (changed.labelWidth) {
					setStyle(div0, "width", "calc(100% - " + (ctx.labelWidth||def.labelWidth) + " - 32px)");
				}

				if (changed.inline) {
					toggleClass(div0, "form-inline", ctx.inline);
				}

				if (ctx.miniHelp) {
					if (if_block2) {
						if_block2.p(changed, ctx);
					} else {
						if_block2 = create_if_block$9(component, ctx);
						if_block2.c();
						if_block2.m(div1, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if ((changed.type || changed.valign) && div1_class_value !== (div1_class_value = "control-group vis-option-group vis-option-group-" + ctx.type + " label-" + ctx.valign + " svelte-1ykzs2h")) {
					div1.className = div1_class_value;
				}
			},

			d: function destroy(detach) {
				if (if_block0) if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(div1);
				}

				if (if_block1) if_block1.d();

				if (slot_content_default) {
					reinsertChildren(div0, slot_content_default);
				}

				if (if_block2) if_block2.d();
			}
		};
	}

	// (1:0) {#if help}
	function create_if_block_3$3(component, ctx) {
		var div;

		var helpdisplay_initial_data = { class: ctx.helpClass };
		var helpdisplay = new HelpDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: helpdisplay_initial_data
		});

		return {
			c: function create() {
				div = createElement("div");
				helpdisplay._fragment.c();
				addLoc(div, file$a, 2, 4, 49);
			},

			m: function mount(target, anchor) {
				append(helpdisplay._slotted.default, div);
				div.innerHTML = ctx.help;
				helpdisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}

				var helpdisplay_changes = {};
				if (changed.helpClass) helpdisplay_changes.class = ctx.helpClass;
				helpdisplay._set(helpdisplay_changes);
			},

			d: function destroy(detach) {
				helpdisplay.destroy(detach);
			}
		};
	}

	// (8:4) {#if label}
	function create_if_block_1$4(component, ctx) {
		var label, raw_after, text;

		var if_block = (ctx.labelHelp) && create_if_block_2$3(component, ctx);

		return {
			c: function create() {
				label = createElement("label");
				raw_after = createElement('noscript');
				text = createText(" ");
				if (if_block) if_block.c();
				setStyle(label, "width", (ctx.labelWidth||def.labelWidth));
				label.className = "control-label svelte-1ykzs2h";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$a, 8, 4, 199);
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
						if_block = create_if_block_2$3(component, ctx);
						if_block.c();
						if_block.m(label, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (changed.labelWidth) {
					setStyle(label, "width", (ctx.labelWidth||def.labelWidth));
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

	// (10:24) {#if labelHelp}
	function create_if_block_2$3(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.className = "mini-help mt-1";
				addLoc(p, file$a, 10, 8, 334);
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

	// (18:4) {#if miniHelp}
	function create_if_block$9(component, ctx) {
		var p, p_class_value;

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.labelWidth||def.labelWidth));
				p.className = p_class_value = "mt-1 mini-help " + ctx.type + " svelte-1ykzs2h";
				toggleClass(p, "mini-help-block", !ctx.inline);
				addLoc(p, file$a, 18, 4, 588);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.miniHelp;
			},

			p: function update(changed, ctx) {
				if (changed.miniHelp) {
					p.innerHTML = ctx.miniHelp;
				}

				if (changed.inline || changed.labelWidth) {
					setStyle(p, "padding-left", (ctx.inline ? 0 : ctx.labelWidth||def.labelWidth));
				}

				if ((changed.type) && p_class_value !== (p_class_value = "mt-1 mini-help " + ctx.type + " svelte-1ykzs2h")) {
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
		this._state = assign(data$a(), options.data);
		if (!('help' in this._state)) console.warn("<ControlGroup> was created without expected data property 'help'");
		if (!('helpClass' in this._state)) console.warn("<ControlGroup> was created without expected data property 'helpClass'");
		if (!('type' in this._state)) console.warn("<ControlGroup> was created without expected data property 'type'");
		if (!('valign' in this._state)) console.warn("<ControlGroup> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<ControlGroup> was created without expected data property 'label'");
		if (!('labelWidth' in this._state)) console.warn("<ControlGroup> was created without expected data property 'labelWidth'");
		if (!('labelHelp' in this._state)) console.warn("<ControlGroup> was created without expected data property 'labelHelp'");
		if (!('inline' in this._state)) console.warn("<ControlGroup> was created without expected data property 'inline'");
		if (!('miniHelp' in this._state)) console.warn("<ControlGroup> was created without expected data property 'miniHelp'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$a(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(ControlGroup.prototype, protoDev);

	ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/RadioControl.html generated by Svelte v2.16.1 */

	function data$b() {
	    return {
	        value: null,
	        disabled: false,
	        disabledMessage: '',
	        indeterminate: false,
	        label: '',
	        labelWidth: 'auto',
	        help: null,
	        miniHelp: null,
	        valign: 'top',
	        inline: true
	    };
	}
	function onstate$1({ changed, previous }) {
	    if (previous && changed.value) {
	        this.set({ indeterminate: false });
	    }
	}
	const file$b = "home/david/Projects/core/libs/controls/v2/RadioControl.html";

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
		 	labelWidth: ctx.labelWidth,
		 	valign: ctx.valign,
		 	label: ctx.label,
		 	disabled: ctx.disabled,
		 	help: ctx.help,
		 	miniHelp: ctx.miniHelp
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		var if_block = (ctx.disabled && ctx.disabledMessage) && create_if_block$a(component, ctx);

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
				div.className = "svelte-b3e9e4";
				toggleClass(div, "inline", ctx.inline);
				toggleClass(div, "indeterminate", ctx.indeterminate);
				addLoc(div, file$b, 1, 4, 91);
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
				if (changed.labelWidth) controlgroup_changes.labelWidth = ctx.labelWidth;
				if (changed.valign) controlgroup_changes.valign = ctx.valign;
				if (changed.label) controlgroup_changes.label = ctx.label;
				if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;
				if (changed.help) controlgroup_changes.help = ctx.help;
				if (changed.miniHelp) controlgroup_changes.miniHelp = ctx.miniHelp;
				controlgroup._set(controlgroup_changes);

				if (ctx.disabled && ctx.disabledMessage) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$a(component, ctx);
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
				div.className = "help svelte-b3e9e4";
				addLoc(div, file$b, 9, 12, 498);
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
				input.className = "svelte-b3e9e4";
				addLoc(input, file$b, 4, 12, 256);
				span0.className = "css-ui svelte-b3e9e4";
				addLoc(span0, file$b, 5, 12, 343);
				span1.className = "inner-label svelte-b3e9e4";
				addLoc(span1, file$b, 5, 46, 377);
				label.title = label_title_value = ctx.opt.tooltip||'';
				label.className = "svelte-b3e9e4";
				toggleClass(label, "disabled", ctx.disabled);
				toggleClass(label, "has-help", ctx.opt.help);
				addLoc(label, file$b, 3, 8, 169);
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

	// (20:0) {#if disabled && disabledMessage}
	function create_if_block$a(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "disabled-message svelte-b3e9e4";
				addLoc(div, file$b, 20, 0, 695);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.disabledMessage;
			},

			p: function update(changed, ctx) {
				if (changed.disabledMessage) {
					div.innerHTML = ctx.disabledMessage;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function RadioControl(options) {
		this._debugName = '<RadioControl>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$b(), options.data);
		if (!('labelWidth' in this._state)) console.warn("<RadioControl> was created without expected data property 'labelWidth'");
		if (!('valign' in this._state)) console.warn("<RadioControl> was created without expected data property 'valign'");
		if (!('label' in this._state)) console.warn("<RadioControl> was created without expected data property 'label'");
		if (!('disabled' in this._state)) console.warn("<RadioControl> was created without expected data property 'disabled'");
		if (!('help' in this._state)) console.warn("<RadioControl> was created without expected data property 'help'");
		if (!('miniHelp' in this._state)) console.warn("<RadioControl> was created without expected data property 'miniHelp'");
		if (!('options' in this._state)) console.warn("<RadioControl> was created without expected data property 'options'");
		if (!('value' in this._state)) console.warn("<RadioControl> was created without expected data property 'value'");
		if (!('disabledMessage' in this._state)) console.warn("<RadioControl> was created without expected data property 'disabledMessage'");
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

	assign(RadioControl.prototype, protoDev);

	RadioControl.prototype._checkReadOnly = function _checkReadOnly(newState) {
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
	const file$c = "team-settings/tabs/Settings.html";

	function create_main_fragment$c(component, ctx) {
		var div1, div0, p, raw_value = __('teams / defaults / p'), text0, input, input_updating = false, text1, radiocontrol0_updating = {}, text2, h3, text3_value = __('teams / defaults / h3'), text3, text4, selectinput0_updating = {}, text5, selectinput1_updating = {}, text6, selectinput2_updating = {}, text7, radiocontrol1_updating = {}, text8;

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

		var radiocontrol0_initial_data = { label: "", options: [ {label: __('teams / defaults / expanded' ), value: 'expanded'}, {label: __('teams / defaults / collapsed' ), value: 'collapsed'}] };
		if (ctx.settings.folders !== void 0) {
			radiocontrol0_initial_data.value = ctx.settings.folders;
			radiocontrol0_updating.value = true;
		}
		var radiocontrol0 = new RadioControl({
			root: component.root,
			store: component.store,
			data: radiocontrol0_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!radiocontrol0_updating.value && changed.value) {
					ctx.settings.folders = childState.value;
					newState.settings = ctx.settings;
				}
				component._set(newState);
				radiocontrol0_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			radiocontrol0._bind({ value: 1 }, radiocontrol0.get());
		});

		var formblock1_initial_data = { label: __('teams / defaults / folder-status' ), help: __('teams / defaults / folder-status / p' ) };
		var formblock1 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock1_initial_data
		});

		var selectinput0_initial_data = { options: ctx.themes };
		if (ctx.defaultTheme !== void 0) {
			selectinput0_initial_data.value = ctx.defaultTheme;
			selectinput0_updating.value = true;
		}
		var selectinput0 = new SelectInput({
			root: component.root,
			store: component.store,
			data: selectinput0_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectinput0_updating.value && changed.value) {
					newState.defaultTheme = childState.value;
				}
				component._set(newState);
				selectinput0_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput0._bind({ value: 1 }, selectinput0.get());
		});

		var formblock2_initial_data = { label: __('teams / defaults / theme' ), help: __('teams / defaults / theme / p' ) };
		var formblock2 = new FormBlock({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: formblock2_initial_data
		});

		var selectinput1_initial_data = { options: ctx.folders };
		if (ctx.settings.default.folder !== void 0) {
			selectinput1_initial_data.value = ctx.settings.default.folder;
			selectinput1_updating.value = true;
		}
		var selectinput1 = new SelectInput({
			root: component.root,
			store: component.store,
			data: selectinput1_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectinput1_updating.value && changed.value) {
					ctx.settings.default.folder = childState.value;
					newState.settings = ctx.settings;
				}
				component._set(newState);
				selectinput1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput1._bind({ value: 1 }, selectinput1.get());
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

		var selectinput2_initial_data = { options: ctx.localeOptions };
		if (ctx.settings.default.locale !== void 0) {
			selectinput2_initial_data.value = ctx.settings.default.locale;
			selectinput2_updating.value = true;
		}
		var selectinput2 = new SelectInput({
			root: component.root,
			store: component.store,
			data: selectinput2_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectinput2_updating.value && changed.value) {
					ctx.settings.default.locale = childState.value;
					newState.settings = ctx.settings;
				}
				component._set(newState);
				selectinput2_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput2._bind({ value: 1 }, selectinput2.get());
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

		var radiocontrol1_initial_data = { label: "", options: ctx.embedCodes };
		if (ctx.settings.embed.preferred_embed !== void 0) {
			radiocontrol1_initial_data.value = ctx.settings.embed.preferred_embed;
			radiocontrol1_updating.value = true;
		}
		var radiocontrol1 = new RadioControl({
			root: component.root,
			store: component.store,
			data: radiocontrol1_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!radiocontrol1_updating.value && changed.value) {
					ctx.settings.embed.preferred_embed = childState.value;
					newState.settings = ctx.settings;
				}
				component._set(newState);
				radiocontrol1_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			radiocontrol1._bind({ value: 1 }, radiocontrol1.get());
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

		var if_block = (ctx.settings.embed.preferred_embed == "custom") && create_if_block$b(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				p = createElement("p");
				text0 = createText("\n\n        ");
				input = createElement("input");
				formblock0._fragment.c();
				text1 = createText("\n\n        ");
				radiocontrol0._fragment.c();
				formblock1._fragment.c();
				text2 = createText("\n\n        ");
				h3 = createElement("h3");
				text3 = createText(text3_value);
				text4 = createText("\n\n        ");
				selectinput0._fragment.c();
				formblock2._fragment.c();
				text5 = createText("\n\n        ");
				selectinput1._fragment.c();
				formblock3._fragment.c();
				text6 = createText("\n\n        ");
				selectinput2._fragment.c();
				formblock4._fragment.c();
				text7 = createText("\n\n        ");
				radiocontrol1._fragment.c();
				formblock5._fragment.c();
				text8 = createText("\n\n        ");
				if (if_block) if_block.c();
				setStyle(p, "margin-bottom", "10px");
				addLoc(p, file$c, 2, 8, 50);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.placeholder = "";
				addLoc(input, file$c, 7, 12, 243);
				addLoc(h3, file$c, 21, 8, 788);
				div0.className = "span6";
				addLoc(div0, file$c, 1, 4, 22);
				div1.className = "row";
				addLoc(div1, file$c, 0, 0, 0);
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
				radiocontrol0._mount(formblock1._slotted.default, null);
				formblock1._mount(div0, null);
				append(div0, text2);
				append(div0, h3);
				append(h3, text3);
				append(div0, text4);
				selectinput0._mount(formblock2._slotted.default, null);
				formblock2._mount(div0, null);
				append(div0, text5);
				selectinput1._mount(formblock3._slotted.default, null);
				formblock3._mount(div0, null);
				append(div0, text6);
				selectinput2._mount(formblock4._slotted.default, null);
				formblock4._mount(div0, null);
				append(div0, text7);
				radiocontrol1._mount(formblock5._slotted.default, null);
				formblock5._mount(div0, null);
				append(div0, text8);
				if (if_block) if_block.m(div0, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!input_updating && changed.team) input.value = ctx.team.name;

				var radiocontrol0_changes = {};
				if (!radiocontrol0_updating.value && changed.settings) {
					radiocontrol0_changes.value = ctx.settings.folders;
					radiocontrol0_updating.value = ctx.settings.folders !== void 0;
				}
				radiocontrol0._set(radiocontrol0_changes);
				radiocontrol0_updating = {};

				var selectinput0_changes = {};
				if (changed.themes) selectinput0_changes.options = ctx.themes;
				if (!selectinput0_updating.value && changed.defaultTheme) {
					selectinput0_changes.value = ctx.defaultTheme;
					selectinput0_updating.value = ctx.defaultTheme !== void 0;
				}
				selectinput0._set(selectinput0_changes);
				selectinput0_updating = {};

				var selectinput1_changes = {};
				if (changed.folders) selectinput1_changes.options = ctx.folders;
				if (!selectinput1_updating.value && changed.settings) {
					selectinput1_changes.value = ctx.settings.default.folder;
					selectinput1_updating.value = ctx.settings.default.folder !== void 0;
				}
				selectinput1._set(selectinput1_changes);
				selectinput1_updating = {};

				var selectinput2_changes = {};
				if (changed.localeOptions) selectinput2_changes.options = ctx.localeOptions;
				if (!selectinput2_updating.value && changed.settings) {
					selectinput2_changes.value = ctx.settings.default.locale;
					selectinput2_updating.value = ctx.settings.default.locale !== void 0;
				}
				selectinput2._set(selectinput2_changes);
				selectinput2_updating = {};

				var radiocontrol1_changes = {};
				if (changed.embedCodes) radiocontrol1_changes.options = ctx.embedCodes;
				if (!radiocontrol1_updating.value && changed.settings) {
					radiocontrol1_changes.value = ctx.settings.embed.preferred_embed;
					radiocontrol1_updating.value = ctx.settings.embed.preferred_embed !== void 0;
				}
				radiocontrol1._set(radiocontrol1_changes);
				radiocontrol1_updating = {};

				if (ctx.settings.embed.preferred_embed == "custom") {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$b(component, ctx);
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
				radiocontrol0.destroy();
				formblock1.destroy();
				selectinput0.destroy();
				formblock2.destroy();
				selectinput1.destroy();
				formblock3.destroy();
				selectinput2.destroy();
				formblock4.destroy();
				radiocontrol1.destroy();
				formblock5.destroy();
				if (if_block) if_block.d();
			}
		};
	}

	// (56:8) {#if settings.embed.preferred_embed == "custom"}
	function create_if_block$b(component, ctx) {
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
				addLoc(h3, file$c, 56, 8, 1985);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "text");
				input.placeholder = "e.g. Custom CMS Embed";
				addLoc(input, file$c, 59, 12, 2095);
				addListener(textarea0, "input", textarea0_input_handler);
				textarea0.placeholder = "e.g. This is a custom embed code for our CMS";
				addLoc(textarea0, file$c, 67, 12, 2363);
				addListener(textarea1, "input", textarea1_input_handler);
				textarea1.className = "embedcode svelte-rgtu7e";
				textarea1.placeholder = "<iframe src=\"%chart_url%\" width=\"%chart_width%\" widthheight=\"%chart_height%\"></iframe>";
				addLoc(textarea1, file$c, 77, 12, 2710);
				addLoc(hr, file$c, 83, 8, 2981);
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

	/* home/david/Projects/core/libs/controls/v2/SwitchControl.html generated by Svelte v2.16.1 */



	function data$d() {
	    return {
	        value: false,
	        help: '',
	        disabledMessage: '',
	        disabledState: 'auto',
	        disabled: false,
	        highlight: false,
	        indeterminate: false,
	        hasSlotContent: false
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

	function oncreate$2() {
	    this.set({
	        hasSlotContent: this.options.slots && this.options.slots.default
	    });
	}
	const file$d = "home/david/Projects/core/libs/controls/v2/SwitchControl.html";

	function create_main_fragment$d(component, ctx) {
		var div, text0, label, button, input, input_class_value, text1, span, text2, raw_before, text3, current_block_type_index, if_block1;

		var if_block0 = (ctx.help) && create_if_block_2$4(component, ctx);

		function input_change_handler() {
			component.set({ value: input.checked, indeterminate: input.indeterminate });
		}

		function click_handler(event) {
			component.toggle();
		}

		var if_block_creators = [
			create_if_block$c,
			create_else_block$3
		];

		var if_blocks = [];

		function select_block_type(ctx) {
			if (ctx.disabled && ctx.disabledMessage) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		return {
			c: function create() {
				div = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText("\n\n    ");
				label = createElement("label");
				button = createElement("button");
				input = createElement("input");
				text1 = createText("\n            ");
				span = createElement("span");
				text2 = createText("\n        ");
				raw_before = createElement('noscript');
				text3 = createText("\n\n    ");
				if_block1.c();
				addListener(input, "change", input_change_handler);
				if (!('value' in ctx && 'indeterminate' in ctx)) component.root._beforecreate.push(input_change_handler);
				input.className = input_class_value = "" + (ctx.disabled && ctx.disabledState == 'on' ? 'disabled-force-checked' : ctx.disabled && ctx.disabledState == 'off' ? 'disabled-force-unchecked' : '') + " svelte-o8wpwy";
				input.disabled = ctx.disabled;
				setAttribute(input, "type", "checkbox");
				addLoc(input, file$d, 9, 12, 244);
				span.className = "slider svelte-o8wpwy";
				addLoc(span, file$d, 16, 12, 578);
				addListener(button, "click", click_handler);
				button.className = "switch svelte-o8wpwy";
				addLoc(button, file$d, 8, 8, 188);
				label.className = "switch-outer svelte-o8wpwy";
				toggleClass(label, "disabled", ctx.disabled);
				addLoc(label, file$d, 7, 4, 136);
				div.className = "vis-option-type-switch svelte-o8wpwy";
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

				append(button, text1);
				append(button, span);
				append(label, text2);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", ctx.label);
				append(div, text3);
				if_blocks[current_block_type_index].i(div, null);
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
				if ((changed.disabled || changed.disabledState) && input_class_value !== (input_class_value = "" + (ctx.disabled && ctx.disabledState == 'on' ? 'disabled-force-checked' : ctx.disabled && ctx.disabledState == 'off' ? 'disabled-force-unchecked' : '') + " svelte-o8wpwy")) {
					input.className = input_class_value;
				}

				if (changed.disabled) {
					input.disabled = ctx.disabled;
				}

				if (changed.label) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", ctx.label);
				}

				if (changed.disabled) {
					toggleClass(label, "disabled", ctx.disabled);
				}

				var previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);
				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(changed, ctx);
				} else {
					groupOutros();
					if_block1.o(function() {
						if_blocks[previous_block_index].d(1);
						if_blocks[previous_block_index] = null;
					});

					if_block1 = if_blocks[current_block_type_index];
					if (!if_block1) {
						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
						if_block1.c();
					}
					if_block1.i(div, null);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (if_block0) if_block0.d();
				removeListener(input, "change", input_change_handler);
				removeListener(button, "click", click_handler);
				if_blocks[current_block_type_index].d();
			}
		};
	}

	// (2:4) {#if help}
	function create_if_block_2$4(component, ctx) {
		var div;

		var helpdisplay = new HelpDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				div = createElement("div");
				helpdisplay._fragment.c();
				addLoc(div, file$d, 3, 8, 78);
			},

			m: function mount(target, anchor) {
				append(helpdisplay._slotted.default, div);
				div.innerHTML = ctx.help;
				helpdisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}
			},

			d: function destroy(detach) {
				helpdisplay.destroy(detach);
			}
		};
	}

	// (28:4) {:else}
	function create_else_block$3(component, ctx) {
		var if_block_anchor, current;

		var if_block = (ctx.hasSlotContent && (!ctx.disabled || ctx.disabledState == 'on') && ctx.value && !ctx.indeterminate) && create_if_block_1$6(component);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.i(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				if (ctx.hasSlotContent && (!ctx.disabled || ctx.disabledState == 'on') && ctx.value && !ctx.indeterminate) {
					if (!if_block) {
						if_block = create_if_block_1$6(component);
						if_block.c();
					}
					if_block.i(if_block_anchor.parentNode, if_block_anchor);
				} else if (if_block) {
					groupOutros();
					if_block.o(function() {
						if_block.d(1);
						if_block = null;
					});
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (22:4) {#if disabled && disabledMessage}
	function create_if_block$c(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-o8wpwy";
				addLoc(div0, file$d, 23, 8, 734);
				addLoc(div1, file$d, 22, 4, 703);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				div0.innerHTML = ctx.disabledMessage;
				current = true;
			},

			p: function update(changed, ctx) {
				if (!current || changed.disabledMessage) {
					div0.innerHTML = ctx.disabledMessage;
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

	// (31:4) {#if hasSlotContent && (!disabled || disabledState == 'on') && value && !indeterminate}
	function create_if_block_1$6(component, ctx) {
		var div, slot_content_default = component._slotted.default, div_transition, current;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "switch-content svelte-o8wpwy";
				addLoc(div, file$d, 31, 4, 1013);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				if (slot_content_default) {
					append(div, slot_content_default);
				}

				current = true;
			},

			i: function intro(target, anchor) {
				if (current) return;
				if (component.root._intro) {
					if (div_transition) div_transition.invalidate();

					component.root._aftercreate.push(() => {
						if (!div_transition) div_transition = wrapTransition(component, div, slide, {}, true);
						div_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (!div_transition) div_transition = wrapTransition(component, div, slide, {}, false);
				div_transition.run(0, () => {
					outrocallback();
					div_transition = null;
				});

				current = false;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (slot_content_default) {
					reinsertChildren(div, slot_content_default);
				}

				if (detach) {
					if (div_transition) div_transition.abort();
				}
			}
		};
	}

	function SwitchControl(options) {
		this._debugName = '<SwitchControl>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$d(), options.data);
		if (!('help' in this._state)) console.warn("<SwitchControl> was created without expected data property 'help'");
		if (!('disabled' in this._state)) console.warn("<SwitchControl> was created without expected data property 'disabled'");
		if (!('disabledState' in this._state)) console.warn("<SwitchControl> was created without expected data property 'disabledState'");
		if (!('value' in this._state)) console.warn("<SwitchControl> was created without expected data property 'value'");
		if (!('indeterminate' in this._state)) console.warn("<SwitchControl> was created without expected data property 'indeterminate'");
		if (!('label' in this._state)) console.warn("<SwitchControl> was created without expected data property 'label'");
		if (!('disabledMessage' in this._state)) console.warn("<SwitchControl> was created without expected data property 'disabledMessage'");
		if (!('hasSlotContent' in this._state)) console.warn("<SwitchControl> was created without expected data property 'hasSlotContent'");
		this._intro = true;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$d(this, this._state);

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

	assign(SwitchControl.prototype, protoDev);
	assign(SwitchControl.prototype, methods$8);

	SwitchControl.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* home/david/Projects/core/libs/controls/v2/CheckboxControl.html generated by Svelte v2.16.1 */



	function data$e() {
	    return {
	        value: false,
	        disabled: false,
	        faded: false,
	        compact: false,
	        indeterminate: false,
	        disabledMessage: '',
	        help: false
	    };
	}
	const file$e = "home/david/Projects/core/libs/controls/v2/CheckboxControl.html";

	function create_main_fragment$e(component, ctx) {
		var text0, div, label, input, span, text1, text2, label_class_value, text3;

		var if_block0 = (ctx.help) && create_if_block_1$7(component, ctx);

		function input_change_handler() {
			component.set({ value: input.checked, indeterminate: input.indeterminate });
		}

		var if_block1 = (ctx.disabled && ctx.disabledMessage) && create_if_block$d(component, ctx);

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
				input.className = "svelte-1rmafvf";
				addLoc(input, file$e, 7, 8, 256);
				span.className = "css-ui svelte-1rmafvf";
				addLoc(span, file$e, 7, 95, 343);
				label.className = label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-1rmafvf";
				addLoc(label, file$e, 6, 4, 175);
				div.className = "control-group vis-option-group vis-option-type-checkbox svelte-1rmafvf";
				toggleClass(div, "is-compact", ctx.compact);
				addLoc(div, file$e, 5, 0, 74);
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

				if ((changed.disabled || changed.faded) && label_class_value !== (label_class_value = "checkbox " + (ctx.disabled? 'disabled' :'') + " " + (ctx.faded? 'faded' :'') + " svelte-1rmafvf")) {
					label.className = label_class_value;
				}

				if (ctx.disabled && ctx.disabledMessage) {
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

				if (changed.compact) {
					toggleClass(div, "is-compact", ctx.compact);
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

		var helpdisplay = new HelpDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				div = createElement("div");
				helpdisplay._fragment.c();
				addLoc(div, file$e, 2, 4, 29);
			},

			m: function mount(target, anchor) {
				append(helpdisplay._slotted.default, div);
				div.innerHTML = ctx.help;
				helpdisplay._mount(target, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.help) {
					div.innerHTML = ctx.help;
				}
			},

			d: function destroy(detach) {
				helpdisplay.destroy(detach);
			}
		};
	}

	// (11:4) {#if disabled && disabledMessage}
	function create_if_block$d(component, ctx) {
		var div1, div0, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = "disabled-msg svelte-1rmafvf";
				addLoc(div0, file$e, 12, 8, 476);
				addLoc(div1, file$e, 11, 4, 445);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				div0.innerHTML = ctx.disabledMessage;
				current = true;
			},

			p: function update(changed, ctx) {
				if (!current || changed.disabledMessage) {
					div0.innerHTML = ctx.disabledMessage;
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

	function CheckboxControl(options) {
		this._debugName = '<CheckboxControl>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$e(), options.data);
		if (!('help' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'help'");
		if (!('compact' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'compact'");
		if (!('disabled' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'disabled'");
		if (!('faded' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'faded'");
		if (!('value' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'value'");
		if (!('indeterminate' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'indeterminate'");
		if (!('label' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'label'");
		if (!('disabledMessage' in this._state)) console.warn("<CheckboxControl> was created without expected data property 'disabledMessage'");
		this._intro = true;

		this._fragment = create_main_fragment$e(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(CheckboxControl.prototype, protoDev);

	CheckboxControl.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* team-settings/tabs/DeleteTeam.html generated by Svelte v2.16.1 */



	function data$f() {
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

	function create_main_fragment$f(component, ctx) {
		var p, raw_value = __('teams / delete / p'), text, if_block_anchor, switchcontrol_updating = {};

		var if_block = (ctx.deleteTeam) && create_if_block$e(component, ctx);

		var switchcontrol_initial_data = { label: __('teams / delete / yes') };
		if (ctx.deleteTeam !== void 0) {
			switchcontrol_initial_data.value = ctx.deleteTeam;
			switchcontrol_updating.value = true;
		}
		var switchcontrol = new SwitchControl({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: switchcontrol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!switchcontrol_updating.value && changed.value) {
					newState.deleteTeam = childState.value;
				}
				component._set(newState);
				switchcontrol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			switchcontrol._bind({ value: 1 }, switchcontrol.get());
		});

		return {
			c: function create() {
				p = createElement("p");
				text = createText("\n\n");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				switchcontrol._fragment.c();
				addLoc(p, file$f, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text, anchor);
				if (if_block) if_block.m(switchcontrol._slotted.default, null);
				append(switchcontrol._slotted.default, if_block_anchor);
				switchcontrol._mount(target, anchor);
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

				var switchcontrol_changes = {};
				if (!switchcontrol_updating.value && changed.deleteTeam) {
					switchcontrol_changes.value = ctx.deleteTeam;
					switchcontrol_updating.value = ctx.deleteTeam !== void 0;
				}
				switchcontrol._set(switchcontrol_changes);
				switchcontrol_updating = {};
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
					detachNode(text);
				}

				if (if_block) if_block.d();
				switchcontrol.destroy(detach);
			}
		};
	}

	// (6:4) {#if deleteTeam}
	function create_if_block$e(component, ctx) {
		var p, raw_value = __('teams / delete / really'), text0, checkboxcontrol_updating = {}, text1, if_block_anchor;

		var checkboxcontrol_initial_data = { label: __('teams / delete / really-yes') };
		if (ctx.deleteTeam2 !== void 0) {
			checkboxcontrol_initial_data.value = ctx.deleteTeam2;
			checkboxcontrol_updating.value = true;
		}
		var checkboxcontrol = new CheckboxControl({
			root: component.root,
			store: component.store,
			data: checkboxcontrol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!checkboxcontrol_updating.value && changed.value) {
					newState.deleteTeam2 = childState.value;
				}
				component._set(newState);
				checkboxcontrol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			checkboxcontrol._bind({ value: 1 }, checkboxcontrol.get());
		});

		var if_block = (ctx.deleteTeam2) && create_if_block_1$8(component, ctx);

		return {
			c: function create() {
				p = createElement("p");
				text0 = createText("\n\n    ");
				checkboxcontrol._fragment.c();
				text1 = createText("\n\n    ");
				if (if_block) if_block.c();
				if_block_anchor = createComment();
				addLoc(p, file$f, 6, 4, 153);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
				insert(target, text0, anchor);
				checkboxcontrol._mount(target, anchor);
				insert(target, text1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var checkboxcontrol_changes = {};
				if (!checkboxcontrol_updating.value && changed.deleteTeam2) {
					checkboxcontrol_changes.value = ctx.deleteTeam2;
					checkboxcontrol_updating.value = ctx.deleteTeam2 !== void 0;
				}
				checkboxcontrol._set(checkboxcontrol_changes);
				checkboxcontrol_updating = {};

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

				checkboxcontrol.destroy(detach);
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
				addLoc(i, file$f, 14, 8, 401);
				addListener(button, "click", click_handler);
				button.className = "btn btn-danger";
				addLoc(button, file$f, 13, 4, 337);
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
		this._state = assign(data$f(), options.data);
		if (!('deleteTeam' in this._state)) console.warn("<DeleteTeam> was created without expected data property 'deleteTeam'");
		if (!('deleteTeam2' in this._state)) console.warn("<DeleteTeam> was created without expected data property 'deleteTeam2'");
		if (!('deleting' in this._state)) console.warn("<DeleteTeam> was created without expected data property 'deleting'");
		this._intro = true;

		this._fragment = create_main_fragment$f(this, this._state);

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

	/* home/david/Projects/core/libs/controls/v2/SelectControl.html generated by Svelte v2.16.1 */



	function controlWidth({ inline, width }) {
		return inline ? width || 'auto' : width;
	}

	function labelWidth({ inline, labelWidth }) {
		return inline ? labelWidth || 'auto' : labelWidth;
	}

	function data$g() {
	    return {
	        disabled: false,
	        width: null,
	        labelWidth: null,
	        options: [],
	        optgroups: [],
	        valign: 'middle',
	        inline: false,
	        help: null,
	        miniHelp: null
	    };
	}
	function create_main_fragment$g(component, ctx) {
		var selectinput_updating = {};

		var selectinput_initial_data = { width: ctx.controlWidth, class: "mt-1" };
		if (ctx.value  !== void 0) {
			selectinput_initial_data.value = ctx.value ;
			selectinput_updating.value = true;
		}
		if (ctx.disabled  !== void 0) {
			selectinput_initial_data.disabled = ctx.disabled ;
			selectinput_updating.disabled = true;
		}
		if (ctx.options  !== void 0) {
			selectinput_initial_data.options = ctx.options ;
			selectinput_updating.options = true;
		}
		if (ctx.optgroups  !== void 0) {
			selectinput_initial_data.optgroups = ctx.optgroups ;
			selectinput_updating.optgroups = true;
		}
		var selectinput = new SelectInput({
			root: component.root,
			store: component.store,
			data: selectinput_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectinput_updating.value && changed.value) {
					newState.value = childState.value;
				}

				if (!selectinput_updating.disabled && changed.disabled) {
					newState.disabled = childState.disabled;
				}

				if (!selectinput_updating.options && changed.options) {
					newState.options = childState.options;
				}

				if (!selectinput_updating.optgroups && changed.optgroups) {
					newState.optgroups = childState.optgroups;
				}
				component._set(newState);
				selectinput_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectinput._bind({ value: 1, disabled: 1, options: 1, optgroups: 1 }, selectinput.get());
		});

		selectinput.on("change", function(event) {
			component.fire('change', event);
		});

		var controlgroup_initial_data = {
		 	type: "select",
		 	label: ctx.label,
		 	labelWidth: ctx.labelWidth,
		 	valign: ctx.valign,
		 	disabled: ctx.disabled,
		 	inline: ctx.inline,
		 	miniHelp: ctx.miniHelp,
		 	help: ctx.help,
		 	helpClass: "mt-1"
		 };
		var controlgroup = new ControlGroup({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: controlgroup_initial_data
		});

		return {
			c: function create() {
				selectinput._fragment.c();
				controlgroup._fragment.c();
			},

			m: function mount(target, anchor) {
				selectinput._mount(controlgroup._slotted.default, null);
				controlgroup._mount(target, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectinput_changes = {};
				if (changed.controlWidth) selectinput_changes.width = ctx.controlWidth;
				if (!selectinput_updating.value && changed.value) {
					selectinput_changes.value = ctx.value ;
					selectinput_updating.value = ctx.value  !== void 0;
				}
				if (!selectinput_updating.disabled && changed.disabled) {
					selectinput_changes.disabled = ctx.disabled ;
					selectinput_updating.disabled = ctx.disabled  !== void 0;
				}
				if (!selectinput_updating.options && changed.options) {
					selectinput_changes.options = ctx.options ;
					selectinput_updating.options = ctx.options  !== void 0;
				}
				if (!selectinput_updating.optgroups && changed.optgroups) {
					selectinput_changes.optgroups = ctx.optgroups ;
					selectinput_updating.optgroups = ctx.optgroups  !== void 0;
				}
				selectinput._set(selectinput_changes);
				selectinput_updating = {};

				var controlgroup_changes = {};
				if (changed.label) controlgroup_changes.label = ctx.label;
				if (changed.labelWidth) controlgroup_changes.labelWidth = ctx.labelWidth;
				if (changed.valign) controlgroup_changes.valign = ctx.valign;
				if (changed.disabled) controlgroup_changes.disabled = ctx.disabled;
				if (changed.inline) controlgroup_changes.inline = ctx.inline;
				if (changed.miniHelp) controlgroup_changes.miniHelp = ctx.miniHelp;
				if (changed.help) controlgroup_changes.help = ctx.help;
				controlgroup._set(controlgroup_changes);
			},

			d: function destroy(detach) {
				selectinput.destroy();
				controlgroup.destroy(detach);
			}
		};
	}

	function SelectControl(options) {
		this._debugName = '<SelectControl>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$g(), options.data);

		this._recompute({ inline: 1, width: 1, labelWidth: 1 }, this._state);
		if (!('inline' in this._state)) console.warn("<SelectControl> was created without expected data property 'inline'");
		if (!('width' in this._state)) console.warn("<SelectControl> was created without expected data property 'width'");

		if (!('label' in this._state)) console.warn("<SelectControl> was created without expected data property 'label'");
		if (!('valign' in this._state)) console.warn("<SelectControl> was created without expected data property 'valign'");
		if (!('disabled' in this._state)) console.warn("<SelectControl> was created without expected data property 'disabled'");
		if (!('miniHelp' in this._state)) console.warn("<SelectControl> was created without expected data property 'miniHelp'");
		if (!('help' in this._state)) console.warn("<SelectControl> was created without expected data property 'help'");

		if (!('value' in this._state)) console.warn("<SelectControl> was created without expected data property 'value'");
		if (!('options' in this._state)) console.warn("<SelectControl> was created without expected data property 'options'");
		if (!('optgroups' in this._state)) console.warn("<SelectControl> was created without expected data property 'optgroups'");
		this._intro = true;

		this._fragment = create_main_fragment$g(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(SelectControl.prototype, protoDev);

	SelectControl.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('controlWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<SelectControl>: Cannot set read-only property 'controlWidth'");
		if ('labelWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<SelectControl>: Cannot set read-only property 'labelWidth'");
	};

	SelectControl.prototype._recompute = function _recompute(changed, state) {
		if (changed.inline || changed.width) {
			if (this._differs(state.controlWidth, (state.controlWidth = controlWidth(state)))) changed.controlWidth = true;
		}

		if (changed.inline || changed.labelWidth) {
			if (this._differs(state.labelWidth, (state.labelWidth = labelWidth(state)))) changed.labelWidth = true;
		}
	};

	/* team-settings/tabs/ProductTable.html generated by Svelte v2.16.1 */



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

	function oncreate$3() {
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
			return create_else_block$4;
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
	function create_else_block$4(component, ctx) {
		var text, if_block1_anchor;

		var if_block0 = (ctx.products.length > 0) && create_if_block_4$2(component, ctx);

		var if_block1 = (ctx.addableProducts.length) && create_if_block_2$5(component, ctx);

		return {
			c: function create() {
				if (if_block0) if_block0.c();
				text = createText("\n\n\n");
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

	// (10:0) {#if products.length > 0}
	function create_if_block_4$2(component, ctx) {
		var each_anchor;

		var each_value = ctx.products;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$6(component, get_each_context$5(ctx, each_value, i));
		}

		var tabledisplay_initial_data = { columnHeaders: ctx.productHeaders };
		var tabledisplay = new TableDisplay({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() },
			data: tabledisplay_initial_data
		});

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
				tabledisplay._fragment.c();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(tabledisplay._slotted.default, null);
				}

				append(tabledisplay._slotted.default, each_anchor);
				tabledisplay._mount(target, anchor);
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

				var tabledisplay_changes = {};
				if (changed.productHeaders) tabledisplay_changes.columnHeaders = ctx.productHeaders;
				tabledisplay._set(tabledisplay_changes);
			},

			d: function destroy(detach) {
				destroyEach(each_blocks, detach);

				tabledisplay.destroy(detach);
			}
		};
	}

	// (23:12) {:else}
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

	// (21:12) {#if editId === product.id }
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
				addLoc(input, file$g, 21, 12, 569);
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

	// (34:12) {:else}
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
				addLoc(i0, file$g, 35, 16, 1244);

				button0._svelte = { component, ctx };

				addListener(button0, "click", click_handler_1$1);
				button0.className = "btn";
				addLoc(button0, file$g, 34, 12, 1179);
				i1.className = "fa fa-times";
				addLoc(i1, file$g, 39, 16, 1400);

				button1._svelte = { component, ctx };

				addListener(button1, "click", click_handler_2$1);
				button1.className = "btn";
				addLoc(button1, file$g, 38, 12, 1336);
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

	// (30:42) 
	function create_if_block_6$1(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-spin fa-circle-o-notch";
				addLoc(i, file$g, 31, 16, 1050);
				button.disabled = true;
				button.className = "btn btn-primary";
				addLoc(button, file$g, 30, 12, 992);
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

	// (26:12) {#if editId === product.id }
	function create_if_block_5$1(component, ctx) {
		var button, i, text0, text1_value = __('teams / save' ), text1;

		return {
			c: function create() {
				button = createElement("button");
				i = createElement("i");
				text0 = createText("  ");
				text1 = createText(text1_value);
				i.className = "fa fa-check";
				addLoc(i, file$g, 27, 16, 857);

				button._svelte = { component, ctx };

				addListener(button, "click", click_handler$4);
				button.className = "btn btn-primary";
				addLoc(button, file$g, 26, 12, 780);
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

	// (12:4) {#each products as product, i}
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
				addLoc(td0, file$g, 13, 8, 401);
				addLoc(td1, file$g, 16, 8, 455);
				addLoc(td2, file$g, 19, 8, 511);
				addLoc(td3, file$g, 24, 8, 722);
				addLoc(tr, file$g, 12, 4, 388);
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

	// (50:0) {#if addableProducts.length }
	function create_if_block_2$5(component, ctx) {
		var div1, div0, selectcontrol_updating = {}, text;

		var selectcontrol_initial_data = {
		 	label: __('teams / products / add-product'),
		 	options: ctx.addableProducts
		 };
		if (ctx.addProduct !== void 0) {
			selectcontrol_initial_data.value = ctx.addProduct;
			selectcontrol_updating.value = true;
		}
		var selectcontrol = new SelectControl({
			root: component.root,
			store: component.store,
			data: selectcontrol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!selectcontrol_updating.value && changed.value) {
					newState.addProduct = childState.value;
				}
				component._set(newState);
				selectcontrol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			selectcontrol._bind({ value: 1 }, selectcontrol.get());
		});

		var if_block = (ctx.addProduct) && create_if_block_3$4(component, ctx);

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				selectcontrol._fragment.c();
				text = createText("\n\n    ");
				if (if_block) if_block.c();
				setStyle(div0, "display", "block");
				addLoc(div0, file$g, 51, 4, 1645);
				setStyle(div1, "display", "flex");
				addLoc(div1, file$g, 50, 0, 1612);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				selectcontrol._mount(div0, null);
				append(div1, text);
				if (if_block) if_block.m(div1, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var selectcontrol_changes = {};
				if (changed.addableProducts) selectcontrol_changes.options = ctx.addableProducts;
				if (!selectcontrol_updating.value && changed.addProduct) {
					selectcontrol_changes.value = ctx.addProduct;
					selectcontrol_updating.value = ctx.addProduct !== void 0;
				}
				selectcontrol._set(selectcontrol_changes);
				selectcontrol_updating = {};

				if (ctx.addProduct) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_3$4(component, ctx);
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

				selectcontrol.destroy();
				if (if_block) if_block.d();
			}
		};
	}

	// (60:4) {#if addProduct}
	function create_if_block_3$4(component, ctx) {
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
				addLoc(i, file$g, 62, 12, 2017);
				addListener(button, "click", click_handler_3);
				button.className = "btn btn-primary";
				setStyle(button, "margin-left", "10px");
				addLoc(button, file$g, 61, 8, 1921);
				setStyle(div, "display", "block");
				addLoc(div, file$g, 60, 4, 1883);
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

	function ProductTable(options) {
		this._debugName = '<ProductTable>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$h(), options.data);

		this._recompute({ products: 1, allProducts: 1 }, this._state);
		if (!('products' in this._state)) console.warn("<ProductTable> was created without expected data property 'products'");
		if (!('allProducts' in this._state)) console.warn("<ProductTable> was created without expected data property 'allProducts'");
		if (!('isAdmin' in this._state)) console.warn("<ProductTable> was created without expected data property 'isAdmin'");
		if (!('loadingTeamProducts' in this._state)) console.warn("<ProductTable> was created without expected data property 'loadingTeamProducts'");
		if (!('loadingAllProducts' in this._state)) console.warn("<ProductTable> was created without expected data property 'loadingAllProducts'");
		if (!('productHeaders' in this._state)) console.warn("<ProductTable> was created without expected data property 'productHeaders'");
		if (!('editId' in this._state)) console.warn("<ProductTable> was created without expected data property 'editId'");
		if (!('updating' in this._state)) console.warn("<ProductTable> was created without expected data property 'updating'");

		if (!('addProduct' in this._state)) console.warn("<ProductTable> was created without expected data property 'addProduct'");
		if (!('addingProduct' in this._state)) console.warn("<ProductTable> was created without expected data property 'addingProduct'");
		this._intro = true;

		this._fragment = create_main_fragment$h(this, this._state);

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

	assign(ProductTable.prototype, protoDev);
	assign(ProductTable.prototype, methods$a);

	ProductTable.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('addableProducts' in newState && !this._updatingReadonlyProperty) throw new Error("<ProductTable>: Cannot set read-only property 'addableProducts'");
	};

	ProductTable.prototype._recompute = function _recompute(changed, state) {
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
	                ui: ProductTable,
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

	function oncreate$4() {
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
			oncreate$4.call(this);
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

})));
//# sourceMappingURL=team-settings.js.map
