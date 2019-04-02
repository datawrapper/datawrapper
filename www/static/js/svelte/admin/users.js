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

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
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

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var strictUriEncode = function (str) { return encodeURIComponent(str).replace(/[!'()*]/g, function (x) { return ("%" + (x.charCodeAt(0).toString(16).toUpperCase())); }); };

var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp(token, 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
	try {
		// Try to decode the entire string first
		return decodeURIComponent(components.join(''));
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	var left = components.slice(0, split);
	var right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		var tokens = input.match(singleMatcher);

		for (var i = 1; i < tokens.length; i++) {
			input = decodeComponents(tokens, i).join('');

			tokens = input.match(singleMatcher);
		}

		return input;
	}
}

function customDecodeURIComponent(input) {
	// Keep track of all the replacements and prefill the map with the `BOM`
	var replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	var match = multiMatcher.exec(input);
	while (match) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			var result = decode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}

		match = multiMatcher.exec(input);
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

	var entries = Object.keys(replaceMap);

	for (var i = 0; i < entries.length; i++) {
		// Replace all decoded components
		var key = entries[i];
		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
	}

	return input;
}

var decodeUriComponent = function (encodedURI) {
	if (typeof encodedURI !== 'string') {
		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
	}

	try {
		encodedURI = encodedURI.replace(/\+/g, ' ');

		// Try the built in decoder first
		return decodeURIComponent(encodedURI);
	} catch (err) {
		// Fallback to a more advanced decoder
		return customDecodeURIComponent(encodedURI);
	}
};

var queryString = createCommonjsModule(function (module, exports) {



function encoderForArrayFormat(options) {
	switch (options.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, options),
					'[',
					index,
					']'
				].join('') : [
					encode(key, options),
					'[',
					encode(index, options),
					']=',
					encode(value, options)
				].join('');
			};
		case 'bracket':
			return function (key, value) {
				return value === null ? [encode(key, options), '[]'].join('') : [
					encode(key, options),
					'[]=',
					encode(value, options)
				].join('');
			};
		default:
			return function (key, value) {
				return value === null ? encode(key, options) : [
					encode(key, options),
					'=',
					encode(value, options)
				].join('');
			};
	}
}

function parserForArrayFormat(options) {
	var result;

	switch (options.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};
		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, options) {
	if (options.encode) {
		return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function decode(value, options) {
	if (options.decode) {
		return decodeUriComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	}

	if (typeof input === 'object') {
		return keysSorter(Object.keys(input))
			.sort(function (a, b) { return Number(a) - Number(b); })
			.map(function (key) { return input[key]; });
	}

	return input;
}

function extract(input) {
	var queryStart = input.indexOf('?');
	if (queryStart === -1) {
		return '';
	}

	return input.slice(queryStart + 1);
}

function parse(input, options) {
	options = Object.assign({decode: true, arrayFormat: 'none'}, options);

	var formatter = parserForArrayFormat(options);

	// Create an object with no prototype
	var ret = Object.create(null);

	if (typeof input !== 'string') {
		return ret;
	}

	input = input.trim().replace(/^[?#&]/, '');

	if (!input) {
		return ret;
	}

	for (var i = 0, list = input.split('&'); i < list.length; i += 1) {
		var param = list[i];

		var ref = param.replace(/\+/g, ' ').split('=');
		var key = ref[0];
		var value = ref[1];

		// Missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		value = value === undefined ? null : decode(value, options);

		formatter(decode(key, options), value, ret);
	}

	return Object.keys(ret).sort().reduce(function (result, key) {
		var value = ret[key];
		if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
			// Sort object keys, not values
			result[key] = keysSorter(value);
		} else {
			result[key] = value;
		}

		return result;
	}, Object.create(null));
}

exports.extract = extract;
exports.parse = parse;

exports.stringify = function (obj, options) {
	if (!obj) {
		return '';
	}

	options = Object.assign({
		encode: true,
		strict: true,
		arrayFormat: 'none'
	}, options);

	var formatter = encoderForArrayFormat(options);
	var keys = Object.keys(obj);

	if (options.sort !== false) {
		keys.sort(options.sort);
	}

	return keys.map(function (key) {
		var value = obj[key];

		if (value === undefined) {
			return '';
		}

		if (value === null) {
			return encode(key, options);
		}

		if (Array.isArray(value)) {
			var result = [];

			for (var i = 0, list = value.slice(); i < list.length; i += 1) {
				var value2 = list[i];

				if (value2 === undefined) {
					continue;
				}

				result.push(formatter(key, value2, result.length));
			}

			return result.join('&');
		}

		return encode(key, options) + '=' + encode(value, options);
	}).filter(function (x) { return x.length > 0; }).join('&');
};

exports.parseUrl = function (input, options) {
	var hashStart = input.indexOf('#');
	if (hashStart !== -1) {
		input = input.slice(0, hashStart);
	}

	return {
		url: input.split('?')[0] || '',
		query: parse(extract(input), options)
	};
};
});
var queryString_1 = queryString.extract;
var queryString_2 = queryString.parse;
var queryString_3 = queryString.stringify;
var queryString_4 = queryString.parseUrl;

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

// quick reference variables for speed access

// `_isArray` : an object's function

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
function patchJSON(url, body, callback) {
    return fetchJSON(url, 'PATCH', 'include', body, callback);
}

/* admin/users/Details.html generated by Svelte v1.64.0 */

var methods = {
    close: function close() {
        this.fire('close');
    }
};

function create_main_fragment(component, state) {
	var section, h4, text_value = state.user.email, text, text_1, ul, li, b, text_3, text_4_value = state.user.id, text_4, li_1, b_1, text_6, text_7_value = state.user.name || "–", text_7, li_2, b_2, text_9, text_10_value = state.user.email, text_10, li_3, b_3, text_12, a, text_13_value = state.user.chartCount, text_13, a_href_value, li_4, b_4, text_17, text_18_value = state.user.createdAt, text_18, li_5, b_5, text_20, text_21_value = state.user.role, text_21, text_22, hr, text_23, h4_1, text_25, p, text_27, hr_1, text_28, h4_2, text_30, p_1, text_32, hr_2, text_33, h4_3, text_35, p_2, text_37, hr_3, text_38, h4_4, text_40, p_3, text_42, button, text_44, button_1;

	function click_handler(event) {
		component.close();
	}

	return {
		c: function create() {
			section = createElement("section");
			h4 = createElement("h4");
			text = createText(text_value);
			text_1 = createText("\n\n    ");
			ul = createElement("ul");
			li = createElement("li");
			b = createElement("b");
			b.textContent = "ID:";
			text_3 = createText(" ");
			text_4 = createText(text_4_value);
			li_1 = createElement("li");
			b_1 = createElement("b");
			b_1.textContent = "Name:";
			text_6 = createText(" ");
			text_7 = createText(text_7_value);
			li_2 = createElement("li");
			b_2 = createElement("b");
			b_2.textContent = "E-Mail:";
			text_9 = createText(" ");
			text_10 = createText(text_10_value);
			li_3 = createElement("li");
			b_3 = createElement("b");
			b_3.textContent = "Charts:";
			text_12 = createText("\n            ");
			a = createElement("a");
			text_13 = createText(text_13_value);
			li_4 = createElement("li");
			b_4 = createElement("b");
			b_4.textContent = "Created At:";
			text_17 = createText(" ");
			text_18 = createText(text_18_value);
			li_5 = createElement("li");
			b_5 = createElement("b");
			b_5.textContent = "Role:";
			text_20 = createText(" ");
			text_21 = createText(text_21_value);
			text_22 = createText("\n\n    ");
			hr = createElement("hr");
			text_23 = createText("\n\n    ");
			h4_1 = createElement("h4");
			h4_1.textContent = "History";
			text_25 = createText("\n    ");
			p = createElement("p");
			p.textContent = "-";
			text_27 = createText("\n\n    ");
			hr_1 = createElement("hr");
			text_28 = createText("\n\n    ");
			h4_2 = createElement("h4");
			h4_2.textContent = "Private Plugins";
			text_30 = createText("\n    ");
			p_1 = createElement("p");
			p_1.textContent = "-";
			text_32 = createText("\n\n    ");
			hr_2 = createElement("hr");
			text_33 = createText("\n\n    ");
			h4_3 = createElement("h4");
			h4_3.textContent = "Products";
			text_35 = createText("\n    ");
			p_2 = createElement("p");
			p_2.textContent = "-";
			text_37 = createText("\n\n    ");
			hr_3 = createElement("hr");
			text_38 = createText("\n\n    ");
			h4_4 = createElement("h4");
			h4_4.textContent = "Organizations";
			text_40 = createText("\n    ");
			p_3 = createElement("p");
			p_3.textContent = "-";
			text_42 = createText("\n    ");
			button = createElement("button");
			button.textContent = "Back";
			text_44 = createText("\n    ");
			button_1 = createElement("button");
			button_1.textContent = "Save changes";
			this.h();
		},

		h: function hydrate() {
			b.className = "svelte-1fdkti1";
			b_1.className = "svelte-1fdkti1";
			b_2.className = "svelte-1fdkti1";
			b_3.className = "svelte-1fdkti1";
			a.href = a_href_value = "/admin/chart/by/" + state.user.id;
			b_4.className = "svelte-1fdkti1";
			b_5.className = "svelte-1fdkti1";
			ul.className = "unstyled props svelte-1fdkti1";
			addListener(button, "click", click_handler);
			button.type = "button";
			button.className = "btn btn-default";
			button.dataset.test = "close";
			button_1.type = "button";
			button_1.className = "btn btn-primary";
		},

		m: function mount(target, anchor) {
			insertNode(section, target, anchor);
			appendNode(h4, section);
			appendNode(text, h4);
			appendNode(text_1, section);
			appendNode(ul, section);
			appendNode(li, ul);
			appendNode(b, li);
			appendNode(text_3, li);
			appendNode(text_4, li);
			appendNode(li_1, ul);
			appendNode(b_1, li_1);
			appendNode(text_6, li_1);
			appendNode(text_7, li_1);
			appendNode(li_2, ul);
			appendNode(b_2, li_2);
			appendNode(text_9, li_2);
			appendNode(text_10, li_2);
			appendNode(li_3, ul);
			appendNode(b_3, li_3);
			appendNode(text_12, li_3);
			appendNode(a, li_3);
			appendNode(text_13, a);
			appendNode(li_4, ul);
			appendNode(b_4, li_4);
			appendNode(text_17, li_4);
			appendNode(text_18, li_4);
			appendNode(li_5, ul);
			appendNode(b_5, li_5);
			appendNode(text_20, li_5);
			appendNode(text_21, li_5);
			appendNode(text_22, section);
			appendNode(hr, section);
			appendNode(text_23, section);
			appendNode(h4_1, section);
			appendNode(text_25, section);
			appendNode(p, section);
			appendNode(text_27, section);
			appendNode(hr_1, section);
			appendNode(text_28, section);
			appendNode(h4_2, section);
			appendNode(text_30, section);
			appendNode(p_1, section);
			appendNode(text_32, section);
			appendNode(hr_2, section);
			appendNode(text_33, section);
			appendNode(h4_3, section);
			appendNode(text_35, section);
			appendNode(p_2, section);
			appendNode(text_37, section);
			appendNode(hr_3, section);
			appendNode(text_38, section);
			appendNode(h4_4, section);
			appendNode(text_40, section);
			appendNode(p_3, section);
			appendNode(text_42, section);
			appendNode(button, section);
			appendNode(text_44, section);
			appendNode(button_1, section);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_value !== (text_value = state.user.email)) {
				text.data = text_value;
			}

			if ((changed.user) && text_4_value !== (text_4_value = state.user.id)) {
				text_4.data = text_4_value;
			}

			if ((changed.user) && text_7_value !== (text_7_value = state.user.name || "–")) {
				text_7.data = text_7_value;
			}

			if ((changed.user) && text_10_value !== (text_10_value = state.user.email)) {
				text_10.data = text_10_value;
			}

			if ((changed.user) && text_13_value !== (text_13_value = state.user.chartCount)) {
				text_13.data = text_13_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "/admin/chart/by/" + state.user.id)) {
				a.href = a_href_value;
			}

			if ((changed.user) && text_18_value !== (text_18_value = state.user.createdAt)) {
				text_18.data = text_18_value;
			}

			if ((changed.user) && text_21_value !== (text_21_value = state.user.role)) {
				text_21.data = text_21_value;
			}
		},

		u: function unmount() {
			detachNode(section);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

function Details(options) {
	this._debugName = '<Details>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	if (!('user' in this._state)) { console.warn("<Details> was created without expected data property 'user'"); }

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Details.prototype, protoDev);
assign(Details.prototype, methods);

Details.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* admin/users/TableHeader.html generated by Svelte v1.64.0 */

var methods$1 = {
    sort: function sort(event, orderBy) {
        event.preventDefault();
        this.fire('sort', orderBy);
    }
};

function create_main_fragment$1(component, state) {
	var thead, tr;

	var each_value = state.headerItems;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			item: each_value[i],
			item_index: i
		}));
	}

	return {
		c: function create() {
			thead = createElement("thead");
			tr = createElement("tr");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},

		m: function mount(target, anchor) {
			insertNode(thead, target, anchor);
			appendNode(tr, thead);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}
		},

		p: function update(changed, state) {
			var each_value = state.headerItems;

			if (changed.headerItems) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						item: each_value[i],
						item_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
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
			detachNode(thead);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (3:8) {#each headerItems as item}
function create_each_block(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var th;

	function select_block_type(state) {
		if (item.orderBy) { return create_if_block; }
		return create_if_block_1;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			th = createElement("th");
			if_block.c();
		},

		m: function mount(target, anchor) {
			insertNode(th, target, anchor);
			if_block.m(th, null);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(th, null);
			}
		},

		u: function unmount() {
			detachNode(th);
			if_block.u();
		},

		d: function destroy$$1() {
			if_block.d();
		}
	};
}

