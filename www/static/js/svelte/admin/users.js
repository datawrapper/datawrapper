(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/admin/users', factory) :
	(global['admin/users'] = factory());
}(this, (function () { 'use strict';

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

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
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

// quick reference variables for speed access

// `_isArray` : an object's function

function fetchJSON(url, method, credentials, body, callback) {
    var opts = {
        method: method, body: body,
        mode: 'cors',
        credentials: credentials
    };

    window.fetch(url, opts)
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
    .then(callback)
    .catch(function (err) {
        console.error(err);
    });
}

function getJSON(url, credentials, callback) {
    if (arguments.length === 2) {
        callback = credentials;
        credentials = "include";
    }

    return fetchJSON(url, 'GET', credentials, null, callback);
}

/* admin/users/UserAdminRow.html generated by Svelte v1.64.0 */

function create_main_fragment(component, state) {
	var tr, td, a, text_value = state.user.Id, text, a_href_value, text_1, td_1, text_2_value = state.user.Name || '', text_2, text_3, td_2, text_4_value = state.user.Email, text_4, text_5, td_3, i, text_6, text_7_value = state.user.Role, text_7, text_9, td_4, text_10_value = state.user.CreatedAt, text_10, text_11, td_5, a_1, a_1_href_value, text_14, td_6, button, text_15, a_2, text_16, a_3, tr_data_id_value;

	function click_handler(event) {
		component.set({ edit: true });
	}

	return {
		c: function create() {
			tr = createElement("tr");
			td = createElement("td");
			a = createElement("a");
			text = createText(text_value);
			text_1 = createText("\n\t");
			td_1 = createElement("td");
			text_2 = createText(text_2_value);
			text_3 = createText("\n\t");
			td_2 = createElement("td");
			text_4 = createText(text_4_value);
			text_5 = createText("\n\t");
			td_3 = createElement("td");
			i = createElement("i");
			text_6 = createText("\n\t\t");
			text_7 = createText(text_7_value);
			text_9 = createText("\n\t");
			td_4 = createElement("td");
			text_10 = createText(text_10_value);
			text_11 = createText("\n\t");
			td_5 = createElement("td");
			a_1 = createElement("a");
			a_1.textContent = "X";
			text_14 = createText("\n\t");
			td_6 = createElement("td");
			button = createElement("button");
			button.innerHTML = "<i class=\"icon-pencil\" title=\"edit\"></i>";
			text_15 = createText("\n\t\t");
			a_2 = createElement("a");
			a_2.innerHTML = "<i class=\"icon-envelope\" title=\"reset the password and send a mail\"></i>";
			text_16 = createText("\n\t\t");
			a_3 = createElement("a");
			a_3.innerHTML = "<i class=\"icon-trash\" title=\"delete\"></i>";
			this.h();
		},

		h: function hydrate() {
			a.href = a_href_value = "/admin/users/" + state.user.Id;
			td.className = "id out";
			td_1.className = "name out";
			td_2.className = "email out";
			i.className = "icon-user";
			i.title = "Editor";
			td_4.className = "creation out";
			a_1.href = a_1_href_value = "/admin/chart/by/" + state.user.Id;
			td_5.className = "center";
			addListener(button, "click", click_handler);
			a_2.href = "#";
			a_2.className = "do";
			a_2.dataset.action = "resetAction";
			a_3.href = "#";
			a_3.className = "do";
			a_3.dataset.action = "removeAction";
			td_6.className = "actions";
			tr.className = "user";
			tr.dataset.id = tr_data_id_value = state.user.Id;
		},

		m: function mount(target, anchor) {
			insertNode(tr, target, anchor);
			appendNode(td, tr);
			appendNode(a, td);
			appendNode(text, a);
			appendNode(text_1, tr);
			appendNode(td_1, tr);
			appendNode(text_2, td_1);
			appendNode(text_3, tr);
			appendNode(td_2, tr);
			appendNode(text_4, td_2);
			appendNode(text_5, tr);
			appendNode(td_3, tr);
			appendNode(i, td_3);
			appendNode(text_6, td_3);
			appendNode(text_7, td_3);
			appendNode(text_9, tr);
			appendNode(td_4, tr);
			appendNode(text_10, td_4);
			appendNode(text_11, tr);
			appendNode(td_5, tr);
			appendNode(a_1, td_5);
			appendNode(text_14, tr);
			appendNode(td_6, tr);
			appendNode(button, td_6);
			appendNode(text_15, td_6);
			appendNode(a_2, td_6);
			appendNode(text_16, td_6);
			appendNode(a_3, td_6);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_value !== (text_value = state.user.Id)) {
				text.data = text_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "/admin/users/" + state.user.Id)) {
				a.href = a_href_value;
			}

			if ((changed.user) && text_2_value !== (text_2_value = state.user.Name || '')) {
				text_2.data = text_2_value;
			}

			if ((changed.user) && text_4_value !== (text_4_value = state.user.Email)) {
				text_4.data = text_4_value;
			}

			if ((changed.user) && text_7_value !== (text_7_value = state.user.Role)) {
				text_7.data = text_7_value;
			}

			if ((changed.user) && text_10_value !== (text_10_value = state.user.CreatedAt)) {
				text_10.data = text_10_value;
			}

			if ((changed.user) && a_1_href_value !== (a_1_href_value = "/admin/chart/by/" + state.user.Id)) {
				a_1.href = a_1_href_value;
			}

			if ((changed.user) && tr_data_id_value !== (tr_data_id_value = state.user.Id)) {
				tr.dataset.id = tr_data_id_value;
			}
		},

		u: function unmount() {
			detachNode(tr);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

function UserAdminRow(options) {
	this._debugName = '<UserAdminRow>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	if (!('user' in this._state)) { console.warn("<UserAdminRow> was created without expected data property 'user'"); }

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(UserAdminRow.prototype, protoDev);

UserAdminRow.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* admin/users/UserAdmin.html generated by Svelte v1.64.0 */

function data() {
    return {
        users: []
    };
}
var methods = {};

function oncreate() {
    var this$1 = this;

    // get a list of signin methods
    getJSON('/api/users', function (res) {
        if (res.status === 'ok') {
            this$1.set({ users: res.data });
        }
    });
}
function create_main_fragment$1(component, state) {
	var ul, table, thead, text_15, tbody;

	var each_value = state.users;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			user: each_value[i],
			user_index: i
		}));
	}

	return {
		c: function create() {
			ul = createElement("ul");
			table = createElement("table");
			thead = createElement("thead");
			thead.innerHTML = "<tr><th><a href=\"?sort=id\">#</a></th>\n\t\t\t\t<th><a href=\"?sort=name\">Name</a></th>\n\t\t\t\t<th><a href=\"?sort=email\">Sign-In</a></th>\n\t\t\t\t<th>Status</th>\n\t\t\t\t<th><a href=\"?sort=created_at\">Created at</a></th>\n\t\t\t\t<th class=\"center\">Charts</th>\n\t\t\t\t<th>Actions</th></tr>";
			text_15 = createText("\n\t\t");
			tbody = createElement("tbody");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			tbody.className = "users";
			table.className = "table users";
		},

		m: function mount(target, anchor) {
			insertNode(ul, target, anchor);
			appendNode(table, ul);
			appendNode(thead, table);
			appendNode(text_15, table);
			appendNode(tbody, table);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}
		},

		p: function update(changed, state) {
			var each_value = state.users;

			if (changed.users) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						user: each_value[i],
						user_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
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
			detachNode(ul);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (15:3) {#each users as user}
function create_each_block(component, state) {
	var user = state.user, each_value = state.each_value, user_index = state.user_index;

	var useradminrow_initial_data = { user: user };
	var useradminrow = new UserAdminRow({
		root: component.root,
		data: useradminrow_initial_data
	});

	return {
		c: function create() {
			useradminrow._fragment.c();
		},

		m: function mount(target, anchor) {
			useradminrow._mount(target, anchor);
		},

		p: function update(changed, state) {
			user = state.user;
			each_value = state.each_value;
			user_index = state.user_index;
			var useradminrow_changes = {};
			if (changed.users) { useradminrow_changes.user = user; }
			useradminrow._set(useradminrow_changes);
		},

		u: function unmount() {
			useradminrow._unmount();
		},

		d: function destroy$$1() {
			useradminrow.destroy(false);
		}
	};
}

function UserAdmin(options) {
	this._debugName = '<UserAdmin>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data(), options.data);
	if (!('users' in this._state)) { console.warn("<UserAdmin> was created without expected data property 'users'"); }

	var self = this;
	var _oncreate = function() {
		var changed = { users: 1 };
		oncreate.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$1(this, this._state);

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

assign(UserAdmin.prototype, protoDev);
assign(UserAdmin.prototype, methods);

UserAdmin.prototype._checkReadOnly = function _checkReadOnly(newState) {
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

var main = { App: UserAdmin, store: store, data: {} };

return main;

})));
