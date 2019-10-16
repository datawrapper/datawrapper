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

	function appendNode(node, target) {
		target.appendChild(node);
	}

	function insertNode(node, target, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function destroyEach(iterations) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) { iterations[i].d(); }
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

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
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

	function _differsImmutable(a, b) {
		return a != a ? b == b : a !== b;
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

	var dw$1 = window.dw;

	function __(key, scope) {
	    var arguments$1 = arguments;
	    if ( scope === void 0 ) scope = 'core';

	    key = key.trim();
	    if (!dw$1.backend.__messages[scope]) { return 'MISSING:' + key; }
	    var translation = dw$1.backend.__messages[scope][key] || dw$1.backend.__messages.core[key] || key;

	    if (arguments.length > 2) {
	        for (var i = 2; i < arguments.length; i++) {
	            var index = i - 1;
	            translation = translation.replace('$' + index, arguments$1[i]);
	        }
	    }

	    return translation;
	}

	// quick reference variables for speed access

	// `_isArray` : an object's function

	/* @DEPRECATED: plase use @datawrapper/shared instead */

	function fetchJSON(url, method, credentials, body, callback) {
	    var opts = {
	        method: method,
	        body: body,
	        mode: 'cors',
	        credentials: credentials
	    };

	    var promise = window
	        .fetch(url, opts)
	        .then(function (res) {
	            if (res.status !== 200) { return new Error(res.statusText); }
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
	        .catch(function (err) {
	            console.error(err);
	        });

	    return callback ? promise.then(callback) : promise;
	}

	function getJSON(url, credentials, callback) {
	    if (arguments.length === 2) {
	        callback = credentials;
	        credentials = 'include';
	    }

	    return fetchJSON(url, 'GET', credentials, null, callback);
	}
	function putJSON(url, body, callback) {
	    return fetchJSON(url, 'PUT', 'include', body, callback);
	}

	/* @DEPRECATED: plase use @datawrapper/shared instead */

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

	/* account/App.html generated by Svelte v1.64.0 */

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
	        confirmPassword: ''
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
	function create_main_fragment(component, state) {
		var div, div_1, h1, text_value = __("Edit profile"), text, text_1, h2, text_2_value = __("account / change-login"), text_2, text_5, if_block_anchor;

		function select_block_type(state) {
			if (state.changePassword) { return create_if_block; }
			if (state.deleteAccount) { return create_if_block_2; }
			if (state.deleteAccount2) { return create_if_block_3; }
			if (state.deleteAccount3) { return create_if_block_5; }
			if (state.changeEmail) { return create_if_block_6; }
			return create_if_block_8;
		}

		var current_block_type = select_block_type(state);
		var if_block = current_block_type(component, state);

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				h1 = createElement("h1");
				text = createText(text_value);
				text_1 = createText("\n        ");
				h2 = createElement("h2");
				text_2 = createText(text_2_value);
				text_5 = createText("\n\n");
				if_block.c();
				if_block_anchor = createComment();
				this.h();
			},

			h: function hydrate() {
				div_1.className = "span10 offset1";
				div.className = "row";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(h1, div_1);
				appendNode(text, h1);
				appendNode(text_1, div_1);
				appendNode(h2, div_1);
				appendNode(text_2, h2);
				insertNode(text_5, target, anchor);
				if_block.m(target, anchor);
				insertNode(if_block_anchor, target, anchor);
			},

			p: function update(changed, state) {
				if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
					if_block.p(changed, state);
				} else {
					if_block.u();
					if_block.d();
					if_block = current_block_type(component, state);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},

			u: function unmount() {
				detachNode(div);
				detachNode(text_5);
				if_block.u();
				detachNode(if_block_anchor);
			},

			d: function destroy() {
				if_block.d();
			}
		};
	}

	// (21:20) {#each errors as message}
	function create_each_block(component, state) {
		var message = state.message, each_value = state.each_value, message_index = state.message_index;
		var li, raw_value = message;

		return {
			c: function create() {
				li = createElement("li");
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, state) {
				message = state.message;
				each_value = state.each_value;
				message_index = state.message_index;
				if ((changed.errors) && raw_value !== (raw_value = message)) {
					li.innerHTML = raw_value;
				}
			},

			u: function unmount() {
				li.innerHTML = '';

				detachNode(li);
			},

			d: noop
		};
	}

	// (18:12) {#if errors && errors.length }
	function create_if_block_1(component, state) {
		var div, ul;

		var each_value = state.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, assign(assign({}, state), {
				each_value: each_value,
				message: each_value[i],
				message_index: i
			}));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				this.h();
			},

			h: function hydrate() {
				setStyle(ul, "margin-bottom", "0");
				div.className = "alert";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(ul, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, state) {
				var each_value = state.errors;

				if (changed.errors) {
					for (var i = 0; i < each_value.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value: each_value,
							message: each_value[i],
							message_index: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block(component, each_context);
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
			},

			u: function unmount() {
				detachNode(div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy() {
				destroyEach(each_blocks);
			}
		};
	}

	// (97:16) {#each errors as message}
	function create_each_block_1(component, state) {
		var message = state.message, each_value_1 = state.each_value_1, message_index_1 = state.message_index_1;
		var li, raw_value = message;

		return {
			c: function create() {
				li = createElement("li");
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, state) {
				message = state.message;
				each_value_1 = state.each_value_1;
				message_index_1 = state.message_index_1;
				if ((changed.errors) && raw_value !== (raw_value = message)) {
					li.innerHTML = raw_value;
				}
			},

			u: function unmount() {
				li.innerHTML = '';

				detachNode(li);
			},

			d: noop
		};
	}

	// (94:8) {#if errors && errors.length }
	function create_if_block_4(component, state) {
		var div, ul;

		var each_value_1 = state.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, assign(assign({}, state), {
				each_value_1: each_value_1,
				message: each_value_1[i],
				message_index_1: i
			}));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				this.h();
			},

			h: function hydrate() {
				setStyle(ul, "margin-bottom", "0");
				div.className = "alert";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(ul, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, state) {
				var each_value_1 = state.errors;

				if (changed.errors) {
					for (var i = 0; i < each_value_1.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value_1: each_value_1,
							message: each_value_1[i],
							message_index_1: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block_1(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
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
				detachNode(div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy() {
				destroyEach(each_blocks);
			}
		};
	}

	// (157:20) {#each errors as message}
	function create_each_block_2(component, state) {
		var message = state.message, each_value_2 = state.each_value_2, message_index_2 = state.message_index_2;
		var li, raw_value = message;

		return {
			c: function create() {
				li = createElement("li");
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, state) {
				message = state.message;
				each_value_2 = state.each_value_2;
				message_index_2 = state.message_index_2;
				if ((changed.errors) && raw_value !== (raw_value = message)) {
					li.innerHTML = raw_value;
				}
			},

			u: function unmount() {
				li.innerHTML = '';

				detachNode(li);
			},

			d: noop
		};
	}

	// (154:12) {#if errors && errors.length }
	function create_if_block_7(component, state) {
		var div, ul;

		var each_value_2 = state.errors;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, assign(assign({}, state), {
				each_value_2: each_value_2,
				message: each_value_2[i],
				message_index_2: i
			}));
		}

		return {
			c: function create() {
				div = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				this.h();
			},

			h: function hydrate() {
				setStyle(ul, "margin-bottom", "0");
				div.className = "alert";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(ul, div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, state) {
				var each_value_2 = state.errors;

				if (changed.errors) {
					for (var i = 0; i < each_value_2.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value_2: each_value_2,
							message: each_value_2[i],
							message_index_2: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block_2(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value_2.length;
				}
			},

			u: function unmount() {
				detachNode(div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy() {
				destroyEach(each_blocks);
			}
		};
	}

	// (190:16) {#each messages as message}
	function create_each_block_3(component, state) {
		var message = state.message, each_value_3 = state.each_value_3, message_index_3 = state.message_index_3;
		var li, raw_value = message;

		return {
			c: function create() {
				li = createElement("li");
			},

			m: function mount(target, anchor) {
				insertNode(li, target, anchor);
				li.innerHTML = raw_value;
			},

			p: function update(changed, state) {
				message = state.message;
				each_value_3 = state.each_value_3;
				message_index_3 = state.message_index_3;
				if ((changed.messages) && raw_value !== (raw_value = message)) {
					li.innerHTML = raw_value;
				}
			},

			u: function unmount() {
				li.innerHTML = '';

				detachNode(li);
			},

			d: noop
		};
	}

	// (185:8) {#if messages && messages.length }
	function create_if_block_9(component, state) {
		var div, div_1, div_2, ul;

		var each_value_3 = state.messages;

		var each_blocks = [];

		for (var i = 0; i < each_value_3.length; i += 1) {
			each_blocks[i] = create_each_block_3(component, assign(assign({}, state), {
				each_value_3: each_value_3,
				message: each_value_3[i],
				message_index_3: i
			}));
		}

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				div_2 = createElement("div");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				this.h();
			},

			h: function hydrate() {
				setStyle(ul, "margin-bottom", "0");
				div_2.className = "alert alert-success";
				div_1.className = "span6 offset3";
				div.className = "row";
				setStyle(div, "margin-top", "20px");
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(div_2, div_1);
				appendNode(ul, div_2);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p: function update(changed, state) {
				var each_value_3 = state.messages;

				if (changed.messages) {
					for (var i = 0; i < each_value_3.length; i += 1) {
						var each_context = assign(assign({}, state), {
							each_value_3: each_value_3,
							message: each_value_3[i],
							message_index_3: i
						});

						if (each_blocks[i]) {
							each_blocks[i].p(changed, each_context);
						} else {
							each_blocks[i] = create_each_block_3(component, each_context);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = each_value_3.length;
				}
			},

			u: function unmount() {
				detachNode(div);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy() {
				destroyEach(each_blocks);
			}
		};
	}

	// (8:0) {#if changePassword }
	function create_if_block(component, state) {
		var div, div_1, div_2, h2, text_value = __("account / password"), text, text_1, p, text_2_value = __("account / password / strong-password-note"), text_2, text_4, text_5, fieldset, div_3, label, text_6_value = __("Current Password"), text_6, text_7, div_4, input, input_updating = false, text_8, p_1, text_9_value = __("account / password / current-password-note"), text_9, text_13, div_5, label_1, text_14_value = __("New Password"), text_14, text_15, div_6, input_1, input_1_updating = false, text_18, div_7, label_2, text_19_value = __("(repeat)"), text_19, text_20, div_8, input_2, input_2_updating = false, text_23, div_9, button, text_24_value = __("Back"), text_24, text_26, button_1, i, i_class_value, text_27, text_28_value = __("account / password"), text_28;

		var if_block = (state.errors && state.errors.length) && create_if_block_1(component, state);

		function input_input_handler() {
			input_updating = true;
			component.set({ currentPassword: input.value });
			input_updating = false;
		}

		function input_1_input_handler() {
			input_1_updating = true;
			component.set({ newPassword1: input_1.value });
			input_1_updating = false;
		}

		function input_2_input_handler() {
			input_2_updating = true;
			component.set({ newPassword2: input_2.value });
			input_2_updating = false;
		}

		function click_handler(event) {
			component.set({changePassword: false});
		}

		function click_handler_1(event) {
			component.changePassword();
		}

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				div_2 = createElement("div");
				h2 = createElement("h2");
				text = createText(text_value);
				text_1 = createText("\n            ");
				p = createElement("p");
				text_2 = createText(text_2_value);
				text_4 = createText("\n\n            ");
				if (if_block) { if_block.c(); }
				text_5 = createText("\n\n            ");
				fieldset = createElement("fieldset");
				div_3 = createElement("div");
				label = createElement("label");
				text_6 = createText(text_6_value);
				text_7 = createText("\n                    ");
				div_4 = createElement("div");
				input = createElement("input");
				text_8 = createText("\n                        ");
				p_1 = createElement("p");
				text_9 = createText(text_9_value);
				text_13 = createText("\n                ");
				div_5 = createElement("div");
				label_1 = createElement("label");
				text_14 = createText(text_14_value);
				text_15 = createText("\n                    ");
				div_6 = createElement("div");
				input_1 = createElement("input");
				text_18 = createText("\n                ");
				div_7 = createElement("div");
				label_2 = createElement("label");
				text_19 = createText(text_19_value);
				text_20 = createText("\n                    ");
				div_8 = createElement("div");
				input_2 = createElement("input");
				text_23 = createText("\n\n                ");
				div_9 = createElement("div");
				button = createElement("button");
				text_24 = createText(text_24_value);
				text_26 = createText("\n                    ");
				button_1 = createElement("button");
				i = createElement("i");
				text_27 = createText("  ");
				text_28 = createText(text_28_value);
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label";
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "password");
				input.className = "input-xlarge";
				p_1.className = "help-block";
				div_4.className = "controls";
				div_3.className = "control-group";
				label_1.className = "control-label";
				addListener(input_1, "input", input_1_input_handler);
				setAttribute(input_1, "type", "password");
				input_1.className = "input-xlarge";
				div_6.className = "controls";
				div_5.className = "control-group";
				label_2.className = "control-label";
				addListener(input_2, "input", input_2_input_handler);
				setAttribute(input_2, "type", "password");
				input_2.className = "input-xlarge";
				div_8.className = "controls";
				div_7.className = "control-group";
				addListener(button, "click", click_handler);
				button.className = "btn btn-save btn-default btn-back";
				i.className = i_class_value = "fa " + (state.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-u71xal";
				addListener(button_1, "click", click_handler_1);
				button_1.className = "btn btn-primary";
				setStyle(button_1, "float", "right");
				div_2.className = "form-horizontal edit-account-confirm";
				div_1.className = "span6 offset3";
				div.className = "row";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(div_2, div_1);
				appendNode(h2, div_2);
				appendNode(text, h2);
				appendNode(text_1, div_2);
				appendNode(p, div_2);
				appendNode(text_2, p);
				appendNode(text_4, div_2);
				if (if_block) { if_block.m(div_2, null); }
				appendNode(text_5, div_2);
				appendNode(fieldset, div_2);
				appendNode(div_3, fieldset);
				appendNode(label, div_3);
				appendNode(text_6, label);
				appendNode(text_7, div_3);
				appendNode(div_4, div_3);
				appendNode(input, div_4);

				input.value = state.currentPassword;

				appendNode(text_8, div_4);
				appendNode(p_1, div_4);
				appendNode(text_9, p_1);
				appendNode(text_13, fieldset);
				appendNode(div_5, fieldset);
				appendNode(label_1, div_5);
				appendNode(text_14, label_1);
				appendNode(text_15, div_5);
				appendNode(div_6, div_5);
				appendNode(input_1, div_6);

				input_1.value = state.newPassword1;

				appendNode(text_18, fieldset);
				appendNode(div_7, fieldset);
				appendNode(label_2, div_7);
				appendNode(text_19, label_2);
				appendNode(text_20, div_7);
				appendNode(div_8, div_7);
				appendNode(input_2, div_8);

				input_2.value = state.newPassword2;

				appendNode(text_23, fieldset);
				appendNode(div_9, fieldset);
				appendNode(button, div_9);
				appendNode(text_24, button);
				appendNode(text_26, div_9);
				appendNode(button_1, div_9);
				appendNode(i, button_1);
				appendNode(text_27, button_1);
				appendNode(text_28, button_1);
			},

			p: function update(changed, state) {
				if (state.errors && state.errors.length) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block_1(component, state);
						if_block.c();
						if_block.m(div_2, text_5);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (!input_updating) { input.value = state.currentPassword; }
				if (!input_1_updating) { input_1.value = state.newPassword1; }
				if (!input_2_updating) { input_2.value = state.newPassword2; }
				if ((changed.savingPassword) && i_class_value !== (i_class_value = "fa " + (state.savingPassword ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-u71xal")) {
					i.className = i_class_value;
				}
			},

			u: function unmount() {
				detachNode(div);
				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				removeListener(input, "input", input_input_handler);
				removeListener(input_1, "input", input_1_input_handler);
				removeListener(input_2, "input", input_2_input_handler);
				removeListener(button, "click", click_handler);
				removeListener(button_1, "click", click_handler_1);
			}
		};
	}

	// (64:24) 
	function create_if_block_2(component, state) {
		var div, div_1, div_2, text_1, h2, text_2_value = __("account / confirm-account-deletion"), text_2, text_3, div_3, button, i_1, text_4, text_5_value = __("account / confirm-account-deletion / no"), text_5, text_7, div_4, text_8_value = __("account / or"), text_8, text_9, button_1, i_2, text_10, text_11_value = __("account / confirm-account-deletion / yes"), text_11;

		function click_handler(event) {
			component.set({deleteAccount: false});
		}

		function click_handler_1(event) {
			component.set({deleteAccount: false, deleteAccount2: true});
		}

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				div_2 = createElement("div");
				div_2.innerHTML = "<i class=\"fa fa-times\"></i>";
				text_1 = createText("\n\n        ");
				h2 = createElement("h2");
				text_2 = createText(text_2_value);
				text_3 = createText("\n\n        ");
				div_3 = createElement("div");
				button = createElement("button");
				i_1 = createElement("i");
				text_4 = createText("   ");
				text_5 = createText(text_5_value);
				text_7 = createText("\n\n            ");
				div_4 = createElement("div");
				text_8 = createText(text_8_value);
				text_9 = createText("\n\n            ");
				button_1 = createElement("button");
				i_2 = createElement("i");
				text_10 = createText("   ");
				text_11 = createText(text_11_value);
				this.h();
			},

			h: function hydrate() {
				div_2.className = "iconholder svelte-u71xal";
				setStyle(h2, "margin-bottom", "20px");
				h2.className = "svelte-u71xal";
				i_1.className = "fa fa-chevron-left";
				addListener(button, "click", click_handler);
				button.className = "btn btn-back btn-primary";
				setStyle(div_4, "display", "block");
				setStyle(div_4, "margin", "0px 10px");
				i_2.className = "fa fa-times";
				addListener(button_1, "click", click_handler_1);
				button_1.className = "btn btn-default";
				setStyle(div_3, "display", "flex");
				setStyle(div_3, "justify-content", "center");
				setStyle(div_3, "align-items", "center");
				div_1.className = "span6 offset3";
				setStyle(div_1, "text-align", "center");
				div.className = "row delete-account svelte-u71xal";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(div_2, div_1);
				appendNode(text_1, div_1);
				appendNode(h2, div_1);
				appendNode(text_2, h2);
				appendNode(text_3, div_1);
				appendNode(div_3, div_1);
				appendNode(button, div_3);
				appendNode(i_1, button);
				appendNode(text_4, button);
				appendNode(text_5, button);
				appendNode(text_7, div_3);
				appendNode(div_4, div_3);
				appendNode(text_8, div_4);
				appendNode(text_9, div_3);
				appendNode(button_1, div_3);
				appendNode(i_2, button_1);
				appendNode(text_10, button_1);
				appendNode(text_11, button_1);
			},

			p: noop,

			u: function unmount() {
				detachNode(div);
			},

			d: function destroy() {
				removeListener(button, "click", click_handler);
				removeListener(button_1, "click", click_handler_1);
			}
		};
	}

	// (88:25) 
	function create_if_block_3(component, state) {
		var div, div_1, h2, text_value = __("account / delete / hed"), text, text_1, text_2, p, text_3_value = __("account / delete / really"), text_3, text_5, ul, li, text_6_value = __("account / confirm-account-deletion / free"), text_6, li_1, text_7_value = __("You cannot login and logout anymore."), text_7, li_2, text_8_value = __("You cannot edit or remove your charts anymore."), text_8, text_9, p_1, text_10_value = __("account / delete / charts-stay-online"), text_10, text_12, div_2, p_2, b, text_13_value = __("Please enter your password to confirm the deletion request:"), text_13, text_14, div_3, input, input_updating = false, input_placeholder_value, text_16, p_3, raw_value = __("account / delete / really-really"), text_18, div_4, button, i, text_19, text_20_value = __("No, I changed my mind.."), text_20, text_22, button_1, i_1, i_1_class_value, text_23, text_24_value = __("Yes, delete it!"), text_24;

		var if_block = (state.errors && state.errors.length) && create_if_block_4(component, state);

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
				div = createElement("div");
				div_1 = createElement("div");
				h2 = createElement("h2");
				text = createText(text_value);
				text_1 = createText("\n\n        ");
				if (if_block) { if_block.c(); }
				text_2 = createText("\n\n        ");
				p = createElement("p");
				text_3 = createText(text_3_value);
				text_5 = createText("\n        ");
				ul = createElement("ul");
				li = createElement("li");
				text_6 = createText(text_6_value);
				li_1 = createElement("li");
				text_7 = createText(text_7_value);
				li_2 = createElement("li");
				text_8 = createText(text_8_value);
				text_9 = createText("\n        ");
				p_1 = createElement("p");
				text_10 = createText(text_10_value);
				text_12 = createText("\n        ");
				div_2 = createElement("div");
				p_2 = createElement("p");
				b = createElement("b");
				text_13 = createText(text_13_value);
				text_14 = createText("\n            ");
				div_3 = createElement("div");
				input = createElement("input");
				text_16 = createText("\n            ");
				p_3 = createElement("p");
				text_18 = createText("\n            ");
				div_4 = createElement("div");
				button = createElement("button");
				i = createElement("i");
				text_19 = createText("  ");
				text_20 = createText(text_20_value);
				text_22 = createText("\n                ");
				button_1 = createElement("button");
				i_1 = createElement("i");
				text_23 = createText("  ");
				text_24 = createText(text_24_value);
				this.h();
			},

			h: function hydrate() {
				setStyle(h2, "margin-bottom", "20px");
				h2.className = "svelte-u71xal";
				addListener(input, "input", input_input_handler);
				setAttribute(input, "type", "password");
				input.placeholder = input_placeholder_value = __("Password");
				div_3.className = "control-group";
				i.className = "fa fa-chevron-left";
				addListener(button, "click", click_handler);
				button.className = "btn btn-info";
				i_1.className = i_1_class_value = "fa " + (state.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-u71xal";
				addListener(button_1, "click", click_handler_1);
				setStyle(button_1, "float", "right");
				button_1.className = "btn btn-danger";
				div_4.className = "control-group";
				div_2.className = "";
				div_1.className = "span6 offset3";
				div.className = "row delete-account svelte-u71xal";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(h2, div_1);
				appendNode(text, h2);
				appendNode(text_1, div_1);
				if (if_block) { if_block.m(div_1, null); }
				appendNode(text_2, div_1);
				appendNode(p, div_1);
				appendNode(text_3, p);
				appendNode(text_5, div_1);
				appendNode(ul, div_1);
				appendNode(li, ul);
				appendNode(text_6, li);
				appendNode(li_1, ul);
				appendNode(text_7, li_1);
				appendNode(li_2, ul);
				appendNode(text_8, li_2);
				appendNode(text_9, div_1);
				appendNode(p_1, div_1);
				appendNode(text_10, p_1);
				appendNode(text_12, div_1);
				appendNode(div_2, div_1);
				appendNode(p_2, div_2);
				appendNode(b, p_2);
				appendNode(text_13, b);
				appendNode(text_14, div_2);
				appendNode(div_3, div_2);
				appendNode(input, div_3);

				input.value = state.confirmPassword;

				appendNode(text_16, div_2);
				appendNode(p_3, div_2);
				p_3.innerHTML = raw_value;
				appendNode(text_18, div_2);
				appendNode(div_4, div_2);
				appendNode(button, div_4);
				appendNode(i, button);
				appendNode(text_19, button);
				appendNode(text_20, button);
				appendNode(text_22, div_4);
				appendNode(button_1, div_4);
				appendNode(i_1, button_1);
				appendNode(text_23, button_1);
				appendNode(text_24, button_1);
			},

			p: function update(changed, state) {
				if (state.errors && state.errors.length) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block_4(component, state);
						if_block.c();
						if_block.m(div_1, text_2);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (!input_updating) { input.value = state.confirmPassword; }
				if ((changed.deletingAccount) && i_1_class_value !== (i_1_class_value = "fa " + (state.deletingAccount ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-u71xal")) {
					i_1.className = i_1_class_value;
				}
			},

			u: function unmount() {
				p_3.innerHTML = '';

				detachNode(div);
				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				removeListener(input, "input", input_input_handler);
				removeListener(button, "click", click_handler);
				removeListener(button_1, "click", click_handler_1);
			}
		};
	}

	// (135:25) 
	function create_if_block_5(component, state) {
		var div, div_1, h2, text_value = __("Your account has been deleted."), text, text_2, a, text_3_value = __("Goodbye!"), text_3;

		return {
			c: function create() {
				div = createElement("div");
				div_1 = createElement("div");
				h2 = createElement("h2");
				text = createText(text_value);
				text_2 = createText("\n        ");
				a = createElement("a");
				text_3 = createText(text_3_value);
				this.h();
			},

			h: function hydrate() {
				setStyle(h2, "margin-bottom", "20px");
				setStyle(h2, "text-align", "center");
				h2.className = "svelte-u71xal";
				a.href = "/";
				a.className = "btn btn-primary btn-large";
				div_1.className = "span6 offset3";
				setStyle(div_1, "text-align", "center");
				div.className = "row delete-account svelte-u71xal";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(h2, div_1);
				appendNode(text, h2);
				appendNode(text_2, div_1);
				appendNode(a, div_1);
				appendNode(text_3, a);
			},

			p: noop,

			u: function unmount() {
				detachNode(div);
			},

			d: noop
		};
	}

	// (146:21) 
	function create_if_block_6(component, state) {
		var div, div_1, div_2, h2, text_value = __("account / email"), text, text_1, p, text_2_value = __("account / confirm-email-change"), text_2, text_3, text_4, fieldset, div_3, label, text_5_value = __("E-Mail"), text_5, text_6, text_7, div_4, input, input_updating = false, input_disabled_value, text_10, div_5, button, text_11_value = __( "Back"), text_11, text_13, button_1, i, i_class_value, text_14, text_15_value = __( "account / email"), text_15;

		var if_block = (state.errors && state.errors.length) && create_if_block_7(component, state);

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
				div = createElement("div");
				div_1 = createElement("div");
				div_2 = createElement("div");
				h2 = createElement("h2");
				text = createText(text_value);
				text_1 = createText("\n            ");
				p = createElement("p");
				text_2 = createText(text_2_value);
				text_3 = createText("\n\n            ");
				if (if_block) { if_block.c(); }
				text_4 = createText("\n\n            ");
				fieldset = createElement("fieldset");
				div_3 = createElement("div");
				label = createElement("label");
				text_5 = createText(text_5_value);
				text_6 = createText(":");
				text_7 = createText("\n                    ");
				div_4 = createElement("div");
				input = createElement("input");
				text_10 = createText("\n\n                ");
				div_5 = createElement("div");
				button = createElement("button");
				text_11 = createText(text_11_value);
				text_13 = createText("\n                    ");
				button_1 = createElement("button");
				i = createElement("i");
				text_14 = createText("  ");
				text_15 = createText(text_15_value);
				this.h();
			},

			h: function hydrate() {
				label.className = "control-label";
				label.htmlFor = "email";
				addListener(input, "input", input_input_handler);
				input.disabled = input_disabled_value = !state.changeEmail;
				setAttribute(input, "type", "text");
				div_4.className = "controls";
				div_3.className = "control-group";
				addListener(button, "click", click_handler);
				button.className = "btn btn-default";
				i.className = i_class_value = "fa " + (state.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-u71xal";
				addListener(button_1, "click", click_handler_1);
				setStyle(button_1, "float", "right");
				button_1.className = "btn btn-save btn-primary";
				div_5.className = "";
				div_2.className = "form-horizontal edit-account";
				div_1.className = "span6 offset3";
				div.className = "row";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(div_2, div_1);
				appendNode(h2, div_2);
				appendNode(text, h2);
				appendNode(text_1, div_2);
				appendNode(p, div_2);
				appendNode(text_2, p);
				appendNode(text_3, div_2);
				if (if_block) { if_block.m(div_2, null); }
				appendNode(text_4, div_2);
				appendNode(fieldset, div_2);
				appendNode(div_3, fieldset);
				appendNode(label, div_3);
				appendNode(text_5, label);
				appendNode(text_6, label);
				appendNode(text_7, div_3);
				appendNode(div_4, div_3);
				appendNode(input, div_4);

				input.value = state.email;

				appendNode(text_10, fieldset);
				appendNode(div_5, fieldset);
				appendNode(button, div_5);
				appendNode(text_11, button);
				appendNode(text_13, div_5);
				appendNode(button_1, div_5);
				appendNode(i, button_1);
				appendNode(text_14, button_1);
				appendNode(text_15, button_1);
			},

			p: function update(changed, state) {
				if (state.errors && state.errors.length) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block_7(component, state);
						if_block.c();
						if_block.m(div_2, text_4);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if (!input_updating) { input.value = state.email; }
				if ((changed.changeEmail) && input_disabled_value !== (input_disabled_value = !state.changeEmail)) {
					input.disabled = input_disabled_value;
				}

				if ((changed.savingEmail) && i_class_value !== (i_class_value = "fa " + (state.savingEmail ? 'fa-spin fa-spinner' : 'fa-check') + " svelte-u71xal")) {
					i.className = i_class_value;
				}
			},

			u: function unmount() {
				detachNode(div);
				if (if_block) { if_block.u(); }
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				removeListener(input, "input", input_input_handler);
				removeListener(button, "click", click_handler);
				removeListener(button_1, "click", click_handler_1);
			}
		};
	}

	// (185:0) {:else}
	function create_if_block_8(component, state) {
		var text, div, div_1, div_2, div_3, text_1_value = __("E-Mail"), text_1, text_2, text_3, div_4, input, input_disabled_value, text_5, div_5, button, text_6_value = __( "account / email"), text_6, text_10, div_6, div_7, text_11_value = __("Password"), text_11, text_12, text_13, div_8, input_1, text_15, div_9, button_1, text_16_value = __("account / password"), text_16, text_20, div_10, text_21_value = __("account / or"), text_21, text_22, span, text_23_value = __("account / delete"), text_23, text_24;

		var if_block = (state.messages && state.messages.length) && create_if_block_9(component, state);

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
				text = createText("\n\n");
				div = createElement("div");
				div_1 = createElement("div");
				div_2 = createElement("div");
				div_3 = createElement("div");
				text_1 = createText(text_1_value);
				text_2 = createText(":");
				text_3 = createText("\n            ");
				div_4 = createElement("div");
				input = createElement("input");
				text_5 = createText("\n            ");
				div_5 = createElement("div");
				button = createElement("button");
				text_6 = createText(text_6_value);
				text_10 = createText("\n\n        ");
				div_6 = createElement("div");
				div_7 = createElement("div");
				text_11 = createText(text_11_value);
				text_12 = createText(":");
				text_13 = createText("\n            ");
				div_8 = createElement("div");
				input_1 = createElement("input");
				text_15 = createText("\n            ");
				div_9 = createElement("div");
				button_1 = createElement("button");
				text_16 = createText(text_16_value);
				text_20 = createText("\n\n        ");
				div_10 = createElement("div");
				text_21 = createText(text_21_value);
				text_22 = createText("\n            ");
				span = createElement("span");
				text_23 = createText(text_23_value);
				text_24 = createText(".");
				this.h();
			},

			h: function hydrate() {
				div_3.className = "svelte-u71xal";
				input.disabled = input_disabled_value = !state.changeEmail;
				input.value = state.originalEmail;
				setAttribute(input, "type", "text");
				div_4.className = "svelte-u71xal";
				addListener(button, "click", click_handler);
				button.className = "btn btn-save btn-default";
				div_5.className = "svelte-u71xal";
				div_2.className = "svelte-u71xal";
				div_7.className = "svelte-u71xal";
				input_1.disabled = true;
				input_1.value = "abcdefgh";
				setAttribute(input_1, "type", "password");
				div_8.className = "svelte-u71xal";
				addListener(button_1, "click", click_handler_1);
				button_1.className = "btn btn-save btn-default";
				div_9.className = "svelte-u71xal";
				div_6.className = "svelte-u71xal";
				addListener(span, "click", click_handler_2);
				span.className = "link svelte-u71xal";
				setAttribute(span, "href", "#");
				setStyle(div_10, "text-align", "center");
				setStyle(div_10, "display", "block");
				div_10.className = "svelte-u71xal";
				div_1.className = "span6 offset3";
				div.className = "row edit-account svelte-u71xal";
				setStyle(div, "margin-top", "" + ( state.messages && state.messages.length ? 0 : 20 ) + "px");
			},

			m: function mount(target, anchor) {
				if (if_block) { if_block.m(target, anchor); }
				insertNode(text, target, anchor);
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(div_2, div_1);
				appendNode(div_3, div_2);
				appendNode(text_1, div_3);
				appendNode(text_2, div_3);
				appendNode(text_3, div_2);
				appendNode(div_4, div_2);
				appendNode(input, div_4);
				appendNode(text_5, div_2);
				appendNode(div_5, div_2);
				appendNode(button, div_5);
				appendNode(text_6, button);
				appendNode(text_10, div_1);
				appendNode(div_6, div_1);
				appendNode(div_7, div_6);
				appendNode(text_11, div_7);
				appendNode(text_12, div_7);
				appendNode(text_13, div_6);
				appendNode(div_8, div_6);
				appendNode(input_1, div_8);
				appendNode(text_15, div_6);
				appendNode(div_9, div_6);
				appendNode(button_1, div_9);
				appendNode(text_16, button_1);
				appendNode(text_20, div_1);
				appendNode(div_10, div_1);
				appendNode(text_21, div_10);
				appendNode(text_22, div_10);
				appendNode(span, div_10);
				appendNode(text_23, span);
				appendNode(text_24, div_10);
			},

			p: function update(changed, state) {
				if (state.messages && state.messages.length) {
					if (if_block) {
						if_block.p(changed, state);
					} else {
						if_block = create_if_block_9(component, state);
						if_block.c();
						if_block.m(text.parentNode, text);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}

				if ((changed.changeEmail) && input_disabled_value !== (input_disabled_value = !state.changeEmail)) {
					input.disabled = input_disabled_value;
				}

				if (changed.originalEmail) {
					input.value = state.originalEmail;
				}

				if (changed.messages) {
					setStyle(div, "margin-top", "" + ( state.messages && state.messages.length ? 0 : 20 ) + "px");
				}
			},

			u: function unmount() {
				if (if_block) { if_block.u(); }
				detachNode(text);
				detachNode(div);
			},

			d: function destroy() {
				if (if_block) { if_block.d(); }
				removeListener(button, "click", click_handler);
				removeListener(button_1, "click", click_handler_1);
				removeListener(span, "click", click_handler_2);
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
		init(this, options);
		this._state = assign(data(), options.data);
		if (!('changePassword' in this._state)) { console.warn("<App> was created without expected data property 'changePassword'"); }
		if (!('errors' in this._state)) { console.warn("<App> was created without expected data property 'errors'"); }
		if (!('currentPassword' in this._state)) { console.warn("<App> was created without expected data property 'currentPassword'"); }
		if (!('newPassword1' in this._state)) { console.warn("<App> was created without expected data property 'newPassword1'"); }
		if (!('newPassword2' in this._state)) { console.warn("<App> was created without expected data property 'newPassword2'"); }
		if (!('savingPassword' in this._state)) { console.warn("<App> was created without expected data property 'savingPassword'"); }
		if (!('deleteAccount' in this._state)) { console.warn("<App> was created without expected data property 'deleteAccount'"); }
		if (!('deleteAccount2' in this._state)) { console.warn("<App> was created without expected data property 'deleteAccount2'"); }
		if (!('confirmPassword' in this._state)) { console.warn("<App> was created without expected data property 'confirmPassword'"); }
		if (!('deletingAccount' in this._state)) { console.warn("<App> was created without expected data property 'deletingAccount'"); }
		if (!('deleteAccount3' in this._state)) { console.warn("<App> was created without expected data property 'deleteAccount3'"); }
		if (!('changeEmail' in this._state)) { console.warn("<App> was created without expected data property 'changeEmail'"); }
		if (!('email' in this._state)) { console.warn("<App> was created without expected data property 'email'"); }
		if (!('savingEmail' in this._state)) { console.warn("<App> was created without expected data property 'savingEmail'"); }
		if (!('messages' in this._state)) { console.warn("<App> was created without expected data property 'messages'"); }
		if (!('originalEmail' in this._state)) { console.warn("<App> was created without expected data property 'originalEmail'"); }

		this._handlers.state = [onstate];

		var self = this;
		var _oncreate = function() {
			var changed = { changePassword: 1, errors: 1, currentPassword: 1, newPassword1: 1, newPassword2: 1, savingPassword: 1, deleteAccount: 1, deleteAccount2: 1, confirmPassword: 1, deletingAccount: 1, deleteAccount3: 1, changeEmail: 1, email: 1, savingEmail: 1, messages: 1, originalEmail: 1 };
			onstate.call(self, { changed: changed, current: self._state });
			self.fire("update", { changed: changed, current: self._state });
		};

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment(this, this._state);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
			this._fragment.c();
			this._mount(options.target, options.anchor);

			callAll(this._oncreate);
		}
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	function Store(state, options) {
		this._observers = { pre: blankObject(), post: blankObject() };
		this._handlers = {};
		this._dependents = [];

		this._computed = blankObject();
		this._sortedComputedProperties = [];

		this._state = assign({}, state);
		this._differs = options && options.immutable ? _differsImmutable : _differs;
	}

	assign(Store.prototype, {
		_add: function(component, props) {
			this._dependents.push({
				component: component,
				props: props
			});
		},

		_init: function(props) {
			var this$1 = this;

			var state = {};
			for (var i = 0; i < props.length; i += 1) {
				var prop = props[i];
				state['$' + prop] = this$1._state[prop];
			}
			return state;
		},

		_remove: function(component) {
			var this$1 = this;

			var i = this._dependents.length;
			while (i--) {
				if (this$1._dependents[i].component === component) {
					this$1._dependents.splice(i, 1);
					return;
				}
			}
		},

		_sortComputedProperties: function() {
			var this$1 = this;

			var computed = this._computed;
			var sorted = this._sortedComputedProperties = [];
			var cycles;
			var visited = blankObject();

			function visit(key) {
				if (cycles[key]) {
					throw new Error('Cyclical dependency detected');
				}

				if (visited[key]) { return; }
				visited[key] = true;

				var c = computed[key];

				if (c) {
					cycles[key] = true;
					c.deps.forEach(visit);
					sorted.push(c);
				}
			}

			for (var key in this$1._computed) {
				cycles = blankObject();
				visit(key);
			}
		},

		compute: function(key, deps, fn) {
			var store = this;
			var value;

			var c = {
				deps: deps,
				update: function(state, changed, dirty) {
					var values = deps.map(function(dep) {
						if (dep in changed) { dirty = true; }
						return state[dep];
					});

					if (dirty) {
						var newValue = fn.apply(null, values);
						if (store._differs(newValue, value)) {
							value = newValue;
							changed[key] = true;
							state[key] = value;
						}
					}
				}
			};

			c.update(this._state, {}, true);

			this._computed[key] = c;
			this._sortComputedProperties();
		},

		fire: fire,

		get: get,

		// TODO remove this method
		observe: observe,

		on: on,

		onchange: function(callback) {
			// TODO remove this method
			console.warn("store.onchange is deprecated in favour of store.on('state', event => {...})");

			return this.on('state', function(event) {
				callback(event.current, event.changed);
			});
		},

		set: function(newState) {
			var this$1 = this;

			var oldState = this._state,
				changed = this._changed = {},
				dirty = false;

			for (var key in newState) {
				if (this$1._computed[key]) { throw new Error("'" + key + "' is a read-only property"); }
				if (this$1._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
			}
			if (!dirty) { return; }

			this._state = assign(assign({}, oldState), newState);

			for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this$1._sortedComputedProperties[i].update(this$1._state, changed);
			}

			this.fire('state', {
				changed: changed,
				current: this._state,
				previous: oldState
			});

			var dependents = this._dependents.slice(); // guard against mutations
			for (var i = 0; i < dependents.length; i += 1) {
				var dependent = dependents[i];
				var componentState = {};
				dirty = false;

				for (var j = 0; j < dependent.props.length; j += 1) {
					var prop = dependent.props[j];
					if (prop in changed) {
						componentState['$' + prop] = this$1._state[prop];
						dirty = true;
					}
				}

				if (dirty) { dependent.component.set(componentState); }
			}

			this.fire('update', {
				changed: changed,
				current: this._state,
				previous: oldState
			});
		}
	});

	var store = new Store({});

	var data$1 = {
	    chart: {
	        id: ''
	    },
	    readonly: false,
	    chartData: '',
	    transpose: false,
	    firstRowIsHeader: true,
	    skipRows: 0
	};

	var main = { App: App, data: data$1, store: store };

	return main;

}));
//# sourceMappingURL=account.js.map