// (5:12) {#if item.orderBy}
function create_if_block(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var a, text_value = item.name, text, a_href_value;

	return {
		c: function create() {
			a = createElement("a");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler);
			a.href = a_href_value = "?orderBy=" + (item.orderBy);

			a._svelte = {
				component: component,
				each_value: state.each_value,
				item_index: state.item_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(a, target, anchor);
			appendNode(text, a);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if ((changed.headerItems) && text_value !== (text_value = item.name)) {
				text.data = text_value;
			}

			if ((changed.headerItems) && a_href_value !== (a_href_value = "?orderBy=" + (item.orderBy))) {
				a.href = a_href_value;
			}

			a._svelte.each_value = state.each_value;
			a._svelte.item_index = state.item_index;
		},

		u: function unmount() {
			detachNode(a);
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler);
		}
	};
}

// (7:12) {:else}
function create_if_block_1(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var span, text_value = item.name, text;

	return {
		c: function create() {
			span = createElement("span");
			text = createText(text_value);
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(text, span);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if ((changed.headerItems) && text_value !== (text_value = item.name)) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, item_index = this._svelte.item_index, item = each_value[item_index];
	component.sort(event, item.orderBy);
}

function TableHeader(options) {
	this._debugName = '<TableHeader>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	if (!('headerItems' in this._state)) { console.warn("<TableHeader> was created without expected data property 'headerItems'"); }

	this._fragment = create_main_fragment$1(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(TableHeader.prototype, protoDev);
assign(TableHeader.prototype, methods$1);

TableHeader.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* admin/users/TableRow.html generated by Svelte v1.64.0 */

function role(ref) {
	var user = ref.user;
	var roleOptions = ref.roleOptions;

	return roleOptions.find(function (ref) {
		var slug = ref.slug;

		return slug === user.role;
	});
}

function teams(ref) {
	var user = ref.user;

	return user.teams.map(function (ref) {
		var name = ref.name;

		return name;
	}).join(', ') || '–';
}

function data() {
    return {
        user: {},
        updates: {},
        edit: false,
        roleOptions: [
            { slug: 'admin', name: 'Administrator', icon: 'fire' },
            { slug: 'editor', name: 'Editor', icon: 'user' },
            { slug: 'pending', name: 'Pending', icon: 'user' },
            { slug: 'sysadmin', name: 'System Administrator', icon: 'user' },
            { slug: 'graphic-editor', name: 'Editor', icon: 'user' }
        ]
    };
}
var methods$2 = {
    edit: function edit() {
        this.set({
            edit: true,
            updates: Object.assign({}, this.get().user) // clone original user data
        });
    },

    save: function save() {
        var ref = this.get();
        var user = ref.user;
        var updates = ref.updates;
        var changes = Object.keys(user).reduce(function (diff, key) {
            if (updates[key] !== user[key]) {
                diff[key] = updates[key];
            }
            return diff;
        }, {});

        this.set({ edit: false, user: updates });
        this.fire('save', { userId: user.id, changes: changes });
    },

    navigate: function navigate(event, userId) {
        event.preventDefault();
        this.fire('navigate', userId);
    }
};

function create_main_fragment$2(component, state) {
	var tr, td, a, text_value = state.user.id, text, a_href_value, text_3, tr_class_value;

	function click_handler(event) {
		var state = component.get();
		component.navigate(event, state.user.id);
	}

	function select_block_type(state) {
		if (!state.edit) { return create_if_block$1; }
		return create_if_block_1$1;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			tr = createElement("tr");
			td = createElement("td");
			a = createElement("a");
			text = createText(text_value);
			text_3 = createText("\n    ");
			if_block.c();
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler);
			a.href = a_href_value = "?currentUser=" + state.user.id;
			td.className = "id out";
			tr.className = tr_class_value = "user role-" + state.user.role + " svelte-10l9aqc";
		},

		m: function mount(target, anchor) {
			insertNode(tr, target, anchor);
			appendNode(td, tr);
			appendNode(a, td);
			appendNode(text, a);
			appendNode(text_3, tr);
			if_block.m(tr, null);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_value !== (text_value = state.user.id)) {
				text.data = text_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "?currentUser=" + state.user.id)) {
				a.href = a_href_value;
			}

			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(tr, null);
			}

			if ((changed.user) && tr_class_value !== (tr_class_value = "user role-" + state.user.role + " svelte-10l9aqc")) {
				tr.className = tr_class_value;
			}
		},

		u: function unmount() {
			detachNode(tr);
			if_block.u();
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler);
			if_block.d();
		}
	};
}

