(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/account', factory) :
	(global = global || self, global.account = factory());
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

	function toggleClass(element, name, toggle) {
		element.classList[toggle ? 'add' : 'remove'](name);
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
	 * Download and parse a remote JSON endpoint via PUT. credentials
	 * are included automatically
	 *
	 * @param {string} url
	 * @param {string} body
	 * @param {function} callback
	 *
	 * @returns {Promise}
	 * @example
	 * import { putJSON } from '@datawrapper/shared/fetch';
	 *
	 * putJSON('http://api.example.org', JSON.stringify({
	 *    query: 'foo',
	 *    page: 12
	 * }));
	 */
	function putJSON(url, body, callback) {
	    return fetchJSON(url, 'PUT', 'include', body, callback);
	}

	/* global dw */
	function checkPassword(curPwd, pwd, pwd2) {
	    var msg;
	    if (curPwd === '') {
	        msg = dw.backend.messages.provideCurPwd;
	    } else if (pwd.length < 4) {
	        msg = dw.backend.messages.pwdTooShort;
	    } else if (pwd !== pwd2) {
	        msg = dw.backend.messages.pwdMismatch;
	    }
	    if (msg) {
	        return msg;
	    }
	    return true;
	}

	/* account/EditProfile.html generated by Svelte v2.16.1 */



	function data() {
	    return {
	        changePassword: false,
	        changeEmail: false,
	        deleteAccount: false,
	        showPasswordInPlaintext: false,
	        messages: [],
	        currentPassword: '',
	        newPassword1: '',
	        newPassword2: '',
	        confirmPassword: '',
	        groups: [
	            {
	                title: 'Account settings',
	                tabs: [{
	                    title: 'Profile',
	                    icon: 'fa fa-fw fa-user'
	                }]
	            },
	            {
	                title: 'Team settings',
	                tabs: []
	            }
	        ]
	    };
	}
	var methods = {
	    changeEmail: function changeEmail() {
	        var this$1 = this;

	        var ref = this.get();
	        var email = ref.email;
	        var userId = ref.userId;

	        this.set({ savingEmail: true });

	        putJSON('/api/users/' + userId, JSON.stringify({ email: email }), function (res) {
	            this$1.set({ savingEmail: false });

	            var messages = [];
	            var errors = [];

	            if (res.status === 'error') {
	                errors.push(res.message);
	            }

	            if (res.data && res.data.messages) {
	                res.data.messages.forEach(function (msg) {
	                    messages.push(msg);
	                });
	            }

	            if (res.data && res.data.errors) {
	                res.data.errors.forEach(function (msg) {
	                    errors.push(msg);
	                });
	            }

	            if (errors.length === 0) {
	                this$1.set({
	                    originalEmail: email,
	                    changeEmail: false,
	                    messages: messages,
	                    errors: []
	                });
	            } else {
	                this$1.set({ errors: errors });
	            }
	        });
	    },
	    changePassword: function changePassword() {
	        var this$1 = this;

	        var ref = this.get();
	        var currentPassword = ref.currentPassword;
	        var newPassword1 = ref.newPassword1;
	        var newPassword2 = ref.newPassword2;
	        var userId = ref.userId;
	        var check = checkPassword(currentPassword, newPassword1, newPassword2);

	        if (check === true) {
	            this.set({ savingPassword: true });

	            getJSON('/api/auth/salt', function (res) {
	                if (res.status !== 'ok') {
	                    this$1.set({
	                        errors: ['Could not load salt.'],
	                        savingPassword: false
	                    });

	                    return;
	                }

	                var salt = res.data.salt;
	                var payload = {
	                    oldpwhash: CryptoJS.HmacSHA256(currentPassword, salt).toString(),
	                    pwd: CryptoJS.HmacSHA256(newPassword1, salt).toString()
	                };

	                putJSON('/api/users/' + userId, JSON.stringify(payload), function (res) {
	                    this$1.set({
	                        savingPassword: false,
	                        currentPassword: '',
	                        newPassword1: '',
	                        newPassword2: ''
	                    });

	                    var messages = [];
	                    var errors = [];

	                    if (res.status === 'error') {
	                        errors.push(res.message);
	                    }

	                    if (res.data && res.data.messages) {
	                        res.data.messages.forEach(function (msg) {
	                            messages.push(msg);
	                        });
	                    }

	                    if (res.data && res.data.errors) {
	                        res.data.errors.forEach(function (msg) {
	                            errors.push(msg);
	                        });
	                    }

	                    if (errors.length === 0) {
	                        messages.push('Your password was changed sucessfully');
	                        this$1.set({ changePassword: false, messages: messages, errors: [] });
	                    } else {
	                        this$1.set({ errors: errors });
	                    }
	                });
	            });
	        } else {
	            var errors = [check];
	            this.set({ errors: errors });
	        }
	    },
	    deleteAccount: function deleteAccount() {
	        var this$1 = this;

	        var ref = this.get();
	        var confirmPassword = ref.confirmPassword;

	        this.set({ deletingAccount: true });

	        getJSON('/api/auth/salt', function (res) {
	            if (res.status !== 'ok') {
	                this$1.set({
	                    errors: ['Could not load salt.'],
	                    deletingAccount: false
	                });

	                return;
	            }

	            var passwordHash = CryptoJS.HmacSHA256(confirmPassword, res.data.salt).toString();

	            fetchJSON('/api/users/current?pwd=' + passwordHash, 'DELETE', 'include', JSON.stringify({ pwd: passwordHash }), function (res) {
	                this$1.set({ deletingAccount: false });
	                var errors = [];

	                if (res.status === 'error') {
	                    errors.push(res.message);
	                }

	                if (res.data && res.data.messages) {
	                    res.data.messages.forEach(function (msg) {
	                    });
	                }

	                if (res.data && res.data.errors) {
	                    res.data.errors.forEach(function (msg) {
	                        errors.push(msg);
	                    });
	                }

	                if (errors.length === 0) {
	                    this$1.set({ deleteAccount2: false, deleteAccount3: true });
	                } else {
	                    this$1.set({ errors: errors });
	                }
	            });
	        });
	    }
	};

	function onstate(ref) {
	    var changed = ref.changed;
	    var current = ref.current;
	    var previous = ref.previous;

	    if (changed.email && !previous) {
	        this.set({ originalEmail: current.email });
	    }
	}
	var file = "account/EditProfile.html";

	function get_each_context_3(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.message = list[i];
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var h2, text0_value = __("Edit profile"), text0, text1, if_block_anchor;

		function select_block_type(ctx) {
			if (ctx.changePassword) { return create_if_block; }
			if (ctx.deleteAccount) { return create_if_block_2; }
			if (ctx.deleteAccount2) { return create_if_block_3; }
			if (ctx.deleteAccount3) { return create_if_block_5; }
			if (ctx.changeEmail) { return create_if_block_6; }
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c: function create() {
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n\n\n");
				if_block.c();
				if_block_anchor = createComment();
				addLoc(h2, file, 2, 0, 2);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				append(h2, text0);
				insert(target, text1, anchor);
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
				if (detach) {
					detachNode(h2);
					detachNode(text1);
				}

				if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (183:0) {:else}
	function create_else_block(component, ctx) {
		var text0, div11, div9, div3, div0, text1_value = __("E-Mail"), text1, text2, text3, div1, input0, input0_disabled_value, text4, div2, button0, text5_value = __( "account / email"), text5, text6, div7, div4, text7_value = __("Password"), text7, text8, text9, div5, input1, text10, div6, button1, text11_value = __("account / password"), text11, text12, div8, text13_value = __("account / or"), text13, text14, span, text15_value = __("account / delete"), text15, text16, text17, div10, p, text18_value = __("account / change-login"), text18;

		var if_block = (ctx.messages && ctx.messages.length) && create_if_block_8(component, ctx);

		function click_handler(event) {
			component.set({changeEmail: true});
		}

		function click_handler_1(event) {
			component.set({changePassword: true});
		}

		function click_handler_2(event) {
			component.set({deleteAccount: true});
		}

		return {
			c: function create() {
				if (if_block) { if_block.c(); }
				text0 = createText("\n\n");
				div11 = createElement("div");
				div9 = createElement("div");
				div3 = createElement("div");
				div0 = createElement("div");
				text1 = createText(text1_value);
				text2 = createText(":");
				text3 = createText("\n            ");
				div1 = createElement("div");
				input0 = createElement("input");
				text4 = createText("\n            ");
				div2 = createElement("div");
				button0 = createElement("button");
				text5 = createText(text5_value);
				text6 = createText("\n\n        ");
				div7 = createElement("div");
				div4 = createElement("div");
				text7 = createText(text7_value);
				text8 = createText(":");
				text9 = createText("\n            ");
				div5 = createElement("div");
				input1 = createElement("input");
				text10 = createText("\n            ");
				div6 = createElement("div");
				button1 = createElement("button");
				text11 = createText(text11_value);
				text12 = createText("\n\n        ");
				div8 = createElement("div");
				text13 = createText(text13_value);
				text14 = createText("\n            ");
				span = createElement("span");
				text15 = createText(text15_value);
				text16 = createText(".");
				text17 = createText("\n    ");
				div10 = createElement("div");
				p = createElement("p");
				text18 = createText(text18_value);
				div0.className = "svelte-1gfuyl2";
				addLoc(div0, file, 199, 12, 7234);
				input0.disabled = input0_disabled_value = !ctx.changeEmail;
				input0.value = ctx.originalEmail;
				setAttribute(input0, "type", "text");
				addLoc(input0, file, 203, 16, 7327);
				div1.className = "svelte-1gfuyl2";
				addLoc(div1, file, 202, 12, 7305);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-save btn-default";
				addLoc(button0, file, 206, 16, 7456);
				div2.className = "svelte-1gfuyl2";
				addLoc(div2, file, 205, 12, 7434);
				div3.className = "svelte-1gfuyl2";
				addLoc(div3, file, 198, 8, 7216);
				div4.className = "svelte-1gfuyl2";
				addLoc(div4, file, 213, 12, 7668);
				input1.disabled = true;
				input1.value = "abcdefgh";
				setAttribute(input1, "type", "password");
				addLoc(input1, file, 217, 16, 7763);
				div5.className = "svelte-1gfuyl2";
				addLoc(div5, file, 216, 12, 7741);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-save btn-default";
				addLoc(button1, file, 220, 16, 7868);
				div6.className = "svelte-1gfuyl2";
				addLoc(div6, file, 219, 12, 7846);
				div7.className = "svelte-1gfuyl2";
				addLoc(div7, file, 212, 8, 7650);
				addListener(span, "click", click_handler_2);
				span.className = "link svelte-1gfuyl2";
				setAttribute(span, "href", "#");
				addLoc(span, file, 228, 12, 8164);
				setStyle(div8, "text-align", "center");
				setStyle(div8, "display", "block");
				div8.className = "svelte-1gfuyl2";
				addLoc(div8, file, 226, 8, 8067);
				div9.className = "span6";
				addLoc(div9, file, 197, 4, 7188);
				p.className = "help";
				addLoc(p, file, 232, 5, 8320);
				div10.className = "span4";
				addLoc(div10, file, 231, 4, 8295);
				div11.className = "row edit-account svelte-1gfuyl2";
				setStyle(div11, "margin-top", "" + (ctx.messages && ctx.messages.length ? 0 : 20) + "px");
				addLoc(div11, file, 196, 0, 7089);
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insert(target, text0, anchor);
				insert(target, div11, anchor);
				append(div11, div9);
				append(div9, div3);
				append(div3, div0);
				append(div0, text1);
				append(div0, text2);
				append(div3, text3);
				append(div3, div1);
				append(div1, input0);
				append(div3, text4);
				append(div3, div2);
				append(div2, button0);
				append(button0, text5);
				append(div9, text6);
				append(div9, div7);
				append(div7, div4);
				append(div4, text7);
				append(div4, text8);
				append(div7, text9);
				append(div7, div5);
				append(div5, input1);
				append(div7, text10);
				append(div7, div6);
				append(div6, button1);
				append(button1, text11);
				append(div9, text12);
				append(div9, div8);
				append(div8, text13);
				append(div8, text14);
				append(div8, span);
				append(span, text15);
				append(div8, text16);
				append(div11, text17);
				append(div11, div10);
				append(div10, p);
				append(p, text18);
			},

			p: function update(changed, ctx) {
				if (ctx.messages && ctx.messages.length) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_8(component, ctx);
						if_block.c();
						if_block.m(text0.parentNode, text0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.changeEmail) && input0_disabled_value !== (input0_disabled_value = !ctx.changeEmail)) {
					input0.disabled = input0_disabled_value;
				}

				if (changed.originalEmail) {
					input0.value = ctx.originalEmail;
				}

				if (changed.messages) {
					setStyle(div11, "margin-top", "" + (ctx.messages && ctx.messages.length ? 0 : 20) + "px");
				}
			},

			d: function destroy(detach) {
				if (if_block) { if_block.d(detach); }
				if (detach) {
					detachNode(text0);
					detachNode(div11);
				}

				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
				removeListener(span, "click", click_handler_2);
			}
		};
	}

	// (144:21) 
	function create_if_block_6(component, ctx) {
		var div5, div4, div3, h2, text0_value = __("account / email"), text0, text1, p, text2_value = __("account / confirm-email-change"), text2, text3, text4, fieldset, div1, label, text5_value = __("E-Mail"), text5, text6, text7, div0, input, input_updating = false, input_disabled_value, text8, div2, button0, text9_value = __( "Back"), text9, text10, button1, i, i_class_value, text11, text12_value = __( "account / email"), text12;

		var if_block = (ctx.errors && ctx.errors.length) && create_if_block_7(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ email: input.value });
			input_updating = false;
		}

		function click_handler(event) {
			component.set({changeEmail: false});
		}

		function click_handler_1(event) {
			component.changeEmail();
		}

		return {
			c: function create() {
				div5 = createElement("div");
				div4 = createElement("div");
				div3 = createElement("div");
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n            ");
				p = createElement("p");
				text2 = createText(text2_value);
				text3 = createText("\n\n            ");
				if (if_block) { if_block.c(); }
				text4 = createText("\n\n            ");
				fieldset = createElement("fieldset");
				div1 = createElement("div");
				label = createElement("label");
				text5 = createText(text5_value);
				text6 = createText(":");
				text7 = createText("\n                    ");
				div0 = createElement("div");
				input = createElement("input");
				text8 = createText("\n\n                ");
				div2 = createElement("div");
				button0 = createElement("button");
				text9 = createText(text9_value);
				text10 = createText("\n                    ");
				button1 = createElement("button");
				i = createElement("i");
				text11 = createText("  ");
				text12 = createText(text12_value);
				addLoc(h2, file, 148, 12, 5439);
				addLoc(p, file, 149, 12, 5486);
				label.className = "control-label";
				label.htmlFor = "email";
				addLoc(label, file, 163, 20, 5924);
				addListener(input, "input", input_input_handler);
				input.disabled = input_disabled_value = !ctx.changeEmail;
				setAttribute(input, "type", "text");
				addLoc(input, file, 165, 24, 6058);
				div0.className = "controls";
				addLoc(div0, file, 164, 20, 6011);
				div1.className = "control-group";
				addLoc(div1, file, 162, 16, 5876);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-default";
				addLoc(button0, file, 170, 20, 6229);
				i.className = i_class_value = "fa " + (ctx.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1gfuyl2";
				addLoc(i, file, 174, 24, 6502);
				addListener(button1, "click", click_handler_1);
				setStyle(button1, "float", "right");
				button1.className = "btn btn-save btn-primary";
				addLoc(button1, file, 173, 20, 6389);
				div2.className = "";
				addLoc(div2, file, 169, 16, 6194);
				addLoc(fieldset, file, 161, 12, 5849);
				div3.className = "form-horizontal edit-account";
				addLoc(div3, file, 147, 8, 5384);
				div4.className = "span6 offset3";
				addLoc(div4, file, 146, 4, 5348);
				div5.className = "row";
				addLoc(div5, file, 145, 0, 5326);
			},

			m: function mount(target, anchor) {
				insert(target, div5, anchor);
				append(div5, div4);
				append(div4, div3);
				append(div3, h2);
				append(h2, text0);
				append(div3, text1);
				append(div3, p);
				append(p, text2);
				append(div3, text3);
				if (if_block) { if_block.m(div3, null); }
				append(div3, text4);
				append(div3, fieldset);
				append(fieldset, div1);
				append(div1, label);
				append(label, text5);
				append(label, text6);
				append(div1, text7);
				append(div1, div0);
				append(div0, input);

				input.value = ctx.email;

				append(fieldset, text8);
				append(fieldset, div2);
				append(div2, button0);
				append(button0, text9);
				append(div2, text10);
				append(div2, button1);
				append(button1, i);
				append(button1, text11);
				append(button1, text12);
			},

			p: function update(changed, ctx) {
				if (ctx.errors && ctx.errors.length) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_7(component, ctx);
						if_block.c();
						if_block.m(div3, text4);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (!input_updating && changed.email) { input.value = ctx.email; }
				if ((changed.changeEmail) && input_disabled_value !== (input_disabled_value = !ctx.changeEmail)) {
					input.disabled = input_disabled_value;
				}

				if ((changed.savingEmail) && i_class_value !== (i_class_value = "fa " + (ctx.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1gfuyl2")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div5);
				}

				if (if_block) { if_block.d(); }
				removeListener(input, "input", input_input_handler);
				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (133:25) 
	function create_if_block_5(component, ctx) {
		var div1, div0, h2, text0_value = __("Your account has been deleted."), text0, text1, a, text2_value = __("Goodbye!"), text2;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				a = createElement("a");
				text2 = createText(text2_value);
				setStyle(h2, "margin-bottom", "20px");
				h2.className = "svelte-1gfuyl2";
				addLoc(h2, file, 136, 8, 5107);
				a.href = "/";
				a.className = "btn btn-primary btn-large";
				addLoc(a, file, 139, 8, 5215);
				div0.className = "span6 offset3";
				addLoc(div0, file, 135, 4, 5062);
				div1.className = "row delete-account svelte-1gfuyl2";
				addLoc(div1, file, 134, 0, 5025);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, h2);
				append(h2, text0);
				append(div0, text1);
				append(div0, a);
				append(a, text2);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div1);
				}
			}
		};
	}

	// (86:25) 
	function create_if_block_3(component, ctx) {
		var div4, div3, h2, text0_value = __("account / delete / hed"), text0, text1, text2, p0, text3_value = __("account / delete / really"), text3, text4, ul, li0, text5_value = __("account / confirm-account-deletion / free"), text5, text6, li1, text7_value = __("You cannot login and logout anymore."), text7, text8, li2, text9_value = __("You cannot edit or remove your charts anymore."), text9, text10, p1, text11_value = __("account / delete / charts-stay-online"), text11, text12, div2, p2, b, text13_value = __("Please enter your password to confirm the deletion request:"), text13, text14, div0, input, input_updating = false, text15, p3, raw_value = __("account / delete / really-really"), text16, div1, button0, i0, text17, text18_value = __("No, I changed my mind.."), text18, text19, button1, i1, i1_class_value, text20, text21_value = __("Yes, delete it!"), text21;

		var if_block = (ctx.errors && ctx.errors.length) && create_if_block_4(component, ctx);

		function input_input_handler() {
			input_updating = true;
			component.set({ confirmPassword: input.value });
			input_updating = false;
		}

		function click_handler(event) {
			component.set({deleteAccount2: false});
		}

		function click_handler_1(event) {
			component.deleteAccount();
		}

		return {
			c: function create() {
				div4 = createElement("div");
				div3 = createElement("div");
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n\n        ");
				if (if_block) { if_block.c(); }
				text2 = createText("\n\n        ");
				p0 = createElement("p");
				text3 = createText(text3_value);
				text4 = createText("\n        ");
				ul = createElement("ul");
				li0 = createElement("li");
				text5 = createText(text5_value);
				text6 = createText("\n            ");
				li1 = createElement("li");
				text7 = createText(text7_value);
				text8 = createText("\n            ");
				li2 = createElement("li");
				text9 = createText(text9_value);
				text10 = createText("\n        ");
				p1 = createElement("p");
				text11 = createText(text11_value);
				text12 = createText("\n        ");
				div2 = createElement("div");
				p2 = createElement("p");
				b = createElement("b");
				text13 = createText(text13_value);
				text14 = createText("\n            ");
				div0 = createElement("div");
				input = createElement("input");
				text15 = createText("\n            ");
				p3 = createElement("p");
				text16 = createText("\n            ");
				div1 = createElement("div");
				button0 = createElement("button");
				i0 = createElement("i");
				text17 = createText("  ");
				text18 = createText(text18_value);
				text19 = createText("\n                ");
				button1 = createElement("button");
				i1 = createElement("i");
				text20 = createText("  ");
				text21 = createText(text21_value);
				setStyle(h2, "margin-bottom", "20px");
				h2.className = "svelte-1gfuyl2";
				addLoc(h2, file, 89, 8, 3331);
				addLoc(p0, file, 101, 8, 3675);
				addLoc(li0, file, 105, 12, 3765);
				addLoc(li1, file, 106, 12, 3838);
				addLoc(li2, file, 107, 12, 3906);
				addLoc(ul, file, 104, 8, 3748);
				addLoc(p1, file, 109, 8, 3994);
				addLoc(b, file, 113, 15, 4109);
				addLoc(p2, file, 113, 12, 4106);
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "password");
				input.placeholder = __("Password");
				addLoc(input, file, 115, 16, 4246);
				div0.className = "control-group";
				addLoc(div0, file, 114, 12, 4202);
				addLoc(p3, file, 117, 12, 4365);
				i0.className = "fa fa-chevron-left";
				addLoc(i0, file, 122, 20, 4596);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-info";
				addLoc(button0, file, 121, 16, 4506);
				i1.className = i1_class_value = "fa " + (ctx.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1gfuyl2";
				addLoc(i1, file, 125, 20, 4812);
				addListener(button1, "click", click_handler_1);
				setStyle(button1, "float", "right");
				button1.className = "btn btn-danger";
				addLoc(button1, file, 124, 16, 4713);
				div1.className = "control-group";
				addLoc(div1, file, 120, 12, 4462);
				div2.className = "";
				addLoc(div2, file, 112, 8, 4079);
				div3.className = "span6 offset3";
				addLoc(div3, file, 88, 4, 3295);
				div4.className = "row delete-account svelte-1gfuyl2";
				addLoc(div4, file, 87, 0, 3258);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div3);
				append(div3, h2);
				append(h2, text0);
				append(div3, text1);
				if (if_block) { if_block.m(div3, null); }
				append(div3, text2);
				append(div3, p0);
				append(p0, text3);
				append(div3, text4);
				append(div3, ul);
				append(ul, li0);
				append(li0, text5);
				append(ul, text6);
				append(ul, li1);
				append(li1, text7);
				append(ul, text8);
				append(ul, li2);
				append(li2, text9);
				append(div3, text10);
				append(div3, p1);
				append(p1, text11);
				append(div3, text12);
				append(div3, div2);
				append(div2, p2);
				append(p2, b);
				append(b, text13);
				append(div2, text14);
				append(div2, div0);
				append(div0, input);

				input.value = ctx.confirmPassword;

				append(div2, text15);
				append(div2, p3);
				p3.innerHTML = raw_value;
				append(div2, text16);
				append(div2, div1);
				append(div1, button0);
				append(button0, i0);
				append(button0, text17);
				append(button0, text18);
				append(div1, text19);
				append(div1, button1);
				append(button1, i1);
				append(button1, text20);
				append(button1, text21);
			},

			p: function update(changed, ctx) {
				if (ctx.errors && ctx.errors.length) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_4(component, ctx);
						if_block.c();
						if_block.m(div3, text2);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (!input_updating && changed.confirmPassword) { input.value = ctx.confirmPassword; }
				if ((changed.deletingAccount) && i1_class_value !== (i1_class_value = "fa " + (ctx.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1gfuyl2")) {
					i1.className = i1_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div4);
				}

				if (if_block) { if_block.d(); }
				removeListener(input, "input", input_input_handler);
				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (62:24) 
	function create_if_block_2(component, ctx) {
		var div4, div3, div0, i0, text0, h2, text1_value = __("account / confirm-account-deletion"), text1, text2, div2, button0, i1, text3, text4_value = __("account / confirm-account-deletion / no"), text4, text5, div1, text6_value = __("account / or"), text6, text7, button1, i2, text8, text9_value = __("account / confirm-account-deletion / yes"), text9;

		function click_handler(event) {
			component.set({deleteAccount: false});
		}

		function click_handler_1(event) {
			component.set({deleteAccount: false, deleteAccount2: true});
		}

		return {
			c: function create() {
				div4 = createElement("div");
				div3 = createElement("div");
				div0 = createElement("div");
				i0 = createElement("i");
				text0 = createText("\n\n        ");
				h2 = createElement("h2");
				text1 = createText(text1_value);
				text2 = createText("\n\n        ");
				div2 = createElement("div");
				button0 = createElement("button");
				i1 = createElement("i");
				text3 = createText("   ");
				text4 = createText(text4_value);
				text5 = createText("\n\n            ");
				div1 = createElement("div");
				text6 = createText(text6_value);
				text7 = createText("\n\n            ");
				button1 = createElement("button");
				i2 = createElement("i");
				text8 = createText("   ");
				text9 = createText(text9_value);
				i0.className = "fa fa-times";
				addLoc(i0, file, 66, 12, 2440);
				div0.className = "iconholder svelte-1gfuyl2";
				addLoc(div0, file, 65, 8, 2403);
				setStyle(h2, "margin-bottom", "20px");
				h2.className = "svelte-1gfuyl2";
				addLoc(h2, file, 69, 8, 2492);
				i1.className = "fa fa-chevron-left";
				addLoc(i1, file, 73, 16, 2766);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-back btn-primary";
				addLoc(button0, file, 72, 12, 2669);
				setStyle(div1, "display", "block");
				setStyle(div1, "margin", "0px 10px");
				addLoc(div1, file, 76, 12, 2893);
				i2.className = "fa fa-times";
				addLoc(i2, file, 79, 16, 3089);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-default";
				addLoc(button1, file, 78, 12, 2979);
				setStyle(div2, "display", "flex");
				setStyle(div2, "justify-content", "center");
				setStyle(div2, "align-items", "center");
				addLoc(div2, file, 71, 8, 2582);
				div3.className = "span6 offset3";
				addLoc(div3, file, 64, 4, 2358);
				div4.className = "row delete-account svelte-1gfuyl2";
				addLoc(div4, file, 63, 0, 2321);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div3);
				append(div3, div0);
				append(div0, i0);
				append(div3, text0);
				append(div3, h2);
				append(h2, text1);
				append(div3, text2);
				append(div3, div2);
				append(div2, button0);
				append(button0, i1);
				append(button0, text3);
				append(button0, text4);
				append(div2, text5);
				append(div2, div1);
				append(div1, text6);
				append(div2, text7);
				append(div2, button1);
				append(button1, i2);
				append(button1, text8);
				append(button1, text9);
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div4);
				}

				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (6:0) {#if changePassword }
	function create_if_block(component, ctx) {
		var div9, div8, div7, h2, text0_value = __("account / password"), text0, text1, p0, text2_value = __("account / password / strong-password-note"), text2, text3, text4, fieldset, div1, label0, text5_value = __("Current Password"), text5, text6, div0, input0, input0_updating = false, text7, p1, text8_value = __("account / password / current-password-note"), text8, text9, div3, label1, text10_value = __("New Password"), text10, text11, div2, input1, input1_updating = false, text12, div5, label2, text13_value = __("(repeat)"), text13, text14, div4, input2, input2_updating = false, text15, div6, button0, text16_value = __("Back"), text16, text17, button1, i, i_class_value, text18, text19_value = __("account / password"), text19;

		var if_block = (ctx.errors && ctx.errors.length) && create_if_block_1(component, ctx);

		function input0_input_handler() {
			input0_updating = true;
			component.set({ currentPassword: input0.value });
			input0_updating = false;
		}

		function input1_input_handler() {
			input1_updating = true;
			component.set({ newPassword1: input1.value });
			input1_updating = false;
		}

		function input2_input_handler() {
			input2_updating = true;
			component.set({ newPassword2: input2.value });
			input2_updating = false;
		}

		function click_handler(event) {
			component.set({changePassword: false});
		}

		function click_handler_1(event) {
			component.changePassword();
		}

		return {
			c: function create() {
				div9 = createElement("div");
				div8 = createElement("div");
				div7 = createElement("div");
				h2 = createElement("h2");
				text0 = createText(text0_value);
				text1 = createText("\n            ");
				p0 = createElement("p");
				text2 = createText(text2_value);
				text3 = createText("\n\n            ");
				if (if_block) { if_block.c(); }
				text4 = createText("\n\n            ");
				fieldset = createElement("fieldset");
				div1 = createElement("div");
				label0 = createElement("label");
				text5 = createText(text5_value);
				text6 = createText("\n                    ");
				div0 = createElement("div");
				input0 = createElement("input");
				text7 = createText("\n                        ");
				p1 = createElement("p");
				text8 = createText(text8_value);
				text9 = createText("\n                ");
				div3 = createElement("div");
				label1 = createElement("label");
				text10 = createText(text10_value);
				text11 = createText("\n                    ");
				div2 = createElement("div");
				input1 = createElement("input");
				text12 = createText("\n                ");
				div5 = createElement("div");
				label2 = createElement("label");
				text13 = createText(text13_value);
				text14 = createText("\n                    ");
				div4 = createElement("div");
				input2 = createElement("input");
				text15 = createText("\n\n                ");
				div6 = createElement("div");
				button0 = createElement("button");
				text16 = createText(text16_value);
				text17 = createText("\n                    ");
				button1 = createElement("button");
				i = createElement("i");
				text18 = createText("  ");
				text19 = createText(text19_value);
				addLoc(h2, file, 10, 12, 180);
				addLoc(p0, file, 11, 12, 230);
				label0.className = "control-label";
				addLoc(label0, file, 27, 20, 709);
				addListener(input0, "input", input0_input_handler);
				setAttribute(input0, "type", "password");
				input0.className = "input-xlarge";
				addLoc(input0, file, 29, 24, 840);
				p1.className = "help-block";
				addLoc(p1, file, 30, 24, 940);
				div0.className = "controls";
				addLoc(div0, file, 28, 20, 793);
				div1.className = "control-group";
				addLoc(div1, file, 26, 16, 661);
				label1.className = "control-label";
				addLoc(label1, file, 36, 20, 1187);
				addListener(input1, "input", input1_input_handler);
				setAttribute(input1, "type", "password");
				input1.className = "input-xlarge";
				addLoc(input1, file, 38, 24, 1314);
				div2.className = "controls";
				addLoc(div2, file, 37, 20, 1267);
				div3.className = "control-group";
				addLoc(div3, file, 35, 16, 1139);
				label2.className = "control-label";
				addLoc(label2, file, 42, 20, 1501);
				addListener(input2, "input", input2_input_handler);
				setAttribute(input2, "type", "password");
				input2.className = "input-xlarge";
				addLoc(input2, file, 44, 24, 1624);
				div4.className = "controls";
				addLoc(div4, file, 43, 20, 1577);
				div5.className = "control-group";
				addLoc(div5, file, 41, 16, 1453);
				addListener(button0, "click", click_handler);
				button0.className = "btn btn-save btn-default btn-back";
				addLoc(button0, file, 49, 20, 1790);
				i.className = i_class_value = "fa " + (ctx.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1gfuyl2";
				addLoc(i, file, 53, 24, 2075);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-primary";
				setStyle(button1, "float", "right");
				addLoc(button1, file, 52, 20, 1970);
				addLoc(div6, file, 48, 16, 1764);
				addLoc(fieldset, file, 25, 12, 634);
				div7.className = "form-horizontal edit-account-confirm";
				addLoc(div7, file, 9, 8, 117);
				div8.className = "span6 offset3";
				addLoc(div8, file, 8, 4, 81);
				div9.className = "row";
				addLoc(div9, file, 7, 0, 59);
			},

			m: function mount(target, anchor) {
				insert(target, div9, anchor);
				append(div9, div8);
				append(div8, div7);
				append(div7, h2);
				append(h2, text0);
				append(div7, text1);
				append(div7, p0);
				append(p0, text2);
				append(div7, text3);
				if (if_block) { if_block.m(div7, null); }
				append(div7, text4);
				append(div7, fieldset);
				append(fieldset, div1);
				append(div1, label0);
				append(label0, text5);
				append(div1, text6);
				append(div1, div0);
				append(div0, input0);

				input0.value = ctx.currentPassword;

				append(div0, text7);
				append(div0, p1);
				append(p1, text8);
				append(fieldset, text9);
				append(fieldset, div3);
				append(div3, label1);
				append(label1, text10);
				append(div3, text11);
				append(div3, div2);
				append(div2, input1);

				input1.value = ctx.newPassword1;

				append(fieldset, text12);
				append(fieldset, div5);
				append(div5, label2);
				append(label2, text13);
				append(div5, text14);
				append(div5, div4);
				append(div4, input2);

				input2.value = ctx.newPassword2;

				append(fieldset, text15);
				append(fieldset, div6);
				append(div6, button0);
				append(button0, text16);
				append(div6, text17);
				append(div6, button1);
				append(button1, i);
				append(button1, text18);
				append(button1, text19);
			},

			p: function update(changed, ctx) {
				if (ctx.errors && ctx.errors.length) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1(component, ctx);
						if_block.c();
						if_block.m(div7, text4);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (!input0_updating && changed.currentPassword) { input0.value = ctx.currentPassword; }
				if (!input1_updating && changed.newPassword1) { input1.value = ctx.newPassword1; }
				if (!input2_updating && changed.newPassword2) { input2.value = ctx.newPassword2; }
				if ((changed.savingPassword) && i_class_value !== (i_class_value = "fa " + (ctx.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-1gfuyl2")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div9);
				}

				if (if_block) { if_block.d(); }
				removeListener(input0, "input", input0_input_handler);
				removeListener(input1, "input", input1_input_handler);
				removeListener(input2, "input", input2_input_handler);
				removeListener(button0, "click", click_handler);
				removeListener(button1, "click", click_handler_1);
			}
		};
	}

	// (183:8) {#if messages && messages.length }
	function create_if_block_8(component, ctx) {
		var div2, div1, div0, ul;

		var each_value_3 = ctx.messages;

		var each_blocks = [];

		for (var i = 0; i < each_value_3.length; i += 1) {
			each_blocks[i] = create_each_block_3(component, get_each_context_3(ctx, each_value_3, i));
		}

		return {
			c: function create() {
				div2 = createElement("div");
				div1 = createElement("div");
				div0 = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setStyle(ul, "margin-bottom", "0");
				addLoc(ul, file, 186, 12, 6890);
				div0.className = "alert alert-success";
				addLoc(div0, file, 185, 8, 6844);
				div1.className = "span6 offset3";
				addLoc(div1, file, 184, 4, 6808);
				div2.className = "row";
				setStyle(div2, "margin-top", "20px");
				addLoc(div2, file, 183, 0, 6760);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, div0);
				append(div0, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.messages) {
					each_value_3 = ctx.messages;

					for (var i = 0; i < each_value_3.length; i += 1) {
						var child_ctx = get_each_context_3(ctx, each_value_3, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_3(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
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
					detachNode(div2);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (188:16) {#each messages as message}
	function create_each_block_3(component, ctx) {
		var li, raw_value = ctx.message;

		return {
			c: function create() {
				li = createElement("li");
				addLoc(li, file, 188, 16, 6981);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.messages) && raw_value !== (raw_value = ctx.message)) {
					li.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	// (152:12) {#if errors && errors.length }
	function create_if_block_7(component, ctx) {
		var div, ul;

		var each_value_2 = ctx.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setStyle(ul, "margin-bottom", "0");
				addLoc(ul, file, 153, 16, 5626);
				div.className = "alert";
				addLoc(div, file, 152, 12, 5590);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.errors) {
					each_value_2 = ctx.errors;

					for (var i = 0; i < each_value_2.length; i += 1) {
						var child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
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

	// (155:20) {#each errors as message}
	function create_each_block_2(component, ctx) {
		var li, raw_value = ctx.message;

		return {
			c: function create() {
				li = createElement("li");
				addLoc(li, file, 155, 20, 5723);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && raw_value !== (raw_value = ctx.message)) {
					li.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	// (92:8) {#if errors && errors.length }
	function create_if_block_4(component, ctx) {
		var div, ul;

		var each_value_1 = ctx.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setStyle(ul, "margin-bottom", "0");
				addLoc(ul, file, 93, 12, 3480);
				div.className = "alert";
				addLoc(div, file, 92, 8, 3448);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.errors) {
					each_value_1 = ctx.errors;

					for (var i = 0; i < each_value_1.length; i += 1) {
						var child_ctx = get_each_context_1(ctx, each_value_1, i);

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
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (95:16) {#each errors as message}
	function create_each_block_1(component, ctx) {
		var li, raw_value = ctx.message;

		return {
			c: function create() {
				li = createElement("li");
				addLoc(li, file, 95, 16, 3569);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && raw_value !== (raw_value = ctx.message)) {
					li.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	// (16:12) {#if errors && errors.length }
	function create_if_block_1(component, ctx) {
		var div, ul;

		var each_value = ctx.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				setStyle(ul, "margin-bottom", "0");
				addLoc(ul, file, 17, 16, 411);
				div.className = "alert";
				addLoc(div, file, 16, 12, 375);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, ul);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.errors) {
					each_value = ctx.errors;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
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

	// (19:20) {#each errors as message}
	function create_each_block(component, ctx) {
		var li, raw_value = ctx.message;

		return {
			c: function create() {
				li = createElement("li");
				addLoc(li, file, 19, 20, 508);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, ctx) {
				if ((changed.errors) && raw_value !== (raw_value = ctx.message)) {
					li.innerHTML = raw_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}
			}
		};
	}

	function EditProfile(options) {
		var this$1 = this;

		this._debugName = '<EditProfile>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('changePassword' in this._state)) { console.warn("<EditProfile> was created without expected data property 'changePassword'"); }
		if (!('errors' in this._state)) { console.warn("<EditProfile> was created without expected data property 'errors'"); }
		if (!('currentPassword' in this._state)) { console.warn("<EditProfile> was created without expected data property 'currentPassword'"); }
		if (!('newPassword1' in this._state)) { console.warn("<EditProfile> was created without expected data property 'newPassword1'"); }
		if (!('newPassword2' in this._state)) { console.warn("<EditProfile> was created without expected data property 'newPassword2'"); }
		if (!('savingPassword' in this._state)) { console.warn("<EditProfile> was created without expected data property 'savingPassword'"); }
		if (!('deleteAccount' in this._state)) { console.warn("<EditProfile> was created without expected data property 'deleteAccount'"); }
		if (!('deleteAccount2' in this._state)) { console.warn("<EditProfile> was created without expected data property 'deleteAccount2'"); }
		if (!('confirmPassword' in this._state)) { console.warn("<EditProfile> was created without expected data property 'confirmPassword'"); }
		if (!('deletingAccount' in this._state)) { console.warn("<EditProfile> was created without expected data property 'deletingAccount'"); }
		if (!('deleteAccount3' in this._state)) { console.warn("<EditProfile> was created without expected data property 'deleteAccount3'"); }
		if (!('changeEmail' in this._state)) { console.warn("<EditProfile> was created without expected data property 'changeEmail'"); }
		if (!('email' in this._state)) { console.warn("<EditProfile> was created without expected data property 'email'"); }
		if (!('savingEmail' in this._state)) { console.warn("<EditProfile> was created without expected data property 'savingEmail'"); }
		if (!('messages' in this._state)) { console.warn("<EditProfile> was created without expected data property 'messages'"); }
		if (!('originalEmail' in this._state)) { console.warn("<EditProfile> was created without expected data property 'originalEmail'"); }
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment(this, this._state);

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

	assign(EditProfile.prototype, protoDev);
	assign(EditProfile.prototype, methods);

	EditProfile.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* account/App.html generated by Svelte v2.16.1 */



	var EditProfileTab = {
	    title: 'Profile',
	    id: 'profile',
	    icon: 'fa fa-fw fa-user',
	    ui: EditProfile
	};

	function data$1() {
	    return {
	        hash: 'profile',
	        activeTab: null,
	        groups: [
	            {
	                title: 'Account settings',
	                tabs: [EditProfileTab]
	            },
	            {
	                title: 'Team settings',
	                tabs: [{
	                    title: 'Create team',
	                    icon: 'fa fa-fw fa-plus',
	                    url: '/team/new/setup'
	                }]
	            }
	        ]
	    };
	}
	var methods$1 = {
	    activateTab: function activateTab(tab, event) {
	        if (tab.ui) {
	            event.preventDefault();
	            this.set({activeTab: tab});
	        }
	    },
	    addTab: function addTab(tab) {
	        var ref = this.get();
	        var groups = ref.groups;
	        var wasLookingFor = ref.wasLookingFor;
	        console.log('groups', groups);
	        groups[0].tabs.push(tab);
	        if (wasLookingFor && tab.id === wasLookingFor) {
	            this.set({activeTab: tab, wasLookingFor: null});
	        }
	        this.set({groups: groups});
	    }
	};

	function oncreate() {
	    var this$1 = this;

	    var path = window.location.pathname.split('/').slice(1);
	    var initialTab = path[1] || 'profile';

	    dw.backend.__svelteApps.account = this;

	    var ref = this.get();
	    var groups = ref.groups;
	    var foundTab = false;
	    groups.forEach(function (group) {
	        group.tabs.forEach(function (tab) {
	            if (tab.id === initialTab) {
	                this$1.set({activeTab: tab});
	                foundTab = true;
	            }
	        });
	    });
	    if (!foundTab) {
	        this.set({
	            activeTab: EditProfileTab,
	            wasLookingFor: initialTab
	        });
	    }
	}
	function onstate$1(ref) {
	    var changed = ref.changed;
	    var current = ref.current;

	    if (changed.activeTab && current.activeTab) {
	        console.log(current.activeTab);
	        window.history.pushState(
	            {id: current.activeTab.id },
	            '',
	            ("/account/" + (current.activeTab.id))
	        );
	    }
	}
	var file$1 = "account/App.html";

	function click_handler(event) {
		var ref = this._svelte;
		var component = ref.component;
		var ctx = ref.ctx;

		component.activateTab(ctx.tab, event);
	}

	function get_each_context_1$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.tab = list[i];
		return child_ctx;
	}

	function get_each_context$1(ctx, list, i) {
		var child_ctx = Object.create(ctx);
		child_ctx.group = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var div2, h1, text1, div1, div0, text2;

		var each_value = ctx.groups;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		var if_block = (ctx.activeTab) && create_if_block$1(component, ctx);

		return {
			c: function create() {
				div2 = createElement("div");
				h1 = createElement("h1");
				h1.textContent = "Settings";
				text1 = createText("\n\n    ");
				div1 = createElement("div");
				div0 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text2 = createText("\n        ");
				if (if_block) { if_block.c(); }
				h1.className = "title";
				addLoc(h1, file$1, 1, 4, 24);
				div0.className = "span2 svelte-yq9vlw";
				addLoc(div0, file$1, 4, 8, 87);
				div1.className = "row";
				addLoc(div1, file$1, 3, 4, 61);
				div2.className = "admin";
				addLoc(div2, file$1, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, h1);
				append(div2, text1);
				append(div2, div1);
				append(div1, div0);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div0, null);
				}

				append(div1, text2);
				if (if_block) { if_block.m(div1, null); }
			},

			p: function update(changed, ctx) {
				if (changed.groups || changed.activeTab) {
					each_value = ctx.groups;

					for (var i = 0; i < each_value.length; i += 1) {
						var child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div0, null);
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
						if_block = create_if_block$1(component, ctx);
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
					detachNode(div2);
				}

				destroyEach(each_blocks, detach);

				if (if_block) { if_block.d(); }
			}
		};
	}

	// (10:16) {#each group.tabs as tab}
	function create_each_block_1$1(component, ctx) {
		var li, a, i, i_class_value, text0, text1_value = ctx.tab.title, text1, a_href_value;

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i = createElement("i");
				text0 = createText("   ");
				text1 = createText(text1_value);
				i.className = i_class_value = "" + ctx.tab.icon + " svelte-yq9vlw";
				addLoc(i, file$1, 11, 101, 444);

				a._svelte = { component: component, ctx: ctx };

				addListener(a, "click", click_handler);
				a.href = a_href_value = ctx.tab.url || ("/account/" + (ctx.tab.id));
				a.className = "svelte-yq9vlw";
				addLoc(a, file$1, 11, 20, 363);
				li.className = "svelte-yq9vlw";
				toggleClass(li, "active", ctx.activeTab === ctx.tab);
				addLoc(li, file$1, 10, 16, 305);
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
				if ((changed.groups) && i_class_value !== (i_class_value = "" + ctx.tab.icon + " svelte-yq9vlw")) {
					i.className = i_class_value;
				}

				if ((changed.groups) && text1_value !== (text1_value = ctx.tab.title)) {
					setData(text1, text1_value);
				}

				a._svelte.ctx = ctx;
				if ((changed.groups) && a_href_value !== (a_href_value = ctx.tab.url || ("/account/" + (ctx.tab.id)))) {
					a.href = a_href_value;
				}

				if ((changed.activeTab || changed.groups)) {
					toggleClass(li, "active", ctx.activeTab === ctx.tab);
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

	// (6:12) {#each groups as group}
	function create_each_block$1(component, ctx) {
		var div, text0_value = ctx.group.title, text0, text1, ul;

		var each_value_1 = ctx.group.tabs;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(component, get_each_context_1$1(ctx, each_value_1, i));
		}

		return {
			c: function create() {
				div = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n\n            ");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "group svelte-yq9vlw";
				addLoc(div, file$1, 6, 12, 155);
				ul.className = "nav nav-stacked nav-tabs";
				addLoc(ul, file$1, 8, 12, 209);
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

				if (changed.activeTab || changed.groups) {
					each_value_1 = ctx.group.tabs;

					for (var i = 0; i < each_value_1.length; i += 1) {
						var child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$1(component, child_ctx);
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

	// (18:8) {#if activeTab}
	function create_if_block$1(component, ctx) {
		var div, div_class_value;

		var switch_value = ctx.activeTab.ui;

		function switch_props(ctx) {
			return {
				root: component.root,
				store: component.store
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props());
		}

		return {
			c: function create() {
				div = createElement("div");
				if (switch_instance) { switch_instance._fragment.c(); }
				div.className = div_class_value = "span10 account-page-content tab-" + ctx.activeTab.id + " svelte-yq9vlw";
				addLoc(div, file$1, 18, 8, 630);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				if (switch_instance) {
					switch_instance._mount(div, null);
				}
			},

			p: function update(changed, ctx) {
				if (switch_value !== (switch_value = ctx.activeTab.ui)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						switch_instance._fragment.c();
						switch_instance._mount(div, null);
					} else {
						switch_instance = null;
					}
				}

				if ((changed.activeTab) && div_class_value !== (div_class_value = "span10 account-page-content tab-" + ctx.activeTab.id + " svelte-yq9vlw")) {
					div.className = div_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (switch_instance) { switch_instance.destroy(); }
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
		this._state = assign(data$1(), options.data);
		if (!('groups' in this._state)) { console.warn("<App> was created without expected data property 'groups'"); }
		if (!('activeTab' in this._state)) { console.warn("<App> was created without expected data property 'activeTab'"); }
		this._intro = true;

		this._handlers.state = [onstate$1];

		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$1(this, this._state);

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
	assign(App.prototype, methods$1);

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

	var store = new Store({});

	var data$2 = {
	    chart: {
	        id: ''
	    },
	    readonly: false,
	    chartData: '',
	    transpose: false,
	    firstRowIsHeader: true,
	    skipRows: 0
	};

	var main = { App: App, data: data$2, store: store };

	return main;

}));
//# sourceMappingURL=account.js.map
