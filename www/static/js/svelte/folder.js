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

	/**
	 * Download and parse a remote JSON endpoint via POST. credentials
	 * are included automatically
	 *
	 * @param {string} url
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 * @example
	 * import { postJSON } from '@datawrapper/shared/fetch';
	 *
	 * postJSON('http://api.example.org', JSON.stringify({
	 *    query: 'foo',
	 *    page: 12
	 * }));
	 */
	function postJSON(url, body, callback) {
	    return fetchJSON(url, 'POST', 'include', body, callback);
	}

	/**
	 * Download and parse a remote JSON endpoint via PATCH. credentials
	 * are included automatically
	 *
	 * @param {string} url
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 * @example
	 * import { patchJSON } from '@datawrapper/shared/fetch';
	 *
	 * patchJSON('http://api.example.org', JSON.stringify({
	 *    query: 'foo',
	 *    page: 12
	 * }));
	 */
	function patchJSON(url, body, callback) {
	    return fetchJSON(url, 'PATCH', 'include', body, callback);
	}

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



	var find = function(folders, position, ret, parent, team) {
	    if (!folders) { return; }

	    if (ret === 'parent') {
	        if (position.type === 'root') { return null; }
	        if (['user', 'team'].indexOf(position.type) > -1) { return { type: 'root', id: null }; }
	    }

	    for (var i = 0; i < folders.length; i++) {
	        if ((!folders[i].type || folders[i].type === position.type) && folders[i].id === position.id) {
	            if (ret === 'parent') { return parent; }
	            else if (ret === 'team') { return team; }
	            else { return folders[i]; }
	        }

	        if (folders[i].type === 'team') { team = folders[i]; }
	        var child = find(folders[i].folders, position, ret, folders[i], team);
	        if (child) { return child; }
	    }
	};

	function isRoot(ref) {
	    var position = ref.position;

	    return position.type === 'root';
	}
	function folderList(ref) {
	    var position = ref.position;
	    var folders = ref.folders;

	    if (!folders || !folders.length) { return []; }
	    return position.type === 'root' ? folders : find(folders, position).folders;
	}
	function chartList(ref) {
	    var position = ref.position;
	    var folders = ref.folders;

	    if (!folders || !folders.length) { return []; }
	    return position.type === 'root' ? [] : find(folders, position).charts;
	}
	function openLink(ref) {
	    var folders = ref.folders;
	    var position = ref.position;

	    var team = find(folders, position, 'team');

	    if (position.type === 'user') { return '/mycharts'; }
	    else if (position.type === 'team') { return ("/team/" + (position.id)); }
	    else if (team) { return ("/team/" + (team.id) + "/" + (position.id)); }
	    else { return ("/mycharts/" + (position.id)); }
	}
	function data() {
	    return {
	        x: 0,
	        y: 0,
	        chartId: null,
	        position: {
	            type: 'root', // root | user | team | folder
	            id: null
	        },
	        folderName: '',
	        loading: true
	    };
	}
	function icon(type) {
	    return (
	        {
	            user: 'fa fa-user',
	            team: 'fa fa-users'
	        }[type] || 'im im-folder'
	    );
	}
	function chartIcon(chartType) {
	    return chartType === 'tables' ? 'fa fa-table' : chartType.indexOf('map') > -1 ? 'fa fa-map-marker' : 'fa fa-bar-chart-o';
	}
	function label(element) {
	    if (element.type === 'root') { return __('folders / all'); }
	    if (element.type === 'user') { return __('folders / my'); }
	    else { return element.name; }
	}
	var methods = {
	    key: function key(keyCode) {
	        if (keyCode === 13) { this.add(); }
	    },
	    show: function show() {
	        this.set({ show: true });
	    },
	    hide: function hide() {
	        if (this.store) {
	            this.fire('close');
	        } else {
	            window.location.hash = '#';
	        }
	    },
	    add: function add() {
	        var this$1 = this;

	        this.set({ creating: true });
	        var ref = this.get();
	        var position = ref.position;
	        var folderName = ref.folderName;
	        var param = { name: folderName };

	        if (position.type === 'team') { param.organizationId = position.id; }
	        else if (!position.type) { param.parentId = position.id; }

	        postJSON(((window.location.protocol) + "//" + (dw.backend.__api_domain) + "/v3/folders"), JSON.stringify(param), function (res) {
	            this$1.updateFolders(function (folders) {
	                this$1.set({ folderName: '', position: res, create: false, creating: false });
	            });
	        });
	    },
	    up: function up() {
	        var ref = this.get();
	        var position = ref.position;
	        var folders = ref.folders;
	        var create = ref.create;
	        if (create) {
	            this.set({ create: false });
	            return;
	        }
	        var folder = find(folders, position, 'parent');
	        this.set({ position: folder });
	    },
	    move: function move() {
	        var this$1 = this;

	        this.set({ moving: true });

	        var ref = this.get();
	        var position = ref.position;
	        var chartId = ref.chartId;
	        var param = {};

	        if (position.type === 'user') {
	            param = { organizationId: null, folderId: null };
	        } else if (position.type === 'team') {
	            param = { organizationId: position.id, folderId: null };
	        } else {
	            param = { folderId: position.id };
	        }

	        patchJSON(((window.location.protocol) + "//" + (dw.backend.__api_domain) + "/v3/charts/" + chartId), JSON.stringify(param), function (res) {
	            this$1.set({ current: position });

	            this$1.updateFolders(function (folders) {
	                this$1.set({ moving: false, position: find(folders, position) });
	            });
	        });
	    },
	    updateFolders: function updateFolders(callback) {
	        var this$1 = this;

	        getJSON(((window.location.protocol) + "//" + (dw.backend.__api_domain) + "/v3/folders"), 'include', function (folders) {
	            this$1.set({ folders: folders.list });
	            if (typeof callback === 'function') { callback(folders.list); }
	        });
	    }
	};

	function oncreate() {
	    var this$1 = this;

	    var pos = $('.action-move').position();
	    this.set({ x: pos.left, y: pos.top + $('.action-move').outerHeight() + 20 });
	    $(window).on('click', function (event) {
	        if (this$1.get().show && !event.target.closest('.action-move')) {
	            this$1.hide();
	        }
	    });
	}
	function onstate(ref) {
	    var this$1 = this;
	    var changed = ref.changed;
	    var current = ref.current;
	    var previous = ref.previous;

	    if (changed.chartId && current.chartId) {
	        this.set({ loading: true });

	        getJSON(((window.location.protocol) + "//" + (dw.backend.__api_domain) + "/v3/charts/" + (current.chartId)), function (chart) {
	            this$1.updateFolders(function (folders) {
	                var current = {
	                    type: chart.inFolder ? 'folder' : chart.organizationId ? 'team' : 'user',
	                    id: chart.inFolder ? chart.inFolder : chart.organizationId ? chart.organizationId : chart.authorId
	                };

	                var position = find(folders, current) || { type: 'root' };

	                this$1.set({ current: current, loading: false, position: position });
	            });
	        });
	    }
	}
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
			if (ctx.create) { return 1; }
			return 2;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

		function click_handler_1(event) {
			event.stopPropagation();
			component.fire("click", event);
		}

		return {
			c: function create() {
				div = createElement("div");
				if_block.c();
				addListener(div, "click", click_handler_1);
				div.className = "cont svelte-ftgu5o";
				setStyle(div, "left", "" + ctx.x + "px");
				setStyle(div, "top", "" + ctx.y + "px");
				addLoc(div, file, 1, 0, 11);
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

				if (changed.x) {
					setStyle(div, "left", "" + ctx.x + "px");
				}

				if (changed.y) {
					setStyle(div, "top", "" + ctx.y + "px");
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_blocks[current_block_type_index].d();
				removeListener(div, "click", click_handler_1);
			}
		};
	}

	// (25:4) {:else}
	function create_else_block(component, ctx) {
		var div3, div0, i0, div0_style_value, text0, div1, text1, div2, i1, text2, div4, text3, text4, text5, div5, button0, i2, text6, button1, i3, i3_class_value, text7, text8_value = __('folders / move'), text8, current;

		function click_handler(event) {
			component.up();
		}

		function select_block_type_1(ctx) {
			if (!ctx.isRoot) { return create_if_block_4; }
			return create_else_block_1;
		}

		var current_block_type = select_block_type_1(ctx);
		var if_block0 = current_block_type(component, ctx);

		function click_handler_1(event) {
			component.hide();
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

		var if_block1 = (ctx.chartList.length === 0 && ctx.folderList.length === 0) && create_if_block_3();

		function click_handler_2(event) {
			component.set({create: true});
		}

		function click_handler_3(event) {
			component.move();
		}

		return {
			c: function create() {
				div3 = createElement("div");
				div0 = createElement("div");
				i0 = createElement("i");
				text0 = createText("\n\n        ");
				div1 = createElement("div");
				if_block0.c();
				text1 = createText("\n\n        ");
				div2 = createElement("div");
				i1 = createElement("i");
				text2 = createText("\n    ");
				div4 = createElement("div");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text3 = createText(" ");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text4 = createText(" ");
				if (if_block1) { if_block1.c(); }
				text5 = createText("\n    ");
				div5 = createElement("div");
				button0 = createElement("button");
				i2 = createElement("i");
				text6 = createText("\n\n        ");
				button1 = createElement("button");
				i3 = createElement("i");
				text7 = createText("\n            ");
				text8 = createText(text8_value);
				i0.className = "im im-angle-left svelte-ftgu5o";
				addLoc(i0, file, 27, 12, 1195);
				addListener(div0, "click", click_handler);
				div0.className = "up svelte-ftgu5o";
				div0.style.cssText = div0_style_value = ctx.isRoot ? 'visibility: hidden' : '';
				addLoc(div0, file, 26, 8, 1103);
				div1.className = "title svelte-ftgu5o";
				addLoc(div1, file, 30, 8, 1252);
				i1.className = "im im-x-mark svelte-ftgu5o";
				addLoc(i1, file, 37, 12, 1531);
				addListener(div2, "click", click_handler_1);
				div2.className = "close";
				addLoc(div2, file, 36, 8, 1481);
				div3.className = "header svelte-ftgu5o";
				addLoc(div3, file, 25, 4, 1074);
				div4.className = "body svelte-ftgu5o";
				addLoc(div4, file, 40, 4, 1590);
				i2.className = "im im-folder-add";
				addLoc(i2, file, 64, 12, 2499);
				addListener(button0, "click", click_handler_2);
				button0.className = "btn";
				button0.disabled = ctx.isRoot;
				addLoc(button0, file, 63, 8, 2415);
				i3.className = i3_class_value = ctx.moving ? 'fa fa-circle-o-notch fa-spin' : 'im im-check-mark-circle-o';
				addLoc(i3, file, 68, 12, 2642);
				addListener(button1, "click", click_handler_3);
				button1.className = "btn btn-primary";
				button1.disabled = ctx.isRoot;
				addLoc(button1, file, 67, 8, 2559);
				div5.className = "footer svelte-ftgu5o";
				addLoc(div5, file, 62, 4, 2386);
			},

			m: function mount(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div0);
				append(div0, i0);
				append(div3, text0);
				append(div3, div1);
				if_block0.m(div1, null);
				append(div3, text1);
				append(div3, div2);
				append(div2, i1);
				insert(target, text2, anchor);
				insert(target, div4, anchor);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].i(div4, null);
				}

				append(div4, text3);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].i(div4, null);
				}

				append(div4, text4);
				if (if_block1) { if_block1.m(div4, null); }
				insert(target, text5, anchor);
				insert(target, div5, anchor);
				append(div5, button0);
				append(button0, i2);
				append(div5, text6);
				append(div5, button1);
				append(button1, i3);
				append(button1, text7);
				append(button1, text8);
				current = true;
			},

			p: function update(changed, ctx) {
				if ((!current || changed.isRoot) && div0_style_value !== (div0_style_value = ctx.isRoot ? 'visibility: hidden' : '')) {
					div0.style.cssText = div0_style_value;
				}

				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(div1, null);
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
						each0_blocks[i].i(div4, text3);
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
						each1_blocks[i].i(div4, text4);
					}

					groupOutros();
					for (; i < each1_blocks.length; i += 1) { outroBlock_1(i, 1); }
				}

				if (ctx.chartList.length === 0 && ctx.folderList.length === 0) {
					if (!if_block1) {
						if_block1 = create_if_block_3();
						if_block1.c();
						if_block1.m(div4, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!current || changed.isRoot) {
					button0.disabled = ctx.isRoot;
				}

				if ((!current || changed.moving) && i3_class_value !== (i3_class_value = ctx.moving ? 'fa fa-circle-o-notch fa-spin' : 'im im-check-mark-circle-o')) {
					i3.className = i3_class_value;
				}

				if (!current || changed.isRoot) {
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
					detachNode(div3);
				}

				removeListener(div0, "click", click_handler);
				if_block0.d();
				removeListener(div2, "click", click_handler_1);
				if (detach) {
					detachNode(text2);
					detachNode(div4);
				}

				destroyEach(each0_blocks, detach);

				destroyEach(each1_blocks, detach);

				if (if_block1) { if_block1.d(); }
				if (detach) {
					detachNode(text5);
					detachNode(div5);
				}

				removeListener(button0, "click", click_handler_2);
				removeListener(button1, "click", click_handler_3);
			}
		};
	}

	// (7:20) 
	function create_if_block_2(component, ctx) {
		var div1, div0, i0, div0_style_value, text0, input, input_updating = false, text1, button, i1, i1_class_value, button_disabled_value, text2, div3, div2, raw_value = __('folders / create').replace("%folder%", label(ctx.position)), div3_intro, text3, div4, current;

		function click_handler(event) {
			component.up();
		}

		function input_input_handler() {
			input_updating = true;
			component.set({ folderName: input.value });
			input_updating = false;
		}

		function keydown_handler(event) {
			component.key(event.keyCode);
		}

		function click_handler_1(event) {
			component.add();
		}

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				i0 = createElement("i");
				text0 = createText("\n\n        ");
				input = createElement("input");
				text1 = createText("\n\n        ");
				button = createElement("button");
				i1 = createElement("i");
				text2 = createText("\n    ");
				div3 = createElement("div");
				div2 = createElement("div");
				text3 = createText("\n    ");
				div4 = createElement("div");
				i0.className = "im im-angle-left svelte-ftgu5o";
				addLoc(i0, file, 9, 12, 435);
				addListener(div0, "click", click_handler);
				div0.className = "up svelte-ftgu5o";
				div0.style.cssText = div0_style_value = ctx.isRoot ? 'visibility: hidden' : '';
				addLoc(div0, file, 8, 8, 343);
				addListener(input, "input", input_input_handler);
				addListener(input, "keydown", keydown_handler);
				input.autofocus = true;
				input.placeholder = __('folders / untitled');
				setAttribute(input, "type", "text");
				input.className = "svelte-ftgu5o";
				addLoc(input, file, 12, 8, 492);
				i1.className = i1_class_value = "" + (ctx.creating ? 'fa fa-circle-o-notch fa-spin' : 'im im-plus-circle') + " svelte-ftgu5o";
				addLoc(i1, file, 15, 12, 731);
				addListener(button, "click", click_handler_1);
				button.disabled = button_disabled_value = ctx.folderName.length === 0;
				button.className = "btn btn-primary svelte-ftgu5o";
				addLoc(button, file, 14, 8, 632);
				div1.className = "header svelte-ftgu5o";
				addLoc(div1, file, 7, 4, 314);
				div2.className = "empty svelte-ftgu5o";
				addLoc(div2, file, 19, 8, 900);
				div3.className = "body svelte-ftgu5o";
				addLoc(div3, file, 18, 4, 848);
				div4.className = "footer svelte-ftgu5o";
				addLoc(div4, file, 23, 4, 1031);
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
				div2.innerHTML = raw_value;
				insert(target, text3, anchor);
				insert(target, div4, anchor);
				current = true;
				input.focus();
			},

			p: function update(changed, ctx) {
				if ((changed.isRoot) && div0_style_value !== (div0_style_value = ctx.isRoot ? 'visibility: hidden' : '')) {
					div0.style.cssText = div0_style_value;
				}

				if (!input_updating && changed.folderName) { input.value = ctx.folderName; }
				if ((changed.creating) && i1_class_value !== (i1_class_value = "" + (ctx.creating ? 'fa fa-circle-o-notch fa-spin' : 'im im-plus-circle') + " svelte-ftgu5o")) {
					i1.className = i1_class_value;
				}

				if ((changed.folderName) && button_disabled_value !== (button_disabled_value = ctx.folderName.length === 0)) {
					button.disabled = button_disabled_value;
				}

				if ((changed.position) && raw_value !== (raw_value = __('folders / create').replace("%folder%", label(ctx.position)))) {
					div2.innerHTML = raw_value;
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
				removeListener(input, "keydown", keydown_handler);
				removeListener(button, "click", click_handler_1);
				if (detach) {
					detachNode(text2);
					detachNode(div3);
					detachNode(text3);
					detachNode(div4);
				}
			}
		};
	}

	// (3:4) {#if loading}
	function create_if_block_1(component, ctx) {
		var div, i, text0, text1_value = __('folders / loading'), text1, current;

		return {
			c: function create() {
				div = createElement("div");
				i = createElement("i");
				text0 = createText("   ");
				text1 = createText(text1_value);
				setStyle(i, "margin", "0px 6px 0px 10px");
				i.className = "fa fa-circle-o-notch fa-spin svelte-ftgu5o";
				addLoc(i, file, 4, 8, 165);
				div.className = "header svelte-ftgu5o";
				setStyle(div, "border-bottom", "none");
				addLoc(div, file, 3, 4, 108);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, i);
				append(div, text0);
				append(div, text1);
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

	// (34:12) {:else}
	function create_else_block_1(component, ctx) {
		var text_value = label(ctx.position), text;

		return {
			c: function create() {
				text = createText(text_value);
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.position) && text_value !== (text_value = label(ctx.position))) {
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

	// (32:12) {#if !isRoot}
	function create_if_block_4(component, ctx) {
		var a, text0_value = label(ctx.position), text0, text1, i;

		return {
			c: function create() {
				a = createElement("a");
				text0 = createText(text0_value);
				text1 = createText(" ");
				i = createElement("i");
				i.className = "im im-external-link svelte-ftgu5o";
				addLoc(i, file, 32, 72, 1370);
				a.href = ctx.openLink;
				a.target = "_blank";
				a.className = "svelte-ftgu5o";
				addLoc(a, file, 32, 12, 1310);
			},

			m: function mount(target, anchor) {
				insert(target, a, anchor);
				append(a, text0);
				append(a, text1);
				append(a, i);
			},

			p: function update(changed, ctx) {
				if ((changed.position) && text0_value !== (text0_value = label(ctx.position))) {
					setData(text0, text0_value);
				}

				if (changed.openLink) {
					a.href = ctx.openLink;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(a);
				}
			}
		};
	}

	// (42:8) {#each folderList as element}
	function create_each_block_1(component, ctx) {
		var div1, i0, i0_class_value, text0, div0, text1_value = label(ctx.element), text1, text2, i1, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				i0 = createElement("i");
				text0 = createText("  \n            ");
				div0 = createElement("div");
				text1 = createText(text1_value);
				text2 = createText("\n            ");
				i1 = createElement("i");
				i0.className = i0_class_value = "" + icon(ctx.element.type) + " svelte-ftgu5o";
				addLoc(i0, file, 43, 12, 1763);
				div0.className = "svelte-ftgu5o";
				addLoc(div0, file, 44, 12, 1821);
				i1.className = "im im-angle-right svelte-ftgu5o";
				addLoc(i1, file, 47, 12, 1893);

				div1._svelte = { component: component, ctx: ctx };

				addListener(div1, "click", click_handler);
				div1.className = "li folder svelte-ftgu5o";
				addLoc(div1, file, 42, 8, 1655);
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
				if ((!current || changed.folderList) && i0_class_value !== (i0_class_value = "" + icon(ctx.element.type) + " svelte-ftgu5o")) {
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

	// (50:16) {#each chartList as element}
	function create_each_block(component, ctx) {
		var div1, i, i_class_value, text0, div0, text1_value = ctx.element.title, text1, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				i = createElement("i");
				text0 = createText("  \n            ");
				div0 = createElement("div");
				text1 = createText(text1_value);
				i.className = i_class_value = "fa " + chartIcon(ctx.element.type) + " " + " svelte-ftgu5o";
				addLoc(i, file, 51, 12, 2063);
				div0.className = "svelte-ftgu5o";
				addLoc(div0, file, 52, 12, 2130);
				div1.className = "li chart svelte-ftgu5o";
				addLoc(div1, file, 50, 8, 1995);
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
				if ((!current || changed.chartList) && i_class_value !== (i_class_value = "fa " + chartIcon(ctx.element.type) + " " + " svelte-ftgu5o")) {
					i.className = i_class_value;
				}

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

	// (57:16) {#if chartList.length === 0 && folderList.length === 0}
	function create_if_block_3(component, ctx) {
		var div, text_value = __('folders / empty'), text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "empty svelte-ftgu5o";
				addLoc(div, file, 57, 8, 2284);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
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
		this._state = assign(data(), options.data);

		this._recompute({ position: 1, folders: 1 }, this._state);
		if (!('position' in this._state)) { console.warn("<App> was created without expected data property 'position'"); }
		if (!('folders' in this._state)) { console.warn("<App> was created without expected data property 'folders'"); }
		if (!('show' in this._state)) { console.warn("<App> was created without expected data property 'show'"); }
		if (!('x' in this._state)) { console.warn("<App> was created without expected data property 'x'"); }
		if (!('y' in this._state)) { console.warn("<App> was created without expected data property 'y'"); }
		if (!('loading' in this._state)) { console.warn("<App> was created without expected data property 'loading'"); }
		if (!('create' in this._state)) { console.warn("<App> was created without expected data property 'create'"); }

		if (!('folderName' in this._state)) { console.warn("<App> was created without expected data property 'folderName'"); }
		if (!('creating' in this._state)) { console.warn("<App> was created without expected data property 'creating'"); }



		if (!('moving' in this._state)) { console.warn("<App> was created without expected data property 'moving'"); }
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment(this, this._state);

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

	assign(App.prototype, protoDev);
	assign(App.prototype, methods);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('isRoot' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'isRoot'"); }
		if ('folderList' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'folderList'"); }
		if ('chartList' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'chartList'"); }
		if ('openLink' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'openLink'"); }
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.position) {
			if (this._differs(state.isRoot, (state.isRoot = isRoot(state)))) { changed.isRoot = true; }
		}

		if (changed.position || changed.folders) {
			if (this._differs(state.folderList, (state.folderList = folderList(state)))) { changed.folderList = true; }
			if (this._differs(state.chartList, (state.chartList = chartList(state)))) { changed.chartList = true; }
		}

		if (changed.folders || changed.position) {
			if (this._differs(state.openLink, (state.openLink = openLink(state)))) { changed.openLink = true; }
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

	var main = { App: App, store: store };

	return main;

}));
//# sourceMappingURL=folder.js.map