// (36:12) {#each roleOptions as role}
function create_each_block$1(component, state) {
	var role_1 = state.role, each_value = state.each_value, role_index = state.role_index;
	var option, text_value = __(role_1.name, 'admin-users'), text, option_value_value, option_selected_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = role_1.slug;
			option.value = option.__value;
			option.selected = option_selected_value = state.user.role === role_1.slug;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			role_1 = state.role;
			each_value = state.each_value;
			role_index = state.role_index;
			if ((changed.roleOptions) && text_value !== (text_value = __(role_1.name, 'admin-users'))) {
				text.data = text_value;
			}

			if ((changed.roleOptions) && option_value_value !== (option_value_value = role_1.slug)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
			if ((changed.user || changed.roleOptions) && option_selected_value !== (option_selected_value = state.user.role === role_1.slug)) {
				option.selected = option_selected_value;
			}
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (7:4) {#if !edit}
function create_if_block$1(component, state) {
	var td, text_value = state.user.name || '–', text, text_1, td_1, text_2_value = state.user.email, text_2, text_3, td_2, i, i_class_value, text_4, text_5_value = __(state.role.name, 'admin-users'), text_5, text_7, td_3, text_8, text_9, td_4, text_10_value = state.user.createdAt, text_10, text_11, td_5, a, text_12_value = state.user.chartCount, text_12, a_href_value, text_14, td_6, button, i_1, i_1_title_value, text_16, button_1, i_2, i_2_title_value;

	function click_handler(event) {
		component.edit();
	}

	return {
		c: function create() {
			td = createElement("td");
			text = createText(text_value);
			text_1 = createText("\n    ");
			td_1 = createElement("td");
			text_2 = createText(text_2_value);
			text_3 = createText("\n    ");
			td_2 = createElement("td");
			i = createElement("i");
			text_4 = createText("\n        ");
			text_5 = createText(text_5_value);
			text_7 = createText("\n    ");
			td_3 = createElement("td");
			text_8 = createText(state.teams);
			text_9 = createText("\n    ");
			td_4 = createElement("td");
			text_10 = createText(text_10_value);
			text_11 = createText("\n    ");
			td_5 = createElement("td");
			a = createElement("a");
			text_12 = createText(text_12_value);
			text_14 = createText("\n    ");
			td_6 = createElement("td");
			button = createElement("button");
			i_1 = createElement("i");
			text_16 = createText("\n        ");
			button_1 = createElement("button");
			i_2 = createElement("i");
			this.h();
		},

		h: function hydrate() {
			td.className = "name out";
			td_1.className = "email out";
			i.className = i_class_value = "icon-" + state.role.icon + " svelte-10l9aqc";
			i.title = "Editor";
			td_3.dataset.test = "display-teams";
			td_4.className = "creation out";
			a.href = a_href_value = "/admin/chart/by/" + state.user.id;
			td_5.className = "center";
			i_1.className = "icon-pencil";
			i_1.title = i_1_title_value = __('edit', 'admin-users');
			addListener(button, "click", click_handler);
			button.className = "action svelte-10l9aqc";
			button.dataset.test = "action-edit";
			i_2.className = "icon-envelope";
			i_2.title = i_2_title_value = __('reset the password and send a mail', 'admin-users');
			button_1.className = "action svelte-10l9aqc";
			td_6.className = "actions svelte-10l9aqc";
		},

		m: function mount(target, anchor) {
			insertNode(td, target, anchor);
			appendNode(text, td);
			insertNode(text_1, target, anchor);
			insertNode(td_1, target, anchor);
			appendNode(text_2, td_1);
			insertNode(text_3, target, anchor);
			insertNode(td_2, target, anchor);
			appendNode(i, td_2);
			appendNode(text_4, td_2);
			appendNode(text_5, td_2);
			insertNode(text_7, target, anchor);
			insertNode(td_3, target, anchor);
			appendNode(text_8, td_3);
			insertNode(text_9, target, anchor);
			insertNode(td_4, target, anchor);
			appendNode(text_10, td_4);
			insertNode(text_11, target, anchor);
			insertNode(td_5, target, anchor);
			appendNode(a, td_5);
			appendNode(text_12, a);
			insertNode(text_14, target, anchor);
			insertNode(td_6, target, anchor);
			appendNode(button, td_6);
			appendNode(i_1, button);
			appendNode(text_16, td_6);
			appendNode(button_1, td_6);
			appendNode(i_2, button_1);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_value !== (text_value = state.user.name || '–')) {
				text.data = text_value;
			}

			if ((changed.user) && text_2_value !== (text_2_value = state.user.email)) {
				text_2.data = text_2_value;
			}

			if ((changed.role) && i_class_value !== (i_class_value = "icon-" + state.role.icon + " svelte-10l9aqc")) {
				i.className = i_class_value;
			}

			if ((changed.role) && text_5_value !== (text_5_value = __(state.role.name, 'admin-users'))) {
				text_5.data = text_5_value;
			}

			if (changed.teams) {
				text_8.data = state.teams;
			}

			if ((changed.user) && text_10_value !== (text_10_value = state.user.createdAt)) {
				text_10.data = text_10_value;
			}

			if ((changed.user) && text_12_value !== (text_12_value = state.user.chartCount)) {
				text_12.data = text_12_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "/admin/chart/by/" + state.user.id)) {
				a.href = a_href_value;
			}
		},

		u: function unmount() {
			detachNode(td);
			detachNode(text_1);
			detachNode(td_1);
			detachNode(text_3);
			detachNode(td_2);
			detachNode(text_7);
			detachNode(td_3);
			detachNode(text_9);
			detachNode(td_4);
			detachNode(text_11);
			detachNode(td_5);
			detachNode(text_14);
			detachNode(td_6);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

// (27:4) {:else}
function create_if_block_1$1(component, state) {
	var td, input, input_updating = false, text_1, td_1, input_1, input_1_updating = false, text_3, td_2, select, select_updating = false, text_5, td_3, text_6, text_7, td_4, text_9, td_5, a, text_10_value = state.user.chartCount, text_10, a_href_value, text_12, td_6, button, i, i_title_value, text_14, button_1, i_1, i_1_title_value;

	function input_input_handler() {
		var state = component.get();
		input_updating = true;
		state.updates.name = input.value;
		component.set({ updates: state.updates, roleOptions: state.roleOptions });
		input_updating = false;
	}

	function input_1_input_handler() {
		var state = component.get();
		input_1_updating = true;
		state.updates.email = input_1.value;
		component.set({ updates: state.updates, roleOptions: state.roleOptions });
		input_1_updating = false;
	}

	var each_value = state.roleOptions;

	var each_blocks = [];

	for (var i_2 = 0; i_2 < each_value.length; i_2 += 1) {
		each_blocks[i_2] = create_each_block$1(component, assign(assign({}, state), {
			each_value: each_value,
			role: each_value[i_2],
			role_index: i_2
		}));
	}

	function select_change_handler() {
		var state = component.get();
		select_updating = true;
		state.updates.role = selectValue(select);
		component.set({ updates: state.updates, roleOptions: state.roleOptions });
		select_updating = false;
	}

	function click_handler(event) {
		component.save();
	}

	function click_handler_1(event) {
		component.set({ edit: false });
	}

	return {
		c: function create() {
			td = createElement("td");
			input = createElement("input");
			text_1 = createText("\n    ");
			td_1 = createElement("td");
			input_1 = createElement("input");
			text_3 = createText("\n    ");
			td_2 = createElement("td");
			select = createElement("select");

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].c();
			}

			text_5 = createText("\n    ");
			td_3 = createElement("td");
			text_6 = createText(state.teams);
			text_7 = createText("\n    ");
			td_4 = createElement("td");
			td_4.textContent = "2019-01-31 11:46:25";
			text_9 = createText("\n    ");
			td_5 = createElement("td");
			a = createElement("a");
			text_10 = createText(text_10_value);
			text_12 = createText("\n    ");
			td_6 = createElement("td");
			button = createElement("button");
			i = createElement("i");
			text_14 = createText("\n        ");
			button_1 = createElement("button");
			i_1 = createElement("i");
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			setAttribute(input, "type", "text");
			input.dataset.test = "input-name";
			input.className = "svelte-10l9aqc";
			addListener(input_1, "input", input_1_input_handler);
			setAttribute(input_1, "type", "email");
			input_1.dataset.test = "input-email";
			input_1.className = "svelte-10l9aqc";
			td_1.className = "email";
			addListener(select, "change", select_change_handler);
			if (!('updates' in state)) { component.root._beforecreate.push(select_change_handler); }
			select.name = "role";
			select.className = "svelte-10l9aqc";
			td_3.dataset.test = "display-teams";
			td_4.className = "creation out";
			a.href = a_href_value = "/admin/chart/by/" + state.user.id;
			td_5.className = "center";
			i.className = "icon-ok";
			i.title = i_title_value = __('save', 'admin-users');
			addListener(button, "click", click_handler);
			button.className = "action svelte-10l9aqc";
			button.dataset.test = "action-save";
			i_1.className = "icon-remove";
			i_1.title = i_1_title_value = __('cancel', 'admin-users');
			addListener(button_1, "click", click_handler_1);
			button_1.className = "action svelte-10l9aqc";
			button_1.dataset.test = "action-close";
			td_6.className = "actions svelte-10l9aqc";
		},

		m: function mount(target, anchor) {
			insertNode(td, target, anchor);
			appendNode(input, td);

			input.value = state.updates.name;

			insertNode(text_1, target, anchor);
			insertNode(td_1, target, anchor);
			appendNode(input_1, td_1);

			input_1.value = state.updates.email;

			insertNode(text_3, target, anchor);
			insertNode(td_2, target, anchor);
			appendNode(select, td_2);

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].m(select, null);
			}

			selectOption(select, state.updates.role);

			insertNode(text_5, target, anchor);
			insertNode(td_3, target, anchor);
			appendNode(text_6, td_3);
			insertNode(text_7, target, anchor);
			insertNode(td_4, target, anchor);
			insertNode(text_9, target, anchor);
			insertNode(td_5, target, anchor);
			appendNode(a, td_5);
			appendNode(text_10, a);
			insertNode(text_12, target, anchor);
			insertNode(td_6, target, anchor);
			appendNode(button, td_6);
			appendNode(i, button);
			appendNode(text_14, td_6);
			appendNode(button_1, td_6);
			appendNode(i_1, button_1);
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.updates.name; }
			if (!input_1_updating) { input_1.value = state.updates.email; }

			var each_value = state.roleOptions;

			if (changed.roleOptions || changed.user) {
				for (var i_2 = 0; i_2 < each_value.length; i_2 += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						role: each_value[i_2],
						role_index: i_2
					});

					if (each_blocks[i_2]) {
						each_blocks[i_2].p(changed, each_context);
					} else {
						each_blocks[i_2] = create_each_block$1(component, each_context);
						each_blocks[i_2].c();
						each_blocks[i_2].m(select, null);
					}
				}

				for (; i_2 < each_blocks.length; i_2 += 1) {
					each_blocks[i_2].u();
					each_blocks[i_2].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) { selectOption(select, state.updates.role); }
			if (changed.teams) {
				text_6.data = state.teams;
			}

			if ((changed.user) && text_10_value !== (text_10_value = state.user.chartCount)) {
				text_10.data = text_10_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "/admin/chart/by/" + state.user.id)) {
				a.href = a_href_value;
			}
		},

		u: function unmount() {
			detachNode(td);
			detachNode(text_1);
			detachNode(td_1);
			detachNode(text_3);
			detachNode(td_2);

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].u();
			}

			detachNode(text_5);
			detachNode(td_3);
			detachNode(text_7);
			detachNode(td_4);
			detachNode(text_9);
			detachNode(td_5);
			detachNode(text_12);
			detachNode(td_6);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input_1, "input", input_1_input_handler);

			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
			removeListener(button, "click", click_handler);
			removeListener(button_1, "click", click_handler_1);
		}
	};
}

function TableRow(options) {
	this._debugName = '<TableRow>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data(), options.data);
	this._recompute({ user: 1, roleOptions: 1 }, this._state);
	if (!('user' in this._state)) { console.warn("<TableRow> was created without expected data property 'user'"); }
	if (!('roleOptions' in this._state)) { console.warn("<TableRow> was created without expected data property 'roleOptions'"); }
	if (!('edit' in this._state)) { console.warn("<TableRow> was created without expected data property 'edit'"); }


	if (!('updates' in this._state)) { console.warn("<TableRow> was created without expected data property 'updates'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$2(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
	}
}

assign(TableRow.prototype, protoDev);
assign(TableRow.prototype, methods$2);

TableRow.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('role' in newState && !this._updatingReadonlyProperty) { throw new Error("<TableRow>: Cannot set read-only property 'role'"); }
	if ('teams' in newState && !this._updatingReadonlyProperty) { throw new Error("<TableRow>: Cannot set read-only property 'teams'"); }
};

TableRow.prototype._recompute = function _recompute(changed, state) {
	if (changed.user || changed.roleOptions) {
		if (this._differs(state.role, (state.role = role(state)))) { changed.role = true; }
	}

	if (changed.user) {
		if (this._differs(state.teams, (state.teams = teams(state)))) { changed.teams = true; }
	}
};

/* admin/users/Pagination.html generated by Svelte v1.64.0 */

function items(ref) {
    var pages = ref.pages;
    var url = ref.url;
    var currentPageNum = ref.currentPageNum;

    var firstItem = pages[0].state;
    var lastItem = pages[pages.length - 1].state;
    var getUrl = url || (function (state) { return ("?" + (queryString_3(state))); });

    return [
        {
            text: '«',
            href: getUrl(firstItem),
            active: currentPageNum === 0,
            state: firstItem
        } ].concat( pages.map(function (ref, i) {
        	var state = ref.state;

        	return ({
            text: i + 1,
            href: getUrl(state),
            active: currentPageNum === i,
            state: state
        });
    }),
        [{
            text: '»',
            href: getUrl(lastItem),
            active: currentPageNum === pages.length - 1,
            state: lastItem
        }]
    );
}

var methods$3 = {
    navigate: function navigate(event, state) {
        event.preventDefault();
        this.fire('navigate', state);
    }
};

function create_main_fragment$3(component, state) {
	var div, ul;

	var each_value = state.items;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(component, assign(assign({}, state), {
			each_value: each_value,
			item: each_value[i],
			item_index: i
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
			div.className = "pagination";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(ul, div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}
		},

		p: function update(changed, state) {
			var each_value = state.items;

			if (changed.items) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						item: each_value[i],
						item_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$2(component, each_context);
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

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (3:8) {#each items as item}
function create_each_block$2(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var li, a, text_value = item.text, text, a_href_value, li_class_value;

	return {
		c: function create() {
			li = createElement("li");
			a = createElement("a");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler$1);
			a.href = a_href_value = item.href;

			a._svelte = {
				component: component,
				each_value: state.each_value,
				item_index: state.item_index
			};

			li.className = li_class_value = item.active ? 'active' : '';
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(a, li);
			appendNode(text, a);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if ((changed.items) && text_value !== (text_value = item.text)) {
				text.data = text_value;
			}

			if ((changed.items) && a_href_value !== (a_href_value = item.href)) {
				a.href = a_href_value;
			}

			a._svelte.each_value = state.each_value;
			a._svelte.item_index = state.item_index;

			if ((changed.items) && li_class_value !== (li_class_value = item.active ? 'active' : '')) {
				li.className = li_class_value;
			}
		},

		u: function unmount() {
			detachNode(li);
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler$1);
		}
	};
}

function click_handler$1(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, item_index = this._svelte.item_index, item = each_value[item_index];
	component.navigate(event, item.state);
}

function Pagination(options) {
	this._debugName = '<Pagination>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	this._recompute({ pages: 1, url: 1, currentPageNum: 1 }, this._state);
	if (!('pages' in this._state)) { console.warn("<Pagination> was created without expected data property 'pages'"); }
	if (!('url' in this._state)) { console.warn("<Pagination> was created without expected data property 'url'"); }
	if (!('currentPageNum' in this._state)) { console.warn("<Pagination> was created without expected data property 'currentPageNum'"); }

	this._fragment = create_main_fragment$3(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Pagination.prototype, protoDev);
assign(Pagination.prototype, methods$3);

Pagination.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('items' in newState && !this._updatingReadonlyProperty) { throw new Error("<Pagination>: Cannot set read-only property 'items'"); }
};

Pagination.prototype._recompute = function _recompute(changed, state) {
	if (changed.pages || changed.url || changed.currentPageNum) {
		if (this._differs(state.items, (state.items = items(state)))) { changed.items = true; }
	}
};

/* admin/users/App.html generated by Svelte v1.64.0 */

var BASE_URL = '//api.datawrapper.local:18080/v3/users';

function currentPageNum(ref) {
	var limit = ref.limit;
	var offset = ref.offset;

	return Math.ceil(offset / limit);
}

function paginationItems(ref) {
	var total = ref.total;
	var limit = ref.limit;
	var offset = ref.offset;

	return Array.from({ length: Math.ceil(total / limit) }, function (v, i) { return ({
        state: { limit: limit, offset: i * limit }
    }); });
}

function data$1() {
    return {
        list: [],
        orderBy: 'id',
        loader: null,
        offset: 0,
        limit: 10,
        total: 0,
        currentUser: null,
        userDetails: null,
        columnHeaders: [
            { name: '#', orderBy: 'id' },
            { name: __('Name', 'admin-users'), orderBy: 'name' },
            { name: __('Sign-in', 'admin-users'), orderBy: 'email' },
            { name: __('Status', 'admin-users') },
            { name: __('Teams', 'admin-users') },
            { name: __('Created at', 'admin-users'), orderBy: 'createdAt' },
            { name: __('Charts', 'admin-users') },
            { name: __('Actions', 'admin-users') }
        ]
    };
}
var methods$4 = {
    sort: function sort(orderBy) {
        this.set({ orderBy: orderBy, offset: 0 });
        var state = { orderBy: orderBy };
        window.history.replaceState(state, '', ("?" + (queryString_3(state))));
        this.loadUserList();
    },

    gotoPage: function gotoPage(ref) {
        var offset = ref.offset;
        var limit = ref.limit;

        this.set({ offset: offset, limit: limit });
        var ref$1 = this.get();
        var orderBy = ref$1.orderBy;
        var state = { offset: offset, limit: limit, orderBy: orderBy };
        window.history.replaceState(state, '', ("?" + (queryString_3(state))));
        this.loadUserList();
    },

    showDetails: function showDetails(currentUser) {
        this.set({ currentUser: currentUser });
        window.history.replaceState({ currentUser: currentUser }, '', ("?currentUser=" + currentUser));
        this.loadUser();
    },

    closeDetails: function closeDetails() {
        var state = { currentUser: null, userDetails: null };
        this.set(state);
        window.history.replaceState(state, '', '?');
    },

    loadUserList: function loadUserList() {
        var this$1 = this;

        var ref = this.get();
        var offset = ref.offset;
        var limit = ref.limit;
        var orderBy = ref.orderBy;
        var loader = getJSON((BASE_URL + "?" + (queryString_3({ offset: offset, limit: limit, orderBy: orderBy }))), function (data) {
            if (data && data.list) {
                var total = data.total;
                var list = data.list;
                this$1.set({ list: list, total: total });
            }
        });
        this.set({ loader: loader });
    },

    loadUser: function loadUser() {
        var this$1 = this;

        var ref = this.get();
        var currentUser = ref.currentUser;
        if (currentUser) {
            getJSON((BASE_URL + "/" + currentUser), function (data) {
                if (data) { this$1.set({ userDetails: data }); }
            });
        }
    },

    saveUser: function saveUser(ref) {
        var userId = ref.userId;
        var changes = ref.changes;

        var requestBody = JSON.stringify(changes, function (key, value) {
            if (value === null) {
                return undefined; // do not pass `null` (`null` means value not set)
            } else if (value === '') {
                return null; // pass `null` to set value to empty string
            } else {
                return value;
            }
        });

        patchJSON((BASE_URL + "/" + userId), requestBody);
    }
};

function oncreate() {
    var ref = queryString_2(window.location.search);
    var offset = ref.offset;
    var orderBy = ref.orderBy;
    var currentUser = ref.currentUser;
    this.set({ offset: offset, orderBy: orderBy, currentUser: currentUser });
    this.loadUserList();
    this.loadUser();
}
function create_main_fragment$4(component, state) {
	var div;

	function select_block_type(state) {
		if (state.userDetails) { return create_if_block$2; }
		return create_if_block_1$2;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			div = createElement("div");
			if_block.c();
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if_block.m(div, null);
		},

		p: function update(changed, state) {
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(div, null);
			}
		},

		u: function unmount() {
			detachNode(div);
			if_block.u();
		},

		d: function destroy$$1() {
			if_block.d();
		}
	};
}

// (10:16) {#each list as user}
function create_each_block$3(component, state) {
	var user = state.user, each_value = state.each_value, user_index = state.user_index;

	var tablerow_initial_data = { user: user };
	var tablerow = new TableRow({
		root: component.root,
		data: tablerow_initial_data
	});

	tablerow.on("navigate", function(event) {
		component.showDetails(event);
	});
	tablerow.on("save", function(event) {
		component.saveUser(event);
	});

	return {
		c: function create() {
			tablerow._fragment.c();
		},

		m: function mount(target, anchor) {
			tablerow._mount(target, anchor);
		},

		p: function update(changed, state) {
			user = state.user;
			each_value = state.each_value;
			user_index = state.user_index;
			var tablerow_changes = {};
			if (changed.list) { tablerow_changes.user = user; }
			tablerow._set(tablerow_changes);
		},

		u: function unmount() {
			tablerow._unmount();
		},

		d: function destroy$$1() {
			tablerow.destroy(false);
		}
	};
}

// (15:8) {#if paginationItems.length > 0}
function create_if_block_2(component, state) {
	var div;

	var pagination_initial_data = {
	 	pages: state.paginationItems,
	 	currentPageNum: state.currentPageNum
	 };
	var pagination = new Pagination({
		root: component.root,
		data: pagination_initial_data
	});

	pagination.on("navigate", function(event) {
		component.gotoPage(event);
	});

	return {
		c: function create() {
			div = createElement("div");
			pagination._fragment.c();
			this.h();
		},

		h: function hydrate() {
			div.className = "pull-right";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			pagination._mount(div, null);
		},

		p: function update(changed, state) {
			var pagination_changes = {};
			if (changed.paginationItems) { pagination_changes.pages = state.paginationItems; }
			if (changed.currentPageNum) { pagination_changes.currentPageNum = state.currentPageNum; }
			pagination._set(pagination_changes);
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			pagination.destroy(false);
		}
	};
}

// (2:4) {#if userDetails}
function create_if_block$2(component, state) {
	var details;

	function close_handler(event) {
		component.closeDetails();
	}

	return {
		c: function create() {
			details = createElement("details");
			this.h();
		},

		h: function hydrate() {
			addListener(details, "close", close_handler);
			setAttribute(details, "user", state.userDetails);
		},

		m: function mount(target, anchor) {
			insertNode(details, target, anchor);
		},

		p: function update(changed, state) {
			if (changed.userDetails) {
				setAttribute(details, "user", state.userDetails);
			}
		},

		u: function unmount() {
			detachNode(details);
		},

		d: function destroy$$1() {
			removeListener(details, "close", close_handler);
		}
	};
}

// (4:4) {:else}
function create_if_block_1$2(component, state) {
	var div, table, text, tbody, text_3;

	var tableheader_initial_data = { headerItems: state.columnHeaders };
	var tableheader = new TableHeader({
		root: component.root,
		data: tableheader_initial_data
	});

	tableheader.on("sort", function(event) {
		component.sort(event);
	});

	var each_value = state.list;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(component, assign(assign({}, state), {
			each_value: each_value,
			user: each_value[i],
			user_index: i
		}));
	}

	var if_block = (state.paginationItems.length > 0) && create_if_block_2(component, state);

	return {
		c: function create() {
			div = createElement("div");
			table = createElement("table");
			tableheader._fragment.c();
			text = createText("\n\n            ");
			tbody = createElement("tbody");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_3 = createText("\n        ");
			if (if_block) { if_block.c(); }
			this.h();
		},

		h: function hydrate() {
			tbody.className = "users";
			table.className = "table users";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(table, div);
			tableheader._mount(table, null);
			appendNode(text, table);
			appendNode(tbody, table);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}

			appendNode(text_3, div);
			if (if_block) { if_block.m(div, null); }
		},

		p: function update(changed, state) {
			var tableheader_changes = {};
			if (changed.columnHeaders) { tableheader_changes.headerItems = state.columnHeaders; }
			tableheader._set(tableheader_changes);

			var each_value = state.list;

			if (changed.list) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						user: each_value[i],
						user_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$3(component, each_context);
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

			if (state.paginationItems.length > 0) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block_2(component, state);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			tableheader.destroy(false);

			destroyEach(each_blocks);

			if (if_block) { if_block.d(); }
		}
	};
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$1(), options.data);
	this._recompute({ limit: 1, offset: 1, total: 1 }, this._state);
	if (!('limit' in this._state)) { console.warn("<App> was created without expected data property 'limit'"); }
	if (!('offset' in this._state)) { console.warn("<App> was created without expected data property 'offset'"); }
	if (!('total' in this._state)) { console.warn("<App> was created without expected data property 'total'"); }
	if (!('userDetails' in this._state)) { console.warn("<App> was created without expected data property 'userDetails'"); }
	if (!('columnHeaders' in this._state)) { console.warn("<App> was created without expected data property 'columnHeaders'"); }
	if (!('list' in this._state)) { console.warn("<App> was created without expected data property 'list'"); }

	var self = this;
	var _oncreate = function() {
		var changed = { limit: 1, offset: 1, total: 1, userDetails: 1, columnHeaders: 1, list: 1, paginationItems: 1, currentPageNum: 1 };
		oncreate.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$4(this, this._state);

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

assign(App.prototype, protoDev);
assign(App.prototype, methods$4);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('currentPageNum' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'currentPageNum'"); }
	if ('paginationItems' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'paginationItems'"); }
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.limit || changed.offset) {
		if (this._differs(state.currentPageNum, (state.currentPageNum = currentPageNum(state)))) { changed.currentPageNum = true; }
	}

	if (changed.total || changed.limit || changed.offset) {
		if (this._differs(state.paginationItems, (state.paginationItems = paginationItems(state)))) { changed.paginationItems = true; }
	}
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

var main = {
    data: {},
    store: store,
    App: App
};

return main;

})));
//# sourceMappingURL=users.js.map
